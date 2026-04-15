import type { DefineComponent, VNodeChild } from 'vue';

export type {
    VueUiGizmoConfig,
    VueUiGizmoDataset,
    VueUiGizmoProps,
} from 'vue-data-ui';

const VueUiGizmoBase: DefineComponent<VueUiGizmoProps>;

export const VueUiGizmo: typeof VueUiGizmoBase & {
    new (): {
        $slots: {
            skeleton?: () => VNodeChild;
        };
    };
};

export default VueUiGizmo;
export { VueUiGizmo };
