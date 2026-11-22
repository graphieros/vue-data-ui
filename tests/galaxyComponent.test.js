import { mount, flushPromises } from '@vue/test-utils';
import { reactive, nextTick } from 'vue';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import Chart from '../src/components/vue-ui-galaxy.vue';
vi.mock('../src/useResponsive', () => ({
    useResponsive: () => ({ width: 800, height: 500 }),
}));
const dataset = [
    { id: 'a', name: 'A', values: [50, 10], color: '#123456' },
    { id: 'b', name: 'B', values: [30] },
    { id: 'c', name: 'C', values: [10] },
];
let wrappers, observers, frames, frameId;
beforeEach(() => {
    wrappers = [];
    observers = [];
    frames = new Map();
    frameId = 0;
    vi.stubGlobal('requestAnimationFrame', (cb) => {
        frames.set(++frameId, cb);
        return frameId;
    });
    vi.stubGlobal('cancelAnimationFrame', (id) => frames.delete(id));
    vi.stubGlobal('matchMedia', () => ({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
    }));
    vi.stubGlobal(
        'ResizeObserver',
        class {
            constructor(callback) {
                this.callback = callback;
                observers.push(this);
            }
            observe = vi.fn();
            disconnect = vi.fn();
        },
    );
});
afterEach(async () => {
    await vi.dynamicImportSettled();
    await flushPromises();
    wrappers.forEach((w) => w.unmount());
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});
async function chart(config = {}, data = dataset, real = false) {
    const w = mount(real ? Chart : { ...Chart, render: () => null }, {
        attachTo: document.body,
        props: { config, dataset: data },
        global: {
            stubs: {
                PenAndPaper: true,
                UserOptions: true,
                PackageVersion: true,
                DataTable: true,
                Tooltip: true,
                Legend: true,
            },
        },
    });
    wrappers.push(w);
    await flushPromises();
    return [w, w.vm.$.setupState];
}
function finishFrames(timestamp) {
    const callbacks = [...frames.values()];
    frames.clear();
    callbacks.forEach((cb) => cb(timestamp));
}
test('hidden series and identities survive palette updates, sorting and duplicate names', async () => {
    const [w, s] = await chart();
    const id = s.immutableSet.find((d) => d.name === 'B').id;
    w.vm.hideSeries('B');
    await flushPromises();
    await w.setProps({ config: { customPalette: ['#ff0000', '#00ff00'] } });
    expect(s.immutableSet.find((d) => d.name === 'B').id).toBe(id);
    expect(s.galaxySet.map((d) => d.name)).not.toContain('B');
    await w.setProps({
        dataset: [dataset[1], { ...dataset[0], values: [5] }, dataset[2]],
    });
    expect(s.immutableSet.find((d) => d.name === 'B').id).toBe(id);
    expect(s.galaxySet.map((d) => d.name)).not.toContain('B');
    await w.setProps({
        dataset: [
            { name: 'same', values: [2] },
            { name: 'same', values: [1] },
        ],
    });
    s.segregate(s.legendSet[1]);
    await flushPromises();
    expect(s.galaxySet).toHaveLength(1);
    expect(s.galaxySet[0].value).toBe(2);
});
test('loading keeps skeleton settings reactive and recovers real data', async () => {
    const [w, s] = await chart({ loading: true });
    expect(s.loading).toBe(true);
    await w.setProps({
        config: {
            loading: true,
            style: { chart: { color: '#ff0000' } },
            skeletonDataset: [{ name: 'custom', values: [7] }],
            skeletonConfig: {
                style: { chart: { backgroundColor: '#abcdef' } },
            },
        },
    });
    expect(s.FINAL_CONFIG.userOptions.show).toBe(false);
    expect(s.cfgChart.backgroundColor).toBe('#abcdefff');
    expect(s.immutableSet[0].name).toBe('custom');
    await w.setProps({ config: { loading: false } });
    expect(s.loading).toBe(false);
    expect(s.getData().map((d) => d.name)).toEqual(['A', 'B', 'C']);
});
test('style and data changes preserve manually toggled table and tooltip settings', async () => {
    const [w, s] = await chart();
    w.vm.toggleTable();
    w.vm.toggleTooltip();
    await flushPromises();
    await w.setProps({
        config: { style: { chart: { color: '#abcdef' } } },
        dataset: dataset.slice(0, 2),
    });
    expect(s.mutableConfig.showTable).toBe(true);
    expect(s.mutableConfig.showTooltip).toBe(false);
});
test('tooltip formatter runs once and active selection refreshes silently', async () => {
    const enter = vi.fn(),
        format = vi.fn(({ datapoint }) => `value=${datapoint.value}`);
    const [w, s] = await chart({
        events: { datapointEnter: enter },
        style: { chart: { tooltip: { customFormat: format } } },
    });
    const selected = s.galaxySet.find((d) => d.name === 'B');
    s.useTooltip({
        datapoint: selected,
        seriesIndex: selected.seriesIndex,
        show: true,
        flatIndex: 1,
    });
    expect(format).toHaveBeenCalledTimes(1);
    expect(enter).toHaveBeenCalledTimes(1);
    await w.setProps({
        dataset: dataset.map((d) =>
            d.id === 'b' ? { ...d, values: [80] } : d,
        ),
    });
    expect(s.selectedSerie).toBe(selected.id);
    expect(s.dataTooltipSlot.datapoint.value).toBe(80);
    expect(s.tooltipContent).toBe('value=80');
    expect(enter).toHaveBeenCalledTimes(1);
    w.vm.hideSeries('B');
    await flushPromises();
    expect(s.selectedSerie).toBe(null);
    expect(s.isTooltip).toBe(false);
});
test('keyboard selection and activation work with tooltips disabled and skip zero series', async () => {
    const click = vi.fn();
    const [w, s] = await chart(
        {
            events: { datapointClick: click },
            style: { chart: { tooltip: { show: false } } },
        },
        [...dataset, { name: 'Zero', values: [0] }],
        true,
    );
    const svg = w.find('svg').element;
    svg.focus();
    await w.find('svg').trigger('keydown', { key: 'ArrowRight' });
    expect(s.activeTooltipIndex).toBe(0);
    expect(s.selectedSerie).not.toBe(null);
    expect(s.isTooltip).toBe(false);
    expect(s.a11ySeries).toHaveLength(3);
    await w.find('svg').trigger('keydown', { key: 'Enter' });
    expect(click).toHaveBeenCalledTimes(1);
    expect(w.emitted('selectDatapoint')[0][0].id).toBe(s.selectedSerie);
    await w.find('svg').trigger('keydown', { key: 'Escape' });
    expect(s.selectedSerie).toBe(null);
});
test('responsive lifecycle restores defaults and rejects stale callbacks', async () => {
    const [w, s] = await chart({ responsive: true }, dataset, true);
    finishFrames();
    await nextTick();
    expect(s.svg).toMatchObject({ width: 800, height: 488 });
    const trap = w.find('[data-cy="tooltip-trap"]');
    expect(Number(trap.attributes('stroke-width'))).toBeCloseTo(
        s.strokeWidths[trap.attributes('data-a11y-serie-id')].border,
    );
    const observer = observers[0];
    observer.callback();
    await w.setProps({ config: { responsive: false } });
    finishFrames();
    expect(observer.disconnect).toHaveBeenCalled();
    expect(s.svg).toMatchObject({ width: 250, height: 180 });
    observer.callback();
    expect(frames.size).toBe(0);
    await w.setProps({ config: { responsive: true } });
    const last = observers.at(-1);
    w.unmount();
    last.callback();
    expect(frames.size).toBe(0);
});
test('zero totals produce finite geometry and text, including all-hidden state', async () => {
    const [, s] = await chart({}, [
        { name: 'A', values: [0] },
        { name: 'B', values: [0] },
    ]);
    expect(
        s.galaxySet.every(
            (d) => Number.isFinite(d.proportion) && Number.isFinite(d.points),
        ),
    ).toBe(true);
    expect(s.legendSet.every((d) => Number.isFinite(d.proportion))).toBe(true);
    s.toggleLegend();
    await flushPromises();
    expect(s.galaxySet).toEqual([]);
});
test('diagnostics react to raw changes and missing attribute additions, silently when disabled', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const data = reactive([{ values: [1] }]);
    const [w, s] = await chart({}, data);
    expect(warn).not.toHaveBeenCalled();
    data[0].name = 'Fixed';
    await nextTick();
    expect(s.getData()[0].name).toBe('Fixed');
    await w.setProps({
        config: { debug: true },
        dataset: [null, { name: 'Bad', values: 'oops' }],
    });
    expect(warn).toHaveBeenCalled();
    expect(s.getData()).toEqual([
        { name: 'Bad', color: expect.any(String), value: 0 },
    ]);
});
test('accessible headings are plain names and CSV uses configured translations', async () => {
    const [w, s] = await chart({
        table: {
            columnNames: {
                series: 'Serie',
                value: 'Valeur',
                percentage: 'Pourcentage',
            },
        },
    });
    expect(s.a11yTable.rows.map((row) => row[0])).toEqual(['C', 'B', 'A']);
    const csv = vi.fn();
    w.vm.generateCsv(csv);
    await flushPromises();
    expect(csv.mock.calls[0][0]).toContain('Pourcentage');
    expect(csv.mock.calls[0][0]).toContain('Valeur');
});

