import { expect, waitFor } from 'storybook/test';
import {
    scenarioRender,
    runScenario,
    dispatch,
    visible,
} from '../support/scenario.js';
import { commonFeatures } from '../support/common.js';
import VueUiStackbar from '../../src/components/vue-ui-stackbar.vue';
import { components } from '../fixtures/components.js';
function createCases(env) {
    const { aliases, select, mountSubject, fixtures } = env;
    const cases = {};
    const hooks = [];
    const testCommonFeatures = commonFeatures(env);
    const { dataset, config } = components.find(
        (c) => c.name === 'VueUiStackbar',
    );
    async function commonTest() {
        await testCommonFeatures({
            userOptions: true,
            title: true,
            subtitle: true,
            slicer: true,
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
                    await dispatch(read(), 'mouseenter');
                }
            },
        });
        {
            await waitFor(() => {
                const elements = select('[data-cy="line-axis-x"]');
                expect(elements).not.toHaveLength(0);
            });
        }
        {
            await waitFor(() => {
                const elements = select('[data-cy="line-axis-y"]');
                expect(elements).not.toHaveLength(0);
            });
        }
        {
            await waitFor(() => {
                const elements = select('[data-cy="axis-label-x"]');
                expect(elements).not.toHaveLength(0);
                expect(elements.length).toBeGreaterThan(0);
                expect(elements.some(visible)).toBe(true);
                expect(elements.map((e) => e.textContent).join('')).toContain(
                    String(config.style.chart.grid.x.axisName.text),
                );
            });
        }
        {
            await waitFor(() => {
                const elements = select('[data-cy="axis-label-y"]');
                expect(elements).not.toHaveLength(0);
                expect(elements.length).toBeGreaterThan(0);
                expect(elements.some(visible)).toBe(true);
                expect(elements.map((e) => e.textContent).join('')).toContain(
                    String(config.style.chart.grid.y.axisName.text),
                );
            });
        }
        {
            await waitFor(() => {
                const elements = select('[data-cy="scale-line-y"]');
                expect(elements).not.toHaveLength(0);
                expect(elements).toHaveLength(9);
            });
        }
        {
            let read = () => select('[data-cy="scale-label-y"]');
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
                ).toContain(String(-60));
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
                ).toContain(String(100));
            });
        }
        {
            let read = () => select('[data-cy="time-label"]');
            aliases.set('timeLabels', read);
            await waitFor(() => {
                expect(read()).not.toHaveLength(0);
            });
            await waitFor(() => {
                expect(read().length).toBeGreaterThan(0);
                expect(read().some(visible)).toBe(true);
            });
            await waitFor(() => {
                expect(read()).toHaveLength(
                    Math.max(...dataset.map((d) => d.series.length)),
                );
            });
        }
        {
            let read = aliases.get('timeLabels');
            {
                const items = read();
                for (let index = 0; index < items.length; index++) {
                    await (async (label, i) => {
                        {
                            let read = () => label;
                            aliases.set('label', read);
                        }
                        {
                            let read = aliases.get('label');
                            await waitFor(() => {
                                expect(
                                    read()
                                        .map((e) => e.textContent)
                                        .join(''),
                                ).toContain(String(i));
                            });
                        }
                    })([items[index]], index, items);
                }
            }
        }
        {
            await waitFor(() => {
                const elements = select('[data-cy="label-total"]');
                expect(elements).not.toHaveLength(0);
                expect(elements.length).toBeGreaterThan(0);
                expect(elements.some(visible)).toBe(true);
                expect(elements).toHaveLength(
                    Math.max(...dataset.map((d) => d.series.length)),
                );
            });
        }
        {
            await waitFor(() => {
                const elements = select('[data-cy="label-datapoint"]');
                expect(elements).not.toHaveLength(0);
                expect(elements.length).toBeGreaterThan(0);
                expect(elements.some(visible)).toBe(true);
            });
        }
    }
    cases.RendersVertically = async () => {
        {
            const mounted = await mountSubject(VueUiStackbar, {
                props: {
                    dataset,
                    config,
                },
            });
            let read = () => mounted;
            {
                await commonTest();
            }
        }
    };
    cases.RendersHorizontally = async () => {
        {
            const mounted = await mountSubject(VueUiStackbar, {
                props: {
                    dataset,
                    config: {
                        ...config,
                        orientation: 'horizontal',
                    },
                },
            });
            let read = () => mounted;
            {
                await commonTest();
            }
        }
    };
    return {
        cases,
        hooks,
    };
}
export default {
    title: 'Charts/VueUiStackbar/Interactions',
    render: scenarioRender,
};
export const RendersVertically = {
    name: 'renders vertically',
    play: async (context) =>
        runScenario(context, createCases, 'RendersVertically'),
};
export const RendersHorizontally = {
    name: 'renders horizontally',
    play: async (context) =>
        runScenario(context, createCases, 'RendersHorizontally'),
};
