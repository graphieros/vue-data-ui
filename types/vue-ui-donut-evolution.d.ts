import { DefineComponent } from 'vue';

export type { 
    VueUiDonutEvolutionDatapoint,
    VueUiDonutEvolutionConfig,
    VueUiDonutEvolutionDatasetItem,
    VueUiDonutEvolutionExpose,
    VueUiDonutEvolutionEvent
} from "./vue-data-ui";

declare const VueUiDonutEvolution: DefineComponent<{
    config?: VueUiDonutEvolutionConfig;
    dataset: VueUiDonutEvolutionDatasetItem[];
}, VueUiDonutEvolutionExpose>;

export default VueUiDonutEvolution;
export { VueUiDonutEvolution };