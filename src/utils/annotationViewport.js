/**
 * Affine mapping from an annotation's stored coordinate to root SVG units.
 * Projection uses `origin + coordinate * unit`; capture uses its inverse.
 * A negative unit reverses the axis, as with upward-increasing SVG value axes.
 *
 * @typedef {object} AnnotationAxisMapping
 * @property {number} origin - Root SVG position corresponding to coordinate zero.
 * @property {number} unit - Nonzero root SVG units per stored coordinate unit.
 */

/**
 * Rectangle expressed in root SVG coordinates.
 *
 * @typedef {object} AnnotationClip
 * @property {number} x - Left edge.
 * @property {number} y - Top edge.
 * @property {number} width - Rectangle width.
 * @property {number} height - Rectangle height.
 */

/**
 * Optional visual transform applied after projecting an annotation's anchor.
 * This moves the anchor with an animated plot without scaling its geometry.
 *
 * @typedef {object} AnnotationMotion
 * @property {number} scaleX - Horizontal anchor-position multiplier.
 * @property {number} scaleY - Vertical anchor-position multiplier.
 * @property {number} translateX - Horizontal translation in root SVG units.
 * @property {number} translateY - Vertical translation in root SVG units.
 * @property {string} transition - CSS transition used by the annotation shape.
 */

/**
 * Coordinate system consumed by PenAndPaper and the annotation anchor helpers.
 * The x and y mappings always describe physical SVG axes, even when category
 * and value axes are swapped for a horizontal chart.
 *
 * @typedef {object} AnnotationViewport
 * @property {AnnotationAxisMapping} x - Horizontal coordinate mapping.
 * @property {AnnotationAxisMapping} y - Vertical coordinate mapping.
 * @property {AnnotationClip} clip - Visible annotation bounds in root SVG units.
 * @property {{x: number, y: number}} [shapeScale] - Current viewBox dimensions.
 * Anchor capture stores these dimensions; projection uses the ratio between
 * current and captured dimensions to compensate for viewBox zoom around the
 * anchor, keeping the annotation's displayed geometry size unchanged.
 * @property {AnnotationMotion|null} [motion] - Optional animated anchor transform.
 */

/**
 * Creates an annotation viewport for a chart zoomed by changing its SVG viewBox.
 *
 * Shapes already use chart coordinates, so both axis mappings are identities.
 * Panning is handled by the SVG viewBox itself. Its dimensions supply the
 * reference for per-shape zoom compensation, and its rectangle clips drawings
 * to the visible chart. No viewBox object is retained or mutated.
 *
 * @param {boolean} enabled - Whether annotations should follow pan and zoom.
 * @param {AnnotationClip|null|undefined} viewBox - Current SVG viewBox. All four
 * values must be finite numbers, and width and height must be positive.
 * @returns {AnnotationViewport|null} Identity mappings, geometry compensation
 * dimensions and clipping bounds; null when disabled or the viewBox is invalid.
 */
export function createPanZoomAnnotationViewport(enabled, viewBox) {
    if (!enabled || !viewBox) return null;
    const { x, y, width, height } = viewBox;
    if (
        ![x, y, width, height].every(Number.isFinite) ||
        width <= 0 ||
        height <= 0
    )
        return null;
    return {
        x: { origin: 0, unit: 1 },
        y: { origin: 0, unit: 1 },
        shapeScale: { x: width, y: height },
        clip: { x, y, width, height },
    };
}

/**
 * Rendered value-axis tick used to recover the plot's affine value mapping.
 *
 * @typedef {object} AnnotationViewportTick
 * @property {number} value - Numeric value represented by the tick.
 * @property {number} [y] - Root SVG y position for a vertical chart.
 * @property {number} [horizontal_x] - Root SVG x position for a horizontal chart.
 */

/**
 * Creates data-space annotation mappings for a categorical chart's committed
 * zoom range. Category coordinates are absolute indices, not visible-window
 * indices. The range end is exclusive, so its difference from start is the
 * visible category count. Off-screen coordinates are projected without clamping;
 * the returned clip rectangle controls their visibility.
 *
 * @param {object} options - Plot geometry and committed range.
 * @param {boolean} options.enabled - Whether annotation anchoring is enabled.
 * @param {{left: number, top: number, bottom: number, width: number, height: number}|null|undefined} options.area
 * Plot bounds in root SVG units. Width and height must be positive.
 * @param {{start: number|string, end: number|string}|null|undefined} options.range
 * Absolute category bounds. Bounds are converted to numbers before projection.
 * @param {AnnotationViewportTick[]} [options.ticks=[]] - Rendered value-axis
 * ticks. Entries with nonfinite values or relevant SVG positions are ignored.
 * @param {boolean} [options.middle=true] - Use centered category slots; false
 * places the first and last categories at the plot edges when count exceeds one.
 * @param {boolean} [options.horizontal=false] - Map categories to SVG y and
 * values to SVG x, using each tick's horizontal_x instead of y.
 * @param {AnnotationMotion|null} [options.motion=null] - Optional visual motion
 * applied by the anchor projector after the returned axis mappings.
 * @returns {AnnotationViewport|null} Axis mappings, clipping bounds and motion;
 * null when disabled, geometry or range is absent, the category span or plot
 * dimensions are nonpositive, or a computed mapping contains nonfinite values.
 */
export function createAnnotationViewport({
    enabled,
    area,
    range,
    ticks = [],
    middle = true,
    horizontal = false,
    motion = null,
}) {
    if (!enabled || !area || !range) return null;
    const count = Number(range.end) - Number(range.start);
    if (!(count > 0) || !(area.width > 0) || !(area.height > 0)) return null;
    const length = horizontal ? area.height : area.width;
    const start = horizontal ? area.top : area.left;
    const unit = length / (middle ? count : Math.max(1, count - 1));
    const category = {
        origin:
            start +
            (middle || count === 1 ? length / count / 2 : 0) -
            Number(range.start) * unit,
        unit,
    };
    const coordinate = horizontal ? 'horizontal_x' : 'y';
    const validTicks = ticks.filter(
        (tick) =>
            Number.isFinite(tick.value) && Number.isFinite(tick[coordinate]),
    );
    const first = validTicks[0];
    const last = validTicks.find((tick) => tick.value !== first?.value);
    let value = horizontal
        ? { origin: area.left, unit: area.width }
        : { origin: area.bottom, unit: -area.height };
    if (first && last) {
        const tickUnit =
            (last[coordinate] - first[coordinate]) / (last.value - first.value);
        if (Number.isFinite(tickUnit) && tickUnit !== 0) {
            value = {
                origin: first[coordinate] - first.value * tickUnit,
                unit: tickUnit,
            };
        }
    }
    if (
        ![category.origin, category.unit, value.origin, value.unit].every(
            Number.isFinite,
        )
    )
        return null;
    return {
        x: horizontal ? value : category,
        y: horizontal ? category : value,
        motion,
        clip: {
            x: area.left,
            y: area.top,
            width: area.width,
            height: area.height,
        },
    };
}
