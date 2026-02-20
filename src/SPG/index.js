import { colorsToRgba, interpolateRgbaColor } from "./color-utils";
import { clampNumber, formatNumber, inverseLerp, parseOptionalNumber, roundNumber, toTwoDigitHex } from "./number-utils";

const XMLNS = "http://www.w3.org/2000/svg";
let sharedHiddenSvg = null;
let sharedHiddenPath = null;

function createOffscreenPathForJob(pathData) {
    if (typeof document === "undefined") {
        throw new Error("SvgPathGradientAsync: document is not available (browser-only implementation).");
    }

    const svgElement = document.createElementNS(XMLNS, "svg");
    svgElement.setAttribute("width", "0");
    svgElement.setAttribute("height", "0");
    svgElement.setAttribute("viewBox", "0 0 0 0");
    svgElement.style.position = "absolute";
    svgElement.style.left = "-10000px";
    svgElement.style.top = "-10000px";
    svgElement.style.visibility = "hidden";
    svgElement.style.pointerEvents = "none";

    const pathElement = document.createElementNS(XMLNS, "path");

    if (pathData === "M ") pathData = "M 0,0";
    pathElement.setAttribute("d", pathData);

    svgElement.appendChild(pathElement);
    document.body.appendChild(svgElement);

    return { svgElement, pathElement };
}

function destroyOffscreenPathForJob(handle) {
    if (!handle) return;
    try {
        handle.svgElement?.remove?.();
    } catch {
        // ignore
    }
}


const gradientCache = new Map();
let globalJobId = 0;

function makeCacheKey(pathData, colors, options) {
    const mode = options.temperatureMode ?? "none";
    const seg = options.segments ?? "auto";
    const tol = options.flattenTolerance ?? 0.25;
    const sw =
        options.strokeWidth ??
        parseOptionalNumber((options.attrs ?? {})["stroke-width"]) ??
        1;

    const cs = options.colorSpace ?? "linearRGB";
    const tc = mode !== "none" ? (options.temperatureColors ?? []) : colors ?? [];
    const colorSig = Array.isArray(tc) ? tc.join("|") : String(tc);

    return `${mode}#${cs}#${seg}#${tol}#${sw}#${colorSig}#${pathData}`;
}

function getOrCreateCacheEntry(key) {
    if (!gradientCache.has(key)) {
        gradientCache.set(key, { value: "", computing: false, jobId: 0 });
    }
    return gradientCache.get(key);
}

/**
 * Generate a "true-looking" gradient stroke along an SVG path as pure SVG markup.
 *
 * SVG does not support a stroke gradient defined in the 1D parameter space of a path (by arc length).
 * This function approximates an along-path gradient by:
 * - Measuring the path length in the browser (`getTotalLength`, `getPointAtLength`)
 * - Splitting the path into many short straight subpaths (polyline segments)
 * - Assigning each subpath a solid `stroke` color sampled from the gradient at its arc-length position
 * - Optionally overlapping adjacent segments to hide rasterization seams
 *
 * The return value is a `<g>...</g>` string containing `<path>` elements that can be injected directly
 * inside an `<svg>` element.
 *
 * Important behavior / constraints:
 * - This is a browser-only implementation (requires `document`, SVG geometry APIs, and canvas color parsing).
 * - Because the output uses many `<path>` nodes, very large segment counts may impact DOM/render performance.
 * - `stroke-dasharray` and `stroke-dashoffset` are applied per generated segment; dash continuity across the
 *   entire original path is not preserved.
 *
 * @param pathData SVG path `d` attribute (supports all commands supported by the browser).
 * @param colors Array of colors defining the gradient stops, evenly distributed from 0 to 1.
 *               Any CSS color format supported by the browser is accepted (hex/rgb/hsl/named, etc.).
 * @param options Configuration for segmentation, sampling, color interpolation, and SVG attributes.
 * @param options.segments Fixed number of generated segments. If omitted, it is derived from `maxSegmentLength`.
 * @param options.maxSegmentLength Maximum segment length in user units used to compute a segment count when
 *                                 `segments` is omitted.
 * @param options.flattenTolerance Sampling step in user units used when approximating each segment with a polyline.
 *                                 Lower values increase quality but also increase CPU time and output size.
 * @param options.colorSpace Color interpolation space: `"srgb"` or `"linearRGB"` (default `"linearRGB"`).
 * @param options.overlap Overlap length (in arc-length units) added at segment boundaries to reduce visible seams.
 *                        Defaults to `strokeWidth * 0.5`, clamped to avoid dominating short segments.
 * @param options.strokeWidth Stroke width used only to compute defaults (overlap/maxSegmentLength) if not provided.
 *                            If `attrs["stroke-width"]` exists it is used as a fallback.
 * @param options.attrs Attributes applied to every generated `<path>` (for example `stroke-width`, `opacity`,
 *                      `stroke-linecap`, `stroke-linejoin`). `stroke` is overwritten per segment.
 * @param options.groupAttrs Attributes applied to the wrapping `<g>` element.
 * @param options.decimalPlaces Rounding precision for generated coordinates. Lower values reduce output size.
 * @param options.samplePointLimitPerSegment Safety limit for the maximum number of sampled points per segment.
 * @param options.colorReferenceElement Optional reference element used to resolve `currentColor` when converting
 *                                      input colors to RGBA.
 *
 * @returns A string containing a `<g data-svg-path-gradient="true">...</g>` with `<path>` children.
 *
 * @throws If `pathData` is empty or not a string.
 * @throws If `colors` is empty.
 * @throws If executed outside a browser environment (no `document`).
 */
