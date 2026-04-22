import type { DefineComponent, VNodeChild } from 'vue';

export type {
    VueUiHistoryPlotDatasetItem,
    VueUiHistoryPlotConfig,
    VueUiHistoryPlotDatapoint,
    VueUiHistoryPlotDatapointEvent,
    VueUiHistoryPlotDatpointSeries,
    VueUiHistoryPlotExpose,
    VueUiHistoryPlotEvent,
    VueUiHistoryPlotProps,
    VueUiAnnotatorActionColorSlotProps,
    VueUiAnnotatorActionDrawSlotProps,
    VueUiAnnotatorActionUndoSlotProps,
    VueUiAnnotatorActionRedoSlotProps,
    VueUiAnnotatorActionDeleteSlotProps,
    VueUiMenuIconSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUiHistoryPlotFormattedDatapoint,
    VueUiHistoryPlotOptionCopyAltSlotProps,
    VueUiHistoryPlotSvgSlotProps,
    VueUiKeyboardNavigationHintSlotProps,
    VueUiWatermarkSlotProps,
    VueUiHistoryPlotLegendItem,
    VueUiHistoryPlotLegendSlotProps,
    VueUiHistoryPlotTooltipSlotProps,
} from 'vue-data-ui';

declare const VueUiHistoryPlotBase: DefineComponent<VueUiHistoryPlotProps>;

export const VueUiHistoryPlot: typeof VueUiHistoryPlotBase & {
    new (): VueUiHistoryPlotExpose & {
        $slots: {
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
            optionFullscreen?: (
                props: VueUiOptionFullscreenSlotProps,
            ) => VNodeChild;
            optionAnnotator?: (
                props: VueUiOptionAnnotatorSlotProps,
            ) => VNodeChild;
            optionAltCopy?: (
                props: VueUiHistoryPlotOptionCopyAltSlotProps,
            ) => VNodeChild;
            ['chart-background']?: () => VNodeChild;
            svg?: (props: VueUiHistoryPlotSvgSlotProps) => VNodeChild;
            hint?: (props: VueUiKeyboardNavigationHintSlotProps) => VNodeChild;
            watermark?: (props: VueUiWatermarkSlotProps) => VNodeChild;
            legend?: (props: VueUiHistoryPlotLegendSlotProps) => VNodeChild;
            source?: () => VNodeChild;
            ['tooltip-before']?: (
                props: VueUiHistoryPlotTooltipSlotProps,
            ) => VNodeChild;
            tooltip?: (props: VueUiHistoryPlotTooltipSlotProps) => VNodeChild;
            ['tooltip-after']?: (
                props: VueUiHistoryPlotTooltipSlotProps,
            ) => VNodeChild;
            skeleton?: () => VNodeChild;
        };
    };
};

export default VueUiHistoryPlot;
export { VueUiHistoryPlot };
