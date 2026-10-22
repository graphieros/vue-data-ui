import { expect, waitFor } from 'storybook/test';
import {
    scenarioRender,
    runScenario,
    clickElements,
} from '../support/scenario.js';
import VueUiSparkbar from '../../src/components/vue-ui-sparkbar.vue';
import { components } from '../fixtures/components.js';
import { dataLabel } from '../../src/lib';
function createCases(env) {
    const { select, mountSubject, fixtures } = env;
    const cases = {};
    const hooks = [];
    const { config, dataset } = components.find(
        (c) => c.name === 'VueUiSparkbar',
    );
    cases.Renders = async () => {
        {
            const mounted = await mountSubject(VueUiSparkbar, {
                props: {
                    dataset,
                    // This scenario checks formatted final values.
                    config: {
                        ...config,
                        style: {
                            ...config.style,
                            animation: {
                                ...config.style.animation,
                                show: false,
                            },
                        },
                    },
                },
            });
            let read = () => mounted;
            {
                for (let i = 0; i < dataset.length; i += 1) {
                    {
                        await waitFor(() => {
                            const elements = select(
                                `[data-cy="sparkbar-svg-${i}"]`,
                            );
                            expect(elements).not.toHaveLength(0);
                        });
                    }
                    {
                        await waitFor(() => {
                            const elements = select(
                                `[data-cy="sparkbar-name-${i}"]`,
                            );
                            expect(elements).not.toHaveLength(0);
                            expect(
                                elements.map((e) => e.textContent).join(''),
                            ).toContain(String(dataset[i].name));
                        });
                    }
                    {
                        await waitFor(() => {
                            const elements = select(
                                `[data-cy="sparkbar-value-${i}"]`,
                            );
                            expect(elements).not.toHaveLength(0);
                            expect(
                                elements.map((e) => e.textContent).join(''),
                            ).toContain(
                                String(
                                    dataLabel({
                                        p: dataset[i].prefix,
                                        v: dataset[i].value,
                                        s: dataset[i].suffix,
                                        r: dataset[i].rounding,
                                    }),
                                ),
                            );
                        });
                    }
                    if (config.style.layout.showTargetValue) {
                        const targetValueText =
                            config.style.layout.targetValueText;
                        const target =
                            config.style.layout.target ??
                            dataset[i].target ??
                            0;
                        const formattedValue = dataLabel({
                            p: dataset[i].prefix || '',
                            v: target,
                            s: dataset[i].suffix || '',
                            r: dataset[i].rounding || 0,
                        });
                        const expectedText =
                            `${targetValueText} ${formattedValue}`.trim();
                        {
                            let read = () =>
                                select(
                                    `[data-cy="sparkbar-target-value-${i}"]`,
                                );
                            await waitFor(() => {
                                expect(read()).not.toHaveLength(0);
                            });
                            {
                                const previous = read;
                                read = () =>
                                    previous()
                                        .map((e) => e.textContent)
                                        .join('');
                            }
                            {
                                const text = read();
                                expect(text.trim()).to.eq(expectedText);
                            }
                        }
                    }
                }
            }
        }
    };
    cases.RendersWithCustomTitleAndSubtitleUsingSlots = async () => {
        const customTitle = 'Custom Title';
        const customSubtitle = 'Custom Subtitle';
        {
            const mounted = await mountSubject(VueUiSparkbar, {
                props: {
                    dataset,
                    config,
                },
                slots: {
                    title: `<div>
					<div data-cy="custom-title">${customTitle}</div>
					<div data-cy="custom-subtitle">${customSubtitle}</div>
				</div>`,
                },
            });
            let read = () => mounted;
            {
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="custom-title"]');
                        expect(elements).not.toHaveLength(0);
                        expect(
                            elements.map((e) => e.textContent).join(''),
                        ).toContain(String(customTitle));
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="custom-subtitle"]');
                        expect(elements).not.toHaveLength(0);
                        expect(
                            elements.map((e) => e.textContent).join(''),
                        ).toContain(String(customSubtitle));
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select(
                            '[data-cy="sparkbar-title-wrapper"]',
                        );
                        expect(elements).toHaveLength(0);
                    });
                }
            }
        }
    };
    cases.RendersWithDefaultTitleWhenNoSlotIsProvided = async () => {
        {
            const mounted = await mountSubject(VueUiSparkbar, {
                props: {
                    dataset,
                    config,
                },
            });
            let read = () => mounted;
            {
                {
                    await waitFor(() => {
                        const elements = select(
                            '[data-cy="sparkbar-title-wrapper"]',
                        );
                        expect(elements).not.toHaveLength(0);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="sparkbar-title"]');
                        expect(elements).not.toHaveLength(0);
                        expect(
                            elements.map((e) => e.textContent).join(''),
                        ).toContain(String(config.style.title.text));
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select(
                            '[data-cy="sparkbar-subtitle"]',
                        );
                        expect(elements).not.toHaveLength(0);
                        expect(
                            elements.map((e) => e.textContent).join(''),
                        ).toContain(String(config.style.title.subtitle.text));
                    });
                }
            }
        }
    };
    cases.Emits = async () => {
        {
            const mounted = await mountSubject(VueUiSparkbar, {
                props: {
                    dataset,
                    config,
                },
            });
            let read = () => mounted;
            {
                const { wrapper } = read();
                {
                    let read = () => select('[data-cy="datapoint-wrapper"]');
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
                            'color',
                            'formatter',
                            'name',
                            'prefix',
                            'rounding',
                            'suffix',
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
    title: 'Mini Charts/VueUiSparkbar/Interactions',
    render: scenarioRender,
};
export const Renders = {
    name: 'renders',
    play: async (context) => runScenario(context, createCases, 'Renders'),
};
export const RendersWithCustomTitleAndSubtitleUsingSlots = {
    name: 'renders with custom title and subtitle using slots',
    play: async (context) =>
        runScenario(
            context,
            createCases,
            'RendersWithCustomTitleAndSubtitleUsingSlots',
        ),
};
export const RendersWithDefaultTitleWhenNoSlotIsProvided = {
    name: 'renders with default title when no slot is provided',
    play: async (context) =>
        runScenario(
            context,
            createCases,
            'RendersWithDefaultTitleWhenNoSlotIsProvided',
        ),
};
export const Emits = {
    name: 'emits',
    play: async (context) => runScenario(context, createCases, 'Emits'),
};
