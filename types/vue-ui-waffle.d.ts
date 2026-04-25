import type { DefineComponent, VNodeChild } from 'vue';

import type {
    VueUiWaffleConfig,
    VueUiWaffleDatapoint,
    VueUiWaffleSerieItem,
    VueUiWaffleDatasetItem,
    VueUiWaffleExpose,
    VueUiWaffleEvent,
    VueUiWaffleProps,
    CommonAnnotatorSlots,
    VueUiMenuIconSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUiWaffleCellSlotProps,
    VueUiWaffleSvgSlotProps,
    VueUiKeyboardNavigationHintSlotProps,
    VueUiWatermarkSlotProps,
    VueUiWaffleLegendItem,
    VueUiWaffleLegendSlotProps,
    VueUiWaffleTooltipSlotProps,
} from 'vue-data-ui';

export type {
    VueUiWaffleConfig,
    VueUiWaffleDatapoint,
    VueUiWaffleSerieItem,
    VueUiWaffleDatasetItem,
    VueUiWaffleExpose,
    VueUiWaffleEvent,
    VueUiWaffleProps,
    CommonAnnotatorSlots,
    VueUiMenuIconSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUiWaffleCellSlotProps,
    VueUiWaffleSvgSlotProps,
    VueUiKeyboardNavigationHintSlotProps,
    VueUiWatermarkSlotProps,
    VueUiWaffleLegendItem,
    VueUiWaffleLegendSlotProps,
    VueUiWaffleTooltipSlotProps,
};

declare const VueUiWaffleBase: DefineComponent<VueUiWaffleProps>;

export const VueUiWaffle: typeof VueUiWaffleBase & {
    new (): VueUiWaffleExpose & {
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
            cell?: (props: VueUiWaffleCellSlotProps) => VNodeChild;
            cellSvg?: (props: VueUiWaffleCellSlotProps) => VNodeChild;
            svg?: (props: VueUiWaffleSvgSlotProps) => VNodeChild;
            hint?: (props: VueUiKeyboardNavigationHintSlotProps) => VNodeChild;
            watermark?: (props: VueUiWatermarkSlotProps) => VNodeChild;
            source?: () => VNodeChild;
            skeleton?: () => VNodeChild;
            legend?: (props: VueUiWaffleLegendSlotProps) => VNodeChild;
            ['tooltip-before']?: (
                props: VueUiWaffleTooltipSlotProps,
            ) => VNodeChild;
            tooltip?: (props: VueUiWaffleTooltipSlotProps) => VNodeChild;
            ['tooltip-after']?: (
                props: VueUiWaffleTooltipSlotProps,
            ) => VNodeChild;
        };
    };
};

export default VueUiWaffle;
export { VueUiWaffle };
