import type { DefineComponent } from 'vue';

import type {
    VueUiAnnotatorConfig,
    VueUiAnnotatorDataset,
    VueUiAnnotatorProps,
    VueUiAnnotatorEmits,
    VueUiAnnotatorEmitToggleOpenState,
    VueUiAnnotatorEmitSaveAnnotations,
    VueUiAnnotatorShape,
} from 'vue-data-ui';
export type {
    VueUiAnnotatorConfig,
    VueUiAnnotatorDataset,
    VueUiAnnotatorProps,
    VueUiAnnotatorEmits,
    VueUiAnnotatorEmitToggleOpenState,
    VueUiAnnotatorEmitSaveAnnotations,
    VueUiAnnotatorShape,
};

declare const VueUiAnnotator: DefineComponent<
    VueUiAnnotatorProps,
    {},
    {},
    {},
    {},
    {},
    {},
    VueUiAnnotatorEmits
>;

export default VueUiAnnotator;
export { VueUiAnnotator };
