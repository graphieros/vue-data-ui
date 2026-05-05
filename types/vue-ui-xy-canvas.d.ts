import type { DefineComponent, VNodeChild } from 'vue';

import type {
    VueUiXyCanvasDatasetItem,
    VueUiXyCanvasConfig,
    VueUiXyCanvasExpose,
    VueUiXyCanvasProps,
    VueUiXyCanvasDatapoint,
    VueUiXyCanvasTooltipDatapoint,
    CommonAnnotatorSlots,
    VueUiMenuIconSlotProps,
    VueUiOptionStackSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUiKeyboardNavigationHintSlotProps,
    VueUiWatermarkSlotProps,
    VueUiXyCanvasTooltipSlotProps,
    VueUiResetActionSlotProps,
    VueUiXyCanvasLegendItem,
    VueUiXyCanvasLegendSlotProps,
} from 'vue-data-ui';

export type {
    VueUiXyCanvasDatasetItem,
    VueUiXyCanvasConfig,
    VueUiXyCanvasExpose,
    VueUiXyCanvasProps,
    VueUiXyCanvasDatapoint,
    VueUiXyCanvasTooltipDatapoint,
    CommonAnnotatorSlots,
    VueUiMenuIconSlotProps,
    VueUiOptionStackSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUiKeyboardNavigationHintSlotProps,
    VueUiWatermarkSlotProps,
    VueUiXyCanvasTooltipSlotProps,
    VueUiResetActionSlotProps,
    VueUiXyCanvasLegendItem,
    VueUiXyCanvasLegendSlotProps,
};

declare const VueUiXyCanvasBase: DefineComponent<VueUiXyCanvasProps>;

export const VueUiXyCanvas: typeof VueUiXyCanvasBase & {
    new (): VueUiXyCanvasExpose & {
        $slots: CommonAnnotatorSlots & {
            menuIcon?: (props: VueUiMenuIconSlotProps) => VNodeChild;
            optionTooltip?: () => VNodeChild;
            optionPdf?: () => VNodeChild;
            optionCsv?: () => VNodeChild;
            optionImg?: () => VNodeChild;
            optionSvg?: () => VNodeChild;
            optionTable?: () => VNodeChild;
            optionLabels?: () => VNodeChild;
            optionStack?: (props: VueUiOptionStackSlotProps) => VNodeChild;
            optionFullscreen?: (
                props: VueUiOptionFullscreenSlotProps,
            ) => VNodeChild;
            optionAnnotator?: (
                props: VueUiOptionAnnotatorSlotProps,
            ) => VNodeChild;
            optionAltCopy?: () => VNodeChild;
            hint?: (props: VueUiKeyboardNavigationHintSlotProps) => VNodeChild;
            watermark?: (props: VueUiWatermarkSlotProps) => VNodeChild;
            source?: () => VNodeChild;
            skeleton?: () => VNodeChild;
            ['tooltip-before']?: (
                props: VueUiXyCanvasTooltipSlotProps,
            ) => VNodeChild;
            tooltip?: (props: VueUiXyCanvasTooltipSlotProps) => VNodeChild;
            ['tooltip-after']?: (
                props: VueUiXyCanvasTooltipSlotProps,
            ) => VNodeChild;
            ['reset-action']?: (props: VueUiResetActionSlotProps) => VNodeChild;
            legend?: (props: VueUiXyCanvasLegendSlotProps) => VNodeChild;
        };
    };
};

export default VueUiXyCanvas;
export { VueUiXyCanvas };
