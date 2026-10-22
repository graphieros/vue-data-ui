import { expect, waitFor } from 'storybook/test';
import {
    scenarioRender,
    runScenario,
    dispatch,
    visible,
} from '../support/scenario.js';
import { commonFeatures } from '../support/common.js';
import VueUiScatter from '../../src/components/vue-ui-scatter.vue';
import { components } from '../fixtures/components.js';
function createCases(env) {
    const { select, mountSubject, fixtures } = env;
    const cases = {};
    const hooks = [];
    const testCommonFeatures = commonFeatures(env);
    const { config, dataset } = components.find(
        (c) => c.name === 'VueUiScatter',
    );
    cases.Renders = async () => {
        {
            const mounted = await mountSubject(VueUiScatter, {
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
                    dataTable: true,
                    legend: true,
                    tooltipCallback: async () => {
                        {
                            let read = () => select('[data-cy="atom-shape"]');
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
                            await dispatch(read(), 'mouseover', {
                                force: true,
                            });
                        }
                    },
                });
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="marginal-bar-x"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(20);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="marginal-bar-y"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(20);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select(
                            '[data-cy="marginal-line-x-wrapper"]',
                        );
                        expect(elements).not.toHaveLength(0);
                        expect(
                            getComputedStyle(elements[0]).getPropertyValue(
                                'opacity',
                            ),
                        ).toBe(String('1'));
                    });
                } // A uniform distribution draws a valid flat stroked path.
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="marginal-line-x"]');
                        expect(elements[0].hasAttribute('d')).toBe(true);
                        expect(elements.length).toBeGreaterThan(0);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select(
                            '[data-cy="marginal-line-y-wrapper"]',
                        );
                        expect(elements).not.toHaveLength(0);
                        expect(
                            getComputedStyle(elements[0]).getPropertyValue(
                                'opacity',
                            ),
                        ).toBe(String('1'));
                    });
                } // A uniform distribution draws a valid flat stroked path.
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="marginal-line-y"]');
                        expect(elements[0].hasAttribute('d')).toBe(true);
                        expect(elements.length).toBeGreaterThan(0);
                    });
                }
                {
                    let read = () => select('[data-cy="atom-shape"]');
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
                    await dispatch(read(), 'mouseover', {
                        force: true,
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="selector-line-x"]');
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
                        const elements = select('[data-cy="selector-line-y"]');
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
                        const elements = select('[data-cy="selector-label-x"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(
                            elements.map((e) => e.textContent).join(''),
                        ).toContain(String(dataset[0].values[0].x));
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="selector-label-y"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(
                            elements.map((e) => e.textContent).join(''),
                        ).toContain(String(dataset[0].values[0].y));
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select(
                            '[data-cy="selector-circle-marker"]',
                        );
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(2);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select(
                            '[data-cy="selector-datapoint-name"]',
                        );
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(
                            elements.map((e) => e.textContent).join(''),
                        ).toContain(String(dataset[0].values[0].name));
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select(
                            '[data-cy="scatter-x-label-name"]',
                        );
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(
                            elements.map((e) => e.textContent).join(''),
                        ).toContain(
                            String(config.style.layout.dataLabels.xAxis.name),
                        );
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select(
                            '[data-cy="scatter-x-min-axis-label"]',
                        );
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(
                            elements.map((e) => e.textContent).join(''),
                        ).toContain(
                            String(
                                Math.min(
                                    ...dataset.flatMap((ds) =>
                                        ds.values.map((d) => d.x),
                                    ),
                                ),
                            ),
                        );
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select(
                            '[data-cy="scatter-x-max-axis-label"]',
                        );
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(
                            elements.map((e) => e.textContent).join(''),
                        ).toContain(
                            String(
                                Math.max(
                                    ...dataset.flatMap((ds) =>
                                        ds.values.map((d) => d.x),
                                    ),
                                ),
                            ),
                        );
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select(
                            '[data-cy="scatter-y-label-name"]',
                        );
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(
                            elements.map((e) => e.textContent).join(''),
                        ).toContain(
                            String(config.style.layout.dataLabels.yAxis.name),
                        );
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select(
                            '[data-cy="scatter-y-min-axis-label"]',
                        );
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(
                            elements.map((e) => e.textContent).join(''),
                        ).toContain(
                            String(
                                Math.min(
                                    ...dataset.flatMap((ds) =>
                                        ds.values.map((d) => d.y),
                                    ),
                                ),
                            ),
                        );
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="correlation-line"]');
                        expect(elements).not.toHaveLength(0);
                        expect(
                            getComputedStyle(elements[0]).getPropertyValue(
                                'opacity',
                            ),
                        ).toBe(String('1'));
                        expect(elements).toHaveLength(dataset.length);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select(
                            '[data-cy="correlation-label"]',
                        );
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(dataset.length);
                        expect(
                            elements.map((e) => e.textContent).join(''),
                        ).toContain(String(1));
                    });
                }
            }
        }
    };
    cases.UsesPerformanceMode = async () => {
        {
            const mounted = await mountSubject(VueUiScatter, {
                props: {
                    dataset,
                    config: {
                        ...config,
                        usePerformanceMode: true,
                    },
                },
            });
            let read = () => mounted;
            {
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="performance-path"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(2);
                    });
                }
                await testCommonFeatures({
                    userOptions: true,
                    title: true,
                    subtitle: true,
                    dataTable: true,
                    legend: true,
                    tooltipCallback: async () => {
                        {
                            let read = () =>
                                select('[data-cy="performance-trap"]');
                            await waitFor(() =>
                                expect(read().length).toBeGreaterThan(0),
                            );
                            const path = select(
                                '[data-cy="performance-path"]',
                            )[0];
                            const point = path
                                .getPointAtLength(0)
                                .matrixTransform(path.getScreenCTM());
                            await dispatch(read(), 'mousemove', {
                                clientX: point.x,
                                clientY: point.y,
                            });
                        }
                    },
                });
                {
                    await waitFor(() => {
                        const elements = select(
                            '[data-cy="performance-selected-plot"]',
                        );
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
    title: 'Charts/VueUiScatter/Interactions',
    render: scenarioRender,
};
export const Renders = {
    name: 'renders',
    play: async (context) => runScenario(context, createCases, 'Renders'),
};
export const UsesPerformanceMode = {
    name: 'uses performance mode',
    play: async (context) =>
        runScenario(context, createCases, 'UsesPerformanceMode'),
};
