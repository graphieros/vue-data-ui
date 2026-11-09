import { mount, flushPromises } from '@vue/test-utils';
import { h, nextTick } from 'vue';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import VueUiQuadrant from '../src/components/vue-ui-quadrant.vue';
const dataset = [
    {
        name: 'A',
        series: [
            { name: 'TL', x: -2, y: 3 },
            { name: 'BR', x: 3, y: -4 },
        ],
    },
    {
        name: 'B',
        series: [
            { name: 'TR', x: 4, y: 5 },
            { name: 'BL', x: -6, y: -2 },
        ],
    },
];
let frames, id, observer;
beforeEach(() => {
    frames = new Map();
    id = 0;
    vi.stubGlobal(
        'requestAnimationFrame',
        vi.fn((callback) => {
            frames.set(++id, callback);
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
        { ...VueUiQuadrant, render: () => null },
        { props: { dataset, ...props } },
    );
const finishFrames = () => {
    for (let i = 0; frames.size && i < 200; i++) {
        const callbacks = [...frames.values()];
        frames.clear();
        callbacks.forEach((callback) => callback());
    }
    expect(frames.size).toBe(0);
};

test('all zoom targets and reset finish at the exact target', async () => {
    const w = mountChart({
        config: { zoomEnabled: true, zoomAnimationFrames: 7 },
    });
    try {
        await flushPromises();
        const s = w.vm.$.setupState;
        for (const side of s.quadrantSides) {
            s.selectQuadrantSide(side.id);
            finishFrames();
            expect(s.selectedSide).toBe(side.id);
            expect(s.isAnimating).toBe(false);
            expect(s.mutableSvg.width).toBe(s.svg.width / 2 + 48);
            expect(s.mutableSvg.height).toBe(s.svg.height / 2 + 48);
            expect(s.mutableSvg.startX).toBe(
                side.right ? s.svg.width / 2 - 48 : 0,
            );
            expect(s.mutableSvg.startY).toBe(
                side.bottom ? s.svg.height / 2 - 48 : 0,
            );
        }
        expect(
            w.emitted('selectSide').map((event) => event[0].quadrantSide),
        ).toEqual(['tl', 'tr', 'br', 'bl']);
        s.selectQuadrantSide('BL');
        finishFrames();
        expect(s.isZoom).toBe(false);
        expect(s.selectedSide).toBeNull();
        expect(s.mutableSvg.width).toBe(s.svg.width);
        expect(s.mutableSvg.startX).toBe(0);
    } finally {
        w.unmount();
    }
});

test('invalid animation counts cannot produce infinite coordinates', async () => {
    for (const zoomAnimationFrames of [0, -2]) {
        const w = mountChart({
            config: { zoomEnabled: true, zoomAnimationFrames },
        });
        try {
            await flushPromises();
            const s = w.vm.$.setupState;
            s.selectQuadrantSide('TR');
            finishFrames();
            expect(s.isAnimating).toBe(false);
            expect(Number.isFinite(s.mutableSvg.startX)).toBe(true);
            expect(Number.isFinite(s.mutableSvg.width)).toBe(true);
        } finally {
            w.unmount();
        }
    }
});

test('fixed size updates cancel animation and reset zoom state', async () => {
    const w = mountChart({ config: { zoomEnabled: true } });
    try {
        await flushPromises();
        const s = w.vm.$.setupState;
        s.selectQuadrantSide('BR');
        const stale = [...frames.values()];
        await w.setProps({
            config: {
                zoomEnabled: true,
                style: { chart: { width: 700, height: 400 } },
            },
        });
        await flushPromises();
        expect(s.svg.width).toBe(700);
        expect(s.svg.height).toBe(400);
        expect(s.isZoom).toBe(false);
        expect(s.selectedSide).toBeNull();
        expect(s.isAnimating).toBe(false);
        stale.forEach((callback) => callback());
        expect(s.mutableSvg.width).toBe(700);
        expect(s.mutableSvg.startX).toBe(0);
    } finally {
        w.unmount();
    }
});

test('unmount cancels queued zoom frames', async () => {
    const w = mountChart({ config: { zoomEnabled: true } });
    await flushPromises();
    const s = w.vm.$.setupState;
    s.selectQuadrantSide('TL');
    const frame = s.currentAnimationFrame;
    const callback = frames.get(frame);
    w.unmount();
    const snapshot = { ...s.mutableSvg };
    expect(frames.has(frame)).toBe(false);
    callback();
    expect(s.mutableSvg).toEqual(snapshot);
});

test('auto zero-only axes keep finite plot coordinates', async () => {
    const w = mountChart({
        dataset: [{ name: 'Zero', series: [{ name: 'Origin', x: 0, y: 0 }] }],
        config: {
            style: {
                chart: {
                    layout: {
                        grid: { xAxis: { auto: true }, yAxis: { auto: true } },
                    },
                },
            },
        },
    });
    try {
        await flushPromises();
        const s = w.vm.$.setupState;
        const plot = s.drawableDataset[0].series[0];
        expect(plot.x).toBe(s.svg.centerX);
        expect(plot.y).toBe(s.svg.centerY);
        expect(w.vm.getData()[0].series[0]).toMatchObject({
            x: 0,
            y: 0,
            quadrantSide: 'tr',
        });
    } finally {
        w.unmount();
    }
});

test('plot identities and selected payload survive palette and size changes', async () => {
    const w = mountChart();
    try {
        await flushPromises();
        const s = w.vm.$.setupState;
        const ids = s.a11yPlots.map((entry) => entry.plot.uid);
        const entry = s.a11yPlots[2];
        s.useTooltip(
            entry.category,
            entry.plot,
            entry.categoryIndex,
            'keyboard',
            2,
        );
        await w.setProps({
            config: {
                customPalette: ['#ff0000', '#00ff00'],
                style: { chart: { width: 800, height: 450 } },
            },
        });
        await flushPromises();
        expect(s.a11yPlots.map((entry) => entry.plot.uid)).toEqual(ids);
        expect(s.hoveredPlotId).toBe(ids[2]);
        expect(s.dataTooltipSlot.datapoint.x).toBe(s.a11yPlots[2].plot.x);
        w.vm.hideSeries('A');
        await nextTick();
        expect(s.activeTooltipIndex).toBe(0);
        expect(s.hoveredPlotId).toBe(ids[2]);
        w.vm.hideSeries('B');
        await nextTick();
        expect(s.hoveredPlotId).toBeNull();
        expect(s.isTooltip).toBe(false);
    } finally {
        w.unmount();
    }
});

test('hiding categories does not change automatic axis bounds', async () => {
    const w = mountChart({
        config: {
            style: {
                chart: {
                    layout: {
                        grid: { xAxis: { auto: true }, yAxis: { auto: true } },
                    },
                },
            },
        },
    });
    try {
        await flushPromises();
        const s = w.vm.$.setupState;
        const before = JSON.parse(JSON.stringify(s.axisValues));
        w.vm.hideSeries('B');
        expect(s.axisValues).toEqual(before);
    } finally {
        w.unmount();
    }
});

test('tooltip custom formatter runs once and invalid output uses default', async () => {
    const customFormat = vi.fn(() => 'Custom');
    const enter = vi.fn();
    const w = mountChart({
        config: {
            style: { chart: { tooltip: { customFormat } } },
            events: { datapointEnter: enter },
        },
    });
    try {
        await flushPromises();
        const s = w.vm.$.setupState;
        const entry = s.a11yPlots[0];
        s.useTooltip(entry.category, entry.plot, entry.categoryIndex);
        expect(customFormat).toHaveBeenCalledTimes(1);
        expect(customFormat.mock.calls[0][0].datapoint).toBe(entry.plot);
        expect(s.tooltipContent).toBe('Custom');
        expect(enter).toHaveBeenCalledTimes(1);
        customFormat.mockReturnValue(null);
        s.useTooltip(entry.category, entry.plot, entry.categoryIndex);
        expect(customFormat).toHaveBeenCalledTimes(2);
        expect(s.tooltipContent).toContain('TL');
    } finally {
        w.unmount();
    }
});

test('responsive mode disconnects its observer when disabled', async () => {
    const w = mountChart();
    try {
        await flushPromises();
        const s = w.vm.$.setupState;
        const parent = document.createElement('div');
        const chart = document.createElement('div');
        parent.appendChild(chart);
        parent.getBoundingClientRect = () => ({ width: 800, height: 500 });
        s.quadrantChart = chart;
        await w.setProps({ config: { responsive: true } });
        const active = observer;
        finishFrames();
        await nextTick();
        expect(s.svg.width).toBe(800);
        expect(s.svg.height).toBe(500);
        active.callback();
        await w.setProps({ config: { responsive: false } });
        expect(active.disconnect).toHaveBeenCalled();
        const calls = requestAnimationFrame.mock.calls.length;
        active.callback();
        expect(requestAnimationFrame).toHaveBeenCalledTimes(calls);
    } finally {
        w.unmount();
    }
});

test('loading transitions restore mutable controls', async () => {
    const w = mountChart({ config: { loading: true } });
    try {
        await flushPromises();
        const s = w.vm.$.setupState;
        await w.setProps({
            config: {
                loading: false,
                style: {
                    chart: {
                        tooltip: { show: false },
                        layout: { labels: { plotLabels: { show: false } } },
                    },
                },
            },
        });
        await flushPromises();
        expect(s.loading).toBe(false);
        expect(s.mutableConfig.showTooltip).toBe(false);
        expect(s.mutableConfig.plotLabels.show).toBe(false);
        expect(w.vm.getData().map((category) => category.name)).toEqual([
            'A',
            'B',
        ]);
    } finally {
        w.unmount();
    }
});

test('table visibility is safe before mounting a table', async () => {
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

test('palette changes preserve an existing zoom when dimensions stay the same', async () => {
    const wrapper = mountChart({ config: { zoomEnabled: true } });
    try {
        await flushPromises();
        const state = wrapper.vm.$.setupState;
        state.selectQuadrantSide('TR');
        finishFrames();
        const view = { ...state.mutableSvg };
        await wrapper.setProps({
            config: {
                zoomEnabled: true,
                customPalette: ['#ff0000', '#00ff00'],
            },
        });
        await flushPromises();
        expect(state.selectedSide).toBe('TR');
        expect(state.isZoom).toBe(true);
        expect(state.mutableSvg).toEqual(view);
    } finally {
        wrapper.unmount();
    }
});

for (const slotName of ['datapoint', 'datapointSvg']) {
    test(`${slotName} keeps pointer and click payloads after hiding an earlier category`, async () => {
        const wrapper = mount(VueUiQuadrant, {
            props: {
                dataset,
                config: { style: { chart: { legend: { show: false } } } },
            },
            slots: {
                [slotName]: ({ datapoint }) =>
                    h(slotName === 'datapoint' ? 'button' : 'circle', {
                        'data-test': 'custom-point',
                        onMouseenter: datapoint.onEnter,
                        onMouseleave: datapoint.onLeave,
                        onClick: datapoint.onClick,
                    }),
            },
        });
        try {
            await flushPromises();
            await vi.dynamicImportSettled();
            wrapper.vm.hideSeries('A');
            await nextTick();
            const point = wrapper.findAll('[data-test="custom-point"]')[0];
            await point.trigger('mouseenter');
            expect(wrapper.vm.$.setupState.dataTooltipSlot.seriesIndex).toBe(0);
            await point.trigger('click');
            expect(wrapper.emitted('selectPlot')[0][0]).toMatchObject({
                category: 'B',
                itemName: 'TR',
                x: 4,
                y: 5,
                quadrantSide: 'tr',
            });
            await point.trigger('mouseleave');
            expect(wrapper.vm.$.setupState.hoveredPlotId).toBeNull();
        } finally {
            wrapper.unmount();
        }
    });
}
