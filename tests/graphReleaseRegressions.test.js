import { createApp, h, reactive, nextTick } from 'vue';
import { afterEach, beforeAll, expect, it, vi } from 'vitest';
import Graph from '../src/components/vue-ui-graph.vue';
const cleanup = [];
beforeAll(async () => {
    await import('../src/atoms/Tooltip.vue');
});
afterEach(() => {
    cleanup.splice(0).forEach((fn) => fn());
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});
async function mount(
    config = {},
    dataset = {
        nodes: [
            { id: 'a', label: 'Alice', x: 0, y: 0, fixed: true },
            { id: 'b', label: 'Bob', x: 100, y: 100, fixed: true },
        ],
        links: [{ source: 'a', target: 'b' }],
    },
) {
    const el = document.createElement('div');
    el.className = 'regression-host';
    document.body.append(el);
    const props = reactive({
        dataset,
        config: {
            style: { chart: { width: 800, height: 600 } },
            responsive: false,
            animation: { enabled: false },
            layout: { iterations: 0 },
            userOptions: { show: false, buttons: { annotator: false } },
            ...config,
        },
    });
    let api;
    const app = createApp({
        render: () => h(Graph, { ...props, ref: (value) => (api = value) }),
    });
    app.mount(el);
    cleanup.push(() => {
        app.unmount();
        el.remove();
    });
    await nextTick();
    return { el, props, api, svg: el.querySelector('.vue-ui-graph-svg') };
}
function controlledFrames() {
    const frames = new Map();
    let id = 0;
    vi.stubGlobal('requestAnimationFrame', (cb) => {
        frames.set(++id, cb);
        return id;
    });
    vi.stubGlobal('cancelAnimationFrame', (key) => frames.delete(key));
    return {
        frames,
        async drain() {
            for (let i = 0; frames.size && i < 1000; i++) {
                const [key, cb] = frames.entries().next().value;
                frames.delete(key);
                cb(0);
                await nextTick();
            }
            expect(frames.size).toBe(0);
        },
    };
}
it.each([true, false])(
    'shows arrows between highlighted neighbors when neighbors=%s',
    async (neighbors) => {
        const m = await mount(
            {
                interaction: { highlight: { neighbors } },
                style: {
                    chart: {
                        links: { arrows: { show: true, showOnHover: false } },
                    },
                },
            },
            {
                nodes: ['a', 'b', 'c', 'd'].map((id, i) => ({
                    id,
                    x: i * 80,
                    y: 0,
                    fixed: true,
                })),
                links: [
                    { source: 'a', target: 'b' },
                    { source: 'a', target: 'c' },
                    { source: 'b', target: 'c' },
                    { source: 'c', target: 'd' },
                ],
            },
        );
        m.el
            .querySelector('.vue-ui-graph-node')
            .dispatchEvent(new FocusEvent('focus'));
        await nextTick();
        const arrows = m.el.querySelector('.vue-ui-graph-arrows-highlight');
        expect(arrows.getAttribute('d').match(/M /g)).toHaveLength(
            neighbors ? 3 : 2,
        );
        expect(
            m.el
                .querySelector('.vue-ui-graph-arrows')
                .getAttribute('d')
                .match(/M /g),
        ).toHaveLength(4);
    },
);

it.each([false, true])(
    'shows arrows only on hover by default, including when show=%s',
    async (show) => {
        const m = await mount({
            interaction: { highlight: { enabled: false } },
            style: { chart: { links: { arrows: { show } } } },
        });
        expect(m.el.querySelectorAll('.vue-ui-graph-arrows')).toHaveLength(0);
        const node = m.el.querySelector('.vue-ui-graph-node');
        node.dispatchEvent(new FocusEvent('focus'));
        await nextTick();
        expect(
            m.el.querySelectorAll('.vue-ui-graph-arrows-hover'),
        ).toHaveLength(1);
        node.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        node.dispatchEvent(new FocusEvent('blur'));
        await nextTick();
        expect(m.el.querySelectorAll('.vue-ui-graph-arrows')).toHaveLength(0);
        m.props.config.style.chart.links.arrows = {
            show: true,
            showOnHover: false,
        };
        await nextTick();
        expect(m.el.querySelector('.vue-ui-graph-arrows')).not.toBeNull();
        m.props.config.style.chart.links.arrows.show = false;
        await nextTick();
        expect(m.el.querySelectorAll('.vue-ui-graph-arrows')).toHaveLength(0);
    },
);

