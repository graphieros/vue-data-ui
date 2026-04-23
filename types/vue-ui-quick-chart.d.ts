import type { DefineComponent, VNodeChild } from 'vue';

import type {
    VueUiQuickChartConfig,
    VueUiQuickChartDatasetObjectItem,
    VueUiQuickChartDataset,
    VueUiQuickChartExpose,
    VueUiQuickChartProps,
    VueUiQuickChartFormattedDataset,
    VueUiAnnotatorActionColorSlotProps,
    VueUiAnnotatorActionDrawSlotProps,
    VueUiAnnotatorActionUndoSlotProps,
    VueUiAnnotatorActionRedoSlotProps,
    VueUiAnnotatorActionDeleteSlotProps,
    VueUiMenuIconSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUiKeyboardNavigationHintSlotProps,
    VueUiWatermarkSlotProps,
    VueUiResetActionSlotProps,
    VueUiQuickChartLegend,
    VueUiQuickChartLegendSlotProps,
    VueUiQuickChartTooltipSlotProps,
} from 'vue-data-ui';

export type {
    VueUiQuickChartConfig,
    VueUiQuickChartDatasetObjectItem,
    VueUiQuickChartDataset,
    VueUiQuickChartExpose,
    VueUiQuickChartProps,
    VueUiQuickChartFormattedDataset,
    VueUiAnnotatorActionColorSlotProps,
    VueUiAnnotatorActionDrawSlotProps,
    VueUiAnnotatorActionUndoSlotProps,
    VueUiAnnotatorActionRedoSlotProps,
    VueUiAnnotatorActionDeleteSlotProps,
    VueUiMenuIconSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUiKeyboardNavigationHintSlotProps,
    VueUiWatermarkSlotProps,
    VueUiResetActionSlotProps,
    VueUiQuickChartLegend,
    VueUiQuickChartLegendSlotProps,
    VueUiQuickChartTooltipSlotProps,
};

declare const VueUiQuickChartBase: DefineComponent<VueUiQuickChartProps>;

export const VueUiQuickChart: typeof VueUiQuickChartBase & {
    new (): VueUiQuickChartExpose & {
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
            hint?: (props: VueUiKeyboardNavigationHintSlotProps) => VNodeChild;
            watermark?: (props: VueUiWatermarkSlotProps) => VNodeChild;
            ['resest-action']?: (
                props: VueUiResetActionSlotProps,
            ) => VNodeChild;
            source?: () => VNodeChild;
            legend?: (props: VueUiQuickChartLegendSlotProps) => VNodeChild;
            ['tooltip-before']?: (
                props: VueUiQuickChartTooltipSlotProps,
            ) => VNodeChild;
            tooltip?: (props: VueUiQuickChartTooltipSlotProps) => VNodeChild;
            ['tooltip-after']?: (
                props: VueUiQuickChartTooltipSlotProps,
            ) => VNodeChild;
            skeleton?: () => VNodeChild;
        };
    };
};

export default VueUiQuickChart;
export { VueUiQuickChart };
