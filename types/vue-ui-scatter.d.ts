import type { DefineComponent, VNodeChild } from 'vue';

import type {
    VueUiScatterDatasetValueItem,
    VueUiScatterDatasetItem,
    VueUiScatterConfig,
    VueUiScatterDatapoint,
    VueUiScatterSeries,
    VueUiScatterExpose,
    VueUiScatterEvent,
    VueUiScatterProps,
    CommonAnnotatorSlots,
    VueUiMenuIconSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUiScatterSvgSlotProps,
    VueUiKeyboardNavigationHintSlotProps,
    VueUiWatermarkSlotProps,
    VueUiLegendSlotProps,
    VueUiScatterTooltipSlotProps,
} from 'vue-data-ui';

export type {
    VueUiScatterDatasetValueItem,
    VueUiScatterDatasetItem,
    VueUiScatterConfig,
    VueUiScatterDatapoint,
    VueUiScatterSeries,
    VueUiScatterExpose,
    VueUiScatterEvent,
    VueUiScatterProps,
    CommonAnnotatorSlots,
    VueUiMenuIconSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUiScatterSvgSlotProps,
    VueUiKeyboardNavigationHintSlotProps,
    VueUiWatermarkSlotProps,
    VueUiLegendSlotProps,
    VueUiScatterTooltipSlotProps,
};

declare const VueUiScatterBase: DefineComponent<VueUiScatterProps>;

export const VueUiScatter: typeof VueUiScatterBase & {
    new (): VueUiScatterExpose & {
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
            optionAltCopy?: () => VNodeChild;
            optionAnnotator?: (
                props: VueUiOptionAnnotatorSlotProps,
            ) => VNodeChild;
            svg?: (props: VueUiScatterSvgSlotProps) => VNodeChild;
            hint?: (props: VueUiKeyboardNavigationHintSlotProps) => VNodeChild;
            watermark?: (props: VueUiWatermarkSlotProps) => VNodeChild;
            source?: () => VNodeChild;
            skeleton?: () => VNodeChild;
            legend?: (props: VueUiLegendSlotProps) => VNodeChild;
            ['tooltip-before']?: (
                props: VueUiScatterTooltipSlotProps,
            ) => VNodeChild;
            tooltip?: (props: VueUiScatterTooltipSlotProps) => VNodeChild;
            ['tooltip-after']?: (
                props: VueUiScatterTooltipSlotProps,
            ) => VNodeChild;
        };
    };
};

export default VueUiScatter;
export { VueUiScatter };
