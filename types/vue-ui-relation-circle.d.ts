import { DefineComponent } from 'vue';

export type { 
    VueUiRelationCircleConfig,
    VueUiRelationCircleDatasetItem,
    VueUiRelationCircleDatapoint,
    VueUiRelationCircleExpose,
    VueUiRelationCircleEvent
} from "./vue-data-ui";

declare const VueUiRelationCircle: DefineComponent<{
    config?: VueUiRelationCircleConfig;
    dataset: VueUiRelationCircleDatasetItem[];
}, VueUiRelationCircleExpose>;

export default VueUiRelationCircle;
export { VueUiRelationCircle }