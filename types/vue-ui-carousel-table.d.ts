import { DefineComponent } from 'vue';

export type {
    VueUiCarouselTableDataset,
    VueUiCarouselTableConfig,
} from "./vue-data-ui";

declare const VueUiCarouselTable: DefineComponent<{
    config?: VueUiCarouselTableConfig;
    dataset: VueUiCarouselTableDataset;
}>;

export default VueUiCarouselTable;
export { VueUiCarouselTable };