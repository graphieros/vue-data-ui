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
    cases.RendersABarChartFromAnArrayOfNumbers = async () => {
        const periods = ['A', 'B', 'C', 'D', 'E'];
        {
            const mounted = await mountSubject(VueUiQuickChart, {
                props: {
                    dataset,
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
                                select('[data-cy="tooltip-trap-bar"]');
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
                            '[data-cy="grid-horizontal-line-bar"]',
                        );
                        expect(elements).not.toHaveLength(0);
                        expect(
                            getComputedStyle(elements[0]).getPropertyValue(
                                'opacity',
                            ),
                        ).toBe(String('1'));
                        expect(elements).toHaveLength(12);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select(
                            '[data-cy="grid-vertical-line-bar"]',
                        );
                        expect(elements).not.toHaveLength(0);
                        expect(
                            getComputedStyle(elements[0]).getPropertyValue(
                                'opacity',
                            ),
                        ).toBe(String('1'));
                        expect(elements).toHaveLength(dataset.length + 1);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="bar-y-axis"]');
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
                        const elements = select('[data-cy="bar-zero-axis"]');
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
                        const elements = select('[data-cy="scale-bar-tick"]');
                        expect(elements).not.toHaveLength(0);
                        expect(
                            getComputedStyle(elements[0]).getPropertyValue(
                                'opacity',
                            ),
                        ).toBe(String('1'));
                        expect(elements).toHaveLength(12);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="scale-bar-label"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(12);
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
                        expect(elements).toHaveLength(dataset.length);
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
                        expect(read()).toHaveLength(dataset.length);
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
                        const elements = select('[data-cy="datapoint-bar"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(dataset.length);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="datapoint-label"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(dataset.length);
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
export const RendersABarChartFromAnArrayOfNumbers = {
    name: 'renders a bar chart from an array of numbers',
    play: async (context) =>
        runScenario(
            context,
            createCases,
            'RendersABarChartFromAnArrayOfNumbers',
        ),
};
