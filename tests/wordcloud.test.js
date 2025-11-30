import { describe, test, expect, vi } from "vitest";
import {
    getWordBitmap,
    canPlaceAt,
    markMask,
    dilateWordMask,
    positionWordsAsync,
    // helpers
    buildSingleWordMask,
    buildFirstWordMask,
    buildLastWordMask
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

        // layout may scale up to 4x (see scaleLayoutToFillArea)
        const maxScaledFontSize = svg.maxFontSize * 4;

        for (const w of result) {
            expect(typeof w.x).toBe("number");
            expect(typeof w.y).toBe("number");
            expect(typeof w.fontSize).toBe("number");
            expect(w.fontSize).toBeGreaterThanOrEqual(svg.minFontSize);
            expect(w.fontSize).toBeLessThanOrEqual(maxScaledFontSize);
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

    test("places words with strictPixelPadding enabled", async () => {
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
            strictPixelPadding: true,
            onProgress,
        });

        expect(result.length).toBe(words.length);

        const maxScaledFontSize = svg.maxFontSize * 4;

        for (const w of result) {
            expect(typeof w.x).toBe("number");
            expect(typeof w.y).toBe("number");
            expect(typeof w.fontSize).toBe("number");
            expect(w.fontSize).toBeGreaterThanOrEqual(svg.minFontSize);
            expect(w.fontSize).toBeLessThanOrEqual(maxScaledFontSize);
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


describe("Bitmask builders", () => {
    describe("buildSingleWordMask", () => {
        test("creates a mask with bits [bitStart, bitEnd] set", () => {
            // Expected: bits 2,3,4 set -> binary ...00011100
            const expected =
                (0b111 << 2) >>> 0; // shift 3 bits into position 2 → 0b00011100
            expect(buildSingleWordMask(2, 4)).toBe(expected);
        });

        test("single bit range works", () => {
            const expected = (1 << 5) >>> 0; // only bit 5 set
            expect(buildSingleWordMask(5, 5)).toBe(expected);
        });
    });

    describe("buildFirstWordMask", () => {
        test("sets bits from bitStart to 31", () => {
            // bitStart = 3 → bits 3..31 set
            const expected =
                (~0 << 3) >>> 0; // shift all-ones left by 3
            expect(buildFirstWordMask(3)).toBe(expected);
        });

        test("bitStart = 0 sets all bits", () => {
            expect(buildFirstWordMask(0)).toBe(0xFFFFFFFF >>> 0);
        });
    });

    describe("buildLastWordMask", () => {
        test("sets bits 0..bitEnd", () => {
            // bitEnd = 4 → 0b00011111
            const expected =
                (1 << (4 + 1)) - 1; // (1<<5)-1 = 0b11111
            expect(buildLastWordMask(4)).toBe(expected >>> 0);
        });

        test("bitEnd = 31 sets all bits", () => {
            expect(buildLastWordMask(31)).toBe(0xFFFFFFFF >>> 0);
        });
    });
});