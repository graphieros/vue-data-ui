import type { DefineComponent, VNodeChild } from 'vue';

import type {
    VueUiTableSparklineDatasetItem,
    VueUiTableSparklineConfig,
    VueUiTableSparklineProps,
    VueUiMenuIconSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiTableSparklineEmits,
    VueUiTableSparklineEmitCopyAlt,
} from 'vue-data-ui';

export type {
    VueUiTableSparklineDatasetItem,
    VueUiTableSparklineConfig,
    VueUiTableSparklineProps,
    VueUiMenuIconSlotProps,
    VueUiOptionFullscreenSlotProps,
    VueUiTableSparklineEmits,
    VueUiTableSparklineEmitCopyAlt,
};

declare const VueUiTableSparklineBase: DefineComponent<
    VueUiTableSparklineProps,
    {},
    {},
    {},
    {},
    {},
    {},
    VueUiTableSparklineEmits
>;

export const VueUiTableSparkline: typeof VueUiTableSparklineBase & {
    new (): {
        $slots: {
            ['custom-menu-before']?: () => VNodeChild;
            ['custom-menu-after']?: () => VNodeChild;
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
