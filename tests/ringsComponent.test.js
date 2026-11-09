import { mount, flushPromises } from '@vue/test-utils';
import { nextTick, reactive } from 'vue';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import Chart from '../src/components/vue-ui-rings.vue';
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
const dataset = [
    { name: 'A', values: [2, 3] },
    { name: 'B', values: [10] },
    { name: 'C', values: [2] },
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
    vi.useRealTimers();
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
test('validates raw data without crashing and recovers from in-place repairs', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const data = reactive([{ values: [1] }]);
    const [w, s] = await chart({}, data);
    expect(s.loading).toBe(true);
    expect(warn).not.toHaveBeenCalled();
    await w.setProps({ config: { debug: true, loading: true } });
    expect(warn.mock.calls.flat().join('\n')).toContain('name');
    data[0].name = 'Fixed';
    await nextTick();
    await w.setProps({ config: { debug: true } });
    expect(s.loading).toBe(false);
    for (const bad of [
        [null],
        [{ name: 'Missing' }],
        [{ name: 'Bad', values: 1 }],
        [{ name: 'Empty', values: [] }],
    ]) {
        await w.setProps({ dataset: bad });
        expect(s.loading).toBe(true);
    }
    await w.setProps({ dataset });
    expect(s.loading).toBe(false);
});
test('configuration updates preserve manual preferences and apply live skeleton settings', async () => {
    const [w, s] = await chart();
    w.vm.toggleTable();
    w.vm.toggleTooltip();
    w.vm.toggleLabels();
    await nextTick();
    await w.setProps({
        dataset: dataset.slice(0, 2),
        config: { customPalette: ['#123456'] },
    });
    expect(s.mutableConfig).toEqual({
        showTable: true,
        showTooltip: false,
        showLabels: true,
    });
    await w.setProps({
        config: {
            loading: true,
            skeletonDataset: dataset.slice(0, 1),
            skeletonConfig: {
                style: { chart: { backgroundColor: '#abcdef' } },
            },
        },
    });
    expect(s.convertedDataset).toHaveLength(1);
    expect(s.cfgChart.backgroundColor).toBe('#abcdef');
    expect(s.showLabels).toBe(false);
    await w.setProps({
        config: {
            loading: true,
            skeletonDataset: dataset.slice(0, 2),
            skeletonConfig: {
                style: { chart: { backgroundColor: '#123456' } },
            },
        },
    });
    expect(s.convertedDataset).toHaveLength(2);
    expect(s.cfgChart.backgroundColor).toBe('#123456');
    await w.setProps({ config: {} });
    expect(s.loading).toBe(false);
    expect(s.mutableConfig).toEqual({
        showTable: true,
        showTooltip: false,
        showLabels: true,
    });
});
test('identity, hidden state and selection survive palette changes, reordering and sorting', async () => {
    const enter = vi.fn();
    const [w, s] = await chart({ events: { datapointEnter: enter } });
    const id = s.datasetCopy.find((d) => d.name === 'A').uid;
    w.vm.hideSeries('C');
    s.useTooltip(s.convertedDataset[0], 0);
    await nextTick();
    expect(enter).toHaveBeenCalledTimes(1);
    await w.setProps({
        config: {
            events: { datapointEnter: enter },
            customPalette: ['#123456'],
        },
        dataset: [{ ...dataset[0], values: [30] }, dataset[2], dataset[1]],
    });
    expect(s.datasetCopy.find((d) => d.name === 'A').uid).toBe(id);
    expect(s.convertedDataset.map((d) => d.name)).toEqual(['A', 'B']);
    expect(s.selectedSerie).toBe(1);
    expect(s.dataTooltipSlot.datapoint.name).toBe('B');
    expect(s.dataTooltipSlot.datapoint.absoluteIndex).toBe(2);
    expect(enter).toHaveBeenCalledTimes(1);
    w.vm.hideSeries('B');
    await nextTick();
    expect(s.isTooltip).toBe(false);
    expect(s.dataTooltipSlot).toBe(null);
});
test('removed hidden IDs are discarded and duplicate names remain distinct', async () => {
    const [w, s] = await chart({}, [
        { name: 'Same', values: [1] },
        { name: 'Same', values: [2] },
        dataset[2],
    ]);
    const ids = s.datasetCopy.map((d) => d.uid);
    expect(new Set(ids).size).toBe(3);
    s.segregate(ids[1]);
    await w.setProps({ config: { customPalette: ['#123456'] } });
    expect(s.segregated).toEqual([ids[1]]);
    await w.setProps({ dataset: [{ name: 'Same', values: [1] }, dataset[2]] });
    expect(s.segregated).toEqual([]);
    w.vm.hideSeries('C');
    expect(s.convertedDataset.map((d) => d.name)).toEqual(['Same']);
});
test('all-zero data, single series and hide-all keep geometry finite', async () => {
    const [w, s] = await chart(
        {},
        dataset.map((d) => ({ ...d, values: [0] })),
    );
    expect(
        s.convertedDataset.every(
            (d) =>
                Number.isFinite(d.percentage) &&
                Number.isFinite(d.proportion) &&
                Number.isFinite(d.strokeWidth),
        ),
    ).toBe(true);
    expect(
        s.ringGeometry.every(
            (d) => Number.isFinite(d.radius) && Number.isFinite(d.y),
        ),
    ).toBe(true);
    s.useTooltip(s.convertedDataset[0], 0);
    expect(s.tooltipContent).not.toMatch(/NaN|Infinity/);
    expect(w.vm.getData().map((d) => d.percentage)).toEqual([0, 0, 0]);
    s.toggleLegend();
    await nextTick();
    expect(s.convertedDataset).toEqual([]);
    expect(s.isTooltip).toBe(false);
    await w.setProps({ dataset: [dataset[0]] });
    w.vm.showSeries('A');
    expect(s.convertedDataset).toHaveLength(1);
    expect(s.ringGeometry[0].radius).toBeGreaterThan(0);
});
test('sanitizes numeric values consistently, exposes absolute values, and translates CSV headers', async () => {
    const [w, s] = await chart(
        {
            table: {
                columnNames: {
                    series: 'Série',
                    value: 'Valeur',
                    percentage: 'Pourcentage',
                },
            },
        },
        [{ name: 'A', values: [2, NaN, Infinity, 3] }, dataset[1]],
    );
    expect(s.datasetCopy.map((d) => d.value)).toEqual([5, 10]);
    expect(s.datasetCopy.map((d) => d.proportion)).toEqual([1 / 3, 2 / 3]);
    const data = w.vm.getData();
    expect(data[0].absoluteValues).toEqual([10]);
    expect(Object.keys(data[0]).sort()).toEqual([
        'absoluteValues',
        'color',
        'name',
        'percentage',
        'value',
    ]);
    let csv;
    w.vm.generateCsv((v) => (csv = v));
    await nextTick();
    expect(csv).toContain('Série');
    expect(csv).toContain('Valeur');
    expect(csv).toContain('Pourcentage');
});
test('formatter is called once and silent refresh updates its existing context', async () => {
    const enter = vi.fn(),
        format = vi.fn(({ datapoint }) => datapoint.name);
    const [w, s] = await chart({
        events: { datapointEnter: enter },
        style: { chart: { tooltip: { customFormat: format } } },
    });
    s.useTooltip(s.convertedDataset[0], 0);
    await nextTick();
    expect(format).toHaveBeenCalledTimes(1);
    expect(format.mock.calls[0][0]).toEqual({
        datapoint: s.convertedDataset[0],
        seriesIndex: 0,
        series: s.convertedDataset,
        config: s.FINAL_CONFIG,
    });
    await w.setProps({
        dataset: [{ ...dataset[0], values: [30] }, dataset[1], dataset[2]],
    });
    expect(format).toHaveBeenCalledTimes(2);
    expect(enter).toHaveBeenCalledTimes(1);
    expect(s.selectedSerie).toBe(1);
});
test('hover rendering reuses formatted ring labels', async () => {
    const formatter = vi.fn(({ value }) => `${value}`);
    const [w, s] = await chart(
        {
            style: {
                chart: {
                    layout: {
                        labels: { dataLabels: { show: true, formatter } },
                    },
                },
            },
        },
        dataset,
        true,
    );
    const calls = formatter.mock.calls.length;
    expect(calls).toBeGreaterThan(0);
    // A custom tooltip avoids intentionally invoking the value formatter for tooltip content.
    await w.setProps({
        config: {
            style: {
                chart: {
                    tooltip: { customFormat: () => '' },
                    layout: {
                        labels: { dataLabels: { show: true, formatter } },
                    },
                },
            },
        },
    });
    const before = formatter.mock.calls.length;
    s.useTooltip(s.convertedDataset[0], 0);
    await nextTick();
    s.onTrapLeave(s.convertedDataset[0], 0);
    await nextTick();
    expect(formatter).toHaveBeenCalledTimes(before);
});
test('responsive sizing restores configured dimensions and ignores stale work', async () => {
    const [w, s] = await chart({ responsive: true }, dataset, true);
    finishFrames();
    await nextTick();
    expect(s.svg).toEqual({ width: 800, height: 488 });
    const observer = s.resizeObserver;
    observer.callback();
    const stale = [...frames.values()].at(-1);
    await w.setProps({
        config: { responsive: false, style: { chart: { size: 420 } } },
    });
    expect(observer.disconnect).toHaveBeenCalled();
    observer.callback();
    stale();
    expect(s.svg).toEqual({ width: 420, height: 420 });
    await w.setProps({ config: { responsive: true } });
    const active = s.resizeObserver;
    active.callback();
    const pending = [...frames.values()].at(-1);
    w.unmount();
    wrappers.pop();
    pending();
    active.callback();
    expect(active.disconnect).toHaveBeenCalled();
});
test('keyboard selection and anchor follow current geometry and rendered indices', async () => {
    const enter = vi.fn(),
        click = vi.fn();
    const cfg = { events: { datapointEnter: enter, datapointClick: click } };
    const [w, s] = await chart(cfg, dataset, true);
    const svg = w.find('svg').element;
    svg.getBoundingClientRect = () => ({
        left: 100,
        top: 50,
        width: 720,
        height: 720,
    });
    svg.focus();
    await w.find('svg').trigger('keydown', { key: 'ArrowRight' });
    const before = s.tooltipA11yPosition;
    expect(s.dataTooltipSlot.datapoint.name).toBe('B');
    await w.setProps({
        config: {
            ...cfg,
            style: {
                chart: {
                    size: 500,
                    layout: { labels: { dataLabels: { show: true } } },
                },
            },
        },
        dataset: [{ ...dataset[0], values: [30] }, dataset[1], dataset[2]],
    });
    expect(s.activeTooltipIndex).toBe(1);
    expect(s.tooltipA11yPosition).not.toEqual(before);
    expect(enter).toHaveBeenCalledTimes(1);
    await w.find('svg').trigger('keydown', { key: 'Enter' });
    expect(click).toHaveBeenCalledWith({
        datapoint: s.convertedDataset[1],
        seriesIndex: 1,
    });
    await w.find('svg').trigger('keydown', { key: 'Escape' });
    expect(s.isTooltip).toBe(false);
    expect(s.dataTooltipSlot).toBe(null);
});
test('table synchronization waits for the async component ref', async () => {
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
test('loading interactions are silent', async () => {
    const callback = vi.fn();
    const [w, s] = await chart({
        loading: true,
        events: {
            datapointEnter: callback,
            datapointLeave: callback,
            datapointClick: callback,
        },
    });
    s.useTooltip(s.convertedDataset[0], 0);
    s.onTrapClick(s.convertedDataset[0], 0);
    s.onTrapLeave(s.convertedDataset[0], 0);
    s.toggleLegend();
    expect(callback).not.toHaveBeenCalled();
    w.unmount();
    wrappers.pop();
});

test('all ring circles share a bottom baseline after filtering, resizing and label changes', async () => {
    const [w, s] = await chart();
    const check = () => {
        s.ringGeometry.forEach((g) =>
            expect(g.y + g.radius).toBeCloseTo(s.baseline, 10),
        );
        expect(s.ringGeometry[0].y).toBeCloseTo(s.CENTER.y, 10);
    };
    check();
    w.vm.hideSeries('B');
    await nextTick();
    check();
    await w.setProps({
        config: {
            style: {
                chart: {
                    size: 480,
                    layout: {
                        labels: {
                            dataLabels: {
                                show: true,
                                markers: { position: 'left' },
                            },
                        },
                    },
                },
            },
        },
    });
    check();
    s.responsiveSize = { width: 800, height: 488 };
    await nextTick();
    check();
    await w.setProps({ dataset: dataset.map((d) => ({ ...d, values: [0] })) });
    check();
});

test('legend actions finish entry animations and restored rings do not replay them', async () => {
    const [w, s] = await chart({ useCssAnimation: true });
    const ids = s.datasetCopy.map((d) => d.uid);
    s.finishEntryAnimation(ids[0]);
    expect(s.finishedEntryAnimations.has(ids[0])).toBe(true);
    w.vm.hideSeries('C');
    await nextTick();
    expect(ids.every((id) => s.finishedEntryAnimations.has(id))).toBe(true);
    w.vm.showSeries('C');
    await nextTick();
    expect(
        s.finishedEntryAnimations.has(
            s.convertedDataset.find((d) => d.name === 'C').uid,
        ),
    ).toBe(true);
});
