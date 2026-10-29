import { expect, waitFor } from 'storybook/test';
import { nextTick } from 'vue';
import {
    scenarioRender,
    runScenario,
    dispatch,
    clickElements,
} from '../support/scenario.js';
import { commonFeatures } from '../support/common.js';
import VueUiXyCanvas from '../../src/components/vue-ui-xy-canvas.vue';
import { components } from '../fixtures/components.js';
function createCases(env) {
    const { select, mountSubject, resize, fixtures } = env;
    const cases = {};
    const hooks = [];
    const testCommonFeatures = commonFeatures(env);
    const { dataset, config } = components.find(
        (c) => c.name === 'VueUiXyCanvas',
    );
    cases.CachedDrawingAndHover = async () => {
        const { wrapper } = await mountSubject(VueUiXyCanvas, {
            props: {
                dataset: [
                    { name: 'Line', type: 'line', series: [10, 20, 15, 30] },
                ],
                config: {
                    style: {
                        chart: {
                            grid: {
                                x: { labels: { values: ['A', 'B', 'C', 'D'] } },
                            },
                        },
                    },
                },
            },
        });
        const state = wrapper.vm.$.setupState;
        await waitFor(() => expect(state.clonedCanvas).toBeTruthy());
        // Let label measurement and initial resize notifications finish.
        await new Promise((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(resolve)),
        );
        const clock = env.controlAnimationFrames();
        await clock.flush();
        state.tooltipIndex = null;
        state.selectedMinimapIndex = null;
        state.mouseY = null;
        state.datasetHasChanged = true;
        state.draw();
        const canvas = state.canvas;
        const ctx = canvas.getContext('2d');
        const before = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        state.draw();
        const after = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        expect(after.every((value, index) => value === before[index])).toBe(
            true,
        );

        const scale = env.spy(ctx, 'scale');
        const restore = env.spy(ctx, 'drawImage');
        const background = env.spy(ctx, 'fillRect');
        state.scheduleDraw();
        state.scheduleDraw();
        state.scheduleDraw();
        await clock.flush();
        expect(restore).toHaveBeenCalledTimes(1);
        expect(background).not.toHaveBeenCalled();
        expect(scale).not.toHaveBeenCalled();

        const ranges = state.visibleSeriesRanges;
        const labels = state.visibleTooltipLabels;
        const bounds = canvas.getBoundingClientRect();
        for (const index of [0, 1, 3]) {
            state.handleMousemove({
                clientX:
                    bounds.left +
                    (state.drawingArea.left +
                        state.drawingArea.slot * (index + 0.5)) /
                        2,
                clientY:
                    bounds.top +
                    (state.drawingArea.top + state.drawingArea.height / 2) / 2,
            });
            expect(state.dataTooltipSlot.seriesIndex).toBe(index);
            expect(state.dataTooltipSlot.datapoint[0].value).toBe(
                [10, 20, 15, 30][index],
            );
            await nextTick();
        }
        await clock.flush();
        expect(scale).not.toHaveBeenCalled();
        expect(state.visibleSeriesRanges).toBe(ranges);
        expect(state.visibleTooltipLabels).toBe(labels);

        // Resize and stack changes still rebuild geometry and the base image.
        wrapper.element.style.width = '450px';
        state.resizeCanvas();
        expect(state.canvas.width).toBe(
            Math.trunc(state.container.offsetWidth * state.dpr * 2),
        );
        state.toggleStack();
        await nextTick();
        await clock.flush();
        expect(state.clonedCanvas).toBeTruthy();
        expect(state.canvas.toDataURL()).toMatch(/^data:image\/png;base64,/);
    };
    cases.CachedRangesAndMinimap = async () => {
        const { wrapper } = await mountSubject(VueUiXyCanvas, {
            props: {
                dataset: [
                    { name: 'One', series: [-5, 0, 10, null] },
                    { name: 'Two', series: [3, 7, -2, 4] },
                ],
                config: {
                    style: { chart: { zoom: { minimap: { show: true } } } },
                },
            },
        });
        const state = wrapper.vm.$.setupState;
        const check = () => {
            const source = state.dsCopy.filter(
                (ds) => !state.segregated.includes(ds.absoluteIndex),
            );
            const visible = source.flatMap((ds) =>
                ds.series.slice(state.slicer.start, state.slicer.end),
            );
            expect(state.visibleDataRange.min).toBe(Math.min(...visible));
            expect(state.visibleDataRange.max).toBe(Math.max(...visible));
            const sums = Array.from(
                { length: Math.max(...source.map((ds) => ds.series.length)) },
                (_, i) =>
                    source
                        .map((ds) => ds.series[i] || 0)
                        .reduce((a, b) => (a || 0) + (b || 0), 0),
            );
            const min = Math.min(...sums);
            expect(state.minimap).toEqual(
                sums.map((value) => value + (min < 0 ? Math.abs(min) : 0)),
            );
        };
        check();
        state.slicer = { start: 1, end: 3 };
        await nextTick();
        check();
        state.segregate(1);
        await nextTick();
        check();
    };
    cases.Renders = async () => {
        {
            await resize(500, 560);
        }
        {
            const mounted = await mountSubject(VueUiXyCanvas, {
                props: {
                    dataset,
                    config,
                },
            });
            let read = () => mounted;
            {
                await testCommonFeatures({
                    userOptions: true,
                    title: true,
                    subtitle: true,
                    legend: true,
                    dataTable: true,
                    slicer: true,
                    tooltipCallback: async () => {
                        {
                            let read = () => select('[data-cy="canvas"]');
                            await waitFor(() =>
                                expect(read().length).toBeGreaterThan(0),
                            );
                            const rect = read()[0].getBoundingClientRect();
                            await dispatch(read(), 'mousemove', {
                                clientX: rect.left + rect.width / 2,
                                clientY: rect.top + rect.height / 2,
                            });
                        }
                    },
                });
                {
                    let read = () => select('[data-cy="canvas"]');
                    {
                        const canvas = read();
                        const c = canvas[0];
                        const ctx = c.getContext('2d');
                        const pixelData = ctx.getImageData(10, 10, 1, 1).data;
                        expect(pixelData[3]).to.be.greaterThan(0);
                    }
                }
            }
        }
    };
    cases.Emits = async () => {
        {
            const mounted = await mountSubject(VueUiXyCanvas, {
                props: {
                    dataset,
                    config,
                },
            });
            let read = () => mounted;
            {
                const { wrapper } = read();
                {
                    let read = () => select('[data-cy="legend-item"]');
                    {
                        const previous = read;
                        read = () => {
                            const element = previous().at(0);
                            return element ? [element] : [];
                        };
                    }
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await clickElements(read(), {
                        force: true,
                    });
                    {
                        expect(wrapper.emitted('selectLegend')).to.exist;
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
    title: 'Charts/VueUiXyCanvas/Interactions',
    render: scenarioRender,
};
export const Renders = {
    name: 'renders',
    play: async (context) => runScenario(context, createCases, 'Renders'),
};
export const Emits = {
    name: 'emits',
    play: async (context) => runScenario(context, createCases, 'Emits'),
};

export const CachedDrawingAndHover = {
    name: 'cached drawing preserves pixels and avoids hover resizing',
    play: async (context) =>
        runScenario(context, createCases, 'CachedDrawingAndHover'),
};
export const CachedRangesAndMinimap = {
    name: 'cached ranges and minimap preserve values across zoom and segregation',
    play: async (context) =>
        runScenario(context, createCases, 'CachedRangesAndMinimap'),
};
