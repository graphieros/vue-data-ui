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
    svg,
    angle = 0,
}) {
    const isBold = svg.style && svg.style.bold;
    const fontFamily =
        (svg.style && svg.style.fontFamily) ||
        'Arial, "Noto Sans Arabic", Tahoma, sans-serif';

    const font = `${isBold ? 'bold ' : ''}${fontSize}px ${fontFamily}`;
    const wordName = String(word.name || '');
    const hasArabic = /[\u0600-\u06FF]/.test(wordName);

    context.font = font;
    context.textRendering = 'optimizeLegibility';
    context.direction = hasArabic ? 'rtl' : 'ltr';
    context.textAlign = 'left';
    context.textBaseline = 'alphabetic';

    const metrics = context.measureText(wordName);

    const actualLeft = Math.ceil(metrics.actualBoundingBoxLeft ?? 0);
    const actualRight = Math.ceil(
        metrics.actualBoundingBoxRight ?? metrics.width,
    );
    const actualAscent = Math.ceil(metrics.actualBoundingBoxAscent ?? fontSize);
    const actualDescent = Math.ceil(
        metrics.actualBoundingBoxDescent ?? fontSize * 0.25,
    );

    const basePadding = Math.max(0, Math.round(pad || 0));

    // Arabic glyphs, ligatures, diacritics, browser font fallback, and SVG
    // strokes can extend beyond the simple text advance box. A safety
    // padding makes the collision bitmap closer to the final rendering
    const visualSafetyPadding = Math.ceil(fontSize * (hasArabic ? 0.22 : 0.12));
    // Include the SVG stroke and browser rasterization tolerance in the canvas.
    const totalPadding = basePadding + visualSafetyPadding + 3;

    const baseWidth = Math.max(1, actualLeft + actualRight + totalPadding * 2);
    const baseHeight = Math.max(
        1,
        actualAscent + actualDescent + totalPadding * 2,
    );
    const radians = (angle * Math.PI) / 180;
    // Snap cardinal angles to avoid adding a row from floating-point residue.
    const cosine = Math.abs(Math.cos(radians)) < 1e-12 ? 0 : Math.cos(radians);
    const sine = Math.abs(Math.sin(radians)) < 1e-12 ? 0 : Math.sin(radians);
    const textWidth = Math.ceil(
        Math.abs(baseWidth * cosine) + Math.abs(baseHeight * sine),
    );
    const textHeight = Math.ceil(
        Math.abs(baseWidth * sine) + Math.abs(baseHeight * cosine),
    );

    canvas.width = textWidth;
    canvas.height = textHeight;
    context.font = font;
    context.textRendering = 'optimizeLegibility';
    context.direction = hasArabic ? 'rtl' : 'ltr';
    context.textAlign = 'left';
    context.textBaseline = 'alphabetic';
    context.fillStyle = 'black';

    const originX = totalPadding + actualLeft - baseWidth / 2;
    const originY = totalPadding + actualAscent - baseHeight / 2;
    const drawX = textWidth / 2 + originX * cosine - originY * sine;
    const drawY = textHeight / 2 + originX * sine + originY * cosine;

    if (angle === 0) {
        context.fillText(wordName, drawX, drawY);
    } else {
        context.save();
        context.translate(drawX, drawY);
        context.rotate(radians);
        context.fillText(wordName, 0, 0);
        context.restore();
    }

    const image = context.getImageData(0, 0, textWidth, textHeight);
    const data = image.data;

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
        runs,
        textX: drawX,
        textY: drawY,
        direction: hasArabic ? 'rtl' : 'ltr',
        fontFamily,
        angle,
        strokeWidth: baseHeight * 0.05,
        minX: minimumX,
        minY: minimumY,
        maxX: maximumX,
        maxY: maximumY,
    };
}

export function buildSingleWordMask(bitStart, bitEnd) {
    const widthBits = bitEnd - bitStart + 1;
    // 0xFFFFFFFF >>> (32 - widthBits) => low `widthBits` bits set to 1
    // then shift left by bitStart to position the run.
    return ((0xffffffff >>> (32 - widthBits)) << bitStart) >>> 0;
}

