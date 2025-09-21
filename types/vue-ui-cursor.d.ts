import { DefineComponent } from 'vue';
export type { VueUiCursorConfig } from "./vue-data-ui";

declare const VueUiCursor: DefineComponent<{ config?: VueUiCursorConfig }>;

export default VueUiCursor;
export { VueUiCursor };