import { DefineComponent } from 'vue';

export type { 
    VueUiScatterDatasetValueItem,
    VueUiScatterDatasetItem,
    VueUiScatterConfig,
    VueUiScatterDatapoint,
    VueUiScatterSeries,
    VueUiScatterExpose,
    VueUiScatterEvent
} from "./vue-data-ui";

declare const VueUiScatter: DefineComponent<{
    config?: VueUiScatterConfig;
    dataset: VueUiScatterDatasetItem[];
}, VueUiScatterExpose>;

export default VueUiScatter;
export { VueUiScatter }