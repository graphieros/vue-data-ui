import { DefineComponent } from 'vue';

export type { 
    VueUiTableDatasetHeaderItem,
    VueUiTableDatasetBodyItem,
    VueUiTableDataset,
    VueUiTableConfig,
    VueUiTablePageChangeEvent
} from "./vue-data-ui";

declare const VueUiTable: DefineComponent<{
    config?: VueUiTableConfig;
    dataset: VueUiTableDataset;
}>;

export default VueUiTable;
export { VueUiTable }