/**
 * @fileoverview
 * Word cloud layout and bitmap utilities for vue-ui-word-cloud component.
 *
 * This module provides functions to:
 *
 * - generate pixel masks for words
 * - check and mark word placement on a canvas
 * - dilate masks for padding
 * - position words inside a given area using a spiral placement algorithm
 */


/**
 * Generates a bitmap and mask representing a word, given font size and padding.
 * Computes:
 *  - per-pixel mask: wordMask = Array<[x,y]>
 *  - per-row run-length encoding: runs = Array<[y, xStart, xEnd]>
 *    where xStart and xEnd are inclusive and describe contiguous opaque pixels.
 *
 * This preserves the exact set of opaque pixels as before, but also gives us a
 * compact representation for fast bitwise collision checks.
 *
 * @param {Object} params
 * @param {Object} params.word - The word object, must contain a `name` string.
 * @param {number} params.fontSize - The font size to render the word.
 * @param {number} params.pad - Additional padding around the word (in pixels).
 * @param {HTMLCanvasElement} params.canvas - Canvas to render the word onto.
 * @param {CanvasRenderingContext2D} params.ctx - 2D drawing context for the canvas.
 * @param {Object} params.svg - SVG config, may contain style (e.g., bold).
 * @returns {{
 *   w: number,
 *   h: number,
 *   wordMask: Array<[number, number]>,
 *   runs: Array<[number, number, number]>,
 *   minX: number,
 *   minY: number,
 *   maxX: number,
 *   maxY: number
 * }}
 */
export function getWordBitmap({
    word,
    fontSize,
    pad,
    canvas,
    ctx,
    svg
}) {
    const bold = svg.style && svg.style.bold;
    const font = `${bold ? "bold " : ""}${fontSize}px Arial`;

    ctx.font = font;
    const metrics = ctx.measureText(word.name);
    const textW = Math.ceil(metrics.width) + 2 + (pad ? pad * 2 : 0);
    const textH = Math.ceil(fontSize) + 2 + (pad ? pad * 2 : 0);

    canvas.width = textW;
    canvas.height = textH;

    ctx.font = font;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "black";
    ctx.fillText(word.name, textW / 2, textH / 2);

    const image = ctx.getImageData(0, 0, textW, textH);
    const data = image.data;

    const wordMask = [];
    const runs = [];

    let minX = textW;
    let minY = textH;
    let maxX = 0;
    let maxY = 0;
    let found = false;

    for (let y = 0; y < textH; y += 1) {
        const rowOffset = y * textW * 4;
        let runStart = -1;
        let inRun = false;

        for (let x = 0; x < textW; x += 1) {
            const alphaIndex = rowOffset + x * 4 + 3;
            const opaque = data[alphaIndex] > 1;

            if (opaque) {
                wordMask.push([x, y]);
                found = true;

                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;

                if (!inRun) {
                    inRun = true;
                    runStart = x;
                }
            } else if (inRun) {
                runs.push([y, runStart, x - 1]);
                inRun = false;
                runStart = -1;
            }
        }

        if (inRun) {
            runs.push([y, runStart, textW - 1]);
        }
    }

    if (!found) {
        minX = 0;
        minY = 0;
        maxX = 0;
        maxY = 0;
    }

    return { w: textW, h: textH, wordMask, runs, minX, minY, maxX, maxY };
}

/* ------------------------------------------------------------------------- */
/* Helpers: convert pixel mask -> runs                                       */
/* ------------------------------------------------------------------------- */

/**
 * Builds run-length encoded rows from a wordMask (Array<[x,y]>).
 * Assumes wordMask is sorted by (y,x).
 *
 * Each run is [y, xStart, xEnd] with xEnd inclusive.
 *
 * @param {Array<[number, number]>} wordMask
 * @returns {Array<[number, number, number]>}
 */
