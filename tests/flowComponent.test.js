import { mount, flushPromises } from '@vue/test-utils';
import { beforeEach, afterEach, test, expect, vi } from 'vitest';
import Chart from '../src/components/vue-ui-flow.vue';
vi.mock('../src/useResponsive', () => ({
    useResponsive: () => ({ width: 800, height: 500 }),
}));
const dataset = [
    ['A', 'B', 10],
    ['A', 'C', 20],
    ['B', 'D', 10],
    ['C', 'D', 20],
];
let wrappers, frames, id, observers;
beforeEach(() => {
    wrappers = [];
    frames = new Map();
    id = 0;
    observers = [];
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
async function chart(config = {}, data = dataset) {
    const w = mount(
        { ...Chart, render: () => null },
        { props: { config, dataset: data } },
    );
    wrappers.push(w);
    await flushPromises();
    return [w, w.vm.$.setupState];
}
function finish() {
    for (let i = 0; frames.size && i < 100; i++) {
        const callbacks = [...frames.values()];
        frames.clear();
        callbacks.forEach((cb) => cb());
    }
    expect(frames.size).toBe(0);
}
test('DAG levels do not depend on edge order and nodes appear once', async () => {
    const edges = [
        ['B', 'C', 10],
        ['A', 'B', 10],
        ['A', 'C', 5],
    ];
    const [, s] = await chart({}, edges);
    const [, other] = await chart({}, [...edges].reverse());
    const levels = (x) =>
        Object.fromEntries(
            [...x.graph.nodes].map(([name, node]) => [name, node.level]),
        );
    expect(levels(s)).toEqual(levels(other));
    expect(levels(s)).toEqual({ A: 0, B: 1, C: 2 });
    expect(s.mutableDataset.nodes).toHaveLength(3);
});
test('prototype-like names render without collisions', async () => {
    const [, s] = await chart({}, [
        ['__proto__', 'constructor', 10],
        ['constructor', 'toString', 10],
    ]);
    expect(s.mutableDataset.nodes.map((n) => n.name)).toEqual([
        '__proto__',
        'constructor',
        'toString',
    ]);
    expect(s.legendSet[0].name).toBe('__uncategorized__');
    expect(s.mutableDataset.links).toHaveLength(2);
});
test('cycles and self loops have finite coordinates and paths', async () => {
    const [, s] = await chart({}, [
        ['A', 'B', 2],
        ['B', 'A', 1],
        ['A', 'A', 1],
    ]);
    expect(
        s.mutableDataset.nodes.every((n) =>
            [n.x, n.y, n.height].every(Number.isFinite),
        ),
    ).toBe(true);
    expect(
        s.mutableDataset.links.every((l) => !l.path.match(/NaN|Infinity/)),
    ).toBe(true);
});
test('normalization is shared by geometry and tooltip summaries', async () => {
    const [, s] = await chart({}, [
        ['A', 'B', NaN],
        ['A', 'C', -10],
        ['C', 'D', 5],
    ]);
    expect(s.mutableDataset.links.map((l) => l.value)).toEqual([0, 0, 5]);
    expect(s.nodeSummaries.get('A').outflow).toBe(0);
});
test('explicit colors retain precedence over category and palette colors', async () => {
    const [, s] = await chart(
        {
            nodeCategories: { A: 'Group', B: 'Group' },
            nodeCategoryColors: { Group: '#ff0000' },
        },
        [['A', 'B', 10, '#00ff00']],
    );
    expect(
        s.mutableDataset.nodes.every(
            (n) => n.color.toLowerCase() === '#00ff00ff',
        ),
    ).toBe(true);
});
test('resize preserves graph identity, node IDs, and selection without another enter event', async () => {
    const enter = vi.fn();
    const [, s] = await chart({ events: { datapointEnter: enter } });
    const graph = s.graph,
        node = s.mutableDataset.nodes[1];
    s.selectNode(node, 1);
    s.WIDTH = 900;
    await flushPromises();
    expect(s.graph).toBe(graph);
    expect(s.mutableDataset.nodes[1].id).toBe(node.id);
    expect(s.selectedNodeId).toBe(node.id);
    expect(enter).toHaveBeenCalledTimes(1);
    expect(s.dataTooltipSlot.datapoint.name).toBe(node.name);
});
test('data updates refresh selection and removal clears it', async () => {
    const [w, s] = await chart();
    s.selectNode(s.mutableDataset.nodes[0], 0);
    await w.setProps({ dataset: [['A', 'B', 99]] });
    await flushPromises();
    expect(s.dataTooltipSlot.datapoint.outflow).toBe(99);
    await w.setProps({ dataset: [['X', 'Y', 1]] });
    await flushPromises();
    expect(s.selectedNodeId).toBe(null);
    expect(s.isTooltip).toBe(false);
});
test('category drilling uses names even after uncategorized entries and reordering', async () => {
    const [w, s] = await chart({ nodeCategories: { B: 'Group', C: 'Other' } });
    const legend = s.legendSetFiltered.find((l) => l.name === 'Group');
    s.drillCategory({ legend, i: 0 });
    expect(s.selectedCategory).toBe('Group');
    expect(s.selectedNodes).toEqual(['B']);
    expect(s.legendSetFiltered.find((l) => l.name === 'Group').opacity).toBe(1);
    await w.setProps({ dataset: [...dataset].reverse() });
    await flushPromises();
    expect(s.selectedNodes).toEqual(['B']);
    s.drillCategory({ legend, i: 1 });
    expect(s.selectedCategory).toBe(null);
});
test('loading recovers and fixed dimensions update at runtime', async () => {
    const [w, s] = await chart({ loading: true });
    await w.setProps({
        config: {
            loading: false,
            style: { chart: { width: 900, height: 600 } },
        },
    });
    await flushPromises();
    expect(s.loading).toBe(false);
    expect(s.drawingArea).toEqual({ width: 900, height: 600 });
});
test('responsive observers disconnect and pending resize frames cancel', async () => {
    const [w, s] = await chart({ responsive: true });
    s.flowChart = { parentNode: {} };
    s.prepareChart();
    const observer = observers.at(-1),
        own = s.resizeFrame;
    await w.setProps({ config: { responsive: false } });
    await flushPromises();
    expect(observer.disconnect).toHaveBeenCalled();
    expect(frames.has(own)).toBe(false);
    expect(s.WIDTH).toBe(s.cfgChart.width);
    s.flowChart = { parentNode: {} };
    await w.setProps({ config: { responsive: true } });
    await flushPromises();
    const next = s.resizeFrame;
    w.unmount();
    expect(frames.has(next)).toBe(false);
});
test('accessibility table contains plain source and target names', async () => {
    const [, s] = await chart();
    expect(s.a11yTable.rows[0].slice(0, 2)).toEqual(['A', 'B']);
});

test('keyboard selection remains navigable after resizing', async () => {
    const [w, s] = await chart();
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('tabindex', '0');
    document.body.appendChild(svg);
    s.svgRef = svg;
    svg.focus();
    try {
        const key = (key) =>
            s.onSvgKeydown({
                key,
                preventDefault: vi.fn(),
                stopPropagation: vi.fn(),
            });
        key('ArrowRight');
        const first = s.selectedNodeId;
        s.WIDTH = 900;
        await flushPromises();
        expect(s.selectedNodeId).toBe(first);
        key('ArrowRight');
        expect(s.selectedNodeId).not.toBe(first);
        key('Enter');
        expect(s.dataTooltipSlot.datapoint.name).toBeTruthy();
    } finally {
        svg.remove();
    }
});
test('parallel edges keep unique stable link IDs', async () => {
    const [, s] = await chart({}, [
        ['A', 'B', 10],
        ['A', 'B', 20],
    ]);
    const ids = s.mutableDataset.links.map((link) => link.id);
    expect(new Set(ids).size).toBe(2);
    s.WIDTH = 700;
    expect(s.mutableDataset.links.map((link) => link.id)).toEqual(ids);
});

test('gradient IDs contain no URL escapes for special node names', async () => {
    const [, s] = await chart({}, [
        ['A & B', 'Target / value', 10],
        ['Target / value', 'Énd', 10],
    ]);
    for (const link of s.mutableDataset.links)
        expect(link.id).toMatch(/^[a-zA-Z0-9_-]+$/);
});
