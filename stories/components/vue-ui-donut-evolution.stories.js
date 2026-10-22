import { expect, waitFor } from 'storybook/test';
import {
    scenarioRender,
    runScenario,
    dispatch,
    clickElements,
    visible,
} from '../support/scenario.js';
import { commonFeatures } from '../support/common.js';
import VueUiDonutEvolution from '../../src/components/vue-ui-donut-evolution.vue';
import { components } from '../fixtures/components.js';
function createCases(env) {
    const { aliases, select, mountSubject, resize, fixtures } = env;
    const cases = {};
    const hooks = [];
    const testCommonFeatures = commonFeatures(env);
    const { dataset, config } = components.find(
        (c) => c.name === 'VueUiDonutEvolution',
    );
    cases.Renders = async () => {
        {
            await resize(800, 800);
        }
        {
            const mounted = await mountSubject(VueUiDonutEvolution, {
                props: {
                    dataset,
                    config,
                },
            });
            let read = () => mounted;
            {
                const { wrapper } = read();
                await testCommonFeatures({
                    userOptions: true,
                    title: true,
                    subtitle: true,
                    dataTable: true,
                    slicer: true,
                });
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="axis-y"]');
                        expect(elements).not.toHaveLength(0);
                        expect(
                            getComputedStyle(elements[0]).getPropertyValue(
                                'opacity',
                            ),
                        ).toBe(String('1'));
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="axis-x"]');
                        expect(elements).not.toHaveLength(0);
                        expect(
                            getComputedStyle(elements[0]).getPropertyValue(
                                'opacity',
                            ),
                        ).toBe(String('1'));
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select(
                            '[data-cy="vertical-separator"]',
                        );
                        expect(elements).not.toHaveLength(0);
                        expect(
                            getComputedStyle(elements[0]).getPropertyValue(
                                'opacity',
                            ),
                        ).toBe(String('1'));
                        expect(elements).toHaveLength(
                            Math.max(...dataset.map((d) => d.values.length)),
                        );
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="axis-y-tick"]');
                        expect(elements).not.toHaveLength(0);
                        expect(
                            getComputedStyle(elements[0]).getPropertyValue(
                                'opacity',
                            ),
                        ).toBe(String('1'));
                        expect(elements).toHaveLength(7);
                    });
                }
                {
                    let read = () => select('[data-cy="axis-y-label"]');
                    aliases.set('yLabels', read);
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                    await waitFor(() => {
                        expect(read()).toHaveLength(7);
                    });
                }
                {
                    let read = aliases.get('yLabels');
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
                        ).toContain(String(0));
                    });
                }
                {
                    let read = aliases.get('yLabels');
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
                        ).toContain(String(300));
                    });
                }
                {
                    let read = () => select('[data-cy="axis-x-label"]');
                    aliases.set('xLabels', read);
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                    await waitFor(() => {
                        expect(read()).toHaveLength(
                            config.style.chart.layout.grid.xAxis.dataLabels
                                .values.length,
                        );
                    });
                }
                {
                    let read = aliases.get('xLabels');
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
                        ).toContain(
                            String(
                                config.style.chart.layout.grid.xAxis.dataLabels
                                    .values[0],
                            ),
                        );
                    });
                }
                {
                    let read = aliases.get('xLabels');
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
                        ).toContain(
                            String(
                                config.style.chart.layout.grid.xAxis.dataLabels.values.at(
                                    -1,
                                ),
                            ),
                        );
                    });
                }
                {
                    let read = () => select('[data-cy-trap]');
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
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="draggable-dialog"]');
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                    });
                }
                {
                    let read = () =>
                        select('[data-cy="draggable-dialog-close"]');
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await clickElements(read(), {
                        force: true,
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="draggable-dialog"]');
                        expect(elements).toHaveLength(0);
                    });
                }
                {
                    let read = () => select('[data-cy="legend-item"]');
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
                            await waitFor(() => {
                                const elements = select(`[data-cy="arc_0"]`);
                                expect(elements).toHaveLength(3);
                            });
                        }
                        expect(wrapper.emitted('selectLegend')).to.exist;
                        {
                            let read = () => select('[data-cy="legend-item"]');
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
                        }
                        {
                            await waitFor(() => {
                                const elements = select(`[data-cy="arc_0"]`);
                                expect(elements).toHaveLength(4);
                            });
                        }
                    }
                }
                {
                    let read = () => select('[data-cy-trap]');
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
                        const elements = select('[data-cy="donut_hover_0"]');
                        expect(elements).toHaveLength(3);
                    });
                }
                {
                    let read = () => select('[data-cy-trap]');
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
                    await dispatch(read(), 'mouseleave');
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="donut_hover_0"]');
                        expect(elements).toHaveLength(0);
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
    title: 'Charts/VueUiDonutEvolution/Interactions',
    render: scenarioRender,
};
export const Renders = {
    name: 'renders',
    play: async (context) => runScenario(context, createCases, 'Renders'),
};
