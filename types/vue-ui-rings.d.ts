import type { DefineComponent, VNodeChild } from 'vue';

import type {
    VueUiRingsConfig,
    VueUiRingsDatapoint,
    VueUiRingsDatasetItem,
    VueUiRingsExpose,
    VueUiRingsEvent,
    VueUiRingsProps,
    CommonAnnotatorSlots,
    VueUiMenuIconSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUiRingsSvgSlotProps,
    VueUiKeyboardNavigationHintSlotProps,
    VueUiWatermarkSlotProps,
    VueUiRingsLegendItem,
    VueUiRingsLegendSlotProps,
    VueUiRingsTooltipSlotProps,
} from 'vue-data-ui';

export type {
    VueUiRingsConfig,
    VueUiRingsDatapoint,
    VueUiRingsDatasetItem,
    VueUiRingsExpose,
    VueUiRingsEvent,
    VueUiRingsProps,
    CommonAnnotatorSlots,
    VueUiMenuIconSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUiRingsSvgSlotProps,
    VueUiKeyboardNavigationHintSlotProps,
    VueUiWatermarkSlotProps,
    VueUiRingsLegendItem,
    VueUiRingsLegendSlotProps,
    VueUiRingsTooltipSlotProps,
};

declare const VueUiRingsBase: DefineComponent<VueUiRingsProps>;

export const VueUiRings: typeof VueUiRingsBase & {
    new (): VueUiRingsExpose & {
        $slots: CommonAnnotatorSlots & {
            menuIcon?: (props: VueUiMenuIconSlotProps) => VNodeChild;
            optionTooltip?: () => VNodeChild;
            optionPdf?: () => VNodeChild;
            optionCsv?: () => VNodeChild;
            optionImg?: () => VNodeChild;
            optionSvg?: () => VNodeChild;
            optionTable?: () => VNodeChild;
            optionLabels?: () => VNodeChild;
            optionFullscreen?: (
                props: VueUiOptionFullscreenSlotProps,
            ) => VNodeChild;
            optionAltCopy?: () => VNodeChild;
            optionAnnotator?: (
                props: VueUiOptionAnnotatorSlotProps,
            ) => VNodeChild;
            ['chart-background']?: () => VNodeChild;
            pattern?: (props: VueUiPatternSlotProps) => VNodeChild;
            svg?: (props: VueUiRingsSvgSlotProps) => VNodeChild;
            hint?: (props: VueUiKeyboardNavigationHintSlotProps) => VNodeChild;
            watermark?: (props: VueUiWatermarkSlotProps) => VNodeChild;
            source?: () => VNodeChild;
            skeleton?: () => VNodeChild;
            legend?: (props: VueUiRingsLegendSlotProps) => VNodeChild;
            ['tooltip-before']?: (
                props: VueUiRingsTooltipSlotProps,
            ) => VNodeChild;
            tooltip?: (props: VueUiRingsTooltipSlotProps) => VNodeChild;
            ['tooltip-after']?: (
                props: VueUiRingsTooltipSlotProps,
            ) => VNodeChild;
        };
    };
};

export default VueUiRings;
export { VueUiRings };
