import { expect, waitFor } from 'storybook/test';
import {
    scenarioRender,
    runScenario,
    dispatch,
    clickElements,
    visible,
} from '../support/scenario.js';
import { commonFeatures } from '../support/common.js';
import VueUiXy from '../../src/components/vue-ui-xy.vue';
import { components } from '../fixtures/components.js';
function createCases(env) {
    const { aliases, select, mountSubject, fixtures } = env;
    const cases = {};
    const hooks = [];
    const testCommonFeatures = commonFeatures(env);
    const { config, dataset } = components.find((c) => c.name === 'VueUiXy');
    function generateDayTimestamps(length) {
        const result = [];
        const start = new Date(2026, 0, 1);
        start.setHours(0, 0, 0, 0);
        for (let i = 0; i < length; i += 1) {
            result.push(
                new Date(start.getTime() + i * 24 * 60 * 60 * 1000).getTime(),
            );
        }
        return result;
    }
    function createDs(n, m = 100) {
        const arr = [];
        for (let i = 0; i < n; i += 1) {
            arr.push(0.37 * m * -1);
        }
        return arr;
    }
    cases.AnalysisRestoresAnnotator = async () => {
        const { wrapper } = await mountSubject(VueUiXy, {
            props: {
                dataset: [{ name: 'A', type: 'line', series: [1, 9, 3] }],
                config: {
                    chart: { userOptions: { buttons: { analyze: true } } },
                },
            },
        });
        const state = wrapper.vm.$.setupState;
        await waitFor(() => expect(state.analysisPen).toBeTruthy());
        const selection = {
            options: { minimum: true, maximum: true },
            seriesIds: ['uniqueId_0'],
        };
        for (const wasOpen of [false, true]) {
            state.isAnnotator = wasOpen;
            state.openAnalysisOptions();
            await waitFor(() =>
                expect(
                    document.querySelector('[data-cy="analysis-apply"]'),
                ).toBeTruthy(),
            );
            state.previewAnalysisOptions(selection);
            await waitFor(() => expect(state.isAnnotator).toBe(true));
            state.applyAnalysisOptions(selection);
            const check = () => {
                expect(state.isAnnotator).toBe(wasOpen);
                expect(
                    wrapper.element.querySelectorAll(
                        'g[data-analysis-generated]',
                    ).length,
                ).toBe(2);
                expect(
                    !!wrapper.element.querySelector(
                        '.vue-ui-pen-and-paper-actions',
                    ),
                ).toBe(wasOpen);
            };
            await waitFor(check);
            state.toggleStack();
            await waitFor(check);
            state.toggleStack();
            await waitFor(check);
        }
    };
    cases.AnalysisReopensAfterZoom = async () => {
        const { wrapper } = await mountSubject(VueUiXy, {
            props: {
                dataset: [
                    { name: 'A', type: 'line', series: [100, 2, 8, -99] },
                    { name: 'B', type: 'line', series: [1000, 20, 80, -999] },
                ],
                config: {
                    transitions: { enable: false },
                    useCssAnimation: false,
                    chart: { userOptions: { buttons: { analyze: true } } },
                },
            },
        });
        const state = wrapper.vm.$.setupState;
        const selection = {
            options: { minimum: true, maximum: true },
            seriesIds: ['uniqueId_0', 'uniqueId_1'],
            appearance: { color: '#123456', fontSize: 16, strokeWidth: 3 },
        };
        const groups = () =>
            wrapper.element.querySelectorAll('g[data-analysis-generated]');
        await waitFor(() => expect(state.analysisPen).toBeTruthy());
        state.openAnalysisOptions();
        await waitFor(() =>
            expect(
                document.querySelector('[data-cy="analysis-apply"]'),
            ).toBeTruthy(),
        );
        state.applyAnalysisOptions(selection);
        await waitFor(() => expect(groups().length).toBe(4));
        wrapper.vm.setZoomState({ start: 1, end: 3 });
        await waitFor(() => expect(groups().length).toBe(0));
        state.openAnalysisOptions();
        await waitFor(() => expect(groups().length).toBe(4));
        expect(
            state.analysisResult.map((series) => series.minimum.value),
        ).toEqual([2, 20]);
        expect(
            state.analysisResult.map((series) => series.maximum.value),
        ).toEqual([8, 80]);
        state.cancelAnalysisOptions();
        await waitFor(() => expect(groups().length).toBe(0));
        state.openAnalysisOptions();
        await waitFor(() => expect(groups().length).toBe(4));
        state.applyAnalysisOptions(selection);
        await waitFor(() => expect(groups().length).toBe(4));
        expect(state.analysisOptionsOpen).toBe(false);
    };
    cases.StackedAnalysisAnnotations = async () => {
        const { wrapper } = await mountSubject(VueUiXy, {
            props: {
                dataset: [
                    { name: 'A', type: 'line', series: [1, 9, 3, 5] },
                    { name: 'B', type: 'line', series: [100, 300, 200, 150] },
                ],
                config: {
                    transitions: { enable: false },
                    chart: {
                        userOptions: {
                            buttons: { analyze: true },
                            annotator: { followZoom: true },
                        },
                    },
                },
            },
        });
        const state = wrapper.vm.$.setupState;
        await waitFor(() => expect(state.analysisPen).toBeTruthy());
        state.openAnalysisOptions();
        state.applyAnalysisOptions({
            options: { minimum: true, maximum: true },
            seriesIds: ['uniqueId_0', 'uniqueId_1'],
        });
        const svg = wrapper.element.querySelector('[data-cy="xy-svg"]');
        const manual = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'line',
        );
        manual.setAttribute('class', 'vue-data-ui-doodle');
        manual.setAttribute('data-manual-stack-test', '');
        svg.querySelector('.vue-data-ui-doodles').appendChild(manual);
        function checkTargets() {
            const groups = svg.querySelectorAll('g[data-analysis-generated]');
            expect(groups.length).toBe(4);
            for (const group of groups) {
                const id = group.getAttribute('data-analysis-generated');
                const sourceId = id.startsWith('series-0')
                    ? 'uniqueId_0'
                    : 'uniqueId_1';
                const series = state.svgSlotData.find(
                    (series) => series.id === sourceId,
                );
                const value = id.endsWith('minimum')
                    ? Math.min(...series.plots.map((point) => point.value))
                    : Math.max(...series.plots.map((point) => point.value));
                const point = series.plots.find(
                    (point) => point.value === value,
                );
                const arrow = group.querySelector('line[marker-end]');
                const tip = svg.createSVGPoint();
                tip.x = Number(arrow.getAttribute('x2'));
                tip.y = Number(arrow.getAttribute('y2'));
                const actual = tip.matrixTransform(
                    svg.getScreenCTM().inverse().multiply(arrow.getScreenCTM()),
                );
                expect(actual.x).toBeCloseTo(point.x, 3);
                expect(actual.y).toBeCloseTo(point.y, 3);
            }
            expect(svg.querySelector('[data-manual-stack-test]')).toBeTruthy();
        }
        await waitFor(checkTargets);
        state.toggleStack();
        await waitFor(checkTargets);
        state.toggleStack();
        await waitFor(checkTargets);
    };
    cases.ContinuousTableLookup = async () => {
        const points = [
            { x: null, y: null },
            { x: 0, y: 10 },
            { x: 1, y: 30 },
            { x: 2, y: 20 },
        ];
        const { wrapper } = await mountSubject(VueUiXy, {
            props: {
                dataset: [
                    {
                        name: 'Continuous',
                        type: 'line',
                        series: points,
                        comments: ['gap', 'zero', 'duplicate', 'two'],
                    },
                ],
                config: { table: { show: true } },
            },
        });
        const state = wrapper.vm.$.setupState;
        const series = state.relativeDataset[0];
        const lookup = state.continuousTablePointLookup;
        for (const x of [0, 1, 2, 3, NaN, Infinity]) {
            const expected = Number.isFinite(x)
                ? (series.series.find((point) => Number(point?.x) === x)?.y ??
                  null)
                : null;
            expect(state.getTableRawValue(series, x)).toBe(expected);
        }
        expect(state.getTableRawValue(series, 0)).toBeNull();
        const gap = state.lineSet[0].plots.find(
            (point) => point.value === null,
        );
        expect(gap.comment).toBe('gap');
        state.selectedSerieIndex = 1;
        expect(state.continuousTablePointLookup).toBe(lookup);

        await wrapper.setProps({
            dataset: [
                {
                    name: 'Continuous',
                    type: 'line',
                    series: [
                        { x: 0, y: 42 },
                        { x: 1, y: 7 },
                    ],
                },
            ],
        });
        expect(state.continuousTablePointLookup).not.toBe(lookup);
        expect(state.getTableRawValue(state.relativeDataset[0], 0)).toBe(42);
    };
    cases.HoverLookupAndLabelCache = async () => {
        const { wrapper } = await mountSubject(VueUiXy, {
            props: {
                dataset: [
                    { name: 'Numeric', type: 'line', series: [10, null, 30] },
                ],
            },
        });
        const state = wrapper.vm.$.setupState;
        await waitFor(() => expect(state.timeLabelsAreReady).toBe(true));
        const texts = state.visibleTimeTexts;
        for (const index of [null, 0, 1, 2, 3, -1, '1']) {
            state.selectedSerieIndex = index;
            const values = state.relativeDataset[0].absoluteValues;
            expect(state.selectedSeries[0].value).toBe(
                values.find((_, i) => i === index),
            );
            expect(state.visibleTimeTexts).toBe(texts);
        }
    };
    cases.RendersDefault = async () => {
        {
            const mounted = await mountSubject(VueUiXy, {
                props: {
                    dataset,
                    config,
                },
            });
            let read = () => mounted;
            {
                await testCommonFeatures({
                    userOptions: true,
                    title: true,
                    subtitle: true,
                    slicer: true,
                });
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="xy-grid-line-x"]');
                        expect(elements).not.toHaveLength(0);
                        expect(
                            getComputedStyle(elements[0]).getPropertyValue(
                                'opacity',
                            ),
                        ).toBe(String('1'));
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="xy-grid-line-y"]');
                        expect(elements).not.toHaveLength(0);
                        expect(
                            getComputedStyle(elements[0]).getPropertyValue(
                                'opacity',
                            ),
                        ).toBe(String('1'));
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select(
                            '[data-cy="xy-grid-horizontal-line"]',
                        );
                        expect(elements).not.toHaveLength(0);
                        expect(
                            getComputedStyle(elements[0]).getPropertyValue(
                                'opacity',
                            ),
                        ).toBe(String('1'));
                        expect(elements).toHaveLength(7);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select(
                            '[data-cy="xy-grid-vertical-line"]',
                        );
                        expect(elements).not.toHaveLength(0);
                        expect(
                            getComputedStyle(elements[0]).getPropertyValue(
                                'opacity',
                            ),
                        ).toBe(String('1'));
                        expect(elements).toHaveLength(1);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="frame"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="axis-y-tick"]');
                        expect(elements).not.toHaveLength(0);
                        expect(
                            getComputedStyle(elements[0]).getPropertyValue(
                                'opacity',
                            ),
                        ).toBe(String('1'));
                        expect(elements).toHaveLength(7);
                    });
                }
                {
                    let read = () => select('[data-cy="axis-y-label"]');
                    aliases.set('yLabels', read);
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                }
                {
                    let read = aliases.get('yLabels');
                    {
                        const previous = read;
                        read = () => {
                            const element = previous().at(0);
                            return element ? [element] : [];
                        };
                    }
                    await waitFor(() => {
                        expect(
                            read()
                                .map((e) => e.textContent)
                                .join(''),
                        ).toContain(String(-19));
                    });
                }
                {
                    let read = aliases.get('yLabels');
                    {
                        const previous = read;
                        read = () => {
                            const element = previous().at(-1);
                            return element ? [element] : [];
                        };
                    }
                    await waitFor(() => {
                        expect(
                            read()
                                .map((e) => e.textContent)
                                .join(''),
                        ).toContain(String(19));
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="highlight-area"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select(
                            '[data-cy="highlight-area-caption"]',
                        );
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(
                            elements.map((e) => e.textContent).join(''),
                        ).toContain(
                            String(config.chart.highlightArea.caption.text),
                        );
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="datapoint-bar"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(dataset[1].series.length);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select(
                            '[data-cy="datapoint-bar-label"]',
                        );
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(dataset[1].series.length);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="datapoint-plot"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(dataset[2].series.length);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select(
                            '[data-cy="datapoint-plot-label"]',
                        );
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(dataset[2].series.length);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select(
                            '[data-cy="datapoint-line-coating-straight"]',
                        );
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(1);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select(
                            '[data-cy="datapoint-line-area-straight"]',
                        );
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(1);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select(
                            '[data-cy="datapoint-line-straight"]',
                        );
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(1);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select(
                            '[data-cy="datapoint-line-plot"]',
                        );
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(dataset[0].series.length);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select(
                            '[data-cy="datapoint-line-label"]',
                        );
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(dataset[0].series.length);
                    });
                }
            }
        }
    };
    cases.Emits = async () => {
        {
            const mounted = await mountSubject(VueUiXy, {
                props: {
                    dataset,
                    config,
                },
            });
            let read = () => mounted;
            {
                const { wrapper } = read();
                {
                    let read = () => select('[data-cy="time-label"]');
                    {
                        const previous = read;
                        read = () => {
                            const element = previous().at(0);
                            return element ? [element] : [];
                        };
                    }
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await clickElements(read(), {
                        force: true,
                    });
                    {
                        expect(
                            wrapper.emitted('selectTimeLabel'),
                        ).to.deep.equal([
                            [
                                {
                                    absoluteIndex: 0,
                                    label: '0',
                                    datapoint: [
                                        {
                                            name: dataset[0].name,
                                            shape: 'circle',
                                            color: '#1f77b4ff',
                                            comments: [],
                                            prefix: '',
                                            suffix: '',
                                            type: dataset[0].type,
                                            value: dataset[0].series[0],
                                        },
                                        {
                                            name: dataset[1].name,
                                            shape: 'square',
                                            color: '#aec7e8ff',
                                            comments: [],
                                            prefix: '',
                                            suffix: '',
                                            type: dataset[1].type,
                                            value: dataset[1].series[0],
                                        },
                                        {
                                            name: dataset[2].name,
                                            shape: 'circle',
                                            color: '#ff7f0eff',
                                            comments: [],
                                            prefix: '',
                                            suffix: '',
                                            type: dataset[2].type,
                                            value: dataset[2].series[0],
                                        },
                                    ],
                                },
                            ],
                        ]);
                    }
                }
                {
                    let read = () => select('.vue-ui-xy-svg');
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await dispatch(read(), 'mouseenter');
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await dispatch(read(), 'click', {
                        x: 40,
                        y: 200,
                        force: true,
                    });
                    {
                        expect(wrapper.emitted('selectX'));
                    }
                }
                {
                    let read = () => select('[data-cy="xy-div-legend-item-0"]');
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await clickElements(read());
                    {
                        expect(wrapper.emitted('selectLegend')).to.deep.equal([
                            [
                                [
                                    {
                                        color: '#aec7e8ff',
                                        name: dataset[1].name,
                                        type: dataset[1].type,
                                        values: dataset[1].series,
                                    },
                                    {
                                        color: '#ff7f0eff',
                                        name: dataset[2].name,
                                        type: dataset[2].type,
                                        values: dataset[1].series,
                                    },
                                ],
                            ],
                        ]);
                    }
                }
            }
        }
    };
    return {
        cases,
        hooks,
    };
}
export default {
    title: 'Charts/VueUiXy/Interactions',
    render: scenarioRender,
};
export const RendersDefault = {
    name: 'renders default',
    play: async (context) =>
        runScenario(context, createCases, 'RendersDefault'),
};
export const Emits = {
    name: 'emits',
    play: async (context) => runScenario(context, createCases, 'Emits'),
};

