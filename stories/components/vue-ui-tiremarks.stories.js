import { expect, waitFor } from 'storybook/test';
import { scenarioRender, runScenario, visible } from '../support/scenario.js';
import { commonFeatures } from '../support/common.js';
import VueUiTiremarks from '../../src/components/vue-ui-tiremarks.vue';
import { components } from '../fixtures/components.js';
function createCases(env) {
    const { aliases, select, mountSubject, controlAnimationFrames, fixtures } =
        env;
    const cases = {};
    const hooks = [];
    const storeAlias = (name, value) => {
        aliases.set(name, () => value);
        return value;
    };
    const testCommonFeatures = commonFeatures(env);
    const { dataset, config } = components.find(
        (c) => c.name === 'VueUiTiremarks',
    );
    cases.Renders = async () => {
        const animation = controlAnimationFrames();
        storeAlias('rafSpy', animation.request);
        {
            const mounted = await mountSubject(VueUiTiremarks, {
                props: {
                    dataset,
                    config,
                },
            });
            await animation.flush();
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
                    title: true,
                    subtitle: true,
                });
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="tick"]');
                        expect(elements).not.toHaveLength(0);
                        expect(
                            getComputedStyle(elements[0]).getPropertyValue(
                                'opacity',
                            ),
                        ).toBe(String('1'));
                        expect(elements).toHaveLength(100);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="data-label"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(
                            elements.map((e) => e.textContent).join(''),
                        ).toContain(String(dataset.percentage));
                        expect(
                            elements.map((e) => e.textContent).join(''),
                        ).toContain(String('%'));
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
    title: 'Charts/VueUiTiremarks/Interactions',
    render: scenarioRender,
};
export const Renders = {
    name: 'renders',
    play: async (context) => runScenario(context, createCases, 'Renders'),
};
