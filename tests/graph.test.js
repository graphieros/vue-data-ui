import { createApp, h, nextTick, reactive } from 'vue';
import { describe, it, expect, vi, afterEach } from 'vitest';
import Graph from '../src/components/vue-ui-graph.vue';
import { normalizeGraph, tickGraph, graphLinkPath } from '../src/graph/engine';
import { graphDefaults } from '../src/graph/config';
import { palette } from '../src/lib';
import getConfig from '../src/getVueDataUiConfig';
const dataset = () => ({
    nodes: [
        { id: 'a', label: 'Alice', group: 'A', value: 10 },
        { id: 'b', label: 'Bob', group: 'A' },
        { id: 'c', group: 'B' },
    ],
    links: [{ source: 'a', target: 'b' }],
});
const apps = [];
function mount(extra = {}) {
    const el = document.createElement('div');
    document.body.append(el);
    const props = reactive({
        dataset: dataset(),
        config: { animation: { enabled: false }, layout: { iterations: 5 } },
        ...extra,
    });
    let instance;
    const app = createApp({
        render: () => h(Graph, { ...props, ref: (r) => (instance = r) }),
    });
    app.mount(el);
    apps.push(() => {
        app.unmount();
        el.remove();
    });
    return {
        el,
        props,
        get api() {
            return instance;
        },
    };
}
afterEach(() => {
    apps.splice(0).forEach((f) => f());
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});
describe('graph engine', () => {
    it('normalizes deterministically, colors groups, resolves links, and does not mutate data', () => {
        const ds = dataset(),
            before = JSON.stringify(ds),
            a = normalizeGraph(ds, new Map(), graphDefaults),
            b = normalizeGraph(ds, new Map(), graphDefaults);
        expect(a.nodes.map((n) => [n.x, n.y])).toEqual(
            b.nodes.map((n) => [n.x, n.y]),
        );
        expect(a.nodes[0].color).toBe(a.nodes[1].color);
        expect(a.nodes[2].color).not.toBe(a.nodes[0].color);
        tickGraph(a, graphDefaults.layout);
        expect(JSON.stringify(ds)).toBe(before);
        expect(a.nodes.every((n) => Number.isFinite(n.x))).toBe(true);
    });
    it('uses gradients by default and has no preset option', () => {
        const config = getConfig('vue_ui_graph');
        expect(config.style.chart.nodes.gradient).toBe(true);
        expect(config).not.toHaveProperty('preset');
    });
    it('uses the library palette when customPalette is empty and respects explicit node colors', () => {
        const ds = {
            nodes: [
                { id: 'a', group: 0 },
                { id: 'b', group: 1 },
                { id: 'c', color: '#123456' },
            ],
            links: [],
        };
        const defaultGraph = normalizeGraph(ds, new Map(), graphDefaults);
        expect(defaultGraph.nodes.map((n) => n.color)).toEqual([
            palette[0],
            palette[1],
            '#123456',
        ]);
        const custom = normalizeGraph(ds, new Map(), {
            ...graphDefaults,
            customPalette: ['#ff0000', '#00ff00'],
        });
        expect(custom.nodes.map((n) => n.color)).toEqual([
            '#ff0000',
            '#00ff00',
            '#123456',
        ]);
    });
    it('ignores invalid endpoints, supports loops and duplicate edges', () => {
        const ds = dataset();
        ds.links.push(
            { source: 'x', target: 'b' },
            { source: 'a', target: 'a' },
            { source: 'a', target: 'b' },
        );
        const warn = vi.fn(),
            g = normalizeGraph(ds, new Map(), graphDefaults, warn);
        expect(warn).toHaveBeenCalledOnce();
        expect(g.links).toHaveLength(3);
        expect(graphLinkPath(g.links[1])).toContain(' C ');
        expect(graphLinkPath(g.links[0])).not.toBe(graphLinkPath(g.links[2]));
    });
    it('preserves positions and fixed nodes', () => {
        const ds = dataset();
        ds.nodes[0].fixed = true;
        const a = normalizeGraph(ds, new Map(), graphDefaults);
        tickGraph(a, graphDefaults.layout);
        expect(a.nodes[0].x).toBe(0);
        const b = normalizeGraph(ds, a.byId, graphDefaults);
        expect(b.nodes[1].x).toBe(a.nodes[1].x);
    });
    it('registers default configuration', () =>
        expect(getConfig('vue_ui_graph').layout).toEqual(graphDefaults.layout));
});
describe('VueUiGraph', () => {
    it('reveals the initial graph only after settling and fitting, without a second zoom', async () => {
        const frames = new Map();
        let id = 0;
        vi.stubGlobal('requestAnimationFrame', (callback) => {
            frames.set(++id, callback);
            return id;
        });
        vi.stubGlobal('cancelAnimationFrame', (handle) =>
            frames.delete(handle),
        );
        const m = mount({ config: { layout: { iterations: 5 } } });
        await nextTick();
        expect(m.el.querySelector('.vue-ui-graph-network')).toBeNull();
        for (let i = 0; frames.size && i < 20; i++) {
            const [key, callback] = frames.entries().next().value;
            frames.delete(key);
            callback();
            await nextTick();
        }
        const layer = m.el.querySelector('.vue-ui-graph-network');
        expect(layer).not.toBeNull();
        expect(frames.size).toBe(0);
        const fitted = layer.getAttribute('transform');
        await nextTick();
        expect(layer.getAttribute('transform')).toBe(fitted);
        m.api.zoomIn();
        m.api.resetLayout();
        await nextTick();
        expect(m.el.querySelector('.vue-ui-graph-network')).toBe(layer);
    });
    it('settles and refits a replacement network instead of retaining the previous zoom', async () => {
        const frames = new Map();
        let id = 0;
        vi.stubGlobal('requestAnimationFrame', (callback) => {
            frames.set(++id, callback);
            return id;
        });
        vi.stubGlobal('cancelAnimationFrame', (handle) =>
            frames.delete(handle),
        );
        const drain = async () => {
            for (let i = 0; frames.size && i < 40; i++) {
                const [key, callback] = frames.entries().next().value;
                frames.delete(key);
                callback();
                await nextTick();
            }
        };
        const m = mount({
            config: { responsive: false, layout: { iterations: 2 } },
        });
        await drain();
        const before = m.el
            .querySelector('.vue-ui-graph-network')
            .getAttribute('transform');
        m.props.dataset = {
            nodes: [
                { id: 'new-left', x: -10000, y: -8000, fixed: true },
                { id: 'new-right', x: 10000, y: 8000, fixed: true },
            ],
            links: [],
        };
        await nextTick();
        expect(m.el.querySelector('.vue-ui-graph-network')).toBeNull();
        await drain();
        const layer = m.el.querySelector('.vue-ui-graph-network');
        expect(layer).not.toBeNull();
        expect(layer.getAttribute('transform')).not.toBe(before);
        const scale = Number(
            layer.getAttribute('transform').match(/scale\(([^)]+)\)/)[1],
        );
        expect(scale).toBeLessThan(0.04);
        const positions = m.api.getData();
        await nextTick();
        expect(m.api.getData()).toEqual(positions);
        expect(frames.size).toBe(0);
    });
    it('reports the fitted viewport as 100% and restores it on reset', async () => {
        const m = mount({
            dataset: {
                nodes: [
                    { id: 'a', x: -10000, y: -8000, fixed: true },
                    { id: 'b', x: 10000, y: 8000, fixed: true },
                ],
                links: [],
            },
            config: {
                responsive: false,
                animation: { enabled: false },
                layout: { iterations: 0 },
            },
        });
        await nextTick();
        const percent = () =>
            m.el.querySelector('[data-cy-zoom-reset]').textContent.trim();
        const layer = m.el.querySelector('.vue-ui-graph-network');
        const initial = layer.getAttribute('transform');
        expect(percent()).toBe('100%');
        m.api.zoomIn();
        await nextTick();
        expect(percent()).toBe('125%');
        m.api.zoomOut();
        await nextTick();
        expect(percent()).toBe('100%');
        m.api.zoomOut();
        await nextTick();
        expect(percent()).toBe('80%');
        m.api.resetZoom();
        await nextTick();
        expect(percent()).toBe('100%');
        expect(layer.getAttribute('transform')).toBe(initial);
    });
    it('fits the entire initial network even below the configured minimum zoom', async () => {
        const m = mount({
            dataset: {
                nodes: [
                    { id: 'left', x: -10000, y: -8000, fixed: true },
                    { id: 'right', x: 10000, y: 8000, fixed: true },
                ],
                links: [],
            },
            config: {
                responsive: false,
                animation: { enabled: false },
                layout: { iterations: 0 },
            },
        });
        await nextTick();
        const transform = m.el
            .querySelector('.vue-ui-graph-network')
            .getAttribute('transform');
        const [x, y, k] = transform
            .match(/-?\d*\.?\d+(?:e[+-]?\d+)?/gi)
            .map(Number);
        expect(k).toBeLessThan(0.2);
        for (const n of m.api.getData().nodes) {
            expect(x + (n.x - 7) * k).toBeGreaterThanOrEqual(
                graphDefaults.style.chart.padding - 0.01,
            );
            expect(x + (n.x + 7) * k).toBeLessThanOrEqual(
                800 - graphDefaults.style.chart.padding + 0.01,
            );
            expect(y + (n.y - 7) * k).toBeGreaterThanOrEqual(
                graphDefaults.style.chart.padding - 0.01,
            );
            expect(y + (n.y + 7) * k).toBeLessThanOrEqual(
                600 - graphDefaults.style.chart.padding + 0.01,
            );
        }
    });
    it('renders nodes, links, partial config and empty/loading states', async () => {
        const m = mount();
        await nextTick();
        expect(m.el.querySelectorAll('.vue-ui-graph-node')).toHaveLength(3);
        expect(m.el.querySelectorAll('.vue-ui-graph-link')).toHaveLength(1);
        m.props.dataset = { nodes: [], links: [] };
        await nextTick();
        expect(m.el.querySelector('.vue-data-ui-scanner')).not.toBeNull();
        m.props.config.loading = true;
        await nextTick();
        expect(m.el.querySelector('.vue-data-ui-scanner')).not.toBeNull();
    });
    it('supports pointer hover, keyboard selection and Escape', async () => {
        const select = vi.fn(),
            hover = vi.fn(),
            m = mount({ onSelectNode: select, onHoverNode: hover });
        await nextTick();
        const node = m.el.querySelector('.vue-ui-graph-node');
        node.dispatchEvent(new Event('pointerenter'));
        await nextTick();
        expect(hover.mock.calls[0][0].label).toBe('Alice');
        await vi.waitFor(() =>
            expect(
                document.querySelector('[role=tooltip]')?.textContent,
            ).toContain('Connections: 1'),
        );
        node.dispatchEvent(
            new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
        );
        await nextTick();
        expect(select.mock.calls[0][0].id).toBe('a');
        node.dispatchEvent(
            new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
        );
        expect(select).toHaveBeenLastCalledWith(null);
    });
    it('zooms, resets, fits and focuses nodes', () => {
        const zoom = vi.fn(),
            m = mount({ onZoom: zoom });
        m.api.zoomIn();
        expect(zoom).toHaveBeenCalled();
        m.api.resetZoom();
        m.api.fitToView();
        m.api.focusNode('a');
        expect(m.el.querySelector('.vue-ui-graph-svg')).toBeTruthy();
        expect(m.api.getData().nodes).toHaveLength(3);
    });
    it('preserves coordinates after style and reactive label changes', async () => {
        const m = mount(),
            before = m.api.getData().nodes.map((n) => [n.x, n.y]);
        m.props.dataset.nodes[0].label = 'Renamed';
        m.props.config.style = { chart: { nodes: { color: '#FF0000' } } };
        await nextTick();
        expect(m.api.getData().nodes.map((n) => [n.x, n.y])).toEqual(before);
        expect(m.el.textContent).toContain('Renamed');
        m.props.dataset.nodes.push({ id: 'new' });
        await nextTick();
        expect(m.el.querySelectorAll('.vue-ui-graph-node')).toHaveLength(4);
    });
    it('drags nodes and suppresses selection after dragging', async () => {
        const select = vi.fn(),
            m = mount({ onSelectNode: select });
        await nextTick();
        const node = m.el.querySelector('.vue-ui-graph-node'),
            svg = m.el.querySelector('.vue-ui-graph-svg');
        const pointer = (type, x, y) => {
            const e = new Event(type, { bubbles: true });
            Object.assign(e, {
                pointerId: 1,
                clientX: x,
                clientY: y,
                button: 0,
            });
            return e;
        };
        node.dispatchEvent(pointer('pointerdown', 100, 100));
        svg.dispatchEvent(pointer('pointermove', 200, 200));
        svg.dispatchEvent(pointer('pointerup', 200, 200));
        node.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await nextTick();
        expect(select).not.toHaveBeenCalled();
        expect(m.api.getData().nodes[0].x).not.toBe(0);
    });
    it('namespaces SVG definitions across instances', async () => {
        const a = mount(),
            b = mount();
        await nextTick();
        expect(a.el.querySelector('filter').id).not.toBe(
            b.el.querySelector('filter').id,
        );
    });
    it('respects reduced motion and cancels scheduled frames on unmount', () => {
        vi.stubGlobal('matchMedia', () => ({
            matches: true,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
        }));
        const raf = vi.spyOn(window, 'requestAnimationFrame');
        mount({ config: { layout: { iterations: 2 } } });
        expect(raf).not.toHaveBeenCalled();
        apps.splice(0).forEach((f) => f());
        vi.stubGlobal('matchMedia', () => ({ matches: false }));
        const cancel = vi.spyOn(window, 'cancelAnimationFrame');
        mount();
        const m = mount({ config: { layout: { iterations: 10 } } });
        apps.pop()();
        expect(cancel).toHaveBeenCalled();
    });
});

