import { describe, test, expect, vi } from 'vitest';
import {
    getWordBitmap,
    positionWordsAsync,
    // helpers
    buildSingleWordMask,
    makeSprite,
} from '../src/wordcloud';

import {
    createMockContext2D,
    createMockCanvas,
} from './helpers/wordcloudCanvas';

vi.stubGlobal('document', {
    createElement: (tag) =>
        tag === 'canvas'
            ? createMockCanvas()
            : {
                  getContext: () => createMockContext2D(),
              },
});

describe('getWordBitmap', () => {
    test('returns dimensions and contiguous glyph runs', () => {
        const canvas = createMockCanvas();
        const ctx = createMockContext2D();
        const word = { name: 'hello' };
        const fontSize = 20;
        const pad = 4;
        const svg = { style: {} };
        const res = getWordBitmap({
            word,
            fontSize,
            pad,
            canvas,
            ctx,
            svg,
        });
        expect(res.w).toBeGreaterThan(0);
        expect(res.h).toBeGreaterThan(0);
        expect(
            res.runs.reduce(
                (area, [, start, end]) => area + end - start + 1,
                0,
            ),
        ).toBe(25);
        expect(
            res.runs.every(
                ([y, start, end]) =>
                    y >= 0 &&
                    y < res.h &&
                    start >= 0 &&
                    end < res.w &&
                    end >= start,
            ),
        ).toBe(true);
    });

    test('applies bold style if svg.style.bold is true', () => {
        const canvas = createMockCanvas();
        const ctx = createMockContext2D();
        const word = { name: 'bold' };
        const fontSize = 15;
        const pad = 2;
        const svg = { style: { bold: true } };
        getWordBitmap({
            word,
            fontSize,
            pad,
            canvas,
            ctx,
            svg,
        });
        expect(ctx.font.startsWith('bold ')).toBe(true);
    });
});

describe('positionWordsAsync', () => {
    test('places words asynchronously and calls onProgress', async () => {
        const words = [
            { name: 'one', value: 10 },
            { name: 'two', value: 5 },
        ];

        const svg = {
            width: 100,
            height: 100,
            minFontSize: 10,
            maxFontSize: 20,
            style: {},
        };

        const onProgress = vi.fn();

        const result = await positionWordsAsync({
            words,
            svg,
            onProgress,
        });

        expect(result.length).toBe(words.length);

        // Packing preserves assigned font sizes.
        const maxScaledFontSize = svg.maxFontSize;

        for (const w of result) {
            expect(typeof w.x).toBe('number');
            expect(typeof w.y).toBe('number');
            expect(typeof w.fontSize).toBe('number');
            expect(w.fontSize).toBeGreaterThanOrEqual(svg.minFontSize);
            expect(w.fontSize).toBeLessThanOrEqual(maxScaledFontSize);
            expect(w.width).toBeGreaterThan(0);
            expect(w.height).toBeGreaterThan(0);
        }

        expect(onProgress).toHaveBeenCalled();
        expect(onProgress.mock.calls.length).toBeLessThanOrEqual(words.length);

        const [firstCallArg] = onProgress.mock.calls[0];
        expect(firstCallArg).toHaveProperty('word');
        expect(firstCallArg).toHaveProperty('all');
        expect(Array.isArray(firstCallArg.all)).toBe(true);
    });

    test('places words with strictPixelPadding enabled', async () => {
        const words = [
            { name: 'one', value: 10 },
            { name: 'two', value: 5 },
        ];

        const svg = {
            width: 100,
            height: 100,
            minFontSize: 10,
            maxFontSize: 20,
            style: {},
        };

        const onProgress = vi.fn();

        const result = await positionWordsAsync({
            words,
            svg,
            strictPixelPadding: true,
            onProgress,
        });

        expect(result.length).toBe(words.length);

        const maxScaledFontSize = svg.maxFontSize;

        for (const w of result) {
            expect(typeof w.x).toBe('number');
            expect(typeof w.y).toBe('number');
            expect(typeof w.fontSize).toBe('number');
            expect(w.fontSize).toBeGreaterThanOrEqual(svg.minFontSize);
            expect(w.fontSize).toBeLessThanOrEqual(maxScaledFontSize);
            expect(w.width).toBeGreaterThan(0);
            expect(w.height).toBeGreaterThan(0);
        }

        expect(onProgress).toHaveBeenCalled();
        expect(onProgress.mock.calls.length).toBeLessThanOrEqual(words.length);

        const [firstCallArg] = onProgress.mock.calls[0];
        expect(firstCallArg).toHaveProperty('word');
        expect(firstCallArg).toHaveProperty('all');
        expect(Array.isArray(firstCallArg.all)).toBe(true);
    });
});