function createRunsFromMask(wordMask) {
    const runs = [];
    if (!wordMask.length) return runs;

    let currentY = wordMask[0][1];
    let runStart = wordMask[0][0];
    let prevX = runStart;

    for (let i = 1; i < wordMask.length; i += 1) {
        const x = wordMask[i][0];
        const y = wordMask[i][1];

        if (y !== currentY) {
            runs.push([currentY, runStart, prevX]);
            currentY = y;
            runStart = x;
            prevX = x;
        } else {
            if (x === prevX + 1) {
                prevX = x;
            } else {
                runs.push([currentY, runStart, prevX]);
                runStart = x;
                prevX = x;
            }
        }
    }

    runs.push([currentY, runStart, prevX]);

    return runs;
}

/* ------------------------------------------------------------------------- */
/* Bit-packed mask and run-based collision                                   */
/* ------------------------------------------------------------------------- */

/**
 * Internal: check if a word (encoded as row runs) can be placed at (wx, wy)
 * on a bit-packed occupancy mask without overlap or out-of-bounds.
 *
 * maskBits layout:
 *  - 1 bit per pixel (0 = empty, 1 = occupied)
 *  - row stride: maskRowStride 32-bit integers per row
 *
 * runs: Array<[localY, localXStart, localXEndInclusive]>
 */
function canPlaceAtRuns({
    maskBits,
    maskRowStride,
    maskW,
    maskH,
    wx,
    wy,
    runs
}) {
    for (let i = 0; i < runs.length; i += 1) {
        const localY = runs[i][0];
        const localXStart = runs[i][1];
        const localXEnd = runs[i][2];

        const yAbs = wy + localY;
        if (yAbs < 0 || yAbs >= maskH) return false;

        const xStartAbs = wx + localXStart;
        const xEndAbs = wx + localXEnd;
        if (xStartAbs < 0 || xEndAbs >= maskW) return false;

        const rowBase = yAbs * maskRowStride;

        const firstWordIndex = xStartAbs >>> 5;
        const lastWordIndex = xEndAbs >>> 5;

        const bitStart = xStartAbs & 31;
        const bitEnd = xEndAbs & 31;

        if (firstWordIndex === lastWordIndex) {
            const maskWord = maskBits[rowBase + firstWordIndex];
            const widthBits = (bitEnd - bitStart + 1);
            const maskRun = ((0xFFFFFFFF >>> (32 - widthBits)) << bitStart) >>> 0;
            if (maskWord & maskRun) return false;
        } else {
            {
                const maskWord = maskBits[rowBase + firstWordIndex];
                const maskRun = (0xFFFFFFFF << bitStart) >>> 0;
                if (maskWord & maskRun) return false;
            }

            for (let wi = firstWordIndex + 1; wi < lastWordIndex; wi += 1) {
                if (maskBits[rowBase + wi]) return false;
            }

            {
                const maskWord = maskBits[rowBase + lastWordIndex];
                const maskRun = (0xFFFFFFFF >>> (31 - bitEnd)) >>> 0;
                if (maskWord & maskRun) return false;
            }
        }
    }

    return true;
}

/**
 * Internal: mark a placed word (runs) into the bit-packed mask.
 * Assumes the placement is valid (no out-of-bounds).
 */
function markMaskRuns({
    maskBits,
    maskRowStride,
    maskW,
    maskH,
    wx,
    wy,
    runs
}) {
    for (let i = 0; i < runs.length; i += 1) {
        const localY = runs[i][0];
        const localXStart = runs[i][1];
        const localXEnd = runs[i][2];

        const yAbs = wy + localY;
        if (yAbs < 0 || yAbs >= maskH) continue;

        const xStartAbs = wx + localXStart;
        const xEndAbs = wx + localXEnd;
        if (xEndAbs < 0 || xStartAbs >= maskW) continue;

        const rowBase = yAbs * maskRowStride;

        const firstWordIndex = xStartAbs >>> 5;
        const lastWordIndex = xEndAbs >>> 5;

        const bitStart = xStartAbs & 31;
        const bitEnd = xEndAbs & 31;

        if (firstWordIndex === lastWordIndex) {
            const widthBits = (bitEnd - bitStart + 1);
            const maskRun = ((0xFFFFFFFF >>> (32 - widthBits)) << bitStart) >>> 0;
            maskBits[rowBase + firstWordIndex] |= maskRun;
        } else {
            {
                const maskRun = (0xFFFFFFFF << bitStart) >>> 0;
                maskBits[rowBase + firstWordIndex] |= maskRun;
            }

            for (let wi = firstWordIndex + 1; wi < lastWordIndex; wi += 1) {
                maskBits[rowBase + wi] = 0xFFFFFFFF >>> 0;
            }

            {
                const maskRun = (0xFFFFFFFF >>> (31 - bitEnd)) >>> 0;
                maskBits[rowBase + lastWordIndex] |= maskRun;
            }
        }
    }
}

