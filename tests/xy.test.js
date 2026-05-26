import { describe, test, expect, vi } from 'vitest';
import util, {
    canShowValue,
    fillArray,
    groupBy,
    isCoordinatePoint,
    isObjectivelyDifferentIndex,
    memoizeByArrayRef,
    normalizeRange,
    safeDiv,
    safeInt,
} from '../src/utils/xy';

describe('canShowValue', () => {
    test('returns true for finite numbers', () => {
        expect(canShowValue(0)).toBe(true);
        expect(canShowValue(1)).toBe(true);
        expect(canShowValue(-1)).toBe(true);
        expect(canShowValue(12.34)).toBe(true);
    });

    test('returns true for non-number values not explicitly excluded', () => {
        expect(canShowValue('1')).toBe(true);
        expect(canShowValue('')).toBe(true);
        expect(canShowValue(false)).toBe(true);
        expect(canShowValue({})).toBe(true);
        expect(canShowValue([])).toBe(true);
    });

    test('returns false for hidden numeric values', () => {
        expect(canShowValue(null)).toBe(false);
        expect(canShowValue(undefined)).toBe(false);
        expect(canShowValue(NaN)).toBe(false);
        expect(canShowValue(Infinity)).toBe(false);
        expect(canShowValue(-Infinity)).toBe(false);
    });
});

describe('fillArray', () => {
    test('returns an array with the requested integer length', () => {
        expect(fillArray(3, [1, 2, 3])).toEqual([1, 2, 3]);
    });

    test('fills missing values with zero', () => {
        expect(fillArray(5, [1, 2])).toEqual([1, 2, 0, 0, 0]);
    });

    test('truncates source values when source is longer than length', () => {
        expect(fillArray(2, [1, 2, 3, 4])).toEqual([1, 2]);
    });

    test('replaces nullish source values with zero', () => {
        expect(fillArray(5, [1, null, undefined, 4, 5])).toEqual([
            1, 0, 0, 4, 5,
        ]);
    });

    test('keeps falsy non-nullish values', () => {
        expect(fillArray(4, [false, '', 0, NaN])).toEqual([false, '', 0, NaN]);
    });

    test('normalizes decimal length by flooring it', () => {
        expect(fillArray(2.9, [1, 2, 3])).toEqual([1, 2]);
    });

    test('normalizes negative length to zero', () => {
        expect(fillArray(-3, [1, 2, 3])).toEqual([]);
    });

    test('normalizes non-finite length to zero', () => {
        expect(fillArray(NaN, [1, 2, 3])).toEqual([]);
        expect(fillArray(Infinity, [1, 2, 3])).toEqual([]);
        expect(fillArray(-Infinity, [1, 2, 3])).toEqual([]);
    });
});

describe('groupBy', () => {
    test('groups array items by string key', () => {
        const input = [
            { type: 'a', value: 1 },
            { type: 'b', value: 2 },
            { type: 'a', value: 3 },
        ];

        expect(groupBy(input, (item) => item.type)).toEqual({
            a: [input[0], input[2]],
            b: [input[1]],
        });
    });

    test('converts numeric keys to strings', () => {
        const input = [{ id: 1 }, { id: 2 }, { id: 1 }];
        const result = groupBy(input, (item) => item.id);
        expect(result['1']).toEqual([input[0], input[2]]);
        expect(result['2']).toEqual([input[1]]);
    });

    test('converts nullish keys to strings', () => {
        const input = [{ id: null }, { id: undefined }, { id: null }];
        expect(groupBy(input, (item) => item.id)).toEqual({
            null: [input[0], input[2]],
            undefined: [input[1]],
        });
    });

    test('returns an object without prototype', () => {
        const result = groupBy([], (item) => item);
        expect(Object.getPrototypeOf(result)).toBe(null);
    });

    test('handles dangerous object keys safely', () => {
        const input = [
            { key: '__proto__', value: 1 },
            { key: 'constructor', value: 2 },
        ];
        const result = groupBy(input, (item) => item.key);
        expect(result.__proto__).toEqual([input[0]]);
        expect(result.constructor).toEqual([input[1]]);
    });

    test('preserves item references', () => {
        const item = { type: 'a' };
        const result = groupBy([item], (value) => value.type);
        expect(result.a[0]).toBe(item);
    });
});

