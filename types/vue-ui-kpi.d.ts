import type { DefineComponent, VNodeChild } from 'vue';
import type {
    VueUiKpiConfig,
    VueUiKpiProps,
    VueUiKpiCommentSlotProps,
} from 'vue-data-ui';

export type { VueUiKpiConfig, VueUiKpiProps, VueUiKpiCommentSlotProps };

declare const VueUiKpiBase: DefineComponent<VueUiKpiProps>;

export const VueUiKpi: typeof VueUiKpiBase & {
    new (): {
        $slots: {
            title?: (props: VueUiKpiCommentSlotProps) => VNodeChild;
            ['comment-before']?: (props: VueUiKpiCommentSlotProps) => VNodeChild;
            ['value']?: (props: VueUiKpiCommentSlotProps) => VNodeChild;
            ['comment-after']?: (props: VueUiKpiCommentSlotProps) => VNodeChild;
        };
    };
};

export default VueUiKpi;
