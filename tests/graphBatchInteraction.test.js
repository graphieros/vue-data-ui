import { createApp, h, nextTick, reactive } from 'vue';
import { expect, it, afterEach, vi } from 'vitest';
import Graph from '../src/components/vue-ui-graph.vue';
import { graphExamples } from '../src/graph/examples';
const cleanups = [];
afterEach(() => {
    cleanups.splice(0).forEach((fn) => fn());
    vi.unstubAllGlobals();
});
const data = () => ({
    nodes: [
        { id: 'a', label: 'Alice', group: 'A', x: 0, y: 0 },
        { id: 'b', label: 'Bob', group: 'A', x: 100, y: 0 },
        { id: 'c', label: 'Chris', group: 'B', x: 200, y: 0 },
    ],
    links: [
        { source: 'a', target: 'b' },
        { source: 'b', target: 'c' },
    ],
});
function mount(extra = {}, slots) {
    const el = document.createElement('div');
    document.body.append(el);
    const props = reactive({
        dataset: data(),
        config: {
            animation: { enabled: false },
            layout: { iterations: 0 },
            viewport: { initialFit: false },
            performance: { nodeBatchThreshold: 0 },
            style: {
                chart: {
                    width: 800,
                    height: 600,
                    nodes: { gradient: false, labels: { hoverOnly: true } },
                },
            },
        },
        ...extra,
    });
    let api;
    const app = createApp({
        render: () => h(Graph, { ...props, ref: (r) => (api = r) }, slots),
    });
    app.mount(el);
    cleanups.push(() => {
        app.unmount();
        el.remove();
    });
    return {
        el,
        props,
        get api() {
            return api;
        },
    };
}
function pointer(type, x, y, id = 1) {
    const e = new Event(type, { bubbles: true });
    Object.assign(e, { clientX: x, clientY: y, pointerId: id, button: 0 });
    return e;
}
async function inspect(svg, x, y) {
    svg.dispatchEvent(pointer('pointermove', x, y));
    await new Promise((resolve) => requestAnimationFrame(resolve));
    await nextTick();
}
it('keeps the dense example below 50 SVG elements before interaction', async () => {
    const example = graphExamples.find((e) => e.name === 'Dense network');
    const m = mount({
        dataset: example.dataset,
        config: {
            ...example.config,
            animation: { enabled: false },
            layout: { iterations: 0 },
            viewport: { initialFit: false },
        },
    });
    await nextTick();
    expect(m.el.querySelectorAll('.vue-ui-graph-svg *').length).toBeLessThan(
        50,
    );
    expect(m.el.querySelectorAll('.vue-ui-graph-link')).toHaveLength(1);
    expect(m.el.querySelectorAll('.vue-ui-graph-node')).toHaveLength(0);
});
it('preserves hover, neighbor dimming, click selection, and background clearing', async () => {
    const hover = vi.fn(),
        select = vi.fn(),
        m = mount({ onHoverNode: hover, onSelectNode: select });
    await nextTick();
    const svg = m.el.querySelector('.vue-ui-graph-svg');
    await inspect(svg, 400, 300);
    expect(hover).toHaveBeenLastCalledWith(
        expect.objectContaining({ id: 'a' }),
    );
    await vi.waitFor(() =>
        expect(document.querySelector('[role=tooltip]')?.textContent).toContain(
            'Alice',
        ),
    );
    expect(
        m.el.querySelector('.vue-ui-graph-link').getAttribute('opacity'),
    ).toBe('0.06');
    expect(m.el.querySelectorAll('.vue-ui-graph-link-highlight')).toHaveLength(
        1,
    );
    svg.dispatchEvent(
        new MouseEvent('click', { bubbles: true, clientX: 400, clientY: 300 }),
    );
    expect(select).toHaveBeenLastCalledWith(
        expect.objectContaining({ id: 'a' }),
    );
    svg.dispatchEvent(
        new MouseEvent('click', { bubbles: true, clientX: 50, clientY: 50 }),
    );
    expect(select).toHaveBeenLastCalledWith(null);
});
it('ignores edges for hover and selection with a single edge path', async () => {
    const hover = vi.fn(),
        select = vi.fn(),
        m = mount({ onHoverLink: hover, onSelectLink: select });
    await nextTick();
    const svg = m.el.querySelector('.vue-ui-graph-svg');
    await inspect(svg, 450, 300);
    expect(hover).not.toHaveBeenCalled();
    svg.dispatchEvent(
        new MouseEvent('click', { bubbles: true, clientX: 450, clientY: 300 }),
    );
    expect(select).not.toHaveBeenCalled();
    expect(
        m.el
            .querySelector('.vue-ui-graph-links')
            .getAttribute('pointer-events'),
    ).toBe('none');
    expect(m.el.querySelectorAll('.vue-ui-graph-link')).toHaveLength(1);
});
it('drags a spatially picked node and suppresses click selection', async () => {
    const select = vi.fn(),
        m = mount({ onSelectNode: select });
    await nextTick();
    const svg = m.el.querySelector('.vue-ui-graph-svg');
    svg.dispatchEvent(pointer('pointerdown', 400, 300));
    svg.dispatchEvent(pointer('pointermove', 440, 340));
    svg.dispatchEvent(pointer('pointerup', 440, 340));
    svg.dispatchEvent(
        new MouseEvent('click', { bubbles: true, clientX: 440, clientY: 340 }),
    );
    await nextTick();
    expect(m.api.getData().nodes[0]).toMatchObject({ x: 40, y: 40 });
    expect(select).not.toHaveBeenCalled();
});
it('supports keyboard inspection and selection without a focus element per node', async () => {
    const select = vi.fn(),
        m = mount({ onSelectNode: select });
    await nextTick();
    const svg = m.el.querySelector('.vue-ui-graph-svg');
    svg.dispatchEvent(new FocusEvent('focus'));
    await nextTick();
    expect(svg.getAttribute('tabindex')).toBe('0');
    svg.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }),
    );
    await nextTick();
    expect(
        document
            .getElementById(svg.getAttribute('aria-activedescendant'))
            .getAttribute('aria-label'),
    ).toContain('Bob');
    svg.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
    );
    expect(select).toHaveBeenLastCalledWith(
        expect.objectContaining({ id: 'b' }),
    );
    svg.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );
    expect(select).toHaveBeenLastCalledWith(null);
});
it('retains individual rendering for custom node slots', async () => {
    const m = mount(
        {},
        {
            node: ({ radius }) =>
                h('rect', { width: radius * 2, height: radius * 2 }),
        },
    );
    await nextTick();
    expect(m.el.querySelectorAll('.vue-ui-graph-node')).toHaveLength(3);
    expect(m.el.querySelectorAll('.vue-ui-graph-node rect')).toHaveLength(3);
});
it('updates geometry and style while retaining the shared path element', async () => {
    const m = mount();
    await nextTick();
    const path = m.el.querySelector('.vue-ui-graph-link'),
        before = path.getAttribute('d');
    m.props.config.style.chart.links = { color: '#FF0000', width: 3 };
    await nextTick();
    expect(m.el.querySelector('.vue-ui-graph-link')).toBe(path);
    expect(path.getAttribute('stroke')).toBe('#FF0000ff');
    expect(path.getAttribute('stroke-width')).toBe('3');
    m.props.dataset.links.push({ source: 'a', target: 'c' });
    await nextTick();
    expect(path.getAttribute('d')).not.toBe(before);
    expect(path.getAttribute('d').match(/M /g)).toHaveLength(3);
});

