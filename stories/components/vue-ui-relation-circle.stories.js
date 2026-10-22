import { expect, waitFor } from 'storybook/test';
import {
    scenarioRender,
    runScenario,
    clickElements,
} from '../support/scenario.js';
const sequential = async (items, callback) => {
    for (let i = 0; i < items.length; i++) await callback(items[i], i, items);
};
import { nextTick as storyNextTick } from 'vue';
import VueUiRelationCircle from '../../src/components/vue-ui-relation-circle.vue';
function createCases(env) {
    const { aliases, select, mountSubject, resize, fixtures } = env;
    const cases = {};
    const hooks = [];
    hooks.push(async function () {
        {
            let read = () => structuredClone(fixtures['relation-circle.json']);
            const fixtureValue = read();
            read = () => fixtureValue;
            aliases.set('fixture', read);
        }
        {
            await resize(500, 500);
        }
    });
    cases.Renders = async () => {
        {
            let read = aliases.get('fixture');
            {
                const fixture = read();
                {
                    const mounted = await mountSubject(VueUiRelationCircle, {
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
                            selector: `[data-cy="relation-div-title"]`,
                            expected: fixture.config.style.title.text,
                        },
                        {
                            selector: `[data-cy="relation-div-subtitle"]`,
                            expected: fixture.config.style.title.subtitle.text,
                        },
                    ],
                    async (el) => {
                        {
                            await waitFor(() => {
                                const elements = select(el.selector);
                                expect(elements).not.toHaveLength(0);
                                expect(
                                    elements.map((e) => e.textContent).join(''),
                                ).toContain(String(el.expected));
                            });
                        }
                    },
                );
                {
                    let read = () => select(`[data-cy="relation-circle"]`);
                    {
                        const $circle = read();
                        {
                            await waitFor(() => {
                                const elements = $circle;
                                expect(elements).not.toHaveLength(0);
                            });
                        }
                        await sequential(
                            [
                                {
                                    attr: 'r',
                                    expected: String(
                                        fixture.config.style.size *
                                            fixture.config.style.circle
                                                .radiusProportion,
                                    ),
                                },
                                {
                                    attr: 'cx',
                                    expected: String(
                                        fixture.config.style.size / 2,
                                    ),
                                },
                                {
                                    attr: 'cy',
                                    expected: String(
                                        fixture.config.style.size / 2 +
                                            fixture.config.style.circle.offsetY,
                                    ),
                                },
                                {
                                    attr: 'stroke',
                                    expected:
                                        fixture.config.style.circle.stroke,
                                },
                                {
                                    attr: 'stroke-width',
                                    expected: String(
                                        fixture.config.style.circle.strokeWidth,
                                    ),
                                },
                            ],
                            async (el) => {
                                {
                                    let read = () => $circle;
                                    {
                                        const previous = read;
                                        read = () =>
                                            previous()[0].getAttribute(el.attr);
                                    }
                                    await waitFor(() => {
                                        expect(read()).toEqual(el.expected);
                                    });
                                }
                            },
                        );
                    }
                }
                for (let i = 0; i < fixture.dataset.length; i += 1) {
                    {
                        let read = () =>
                            select(`[data-cy="relation-text-${i}"]`);
                        {
                            const $text = read();
                            {
                                let read = () => $text;
                                await waitFor(() => {
                                    expect(read()).not.toHaveLength(0);
                                });
                                await waitFor(() => {
                                    expect(
                                        read()
                                            .map((e) => e.textContent)
                                            .join(''),
                                    ).toContain(
                                        String(fixture.dataset[i].label),
                                    );
                                });
                                await storyNextTick();
                                await waitFor(() =>
                                    expect(read().length).toBeGreaterThan(0),
                                );
                                await clickElements(read());
                            }
                            if (i === fixture.dataset.length - 1) {
                                {
                                    let read = () => $text;
                                    await storyNextTick();
                                    await waitFor(() =>
                                        expect(read().length).toBeGreaterThan(
                                            0,
                                        ),
                                    );
                                    await clickElements(read());
                                }
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
    title: 'Charts/VueUiRelationCircle/Interactions',
    render: scenarioRender,
};
export const Renders = {
    name: 'renders',
    play: async (context) => runScenario(context, createCases, 'Renders'),
};
