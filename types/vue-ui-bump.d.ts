import type { DefineComponent, VNodeChild } from 'vue';

import type {
    VueUiBumpExpose,
    VueUiBumpConfig,
    VueUiBumpDatasetItem,
    VueUiBumpDatapoint,
    VueUiBumpProps,
    VueUiAnnotatorActionColorSlotProps,
    VueUiAnnotatorActionDrawSlotProps,
    VueUiAnnotatorActionUndoSlotProps,
    VueUiAnnotatorActionRedoSlotProps,
    VueUiAnnotatorActionDeleteSlotProps,
    VueUiMenuIconSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUiBumpTimeLabelSlotProps,
    VueUiBumpSvgSlotProps,
    VueUiKeyboardNavigationHintSlotProps,
    VueUiWatermarkSlotProps,
    CommonAnnotatorSlots,
} from 'vue-data-ui';

export type {
    VueUiBumpExpose,
    VueUiBumpConfig,
    VueUiBumpDatasetItem,
    VueUiBumpDatapoint,
    VueUiBumpProps,
    VueUiAnnotatorActionColorSlotProps,
    VueUiAnnotatorActionDrawSlotProps,
    VueUiAnnotatorActionUndoSlotProps,
    VueUiAnnotatorActionRedoSlotProps,
    VueUiAnnotatorActionDeleteSlotProps,
    VueUiMenuIconSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUiBumpTimeLabelSlotProps,
    VueUiBumpSvgSlotProps,
    VueUiKeyboardNavigationHintSlotProps,
    VueUiWatermarkSlotProps,
    CommonAnnotatorSlots,
};

declare const VueUiBumpBase: DefineComponent<VueUiBumpProps>;

export const VueUiBump: typeof VueUiBumpBase & {
    new (): VueUiBumpExpose & {
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
            ['time-label']?: (props: VueUiBumpTimeLabelSlotProps) => VNodeChild;
            svg?: (props: VueUiBumpSvgSlotProps) => VNodeChild;
            hint?: (props: VueUiKeyboardNavigationHintSlotProps) => VNodeChild;
            watermark?: (props: VueUiWatermarkSlotProps) => VNodeChild;
            source?: () => VNodeChild;
            skeleton?: () => VNodeChild;
        };
    };
};

export default VueUiBump;
export { VueUiBump };
