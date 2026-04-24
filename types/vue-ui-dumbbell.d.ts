import type { DefineComponent, VNodeChild } from 'vue';

import type {
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
    VueUiDumbbellSvgSlotProps,
    VueUiDumbbellLegendItem,
    VueUiDumbbellLegendSlotProps,
    CommonAnnotatorSlots,
} from 'vue-data-ui';

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
    VueUiDumbbellSvgSlotProps,
    VueUiDumbbellLegendItem,
    VueUiDumbbellLegendSlotProps,
    CommonAnnotatorSlots,
};

declare const VueUiDumbbellBase: DefineComponent<VueUiDumbbellProps>;

export const VueUiDumbbell: typeof VueUiDumbbellBase & {
    new (): VueUiDumbbellExpose & {
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
