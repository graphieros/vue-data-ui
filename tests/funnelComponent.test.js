import { reactive, nextTick } from 'vue';
import { mount, flushPromises } from '@vue/test-utils';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import Chart from '../src/components/vue-ui-funnel.vue';
vi.mock('../src/useResponsive', () => ({
    useResponsive: () => ({ width: 800, height: 400 }),
}));
const dataset = [
    { name: 'First', value: 100, color: '#123456', custom: 'kept' },
    { name: 'Second', value: 40 },
];
let wrappers, observers, frames, frameId;
beforeEach(() => {
    vi.stubGlobal('matchMedia', () => ({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
    }));
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
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});
async function chart(config = {}, data = dataset, real = false) {
    const w = mount(real ? Chart : { ...Chart, render: () => null }, {
        props: { dataset: data, config: { useCssAnimation: false, ...config } },
        global: {
            stubs: {
                PenAndPaper: true,
                UserOptions: true,
                PackageVersion: true,
                DataTable: true,
                Skeleton: true,
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
test('fixed dimensions and padding update geometry without resetting a manually opened table', async () => {
    const [w, s] = await chart();
    s.toggleTable();
    await flushPromises();
    await w.setProps({
        config: {
            useCssAnimation: false,
            style: {
                chart: {
                    width: 900,
                    height: 600,
                    padding: { left: 50, top: 30, right: 100, bottom: 20 },
                },
            },
        },
    });
    expect(s.svg).toEqual({ width: 900, height: 600 });
    expect(s.drawingArea).toMatchObject({
        left: 50,
        top: 30,
        width: 750,
        height: 550,
    });
    expect(s.datapoints[0].y).toBe(57.5);
    expect(s.mutableConfig.showTable).toBe(true);
    await w.setProps({
        config: { table: { show: true }, useCssAnimation: false },
    });
    s.toggleTable();
    await flushPromises();
    await w.setProps({
        config: { table: { show: false }, useCssAnimation: false },
    });
    expect(s.mutableConfig.showTable).toBe(false);
});
test('malformed data recovers when missing attributes are added and debug warnings retain indices', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const [w, s] = await chart({ debug: true }, [{ value: 10 }]);
    expect(s.isDataset).toBe(false);
    expect(warn).toHaveBeenCalled();
    w.props('dataset')[0].name = 'Fixed';
    await w.setProps({ dataset: [{ name: 'Fixed', value: 10 }] });
    expect(s.isDataset).toBe(true);
    await w.setProps({ dataset: [null] });
    expect(s.datapoints).toEqual([]);
    expect(s.funnelArea).toBe('');
    expect(s.circlesLink).toEqual({});
    await w.setProps({ dataset: [{ name: 'Bad', value: Infinity }] });
    expect(s.isDataset).toBe(false);
});
test('zero first step keeps geometry and export percentages finite', async () => {
    const [w, s] = await chart({}, [
        { name: 'Zero', value: 0 },
        { name: 'Next', value: 10 },
    ]);
    expect(s.datapoints.map((d) => [d.width, d.proportion])).toEqual([
        [0, 0],
        [0, 0],
    ]);
    const csv = vi.fn();
    w.vm.generateCsv(csv);
    await flushPromises();
    expect(csv).toHaveBeenCalled();
    expect(csv.mock.calls[0][0]).not.toMatch(/NaN|Infinity/);
});
test('responsive sizing restores fixed dimensions and rejects stale callbacks on disable and unmount', async () => {
    const [w, s] = await chart({ responsive: true }, dataset, true);
    finishFrames();
    expect(s.svg).toEqual({ width: 800, height: 400 });
    const observer = observers[0];
    observer.callback();
    await w.setProps({ config: { responsive: false, useCssAnimation: false } });
    finishFrames();
    expect(observer.disconnect).toHaveBeenCalled();
    expect(s.svg).toEqual({ width: 600, height: 500 });
    observer.callback();
    expect(frames.size).toBe(0);
    await w.setProps({ config: { responsive: true, useCssAnimation: false } });
    const latest = observers.at(-1);
    w.unmount();
    latest.callback();
    expect(frames.size).toBe(0);
});
test('animation starts for late data, survives style changes, and clears its timer', async () => {
    vi.useFakeTimers();
    const [w, s] = await chart({ useCssAnimation: true }, []);
    expect(s.isAnimating).toBe(false);
    await w.setProps({ dataset });
    expect(s.isAnimating).toBe(true);
    vi.advanceTimersByTime(200);
    await w.setProps({
        config: {
            useCssAnimation: true,
            style: { chart: { color: '#abcdef' } },
        },
    });
    vi.advanceTimersByTime(100);
    expect(s.isAnimating).toBe(false);
    await w.setProps({ dataset: dataset.slice(0, 1) });
    expect(s.isAnimating).toBe(true);
    w.unmount();
    expect(vi.getTimerCount()).toBe(0);
});
test('preserves input order, fields, colors and formatter geometry context', async () => {
    const formatter = vi.fn((value, context) => `${value}`);
    const [, s] = await chart({
        style: { chart: { bars: { dataLabels: { value: { formatter } } } } },
    });
    expect(s.getData()[0]).toMatchObject({ ...dataset[0], color: '#123456ff' });
    expect(s.datapoints.map((d) => d.datapointIndex)).toEqual([0, 1]);
    expect(s.datapoints.map((d) => d.proportion)).toEqual([1, 0.4]);
    void s.dataTable;
    expect(formatter.mock.calls[0][0]).toEqual({
        value: 100,
        config: { datapoint: s.datapoints[0] },
    });
});

test('reactive attribute additions recover validity and debug remains silent when disabled', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const data = reactive([{ value: 10 }]);
    const [w, s] = await chart({}, data);
    expect(s.isDataset).toBe(false);
    expect(warn).not.toHaveBeenCalled();
    data[0].name = 'Added';
    await nextTick();
    expect(s.isDataset).toBe(true);
    expect(s.datapoints[0].name).toBe('Added');
    await w.setProps({
        config: { debug: true, useCssAnimation: false },
        dataset: [{ name: 'Bad', value: NaN }],
    });
    expect(warn).toHaveBeenCalledWith(
        'VueUiFunnel: dataset[0].value must be a finite number.',
    );
});
test('reduced motion and disabled animation settle immediately', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('matchMedia', () => ({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
    }));
    const [w, s] = await chart({ useCssAnimation: true });
    expect(s.isAnimating).toBe(false);
    expect(s.loaded).toBe(true);
    await w.setProps({ config: { useCssAnimation: false } });
    expect(s.isAnimating).toBe(false);
});
