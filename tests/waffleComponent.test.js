import { mount, flushPromises } from '@vue/test-utils';
import { beforeEach, afterEach, test, expect, vi } from 'vitest';
import Chart from '../src/components/vue-ui-waffle.vue';
vi.mock('../src/useResponsive', () => ({
    useResponsive: () => ({ width: 800, height: 500 }),
}));
const dataset = [
    { name: 'A', values: [10] },
    { name: 'B', values: [20] },
    { name: 'C', values: [30] },
];
let wrappers, frames, id, observers;
beforeEach(() => {
    wrappers = [];
    frames = new Map();
    id = 0;
    observers = [];
    vi.stubGlobal('matchMedia', () => ({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
    }));
    vi.stubGlobal(
        'requestAnimationFrame',
        vi.fn((cb) => {
            frames.set(++id, cb);
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
            constructor(cb) {
                this.callback = cb;
                observers.push(this);
            }
            observe = vi.fn();
            disconnect = vi.fn();
        },
    );
});
afterEach(() => {
    wrappers.forEach((w) => w.unmount());
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});
async function chart(config = {}, data = dataset) {
    const w = mount(
        { ...Chart, render: () => null },
        {
            props: {
                dataset: data,
                config: { useAnimation: false, ...config },
            },
        },
    );
    wrappers.push(w);
    await flushPromises();
    return [w, w.vm.$.setupState];
}
function tick() {
    const callbacks = [...frames.values()];
    frames.clear();
    callbacks.forEach((cb) => cb());
}
function finish() {
    for (let i = 0; frames.size && i < 500; i++) tick();
    expect(frames.size).toBe(0);
}
test('empty arrays and remaining zero series allocate a complete finite grid', async () => {
    const [, s] = await chart({}, [
        { name: 'A', values: [10] },
        { name: 'B', values: [] },
        { name: 'C', values: [0] },
    ]);
    expect(
        s
            .getData()
            .map((d) => d.squareCount)
            .reduce((a, b) => a + b),
    ).toBe(s.totalGridSquares);
    s.hideSeries('A');
    await flushPromises();
    expect(s.squareCounts.every(Number.isFinite)).toBe(true);
    expect(s.rects).toHaveLength(s.totalGridSquares);
    expect(s.squareCounts[0]).toBe(s.squareCounts[1]);
    s.useTooltip(0);
    expect(s.tooltipContent).toContain('50%');
});
test('allocation is stable for tied fractions and fills the requested grid', async () => {
    const [, s] = await chart({
        style: { chart: { layout: { grid: { size: 3 } } } },
    });
    expect(s.calculateSquareCounts([1, 1, 1, 1])).toEqual([3, 2, 2, 2]);
    expect(s.calculateSquareCounts([])).toEqual([]);
});
test('nonanimated legend changes emit their committed selection', async () => {
    const [w, s] = await chart();
    s.hideSeries('A');
    expect(w.emitted('selectLegend')).toHaveLength(1);
    expect(w.emitted('selectLegend')[0][0].map((d) => d.name)).toEqual([
        'B',
        'C',
    ]);
    s.toggleLegend();
    expect(w.emitted('selectLegend')).toHaveLength(2);
});
test('rapid animation reversal cancels stale work and does not duplicate IDs', async () => {
    const [w, s] = await chart({ useAnimation: true });
    s.hideSeries('A');
    const stale = frames.get(s.animations.get('serie_0').frame);
    s.segregate('serie_0');
    stale();
    finish();
    await flushPromises();
    expect(s.segregated).toEqual([]);
    expect(s.datasetCopy[0].values).toEqual([10]);
    expect(w.emitted('selectLegend')).toHaveLength(1);
    s.hideSeries('A');
    s.hideSeries('A');
    finish();
    expect(s.segregated).toEqual(['serie_0']);
});
test('concurrent hides preserve one series', async () => {
    const [, s] = await chart({ useAnimation: true });
    s.hideSeries('A');
    s.hideSeries('B');
    s.hideSeries('C');
    finish();
    await flushPromises();
    expect(s.waffleSet.map((d) => d.name)).toEqual(['C']);
});
test('data replacement and unmount cancel animation frames and late events', async () => {
    const [w, s] = await chart({ useAnimation: true });
    s.hideSeries('A');
    const own = s.animations.get('serie_0').frame,
        stale = frames.get(own);
    await w.setProps({ dataset: [{ name: 'New', values: [99] }] });
    await flushPromises();
    stale();
    expect(s.animations.size).toBe(0);
    expect(s.getData()[0].value).toBe(99);
    expect(w.emitted('selectLegend')).toBeUndefined();
    await w.setProps({ dataset });
    await flushPromises();
    s.hideSeries('A');
    const second = s.animations.get('serie_0').frame;
    w.unmount();
    expect(frames.has(second)).toBe(false);
});
test('selection follows series identity and formatter runs once per update', async () => {
    const format = vi.fn(() => '<b>custom</b>'),
        enter = vi.fn();
    const [, s] = await chart({
        events: { datapointEnter: enter },
        style: { chart: { tooltip: { customFormat: format } } },
    });
    s.useTooltip(s.rects.findIndex((r) => r.name === 'B'));
    expect(format).toHaveBeenCalledTimes(1);
    s.hideSeries('A');
    await flushPromises();
    expect(s.selectedSerie).toBe(0);
    expect(s.dataTooltipSlot.datapoint.name).toBe('B');
    expect(enter).toHaveBeenCalledTimes(1);
    s.hideSeries('B');
    await flushPromises();
    expect(s.isTooltip).toBe(false);
});
test('invalid cell interactions are harmless and accessibility labels are plain names', async () => {
    const [, s] = await chart();
    expect(() => s.selectDatapoint(-1)).not.toThrow();
    expect(() => s.onTrapLeave(-1)).not.toThrow();
    expect(s.a11yTable.rows[0][0]).toBe('A');
});
test('loading recovers and responsive mode disconnects and restores fixed sizing', async () => {
    const [w, s] = await chart({ loading: true, responsive: true });
    s.waffleChart = { parentNode: {} };
    s.prepareChart();
    const observer = observers.at(-1);
    finish();
    expect(s.drawingArea.width).toBe(800);
    await w.setProps({
        config: { loading: false, responsive: false, useAnimation: false },
    });
    await flushPromises();
    expect(s.loading).toBe(false);
    expect(s.svg).toEqual({ width: 512, height: 512 });
    expect(observer.disconnect).toHaveBeenCalled();
});
test('selection wraps reuse cached series boundaries', async () => {
    const [, s] = await chart({
        style: {
            chart: {
                layout: {
                    rect: { merged: true, selection: { wrap: { show: true } } },
                },
            },
        },
    });
    const paths = s.serieBoundaryPolygons;
    s.useTooltip(0);
    expect(s.serieBoundaryPolygons).toBe(paths);
    expect(s.selectionWrapPolygons.length).toBeGreaterThan(0);
});
test('empty SVG cell slot renders safely when all series are hidden', async () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const w = mount(Chart, {
        attachTo: host,
        props: { dataset, config: { useAnimation: false } },
        slots: { cellSvg: () => '<text>cell</text>' },
    });
    wrappers.push(w);
    try {
        await vi.dynamicImportSettled();
        await flushPromises();
        expect(w.findAll('radialGradient')).toHaveLength(dataset.length);
        w.vm.$.setupState.toggleLegend();
        await flushPromises();
        expect(w.vm.$.setupState.cellPositions).toEqual([]);
        expect(w.findAll('[data-cy="tooltip-trap"]')).toHaveLength(0);
    } finally {
        w.unmount();
        host.remove();
    }
});

