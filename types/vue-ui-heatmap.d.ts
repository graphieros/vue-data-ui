import { DefineComponent } from 'vue';

export type { 
    VueUiHeatmapConfig,
    VueUiHeatmapDatapoint,
    VueUiHeatmapRow,
    VueUiHeatmapDatasetItem,
    VueUiHeatmapExpose
} from "./vue-data-ui";

declare const VueUiHeatmap: DefineComponent<{
    config?: VueUiHeatmapConfig;
    dataset: VueUiHeatmapDatasetItem[];
}, VueUiHeatmapExpose>;

export default VueUiHeatmap;
export { VueUiHeatmap };