import { DefineComponent } from 'vue';

export type { 
    VueUiThermometerConfig,
    VueUiThermometerDataset,
    VueUiThermometerExpose
} from "./vue-data-ui";

declare const VueUiThermometer: DefineComponent<{
    config?: VueUiThermometerConfig;
    dataset: VueUiThermometerDataset;
}, VueUiThermometerExpose>;

export default VueUiThermometer;
export { VueUiThermometer }