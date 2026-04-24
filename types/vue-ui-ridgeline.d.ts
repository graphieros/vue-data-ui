import type { DefineComponent } from 'vue';

import type {
    VueUiRidgelineDatapoint,
    VueUiRidgelineDatasetItem,
    VueUiRidgelineDatapointEventUnit,
    VueUiRidgelineDatapointEventEntry,
    VueUiRidgelineDatapointEvent,
    VueUiRidgelineConfig,
    VueUiRidgelineExpose,
    VueUiRidgelineEvent,
    VueUiRidgelineProps,
    CommonAnnotatorSlots,
    VueUiMenuIconSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUiPatternSlotProps,
    VueUiRidgelineTimeLabelSlotProps,
    VueUiRidgelineSvgSlotProps,
    VueUiKeyboardNavigationHintSlotProps,
    VueUiWatermarkSlotProps,
    VueUiRidgelineLegendSlotProps,
} from 'vue-data-ui';

export type {
    VueUiRidgelineDatapoint,
    VueUiRidgelineDatasetItem,
    VueUiRidgelineDatapointEventUnit,
    VueUiRidgelineDatapointEventEntry,
    VueUiRidgelineDatapointEvent,
    VueUiRidgelineConfig,
    VueUiRidgelineExpose,
    VueUiRidgelineEvent,
    VueUiRidgelineProps,
    CommonAnnotatorSlots,
    VueUiMenuIconSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUiPatternSlotProps,
    VueUiRidgelineTimeLabelSlotProps,
    VueUiRidgelineSvgSlotProps,
    VueUiKeyboardNavigationHintSlotProps,
    VueUiWatermarkSlotProps,
    VueUiRidgelineLegendSlotProps,
};

declare const VueUiRidgelineBase: DefineComponent<VueUiRidgelineProps>;

export const VueUiRidgeline: typeof VueUiRidgelineBase & {
    new (): VueUiRidgelineExpose & {
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
            pattern?: (
                props: VueUiPatternSlotProps & { datapointIndex: number },
            ) => VNodeChild;
            ['time-label']?: (
                props: VueUiRidgelineTimeLabelSlotProps,
            ) => VNodeChild;
            svg?: (props: VueUiRidgelineSvgSlotProps) => VNodeChild;
            hint?: (props: VueUiKeyboardNavigationHintSlotProps) => VNodeChild;
            watermark?: (props: VueUiWatermarkSlotProps) => VNodeChild;
            source?: () => VNodeChild;
            skeleton?: () => VNodeChild;
            legend?: (props: VueUiRidgelineLegendSlotProps) => VNodeChild;
        };
    };
};

export default VueUiRidgeline;
export { VueUiRidgeline };
