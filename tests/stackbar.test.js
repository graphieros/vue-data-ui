import { mount, flushPromises } from '@vue/test-utils';
import { nextTick } from 'vue';
import { beforeEach, afterEach, expect, test, vi } from 'vitest';
import VueUiStackbar from '../src/components/vue-ui-stackbar.vue';
let frameId;
beforeEach(() => {
    frameId = 0;
    vi.stubGlobal(
        'ResizeObserver',
        class {
            observe() {}
            disconnect() {}
            unobserve() {}
        },
    );
    vi.stubGlobal(
        'requestAnimationFrame',
        vi.fn(() => ++frameId),
    );
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
});
afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});
const dataset = [
    { name: 'A', series: [-10, 0, 10, 20, 30, 40, 50, 60] },
    { name: 'B', series: [-20, 0, 5, 10, 15, 20, 25, 30] },
];
const mountChart = (props) =>
    mount(
        { ...VueUiStackbar, render: () => null },
        { props: { dataset, ...props } },
    );

test('CSV uses absolute category numbers when labels are absent', async () => {
    const wrapper = mountChart();
    try {
        await flushPromises();
        wrapper.vm.setZoomState({ start: 2, end: 5 });
        await flushPromises();
        expect(
            wrapper.vm.$.setupState.tableCsv.body.map((row) => row[0]),
        ).toEqual([3, 4, 5]);
    } finally {
        wrapper.unmount();
    }
});

test('CSV rows and headers include the same visible series', async () => {
    const wrapper = mountChart();
    try {
        await flushPromises();
        wrapper.vm.hideSeries('B');
        await nextTick();
        const table = wrapper.vm.$.setupState.tableCsv;
        expect(table.head.map((column) => column.label)).toEqual(['A']);
        expect(table.body[0]).toEqual([1, -10]);
        expect(
            table.body.every((row) => row.length === table.head.length + 1),
        ).toBe(true);
    } finally {
        wrapper.unmount();
    }
});

test('horizontal total labels have finite positions for negative and zero categories', async () => {
    const wrapper = mountChart({ config: { orientation: 'horizontal' } });
    try {
        await flushPromises();
        const state = wrapper.vm.$.setupState;
        expect(Number.isFinite(state.placeLabelTotalX(0))).toBe(true);
        expect(Number.isFinite(state.placeLabelTotalX(1))).toBe(true);
    } finally {
        wrapper.unmount();
    }
});

test('precise tooltip and datapoint dates use absolute indices after zooming', async () => {
    const dates = Array.from({ length: 8 }, (_, i) => Date.UTC(2024, i, 1));
    const wrapper = mountChart({
        config: {
            style: {
                chart: {
                    grid: {
                        x: {
                            timeLabels: {
                                values: dates,
                                datetimeFormatter: {
                                    enable: true,
                                    useUTC: true,
                                },
                            },
                        },
                    },
                    tooltip: {
                        useDefaultTimeFormat: false,
                        timeFormat: 'yyyy-MM-dd',
                    },
                },
            },
        },
    });
    try {
        await flushPromises();
        wrapper.vm.setZoomState({ start: 3, end: 7 });
        await flushPromises();
        const state = wrapper.vm.$.setupState;
        expect(state.getTooltipTimeLabel(0)).toBe('2024-04-01');
        expect(state.getDatapoint(0)[0].timeLabel).toEqual(
            state.allTimeLabels[3],
        );
    } finally {
        wrapper.unmount();
    }
});

test('unchanged external selection follows changes to the zoom window', async () => {
    const wrapper = mountChart({ selectedXIndex: 3 });
    try {
        await flushPromises();
        wrapper.vm.setZoomState({ start: 2, end: 6 });
        await nextTick();
        expect(wrapper.vm.$.setupState.trapIndex).toBe(1);
        wrapper.vm.setZoomState({ start: 4, end: 7 });
        await nextTick();
        expect(wrapper.vm.$.setupState.trapIndex).toBeNull();
    } finally {
        wrapper.unmount();
    }
});

test('custom tooltip formatters execute once', async () => {
    const customFormat = vi.fn(() => 'Custom stack');
    const wrapper = mountChart({
        config: { style: { chart: { tooltip: { customFormat } } } },
    });
    try {
        await flushPromises();
        const state = wrapper.vm.$.setupState;
        state.useTooltip(0);
        expect(customFormat).toHaveBeenCalledTimes(1);
        expect(state.tooltipContent).toBe('Custom stack');
    } finally {
        wrapper.unmount();
    }
});

test('minimap painting and clipping reuse geometry until dimensions or visibility change', async () => {
    const wrapper = mountChart({
        config: {
            style: {
                chart: {
                    bars: { borderRadius: 4 },
                    zoom: { minimap: { show: true } },
                },
            },
        },
    });
    try {
        await flushPromises();
        const state = wrapper.vm.$.setupState;
        const read = vi.spyOn(state.formattedDataset[0], 'yMinimap');
        const first = state.minimapGeometry({ minimapH: 30, unitW: 10 });
        expect(state.minimapGeometry({ minimapH: 30, unitW: 10 })).toBe(first);
        state.getMinimapStackClipRects({ minimapH: 30, unitW: 10 });
        expect(read).toHaveBeenCalledTimes(1);
        expect(state.minimapGeometry({ minimapH: 60, unitW: 10 })).not.toBe(
            first,
        );
        wrapper.vm.hideSeries('B');
        await nextTick();
        expect(state.minimapGeometry({ minimapH: 30, unitW: 10 })).toHaveLength(
            1,
        );
    } finally {
        wrapper.unmount();
    }
});

test('unmount cancels a pending reset without publishing late zoom events', async () => {
    const wrapper = mountChart();
    await flushPromises();
    const reset = wrapper.vm.resetZoom();
    await nextTick();
    wrapper.unmount();
    await reset;
    expect(wrapper.emitted('zoomReset')).toBeUndefined();
});
