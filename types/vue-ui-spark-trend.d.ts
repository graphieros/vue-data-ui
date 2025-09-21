import { DefineComponent } from 'vue';

export type { 
    VueUiSparkTrendConfig
} from "./vue-data-ui";

declare const VueUiSparkTrend: DefineComponent<{
    dataset: Array<number | null>;
    config?: VueUiSparkTrendConfig;
}>;

export default VueUiSparkTrend;
export { VueUiSparkTrend }