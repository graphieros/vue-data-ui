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
    VueUiDashboardEmits,
    CommonAnnotatorSlots,
    VueUiDashboardEmitChange,
    VueUiDashboardEmitCopyAlt,
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
    VueUiDashboardEmits,
    VueUiDashboardEmitChange,
    VueUiDashboardEmitCopyAlt,
};

declare const VueUiDashboardBase: DefineComponent<
    VueUiDashboardProps,
    {},
    {},
    {},
    {},
    {},
    {},
    VueUiDashboardEmits
>;

export const VueUiDashboard: typeof VueUiDashboardBase & {
    new (): {
        $slots: CommonAnnotatorSlots & {
            ['custom-menu-before']?: () => VNodeChild;
            ['custom-menu-after']?: () => VNodeChild;
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
