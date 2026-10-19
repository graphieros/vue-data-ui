import { createApp, h, nextTick, reactive } from 'vue';
import { afterEach, expect, it, vi } from 'vitest';
import Graph from '../src/components/vue-ui-graph.vue';
import { graphSkeletonDataset } from '../src/graph/loading';

const cleanup = [];
afterEach(() => {
    cleanup.splice(0).forEach(fn => fn());
    vi.unstubAllGlobals();
});
async function mount(config = {}, dataset = { nodes: [], links: [] }, slots) {
    const props = reactive({
        config: { animation: { enabled: false }, layout: { iterations: 0 }, ...config },
        dataset,
    });
    const el = document.createElement('div');
    document.body.append(el);
    let api;
    const app = createApp({ render: () => h(Graph, { ...props, ref: instance => { api = instance; } }, slots) });
    app.mount(el);
    cleanup.push(() => { app.unmount(); el.remove(); });
    await nextTick();
    return { el, props, get api() { return api; } };
}

it('shows a noninteractive skeleton for empty data and restores real data and config', async () => {
    const m = await mount({ style: { chart: { nodes: { colorByGroup: false, color: '#123456' } } } });
    expect(m.api.getData().nodes.map(n => n.id)).toEqual(graphSkeletonDataset.nodes.map(n => n.id));
    expect(m.el.querySelector('.vue-data-ui-scanner')).not.toBeNull();
    expect(m.el.querySelector('svg[aria-busy="true"]')).not.toBeNull();
    expect(m.el.textContent).not.toMatch(/No graph data|Loading graph/);
    expect(m.el.querySelector('.vue-ui-graph-circle').getAttribute('fill')).toMatch(/^#BABABA/i);
    m.el.querySelector('.vue-ui-graph-node').dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(m.el.querySelector('[aria-selected="true"]')).toBeNull();
    m.props.dataset = { nodes: [{ id: 'real', x: 0, y: 0, fixed: true }], links: [] };
    await nextTick();
    expect(m.api.getData().nodes.map(n => n.id)).toEqual(['real']);
    expect(m.el.querySelector('.vue-data-ui-scanner')).toBeNull();
    expect(m.el.querySelector('.vue-ui-graph-circle').getAttribute('fill')).toMatch(/^#123456/i);
    m.props.dataset = { nodes: [], links: [] };
    await nextTick();
    expect(m.el.querySelector('.vue-data-ui-scanner')).not.toBeNull();
});

it('supports explicit loading, skeleton overrides, and the skeleton slot', async () => {
    const m = await mount({
        loading: true,
        skeletonDataset: { nodes: [{ id: 'placeholder', x: 0, y: 0, fixed: true }], links: [] },
        skeletonConfig: { style: { chart: { nodes: { color: '#654321' } } } },
    }, { nodes: [{ id: 'real', x: 0, y: 0, fixed: true }], links: [] }, {
        skeleton: () => h('div', { class: 'custom-skeleton' }),
    });
    expect(m.api.getData().nodes[0].id).toBe('placeholder');
    expect(m.el.querySelector('.vue-ui-graph-circle').getAttribute('fill')).toMatch(/^#654321/i);
    expect(m.el.querySelector('.custom-skeleton')).not.toBeNull();
    m.props.config.loading = false;
    await nextTick();
    expect(m.api.getData().nodes[0].id).toBe('real');
});

it('settles and fits after loading before revealing nodes, even with shared skeleton IDs', async () => {
    const frames = new Map();
    let id = 0;
    vi.stubGlobal('requestAnimationFrame', fn => { frames.set(++id, fn); return id; });
    vi.stubGlobal('cancelAnimationFrame', key => frames.delete(key));
    const m = await mount({
        loading: true,
        animation: { enabled: true },
        layout: { iterations: 60 },
        skeletonDataset: {
            nodes: [{ id: 'a', x: -900, y: 0, fixed: true }, { id: 'b', x: 900, y: 0, fixed: true }],
            links: [{ source: 'a', target: 'b' }],
        },
    }, {
        nodes: [{ id: 'a', x: -400, y: 0 }, { id: 'b', x: 400, y: 0 }],
        links: [{ source: 'a', target: 'b' }],
    });
    m.props.config.loading = false;
    await nextTick();
    expect(m.el.querySelector('.vue-ui-graph-nodes')).toBeNull();
    for (let step = 0; frames.size && step < 100; step++) {
        const pending = [...frames];
        frames.clear();
        for (const [, fn] of pending) fn(step * 16);
        await nextTick();
    }
    expect(frames.size).toBe(0);
    expect(m.el.querySelectorAll('.vue-ui-graph-node')).toHaveLength(2);
    expect(m.el.querySelector('.vue-ui-graph-svg').getAttribute('aria-busy')).toBe('false');
    const nodes = m.api.getData().nodes;
    expect(Math.abs(nodes[0].x)).toBeLessThan(400);
    const transform = m.el.querySelector('.vue-ui-graph-nodes').parentElement.getAttribute('transform');
    const [x, y, scale] = transform.match(/-?\d*\.?\d+(?:e[+-]?\d+)?/gi).map(Number);
    for (const node of nodes) {
        expect(x + node.x * scale).toBeGreaterThan(0);
        expect(x + node.x * scale).toBeLessThan(600);
        expect(y + node.y * scale).toBeGreaterThan(0);
        expect(y + node.y * scale).toBeLessThan(600);
    }
});