describe('isCoordinatePoint', () => {
    test('returns true for finite numeric x and y values', () => {
        expect(isCoordinatePoint({ x: 0, y: 0 })).toBe(true);
        expect(isCoordinatePoint({ x: 10, y: -20 })).toBe(true);
        expect(isCoordinatePoint({ x: '10', y: '20' })).toBe(true);
    });

    test('returns true for values coercible to finite numbers', () => {
        expect(isCoordinatePoint({ x: '', y: false })).toBe(true);
        expect(isCoordinatePoint({ x: null, y: true })).toBe(true);
    });

    test('returns false when point is not an object', () => {
        expect(isCoordinatePoint(null)).toBeFalsy();
        expect(isCoordinatePoint(undefined)).toBeFalsy();
        expect(isCoordinatePoint(1)).toBe(false);
        expect(isCoordinatePoint('point')).toBe(false);
    });

    test('returns false when x or y is missing or not finite', () => {
        expect(isCoordinatePoint({ x: 1 })).toBe(false);
        expect(isCoordinatePoint({ y: 1 })).toBe(false);
        expect(isCoordinatePoint({ x: NaN, y: 1 })).toBe(false);
        expect(isCoordinatePoint({ x: 1, y: NaN })).toBe(false);
        expect(isCoordinatePoint({ x: Infinity, y: 1 })).toBe(false);
        expect(isCoordinatePoint({ x: 1, y: -Infinity })).toBe(false);
        expect(isCoordinatePoint({ x: 'abc', y: 1 })).toBe(false);
    });
});

describe('isObjectivelyDifferentIndex', () => {
    test('returns true for different finite numeric values', () => {
        expect(isObjectivelyDifferentIndex(1, 2)).toBe(true);
        expect(isObjectivelyDifferentIndex('1', '2')).toBe(true);
        expect(isObjectivelyDifferentIndex(-1, 1)).toBe(true);
    });

    test('returns false for equivalent finite numeric values', () => {
        expect(isObjectivelyDifferentIndex(1, 1)).toBe(false);
        expect(isObjectivelyDifferentIndex('1', 1)).toBe(false);
        expect(isObjectivelyDifferentIndex(1.2, '1.2')).toBe(false);
    });

    test('uses Object.is after numeric conversion', () => {
        expect(isObjectivelyDifferentIndex(0, -0)).toBe(true);
        expect(isObjectivelyDifferentIndex(-0, 0)).toBe(true);
    });

    test('returns false when either value is not finite after conversion', () => {
        expect(isObjectivelyDifferentIndex(NaN, 1)).toBe(false);
        expect(isObjectivelyDifferentIndex(1, NaN)).toBe(false);
        expect(isObjectivelyDifferentIndex(Infinity, 1)).toBe(false);
        expect(isObjectivelyDifferentIndex(1, -Infinity)).toBe(false);
        expect(isObjectivelyDifferentIndex('abc', 1)).toBe(false);
        expect(isObjectivelyDifferentIndex(undefined, 1)).toBe(false);
    });
});

describe('memoizeByArrayRef', () => {
    test('memoizes results by array reference and rest arguments', () => {
        const fn = vi.fn(
            (arr, multiplier) =>
                arr.reduce((sum, value) => sum + value, 0) * multiplier,
        );
        const memoized = memoizeByArrayRef(fn);
        const array = [1, 2, 3];

        expect(memoized(array, 2)).toBe(12);
        expect(memoized(array, 2)).toBe(12);
        expect(fn).toHaveBeenCalledTimes(1);
    });

    test('does not reuse cache for a different array reference', () => {
        const fn = vi.fn((arr) => arr.length);
        const memoized = memoizeByArrayRef(fn);

        expect(memoized([1, 2])).toBe(2);
        expect(memoized([1, 2])).toBe(2);
        expect(fn).toHaveBeenCalledTimes(2);
    });

    test('uses rest arguments as part of the cache key', () => {
        const fn = vi.fn((arr, value) => arr.length + value);
        const memoized = memoizeByArrayRef(fn);
        const array = [1, 2];
        expect(memoized(array, 1)).toBe(3);
        expect(memoized(array, 2)).toBe(4);
        expect(memoized(array, 1)).toBe(3);
        expect(fn).toHaveBeenCalledTimes(2);
    });

    test('memoizes object results by reference', () => {
        const fn = vi.fn((arr) => ({ total: arr.length }));
        const memoized = memoizeByArrayRef(fn);
        const array = [1, 2, 3];
        const first = memoized(array);
        const second = memoized(array);
        expect(first).toBe(second);
        expect(fn).toHaveBeenCalledTimes(1);
    });

    test('throws when first argument cannot be used as a WeakMap key', () => {
        const fn = vi.fn();
        const memoized = memoizeByArrayRef(fn);
        expect(() => memoized(null)).toThrow();
        expect(() => memoized(undefined)).toThrow();
        expect(() => memoized(1)).toThrow();
    });
});

