import { mount, flushPromises } from '@vue/test-utils';
import { reactive } from 'vue';
import { beforeEach, afterEach, test, expect, vi } from 'vitest';
import Chart from '../src/components/vue-ui-dag.vue';
vi.mock('../src/useResponsive', () => ({
    useResponsive: () => ({ width: 800, height: 500 }),
}));
vi.mock('../src/useChartExport', async () => {
    const { ref } = await import('vue');
    return {
        useChartExport: () => ({
            isCallbackImaging: ref(false),
            isCallbackSvg: ref(false),
            generateSvg: vi.fn(),
            onGenerateImage: vi.fn(),
        }),
    };
});
const dataset = {
    nodes: [
        { id: 'A', label: 'Alpha' },
        { id: 'B', label: 'Beta' },
        { id: 'C', label: 'Gamma' },
    ],
    edges: [
        { from: 'A', to: 'B' },
        { from: 'A', to: 'C' },
    ],
};
let wrappers, frames, observers, id, animations;
beforeEach(() => {
    wrappers = [];
    frames = new Map();
    observers = [];
    animations = [];
    id = 0;
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
    Object.defineProperties(SVGElement.prototype, {
        getTotalLength: { configurable: true, value: () => 100 },
        getPointAtLength: {
            configurable: true,
            value: () => ({ x: 50, y: 20 }),
        },
        getScreenCTM: {
            configurable: true,
            writable: true,
            value: () => ({ a: 2, b: 0, c: 0, d: 3, e: 10, f: 20 }),
        },
        createSVGPoint: {
            configurable: true,
            value: () => ({
                x: 0,
                y: 0,
                matrixTransform(matrix) {
                    return {
                        x: this.x * matrix.a + matrix.e,
                        y: this.y * matrix.d + matrix.f,
                    };
                },
            }),
        },
        animate: {
            configurable: true,
            value: vi.fn(() => {
                const handle = { cancel: vi.fn() };
                animations.push(handle);
                return handle;
            }),
        },
    });
});
afterEach(() => {
    wrappers.forEach((w) => w.unmount());
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});
async function chart(config = {}, data = dataset, dom = false) {
    const w = mount(dom ? Chart : { ...Chart, render: () => null }, {
        props: { dataset: data, config },
        global: {
            stubs: {
                teleport: true,
                PenAndPaper: true,
                UserOptions: true,
                PackageVersion: true,
                Title: true,
                BaseZoomControls: true,
            },
        },
    });
    wrappers.push(w);
    await vi.dynamicImportSettled();
    await flushPromises();
    return [w, w.vm.$.setupState];
}
function frame(time = 1000) {
    const callbacks = [...frames.values()];
    frames.clear();
    callbacks.forEach((cb) => cb(time));
}
test('invalid data recovers after nested updates and retains debug warnings', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const data = reactive({ nodes: [], edges: [] });
    const [, s] = await chart({ debug: true }, data);
    expect(s.loading).toBe(true);
    expect(s.isDataset).toBe(false);
    expect(warn.mock.calls.flat().join(' ')).toContain('nodes');
    data.nodes.push({ id: 'A', label: 'Restored' });
    await flushPromises();
    expect(s.loading).toBe(false);
    expect(s.layoutData.nodes[0].label).toBe('Restored');
    data.edges.push({ from: 'A', to: 'Missing' });
    await flushPromises();
    expect(s.loading).toBe(true);
    data.nodes.push({ id: 'Missing', label: 'Found' });
    await flushPromises();
    expect(s.loading).toBe(false);
});
test('malformed and duplicate IDs use skeletons without layout errors', async () => {
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    for (const data of [
        null,
        {},
        { nodes: [null] },
        { nodes: [{ id: 'A' }, { id: 'A' }], edges: [] },
        { nodes: dataset.nodes, edges: {} },
    ]) {
        const [, s] = await chart({}, data);
        expect(s.loading).toBe(true);
        expect(s.layoutData.nodes).toHaveLength(3);
    }
    expect(errors).not.toHaveBeenCalled();
});
test('presentation updates reuse geometry and stable edge identities', async () => {
    const [w, s] = await chart();
    const geometry = s.geometry,
        edgeId = s.layoutData.edges[0].id;
    await w.setProps({
        dataset: {
            ...dataset,
            nodes: dataset.nodes.map((node) => ({
                ...node,
                label: node.label + '!',
                color: 'red',
            })),
            edges: dataset.edges.map((edge) => ({ ...edge, color: 'blue' })),
        },
    });
    expect(s.geometry).toBe(geometry);
    expect(s.layoutData.edges[0].id).toBe(edgeId);
    expect(s.layoutData.nodes[0].original.color).toBe('#FF0000ff');
    expect(s.layoutData.edges[0].original.color).toBe('blue');
    await w.setProps({
        config: { style: { chart: { nodes: { backgroundColor: '#123456' } } } },
    });
    expect(s.geometry).toBe(geometry);
});
test('real layout changes preserve edge IDs and selected midpoint identity', async () => {
    const [w, s] = await chart({
        style: { chart: { midpoints: { show: true } } },
    });
    const edge = s.layoutData.edges[0];
    s.setActiveA11yItem(s.a11yMidpoints[0]);
    await w.setProps({
        config: {
            style: {
                chart: {
                    midpoints: { show: true },
                    layout: { rankDirection: 'LR' },
                },
            },
        },
    });
    expect(s.layoutData.edges[0].id).toBe(edge.id);
    expect(s.getActiveA11yItem().id).toBe(edge.id);
    expect(s.getActiveA11yItem().raw).toBe(s.layoutData.edges[0]);
});
test('render helpers are pure and share highlight colors', async () => {
    const [, s] = await chart({
        style: {
            chart: {
                nodes: {
                    selected: {
                        downstreamEdges: { stroke: '#ff0000', animated: true },
                    },
                },
            },
        },
    });
    const edge = s.layoutData.edges[0];
    const before = JSON.stringify(edge);
    s.setHoveredNode('A');
    expect(s.setEdge(edge).stroke).toBe(
        s.cfgNodes.selected.downstreamEdges.stroke,
    );
    expect(s.setMidpoint(edge).stroke).toBe(
        s.cfgNodes.selected.downstreamEdges.stroke,
    );
    expect(s.arrowColor(edge)).toBe(s.cfgNodes.selected.downstreamEdges.stroke);
    expect(s.edgeStates.get(edge.id).animated).toBe(true);
    expect(JSON.stringify(edge)).toBe(before);
});
test('numeric node IDs match string edge endpoints and accessible relationships', async () => {
    const [, s] = await chart(
        {},
        {
            nodes: [
                { id: 0, label: 'Zero' },
                { id: 1, label: 'One' },
            ],
            edges: [{ from: '0', to: '1' }],
        },
    );
    expect(s.getNodeById('0').id).toBe(0);
    s.setHoveredNode(0);
    expect(s.edgeStates.get(s.layoutData.edges[0].id).width).toBe(2);
    expect(s.a11yTable.rows).toEqual([
        ['Zero', '—', 'One'],
        ['One', 'Zero', '—'],
    ]);
});
test('unrelated config changes preserve orientation, zoom preference, and camera', async () => {
    const [w, s] = await chart();
    s.switchDirection();
    s.toggleZoom();
    s.panZoomViewBox = { x: 10, y: 20, width: 250, height: 300 };
    await w.setProps({
        config: { style: { chart: { backgroundColor: '#123456' } } },
    });
    expect(s.direction).toBe('RL');
    expect(s.panZoomActive).toBe(false);
    expect(s.panZoomViewBox).toEqual({ x: 10, y: 20, width: 250, height: 300 });
    s.toggleAnnotator();
    s.toggleAnnotator();
    expect(s.panZoomActive).toBe(false);
});
test('configured zoom and direction changes still apply', async () => {
    const [w, s] = await chart();
    await w.setProps({
        config: {
            style: {
                chart: {
                    zoom: { active: false },
                    layout: { rankDirection: 'LR' },
                },
            },
        },
    });
    expect(s.panZoomActive).toBe(false);
    expect(s.direction).toBe('LR');
    s.toggleAnnotator();
    await w.setProps({
        config: { style: { chart: { zoom: { active: true } } } },
    });
    expect(s.panZoomActive).toBe(false);
    s.toggleAnnotator();
    expect(s.panZoomActive).toBe(true);
});
test('tooltips follow current objects, dimensions, and projection without duplicate events', async () => {
    const data = {
        ...dataset,
        nodes: [
            { ...dataset.nodes[0], width: 160, height: 80 },
            ...dataset.nodes.slice(1),
        ],
    };
    const [w, s] = await chart(
        {
            style: {
                chart: {
                    nodes: { tooltip: { showOnClick: true } },
                    midpoints: { show: true },
                },
            },
        },
        data,
        true,
    );
    await s.showNodeTooltip(s.layoutData.nodes[0]);
    expect(s.nodeTooltipOffset).toEqual({ x: 160, y: 120 });
    await w.setProps({
        dataset: {
            ...data,
            nodes: data.nodes.map((node) => ({
                ...node,
                label: node.label + '!',
            })),
        },
    });
    expect(s.nodeTooltipNode.label).toBe('Alpha!');
    expect(w.emitted('onNodeClick')).toHaveLength(1);
    s.svgRef.getScreenCTM = () => ({ a: 1, b: 0, c: 0, d: 1, e: 400, f: 500 });
    window.dispatchEvent(new Event('scroll'));
    expect(s.nodeTooltipPosition.x).toBe(s.nodeTooltipNode.x + 400);
    const edge = s.layoutData.edges[0];
    await s.showMidpointTooltip(edge);
    await w.setProps({ dataset: { ...data, edges: [data.edges[1]] } });
    expect(s.isTooltip).toBe(false);
    expect(s.tooltipEdge).toBe(null);
});
test('animations start once, refresh on settings changes, and cancel on removal', async () => {
    const data = {
        ...dataset,
        edges: [{ ...dataset.edges[0], animated: true }],
    };
    const [w] = await chart({}, data, true);
    expect(animations).toHaveLength(1);
    await w.setProps({
        config: {
            style: {
                chart: { edges: { animations: { animationDurationMs: 2000 } } },
            },
        },
    });
    expect(animations[0].cancel).toHaveBeenCalledTimes(1);
    expect(animations).toHaveLength(2);
    await w.setProps({ dataset: { ...data, edges: [] } });
    expect(animations[1].cancel).toHaveBeenCalled();
});
test('focus reaches its exact target and is canceled by subsequent navigation', async () => {
    vi.spyOn(performance, 'now').mockReturnValue(0);
    const [w, s] = await chart();
    await w.vm.focusOnNode('B', { zoom: 200, duration: 100 });
    frame(100);
    expect(s.scale).toBe(2);
    expect(s.panZoomViewBox.x + s.panZoomViewBox.width / 2).toBe(
        s.getNodeById('B').x,
    );
    await w.vm.focusOnNode('A');
    const stale = [...frames.values()];
    s.resetZoom();
    const reset = { ...s.panZoomViewBox };
    stale.forEach((cb) => cb(1000));
    expect(s.panZoomViewBox).toEqual(reset);
    expect(frames.size).toBe(0);
});
test('unmount cancels focus, responsive frames, hover timers, and edge animations', async () => {
    const [w, s] = await chart(
        { responsive: true },
        { ...dataset, edges: [{ ...dataset.edges[0], animated: true }] },
        true,
    );
    vi.useFakeTimers();
    s.setHoveredNode('A');
    s.scheduleClearHoveredNode('A');
    await w.vm.focusOnNode('B');
    const stale = [...frames.values()];
    w.unmount();
    stale.forEach((cb) => cb(1000));
    vi.runAllTimers();
    expect(frames.size).toBe(0);
    expect(observers[0].disconnect).toHaveBeenCalled();
    expect(animations[0].cancel).toHaveBeenCalled();
});
test('responsive mode restores fixed dimensions and ignores old observer callbacks', async () => {
    const [w, s] = await chart({ responsive: true }, dataset, true);
    frame();
    expect(s.WIDTH).toBe(800);
    expect(s.HEIGHT).toBe(488);
    await w.setProps({
        config: { style: { chart: { width: 500, height: 300 } } },
    });
    observers[0].callback();
    expect(frames.size).toBe(0);
    expect(observers[0].disconnect).toHaveBeenCalled();
    expect(s.WIDTH).toBe(500);
    expect(s.HEIGHT).toBe(300);
});
test('loading skeleton styles and data stay current and recover', async () => {
    const [w, s] = await chart({ loading: true });
    await w.setProps({
        config: {
            loading: true,
            skeletonDataset: {
                nodes: [{ id: 'X', label: 'Placeholder' }],
                edges: [],
            },
            skeletonConfig: {
                style: { chart: { backgroundColor: '#123456' } },
            },
        },
    });
    expect(s.cfgChart.backgroundColor).toBe('#123456');
    expect(s.layoutData.nodes[0].label).toBe('Placeholder');
    await w.setProps({ config: {} });
    expect(s.loading).toBe(false);
    expect(s.layoutData.nodes).toHaveLength(3);
});
test('marker IDs are unique, URL-safe, and point to real definitions', async () => {
    const [w, s] = await chart(
        {},
        {
            nodes: [
                { id: 'a/b', label: 'A' },
                { id: 'a?b', label: 'B' },
                { id: 'C', label: 'C' },
            ],
            edges: [
                { from: 'a/b', to: 'C' },
                { from: 'a?b', to: 'C' },
            ],
        },
        true,
    );
    const ids = w.findAll('marker').map((marker) => marker.attributes('id'));
    expect(new Set(ids).size).toBe(2);
    ids.forEach((id) => expect(id).toMatch(/^[a-zA-Z0-9_-]+$/));
    for (const path of w.findAll('[marker-end]'))
        expect(ids).toContain(path.attributes('marker-end').slice(5, -1));
});

