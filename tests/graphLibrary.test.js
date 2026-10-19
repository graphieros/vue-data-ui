import { createApp, h, nextTick, reactive } from 'vue';
import { expect, it, afterEach, beforeAll, vi } from 'vitest';
import Graph from '../src/components/vue-ui-graph.vue';
import { graphTableData, graphCsvContent } from '../src/graph/data';
import { normalizeGraph } from '../src/graph/engine';
import { useConfig } from '../src/useConfig';
const image = vi.hoisted(() =>
    vi.fn(async () => ({ imageUri: 'png', base64: 'base64' })),
);
vi.mock('../src/img', () => ({ default: image }));
beforeAll(async () => {
    await Promise.all([
        import('../src/atoms/UserOptions.vue'),
        import('../src/atoms/DataTable.vue'),
        import('../src/components/vue-ui-accordion.vue'),
        import('../src/atoms/BaseDraggableDialog.vue'),
    ]);
});
const cleanups = [];
afterEach(() => {
    cleanups.splice(0).forEach((fn) => fn());
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    image.mockClear();
});
async function flush() {
    for (let i = 0; i < 8; i++) {
        await new Promise((r) => setTimeout(r, 0));
        await nextTick();
    }
}
async function mount(config = {}) {
    const el = document.createElement('div');
    document.body.append(el);
    let api;
    const props = reactive({
        dataset: {
            nodes: [
                {
                    id: 0,
                    label: 'Alice, "A"',
                    group: 0,
                    value: 0,
                    metadata: { note: 'a#b\nc' },
                },
                { id: 'b', label: 'Bob', group: 'B', value: 4 },
            ],
            links: [
                {
                    source: 0,
                    target: 'b',
                    label: 'Knows',
                    value: 2,
                    directed: true,
                },
            ],
        },
        config: {
            animation: { enabled: false },
            layout: { iterations: 0 },
            ...config,
        },
    });
    const app = createApp({
        render: () => h(Graph, { ...props, ref: (r) => (api = r) }),
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
it('uses the standard Title, subtitle, and UserOptions menu', async () => {
    const m = await mount({
        style: {
            chart: {
                title: {
                    text: 'Relationships',
                    subtitle: { text: 'People' },
                    fontSize: 26,
                },
            },
        },
    });
    expect(m.el.querySelector('[data-cy=graph-title]').textContent).toBe(
        'Relationships',
    );
    expect(m.el.querySelector('[data-cy=graph-subtitle]').textContent).toBe(
        'People',
    );
    expect(m.el.querySelector('.vue-ui-user-options')).not.toBeNull();
    m.props.config.userOptions = { show: false };
    await nextTick();
    expect(m.el.querySelector('.vue-ui-user-options')).toBeNull();
    expect(m.el.querySelector('.vue-data-ui-zoom-controls')).not.toBeNull();
});
it('renders node and link DataTables, preserves zero values, updates and closes', async () => {
    const disconnect = vi.fn();
    vi.stubGlobal(
        'ResizeObserver',
        class {
            observe() {}
            disconnect() {
                disconnect();
            }
        },
    );
    const m = await mount({ table: { show: true } });
    const tables = m.el.querySelectorAll('table');
    expect(tables).toHaveLength(2);
    expect(tables[0].textContent).toContain('Alice, "A"');
    expect(tables[0].querySelector('tbody tr').textContent).toContain('0');
    expect(tables[1].textContent).toContain('Knows');
    m.props.dataset.nodes[1].label = 'Robert';
    await flush();
    expect(m.el.querySelector('table').textContent).toContain('Robert');
    m.api.toggleTable();
    await flush();
    expect(m.el.querySelector('table')).toBeNull();
    expect(disconnect).toHaveBeenCalled();
});
it('opens and closes the standard table dialog', async () => {
    const m = await mount({ table: { useDialog: true } });
    m.api.toggleTable();
    await flush();
    const dialog = document.querySelector('[role=dialog]');
    expect(dialog).not.toBeNull();
    expect(dialog.textContent).toContain('Knows');
    m.api.toggleTable();
    await flush();
    expect(m.el.querySelector('table')).toBeNull();
});
it('exports both node and link tables as correctly quoted CSV through a callback', async () => {
    const m = await mount({ style: { chart: { title: { text: 'Graph' } } } }),
        callback = vi.fn();
    const csv = m.api.generateCsv(callback);
    expect(callback).toHaveBeenCalledWith(csv);
    expect(csv).toContain('"Alice, ""A"""');
    expect(csv).toContain('a#b');
    expect(csv).toContain('"Nodes"');
    expect(csv).toContain('"Links"');
    expect(csv).toContain('"0","b","Knows","2","true"');
});
it('uses print configuration for PNG export', async () => {
    const m = await mount({
        userOptions: { print: { scale: 3 } },
        style: { chart: { title: { text: 'My graph' } } },
    });
    await m.api.generateImage();
    expect(image).toHaveBeenCalledWith(
        expect.objectContaining({
            domElement: m.el.firstElementChild,
            fileName: 'My graph',
            format: 'png',
            scale: 3,
        }),
    );
});
it('exports the current SVG through the shared export pipeline and callback', async () => {
    const callback = vi.fn();
    vi.stubGlobal(
        'URL',
        class extends URL {
            static createObjectURL() {
                return 'blob:graph';
            }
            static revokeObjectURL() {}
        },
    );
    const m = await mount({
        userOptions: { callbacks: { svg: callback } },
        style: {
            chart: {
                title: {
                    text: 'SVG title',
                    subtitle: { text: 'SVG subtitle' },
                },
            },
        },
    });
    await m.api.generateSvg({ isCb: true });
    expect(callback).toHaveBeenCalledOnce();
    const result = callback.mock.calls[0][0];
    expect(result.text).toContain('SVG title');
    expect(result.text).toContain('SVG subtitle');
    expect(result.text).toContain('vue-ui-graph-link');
    expect(result.dataUrl).toContain('data:image/svg+xml');
});
it('builds table data from validated entities and includes metadata in CSV', () => {
    const cfg = useConfig().vue_ui_graph;
    const graph = normalizeGraph(
        {
            nodes: [{ id: 0, metadata: { x: 1 } }],
            links: [{ source: 0, target: 'missing' }],
        },
        new Map(),
        cfg,
    );
    const data = graphTableData(graph, cfg.table.columnNames);
    expect(data.nodes.body).toHaveLength(1);
    expect(data.links.body).toHaveLength(0);
    expect(
        graphCsvContent(data, cfg.style.chart.title, cfg.table.columnNames),
    ).toContain('"{""x"":1}"');
});

it('wires PNG and CSV callbacks and table toggling through UserOptions', async () => {
    const csv = vi.fn(),
        png = vi.fn();
    const m = await mount({ userOptions: { callbacks: { csv, img: png } } });
    m.el.querySelector('[data-cy=user-options-xls]').click();
    expect(csv).toHaveBeenCalledWith(expect.stringContaining('data:text/csv'));
    m.el.querySelector('[data-cy=user-options-img]').click();
    await flush();
    expect(png).toHaveBeenCalledWith(
        expect.objectContaining({ imageUri: 'png', base64: 'base64' }),
    );
    m.el.querySelector('[data-cy=user-options-table]').click();
    await flush();
    expect(m.el.querySelectorAll('table')).toHaveLength(2);
});

it('downloads CSV using a blob so literal hash characters are preserved', async () => {
    const create = vi.fn(() => 'blob:csv'),
        revoke = vi.fn(),
        click = vi
            .spyOn(HTMLAnchorElement.prototype, 'click')
            .mockImplementation(() => {});
    vi.stubGlobal(
        'URL',
        class extends URL {
            static createObjectURL(blob) {
                return create(blob);
            }
            static revokeObjectURL(url) {
                revoke(url);
            }
        },
    );
    const m = await mount();
    const content = m.api.generateCsv();
    expect(content).toContain('a#b');
    expect(create).toHaveBeenCalledOnce();
    expect(create.mock.calls[0][0].type).toBe('text/csv;charset=utf-8');
    expect(click).toHaveBeenCalledOnce();
    expect(revoke).toHaveBeenCalledWith('blob:csv');
});

it('locks and unlocks the viewport through the shared UserOptions action', async () => {
    const m = await mount({ userOptions: { buttons: { fullscreen: false } } });
    const button = m.el.querySelector('[data-cy=user-options-fullscreen]');
    expect(button.textContent).toContain('Toggle zoom lock');
    const svg = m.el.querySelector('.vue-ui-graph-svg');
    const layer = m.el.querySelector('.vue-ui-graph-nodes').parentElement;
    const before = layer.getAttribute('transform');
    button.click();
    await nextTick();
    expect(m.el.querySelector('[data-cy-zoom-in]').disabled).toBe(true);
    expect(
        m.el.querySelector('[aria-label="Fit graph to viewport"]').disabled,
    ).toBe(true);
    svg.dispatchEvent(
        new WheelEvent('wheel', {
            deltaY: -100,
            clientX: 400,
            clientY: 300,
            cancelable: true,
        }),
    );
    m.api.zoomIn();
    m.api.resetZoom();
    m.api.fitToView();
    await nextTick();
    expect(layer.getAttribute('transform')).toBe(before);
    const pointer = (type, x, y) => {
        const e = new Event(type, { bubbles: true });
        Object.assign(e, { pointerId: 1, clientX: x, clientY: y, button: 0 });
        return e;
    };
    svg.dispatchEvent(pointer('pointerdown', 50, 50));
    svg.dispatchEvent(pointer('pointermove', 150, 150));
    svg.dispatchEvent(pointer('pointerup', 150, 150));
    await nextTick();
    expect(layer.getAttribute('transform')).toBe(before);
    button.click();
    await nextTick();
    expect(m.el.querySelector('[data-cy-zoom-in]').disabled).toBe(false);
    m.api.zoomOut();
    await nextTick();
    expect(layer.getAttribute('transform')).not.toBe(before);
});

it('toggles the tooltip from UserOptions and restores native node titles while disabled', async () => {
    const m = await mount();
    const button = m.el.querySelector('[data-cy=user-options-tooltip]');
    expect(button).not.toBeNull();
    const node = m.el.querySelector('.vue-ui-graph-node');
    node.dispatchEvent(new FocusEvent('focus'));
    await vi.waitFor(() =>
        expect(document.querySelector('[role=tooltip]')).not.toBeNull(),
    );
    expect(node.querySelector('title')).toBeNull();
    button.click();
    await flush();
    expect(document.querySelector('[role=tooltip]')).toBeNull();
    expect(node.querySelector('title').textContent).toBe('Alice, "A"');
    expect(node.hasAttribute('aria-describedby')).toBe(false);
    button.click();
    await flush();
    expect(document.querySelector('[role=tooltip]')).not.toBeNull();
    expect(node.querySelector('title')).toBeNull();
    m.props.config.userOptions = { buttons: { tooltip: false } };
    await nextTick();
    expect(m.el.querySelector('[data-cy=user-options-tooltip]')).toBeNull();
});

it('honors the standard tooltip callback instead of automatically toggling', async () => {
    const callback = vi.fn();
    const m = await mount({
        userOptions: { callbacks: { tooltip: callback } },
    });
    const node = m.el.querySelector('.vue-ui-graph-node');
    m.el.querySelector('[data-cy=user-options-tooltip]').click();
    await nextTick();
    expect(callback).toHaveBeenCalledOnce();
    expect(node.querySelector('title')).toBeNull();
    m.api.toggleTooltip();
    await nextTick();
    expect(node.querySelector('title')).not.toBeNull();
});

it('connects the alt-copy menu action to its callback and exposed method', async () => {
    const altCopy = vi.fn(async () => {});
    const m = await mount({
        userOptions: { buttons: { altCopy: true }, callbacks: { altCopy } },
    });
    await m.api.copyAlt();
    expect(altCopy).toHaveBeenCalledOnce();
    expect(altCopy.mock.calls[0][0]).toMatchObject({
        dataset: m.props.dataset,
        config: { userOptions: { buttons: { altCopy: true } } },
    });
    m.el
        .querySelector('.vue-ui-graph')
        .dispatchEvent(new MouseEvent('mouseenter'));
    await flush();
    const button = m.el.querySelector('[data-cy=user-options-alt-copy]');
    expect(button).not.toBeNull();
    button.click();
    await flush();
    expect(altCopy).toHaveBeenCalledTimes(2);
});
