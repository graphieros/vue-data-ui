const SharedCanvas = {
    canvas: null,
    ctx: null,
};

function getShared2dContext() {
    if (typeof document === "undefined") {
        throw new Error("color-utils: document is not available (browser-only).");
    }

    if (!SharedCanvas.canvas) {
        const canvas = document.createElement("canvas");
        canvas.width = 1;
        canvas.height = 1;

        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) {
            throw new Error("color-utils: unable to get 2D canvas context.");
        }

        SharedCanvas.canvas = canvas;
        SharedCanvas.ctx = ctx;
    }

    return SharedCanvas.ctx;
}

function clampByte(value) {
    if (value < 0) return 0;
    if (value > 255) return 255;
    return Math.round(value);
}

function clampUnit(value) {
    if (value < 0) return 0;
    if (value > 1) return 1;
    return value;
}

/**
 * Convert any CSS color string to RGBA using the browser color parser.
 */
export function colorToRgba(inputColor, referenceElement = null) {
    if (typeof inputColor !== "string" || inputColor.trim().length === 0) {
        throw new Error("colorToRgba: inputColor must be a non-empty string.");
    }

    const trimmed = inputColor.trim();

    if (trimmed.toLowerCase() === "transparent") {
        return { red: 0, green: 0, blue: 0, alpha: 0 };
    }

    const resolvedColor = resolveCurrentColorIfNeeded(trimmed, referenceElement);

    const ctx = getShared2dContext();

    ctx.clearRect(0, 0, 1, 1);

    ctx.fillStyle = "#000";
    const before = ctx.fillStyle;

    ctx.fillStyle = resolvedColor;
    const after = ctx.fillStyle;

    if (after === before && !isColorLikelyBlack(resolvedColor)) {
        throw new Error(`colorToRgba: unsupported or invalid color "${inputColor}".`);
    }

    ctx.fillRect(0, 0, 1, 1);
    const pixel = ctx.getImageData(0, 0, 1, 1).data;

    return {
        red: pixel[0],
        green: pixel[1],
        blue: pixel[2],
        alpha: pixel[3] / 255,
    };
}

export function colorsToRgba(colors, referenceElement = null) {
    if (!Array.isArray(colors) || colors.length === 0) {
        throw new Error("colorsToRgba: colors must be a non-empty array.");
    }

    const output = new Array(colors.length);
    for (let i = 0; i < colors.length; i += 1) {
        output[i] = colorToRgba(colors[i], referenceElement);
    }
    return output;
}

export function rgbaToCssRgba(color, alphaDecimals = 4) {
    const alpha =
        Math.round(clampUnit(color.alpha) * Math.pow(10, alphaDecimals)) /
        Math.pow(10, alphaDecimals);

    return `rgba(${clampByte(color.red)}, ${clampByte(color.green)}, ${clampByte(color.blue)}, ${alpha})`;
}

export function rgbaToCss(color, alphaDecimals = 4) {
    if (color.alpha >= 1) {
        return `#${toTwoDigitHex(clampByte(color.red))}${toTwoDigitHex(clampByte(color.green))}${toTwoDigitHex(clampByte(color.blue))}`;
    }
    return rgbaToCssRgba(color, alphaDecimals);
}

function toTwoDigitHex(value) {
    const hex = clampByte(value).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
}

function resolveCurrentColorIfNeeded(inputColor, referenceElement = null) {
    if (inputColor !== "currentColor") return inputColor;

    if (typeof window === "undefined" || !referenceElement) return inputColor;

    const computed = window.getComputedStyle(referenceElement);
    return computed.color || inputColor;
}

function isColorLikelyBlack(colorString) {
    const c = colorString.trim().toLowerCase();
    return (
        c === "black" ||
        c === "#000" ||
        c === "#000000" ||
        c === "rgb(0, 0, 0)" ||
        c === "rgba(0, 0, 0, 1)" ||
        c === "rgba(0, 0, 0, 0)"
    );
}

