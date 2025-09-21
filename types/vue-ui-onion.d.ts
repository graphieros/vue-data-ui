import { DefineComponent } from 'vue';

export type { 
    VueUiOnionDatasetItem,
    VueUiOnionConfig,
    VueUiOnionDatapoint,
    VueUiOnionSeriesItem,
    VueUiOnionExpose,
    VueUiOnionEvent
} from "./vue-data-ui";

declare const VueUiOnion: DefineComponent<{
    config?: VueUiOnionConfig;
    dataset: VueUiOnionDatasetItem[];
}, VueUiOnionExpose>;

export default VueUiOnion;
export { VueUiOnion };