import { DefineComponent } from 'vue';

export type { 
    VueUiSparklineDatasetItem,
    VueUiSparklineConfig,
    VueUiSparklineEvent
} from "./vue-data-ui";

declare const VueUiSparkline: DefineComponent<{
    config?: VueUiSparklineConfig;
    dataset: VueUiSparklineDatasetItem[];
}>;

export default VueUiSparkline;
export { VueUiSparkline }