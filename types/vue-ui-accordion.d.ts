import { DefineComponent } from 'vue';

export type {
    VueUiAccordionConfig
} from "./vue-data-ui";

declare const VueUiAccordion: DefineComponent<{
    config?: VueUi3dBarConfig;
}>;

export default VueUiAccordion;
export { VueUiAccordion };