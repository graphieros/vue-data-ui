import { expect, waitFor } from 'storybook/test';
import { scenarioRender, runScenario, dispatch } from '../support/scenario.js';
import { commonFeatures } from '../support/common.js';
import VueUiGeo from '../../src/components/vue-ui-geo.vue';
import { components } from '../fixtures/components.js';
function createCases(env) {
    const { select, mountSubject, fixtures } = env;
    const cases = {};
    const hooks = [];
    const testCommonFeatures = commonFeatures(env);
    const { config, dataset } = components.find((c) => c.name === 'VueUiGeo');
    async function commonTest() {
        await testCommonFeatures({
            userOptions: true,
            title: true,
            subtitle: true,
            legend: false,
            dataTable: false,
            tooltipCallback: async () => {
                {
                    let read = () =>
                        select('[data-cy="tooltip-trap-territory"]');
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
    }
    cases.Renders = async () => {
        {
            const mounted = await mountSubject(VueUiGeo, {
                props: {
                    dataset,
                    config,
                },
            });
            let read = () => mounted;
            {
                const { wrapper } = read();
                await commonTest();
            }
        }
    };
    return {
        cases,
        hooks,
    };
}
export default {
    title: 'Maps/VueUiGeo/Interactions',
    render: scenarioRender,
};
export const Renders = {
    name: 'renders',
    play: async (context) => runScenario(context, createCases, 'Renders'),
};
