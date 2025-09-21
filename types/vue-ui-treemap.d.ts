import { DefineComponent } from 'vue';

export type { 
    VueUiTreemapDatasetItem,
    VueUiTreemapConfig,
    VueUiTreemapDatapoint,
    VueUiTreemapSeriesItem,
    VueUiTreemapExpose,
    VueUiTreemapEvent
} from "./vue-data-ui";

declare const VueUiTreemap: DefineComponent<{
    config?: VueUiTreemapConfig;
    dataset: VueUiTreemapDatasetItem[];
}, VueUiTreemapExpose>;

export default VueUiTreemap;
export { VueUiTreemap }