function SvgPathGradient(pathData, colors = null, options = {}) {
    if (!pathData || typeof pathData !== "string") {
        throw new Error("SvgPathGradient: pathData must be a non-empty string.");
    }
    
    const temperatureMode = options.temperatureMode ?? null;

    if (temperatureMode === null) {
        if (!Array.isArray(colors) || colors.length === 0) {
            throw new Error("SvgPathGradient: colors must be a non-empty array when temperatureMode is not enabled.");
        }
    }

    const returnMode = options.returnMode ?? "string";

    const decimalPlaces = typeof options.decimalPlaces === "number" ? options.decimalPlaces : 3;
    const flattenTolerance =
        typeof options.flattenTolerance === "number" && options.flattenTolerance > 0 ? options.flattenTolerance : 0.25;

    const segmentAttributeMap = options.attrs ? { ...options.attrs } : {};
    const groupAttributeMap = options.groupAttrs ? { ...options.groupAttrs } : {};

    const strokeWidthFromAttributes = parseOptionalNumber(segmentAttributeMap["stroke-width"]);
    const strokeWidth =
        typeof options.strokeWidth === "number" && options.strokeWidth > 0
            ? options.strokeWidth
            : typeof strokeWidthFromAttributes === "number" && strokeWidthFromAttributes > 0
                ? strokeWidthFromAttributes
                : 1;

    const svgPathElement = getSharedOffscreenPath(pathData);
    const totalLength = svgPathElement.getTotalLength();

    const rgbaStopsInput =
    temperatureMode === null
        ? colorsToRgba(colors, options.colorReferenceElement)
        : [];

    if (temperatureMode === null && !(totalLength > 0)) {
        const stroke = normalizeOutputColor(rgbaStopsInput[0]);

        if (returnMode === "dom") {
            if (typeof document === "undefined") {
                throw new Error("SvgPathGradient: document is not available (browser-only implementation).");
            }

            const group = createGroupNode(groupAttributeMap);
            const pathNode = createPathNodeFromSharedAttributes(pathData, stroke, segmentAttributeMap);
            group.appendChild(pathNode);

            return { group, segments: [pathNode] };
        }

        return wrapGroup(
            [
                buildPathElementString({
                    pathData,
                    stroke,
                    segmentAttributeMap,
                }),
            ],
            groupAttributeMap
        );
    }

    if (temperatureMode === null && rgbaStopsInput.length === 1) {
        const stroke = normalizeOutputColor(rgbaStopsInput[0]);

        if (returnMode === "dom") {
            if (typeof document === "undefined") {
                throw new Error("SvgPathGradient: document is not available (browser-only implementation).");
            }

            const group = createGroupNode(groupAttributeMap);
            const pathNode = createPathNodeFromSharedAttributes(pathData, stroke, segmentAttributeMap);
            group.appendChild(pathNode);

            return { group, segments: [pathNode] };
        }

        return wrapGroup(
            [
                buildPathElementString({
                    pathData,
                    stroke,
                    segmentAttributeMap,
                }),
            ],
            groupAttributeMap
        );
    }

    const colorSpace = options.colorSpace ?? "linearRGB";

    if (temperatureMode !== null) {
        const tc = options.temperatureColors;
        if (!Array.isArray(tc) || tc.length !== 2) {
            throw new Error('SvgPathGradient: temperatureColors must be a tuple of exactly 2 colors when temperatureMode is enabled.');
        }
    }

    const temperatureRgbaStops =
        temperatureMode !== null
            ? (colorsToRgba(options.temperatureColors, options.colorReferenceElement))
            : null;

    const gradientStops =
    temperatureMode === null
        ? (() => {
                const evenStops = buildEvenStops(rgbaStopsInput);
                const stops = new Array(evenStops.length);
                for (let i = 0; i < evenStops.length; i += 1) {
                    stops[i] = { position: evenStops[i].position, rgba: evenStops[i].rgba };
                }
                return stops;
            })()
        : [];

    const maxSegmentLength = computeMaxSegmentLength(totalLength, strokeWidth, options.maxSegmentLength);
    const segmentCount = computeSegmentCount(totalLength, options.segments, maxSegmentLength);
    const baseSegmentLength = totalLength / segmentCount;

    let overlapLength =
        typeof options.overlap === "number" && options.overlap >= 0 ? options.overlap : strokeWidth * 0.5;

    const maximumAllowedOverlap = baseSegmentLength * 0.45;
    if (overlapLength > maximumAllowedOverlap) overlapLength = maximumAllowedOverlap;

    const samplePointLimitPerSegment =
        typeof options.samplePointLimitPerSegment === "number" && options.samplePointLimitPerSegment > 10
            ? options.samplePointLimitPerSegment
            : 250;

    const sharedSegmentAttributesString = buildSharedSegmentAttributesString(segmentAttributeMap);

    const segmentPathStrings = returnMode === "string" ? new Array(segmentCount) : [];
    const segmentNodes = returnMode === "dom" ? new Array(segmentCount) : [];
    let producedCount = 0;

    const temperatureSegmentPathData = temperatureMode !== null ? new Array(segmentCount) : null;
    const temperatureSegmentBounds = temperatureMode !== null ? new Array(segmentCount) : null;

    let stopIndex = 0;
    const lastStopIndex = temperatureMode === null ? gradientStops.length - 2 : 0;

    for (let segmentIndex = 0; segmentIndex < segmentCount; segmentIndex += 1) {
        const rawStartLength = segmentIndex * baseSegmentLength;
        const rawEndLength = (segmentIndex + 1) * baseSegmentLength;

        let startLength = rawStartLength;
        let endLength = rawEndLength;

        if (segmentIndex !== 0) startLength = rawStartLength - overlapLength;
        if (segmentIndex !== segmentCount - 1) endLength = rawEndLength + overlapLength;

        startLength = clampNumber(startLength, 0, totalLength);
        endLength = clampNumber(endLength, 0, totalLength);

        if (!(endLength > startLength)) continue;

        if (temperatureMode !== null) {
            const sampled = buildSegmentPathDataFromArcLengthSamplingWithBounds(
                svgPathElement,
                startLength,
                endLength,
                flattenTolerance,
                decimalPlaces,
                samplePointLimitPerSegment
            );

            temperatureSegmentPathData[producedCount] = sampled.pathData;
            temperatureSegmentBounds[producedCount] = sampled.bounds;
            producedCount += 1;
            continue;
        }

        const midpointLength = (startLength + endLength) * 0.5;
        const gradientPosition = midpointLength / totalLength;

        while (stopIndex < lastStopIndex && gradientPosition > gradientStops[stopIndex + 1].position) {
            stopIndex += 1;
        }

        const strokeColor = evaluateGradientAtIndex(gradientStops, gradientPosition, colorSpace, stopIndex);

        const segmentPathData = buildSegmentPathDataFromArcLengthSampling(
            svgPathElement,
            startLength,
            endLength,
            flattenTolerance,
            decimalPlaces,
            samplePointLimitPerSegment
        );

        if (returnMode === "dom") {
            const node = createPathNodeFromSharedAttributes(segmentPathData, strokeColor, segmentAttributeMap);
            segmentNodes[producedCount] = node;
        } else {
            segmentPathStrings[producedCount] = buildPathElementStringFast(
                segmentPathData,
                strokeColor,
                sharedSegmentAttributesString
            );
        }
        producedCount += 1;
    }

    if (temperatureMode !== null) {
        if (producedCount !== temperatureSegmentPathData.length) temperatureSegmentPathData.length = producedCount;
        if (producedCount !== temperatureSegmentBounds.length) temperatureSegmentBounds.length = producedCount;

        let globalMin = Number.POSITIVE_INFINITY;
        let globalMax = Number.NEGATIVE_INFINITY;

        for (let i = 0; i < temperatureSegmentBounds.length; i += 1) {
            const b = temperatureSegmentBounds[i];
            const minCoord = temperatureMode === "vertical" ? b.minY : b.minX;
            const maxCoord = temperatureMode === "vertical" ? b.maxY : b.maxX;

            if (minCoord < globalMin) globalMin = minCoord;
            if (maxCoord > globalMax) globalMax = maxCoord;
        }

        const high = temperatureRgbaStops[0];
        const low = temperatureRgbaStops[1];

        for (let i = 0; i < temperatureSegmentBounds.length; i += 1) {
            const b = temperatureSegmentBounds[i];

            const segMin = temperatureMode === "vertical" ? b.minY : b.minX;
            const segMax = temperatureMode === "vertical" ? b.maxY : b.maxX;

            const coordValue = (segMin + segMax) * 0.5;

            const t = inverseLerp(coordValue, globalMin, globalMax, true);

            const mixed =
                temperatureMode === "vertical"
                    ? interpolateRgbaColor(high, low, t, colorSpace)
                    : interpolateRgbaColor(low, high, t, colorSpace);

            const strokeColor = normalizeOutputColor(mixed);
            const segmentPathData = temperatureSegmentPathData[i];

            if (returnMode === "dom") {
                segmentNodes[i] = createPathNodeFromSharedAttributes(segmentPathData, strokeColor, segmentAttributeMap);
            } else {
                segmentPathStrings[i] = buildPathElementStringFast(segmentPathData, strokeColor, sharedSegmentAttributesString);
            }
        }
    }

    if (returnMode === "dom") {
        if (producedCount !== segmentNodes.length) segmentNodes.length = producedCount;

        const group = createGroupNode(groupAttributeMap);
        for (let i = 0; i < segmentNodes.length; i += 1) {
            group.appendChild(segmentNodes[i]);
        }

        return { group, segments: segmentNodes };
    }

    if (producedCount !== segmentPathStrings.length) segmentPathStrings.length = producedCount;
    return wrapGroup(segmentPathStrings, groupAttributeMap);
}

