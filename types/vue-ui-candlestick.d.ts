import type { DefineComponent, VNodeChild } from 'vue';

import type {
    VueUiCandlestickConfig,
    VueUiCandlestickDatapoint,
    VueUiCandlestickExpose,
    VueUiCandlestickEvent,
    VueUiCandlestickProps,
    VueUiCandlestickDatapointSegment,
    VueUiCandlestickDatapoint,
    VueUiAnnotatorActionColorSlotProps,
    VueUiAnnotatorActionDrawSlotProps,
    VueUiAnnotatorActionUndoSlotProps,
    VueUiAnnotatorActionRedoSlotProps,
    VueUiAnnotatorActionDeleteSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUiCandlestickSvgSlotProps,
    VueUiKeyboardNavigationHintSlotProps,
    VueUiWatermarkSlotProps,
    VueUiCandlestickLegendSlotProps,
    VueUiCandlestickTooltipSlotProps,
    OHLC,
    CommonAnnotatorSlots,
} from 'vue-data-ui';

export type {
    VueUiCandlestickConfig,
    VueUiCandlestickDatapoint,
    VueUiCandlestickExpose,
    VueUiCandlestickEvent,
    VueUiCandlestickProps,
    VueUiCandlestickDatapointSegment,
    VueUiCandlestickDatapoint,
    VueUiAnnotatorActionColorSlotProps,
    VueUiAnnotatorActionDrawSlotProps,
    VueUiAnnotatorActionUndoSlotProps,
    VueUiAnnotatorActionRedoSlotProps,
    VueUiAnnotatorActionDeleteSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUiCandlestickSvgSlotProps,
    VueUiKeyboardNavigationHintSlotProps,
    VueUiWatermarkSlotProps,
    VueUiCandlestickLegendSlotProps,
    VueUiCandlestickTooltipSlotProps,
    OHLC,
    CommonAnnotatorSlots,
};

declare const VueUiCandlestickBase: DefineComponent<VueUiCandlestickProps>;

export const VueUiCandlestick: typeof VueUiCandlestickBase & {
    new (): VueUiCandlestickExpose & {
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
            svg?: (props: VueUiCandlestickSvgSlotProps) => VNodeChild;
            hint?: (props: VueUiKeyboardNavigationHintSlotProps) => VNodeChild;
            watermark?: (props: VueUiWatermarkSlotProps) => VNodeChild;
            ['resest-action']?: (
                props: VueUiResetActionSlotProps,
            ) => VNodeChild;
            legend?: (props: VueUiCandlestickLegendSlotProps) => VNodeChild;
            source?: () => VNodeChild;
            ['tooltip-before']?: (
                props: VueUiCandlestickTooltipSlotProps,
            ) => VNodeChild;
            tooltip?: (props: VueUiCandlestickTooltipSlotProps) => VNodeChild;
            ['tooltip-after']?: (
                props: VueUiCandlestickTooltipSlotProps,
            ) => VNodeChild;
            source?: () => VNodeChild;
            skeleton?: () => VNodeChild;
        };
    };
};

export default VueUiCandlestick;
export { VueUiCandlestick };
