import { expect, waitFor } from 'storybook/test';
import { scenarioRender, runScenario } from './support/scenario.js';
import { components } from './fixtures/components.js';
import Donut from '../src/components/vue-ui-donut.vue';
import Xy from '../src/components/vue-ui-xy.vue';
import QuickChart from '../src/components/vue-ui-quick-chart.vue';
import ParallelCoordinatePlot from '../src/components/vue-ui-parallel-coordinate-plot.vue';
function createCases({ mountSubject }) {
    return {
        hooks: [],
        cases: {
            OptIn: async () => {
                for (const [name, Chart] of [
                    ['VueUiDonut', Donut],
                    ['VueUiXy', Xy],
                    ['VueUiQuickChart', QuickChart],
                    ['VueUiParallelCoordinatePlot', ParallelCoordinatePlot],
                ]) {
                    const { dataset, config = {} } = components.find(
                        (c) => c.name === name,
                    );
                    const { wrapper } = await mountSubject(Chart, {
                        props: {
                            dataset,
                            config: {
                                ...config,
                                a11y: { ...config.a11y, includeTable: false },
                            },
                        },
                    });
                    const selector = '[id^="chart-data-table-"]';
                    expect(wrapper.find(selector).exists()).toBe(false);
                    await wrapper.setProps({
                        config: {
                            ...config,
                            a11y: { ...config.a11y, includeTable: true },
                        },
                    });
                    await waitFor(() =>
                        expect(
                            wrapper.find(`${selector} tbody tr`).exists(),
                        ).toBe(true),
                    );
                    await wrapper.setProps({
                        config: {
                            ...config,
                            a11y: { ...config.a11y, includeTable: false },
                        },
                    });
                    await waitFor(() =>
                        expect(wrapper.find(selector).exists()).toBe(false),
                    );
                }
            },
        },
    };
}
export default { title: 'Accessibility/DataTable', render: scenarioRender };
export const OptIn = {
    name: 'hidden tables are opt-in and react to configuration updates',
    play: async (context) => runScenario(context, createCases, 'OptIn'),
};
