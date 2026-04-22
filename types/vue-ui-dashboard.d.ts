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
};

declare const VueUiDashboardBase: DefineComponent<VueUiDashboardProps>;

export const VueUiDashboard: typeof VueUiDashboardBase & {
    new (): {
        $slots: {
            top?: (props: VueUiDashboardTopSlotProps) => VNodeChild;
            content?: (props: VueUiDashboardContentSlotProps) => VNodeChild;
            bottom?: (props: VueUiDashboardBottomSlotProps) => VNodeChild;
            ['annotator-action-close']?: () => VNodeChild;
            ['annotator-action-color']?: (
                props: VueUiAnnotatorActionColorSlotProps,
            ) => VNodeChild;
            ['annotator-action-draw']?: (
                props: VueUiAnnotatorActionDrawSlotProps,
            ) => VNodeChild;
            ['annotator-action-undo']?: (
                props: VueUiAnnotatorActionUndoSlotProps,
            ) => VNodeChild;
            ['annotator-action-redo']?: (
                props: VueUiAnnotatorActionRedoSlotProps,
            ) => VNodeChild;
            ['annotator-action-delete']?: (
                props: VueUiAnnotatorActionDeleteSlotProps,
            ) => VNodeChild;
            optionPdf?: () => VNodeChild;
            optionImg?: () => VNodeChild;
            optionAltCopy?: () => VNodeChild;
        };
    };
};

export default VueUiDashboard;
export { VueUiDashboard };
