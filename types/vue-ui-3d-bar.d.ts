import type { DefineComponent, VNodeChild } from 'vue';

export type {
    VueUi3dBarConfig,
    VueUi3dBarDataset,
    VueUi3dBarExpose,
    VueUi3dBarDatapoint,
    VueUi3dBarDatasetBreakdown,
    VueUi3dBarEvent,
    VueUi3dBarProps,
    VueUiAnnotatorActionColorSlotProps,
    VueUiAnnotatorActionDrawSlotProps,
    VueUiAnnotatorActionUndoSlotProps,
    VueUiAnnotatorActionRedoSlotProps,
    VueUiAnnotatorActionDeleteSlotProps,
    VueUiMenuIconSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUi3dBarOptionCopyAltSlotProps,
    VueUi3dBarLegendSlotProps,
    VueUi3dBarSvgSlotProps,
    VueUiWatermarkSlotProps,
} from 'vue-data-ui';

declare const VueUi3dBarBase: DefineComponent<VueUi3dBarProps>;

export const VueUi3dBar: typeof VueUi3dBarBase & {
    new (): VueUi3dBarExpose & {
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
                props: VueUi3dBarOptionCopyAltSlotProps,
            ) => VNodeChild;
            ['chart-background']?: () => VNodeChild;
            legend?: (props: VueUi3dBarLegendSlotProps) => VNodeChild;
            svg?: (props: VueUi3dBarSvgSlotProps) => VNodeChild;
            watermark?: (props: VueUiWatermarkSlotProps) => VNodeChild;
            source?: () => VNodeChild;
            skeleton?: () => VNodeChild;
        };
    };
};

export default VueUi3dBar;
export { VueUi3dBar };
