import type { DefineComponent, VNodeChild } from 'vue';

import type {
    VueUiHillConfig,
    VueUiHillProps,
    VueUiHillDatasetItem,
    VueUiHillFormattedDatasetItem,
    VueUiHillExtendedDatasetItem,
    VueUiHillEvents,
    VueUiHillEmits,
    VueUiHillExpose,
    VueUiHillEmitCopyAlt,
    VueUiWatermarkSlotProps,
    CommonAnnotatorSlots,
    VueUiMenuIconSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUiHillSvgSlotProps,
    VueUiHillEmitChange,
    VueUiHillEmitDatapointEnter,
    VueUiHillEmitDatapointLeave,
    VueUiHillEmitSelectDatapoint,
    VueUiHillAnalysisSlotProps,
} from 'vue-data-ui';

export type {
    VueUiHillConfig,
    VueUiHillProps,
    VueUiHillDatasetItem,
    VueUiHillFormattedDatasetItem,
    VueUiHillExtendedDatasetItem,
    VueUiHillEvents,
    VueUiHillEmits,
    VueUiHillExpose,
    VueUiHillEmitCopyAlt,
    VueUiWatermarkSlotProps,
    CommonAnnotatorSlots,
    VueUiMenuIconSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUiHillSvgSlotProps,
    VueUiHillEmitChange,
    VueUiHillEmitDatapointEnter,
    VueUiHillEmitDatapointLeave,
    VueUiHillEmitSelectDatapoint,
    VueUiHillAnalysisSlotProps,
};

declare const VueUiHillBase: DefineComponent<
    VueUiHillProps,
    {},
    {},
    {},
    {},
    {},
    {},
    VueUiHillEmits
>;

export const VueUiHill: typeof VueUiHillBase & {
    new (): VueUiHillExpose & {
        $slots: CommonAnnotatorSlots & {
            ['hill-edit']?: () => VNodeChild;
            ['hill-save']?: () => VNodeChild;
            ['hill-cancel']?: () => VNodeChild;
            ['custom-menu-before']?: () => VNodeChild;
            ['custom-menu-after']?: () => VNodeChild;
            ['chart-background']?: () => VNodeChild;
            svg?: (props: VueUiHillSvgSlotProps) => VNodeChild;
            analysis?: (props: VueUiHillAnalysisSlotProps) => VNodeChild;
            menuIcon?: (props: VueUiMenuIconSlotProps) => VNodeChild;
            optionPdf?: () => VNodeChild;
            optionCsv?: () => VNodeChild;
            optionImg?: () => VNodeChild;
            optionSvg?: () => VNodeChild;
            optionFullscreen?: (
                props: VueUiOptionFullscreenSlotProps,
            ) => VNodeChild;
            optionAltCopy?: () => VNodeChild;
            optionAnnotator?: (
                props: VueUiOptionAnnotatorSlotProps,
            ) => VNodeChild;
            loading?: () => VNodeChild;
            watermark?: (props: VueUiWatermarkSlotProps) => VNodeChild;
        };
    };
};

export default VueUiHill;
export { VueUiHill };