export const ContinuousTableLookup = {
    name: 'continuous table preserves duplicates and null gaps',
    play: async (context) =>
        runScenario(context, createCases, 'ContinuousTableLookup'),
};
export const HoverLookupAndLabelCache = {
    name: 'hover values and cached label texts stay consistent',
    play: async (context) =>
        runScenario(context, createCases, 'HoverLookupAndLabelCache'),
};

export const DatasetAnalysis = {
    name: 'dataset analysis prototype',
    play: async ({ canvasElement }) => {
        // The menu and annotator are separate async components.
        await waitFor(() =>
            expect(
                canvasElement.querySelector('.vue-data-ui-doodles'),
            ).toBeTruthy(),
        );
        await waitFor(() =>
            expect(
                canvasElement.querySelector('[data-cy="user-options-summary"]'),
                'analysis menu summary',
            ).toBeTruthy(),
        );
        canvasElement.querySelector('[data-cy="user-options-summary"]').click();
        await waitFor(() =>
            expect(
                canvasElement.querySelector('[data-cy="user-options-analyze"]'),
                'analysis menu action',
            ).toBeTruthy(),
        );
        canvasElement.querySelector('[data-cy="user-options-analyze"]').click();
        await waitFor(() =>
            expect(
                document.querySelector('[data-cy="analysis-apply"]'),
                'analysis apply dialog first',
            ).toBeTruthy(),
        );
        const optionInputs = document.querySelectorAll(
            '.vue-ui-xy-analysis-options input[type="checkbox"]:not([data-series-id])',
        );
        for (const input of Array.from(optionInputs).slice(0, 2)) {
            input.checked = true;
            input.dispatchEvent(new Event('change', { bubbles: true }));
        }
        await waitFor(() =>
            expect(
                canvasElement.querySelectorAll('g[data-analysis-generated]')
                    .length,
            ).toBeGreaterThan(0),
        );
        document.querySelector('[data-cy="analysis-apply"]').click();
        await waitFor(() =>
            expect(
                canvasElement.querySelectorAll('g[data-analysis-generated]')
                    .length,
            ).toBeGreaterThan(0),
        );
        const count = canvasElement.querySelectorAll(
            'g[data-analysis-generated]',
        ).length;
        canvasElement.querySelector('[data-cy="user-options-analyze"]').click();
        await waitFor(() =>
            expect(
                document.querySelector('[data-cy="analysis-apply"]'),
                'analysis apply dialog second',
            ).toBeTruthy(),
        );
        document.querySelector('[data-cy="analysis-apply"]').click();
        await waitFor(() =>
            expect(
                canvasElement.querySelectorAll('g[data-analysis-generated]')
                    .length,
            ).toBe(count),
        );
    },

    render: () => ({
        components: { VueUiXy },
        setup() {
            return {
                dataset: [
                    {
                        name: 'Revenue',
                        type: 'line',
                        series: [12, 18, null, 35, 28, 45, 45, 32],
                    },
                    {
                        name: 'Costs',
                        type: 'bar',
                        series: [8, 10, 12, 14, 13, 18, 20, 17],
                    },
                ],
                config: {
                    chart: {
                        title: { text: 'Dataset analysis prototype' },
                        userOptions: { buttons: { analyze: true } },
                    },
                },
            };
        },
        template: '<VueUiXy :dataset="dataset" :config="config" />',
    }),
};

export const StackedAnalysisAnnotations = {
    name: 'analysis annotations follow stack mode',
    play: async (context) =>
        runScenario(context, createCases, 'StackedAnalysisAnnotations'),
};

export const AnalysisReopensAfterZoom = {
    name: 'saved analysis previews after zoom',
    play: async (context) =>
        runScenario(context, createCases, 'AnalysisReopensAfterZoom'),
};

export const AnalysisRestoresAnnotator = {
    name: 'applying analysis restores the previous annotator state',
    play: async (context) =>
        runScenario(context, createCases, 'AnalysisRestoresAnnotator'),
};
