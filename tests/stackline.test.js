import { mount, flushPromises } from '@vue/test-utils';
import { h, nextTick } from 'vue';
import { beforeEach, afterEach, expect, test, vi } from 'vitest';
import VueUiStackline from '../src/components/vue-ui-stackline.vue';
let frameId;
beforeEach(() => {
    frameId = 0;
    vi.stubGlobal(
        'ResizeObserver',
        class {
            observe() {}
            disconnect() {}
            unobserve() {}
        },
    );
    vi.stubGlobal(
        'requestAnimationFrame',
        vi.fn(() => ++frameId),
    );
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
});
afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});
const dataset = [
    { name: 'A', series: [10, 0, 10, 20, 30, 40, 50, 60] },
    { name: 'B', series: [20, 0, 5, 10, 15, 20, 25, 30] },
];
const mountChart = (props) =>
    mount(
        { ...VueUiStackline, render: () => null },
        { props: { dataset, ...props } },
    );

test('CSV rows and headers include the same visible series', async () => {
    const wrapper = mountChart();
    try {
        await flushPromises();
        wrapper.vm.hideSeries('B');
        await nextTick();
        const table = wrapper.vm.$.setupState.tableCsv;
        expect(table.head.map((column) => column.label)).toEqual(['A']);
        expect(table.body[0]).toEqual([1, 10]);
        expect(
            table.body.every((row) => row.length === table.head.length + 1),
        ).toBe(true);
    } finally {
        wrapper.unmount();
    }
});

test('precise tooltip dates use absolute indices after zooming', async () => {
    const dates = Array.from({ length: 8 }, (_, i) => Date.UTC(2024, i, 1));
    const wrapper = mountChart({
        config: {
            style: {
                chart: {
                    grid: {
                        x: {
                            timeLabels: {
                                values: dates,
                                datetimeFormatter: {
                                    enable: true,
                                    useUTC: true,
                                },
                            },
                        },
                    },
                    tooltip: {
                        useDefaultTimeFormat: false,
                        timeFormat: 'yyyy-MM-dd',
                    },
                },
            },
        },
    });
    try {
        await flushPromises();
        wrapper.vm.setZoomState({ start: 3, end: 7 }, { transition: false });
        await flushPromises();
        expect(wrapper.vm.$.setupState.getTooltipTimeLabel(0)).toBe(
            '2024-04-01',
        );
    } finally {
        wrapper.unmount();
    }
});

test('unchanged external selection follows the zoom window', async () => {
    const wrapper = mountChart({ selectedXIndex: 3 });
    try {
        await flushPromises();
        wrapper.vm.setZoomState({ start: 2, end: 6 }, { transition: false });
        await nextTick();
        expect(wrapper.vm.$.setupState.selectedSerieIndex).toBe(1);
        wrapper.vm.setZoomState({ start: 4, end: 7 }, { transition: false });
        await nextTick();
        expect(wrapper.vm.$.setupState.selectedSerieIndex).toBeNull();
    } finally {
        wrapper.unmount();
    }
});

test('custom tooltip formatters execute once', async () => {
    const customFormat = vi.fn(() => 'Custom stackline');
    const wrapper = mountChart({
        config: { style: { chart: { tooltip: { customFormat } } } },
    });
    try {
        await flushPromises();
        const state = wrapper.vm.$.setupState;
        state.toggleTooltipVisibility(true, 0);
        expect(state.tooltipContent).toBe('Custom stackline');
        expect(customFormat).toHaveBeenCalledTimes(1);
    } finally {
        wrapper.unmount();
    }
});

test.each([false, true])(
    'legacy getData minimap helpers remain callable (distributed=%s)',
    async (distributed) => {
        const wrapper = mountChart({
            config: { style: { chart: { lines: { distributed } } } },
        });
        try {
            await flushPromises();
            const series = wrapper.vm.getData()[0];
            expect(series.xMinimap({ unitW: 10 })).toHaveLength(8);
            expect(
                series.yMinimap({ minimapH: 30 }).every(Number.isFinite),
            ).toBe(true);
            expect(
                series.yMinimapBase({ minimapH: 30 }).every(Number.isFinite),
            ).toBe(true);
        } finally {
            wrapper.unmount();
        }
    },
);

