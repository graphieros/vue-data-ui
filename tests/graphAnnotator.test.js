import { createApp, h, nextTick, reactive } from 'vue';
import { expect, it, afterEach, beforeAll, vi } from 'vitest';
import Graph from '../src/components/vue-ui-graph.vue';
const image = vi.hoisted(() =>
    vi.fn(async () => ({ imageUri: 'png', base64: 'base64' })),
);
vi.mock('../src/img', () => ({ default: image }));
beforeAll(async () => {
    await Promise.all([
        import('../src/atoms/PenAndPaper.vue'),
        import('../src/atoms/UserOptions.vue'),
    ]);
});
const cleanups = [];
afterEach(() => {
    cleanups.splice(0).forEach((f) => f());
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    image.mockClear();
});
async function flush() {
    for (let i = 0; i < 8; i++) {
        await new Promise((r) => setTimeout(r, 0));
        await nextTick();
    }
}
async function mount(extra = {}, slots) {
    const el = document.createElement('div');
    document.body.append(el);
    let api;
    const select = vi.fn();
    const config = reactive({
        animation: { enabled: false },
        layout: { iterations: 0 },
        viewport: { initialFit: false },
        ...extra,
    });
    const app = createApp({
        render: () =>
            h(
                Graph,
                {
                    dataset: {
                        nodes: [
                            { id: 'a', x: 0, y: 0, fixed: true },
                            { id: 'b', x: 100, y: 0, fixed: true },
                        ],
                        links: [{ source: 'a', target: 'b' }],
                    },
                    config,
                    onSelectNode: select,
                    ref: (r) => (api = r),
                },
                slots,
            ),
    });
    app.mount(el);
    cleanups.push(() => {
        app.unmount();
        el.remove();
    });
    await flush();
    const svg = el.querySelector('.vue-ui-graph-svg');
    svg.createSVGPoint = () => ({
        x: 0,
        y: 0,
        matrixTransform() {
            return { x: this.x, y: this.y };
        },
    });
    svg.getScreenCTM = () => ({ inverse: () => ({}) });
    return {
        el,
        svg,
        select,
        config,
        get api() {
            return api;
        },
    };
}
async function draw(m) {
    m.api.toggleAnnotator();
    await flush();
    for (const [type, x, y] of [
        ['mousedown', 20, 30],
        ['mousemove', 120, 130],
        ['mouseup', 120, 130],
    ])
        m.svg.dispatchEvent(
            new MouseEvent(type, {
                bubbles: true,
                cancelable: true,
                clientX: x,
                clientY: y,
            }),
        );
    await nextTick();
}
it('opens the standard drawing toolbar from UserOptions, locks interactions, and restores user zoom lock', async () => {
    const m = await mount();
    m.api.toggleZoom();
    await nextTick();
    m.el.querySelector('[data-cy=user-options-annotator]').click();
    await flush();
    expect(m.el.querySelector('.vue-ui-pen-and-paper-actions')).not.toBeNull();
    expect(m.svg.querySelector('.vue-data-ui-mask')).not.toBeNull();
    const node = m.el.querySelector('.vue-ui-graph-node'),
        layer = node.parentElement.parentElement,
        before = layer.getAttribute('transform');
    node.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(m.select).not.toHaveBeenCalled();
    m.api.zoomIn();
    m.api.resetZoom();
    m.api.fitToView();
    await nextTick();
    expect(layer.getAttribute('transform')).toBe(before);
    m.api.toggleAnnotator();
    await flush();
    expect(m.el.querySelector('.vue-ui-pen-and-paper-actions')).toBeNull();
    expect(m.svg.querySelector('.vue-data-ui-mask')).toBeNull();
    expect(m.el.querySelector('[data-cy-zoom-in]').disabled).toBe(true);
    m.api.toggleZoom();
    await nextTick();
    expect(m.el.querySelector('[data-cy-zoom-in]').disabled).toBe(false);
});
it('draws, undoes, redoes, closes and retains the drawings', async () => {
    const m = await mount(
        {},
        {
            'annotator-action-close': () =>
                h('span', { 'data-action': 'close' }, 'Close drawing'),
            'annotator-action-undo': ({ disabled }) =>
                h(
                    'span',
                    {
                        'data-action': 'undo',
                        'data-disabled': String(disabled),
                    },
                    'Undo',
                ),
            'annotator-action-redo': () =>
                h('span', { 'data-action': 'redo' }, 'Redo'),
        },
    );
    await draw(m);
    const shape = m.svg.querySelector('line.vue-data-ui-doodle');
    expect(shape).not.toBeNull();
    expect(shape.getAttribute('x1')).toBe('20');
    expect(shape.getAttribute('y2')).toBe('130');
    m.el.querySelector('[data-action=undo]').closest('button').click();
    await nextTick();
    expect(m.svg.querySelector('line.vue-data-ui-doodle')).toBeNull();
    m.el.querySelector('[data-action=redo]').closest('button').click();
    await nextTick();
    expect(m.svg.querySelector('line.vue-data-ui-doodle')).not.toBeNull();
    m.el.querySelector('[data-action=close]').closest('button').click();
    await flush();
    expect(m.el.querySelector('.vue-ui-pen-and-paper-actions')).toBeNull();
    expect(m.svg.querySelector('line.vue-data-ui-doodle')).not.toBeNull();
});
it('includes drawings in the shared SVG and PNG exports', async () => {
    const callback = vi.fn();
    vi.stubGlobal(
        'URL',
        class extends URL {
            static createObjectURL() {
                return 'blob:annotated';
            }
            static revokeObjectURL() {}
        },
    );
    const m = await mount({ userOptions: { callbacks: { svg: callback } } });
    await draw(m);
    m.api.toggleAnnotator();
    await flush();
    await m.api.generateSvg({ isCb: true });
    expect(callback.mock.calls[0][0].text).toContain('vue-data-ui-doodle');
    expect(callback.mock.calls[0][0].text).toContain('x1="20"');
    await m.api.generateImage();
    expect(
        image.mock.calls[0][0].domElement.querySelector(
            'line.vue-data-ui-doodle',
        ),
    ).not.toBeNull();
});
it('supports disabling annotator UI and the standard annotator callback', async () => {
    const disabled = await mount({
        userOptions: { buttons: { annotator: false } },
    });
    disabled.api.toggleAnnotator();
    await nextTick();
    expect(
        disabled.el.querySelector('[data-cy=user-options-annotator]'),
    ).toBeNull();
    expect(disabled.svg.querySelector('.vue-data-ui-doodles')).toBeNull();
    const callback = vi.fn(),
        m = await mount({
            userOptions: {
                callbacks: { annotator: callback },
                annotatorPalette: ['#123456'],
            },
        });
    m.el.querySelector('[data-cy=user-options-annotator]').click();
    await nextTick();
    expect(callback).toHaveBeenCalledOnce();
    expect(m.el.querySelector('.vue-ui-pen-and-paper-actions')).toBeNull();
});

