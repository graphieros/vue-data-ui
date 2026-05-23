import type { DefineComponent, VNodeChild } from 'vue';

import type {
    VueUiMoodRadarDataset,
    VueUiMoodRadarDatapoint,
    VueUiMoodRadarConfig,
    VueUiMoodRadarExpose,
    VueUiMoodRadarEvent,
    VueUiMoodRadarProps,
    VueUiAnnotatorActionColorSlotProps,
    VueUiAnnotatorActionDrawSlotProps,
    VueUiAnnotatorActionUndoSlotProps,
    VueUiAnnotatorActionRedoSlotProps,
    VueUiAnnotatorActionDeleteSlotProps,
    VueUiMenuIconSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUiMoodRadarSvgSlotProps,
    VueUiKeyboardNavigationHintSlotProps,
    VueUiWatermarkSlotProps,
    VueUiMoodRadarLegendSlotProps,
    CommonAnnotatorSlots,
    VueUiMoodRadarEmits,
    VueUiMoodRadarEmitCopyAlt,
} from 'vue-data-ui';

export type {
    VueUiMoodRadarDataset,
    VueUiMoodRadarDatapoint,
    VueUiMoodRadarConfig,
    VueUiMoodRadarExpose,
    VueUiMoodRadarEvent,
    VueUiMoodRadarProps,
    VueUiAnnotatorActionColorSlotProps,
    VueUiAnnotatorActionDrawSlotProps,
    VueUiAnnotatorActionUndoSlotProps,
    VueUiAnnotatorActionRedoSlotProps,
    VueUiAnnotatorActionDeleteSlotProps,
    VueUiMenuIconSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiOptionAnnotatorSlotProps,
    VueUiMoodRadarSvgSlotProps,
    VueUiKeyboardNavigationHintSlotProps,
    VueUiWatermarkSlotProps,
    VueUiMoodRadarLegendSlotProps,
    CommonAnnotatorSlots,
    VueUiMoodRadarEmits,
    VueUiMoodRadarEmitCopyAlt,
};

declare const VueUiMoodRadarBase: DefineComponent<
    VueUiMoodRadarProps,
    {},
    {},
    {},
    {},
    {},
    {},
    VueUiMoodRadarEmits
>;

export const VueUiMoodRadar: typeof VueUiMoodRadarBase & {
    new (): VueUiMoodRadarExpose & {
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
            optionAltCopy?: () => VNodeChild;
            optionAnnotator?: (
                props: VueUiOptionAnnotatorSlotProps,
            ) => VNodeChild;
            ['chart-background']?: () => VNodeChild;
            svg?: (props: VueUiMoodRadarSvgSlotProps) => VNodeChild;
            hint?: (props: VueUiKeyboardNavigationHintSlotProps) => VNodeChild;
            watermark?: (props: VueUiWatermarkSlotProps) => VNodeChild;
            legend?: (props: VueUiMoodRadarLegendSlotProps) => VNodeChild;
            source?: () => VNodeChild;
            skeleton?: () => VNodeChild;
        };
    };
};

export default VueUiMoodRadar;
export { VueUiMoodRadar };
