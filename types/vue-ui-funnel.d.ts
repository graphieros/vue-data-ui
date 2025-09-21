import { DefineComponent } from 'vue';

export type { 
    VueUiFunnelDatasetItem,
    VueUiFunnelConfig,
    VueUiFunnelExpose
} from "./vue-data-ui";

declare const VueUiFunnel: DefineComponent<{
    dataset: VueUiFunnelDatasetItem[];
    config?: VueUiFunnelConfig;
}, VueUiFunnelExpose>;

export default VueUiFunnel;
export { VueUiFunnel };