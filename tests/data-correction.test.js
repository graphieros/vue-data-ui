import { describe, expect, test } from "vitest";
import { applyDataCorrection, movingAverage, smoothing } from "../src/data-correction";

/**
 * Notes:
 * - These functions treat `data` as an array of objects containing a numeric `value` field.
 * - For disabled modes (halfWindow <= 0, tau <= 0) and for short series (length < 3),
 *   the functions return the exact same array reference (`data`) without cloning.
 * - For enabled modes with length >= 3, the functions return a new array and clone
 *   each item (shallow clone via `{ ...d }`), preserving first and last `value`.
 */

function createDataset(values, extra = {}) {
    return values.map((value, index) => ({
        value,
        index,
        ...extra,
    }));
}

function valuesOf(data) {
    return data.map((d) => d.value);
}

function shallowClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

// Computes expected moving average result using the same algorithm,
// but kept local to tests for clarity and to validate multiple properties.
function expectedMovingAverage(data, halfWindow) {
    if (halfWindow <= 0 || data.length < 3) return data;

    const n = data.length;

    const trailing = Array.from({ length: n });
    for (let i = 0; i < n; i += 1) {
        const lo = Math.max(0, i - halfWindow);
        let sum = 0;
        for (let j = lo; j <= i; j += 1) sum += data[j].value;
        trailing[i] = sum / (i - lo + 1);
    }

    const leading = Array.from({ length: n });
    for (let i = 0; i < n; i += 1) {
        const hi = Math.min(n - 1, i + halfWindow);
        let sum = 0;
        for (let j = i; j <= hi; j += 1) sum += data[j].value;
        leading[i] = sum / (hi - i + 1);
    }

    const result = data.map((d) => ({ ...d }));
    for (let i = 1; i < n - 1; i += 1) {
        const t = i / (n - 1);
        result[i].value = (1 - t) * trailing[i] + t * leading[i];
    }

    return result;
}

function expectedSmoothing(data, tau) {
    if (tau <= 0 || data.length < 3) return data;

    const alpha = 1 / (1 + tau);
    const n = data.length;

    const forward = Array.from({ length: n });
    forward[0] = data[0].value;
    for (let i = 1; i < n; i += 1) {
        forward[i] = alpha * data[i].value + (1 - alpha) * forward[i - 1];
    }

    const backward = Array.from({ length: n });
    backward[n - 1] = data[n - 1].value;
    for (let i = n - 2; i >= 0; i -= 1) {
        backward[i] = alpha * data[i].value + (1 - alpha) * backward[i + 1];
    }

    const result = data.map((d) => ({ ...d }));
    for (let i = 1; i < n - 1; i += 1) {
        const t = i / (n - 1);
        result[i].value = (1 - t) * forward[i] + t * backward[i];
    }

    return result;
}

describe("movingAverage", () => {
    test("returns the same array reference when disabled (halfWindow <= 0)", () => {
        const data = createDataset([1, 2, 3, 4, 5], { tag: "x" });
        const originalSnapshot = shallowClone(data);
        const out = movingAverage(data, 0);
        expect(out).toBe(data);
        expect(out).toEqual(originalSnapshot);
    });

    test("returns the same array reference when length < 3 (even if halfWindow > 0)", () => {
        const data = createDataset([10, 20], { tag: "short" });
        const out = movingAverage(data, 2);
        expect(out).toBe(data);
        expect(valuesOf(out)).toEqual([10, 20]);
    });

    test("returns a new array and shallow-cloned items when enabled and length >= 3", () => {
        const data = createDataset([1, 2, 3], { meta: { nested: true } });
        const out = movingAverage(data, 1);
        expect(out).not.toBe(data);
        expect(out).toHaveLength(data.length);
        for (let index = 0; index < data.length; index += 1) {
            expect(out[index]).not.toBe(data[index]);
            expect(out[index]).toEqual(data[index]);
            expect(out[index].meta).toBe(data[index].meta);
        }
    });

    test("preserves first and last points (values unchanged) when enabled", () => {
        const data = createDataset([5, 100, 6, 200, 7]);
        const out = movingAverage(data, 2);

        expect(out[0].value).toBe(5);
        expect(out[out.length - 1].value).toBe(7);
    });

    test("computes blended moving average correctly for a known small example", () => {
        const data = createDataset([1, 2, 3, 4, 5]);
        const out = movingAverage(data, 1);
        expect(valuesOf(out)).toEqual([1, 1.75, 3, 4.25, 5]);
    });

    test("matches an independently computed expected result across different halfWindow values", () => {
        const data = createDataset([3, -1, 4, 1, 5, -9, 2, 6]);
        for (const halfWindow of [1, 2, 3]) {
            const out = movingAverage(data, halfWindow);
            const expected = expectedMovingAverage(data, halfWindow);
            expect(out).not.toBe(data);
            expect(valuesOf(out)).toEqual(valuesOf(expected));
            expect(out).toEqual(expected);
        }
    });

    test("does not mutate the input objects when enabled (original remains identical)", () => {
        const data = createDataset([1, 10, 1, 10, 1], { label: "original" });
        const before = shallowClone(data);
        void movingAverage(data, 2);
        expect(data).toEqual(before);
    });
});

