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
    VueUiTiremarksEmits,
    VueUiTiremarksEmitCopyAlt,
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
    VueUiTiremarksEmits,
    VueUiTiremarksEmitCopyAlt,
};

declare const VueUiTiremarksBase: DefineComponent<
    VueUiTiremarksProps,
    {},
    {},
    {},
    {},
    {},
    {},
    VueUiTiremarksEmits
>;

export const VueUiTiremarks: typeof VueUiTiremarksBase & {
    new (): VueUiTiremarksExpose & {
        $slots: CommonAnnotatorSlots & {
            ['custom-menu-before']?: () => VNodeChild;
            ['custom-menu-after']?: () => VNodeChild;
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
