import { mount, flushPromises } from '@vue/test-utils';
import { nextTick } from 'vue';
import { beforeEach, afterEach, expect, test, vi } from 'vitest';
import VueUiStackbar from '../src/components/vue-ui-stackbar.vue';
import SlicerPreview from '../src/atoms/SlicerPreview.vue';
import ConfigKnobs from '../TestingArena/ConfigKnobs.vue';
import convertArrayToObject from '../TestingArena/convertModel';
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
    { name: 'A', series: [-10, 0, 10, 20, 30, 40, 50, 60] },
    { name: 'B', series: [-20, 0, 5, 10, 15, 20, 25, 30] },
];
const mountChart = (props) =>
    mount(
        { ...VueUiStackbar, render: () => null },
        { props: { dataset, ...props } },
    );

test('CSV uses absolute category numbers when labels are absent', async () => {
    const wrapper = mountChart();
    try {
        await flushPromises();
        wrapper.vm.setZoomState({ start: 2, end: 5 });
        await flushPromises();
        expect(
            wrapper.vm.$.setupState.tableCsv.body.map((row) => row[0]),
        ).toEqual([3, 4, 5]);
    } finally {
        wrapper.unmount();
    }
});

test('CSV rows and headers include the same visible series', async () => {
    const wrapper = mountChart();
    try {
        await flushPromises();
        wrapper.vm.hideSeries('B');
        await nextTick();
        const table = wrapper.vm.$.setupState.tableCsv;
        expect(table.head.map((column) => column.label)).toEqual(['A']);
        expect(table.body[0]).toEqual([1, -10]);
        expect(
            table.body.every((row) => row.length === table.head.length + 1),
        ).toBe(true);
    } finally {
        wrapper.unmount();
    }
});

test('horizontal total labels have finite positions for negative and zero categories', async () => {
    const wrapper = mountChart({ config: { orientation: 'horizontal' } });
    try {
        await flushPromises();
        const state = wrapper.vm.$.setupState;
        expect(Number.isFinite(state.placeLabelTotalX(0))).toBe(true);
        expect(Number.isFinite(state.placeLabelTotalX(1))).toBe(true);
    } finally {
        wrapper.unmount();
    }
});

test('precise tooltip and datapoint dates use absolute indices after zooming', async () => {
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
        wrapper.vm.setZoomState({ start: 3, end: 7 });
        await flushPromises();
        const state = wrapper.vm.$.setupState;
        expect(state.getTooltipTimeLabel(0)).toBe('2024-04-01');
        expect(state.getDatapoint(0)[0].timeLabel).toEqual(
            state.allTimeLabels[3],
        );
    } finally {
        wrapper.unmount();
    }
});

test('unchanged external selection follows changes to the zoom window', async () => {
    const wrapper = mountChart({ selectedXIndex: 3 });
    try {
        await flushPromises();
        wrapper.vm.setZoomState({ start: 2, end: 6 });
        await nextTick();
        expect(wrapper.vm.$.setupState.trapIndex).toBe(1);
        wrapper.vm.setZoomState({ start: 4, end: 7 });
        await nextTick();
        expect(wrapper.vm.$.setupState.trapIndex).toBeNull();
    } finally {
        wrapper.unmount();
    }
});

test('custom tooltip formatters execute once', async () => {
    const customFormat = vi.fn(() => 'Custom stack');
    const wrapper = mountChart({
        config: { style: { chart: { tooltip: { customFormat } } } },
    });
    try {
        await flushPromises();
        const state = wrapper.vm.$.setupState;
        state.useTooltip(0);
        expect(customFormat).toHaveBeenCalledTimes(1);
        expect(state.tooltipContent).toBe('Custom stack');
    } finally {
        wrapper.unmount();
    }
});