test('streaming identities stay bounded while retained series survive loading', async () => {
    const keep = { id: 'keep', name: 'Keep', values: [5] };
    const [w, s] = await chart({}, [keep]);
    const id = s.seriesIds[0];
    for (let i = 0; i < 30; i++) {
        await w.setProps({
            dataset: [keep, { id: `s${i}`, name: `S${i}`, values: [i + 1] }],
        });
        expect(s.seriesIds[0]).toBe(id);
        expect(s.seriesIdentity.size).toBe(2);
    }
    await w.setProps({ config: { loading: true } });
    void s.seriesIds;
    await w.setProps({ config: { loading: false } });
    expect(s.seriesIds[0]).toBe(id);
});

test('default tooltip treats a series name as text', async () => {
    const name = '<em>Revenue & costs</em>';
    const [w, s] = await chart({}, [{ name, values: [1] }], true);
    await w.get('[data-cy="tooltip-trap"]').trigger('mouseenter');

    const template = document.createElement('template');
    template.innerHTML = s.tooltipContent;
    const heading = template.content.querySelector(
        '[data-cy="galaxy-tooltip-name"]',
    );
    expect(heading.textContent).toBe(name);
    expect(heading.children).toHaveLength(0);
});

test.each([999, 1e20])(
    'pointer targets follow spiral paint order for [%s, 1]',
    async (large) => {
        const [w] = await chart(
            {},
            [
                { name: 'Large', values: [large] },
                { name: 'Small', values: [1] },
            ],
            true,
        );
        const paths = w.findAll('[data-cy="datapoint-path"]');
        const traps = w.findAll('[data-cy="tooltip-trap"]');
        expect(traps[0].attributes('aria-label')).toMatch(/^Small:/);
        expect(traps[1].attributes('aria-label')).toMatch(/^Large:/);
        for (const [i, path] of paths.entries()) {
            expect(path.attributes('d')).toBe(traps[i].attributes('d'));
        }
        const outer = paths[0].attributes('d');
        const inner = paths[1].attributes('d');
        expect(outer).not.toBe(inner);
    },
);

