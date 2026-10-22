import { expect, waitFor } from 'storybook/test';
import {
    scenarioRender,
    runScenario,
    dispatch,
    clickElements,
    visible,
} from '../support/scenario.js';
import { commonFeatures } from '../support/common.js';
import VueUiStripPlot from '../../src/components/vue-ui-strip-plot.vue';
import { components } from '../fixtures/components.js';
function createCases(env) {
    const { aliases, select, mountSubject, resize, fixtures } = env;
    const cases = {};
    const hooks = [];
    const testCommonFeatures = commonFeatures(env);
    const { dataset, config } = components.find(
        (c) => c.name === 'VueUiStripPlot',
    );
    cases.Renders = async () => {
        {
            await resize(300, 610);
        }
        {
            const mounted = await mountSubject(VueUiStripPlot, {
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
                            await dispatch(read(), 'mouseenter', {
                                force: true,
                            });
                        }
                    },
                });
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="grid-horizontal"]');
                        expect(elements).not.toHaveLength(0);
                        expect(
                            getComputedStyle(elements[0]).getPropertyValue(
                                'opacity',
                            ),
                        ).toBe(String('1'));
                        expect(elements).toHaveLength(6);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="grid-vertical"]');
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
                        expect(read()).toHaveLength(6);
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
                        ).toContain(String(25));
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
                        expect(read()).toHaveLength(dataset.length);
                    });
                }
                {
                    let read = aliases.get('xLabels');
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
                                        ).toContain(String(dataset[i].name));
                                    });
                                }
                            })([items[index]], index, items);
                        }
                    }
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="axis-y-name"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(
                            elements.map((e) => e.textContent).join(''),
                        ).toContain(
                            String(config.style.chart.labels.axis.yLabel),
                        );
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="axis-x-name"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(
                            elements.map((e) => e.textContent).join(''),
                        ).toContain(
                            String(config.style.chart.labels.axis.xLabel),
                        );
                    });
                }
                {
                    let read = () => select('[data-cy="atom-shape"]');
                    {
                        const previous = read;
                        read = () => {
                            const element = previous().at(2);
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
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="selection-line"]');
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
                            '[data-cy="selection-marker-circle-left"]',
                        );
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select(
                            '[data-cy="selection-marker-circle-right"]',
                        );
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
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
                                .map((d) => d.plots.length)
                                .reduce((a, b) => a + b, 0) * 2,
                        );
                    });
                }
                {
                    let read = () => select('[data-cy="best-plot-label"]');
                    aliases.set('bestPlotLabels', read);
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read()).toHaveLength(dataset.length);
                    });
                }
                {
                    let read = aliases.get('bestPlotLabels');
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
                                        ).toContain(
                                            String(
                                                dataset[i].plots.reduce(
                                                    (max, o) =>
                                                        o.value > max.value
                                                            ? o
                                                            : max,
                                                    dataset[i].plots[0],
                                                ).name,
                                            ),
                                        );
                                    });
                                }
                                {
                                    await waitFor(() => {
                                        const elements = label;
                                        expect(
                                            elements
                                                .map((e) => e.textContent)
                                                .join(''),
                                        ).toContain(
                                            String(
                                                dataset[i].plots
                                                    .reduce(
                                                        (max, o) =>
                                                            o.value > max.value
                                                                ? o
                                                                : max,
                                                        dataset[i].plots[0],
                                                    )
                                                    .value.toFixed(0),
                                            ),
                                        );
                                    });
                                }
                            })([items[index]], index, items);
                        }
                    }
                }
            }
        }
    };
    cases.Emits = async () => {
        {
            const mounted = await mountSubject(VueUiStripPlot, {
                props: {
                    dataset,
                    config,
                },
            });
            let read = () => mounted;
            {
                const { wrapper } = read();
                {
                    let read = () => select('circle');
                    {
                        const previous = read;
                        read = () => {
                            const element = previous().at(8);
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
                            'id',
                            'name',
                            'parentId',
                            'parentName',
                            'parentIndex',
                            'plotIndex',
                            'value',
                            'x',
                            'y',
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
    title: 'Charts/VueUiStripPlot/Interactions',
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
