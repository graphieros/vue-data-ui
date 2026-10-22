import { expect, waitFor } from 'storybook/test';
import {
    scenarioRender,
    runScenario,
    dispatch,
    clickElements,
    visible,
} from '../support/scenario.js';
import VueUiSparkhistogram from '../../src/components/vue-ui-sparkhistogram.vue';
import { components } from '../fixtures/components.js';
import { dataLabel } from '../../src/lib';
function createCases(env) {
    const { aliases, select, mountSubject, fixtures } = env;
    const cases = {};
    const hooks = [];
    const { config, dataset } = components.find(
        (c) => c.name === 'VueUiSparkHistogram',
    );
    cases.Renders = async () => {
        {
            const mounted = await mountSubject(VueUiSparkhistogram, {
                props: {
                    dataset,
                    config,
                },
            });
            let read = () => mounted;
            {
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="title"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(
                            elements.map((e) => e.textContent).join(''),
                        ).toContain(String(config.style.title.text));
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="subtitle"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(
                            elements.map((e) => e.textContent).join(''),
                        ).toContain(String(config.style.title.subtitle.text));
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
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await dispatch(read(), 'mouseover', {
                        force: true,
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="title-selection"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(
                            elements.map((e) => e.textContent).join(''),
                        ).toContain(String(dataset[0].timeLabel));
                        expect(
                            elements.map((e) => e.textContent).join(''),
                        ).toContain(
                            String(
                                dataLabel({
                                    v: dataset[0].value,
                                }),
                            ),
                        );
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select(
                            '[data-cy="title-selection-value-label"]',
                        );
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(
                            elements.map((e) => e.textContent).join(''),
                        ).toContain(String(dataset[0].valueLabel));
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="datapoint-rect"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(dataset.length);
                    });
                }
                {
                    let read = () =>
                        select('[data-cy="datapoint-label-value"]');
                    aliases.set('valueLabels', read);
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
                    let read = aliases.get('valueLabels');
                    {
                        const items = read();
                        for (let index = 0; index < items.length; index++) {
                            await (async (label, i) => {
                                {
                                    await waitFor(() => {
                                        const elements = label;
                                        expect(
                                            elements
                                                .map((e) => e.textContent)
                                                .join(''),
                                        ).toContain(
                                            String(
                                                dataLabel({
                                                    v: dataset[i].value,
                                                    r: config.style.labels.value
                                                        .rounding,
                                                }),
                                            ),
                                        );
                                    });
                                }
                            })([items[index]], index, items);
                        }
                    }
                }
                {
                    let read = () =>
                        select('[data-cy="datapoint-label-valueLabel"]');
                    aliases.set('valueLabels2', read);
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
                    let read = aliases.get('valueLabels2');
                    {
                        const items = read();
                        for (let index = 0; index < items.length; index++) {
                            await (async (label, i) => {
                                {
                                    await waitFor(() => {
                                        const elements = label;
                                        expect(
                                            elements
                                                .map((e) => e.textContent)
                                                .join(''),
                                        ).toContain(
                                            String(dataset[i].valueLabel),
                                        );
                                    });
                                }
                            })([items[index]], index, items);
                        }
                    }
                }
                {
                    let read = () => select('[data-cy="datapoint-label-time"]');
                    aliases.set('timeLabels', read);
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
                    let read = aliases.get('timeLabels');
                    {
                        const items = read();
                        for (let index = 0; index < items.length; index++) {
                            await (async (label, i) => {
                                {
                                    await waitFor(() => {
                                        const elements = label;
                                        expect(
                                            elements
                                                .map((e) => e.textContent)
                                                .join(''),
                                        ).toContain(
                                            String(dataset[i].timeLabel),
                                        );
                                    });
                                }
                            })([items[index]], index, items);
                        }
                    }
                }
            }
        }
    };
    cases.Emits = async () => {
        {
            const mounted = await mountSubject(VueUiSparkhistogram, {
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
                    await clickElements(read());
                    {
                        expect(
                            wrapper.emitted('selectDatapoint')[0][0],
                        ).to.have.keys('index', 'datapoint');
                        expect(
                            wrapper.emitted('selectDatapoint')[0][0].index,
                        ).to.equal(0);
                        expect(
                            wrapper.emitted('selectDatapoint')[0][0].datapoint,
                        ).to.have.keys(
                            'color',
                            'gradient',
                            'height',
                            'intensity',
                            'proportion',
                            'stroke',
                            'textAnchor',
                            'timeLabel',
                            'trapX',
                            'unitWidth',
                            'value',
                            'valueLabel',
                            'width',
                            'x',
                            'y',
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
    title: 'Mini Charts/VueUiSparkhistogram/Interactions',
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
