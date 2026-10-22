import { expect, waitFor } from 'storybook/test';
import { scenarioRender, runScenario, visible } from '../support/scenario.js';
import VueUiMiniLoader from '../../src/components/vue-ui-mini-loader.vue';
function createCases(env) {
    const { select, mountSubject } = env;
    const cases = {};
    const hooks = [];
    cases.RendersDefaultOnionVariant = async () => {
        {
            const mounted = await mountSubject(VueUiMiniLoader, {});
            let read = () => mounted;
            {
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="variant-onion"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select(
                            '[data-cy="variant-onion-gutter"]',
                        );
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(3);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select(
                            '[data-cy="variant-onion-track"]',
                        );
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(3);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('.onion-animated');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(3);
                    });
                }
            }
        }
    };
    cases.RendersLineVariant = async () => {
        {
            const mounted = await mountSubject(VueUiMiniLoader, {
                props: {
                    config: {
                        type: 'line',
                    },
                },
            });
            let read = () => mounted;
            {
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="variant-line"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select(
                            '[data-cy="variant-line-gutter"]',
                        );
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(1);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select(
                            '[data-cy="variant-line-track"]',
                        );
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(1);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('.line-animated');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(1);
                    });
                }
            }
        }
    };
    cases.RendersBarVariant = async () => {
        {
            const mounted = await mountSubject(VueUiMiniLoader, {
                props: {
                    config: {
                        type: 'bar',
                    },
                },
            });
            let read = () => mounted;
            {
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="variant-bar"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select(
                            '[data-cy="variant-bar-gutter"]',
                        );
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(1);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select(
                            '[data-cy="variant-bar-track"]',
                        );
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(1);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('.bar-animated');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(1);
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
    title: 'Mini Charts/VueUiMiniLoader/Interactions',
    render: scenarioRender,
};
export const RendersDefaultOnionVariant = {
    name: 'renders default onion variant',
    play: async (context) =>
        runScenario(context, createCases, 'RendersDefaultOnionVariant'),
};
export const RendersLineVariant = {
    name: 'renders line variant',
    play: async (context) =>
        runScenario(context, createCases, 'RendersLineVariant'),
};
export const RendersBarVariant = {
    name: 'renders bar variant',
    play: async (context) =>
        runScenario(context, createCases, 'RendersBarVariant'),
};
