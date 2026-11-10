import { mount, flushPromises } from '@vue/test-utils';
import { nextTick, reactive } from 'vue';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import Chart from '../src/components/vue-ui-history-plot.vue';
vi.mock('../src/useResponsive', () => ({
    useResponsive: () => ({ width: 800, height: 500 }),
}));
vi.mock('../src/useChartExport', () => ({
    useChartExport: () => ({
        isCallbackImaging: false,
        isCallbackSvg: false,
        generateSvg: vi.fn(),
        onGenerateImage: vi.fn(),
    }),
}));
vi.mock('../src/useTimeLabelCollider', () => ({
    useTimeLabelCollision: () => ({}),
}));
const dataset = [
    {
        id: 'a',
        name: 'A',
        values: [
            { id: 'a0', label: 'First', x: 1, y: 2 },
            { id: 'a1', label: 'Next', x: 3, y: 4 },
        ],
    },
    { id: 'b', name: 'B', values: [{ label: 'Other', x: 2, y: 3 }] },
];
let wrappers, observers, frames, frameId;
beforeEach(() => {
    wrappers = [];
    observers = [];
    frames = new Map();
    frameId = 0;
    vi.stubGlobal(
        'ResizeObserver',
        class {
            constructor(callback) {
                this.callback = callback;
                observers.push(this);
            }
            observe = vi.fn();
            disconnect = vi.fn();
        },
    );
    vi.stubGlobal('requestAnimationFrame', (cb) => {
        frames.set(++frameId, cb);
        return frameId;
    });
    vi.stubGlobal('cancelAnimationFrame', (id) => frames.delete(id));
});
afterEach(async () => {
    await vi.dynamicImportSettled();
    await flushPromises();
    wrappers.forEach((w) => w.unmount());
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});
async function chart(config = {}, data = dataset, real = false) {
    const w = mount(real ? Chart : { ...Chart, render: () => null }, {
        attachTo: document.body,
        props: { dataset: data, config },
        global: {
            stubs: {
                PenAndPaper: true,
                UserOptions: true,
                PackageVersion: true,
                Tooltip: true,
                Legend: true,
            },
        },
    });
    wrappers.push(w);
    await flushPromises();
    return [w, w.vm.$.setupState];
}
function finishFrames() {
    const callbacks = [...frames.values()];
    frames.clear();
    callbacks.forEach((cb) => cb());
}
test('validation recovers from malformed data and preserves detailed debug diagnostics', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const data = reactive([{ values: [{ x: 1, y: 2 }] }]);
    const [w, s] = await chart({}, data);
    expect(s.isDataset).toBe(false);
    expect(s.loading).toBe(true);
    expect(warn).not.toHaveBeenCalled();
    data[0].name = 'Fixed';
    await nextTick();
    expect(s.isDataset).toBe(true);
    expect(s.loading).toBe(false);
    await w.setProps({
        config: { debug: true },
        dataset: [{ name: 'Bad', values: [{ x: NaN, y: 2 }] }],
    });
    expect(warn).toHaveBeenCalledWith(
        'VueUiHistoryPlot: dataset[0].values[0].x must be a finite number.',
    );
    await w.setProps({ dataset: [null] });
    expect(s.loading).toBe(true);
});
test('loading and skeleton settings update reactively, without resetting user choices on unrelated updates', async () => {
    const [w, s] = await chart();
    w.vm.toggleTable();
    w.vm.toggleTooltip();
    await nextTick();
    await w.setProps({
        config: { style: { chart: { color: '#abcdef' } } },
        dataset: dataset.slice(0, 1),
    });
    expect(s.mutableConfig).toEqual({ showTable: true, showTooltip: false });
    await w.setProps({
        config: {
            loading: true,
            skeletonDataset: [{ name: 'Skeleton', values: [{ x: 5, y: 5 }] }],
            skeletonConfig: {
                style: { chart: { backgroundColor: '#abcdef' } },
            },
        },
    });
    expect(s.loading).toBe(true);
    expect(s.formattedDataset[0].name).toBe('Skeleton');
    expect(s.cfgChart.backgroundColor).toBe('#abcdef');
    await w.setProps({ config: {} });
    expect(s.loading).toBe(false);
    expect(s.drawableDataset[0].name).toBe('A');
});
test('hidden series and selected plot IDs survive reordering and geometry changes', async () => {
    const enter = vi.fn();
    const [w, s] = await chart({ events: { datapointEnter: enter } });
    w.vm.hideSeries('B');
    await nextTick();
    const plot = s.drawableDataset[0].plots[1];
    s.useTooltip({ datapoint: plot, seriesIndex: 0, plotIndex: 1 });
    await w.setProps({
        dataset: [
            dataset[1],
            {
                ...dataset[0],
                values: [
                    { ...dataset[0].values[1], y: 10 },
                    dataset[0].values[0],
                ],
            },
        ],
    });
    expect(s.segregated).toEqual([0]);
    expect(s.drawableDataset).toHaveLength(1);
    expect(s.selectedDatapoint.id).toBe(plot.id);
    expect(s.selectedDatapoint.valueY).toBe(10);
    expect(s.activeTooltipSeriesIndex).toBe(1);
    expect(s.activeTooltipPlotIndex).toBe(0);
    expect(enter).toHaveBeenCalledTimes(1);
    const id = s.drawableDataset[0].plots[0].id;
    await w.setProps({
        config: {
            events: { datapointEnter: enter },
            style: { chart: { width: 900 } },
        },
    });
    expect(s.drawableDataset[0].plots[0].id).toBe(id);
    w.vm.hideSeries('A');
    await nextTick();
    expect(s.selectedDatapoint).toBe(null);
    expect(s.dataTooltipSlot).toBe(null);
});
test.each([
    [{ name: 'Zeros', values: [{ x: 0, y: 0 }] }],
    [{ name: 'Negative', values: [{ x: -5, y: -5 }] }],
    [{ name: 'Empty', values: [] }],
])('zero ranges and empty series keep scales finite: %j', async (serie) => {
    const [, s] = await chart({}, [serie]);
    for (const axis of ['x', 'y']) {
        expect(Number.isFinite(s.scales[axis].min)).toBe(true);
        expect(s.scales[axis].max).toBeGreaterThan(s.scales[axis].min);
    }
    for (const point of s.drawableDataset[0].plots) {
        expect(Number.isFinite(point.x)).toBe(true);
        expect(Number.isFinite(point.y)).toBe(true);
    }
    s.toggleLegend();
    await nextTick();
    expect(s.drawableDataset).toEqual([]);
    expect(s.scales.x.max).toBeGreaterThan(s.scales.x.min);
});
test('responsive lifecycle restores fixed dimensions and font sizes, with no stale work', async () => {
    const [w, s] = await chart({ responsive: true }, dataset, true);
    finishFrames();
    await nextTick();
    expect(s.svg).toEqual({ width: 800, height: 500 });
    const observer = observers.at(-1);
    observer.callback();
    await w.setProps({
        config: {
            responsive: false,
            style: { chart: { width: 900, height: 600 } },
        },
    });
    finishFrames();
    expect(observer.disconnect).toHaveBeenCalled();
    expect(s.svg).toEqual({ width: 900, height: 600 });
    expect(s.sizes.plots).toBe(s.cfgPlots.radius);
    observer.callback();
    expect(frames.size).toBe(0);
    await w.setProps({ config: { responsive: true } });
    const latest = observers.at(-1);
    w.unmount();
    latest.callback();
    expect(frames.size).toBe(0);
});
test('drawing bounds agree with axis geometry when offsets are configured', async () => {
    const [, s] = await chart({
        style: { chart: { axes: { y: { name: { offsetX: 20 } } } } },
    });
    expect(s.drawingArea.right - s.drawingArea.left).toBe(s.drawingArea.width);
    expect(s.setDimensionX(s.scales.x.max)).toBeCloseTo(s.drawingArea.right);
});
test('temperature bounds and plot colors are prepared once and reused during interaction', async () => {
    const data = [
        {
            name: 'Temperature',
            temperatureColors: ['#0000ff', '#ff0000'],
            temperatureIndependant: true,
            values: Array.from({ length: 1000 }, (_, i) => ({
                x: i,
                y: i % 20,
            })),
        },
    ];
    const [, s] = await chart({}, data);
    const serie = s.drawableDataset[0];
    const styles = s.temperatureStyles;
    let coordinateReads = 0;
    for (const plot of serie.plots) {
        const x = plot.x;
        Object.defineProperty(plot, 'x', {
            get() {
                coordinateReads++;
                return x;
            },
        });
    }
    for (let i = 0; i < 5; i++)
        for (const plot of serie.plots)
            expect(s.getTemperaturePlotColor(serie, plot)).toBe(
                styles.get(0).colors.get(plot.id),
            );
    expect(coordinateReads).toBe(0);
    s.useTooltip({ datapoint: serie.plots[10], plotIndex: 10, seriesIndex: 0 });
    await nextTick();
    expect(s.temperatureStyles).toBe(styles);
});
test('keyboard navigation skips empty series and clears selection and slots on escape', async () => {
    const click = vi.fn();
    const [w, s] = await chart(
        {
            events: { datapointClick: click },
            style: {
                chart: {
                    axes: { x: { labels: { autoRotate: { enable: false } } } },
                },
            },
        },
        [{ name: 'Empty', values: [] }, ...dataset],
        true,
    );
    w.find('svg').element.focus();
    await w.find('svg').trigger('keydown', { key: 'ArrowRight' });
    expect(s.activeTooltipSeriesIndex).toBe(1);
    await w.find('svg').trigger('keydown', { key: 'ArrowRight' });
    expect(s.activeTooltipSeriesIndex).toBe(2);
    await w.find('svg').trigger('keydown', { key: 'Enter' });
    expect(click.mock.calls[0][0].seriesIndex).toBe(2);
    await w.find('svg').trigger('keydown', { key: 'Escape' });
    expect(s.selectedDatapoint).toBe(null);
    expect(s.dataTooltipSlot).toBe(null);
});

test('identity retention stays bounded during streaming updates and survives loading', async () => {
    const keep = {
        id: 'keep',
        name: 'Keep',
        values: [{ id: 'keep-point', x: 0, y: 1 }],
    };
    const [w, s] = await chart({}, [keep]);
    const seriesId = s.seriesKeys[0];
    const pointId = s.plotKeys[0][0];
    for (let i = 0; i < 30; i++) {
        await w.setProps({
            dataset: [
                keep,
                {
                    id: `s${i}`,
                    name: `S${i}`,
                    values: [{ id: `p${i}`, label: `L${i}`, x: i, y: i + 1 }],
                },
            ],
        });
        expect(s.seriesKeys[0]).toBe(seriesId);
        expect(s.plotKeys[0][0]).toBe(pointId);
        expect(s.identityCache.size).toBe(4);
    }
    await w.setProps({ config: { loading: true } });
    void s.plotKeys;
    await w.setProps({ config: { loading: false } });
    expect(s.seriesKeys[0]).toBe(seriesId);
    expect(s.plotKeys[0][0]).toBe(pointId);
});
