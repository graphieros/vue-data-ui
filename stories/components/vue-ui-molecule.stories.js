import { expect, waitFor } from 'storybook/test';
import {
    scenarioRender,
    runScenario,
    dispatch,
    clickElements,
    visible,
} from '../support/scenario.js';
import { commonFeatures } from '../support/common.js';
import VueUiMolecule from '../../src/components/vue-ui-molecule.vue';
import { components } from '../fixtures/components.js';
function createCases(env) {
    const { select, mountSubject, resize, fixtures } = env;
    const cases = {};
    const hooks = [];
    const testCommonFeatures = commonFeatures(env);
    const { dataset, config } = components.find(
        (c) => c.name === 'VueUiMolecule',
    );
    cases.Renders = async () => {
        {
            await resize(500, 550);
        }
        {
            const mounted = await mountSubject(VueUiMolecule, {
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
                            let read = () =>
                                select('[data-cy="recursive-circle"]');
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
                        const elements = select('[data-cy="recursive-circle"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(76);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select(
                            '[data-cy="recursive-link-wrapper"]',
                        );
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(75);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="recursive-link"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(75);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="recursive-label"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(76);
                    });
                }
                {
                    let read = () => select('[data-cy="user-options-summary"]');
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await clickElements(read());
                }
                {
                    let read = () => select('[data-cy="user-options-label"]');
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await clickElements(read());
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="recursive-label"]');
                        expect(elements).toHaveLength(0);
                    });
                }
                {
                    let read = () => select('[data-cy="user-options-label"]');
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await clickElements(read());
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="recursive-label"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(76);
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
    title: 'Charts/VueUiMolecule/Interactions',
    render: scenarioRender,
};
export const Renders = {
    name: 'renders',
    play: async (context) => runScenario(context, createCases, 'Renders'),
};
