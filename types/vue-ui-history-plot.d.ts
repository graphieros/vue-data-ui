import type { DefineComponent, VNodeChild } from 'vue';

import type {
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
    VueUiHistoryPlotSvgSlotProps,
    VueUiKeyboardNavigationHintSlotProps,
    VueUiWatermarkSlotProps,
    VueUiHistoryPlotLegendItem,
    VueUiHistoryPlotLegendSlotProps,
    VueUiHistoryPlotTooltipSlotProps,
    CommonAnnotatorSlots,
} from 'vue-data-ui';

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
    VueUiHistoryPlotSvgSlotProps,
    VueUiKeyboardNavigationHintSlotProps,
    VueUiWatermarkSlotProps,
    VueUiHistoryPlotLegendItem,
    VueUiHistoryPlotLegendSlotProps,
    VueUiHistoryPlotTooltipSlotProps,
    CommonAnnotatorSlots,
};

declare const VueUiHistoryPlotBase: DefineComponent<VueUiHistoryPlotProps>;

export const VueUiHistoryPlot: typeof VueUiHistoryPlotBase & {
    new (): VueUiHistoryPlotExpose & {
        $slots: CommonAnnotatorSlots & {
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
            optionAltCopy?: () => VNodeChild;
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
