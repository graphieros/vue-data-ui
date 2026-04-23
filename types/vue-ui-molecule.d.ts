import type { DefineComponent, VNodeChild } from 'vue';

import type {
    VueUiMoleculeDatasetNode,
    VueUiMoleculeConfig,
    VueUiMoleculeDatapoint,
    VueUiMoleculeExpose,
    VueUiMoleculeEvent,
    VueUiMoleculeProps,
    VueUiAnnotatorActionColorSlotProps,
    VueUiAnnotatorActionDrawSlotProps,
    VueUiAnnotatorActionUndoSlotProps,
    VueUiAnnotatorActionRedoSlotProps,
    VueUiAnnotatorActionDeleteSlotProps,
    VueUiMenuIconSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUiMoleculeOptionZoomSlotProps,
    VueUiMoleculeNodeSlotProps,
    VueUiMoleculeNodeSvgSlotProps,
    VueUiMoleculeSvgSlotProps,
    VueUiWatermarkSlotProps,
    VueUiResetActionSlotProps,
    VueUiMoleculeTooltipSlotProps,
} from 'vue-data-ui';

export type {
    VueUiMoleculeDatasetNode,
    VueUiMoleculeConfig,
    VueUiMoleculeDatapoint,
    VueUiMoleculeExpose,
    VueUiMoleculeEvent,
    VueUiMoleculeProps,
    VueUiAnnotatorActionColorSlotProps,
    VueUiAnnotatorActionDrawSlotProps,
    VueUiAnnotatorActionUndoSlotProps,
    VueUiAnnotatorActionRedoSlotProps,
    VueUiAnnotatorActionDeleteSlotProps,
    VueUiMenuIconSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUiMoleculeOptionZoomSlotProps,
    VueUiMoleculeNodeSlotProps,
    VueUiMoleculeNodeSvgSlotProps,
    VueUiMoleculeSvgSlotProps,
    VueUiWatermarkSlotProps,
    VueUiResetActionSlotProps,
    VueUiMoleculeTooltipSlotProps,
};

declare const VueUiMoleculeBase: DefineComponent<VueUiMoleculeProps>;

export const VueUiMolecule: typeof VueUiMoleculeBase & {
    new (): VueUiMoleculeExpose & {
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
            optionZoom?: (
                props: VueUiMoleculeOptionZoomSlotProps,
            ) => VNodeChild;
            ['chart-background']?: () => VNodeChild;
            node?: (props: VueUiMoleculeNodeSlotProps) => VNodeChild;
            ['node-svg']?: (props: VueUiMoleculeNodeSvgSlotProps) => VNodeChild;
            svg?: (props: VueUiMoleculeSvgSlotProps) => VNodeChild;
            watermark?: (props: VueUiWatermarkSlotProps) => VNodeChild;
            ['resest-action']?: (
                props: VueUiResetActionSlotProps,
            ) => VNodeChild;
            source?: () => VNodeChild;
            ['tooltip-before']?: (
                props: VueUiMoleculeTooltipSlotProps,
            ) => VNodeChild;
            tooltip?: (props: VueUiMoleculeTooltipSlotProps) => VNodeChild;
            ['tooltip-after']?: (
                props: VueUiMoleculeTooltipSlotProps,
            ) => VNodeChild;
        };
    };
};

export default VueUiMolecule;
export { VueUiMolecule };
