import { DefineComponent } from 'vue';

export type { 
    VueUiQuickChartConfig,
    VueUiQuickChartDatasetObjectItem,
    VueUiQuickChartDataset,
    VueUiQuickChartExpose
} from "./vue-data-ui";

declare const VueUiQuickChart: DefineComponent<{
    config?: VueUiQuickChartConfig;
    dataset: VueUiQuickChartDataset;
}, VueUiQuickChartExpose>;

export default VueUiQuickChart;
export { VueUiQuickChart };