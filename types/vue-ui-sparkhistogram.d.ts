import type { DefineComponent, VNodeChild } from 'vue';

import type {
    VueUiSparkHistogramConfig,
    VueUiSparkHistogramDatasetItem,
    VueUiSparkHistogramEvent,
    VueUiSparkHistogramProps,
    VueUiKeyboardNavigationHintSlotProps,
} from 'vue-data-ui';

export type {
    VueUiSparkHistogramConfig,
    VueUiSparkHistogramDatasetItem,
    VueUiSparkHistogramEvent,
    VueUiSparkHistogramProps,
    VueUiKeyboardNavigationHintSlotProps,
};

declare const VueUiSparkHistogramBase: DefineComponent<VueUiSparkHistogramProps>;

export const VueUiSparkHistogram: typeof VueUiSparkHistogramBase & {
    new (): {
        $slots: {
            ['chart-background']?: () => VNodeChild;
            hint?: (props: VueUiKeyboardNavigationHintSlotProps) => VNodeChild;
            source?: () => VNodeChild;
            skeleton?: () => VNodeChild;
        };
    };
};

export default VueUiSparkHistogram;
export { VueUiSparkHistogram };
