import { expect, waitFor } from 'storybook/test';
import { scenarioRender, runScenario, visible } from '../support/scenario.js';
import { commonFeatures } from '../support/common.js';
import VueUiFunnel from '../../src/components/vue-ui-funnel.vue';
import { components } from '../fixtures/components.js';
function createCases(env) {
    const { aliases, select, mountSubject, fixtures } = env;
    const cases = {};
    const hooks = [];
    const testCommonFeatures = commonFeatures(env);
    const { dataset, config } = components.find(
        (c) => c.name === 'VueUiFunnel',
    );
    cases.Renders = async () => {
        {
            const mounted = await mountSubject(VueUiFunnel, {
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
                    dataTable: true,
                });
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="circle-links"]');
                        expect(elements).not.toHaveLength(0);
                        expect(
                            getComputedStyle(elements[0]).getPropertyValue(
                                'opacity',
                            ),
                        ).toBe(String('1'));
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="datapoint-circle"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(dataset.length);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="datapoint-label"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(dataset.length);
                        expect(
                            elements.map((e) => e.textContent).join(''),
                        ).toContain(String('%'));
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="funnel-area"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="datapoint-bar"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(dataset.length);
                    });
                }
                {
                    let read = () => select('[data-cy="bar-name"]');
                    aliases.set('names', read);
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
                    let read = aliases.get('names');
                    {
                        const items = read();
                        for (let index = 0; index < items.length; index++) {
                            await (async (name, i) => {
                                {
                                    let read = () => name;
                                    aliases.set('name', read);
                                }
                                {
                                    let read = aliases.get('name');
                                    await waitFor(() => {
                                        expect(
                                            read()
                                                .map((e) => e.textContent)
                                                .join(''),
                                        ).toContain(String(dataset[i].name));
                                    });
                                }
                            })([items[index]], index, items);
                        }
                    }
                }
                {
                    let read = () => select('[data-cy="bar-value"]');
                    aliases.set('values', read);
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
            }
        }
    };
    cases.LiveUpdates = async () => {
        const { wrapper } = await mountSubject(VueUiFunnel, {
            props: {
                dataset: [],
                config: { useCssAnimation: true, userOptions: { show: false } },
            },
        });
        const data = [
            { name: 'First', value: 100 },
            { name: 'Second', value: 40 },
        ];
        await wrapper.setProps({ dataset: data });
        await waitFor(() =>
            expect(wrapper.findAll('rect.animated')).toHaveLength(2),
        );
        await waitFor(() =>
            expect(wrapper.findAll('rect.animated')).toHaveLength(0),
        );
        await wrapper.setProps({
            config: {
                useCssAnimation: false,
                userOptions: { show: false },
                style: {
                    chart: {
                        width: 900,
                        height: 600,
                        padding: { top: 30, bottom: 20 },
                    },
                },
            },
        });
        expect(
            wrapper.find('[data-cy="funnel-svg"]').attributes('viewBox'),
        ).toBe('0 0 900 600');
        expect(
            Number(wrapper.find('[data-cy="datapoint-bar"]').attributes('y')),
        ).toBeCloseTo(57.5);
        await wrapper.setProps({
            dataset: [
                { name: 'Zero', value: 0 },
                { name: 'Next', value: 10 },
            ],
        });
        for (const bar of wrapper.findAll('[data-cy="datapoint-bar"]'))
            expect(bar.attributes('width')).toBe('0');
        const gradient = wrapper.find('linearGradient').attributes('id');
        expect(wrapper.find('[data-cy="funnel-area"]').attributes('fill')).toBe(
            `url(#${gradient})`,
        );
        expect(wrapper.find('[data-cy="funnel-svg"]').html()).not.toMatch(
            /NaN|Infinity/,
        );
    };
    return {
        cases,
        hooks,
    };
}
export default {
    title: 'Charts/VueUiFunnel/Interactions',
    render: scenarioRender,
};
export const Renders = {
    name: 'renders',
    play: async (context) => runScenario(context, createCases, 'Renders'),
};

export const LiveUpdates = {
    name: 'updates dimensions, late data, and zero baseline',
    play: async (context) => runScenario(context, createCases, 'LiveUpdates'),
};
