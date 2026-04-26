import type { DefineComponent, VNodeChild } from 'vue';

import type {
    VueUiTableHeatmapDatasetItem,
    VueUiTableHeatmapConfig,
    VueUiTableHeatmapProps,
    VueUiTableHeatmapExpose,
    VueUiMenuIconSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiTableHeatmapHeadSlotProps,
    VueUiTableHeatmapRowTitleSlotProps,
    VueUiTableHeatmapSumSlotProps,
    VueUiTableHeatmapAverageSlotProps,
    VueUiTableHeatmapMedianSlotProps,
    VueUiTableHeatmapCellSlotProps,
} from 'vue-data-ui';

export type {
    VueUiTableHeatmapDatasetItem,
    VueUiTableHeatmapConfig,
    VueUiTableHeatmapProps,
    VueUiTableHeatmapExpose,
    VueUiMenuIconSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiTableHeatmapHeadSlotProps,
    VueUiTableHeatmapRowTitleSlotProps,
    VueUiTableHeatmapSumSlotProps,
    VueUiTableHeatmapAverageSlotProps,
    VueUiTableHeatmapMedianSlotProps,
    VueUiTableHeatmapCellSlotProps,
};

declare const VueUiTableHeatmapBase: DefineComponent<VueUiTableHeatmapProps>;

export const VueUiTableHeatmap: typeof VueUiTableHeatmapBase & {
    new (): VueUiTableHeatmapExpose & {
        $slots: {
            menuIcon?: (props: VueUiMenuIconSlotProps) => VNodeChild;
            optionPdf?: () => VNodeChild;
            optionCsv?: () => VNodeChild;
            optionImg?: () => VNodeChild;
            optionFullscreen?: (
                props: VueUiOptionFullscreenSlotProps,
            ) => VNodeChild;
            caption?: () => VNodeChild;
            head?: (props: VueUiTableHeatmapHeadSlotProps) => VNodeChild;
            rowTitle?: (
                props: VueUiTableHeatmapRowTitleSlotProps,
            ) => VNodeChild;
            sum?: (props: VueUiTableHeatmapSumSlotProps) => VNodeChild;
            average?: (props: VueUiTableHeatmapAverageSlotProps) => VNodeChild;
            median?: (props: VueUiTableHeatmapMedianSlotProps) => VNodeChild;
            source?: () => VNodeChild;
            cell?: (props: VueUiTableHeatmapCellSlotProps) => VNodeChild;
        };
    };
};

export default VueUiTableHeatmap;
export { VueUiTableHeatmap };
