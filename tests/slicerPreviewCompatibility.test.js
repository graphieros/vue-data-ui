import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import SlicerPreview from '../src/atoms/SlicerPreview.vue';

beforeEach(() =>
    vi.stubGlobal(
        'ResizeObserver',
        class {
            observe() {}
            unobserve() {}
            disconnect() {}
        },
    ),
);
afterEach(() => vi.unstubAllGlobals());

test.each([
    ['positive', [1, 5, 10], {}, [0.9, 0.5, 0], 1],
    ['negative', [-10, -5, -1], {}, [1, 0.5, 0.1], 0],
    ['mixed', [-10, 0, 10], {}, [1, 0.5, 0], 0.5],
    [
        'centered zero',
        [-5, 0, 10],
        { forceZeroCenter: true },
        [0.75, 0.5, 0],
        0.5,
    ],
    [
        'positive bounds',
        [5, 7.5, 10],
        { minScale: 5, maxScale: 10 },
        [1, 0.5, 0],
        1,
    ],
    [
        'negative bounds',
        [-10, -7.5, -5],
        { minScale: -10, maxScale: -5 },
        [1, 0.5, 0],
        0,
    ],
])(
    'default slicer preserves %s geometry and zoom selection',
    async (_, values, extraProps, expectedRatios, baselineRatio) => {
        const wrapper = mount(
            { ...SlicerPreview, render: () => null },
            {
                props: {
                    min: 0,
                    max: values.length,
                    start: 0,
                    end: values.length,
                    allMinimaps: [
                        {
                            name: 'Series',
                            type: 'bar',
                            series: values,
                            isVisible: true,
                        },
                    ],
                    ...extraProps,
                },
            },
        );
        try {
            expect(wrapper.props('yScale')).toBe('linear');
            expect(wrapper.props('yReverse')).toBe(false);
            const state = wrapper.vm.$.setupState;
            const initial = state.allMinimapLines[0];
            const height = Math.max(1, state.svgMinimap.height);
            initial.points.forEach((point, index) => {
                expect(point.y / height).toBeCloseTo(expectedRatios[index]);
                expect(point.y0 / height).toBeCloseTo(baselineRatio);
                expect(point.value).toBe(values[index]);
                expect(point.logOmitted).toBe(false);
                // The new direction-independent rectangles equal the old geometry
                // for charts that do not opt into reversal.
                expect(Math.min(point.y, point.y0)).toBeCloseTo(
                    point.v >= 0 ? point.y : point.y0,
                );
                expect(Math.abs(point.y0 - point.y)).toBeCloseTo(
                    point.v >= 0 ? point.y0 - point.y : point.y - point.y0,
                );
            });
            const emissions = wrapper.emitted('update:start')?.length || 0;
            wrapper.vm.setRangeValues(1, values.length);
            await wrapper.setProps({ start: 1 });
            expect(state.allMinimapLines[0].points).toEqual(initial.points);
            expect(
                state.allMinimapLines[0].sliced.map((point) => point.i),
            ).toEqual([1, 2]);
            expect(wrapper.emitted('update:start')?.length || 0).toBe(
                emissions,
            );
        } finally {
            wrapper.unmount();
        }
    },
);

test.each([false, true])(
    'default linear previews preserve zero, negatives and null handling (cuts=%s)',
    (cutNullValues) => {
        const values = [0, -5, null, 5, 10];
        const wrapper = mount(
            { ...SlicerPreview, render: () => null },
            {
                props: {
                    min: 0,
                    max: 5,
                    start: 0,
                    end: 5,
                    cutNullValues,
                    allMinimaps: [
                        { name: 'Values', series: values, isVisible: true },
                    ],
                },
            },
        );
        try {
            const line = wrapper.vm.$.setupState.allMinimapLines[0];
            expect(line.points.map((point) => point.value)).toEqual(values);
            expect(line.fullSet.match(/M/g) || []).toHaveLength(
                cutNullValues ? 1 : 0,
            );
            expect(values).toEqual([0, -5, null, 5, 10]);
        } finally {
            wrapper.unmount();
        }
    },
);