function encodeMaskToBits(mask, maskW, maskH, maskRowStride) {
    const maskBits = new Uint32Array(maskRowStride * maskH);

    for (let y = 0; y < maskH; y += 1) {
        const rowBase8 = y * maskW;
        const rowBaseBits = y * maskRowStride;

        for (let x = 0; x < maskW; x += 1) {
            if (!mask[rowBase8 + x]) continue;

            const wordIndex = x >>> 5;       // x / 32
            const bitIndex = x & 31;         // x % 32
            maskBits[rowBaseBits + wordIndex] |= (1 << bitIndex) >>> 0;
        }
    }

    return maskBits;
}

export function canPlaceAt({
    mask,
    maskW,
    maskH,
    wx,
    wy,
    wordMask
}) {
    const maskRowStride = (maskW + 31) >>> 5;
    const maskBits = encodeMaskToBits(mask, maskW, maskH, maskRowStride);
    const runs = createRunsFromMask(wordMask);
    return canPlaceAtRuns({
        maskBits,
        maskRowStride,
        maskW,
        maskH,
        wx,
        wy,
        runs
    });
}

export function markMask({
    mask,
    maskW,
    maskH,
    wx,
    wy,
    wordMask
}) {
    const maskRowStride = (maskW + 31) >>> 5;
    const maskBits = new Uint32Array(maskRowStride * maskH);
    const runs = createRunsFromMask(wordMask);
    markMaskRuns({
        maskBits,
        maskRowStride,
        maskW,
        maskH,
        wx,
        wy,
        runs
    });

    for (let y = 0; y < maskH; y += 1) {
        const rowBaseBits = y * maskRowStride;
        const rowBase8 = y * maskW;
        for (let wordIndex = 0; wordIndex < maskRowStride; wordIndex += 1) {
            const bits = maskBits[rowBaseBits + wordIndex];
            if (!bits) continue;
            const baseX = wordIndex << 5;
            for (let b = 0; b < 32; b += 1) {
                if (bits & (1 << b)) {
                    const x = baseX + b;
                    if (x >= 0 && x < maskW) {
                        mask[rowBase8 + x] = 1;
                    }
                }
            }
        }
    }
}

/* ------------------------------------------------------------------------- */
/* Dilation (legacy pixel-mask version, kept for compatibility)              */
/* ------------------------------------------------------------------------- */

export function dilateWordMask({ wordMask, w, h, dilation }) {
    const grid = new Uint8Array(w * h);
    const seeds = [];

    for (let i = 0; i < wordMask.length; i += 1) {
        const x = wordMask[i][0];
        const y = wordMask[i][1];
        const idx = y * w + x;
        if (!grid[idx]) {
            grid[idx] = 1;
            seeds.push(idx);
        }
    }

    for (let si = 0; si < seeds.length; si += 1) {
        const idx = seeds[si];
        const y = (idx / w) | 0;
        const x = idx - y * w;

        for (let dy = -dilation; dy <= dilation; dy += 1) {
            const ny = y + dy;
            if (ny < 0 || ny >= h) continue;
            const rowOffset = ny * w;

            for (let dx = -dilation; dx <= dilation; dx += 1) {
                if (dx === 0 && dy === 0) continue;
                const nx = x + dx;
                if (nx < 0 || nx >= w) continue;
                grid[rowOffset + nx] = 1;
            }
        }
    }

    const out = [];
    for (let idx = 0; idx < grid.length; idx += 1) {
        if (grid[idx]) {
            const y = (idx / w) | 0;
            const x = idx - y * w;
            out.push([x, y]);
        }
    }

    return out;
}

/* ------------------------------------------------------------------------- */
/* Dilation from runs (layout path)                                          */
/* ------------------------------------------------------------------------- */

