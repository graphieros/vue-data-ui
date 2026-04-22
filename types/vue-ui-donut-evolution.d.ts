import type { DefineComponent, VNodeChild } from 'vue';

import type {
    VueUiDonutEvolutionDatapoint,
    VueUiDonutEvolutionConfig,
    VueUiDonutEvolutionDatasetItem,
    VueUiDonutEvolutionExpose,
    VueUiDonutEvolutionEvent,
    VueUiDonutEvolutionProps,
    VueUiAnnotatorActionColorSlotProps,
    VueUiAnnotatorActionDrawSlotProps,
    VueUiAnnotatorActionUndoSlotProps,
    VueUiAnnotatorActionRedoSlotProps,
    VueUiAnnotatorActionDeleteSlotProps,
    VueUiMenuIconSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUiDonutEvolutionSvgSlotProps,
    VueUiKeyboardNavigationHintSlotProps,
    VueUiWatermarkSlotProps,
    VueUiDonutEvolutionLegendItem,
    VueUiDonutEvolutionLegendSlotProps,
} from 'vue-data-ui';

export type {
    VueUiDonutEvolutionDatapoint,
    VueUiDonutEvolutionConfig,
    VueUiDonutEvolutionDatasetItem,
    VueUiDonutEvolutionExpose,
    VueUiDonutEvolutionEvent,
    VueUiDonutEvolutionProps,
    VueUiAnnotatorActionColorSlotProps,
    VueUiAnnotatorActionDrawSlotProps,
    VueUiAnnotatorActionUndoSlotProps,
    VueUiAnnotatorActionRedoSlotProps,
    VueUiAnnotatorActionDeleteSlotProps,
    VueUiMenuIconSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUiDonutEvolutionSvgSlotProps,
    VueUiKeyboardNavigationHintSlotProps,
    VueUiWatermarkSlotProps,
    VueUiDonutEvolutionLegendItem,
    VueUiDonutEvolutionLegendSlotProps,
};

declare const VueUiDonutEvolutionBase: DefineComponent<VueUiDonutEvolutionProps>;

export const VueUiDonutEvolution: typeof VueUiDonutEvolutionBase & {
    new (): VueUiDonutEvolutionExpose & {
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
            svg?: (props: VueUiDonutEvolutionSvgSlotProps) => VNodeChild;
            hint?: (props: VueUiKeyboardNavigationHintSlotProps) => VNodeChild;
            watermark?: (props: VueUiWatermarkSlotProps) => VNodeChild;
            ['resest-action']?: (
                props: VueUiResetActionSlotProps,
            ) => VNodeChild;
            legend?: (props: VueUiDonutEvolutionLegendSlotProps) => VNodeChild;
            source?: () => VNodeChild;
        };
    };
};

export default VueUiDonutEvolution;
export { VueUiDonutEvolution };