/**
 * Create an SVG `<g>` element configured for gradient stroke output (DOM mode).
 *
 * - Adds a `data-svg-path-gradient="true"` marker attribute
 * - Applies all user-provided `groupAttributeMap` entries as attributes
 *
 * The marker attribute allows:
 * - Easy identification of generated gradient groups
 * - Targeted styling or cleanup
 * - Safe programmatic updates
 *
 * @param groupAttributeMap Key-value map of attributes to apply to the `<g>` element
 *                          (for example `id`, `class`, `opacity`, etc.).
 * @returns A newly created `SVGGElement` ready to receive generated segment nodes.
 */
function createGroupNode(groupAttributeMap) {
    const group = document.createElementNS(XMLNS, "g");
    group.setAttribute("data-svg-path-gradient", "true");

    const keys = Object.keys(groupAttributeMap);
    for (let i = 0; i < keys.length; i += 1) {
        const name = keys[i];
        group.setAttribute(name, groupAttributeMap[name]);
    }

    return group;
}

/**
 * Create an SVG `<path>` element for a single gradient segment (DOM mode).
 
 * - Sets the `d` attribute to the provided path data.
 * - Sets the `stroke` attribute to the computed gradient color.
 * - Ensures `fill="none"` unless explicitly provided in `segmentAttributeMap`.
 * - Copies all other attributes from `segmentAttributeMap`, except:
 *     - `d` (handled explicitly)
 *     - `stroke` (overridden per segment)
 *     - `fill` (handled explicitly with default fallback)
 *
 * This mirrors the behavior of the string-based builder, but produces
 * real DOM nodes for safer composition and direct insertion into an
 * existing `<svg>` element.
 *
 * Notes:
 * - Attributes are applied as-is; no sanitization is performed here.
 *
 * @param pathData SVG path `d` string representing this gradient segment.
 * @param stroke CSS color string computed for this segment.
 * @param segmentAttributeMap Key-value map of attributes to apply to the `<path>` element.
 * @returns A fully configured `SVGPathElement`.
 */
function createPathNodeFromSharedAttributes(pathData, stroke, segmentAttributeMap) {
    const path = document.createElementNS(XMLNS, "path");
    path.setAttribute("d", pathData);
    path.setAttribute("stroke", stroke);

    const fillValue = segmentAttributeMap.fill ?? "none";
    path.setAttribute("fill", fillValue);

    const keys = Object.keys(segmentAttributeMap);
    for (let i = 0; i < keys.length; i += 1) {
        const name = keys[i];
        if (name === "d") continue;
        if (name === "stroke") continue;
        if (name === "fill") continue;
        path.setAttribute(name, segmentAttributeMap[name]);
    }

    return path;
}

/**
 * Return a shared, offscreen SVG `<path>` element used for geometry sampling.
 *
 * This function lazily creates a hidden `<svg><path/></svg>` once, appends it to `document.body`,
 * and reuses it across calls by updating the `d` attribute with the provided `pathData`.
 *
 * Keeping the element attached avoids repeated DOM creation/teardown and improves reliability of
 * `SVGPathElement` geometry APIs (`getTotalLength`, `getPointAtLength`) across browsers.
 *
 * Notes:
 * - Browser-only: requires `document`.
 * - The hidden SVG is reused for the lifetime of the page.
 *
 * @param pathData SVG path `d` attribute to assign to the shared `<path>` element.
 * @returns The shared `SVGPathElement` with its `d` attribute set to `pathData`.
 *
 * @throws If executed outside a browser environment (no `document`).
 */
function getSharedOffscreenPath(pathData) {
    if (typeof document === "undefined") {
        throw new Error("SvgPathGradient: document is not available (browser-only implementation).");
    }

    if (!sharedHiddenSvg) {
        const svgElement = document.createElementNS(XMLNS, "svg");
        svgElement.setAttribute("width", "0");
        svgElement.setAttribute("height", "0");
        svgElement.setAttribute("viewBox", "0 0 0 0");
        svgElement.style.position = "absolute";
        svgElement.style.left = "-10000px";
        svgElement.style.top = "-10000px";
        svgElement.style.visibility = "hidden";
        svgElement.style.pointerEvents = "none";

        const pathElement = document.createElementNS(XMLNS, "path");

        svgElement.appendChild(pathElement);
        document.body.appendChild(svgElement);

        sharedHiddenSvg = svgElement;
        sharedHiddenPath = pathElement;
    }
    if (pathData === 'M ') {
        pathData = 'M 0,0';
    }
    sharedHiddenPath.setAttribute("d", pathData);
    return sharedHiddenPath ?? '';
}