describe("smoothing", () => {
    test("returns the same array reference when disabled (tau <= 0)", () => {
        const data = createDataset([1, 2, 3, 4], { tag: "x" });
        const before = shallowClone(data);

        const out = smoothing(data, 0);

        expect(out).toBe(data);
        expect(out).toEqual(before);
    });

    test("returns the same array reference when length < 3 (even if tau > 0)", () => {
        const data = createDataset([10, 20], { tag: "short" });
        const out = smoothing(data, 10);
        expect(out).toBe(data);
        expect(valuesOf(out)).toEqual([10, 20]);
    });

    test("returns a new array and shallow-cloned items when enabled and length >= 3", () => {
        const data = createDataset([1, 2, 3], { meta: { nested: true } });
        const out = smoothing(data, 2);
        expect(out).not.toBe(data);
        expect(out).toHaveLength(data.length);
        for (let index = 0; index < data.length; index += 1) {
            expect(out[index]).not.toBe(data[index]);
            expect(out[index].meta).toBe(data[index].meta);
        }
    });

    test("preserves first and last points (values unchanged) when enabled", () => {
        const data = createDataset([10, 0, 0, 0, 20]);
        const out = smoothing(data, 3);
        expect(out[0].value).toBe(10);
        expect(out[out.length - 1].value).toBe(20);
    });

    test("computes forward-backward blend correctly for a known small example (tau = 1)", () => {
        const data = createDataset([0, 10, 0]);
        const out = smoothing(data, 1);
        expect(valuesOf(out)).toEqual([0, 5, 0]);
    });

    test("matches an independently computed expected result across different tau values", () => {
        const data = createDataset([3, -1, 4, 1, 5, -9, 2, 6]);
        for (const tau of [0.5, 1, 2, 10]) {
            const out = smoothing(data, tau);
            const expected = expectedSmoothing(data, tau);
            expect(out).not.toBe(data);
            expect(valuesOf(out)).toEqual(valuesOf(expected));
            expect(out).toEqual(expected);
        }
    });

    test("does not mutate the input objects when enabled (original remains identical)", () => {
        const data = createDataset([1, 10, 1, 10, 1], { label: "original" });
        const before = shallowClone(data);
        void smoothing(data, 2);
        expect(data).toEqual(before);
    });
});

describe("applyDataCorrection", () => {
    test("applies movingAverage then smoothing in sequence (matches manual composition)", () => {
        const data = createDataset([1, 2, 100, 3, 4], { tag: "x" });
        const settings = { averageWindow: 1, smoothingTau: 2 };
        const out = applyDataCorrection(data, settings);
        const manual = smoothing(movingAverage(data, settings.averageWindow), settings.smoothingTau);
        expect(out).toEqual(manual);
        expect(valuesOf(out)).toEqual(valuesOf(manual));
    });

    test("returns the original array reference when both operations are disabled", () => {
        const data = createDataset([1, 2, 3, 4, 5]);
        const out = applyDataCorrection(data, { averageWindow: 0, smoothingTau: 0 });
        expect(out).toBe(data);
        expect(valuesOf(out)).toEqual([1, 2, 3, 4, 5]);
    });

    test("returns the original array reference when data length < 3 regardless of settings", () => {
        const data = createDataset([10, 20]);
        const out = applyDataCorrection(data, { averageWindow: 10, smoothingTau: 10 });
        expect(out).toBe(data);
        expect(valuesOf(out)).toEqual([10, 20]);
    });

    test("does not mutate the input data when enabled", () => {
        const data = createDataset([1, 2, 100, 3, 4], { label: "original" });
        const before = shallowClone(data);
        void applyDataCorrection(data, { averageWindow: 2, smoothingTau: 3 });
        expect(data).toEqual(before);
    });

    test("preserves first and last points after full correction when enabled", () => {
        const data = createDataset([9, 0, 5, 0, 1, 0, 7]);
        const out = applyDataCorrection(data, { averageWindow: 2, smoothingTau: 2 });
        expect(out[0].value).toBe(9);
        expect(out[out.length - 1].value).toBe(7);
    });
});