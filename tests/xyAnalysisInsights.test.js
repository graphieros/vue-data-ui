import { describe, expect, it } from 'vitest';
import { analyzeXy, buildXyAnalysisAnnotations } from '../src/utils/xyAnalysis';
import { defaultXyAnalysisOptions } from '../src/utils/xyAnalysisInsights';
import { useConfig } from '../src/useConfig';

const messages = useConfig().vue_ui_xy.analysis;
const area = { left: 0, top: 0, width: 800, bottom: 300 };
function build(values, options, settings = {}) {
    const continuous = settings.continuous || false;
    const dataset = values.map((series, index) => ({
        name: `S${index}`,
        type: 'line',
        series,
    }));
    const results = analyzeXy(dataset, new Set(), continuous);
    const rendered = dataset.map((series, index) => ({
        ...series,
        id: `uniqueId_${index}`,
        analysisUnit: settings.units?.[index] || 'same',
        sourceIndices: series.series.map((_, index) => index),
        series: continuous
            ? series.series.map((point, index) => ({ ...point, index }))
            : series.series,
        plots: series.series.map((point, index) => ({
            sourceIndex: index,
            value: continuous ? point?.y : point,
            x: 40 + index * 80,
            y:
                point === null
                    ? null
                    : 250 - (continuous ? point?.y : point) * 2,
        })),
    }));
    return buildXyAnalysisAnnotations(
        results,
        rendered,
        area,
        { ...messages, ...settings.messages },
        continuous,
        null,
        options,
    );
}

describe('additional XY analysis annotations', () => {
    it('leaves all options unselected by default and supports clearing all options', () => {
        expect(
            Object.entries(defaultXyAnalysisOptions())
                .filter(([, value]) => value)
                .map(([key]) => key),
        ).toEqual([]);
        expect(build([[1, 2, 3]], {})).toEqual([]);
    });
    it('connects the largest changes and visible endpoints without crossing missing observations', () => {
        const annotations = build([[1, 9, 4, 6]], {
            increase: true,
            decrease: true,
            change: true,
        });
        expect(annotations.map((item) => item.label)).toEqual([
            'S0: largest increase 8',
            'S0: largest decrease -5',
            'S0: first-to-last change 5',
        ]);
        expect(annotations[0].geometry).toMatchObject({
            kind: 'line',
            fromX: 40,
            x: 120,
            arrow: true,
        });
        const gaps = build([[1, null, 10, 12]], { increase: true });
        expect(gaps[0].label).toContain('increase 2');
        expect(gaps[0].geometry.fromX).toBe(200);
    });
    it('places average and median reference lines on the series value mapping', () => {
        const annotations = build([[1, 2, 3, 4, 100]], {
            average: true,
            median: true,
        });
        expect(annotations.map((item) => item.label)).toEqual([
            'S0: average 22',
            'S0: median 3',
        ]);
        expect(annotations[0].geometry).toMatchObject({
            fromY: 206,
            y: 206,
            dashed: true,
        });
        expect(annotations[1].geometry.y).toBe(244);
    });
    it('marks only configured threshold crossings and caps repeated markers', () => {
        expect(build([[1, 7, 3, 9, 2]], { threshold: true })).toEqual([]);
        const annotations = build(
            [[1, 7, 3, 9, 2]],
            { threshold: true },
            { messages: { thresholds: [5] } },
        );
        expect(annotations).toHaveLength(3);
        expect(annotations[0].geometry.kind).toBe('circle');
        expect(annotations[0].geometry.y).toBeCloseTo(236);
        expect(annotations[0].geometry.x).toBe(120);
        expect(
            build(
                [[1, null, 10, 12]],
                { threshold: true },
                { messages: { thresholds: [5] } },
            ),
        ).toEqual([]);
    });
    it('uses the 1.5 IQR rule for outlier candidates and requires at least four observations', () => {
        const annotations = build([[1, 2, 3, 4, 100]], { outlier: true });
        expect(annotations).toHaveLength(1);
        expect(annotations[0].label).toBe(
            messages.visualOutlier
                .replace('{series}', 'S0')
                .replace('{value}', '100'),
        );
        expect(annotations[0].geometry.kind).toBe('circle');
        expect(build([[1, 2, 100]], { outlier: true })).toEqual([]);
        expect(build([[2, 2, 2, 2]], { outlier: true })).toEqual([]);
    });
    it('fits descriptive trends using actual x coordinates rather than point indices', () => {
        const annotations = build(
            [
                [
                    { x: 100, y: 1 },
                    { x: 102, y: 5 },
                    { x: 110, y: 21 },
                ],
            ],
            { trend: true },
            { continuous: true },
        );
        expect(annotations).toHaveLength(1);
        expect(annotations[0].label).toContain('slope 2 per x-unit');
        expect(annotations[0].geometry.dashed).toBe(true);
        expect(
            build(
                [
                    [
                        { x: 1, y: 2 },
                        { x: 1, y: 5 },
                        { x: 1, y: 9 },
                    ],
                ],
                { trend: true },
                { continuous: true },
            ),
        ).toEqual([]);
        expect(build([[1, 2]], { trend: true })).toEqual([]);
    });
    it('compares matching x values only when series use matching units and scales', () => {
        const annotations = build(
            [
                [1, 10, 2],
                [3, 2, 5],
            ],
            { gap: true },
        );
        expect(annotations).toHaveLength(1);
        expect(annotations[0].label).toBe('S0 / S1: largest gap 8');
        expect(annotations[0].geometry.kind).toBe('bracket');
        expect(
            build(
                [
                    [1, 10],
                    [3, 2],
                ],
                { gap: true },
                { units: ['USD', 'EUR'] },
            ),
        ).toEqual([]);
        expect(
            build(
                [
                    [
                        { x: 1, y: 1 },
                        { x: 1, y: 10 },
                    ],
                    [
                        { x: 1, y: 3 },
                        { x: 1, y: 2 },
                    ],
                ],
                { gap: true },
                { continuous: true },
            ),
        ).toEqual([]);
    });
    it('honours the annotation cap when multiple types are selected', () => {
        expect(
            build(
                [[1, 2, 3, 4, 100]],
                {
                    ...defaultXyAnalysisOptions(),
                    average: true,
                    median: true,
                    trend: true,
                    outlier: true,
                },
                { messages: { maxAnnotations: 3 } },
            ),
        ).toHaveLength(3);
    });
});

it('never generates opted-out insights even when a saved selection enables them', () => {
    const annotations = build(
        [[1, 2, 3, 4, 100]],
        { minimum: true, maximum: true, average: true, trend: true },
        {
            messages: {
                options: { minimum: false, average: false, trend: false },
            },
        },
    );
    expect(annotations).toHaveLength(1);
    expect(annotations[0].id).toBe('series-0-maximum');
});
