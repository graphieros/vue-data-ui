import { computed, watch } from 'vue';
import usePanZoom from './usePanZoom';
import { usePrefersReducedMotion } from './usePrefersMotion';
import geo from './geoProjections';
import {
    countryCode,
    featureCode,
    geometryCenter,
    geometryRings,
    WORLD_REGIONS,
} from './worldUtils';

export function useWorldNavigation({
    config,
    projection,
    center,
    baseViewBox,
    svgRef,
    features,
    project,
    isAnnotator,
    loading,
    emit,
    initialCenter,
    enabled = computed(() => config.value.show),
}) {
    const asBox = (box) => ({
        x: box.minX,
        y: box.minY,
        width: box.width,
        height: box.height,
    });
    const prefersReducedMotion = usePrefersReducedMotion();
    const canPan = computed(
        () => projection.value === 'globe' || enabled.value,
    );
    const active = computed(
        () => !loading.value && !isAnnotator.value && canPan.value,
    );
    const minScale = computed(() =>
        Number.isFinite(config.value.minZoom)
            ? Math.max(1, config.value.minZoom)
            : 1,
    );
    const maxScale = computed(() =>
        Number.isFinite(config.value.maxZoom)
            ? Math.max(minScale.value, config.value.maxZoom)
            : 20,
    );
    const panZoom = usePanZoom(
        svgRef,
        asBox(baseViewBox.value),
        1,
        active,
        null,
        {
            // World binds handlers in its template alongside tooltip input tracking.
            bindEvents: false,
            minScale,
            maxScale,
            panEnabled: canPan,
            zoomEnabled: enabled,
            dragThreshold: 5,
            wheelFactor: (event) =>
                Math.exp(-Math.max(-100, Math.min(100, event.deltaY)) * 0.002),
            onDragStart: () => [...center.value],
            onDrag: ({ dx, dy, scale, context }) => {
                if (projection.value !== 'globe') return false;
                center.value = [
                    ((context[0] - (dx * 0.5) / scale + 540) % 360) - 180,
                    Math.max(
                        -90,
                        Math.min(90, context[1] + (dy * 0.5) / scale),
                    ),
                ];
                return true;
            },
        },
    );
    const viewBox = computed(() => {
        const { x: minX, y: minY, width, height } = panZoom.viewBox.value;
        return {
            minX,
            minY,
            width,
            height,
            str: `${minX} ${minY} ${width} ${height}`,
        };
    });
    const camera = computed(() => ({
        zoom: panZoom.scale.value,
        x: viewBox.value.minX + viewBox.value.width / 2,
        y: viewBox.value.minY + viewBox.value.height / 2,
    }));
    function zoomIn() {
        panZoom.zoomByFactor(1.5);
    }
    function zoomOut() {
        panZoom.zoomByFactor(1 / 1.5);
    }
    const isViewportZoomed = computed(() => {
        const current = panZoom.viewBox.value;
        const base = asBox(baseViewBox.value);
        return ['x', 'y', 'width', 'height'].some(
            (key) => current[key] !== base[key],
        );
    });
    const isZoom = computed(() => {
        const initial = initialCenter();
        return (
            panZoom.isZoom.value ||
            center.value[0] !== initial[0] ||
            center.value[1] !== initial[1]
        );
    });
    function resetView(animated = false) {
        panZoom.stopGesture();
        center.value = initialCenter();
        panZoom.setInitialViewBox(asBox(baseViewBox.value));
        panZoom.resetZoom(animated && !prefersReducedMotion.value);
    }
    function fitCountries(codes) {
        const normalized = codes.map((c) => countryCode(c, true));
        const selected = features.value.filter((f) =>
            normalized.includes(featureCode(f)),
        );
        if (!selected.length) return false;
        panZoom.stopGesture();
        if (projection.value === 'globe')
            center.value = geometryCenter(selected);
        const coords = selected
            .flatMap((f) =>
                geometryRings(f.geometry).reduce(
                    (best, ring) => (ring.length > best.length ? ring : best),
                    [],
                ),
            )
            .filter(
                (coord) =>
                    projection.value !== 'globe' ||
                    geo.isGlobePointVisible(coord, center.value),
            )
            .map(project)
            .filter((point) => point.every(Number.isFinite));
        if (!coords.length) return false;
        const xs = coords.map((p) => p[0]),
            ys = coords.map((p) => p[1]);
        const minX = Math.min(...xs),
            maxX = Math.max(...xs),
            minY = Math.min(...ys),
            maxY = Math.max(...ys);
        const base = baseViewBox.value;
        const zoom = Math.min(
            base.width / Math.max(1, (maxX - minX) * 1.2),
            base.height / Math.max(1, (maxY - minY) * 1.2),
        );
        const width = base.width / zoom,
            height = base.height / zoom;
        return panZoom.setViewBox({
            x: (minX + maxX - width) / 2,
            y: (minY + maxY - height) / 2,
            width,
            height,
        });
    }
    function focusCountry(code) {
        return fitCountries([code]);
    }
    function rotate(dx, dy) {
        panZoom.cancelAnimation();
        center.value = [
            ((center.value[0] + dx + 540) % 360) - 180,
            Math.max(-90, Math.min(90, center.value[1] + dy)),
        ];
        const base = baseViewBox.value;
        const width = base.width / panZoom.scale.value,
            height = base.height / panZoom.scale.value;
        panZoom.setViewBox({
            x: base.minX + (base.width - width) / 2,
            y: base.minY + (base.height - height) / 2,
            width,
            height,
        });
    }
    function onMapKey(event) {
        if (
            event.target !== svgRef.value ||
            (!active.value && event.key !== 'Home')
        )
            return;
        if (
            projection.value === 'globe' &&
            ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(
                event.key,
            )
        ) {
            event.preventDefault();
            rotate(
                event.key === 'ArrowLeft'
                    ? -10
                    : event.key === 'ArrowRight'
                      ? 10
                      : 0,
                event.key === 'ArrowUp'
                    ? 10
                    : event.key === 'ArrowDown'
                      ? -10
                      : 0,
            );
        } else if (enabled.value && ['+', '=', '-'].includes(event.key)) {
            event.preventDefault();
            event.key === '-' ? zoomOut() : zoomIn();
        } else if (event.key === 'Home') {
            event.preventDefault();
            resetView();
        }
    }
    watch(
        [
            () => baseViewBox.value.minX,
            () => baseViewBox.value.minY,
            () => baseViewBox.value.width,
            () => baseViewBox.value.height,
        ],
        () => {
            const base = baseViewBox.value;
            const previous = { ...camera.value };
            const wasZoomed = panZoom.isZoom.value;
            panZoom.setInitialViewBox(asBox(base), {
                overwriteCurrentIfNotZoomed: false,
            });
            if (!wasZoomed) panZoom.resetZoom();
            else {
                const width = base.width / previous.zoom,
                    height = base.height / previous.zoom;
                panZoom.setViewBox({
                    x: previous.x - width / 2,
                    y: previous.y - height / 2,
                    width,
                    height,
                });
            }
        },
    );
    watch(projection, panZoom.stopGesture);
    watch(
        [
            projection,
            () => config.value.region,
            () => JSON.stringify(config.value.countries),
        ],
        () => {
            resetView();
            const codes = config.value.countries?.length
                ? config.value.countries
                : WORLD_REGIONS[config.value.region]?.split(' ');
            if (codes) fitCountries(codes);
        },
        { immediate: true },
    );
    watch(
        () => JSON.stringify([viewBox.value, center.value]),
        () =>
            emit('viewChange', {
                projection: projection.value,
                center: [...center.value],
                zoom: panZoom.scale.value,
                viewBox: { ...viewBox.value },
            }),
    );
    return {
        viewBox,
        camera,
        isZoom,
        isViewportZoomed,
        resetZoom: resetView,
        suppressClick: panZoom.suppressClick,
        dragging: panZoom.dragging,
        zoomIn,
        zoomOut,
        resetView,
        fitCountries,
        focusCountry,
        onPointerDown: panZoom.onPointerDown,
        onPointerMove: panZoom.onPointerMove,
        onPointerUp: panZoom.onPointerUp,
        onWheel: panZoom.onWheel,
        onMapKey,
    };
}
