import { DefineComponent } from 'vue';

export type { 
    VueUiGaugeDatasetSerieItem,
    VueUiGaugeDataset,
    VueUiGaugeConfig,
    VueUiGaugeExpose
} from "./vue-data-ui";

declare const VueUiGauge: DefineComponent<{
    config?: VueUiGaugeConfig;
    dataset: VueUiGaugeDataset;
}, VueUiGaugeExpose>;

export default VueUiGauge;
export { VueUiGauge };