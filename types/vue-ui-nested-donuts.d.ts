import { DefineComponent } from 'vue';

export type { 
    VueUiNestedDonutsDatasetItem,
    VueUiNestedDonutsConfig,
    VueUiNestedDonutsSeriesItem,
    VueUiNestedDonutsDatapoint,
    VueUiNestedDonutsExpose,
    VueUiDonutEvent
} from "./vue-data-ui";

declare const VueUiNestedDonuts: DefineComponent<{
    config?: VueUiNestedDonutsConfig;
    dataset: VueUiNestedDonutsDatasetItem[];
},VueUiNestedDonutsExpose>;

export default VueUiNestedDonuts;
export { VueUiNestedDonuts };