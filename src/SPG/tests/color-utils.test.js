import { describe, it, expect, beforeEach, beforeAll } from "vitest";
import {
    colorToRgba,
    colorsToRgba,
    rgbaToCss,
    rgbaToCssRgba,
    srgbChannelToLinear,
    linearChannelToSrgb,
    interpolateRgbaColor,
    interpolateCssColors,
} from "../color-utils";


function expectRgbaClose(actual, expected, alphaEpsilon = 1 / 255) {
    expect(actual.red).toBe(expected.red);
    expect(actual.green).toBe(expected.green);
    expect(actual.blue).toBe(expected.blue);
    expect(Math.abs(actual.alpha - expected.alpha)).toBeLessThanOrEqual(alphaEpsilon);
}

/**
 * Minimal "canvas parser" for tests.
 * - Accepts a small allowlist of colors used in the suite.
 * - Rejects anything else by keeping fillStyle unchanged (simulating browser behavior).
 */
function normalizeFillStyleOrKeep(previous, next) {
    const v = next.trim();

    if (/^#([0-9a-fA-F]{3})$/.test(v)) {
        // normalize #rgb -> #rrggbb
        const m = v.slice(1);
        const r = m[0] + m[0];
        const g = m[1] + m[1];
        const b = m[2] + m[2];
        return `#${(r + g + b).toLowerCase()}`;
    }
    if (/^#([0-9a-fA-F]{6})$/.test(v)) return v.toLowerCase();

    const rgbMatch = v.match(/^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i);
    if (rgbMatch) {
        const r = Number(rgbMatch[1]);
        const g = Number(rgbMatch[2]);
        const b = Number(rgbMatch[3]);
        if (r > 255 || g > 255 || b > 255) return previous;
        return `rgb(${r}, ${g}, ${b})`;
    }

    const rgbaMatch = v.match(
        /^rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(0|1|0?\.\d+)\s*\)$/i
    );
    if (rgbaMatch) {
        const r = Number(rgbaMatch[1]);
        const g = Number(rgbaMatch[2]);
        const b = Number(rgbaMatch[3]);
        const a = Number(rgbaMatch[4]);
        if (r > 255 || g > 255 || b > 255) return previous;
        if (a < 0 || a > 1) return previous;
        return `rgba(${r}, ${g}, ${b}, ${a})`;
    }

    const lower = v.toLowerCase();
    if (lower === "red") return "red";
    if (lower === "black") return "black";
    if (lower === "white") return "white";
    if (lower === "blue") return "blue";

    // currentColor (canvas usually does NOT resolve it)
    if (v === "currentColor") return previous;

    // Unknown / invalid: do not change (simulates browser staying on previous fillStyle)
    return previous;
}

function pixelFromFillStyle(fillStyle) {
    // normalize for comparisons
    const v = fillStyle.trim().toLowerCase();

    if (v === "black" || v === "#000000" || v === "#000") return [0, 0, 0, 255];
    if (v === "white" || v === "#ffffff" || v === "#fff") return [255, 255, 255, 255];
    if (v === "red" || v === "#ff0000" || v === "#f00") return [255, 0, 0, 255];
    if (v === "blue" || v === "#0000ff" || v === "#00f") return [0, 0, 255, 255];
    if (v === "#00ff88") return [0, 255, 136, 255];

    const rgb = v.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (rgb) return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3]), 255];

    const rgba = v.match(/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*(0|1|0?\.\d+)\)$/);
    if (rgba) {
        const a = Math.round(Number(rgba[4]) * 255);
        return [Number(rgba[1]), Number(rgba[2]), Number(rgba[3]), a];
    }

    return [0, 0, 0, 255];
}

beforeAll(() => {
    Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
        configurable: true,
        value: function () {
            let currentFillStyle = "#000000"; // what ctx.fillStyle returns
            let lastPaintedFillStyle = "#000000"; // what fillRect "paints"

            return {
                clearRect() { },
                fillRect() {
                    lastPaintedFillStyle = currentFillStyle;
                },
                getImageData() {
                    const [r, g, b, a] = pixelFromFillStyle(lastPaintedFillStyle);
                    return { data: new Uint8ClampedArray([r, g, b, a]) };
                },
                get fillStyle() {
                    return currentFillStyle;
                },
                set fillStyle(next) {
                    currentFillStyle = normalizeFillStyleOrKeep(currentFillStyle, String(next));
                }
            };
        }
    });
});

