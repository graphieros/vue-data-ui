import type { DefineComponent, VNodeChild } from 'vue';

import type {
    VueUiSparklineDatasetItem,
    VueUiSparklineConfig,
    VueUiSparklineEvent,
    VueUiSparklineProps,
    VueUiSparklineBeforeSlotProps,
    VueUiSparklineSvgSlotProps,
    VueUiKeyboardNavigationHintSlotProps,
    VueUiSparklineFormattedDatapoint,
    VueUiSparklineTooltipSlotProps,
} from 'vue-data-ui';

export type {
    VueUiSparklineDatasetItem,
    VueUiSparklineConfig,
    VueUiSparklineEvent,
    VueUiSparklineProps,
    VueUiSparklineBeforeSlotProps,
    VueUiSparklineSvgSlotProps,
    VueUiKeyboardNavigationHintSlotProps,
    VueUiSparklineFormattedDatapoint,
    VueUiSparklineTooltipSlotProps,
};

declare const VueUiSparklineBase: DefineComponent<VueUiSparklineProps>;

export const VueUiSparkline: typeof VueUiSparklineBase & {
    new (): {
        $slots: {
            before?: (props: VueUiSparklineBeforeSlotProps) => VNodeChild;
            ['chart-background']?: () => VNodeChild;
            svg?: (props: VueUiSparklineSvgSlotProps) => VNodeChild;
            hint?: (props: VueUiKeyboardNavigationHintSlotProps) => VNodeChild;
            tooltip?: (props: VueUiSparklineTooltipSlotProps) => VNodeChild;
            source?: () => VNodeChild;
            skeleton?: () => VNodeChild;
        };
    };
};

export default VueUiSparkline;
export { VueUiSparkline };
