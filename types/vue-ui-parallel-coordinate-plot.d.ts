import type { DefineComponent, VNodeChild } from 'vue';

import type {
    VueUiParallelCoordinatePlotDatasetSerieItem,
    VueUiParallelCoordinatePlotDatasetItem,
    VueUiParallelCoordinatePlotConfig,
    VueUiParallelCoordinatePlotEventDatapoint,
    VueUiParallelCoordinatePlotDatapointSelection,
    VueUiParallelCoordinatePlotScaleSelection,
    VueUiParallelCoordinatePlotExpose,
    VueUiParallelCoordinatePlotEvent,
    VueUiParallelCoordinatePlotProps,
    VueUiAnnotatorActionColorSlotProps,
    VueUiAnnotatorActionDrawSlotProps,
    VueUiAnnotatorActionUndoSlotProps,
    VueUiAnnotatorActionRedoSlotProps,
    VueUiAnnotatorActionDeleteSlotProps,
    VueUiMenuIconSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUiParallelCoordinatePlotFormattedDatapoint,
    VueUiParallelCoordinatePlotCommentSlotProps,
    VueUiParallelCoordinatePlotSvgSlotProps,
    VueUiKeyboardNavigationHintSlotProps,
    VueUiWatermarkSlotProps,
    VueUiParallelCoordinatePlotLegendSlotProps,
    VueUiParallelCoordinatePlotTooltipSlotProps,
    CommonAnnotatorSlots,
} from 'vue-data-ui';

export type {
    VueUiParallelCoordinatePlotDatasetSerieItem,
    VueUiParallelCoordinatePlotDatasetItem,
    VueUiParallelCoordinatePlotConfig,
    VueUiParallelCoordinatePlotEventDatapoint,
    VueUiParallelCoordinatePlotDatapointSelection,
    VueUiParallelCoordinatePlotScaleSelection,
    VueUiParallelCoordinatePlotExpose,
    VueUiParallelCoordinatePlotEvent,
    VueUiParallelCoordinatePlotProps,
    VueUiAnnotatorActionColorSlotProps,
    VueUiAnnotatorActionDrawSlotProps,
    VueUiAnnotatorActionUndoSlotProps,
    VueUiAnnotatorActionRedoSlotProps,
    VueUiAnnotatorActionDeleteSlotProps,
    VueUiMenuIconSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUiParallelCoordinatePlotFormattedDatapoint,
    VueUiParallelCoordinatePlotCommentSlotProps,
    VueUiParallelCoordinatePlotSvgSlotProps,
    VueUiKeyboardNavigationHintSlotProps,
    VueUiWatermarkSlotProps,
    VueUiParallelCoordinatePlotLegendSlotProps,
    VueUiParallelCoordinatePlotTooltipSlotProps,
    CommonAnnotatorSlots,
};

declare const VueUiParallelCoordinatePlotBase: DefineComponent<VueUiParallelCoordinatePlotProps>;

export const VueUiParallelCoordinatePlot: typeof VueUiParallelCoordinatePlotBase & {
    new (): VueUiParallelCoordinatePlotExpose & {
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
            ['plot-comment']?: (
                props: VueUiParallelCoordinatePlotCommentSlotProps,
            ) => VNodeChild;
            svg?: (
                props: VueUiParallelCoordinatePlotSvgSlotProps,
            ) => VNodeChild;
            hint?: (props: VueUiKeyboardNavigationHintSlotProps) => VNodeChild;
            watermark?: (props: VueUiWatermarkSlotProps) => VNodeChild;
            source?: () => VNodeChild;
            skeleton?: () => VNodeChild;
            legend?: (
                props: VueUiParallelCoordinatePlotLegendSlotProps,
            ) => VNodeChild;
            ['tooltip-before']?: (
                props: VueUiParallelCoordinatePlotTooltipSlotProps,
            ) => VNodeChild;
            tooltip?: (
                props: VueUiParallelCoordinatePlotTooltipSlotProps,
            ) => VNodeChild;
            ['tooltip-after']?: (
                props: VueUiParallelCoordinatePlotTooltipSlotProps,
            ) => VNodeChild;
        };
    };
};

export default VueUiParallelCoordinatePlot;
export { VueUiParallelCoordinatePlot };