function view(m) {
    return m.el
        .querySelector('.vue-ui-graph-network')
        .getAttribute('transform')
        .match(/-?\d*\.?\d+(?:e[+-]?\d+)?/gi)
        .map(Number);
}
it.each([false, true])(
    'renders labels after all node shapes in batched=%s mode',
    async (batched) => {
        const m = await mount({
            performance: { nodeBatchThreshold: batched ? 0 : 300 },
            style: { chart: { nodes: { gradient: false } } },
        });
        const network = m.el.querySelector('.vue-ui-graph-network');
        const layer = m.el.querySelector('.vue-ui-graph-labels');
        expect(network.lastElementChild).toBe(layer);
        expect(layer.getAttribute('pointer-events')).toBe('none');
        expect(layer.querySelectorAll('text')).toHaveLength(2);
        expect(m.el.querySelectorAll('.vue-ui-graph-nodes text')).toHaveLength(
            0,
        );
    },
);

it('preserves the square default viewport and fits every node without config', async () => {
    const frames = controlledFrames();
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
        width: 800,
        height: 1200,
        left: 0,
        top: 0,
    });
    const el = document.createElement('div');
    document.body.append(el);
    const app = createApp({
        render: () =>
            h(Graph, {
                dataset: {
                    nodes: [
                        { id: 'left', x: -450, y: 0, radius: 40, fixed: true },
                        {
                            id: 'right',
                            x: 450,
                            y: 200,
                            radius: 50,
                            fixed: true,
                        },
                    ],
                    links: [{ source: 'left', target: 'right' }],
                },
            }),
    });
    app.mount(el);
    cleanup.push(() => {
        app.unmount();
        el.remove();
    });
    await frames.drain();
    const svg = el.querySelector('.vue-ui-graph-svg');
    expect(svg.getAttribute('viewBox')).toBe('0 0 600 600');
    expect(svg.style.height).toBe('auto');
    expect(svg.style.aspectRatio).toBe('600 / 600');
    const [x, y, scale] = view({ el });
    for (const [nx, ny, radius] of [
        [-450, 0, 40],
        [450, 200, 50],
    ]) {
        expect(x + (nx - radius) * scale).toBeGreaterThanOrEqual(0);
        expect(x + (nx + radius) * scale).toBeLessThanOrEqual(600);
        expect(y + (ny - radius) * scale).toBeGreaterThanOrEqual(0);
        expect(y + (ny + radius) * scale).toBeLessThanOrEqual(600);
    }
});

it('refits an automatic viewport on responsive resize until the user zooms', async () => {
    let resize;
    let width = 600;
    vi.stubGlobal(
        'ResizeObserver',
        class {
            constructor(callback) {
                resize = callback;
            }
            observe() {}
            disconnect() {}
        },
    );
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(
        () => ({ width, height: 600, left: 0, top: 0 }),
    );
    const m = await mount({
        responsive: true,
        viewport: { fitOnResize: false },
        style: { chart: { controls: { show: false } } },
    });
    const initialScale = view(m)[2];
    width = 200;
    resize();
    await nextTick();
    expect(view(m)[2]).toBeLessThan(initialScale);
    m.api.zoomIn();
    await nextTick();
    const userScale = view(m)[2];
    width = 150;
    resize();
    await nextTick();
    expect(view(m)[2]).toBe(userScale);
});