it('pauses a running force layout while annotating and resumes on close', async () => {
    const frames = new Map();
    let id = 0;
    vi.stubGlobal('requestAnimationFrame', (fn) => {
        frames.set(++id, fn);
        return id;
    });
    vi.stubGlobal('cancelAnimationFrame', (handle) => frames.delete(handle));
    const m = await mount();
    m.config.animation.enabled = true;
    m.config.layout.iterations = 200;
    await nextTick();
    expect(frames.size).toBe(1);
    m.api.toggleAnnotator();
    await flush();
    expect(frames.size).toBe(0);
    const before = m.api.getData();
    await nextTick();
    expect(m.api.getData()).toEqual(before);
    m.api.toggleAnnotator();
    await flush();
    expect(frames.size).toBe(1);
});

it('drags zoom-compensated annotations by the root SVG pointer delta', async () => {
    const m = await mount();
    await draw(m);
    const shape = m.svg.querySelector('line.vue-data-ui-doodle');
    const base = 'translate(120 130) scale(0.5 0.5) translate(-120 -130)';
    shape.setAttribute('transform', base);
    shape.getScreenCTM = () => ({ inverse: () => ({}) });
    shape.getBBox = () => ({ x: 20, y: 30, width: 100, height: 100 });
    // A zoomed SVG maps two client pixels to one root SVG unit.
    m.svg.createSVGPoint = () => ({
        x: 0,
        y: 0,
        matrixTransform() {
            return { x: this.x / 2, y: this.y / 2 };
        },
    });
    shape.dispatchEvent(
        new MouseEvent('mousedown', {
            bubbles: true,
            cancelable: true,
            clientX: 100,
            clientY: 100,
        }),
    );
    m.svg.dispatchEvent(
        new MouseEvent('mousemove', {
            bubbles: true,
            cancelable: true,
            clientX: 140,
            clientY: 120,
        }),
    );
    expect(shape.getAttribute('transform')).toBe(`translate(20 10) ${base}`);
    m.svg.dispatchEvent(
        new MouseEvent('mousemove', {
            bubbles: true,
            cancelable: true,
            clientX: 180,
            clientY: 140,
        }),
    );
    expect(shape.getAttribute('transform')).toBe(`translate(40 20) ${base}`);
    m.svg.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    await nextTick();
    expect(shape.getAttribute('transform')).toBe(`translate(40 20) ${base}`);
});
