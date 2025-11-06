import { DefineComponent } from 'vue';

export type { 
    VueUiStacklineDatasetItem,
    VueUiStacklineDatapointItem,
    VueUiStacklineSeriesItem,
    VueUiStacklineConfig,
    VueUiStacklineExpose,
    VueUiStacklineEvent
} from "./vue-data-ui";

declare const VueUiStackline: DefineComponent<{
    config?: VueUiStacklineConfig;
    dataset: VueUiStacklineDatasetItem[];
}, VueUiStacklineExpose>;

export default VueUiStackline;
export { VueUiStackline }