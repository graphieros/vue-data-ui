import { mount, flushPromises } from '@vue/test-utils';
import { beforeEach, afterEach, expect, test, vi } from 'vitest';
import Chart from '../src/components/vue-ui-onion.vue';
vi.mock('../src/useResponsive', () => ({
    useResponsive: () => ({ width: 800, height: 500 }),
}));
const dataset = [
    { name: 'A', percentage: 25, value: 1234.5 },
    { name: 'B', percentage: 50, value: 20 },
    { name: 'C', percentage: 75, value: 30 },
];
let wrappers, frames, id, observers;
beforeEach(() => {
    wrappers = [];
    frames = new Map();
    id = 0;
    observers = [];
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
                config: { useStartAnimation: false, ...config },
                dataset: data,
            },
        },
    );
    wrappers.push(w);
    await flushPromises();
    return [w, w.vm.$.setupState];
}
function finish() {
    for (let i = 0; frames.size && i < 500; i++) {
        const callbacks = [...frames.values()];
        frames.clear();
        callbacks.forEach((cb) => cb());
    }
    expect(frames.size).toBe(0);
}
test('loading finishes without needing another dataset update', async () => {
    const [w, s] = await chart({ loading: true });
    await w.setProps({ config: { loading: false, useStartAnimation: false } });
    await flushPromises();
    expect(s.loading).toBe(false);
    expect(s.mutableDataset[0].name).toBe('A');
});
test('custom tooltip formatter is called once', async () => {
    const format = vi.fn(() => '<b>custom</b>');
    const [, s] = await chart({
        style: { chart: { tooltip: { customFormat: format } } },
    });
    s.useTooltip({ datapoint: s.mutableDataset[0], seriesIndex: 0 });
    expect(format).toHaveBeenCalledTimes(1);
    expect(s.tooltipContent).toBe('<b>custom</b>');
});
test('selection follows its series when filtering shifts its index', async () => {
    const click = vi.fn(),
        enter = vi.fn();
    const [, s] = await chart({
        events: { datapointClick: click, datapointEnter: enter },
    });
    s.useTooltip({ datapoint: s.mutableDataset[1], seriesIndex: 1 });
    s.hideSeries('A');
    await flushPromises();
    expect(s.selectedSerie).toBe(0);
    expect(s.activeTooltipIndex).toBe(0);
    expect(s.dataTooltipSlot.datapoint.name).toBe('B');
    expect(enter).toHaveBeenCalledTimes(1);
    s.hideSeries('B');
    await flushPromises();
    expect(s.selectedSerie).toBeUndefined();
    expect(s.isTooltip).toBe(false);
});
test('tables use locale formatting and accessibility names contain no markup', async () => {
    const [, s] = await chart({ table: { td: { roundingValue: 2 } } });
    expect(s.a11yTable.rows[0][0]).toBe('A');
    expect(s.a11yTable.rows[0][2]).toBe(
        (1234.5).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }),
    );
    expect(s.dataTable.body[0][0]).toContain('<span');
});
test('startup settles and cancels stale frames on data replacement and unmount', async () => {
    const [w, s] = await chart({ useStartAnimation: true });
    const own = s.animationFrame;
    const stale = frames.get(own);
    expect(own).not.toBe(null);
    await w.setProps({ dataset: [{ name: 'New', percentage: 40, value: 4 }] });
    await flushPromises();
    stale();
    finish();
    expect(s.mutableDataset[0].name).toBe('New');
    expect(s.mutableDataset[0].percentage).toBe(40);
    expect(s.isLoaded).toBe(true);
    w.unmount();
    expect(frames.has(s.animationFrame)).toBe(false);
});
test('startup frame is canceled on unmount', async () => {
    const [w, s] = await chart({ useStartAnimation: true });
    const own = s.animationFrame;
    const stale = frames.get(own);
    w.unmount();
    expect(frames.has(own)).toBe(false);
    stale();
    expect(frames.has(own)).toBe(false);
});
test('responsive observer disconnects and fixed dimensions are restored', async () => {
    const [w, s] = await chart({ responsive: true });
    s.onionChart = { parentNode: {} };
    s.prepareChart();
    const observer = observers.at(-1);
    finish();
    await flushPromises();
    expect(s.svg.width).toBe(800);
    await w.setProps({
        config: { responsive: false, useStartAnimation: false },
    });
    await flushPromises();
    expect(observer.disconnect).toHaveBeenCalled();
    expect(s.svg.width).toBe(512);
    expect(s.svg.padding).toEqual({ top: 64, right: 64, bottom: 64, left: 64 });
});
test('circle layers preserve active dashes and full gutter traps', async () => {
    const [, s] = await chart();
    const onion = s.mutableDataset[0];
    expect(s.circleAttrs(onion, 'gradient')['stroke-dashoffset']).toBe(
        onion.path.dashOffset,
    );
    expect(s.circleAttrs(onion, 'gutter')['stroke-dashoffset']).toBe(0);
    expect(s.circleAttrs({ ...onion, radius: 0 }, 'track').r).toBe(0);
    expect(s.circleAttrs({ ...onion, radius: 0 }, 'gradient').r).toBe(0.0001);
});
test('empty custom skeleton has finite thickness', async () => {
    const [, s] = await chart({ loading: true, skeletonDataset: [] });
    expect(s.mutableDataset).toEqual([]);
    expect(Number.isFinite(s.onionSkin.track)).toBe(true);
});

test('label fitting waits for transitions and cancels pending measurement on unmount', async () => {
    vi.useFakeTimers();
    const [w, s] = await chart();
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 512 512');
    const label = document.createElementNS(svg.namespaceURI, 'text');
    label.setAttribute('class', 'vue-ui-onion-label vue-data-ui-transition');
    svg.appendChild(label);
    const originalBBox = SVGElement.prototype.getBBox;
    const measure = vi.fn(() => ({ x: 10, y: 10, width: 20, height: 10 }));
    SVGElement.prototype.getBBox = measure;
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({
        transitionProperty: 'transform',
        transitionDuration: '0.2s',
        transitionDelay: '0s',
    });
    try {
        s.svgRef = svg;
        s.scheduleAutoSizeLabels();
        await flushPromises();
        finish();
        expect(measure).not.toHaveBeenCalled();
        await vi.advanceTimersByTimeAsync(234);
        expect(measure).toHaveBeenCalled();
        measure.mockClear();
        s.scheduleAutoSizeLabels();
        await flushPromises();
        finish();
        w.unmount();
        await vi.advanceTimersByTimeAsync(300);
        expect(measure).not.toHaveBeenCalled();
    } finally {
        SVGElement.prototype.getBBox = originalBBox;
        vi.useRealTimers();
    }
});
