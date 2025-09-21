import { DefineComponent } from 'vue';

export type { 
    VueUiVerticalBarConfig,
    VueUiVerticalBarDatapoint,
    VueUiVerticalBarSerie,
    VueUiVerticalBarDatasetChild,
    VueUiVerticalBarDatasetItem,
    VueUiVerticalBarExpose,
    VueUiVerticalBarEvent
} from "./vue-data-ui";

declare const VueUiVerticalBar: DefineComponent<{
    config?: VueUiVerticalBarConfig;
    dataset: VueUiVerticalBarDatasetItem[];
}, VueUiVerticalBarExpose>;

export default VueUiVerticalBar;
export { VueUiVerticalBar };