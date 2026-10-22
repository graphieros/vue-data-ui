import { expect, waitFor } from 'storybook/test';
import { scenarioRender, runScenario, visible } from '../support/scenario.js';
import { commonFeatures } from '../support/common.js';
import VueUiDumbbell from '../../src/components/vue-ui-dumbbell.vue';
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
    const { dataset, config } = components.find(
        (c) => c.name === 'VueUiDumbbell',
    );
    cases.Renders = async () => {
        storeAlias('rafSpy', spy(window, 'requestAnimationFrame'));
        {
            const mounted = await mountSubject(VueUiDumbbell, {
                props: {
                    dataset,
                    config,
                },
            });
            let read = () => mounted;
            {
                {
                    let read = aliases.get('rafSpy');
                    await waitFor(() => {
                        expect(read()).toHaveBeenCalled();
                    });
                }
                await testCommonFeatures({
                    userOptions: true,
                    title: true,
                    subtitle: true,
                    dataTable: true,
                });
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="grid-line-y"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements).toHaveLength(9);
                        expect(
                            getComputedStyle(elements[0]).getPropertyValue(
                                'opacity',
                            ),
                        ).toBe(String('1'));
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="grid-line-x"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements).toHaveLength(6);
                        expect(
                            getComputedStyle(elements[0]).getPropertyValue(
                                'opacity',
                            ),
                        ).toBe(String('1'));
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="grid-base-x"]');
                        expect(elements).not.toHaveLength(0);
                        expect(
                            getComputedStyle(elements[0]).getPropertyValue(
                                'opacity',
                            ),
                        ).toBe(String('1'));
                    });
                }
                {
                    let read = () => select('[data-cy="label-y-name"]');
                    aliases.set('yLabelNames', read);
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                }
                {
                    let read = aliases.get('yLabelNames');
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
                                }
                            })([items[index]], index, items);
                        }
                    }
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="label-y-value"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(
                            elements.map((e) => e.textContent).join(''),
                        ).toContain(String('%'));
                    });
                }
                {
                    let read = () => select('[data-cy="label-x"]');
                    aliases.set('xLabels', read);
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                    await waitFor(() => {
                        expect(read()).toHaveLength(9);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="link-curved"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(dataset.length);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="datapoint-start"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(dataset.length);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="datapoint-end"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(dataset.length);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select(
                            '[data-cy="datapoint-label-start"]',
                        );
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(dataset.length);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select(
                            '[data-cy="datapoint-label-start"]',
                        );
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(dataset.length);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select(
                            '[data-cy="datapoint-label-end"]',
                        );
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(dataset.length);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select(
                            '[data-cy="datapoint-label-end"]',
                        );
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(dataset.length);
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
    title: 'Charts/VueUiDumbbell/Interactions',
    render: scenarioRender,
};
export const Renders = {
    name: 'renders',
    play: async (context) => runScenario(context, createCases, 'Renders'),
};
