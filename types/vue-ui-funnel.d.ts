import type { DefineComponent, VNodeChild } from 'vue';

export type {
    VueUiFunnelDatasetItem,
    VueUiFunnelConfig,
    VueUiFunnelExpose,
    VueUiFunnelProps,
    VueUiAnnotatorActionColorSlotProps,
    VueUiAnnotatorActionDrawSlotProps,
    VueUiAnnotatorActionUndoSlotProps,
    VueUiAnnotatorActionRedoSlotProps,
    VueUiAnnotatorActionDeleteSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUiFunnelOptionCopyAltSlotProps,
    VueUiFunnelSvgSlotProps,
    VueUiWatermarkSlotProps,
} from 'vue-data-ui';

declare const VueUiFunnelBase: DefineComponent<VueUiFunnelProps>;

export const VueUiFunnel: typeof VueUiFunnelBase & {
    new (): VueUiFunnelExpose & {
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
            optionAltCopy?: (
                props: VueUiFunnelOptionCopyAltSlotProps,
            ) => VNodeChild;
            ['chart-background']?: () => VNodeChild;
            svg?: (props: VueUiFunnelSvgSlotProps) => VNodeChild;
            watermark?: (props: VueUiWatermarkSlotProps) => VNodeChild;
            source?: () => VNodeChild;
        };
    };
};

export default VueUiFunnel;
export { VueUiFunnel };
