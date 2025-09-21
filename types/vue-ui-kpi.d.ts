import { DefineComponent } from 'vue';

export type { 
    VueUiKpiConfig
} from "./vue-data-ui";

declare const VueUiKpi: DefineComponent<{
    dataset: number;
    config?: VueUiKpiConfig;
}>;

export default VueUiKpi;
export { VueUiKpi };