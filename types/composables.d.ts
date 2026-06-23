//--------------------------------------------------------------------------------------------//

/**
 * COMPOSABLES TYPES
 *
 * IMPORTANT: these types are duplicated in vue-data-ui.d.ts  for the legacy import to work.
 * If we ever ship a v4 these types can be forcefully removed from vue-data-ui.ts, with
 * a breaking change.
 */

//--------------------------------------------------------------------------------------------//

import type { ComputedRef, MaybeRefOrGetter } from 'vue';

import type { TooltipPosition } from 'vue-data-ui';
export type { TooltipPosition };

export type TooltipPositionTargetElement =
    | HTMLElement
    | {
          $el?: HTMLElement | null;
      };

export type TooltipPositionTarget = MaybeRefOrGetter<
    TooltipPositionTargetElement | null | undefined
>;

/**
 * Vue Data UI composable
 * ---
 * Returns a dynamic tooltip position based on the mouse position inside a chart element.
 * ---
 * This value can be passed to vue-data-ui component configurations using the
 * `tooltip.position` attribute.
 *
 * @param chartRef - A Vue ref, computed ref, getter, raw `HTMLElement`, Vue component instance,
 * or object exposing a `$el` element used as the chart container.
 * @returns A computed tooltip position: `"center"` when the mouse is outside the element,
 * `"left"` when the mouse is on the right side of the element, otherwise `"right"`.
 */
export declare function useTooltipPosition(
    chartRef: TooltipPositionTarget,
): ComputedRef<TooltipPosition>;
