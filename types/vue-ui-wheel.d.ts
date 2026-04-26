import type { DefineComponent, VNodeChild } from 'vue';

import type {
    VueUiWheelConfig,
    VueUiWheelDataset,
    VueUiWheelExpose,
    VueUiWheelProps,
    CommonAnnotatorSlots,
    VueUiMenuIconSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUiWheelSvgSlotProps,
    VueUiWatermarkSlotProps,
} from 'vue-data-ui';

export type {
    VueUiWheelConfig,
    VueUiWheelDataset,
    VueUiWheelExpose,
    VueUiWheelProps,
    CommonAnnotatorSlots,
    VueUiMenuIconSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUiWheelSvgSlotProps,
    VueUiWatermarkSlotProps,
};

declare const VueUiWheelBase: DefineComponent<VueUiWheelProps>;

export const VueUiWheel: typeof VueUiWheelBase & {
    new (): VueUiWheelExpose & {
        $slots: CommonAnnotatorSlots & {
            menuIcon?: (props: VueUiMenuIconSlotProps) => VNodeChild;
            optionPdf?: () => VNodeChild;
            optionImg?: () => VNodeChild;
            optionSvg?: () => VNodeChild;
            optionFullscreen?: (
                props: VueUiOptionFullscreenSlotProps,
            ) => VNodeChild;
            optionAltCopy?: () => VNodeChild;
            optionAnnotator?: (
                props: VueUiOptionAnnotatorSlotProps,
            ) => VNodeChild;
            ['chart-background']?: () => VNodeChild;
            svg?: (props: VueUiWheelSvgSlotProps) => VNodeChild;
            watermark?: (props: VueUiWatermarkSlotProps) => VNodeChild;
            source?: () => VNodeChild;
            skeleton?: () => VNodeChild;
        };
    };
};

export default VueUiWheel;
export { VueUiWheel };
