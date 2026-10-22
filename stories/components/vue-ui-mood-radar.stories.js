import { expect, waitFor } from 'storybook/test';
import {
    scenarioRender,
    runScenario,
    dispatch,
    visible,
} from '../support/scenario.js';
import { commonFeatures } from '../support/common.js';
import VueUiMoodRadar from '../../src/components/vue-ui-mood-radar.vue';
import { components } from '../fixtures/components.js';
import { useConfig } from '../../src/useConfig';
function createCases(env) {
    const { select, mountSubject, resize, fixtures } = env;
    const cases = {};
    const hooks = [];
    const testCommonFeatures = commonFeatures(env);
    const { dataset } = components.find((c) => c.name === 'VueUiMoodRadar');
    const { vue_ui_mood_radar: config } = useConfig();
    cases.Renders = async () => {
        {
            await resize(500, 600);
        }
        {
            const mounted = await mountSubject(VueUiMoodRadar, {
                props: {
                    dataset,
                    config: {
                        ...config,
                        style: {
                            ...config.style,
                            chart: {
                                ...config.style.chart,
                                title: {
                                    text: 'Title',
                                    subtitle: {
                                        text: 'Subtitle',
                                    },
                                },
                            },
                        },
                    },
                },
            });
            let read = () => mounted;
            {
                await testCommonFeatures({
                    userOptions: true,
                    title: true,
                    subtitle: true,
                    legend: true,
                });
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="grid-radial"]');
                        expect(elements).not.toHaveLength(0);
                        expect(
                            getComputedStyle(elements[0]).getPropertyValue(
                                'opacity',
                            ),
                        ).toBe(String('1'));
                        expect(elements).toHaveLength(5);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="grid-polygon"]');
                        expect(elements).not.toHaveLength(0);
                        expect(
                            getComputedStyle(elements[0]).getPropertyValue(
                                'opacity',
                            ),
                        ).toBe(String('1'));
                    });
                }
                for (let i = 1; i <= 5; i += 1) {
                    {
                        let read = () => select(`[data-cy="icon-${i}"]`);
                        await waitFor(() => {
                            expect(read()).not.toHaveLength(0);
                        });
                        await waitFor(() => {
                            expect(read().length).toBeGreaterThan(0);
                            expect(read().some(visible)).toBe(true);
                        });
                        {
                            const previous = read;
                            read = () => previous()[0].getAttribute('stroke');
                        }
                        await waitFor(() => {
                            expect(read()).toEqual(
                                `${config.style.chart.layout.smileys.colors[i]}ff`,
                            );
                        });
                    }
                }
                for (let i = 1; i <= 5; i += 1) {
                    {
                        let read = () => select(`[data-cy="trap-${i}"]`);
                        {
                            const previous = read;
                            read = () => previous()[0].getAttribute('fill');
                        }
                        await waitFor(() => {
                            expect(read()).toEqual('transparent');
                        });
                    }
                    {
                        let read = () => select(`[data-cy="trap-${i}"]`);
                        await waitFor(() => {
                            expect(read()).not.toHaveLength(0);
                        });
                        await waitFor(() => {
                            expect(read().length).toBeGreaterThan(0);
                            expect(read().some(visible)).toBe(true);
                        });
                        await waitFor(() =>
                            expect(read().length).toBeGreaterThan(0),
                        );
                        await dispatch(read(), 'mouseenter');
                    }
                    {
                        let read = () => select(`[data-cy="trap-${i}"]`);
                        {
                            const previous = read;
                            read = () => previous()[0].getAttribute('fill');
                        }
                        await waitFor(() => {
                            expect(read()).toEqual(
                                `${config.style.chart.layout.smileys.colors[i]}33`,
                            );
                        });
                    }
                    {
                        await waitFor(() => {
                            const elements = select(
                                '[data-cy="datapoint-selection-line"]',
                            );
                            expect(elements).not.toHaveLength(0);
                            expect(elements.length).toBeGreaterThan(0);
                            expect(elements.some(visible)).toBe(true);
                        });
                    }
                    {
                        await waitFor(() => {
                            const elements = select(
                                '[data-cy="datapoint-selection-circle"]',
                            );
                            expect(elements).not.toHaveLength(0);
                            expect(elements.length).toBeGreaterThan(0);
                            expect(elements.some(visible)).toBe(true);
                            expect(elements).toHaveLength(10);
                        });
                    }
                    {
                        await waitFor(() => {
                            const elements = select('[data-cy="label-value"]');
                            expect(elements).not.toHaveLength(0);
                            expect(elements.length).toBeGreaterThan(0);
                            expect(elements.some(visible)).toBe(true);
                            expect(
                                elements.map((e) => e.textContent).join(''),
                            ).toContain(String(dataset[i]));
                        });
                    }
                    {
                        await waitFor(() => {
                            const elements = select(
                                '[data-cy="label-percentage"]',
                            );
                            expect(elements).not.toHaveLength(0);
                            expect(elements.length).toBeGreaterThan(0);
                            expect(elements.some(visible)).toBe(true);
                            expect(
                                elements.map((e) => e.textContent).join(''),
                            ).toContain(String('%'));
                        });
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
    title: 'Charts/VueUiMoodRadar/Interactions',
    render: scenarioRender,
};
export const Renders = {
    name: 'renders',
    play: async (context) => runScenario(context, createCases, 'Renders'),
};
