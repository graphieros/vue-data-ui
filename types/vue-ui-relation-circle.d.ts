import type { DefineComponent, VNodeChild } from 'vue';

import type {
    VueUiRelationCircleConfig,
    VueUiRelationCircleDatasetItem,
    VueUiRelationCircleDatapoint,
    VueUiRelationCircleExpose,
    VueUiRelationCircleEvent,
    VueUiRelationCircleProps,
    VueUiAnnotatorActionColorSlotProps,
    VueUiAnnotatorActionDrawSlotProps,
    VueUiAnnotatorActionUndoSlotProps,
    VueUiAnnotatorActionRedoSlotProps,
    VueUiAnnotatorActionDeleteSlotProps,
    VueUiMenuIconSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUiRelationCircleDataLabelSlotProps,
    VueUiRelationCircleSvgSlotProps,
    VueUiKeyboardNavigationHintSlotProps,
    VueUiWatermarkSlotProps,
    CommonAnnotatorSlots,
} from 'vue-data-ui';

export type {
    VueUiRelationCircleConfig,
    VueUiRelationCircleDatasetItem,
    VueUiRelationCircleDatapoint,
    VueUiRelationCircleExpose,
    VueUiRelationCircleEvent,
    VueUiRelationCircleProps,
    VueUiAnnotatorActionColorSlotProps,
    VueUiAnnotatorActionDrawSlotProps,
    VueUiAnnotatorActionUndoSlotProps,
    VueUiAnnotatorActionRedoSlotProps,
    VueUiAnnotatorActionDeleteSlotProps,
    VueUiMenuIconSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUiRelationCircleDataLabelSlotProps,
    VueUiRelationCircleSvgSlotProps,
    VueUiKeyboardNavigationHintSlotProps,
    VueUiWatermarkSlotProps,
    CommonAnnotatorSlots,
};

declare const VueUiRelationCircleBase: DefineComponent<VueUiRelationCircleProps>;

export const VueUiRelationCircle: typeof VueUiRelationCircleBase & {
    new (): VueUiRelationCircleExpose & {
        $slots: CommonAnnotatorSlots & {
            menuIcon?: (props: VueUiMenuIconSlotProps) => VNodeChild;
            optionPdf?: () => VNodeChild;
            optionImg?: () => VNodeChild;
            optionSvg?: () => VNodeChild;
            optionFullscreen?: (
                props: VueUiOptionFullscreenSlotProps,
            ) => VNodeChild;
            optionAltCopy?: () => VNodeChild;
            optionAnnotator?: (
                props: VueUiOptionAnnotatorSlotProps,
            ) => VNodeChild;
            ['chart-background']?: () => VNodeChild;
            dataLabel?: (
                props: VueUiRelationCircleDataLabelSlotProps,
            ) => VNodeChild;
            svg?: (props: VueUiRelationCircleSvgSlotProps) => VNodeChild;
            hint?: (props: VueUiKeyboardNavigationHintSlotProps) => VNodeChild;
            watermark?: (props: VueUiWatermarkSlotProps) => VNodeChild;
            source?: () => VNodeChild;
            skeleton?: () => VNodeChild;
        };
    };
};

export default VueUiRelationCircle;
export { VueUiRelationCircle };
