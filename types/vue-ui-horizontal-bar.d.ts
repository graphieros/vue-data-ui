import type { DefineComponent, VNodeChild } from 'vue';

import type {
    VueUiHorizontalBarConfig,
    VueUiHorizontalBarDatapoint,
    VueUiHorizontalBarSerie,
    VueUiHorizontalBarDatasetChild,
    VueUiHorizontalBarDatasetItem,
    VueUiHorizontalBarExpose,
    VueUiHorizontalBarEvent,
    VueUiHorizontalBarProps,
    VueUiAnnotatorActionColorSlotProps,
    VueUiAnnotatorActionDrawSlotProps,
    VueUiAnnotatorActionUndoSlotProps,
    VueUiAnnotatorActionRedoSlotProps,
    VueUiAnnotatorActionDeleteSlotProps,
    VueUiMenuIconSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUiPatternSlotProps,
    VueUiHorizontalBarSvgSlotProps,
    VueUiKeyboardNavigationHintSlotProps,
    VueUiWatermarkSlotProps,
    VueUiHorizontalBarLegendSlotProps,
    VueUiVerticalBarTooltipDatapoint,
    VueUiHorizontalBarTooltipSlotProps,
    CommonAnnotatorSlots,
    VueUiHorizontalBarEmits,
    VueUiHorizontalBarEmitSelectLegend,
    VueUiHorizontalBarEmitSelectDatapoint,
    VueUiHorizontalBarEmitCopyAlt,
} from 'vue-data-ui';

export type {
    VueUiHorizontalBarConfig,
    VueUiHorizontalBarDatapoint,
    VueUiHorizontalBarSerie,
    VueUiHorizontalBarDatasetChild,
    VueUiHorizontalBarDatasetItem,
    VueUiHorizontalBarExpose,
    VueUiHorizontalBarEvent,
    VueUiHorizontalBarProps,
    VueUiAnnotatorActionColorSlotProps,
    VueUiAnnotatorActionDrawSlotProps,
    VueUiAnnotatorActionUndoSlotProps,
    VueUiAnnotatorActionRedoSlotProps,
    VueUiAnnotatorActionDeleteSlotProps,
    VueUiMenuIconSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUiPatternSlotProps,
    VueUiHorizontalBarSvgSlotProps,
    VueUiKeyboardNavigationHintSlotProps,
    VueUiWatermarkSlotProps,
    VueUiHorizontalBarLegendSlotProps,
    VueUiVerticalBarTooltipDatapoint,
    VueUiHorizontalBarTooltipSlotProps,
    CommonAnnotatorSlots,
    VueUiHorizontalBarEmits,
    VueUiHorizontalBarEmitSelectLegend,
    VueUiHorizontalBarEmitSelectDatapoint,
    VueUiHorizontalBarEmitCopyAlt,
};

declare const VueUiHorizontalBarBase: DefineComponent<
    VueUiHorizontalBarProps,
    {},
    {},
    {},
    {},
    {},
    {},
    VueUiHorizontalBarEmits
>;

export const VueUiHorizontalBar: typeof VueUiHorizontalBarBase & {
    new (): VueUiHorizontalBarExpose & {
        $slots: CommonAnnotatorSlots & {
            ['custom-menu-before']?: () => VNodeChild;
            ['custom-menu-after']?: () => VNodeChild;
            menuIcon?: (props: VueUiMenuIconSlotProps) => VNodeChild;
            optionTooltip?: () => VNodeChild;
            optionPdf?: () => VNodeChild;
            optionCsv?: () => VNodeChild;
            optionImg?: () => VNodeChild;
            optionSvg?: () => VNodeChild;
            optionTable?: () => VNodeChild;
            optionLabels?: () => VNodeChild;
            optionSort?: () => VNodeChild;
            optionFullscreen?: (
                props: VueUiOptionFullscreenSlotProps,
            ) => VNodeChild;
            optionAnnotator?: (
                props: VueUiOptionAnnotatorSlotProps,
            ) => VNodeChild;
            optionAltCopy?: () => VNodeChild;
            ['chart-background']?: () => VNodeChild;
            pattern?: (props: VueUiPatternSlotProps) => VNodeChild;
            svg?: (props: VueUiHorizontalBarSvgSlotProps) => VNodeChild;
            hint?: (props: VueUiKeyboardNavigationHintSlotProps) => VNodeChild;
            watermark?: (props: VueUiWatermarkSlotProps) => VNodeChild;
            source?: () => VNodeChild;
            legend?: (props: VueUiHorizontalBarLegendSlotProps) => VNodeChild;
            ['tooltip-before']?: (
                props: VueUiHorizontalBarTooltipSlotProps,
            ) => VNodeChild;
            tooltip?: (props: VueUiHorizontalBarTooltipSlotProps) => VNodeChild;
            ['tooltip-after']?: (
                props: VueUiHorizontalBarTooltipSlotProps,
            ) => VNodeChild;
        };
    };
};

export default VueUiHorizontalBar;
export { VueUiHorizontalBar };
