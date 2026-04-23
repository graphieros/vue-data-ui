import type { DefineComponent, VNodeChild } from 'vue';

import type {
    VueUiOnionDatasetItem,
    VueUiOnionConfig,
    VueUiOnionDatapoint,
    VueUiOnionSeriesItem,
    VueUiOnionExpose,
    VueUiOnionEvent,
    VueUiOnionProps,
    VueUiAnnotatorActionColorSlotProps,
    VueUiAnnotatorActionDrawSlotProps,
    VueUiAnnotatorActionUndoSlotProps,
    VueUiAnnotatorActionRedoSlotProps,
    VueUiAnnotatorActionDeleteSlotProps,
    VueUiMenuIconSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUiOnionSvgSlotProps,
    VueUiKeyboardNavigationHintSlotProps,
    VueUiWatermarkSlotProps,
    VueUiOnionLegendSlotProps,
    VueUiOnionTooltipSlotProps,
} from 'vue-data-ui';

export type {
    VueUiOnionDatasetItem,
    VueUiOnionConfig,
    VueUiOnionDatapoint,
    VueUiOnionSeriesItem,
    VueUiOnionExpose,
    VueUiOnionEvent,
    VueUiOnionProps,
    VueUiAnnotatorActionColorSlotProps,
    VueUiAnnotatorActionDrawSlotProps,
    VueUiAnnotatorActionUndoSlotProps,
    VueUiAnnotatorActionRedoSlotProps,
    VueUiAnnotatorActionDeleteSlotProps,
    VueUiMenuIconSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUiOnionSvgSlotProps,
    VueUiKeyboardNavigationHintSlotProps,
    VueUiWatermarkSlotProps,
    VueUiOnionLegendSlotProps,
    VueUiOnionTooltipSlotProps,
};

declare const VueUiOnionBase: DefineComponent<VueUiOnionProps>;

export const VueUiOnion: typeof VueUiOnionBase & {
    new (): VueUiOnionExpose & {
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
            optionFullscreen?: (
                props: VueUiOptionFullscreenSlotProps,
            ) => VNodeChild;
            optionAltCopy?: () => VNodeChild;
            optionAnnotator?: (
                props: VueUiOptionAnnotatorSlotProps,
            ) => VNodeChild;
            ['chart-background']?: () => VNodeChild;
            svg?: (props: VueUiOnionSvgSlotProps) => VNodeChild;
            hint?: (props: VueUiKeyboardNavigationHintSlotProps) => VNodeChild;
            watermark?: (props: VueUiWatermarkSlotProps) => VNodeChild;
            source?: () => VNodeChild;
            skeleton?: () => VNodeChild;
            legend?: (props: VueUiOnionLegendSlotProps) => VNodeChild;
            ['tooltip-before']?: (
                props: VueUiOnionTooltipSlotProps,
            ) => VNodeChild;
            tooltip?: (props: VueUiOnionTooltipSlotProps) => VNodeChild;
            ['tooltip-after']?: (
                props: VueUiOnionTooltipSlotProps,
            ) => VNodeChild;
        };
    };
};

export default VueUiOnion;
export { VueUiOnion };
