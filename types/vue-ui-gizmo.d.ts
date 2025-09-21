import { DefineComponent } from 'vue';

export type { 
    VueUiGizmoConfig,
    VueUiGizmoDataset
} from "./vue-data-ui";

declare const VueUiGizmo: DefineComponent<{
    dataset: VueUiGizmoDataset;
    config?: VueUiGizmoConfig;
}>;

export default VueUiGizmo;
export { VueUiGizmo };