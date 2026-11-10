import { mount, flushPromises } from '@vue/test-utils';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import Chart from '../src/components/vue-ui-donut-evolution.vue';
let wrappers;
beforeEach(() => {
    wrappers = [];
    vi.stubGlobal(
        'requestAnimationFrame',
        vi.fn(() => 1),
    );
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    vi.stubGlobal(
        'ResizeObserver',
        class {
            observe() {}
            disconnect() {}
            unobserve() {}
        },
    );
});
afterEach(() => {
    wrappers.forEach((w) => w.unmount());
    vi.unstubAllGlobals();
});
async function chart(
    config = {},
    dataset = [
        { name: 'A', values: [1, 2, 3, 4] },
        { name: 'B', values: [2, 3, 4, 5] },
    ],
) {
    const w = mount(
        { ...Chart, render: () => null },
        { props: { dataset, config } },
    );
    wrappers.push(w);
    await flushPromises();
    return [w, w.vm.$.setupState];
}
test('zoom keeps full table dates aligned and uses an exclusive data endpoint', async () => {
    const [, s] = await chart({
        style: {
            chart: {
                layout: {
                    grid: {
                        xAxis: {
                            dataLabels: {
                                values: ['Jan', 'Feb', 'Mar', 'Apr'],
                            },
                        },
                    },
                },
            },
        },
    });
    s.setZoomState({ start: 1, end: 3 });
    await flushPromises();
    expect(s.table.body.map((r) => r[0])).toEqual(['Jan', 'Feb', 'Mar', 'Apr']);
    expect(s.mutableDataset[0].values).toEqual([2, 3]);
});
test('hidden series survive palette and data updates', async () => {
    const [w, s] = await chart();
    s.hideSeries('A');
    await w.setProps({
        config: { customPalette: ['#ff0000', '#00ff00'] },
        dataset: [
            { name: 'A', values: [3, 4] },
            { name: 'B', values: [5, 6] },
        ],
    });
    await flushPromises();
    expect(s.mutableDataset.map((d) => d.name)).toEqual(['B']);
});
test('legend changes refresh the dialog without firing a second click', async () => {
    const click = vi.fn();
    const [, s] = await chart({ events: { datapointClick: click } });
    s.fixDatapoint(s.drawableDataset[1], 1);
    expect(s.fixedDatapoint.subtotal).toBe(5);
    s.hideSeries('A');
    await flushPromises();
    expect(click).toHaveBeenCalledTimes(1);
    expect(s.fixedDatapoint.subtotal).toBe(3);
    expect(s.donutDataset).toHaveLength(1);
    s.setZoomState({ start: 2, end: 4 });
    await flushPromises();
    expect(s.fixedDatapoint).toBe(null);
});
test('leave reports the same absolute index as enter', async () => {
    const enter = vi.fn(),
        leave = vi.fn();
    const [, s] = await chart({
        events: { datapointEnter: enter, datapointLeave: leave },
    });
    s.setZoomState({ start: 1, end: 3 });
    const dp = s.drawableDataset[0];
    s.enter(dp);
    s.leave(dp);
    expect(enter.mock.calls[0][0].seriesIndex).toBe(1);
    expect(leave.mock.calls[0][0].seriesIndex).toBe(1);
});
test('fixed dimensions update and loading can finish', async () => {
    const [w, s] = await chart({ loading: true });
    await w.setProps({
        config: {
            loading: false,
            style: { chart: { layout: { width: 900, height: 500 } } },
        },
    });
    await flushPromises();
    expect(s.loading).toBe(false);
    expect(s.defaultSizes).toEqual({ width: 900, height: 500 });
});
test('empty custom skeleton has finite bounds', async () => {
    const [, s] = await chart({ loading: true, skeletonDataset: [] });
    expect(s.maxLength).toBe(0);
    expect(Number.isFinite(s.extremes.min)).toBe(true);
    expect(Number.isFinite(s.extremes.max)).toBe(true);
});

test('hover reuses cached donut geometry', async () => {
    const [, s] = await chart();
    const arcs = s.drawableDataset[0].donut;
    s.hoveredIndex = 0;
    expect(s.drawableDataset[0].donut).toBe(arcs);
    expect(s.drawableDataset[0].activeRadius).toBe(s.svg.width / 16);
});
