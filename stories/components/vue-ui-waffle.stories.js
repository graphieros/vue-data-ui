import { expect, waitFor } from 'storybook/test';
import {
    scenarioRender,
    runScenario,
    dispatch,
    clickElements,
    visible,
} from '../support/scenario.js';
import { commonFeatures } from '../support/common.js';
import VueUiWaffle from '../../src/components/vue-ui-waffle.vue';
import { components } from '../fixtures/components.js';
function createCases(env) {
    const { aliases, select, mountSubject, resize, spy, fixtures } = env;
    const cases = {};
    const hooks = [];
    const storeAlias = (name, value) => {
        aliases.set(name, () => value);
        return value;
    };
    const testCommonFeatures = commonFeatures(env);
    const { config, dataset } = components.find(
        (c) => c.name === 'VueUiWaffle',
    );
    hooks.push(async () => {
        {
            await resize(500, 600);
        }
    });
    cases.Renders = async () => {
        {
            const mounted = await mountSubject(VueUiWaffle, {
                props: {
                    dataset,
                    // Disable responsive to avoid ResizeObserver loop error in browser runner
                    config: {
                        ...config,
                        responsive: false,
                    },
                },
            });
            let read = () => mounted;
            {
                await testCommonFeatures({
                    userOptions: true,
                    title: true,
                    subtitle: true,
                    legend: true,
                    dataTable: true,
                    tooltipCallback: async () => {
                        {
                            let read = () => select('[data-cy="tooltip-trap"]');
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
                            await dispatch(read(), 'mouseover', {
                                force: true,
                            });
                        }
                    },
                });
                {
                    await waitFor(() => {
                        const elements = select(
                            '[data-cy="datapoint-underlayer"]',
                        );
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(
                            config.style.chart.layout.grid.size ** 2,
                        );
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="datapoint-rect"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(
                            config.style.chart.layout.grid.size ** 2,
                        );
                    });
                }
                {
                    let read = () => select('[data-cy="datapoint-caption"]');
                    aliases.set('captions', read);
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
                    let read = aliases.get('captions');
                    {
                        const items = read();
                        for (let index = 0; index < items.length; index++) {
                            await (async (caption, i) => {
                                {
                                    await waitFor(() => {
                                        const elements = caption;
                                        expect(
                                            elements
                                                .map((e) => e.textContent)
                                                .join(''),
                                        ).toContain(String(dataset[i].name));
                                        expect(
                                            elements
                                                .map((e) => e.textContent)
                                                .join(''),
                                        ).toContain(
                                            String(
                                                dataset[i].values.reduce(
                                                    (a, b) => a + b,
                                                    0,
                                                ),
                                            ),
                                        );
                                    });
                                }
                            })([items[index]], index, items);
                        }
                    }
                }
            }
        }
    };
    cases.Emits = async () => {
        {
            const mounted = await mountSubject(VueUiWaffle, {
                props: {
                    dataset,
                    config: {
                        ...config,
                        responsive: false,
                    },
                },
            });
            let read = () => mounted;
            {
                const { wrapper } = read();
                storeAlias('rafSpy', spy(window, 'requestAnimationFrame'));
                {
                    let read = () => select('[data-cy="legend-item"]');
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
                }
                {
                    let read = aliases.get('rafSpy');
                    await waitFor(() => {
                        expect(read()).toHaveBeenCalled();
                    });
                }
                {
                    await waitFor(() => {
                        const elements = null;
                        (() => {
                            expect(wrapper.emitted('selectLegend')).to.exist;
                        })(elements);
                    });
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
    title: 'Charts/VueUiWaffle/Interactions',
    render: scenarioRender,
};
export const Renders = {
    name: 'renders',
    play: async (context) => runScenario(context, createCases, 'Renders'),
};
export const Emits = {
    name: 'emits',
    play: async (context) => runScenario(context, createCases, 'Emits'),
};
