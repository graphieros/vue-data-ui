// @vitest-environment jsdom

import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock only the canvas-dependent color parsing.
vi.mock("../color-utils", () => {
    const Red = { red: 255, green: 0, blue: 0, alpha: 1 };
    const Blue = { red: 0, green: 0, blue: 255, alpha: 1 };

    return {
        colorsToRgba: (colors) => {
            if (colors.length <= 1) return [Red];
            const out = new Array(colors.length);
            for (let i = 0; i < colors.length; i += 1) out[i] = i === colors.length - 1 ? Blue : Red;
            return out;
        },
    };
});

function installSvgPathElementPolyfill(totalLengthValue = 100) {
    // SvgPathGradient only needs createElementNS("path") & getTotalLength/getPointAtLength.
    if (!(globalThis).SVGPathElement) {
        class SVGPathElementPolyfill extends (globalThis).SVGElement { }
        (globalThis).SVGPathElement = SVGPathElementPolyfill;
    }

    // Ensure created <path> nodes get geometry methods.
    const proto = (globalThis).SVGPathElement.prototype;

    Object.defineProperty(proto, "getTotalLength", {
        configurable: true,
        value: function () {
            return totalLengthValue;
        },
    });

    Object.defineProperty(proto, "getPointAtLength", {
        configurable: true,
        value: function (len) {
            return { x: len, y: 0 };
        },
    });

    // Ensure document.createElementNS returns instances whose prototype chain includes SVGPathElement.prototype.
    // Some jsdom builds return generic SVGElement instances for <path>.
    const originalCreateElementNS = document.createElementNS.bind(document);

    vi.spyOn(document, "createElementNS").mockImplementation(
        (
            namespace,
            qualifiedName,
            options
        ) => {
            const el = originalCreateElementNS(namespace, qualifiedName, options);

            if (
                namespace === "http://www.w3.org/2000/svg" &&
                qualifiedName.toLowerCase() === "path"
            ) {
                const desiredProto = (globalThis).SVGPathElement.prototype;
                const currentProto = Object.getPrototypeOf(el);

                if (currentProto !== desiredProto) {
                    try {
                        Object.setPrototypeOf(el, desiredProto);
                    } catch {
                        (el).getTotalLength =
                            desiredProto.getTotalLength?.bind(el);
                        (el).getPointAtLength =
                            desiredProto.getPointAtLength?.bind(el);
                    }
                }
            }

            return el;
        }
    );
}

async function loadSvgPathGradient() {
    vi.resetModules();
    const mod = await import("../index");
    return mod.SvgPathGradient;
}

