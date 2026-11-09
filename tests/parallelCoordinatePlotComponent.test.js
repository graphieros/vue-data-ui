import { mount, flushPromises } from '@vue/test-utils';
import { nextTick } from 'vue';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import VueUiParallelCoordinatePlot from '../src/components/vue-ui-parallel-coordinate-plot.vue';
const dataset = [
    {
        name: 'A',
        series: [
            { name: 'A1', values: [1, 10, 100] },
            { name: 'A2', values: [2, 20, 200] },
        ],
    },
    { name: 'B', series: [{ name: 'B1', values: [3, 30, 300] }] },
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
});
afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});
const mountChart = (props = {}) =>
    mount(
        { ...VueUiParallelCoordinatePlot, render: () => null },
        { props: { dataset, ...props } },
    );

test('zero and negative constant axes have finite scales and coordinates', async () => {
    const w = mountChart({
        dataset: [
            {
                name: 'Constants',
                series: [
                    { name: 'One', values: [0, -5, 7] },
                    { name: 'Two', values: [0, -5, 7] },
                ],
            },
        ],
    });
    try {
        await flushPromises();
        const s = w.vm.$.setupState;
        for (const axis of s.scales) {
            expect(axis.scale.max).toBeGreaterThan(axis.scale.min);
            expect(axis.ticks.length).toBeGreaterThan(0);
            expect(axis.ticks.every((t) => Number.isFinite(t.y))).toBe(true);
        }
        expect(
            s.mutableDataset[0].series.every((item) =>
                item.datapoints.every((point) => Number.isFinite(point.y)),
            ),
        ).toBe(true);
    } finally {
        w.unmount();
    }
});

test('uneven items get missing tooltip and table values without throwing', async () => {
    const w = mountChart({
        dataset: [
            {
                name: 'Group',
                series: [
                    { name: 'Short', values: [2] },
                    { name: 'Long', values: [4, 10, 20] },
                ],
            },
        ],
    });
    try {
        await flushPromises();
        const s = w.vm.$.setupState;
        expect(() => s.useTooltip(s.keyboardNavigableSeries[0])).not.toThrow();
        expect(s.tooltipContent).toContain('Y-3');
        expect(s.tooltipContent).toContain('-');
        expect(s.dataTable.body[0]).toEqual(['Group', 'Short', 2, '-', '-']);
        let csv;
        w.vm.generateCsv((value) => {
            csv = value;
        });
        expect(csv).toContain('Short');
    } finally {
        w.unmount();
    }
});

test('IDs and hidden groups survive config and palette updates', async () => {
    const w = mountChart();
    try {
        await flushPromises();
        const s = w.vm.$.setupState;
        const ids = w.vm
            .getData()
            .map((group) => [group.id, ...group.series.map((item) => item.id)]);
        w.vm.hideSeries('A');
        await nextTick();
        await w.setProps({ config: { customPalette: ['#ff0000', '#00ff00'] } });
        expect(
            w.vm
                .getData()
                .map((group) => [
                    group.id,
                    ...group.series.map((item) => item.id),
                ]),
        ).toEqual(ids);
        expect(s.filteredDs.map((group) => group.name)).toEqual(['B']);
        w.vm.showSeries('A');
        expect(s.filteredDs).toHaveLength(2);
    } finally {
        w.unmount();
    }
});

test('selection follows item identity when earlier groups are hidden', async () => {
    const w = mountChart();
    try {
        await flushPromises();
        const s = w.vm.$.setupState;
        const item = s.keyboardNavigableSeries[2];
        s.activeA11yItemIndex = 2;
        s.useTooltip({ ...item, triggerMode: 'keyboard' });
        w.vm.hideSeries('A');
        await nextTick();
        expect(s.activeA11yItemIndex).toBe(0);
        expect(s.selectedItem).toBe(item.serie.id);
        w.vm.hideSeries('B');
        await nextTick();
        expect(s.activeA11yItemIndex).toBeNull();
        expect(s.selectedItem).toBeNull();
        expect(s.isTooltip).toBe(false);
        expect(s.maxSeries).toBe(0);
        expect(s.slot).toBe(0);
        expect(s.scales).toEqual([]);
    } finally {
        w.unmount();
    }
});

test('tooltip formatter runs once with explicit source group index', async () => {
    const customFormat = vi.fn(() => 'Custom');
    const enter = vi.fn();
    const click = vi.fn();
    const w = mountChart({
        config: {
            style: { chart: { tooltip: { customFormat } } },
            events: { datapointEnter: enter, datapointClick: click },
        },
    });
    try {
        await flushPromises();
        const s = w.vm.$.setupState;
        w.vm.hideSeries('A');
        const item = s.keyboardNavigableSeries[0];
        s.useTooltip(item);
        expect(customFormat).toHaveBeenCalledTimes(1);
        expect(customFormat.mock.calls[0][0].serie).toBe(item.serie);
        expect(customFormat.mock.calls[0][0].seriesIndex).toBe(1);
        expect(s.dataTooltipSlot.seriesIndex).toBe(1);
        expect(enter.mock.calls[0][0].seriesIndex).toBe(0);
        s.selectDatapoint(item);
        expect(click.mock.calls[0][0].seriesIndex).toBe(0);
        expect(w.emitted('selectDatapoint')[0][0]).toBe(item.serie);
    } finally {
        w.unmount();
    }
});

test('loading can be disabled without sticking on the skeleton', async () => {
    const w = mountChart({ config: { loading: true } });
    try {
        await flushPromises();
        const s = w.vm.$.setupState;
        expect(s.loading).toBe(true);
        await w.setProps({ config: { loading: false } });
        await flushPromises();
        expect(s.loading).toBe(false);
        expect(w.vm.getData().map((group) => group.name)).toEqual(['A', 'B']);
    } finally {
        w.unmount();
    }
});

