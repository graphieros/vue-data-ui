import { mount, flushPromises } from '@vue/test-utils';
import { reactive } from 'vue';
import { beforeEach, afterEach, test, expect, vi } from 'vitest';
import Chart from '../src/components/vue-ui-chord.vue';
const box = vi.hoisted(() => ({
    width: 800,
    height: 500,
    heightTitle: 20,
    heightLegend: 20,
    heightSource: 0,
    heightNoTitle: 0,
}));
vi.mock('../src/useResponsive', () => ({ useResponsive: () => box }));
const dataset = {
    matrix: [
        [10, 20, 0],
        [5, 10, 20],
        [0, 10, 5],
    ],
    labels: ['A', 'B', 'C'],
};
let wrappers, frames, id, observers;
beforeEach(() => {
    wrappers = [];
    frames = new Map();
    id = 0;
    observers = [];
    box.width = 800;
    box.height = 500;
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
        const callbacks = [...frames.values()];
        frames.clear();
        callbacks.forEach((cb) => cb());
    }
    expect(frames.size).toBe(0);
}
test('invalid and deeply edited matrices safely switch to skeletons and recover', async () => {
    const data = reactive({
        matrix: [
            [1, 2],
            [3, 4],
        ],
    });
    const [, s] = await chart({}, data);
    data.matrix[0].pop();
    await flushPromises();
    expect(s.isDataset).toBe(false);
    expect(s.loading).toBe(true);
    expect(() => s.chordData).not.toThrow();
    data.matrix[0].push(2);
    await flushPromises();
    expect(s.loading).toBe(false);
    expect(s.isDataset).toBe(true);
});
test('zero matrices and empty selection labels remain finite', async () => {
    const [, s] = await chart(
        {},
        {
            matrix: [
                [0, 0],
                [0, 0],
            ],
        },
    );
    expect(
        s.chordData.groups.every(
            (g) => Number.isFinite(g.endAngle) && g.proportion === 0,
        ),
    ).toBe(true);
    s.selectGroup(s.chordData.groups[0], 0);
    expect(s.separatedValueLabels).toEqual([]);
    expect(s.visibleRibbons).toEqual([]);
});
test('normalization handles incomplete labels and colors and invalid matrix values', async () => {
    const [, s] = await chart(
        {},
        {
            matrix: [
                [NaN, -2],
                [Infinity, 3],
            ],
            labels: ['A'],
            colors: ['#ff0000'],
        },
    );
    expect(s.formattedDataset.matrix).toEqual([
        [0, 0],
        [0, 3],
    ]);
    expect(s.formattedDataset.labels).toEqual(['A', '1']);
    expect(s.formattedDataset.colors).toHaveLength(2);
    expect(s.formattedDataset.colors.every(Boolean)).toBe(true);
    const csv = await new Promise((resolve) => s.generateCsv(resolve));
    expect(csv).toContain('1');
    expect(s.table.head).toHaveLength(2);
});
test('large padding cannot reverse group angles', async () => {
    const [, s] = await chart({
        style: { chart: { arcs: { padAngle: 100000 } } },
    });
    expect(
        s.chordData.groups.every(
            (g) => g.endAngle >= g.startAngle && Number.isFinite(g.endAngle),
        ),
    ).toBe(true);
});
test('direct subgroup lookup preserves both directed reciprocal ribbons', async () => {
    const [, s] = await chart();
    expect(s.chordData.chords).toHaveLength(9);
    for (const chord of s.chordData.chords) {
        expect(chord.target.index).toBe(chord.source.subIndex);
        expect(chord.target.subIndex).toBe(chord.source.index);
    }
    expect(new Set(s.chordData.chords.map((c) => c.id)).size).toBe(9);
});
test('selection follows fresh geometry through style and data changes', async () => {
    const [w, s] = await chart();
    s.selectGroup(s.chordData.groups[1], 1);
    const id = s.selectedGroup.id;
    await w.setProps({
        config: { style: { chart: { arcs: { innerRadiusRatio: 0.7 } } } },
    });
    await flushPromises();
    expect(s.selectedGroup.id).toBe(id);
    s.selectLegendItem(id);
    await w.setProps({
        dataset: {
            matrix: [
                [1, 2],
                [3, 4],
            ],
            labels: ['A', 'B'],
        },
    });
    await flushPromises();
    expect(s.selectedLegendId).toBe(id);
    await w.setProps({
        dataset: {
            matrix: [
                [1, 2],
                [3, 4],
            ],
            labels: ['A', 'B'],
        },
        config: { loading: true, skeletonDataset: { matrix: [] } },
    });
    await flushPromises();
    expect(s.selectedLegendId).toBe(null);
});
test('keyboard ribbon activation retains identity when the group filter expands', async () => {
    const [w, s] = await chart();
    s.setActiveA11yGroup(1);
    const target = s.a11yTargets.ribbons[0].item.id;
    s.setActiveA11yRibbon(0);
    expect(s.selectedRibbon.id).toBe(target);
    expect(s.a11yTargets.ribbons[s.activeA11yIndex].item.id).toBe(target);
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('tabindex', '0');
    document.body.appendChild(svg);
    s.svgRef = svg;
    svg.focus();
    try {
        s.onSvgKeydown({
            key: 'Enter',
            preventDefault: vi.fn(),
            stopPropagation: vi.fn(),
        });
        expect(w.emitted('selectRibbon').at(-1)[0].id).toBe(target);
    } finally {
        svg.remove();
    }
});
test('legend selection clears the selected ribbon overlay', async () => {
    const [, s] = await chart();
    s.setActiveA11yRibbon(0);
    s.selectLegendItem(s.chordData.groups[1].id);
    expect(s.selectedRibbon).toBe(null);
});
test('unrelated configuration preserves rotation and new initial rotation cancels reset', async () => {
    const [w, s] = await chart();
    s.rotation = 75;
    await w.setProps({
        config: { style: { chart: { backgroundColor: '#000000' } } },
    });
    expect(s.rotation).toBe(75);
    s.resetRotation();
    const own = s.raf,
        stale = frames.get(own);
    await w.setProps({ config: { initialRotation: 30 } });
    await flushPromises();
    stale();
    expect(s.rotation).toBe(30);
    expect(frames.has(own)).toBe(false);
});
test('starting a drag cancels reset animation', async () => {
    const [, s] = await chart({ enableRotation: true });
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.svgRef = svg;
    s.rotation = 90;
    s.resetRotation();
    const own = s.raf;
    s.onDown({ clientX: 10, clientY: 20, preventDefault: vi.fn() });
    expect(frames.has(own)).toBe(false);
    expect(s.dragging).toBe(true);
    s.onUp();
    expect(s.dragging).toBe(false);
});
test('responsive branches clear stale inline heights and disconnect on disable', async () => {
    const [w, s] = await chart({ responsive: true });
    const parent = document.createElement('div'),
        root = document.createElement('div'),
        svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    parent.appendChild(root);
    root.appendChild(svg);
    s.chordChart = root;
    s.svgRef = svg;
    s.prepareChart();
    const observer = observers.at(-1);
    finish();
    expect(root.style.height).toBe('100%');
    box.width = 300;
    box.height = 800;
    observer.callback();
    finish();
    expect(svg.style.height).toBe('');
    expect(root.style.height).toBe('');
    await w.setProps({ config: { responsive: false } });
    await flushPromises();
    expect(observer.disconnect).toHaveBeenCalled();
});

