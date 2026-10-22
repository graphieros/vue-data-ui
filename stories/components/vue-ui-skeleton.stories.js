import { expect, waitFor } from 'storybook/test';
import { scenarioRender, runScenario } from '../support/scenario.js';
const sequential = async (items, callback) => {
    for (let i = 0; i < items.length; i++) await callback(items[i], i, items);
};
import { nextTick as storyNextTick } from 'vue';
import VueUiSkeleton from '../../src/components/vue-ui-skeleton.vue';
function createCases(env) {
    const { aliases, select, mountSubject, resize, fixtures } = env;
    const cases = {};
    const hooks = [];
    async function updateConfigInFixture(modifiedConfig) {
        {
            let read = aliases.get('fixture');
            {
                const fixture = read();
                const updatedFixture = {
                    ...fixture,
                    config: modifiedConfig,
                };
                {
                    let read = () => updatedFixture;
                    aliases.set('fixture', read);
                }
            }
        }
    }
    hooks.push(async function () {
        {
            let read = () => structuredClone(fixtures['skeleton.json']);
            const fixtureValue = read();
            read = () => fixtureValue;
            aliases.set('fixture', read);
        }
        {
            await resize(500, 360);
        }
    });
    cases.Renders = async () => {
        {
            let read = aliases.get('fixture');
            {
                const fixture = read();
                {
                    const mounted = await mountSubject(VueUiSkeleton, {
                        props: {
                            dataset: fixture.dataset,
                            config: fixture.config,
                        },
                    });
                    let read = () => mounted;
                }
                await sequential(
                    [
                        {
                            type: 'pyramid',
                            height: 400,
                        },
                        {
                            type: 'sparkline',
                            height: 120,
                        },
                        {
                            type: 'candlesticks',
                            height: 330,
                        },
                        {
                            type: 'heatmap',
                            height: 150,
                        },
                        {
                            type: 'chestnut',
                            height: 320,
                        },
                        {
                            type: 'line',
                            height: 360,
                        },
                        {
                            type: 'bar',
                            height: 360,
                        },
                        {
                            type: 'donut',
                            height: 500,
                        },
                        {
                            type: 'onion',
                            height: 500,
                        },
                        {
                            type: 'gauge',
                            height: 500,
                        },
                        {
                            type: 'quadrant',
                            height: 500,
                        },
                        {
                            type: 'radar',
                            height: 500,
                        },
                        {
                            type: 'waffle',
                            height: 500,
                        },
                        {
                            type: 'table',
                            height: 360,
                        },
                        {
                            type: 'rating',
                            height: 80,
                        },
                        {
                            type: 'verticalBar',
                            height: 500,
                        },
                    ],
                    async (t) => {
                        {
                            await storyNextTick();
                        }
                        let modifiedConfig = {
                            ...fixture.config,
                            type: t.type,
                        };
                        await updateConfigInFixture(modifiedConfig);
                        {
                            const mounted = await mountSubject(VueUiSkeleton, {
                                props: {
                                    dataset: fixture.dataset,
                                    config: modifiedConfig,
                                },
                            });
                            let read = () => mounted;
                        }
                        {
                            await resize(500, t.height);
                        }
                        {
                            await waitFor(() => {
                                const elements = select(
                                    `[data-cy="skeleton-${t.type}"]`,
                                );
                                expect(elements).not.toHaveLength(0);
                            });
                        }
                    },
                );
            }
        }
    };
    return {
        cases,
        hooks,
    };
}
export default {
    title: 'Charts/VueUiSkeleton/Interactions',
    render: scenarioRender,
};
export const Renders = {
    name: 'renders',
    play: async (context) => runScenario(context, createCases, 'Renders'),
};