test('bulk hide and restore finish with unique IDs and no active animations', async () => {
    const [, s] = await chart({ useAnimation: true });
    s.toggleLegend();
    finish();
    await flushPromises();
    expect(new Set(s.segregated).size).toBe(dataset.length);
    expect(s.rects).toEqual([]);
    s.toggleLegend();
    finish();
    await flushPromises();
    expect(s.segregated).toEqual([]);
    expect(s.isAnimating).toBe(false);
    expect(s.rects).toHaveLength(s.totalGridSquares);
});
test('reduced motion toggles commit immediately and emit once', async () => {
    const [w, s] = await chart({ useAnimation: true });
    s.prefersReducedMotion = true;
    await flushPromises();
    s.hideSeries('A');
    expect(s.segregated).toEqual(['serie_0']);
    expect(s.animations.size).toBe(0);
    expect(w.emitted('selectLegend')).toHaveLength(1);
});

test('responsive config updates remeasure without replacing the observer', async () => {
    const [w, s] = await chart({ responsive: true });
    s.waffleChart = { parentNode: {} };
    s.prepareChart();
    finish();
    const observer = observers.at(-1);
    await w.setProps({
        config: {
            responsive: true,
            useAnimation: false,
            style: { chart: { title: { text: 'Updated title' } } },
        },
    });
    await flushPromises();
    expect(observers.at(-1)).toBe(observer);
    expect(s.resizeFrame).not.toBe(null);
    finish();
    expect(s.svg.width).toBe(800);
});