/**
 * Internal: dilate a bitmap expressed as runs and return new runs.
 * This avoids building a per-pixel coordinate list in the hot path.
 */
function dilateRunsToRuns({
    runs,
    w,
    h,
    dilation
}) {
    const grid = new Uint8Array(w * h);
    const seeds = [];

    for (let i = 0; i < runs.length; i += 1) {
        const row = runs[i];
        const y = row[0];
        const xStart = row[1];
        const xEnd = row[2];

        const rowOffset = y * w;
        for (let x = xStart; x <= xEnd; x += 1) {
            const idx = rowOffset + x;
            if (!grid[idx]) {
                grid[idx] = 1;
                seeds.push(idx);
            }
        }
    }

    for (let si = 0; si < seeds.length; si += 1) {
        const idx = seeds[si];
        const y = (idx / w) | 0;
        const x = idx - y * w;

        for (let dy = -dilation; dy <= dilation; dy += 1) {
            const ny = y + dy;
            if (ny < 0 || ny >= h) continue;
            const rowOffset = ny * w;

            for (let dx = -dilation; dx <= dilation; dx += 1) {
                if (dx === 0 && dy === 0) continue;
                const nx = x + dx;
                if (nx < 0 || nx >= w) continue;
                grid[rowOffset + nx] = 1;
            }
        }
    }

    const outRuns = [];
    for (let y = 0; y < h; y += 1) {
        const rowOffset = y * w;
        let runStart = -1;
        let inRun = false;

        for (let x = 0; x < w; x += 1) {
            const val = grid[rowOffset + x];
            if (val) {
                if (!inRun) {
                    inRun = true;
                    runStart = x;
                }
            } else if (inRun) {
                outRuns.push([y, runStart, x - 1]);
                inRun = false;
                runStart = -1;
            }
        }

        if (inRun) {
            outRuns.push([y, runStart, w - 1]);
        }
    }

    return outRuns;
}

/* ------------------------------------------------------------------------- */
/* Scaling from a base bitmap (runs)                                         */
/* ------------------------------------------------------------------------- */

/**
 * Internal: scale a bitmap (runs) by a scalar factor.
 * This is cheaper than re-rasterizing the text on a canvas for each size.
 */
function scaleBitmap(bitmap, scaleFactor) {
    const srcRuns = bitmap.runs;
    const srcW = bitmap.w;
    const srcH = bitmap.h;

    const dstW = Math.max(1, Math.round(srcW * scaleFactor));
    const dstH = Math.max(1, Math.round(srcH * scaleFactor));

    const rowBuckets = new Array(dstH);

    let minX = dstW;
    let minY = dstH;
    let maxX = 0;
    let maxY = 0;
    let found = false;

    for (let i = 0; i < srcRuns.length; i += 1) {
        const row = srcRuns[i];
        const y = row[0];
        const xStart = row[1];
        const xEnd = row[2];

        const ny = Math.round(y * scaleFactor);
        if (ny < 0 || ny >= dstH) continue;

        const nxStart = Math.round(xStart * scaleFactor);
        const nxEnd = Math.round((xEnd + 1) * scaleFactor) - 1;
        if (nxEnd < nxStart) continue;

        let bucket = rowBuckets[ny];
        if (!bucket) {
            bucket = [];
            rowBuckets[ny] = bucket;
        }
        bucket.push([nxStart, nxEnd]);

        found = true;

        if (nxStart < minX) minX = nxStart;
        if (nxEnd > maxX) maxX = nxEnd;
        if (ny < minY) minY = ny;
        if (ny > maxY) maxY = ny;
    }

    if (!found) {
        return {
            w: dstW,
            h: dstH,
            runs: [],
            minX: 0,
            minY: 0,
            maxX: 0,
            maxY: 0
        };
    }

    const outRuns = [];

    for (let y = 0; y < dstH; y += 1) {
        const bucket = rowBuckets[y];
        if (!bucket || bucket.length === 0) continue;

        bucket.sort((a, b) => a[0] - b[0]);

        let currentStart = bucket[0][0];
        let currentEnd = bucket[0][1];

        for (let i = 1; i < bucket.length; i += 1) {
            const start = bucket[i][0];
            const end = bucket[i][1];

            if (start <= currentEnd + 1) {
                if (end > currentEnd) currentEnd = end;
            } else {
                outRuns.push([y, currentStart, currentEnd]);
                currentStart = start;
                currentEnd = end;
            }
        }

        outRuns.push([y, currentStart, currentEnd]);
    }

    return {
        w: dstW,
        h: dstH,
        runs: outRuns,
        minX,
        minY,
        maxX,
        maxY
    };
}

