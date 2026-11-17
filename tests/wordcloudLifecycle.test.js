import { afterEach, describe, expect, test, vi } from 'vitest';
import { shallowMount, flushPromises } from '@vue/test-utils';
import { ref, reactive } from 'vue';
import WordCloud from '../src/components/vue-ui-word-cloud.vue';
import { useResponsive } from '../src/useResponsive';

const controls = vi.hoisted(() => ({ jobs: [] }));
vi.mock('../src/wordcloud', () => ({
    positionWordsAsync: vi.fn(
        (options) =>
            new Promise((resolve) => controls.jobs.push({ options, resolve })),
    ),
}));
vi.mock('../src/useResponsive', () => ({
    useResponsive: vi.fn(() => ({ width: 900, height: 500 })),
}));

vi.mock('../src/usePanZoom', () => ({
    default: (_svg, initial) => ({
        viewBox: ref(initial),
        scale: ref(1),
        isZoom: ref(false),
        resetZoom() {},
        zoomByFactor() {},
        setInitialViewBox() {},
    }),
}));
let wrapper;
const hosts = [];
afterEach(async () => {
    wrapper?.unmount();
    controls.jobs.splice(0).forEach((job) => job.resolve([]));
    await flushPromises();
    hosts.splice(0).forEach((host) => host.remove());
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});

async function mount(wordOptions = {}, config = {}) {
    controls.jobs.length = 0;
    wrapper = shallowMount(
        { ...WordCloud, render: () => null },
        {
            props: {
                dataset: [{ name: 'initial', value: 1 }],
                config: {
                    style: {
                        fontFamily: 'Georgia',
                        chart: { words: { bold: true, ...wordOptions } },
                    },
                    ...config,
                },
            },
        },
    );
    await flushPromises();
    return wrapper.vm.$.setupState;
}

describe('word cloud asynchronous ownership', () => {
    test('applies final geometry and finalizes only after the layout resolves', async () => {
        const state = await mount();
        const job = controls.jobs.at(-1);
        expect(job.options.svg.style).toEqual({
            fontFamily: 'Georgia',
            bold: true,
        });
        expect(state.cloudFinalized).toBe(false);
        job.options.onProgress({ all: [{ id: 'word', fontSize: 12 }] });
        expect(wrapper.vm.getData()[0].fontSize).toBe(12);
        job.resolve([{ id: 'word', fontSize: 48 }]);
        await flushPromises();
        expect(wrapper.vm.getData()[0].fontSize).toBe(48);
        expect(state.cloudFinalized).toBe(true);
        expect(state.isRelayout).toBe(false);
    });

    test('relayouts after nested dataset changes and nonresponsive configuration updates', async () => {
        await mount({ angles: [0, -90], randomness: 0.35, seed: 123 });
        const first = controls.jobs.at(-1);
        const dataset = reactive([{ name: 'updated', value: 3 }]);
        await wrapper.setProps({ dataset });
        await flushPromises();
        expect(first.options.signal.aborted).toBe(true);
        expect(controls.jobs.at(-1).options.words[0].name).toBe('updated');
        dataset[0].name = 'nested update';
        await flushPromises();
        expect(controls.jobs.at(-1).options.words[0].name).toBe(
            'nested update',
        );
        expect(controls.jobs.at(-1).options.angles).toEqual([0, -90]);
        expect(controls.jobs.at(-1).options.randomness).toBe(0.35);
        expect(controls.jobs.at(-1).options.seed).toBe(123);
        await wrapper.setProps({
            config: {
                style: {
                    chart: {
                        width: 720,
                        height: 280,
                        words: { maxFontSize: 45 },
                    },
                },
            },
        });
        await flushPromises();
        const current = controls.jobs.at(-1);
        expect(current.options.svg.width).toBe(720);
        expect(current.options.svg.height).toBe(280);
        expect(current.options.svg.maxFontSize).toBe(45);
    });

    test('ignores stale progress and completion after replacement and unmount', async () => {
        await mount();
        const old = controls.jobs.at(-1);
        await wrapper.setProps({
            dataset: [{ name: 'replacement', value: 2 }],
        });
        await flushPromises();
        expect(old.options.signal.aborted).toBe(true);
        old.options.onProgress({ all: [{ name: 'stale' }] });
        old.resolve([{ name: 'stale final' }]);
        await flushPromises();
        expect(wrapper.vm.getData()).toEqual([]);
        const current = controls.jobs.at(-1);
        wrapper.unmount();
        expect(current.options.signal.aborted).toBe(true);
        current.options.onProgress({ all: [{ name: 'unmounted' }] });
        expect(wrapper.vm.getData()).toEqual([]);
    });
});

