import { mount } from '@vue/test-utils';
import { beforeEach, afterEach, expect, test, vi } from 'vitest';
import VueUiXy from '../src/components/vue-ui-xy.vue';
import SlicerPreview from '../src/atoms/SlicerPreview.vue';
import { createSymlogScale, nonlinearRatio, transformY } from '../src/xyScales';
import { createVueUiXyState } from '../src/svg/vue-ui-xy/create';
import { renderVueUiXySvg } from '../src/svg/vue-ui-xy/render';
import { useConfig } from '../src/useConfig';

beforeEach(() =>
    vi.stubGlobal(
        'ResizeObserver',
        class {
            observe() {}
            unobserve() {}
            disconnect() {}
        },
    ),
);
afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
});

const values = [-100, -10, -1, 0, 1, 10, 100];
const makeConfig = (reverse = false, individual = false, constant = 1) => ({
    chart: {
        grid: {
            labels: {
                yAxis: {
                    scale: 'symlog',
                    reverse,
                    useIndividualScale: individual,
                    symlogConstant: constant,
                },
            },
        },
    },
});

test('symlog grouped automatic scales align and retain zero baselines in stacked panels', async () => {
    const dataset = [
        {
            name: 'A',
            type: 'line',
            series: [-100, 0, 100],
            autoScaling: true,
            scaleLabel: 'shared',
            useArea: true,
        },
        {
            name: 'B',
            type: 'line',
            series: [-10, 0, 10],
            autoScaling: true,
            scaleLabel: 'shared',
            useArea: true,
        },
    ];
    const config = (stacked) => {
        const result = makeConfig(true, true);
        result.chart.grid.labels.yAxis.stacked = stacked;
        return result;
    };
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const wrapper = mount(
        { ...VueUiXy, render: () => null },
        { props: { dataset, config: config(false) } },
    );
    try {
        const state = wrapper.vm.$.setupState;
        expect(state.lineSet[0].plots[1].y).toBeCloseTo(
            state.lineSet[1].plots[1].y,
        );
        expect(state.lineSet[0].individualScale).toEqual(
            state.lineSet[1].individualScale,
        );
        await wrapper.setProps({ config: config(true) });
        for (const serie of state.lineSet) {
            const middle =
                state.drawingArea.bottom -
                serie.yOffset -
                serie.individualHeight / 2;
            expect(serie.plots[1].y).toBeCloseTo(middle);
            expect(serie.zeroPosition).toBeCloseTo(middle);
        }
    } finally {
        wrapper.unmount();
    }
});

test('symlog transform is symmetric, continuous at zero, and accepts custom constants', () => {
    expect(transformY(0, 'symlog')).toBe(0);
    expect(transformY(-100, 'symlog')).toBe(-transformY(100, 'symlog'));
    expect(transformY(1e-8, 'symlog')).toBeCloseTo(1e-8, 12);
    expect(transformY(10, 'symlog', 10)).toBe(Math.log(2));
    expect(transformY(10, 'symlog', 0)).toBe(transformY(10, 'symlog', 1));
    expect(
        Number.isFinite(
            transformY(Number.MAX_VALUE, 'symlog', Number.MIN_VALUE),
        ),
    ).toBe(true);
    expect(nonlinearRatio(0, -100, 100, 'symlog')).toBe(0.5);
    expect(nonlinearRatio(-100, -100, 100, 'symlog')).toBe(0);
    expect(nonlinearRatio(100, -100, 100, 'symlog')).toBe(1);
    expect(
        nonlinearRatio(
            0,
            -Number.MIN_VALUE,
            Number.MIN_VALUE,
            'symlog',
            Number.MAX_VALUE,
        ),
    ).toBe(0.5);
});

test('symlog domains handle signs, nulls, constants, and positive or negative bounds', () => {
    expect(createSymlogScale(values)).toEqual({
        min: -100,
        max: 100,
        ticks: values,
    });
    expect(createSymlogScale([0, null, undefined, NaN])).toMatchObject({
        min: -1,
        max: 1,
    });
    expect(createSymlogScale([100])).toMatchObject({ min: 0, max: 100 });
    expect(createSymlogScale([-100])).toMatchObject({ min: -100, max: 0 });
    expect(createSymlogScale([], { constant: 10 })).toMatchObject({
        min: -10,
        max: 10,
    });
    expect(createSymlogScale([2, 20], { min: 1, max: 100 })).toMatchObject({
        min: 1,
        max: 100,
    });
    expect(createSymlogScale([-20, -2], { min: -100, max: -1 })).toMatchObject({
        min: -100,
        max: -1,
    });
});

