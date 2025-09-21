import { DefineComponent } from 'vue';

export type { 
    VueUiMoodRadarDataset,
    VueUiMoodRadarDatapoint,
    VueUiMoodRadarConfig,
    VueUiMoodRadarExpose,
    VueUiMoodRadarEvent
} from "./vue-data-ui";

declare const VueUiMoodRadar: DefineComponent<{
    dataset: VueUiMoodRadarDataset;
    config?: VueUiMoodRadarConfig;
}, VueUiMoodRadarExpose>;

export default VueUiMoodRadar;
export { VueUiMoodRadar };