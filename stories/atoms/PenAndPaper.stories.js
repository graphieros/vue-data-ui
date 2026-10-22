import { expect, waitFor } from 'storybook/test';
import {
    scenarioRender,
    runScenario,
    dispatch,
    clickElements,
    visible,
} from '../support/scenario.js';
import PenAndPaper from '../../src/atoms/NonSvgPenAndPaper.vue';
function createCases(env) {
    const { aliases, select, mountSubject } = env;
    const cases = {};
    const hooks = [];
    hooks.push(async () => {
        const parent = document.createElement('div');
        {
            let read = () => select('body');
            read().forEach((e) => e.style.setProperty('overflow', 'hidden'));
        }
        parent.style.height = '500px';
        parent.style.width = '500px';
        parent.style.position = 'fixed';
        document.body.appendChild(parent);
        {
            const mounted = await mountSubject(PenAndPaper, {
                props: {
                    active: true,
                    backgroundColor: '#FFFFFF',
                    color: '#2D353C',
                    parent: parent,
                },
            });
            let read = () => mounted;
        }
    });
    cases.RendersCorrectlyWhenActive = async () => {
        {
            await waitFor(() => {
                const elements = select('.vue-ui-pen-and-paper-actions');
                expect(elements.length).toBeGreaterThan(0);
                expect(elements.some(visible)).toBe(true);
            });
        }
    };
    cases.DrawsStraightLines = async () => {
        {
            let read = () => select('[data-cy="pen-and-paper"]');
            aliases.set('svg', read);
            await waitFor(() => expect(read().length).toBeGreaterThan(0));
            await dispatch(read(), 'mousedown', {
                clientX: 100,
                clientY: 100,
                force: true,
            });
            await waitFor(() => expect(read().length).toBeGreaterThan(0));
            await dispatch(read(), 'mousemove', {
                clientX: 200,
                clientY: 200,
                force: true,
            });
            await waitFor(() => expect(read().length).toBeGreaterThan(0));
            await dispatch(read(), 'mouseup', {
                force: true,
            });
        }
        {
            await waitFor(() => {
                const elements = select('.vue-ui-pen-and-paper-path');
                expect(elements).not.toHaveLength(0);
                expect(elements.length).toBeGreaterThan(0);
                expect(elements.some(visible)).toBe(true);
            });
        }
    };
    cases.DrawsLines = async () => {
        {
            let read = () => select('[data-cy="pen-and-paper-toggle-text"]');
            await waitFor(() => expect(read().length).toBeGreaterThan(0));
            await clickElements(read(), {
                force: true,
            });
        }
        {
            let read = () => select('[data-cy="pen-and-paper-toggle-text"]');
            await waitFor(() => expect(read().length).toBeGreaterThan(0));
            await clickElements(read(), {
                force: true,
            });
        }
        {
            let read = () => select('[data-cy="pen-and-paper-toggle-text"]');
            await waitFor(() => expect(read().length).toBeGreaterThan(0));
            await clickElements(read(), {
                force: true,
            });
        }
        {
            let read = () => select('[data-cy="pen-and-paper"]');
            aliases.set('svg', read);
            await waitFor(() => expect(read().length).toBeGreaterThan(0));
            await dispatch(read(), 'mousedown', {
                clientX: 100,
                clientY: 100,
                force: true,
            });
            await waitFor(() => expect(read().length).toBeGreaterThan(0));
            await dispatch(read(), 'mousemove', {
                clientX: 200,
                clientY: 200,
                force: true,
            });
            await waitFor(() => expect(read().length).toBeGreaterThan(0));
            await dispatch(read(), 'mouseup', {
                force: true,
            });
        }
        {
            await waitFor(() => {
                const elements = select('.vue-ui-pen-and-paper-path');
                expect(elements).not.toHaveLength(0);
                expect(elements.length).toBeGreaterThan(0);
                expect(elements.some(visible)).toBe(true);
            });
        }
        {
            let read = () => select('[data-cy="pen-and-paper-thickness"]');
            read().forEach((e) => (e.value = 12));
            await waitFor(() => expect(read().length).toBeGreaterThan(0));
            await dispatch(read(), 'input');
        }
        {
            let read = () => select('[data-cy="pen-and-paper"]');
            aliases.set('svg', read);
            await waitFor(() => expect(read().length).toBeGreaterThan(0));
            await dispatch(read(), 'mousedown', {
                clientX: 200,
                clientY: 100,
                force: true,
            });
            await waitFor(() => expect(read().length).toBeGreaterThan(0));
            await dispatch(read(), 'mousemove', {
                clientX: 300,
                clientY: 200,
                force: true,
            });
            await waitFor(() => expect(read().length).toBeGreaterThan(0));
            await dispatch(read(), 'mouseup', {
                force: true,
            });
        }
        {
            await waitFor(() => {
                const elements = select('.vue-ui-pen-and-paper-path');
                expect(elements).toHaveLength(2);
            });
        }
        {
            let read = () => select('.vue-ui-pen-and-paper-path');
            {
                const previous = read;
                read = () => {
                    const element = previous().at(0);
                    return element ? [element] : [];
                };
            }
            await waitFor(() => {
                expect(read()[0].getAttribute('stroke-width')).toBe(String(1));
            });
        }
        {
            let read = () => select('.vue-ui-pen-and-paper-path');
            {
                const previous = read;
                read = () => {
                    const element = previous().at(1);
                    return element ? [element] : [];
                };
            }
            await waitFor(() => {
                expect(read()[0].getAttribute('stroke-width')).toBe(String(12));
            });
        }
        {
            let read = () => select('[data-cy="pen-and-paper-undo"]');
            await waitFor(() => expect(read().length).toBeGreaterThan(0));
            await clickElements(read());
        }
        {
            await waitFor(() => {
                const elements = select('.vue-ui-pen-and-paper-path');
                expect(elements).toHaveLength(1);
            });
        }
        {
            let read = () => select('.vue-ui-pen-and-paper-path');
            {
                const previous = read;
                read = () => {
                    const element = previous().at(0);
                    return element ? [element] : [];
                };
            }
            await waitFor(() => {
                expect(read()[0].getAttribute('stroke-width')).toBe(String(1));
            });
        }
        {
            let read = () => select('[data-cy="pen-and-paper-redo"]');
            await waitFor(() => expect(read().length).toBeGreaterThan(0));
            await clickElements(read());
        }
        {
            await waitFor(() => {
                const elements = select('.vue-ui-pen-and-paper-path');
                expect(elements).toHaveLength(2);
            });
        }
        {
            let read = () => select('.vue-ui-pen-and-paper-path');
            {
                const previous = read;
                read = () => {
                    const element = previous().at(0);
                    return element ? [element] : [];
                };
            }
            await waitFor(() => {
                expect(read()[0].getAttribute('stroke-width')).toBe(String(1));
            });
        }
        {
            let read = () => select('.vue-ui-pen-and-paper-path');
            {
                const previous = read;
                read = () => {
                    const element = previous().at(1);
                    return element ? [element] : [];
                };
            }
            await waitFor(() => {
                expect(read()[0].getAttribute('stroke-width')).toBe(String(12));
            });
        }
        {
            let read = () => select('[data-cy="pen-and-paper-reset"]');
            await waitFor(() => expect(read().length).toBeGreaterThan(0));
            await clickElements(read());
        }
        {
            await waitFor(() => {
                const elements = select('.vue-ui-pen-and-paper-path');
                expect(elements).toHaveLength(0);
            });
        }
        {
            let read = () => select('[data-cy="color-picker-icon"]');
            await waitFor(() => expect(read().length).toBeGreaterThan(0));
            await clickElements(read());
        }
        {
            await waitFor(() => {
                const elements = select('[data-cy="color-picker"]');
                expect(elements).not.toHaveLength(0);
                expect(elements.length).toBeGreaterThan(0);
                expect(elements.some(visible)).toBe(true);
            });
        }
        {
            let read = () => select('[data-cy="color-picker-option"]');
            {
                const previous = read;
                read = () => {
                    const element = previous().at(2);
                    return element ? [element] : [];
                };
            }
            await waitFor(() => expect(read().length).toBeGreaterThan(0));
            await clickElements(read());
        }
        {
            let read = () => select('[data-cy="color-picker-icon"]');
            {
                const previous = read;
                read = () =>
                    getComputedStyle(previous()[0]).getPropertyValue(
                        'background-color',
                    );
            }
            await waitFor(() => {
                expect(read()).toEqual('rgb(255, 87, 51)');
            });
        }
        {
            let read = () => select('[data-cy="pen-and-paper"]');
            aliases.set('svg', read);
            await waitFor(() => expect(read().length).toBeGreaterThan(0));
            await dispatch(read(), 'mousedown', {
                clientX: 200,
                clientY: 100,
                force: true,
            });
            await waitFor(() => expect(read().length).toBeGreaterThan(0));
            await dispatch(read(), 'mousemove', {
                clientX: 300,
                clientY: 200,
                force: true,
            });
            await waitFor(() => expect(read().length).toBeGreaterThan(0));
            await dispatch(read(), 'mouseup', {
                force: true,
            });
        }
        {
            let read = () => select('.vue-ui-pen-and-paper-path');
            {
                const previous = read;
                read = () => {
                    const element = previous().at(0);
                    return element ? [element] : [];
                };
            }
            await waitFor(() => {
                expect(read().length).toBeGreaterThan(0);
                expect(read().some(visible)).toBe(true);
            });
            {
                const previous = read;
                read = () =>
                    getComputedStyle(previous()[0]).getPropertyValue('stroke');
            }
            await waitFor(() => {
                expect(read()).toEqual('rgb(255, 87, 51)');
            });
        }
    };
    cases.RendersText = async () => {
        {
            let read = () => select('[data-cy="pen-and-paper-toggle-text"]');
            await waitFor(() => expect(read().length).toBeGreaterThan(0));
            await clickElements(read(), {
                force: true,
            });
        }
        {
            let read = () => select('[data-cy="pen-and-paper-font-size"]');
            read().forEach((e) => (e.value = 24));
            await waitFor(() => expect(read().length).toBeGreaterThan(0));
            await dispatch(read(), 'input');
        }
        {
            let read = () => select('[data-cy="pen-and-paper"]');
            await waitFor(() => expect(read().length).toBeGreaterThan(0));
            await dispatch(read(), 'mousedown', {
                clientX: 150,
                clientY: 180,
                force: true,
            });
        }
        {
            let read = () => window;
            {
                const win = read();
                ['h', 'e', 'l', 'l', 'o', 'Enter', 'ع', 'ر', 'ب', 'ي'].forEach(
                    (char) => {
                        win.dispatchEvent(
                            new win.KeyboardEvent('keydown', {
                                key: char === 'Enter' ? 'Enter' : char,
                                bubbles: true,
                            }),
                        );
                    },
                );
            }
        }
        {
            let read = () => select('body');
            await waitFor(() => expect(read().length).toBeGreaterThan(0));
            await clickElements(read(), 0, 0, {
                force: true,
            });
        }
        {
            await waitFor(() => {
                const elements = select('[data-cy="pen-and-paper"] g text');
                expect(elements).not.toHaveLength(0);
                expect(elements.length).toBeGreaterThan(0);
                expect(elements.some(visible)).toBe(true);
            });
        }
        {
            await waitFor(() => {
                const elements = select(
                    '[data-cy="pen-and-paper"] g text tspan',
                );
                expect(elements.length).toBeGreaterThanOrEqual(2);
            });
        }
        {
            await waitFor(() => {
                const elements = select('[data-cy="pen-and-paper"] g text');
                expect(elements.map((e) => e.textContent).join('')).toContain(
                    String('hello'),
                );
            });
        }
        {
            await waitFor(() => {
                const elements = select('[data-cy="pen-and-paper"] g text');
                expect(elements.map((e) => e.textContent).join('')).toContain(
                    String('عربي'),
                );
            });
        }
    };
    return {
        cases,
        hooks,
    };
}
export default {
    title: 'Internal/PenAndPaper/Interactions',
    render: scenarioRender,
};
export const RendersCorrectlyWhenActive = {
    name: 'renders correctly when active',
    play: async (context) =>
        runScenario(context, createCases, 'RendersCorrectlyWhenActive'),
};
export const DrawsStraightLines = {
    name: 'draws straight lines',
    play: async (context) =>
        runScenario(context, createCases, 'DrawsStraightLines'),
};
export const DrawsLines = {
    name: 'draws lines',
    play: async (context) => runScenario(context, createCases, 'DrawsLines'),
};
export const RendersText = {
    name: 'renders text',
    play: async (context) => runScenario(context, createCases, 'RendersText'),
};
