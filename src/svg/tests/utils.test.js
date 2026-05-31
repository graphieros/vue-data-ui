import { describe, expect, test } from 'vitest';
import {
    safeNumber,
    safeArray,
    isFiniteNumber,
    element,
    emptyElement,
    textElement,
    getSupportedShape,
    renderShape,
    getConfigValue,
    estimateTextWidth,
} from '../utils';

describe('safeNumber', () => {
    test('returns a valid number', () => {
        expect(safeNumber('42')).toBe(42);
        expect(safeNumber(12.5)).toBe(12.5);
    });

    test('returns fallback for invalid values', () => {
        expect(safeNumber(undefined, 10)).toBe(10);
        expect(safeNumber('abc', 10)).toBe(10);
        expect(safeNumber(NaN, 10)).toBe(10);
    });

    test('coerces null to zero', () => {
        expect(safeNumber(null, 10)).toBe(0);
    });
});

describe('safeArray', () => {
    test('returns the array when value is an array', () => {
        const array = [1, 2, 3];

        expect(safeArray(array)).toBe(array);
    });

    test('returns an empty array for non-array values', () => {
        expect(safeArray(null)).toEqual([]);
        expect(safeArray(undefined)).toEqual([]);
        expect(safeArray({})).toEqual([]);
        expect(safeArray('test')).toEqual([]);
    });
});

describe('isFiniteNumber', () => {
    test('returns true for finite numeric values', () => {
        expect(isFiniteNumber(10)).toBe(true);
        expect(isFiniteNumber('10')).toBe(true);
        expect(isFiniteNumber(10.5)).toBe(true);
    });

    test('returns false for invalid values', () => {
        expect(isFiniteNumber(undefined)).toBe(false);
        expect(isFiniteNumber(NaN)).toBe(false);
        expect(isFiniteNumber('abc')).toBe(false);
        expect(isFiniteNumber(Infinity)).toBe(false);
    });

    test('returns true for null because Number(null) is zero', () => {
        expect(isFiniteNumber(null)).toBe(true);
    });
});

describe('element', () => {
    test('renders an element with attributes and content', () => {
        expect(
            element(
                'text',
                {
                    x: 10,
                    y: 20,
                },
                'hello',
            ),
        ).toBe('<text x="10" y="20">hello</text>');
    });

    test('renders an element without attributes', () => {
        expect(element('g', {}, 'content')).toBe('<g>content</g>');
    });

    test('ignores null, undefined and false attributes', () => {
        expect(
            element(
                'rect',
                {
                    x: 10,
                    y: null,
                    width: undefined,
                    visible: false,
                },
                '',
            ),
        ).toBe('<rect x="10"></rect>');
    });

    test('escapes attribute values', () => {
        expect(
            element(
                'text',
                {
                    title: '"yodawg"',
                },
                '',
            ),
        ).toContain('&quot;yodawg&quot;');
    });
});

describe('emptyElement', () => {
    test('renders a self-closing element', () => {
        expect(
            emptyElement('circle', {
                cx: 10,
                cy: 20,
            }),
        ).toBe('<circle cx="10" cy="20"/>');
    });

    test('ignores null, undefined and false attributes', () => {
        expect(
            emptyElement('circle', {
                cx: 10,
                cy: null,
                r: undefined,
                visible: false,
            }),
        ).toBe('<circle cx="10"/>');
    });
});

describe('textElement', () => {
    test('renders a text element', () => {
        expect(
            textElement('this was actually typed by hand', {
                x: 10,
            }),
        ).toBe('<text x="10">this was actually typed by hand</text>');
    });

    test('escapes text content', () => {
        expect(textElement('<script>')).toContain('&lt;script&gt;');
    });

    test('renders empty text when value is null', () => {
        expect(textElement(null)).toBe('<text></text>');
    });
});

describe('getSupportedShape', () => {
    test('returns supported shapes', () => {
        expect(getSupportedShape('triangle')).toBe('triangle');
        expect(getSupportedShape('square')).toBe('square');
        expect(getSupportedShape('diamond')).toBe('diamond');
        expect(getSupportedShape('pentagon')).toBe('pentagon');
        expect(getSupportedShape('hexagon')).toBe('hexagon');
        expect(getSupportedShape('star')).toBe('star');
    });

    test('falls back to circle for unsupported shapes', () => {
        expect(getSupportedShape('unknown')).toBe('circle');
        expect(getSupportedShape()).toBe('circle');
    });
});

describe('renderShape', () => {
    test('renders a circle', () => {
        const result = renderShape({
            dataCy: 'shape',
            shape: 'circle',
            plot: { x: 10, y: 20 },
            radius: 5,
            fill: 'red',
            stroke: 'blue',
            strokeWidth: 2,
        });

        expect(result).toContain('<circle');
        expect(result).toContain('cx="10"');
        expect(result).toContain('cy="20"');
        expect(result).toContain('fill="red"');
    });

    test('renders a star', () => {
        const result = renderShape({
            dataCy: 'shape',
            shape: 'star',
            plot: { x: 10, y: 20 },
            radius: 5,
            fill: 'red',
            stroke: 'blue',
            strokeWidth: 2,
        });

        expect(result).toContain('<polygon');
        expect(result).toContain('points=');
    });

    test.each(['triangle', 'square', 'diamond', 'pentagon', 'hexagon'])(
        'renders %s as a path',
        (shape) => {
            const result = renderShape({
                dataCy: 'shape',
                shape,
                plot: { x: 10, y: 20 },
                radius: 5,
                fill: 'red',
                stroke: 'blue',
                strokeWidth: 2,
            });

            expect(result).toContain('<path');
            expect(result).toContain('d=');
        },
    );

    test('uses safe defaults for invalid coordinates', () => {
        const result = renderShape({
            dataCy: 'shape',
            shape: 'circle',
            plot: {},
            radius: undefined,
            fill: 'red',
            stroke: 'blue',
            strokeWidth: 2,
        });

        expect(result).toContain('cx="0"');
        expect(result).toContain('cy="0"');
        expect(result).toContain('r="4"');
    });
});

describe('getConfigValue', () => {
    test('returns nested values', () => {
        const config = {
            chart: {
                title: {
                    text: 'Revenue',
                },
            },
        };

        expect(getConfigValue(config, 'chart.title.text', '')).toBe('Revenue');
    });

    test('returns fallback when path does not exist', () => {
        expect(getConfigValue({}, 'chart.title.text', 'fallback')).toBe(
            'fallback',
        );
    });

    test('returns fallback when source is invalid', () => {
        expect(getConfigValue(null, 'chart.title.text', 'fallback')).toBe(
            'fallback',
        );
    });

    test('returns fallback for null values', () => {
        expect(
            getConfigValue(
                {
                    value: null,
                },
                'value',
                'fallback',
            ),
        ).toBe('fallback');
    });
});

describe('estimateTextWidth', () => {
    test('estimates width from text length and font size', () => {
        expect(estimateTextWidth('abcd', 10)).toBeCloseTo(23.2);
    });

    test('handles empty text', () => {
        expect(estimateTextWidth('', 10)).toBe(0);
    });

    test('handles null values', () => {
        expect(estimateTextWidth(null, 10)).toBe(0);
    });
});
