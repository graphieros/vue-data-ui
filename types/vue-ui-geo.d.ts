import { DefineComponent } from 'vue';
import { VueUiGeoConfig, VueUiGeoDatasetItem, VueUiGeoExpose } from 'vue-data-ui';

declare const VueUiGeo: DefineComponent<{
    config?: VueUiGeoConfig;
    dataset?: VueUiGeoDatasetItem[];
}, VueUiGeoExpose>;

export default VueUiGeo;
export { VueUiGeo }