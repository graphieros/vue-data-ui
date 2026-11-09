import { mount, flushPromises } from '@vue/test-utils';
import { h, nextTick } from 'vue';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import Kpi from '../src/components/vue-ui-kpi.vue';
import Tiremarks from '../src/components/vue-ui-tiremarks.vue';
import Sparkbar from '../src/components/vue-ui-sparkbar.vue';
import Sparkstackbar from '../src/components/vue-ui-sparkstackbar.vue';
import SparkTrend from '../src/components/vue-ui-spark-trend.vue';
import SparkHistogram from '../src/components/vue-ui-sparkhistogram.vue';
import MoodRadar from '../src/components/vue-ui-mood-radar.vue';
import Thermometer from '../src/components/vue-ui-thermometer.vue';
import TableHeatmap from '../src/components/vue-ui-table-heatmap.vue';
import Cursor from '../src/components/vue-ui-cursor.vue';
import Table from '../src/components/vue-ui-table.vue';
import TimerChart from '../src/components/vue-ui-timer.vue';
import { Timer } from '../src/timer';
import { useAnimationFrame } from '../src/useAnimationFrame';

vi.mock('../src/useResponsive', () => ({
    useResponsive: () => ({ width: 800, height: 500 }),
}));
vi.mock('../src/useChartExport', () => ({ useChartExport: () => ({}) }));
vi.mock('../src/useFitSvgText', () => ({
    useFitSvgText: () => ({ fitText: vi.fn() }),
}));

let wrappers, observers, frames, frameId, workers, media;
beforeEach(() => {
    wrappers = [];
    observers = [];
    frames = new Map();
    frameId = 0;
    workers = [];
    media = {
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
    };
    vi.stubGlobal('matchMedia', () => media);
    vi.stubGlobal(
        'requestAnimationFrame',
        vi.fn((callback) => {
            frames.set(++frameId, callback);
            return frameId;
        }),
    );
    vi.stubGlobal(
        'cancelAnimationFrame',
        vi.fn((id) => frames.delete(id)),
    );
    vi.stubGlobal(
        'ResizeObserver',
        class {
            constructor(callback) {
                this.callback = callback;
                observers.push(this);
            }
            observe = vi.fn();
            unobserve = vi.fn();
            disconnect = vi.fn();
        },
    );
    vi.stubGlobal(
        'Worker',
        class {
            constructor() {
                workers.push(this);
            }
            postMessage = vi.fn();
            terminate = vi.fn();
            addEventListener = vi.fn();
            removeEventListener = vi.fn();
        },
    );
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:timer');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
});
afterEach(async () => {
    await vi.dynamicImportSettled();
    await flushPromises();
    wrappers.forEach((w) => {
        if (!w.__unmounted) w.unmount();
    });
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});
function unmount(w) {
    w.unmount();
    w.__unmounted = true;
}
function chart(component, dataset, config = {}, elementRef) {
    const w = mount(
        {
            ...component,
            render(_ctx, _cache, _props, setupState) {
                return elementRef
                    ? h('div', {
                          ref: (el) => {
                              setupState[elementRef] = el;
                          },
                      })
                    : null;
            },
        },
        { attachTo: document.body, props: { dataset, config } },
    );
    wrappers.push(w);
    return [w, w.vm.$.setupState];
}
function tick(time = 100) {
    const callbacks = [...frames.values()];
    frames.clear();
    callbacks.forEach((cb) => cb(time));
}
function finishFrames() {
    for (let i = 0; frames.size && i < 2000; i++) tick(i * 20);
    expect(frames.size).toBe(0);
}

test('cancelled, replaced, and unmounted frames cannot execute stale callbacks', () => {
    let owner;
    const callback = vi.fn();
    const w = mount({
        setup() {
            owner = useAnimationFrame();
            return () => null;
        },
    });
    wrappers.push(w);
    owner.request(callback);
    const stale = [...frames.values()][0];
    owner.request(callback);
    stale();
    expect(callback).not.toHaveBeenCalled();
    const queued = [...frames.values()][0];
    unmount(w);
    queued();
    owner.request(callback);
    expect(callback).not.toHaveBeenCalled();
    expect(frames.size).toBe(0);
});

test('KPI opposing updates finish at the latest target and stop on unmount', async () => {
    const [w, s] = chart(Kpi, 100, {
        useAnimation: true,
        animationFrames: 100,
        animationValueStart: 0,
    });
    for (let i = 0; i < 49; i++) tick();
    expect(s.displayedValue).toBe(50);
    const stale = [...frames.values()][0];
    await w.setProps({ dataset: -50 });
    stale();
    expect(frames.size).toBe(1);
    finishFrames();
    expect(s.displayedValue).toBe(-50);
    await w.setProps({ dataset: 200 });
    unmount(w);
    expect(frames.size).toBe(0);
});

