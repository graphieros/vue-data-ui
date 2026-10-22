import { expect, waitFor } from 'storybook/test';
import {
    scenarioRender,
    runScenario,
    dispatch,
    clickElements,
    visible,
} from '../support/scenario.js';
import { commonFeatures } from '../support/common.js';
const sequential = async (items, callback) => {
    for (let i = 0; i < items.length; i++) await callback(items[i], i, items);
};
import VueUiQuadrant from '../../src/components/vue-ui-quadrant.vue';
import { components } from '../fixtures/components.js';
function createCases(env) {
    const { aliases, select, mountSubject, resize, spy, fixtures } = env;
    const cases = {};
    const hooks = [];
    const storeAlias = (name, value) => {
        aliases.set(name, () => value);
        return value;
    };
    const testCommonFeatures = commonFeatures(env);
    const { config, dataset } = components.find(
        (c) => c.name === 'VueUiQuadrant',
    );
    cases.Renders = async () => {
        {
            await resize(500, 600);
        }
        {
            const mounted = await mountSubject(VueUiQuadrant, {
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
                    legend: true,
                    tooltipCallback: async () => {
                        {
                            let read = () => select('[data-cy="atom-shape"]');
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
                await sequential(
                    [
                        {
                            selector: `[data-cy="quadrant-label-tl"]`,
                            expected:
                                config.style.chart.layout.labels.quadrantLabels
                                    .tl.text,
                        },
                        {
                            selector: `[data-cy="quadrant-label-tr"]`,
                            expected:
                                config.style.chart.layout.labels.quadrantLabels
                                    .tr.text,
                        },
                        {
                            selector: `[data-cy="quadrant-label-br"]`,
                            expected:
                                config.style.chart.layout.labels.quadrantLabels
                                    .br.text,
                        },
                        {
                            selector: `[data-cy="quadrant-label-bl"]`,
                            expected:
                                config.style.chart.layout.labels.quadrantLabels
                                    .bl.text,
                        },
                    ],
                    async (label) => {
                        {
                            await waitFor(() => {
                                const elements = select(label.selector);
                                expect(elements).not.toHaveLength(0);
                                expect(
                                    elements.map((e) => e.textContent).join(''),
                                ).toContain(String(label.expected));
                            });
                        }
                    },
                );
                {
                    let read = () => select('[data-cy="side-trap-tl"]');
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await clickElements(read(), {
                        force: true,
                    });
                }
                {
                    let read = () => select('[data-cy="quadrant-svg"]');
                    {
                        const previous = read;
                        read = () => previous()[0].getAttribute('viewBox');
                    }
                    await waitFor(() => {
                        expect(read()).toEqual(
                            '0 0 304.00000000000045 304.00000000000045',
                        );
                    });
                }
                {
                    let read = () => select('[data-cy="side-trap-tr"]');
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await clickElements(read(), {
                        force: true,
                    });
                }
                {
                    let read = () => select('[data-cy="quadrant-svg"]');
                    {
                        const previous = read;
                        read = () => previous()[0].getAttribute('viewBox');
                    }
                    await waitFor(() => {
                        expect(read()).toEqual(
                            '208.00000000000006 0 304.00000000000045 304.00000000000045',
                        );
                    });
                }
                {
                    let read = () => select('[data-cy="side-trap-br"]');
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await clickElements(read(), {
                        force: true,
                    });
                }
                {
                    let read = () => select('[data-cy="quadrant-svg"]');
                    {
                        const previous = read;
                        read = () => previous()[0].getAttribute('viewBox');
                    }
                    await waitFor(() => {
                        expect(read()).toEqual(
                            '208.00000000000006 208.00000000000006 304.00000000000045 304.00000000000045',
                        );
                    });
                }
                {
                    let read = () => select('[data-cy="side-trap-bl"]');
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await clickElements(read(), {
                        force: true,
                    });
                }
                {
                    let read = () => select('[data-cy="quadrant-svg"]');
                    {
                        const previous = read;
                        read = () => previous()[0].getAttribute('viewBox');
                    }
                    await waitFor(() => {
                        expect(read()).toEqual(
                            '-4.263256414560601e-14 208.00000000000006 304.00000000000045 304.00000000000045',
                        );
                    });
                }
                {
                    let read = () => select('[data-cy="minimap-tl"]');
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await clickElements(read());
                }
                {
                    let read = () => select('[data-cy="quadrant-svg"]');
                    {
                        const previous = read;
                        read = () => previous()[0].getAttribute('viewBox');
                    }
                    await waitFor(() => {
                        expect(read()).toEqual(
                            '-1.4988357199199224e-29 -4.263256414560601e-14 304.00000000000045 304.00000000000045',
                        );
                    });
                }
                {
                    let read = () => select('[data-cy="minimap-tr"]');
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await clickElements(read());
                }
                {
                    let read = () => select('[data-cy="quadrant-svg"]');
                    {
                        const previous = read;
                        read = () => previous()[0].getAttribute('viewBox');
                    }
                    await waitFor(() => {
                        expect(read()).toEqual(
                            '208.00000000000006 -1.4988357199199224e-29 304.00000000000045 304.00000000000045',
                        );
                    });
                }
                {
                    let read = () => select('[data-cy="minimap-br"]');
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await clickElements(read());
                }
                {
                    let read = () => select('[data-cy="quadrant-svg"]');
                    {
                        const previous = read;
                        read = () => previous()[0].getAttribute('viewBox');
                    }
                    await waitFor(() => {
                        expect(read()).toEqual(
                            '208.00000000000006 208.00000000000006 304.00000000000045 304.00000000000045',
                        );
                    });
                }
                {
                    let read = () => select('[data-cy="minimap-bl"]');
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await clickElements(read());
                }
                {
                    let read = () => select('[data-cy="quadrant-svg"]');
                    {
                        const previous = read;
                        read = () => previous()[0].getAttribute('viewBox');
                    }
                    await waitFor(() => {
                        expect(read()).toEqual(
                            '-4.263256414560601e-14 208.00000000000006 304.00000000000045 304.00000000000045',
                        );
                    });
                }
                {
                    let read = () => select('[data-cy="minimap-bl"]');
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await clickElements(read());
                }
                {
                    let read = () => select('[data-cy="quadrant-svg"]');
                    {
                        const previous = read;
                        read = () => previous()[0].getAttribute('viewBox');
                    }
                    await waitFor(() => {
                        expect(read()).toEqual(
                            '-1.4988357199199224e-29 -4.263256414560601e-14 512 512',
                        );
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="grid-rect"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(
                            config.style.chart.layout.grid.graduations.steps,
                        );
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="axis-y"]');
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
                        const elements = select('[data-cy="axis-x"]');
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
                        const elements = select('[data-cy="axis-arrow"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(4);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="axis-x-name"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(
                            elements.map((e) => e.textContent).join(''),
                        ).toContain(
                            String(config.style.chart.layout.grid.xAxis.name),
                        );
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="axis-y-name"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(
                            elements.map((e) => e.textContent).join(''),
                        ).toContain(
                            String(config.style.chart.layout.grid.yAxis.name),
                        );
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="label-y-min"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(
                            elements.map((e) => e.textContent).join(''),
                        ).toContain(String('-8'));
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="label-y-max"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(
                            elements.map((e) => e.textContent).join(''),
                        ).toContain(String('9'));
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="label-x-min"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(
                            elements.map((e) => e.textContent).join(''),
                        ).toContain(String('-9'));
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="label-x-max"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(
                            elements.map((e) => e.textContent).join(''),
                        ).toContain(String('8'));
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="gift-wrap"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="plot-label"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(dataset[0].series.length);
                    });
                }
            }
        }
    };
    cases.Emits = async () => {
        storeAlias('rafSpy', spy(window, 'requestAnimationFrame'));
        {
            const mounted = await mountSubject(VueUiQuadrant, {
                props: {
                    dataset,
                    config,
                },
            });
            let read = () => mounted;
            {
                const { wrapper } = read();
                {
                    let read = () => select('[data-cy="atom-shape"]');
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
                    {
                        expect(
                            wrapper.emitted('selectPlot')[0][0],
                        ).to.have.keys(
                            'category',
                            'shape',
                            'itemName',
                            'x',
                            'y',
                            'quadrantSide',
                            'sideName',
                        );
                    }
                }
                {
                    let read = () => select('[data-cy="side-trap-tl"]');
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await clickElements(read(), {
                        force: true,
                    });
                    {
                        expect(
                            wrapper.emitted('selectSide')[0][0],
                        ).to.have.keys('items', 'quadrantSide', 'sideName');
                        expect(
                            wrapper.emitted('selectSide')[0][0].quadrantSide,
                        ).to.equal('tl');
                        expect(
                            wrapper.emitted('selectSide')[0][0].sideName,
                        ).to.equal('TL');
                        {
                            let read = aliases.get('rafSpy');
                            await waitFor(() => {
                                expect(read()).toHaveBeenCalled();
                            });
                        }
                    }
                }
                {
                    let read = () => select('[data-cy="legend-item"]');
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
                    {
                        expect(wrapper.emitted('selectLegend')).to.exist;
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
    title: 'Charts/VueUiQuadrant/Interactions',
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
