import { DefineComponent } from 'vue';
export type { VueUiDigitsConfig } from "./vue-data-ui";

declare const VueUiDigits: DefineComponent<{
    dataset: number;
    config?: VueUiDigitsConfig;
}>;

export default VueUiDigits;
export { VueUiDigits };