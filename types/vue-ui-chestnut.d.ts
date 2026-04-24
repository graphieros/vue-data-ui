import type { DefineComponent, VNodeChild } from 'vue';

import type {
    VueUiChestnutDatasetBranchBreakdown,
    VueUiChestnutDatasetBranch,
    VueUiChestnutDatasetRoot,
    VueUiChestnutConfig,
    VueUiChestnutExpose,
    VueUiChestnutDatapointNut,
    VueUiChestnutDatapointBranch,
    VueUiChestnutDatapointRoot,
    VueUiChestnutProps,
    VueUiAnnotatorActionColorSlotProps,
    VueUiAnnotatorActionDrawSlotProps,
    VueUiAnnotatorActionUndoSlotProps,
    VueUiAnnotatorActionRedoSlotProps,
    VueUiAnnotatorActionDeleteSlotProps,
    VueUiMenuIconSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUiChestnutSvgSlotProps,
    VueUiChestnutLegendSlotProps,
    CommonAnnotatorSlots,
} from 'vue-data-ui';

export type {
    VueUiChestnutDatasetBranchBreakdown,
    VueUiChestnutDatasetBranch,
    VueUiChestnutDatasetRoot,
    VueUiChestnutConfig,
    VueUiChestnutExpose,
    VueUiChestnutDatapointNut,
    VueUiChestnutDatapointBranch,
    VueUiChestnutDatapointRoot,
    VueUiChestnutProps,
    VueUiAnnotatorActionColorSlotProps,
    VueUiAnnotatorActionDrawSlotProps,
    VueUiAnnotatorActionUndoSlotProps,
    VueUiAnnotatorActionRedoSlotProps,
    VueUiAnnotatorActionDeleteSlotProps,
    VueUiMenuIconSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUiChestnutSvgSlotProps,
    VueUiChestnutLegendSlotProps,
    CommonAnnotatorSlots,
};

declare const VueUiChestnutBase: DefineComponent<VueUiChestnutProps>;

export const VueUiChestnut: typeof VueUiChestnutBase & {
    new (): VueUiChestnutExpose & {
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
            svg?: (props: VueUiChestnutSvgSlotProps) => VNodeChild;
            watermark?: (props: VueUiWatermarkSlotProps) => VNodeChild;
            legend?: (props: VueUiChestnutLegendSlotProps) => VNodeChild;
            source?: () => VNodeChild;
        };
    };
};

export default VueUiChestnut;
export { VueUiChestnut };
