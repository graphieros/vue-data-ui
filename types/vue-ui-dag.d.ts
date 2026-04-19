import type { DefineComponent, VNodeChild } from 'vue';

export type {
    VueUiDagConfig,
    VueUiDagDataset,
    VueUiDagExpose,
    VueUiDagNode,
    VueUiDagEdge,
    VueUiDagProps,
    VueUiAnnotatorActionColorSlotProps,
    VueUiAnnotatorActionDrawSlotProps,
    VueUiAnnotatorActionUndoSlotProps,
    VueUiAnnotatorActionRedoSlotProps,
    VueUiAnnotatorActionDeleteSlotProps,
    VueUiMenuIconSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUiDagOptionZoomSlotProps,
    VueUiDagOptionCopyAltSlotProps,
    VueUiDagBackgroundPatternSlotProps,
    VueUiDagNodeSlotProps,
    VueUiDagFreeNodeLabelSlotProps,
    VueUiDagLayoutData,
    VueUiDagPositionedEdge,
    VueUiDagPositionedNode,
    VueUiDagSvgSlotProps,
    VueUiKeyboardNavigationHintSlotProps,
    VueUiDagTooltipMidpointSlotProps,
    VueUiDagTooltipNodeSlotProps,
} from 'vue-data-ui';

declare const VueUiDagBase: DefineComponent<VueUiDagProps>;

export const VueUiDag: typeof VueUiDagBase & {
    new (): VueUiDagExpose & {
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
            optionPdf?: () => VNodeChild;
            optionImg?: () => VNodeChild;
            optionSvg?: () => VNodeChild;
            optionFullscreen?: (
                props: VueUiOptionFullscreenSlotProps,
            ) => VNodeChild;
            optionAnnotator?: (
                props: VueUiOptionAnnotatorSlotProps,
            ) => VNodeChild;
            optionZoom?: (props: VueUiDagOptionZoomSlotProps) => VNodeChild;
            optionAltCopy?: (
                props: VueUiDagOptionCopyAltSlotProps,
            ) => VNodeChild;
            ['background-pattern']?: (
                props: VueUiDagBackgroundPatternSlotProps,
            ) => VNodeChild;
            node?: (props: VueUiDagNodeSlotProps) => VNodeChild;
            ['node-label']?: (props: VueUiDagNodeSlotProps) => VNodeChild;
            ['free-node-label']?: (
                props: VueUiDagFreeNodeLabelSlotProps,
            ) => VNodeChild;
            svg?: (props: VueUiDagSvgSlotProps) => VNodeChild;
            hint?: (props: VueUiKeyboardNavigationHintSlotProps) => VNodeChild;
            watermark?: (props: VueUiWatermarkSlotProps) => VNodeChild;
            ['tooltip-midpoint']?: (
                props: VueUiDagTooltipMidpointSlotProps,
            ) => VNodeChild;
            ['tooltip-node']?: (
                props: VueUiDagTooltipNodeSlotProps,
            ) => VNodeChild;
            source?: () => VNodeChild;
            skeleton?: () => VNodeChild;
        };
    };
};

export default VueUiDag;
export { VueUiDag };
