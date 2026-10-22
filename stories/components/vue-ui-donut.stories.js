import { expect, waitFor } from 'storybook/test';
import {
    scenarioRender,
    runScenario,
    dispatch,
    clickElements,
    visible,
} from '../support/scenario.js';
import { commonFeatures } from '../support/common.js';
import VueUiDonut from '../../src/components/vue-ui-donut.vue';
import { components } from '../fixtures/components.js';
import { h } from 'vue';
function createCases(env) {
    const { aliases, select, mountSubject, spy, fixtures } = env;
    const cases = {};
    const hooks = [];
    const storeAlias = (name, value) => {
        aliases.set(name, () => value);
        return value;
    };
    const testCommonFeatures = commonFeatures(env);
    const { config, dataset } = components.find((c) => c.name === 'VueUiDonut');
    const total = dataset.flatMap((d) => d.values).reduce((a, b) => a + b, 0);
    const average = total / dataset.length;
    async function commonTest() {
        await testCommonFeatures({
            userOptions: true,
            title: true,
            subtitle: true,
            legend: true,
            dataTable: true,
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
        await testPlotComments();
    }
    async function testDataLabels(variation) {
        {
            await waitFor(() => {
                const elements = select(
                    `[data-cy="${variation}-label-marker"]`,
                );
                expect(elements).not.toHaveLength(0);
                expect(elements.length).toBeGreaterThan(0);
                expect(elements.some(visible)).toBe(true);
                expect(elements).toHaveLength(dataset.length);
            });
        }
        {
            let read = () => select(`[data-cy="${variation}-label-value"]`);
            aliases.set('values', read);
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
            let read = aliases.get('values');
            {
                const items = read();
                for (let index = 0; index < items.length; index++) {
                    await (async (val, i) => {
                        {
                            await waitFor(() => {
                                const elements = val;
                                expect(
                                    elements.map((e) => e.textContent).join(''),
                                ).toContain(
                                    String(
                                        dataset[i].values.reduce(
                                            (a, b) => a + b,
                                            0,
                                        ),
                                    ),
                                );
                                expect(
                                    elements.map((e) => e.textContent).join(''),
                                ).toContain(String('%'));
                            });
                        }
                    })([items[index]], index, items);
                }
            }
        }
        {
            let read = () => select(`[data-cy="${variation}-label-name"]`);
            aliases.set('names', read);
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
            let read = aliases.get('names');
            {
                const items = read();
                for (let index = 0; index < items.length; index++) {
                    await (async (name, i) => {
                        {
                            await waitFor(() => {
                                const elements = name;
                                expect(
                                    elements.map((e) => e.textContent).join(''),
                                ).toContain(String(dataset[i].name));
                            });
                        }
                    })([items[index]], index, items);
                }
            }
        }
    }
    async function testPlotComments() {
        {
            let read = () => select('[data-cy="slot-plot-comment"]');
            aliases.set('comments', read);
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
            let read = aliases.get('comments');
            {
                const items = read();
                for (let index = 0; index < items.length; index++) {
                    await (async (comment, i) => {
                        {
                            await waitFor(() => {
                                const elements = comment;
                                expect(
                                    elements.map((e) => e.textContent).join(''),
                                ).toContain(String(dataset[i].comment));
                            });
                        }
                    })([items[index]], index, items);
                }
            }
        }
    }
    async function testEmits() {
        {
            let read = () => select('[data-cy="legend-item"]');
            {
                const previous = read;
                read = () => {
                    const element = previous().at(0);
                    return element ? [element] : [];
                };
            }
            await waitFor(() => expect(read().length).toBeGreaterThan(0));
            await clickElements(read(), {
                force: true,
            });
        }
        {
            let read = aliases.get('onSelectLegend');
            await waitFor(() => {
                expect(read()).toHaveBeenCalled();
            });
        }
        {
            let read = () => select('[data-cy="tooltip-trap"]');
            {
                const previous = read;
                read = () => {
                    const element = previous().at(0);
                    return element ? [element] : [];
                };
            }
            await waitFor(() => expect(read().length).toBeGreaterThan(0));
            await clickElements(read(), {
                force: true,
            });
        }
        {
            let read = aliases.get('onSelectDatapoint');
            await waitFor(() =>
                ((spy) => {
                    expect(spy).toHaveBeenCalled();
                    const payload = {
                        args: spy.mock.calls[0],
                    }.args[0];
                    expect(payload).to.have.keys('datapoint', 'index');
                    expect(payload.index).to.equal(0);
                    expect(payload.datapoint).to.include.keys(
                        'absoluteValues',
                        'arcSlice',
                        'center',
                        'color',
                        'comment',
                        'cx',
                        'cy',
                        'endX',
                        'endY',
                        'firstSeparator',
                        'name',
                        'path',
                        'pattern',
                        'patternIndex',
                        'seriesIndex',
                        'proportion',
                        'ratio',
                        'separator',
                        'ghost',
                        'startX',
                        'startY',
                        'value',
                    );
                })(read()),
            );
        }
    }
    cases.RendersDonutDefaultVariation = async () => {
        const onSelectLegend = storeAlias('onSelectLegend', spy());
        const onSelectDatapoint = storeAlias('onSelectDatapoint', spy());
        {
            const mounted = await mountSubject(VueUiDonut, {
                props: {
                    dataset,
                    config,
                    onSelectLegend,
                    onSelectDatapoint,
                },
                slots: {
                    ['plot-comment']: ({ plot }) =>
                        h(
                            'div',
                            {
                                'data-cy': 'slot-plot-comment',
                            },
                            plot.comment,
                        ),
                },
            });
            let read = () => mounted;
            {
                const { wrapper } = read();
                await commonTest();
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="donut-arc"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(dataset.length);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="donut-shadow"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select(
                            '[data-cy="hollow-total-name"]',
                        );
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(
                            elements.map((e) => e.textContent).join(''),
                        ).toContain(String('Total'));
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select(
                            '[data-cy="hollow-total-value"]',
                        );
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(
                            elements.map((e) => e.textContent).join(''),
                        ).toContain(String(total.toFixed(0)));
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select(
                            '[data-cy="hollow-average-name"]',
                        );
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(
                            elements.map((e) => e.textContent).join(''),
                        ).toContain(String('Average'));
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select(
                            '[data-cy="hollow-average-value"]',
                        );
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(
                            elements.map((e) => e.textContent).join(''),
                        ).toContain(String(average.toFixed(0)));
                    });
                }
                await testDataLabels('donut');
                await testEmits(wrapper);
            }
        }
    };
    cases.RendersPolarVariation = async () => {
        const onSelectLegend = storeAlias('onSelectLegend', spy());
        const onSelectDatapoint = storeAlias('onSelectDatapoint', spy());
        {
            const mounted = await mountSubject(VueUiDonut, {
                props: {
                    dataset,
                    config: {
                        ...config,
                        type: 'polar',
                    },
                    onSelectLegend,
                    onSelectDatapoint,
                },
                slots: {
                    ['plot-comment']: ({ plot }) =>
                        h(
                            'div',
                            {
                                'data-cy': 'slot-plot-comment',
                            },
                            plot.comment,
                        ),
                },
            });
            let read = () => mounted;
            {
                const { wrapper } = read();
                await commonTest();
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="polar-datapoint"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(dataset.length);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="polar-shadow"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(dataset.length);
                    });
                }
                await testDataLabels('polar');
                await testEmits(wrapper);
            }
        }
    };
    return {
        cases,
        hooks,
    };
}
export default {
    title: 'Charts/VueUiDonut/Interactions',
    render: scenarioRender,
};
export const RendersDonutDefaultVariation = {
    name: 'renders donut default variation',
    play: async (context) =>
        runScenario(context, createCases, 'RendersDonutDefaultVariation'),
};
export const RendersPolarVariation = {
    name: 'renders polar variation',
    play: async (context) =>
        runScenario(context, createCases, 'RendersPolarVariation'),
};
