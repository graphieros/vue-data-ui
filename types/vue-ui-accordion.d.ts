import type { DefineComponent } from 'vue';

import type { VueUiAccordionConfig } from 'vue-data-ui';
export type { VueUiAccordionConfig };

declare const VueUiAccordion: DefineComponent<{
    config?: VueUiAccordionConfig;
}>;

export default VueUiAccordion;
export { VueUiAccordion };
