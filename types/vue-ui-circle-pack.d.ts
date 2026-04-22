import type { DefineComponent, VNodeChild } from 'vue';

import type {
    VueUiCirclePackDatasetItem,
    VueUiCirclePackDatapoint,
    VueUiCirclePackConfig,
    VueUiCirclePackExpose,
    VueUiCirclePackEvent,
    VueUiCirclePackProps,
    VueUiAnnotatorActionColorSlotProps,
    VueUiAnnotatorActionDrawSlotProps,
    VueUiAnnotatorActionUndoSlotProps,
    VueUiAnnotatorActionRedoSlotProps,
    VueUiAnnotatorActionDeleteSlotProps,
    VueUiMenuIconSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUiPatternSlotProps,
    VueUiCirclePackDataLabelSlotProps,
    VueUiCirclePackCircleSlotProps,
    VueUiCirclePackSvgSlotProps,
    VueUiKeyboardNavigationHintSlotProps,
    VueUiWatermarkSlotProps,
    VueUiCircleDatapointTooltipSlotProps,
} from 'vue-data-ui';

export type {
    VueUiCirclePackDatasetItem,
    VueUiCirclePackDatapoint,
    VueUiCirclePackConfig,
    VueUiCirclePackExpose,
    VueUiCirclePackEvent,
    VueUiCirclePackProps,
    VueUiAnnotatorActionColorSlotProps,
    VueUiAnnotatorActionDrawSlotProps,
    VueUiAnnotatorActionUndoSlotProps,
    VueUiAnnotatorActionRedoSlotProps,
    VueUiAnnotatorActionDeleteSlotProps,
    VueUiMenuIconSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUiPatternSlotProps,
    VueUiCirclePackDataLabelSlotProps,
    VueUiCirclePackCircleSlotProps,
    VueUiCirclePackSvgSlotProps,
    VueUiKeyboardNavigationHintSlotProps,
    VueUiWatermarkSlotProps,
    VueUiCircleDatapointTooltipSlotProps,
};

declare const VueUiCirclePackBase: DefineComponent<VueUiCirclePackProps>;

export const VueUiCirclePack: typeof VueUiCirclePackBase & {
    new (): VueUiCirclePackExpose & {
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
            optionAnnotator?: (
                props: VueUiOptionAnnotatorSlotProps,
            ) => VNodeChild;
            optionAltCopy?: () => VNodeChild;
            ['chart-background']?: () => VNodeChild;
            pattern?: (props: VueUiPatternSlotProps) => VNodeChild;
            ['data-label']?: (
                props: VueUiCirclePackDataLabelSlotProps,
            ) => VNodeChild;
            circle?: (props: VueUiCirclePackCircleSlotProps) => VNodeChild;
            svg?: (props: VueUiCirclePackSvgSlotProps) => VNodeChild;
            hint?: (props: VueUiKeyboardNavigationHintSlotProps) => VNodeChild;
            watermark?: (props: VueUiWatermarkSlotProps) => VNodeChild;
            source?: () => VNodeChild;
            ['tooltip-before']?: (
                props: VueUiCircleDatapointTooltipSlotProps,
            ) => VNodeChild;
            tooltip?: (
                props: VueUiCircleDatapointTooltipSlotProps,
            ) => VNodeChild;
            ['tooltip-after']?: (
                props: VueUiCircleDatapointTooltipSlotProps,
            ) => VNodeChild;
            skeleton?: () => VNodeChild;
        };
    };
};

export default VueUiCirclePack;
export { VueUiCirclePack };
