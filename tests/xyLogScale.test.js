import { mount } from '@vue/test-utils';
import { expect, test, vi, beforeEach, afterEach } from 'vitest';
import VueUiXy from '../src/components/vue-ui-xy.vue';
import { createLogScale, createScaleProjector } from '../src/xyScales';
import { createVueUiXyState } from '../src/svg/vue-ui-xy/create';
import { renderVueUiXySvg } from '../src/svg/vue-ui-xy/render';
import SlicerPreview from '../src/atoms/SlicerPreview.vue';
import { useConfig } from '../src/useConfig';

test.each([false, true])(
    'log interline fills bridge omitted nonpositive values and retain actual null gaps (continuous=%s)',
    async (continuous) => {
        const dataset = (hasNull, variant = {}) =>
            [
                {
                    name: 'A',
                    type: 'line',
                    series: [1, 0, 10, hasNull ? null : -5, 100, 1000],
                    ...variant,
                },
                {
                    name: 'B',
                    type: 'line',
                    series: [2, 4, 20, hasNull ? null : 8, 200, 2000],
                    ...variant,
                },
            ].map((serie) => ({
                ...serie,
                series: continuous
                    ? serie.series.map((y, x) =>
                          y === null ? { x: null, y: null } : { x, y },
                      )
                    : serie.series,
            }));
        const wrapper = mount(
            { ...VueUiXy, render: () => null },
            {
                props: {
                    dataset: dataset(false),
                    config: {
                        chart: {
                            grid: { labels: { yAxis: { scale: 'log' } } },
                        },
                        line: { interLine: { pairs: [['A', 'B']] } },
                    },
                },
            },
        );
        try {
            const state = wrapper.vm.$.setupState;
            const ranges = () =>
                state.interLineAreas.map((area) => {
                    const xs = area.d
                        .match(/-?\d+(?:\.\d+)?(?:e[+-]?\d+)?/gi)
                        .map(Number)
                        .filter((_, index) => index % 2 === 0);
                    return { min: Math.min(...xs), max: Math.max(...xs) };
                });
            for (const variant of [
                {},
                { smooth: true },
                { useStepper: true },
            ]) {
                await wrapper.setProps({ dataset: dataset(false, variant) });
                const plots = state.lineSet[0].plots;
                expect(
                    Math.min(...ranges().map((range) => range.min)),
                ).toBeCloseTo(plots[0].x);
                expect(
                    Math.max(...ranges().map((range) => range.max)),
                ).toBeCloseTo(plots.at(-1).x);
                await wrapper.setProps({ dataset: dataset(true, variant) });
                const after = state.lineSet[0].plots;
                const gapX = (after[2].x + after[4].x) / 2;
                expect(ranges().length).toBeGreaterThan(0);
                expect(
                    ranges().some(
                        (range) => range.min < gapX && range.max > gapX,
                    ),
                ).toBe(false);
            }
        } finally {
            wrapper.unmount();
        }
    },
);

test('static log interline fills bridge omitted zero points with null cutting enabled', async () => {
    const state = createVueUiXyState({
        dataset: [
            { name: 'A', type: 'line', series: [1, 0, 10, 100] },
            { name: 'B', type: 'line', series: [2, 0, 20, 200] },
        ],
        config: {
            chart: { grid: { labels: { yAxis: { scale: 'log' } } } },
            line: { cutNullValues: true, interLine: { pairs: [['A', 'B']] } },
        },
    });
    const svg = await renderVueUiXySvg(state);
    const document = new DOMParser().parseFromString(svg, 'image/svg+xml');
    const areas = [...document.querySelectorAll('[data-cy="interline-area"]')];
    expect(areas.length).toBeGreaterThan(0);
    const xs = areas.flatMap((area) =>
        area
            .getAttribute('d')
            .match(/-?\d+(?:\.\d+)?(?:e[+-]?\d+)?/gi)
            .map(Number)
            .filter((_, index) => index % 2 === 0),
    );
    // Both line types share the first X coordinate after layout adjustment.
    const allLinePaths = [
        ...document.querySelectorAll('[data-layer="lines"] path'),
    ];
    expect(allLinePaths.length).toBeGreaterThan(0);
    const firstX = Number(
        allLinePaths[0]
            .getAttribute('d')
            .match(/-?\d+(?:\.\d+)?(?:e[+-]?\d+)?/i)[0],
    );
    expect(Math.min(...xs)).toBeCloseTo(firstX);
});

