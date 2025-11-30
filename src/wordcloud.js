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

/* ------------------------------------------------------------------------- */
/* Bitmap generation                                                         */
/* ------------------------------------------------------------------------- */

/**
 * Generates a bitmap and mask representing a word, given font size and padding.
 * Computes:
 *  - per-pixel mask: wordMask = Array<[x,y]>
 *  - per-row run-length encoding: runs = Array<[y, xStart, xEnd]>
 *    where xStart and xEnd are inclusive and describe contiguous opaque pixels.
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
    ctx: context,
    svg
}) {
    const isBold = svg.style && svg.style.bold;
    const font = `${isBold ? "bold " : ""}${fontSize}px Arial`;

    context.font = font;
    const metrics = context.measureText(word.name);
    const textWidth = Math.ceil(metrics.width) + 2 + (pad ? pad * 2 : 0);
    const textHeight = Math.ceil(fontSize) + 2 + (pad ? pad * 2 : 0);

    canvas.width = textWidth;
    canvas.height = textHeight;

    context.font = font;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = "black";
    context.fillText(word.name, textWidth / 2, textHeight / 2);

    const image = context.getImageData(0, 0, textWidth, textHeight);
    const data = image.data;

    const wordMask = [];
    const runs = [];

    let minimumX = textWidth;
    let minimumY = textHeight;
    let maximumX = 0;
    let maximumY = 0;
    let hasOpaquePixel = false;

    for (let y = 0; y < textHeight; y += 1) {
        const rowOffset = y * textWidth * 4;
        let runStart = -1;
        let isInRun = false;

        for (let x = 0; x < textWidth; x += 1) {
            const alphaIndex = rowOffset + x * 4 + 3;
            const isOpaque = data[alphaIndex] > 1;

            if (isOpaque) {
                wordMask.push([x, y]);
                hasOpaquePixel = true;

                if (x < minimumX) minimumX = x;
                if (x > maximumX) maximumX = x;
                if (y < minimumY) minimumY = y;
                if (y > maximumY) maximumY = y;

                if (!isInRun) {
                    isInRun = true;
                    runStart = x;
                }
            } else if (isInRun) {
                runs.push([y, runStart, x - 1]);
                isInRun = false;
                runStart = -1;
            }
        }

        if (isInRun) {
            runs.push([y, runStart, textWidth - 1]);
        }
    }

    if (!hasOpaquePixel) {
        minimumX = 0;
        minimumY = 0;
        maximumX = 0;
        maximumY = 0;
    }

    return {
        w: textWidth,
        h: textHeight,
        wordMask,
        runs,
        minX: minimumX,
        minY: minimumY,
        maxX: maximumX,
        maxY: maximumY
    };
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

    let currentRowY = wordMask[0][1];
    let currentRunStart = wordMask[0][0];
    let previousX = currentRunStart;

    for (let index = 1; index < wordMask.length; index += 1) {
        const x = wordMask[index][0];
        const y = wordMask[index][1];

        if (y !== currentRowY) {
            runs.push([currentRowY, currentRunStart, previousX]);
            currentRowY = y;
            currentRunStart = x;
            previousX = x;
        } else if (x === previousX + 1) {
            previousX = x;
        } else {
            runs.push([currentRowY, currentRunStart, previousX]);
            currentRunStart = x;
            previousX = x;
        }
    }

    runs.push([currentRowY, currentRunStart, previousX]);

    return runs;
}

/* ------------------------------------------------------------------------- */
/* Bit-packed mask helpers                                                   */
/* ------------------------------------------------------------------------- */

/**
 * Builds a 32-bit mask for a contiguous run of bits between bitStart and bitEnd (inclusive).
 * Example: bitStart = 2, bitEnd = 4 -> 0b00011100
 *
 * @param {number} bitStart - Index of the first bit in the run (0–31).
 * @param {number} bitEnd - Index of the last bit in the run (0–31), inclusive.
 * @returns {number} A 32-bit unsigned integer with bits [bitStart, bitEnd] set to 1.
 */