test('re-enabling tooltips restores keyboard selection and skeleton leave is silent', async () => {
    const leave = vi.fn();
    const config = {
        events: { datapointLeave: leave },
        style: { chart: { tooltip: { show: false } } },
    };
    const [w, s] = await chart(config, dataset, true);
    const svg = w.get('[data-cy="galaxy-svg"]');
    svg.element.focus();
    await svg.trigger('keydown', { key: 'ArrowRight' });
    const selected = s.selectedSerie;
    expect(s.isTooltip).toBe(false);
    w.vm.toggleTooltip();
    await nextTick();
    expect(s.isTooltip).toBe(true);
    expect(s.selectedSerie).toBe(selected);
    w.vm.toggleTooltip();
    await nextTick();
    expect(s.isTooltip).toBe(false);

    await w.setProps({ config: { ...config, loading: true } });
    await w.get('[data-cy="tooltip-trap"]').trigger('mouseleave');
    expect(leave).not.toHaveBeenCalled();
});

test('accessible name follows title and subtitle updates', async () => {
    const [w] = await chart({}, dataset, true);
    const svg = w.get('[data-cy="galaxy-svg"]');
    expect(svg.attributes('aria-label')).toBe('Chart visualization');
    await w.setProps({
        config: {
            style: {
                chart: { title: { text: 'Revenue', subtitle: { text: 'Q2' } } },
            },
        },
    });
    expect(svg.attributes('aria-label')).toBe('Revenue. Q2');
});