test.each(['line', 'bar', 'plot'])(
    'symlog %s geometry includes zero and negatives on common and individual axes',
    async (type) => {
        const dataset = [
            { name: 'Values', type, series: values, useArea: type === 'line' },
        ];
        const wrapper = mount(
            { ...VueUiXy, render: () => null },
            { props: { dataset, config: makeConfig() } },
        );
        try {
            const state = wrapper.vm.$.setupState;
            for (const individual of [false, true])
                for (const reverse of [false, true]) {
                    await wrapper.setProps({
                        config: makeConfig(reverse, individual),
                    });
                    const serie = state[`${type}Set`][0];
                    const plots = serie.plots;
                    expect(plots.map((plot) => plot.value)).toEqual(values);
                    expect(plots.every((plot) => Number.isFinite(plot.y))).toBe(
                        true,
                    );
                    const top = state.drawingArea.top;
                    const bottom = state.drawingArea.bottom;
                    const middle = (top + bottom) / 2;
                    expect(plots[3].y).toBeCloseTo(middle);
                    expect(plots[0].y + plots[6].y).toBeCloseTo(top + bottom);
                    expect(plots[2].y + plots[4].y).toBeCloseTo(top + bottom);
                    expect(plots[0].y > plots[6].y).toBe(!reverse);
                    expect(
                        state.yLabels.find((label) => label.value === 0).y,
                    ).toBeCloseTo(middle);
                    if (type === 'bar')
                        for (const plot of plots) {
                            expect(
                                individual
                                    ? state.calcIndividualRectY(plot)
                                    : state.calcRectY(plot),
                            ).toBeCloseTo(Math.min(plot.y, middle));
                            expect(
                                individual
                                    ? state.calcIndividualHeight(plot)
                                    : state.calcRectHeight(plot),
                            ).toBeCloseTo(
                                Math.max(0.00001, Math.abs(plot.y - middle)),
                            );
                        }
                }
            const previous = state[`${type}Set`][0].plots[4].y;
            await wrapper.setProps({ config: makeConfig(true, true, 10) });
            expect(state[`${type}Set`][0].plots[4].y).not.toBeCloseTo(previous);
            expect(dataset[0].series).toEqual(values);
        } finally {
            wrapper.unmount();
        }
    },
);

test('symlog supports continuous X, actual null gaps, area baselines, and runtime switching', async () => {
    const series = values.map((y, x) => ({ x, y }));
    series.splice(4, 0, { x: null, y: null });
    const wrapper = mount(
        { ...VueUiXy, render: () => null },
        {
            props: {
                dataset: [
                    { name: 'Values', type: 'line', series, useArea: true },
                ],
                config: makeConfig(),
            },
        },
    );
    try {
        const state = wrapper.vm.$.setupState;
        expect(state.lineSet[0].plots[4].y).toBeNull();
        expect(state.lineSet[0].plots[3].value).toBe(0);
        expect(state.lineSet[0].area.split(';').filter(Boolean)).toHaveLength(
            2,
        );
        expect(state.globalAreaBaselineY).toBeCloseTo(
            state.lineSet[0].plots[3].y,
        );
        await wrapper.setProps({ config: makeConfig(true) });
        const scale = state.captureChartZoomYScale();
        expect(state.getChartZoomYForValue(-10, scale)).toBeCloseTo(
            state.lineSet[0].plots[1].y,
        );
        await wrapper.setProps({
            config: {
                chart: { grid: { labels: { yAxis: { scale: 'log' } } } },
            },
        });
        expect(state.lineSet[0].plots[0].logOmitted).toBe(true);
        await wrapper.setProps({ config: {} });
        expect(state.lineSet[0].plots[0].value).toBe(-100);
    } finally {
        wrapper.unmount();
    }
});

test.each([false, true])(
    'symlog minimap preserves signed data and reverses its baseline (merged=%s)',
    async (merged) => {
        const wrapper = mount(
            { ...SlicerPreview, render: () => null },
            {
                props: {
                    yScale: 'symlog',
                    min: 0,
                    max: 7,
                    start: 0,
                    end: 7,
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
            const original = points();
            expect(original.map((point) => point.value)).toEqual(values);
            expect(original[3].y).toBeCloseTo(state.svgMinimap.height / 2);
            expect(original[0].y).toBeCloseTo(state.svgMinimap.height);
            await wrapper.setProps({ yReverse: true });
            points().forEach((point, index) =>
                expect(point.y).toBeCloseTo(
                    state.svgMinimap.height - original[index].y,
                ),
            );
            expect(points()[3].y0).toBeCloseTo(state.svgMinimap.height / 2);
        } finally {
            wrapper.unmount();
        }
    },
);

test('symlog annotations and freehand zoom anchors use the same transform as points', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
        measureText: (text) => ({ width: text.length * 7 }),
    });
    const annotation = structuredClone(
        useConfig().vue_ui_xy.chart.annotations[0],
    );
    annotation.show = true;
    annotation.yAxis.yTop = -10;
    const config = makeConfig(true, false, 10);
    config.chart.annotations = [annotation];
    config.chart.userOptions = { annotator: { followZoom: true } };
    const wrapper = mount(
        { ...VueUiXy, render: () => null },
        {
            props: {
                dataset: [{ name: 'Values', type: 'line', series: values }],
                config,
            },
        },
    );
    try {
        const state = wrapper.vm.$.setupState;
        const y = state.lineSet[0].plots[1].y;
        expect(state.annotationsY[0].yTop).toBeCloseTo(y);
        const viewport = state.annotationViewport;
        expect(
            viewport.y.origin + transformY(-10, 'symlog', 10) * viewport.y.unit,
        ).toBeCloseTo(y);
    } finally {
        wrapper.unmount();
    }
});

test.each([false, true])(
    'static symlog SVG includes zero and negative values (reverse=%s)',
    async (reverse) => {
        const state = createVueUiXyState({
            dataset: [
                { name: 'Values', type: 'line', useArea: true, series: values },
            ],
            config: makeConfig(reverse),
        });
        const plots = state.series[0].plots;
        expect(plots.map((plot) => plot.value)).toEqual(values);
        expect(plots[3].y).toBeCloseTo(
            (state.drawingArea.top + state.drawingArea.bottom) / 2,
        );
        expect(plots[0].y > plots[6].y).toBe(!reverse);
        const svg = await renderVueUiXySvg(state);
        expect(svg).not.toMatch(/NaN|Infinity/);
        expect(svg).toContain('data-cy="datapoint-line-area-straight"');
    },
);