test('reset animation finishes exactly and stale callbacks cannot run after unmount', async () => {
    const [w, s] = await chart({ initialRotation: 15 });
    s.rotation = 100;
    s.resetRotation();
    finish();
    expect(s.rotation).toBe(15);
    s.rotation = 70;
    s.resetRotation();
    const own = s.raf,
        stale = frames.get(own);
    w.unmount();
    const previous = s.rotation;
    stale();
    expect(frames.has(own)).toBe(false);
    expect(s.rotation).toBe(previous);
});
test('ribbon event payloads preserve pointer and keyboard fields', async () => {
    const [, s] = await chart();
    const ribbon = s.ribbonModels[0];
    expect(s.getRibbonPayload(ribbon)).not.toHaveProperty('path');
    expect(s.getRibbonPayload(ribbon, true).path).toBe(ribbon.path);
    const paths = s.groupPaths;
    s.selectGroup(s.chordData.groups[0], 0);
    expect(s.groupPaths).toBe(paths);
});

test('pointer ribbon indices retain positions of skipped zero-valued ribbons', async () => {
    const [, s] = await chart(
        {},
        {
            matrix: [
                [0, 0, 1],
                [10, 0, 0],
                [0, 5, 0],
            ],
            labels: ['A', 'B', 'C'],
        },
    );
    for (const ribbon of s.visibleRibbons)
        expect(ribbon.renderIndex).toBe(
            s.chordData.chords.findIndex((chord) => chord.id === ribbon.id),
        );
    expect(s.visibleRibbons[0].renderIndex).toBeGreaterThan(0);
    expect(s.a11yTargets.ribbons[0].item).not.toHaveProperty('renderIndex');
});