export function buildSingleWordMask(bitStart, bitEnd) {
    const widthBits = bitEnd - bitStart + 1;
    // 0xFFFFFFFF >>> (32 - widthBits) => low `widthBits` bits set to 1
    // then shift left by bitStart to position the run.
    return ((0xFFFFFFFF >>> (32 - widthBits)) << bitStart) >>> 0;
}

/**
 * Builds a 32-bit mask for all bits from bitStart to the most-significant bit (31) set to 1.
 * Example: bitStart = 3 -> 0b11111000 (for a truncated 8-bit view).
 *
 * @param {number} bitStart - Index of the first bit to set (0–31).
 * @returns {number} A 32-bit unsigned integer with bits [bitStart, 31] set to 1.
 */
export function buildFirstWordMask(bitStart) {
    // Shift an all-ones word left; bits below bitStart become 0, above remain 1.
    return (0xFFFFFFFF << bitStart) >>> 0;
}

/**
 * Builds a 32-bit mask for all bits from the least-significant bit (0) up to bitEnd set to 1.
 * Example: bitEnd = 4 -> 0b00011111 (for a truncated 8-bit view).
 *
 * @param {number} bitEnd - Index of the last bit to set (0–31), inclusive.
 * @returns {number} A 32-bit unsigned integer with bits [0, bitEnd] set to 1.
 */
export function buildLastWordMask(bitEnd) {
    // Shift an all-ones word right; bits above bitEnd become 0, below remain 1.
    return (0xFFFFFFFF >>> (31 - bitEnd)) >>> 0;
}
/* ------------------------------------------------------------------------- */
/* Bit-packed mask and run-based collision                                   */
/* ------------------------------------------------------------------------- */

/**
 * Internal: check if a word (encoded as row runs) can be placed at (wordX, wordY)
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
    maskW: maskWidth,
    maskH: maskHeight,
    wx: wordX,
    wy: wordY,
    runs
}) {
    for (let index = 0; index < runs.length; index += 1) {
        const localY = runs[index][0];
        const localXStart = runs[index][1];
        const localXEnd = runs[index][2];

        const absoluteY = wordY + localY;
        if (absoluteY < 0 || absoluteY >= maskHeight) return false;

        const absoluteXStart = wordX + localXStart;
        const absoluteXEnd = wordX + localXEnd;
        if (absoluteXStart < 0 || absoluteXEnd >= maskWidth) return false;

        const rowBaseIndex = absoluteY * maskRowStride;

        const firstWordIndex = absoluteXStart >>> 5;
        const lastWordIndex = absoluteXEnd >>> 5;

        const bitStart = absoluteXStart & 31;
        const bitEnd = absoluteXEnd & 31;

        if (firstWordIndex === lastWordIndex) {
            const maskWord = maskBits[rowBaseIndex + firstWordIndex];
            const maskRun = buildSingleWordMask(bitStart, bitEnd);
            if (maskWord & maskRun) return false;
        } else {
            {
                const maskWord = maskBits[rowBaseIndex + firstWordIndex];
                const maskRun = buildFirstWordMask(bitStart);
                if (maskWord & maskRun) return false;
            }

            for (
                let wordIndex = firstWordIndex + 1;
                wordIndex < lastWordIndex;
                wordIndex += 1
            ) {
                if (maskBits[rowBaseIndex + wordIndex]) return false;
            }

            {
                const maskWord = maskBits[rowBaseIndex + lastWordIndex];
                const maskRun = buildLastWordMask(bitEnd);
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
    maskW: maskWidth,
    maskH: maskHeight,
    wx: wordX,
    wy: wordY,
    runs
}) {
    for (let index = 0; index < runs.length; index += 1) {
        const localY = runs[index][0];
        const localXStart = runs[index][1];
        const localXEnd = runs[index][2];

        const absoluteY = wordY + localY;
        if (absoluteY < 0 || absoluteY >= maskHeight) continue;

        const absoluteXStart = wordX + localXStart;
        const absoluteXEnd = wordX + localXEnd;
        if (absoluteXEnd < 0 || absoluteXStart >= maskWidth) continue;

        const rowBaseIndex = absoluteY * maskRowStride;

        const firstWordIndex = absoluteXStart >>> 5;
        const lastWordIndex = absoluteXEnd >>> 5;

        const bitStart = absoluteXStart & 31;
        const bitEnd = absoluteXEnd & 31;

        if (firstWordIndex === lastWordIndex) {
            const maskRun = buildSingleWordMask(bitStart, bitEnd);
            maskBits[rowBaseIndex + firstWordIndex] |= maskRun;
        } else {
            {
                const maskRun = buildFirstWordMask(bitStart);
                maskBits[rowBaseIndex + firstWordIndex] |= maskRun;
            }

            for (
                let wordIndex = firstWordIndex + 1;
                wordIndex < lastWordIndex;
                wordIndex += 1
            ) {
                maskBits[rowBaseIndex + wordIndex] = 0xFFFFFFFF >>> 0;
            }

            {
                const maskRun = buildLastWordMask(bitEnd);
                maskBits[rowBaseIndex + lastWordIndex] |= maskRun;
            }
        }
    }
}

/**
 * Encodes a byte mask (0/1 per pixel) into a bit-packed mask representation.
 */
