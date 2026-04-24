import type { DefineComponent, VNodeChild } from 'vue';

import type {
    VueUiHeatmapConfig,
    VueUiHeatmapDatapoint,
    VueUiHeatmapRow,
    VueUiHeatmapDatasetItem,
    VueUiHeatmapExpose,
    VueUiHeatmapProps,
    VueUiAnnotatorActionColorSlotProps,
    VueUiAnnotatorActionDrawSlotProps,
    VueUiAnnotatorActionUndoSlotProps,
    VueUiAnnotatorActionRedoSlotProps,
    VueUiAnnotatorActionDeleteSlotProps,
    VueUiMenuIconSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUiHeatmapSvgSlotProps,
    VueUiKeyboardNavigationHintSlotProps,
    VueUiWatermarkSlotProps,
    VueUiHeatmapTooltipSlotProps,
    CommonAnnotatorSlots,
} from 'vue-data-ui';

export type {
    VueUiHeatmapConfig,
    VueUiHeatmapDatapoint,
    VueUiHeatmapRow,
    VueUiHeatmapDatasetItem,
    VueUiHeatmapExpose,
    VueUiHeatmapProps,
    VueUiAnnotatorActionColorSlotProps,
    VueUiAnnotatorActionDrawSlotProps,
    VueUiAnnotatorActionUndoSlotProps,
    VueUiAnnotatorActionRedoSlotProps,
    VueUiAnnotatorActionDeleteSlotProps,
    VueUiMenuIconSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUiHeatmapSvgSlotProps,
    VueUiKeyboardNavigationHintSlotProps,
    VueUiWatermarkSlotProps,
    VueUiHeatmapTooltipSlotProps,
    CommonAnnotatorSlots,
};

declare const VueUiHeatmapBase: DefineComponent<VueUiHeatmapProps>;

export const VueUiHeatmap: typeof VueUiHeatmapBase & {
    new (): VueUiHeatmapExpose & {
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
            svg?: (props: VueUiHeatmapSvgSlotProps) => VNodeChild;
            hint?: (props: VueUiKeyboardNavigationHintSlotProps) => VNodeChild;
            watermark?: (props: VueUiWatermarkSlotProps) => VNodeChild;
            source?: () => VNodeChild;
            ['tooltip-before']?: (
                props: VueUiHeatmapTooltipSlotProps,
            ) => VNodeChild;
            tooltip?: (props: VueUiHeatmapTooltipSlotProps) => VNodeChild;
            ['tooltip-after']?: (
                props: VueUiHeatmapTooltipSlotProps,
            ) => VNodeChild;
            skeleton?: () => VNodeChild;
        };
    };
};

export default VueUiHeatmap;
export { VueUiHeatmap };
