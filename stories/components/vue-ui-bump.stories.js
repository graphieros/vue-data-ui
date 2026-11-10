import { expect, fn, userEvent, waitFor } from 'storybook/test';
import { scenarioRender, runScenario } from '../support/scenario.js';
import { commonFeatures } from '../support/common.js';
import VueUiBump from '../../src/components/vue-ui-bump.vue';
import { components } from '../fixtures/components.js';
function createCases(env) {
    const { mountSubject, select, fixtures } = env;
    const cases = {};
    const hooks = [];
    const testCommonFeatures = commonFeatures(env);
    const { dataset, config } = components.find((c) => c.name === 'VueUiBump');
    cases.Renders = async () => {
        {
            const mounted = await mountSubject(VueUiBump, {
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
                    slicer: false,
                    dataTable: true,
                    legend: false,
                });
            }
        }
    };
    cases.PointClicks = async () => {
        for (const mode of ['rank', 'value']) {
            const click = fn();
            await mountSubject(VueUiBump, {
                props: {
                    dataset: [
                        { name: 'A', values: [5, null, 10] },
                        { name: 'B', values: [10, 5, 5] },
                    ],
                    config: {
                        events: { datapointClick: click },
                        style: {
                            chart: {
                                layout: {
                                    plots: {
                                        labels: {
                                            show: true,
                                            displayedValue: mode,
                                        },
                                    },
                                    timeLabels: {
                                        values: ['A', 'B', 'C'],
                                        autoRotate: { enable: false },
                                    },
                                },
                            },
                        },
                    },
                },
            });
            await waitFor(() =>
                expect(select('svg[role="img"]')[0]).toBeVisible(),
            );
            const points = select(
                mode === 'rank'
                    ? 'circle.transition-opacity'
                    : 'rect.transition-opacity',
            );
            expect(points).toHaveLength(5);
            await userEvent.click(points[1]);
            expect(click).toHaveBeenCalledTimes(1);
            expect(click.mock.calls[0][0].seriesIndex).toBe(2);
        }
    };
    return {
        cases,
        hooks,
    };
}
export default {
    title: 'Charts/VueUiBump/Interactions',
    render: scenarioRender,
};
export const Renders = {
    name: 'renders',
    play: async (context) => runScenario(context, createCases, 'Renders'),
};

export const PointClicks = {
    name: 'plot clicks preserve source period indices',
    play: async (context) => runScenario(context, createCases, 'PointClicks'),
};
