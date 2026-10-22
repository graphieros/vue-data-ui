import { expect, waitFor } from 'storybook/test';
import {
    scenarioRender,
    runScenario,
    dispatch,
    clickElements,
    visible,
} from '../support/scenario.js';
import { commonFeatures } from '../support/common.js';
import VueUiSparkStackbar from '../../src/components/vue-ui-sparkstackbar.vue';
import { components } from '../fixtures/components.js';
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
        (c) => c.name === 'VueUiSparkStackbar',
    );
    cases.Renders = async () => {
        {
            const mounted = await mountSubject(VueUiSparkStackbar, {
                props: {
                    dataset,
                    config,
                },
            });
            let read = () => mounted;
            {
                await testCommonFeatures({
                    title: true,
                    subtitle: true,
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
                            await dispatch(read(), 'mouseenter', {
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
                        expect(elements).toHaveLength(dataset.length);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="datapoint"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(dataset.length);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select(
                            '[data-cy="sparkstackbar-legend"]',
                        );
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                    });
                }
                {
                    let read = () => select('[data-cy="legend-item"]');
                    aliases.set('legendItems', read);
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
                    let read = aliases.get('legendItems');
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
                    await clickElements(read());
                }
                {
                    await waitFor(() => {
                        const elements = select(
                            '[data-cy="datapoint-underlayer"]',
                        );
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(dataset.length - 1);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="datapoint"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(dataset.length - 1);
                    });
                }
                {
                    let read = aliases.get('legendItems');
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
                    await clickElements(read());
                }
                {
                    await waitFor(() => {
                        const elements = select(
                            '[data-cy="datapoint-underlayer"]',
                        );
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(dataset.length);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="datapoint"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(dataset.length);
                    });
                }
            }
        }
    };
    cases.Emits = async () => {
        storeAlias('rafSpy', spy(window, 'requestAnimationFrame'));
        {
            const mounted = await mountSubject(VueUiSparkStackbar, {
                props: {
                    dataset,
                    config,
                },
            });
            let read = () => mounted;
            {
                const { wrapper } = read();
                {
                    let read = aliases.get('rafSpy');
                    await waitFor(() => {
                        expect(read()).toHaveBeenCalled();
                    });
                    {
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
                            await clickElements(read());
                            {
                                expect(
                                    wrapper.emitted('selectDatapoint')[0][0],
                                ).to.have.keys('datapoint', 'index');
                                expect(
                                    wrapper.emitted('selectDatapoint')[0][0]
                                        .index,
                                ).to.equal(0);
                                expect(
                                    wrapper.emitted('selectDatapoint')[0][0]
                                        .datapoint,
                                ).to.have.keys(
                                    'color',
                                    'name',
                                    'proportion',
                                    'proportionLabel',
                                    'start',
                                    'value',
                                    'width',
                                    'seriesIndex',
                                );
                                expect(
                                    wrapper.emitted('selectDatapoint')[0][0]
                                        .datapoint.color,
                                ).to.equal('#1f77b4ff');
                                expect(
                                    wrapper.emitted('selectDatapoint')[0][0]
                                        .datapoint.name,
                                ).to.equal(dataset[0].name);
                            }
                        }
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
    title: 'Mini Charts/VueUiSparkStackbar/Interactions',
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
