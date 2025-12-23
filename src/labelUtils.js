import { parens } from "./lib";

/**
 * Builds a formatted label string composed of a value and | or a percentage.
 *
 * The output order and formatting are controlled through the config object.
 * Parentheses can be applied to the value and | or the percentage.
 *
 * @function buildValuePercentageLabel
 *
 * @param {Object} params
 * @param {Object} [params.config]
 * @param {boolean} [params.config.useValueParens=false]
 *        Whether the value should be wrapped in parentheses.
 * @param {boolean} [params.config.usePercentageParens=true]
 *        Whether the percentage should be wrapped in parentheses.
 * @param {boolean} [params.config.showValueFirst=true]
 *        Whether the value should be displayed before the percentage.
 *
 * @param {string|number} params.val
 *        The value to display.
 * @param {string|number} params.percentage
 *        The percentage to display.
 * @param {boolean} params.showVal
 *        Whether the value should be included in the label.
 * @param {boolean} params.showPercentage
 *        Whether the percentage should be included in the label.
 *
 * @returns {string}
 * A formatted label string, or an empty string if neither value nor percentage
 * should be displayed.
 */
export function buildValuePercentageLabel({
    config = {
        useValueParens: false,
        usePercentageParens: true,
        showValueFirst: true,
    },
    val,
    percentage,
    showVal = true,
    showPercentage = true,
}) {
    if (!showVal && !showPercentage) return '';

    const bits = {
        value: config.useValueParens ? parens(val) : val,
        percentage: config.usePercentageParens ? parens(percentage) : percentage,
    };

    if (showVal && showPercentage) {
        return config.showValueFirst
            ? `${bits.value} ${bits.percentage}`
            : `${bits.percentage} ${bits.value}`;
    }

    if (showVal) return bits.value;
    if (showPercentage) return bits.percentage;

    return '';
}

export function fillLabel({
    rounding,
    num,
    filler = '-'
}) {
    return num.toFixed(rounding).split('').map(_ => filler).join('');
}

const labelUtils = {
    buildValuePercentageLabel,
    fillLabel
}

export default labelUtils;