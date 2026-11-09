import { expect, waitFor, fireEvent } from 'storybook/test';
import {
    scenarioRender,
    runScenario,
    dispatch,
    clickElements,
    visible,
} from '../support/scenario.js';
import { commonFeatures } from '../support/common.js';
import VueUiHistoryPlot from '../../src/components/vue-ui-history-plot.vue';
import { components } from '../fixtures/components.js';
function createCases(env) {
    const { aliases, select, mountSubject, fixtures } = env;
    const cases = {};
    const hooks = [];
    const testCommonFeatures = commonFeatures(env);
    const { dataset, config } = components.find(
        (c) => c.name === 'VueUiHistoryPlot',
    );
    cases.Renders = async () => {
        {
            const mounted = await mountSubject(VueUiHistoryPlot, {
                props: {
                    config,
                    dataset,
                },
            });
            let read = () => mounted;
            {
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
                            await dispatch(read(), 'mouseenter');
                        }
                    },
                });
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="x-axis"]');
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
                        const elements = select('[data-cy="y-axis"]');
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
                            '[data-cy="grid-line-vertical"]',
                        );
                        expect(elements).not.toHaveLength(0);
                        expect(
                            getComputedStyle(elements[0]).getPropertyValue(
                                'opacity',
                            ),
                        ).toBe(String('1'));
                        expect(elements).toHaveLength(8);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select(
                            '[data-cy="grid-line-horizontal"]',
                        );
                        expect(elements).not.toHaveLength(0);
                        expect(
                            getComputedStyle(elements[0]).getPropertyValue(
                                'opacity',
                            ),
                        ).toBe(String('1'));
                        expect(elements).toHaveLength(9);
                    });
                }
                {
                    let read = () => select('[data-cy="y-axis-label"]');
                    aliases.set('yLabels', read);
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                    await waitFor(() => {
                        expect(read()).toHaveLength(9);
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
                        ).toContain(String('0'));
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
                        ).toContain(String('4'));
                    });
                }
                {
                    let read = () => select('[data-cy="x-axis-label"]');
                    aliases.set('xLabels', read);
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                    await waitFor(() => {
                        expect(read()).toHaveLength(8);
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
                        ).toContain(String('0'));
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
                        ).toContain(String('70'));
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="axis-name-y"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(
                            elements.map((e) => e.textContent).join(''),
                        ).toContain(
                            String(config.style.chart.axes.y.name.text),
                        );
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="axis-name-x"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(
                            elements.map((e) => e.textContent).join(''),
                        ).toContain(
                            String(config.style.chart.axes.x.name.text),
                        );
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select(
                            '[data-cy="datapoint-path-wrapper"]',
                        );
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(dataset.length);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="datapoint-path"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(dataset.length);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select(
                            '[data-cy="datapoint-plot-underlayer"]',
                        );
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(
                            dataset
                                .map((d) => d.values.length)
                                .reduce((a, b) => a + b, 0),
                        );
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="datapoint-plot"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(
                            dataset
                                .map((d) => d.values.length)
                                .reduce((a, b) => a + b, 0),
                        );
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="datapoint-label"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(
                            dataset
                                .map((d) => d.values.length)
                                .reduce((a, b) => a + b, 0),
                        );
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select(
                            '[data-cy="datapoint-index-label"]',
                        );
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(
                            dataset
                                .map((d) => d.values.length)
                                .reduce((a, b) => a + b, 0),
                        );
                    });
                }
            }
        }
    };
    cases.Emits = async () => {
        {
            const mounted = await mountSubject(VueUiHistoryPlot, {
                props: {
                    config,
                    dataset,
                },
            });
            let read = () => mounted;
            {
                const { wrapper } = read();
                {
                    let read = () => select('[data-cy="legend-item-0"]');
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
                    {
                        expect(wrapper.emitted('selectDatapoint')).to.exist;
                        expect(
                            wrapper.emitted('selectDatapoint')[0][0],
                        ).to.have.keys(
                            'color',
                            'id',
                            'label',
                            'seriesName',
                            'valueX',
                            'valueY',
                            'x',
                            'y',
                        );
                    }
                }
            }
        }
    };
    cases.LiveUpdates = async () => {
        let enterCount = 0;
        const data = [
            {
                id: 'a',
                name: 'A',
                temperatureColors: ['#0000ff', '#ff0000'],
                temperatureIndependant: true,
                temperatureAngle: 45,
                values: [
                    { id: 'first', label: 'First', x: 1, y: 2 },
                    { id: 'next', label: 'Next', x: 3, y: 4 },
                ],
            },
            { id: 'b', name: 'B', values: [{ label: 'Other', x: 2, y: 3 }] },
        ];
        const cfg = {
            events: { datapointEnter: () => enterCount++ },
            style: { chart: { plots: { gradient: { show: true } } } },
        };
        const { wrapper } = await mountSubject(VueUiHistoryPlot, {
            props: { dataset: data, config: cfg },
        });
        wrapper.vm.hideSeries('B');
        await waitFor(() =>
            expect(wrapper.findAll('[data-cy="tooltip-trap"]')).toHaveLength(2),
        );
        const svg = wrapper.find('svg').element;
        svg.focus();
        await fireEvent.keyDown(svg, { key: 'ArrowRight' });
        await fireEvent.keyDown(svg, { key: 'ArrowDown' });
        const selectedId = wrapper.vm.getData()[0].plots[1].id;
        const count = enterCount;
        await wrapper.setProps({
            dataset: [
                data[1],
                {
                    ...data[0],
                    values: [
                        { ...data[0].values[1], y: 10 },
                        data[0].values[0],
                    ],
                },
            ],
        });
        await waitFor(() =>
            expect(wrapper.vm.getData()[0].plots[0].id).toBe(selectedId),
        );
        expect(wrapper.vm.getData().map((d) => d.name)).toEqual(['A']);
        expect(enterCount).toBe(count);
        await wrapper.setProps({
            config: { ...cfg, style: { chart: { width: 800 } } },
        });
        await waitFor(() => {
            const position = wrapper
                .findComponent({ name: 'Tooltip' })
                .props('a11yPosition');
            const box = wrapper
                .find('[data-cy="datapoint-plot"]')
                .element.getBoundingClientRect();
            expect(position.x).toBeCloseTo(box.left + box.width / 2, 1);
            expect(position.y).toBeCloseTo(box.top + box.height / 2, 1);
        });
        expect(enterCount).toBe(count);
        for (const circle of wrapper.findAll('[data-cy="datapoint-plot"]')) {
            const fill = circle.attributes('fill');
            expect(fill).toMatch(/^url\(#/);
            expect(wrapper.find(`[id="${fill.slice(5, -1)}"]`).exists()).toBe(
                true,
            );
        }
        wrapper.vm.hideSeries('A');
        await waitFor(() =>
            expect(
                wrapper.findComponent({ name: 'Tooltip' }).props('show'),
            ).toBe(false),
        );
        expect(wrapper.findAll('[data-cy="datapoint-plot"]')).toHaveLength(0);
        expect(wrapper.find('svg').html()).not.toMatch(/NaN|Infinity/);
    };
    return {
        cases,
        hooks,
    };
}
export default {
    title: 'Charts/VueUiHistoryPlot/Interactions',
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

export const LiveUpdates = {
    name: 'preserves temperature paints and selection through live updates',
    play: async (context) => runScenario(context, createCases, 'LiveUpdates'),
};
