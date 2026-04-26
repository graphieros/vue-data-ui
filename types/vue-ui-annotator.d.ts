import type { DefineComponent } from 'vue';

import type { VueUiAnnotatorConfig, VueUiAnnotatorDataset } from 'vue-data-ui';
export type { VueUiAnnotatorConfig, VueUiAnnotatorDataset };

declare const VueUiAnnotator: DefineComponent<{
    config?: VueUiAnnotatorConfig;
    dataset?: VueUiAnnotatorDataset;
}>;

export default VueUiAnnotator;
export { VueUiAnnotator };
