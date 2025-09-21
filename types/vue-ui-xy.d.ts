import { DefineComponent } from 'vue';

export type {
    VueUiXyHighlightArea,
    VueUiXyAnnotation,
    VueUiXyConfig,
    VueUiXyDatasetItem,
    VueUiXyDatasetBarItem,
    VueUiXyDatasetLineItem,
    VueUiXyDatasetPlotItem,
    VueUiXySeries,
    VueUiXyDatapointItem,
    VueUiXyExpose,
    VueUiXyEvent
} from './vue-data-ui';

declare const VueUiXy: DefineComponent<{
    config?: VueUiXyConfig;
    dataset: VueUiXyDatasetItem[];
    selectedXIndex?: number | null;
}, VueUiXyExpose>;

export default VueUiXy;
export { VueUiXy };
