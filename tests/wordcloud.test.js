import { describe, test, expect, vi } from "vitest";
import {
    getWordBitmap,
    canPlaceAt,
    markMask,
    dilateWordMask,
    positionWords,
    positionWordsAsync
} from "../src/wordcloud"

function createMockContext2D() {
    return {
        save: vi.fn(),
        restore: vi.fn(),
        font: "",
        textAlign: "",
        textBaseline: "",
        fillStyle: "",
        clearRect: vi.fn(),
        fillText: vi.fn(),
        measureText: vi.fn().mockImplementation((text) => ({
            width: text.length * 10,
        })),
        getImageData: vi.fn().mockImplementation((_x, _y, w, h) => ({
            data: (() => {
                const arr = new Uint8ClampedArray(w * h * 4);
                for (let py = 0; py < h; py += 1) {
                    for (let px = 0; px < w; px += 1) {
                        const i = (py * w + px) * 4;
                        if (
                            px >= Math.floor(w / 2) - 2 &&
                            px <= Math.floor(w / 2) + 2 &&
                            py >= Math.floor(h / 2) - 2 &&
                            py <= Math.floor(h / 2) + 2
                        ) {
                            arr[i + 3] = 255;
                        }
                    }
                }
                return arr;
            })(),
        })),
    };
}
function createMockCanvas() {
    return {
        width: 0,
        height: 0,
        getContext: () => createMockContext2D(),
    };
}

vi.stubGlobal("document", {
    createElement: (tag) =>
        tag === "canvas"
            ? createMockCanvas()
            : {
                getContext: () => createMockContext2D(),
            },
});

describe("getWordBitmap", () => {
    test("returns correct width, height, and wordMask", () => {
        const canvas = createMockCanvas();
        const ctx = createMockContext2D();
        const word = { name: "hello" };
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
        expect(Array.isArray(res.wordMask)).toBe(true);
        expect(res.wordMask.length).toBe(25); // Mock places 5 x 5 opaque blocks at the center, so mask should have 25 entries
        expect(Array.isArray(res.wordMask[0])).toBe(true); // [x, y]
        expect(res.wordMask[0]).toHaveLength(2);
    });

    test("applies bold style if svg.style.bold is true", () => {
        const canvas = createMockCanvas();
        const ctx = createMockContext2D();
        const word = { name: "bold" };
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
        expect(ctx.font.startsWith("bold ")).toBe(true);
    });
});

describe("canPlaceAt", () => {
    test("returns true if no collision and inside mask bounds", () => {
        const mask = new Uint8Array(100);
        const maskW = 10;
        const maskH = 10;
        const wx = 0;
        const wy = 0;

        const wordMask = [
            [1, 1],
            [2, 2],
            [3, 3],
        ];

        expect(
            canPlaceAt({ mask, maskW, maskH, wx, wy, wordMask })
        ).toBe(true);
    });

    test("returns false if wordMask goes outside mask bounds", () => {
        const mask = new Uint8Array(100);
        const maskW = 10;
        const maskH = 10;
        const wx = 8;
        const wy = 8;

        const wordMask = [
            [2, 2], // (10,10)
        ];

        expect(
            canPlaceAt({ mask, maskW, maskH, wx, wy, wordMask })
        ).toBe(false);
    });

    test("returns false if there is a collision", () => {
        const mask = new Uint8Array(100);
        mask[22] = 1; // collision at (2,2)
        const maskW = 10;
        const maskH = 10;
        const wx = 0;
        const wy = 0;

        const wordMask = [
            [2, 2],
            [3, 3],
        ];

        expect(
            canPlaceAt({ mask, maskW, maskH, wx, wy, wordMask })
        ).toBe(false);
    });
});

describe("markMask", () => {
    test("sets mask values to 1 at the correct positions", () => {
        const mask = new Uint8Array(100);
        const maskW = 10;
        const maskH = 10;
        const wx = 1;
        const wy = 2;

        const wordMask = [
            [0, 0],
            [1, 1],
        ];

        markMask({ mask, maskW, maskH, wx, wy, wordMask });
        expect(mask[21]).toBe(1); // (1,2)
        expect(mask[32]).toBe(1); // (2,3)
        expect(mask.reduce((sum, v) => sum + v, 0)).toBe(2);
    });

    test("ignores out-of-bounds mask points", () => {
        const mask = new Uint8Array(100);
        const maskW = 10;
        const maskH = 10;
        const wx = 9;
        const wy = 9;

        const wordMask = [
            [0, 0],
            [2, 2], // out of bounds (11,11)
        ];

        markMask({ mask, maskW, maskH, wx, wy, wordMask });
        expect(mask[99]).toBe(1); // (9,9)
        expect(mask.reduce((sum, v) => sum + v, 0)).toBe(1);
    });
});

