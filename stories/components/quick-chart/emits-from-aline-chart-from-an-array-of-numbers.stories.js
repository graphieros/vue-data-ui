import { expect, waitFor } from 'storybook/test';
import {
    scenarioRender,
    runScenario,
    dispatch,
    clickElements,
    visible,
} from '../../support/scenario.js';
import { commonFeatures } from '../../support/common.js';
import VueUiQuickChart from '../../../src/components/vue-ui-quick-chart.vue';
import { components } from '../../fixtures/components.js';
function createCases(env) {
    const { aliases, select, mountSubject, spy, fixtures } = env;
    const cases = {};
    const hooks = [];
    const storeAlias = (name, value) => {
        aliases.set(name, () => value);
        return value;
    };
    const testCommonFeatures = commonFeatures(env);
    const { config, dataset } = components.find(
        (c) => c.name === 'VueUiQuickChart',
    );
    async function testTitle() {
        {
            await waitFor(() => {
                const elements = select('.vue-ui-quick-chart-title');
                expect(elements).not.toHaveLength(0);
                expect(elements.length).toBeGreaterThan(0);
                expect(elements.some(visible)).toBe(true);
                expect(elements.map((e) => e.textContent).join('')).toContain(
                    String('Title'),
                );
            });
        }
    }
    cases.EmitsFromALineChartFromAnArrayOfNumbers = async () => {
        const ds = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89];
        const periods = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
        {
            const mounted = await mountSubject(VueUiQuickChart, {
                props: {
                    dataset: ds,
                    config: {
                        ...config,
                        xyPeriods: periods,
                    },
                },
            });
            let read = () => mounted;
            {
                const { wrapper } = read();
                {
                    let read = () => select('.vue-ui-quick-chart');
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await dispatch(read(), 'mouseenter', {
                        force: true,
                    });
                }
                {
                    let read = () => select('[data-cy="tooltip-trap-line"]');
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
                            wrapper.emitted('selectDatapoint')[0][0][0],
                        ).to.have.keys(
                            'absoluteIndices',
                            'absoluteValues',
                            'absoluteIndex',
                            'color',
                            'id',
                            'name',
                            'value',
                            'values',
                        );
                    }
                }
                {
                    let read = () => select('.vue-ui-quick-chart-legend-item');
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
                        const emittedSelectLegend =
                            wrapper.emitted('selectLegend');
                        expect(emittedSelectLegend).to.exist;
                        expect(emittedSelectLegend).to.have.length(1);
                        const payload = emittedSelectLegend[0][0];
                        expect(payload).to.be.an('array');
                        expect(payload[0]).to.have.keys(
                            'absoluteIndices',
                            'absoluteValues',
                            'color',
                            'coordinates',
                            'id',
                            'linePath',
                            'name',
                            'shape',
                            'values',
                        );
                    }
                }
            }
        }
    };
    return { cases, hooks };
}
export default {
    title: 'Charts/VueUiQuickChart/Interactions',
    render: scenarioRender,
};
export const EmitsFromALineChartFromAnArrayOfNumbers = {
    name: 'emits from a line chart from an array of numbers',
    play: async (context) =>
        runScenario(
            context,
            createCases,
            'EmitsFromALineChartFromAnArrayOfNumbers',
        ),
};
