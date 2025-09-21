import { DefineComponent } from 'vue';

export type { 
    VueUiParallelCoordinatePlotDatasetSerieItem,
    VueUiParallelCoordinatePlotDatasetItem,
    VueUiParallelCoordinatePlotConfig,
    VueUiParallelCoordinatePlotEventDatapoint,
    VueUiParallelCoordinatePlotDatapointSelection,
    VueUiParallelCoordinatePlotScaleSelection,
    VueUiParallelCoordinatePlotExpose,
    VueUiParallelCoordinatePlotEvent
} from "./vue-data-ui";

declare const VueUiParallelCoordinatePlot: DefineComponent<{
    config?: VueUiParallelCoordinatePlotConfig;
    dataset: VueUiParallelCoordinatePlotDatasetItem[];
}, VueUiParallelCoordinatePlotExpose>;

export default VueUiParallelCoordinatePlot;
export { VueUiParallelCoordinatePlot };