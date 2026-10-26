/**
 * Store data-space anchors with the shape so undo & redo snapshots retain their
 * coordinate system. Translate anchors with the plot and compensate for
 * viewBox zoom so text, strokes and geometry retain their displayed size.
 */
const attribute = 'data-annotation-anchor';
const signatures = new WeakMap();

function signature(shape) {
    const copy = shape.cloneNode(true);
    copy.removeAttribute(attribute);
    return copy.outerHTML;
}

/**
 * Captures a shape's visual anchor in the viewport's stored coordinate system.
 *
 * Text uses its x/y position, circles their center, paths their first point,
 * and plain lines their starting endpoint. Lines with marker-end use their tip.
 * A group shares one descendant's anchor: the first arrow takes precedence,
 * otherwise the first text, line, circle or path in document order is used.
 *
 * @param {SVGGraphicsElement} shape - Supported annotation shape or group.
 * Mutated by writing its serialized anchor metadata on successful capture.
 * @param {SVGSVGElement|null|undefined} svg - Root SVG used to convert the
 * anchor's screen coordinates to the coordinate system of the viewport.
 * @param {import('./annotationViewport').AnnotationViewport|null|undefined} viewport
 * Current coordinate mappings and optional viewBox compensation dimensions.
 * @param {boolean} [force=false] - Recapture even when the markup is unchanged,
 * for example when explicitly enabling annotation anchoring.
 * @returns {void} Does nothing when svg or viewport is absent, the shape is
 * unchanged, no supported anchor exists, a screen matrix is unavailable, or an
 * axis mapping has a nonfinite/zero unit or produces a nonfinite coordinate.
 * @throws {Error} Native SVG operations can throw, for example if a path cannot
 * be measured or a screen transformation matrix cannot be inverted.
 */
export function captureAnnotationAnchor(shape, svg, viewport, force = false) {
    if (!viewport || !svg) return;

    const currentSignature = signature(shape);

    if (!force && signatures.get(shape) === currentSignature) return;

    let x = 0;
    let y = 0;

    // Explicit groups share one anchor, preferably the tip of an arrow.
    const anchorShape =
        shape.tagName.toLowerCase() === 'g'
            ? shape.querySelector('line[marker-end]') ||
              shape.querySelector('text, line, circle, path')
            : shape;

    if (!anchorShape) return;

    const tag = anchorShape.tagName.toLowerCase();

    // Types of annotation elements
    if (tag === 'text') {
        x = Number(anchorShape.getAttribute('x'));
        y = Number(anchorShape.getAttribute('y'));
    } else if (tag === 'line') {
        // The tip is the anchor for arrows, plain lines use their starting point
        const endpoint = anchorShape.hasAttribute('marker-end') ? '2' : '1';
        x = Number(anchorShape.getAttribute(`x${endpoint}`));
        y = Number(anchorShape.getAttribute(`y${endpoint}`));
    } else if (tag === 'circle') {
        x = Number(anchorShape.getAttribute('cx'));
        y = Number(anchorShape.getAttribute('cy'));
    } else if (tag === 'path') {
        const start = anchorShape.getPointAtLength(0);
        x = start.x;
        y = start.y;
    } else {
        return;
    }

    const rootMatrix = svg.getScreenCTM();
    const shapeMatrix = anchorShape.getScreenCTM();
    if (!rootMatrix || !shapeMatrix) return;

    const point = svg.createSVGPoint();
    point.x = x;
    point.y = y;

    const anchor = point.matrixTransform(
        rootMatrix.inverse().multiply(shapeMatrix),
    );

    const data = {
        origin: { x: anchor.x, y: anchor.y },
        transform: shape.getAttribute('transform') || '',
        ...(viewport.shapeScale
            ? { shapeScale: { ...viewport.shapeScale } }
            : {}),
    };

    for (const axis of ['x', 'y']) {
        const mapping = viewport[axis];
        if (!mapping || !Number.isFinite(mapping.unit) || !mapping.unit) return;

        data[axis] = (anchor[axis] - mapping.origin) / mapping.unit;
        if (!Number.isFinite(data[axis])) return;
    }

    shape.setAttribute(attribute, JSON.stringify(data));
    signatures.set(shape, currentSignature);
}

/**
 * Projects a previously captured annotation anchor into the current viewport.
 *
 * Applies `origin + coordinate * unit` on each axis, followed by any optional
 * motion scale and translation. The shape moves relative to its captured root
 * SVG anchor, preserving its original transform. Projection always starts from
 * captured metadata rather than the last projected transform, so repeated calls
 * do not accumulate movement or scaling.
 *
 * @param {SVGGraphicsElement} shape - Annotation shape or group carrying valid
 * data-annotation-anchor JSON written by captureAnnotationAnchor. Its transform
 * attribute and, when motion is supplied, inline styles are mutated.
 * @param {import('./annotationViewport').AnnotationViewport|null|undefined} viewport
 * Target coordinate mappings, optional visual motion and viewBox dimensions.
 * @returns {void} Does nothing if anchor metadata or viewport is absent. Invalid
 * projected positions or nonfinite/nonpositive geometry scale ratios prevent
 * transform and signature updates; motion styles may already have been written.
 * @throws {SyntaxError} If the stored anchor metadata is not valid JSON.
 * @throws {TypeError} If metadata or viewport lacks required coordinate fields.
 */
export function projectAnnotationAnchor(shape, viewport) {
    const raw = shape.getAttribute(attribute);
    if (!raw || !viewport) return;

    const data = JSON.parse(raw);
    let targetX = viewport.x.origin + data.x * viewport.x.unit;
    let targetY = viewport.y.origin + data.y * viewport.y.unit;

    if (viewport.motion) {
        const { scaleX, scaleY, translateX, translateY } = viewport.motion;
        targetX = targetX * scaleX + translateX;
        targetY = targetY * scaleY + translateY;
        shape.style.transformOrigin = '0 0';
        shape.style.transformBox = 'view-box';
        shape.style.transition = viewport.motion.transition;
    }

    const x = targetX - data.origin.x;
    const y = targetY - data.origin.y;
    if (![x, y].every(Number.isFinite)) return;

    const scaleX =
        viewport.shapeScale && data.shapeScale
            ? viewport.shapeScale.x / data.shapeScale.x
            : 1;
    const scaleY =
        viewport.shapeScale && data.shapeScale
            ? viewport.shapeScale.y / data.shapeScale.y
            : 1;

    if (
        ![scaleX, scaleY].every(Number.isFinite) ||
        scaleX <= 0 ||
        scaleY <= 0
    ) {
        return;
    }

    if (Math.abs(scaleX - 1) > 1e-9 || Math.abs(scaleY - 1) > 1e-9) {
        shape.setAttribute(
            'transform',
            `translate(${targetX} ${targetY}) scale(${scaleX} ${scaleY}) translate(${-data.origin.x} ${-data.origin.y})${data.transform ? ` ${data.transform}` : ''}`,
        );
    } else if (Math.abs(x) < 1e-9 && Math.abs(y) < 1e-9) {
        if (data.transform) shape.setAttribute('transform', data.transform);
        else shape.removeAttribute('transform');
    } else {
        shape.setAttribute(
            'transform',
            `translate(${x} ${y})${data.transform ? ` ${data.transform}` : ''}`,
        );
    }
    signatures.set(shape, signature(shape));
}
