import { mount, flushPromises } from '@vue/test-utils';
import { nextTick } from 'vue';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import VueUiQuickChart from '../src/components/vue-ui-quick-chart.vue';
const dataset = [1, 2, 3, 4, 5, 6, 7, 8];
let frames, nextFrame, observer;
beforeEach(() => {
    frames = new Map();
    nextFrame = 0;
    vi.stubGlobal(
        'requestAnimationFrame',
        vi.fn((callback) => {
            const id = ++nextFrame;
            frames.set(id, callback);
            return id;
        }),
    );
    vi.stubGlobal(
        'cancelAnimationFrame',
        vi.fn((id) => frames.delete(id)),
    );
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
});
afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});
const mountChart = (props = {}) =>
    mount(
        { ...VueUiQuickChart, render: () => null },
        { props: { dataset, ...props } },
    );

for (const type of ['LINE', 'BAR']) {
    const chartIsBarUnderDatasetLength = type === 'BAR' ? 20 : 0;
    test(`${type} zoomed tooltips and accessibility labels use visible dates`, async () => {
        const enter = vi.fn();
        const wrapper = mountChart({
            config: {
                chartIsBarUnderDatasetLength,
                xyPeriods: dataset.map((n) => `Period ${n}`),
                events: { datapointEnter: enter },
            },
        });
        try {
            await flushPromises();
            wrapper.vm.setZoomState({ start: 3, end: 6 });
            await flushPromises();
            const state = wrapper.vm.$.setupState;
            expect(state.chartType).toBe(type);
            state.xyChart.useTooltip(0);
            expect(state.tooltipContent).toContain('Period 4');
            expect(state.a11yTable.rows.map((row) => row[0])).toEqual([
                'Period 4',
                'Period 5',
                'Period 6',
            ]);
            expect(enter.mock.calls[0][0].seriesIndex).toBe(3);
            expect(enter.mock.calls[0][0].datapoint[0].absoluteIndex).toBe(3);
        } finally {
            wrapper.unmount();
        }
    });
    test(`${type} custom format runs once and keeps its payload`, async () => {
        const tooltipCustomFormat = vi.fn(() => 'custom');
        const wrapper = mountChart({
            config: { chartIsBarUnderDatasetLength, tooltipCustomFormat },
        });
        try {
            await flushPromises();
            const state = wrapper.vm.$.setupState;
            state.xyChart.useTooltip(0);
            expect(tooltipCustomFormat).toHaveBeenCalledTimes(1);
            const payload = tooltipCustomFormat.mock.calls[0][0];
            expect(payload.datapoint[0].value).toBe(1);
            if (type === 'BAR') expect(payload.point).toBe(payload.datapoint);
            expect(state.tooltipContent).toBe('custom');
        } finally {
            wrapper.unmount();
        }
    });
}

test('all-hidden line series do not leave an active tooltip or throw', async () => {
    const wrapper = mountChart();
    try {
        await flushPromises();
        const state = wrapper.vm.$.setupState;
        state.line.useTooltip(0);
        state.toggleLegend();
        expect(() => state.line.useTooltip(0)).not.toThrow();
        expect(state.isTooltip).toBe(false);
    } finally {
        wrapper.unmount();
    }
});

test('invalid data clears the previous chart and can recover', async () => {
    const wrapper = mountChart({ config: { debug: false } });
    try {
        await flushPromises();
        await wrapper.setProps({ dataset: [{ unknown: 1 }] });
        await flushPromises();
        const state = wrapper.vm.$.setupState;
        expect(state.isProcessable).toBe(false);
        expect(state.chartType).toBeNull();
        expect(state.svgLegendItems).toEqual([]);
        await wrapper.setProps({ dataset });
        await flushPromises();
        expect(state.chartType).toBe('LINE');
    } finally {
        wrapper.unmount();
    }
    const invalid = mountChart({
        dataset: [{ unknown: 1 }],
        config: { debug: false },
    });
    try {
        await flushPromises();
        expect(invalid.vm.$.setupState.isProcessable).toBe(false);
    } finally {
        invalid.unmount();
    }
});

