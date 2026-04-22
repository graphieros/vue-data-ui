import type { DefineComponent, VNodeChild } from 'vue';

import type {
    VueUiFlowDatasetItem,
    VueUiFlowNode,
    VueUiFlowFormattedDataset,
    VueUiFlowConfig,
    VueUiFlowExpose,
    VueUiFlowEvent,
    VueUiFlowProps,
    VueUiAnnotatorActionColorSlotProps,
    VueUiAnnotatorActionDrawSlotProps,
    VueUiAnnotatorActionUndoSlotProps,
    VueUiAnnotatorActionRedoSlotProps,
    VueUiAnnotatorActionDeleteSlotProps,
    VueUiFlowFormattedDataset,
    VueUiFlowFormattedLink,
    VueUiFlowFormattedNode,
    VueUiMenuIconSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUiFlowSvgSlotProps,
    VueUiKeyboardNavigationHintSlotProps,
    VueUiWatermarkSlotProps,
    VueUiFlowLegendItem,
    VueUiFlowLegendSlotProps,
    VueUiFlowTooltipSlotProps,
} from 'vue-data-ui';

export type {
    VueUiFlowDatasetItem,
    VueUiFlowNode,
    VueUiFlowFormattedDataset,
    VueUiFlowConfig,
    VueUiFlowExpose,
    VueUiFlowEvent,
    VueUiFlowProps,
    VueUiAnnotatorActionColorSlotProps,
    VueUiAnnotatorActionDrawSlotProps,
    VueUiAnnotatorActionUndoSlotProps,
    VueUiAnnotatorActionRedoSlotProps,
    VueUiAnnotatorActionDeleteSlotProps,
    VueUiFlowFormattedDataset,
    VueUiFlowFormattedLink,
    VueUiFlowFormattedNode,
    VueUiMenuIconSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUiFlowSvgSlotProps,
    VueUiKeyboardNavigationHintSlotProps,
    VueUiWatermarkSlotProps,
    VueUiFlowLegendItem,
    VueUiFlowLegendSlotProps,
    VueUiFlowTooltipSlotProps,
};

declare const VueUiFlowBase: DefineComponent<VueUiFlowProps>;

export const VueUiFlow: typeof VueUiFlowBase & {
    new (): VueUiFlowExpose & {
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
            optionFullscreen?: (
                props: VueUiOptionFullscreenSlotProps,
            ) => VNodeChild;
            optionAnnotator?: (
                props: VueUiOptionAnnotatorSlotProps,
            ) => VNodeChild;
            optionAltCopy?: () => VNodeChild;
            ['chart-background']?: () => VNodeChild;
            svg?: (props: VueUiFlowSvgSlotProps) => VNodeChild;
            hint?: (props: VueUiKeyboardNavigationHintSlotProps) => VNodeChild;
            watermark?: (props: VueUiWatermarkSlotProps) => VNodeChild;
            legend?: (props: VueUiFlowLegendSlotProps) => VNodeChild;
            source?: () => VNodeChild;
            skeleton?: () => VNodeChild;
            tooltip?: (props: c) => VNodeChild;
        };
    };
};

export default VueUiFlow;
export { VueUiFlow };
