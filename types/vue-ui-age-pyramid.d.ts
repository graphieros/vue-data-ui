import { DefineComponent } from 'vue';

export type {
    VueUiAgePyramidDatasetRow,
    VueUiAgePyramidDataset,
    VueUiAgePyramidConfig,
    VueUiAgePyramidDatapoint,
    VueUiAgePyramidSideData,
    VueUiAgePyramidSeries,
    VueUiAgePyramidExpose,
    VueUiAgePyramidEvent

} from "./vue-data-ui";

declare const VueUiAgePyramid: DefineComponent<{
    config?: VueUiAgePyramidConfig;
    dataset: VueUiAgePyramidDataset;
}, VueUiAgePyramidExpose>;

export default VueUiAgePyramid;
export { VueUiAgePyramid };