import { DefineComponent } from 'vue';

export type { 
    VueUiXyCanvasDatasetItem,
    VueUiXyCanvasConfig,
    VueUiXyCanvasExpose
} from "./vue-data-ui";

declare const VueUiXyCanvas: DefineComponent<{
    dataset: VueUiXyCanvasDatasetItem[];
    config?: VueUiXyCanvasConfig;
}, VueUiXyCanvasExpose>;

export default VueUiXyCanvas;
export { VueUiXyCanvas }