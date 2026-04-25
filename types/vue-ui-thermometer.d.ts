import type { DefineComponent, VNodeChild } from 'vue';

import type {
    VueUiThermometerConfig,
    VueUiThermometerDataset,
    VueUiThermometerExpose,
    VueUiThermometerProps,
    CommonAnnotatorSlots,
    VueUiMenuIconSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUiThermometerSvgSlotProps,
    VueUiWatermarkSlotProps,
} from 'vue-data-ui';

export type {
    VueUiThermometerConfig,
    VueUiThermometerDataset,
    VueUiThermometerExpose,
    VueUiThermometerProps,
    CommonAnnotatorSlots,
    VueUiMenuIconSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUiThermometerSvgSlotProps,
    VueUiWatermarkSlotProps,
};

declare const VueUiThermometerBase: DefineComponent<VueUiThermometerProps>;

export const VueUiThermometer: typeof VueUiThermometerBase & {
    new (): VueUiThermometerExpose & {
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
            svg?: (props: VueUiThermometerSvgSlotProps) => VNodeChild;
            watermark?: (props: VueUiWatermarkSlotProps) => VNodeChild;
            source?: () => VNodeChild;
            skeleton?: () => VNodeChild;
        };
    };
};

export default VueUiThermometer;
export { VueUiThermometer };
