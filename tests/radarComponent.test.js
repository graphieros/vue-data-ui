import { mount, flushPromises } from '@vue/test-utils';
import { nextTick, reactive } from 'vue';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import Chart from '../src/components/vue-ui-radar.vue';
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
vi.mock('../src/useAutoSizeLabelsInsideViewbox', () => ({
    useAutoSizeLabelsInsideViewbox: () => ({ autoSizeLabels: vi.fn() }),
}));
const dataset = {
    categories: [{ name: 'A' }, { name: 'B', prefix: '$' }],
    series: [
        { name: 'First', values: [2, 4], target: 10 },
        { name: 'Second', values: [6, 8], target: 10 },
        { name: 'Third', values: [8, 2], target: 10 },
    ],
};
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
    vi.stubGlobal('requestAnimationFrame', (callback) => {
        frames.set(++frameId, callback);
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
        props: { config, dataset: data },
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
test('validates raw data, optional targets, malformed arrays and in-place recovery', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const data = reactive({
        categories: [{ name: 'A' }],
        series: [{ values: [1] }],
    });
    const [w, s] = await chart({}, data);
    expect(s.loading).toBe(true);
    expect(warn).not.toHaveBeenCalled();
    await w.setProps({ config: { debug: true, loading: true } });
    expect(warn.mock.calls.flat().join('\n')).toContain('name');
    data.series[0].name = 'Fixed';
    await nextTick();
    await w.setProps({ config: { debug: true } });
    expect(s.loading).toBe(false);
    warn.mockClear();
    await w.setProps({
        dataset: { ...dataset, series: [{ name: 'Bad', values: [NaN, 1] }] },
    });
    expect(s.loading).toBe(true);
    expect(warn).toHaveBeenCalledWith(
        'VueUiRadar: dataset.series[0].values[0] must be a finite number.',
    );
    await w.setProps({ dataset: { categories: 1, series: [null] } });
    expect(s.loading).toBe(true);
    await w.setProps({ dataset });
    expect(s.loading).toBe(false);
    warn.mockClear();
    await w.setProps({
        dataset: {
            ...dataset,
            series: dataset.series.map(({ target, ...s }) => s),
        },
    });
    expect(s.loading).toBe(false);
    expect(warn).not.toHaveBeenCalled();
});
test('loading configuration is reactive and unrelated updates preserve table/tooltip choices', async () => {
    const [w, s] = await chart();
    w.vm.toggleTable();
    w.vm.toggleTooltip();
    await nextTick();
    await w.setProps({
        dataset: { ...dataset, series: dataset.series.slice(0, 2) },
        config: { style: { chart: { color: '#abcdef' } } },
    });
    expect(s.mutableConfig).toEqual({ showTable: true, showTooltip: false });
    await w.setProps({
        config: {
            loading: true,
            skeletonDataset: dataset,
            skeletonConfig: {
                style: { chart: { backgroundColor: '#abcdef' } },
            },
        },
    });
    expect(s.cfgChart.backgroundColor).toBe('#abcdef');
    await w.setProps({
        config: {
            loading: true,
            skeletonDataset: { ...dataset, series: dataset.series.slice(0, 1) },
            skeletonConfig: {
                style: { chart: { backgroundColor: '#123456' } },
            },
        },
    });
    expect(s.radar).toHaveLength(1);
    expect(s.cfgChart.backgroundColor).toBe('#123456');
    await w.setProps({ config: {} });
    expect(s.loading).toBe(false);
    expect(s.mutableConfig).toEqual({ showTable: true, showTooltip: false });
});
test('responsive ownership restores dimensions and rejects stale observer/frame callbacks', async () => {
    const [w, s] = await chart({ responsive: true }, dataset, true);
    finishFrames();
    await nextTick();
    expect(s.svg).toEqual({ width: 800, height: 500 });
    const observer = observers.at(-1);
    observer.callback();
    const staleFrame = [...frames.values()].at(-1);
    await w.setProps({ config: { responsive: false } });
    expect(observer.disconnect).toHaveBeenCalled();
    expect(s.svg).toEqual({ width: 512, height: 312 });
    observer.callback();
    staleFrame();
    expect(s.svg.width).toBe(512);
    await w.setProps({ config: { responsive: true } });
    const active = observers.at(-1);
    active.callback();
    const unmountedFrame = [...frames.values()].at(-1);
    w.unmount();
    wrappers.pop();
    active.callback();
    unmountedFrame();
    expect(active.disconnect).toHaveBeenCalled();
});
test('hidden categories and selected axes follow names after reordering without extra enter callbacks', async () => {
    const enter = vi.fn();
    const [w, s] = await chart({ events: { datapointEnter: enter } });
    w.vm.hideSeries('B');
    s.useTooltip(s.radar[1], 1);
    await nextTick();
    expect(enter).toHaveBeenCalledTimes(1);
    await w.setProps({
        dataset: {
            categories: [...dataset.categories].reverse(),
            series: [
                dataset.series[1],
                dataset.series[0],
                dataset.series[2],
            ].map((row) => ({ ...row, values: [...row.values].reverse() })),
        },
    });
    expect(s.segregated).toEqual([0]);
    expect(s.selectedIndex).toBe(0);
    expect(s.dataTooltipSlot.datapoint.name).toBe('Second');
    expect(s.dataTooltipSlot.seriesIndex).toBe(0);
    expect(s.sparkBarData.map((d) => d.name)).toEqual(['A']);
    expect(enter).toHaveBeenCalledTimes(1);
    await w.setProps({ dataset: { ...dataset, series: [dataset.series[0]] } });
    expect(s.isTooltip).toBe(false);
    expect(s.dataTooltipSlot).toBe(null);
});
test('custom formatter is called once and retains the public context', async () => {
    const customFormat = vi.fn(({ datapoint }) => datapoint.name);
    const [w, s] = await chart({
        style: { chart: { tooltip: { customFormat } } },
    });
    s.useTooltip(s.radar[0], 0);
    await nextTick();
    expect(customFormat).toHaveBeenCalledTimes(1);
    expect(s.tooltipContent).toBe('First');
    expect(customFormat.mock.calls[0][0]).toEqual({
        datapoint: s.radar[0],
        seriesIndex: 0,
        series: {
            categories: s.datasetCopy,
            datapoints: s.seriesCopy,
            radar: s.radar,
        },
        config: s.FINAL_CONFIG,
    });
    await w.setProps({
        dataset: {
            ...dataset,
            series: [
                { ...dataset.series[0], name: 'First', values: [3, 5] },
                ...dataset.series.slice(1),
            ],
        },
    });
    expect(customFormat).toHaveBeenCalledTimes(2);
    expect(customFormat.mock.calls[1][0].datapoint.values).toEqual([3, 5]);
});
test('zero and missing targets keep geometry and tooltip/table/CSV percentages finite', async () => {
    const [w, s] = await chart(
        {},
        {
            ...dataset,
            series: [
                { name: 'Zero', values: [1, 0], target: 0 },
                { name: 'Missing', values: [2, 3] },
            ],
        },
    );
    expect(
        s.radar
            .flatMap((r) => r.plots)
            .every((p) => Number.isFinite(p.x) && Number.isFinite(p.y)),
    ).toBe(true);
    s.useTooltip(s.radar[0], 0);
    expect(s.sparkBarData.map((d) => d.value)).toEqual([0, 0]);
    expect(JSON.stringify(s.dataTable.body)).not.toMatch(/Infinity|NaN/);
    let csv;
    w.vm.generateCsv((value) => {
        csv = value;
    });
    await nextTick();
    expect(csv).not.toMatch(/Infinity|NaN/);
    expect(w.vm.getData().every((d) => Number.isFinite(d.proportion))).toBe(
        true,
    );
});
test('all-zero values and axis scaling retain finite proportions', async () => {
    const [w, s] = await chart(
        { style: { chart: { layout: { scaleToAxisMax: true } } } },
        {
            ...dataset,
            series: dataset.series.map((row) => ({
                ...row,
                values: [0, 0],
                target: 0,
            })),
        },
    );
    expect(w.vm.getData().map((d) => d.proportion)).toEqual([0, 0]);
    expect(s.scaleMaxima).toEqual([1, 1, 1]);
    expect(
        s.radar
            .flatMap((r) => r.plots)
            .every((p) => Number.isFinite(p.x) && Number.isFinite(p.y)),
    ).toBe(true);
});
test('legend animation has one timer and stops on disable and unmount', async () => {
    const [w, s] = await chart({ useCssAnimation: true });
    vi.useFakeTimers();
    s.segregate(0);
    s.segregate(0);
    expect(vi.getTimerCount()).toBe(1);
    expect(s.inSegregation).toBe(0);
    s.segregate(1);
    expect(vi.getTimerCount()).toBe(1);
    expect(s.inSegregation).toBe(null);
    await w.setProps({ config: { useCssAnimation: false } });
    expect(s.isAnimating).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
    await w.setProps({ config: { useCssAnimation: true } });
    s.segregate(0);
    w.unmount();
    wrappers.pop();
    expect(vi.getTimerCount()).toBe(0);
    vi.useRealTimers();
});
test('table toggles are safe before asynchronous mounting and table refs are synchronized when available', async () => {
    const [w, s] = await chart({ table: { useDialog: true } });
    w.vm.toggleTable();
    await nextTick();
    const open = vi.fn(),
        close = vi.fn();
    s.tableUnit = { open, close };
    await nextTick();
    expect(open).toHaveBeenCalledTimes(1);
    w.vm.toggleTable();
    await nextTick();
    expect(close).toHaveBeenCalledTimes(1);
    s.tableUnit = null;
    w.vm.toggleTable();
    await nextTick();
    w.vm.toggleTable();
    await nextTick();
});
test('initial loading restores configured visibility and invalid custom skeletons are safe', async () => {
    const [w, s] = await chart({
        loading: true,
        table: { show: true },
        skeletonDataset: {},
    });
    expect(s.radar).toHaveLength(6);
    await w.setProps({ config: { table: { show: true } } });
    expect(s.mutableConfig.showTable).toBe(true);
    expect(s.loading).toBe(false);
});
test('duplicate category names stay distinct and source indices/payload fields remain public', async () => {
    const data = { ...dataset, categories: [{ name: 'A' }, { name: 'A' }] };
    const [w, s] = await chart({}, data);
    s.segregate(1);
    await nextTick();
    expect(s.legendSet.map((l) => l.isSegregated)).toEqual([false, true]);
    await w.setProps({ config: { customPalette: ['#123456'] } });
    expect(s.segregated).toEqual([1]);
    w.vm.showSeries('A');
    expect(s.segregated).toEqual([1]);
    expect(Object.keys(w.vm.getData()[0]).sort()).toEqual([
        'color',
        'name',
        'proportion',
    ]);
    expect(w.emitted('selectLegend')[0][0]).toHaveLength(1);
});
test('keyboard tooltip anchors refresh with geometry without repeating enter/click callbacks', async () => {
    const enter = vi.fn(),
        click = vi.fn();
    const [w, s] = await chart(
        { events: { datapointEnter: enter, datapointClick: click } },
        dataset,
        true,
    );
    const svg = w.find('svg').element;
    svg.getBoundingClientRect = () => ({
        left: 100,
        top: 50,
        width: 1024,
        height: 624,
    });
    svg.focus();
    await w.find('svg').trigger('keydown', { key: 'ArrowRight' });
    expect(s.activeTooltipIndex).toBe(0);
    expect(enter).toHaveBeenCalledTimes(1);
    const first = s.tooltipA11yPosition;
    await w.setProps({
        config: {
            events: { datapointEnter: enter, datapointClick: click },
            style: { chart: { layout: { grid: { rotation: 90 } } } },
        },
    });
    expect(s.tooltipA11yPosition).not.toEqual(first);
    expect(s.tooltipA11yPosition.x).toBeCloseTo(100 + s.radar[0].labelX * 2);
    expect(s.tooltipA11yPosition.y).toBeCloseTo(50 + s.radar[0].labelY * 2);
    expect(enter).toHaveBeenCalledTimes(1);
    expect(click).not.toHaveBeenCalled();
    await w.find('svg').trigger('keydown', { key: 'Enter' });
    expect(click).toHaveBeenCalledWith({
        datapoint: s.radar[0],
        seriesIndex: 0,
    });
    await w.find('svg').trigger('keydown', { key: 'Escape' });
    expect(s.isTooltip).toBe(false);
    expect(s.dataTooltipSlot).toBe(null);
});
test('skeleton interaction never calls consumer callbacks', async () => {
    const callback = vi.fn();
    const [w, s] = await chart({
        loading: true,
        events: {
            datapointEnter: callback,
            datapointClick: callback,
            datapointLeave: callback,
        },
    });
    s.useTooltip(s.radar[0], 0);
    s.onTrapClick(s.radar[0], 0);
    s.onTrapLeave(s.radar[0], 0);
    s.segregate(0);
    s.toggleLegend();
    expect(callback).not.toHaveBeenCalled();
    expect(w.emitted('selectLegend')).toBeUndefined();
});
test('axis maxima are reused when resizing a chart with many categories', async () => {
    let reads = 0;
    const values = () =>
        new Proxy(
            Array.from({ length: 1000 }, (_, i) => i + 1),
            {
                get(target, key, receiver) {
                    if (typeof key === 'string' && /^\d+$/.test(key)) reads++;
                    return Reflect.get(target, key, receiver);
                },
            },
        );
    const data = {
        categories: Array.from({ length: 1000 }, (_, i) => ({ name: `C${i}` })),
        series: ['A', 'B', 'C'].map((name) => ({ name, values: values() })),
    };
    const [, s] = await chart(
        { style: { chart: { layout: { scaleToAxisMax: true } } } },
        data,
    );
    expect(s.radar).toHaveLength(3);
    reads = 0;
    s.responsiveSize = { width: 800, height: 500 };
    await nextTick();
    expect(s.radar[0].plots).toHaveLength(1000);
    // Preparing new coordinates needs one pass, not a new maximum scan for every point.
    expect(reads).toBeGreaterThanOrEqual(3000);
    expect(reads).toBeLessThanOrEqual(6000);
});
