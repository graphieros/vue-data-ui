import { expect, waitFor, userEvent } from 'storybook/test';
import {
    scenarioRender,
    runScenario,
    dispatch,
    clickElements,
} from '../support/scenario.js';
import { nextTick as storyNextTick } from 'vue';
import VueUiAnnotator from '../../src/components/vue-ui-annotator.vue';
function createCases(env) {
    const { select, mountSubject, resize, currentWrapper } = env;
    const cases = {};
    const hooks = [];
    hooks.push(async function () {
        {
            await resize(1000, 1100);
        }
    });
    cases.RendersWithDifferentConfigAttributes = async function () {
        {
            const mounted = await mountSubject(VueUiAnnotator, {
                slots: {
                    default: `<div style="margin: 0 auto;width:900px;height:900px;border:1px solid blue"></div>`,
                },
            });
            let read = () => mounted;
        }
        {
            let read = () => select(`[data-cy="accordion-summary"]`);
            await waitFor(() => expect(read().length).toBeGreaterThan(0));
            await clickElements(read());
        }
        {
            let read = () => select(`[data-cy="annotator-button-circle"]`);
            await waitFor(() => expect(read().length).toBeGreaterThan(0));
            await clickElements(read());
        }
        async function undo(times = 1) {
            for (let i = 0; i < times; i += 1) {
                {
                    let read = () =>
                        select(`[data-cy="annotator-button-undo"]`);
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await clickElements(read());
                }
            }
        }
        async function clickOut(el) {
            {
                let read = () => el;
                await waitFor(() => expect(read().length).toBeGreaterThan(0));
                await dispatch(read(), 'click', {
                    clientX: 0,
                    clientY: 0,
                });
            }
        }
        {
            let read = () => select('#annotatorSvg');
            {
                const $svg = read();
                {
                    let read = () => $svg;
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await dispatch(read(), 'pointermove', {
                        clientX: 500,
                        clientY: 500,
                    });
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await dispatch(read(), 'pointerdown');
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await dispatch(read(), 'pointermove', {
                        clientX: 600,
                        clientY: 600,
                    });
                    await storyNextTick();
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await dispatch(read(), 'pointerup', {
                        force: true,
                    });
                    {
                        const previous = read;
                        read = () =>
                            previous().flatMap((element) =>
                                select(
                                    'circle[id^="circle_"]:not([data-resize-handle])',
                                    element,
                                ),
                            );
                    }
                    await waitFor(() => {
                        expect(read()).toHaveLength(2);
                    });
                }
                await undo();
                {
                    let read = () =>
                        select(`[data-cy="annotator-button-rect"]`);
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await clickElements(read());
                }
                {
                    let read = () => $svg;
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await dispatch(read(), 'pointermove', {
                        clientX: 450,
                        clientY: 450,
                    });
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await dispatch(read(), 'pointerdown');
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await dispatch(read(), 'pointermove', {
                        clientX: 550,
                        clientY: 550,
                    });
                    await storyNextTick();
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await dispatch(read(), 'pointerup', {
                        force: true,
                    });
                    {
                        const previous = read;
                        read = () =>
                            previous().flatMap((element) =>
                                select('rect', element),
                            );
                    }
                    await waitFor(() => {
                        expect(read()).toHaveLength(3);
                    });
                }
                await undo();
                {
                    let read = () =>
                        select(`[data-cy="annotator-button-arrow"]`);
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await clickElements(read());
                }
                {
                    let read = () => $svg;
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await dispatch(read(), 'pointermove', {
                        clientX: 400,
                        clientY: 700,
                    });
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await dispatch(read(), 'pointerdown');
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await dispatch(read(), 'pointermove', {
                        clientX: 600,
                        clientY: 700,
                    });
                    await storyNextTick();
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await dispatch(read(), 'pointerup', {
                        force: true,
                    });
                    {
                        const previous = read;
                        read = () =>
                            previous().flatMap((element) =>
                                select('path', element),
                            );
                    }
                    await waitFor(() => {
                        expect(read()).toHaveLength(2);
                    });
                }
                await undo();
                {
                    let read = () =>
                        select(`[data-cy="annotator-button-freehand"]`);
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await clickElements(read());
                }
                {
                    let read = () => $svg;
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await dispatch(read(), 'pointermove', {
                        clientX: 400,
                        clientY: 700,
                    });
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await dispatch(read(), 'pointerdown');
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await dispatch(read(), 'pointermove', {
                        clientX: 420,
                        clientY: 680,
                    });
                    await storyNextTick();
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await dispatch(read(), 'pointermove', {
                        clientX: 440,
                        clientY: 720,
                    });
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await dispatch(read(), 'pointermove', {
                        clientX: 460,
                        clientY: 680,
                    });
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await dispatch(read(), 'pointermove', {
                        clientX: 480,
                        clientY: 720,
                    });
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await dispatch(read(), 'pointermove', {
                        clientX: 500,
                        clientY: 680,
                    });
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await dispatch(read(), 'pointermove', {
                        clientX: 520,
                        clientY: 720,
                    });
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await dispatch(read(), 'pointermove', {
                        clientX: 540,
                        clientY: 680,
                    });
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await dispatch(read(), 'pointermove', {
                        clientX: 560,
                        clientY: 720,
                    });
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await dispatch(read(), 'pointermove', {
                        clientX: 580,
                        clientY: 680,
                    });
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await dispatch(read(), 'pointermove', {
                        clientX: 600,
                        clientY: 720,
                    });
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await dispatch(read(), 'pointermove', {
                        clientX: 620,
                        clientY: 680,
                    });
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await dispatch(read(), 'pointerup', {
                        force: true,
                    });
                    {
                        const previous = read;
                        read = () =>
                            previous().flatMap((element) =>
                                select('path', element),
                            );
                    }
                    await waitFor(() => {
                        expect(read()).toHaveLength(2);
                    });
                }
                await undo();
                {
                    let read = () =>
                        select(`[data-cy="annotator-button-text"]`);
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await clickElements(read());
                }
                {
                    let read = () => $svg;
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await dispatch(read(), 'pointermove', {
                        clientX: 400,
                        clientY: 700,
                    });
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    // The annotator guards clicks briefly after committing a new shape.
                    await waitFor(() =>
                        expect(Date.now()).toBeGreaterThanOrEqual(
                            currentWrapper().vm.$.setupState
                                .preserveNewShapeSelectionUntil,
                        ),
                    );
                    await clickElements(read());
                    await userEvent.keyboard('HELLO');
                    {
                        const previous = read;
                        read = () =>
                            previous().flatMap((element) =>
                                select('text', element),
                            );
                    }
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(
                            read()
                                .map((e) => e.textContent)
                                .join(''),
                        ).toContain(String('HELLO'));
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
    title: 'Charts/VueUiAnnotator/Interactions',
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
