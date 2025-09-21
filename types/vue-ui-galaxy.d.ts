import { DefineComponent } from 'vue';

export type { 
    VueUiGalaxyDatasetItem,
    VueUiGalaxyConfig,
    VueUiGalaxyDatapoint,
    VueUiGalaxySeriesItem,
    VueUiGalaxyExpose,
    VueUiGalaxyEvent
} from "./vue-data-ui";

declare const VueUiGalaxy: DefineComponent<{
    config?: VueUiGalaxyConfig;
    dataset: VueUiGalaxyDatasetItem[];
}, VueUiGalaxyExpose>;

export default VueUiGalaxy;
export { VueUiGalaxy };