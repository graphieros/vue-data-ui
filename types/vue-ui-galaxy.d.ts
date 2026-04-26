import type { DefineComponent, VNodeChild } from 'vue';

import type {
    VueUiGalaxyDatasetItem,
    VueUiGalaxyConfig,
    VueUiGalaxyDatapoint,
    VueUiGalaxySeriesItem,
    VueUiGalaxyExpose,
    VueUiGalaxyEvent,
    VueUiGalaxyProps,
    VueUiGalaxyFormattedDatapoint,
    VueUiAnnotatorActionColorSlotProps,
    VueUiAnnotatorActionDrawSlotProps,
    VueUiAnnotatorActionUndoSlotProps,
    VueUiAnnotatorActionRedoSlotProps,
    VueUiAnnotatorActionDeleteSlotProps,
    VueUiMenuIconSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUiGalaxySvgSlotProps,
    VueUiKeyboardNavigationHintSlotProps,
    VueUiWatermarkSlotProps,
    VueUiGalaxyLegendItem,
    VueUiGalaxyLegendSlotProps,
    VueUiGalaxyDatapointTooltip,
    VueUiGalaxyTooltipSlotProps,
    CommonAnnotatorSlots,
} from 'vue-data-ui';

export type {
    VueUiGalaxyDatasetItem,
    VueUiGalaxyConfig,
    VueUiGalaxyDatapoint,
    VueUiGalaxySeriesItem,
    VueUiGalaxyExpose,
    VueUiGalaxyEvent,
    VueUiGalaxyProps,
    VueUiGalaxyFormattedDatapoint,
    VueUiAnnotatorActionColorSlotProps,
    VueUiAnnotatorActionDrawSlotProps,
    VueUiAnnotatorActionUndoSlotProps,
    VueUiAnnotatorActionRedoSlotProps,
    VueUiAnnotatorActionDeleteSlotProps,
    VueUiMenuIconSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUiGalaxySvgSlotProps,
    VueUiKeyboardNavigationHintSlotProps,
    VueUiWatermarkSlotProps,
    VueUiGalaxyLegendItem,
    VueUiGalaxyLegendSlotProps,
    VueUiGalaxyDatapointTooltip,
    VueUiGalaxyTooltipSlotProps,
    CommonAnnotatorSlots,
};

declare const VueUiGalaxyBase: DefineComponent<VueUiGalaxyProps>;

export const VueUiGalaxy: typeof VueUiGalaxyBase & {
    new (): VueUiGalaxyExpose & {
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
            svg?: (props: VueUiGalaxySvgSlotProps) => VNodeChild;
            hint?: (props: VueUiKeyboardNavigationHintSlotProps) => VNodeChild;
            watermark?: (props: VueUiWatermarkSlotProps) => VNodeChild;
            legend?: (props: VueUiGalaxyLegendSlotProps) => VNodeChild;
            source?: () => VNodeChild;
            ['tooltip-before']?: (
                props: VueUiGalaxyTooltipSlotProps,
            ) => VNodeChild;
            tooltip?: (props: VueUiGalaxyTooltipSlotProps) => VNodeChild;
            ['tooltip-after']?: (
                props: VueUiGalaxyTooltipSlotProps,
            ) => VNodeChild;
            skeleton?: () => VNodeChild;
        };
    };
};

export default VueUiGalaxy;
export { VueUiGalaxy };
