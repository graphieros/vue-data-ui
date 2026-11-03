import { nextTick } from 'vue';
import BaseDraggableDialog from '../../src/atoms/BaseDraggableDialog.vue';
import { expect, waitFor } from 'storybook/test';
import { scenarioRender, runScenario } from '../support/scenario.js';
import { page } from '../support/browserPage.js';
import XyAnalysisOptions from '../../src/atoms/XyAnalysisOptions.vue';
import { useConfig } from '../../src/useConfig';

function createCases({ mountSubject }) {
    return {
        hooks: [],
        cases: {
            TouchDragging: async () => {
                const original = [window.innerWidth, window.innerHeight];
                try {
                    if (page) await page.viewport(375, 667);
                    const { wrapper } = await mountSubject(
                        BaseDraggableDialog,
                        {
                            props: {
                                forcedWidth: 240,
                                forcedHeight: 240,
                                fitViewport: true,
                            },
                        },
                    );
                    wrapper.vm.open();
                    await nextTick();
                    await nextTick();
                    const dialog = document.querySelector(
                        '[data-cy="draggable-dialog"]',
                    );
                    const handle = dialog.querySelector('.drag-handle');
                    const before = dialog.getBoundingClientRect();
                    const origin = handle.getBoundingClientRect();
                    const x = origin.left + origin.width / 2;
                    const y = origin.top + origin.height / 2;
                    function dispatch(type, dx = 0, dy = 0) {
                        const point = new Touch({
                            identifier: 1,
                            target: handle,
                            clientX: x + dx,
                            clientY: y + dy,
                        });
                        const touches = type === 'touchcancel' ? [] : [point];
                        handle.dispatchEvent(
                            new TouchEvent(type, {
                                bubbles: true,
                                cancelable: true,
                                touches,
                                changedTouches: [point],
                            }),
                        );
                    }
                    expect(getComputedStyle(handle).touchAction).toBe('none');
                    dispatch('touchstart');
                    await nextTick();
                    expect(handle.isConnected).toBe(true);
                    dispatch('touchmove', -30, 40);
                    await nextTick();
                    const moved = dialog.getBoundingClientRect();
                    expect(moved.left).toBeCloseTo(before.left - 30, 0);
                    expect(moved.top).toBeCloseTo(before.top + 40, 0);
                    dispatch('touchcancel');
                    dispatch('touchmove', 20, 80);
                    await nextTick();
                    expect(dialog.getBoundingClientRect().top).toBe(moved.top);
                } finally {
                    if (page) await page.viewport(...original);
                }
            },
            ResponsiveLayout: async () => {
                const original = [window.innerWidth, window.innerHeight];
                try {
                    const sizes = page
                        ? [
                              [1000, 800],
                              [320, 568],
                              [568, 320],
                              [375, 667],
                          ]
                        : [original];
                    const { wrapper } = await mountSubject(XyAnalysisOptions, {
                        props: {
                            messages: useConfig().vue_ui_xy.analysis,
                            color: '#2D353C',
                            backgroundColor: '#ffffff',
                            series: Array.from({ length: 16 }, (_, i) => ({
                                id: `series-${i}`,
                                name: `Series ${i} with a very long name that should wrap without overflowing`,
                            })),
                        },
                    });
                    for (const [width, height] of sizes) {
                        if (page) await page.viewport(width, height);
                        await waitFor(() => {
                            const dialog = document.querySelector(
                                '[data-cy="draggable-dialog"]',
                            );
                            const rect = dialog.getBoundingClientRect();
                            expect(rect.left).toBeGreaterThanOrEqual(7);
                            expect(rect.top).toBeGreaterThanOrEqual(7);
                            expect(rect.right).toBeLessThanOrEqual(
                                window.innerWidth - 7,
                            );
                            expect(rect.bottom).toBeLessThanOrEqual(
                                window.innerHeight - 7,
                            );
                            const body = dialog.querySelector(
                                '.vue-ui-draggable-dialog-scroll-body',
                            );
                            expect(body.scrollWidth).toBeLessThanOrEqual(
                                body.clientWidth,
                            );
                            expect(body.scrollHeight).toBeGreaterThan(
                                body.clientHeight,
                            );
                            const actions = dialog
                                .querySelector('[data-cy="analysis-apply"]')
                                .getBoundingClientRect();
                            expect(actions.top).toBeGreaterThanOrEqual(
                                rect.top,
                            );
                            expect(actions.bottom).toBeLessThanOrEqual(
                                rect.bottom,
                            );
                            const grid = dialog.querySelector(
                                '.vue-ui-xy-analysis-checkboxes',
                            );
                            const columns =
                                getComputedStyle(
                                    grid,
                                ).gridTemplateColumns.split(' ').length;
                            expect(columns).toBe(
                                width === 320 || width === 375 ? 1 : 2,
                            );
                            const slider = dialog
                                .querySelector('[data-cy="analysis-font-size"]')
                                .getBoundingClientRect();
                            expect(slider.right).toBeLessThanOrEqual(
                                rect.right,
                            );
                        });
                    }
                    // Compact layout retains selection and apply behavior.
                    document
                        .querySelector('[data-series-id="series-0"]')
                        .click();
                    document
                        .querySelector('[data-cy="analysis-apply"]')
                        .click();
                    await waitFor(() =>
                        expect(
                            wrapper.emitted('apply')[0][0].seriesIds,
                        ).not.toContain('series-0'),
                    );
                } finally {
                    if (page) await page.viewport(...original);
                }
            },
        },
    };
}

export default {
    title: 'Atoms/XyAnalysisOptions',
    render: scenarioRender,
};
export const ResponsiveLayout = {
    name: 'compact layout fits desktop and mobile viewports',
    play: async (context) =>
        runScenario(context, createCases, 'ResponsiveLayout'),
};

export const TouchDragging = {
    name: 'touch drag preserves its target and handles cancellation',
    play: async (context) => runScenario(context, createCases, 'TouchDragging'),
};
