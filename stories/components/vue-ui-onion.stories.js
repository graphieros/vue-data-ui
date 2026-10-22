import { expect, waitFor } from 'storybook/test';
import {
    scenarioRender,
    runScenario,
    dispatch,
    clickElements,
    visible,
} from '../support/scenario.js';
import { commonFeatures } from '../support/common.js';
import VueUiOnion from '../../src/components/vue-ui-onion.vue';
import { components } from '../fixtures/components.js';
function createCases(env) {
    const { aliases, select, mountSubject, resize, fixtures } = env;
    const cases = {};
    const hooks = [];
    const testCommonFeatures = commonFeatures(env);
    const { dataset, config } = components.find((c) => c.name === 'VueUiOnion');
    cases.Renders = async () => {
        {
            await resize(500, 580);
        }
        {
            const mounted = await mountSubject(VueUiOnion, {
                props: {
                    dataset,
                    // This scenario asserts final labels, not animation timing.
                    config: { ...config, useStartAnimation: false },
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
                            await dispatch(read(), 'mouseenter', {
                                force: true,
                            });
                        }
                    },
                });
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="onion-gutter"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(dataset.length);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="onion-track"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(dataset.length);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="onion-gradient"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(dataset.length);
                    });
                }
                {
                    let read = () => select('[data-cy="onion-label"]');
                    aliases.set('labels', read);
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
                    let read = aliases.get('labels');
                    {
                        const items = read();
                        for (let index = 0; index < items.length; index++) {
                            await (async (label, i) => {
                                {
                                    let read = () => label;
                                    aliases.set('label', read);
                                }
                                {
                                    let read = aliases.get('label');
                                    await waitFor(() => {
                                        expect(
                                            read()
                                                .map((e) => e.textContent)
                                                .join(''),
                                        ).toContain(String(dataset[i].name));
                                    });
                                    await waitFor(() => {
                                        expect(
                                            read()
                                                .map((e) => e.textContent)
                                                .join(''),
                                        ).toContain(
                                            String(dataset[i].percentage),
                                        );
                                    });
                                    await waitFor(() => {
                                        expect(
                                            read()
                                                .map((e) => e.textContent)
                                                .join(''),
                                        ).toContain(String('%'));
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
            await resize(500, 580);
        }
        {
            const mounted = await mountSubject(VueUiOnion, {
                props: {
                    dataset,
                    config,
                },
            });
            let read = () => mounted;
            {
                const { wrapper } = read();
                {
                    let read = () => select('[data-cy-legend-item]');
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
                        expect(wrapper.emitted('selectLegend')).to.exist;
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
    title: 'Charts/VueUiOnion/Interactions',
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
