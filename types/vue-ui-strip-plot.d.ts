import { DefineComponent } from 'vue';

export type { 
    VueUiStripPlotConfig,
    VueUiStripPlotDatapoint,
    VueUiStripPlotSeriesItem,
    VueUiStripPlotDatasetItem,
    VueUiStripPlotDataset,
    VueUiStripPlotExpose,
    VueUiStripPlotEvent
} from "./vue-data-ui";

declare const VueUiStripPlot: DefineComponent<{
    config?: VueUiStripPlotConfig;
    dataset: VueUiStripPlotDataset[];
}, VueUiStripPlotExpose>;

export default VueUiStripPlot;
export { VueUiStripPlot }