import { mount, flushPromises } from '@vue/test-utils';
import { reactive, nextTick } from 'vue';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import Chart from '../src/components/vue-ui-galaxy.vue';
vi.mock('../src/useResponsive', () => ({
    useResponsive: () => ({ width: 800, height: 500 }),
}));
const dataset = [
    { id: 'a', name: 'A', values: [50, 10], color: '#123456' },
    { id: 'b', name: 'B', values: [30] },
    { id: 'c', name: 'C', values: [10] },
];
let wrappers, observers, frames, frameId;
beforeEach(() => {
    wrappers = [];
    observers = [];
    frames = new Map();
    frameId = 0;
    vi.stubGlobal('requestAnimationFrame', (cb) => {
        frames.set(++frameId, cb);
        return frameId;
    });
    vi.stubGlobal('cancelAnimationFrame', (id) => frames.delete(id));
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
                DataTable: true,
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
test('hidden series and identities survive palette updates, sorting and duplicate names', async () => {
    const [w, s] = await chart();
    const id = s.immutableSet.find((d) => d.name === 'B').id;
    w.vm.hideSeries('B');
    await flushPromises();
    await w.setProps({ config: { customPalette: ['#ff0000', '#00ff00'] } });
    expect(s.immutableSet.find((d) => d.name === 'B').id).toBe(id);
    expect(s.galaxySet.map((d) => d.name)).not.toContain('B');
    await w.setProps({
        dataset: [dataset[1], { ...dataset[0], values: [5] }, dataset[2]],
    });
    expect(s.immutableSet.find((d) => d.name === 'B').id).toBe(id);
    expect(s.galaxySet.map((d) => d.name)).not.toContain('B');
    await w.setProps({
        dataset: [
            { name: 'same', values: [2] },
            { name: 'same', values: [1] },
        ],
    });
    s.segregate(s.legendSet[1]);
    await flushPromises();
    expect(s.galaxySet).toHaveLength(1);
    expect(s.galaxySet[0].value).toBe(2);
});
test('loading keeps skeleton settings reactive and recovers real data', async () => {
    const [w, s] = await chart({ loading: true });
    expect(s.loading).toBe(true);
    await w.setProps({
        config: {
            loading: true,
            style: { chart: { color: '#ff0000' } },
            skeletonDataset: [{ name: 'custom', values: [7] }],
            skeletonConfig: {
                style: { chart: { backgroundColor: '#abcdef' } },
            },
        },
    });
    expect(s.FINAL_CONFIG.userOptions.show).toBe(false);
    expect(s.cfgChart.backgroundColor).toBe('#abcdef');
    expect(s.immutableSet[0].name).toBe('custom');
    await w.setProps({ config: { loading: false } });
    expect(s.loading).toBe(false);
    expect(s.getData().map((d) => d.name)).toEqual(['A', 'B', 'C']);
});
test('style and data changes preserve manually toggled table and tooltip settings', async () => {
    const [w, s] = await chart();
    w.vm.toggleTable();
    w.vm.toggleTooltip();
    await flushPromises();
    await w.setProps({
        config: { style: { chart: { color: '#abcdef' } } },
        dataset: dataset.slice(0, 2),
    });
    expect(s.mutableConfig.showTable).toBe(true);
    expect(s.mutableConfig.showTooltip).toBe(false);
});
test('tooltip formatter runs once and active selection refreshes silently', async () => {
    const enter = vi.fn(),
        format = vi.fn(({ datapoint }) => `value=${datapoint.value}`);
    const [w, s] = await chart({
        events: { datapointEnter: enter },
        style: { chart: { tooltip: { customFormat: format } } },
    });
    const selected = s.galaxySet.find((d) => d.name === 'B');
    s.useTooltip({
        datapoint: selected,
        seriesIndex: selected.seriesIndex,
        show: true,
        flatIndex: 1,
    });
    expect(format).toHaveBeenCalledTimes(1);
    expect(enter).toHaveBeenCalledTimes(1);
    await w.setProps({
        dataset: dataset.map((d) =>
            d.id === 'b' ? { ...d, values: [80] } : d,
        ),
    });
    expect(s.selectedSerie).toBe(selected.id);
    expect(s.dataTooltipSlot.datapoint.value).toBe(80);
    expect(s.tooltipContent).toBe('value=80');
    expect(enter).toHaveBeenCalledTimes(1);
    w.vm.hideSeries('B');
    await flushPromises();
    expect(s.selectedSerie).toBe(null);
    expect(s.isTooltip).toBe(false);
});
test('keyboard selection and activation work with tooltips disabled and skip zero series', async () => {
    const click = vi.fn();
    const [w, s] = await chart(
        {
            events: { datapointClick: click },
            style: { chart: { tooltip: { show: false } } },
        },
        [...dataset, { name: 'Zero', values: [0] }],
        true,
    );
    const svg = w.find('svg').element;
    svg.focus();
    await w.find('svg').trigger('keydown', { key: 'ArrowRight' });
    expect(s.activeTooltipIndex).toBe(0);
    expect(s.selectedSerie).not.toBe(null);
    expect(s.isTooltip).toBe(false);
    expect(s.a11ySeries).toHaveLength(3);
    await w.find('svg').trigger('keydown', { key: 'Enter' });
    expect(click).toHaveBeenCalledTimes(1);
    expect(w.emitted('selectDatapoint')[0][0].id).toBe(s.selectedSerie);
    await w.find('svg').trigger('keydown', { key: 'Escape' });
    expect(s.selectedSerie).toBe(null);
});
test('responsive lifecycle restores defaults and rejects stale callbacks', async () => {
    const [w, s] = await chart({ responsive: true }, dataset, true);
    finishFrames();
    await nextTick();
    expect(s.svg).toMatchObject({ width: 800, height: 488 });
    const trap = w.find('[data-cy="tooltip-trap"]');
    expect(Number(trap.attributes('stroke-width'))).toBeCloseTo(
        s.strokeWidths[trap.attributes('data-a11y-serie-id')].border,
    );
    const observer = observers[0];
    observer.callback();
    await w.setProps({ config: { responsive: false } });
    finishFrames();
    expect(observer.disconnect).toHaveBeenCalled();
    expect(s.svg).toMatchObject({ width: 250, height: 180 });
    observer.callback();
    expect(frames.size).toBe(0);
    await w.setProps({ config: { responsive: true } });
    const last = observers.at(-1);
    w.unmount();
    last.callback();
    expect(frames.size).toBe(0);
});
test('zero totals produce finite geometry and text, including all-hidden state', async () => {
    const [, s] = await chart({}, [
        { name: 'A', values: [0] },
        { name: 'B', values: [0] },
    ]);
    expect(
        s.galaxySet.every(
            (d) => Number.isFinite(d.proportion) && Number.isFinite(d.points),
        ),
    ).toBe(true);
    expect(s.legendSet.every((d) => Number.isFinite(d.proportion))).toBe(true);
    s.toggleLegend();
    await flushPromises();
    expect(s.galaxySet).toEqual([]);
});
test('diagnostics react to raw changes and missing attribute additions, silently when disabled', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const data = reactive([{ values: [1] }]);
    const [w, s] = await chart({}, data);
    expect(warn).not.toHaveBeenCalled();
    data[0].name = 'Fixed';
    await nextTick();
    expect(s.getData()[0].name).toBe('Fixed');
    await w.setProps({
        config: { debug: true },
        dataset: [null, { name: 'Bad', values: 'oops' }],
    });
    expect(warn).toHaveBeenCalled();
    expect(s.getData()).toEqual([
        { name: 'Bad', color: expect.any(String), value: 0 },
    ]);
});
test('accessible headings are plain names and CSV uses configured translations', async () => {
    const [w, s] = await chart({
        table: {
            columnNames: {
                series: 'Serie',
                value: 'Valeur',
                percentage: 'Pourcentage',
            },
        },
    });
    expect(s.a11yTable.rows.map((row) => row[0])).toEqual(['C', 'B', 'A']);
    const csv = vi.fn();
    w.vm.generateCsv(csv);
    await flushPromises();
    expect(csv.mock.calls[0][0]).toContain('Pourcentage');
    expect(csv.mock.calls[0][0]).toContain('Valeur');
});

test('streaming identities stay bounded while retained series survive loading', async () => {
    const keep = { id: 'keep', name: 'Keep', values: [5] };
    const [w, s] = await chart({}, [keep]);
    const id = s.seriesIds[0];
    for (let i = 0; i < 30; i++) {
        await w.setProps({
            dataset: [keep, { id: `s${i}`, name: `S${i}`, values: [i + 1] }],
        });
        expect(s.seriesIds[0]).toBe(id);
        expect(s.seriesIdentity.size).toBe(2);
    }
    await w.setProps({ config: { loading: true } });
    void s.seriesIds;
    await w.setProps({ config: { loading: false } });
    expect(s.seriesIds[0]).toBe(id);
});