test('loading uses the intended skeleton defaults', async () => {
    const wrapper = mountChart({ config: { loading: true } });
    try {
        await flushPromises();
        const state = wrapper.vm.$.setupState;
        expect(state.FINAL_CONFIG.showTooltip).toBe(false);
        expect(state.FINAL_CONFIG.showDataLabels).toBe(false);
        expect(state.FINAL_CONFIG.zoomXy).toBe(false);
        await wrapper.setProps({ config: { loading: false } });
        await flushPromises();
        expect(state.loading).toBe(false);
        expect(state.line.dataset[0].values).toEqual(dataset);
    } finally {
        wrapper.unmount();
    }
});

const donutDataset = [
    { name: 'A', value: 10 },
    { name: 'Zero', value: 0 },
    { name: 'C', value: 20 },
];
test('zero-value donut visibility changes finish without scheduling animation', async () => {
    const wrapper = mountChart({ dataset: donutDataset });
    try {
        await flushPromises();
        const state = wrapper.vm.$.setupState;
        const calls = requestAnimationFrame.mock.calls.length;
        state.segregateDonut(state.donut.legend[1], state.donut.dataset);
        expect(state.segregated).toContain('donut_1');
        expect(state.isSegregatingDonut).toBe(false);
        state.segregateDonut(state.donut.legend[1], state.donut.dataset);
        expect(state.segregated).not.toContain('donut_1');
        expect(requestAnimationFrame).toHaveBeenCalledTimes(calls);
    } finally {
        wrapper.unmount();
    }
});

test('donut animation is canceled when data changes or the chart unmounts', async () => {
    const wrapper = mountChart({ dataset: donutDataset });
    const state = wrapper.vm.$.setupState;
    await flushPromises();
    state.segregateDonut(state.donut.legend[0], state.donut.dataset);
    const stale = [...frames.values()];
    await wrapper.setProps({
        dataset: [
            { name: 'New', value: 30 },
            { name: 'Other', value: 40 },
        ],
    });
    expect(state.isSegregatingDonut).toBe(false);
    for (const callback of stale) callback();
    expect(state.donut.legend.map((d) => d.value)).toEqual([30, 40]);
    state.segregateDonut(state.donut.legend[0], state.donut.dataset);
    const queued = [...state.donutAnimations.values()].map(
        (animation) => animation.frame,
    );
    wrapper.unmount();
    for (const frame of queued) expect(frames.has(frame)).toBe(false);
});

test('responsive observer disconnects when disabled', async () => {
    const wrapper = mountChart();
    try {
        await flushPromises();
        const state = wrapper.vm.$.setupState;
        const chart = document.createElement('div');
        document.createElement('div').appendChild(chart);
        state.quickChart = chart;
        await wrapper.setProps({ config: { responsive: true } });
        const active = observer;
        active.callback();
        await wrapper.setProps({
            config: { responsive: false, width: 600, height: 300 },
        });
        expect(active.disconnect).toHaveBeenCalled();
        expect(state.defaultSizes).toEqual({ width: 600, height: 300 });
        const calls = requestAnimationFrame.mock.calls.length;
        active.callback();
        expect(requestAnimationFrame).toHaveBeenCalledTimes(calls);
    } finally {
        wrapper.unmount();
    }
});

test('donut hide/restore and show-all preserve original values', async () => {
    const wrapper = mountChart({ dataset: donutDataset });
    try {
        await flushPromises();
        const state = wrapper.vm.$.setupState;
        function finishAnimation() {
            for (let i = 0; frames.size && i < 300; i++) {
                const callbacks = [...frames.values()];
                frames.clear();
                callbacks.forEach((callback) => callback());
            }
            expect(state.isSegregatingDonut).toBe(false);
        }
        state.segregateDonut(state.donut.legend[0], state.donut.dataset);
        finishAnimation();
        expect(state.donut.dataset.map((d) => d.name)).toEqual(['Zero', 'C']);
        state.segregateDonut(state.donut.legend[0], state.donut.dataset);
        finishAnimation();
        expect(state.donut.legend.map((d) => d.value)).toEqual([10, 0, 20]);
        state.segregateDonut(state.donut.legend[0], state.donut.dataset);
        finishAnimation();
        state.toggleLegend();
        expect(state.donut.legend.map((d) => d.value)).toEqual([10, 0, 20]);
        expect(state.donut.dataset).toHaveLength(3);
    } finally {
        wrapper.unmount();
    }
});