/**
 * Convert a single sRGB channel value (0–255) to linear RGB space (0–1).
 *
 * @param channelByte sRGB channel value in the range 0–255.
 * @returns Linear RGB channel value in the range 0–1.
 */
export function srgbChannelToLinear(channelByte) {
    const normalized = clampUnit(channelByte / 255);
    if (normalized <= 0.04045) return normalized / 12.92;
    return Math.pow((normalized + 0.055) / 1.055, 2.4);
}

/**
 * Convert a single linear RGB channel value (0–1) to sRGB byte space (0–255).
 *
 * @param channel Linear RGB channel value in the range 0–1.
 * @returns sRGB channel value as an integer in the range 0–255.
 */
export function linearChannelToSrgb(channel) {
    const clamped = clampUnit(channel);
    let srgb;
    if (clamped <= 0.0031308) srgb = clamped * 12.92;
    else srgb = 1.055 * Math.pow(clamped, 1 / 2.4) - 0.055;
    return clampByte(srgb * 255);
}

/**
 * Linearly interpolate between two RGBA colors.
 *
 * Interpolation behavior depends on `colorSpace`:
 * - "srgb": interpolates channels directly in sRGB byte space
 * - "linearRGB": converts channels to linear RGB, interpolates, then converts back to sRGB
 *
 * Alpha is always interpolated linearly.
 *
 * @param from Starting color in RGBA (0–255 RGB, 0–1 alpha).
 * @param to Ending color in RGBA (0–255 RGB, 0–1 alpha).
 * @param t Interpolation factor (typically in [0, 1]).
 * @param colorSpace Color interpolation space ("srgb" | "linearRGB").
 * @returns Interpolated RGBA color.
 */
export function interpolateRgbaColor(
    from,
    to,
    t,
    colorSpace
) {
    const tt = clampUnit(t);

    if (colorSpace === "linearRGB") {
        const fromR = srgbChannelToLinear(from.red);
        const fromG = srgbChannelToLinear(from.green);
        const fromB = srgbChannelToLinear(from.blue);

        const toR = srgbChannelToLinear(to.red);
        const toG = srgbChannelToLinear(to.green);
        const toB = srgbChannelToLinear(to.blue);

        const mixedR = fromR + (toR - fromR) * tt;
        const mixedG = fromG + (toG - fromG) * tt;
        const mixedB = fromB + (toB - fromB) * tt;

        return {
            red: linearChannelToSrgb(mixedR),
            green: linearChannelToSrgb(mixedG),
            blue: linearChannelToSrgb(mixedB),
            alpha: from.alpha + (to.alpha - from.alpha) * tt,
        };
    }

    return {
        red: from.red + (to.red - from.red) * tt,
        green: from.green + (to.green - from.green) * tt,
        blue: from.blue + (to.blue - from.blue) * tt,
        alpha: from.alpha + (to.alpha - from.alpha) * tt,
    };
}

/**
 * Interpolate between two CSS colors and return a CSS color string suitable for SVG output.
 *
 * This uses the browser color parser via `colorToRgba`, then interpolates in the requested
 * color space, and outputs a compact CSS string using `rgbaToCss`.
 *
 * @param fromColor Any CSS color string.
 * @param toColor Any CSS color string.
 * @param t Interpolation factor (typically in [0, 1]).
 * @param colorSpace Color interpolation space ("srgb" | "linearRGB").
 * @param referenceElement Optional reference element used to resolve `currentColor`.
 * @returns A CSS color string (`#rrggbb` or `rgba(...)`).
 */
export function interpolateCssColors(
    fromColor,
    toColor,
    t,
    colorSpace,
    referenceElement = null
) {
    const fromRgba = colorToRgba(fromColor, referenceElement);
    const toRgba = colorToRgba(toColor, referenceElement);
    const mixed = interpolateRgbaColor(fromRgba, toRgba, t, colorSpace);
    return rgbaToCss(mixed);
}
