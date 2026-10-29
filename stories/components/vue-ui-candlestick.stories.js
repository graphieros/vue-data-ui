import { expect, waitFor } from 'storybook/test';
import {
    scenarioRender,
    runScenario,
    dispatch,
    visible,
} from '../support/scenario.js';
import { commonFeatures } from '../support/common.js';
import VueUiCandlestick from '../../src/components/vue-ui-candlestick.vue';
import { components } from '../fixtures/components.js';
function createCases(env) {
    const { aliases, select, mountSubject, fixtures } = env;
    const cases = {};
    const hooks = [];
    const testCommonFeatures = commonFeatures(env);
    const { dataset, config } = components.find(
        (c) => c.name === 'VueUiCandlestick',
    );
    cases.MinimapGeometryCache = async () => {
        const points = [
            ['A', 10, 18, 6, 14, 100],
            ['B', 16, 24, 8, 12, 200],
            ['C', 12, 20, 4, 18, 150],
        ];
        const { wrapper } = await mountSubject(VueUiCandlestick, {
            props: {
                dataset: points,
                config: { style: { zoom: { minimap: { show: true } } } },
            },
        });
        const state = wrapper.vm.$.setupState;
        const dimensions = { minimapH: 40, unitW: 10 };
        const plots = state.minimapDataset(dimensions);
        expect(state.minimapDataset(dimensions)).toBe(plots);
        for (let i = 0; i < points.length; i++) {
            for (const [field, column] of [
                ['open', 1],
                ['high', 2],
                ['low', 3],
                ['close', 4],
            ]) {
                expect(plots[i][field].x).toBe(i * 10);
                expect(plots[i][field].y).toBe(
                    (1 - points[i][column] / 24) * 40,
                );
            }
        }
        const resized = state.minimapDataset({ minimapH: 80, unitW: 20 });
        expect(resized).not.toBe(plots);
        expect(resized[1].high.x).toBe(20);
        expect(resized[0].high.y).toBe(plots[0].high.y * 2);

        // Hovering must retain geometry, while data and scale changes rebuild it.
        state.hoveredIndex = 1;
        expect(state.minimapDataset({ minimapH: 80, unitW: 20 })).toBe(resized);
        await wrapper.setProps({
            dataset: [points[0], ['B', 16, 48, 8, 12, 200], points[2]],
        });
        const updated = state.minimapDataset(dimensions);
        expect(updated).not.toBe(plots);
        expect(updated[0].high.y).toBe((1 - 18 / 48) * 40);
        await wrapper.setProps({
            config: {
                style: {
                    layout: { grid: { yAxis: { scale: { min: 2, max: 50 } } } },
                },
            },
        });
        expect(state.minimapDataset(dimensions)[0].high.y).toBe(
            (1 - (18 - 2) / (50 - 2)) * 40,
        );
    };
    cases.Renders = async () => {
        {
            const mounted = await mountSubject(VueUiCandlestick, {
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
                    slicer: true,
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
                            await dispatch(read(), 'mouseover');
                        }
                    },
                });
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="y-scale-tick"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements).toHaveLength(9);
                    });
                }
                {
                    let read = () => select('[data-cy="y-scale-label"]');
                    aliases.set('scaleLabels', read);
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read()).toHaveLength(9);
                    });
                }
                {
                    let read = aliases.get('scaleLabels');
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
                    let read = aliases.get('scaleLabels');
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
                        ).toContain(String('160'));
                    });
                }
                {
                    let read = () => select('[data-cy="x-label"]');
                    aliases.set('xLabels', read);
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                    await waitFor(() => {
                        expect(read()).toHaveLength(10);
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
                        ).toContain(String(dataset[0][0]));
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
                        ).toContain(String(dataset.at(-1)[0]));
                    });
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
    title: 'Charts/VueUiCandlestick/Interactions',
    render: scenarioRender,
};
export const Renders = {
    name: 'renders',
    play: async (context) => runScenario(context, createCases, 'Renders'),
};

export const MinimapGeometryCache = {
    name: 'minimap geometry stays identical and cache invalidates correctly',
    play: async (context) =>
        runScenario(context, createCases, 'MinimapGeometryCache'),
};
