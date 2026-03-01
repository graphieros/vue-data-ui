    //--------------------------------------------------------------------------------------------//

    /**
    * UTILITY FUNCTION TYPES
    * 
    * IMPORTANT: these types are duplicated in vue-data-ui.d.ts  for the legacy import to work.
    * If we ever ship a v4 these types can be forcefully removed from vue-data-ui.ts, with
    * a breaking change.
    */

    //--------------------------------------------------------------------------------------------//
    
    /** 
     * Configuration options for cumulative functions 
    */
    export type CumulativeConfig = {
        /** 
         * If `true`, invalid inputs are kept (and echoed) in the output. 
         * Defaults to `true`. 
         */
        keepInvalid?: boolean;
        /** 
         * If `true`, invalid inputs are treated as zero when computing the statistic. 
         * Defaults to `false`. 
         */
        convertInvalidToZero?: boolean;
    }

    /**
     * Vue Data UI utility
     * ---
     * Compute the cumulative median of a sequence, optionally echoing or zero-filling invalid inputs.
     * ---
    * @example
    * ```js
    * // Simple usage
    * const arr = [1, 2, 3, 4, 5];
    * const medians = getCumulativeMedian({ values: arr });
    *
    * // Ignore invalid values entirely
    * const arrWithInvalid = [1, null, 2, Infinity, undefined];
    * const mediansNoInvalid = getCumulativeMedian({
    *   values: arrWithInvalid,
    *   config: { keepInvalid: false }
    * });
    *
    * // Convert invalid values to zero
    * const mediansZeroed = getCumulativeMedian({
    *   values: arrWithInvalid,
    *   config: { convertInvalidToZero: true }
    * });
    * ```
    * 
    * @param {Object} params
    * @param {Array<number|*>} params.values
    *   The input sequence. Can include numbers or any “invalid” placeholders.
    * @param {CumulativeConfig} [params.config]
    *   Configuration flags to control handling of invalid inputs.
    * @returns {Array<number|*>}
    *   An array where each slot is either the cumulative median up to that point,
    *   or the original invalid value if `keepInvalid` is `true`.
    */
    export function getCumulativeMedian<T = unknown>(params: {
        values: Array<number | T>;
        config?: CumulativeConfig;
    }): Array<number | T>;

    /**
     * Vue Data UI utility
     * ---
     * Compute the cumulative median of a sequence, optionally echoing or zero-filling invalid inputs.
     * ---
     * @example
     * ```js
     * // Simple usage
     * const arr = [1, 2, 3, 4, 5];
     * const medians = getCumulativeMedian({ values: arr });
     *
     * // Ignore invalid values entirely
     * const arrWithInvalid = [1, null, 2, Infinity, undefined];
     * const mediansNoInvalid = getCumulativeMedian({
     *   values: arrWithInvalid,
     *   config: { keepInvalid: false }
     * });
     *
     * // Convert invalid values to zero
     * const mediansZeroed = getCumulativeMedian({
     *   values: arrWithInvalid,
     *   config: { convertInvalidToZero: true }
     * });
     * ```
     *
     * @param {Object} params
     * @param {Array<number|*>} params.values
     *   The input sequence. Can include numbers or any “invalid” placeholders.
     * @param {CumulativeConfig} [params.config]
     *   Configuration flags to control handling of invalid inputs.
     * @returns {Array<number|*>}
     *   An array where each slot is either the cumulative median up to that point,
     *   or the original invalid value if `keepInvalid` is `true`.
     */
    export function getCumulativeAverage<T = unknown>(params: {
        values: Array<number | T>;
        config?: CumulativeConfig;
    }): Array<number | T>;

    /**
     * Recursively makes all properties in T optional.
     * - Leaves functions as-is
     * - Handles arrays by making their item type DeepPartial
     */
    export type DeepPartial<T> =
        T extends Function
        ? T
        : T extends Array<infer U>
        ? Array<DeepPartial<U>>
        : T extends object
        ? { [K in keyof T]?: DeepPartial<T[K]> }
        : T;

    /**
     * Vue Data UI utility
     * ---
     * Merge a partial config with a full default config
     * ---
     * @example
     * const defaultConfig = getVueDataUiConfig('vue_ui_xy');
     * const merged = mergeConfigs({
     *      defaultConfig,
     *      userConfig: {
     *          chart: {
     *              backgroundColor: '#FF0000'
     *          }
     *      }
     * })
     */
    export function mergeConfigs<T extends Record<string, any>>({
        defaultConfig,
        userConfig,
    }: {
        defaultConfig: T;
        userConfig: DeepPartial<T>;
    }
    ): T;

    /**
     * Vue Data UI utility
     * ---
     * Generate a straight line path to include in the d attribute of a svg path element 
     * ___
     * @example
     * const path = createStraightPath([{x: 1, y: 1}, { x: 2, y: 1.2}])
     *
     * @param points - An array of point objects
     */
    export const createStraightPath: (points: Point[]) => string

    /**
     * Vue Data UI utility
     * ---
     * Generate a spline path to include in the d attribute of a svg path element 
     * ___
     * @example
     * const path = createSmoothPath([{x: 1, y: 1}, { x: 2, y: 1.2}, { x: 3, y: 0.2 }])
     *
     * @param points - An array of point objects
     */
    export const createSmoothPath: (points: Point[]) => string


    /**
     * Vue Data UI utility
     * ---
     * Create a dataset for VueUiWordCloud from a string
     * ___
     * @example
     * const dataset = createWordCloudDatasetFromPlainText('Lorem Ipsum Dolor', (w) => w.toUpperCase())
     *
     * @param text - The text from which the dataset will be generated
     * @param callback - Optional transform callback to format each word of the dataset
     */
    export const createWordCloudDatasetFromPlainText: (
        text: string,
        callback?: VueDataUiWordCloudTransformCallback
    ) => VueUiWordCloudDatasetItem[];

    export type VueDataUiAbbreviatePayload = {
        source: string;
        length?: number;
    };

    /**
     * Vue Data UI utility
     * ---
     * Abbreviate a string to a given length
     * ___
     * @example
     * const label = abbreviate({
     *  source: 'Lorem Ipsum Dolor',
     *  length: 3
     * })
     *
     * @param source - The string to abbreviate
     * @param length - The number of letters to return (defaults to 3)
     */
    export const abbreviate: (payload: VueDataUiAbbreviatePayload) => string;

    /**
     * Vue Data UI utility
     * ---
     * Get the color palette for a given theme
     * ___
     * @example
     * const palette = getPalette("hack");
     *
     * @param theme - The theme for which the palette is requested (e.g., "hack" | "zen", | "concrete")
     */
    export const getPalette: (theme: Theme) => string[];

    export type VueDataUiGetConfigOptions = {
        colorBackground?: string;
        colorTextPrimary?: string;
        colorTextSecondary?: string;
        colorGrid?: string;
        colorBorder?: string;
    };

    /**
     * Vue Data UI utility
     * ---
     * Get the default config for a given component
     * ___
     * @typeParam T - The config type for the component
     * @param key - Component key in snake_case (e.g. `"vue_ui_xy"`).
     * @param options - Optional general color settings
     * @returns The default configuration of type `T`.
     * @example
     * ```ts
     * const defaultConfig = getVueDataUiConfig<VueUiXyConfig>("vue_ui_xy");
     * ```
     */
    export const getVueDataUiConfig: <T>(key: VueDataUiConfigKey, options?: VueDataUiGetConfigOptions) => T;

    /**
     * Vue Data UI utility
     * ---
     * Lightens a color by a specified strength.
     * ___
     * @example
     * const color = lightenColor("#FF0000", 0.25);
     * const color = lightenColor("#FF000080", 0.25);
     * const color = lightenColor("rgb(255,0,0)", 0.25);
     * const color = lightenColor("rgb(255,0,0,0.5)", 0.25);
     * const color = lightenColor("red", 0.25);
     *
     * @param color - The input color. Can be hexadecimal (e.g., "#FF0000", or "#FF000080" with alpha channel), RGB or RGBA, or a named color.
     * @param strength - The strength to lighten the color, typically a value between 0 and 1.
     * @returns The lightened color in hexadecimal format.
     */
    export const lightenColor: (color: string, strength: number) => string;

    /**
     * Vue Data UI utility
     * ---
     * Darkens a color by a specified strength.
     * ___
     * @example
     * const color = darkenColor("#FF0000", 0.25);
     * const color = darkenColor("#FF000080", 0.25);
     * const color = darkenColor("rgb(255,0,0)", 0.25);
     * const color = darkenColor("rgb(255,0,0,0.5)", 0.25);
     * const color = darkenColor("red", 0.25);
     *
     * @param color - The input color. Can be hexadecimal (e.g., "#FF0000", or "#FF000080" with alpha channel), or RGB or RGBA.
     * @param strength - The strength to darken the color, typically a value between 0 and 1.
     * @returns The darkened color in hexadecimal format.
     */
    export const darkenColor: (color: string, strength: number) => string;

    /**
     * Vue Data UI utility
     * ---
     * Shifts hue for a given color, by a given strength.
     * ___
     * @example
     * const color = shiftColorHue("#FF0000", 0.25);
     * const color = shiftColorHue("#FF000080", 0.25);
     * const color = shiftColorHue("rgb(255,0,0)", 0.25);
     * const color = shiftColorHue("rgb(255,0,0,0.5)", 0.25);
     * const color = shiftColorHue("red", 0.25);
     *
     * @param color - The input color. Can be hexadecimal (e.g., "#FF0000", or "#FF000080" with alpha channel), or RGB or RGBA.
     * @param strength - The strength to darken the color, typically a value between 0 and 1.
     * @returns The shifted color in hexadecimal format.
     */
    export const shiftColorHue: (color: string, strength: number) => string;

    export type FormatSmallValueArgs = {
        value: number;
        maxDecimals?: number;
        fallbackFormatter?: (value: number) => string;
        removeTrailingZero?: boolean
    }

    /**
     * Vue Data UI utility
     * ---
     * Formats numeric values with a controlled number of decimal places,
     * applying maxDecimals for all values when no fallbackFormatter is given,
     * or calling the fallbackFormatter for values ≥ 1 if provided.
     * ___
     * @example
     * // Zero value
     * formatSmallValue({ value: 0 }); // "0"
     *
     * // Values < 1 use minimal decimals
     * formatSmallValue({ value: 0.9 }); // "0.9"
     * formatSmallValue({ value: 0.0042 }); // "0.0042"
     * formatSmallValue({ value: 0.00420001 }); // "0.0042"
     *
     * // Retain trailing zeros
     * formatSmallValue({ value: 0.9, removeTrailingZero: false }); // "0.90"
     *
     * // Values ≥ 1 without fallback apply maxDecimals
     * formatSmallValue({ value: 1.61803, maxDecimals: 3 }); // "1.618"
     *
     * // Values ≥ 1 with fallbackFormatter
     * formatSmallValue({ value: 2.5, fallbackFormatter: v => v.toFixed(1) }); // "2.5"
     *
     * // Negative values
     * formatSmallValue({ value: -0.056 }); // "-0.056"
     * 
     * @param {FormatSmallValueArgs} options - Configuration object for formatting.
     * @param {number} options.value                 - The numeric value to format.
     * @param {number} [options.maxDecimals=4]       - Maximum decimal places to use.
     * @param {(value: number) => string} [options.fallbackFormatter] - Formatter for values ≥ 1.
     * @param {boolean} [options.removeTrailingZero=true] - Whether to strip unnecessary trailing zeros.
     * @returns {string} The formatted number as a string.
     */
    export const formatSmallValue: ({
        value,
        maxDecimals,
        fallbackFormatter,
        removeTrailingZero
    }: FormatSmallValueArgs) => string

    export type CreateTSpansArgs = {
        content: string;
        fontSize: number;
        fill: string;
        maxWords: number;
        x: number;
        y: number;
    }

    /**
     * Vue Data UI utility
     * ---
     * Creates TSpan elements from a string to break text into multiple lines.
     * The output should be placed with `v-html` inside an SVG `<text>` element.
     * ___
     * @example
     * const textContent = createTSpans({
     *   content: "This is an example of multiline text",
     *   fontSize: 16,
     *   fill: "#1A1A1A",
     *   maxWords: 3, // Will create lines of 3 words max
     *   x: 10,
     *   y: 20
     * });
     * 
     * // Usage: <text :x="10" :y="20" fill="#1A1A1A" :font-size="16" v-html="textContent"/>
     * 
     * @param {Object} args - The arguments object.
     * @param {string} args.content - The text content to be split into lines.
     * @param {number} args.fontSize - The font size used to determine line spacing.
     * @param {string} args.fill - The fill color for the text.
     * @param {number} args.maxWords - Maximum number of words per line.
     * @param {number} args.x - The x-coordinate for each `tspan` element.
     * @param {number} args.y - The starting y-coordinate for the first `tspan`.
     * 
     * @returns {string} A string containing the HTML content to be placed with `v-html` inside an SVG `<text>` element.
    */
    export const createTSpans: ({
        content,
        fontSize,
        fill,
        maxWords,
        x,
        y
    }: CreateTSpansArgs) => string;

    /**
     * Vue Data UI composable
     * ---
     * Flattens a reactive config object into computed refs for every leaf property.
     * 
     * @template T extends object
     * @param configRef  A Vue `Ref` holding your object.
     * @param options    Optional settings: `delimiter` (default `"."`) and `skipArrays` (default `true`).
     * @returns         An object with flatten config as refs
     * 
     * ___
     * @example
     * 
     * ```js
     *   import { useObjectBindings } from "vue-data-ui";
     *
     *   const config = ref({
     *     customPalette: ["#CCCCCC", "#1A1A1A"],
     *     style: {
     *       chart: {
     *         backgroundColor: "#FFFFFF",
     *         color: "#1A1A1A",
     *       },
     *     },
     *   });
     * 
     *   const bindings = useObjectBindings(config);
     * ```
     * 
     * Then in your template:
     * ```html
     *   <template>
     *     <div>
     *       <input type="color" v-model="bindings['style.chart.backgroundColor']" />
     *     </div>
     *   </template>
     * ```
     */
    export function useObjectBindings(
        configRef: Ref<Record<string, any>>,
        options?: {
            delimiter?: string
            skipArrays?: boolean
        }
    ): Record<string, Ref<any>>;

    /**
     * Vue Data UI utility
     * ---
     * Applies a two-stage data correction pipeline to a numeric time series.
     * ---
     *
     * The correction is performed in sequence:
     *
     * 1. Bidirectional Moving Average:
     *    Reduces local noise by blending trailing (left-anchored) and leading
     *    (right-anchored) averages. This ensures smooth transitions from both
     *    fixed endpoints while preserving the first and last values.
     *
     * 2. Forward-Backward Exponential Smoothing (Zero-Phase):
     *    Further smooths the signal without introducing phase lag. A forward
     *    and backward exponential pass are blended to preserve trend timing
     *    and avoid temporal shift artifacts.
     *
     * This utility is designed for visual data refinement,
     * where smoothness is required without distorting boundary values
     * or shifting peaks and transitions.
     *
     * @param {Array<{ value: number | null }>} data
     *   The ordered dataset to correct. Each item must contain a numeric `value`.
     *
     * @param {{ averageWindow: number, smoothingTau: number }} settings
     *   Configuration object:
     *   - `averageWindow`: Half-window size for the moving average.
     *     `0` disables the moving average stage.
     *   - `smoothingTau`: Time constant controlling smoothing strength.
     *     `0` disables the smoothing stage. Higher values produce smoother output.
     *
     * @returns {Array<{ value: number | null }>}
     *   A new array with corrected values. The original input array is not mutated.
     */
    export function applyDataCorrection(
        data: Array<{ value: number | null}>, 
        settings: { 
            averageWindow: number, 
            smoothingTau: number }
    ): Array<{ value: number | null }>;