it('picks nodes after zoom and updates dragged path geometry', async () => {
    const select = vi.fn(),
        m = mount({ onSelectNode: select });
    await nextTick();
    const svg = m.el.querySelector('.vue-ui-graph-svg');
    const before = m.el.querySelector('.vue-ui-graph-link').getAttribute('d');
    m.api.zoomIn();
    await nextTick();
    svg.dispatchEvent(
        new MouseEvent('click', { bubbles: true, clientX: 525, clientY: 300 }),
    );
    expect(select).toHaveBeenLastCalledWith(
        expect.objectContaining({ id: 'b' }),
    );
    svg.dispatchEvent(pointer('pointerdown', 525, 300));
    svg.dispatchEvent(pointer('pointermove', 550, 350));
    svg.dispatchEvent(pointer('pointerup', 550, 350));
    await nextTick();
    expect(m.api.getData().nodes[1]).toMatchObject({ x: 120, y: 40 });
    expect(m.el.querySelector('.vue-ui-graph-link').getAttribute('d')).not.toBe(
        before,
    );
});

it('caps dense neighborhood labels and preserves selected border priority', async () => {
    const m = mount();
    m.props.config.style.chart.nodes.labels.maxCount = 1;
    await nextTick();
    const svg = m.el.querySelector('.vue-ui-graph-svg');
    await inspect(svg, 400, 300);
    svg.dispatchEvent(
        new MouseEvent('click', { bubbles: true, clientX: 400, clientY: 300 }),
    );
    await nextTick();
    expect(m.el.querySelectorAll('.vue-ui-graph-labels text')).toHaveLength(1);
    const borders = m.el.querySelectorAll('.vue-ui-graph-node-overlay');
    expect(borders).toHaveLength(2);
    expect(borders[0].getAttribute('stroke')).toBe(
        borders[1].getAttribute('stroke'),
    );
});

