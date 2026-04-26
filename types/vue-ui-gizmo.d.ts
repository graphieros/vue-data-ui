import type { DefineComponent, VNodeChild } from 'vue';

import type {
    VueUiGizmoConfig,
    VueUiGizmoDataset,
    VueUiGizmoProps,
} from 'vue-data-ui';

export type { VueUiGizmoConfig, VueUiGizmoDataset, VueUiGizmoProps };

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
