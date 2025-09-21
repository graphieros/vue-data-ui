import { DefineComponent } from 'vue';

export type { 
    VueUiSmileyConfig,
    VueUiRatingDataset
} from "./vue-data-ui";

declare const VueUiSmiley: DefineComponent<{
    config?: VueUiSmileyConfig;
    dataset: VueUiRatingDataset;
}>;

export default VueUiSmiley;
export { VueUiSmiley }