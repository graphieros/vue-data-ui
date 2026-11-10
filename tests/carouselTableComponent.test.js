import { mount, flushPromises } from '@vue/test-utils';
import { nextTick } from 'vue';
import { beforeEach, afterEach, test, expect, vi } from 'vitest';
import Chart from '../src/components/vue-ui-carousel-table.vue';

const dataset = {
    head: ['Name', 'Value'],
    body: [
        ['A', 1],
        ['B', 2],
        ['C', 3],
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
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
        function () {
            return {
                height:
                    this.tagName === 'TR'
                        ? Number(this.textContent.match(/\d+/)?.[0] || 20)
                        : 10,
                top: 0,
                bottom: 0,
                width: 800,
            };
        },
    );
    Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
        configurable: true,
        value: vi.fn(function ({ top }) {
            this.scrollTop = top;
        }),
    });
});
afterEach(() => {
    wrappers.forEach((w) => w.unmount());
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});
async function chart(config = {}, data = dataset) {
    const w = mount(Chart, {
        props: {
            dataset: data,
            config: { ...config, userOptions: { show: false } },
        },
        global: { stubs: { Skeleton: true } },
    });
    wrappers.push(w);
    await flushPromises();
    const s = w.vm.$.setupState;
    Object.defineProperties(s.tableContainer, {
        scrollHeight: { configurable: true, value: 1000 },
        clientHeight: { configurable: true, value: 50 },
    });
    return [w, s];
}
function frame(time) {
    const callbacks = [...frames.values()];
    frames.clear();
    callbacks.forEach((cb) => cb(time));
}
test('CSV includes every body row regardless of column count', async () => {
    const [w] = await chart();
    const callback = vi.fn();
    w.vm.generateCsv(callback);
    await nextTick();
    expect(callback.mock.calls[0][0]).toBe(
        'data:text/csv;charset=utf-8,\nName,Value\nA,1\nB,2\nC,3',
    );
});
test('invalid initial data recovers and valid data can become invalid safely', async () => {
    const [w, s] = await chart({}, {});
    expect(s.isDataset).toBe(false);
    expect(w.find('table').exists()).toBe(false);
    await w.setProps({ dataset });
    await flushPromises();
    expect(w.findAll('tbody tr')).toHaveLength(3);
    expect(s.rowHeights).toEqual([1, 2, 3]);
    await w.setProps({ dataset: { head: ['A'], body: [null] } });
    expect(s.isDataset).toBe(false);
    expect(s.rowHeights).toEqual([]);
});
test('replacement rows are measured after rendering and reset scrolling', async () => {
    const [w, s] = await chart();
    frame(0);
    frame(1000);
    expect(s.init).toBe(1);
    await w.setProps({ dataset: { head: ['N'], body: [[42]] } });
    expect(s.rowHeights).toEqual([42]);
    expect(s.init).toBe(0);
    expect(s.scrollIndex).toBe(0);
    frame(2000);
    frame(3000);
    expect(Number.isFinite(s.init)).toBe(true);
});
test('explicit pause survives resizing, hover leave, and config changes', async () => {
    const [w, s] = await chart();
    w.vm.pauseAnimation();
    observers[0].callback([{ contentRect: { width: 300 } }]);
    await nextTick();
    await w.find('[id^="carousel-table_"]').trigger('mouseleave');
    await w.setProps({
        config: { caption: { text: 'Updated' }, userOptions: { show: false } },
    });
    expect(s.isPaused).toBe(true);
    expect(frames.size).toBe(0);
    w.vm.resumeAnimation();
    expect(s.isPaused).toBe(false);
    expect(frames.size).toBe(1);
});
test('hover and touch remain independent pause reasons', async () => {
    vi.useFakeTimers();
    const [w, s] = await chart();
    const container = w.find('[id^="carousel-table_"]');
    await container.trigger('mouseenter');
    await container.trigger('touchstart');
    await container.trigger('mouseleave');
    expect(s.isPaused).toBe(true);
    await container.trigger('touchend');
    vi.advanceTimersByTime(1000);
    expect(s.isPaused).toBe(false);
});
test('animation toggles and animation.use updates preserve explicit pause', async () => {
    const [w, s] = await chart({ animation: { use: false } });
    expect(frames.size).toBe(0);
    w.vm.toggleAnimation();
    expect(frames.size).toBe(1);
    w.vm.pauseAnimation();
    await w.setProps({
        config: { animation: { use: true }, userOptions: { show: false } },
    });
    expect(s.isPaused).toBe(true);
});
test('new rows participate in scroll visibility', async () => {
    const [w] = await chart();
    await w.setProps({
        dataset: { ...dataset, body: [...dataset.body, ['D', 4]] },
    });
    const row = w.findAll('tbody tr')[3].element;
    row.getBoundingClientRect = () => ({ top: -10 });
    await w.find('[id^="carousel-table_"]').trigger('scroll');
    expect(row.style.visibility).toBe('hidden');
});
test('marquee covers equal distances at different frame rates', async () => {
    const [w, s] = await chart({
        animation: { type: 'marquee', speedMs: 1000 },
    });
    frame(0);
    for (let t = 10; t <= 1000; t += 10) frame(t);
    const distance = s.init;
    await w.setProps({ dataset: { ...dataset, body: [...dataset.body] } });
    frame(0);
    for (let t = 20; t <= 1000; t += 20) frame(t);
    expect(s.init).toBeCloseTo(distance, 8);
    expect(distance).toBeCloseTo(15, 8);
});
test('reduced motion changes stop and restart playback without mutating config', async () => {
    const [, s] = await chart();
    media.matches = true;
    media.addEventListener.mock.calls[0][1]();
    expect(frames.size).toBe(0);
    expect(s.userOptionConfig.buttons.animation).toBe(false);
    expect(s.FINAL_CONFIG.userOptions.buttons.animation).toBe(true);
    media.matches = false;
    media.addEventListener.mock.calls[0][1]();
    expect(frames.size).toBe(1);
});
test('unmount cancels touch resume and ignores queued resize work', async () => {
    vi.useFakeTimers();
    const [w, s] = await chart();
    s.pauseOnTouch();
    s.resumeAfterDelay();
    observers[0].callback([{ contentRect: { width: 300 } }]);
    w.unmount();
    await nextTick();
    vi.advanceTimersByTime(1000);
    expect(frames.size).toBe(0);
    expect(observers[0].disconnect).toHaveBeenCalled();
});
