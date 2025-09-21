import { DefineComponent } from 'vue';

export type { 
    VueUiHorizontalBarConfig,
    VueUiHorizontalBarDatapoint,
    VueUiHorizontalBarSerie,
    VueUiHorizontalBarDatasetChild,
    VueUiHorizontalBarDatasetItem,
    VueUiHorizontalBarExpose,
    VueUiHorizontalBarEvent
} from "./vue-data-ui";

declare const VueUiHorizontalBar: DefineComponent<{
    config?: VueUiHorizontalBarConfig;
    dataset: VueUiHorizontalBarDatasetItem[];
}, VueUiHorizontalBarExpose>;

export default VueUiHorizontalBar;
export { VueUiHorizontalBar };