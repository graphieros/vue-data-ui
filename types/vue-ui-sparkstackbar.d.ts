import type { DefineComponent, VNodeChild } from 'vue';

import type {
    VueUiSparkStackbarDatapoint,
    VueUiSparkStackbarConfig,
    VueUiSparkStackbarDatasetItem,
    VueUiSparkStackbarEvent,
    VueUiSparkStackbarProps,
    VueUiSparkStackbarExpose,
    VueUiKeyboardNavigationHintSlotProps,
    VueUiSparkStackbarTooltipSlotProps,
} from 'vue-data-ui';

export type {
    VueUiSparkStackbarDatapoint,
    VueUiSparkStackbarConfig,
    VueUiSparkStackbarDatasetItem,
    VueUiSparkStackbarEvent,
    VueUiSparkStackbarProps,
    VueUiSparkStackbarExpose,
    VueUiKeyboardNavigationHintSlotProps,
    VueUiSparkStackbarTooltipSlotProps,
};

declare const VueUiSparkStackbarBase: DefineComponent<VueUiSparkStackbarProps>;

export const VueUiSparkStackbar: typeof VueUiSparkStackbarBase & {
    new (): VueUiSparkStackbarExpose & {
        $slots: {
            hint?: (props: VueUiKeyboardNavigationHintSlotProps) => VNodeChild;
            ['tooltip-before']?: (
                props: VueUiSparkStackbarTooltipSlotProps,
            ) => VNodeChild;
            tooltip?: (props: VueUiSparkStackbarTooltipSlotProps) => VNodeChild;
            ['tooltip-after']?: (
                props: VueUiSparkStackbarTooltipSlotProps,
            ) => VNodeChild;
            source?: () => VNodeChild;
            skeleton?: () => VNodeChild;
        };
    };
};

export default VueUiSparkStackbar;
export { VueUiSparkStackbar };