test('minimap painting and clipping reuse geometry until dimensions or visibility change', async () => {
    const wrapper = mountChart({
        config: {
            style: {
                chart: {
                    bars: { borderRadius: 4 },
                    zoom: { minimap: { show: true } },
                },
            },
        },
    });
    try {
        await flushPromises();
        const state = wrapper.vm.$.setupState;
        const read = vi.spyOn(state.formattedDataset[0], 'yMinimap');
        const first = state.minimapGeometry({ minimapH: 30, unitW: 10 });
        expect(state.minimapGeometry({ minimapH: 30, unitW: 10 })).toBe(first);
        state.getMinimapStackClipRects({ minimapH: 30, unitW: 10 });
        expect(read).toHaveBeenCalledTimes(1);
        expect(state.minimapGeometry({ minimapH: 60, unitW: 10 })).not.toBe(
            first,
        );
        wrapper.vm.hideSeries('B');
        await nextTick();
        expect(state.minimapGeometry({ minimapH: 30, unitW: 10 })).toHaveLength(
            1,
        );
    } finally {
        wrapper.unmount();
    }
});

test('unmount cancels a pending reset without publishing late zoom events', async () => {
    const wrapper = mountChart();
    await flushPromises();
    const reset = wrapper.vm.resetZoom();
    await nextTick();
    wrapper.unmount();
    await reset;
    expect(wrapper.emitted('zoomReset')).toBeUndefined();
});

test('perspective edits preserve zoom and tooltip visibility', async () => {
    const wrapper = mountChart();
    try {
        await flushPromises();
        wrapper.vm.setZoomState({ start: 2, end: 5 });
        wrapper.vm.toggleTooltip();
        await flushPromises();

        const state = wrapper.vm.$.setupState;
        await wrapper.setProps({
            config: {
                style: {
                    chart: { bars: { perspective: { show: true, depth: 30 } } },
                },
            },
        });
        expect(state.slicer).toMatchObject({ start: 2, end: 5 });
        expect(state.mutableConfig.showTooltip).toBe(false);
        expect(state.perspectiveDepth).toBe(30);

        await wrapper.setProps({ config: {} });
        expect(state.slicer).toMatchObject({ start: 2, end: 5 });
        expect(state.perspectiveDepth).toBe(0);
    } finally {
        wrapper.unmount();
    }
});

test('perspective edits keep the SlicerPreview selection and insets', async () => {
    const config = (perspective) => ({
        style: {
            chart: {
                bars: { perspective },
                zoom: { show: true, autoFit: true, keepState: false },
                grid: { x: { timeLabels: { autoRotate: { enable: false } } } },
            },
        },
    });
    const wrapper = mount(VueUiStackbar, {
        attachTo: document.body,
        props: { dataset, config: config({ show: false }) },
    });
    try {
        await flushPromises();
        wrapper.vm.setZoomState({ start: 2, end: 5 });
        await flushPromises();
        const preview = wrapper.getComponent(SlicerPreview);
        const insets = {
            minimapLeftInsetRatio: preview.props('minimapLeftInsetRatio'),
            minimapRightInsetRatio: preview.props('minimapRightInsetRatio'),
        };

        for (const direction of ['left', 'right']) {
            await wrapper.setProps({
                config: config({ show: true, depth: 32, direction }),
            });
            const current = wrapper.getComponent(SlicerPreview);
            expect(current.element).toBe(preview.element);
            expect(current.props()).toMatchObject({
                ...insets,
                valueStart: 2,
                valueEnd: 5,
            });
            expect(current.vm.$.setupState.startValue).toBe(2);
            expect(current.vm.$.setupState.endValue).toBe(5);
        }
    } finally {
        wrapper.unmount();
    }
});

test('an oversized perspective keeps space for the front faces', async () => {
    const wrapper = mountChart({
        config: {
            style: {
                chart: {
                    width: 120,
                    height: 160,
                    bars: {
                        perspective: {
                            show: true,
                            depth: 1000,
                            direction: 'left',
                        },
                    },
                },
            },
        },
    });
    try {
        await flushPromises();
        const { drawingArea, plotBounds, perspectiveDepth, barRenderGroups } =
            wrapper.vm.$.setupState;
        expect(drawingArea.width + perspectiveDepth).toBeCloseTo(
            plotBounds.width,
        );
        expect(drawingArea.height + perspectiveDepth).toBeCloseTo(
            plotBounds.height,
        );
        expect(drawingArea.width).toBeGreaterThan(0);
        expect(drawingArea.height).toBeGreaterThan(0);
        expect(barRenderGroups.some(({ faces }) => faces.length > 0)).toBe(
            true,
        );
    } finally {
        wrapper.unmount();
    }
});

