import type { DefineComponent, VNodeChild } from 'vue';

import type {
    VueUiNestedDonutsDatasetItem,
    VueUiNestedDonutsConfig,
    VueUiNestedDonutsSeriesItem,
    VueUiNestedDonutsDatapoint,
    VueUiNestedDonutsExpose,
    VueUiDonutEvent,
    VueUiNestedDonutsProps,
    VueUiAnnotatorActionColorSlotProps,
    VueUiAnnotatorActionDrawSlotProps,
    VueUiAnnotatorActionUndoSlotProps,
    VueUiAnnotatorActionRedoSlotProps,
    VueUiAnnotatorActionDeleteSlotProps,
    VueUiMenuIconSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUiNestedDonutsSvgSlotProps,
    VueUiKeyboardNavigationHintSlotProps,
    VueUiWatermarkSlotProps,
    VueUiNestedDonutsTooltipSlotProps,
    VueUiNestedDonutsLegendItem,
    VueUiNestedDonutsLegendSlotProps,
} from 'vue-data-ui';

export type {
    VueUiNestedDonutsDatasetItem,
    VueUiNestedDonutsConfig,
    VueUiNestedDonutsSeriesItem,
    VueUiNestedDonutsDatapoint,
    VueUiNestedDonutsExpose,
    VueUiDonutEvent,
    VueUiNestedDonutsProps,
    VueUiAnnotatorActionColorSlotProps,
    VueUiAnnotatorActionDrawSlotProps,
    VueUiAnnotatorActionUndoSlotProps,
    VueUiAnnotatorActionRedoSlotProps,
    VueUiAnnotatorActionDeleteSlotProps,
    VueUiMenuIconSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUiNestedDonutsSvgSlotProps,
    VueUiKeyboardNavigationHintSlotProps,
    VueUiWatermarkSlotProps,
    VueUiNestedDonutsTooltipSlotProps,
    VueUiNestedDonutsLegendItem,
    VueUiNestedDonutsLegendSlotProps,
};

declare const VueUiNestedDonutsBase: DefineComponent<VueUiNestedDonutsProps>;

export const VueUiNestedDonuts: typeof VueUiNestedDonutsBase & {
    new (): VueUiNestedDonutsExpose & {
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
            optionLabels?: () => VNodeChild;
            optionFullscreen?: (
                props: VueUiOptionFullscreenSlotProps,
            ) => VNodeChild;
            optionAltCopy?: () => VNodeChild;
            optionAnnotator?: (
                props: VueUiOptionAnnotatorSlotProps,
            ) => VNodeChild;
            ['chart-background']?: () => VNodeChild;
            svg?: (props: VueUiNestedDonutsSvgSlotProps) => VNodeChild;
            hint?: (props: VueUiKeyboardNavigationHintSlotProps) => VNodeChild;
            watermark?: (props: VueUiWatermarkSlotProps) => VNodeChild;
            ['tooltip-before']?: (
                props: VueUiNestedDonutsTooltipSlotProps,
            ) => VNodeChild;
            tooltip?: (props: VueUiNestedDonutsTooltipSlotProps) => VNodeChild;
            ['tooltip-after']?: (
                props: VueUiNestedDonutsTooltipSlotProps,
            ) => VNodeChild;
            legend?: (props: VueUiNestedDonutsLegendSlotProps) => VNodeChild;
            source?: () => VNodeChild;
            skeleton?: () => VNodeChild;
        };
    };
};

export default VueUiNestedDonuts;
export { VueUiNestedDonuts };
