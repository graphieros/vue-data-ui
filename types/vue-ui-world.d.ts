import { DefineComponent } from 'vue';

export type { 
    VueUiWorldDatapoint,
    VueUiWorldConfig,
    VueUiWorldDataset,
    VueUiWorldExpose,
    VueUiWorldEvent
} from "./vue-data-ui";

declare const VueUiWorld: DefineComponent<{
    config?: VueUiWorldConfig;
    dataset?: VueUiWorldDataset
}, VueUiWorldExpose>;

export default VueUiWorld;
export { VueUiWorld }