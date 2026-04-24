import type { DefineComponent, VNodeChild } from 'vue';

import type {
    VueUiRadarConfig,
    VueUiRadarDatapoint,
    VueUiRadarCategory,
    VueUiRadarDatapointItem,
    VueUiRadarSeries,
    VueUiRadarDatasetCategoryItem,
    VueUiRadarDatasetSerieItem,
    VueUiRadarDataset,
    VueUiRadarExpose,
    VueUiRadarEvent,
    VueUiRadarProps,
    VueUiAnnotatorActionColorSlotProps,
    VueUiAnnotatorActionDrawSlotProps,
    VueUiAnnotatorActionUndoSlotProps,
    VueUiAnnotatorActionRedoSlotProps,
    VueUiAnnotatorActionDeleteSlotProps,
    VueUiMenuIconSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUiRadarSvgSlotProps,
    VueUiKeyboardNavigationHintSlotProps,
    VueUiWatermarkSlotProps,
    VueUiRadarLegendItem,
    VueUiRadarLegendSlotProps,
    VueUiRadarTooltipSlotProps,
    CommonAnnotatorSlots,
} from 'vue-data-ui';

export type {
    VueUiRadarConfig,
    VueUiRadarDatapoint,
    VueUiRadarCategory,
    VueUiRadarDatapointItem,
    VueUiRadarSeries,
    VueUiRadarDatasetCategoryItem,
    VueUiRadarDatasetSerieItem,
    VueUiRadarDataset,
    VueUiRadarExpose,
    VueUiRadarEvent,
    VueUiRadarProps,
    VueUiAnnotatorActionColorSlotProps,
    VueUiAnnotatorActionDrawSlotProps,
    VueUiAnnotatorActionUndoSlotProps,
    VueUiAnnotatorActionRedoSlotProps,
    VueUiAnnotatorActionDeleteSlotProps,
    VueUiMenuIconSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUiRadarSvgSlotProps,
    VueUiKeyboardNavigationHintSlotProps,
    VueUiWatermarkSlotProps,
    VueUiRadarLegendItem,
    VueUiRadarLegendSlotProps,
    VueUiRadarTooltipSlotProps,
    CommonAnnotatorSlots,
};

declare const VueUiRadarBase: DefineComponent<VueUiRadarProps>;

export const VueUiRadar: typeof VueUiRadarBase & {
    new (): VueUiRadarExpose & {
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
            optionAltCopy?: () => VNodeChild;
            optionAnnotator?: (
                props: VueUiOptionAnnotatorSlotProps,
            ) => VNodeChild;
            ['chart-background']?: () => VNodeChild;
            svg?: (props: VueUiRadarSvgSlotProps) => VNodeChild;
            hint?: (props: VueUiKeyboardNavigationHintSlotProps) => VNodeChild;
            watermark?: (props: VueUiWatermarkSlotProps) => VNodeChild;
            source?: () => VNodeChild;
            skeleton?: () => VNodeChild;
            legend?: (props: VueUiRadarLegendSlotProps) => VNodeChild;
            ['tooltip-before']?: (
                props: VueUiRadarTooltipSlotProps,
            ) => VNodeChild;
            tooltip?: (props: VueUiRadarTooltipSlotProps) => VNodeChild;
            ['tooltip-after']?: (
                props: VueUiRadarTooltipSlotProps,
            ) => VNodeChild;
        };
    };
};

export default VueUiRadar;
export { VueUiRadar };
