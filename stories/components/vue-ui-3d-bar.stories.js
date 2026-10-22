import { expect, waitFor } from 'storybook/test';
import {
    scenarioRender,
    runScenario,
    clickElements,
    visible,
} from '../support/scenario.js';
import { commonFeatures } from '../support/common.js';
const sequential = async (items, callback) => {
    for (let i = 0; i < items.length; i++) await callback(items[i], i, items);
};
import { nextTick as storyNextTick } from 'vue';
import VueUi3dBar from '../../src/components/vue-ui-3d-bar.vue';
import { components } from '../fixtures/components.js';
function createCases(env) {
    const { select, mountSubject, resize, fixtures } = env;
    const cases = {};
    const hooks = [];
    const testCommonFeatures = commonFeatures(env);
    cases.RendersWithSimpleDataset = async () => {
        {
            await resize(260, 500);
        }
        {
            const mounted = await mountSubject(VueUi3dBar, {
                props: {
                    dataset: components.find((c) => c.name === 'VueUi3dBar')
                        .dataset,
                    // Final-value assertions must not depend on CI frame rate.
                    config: {
                        style: { chart: { animation: { use: false } } },
                    },
                },
            });
            let read = () => mounted;
            {
                await testCommonFeatures({
                    userOptions: true,
                });
                {
                    await waitFor(() => {
                        const elements = select(
                            '[data-cy="vue-ui-3d-bar-simple-datalabel"]',
                        );
                        expect(elements).not.toHaveLength(0);
                        expect(
                            elements.map((e) => e.textContent).join(''),
                        ).toContain(String('100%'));
                    });
                }
            }
        }
    };
    cases.RendersWithBreakdownDataset = async () => {
        const dataset = components.find(
            (c) => c.name === 'VueUi3dBar',
        ).dataset2;
        {
            await resize(500, 500);
        }
        {
            const mounted = await mountSubject(VueUi3dBar, {
                props: {
                    dataset,
                },
            });
            let read = () => mounted;
            {
                {
                    await storyNextTick();
                }
                await testCommonFeatures({
                    userOptions: true,
                });
                {
                    await waitFor(() => {
                        const elements = select('.vue-ui-3d-bar-stack');
                        expect(elements).not.toHaveLength(0);
                        expect(elements).toHaveLength(6);
                    });
                }
                await sequential(dataset.series, async (ds) => {
                    {
                        await waitFor(() => {
                            const elements = select(
                                `[data-cy="bar-3d-value-${ds.value}"]`,
                            );
                            expect(elements).not.toHaveLength(0);
                            expect(elements.length).toBeGreaterThan(0);
                            expect(elements.some(visible)).toBe(true);
                        });
                    }
                });
            }
        }
    };
    cases.HandlesDatasetReactivity = async () => {
        const dataset = components.find(
            (c) => c.name === 'VueUi3dBar',
        ).dataset2;
        {
            await resize(500, 500);
        }
        {
            const mounted = await mountSubject(VueUi3dBar, {
                props: {
                    dataset,
                },
            });
            let read = () => mounted;
            {
                const { wrapper } = read();
                await wrapper
                    .setProps({
                        dataset: {
                            series: [dataset.series[0], dataset.series[1]],
                        },
                    })
                    .then(async () => {
                        {
                            await waitFor(() => {
                                const elements = select('.vue-ui-3d-bar-stack');
                                expect(elements).not.toHaveLength(0);
                                expect(elements).toHaveLength(2);
                            });
                        }
                    });
            }
        }
    };
    cases.Emits = async () => {
        const dataset = components.find(
            (c) => c.name === 'VueUi3dBar',
        ).dataset2;
        {
            const mounted = await mountSubject(VueUi3dBar, {
                props: {
                    dataset,
                },
            });
            let read = () => mounted;
            {
                const { wrapper } = read();
                {
                    let read = () => select('.vue-ui-3d-bar-stack');
                    {
                        const previous = read;
                        read = () => {
                            const element = previous().at(0);
                            return element ? [element] : [];
                        };
                    }
                    {
                        const previous = read;
                        read = () =>
                            previous().flatMap((element) =>
                                select('path', element),
                            );
                    }
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
                    await clickElements(read());
                    {
                        {
                            let read = () => wrapper.vm.$nextTick();
                            {
                                expect(wrapper.emitted('selectDatapoint')).to
                                    .exist;
                                expect(
                                    wrapper.emitted('selectDatapoint').length,
                                ).to.equal(2);
                            }
                        }
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
    title: 'Charts/VueUi3dBar/Interactions',
    render: scenarioRender,
};
export const RendersWithSimpleDataset = {
    name: 'renders with simple dataset',
    play: async (context) =>
        runScenario(context, createCases, 'RendersWithSimpleDataset'),
};
export const RendersWithBreakdownDataset = {
    name: 'renders with breakdown dataset',
    play: async (context) =>
        runScenario(context, createCases, 'RendersWithBreakdownDataset'),
};
export const HandlesDatasetReactivity = {
    name: 'handles dataset reactivity',
    play: async (context) =>
        runScenario(context, createCases, 'HandlesDatasetReactivity'),
};
export const Emits = {
    name: 'emits',
    play: async (context) => runScenario(context, createCases, 'Emits'),
};