describe("color-utils", () => {
    beforeEach(() => {
        document.body.innerHTML = "";
    });

    describe("colorToRgba", () => {
        it("throws on empty input", () => {
            expect(() => colorToRgba("")).toThrow(/inputColor must be a non-empty string/i);
            expect(() => colorToRgba("   ")).toThrow(/inputColor must be a non-empty string/i);
        });

        it('parses "transparent" as alpha 0', () => {
            expectRgbaClose(colorToRgba("transparent"), { red: 0, green: 0, blue: 0, alpha: 0 });
            expectRgbaClose(colorToRgba(" Transparent "), { red: 0, green: 0, blue: 0, alpha: 0 });
        });

        it("parses hex colors (#rgb and #rrggbb)", () => {
            expectRgbaClose(colorToRgba("#f00"), { red: 255, green: 0, blue: 0, alpha: 1 });
            expectRgbaClose(colorToRgba("#00ff88"), { red: 0, green: 255, blue: 136, alpha: 1 });
        });

        it("parses rgb() and rgba()", () => {
            expectRgbaClose(colorToRgba("rgb(0, 128, 255)"), { red: 0, green: 128, blue: 255, alpha: 1 });

            const rgba = colorToRgba("rgba(10, 20, 30, 0.5)");
            expect(rgba.red).toBe(10);
            expect(rgba.green).toBe(20);
            expect(rgba.blue).toBe(30);
            expect(Math.abs(rgba.alpha - 0.5)).toBeLessThanOrEqual(1 / 255);
        });

        it("parses named colors", () => {
            expectRgbaClose(colorToRgba("red"), { red: 255, green: 0, blue: 0, alpha: 1 });
            expectRgbaClose(colorToRgba("black"), { red: 0, green: 0, blue: 0, alpha: 1 });
            expectRgbaClose(colorToRgba("white"), { red: 255, green: 255, blue: 255, alpha: 1 });
            expectRgbaClose(colorToRgba("blue"), { red: 0, green: 0, blue: 255, alpha: 1 });
        });

        it("throws on invalid/unsupported colors (except black-like strings)", () => {
            expect(() => colorToRgba("not-a-color")).toThrow(/unsupported or invalid color/i);
            expect(() => colorToRgba("rgb(999, 0, 0)")).toThrow(/unsupported or invalid color/i);
        });

        it('supports "currentColor" when a reference element is provided', () => {
            const el = document.createElement("div");
            el.style.color = "rgb(12, 34, 56)";
            document.body.appendChild(el);

            const rgba = colorToRgba("currentColor", el);
            expect(rgba.red).toBe(12);
            expect(rgba.green).toBe(34);
            expect(rgba.blue).toBe(56);
            expect(Math.abs(rgba.alpha - 1)).toBeLessThanOrEqual(1 / 255);
        });

        it('keeps "currentColor" unresolved without a reference element (throws in this environment)', () => {
            expect(() => colorToRgba("currentColor")).toThrow(/unsupported or invalid color/i);
        });
    });

    describe("colorsToRgba", () => {
        it("throws on empty array", () => {
            expect(() => colorsToRgba([])).toThrow(/colors must be a non-empty array/i);
            expect(() => colorsToRgba(null)).toThrow(/colors must be a non-empty array/i);
        });

        it("converts an array of colors preserving order", () => {
            const out = colorsToRgba(["#f00", "rgba(0, 255, 0, 0.25)", "blue"]);
            expect(out).toHaveLength(3);

            expectRgbaClose(out[0], { red: 255, green: 0, blue: 0, alpha: 1 });

            expect(out[1].red).toBe(0);
            expect(out[1].green).toBe(255);
            expect(out[1].blue).toBe(0);
            expect(Math.abs(out[1].alpha - 0.25)).toBeLessThanOrEqual(1 / 255);

            expectRgbaClose(out[2], { red: 0, green: 0, blue: 255, alpha: 1 });
        });
    });

    describe("rgbaToCssRgba", () => {
        it("clamps channels to byte range and alpha to [0,1]", () => {
            const css = rgbaToCssRgba({ red: -10, green: 300, blue: 127.6, alpha: 2 });
            expect(css).toBe("rgba(0, 255, 128, 1)");
        });

        it("rounds alpha to the requested decimals", () => {
            const css = rgbaToCssRgba({ red: 1, green: 2, blue: 3, alpha: 0.123456 }, 3);
            expect(css).toBe("rgba(1, 2, 3, 0.123)");
        });
    });

    describe("rgbaToCss", () => {
        it("returns hex when alpha >= 1", () => {
            expect(rgbaToCss({ red: 255, green: 0, blue: 136, alpha: 1 })).toBe("#ff0088");
            expect(rgbaToCss({ red: 1, green: 2, blue: 3, alpha: 5 })).toBe("#010203");
        });

        it("returns rgba() when alpha < 1", () => {
            expect(rgbaToCss({ red: 255, green: 0, blue: 0, alpha: 0.5 }, 2)).toBe("rgba(255, 0, 0, 0.5)");
        });
    });
});

