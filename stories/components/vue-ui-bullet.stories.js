import { expect, waitFor } from 'storybook/test';
import { scenarioRender, runScenario, visible } from '../support/scenario.js';
import { commonFeatures } from '../support/common.js';
import VueUiBullet from '../../src/components/vue-ui-bullet.vue';
import { components } from '../fixtures/components.js';
function createCases(env) {
    const { aliases, select, mountSubject, fixtures } = env;
    const cases = {};
    const hooks = [];
    const testCommonFeatures = commonFeatures(env);
    const { dataset, config } = components.find(
        (c) => c.name === 'VueUiBullet',
    );
    cases.Renders = async () => {
        {
            const mounted = await mountSubject(VueUiBullet, {
                props: {
                    dataset,
                    // Keep the fixture styling, but render the settled value.
                    config: {
                        ...config,
                        style: {
                            ...config.style,
                            chart: {
                                ...config.style.chart,
                                animation: {
                                    ...config.style.chart.animation,
                                    show: false,
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
                    let read = () => select('.vue-data-ui-legend-item');
                    aliases.set('legend', read);
                    await waitFor(() => {
                        expect(read()).toHaveLength(3);
                    });
                }
                {
                    let read = aliases.get('legend');
                    {
                        const items = read();
                        for (let index = 0; index < items.length; index++) {
                            await (async (item, i) => {
                                {
                                    let read = () => item;
                                    aliases.set('item', read);
                                }
                                {
                                    let read = aliases.get('item');
                                    await waitFor(() => {
                                        expect(
                                            read()
                                                .map((e) => e.textContent)
                                                .join(''),
                                        ).toContain(
                                            String(dataset.segments[i].name),
                                        );
                                    });
                                }
                                {
                                    let read = aliases.get('item');
                                    await waitFor(() => {
                                        expect(
                                            read()
                                                .map((e) => e.textContent)
                                                .join(''),
                                        ).toContain(
                                            String(dataset.segments[i].from),
                                        );
                                    });
                                }
                                {
                                    let read = aliases.get('item');
                                    await waitFor(() => {
                                        expect(
                                            read()
                                                .map((e) => e.textContent)
                                                .join(''),
                                        ).toContain(
                                            String(dataset.segments[i].to),
                                        );
                                    });
                                }
                            })([items[index]], index, items);
                        }
                    }
                }
                {
                    await waitFor(() => {
                        const elements = select(
                            '[data-cy="vue-ui-bullet-segment"]',
                        );
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(3);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select(
                            '[data-cy="vue-ui-bullet-target-top"]',
                        );
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select(
                            '[data-cy="vue-ui-bullet-value-label"]',
                        );
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(
                            elements.map((e) => e.textContent).join(''),
                        ).toContain(String(dataset.value));
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select(
                            '[data-cy="vue-ui-bullet-value-bar"]',
                        );
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                    });
                }
                {
                    let read = () =>
                        select('[data-cy="vue-ui-bullet-tick-label"]');
                    aliases.set('tickLabels', read);
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                    await waitFor(() => {
                        expect(read()).toHaveLength(11);
                    });
                }
                {
                    let read = aliases.get('tickLabels');
                    {
                        const previous = read;
                        read = () => {
                            const element = previous().at(0);
                            return element ? [element] : [];
                        };
                    }
                    await waitFor(() => {
                        expect(
                            read()
                                .map((e) => e.textContent)
                                .join(''),
                        ).toContain(String(dataset.segments[0].from));
                    });
                }
                {
                    let read = aliases.get('tickLabels');
                    {
                        const previous = read;
                        read = () => {
                            const element = previous().at(-1);
                            return element ? [element] : [];
                        };
                    }
                    await waitFor(() => {
                        expect(
                            read()
                                .map((e) => e.textContent)
                                .join(''),
                        ).toContain(String(dataset.segments.at(-1).to));
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select(
                            '[data-cy="vue-ui-bullet-tick-marker"]',
                        );
                        expect(elements).not.toHaveLength(0);
                        expect(elements).toHaveLength(11);
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
    title: 'Charts/VueUiBullet/Interactions',
    render: scenarioRender,
};
export const Renders = {
    name: 'renders',
    play: async (context) => runScenario(context, createCases, 'Renders'),
};
