import { createApp, h, nextTick, reactive } from 'vue';
import { expect, it, afterEach, vi } from 'vitest';
import Graph from '../src/components/vue-ui-graph.vue';
const cleanups = [];
afterEach(() => {
    cleanups.splice(0).forEach((fn) => fn());
    vi.unstubAllGlobals();
});
async function mount(reduced = false) {
    const frames = new Map();
    let next = 0;
    vi.stubGlobal('requestAnimationFrame', (fn) => {
        frames.set(++next, fn);
        return next;
    });
    vi.stubGlobal('cancelAnimationFrame', (id) => frames.delete(id));
    vi.stubGlobal('matchMedia', () => ({
        matches: reduced,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
    }));
    const props = reactive({
        dataset: {
            nodes: [
                { id: 'a', x: 0, y: 0, fixed: true },
                { id: 'b', x: 100, y: 0, fixed: true },
            ],
            links: [],
        },
        config: {
            style: { chart: { width: 800, height: 600 } },
            layout: { iterations: 0 },
            viewport: { initialFit: false },
            animation: { duration: 300 },
        },
    });
    const el = document.createElement('div');
    document.body.append(el);
    let api;
    const zoom = vi.fn(),
        reset = vi.fn();
    const app = createApp({
        render: () =>
            h(Graph, {
                ...props,
                onZoom: zoom,
                onZoomReset: reset,
                ref: (r) => (api = r),
            }),
    });
    app.mount(el);
    cleanups.push(() => {
        app.unmount();
        el.remove();
    });
    async function advance(t) {
        const pending = [...frames];
        frames.clear();
        for (const [, fn] of pending) fn(t);
        await nextTick();
    }
    await advance(0);
    function view() {
        const text = el
            .querySelector('.vue-ui-graph-nodes')
            .parentElement.getAttribute('transform');
        const [x, y, k] = text.match(/-?\d*\.?\d+(?:e[+-]?\d+)?/gi).map(Number);
        return { x, y, k };
    }
    return {
        props,
        el,
        frames,
        advance,
        view,
        zoom,
        reset,
        get api() {
            return api;
        },
    };
}
it.each([true, false])(
    'fits on double click only when fitOnDoubleClick is %s',
    async (enabled) => {
        const m = await mount(true);
        m.props.config.interaction = { zoom: { fitOnDoubleClick: enabled } };
        await nextTick();
        const before = m.view();
        m.el
            .querySelector('svg')
            .dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
        await nextTick();
        if (enabled) expect(m.view()).not.toEqual(before);
        else expect(m.view()).toEqual(before);
    },
);

it('eases control zoom over frames and keeps the center anchored', async () => {
    const m = await mount();
    m.api.zoomIn();
    await nextTick();
    expect(m.view().k).toBe(1);
    await m.advance(0);
    await m.advance(75);
    expect(m.view().k).toBeCloseTo(1.03125);
    await m.advance(150);
    expect(m.view()).toEqual({ x: 400, y: 300, k: 1.125 });
    await m.advance(300);
    expect(m.view()).toEqual({ x: 400, y: 300, k: 1.25 });
    expect(m.frames.size).toBe(0);
});
it('accumulates rapid zoom actions and clamps the target', async () => {
    const m = await mount();
    m.props.config.interaction = { zoom: { max: 1.5 } };
    await nextTick();
    m.api.zoomIn();
    m.api.zoomIn();
    await m.advance(0);
    await m.advance(300);
    expect(m.view().k).toBe(1.5);
    m.api.zoomOut();
    await m.advance(400);
    await m.advance(700);
    expect(m.view().k).toBeCloseTo(1.2);
});
it('smooths wheel zoom around the pointer and accumulates wheel events', async () => {
    const m = await mount(),
        svg = m.el.querySelector('.vue-ui-graph-svg');
    for (let i = 0; i < 2; i++)
        svg.dispatchEvent(
            new WheelEvent('wheel', {
                deltaY: -100,
                clientX: 500,
                clientY: 350,
                cancelable: true,
            }),
        );
    await m.advance(0);
    await m.advance(60);
    const mid = m.view();
    expect(mid.k).toBeGreaterThan(1);
    expect(mid.k).toBeLessThan(Math.exp(0.2));
    expect((500 - mid.x) / mid.k).toBeCloseTo(100);
    expect((350 - mid.y) / mid.k).toBeCloseTo(50);
    await m.advance(120);
    expect(m.view().k).toBeCloseTo(Math.exp(0.2));
});
it('smooths reset and fit without changing the initial viewport automatically', async () => {
    const m = await mount();
    expect(m.view().k).toBe(1);
    expect(m.frames.size).toBe(0);
    m.api.zoomIn();
    await m.advance(0);
    await m.advance(300);
    m.api.resetZoom();
    await m.advance(400);
    await m.advance(550);
    expect(m.view().k).toBeCloseTo(1.125);
    expect(m.reset).not.toHaveBeenCalled();
    await m.advance(700);
    expect(m.view().k).toBe(1);
    expect(m.reset).toHaveBeenCalledOnce();
    m.api.fitToView();
    await m.advance(800);
    await m.advance(950);
    expect(m.view().k).toBeGreaterThan(1);
    expect(m.view().k).toBeLessThan(5);
    await m.advance(1100);
    expect(m.view().k).toBe(5);
});
it('cancels camera animation when a pointer gesture begins', async () => {
    const m = await mount();
    m.api.zoomIn();
    await m.advance(0);
    await m.advance(150);
    const view = m.view();
    const e = new Event('pointerdown', { bubbles: true });
    Object.assign(e, { button: 0, pointerId: 1, clientX: 50, clientY: 50 });
    m.el.querySelector('.vue-ui-graph-svg').dispatchEvent(e);
    expect(m.frames.size).toBe(0);
    await m.advance(300);
    expect(m.view()).toEqual(view);
});
it('uses instant changes for reduced motion and disabled animation', async () => {
    const m = await mount(true);
    m.api.zoomIn();
    await nextTick();
    expect(m.view().k).toBe(1.25);
    expect(m.frames.size).toBe(0);
    cleanups.pop()();
    const n = await mount();
    n.api.zoomIn();
    await n.advance(0);
    await n.advance(150);
    n.props.config.animation.enabled = false;
    await nextTick();
    expect(n.view().k).toBe(1.25);
    expect(n.frames.size).toBe(0);
});
it('cancels the camera frame on unmount', async () => {
    const m = await mount();
    m.api.zoomIn();
    expect(m.frames.size).toBe(1);
    cleanups.pop()();
    expect(m.frames.size).toBe(0);
});