it('cancels pending pointer inspection on unmount', async () => {
    const m = mount();
    await nextTick();
    const pending = new Map();
    let id = 0;
    vi.stubGlobal('requestAnimationFrame', (fn) => {
        pending.set(++id, fn);
        return id;
    });
    vi.stubGlobal('cancelAnimationFrame', (handle) => pending.delete(handle));
    m.el
        .querySelector('.vue-ui-graph-svg')
        .dispatchEvent(pointer('pointermove', 400, 300));
    expect(pending.size).toBe(1);
    cleanups.pop()();
    expect(pending.size).toBe(0);
});

it('uses the shared DAG controls below the chart and wires zoom, reset, and fit', async () => {
    const zoom = vi.fn(),
        reset = vi.fn(),
        m = mount({ onZoom: zoom, onZoomReset: reset });
    await nextTick();
    const svg = m.el.querySelector('.vue-ui-graph-svg');
    const bar = m.el.querySelector('.vue-data-ui-zoom-controls');
    expect(svg.nextElementSibling).toBe(bar);
    expect(bar.querySelector('[data-cy-zoom-reset]').textContent.trim()).toBe(
        '100%',
    );
    bar.querySelector('[data-cy-zoom-in]').click();
    await nextTick();
    expect(bar.querySelector('[data-cy-zoom-reset]').textContent.trim()).toBe(
        '125%',
    );
    bar.querySelector('[data-cy-zoom-reset]').click();
    expect(reset).toHaveBeenCalledOnce();
    bar.querySelector('[aria-label="Fit graph to viewport"]').click();
    expect(zoom).toHaveBeenCalledTimes(2);
    m.props.config.style.chart.controls = {
        position: 'top',
        color: '#123456',
        fontSize: 18,
    };
    await nextTick();
    const topBar = m.el.querySelector('.vue-data-ui-zoom-controls');
    expect(topBar.nextElementSibling).toBe(svg);
    expect(topBar.querySelector('[data-cy-zoom-reset]').style.fontSize).toBe(
        '18px',
    );
    m.props.config.interaction = { zoom: { enabled: false } };
    await nextTick();
    expect(topBar.querySelector('[data-cy-zoom-in]').disabled).toBe(true);
    expect(topBar.querySelector('[data-cy-zoom-out]').disabled).toBe(true);
    m.props.config.style.chart.controls.show = false;
    await nextTick();
    expect(m.el.querySelector('.vue-data-ui-zoom-controls')).toBeNull();
});

