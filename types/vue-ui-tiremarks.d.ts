import type { DefineComponent, VNodeChild } from 'vue';

import type {
    VueUiTiremarksConfig,
    VueUiTiremarksDataset,
    VueUiTiremarksExpose,
    VueUiTiremarksProps,
    CommonAnnotatorSlots,
    VueUiMenuIconSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUiTiremarksSvgSlotProps,
    VueUiWatermarkSlotProps,
} from 'vue-data-ui';

export type {
    VueUiTiremarksConfig,
    VueUiTiremarksDataset,
    VueUiTiremarksExpose,
    VueUiTiremarksProps,
    CommonAnnotatorSlots,
    VueUiMenuIconSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUiTiremarksSvgSlotProps,
    VueUiWatermarkSlotProps,
};

declare const VueUiTiremarksBase: DefineComponent<VueUiTiremarksProps>;

export const VueUiTiremarks: typeof VueUiTiremarksBase & {
    new (): VueUiTiremarksExpose & {
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
            svg?: (props: VueUiTiremarksSvgSlotProps) => VNodeChild;
            watermark?: (props: VueUiWatermarkSlotProps) => VNodeChild;
            source?: () => VNodeChild;
            skeleton?: () => VNodeChild;
        };
    };
};

export default VueUiTiremarks;
export { VueUiTiremarks };
