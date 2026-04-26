import type { DefineComponent, VNodeChild } from 'vue';

import type {
    VueUiWorldDatapoint,
    VueUiWorldConfig,
    VueUiWorldDataset,
    VueUiWorldExpose,
    VueUiWorldEvent,
    VueUiWorldProps,
    CommonAnnotatorSlots,
    VueUiMenuIconSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUiWorldPatternSlotProps,
    VueUiWorldSvgSlotProps,
    VueUiWatermarkSlotProps,
    VueUiWorldLegendItem,
    VueUiWorldLegendSlotProps,
    VueUiWorldTooltipSlotProps,
} from 'vue-data-ui';

export type {
    VueUiWorldDatapoint,
    VueUiWorldConfig,
    VueUiWorldDataset,
    VueUiWorldExpose,
    VueUiWorldEvent,
    VueUiWorldProps,
    CommonAnnotatorSlots,
    VueUiMenuIconSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUiWorldPatternSlotProps,
    VueUiWorldSvgSlotProps,
    VueUiWatermarkSlotProps,
    VueUiWorldLegendItem,
    VueUiWorldLegendSlotProps,
    VueUiWorldTooltipSlotProps,
};

declare const VueUiWorldBase: DefineComponent<VueUiWorldProps>;

export const VueUiWorld: typeof VueUiWorldBase & {
    new (): VueUiWorldExpose & {
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
            ['chart-background']?: () => VNodeChild;
            pattern?: (props: VueUiWorldPatternSlotProps) => VNodeChild;
            svg?: (props: VueUiWorldSvgSlotProps) => VNodeChild;
            watermark?: (props: VueUiWatermarkSlotProps) => VNodeChild;
            source?: () => VNodeChild;
            skeleton?: () => VNodeChild;
            legend?: (props: VueUiWorldLegendSlotProps) => VNodeChild;
            ['tooltip-before']?: (
                props: VueUiWorldTooltipSlotProps,
            ) => VNodeChild;
            tooltip?: (props: VueUiWorldTooltipSlotProps) => VNodeChild;
            ['tooltip-after']?: (
                props: VueUiWorldTooltipSlotProps,
            ) => VNodeChild;
        };
    };
};

export default VueUiWorld;
export { VueUiWorld };
