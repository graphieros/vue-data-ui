import { mount, flushPromises } from '@vue/test-utils';
import { nextTick } from 'vue';
import { beforeEach, afterEach, expect, test, vi } from 'vitest';
import VueUiCandlestick from '../src/components/vue-ui-candlestick.vue';

beforeEach(() => {
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
        vi.fn(() => 1),
    );
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
});
afterEach(() => vi.unstubAllGlobals());
const dataset = Array.from({ length: 8 }, (_, i) => [
    Date.UTC(2024, i, 1),
    10 + i,
    20 + i,
    5 + i,
    15 + i,
    100 + i,
]);
const mountChart = (props = {}) =>
    mount(
        { ...VueUiCandlestick, render: () => null },
        { props: { dataset, ...props } },
    );

test('precise tooltip dates follow the absolute candle index after zooming', async () => {
    const wrapper = mountChart({
        config: {
            style: {
                tooltip: {
                    useDefaultTimeFormat: false,
                    timeFormat: 'yyyy-MM-dd',
                },
                layout: {
                    grid: {
                        xAxis: {
                            dataLabels: {
                                datetimeFormatter: {
                                    enable: true,
                                    useUTC: true,
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
        wrapper.vm.setZoomState({ start: 3, end: 7 });
        await nextTick();
        const state = wrapper.vm.$.setupState;
        state.useTooltip(0, state.drawableDataset[0]);
        expect(state.tooltipContent).toContain('2024-04-01');
        expect(state.tooltipContent).not.toContain('2024-01-01');
    } finally {
        wrapper.unmount();
    }
});

test('unchanged external selection is remapped when the zoom window changes', async () => {
    const wrapper = mountChart({ selectedXIndex: 3 });
    try {
        await flushPromises();
        const state = wrapper.vm.$.setupState;
        expect(state.hoveredIndex).toBe(3);
        wrapper.vm.setZoomState({ start: 2, end: 6 });
        await nextTick();
        expect(state.hoveredIndex).toBe(1);
        wrapper.vm.setZoomState({ start: 4, end: 7 });
        await nextTick();
        expect(state.hoveredIndex).toBeNull();
    } finally {
        wrapper.unmount();
    }
});

test('custom tooltip formatting runs once', () => {
    const customFormat = vi.fn(() => 'Custom candle');
    const wrapper = mountChart({
        config: { style: { tooltip: { customFormat } } },
    });
    try {
        const state = wrapper.vm.$.setupState;
        state.useTooltip(0, state.drawableDataset[0]);
        expect(customFormat).toHaveBeenCalledTimes(1);
        expect(state.tooltipContent).toBe('Custom candle');
    } finally {
        wrapper.unmount();
    }
});

test('unmount cancels a pending reset without publishing late zoom events', async () => {
    const wrapper = mountChart();
    const reset = wrapper.vm.resetZoom();
    await nextTick();
    wrapper.unmount();
    await reset;
    expect(wrapper.emitted('zoomReset')).toBeUndefined();
    expect(cancelAnimationFrame).toHaveBeenCalled();
});