it('keeps node dragging and selection available while the viewport is locked', async () => {
    const select = vi.fn(),
        m = mount({ onSelectNode: select });
    await nextTick();
    const svg = m.el.querySelector('.vue-ui-graph-svg');
    m.api.toggleZoom();
    await nextTick();
    const layer = m.el.querySelector('.vue-ui-graph-nodes').parentElement,
        before = layer.getAttribute('transform');
    svg.dispatchEvent(pointer('pointerdown', 400, 300));
    svg.dispatchEvent(pointer('pointermove', 440, 340));
    svg.dispatchEvent(pointer('pointerup', 440, 340));
    await nextTick();
    expect(m.api.getData().nodes[0]).toMatchObject({ x: 40, y: 40 });
    expect(layer.getAttribute('transform')).toBe(before);
    svg.dispatchEvent(
        new MouseEvent('click', { bubbles: true, clientX: 440, clientY: 340 }),
    );
    svg.dispatchEvent(
        new MouseEvent('click', { bubbles: true, clientX: 440, clientY: 340 }),
    );
    expect(select).toHaveBeenLastCalledWith(
        expect.objectContaining({ id: 'a' }),
    );
});

it('navigates individual SVG nodes by direction and exposes the shared hint slot', async () => {
    const select = vi.fn();
    const m = mount(
        {
            dataset: {
                nodes: [
                    { id: 'a', x: 0, y: 0, fixed: true },
                    { id: 'b', x: 0, y: 100, fixed: true },
                    { id: 'c', x: 100, y: 0, fixed: true },
                ],
                links: [],
            },
            config: {
                responsive: false,
                animation: { enabled: false },
                layout: { iterations: 0 },
                a11y: {
                    translations: { keyboardNavigation: 'Navigate the graph' },
                },
            },
            onSelectNode: select,
        },
        {
            hint: ({ hint, isVisible }) =>
                h(
                    'span',
                    { 'data-hint': '', 'data-visible': String(isVisible) },
                    hint,
                ),
        },
    );
    await nextTick();
    const svg = m.el.querySelector('.vue-ui-graph-svg');
    const hint = m.el.querySelector('[data-hint]');
    expect(hint.textContent).toBe('Navigate the graph');
    expect(hint.dataset.visible).toBe('false');
    expect(
        m.el.querySelectorAll('.vue-ui-graph-node[tabindex="0"]'),
    ).toHaveLength(0);
    svg.dispatchEvent(new FocusEvent('focus'));
    await nextTick();
    expect(hint.dataset.visible).toBe('true');
    const key = async (key) => {
        svg.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
        await nextTick();
    };
    await key('ArrowRight');
    expect(
        document
            .getElementById(svg.getAttribute('aria-activedescendant'))
            .getAttribute('aria-label'),
    ).toContain('c');
    await key('Enter');
    expect(select).toHaveBeenLastCalledWith(
        expect.objectContaining({ id: 'c' }),
    );
    await key('Home');
    await key('ArrowDown');
    expect(
        document
            .getElementById(svg.getAttribute('aria-activedescendant'))
            .getAttribute('aria-label'),
    ).toContain('b');
    await key('Escape');
    expect(svg.hasAttribute('aria-activedescendant')).toBe(false);
    svg.dispatchEvent(new FocusEvent('blur'));
    await nextTick();
    expect(hint.dataset.visible).toBe('false');
});

