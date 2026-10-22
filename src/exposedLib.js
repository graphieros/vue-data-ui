import {
    calcAverage,
    calcMedian,
    convertColorToHex,
    darkenHexColor,
    lightenHexColor,
    shiftHue,
    treeShake,
} from './lib';

/**
 * Lightens a CSS color after normalizing it to hexadecimal.
 * @param {string} color - Input CSS color.
 * @param {number} strength - Adjustment passed to the underlying color helper.
 * @returns {string} Adjusted hexadecimal color.
 */
export function lightenColor(color, strength) {
    const hexColor = convertColorToHex(color);
    return lightenHexColor(hexColor, strength);
}

/**
 * Darkens a CSS color after normalizing it to hexadecimal.
 * @param {string} color - Input CSS color.
 * @param {number} strength - Adjustment passed to the underlying color helper.
 * @returns {string} Adjusted hexadecimal color.
 */
export function darkenColor(color, strength) {
    const hexColor = convertColorToHex(color);
    return darkenHexColor(hexColor, strength);
}

/**
 * Shifts a CSS color hue after normalizing it to hexadecimal.
 * @param {string} color - Input CSS color.
 * @param {number} strength - Adjustment passed to the underlying color helper.
 * @returns {string} Adjusted hexadecimal color.
 */
export function shiftColorHue(color, strength) {
    const hexColor = convertColorToHex(color);
    return shiftHue(hexColor, strength);
}

/**
 * Merges user overrides into the supported keys of a default configuration.
 * @param {object} options - Configuration layers.
 * @param {object} options.defaultConfig - Defines the supported configuration shape.
 * @param {object} options.userConfig - Overrides to merge.
 * @returns {object} Merged configuration.
 */
export function mergeConfigs({ defaultConfig, userConfig }) {
    return treeShake({ defaultConfig, userConfig });
}

/**
 * Calculates the arithmetic mean of finite numeric entries without mutating the input.
 * @param {unknown[]} arr - Values to aggregate; non-finite entries are ignored.
 * @returns {number | null} Result, or null when no finite numbers are available.
 */
export function average(arr) {
    return calcAverage(arr);
}

/**
 * Calculates the median of finite numeric entries without mutating the input.
 * @param {unknown[]} arr - Values to aggregate; non-finite entries are ignored.
 * @returns {number | null} Result, or null when no finite numbers are available.
 */
export function median(arr) {
    return calcMedian(arr);
}

const exposedLib = {
    average,
    darkenColor,
    lightenColor,
    median,
    mergeConfigs,
    shiftColorHue,
};

export default exposedLib;
