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
    cases.RendersADonutFromAnArrayOfObjects = async () => {
        const ds = [
            {
                name: 'S1',
                value: 1,
            },
            {
                name: 'S2',
                value: 2,
            },
            {
                name: 'S3',
                value: 3,
            },
        ];
        {
            const mounted = await mountSubject(VueUiQuickChart, {
                props: {
                    dataset: ds,
                    config,
                },
            });
            let read = () => mounted;
            {
                await testCommonFeatures({
                    userOptions: true,
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
                                select('[data-cy="tooltip-trap-donut"]');
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
                            '[data-cy="datapoint-donut-markers"]',
                        );
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(ds.length);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select(
                            '[data-cy="datapoint-donut-arc"]',
                        );
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(ds.length);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select(
                            '[data-cy="tooltip-trap-donut"]',
                        );
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(ds.length);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select(
                            '[data-cy="datapoint-donut-marker-circle"]',
                        );
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(ds.length);
                    });
                }
                {
                    let read = () =>
                        select('[data-cy="datapoint-donut-label-value"]');
                    aliases.set('values', read);
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                    await waitFor(() => {
                        expect(read()).toHaveLength(ds.length);
                    });
                }
                {
                    let read = aliases.get('values');
                    {
                        const items = read();
                        for (let index = 0; index < items.length; index++) {
                            await (async (value, _i) => {
                                {
                                    await waitFor(() => {
                                        const elements = value;
                                        expect(
                                            elements
                                                .map((e) => e.textContent)
                                                .join(''),
                                        ).toContain(String('%'));
                                    });
                                }
                            })([items[index]], index, items);
                        }
                    }
                }
                {
                    let read = () =>
                        select('[data-cy="datapoint-donut-label-name"]');
                    aliases.set('names', read);
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                    await waitFor(() => {
                        expect(read()).toHaveLength(ds.length);
                    });
                }
                {
                    let read = aliases.get('names');
                    {
                        const items = read();
                        for (let index = 0; index < items.length; index++) {
                            await (async (name, i) => {
                                {
                                    await waitFor(() => {
                                        const elements = name;
                                        expect(
                                            elements
                                                .map((e) => e.textContent)
                                                .join(''),
                                        ).toContain(String(ds[i].name));
                                    });
                                }
                            })([items[index]], index, items);
                        }
                    }
                }
                {
                    await waitFor(() => {
                        const elements = select(
                            '[data-cy="donut-hollow-total-label"]',
                        );
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(
                            elements.map((e) => e.textContent).join(''),
                        ).toContain(String('Total'));
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select(
                            '[data-cy="donut-hollow-total-value"]',
                        );
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(
                            elements.map((e) => e.textContent).join(''),
                        ).toContain(
                            String(
                                ds
                                    .map((d) => d.value)
                                    .reduce((a, b) => a + b, 0),
                            ),
                        );
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
export const RendersADonutFromAnArrayOfObjects = {
    name: 'renders a donut from an array of objects',
    play: async (context) =>
        runScenario(context, createCases, 'RendersADonutFromAnArrayOfObjects'),
};
