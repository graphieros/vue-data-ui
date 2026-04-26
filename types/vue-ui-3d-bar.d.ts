import type { DefineComponent, VNodeChild } from 'vue';

import type {
    VueUi3dBarConfig,
    VueUi3dBarDataset,
    VueUi3dBarExpose,
    VueUi3dBarDatapoint,
    VueUi3dBarDatasetBreakdown,
    VueUi3dBarEvent,
    VueUi3dBarProps,
    VueUiAnnotatorActionColorSlotProps,
    VueUiAnnotatorActionDrawSlotProps,
    VueUiAnnotatorActionUndoSlotProps,
    VueUiAnnotatorActionRedoSlotProps,
    VueUiAnnotatorActionDeleteSlotProps,
    VueUiMenuIconSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUi3dBarLegendSlotProps,
    VueUi3dBarSvgSlotProps,
    VueUiWatermarkSlotProps,
    CommonAnnotatorSlots,
} from 'vue-data-ui';

export type {
    VueUi3dBarConfig,
    VueUi3dBarDataset,
    VueUi3dBarExpose,
    VueUi3dBarDatapoint,
    VueUi3dBarDatasetBreakdown,
    VueUi3dBarEvent,
    VueUi3dBarProps,
    VueUiAnnotatorActionColorSlotProps,
    VueUiAnnotatorActionDrawSlotProps,
    VueUiAnnotatorActionUndoSlotProps,
    VueUiAnnotatorActionRedoSlotProps,
    VueUiAnnotatorActionDeleteSlotProps,
    VueUiMenuIconSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUi3dBarLegendSlotProps,
    VueUi3dBarSvgSlotProps,
    VueUiWatermarkSlotProps,
    CommonAnnotatorSlots,
};

declare const VueUi3dBarBase: DefineComponent<VueUi3dBarProps>;

export const VueUi3dBar: typeof VueUi3dBarBase & {
    new (): VueUi3dBarExpose & {
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
            legend?: (props: VueUi3dBarLegendSlotProps) => VNodeChild;
            svg?: (props: VueUi3dBarSvgSlotProps) => VNodeChild;
            watermark?: (props: VueUiWatermarkSlotProps) => VNodeChild;
            source?: () => VNodeChild;
            skeleton?: () => VNodeChild;
        };
    };
};

export default VueUi3dBar;
export { VueUi3dBar };
