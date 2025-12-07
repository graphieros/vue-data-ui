import { DefineComponent } from 'vue';
export type {
    VueUiDagConfig,
    VueUiDagDataset,
    VueUiDagExpose,
    VueUiDagNode,
    VueUiDagEdge
} from "./vue-data-ui";

declare const VueUiDag: DefineComponent<{
    config?: VueUiDagConfig;
    dataset: VueUiDagDataset;
}, VueUiDagExpose>;

export default VueUiDag;
export { VueUiDag }