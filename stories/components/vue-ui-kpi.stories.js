import { expect, waitFor } from 'storybook/test';
import { scenarioRender, runScenario, visible } from '../support/scenario.js';
import VueUiKpi from '../../src/components/vue-ui-kpi.vue';
function createCases(env) {
    const { aliases, select, mountSubject, spy } = env;
    const cases = {};
    const hooks = [];
    const storeAlias = (name, value) => {
        aliases.set(name, () => value);
        return value;
    };
    hooks.push(() => {
        storeAlias('rafSpy', spy(window, 'requestAnimationFrame'));
    });
    cases.RendersWithSlots = async () => {
        {
            const mounted = await mountSubject(VueUiKpi, {
                props: {
                    dataset: 100,
                },
                slots: {
                    title: () => 'TITLE SLOT',
                    value: () => 'VALUE SLOT',
                    ['comment-before']: () => 'COMMENT BEFORE SLOT',
                    ['comment-after']: () => 'COMMENT AFTER SLOT',
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
                {
                    let read = () => select('.vue-ui-kpi');
                    aliases.set('container', read);
                    await waitFor(() => {
                        expect(
                            read()
                                .map((e) => e.textContent)
                                .join(''),
                        ).toContain(String('TITLE SLOT'));
                    });
                    await waitFor(() => {
                        expect(
                            read()
                                .map((e) => e.textContent)
                                .join(''),
                        ).toContain(String('VALUE SLOT'));
                    });
                    await waitFor(() => {
                        expect(
                            read()
                                .map((e) => e.textContent)
                                .join(''),
                        ).toContain(String('COMMENT BEFORE SLOT'));
                    });
                    await waitFor(() => {
                        expect(
                            read()
                                .map((e) => e.textContent)
                                .join(''),
                        ).toContain(String('COMMENT AFTER SLOT'));
                    });
                }
                {
                    let read = aliases.get('container');
                    await waitFor(() => {
                        expect(
                            read()
                                .map((e) => e.textContent)
                                .join(''),
                        ).toContain(String(0));
                    });
                }
                {
                    let read = aliases.get('container');
                    await waitFor(() => {
                        expect(
                            read()
                                .map((e) => e.textContent)
                                .join(''),
                        ).toContain(String(100));
                    });
                }
            }
        }
    };
    cases.RendersWithDigits = async () => {
        {
            const mounted = await mountSubject(VueUiKpi, {
                props: {
                    dataset: 100,
                    config: {
                        analogDigits: {
                            show: true,
                        },
                    },
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
                {
                    await waitFor(() => {
                        const elements = select('.vue-ui-digits');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
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
    title: 'Mini Charts/VueUiKpi/Interactions',
    render: scenarioRender,
};
export const RendersWithSlots = {
    name: 'renders with slots',
    play: async (context) =>
        runScenario(context, createCases, 'RendersWithSlots'),
};
export const RendersWithDigits = {
    name: 'renders with digits',
    play: async (context) =>
        runScenario(context, createCases, 'RendersWithDigits'),
};
