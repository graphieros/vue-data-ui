import type { DefineComponent, VNodeChild } from 'vue';

import type {
    VueUiAnnotatorConfig,
    VueUiAnnotatorDataset,
    VueUiAnnotatorProps,
    VueUiAnnotatorEmits,
    VueUiAnnotatorEmitToggleOpenState,
    VueUiAnnotatorEmitSaveAnnotations,
    VueUiAnnotatorShape,
    VueUiAnnotatorToggleSlotProps,
    VueUiAnnotatorButtonSlotProps,
    VueUiAnnotatorButtonShapeSlotProps,
} from 'vue-data-ui';
export type {
    VueUiAnnotatorConfig,
    VueUiAnnotatorDataset,
    VueUiAnnotatorProps,
    VueUiAnnotatorEmits,
    VueUiAnnotatorEmitToggleOpenState,
    VueUiAnnotatorEmitSaveAnnotations,
    VueUiAnnotatorShape,
    VueUiAnnotatorToggleSlotProps,
    VueUiAnnotatorButtonSlotProps,
    VueUiAnnotatorButtonShapeSlotProps,
};

declare const VueUiAnnotatorBase: DefineComponent<
    VueUiAnnotatorProps,
    {},
    {},
    {},
    {},
    {},
    {},
    VueUiAnnotatorEmits
>;

export const VueUiAnnotator: typeof VueUiAnnotatorBase & {
    new (): {
        $slots: {
            toggle?: (props: VueUiAnnotatorToggleSlotProps) => VNodeChild;
            ['icon-move']?: (
                props: VueUiAnnotatorButtonSlotProps,
            ) => VNodeChild;
            ['icon-resize']?: (
                props: VueUiAnnotatorButtonSlotProps,
            ) => VNodeChild;
            ['icon-delete']?: (
                props: VueUiAnnotatorButtonSlotProps,
            ) => VNodeChild;
            ['icon-select-group']?: (
                props: VueUiAnnotatorButtonSlotProps,
            ) => VNodeChild;
            ['icon-bring-to-front']?: () => VNodeChild;
            ['icon-bring-to-back']?: () => VNodeChild;
            ['icon-copy']?: () => VNodeChild;
            ['icon-undo']?: () => VNodeChild;
            ['icon-redo']?: () => VNodeChild;
            ['icon-print']?: () => VNodeChild;
            ['icon-export-image']?: () => VNodeChild;
            ['icon-save']?: () => VNodeChild;
            ['icon-circle']?: (
                props: VueUiAnnotatorButtonShapeSlotProps,
            ) => VNodeChild;
            ['icon-rect']?: (
                props: VueUiAnnotatorButtonShapeSlotProps,
            ) => VNodeChild;
            ['icon-arrow']?: () => VNodeChild;
            ['icon-freehand']?: () => VNodeChild;
            ['icon-text']?: (
                props: VueUiAnnotatorButtonSlotProps,
            ) => VNodeChild;
            ['icon-text-align-left']?: () => VNodeChild;
            ['icon-text-align-center']?: () => VNodeChild;
            ['icon-text-align-right']?: () => VNodeChild;
            ['icon-text-bullet-points']?: () => VNodeChild;
            ['icon-text-bold']?: () => VNodeChild;
            ['icon-text-italic']?: () => VNodeChild;
            ['icon-text-underline']?: () => VNodeChild;
            ['icon-color']?: (props: {
                color: string;
                backgroundColor: string;
            }) => VNodeChild;
        };
    };
};

export default VueUiAnnotator;
export { VueUiAnnotator };
