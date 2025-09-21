import { DefineComponent } from 'vue';

export type { 
    VueUiFlowDatasetItem,
    VueUiFlowNode,
    VueUiFlowFormattedDataset,
    VueUiFlowConfig,
    VueUiFlowExpose,
    VueUiFlowEvent
} from "./vue-data-ui";

declare const VueUiFlow: DefineComponent<{
    dataset: VueUiFlowDatasetItem[];
    config?: VueUiFlowConfig;
}, VueUiFlowExpose>;

export default VueUiFlow;
export { VueUiFlow };