import { expect, waitFor } from 'storybook/test';
import { scenarioRender, runScenario, visible } from '../support/scenario.js';
import Title from '../../src/atoms/Title.vue';
function createCases(env) {
    const { select, mountSubject, resize } = env;
    const cases = {};
    const hooks = [];
    cases.RendersContentWithDefaultStyles = async () => {
        {
            await resize(100, 60);
        }
        {
            const mounted = await mountSubject(Title, {
                props: {
                    config: {
                        title: {
                            cy: 'title',
                            text: 'Title',
                            color: '#FF0000',
                        },
                        subtitle: {
                            cy: 'subtitle',
                            text: 'Subtitle',
                            color: '#CCCCCC',
                        },
                    },
                },
            });
            let read = () => mounted;
        }
        {
            let read = () => select('[data-cy="title"]');
            {
                const $title = read();
                {
                    await waitFor(() => {
                        const elements = $title;
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = $title;
                        expect(
                            getComputedStyle(elements[0]).getPropertyValue(
                                'font-weight',
                            ),
                        ).toBe(String('700'));
                    });
                }
                {
                    await waitFor(() => {
                        const elements = $title;
                        expect(
                            getComputedStyle(elements[0]).getPropertyValue(
                                'color',
                            ),
                        ).toBe(String('rgb(255, 0, 0)'));
                    });
                }
                {
                    await waitFor(() => {
                        const elements = $title;
                        expect(
                            getComputedStyle(elements[0]).getPropertyValue(
                                'font-size',
                            ),
                        ).toBe(String('20px'));
                    });
                }
                {
                    await waitFor(() => {
                        const elements = [document.body];
                        expect(
                            elements.map((e) => e.textContent).join(''),
                        ).toContain(String('Title'));
                    });
                }
            }
        }
        {
            let read = () => select('[data-cy="subtitle"]');
            {
                const $subtitle = read();
                {
                    await waitFor(() => {
                        const elements = $subtitle;
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = $subtitle;
                        expect(
                            getComputedStyle(elements[0]).getPropertyValue(
                                'font-weight',
                            ),
                        ).toBe(String('400'));
                    });
                }
                {
                    await waitFor(() => {
                        const elements = $subtitle;
                        expect(
                            getComputedStyle(elements[0]).getPropertyValue(
                                'color',
                            ),
                        ).toBe(String('rgb(204, 204, 204)'));
                    });
                }
                {
                    await waitFor(() => {
                        const elements = $subtitle;
                        expect(
                            getComputedStyle(elements[0]).getPropertyValue(
                                'font-size',
                            ),
                        ).toBe(String('14px'));
                    });
                }
                {
                    await waitFor(() => {
                        const elements = [document.body];
                        expect(
                            elements.map((e) => e.textContent).join(''),
                        ).toContain(String('Subtitle'));
                    });
                }
            }
        }
    };
    cases.RendersContentWithCustomStyles = async () => {
        {
            await resize(100, 70);
        }
        {
            const mounted = await mountSubject(Title, {
                props: {
                    config: {
                        title: {
                            cy: 'title',
                            text: 'Title',
                            color: '#FF0000',
                            bold: false,
                            fontSize: 24,
                        },
                        subtitle: {
                            cy: 'subtitle',
                            text: 'Subtitle',
                            color: '#CCCCCC',
                            bold: true,
                            fontSize: 16,
                        },
                    },
                },
            });
            let read = () => mounted;
        }
        {
            let read = () => select('[data-cy="title"]');
            {
                const $title = read();
                {
                    await waitFor(() => {
                        const elements = $title;
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = $title;
                        expect(
                            getComputedStyle(elements[0]).getPropertyValue(
                                'font-weight',
                            ),
                        ).toBe(String('400'));
                    });
                }
                {
                    await waitFor(() => {
                        const elements = $title;
                        expect(
                            getComputedStyle(elements[0]).getPropertyValue(
                                'color',
                            ),
                        ).toBe(String('rgb(255, 0, 0)'));
                    });
                }
                {
                    await waitFor(() => {
                        const elements = $title;
                        expect(
                            getComputedStyle(elements[0]).getPropertyValue(
                                'font-size',
                            ),
                        ).toBe(String('24px'));
                    });
                }
                {
                    await waitFor(() => {
                        const elements = [document.body];
                        expect(
                            elements.map((e) => e.textContent).join(''),
                        ).toContain(String('Title'));
                    });
                }
            }
        }
        {
            let read = () => select('[data-cy="subtitle"]');
            {
                const $subtitle = read();
                {
                    await waitFor(() => {
                        const elements = $subtitle;
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = $subtitle;
                        expect(
                            getComputedStyle(elements[0]).getPropertyValue(
                                'font-weight',
                            ),
                        ).toBe(String('700'));
                    });
                }
                {
                    await waitFor(() => {
                        const elements = $subtitle;
                        expect(
                            getComputedStyle(elements[0]).getPropertyValue(
                                'color',
                            ),
                        ).toBe(String('rgb(204, 204, 204)'));
                    });
                }
                {
                    await waitFor(() => {
                        const elements = $subtitle;
                        expect(
                            getComputedStyle(elements[0]).getPropertyValue(
                                'font-size',
                            ),
                        ).toBe(String('16px'));
                    });
                }
                {
                    await waitFor(() => {
                        const elements = [document.body];
                        expect(
                            elements.map((e) => e.textContent).join(''),
                        ).toContain(String('Subtitle'));
                    });
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
    title: 'Internal/Title/Interactions',
    render: scenarioRender,
};
export const RendersContentWithDefaultStyles = {
    name: 'renders content with default styles',
    play: async (context) =>
        runScenario(context, createCases, 'RendersContentWithDefaultStyles'),
};
export const RendersContentWithCustomStyles = {
    name: 'renders content with custom styles',
    play: async (context) =>
        runScenario(context, createCases, 'RendersContentWithCustomStyles'),
};