test('single-point custom labels and keyboard tooltips align with the centered point', async () => {
    const wrapper = mount(VueUiStackline, {
        props: {
            dataset: [{ name: 'A', series: [10] }],
            config: {
                userOptions: { show: false },
                style: {
                    chart: {
                        legend: { show: false },
                        zoom: { show: false },
                        grid: { x: { timeLabels: { values: ['Only'] } } },
                    },
                },
            },
        },
        slots: {
            'time-label': (props) =>
                h(
                    'text',
                    { 'data-test': 'custom-label', x: props.x },
                    props.content,
                ),
        },
    });
    try {
        await flushPromises();
        const state = wrapper.vm.$.setupState;
        const x = state.formattedDataset[0].points[0].x;
        expect(
            Number(wrapper.get('[data-test="custom-label"]').attributes('x')),
        ).toBeCloseTo(x);
        state.setKeyboardTooltipPositionFromIndex(0);
        expect(state.tooltipA11yPosition.x).toBeCloseTo(x);
    } finally {
        wrapper.unmount();
    }
});

test('unmount cancels a pending reset without publishing late events', async () => {
    const wrapper = mountChart();
    await flushPromises();
    const reset = wrapper.vm.resetZoom();
    await nextTick();
    wrapper.unmount();
    await reset;
    expect(wrapper.emitted('zoomReset')).toBeUndefined();
});

test('cached minimap output updates when smoothing and area settings change', async () => {
    const config = (smooth, useArea) => ({
        style: { chart: { lines: { smooth, useArea } } },
    });
    const wrapper = mountChart({ config: config(false, true) });
    try {
        await flushPromises();
        const state = wrapper.vm.$.setupState;
        const dimensions = { minimapH: 30, unitW: 10 };
        const initial = state.makeMinimap(dimensions);
        expect(initial.match(/<path/g)).toHaveLength(4);
        await wrapper.setProps({ config: config(true, false) });
        await flushPromises();
        const updated = state.makeMinimap(dimensions);
        expect(updated).not.toBe(initial);
        expect(updated.match(/<path/g)).toHaveLength(2);
    } finally {
        wrapper.unmount();
    }
});

test('dense axes retain source indices and full data while bounding standard tick count', async () => {
    const data = [
        { name: 'A', series: Array.from({ length: 1000 }, (_, i) => i) },
    ];
    const wrapper = mountChart({
        dataset: data,
        config: {
            style: {
                chart: {
                    grid: {
                        x: {
                            timeLabels: {
                                values: data[0].series.map((i) => `P${i}`),
                            },
                        },
                    },
                },
            },
        },
    });
    try {
        await flushPromises();
        const s = wrapper.vm.$.setupState;
        expect(s.renderedTimeLabels.length).toBeLessThan(40);
        expect(s.renderedTimeLabels[0].index).toBe(0);
        expect(s.renderedTimeLabels.at(-1).index).toBe(999);
        expect(wrapper.vm.getData()[0].points).toHaveLength(1000);
        s.selectedSerieIndex = 123;
        await nextTick();
        expect(s.selectedTimeLabel).toBeNull();
        await wrapper.setProps({
            config: {
                ...wrapper.props('config'),
                style: {
                    chart: {
                        ...wrapper.props('config').style.chart,
                        timeTag: { show: true },
                    },
                },
            },
        });
        await flushPromises();
        expect(s.selectedTimeLabel).toMatchObject({
            index: 123,
            timeLabel: { text: 'P123' },
        });
        expect(s.highlightedIndices).toEqual([123]);
        s.selectedMinimapIndex = 456;
        await nextTick();
        expect(s.highlightedIndices).toEqual([456, 123]);
        s.selectedMinimapIndex = 123;
        await nextTick();
        expect(s.highlightedIndices).toEqual([123]);
        await wrapper.vm.setZoomState(
            { start: 100, end: 110 },
            { transition: false },
        );
        await flushPromises();
        expect(s.renderedTimeLabels).toHaveLength(10);
        expect(s.renderedTimeLabels[0].timeLabel.text).toBe('P100');
    } finally {
        wrapper.unmount();
    }
});