describe("SvgPathGradient (only public function behavior)", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        document.body.innerHTML = "";
        installSvgPathElementPolyfill(100);
    });

    it("throws when pathData is empty or not a string", async () => {
        const SvgPathGradient = await loadSvgPathGradient();

        expect(() => SvgPathGradient("", ["#f00"])).toThrow(/pathData must be a non-empty string/i);
        expect(() => SvgPathGradient(null, ["#f00"])).toThrow(/pathData must be a non-empty string/i);
    });

    it("throws when colors is empty or not an array", async () => {
        const SvgPathGradient = await loadSvgPathGradient();

        expect(() => SvgPathGradient("M 0 0 L 10 0", [])).toThrow(/colors must be a non-empty array/i);
        expect(() => SvgPathGradient("M 0 0 L 10 0", null)).toThrow(/colors must be a non-empty array/i);
    });

    it("returns a <g> string by default (string mode)", async () => {
        const SvgPathGradient = await loadSvgPathGradient();

        const out = SvgPathGradient("M 0 0 L 10 0", ["#f00", "#00f"], {
            segments: 2,
            overlap: 0,
            attrs: { "stroke-width": "12" },
            groupAttrs: { id: "test-group" },
            decimalPlaces: 0,
            flattenTolerance: 10,
        });

        expect(typeof out).toBe("string");
        expect(out).toMatch(/^<g\b/);
        expect(out).toContain(`data-svg-path-gradient="true"`);
        expect(out).toContain(`id="test-group"`);
        expect(out).toContain(`<path `);
    });

    it("returns DOM output in dom mode with a group and segments", async () => {
        const SvgPathGradient = await loadSvgPathGradient();

        const out = SvgPathGradient("M 0 0 L 10 0", ["#f00", "#00f"], {
            returnMode: "dom",
            segments: 2,
            overlap: 0,
            attrs: { "stroke-width": "12", "stroke-linecap": "round" },
            groupAttrs: { id: "dom-group" },
            decimalPlaces: 0,
            flattenTolerance: 10,
        });

        expect(typeof out).toBe("object");

        const dom = out;
        expect(dom.group).toBeInstanceOf(SVGGElement);
        expect(dom.group.getAttribute("data-svg-path-gradient")).toBe("true");
        expect(dom.group.getAttribute("id")).toBe("dom-group");

        expect(dom.segments.length).toBe(2);
        expect(dom.group.querySelectorAll("path").length).toBe(2);

        expect(dom.segments[0].getAttribute("stroke-width")).toBe("12");
        expect(dom.segments[0].getAttribute("stroke-linecap")).toBe("round");
    });

    it("when total length is non-positive, returns a single segment representing the original path (string mode)", async () => {
        // Override geometry to simulate zero-length path.
        vi.restoreAllMocks();
        document.body.innerHTML = "";
        installSvgPathElementPolyfill(0);

        const SvgPathGradient = await loadSvgPathGradient();

        const out = SvgPathGradient("M 0 0 L 10 0", ["#f00", "#00f"], {
            groupAttrs: { id: "zero-length" },
        });

        expect(out).toContain(`id="zero-length"`);
        const paths = out.match(/<path\b/g) ?? [];
        expect(paths.length).toBe(1);
        expect(out).toContain(`d="M 0 0 L 10 0"`);
    });

    it("when total length is non-positive, returns a single segment representing the original path (dom mode)", async () => {
        vi.restoreAllMocks();
        document.body.innerHTML = "";
        installSvgPathElementPolyfill(0);

        const SvgPathGradient = await loadSvgPathGradient();

        const out = SvgPathGradient("M 0 0 L 10 0", ["#f00", "#00f"], {
            returnMode: "dom",
            groupAttrs: { id: "zero-length-dom" },
            attrs: { "stroke-width": "3" },
        });

        const dom = out;
        expect(dom.group.getAttribute("id")).toBe("zero-length-dom");
        expect(dom.segments.length).toBe(1);
        expect(dom.segments[0].getAttribute("d")).toBe("M 0 0 L 10 0");
        expect(dom.segments[0].getAttribute("stroke-width")).toBe("3");
    });

    it("when only one color is provided, returns a single path (string mode)", async () => {
        const SvgPathGradient = await loadSvgPathGradient();

        const out = SvgPathGradient("M 0 0 L 10 0", ["#f00"], {
            segments: 10,
            groupAttrs: { id: "single-color" },
        });

        const paths = out.match(/<path\b/g) ?? [];
        expect(paths.length).toBe(1);
        expect(out).toContain(`id="single-color"`);
    });

    it("produces the requested number of segments when options.segments is provided (string mode)", async () => {
        const SvgPathGradient = await loadSvgPathGradient();

        const out = SvgPathGradient("M 0 0 L 100 0", ["#f00", "#00f"], {
            segments: 5,
            overlap: 0,
            flattenTolerance: 10,
            decimalPlaces: 0,
        });

        const paths = out.match(/<path\b/g) ?? [];
        expect(paths.length).toBe(5);
    });

    it("in string mode: excludes user-provided stroke from attrs (stroke is overridden per segment)", async () => {
        const SvgPathGradient = await loadSvgPathGradient();

        const out = SvgPathGradient("M 0 0 L 100 0", ["#f00", "#00f"], {
            segments: 2,
            overlap: 0,
            attrs: {
                stroke: "hotpink",
                "stroke-width": "10",
                fill: "none",
            },
            flattenTolerance: 10,
            decimalPlaces: 0,
        });

        expect(out).toMatch(/stroke="/);
        expect(out).not.toContain(`stroke="hotpink"`);
        expect(out).toContain(`stroke-width="10"`);
    });

    it("in dom mode: segments have different stroke values along the path (basic gradient behavior)", async () => {
        const SvgPathGradient = await loadSvgPathGradient();

        const out = SvgPathGradient("M 0 0 L 100 0", ["#f00", "#00f"], {
            returnMode: "dom",
            segments: 2,
            overlap: 0,
            flattenTolerance: 10,
            decimalPlaces: 0,
        });

        const dom = out;

        const stroke0 = dom.segments[0].getAttribute("stroke");
        const stroke1 = dom.segments[1].getAttribute("stroke");

        expect(stroke0).toBeTruthy();
        expect(stroke1).toBeTruthy();
        expect(stroke0).not.toBe(stroke1);
    });
});
