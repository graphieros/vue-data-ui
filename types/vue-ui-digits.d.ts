import type { DefineComponent } from 'vue';

import type { VueUiDigitsConfig } from 'vue-data-ui';
export type { VueUiDigitsConfig };

declare const VueUiDigits: DefineComponent<{
    dataset: number;
    config?: VueUiDigitsConfig;
}>;

export default VueUiDigits;
export { VueUiDigits };
