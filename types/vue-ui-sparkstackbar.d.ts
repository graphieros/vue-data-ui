import { DefineComponent } from 'vue';

export type { 
    VueUiSparkStackbarDatapoint,
    VueUiSparkStackbarConfig,
    VueUiSparkStackbarDatasetItem,
    VueUiSparkStackbarEvent
} from "./vue-data-ui";

declare const VueUiSparkStackbar: DefineComponent<{
    config?: VueUiSparkStackbarConfig;
    dataset: VueUiSparkStackbarDatasetItem[];
}>;

export default VueUiSparkStackbar;
export { VueUiSparkStackbar }