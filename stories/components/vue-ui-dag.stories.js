import { expect, waitFor } from 'storybook/test';
import {
    scenarioRender,
    runScenario,
    dispatch,
    clickElements,
    visible,
} from '../support/scenario.js';
import { commonFeatures } from '../support/common.js';
import { nextTick as storyNextTick } from 'vue';
import VueUiDag from '../../src/components/vue-ui-dag.vue';
import { components } from '../fixtures/components.js';
function createCases(env) {
    const { select, mountSubject, fixtures } = env;
    const cases = {};
    const hooks = [];
    const testCommonFeatures = commonFeatures(env);
    const { config, dataset } = components.find((c) => c.name === 'VueUiDag');
    cases.Renders = async () => {
        {
            const mounted = await mountSubject(VueUiDag, {
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
                    legend: false,
                    dataTable: false,
                });
                {
                    let read = () => select('[data-cy-node]');
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
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy-tooltip-node]');
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(
                            elements.map((e) => e.textContent).join(''),
                        ).toContain(String('AAA'));
                    });
                }
                {
                    let read = () => select('[data-cy-midpoint]');
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
                    await dispatch(read(), 'mouseenter');
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy-tooltip-midpoint]');
                        expect(elements).not.toHaveLength(0);
                        expect(
                            elements.map((e) => e.textContent).join(''),
                        ).toContain(String('AAA → BBB'));
                    });
                }
                {
                    let read = () => select('[data-cy-zoom-in]');
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await clickElements(read());
                }
                {
                    await storyNextTick();
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy-zoom-reset]');
                        expect(
                            elements.map((e) => e.textContent).join(''),
                        ).toContain(String('150%'));
                    });
                }
                {
                    let read = () => select('[data-cy-zoom-out]');
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await clickElements(read());
                }
                {
                    await storyNextTick();
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy-zoom-reset]');
                        expect(
                            elements.map((e) => e.textContent).join(''),
                        ).toContain(String('100%'));
                    });
                }
                {
                    let read = () => select('[data-cy-zoom-out]');
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await clickElements(read());
                }
                {
                    await storyNextTick();
                }
                {
                    let read = () => select('[data-cy-zoom-reset]');
                    await waitFor(() => {
                        expect(
                            read()
                                .map((e) => e.textContent)
                                .join(''),
                        ).toContain(String('67%'));
                    });
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await clickElements(read());
                }
                {
                    await storyNextTick();
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy-zoom-reset]');
                        expect(
                            elements.map((e) => e.textContent).join(''),
                        ).toContain(String('100%'));
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
    title: 'Charts/VueUiDag/Interactions',
    render: scenarioRender,
};
export const Renders = {
    name: 'renders',
    play: async (context) => runScenario(context, createCases, 'Renders'),
};
