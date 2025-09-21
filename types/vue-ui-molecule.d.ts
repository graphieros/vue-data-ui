import { DefineComponent } from 'vue';

export type { 
    VueUiMoleculeDatasetNode,
    VueUiMoleculeConfig,
    VueUiMoleculeDatapoint,
    VueUiMoleculeExpose,
    VueUiMoleculeEvent
} from "./vue-data-ui";

declare const VueUiMolecule: DefineComponent<{
    dataset: VueUiMoleculeDatasetNode[];
    config?: VueUiMoleculeConfig;
}, VueUiMoleculeExpose>;

export default VueUiMolecule;
export { VueUiMolecule };