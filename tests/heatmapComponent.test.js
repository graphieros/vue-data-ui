import { mount, flushPromises } from '@vue/test-utils';
import { nextTick } from 'vue';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import VueUiHeatmap from '../src/components/vue-ui-heatmap.vue';
import * as chartLib from '../src/lib';
const dataset = [
    { name: 'A', values: [1, 2, 3] },
    { name: 'B', values: [4, 5] },
];
let observer;
beforeEach(() => {
    vi.stubGlobal(
        'ResizeObserver',
        class {
            constructor(callback) {
                this.callback = callback;
                observer = this;
            }
            observe = vi.fn();
            disconnect = vi.fn();
        },
    );
    vi.stubGlobal(
        'requestAnimationFrame',
        vi.fn(() => 123),
    );
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
});
afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});
const mountChart = (props = {}) =>
    mount(
        { ...VueUiHeatmap, render: () => null },
        { props: { dataset, ...props } },
    );

test('cell identity survives labels and color scale changes', async () => {
    const w = mountChart();
    try {
        await flushPromises();
        const s = w.vm.$.setupState;
        const ids = s.cells.map((c) => c.datapoint.id);
        const cell = s.cells[1];
        s.useTooltip(
            cell.datapoint,
            cell.rowIndex,
            cell.selectionX,
            cell.selectionY,
        );
        await w.setProps({
            config: {
                style: {
                    layout: {
                        cells: { scaleMin: 0, scaleMax: 10 },
                        dataLabels: {
                            xAxis: { values: ['One', 'Two', 'Three'] },
                        },
                    },
                },
            },
        });
        await flushPromises();
        expect(s.cells.map((c) => c.datapoint.id)).toEqual(ids);
        expect(s.hoveredCell).toBe(ids[1]);
        expect(s.dataTooltipSlot.datapoint.xAxisName).toBe('Two');
        await w.setProps({ dataset: [{ name: 'A', values: [1] }] });
        await flushPromises();
        expect(s.hoveredCell).toBeUndefined();
        expect(s.selectedClone).toBeNull();
    } finally {
        w.unmount();
    }
});

test('custom formatter runs once with the original event payload', async () => {
    const customFormat = vi.fn(() => 'Custom');
    const enter = vi.fn();
    const w = mountChart({
        config: {
            style: { tooltip: { customFormat } },
            events: { datapointEnter: enter },
        },
    });
    try {
        await flushPromises();
        const s = w.vm.$.setupState;
        const entry = s.cells[0];
        s.useTooltip(entry.datapoint, 0, entry.selectionX, entry.selectionY);
        expect(customFormat).toHaveBeenCalledTimes(1);
        expect(customFormat.mock.calls[0][0].datapoint).toBe(entry.datapoint);
        expect(enter).toHaveBeenCalledTimes(1);
        expect(s.tooltipContent).toBe('Custom');
        customFormat.mockReturnValue(null);
        s.useTooltip(entry.datapoint, 0, entry.selectionX, entry.selectionY);
        expect(customFormat).toHaveBeenCalledTimes(2);
        expect(s.tooltipContent).toContain('heatmap-tooltip-value');
    } finally {
        w.unmount();
    }
});

test('keyboard navigation and activation work with tooltips disabled', async () => {
    const click = vi.fn();
    const customFormat = vi.fn();
    const w = mountChart({
        config: {
            style: { tooltip: { show: false, customFormat } },
            events: { datapointClick: click },
        },
    });
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('tabindex', '0');
    document.body.appendChild(svg);
    try {
        await flushPromises();
        const s = w.vm.$.setupState;
        s.svgRef = svg;
        svg.focus();
        const key = (key) =>
            s.onSvgKeydown({ key, preventDefault() {}, stopPropagation() {} });
        key('ArrowRight');
        key('ArrowRight');
        expect(s.activeTooltipIndex).toBe(1);
        key('Enter');
        expect(click.mock.calls[0][0].datapoint.value).toBe(2);
        expect(s.isTooltip).toBe(false);
        expect(customFormat).not.toHaveBeenCalled();
    } finally {
        w.unmount();
        svg.remove();
    }
});

test('fitting flags drop removed and missing cells', async () => {
    const w = mountChart();
    try {
        await flushPromises();
        const s = w.vm.$.setupState;
        s.reportHide(5, true);
        s.reportRotation(5, true);
        expect(s.hideAll).toBe(true);
        expect(s.rotateAll).toBe(true);
        await w.setProps({ dataset: [{ name: 'A', values: [1] }] });
        expect(s.hideFlags).toEqual([false]);
        expect(s.rotateFlags).toEqual([false]);
        expect(s.hideAll).toBe(false);
        expect(s.rotateAll).toBe(false);
    } finally {
        w.unmount();
    }
});

test('constant values retain finite public temperature ratios', async () => {
    const w = mountChart({
        dataset: [{ name: 'Constant', values: [5, 5, 5] }],
    });
    try {
        await flushPromises();
        const temperatures = w.vm.getData()[0].temperatures;
        expect(temperatures.map((c) => c.ratio)).toEqual([0, 0, 0]);
        expect(temperatures.every((c) => c.side === 'up')).toBe(true);
    } finally {
        w.unmount();
    }
});