test('fixed sizing updates dimensions and configured font sizes', async () => {
    const w = mountChart();
    try {
        await flushPromises();
        await w.setProps({
            config: {
                style: {
                    chart: {
                        width: 700,
                        height: 350,
                        plots: { radius: 8 },
                        yAxis: {
                            labels: {
                                axisNamesFontSize: 24,
                                ticks: { fontSize: 18 },
                                datapoints: { fontSize: 16 },
                            },
                        },
                    },
                },
            },
        });
        expect(w.vm.$.setupState.chartDimensions).toEqual({
            width: 700,
            height: 350,
            plotSize: 8,
            ticksFontSize: 18,
            datapointFontSize: 16,
            axisNameFontSize: 24,
        });
    } finally {
        w.unmount();
    }
});

test('responsive sizing and teardown preserve proportional behavior', async () => {
    const w = mountChart();
    try {
        await flushPromises();
        const s = w.vm.$.setupState;
        const parent = document.createElement('div');
        const chart = document.createElement('div');
        parent.appendChild(chart);
        s.pcpChart = chart;
        parent.getBoundingClientRect = () => ({ width: 400, height: 300 });
        const config = {
            responsive: true,
            responsiveProportionalSizing: true,
            style: {
                chart: {
                    plots: { radius: 10 },
                    yAxis: {
                        labels: {
                            axisNamesFontSize: 40,
                            ticks: { fontSize: 30 },
                            datapoints: { fontSize: 30 },
                        },
                    },
                },
            },
        };
        await w.setProps({ config });
        requestAnimationFrame.mock.calls.at(-1)[0]();
        expect(s.chartDimensions).toEqual({
            width: 400,
            height: 288,
            plotSize: 5,
            ticksFontSize: 15,
            datapointFontSize: 15,
            axisNameFontSize: 20,
        });
        const active = observer;
        active.callback();
        await w.setProps({ config: { responsive: false } });
        expect(active.disconnect).toHaveBeenCalled();
        expect(cancelAnimationFrame).toHaveBeenCalledWith(123);
        const calls = requestAnimationFrame.mock.calls.length;
        active.callback();
        expect(requestAnimationFrame).toHaveBeenCalledTimes(calls);
        await w.setProps({ config });
        const last = observer;
        w.unmount();
        expect(last.disconnect).toHaveBeenCalled();
    } finally {
        if (w.exists()) w.unmount();
    }
});

test('table visibility is safe before the table mounts', async () => {
    const w = mountChart();
    try {
        await flushPromises();
        w.vm.toggleTable();
        await nextTick();
        w.vm.toggleTable();
        await nextTick();
        expect(w.vm.$.setupState.mutableConfig.showTable).toBe(false);
    } finally {
        w.unmount();
    }
});

test('explicit identities retain visibility after dataset reordering', async () => {
    const groups = dataset.map((group, i) => ({
        ...group,
        id: `group${i}`,
        series: group.series.map((item, j) => ({ ...item, id: `item${j}` })),
    }));
    const wrapper = mountChart({ dataset: groups });
    try {
        await flushPromises();
        wrapper.vm.hideSeries('A');
        await wrapper.setProps({ dataset: [...groups].reverse() });
        expect(
            wrapper.vm.$.setupState.filteredDs.map((group) => group.name),
        ).toEqual(['B']);
        wrapper.vm.showSeries('A');
        expect(wrapper.vm.$.setupState.filteredDs).toHaveLength(2);
    } finally {
        wrapper.unmount();
    }
});

test('rendered pointer bindings use the same interaction indices as keyboard records', async () => {
    const previousBox = SVGElement.prototype.getBBox;
    const previousLength = SVGElement.prototype.getComputedTextLength;
    SVGElement.prototype.getBBox = () => ({
        x: 0,
        y: 0,
        width: 20,
        height: 10,
    });
    SVGElement.prototype.getComputedTextLength = () => 20;
    const customFormat = vi.fn(() => 'Custom');
    const enter = vi.fn();
    const wrapper = mount(VueUiParallelCoordinatePlot, {
        props: {
            dataset,
            config: {
                style: {
                    chart: {
                        legend: { show: false },
                        tooltip: { customFormat },
                        yAxis: {
                            labels: {
                                axisNames: ['One', 'Two\nLines', 'Three'],
                            },
                        },
                    },
                },
                events: { datapointEnter: enter },
            },
        },
    });
    try {
        await flushPromises();
        await vi.dynamicImportSettled();
        await flushPromises();
        wrapper.vm.hideSeries('A');
        await flushPromises();
        await wrapper.get('[data-cy="datapoint-line"]').trigger('mouseenter');
        expect(customFormat.mock.calls.at(-1)[0].seriesIndex).toBe(1);
        expect(enter.mock.calls.at(-1)[0].seriesIndex).toBe(0);
        const state = wrapper.vm.$.setupState;
        expect(state.dataTooltipSlot.serie.id).toBe(
            state.keyboardNavigableSeries[0].serie.id,
        );
        expect(
            wrapper.findAll('[data-cy="pcp-axis-label"]')[1].findAll('tspan'),
        ).toHaveLength(2);
    } finally {
        wrapper.unmount();
        if (previousBox) SVGElement.prototype.getBBox = previousBox;
        else delete SVGElement.prototype.getBBox;
        if (previousLength)
            SVGElement.prototype.getComputedTextLength = previousLength;
        else delete SVGElement.prototype.getComputedTextLength;
    }
});
