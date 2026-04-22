import type { DefineComponent, VNodeChild } from 'vue';
import type {
    VueUiKpiConfig,
    VueUiKpiProps,
    VueUiKpiTitleSlotProps,
} from 'vue-data-ui';

export type { VueUiKpiConfig, VueUiKpiProps, VueUiKpiTitleSlotProps };

declare const VueUiKpiBase: DefineComponent<VueUiKpiProps>;

export const VueUiKpi: typeof VueUiKpiBase & {
    new (): {
        $slots: {
            title?: (props: VueUiKpiTitleSlotProps) => VNodeChild;
        };
    };
};

export default VueUiKpi;