it.each([false, true])(
    'positions labels above/below nodes with ring clearance in batched=%s mode',
    async (batched) => {
        const m = mount({
            dataset: {
                nodes: [
                    {
                        id: 'label',
                        label: 'Label',
                        x: 0,
                        y: 0,
                        radius: 10,
                        fixed: true,
                    },
                ],
                links: [],
            },
            config: {
                responsive: false,
                animation: { enabled: false },
                layout: { iterations: 0 },
                performance: { nodeBatchThreshold: batched ? 0 : 300 },
                style: {
                    chart: {
                        nodes: {
                            gradient: false,
                            selected: { strokeWidth: 24 },
                        },
                    },
                },
            },
        });
        await nextTick();
        const text = () => m.el.querySelector('.vue-ui-graph-labels text');
        expect(text().getAttribute('x')).toBe('0');
        expect(text().getAttribute('text-anchor')).toBe('middle');
        const bottom = Number(text().getAttribute('y'));
        expect(bottom - 11 * 0.6 - 3 / 2).toBeGreaterThanOrEqual(10 + 24 / 2);
        m.api.focusNode('label');
        await nextTick();
        expect(Number(text().getAttribute('y'))).toBe(bottom);
        m.props.config.style.chart.nodes.labels = {
            position: 'top',
            offsetY: 0,
        };
        await nextTick();
        expect(Number(text().getAttribute('y'))).toBe(-bottom);
        m.props.config.style.chart.nodes.labels.offsetY = 7;
        await nextTick();
        expect(Number(text().getAttribute('y'))).toBe(-bottom + 7);
    },
);

