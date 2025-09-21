import { DefineComponent } from 'vue';

export type { 
    VueUiDumbbellConfigLabel,
    VueUiDumbbellDatapoint,
    VueUiDumbbellConfig,
    VueUiDumbbellDataset,
    VueUiDumbbellExpose,
    VueUiDumbbellEvent
} from "./vue-data-ui";

declare const VueUiDumbbell: DefineComponent<{
    config?: VueUiDumbbellConfig;
    dataset: VueUiDumbbellDataset[];
}, VueUiDumbbellExpose>;

export default VueUiDumbbell;
export { VueUiDumbbell };