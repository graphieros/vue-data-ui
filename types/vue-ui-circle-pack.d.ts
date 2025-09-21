import { DefineComponent } from 'vue';

export type {
    VueUiCirclePackDatasetItem,
    VueUiCirclePackDatapoint,
    VueUiCirclePackConfig,
    VueUiCirclePackExpose,
    VueUiCirclePackEvent
} from "./vue-data-ui";

declare const VueUiCirclePack: DefineComponent<{
    config?: VueUiCirclePackConfig;
    dataset: VueUiCirclePackDatasetItem[];
}, VueUiCirclePackExpose>;

export default VueUiCirclePack;
export { VueUiCirclePack };