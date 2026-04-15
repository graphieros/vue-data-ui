import { DefineComponent, VNodeChild } from 'vue';

export type {
    VueUiAgePyramidDatasetRow,
    VueUiAgePyramidDataset,
    VueUiAgePyramidConfig,
    VueUiAgePyramidDatapoint,
    VueUiAgePyramidSideData,
    VueUiAgePyramidSeries,
    VueUiAgePyramidExpose,
    VueUiAgePyramidEvent,
    VueUiAgePyramidProps,
    VueUiAnnotatorActionColorSlotProps,
    VueUiAnnotatorActionDrawSlotProps,
    VueUiAnnotatorActionUndoSlotProps,
    VueUiAnnotatorActionRedoSlotProps,
    VueUiAnnotatorActionDeleteSlotProps,
    VueUiMenuIconSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUiAgePyramidOptionCopyAltSlotProps,
    VueUiAgePyramidSvgSlotProps,
    VueUiKeyboardNavigationHintSlotProps,
    VueUiWatermarkSlotProps,
    VueUiAgePyramidLegendSlotProps,
    VueUiAgePyramidTooltipSlotProps,
} from './vue-data-ui';

const VueUiAgePyramidBase: DefineComponent<VueUiAgePyramidProps>;

export const VueUiAgePyramid: typeof VueUiAgePyramidBase & {
    new (): VueUiAgePyramidExpose & {
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
                props: VueUiAgePyramidOptionCopyAltSlotProps,
            ) => VNodeChild;
            ['chart-background']?: () => VNodeChild;
            svg?: (props: VueUiAgePyramidSvgSlotProps) => VNodeChild;
            hint?: (props: VueUiKeyboardNavigationHintSlotProps) => VNodeChild;
            watermark?: (props: VueUiWatermarkSlotProps) => VNodeChild;
            legend?: (props: VueUiAgePyramidLegendSlotProps) => VNodeChild;
            source?: () => VNodeChild;
            ['tooltip-before']?: (
                props: VueUiAgePyramidTooltipSlotProps,
            ) => VNodeChild;
            tooltip?: (props: VueUiAgePyramidTooltipSlotProps) => VNodeChild;
            ['tooltip-after']?: (
                props: VueUiAgePyramidTooltipSlotProps,
            ) => VNodeChild;
            skeleton?: () => VNodeChild;
        };
    };
};

export default VueUiAgePyramid;
export { VueUiAgePyramid };
