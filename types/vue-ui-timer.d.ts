import type { DefineComponent, VNodeChild } from 'vue';

import type {
    VueUiTimerConfig,
    VueUiTimerProps,
    VueUiTimerExpose,
    VueUiTimerTimeSlotProps,
    VueUiTimerControlsSlotProps,
    VueUiTimerLapsSlotProps,
} from 'vue-data-ui';

export type {
    VueUiTimerConfig,
    VueUiTimerProps,
    VueUiTimerExpose,
    VueUiTimerTimeSlotProps,
    VueUiTimerControlsSlotProps,
    VueUiTimerLapsSlotProps,
};

declare const VueUiTimerBase: DefineComponent<VueUiTimerProps>;

export const VueUiTimer: typeof VueUiTimerBase & {
    new (): VueUiTimerExpose & {
        $slots: {
            ['chart-background']?: () => VNodeChild;
            time?: (props: VueUiTimerTimeSlotProps) => VNodeChild;
            timeSvg?: (props: VueUiTimerTimeSlotProps) => VNodeChild;
            controls?: (props: VueUiTimerControlsSlotProps) => VNodeChild;
            laps?: (props: VueUiTimerLapsSlotProps) => VNodeChild;
        };
    };
};

export default VueUiTimer;
export { VueUiTimer };
