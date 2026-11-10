import { mount, flushPromises } from '@vue/test-utils';
import { nextTick } from 'vue';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import VueUiTreemap from '../src/components/vue-ui-treemap.vue';

const dataset = [
    {
        id: 'a',
        name: 'A',
        value: 30,
        children: [
            { id: 'a1', name: 'A1', value: 10 },
            { id: 'a2', name: 'A2', value: 20 },
        ],
    },
    { id: 'b', name: 'B', value: 70 },
];
let observer;
beforeEach(() => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
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
const mountChart = (config = {}) =>
    mount(
        { ...VueUiTreemap, render: () => null },
        { props: { dataset, config } },
    );

test('root sorting follows the configured option without mutating the input', async () => {
    const wrapper = mountChart();
    try {
        await flushPromises();
        expect(
            wrapper.vm
                .getData()
                .filter((d) => d.depth === 0)
                .map((d) => d.id),
        ).toEqual(['b', 'a']);
        await wrapper.setProps({
            config: { style: { chart: { layout: { sorted: false } } } },
        });
        expect(
            wrapper.vm
                .getData()
                .filter((d) => d.depth === 0)
                .map((d) => d.id),
        ).toEqual(['a', 'b']);
        expect(dataset.map((d) => d.id)).toEqual(['a', 'b']);
        expect(dataset[0].children.map((d) => d.id)).toEqual(['a1', 'a2']);
    } finally {
        wrapper.unmount();
    }
});

test('drilling, breadcrumbs and hiding the drilled root stay synchronized', async () => {
    const wrapper = mountChart();
    try {
        await flushPromises();
        const state = wrapper.vm.$.setupState;
        state.zoom(
            wrapper.vm.getData().find((d) => d.id === 'a1'),
            2,
        );
        await nextTick();
        expect(state.breadcrumbs.map((d) => d.label)).toEqual([
            'All',
            'A',
            'A1',
        ]);
        wrapper.vm.hideSeries('A');
        await nextTick();
        expect(state.drillStack).toEqual([]);
        expect(wrapper.vm.getData().map((d) => d.id)).toEqual(['b']);
        wrapper.vm.showSeries('A');
        await nextTick();
        expect(wrapper.vm.getData().some((d) => d.id === 'a1')).toBe(true);
    } finally {
        wrapper.unmount();
    }
});

test('custom tooltip formatter runs once and invalid output uses the default', async () => {
    const customFormat = vi.fn(() => 'custom');
    const wrapper = mountChart({
        style: { chart: { tooltip: { customFormat } } },
    });
    try {
        await flushPromises();
        const state = wrapper.vm.$.setupState;
        const datapoint = wrapper.vm.getData()[0];
        state.useTooltip({ datapoint, seriesIndex: 0 });
        expect(customFormat).toHaveBeenCalledTimes(1);
        expect(state.tooltipContent).toBe('custom');
        customFormat.mockReturnValue(null);
        state.useTooltip({ datapoint, seriesIndex: 0 });
        expect(customFormat).toHaveBeenCalledTimes(2);
        expect(state.tooltipContent).toContain(datapoint.name);
    } finally {
        wrapper.unmount();
    }
});

test('label fitting formats each label once per build', async () => {
    const formatter = vi.fn(({ value }) => `Value ${value}`);
    const wrapper = mountChart({
        style: { chart: { layout: { labels: { formatter } } } },
    });
    try {
        await flushPromises();
        const state = wrapper.vm.$.setupState;
        const rect = wrapper.vm.getData().find((d) => d.id === 'b');
        formatter.mockClear();
        state.buildTreemapLabel({ rect, seriesIndex: 0 });
        expect(formatter).toHaveBeenCalledTimes(1);
    } finally {
        wrapper.unmount();
    }
});

test('size changes and responsive teardown update dimensions and cancel queued work', async () => {
    const wrapper = mountChart();
    const state = wrapper.vm.$.setupState;
    state.treemapChart = document.createElement('div');
    const parent = document.createElement('div');
    parent.appendChild(state.treemapChart);
    await flushPromises();
    await wrapper.setProps({
        config: { style: { chart: { width: 700, height: 350 } } },
    });
    expect(state.chartDimensions).toEqual({ width: 700, height: 350 });
    await wrapper.setProps({ config: { responsive: true } });
    expect(observer.observe).toHaveBeenCalledWith(parent);
    const firstObserver = observer;
    parent.getBoundingClientRect = () => ({ width: 800, height: 500 });
    requestAnimationFrame.mock.calls.at(-1)[0]();
    expect(state.chartDimensions).toEqual({ width: 800, height: 488 });
    firstObserver.callback();
    await wrapper.setProps({
        config: {
            responsive: false,
            style: { chart: { width: 600, height: 300 } },
        },
    });
    expect(firstObserver.disconnect).toHaveBeenCalled();
    expect(cancelAnimationFrame).toHaveBeenCalledWith(123);
    expect(state.chartDimensions).toEqual({ width: 600, height: 300 });
    await wrapper.setProps({ config: { responsive: true } });
    const lastObserver = observer;
    wrapper.unmount();
    expect(lastObserver.disconnect).toHaveBeenCalled();
    const calls = requestAnimationFrame.mock.calls.length;
    lastObserver.callback();
    expect(requestAnimationFrame).toHaveBeenCalledTimes(calls);
});

test('node lookup follows dataset replacement while drilled', async () => {
    const wrapper = mountChart();
    try {
        await flushPromises();
        const state = wrapper.vm.$.setupState;
        state.zoom(
            wrapper.vm.getData().find((d) => d.id === 'a'),
            0,
        );
        await wrapper.setProps({
            dataset: [
                {
                    id: 'a',
                    name: 'Updated',
                    value: 50,
                    children: [{ id: 'new', name: 'New leaf', value: 50 }],
                },
            ],
        });
        expect(state.breadcrumbs.map((d) => d.label)).toEqual([
            'All',
            'Updated',
        ]);
        expect(state.findNodeById('a1')).toBeNull();
        expect(wrapper.vm.getData().map((d) => d.id)).toEqual(['a', 'new']);
        await wrapper.setProps({
            dataset: [{ id: 'b', name: 'B', value: 20 }],
        });
        expect(state.drillStack).toEqual([]);
        expect(wrapper.vm.getData().map((d) => d.id)).toEqual(['b']);
    } finally {
        wrapper.unmount();
    }
});
