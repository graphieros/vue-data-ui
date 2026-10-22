import { expect, waitFor } from 'storybook/test';
import {
    scenarioRender,
    runScenario,
    dispatch,
    clickElements,
} from '../support/scenario.js';
import VueUiCursor from '../../src/components/vue-ui-cursor.vue';
function createCases(env) {
    const { select, mountSubject, resize } = env;
    const cases = {};
    const hooks = [];
    hooks.push(async () => {
        {
            let read = () => select('[data-cy-root]');
            {
                const $root = read();
                const div = document.createElement('div');
                div.id = 'container';
                div.style.position = 'relative';
                div.style.height = '400px';
                div.style.width = '400px';
                div.style.background = '#1A1A1A';
                div.innerText = 'HW!';
                $root[0].append(div);
            }
        }
    });
    cases.Renders = async () => {
        {
            await resize(500, 500);
        }
        {
            const mounted = await mountSubject(VueUiCursor, {
                props: {
                    config: {
                        parentId: 'container',
                    },
                },
            });
            let read = () => mounted;
            {
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="vue-ui-cursor"]');
                        expect(elements).not.toHaveLength(0);
                    });
                }
                {
                    let read = () => select('#container');
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await dispatch(read(), 'mousemove', {
                        clientX: 250,
                        clientY: 250,
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="center-circle"]');
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
                        const elements = select('[data-cy="bubble"]');
                        expect(elements).not.toHaveLength(0);
                        expect(
                            getComputedStyle(elements[0]).getPropertyValue(
                                'opacity',
                            ),
                        ).toBe(String('1'));
                    });
                }
                {
                    let read = () => select('#container');
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await clickElements(read());
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="wave"]');
                        expect(elements).not.toHaveLength(0);
                        expect(
                            getComputedStyle(elements[0]).getPropertyValue(
                                'opacity',
                            ),
                        ).not.toBe('');
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="crosshair-x-left"]');
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
                        const elements = select(
                            '[data-cy="crosshair-x-right"]',
                        );
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
                        const elements = select('[data-cy="crosshair-y-top"]');
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
                        const elements = select(
                            '[data-cy="crosshair-y-bottom"]',
                        );
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
                        const elements = select(
                            '[data-cy="intersect-circle-left"]',
                        );
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
                        const elements = select(
                            '[data-cy="intersect-circle-top"]',
                        );
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
                        const elements = select(
                            '[data-cy="intersect-circle-right"]',
                        );
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
                        const elements = select(
                            '[data-cy="intersect-circle-bottom"]',
                        );
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
                        const elements = select('[data-cy="coordinates-x"]');
                        expect(elements).not.toHaveLength(0);
                        expect(
                            elements.map((e) => e.textContent).join(''),
                        ).toContain(String('200'));
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="coordinates-y"]');
                        expect(elements).not.toHaveLength(0);
                        expect(
                            elements.map((e) => e.textContent).join(''),
                        ).toContain(String('200'));
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
    title: 'Charts/VueUiCursor/Interactions',
    render: scenarioRender,
};
export const Renders = {
    name: 'renders',
    play: async (context) => runScenario(context, createCases, 'Renders'),
};
