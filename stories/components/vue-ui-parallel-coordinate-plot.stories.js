import { expect, waitFor } from 'storybook/test';
import {
    scenarioRender,
    runScenario,
    dispatch,
    clickElements,
    visible,
} from '../support/scenario.js';
import { commonFeatures } from '../support/common.js';
import VueUiParallelCoordinatePlot from '../../src/components/vue-ui-parallel-coordinate-plot.vue';
import { components } from '../fixtures/components.js';
function createCases(env) {
    const { aliases, select, mountSubject, fixtures } = env;
    const cases = {};
    const hooks = [];
    const testCommonFeatures = commonFeatures(env);
    const { dataset, config } = components.find(
        (c) => c.name === 'VueUiParallelCoordinatePlot',
    );
    cases.Renders = async () => {
        {
            const mounted = await mountSubject(VueUiParallelCoordinatePlot, {
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
                            let read = () => select('[data-cy="tooltip-trap"]');
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
                            await dispatch(read(), 'mouseenter', {
                                force: true,
                            });
                        }
                    },
                });
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="pcp-axis"]');
                        expect(elements).not.toHaveLength(0);
                        expect(
                            getComputedStyle(elements[0]).getPropertyValue(
                                'opacity',
                            ),
                        ).toBe(String('1'));
                        expect(elements).toHaveLength(
                            Math.max(
                                ...dataset.flatMap((d) =>
                                    d.series.map((s) => s.values.length),
                                ),
                            ),
                        );
                    });
                }
                {
                    let read = () => select('[data-cy="pcp-axis-label"]');
                    aliases.set('axisLabels', read);
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                    await waitFor(() => {
                        expect(read()).toHaveLength(
                            Math.max(
                                ...dataset.flatMap((d) =>
                                    d.series.map((s) => s.values.length),
                                ),
                            ),
                        );
                    });
                }
                {
                    let read = aliases.get('axisLabels');
                    {
                        const items = read();
                        for (let index = 0; index < items.length; index++) {
                            await (async (label, i) => {
                                {
                                    await waitFor(() => {
                                        const elements = label;
                                        expect(
                                            elements
                                                .map((e) => e.textContent)
                                                .join(''),
                                        ).toContain(String(`Y-${i + 1}`));
                                    });
                                }
                            })([items[index]], index, items);
                        }
                    }
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="scale-tick"]');
                        expect(elements).not.toHaveLength(0);
                        expect(
                            getComputedStyle(elements[0]).getPropertyValue(
                                'opacity',
                            ),
                        ).toBe(String('1'));
                        expect(elements).toHaveLength(37);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="scale-label"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(37);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="atom-shape"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(
                            dataset
                                .flatMap((d) =>
                                    d.series.map((s) => s.values.length),
                                )
                                .reduce((a, b) => a + b, 0) +
                                2 /* legend shapes */,
                        );
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="plot-label"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(
                            dataset
                                .flatMap((d) =>
                                    d.series.map((s) => s.values.length),
                                )
                                .reduce((a, b) => a + b, 0),
                        );
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="datapoint-line"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(
                            dataset.flatMap((d) => d.series).length,
                        );
                    });
                }
            }
        }
    };
    cases.Emits = async () => {
        {
            const mounted = await mountSubject(VueUiParallelCoordinatePlot, {
                props: {
                    dataset,
                    config,
                },
            });
            let read = () => mounted;
            {
                const { wrapper } = read();
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
                    await clickElements(read(), {
                        force: true,
                    });
                    {
                        expect(wrapper.emitted('selectLegend')).to.exist;
                    }
                }
                {
                    let read = () => select('.vdui-shape-circle');
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
                    {
                        expect(wrapper.emitted('selectDatapoint')).to.exist;
                        expect(
                            wrapper.emitted('selectDatapoint')[0][0],
                        ).to.have.keys(
                            'color',
                            'datapoints',
                            'id',
                            'name',
                            'pathLength',
                            'smoothPath',
                            'straightPath',
                            'values',
                        );
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
    title: 'Charts/VueUiParallelCoordinatePlot/Interactions',
    render: scenarioRender,
};
export const Renders = {
    name: 'renders',
    play: async (context) => runScenario(context, createCases, 'Renders'),
};
export const Emits = {
    name: 'emits',
    play: async (context) => runScenario(context, createCases, 'Emits'),
};
