import { afterEach, describe, expect, it, vi } from 'vitest';
import { shallowMount, flushPromises } from '@vue/test-utils';
import { nextTick } from 'vue';
import Candlestick from '../src/components/vue-ui-candlestick.vue';
import DonutEvolution from '../src/components/vue-ui-donut-evolution.vue';
import Stackline from '../src/components/vue-ui-stackline.vue';
import Stackbar from '../src/components/vue-ui-stackbar.vue';
import QuickChart from '../src/components/vue-ui-quick-chart.vue';

const mounted = [];
afterEach(() => {
    mounted.splice(0).forEach((wrapper) => wrapper.unmount());
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
});

const series = [
    { name: 'A', series: [10, 20, 30, 40] },
    { name: 'B', series: [5, 10, 15, 20] },
];
const cases = [
    [
        'Candlestick',
        Candlestick,
        [
            ['A', 10, 20, 5, 15],
            ['B', 20, 30, 10, 25],
            ['C', 30, 40, 20, 35],
            ['D', 40, 50, 30, 45],
        ],
    ],
    [
        'DonutEvolution',
        DonutEvolution,
        series.map(({ name, series }) => ({ name, values: series })),
    ],
    ['Stackline', Stackline, series],
    ['Stackbar', Stackbar, series],
    ['QuickChart', QuickChart, [10, 20, 30, 40]],
    ['QuickChart line', QuickChart, [10, 20, 30, 40, 50, 60, 70, 80]],
    ['Horizontal Stackbar', Stackbar, series, { orientation: 'horizontal' }],
];

describe('SlicerPreview chart annotators', () => {
    it.each(cases)(
        '%s supplies reactive data-space anchors only when enabled',
        async (name, component, dataset, extraConfig = {}) => {
            vi.stubGlobal(
                'ResizeObserver',
                class {
                    observe() {}
                    unobserve() {}
                    disconnect() {}
                },
            );
            vi.stubGlobal('requestAnimationFrame', (callback) =>
                setTimeout(() => callback(performance.now()), 0),
            );
            vi.stubGlobal('cancelAnimationFrame', clearTimeout);
            Object.defineProperty(SVGElement.prototype, 'getBBox', {
                configurable: true,
                value: () => ({ x: 0, y: 0, width: 0, height: 0 }),
            });
            const wrapper = shallowMount(component, {
                props: {
                    dataset,
                    config: {
                        ...extraConfig,
                        ...(component === QuickChart
                            ? { userOptionsAnnotator: { followZoom: true } }
                            : {
                                  userOptions: {
                                      annotator: { followZoom: true },
                                  },
                              }),
                    },
                },
                global: {
                    stubs: {
                        SlicerPreview: {
                            template: '<div />',
                            methods: { setRangeValues() {} },
                        },
                        PenAndPaper: {
                            name: 'PenAndPaper',
                            props: [
                                'followZoom',
                                'annotationViewport',
                                'showGroupActions',
                            ],
                            template: '<div />',
                        },
                    },
                },
            });
            mounted.push(wrapper);
            await flushPromises();
            await nextTick();
            await new Promise((resolve) => setTimeout(resolve, 30));
            const pen = wrapper.findComponent({ name: 'PenAndPaper' });
            expect(pen.exists()).toBe(true);
            expect(pen.props('followZoom')).toBe(true);
            expect(pen.props('showGroupActions')).toBe(true);
            const before = pen.props('annotationViewport');
            expect(before).toBeTruthy();
            expect(before.x.unit).toBeGreaterThan(0);
            wrapper.vm.setZoomState({ start: 1, end: 3 });
            await flushPromises();
            await nextTick();
            const after = pen.props('annotationViewport');
            const axis = name === 'Horizontal Stackbar' ? 'y' : 'x';
            expect(after[axis].unit).toBeGreaterThan(before[axis].unit);
            await wrapper.setProps({
                config: {
                    ...extraConfig,
                    ...(component === QuickChart
                        ? {
                              userOptionsAnnotator: {
                                  followZoom: false,
                                  showGroupActions: false,
                              },
                          }
                        : {
                              userOptions: {
                                  annotator: {
                                      followZoom: false,
                                      showGroupActions: false,
                                  },
                              },
                          }),
                },
            });
            await flushPromises();
            expect(pen.props('followZoom')).toBe(false);
            expect(pen.props('showGroupActions')).toBe(false);
            expect(pen.props('annotationViewport')).toBeNull();
        },
    );
});