describe('normalizeRange', () => {
    test('returns min and max when values are finite and ordered', () => {
        expect(normalizeRange(1, 10)).toEqual({ min: 1, max: 10 });
    });

    test('swaps min and max when min is greater than max', () => {
        expect(normalizeRange(10, 1)).toEqual({ min: 1, max: 10 });
    });

    test('expands range when min equals max', () => {
        expect(normalizeRange(5, 5)).toEqual({ min: 5, max: 6 });
    });

    test('uses fallback values for non-finite inputs', () => {
        expect(normalizeRange(NaN, 10)).toEqual({ min: 0, max: 10 });
        expect(normalizeRange(1, NaN)).toEqual({ min: 1, max: 2 });
        expect(normalizeRange(NaN, NaN)).toEqual({ min: 0, max: 1 });
        expect(normalizeRange(Infinity, -Infinity)).toEqual({ min: 0, max: 1 });
    });

    test('can swap fallback-normalized values', () => {
        expect(normalizeRange(NaN, -5)).toEqual({ min: -5, max: 0 });
    });
});

describe('safeDiv', () => {
    test('divides finite numbers when denominator is safely above epsilon', () => {
        expect(safeDiv(10, 2)).toBe(5);
        expect(safeDiv(-10, 2)).toBe(-5);
        expect(safeDiv(10, -2)).toBe(-5);
    });

    test('returns fallback when numerator is not finite', () => {
        expect(safeDiv(NaN, 2)).toBe(0);
        expect(safeDiv(Infinity, 2)).toBe(0);
        expect(safeDiv(-Infinity, 2)).toBe(0);
        expect(safeDiv(NaN, 2, 99)).toBe(99);
    });

    test('returns fallback when denominator is not finite', () => {
        expect(safeDiv(10, NaN)).toBe(0);
        expect(safeDiv(10, Infinity)).toBe(0);
        expect(safeDiv(10, -Infinity)).toBe(0);
        expect(safeDiv(10, NaN, 99)).toBe(99);
    });

    test('returns fallback when denominator is zero or too close to zero', () => {
        expect(safeDiv(10, 0)).toBe(0);
        expect(safeDiv(10, -0)).toBe(0);
        expect(safeDiv(10, 1e-10)).toBe(0);
        expect(safeDiv(10, -1e-10)).toBe(0);
        expect(safeDiv(10, 1e-10, 99)).toBe(99);
    });

    test('uses strict epsilon comparison', () => {
        expect(safeDiv(10, 1e-9)).toBe(0);
        expect(safeDiv(10, 1.000000001e-9)).toBeCloseTo(9999999990);
    });
});

describe('safeInt', () => {
    test('returns floored positive finite integers', () => {
        expect(safeInt(3)).toBe(3);
        expect(safeInt(3.9)).toBe(3);
        expect(safeInt(0.9)).toBe(0);
    });

    test('returns zero for negative finite values', () => {
        expect(safeInt(-1)).toBe(0);
        expect(safeInt(-1.9)).toBe(0);
    });

    test('returns zero for non-finite values', () => {
        [NaN, Infinity, -Infinity].forEach((candidate) => {
            expect(safeInt(candidate)).toBe(0);
        });
    });

    test('returns zero for non-number values', () => {
        ['3', null, undefined, {}, []].forEach((candidate) => {
            expect(safeInt(candidate)).toBe(0);
        });
    });
});

describe('default util export', () => {
    test('contains all named utility functions', () => {
        expect(util).toEqual({
            canShowValue,
            fillArray,
            groupBy,
            isCoordinatePoint,
            isObjectivelyDifferentIndex,
            memoizeByArrayRef,
            normalizeRange,
            safeDiv,
            safeInt,
        });
    });
});
