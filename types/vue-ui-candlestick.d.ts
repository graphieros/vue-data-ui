import type { DefineComponent, VNodeChild } from 'vue';

import type {
    VueUiCandlestickConfig,
    VueUiCandlestickDatapoint,
    VueUiCandlestickExpose,
    VueUiCandlestickEvent,
    VueUiCandlestickProps,
    VueUiCandlestickDatapointSegment,
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
    VueUiCandlestickEmits,
    VueUiCandlestickEmitSelectX,
    VueUiCandlestickEmitCopyAlt,
} from 'vue-data-ui';

export type {
    VueUiCandlestickConfig,
    VueUiCandlestickDatapoint,
    VueUiCandlestickExpose,
    VueUiCandlestickEvent,
    VueUiCandlestickProps,
    VueUiCandlestickDatapointSegment,
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
    VueUiCandlestickEmits,
    VueUiCandlestickEmitSelectX,
    VueUiCandlestickEmitCopyAlt,
};

declare const VueUiCandlestickBase: DefineComponent<
    VueUiCandlestickProps,
    {},
    {},
    {},
    {},
    {},
    {},
    VueUiCandlestickEmits
>;

export const VueUiCandlestick: typeof VueUiCandlestickBase & {
    new (): VueUiCandlestickExpose & {
        $slots: CommonAnnotatorSlots & {
            ['custom-menu-before']?: () => VNodeChild;
            ['custom-menu-after']?: () => VNodeChild;
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
            ['reset-action']?: (props: VueUiResetActionSlotProps) => VNodeChild;
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