/**
 * Compute the maximum arc-length of a single generated segment.
 *
 * This value is used to derive the number of segments when `options.segments`
 * is not explicitly provided. Smaller values produce more segments (higher
 * visual fidelity but larger DOM output), while larger values reduce DOM size
 * at the cost of gradient smoothness.
 *
 * Resolution strategy:
 * 1. If `providedMaxSegmentLength` is a positive number, it is returned as-is.
 * 2. Otherwise, a heuristic is applied:
 *    - Base recommendation: `strokeWidth * 0.75`
 *    - Clamped to the range `[0.5, 8]` user units
 *    - Further clamped so it never exceeds `totalLength / 2`
 *    - Guaranteed to be strictly positive
 *
 * The heuristic ties gradient resolution loosely to stroke thickness:
 * thicker strokes generally require shorter segments to avoid visible banding.
 *
 * @param totalLength Total arc-length of the original SVG path.
 * @param strokeWidth Effective stroke width (used for heuristic scaling).
 * @param providedMaxSegmentLength Optional explicit maximum segment length.
 * @returns A strictly positive maximum segment length in user units.
 */
function computeMaxSegmentLength(totalLength, strokeWidth, providedMaxSegmentLength) {
    if (typeof providedMaxSegmentLength === "number" && providedMaxSegmentLength > 0) {
        return providedMaxSegmentLength;
    }
    let recommended = strokeWidth * 0.75;
    if (recommended < 0.5) recommended = 0.5;
    if (recommended > 8) recommended = 8;
    const lengthBasedMaximum = totalLength / 2;
    if (recommended > lengthBasedMaximum && lengthBasedMaximum > 0) recommended = lengthBasedMaximum;
    if (recommended <= 0) recommended = 1;
    return recommended;
}

/**
 * Compute the number of segments used to approximate the gradient along the path.
 *
 * The segment count determines how many individual `<path>` elements will be
 * generated. Higher values increase gradient smoothness but also increase
 * DOM size and rendering cost.
 *
 * Resolution strategy:
 * 1. If `providedSegments` is defined and >= 1, it is used directly
 *    (floored to an integer).
 * 2. Otherwise, the segment count is derived from:
 *
 *        ceil(totalLength / maxSegmentLength)
 *
 *    where `maxSegmentLength` defaults to `2` user units if not valid.
 *
 * The result is always guaranteed to be at least `1`.
 *
 * @param totalLength Total arc-length of the original SVG path.
 * @param providedSegments Optional explicit segment count override.
 * @param maxSegmentLength Maximum arc-length per segment (used if `providedSegments` is not set).
 * @returns A positive integer representing the number of segments to generate.
 */
function computeSegmentCount(totalLength, providedSegments, maxSegmentLength) {
    if (typeof providedSegments === "number" && providedSegments >= 1) {
        return Math.floor(providedSegments);
    }
    const safeMaxSegmentLength = typeof maxSegmentLength === "number" && maxSegmentLength > 0 ? maxSegmentLength : 2;
    const estimated = Math.ceil(totalLength / safeMaxSegmentLength);
    return estimated < 1 ? 1 : estimated;
}

/**
 * Build a polyline path segment by sampling an existing SVG path over an arc-length range.
 *
 * This function approximates the portion of `pathElement` between `startLength`
 * and `endLength` by:
 * - Sampling evenly in arc-length space
 * - Querying `getPointAtLength` for each sample
 * - Constructing a path string using `M` (move) followed by `L` (line) commands
 *
 * The resulting string represents a straight-line approximation of the original
 * curve segment and is used to assign a single solid stroke color to that piece
 * of the gradient.
 *
 * Sampling strategy:
 * - The number of samples is derived from:
 *
 *       ceil((endLength - startLength) / samplingStep) + 1
 *
 * - It is clamped to a minimum of 2 points.
 * - It is capped by `samplePointLimit` for safety.
 * - Coordinates are rounded to `decimalPlaces` to reduce output size.
 *
 * Trade-offs:
 * - Smaller `samplingStep` → higher geometric fidelity but more CPU work and larger SVG output.
 * - Larger `samplingStep` → fewer points but more visible faceting on curved segments.
 *
 * @param pathElement SVG path element used for geometry queries.
 * @param startLength Arc-length (in user units) where the segment begins.
 * @param endLength Arc-length (in user units) where the segment ends.
 * @param samplingStep Target arc-length distance between sample points.
 * @param decimalPlaces Number of decimal places used when rounding coordinates.
 * @param samplePointLimit Maximum number of sample points allowed for this segment.
 * @returns A valid SVG path `d` string representing the sampled segment.
 */
function buildSegmentPathDataFromArcLengthSampling(
    pathElement,
    startLength,
    endLength,
    samplingStep,
    decimalPlaces,
    samplePointLimit
) {
    const segmentLength = endLength - startLength;

    let sampleCount = Math.ceil(segmentLength / samplingStep) + 1;
    if (sampleCount < 2) sampleCount = 2;
    if (sampleCount > samplePointLimit) sampleCount = samplePointLimit;

    const step = sampleCount > 1 ? segmentLength / (sampleCount - 1) : 0;

    const firstPoint = pathElement.getPointAtLength(startLength);
    let pathData = `M ${formatNumber(roundNumber(firstPoint.x, decimalPlaces))} ${formatNumber(
        roundNumber(firstPoint.y, decimalPlaces)
    )}`;

    for (let sampleIndex = 1; sampleIndex < sampleCount; sampleIndex += 1) {
        const lengthAtSample = startLength + sampleIndex * step;
        const point = pathElement.getPointAtLength(lengthAtSample);

        pathData += ` L ${formatNumber(roundNumber(point.x, decimalPlaces))} ${formatNumber(
            roundNumber(point.y, decimalPlaces)
        )}`;
    }

    return pathData;
}

/**
 * Build a polyline path segment by sampling an existing SVG path over an arc-length range,
 * while also returning bounds for the sampled points (min/max X and Y).
 *
 * This is used by "temperature" coloring modes to compute segment colors based on
 * geometric coordinates instead of arc-length gradient stops.
 *
 * @param pathElement SVG path element used for geometry queries.
 * @param startLength Arc-length (in user units) where the segment begins.
 * @param endLength Arc-length (in user units) where the segment ends.
 * @param samplingStep Target arc-length distance between sample points.
 * @param decimalPlaces Number of decimal places used when rounding coordinates.
 * @param samplePointLimit Maximum number of sample points allowed for this segment.
 * @returns An object containing the SVG path `d` string and min/max X/Y bounds for the sampled points.
 */
