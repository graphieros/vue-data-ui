import type { DefineComponent, VNodeChild } from 'vue';

import type {
    VueUiGaugeDatasetSerieItem,
    VueUiGaugeDataset,
    VueUiGaugeConfig,
    VueUiGaugeExpose,
    VueUiGaugeProps,
    VueUiAnnotatorActionColorSlotProps,
    VueUiAnnotatorActionDrawSlotProps,
    VueUiAnnotatorActionUndoSlotProps,
    VueUiAnnotatorActionRedoSlotProps,
    VueUiAnnotatorActionDeleteSlotProps,
    VueUiMenuIconSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUiPatternSlotProps,
    VueUiGaugeSvgSlotProps,
    VueUiWatermarkSlotProps,
    VueUiGaugeLegendSlotProps,
    CommonAnnotatorSlots,
} from 'vue-data-ui';

export type {
    VueUiGaugeDatasetSerieItem,
    VueUiGaugeDataset,
    VueUiGaugeConfig,
    VueUiGaugeExpose,
    VueUiGaugeProps,
    VueUiAnnotatorActionColorSlotProps,
    VueUiAnnotatorActionDrawSlotProps,
    VueUiAnnotatorActionUndoSlotProps,
    VueUiAnnotatorActionRedoSlotProps,
    VueUiAnnotatorActionDeleteSlotProps,
    VueUiMenuIconSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUiPatternSlotProps,
    VueUiGaugeSvgSlotProps,
    VueUiWatermarkSlotProps,
    VueUiGaugeLegendSlotProps,
    CommonAnnotatorSlots,
};

declare const VueUiGaugeBase: DefineComponent<VueUiGaugeProps>;

export const VueUiGauge: typeof VueUiGaugeBase & {
    new (): VueUiGaugeExpose & {
        $slots: CommonAnnotatorSlots & {
            menuIcon?: (props: VueUiMenuIconSlotProps) => VNodeChild;
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
            ['chart-background']?: () => VNodeChild;
            pattern?: (props: VueUiPatternSlotProps) => VNodeChild;
            svg?: (props: VueUiGaugeSvgSlotProps) => VNodeChild;
            watermark?: (props: VueUiWatermarkSlotProps) => VNodeChild;
            source?: () => VNodeChild;
            legend?: (props: VueUiGaugeLegendSlotProps) => VNodeChild;
            source?: () => VNodeChild;
            skeleton?: () => VNodeChild;
        };
    };
};

export default VueUiGauge;
export { VueUiGauge };
