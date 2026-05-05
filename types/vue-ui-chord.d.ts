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
    CommonAnnotatorSlots,
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
    CommonAnnotatorSlots,
};

declare const VueUiChordBase: DefineComponent<VueUiChordProps>;

export const VueUiChord: typeof VueUiChordBase & {
    new (): VueUiChordExpose & {
        $slots: CommonAnnotatorSlots & {
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
            ['reset-action']?: (
                props: VueUiResetActionSlotProps,
            ) => VNodeChild;
            skeleton?: () => VNodeChild;
        };
    };
};

export default VueUiChord;
export { VueUiChord };
