import { expect, waitFor, fireEvent } from 'storybook/test';
import {
    scenarioRender,
    runScenario,
    dispatch,
    clickElements,
    visible,
} from '../support/scenario.js';
import { commonFeatures } from '../support/common.js';
import VueUiGalaxy from '../../src/components/vue-ui-galaxy.vue';
import { components } from '../fixtures/components.js';
function createCases(env) {
    const { select, mountSubject, fixtures } = env;
    const cases = {};
    const hooks = [];
    const testCommonFeatures = commonFeatures(env);
    const { dataset, config } = components.find(
        (c) => c.name === 'VueUiGalaxy',
    );
    cases.Renders = async () => {
        {
            const mounted = await mountSubject(VueUiGalaxy, {
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
                            await dispatch(read(), 'mouseenter', {
                                force: true,
                            });
                        }
                    },
                });
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="datapoint-border"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(dataset.length);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="datapoint-path"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(dataset.length);
                    });
                }
            }
        }
    };
    cases.Emits = async () => {
        {
            const mounted = await mountSubject(VueUiGalaxy, {
                props: {
                    config,
                    dataset,
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
                    await clickElements(read(), {
                        force: true,
                    });
                    {
                        expect(wrapper.emitted('selectLegend')).to.exist;
                    }
                }
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
                    await clickElements(read(), {
                        force: true,
                    });
                    {
                        expect(wrapper.emitted('selectDatapoint')).to.exist;
                        expect(
                            wrapper.emitted('selectDatapoint')[0][0],
                        ).to.have.keys(
                            'absoluteValues',
                            'color',
                            'id',
                            'name',
                            'path',
                            'points',
                            'proportion',
                            'seriesIndex',
                            'value',
                            'absoluteIndex',
                        );
                        expect(
                            wrapper.emitted('selectDatapoint')[0][0]
                                .seriesIndex,
                        ).to.equal(1);
                    }
                }
            }
        }
    };
    cases.LiveUpdates = async () => {
        const data = [
            { id: 'a', name: 'A', values: [60] },
            { id: 'b', name: 'B', values: [30] },
            { id: 'c', name: 'C', values: [10] },
            { id: 'zero', name: 'Zero', values: [0] },
        ];
        const base = {
            a11y: { includeTable: true },
            style: { chart: { tooltip: { show: false } } },
        };
        const { wrapper } = await mountSubject(VueUiGalaxy, {
            props: { dataset: data, config: base },
        });
        const svg = wrapper.find('[data-cy="galaxy-svg"]').element;
        svg.focus();
        await fireEvent.keyDown(svg, { key: 'ArrowRight' });
        await fireEvent.keyDown(svg, { key: 'Enter' });
        expect(wrapper.emitted('selectDatapoint')[0][0].name).toBe('C');
        const ids = wrapper
            .findAll('[data-cy="tooltip-trap"]')
            .map((trap) => trap.attributes('data-a11y-serie-id'));
        wrapper.vm.hideSeries('B');
        await wrapper.setProps({
            config: {
                ...base,
                customPalette: ['#ff0000', '#00ff00', '#0000ff'],
            },
        });
        await waitFor(() =>
            expect(wrapper.findAll('[data-cy="tooltip-trap"]')).toHaveLength(2),
        );
        expect(
            wrapper
                .findAll('[data-cy="tooltip-trap"]')
                .map((trap) => trap.attributes('data-a11y-serie-id')),
        ).toEqual([ids[0], ids[2]]);
        expect(
            wrapper.findAll('.sr-only tbody th').map((th) => th.text()),
        ).toEqual(['C', 'Zero', 'A']);
        await wrapper.setProps({
            config: {
                ...base,
                loading: true,
                skeletonDataset: [{ name: 'Skeleton', values: [1] }],
            },
        });
        await waitFor(() => expect(wrapper.classes()).toContain('loading'));
        await wrapper.setProps({
            config: {
                ...base,
                loading: true,
                style: { chart: { color: '#abcdef' } },
            },
        });
        expect(wrapper.classes()).toContain('loading');
        expect(wrapper.find('[data-cy="user-options"]').exists()).toBe(false);
        await wrapper.setProps({ config: base });
        await waitFor(() => expect(wrapper.classes()).not.toContain('loading'));
        expect(wrapper.findAll('[data-cy="tooltip-trap"]')).toHaveLength(2);
    };
    return {
        cases,
        hooks,
    };
}
export default {
    title: 'Charts/VueUiGalaxy/Interactions',
    render: scenarioRender,
};
export const Renders = {
    name: 'renders',
    play: async (context) => runScenario(context, createCases, 'Renders'),
};
export const Emits = {
    name: 'emits',
    play: async (context) => runScenario(context, createCases, 'Emits'),
};

export const LiveUpdates = {
    name: 'preserves selection and hidden series through live updates',
    play: async (context) => runScenario(context, createCases, 'LiveUpdates'),
};
