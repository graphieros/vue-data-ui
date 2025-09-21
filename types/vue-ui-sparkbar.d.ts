import { DefineComponent } from 'vue';

export type { 
    VueUiSparkbarDatasetItem,
    VueUiSparkbarConfig,
    VueUiSparkbarEvent
} from "./vue-data-ui";

declare const VueUiSparkbar: DefineComponent<{
    config?: VueUiSparkbarConfig;
    dataset: VueUiSparkbarDatasetItem[];
}>;

export default VueUiSparkbar;
export { VueUiSparkbar }