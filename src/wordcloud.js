/**
 * @fileoverview
 * Word cloud layout and bitmap utilities for vue-ui-word-cloud component.
 * 
 * This module provides functions to:
 * 
 * - generate pixel masks for words
 * - check and mark word placement on a canvas 
 * - dilate masks for padding
 * - position words inside a given area using a spiral placement algorithm (the actual function of this file used in the component @generateWordCloud)
 */

function getTightBoundingBox(canvas, ctx) {
    const { width, height } = canvas;
    const img = ctx.getImageData(0, 0, width, height);
    const data = img.data;
    let minX = width, minY = height, maxX = 0, maxY = 0;
    let found = false;
    for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {
            const alpha = data[(y * width + x) * 4 + 3];
            if (alpha > 1) {
                found = true;
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
            }
        }
    }
    if (!found) return [0, 0, 0, 0];
    return [minX, minY, maxX, maxY];
}

/**
 * Generates a bitmap and mask representing a word, given font size and padding.
 * @param {Object} params
 * @param {Object} params.word - The word object, must contain a `name` string.
 * @param {number} params.fontSize - The font size to render the word.
 * @param {number} params.pad - Additional padding around the word (in pixels).
 * @param {HTMLCanvasElement} params.canvas - Canvas to render the word onto.
 * @param {CanvasRenderingContext2D} params.ctx - 2D drawing context for the canvas.
 * @param {Object} params.svg - SVG config, may contain style (e.g., bold).
 * @returns {{ w: number, h: number, wordMask: Array<[number, number]> }} The bitmap width, height, and mask of pixel coordinates.
 */
