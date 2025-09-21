import { DefineComponent } from 'vue';

export type { 
    VueUiRingsConfig,
    VueUiRingsDatapoint,
    VueUiRingsDatasetItem,
    VueUiRingsExpose,
    VueUiRingsEvent
} from "./vue-data-ui";

declare const VueUiRings: DefineComponent<{
    config?: VueUiRingsConfig;
    dataset: VueUiRingsDatasetItem[];
}, VueUiRingsExpose>;

export default VueUiRings;
export { VueUiRings }