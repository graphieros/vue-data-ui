import { expect, waitFor, fireEvent } from 'storybook/test';
import {
    scenarioRender,
    runScenario,
    dispatch,
    clickElements,
    visible,
} from '../support/scenario.js';
import { commonFeatures } from '../support/common.js';
import VueUiRadar from '../../src/components/vue-ui-radar.vue';
import { components } from '../fixtures/components.js';
function createCases(env) {
    const { aliases, select, mountSubject, fixtures } = env;
    const cases = {};
    const hooks = [];
    const testCommonFeatures = commonFeatures(env);
    const { config, dataset } = components.find((c) => c.name === 'VueUiRadar');
    cases.Renders = async () => {
        {
            const mounted = await mountSubject(VueUiRadar, {
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
                    legend: true,
                    dataTable: true,
                    tooltipCallback: async () => {
                        {
                            let read = () => select('[data-cy="label-apex"]');
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
                        const elements = select('[data-cy="radial-line"]');
                        expect(elements).not.toHaveLength(0);
                        expect(
                            getComputedStyle(elements[0]).getPropertyValue(
                                'opacity',
                            ),
                        ).toBe(String('1'));
                        expect(elements).toHaveLength(dataset.series.length);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="polygon-inner"]');
                        expect(elements).not.toHaveLength(0);
                        expect(
                            getComputedStyle(elements[0]).getPropertyValue(
                                'opacity',
                            ),
                        ).toBe(String('1'));
                        expect(elements).toHaveLength(
                            config.style.chart.layout.grid.graduations,
                        );
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="polygon-outer"]');
                        expect(elements).not.toHaveLength(0);
                        expect(
                            getComputedStyle(elements[0]).getPropertyValue(
                                'opacity',
                            ),
                        ).toBe(String('1'));
                    });
                }
                {
                    let read = () => select('[data-cy="label-apex"]');
                    aliases.set('apexLabels', read);
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                    await waitFor(() => {
                        expect(read()).toHaveLength(dataset.series.length);
                    });
                }
                {
                    let read = aliases.get('apexLabels');
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
                                            String(dataset.series[i].name),
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
                            '[data-cy="polygon-datapoint-wrapper"]',
                        );
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(
                            dataset.categories.length,
                        );
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select(
                            '[data-cy="polygon-datapoint"]',
                        );
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(
                            dataset.categories.length,
                        );
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="datapoint-circle"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(
                            dataset.categories.length * dataset.series.length,
                        );
                    });
                }
            }
        }
    };
    cases.Emits = async () => {
        {
            const mounted = await mountSubject(VueUiRadar, {
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
                    await clickElements(read());
                    {
                        expect(wrapper.emitted('selectLegend')).to.exist;
                    }
                }
            }
        }
    };
    cases.LiveUpdates = async () => {
        let enterCount = 0;
        let formatCount = 0;
        const data = {
            categories: [{ name: 'A' }, { name: 'B' }],
            series: [
                { name: 'First', values: [2, 4], target: 10 },
                { name: 'Second', values: [6, 8], target: 10 },
                { name: 'Third', values: [8, 2], target: 10 },
            ],
        };
        const cfg = {
            events: { datapointEnter: () => enterCount++ },
            style: {
                chart: {
                    tooltip: {
                        customFormat: ({ datapoint }) => {
                            formatCount++;
                            return datapoint.name;
                        },
                    },
                },
            },
        };
        const { wrapper } = await mountSubject(VueUiRadar, {
            props: { dataset: data, config: cfg },
        });
        wrapper.vm.hideSeries('B');
        await waitFor(() =>
            expect(
                wrapper.findAll('[data-cy="polygon-datapoint"]'),
            ).toHaveLength(1),
        );
        const svg = wrapper.find('svg').element;
        svg.focus();
        await fireEvent.keyDown(svg, { key: 'ArrowRight' });
        await waitFor(() => expect(formatCount).toBe(1));
        await fireEvent.keyDown(svg, { key: 'ArrowDown' });
        await waitFor(() => expect(formatCount).toBe(2));
        expect(enterCount).toBe(2);
        await wrapper.setProps({
            dataset: {
                categories: [...data.categories].reverse(),
                series: [data.series[1], data.series[0], data.series[2]].map(
                    (row) => ({ ...row, values: [...row.values].reverse() }),
                ),
            },
        });
        await waitFor(() => {
            const tooltip = wrapper.findComponent({ name: 'Tooltip' });
            expect(tooltip.props('content')).toBe('Second');
            const box = svg.getBoundingClientRect();
            const label = wrapper.find('[data-cy="label-apex"]');
            expect(tooltip.props('a11yPosition').x).toBeCloseTo(
                box.left + (Number(label.attributes('x')) / 512) * box.width,
                1,
            );
            expect(tooltip.props('a11yPosition').y).toBeCloseTo(
                box.top + (Number(label.attributes('y')) / 312) * box.height,
                1,
            );
        });
        expect(
            wrapper.find('[data-cy="polygon-datapoint"]').attributes('stroke'),
        ).toBe(wrapper.vm.getData()[1].color);
        expect(enterCount).toBe(2);
        await wrapper.setProps({
            config: {
                ...cfg,
                style: {
                    chart: {
                        ...cfg.style.chart,
                        layout: {
                            labels: { dataLabels: { fontSize: 24 } },
                            grid: { rotation: 30 },
                        },
                    },
                },
            },
        });
        await waitFor(() =>
            expect(
                wrapper.find('[data-cy="label-apex"]').attributes('font-size'),
            ).toBe('24'),
        );
        expect(enterCount).toBe(2);
        await wrapper.setProps({
            dataset: {
                categories: [...data.categories].reverse(),
                series: [
                    data.series[1],
                    {
                        ...data.series[0],
                        name: 'A deliberately long axis label for fitting',
                    },
                    data.series[2],
                ].map((row) => ({ ...row, values: [...row.values].reverse() })),
            },
        });
        await waitFor(() => {
            const labels = wrapper.findAll('[data-cy="label-apex"]');
            expect(labels[0].attributes('font-size')).toBe('24');
            expect(Number(labels[1].attributes('font-size'))).toBeLessThan(24);
            expect(
                Number(labels[1].attributes('font-size')),
            ).toBeGreaterThanOrEqual(6);
        });
        for (const polygon of wrapper.findAll(
            '[data-cy="polygon-datapoint"]',
        )) {
            const fill = polygon.attributes('fill');
            expect(fill).toMatch(/^url\(#/);
            expect(wrapper.find(`[id="${fill.slice(5, -1)}"]`).exists()).toBe(
                true,
            );
        }
        await wrapper.setProps({
            dataset: { ...data, series: [data.series[0], data.series[2]] },
        });
        await waitFor(() =>
            expect(
                wrapper.findComponent({ name: 'Tooltip' }).props('show'),
            ).toBe(false),
        );
        expect(wrapper.find('svg').html()).not.toMatch(/NaN|Infinity/);
    };
    return {
        cases,
        hooks,
    };
}
export default {
    title: 'Charts/VueUiRadar/Interactions',
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
    name: 'keeps legend, keyboard tooltips and label fitting synchronized',
    play: async (context) => runScenario(context, createCases, 'LiveUpdates'),
};