test('table and CSV use undefined shares for zero totals', async () => {
    const [w, s] = await chart({}, [{ name: 'Zero', values: [0] }]);
    expect(s.dataTable.head[2]).toBe('-');
    expect(s.a11yTable.rows).toEqual([['Zero', '0', '-']]);
    const csv = vi.fn();
    w.vm.generateCsv(csv);
    await nextTick();
    expect(csv.mock.calls[0][0]).toMatch(/Zero[^\n]*0[^\n]*-/);
    w.vm.hideSeries('Zero');
    expect(s.dataTable.head[2]).toBe('-');
    expect(s.a11yTable.rows).toEqual([]);
});

test('legend selection animates remaining paths and keeps hit targets aligned', async () => {
    const [w, s] = await chart(
        { transitions: { pauseOnLoad: false } },
        dataset,
        true,
    );
    const readPath = () =>
        w.findAll('[data-cy="datapoint-path"]').at(-1).attributes('d');
    const start = readPath();
    const legend = w.getComponent({ name: 'Legend' });
    legend.vm.$emit('clickMarker', {
        legend: s.legendSet.find(({ name }) => name === 'B'),
    });
    await nextTick();
    expect(readPath()).toBe(start);
    expect(w.emitted('selectLegend')[0][0].map(({ name }) => name)).toEqual([
        'C',
        'A',
    ]);

    finishFrames(1000);
    finishFrames(1100);
    await nextTick();
    const middle = readPath();
    expect(middle).not.toBe(start);
    const trap = w.findAll('[data-cy="tooltip-trap"]').at(-1);
    expect(trap.attributes('d')).toBe(middle);
    expect(
        w.findAll('[data-cy="datapoint-border"]').at(-1).attributes('d'),
    ).toBe(middle);

    finishFrames(1200);
    await nextTick();
    expect(readPath()).not.toBe(middle);
    expect(readPath()).toBe(s.galaxySet.at(-1).path);
    expect(frames.size).toBe(0);
});

test('disabling transitions settles an interrupted legend animation', async () => {
    const [w, s] = await chart(
        { transitions: { pauseOnLoad: false } },
        dataset,
        true,
    );
    w.vm.hideSeries('B');
    finishFrames(1000);
    finishFrames(1100);
    const staleFrame = [...frames.values()][0];
    await w.setProps({ config: { transitions: { enable: false } } });
    expect(s.animatedEndpoints).toBe(null);
    expect(frames.size).toBe(0);
    staleFrame(1150);
    expect(frames.size).toBe(0);
    w.vm.showSeries('B');
    expect(frames.size).toBe(0);
});

