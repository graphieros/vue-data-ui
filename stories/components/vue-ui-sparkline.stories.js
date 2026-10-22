import { expect, waitFor } from 'storybook/test';
import {
    scenarioRender,
    runScenario,
    dispatch,
    clickElements,
    visible,
} from '../support/scenario.js';
import VueUiSparkline from '../../src/components/vue-ui-sparkline.vue';
import { components } from '../fixtures/components.js';
function createCases(env) {
    const { select, mountSubject, fixtures } = env;
    const cases = {};
    const hooks = [];
    const { config, dataset } = components.find(
        (c) => c.name === 'VueUiSparkline',
    );
    async function commonTest(line = true) {
        {
            await waitFor(() => {
                const elements = select('[data-cy="title"]');
                expect(elements).not.toHaveLength(0);
                expect(elements.length).toBeGreaterThan(0);
                expect(elements.some(visible)).toBe(true);
                expect(elements.map((e) => e.textContent).join('')).toContain(
                    String(config.style.title.text),
                );
            });
        }
        {
            await waitFor(() => {
                const elements = select('[data-cy="sparkline-datalabel"]');
                expect(elements).not.toHaveLength(0);
                expect(elements.length).toBeGreaterThan(0);
                expect(elements.some(visible)).toBe(true);
                expect(elements.map((e) => e.textContent).join('')).toContain(
                    String(dataset.at(-1).value),
                );
            });
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
            await waitFor(() => expect(read().length).toBeGreaterThan(0));
            await dispatch(read(), 'mouseenter', {
                force: true,
            });
        }
        {
            await waitFor(() => {
                const elements = select('[data-cy="selection-indicator"]');
                expect(elements).not.toHaveLength(0);
                expect(
                    getComputedStyle(elements[0]).getPropertyValue('opacity'),
                ).toBe(String('1'));
            });
        }
        {
            await waitFor(() => {
                const elements = select('[data-cy="sparkline-datalabel"]');
                expect(elements).not.toHaveLength(0);
                expect(elements.length).toBeGreaterThan(0);
                expect(elements.some(visible)).toBe(true);
                expect(elements.map((e) => e.textContent).join('')).toContain(
                    String(dataset[0].value),
                );
            });
        }
        {
            await waitFor(() => {
                const elements = select('[data-cy="title"]');
                expect(elements.map((e) => e.textContent).join('')).toContain(
                    String(dataset[0].period),
                );
            });
        }
        if (line) {
            {
                await waitFor(() => {
                    const elements = select('[data-cy="selection-plot"]');
                    expect(elements).not.toHaveLength(0);
                    expect(elements.length).toBeGreaterThan(0);
                    expect(elements.some(visible)).toBe(true);
                });
            }
        }
    }
    cases.RendersLine = async () => {
        {
            const mounted = await mountSubject(VueUiSparkline, {
                props: {
                    dataset,
                    config,
                },
            });
            let read = () => mounted;
            {
                await commonTest();
                {
                    await waitFor(() => {
                        const elements = select(
                            '[data-cy="sparkline-angle-area"]',
                        );
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select(
                            '[data-cy="sparkline-straight-line"]',
                        );
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                    });
                }
            }
        }
    };
    cases.RendersSpline = async () => {
        {
            const mounted = await mountSubject(VueUiSparkline, {
                props: {
                    dataset,
                    config: {
                        ...config,
                        style: {
                            ...config.style,
                            line: {
                                smooth: true,
                            },
                        },
                    },
                },
            });
            let read = () => mounted;
            {
                await commonTest();
                {
                    await waitFor(() => {
                        const elements = select(
                            '[data-cy="sparkline-smooth-area"]',
                        );
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select(
                            '[data-cy="sparkline-smooth-path"]',
                        );
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                    });
                }
            }
        }
    };
    cases.RendersBars = async () => {
        {
            const mounted = await mountSubject(VueUiSparkline, {
                props: {
                    dataset,
                    config: {
                        ...config,
                        type: 'bar',
                    },
                },
            });
            let read = () => mounted;
            {
                await commonTest(false);
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="datapoint-bar"]');
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
            const mounted = await mountSubject(VueUiSparkline, {
                props: {
                    dataset,
                    config,
                },
            });
            let read = () => mounted;
            {
                const { wrapper } = read();
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
                    {
                        expect(
                            wrapper.emitted('hoverIndex')[0][0],
                        ).to.have.keys('index');
                        expect(
                            wrapper.emitted('hoverIndex')[0][0].index,
                        ).to.equal(0);
                    }
                    {
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
                            await dispatch(read(), 'mouseleave', {
                                force: true,
                            });
                            {
                                expect(
                                    wrapper.emitted('hoverIndex')[1][0],
                                ).to.have.keys('index');
                                expect(
                                    wrapper.emitted('hoverIndex')[1][0].index,
                                ).to.equal(undefined);
                            }
                        }
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
                        expect(
                            wrapper.emitted('selectDatapoint')[0][0],
                        ).to.have.keys('datapoint', 'index');
                        expect(
                            wrapper.emitted('selectDatapoint')[0][0].index,
                        ).to.equal(0);
                        expect(
                            wrapper.emitted('selectDatapoint')[0][0].datapoint,
                        ).to.have.keys(
                            'absoluteValue',
                            'barX',
                            'color',
                            'id',
                            'period',
                            'plotValue',
                            'sourceIndex',
                            'toMax',
                            'width',
                            'x',
                            'y',
                            'value',
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
    title: 'Mini Charts/VueUiSparkline/Interactions',
    render: scenarioRender,
};
export const RendersLine = {
    name: 'renders (line)',
    play: async (context) => runScenario(context, createCases, 'RendersLine'),
};
export const RendersSpline = {
    name: 'renders (spline)',
    play: async (context) => runScenario(context, createCases, 'RendersSpline'),
};
export const RendersBars = {
    name: 'renders (bars)',
    play: async (context) => runScenario(context, createCases, 'RendersBars'),
};
export const Emits = {
    name: 'emits',
    play: async (context) => runScenario(context, createCases, 'Emits'),
};
