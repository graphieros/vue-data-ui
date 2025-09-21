import { DefineComponent } from 'vue';

export type { 
    VueUiSkeletonConfig
} from "./vue-data-ui";

declare const VueUiSkeleton: DefineComponent<{
    config?: VueUiSkeletonConfig;
}>;

export default VueUiSkeleton;
export { VueUiSkeleton }