test.each(['linear', 'log'])(
    'interline colors follow values when %s Y is reversed',
    async (scale) => {
        const dataset = [
            { name: 'A', type: 'line', series: [1, 100, 1] },
            { name: 'B', type: 'line', series: [10, 10, 10] },
        ];
        const config = (reverse) => ({
            line: {
                interLine: {
                    pairs: [['A', 'B']],
                    colors: [['#ff0000', '#0000ff']],
                },
            },
            chart: { grid: { labels: { yAxis: { scale, reverse } } } },
        });
        const wrapper = mount(
            { ...VueUiXy, render: () => null },
            { props: { dataset, config: config(false) } },
        );
        try {
            const visibleColors = () =>
                wrapper.vm.$.setupState.interLineAreas
                    .filter((area) => {
                        const coordinates = area.d
                            .match(/-?\d+(?:\.\d+)?(?:e[+-]?\d+)?/gi)
                            .map(Number);
                        let twiceArea = 0;
                        for (let i = 0; i < coordinates.length; i += 2) {
                            const next = (i + 2) % coordinates.length;
                            twiceArea +=
                                coordinates[i] * coordinates[next + 1] -
                                coordinates[next] * coordinates[i + 1];
                        }
                        // Stepper crossings contain subpixel transition wedges.
                        const xs = coordinates.filter(
                            (_, index) => index % 2 === 0,
                        );
                        return (
                            Math.abs(twiceArea) > 1e-6 &&
                            Math.max(...xs) - Math.min(...xs) > 0.5
                        );
                    })
                    .map((area) => area.color);
            for (const variant of [
                {},
                { smooth: true },
                { useStepper: true },
            ]) {
                await wrapper.setProps({
                    dataset: dataset.map((serie) => ({ ...serie, ...variant })),
                    config: config(false),
                });
                const before = visibleColors();
                expect(before[0]).toBe('#0000ff');
                expect(before).toContain('#ff0000');
                await wrapper.setProps({ config: config(true) });
                const after = visibleColors();
                expect(after[0]).toBe(before[0]);
                expect(after.at(-1)).toBe(before.at(-1));
                expect(new Set(after)).toEqual(new Set(before));
            }
        } finally {
            wrapper.unmount();
        }
    },
);

test.each(['linear', 'log'])(
    'static interline colors follow values when %s Y is reversed',
    async (scale) => {
        const dataset = [
            { name: 'A', type: 'line', series: [100, 200, 100] },
            { name: 'B', type: 'line', series: [1, 2, 1] },
        ];
        for (const reverse of [false, true]) {
            const state = createVueUiXyState({
                dataset,
                config: {
                    line: {
                        interLine: {
                            pairs: [['A', 'B']],
                            colors: [['#ff0000', '#0000ff']],
                        },
                    },
                    chart: { grid: { labels: { yAxis: { scale, reverse } } } },
                },
            });
            const svg = await renderVueUiXySvg(state);
            const areas = [
                ...svg.matchAll(/<path\b[^>]*data-cy="interline-area"[^>]*>/g),
            ].map((match) => match[0]);
            expect(areas.length).toBeGreaterThan(0);
            expect(areas.every((area) => area.includes('fill="#ff0000"'))).toBe(
                true,
            );
        }
    },
);

test.each([false, true])(
    'minimap bridges nonpositive log values without making null cuts (cutNullValues=%s)',
    async (cutNullValues) => {
        const series = [1, 0, 10, -5, 100];
        const wrapper = mount(
            { ...SlicerPreview, render: () => null },
            {
                props: {
                    min: 0,
                    max: 8,
                    start: 0,
                    end: 8,
                    yScale: 'log',
                    cutNullValues,
                    allMinimaps: [{ name: 'A', series, isVisible: true }],
                },
            },
        );
        try {
            const line = () => wrapper.vm.$.setupState.allMinimapLines[0];
            expect(line().fullSet.match(/M/g) || []).toHaveLength(0);
            await wrapper.setProps({
                allMinimaps: [
                    {
                        name: 'A',
                        series: [...series, null, 1000, 10000],
                        isVisible: true,
                    },
                ],
            });
            expect(line().fullSet.match(/M/g) || []).toHaveLength(
                cutNullValues ? 1 : 0,
            );
        } finally {
            wrapper.unmount();
        }
    },
);

