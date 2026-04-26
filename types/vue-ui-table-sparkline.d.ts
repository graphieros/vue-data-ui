import type { DefineComponent, VNodeChild } from 'vue';

import type {
    VueUiTableSparklineDatasetItem,
    VueUiTableSparklineConfig,
    VueUiTableSparklineProps,
    VueUiMenuIconSlotProps,
    VueUiOptionFullscreenSlotProps,
} from 'vue-data-ui';

export type {
    VueUiTableSparklineDatasetItem,
    VueUiTableSparklineConfig,
    VueUiTableSparklineProps,
    VueUiMenuIconSlotProps,
    VueUiOptionFullscreenSlotProps,
};

declare const VueUiTableSparklineBase: DefineComponent<VueUiTableSparklineProps>;

export const VueUiTableSparkline: typeof VueUiTableSparklineBase & {
    new (): {
        $slots: {
            menuIcon?: (props: VueUiMenuIconSlotProps) => VNodeChild;
            optionPdf?: () => VNodeChild;
            optionCsv?: () => VNodeChild;
            optionImg?: () => VNodeChild;
            optionFullscreen?: (
                props: VueUiOptionFullscreenSlotProps,
            ) => VNodeChild;
            optionAltCopy?: () => VNodeChild;
            source?: () => VNodeChild;
        };
    };
};

export default VueUiTableSparkline;
export { VueUiTableSparkline };
