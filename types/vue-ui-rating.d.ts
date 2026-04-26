import type { DefineComponent, VNodeChild } from 'vue';

import type {
    VueUiRatingDatasetDetailed,
    VueUiRatingDataset,
    VueUiRatingConfig,
    VueUiRatingProps,
    VueUiRatingLayerSlotProps,
} from 'vue-data-ui';

export type {
    VueUiRatingDatasetDetailed,
    VueUiRatingDataset,
    VueUiRatingConfig,
    VueUiRatingProps,
    VueUiRatingLayerSlotProps,
};

declare const VueUiRatingBase: DefineComponent<VueUiRatingProps>;

export const VueUiRating: typeof VueUiRatingBase & {
    new (): {
        $slots: {
            ['layer-under']?: (props: VueUiRatingLayerSlotProps) => VNodeChild;
            ['layer-above']?: (props: VueUiRatingLayerSlotProps) => VNodeChild;
        };
    };
};

export default VueUiRating;
export { VueUiRating };
