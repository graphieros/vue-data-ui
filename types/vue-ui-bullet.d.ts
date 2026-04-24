import type { DefineComponent, VNodeChild } from 'vue';

import type {
    VueUiBulletSegment,
    VueUiBulletDataset,
    VueUiBulletConfig,
    VueUiBulletExpose,
    VueUiBulletProps,
    VueUiAnnotatorActionColorSlotProps,
    VueUiAnnotatorActionDrawSlotProps,
    VueUiAnnotatorActionUndoSlotProps,
    VueUiAnnotatorActionRedoSlotProps,
    VueUiAnnotatorActionDeleteSlotProps,
    VueUiMenuIconSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUiBulletSvgSlotProps,
    VueUiWatermarkSlotProps,
    VueUiBulletLegendSlotProps,
    CommonAnnotatorSlots,
} from 'vue-data-ui';

export type {
    VueUiBulletSegment,
    VueUiBulletDataset,
    VueUiBulletConfig,
    VueUiBulletExpose,
    VueUiBulletProps,
    VueUiAnnotatorActionColorSlotProps,
    VueUiAnnotatorActionDrawSlotProps,
    VueUiAnnotatorActionUndoSlotProps,
    VueUiAnnotatorActionRedoSlotProps,
    VueUiAnnotatorActionDeleteSlotProps,
    VueUiMenuIconSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUiBulletSvgSlotProps,
    VueUiWatermarkSlotProps,
    VueUiBulletLegendSlotProps,
    CommonAnnotatorSlots,
};

declare const VueUiBulletBase: DefineComponent<VueUiBulletProps>;

export const VueUiBullet: typeof VueUiBulletBase & {
    new (): VueUiBulletExpose & {
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
            svg?: (props: VueUiBulletSvgSlotProps) => VNodeChild;
            watermark?: (props: VueUiWatermarkSlotProps) => VNodeChild;
            legend?: (props: VueUiBulletLegendSlotProps) => VNodeChild;
            source?: () => VNodeChild;
            skeleton?: () => VNodeChild;
        };
    };
};

export default VueUiBullet;
export { VueUiBullet };
