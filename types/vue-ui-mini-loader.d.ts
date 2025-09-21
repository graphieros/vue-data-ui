import { DefineComponent } from 'vue';

export type { 
    VueUiMiniLoaderConfigType,
    VueUiMiniLoaderConfig
} from "./vue-data-ui";

declare const VueUiMiniLoader: DefineComponent<{
    config?: VueUiMiniLoaderConfig;
}>;

export default VueUiMiniLoader;
export { VueUiMiniLoader };