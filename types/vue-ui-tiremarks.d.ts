import { DefineComponent } from 'vue';

export type { 
    VueUiTiremarksConfig,
    VueUiTiremarksDataset,
    VueUiTiremarksExpose
} from "./vue-data-ui";

declare const VueUiTiremarks: DefineComponent<{
    config?: VueUiTiremarksConfig;
    dataset: VueUiTiremarksDataset;
}, VueUiTiremarksExpose>;

export default VueUiTiremarks;
export { VueUiTiremarks }