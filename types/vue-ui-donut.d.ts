import type { DefineComponent, VNodeChild } from 'vue';

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
    VueUiDonutOptionCopyAltSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUiAnnotatorActionColorSlotProps,
    VueUiAnnotatorActionDrawSlotProps,
    VueUiAnnotatorActionUndoSlotProps,
    VueUiAnnotatorActionRedoSlotProps,
    VueUiAnnotatorActionDeleteSlotProps,
} from 'vue-data-ui';

declare const VueUiDonutBase: DefineComponent<VueUiDonutProps>;

export const VueUiDonut: typeof VueUiDonutBase & {
    new (): VueUiDonutExpose & {
        $slots: {
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
            optionAltCopy?: (
                props: VueUiDonutOptionCopyAltSlotProps,
            ) => VNodeChild;
            optionAnnotator?: (
                props: VueUiOptionAnnotatorSlotProps,
            ) => VNodeChild;
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
        };
    };
};

export default VueUiDonut;
export { VueUiDonut };
