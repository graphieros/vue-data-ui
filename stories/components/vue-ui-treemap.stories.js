import { expect, waitFor } from 'storybook/test';
import {
    scenarioRender,
    runScenario,
    dispatch,
    clickElements,
    visible,
} from '../support/scenario.js';
import { commonFeatures } from '../support/common.js';
import VueUiTreemap from '../../src/components/vue-ui-treemap.vue';
import { components } from '../fixtures/components.js';
function createCases(env) {
    const { select, mountSubject, fixtures } = env;
    const cases = {};
    const hooks = [];
    const testCommonFeatures = commonFeatures(env);
    const { dataset, config } = components.find(
        (c) => c.name === 'VueUiTreemap',
    );
    cases.Renders = async () => {
        {
            const mounted = await mountSubject(VueUiTreemap, {
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
                            let read = () =>
                                select('[data-cy="datapoint-rect"]');
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
                        const elements = select('[data-cy="datapoint-rect"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(20);
                    });
                }
                {
                    let read = () => select('[data-cy="datapoint-rect"]');
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
                    await waitFor(() => {
                        const elements = select('[data-cy="datapoint-rect"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(6);
                    });
                }
                {
                    let read = () => select('[data-cy="datapoint-rect"]');
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
                    await waitFor(() => {
                        const elements = select('[data-cy="datapoint-rect"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(20);
                    });
                }
            }
        }
    };
    cases.RendersBreadcrumbs = async () => {
        {
            const mounted = await mountSubject(VueUiTreemap, {
                props: {
                    dataset,
                    config,
                },
            });
            let read = () => mounted;
            {
                {
                    await waitFor(() => {
                        const elements = select('.vue-ui-treemap-breadcrumbs');
                        expect(elements).toHaveLength(0);
                    });
                }
                {
                    let read = () => select('.vue-ui-treemap-rect');
                    {
                        const previous = read;
                        read = () => {
                            const element = previous().at(12);
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
                    await waitFor(() => {
                        const elements = select('.vue-ui-treemap-breadcrumbs');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                    });
                }
                {
                    let read = () => select('.vue-ui-treemap-crumb');
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
                }
                {
                    await waitFor(() => {
                        const elements = select('.vue-ui-treemap-breadcrumbs');
                        expect(elements).toHaveLength(0);
                    });
                }
            }
        }
    };
    cases.Emits = async () => {
        {
            const mounted = await mountSubject(VueUiTreemap, {
                props: {
                    dataset,
                    config,
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
                    await clickElements(read());
                    {
                        expect(wrapper.emitted('selectLegend')).to.exist;
                    }
                }
                {
                    let read = () => select('[data-cy="datapoint-rect"]');
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
                            'children',
                            'color',
                            'id',
                            'name',
                            'normalizedValue',
                            'parentId',
                            'proportion',
                            'value',
                            'x0',
                            'x1',
                            'y0',
                            'y1',
                            'depth',
                            'isVisibleNode',
                            'showLabel',
                            'sourceColor',
                        );
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
    title: 'Charts/VueUiTreemap/Interactions',
    render: scenarioRender,
};
export const Renders = {
    name: 'renders',
    play: async (context) => runScenario(context, createCases, 'Renders'),
};
export const RendersBreadcrumbs = {
    name: 'renders breadcrumbs',
    play: async (context) =>
        runScenario(context, createCases, 'RendersBreadcrumbs'),
};
export const Emits = {
    name: 'emits',
    play: async (context) => runScenario(context, createCases, 'Emits'),
};
