import type { DefineComponent, VNodeChild } from 'vue';

import type {
    VueUiCarouselTableDataset,
    VueUiCarouselTableConfig,
    VueUiCarouselTableProps,
    VueUiMenuIconSlotProps,
    VueUiCarouselTableOptionAnimationSlotProps,
    VueUiCarouselTableThSlotProps,
    VueUiCarouselTableTdSlotProps,
    VueUiCarouselTableEmits,
    VueUiCarouselTableEmitCopyAlt,
} from 'vue-data-ui';

export type {
    VueUiCarouselTableDataset,
    VueUiCarouselTableConfig,
    VueUiCarouselTableProps,
    VueUiMenuIconSlotProps,
    VueUiCarouselTableOptionAnimationSlotProps,
    VueUiCarouselTableThSlotProps,
    VueUiCarouselTableTdSlotProps,
    VueUiCarouselTableEmits,
    VueUiCarouselTableEmitCopyAlt,
};

declare const VueUiCarouselTableBase: DefineComponent<
    VueUiCarouselTableProps,
    {},
    {},
    {},
    {},
    {},
    {},
    VueUiCarouselTableEmits
>;

export const VueUiCarouselTable: typeof VueUiCarouselTableBase & {
    new (): {
        $slots: {
            ['custom-menu-before']?: () => VNodeChild;
            ['custom-menu-after']?: () => VNodeChild;
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