function buildSegmentPathDataFromArcLengthSamplingWithBounds(
    pathElement,
    startLength,
    endLength,
    samplingStep,
    decimalPlaces,
    samplePointLimit
) {
    const segmentLength = endLength - startLength;

    let sampleCount = Math.ceil(segmentLength / samplingStep) + 1;
    if (sampleCount < 2) sampleCount = 2;
    if (sampleCount > samplePointLimit) sampleCount = samplePointLimit;

    const step = sampleCount > 1 ? segmentLength / (sampleCount - 1) : 0;

    const firstPoint = pathElement.getPointAtLength(startLength);

    let minX = firstPoint.x;
    let maxX = firstPoint.x;
    let minY = firstPoint.y;
    let maxY = firstPoint.y;

    let pathData = `M ${formatNumber(roundNumber(firstPoint.x, decimalPlaces))} ${formatNumber(
        roundNumber(firstPoint.y, decimalPlaces)
    )}`;

    for (let sampleIndex = 1; sampleIndex < sampleCount; sampleIndex += 1) {
        const lengthAtSample = startLength + sampleIndex * step;
        const point = pathElement.getPointAtLength(lengthAtSample);

        if (point.x < minX) minX = point.x;
        if (point.x > maxX) maxX = point.x;
        if (point.y < minY) minY = point.y;
        if (point.y > maxY) maxY = point.y;

        pathData += ` L ${formatNumber(roundNumber(point.x, decimalPlaces))} ${formatNumber(
            roundNumber(point.y, decimalPlaces)
        )}`;
    }

    return {
        pathData,
        bounds: { minX, maxX, minY, maxY },
    };
}

/**
 * Create evenly distributed gradient stops from an ordered list of RGBA colors.
 *
 * Each color is assigned a normalized position in the range [0, 1],
 * spaced uniformly across the gradient domain.
 *
 * Position calculation:
 *
 *   position = index / (colorCount - 1)
 *
 * So:
 * - First color → position 0
 * - Last color  → position 1
 * - Intermediate colors are evenly spaced
 *
 * Special case:
 * - If only one color is provided, it is returned at position 0.
 *   (The calling code is responsible for handling the degenerate case.)
 *
 * The returned stops are intended for interpolation along arc-length
 * when computing gradient colors for path segments.
 *
 * @param rgbaColors Ordered list of RGBA colors defining the gradient.
 * @returns Array of objects containing normalized `position` and corresponding `rgba` color.
 */
function buildEvenStops(rgbaColors) {
    if (rgbaColors.length === 1) return [{ position: 0, rgba: rgbaColors[0] }];

    const stops = new Array(rgbaColors.length);
    const lastIndex = rgbaColors.length - 1;

    for (let index = 0; index < rgbaColors.length; index += 1) {
        stops[index] = { position: index / lastIndex, rgba: rgbaColors[index] };
    }
    return stops;
}

/**
 * Evaluate the gradient color at a given normalized position using a cached lower stop index.
 *
 * This function performs piecewise-linear interpolation between two adjacent
 * gradient stops and returns the resulting color as a CSS string.
 *
 * It is optimized for monotonic forward traversal of `position` values:
 * - `lowerStopIndex` is assumed to be near the correct interval.
 * - The function adjusts the index locally instead of scanning from 0.
 * - This makes the overall evaluation O(n) across all segments instead of O(n²).
 *
 * Behavior:
 * - `position` is clamped to [0, 1].
 * - The stop index is clamped to a valid range.
 * - The correct stop interval is located.
 * - The local interpolation factor `t` is computed.
 * - Colors are interpolated in either `"srgb"` or `"linearRGB"` space.
 * - The final color is normalized and returned as a CSS color string.
 *
 * @param stops Ordered gradient stops with normalized positions in [0, 1].
 * @param position Normalized gradient position to evaluate (typically arcLength / totalLength).
 * @param colorSpace Color interpolation space ("srgb" or "linearRGB").
 * @param lowerStopIndex Previously used lower stop index (used as a fast starting point).
 * @returns Interpolated color as a CSS string (hex or rgba()).
 */
function evaluateGradientAtIndex(
    stops,
    position,
    colorSpace,
    lowerStopIndex
) {
    const clampedPosition = clampNumber(position, 0, 1);

    let idx = lowerStopIndex;
    if (idx < 0) idx = 0;
    if (idx > stops.length - 2) idx = stops.length - 2;

    while (idx > 0 && clampedPosition < stops[idx].position) idx -= 1;
    while (idx < stops.length - 2 && clampedPosition > stops[idx + 1].position) idx += 1;

    const lowerStop = stops[idx];
    const upperStop = stops[idx + 1];

    const span = upperStop.position - lowerStop.position;
    const localT = span > 0 ? (clampedPosition - lowerStop.position) / span : 0;

    const interpolated = interpolateColor(lowerStop.rgba, upperStop.rgba, localT, colorSpace);
    return normalizeOutputColor(interpolated);
}

/**
 * Linearly interpolate between two RGBA colors.
 *
 * The interpolation factor `t` is clamped to the range [0, 1], where:
 * - 0 → returns `from`
 * - 1 → returns `to`
 * - values in between produce a linear blend
 *
 * Interpolation behavior depends on `colorSpace`:
 *
 * - `"srgb"`:
 *   Channels are interpolated directly in standard sRGB space.
 *   This is faster but can produce visually darker midpoints.
 *
 * - `"linearRGB"`:
 *   Channels are first converted from sRGB to linear RGB,
 *   interpolated in linear space, then converted back to sRGB.
 *   This produces perceptually more accurate gradients and smoother transitions.
 *
 * The alpha channel is always interpolated linearly (no gamma correction).
 *
 * @param from Starting color in RGBA byte format (0–255 for RGB, 0–1 for alpha).
 * @param to Ending color in RGBA byte format (0–255 for RGB, 0–1 for alpha).
 * @param t Interpolation factor (will be clamped to [0, 1]).
 * @param colorSpace Interpolation color space ("srgb" or "linearRGB").
 * @returns Interpolated color in RGBA format.
 */
