import { mount, flushPromises } from '@vue/test-utils';
import { h } from 'vue';
import { beforeEach, afterEach, test, expect, vi } from 'vitest';
import Chart from '../src/components/vue-ui-circle-pack.vue';
import * as packing from '../src/packCircles';
vi.mock('../src/packCircles', async (importOriginal) => {
    const actual = await importOriginal();
    return { ...actual, pack: vi.fn(actual.pack) };
});
vi.mock('../src/useResponsive', () => ({
    useResponsive: () => ({ width: 800, height: 500 }),
}));
const dataset = [
    {
        id: 'parent',
        name: 'Parent',
        children: [
            { id: 'a', name: 'A', value: 10 },
            {
                id: 'b',
                name: 'B',
                value: 20,
                children: [{ name: 'Nested', value: 3 }],
            },
        ],
    },
    { id: 'other', name: 'Other', value: 15 },
];
let wrappers, frames, id, observers, now;
beforeEach(() => {
    wrappers = [];
    frames = new Map();
    id = 0;
    now = 0;
    observers = [];
    vi.mocked(packing.pack).mockClear();
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
        { props: { dataset: data, config } },
    );
    wrappers.push(w);
    await flushPromises();
    return [w, w.vm.$.setupState];
}
function finish() {
    for (let i = 0; frames.size && i < 1000; i++) {
        now += 16;
        const callbacks = [...frames.values()];
        frames.clear();
        callbacks.forEach((cb) => cb(now));
    }
    expect(frames.size).toBe(0);
}
test('hierarchy statistics preserve parent value precedence and do not mutate inputs', async () => {
    const before = JSON.stringify(dataset);
    const [, s] = await chart();
    expect(s.getData()[0].value).toBe(30);
    expect(s.getData()[0].children[1].value).toBe(20);
    expect(s.getData()[0].leafCount).toBe(2);
    expect(s.circles).toHaveLength(5);
    expect(JSON.stringify(dataset)).toBe(before);
});
test('palette updates reuse packing, preserve IDs and zoom, and update selection metadata', async () => {
    const [w, s] = await chart();
    const first = s.circles[0];
    s.onTrapEnter(first, 0);
    const calls = vi.mocked(packing.pack).mock.calls.length;
    s.viewBox = {
        ...s.viewBox,
        width: s.viewBox.width / 2,
        height: s.viewBox.height / 2,
    };
    const zoom = { ...s.viewBox };
    await w.setProps({ config: { customPalette: ['#ff0000', '#00ff00'] } });
    await flushPromises();
    expect(vi.mocked(packing.pack)).toHaveBeenCalledTimes(calls);
    expect(s.selectedDatapoint.id).toBe(first.id);
    expect(s.selectedDatapoint.color).not.toBe(first.color);
    expect(s.viewBox).toEqual(zoom);
});
test('selection follows explicit identity after updates and clears on removal', async () => {
    const enter = vi.fn();
    const [w, s] = await chart({ events: { datapointEnter: enter } });
    const index = s.circles.findIndex((c) => c.name === 'A');
    s.onTrapEnter(s.circles[index], index);
    await w.setProps({
        dataset: [
            {
                id: 'parent',
                name: 'Renamed',
                children: [{ id: 'a', name: 'A2', value: 50 }],
            },
        ],
    });
    await flushPromises();
    expect(s.selectedDatapoint.name).toBe('A2');
    expect(s.dataTooltipSlot.datapoint.value).toBe(50);
    expect(enter).toHaveBeenCalledTimes(1);
    await w.setProps({ dataset: [{ id: 'other', name: 'Other', value: 5 }] });
    await flushPromises();
    expect(s.selectedDatapoint).toBe(null);
    expect(s.isTooltip).toBe(false);
});
test('accessibility rows retain parent, depth and formatted value', async () => {
    const [, s] = await chart();
    expect(s.a11yTable.headers).toHaveLength(4);
    expect(s.a11yTable.rows.every((row) => row.length === 4)).toBe(true);
    expect(s.a11yTable.rows[1].slice(0, 3)).toEqual(['  A', 'Parent', 1]);
});
test('CSV uses configured hierarchy headers', async () => {
    const [, s] = await chart({
        table: { columnNames: { parent: 'Ancestor', depth: 'Level' } },
    });
    const csv = await new Promise((resolve) => s.generateCsv(resolve));
    expect(csv).toContain('Ancestor');
    expect(csv).toContain('Level');
});
test('loading styles survive unrelated config changes and recover', async () => {
    const [w, s] = await chart({ loading: true });
    await w.setProps({
        config: {
            loading: true,
            style: { chart: { backgroundColor: '#ff0000' } },
        },
    });
    await flushPromises();
    expect(s.cfgLabels.value.show).toBe(false);
    await w.setProps({ config: { loading: false } });
    await flushPromises();
    expect(s.loading).toBe(false);
    expect(s.getData()[0].name).toBe('Parent');
});
test('responsive frames cancel and SVG dimensions clear on disabling', async () => {
    const [w, s] = await chart({ responsive: true });
    const parent = document.createElement('div'),
        root = document.createElement('div'),
        svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    parent.append(root);
    root.append(svg);
    s.circlePackChart = root;
    s.svgRef = svg;
    s.prepareChart();
    const observer = observers.at(-1);
    finish();
    expect(svg.getAttribute('width')).toBe('800');
    observer.callback();
    const own = s.resizeFrame;
    await w.setProps({ config: { responsive: false } });
    await flushPromises();
    expect(observer.disconnect).toHaveBeenCalled();
    expect(frames.has(own)).toBe(false);
    expect(svg.hasAttribute('width')).toBe(false);
    expect(svg.hasAttribute('height')).toBe(false);
});
test('empty custom skeleton and invalid dimensions stay finite', async () => {
    const [, s] = await chart({
        loading: true,
        skeletonDataset: [],
        style: { chart: { dimensions: { width: 0, height: Infinity } } },
    });
    expect(s.circles).toEqual([]);
    expect(Number.isFinite(s.viewBox.width)).toBe(true);
    expect(s.viewBox.width).toBeGreaterThan(0);
});
test('runtime zoom speed applies without replacing the component', async () => {
    const [w, s] = await chart({
        style: { chart: { zoom: { show: true, speed: 0 } } },
    });
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.createSVGPoint = () => ({ x: 0, y: 0 });
    svg.getScreenCTM = () => null;
    s.svgRef = svg;
    await flushPromises();
    const width = s.viewBox.width;
    svg.dispatchEvent(new MouseEvent('dblclick', { clientX: 0, clientY: 0 }));
    finish();
    expect(s.viewBox.width).toBeCloseTo(width / 1.5);
    s.resetZoom(false);
    await w.setProps({
        config: { style: { chart: { zoom: { show: true, speed: 100 } } } },
    });
    await flushPromises();
    svg.dispatchEvent(new MouseEvent('dblclick', { clientX: 0, clientY: 0 }));
    finish();
    expect(s.viewBox.width).toBeCloseTo(width / 3);
});

