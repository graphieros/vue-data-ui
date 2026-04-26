import type { DefineComponent } from 'vue';

import type { VueUiSmileyConfig, VueUiRatingDataset } from 'vue-data-ui';
export type { VueUiSmileyConfig, VueUiRatingDataset };

declare const VueUiSmiley: DefineComponent<{
    config?: VueUiSmileyConfig;
    dataset: VueUiRatingDataset;
}>;

export default VueUiSmiley;
export { VueUiSmiley };
