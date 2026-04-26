import type { DefineComponent, VNodeChild } from 'vue';

import type {
    VueUiStripPlotConfig,
    VueUiStripPlotDatapoint,
    VueUiStripPlotSeriesItem,
    VueUiStripPlotDatasetItem,
    VueUiStripPlotDataset,
    VueUiStripPlotExpose,
    VueUiStripPlotEvent,
    VueUiStripPlotProps,
    CommonAnnotatorSlots,
    VueUiMenuIconSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUiStripPlotSvgSlotProps,
    VueUiKeyboardNavigationHintSlotProps,
    VueUiWatermarkSlotProps,
    VueUiStripPlotTooltipSlotProps,
} from 'vue-data-ui';

export type {
    VueUiStripPlotConfig,
    VueUiStripPlotDatapoint,
    VueUiStripPlotSeriesItem,
    VueUiStripPlotDatasetItem,
    VueUiStripPlotDataset,
    VueUiStripPlotExpose,
    VueUiStripPlotEvent,
    VueUiStripPlotProps,
    CommonAnnotatorSlots,
    VueUiMenuIconSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUiStripPlotSvgSlotProps,
    VueUiKeyboardNavigationHintSlotProps,
    VueUiWatermarkSlotProps,
    VueUiStripPlotTooltipSlotProps,
};

declare const VueUiStripPlotBase: DefineComponent<VueUiStripPlotProps>;

export const VueUiStripPlot: typeof VueUiStripPlotBase & {
    new (): VueUiStripPlotExpose & {
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
            svg?: (props: VueUiStripPlotSvgSlotProps) => VNodeChild;
            hint?: (props: VueUiKeyboardNavigationHintSlotProps) => VNodeChild;
            watermark?: (props: VueUiWatermarkSlotProps) => VNodeChild;
            source?: () => VNodeChild;
            skeleton?: () => VNodeChild;
            ['tooltip-before']?: (
                props: VueUiStripPlotTooltipSlotProps,
            ) => VNodeChild;
            tooltip?: (props: VueUiStripPlotTooltipSlotProps) => VNodeChild;
            ['tooltip-after']?: (
                props: VueUiStripPlotTooltipSlotProps,
            ) => VNodeChild;
        };
    };
};

export default VueUiStripPlot;
export { VueUiStripPlot };
