import { DefineComponent } from 'vue';

export type {
    VueUiCandlestickConfig,
    VueUiCandlestickDatapoint,
    VueUiCandlestickExpose,
    VueUiCandlestickEvent
} from "./vue-data-ui";

declare const VueUiCandlestick: DefineComponent<{
    config?: VueUiCandlestickConfig;
    dataset: Array<Array<string | number>>;
}, VueUiCandlestickExpose>;

export default VueUiCandlestick;
export { VueUiCandlestick };