import type { DefineComponent, VNodeChild } from 'vue';

import type {
    VueUiTreemapDatasetItem,
    VueUiTreemapConfig,
    VueUiTreemapDatapoint,
    VueUiTreemapSeriesItem,
    VueUiTreemapExpose,
    VueUiTreemapEvent,
    VueUiTreemapProps,
    CommonAnnotatorSlots,
    VueUiMenuIconSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUiTreemapBreadcrumbLabelSlotProps,
    VueUiTreemapRectSlotProps,
    VueUiTreemapSvgSlotProps,
    VueUiKeyboardNavigationHintSlotProps,
    VueUiWatermarkSlotProps,
    VueUiTreemapLegendItem,
    VueUiTreemapLegendSlotProps,
    VueUiTooltipSlotProps,
} from 'vue-data-ui';

export type {
    VueUiTreemapDatasetItem,
    VueUiTreemapConfig,
    VueUiTreemapDatapoint,
    VueUiTreemapSeriesItem,
    VueUiTreemapExpose,
    VueUiTreemapEvent,
    VueUiTreemapProps,
    CommonAnnotatorSlots,
    VueUiMenuIconSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUiTreemapBreadcrumbLabelSlotProps,
    VueUiTreemapRectSlotProps,
    VueUiTreemapSvgSlotProps,
    VueUiKeyboardNavigationHintSlotProps,
    VueUiWatermarkSlotProps,
    VueUiTreemapLegendItem,
    VueUiTreemapLegendSlotProps,
    VueUiTooltipSlotProps,
};

declare const VueUiTreemapBase: DefineComponent<VueUiTreemapProps>;

export const VueUiTreemap: typeof VueUiTreemapBase & {
    new (): VueUiTreemapExpose & {
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
            ['breadcrumb-label']?: (
                props: VueUiTreemapBreadcrumbLabelSlotProps,
            ) => VNodeChild;
            ['breadcrumb-arrow']?: () => VNodeChild;
            rect?: (props: VueUiTreemapRectSlotProps) => VNodeChild;
            svg?: (props: VueUiTreemapSvgSlotProps) => VNodeChild;
            hint?: (props: VueUiKeyboardNavigationHintSlotProps) => VNodeChild;
            watermark?: (props: VueUiWatermarkSlotProps) => VNodeChild;
            source?: () => VNodeChild;
            skeleton?: () => VNodeChild;
            legend?: (props: VueUiTreemapLegendSlotProps) => VNodeChild;
            ['tooltip-before']?: (props: VueUiTooltipSlotProps) => VNodeChild;
            tooltip?: (props: VueUiTooltipSlotProps) => VNodeChild;
            ['tooltip-after']?: (props: VueUiTooltipSlotProps) => VNodeChild;
        };
    };
};

export default VueUiTreemap;
export { VueUiTreemap };
