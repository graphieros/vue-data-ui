import { DefineComponent } from 'vue';

export type {
    VueUiAnnotatorConfig,
    VueUiAnnotatorDataset
} from "./vue-data-ui";

declare const VueUiAnnotator: DefineComponent<{
    config?: VueUiAnnotatorConfig;
    dataset?: VueUiAnnotatorDataset;
}>;

export default VueUiAnnotator;
export { VueUiAnnotator };