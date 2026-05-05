import type { DefineComponent, VNodeChild } from 'vue';

import type {
    VueUiWordCloudDatasetItem,
    VueUiWordCloudDatapoint,
    VueUiWordCloudConfig,
    VueUiWordCloudExpose,
    VueUiWordCloudEvent,
    VueUiWordCloudProps,
    CommonAnnotatorSlots,
    VueUiMenuIconSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUiWordCloudOptionZoomSlotProps,
    VueUiWordCloudSvgSlotProps,
    VueUiKeyboardNavigationHintSlotProps,
    VueUiWatermarkSlotProps,
    VueUiResetActionSlotProps,
    VueUiWordCloudTooltipSlotProps,
} from 'vue-data-ui';

export type {
    VueUiWordCloudDatasetItem,
    VueUiWordCloudDatapoint,
    VueUiWordCloudConfig,
    VueUiWordCloudExpose,
    VueUiWordCloudEvent,
    VueUiWordCloudProps,
    CommonAnnotatorSlots,
    VueUiMenuIconSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUiWordCloudOptionZoomSlotProps,
    VueUiWordCloudSvgSlotProps,
    VueUiKeyboardNavigationHintSlotProps,
    VueUiWatermarkSlotProps,
    VueUiResetActionSlotProps,
    VueUiWordCloudTooltipSlotProps,
};

declare const VueUiWordCloudBase: DefineComponent<VueUiWordCloudProps>;

export const VueUiWordCloud: typeof VueUiWordCloudBase & {
    new (): VueUiWordCloudExpose & {
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
            optionZoom?: (
                props: VueUiWordCloudOptionZoomSlotProps,
            ) => VNodeChild;
            ['chart-background']?: () => VNodeChild;
            svg?: (props: VueUiWordCloudSvgSlotProps) => VNodeChild;
            hint?: (props: VueUiKeyboardNavigationHintSlotProps) => VNodeChild;
            watermark?: (props: VueUiWatermarkSlotProps) => VNodeChild;
            source?: () => VNodeChild;
            skeleton?: () => VNodeChild;
            ['reset-action']?: (
                props: VueUiResetActionSlotProps,
            ) => VNodeChild;
            ['tooltip-before']?: (
                props: VueUiWordCloudTooltipSlotProps,
            ) => VNodeChild;
            tooltip?: (props: VueUiWordCloudTooltipSlotProps) => VNodeChild;
            ['tooltip-after']?: (
                props: VueUiWordCloudTooltipSlotProps,
            ) => VNodeChild;
        };
    };
};

export default VueUiWordCloud;
export { VueUiWordCloud };
