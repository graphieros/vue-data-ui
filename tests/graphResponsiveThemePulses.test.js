import { createApp, h, nextTick, reactive } from 'vue';
import { afterEach, expect, it, vi } from 'vitest';
import Graph from '../src/components/vue-ui-graph.vue';
import themes from '../src/themes/vue_ui_graph.json';
import { themePalettes } from '../src/lib';

const cleanup = [];
afterEach(() => {
    cleanup.splice(0).forEach((fn) => fn());
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});
async function mount(extra = {}) {
    let resized;
    const observed = [];
    vi.stubGlobal(
        'ResizeObserver',
        class {
            constructor(cb) {
                resized = cb;
            }
            observe(el) {
                observed.push(el);
            }
            disconnect() {}
        },
    );
    const el = document.createElement('div');
    el.style.height = '600px';
    document.body.append(el);
    const config = reactive({
        animation: { enabled: false },
        layout: { iterations: 0 },
        userOptions: { show: false },
        tooltip: { show: false },
        style: {
            chart: { width: 800, height: 600, controls: { show: false } },
        },
        ...extra,
    });
    const app = createApp({
        render: () =>
            h(Graph, {
                config,
                dataset: {
                    nodes: ['a', 'b', 'c'].map((id, i) => ({
                        id,
                        group: id,
                        x: i * 100,
                        y: 100,
                        fixed: true,
                    })),
                    links: [
                        { source: 'a', target: 'b' },
                        { source: 'c', target: 'a' },
                    ],
                },
            }),
    });
    app.mount(el);
    cleanup.push(() => {
        app.unmount();
        el.remove();
    });
    await nextTick();
    return { el, config, observed, resize: () => resized() };
}
it('tracks parent dimensions in both directions and subtracts chart chrome', async () => {
    let width = 700,
        height = 500;
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(
        function () {
            const chrome = this.classList?.contains('vue-ui-graph-title');
            const h = chrome ? 40 : height;
            return {
                width,
                height: h,
                x: 0,
                y: 0,
                top: 0,
                left: 0,
                bottom: h,
                right: width,
            };
        },
    );
    const m = await mount({
        style: {
            chart: {
                width: 800,
                height: 600,
                controls: { show: false },
                title: { text: 'Network' },
            },
        },
    });
    expect(m.observed).toContain(m.el);
    const svg = m.el.querySelector('.vue-ui-graph-svg');
    expect(svg.getAttribute('viewBox')).toBe('0 0 700 460');
    width = 360;
    height = 300;
    m.resize();
    await nextTick();
    expect(svg.getAttribute('viewBox')).toBe('0 0 360 260');
    m.config.responsive = false;
    await nextTick();
    expect(svg.getAttribute('viewBox')).toBe('0 0 800 600');
});
it('updates theme backgrounds, labels and palettes while preserving explicit colors', async () => {
    const m = await mount({ theme: 'dark' });
    for (const theme of ['hack', 'zen', 'concrete', 'celebrationNight']) {
        m.config.theme = theme;
        await nextTick();
        expect(
            m.el
                .querySelector('svg > rect')
                .getAttribute('fill')
                .slice(0, 7)
                .toLowerCase(),
        ).toBe(themes[theme].style.chart.backgroundColor.toLowerCase());
    }
    expect(
        m.el
            .querySelector('.vue-ui-graph-circle')
            .getAttribute('fill')
            .slice(0, 7)
            .toLowerCase(),
    ).toBe(themePalettes.celebrationNight[0].toLowerCase());
    m.config.style.chart.backgroundColor = '#123456';
    await nextTick();
    expect(m.el.querySelector('svg > rect').getAttribute('fill')).toMatch(
        /^#123456/i,
    );
});
it('adds pulses on incoming and outgoing highlighted edges and removes them on leave', async () => {
    const m = await mount({
        style: {
            chart: {
                links: {
                    pulses: {
                        showOnHover: true,
                        color: '#ff8844',
                        colorBySource: false,
                        duration: 900,
                        radius: 4,
                    },
                },
            },
        },
    });
    expect(m.el.querySelectorAll('.vue-ui-graph-pulses > path')).toHaveLength(
        0,
    );
    const node = m.el.querySelector('.vue-ui-graph-node');
    node.dispatchEvent(new FocusEvent('focus'));
    await nextTick();
    const animations = m.el.querySelectorAll('.vue-ui-graph-pulses > path');
    expect(animations).toHaveLength(1);
    expect(animations[0].getAttribute('d').match(/M /g)).toHaveLength(2);
    expect(animations[0].getAttribute('d')).toContain('a 4 4');
    expect(animations[0].getAttribute('fill')).toMatch(/^#ff8844/i);
    m.config.style.chart.links.pulses.colorBySource = true;
    await nextTick();
    const nodes = m.el.querySelectorAll('.vue-ui-graph-circle');
    const pulses = m.el.querySelectorAll('.vue-ui-graph-pulses > path');
    expect(pulses[0].getAttribute('fill')).toBe(nodes[0].getAttribute('fill'));
    expect(pulses[1].getAttribute('fill')).toBe(nodes[2].getAttribute('fill'));
    expect(pulses[0].getAttribute('fill')).not.toBe(
        pulses[1].getAttribute('fill'),
    );
    node.dispatchEvent(new FocusEvent('blur'));
    await nextTick();
    expect(m.el.querySelectorAll('.vue-ui-graph-pulses > path')).toHaveLength(
        0,
    );
});

it('gives hover-only pulses precedence over continuously visible pulses', async () => {
    const m = await mount({
        style: {
            chart: {
                links: {
                    pulses: {
                        show: true,
                        showOnHover: true,
                        colorBySource: false,
                    },
                },
            },
        },
    });
    expect(m.el.querySelectorAll('.vue-ui-graph-pulses > path')).toHaveLength(
        0,
    );
    const node = m.el.querySelectorAll('.vue-ui-graph-node')[1];
    node.dispatchEvent(new FocusEvent('focus'));
    await nextTick();
    expect(m.el.querySelectorAll('.vue-ui-graph-pulses > path')).toHaveLength(
        1,
    );
    m.config.style.chart.links.pulses.show = false;
    await nextTick();
    expect(m.el.querySelectorAll('.vue-ui-graph-pulses > path')).toHaveLength(
        1,
    );
    node.dispatchEvent(new FocusEvent('blur'));
    await nextTick();
    expect(m.el.querySelectorAll('.vue-ui-graph-pulses > path')).toHaveLength(
        0,
    );
    m.config.style.chart.links.pulses.show = true;
    await nextTick();
    expect(m.el.querySelectorAll('.vue-ui-graph-pulses > path')).toHaveLength(
        0,
    );
    m.config.style.chart.links.pulses.showOnHover = false;
    await nextTick();
    expect(m.el.querySelectorAll('.vue-ui-graph-pulses > path')).toHaveLength(
        1,
    );
});

it.each(['show', 'showOnHover'])(
    'suppresses %s pulses when reduced motion is requested',
    async (option) => {
        vi.stubGlobal('matchMedia', () => ({
            matches: true,
            addEventListener() {},
            removeEventListener() {},
        }));
        const m = await mount({
            style: { chart: { links: { pulses: { [option]: true } } } },
        });
        m.el
            .querySelector('.vue-ui-graph-node')
            .dispatchEvent(new FocusEvent('focus'));
        await nextTick();
        expect(
            m.el.querySelectorAll('.vue-ui-graph-pulses > path'),
        ).toHaveLength(0);
    },
);

it('dims unrelated always-visible pulses while a node is highlighted', async () => {
    const m = await mount({
        interaction: { highlight: { enabled: true, dimOpacity: 0.15 } },
        style: {
            chart: {
                links: {
                    pulses: { show: true, opacity: 0.8, colorBySource: false },
                },
            },
        },
    });
    const pulses = () =>
        [...m.el.querySelectorAll('.vue-ui-graph-pulses > path')].map((el) =>
            Number(el.getAttribute('opacity')),
        );
    expect(pulses()).toEqual([0.8]);
    const node = m.el.querySelectorAll('.vue-ui-graph-node')[1];
    node.dispatchEvent(new FocusEvent('focus'));
    await nextTick();
    expect(pulses()[0]).toBeCloseTo(0.8);
    expect(pulses()[1]).toBeCloseTo(0.12);
    node.dispatchEvent(new FocusEvent('blur'));
    await nextTick();
    expect(pulses()).toEqual([0.8]);
});
