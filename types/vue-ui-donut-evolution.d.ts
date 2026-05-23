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
    CommonAnnotatorSlots,
    VueUiDonutEvolutionEmits,
    VueUiDonutEvolutionEmitSelectLegend,
    VueUiDonutEvolutionEmitCopyAlt,
    VueUiDonutEvolutionSeries,
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
    CommonAnnotatorSlots,
    VueUiDonutEvolutionEmits,
    VueUiDonutEvolutionEmitSelectLegend,
    VueUiDonutEvolutionEmitCopyAlt,
    VueUiDonutEvolutionSeries,
};

declare const VueUiDonutEvolutionBase: DefineComponent<
    VueUiDonutEvolutionProps,
    {},
    {},
    {},
    {},
    {},
    {},
    VueUiDonutEvolutionEmits
>;

export const VueUiDonutEvolution: typeof VueUiDonutEvolutionBase & {
    new (): VueUiDonutEvolutionExpose & {
        $slots: CommonAnnotatorSlots & {
            ['custom-menu-before']?: () => VNodeChild;
            ['custom-menu-after']?: () => VNodeChild;
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
            ['reset-action']?: (props: VueUiResetActionSlotProps) => VNodeChild;
            legend?: (props: VueUiDonutEvolutionLegendSlotProps) => VNodeChild;
            source?: () => VNodeChild;
        };
    };
};

export default VueUiDonutEvolution;
export { VueUiDonutEvolution };
