import type { DefineComponent, VNodeChild } from 'vue';

import type {
    VueUiDonutConfig,
    VueUiDonutDatasetItem,
    VueUiDonutDatapoint,
    VueUiDonutSeriesItem,
    VueUiDonutExpose,
    VueUiDonutEvent,
    VueUiDonutLegendSlotProps,
    VueUiDonutProps,
    VueUiDonutTooltipSlotProps,
    VueUiDonutDataLabelSlotProps,
    VueUiDonutPlotCommentSlotProps,
    VueUiDonutSvgSlotProps,
    VueUiKeyboardNavigationHintSlotProps,
    VueUiWatermarkSlotProps,
    VueUiPatternSlotProps,
    VueUiDonutHollowSlotProps,
    VueUiMenuIconSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUiAnnotatorActionColorSlotProps,
    VueUiAnnotatorActionDrawSlotProps,
    VueUiAnnotatorActionUndoSlotProps,
    VueUiAnnotatorActionRedoSlotProps,
    VueUiAnnotatorActionDeleteSlotProps,
    CommonAnnotatorSlots,
} from 'vue-data-ui';

export type {
    VueUiDonutConfig,
    VueUiDonutDatasetItem,
    VueUiDonutDatapoint,
    VueUiDonutSeriesItem,
    VueUiDonutExpose,
    VueUiDonutEvent,
    VueUiDonutLegendSlotProps,
    VueUiDonutProps,
    VueUiDonutTooltipSlotProps,
    VueUiDonutDataLabelSlotProps,
    VueUiDonutPlotCommentSlotProps,
    VueUiDonutSvgSlotProps,
    VueUiKeyboardNavigationHintSlotProps,
    VueUiWatermarkSlotProps,
    VueUiPatternSlotProps,
    VueUiDonutHollowSlotProps,
    VueUiMenuIconSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUiAnnotatorActionColorSlotProps,
    VueUiAnnotatorActionDrawSlotProps,
    VueUiAnnotatorActionUndoSlotProps,
    VueUiAnnotatorActionRedoSlotProps,
    VueUiAnnotatorActionDeleteSlotProps,
    CommonAnnotatorSlots,
};

declare const VueUiDonutBase: DefineComponent<VueUiDonutProps>;

export const VueUiDonut: typeof VueUiDonutBase & {
    new (): VueUiDonutExpose & {
        $slots: CommonAnnotatorSlots & {
            legend?: (props: VueUiDonutLegendSlotProps) => VNodeChild;
            ['tooltip-before']?: (
                props: VueUiDonutTooltipSlotProps,
            ) => VNodeChild;
            tooltip?: (props: VueUiDonutTooltipSlotProps) => VNodeChild;
            ['tooltip-after']?: (
                props: VueUiDonutTooltipSlotProps,
            ) => VNodeChild;
            dataLabel?: (props: VueUiDonutDataLabelSlotProps) => VNodeChild;
            ['plot-comment']?: (
                props: VueUiDonutPlotCommentSlotProps,
            ) => VNodeChild;
            ['chart-background']?: () => VNodeChild;
            svg?: (props: VueUiDonutSvgSlotProps) => VNodeChild;
            hint?: (props: VueUiKeyboardNavigationHintSlotProps) => VNodeChild;
            watermark?: (props: VueUiWatermarkSlotProps) => VNodeChild;
            source?: () => VNodeChild;
            skeleton?: () => VNodeChild;
            pattern?: (props: VueUiPatternSlotProps) => VNodeChild;
            hollow?: (props: VueUiDonutHollowSlotProps) => VNodeChild;
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
        };
    };
};

export default VueUiDonut;
export { VueUiDonut };
