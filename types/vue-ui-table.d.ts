import type { DefineComponent } from 'vue';

import type {
    VueUiTableDatasetHeaderItem,
    VueUiTableDatasetBodyItem,
    VueUiTableDataset,
    VueUiTableConfig,
    VueUiTablePageChangeEvent,
    VueUiTableEmits,
    VueUiTableEmitPageChange,
} from 'vue-data-ui';

export type {
    VueUiTableDatasetHeaderItem,
    VueUiTableDatasetBodyItem,
    VueUiTableDataset,
    VueUiTableConfig,
    VueUiTablePageChangeEvent,
    VueUiTableEmits,
    VueUiTableEmitPageChange,
};

declare const VueUiTable: DefineComponent<
    {
        config?: VueUiTableConfig;
        dataset: VueUiTableDataset;
    },
    {},
    {},
    {},
    {},
    {},
    {},
    VueUiTableEmits
>;

export default VueUiTable;
export { VueUiTable };
