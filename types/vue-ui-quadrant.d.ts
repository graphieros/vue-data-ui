import { DefineComponent } from 'vue';

export type { 
    VueUiQuadrantDatasetSerieItem,
    VueUiQuadrantDatasetItem,
    VueUiQuadrantSideConfig,
    VueUiQuadrantConfig,
    VueUiQuadrantDatapoint,
    VueUiQuadrantSerie,
    VueUiQuadrantExpose,
    VueUiQuadrantEvent
} from "./vue-data-ui";

declare const VueUiQuadrant: DefineComponent<{
    dataset: VueUiQuadrantDatasetItem[];
    config?: VueUiQuadrantConfig;
}, VueUiQuadrantExpose>;

export default VueUiQuadrant;
export { VueUiQuadrant };