import { DefineComponent } from 'vue';

export type { 
    VueUiDonutConfig,
    VueUiDonutDatasetItem,
    VueUiDonutDatapoint,
    VueUiDonutSeriesItem,
    VueUiDonutExpose,
    VueUiDonutEvent
} from "./vue-data-ui";

declare const VueUiDonut: DefineComponent<{
    config?: VueUiDonutConfig;
    dataset: VueUiDonutDatasetItem[];
}, VueUiDonutExpose>;

export default VueUiDonut;
export { VueUiDonut };