test('keyboard selection refreshes silently after label changes and clears when removed', async () => {
    const [w, s] = await chart(
        { style: { chart: { midpoints: { show: true } } } },
        dataset,
        true,
    );
    const item = s.a11yMidpoints[0];
    s.setActiveA11yItem(item);
    await s.syncA11ySelectionWithInteraction(item);
    expect(w.emitted('onMidpointEnter')).toHaveLength(1);
    await w.setProps({
        dataset: {
            ...dataset,
            nodes: dataset.nodes.map((node) => ({
                ...node,
                label: node.label + '!',
            })),
        },
    });
    expect(s.tooltipEdge.id).toBe(item.id);
    expect(s.getActiveA11yItem().label).toBe('Alpha! → Beta!');
    expect(w.emitted('onMidpointEnter')).toHaveLength(1);
    await w.setProps({ dataset: { ...dataset, edges: [] } });
    expect(s.getActiveA11yItem()).toBe(null);
    expect(s.activeA11yItemId).toBe(null);
    expect(s.isTooltip).toBe(false);
});
test('dash animation distance preserves full patterns and requested direction', async () => {
    const [, s] = await chart();
    const path = { getTotalLength: () => 100 };
    expect(
        s.getIdealDashoffsetDelta(path, { direction: -1, dasharray: '2 6' }),
    ).toBe(-104);
    expect(
        s.getIdealDashoffsetDelta(path, { direction: 1, dasharray: '3' }),
    ).toBe(102);
    expect(
        s.getIdealDashoffsetDelta(path, { direction: -1, dasharray: 'none' }),
    ).toBe(-100);
});
