import type { DefineComponent, VNodeChild } from 'vue';

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
    VueUiGalaxyOptionCopyAltSlotProps,
    VueUiGalaxySvgSlotProps,
    VueUiKeyboardNavigationHintSlotProps,
    VueUiWatermarkSlotProps,
    VueUiGalaxyLegendItem,
    VueUiGalaxyLegendSlotProps,
    VueUiGalaxyDatapointTooltip,
    VueUiGalaxyTooltipSlotProps,
} from 'vue-data-ui';

declare const VueUiGalaxyBase: DefineComponent<VueUiGalaxyProps>;

export const VueUiGalaxy: typeof VueUiGalaxyBase & {
    new (): VueUiGalaxyExpose & {
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
            optionAltCopy?: (
                props: VueUiGalaxyOptionCopyAltSlotProps,
            ) => VNodeChild;
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