test('ragged row totals use the number of cells actually present', async () => {
    const w = mountChart({
        config: { style: { layout: { cells: { scaleMin: 0, scaleMax: 10 } } } },
    });
    try {
        await flushPromises();
        const s = w.vm.$.setupState;
        expect(s.dataLabels.yTotals.map((c) => c.total)).toEqual([6, 9]);
        expect(s.dataLabels.xTotals.map((c) => c.total)).toEqual([5, 7, 3]);
        expect(s.dataLabels.xTotals[2].color).toBe(s.getHeatmapColor(3, 0, 10));
        expect(s.dataLabels.xTotals[0].color).toBe(s.getHeatmapColor(5, 0, 20));
    } finally {
        w.unmount();
    }
});

test('loading transitions update table headers and return to real data', async () => {
    const w = mountChart({ config: { loading: true } });
    try {
        await flushPromises();
        const s = w.vm.$.setupState;
        expect(s.table.head).toHaveLength(7);
        expect(s.formattedTableRows[0]).toHaveLength(8);
        await w.setProps({ config: { loading: false } });
        await flushPromises();
        expect(s.loading).toBe(false);
        expect(s.table.head.map((h) => h.name)).toEqual(['A', 'B']);
        expect(s.a11yTable.rows[2]).toEqual(['2', '3', '-']);
    } finally {
        w.unmount();
    }
});

test('responsive observer and queued work stop when disabled or unmounted', async () => {
    const w = mountChart();
    try {
        await flushPromises();
        const s = w.vm.$.setupState;
        const chart = document.createElement('div');
        document.createElement('div').appendChild(chart);
        s.heatmapChart = chart;
        await w.setProps({ config: { responsive: true } });
        const active = observer;
        active.callback();
        await w.setProps({
            config: {
                responsive: false,
                style: { layout: { width: 600, height: 300 } },
            },
        });
        expect(active.disconnect).toHaveBeenCalled();
        expect(cancelAnimationFrame).toHaveBeenCalledWith(123);
        expect(s.svg).toEqual({ width: 600, height: 300 });
        const calls = requestAnimationFrame.mock.calls.length;
        active.callback();
        expect(requestAnimationFrame).toHaveBeenCalledTimes(calls);
        await w.setProps({ config: { responsive: true } });
        const last = observer;
        w.unmount();
        expect(last.disconnect).toHaveBeenCalled();
    } finally {
        if (w.exists()) w.unmount();
    }
});

test('table visibility is safe without a mounted table instance', async () => {
    const w = mountChart();
    try {
        await flushPromises();
        w.vm.toggleTable();
        await nextTick();
        w.vm.toggleTable();
        await nextTick();
        expect(w.vm.$.setupState.mutableConfig.showTable).toBe(false);
    } finally {
        w.unmount();
    }
});

test('rendered table follows skeleton headers and values during loading', async () => {
    vi.spyOn(chartLib, 'triggerResize').mockImplementation(() => {});
    const previousBox = SVGElement.prototype.getBBox;
    const previousLength = SVGElement.prototype.getComputedTextLength;
    SVGElement.prototype.getBBox = () => ({
        x: 0,
        y: 0,
        width: 10,
        height: 10,
    });
    SVGElement.prototype.getComputedTextLength = () => 10;
    const config = {
        loading: true,
        table: { show: true },
        skeletonConfig: { table: { show: true } },
    };
    const wrapper = mount(VueUiHeatmap, { props: { dataset, config } });
    try {
        await flushPromises();
        await vi.dynamicImportSettled();
        await flushPromises();
        const headers = () => wrapper.findAll('.vue-ui-heatmap-table thead th');
        expect(headers()).toHaveLength(8);
        expect(
            headers()
                .slice(1)
                .map((header) => header.text()),
        ).toEqual(Array(7).fill('_'));
        expect(
            wrapper.findAll('.vue-ui-heatmap-table tbody tr')[0].findAll('td'),
        ).toHaveLength(8);
        await wrapper.setProps({ config: { table: { show: true } } });
        await flushPromises();
        expect(
            headers()
                .slice(1)
                .map((header) => header.text()),
        ).toEqual(['A', 'B']);
        expect(
            wrapper
                .findAll('.vue-ui-heatmap-table tbody tr')[2]
                .findAll('td')
                .map((cell) => cell.text()),
        ).toEqual(['2', '3', '-']);
    } finally {
        wrapper.unmount();
        if (previousBox) SVGElement.prototype.getBBox = previousBox;
        else delete SVGElement.prototype.getBBox;
        if (previousLength)
            SVGElement.prototype.getComputedTextLength = previousLength;
        else delete SVGElement.prototype.getComputedTextLength;
    }
});

test('an empty custom skeleton keeps a valid empty grid', async () => {
    const wrapper = mountChart({
        config: { loading: true, skeletonDataset: [] },
    });
    try {
        await flushPromises();
        const state = wrapper.vm.$.setupState;
        expect(state.maxX).toBe(0);
        expect(state.cells).toEqual([]);
        expect(wrapper.vm.getData()).toEqual([]);
    } finally {
        wrapper.unmount();
    }
});
