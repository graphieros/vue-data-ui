import 'storybook/test';
import { scenarioRender, runScenario } from '../support/scenario.js';
import { commonFeatures } from '../support/common.js';
import VueUiBump from '../../src/components/vue-ui-bump.vue';
import { components } from '../fixtures/components.js';
function createCases(env) {
    const { mountSubject, fixtures } = env;
    const cases = {};
    const hooks = [];
    const testCommonFeatures = commonFeatures(env);
    const { dataset, config } = components.find((c) => c.name === 'VueUiBump');
    cases.Renders = async () => {
        {
            const mounted = await mountSubject(VueUiBump, {
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
                    slicer: false,
                    dataTable: true,
                    legend: false,
                });
            }
        }
    };
    return {
        cases,
        hooks,
    };
}
export default {
    title: 'Charts/VueUiBump/Interactions',
    render: scenarioRender,
};
export const Renders = {
    name: 'renders',
    play: async (context) => runScenario(context, createCases, 'Renders'),
};