describe("dilateWordMask", () => {
    test("adds neighbors according to dilation", () => {
        const wordMask = [
            [2, 2],
            [3, 2],
        ];
        const w = 6;
        const h = 6;
        const dilation = 1;

        const result = dilateWordMask({ wordMask, w, h, dilation });
        expect(result).toContainEqual([2, 2]);
        expect(result).toContainEqual([3, 2]);
        expect(result).toContainEqual([2, 1]);
        expect(result).toContainEqual([3, 3]);
        expect(result.every(([x, y]) => x >= 0 && x < w && y >= 0 && y < h)).toBe(
            true
        );
        const asStrings = result.map(([x, y]) => `${x},${y}`);
        const uniq = Array.from(new Set(asStrings));
        expect(result.length).toBe(uniq.length);
    });

    test("returns original wordMask if dilation is 0", () => {
        const wordMask = [
            [1, 1],
            [2, 2],
        ];

        const w = 4;
        const h = 4;
        const dilation = 0;

        const result = dilateWordMask({ wordMask, w, h, dilation });
        expect(result.sort()).toEqual(wordMask.sort());
    });
});

describe("positionWords", () => {
    test("places a single word in the center", () => {
        const words = [{ name: "one", value: 10 }];
        const svg = {
            width: 100,
            height: 100,
            minFontSize: 10,
            maxFontSize: 20,
            style: {},
        };
        const result = positionWords({ words, svg });
        expect(result.length).toBe(1);
        expect(result[0].name).toBe("one");
        expect(Math.abs(result[0].x)).toBeLessThan(20); // ...ish
        expect(Math.abs(result[0].y)).toBeLessThan(20);
        expect(result[0].fontSize).toBeGreaterThanOrEqual(svg.minFontSize);
        expect(result[0].fontSize).toBeLessThanOrEqual(svg.maxFontSize);
        expect(result[0].width).toBeGreaterThan(0);
        expect(result[0].height).toBeGreaterThan(0);
    });

    test("places words with higher value at larger font size", () => {
        const words = [
            { name: "big", value: 20 },
            { name: "small", value: 10 },
        ];
        const svg = {
            width: 100,
            height: 100,
            minFontSize: 8,
            maxFontSize: 24,
            style: {},
        };
        const result = positionWords({ words, svg });
        expect(result.length).toBe(2);
        expect(result[0].fontSize).toBeGreaterThan(result[1].fontSize);
        expect(result[0].name).toBe("big");
        expect(result[1].name).toBe("small");
    });

    test("does not overlap words", () => {
        const words = [
            { name: "A", value: 10 },
            { name: "B", value: 10 },
        ];
        const svg = {
            width: 60,
            height: 60,
            minFontSize: 10,
            maxFontSize: 10,
            style: {},
        };

        const result = positionWords({ words, svg });
        const mask = new Uint8Array(60 * 60);

        for (const word of result) {
            const wx = Math.round(word.x + 30);
            const wy = Math.round(word.y + 30);

            const { wordMask } = getWordBitmap({
                word,
                fontSize: word.fontSize,
                pad: 0,
                canvas: createMockCanvas(),
                ctx: createMockContext2D(),
                svg: {
                    minFontSize: word.fontSize,
                    style: {},
                }
            });

            for (const [dx, dy] of wordMask) {
                const idx = (wy + dy) * 60 + (wx + dx);
                expect(mask[idx]).toBe(0);
                mask[idx] = 1;
            }
        }
    });

    test("handles minValue == maxValue case gracefully", () => {
        const words = [
            { name: "A", value: 42 },
            { name: "B", value: 42 },
        ];
        const svg = {
            width: 60,
            height: 60,
            minFontSize: 10,
            maxFontSize: 30,
            style: {},
        };
        const result = positionWords({ words, svg });
        expect(result[0].fontSize).toBe(svg.minFontSize);
        expect(result[1].fontSize).toBe(svg.minFontSize);
    });
});

describe("positionWordsAsync", () => {
    test("places words asynchronously and calls onProgress", async () => {
        const words = [
            { name: "one", value: 10 },
            { name: "two", value: 5 },
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

        for (const w of result) {
            expect(typeof w.x).toBe("number");
            expect(typeof w.y).toBe("number");
            expect(typeof w.fontSize).toBe("number");
            expect(w.fontSize).toBeGreaterThanOrEqual(svg.minFontSize);
            expect(w.fontSize).toBeLessThanOrEqual(svg.maxFontSize);
            expect(w.width).toBeGreaterThan(0);
            expect(w.height).toBeGreaterThan(0);
        }

        expect(onProgress).toHaveBeenCalled();
        expect(onProgress.mock.calls.length).toBeLessThanOrEqual(words.length);

        const [firstCallArg] = onProgress.mock.calls[0];
        expect(firstCallArg).toHaveProperty("word");
        expect(firstCallArg).toHaveProperty("all");
        expect(Array.isArray(firstCallArg.all)).toBe(true);
    });
});
