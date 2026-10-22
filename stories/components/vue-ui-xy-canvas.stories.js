import { expect, waitFor } from 'storybook/test';
import {
    scenarioRender,
    runScenario,
    dispatch,
    clickElements,
} from '../support/scenario.js';
import { commonFeatures } from '../support/common.js';
import VueUiXyCanvas from '../../src/components/vue-ui-xy-canvas.vue';
import { components } from '../fixtures/components.js';
function createCases(env) {
    const { select, mountSubject, resize, fixtures } = env;
    const cases = {};
    const hooks = [];
    const testCommonFeatures = commonFeatures(env);
    const { dataset, config } = components.find(
        (c) => c.name === 'VueUiXyCanvas',
    );
    cases.Renders = async () => {
        {
            await resize(500, 560);
        }
        {
            const mounted = await mountSubject(VueUiXyCanvas, {
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
                    legend: true,
                    dataTable: true,
                    slicer: true,
                    tooltipCallback: async () => {
                        {
                            let read = () => select('[data-cy="canvas"]');
                            await waitFor(() =>
                                expect(read().length).toBeGreaterThan(0),
                            );
                            const rect = read()[0].getBoundingClientRect();
                            await dispatch(read(), 'mousemove', {
                                clientX: rect.left + rect.width / 2,
                                clientY: rect.top + rect.height / 2,
                            });
                        }
                    },
                });
                {
                    let read = () => select('[data-cy="canvas"]');
                    {
                        const canvas = read();
                        const c = canvas[0];
                        const ctx = c.getContext('2d');
                        const pixelData = ctx.getImageData(10, 10, 1, 1).data;
                        expect(pixelData[3]).to.be.greaterThan(0);
                    }
                }
            }
        }
    };
    cases.Emits = async () => {
        {
            const mounted = await mountSubject(VueUiXyCanvas, {
                props: {
                    dataset,
                    config,
                },
            });
            let read = () => mounted;
            {
                const { wrapper } = read();
                {
                    let read = () => select('[data-cy="legend-item"]');
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
    title: 'Charts/VueUiXyCanvas/Interactions',
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
