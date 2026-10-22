import { expect, waitFor } from 'storybook/test';
import { scenarioRender, runScenario, visible } from '../support/scenario.js';
import VueUiGizmo from '../../src/components/vue-ui-gizmo.vue';
function createCases(env) {
    const { select, mountSubject, resize } = env;
    const cases = {};
    const hooks = [];
    cases.RendersAsABattery = async () => {
        {
            await resize(410, 170);
        }
        {
            const mounted = await mountSubject(VueUiGizmo, {
                props: {
                    dataset: 50,
                    config: {
                        size: 400,
                    },
                },
            });
            let read = () => mounted;
            {
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="battery-shape"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="battery-cap"]');
                        expect(elements).not.toHaveLength(0);
                        expect(
                            getComputedStyle(elements[0]).getPropertyValue(
                                'opacity',
                            ),
                        ).toBe(String('0.5'));
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="battery-level"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="battery-label"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(
                            elements.map((e) => e.textContent).join(''),
                        ).toContain(String('50%'));
                    });
                }
            }
        }
    };
    cases.RendersAsAGauge = async () => {
        {
            const mounted = await mountSubject(VueUiGizmo, {
                props: {
                    dataset: 50,
                    config: {
                        type: 'gauge',
                        size: 400,
                    },
                },
            });
            let read = () => mounted;
            {
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="gauge-gutter"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="gauge-track"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="gauge-gradient"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="gauge-label"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(
                            elements.map((e) => e.textContent).join(''),
                        ).toContain(String('50%'));
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
    title: 'Mini Charts/VueUiGizmo/Interactions',
    render: scenarioRender,
};
export const RendersAsABattery = {
    name: 'renders as a battery',
    play: async (context) =>
        runScenario(context, createCases, 'RendersAsABattery'),
};
export const RendersAsAGauge = {
    name: 'renders as a gauge',
    play: async (context) =>
        runScenario(context, createCases, 'RendersAsAGauge'),
};
