import type { DefineComponent } from 'vue';

export type {
    VueUiGeoConfig,
    VueUiGeoDatasetItem,
    VueUiGeoExpose,
} from 'vue-data-ui';

declare const VueUiGeo: DefineComponent<
    {
        config?: VueUiGeoConfig;
        dataset?: VueUiGeoDatasetItem[];
    },
    VueUiGeoExpose
>;

export default VueUiGeo;
export { VueUiGeo };
