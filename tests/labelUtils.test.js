import {
    expect,
    test,
    describe,
} from "vitest";

import { 
    buildValuePercentageLabel,
    fillLabel
} from "../src/labelUtils";

describe('buildValuePercentageLabel', () => {
    test ('returns an empty string', () => {
        const expected = '';
        expect(buildValuePercentageLabel({
            val: null,
            percentage: null,
            showVal: false,
            showPercentage: false
        })).toBe(expected);
    });

    test('returns a label with default config when config is omitted', () => {
        const expected = '99 (100%)';
        expect(buildValuePercentageLabel({
            val: '99',
            percentage: '100%',
        })).toBe(expected);
    });

    test('returns value only', () => {
        const expected = '99';
        expect(buildValuePercentageLabel({
            val: '99',
            percentage: null,
            showPercentage: false,
        })).toBe(expected);
    });

    test('returns percentage only', () => {
        const expected = '(100%)';
        expect(buildValuePercentageLabel({
            val: null,
            percentage: '100%',
            showVal: false
        })).toBe(expected);
    });

    test('applies order from config', () => {
        const expected = '(100%) 99';
        expect(buildValuePercentageLabel({
            val: '99',
            percentage: '100%',
            config: {
                showValueFirst: false,
                useValueParens: false,
                usePercentageParens: true
            }
        })).toBe(expected);
    });

    test('applies parens on value', () => {
        const expected = '100% (99)';
        expect(buildValuePercentageLabel({
            val: '99',
            percentage: '100%',
            config: {
                showValueFirst: false,
                useValueParens: true,
                usePercentageParens: false,
            }
        })).toBe(expected);
    });

    test('applies parens on value & percentage', () => {
        const expected = '(100%) (99)';
        expect(buildValuePercentageLabel({
            val: '99',
            percentage: '100%',
            config: {
                showValueFirst: false,
                useValueParens: true,
                usePercentageParens: true,
            }
        })).toBe(expected);
    });
});

describe('fillLabel', () => {
    test('uses default filler', () => {
        const expected = '-----';
        expect(fillLabel({ rounding: 2, num: 12.34567 })).toBe(expected);
    });

    test('applied rounding', () => {
        const expected = '--';
        expect(fillLabel({ rouding: 0, num: 12.34567 })).toBe(expected);
    });

    test('uses custom filler', () => {
        const expected = 'XXXXX';
        expect(fillLabel({ rounding: 2, num: 12.34567, filler: 'X' })).toBe(expected);
    });
});