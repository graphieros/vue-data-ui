import type { DefineComponent } from 'vue';

import type { VueUiSkeletonConfig } from 'vue-data-ui';
export type { VueUiSkeletonConfig };

declare const VueUiSkeleton: DefineComponent<{
    config?: VueUiSkeletonConfig;
}>;

export default VueUiSkeleton;
export { VueUiSkeleton };