/* ------------------------------------------------------------------------- */
/* Global caches (bitmap + dilated masks)                                    */
/* ------------------------------------------------------------------------- */

const bitmapCache = new Map();      // key -> { w, h, wordMask, runs, minX, minY, maxX, maxY }
const dilatedMaskCache = new Map(); // key -> { wordMask, runs }

function makeBitmapKey({ word, fontSize, pad, svg }) {
    const boldFlag = svg.style && svg.style.bold ? 1 : 0;
    const padding = pad || 0;
    return `${word.name}::${fontSize}::${padding}::${boldFlag}`;
}

function getCachedWordBitmap({
    word,
    fontSize,
    pad,
    canvas,
    ctx,
    svg
}) {
    const key = makeBitmapKey({ word, fontSize, pad, svg });
    const cached = bitmapCache.get(key);
    if (cached) return { key, bitmap: cached };

    const bitmap = getWordBitmap({ word, fontSize, pad, canvas, ctx, svg });
    bitmapCache.set(key, bitmap);
    return { key, bitmap };
}

function getCachedDilatedMask({
    bitmapKey,
    wordMask,
    w,
    h,
    dilation
}) {
    const key = `${bitmapKey}::d${dilation}`;
    const cached = dilatedMaskCache.get(key);
    if (cached) return cached;

    const dilatedWordMask = dilateWordMask({ wordMask, w, h, dilation });
    const runs = createRunsFromMask(dilatedWordMask);
    const result = { wordMask: dilatedWordMask, runs };
    dilatedMaskCache.set(key, result);
    return result;
}

/* ------------------------------------------------------------------------- */
/* Precomputed spiral angles                                                 */
/* ------------------------------------------------------------------------- */

const spiralStep = 6;
const fallbackSpiralStep = 2;
const degreesToRadians = Math.PI / 180;

const spiralCosValues = [];
const spiralSinValues = [];
for (let theta = 0; theta < 360; theta += spiralStep) {
    const angle = theta * degreesToRadians;
    spiralCosValues.push(Math.cos(angle));
    spiralSinValues.push(Math.sin(angle));
}

const fallbackSpiralCosValues = [];
const fallbackSpiralSinValues = [];
for (let theta = 0; theta < 360; theta += fallbackSpiralStep) {
    const angle = theta * degreesToRadians;
    fallbackSpiralCosValues.push(Math.cos(angle));
    fallbackSpiralSinValues.push(Math.sin(angle));
}

/**
 * Uniformly scales all placed words around the center so that the occupied
 * area fills more of the available region, without creating overlaps.
 */
