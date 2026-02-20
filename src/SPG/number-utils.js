export function clampNumber(value, minimum, maximum) {
    let clamped = value;
    if (clamped < minimum) clamped = minimum;
    if (clamped > maximum) clamped = maximum;
    return clamped;
}

export function roundNumber(value, decimalPlaces) {
    const multiplier = Math.pow(10, decimalPlaces);
    return Math.round(value * multiplier) / multiplier;
}

export function formatNumber(value) {
    return Number.isFinite(value) ? value.toString() : "0";
}

export function toTwoDigitHex(value) {
    const clamped = clampNumber(value, 0, 255);
    const hex = clamped.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
}

export function parseOptionalNumber(value) {
    if (typeof value !== "string") return undefined;
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : undefined;
}

/**
 * Map a value within a range to a normalized interpolation factor.
 *
 * - Returns 0 when `value <= minimum` (when clamped).
 * - Returns 1 when `value >= maximum` (when clamped).
 * - Returns a linear ratio otherwise.
 *
 * If `minimum === maximum`, this returns 0 to avoid division by zero.
 *
 * @param value The value to normalize.
 * @param minimum The lower bound of the range.
 * @param maximum The upper bound of the range.
 * @param clamp Whether to clamp the result to the range [0, 1]. Defaults to true.
 * @returns A number typically in the range [0, 1] when clamped.
 */
export function inverseLerp(value, minimum, maximum, clamp = true) {
    const span = maximum - minimum;
    if (span === 0) return 0;
    const t = (value - minimum) / span;
    return clamp ? clampNumber(t, 0, 1) : t;
}