function encodeMaskToBits(mask, maskWidth, maskHeight, maskRowStride) {
    const maskBits = new Uint32Array(maskRowStride * maskHeight);

    for (let y = 0; y < maskHeight; y += 1) {
        const rowBaseByteIndex = y * maskWidth;
        const rowBaseBitIndex = y * maskRowStride;

        for (let x = 0; x < maskWidth; x += 1) {
            if (!mask[rowBaseByteIndex + x]) continue;

            const wordIndex = x >>> 5;
            const bitIndex = x & 31;
            maskBits[rowBaseBitIndex + wordIndex] |= (1 << bitIndex) >>> 0;
        }
    }

    return maskBits;
}

/**
 * Public helper: test placement given a byte mask and a word pixel mask.
 */
export function canPlaceAt({
    mask,
    maskW: maskWidth,
    maskH: maskHeight,
    wx: wordX,
    wy: wordY,
    wordMask
}) {
    const maskRowStride = (maskWidth + 31) >>> 5;
    const maskBits = encodeMaskToBits(mask, maskWidth, maskHeight, maskRowStride);
    const runs = createRunsFromMask(wordMask);

    return canPlaceAtRuns({
        maskBits,
        maskRowStride,
        maskW: maskWidth,
        maskH: maskHeight,
        wx: wordX,
        wy: wordY,
        runs
    });
}

/**
 * Public helper: mark placement into a byte mask given a word pixel mask.
 */
export function markMask({
    mask,
    maskW: maskWidth,
    maskH: maskHeight,
    wx: wordX,
    wy: wordY,
    wordMask
}) {
    const maskRowStride = (maskWidth + 31) >>> 5;
    const maskBits = new Uint32Array(maskRowStride * maskHeight);
    const runs = createRunsFromMask(wordMask);

    markMaskRuns({
        maskBits,
        maskRowStride,
        maskW: maskWidth,
        maskH: maskHeight,
        wx: wordX,
        wy: wordY,
        runs
    });

    for (let y = 0; y < maskHeight; y += 1) {
        const rowBaseBitIndex = y * maskRowStride;
        const rowBaseByteIndex = y * maskWidth;

        for (
            let wordIndex = 0;
            wordIndex < maskRowStride;
            wordIndex += 1
        ) {
            const bits = maskBits[rowBaseBitIndex + wordIndex];
            if (!bits) continue;

            const baseX = wordIndex << 5;

            for (let bit = 0; bit < 32; bit += 1) {
                if (bits & (1 << bit)) {
                    const x = baseX + bit;
                    if (x >= 0 && x < maskWidth) {
                        mask[rowBaseByteIndex + x] = 1;
                    }
                }
            }
        }
    }
}

/* ------------------------------------------------------------------------- */
/* Dilation (legacy pixel-mask version, kept for compatibility)              */
/* ------------------------------------------------------------------------- */

