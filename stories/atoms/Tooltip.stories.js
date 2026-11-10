import { expect, waitFor } from 'storybook/test';
import { nextTick } from 'vue';
import { calcTooltipPosition } from '../../src/calcTooltipPosition';
import { scenarioRender, runScenario, dispatch } from '../support/scenario.js';
import Tooltip from '../../src/atoms/Tooltip.vue';
function createCases(env) {
    const { select, mountSubject, spy } = env;
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
    cases.CachedGeometry = async () => {
        const parent = document.createElement('div');
        parent.style.cssText =
            'position:fixed;left:100px;top:100px;width:400px;height:300px';
        document.body.appendChild(parent);
        const { wrapper } = await mountSubject(Tooltip, {
            props: {
                parent,
                show: true,
                smooth: true,
                backdropFilter: false,
                content: '<div style="width:100px;height:40px">First</div>',
            },
        });
        await waitFor(() =>
            expect(select('[data-cy="tooltip"]')).toHaveLength(1),
        );
        const element = select('[data-cy="tooltip"]')[0];
        const settle = async () => {
            await nextTick();
            for (let i = 0; i < 3; i++)
                await new Promise(requestAnimationFrame);
        };
        await settle();
        const width = element.getBoundingClientRect().width;
        const tooltipMeasure = spy(element, 'getBoundingClientRect');
        const chartMeasure = spy(parent, 'getBoundingClientRect');
        tooltipMeasure.mockClear();
        chartMeasure.mockClear();
        window.dispatchEvent(
            new MouseEvent('mousemove', { clientX: 300, clientY: 200 }),
        );
        await waitFor(() =>
            expect(element.style.transform).toBe(
                `translate3d(${Math.round(300 - width / 2)}px, 224px, 0px)`,
            ),
        );
        expect(tooltipMeasure).not.toHaveBeenCalled();
        expect(chartMeasure).not.toHaveBeenCalled();
        await wrapper.setProps({
            smooth: false,
            content: '<div style="width:200px;height:80px">Larger</div>',
        });
        await waitFor(() => {
            const expected = calcTooltipPosition({
                tooltip: element,
                chart: parent,
                clientPosition: { x: 300, y: 200 },
            });
            expect(element.style.transform).toBe(
                `translate3d(${Math.round(expected.left)}px, ${Math.round(expected.top)}px, 0px)`,
            );
        });
        parent.style.left = '350px';
        await waitFor(() =>
            expect(element.style.transform).toBe(
                'translate3d(350px, 224px, 0px)',
            ),
        );
        // Keyboard anchoring remains fixed while mouse movement continues.
        await wrapper.setProps({
            smooth: true,
            isA11yMode: true,
            a11yPosition: { x: 500, y: 250 },
        });
        await settle();
        const anchored = element.style.transform;
        window.dispatchEvent(
            new MouseEvent('mousemove', { clientX: 700, clientY: 350 }),
        );
        await settle();
        expect(element.style.transform).toBe(anchored);
        // Moving the same tooltip into a scaled containing block refreshes its
        // coordinate system without changing the existing placement rules.
        parent.style.transformOrigin = '0 0';
        parent.style.transform = 'scale(2)';
        await wrapper.setProps({ isFullscreen: true });
        await waitFor(() => {
            expect(parent.contains(element)).toBe(true);
            const rect = parent.getBoundingClientRect();
            const localChart = {
                getBoundingClientRect: () => ({
                    left: 0,
                    top: 0,
                    right: rect.width / 2,
                    bottom: rect.height / 2,
                }),
            };
            const expected = calcTooltipPosition({
                tooltip: element,
                chart: localChart,
                clientPosition: {
                    x: (500 - rect.left) / 2,
                    y: (250 - rect.top) / 2,
                },
            });
            expect(element.style.transform).toBe(
                `translate3d(${Math.round(expected.left)}px, ${Math.round(expected.top)}px, 0px)`,
            );
        });
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

export const CachedGeometry = {
    name: 'cached geometry and keyboard mode',
    play: async (context) =>
        runScenario(context, createCases, 'CachedGeometry'),
};
