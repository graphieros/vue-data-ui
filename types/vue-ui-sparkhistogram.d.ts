import { DefineComponent } from 'vue';

export type { 
    VueUiSparkHistogramConfig,
    VueUiSparkHistogramDatasetItem,
    VueUiSparkHistogramEvent
} from "./vue-data-ui";

declare const VueUiSparkHistogram: DefineComponent<{
    config?: VueUiSparkHistogramConfig;
    dataset: VueUiSparkHistogramDatasetItem[];
}>;

export default VueUiSparkHistogram;
export { VueUiSparkHistogram }