// Square dilation is separable: expand row intervals horizontally, then OR the
// neighboring rows vertically. This produces the exact same clipped pixels as
// the former run-bucket expansion, without sorting temporary interval arrays.
export function makeSprite(runs, width, height, dilation, boardStride) {
    const stride = (width + 31) >>> 5;
    const horizontal = new Uint32Array(stride * height);
    for (const [y, start, end] of runs) {
        const left = Math.max(0, start - dilation);
        const right = Math.min(width - 1, end + dilation);
        const first = left >>> 5;
        const last = right >>> 5;
        for (let block = first; block <= last; block += 1) {
            horizontal[y * stride + block] |= buildSingleWordMask(
                block === first ? left & 31 : 0,
                block === last ? right & 31 : 31,
            );
        }
    }
    // Sparse [board-relative offset, bits] pairs remove row multiplications
    // from every collision probe. All placements in a layout share a stride.
    const blocks = [];
    for (let y = 0; y < height; y += 1) {
        const firstRow = Math.max(0, y - dilation);
        const lastRow = Math.min(height - 1, y + dilation);
        for (let x = 0; x < stride; x += 1) {
            let value = 0;
            for (let row = firstRow; row <= lastRow; row += 1) {
                value |= horizontal[row * stride + x];
            }
            if (value) blocks.push(y * boardStride + x, value);
        }
    }
    return new Uint32Array(blocks);
}

function collideSprite(board, sprite, x, y, mark = false) {
    const offset = x & 31;
    const base = y * board.stride + (x >>> 5);
    for (let i = 0; i < sprite.length; i += 2) {
        const index = base + sprite[i];
        const bits = sprite[i + 1];
        const low = bits << offset;
        const high = offset === 0 ? 0 : bits >>> (32 - offset);
        if (mark) {
            board.bits[index] |= low;
            if (high) board.bits[index + 1] |= high;
        } else if (
            board.bits[index] & low ||
            (high && board.bits[index + 1] & high)
        ) {
            return true;
        }
    }
    return false;
}

// A golden-angle disc search samples equal areas as the radius grows. The
// two-pixel spacing and normalized ellipse keep coverage independent of canvas
// aspect ratio. Cache floating offsets once, then translate them per word.
function createDiscSearch(width, height) {
    const aspect = width / height;
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    const limit = Math.ceil((height * height) / 4);
    const chunks = [];
    return {
        aspect,
        get(index) {
            const chunkIndex = Math.floor(index / 256);
            if (!chunks[chunkIndex]) {
                const start = chunkIndex * 256;
                const end = Math.min(limit, start + 256);
                const offsets = new Float64Array((end - start) * 2);
                for (let i = start; i < end; i += 1) {
                    const radius = 2 * Math.sqrt(i);
                    const offset = (i - start) * 2;
                    offsets[offset] =
                        aspect * radius * Math.cos(i * goldenAngle);
                    offsets[offset + 1] = radius * Math.sin(i * goldenAngle);
                }
                chunks[chunkIndex] = offsets;
            }
            return chunks[chunkIndex];
        },
        limit,
    };
}

function seededRandom(seed) {
    let state = seed || 1;
    return () => {
        state ^= state << 13;
        state ^= state >>> 17;
        state ^= state << 5;
        return (state >>> 0) / 4294967296;
    };
}

/**
 * Glyph packing: golden-angle disc sampling, exact font metrics,
 * and sparse bit-packed masks. Words keep their assigned size and orientation.
 * Unplaceable words are omitted.
 */
