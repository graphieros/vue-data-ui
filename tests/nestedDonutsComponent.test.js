import { mount, flushPromises } from '@vue/test-utils';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import Chart from '../src/components/vue-ui-nested-donuts.vue';
vi.mock('../src/useResponsive', () => ({
    useResponsive: () => ({ width: 800, height: 500 }),
}));
const dataset = [
    {
        name: 'Outer',
        series: [
            { name: 'A', values: [10] },
            { name: 'B', values: [30] },
        ],
    },
    {
        name: 'Inner',
        series: [
            { name: 'C', values: [20] },
            { name: 'D', values: [80] },
        ],
    },
];
let wrappers, frames, id, now, observers;
beforeEach(() => {
    wrappers = [];
    frames = new Map();
    id = 0;
    now = 0;
    observers = [];
    vi.spyOn(performance, 'now').mockImplementation(() => now);
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
                config: {
                    startAnimation: { show: false },
                    serieToggleAnimation: { show: false },
                    ...config,
                },
            },
        },
    );
    wrappers.push(w);
    await flushPromises();
    return [w, w.vm.$.setupState];
}
function tick() {
    now += 50;
    const callbacks = [...frames.values()];
    frames.clear();
    callbacks.forEach((cb) => cb(now));
}
function finish() {
    for (let i = 0; frames.size && i < 100; i++) tick();
    expect(frames.size).toBe(0);
}
test('show-all tooltip formats each ring value', async () => {
    const [, s] = await chart({
        style: {
            chart: {
                tooltip: { showAllItemsAtIndex: true },
                layout: {
                    labels: {
                        dataLabels: {
                            formatter: ({ value }) => `amount=${value}`,
                        },
                    },
                },
            },
        },
    });
    const arc = s.flatArcs[0];
    s.useTooltip({ datapoint: arc, seriesIndex: 0, relativeIndex: 0 });
    expect(s.tooltipContent).toContain('Outer');
    expect(s.tooltipContent).toContain('Inner');
    expect(s.tooltipContent).toContain('amount=10');
    expect(s.tooltipContent).toContain('amount=20');
});
test('custom formatter runs once and receives current data', async () => {
    const format = vi.fn(() => '<b>custom</b>');
    const [, s] = await chart({
        style: { chart: { tooltip: { customFormat: format } } },
    });
    s.useTooltip({
        datapoint: s.flatArcs[0],
        seriesIndex: 0,
        relativeIndex: 0,
    });
    expect(format).toHaveBeenCalledTimes(1);
    expect(s.tooltipContent).toBe('<b>custom</b>');
});
test('keyboard navigation crosses rings and activates the correct arc', async () => {
    const [w, s] = await chart();
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('tabindex', '0');
    document.body.appendChild(svg);
    s.svgRef = svg;
    svg.focus();
    try {
        const key = (key) =>
            s.onSvgKeydown({
                key,
                preventDefault: vi.fn(),
                stopPropagation: vi.fn(),
            });
        key('ArrowRight');
        key('ArrowRight');
        key('ArrowRight');
        expect(s.activeTooltipIndex).toBe(2);
        expect(s.selectedDatapoint).toBe(s.flatArcs[2].id);
        key('Enter');
        expect(w.emitted('selectDatapoint').at(-1)[0].datapoint.id).toBe(
            s.flatArcs[2].id,
        );
    } finally {
        svg.remove();
    }
});
test('hidden totals and percentages stay consistent and selection clears', async () => {
    const [, s] = await chart();
    s.useTooltip({
        datapoint: s.flatArcs[0],
        seriesIndex: 0,
        relativeIndex: 0,
    });
    s.hideSeries('A');
    await flushPromises();
    expect(s.getData()[0].total).toBe(30);
    expect(s.mutableDataset[0].total).toBe(30);
    expect(s.mutableDataset[0].series[0].proportion).toBe(1);
    expect(s.selectedDatapoint).toBe(null);
});
test('duplicate names keep correct startup legend total', async () => {
    const [, s] = await chart(
        { startAnimation: { show: true, durationMs: 100, staggerMs: 10 } },
        [
            {
                name: 'Ring',
                series: [
                    { name: 'Same', values: [10] },
                    { name: 'Same', values: [30] },
                ],
            },
        ],
    );
    expect(s.legendSets[0][0].total).toBe(40);
    finish();
    expect(s.isFirstLoad).toBe(false);
});
test('startup has one frame loop, excludes ghosts from navigation, and cancels on unmount', async () => {
    const [w, s] = await chart({
        startAnimation: { show: true, durationMs: 100, staggerMs: 10 },
    });
    const ownFrame = s.startupFrame;
    expect(frames.has(ownFrame)).toBe(true);
    expect(s.flatArcs.some((a) => a.ghost)).toBe(false);
    w.unmount();
    expect(frames.has(ownFrame)).toBe(false);
});
test('new data cancels old startup frames', async () => {
    const [w, s] = await chart({
        startAnimation: { show: true, durationMs: 100, staggerMs: 10 },
    });
    const stale = frames.get(s.startupFrame);
    await w.setProps({
        dataset: [{ name: 'New', series: [{ name: 'X', values: [99] }] }],
    });
    await flushPromises();
    stale(1000);
    finish();
    expect(s.getData()[0].series[0].value).toBe(99);
    expect(s.ghostSlices).toEqual([]);
});
test('rapid legend toggles reverse safely without duplicate hidden IDs', async () => {
    const [w, s] = await chart({
        serieToggleAnimation: { show: true, durationMs: 100 },
    });
    const item = s.legendSets[0][0];
    s.segregateDonut(item);
    tick();
    s.segregateDonut(item);
    finish();
    await flushPromises();
    expect(s.segregated).toEqual([]);
    expect(s.mutableDataset[0].series[0].value).toBe(10);
    expect(w.emitted('selectLegend')).toHaveLength(1);
    s.hideSeries('A');
    s.hideSeries('A');
    finish();
    expect(s.segregated).toEqual([item.id]);
});
test('animation cancellation prevents late legend events', async () => {
    const [w, s] = await chart({
        serieToggleAnimation: { show: true, durationMs: 100 },
    });
    s.hideSeries('A');
    const ownFrame = s.toggleAnimations.values().next().value.frame;
    const stale = frames.get(ownFrame);
    w.unmount();
    stale(1000);
    expect(w.emitted('selectLegend')).toBeUndefined();
    expect(frames.has(ownFrame)).toBe(false);
});
test('loading finishes and observer disconnects when responsiveness is disabled', async () => {
    const [w, s] = await chart({ loading: true, responsive: true });
    s.nestedDonutsChart = { parentNode: {} };
    s.prepareChart();
    const observer = observers.at(-1);
    finish();
    expect(s.svg.width).toBe(800);
    await w.setProps({
        config: {
            loading: false,
            responsive: false,
            startAnimation: { show: false },
            style: { chart: { width: 600, height: 450 } },
        },
    });
    await flushPromises();
    expect(s.loading).toBe(false);
    expect(observer.disconnect).toHaveBeenCalled();
    expect(s.svg).toEqual({ width: 600, height: 450 });
});

