import { DefineComponent } from 'vue';

export type { 
    VueUiRatingDatasetDetailed,
    VueUiRatingDataset,
    VueUiRatingConfig
} from "./vue-data-ui";

declare const VueUiRating: DefineComponent<{
    config?: VueUiRatingConfig;
    dataset: VueUiRatingDataset;
}>;

export default VueUiRating;
export { VueUiRating }