export function dilateWordMask({ wordMask, w: width, h: height, dilation }) {
    const grid = new Uint8Array(width * height);
    const seeds = [];

    for (let index = 0; index < wordMask.length; index += 1) {
        const x = wordMask[index][0];
        const y = wordMask[index][1];
        const flatIndex = y * width + x;

        if (!grid[flatIndex]) {
            grid[flatIndex] = 1;
            seeds.push(flatIndex);
        }
    }

    for (let seedIndex = 0; seedIndex < seeds.length; seedIndex += 1) {
        const flatIndex = seeds[seedIndex];
        const y = (flatIndex / width) | 0;
        const x = flatIndex - y * width;

        for (let deltaY = -dilation; deltaY <= dilation; deltaY += 1) {
            const neighborY = y + deltaY;
            if (neighborY < 0 || neighborY >= height) continue;

            const neighborRowOffset = neighborY * width;

            for (let deltaX = -dilation; deltaX <= dilation; deltaX += 1) {
                if (deltaX === 0 && deltaY === 0) continue;

                const neighborX = x + deltaX;
                if (neighborX < 0 || neighborX >= width) continue;

                grid[neighborRowOffset + neighborX] = 1;
            }
        }
    }

    const dilatedMask = [];

    for (let flatIndex = 0; flatIndex < grid.length; flatIndex += 1) {
        if (grid[flatIndex]) {
            const y = (flatIndex / width) | 0;
            const x = flatIndex - y * width;
            dilatedMask.push([x, y]);
        }
    }

    return dilatedMask;
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
    w: width,
    h: height,
    dilation
}) {
    const grid = new Uint8Array(width * height);
    const seeds = [];

    for (let index = 0; index < runs.length; index += 1) {
        const row = runs[index];
        const y = row[0];
        const xStart = row[1];
        const xEnd = row[2];

        const rowOffset = y * width;

        for (let x = xStart; x <= xEnd; x += 1) {
            const flatIndex = rowOffset + x;

            if (!grid[flatIndex]) {
                grid[flatIndex] = 1;
                seeds.push(flatIndex);
            }
        }
    }

    for (let seedIndex = 0; seedIndex < seeds.length; seedIndex += 1) {
        const flatIndex = seeds[seedIndex];
        const y = (flatIndex / width) | 0;
        const x = flatIndex - y * width;

        for (let deltaY = -dilation; deltaY <= dilation; deltaY += 1) {
            const neighborY = y + deltaY;
            if (neighborY < 0 || neighborY >= height) continue;

            const neighborRowOffset = neighborY * width;

            for (let deltaX = -dilation; deltaX <= dilation; deltaX += 1) {
                if (deltaX === 0 && deltaY === 0) continue;

                const neighborX = x + deltaX;
                if (neighborX < 0 || neighborX >= width) continue;

                grid[neighborRowOffset + neighborX] = 1;
            }
        }
    }

    const outputRuns = [];

    for (let y = 0; y < height; y += 1) {
        const rowOffset = y * width;
        let runStart = -1;
        let isInRun = false;

        for (let x = 0; x < width; x += 1) {
            const value = grid[rowOffset + x];

            if (value) {
                if (!isInRun) {
                    isInRun = true;
                    runStart = x;
                }
            } else if (isInRun) {
                outputRuns.push([y, runStart, x - 1]);
                isInRun = false;
                runStart = -1;
            }
        }

        if (isInRun) {
            outputRuns.push([y, runStart, width - 1]);
        }
    }

    return outputRuns;
}

/* ------------------------------------------------------------------------- */
/* Scaling from a base bitmap (runs)                                         */
/* ------------------------------------------------------------------------- */

/**
 * Internal: scale a bitmap (runs) by a scalar factor.
 * This is cheaper than re-rasterizing the text on a canvas for each size.
 */
