import type { DefineComponent } from 'vue';

import type {
    VueUiTableDatasetHeaderItem,
    VueUiTableDatasetBodyItem,
    VueUiTableDataset,
    VueUiTableConfig,
    VueUiTablePageChangeEvent,
} from 'vue-data-ui';

export type {
    VueUiTableDatasetHeaderItem,
    VueUiTableDatasetBodyItem,
    VueUiTableDataset,
    VueUiTableConfig,
    VueUiTablePageChangeEvent,
};

declare const VueUiTable: DefineComponent<{
    config?: VueUiTableConfig;
    dataset: VueUiTableDataset;
}>;

export default VueUiTable;
export { VueUiTable };
