import { DefineComponent } from 'vue';

export type {
    VueUiChordDataset,
    VueUiChordDatapointArc,
    VueUiChordNode,
    VueUiChordDatapointRibbon,
    VueUiChordConfig,
    VueUiChordExpose,
    VueUiChordEvent
} from "./vue-data-ui";

declare const VueUiChord: DefineComponent<{
    config?: VueUiChordConfig;
    dataset: VueUiChordDataset
}, VueUiChordExpose>;

export default VueUiChord;
export { VueUiChord };