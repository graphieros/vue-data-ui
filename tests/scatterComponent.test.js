import { mount, flushPromises } from '@vue/test-utils';
import { nextTick } from 'vue';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import VueUiScatter from '../src/components/vue-ui-scatter.vue';
const dataset = [
    {
        name: 'A',
        values: [
            { x: -2, y: 1 },
            { x: 0, y: 3 },
            { x: 2, y: 4 },
        ],
    },
    {
        name: 'B',
        values: [
            { x: 1, y: -1 },
            { x: 3, y: 2 },
        ],
    },
];
let observer;
beforeEach(() => {
    vi.stubGlobal(
        'ResizeObserver',
        class {
            constructor(callback) {
                this.callback = callback;
                observer = this;
            }
            observe = vi.fn();
            disconnect = vi.fn();
        },
    );
    vi.stubGlobal(
        'requestAnimationFrame',
        vi.fn(() => 123),
    );
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    vi.spyOn(SVGElement.prototype, 'getBoundingClientRect').mockReturnValue({
        left: 0,
        top: 0,
        width: 500,
        height: 300,
    });
});
afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});
const mountChart = (props = {}) =>
    mount(
        { ...VueUiScatter, render: () => null },
        { props: { dataset, ...props } },
    );

test('legend hover preserves cached geometry and public selection flags', async () => {
    const wrapper = mountChart();
    try {
        await flushPromises();
        const state = wrapper.vm.$.setupState;
        const before = wrapper.vm.getData();
        const values = state.datasetWithId[0].values;
        const paths = state.marginalLines;
        state.onSeriesEnter(before[0].id);
        await nextTick();
        const after = wrapper.vm.getData();
        expect(after[0].isGroupSelected).toBe(true);
        expect(after[1].hasGroupSelection).toBe(true);
        expect(after[0].plots).toBe(before[0].plots);
        expect(after[0].correlation).toBe(before[0].correlation);
        expect(state.datasetWithId[0].values).toBe(values);
        expect(state.marginalLines).toBe(paths);
        state.onSeriesLeave();
        expect(wrapper.vm.getData()[0].hasGroupSelection).toBe(false);
        wrapper.vm.hideSeries('A');
        expect(wrapper.vm.getData().map((s) => s.name)).toEqual(['B']);
        expect(state.extremes).toEqual({ xMin: 0, xMax: 3, yMin: -1, yMax: 2 });
    } finally {
        wrapper.unmount();
    }
});

test('performance mouse interaction follows runtime mode changes', async () => {
    const wrapper = mountChart();
    try {
        await flushPromises();
        const state = wrapper.vm.$.setupState;
        await wrapper.setProps({ config: { usePerformanceMode: true } });
        const plot = wrapper.vm.getData()[0].plots[0];
        const svg = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'svg',
        );
        svg.createSVGPoint = () => ({
            matrixTransform: () => ({ x: plot.x, y: plot.y }),
        });
        svg.getScreenCTM = () => ({ inverse: () => ({}) });
        state.svgRef = svg;
        state.onPathMouseMove({ clientX: 10, clientY: 20 });
        expect(state.selectedPlot.id).toBe(plot.id);
        expect(state.isTooltip).toBe(true);
        state.clearPlotSelection();
        await wrapper.setProps({ config: { usePerformanceMode: false } });
        state.onPathMouseMove({ clientX: 10, clientY: 20 });
        expect(state.selectedPlot).toBeNull();
    } finally {
        wrapper.unmount();
    }
});

test('CSV handles series with empty data or no visible correlation', async () => {
    const wrapper = mountChart({
        dataset: [
            { name: 'Empty', values: [] },
            {
                name: 'Outside',
                values: [
                    { x: 5, y: 10 },
                    { x: 6, y: 10 },
                ],
            },
        ],
        config: {
            style: { layout: { axis: { xMin: 0, xMax: 1, yMin: 0, yMax: 1 } } },
        },
    });
    try {
        await flushPromises();
        expect(wrapper.vm.getData().every((s) => s.correlation === null)).toBe(
            true,
        );
        const csv = await new Promise((resolve) =>
            wrapper.vm.generateCsv(resolve),
        );
        expect(csv).toContain('Empty');
        expect(csv).toContain('Outside');
        expect(wrapper.vm.$.setupState.dataTable.body[1].slice(1)).toEqual([
            '0',
            '2',
            '5.5',
            '10',
        ]);
    } finally {
        wrapper.unmount();
    }
});

