import { mount, flushPromises } from '@vue/test-utils';
import { nextTick, h, ref } from 'vue';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import Tooltip from '../src/atoms/Tooltip.vue';
import { useMouse } from '../src/useMouse';
import { calcTooltipPosition } from '../src/calcTooltipPosition';

let wrappers, elements, frames, frameId, observers;
beforeEach(() => {
    wrappers = [];
    elements = [];
    frames = new Map();
    frameId = 0;
    observers = [];
    vi.stubGlobal('requestAnimationFrame', (callback) => {
        frames.set(++frameId, callback);
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
    wrappers.forEach((w) => w.unmount());
    elements.forEach((el) => el.remove());
    await flushPromises();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});
const bounds = (left, top, width, height) => ({
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
    x: left,
    y: top,
});
async function tick() {
    const callbacks = [...frames.values()];
    frames.clear();
    callbacks.forEach((cb) => cb());
    await nextTick();
}
async function finishFrames() {
    for (let i = 0; frames.size && i < 200; i++) await tick();
    expect(frames.size).toBe(0);
}
async function chart(props = {}, slots) {
    const parent = document.createElement('div');
    document.body.appendChild(parent);
    elements.push(parent);
    let chartRect = bounds(0, 0, 500, 400),
        tooltipRect = bounds(0, 0, 100, 40);
    parent.getBoundingClientRect = () => chartRect;
    const measureChart = vi
        .spyOn(parent, 'getBoundingClientRect')
        .mockImplementation(() => chartRect);
    const measureTooltip = vi
        .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
        .mockImplementation(function () {
            return this.getAttribute('role') === 'tooltip'
                ? tooltipRect
                : bounds(0, 0, 0, 0);
        });
    const w = mount(Tooltip, {
        props: {
            parent,
            show: true,
            smooth: false,
            content: 'Content',
            ...props,
        },
        slots,
    });
    wrappers.push(w);
    await flushPromises();
    await finishFrames();
    return {
        w,
        parent,
        s: w.vm.$.setupState,
        measureChart,
        measureTooltip,
        setChartRect: (rect) => (chartRect = rect),
        setTooltipRect: (rect) => (tooltipRect = rect),
    };
}
function move(x, y) {
    window.dispatchEvent(
        new MouseEvent('mousemove', { clientX: x, clientY: y }),
    );
}
function mouseConsumer(enabled = true) {
    const active = ref(enabled);
    const w = mount({
        setup() {
            const mouse = useMouse(active);
            return { ...mouse };
        },
        render: () => null,
    });
    wrappers.push(w);
    return { w, active, s: w.vm.$.setupState };
}

test('mounted consumers share one mouse listener and hidden consumers do not update local refs', async () => {
    const add = vi.spyOn(window, 'addEventListener'),
        remove = vi.spyOn(window, 'removeEventListener');
    const a = mouseConsumer(),
        b = mouseConsumer(),
        hidden = mouseConsumer(false);
    const initialHidden = [hidden.s.x, hidden.s.y];
    move(120, 130);
    await nextTick();
    expect([a.s.x, a.s.y, b.s.x, b.s.y]).toEqual([120, 130, 120, 130]);
    expect([hidden.s.x, hidden.s.y]).toEqual(initialHidden);
    expect(
        add.mock.calls.filter(([type]) => type === 'mousemove'),
    ).toHaveLength(1);
    hidden.active.value = true;
    await nextTick();
    expect([hidden.s.x, hidden.s.y]).toEqual([120, 130]);
    a.s.setPosition({ x: 10, y: 20 });
    expect([b.s.x, b.s.y]).toEqual([120, 130]);
    a.active.value = false;
    a.active.value = true;
    await nextTick();
    expect([a.s.x, a.s.y]).toEqual([10, 20]);
    wrappers.splice(0).forEach((w) => w.unmount());
    const calls = remove.mock.calls.filter(([type]) => type === 'mousemove');
    expect(calls).toHaveLength(1);
    expect(calls[0][1]).toBe(
        add.mock.calls.find(([type]) => type === 'mousemove')[1],
    );
});

test('pointer smoothing performs no repeated DOM measurement after the initial snapshot', async () => {
    const { w, s, measureChart, measureTooltip } = await chart({
        smooth: true,
    });
    measureChart.mockClear();
    measureTooltip.mockClear();
    move(250, 150);
    await nextTick();
    expect(frames.size).toBe(1);
    await finishFrames();
    expect(s.pixelPosition).toEqual({ left: 200, top: 174 });
    expect(measureChart).not.toHaveBeenCalled();
    expect(measureTooltip).not.toHaveBeenCalled();
    // Keep exercising moving targets, not just a stationary tooltip.
    for (let i = 0; i < 20; i++) {
        move(260 + i, 160 + i);
        await nextTick();
        await tick();
    }
    await finishFrames();
    expect(measureChart).not.toHaveBeenCalled();
    expect(measureTooltip).not.toHaveBeenCalled();
    await w.setProps({ show: false });
    move(400, 300);
    await nextTick();
    expect(frames.size).toBe(0);
});

test('pointer movement is idle in keyboard mode, which uses its own anchor and resumes correctly', async () => {
    const { w, s } = await chart({ smooth: true });
    move(250, 150);
    await nextTick();
    const stale = [...frames.values()][0];
    await w.setProps({ isA11yMode: true, a11yPosition: { x: 100, y: 80 } });
    expect(frames.size).toBe(0);
    stale();
    expect(s.pixelPosition).toEqual({ left: 50, top: 104 });
    const previousPointer = [s.x, s.y];
    move(350, 250);
    await nextTick();
    expect([s.x, s.y]).toEqual(previousPointer);
    expect(frames.size).toBe(0);
    w.vm.placeTooltip({ x: 450, y: 350 });
    await nextTick();
    expect(s.pixelPosition).toEqual({ left: 50, top: 104 });
    await w.setProps({ a11yPosition: { x: 200, y: 180 } });
    expect(s.pixelPosition).toEqual({ left: 150, top: 204 });
    await w.setProps({ isA11yMode: false });
    expect(s.pixelPosition).toEqual({ left: 300, top: 274 });
    expect(frames.size).toBe(0);
});

test('content, tooltip size, ancestor layout, scroll and resize invalidate and coalesce measurements', async () => {
    const {
        w,
        parent,
        s,
        measureChart,
        measureTooltip,
        setChartRect,
        setTooltipRect,
    } = await chart();
    move(250, 150);
    await nextTick();
    measureChart.mockClear();
    measureTooltip.mockClear();
    setTooltipRect(bounds(0, 0, 200, 80));
    await w.setProps({ content: 'A longer tooltip' });
    await finishFrames();
    expect(s.pixelPosition).toEqual({ left: 150, top: 174 });
    expect(measureChart).toHaveBeenCalledTimes(1);
    setTooltipRect(bounds(0, 0, 300, 80));
    observers[0].callback([]);
    await finishFrames();
    expect(s.pixelPosition.left).toBe(100);
    measureChart.mockClear();
    measureTooltip.mockClear();
    setChartRect(bounds(200, 0, 500, 400));
    parent.dispatchEvent(new Event('scroll'));
    window.dispatchEvent(new Event('resize'));
    await finishFrames();
    expect(measureChart).toHaveBeenCalledTimes(1);
    expect(s.pixelPosition.left).toBe(200);
    setChartRect(bounds(100, 0, 500, 400));
    parent.style.marginLeft = '100px';
    await flushPromises();
    await finishFrames();
    expect(s.pixelPosition.left).toBe(100);
});

test.each(['center', 'left', 'right'])(
    'cached geometry preserves %s placement and edge shifting',
    async (position) => {
        const { w, parent, s } = await chart({
            position,
            offsetX: 7,
            offsetY: 12,
        });
        for (const point of [
            { x: 10, y: 10 },
            { x: 250, y: 200 },
            { x: 490, y: 390 },
        ]) {
            w.vm.placeTooltip(point);
            await nextTick();
            const expected = calcTooltipPosition({
                tooltip: s.tooltip,
                chart: parent,
                clientPosition: point,
                positionPreference: position,
                defaultOffsetX: 7,
                defaultOffsetY: 12,
            });
            expect(s.pixelPosition).toEqual({
                top: Math.round(expected.top),
                left: Math.round(expected.left),
            });
        }
        await w.setProps({ blockShiftY: true });
        expect(s.pixelPosition.top).toBe(402);
    },
);

test('custom slot resizing and presentation changes refresh geometry without replacing slot content', async () => {
    const message = ref('First');
    const { w, s, setTooltipRect } = await chart(
        { isCustom: true },
        { tooltip: () => h('span', { 'data-custom': '' }, message.value) },
    );
    move(250, 150);
    await nextTick();
    setTooltipRect(bounds(0, 0, 160, 50));
    message.value = 'Second';
    await nextTick();
    observers[0].callback([]);
    await finishFrames();
    expect(document.querySelector('[data-custom]').textContent).toBe('Second');
    expect(s.pixelPosition.left).toBe(170);
    await w.setProps({ maxWidth: '500px', fontSize: 20, borderWidth: 3 });
    await finishFrames();
    expect(s.pixelPosition.left).toBe(170);
});

test('hide/unmount disconnect sensors and invalidate callbacks, including rapid show/hide', async () => {
    const { w, measureChart } = await chart();
    const observer = observers[0];
    observer.callback([]);
    const queued = [...frames.values()];
    await w.setProps({ show: false });
    expect(observer.disconnect).toHaveBeenCalledTimes(1);
    measureChart.mockClear();
    queued.forEach((cb) => cb());
    observer.callback([]);
    expect(measureChart).not.toHaveBeenCalled();
    expect(frames.size).toBe(0);
    await w.setProps({ show: true });
    await flushPromises();
    const current = observers.at(-1);
    current.callback([]);
    wrappers.splice(wrappers.indexOf(w), 1);
    w.unmount();
    expect(current.disconnect).toHaveBeenCalledTimes(1);
    expect(frames.size).toBe(0);
    current.callback([]);
    expect(frames.size).toBe(0);
});

test('programmatic placement remains independent when multiple tooltips share pointer tracking', async () => {
    const a = await chart({ show: false }),
        b = await chart();
    a.w.vm.placeTooltip({ x: 200, y: 100 });
    await a.w.setProps({ show: true });
    await flushPromises();
    await finishFrames();
    expect(a.s.pixelPosition).toEqual({ left: 150, top: 124 });
    expect(b.s.x).not.toBe(200);
    move(300, 200);
    await nextTick();
    expect(a.s.pixelPosition).toEqual({ left: 250, top: 224 });
    expect(b.s.pixelPosition).toEqual({ left: 250, top: 224 });
});

test('fullscreen teleport replacement refreshes geometry in the new containing block', async () => {
    vi.stubGlobal(
        'DOMMatrixReadOnly',
        class {
            a = 2;
            b = 0;
            c = 0;
            d = 2;
        },
    );
    const { w, parent, s, setChartRect } = await chart();
    parent.style.transform = 'matrix(2, 0, 0, 2, 0, 0)';
    setChartRect(bounds(100, 50, 500, 400));
    move(300, 200);
    await nextTick();
    await w.setProps({ isFullscreen: true });
    await flushPromises();
    await finishFrames();
    expect(parent.contains(s.tooltip)).toBe(true);
    expect(s.pixelPosition).toEqual({ left: 50, top: 99 });
    await w.setProps({ isFullscreen: false });
    await flushPromises();
    await finishFrames();
    expect(parent.contains(s.tooltip)).toBe(false);
    expect(s.pixelPosition).toEqual({ left: 250, top: 224 });
});

test('layout animations refresh bounds only while running, excluding opacity-only animations', async () => {
    const { parent, s, measureChart, setChartRect } = await chart();
    move(250, 150);
    await nextTick();
    const animation = {
        playState: 'running',
        effect: {
            getKeyframes: () => [
                { transform: 'translateX(0px)' },
                { transform: 'translateX(20px)' },
            ],
        },
    };
    parent.getAnimations = () => [animation];
    setChartRect(bounds(240, 0, 500, 400));
    parent.dispatchEvent(new Event('transitionrun', { bubbles: true }));
    await tick();
    expect(s.pixelPosition.left).toBe(240);
    expect(frames.size).toBe(1);
    animation.playState = 'finished';
    await finishFrames();
    measureChart.mockClear();
    parent.getAnimations = () => [
        {
            playState: 'running',
            effect: { getKeyframes: () => [{ opacity: 0 }, { opacity: 1 }] },
        },
    ];
    parent.dispatchEvent(new Event('animationstart', { bubbles: true }));
    await tick();
    expect(measureChart).toHaveBeenCalledTimes(1);
    expect(frames.size).toBe(0);
});
