import type { DefineComponent, VNodeChild } from 'vue';

export type {
    VueUiXyHighlightArea,
    VueUiXyAnnotation,
    VueUiXyConfig,
    VueUiXyDatasetItem,
    VueUiXyDatasetBarItem,
    VueUiXyDatasetLineItem,
    VueUiXyDatasetPlotItem,
    VueUiXySeries,
    VueUiXyDatapointItem,
    VueUiXyExpose,
    VueUiXyEvent,
    VueUiXyProps,
    VueUiXyLegendSlotProps,
    VueUiResetActionSlotProps,
    VueUiXyTooltipSlotProps,
    VueUiAnnotatorActionColorSlotProps,
    VueUiAnnotatorActionDrawSlotProps,
    VueUiAnnotatorActionUndoSlotProps,
    VueUiAnnotatorActionRedoSlotProps,
    VueUiAnnotatorActionDeleteSlotProps,
    VueUiMenuIconSlotProps,
    VueUiOptionStackSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUiXyOptionCopyAltSlotProps,
    VueUiXyBarGradientSlotProps,
    VueUiXyAreaGradientSlotProps,
    VueUiXyPlotCommentSlotProps,
    VueUiPatternSlotProps,
    VueUiXyTimeLabelSlotProps,
    VueUiXySvgSlotProps,
    VueUiKeyboardNavigationHintSlotProps,
    VueUiWatermarkSlotProps,
} from 'vue-data-ui';

declare const VueUiXyBase: DefineComponent<VueUiXyProps>;

export const VueUiXy: typeof VueUiXyBase & {
    new (): VueUiXyExpose & {
        $slots: {
            legend?: (props: VueUiXyLegendSlotProps) => VNodeChild;
            ['resest-action']?: (
                props: VueUiResetActionSlotProps,
            ) => VNodeChild;
            ['tooltip-before']?: (props: VueUiXyTooltipSlotProps) => VNodeChild;
            tooltip?: (props: VueUiXyTooltipSlotProps) => VNodeChild;
            ['tooltip-after']?: (props: VueUiXyTooltipSlotProps) => VNodeChild;
            ['annotator-action-close']?: () => VNodeChild;
            ['annotator-action-color']?: (
                props: VueUiAnnotatorActionColorSlotProps,
            ) => VNodeChild;
            ['annotator-action-draw']?: (
                props: VueUiAnnotatorActionDrawSlotProps,
            ) => VNodeChild;
            ['annotator-action-undo']?: (
                props: VueUiAnnotatorActionUndoSlotProps,
            ) => VNodeChild;
            ['annotator-action-redo']?: (
                props: VueUiAnnotatorActionRedoSlotProps,
            ) => VNodeChild;
            ['annotator-action-delete']?: (
                props: VueUiAnnotatorActionDeleteSlotProps,
            ) => VNodeChild;
            menuIcon?: (props: VueUiMenuIconSlotProps) => VNodeChild;
            optionTooltip?: () => VNodeChild;
            optionPdf?: () => VNodeChild;
            optionCsv?: () => VNodeChild;
            optionImg?: () => VNodeChild;
            optionSvg?: () => VNodeChild;
            optionTable?: () => VNodeChild;
            optionLabels?: () => VNodeChild;
            optionStack?: (props: VueUiOptionStackSlotProps) => VNodeChild;
            optionFullscreen?: (
                props: VueUiOptionFullscreenSlotProps,
            ) => VNodeChild;
            optionAnnotator?: (
                props: VueUiOptionAnnotatorSlotProps,
            ) => VNodeChild;
            optionAltCopy?: (
                props: VueUiXyOptionCopyAltSlotProps,
            ) => VNodeChild;
            ['chart-background']?: () => VNodeChild;
            ['bar-gradient']?: (
                props: VueUiXyBarGradientSlotProps,
            ) => VNodeChild;
            ['area-gradient']?: (
                props: VueUiXyAreaGradientSlotProps,
            ) => VNodeChild;
            ['plot-comment']?: (
                props: VueUiXyPlotCommentSlotProps,
            ) => VNodeChild;
            pattern?: (props: VueUiPatternSlotProps) => VNodeChild;
            ['time-label']?: (props: VueUiXyTimeLabelSlotProps) => VNodeChild;
            svg?: (props: VueUiXySvgSlotProps) => VNodeChild;
            hint?: (props: VueUiKeyboardNavigationHintSlotProps) => VNodeChild;
            watermark?: (props: VueUiWatermarkSlotProps) => VNodeChild;
            source?: () => VNodeChild;
            skeleton?: () => VNodeChild;
        };
    };
};

export default VueUiXy;
export { VueUiXy };