test('static log areas bridge zero and negative values even with null cutting enabled', async () => {
    const state = createVueUiXyState({
        dataset: [
            {
                name: 'Area',
                type: 'line',
                series: [1, 0, 10, -5, 100],
                useArea: true,
            },
        ],
        config: {
            line: { cutNullValues: true },
            chart: { grid: { labels: { yAxis: { scale: 'log' } } } },
        },
    });
    const svg = await renderVueUiXySvg(state);
    expect(svg.match(/data-cy="datapoint-line-area-straight"/g)).toHaveLength(
        1,
    );
    expect(svg).not.toMatch(/NaN|Infinity/);
});

test.each([false, true])(
    'nonpositive log values bridge without becoming null cuts (cutNullValues=%s)',
    async (cutNullValues) => {
        const values = [1, 0, 10, -5, 100];
        const wrapper = mount(
            { ...VueUiXy, render: () => null },
            {
                props: {
                    dataset: [
                        {
                            name: 'Area',
                            type: 'line',
                            series: values,
                            useArea: true,
                        },
                    ],
                    config: {
                        line: { cutNullValues, nullDashes: { show: true } },
                        chart: {
                            grid: { labels: { yAxis: { scale: 'log' } } },
                        },
                    },
                },
            },
        );
        try {
            const state = wrapper.vm.$.setupState;
            for (const useStepper of [false, true]) {
                await wrapper.setProps({
                    dataset: [
                        {
                            name: 'Area',
                            type: 'line',
                            series: values,
                            useArea: true,
                            useStepper,
                        },
                    ],
                });
                const serie = state.lineSet[0];
                expect(serie.area.split(';').filter(Boolean)).toHaveLength(1);
                expect(serie.curveAreas).toHaveLength(1);
                expect(serie.hasDashedSegments).toBe(false);
                expect(serie.plots[1].logOmitted).toBe(true);
                expect(serie.plots[3].logOmitted).toBe(true);
                await wrapper.setProps({
                    dataset: [
                        {
                            name: 'Area',
                            type: 'line',
                            series: [...values, null, 1000, 10000],
                            useArea: true,
                            useStepper,
                        },
                    ],
                });
                expect(
                    state.lineSet[0].area.split(';').filter(Boolean),
                ).toHaveLength(2);
                expect(state.lineSet[0].plots[5].logOmitted).not.toBe(true);
            }
        } finally {
            wrapper.unmount();
        }
    },
);

