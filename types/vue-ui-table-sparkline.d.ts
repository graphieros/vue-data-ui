import { DefineComponent } from 'vue';

export type { 
    VueUiTableSparklineDatasetItem,
    VueUiTableSparklineConfig
} from "./vue-data-ui";

declare const VueUiTableSparkline: DefineComponent<{
    dataset: VueUiTableSparklineDatasetItem[];
    config: VueUiTableSparklineConfig;
}>;

export default VueUiTableSparkline;
export { VueUiTableSparkline }