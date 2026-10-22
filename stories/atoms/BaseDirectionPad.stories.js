import { expect, waitFor, fn } from 'storybook/test';
import {
    scenarioRender,
    runScenario,
    clickElements,
} from '../support/scenario.js';
import { defineComponent, ref } from 'vue';
import BaseDirectionPad from '../../src/atoms/BaseDirectionPad.vue';
function createCases(env) {
    const { aliases, select, mountSubject } = env;
    const cases = {};
    const hooks = [];
    cases.RendersCorrectlyWithDefaultProps = async () => {
        {
            const mounted = await mountSubject(
                defineComponent({
                    components: {
                        BaseDirectionPad,
                    },
                    template: '<BaseDirectionPad />',
                }),
            );
            let read = () => mounted;
        }
        {
            await waitFor(() => {
                const elements = select('button');
                expect(elements).toHaveLength(5);
            });
        }
        {
            let read = () => select('button');
            {
                const previous = read;
                read = () => {
                    const element = previous().at(0);
                    return element ? [element] : [];
                };
            }
            await waitFor(() => {
                expect(
                    getComputedStyle(read()[0]).getPropertyValue('position'),
                ).toBe(String('absolute'));
            });
        }
        {
            let read = () => select('button');
            {
                const previous = read;
                read = () => {
                    const element = previous().at(0);
                    return element ? [element] : [];
                };
            }
            await waitFor(() => {
                expect(
                    getComputedStyle(read()[0]).getPropertyValue('left'),
                ).toBe(String('0px'));
            });
        }
        {
            let read = () => select('[data-cy="base-icon"]');
            {
                const items = read();
                for (let index = 0; index < items.length; index++) {
                    await (async (icon) => {
                        {
                            let read = () => icon;
                            aliases.set('icon', read);
                        }
                        {
                            let read = aliases.get('icon');
                            {
                                const previous = read;
                                read = () =>
                                    previous().flatMap((element) =>
                                        select('path', element),
                                    );
                            }
                            {
                                const previous = read;
                                read = () => {
                                    const element = previous().at(0);
                                    return element ? [element] : [];
                                };
                            }
                            await waitFor(() =>
                                (($path) => {
                                    const stroke =
                                        $path[0].getAttribute('stroke');
                                    const fill = $path[0].getAttribute('fill');
                                    if (stroke !== 'none') {
                                        expect(stroke).to.eq('#1A1A1A');
                                    } else if (fill) {
                                        expect(fill).to.eq('#1A1A1A');
                                    }
                                })(read()),
                            );
                        }
                    })([items[index]], index, items);
                }
            }
        }
    };
    cases.Emits = async () => {
        const moveLeft = fn();
        const moveTop = fn();
        const moveRight = fn();
        const moveBottom = fn();
        const reset = fn();
        {
            const mounted = await mountSubject(
                defineComponent({
                    components: {
                        BaseDirectionPad,
                    },
                    setup() {
                        return {
                            moveLeft,
                            moveTop,
                            moveRight,
                            moveBottom,
                            reset,
                        };
                    },
                    template: `
                <BaseDirectionPad 
                    @moveLeft="moveLeft"
                    @moveTop="moveTop"
                    @moveRight="moveRight"
                    @moveBottom="moveBottom"
                    @reset="reset"
                />
            `,
                }),
            );
            let read = () => mounted;
        }
        {
            let read = () => select('[data-cy="direction-pad-left"]');
            await waitFor(() => expect(read().length).toBeGreaterThan(0));
            await clickElements(read());
        }
        {
            await waitFor(() => {
                const elements = moveLeft;
                expect(elements).toHaveBeenCalledTimes(1);
            });
        }
        {
            let read = () => select('[data-cy="direction-pad-top"]');
            await waitFor(() => expect(read().length).toBeGreaterThan(0));
            await clickElements(read());
        }
        {
            await waitFor(() => {
                const elements = moveTop;
                expect(elements).toHaveBeenCalledTimes(1);
            });
        }
        {
            let read = () => select('[data-cy="direction-pad-right"]');
            await waitFor(() => expect(read().length).toBeGreaterThan(0));
            await clickElements(read());
        }
        {
            await waitFor(() => {
                const elements = moveRight;
                expect(elements).toHaveBeenCalledTimes(1);
            });
        }
        {
            let read = () => select('[data-cy="direction-pad-bottom"]');
            await waitFor(() => expect(read().length).toBeGreaterThan(0));
            await clickElements(read());
        }
        {
            await waitFor(() => {
                const elements = moveBottom;
                expect(elements).toHaveBeenCalledTimes(1);
            });
        }
        {
            let read = () => select('[data-cy="direction-pad-reset"]');
            await waitFor(() => expect(read().length).toBeGreaterThan(0));
            await clickElements(read());
        }
        {
            await waitFor(() => {
                const elements = reset;
                expect(elements).toHaveBeenCalledTimes(1);
            });
        }
    };
    cases.HandlesColorProp = async () => {
        {
            const mounted = await mountSubject(
                defineComponent({
                    components: {
                        BaseDirectionPad,
                    },
                    setup() {
                        const color = ref('#FF0000');
                        return {
                            color,
                        };
                    },
                    template: `
                <BaseDirectionPad :color="color" />
            `,
                }),
            );
            let read = () => mounted;
        }
        {
            let read = () => select('[data-cy="base-icon"]');
            {
                const items = read();
                for (let index = 0; index < items.length; index++) {
                    await (async (icon) => {
                        {
                            let read = () => icon;
                            aliases.set('icon', read);
                        }
                        {
                            let read = aliases.get('icon');
                            {
                                const previous = read;
                                read = () =>
                                    previous().flatMap((element) =>
                                        select('path', element),
                                    );
                            }
                            {
                                const previous = read;
                                read = () => {
                                    const element = previous().at(0);
                                    return element ? [element] : [];
                                };
                            }
                            await waitFor(() =>
                                (($path) => {
                                    const stroke =
                                        $path[0].getAttribute('stroke');
                                    const fill = $path[0].getAttribute('fill');
                                    if (stroke !== 'none') {
                                        expect(stroke).to.eq('#FF0000');
                                    } else if (fill) {
                                        expect(fill).to.eq('#FF0000');
                                    }
                                })(read()),
                            );
                        }
                    })([items[index]], index, items);
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
    title: 'Internal/BaseDirectionPad/Interactions',
    render: scenarioRender,
};
export const RendersCorrectlyWithDefaultProps = {
    name: 'renders correctly with default props',
    play: async (context) =>
        runScenario(context, createCases, 'RendersCorrectlyWithDefaultProps'),
};
export const Emits = {
    name: 'emits',
    play: async (context) => runScenario(context, createCases, 'Emits'),
};
export const HandlesColorProp = {
    name: 'handles color prop',
    play: async (context) =>
        runScenario(context, createCases, 'HandlesColorProp'),
};
