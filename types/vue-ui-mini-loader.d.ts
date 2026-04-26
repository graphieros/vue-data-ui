import type { DefineComponent } from 'vue';

import type {
    VueUiMiniLoaderConfigType,
    VueUiMiniLoaderConfig,
} from 'vue-data-ui';

export type { VueUiMiniLoaderConfigType, VueUiMiniLoaderConfig };

declare const VueUiMiniLoader: DefineComponent<{
    config?: VueUiMiniLoaderConfig;
}>;

export default VueUiMiniLoader;
export { VueUiMiniLoader };