test('custom legend slot renders when built-in legend is disabled', async () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const w = mount(Chart, {
        attachTo: host,
        props: {
            dataset,
            config: {
                startAnimation: { show: false },
                style: { chart: { legend: { show: false } } },
            },
        },
        slots: { legend: '<span data-test="custom-legend">Custom</span>' },
    });
    wrappers.push(w);
    try {
        await vi.dynamicImportSettled();
        await flushPromises();
        expect(
            document.querySelector('[data-test="custom-legend"]')?.textContent,
        ).toBe('Custom');
    } finally {
        w.unmount();
        host.remove();
    }
});
test('hiding several series concurrently preserves one per ring', async () => {
    const [, s] = await chart({
        serieToggleAnimation: { show: true, durationMs: 100 },
    });
    s.hideSeries('A');
    s.hideSeries('B');
    finish();
    await flushPromises();
    expect(s.mutableDataset[0].series.map((s) => s.name)).toEqual(['B']);
});
test('empty startup and zero-duration startup settle immediately', async () => {
    const [, empty] = await chart({
        loading: true,
        skeletonDataset: [],
        startAnimation: { show: true, durationMs: 0 },
    });
    expect(empty.isFirstLoad).toBe(false);
    expect(empty.donuts).toEqual([]);
    expect(Number.isFinite(empty.donutThickness)).toBe(true);
    const [, s] = await chart({
        startAnimation: { show: true, durationMs: 0 },
    });
    expect(s.getData()[0].series[0].value).toBe(10);
    expect(s.isFirstLoad).toBe(false);
});

test('reversing a show while another hide is pending keeps one visible series', async () => {
    const [, s] = await chart({
        serieToggleAnimation: { show: true, durationMs: 100 },
    });
    const a = s.legendSets[0][0],
        b = s.legendSets[0][1];
    s.segregateDonut(a);
    tick();
    s.segregateDonut(a);
    s.segregateDonut(b);
    s.segregateDonut(a);
    finish();
    await flushPromises();
    expect(s.mutableDataset[0].series.map((s) => s.name)).toEqual(['A']);
});