test('useAnimation and animationSpeed control the legend animation', async () => {
    const [w, s] = await chart({
        useAnimation: false,
        animationSpeed: 2,
        transitions: { pauseOnLoad: false },
    });
    finishFrames(900);
    w.vm.hideSeries('B');
    expect(s.animatedEndpoints).toBe(null);
    expect(frames.size).toBe(0);

    await w.setProps({
        config: {
            useAnimation: true,
            animationSpeed: 2,
            transitions: { pauseOnLoad: false },
        },
    });
    w.vm.showSeries('B');
    finishFrames(1000);
    finishFrames(1050);
    expect(s.animatedEndpoints).not.toBe(null);
    finishFrames(1100);
    expect(s.animatedEndpoints).toBe(null);
    expect(frames.size).toBe(0);
});

test('useAnimation still respects reduced-motion preference changes', async () => {
    const media = Object.assign(new EventTarget(), { matches: false });
    vi.stubGlobal('matchMedia', () => media);
    const [w, s] = await chart({
        useAnimation: true,
        animationSpeed: 0.5,
        transitions: { pauseOnLoad: false },
    });
    finishFrames(900);
    w.vm.hideSeries('B');
    expect(frames.size).toBe(1);

    media.matches = true;
    media.dispatchEvent(new Event('change'));
    await nextTick();
    expect(s.animatedEndpoints).toBe(null);
    expect(frames.size).toBe(0);
    w.vm.showSeries('B');
    expect(frames.size).toBe(0);
});

