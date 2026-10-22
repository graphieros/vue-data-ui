import { expect, waitFor } from 'storybook/test';
import {
    scenarioRender,
    runScenario,
    dispatch,
    clickElements,
    visible,
} from '../../support/scenario.js';
import { commonFeatures } from '../../support/common.js';
import VueUiQuickChart from '../../../src/components/vue-ui-quick-chart.vue';
import { components } from '../../fixtures/components.js';
function createCases(env) {
    const { aliases, select, mountSubject, spy, fixtures } = env;
    const cases = {};
    const hooks = [];
    const storeAlias = (name, value) => {
        aliases.set(name, () => value);
        return value;
    };
    const testCommonFeatures = commonFeatures(env);
    const { config, dataset } = components.find(
        (c) => c.name === 'VueUiQuickChart',
    );
    async function testTitle() {
        {
            await waitFor(() => {
                const elements = select('.vue-ui-quick-chart-title');
                expect(elements).not.toHaveLength(0);
                expect(elements.length).toBeGreaterThan(0);
                expect(elements.some(visible)).toBe(true);
                expect(elements.map((e) => e.textContent).join('')).toContain(
                    String('Title'),
                );
            });
        }
    }
    cases.RendersALineChartWithAnArrayOfObjects = async () => {
        const periods = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
        const ds = [
            {
                name: 'S1',
                values: [1, 2, 3, 5, 8, 13, 21, 34, 55, 88],
            },
            {
                name: 'S2',
                values: [2, 3, 5, 8, 13, 21, 34, 55, 88, 133],
            },
        ];
        {
            const mounted = await mountSubject(VueUiQuickChart, {
                props: {
                    dataset: ds,
                    config: {
                        ...config,
                        xyPeriods: periods,
                    },
                },
            });
            let read = () => mounted;
            {
                await testCommonFeatures({
                    userOptions: true,
                    slicer: true,
                    tooltipCallback: async () => {
                        {
                            let read = () => select('.vue-ui-quick-chart');
                            await waitFor(() =>
                                expect(read().length).toBeGreaterThan(0),
                            );
                            await dispatch(read(), 'mouseenter', {
                                force: true,
                            });
                        }
                        {
                            let read = () =>
                                select('[data-cy="tooltip-trap-line"]');
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
                            await dispatch(read(), 'mouseenter', {
                                force: true,
                            });
                        }
                    },
                });
                await testTitle();
                {
                    await waitFor(() => {
                        const elements = select(
                            '[data-cy="grid-horizontal-line-line"]',
                        );
                        expect(elements).not.toHaveLength(0);
                        expect(
                            getComputedStyle(elements[0]).getPropertyValue(
                                'opacity',
                            ),
                        ).toBe(String('1'));
                        expect(elements).toHaveLength(15);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select(
                            '[data-cy="grid-vertical-line-line"]',
                        );
                        expect(elements).not.toHaveLength(0);
                        expect(
                            getComputedStyle(elements[0]).getPropertyValue(
                                'opacity',
                            ),
                        ).toBe(String('1'));
                        expect(elements).toHaveLength(ds[0].values.length + 1);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="line-y-axis"]');
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
                        const elements = select('[data-cy="line-zero-axis"]');
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
                        const elements = select('[data-cy="scale-line-tick"]');
                        expect(elements).not.toHaveLength(0);
                        expect(
                            getComputedStyle(elements[0]).getPropertyValue(
                                'opacity',
                            ),
                        ).toBe(String('1'));
                        expect(elements).toHaveLength(15);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="scale-line-label"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(15);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="period-tick"]');
                        expect(elements).not.toHaveLength(0);
                        expect(
                            getComputedStyle(elements[0]).getPropertyValue(
                                'opacity',
                            ),
                        ).toBe(String('1'));
                        expect(elements).toHaveLength(ds[0].values.length);
                    });
                }
                {
                    let read = () => select('[data-cy="period-label"]');
                    aliases.set('xLabels', read);
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                    await waitFor(() => {
                        expect(read()).toHaveLength(ds[0].values.length);
                    });
                }
                {
                    let read = aliases.get('xLabels');
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
                        ).toContain(String(periods[0]));
                    });
                }
                {
                    let read = aliases.get('xLabels');
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
                        ).toContain(String(periods.at(-1)));
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select(
                            '[data-cy="datapoint-line-wrapper"]',
                        );
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="datapoint-line"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="datapoint-plot"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(ds[0].values.length * 2);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="datapoint-label"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(ds[0].values.length * 2);
                    });
                }
            }
        }
    };
    return { cases, hooks };
}
export default {
    title: 'Charts/VueUiQuickChart/Interactions',
    render: scenarioRender,
};
export const RendersALineChartWithAnArrayOfObjects = {
    name: 'renders a line chart with an array of objects',
    play: async (context) =>
        runScenario(
            context,
            createCases,
            'RendersALineChartWithAnArrayOfObjects',
        ),
};
