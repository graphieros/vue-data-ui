import { expect, waitFor } from 'storybook/test';
import {
    scenarioRender,
    runScenario,
    dispatch,
    clickElements,
} from '../support/scenario.js';
import VueUiSmiley from '../../src/components/vue-ui-smiley.vue';
function createCases(env) {
    const { aliases, select, mountSubject, resize, fixtures } = env;
    const cases = {};
    const hooks = [];
    hooks.push(async function () {
        {
            let read = () => structuredClone(fixtures['smiley.json']);
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
                    const mounted = await mountSubject(VueUiSmiley, {
                        props: {
                            dataset: fixture.dataset,
                            config: fixture.config,
                        },
                    });
                    let read = () => mounted;
                }
                function calculateAverageRating(source) {
                    if (source === null) return null;
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
                    return averageRating;
                }
                const staticRating = Math.round(
                    calculateAverageRating(fixture.dataset.rating),
                );
                {
                    await waitFor(() => {
                        const elements = select(`[data-cy="smiley-title"]`);
                        expect(elements).not.toHaveLength(0);
                        expect(
                            elements.map((e) => e.textContent).join(''),
                        ).toContain(String('Title'));
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select(`[data-cy="smiley-subtitle"]`);
                        expect(elements).not.toHaveLength(0);
                        expect(
                            elements.map((e) => e.textContent).join(''),
                        ).toContain(String('Subtitle'));
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select(
                            `[data-cy="smiley-position-bottom"]`,
                        );
                        expect(elements).not.toHaveLength(0);
                        expect(
                            elements.map((e) => e.textContent).join(''),
                        ).toContain(String(staticRating));
                    });
                }
                for (let i = 0; i < 5; i += 1) {
                    {
                        let read = () => select(`[data-cy="smiley-item-${i}"]`);
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
                                `[data-cy="smiley-position-bottom"]`,
                            );
                            expect(
                                elements.map((e) => e.textContent).join(''),
                            ).toContain(String(`${i + 1}`));
                        });
                    }
                }
                let modifiedConfig = {
                    ...fixture.config,
                    readonly: true,
                };
                await updateConfigInFixture(modifiedConfig);
                {
                    const mounted = await mountSubject(VueUiSmiley, {
                        props: {
                            dataset: fixture.dataset,
                            config: modifiedConfig,
                        },
                    });
                    let read = () => mounted;
                }
                for (let i = 0; i < 5; i += 1) {
                    {
                        let read = () => select(`[data-cy="smiley-item-${i}"]`);
                        await waitFor(() =>
                            expect(read().length).toBeGreaterThan(0),
                        );
                        await dispatch(read(), 'mouseenter');
                    }
                    {
                        await waitFor(() => {
                            const elements = select(
                                `[data-cy="smiley-tooltip-${i}"]`,
                            );
                            expect(elements).not.toHaveLength(0);
                            expect(
                                elements.map((e) => e.textContent).join(''),
                            ).toContain(
                                String(
                                    `${Object.keys(fixture.dataset.rating)[i]}:${fixture.dataset.rating[i + 1]}`,
                                ),
                            );
                        });
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
    title: 'Charts/VueUiSmiley/Interactions',
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