function scaleBitmap(bitmap, scaleFactor) {
    const sourceRuns = bitmap.runs;
    const sourceWidth = bitmap.w;
    const sourceHeight = bitmap.h;

    const destinationWidth = Math.max(1, Math.round(sourceWidth * scaleFactor));
    const destinationHeight = Math.max(1, Math.round(sourceHeight * scaleFactor));

    const rowBuckets = new Array(destinationHeight);

    let minimumX = destinationWidth;
    let minimumY = destinationHeight;
    let maximumX = 0;
    let maximumY = 0;
    let hasOpaquePixel = false;

    for (let index = 0; index < sourceRuns.length; index += 1) {
        const row = sourceRuns[index];
        const y = row[0];
        const xStart = row[1];
        const xEnd = row[2];

        const newY = Math.round(y * scaleFactor);
        if (newY < 0 || newY >= destinationHeight) continue;

        const newXStart = Math.round(xStart * scaleFactor);
        const newXEnd = Math.round((xEnd + 1) * scaleFactor) - 1;
        if (newXEnd < newXStart) continue;

        let bucket = rowBuckets[newY];
        if (!bucket) {
            bucket = [];
            rowBuckets[newY] = bucket;
        }

        bucket.push([newXStart, newXEnd]);
        hasOpaquePixel = true;

        if (newXStart < minimumX) minimumX = newXStart;
        if (newXEnd > maximumX) maximumX = newXEnd;
        if (newY < minimumY) minimumY = newY;
        if (newY > maximumY) maximumY = newY;
    }

    if (!hasOpaquePixel) {
        return {
            w: destinationWidth,
            h: destinationHeight,
            runs: [],
            minX: 0,
            minY: 0,
            maxX: 0,
            maxY: 0
        };
    }

    const outputRuns = [];

    for (let y = 0; y < destinationHeight; y += 1) {
        const bucket = rowBuckets[y];
        if (!bucket || bucket.length === 0) continue;

        bucket.sort((a, b) => a[0] - b[0]);

        let currentStart = bucket[0][0];
        let currentEnd = bucket[0][1];

        for (let index = 1; index < bucket.length; index += 1) {
            const start = bucket[index][0];
            const end = bucket[index][1];

            if (start <= currentEnd + 1) {
                if (end > currentEnd) currentEnd = end;
            } else {
                outputRuns.push([y, currentStart, currentEnd]);
                currentStart = start;
                currentEnd = end;
            }
        }

        outputRuns.push([y, currentStart, currentEnd]);
    }

    return {
        w: destinationWidth,
        h: destinationHeight,
        runs: outputRuns,
        minX: minimumX,
        minY: minimumY,
        maxX: maximumX,
        maxY: maximumY
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
    ctx: context,
    svg
}) {
    const key = makeBitmapKey({ word, fontSize, pad, svg });
    const cached = bitmapCache.get(key);
    if (cached) return { key, bitmap: cached };

    const bitmap = getWordBitmap({ word, fontSize, pad, canvas, ctx: context, svg });
    bitmapCache.set(key, bitmap);
    return { key, bitmap };
}

