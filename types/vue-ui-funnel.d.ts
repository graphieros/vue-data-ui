import type { DefineComponent, VNodeChild } from 'vue';

import type {
    VueUiFunnelDatasetItem,
    VueUiFunnelConfig,
    VueUiFunnelExpose,
    VueUiFunnelProps,
    VueUiAnnotatorActionColorSlotProps,
    VueUiAnnotatorActionDrawSlotProps,
    VueUiAnnotatorActionUndoSlotProps,
    VueUiAnnotatorActionRedoSlotProps,
    VueUiAnnotatorActionDeleteSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUiFunnelSvgSlotProps,
    VueUiWatermarkSlotProps,
    CommonAnnotatorSlots,
    VueUiFunnelEmits,
    VueUiFunnelEmitCopyAlt,
} from 'vue-data-ui';

export type {
    VueUiFunnelDatasetItem,
    VueUiFunnelConfig,
    VueUiFunnelExpose,
    VueUiFunnelProps,
    VueUiAnnotatorActionColorSlotProps,
    VueUiAnnotatorActionDrawSlotProps,
    VueUiAnnotatorActionUndoSlotProps,
    VueUiAnnotatorActionRedoSlotProps,
    VueUiAnnotatorActionDeleteSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUiFunnelSvgSlotProps,
    VueUiWatermarkSlotProps,
    CommonAnnotatorSlots,
    VueUiFunnelEmits,
    VueUiFunnelEmitCopyAlt,
};

declare const VueUiFunnelBase: DefineComponent<
    VueUiFunnelProps,
    {},
    {},
    {},
    {},
    {},
    {},
    VueUiFunnelEmits
>;

export const VueUiFunnel: typeof VueUiFunnelBase & {
    new (): VueUiFunnelExpose & {
        $slots: CommonAnnotatorSlots & {
            ['custom-menu-before']?: () => VNodeChild;
            ['custom-menu-after']?: () => VNodeChild;
            menuIcon?: (props: VueUiMenuIconSlotProps) => VNodeChild;
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
            optionAltCopy?: () => VNodeChild;
            ['chart-background']?: () => VNodeChild;
            svg?: (props: VueUiFunnelSvgSlotProps) => VNodeChild;
            watermark?: (props: VueUiWatermarkSlotProps) => VNodeChild;
            source?: () => VNodeChild;
        };
    };
};

export default VueUiFunnel;
export { VueUiFunnel };