function interpolateColor(from, to, t, colorSpace) {
    const clampedT = clampNumber(t, 0, 1);

    if (colorSpace === "linearRGB") {
        const fromRedLinear = srgbChannelToLinear(from.red);
        const fromGreenLinear = srgbChannelToLinear(from.green);
        const fromBlueLinear = srgbChannelToLinear(from.blue);

        const toRedLinear = srgbChannelToLinear(to.red);
        const toGreenLinear = srgbChannelToLinear(to.green);
        const toBlueLinear = srgbChannelToLinear(to.blue);

        const mixedRedLinear = fromRedLinear + (toRedLinear - fromRedLinear) * clampedT;
        const mixedGreenLinear = fromGreenLinear + (toGreenLinear - fromGreenLinear) * clampedT;
        const mixedBlueLinear = fromBlueLinear + (toBlueLinear - fromBlueLinear) * clampedT;

        return {
            red: linearChannelToSrgb(mixedRedLinear),
            green: linearChannelToSrgb(mixedGreenLinear),
            blue: linearChannelToSrgb(mixedBlueLinear),
            alpha: from.alpha + (to.alpha - from.alpha) * clampedT,
        };
    }

    return {
        red: from.red + (to.red - from.red) * clampedT,
        green: from.green + (to.green - from.green) * clampedT,
        blue: from.blue + (to.blue - from.blue) * clampedT,
        alpha: from.alpha + (to.alpha - from.alpha) * clampedT,
    };
}

/**
 * Convert a single sRGB channel value (0–255) to linear RGB space.
 *
 * This applies the standard sRGB transfer function (gamma expansion):
 *
 * - Input is first normalized to the range [0, 1].
 * - If the normalized value ≤ 0.04045:
 *       linear = normalized / 12.92
 * - Otherwise:
 *       linear = ((normalized + 0.055) / 1.055) ^ 2.4
 *
 * Linear RGB is required for physically correct color interpolation
 * because sRGB is gamma-encoded and not perceptually linear.
 *
 * @param channelByte sRGB channel value in the range 0–255.
 * @returns Linear RGB channel value in the range 0–1.
 */
function srgbChannelToLinear(channelByte) {
    const normalized = clampNumber(channelByte / 255, 0, 1);
    if (normalized <= 0.04045) return normalized / 12.92;
    return Math.pow((normalized + 0.055) / 1.055, 2.4);
}

/**
 * Convert a single linear RGB channel value (0–1) to sRGB byte space (0–255).
 *
 * This applies the standard sRGB transfer function (gamma compression):
 *
 * - Input is first clamped to the range [0, 1].
 * - If the linear value ≤ 0.0031308:
 *       srgb = linear * 12.92
 * - Otherwise:
 *       srgb = 1.055 * (linear ^ (1 / 2.4)) - 0.055
 *
 * The result is then scaled to [0, 255], rounded to the nearest integer,
 * and clamped to ensure a valid 8-bit channel value.
 *
 * Used after interpolating colors in linear RGB
 * space to convert the result back to display-ready sRGB.
 *
 * @param channel Linear RGB channel value in the range 0–1.
 * @returns sRGB channel value as an integer in the range 0–255.
 */
function linearChannelToSrgb(channel) {
    const clamped = clampNumber(channel, 0, 1);
    let srgb;
    if (clamped <= 0.0031308) srgb = clamped * 12.92;
    else srgb = 1.055 * Math.pow(clamped, 1 / 2.4) - 0.055;
    const byte = Math.round(srgb * 255);
    return clampNumber(byte, 0, 255);
}

/**
 * Convert an RGBA color object into a CSS color string suitable for SVG output.
 *
 * Behavior:
 * - RGB channels are rounded to integers and clamped to the range [0, 255].
 * - Alpha is clamped to [0, 1].
 * - If alpha is fully opaque (>= 1), the color is returned as a hex string (`#rrggbb`)
 *   to produce shorter and cleaner SVG output.
 * - If alpha is less than 1, the color is returned as an `rgba(r, g, b, a)` string,
 *   with alpha rounded to 4 decimal places.
 *
 * @param color RGBA color object (RGB expected in 0–255 range, alpha in 0–1).
 * @returns A CSS color string in either hex or rgba() format.
 */
function normalizeOutputColor(color) {
    const alphaClamped = clampNumber(color.alpha, 0, 1);

    const red = clampNumber(Math.round(color.red), 0, 255);
    const green = clampNumber(Math.round(color.green), 0, 255);
    const blue = clampNumber(Math.round(color.blue), 0, 255);

    if (alphaClamped >= 1) {
        return `#${toTwoDigitHex(red)}${toTwoDigitHex(green)}${toTwoDigitHex(blue)}`;
    }

    const alphaText = roundNumber(alphaClamped, 4).toString();
    return `rgba(${red}, ${green}, ${blue}, ${alphaText})`;
}

/**
 * Build a shared attribute string for all generated segment `<path>` elements,
 * to reduce repeated work when generating many segments by computing
 * the static portion of the attribute string once.
 *
 * This function serializes user-provided SVG attributes into a reusable
 * string fragment that can be appended to each generated `<path>`.
 *
 * Behavior:
 * - Ensures `fill="none"` is present unless the user explicitly provides a `fill` value.
 * - Excludes `stroke` because stroke color is assigned per segment.
 * - Excludes `d` because the path data is generated dynamically per segment.
 * - Escapes all attribute values to ensure valid and safe SVG output.
 *
 * @param segmentAttributeMap Key-value map of SVG attributes provided by the user.
 * @returns A serialized attribute string (without leading/trailing spaces)
 *          ready to be injected into a `<path>` element.
 */
function buildSharedSegmentAttributesString(segmentAttributeMap) {
    const fillValue = segmentAttributeMap.fill ?? "none";

    let output = `fill="${escapeAttribute(fillValue)}"`;

    const keys = Object.keys(segmentAttributeMap);
    for (let i = 0; i < keys.length; i += 1) {
        const attributeName = keys[i];
        if (attributeName === "stroke") continue;
        if (attributeName === "d") continue;
        const attributeValue = segmentAttributeMap[attributeName];
        output += ` ${attributeName}="${escapeAttribute(attributeValue)}"`;
    }

    return output;
}

/**
 * Build a serialized `<path>` SVG element string using precomputed attributes,
 * to avoid object iteration and repeated string construction,
 * making it more efficient than the generic path builder when generating
 * hundreds or thousands of segments.
 *
 * This is a performance-oriented helper used when generating many gradient
 * segments. Instead of rebuilding the full attribute list for each segment,
 * it:
 *
 * - Injects the segment-specific `d` attribute
 * - Injects the segment-specific `stroke` color
 * - Reuses a precomputed `sharedAttributes` string for all other attributes
 *
 * All dynamic values are escaped to ensure valid and safe SVG output.
 *
 * @param pathData SVG path `d` string for this segment.
 * @param stroke CSS color string assigned to this segment.
 * @param sharedAttributes Prebuilt attribute string (excluding `d` and `stroke`).
 * @returns A complete `<path ... />` element string ready for injection into SVG.
 */
