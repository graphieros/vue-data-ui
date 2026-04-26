import type { DefineComponent, VNodeChild } from 'vue';

import type {
    VueUiDashboardConfig,
    VueUiDashboardElement,
    VueUiDashboardProps,
    VueUiDashboardTopSlotProps,
    VueUiDashboardBottomSlotProps,
    VueUiDashboardContentSlotProps,
    VueUiDashboardPlacedElement,
    VueUiAnnotatorActionColorSlotProps,
    VueUiAnnotatorActionDrawSlotProps,
    VueUiAnnotatorActionUndoSlotProps,
    VueUiAnnotatorActionRedoSlotProps,
    VueUiAnnotatorActionDeleteSlotProps,
    CommonAnnotatorSlots,
} from 'vue-data-ui';

export type {
    VueUiDashboardConfig,
    VueUiDashboardElement,
    VueUiDashboardProps,
    VueUiDashboardTopSlotProps,
    VueUiDashboardBottomSlotProps,
    VueUiDashboardContentSlotProps,
    VueUiDashboardPlacedElement,
    VueUiAnnotatorActionColorSlotProps,
    VueUiAnnotatorActionDrawSlotProps,
    VueUiAnnotatorActionUndoSlotProps,
    VueUiAnnotatorActionRedoSlotProps,
    VueUiAnnotatorActionDeleteSlotProps,
    CommonAnnotatorSlots,
};

declare const VueUiDashboardBase: DefineComponent<VueUiDashboardProps>;

export const VueUiDashboard: typeof VueUiDashboardBase & {
    new (): {
        $slots: CommonAnnotatorSlots & {
            top?: (props: VueUiDashboardTopSlotProps) => VNodeChild;
            content?: (props: VueUiDashboardContentSlotProps) => VNodeChild;
            bottom?: (props: VueUiDashboardBottomSlotProps) => VNodeChild;
            optionPdf?: () => VNodeChild;
            optionImg?: () => VNodeChild;
            optionAltCopy?: () => VNodeChild;
        };
    };
};

export default VueUiDashboard;
export { VueUiDashboard };
