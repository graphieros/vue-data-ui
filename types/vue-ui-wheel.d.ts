import { DefineComponent } from 'vue';

export type { 
    VueUiWheelConfig,
    VueUiWheelDataset,
    VueUiWheelExpose
} from "./vue-data-ui";

declare const VueUiWheel: DefineComponent<{
    dataset: VueUiWheelDataset;
    config?: VueUiWheelConfig;
}, VueUiWheelExpose>;

export default VueUiWheel;
export { VueUiWheel }