function buildPathElementStringFast(pathData, stroke, sharedAttributes) {
    return `<path d="${escapeAttribute(pathData)}" stroke="${escapeAttribute(stroke)}" ${sharedAttributes} />`;
}

/**
 * Build a serialized `<path>` SVG element string from a full attribute map.
 *
 * This is the generic (non-optimized) path builder used when attributes
 * must be assembled dynamically for a single segment.
 *
 * Behavior:
 * - Ensures `fill="none"` is applied unless explicitly provided.
 * - Applies the provided `stroke` color (overrides any user-provided stroke).
 * - Copies all other attributes from `segmentAttributeMap`, except:
 *     - `stroke` (handled explicitly)
 *     - `d` (generated dynamically)
 * - Escapes all attribute values to ensure valid and safe SVG output.
 *
 * @param input Object containing:
 *  - `pathData`: SVG path `d` string
 *  - `stroke`: CSS stroke color string
 *  - `segmentAttributeMap`: attribute key-value map for the segment
 *
 * @returns A complete `<path ... />` SVG element string.
 */
function buildPathElementString(input) {
    const attributePairs = [];
    const fillValue = input.segmentAttributeMap.fill ?? "none";
    attributePairs.push(`fill="${escapeAttribute(fillValue)}"`);
    attributePairs.push(`stroke="${escapeAttribute(input.stroke)}"`);

    for (const attributeName of Object.keys(input.segmentAttributeMap)) {
        if (attributeName === "stroke") continue;
        if (attributeName === "d") continue;
        const attributeValue = input.segmentAttributeMap[attributeName];
        attributePairs.push(`${attributeName}="${escapeAttribute(attributeValue)}"`);
    }

    return `<path d="${escapeAttribute(input.pathData)}" ${attributePairs.join(" ")} />`;
}

/**
 * Wrap generated path segment strings inside a `<g>` SVG group element.
 *
 * - Serializes user-provided group-level attributes
 * - Escapes attribute values for safe SVG output
 * - Adds a `data-svg-path-gradient="true"` marker attribute
 * - Concatenates all generated `<path>` (and optional cap) strings inside the group
 *
 * The marker attribute can be used to:
 * - Identify gradient-generated groups in the DOM
 * - Apply scoped styling
 * - Perform selective cleanup or updates
 *
 * @param pathElementStrings Array of serialized SVG element strings (typically `<path>` and optional `<circle>` caps).
 * @param groupAttributeMap Key-value map of attributes to apply to the wrapping `<g>` element.
 * @returns A complete `<g>...</g>` SVG string ready to be injected into an `<svg>` element.
 */
function wrapGroup(pathElementStrings, groupAttributeMap) {
    const groupAttributePairs = [];
    for (const attributeName of Object.keys(groupAttributeMap)) {
        groupAttributePairs.push(`${attributeName}="${escapeAttribute(groupAttributeMap[attributeName])}"`);
    }
    const groupAttributes = groupAttributePairs.length ? " " + groupAttributePairs.join(" ") : "";
    return `<g data-svg-path-gradient="true"${groupAttributes}>${pathElementStrings.join("")}</g>`;
}

/**
 * Escape special characters for safe use inside an SVG/HTML attribute value.
 *
 * Escaped characters:
 * - `&` → `&amp;`
 * - `"` → `&quot;`
 * - `<` → `&lt;`
 * - `>` → `&gt;`
 *
 * This is required when dynamically generating SVG strings to ensure:
 * - Valid XML structure
 * - Protection against accidental attribute breaking
 * - Safer string-based SVG generation
 *
 * Note:
 * - This function assumes the value will be placed inside double quotes.
 * - It does not perform full HTML sanitization, only minimal attribute escaping.
 *
 * @param value Raw attribute value.
 * @returns Escaped string safe for inclusion in a quoted attribute.
 */