test('reused explicit IDs stay unique across ancestors and siblings', async () => {
    const [, s] = await chart(
        { style: { chart: { parentTooltips: { show: true } } } },
        [
            {
                id: 1,
                name: 'Parent',
                children: [
                    { id: 1, name: 'A', value: 1 },
                    { id: 1, name: 'B', value: 2 },
                ],
            },
        ],
    );
    expect(new Set(s.circles.map((circle) => circle.id)).size).toBe(3);
    expect(() => s.parentTooltipItems).not.toThrow();
    for (const circle of s.circles) expect(circle.id).not.toBe(circle.parentId);
});
test('responsive palette changes reuse geometry when dimensions do not change', async () => {
    const [w, s] = await chart({ responsive: true });
    s.circlePackChart = { parentNode: {} };
    s.prepareChart();
    finish();
    await flushPromises();
    const calls = vi.mocked(packing.pack).mock.calls.length;
    await w.setProps({
        config: { responsive: true, customPalette: ['#ff0000', '#00ff00'] },
    });
    await flushPromises();
    finish();
    expect(vi.mocked(packing.pack)).toHaveBeenCalledTimes(calls);
});

test('gradient references, custom label colors, and tooltip snap settings render correctly', async () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const config = {
        style: {
            chart: {
                tooltip: { smoothSnapThreshold: 42 },
                parentTooltips: { show: false },
                circles: {
                    gradient: { show: true },
                    labels: { name: { color: 'auto' } },
                },
            },
        },
    };
    const w = mount(Chart, {
        attachTo: host,
        props: { dataset, config },
        slots: {
            'data-label': (props) =>
                h('text', { 'data-label-color': props.color }, props.name),
        },
    });
    wrappers.push(w);
    try {
        await vi.dynamicImportSettled();
        await flushPromises();
        const s = w.vm.$.setupState;
        expect(w.findAll('radialGradient')).toHaveLength(s.circles.length);
        for (const element of w.findAll('[fill]')) {
            const id = element.attributes('fill')?.match(/^url\(#(.+)\)$/)?.[1];
            if (id)
                expect(
                    document.getElementById(decodeURIComponent(id)),
                ).not.toBe(null);
        }
        expect(
            w.find('[data-label-color]').attributes('data-label-color'),
        ).not.toBe('auto');
        expect(
            w.findComponent({ name: 'Tooltip' }).props('smoothSnapThreshold'),
        ).toBe(42);
    } finally {
        w.unmount();
        host.remove();
    }
});

test('null hierarchy entries remain safely ignored', async () => {
    const [, s] = await chart({}, [
        null,
        { name: 'Parent', children: [null, { name: 'Child', value: 2 }] },
    ]);
    expect(s.getData()).toHaveLength(1);
    expect(s.getData()[0].value).toBe(2);
    expect(s.circles).toHaveLength(2);
});