test('tiremarks restarts one animation and honors disabling animation', async () => {
    const [w, s] = chart(
        Tiremarks,
        { percentage: 80 },
        { style: { chart: { animation: { use: true, speed: 1 } } } },
    );
    tick();
    const stale = [...frames.values()][0];
    await w.setProps({ dataset: { percentage: 20 } });
    stale();
    expect(frames.size).toBe(1);
    finishFrames();
    expect(s.activeValue).toBe(20);
    await w.setProps({
        config: { style: { chart: { animation: { use: false } } } },
    });
    expect(s.activeValue).toBe(20);
    expect(frames.size).toBe(0);
});

for (const [name, component, data, refName] of [
    ['sparkhistogram', SparkHistogram, [{ value: 2 }], 'histogramChart'],
    ['spark-trend', SparkTrend, [1, 2, 3], 'sparkTrendChart'],
    [
        'mood-radar',
        MoodRadar,
        { 1: 1, 2: 2, 3: 3, 4: 2, 5: 1 },
        'moodRadarChart',
    ],
    ['thermometer', Thermometer, { value: 5, from: 0, to: 10 }, 'thermoChart'],
    ['tiremarks', Tiremarks, { percentage: 50 }, 'tiremarksChart'],
])
    test(`${name} disconnects on disable, replacement and unmount, invalidating queued resize work`, async () => {
        const config = {
            responsive: true,
            style: {
                animation: { show: false },
                chart: { animation: { use: false } },
            },
        };
        const [w, s] = chart(component, data, config, refName);
        const first = s.resizeObserver;
        expect(first).toBeDefined();
        const existingFrames = new Set(frames.keys());
        first.callback([]);
        const queued = [...frames.entries()]
            .filter(([id]) => !existingFrames.has(id))
            .map(([, cb]) => cb);
        await w.setProps({ config: { ...config, responsive: false } });
        expect(first.disconnect).toHaveBeenCalledTimes(1);
        const before = s.WIDTH ?? s.svg?.width;
        first.callback([]);
        queued.forEach((cb) => cb());
        expect(s.WIDTH ?? s.svg?.width).toBe(before);
        await w.setProps({ config });
        const second = s.resizeObserver;
        expect(second).not.toBe(first);
        await w.setProps({ config: { ...config, debug: false } });
        expect(second.disconnect).toHaveBeenCalledTimes(1);
        const current = s.resizeObserver;
        unmount(w);
        expect(current.disconnect).toHaveBeenCalledTimes(1);
        current.callback([]);
        expect(frames.size).toBe(0);
    });

test('table heatmap retains only one active observer after config changes', async () => {
    const [w, s] = chart(
        TableHeatmap,
        [{ name: 'A', values: [1, 2] }],
        {},
        'tableContainer',
    );
    const first = observers[0];
    first.callback([{ contentRect: { width: 10 } }]);
    expect(s.isResponsive).toBe(true);
    await w.setProps({ config: { table: { responsiveBreakpoint: 5 } } });
    expect(first.disconnect).toHaveBeenCalledTimes(1);
    first.callback([{ contentRect: { width: 1000 } }]);
    expect(s.isResponsive).toBe(true);
    const current = observers.at(-1);
    current.callback([{ contentRect: { width: 10 } }]);
    expect(s.isResponsive).toBe(false);
    unmount(w);
    expect(current.disconnect).toHaveBeenCalledTimes(1);
});

for (const [name, component] of [
    ['sparkbar', Sparkbar],
    ['sparkstackbar', Sparkstackbar],
]) {
    test(`${name} cancels animation on replacement, disable, and unmount`, async () => {
        const data = [
            { name: 'A', value: 30 },
            { name: 'B', value: 20 },
        ];
        const [w, s] = chart(component, data, {
            style: { animation: { show: true, animationFrames: 100 } },
        });
        expect(frames.size).toBe(1);
        const stale = [...frames.values()][0];
        await w.setProps({ dataset: [{ name: 'C', value: 40 }] });
        await nextTick();
        stale();
        expect(frames.size).toBe(1);
        finishFrames();
        expect(s.safeDatasetCopy.map((d) => d.value)).toEqual([40]);
        await w.setProps({ dataset: data });
        await nextTick();
        await w.setProps({ config: { style: { animation: { show: false } } } });
        expect(frames.size).toBe(0);
        expect(s.safeDatasetCopy.map((d) => d.value)).toEqual([30, 20]);
        await w.setProps({
            config: { style: { animation: { show: true } } },
            dataset: [{ name: 'D', value: 80 }],
        });
        await nextTick();
        unmount(w);
        expect(frames.size).toBe(0);
    });
}

