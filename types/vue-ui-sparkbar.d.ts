import type { DefineComponent, VNodeChild } from 'vue';

import type {
    VueUiSparkbarDatasetItem,
    VueUiSparkbarConfig,
    VueUiSparkbarEvent,
    VueUiSparkbarProps,
    VueUiSparkbarTitleSlotProps,
    VueUiSparkbarDataLabelSlotProps,
} from 'vue-data-ui';

export type {
    VueUiSparkbarDatasetItem,
    VueUiSparkbarConfig,
    VueUiSparkbarEvent,
    VueUiSparkbarProps,
    VueUiSparkbarTitleSlotProps,
    VueUiSparkbarDataLabelSlotProps,
};

declare const VueUiSparkbarBase: DefineComponent<VueUiSparkbarProps>;

export const VueUiSparkbar: typeof VueUiSparkbarBase & {
    new (): {
        $slots: {
            title?: (props: VueUiSparkbarTitleSlotProps) => VNodeChild;
            ['data-label']?: (
                props: VueUiSparkbarDataLabelSlotProps,
            ) => VNodeChild;
            source?: () => VNodeChild;
        };
    };
};

export default VueUiSparkbar;
export { VueUiSparkbar };
