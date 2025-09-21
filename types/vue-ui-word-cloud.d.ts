import { DefineComponent } from 'vue';

export type { 
    VueUiWordCloudDatasetItem,
    VueUiWordCloudDatapoint,
    VueUiWordCloudConfig,
    VueUiWordCloudExpose,
    VueUiWordCloudEvent
} from "./vue-data-ui";

declare const VueUiWordCloud: DefineComponent<{
    config?: VueUiWordCloudConfig;
    dataset: VueUiWordCloudDatasetItem[] | string;
}, VueUiWordCloudExpose>;

export default VueUiWordCloud;
export { VueUiWordCloud }