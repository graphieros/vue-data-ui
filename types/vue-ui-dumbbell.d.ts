import type { DefineComponent, VNodeChild } from 'vue';

export type {
    VueUiDumbbellConfigLabel,
    VueUiDumbbellDatapoint,
    VueUiDumbbellConfig,
    VueUiDumbbellDataset,
    VueUiDumbbellExpose,
    VueUiDumbbellEvent,
    VueUiDumbbellProps,
    VueUiAnnotatorActionColorSlotProps,
    VueUiAnnotatorActionDrawSlotProps,
    VueUiAnnotatorActionUndoSlotProps,
    VueUiAnnotatorActionRedoSlotProps,
    VueUiAnnotatorActionDeleteSlotProps,
    VueUiMenuIconSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUiDumbbellOptionCopyAltSlotProps,
    VueUiDumbbellSvgSlotProps,
    VueUiDumbbellLegendItem,
    VueUiDumbbellLegendSlotProps,
} from 'vue-data-ui';

declare const VueUiDumbbellBase: DefineComponent<VueUiDumbbellProps>;

export const VueUiDumbbell: typeof VueUiDumbbellBase & {
    new (): VueUiDumbbellExpose & {
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
                props: VueUiDumbbellOptionCopyAltSlotProps,
            ) => VNodeChild;
            ['chart-background']?: () => VNodeChild;
            svg?: (props: VueUiDumbbellSvgSlotProps) => VNodeChild;
            hint?: (props: VueUiKeyboardNavigationHintSlotProps) => VNodeChild;
            watermark?: (props: VueUiWatermarkSlotProps) => VNodeChild;
            legend?: (props: VueUiDumbbellLegendSlotProps) => VNodeChild;
            source?: () => VNodeChild;
            skeleton?: () => VNodeChild;
        };
    };
};

export default VueUiDumbbell;
export { VueUiDumbbell };
