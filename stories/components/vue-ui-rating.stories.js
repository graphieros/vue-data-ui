import { expect, waitFor } from 'storybook/test';
import {
    scenarioRender,
    runScenario,
    dispatch,
    clickElements,
} from '../support/scenario.js';
import { nextTick as storyNextTick } from 'vue';
import VueUiRating from '../../src/components/vue-ui-rating.vue';
function createCases(env) {
    const { aliases, select, mountSubject, resize, fixtures } = env;
    const cases = {};
    const hooks = [];
    hooks.push(async function () {
        {
            let read = () => structuredClone(fixtures['rating.json']);
            const fixtureValue = read();
            read = () => fixtureValue;
            aliases.set('fixture', read);
        }
        {
            await resize(800, 160);
        }
    });
    async function updateConfigInFixture(modifiedConfig) {
        {
            let read = aliases.get('fixture');
            {
                const fixture = read();
                const updatedFixture = {
                    ...fixture,
                    config: modifiedConfig,
                };
                {
                    let read = () => updatedFixture;
                    aliases.set('fixture', read);
                }
            }
        }
    }
    cases.RendersWithDifferentConfigAttributes = async function () {
        {
            let read = aliases.get('fixture');
            {
                const fixture = read();
                {
                    const mounted = await mountSubject(VueUiRating, {
                        props: {
                            dataset: fixture.dataset,
                            config: fixture.config,
                        },
                    });
                    let read = () => mounted;
                }
                function calculateAverageRating(source) {
                    let totalSum = 0;
                    let totalCount = 0;
                    for (const key in source) {
                        const ratingValue = parseInt(key);
                        const ratingCount = source[key];
                        totalSum += ratingValue * ratingCount;
                        totalCount += ratingCount;
                    }
                    if (totalCount === 0) {
                        return 0;
                    }
                    const averageRating = totalSum / totalCount;
                    return Math.min(
                        fixture.config.to,
                        Math.max(fixture.config.from, averageRating),
                    );
                }
                const staticRating = Math.round(
                    calculateAverageRating(fixture.dataset.rating),
                );
                {
                    await waitFor(() => {
                        const elements = select(`[data-cy="rating-title"]`);
                        expect(elements).not.toHaveLength(0);
                        expect(
                            elements.map((e) => e.textContent).join(''),
                        ).toContain(String('Title'));
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select(`[data-cy="rating-subtitle"]`);
                        expect(elements).not.toHaveLength(0);
                        expect(
                            elements.map((e) => e.textContent).join(''),
                        ).toContain(String('Subtitle'));
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select(
                            `[data-cy="rating-position-bottom"]`,
                        );
                        expect(elements).not.toHaveLength(0);
                        expect(
                            elements.map((e) => e.textContent).join(''),
                        ).toContain(String(staticRating));
                    });
                }
                let modifiedConfig = {
                    ...fixture.config,
                    style: {
                        ...fixture.config.style,
                        rating: {
                            ...fixture.config.style.rating,
                            position: 'top',
                        },
                    },
                };
                await updateConfigInFixture(modifiedConfig);
                {
                    const mounted = await mountSubject(VueUiRating, {
                        props: {
                            dataset: fixture.dataset,
                            config: modifiedConfig,
                        },
                    });
                    let read = () => mounted;
                }
                {
                    await waitFor(() => {
                        const elements = select(
                            `[data-cy="rating-position-top"]`,
                        );
                        expect(elements).not.toHaveLength(0);
                        expect(
                            elements.map((e) => e.textContent).join(''),
                        ).toContain(String(staticRating));
                    });
                }
                {
                    await storyNextTick();
                    {
                        const result = await (async () => {
                            modifiedConfig.style.rating.position = 'left';
                            await updateConfigInFixture(modifiedConfig);
                            {
                                const mounted = await mountSubject(
                                    VueUiRating,
                                    {
                                        props: {
                                            dataset: fixture.dataset,
                                            config: modifiedConfig,
                                        },
                                    },
                                );
                                let read = () => mounted;
                            }
                            {
                                await waitFor(() => {
                                    const elements = select(
                                        `[data-cy="rating-position-left"]`,
                                    );
                                    expect(elements).not.toHaveLength(0);
                                    expect(
                                        elements
                                            .map((e) => e.textContent)
                                            .join(''),
                                    ).toContain(String(staticRating));
                                });
                            }
                        })();
                    }
                }
                {
                    await storyNextTick();
                    {
                        const result = await (async () => {
                            modifiedConfig.style.rating.position = 'right';
                            await updateConfigInFixture(modifiedConfig);
                            {
                                const mounted = await mountSubject(
                                    VueUiRating,
                                    {
                                        props: {
                                            dataset: fixture.dataset,
                                            config: modifiedConfig,
                                        },
                                    },
                                );
                                let read = () => mounted;
                            }
                            {
                                await waitFor(() => {
                                    const elements = select(
                                        `[data-cy="rating-position-right"]`,
                                    );
                                    expect(elements).not.toHaveLength(0);
                                    expect(
                                        elements
                                            .map((e) => e.textContent)
                                            .join(''),
                                    ).toContain(String(staticRating));
                                });
                            }
                        })();
                    }
                }
                {
                    await storyNextTick();
                    {
                        const result = await (async () => {
                            modifiedConfig.style.rating.position = 'bottom';
                            await updateConfigInFixture(modifiedConfig);
                            {
                                const mounted = await mountSubject(
                                    VueUiRating,
                                    {
                                        props: {
                                            dataset: fixture.dataset,
                                            config: modifiedConfig,
                                        },
                                    },
                                );
                                let read = () => mounted;
                            }
                        })();
                    }
                }
                const items = fixture.config.to - fixture.config.from + 1;
                for (let i = 0; i < items; i += 1) {
                    {
                        await waitFor(() => {
                            const elements = select(
                                `[data-cy="rating-shape-${i}"]`,
                            );
                            expect(elements).not.toHaveLength(0);
                        });
                    }
                    {
                        let read = () =>
                            select(`[data-cy="rating-active-trap-${i}"]`);
                        await waitFor(() => {
                            expect(read()).not.toHaveLength(0);
                        });
                        await waitFor(() =>
                            expect(read().length).toBeGreaterThan(0),
                        );
                        await clickElements(read());
                    }
                    {
                        await waitFor(() => {
                            const elements = select(
                                `[data-cy="rating-position-bottom"]`,
                            );
                            expect(
                                elements.map((e) => e.textContent).join(''),
                            ).toContain(String(`${i + 1}`));
                        });
                    }
                }
                {
                    await storyNextTick();
                    {
                        const result = await (async () => {
                            modifiedConfig.type = 'image';
                            await updateConfigInFixture(modifiedConfig);
                            {
                                const mounted = await mountSubject(
                                    VueUiRating,
                                    {
                                        props: {
                                            dataset: fixture.dataset,
                                            config: modifiedConfig,
                                        },
                                    },
                                );
                                let read = () => mounted;
                            }
                            for (let i = 0; i < items; i += 1) {
                                {
                                    let read = () =>
                                        select(`[data-cy="rating-image-${i}"]`);
                                    {
                                        const $img = read();
                                        {
                                            await waitFor(() => {
                                                const elements = $img;
                                                expect(
                                                    elements,
                                                ).not.toHaveLength(0);
                                            });
                                        }
                                        {
                                            let read = () => $img;
                                            {
                                                const previous = read;
                                                read = () =>
                                                    previous()[0].getAttribute(
                                                        'src',
                                                    );
                                            }
                                            await waitFor(() => {
                                                expect(read()).toEqual(
                                                    fixture.config.style.image
                                                        .src,
                                                );
                                            });
                                        }
                                    }
                                }
                            }
                        })();
                    }
                }
                {
                    await storyNextTick();
                    {
                        const result = await (async () => {
                            modifiedConfig.readonly = true;
                            await updateConfigInFixture(modifiedConfig);
                            {
                                const mounted = await mountSubject(
                                    VueUiRating,
                                    {
                                        props: {
                                            dataset: fixture.dataset,
                                            config: modifiedConfig,
                                        },
                                    },
                                );
                                let read = () => mounted;
                            }
                            for (let i = 0; i < items; i += 1) {
                                {
                                    let read = () =>
                                        select(
                                            `[data-cy="rating-readonly-trap-${i}"]`,
                                        );
                                    await waitFor(() =>
                                        expect(read().length).toBeGreaterThan(
                                            0,
                                        ),
                                    );
                                    await dispatch(read(), 'mouseenter');
                                }
                                {
                                    await waitFor(() => {
                                        const elements = select(
                                            `[data-cy="rating-tooltip-${i}"]`,
                                        );
                                        expect(elements).not.toHaveLength(0);
                                        expect(
                                            elements
                                                .map((e) => e.textContent)
                                                .join(''),
                                        ).toContain(
                                            String(
                                                `${Object.keys(fixture.dataset.rating)[i]}:${fixture.dataset.rating[`${i + 1}`]}`,
                                            ),
                                        );
                                    });
                                }
                            }
                        })();
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
    title: 'Charts/VueUiRating/Interactions',
    render: scenarioRender,
};
export const RendersWithDifferentConfigAttributes = {
    name: 'renders with different config attributes',
    play: async (context) =>
        runScenario(
            context,
            createCases,
            'RendersWithDifferentConfigAttributes',
        ),
};
