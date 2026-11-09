import { mount, flushPromises } from '@vue/test-utils';
import { reactive } from 'vue';
import { beforeEach, afterEach, test, expect, vi } from 'vitest';
import Chart from '../src/components/vue-ui-bump.vue';
vi.mock('../src/useResponsive', () => ({
    useResponsive: () => ({ width: 800, height: 500 }),
}));
const dataset = [
    { id: 'A', name: 'A', values: [10, 30, 20] },
    { id: 'B', name: 'B', values: [20, 20, 30] },
    { id: 'C', name: 'C', values: [30, 10, 10] },
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
        { props: { dataset: data, config } },
    );
    wrappers.push(w);
    await flushPromises();
    return [w, w.vm.$.setupState];
}
function finish() {
    for (let i = 0; frames.size && i < 100; i++) {
        const callbacks = [...frames.values()];
        frames.clear();
        callbacks.forEach((cb) => cb());
    }
    expect(frames.size).toBe(0);
}
test('missing values have no rank, plot, or endpoint name label', async () => {
    const [, s] = await chart({}, [
        { name: 'A', values: [null, 5, null] },
        { name: 'B', values: [10, null, 20] },
        { name: 'Empty', values: [] },
    ]);
    const a = s.formattedDataset[0];
    expect(a.coordinates.map((c) => c.rank)).toEqual([null, 1, null]);
    expect(s.validPoints(a)).toHaveLength(1);
    expect(s.nameLabels.left.find((l) => l.id === a.id).value).toBe(5);
    expect(s.nameLabels.right.find((l) => l.id === a.id).value).toBe(5);
    expect(s.keyboardNavigableSeries).toHaveLength(2);
    expect(s.dataTable.body[0]).toEqual(['A', '-', '5 (1)', '-']);
});
test('tie-breaking uses previous ranks with a deterministic source-order fallback', async () => {
    const [, s] = await chart({}, [
        { name: 'A', values: [1, 5, null, 5] },
        { name: 'B', values: [2, 5, 5, 5] },
    ]);
    expect(s.allPositions).toEqual([
        [1, 1, null, 0],
        [0, 0, 0, 1],
    ]);
});
test('resizing reuses ranks and formatted values', async () => {
    const formatter = vi.fn(({ value }) => String(value));
    const [, s] = await chart({
        style: { chart: { layout: { plots: { labels: { formatter } } } } },
    });
    const ranks = s.allPositions,
        labels = s.seriesValueLabels,
        count = formatter.mock.calls.length;
    s.defaultSizes = { width: 900, height: 500 };
    expect(s.formattedDataset[0].coordinates[0].x).toBeGreaterThan(0);
    expect(s.allPositions).toBe(ranks);
    expect(s.seriesValueLabels).toBe(labels);
    expect(formatter).toHaveBeenCalledTimes(count);
});
test('complete export headers do not inherit hidden axis labels', async () => {
    const [, s] = await chart({
        style: {
            chart: {
                layout: {
                    timeLabels: {
                        values: ['Jan', 'Feb', 'Mar'],
                        showOnlyFirstAndLast: true,
                    },
                },
            },
        },
    });
    expect(s.tableHeaders).toEqual(['', 'Jan', 'Feb', 'Mar']);
    expect(s.dataTable.head).toHaveLength(4);
    const csv = await new Promise((resolve) => s.generateCsv(resolve));
    expect(csv).toContain('Feb');
});
test('missing time labels fall back to source period indices', async () => {
    const [, s] = await chart();
    expect(s.tableHeaders).toEqual(['', '0', '1', '2']);
});
test('keyboard identity follows re-ranking and explicit IDs survive data updates', async () => {
    const [w, s] = await chart();
    s.activeSeriesId = 'A';
    s.selectedSeries = 'A';
    await w.setProps({
        dataset: [
            { id: 'A', name: 'A', values: [100, 100, 100] },
            { id: 'B', name: 'B', values: [20, 20, 20] },
        ],
    });
    await flushPromises();
    expect(s.keyboardNavigableSeries[s.activePointIndex].id).toBe('A');
    expect(s.selectedSeries).toBe('A');
    await w.setProps({ dataset: [{ id: 'B', name: 'B', values: [1] }] });
    await flushPromises();
    expect(s.activePointIndex).toBe(null);
    expect(s.selectedSeries).toBe(null);
});
test('nested sizing config changes update fixed dimensions', async () => {
    const config = reactive({ style: { chart: { width: 600, height: 400 } } });
    const [, s] = await chart(config);
    config.style.chart.width = 900;
    await flushPromises();
    expect(s.defaultSizes.width).toBe(900);
});
test('validation remains active until missing required attributes are restored', async () => {
    const [w, s] = await chart();
    await w.setProps({ dataset: [{ values: [1] }] });
    await flushPromises();
    expect(s.loading).toBe(true);
    await w.setProps({ dataset: [{ name: 'Restored', values: [2] }] });
    await flushPromises();
    expect(s.loading).toBe(false);
    expect(s.formattedDataset[0].name).toBe('Restored');
});
test('responsive observers disconnect and restore fixed dimensions', async () => {
    const [w, s] = await chart({ responsive: true });
    s.bumpChart = { parentNode: {} };
    s.prepareChart();
    const observer = observers.at(-1);
    finish();
    expect(s.defaultSizes.width).toBe(800);
    await w.setProps({
        config: {
            responsive: false,
            style: { chart: { width: 650, height: 450 } },
        },
    });
    await flushPromises();
    expect(observer.disconnect).toHaveBeenCalled();
    expect(s.defaultSizes).toEqual({ width: 650, height: 450 });
});
test('empty custom skeleton has finite spacing and no plotted rows', async () => {
    const [, s] = await chart({ loading: true, skeletonDataset: [] });
    expect(s.maxLen).toBe(0);
    expect(s.drawingArea.unitW).toBe(0);
    expect(s.drawingArea.unitH).toBe(0);
    expect(s.plottedSeries).toEqual([]);
});
for (const mode of ['rank', 'value'])
    test(`${mode} plot clicks emit click with the source period index`, async () => {
        const host = document.createElement('div');
        document.body.appendChild(host);
        const click = vi.fn(),
            enter = vi.fn();
        const data = [
            { name: 'A', values: [5, null, 10] },
            { name: 'B', values: [10, 5, 5] },
        ];
        const config = {
            events: { datapointClick: click, datapointEnter: enter },
            style: {
                chart: {
                    layout: {
                        plots: { labels: { displayedValue: mode, show: true } },
                        timeLabels: { autoRotate: { enable: false } },
                    },
                },
            },
        };
        const w = mount(Chart, {
            attachTo: host,
            props: { dataset: data, config },
        });
        wrappers.push(w);
        try {
            await vi.dynamicImportSettled();
            await flushPromises();
            const points = w.findAll(
                mode === 'rank'
                    ? 'circle.transition-opacity'
                    : 'rect.transition-opacity',
            );
            expect(points).toHaveLength(5);
            await points[1].trigger('mouseenter');
            await points[1].trigger('click');
            expect(enter).toHaveBeenCalledTimes(1);
            expect(click).toHaveBeenCalledTimes(1);
            expect(click.mock.calls[0][0].datapoint.pointIndex).toBe(2);
            expect(click.mock.calls[0][0].seriesIndex).toBe(2);
            expect(w.find('text[font-weight]')).toBeTruthy();
        } finally {
            w.unmount();
            host.remove();
        }
    });

test('a selected series clears when all of its points become missing', async () => {
    const [w, s] = await chart();
    s.selectedSeries = 'A';
    s.activeSeriesId = 'A';
    await w.setProps({
        dataset: [
            { id: 'A', name: 'A', values: [null] },
            { id: 'B', name: 'B', values: [1] },
        ],
    });
    await flushPromises();
    expect(s.selectedSeries).toBe(null);
    expect(s.activePointIndex).toBe(null);
});