test('spark-trend cancels overlapping starts and unmount work', async () => {
    let now = 0;
    vi.spyOn(performance, 'now').mockImplementation(() => (now += 25));
    const [w, s] = chart(SparkTrend, [1, 2, 3], {
        style: { animation: { show: true, animationFrames: 60 } },
    });
    expect(frames.size).toBe(1);
    await w.setProps({ dataset: [4, 5, 6] });
    expect(frames.size).toBe(1);
    finishFrames();
    expect(s.safeDatasetCopy).toEqual([4, 5, 6]);
    await w.setProps({ dataset: [7, 8, 9] });
    unmount(w);
    expect(frames.size).toBe(0);
});

test('cursor removes its listeners and cancels a queued click on a surviving parent', async () => {
    const parent = document.createElement('div');
    parent.id = 'cursor-parent';
    document.body.appendChild(parent);
    try {
        const [w, s] = chart(Cursor, undefined, { parentId: parent.id });
        parent.dispatchEvent(new Event('mouseleave'));
        expect(s.isVisible).toBe(false);
        parent.click();
        unmount(w);
        await nextTick();
        parent.dispatchEvent(new Event('mouseenter'));
        expect(s.isVisible).toBe(false);
        expect(s.isClicked).toBe(false);
        for (let i = 0; i < 3; i++) {
            const [instance] = chart(Cursor, undefined, {
                parentId: parent.id,
            });
            unmount(instance);
        }
        const add = vi.spyOn(parent, 'addEventListener');
        const remove = vi.spyOn(parent, 'removeEventListener');
        const [instance] = chart(Cursor, undefined, { parentId: parent.id });
        unmount(instance);
        expect(remove.mock.calls).toEqual(add.mock.calls);
    } finally {
        parent.remove();
    }
});

test('table removes keyboard and active drag listeners without touching other document handlers', async () => {
    const add = vi.spyOn(document, 'addEventListener');
    const remove = vi.spyOn(document, 'removeEventListener');
    const other = vi.fn();
    document.onmousemove = other;
    try {
        const [w, s] = chart(Table, {
            header: [{ name: 'A', type: 'text' }],
            body: [{ td: ['one'] }],
        });
        await flushPromises();
        s.chartModal = document.createElement('div');
        s.dragMouseDown({ clientX: 10, clientY: 10, preventDefault: vi.fn() });
        const handlers = add.mock.calls.filter(
            ([event, callback]) =>
                ['keydown', 'mouseup', 'mousemove'].includes(event) &&
                [
                    s.handleDocumentKeydown,
                    s.closeDragElement,
                    s.elementDrag,
                ].includes(callback),
        );
        expect(handlers).toHaveLength(3);
        unmount(w);
        handlers.forEach((args) =>
            expect(remove).toHaveBeenCalledWith(...args),
        );
        expect(document.onmousemove).toBe(other);
    } finally {
        document.onmousemove = null;
    }
});

test('Timer revokes its URL and destroys its worker exactly once, ignoring queued messages', () => {
    const callback = vi.fn();
    const timer = new Timer(callback, 10, vi.fn());
    const worker = workers[0];
    const queued = worker.onmessage;
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:timer');
    timer.start();
    worker.onmessage({ data: { elapsed: 1234, timestamp: 42 } });
    expect(callback).toHaveBeenCalledWith({
        elapsed: 1234,
        timestamp: 42,
        formatted: '00:00:01.23',
    });
    void timer.lap();
    const lap = worker.addEventListener.mock.calls[0][1];
    timer.destroy();
    timer.destroy();
    timer.start();
    queued({ data: { elapsed: 9000 } });
    expect(worker.terminate).toHaveBeenCalledTimes(1);
    expect(worker.removeEventListener).toHaveBeenCalledWith('message', lap);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(worker.postMessage).toHaveBeenCalledTimes(2);
});

test('timer component destroys even an unstarted worker on unmount', () => {
    const [w] = chart(TimerChart, undefined);
    expect(workers).toHaveLength(1);
    unmount(w);
    expect(workers[0].terminate).toHaveBeenCalledTimes(1);
});
