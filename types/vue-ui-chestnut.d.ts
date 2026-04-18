import type { DefineComponent } from 'vue';

export type {
    VueUiChestnutDatasetBranchBreakdown,
    VueUiChestnutDatasetBranch,
    VueUiChestnutDatasetRoot,
    VueUiChestnutConfig,
    VueUiChestnutExpose,
    VueUiChestnutDatapointNut,
    VueUiChestnutDatapointBranch,
    VueUiChestnutDatapointRoot,
    VueUiChestnutProps,
    VueUiAnnotatorActionColorSlotProps,
    VueUiAnnotatorActionDrawSlotProps,
    VueUiAnnotatorActionUndoSlotProps,
    VueUiAnnotatorActionRedoSlotProps,
    VueUiAnnotatorActionDeleteSlotProps,
    VueUiMenuIconSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUiChestnutOptionCopyAltSlotProps,
    VueUiChestnutSvgSlotProps,
    VueUiChestnutLegendSlotProps,
} from 'vue-data-ui';

declare const VueUiChestnutBase: DefineComponent<VueUiChestnutProps>;

export const VueUiChestnut: typeof VueUiChestnutBase & {
    new (): VueUiChestnutExpose & {
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
                props: VueUiChestnutOptionCopyAltSlotProps,
            ) => VNodeChild;
            ['chart-background']?: () => VNodeChild;
            svg?: (props: VueUiChestnutSvgSlotProps) => VNodeChild;
            watermark?: (props: VueUiWatermarkSlotProps) => VNodeChild;
            legend?: (props: VueUiChestnutLegendSlotProps) => VNodeChild;
            source?: () => VNodeChild;
        };
    };
};

export default VueUiChestnut;
export { VueUiChestnut };
