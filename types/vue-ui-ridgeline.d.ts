import { DefineComponent } from 'vue';

export type { 
    VueUiRidgelineDatapoint,
    VueUiRidgelineDatasetItem,
    VueUiRidgelineDatapointEventUnit,
    VueUiRidgelineDatapointEventEntry,
    VueUiRidgelineDatapointEvent,
    VueUiRidgelineConfig,
    VueUiRidgelineExpose,
    VueUiRidgelineEvent
} from "./vue-data-ui";

declare const VueUiRidgeline: DefineComponent<{
    config?: VueUiRidgelineConfig;
    dataset: VueUiRidgelineDatasetItem[]
},VueUiRidgelineExpose>;

export default VueUiRidgeline;
export { VueUiRidgeline }