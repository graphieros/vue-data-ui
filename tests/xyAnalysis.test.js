import { describe, expect, it } from 'vitest';
import {
    analyzeXy,
    getXyAnalysisSelection,
    hasXyAnalysisPoints,
} from '../src/utils/xyAnalysis';

describe('XY descriptive analysis', () => {
    it('preserves extrema ties and does not bridge gaps', () => {
        const [result] = analyzeXy([
            { name: 'A', series: [2, null, 100, 100, 90] },
        ]);
        expect(result.count).toBe(4);
        expect(result.excluded).toBe(1);
        expect(result.maximum.indices).toEqual([2, 3]);
        expect(result.increase).toBeNull();
        expect(result.decrease).toEqual({ value: -10, from: 3, to: 4 });
        expect(result.change).toBe(88);
    });
    it('uses original data and excludes hidden series and nonfinite values', () => {
        const results = analyzeXy(
            [{ series: [1, 1000, 2, NaN, Infinity] }, { series: [9999] }],
            new Set(['uniqueId_1']),
        );
        expect(results).toHaveLength(1);
        expect(results[0].maximum.value).toBe(1000);
        expect(results[0].excluded).toBe(2);
    });
    it('handles empty, zero and constant series without invented changes', () => {
        expect(analyzeXy([{ series: [null, NaN] }])).toEqual([]);
        const [result] = analyzeXy([{ series: [0, 0] }]);
        expect(result.change).toBe(0);
        expect(result.increase).toBeNull();
        expect(result.decrease).toBeNull();
    });
    it('requires finite continuous coordinates and increasing x for adjacent changes', () => {
        const [result] = analyzeXy(
            [
                {
                    type: 'line',
                    series: [
                        { x: 10, y: 2 },
                        { x: 5, y: 20 },
                        { x: 6, y: null },
                        { x: 15, y: 8 },
                    ],
                },
            ],
            new Set(),
            true,
        );
        expect(result.count).toBe(3);
        expect(result.increase).toBeNull();
        expect(result.change).toBe(6);
    });
});

describe('zoom-scoped analysis', () => {
    it('restricts categorical analysis to visible source indices and counts only scoped gaps', () => {
        const dataset = [{ series: [1000, 2, null, 8, -999, NaN] }];
        const selection = getXyAnalysisSelection([
            {
                id: 'uniqueId_0',
                series: [2, null, 8],
                sourceIndices: [1, 2, 3],
            },
        ]);
        const [result] = analyzeXy(dataset, new Set(), false, selection);
        expect(result.count).toBe(2);
        expect(result.excluded).toBe(1);
        expect(result.minimum).toEqual({ value: 2, indices: [1] });
        expect(result.maximum).toEqual({ value: 8, indices: [3] });
        expect(result.change).toBe(6);
        expect(result.increase).toBeNull();
    });
    it('uses downsampled source mappings rather than treating zoom offsets as raw indices', () => {
        const dataset = [{ series: [500, 10, 999, 20, 5] }];
        const selection = getXyAnalysisSelection(
            [{ series: [10, 20], sourceIndices: [1, 3] }],
            false,
            1,
        );
        const [result] = analyzeXy(dataset, new Set(), false, selection);
        expect(result.count).toBe(2);
        expect(result.maximum).toEqual({ value: 20, indices: [3] });
        expect(result.minimum.value).toBe(10);
    });
    it('uses retained indices for continuous zoom, including duplicate x values', () => {
        const dataset = [
            {
                type: 'line',
                series: [
                    { x: 0, y: 999 },
                    { x: 10, y: 2 },
                    { x: 10, y: 8 },
                    { x: 20, y: -999 },
                ],
            },
        ];
        const selection = getXyAnalysisSelection(
            [
                {
                    id: 'uniqueId_0',
                    series: [
                        { index: 1, x: 10, y: 2 },
                        { index: 2, x: 10, y: 8 },
                    ],
                },
            ],
            true,
        );
        const [result] = analyzeXy(dataset, new Set(), true, selection);
        expect(result.count).toBe(2);
        expect(result.maximum.indices).toEqual([2]);
        expect(result.minimum.indices).toEqual([1]);
        expect(result.increase).toBeNull();
    });
    it('handles empty zoom ranges, hidden series, and reset to the full range', () => {
        const dataset = [{ series: [1, 9, 3] }];
        expect(analyzeXy(dataset, new Set(), false, new Map())).toEqual([]);
        const full = getXyAnalysisSelection([{ series: [1, 9, 3] }]);
        expect(
            analyzeXy(dataset, new Set(['uniqueId_0']), false, full),
        ).toEqual([]);
        expect(analyzeXy(dataset, new Set(), false, full)).toEqual(
            analyzeXy(dataset),
        );
    });
});

describe('analysis availability', () => {
    it('requires more than one finite visible datapoint', () => {
        expect(hasXyAnalysisPoints([])).toBe(false);
        expect(
            hasXyAnalysisPoints([
                { type: 'line', series: [null, NaN, Infinity] },
            ]),
        ).toBe(false);
        expect(hasXyAnalysisPoints([{ type: 'line', series: [null, 0] }])).toBe(
            false,
        );
        expect(hasXyAnalysisPoints([{ type: 'line', series: [0, 1] }])).toBe(
            true,
        );
    });
    it('excludes hidden and unsupported series and counts across visible series', () => {
        const dataset = [
            { id: 'a', type: 'bar', series: [1] },
            { id: 'b', type: 'plot', series: [2] },
        ];
        expect(hasXyAnalysisPoints(dataset)).toBe(true);
        expect(hasXyAnalysisPoints(dataset, new Set(['b']))).toBe(false);
        expect(hasXyAnalysisPoints([{ type: 'other', series: [1, 2] }])).toBe(
            false,
        );
    });
    it('requires finite x and y coordinates in continuous mode', () => {
        const dataset = [
            {
                type: 'line',
                series: [
                    { x: 1, y: 0 },
                    { x: 2, y: null },
                    { x: NaN, y: 3 },
                ],
            },
        ];
        expect(hasXyAnalysisPoints(dataset, new Set(), true)).toBe(false);
        dataset[0].series.push({ x: 4, y: 5 });
        expect(hasXyAnalysisPoints(dataset, new Set(), true)).toBe(true);
    });
});
