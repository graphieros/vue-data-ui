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
    CommonAnnotatorSlots,
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
    CommonAnnotatorSlots,
};

declare const VueUiCirclePackBase: DefineComponent<VueUiCirclePackProps>;

export const VueUiCirclePack: typeof VueUiCirclePackBase & {
    new (): VueUiCirclePackExpose & {
        $slots: CommonAnnotatorSlots & {
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