test('renders formatted chart labels and updates them after legend changes', async () => {
    const labelConfig = {
        show: true,
        showName: true,
        hideUnderValue: 15,
        formatter: ({ value }) => `$${value}`,
    };
    const config = {
        useAnimation: false,
        style: {
            chart: {
                backgroundColor: '#223344',
                layout: { labels: { dataLabels: labelConfig } },
            },
        },
    };
    const [w] = await chart(config, dataset, true);
    const labels = () => w.findAll('[data-cy="galaxy-datalabel"]');
    expect(
        labels()
            .map((label) => label.text())
            .sort(),
    ).toEqual(['$30 (30%)B', '$60 (60%)A']);
    expect(
        labels().every((label) =>
            ['x', 'y'].every((key) =>
                Number.isFinite(Number(label.attributes(key))),
            ),
        ),
    ).toBe(true);
    for (const label of labels()) {
        const [border, connector] =
            label.element.parentElement.querySelectorAll('path');
        expect(border.getAttribute('d')).toBe(connector.getAttribute('d'));
        expect(border.getAttribute('stroke')).toMatch(/^#223344(?:ff)?$/i);
        expect(Number(border.getAttribute('stroke-width'))).toBeGreaterThan(
            Number(connector.getAttribute('stroke-width')),
        );
    }
    for (const label of labels()) {
        const callout = label.element.parentElement;
        const marker = callout.querySelector(
            '[data-cy="galaxy-datalabel-marker"]',
        );
        const connector = callout.querySelector('path');
        expect(connector.getAttribute('d')).toMatch(
            new RegExp(
                `^M${marker.getAttribute('cx')} ${marker.getAttribute('cy')} H`,
            ),
        );
        expect(connector.parentElement.getAttribute('mask')).toMatch(
            /^url\(#galaxy-connectors-/,
        );
        expect(marker.hasAttribute('opacity')).toBe(false);
    }
    w.vm.hideSeries('A');
    await nextTick();
    expect(
        labels()
            .map((label) => label.text())
            .sort(),
    ).toEqual(['$10 (25%)C', '$30 (75%)B']);

    w.vm.toggleLabels();
    await nextTick();
    expect(labels()).toHaveLength(0);
    w.vm.toggleLabels();
    await nextTick();
    expect(labels()).toHaveLength(2);

    await w.setProps({ config: { ...config, loading: true } });
    expect(labels()).toHaveLength(0);
});

test('chart labels are visible by default and support visibility and content overrides', async () => {
    const [w] = await chart({}, dataset, true);
    const labels = () => w.findAll('[data-cy="galaxy-datalabel"]');
    expect(labels()).toHaveLength(3);
    await w.setProps({
        config: {
            style: {
                chart: { layout: { labels: { dataLabels: { show: false } } } },
            },
        },
    });
    expect(labels()).toHaveLength(0);
    await w.setProps({
        config: {
            style: {
                chart: {
                    layout: {
                        labels: {
                            dataLabels: {
                                show: true,
                                showName: false,
                                showValue: false,
                                usePercentageParens: false,
                                roundingPercentage: 1,
                            },
                        },
                    },
                },
            },
        },
    });
    expect(
        labels()
            .map((label) => label.text())
            .sort(),
    ).toEqual(['10%', '30%', '60%']);
});

test('hovering a data label highlights its arc like hovering the arc', async () => {
    const [w, s] = await chart(
        {
            style: {
                chart: { layout: { labels: { dataLabels: { show: true } } } },
            },
        },
        dataset,
        true,
    );
    const label = w
        .findAll('[data-cy="galaxy-datalabel"]')
        .find(
            (text) =>
                text.get('[data-cy="galaxy-datalabel-name"]').text() === 'B',
        );
    const target = s.galaxySet.find(({ name }) => name === 'B');
    const trap = w.get(`[data-a11y-serie-id="${target.id}"]`);
    const paths = () => w.findAll('[data-cy="datapoint-path"]');
    const readState = () =>
        paths().map((path) => [
            path.attributes('stroke-width'),
            path.classes().includes('vue-ui-galaxy-blur'),
        ]);
    const rest = readState();
    await label.trigger('mouseenter');
    expect(s.selectedSerie).toBe(target.id);
    expect(s.isTooltip).toBe(false);
    const opacities = () =>
        w
            .findAll('[data-cy="galaxy-datalabel"]')
            .map((text) => text.element.parentElement.getAttribute('opacity'));
    expect(label.element.parentElement.getAttribute('opacity')).toBe('1');
    expect(opacities().sort()).toEqual(['0.5', '0.5', '1']);
    const labelHover = readState();
    expect(labelHover).not.toEqual(rest);
    await label.trigger('mouseleave');
    expect(readState()).toEqual(rest);
    expect(opacities()).toEqual(['1', '1', '1']);
    await trap.trigger('mouseenter');
    expect(readState()).toEqual(labelHover);
    expect(label.element.parentElement.getAttribute('opacity')).toBe('1');
    expect(opacities().sort()).toEqual(['0.5', '0.5', '1']);
    await trap.trigger('mouseleave');
    expect(opacities()).toEqual(['1', '1', '1']);
    await label.trigger('mouseenter');
    w.vm.toggleLabels();
    await nextTick();
    expect(readState()).toEqual(rest);
});

test('Galaxy label colors follow the default, theme, and explicit config', async () => {
    const [w] = await chart(
        { style: { chart: { color: '#000000' } } },
        dataset,
        true,
    );
    const labelColor = () =>
        w.get('[data-cy="galaxy-datalabel"]').attributes('fill');
    expect(labelColor()).toMatch(/^#2d353c(?:ff)?$/i);
    await w.setProps({ config: { theme: 'hack' } });
    expect(labelColor()).toMatch(/^#aaccaa(?:ff)?$/i);
    await w.setProps({
        config: {
            theme: 'hack',
            style: {
                chart: {
                    layout: { labels: { dataLabels: { color: '#123456' } } },
                },
            },
        },
    });
    expect(labelColor()).toMatch(/^#123456(?:ff)?$/i);
});