export async function positionWordsAsync({
    words,
    proximity = 0,
    svg,
    strictPixelPadding,
    onProgress,
    debugTiming = false,
    signal,
    angles = [0],
    randomizeAngles = false,
    randomness = 0.2,
    seed = 42,
}) {
    const now = () =>
        typeof performance !== 'undefined' ? performance.now() : Date.now();
    const started = now();
    let lastYield = started;

    async function yieldIfNeeded() {
        if (now() - lastYield < 12) return;
        await new Promise((resolve) => setTimeout(resolve, 0));
        lastYield = now();
    }

    const width = Math.round(svg.width),
        height = Math.round(svg.height);

    if (
        !Number.isFinite(width) ||
        !Number.isFinite(height) ||
        width <= 0 ||
        height <= 0 ||
        !words.length ||
        signal?.aborted
    ) {
        return [];
    }

    const allowedAngles = (Array.isArray(angles) ? angles : [])
        .filter(Number.isFinite)
        .map((angle) => ((((angle + 180) % 360) + 360) % 360) - 180);

    if (!allowedAngles.length) {
        allowedAngles.push(0);
    }

    const scatter = Number.isFinite(randomness)
        ? Math.max(0, Math.min(1, randomness))
        : 0.2;

    const random = seededRandom(Number.isFinite(seed) ? seed | 0 : 42);

    const maxFont = Math.max(1, Math.min(svg.maxFontSize, 100));
    const minFont = Math.max(1, Math.min(svg.minFontSize, maxFont));
    const minimumValue = Math.min(...words.map((word) => word.value));
    const maximumValue = Math.max(...words.map((word) => word.value));

    const entries = words
        .map((word, index) => ({
            word,
            index,
            size: Math.round(
                maximumValue === minimumValue
                    ? maxFont
                    : minFont +
                          ((word.value - minimumValue) /
                              (maximumValue - minimumValue)) *
                              (maxFont - minFont),
            ),
            angle: allowedAngles[
                randomizeAngles
                    ? Math.floor(random() * allowedAngles.length)
                    : index % allowedAngles.length
            ],
        }))
        .sort((a, b) => b.size - a.size || a.index - b.index);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return [];

    const board = { stride: (width + 31) >>> 5 };
    board.bits = new Uint32Array(board.stride * height);

    const disc = createDiscSearch(width, height);
    const gap =
        Math.ceil(Math.max(0, proximity || 0) / 2) +
        (strictPixelPadding ? 1 : 0);

    const cache = new Map();
    const positioned = [];
    const bounds = {
        left: Infinity,
        top: Infinity,
        right: -Infinity,
        bottom: -Infinity,
    };

    for (const entry of entries) {
        if (signal?.aborted) return [];
        const key = JSON.stringify([entry.word.name, entry.size, entry.angle]);
        let glyph = cache.get(key);
        if (!glyph) {
            const bitmap = getWordBitmap({
                word: entry.word,
                fontSize: entry.size,
                pad: gap,
                canvas,
                ctx,
                svg,
                angle: entry.angle,
            });
            const dilation = gap + Math.ceil(bitmap.strokeWidth / 2) + 1;
            glyph = {
                bitmap,
                sprite: makeSprite(
                    bitmap.runs,
                    bitmap.w,
                    bitmap.h,
                    dilation,
                    board.stride,
                ),
            };
            cache.set(key, glyph);
        }
        const { bitmap, sprite } = glyph;
        if (!sprite.length || bitmap.w > width || bitmap.h > height) continue;
        const originX =
            width * (0.5 + (random() - 0.5) * scatter) - bitmap.w / 2;
        const originY =
            height * (0.5 + (random() - 0.5) * scatter) - bitmap.h / 2;
        const farX =
            Math.max(
                Math.abs(originX + 0.5),
                Math.abs(width - bitmap.w + 0.5 - originX),
            ) / disc.aspect;
        const farY = Math.max(
            Math.abs(originY + 0.5),
            Math.abs(height - bitmap.h + 0.5 - originY),
        );
        const attempts = Math.min(
            disc.limit,
            Math.ceil((farX * farX + farY * farY) / 4) + 1,
        );
        for (let attempt = 0; attempt < attempts; attempt += 1) {
            if ((attempt & 255) === 0) {
                await yieldIfNeeded();
                if (signal?.aborted) return [];
            }
            const offsets = disc.get(attempt);
            const offset = (attempt % 256) * 2;
            const x = Math.round(originX + offsets[offset]);
            const y = Math.round(originY + offsets[offset + 1]);
            if (
                x < 0 ||
                y < 0 ||
                x + bitmap.w > width ||
                y + bitmap.h > height
            ) {
                continue;
            }
            if (
                positioned.length &&
                (x + bitmap.w <= bounds.left ||
                    x >= bounds.right ||
                    y + bitmap.h <= bounds.top ||
                    y >= bounds.bottom)
            ) {
                continue;
            }
            if (collideSprite(board, sprite, x, y)) {
                continue;
            }
            collideSprite(board, sprite, x, y, true);
            bounds.left = Math.min(bounds.left, x);
            bounds.top = Math.min(bounds.top, y);
            bounds.right = Math.max(bounds.right, x + bitmap.w);
            bounds.bottom = Math.max(bounds.bottom, y + bitmap.h);
            const word = {
                ...entry.word,
                id: entry.word.id ?? `${entry.word.name}__${entry.index}`,
                x: x - width / 2,
                y: y - height / 2,
                fontSize: entry.size,
                // Exposed data aliases retained for existing getData consumers.
                rasterFontSize: entry.size,
                layoutScale: 1,
                width: bitmap.w,
                height: bitmap.h,
                textX: bitmap.textX,
                textY: bitmap.textY,
                direction: bitmap.direction,
                fontFamily: bitmap.fontFamily,
                angle: entry.angle,
                strokeWidth: bitmap.strokeWidth,
                minX: bitmap.minX,
                minY: bitmap.minY,
                maxX: bitmap.maxX + 1,
                maxY: bitmap.maxY + 1,
            };
            positioned.push(word);
            onProgress?.({ word, all: positioned.slice() });
            break;
        }
        await yieldIfNeeded();
    }
    if (signal?.aborted) {
        return [];
    }

    if (debugTiming && typeof console !== 'undefined') {
        console.log(
            '[vue-data-ui][word-cloud] positionWordsAsync:',
            `${(now() - started).toFixed(2)} ms for ${words.length} words`,
        );
    }
    return positioned;
}

const wordcloud = {
    positionWordsAsync,
    getWordBitmap,
    buildSingleWordMask,
};
export default wordcloud;