test.each([false, true])(
    'linear bars extend between the value and baseline (reverse=%s)',
    async (reverse) => {
        for (const individual of [false, true]) {
            for (const values of [
                [1, 10, 100],
                [-10, 0, 20],
                [-100, -10, -1],
            ]) {
                const wrapper = mount(
                    { ...VueUiXy, render: () => null },
                    {
                        props: {
                            dataset: [
                                { name: 'Bars', type: 'bar', series: values },
                            ],
                            config: {
                                chart: {
                                    grid: {
                                        labels: {
                                            yAxis: {
                                                scale: 'linear',
                                                reverse,
                                                useIndividualScale: individual,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                );
                try {
                    const state = wrapper.vm.$.setupState;
                    const serie = state.barSet[0];
                    const baselineValue = Math.max(
                        serie.individualScale.min,
                        Math.min(serie.individualScale.max, 0),
                    );
                    const range = individual
                        ? serie.individualScale
                        : state.niceScale;
                    const value = individual
                        ? baselineValue
                        : Math.max(range.min, Math.min(range.max, 0));
                    const ratio = (value - range.min) / (range.max - range.min);
                    const height = individual
                        ? serie.individualHeight
                        : state.drawingArea.height;
                    const bottom =
                        state.drawingArea.bottom -
                        (individual ? serie.yOffset : 0);
                    const baseline =
                        bottom - height * (reverse ? 1 - ratio : ratio);
                    for (const plot of serie.plots) {
                        const top = individual
                            ? state.calcIndividualRectY(plot)
                            : state.calcRectY(plot);
                        const barHeight = individual
                            ? state.calcIndividualHeight(plot)
                            : state.calcRectHeight(plot);
                        expect(top).toBeCloseTo(Math.min(plot.y, baseline));
                        expect(barHeight).toBeCloseTo(
                            Math.max(0.00001, Math.abs(plot.y - baseline)),
                        );
                    }
                } finally {
                    wrapper.unmount();
                }
            }
        }
    },
);

import {
    createIndividualAreaWithCuts,
    createSmoothAreaSegments,
    createStepperPath,
} from '../src/lib';

test.each([
    [false, false],
    [false, true],
    [true, false],
    [true, true],
])(
    'linear minimap reversal mirrors points and baselines (merged=%s, continuous=%s)',
    async (merged, continuous) => {
        const values = [-10, 0, 10, 20];
        const series = continuous ? values.map((y, x) => ({ x, y })) : values;
        const wrapper = mount(
            { ...SlicerPreview, render: () => null },
            {
                props: {
                    min: 0,
                    max: 4,
                    start: 0,
                    end: 4,
                    yScale: 'linear',
                    useValueRange: continuous,
                    minimapMerged: merged,
                    minimap: merged ? series : [],
                    allMinimaps: [{ name: 'Values', series, isVisible: true }],
                },
            },
        );
        try {
            const state = wrapper.vm.$.setupState;
            const points = () =>
                merged
                    ? state.minimapLine.points
                    : state.allMinimapLines[0].points;
            const initial = points().map((point) => ({ ...point }));
            await wrapper.setProps({ yReverse: true });
            points().forEach((point, index) => {
                expect(point.y).toBeCloseTo(
                    state.svgMinimap.height - initial[index].y,
                );
                expect(point.y0).toBeCloseTo(
                    state.svgMinimap.height - initial[index].y0,
                );
                expect(point.value).toBe(values[index]);
                expect(point.x).toBe(initial[index].x);
            });
        } finally {
            wrapper.unmount();
        }
    },
);

test.each([
    ['common', false, false, false, 'log'],
    ['linear common', false, false, false, 'linear'],
    ['linear individual', true, false, false, 'linear'],
    ['linear automatic', true, true, false, 'linear'],
    ['linear stacked', true, true, true, 'linear'],
    ['individual', true, false, false],
    ['automatic', true, true, false],
    ['stacked', true, true, true],
])(
    'areas close toward the baseline on reversed %s scales',
    async (_, individual, autoScaling, stacked, scale = 'log') => {
        const wrapper = mount(
            { ...VueUiXy, render: () => null },
            {
                props: {
                    dataset: [
                        {
                            name: 'A',
                            type: 'line',
                            series: [1, 10, 100],
                            useArea: true,
                            autoScaling,
                        },
                        {
                            name: 'B',
                            type: 'line',
                            series: [2, 20, 200],
                            useArea: true,
                            autoScaling,
                        },
                    ],
                    config: {
                        chart: {
                            grid: {
                                labels: {
                                    yAxis: {
                                        scale,
                                        reverse: true,
                                        useIndividualScale: individual,
                                        stacked,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        );
        try {
            const state = wrapper.vm.$.setupState;
            for (const stepper of [false, true]) {
                await wrapper.setProps({
                    dataset: wrapper
                        .props('dataset')
                        .map((serie) => ({ ...serie, useStepper: stepper })),
                });
                for (const serie of state.lineSet) {
                    const baseline = individual
                        ? state.drawingArea.bottom -
                          serie.yOffset -
                          serie.individualHeight
                        : state.drawingArea.top;
                    expect(serie.area).toBe(
                        stepper
                            ? createStepperPath(serie.plots, baseline)
                            : createIndividualAreaWithCuts(
                                  serie.plots,
                                  baseline,
                              ),
                    );
                    expect(serie.curveAreas).toEqual(
                        stepper
                            ? createStepperPath(serie.plots, baseline)
                                  .split(';')
                                  .filter(Boolean)
                                  .map((path) => `M${path}Z`)
                            : createSmoothAreaSegments(
                                  serie.plots,
                                  baseline,
                                  true,
                              ),
                    );
                }
            }
        } finally {
            wrapper.unmount();
        }
    },
);

beforeEach(() =>
    vi.stubGlobal(
        'ResizeObserver',
        class {
            observe() {}
            disconnect() {}
            unobserve() {}
        },
    ),
);

test.each([false, true])(
    'log geometry supports gaps, coordinates and runtime changes (continuous=%s)',
    async (continuous) => {
        const values = [0.1, 0, 1, -5, 10, null, 100];
        const dataset = [
            {
                name: 'Values',
                type: 'line',
                useArea: true,
                series: continuous
                    ? values.map((y, x) => ({ x: y === null ? null : x, y }))
                    : values,
            },
        ];
        const config = {
            chart: {
                grid: {
                    labels: {
                        yAxis: { scale: 'log', scaleMin: 0.01, scaleMax: 1000 },
                    },
                },
            },
        };
        const wrapper = mount(
            { ...VueUiXy, render: () => null },
            { props: { dataset, config } },
        );
        try {
            const state = wrapper.vm.$.setupState;
            expect(state.niceScale.min).toBe(0.01);
            expect(state.niceScale.max).toBe(1000);
            const plots = state.lineSet[0].plots;
            for (const index of [1, 3, 5]) expect(plots[index].y).toBeNull();
            expect(plots[0].y - plots[2].y).toBeCloseTo(
                plots[2].y - plots[4].y,
            );
            expect(state.globalAreaBaselineY).toBeCloseTo(
                state.drawingArea.bottom,
            );
            expect(state.lineSet[0].absoluteValues).toEqual(values);
            await wrapper.setProps({ config: {} });
            expect(state.lineSet[0].plots[1].value).toBe(0);
            expect(Number.isFinite(state.lineSet[0].plots[1].y)).toBe(true);
        } finally {
            wrapper.unmount();
        }
    },
);

test('static SVG output uses log ticks and finite geometry with invalid values', async () => {
    const state = createVueUiXyState({
        dataset: [
            { name: 'Values', type: 'line', series: [1, 0, 10, -5, 100] },
        ],
        config: { chart: { grid: { labels: { yAxis: { scale: 'log' } } } } },
    });
    expect(state.scale.ticks).toEqual([1, 10, 100]);
    expect(state.series[0].plots[1].y).toBeNull();
    const plots = state.series[0].plots;
    expect(plots[0].y - plots[2].y).toBeCloseTo(plots[2].y - plots[4].y);
    const svg = await renderVueUiXySvg(state);
    expect(svg).not.toMatch(/NaN|Infinity/);
});

test.each([false, true])(
    'minimap uses logarithmic geometry for separate and merged series (merged=%s)',
    async (merged) => {
        const values = [0.1, 1, 10, 100, 0, -1];
        const wrapper = mount(
            { ...SlicerPreview, render: () => null },
            {
                props: {
                    yScale: 'log',
                    min: 0,
                    max: 6,
                    start: 0,
                    end: 6,
                    minimapMerged: merged,
                    minimap: merged ? values : [],
                    allMinimaps: [
                        { name: 'Values', series: values, isVisible: true },
                    ],
                },
            },
        );
        try {
            const state = wrapper.vm.$.setupState;
            const points = () =>
                merged
                    ? state.minimapLine.points
                    : state.allMinimapLines[0].points;
            const initial = points();
            expect(initial[0].y - initial[1].y).toBeCloseTo(
                initial[1].y - initial[2].y,
            );
            expect(initial[2].y - initial[3].y).toBeCloseTo(
                initial[1].y - initial[2].y,
            );
            expect(initial[4].value).toBeNull();
            expect(initial[5].value).toBeNull();
            expect(initial[0].y0).toBeCloseTo(initial[0].y);
            await wrapper.setProps({ yReverse: true });
            const reversed = points();
            expect(reversed[1].y).toBeGreaterThan(reversed[0].y);
            expect(reversed[0].y0).toBeCloseTo(reversed[0].y);
        } finally {
            wrapper.unmount();
        }
    },
);

test.each([false, true])(
    'log annotations and zoom anchors align with plots (reverse=%s)',
    (reverse) => {
        vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
            measureText: (text) => ({ width: text.length * 7 }),
        });
        const annotation = structuredClone(
            useConfig().vue_ui_xy.chart.annotations[0],
        );
        annotation.show = true;
        annotation.yAxis.yTop = 10;
        const wrapper = mount(
            { ...VueUiXy, render: () => null },
            {
                props: {
                    dataset: [
                        { name: 'Values', type: 'line', series: [1, 10, 100] },
                    ],
                    config: {
                        chart: {
                            annotations: [annotation],
                            userOptions: { annotator: { followZoom: true } },
                            grid: {
                                labels: { yAxis: { scale: 'log', reverse } },
                            },
                        },
                    },
                },
            },
        );
        try {
            const state = wrapper.vm.$.setupState;
            const y = state.lineSet[0].plots[1].y;
            expect(state.annotationsY[0].yTop).toBeCloseTo(y);
            const scale = state.captureChartZoomYScale();
            expect(state.getChartZoomYForValue(10, scale)).toBeCloseTo(y);
            const viewport = state.annotationViewport;
            expect(
                viewport.y.origin + Math.log10(10) * viewport.y.unit,
            ).toBeCloseTo(y);
        } finally {
            wrapper.unmount();
        }
    },
);
afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
});

test('log scale handles positive domains, constant data, and invalid data', () => {
    expect(createLogScale([0, -5, null, 1, 10, 100])).toEqual({
        min: 1,
        max: 100,
        ticks: [1, 10, 100],
    });
    expect(createLogScale([0, -5]).ticks).toEqual([1, 10]);
    expect(createLogScale([10]).ticks).toEqual([10, 100]);
    expect(createLogScale([0.2, 20]).ticks).toEqual([0.1, 1, 10, 100]);
    expect(createScaleProjector(1, 100, { mode: 'log' })(10)).toBe(0.5);
    expect(createScaleProjector(1, 100, { mode: 'log' })(0)).toBeNaN();
});

test('grouped automatic log scales share a domain and support stacked panels', async () => {
    const dataset = [
        {
            name: 'A',
            type: 'line',
            scaleLabel: 'shared',
            autoScaling: true,
            series: [1, 10, 100],
        },
        {
            name: 'B',
            type: 'line',
            scaleLabel: 'shared',
            autoScaling: true,
            series: [10, 100, 1000],
        },
    ];
    const config = (stacked) => ({
        chart: {
            grid: {
                labels: {
                    yAxis: { scale: 'log', useIndividualScale: true, stacked },
                },
            },
        },
    });
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const wrapper = mount(
        { ...VueUiXy, render: () => null },
        { props: { dataset, config: config(false) } },
    );
    try {
        const state = wrapper.vm.$.setupState;
        expect(state.lineSet[0].plots[1].y).toBeCloseTo(
            state.lineSet[1].plots[0].y,
        );
        expect(state.lineSet[0].individualScale.ticks).toEqual([
            1, 10, 100, 1000,
        ]);
        await wrapper.setProps({ config: config(true) });
        for (const serie of state.lineSet) {
            const plots = serie.plots;
            expect(plots[0].y - plots[1].y).toBeCloseTo(
                plots[1].y - plots[2].y,
            );
            expect(serie.zeroPosition).toBeCloseTo(
                state.drawingArea.bottom - serie.yOffset,
            );
        }
    } finally {
        wrapper.unmount();
        warning.mockRestore();
    }
});

test.each(['line', 'plot', 'bar'])(
    'projects %s values logarithmically without transforming their values',
    async (type) => {
        const dataset = [{ name: 'Series', type, series: [1, 10, 100, 1000] }];
        const wrapper = mount(
            { ...VueUiXy, render: () => null },
            {
                props: {
                    dataset,
                    config: {
                        chart: {
                            grid: { labels: { yAxis: { scale: 'log' } } },
                        },
                    },
                },
            },
        );
        try {
            const state = wrapper.vm.$.setupState;
            const series = () => state[`${type}Set`][0];
            const plots = series().plots;
            expect(plots.map((plot) => plot.value)).toEqual([1, 10, 100, 1000]);
            expect(plots[0].y - plots[1].y).toBeCloseTo(
                plots[1].y - plots[2].y,
            );
            expect(plots[1].y - plots[2].y).toBeCloseTo(
                plots[2].y - plots[3].y,
            );
            expect(state.yLabels.map((label) => label.value)).toEqual([
                1, 10, 100, 1000,
            ]);
            expect(plots[0].y).toBeCloseTo(state.yLabels[0].y);
            expect(plots[3].y).toBeCloseTo(state.yLabels[3].y);

            await wrapper.setProps({
                config: {
                    chart: {
                        grid: {
                            labels: {
                                yAxis: {
                                    scale: 'log',
                                    reverse: true,
                                    useIndividualScale: true,
                                },
                            },
                        },
                    },
                },
            });
            const reversed = series().plots;
            expect(reversed[1].y).toBeGreaterThan(reversed[0].y);
            expect(reversed[1].y - reversed[0].y).toBeCloseTo(
                reversed[2].y - reversed[1].y,
            );
            expect(dataset[0].series).toEqual([1, 10, 100, 1000]);
        } finally {
            wrapper.unmount();
        }
    },
);
