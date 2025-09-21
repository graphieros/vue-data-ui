import { DefineComponent } from 'vue';

export type { 
    VueUiTableHeatmapDatasetItem,
    VueUiTableHeatmapConfig
} from "./vue-data-ui";

declare const VueUiTableHeatmap: DefineComponent<{
    config?: VueUiTableHeatmapConfig;
    dataset: VueUiTableHeatmapDatasetItem[];
}>;

export default VueUiTableHeatmap;
export { VueUiTableHeatmap }