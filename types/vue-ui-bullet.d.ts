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
};

declare const VueUiBulletBase: DefineComponent<VueUiBulletProps>;

export const VueUiBullet: typeof VueUiBulletBase & {
    new (): VueUiBulletExpose & {
        $slots: {
            ['annotator-action-close']?: () => VNodeChild;
            ['annotator-action-color']?: (
                props: VueUiAnnotatorActionColorSlotProps,
            ) => VNodeChild;
            ['annotator-action-draw']?: (
                props: VueUiAnnotatorActionDrawSlotProps,
            ) => VNodeChild;
            ['annotator-action-undo']?: (
                props: VueUiAnnotatorActionUndoSlotProps,
            ) => VNodeChild;
            ['annotator-action-redo']?: (
                props: VueUiAnnotatorActionRedoSlotProps,
            ) => VNodeChild;
            ['annotator-action-delete']?: (
                props: VueUiAnnotatorActionDeleteSlotProps,
            ) => VNodeChild;
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