function escapeAttribute(value) {
    return String(value).replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function SvgPathGradientAsync(pathData, colors = null, options = {}) {
    return new Promise((resolve, reject) => {
        let jobHandle = null;

        try {
            if (!pathData || typeof pathData !== "string") {
                throw new Error("SvgPathGradientAsync: pathData must be a non-empty string.");
            }

            const temperatureMode = options.temperatureMode ?? null;

            if (temperatureMode === null) {
                if (!Array.isArray(colors) || colors.length === 0) {
                    throw new Error("SvgPathGradientAsync: colors must be a non-empty array when temperatureMode is not enabled.");
                }
            }

            const returnMode = options.returnMode ?? "string";
            if (returnMode !== "string") {
                throw new Error('SvgPathGradientAsync: only returnMode="string" is supported for the async version.');
            }

            const decimalPlaces = typeof options.decimalPlaces === "number" ? options.decimalPlaces : 3;
            const flattenTolerance =
                typeof options.flattenTolerance === "number" && options.flattenTolerance > 0 ? options.flattenTolerance : 0.25;

            const segmentAttributeMap = options.attrs ? { ...options.attrs } : {};
            const groupAttributeMap = options.groupAttrs ? { ...options.groupAttrs } : {};

            const strokeWidthFromAttributes = parseOptionalNumber(segmentAttributeMap["stroke-width"]);
            const strokeWidth =
                typeof options.strokeWidth === "number" && options.strokeWidth > 0
                    ? options.strokeWidth
                    : typeof strokeWidthFromAttributes === "number" && strokeWidthFromAttributes > 0
                        ? strokeWidthFromAttributes
                        : 1;

            // IMPORTANT: per-job path element (no shared mutation across frames)
            jobHandle = createOffscreenPathForJob(pathData);
            const svgPathElement = jobHandle.pathElement;

            const totalLength = svgPathElement.getTotalLength();

            const rgbaStopsInput =
                temperatureMode === null
                    ? colorsToRgba(colors, options.colorReferenceElement)
                    : [];

            // Degenerate / single-color: resolve immediately.
            if (temperatureMode === null && (!(totalLength > 0) || rgbaStopsInput.length === 1)) {
                const stroke = normalizeOutputColor(rgbaStopsInput[0]);
                const out = wrapGroup(
                    [
                        buildPathElementString({
                            pathData,
                            stroke,
                            segmentAttributeMap,
                        }),
                    ],
                    groupAttributeMap
                );
                destroyOffscreenPathForJob(jobHandle);
                resolve(out);
                return;
            }

            const colorSpace = options.colorSpace ?? "linearRGB";

            if (temperatureMode !== null) {
                const tc = options.temperatureColors;
                if (!Array.isArray(tc) || tc.length !== 2) {
                    throw new Error("SvgPathGradientAsync: temperatureColors must be a tuple of exactly 2 colors when temperatureMode is enabled.");
                }
            }

            const temperatureRgbaStops =
                temperatureMode !== null
                    ? colorsToRgba(options.temperatureColors, options.colorReferenceElement)
                    : null;

            const gradientStops =
                temperatureMode === null
                    ? (() => {
                        const evenStops = buildEvenStops(rgbaStopsInput);
                        const stops = new Array(evenStops.length);
                        for (let i = 0; i < evenStops.length; i += 1) {
                            stops[i] = { position: evenStops[i].position, rgba: evenStops[i].rgba };
                        }
                        return stops;
                    })()
                    : [];

            const maxSegmentLength = computeMaxSegmentLength(totalLength, strokeWidth, options.maxSegmentLength);
            const segmentCount = computeSegmentCount(totalLength, options.segments, maxSegmentLength);
            const baseSegmentLength = totalLength / segmentCount;

            let overlapLength =
                typeof options.overlap === "number" && options.overlap >= 0 ? options.overlap : strokeWidth * 0.5;

            const maximumAllowedOverlap = baseSegmentLength * 0.45;
            if (overlapLength > maximumAllowedOverlap) overlapLength = maximumAllowedOverlap;

            const samplePointLimitPerSegment =
                typeof options.samplePointLimitPerSegment === "number" && options.samplePointLimitPerSegment > 10
                    ? options.samplePointLimitPerSegment
                    : 250;

            const sharedSegmentAttributesString = buildSharedSegmentAttributesString(segmentAttributeMap);

            // Build everything in memory; publish once.
            const segmentPathStrings = [];
            const temperatureSegmentPathData = temperatureMode !== null ? [] : null;
            const temperatureSegmentBounds = temperatureMode !== null ? [] : null;

            let stopIndex = 0;
            const lastStopIndex = temperatureMode === null ? gradientStops.length - 2 : 0;

            let segmentIndex = 0;

            const step = () => {
    // Dynamic per-frame budget (ms). Keep below ~16ms for 60fps.
    // 6–10ms is a good range to leave time for Vue/layout/paint.
    const frameStart = performance.now();
    const frameBudget = typeof options.frameBudgetMs === "number" ? options.frameBudgetMs : 8;

    // Process as many segments as we can within the budget.
    while (segmentIndex < segmentCount && (performance.now() - frameStart) < frameBudget) {
        const rawStartLength = segmentIndex * baseSegmentLength;
        const rawEndLength = (segmentIndex + 1) * baseSegmentLength;

        let startLength = rawStartLength;
        let endLength = rawEndLength;

        if (segmentIndex !== 0) startLength = rawStartLength - overlapLength;
        if (segmentIndex !== segmentCount - 1) endLength = rawEndLength + overlapLength;

        startLength = clampNumber(startLength, 0, totalLength);
        endLength = clampNumber(endLength, 0, totalLength);

        if (endLength > startLength) {
            if (temperatureMode !== null) {
                const sampled = buildSegmentPathDataFromArcLengthSamplingWithBounds(
                    svgPathElement,
                    startLength,
                    endLength,
                    flattenTolerance,
                    decimalPlaces,
                    samplePointLimitPerSegment
                );
                temperatureSegmentPathData.push(sampled.pathData);
                temperatureSegmentBounds.push(sampled.bounds);
            } else {
                const midpointLength = (startLength + endLength) * 0.5;
                const gradientPosition = midpointLength / totalLength;

                while (stopIndex < lastStopIndex && gradientPosition > gradientStops[stopIndex + 1].position) {
                    stopIndex += 1;
                }

                const strokeColor = evaluateGradientAtIndex(
                    gradientStops,
                    gradientPosition,
                    colorSpace,
                    stopIndex
                );

                const segmentPathData = buildSegmentPathDataFromArcLengthSampling(
                    svgPathElement,
                    startLength,
                    endLength,
                    flattenTolerance,
                    decimalPlaces,
                    samplePointLimitPerSegment
                );

                segmentPathStrings.push(
                    buildPathElementStringFast(segmentPathData, strokeColor, sharedSegmentAttributesString)
                );
            }
        }

        segmentIndex += 1;
    }

    // Not finished: schedule next frame.
    if (segmentIndex < segmentCount) {
        requestAnimationFrame(step);
        return;
    }

    // Temperature second pass: compute colors once all bounds exist.
    if (temperatureMode !== null) {
        let globalMin = Number.POSITIVE_INFINITY;
        let globalMax = Number.NEGATIVE_INFINITY;

        for (let i = 0; i < temperatureSegmentBounds.length; i += 1) {
            const b = temperatureSegmentBounds[i];
            const minCoord = temperatureMode === "vertical" ? b.minY : b.minX;
            const maxCoord = temperatureMode === "vertical" ? b.maxY : b.maxX;
            if (minCoord < globalMin) globalMin = minCoord;
            if (maxCoord > globalMax) globalMax = maxCoord;
        }

        const high = temperatureRgbaStops[0];
        const low = temperatureRgbaStops[1];

        segmentPathStrings.length = 0;

        for (let i = 0; i < temperatureSegmentBounds.length; i += 1) {
            const b = temperatureSegmentBounds[i];
            const segMin = temperatureMode === "vertical" ? b.minY : b.minX;
            const segMax = temperatureMode === "vertical" ? b.maxY : b.maxX;
            const coordValue = (segMin + segMax) * 0.5;

            const t = inverseLerp(coordValue, globalMin, globalMax, true);

            const mixed =
                temperatureMode === "vertical"
                    ? interpolateRgbaColor(high, low, t, colorSpace)
                    : interpolateRgbaColor(low, high, t, colorSpace);

            const strokeColor = normalizeOutputColor(mixed);
            const segmentPathData = temperatureSegmentPathData[i];

            segmentPathStrings.push(
                buildPathElementStringFast(segmentPathData, strokeColor, sharedSegmentAttributesString)
            );
        }
    }

    const out = wrapGroup(segmentPathStrings, groupAttributeMap);
    destroyOffscreenPathForJob(jobHandle);
    resolve(out);
};


            requestAnimationFrame(step);
        } catch (e) {
            destroyOffscreenPathForJob(jobHandle);
            reject(e);
        }
    });
}


export { SvgPathGradient, SvgPathGradientAsync };
