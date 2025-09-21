import { DefineComponent } from 'vue';

export type { 
    VueUiStackbarDatasetItem,
    VueUiStackbarDatapointItem,
    VueUiStackbarSeriesItem,
    VueUiStackbarConfig,
    VueUiStackbarExpose,
    VueUiStackbarEvent
} from "./vue-data-ui";

declare const VueUiStackbar: DefineComponent<{
    config?: VueUiStackbarConfig;
    dataset: VueUiStackbarDatasetItem[];
}, VueUiStackbarExpose>;

export default VueUiStackbar;
export { VueUiStackbar }