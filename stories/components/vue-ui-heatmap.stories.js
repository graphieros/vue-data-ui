import { expect, waitFor } from 'storybook/test';
import {
    scenarioRender,
    runScenario,
    dispatch,
    visible,
} from '../support/scenario.js';
import { commonFeatures } from '../support/common.js';
import VueUiHeatmap from '../../src/components/vue-ui-heatmap.vue';
import { components } from '../fixtures/components.js';
function createCases(env) {
    const { aliases, select, mountSubject, fixtures } = env;
    const cases = {};
    const hooks = [];
    const testCommonFeatures = commonFeatures(env);
    const { dataset, config } = components.find(
        (c) => c.name === 'VueUiHeatmap',
    );
    async function commonTest() {
        await testCommonFeatures({
            userOptions: true,
            title: true,
            subtitle: true,
            dataTable: true,
            tooltipCallback: async () => {
                {
                    let read = () => select('[data-cy="cell"]');
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
                        const elements = select('[data-cy="cell-selected"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                    });
                }
            },
        });
        {
            await waitFor(() => {
                const elements = select('[data-cy="cell-underlayer"]');
                expect(elements).not.toHaveLength(0);
                expect(elements.length).toBeGreaterThan(0);
                expect(elements.some(visible)).toBe(true);
                expect(elements).toHaveLength(91);
            });
        }
        {
            await waitFor(() => {
                const elements = select('[data-cy="cell"]');
                expect(elements).not.toHaveLength(0);
                expect(elements.length).toBeGreaterThan(0);
                expect(elements.some(visible)).toBe(true);
                expect(elements).toHaveLength(91);
            });
        }
        {
            await waitFor(() => {
                const elements = select('[data-cy="cell-label"]');
                expect(elements).not.toHaveLength(0);
                expect(elements.length).toBeGreaterThan(0);
                expect(elements.some(visible)).toBe(true);
                expect(elements).toHaveLength(91);
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
                expect(read()).toHaveLength(dataset.length);
            });
        }
        {
            let read = aliases.get('yLabels');
            {
                const items = read();
                for (let index = 0; index < items.length; index++) {
                    await (async (label, i) => {
                        {
                            await waitFor(() => {
                                const elements = label;
                                expect(
                                    elements.map((e) => e.textContent).join(''),
                                ).toContain(String(dataset[i].name));
                            });
                        }
                    })([items[index]], index, items);
                }
            }
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
                expect(read()).toHaveLength(13);
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
                                    elements.map((e) => e.textContent).join(''),
                                ).toContain(
                                    String(
                                        config.style.layout.dataLabels.xAxis
                                            .values[i],
                                    ),
                                );
                            });
                        }
                    })([items[index]], index, items);
                }
            }
        }
        {
            await waitFor(() => {
                const elements = select('[data-cy="legend-label-max"]');
                expect(elements).not.toHaveLength(0);
                expect(elements.length).toBeGreaterThan(0);
                expect(elements.some(visible)).toBe(true);
                expect(elements.map((e) => e.textContent).join('')).toContain(
                    String(30),
                );
            });
        }
        {
            await waitFor(() => {
                const elements = select('[data-cy="legend-label-min"]');
                expect(elements).not.toHaveLength(0);
                expect(elements.length).toBeGreaterThan(0);
                expect(elements.some(visible)).toBe(true);
                expect(elements.map((e) => e.textContent).join('')).toContain(
                    String(0),
                );
            });
        }
        {
            await waitFor(() => {
                const elements = select('[data-cy="legend-gauge"]');
                expect(elements).not.toHaveLength(0);
                expect(elements.length).toBeGreaterThan(0);
                expect(elements.some(visible)).toBe(true);
            });
        }
        {
            await waitFor(() => {
                const elements = select('[data-cy="gauge-indicator"]');
                expect(elements).not.toHaveLength(0);
                expect(elements.length).toBeGreaterThan(0);
                expect(elements.some(visible)).toBe(true);
            });
        }
    }
    cases.RendersWithLegend = async () => {
        {
            const mounted = await mountSubject(VueUiHeatmap, {
                props: {
                    config,
                    dataset,
                },
            });
            let read = () => mounted;
            {
                const result = await commonTest(read());
                if (result !== undefined) read = () => result;
            }
        }
    };
    return {
        cases,
        hooks,
    };
}
export default {
    title: 'Charts/VueUiHeatmap/Interactions',
    render: scenarioRender,
};
export const RendersWithLegend = {
    name: 'renders with legend',
    play: async (context) =>
        runScenario(context, createCases, 'RendersWithLegend'),
};
