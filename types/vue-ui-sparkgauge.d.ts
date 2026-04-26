import type { DefineComponent, VNodeChild } from 'vue';

import type {
    VueUiSparkgaugeDataset,
    VueUiSparkgaugeConfig,
    VueUiSparkgaugeProps,
} from 'vue-data-ui';

export type {
    VueUiSparkgaugeDataset,
    VueUiSparkgaugeConfig,
    VueUiSparkgaugeProps,
};

declare const VueUiSparkgaugeBase: DefineComponent<VueUiSparkgaugeProps>;

export const VueUiSparkgauge: typeof VueUiSparkgaugeBase & {
    new (): {
        $slots: {
            ['chart-background']?: () => VNodeChild;
            source?: () => VNodeChild;
            skeleton?: () => VNodeChild;
        };
    };
};

export default VueUiSparkgauge;
export { VueUiSparkgauge };
