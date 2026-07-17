//--------------------------------------------------------------------------------------------//

/**
 * COMPOSABLES TYPES
 *
 * IMPORTANT: these types are duplicated in vue-data-ui.d.ts for the legacy import to work.
 * If we ever ship a v4 these types can be forcefully removed from vue-data-ui.ts, with
 * a breaking change.
 */

//--------------------------------------------------------------------------------------------//

import type { ComputedRef } from 'vue';

import type { TooltipPosition } from 'vue-data-ui';
export type { TooltipPosition };

export type TooltipPositionTargetElement =
    | Element
    | {
          readonly $el?: unknown;
      };

export type TooltipPositionTargetValue =
    | TooltipPositionTargetElement
    | null
    | undefined;

/**
 * Structurally compatible with Ref, ShallowRef, ComputedRef and useTemplateRef.
 *
 * This deliberately does not extend Vue's Ref type because Ref contains a
 * private unique-symbol brand that can become incompatible when multiple Vue
 * type resolutions are present.
 */
export type TooltipPositionTargetRef<T = TooltipPositionTargetValue> = {
    readonly value: T;
};

export type TooltipPositionTarget<T = TooltipPositionTargetValue> =
    | T
    | TooltipPositionTargetRef<T>
    | (() => T);

/**
 * Vue Data UI composable
 * ---
 * Returns a dynamic tooltip position based on the mouse position inside a chart element.
 * ---
 * This value can be passed to vue-data-ui component configurations using the
 * `tooltip.position` attribute.
 *
 * @param chartRef - A Vue ref, shallow ref, computed ref, readonly template ref,
 * getter, raw Element, Vue component instance, or object exposing `$el`.
 * @returns A computed tooltip position: `"center"` when the mouse is outside the element,
 * `"left"` when the mouse is on the right side of the element, otherwise `"right"`.
 */
export declare function useTooltipPosition<T>(
    chartRef: TooltipPositionTarget<T>,
): ComputedRef<TooltipPosition>;
