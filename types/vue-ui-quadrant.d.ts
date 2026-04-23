import type { DefineComponent, VNodeChild } from 'vue';

import type {
    VueUiQuadrantDatasetSerieItem,
    VueUiQuadrantDatasetItem,
    VueUiQuadrantSideConfig,
    VueUiQuadrantConfig,
    VueUiQuadrantDatapoint,
    VueUiQuadrantSerie,
    VueUiQuadrantExpose,
    VueUiQuadrantEvent,
    VueUiQuadrantProps,
    VueUiAnnotatorActionColorSlotProps,
    VueUiAnnotatorActionDrawSlotProps,
    VueUiAnnotatorActionUndoSlotProps,
    VueUiAnnotatorActionRedoSlotProps,
    VueUiAnnotatorActionDeleteSlotProps,
    VueUiMenuIconSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUiQuadrantDatapointSlotProps,
    VueUiQuadrantSvgSlotProps,
    VueUiKeyboardNavigationHintSlotProps,
    VueUiWatermarkSlotProps,
    VueUiQuadrantLegendSlotProps,
    VueUiQuadrantTooltipSlotProps,
} from 'vue-data-ui';

export type {
    VueUiQuadrantDatasetSerieItem,
    VueUiQuadrantDatasetItem,
    VueUiQuadrantSideConfig,
    VueUiQuadrantConfig,
    VueUiQuadrantDatapoint,
    VueUiQuadrantSerie,
    VueUiQuadrantExpose,
    VueUiQuadrantEvent,
    VueUiQuadrantProps,
    VueUiAnnotatorActionColorSlotProps,
    VueUiAnnotatorActionDrawSlotProps,
    VueUiAnnotatorActionUndoSlotProps,
    VueUiAnnotatorActionRedoSlotProps,
    VueUiAnnotatorActionDeleteSlotProps,
    VueUiMenuIconSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUiQuadrantDatapointSlotProps,
    VueUiQuadrantSvgSlotProps,
    VueUiKeyboardNavigationHintSlotProps,
    VueUiWatermarkSlotProps,
    VueUiQuadrantLegendSlotProps,
    VueUiQuadrantTooltipSlotProps,
};

declare const VueUiQuadrantBase: DefineComponent<VueUiQuadrantProps>;

export const VueUiQuadrant: typeof VueUiQuadrantBase & {
    new (): VueUiQuadrantExpose & {
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
            datapoint?: (props: VueUiQuadrantDatapointSlotProps) => VNodeChild;
            datapointSvg?: (
                props: VueUiQuadrantDatapointSlotProps,
            ) => VNodeChild;
            svg?: (props: VueUiQuadrantSvgSlotProps) => VNodeChild;
            hint?: (props: VueUiKeyboardNavigationHintSlotProps) => VNodeChild;
            watermark?: (props: VueUiWatermarkSlotProps) => VNodeChild;
            source?: () => VNodeChild;
            skeleton?: () => VNodeChild;
            legend?: (props: VueUiQuadrantLegendSlotProps) => VNodeChild;
            ['tooltip-before']?: (
                props: VueUiQuadrantTooltipSlotProps,
            ) => VNodeChild;
            tooltip?: (props: VueUiQuadrantTooltipSlotProps) => VNodeChild;
            ['tooltip-after']?: (
                props: VueUiQuadrantTooltipSlotProps,
            ) => VNodeChild;
        };
    };
};

export default VueUiQuadrant;
export { VueUiQuadrant };
