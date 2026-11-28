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

const volumeConfig = (volume = {}) => ({
    style: { layout: { volume: { show: true, ...volume } } },
});

test('volume pane is off by default and leaves the price pane unchanged', async () => {
    const wrapper = mountChart();
    try {
        await flushPromises();
        const state = wrapper.vm.$.setupState;
        const area = state.drawingArea;
        expect(state.isVolume).toBe(false);
        expect(area.plotBottom).toBe(area.bottom);
        expect(area.volumeHeight).toBe(0);
        expect(area.height).toBe(area.bottom - area.top);
        expect(state.volumeBars).toEqual([]);
    } finally {
        wrapper.unmount();
    }
});

test('volume pane sits below the price x axis with the configured ratio and gap', async () => {
    const wrapper = mountChart({
        config: volumeConfig({ heightRatio: 0.25, gap: 10 }),
    });
    try {
        await flushPromises();
        const state = wrapper.vm.$.setupState;
        const area = state.drawingArea;
        expect(area.plotHeight).toBeCloseTo(area.plotBottom - area.top);
        expect(area.volumeHeight).toBeCloseTo(area.plotHeight * 0.25);
        expect(area.volumeTop).toBeCloseTo(area.plotBottom - area.volumeHeight);
        expect(area.volumeTop).toBeCloseTo(area.bottom + 10);
        expect(area.height).toBeCloseTo(area.bottom - area.top);
        expect(state.yLabels[0].y).toBeCloseTo(area.bottom);
    } finally {
        wrapper.unmount();
    }
});

test('volume heightRatio is clamped', async () => {
    const wrapper = mountChart({
        config: volumeConfig({ heightRatio: 5, gap: 0 }),
    });
    try {
        await flushPromises();
        const state = wrapper.vm.$.setupState;
        const area = state.drawingArea;
        expect(area.volumeHeight).toBeCloseTo(area.plotHeight * 0.8);
    } finally {
        wrapper.unmount();
    }
});

test('volume bars are proportional to the visible max and rest on the baseline', async () => {
    const wrapper = mountChart({ config: volumeConfig() });
    try {
        await flushPromises();
        const state = wrapper.vm.$.setupState;
        const { plotBottom: bottom, volumeHeight: height } = state.drawingArea;
        const bars = state.volumeBars;
        const volumes = state.drawableDataset.map((d) => d.volume);
        const max = Math.max(...volumes);

        expect(bars).toHaveLength(volumes.length);
        bars.forEach((bar, i) => {
            expect(bar.y + bar.height).toBeCloseTo(bottom);
            expect(bar.height).toBeCloseTo((volumes[i] / max) * height);
        });
        expect(bars[volumes.indexOf(max)].height).toBeCloseTo(height);
    } finally {
        wrapper.unmount();
    }
});

test('volume max follows the zoom window', async () => {
    const wrapper = mountChart({ config: volumeConfig() });
    try {
        await flushPromises();
        wrapper.vm.setZoomState({ start: 0, end: 4 });
        await nextTick();
        const state = wrapper.vm.$.setupState;
        expect(state.volumeBars).toHaveLength(4);
        expect(state.volumeBars[3].height).toBeCloseTo(
            state.drawingArea.volumeHeight,
        );
        expect(state.volumeMaxLabel).toBe('103');
    } finally {
        wrapper.unmount();
    }
});

test('volume bars use candle colors or a fixed color', async () => {
    const mixed = [
        [Date.UTC(2024, 0, 1), 10, 20, 5, 15, 100], // bullish
        [Date.UTC(2024, 1, 1), 15, 20, 5, 10, 200], // bearish
    ];
    const candle = { colors: { bullish: '#00ff00', bearish: '#ff0000' } };

    const byCandle = mountChart({
        dataset: mixed,
        config: {
            style: {
                layout: { candle, volume: { show: true, opacity: 100 } },
            },
        },
    });
    const fixed = mountChart({
        dataset: mixed,
        config: {
            style: {
                layout: {
                    candle,
                    volume: {
                        show: true,
                        useCandleColors: false,
                        color: '#0000ff',
                        opacity: 50,
                    },
                },
            },
        },
    });
    try {
        await flushPromises();
        const a = byCandle.vm.$.setupState.volumeBars;
        expect(a[0].fill.toLowerCase().startsWith('#00ff00')).toBe(true);
        expect(a[1].fill.toLowerCase().startsWith('#ff0000')).toBe(true);

        const b = fixed.vm.$.setupState.volumeBars;
        expect(b[0].fill.toLowerCase()).toBe('#0000ff80');
        expect(b[1].fill.toLowerCase()).toBe('#0000ff80');
    } finally {
        byCandle.unmount();
        fixed.unmount();
    }
});

test('zero or invalid volumes produce empty bars without NaN', async () => {
    const wrapper = mountChart({
        dataset: dataset.map((d) => [...d.slice(0, 5), 0]),
        config: volumeConfig(),
    });
    try {
        await flushPromises();
        const state = wrapper.vm.$.setupState;
        state.volumeBars.forEach((bar) => {
            expect(bar.height).toBe(0.0001);
            for (const v of [bar.x, bar.y, bar.width, bar.height]) {
                expect(Number.isNaN(v)).toBe(false);
            }
        });
    } finally {
        wrapper.unmount();
    }
});

test('volume max label honors prefix, suffix, rounding and formatter', async () => {
    const plain = mountChart({
        config: volumeConfig({
            dataLabels: { prefix: '$', suffix: 'k', roundingValue: 1 },
        }),
    });
    const formatter = vi.fn(({ value }) => `VOL ${value}`);
    const custom = mountChart({
        config: volumeConfig({ dataLabels: { formatter } }),
    });
    try {
        await flushPromises();
        expect(plain.vm.$.setupState.volumeMaxLabel).toBe('$107k');
        expect(custom.vm.$.setupState.volumeMaxLabel).toBe('VOL 107');
        expect(formatter).toHaveBeenCalled();
    } finally {
        plain.unmount();
        custom.unmount();
    }
});
