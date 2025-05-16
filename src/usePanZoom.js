import { ref, onMounted, onUnmounted, watch, nextTick, watchEffect } from 'vue';

export default function usePanZoom(svgRef, initialViewBox = { x: 0, y: 0, width: 100, height: 100 }, speed = 1, activeRef) {
    const viewBox = ref({ ...initialViewBox });

    const scale = ref(1);
    const isPanning = ref(false);
    const startPoint = ref({ x: 0, y: 0 });
    const pinchStartDist = ref(0);
    const pinchStartViewBox = ref(null);
    const isPinching = ref(false);

    let velocity = { x: 0, y: 0 };
    let animationFrame = null;
    let zoomAnimationFrame = null;

    function getTouchDistance(touches) {
        if (touches.length < 2) return 0;
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    function toSvgPoint(event) {
        const svg = svgRef.value;
        if (!svg) return { x: 0, y: 0 };

        const point = svg.createSVGPoint();
        point.x = event.clientX;
        point.y = event.clientY;

        const matrix = svg.getScreenCTM()?.inverse();
        return matrix ? point.matrixTransform(matrix) : { x: 0, y: 0 };
    };

    function startPan(event) {
        isPanning.value = true;
        const point = toSvgPoint(event.touches ? event.touches[0] : event);
        startPoint.value = { x: point.x, y: point.y };
        velocity = { x: 0, y: 0 };
    };

    function doPan(event) {
        if (!isPanning.value) return;

        const point = toSvgPoint(event.touches ? event.touches[0] : event);

        let dx = point.x - startPoint.value.x;
        let dy = point.y - startPoint.value.y;

        if (Math.abs(dx) < 0.3 && Math.abs(dy) < 0.3) return;

        velocity.x = dx * 0.8 + velocity.x * 0.2;
        velocity.y = dy * 0.8 + velocity.y * 0.2;

        startPoint.value = point;

        if (!animationFrame) {
            animationFrame = requestAnimationFrame(applyPan);
        }
    };

    function applyPan() {
        viewBox.value.x -= velocity.x;
        viewBox.value.y -= velocity.y;
        animationFrame = null;
    };

    function endPan() {
        isPanning.value = false;
    };

    function zoom(event) {
        event.preventDefault();
        const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
        applyZoom(zoomFactor, toSvgPoint(event));
    };

    function doubleClickZoom(event) {
        event.preventDefault();
        const cursorPoint = toSvgPoint(event);
        const zoomFactor = 1.02 * (1 + (speed / 100)); // Always zoom in

        animateZoom(zoomFactor, cursorPoint);
    };

    function animateZoom(zoomFactor, cursorPoint) {
        if (zoomAnimationFrame) cancelAnimationFrame(zoomAnimationFrame);

        let startScale = scale.value;
        let targetScale = startScale * zoomFactor;
        let progress = 0;

        const animate = () => {
            progress += 0.02;

            let currentScale = startScale + (targetScale - startScale) * easeInOutQuad(progress);

            if (progress >= 1) {
                scale.value = targetScale;
                zoomAnimationFrame = null;
                return;
            }

            applyZoom(currentScale / startScale, cursorPoint);
            zoomAnimationFrame = requestAnimationFrame(animate);
        };

        animate();
    };

    const easeInOutQuad = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

    function applyZoom(zoomFactor, cursorPoint) {
        const newScale = scale.value * zoomFactor;
        const scaleFactor = newScale / scale.value;

        const newWidth = viewBox.value.width / scaleFactor;
        const newHeight = viewBox.value.height / scaleFactor;

        const dx = (cursorPoint.x - viewBox.value.x) * (1 - 1 / scaleFactor);
        const dy = (cursorPoint.y - viewBox.value.y) * (1 - 1 / scaleFactor);

        viewBox.value.x += dx;
        viewBox.value.y += dy;
        viewBox.value.width = newWidth;
        viewBox.value.height = newHeight;

        scale.value = newScale;
    };

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
                const midX = (event.touches[0].clientX + event.touches[1].clientX) / 2 - rect.left;
                const midY = (event.touches[0].clientY + event.touches[1].clientY) / 2 - rect.top;
                const midPoint = toSvgPoint({ clientX: midX + rect.left, clientY: midY + rect.top });
                viewBox.value = { ...pinchStartViewBox.value };
                applyZoom(zoomFactor, midPoint);
            }
        } else {
            event.preventDefault();
            doPan(event);
        }
    }

    function handleTouchEnd(event) {
        if (event.touches.length < 2) {
            isPinching.value = false;
        }
        endPan();
    }

    onMounted(addEventListeners);
    onUnmounted(removeEventListeners);

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

    watchEffect(() => {
        if (activeRef.value) {
            addEventListeners();
        } else {
            removeEventListeners();
        }

        return () => {
            removeEventListeners();
        };
    });

    return { viewBox };
}
