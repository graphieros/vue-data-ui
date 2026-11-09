import { mount, flushPromises } from '@vue/test-utils';
import { reactive } from 'vue';
import { beforeEach, afterEach, test, expect, vi } from 'vitest';
import Chart from '../src/components/vue-ui-bullet.vue';
vi.mock('../src/useResponsive', () => ({
    useResponsive: () => ({ width: 800, height: 300 }),
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
    value: 70,
    target: 80,
    segments: [
        { name: 'Low', from: 0, to: 50 },
        { name: 'High', from: 50, to: 100 },
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
                teleport: true,
                PenAndPaper: true,
                UserOptions: true,
                PackageVersion: true,
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
    for (let i = 0; frames.size && i < 200; i++) frame();
    expect(frames.size).toBe(0);
}
const noAnimation = { style: { chart: { animation: { show: false } } } };
test('invalid datasets stay loading until all required attributes are restored', async () => {
    const data = reactive({ value: 0, segments: [{ from: 0, to: 100 }] });
    const [, s] = await chart({}, data);
    expect(s.loading).toBe(true);
    expect(s.isDataset).toBe(false);
    data.segments[0].name = 'Restored';
    await flushPromises();
    expect(s.loading).toBe(false);
    expect(s.isDataset).toBe(true);
    data.segments[0].to = NaN;
    await flushPromises();
    expect(s.loading).toBe(true);
});
test('missing, malformed, and nonfinite inputs render a finite skeleton', async () => {
    for (const data of [
        null,
        {},
        { value: Infinity, segments: dataset.segments },
        { value: 5, segments: [null] },
        { value: 5, segments: [] },
    ]) {
        const [, s] = await chart(noAnimation, data);
        expect(s.loading).toBe(true);
        expect(JSON.stringify(s.segments)).not.toContain('null');
        expect(
            s.segments.chunks.every((c) => Number.isFinite(c.x + c.width)),
        ).toBe(true);
    }
});
test('zero and equal segment bounds produce a finite scale', async () => {
    for (const value of [0, 10, -10]) {
        const [, s] = await chart(noAnimation, {
            value,
            target: value,
            segments: [{ name: 'Equal', from: value, to: value }],
        });
        expect(s.loading).toBe(false);
        expect(s.scale.ticks.length).toBeGreaterThan(0);
        expect(
            Number.isFinite(s.segments.target.x + s.segments.value.width),
        ).toBe(true);
    }
});
test('invalid tick divisions are bounded and finite', async () => {
    for (const divisions of [0, 1, NaN, Infinity, -5]) {
        const [, s] = await chart({
            style: {
                chart: {
                    animation: { show: false },
                    segments: { ticks: { divisions } },
                },
            },
        });
        expect(s.scale.ticks.length).toBeGreaterThan(0);
        expect(s.scale.ticks.length).toBeLessThanOrEqual(1001);
    }
});
test('new targets replace the previous animation and settle exactly', async () => {
    const [w, s] = await chart({
        style: { chart: { animation: { animationFrames: 5 } } },
    });
    const stale = [...frames.values()][0];
    await w.setProps({ dataset: { ...dataset, value: 20 } });
    expect(frames.size).toBe(1);
    const value = s.activeValue;
    stale();
    expect(s.activeValue).toBe(value);
    finish();
    expect(s.activeValue).toBe(20);
});
test('disabling animation cancels pending work and settles immediately', async () => {
    const [w, s] = await chart();
    expect(frames.size).toBe(1);
    await w.setProps({ config: noAnimation });
    expect(s.activeValue).toBe(70);
    expect(frames.size).toBe(0);
});
test('invalid animation frame counts settle without endless frames', async () => {
    for (const animationFrames of [0, -1, NaN, Infinity]) {
        const [, s] = await chart({
            style: { chart: { animation: { animationFrames } } },
        });
        // The shared config resolver replaces NaN/Infinity with its default.
        if (Number.isFinite(animationFrames)) expect(frames.size).toBe(0);
        finish();
        expect(s.activeValue).toBe(70);
    }
});
test('reduced motion cancels and settles current animation', async () => {
    const [, s] = await chart();
    media.matches = true;
    media.addEventListener.mock.calls[0][1]();
    await flushPromises();
    expect(s.activeValue).toBe(70);
    expect(frames.size).toBe(0);
});
test('animation reuses static geometry and legend formatting', async () => {
    const formatter = vi.fn(({ value }) => String(value));
    const [, s] = await chart({
        style: { chart: { segments: { dataLabels: { formatter } } } },
    });
    const geometry = s.segmentGeometry,
        scale = s.scale,
        labels = s.segmentLabels,
        legend = s.legendSet;
    const count = formatter.mock.calls.length;
    frame();
    expect(s.segmentGeometry).toBe(geometry);
    expect(s.scale).toBe(scale);
    expect(s.segmentLabels).toBe(labels);
    expect(s.legendSet).toBe(legend);
    expect(formatter.mock.calls.length).toBe(count);
});
test('loading styles and skeleton data follow config updates and recover', async () => {
    const [w, s] = await chart({ loading: true });
    const skeleton = { ...dataset, value: 25 };
    await w.setProps({
        config: {
            loading: true,
            skeletonDataset: skeleton,
            skeletonConfig: {
                style: { chart: { backgroundColor: '#ff0000' } },
            },
        },
    });
    expect(s.cfgChart.backgroundColor).toBe('#ff0000');
    expect(s.FINAL_DATASET.value).toBe(25);
    await w.setProps({ config: noAnimation });
    expect(s.loading).toBe(false);
    expect(s.activeValue).toBe(70);
});
test('responsive sizing disconnects and restores fixed dimensions', async () => {
    const [w, s] = await chart(
        { responsive: true, ...noAnimation },
        dataset,
        true,
    );
    frame();
    expect(s.defaultSizes).toEqual({ width: 800, height: 276 });
    await w.setProps({
        config: {
            style: {
                chart: { animation: { show: false }, width: 500, height: 90 },
            },
        },
    });
    expect(observers[0].disconnect).toHaveBeenCalled();
    expect(s.defaultSizes).toEqual({ width: 500, height: 90 });
    observers[0].callback();
    expect(frames.size).toBe(0);
});
test('unmount cancels animation, sizing frames, and stale callbacks', async () => {
    const [w, s] = await chart({ responsive: true }, dataset, true);
    const stale = [...frames.values()];
    w.unmount();
    stale.forEach((cb) => cb());
    expect(frames.size).toBe(0);
    expect(observers[0].disconnect).toHaveBeenCalled();
});
test('target description and both target layers use the actual target', async () => {
    const [w] = await chart(noAnimation, dataset, true);
    expect(w.find('desc').text()).toContain('Target: 80');
    const top = w.find('[data-cy="vue-ui-bullet-target-top"]').attributes();
    await w.setProps({
        config: {
            style: {
                chart: { animation: { show: false }, target: { onTop: false } },
            },
        },
    });
    const bottom = w
        .find('[data-cy="vue-ui-bullet-target-below"]')
        .attributes();
    for (const key of [
        'x',
        'y',
        'height',
        'width',
        'fill',
        'stroke',
        'stroke-width',
    ])
        expect(bottom[key]).toBe(top[key]);
    await w.setProps({ dataset: { ...dataset, target: undefined } });
    expect(w.find('[data-cy^="vue-ui-bullet-target-"]').exists()).toBe(false);
    expect(w.find('desc').text()).toContain('Target: -');
});
test('getData and copyAlt preserve payload structure and input data', async () => {
    const altCopy = vi.fn();
    const [w, s] = await chart({
        ...noAnimation,
        userOptions: { callbacks: { altCopy } },
    });
    expect(Object.keys(w.vm.getData()).sort()).toEqual(
        ['scale', 'target', 'value', 'ticks', 'chunks'].sort(),
    );
    expect(s.segments.chunks.map((c) => c.name)).toEqual(['Low', 'High']);
    await w.vm.copyAlt();
    expect(altCopy.mock.calls[0][0].dataset).toEqual(dataset);
    expect(dataset.segments[0]).toEqual({ name: 'Low', from: 0, to: 50 });
});

test('debug warns for missing, empty, and malformed segments with the expected structure', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    for (const segments of [undefined, [], {}]) {
        warn.mockClear();
        await chart({ debug: true }, { value: 10, segments });
        expect(warn).toHaveBeenCalledTimes(1);
        const message = warn.mock.calls[0][0];
        expect(message).toContain(
            segments && !Array.isArray(segments)
                ? 'must be an array of objects'
                : 'is empty',
        );
        for (const attribute of [
            'name: string',
            'from: number',
            'to: number',
            'color?: string',
        ])
            expect(message).toContain(attribute);
    }
});
test('debug identifies every missing segment attribute and its source index', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await chart(
        { debug: true },
        { value: 10, segments: [{ name: 'A', from: 0, to: 10 }, {}] },
    );
    expect(warn).toHaveBeenCalledTimes(3);
    const messages = warn.mock.calls.map(([message]) => message);
    for (const attribute of ['name', 'from', 'to']) {
        expect(
            messages.some(
                (message) =>
                    message.includes(attribute) &&
                    message.includes('1') &&
                    message.includes('VueUiBullet segment'),
            ),
        ).toBe(true);
    }
});
test('debug diagnostics follow nested updates and debug changes without changing validation', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const data = reactive({ value: 10, segments: [{ from: 0, to: 100 }] });
    const [w, s] = await chart({ debug: false }, data);
    expect(warn).not.toHaveBeenCalled();
    expect(s.loading).toBe(true);
    await w.setProps({ config: { debug: true } });
    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockClear();
    data.segments[0].name = 'Restored';
    await flushPromises();
    expect(warn).not.toHaveBeenCalled();
    expect(s.loading).toBe(false);
    delete data.segments[0].from;
    await flushPromises();
    expect(warn).toHaveBeenCalledTimes(1);
    await w.setProps({ config: { debug: false } });
    warn.mockClear();
    delete data.segments[0].to;
    await flushPromises();
    expect(warn).not.toHaveBeenCalled();
});
test('debug handles empty data and null segments without throwing', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await chart({ debug: true }, {});
    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockClear();
    await chart({ debug: true }, { value: 10, segments: [null] });
    expect(warn).toHaveBeenCalledTimes(3);
});
test('debug explains nonfinite values and stays silent when disabled', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const data = {
        value: Infinity,
        segments: [{ name: 'Invalid', from: NaN, to: 100 }],
    };
    await chart({ debug: false }, data);
    expect(warn).not.toHaveBeenCalled();
    await chart({ debug: true }, data);
    expect(warn.mock.calls.map(([message]) => message)).toEqual([
        'VueUiBullet segment at index 0: from must be a finite number.',
        'VueUiBullet: dataset value must be a finite number.',
    ]);
});