function getCachedDilatedMask({
    bitmapKey,
    wordMask,
    w: width,
    h: height,
    dilation
}) {
    const key = `${bitmapKey}::d${dilation}`;
    const cached = dilatedMaskCache.get(key);
    if (cached) return cached;

    const dilatedWordMask = dilateWordMask({ wordMask, w: width, h: height, dilation });
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

for (let angleDegrees = 0; angleDegrees < 360; angleDegrees += spiralStep) {
    const angle = angleDegrees * degreesToRadians;
    spiralCosValues.push(Math.cos(angle));
    spiralSinValues.push(Math.sin(angle));
}

const fallbackSpiralCosValues = [];
const fallbackSpiralSinValues = [];

for (let angleDegrees = 0; angleDegrees < 360; angleDegrees += fallbackSpiralStep) {
    const angle = angleDegrees * degreesToRadians;
    fallbackSpiralCosValues.push(Math.cos(angle));
    fallbackSpiralSinValues.push(Math.sin(angle));
}

/* ------------------------------------------------------------------------- */
/* Layout scaling                                                            */
/* ------------------------------------------------------------------------- */

/**
 * Uniformly scales all placed words around the center so that the occupied
 * area fills more of the available region, without creating overlaps.
 */
function scaleLayoutToFillArea(positionedWords, maskWidth, maskHeight) {
    if (!positionedWords.length) return;

    let minimumRelativeX = Infinity;
    let maximumRelativeX = -Infinity;
    let minimumRelativeY = Infinity;
    let maximumRelativeY = -Infinity;

    for (let index = 0; index < positionedWords.length; index += 1) {
        const word = positionedWords[index];

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
    const allowedScaleX = (maskWidth * 0.5 * marginFactor) / maximumAbsoluteX;
    const allowedScaleY = (maskHeight * 0.5 * marginFactor) / maximumAbsoluteY;

    let scaleFactor = Math.min(allowedScaleX, allowedScaleY);

    if (scaleFactor <= 1) return;

    const maximumScaleFactor = 4;
    if (scaleFactor > maximumScaleFactor) {
        scaleFactor = maximumScaleFactor;
    }

    for (let index = 0; index < positionedWords.length; index += 1) {
        const word = positionedWords[index];

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

/* ------------------------------------------------------------------------- */
/* Time helper (when config.debug === true)                                  */
/* ------------------------------------------------------------------------- */

function getNowFunction() {
    const hasPerformance =
        typeof performance !== "undefined" &&
        typeof performance.now === "function";

    if (hasPerformance) {
        return () => performance.now();
    }

    return () => Date.now();
}

/* ------------------------------------------------------------------------- */
/* Font size helper                                                          */
/* ------------------------------------------------------------------------- */

function computeTargetFontSize({
    value,
    minimumValue,
    maximumValue,
    configuredMinimumFontSize,
    maximumFontSize
}) {
    if (maximumValue === minimumValue) {
        return maximumFontSize;
    }

    const ratio =
        (value - minimumValue) / (maximumValue - minimumValue);

    const interpolated = ratio *
        (maximumFontSize - configuredMinimumFontSize) +
        configuredMinimumFontSize;

    const clamped = Math.max(
        configuredMinimumFontSize,
        Math.min(maximumFontSize, interpolated)
    );

    return clamped;
}

/* ------------------------------------------------------------------------- */
/* Placement helpers                                                         */
/* ------------------------------------------------------------------------- */

function buildRunsForBitmap({
    currentBitmap,
    strictPixelPadding,
    scaleFactor,
    baseBitmap,
    bitmapKey
}) {
    let runs = currentBitmap.runs;
    const bitmapWidth = currentBitmap.w;
    const bitmapHeight = currentBitmap.h;
    const bitmapMinimumX = currentBitmap.minX;
    const bitmapMinimumY = currentBitmap.minY;
    const bitmapMaximumX = currentBitmap.maxX;
    const bitmapMaximumY = currentBitmap.maxY;

    if (!strictPixelPadding || !runs.length) {
        return {
            runs,
            bitmapWidth,
            bitmapHeight,
            bitmapMinimumX,
            bitmapMinimumY,
            bitmapMaximumX,
            bitmapMaximumY
        };
    }

    if (scaleFactor === 1) {
        const dilated = getCachedDilatedMask({
            bitmapKey,
            wordMask: baseBitmap.wordMask,
            w: baseBitmap.w,
            h: baseBitmap.h,
            dilation: 2
        });

        return {
            runs: dilated.runs,
            bitmapWidth,
            bitmapHeight,
            bitmapMinimumX,
            bitmapMinimumY,
            bitmapMaximumX,
            bitmapMaximumY
        };
    }

    const dilatedRuns = dilateRunsToRuns({
        runs,
        w: bitmapWidth,
        h: bitmapHeight,
        dilation: 2
    });

    return {
        runs: dilatedRuns,
        bitmapWidth,
        bitmapHeight,
        bitmapMinimumX,
        bitmapMinimumY,
        bitmapMaximumX,
        bitmapMaximumY
    };
}

async function tryPlaceWordOnSpiral({
    baseBitmap,
    baseFontSize,
    minimumScaleFactor,
    maskBits,
    maskRowStride,
    maskWidth,
    maskHeight,
    centerX,
    centerY,
    maximumRadius,
    scaleStep,
    strictPixelPadding,
    bitmapKey,
    minimumFontSize,
    rawWord,
    cosineArray,
    sineArray,
    radiusStep,
    maximumAttempts,
    maybeYield
}) {
    let scaleFactor = 1;

    while (scaleFactor >= minimumScaleFactor) {
        const currentBitmap =
            scaleFactor === 1
                ? baseBitmap
                : scaleBitmap(baseBitmap, scaleFactor);

        const placementData = buildRunsForBitmap({
            currentBitmap,
            strictPixelPadding,
            scaleFactor,
            baseBitmap,
            bitmapKey
        });

        const {
            runs,
            bitmapWidth,
            bitmapHeight,
            bitmapMinimumX,
            bitmapMinimumY,
            bitmapMaximumX,
            bitmapMaximumY
        } = placementData;

        let radius = 0;
        let attempts = 0;

        while (radius < maximumRadius && attempts < maximumAttempts) {
            for (let angleIndex = 0; angleIndex < cosineArray.length; angleIndex += 1) {
                attempts += 1;

                const placementX = Math.round(
                    centerX + radius * cosineArray[angleIndex] - bitmapWidth / 2
                );
                const placementY = Math.round(
                    centerY + radius * sineArray[angleIndex] - bitmapHeight / 2
                );

                if (
                    placementX < 0 ||
                    placementY < 0 ||
                    placementX + bitmapWidth > maskWidth ||
                    placementY + bitmapHeight > maskHeight
                ) {
                    continue;
                }

                const canPlace = canPlaceAtRuns({
                    maskBits,
                    maskRowStride,
                    maskW: maskWidth,
                    maskH: maskHeight,
                    wx: placementX,
                    wy: placementY,
                    runs
                });

                if (canPlace) {
                    const { __wcIndex: _ignore, ...cleanWord } = rawWord;
                    const effectiveFontSize = Math.max(
                        minimumFontSize,
                        Math.round(baseFontSize * scaleFactor)
                    );

                    const placedWord = {
                        ...cleanWord,
                        x: placementX - maskWidth / 2,
                        y: placementY - maskHeight / 2,
                        fontSize: effectiveFontSize,
                        width: bitmapWidth,
                        height: bitmapHeight,
                        angle: 0,
                        minX: bitmapMinimumX,
                        minY: bitmapMinimumY,
                        maxX: bitmapMaximumX,
                        maxY: bitmapMaximumY
                    };

                    markMaskRuns({
                        maskBits,
                        maskRowStride,
                        maskW: maskWidth,
                        maskH: maskHeight,
                        wx: placementX,
                        wy: placementY,
                        runs
                    });

                    return placedWord;
                }
            }

            radius += radiusStep;

            if ((attempts & 1023) === 0) {
                await maybeYield();
            }
        }

        scaleFactor *= scaleStep;
        await maybeYield();
    }

    return null;
}

async function attemptPlaceWordWithFallback({
    baseBitmap,
    baseFontSize,
    minimumScaleFactor,
    maskBits,
    maskRowStride,
    maskWidth,
    maskHeight,
    centerX,
    centerY,
    maximumRadius,
    scaleStep,
    strictPixelPadding,
    bitmapKey,
    minimumFontSize,
    rawWord,
    maybeYield,
    spiralRadiusStep,
    fallbackSpiralRadiusStep
}) {
    const primaryPlacement = await tryPlaceWordOnSpiral({
        baseBitmap,
        baseFontSize,
        minimumScaleFactor,
        maskBits,
        maskRowStride,
        maskWidth,
        maskHeight,
        centerX,
        centerY,
        maximumRadius,
        scaleStep,
        strictPixelPadding,
        bitmapKey,
        minimumFontSize,
        rawWord,
        cosineArray: spiralCosValues,
        sineArray: spiralSinValues,
        radiusStep: spiralRadiusStep,
        maximumAttempts: 10000,
        maybeYield
    });

    if (primaryPlacement) {
        return primaryPlacement;
    }

    const fallbackPlacement = await tryPlaceWordOnSpiral({
        baseBitmap,
        baseFontSize,
        minimumScaleFactor,
        maskBits,
        maskRowStride,
        maskWidth,
        maskHeight,
        centerX,
        centerY,
        maximumRadius,
        scaleStep,
        strictPixelPadding,
        bitmapKey,
        minimumFontSize,
        rawWord,
        cosineArray: fallbackSpiralCosValues,
        sineArray: fallbackSpiralSinValues,
        radiusStep: fallbackSpiralRadiusStep,
        maximumAttempts: 25000,
        maybeYield
    });

    return fallbackPlacement;
}

/* ------------------------------------------------------------------------- */
/* Main layout                                                               */
/* ------------------------------------------------------------------------- */

/**
 * Attempts to position an array of words inside a given SVG region without overlap.
 * Words are sorted by value and placed largest-first.
 */
export async function positionWordsAsync({
    words,
    proximity = 0,
    svg,
    strictPixelPadding,
    onProgress,
    debugTiming = false
}) {
    const now = getNowFunction();
    const startTime = now();

    const yieldBudgetMs = 12;
    let lastYieldTime = startTime;

    async function maybeYield() {
        const currentTime = now();
        if (currentTime - lastYieldTime >= yieldBudgetMs) {
            await new Promise(resolve => setTimeout(resolve, 0));
            lastYieldTime = now();
        }
    }

    const width = svg.width;
    const height = svg.height;
    const maskWidth = Math.round(width);
    const maskHeight = Math.round(height);

    const minimumFontSize = 1;
    const configuredMinimumFontSize = svg.minFontSize;
    const maximumFontSize = Math.min(svg.maxFontSize, 100);

    const values = words.map(word => word.value);
    const minimumValue = Math.min(...values);
    const maximumValue = Math.max(...values);

    if (maskWidth <= 0 || maskHeight <= 0) return [];

    const maskRowStride = (maskWidth + 31) >>> 5;
    const maskBits = new Uint32Array(maskRowStride * maskHeight);

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d", { willReadFrequently: true });
    canvas.width = maskWidth;
    canvas.height = maskHeight;

    const spiralRadiusStep = 2;
    const fallbackSpiralRadiusStep = 1;
    const maximumRadius = Math.max(maskWidth, maskHeight);
    const centerX = Math.floor(maskWidth / 2);
    const centerY = Math.floor(maskHeight / 2);

    const wordsWithInternalIndex = words.map((word, index) => ({
        ...word,
        __wcIndex: index,
        id: word.id != null ? word.id : `${word.name}__${index}`
    }));

    const sortedWords = [...wordsWithInternalIndex].sort(
        (a, b) => b.value - a.value
    );

    const positionedWords = [];
    const scaleStep = 0.9;

    for (let sortedIndex = 0; sortedIndex < sortedWords.length; sortedIndex += 1) {
        const rawWord = sortedWords[sortedIndex];
        const previouslyPlacedCount = positionedWords.length;

        const targetFontSize = computeTargetFontSize({
            value: rawWord.value,
            minimumValue,
            maximumValue,
            configuredMinimumFontSize,
            maximumFontSize
        });

        const baseFontSize = targetFontSize;

        const cacheEntry = getCachedWordBitmap({
            word: rawWord,
            fontSize: baseFontSize,
            pad: proximity,
            canvas,
            ctx: context,
            svg
        });

        const bitmapKey = cacheEntry.key;
        const baseBitmap = cacheEntry.bitmap;

        const baseWidth = baseBitmap.w;
        const baseHeight = baseBitmap.h;

        if (baseWidth <= 0 || baseHeight <= 0) {
            await maybeYield();
            continue;
        }

        const minimumScaleFactor = Math.max(
            minimumFontSize / baseFontSize,
            0.1
        );

        const placedWord = await attemptPlaceWordWithFallback({
            baseBitmap,
            baseFontSize,
            minimumScaleFactor,
            maskBits,
            maskRowStride,
            maskWidth,
            maskHeight,
            centerX,
            centerY,
            maximumRadius,
            scaleStep,
            strictPixelPadding,
            bitmapKey,
            minimumFontSize,
            rawWord,
            maybeYield,
            spiralRadiusStep,
            fallbackSpiralRadiusStep
        });

        if (placedWord) {
            positionedWords.push(placedWord);

            if (onProgress && positionedWords.length > previouslyPlacedCount) {
                const lastPlaced = positionedWords[positionedWords.length - 1];
                onProgress({ word: lastPlaced, all: positionedWords });
            }
        }

        await maybeYield();
    }

    if (!positionedWords.length) {
        return [];
    }

    scaleLayoutToFillArea(positionedWords, maskWidth, maskHeight);

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
    dilateWordMask,
    // Helpers exported for testing
    buildSingleWordMask,
    buildFirstWordMask,
    buildLastWordMask
};

export default wordcloud;
