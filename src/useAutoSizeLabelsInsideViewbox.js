import { isRef, onBeforeUnmount } from 'vue';

function resolveSource(source) {
    if (typeof source === 'function') {
        return source();
    }

    if (isRef(source)) {
        return source.value;
    }

    return source;
}

function getViewBoxBounds(svg) {
    const values = String(svg.getAttribute('viewBox') ?? '')
        .trim()
        .split(/[\s,]+/)
        .map(Number);

    if (
        values.length !== 4 ||
        values.some((value) => !Number.isFinite(value))
    ) {
        return null;
    }

    const [x, y, width, height] = values;

    return {
        x,
        y,
        width,
        height,
    };
}

function getElementBoundsInSvg(el, svg) {
    const bbox = el.getBBox();
    const elementMatrix = el.getScreenCTM?.();
    const svgMatrix = svg.getScreenCTM?.();

    if (!elementMatrix || !svgMatrix || !svg.createSVGPoint) {
        return bbox;
    }

    let inverseSvgMatrix;

    try {
        inverseSvgMatrix = svgMatrix.inverse();
    } catch {
        return bbox;
    }

    function transformPoint(x, y) {
        const point = svg.createSVGPoint();
        point.x = x;
        point.y = y;

        const screenPoint = point.matrixTransform(elementMatrix);
        return screenPoint.matrixTransform(inverseSvgMatrix);
    }

    const points = [
        transformPoint(bbox.x, bbox.y),
        transformPoint(bbox.x + bbox.width, bbox.y),
        transformPoint(bbox.x, bbox.y + bbox.height),
        transformPoint(bbox.x + bbox.width, bbox.y + bbox.height),
    ];

    const xs = points.map((point) => point.x);
    const ys = points.map((point) => point.y);
    const left = Math.min(...xs);
    const right = Math.max(...xs);
    const top = Math.min(...ys);
    const bottom = Math.max(...ys);

    return {
        x: left,
        y: top,
        width: right - left,
        height: bottom - top,
    };
}

function fitsWithinBounds(el, svg, bounds, padding = 1) {
    const box = getElementBoundsInSvg(el, svg);

    return (
        box.x >= bounds.x + padding &&
        box.x + box.width <= bounds.x + bounds.width - padding &&
        box.y >= bounds.y + padding &&
        box.y + box.height <= bounds.y + bounds.height - padding
    );
}

function shrinkToFit({
    el,
    svg,
    bounds,
    baseSize,
    minSize,
    padding,
    step = 0.5,
    attempts = 240,
}) {
    const resolvedBaseSize = Number(baseSize);
    const resolvedMinSize = Number(minSize);

    if (!Number.isFinite(resolvedBaseSize) || resolvedBaseSize <= 0) {
        return 0;
    }

    const minimum = Number.isFinite(resolvedMinSize)
        ? Math.min(resolvedBaseSize, Math.max(0, resolvedMinSize))
        : Math.min(resolvedBaseSize, 6);

    let currentSize = resolvedBaseSize;
    let remainingAttempts = attempts;

    el.setAttribute('font-size', String(currentSize));

    while (
        currentSize > minimum &&
        remainingAttempts > 0 &&
        !fitsWithinBounds(el, svg, bounds, padding)
    ) {
        currentSize = Math.max(minimum, currentSize - step);
        el.setAttribute('font-size', String(currentSize));
        remainingAttempts -= 1;
    }

    return currentSize;
}

function createMeasurementClone(el) {
    const clone = el.cloneNode(true);

    clone.removeAttribute('id');
    clone.setAttribute('aria-hidden', 'true');
    clone.setAttribute('focusable', 'false');

    clone.classList.remove('vue-data-ui-transition');
    clone.classList.remove('vue-ui-onion-label');

    clone.style.setProperty('transition', 'none', 'important');
    clone.style.setProperty('animation', 'none', 'important');
    clone.style.setProperty('opacity', '0', 'important');
    clone.style.setProperty('pointer-events', 'none', 'important');
    clone.style.setProperty('user-select', 'none', 'important');

    return clone;
}

function calculateFontSize({ el, svg, bounds, baseSize, minSize, padding }) {
    const clone = createMeasurementClone(el);
    const parent = el.parentNode;

    if (!parent) {
        return Number(baseSize) || 0;
    }

    parent.insertBefore(clone, el.nextSibling);

    try {
        return shrinkToFit({
            el: clone,
            svg,
            bounds,
            baseSize,
            minSize,
            padding,
        });
    } finally {
        clone.remove();
    }
}

export function useAutoSizeLabelsInsideViewbox({
    svgRef,
    fontSize,
    minFontSize,
    sizeRef,
    labelClass,
    labelTypes = [],
    padding = 1,
}) {
    let rafScheduled = null;

    function getResolvedLabelTypes() {
        const configuredTypes = resolveSource(labelTypes);

        if (Array.isArray(configuredTypes) && configuredTypes.length) {
            return configuredTypes;
        }

        return [
            {
                selector: resolveSource(labelClass),
                baseSize: fontSize,
                minSize: minFontSize,
                sizeRef,
            },
        ];
    }

    function autoSizeLabelsNow() {
        const svg = resolveSource(svgRef);

        if (!svg) return;

        const bounds = getViewBoxBounds(svg);

        if (!bounds) return;

        getResolvedLabelTypes().forEach((labelType) => {
            const selector = resolveSource(labelType.selector);

            if (!selector) return;

            const elements = Array.from(svg.querySelectorAll(selector));

            if (!elements.length) return;

            const baseSize = resolveSource(labelType.baseSize);
            const minSize = resolveSource(labelType.minSize);
            const targetSizeRef = labelType.sizeRef ?? sizeRef;
            let smallestSize = Number.POSITIVE_INFINITY;

            elements.forEach((el) => {
                const finalSize = calculateFontSize({
                    el,
                    svg,
                    bounds,
                    baseSize,
                    minSize,
                    padding,
                });

                // Only the final value is applied to the visible label.
                // This allows CSS to transition font-size without disturbing
                // the synchronous fitting measurements performed on the clone.
                el.setAttribute('font-size', String(finalSize));
                smallestSize = Math.min(smallestSize, finalSize);
            });

            if (
                targetSizeRef &&
                'value' in targetSizeRef &&
                Number.isFinite(smallestSize)
            ) {
                targetSizeRef.value = smallestSize;
            }
        });
    }

    function autoSizeLabels() {
        if (rafScheduled !== null) {
            cancelAnimationFrame(rafScheduled);
        }

        rafScheduled = requestAnimationFrame(() => {
            rafScheduled = null;
            autoSizeLabelsNow();
        });
    }

    onBeforeUnmount(() => {
        if (rafScheduled !== null) {
            cancelAnimationFrame(rafScheduled);
            rafScheduled = null;
        }
    });

    return {
        autoSizeLabels,
        autoSizeLabelsNow,
    };
}
