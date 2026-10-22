import { expect, waitFor } from 'storybook/test';
import { scenarioRender, runScenario, visible } from '../support/scenario.js';
import { commonFeatures } from '../support/common.js';
import VueUiFlow from '../../src/components/vue-ui-flow.vue';
import { components } from '../fixtures/components.js';
function createCases(env) {
    const { select, mountSubject, fixtures } = env;
    const cases = {};
    const hooks = [];
    const testCommonFeatures = commonFeatures(env);
    const { dataset, config } = components.find((c) => c.name === 'VueUiFlow');
    cases.Renders = async () => {
        {
            const mounted = await mountSubject(VueUiFlow, {
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
                        const elements = select('[data-cy="node"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(11);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="link"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(13);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="node-name"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements).toHaveLength(11);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="node-value"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements).toHaveLength(11);
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
    title: 'Charts/VueUiFlow/Interactions',
    render: scenarioRender,
};
export const Renders = {
    name: 'renders',
    play: async (context) => runScenario(context, createCases, 'Renders'),
};
