import type { DefineComponent, VNodeChild } from 'vue';

import type {
    VueUiStackbarDatasetItem,
    VueUiStackbarDatapointItem,
    VueUiStackbarSeriesItem,
    VueUiStackbarConfig,
    VueUiStackbarExpose,
    VueUiStackbarEvent,
    VueUiStackbarProps,
    CommonAnnotatorSlots,
    VueUiMenuIconSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUiStackbarFormattedDatasetItem,
    VueUiStackbarTimeLabelSlotProps,
    VueUiStackbarSvgSlotProps,
    VueUiKeyboardNavigationHintSlotProps,
    VueUiWatermarkSlotProps,
    VueUiStackbarTooltipDatapoint,
    VueUiStackbarTooltipSlotProps,
    VueUiStackbarLegendItem,
    VueUiStackbarLegendSlotProps,
    VueUiResetActionSlotProps,
} from 'vue-data-ui';

export type {
    VueUiStackbarDatasetItem,
    VueUiStackbarDatapointItem,
    VueUiStackbarSeriesItem,
    VueUiStackbarConfig,
    VueUiStackbarExpose,
    VueUiStackbarEvent,
    VueUiStackbarProps,
    CommonAnnotatorSlots,
    VueUiMenuIconSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUiStackbarFormattedDatasetItem,
    VueUiStackbarTimeLabelSlotProps,
    VueUiStackbarSvgSlotProps,
    VueUiKeyboardNavigationHintSlotProps,
    VueUiWatermarkSlotProps,
    VueUiStackbarTooltipDatapoint,
    VueUiStackbarTooltipSlotProps,
    VueUiStackbarLegendItem,
    VueUiStackbarLegendSlotProps,
    VueUiResetActionSlotProps,
};

declare const VueUiStackbarBase: DefineComponent<VueUiStackbarProps>;

export const VueUiStackbar: typeof VueUiStackbarBase & {
    new (): VueUiStackbarExpose & {
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
            ['time-label']?: (
                props: VueUiStackbarTimeLabelSlotProps,
            ) => VNodeChild;
            svg?: (props: VueUiStackbarSvgSlotProps) => VNodeChild;
            hint?: (props: VueUiKeyboardNavigationHintSlotProps) => VNodeChild;
            watermark?: (props: VueUiWatermarkSlotProps) => VNodeChild;
            source?: () => VNodeChild;
            skeleton?: () => VNodeChild;
            ['tooltip-before']?: (
                props: VueUiStackbarTooltipSlotProps,
            ) => VNodeChild;
            tooltip?: (props: VueUiStackbarTooltipSlotProps) => VNodeChild;
            ['tooltip-after']?: (
                props: VueUiStackbarTooltipSlotProps,
            ) => VNodeChild;
            legend?: (props: VueUiStackbarLegendSlotProps) => VNodeChild;
            ['reset-action']?: (
                props: VueUiResetActionSlotProps,
            ) => VNodeChild;
        };
    };
};

export default VueUiStackbar;
export { VueUiStackbar };
