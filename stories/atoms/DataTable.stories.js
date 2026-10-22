import { expect, waitFor } from 'storybook/test';
import {
    scenarioRender,
    runScenario,
    clickElements,
} from '../support/scenario.js';
import { defineComponent, reactive, ref } from 'vue';
import DataTable from '../../src/atoms/DataTable.vue';
function createCases(env) {
    const { select, mountSubject, resize, currentWrapper } = env;
    const cases = {};
    const hooks = [];
    cases.RendersCorrectlyWithSlots = async () => {
        {
            await resize(800, 500);
        }
        {
            const mounted = await mountSubject(
                defineComponent({
                    components: {
                        DataTable,
                    },
                    setup() {
                        const colNames = reactive([
                            'Column 1',
                            'Column 2',
                            'Column 3',
                        ]);
                        const head = reactive([
                            {
                                name: 'Header 1',
                                color: '#FF0000',
                            },
                            {
                                name: 'Header 2',
                                color: '#00FF00',
                            },
                            {
                                name: 'Header 3',
                                color: '#0000FF',
                            },
                        ]);
                        const body = reactive([
                            [
                                {
                                    name: 'Row 1 - Col 1',
                                },
                                {
                                    name: 'Row 1 - Col 2',
                                },
                                {
                                    name: 'Row 1 - Col 3',
                                },
                            ],
                            [
                                {
                                    name: 'Row 2 - Col 1',
                                },
                                {
                                    name: 'Row 2 - Col 2',
                                },
                                {
                                    name: 'Row 2 - Col 3',
                                },
                            ],
                        ]);
                        const config = reactive({
                            th: {
                                backgroundColor: '#f0f0f0',
                                color: '#000',
                                outline: '1px solid #ccc',
                            },
                            td: {
                                backgroundColor: '#fff',
                                color: '#333',
                                outline: '1px solid #ddd',
                            },
                            shape: 'circle',
                            breakpoint: 600,
                        });
                        const closeEmitted = ref(false);
                        return {
                            colNames,
                            head,
                            body,
                            config,
                            closeEmitted,
                        };
                    },
                    template: `
                <DataTable 
                    :colNames="colNames" 
                    :head="head" 
                    :body="body" 
                    title="Test Table"
                    :config="config"
                    @close="closeEmitted = true"
                >
                    <template #th="{ th }">
                        <span data-cy="th">{{ th.name }}</span>
                    </template>
                    <template #td="{ td }">
                        <span data-cy="td">{{ td.name }}</span>
                    </template>
                </DataTable>
            `,
                }),
            );
            let read = () => mounted;
        }
        {
            await waitFor(() => {
                const elements = select('[data-cy="vue-data-ui-table-data"]');
                expect(elements).not.toHaveLength(0);
            });
        }
        {
            await waitFor(() => {
                const elements = select('caption');
                expect(elements.map((e) => e.textContent).join('')).toContain(
                    String('Test Table'),
                );
            });
        }
        {
            await waitFor(() => {
                const elements = select('[data-cy="th"]');
                expect(elements).toHaveLength(3);
            });
        }
        {
            let read = () => select('[data-cy="th"]');
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
                ).toContain(String('Header 1'));
            });
        }
        {
            await waitFor(() => {
                const elements = select('[data-cy="td"]');
                expect(elements).toHaveLength(6);
            });
        }
        {
            let read = () => select('[data-cy="td"]');
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
                ).toContain(String('Row 1 - Col 1'));
            });
        }
        {
            let read = () => select('[role="button"]');
            await waitFor(() => expect(read().length).toBeGreaterThan(0));
            await clickElements(read());
        }
        {
            await waitFor(() => {
                const elements = select('[data-cy="th"]');
                expect(elements).not.toHaveLength(0);
            });
        }
        {
            await resize(500, 350);
        }
        {
            await waitFor(() => {
                const elements = select('th');
                elements.forEach((element) =>
                    expect(element).not.toBeVisible(),
                );
            });
        }
        {
            let read = () => select('td');
            {
                const previous = read;
                read = () => {
                    const element = previous().at(0);
                    return element ? [element] : [];
                };
            }
            await waitFor(() => {
                expect(read()[0].getAttribute('data-cell')).toBe(
                    String('Column 1'),
                );
            });
        }
        {
            let read = () => select('[data-cy="data-table-close"]');
            await waitFor(() => expect(read().length).toBeGreaterThan(0));
            await clickElements(read());
        }
        {
            let read = () => null;
            {
                expect(currentWrapper().vm.closeEmitted).to.be.true;
            }
        }
    };
    return {
        cases,
        hooks,
    };
}
export default {
    title: 'Internal/DataTable/Interactions',
    render: scenarioRender,
};
export const RendersCorrectlyWithSlots = {
    name: 'renders correctly with slots',
    play: async (context) =>
        runScenario(context, createCases, 'RendersCorrectlyWithSlots'),
};
