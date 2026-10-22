import { expect, waitFor } from 'storybook/test';
import { scenarioRender, runScenario, visible } from '../support/scenario.js';
import { commonFeatures } from '../support/common.js';
import VueUiTableSparkline from '../../src/components/vue-ui-table-sparkline.vue';
import { components } from '../fixtures/components.js';
function createCases(env) {
    const { select, mountSubject, fixtures } = env;
    const cases = {};
    const hooks = [];
    const testCommonFeatures = commonFeatures(env);
    const { dataset, config } = components.find(
        (c) => c.name === 'VueUiTableSparkline',
    );
    cases.Renders = async () => {
        {
            const mounted = await mountSubject(VueUiTableSparkline, {
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
                });
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="th"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(17);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="tr"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements).toHaveLength(dataset.length);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('.vue-ui-sparkline');
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
    title: 'Mini Charts/VueUiTableSparkline/Interactions',
    render: scenarioRender,
};
export const Renders = {
    name: 'renders',
    play: async (context) => runScenario(context, createCases, 'Renders'),
};