it('picks nodes through the SVG screen matrix when the viewport is letterboxed', async () => {
    const hover = vi.fn();
    const m = mount({ onHoverNode: hover });
    await nextTick();
    const svg = m.el.querySelector('.vue-ui-graph-svg');
    // The plot is scaled by 0.5, with a horizontal/vertical offset.
    svg.getScreenCTM = () => ({
        inverse: () => ({ a: 2, b: 0, c: 0, d: 2, e: -200, f: -100 }),
    });
    await inspect(svg, 300, 200);
    expect(hover).toHaveBeenLastCalledWith(
        expect.objectContaining({ id: 'a' }),
    );
    await inspect(svg, 350, 200);
    expect(hover).toHaveBeenLastCalledWith(
        expect.objectContaining({ id: 'b' }),
    );
});

it('rebuilds spatial picking after a simulation moves nodes in the same array', async () => {
    const hover = vi.fn();
    const m = mount({ onHoverNode: hover });
    await nextTick();
    const svg = m.el.querySelector('.vue-ui-graph-svg');
    const frames = new Map();
    let id = 0;
    vi.stubGlobal('requestAnimationFrame', (cb) => {
        frames.set(++id, cb);
        return id;
    });
    vi.stubGlobal('cancelAnimationFrame', (key) => frames.delete(key));
    const run = async (key) => {
        const cb = frames.get(key);
        frames.delete(key);
        cb();
        await nextTick();
    };
    m.props.config.animation.enabled = true;
    m.props.config.layout = {
        iterations: 2,
        chargeStrength: -50000,
        centerStrength: 0,
        linkStrength: 0,
    };
    await nextTick();
    await run(frames.keys().next().value);
    const before = m.api.getData().nodes[0];
    svg.dispatchEvent(pointer('pointermove', before.x + 400, before.y + 300));
    await run(id); // Build the index between simulation frames.
    expect(hover).toHaveBeenLastCalledWith(
        expect.objectContaining({ id: 'a' }),
    );
    await run(frames.keys().next().value); // Move the same mutable nodes again.
    const after = m.api.getData().nodes[0];
    expect(Math.floor(after.x / 48)).not.toBe(Math.floor(before.x / 48));
    svg.dispatchEvent(pointer('pointermove', after.x + 400, after.y + 300));
    await run(id);
    expect(hover).toHaveBeenLastCalledWith(
        expect.objectContaining({ id: 'a' }),
    );
    expect(m.el.querySelector('[id$="-active-node"]')).not.toBeNull();
});

it.each([false, true])(
    'chooses the closest node in the arrow direction and wraps spatially (batched=%s)',
    async (batched) => {
        const m = mount({
            dataset: {
                nodes: [
                    { id: 'origin', x: 0, y: 0, fixed: true },
                    { id: 'far-right', x: 1, y: 100, fixed: true },
                    { id: 'near-right', x: 20, y: 5, fixed: true },
                    { id: 'near-left', x: -15, y: 0, fixed: true },
                ],
                links: [],
            },
            config: {
                responsive: false,
                animation: { enabled: false },
                layout: { iterations: 0 },
                performance: { nodeBatchThreshold: batched ? 0 : 300 },
                style: { chart: { nodes: { gradient: false } } },
            },
        });
        await nextTick();
        const svg = m.el.querySelector('.vue-ui-graph-svg');
        svg.dispatchEvent(new FocusEvent('focus'));
        await nextTick();
        const key = async (key) => {
            svg.dispatchEvent(
                new KeyboardEvent('keydown', { key, bubbles: true }),
            );
            await nextTick();
            return document
                .getElementById(svg.getAttribute('aria-activedescendant'))
                .getAttribute('aria-label');
        };
        expect(await key('ArrowRight')).toContain('near-right');
        expect(await key('ArrowRight')).toContain('near-left');
        expect(await key('ArrowLeft')).toContain('near-right');
        expect(await key('ArrowLeft')).toContain('origin');
        expect(await key('ArrowLeft')).toContain('near-left');
        expect(await key('Home')).toContain('origin');
        expect(await key('ArrowUp')).toContain('far-right');
        expect(await key('ArrowDown')).toContain('origin');
        expect(await key('End')).toContain('near-left');
    },
);