it('cancels an animated zoom when locked and resumes controls on unlock', async () => {
    const m = await mount();
    m.api.zoomIn();
    await m.advance(0);
    await m.advance(150);
    const halfway = m.view();
    m.api.toggleZoom();
    await nextTick();
    expect(m.frames.size).toBe(0);
    m.api.zoomOut();
    await m.advance(300);
    expect(m.view()).toEqual(halfway);
    m.api.toggleZoom();
    m.api.zoomIn();
    await m.advance(400);
    await m.advance(700);
    expect(m.view().k).toBeCloseTo(halfway.k * 1.25);
});

function touch(svg, type, id, x, y) {
    const event = new Event(type, { bubbles: true });
    Object.assign(event, {
        pointerId: id,
        pointerType: 'touch',
        clientX: x,
        clientY: y,
        button: 0,
    });
    svg.dispatchEvent(event);
}
it('tracks the moving pinch midpoint and continues panning with the remaining finger', async () => {
    const m = await mount();
    const svg = m.el.querySelector('svg');
    touch(svg, 'pointerdown', 1, 300, 300);
    touch(svg, 'pointerdown', 2, 500, 300);
    touch(svg, 'pointermove', 2, 700, 300);
    await nextTick();
    expect(m.view()).toEqual({ x: 500, y: 300, k: 2 });
    expect(m.zoom).toHaveBeenLastCalledWith(m.view());
    touch(svg, 'pointerup', 2, 700, 300);
    touch(svg, 'lostpointercapture', 2, 700, 300);
    touch(svg, 'pointermove', 1, 330, 340);
    await nextTick();
    expect(m.view()).toEqual({ x: 530, y: 340, k: 2 });
});
it('responds immediately when reversing a pinch at its zoom limit and ignores a third finger', async () => {
    const m = await mount();
    const svg = m.el.querySelector('svg');
    touch(svg, 'pointerdown', 1, 300, 300);
    touch(svg, 'pointerdown', 2, 500, 300);
    touch(svg, 'pointerdown', 3, 450, 600);
    touch(svg, 'pointermove', 2, 2300, 300);
    await nextTick();
    expect(m.view().k).toBe(5);
    touch(svg, 'pointermove', 2, 2200, 300);
    await nextTick();
    expect(m.view().k).toBeCloseTo(4.75);
    touch(svg, 'pointerup', 3, 450, 600);
    const before = m.view();
    touch(svg, 'pointermove', 2, 2200, 300);
    await nextTick();
    expect(m.view()).toEqual(before);
});

it('applies trackpad pinch immediately at the pointer without wheel easing', async () => {
    const m = await mount();
    const svg = m.el.querySelector('svg');
    const event = new WheelEvent('wheel', {
        ctrlKey: true,
        deltaY: -40,
        clientX: 300,
        clientY: 200,
        cancelable: true,
    });
    svg.dispatchEvent(event);
    await nextTick();
    const k = Math.exp(0.4);
    expect(event.defaultPrevented).toBe(true);
    expect(m.view().k).toBeCloseTo(k);
    expect(m.view().x).toBeCloseTo(300 + 100 * k);
    expect(m.view().y).toBeCloseTo(200 + 100 * k);
    expect(m.frames.size).toBe(0);
    svg.dispatchEvent(
        new WheelEvent('wheel', {
            ctrlKey: true,
            deltaY: 40,
            clientX: 300,
            clientY: 200,
        }),
    );
    await nextTick();
    expect(m.view().k).toBeCloseTo(1);
    expect(m.frames.size).toBe(0);
});