async function responsiveFixture() {
    vi.stubGlobal(
        'ResizeObserver',
        class {
            observe() {}
            disconnect() {}
            unobserve() {}
        },
    );
    const frames = new Map();
    let nextFrame = 1;
    vi.stubGlobal('requestAnimationFrame', (callback) => {
        const id = nextFrame++;
        frames.set(id, callback);
        return id;
    });
    vi.stubGlobal(
        'cancelAnimationFrame',
        vi.fn((id) => frames.delete(id)),
    );
    const state = await mount();
    const host = document.createElement('div');
    const chart = document.createElement('div');
    host.appendChild(chart);
    document.body.appendChild(host);
    hosts.push(host);
    state.wordCloudChart = chart;
    await wrapper.setProps({ config: { responsive: true } });
    await flushPromises();
    frames.clear();
    vi.mocked(useResponsive).mockClear();
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    return { state, frames };
}

describe('word cloud loading and resize ownership', () => {
    test('switches between skeleton and real data without replacing the dataset', async () => {
        const skeletonDataset = [{ name: 'placeholder', value: 1 }];
        await mount({}, { loading: true, skeletonDataset });
        expect(controls.jobs.at(-1).options.words[0].name).toBe('placeholder');
        const old = controls.jobs.at(-1);
        await wrapper.setProps({ config: { loading: false, skeletonDataset } });
        await flushPromises();
        expect(old.options.signal.aborted).toBe(true);
        expect(controls.jobs.at(-1).options.words[0].name).toBe('initial');
        await wrapper.setProps({ config: { loading: true, skeletonDataset } });
        await flushPromises();
        expect(controls.jobs.at(-1).options.words[0].name).toBe('placeholder');
    });

    test('cancels a pending measurement when responsive mode is disabled', async () => {
        const { state, frames } = await responsiveFixture();
        state.handleResize();
        await wrapper.setProps({
            config: {
                responsive: false,
                style: { chart: { width: 300, height: 200 } },
            },
        });
        await flushPromises();
        await vi.advanceTimersByTimeAsync(100);
        expect(frames.size).toBe(0);
        expect(useResponsive).not.toHaveBeenCalled();
        expect(state.svg.width).toBe(300);
        expect(state.svg.height).toBe(200);
    });

    test('rejects a previously queued resize frame after switching to fixed dimensions', async () => {
        const { state, frames } = await responsiveFixture();
        state.handleResize();
        await vi.advanceTimersByTimeAsync(100);
        const [id, callback] = [...frames][0];
        await wrapper.setProps({
            config: {
                responsive: false,
                style: { chart: { width: 300, height: 200 } },
            },
        });
        await flushPromises();
        expect(cancelAnimationFrame).toHaveBeenCalledWith(id);
        callback();
        await flushPromises();
        expect(useResponsive).not.toHaveBeenCalled();
        expect(state.svg.width).toBe(300);
        expect(state.svg.height).toBe(200);
    });

    test('coalesces resize events into one measurement and one layout', async () => {
        const { state, frames } = await responsiveFixture();
        const count = controls.jobs.length;
        state.handleResize();
        state.handleResize();
        await vi.advanceTimersByTimeAsync(100);
        expect(frames.size).toBe(1);
        [...frames.values()][0]();
        frames.clear();
        await flushPromises();
        expect(useResponsive).toHaveBeenCalledTimes(1);
        expect(controls.jobs).toHaveLength(count + 1);
        expect(controls.jobs.at(-1).options.svg.width).toBe(900);
        expect(controls.jobs.at(-1).options.svg.height).toBe(488);
        expect(state.resizing).toBe(false);
    });

    test.each(['timer', 'frame'])(
        'cancels the pending resize %s on unmount',
        async (stage) => {
            const { state, frames } = await responsiveFixture();
            state.handleResize();
            if (stage === 'frame') await vi.advanceTimersByTimeAsync(100);
            const callbacks = [...frames.values()];
            wrapper.unmount();
            await vi.advanceTimersByTimeAsync(100);
            callbacks.forEach((callback) => callback());
            await flushPromises();
            expect(frames.size).toBe(0);
            expect(useResponsive).not.toHaveBeenCalled();
        },
    );
});