test('the arena depth slider passes numeric values into the Stackbar config', async () => {
    const model = [
        {
            key: 'style.chart.bars.perspective.depth',
            type: 'range',
            def: 12,
            min: 0,
            max: 40,
        },
    ];
    const wrapper = mount(ConfigKnobs, { props: { model } });

    try {
        const slider = wrapper.get('input[type="range"]');
        const depth = () =>
            convertArrayToObject(model).style.chart.bars.perspective.depth;

        await slider.setValue('24');
        expect(depth()).toBe(24);
        expect(wrapper.emitted('change')).toEqual([[model[0].key]]);

        await slider.setValue('0');
        expect(depth()).toBe(0);
    } finally {
        wrapper.unmount();
    }
});

test('perspective faces follow depth, direction and stack orientation', async () => {
    const chartConfig = (perspective, orientation = 'vertical') => ({
        orientation,
        style: {
            chart: {
                backgroundColor: '#808080',
                bars: { perspective, gapRatio: 0 },
                grid: { x: { timeLabels: { autoRotate: { enable: false } } } },
            },
        },
    });
    const wrapper = mount(VueUiStackbar, {
        attachTo: document.body,
        props: {
            dataset: [
                { name: 'Base', color: '#336699', series: [10, 0] },
                { name: 'Cap', color: '#993366', series: [5, 0] },
            ],
            config: chartConfig({ show: true, depth: 12 }),
        },
    });

    const tops = () => wrapper.findAll('[data-cy="stackbar-perspective-top"]');
    const sides = () =>
        wrapper.findAll('[data-cy="stackbar-perspective-side"]');
    const paintOrder = () =>
        wrapper
            .findAll(
                '[data-cy="stackbar-perspective-side"], [data-cy="stackbar-rect"]',
            )
            .map((face) => face.attributes('data-cy'));
    const frontPositions = (axis) =>
        wrapper
            .findAll('[data-cy="stackbar-rect"]')
            .map((front) => Number(front.attributes(axis)));
    const topOffset = () => {
        const points = tops()[0].attributes('d').split(' ').slice(1, -1);
        const [x, y] = points[0].split(',').map(Number);
        const [backX, backY] = points[3].split(',').map(Number);
        return [Math.round(backX - x), Math.round(backY - y)];
    };

    try {
        await flushPromises();
        expect(tops()).toHaveLength(1);
        expect(sides()).toHaveLength(2);
        expect(tops()[0].attributes('fill')).toMatch(/^#b1648b/);
        expect(sides()[0].attributes('fill')).toMatch(/^#24476b/);
        expect(topOffset()).toEqual([12, -12]);
        const front = wrapper.get('[data-cy="stackbar-rect"]');
        const stroke = front.attributes('stroke');
        const strokeWidth = front.attributes('stroke-width');
        expect(stroke).toBe('#808080ff');
        expect(tops()[0].attributes('stroke')).toBe('#9e9e9eff');
        expect(sides()[0].attributes('stroke')).toBe('#5a5a5aff');
        for (const face of [...tops(), ...sides()]) {
            expect(face.attributes('stroke-width')).toBe(strokeWidth);
            const faceClip = wrapper.get(
                face.attributes('clip-path').slice(4, -1),
            );
            expect(faceClip.get('path').attributes('d')).toBe(
                face.attributes('d'),
            );
        }
        expect(Number(strokeWidth)).toBeGreaterThan(0);
        const clip = wrapper.get(front.attributes('clip-path').slice(4, -1));
        expect(clip.attributes('clipPathUnits')).toBe('objectBoundingBox');
        expect(clip.get('rect').attributes()).toMatchObject({
            x: '0',
            y: '0',
            width: '1',
            height: '1',
        });

        await wrapper.setProps({
            config: chartConfig({ show: true, direction: 'left', depth: 6 }),
        });
        expect(topOffset()).toEqual([-6, -6]);

        await wrapper.setProps({
            config: chartConfig({ show: true }, 'horizontal'),
        });
        expect(tops()).toHaveLength(2);
        expect(sides()).toHaveLength(1);
        expect(tops()[0].attributes('fill')).toMatch(/^#24476b/);
        expect(sides()[0].attributes('fill')).toMatch(/^#b1648b/);
        expect(tops()[0].attributes('stroke')).toBe('#5a5a5aff');
        expect(sides()[0].attributes('stroke')).toBe('#9e9e9eff');

        await wrapper.setProps({
            config: chartConfig({ show: true, depth: 0 }),
        });
        expect(tops()).toHaveLength(0);
        expect(sides()).toHaveLength(0);
        const flatFront = wrapper.get('[data-cy="stackbar-rect"]');
        expect(flatFront.attributes('stroke')).toBe(stroke);
        expect(flatFront.attributes('stroke-width')).toBe(strokeWidth);
        expect(flatFront.attributes('clip-path')).toBeUndefined();

        await wrapper.setProps({ config: chartConfig({}) });
        expect(tops()).toHaveLength(0);
        expect(sides()).toHaveLength(0);
        await wrapper.setProps({
            dataset: [{ name: 'Overlap', series: [20, 10] }],
        });
        const flatWidths = frontPositions('width');

        await wrapper.setProps({
            config: chartConfig({ show: true }),
        });
        expect(paintOrder()).toEqual([
            'stackbar-perspective-side',
            'stackbar-rect',
            'stackbar-perspective-side',
            'stackbar-rect',
        ]);
        const [left, right] = frontPositions('x');
        expect(left).toBeLessThan(right);
        const [projectedX] = topOffset();
        const widths = frontPositions('width');
        expect(widths[0] + widths[1] + projectedX).toBeCloseTo(
            flatWidths[0] + flatWidths[1],
        );
        expect(left + widths[0] + projectedX).toBeGreaterThan(right);

        // The retained category keeps its path element and receives new vertices.
        const retainedTop = tops()[1].element;
        const previousPath = retainedTop.getAttribute('d');
        wrapper.vm.setZoomState({ start: 1, end: 2 });
        await nextTick();
        expect(tops()[0].element).toBe(retainedTop);
        expect(retainedTop.getAttribute('d')).not.toBe(previousPath);
        wrapper.vm.setZoomState({ start: 0, end: 2 });
        await nextTick();

        await wrapper.setProps({
            config: chartConfig({ show: true, direction: 'left' }),
        });
        expect(frontPositions('x')[0]).toBeGreaterThan(frontPositions('x')[1]);

        await wrapper.setProps({ config: chartConfig({}, 'horizontal') });
        const flatHeights = frontPositions('height');

        await wrapper.setProps({
            config: chartConfig({ show: true }, 'horizontal'),
        });
        const [bottom, top] = frontPositions('y');
        expect(bottom).toBeGreaterThan(top);
        const heights = frontPositions('height');
        const [, projectedY] = topOffset();
        expect(heights[0] + heights[1] - projectedY).toBeCloseTo(
            flatHeights[0] + flatHeights[1],
        );
        expect(bottom + projectedY).toBeLessThan(top + heights[1]);
    } finally {
        wrapper.unmount();
    }
});

test.each([
    ['vertical', 'top'],
    ['horizontal', 'side'],
])(
    'the %s perspective cap uses the exposed segment’s existing geometry',
    async (orientation, face) => {
        const wrapper = mount(VueUiStackbar, {
            attachTo: document.body,
            props: {
                dataset: [
                    { name: 'Base', color: '#336699', series: [10] },
                    { name: 'Cap', color: '#993366', series: [5] },
                ],
                config: {
                    orientation,
                    style: {
                        chart: {
                            bars: { perspective: { show: true } },
                            grid: {
                                x: {
                                    timeLabels: {
                                        autoRotate: { enable: false },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        const cap = () =>
            wrapper.get(`[data-cy="stackbar-perspective-${face}"]`);

        try {
            await flushPromises();
            const previousFill = cap().attributes('fill');
            const baseFace = wrapper.get(
                `[data-cy="stackbar-perspective-${face === 'top' ? 'side' : 'top'}"]`,
            );
            const baseClipId = baseFace
                .attributes('clip-path')
                .replace(/-(side|top)\)$/, `-${face})`);
            const baseCap = wrapper.get(`path[clip-path="${baseClipId}"]`);
            const clip = () => wrapper.get(baseClipId.slice(4, -1)).get('path');
            const clipElement = clip().element;
            expect(
                baseCap.element.parentElement.getAttribute('visibility'),
            ).toBe('hidden');

            wrapper.vm.hideSeries('Cap');
            await nextTick();
            expect(cap().element).toBe(baseCap.element);
            expect(cap().attributes('fill')).not.toBe(previousFill);
            expect(clip().element).toBe(clipElement);
            expect(clip().attributes('d')).toBe(cap().attributes('d'));
            const [x, y] = cap()
                .attributes('d')
                .split(' ')[1]
                .split(',')
                .map(Number);
            const front = wrapper.get('[data-cy="stackbar-rect"]');
            expect(y).toBeCloseTo(Number(front.attributes('y')));
            expect(x).toBeCloseTo(
                Number(front.attributes('x')) +
                    (orientation === 'horizontal'
                        ? Number(front.attributes('width'))
                        : 0),
            );

            wrapper.vm.showSeries('Cap');
            await nextTick();
            expect(
                baseCap.element.parentElement.getAttribute('visibility'),
            ).toBe('hidden');
            expect(cap().attributes('fill')).toBe(previousFill);
        } finally {
            wrapper.unmount();
        }
    },
);

test('perspective offsets scale labels and projects the optional floor', async () => {
    const config = (
        direction,
        position,
        show = true,
        orientation = 'vertical',
    ) => ({
        orientation,
        style: {
            chart: {
                bars: {
                    perspective: {
                        show,
                        direction,
                        depth: 10,
                        floor: { show: true, color: '#123456', opacity: 0.25 },
                    },
                },
                grid: {
                    frame: { show: true },
                    x: { timeLabels: { autoRotate: { enable: false } } },
                    y: { position, showAxis: true, axisLabels: { show: true } },
                },
            },
        },
    });
    const wrapper = mount(VueUiStackbar, {
        attachTo: document.body,
        props: {
            dataset,
            selectedXIndex: 1,
            config: config('left', 'left', false),
        },
    });
    const scaleX = () =>
        Number(
            wrapper
                .get('[data-cy="scale-label-y"]')
                .attributes('transform')
                .match(/translate\(([^,]+)/)[1],
        );
    const floor = () => wrapper.find('[data-cy="stackbar-perspective-floor"]');
    const expectAxisAtTicks = (expectedX) => {
        const axis = wrapper.get('[data-cy="line-axis-y"]');
        const tick = wrapper.get('[data-cy="scale-line-y"]');
        expect(Number(axis.attributes('x1'))).toBeCloseTo(expectedX);
        expect(axis.attributes('x2')).toBe(axis.attributes('x1'));
        expect(Number(tick.attributes('d').match(/^M([^,]+)/)[1])).toBeCloseTo(
            expectedX,
        );
    };
    const pathPoints = (path) => path.attributes('d').split(' ').slice(1, -1);
    const projectedFloorBounds = () => {
        const xs = pathPoints(floor()).map((point) =>
            Number(point.split(',')[0]),
        );
        return [Math.min(...xs), Math.max(...xs)];
    };
    const trapBounds = () => {
        const traps = wrapper.findAll('[data-cy="tooltip-trap"]');
        const last = traps.at(-1);
        return [
            Number(traps[0].attributes('x')),
            Number(last.attributes('x')) + Number(last.attributes('width')),
        ];
    };
    const expectProjectionInsideFrame = () => {
        const frame = wrapper.get('[data-cy="frame"]');
        const left = Number(frame.attributes('x'));
        const right = left + Number(frame.attributes('width'));
        const top = Number(frame.attributes('y'));
        const bottom = top + Number(frame.attributes('height'));
        const faces = wrapper.findAll(
            '[data-cy="stackbar-perspective-top"], [data-cy="stackbar-perspective-side"]',
        );
        const points = [...pathPoints(floor()), ...faces.flatMap(pathPoints)];
        for (const point of points) {
            const [x, y] = point.split(',').map(Number);
            expect(x).toBeGreaterThanOrEqual(left - 1e-8);
            expect(x).toBeLessThanOrEqual(right + 1e-8);
            expect(y).toBeGreaterThanOrEqual(top - 1e-8);
            expect(y).toBeLessThanOrEqual(bottom + 1e-8);
        }
    };
    const projection = (path) => {
        const [front, , , back] = pathPoints(path);
        const [frontX, frontY] = front.split(',').map(Number);
        const [backX, backY] = back.split(',').map(Number);
        return [backX - frontX, backY - frontY];
    };

    try {
        await flushPromises();
        const flatLeft = scaleX();
        const leftPlotBounds = trapBounds();
        expect(floor().exists()).toBe(false);

        await wrapper.setProps({ config: config('left', 'left') });
        expect(scaleX()).toBeCloseTo(flatLeft);
        expectAxisAtTicks(flatLeft + 8);
        expect(projection(floor())).toEqual([-10, -10]);
        expect(projectedFloorBounds()).toEqual(leftPlotBounds);
        expectProjectionInsideFrame();
        expect(floor().attributes('fill')).toBe('#123456ff');
        expect(floor().attributes('opacity')).toBe('0.25');

        await wrapper.setProps({
            config: config('right', 'right', false),
        });
        const flatRight = scaleX();
        const rightPlotBounds = trapBounds();

        await wrapper.setProps({ config: config('right', 'right') });
        expect(scaleX()).toBeCloseTo(flatRight);
        expectAxisAtTicks(flatRight - 8);
        expect(projection(floor())).toEqual([10, -10]);
        expect(projectedFloorBounds()).toEqual(rightPlotBounds);
        expectProjectionInsideFrame();
        const traps = wrapper.findAll('[data-cy="tooltip-trap"]');
        expect(traps).toHaveLength(8);
        expect(traps[1].attributes('fill')).not.toBe('transparent');
        expect(traps[0].attributes('fill')).toBe('transparent');

        const floorElement = floor().element;
        const verticalPath = floor().attributes('d');
        const frontEdge = () =>
            pathPoints(floor())
                .slice(0, 2)
                .map((point) => point.split(',').map(Number));
        const [, zeroY] = frontEdge()[0];
        const tints = () =>
            wrapper.findAll('[data-cy="stackbar-perspective-floor-tint"]');
        const tintClip = (tint) =>
            wrapper.get(tint.attributes('clip-path').slice(4, -1));
        expect(tints().length).toBeGreaterThan(0);
        for (const tint of tints()) {
            expect(tint.attributes('d')).toBe(floor().attributes('d'));
            expect(tint.attributes('fill')).toBe(floor().attributes('fill'));
            expect(tint.attributes('opacity')).toBe(
                floor().attributes('opacity'),
            );
            const [, clipY] = pathPoints(tintClip(tint).get('path'))[0]
                .split(',')
                .map(Number);
            expect(clipY).toBeGreaterThanOrEqual(zeroY);
        }
        expect(zeroY).toBeCloseTo(
            Number(wrapper.get('[data-cy="stackbar-rect"]').attributes('y')),
        );

        await wrapper.setProps({
            dataset: [{ name: 'Mixed', series: [-20, 30] }],
            config: config('right', 'right', true, 'horizontal'),
        });
        expect(floor().element).toBe(floorElement);
        expect(floor().attributes('d')).not.toBe(verticalPath);
        const [[zeroX], [edgeX]] = frontEdge();
        expect(tints().length).toBeGreaterThan(0);
        for (const tint of tints()) {
            const [first, second] = pathPoints(tintClip(tint).get('path'));
            expect(Number(first.split(',')[0])).toBeLessThan(zeroX);
            expect(Number(second.split(',')[0])).toBeLessThanOrEqual(zeroX);
        }
        const [positive, negative] = wrapper.findAll(
            '[data-cy="stackbar-rect"]',
        );
        expect(edgeX).toBe(zeroX);
        expectProjectionInsideFrame();
        expect(Number(positive.attributes('x'))).toBeCloseTo(zeroX);
        expect(
            Number(negative.attributes('x')) +
                Number(negative.attributes('width')),
        ).toBeCloseTo(zeroX);
    } finally {
        wrapper.unmount();
    }
});
