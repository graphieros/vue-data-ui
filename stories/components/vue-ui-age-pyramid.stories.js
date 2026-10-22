import { expect, waitFor } from 'storybook/test';
import {
    scenarioRender,
    runScenario,
    dispatch,
    visible,
} from '../support/scenario.js';
import { commonFeatures } from '../support/common.js';
import VueUiAgePyramid from '../../src/components/vue-ui-age-pyramid.vue';
import { components } from '../fixtures/components.js';
function createCases(env) {
    const { aliases, select, mountSubject, resize, fixtures } = env;
    const cases = {};
    const hooks = [];
    const testCommonFeatures = commonFeatures(env);
    const { dataset, config } = components.find(
        (c) => c.name === 'VueUiAgePyramid',
    );
    cases.Renders = async () => {
        {
            await resize(500, 540);
        }
        {
            const mounted = await mountSubject(VueUiAgePyramid, {
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
                            await dispatch(read(), 'mouseover');
                        }
                    },
                });
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="label-left"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(
                            elements.map((e) => e.textContent).join(''),
                        ).toContain(String('female'));
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="label-right"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(
                            elements.map((e) => e.textContent).join(''),
                        ).toContain(String('male'));
                    });
                }
                {
                    let read = () => select('[data-cy="y-axis-label"]');
                    aliases.set('y', read);
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read()).toHaveLength(1);
                    });
                }
                {
                    let read = aliases.get('y');
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
                        ).toContain(String('5'));
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="scale-line-left"]');
                        expect(elements).not.toHaveLength(0);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="scale-line-right"]');
                        expect(elements).not.toHaveLength(0);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="scale-tick-left"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements).toHaveLength(6);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="scale-tick-right"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements).toHaveLength(6);
                    });
                }
                {
                    let read = () =>
                        select('[data-cy="scale-tick-left-label"]');
                    aliases.set('labelsLeft', read);
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read()).toHaveLength(6);
                    });
                }
                {
                    let read = () =>
                        select('[data-cy="scale-tick-right-label"]');
                    aliases.set('labelsRight', read);
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read()).toHaveLength(6);
                    });
                }
                {
                    let read = aliases.get('labelsLeft');
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
                        ).toContain(String(400));
                    });
                }
                {
                    let read = aliases.get('labelsLeft');
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
                        ).toContain(String(0));
                    });
                }
                {
                    let read = aliases.get('labelsRight');
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
                        ).toContain(String(0));
                    });
                }
                {
                    let read = aliases.get('labelsRight');
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
                        ).toContain(String(400));
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
    title: 'Charts/VueUiAgePyramid/Interactions',
    render: scenarioRender,
};
export const Renders = {
    name: 'renders',
    play: async (context) => runScenario(context, createCases, 'Renders'),
};
