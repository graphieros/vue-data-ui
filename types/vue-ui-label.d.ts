import type { DefineComponent, VNodeChild } from 'vue';

import type {
    VueUiLabelConfig,
    VueUiLabelDataset,
    VueUiLabelProps,
    VueUiLabelEmitDragStart,
    VueUiLabelEmitDrag,
    VueUiLabelEmitDragEnd,
    VueUiLabelEmits,
    VueUiLabelSlotProps,
    VueUiLabelExpose,
} from 'vue-data-ui';

export type {
    VueUiLabelConfig,
    VueUiLabelDataset,
    VueUiLabelProps,
    VueUiLabelEmitDragStart,
    VueUiLabelEmitDrag,
    VueUiLabelEmitDragEnd,
    VueUiLabelEmits,
    VueUiLabelSlotProps,
    VueUiLabelExpose,
};

declare const VueUiLabelBase: DefineComponent<
    VueUiLabelProps,
    {},
    {},
    {},
    {},
    {},
    {},
    VueUiLabelEmits
>;

export const VueUiLabel: typeof VueUiLabelBase & {
    new (): VueUiLabelExpose & {
        $slots: {
            after: (props: VueUiLabelSlotProps) => VNodeChild;
            before: (props: VueUiLabelSlotProps) => VNodeChild;
            title: (props: VueUiLabelSlotProps) => VNodeChild;
            content: (props: VueUiLabelSlotProps) => VNodeChild;
        };
    };
};

export default VueUiLabel;
export { VueUiLabel };
