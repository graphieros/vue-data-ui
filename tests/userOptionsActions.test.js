import { describe, expect, test, vi } from 'vitest';
import { defineComponent, h, onMounted, ref } from 'vue';
import {
    configurePopover,
    makeOptionSlots,
    mountOptionsHarness,
    optionSlotNames,
    settleOptions,
} from './helpers/userOptionsHarness';

const forwarding = `<template v-for="(_, name) in $slots" #[name]="scope"><slot :name="name" v-bind="scope" /></template>`;
const controlIds = [
    'pdf',
    'xls',
    'img',
    'svg',
    'tooltip',
    'table',
    'label',
    'sort',
    'stack',
    'fullscreen',
    'fullscreen',
    'anim',
    'annotator',
    'alt-copy',
];
const scopedKeys = {
    optionStack: ['isStack'],
    optionFullscreen: ['toggleFullscreen', 'isFullscreen'],
    optionZoom: ['toggleZoom', 'isZoomLocked'],
    optionAnimation: ['toggleAnimation', 'isAnimated'],
    optionAnnotator: ['toggleAnnotator', 'isAnnotator'],
    optionAltCopy: ['copyAlt'],
};

describe.each([false, true])(
    'user options actions with popover=%s',
    (popover) => {
        async function run(slots, check) {
            const restore = configurePopover(popover);
            let instance;
            try {
                instance = await mountOptionsHarness(forwarding, slots);
                await instance.open();
                await check(instance);
            } finally {
                instance?.unmount();
                restore();
            }
        }

        test('keeps slot scopes exact without leaking loop metadata', async () => {
            const names = optionSlotNames.filter((name) =>
                name.startsWith('option'),
            );
            await run(makeOptionSlots(names), async (instance) => {
                for (const name of names) {
                    const element = instance.host.querySelector(
                        `[data-custom-slot="${name}"]`,
                    );
                    const scope = JSON.parse(
                        element.getAttribute('data-scope'),
                    );
                    expect(Object.keys(scope)).toEqual(scopedKeys[name] || []);
                    expect(scope).not.toHaveProperty('ref_for');
                }
                await instance.click('[data-cy="user-options-stack"]');
                const stack = instance.host.querySelector(
                    '[data-custom-slot="optionStack"]',
                );
                expect(
                    JSON.parse(stack.getAttribute('data-scope')).isStack,
                ).toBe(true);
            });
        });

        test('preserves control order, cursor attributes and branch-specific events', async () => {
            await run({}, async (instance) => {
                instance.optionsProps.isCursorPointer = true;
                await settleOptions();
                const buttons = [
                    ...instance.host.querySelectorAll('button[data-cy]'),
                ];
                expect(
                    buttons.map((button) => button.getAttribute('data-cy')),
                ).toEqual(controlIds.map((id) => `user-options-${id}`));
                for (const button of buttons) {
                    expect(button.getAttribute('tabindex')).toBe('0');
                    expect(button.style.cursor).toBe(popover ? 'pointer' : '');
                    button.click();
                    await settleOptions();
                }
                expect(instance.events.map(([event]) => event)).toEqual([
                    'generatePdf',
                    'generateCsv',
                    'generateImage',
                    'generateSvg',
                    'toggleTooltip',
                    'toggleTable',
                    'toggleLabels',
                    'toggleSort',
                    'toggleStack',
                    'toggleFullscreen',
                    'toggleZoom',
                    'toggleAnimation',
                    'toggleAnnotator',
                    popover ? 'copyAlt' : 'toggleAnnotator',
                ]);
            });
        });

        test('keeps callback overrides and the CSV callback reference', async () => {
            await run({}, async (instance) => {
                const table = vi.fn();
                const csv = vi.fn();
                instance.optionsProps.callbacks = { table, csv };
                await settleOptions();
                await instance.click('[data-cy="user-options-table"]');
                await instance.click('[data-cy="user-options-xls"]');
                expect(table).toHaveBeenCalledOnce();
                expect(instance.events).toEqual([['generateCsv', csv]]);
            });
        });

        test('preserves loading icons, tooltip hover classes and the animation title guard', async () => {
            await run({}, async (instance) => {
                instance.optionsProps.position = 'left';
                instance.optionsProps.titles = {
                    pdf: 'PDF',
                    animation: 'Animation',
                };
                instance.optionsProps.isPrinting = true;
                instance.optionsProps.isImaging = true;
                await settleOptions();
                for (const id of ['pdf', 'img']) {
                    expect(
                        instance.host
                            .querySelector(`[data-cy="user-options-${id}"] svg`)
                            .classList.contains('spin'),
                    ).toBe(true);
                }
                await instance.click(
                    '[data-cy="user-options-pdf"]',
                    'mouseenter',
                );
                const tooltip = instance.host.querySelector(
                    '[data-cy="user-options-pdf"] [data-cy="uo-tooltip"]',
                );
                expect(tooltip.textContent).toBe('PDF');
                expect(
                    tooltip.classList.contains('button-info-left-visible'),
                ).toBe(true);
                expect(
                    instance.host.querySelector(
                        '[data-cy="user-options-anim"] [data-cy="uo-tooltip"]',
                    ),
                ).toBeNull();
                instance.optionsProps.titles.fullscreen = 'Fullscreen';
                await settleOptions();
                expect(
                    instance.host.querySelector(
                        '[data-cy="user-options-anim"] [data-cy="uo-tooltip"]',
                    ).textContent,
                ).toBe('Animation');
            });
        });

        test('retains stateful slot content when other controls and slots change', async () => {
            let mounts = 0;
            const Stateful = defineComponent({
                setup() {
                    const count = ref(0);
                    onMounted(() => {
                        mounts += 1;
                    });
                    return () =>
                        h(
                            'span',
                            {
                                'data-stateful-action': '',
                                onClick(event) {
                                    event.stopPropagation();
                                    count.value += 1;
                                },
                            },
                            count.value,
                        );
                },
            });
            const pdf = () => h(Stateful);
            await run({ optionPdf: pdf }, async (instance) => {
                await instance.click('[data-stateful-action]');
                instance.optionsProps.hasImg = false;
                instance.optionsProps.hasSvg = false;
                instance.slotState.value = {
                    ...makeOptionSlots(['optionCsv']),
                    optionPdf: pdf,
                };
                await settleOptions();
                await instance.click('[data-cy="user-options-anim"]');
                instance.optionsProps.hasImg = true;
                instance.optionsProps.hasSvg = true;
                instance.slotState.value = { optionPdf: pdf };
                await settleOptions();
                expect(
                    instance.host.querySelector('[data-stateful-action]')
                        .textContent,
                ).toBe('1');
                expect(mounts).toBe(1);
            });
        });
    },
);
