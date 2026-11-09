import { mount, flushPromises } from '@vue/test-utils';
import { reactive } from 'vue';
import { beforeEach, afterEach, test, expect, vi } from 'vitest';
import Chart from '../src/components/vue-ui-age-pyramid.vue';
vi.mock('../src/useResponsive', () => ({
    useResponsive: () => ({ width: 800, height: 600 }),
}));
vi.mock('../src/useChartExport', async () => {
    const { ref } = await import('vue');
    return {
        useChartExport: () => ({
            isCallbackImaging: ref(false),
            isCallbackSvg: ref(false),
            generateSvg: vi.fn(),
            onGenerateImage: vi.fn(),
        }),
    };
});
vi.mock('../src/useSvgLabelLayout', async () => {
    const { ref } = await import('vue');
    return {
        useSvgLabelLayout: () => ({
            metrics: ref({ bottom: 0 }),
            ready: ref(true),
            update: vi.fn(),
        }),
    };
});
vi.mock('../src/useTimeLabelCollider', () => ({
    useTimeLabelCollision: vi.fn(),
}));
const dataset = [
    ['2000', 25, 100, 200],
    ['2001', 24, 50, 150],
];
let wrappers, frames, observers, id;
beforeEach(() => {
    wrappers = [];
    frames = new Map();
    observers = [];
    id = 0;
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
async function chart(config = {}, data = dataset, dom = false) {
    const w = mount(dom ? Chart : { ...Chart, render: () => null }, {
        props: {
            dataset: data,
            config: {
                ...config,
                userOptions: { show: false, ...config.userOptions },
                style: {
                    ...config.style,
                    layout: {
                        ...config.style?.layout,
                        dataLabels: {
                            ...config.style?.layout?.dataLabels,
                            xAxis: {
                                ...config.style?.layout?.dataLabels?.xAxis,
                                autoRotate: { enable: false },
                            },
                        },
                    },
                },
            },
        },
        global: {
            stubs: {
                PenAndPaper: true,
                UserOptions: true,
                PackageVersion: true,
                Title: true,
                Tooltip: true,
                DataTable: true,
                Accordion: true,
            },
        },
    });
    wrappers.push(w);
    await vi.dynamicImportSettled();
    await flushPromises();
    return [w, w.vm.$.setupState];
}
function frame() {
    const callbacks = [...frames.values()];
    frames.clear();
    callbacks.forEach((cb) => cb());
}
test('table and CSV sum both sides with zero and missing values', async () => {
    const [w, s] = await chart({}, [
        ['A', 10, 100, 200],
        ['B', 11, 0, 30],
        ['C', 12, null, 20],
        ['D', 13, 5, null],
        ['E', 14, null, null],
    ]);
    expect(s.tableRows.map((row) => row[4])).toEqual([300, 30, 20, 5, 0]);
    expect(s.dataTable.body.map((row) => row[4])).toEqual([
        '300',
        '30',
        '20',
        '5',
        '0',
    ]);
    const callback = vi.fn();
    w.vm.generateCsv(callback);
    await flushPromises();
    expect(callback.mock.calls[0][0]).toContain('A,10,100,200,300');
    expect(callback.mock.calls[0][0]).toContain('C,12,,20,20');
});
test('zero and nonfinite values produce finite zero-length bars and ticks', async () => {
    for (const values of [
        [0, 0],
        [null, undefined],
        [NaN, Infinity],
        [-5, 0],
    ]) {
        const [, s] = await chart({}, [['A', 10, ...values]]);
        expect(s.drawableDataset[0].left.width).toBe(0);
        expect(s.drawableDataset[0].right.width).toBe(0);
        expect(Number.isFinite(s.drawableDataset[0].left.x)).toBe(true);
        expect(
            [...s.xLabels.left, ...s.xLabels.right].every((label) =>
                Number.isFinite(label.x),
            ),
        ).toBe(true);
    }
});
test('invalid row structure recovers after a nested update and keeps debug diagnostics', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const data = reactive([['A', 10, 5]]);
    const [, s] = await chart({ debug: true }, data);
    expect(s.loading).toBe(true);
    expect(warn.mock.calls.flat().join(' ')).toContain(
        'segment, age, left, and right',
    );
    data[0].push(15);
    await flushPromises();
    expect(s.loading).toBe(false);
    expect(s.drawableDataset[0].right.value).toBe(15);
});
test('malformed rows do not crash tables or rendering', async () => {
    const [w, s] = await chart({}, [null, {}], true);
    expect(s.loading).toBe(true);
    expect(s.dataTable.body).toEqual([]);
    expect(w.findAll('[data-cy="tooltip-trap"]')).toHaveLength(0);
});
test('replacing only a formatter applies the new function', async () => {
    const first = vi.fn(() => 'First');
    const second = vi.fn(() => 'Second');
    const [w, s] = await chart(
        {
            style: {
                layout: {
                    bars: { labels: { showOnHover: false, formatter: first } },
                },
            },
        },
        dataset,
        true,
    );
    expect(w.text()).toContain('First');
    await w.setProps({
        config: {
            userOptions: { show: false },
            style: {
                layout: {
                    bars: { labels: { showOnHover: false, formatter: second } },
                    dataLabels: { xAxis: { autoRotate: { enable: false } } },
                },
            },
        },
    });
    expect(s.barLabels.formatter).toBe(second);
    expect(w.text()).toContain('Second');
});
test('fixed dimensions follow configuration updates', async () => {
    const [w, s] = await chart();
    await w.setProps({ config: { style: { width: 900, height: 700 } } });
    expect(s.svg).toEqual({ width: 900, height: 700 });
});
test('tooltip-only updates preserve manual table and tooltip choices', async () => {
    const [w, s] = await chart();
    s.toggleTable();
    s.toggleTooltip();
    const table = s.mutableConfig.showTable,
        tooltip = s.mutableConfig.showTooltip;
    await w.setProps({ config: { style: { tooltip: { color: '#ff0000' } } } });
    expect(s.mutableConfig.showTable).toBe(table);
    expect(s.mutableConfig.showTooltip).toBe(tooltip);
});
test('custom tooltip is evaluated once and preserves legacy callback and slot shapes', async () => {
    const customFormat = vi.fn(({ datapoint }) => datapoint.segment);
    const datapointEnter = vi.fn();
    const [, s] = await chart({
        events: { datapointEnter },
        style: { tooltip: { customFormat } },
    });
    s.useTooltip(0, dataset[0]);
    expect(s.tooltipContent).toBe('2000');
    expect(s.tooltipContent).toBe('2000');
    expect(customFormat).toHaveBeenCalledTimes(1);
    expect(customFormat.mock.calls[0][0].datapoint).toEqual({
        segment: '2000',
        index: 25,
        left: 100,
        right: 200,
    });
    expect(s.dataTooltipSlot.datapoint).toEqual(dataset[0]);
    expect(datapointEnter).toHaveBeenCalledTimes(1);
});
test('invalid custom formatter return falls back without a second call', async () => {
    const customFormat = vi.fn(() => null);
    const [, s] = await chart({ style: { tooltip: { customFormat } } });
    s.useTooltip(0, dataset[0]);
    expect(s.tooltipContent).toContain('2000');
    expect(customFormat).toHaveBeenCalledTimes(1);
});
test('selected tooltip refreshes silently and clears when its row is removed', async () => {
    const enter = vi.fn();
    const [w, s] = await chart({ events: { datapointEnter: enter } });
    s.useTooltip(1, dataset[1]);
    await w.setProps({ dataset: [dataset[0], ['Updated', 26, 70, 80]] });
    expect(s.tooltipContent).toContain('Updated');
    expect(s.dataTooltipSlot.datapoint[2]).toBe(70);
    expect(enter).toHaveBeenCalledTimes(1);
    await w.setProps({ dataset: [dataset[0]] });
    expect(s.selectedIndex).toBe(null);
    expect(s.activeTooltipIndex).toBe(null);
    expect(s.isTooltip).toBe(false);
});
test('loading suppresses real-data traps and callbacks even when row counts differ', async () => {
    const enter = vi.fn();
    const [w, s] = await chart(
        { loading: true, events: { datapointEnter: enter } },
        Array.from({ length: 20 }, () => dataset[0]),
        true,
    );
    expect(w.findAll('[data-cy="tooltip-trap"]')).toHaveLength(0);
    s.useTooltip(19, dataset[0]);
    expect(enter).not.toHaveBeenCalled();
    expect(s.isTooltip).toBe(false);
});
test('skeleton styling and data update during loading and recover', async () => {
    const [w, s] = await chart({ loading: true });
    await w.setProps({
        config: {
            loading: true,
            skeletonDataset: [['X', 1, 10, 20]],
            skeletonConfig: { style: { backgroundColor: '#123456' } },
        },
    });
    expect(s.style.backgroundColor).toBe('#123456ff');
    expect(s.drawableDataset).toHaveLength(1);
    await w.setProps({ config: {} });
    expect(s.loading).toBe(false);
    expect(s.drawableDataset).toHaveLength(2);
});
test('responsive sizing restores fixed dimensions and rejects stale work after unmount', async () => {
    const [w, s] = await chart({ responsive: true }, dataset, true);
    frame();
    expect(s.svg).toEqual({ width: 800, height: 600 });
    await w.setProps({ config: { style: { width: 400, height: 300 } } });
    observers[0].callback();
    expect(frames.size).toBe(0);
    expect(observers[0].disconnect).toHaveBeenCalled();
    expect(s.svg).toEqual({ width: 400, height: 300 });
    await w.setProps({ config: { responsive: true } });
    const stale = [...frames.values()];
    w.unmount();
    stale.forEach((cb) => cb());
    expect(frames.size).toBe(0);
});
test('shared bar rendering keeps both gradients and formatter contexts', async () => {
    const formatter = vi.fn(({ value }) => String(value));
    const [w, s] = await chart(
        {
            style: {
                layout: { bars: { labels: { showOnHover: false, formatter } } },
            },
        },
        dataset,
        true,
    );
    const gradients = w.findAll('linearGradient');
    expect(gradients).toHaveLength(2);
    expect(gradients[0].findAll('stop')[0].attributes('stop-color')).toBe(
        s.bars.left.color,
    );
    expect(gradients[1].findAll('stop')[1].attributes('stop-color')).toBe(
        s.bars.right.color,
    );
    expect(
        formatter.mock.calls
            .filter(([payload]) => payload.config?.datapoint)
            .slice(0, 4)
            .map(([payload]) => [
                payload.config.datapoint.value,
                payload.config.seriesIndex,
            ]),
    ).toEqual([
        [100, 0],
        [200, 0],
        [50, 1],
        [150, 1],
    ]);
});

test('keyboard anchors follow resized rows without another enter callback', async () => {
    const enter = vi.fn();
    const [w, s] = await chart(
        { events: { datapointEnter: enter } },
        dataset,
        true,
    );
    s.svgRef.createSVGPoint = () => ({
        x: 0,
        y: 0,
        matrixTransform() {
            return { x: this.x + 10, y: this.y + 20 };
        },
    });
    s.svgRef.getScreenCTM = () => ({});
    s.useTooltip(1, dataset[1], 'keyboard');
    await flushPromises();
    const oldY = s.tooltipA11yPosition.y;
    await w.setProps({
        config: {
            events: { datapointEnter: enter },
            style: {
                height: 700,
                layout: {
                    dataLabels: { xAxis: { autoRotate: { enable: false } } },
                },
            },
        },
    });
    expect(s.tooltipA11yPosition.y).toBeGreaterThan(oldY);
    expect(enter).toHaveBeenCalledTimes(1);
    expect(s.tooltipA11yPosition.x).toBe(
        s.drawingArea.left + s.drawingArea.width / 2 + 10,
    );
});
test('copyAlt retains the public row and side fields without mutating input', async () => {
    const altCopy = vi.fn();
    const [w] = await chart({ userOptions: { callbacks: { altCopy } } });
    await w.vm.copyAlt();
    const rows = altCopy.mock.calls[0][0].dataset;
    expect(Object.keys(rows[0]).sort()).toEqual(
        ['segment', 'age', 'left', 'right'].sort(),
    );
    for (const side of ['left', 'right'])
        expect(Object.keys(rows[0][side]).sort()).toEqual(
            [
                'value',
                'proportionToMax',
                'x',
                'y',
                'width',
                'height',
                'color',
            ].sort(),
        );
    expect(dataset).toEqual([
        ['2000', 25, 100, 200],
        ['2001', 24, 50, 150],
    ]);
});
