import { DefineComponent } from 'vue';

export type {
    VueUi3dBarConfig,
    VueUi3dBarDataset,
    VueUi3dBarExpose,
    VueUi3dBarDatapoint,
    VueUi3dBarDatasetBreakdown,
    VueUi3dBarEvent
} from "./vue-data-ui";

declare const VueUi3dBar: DefineComponent<{
    config?: VueUi3dBarConfig;
    dataset: VueUi3dBarDataset;
}, VueUi3dBarExpose>;

export default VueUi3dBar;
export { VueUi3dBar };