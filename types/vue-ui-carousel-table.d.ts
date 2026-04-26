import type { DefineComponent, VNodeChild } from 'vue';

import type {
    VueUiCarouselTableDataset,
    VueUiCarouselTableConfig,
    VueUiCarouselTableProps,
    VueUiMenuIconSlotProps,
    VueUiCarouselTableOptionAnimationSlotProps,
    VueUiCarouselTableThSlotProps,
    VueUiCarouselTableTdSlotProps,
} from 'vue-data-ui';

export type {
    VueUiCarouselTableDataset,
    VueUiCarouselTableConfig,
    VueUiCarouselTableProps,
    VueUiMenuIconSlotProps,
    VueUiCarouselTableOptionAnimationSlotProps,
    VueUiCarouselTableThSlotProps,
    VueUiCarouselTableTdSlotProps,
};

declare const VueUiCarouselTableBase: DefineComponent<VueUiCarouselTableProps>;

export const VueUiCarouselTable: typeof VueUiCarouselTableBase & {
    new (): {
        $slots: {
            menuIcon?: (props: VueUiMenuIconSlotProps) => VNodeChild;
            optionPdf?: () => VNodeChild;
            optionCsv?: () => VNodeChild;
            optionImg?: () => VNodeChild;
            optionAnimation?: (
                props: VueUiCarouselTableOptionAnimationSlotProps,
            ) => VNodeChild;
            optionAltCopy?: () => VNodeChild;
            source?: () => VNodeChild;
            th?: (props: VueUiCarouselTableThSlotProps) => VNodeChild;
            td?: (props: VueUiCarouselTableTdSlotProps) => VNodeChild;
        };
    };
};

export default VueUiCarouselTable;
export { VueUiCarouselTable };
