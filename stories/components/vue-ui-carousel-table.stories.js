import { expect, waitFor } from 'storybook/test';
import {
    scenarioRender,
    runScenario,
    clickElements,
    visible,
} from '../support/scenario.js';
import { commonFeatures } from '../support/common.js';
import { nextTick as storyNextTick } from 'vue';
import VueUiCarouselTable from '../../src/components/vue-ui-carousel-table.vue';
import { components } from '../fixtures/components.js';
function createCases(env) {
    const { aliases, select, mountSubject, spy, fixtures } = env;
    const cases = {};
    const hooks = [];
    const storeAlias = (name, value) => {
        aliases.set(name, () => value);
        return value;
    };
    const testCommonFeatures = commonFeatures(env);
    const { dataset, config } = components.find(
        (c) => c.name === 'VueUiCarouselTable',
    );
    cases.Renders = async () => {
        storeAlias('rafSpy', spy(window, 'requestAnimationFrame'));
        {
            const mounted = await mountSubject(VueUiCarouselTable, {
                props: {
                    dataset,
                    config,
                },
            });
            let read = () => mounted;
            {
                {
                    let read = aliases.get('rafSpy');
                    await waitFor(() => {
                        expect(read()).toHaveBeenCalled();
                    });
                }
                await testCommonFeatures({
                    userOptions: true,
                });
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="caption"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(
                            elements.map((e) => e.textContent).join(''),
                        ).toContain(String(config.caption.text));
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('th');
                        expect(elements).toHaveLength(7);
                    });
                }
                {
                    let read = () => select('th');
                    {
                        const items = read();
                        for (let index = 0; index < items.length; index++) {
                            await (async (th, i) => {
                                {
                                    let read = () => th;
                                    aliases.set('th', read);
                                }
                                {
                                    let read = aliases.get('th');
                                    await waitFor(() => {
                                        expect(
                                            read()
                                                .map((e) => e.textContent)
                                                .join(''),
                                        ).toContain(String(dataset.head[i]));
                                    });
                                }
                            })([items[index]], index, items);
                        }
                    }
                }
                {
                    let read = () => select('[data-cy="user-options-summary"]');
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await clickElements(read());
                }
                {
                    let read = () => select('[data-cy="user-options-anim"]');
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await clickElements(read());
                }
                {
                    await storyNextTick();
                }
                {
                    let read = aliases.get('rafSpy');
                    {
                        const rafSpy = read();
                        const callCountBefore = rafSpy.mock.calls.length;
                        {
                            await storyNextTick();
                        }
                        {
                            let read = aliases.get('rafSpy');
                            await waitFor(() =>
                                ((spy) => {
                                    expect(spy.mock.calls.length).to.eq(
                                        callCountBefore,
                                    );
                                })(read()),
                            );
                        }
                    }
                }
                {
                    let read = () => select('[data-cy="user-options-anim"]');
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await clickElements(read());
                }
                {
                    await storyNextTick();
                }
                {
                    let read = aliases.get('rafSpy');
                    await waitFor(() =>
                        ((spy) => {
                            expect(spy).toHaveBeenCalledWith(
                                expect.any(Function),
                            );
                        })(read()),
                    );
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
    title: 'Tables/VueUiCarouselTable/Interactions',
    render: scenarioRender,
};
export const Renders = {
    name: 'renders',
    play: async (context) => runScenario(context, createCases, 'Renders'),
};
