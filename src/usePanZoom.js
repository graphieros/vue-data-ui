import { ref, onMounted, onUnmounted, watch, watchEffect, computed } from 'vue';

export default function usePanZoom(
    svgRef,
    initialViewBox = { x: 0, y: 0, width: 100, height: 100 },
    speed = 1,
    activeRef
) {
    const initial = ref({ ...initialViewBox });
    const viewBox = ref({ ...initial.value });

    const scale = ref(1);
    const isPanning = ref(false);
    const isPinching = ref(false);
    const pinchStartDist = ref(0);
    const pinchStartViewBox = ref(null);
    const startClient = ref({ x: 0, y: 0 });

    const isZoom = computed(() =>
        viewBox.value.x !== initial.value.x ||
        viewBox.value.y !== initial.value.y ||
        viewBox.value.width !== initial.value.width ||
        viewBox.value.height !== initial.value.height
    );

    let zoomAnimationFrame = null;

    function getTouchDistance(touches) {
        if (touches.length < 2) return 0;
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.hypot(dx, dy);
    }

    function toSvgPoint(evt) {
        const svg = svgRef.value;
        if (!svg) return { x: 0, y: 0 };
        const pt = svg.createSVGPoint();
        pt.x = evt.clientX;
        pt.y = evt.clientY;
        const inv = svg.getScreenCTM()?.inverse();
        return inv ? pt.matrixTransform(inv) : { x: 0, y: 0 };
    }

    function pxToVb(dxPx, dyPx) {
        const svg = svgRef.value;
        if (!svg) return { dx: 0, dy: 0 };
        const w = Math.max(1, svg.clientWidth);
        const h = Math.max(1, svg.clientHeight);
        const sx = viewBox.value.width / w;
        const sy = viewBox.value.height / h;
        return { dx: dxPx * sx, dy: dyPx * sy };
    }

    function startPan(e) {
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
        event.preventDefault();
        const factor = event.deltaY > 0 ? 0.9 : 1.1;
        applyZoom(factor, toSvgPoint(event));
    }

    function doubleClickZoom(event) {
        event.preventDefault();
        const cursorPoint = toSvgPoint(event);
        const factor = 1.02 * (1 + speed / 100);
        animateZoom(factor, cursorPoint);
    }

    function animateZoom(factor, cursorPoint) {
        if (zoomAnimationFrame) cancelAnimationFrame(zoomAnimationFrame);
        const startScale = scale.value;
        const targetScale = startScale * factor;
        let progress = 0;

        const ease = (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

        const step = () => {
            progress += 0.02;
            const currentScale = startScale + (targetScale - startScale) * ease(progress);
            applyZoom(currentScale / startScale, cursorPoint);
            if (progress < 1) zoomAnimationFrame = requestAnimationFrame(step);
            else zoomAnimationFrame = null;
        };
        step();
    }

    function applyZoom(zoomFactor, cursorPoint) {
        const newScale = scale.value * zoomFactor;
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
        if (event.touches.length === 2) {
            isPinching.value = true;
            pinchStartDist.value = getTouchDistance(event.touches);
            pinchStartViewBox.value = { ...viewBox.value };
        } else {
            event.preventDefault();
            startPan(event);
        }
    }

    function handleTouchMove(event) {
        if (isPinching.value && event.touches.length === 2) {
            event.preventDefault();
            const dist = getTouchDistance(event.touches);
            if (pinchStartDist.value) {
                const zoomFactor = dist / pinchStartDist.value;
                const svg = svgRef.value;
                const rect = svg.getBoundingClientRect();
                const midX = (event.touches[0].clientX + event.touches[1].clientX) / 2;
                const midY = (event.touches[0].clientY + event.touches[1].clientY) / 2;
                const midPoint = toSvgPoint({ clientX: midX, clientY: midY });
                viewBox.value = { ...pinchStartViewBox.value };
                applyZoom(zoomFactor, midPoint);
            }
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
        if (!animated) {
            viewBox.value = { ...initial.value };
            scale.value = 1;
            return;
        }

        const from = { ...viewBox.value };
        const fromScale = scale.value;
        const duration = 300;
        let t0 = null;

        const step = (ts) => {
            if (t0 == null) t0 = ts;
            const p = Math.min((ts - t0) / duration, 1);
            viewBox.value = {
                x: from.x + (initial.value.x - from.x) * p,
                y: from.y + (initial.value.y - from.y) * p,
                width: from.width + (initial.value.width - from.width) * p,
                height: from.height + (initial.value.height - from.height) * p,
            };
            scale.value = fromScale + (1 - fromScale) * p;
            if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }

    function setInitialViewBox(box, opts = {}) {
        const { overwriteCurrentIfNotZoomed = true } = opts;
        initial.value = { ...box };
        if (!isZoom.value && overwriteCurrentIfNotZoomed) {
            viewBox.value = { ...initial.value };
            scale.value = 1;
        }
    }

    function addEventListeners() {
        const svg = svgRef.value;
        if (!svg) return;
        svg.addEventListener('mousedown', startPan);
        svg.addEventListener('mousemove', doPan);
        svg.addEventListener('mouseup', endPan);
        svg.addEventListener('mouseleave', endPan);

        svg.addEventListener('wheel', zoom, { passive: false });
        svg.addEventListener('dblclick', doubleClickZoom);

        svg.addEventListener('touchstart', handleTouchStart, { passive: false });
        svg.addEventListener('touchmove', handleTouchMove, { passive: false });
        svg.addEventListener('touchend', handleTouchEnd);
        svg.addEventListener('touchcancel', handleTouchEnd);
    }

    function removeEventListeners() {
        const svg = svgRef.value;
        if (!svg) return;

        svg.removeEventListener('mousedown', startPan);
        svg.removeEventListener('mousemove', doPan);
        svg.removeEventListener('mouseup', endPan);
        svg.removeEventListener('mouseleave', endPan);

        svg.removeEventListener('wheel', zoom);
        svg.removeEventListener('dblclick', doubleClickZoom);

        svg.removeEventListener('touchstart', handleTouchStart);
        svg.removeEventListener('touchmove', handleTouchMove);
        svg.removeEventListener('touchend', handleTouchEnd);
        svg.removeEventListener('touchcancel', handleTouchEnd);
    }

    onMounted(() => {
        if (!activeRef || activeRef.value) addEventListeners();
    });

    onUnmounted(removeEventListeners);

    watchEffect(() => {
        if (!activeRef) return;
        if (activeRef.value) addEventListeners();
        else removeEventListeners();
        return () => removeEventListeners();
    });

    watch(svgRef, () => {
        removeEventListeners();
        if (!activeRef || activeRef.value) addEventListeners();
    });

    return { viewBox, resetZoom, isZoom, setInitialViewBox };
}
