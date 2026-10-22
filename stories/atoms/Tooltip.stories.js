import { expect, waitFor } from 'storybook/test';
import { scenarioRender, runScenario, dispatch } from '../support/scenario.js';
import Tooltip from '../../src/atoms/Tooltip.vue';
function createCases(env) {
    const { select, mountSubject } = env;
    const cases = {};
    const hooks = [];
    hooks.push(async () => {
        {
            const mounted = await mountSubject(Tooltip, {
                props: {
                    content: `<div data-cy="tooltip-content">Content</div>`,
                    show: true,
                    disableSmoothing: true,
                    smooth: false,
                },
                slots: {
                    default: {
                        render: () => 'Default slot',
                    },
                    ['tooltip-before']: {
                        render: () => 'Slot before',
                    },
                    ['tooltip-after']: {
                        render: () => 'Slot after',
                    },
                },
            });
            let read = () => mounted;
        }
    });
    cases.RendersAllContents = async () => {
        {
            await waitFor(() => {
                const elements = [document.body];
                expect(elements.map((e) => e.textContent).join('')).toContain(
                    String('Default slot'),
                );
            });
        }
        {
            await waitFor(() => {
                const elements = [document.body];
                expect(elements.map((e) => e.textContent).join('')).toContain(
                    String('Content'),
                );
            });
        }
        {
            await waitFor(() => {
                const elements = [document.body];
                expect(elements.map((e) => e.textContent).join('')).toContain(
                    String('Slot before'),
                );
            });
        }
        {
            await waitFor(() => {
                const elements = [document.body];
                expect(elements.map((e) => e.textContent).join('')).toContain(
                    String('Slot after'),
                );
            });
        }
    };
    cases.FollowsTheMouse = async () => {
        {
            let read = () => select('body');
            await waitFor(() => expect(read().length).toBeGreaterThan(0));
            await dispatch(read(), 'mousemove', {
                clientX: 200,
                clientY: 200,
                force: true,
            });
        }
        {
            await waitFor(() => {
                const elements = select('[data-cy="tooltip"]');
                expect(
                    getComputedStyle(elements[0]).getPropertyValue('top'),
                ).toBe(String('0px'));
            });
        }
        {
            await waitFor(() => {
                const elements = select('[data-cy="tooltip"]');
                expect(
                    getComputedStyle(elements[0]).getPropertyValue('left'),
                ).toBe(String('0px'));
            });
        }
        {
            await waitFor(() => {
                const elements = select('[data-cy="tooltip"]');
                expect(
                    getComputedStyle(elements[0]).getPropertyValue('transform'),
                ).toBe(String('matrix(1, 0, 0, 1, 200, 224)'));
            });
        }
    };
    return {
        cases,
        hooks,
    };
}
export default {
    title: 'Internal/Tooltip/Interactions',
    render: scenarioRender,
};
export const RendersAllContents = {
    name: 'renders all contents',
    play: async (context) =>
        runScenario(context, createCases, 'RendersAllContents'),
};
export const FollowsTheMouse = {
    name: 'follows the mouse',
    play: async (context) =>
        runScenario(context, createCases, 'FollowsTheMouse'),
};
