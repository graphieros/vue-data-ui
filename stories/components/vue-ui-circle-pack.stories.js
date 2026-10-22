import { expect, waitFor } from 'storybook/test';
import {
    scenarioRender,
    runScenario,
    dispatch,
    visible,
} from '../support/scenario.js';
import { commonFeatures } from '../support/common.js';
import { components } from '../fixtures/components.js';
import VueUiCirclePack from '../../src/components/vue-ui-circle-pack.vue';
function createCases(env) {
    const { aliases, select, mountSubject, fixtures } = env;
    const cases = {};
    const hooks = [];
    const testCommonFeatures = commonFeatures(env);
    const { dataset, config } = components.find(
        (c) => c.name === 'VueUiCirclePack',
    );
    cases.Renders = async () => {
        {
            const mounted = await mountSubject(VueUiCirclePack, {
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
                    dataTable: true,
                });
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="datapoint-circle"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(dataset.length);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select(
                            '[data-cy="datapoint-circle-overlay"]',
                        );
                        expect(elements).not.toHaveLength(0);
                        expect(elements).toHaveLength(dataset.length);
                    });
                }
                {
                    let read = () => select('[data-cy="label-name"]');
                    aliases.set('nameLabels', read);
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
                    let read = aliases.get('nameLabels');
                    {
                        const items = read();
                        for (let index = 0; index < items.length; index++) {
                            await (async (label, _i) => {
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
                                        ).toContain(String('d_'));
                                    });
                                }
                            })([items[index]], index, items);
                        }
                    }
                }
                {
                    let read = () => select('[data-cy="label-value"]');
                    aliases.set('nameLabels', read);
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
                    let read = aliases.get('nameLabels');
                    {
                        const items = read();
                        for (let index = 0; index < items.length; index++) {
                            await (async (label, _i) => {
                                {
                                    let read = () => label;
                                    aliases.set('label', read);
                                }
                                {
                                    let read = aliases.get('label');
                                    {
                                        const previous = read;
                                        read = () =>
                                            previous()
                                                .map((e) => e.textContent)
                                                .join('');
                                    }
                                    {
                                        const text = read();
                                        const num = parseInt(text.trim(), 10);
                                        expect(num).to.be.a('number');
                                    }
                                }
                            })([items[index]], index, items);
                        }
                    }
                }
                {
                    let read = () => select('[data-cy="datapoint-circle"]');
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
                {
                    let read = () => select('[data-cy=tooltip]');
                    aliases.set('tooltip', read);
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                }
                {
                    let read = () =>
                        select('[data-cy="datapoint-circle-overlay"]');
                    {
                        const previous = read;
                        read = () => {
                            const element = previous().at(0);
                            return element ? [element] : [];
                        };
                    }
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                }
                {
                    let read = () => select('[data-cy="datapoint-circle"]');
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
                    await dispatch(read(), 'mouseout');
                }
                {
                    let read = aliases.get('tooltip');
                    await waitFor(() => {
                        expect(read()).toHaveLength(0);
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
    title: 'Charts/VueUiCirclePack/Interactions',
    render: scenarioRender,
};
export const Renders = {
    name: 'renders',
    play: async (context) => runScenario(context, createCases, 'Renders'),
};