test('custom tooltip formatter runs once with the public payload', async () => {
    const customFormat = vi.fn(() => 'custom');
    const wrapper = mountChart({
        config: { style: { tooltip: { customFormat } } },
    });
    try {
        await flushPromises();
        const state = wrapper.vm.$.setupState;
        const plot = wrapper.vm.getData()[0].plots[0];
        state.onTrapEnter(plot, 0);
        expect(customFormat).toHaveBeenCalledTimes(1);
        expect(customFormat.mock.calls[0][0].datapoint).toBe(plot);
        expect(state.tooltipContent).toBe('custom');
        customFormat.mockReturnValue(null);
        state.onTrapEnter(plot, 0);
        expect(customFormat).toHaveBeenCalledTimes(2);
        expect(state.tooltipContent).toContain('A');
    } finally {
        wrapper.unmount();
    }
});

test('perfect-fit plots stay visible with distance opacity', async () => {
    const wrapper = mountChart({
        dataset: [
            {
                name: 'Fit',
                values: [
                    { x: 1, y: 1 },
                    { x: 1, y: 2 },
                ],
            },
        ],
        config: {
            style: {
                layout: {
                    plots: { significance: { useDistanceOpacity: true } },
                },
            },
        },
    });
    try {
        await flushPromises();
        const state = wrapper.vm.$.setupState;
        expect(state.maxDeviation).toBe(0);
        for (const plot of wrapper.vm.getData()[0].plots)
            expect(state.getPlotOpacity(plot)).toBe(1);
    } finally {
        wrapper.unmount();
    }
});

test('configured sizing, responsive measurement and teardown follow config updates', async () => {
    const wrapper = mountChart();
    try {
        await flushPromises();
        const state = wrapper.vm.$.setupState;
        state.scatterChart = document.createElement('div');
        const parent = document.createElement('div');
        parent.appendChild(state.scatterChart);
        parent.getBoundingClientRect = () => ({ width: 800, height: 500 });
        await wrapper.setProps({
            config: { style: { layout: { width: 600, height: 300 } } },
        });
        expect(state.svg).toEqual({ width: 600, height: 300 });
        await wrapper.setProps({ config: { responsive: true } });
        const firstObserver = observer;
        requestAnimationFrame.mock.calls.at(-1)[0]();
        expect(state.svg).toEqual({ width: 800, height: 500 });
        firstObserver.callback();
        await wrapper.setProps({ config: { responsive: false } });
        expect(firstObserver.disconnect).toHaveBeenCalled();
        expect(cancelAnimationFrame).toHaveBeenCalledWith(123);
        const count = requestAnimationFrame.mock.calls.length;
        firstObserver.callback();
        expect(requestAnimationFrame).toHaveBeenCalledTimes(count);
        await wrapper.setProps({ config: { responsive: true } });
        const lastObserver = observer;
        wrapper.unmount();
        expect(lastObserver.disconnect).toHaveBeenCalled();
        const calls = requestAnimationFrame.mock.calls.length;
        lastObserver.callback();
        expect(requestAnimationFrame).toHaveBeenCalledTimes(calls);
    } finally {
        if (wrapper.exists()) wrapper.unmount();
    }
});

test('X selector labels use their own formatter when scale labels are hidden', async () => {
    SVGElement.prototype.getBBox = () => ({
        x: 0,
        y: 0,
        width: 30,
        height: 10,
    });
    SVGElement.prototype.getComputedTextLength = () => 30;
    const x = vi.fn(({ value }) => `X:${value}`);
    const y = vi.fn(({ value }) => `Y:${value}`);
    const wrapper = mount(VueUiScatter, {
        props: {
            dataset,
            config: {
                style: {
                    legend: { show: false },
                    layout: {
                        plots: {
                            selectors: {
                                show: true,
                                labels: {
                                    x: { formatter: x },
                                    y: { formatter: y },
                                },
                            },
                        },
                    },
                },
            },
        },
    });
    try {
        await flushPromises();
        const state = wrapper.vm.$.setupState;
        state.onTrapEnter(wrapper.vm.getData()[0].plots[0], 0);
        await nextTick();
        expect(wrapper.get('[data-cy="selector-label-y"]').text()).toBe('X:-2');
        expect(wrapper.get('[data-cy="selector-label-x"]').text()).toBe('Y:1');
    } finally {
        wrapper.unmount();
        delete SVGElement.prototype.getBBox;
        delete SVGElement.prototype.getComputedTextLength;
    }
});