test('hidden accessibility table is opt-in and closed visual table has no row DOM', async () => {
    const wrapper = mount(VueUiStackline, {
        attachTo: document.body,
        props: {
            dataset,
            config: {
                userOptions: { show: false },
                style: {
                    chart: {
                        grid: {
                            x: {
                                timeLabels: { autoRotate: { enable: false } },
                            },
                        },
                    },
                },
            },
        },
    });
    try {
        await vi.dynamicImportSettled();
        await flushPromises();
        expect(wrapper.find('table').exists()).toBe(false);
        await wrapper.setProps({
            config: {
                a11y: { includeTable: true },
                userOptions: { show: false },
                style: {
                    chart: {
                        grid: {
                            x: {
                                timeLabels: { autoRotate: { enable: false } },
                            },
                        },
                    },
                },
            },
        });
        await flushPromises();
        expect(wrapper.find('.sr-only table').exists()).toBe(true);
        expect(wrapper.findAll('.sr-only tbody tr')).toHaveLength(8);
        await wrapper.setProps({
            config: {
                userOptions: { show: false },
                style: {
                    chart: {
                        grid: {
                            x: {
                                timeLabels: { autoRotate: { enable: false } },
                            },
                        },
                    },
                },
            },
        });
        await flushPromises();
        expect(wrapper.find('table').exists()).toBe(false);
        wrapper.vm.toggleTable();
        await vi.dynamicImportSettled();
        await flushPromises();
        expect(wrapper.find('table').exists()).toBe(true);
        wrapper.vm.toggleTable();
        await flushPromises();
        expect(wrapper.find('table').exists()).toBe(false);
    } finally {
        await vi.dynamicImportSettled();
        wrapper.unmount();
    }
});

test('custom label slots retain every source position for dense datasets', async () => {
    const wrapper = mount(VueUiStackline, {
        attachTo: document.body,
        props: {
            dataset: [{ name: 'A', series: Array(100).fill(1) }],
            config: {
                userOptions: { show: false },
                style: {
                    chart: {
                        zoom: { show: false },
                        grid: {
                            x: {
                                timeLabels: { autoRotate: { enable: false } },
                            },
                        },
                    },
                },
            },
        },
        slots: {
            'time-label': (p) =>
                h('text', { 'data-custom-time': true }, p.content),
        },
    });
    try {
        await vi.dynamicImportSettled();
        await flushPromises();
        expect(wrapper.findAll('[data-custom-time]')).toHaveLength(100);
    } finally {
        wrapper.unmount();
    }
});

test('dot visibility independently controls persistent and hover-only rendering', async () => {
    const config = (show = true, showOnHover = true) => ({
        userOptions: { show: false },
        style: {
            chart: {
                legend: { show: false },
                zoom: { show: false },
                grid: { x: { timeLabels: { autoRotate: { enable: false } } } },
                lines: { dot: { show, showOnHover } },
            },
        },
    });
    const wrapper = mount(VueUiStackline, {
        props: { dataset, config: config() },
        global: { stubs: { Shape: true } },
    });
    try {
        await vi.dynamicImportSettled();
        await flushPromises();
        expect(wrapper.findAll('shape-stub')).toHaveLength(16);
        const s = wrapper.vm.$.setupState;
        await wrapper.setProps({ config: config(false, true) });
        expect(wrapper.findAll('shape-stub')).toHaveLength(0);
        s.userHovers = true;
        s.selectedSerieIndex = 3;
        await nextTick();
        expect(wrapper.findAll('shape-stub')).toHaveLength(2);
        await wrapper.setProps({ config: config(false, false) });
        expect(wrapper.findAll('shape-stub')).toHaveLength(0);
        await wrapper.setProps({ config: config(true, false) });
        expect(wrapper.findAll('shape-stub')).toHaveLength(16);
    } finally {
        await vi.dynamicImportSettled();
        wrapper.unmount();
    }
});