describe('Bitmask builders', () => {
    describe('buildSingleWordMask', () => {
        test('creates a mask with bits [bitStart, bitEnd] set', () => {
            // Expected: bits 2,3,4 set -> binary ...00011100
            const expected = (0b111 << 2) >>> 0; // shift 3 bits into position 2 → 0b00011100
            expect(buildSingleWordMask(2, 4)).toBe(expected);
        });

        test('single bit range works', () => {
            const expected = (1 << 5) >>> 0; // only bit 5 set
            expect(buildSingleWordMask(5, 5)).toBe(expected);
        });
    });
});

describe('layout invariants', () => {
    const svg = {
        width: 240,
        height: 160,
        minFontSize: 12,
        maxFontSize: 30,
        style: { fontFamily: 'serif', bold: true },
    };

    test.each(['fast', 'balanced', 'precise'])(
        '%s is deterministic and preserves input, identities and finite bounds',
        async (quality) => {
            const words = Object.freeze([
                Object.freeze({
                    id: 0,
                    name: 'same',
                    value: 10,
                    color: '#abc',
                }),
                Object.freeze({ id: 'other', name: 'same', value: 10 }),
                Object.freeze({ name: 'third', value: 1 }),
            ]);
            const first = await positionWordsAsync({ words, svg, quality });
            expect(await positionWordsAsync({ words, svg, quality })).toEqual(
                first,
            );
            expect(first).toHaveLength(3);
            expect(new Set(first.map((w) => w.id)).size).toBe(3);
            expect(first.find((w) => w.id === 0).color).toBe('#abc');
            for (const word of first) {
                expect(word.x + word.minX).toBeGreaterThanOrEqual(
                    -svg.width / 2,
                );
                expect(word.x + word.maxX).toBeLessThanOrEqual(svg.width / 2);
                expect(word.y + word.minY).toBeGreaterThanOrEqual(
                    -svg.height / 2,
                );
                expect(word.y + word.maxY).toBeLessThanOrEqual(svg.height / 2);
                expect(word.fontSize).toBe(
                    word.rasterFontSize * word.layoutScale,
                );
                expect(Number.isFinite(word.textX + word.textY)).toBe(true);
            }
        },
    );

    test('does not reuse bitmaps across font families or changed font availability', async () => {
        const context = createMockContext2D();
        const canvas = { width: 0, height: 0, getContext: () => context };
        const create = vi
            .spyOn(document, 'createElement')
            .mockReturnValue(canvas);
        try {
            const words = [{ name: 'font cache', value: 1 }];
            await positionWordsAsync({ words, svg });
            expect(context.fonts.at(-1)).toContain('serif');
            await positionWordsAsync({
                words,
                svg: { ...svg, style: { fontFamily: 'monospace' } },
            });
            expect(context.fonts.at(-1)).toContain('monospace');
            expect(context.fillText).toHaveBeenCalledTimes(2);
        } finally {
            create.mockRestore();
        }
    });

    test('cancels an active layout without publishing further progress', async () => {
        const controller = new AbortController();
        const onProgress = vi.fn(() => controller.abort());
        const result = await positionWordsAsync({
            words: [
                { name: 'first', value: 2 },
                { name: 'second', value: 1 },
            ],
            svg,
            signal: controller.signal,
            onProgress,
        });
        expect(result).toEqual([]);
        expect(onProgress).toHaveBeenCalledTimes(1);
    });

    test('handles empty and invalid-sized regions', async () => {
        expect(await positionWordsAsync({ words: [], svg })).toEqual([]);
        expect(
            await positionWordsAsync({
                words: [{ name: 'one', value: 1 }],
                svg: { ...svg, width: NaN },
            }),
        ).toEqual([]);
    });

    test('keeps a real zero descent and returns the exact alphabetic drawing origin', () => {
        const ctx = createMockContext2D();
        ctx.measureText.mockReturnValue({
            width: 20,
            actualBoundingBoxLeft: -2,
            actualBoundingBoxRight: 22,
            actualBoundingBoxAscent: 10,
            actualBoundingBoxDescent: 0,
        });
        const bitmap = getWordBitmap({
            word: { name: 'test' },
            fontSize: 20,
            pad: 0,
            canvas: createMockCanvas(),
            ctx,
            svg,
        });
        expect(ctx.fillText).toHaveBeenCalledWith(
            'test',
            bitmap.textX,
            bitmap.textY,
        );
        expect(bitmap.textY).toBe(bitmap.h - 6);
    });
});

