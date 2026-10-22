import { expect, waitFor } from 'storybook/test';
import { scenarioRender, runScenario, visible } from '../support/scenario.js';
import { commonFeatures } from '../support/common.js';
import { calcMedian } from '../../src/lib';
import VueUiTableHeatmap from '../../src/components/vue-ui-table-heatmap.vue';
import { h } from 'vue';
function createCases(env) {
    const { aliases, select, mountSubject } = env;
    const cases = {};
    const hooks = [];
    const testCommonFeatures = commonFeatures(env);
    const dataset = [
        {
            name: 'S1',
            values: [1, 1, 1],
            color: '#1f77b4',
            shape: 'circle',
        },
        {
            name: 'S2',
            values: [2, 2, 2],
            color: '#aec7e8',
            shape: 'triangle',
        },
        {
            name: 'S3',
            values: [3, 3, 3],
            color: '#ff7f0e',
            shape: 'diamond',
        },
    ];
    const config = {
        table: {
            showSum: true,
            showAverage: true,
            showMedian: true,
            head: {
                values: ['A', 'B', 'C', 'D', 's', 'a', 'm'],
            },
        },
    };
    cases.RendersWithSlots = async () => {
        {
            const mounted = await mountSubject(VueUiTableHeatmap, {
                props: {
                    dataset,
                    config,
                },
                slots: {
                    head: ({ value }) =>
                        h(
                            'div',
                            {
                                'data-cy': 'slot-head',
                            },
                            value,
                        ),
                    rowTitle: ({ value }) =>
                        h(
                            'div',
                            {
                                'data-cy': 'slot-row-title',
                            },
                            value,
                        ),
                    cell: ({ value, color, textColor }) =>
                        h(
                            'div',
                            {
                                'data-cy': 'slot-cell',
                                style: `background: ${color}; color: ${textColor}`,
                            },
                            value,
                        ),
                    sum: ({ value }) =>
                        h(
                            'div',
                            {
                                'data-cy': 'slot-sum',
                            },
                            value,
                        ),
                    average: ({ value }) =>
                        h(
                            'div',
                            {
                                'data-cy': 'slot-average',
                            },
                            value.toFixed(0),
                        ),
                    median: ({ value }) =>
                        h(
                            'div',
                            {
                                'data-cy': 'slot-median',
                            },
                            value.toFixed(0),
                        ),
                },
            });
            let read = () => mounted;
            {
                await testCommonFeatures({
                    userOptions: true,
                });
                {
                    let read = () => select('[data-cy="slot-head"]');
                    aliases.set('head', read);
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                    await waitFor(() => {
                        expect(read()).toHaveLength(
                            config.table.head.values.length,
                        );
                    });
                }
                {
                    let read = aliases.get('head');
                    {
                        const items = read();
                        for (let index = 0; index < items.length; index++) {
                            await (async (th, i) => {
                                {
                                    await waitFor(() => {
                                        const elements = th;
                                        expect(
                                            elements
                                                .map((e) => e.textContent)
                                                .join(''),
                                        ).toContain(
                                            String(config.table.head.values[i]),
                                        );
                                    });
                                }
                            })([items[index]], index, items);
                        }
                    }
                }
                {
                    let read = () => select('[data-cy="slot-row-title"]');
                    aliases.set('rowTitle', read);
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                }
                {
                    let read = aliases.get('rowTitle');
                    {
                        const items = read();
                        for (let index = 0; index < items.length; index++) {
                            await (async (rt, i) => {
                                {
                                    await waitFor(() => {
                                        const elements = rt;
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
                        const elements = select('[data-cy="slot-cell"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(
                            dataset.length * dataset[0].values.length,
                        );
                    });
                }
                {
                    let read = () => select('[data-cy="slot-sum"]');
                    aliases.set('sum', read);
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
                    let read = aliases.get('sum');
                    {
                        const items = read();
                        for (let index = 0; index < items.length; index++) {
                            await (async (s, i) => {
                                {
                                    await waitFor(() => {
                                        const elements = s;
                                        expect(
                                            elements
                                                .map((e) => e.textContent)
                                                .join(''),
                                        ).toContain(
                                            String(
                                                dataset[i].values.reduce(
                                                    (a, b) => a + b,
                                                    0,
                                                ),
                                            ),
                                        );
                                    });
                                }
                            })([items[index]], index, items);
                        }
                    }
                }
                {
                    let read = () => select('[data-cy="slot-average"]');
                    aliases.set('avg', read);
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
                    let read = aliases.get('avg');
                    {
                        const items = read();
                        for (let index = 0; index < items.length; index++) {
                            await (async (avg, i) => {
                                const average =
                                    dataset[i].values.reduce(
                                        (a, b) => a + b,
                                        0,
                                    ) / dataset[i].values.length;
                                {
                                    await waitFor(() => {
                                        const elements = avg;
                                        expect(
                                            elements
                                                .map((e) => e.textContent)
                                                .join(''),
                                        ).toContain(String(average.toFixed(0)));
                                    });
                                }
                            })([items[index]], index, items);
                        }
                    }
                }
                {
                    let read = () => select('[data-cy="slot-median"]');
                    aliases.set('med', read);
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
                    let read = aliases.get('med');
                    {
                        const items = read();
                        for (let index = 0; index < items.length; index++) {
                            await (async (med, i) => {
                                const median = calcMedian(dataset[i].values);
                                {
                                    await waitFor(() => {
                                        const elements = med;
                                        expect(
                                            elements
                                                .map((e) => e.textContent)
                                                .join(''),
                                        ).toContain(String(median.toFixed(0)));
                                    });
                                }
                            })([items[index]], index, items);
                        }
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
    title: 'Tables/VueUiTableHeatmap/Interactions',
    render: scenarioRender,
};
export const RendersWithSlots = {
    name: 'renders with slots',
    play: async (context) =>
        runScenario(context, createCases, 'RendersWithSlots'),
};
