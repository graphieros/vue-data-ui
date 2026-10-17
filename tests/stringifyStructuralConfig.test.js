import { describe, expect, test } from 'vitest';
import { reactive, ref } from 'vue';
import { stringifyChartConfig, stringifyStyleConfig } from '../src/lib';

describe.each([
    ['chart', stringifyChartConfig],
    ['style', stringifyStyleConfig],
])('%s structural config serialization', (level, stringify) => {
    test('excludes only the original tooltip path', () => {
        const input = {
            tooltip: { root: true },
            style: {
                tooltip: { style: true },
                chart: { tooltip: { chart: true }, width: 400 },
            },
        };
        const result = JSON.parse(stringify(input));
        expect(result.tooltip).toEqual({ root: true });
        if (level === 'chart') {
            expect(result.style.chart).toEqual({ width: 400 });
            expect(result.style.tooltip).toEqual({ style: true });
        } else {
            expect(result.style).not.toHaveProperty('tooltip');
            expect(result.style.chart.tooltip).toEqual({ chart: true });
        }
        expect(input.style.tooltip).toEqual({ style: true });
        expect(input.style.chart.tooltip).toEqual({ chart: true });
    });

    test('ignores tooltip edits but detects structural changes', () => {
        const input = { style: { chart: { width: 400 } } };
        const target = level === 'chart' ? input.style.chart : input.style;
        target.tooltip = { show: true };
        const initial = stringify(input);
        target.tooltip.show = false;
        expect(stringify(input)).toBe(initial);
        input.style.chart.width = 800;
        expect(stringify(input)).not.toBe(initial);
    });

    test('accepts frozen input without mutating it', () => {
        const tooltip = Object.freeze({ show: true });
        const chart = Object.freeze({ tooltip, width: 400 });
        const style = Object.freeze({ tooltip, chart });
        const input = Object.freeze({ style });
        expect(() => stringify(input)).not.toThrow();
        expect(input.style.tooltip).toBe(tooltip);
        expect(input.style.chart.tooltip).toBe(tooltip);
    });

    test('handles Vue reactive objects and nested refs', () => {
        const input = reactive({ style: { chart: { width: ref(400) } } });
        expect(JSON.parse(stringify(ref(input)))).toEqual({
            style: { chart: { width: 400 } },
        });
        input.style.chart.width = 800;
        expect(JSON.parse(stringify(input)).style.chart.width).toBe(800);
    });

    test('preserves JSON handling of callbacks, dates, nulls, and undefined', () => {
        const date = new Date('2026-01-01T00:00:00.000Z');
        const input = {
            formatter: () => 'formatted',
            date,
            missing: undefined,
            nullable: null,
            values: [undefined, NaN, Infinity],
        };
        expect(stringify(input)).toBe(JSON.stringify(input));
        expect(input.date).toBe(date);
    });

    test.each([
        undefined,
        null,
        {},
        { style: null },
        { style: { chart: null } },
    ])('accepts incomplete config %j', (input) => {
        expect(stringify(input)).toBe(JSON.stringify(input));
    });

    test('preserves failures for unsupported JSON values', () => {
        const circular = {};
        circular.self = circular;
        expect(() => stringify(circular)).toThrow(TypeError);
        expect(() => stringify({ value: 1n })).toThrow(TypeError);
    });

    test('can exclude a tooltip containing a circular reference', () => {
        const input = { style: { chart: { width: 400 } } };
        const target = level === 'chart' ? input.style.chart : input.style;
        target.tooltip = input;
        expect(stringify(input)).toBe('{"style":{"chart":{"width":400}}}');
        expect(target.tooltip).toBe(input);
    });
});