it.each([false, true])(
    'renders multiline labels safely with TSpans in batched=%s mode',
    async (batched) => {
        const m = mount({
            dataset: {
                nodes: [
                    {
                        id: 'multi',
                        label: 'First\n<Second>&\nThird',
                        x: 0,
                        y: 0,
                        radius: 10,
                        fixed: true,
                    },
                ],
                links: [],
            },
            config: {
                responsive: false,
                animation: { enabled: false },
                layout: { iterations: 0 },
                performance: { nodeBatchThreshold: batched ? 0 : 300 },
                style: {
                    chart: {
                        nodes: { gradient: false, labels: { strokeWidth: 5 } },
                    },
                },
            },
        });
        await nextTick();
        const spans = () => [
            ...m.el.querySelectorAll('.vue-ui-graph-labels text tspan'),
        ];
        expect(spans().map((s) => s.textContent)).toEqual([
            'First',
            '<Second>&',
            'Third',
        ]);
        expect(
            m.el.querySelector('.vue-ui-graph-labels text second'),
        ).toBeNull();
        const positions = spans().map((s) => Number(s.getAttribute('y')));
        expect(positions[1] - positions[0]).toBe(11);
        expect(positions[2] - positions[1]).toBe(11);
        for (const span of spans()) {
            expect(span.getAttribute('x')).toBe('0');
            expect(span.getAttribute('stroke-width')).toBe('5');
            expect(span.getAttribute('paint-order')).toBe('stroke fill');
        }
        m.props.config.style.chart.nodes.labels.position = 'top';
        await nextTick();
        expect(Number(spans()[2].getAttribute('y'))).toBe(-positions[0]);
    },
);
