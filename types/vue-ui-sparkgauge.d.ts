import { DefineComponent } from 'vue';

export type { 
    VueUiSparkgaugeDataset,
    VueUiSparkgaugeConfig
} from "./vue-data-ui";

declare const VueUiSparkgauge: DefineComponent<{
    dataset: VueUiSparkgaugeDataset;
    config?: VueUiSparkgaugeConfig;
}>;

export default VueUiSparkgauge;
export { VueUiSparkgauge }