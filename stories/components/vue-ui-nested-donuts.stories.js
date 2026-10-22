import { expect, waitFor } from 'storybook/test';
import {
    scenarioRender,
    runScenario,
    dispatch,
    clickElements,
    visible,
} from '../support/scenario.js';
import { commonFeatures } from '../support/common.js';
import VueUiNestedDonuts from '../../src/components/vue-ui-nested-donuts.vue';
import { components } from '../fixtures/components.js';
import '../../src/lib';
function createCases(env) {
    const { aliases, select, mountSubject, resize, spy, fixtures } = env;
    const cases = {};
    const hooks = [];
    const storeAlias = (name, value) => {
        aliases.set(name, () => value);
        return value;
    };
    const testCommonFeatures = commonFeatures(env);
    const { dataset, config } = components.find(
        (c) => c.name === 'VueUiNestedDonuts',
    );
    cases.Renders = async () => {
        {
            await resize(500, 650);
        }
        {
            const mounted = await mountSubject(VueUiNestedDonuts, {
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
                        const elements = select('[data-cy="datapoint-arc"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(
                            dataset
                                .map((d) => d.series.length)
                                .reduce((a, b) => a + b, 0),
                        );
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="donut-gradient"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(dataset.length);
                    });
                }
                {
                    let read = () => select('[data-cy="datapoint-name"]');
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
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
                        const elements = select(
                            '[data-cy="datapoint-percentage"]',
                        );
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(
                            elements.map((e) => e.textContent).join(''),
                        ).toContain(String('%'));
                        expect(elements).toHaveLength(
                            dataset
                                .map((d) => d.series.length)
                                .reduce((a, b) => a + b, 0),
                        );
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="datapoint-value"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(
                            dataset
                                .map((d) => d.series.length)
                                .reduce((a, b) => a + b, 0),
                        );
                    });
                }
            }
        }
    };
    cases.Emits = async () => {
        const onSelectLegend = storeAlias('onSelectLegend', spy());
        const onSelectDatapoint = storeAlias('onSelectDatapoint', spy());
        {
            const mounted = await mountSubject(VueUiNestedDonuts, {
                props: {
                    dataset,
                    config,
                    onSelectLegend,
                    onSelectDatapoint,
                },
            });
            let read = () => mounted;
            {
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
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
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
                                'arcOf',
                                'arcOfId',
                                'arcSlice',
                                'center',
                                'color',
                                'cx',
                                'cy',
                                'datasetIndex',
                                'endX',
                                'endY',
                                'firstSeparator',
                                'id',
                                'name',
                                'path',
                                'proportion',
                                'ratio',
                                'separator',
                                'seriesIndex',
                                'startX',
                                'startY',
                                'value',
                            );
                            expect(payload.datapoint.datasetIndex).to.equal(0);
                            expect(payload.datapoint.seriesIndex).to.equal(1);
                        })(read()),
                    );
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
    title: 'Charts/VueUiNestedDonuts/Interactions',
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
