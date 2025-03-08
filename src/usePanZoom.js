import { ref, onMounted, onUnmounted } from 'vue';

export default function usePanZoom(svgRef, initialViewBox = { x: 0, y: 0, width: 100, height: 100 }, speed = 1) {
    const viewBox = ref({ ...initialViewBox });
    const scale = ref(1);
    const isPanning = ref(false);
    const startPoint = ref({ x: 0, y: 0 });

    let velocity = { x: 0, y: 0 };
    let animationFrame = null;
    let zoomAnimationFrame = null;

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
        console.log(speed)
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

    onMounted(() => {
        const svg = svgRef.value;
        if (!svg) return;
    
        svg.addEventListener('mousedown', startPan);
        svg.addEventListener('mousemove', doPan);
        svg.addEventListener('mouseup', endPan);
        svg.addEventListener('mouseleave', endPan);
        svg.addEventListener('wheel', zoom, { passive: false });
        svg.addEventListener('dblclick', doubleClickZoom);
        svg.addEventListener('touchstart', (event) => {
            event.preventDefault();
            startPan(event);
        }, { passive: false });
        svg.addEventListener('touchmove', (event) => {
            event.preventDefault();
            doPan(event);
        }, { passive: false });
        svg.addEventListener('touchend', endPan);
    });
    

    onUnmounted(() => {
        const svg = svgRef.value;
        if (!svg) return;
        svg.removeEventListener('mousedown', startPan);
        svg.removeEventListener('mousemove', doPan);
        svg.removeEventListener('mouseup', endPan);
        svg.removeEventListener('mouseleave', endPan);
        svg.removeEventListener('wheel', zoom);
        svg.removeEventListener('dblclick', doubleClickZoom);
        svg.removeEventListener('touchstart', startPan);
        svg.removeEventListener('touchmove', doPan);
        svg.removeEventListener('touchend', endPan);
    });

    return { viewBox };
}
