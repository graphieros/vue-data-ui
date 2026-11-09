import { mount, flushPromises } from '@vue/test-utils';
import { beforeEach, afterEach, test, expect, vi } from 'vitest';
import Chart from '../src/components/vue-ui-dumbbell.vue';
vi.mock('../src/useResponsive', () => ({
    useResponsive: () => ({ width: 800, height: 500 }),
}));
const dataset = [
    { id: 'A', name: 'A', start: 10, end: 20.1234 },
    { id: 'B', name: 'B', start: 30, end: 15 },
    { id: 'C', name: 'C', start: 25, end: 25 },
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
function finish() {
    for (let i = 0; frames.size && i < 500; i++) {
        const callbacks = [...frames.values()];
        frames.clear();
        callbacks.forEach((cb) => cb());
    }
    expect(frames.size).toBe(0);
}
test('disabling animation settles endpoints and cancels stale frames', async () => {
    const [w, s] = await chart({ useAnimation: true, animationSpeed: 5 });
    const own = s.animationFrame,
        stale = frames.get(own);
    await w.setProps({ config: { useAnimation: false } });
    await flushPromises();
    expect(frames.has(own)).toBe(false);
    expect(s.mutableDataset.map((d) => d.endVal)).toEqual(
        dataset.map((d) => d.end),
    );
    stale();
    expect(s.mutableDataset[0].endVal).toBe(dataset[0].end);
});
test('reduced motion settles an active animation immediately', async () => {
    const [, s] = await chart({ useAnimation: true, animationSpeed: 5 });
    s.prefersReducedMotion = true;
    await flushPromises();
    expect(s.animationFrame).toBe(null);
    expect(s.mutableDataset[0].endVal).toBe(dataset[0].end);
});
test('animation reaches both increasing and decreasing targets and cancels on unmount', async () => {
    const [w, s] = await chart({ useAnimation: true, animationSpeed: 5 });
    finish();
    expect(s.mutableDataset.map((d) => d.endVal)).toEqual(
        dataset.map((d) => d.end),
    );
    await w.setProps({ dataset: [{ name: 'New', start: 0, end: 100 }] });
    await flushPromises();
    const own = s.animationFrame;
    w.unmount();
    expect(frames.has(own)).toBe(false);
});
test('fallback IDs remain stable when values update', async () => {
    const [w, s] = await chart({}, [{ name: 'A', start: 1, end: 2 }]);
    const first = s.getData()[0].id;
    await w.setProps({ dataset: [{ name: 'A', start: 1, end: 3 }] });
    await flushPromises();
    expect(s.getData()[0].id).toBe(first);
});
test('selected row follows current geometry and explicit identity across reordering', async () => {
    const [w, s] = await chart();
    s.onTrapEnter({ datapoint: s.mutableDataset[0], seriesIndex: 0 });
    const oldX = s.selectedDatapoint.endX;
    s.WIDTH = 900;
    expect(s.selectedDatapoint.endX).not.toBe(oldX);
    await w.setProps({ dataset: [dataset[1], dataset[0], dataset[2]] });
    await flushPromises();
    expect(s.selectedTrapIndex).toBe(1);
    expect(s.selectedDatapoint.id).toBe('A');
    await w.setProps({ dataset: [dataset[1], dataset[2]] });
    await flushPromises();
    expect(s.selectedDatapoint).toBe(null);
});
test('collision responds immediately to row height and font settings', async () => {
    const [, s] = await chart({
        style: {
            chart: {
                rowHeight: 100,
                labels: {
                    yAxisLabels: { showProgression: true, fontSize: 10 },
                },
            },
        },
    });
    expect(s.areSeriesNamesColliding).toBe(false);
    s.baseRowHeight = 12;
    expect(s.areSeriesNamesColliding).toBe(true);
});
test('empty custom skeleton yields finite drawing and responsive row heights', async () => {
    const [, s] = await chart({
        loading: true,
        responsive: true,
        skeletonDataset: [],
    });
    s.dumbbellChart = { parentNode: {} };
    s.prepareChart();
    finish();
    expect(Number.isFinite(s.baseRowHeight)).toBe(true);
    expect(Number.isFinite(s.drawingArea.rowHeight)).toBe(true);
    expect(s.mutableDataset).toEqual([]);
});
test('responsive cleanup restores configured fixed dimensions', async () => {
    const [w, s] = await chart({ responsive: true });
    s.dumbbellChart = { parentNode: {} };
    s.prepareChart();
    const observer = observers.at(-1);
    finish();
    await w.setProps({
        config: {
            responsive: false,
            useAnimation: false,
            style: { chart: { width: 700, rowHeight: 80 } },
        },
    });
    await flushPromises();
    expect(observer.disconnect).toHaveBeenCalled();
    expect(s.WIDTH).toBe(700);
    expect(s.baseRowHeight).toBe(80);
});
test('progression handles zero and missing starts consistently', async () => {
    const [, s] = await chart({}, [
        { name: 'Zero', start: 0, end: 10 },
        { name: 'Missing', start: null, end: 10 },
    ]);
    expect(s.dataTable.body.map((row) => row[3])).toEqual(['-', '-']);
    expect(s.formatProgression(s.mutableDataset[0])).toBe('');
});
test('comparison labels use the end rounding setting', async () => {
    const [, s] = await chart({
        style: {
            chart: {
                labels: {
                    startLabels: { rounding: 0 },
                    endLabels: { rounding: 3 },
                },
            },
        },
    });
    s.onTrapEnter({ datapoint: s.mutableDataset[0], seriesIndex: 0 });
    expect(s.comparisonLabel).toContain('20.123');
});
test('shared gradient IDs are unique and endpoint labels use their own font sizes', async () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const w = mount(Chart, {
        attachTo: host,
        props: {
            dataset,
            config: {
                useAnimation: false,
                style: {
                    chart: {
                        labels: {
                            xAxisLabels: { autoRotate: { enable: false } },
                            endLabels: { show: true, fontSize: 30 },
                            startLabels: { fontSize: 9 },
                        },
                    },
                },
            },
        },
    });
    wrappers.push(w);
    try {
        await vi.dynamicImportSettled();
        await flushPromises();
        const s = w.vm.$.setupState;
        const gradients = w.findAll('linearGradient,radialGradient');
        expect(gradients).toHaveLength(7);
        expect(new Set(gradients.map((g) => g.attributes('id'))).size).toBe(7);
        for (const gradient of gradients)
            expect(gradient.attributes('id')).not.toContain('%');
        const end = w.find('[data-cy="datapoint-label-end"]');
        expect(Number(end.attributes('y'))).toBeCloseTo(
            s.mutableDataset[0].y - (s.plotRadius * 2 - 30 / 3),
        );
    } finally {
        w.unmount();
        host.remove();
    }
});
