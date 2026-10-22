import { expect, waitFor } from 'storybook/test';
import {
    scenarioRender,
    runScenario,
    clickElements,
} from '../support/scenario.js';
import { defineComponent, h, reactive, ref } from 'vue';
import Legend from '../../src/atoms/Legend.vue';
function createCases(env) {
    const { aliases, select, mountSubject, spy } = env;
    const cases = {};
    const hooks = [];
    const storeAlias = (name, value) => {
        aliases.set(name, () => value);
        return value;
    };
    const legend = [
        {
            name: 'circle',
            color: '#F00000',
            value: 1,
            shape: 'circle',
        },
        {
            name: 'triangle',
            color: '#00FF00',
            value: 2,
            shape: 'triangle',
        },
        {
            name: 'square',
            color: '#0000FF',
            value: 3,
            shape: 'square',
        },
        {
            name: 'diamond',
            color: '#F0FF00',
            value: 4,
            shape: 'diamond',
        },
        {
            name: 'pentagon',
            color: '#F000F0',
            value: 6,
            shape: 'pentagon',
        },
        {
            name: 'hexagon',
            color: '#FF99AA',
            value: 7,
            shape: 'hexagon',
        },
        {
            name: 'star',
            color: '#66AA66',
            value: 8,
            shape: 'star',
        },
        {
            name: 'gradient',
            color: '#66AA66',
            value: 8,
            shape: 'circle',
            gradientColors: ['#FF0000', '#00FF00'],
        },
    ];
    cases.RendersCorrectlyWithSlots = async () => {
        {
            const mounted = await mountSubject(
                defineComponent({
                    components: {
                        Legend,
                    },
                    setup() {
                        const legendSet = legend;
                        const leg = ref(null);
                        const config = reactive({
                            backgroundColor: '#fff',
                            fontSize: 14,
                            color: '#333',
                            paddingBottom: 12,
                            cy: 'legend-container',
                        });
                        return {
                            legendSet,
                            config,
                            leg,
                        };
                    },
                    template: `
                <Legend ref="leg" :legendSet="legendSet" :config="config">
                    <template #legendTitle>
                        <div data-cy="legend-title" style="width:100%;text-align:center;font-weight:bold;padding:1rem">Legend Title</div>
                    </template>
                    <template #item="{ legend }">
                        <div data-cy="legend-item">{{ legend.name }} - value:{{ legend.value }}</div>
                    </template>
                </Legend>
            `,
                }),
            );
            let read = () => mounted;
            {
                const { wrapper } = read();
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="legend-title"]');
                        expect(elements).not.toHaveLength(0);
                        expect(
                            elements.map((e) => e.textContent).join(''),
                        ).toContain(String('Legend Title'));
                    });
                }
                {
                    let read = () => select('[data-cy="legend-item"]');
                    aliases.set('items', read);
                    await waitFor(() => {
                        expect(read()).toHaveLength(legend.length);
                    });
                }
                {
                    let read = aliases.get('items');
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
                                            String(
                                                `${legend[i].name} - value:${legend[i].value}`,
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
    cases.EmitsClickMarkerWithCorrectPayload = async () => {
        const config = {
            backgroundColor: '#fff',
            fontSize: 14,
            color: '#333',
            paddingBottom: 12,
            cy: 'legend-container',
        };
        const handlers = {
            onMarker: () => {},
        };
        storeAlias('onMarker', spy(handlers, 'onMarker'));
        {
            const mounted = await mountSubject(Legend, {
                props: {
                    legendSet: legend,
                    config,
                    onClickMarker: handlers.onMarker,
                },
                slots: {
                    legendTitle: () =>
                        h(
                            'div',
                            {
                                'data-cy': 'legend-title',
                                style: 'width:100%;text-align:center;font-weight:bold;padding:1rem',
                            },
                            'Legend Title',
                        ),
                    item: ({ legend: item }) =>
                        h(
                            'div',
                            {
                                'data-cy': 'legend-item',
                            },
                            `${item.name} - value:${item.value}`,
                        ),
                },
            });
            let read = () => mounted;
        }
        {
            await waitFor(() => {
                const elements = select('[data-cy="legend-marker"]');
                expect(elements).toHaveLength(legend.length);
            });
        }
        {
            let read = () => select('[data-cy="legend-marker"]');
            {
                const previous = read;
                read = () => {
                    const element = previous().at(0);
                    return element ? [element] : [];
                };
            }
            await waitFor(() => expect(read().length).toBeGreaterThan(0));
            await clickElements(read());
        }
        {
            let read = aliases.get('onMarker');
            await waitFor(() => {
                expect(read()).toHaveBeenCalledTimes(1);
            });
        }
        {
            let read = aliases.get('onMarker');
            {
                const previous = read;
                read = () =>
                    'mock.calls.0.0'
                        .split('.')
                        .reduce((value, key) => value?.[key], previous());
            }
            {
                const payload = read();
                expect(payload).to.have.property('i', 0);
                expect(payload.legend).to.include(legend[0]);
            }
        }
    };
    return {
        cases,
        hooks,
    };
}
export default {
    title: 'Internal/Legend/Interactions',
    render: scenarioRender,
};
export const RendersCorrectlyWithSlots = {
    name: 'renders correctly with slots',
    play: async (context) =>
        runScenario(context, createCases, 'RendersCorrectlyWithSlots'),
};
export const EmitsClickMarkerWithCorrectPayload = {
    name: 'emits clickMarker with correct payload',
    play: async (context) =>
        runScenario(context, createCases, 'EmitsClickMarkerWithCorrectPayload'),
};
