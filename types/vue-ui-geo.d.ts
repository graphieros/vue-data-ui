import type { DefineComponent, VNodeChild } from 'vue';

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
    VueUiGeoOptionCopyAltSlotProps,
    VueUiGeoOptionZoomSlotProps,
    VueUiGeoDatapointSlotProps,
    VueUiGeoSvgSlotProps,
    VueUiGeoTooltipSlotProps,
} from 'vue-data-ui';

declare const VueUiGeoBase: DefineComponent<VueUiGeoProps>;

export const VueUiGeo: typeof VueUiGeoBase & {
    new (): VueUiGeoBase & {
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
            optionAnnotator?: (
                props: VueUiOptionAnnotatorSlotProps,
            ) => VNodeChild;
            optionAltCopy?: (
                props: VueUiGeoOptionCopyAltSlotProps,
            ) => VNodeChild;
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
