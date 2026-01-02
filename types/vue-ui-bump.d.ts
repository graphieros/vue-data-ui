import { DefineComponent } from 'vue';

export type {
    VueUiBumpExpose,
    VueUiBumpConfig,
    VueUiBumpDatasetItem,
    VueUiBumpDatapoint,
} from "./vue-data-ui";

declare const VueUiBump: DefineComponent<{
    config?: VueUiBumpConfig;
    dataset: VueUiBumpDatasetItem[];
}, VueUiBumpExpose>;

export default VueUiBump;
export { VueUiBump };