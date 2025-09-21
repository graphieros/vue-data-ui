import { DefineComponent } from 'vue';

export type {
    VueUiChestnutDatasetBranchBreakdown,
    VueUiChestnutDatasetBranch,
    VueUiChestnutDatasetRoot,
    VueUiChestnutConfig,
    VueUiChestnutExpose,
} from "./vue-data-ui";

declare const VueUiChestnut: DefineComponent<{
    config?: VueUiChestnutConfig;
    dataset: VueUiChestnutDatasetRoot[];
}, VueUiChestnutExpose>;

export default VueUiChestnut;
export { VueUiChestnut };