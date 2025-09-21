import { DefineComponent } from 'vue';

export type { 
    VueUiHistoryPlotDatasetItem,
    VueUiHistoryPlotConfig,
    VueUiHistoryPlotDatapoint,
    VueUiHistoryPlotDatapointEvent,
    VueUiHistoryPlotDatpointSeries,
    VueUiHistoryPlotExpose,
    VueUiHistoryPlotEvent
} from "./vue-data-ui";

declare const VueUiHistoryPlot: DefineComponent<{
    config?: VueUiHistoryPlotConfig;
    dataset: VueUiHistoryPlotDatasetItem[];
}, VueUiHistoryPlotExpose>;

export default VueUiHistoryPlot;
export { VueUiHistoryPlot };