import type { DefineComponent, VNodeChild } from 'vue';

import type {
    VueUiGeoConfig,
    VueUiGeoDatasetItem,
    VueUiGeoExpose,
    VueUiGeoProps,
    VueUiGeoMapGeoJson,
    VueUiAnnotatorActionColorSlotProps,
    VueUiAnnotatorActionDrawSlotProps,
    VueUiAnnotatorActionUndoSlotProps,
    VueUiAnnotatorActionRedoSlotProps,
    VueUiAnnotatorActionDeleteSlotProps,
    VueUiMenuIconSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUiGeoOptionZoomSlotProps,
    VueUiGeoDatapointSlotProps,
    VueUiGeoSvgSlotProps,
    VueUiGeoTooltipSlotProps,
    CommonAnnotatorSlots,
} from 'vue-data-ui';

export type {
    VueUiGeoConfig,
    VueUiGeoDatasetItem,
    VueUiGeoExpose,
    VueUiGeoProps,
    VueUiGeoMapGeoJson,
    VueUiAnnotatorActionColorSlotProps,
    VueUiAnnotatorActionDrawSlotProps,
    VueUiAnnotatorActionUndoSlotProps,
    VueUiAnnotatorActionRedoSlotProps,
    VueUiAnnotatorActionDeleteSlotProps,
    VueUiMenuIconSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUiGeoOptionZoomSlotProps,
    VueUiGeoDatapointSlotProps,
    VueUiGeoSvgSlotProps,
    VueUiGeoTooltipSlotProps,
    CommonAnnotatorSlots,
};

declare const VueUiGeoBase: DefineComponent<VueUiGeoProps>;

export const VueUiGeo: typeof VueUiGeoBase & {
    new (): VueUiGeoExpose & {
        $slots: CommonAnnotatorSlots & {
            menuIcon?: (props: VueUiMenuIconSlotProps) => VNodeChild;
            optionTooltip?: () => VNodeChild;
            optionPdf?: () => VNodeChild;
            optionImg?: () => VNodeChild;
            optionSvg?: () => VNodeChild;
            optionFullscreen?: (
                props: VueUiOptionFullscreenSlotProps,
            ) => VNodeChild;
            optionAnnotator?: (
                props: VueUiOptionAnnotatorSlotProps,
            ) => VNodeChild;
            optionAltCopy?: () => VNodeChild;
            optionZoom?: (props: VueUiGeoOptionZoomSlotProps) => VNodeChild;
            datapoint?: (props: VueUiGeoDatapointSlotProps) => VNodeChild;
            svg?: (props: VueUiGeoSvgSlotProps) => VNodeChild;
            hint?: (props: VueUiKeyboardNavigationHintSlotProps) => VNodeChild;
            watermark?: (props: VueUiWatermarkSlotProps) => VNodeChild;
            ['tooltip-before']?: (
                props: VueUiGeoTooltipSlotProps,
            ) => VNodeChild;
            tooltip?: (props: VueUiGeoTooltipSlotProps) => VNodeChild;
            ['tooltip-after']?: (props: VueUiGeoTooltipSlotProps) => VNodeChild;
            source?: () => VNodeChild;
            skeleton?: () => VNodeChild;
        };
    };
};

export default VueUiGeo;
export { VueUiGeo };
