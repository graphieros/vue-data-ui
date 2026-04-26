import type { DefineComponent, VNodeChild } from 'vue';

import type {
    VueUiStacklineDatasetItem,
    VueUiStacklineDatapointItem,
    VueUiStacklineSeriesItem,
    VueUiStacklineConfig,
    VueUiStacklineExpose,
    VueUiStacklineEvent,
    CommonAnnotatorSlots,
    VueUiStacklineProps,
    VueUiMenuIconSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUiPatternSlotProps,
    VueUiStacklineTimeLabelSlotProps,
    VueUiStacklineSvgSlotProps,
    VueUiKeyboardNavigationHintSlotProps,
    VueUiWatermarkSlotProps,
    VueUiStacklineLegendSlotProps,
    VueUiResetActionSlotProps,
    VueUiStacklineTooltipSlotProps,
} from 'vue-data-ui';

export type {
    VueUiStacklineDatasetItem,
    VueUiStacklineDatapointItem,
    VueUiStacklineSeriesItem,
    VueUiStacklineConfig,
    VueUiStacklineExpose,
    VueUiStacklineEvent,
    CommonAnnotatorSlots,
    VueUiStacklineProps,
    VueUiMenuIconSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUiPatternSlotProps,
    VueUiStacklineTimeLabelSlotProps,
    VueUiStacklineSvgSlotProps,
    VueUiKeyboardNavigationHintSlotProps,
    VueUiWatermarkSlotProps,
    VueUiStacklineLegendSlotProps,
    VueUiResetActionSlotProps,
    VueUiStacklineTooltipSlotProps,
};

declare const VueUiStacklineBase: DefineComponent<VueUiStacklineProps>;

export const VueUiStackline: typeof VueUiStacklineBase & {
    new (): VueUiStacklineExpose & {
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
                props: VueUiStacklineTimeLabelSlotProps,
            ) => VNodeChild;
            svg?: (props: VueUiStacklineSvgSlotProps) => VNodeChild;
            hint?: (props: VueUiKeyboardNavigationHintSlotProps) => VNodeChild;
            watermark?: (props: VueUiWatermarkSlotProps) => VNodeChild;
            source?: () => VNodeChild;
            skeleton?: () => VNodeChild;
            legend?: (props: VueUiStacklineLegendSlotProps) => VNodeChild;
            ['resest-action']?: (
                props: VueUiResetActionSlotProps,
            ) => VNodeChild;
            ['tooltip-before']?: (
                props: VueUiStacklineTooltipSlotProps,
            ) => VNodeChild;
            tooltip?: (props: VueUiStacklineTooltipSlotProps) => VNodeChild;
            ['tooltip-after']?: (
                props: VueUiStacklineTooltipSlotProps,
            ) => VNodeChild;
        };
    };
};

export default VueUiStackline;
export { VueUiStackline };
