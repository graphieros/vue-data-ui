import { expect, waitFor } from 'storybook/test';
import {
    scenarioRender,
    runScenario,
    dispatch,
    clickElements,
    visible,
} from '../support/scenario.js';
const sequential = async (items, callback) => {
    for (let i = 0; i < items.length; i++) await callback(items[i], i, items);
};
import { nextTick as storyNextTick } from 'vue';
import UserOptions from '../../src/atoms/UserOptions.vue';
function createCases(env) {
    const { select, mountSubject, resize } = env;
    const cases = {};
    const hooks = [];
    async function mount() {
        {
            const mounted = await mountSubject(UserOptions, {
                props: {
                    hasTooltip: true,
                    hasImg: true,
                    hasTable: true,
                    hasSort: true,
                    hasLabel: true,
                    hasStack: true,
                    hasSort: true,
                    hasFullscreen: true,
                    hasAnimation: true,
                    hasAnnotator: true,
                    hasSvg: true,
                },
            });
            let read = () => mounted;
        }
    }
    async function open() {
        {
            let read = () => select(`[data-cy="user-options-summary"]`);
            await waitFor(() => expect(read().length).toBeGreaterThan(0));
            await clickElements(read());
        }
        {
            await waitFor(() => {
                const elements = select(`[data-cy="user-options-drawer"]`);
                expect(elements).not.toHaveLength(0);
                expect(elements.length).toBeGreaterThan(0);
                expect(elements.some(visible)).toBe(true);
            });
        }
    }
    cases.OpensAndClosesOnMenuClick = async () => {
        await mount();
        await open();
        {
            let read = () => select(`[data-cy="user-options-summary"]`);
            await waitFor(() => expect(read().length).toBeGreaterThan(0));
            await clickElements(read());
        }
        {
            await storyNextTick();
        }
        {
            await waitFor(() => {
                const elements = select(`[data-cy="user-options-drawer"]`);
                elements.forEach((element) =>
                    expect(element).not.toBeVisible(),
                );
            });
        }
    };
    cases.ClosesTheDrawerOnClickOutside = async () => {
        await mount();
        await open();
        {
            let read = () => select('body');
            await waitFor(() => expect(read().length).toBeGreaterThan(0));
            await clickElements(read(), 0, 0, {
                force: true,
            });
        }
        {
            await storyNextTick();
        }
        {
            await waitFor(() => {
                const elements = select(`[data-cy="user-options-drawer"]`);
                elements.forEach((element) =>
                    expect(element).not.toBeVisible(),
                );
            });
        }
    };
    cases.ContainsAllNecessaryIcons = async () => {
        await mount();
        await open();
        await sequential(
            [
                'user-options-tooltip',
                'user-options-pdf',
                'user-options-xls',
                'user-options-img',
                'user-options-table',
                'user-options-label',
                'user-options-sort',
                'user-options-stack',
                'user-options-sort',
                'user-options-fullscreen',
                'user-options-anim',
                'user-options-annotator',
                'user-options-svg',
            ],
            async (btn) => {
                {
                    await waitFor(() => {
                        const elements = select(`[data-cy="${btn}"]`);
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                    });
                }
            },
        );
    };
    cases.Emits = async () => {
        {
            const mounted = await mountSubject(UserOptions, {
                props: {
                    hasTooltip: true,
                    hasImg: true,
                    hasTable: true,
                    hasSort: true,
                    hasLabel: true,
                    hasStack: true,
                    hasSort: true,
                    hasAnimation: true,
                    hasAnnotator: true,
                    hasFullscreen: true,
                    hasSvg: true,
                    chartElement: {
                        requestFullscreen: () => {},
                        exitFullscreen: () => {},
                    },
                },
            });
            let read = () => mounted;
            {
                const { wrapper } = read();
                await open();
                {
                    let read = () => select('[data-cy="user-options-tooltip"]');
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await clickElements(read());
                    {
                        expect(wrapper.emitted('toggleTooltip')).to.exist;
                    }
                }
                {
                    let read = () => select('[data-cy="user-options-pdf"]');
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await clickElements(read());
                    {
                        expect(wrapper.emitted('generatePdf')).to.exist;
                    }
                }
                {
                    let read = () => select('[data-cy="user-options-xls"]');
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await clickElements(read());
                    {
                        expect(wrapper.emitted('generateCsv')).to.exist;
                    }
                }
                {
                    let read = () => select('[data-cy="user-options-img"]');
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await clickElements(read());
                    {
                        expect(wrapper.emitted('generateImage')).to.exist;
                    }
                }
                {
                    let read = () => select('[data-cy="user-options-table"]');
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await clickElements(read());
                    {
                        expect(wrapper.emitted('toggleTable')).to.exist;
                    }
                }
                {
                    let read = () => select('[data-cy="user-options-label"]');
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await clickElements(read());
                    {
                        expect(wrapper.emitted('toggleLabels')).to.exist;
                    }
                }
                {
                    let read = () => select('[data-cy="user-options-sort"]');
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await clickElements(read());
                    {
                        expect(wrapper.emitted('toggleSort')).to.exist;
                    }
                }
                {
                    let read = () => select('[data-cy="user-options-stack"]');
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await clickElements(read());
                    {
                        expect(wrapper.emitted('toggleStack')).to.exist;
                    }
                }
                {
                    let read = () =>
                        select('[data-cy="user-options-fullscreen"]');
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await clickElements(read());
                    {
                        expect(wrapper.emitted('toggleFullscreen')).to.exist;
                        expect(
                            wrapper.emitted('toggleFullscreen')[0],
                        ).to.deep.equal([true]);
                    }
                }
                {
                    let read = () => select('[data-cy="user-options-anim"]');
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await clickElements(read());
                    {
                        expect(wrapper.emitted('toggleAnimation')).to.exist;
                    }
                }
                {
                    let read = () =>
                        select('[data-cy="user-options-annotator"]');
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await clickElements(read());
                    {
                        expect(wrapper.emitted('toggleAnnotator')).to.exist;
                    }
                }
                {
                    let read = () => select('[data-cy="user-options-svg"]');
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await clickElements(read());
                    {
                        expect(wrapper.emitted('generateSvg')).to.exist;
                    }
                }
            }
        }
    };
    cases.DisplaysLabelsInTooltips = async () => {
        {
            await resize(601, 500);
        }
        {
            const mounted = await mountSubject(UserOptions, {
                props: {
                    hasTooltip: true,
                    hasImg: true,
                    hasTable: true,
                    hasSort: true,
                    hasLabel: true,
                    hasStack: true,
                    hasSort: true,
                    hasAnimation: true,
                    hasAnnotator: true,
                    hasFullscreen: true,
                    hasSvg: true,
                    titles: {
                        open: 'open',
                        close: 'close',
                        tooltip: 'tooltip',
                        pdf: 'pdf',
                        csv: 'csv',
                        img: 'img',
                        table: 'table',
                        labels: 'labels',
                        sort: 'sort',
                        stack: 'stack',
                        fullscreen: 'fullscreen',
                        animation: 'animation',
                        annotator: 'annotator',
                        svg: 'svg',
                    },
                },
            });
            let read = () => mounted;
            {
                await open();
                {
                    let read = () => select('[data-cy="user-options-tooltip"]');
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await dispatch(read(), 'mouseenter');
                    {
                        {
                            await waitFor(() => {
                                const elements = select(
                                    '[data-cy="uo-tooltip"]',
                                );
                                expect(elements.length).toBeGreaterThan(0);
                                expect(elements.some(visible)).toBe(true);
                                expect(
                                    elements.map((e) => e.textContent).join(''),
                                ).toContain(String('tooltip'));
                            });
                        }
                        {
                            let read = () =>
                                select('[data-cy="user-options-tooltip"]');
                            await waitFor(() =>
                                expect(read().length).toBeGreaterThan(0),
                            );
                            await dispatch(read(), 'mouseout');
                        }
                    }
                }
                {
                    let read = () => select('[data-cy="user-options-pdf"]');
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await dispatch(read(), 'mouseenter');
                    {
                        {
                            await waitFor(() => {
                                const elements = select(
                                    '[data-cy="uo-tooltip"]',
                                );
                                expect(elements.length).toBeGreaterThan(0);
                                expect(elements.some(visible)).toBe(true);
                                expect(
                                    elements.map((e) => e.textContent).join(''),
                                ).toContain(String('pdf'));
                            });
                        }
                        {
                            let read = () =>
                                select('[data-cy="user-options-pdf"]');
                            await waitFor(() =>
                                expect(read().length).toBeGreaterThan(0),
                            );
                            await dispatch(read(), 'mouseout');
                        }
                    }
                }
                {
                    let read = () => select('[data-cy="user-options-xls"]');
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await dispatch(read(), 'mouseenter');
                    {
                        {
                            await waitFor(() => {
                                const elements = select(
                                    '[data-cy="uo-tooltip"]',
                                );
                                expect(elements.length).toBeGreaterThan(0);
                                expect(elements.some(visible)).toBe(true);
                                expect(
                                    elements.map((e) => e.textContent).join(''),
                                ).toContain(String('csv'));
                            });
                        }
                        {
                            let read = () =>
                                select('[data-cy="user-options-xls"]');
                            await waitFor(() =>
                                expect(read().length).toBeGreaterThan(0),
                            );
                            await dispatch(read(), 'mouseout');
                        }
                    }
                }
                {
                    let read = () => select('[data-cy="user-options-img"]');
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await dispatch(read(), 'mouseenter');
                    {
                        {
                            await waitFor(() => {
                                const elements = select(
                                    '[data-cy="uo-tooltip"]',
                                );
                                expect(elements.length).toBeGreaterThan(0);
                                expect(elements.some(visible)).toBe(true);
                                expect(
                                    elements.map((e) => e.textContent).join(''),
                                ).toContain(String('img'));
                            });
                        }
                        {
                            let read = () =>
                                select('[data-cy="user-options-img"]');
                            await waitFor(() =>
                                expect(read().length).toBeGreaterThan(0),
                            );
                            await dispatch(read(), 'mouseout');
                        }
                    }
                }
                {
                    let read = () => select('[data-cy="user-options-table"]');
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await dispatch(read(), 'mouseenter');
                    {
                        {
                            await waitFor(() => {
                                const elements = select(
                                    '[data-cy="uo-tooltip"]',
                                );
                                expect(elements.length).toBeGreaterThan(0);
                                expect(elements.some(visible)).toBe(true);
                                expect(
                                    elements.map((e) => e.textContent).join(''),
                                ).toContain(String('table'));
                            });
                        }
                        {
                            let read = () =>
                                select('[data-cy="user-options-table"]');
                            await waitFor(() =>
                                expect(read().length).toBeGreaterThan(0),
                            );
                            await dispatch(read(), 'mouseout');
                        }
                    }
                }
                {
                    let read = () => select('[data-cy="user-options-label"]');
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await dispatch(read(), 'mouseenter');
                    {
                        {
                            await waitFor(() => {
                                const elements = select(
                                    '[data-cy="uo-tooltip"]',
                                );
                                expect(elements.length).toBeGreaterThan(0);
                                expect(elements.some(visible)).toBe(true);
                                expect(
                                    elements.map((e) => e.textContent).join(''),
                                ).toContain(String('labels'));
                            });
                        }
                        {
                            let read = () =>
                                select('[data-cy="user-options-label"]');
                            await waitFor(() =>
                                expect(read().length).toBeGreaterThan(0),
                            );
                            await dispatch(read(), 'mouseout');
                        }
                    }
                }
                {
                    let read = () => select('[data-cy="user-options-sort"]');
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await dispatch(read(), 'mouseenter');
                    {
                        {
                            await waitFor(() => {
                                const elements = select(
                                    '[data-cy="uo-tooltip"]',
                                );
                                expect(elements.length).toBeGreaterThan(0);
                                expect(elements.some(visible)).toBe(true);
                                expect(
                                    elements.map((e) => e.textContent).join(''),
                                ).toContain(String('sort'));
                            });
                        }
                        {
                            let read = () =>
                                select('[data-cy="user-options-sort"]');
                            await waitFor(() =>
                                expect(read().length).toBeGreaterThan(0),
                            );
                            await dispatch(read(), 'mouseout');
                        }
                    }
                }
                {
                    let read = () => select('[data-cy="user-options-stack"]');
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await dispatch(read(), 'mouseenter');
                    {
                        {
                            await waitFor(() => {
                                const elements = select(
                                    '[data-cy="uo-tooltip"]',
                                );
                                expect(elements.length).toBeGreaterThan(0);
                                expect(elements.some(visible)).toBe(true);
                                expect(
                                    elements.map((e) => e.textContent).join(''),
                                ).toContain(String('stack'));
                            });
                        }
                        {
                            let read = () =>
                                select('[data-cy="user-options-stack"]');
                            await waitFor(() =>
                                expect(read().length).toBeGreaterThan(0),
                            );
                            await dispatch(read(), 'mouseout');
                        }
                    }
                }
                {
                    let read = () =>
                        select('[data-cy="user-options-fullscreen"]');
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await dispatch(read(), 'mouseenter');
                    {
                        {
                            await waitFor(() => {
                                const elements = select(
                                    '[data-cy="uo-tooltip"]',
                                );
                                expect(elements.length).toBeGreaterThan(0);
                                expect(elements.some(visible)).toBe(true);
                                expect(
                                    elements.map((e) => e.textContent).join(''),
                                ).toContain(String('fullscreen'));
                            });
                        }
                        {
                            let read = () =>
                                select('[data-cy="user-options-fullscreen"]');
                            await waitFor(() =>
                                expect(read().length).toBeGreaterThan(0),
                            );
                            await dispatch(read(), 'mouseout');
                        }
                    }
                }
                {
                    let read = () => select('[data-cy="user-options-anim"]');
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await dispatch(read(), 'mouseenter');
                    {
                        {
                            await waitFor(() => {
                                const elements = select(
                                    '[data-cy="uo-tooltip"]',
                                );
                                expect(elements.length).toBeGreaterThan(0);
                                expect(elements.some(visible)).toBe(true);
                                expect(
                                    elements.map((e) => e.textContent).join(''),
                                ).toContain(String('animation'));
                            });
                        }
                        {
                            let read = () =>
                                select('[data-cy="user-options-anim"]');
                            await waitFor(() =>
                                expect(read().length).toBeGreaterThan(0),
                            );
                            await dispatch(read(), 'mouseout');
                        }
                    }
                }
                {
                    let read = () =>
                        select('[data-cy="user-options-annotator"]');
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await dispatch(read(), 'mouseenter');
                    {
                        {
                            await waitFor(() => {
                                const elements = select(
                                    '[data-cy="uo-tooltip"]',
                                );
                                expect(elements.length).toBeGreaterThan(0);
                                expect(elements.some(visible)).toBe(true);
                                expect(
                                    elements.map((e) => e.textContent).join(''),
                                ).toContain(String('annotator'));
                            });
                        }
                        {
                            let read = () =>
                                select('[data-cy="user-options-annotator"]');
                            await waitFor(() =>
                                expect(read().length).toBeGreaterThan(0),
                            );
                            await dispatch(read(), 'mouseout');
                        }
                    }
                }
                {
                    let read = () => select('[data-cy="user-options-svg"]');
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await dispatch(read(), 'mouseenter');
                    {
                        {
                            await waitFor(() => {
                                const elements = select(
                                    '[data-cy="uo-tooltip"]',
                                );
                                expect(elements.length).toBeGreaterThan(0);
                                expect(elements.some(visible)).toBe(true);
                                expect(
                                    elements.map((e) => e.textContent).join(''),
                                ).toContain(String('svg'));
                            });
                        }
                        {
                            let read = () =>
                                select('[data-cy="user-options-svg"]');
                            await waitFor(() =>
                                expect(read().length).toBeGreaterThan(0),
                            );
                            await dispatch(read(), 'mouseout');
                        }
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
    title: 'Internal/UserOptions/Interactions',
    render: scenarioRender,
};
export const OpensAndClosesOnMenuClick = {
    name: 'opens and closes on menu click',
    play: async (context) =>
        runScenario(context, createCases, 'OpensAndClosesOnMenuClick'),
};
export const ClosesTheDrawerOnClickOutside = {
    name: 'closes the drawer on click outside',
    play: async (context) =>
        runScenario(context, createCases, 'ClosesTheDrawerOnClickOutside'),
};
export const ContainsAllNecessaryIcons = {
    name: 'contains all necessary icons',
    play: async (context) =>
        runScenario(context, createCases, 'ContainsAllNecessaryIcons'),
};
export const Emits = {
    name: 'emits',
    play: async (context) => runScenario(context, createCases, 'Emits'),
};
export const DisplaysLabelsInTooltips = {
    name: 'displays labels in tooltips',
    play: async (context) =>
        runScenario(context, createCases, 'DisplaysLabelsInTooltips'),
};