it('uses fixed plot height for an auto-height parent and follows a constrained parent', async () => {
    let resize;
    vi.stubGlobal(
        'ResizeObserver',
        class {
            constructor(cb) {
                resize = cb;
            }
            observe() {}
            disconnect() {}
        },
    );
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(
        function () {
            const root = this.querySelector?.('.vue-ui-graph');
            const svg = this.matches?.('.vue-ui-graph-svg')
                ? this
                : this.querySelector?.('.vue-ui-graph-svg');
            let height = svg ? parseFloat(svg.style.height) || 600 : 0;
            if (this.classList?.contains('regression-host'))
                height =
                    parseFloat(this.style.height) ||
                    (root.style.position === 'absolute' ? 40 : height + 40);
            return { width: 800, height, left: 0, top: 0 };
        },
    );
    const m = await mount({
        responsive: true,
        style: { chart: { controls: { show: false } } },
    });
    for (let i = 0; i < 4; i++) {
        resize();
        await nextTick();
        expect(m.svg.style.height).toBe('600px');
    }
    m.el.style.height = '450px';
    resize();
    await nextTick();
    expect(m.svg.style.height).toBe('450px');
    m.el.style.height = '';
    resize();
    await nextTick();
    expect(m.svg.style.height).toBe('600px');
    expect(m.el.querySelector('.vue-ui-graph').style.position).toBe('');
});
it.each([false, true])(
    'selectedOnly ignores hover and displays only the selected label (batched=%s)',
    async (batched) => {
        const m = await mount({
            performance: { nodeBatchThreshold: batched ? 0 : 300 },
            style: {
                chart: {
                    nodes: { gradient: false, labels: { selectedOnly: true } },
                },
            },
        });
        m.svg.dispatchEvent(new FocusEvent('focus'));
        await nextTick();
        expect(m.el.querySelectorAll('.vue-ui-graph-labels text')).toHaveLength(
            0,
        );
        m.api.focusNode('a');
        await nextTick();
        m.svg.dispatchEvent(
            new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }),
        );
        await nextTick();
        const labels = m.el.querySelectorAll('.vue-ui-graph-labels text');
        expect(labels).toHaveLength(1);
        expect(labels[0].textContent).toBe('Alice');
    },
);
it('anchors keyboard tooltips using the SVG screen transform', async () => {
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(
        function () {
            const tooltip = this.getAttribute('role') === 'tooltip';
            return {
                left: 100,
                top: 50,
                width: tooltip ? 120 : 400,
                height: tooltip ? 50 : 600,
                right: 500,
                bottom: 650,
            };
        },
    );
    const m = await mount({ viewport: { initialFit: false } });
    m.svg.getScreenCTM = () => ({ a: 0.5, b: 0, c: 0, d: 0.5, e: 100, f: 200 });
    m.el
        .querySelectorAll('.vue-ui-graph-node')[1]
        .dispatchEvent(new FocusEvent('focus'));
    for (let i = 0; i < 8; i++) {
        await new Promise((resolve) => setTimeout(resolve, 0));
        await nextTick();
    }
    expect(document.querySelector('[role=tooltip]').style.transform).toBe(
        'translate3d(290px, 424px, 0)',
    );
});
it('fits the updated graph only after its force simulation completes', async () => {
    const m = await mount({
        viewport: { fitOnUpdate: true },
        style: { chart: { nodes: { labels: { show: false } } } },
    });
    const initial = view(m);
    const clock = controlledFrames();
    m.props.config.animation.enabled = true;
    m.props.config.layout.iterations = 50;
    m.props.dataset.nodes.push({ id: 'new', x: 2000, y: 0 });
    await nextTick();
    expect(view(m)).toEqual(initial);
    await clock.drain();
    const [x, y, k] = view(m);
    for (const n of m.api.getData().nodes) {
        expect(x + (n.x - 7) * k).toBeGreaterThanOrEqual(35.99);
        expect(x + (n.x + 7) * k).toBeLessThanOrEqual(764.01);
        expect(y + (n.y - 7) * k).toBeGreaterThanOrEqual(35.99);
        expect(y + (n.y + 7) * k).toBeLessThanOrEqual(564.01);
    }
    expect(k).not.toBe(initial[2]);
});
it('fits multiline labels and self-loop control-point bounds', async () => {
    const m = await mount(
        {},
        {
            nodes: [
                {
                    id: 'a',
                    x: 0,
                    y: 0,
                    fixed: true,
                    label: 'a\nb\nc\nd\ne\nf\ng\nh',
                },
            ],
            links: Array.from({ length: 3 }, () => ({
                source: 'a',
                target: 'a',
            })),
        },
    );
    const [x, y, k] = view(m);
    for (const tspan of m.el.querySelectorAll(
        '.vue-ui-graph-labels text tspan',
    )) {
        const baseline = y + Number(tspan.getAttribute('y')) * k;
        expect(baseline - 9 * k).toBeGreaterThanOrEqual(35.99);
        expect(baseline + 9 * k).toBeLessThanOrEqual(564.01);
    }
    for (const path of m.el.querySelectorAll('.vue-ui-graph-link')) {
        const points = path
            .getAttribute('d')
            .match(/-?\d*\.?\d+(?:e[+-]?\d+)?/gi)
            .map(Number);
        for (let i = 0; i < points.length; i += 2) {
            expect(x + points[i] * k).toBeGreaterThanOrEqual(35.99);
            expect(x + points[i] * k).toBeLessThanOrEqual(764.01);
            expect(y + points[i + 1] * k).toBeGreaterThanOrEqual(35.99);
            expect(y + points[i + 1] * k).toBeLessThanOrEqual(564.01);
        }
    }
});
it.each([false, true])(
    'yields and shares non-animated initial layouts (reduced motion=%s)',
    async (reduced) => {
        const clock = controlledFrames();
        vi.stubGlobal('matchMedia', () => ({
            matches: reduced,
            addEventListener() {},
            removeEventListener() {},
        }));
        let now = 0;
        vi.spyOn(performance, 'now').mockImplementation(() => (now += 9));
        const config = {
            animation: { enabled: reduced },
            layout: { iterations: 80, chargeStrength: reduced ? -91 : -92 },
        };
        const first = await mount(config);
        const second = await mount(config);
        expect(first.el.querySelector('.vue-ui-graph-network')).toBeNull();
        expect(second.el.querySelector('.vue-ui-graph-network')).toBeNull();
        expect(clock.frames.size).toBe(1);
        await clock.drain();
        expect(first.api.getData()).toEqual(second.api.getData());
        expect(first.el.querySelector('.vue-ui-graph-network')).not.toBeNull();
        expect(second.el.querySelector('.vue-ui-graph-network')).not.toBeNull();
    },
);
