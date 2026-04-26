import type { DefineComponent, VNodeChild } from 'vue';

import type { VueUiSparkTrendConfig, VueUiSparkTrendProps } from 'vue-data-ui';
export type { VueUiSparkTrendConfig, VueUiSparkTrendProps };

declare const VueUiSparkTrendBase: DefineComponent<VueUiSparkTrendProps>;

export const VueUiSparkTrend: typeof VueUiSparkTrendBase & {
    new (): {
        $slots: {
            ['chart-background']?: () => VNodeChild;
            source?: () => VNodeChild;
            skeleton?: () => VNodeChild;
        };
    };
};

export default VueUiSparkTrend;
export { VueUiSparkTrend };