function scaleLayoutToFillArea(positionedWords, maskW, maskH) {
    if (!positionedWords.length) return;

    let minimumRelativeX = Infinity;
    let maximumRelativeX = -Infinity;
    let minimumRelativeY = Infinity;
    let maximumRelativeY = -Infinity;

    for (let i = 0; i < positionedWords.length; i += 1) {
        const word = positionedWords[i];

        const left = word.x + word.minX;
        const right = word.x + word.maxX;
        const top = word.y + word.minY;
        const bottom = word.y + word.maxY;

        if (left < minimumRelativeX) minimumRelativeX = left;
        if (right > maximumRelativeX) maximumRelativeX = right;
        if (top < minimumRelativeY) minimumRelativeY = top;
        if (bottom > maximumRelativeY) maximumRelativeY = bottom;
    }

    if (!isFinite(minimumRelativeX) || !isFinite(maximumRelativeX)) return;
    if (!isFinite(minimumRelativeY) || !isFinite(maximumRelativeY)) return;

    const maximumAbsoluteX = Math.max(
        Math.abs(minimumRelativeX),
        Math.abs(maximumRelativeX)
    );
    const maximumAbsoluteY = Math.max(
        Math.abs(minimumRelativeY),
        Math.abs(maximumRelativeY)
    );

    if (maximumAbsoluteX === 0 || maximumAbsoluteY === 0) return;

    const marginFactor = 0.9;
    const allowedScaleX = (maskW * 0.5 * marginFactor) / maximumAbsoluteX;
    const allowedScaleY = (maskH * 0.5 * marginFactor) / maximumAbsoluteY;

    let scaleFactor = Math.min(allowedScaleX, allowedScaleY);

    if (scaleFactor <= 1) return;

    const maximumScaleFactor = 4; // allow more growth on tiny layouts
    if (scaleFactor > maximumScaleFactor) {
        scaleFactor = maximumScaleFactor;
    }

    for (let i = 0; i < positionedWords.length; i += 1) {
        const word = positionedWords[i];
        word.x *= scaleFactor;
        word.y *= scaleFactor;
        word.width *= scaleFactor;
        word.height *= scaleFactor;
        word.fontSize *= scaleFactor;
        word.minX *= scaleFactor;
        word.maxX *= scaleFactor;
        word.minY *= scaleFactor;
        word.maxY *= scaleFactor;
    }
}

/**
 * Attempts to position an array of words inside a given SVG region without overlap.
 * Words are sorted by value and placed largest-first.
 * Same semantics as the synchronous version, but yields between chunks of work.
 */
