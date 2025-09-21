import { DefineComponent } from 'vue';

export type { 
    VueUiTimerConfig
} from "./vue-data-ui";

declare const VueUiTimer: DefineComponent<{
    config?: VueUiTimerConfig;
}>;

export default VueUiTimer;
export { VueUiTimer }