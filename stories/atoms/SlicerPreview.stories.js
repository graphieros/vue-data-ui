import { expect, waitFor } from 'storybook/test';
import {
    scenarioRender,
    runScenario,
    dispatch,
    clickElements,
    visible,
} from '../support/scenario.js';
import { ref, reactive } from 'vue';
import SlicerPreview from '../../src/atoms/SlicerPreview.vue';
function createCases(env) {
    const { aliases, select, mountSubject, resize } = env;
    const cases = {};
    const hooks = [async () => resize(500, 400)];
    const ds = Array.from(
        {
            length: 20,
        },
        (_, i) => (i % 2 ? 1 : 0),
    );
    const timeLabels = ds.map((_, i) => ({
        absoluteIndex: i,
        text: `____ ${i} ____`,
    }));
    const preciseLabels = ds.map((_, i) => ({
        absoluteIndex: i,
        text: `P${i}`,
    }));
    async function mountSlicerPreview(extraProps) {
        const FINAL_CONFIG = reactive({
            style: {
                chart: {
                    zoom: {
                        show: true,
                        color: '#42d392',
                        fontSize: 12,
                        useResetSlot: false,
                        highlightColor: '#3A3A3A',
                        startIndex: null,
                        endIndex: 5,
                        enableRangeHandles: true,
                        enableSelectionDrag: true,
                    },
                    backgroundColor: '#ecf0f1',
                    color: '#333',
                    layout: {
                        grid: {
                            xAxis: {
                                dataLabels: {
                                    values: timeLabels.map((t) => t.text),
                                },
                            },
                        },
                    },
                },
            },
        });
        const maxLength = ref(ds.length);
        const slicerStep = ref(1);
        const slicer = reactive({
            start: 0,
            end: ds.length,
        });
        const events = reactive({
            futureStart: null,
            futureEnd: null,
            updateStart: null,
            updateEnd: null,
            reset: false,
            trapMouse: null,
        });
        const onFutureStart = (v) => (events.futureStart = v);
        const onFutureEnd = (v) => (events.futureEnd = v);
        const onUpdateStart = (v) => (events.updateStart = v);
        const onUpdateEnd = (v) => (events.updateEnd = v);
        const onReset = () => (events.reset = true);
        const onTrapMouse = (v) => (events.trapMouse = v);
        return await (async () => {
            const mounted = await mountSubject({
                components: {
                    SlicerPreview,
                },
                setup() {
                    return {
                        FINAL_CONFIG,
                        maxLength,
                        slicerStep,
                        slicer,
                        minimap: ds,
                        allMinimaps: [
                            {
                                name: 'A',
                                series: ds,
                                color: 'red',
                                id: 'A',
                                isVisible: true,
                            },
                        ],
                        timeLabels,
                        preciseLabels,
                        selectedSeries: {
                            name: 'Serie A',
                        },
                        events,
                        onFutureStart,
                        onFutureEnd,
                        onUpdateStart,
                        onUpdateEnd,
                        onReset,
                        onTrapMouse,
                        ...(extraProps || {}),
                    };
                },
                template: `
                    <div style="background:#f8f9fa; padding:10px;">
                        <SlicerPreview
                            :key="'slicer_' + slicerStep"
                            :background="FINAL_CONFIG.style.chart.zoom.color"
                            :borderColor="FINAL_CONFIG.style.chart.backgroundColor"
                            :fontSize="FINAL_CONFIG.style.chart.zoom.fontSize"
                            :useResetSlot="FINAL_CONFIG.style.chart.zoom.useResetSlot"
                            :textColor="FINAL_CONFIG.style.chart.color"
                            :inputColor="FINAL_CONFIG.style.chart.zoom.color"
                            :selectColor="FINAL_CONFIG.style.chart.zoom.highlightColor"
                            :minimap="minimap"
                            :max="maxLength"
                            :min="0"
                            :valueStart="slicer.start"
                            :valueEnd="slicer.end"
                            v-model:start="slicer.start"
                            v-model:end="slicer.end"
                            :refreshStartPoint="FINAL_CONFIG.style.chart.zoom.startIndex !== null ? FINAL_CONFIG.style.chart.zoom.startIndex : 0"
                            :refreshEndPoint="FINAL_CONFIG.style.chart.zoom.endIndex !== null ? FINAL_CONFIG.style.chart.zoom.endIndex + 1 : maxLength"
                            :enableRangeHandles="FINAL_CONFIG.style.chart.zoom.enableRangeHandles"
                            :enableSelectionDrag="FINAL_CONFIG.style.chart.zoom.enableSelectionDrag"
                            :timeLabels="timeLabels"
                            :preciseLabels="preciseLabels"
                            :usePreciseLabels="false"
                            :selectedSeries="selectedSeries"
                            :allMinimaps="allMinimaps"
                            minimapCompact
                            :minimapMerged="false"
                            @futureStart="onFutureStart"
                            @futureEnd="onFutureEnd"
                            @update:start="onUpdateStart"
                            @update:end="onUpdateEnd"
                            @reset="onReset"
                            @trapMouse="onTrapMouse"
                        />
                    </div>
                `,
            });
            let read = () => mounted;
            {
                const result = await (({ wrapper }) => wrapper)(read());
                if (result !== undefined) read = () => result;
            }
            return read();
        })();
    }
    async function pressCompactHandle(side, key, times = 1) {
        const selector = `[data-cy="slicer-compact-handle-${side}"]`;
        let chain = await (async () => {
            let read = () => select(selector);
            await waitFor(() => {
                expect(read()).not.toHaveLength(0);
            });
            await waitFor(() => {
                expect(read().length).toBeGreaterThan(0);
                expect(read().some(visible)).toBe(true);
            });
            return read();
        })();
        for (let i = 0; i < times; i += 1) {
            await dispatch(chain, 'keydown', {
                eventConstructor: 'KeyboardEvent',
                key,
                bubbles: true,
            });
        }
        return chain;
    }
    cases.ShowsStartEndLabelsOnHover = async () => {
        await mountSlicerPreview();
        {
            let read = () => select('.double-range-slider');
            await waitFor(() => expect(read().length).toBeGreaterThan(0));
            await dispatch(read(), 'mouseenter');
        }
        {
            let read = () => select('[data-cy="slicer-label-left"]');
            aliases.set('left', read);
            await waitFor(() => {
                expect(read()).not.toHaveLength(0);
            });
            await waitFor(() => {
                expect(read().length).toBeGreaterThan(0);
                expect(read().some(visible)).toBe(true);
            });
            await waitFor(() => {
                expect(
                    read()
                        .map((e) => e.textContent)
                        .join(''),
                ).toContain(String('____ 0 ____'));
            });
        }
        {
            let read = () => select('[data-cy="slicer-label-right"]');
            aliases.set('right', read);
            await waitFor(() => {
                expect(read()).not.toHaveLength(0);
            });
            await waitFor(() => {
                expect(read().length).toBeGreaterThan(0);
                expect(read().some(visible)).toBe(true);
            });
            await waitFor(() => {
                expect(
                    read()
                        .map((e) => e.textContent)
                        .join(''),
                ).toContain(String(`____ ${ds.length - 1} ____`));
            });
        }
        {
            let read = () => select('.double-range-slider');
            await waitFor(() => expect(read().length).toBeGreaterThan(0));
            await dispatch(read(), 'mouseleave');
        }
        {
            let read = aliases.get('left');
            await waitFor(() => {
                read().forEach((element) => expect(element).not.toBeVisible());
            });
        }
        {
            let read = aliases.get('right');
            await waitFor(() => {
                read().forEach((element) => expect(element).not.toBeVisible());
            });
        }
    };
    cases.CompactRangeHandlesUpdateLabelsAndVModel = async () => {
        await (async (cmp) => {
            const model = cmp.vm.slicer;
            {
                await waitFor(() => {
                    const elements = select('[data-cy="slicer-handle-left"]');
                    expect(elements).toHaveLength(0);
                });
            }
            {
                await waitFor(() => {
                    const elements = select('[data-cy="slicer-handle-right"]');
                    expect(elements).toHaveLength(0);
                });
            }
            await pressCompactHandle('left', 'ArrowRight');
            {
                let read = () => select('.double-range-slider');
                await waitFor(() => expect(read().length).toBeGreaterThan(0));
                await dispatch(read(), 'mouseenter');
            }
            {
                await waitFor(() => {
                    const elements = select('[data-cy="slicer-label-left"]');
                    expect(
                        elements.map((e) => e.textContent).join(''),
                    ).toContain(String('____ 1 ____'));
                });
            }
            {
                await waitFor(() => {
                    const elements = model;
                    expect(elements).toHaveProperty('start', 1);
                });
            }
            {
                await waitFor(() => {
                    const elements = model;
                    expect(elements).toHaveProperty('end', ds.length);
                });
            } // The compact right handle represents the inclusive label index,
            // while the v-model end value is exclusive. 20 -> 9 = 11 steps.
            await pressCompactHandle('right', 'ArrowLeft', 11);
            {
                await waitFor(() => {
                    const elements = select('[data-cy="slicer-label-right"]');
                    expect(
                        elements.map((e) => e.textContent).join(''),
                    ).toContain(String('____ 8 ____'));
                });
            }
            {
                await waitFor(() => {
                    const elements = model;
                    expect(elements).toHaveProperty('start', 1);
                });
            }
            {
                await waitFor(() => {
                    const elements = model;
                    expect(elements).toHaveProperty('end', 9);
                });
            }
        })(await mountSlicerPreview());
    };
    cases.MergesTooltipsWhenBothLabelsTargetTheSameIndex = async () => {
        await mountSlicerPreview();
        await pressCompactHandle('left', 'ArrowRight', 2);
        // end = 3 means the right label points to inclusive index 2.
        await pressCompactHandle('right', 'ArrowLeft', ds.length - 3);
        {
            let read = () => select('.double-range-slider');
            await waitFor(() => expect(read().length).toBeGreaterThan(0));
            await dispatch(read(), 'mouseenter');
        }
        {
            await waitFor(() => {
                const elements = select('[data-cy="slicer-label-merged"]');
                expect(elements.length).toBeGreaterThan(0);
                expect(elements.some(visible)).toBe(true);
                expect(elements.map((e) => e.textContent).join('')).toContain(
                    String('____ 2 ____'),
                );
            });
        }
        {
            await waitFor(() => {
                const elements = select('[data-cy="slicer-label-left"]');
                elements.forEach((element) =>
                    expect(element).not.toBeVisible(),
                );
            });
        }
        {
            await waitFor(() => {
                const elements = select('[data-cy="slicer-label-right"]');
                elements.forEach((element) =>
                    expect(element).not.toBeVisible(),
                );
            });
        }
    };
    cases.MergesTheTwoLabelsInASingleTooltipWhenTooltipsCollideAdjacentIndices =
        async () => {
            await mountSlicerPreview();
            await pressCompactHandle('left', 'ArrowRight', 2);
            // end = 5 means the right label points to inclusive index 4.
            await pressCompactHandle('right', 'ArrowLeft', ds.length - 5);
            {
                let read = () => select('.double-range-slider');
                await waitFor(() => expect(read().length).toBeGreaterThan(0));
                await dispatch(read(), 'mouseenter');
            }
            {
                await waitFor(() => {
                    const elements = select('[data-cy="slicer-label-merged"]');
                    expect(elements.length).toBeGreaterThan(0);
                    expect(elements.some(visible)).toBe(true);
                    expect(
                        elements.map((e) => e.textContent).join(''),
                    ).toContain(String('____ 2 ____ - ____ 4 ____'));
                });
            }
            {
                await waitFor(() => {
                    const elements = select('[data-cy="slicer-label-left"]');
                    elements.forEach((element) =>
                        expect(element).not.toBeVisible(),
                    );
                });
            }
            {
                await waitFor(() => {
                    const elements = select('[data-cy="slicer-label-right"]');
                    elements.forEach((element) =>
                        expect(element).not.toBeVisible(),
                    );
                });
            }
        };
    cases.EmitsResetWhenClickingTheDefaultResetButtonUseResetSlotFalse =
        async () => {
            await (async (cmp) => {
                const ev = cmp.vm.events;
                {
                    let read = () => select('[data-cy="slicer-reset"]');
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await clickElements(read(), {
                        force: true,
                    });
                }
                {
                    let read = () => ev;
                    {
                        const previous = read;
                        read = () =>
                            'reset'
                                .split('.')
                                .reduce(
                                    (value, key) => value?.[key],
                                    previous(),
                                );
                    }
                    await waitFor(() => {
                        expect(read()).toEqual(true);
                    });
                }
            })(await mountSlicerPreview());
        };
    cases.EmitsTrapMouseWithTheHoveredTrapIndexAndNullOnMouseleave =
        async () => {
            await (async (cmp) => {
                const ev = cmp.vm.events;
                const targetIndex = 5;
                {
                    let read = () => select('[data-cy="slicer-minimap-svg"]');
                    await waitFor(() =>
                        (($svg) => {
                            const rect = $svg[0].getBoundingClientRect();
                            const viewBox = $svg[0].getAttribute('viewBox');
                            expect(rect.width).to.be.greaterThan(10);
                            expect(rect.height).to.be.greaterThan(10);
                            expect(viewBox).to.not.equal('0 0 1 1');
                        })(read()),
                    );
                    {
                        const $svg = read();
                        const rect = $svg[0].getBoundingClientRect();
                        const step = rect.width / (ds.length - 1);
                        const clientX =
                            rect.left + step * targetIndex + step * 0.1;
                        const clientY = rect.top + rect.height / 2;
                        {
                            let read = () =>
                                select('[data-cy="slicer-minimap-trap"]');
                            await waitFor(() => {
                                expect(read()).not.toHaveLength(0);
                            });
                            await waitFor(() =>
                                expect(read().length).toBeGreaterThan(0),
                            );
                            await dispatch(read(), 'mousemove', {
                                eventConstructor: 'MouseEvent',
                                clientX,
                                clientY,
                                bubbles: true,
                                force: true,
                            });
                        }
                    }
                }
                {
                    let read = () => ev;
                    {
                        const previous = read;
                        read = () =>
                            'trapMouse'
                                .split('.')
                                .reduce(
                                    (value, key) => value?.[key],
                                    previous(),
                                );
                    }
                    await waitFor(() => {
                        expect(read()).toEqual(targetIndex);
                    });
                }
                {
                    let read = () => select('[data-cy="slicer-minimap-trap"]');
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await dispatch(read(), 'mouseleave', {
                        eventConstructor: 'MouseEvent',
                        bubbles: true,
                        force: true,
                    });
                }
                {
                    let read = () => ev;
                    {
                        const previous = read;
                        read = () =>
                            'trapMouse'
                                .split('.')
                                .reduce(
                                    (value, key) => value?.[key],
                                    previous(),
                                );
                    }
                    await waitFor(() => {
                        expect(read()).toEqual(null);
                    });
                }
            })(await mountSlicerPreview());
        };
    cases.EmitsResetWhenClickingTheCustomResetSlot = async () => {
        {
            const mounted = await mountSubject({
                components: {
                    SlicerPreview,
                },
                setup() {
                    const ds = Array.from(
                        {
                            length: 20,
                        },
                        (_, i) => (i % 2 ? 1 : 0),
                    );
                    const timeLabels = ds.map((_, i) => ({
                        absoluteIndex: i,
                        text: `____ ${i} ____`,
                    }));
                    const preciseLabels = ds.map((_, i) => ({
                        absoluteIndex: i,
                        text: `P${i}`,
                    }));
                    const FINAL_CONFIG = reactive({
                        style: {
                            chart: {
                                zoom: {
                                    show: true,
                                    color: '#42d392',
                                    fontSize: 12,
                                    useResetSlot: true,
                                    highlightColor: '#3A3A3A',
                                    startIndex: null,
                                    endIndex: 5,
                                    enableRangeHandles: true,
                                    enableSelectionDrag: true,
                                },
                                backgroundColor: '#ecf0f1',
                                color: '#333',
                                layout: {
                                    grid: {
                                        xAxis: {
                                            dataLabels: {
                                                values: timeLabels.map(
                                                    (t) => t.text,
                                                ),
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    });
                    const maxLength = ref(ds.length);
                    const slicerStep = ref(1);
                    const slicer = reactive({
                        start: 0,
                        end: ds.length,
                    });
                    const events = reactive({
                        reset: false,
                    });
                    const onReset = () => (events.reset = true);
                    return {
                        ds,
                        timeLabels,
                        preciseLabels,
                        FINAL_CONFIG,
                        maxLength,
                        slicerStep,
                        slicer,
                        events,
                        onReset,
                    };
                },
                template: `
                <div style="background:#f8f9fa; padding:10px;">
                    <SlicerPreview
                        :key="'slicer_' + slicerStep"
                        :background="FINAL_CONFIG.style.chart.zoom.color"
                        :borderColor="FINAL_CONFIG.style.chart.backgroundColor"
                        :fontSize="FINAL_CONFIG.style.chart.zoom.fontSize"
                        :useResetSlot="FINAL_CONFIG.style.chart.zoom.useResetSlot"
                        :textColor="FINAL_CONFIG.style.chart.color"
                        :inputColor="FINAL_CONFIG.style.chart.zoom.color"
                        :selectColor="FINAL_CONFIG.style.chart.zoom.highlightColor"
                        :minimap="ds"
                        :max="maxLength"
                        :min="0"
                        :valueStart="slicer.start"
                        :valueEnd="slicer.end"
                        v-model:start="slicer.start"
                        v-model:end="slicer.end"
                        :refreshStartPoint="0"
                        :refreshEndPoint="FINAL_CONFIG.style.chart.zoom.endIndex + 1"
                        :enableRangeHandles="FINAL_CONFIG.style.chart.zoom.enableRangeHandles"
                        :enableSelectionDrag="FINAL_CONFIG.style.chart.zoom.enableSelectionDrag"
                        :timeLabels="timeLabels"
                        :preciseLabels="preciseLabels"
                        :usePreciseLabels="false"
                        @reset="onReset"
                    >
                        <template #reset-action="{ reset }">
                            <button data-cy="custom-reset" @click="reset">Reset slot</button>
                        </template>
                    </SlicerPreview>
                </div>
            `,
            });
            let read = () => mounted;
            {
                const { wrapper } = read();
                {
                    let read = () => select('[data-cy="custom-reset"]');
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await clickElements(read(), {
                        force: true,
                    });
                }
                {
                    let read = () => wrapper.vm.events;
                    {
                        const previous = read;
                        read = () =>
                            'reset'
                                .split('.')
                                .reduce(
                                    (value, key) => value?.[key],
                                    previous(),
                                );
                    }
                    await waitFor(() => {
                        expect(read()).toEqual(true);
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
    title: 'Internal/SlicerPreview/Interactions',
    render: scenarioRender,
};
export const ShowsStartEndLabelsOnHover = {
    name: 'shows start & end labels on hover',
    play: async (context) =>
        runScenario(context, createCases, 'ShowsStartEndLabelsOnHover'),
};
export const CompactRangeHandlesUpdateLabelsAndVModel = {
    name: 'compact range handles update labels and v-model',
    play: async (context) =>
        runScenario(
            context,
            createCases,
            'CompactRangeHandlesUpdateLabelsAndVModel',
        ),
};
export const MergesTooltipsWhenBothLabelsTargetTheSameIndex = {
    name: 'merges tooltips when both labels target the same index',
    play: async (context) =>
        runScenario(
            context,
            createCases,
            'MergesTooltipsWhenBothLabelsTargetTheSameIndex',
        ),
};
export const MergesTheTwoLabelsInASingleTooltipWhenTooltipsCollideAdjacentIndices =
    {
        name: 'merges the two labels in a single tooltip when tooltips collide (adjacent indices)',
        play: async (context) =>
            runScenario(
                context,
                createCases,
                'MergesTheTwoLabelsInASingleTooltipWhenTooltipsCollideAdjacentIndices',
            ),
    };
export const EmitsResetWhenClickingTheDefaultResetButtonUseResetSlotFalse = {
    name: 'emits reset when clicking the default reset button (useResetSlot = false)',
    play: async (context) =>
        runScenario(
            context,
            createCases,
            'EmitsResetWhenClickingTheDefaultResetButtonUseResetSlotFalse',
        ),
};
export const EmitsTrapMouseWithTheHoveredTrapIndexAndNullOnMouseleave = {
    name: 'emits trapMouse with the hovered trap index and null on mouseleave',
    play: async (context) =>
        runScenario(
            context,
            createCases,
            'EmitsTrapMouseWithTheHoveredTrapIndexAndNullOnMouseleave',
        ),
};
export const EmitsResetWhenClickingTheCustomResetSlot = {
    name: 'emits reset when clicking the custom reset slot',
    play: async (context) =>
        runScenario(
            context,
            createCases,
            'EmitsResetWhenClickingTheCustomResetSlot',
        ),
};
