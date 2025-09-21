import { DefineComponent } from 'vue';

export type { 
    VueUiRadarConfig,
    VueUiRadarDatapoint,
    VueUiRadarCategory,
    VueUiRadarDatapointItem,
    VueUiRadarSeries,
    VueUiRadarDatasetCategoryItem,
    VueUiRadarDatasetSerieItem,
    VueUiRadarDataset,
    VueUiRadarExpose,
    VueUiRadarEvent
} from "./vue-data-ui";

declare const VueUiRadar: DefineComponent<{
    config?: VueUiRadarConfig;
    dataset: VueUiRadarDataset;
}, VueUiRadarExpose>;

export default VueUiRadar;
export { VueUiRadar };