test('time tag follows chart and minimap selection, with zero taking priority', async () => {
    const wrapper = mount(VueUiStackline, {
        props: {
            dataset,
            config: {
                userOptions: { show: false },
                style: {
                    chart: {
                        legend: { show: false },
                        zoom: { show: false },
                        timeTag: { show: true },
                        grid: {
                            x: {
                                timeLabels: {
                                    autoRotate: { enable: false },
                                    values: dataset[0].series.map(
                                        (_, i) => `P${i}`,
                                    ),
                                },
                            },
                        },
                    },
                },
            },
        },
    });
    try {
        await flushPromises();
        expect(wrapper.find('[data-cy="time-tag"]').exists()).toBe(false);
        const s = wrapper.vm.$.setupState;
        s.selectedMinimapIndex = 3;
        await nextTick();
        expect(wrapper.get('[data-cy="time-tag"]').text()).toBe('P3');
        s.selectedSerieIndex = 0;
        await nextTick();
        expect(wrapper.get('[data-cy="time-tag"]').text()).toBe('P0');
        expect(
            Number(
                wrapper
                    .get('[data-cy="time-tag"]')
                    .element.parentElement.nextElementSibling.getAttribute(
                        'cx',
                    ),
            ),
        ).toBeCloseTo(s.xAtVisibleIndex(0));
        s.selectedSerieIndex = null;
        s.selectedMinimapIndex = null;
        await nextTick();
        expect(wrapper.find('[data-cy="time-tag"]').exists()).toBe(false);
    } finally {
        await vi.dynamicImportSettled();
        wrapper.unmount();
    }
});

test('time tag formats absolute dates after zoom and falls back from invalid custom output', async () => {
    const customFormat = vi.fn(() => null);
    const wrapper = mountChart({
        config: {
            style: {
                chart: {
                    timeTag: {
                        show: true,
                        useDefaultFormat: false,
                        timeFormat: 'yyyy-MM-dd',
                        customFormat,
                    },
                    grid: {
                        x: {
                            timeLabels: {
                                values: Array.from({ length: 8 }, (_, i) =>
                                    Date.UTC(2024, i, 1),
                                ),
                                datetimeFormatter: {
                                    enable: true,
                                    useUTC: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });
    try {
        await flushPromises();
        wrapper.vm.setZoomState({ start: 3, end: 7 }, { transition: false });
        await flushPromises();
        const s = wrapper.vm.$.setupState;
        s.selectedMinimapIndex = 0;
        expect(s.timeTagContent).toBe('2024-04-01');
        expect(customFormat).toHaveBeenLastCalledWith(
            expect.objectContaining({
                absoluteIndex: 3,
                seriesIndex: 0,
                datapoint: expect.arrayContaining([
                    expect.objectContaining({ name: 'A', value: 20 }),
                ]),
            }),
        );
        customFormat.mockReturnValue('<b>Custom</b>');
        s.selectedMinimapIndex = 1;
        expect(s.timeTagContent).toBe('<b>Custom</b>');
        customFormat.mockImplementation(() => {
            throw new Error('Invalid');
        });
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        s.selectedMinimapIndex = 2;
        expect(s.timeTagContent).toBe('2024-06-01');
        expect(warn).toHaveBeenCalledWith(
            'Custom format cannot be applied on timeTag.',
        );
    } finally {
        wrapper.unmount();
    }
});

test.each([false, true])(
    'hidden time tag does not reveal filtered hover labels (dense=%s)',
    async (dense) => {
        const wrapper = mountChart({
            dataset: [{ name: 'A', series: Array(dense ? 100 : 8).fill(1) }],
            config: {
                style: {
                    chart: {
                        timeTag: { show: false },
                        grid: {
                            x: {
                                timeLabels: {
                                    values: Array.from(
                                        { length: dense ? 100 : 8 },
                                        (_, i) => `P${i}`,
                                    ),
                                    showOnlyAtModulo: true,
                                    modulo: 4,
                                    showFirstAndLast: false,
                                },
                            },
                        },
                    },
                },
            },
        });
        try {
            await flushPromises();
            const s = wrapper.vm.$.setupState;
            s.selectedSerieIndex = 1;
            await nextTick();
            expect(s.displayedTimeLabels[1].text).toBe('');
            expect(s.selectedTimeLabel).toBeNull();
            await wrapper.setProps({
                config: {
                    style: {
                        chart: {
                            timeTag: { show: false },
                            grid: {
                                x: {
                                    timeLabels: {
                                        values: Array.from(
                                            { length: dense ? 100 : 8 },
                                            (_, i) => `P${i}`,
                                        ),
                                        showOnlyFirstAndLast: true,
                                    },
                                },
                            },
                        },
                    },
                },
            });
            await flushPromises();
            expect(s.displayedTimeLabels[1].text).toBe('');
            expect(s.selectedTimeLabel).toBeNull();
        } finally {
            wrapper.unmount();
        }
    },
);
