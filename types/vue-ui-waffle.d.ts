import { DefineComponent } from 'vue';

export type { 
    VueUiWaffleConfig,
    VueUiWaffleDatapoint,
    VueUiWaffleSerieItem,
    VueUiWaffleDatasetItem,
    VueUiWaffleExpose,
    VueUiWaffleEvent
} from "./vue-data-ui";

declare const VueUiWaffle: DefineComponent<{
    config?: VueUiWaffleConfig;
    dataset: VueUiWaffleDatasetItem[];
}, VueUiWaffleExpose>;

export default VueUiWaffle;
export { VueUiWaffle }