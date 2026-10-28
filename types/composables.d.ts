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

/** A plain value, Vue ref, computed ref, template ref, or getter. */
export type ParentSizeValue<T> = T | { readonly value: T } | (() => T);

export type ParentSizeOptions = {
    /** Multiplier applied after adding offsets. Defaults to 1. */
    scale?: ParentSizeValue<number>;
    /** Width adjustment before scaling. Defaults to 0. */
    offsetWidth?: ParentSizeValue<number>;
    /** Height adjustment before scaling. Defaults to 0. */
    offsetHeight?: ParentSizeValue<number>;
    /** Maximum final width after offsets and scaling. Defaults to viewport width. */
    maxWidth?: ParentSizeValue<number>;
    /** Maximum final height after offsets and scaling. Defaults to viewport height. */
    maxHeight?: ParentSizeValue<number>;
    /** Track parent resizes. Defaults to true. */
    observe?: ParentSizeValue<boolean>;
};

export type ParentSize = {
    height: ComputedRef<number | undefined>;
    width: ComputedRef<number | undefined>;
    stop: () => void;
};

/**
 * Vue Data UI composable
 * ---
 * Returns dynamic parent dimensions, calculated as `(size + offset) * scale`
 * and capped at the maximum width and height (viewport dimensions by default).
 * ---
 * These values can be passed to vue-data-ui component configurations using the
 * `.width` and `.height` attributes.
 *
 * Call during setup with a template ref to measure after mounting and disconnect
 * automatically on scope disposal. Outside an active Vue scope or component
 * lifecycle hook, call `stop()` manually.
 *
 * @param element - A Vue ref, shallow ref, computed ref, readonly template ref,
 * getter, raw HTMLElement, null, or undefined. Its parent is measured.
 * @param options - Scale (default: 1), width and height offsets (default: 0),
 * resize observation (default: true), and maximum width and height (default: viewport).
 * Each option accepts a value, ref, or getter. Invalid or negative maximums fall back
 * to viewport dimensions. During SSR, no viewport limit is applied.
 * @returns Computed `width` and `height` values, or undefined dimensions when no
 * parent exists, and a `stop` function to stop tracking changes.
 */
export declare function useParentSize(
    element: ParentSizeValue<HTMLElement | null | undefined>,
    options?: ParentSizeOptions,
): ParentSize;