describe("srgbChannelToLinear", () => {
    it("maps 0 -> 0 and 255 -> 1", () => {
        expect(srgbChannelToLinear(0)).toBe(0);
        expect(srgbChannelToLinear(255)).toBe(1);
    });

    it("clamps input outside [0,255]", () => {
        expect(srgbChannelToLinear(-10)).toBe(0);
        expect(srgbChannelToLinear(300)).toBe(1);
    });

    it("converts a known mid value close to expected (128)", () => {
        // sRGB 0.5 -> linear approx 0.2140...
        const v = srgbChannelToLinear(128);
        expect(Math.abs(v - 0.2140)).toBeLessThanOrEqual(0.002);
    });
});

describe("linearChannelToSrgb", () => {
    it("maps 0 -> 0 and 1 -> 255", () => {
        expect(linearChannelToSrgb(0)).toBe(0);
        expect(linearChannelToSrgb(1)).toBe(255);
    });

    it("clamps input outside [0,1]", () => {
        expect(linearChannelToSrgb(-0.5)).toBe(0);
        expect(linearChannelToSrgb(2)).toBe(255);
    });

    it("round-trips common byte values within 1 unit", () => {
        const samples = [0, 1, 2, 10, 64, 128, 200, 254, 255];
        for (const b of samples) {
            const lin = srgbChannelToLinear(b);
            const back = linearChannelToSrgb(lin);
            expect(Math.abs(back - b)).toBeLessThanOrEqual(1);
        }
    });
});

describe("interpolateRgbaColor", () => {
    it("clamps t below 0 and above 1", () => {
        const from = { red: 0, green: 0, blue: 0, alpha: 0 };
        const to = { red: 255, green: 255, blue: 255, alpha: 1 };

        expect(interpolateRgbaColor(from, to, -1, "srgb")).toEqual(from);
        expect(interpolateRgbaColor(from, to, 2, "srgb")).toEqual(to);
    });

    it("interpolates in sRGB space directly", () => {
        const from = { red: 0, green: 0, blue: 0, alpha: 0 };
        const to = { red: 255, green: 255, blue: 255, alpha: 1 };

        const mid = interpolateRgbaColor(from, to, 0.5, "srgb");
        expect(mid.red).toBeCloseTo(127.5, 8);
        expect(mid.green).toBeCloseTo(127.5, 8);
        expect(mid.blue).toBeCloseTo(127.5, 8);
        expect(Math.abs(mid.alpha - 0.5)).toBeLessThanOrEqual(1 / 255);
    });

    it("interpolates in linear RGB space and differs from sRGB midpoint", () => {
        const from = { red: 0, green: 0, blue: 0, alpha: 1 };
        const to = { red: 255, green: 255, blue: 255, alpha: 1 };

        const midSrgb = interpolateRgbaColor(from, to, 0.5, "srgb");
        const midLinear = interpolateRgbaColor(from, to, 0.5, "linearRGB");

        // LinearRGB midpoint is perceptually brighter than 127.5 in sRGB byte space.
        expect(midLinear.red).toBeGreaterThan(midSrgb.red);
        expect(midLinear.green).toBeGreaterThan(midSrgb.green);
        expect(midLinear.blue).toBeGreaterThan(midSrgb.blue);

        // Sanity range: should be around ~188 (common expected value for linear midpoint)
        expect(midLinear.red).toBeGreaterThanOrEqual(180);
        expect(midLinear.red).toBeLessThanOrEqual(195);
    });

    it("interpolates alpha linearly in both modes", () => {
        const from = { red: 10, green: 20, blue: 30, alpha: 0.25 };
        const to = { red: 200, green: 210, blue: 220, alpha: 0.75 };

        const midSrgb = interpolateRgbaColor(from, to, 0.5, "srgb");
        const midLinear = interpolateRgbaColor(from, to, 0.5, "linearRGB");

        expect(Math.abs(midSrgb.alpha - 0.5)).toBeLessThanOrEqual(1 / 255);
        expect(Math.abs(midLinear.alpha - 0.5)).toBeLessThanOrEqual(1 / 255);
    });
});

describe("interpolateCssColors", () => {
    it("returns a hex string when both endpoints are opaque", () => {
        const out = interpolateCssColors("#000000", "#ffffff", 0.5, "srgb");
        expect(out).toMatch(/^#[0-9a-f]{6}$/);
    });

    it("returns rgba() when any endpoint has alpha < 1", () => {
        const out = interpolateCssColors("rgba(0, 0, 0, 0.0)", "rgba(255, 0, 0, 1)", 0.5, "srgb");
        expect(out).toMatch(/^rgba\(/i);
    });

    it('supports "currentColor" with a reference element', () => {
        const el = document.createElement("div");
        el.style.color = "rgb(12, 34, 56)";
        document.body.appendChild(el);

        const out = interpolateCssColors("currentColor", "white", 0, "srgb", el);
        expect(out).toBe("#0c2238");
    });

    it("differs between srgb and linearRGB for the same endpoints at mid t", () => {
        const srgb = interpolateCssColors("black", "white", 0.5, "srgb");
        const linear = interpolateCssColors("black", "white", 0.5, "linearRGB");
        expect(srgb).not.toBe(linear);
    });
});