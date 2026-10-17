import { describe, expect, test } from 'vitest';
import { defineComponent, h, onMounted, ref } from 'vue';
import {
    configurePopover,
    exerciseOptions,
    makeOptionSlots,
    mountOptionsHarness,
    optionSlotNames,
    settleOptions,
} from './helpers/userOptionsHarness';

const originalSlots = `
    <template #menuIcon="{ isOpen, color }" v-if="$slots.menuIcon"><slot name="menuIcon" v-bind="{ isOpen, color }" /></template>
    <template #optionPdf v-if="$slots.optionPdf"><slot name="optionPdf" /></template>
    <template #optionCsv v-if="$slots.optionCsv"><slot name="optionCsv" /></template>
    <template #optionImg v-if="$slots.optionImg"><slot name="optionImg" /></template>
    <template #optionSvg v-if="$slots.optionSvg"><slot name="optionSvg" /></template>
    <template #optionTooltip v-if="$slots.optionTooltip"><slot name="optionTooltip" /></template>
    <template #optionTable v-if="$slots.optionTable"><slot name="optionTable" /></template>
    <template #optionLabels v-if="$slots.optionLabels"><slot name="optionLabels" /></template>
    <template #optionSort v-if="$slots.optionSort"><slot name="optionSort" /></template>
    <template #optionStack v-if="$slots.optionStack"><slot name="optionStack" /></template>
    <template #optionFullscreen="{ toggleFullscreen, isFullscreen }" v-if="$slots.optionFullscreen"><slot name="optionFullscreen" v-bind="{ toggleFullscreen, isFullscreen }" /></template>
    <template #optionZoom="{ toggleZoom, isZoomLocked }" v-if="$slots.optionZoom"><slot name="optionZoom" v-bind="{ toggleZoom, isZoomLocked }" /></template>
    <template #optionAnimation="{ toggleAnimation, isAnimated }" v-if="$slots.optionAnimation"><slot name="optionAnimation" v-bind="{ toggleAnimation, isAnimated }" /></template>
    <template #optionAnnotator="{ toggleAnnotator, isAnnotator }" v-if="$slots.optionAnnotator"><slot name="optionAnnotator" v-bind="{ toggleAnnotator, isAnnotator }" /></template>
    <template #optionAltCopy="{ altCopy: c }" v-if="$slots.optionAltCopy"><slot name="optionAltCopy" v-bind="{ altCopy: c }" /></template>
    <template #custom-menu-before v-if="$slots['custom-menu-before']"><slot name="custom-menu-before" /></template>
    <template #custom-menu-after v-if="$slots['custom-menu-after']"><slot name="custom-menu-after" /></template>`;

const sharedSlots = `
    <template v-for="slotName in getUserOptionSlots($slots, '${optionSlotNames.join(' ')}')" #[slotName]="slotProps">
        <slot :name="slotName" v-bind="getUserOptionSlotProps(slotName, slotProps)" />
    </template>`;

describe.each([false, true])(
    'user option slot rendering with popover=%s',
    (popover) => {
        test.each(['missing', 'provided', 'empty'])(
            'preserves DOM, events, scopes, and refs for %s slots',
            async (scenario) => {
                const restore = configurePopover(popover);
                try {
                    const makeSlots = () =>
                        scenario === 'missing'
                            ? {}
                            : scenario === 'empty'
                              ? Object.fromEntries(
                                    optionSlotNames.map((name) => [
                                        name,
                                        () => [],
                                    ]),
                                )
                              : makeOptionSlots();
                    expect(
                        await exerciseOptions(sharedSlots, makeSlots()),
                    ).toEqual(
                        await exerciseOptions(originalSlots, makeSlots()),
                    );
                } finally {
                    restore();
                }
            },
        );
    },
);

test('adding and removing other slots retains state in an existing slot', async () => {
    const restore = configurePopover(false);
    let mounts = 0;
    const StatefulSlot = defineComponent({
        setup() {
            const count = ref(0);
            onMounted(() => {
                mounts += 1;
            });
            return () =>
                h(
                    'span',
                    {
                        'data-stateful-slot': '',
                        onClick: () => {
                            count.value += 1;
                        },
                    },
                    count.value,
                );
        },
    });
    const pdfSlot = () => h(StatefulSlot);
    const instance = await mountOptionsHarness(sharedSlots, {
        optionPdf: pdfSlot,
    });
    try {
        await instance.click('[data-stateful-slot]');
        instance.slotState.value = {
            ...makeOptionSlots(['menuIcon', 'optionImg']),
            optionPdf: pdfSlot,
        };
        await settleOptions();
        instance.slotState.value = { optionPdf: pdfSlot };
        await settleOptions();
        expect(
            instance.host.querySelector('[data-stateful-slot]').textContent,
        ).toBe('1');
        expect(mounts).toBe(1);
    } finally {
        instance.unmount();
        restore();
    }
});
