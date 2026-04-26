import type { DefineComponent, VNodeChild } from 'vue';

import type {
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
    CommonAnnotatorSlots,
} from 'vue-data-ui';

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
    CommonAnnotatorSlots,
};

declare const VueUiDagBase: DefineComponent<VueUiDagProps>;

export const VueUiDag: typeof VueUiDagBase & {
    new (): VueUiDagExpose & {
        $slots: CommonAnnotatorSlots & {
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
            optionAltCopy?: () => VNodeChild;
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