export function getWordBitmap({
    word,
    fontSize,
    pad,
    canvas,
    ctx,
    svg
}) {
    ctx.save();
    ctx.font = `${svg.style && svg.style.bold ? 'bold ' : ''}${fontSize}px Arial`;
    const metrics = ctx.measureText(word.name);
    const textW = Math.ceil(metrics.width) + 2 + (pad ? pad * 2 : 0);
    const textH = Math.ceil(fontSize) + 2 + (pad ? pad * 2 : 0);

    canvas.width = textW;
    canvas.height = textH;
    ctx.clearRect(0, 0, textW, textH);
    ctx.font = `${svg.style && svg.style.bold ? 'bold ' : ''}${fontSize}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "black";
    ctx.fillText(word.name, textW / 2, textH / 2);

    const image = ctx.getImageData(0, 0, textW, textH);
    const data = image.data;
    const wordMask = [];
    for (let y = 0; y < textH; y += 1) {
        for (let x = 0; x < textW; x += 1) {
            if (data[(y * textW + x) * 4 + 3] > 1) wordMask.push([x, y]);
        }
    }

    const [minX, minY, maxX, maxY] = getTightBoundingBox(canvas, ctx);
    ctx.restore();

    return { w: textW, h: textH, wordMask, minX, minY, maxX, maxY };
}

/**
 * Checks if a word's mask can be placed at a specific location on the main mask without overlap or out-of-bounds.
 * @param {Object} params
 * @param {Uint8Array} params.mask - The occupancy mask for the whole canvas.
 * @param {number} params.maskW - Width of the mask (canvas).
 * @param {number} params.maskH - Height of the mask (canvas).
 * @param {number} params.wx - X coordinate to place the top-left of the word mask.
 * @param {number} params.wy - Y coordinate to place the top-left of the word mask.
 * @param {Array<[number, number]>} params.wordMask - The word mask's pixel positions.
 * @returns {boolean} True if placement is possible, false if collision or out-of-bounds.
 */
export function canPlaceAt({ mask, maskW, maskH, wx, wy, wordMask }) {
    for (let i = 0; i < wordMask.length; i += 1) {
        const x = wx + wordMask[i][0];
        const y = wy + wordMask[i][1];
        if (x < 0 || y < 0 || x >= maskW || y >= maskH) return false;
        if (mask[y * maskW + x]) return false;
    }
    return true;
}

/**
 * Marks (fills) the given word's mask onto the main mask at the specified position.
 * @param {Object} params
 * @param {Uint8Array} params.mask - The occupancy mask for the whole canvas.
 * @param {number} params.maskW - Width of the mask (canvas).
 * @param {number} params.maskH - Height of the mask (canvas).
 * @param {number} params.wx - X coordinate to place the top-left of the word mask.
 * @param {number} params.wy - Y coordinate to place the top-left of the word mask.
 * @param {Array<[number, number]>} params.wordMask - The word mask's pixel positions.
 */
export function markMask({ mask, maskW, maskH, wx, wy, wordMask }) {
    for (let i = 0; i < wordMask.length; i += 1) {
        const x = wx + wordMask[i][0];
        const y = wy + wordMask[i][1];
        if (x >= 0 && y >= 0 && x < maskW && y < maskH) mask[y * maskW + x] = 1;
    }
}

/**
 * Dilates a word mask (expands its occupied area by the given radius).
 * @param {Object} params
 * @param {Array<[number, number]>} params.wordMask - Array of [x, y] pixel positions for the word.
 * @param {number} params.w - Width of the word bitmap.
 * @param {number} params.h - Height of the word bitmap.
 * @param {number} params.dilation - Radius of dilation (in pixels).
 * @returns {Array<[number, number]>} The new dilated mask as [x, y] positions.
 */
export function dilateWordMask({ wordMask, w, h, dilation }) {
    const set = new Set(wordMask.map(([x, y]) => `${x},${y}`));
    const result = new Set(set);
    for (let [x, y] of wordMask) {
        for (let dx = -dilation; dx <= dilation; dx += 1) {
            for (let dy = -dilation; dy <= dilation; dy += 1) {
                if (dx === 0 && dy === 0) continue;
                const nx = x + dx, ny = y + dy;
                if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
                    result.add(`${nx},${ny}`);
                }
            }
        }
    }
    return Array.from(result).map(s => s.split(',').map(Number));
}

/**
 * Attempts to position an array of words inside a given SVG region without overlap.
 * Words are sorted by value and placed largest-first.
 * @param {Object} params
 * @param {Array<{ name: string, value: number }>} params.words - List of word objects to place.
 * @param {number} [params.proximity=0] - Padding between words (in pixels).
 * @param {Object} params.svg - SVG config (must include width, height, minFontSize, maxFontSize, and optionally style).
 * @returns {Array<Object>} The positioned word objects, each with { x, y, fontSize, width, height, angle, ... }.
 */
export function positionWords({
    words,
    proximity = 0,
    svg,
    strictPixelPadding
}) {
    const { width, height } = svg;
    const maskW = Math.round(width);
    const maskH = Math.round(height);
    const minFontSize = 1;
    const configMinFontSize = svg.minFontSize;
    const maxFontSize = svg.maxFontSize;
    const values = words.map(w => w.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const mask = new Uint8Array(maskW * maskH);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    canvas.width = maskW;
    canvas.height = maskH;

    const spiralStep = 6, spiralRadiusStep = 2;
    const fallbackSpiralStep = 2, fallbackSpiralRadiusStep = 1;
    const cx = Math.floor(maskW / 2), cy = Math.floor(maskH / 2);
    const sorted = [...words].sort((a, b) => b.value - a.value);
    const positionedWords = [];

    for (const wordRaw of sorted) {
        let targetFontSize = configMinFontSize;
        if (maxValue !== minValue) {
            targetFontSize = (wordRaw.value - minValue) / (maxValue - minValue) * (maxFontSize - configMinFontSize) + configMinFontSize;
        }
        targetFontSize = Math.max(configMinFontSize, Math.min(maxFontSize, targetFontSize));

        let placed = false;
        let fontSize = targetFontSize;

        while (!placed && fontSize >= minFontSize) {
            let { w, h, wordMask, minX, minY, maxX, maxY } = getWordBitmap({
                word: wordRaw, 
                fontSize, 
                pad: proximity,
                canvas,
                ctx,
                svg
            });

            if (strictPixelPadding) {
                wordMask = dilateWordMask({ wordMask, w, h, dilation: 1 });
            }

            let r = 0;
            let attempts = 0;

            while (r < Math.max(maskW, maskH) && !placed && attempts < 10000) {
                for (let theta = 0; theta < 360; theta += spiralStep) {
                    attempts += 1;
                    const px = Math.round(cx + r * Math.cos(theta * Math.PI / 180) - w / 2);
                    const py = Math.round(cy + r * Math.sin(theta * Math.PI / 180) - h / 2);
                    if (px < 0 || py < 0 || px + w > maskW || py + h > maskH) continue;
                    if (canPlaceAt({ mask, maskW, maskH, wx:px, wy:py, wordMask})) {
                        positionedWords.push({ ...wordRaw, x: px - maskW / 2, y: py - maskH / 2, fontSize, width: w, height: h, angle: 0, minX, minY, maxX, maxY });
                        markMask({ mask, maskW, maskH, wx: px, wy: py, wordMask });
                        placed = true;
                        break;
                    }
                }
                r += spiralRadiusStep;
            }
            if (!placed) fontSize -= 1;
        }

        if (!placed && fontSize < minFontSize) {
            fontSize = minFontSize;
            const { w, h, wordMask, minX, minY, maxX, maxY } = getWordBitmap({
                word: wordRaw, 
                fontSize, 
                pad: proximity,
                canvas,
                ctx,
                svg
            });

            let r = 0;
            let attempts = 0;

            while (r < Math.max(maskW, maskH) && !placed && attempts < 25000) {
                for (let theta = 0; theta < 360; theta += fallbackSpiralStep) {
                    attempts += 1;
                    const px = Math.round(cx + r * Math.cos(theta * Math.PI / 180) - w / 2);
                    const py = Math.round(cy + r * Math.sin(theta * Math.PI / 180) - h / 2);
                    if (px < 0 || py < 0 || px + w > maskW || py + h > maskH) continue;
                    if (canPlaceAt({ mask, maskW, maskH, wx: px, wy: py, wordMask })) {
                        positionedWords.push({ ...wordRaw, x: px - maskW / 2, y: py - maskH / 2, fontSize, width: w, height: h, angle: 0, minX, minY, maxX, maxY });
                        markMask({ mask, maskW, maskH, wx: px, wy: py, wordMask });
                        placed = true;
                        break;
                    }
                }
                r += fallbackSpiralRadiusStep;
            }
        }
    }
    return positionedWords.sort((a, b) => b.fontSize - a.fontSize);
}

const wordcloud = {
    positionWords,
    getWordBitmap,
    canPlaceAt,
    markMask,
    dilateWordMask
}

export default wordcloud;