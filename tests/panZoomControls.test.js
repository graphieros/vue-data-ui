import { mount } from '@vue/test-utils';
import { h, ref, nextTick } from 'vue';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import usePanZoom from '../src/usePanZoom';
let wrappers, frames, id;
beforeEach(() => {
    wrappers = [];
    frames = new Map();
    id = 0;
    vi.stubGlobal('requestAnimationFrame', (cb) => {
        frames.set(++id, cb);
        return id;
    });
    vi.stubGlobal('cancelAnimationFrame', (id) => frames.delete(id));
});
afterEach(() => {
    wrappers.forEach((w) => w.unmount());
    vi.unstubAllGlobals();
});
async function harness(options = {}) {
    const active = ref(true),
        target = ref(null);
    let controls;
    const w = mount({
        setup() {
            controls = usePanZoom(
                target,
                { x: 0, y: 0, width: 100, height: 100 },
                1,
                active,
                null,
                options,
            );
            return () => h('svg', { ref: target });
        },
    });
    wrappers.push(w);
    await nextTick();
    w.element.getBoundingClientRect = () => ({
        left: 0,
        top: 0,
        width: 100,
        height: 100,
    });
    w.element.setPointerCapture = vi.fn();
    return { w, controls, active, target };
}
function flush(time = 0) {
    const callbacks = [...frames.values()];
    frames.clear();
    callbacks.forEach((cb) => cb(time));
}
function pointer(x, y = 0, pointerId = 1) {
    return { clientX: x, clientY: y, pointerId, button: 0 };
}
test('zoom limits preserve the cursor anchor and external viewports keep scale and center consistent', async () => {
    const maxScale = ref(4);
    const { controls: c } = await harness({
        bindEvents: false,
        minScale: 1,
        maxScale,
    });
    c.zoomAt(2, { x: 25, y: 75 });
    expect(c.viewBox.value).toEqual({
        x: 12.5,
        y: 37.5,
        width: 50,
        height: 50,
    });
    c.zoomAt(10, { x: 25, y: 75 });
    expect(c.scale.value).toBe(4);
    expect(c.viewBox.value).toEqual({
        x: 18.75,
        y: 56.25,
        width: 25,
        height: 25,
    });
    c.setViewBox({ x: 40, y: 60, width: 10, height: 10 });
    expect(c.viewBox.value).toEqual({
        x: 32.5,
        y: 52.5,
        width: 25,
        height: 25,
    });
    expect(c.scale.value).toBe(4);
    maxScale.value = 2;
    await nextTick();
    expect(c.scale.value).toBe(2);
    expect(c.viewBox.value.x + c.viewBox.value.width / 2).toBe(45);
    expect(c.setViewBox({ x: 0, y: 0, width: 0, height: NaN })).toBe(false);
    c.resetZoom();
    expect(c.viewBox.value).toEqual({ x: 0, y: 0, width: 100, height: 100 });
});
test('pointer threshold prevents click suppression until movement, and frame updates use the latest gesture', async () => {
    const { w, controls: c } = await harness({
        bindEvents: false,
        dragThreshold: 5,
    });
    c.onPointerDown(pointer(10, 10));
    c.onPointerMove(pointer(12, 11));
    expect(c.dragging.value).toBe(false);
    expect(c.suppressClick.value).toBe(false);
    expect(w.element.setPointerCapture).not.toHaveBeenCalled();
    c.onPointerMove(pointer(20, 20));
    c.onPointerMove(pointer(30, 25));
    expect(frames.size).toBe(1);
    flush();
    expect(c.viewBox.value).toEqual({
        x: -20,
        y: -15,
        width: 100,
        height: 100,
    });
    c.onPointerUp(pointer(30, 25));
    expect(c.suppressClick.value).toBe(true);
    expect(c.dragging.value).toBe(false);
    c.onPointerDown(pointer(0));
    expect(c.suppressClick.value).toBe(false);
});
test('pinch zoom uses its starting scale on repeated moves and respects limits', async () => {
    const { controls: c } = await harness({
        bindEvents: false,
        minScale: 1,
        maxScale: 3,
        panEnabled: false,
    });
    c.onPointerDown(pointer(25, 50, 1));
    c.onPointerDown(pointer(75, 50, 2));
    c.onPointerMove(pointer(125, 50, 2));
    flush();
    expect(c.scale.value).toBe(2);
    c.onPointerMove(pointer(175, 50, 2));
    flush();
    expect(c.scale.value).toBe(3);
    c.onPointerMove(pointer(225, 50, 2));
    flush();
    expect(c.scale.value).toBe(3);
    c.onPointerUp(pointer(225, 50, 2));
    c.onPointerUp(pointer(25, 50, 1));
});
test('custom drags share cancellation and pointer lifecycle while leaving the viewport unchanged', async () => {
    const onDrag = vi.fn(() => true),
        onDragStart = vi.fn(() => [10, 20]);
    const { controls: c, active } = await harness({
        bindEvents: false,
        dragThreshold: 5,
        onDrag,
        onDragStart,
    });
    c.onPointerDown(pointer(0));
    c.onPointerMove(pointer(20));
    const stale = [...frames.values()][0];
    active.value = false;
    await nextTick();
    stale(0);
    expect(onDrag).not.toHaveBeenCalled();
    expect(frames.size).toBe(0);
    expect(c.dragging.value).toBe(false);
    active.value = true;
    await nextTick();
    c.onPointerDown(pointer(0));
    c.onPointerMove(pointer(20));
    flush();
    expect(onDrag).toHaveBeenCalledWith({
        dx: 20,
        dy: 0,
        scale: 1,
        context: [10, 20],
    });
    expect(c.viewBox.value.x).toBe(0);
});
test('pan and zoom switches are independent and manual binding does not add duplicate wheel handlers', async () => {
    const zoomEnabled = ref(false),
        panEnabled = ref(false);
    const { w, controls: c } = await harness({
        bindEvents: false,
        zoomEnabled,
        panEnabled,
    });
    const preventDefault = vi.fn();
    c.onWheel({ deltaY: -1, clientX: 50, clientY: 50, preventDefault });
    expect(preventDefault).not.toHaveBeenCalled();
    zoomEnabled.value = true;
    await nextTick();
    w.element.dispatchEvent(
        new WheelEvent('wheel', {
            deltaY: -1,
            clientX: 50,
            clientY: 50,
            bubbles: true,
            cancelable: true,
        }),
    );
    expect(c.scale.value).toBe(1);
    c.onWheel({ deltaY: -1, clientX: 50, clientY: 50, preventDefault });
    expect(c.scale.value).toBe(1.1);
    c.onPointerDown(pointer(0));
    c.onPointerMove(pointer(20));
    flush();
    expect(c.dragging.value).toBe(false);
});
test('replacing the SVG detaches old listeners and disabling cancels queued pointer movement', async () => {
    const {
        w,
        controls: c,
        target,
        active,
    } = await harness({ eventMode: 'pointer', dragThreshold: 5 });
    const old = w.element;
    const replacement = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'svg',
    );
    replacement.getBoundingClientRect = old.getBoundingClientRect;
    target.value = replacement;
    await nextTick();
    const wheel = () =>
        new WheelEvent('wheel', {
            deltaY: -1,
            clientX: 50,
            clientY: 50,
            cancelable: true,
        });
    old.dispatchEvent(wheel());
    expect(c.scale.value).toBe(1);
    replacement.dispatchEvent(wheel());
    expect(c.scale.value).toBe(1.1);
    expect(old.hasAttribute('data-vdui-pan-zoom')).toBe(false);
    c.onPointerDown(pointer(0));
    c.onPointerMove(pointer(20));
    active.value = false;
    await nextTick();
    flush();
    expect(c.dragging.value).toBe(false);
    expect(c.viewBox.value.x).toBeCloseTo(50 - 50 / 1.1);
});

test('animated reset honors optional minimum zoom and leaves default reset behavior unchanged', async () => {
    const { controls: c } = await harness({
        bindEvents: false,
        minScale: 2,
        maxScale: 4,
    });
    c.zoomByFactor(4);
    c.resetZoom(true);
    flush(0);
    flush(300);
    expect(c.scale.value).toBe(2);
    expect(c.isZoom.value).toBe(false);
    expect(c.viewBox.value).toEqual({ x: 25, y: 25, width: 50, height: 50 });
    expect(frames.size).toBe(0);
});
