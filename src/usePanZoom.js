import { ref, onBeforeUnmount, watch, computed, toValue } from 'vue';

/**
 * Controls an SVG viewBox with wheel, pointer, and touch pan/zoom gestures.
 * Call during setup and bind the returned viewBox to the rendered SVG.
 * @param {import('vue').Ref<SVGSVGElement | null>} svgRef - Gesture target.
 * @param {{x: number, y: number, width: number, height: number}} [initialViewBox] - Initial SVG coordinate bounds.
 * @param {import('vue').MaybeRefOrGetter<number>} [speed=1] - Zoom sensitivity.
 * @param {import('vue').Ref<boolean>} activeRef - Enables gesture handling.
 * @param {Function | null} [callbackOnZoom=null] - Called on zoom changes.
 * @param {object} [options={}] - Optional reactive minScale/maxScale, panEnabled/zoomEnabled, bindEvents, eventMode ('legacy' or 'pointer'), dragThreshold, wheelFactor, onDragStart, and onDrag settings. A drag callback returning true handles the movement itself.
 * @returns {object} Viewport state, zoom/reset/set controls, animation cancellation, pointer handlers, dragging, and click suppression.
 */
export default function usePanZoom(
    svgRef,
    initialViewBox = { x: 0, y: 0, width: 100, height: 100 },
    speed = 1,
    activeRef,
    callbackOnZoom = null,
    options = {},
) {
    const initial = ref({ ...initialViewBox });
    const viewBox = ref({ ...initial.value });

    const scale = ref(1);
    const isPanning = ref(false);
    const isPinching = ref(false);
    const pinchStartDist = ref(0);
    const pinchStartViewBox = ref(null);
    const pinchStartScale = ref(1);
    const startClient = ref({ x: 0, y: 0 });

    function resetViewBox() {
        const targetScale = clampScale(1);
        return {
            x:
                initial.value.x +
                (initial.value.width * (1 - 1 / targetScale)) / 2,
            y:
                initial.value.y +
                (initial.value.height * (1 - 1 / targetScale)) / 2,
            width: initial.value.width / targetScale,
            height: initial.value.height / targetScale,
        };
    }
    const isZoom = computed(() => {
        const reset = resetViewBox();
        return ['x', 'y', 'width', 'height'].some(
            (key) => viewBox.value[key] !== reset[key],
        );
    });

    const dragging = ref(false);
    const suppressClick = ref(false);
    const pointers = new Map();
    let gesture = null;
    let pendingGesture = null;
    let suppressTimer = null;
    const option = (key, fallback) => toValue(options[key]) ?? fallback;
    const enabled = () => !activeRef || toValue(activeRef);
    function clampScale(value) {
        const min = Math.max(
            Number.EPSILON,
            option('minScale', Number.EPSILON),
        );
        const max = Math.max(min, option('maxScale', Infinity));
        return Math.max(min, Math.min(max, value));
    }

    let zoomAnimationFrame = null;
    let disposed = false;
    let animationGeneration = 0;
    function cancelAnimation() {
        animationGeneration += 1;
        if (zoomAnimationFrame !== null)
            cancelAnimationFrame(zoomAnimationFrame);
        zoomAnimationFrame = null;
        pendingGesture = null;
    }

    function getTouchDistance(touches) {
        if (touches.length < 2) return 0;
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.hypot(dx, dy);
    }

    function toSvgPoint(evt) {
        const svg = svgRef.value;
        const inverse = svg?.getScreenCTM?.()?.inverse();
        if (inverse && svg.createSVGPoint) {
            const point = svg.createSVGPoint();
            point.x = evt.clientX;
            point.y = evt.clientY;
            return point.matrixTransform(inverse);
        }
        const box = viewBox.value;
        const rect = svg?.getBoundingClientRect();
        if (!rect?.width || !rect?.height)
            return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
        const ratio = Math.min(
            rect.width / box.width,
            rect.height / box.height,
        );
        return {
            x:
                box.x +
                (evt.clientX -
                    rect.left -
                    (rect.width - box.width * ratio) / 2) /
                    ratio,
            y:
                box.y +
                (evt.clientY -
                    rect.top -
                    (rect.height - box.height * ratio) / 2) /
                    ratio,
        };
    }

    function pxToVb(dxPx, dyPx) {
        const svg = svgRef.value;
        if (!svg) return { dx: 0, dy: 0 };
        const inverse = svg.getScreenCTM?.()?.inverse();
        if (inverse) {
            return {
                dx: inverse.a * dxPx + inverse.c * dyPx,
                dy: inverse.b * dxPx + inverse.d * dyPx,
            };
        }
        const w = Math.max(1, svg.clientWidth);
        const h = Math.max(1, svg.clientHeight);
        const sx = viewBox.value.width / w;
        const sy = viewBox.value.height / h;
        return { dx: dxPx * sx, dy: dyPx * sy };
    }

    function startPan(e) {
        if (!option('panEnabled', true)) return;
        cancelAnimation();
        isPanning.value = true;
        const t = e.touches?.[0] || e;
        startClient.value = { x: t.clientX, y: t.clientY };
        if (svgRef.value) svgRef.value.style.cursor = 'grabbing';
    }

    function doPan(e) {
        if (!isPanning.value) return;
        const t = e.touches?.[0] || e;
        const dxPx = t.clientX - startClient.value.x;
        const dyPx = t.clientY - startClient.value.y;
        if (dxPx === 0 && dyPx === 0) return;
        const { dx, dy } = pxToVb(dxPx, dyPx);
        viewBox.value.x -= dx;
        viewBox.value.y -= dy;
        startClient.value = { x: t.clientX, y: t.clientY };
    }

    function endPan() {
        isPanning.value = false;
        if (svgRef.value) svgRef.value.style.cursor = '';
    }

    function zoom(event) {
        if (!enabled() || !option('zoomEnabled', true)) return;
        cancelAnimation();
        callbackOnZoom && callbackOnZoom();
        event.preventDefault();
        const factor = options.wheelFactor
            ? options.wheelFactor(event)
            : event.deltaY > 0
              ? 0.9
              : 1.1;
        applyZoom(factor, toSvgPoint(event));
    }

    function doubleClickZoom(event) {
        if (!option('zoomEnabled', true)) return;
        event.preventDefault();
        const cursorPoint = toSvgPoint(event);
        const factor = 1.5 * (1 + toValue(speed) / 100);
        animateZoom(factor, cursorPoint);
    }

    function animateZoom(factor, cursorPoint) {
        cancelAnimation();
        const generation = animationGeneration;
        const startScale = scale.value;
        const targetScale = clampScale(startScale * factor);
        let t0 = null;
        const duration = 200;

        const ease = (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

        const step = (ts) => {
            if (disposed || generation !== animationGeneration) return;
            if (t0 == null) t0 = ts;
            const p = Math.min((ts - t0) / duration, 1);
            const desiredScale =
                startScale + (targetScale - startScale) * ease(p);
            const relativeFactor = desiredScale / scale.value;
            applyZoom(relativeFactor, cursorPoint);

            if (p < 1) {
                zoomAnimationFrame = requestAnimationFrame(step);
            } else {
                zoomAnimationFrame = null;
            }
        };

        zoomAnimationFrame = requestAnimationFrame(step);
    }

    function applyZoom(zoomFactor, cursorPoint) {
        if (!Number.isFinite(zoomFactor) || zoomFactor <= 0) return;
        const newScale = clampScale(scale.value * zoomFactor);
        const k = newScale / scale.value;
        const newW = viewBox.value.width / k;
        const newH = viewBox.value.height / k;
        const dx = (cursorPoint.x - viewBox.value.x) * (1 - 1 / k);
        const dy = (cursorPoint.y - viewBox.value.y) * (1 - 1 / k);
        viewBox.value.x += dx;
        viewBox.value.y += dy;
        viewBox.value.width = newW;
        viewBox.value.height = newH;
        scale.value = newScale;
    }

    function handleTouchStart(event) {
        cancelAnimation();
        if (event.touches.length === 2) {
            isPinching.value = true;
            pinchStartDist.value = getTouchDistance(event.touches);
            pinchStartViewBox.value = { ...viewBox.value };
            pinchStartScale.value = scale.value;
        } else {
            event.preventDefault();
            startPan(event);
        }
    }

    function handleTouchMove(event) {
        if (isPinching.value && event.touches.length === 2) {
            event.preventDefault();

            const dist = getTouchDistance(event.touches);
            if (!pinchStartDist.value || !dist) return;

            const absoluteFactor = dist / pinchStartDist.value;
            const targetScale = pinchStartScale.value * absoluteFactor;
            const relativeFactor = targetScale / scale.value;

            const midX =
                (event.touches[0].clientX + event.touches[1].clientX) / 2;
            const midY =
                (event.touches[0].clientY + event.touches[1].clientY) / 2;
            const midPoint = toSvgPoint({ clientX: midX, clientY: midY });

            viewBox.value = { ...pinchStartViewBox.value };
            scale.value = pinchStartScale.value;

            applyZoom(relativeFactor, midPoint);
        } else {
            event.preventDefault();
            doPan(event);
        }
    }

    function handleTouchEnd(event) {
        if (event.touches.length < 2) isPinching.value = false;
        endPan();
    }

    function resetZoom(animated = false) {
        cancelAnimation();
        if (!animated) {
            viewBox.value = resetViewBox();
            scale.value = clampScale(1);
            return;
        }

        const generation = animationGeneration;
        const from = { ...viewBox.value };
        const fromScale = scale.value;
        const targetScale = clampScale(1);
        const target = resetViewBox();
        const duration = 300;
        let t0 = null;

        const step = (ts) => {
            if (disposed || generation !== animationGeneration) return;
            if (t0 == null) t0 = ts;
            const p = Math.min((ts - t0) / duration, 1);
            viewBox.value = {
                x: from.x + (target.x - from.x) * p,
                y: from.y + (target.y - from.y) * p,
                width: from.width + (target.width - from.width) * p,
                height: from.height + (target.height - from.height) * p,
            };
            scale.value = fromScale + (targetScale - fromScale) * p;
            if (p === 1) {
                viewBox.value = { ...target };
                scale.value = targetScale;
            }
            zoomAnimationFrame = p < 1 ? requestAnimationFrame(step) : null;
        };
        zoomAnimationFrame = requestAnimationFrame(step);
    }

    function setInitialViewBox(box, opts = {}) {
        cancelAnimation();
        const { overwriteCurrentIfNotZoomed = true } = opts;
        const wasZoomed = isZoom.value;

        initial.value = { ...box };
        if (!wasZoomed && overwriteCurrentIfNotZoomed) {
            viewBox.value = resetViewBox();
            scale.value = clampScale(1);
        }
    }

    function setViewBox(box) {
        if (
            ![box.x, box.y, box.width, box.height].every(Number.isFinite) ||
            box.width <= 0 ||
            box.height <= 0
        )
            return false;
        cancelAnimation();
        const requestedScale = initial.value.width / box.width;
        const nextScale = clampScale(requestedScale);
        const ratio = requestedScale / nextScale;
        viewBox.value = {
            x: box.x + (box.width * (1 - ratio)) / 2,
            y: box.y + (box.height * (1 - ratio)) / 2,
            width: box.width * ratio,
            height: box.height * ratio,
        };
        scale.value = nextScale;
        return true;
    }
    function zoomAt(factor, point, animated = false) {
        cancelAnimation();
        if (animated) animateZoom(factor, point);
        else applyZoom(factor, point);
    }
    function flushGesture() {
        zoomAnimationFrame = null;
        const update = pendingGesture;
        pendingGesture = null;
        update?.();
    }
    function scheduleGesture(update) {
        pendingGesture = update;
        if (typeof requestAnimationFrame === 'undefined') {
            flushGesture();
            return;
        }
        if (zoomAnimationFrame !== null) return;
        const generation = animationGeneration;
        zoomAnimationFrame = requestAnimationFrame(() => {
            if (disposed || generation !== animationGeneration) return;
            flushGesture();
        });
    }
    function startPointerGesture() {
        const [a, b] = pointers.values();
        if (!a) {
            gesture = null;
            return;
        }
        const rect = svgRef.value?.getBoundingClientRect();
        const pixelScale =
            rect?.width && rect?.height
                ? Math.min(
                      rect.width / viewBox.value.width,
                      rect.height / viewBox.value.height,
                  )
                : 1;
        const inverse = svgRef.value?.getScreenCTM?.()?.inverse();
        gesture = {
            a,
            box: { ...viewBox.value },
            scale: scale.value,
            inverse,
            pixelScale,
            distance: b ? Math.hypot(a.x - b.x, a.y - b.y) : 0,
            anchor: b
                ? toSvgPoint({
                      clientX: (a.x + b.x) / 2,
                      clientY: (a.y + b.y) / 2,
                  })
                : null,
            context: options.onDragStart?.(),
        };
    }
    function onPointerDown(event) {
        if (
            !enabled() ||
            (event.button != null && event.button !== 0) ||
            (!option('panEnabled', true) && !option('zoomEnabled', true))
        )
            return;
        if (!pointers.size) {
            suppressClick.value = false;
            clearTimeout(suppressTimer);
        }
        cancelAnimation();
        pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
        startPointerGesture();
    }
    function onPointerMove(event) {
        if (!enabled() || !pointers.has(event.pointerId) || !gesture) return;
        pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
        const [a, b] = pointers.values();
        const start = gesture;
        const dx = a.x - start.a.x,
            dy = a.y - start.a.y;
        if (b && option('zoomEnabled', true) && start.distance > 0) {
            const factor = Math.hypot(a.x - b.x, a.y - b.y) / start.distance;
            scheduleGesture(() => {
                viewBox.value = { ...start.box };
                scale.value = start.scale;
                applyZoom(factor, start.anchor);
            });
        } else if (
            option('panEnabled', true) &&
            (Math.hypot(dx, dy) >= option('dragThreshold', 0) || dragging.value)
        ) {
            scheduleGesture(() => {
                if (
                    options.onDrag?.({
                        dx,
                        dy,
                        scale: start.scale,
                        context: start.context,
                    }) === true
                )
                    return;
                const tx = start.inverse
                    ? start.inverse.a * dx + start.inverse.c * dy
                    : dx / start.pixelScale;
                const ty = start.inverse
                    ? start.inverse.b * dx + start.inverse.d * dy
                    : dy / start.pixelScale;
                viewBox.value = {
                    ...start.box,
                    x: start.box.x - tx,
                    y: start.box.y - ty,
                };
            });
        } else return;
        svgRef.value?.setPointerCapture?.(event.pointerId);
        dragging.value = true;
        suppressClick.value = true;
    }
    function onPointerUp(event) {
        if (!pointers.has(event.pointerId)) return;
        if (zoomAnimationFrame !== null) {
            cancelAnimationFrame(zoomAnimationFrame);
            flushGesture();
        }
        pointers.delete(event.pointerId);
        if (svgRef.value?.hasPointerCapture?.(event.pointerId))
            svgRef.value.releasePointerCapture(event.pointerId);
        startPointerGesture();
        if (!pointers.size) {
            dragging.value = false;
            suppressTimer = setTimeout(() => {
                suppressClick.value = false;
            }, 0);
        }
    }
    function stopGesture() {
        cancelAnimation();
        const ids = [...pointers.keys()];
        pointers.clear();
        gesture = null;
        dragging.value = false;
        suppressClick.value = false;
        for (const id of ids)
            if (svgRef.value?.hasPointerCapture?.(id))
                svgRef.value.releasePointerCapture(id);
        endPan();
        isPinching.value = false;
        clearTimeout(suppressTimer);
    }
    const legacyListeners = {
        mousedown: startPan,
        mousemove: doPan,
        mouseup: endPan,
        mouseleave: endPan,
        wheel: zoom,
        dblclick: doubleClickZoom,
        touchstart: handleTouchStart,
        touchmove: handleTouchMove,
        touchend: handleTouchEnd,
        touchcancel: handleTouchEnd,
    };
    const pointerListeners = {
        pointerdown: onPointerDown,
        pointermove: onPointerMove,
        pointerup: onPointerUp,
        pointercancel: onPointerUp,
        lostpointercapture: onPointerUp,
        wheel: zoom,
    };
    let boundSvg = null;
    let boundListeners = null;
    let markedSvg = null;
    function detachListeners() {
        if (boundSvg && isPanning.value) boundSvg.style.cursor = '';
        if (boundSvg)
            for (const [event, handler] of Object.entries(boundListeners))
                boundSvg.removeEventListener(event, handler);
        boundSvg = null;
        boundListeners = null;
    }
    watch(
        [
            svgRef,
            () => enabled(),
            () => option('bindEvents', true),
            () => option('eventMode', 'legacy'),
        ],
        ([svg, active, bindEvents, eventMode]) => {
            detachListeners();
            stopGesture();
            if (markedSvg !== svg)
                markedSvg?.removeAttribute('data-vdui-pan-zoom');
            markedSvg = svg;
            svg?.setAttribute('data-vdui-pan-zoom', '');
            if (!svg || !active || !bindEvents) return;
            boundSvg = svg;
            boundListeners =
                eventMode === 'pointer' ? pointerListeners : legacyListeners;
            for (const [event, handler] of Object.entries(boundListeners))
                svg.addEventListener(event, handler, { passive: false });
        },
        { immediate: true, flush: 'post' },
    );
    watch(
        [() => option('panEnabled', true), () => option('zoomEnabled', true)],
        stopGesture,
    );
    watch(
        [
            () => option('minScale', Number.EPSILON),
            () => option('maxScale', Infinity),
        ],
        () => setViewBox(viewBox.value),
    );
    onBeforeUnmount(() => {
        disposed = true;
        detachListeners();
        stopGesture();
        markedSvg?.removeAttribute('data-vdui-pan-zoom');
    });

    function zoomByFactor(factor, animated = false) {
        const center = {
            x: viewBox.value.x + viewBox.value.width / 2,
            y: viewBox.value.y + viewBox.value.height / 2,
        };
        zoomAt(factor, center, animated);
    }

    return {
        viewBox,
        resetZoom,
        cancelAnimation,
        isZoom,
        setInitialViewBox,
        scale,
        zoomByFactor,
        zoomAt,
        setViewBox,
        dragging,
        suppressClick,
        stopGesture,
        onPointerDown,
        onPointerMove,
        onPointerUp,
        onWheel: zoom,
    };
}