describe('word angles and scatter', () => {
    const svg = {
        width: 360,
        height: 240,
        minFontSize: 12,
        maxFontSize: 30,
        style: { fontFamily: 'Arial' },
    };
    const words = Array.from({ length: 8 }, (_, i) => ({
        name: `word ${i}`,
        value: 8 - i,
    }));

    test('rasterizes cardinal rotations with swapped dimensions and consistent strokes', () => {
        const params = {
            word: { name: 'wide word' },
            fontSize: 30,
            pad: 2,
            svg,
            canvas: createMockCanvas(),
            ctx: createMockContext2D(),
        };
        const horizontal = getWordBitmap(params);
        const vertical = getWordBitmap({ ...params, angle: -90 });
        expect(vertical.w).toBe(horizontal.h);
        expect(vertical.h).toBe(horizontal.w);
        expect(vertical.strokeWidth).toBe(horizontal.strokeWidth);
        expect(params.ctx.rotate).toHaveBeenCalledWith(-Math.PI / 2);
    });

    test('omits an unplaceable word without shrinking or changing its assigned angle', async () => {
        const result = await positionWordsAsync({
            words: [{ name: 'long candidate', value: 1 }],
            svg: { ...svg, width: 80, height: 320, minFontSize: 30 },
            angles: [0, -90],
        });
        expect(result).toEqual([]);
    });

    test('alternates allowed orientations and reproduces seeded random choices', async () => {
        const options = {
            words,
            svg,
            angles: [0, -90, -45, 45],
            seed: 123,
            randomizeAngles: true,
            randomness: 0.5,
        };
        const first = await positionWordsAsync(options);
        expect(await positionWordsAsync(options)).toEqual(first);
        expect(first).toHaveLength(words.length);
        expect(first.every((w) => options.angles.includes(w.angle))).toBe(true);
        expect(new Set(first.map((w) => w.angle)).size).toBeGreaterThan(1);
        expect(await positionWordsAsync({ ...options, seed: 456 })).not.toEqual(
            first,
        );
    });

    test('falls back to level text for invalid angles and normalizes whole turns', async () => {
        const invalid = await positionWordsAsync({
            words,
            svg,
            angles: [NaN, Infinity, '90'],
            randomness: NaN,
        });
        expect(invalid.every((w) => w.angle === 0)).toBe(true);
        const vertical = await positionWordsAsync({
            words,
            svg,
            angles: [450],
        });
        expect(vertical.every((w) => w.angle === 90)).toBe(true);
    });
});

describe('sprite masks and bounded search storage', () => {
    test.each([31, 32, 33, 65])(
        'matches square pixel padding across bit boundaries (width %i)',
        (width) => {
            const height = 13;
            const boardStride = ((width + 31) >>> 5) + 2;
            const seeds = [];
            for (let y = 0; y < height; y++)
                for (let x = 0; x < width; x++)
                    if ((x * 17 + y * 13) % 11 === 0) seeds.push([x, y]);
            for (const radius of [0, 1, 3, 35]) {
                const expected = new Uint8Array(width * height);
                for (const [x, y] of seeds)
                    for (let dy = -radius; dy <= radius; dy++)
                        for (let dx = -radius; dx <= radius; dx++) {
                            const px = x + dx,
                                py = y + dy;
                            if (px >= 0 && px < width && py >= 0 && py < height)
                                expected[py * width + px] = 1;
                        }
                const actual = new Uint8Array(width * height);
                const sprite = makeSprite(
                    seeds.map(([x, y]) => [y, x, x]),
                    width,
                    height,
                    radius,
                    boardStride,
                );
                for (let i = 0; i < sprite.length; i += 2) {
                    const y = Math.floor(sprite[i] / boardStride),
                        column = sprite[i] % boardStride;
                    for (let bit = 0; bit < 32; bit++)
                        if (sprite[i + 1] & (1 << bit)) {
                            const x = column * 32 + bit;
                            expect(x).toBeLessThan(width);
                            actual[y * width + x] = 1;
                        }
                }
                expect(actual).toEqual(expected);
            }
        },
    );

    test('a tall chart allocates search offsets in small chunks', async () => {
        const NativeFloat64Array = globalThis.Float64Array;
        const allocations = [];
        const allocate = vi
            .spyOn(globalThis, 'Float64Array')
            .mockImplementation(function (length) {
                allocations.push(length);
                return new NativeFloat64Array(length);
            });
        try {
            const result = await positionWordsAsync({
                words: [{ name: 'word', value: 1 }],
                svg: {
                    width: 500,
                    height: 5000,
                    minFontSize: 20,
                    maxFontSize: 20,
                },
            });
            expect(result).toHaveLength(1);
            expect(allocations.length).toBeGreaterThan(0);
            expect(Math.max(...allocations)).toBeLessThan(10000);
        } finally {
            allocate.mockRestore();
        }
    });
});
