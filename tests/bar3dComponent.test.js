import { mount, flushPromises } from '@vue/test-utils';
import { reactive } from 'vue';
import { beforeEach, afterEach, test, expect, vi } from 'vitest';
import Chart from '../src/components/vue-ui-3d-bar.vue';
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
const dataset = {
    series: [
        {
            id: 'A',
            name: 'A',
            value: 20,
            breakdown: [
                { name: 'Small', value: 5 },
                { name: 'Large', value: 15 },
            ],
        },
        { id: 'B', name: 'B', value: 40 },
    ],
};
let wrappers, frames, observers, id, media;
beforeEach(() => {
    wrappers = [];
    frames = new Map();
    observers = [];
    id = 0;
    media = {
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
    };
    vi.stubGlobal('matchMedia', () => media);
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
    Object.defineProperties(SVGElement.prototype, {
        getTotalLength: { configurable: true, value: () => 100 },
        getPointAtLength: {
            configurable: true,
            value: (length) => ({ x: length, y: 10 }),
        },
    });
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
        props: { dataset: data, config },
        global: {
            stubs: {
                PenAndPaper: true,
                UserOptions: true,
                PackageVersion: true,
                Title: true,
                Accordion: true,
                DataTable: true,
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
function finish() {
    for (let i = 0; frames.size && i < 1000; i++) frame();
    expect(frames.size).toBe(0);
}
const noAnimation = { style: { chart: { animation: { use: false } } } };
test('sorting breakdowns never mutates caller arrays', async () => {
    const input = structuredClone(dataset);
    const [, s] = await chart({}, input);
    expect(
        s.stack
            .find((serie) => serie.name === 'A')
            .breakdown.map((row) => row.name),
    ).toEqual(['Large', 'Small']);
    expect(input).toEqual(dataset);
});
test('selection and source indices survive resize, palette changes, and reordering', async () => {
    const [w, s] = await chart();
    const a = s.stack.find((row) => row.name === 'A');
    s.selectSerie(a, true);
    s.WIDTH = 700;
    await flushPromises();
    expect(s.selectedBar.id).toBe(a.id);
    expect(s.selectionIsFixed).toBe(true);
    await w.setProps({
        dataset: { series: [...dataset.series].reverse() },
        config: { customPalette: ['#ff0000', '#00ff00'] },
    });
    expect(s.selectedBar.id).toBe(a.id);
    expect(s.selectedBar.seriesIndex).toBe(1);
    expect(s.activeAccessibilityIndex).toBe(1);
    expect(s.a11yAnnouncement).toContain('A:');
});
test('click selects without hover and toggles a fixed selection off', async () => {
    const click = vi.fn();
    const [, s] = await chart({ events: { datapointClick: click } });
    const bar = s.stack[0];
    s.selectSerie(bar, true);
    expect(s.selectedSerie).toBe(bar.id);
    expect(s.selectionIsFixed).toBe(true);
    s.selectSerie(bar, true);
    expect(s.selectionIsFixed).toBe(false);
    s.unselectSerie(bar);
    expect(s.selectedSerie).toBe(null);
    expect(click).toHaveBeenCalledTimes(2);
});
test('selection clears when the selected series is removed', async () => {
    const [w, s] = await chart();
    s.selectSerie(s.stack[0], true);
    await w.setProps({ dataset: { series: [dataset.series[0]] } });
    expect(s.selectedSerie).toBe(null);
    expect(s.selectionIsFixed).toBe(false);
    expect(s.a11yAnnouncement).toBe('');
});
test('zero stacks and empty or zero breakdowns have finite geometry', async () => {
    const [, s] = await chart(
        {},
        {
            series: [
                { name: 'A', value: 0, breakdown: [] },
                {
                    name: 'B',
                    value: 0,
                    breakdown: [{ name: 'Zero', value: 0 }],
                },
            ],
        },
    );
    expect(
        s.stack.every(
            (row) =>
                row.proportion === 0 &&
                !JSON.stringify(row.fill).includes('NaN'),
        ),
    ).toBe(true);
    expect(s.stack.every((row) => row.fill.donut === null)).toBe(true);
    expect(s.dataTable.head[2]).toBe('-');
});
test('invalid data recovers after nested edits and keeps detailed debug warnings', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const data = reactive({
        series: [{ value: 20, breakdown: [{ name: 'Missing' }] }],
    });
    const [, s] = await chart({ debug: true }, data);
    expect(s.loading).toBe(true);
    const messages = warn.mock.calls.flat().join(' ');
    expect(messages).toContain('name');
    expect(messages).toContain('value');
    data.series[0].name = 'Restored';
    data.series[0].breakdown[0].value = 20;
    await flushPromises();
    expect(s.loading).toBe(false);
    expect(s.stack[0].name).toBe('Restored');
});
test('malformed series and breakdowns never throw in debug mode', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    for (const data of [
        null,
        {},
        { series: {} },
        { series: [null] },
        { series: [{ name: 'A', value: 1, breakdown: {} }] },
    ]) {
        const [, s] = await chart({ debug: true }, data);
        expect(s.loading).toBe(true);
    }
});
test('percentage animation starts once and replaces stale work', async () => {
    const [w, s] = await chart({}, { percentage: 80 });
    expect(frames.size).toBe(1);
    const stale = [...frames.values()][0];
    await w.setProps({ dataset: { percentage: 20 } });
    const current = s.activeValue;
    stale();
    expect(s.activeValue).toBe(current);
    expect(frames.size).toBe(1);
    finish();
    expect(s.activeValue).toBe(20);
});
test('disabled animation follows percentage updates immediately', async () => {
    const [w, s] = await chart(noAnimation, { percentage: 25 });
    expect(s.activeValue).toBe(25);
    await w.setProps({ dataset: { percentage: 60 } });
    expect(s.activeValue).toBe(60);
    expect(frames.size).toBe(0);
});
test('disabling animation and reduced motion cancel and settle', async () => {
    const [w, s] = await chart({}, { percentage: 80 });
    await w.setProps({ config: noAnimation });
    expect(s.activeValue).toBe(80);
    expect(frames.size).toBe(0);
    await w.setProps({ config: {} });
    media.matches = true;
    media.addEventListener.mock.calls[0][1]();
    await flushPromises();
    expect(s.activeValue).toBe(80);
    expect(frames.size).toBe(0);
});
test('invalid animation settings settle without endless frames', async () => {
    for (const animation of [
        { speed: 0 },
        { speed: -1 },
        { acceleration: -1 },
    ]) {
        const [, s] = await chart(
            { style: { chart: { animation } } },
            { percentage: 50 },
        );
        expect(s.activeValue).toBe(50);
        expect(frames.size).toBe(0);
    }
});
test('mode changes and fixed dimension updates resize the viewport', async () => {
    const [w, s] = await chart(noAnimation, { percentage: 50 });
    expect(s.WIDTH).toBe(128);
    await w.setProps({ dataset });
    expect(s.WIDTH).toBe(256);
    await w.setProps({
        config: {
            style: {
                chart: { box: { dimensions: { width: 200, height: 400 } } },
            },
        },
    });
    expect(s.WIDTH).toBe(400);
    expect(s.HEIGHT).toBe(400);
    await w.setProps({ dataset: { percentage: 25 } });
    expect(s.WIDTH).toBe(200);
});
test('responsive observer and animation frames are canceled on unmount', async () => {
    const [w, s] = await chart({ responsive: true }, { percentage: 80 }, true);
    const stale = [...frames.values()];
    w.unmount();
    stale.forEach((cb) => cb());
    expect(frames.size).toBe(0);
    expect(observers[0].disconnect).toHaveBeenCalled();
});
test('disabling responsiveness restores dimensions and ignores old callbacks', async () => {
    const [w, s] = await chart({ responsive: true }, dataset, true);
    frame();
    expect(s.WIDTH).toBe(800);
    expect(s.HEIGHT).toBe(588);
    await w.setProps({ config: {} });
    observers[0].callback();
    expect(frames.size).toBe(0);
    expect(s.WIDTH).toBe(256);
    expect(s.HEIGHT).toBe(256);
});
test('tables and percentage caches are independent of resizing', async () => {
    const [w, s] = await chart();
    const table = s.table,
        totals = s.breakdownTotals;
    s.WIDTH = 500;
    await flushPromises();
    expect(s.table).toBe(table);
    expect(s.breakdownTotals).toBe(totals);
    const bar = s.stack.find((row) => row.name === 'A');
    const arc = bar.fill.donut[0];
    expect(s.displayArcPercentage(arc, bar, true)).toBe(75);
    expect(s.displayArcPercentage(arc, bar)).toBe('25%');
    const callback = vi.fn();
    w.vm.generateCsv(callback);
    await flushPromises();
    expect(callback.mock.calls[0][0]).toContain('Large,15,25');
});
test('loading skeletons follow config changes and recover', async () => {
    const [w, s] = await chart({ loading: true });
    await w.setProps({
        config: {
            loading: true,
            skeletonDataset: { percentage: 35 },
            skeletonConfig: {
                style: { chart: { backgroundColor: '#123456' } },
            },
        },
    });
    expect(s.chart.backgroundColor).toMatch(/^#123456/);
    expect(s.hasStack).toBeFalsy();
    expect(s.activeValue).toBe(35);
    await w.setProps({ config: {} });
    expect(s.loading).toBe(false);
    expect(s.stack).toHaveLength(2);
});
test('both shapes render one legend and matching gradient references', async () => {
    for (const shape of ['bar', 'tube']) {
        const [w, s] = await chart({ style: { shape } }, dataset, true);
        expect(w.findAll('foreignObject')).toHaveLength(2);
        const ids = w
            .findAll('linearGradient, radialGradient')
            .map((el) => el.attributes('id'));
        expect(new Set(ids).size).toBe(ids.length);
        for (const el of w.findAll('[fill]')) {
            const fill = el.attributes('fill');
            if (fill.startsWith('url(#'))
                expect(ids).toContain(fill.slice(5, -1));
        }
        s.selectSerie(s.stack.find((row) => row.name === 'A'));
        await flushPromises();
        expect(w.findAll('.vue-ui-donut-arc-path').length).toBeGreaterThan(0);
    }
});

test('presentation updates do not restart percentage animation', async () => {
    const [w, s] = await chart({}, { percentage: 80 });
    frame();
    const value = s.activeValue;
    const callbacks = [...frames.values()];
    await w.setProps({
        config: { style: { chart: { bar: { color: '#ff0000' } } } },
    });
    expect(s.activeValue).toBe(value);
    expect([...frames.values()]).toEqual(callbacks);
    finish();
    expect(s.activeValue).toBe(80);
});
test('keyboard activation toggles the selected series without hover', async () => {
    const [w, s] = await chart({}, dataset, true);
    document.body.appendChild(w.element);
    s.svgRef.focus();
    await flushPromises();
    const event = {
        key: 'Enter',
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
    };
    s.onSvgKeydown(event);
    expect(s.selectionIsFixed).toBe(true);
    s.onSvgKeydown(event);
    expect(s.selectionIsFixed).toBe(false);
    s.onSvgKeydown({ ...event, key: 'Escape' });
    expect(s.selectedSerie).toBe(null);
    w.element.remove();
});
