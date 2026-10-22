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
    const {
        aliases,
        select,
        mountSubject,
        spy,
        controlAnimationFrames,
        fixtures,
    } = env;
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
    cases.EmitsFromADonutChartFromAnArrayOfObjects = async () => {
        const ds = [
            {
                name: 'S1',
                value: 1,
            },
            {
                name: 'S2',
                value: 2,
            },
            {
                name: 'S3',
                value: 3,
            },
        ];
        const onSelectLegend = storeAlias('onSelectLegend', spy());
        {
            const mounted = await mountSubject(VueUiQuickChart, {
                props: {
                    dataset: ds,
                    config,
                    onSelectLegend,
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
                    let read = () => select('[data-cy="tooltip-trap-donut"]');
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
                    }
                }
                {
                    const animation = controlAnimationFrames();
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
                    await animation.flush();
                }
                {
                    let read = aliases.get('onSelectLegend');
                    await waitFor(() =>
                        ((spy) => {
                            expect(spy).toHaveBeenCalledTimes(1);
                            const payload = {
                                args: spy.mock.calls[0],
                            }.args[0];
                            expect(payload).to.be.an('array');
                            expect(payload[0]).to.include.keys(
                                'NAME',
                                'VALUE',
                                'absoluteValue',
                                'color',
                                'id',
                                'immutableValue',
                                'name',
                                'proportion',
                                'shape',
                                'value',
                            );
                        })(read()),
                    );
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
export const EmitsFromADonutChartFromAnArrayOfObjects = {
    name: 'emits from a donut chart from an array of objects',
    play: async (context) =>
        runScenario(
            context,
            createCases,
            'EmitsFromADonutChartFromAnArrayOfObjects',
        ),
};