export async function positionWordsAsync({
    words,
    proximity = 0,
    svg,
    strictPixelPadding,
    onProgress,
    debugTiming = false
}) {
    const hasPerf = typeof performance !== "undefined" && typeof performance.now === "function";
    const now = () => (hasPerf ? performance.now() : Date.now());
    const startTime = now();

    const yieldBudgetMs = 12;
    let lastYieldTime = startTime;

    async function maybeYield() {
        const t = now();
        if (t - lastYieldTime >= yieldBudgetMs) {
            await new Promise(resolve => setTimeout(resolve, 0));
            lastYieldTime = now();
        }
    }

    const width = svg.width;
    const height = svg.height;
    const maskW = Math.round(width);
    const maskH = Math.round(height);
    const minFontSize = 1;
    const configMinFontSize = svg.minFontSize;
    const maxFontSize = Math.min(svg.maxFontSize, 100);

    const values = words.map(w => w.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);

    if (maskW <= 0 || maskH <= 0) return [];

    const maskRowStride = (maskW + 31) >>> 5;
    const maskBits = new Uint32Array(maskRowStride * maskH);

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    canvas.width = maskW;
    canvas.height = maskH;

    const spiralRadiusStep = 2;
    const fallbackSpiralRadiusStep = 1;
    const maxRadius = Math.max(maskW, maskH);
    const cx = Math.floor(maskW / 2);
    const cy = Math.floor(maskH / 2);

    const wordsWithId = words.map((w, index) => ({
        ...w,
        __wcIndex: index,
        id: w.id != null ? w.id : `${w.name}__${index}`
    }));

    const sorted = [...wordsWithId].sort((a, b) => b.value - a.value);
    const positionedWords = [];

    const scaleStep = 0.9;

    for (let si = 0; si < sorted.length; si += 1) {
        const wordRaw = sorted[si];
        const beforeLen = positionedWords.length;

        let targetFontSize;

        if (maxValue === minValue) {
            targetFontSize = maxFontSize;
        } else {
            targetFontSize =
                (wordRaw.value - minValue) /
                (maxValue - minValue) *
                (maxFontSize - configMinFontSize) +
                configMinFontSize;
        }

        targetFontSize = Math.max(
            configMinFontSize,
            Math.min(maxFontSize, targetFontSize)
        );

        const baseFontSize = targetFontSize;

        const cacheEntry = getCachedWordBitmap({
            word: wordRaw,
            fontSize: baseFontSize,
            pad: proximity,
            canvas,
            ctx,
            svg
        });
        const bitmapKey = cacheEntry.key;
        const baseBitmap = cacheEntry.bitmap;

        const baseW = baseBitmap.w;
        const baseH = baseBitmap.h;

        if (baseW <= 0 || baseH <= 0) {
            await maybeYield();
            continue;
        }

        const scaleMin = Math.max(minFontSize / baseFontSize, 0.1);
        let placed = false;

        async function tryPlace(radiusStep, maxAttempts, useFallbackAngles) {
            let scaleFactor = 1;

            while (!placed && scaleFactor >= scaleMin) {
                let currentBitmap;
                if (scaleFactor === 1) {
                    currentBitmap = baseBitmap;
                } else {
                    currentBitmap = scaleBitmap(baseBitmap, scaleFactor);
                }

                let runs = currentBitmap.runs;
                let w = currentBitmap.w;
                let h = currentBitmap.h;
                const minX = currentBitmap.minX;
                const minY = currentBitmap.minY;
                const maxX = currentBitmap.maxX;
                const maxY = currentBitmap.maxY;

                if (strictPixelPadding && runs.length) {
                    if (scaleFactor === 1) {
                        const dilated = getCachedDilatedMask({
                            bitmapKey,
                            wordMask: baseBitmap.wordMask,
                            w: baseBitmap.w,
                            h: baseBitmap.h,
                            dilation: 2
                        });
                        runs = dilated.runs;
                    } else {
                        runs = dilateRunsToRuns({
                            runs,
                            w,
                            h,
                            dilation: 2
                        });
                    }
                }

                let r = 0;
                let attempts = 0;

                const cosArray = useFallbackAngles ? fallbackSpiralCosValues : spiralCosValues;
                const sinArray = useFallbackAngles ? fallbackSpiralSinValues : spiralSinValues;

                while (r < maxRadius && !placed && attempts < maxAttempts) {
                    for (let i = 0; i < cosArray.length; i += 1) {
                        attempts += 1;
                        const px = Math.round(cx + r * cosArray[i] - w / 2);
                        const py = Math.round(cy + r * sinArray[i] - h / 2);

                        if (
                            px < 0 ||
                            py < 0 ||
                            px + w > maskW ||
                            py + h > maskH
                        ) continue;

                        if (
                            canPlaceAtRuns({
                                maskBits,
                                maskRowStride,
                                maskW,
                                maskH,
                                wx: px,
                                wy: py,
                                runs
                            })
                        ) {
                            const { __wcIndex: _ignore, ...wordClean } = wordRaw;
                            const effectiveFontSize = Math.max(
                                minFontSize,
                                Math.round(baseFontSize * scaleFactor)
                            );

                            positionedWords.push({
                                ...wordClean,
                                x: px - maskW / 2,
                                y: py - maskH / 2,
                                fontSize: effectiveFontSize,
                                width: w,
                                height: h,
                                angle: 0,
                                minX,
                                minY,
                                maxX,
                                maxY
                            });
                            markMaskRuns({
                                maskBits,
                                maskRowStride,
                                maskW,
                                maskH,
                                wx: px,
                                wy: py,
                                runs
                            });
                            placed = true;
                            break;
                        }
                    }
                    r += radiusStep;

                    if ((attempts & 1023) === 0) {
                        await maybeYield();
                    }
                }

                if (!placed) {
                    scaleFactor *= scaleStep;
                }

                await maybeYield();
            }
        }

        await tryPlace(spiralRadiusStep, 10000, false);

        if (!placed) {
            await tryPlace(fallbackSpiralRadiusStep, 25000, true);
        }

        if (onProgress && positionedWords.length > beforeLen) {
            const last = positionedWords[positionedWords.length - 1];
            onProgress({ word: last, all: positionedWords });
        }

        await maybeYield();
    }

    if (!positionedWords.length) {
        return [];
    }

    scaleLayoutToFillArea(positionedWords, maskW, maskH);

    const endTime = now();
    const durationMs = endTime - startTime;

    if (debugTiming && typeof console !== "undefined" && console.log) {
        console.log(
            "[vue-data-ui][word-cloud] positionWordsAsync:",
            `${durationMs.toFixed(2)} ms for ${words.length} words`
        );
    }

    return positionedWords.sort((a, b) => b.fontSize - a.fontSize);
}

const wordcloud = {
    positionWordsAsync,
    getWordBitmap,
    canPlaceAt,
    markMask,
    dilateWordMask
};

export default wordcloud;
