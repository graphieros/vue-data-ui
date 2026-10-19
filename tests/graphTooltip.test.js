import { createApp, h, nextTick, reactive } from 'vue';
import { expect, it, afterEach, beforeAll, vi } from 'vitest';
import Graph from '../src/components/vue-ui-graph.vue';
import { useConfig } from '../src/useConfig';
import themes from '../src/themes/vue_ui_graph.json';
import { setOpacity } from '../src/lib';
beforeAll(async () => {
    await import('../src/atoms/Tooltip.vue');
});
const cleanups = [];
afterEach(() => {
    cleanups.splice(0).forEach((fn) => fn());
    vi.restoreAllMocks();
});
async function flush() {
    for (let i = 0; i < 6; i++) {
        await new Promise((r) => setTimeout(r, 0));
        await nextTick();
    }
}
async function mount(config = {}, slots) {
    const el = document.createElement('div');
    document.body.append(el);
    let api;
    const props = reactive({
        dataset: {
            nodes: [
                { id: 0, label: 'Alice', x: 0, y: 0, fixed: true },
                { id: 1, label: 'Bob', x: 100, y: 0, fixed: true },
            ],
            links: [{ source: 0, target: 1, label: 'Friendship' }],
        },
        config: {
            animation: { enabled: false },
            layout: { iterations: 0 },
            viewport: { initialFit: false },
            userOptions: { show: false },
            ...config,
        },
    });
    const app = createApp({
        render: () => h(Graph, { ...props, ref: (r) => (api = r) }, slots),
    });
    app.mount(el);
    cleanups.push(() => {
        app.unmount();
        el.remove();
    });
    await flush();
    return {
        el,
        props,
        get api() {
            return api;
        },
    };
}
it('configures both gradient stops without replacing the gradient toggle', async () => {
    const m = await mount({
        style: {
            chart: { nodes: { gradient: true, gradientColor: '#336699' } },
        },
    });
    const stops = m.el.querySelectorAll('[id$="-gradient"] stop');
    expect(stops).toHaveLength(2);
    for (const stop of stops)
        expect(stop.getAttribute('stop-color')).toMatch(/^#336699/i);
    m.props.config.style.chart.nodes.gradientColor = '#cc8844';
    await nextTick();
    for (const stop of stops)
        expect(stop.getAttribute('stop-color')).toMatch(/^#cc8844/i);
});
it('calls configured node events once per hover change and on selection with tooltips disabled', async () => {
    const events = {
        datapointEnter: vi.fn(),
        datapointLeave: vi.fn(),
        datapointClick: vi.fn(),
    };
    const m = await mount({ events, tooltip: { show: false } });
    const nodes = m.el.querySelectorAll('.vue-ui-graph-node');
    nodes[0].dispatchEvent(new FocusEvent('focus'));
    nodes[0].dispatchEvent(new FocusEvent('focus'));
    expect(events.datapointEnter).toHaveBeenCalledTimes(1);
    expect(events.datapointEnter).toHaveBeenLastCalledWith({
        datapoint: m.props.dataset.nodes[0],
        seriesIndex: 0,
    });
    nodes[1].dispatchEvent(new FocusEvent('focus'));
    expect(events.datapointLeave).toHaveBeenLastCalledWith({
        datapoint: m.props.dataset.nodes[0],
        seriesIndex: 0,
    });
    expect(events.datapointEnter).toHaveBeenLastCalledWith({
        datapoint: m.props.dataset.nodes[1],
        seriesIndex: 1,
    });
    nodes[1].dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(events.datapointClick).toHaveBeenCalledExactlyOnceWith({
        datapoint: m.props.dataset.nodes[1],
        seriesIndex: 1,
    });
    nodes[1].dispatchEvent(new FocusEvent('blur'));
    expect(events.datapointLeave).toHaveBeenCalledTimes(2);
    expect(events.datapointLeave).toHaveBeenLastCalledWith({
        datapoint: m.props.dataset.nodes[1],
        seriesIndex: 1,
    });
});

it('uses the shared Tooltip with configurable appearance, teleport target, and an accessible description', async () => {
    const target = document.createElement('div');
    target.id = 'graph-tooltip-target';
    document.body.append(target);
    const m = await mount({
        tooltip: {
            teleportTo: '#graph-tooltip-target',
            borderWidth: 3,
            borderRadius: 9,
            fontSize: 16,
            backgroundOpacity: 80,
            backdropFilter: false,
        },
    });
    cleanups.push(() => target.remove());
    const node = m.el.querySelector('.vue-ui-graph-node');
    node.dispatchEvent(new FocusEvent('focus'));
    await flush();
    const tooltip = target.querySelector('[role=tooltip]');
    expect(tooltip).not.toBeNull();
    expect(tooltip.classList.contains('vue-data-ui-tooltip')).toBe(true);
    expect(tooltip.style.borderWidth).toBe('3px');
    expect(tooltip.style.borderRadius).toBe('9px');
    expect(tooltip.style.fontSize).toBe('16px');
    expect(tooltip.textContent).toContain('Alice');
    expect(
        document.getElementById(node.getAttribute('aria-describedby'))
            .textContent,
    ).toContain('Connections: 1');
    node.dispatchEvent(new FocusEvent('blur'));
    await flush();
    expect(target.querySelector('[role=tooltip]')).toBeNull();
});
it('anchors keyboard tooltips to the node in client coordinates', async () => {
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(
        function () {
            const tip = this.getAttribute('role') === 'tooltip';
            return {
                x: 100,
                y: 50,
                left: 100,
                top: 50,
                right: tip ? 220 : 900,
                bottom: tip ? 100 : 650,
                width: tip ? 120 : 800,
                height: tip ? 50 : 600,
            };
        },
    );
    const m = await mount();
    m.el
        .querySelector('.vue-ui-graph-node')
        .dispatchEvent(new FocusEvent('focus'));
    await flush();
    const tooltip = document.querySelector('[role=tooltip]');
    expect(tooltip.style.transform).toBe('translate3d(440px, 374px, 0)');
});
it('keeps tooltips inside the fullscreen chart', async () => {
    const m = await mount();
    m.api.toggleFullscreen(true);
    await flush();
    m.el
        .querySelector('.vue-ui-graph-node')
        .dispatchEvent(new FocusEvent('focus'));
    await flush();
    expect(
        m.el.querySelector('.vue-ui-graph-fullscreen [role=tooltip]'),
    ).not.toBeNull();
});
it('renders formatter output as text and forwards before/after slots', async () => {
    const m = await mount(
        {
            tooltip: {
                customFormat: (scope) => `<img src=x>Node ${scope.node.id}`,
            },
        },
        {
            'tooltip-before': (scope) => h('span', `Before ${scope.node?.id}`),
            'tooltip-after': (scope) => h('span', 'After'),
        },
    );
    m.el
        .querySelector('.vue-ui-graph-node')
        .dispatchEvent(new FocusEvent('focus'));
    await flush();
    const tooltip = document.querySelector('[role=tooltip]');
    expect(tooltip.querySelector('img')).toBeNull();
    expect(tooltip.textContent).toContain('<img src=x>Node 0');
    expect(tooltip.textContent).toContain('Before 0');
    expect(tooltip.textContent).toContain('After');
});

it('omits native node titles when tooltips are enabled and restores them when disabled', async () => {
    const m = await mount();
    const node = m.el.querySelector('.vue-ui-graph-node');
    expect(node.querySelector('title')).toBeNull();
    expect(node.getAttribute('aria-label')).toContain('Alice');
    m.props.config.tooltip = { show: false };
    await nextTick();
    expect(node.querySelector('title').textContent).toBe('Alice');
    m.props.config.tooltip.show = true;
    await nextTick();
    expect(node.querySelector('title')).toBeNull();
});

it('updates tooltip appearance for themes, preserving explicit overrides', async () => {
    const m = await mount();
    const defaults = useConfig().vue_ui_graph.tooltip;
    m.el
        .querySelector('.vue-ui-graph-node')
        .dispatchEvent(new FocusEvent('focus'));
    await flush();
    const normalize = (property, value) => {
        const el = document.createElement('div');
        el.style[property] = value;
        return el.style[property];
    };
    const check = (expected) => {
        const tip = document.querySelector('[role=tooltip]');
        expect(tip).not.toBeNull();
        expect(tip.style.color).toBe(normalize('color', expected.color));
        expect(tip.style.borderColor).toBe(
            normalize('borderColor', expected.borderColor),
        );
        expect(tip.style.background).toBe(
            normalize(
                'background',
                setOpacity(
                    expected.backgroundColor,
                    expected.backgroundOpacity ?? 100,
                ),
            ),
        );
    };
    check(defaults);
    for (const theme of [
        'dark',
        'hack',
        'zen',
        'celebration',
        'celebrationNight',
    ]) {
        m.props.config.theme = theme;
        await flush();
        check({ ...defaults, ...themes[theme].tooltip });
    }
    m.props.config.tooltip = {
        color: '#123456',
        borderColor: '#654321',
        backgroundColor: '#abcdef',
        backgroundOpacity: 100,
    };
    await flush();
    check(m.props.config.tooltip);
    m.props.config.theme = 'dark';
    await flush();
    check(m.props.config.tooltip);
});

it('shows separate explicit-node and group color markers and respects custom formatting', async () => {
    const m = await mount({ customPalette: ['#224466', '#668822'] });
    m.props.dataset.nodes[0].group = 'Team A';
    m.props.dataset.nodes[1].group = 'Team A';
    m.props.dataset.nodes[0].color = '#ff8844';
    await nextTick();
    const nodes = m.el.querySelectorAll('.vue-ui-graph-node');
    nodes[0].dispatchEvent(new FocusEvent('focus'));
    await flush();
    const marker = (kind) =>
        document.querySelector(
            `[data-cy="graph-tooltip-${kind}-marker"] circle`,
        );
    expect(marker('node').getAttribute('fill')).toMatch(/^#ff8844/i);
    expect(marker('group').getAttribute('fill')).toMatch(/^#224466/i);
    expect(document.querySelector('[role=tooltip]').textContent).toContain(
        'Team A',
    );
    nodes[1].dispatchEvent(new FocusEvent('focus'));
    await flush();
    expect(marker('node')).toBeNull();
    expect(marker('group').getAttribute('fill')).toMatch(/^#224466/i);
    m.props.config.tooltip = { customFormat: () => 'Custom content' };
    await flush();
    expect(marker('group')).toBeNull();
    expect(document.querySelector('[role=tooltip]').textContent).toContain(
        'Custom content',
    );
});

it.each([false, true])(
    'hides the tooltip while dragging a node (batched=%s)',
    async (batched) => {
        const m = await mount({
            performance: { nodeBatchThreshold: batched ? 0 : 300 },
            style: { chart: { nodes: { gradient: false } } },
        });
        const svg = m.el.querySelector('.vue-ui-graph-svg');
        const pointer = (target, type, x, y) => {
            const event = new Event(type, { bubbles: true });
            Object.assign(event, {
                pointerId: 1,
                clientX: x,
                clientY: y,
                button: 0,
            });
            target.dispatchEvent(event);
        };
        const node = m.el.querySelector('.vue-ui-graph-node');
        if (batched) {
            svg.dispatchEvent(new FocusEvent('focus'));
        } else node.dispatchEvent(new FocusEvent('focus'));
        await flush();
        expect(document.querySelector('[role=tooltip]')).not.toBeNull();
        pointer(node || svg, 'pointerdown', 400, 300);
        pointer(svg, 'pointermove', 440, 320);
        await flush();
        expect(document.querySelector('[role=tooltip]')).toBeNull();
        pointer(svg, 'pointerup', 440, 320);
        await flush();
        expect(document.querySelector('[role=tooltip]')).not.toBeNull();
    },
);

it.each([false, true])(
    'does not reopen a node tooltip when browser focus returns after dragging (batched=%s)',
    async (batched) => {
        const m = await mount({
            performance: { nodeBatchThreshold: batched ? 0 : 300 },
            style: { chart: { nodes: { gradient: false } } },
        });
        const svg = m.el.querySelector('.vue-ui-graph-svg');
        const node = m.el.querySelector('.vue-ui-graph-node');
        const focusTarget = node || svg;
        focusTarget.dispatchEvent(new FocusEvent('focus'));
        await flush();
        const pointer = (target, type, x, y) => {
            const event = new Event(type, { bubbles: true });
            Object.assign(event, {
                pointerId: 1,
                clientX: x,
                clientY: y,
                button: 0,
            });
            target.dispatchEvent(event);
        };
        pointer(focusTarget, 'pointerdown', 400, 300);
        pointer(svg, 'pointermove', 450, 320);
        pointer(svg, 'pointerup', 450, 320);
        svg.dispatchEvent(new Event('pointerleave'));
        await flush();
        expect(document.querySelector('[role=tooltip]')).toBeNull();
        if (batched) {
            const visibility = vi
                .spyOn(document, 'visibilityState', 'get')
                .mockReturnValue('hidden');
            document.dispatchEvent(new Event('visibilitychange'));
            visibility.mockReturnValue('visible');
            document.dispatchEvent(new Event('visibilitychange'));
        } else window.dispatchEvent(new Event('blur'));
        focusTarget.dispatchEvent(new FocusEvent('blur'));
        window.dispatchEvent(new Event('focus'));
        focusTarget.dispatchEvent(new FocusEvent('focus'));
        await flush();
        expect(document.querySelector('[role=tooltip]')).toBeNull();
        expect(svg.hasAttribute('aria-activedescendant')).toBe(false);
        svg.dispatchEvent(
            new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }),
        );
        await flush();
        expect(document.querySelector('[role=tooltip]')).not.toBeNull();
    },
);
