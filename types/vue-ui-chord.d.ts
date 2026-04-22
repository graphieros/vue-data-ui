import type { DefineComponent, VNodeChild } from 'vue';

import type {
    VueUiChordDataset,
    VueUiChordDatapointArc,
    VueUiChordNode,
    VueUiChordDatapointRibbon,
    VueUiChordConfig,
    VueUiChordExpose,
    VueUiChordEvent,
    VueUiChordProps,
    VueUiAnnotatorActionColorSlotProps,
    VueUiAnnotatorActionDrawSlotProps,
    VueUiAnnotatorActionUndoSlotProps,
    VueUiAnnotatorActionRedoSlotProps,
    VueUiAnnotatorActionDeleteSlotProps,
    VueUiMenuIconSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUiChordSvgSlotProps,
    VueUiWatermarkSlotProps,
    VueUiKeyboardNavigationHintSlotProps,
    VueUiChordLegendItem,
    VueUiChordLegendSlotProps,
    VueUiChordPatternSlotProps,
    VueUiResetActionSlotProps,
} from 'vue-data-ui';

export type {
    VueUiChordDataset,
    VueUiChordDatapointArc,
    VueUiChordNode,
    VueUiChordDatapointRibbon,
    VueUiChordConfig,
    VueUiChordExpose,
    VueUiChordEvent,
    VueUiChordProps,
    VueUiAnnotatorActionColorSlotProps,
    VueUiAnnotatorActionDrawSlotProps,
    VueUiAnnotatorActionUndoSlotProps,
    VueUiAnnotatorActionRedoSlotProps,
    VueUiAnnotatorActionDeleteSlotProps,
    VueUiMenuIconSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUiChordSvgSlotProps,
    VueUiWatermarkSlotProps,
    VueUiKeyboardNavigationHintSlotProps,
    VueUiChordLegendItem,
    VueUiChordLegendSlotProps,
    VueUiChordPatternSlotProps,
    VueUiResetActionSlotProps,
};

declare const VueUiChordBase: DefineComponent<VueUiChordProps>;

export const VueUiChord: typeof VueUiChordBase & {
    new (): VueUiChordExpose & {
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
            optionAltCopy?: () => VNodeChild;
            ['chart-background']?: () => VNodeChild;
            svg?: (props: VueUiChordSvgSlotProps) => VNodeChild;
            watermark?: (props: VueUiWatermarkSlotProps) => VNodeChild;
            hint?: (props: VueUiKeyboardNavigationHintSlotProps) => VNodeChild;
            legend?: (props: VueUiChordLegendSlotProps) => VNodeChild;
            pattern?: (props: VueUiChordPatternSlotProps) => VNodeChild;
            source?: () => VNodeChild;
            ['resest-action']?: (
                props: VueUiResetActionSlotProps,
            ) => VNodeChild;
            skeleton?: () => VNodeChild;
        };
    };
};

export default VueUiChord;
export { VueUiChord };
