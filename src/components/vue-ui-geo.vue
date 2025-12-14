<script setup>
import { 
    computed, 
    defineAsyncComponent, 
    nextTick, 
    onBeforeUnmount, 
    onMounted, 
    ref, 
    toRefs, 
    watch,
} from "vue";
import { 
    convertColorToHex, 
    createUid, 
    isFunction, 
    treeShake, 
    XMLNS 
} from "../lib.js";
import usePanZoom from "../usePanZoom.js";
import { throttle } from "../canvas-lib.js";
import { useConfig } from "../useConfig.js";
import { useLoading } from "../useLoading.js";
import { usePrinter } from "../usePrinter.js";
import { useSvgExport } from "../useSvgExport.js";
import { useResponsive } from "../useResponsive.js";
import { useNestedProp } from "../useNestedProp.js";
import { useThemeCheck } from "../useThemeCheck.js";
import { useUserOptionState } from "../useUserOptionState.js";
import { useChartAccessibility } from "../useChartAccessibility.js";
import img from "../img.js";
import geo from "../geoProjections.js";
import Title from "../atoms/Title.vue";
import themes from "../themes/vue_ui_geo.json";
import BaseScanner from "../atoms/BaseScanner.vue";
import BaseZoomControls from "../atoms/BaseZoomControls.vue";

const Tooltip = defineAsyncComponent(() => import("../atoms/Tooltip.vue"));
const UserOptions = defineAsyncComponent(() => import("../atoms/UserOptions.vue"));
const PenAndPaper = defineAsyncComponent(() => import("../atoms/PenAndPaper.vue"));
const PackageVersion = defineAsyncComponent(() => import("../atoms/PackageVersion.vue"));

const props = defineProps({
    config: {
        type: Object,
        default() {
            return {};
        },
    },
    dataset: {
        type: [Array, Object],
        default() {
            return [];
        },
    },
});

const { vue_ui_geo: DEFAULT_CONFIG } = useConfig();
const { isThemeValid, warnInvalidTheme } = useThemeCheck();

const uid = ref(createUid());
const step = ref(0);
const titleStep = ref(0);

const geoChart = ref(null);
const didInitialFit = ref(false);

const dataTooltipSlot = ref(null);
const chartTitle = ref(null);
const noTitle = ref(null);
const source = ref(null);
const resizeObserver = ref(null);
const observedEl = ref(null);

const zoomControlsTop = ref(null);
const zoomControlsBottom = ref(null);

const isFullscreen = ref(false);

function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
}

const activeZoomControlsElement = computed(() => {
    if (!FINAL_CONFIG.value.style.chart.controls.show) return null;
    if (FINAL_CONFIG.value.style.chart.controls.position === "top") {
        return zoomControlsTop.value?.$el ?? null;
    }
    if (FINAL_CONFIG.value.style.chart.controls.position === "bottom") {
        return zoomControlsBottom.value?.$el ?? null;
    }
    return null;
});

const FINAL_CONFIG = ref(prepareConfig());

const { userOptionsVisible, keepUserOptionState } = useUserOptionState({ config: FINAL_CONFIG.value });
const { svgRef } = useChartAccessibility({ config: FINAL_CONFIG.value.style.chart.title });

const { loading, FINAL_DATASET } = useLoading({
    ...toRefs(props),
    FINAL_CONFIG,
    prepareConfig,
    allowEmptyDataset: true,
    skeletonDataset: [],
    skeletonConfig: treeShake({
        defaultConfig: FINAL_CONFIG.value,
        userConfig: {
            map: {
                geoJson: {
                    "type": "FeatureCollection",
                    "features": [
                        {
                        "type": "Feature",
                        "properties": { "name": "Island A" },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                            [
                                [-6, 2],
                                [-4, 2],
                                [-4, 4],
                                [-6, 4],
                                [-6, 2]
                            ]
                            ]
                        }
                        },
                        {
                        "type": "Feature",
                        "properties": { "name": "Island B" },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                            [
                                [-2, -1],
                                [1, -1],
                                [1, 2],
                                [-2, 2],
                                [-2, -1]
                            ]
                            ]
                        }
                        },
                        {
                        "type": "Feature",
                        "properties": { "name": "Island C" },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                            [
                                [3, -3],
                                [5, -3],
                                [5, -1],
                                [3, -1],
                                [3, -3]
                            ]
                            ]
                        }
                        },
                        {
                        "type": "Feature",
                        "properties": { "name": "Island D" },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                            [
                                [4, 3],
                                [7, 3],
                                [7, 5],
                                [4, 5],
                                [4, 3]
                            ]
                            ]
                        }
                        }
                    ]
                }
            },
            userOptions: { show: false },
            style: {
                chart: {
                    backgroundColor: '#99999930',
                    territory: {
                        fill: '#99999950',
                        stroke: '#8A8A8A',
                        strokeWidth: 0.5
                    }
                }
            }
        }
    })
});

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `vue-ui-geo_${uid.value}`,
    fileName: FINAL_CONFIG.value.style.chart.title.text || "vue-ui-geo",
    options: FINAL_CONFIG.value.userOptions.print,
});

function prepareConfig() {
    const mergedConfig = useNestedProp({
        userConfig: props.config,
        defaultConfig: DEFAULT_CONFIG,
    });
    
    const theme = mergedConfig.theme;
    if (!theme) return mergedConfig;

    if (!isThemeValid.value(mergedConfig)) {
        warnInvalidTheme(mergedConfig);
        return mergedConfig;
    }

    const fused = useNestedProp({
        userConfig: themes[theme] || props.config,
        defaultConfig: mergedConfig
    });

    const finalConfig = useNestedProp({
        userConfig: props.config,
        defaultConfig: fused
    });

    return finalConfig;
}

function teardownResponsive() {
    if (resizeObserver.value) {
        if (observedEl.value) {
            resizeObserver.value.unobserve(observedEl.value);
        }
        resizeObserver.value.disconnect();
        resizeObserver.value = null;
        observedEl.value = null;
    }
}

const isResponsiveActive = computed(() => {
    return Boolean(FINAL_CONFIG.value.responsive) && !isFullscreen.value;
});

watch(
    () => isFullscreen.value,
    async (fullscreen) => {
        if (fullscreen) {
            teardownResponsive();

            WIDTH.value = Number(FINAL_CONFIG.value.style.chart.dimensions.width) || WIDTH.value;
            HEIGHT.value = Number(FINAL_CONFIG.value.style.chart.dimensions.height) || HEIGHT.value;

            await nextTick();
            didInitialFit.value = false;
            requestAnimationFrame(() => {
                if (didInitialFit.value) return;
                resetPanZoomToBaseViewBox();
            });
            return;
        }

        if (FINAL_CONFIG.value.responsive) {
            await nextTick();
            prepareChart();
        }
    }
);

function prepareChart() {
    teardownResponsive();
    if (!isResponsiveActive.value) return;

    const handleResize = throttle(() => {
        if (!geoChart.value) return;

        const { width, height } = useResponsive({
            chart: geoChart.value,
            noTitle: hasOptionsNoTitle.value ? noTitle.value : null,
            title: FINAL_CONFIG.value.style.chart.title.text ? chartTitle.value : null,
            legend: activeZoomControlsElement.value,
            source: source.value,
        });

        requestAnimationFrame(() => {
            WIDTH.value = Math.max(0.1, Number(width) || 0.1);
            HEIGHT.value = Math.max(0.1, Number(height) || 0.1) - 24;
        });
    });

    resizeObserver.value = new ResizeObserver(handleResize);
    observedEl.value = geoChart.value ? geoChart.value.parentNode : null;
    if (observedEl.value) resizeObserver.value.observe(observedEl.value);

    handleResize();
}

const hasOptionsNoTitle = computed(() => {
    return FINAL_CONFIG.value.userOptions.show && !FINAL_CONFIG.value.style.chart.title.text;
});

const mutableConfig = ref({
    showTooltip: FINAL_CONFIG.value.style.chart.tooltip.show,
});

watch(
    () => props.config,
    () => {
        FINAL_CONFIG.value = prepareConfig();
        mutableConfig.value.showTooltip = FINAL_CONFIG.value.style.chart.tooltip.show;
        panZoomActive.value = FINAL_CONFIG.value.style.chart.zoom.active;
        WIDTH.value = FINAL_CONFIG.value.style.chart.dimensions.width;
        HEIGHT.value = FINAL_CONFIG.value.style.chart.dimensions.height;
        prepareChart();
        titleStep.value += 1;
        step.value += 1;
    },
    { deep: true }
);

const { projections, getProjectedBounds } = geo;
const projectionName = computed(() => FINAL_CONFIG.value?.projection || "equirectangular");

const projectionFunction = computed(() => {
    const fn = projections?.[projectionName.value];
    return typeof fn === "function" ? fn : projections.equirectangular;
});

const geoJsonInput = computed(() => FINAL_CONFIG.value.map.geoJson ?? null);

const DEFAULT_PROJECTIONS = {
    aitoff: { width: 1000, height: 500 },
    azimuthalEquidistant: { width: 1000, height: 1000 },
    bonne: { width: 1000, height: 1000 },
    equirectangular: { width: 1000, height: 700 },
    gallPeters: { width: 1000, height: 800 },
    globe: { width: 1000, height: 1000 },
    hammer: { width: 1000, height: 500 },
    mercator: { width: 1000, height: 750 },
    mollweide: { width: 1000, height: 600 },
    robinson: { width: 1000, height: 600 },
    sinusoidal: { width: 1000, height: 500 },
    vanDerGrinten: { width: 1000, height: 1000 },
    winkelTripel: { width: 1000, height: 1000 },
};

const WIDTH = ref(FINAL_CONFIG.value.style.chart.dimensions.width);
const HEIGHT = ref(FINAL_CONFIG.value.style.chart.dimensions.height);

const projectionPlaneSizes = computed(() => {
    const defaults =
        DEFAULT_PROJECTIONS[projectionName.value] ||
        DEFAULT_PROJECTIONS.equirectangular;

    return { width: defaults.width, height: defaults.height };
});

const viewportSizes = computed(() => {
    const defaults = projectionPlaneSizes.value;

    const configuredWidth = WIDTH.value;
    const configuredHeight = HEIGHT.value;
    const hasWidth = Number.isFinite(configuredWidth) && configuredWidth > 0;
    const hasHeight = Number.isFinite(configuredHeight) && configuredHeight > 0;

    if (hasWidth && hasHeight) {
        return { width: configuredWidth, height: configuredHeight };
    }

    if (hasWidth && !hasHeight) {
        const ratio = defaults.height / defaults.width;
        return { width: configuredWidth, height: configuredWidth * ratio };
    }

    if (!hasWidth && hasHeight) {
        const ratio = defaults.width / defaults.height;
        return { width: configuredHeight * ratio, height: configuredHeight };
    }

    return { width: defaults.width, height: defaults.height };
});

function normalizeGeoJson(input) {
    if (!input) return { type: "FeatureCollection", features: [] };

    if (Array.isArray(input)) {
        return {
            type: "FeatureCollection",
            features: input.filter((f) => f && f.type === "Feature"),
        };
    }

    if (input.type === "FeatureCollection" && Array.isArray(input.features)) {
        return input;
    }

    if (input.type === "Feature" && input.geometry) {
        return { type: "FeatureCollection", features: [input] };
    }

    if (input.type === "GeometryCollection" && Array.isArray(input.geometries)) {
        return {
            type: "FeatureCollection",
            features: input.geometries
                .filter(Boolean)
                .map((geometry, index) => ({
                    type: "Feature",
                    geometry,
                    properties: { name: `Geometry ${index + 1}` },
                })),
        };
    }

    if (typeof input.type === "string" && input.coordinates) {
        return {
            type: "FeatureCollection",
            features: [{ type: "Feature", geometry: input, properties: { name: "Geometry" } }],
        };
    }

    return { type: "FeatureCollection", features: [] };
}

function flattenFeatureCollectionToRenderableFeatures(featureCollection) {
    const features = Array.isArray(featureCollection?.features) ? featureCollection.features : [];
    return features
        .filter((feature) => feature && feature.type === "Feature" && feature.geometry)
        .map((feature, index) => {
            const properties = feature.properties || {};
            const name =
                properties.name ||
                properties.admin ||
                properties.NAME ||
                properties.label ||
                properties.description ||
                properties.DESCRIPTION ||
                "";

            return {
                feature,
                geometry: feature.geometry,
                properties,
                name,
                uid: `map-feature-${uid.value}-${index}`,
                index
            };
        });
}

const geoJsonFeatureCollection = computed(() => normalizeGeoJson(geoJsonInput.value));
const renderableFeatures = computed(() =>
    flattenFeatureCollectionToRenderableFeatures(geoJsonFeatureCollection.value)
);

const projectionCenter = computed(() => {
    const center = FINAL_CONFIG.value?.map?.center;
    const fallback = [0, 0];
    if (!Array.isArray(center) || center.length !== 2) return fallback;

    const longitude = Number(center[0]);
    const latitude = Number(center[1]);
    if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) return fallback;

    return [longitude, latitude];
});

function projectGeoPoint([longitude, latitude]) {
    return projectionFunction.value(
        [longitude, latitude],
        projectionPlaneSizes.value.width,
        projectionPlaneSizes.value.height,
        projectionCenter.value
    );
}

function geometryToSvgPath(geometry) {
    if (!geometry) return "";

    const drawPolygonCoordinates = (polygonCoordinates) => {
        return (polygonCoordinates || [])
            .map((ring) => {
                const projectedPoints = (ring || [])
                    .map(([longitude, latitude]) => projectGeoPoint([longitude, latitude]))
                    .filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y));

                if (projectedPoints.length < 3) return "";
                return "M" + projectedPoints.map(([x, y]) => `${x},${y}`).join("L") + "Z";
            })
            .filter(Boolean)
            .join(" ");
    };

    if (geometry.type === "Polygon") return drawPolygonCoordinates(geometry.coordinates);

    if (geometry.type === "MultiPolygon") {
        return (geometry.coordinates || [])
            .map(drawPolygonCoordinates)
            .filter(Boolean)
            .join(" ");
    }

    return "";
}

const territoryPaths = computed(() => {
    return renderableFeatures.value
        .map((item) => {
            const path = geometryToSvgPath(item.geometry);
            if (!path) return null;
            return { ...item, path };
        })
        .filter(Boolean);
});

const projectedBounds = computed(() => {
    const polygonFeatures = renderableFeatures.value.filter((item) => {
        const type = item.geometry?.type;
        return type === "Polygon" || type === "MultiPolygon";
    });

    if (!polygonFeatures.length) return null;

    return getProjectedBounds(
        projectionFunction.value,
        polygonFeatures.map((item) => item.feature),
        projectionPlaneSizes.value.width,
        projectionPlaneSizes.value.height,
        projectionCenter.value
    );
});

function computeFitTransform({ bounds, targetWidth, targetHeight, padding }) {
    if (!bounds || !(bounds.width > 0) || !(bounds.height > 0)) {
        return { scale: 1, translateX: 0, translateY: 0, transform: "" };
    }

    const pad = Number.isFinite(Number(padding)) ? Number(padding) : 0;

    const availableWidth = Math.max(1, targetWidth - pad * 2);
    const availableHeight = Math.max(1, targetHeight - pad * 2);

    const scaleX = availableWidth / bounds.width;
    const scaleY = availableHeight / bounds.height;

    const scale = Math.min(scaleX, scaleY);

    const scaledWidth = bounds.width * scale;
    const scaledHeight = bounds.height * scale;

    const offsetX = pad + (availableWidth - scaledWidth) / 2;
    const offsetY = pad + (availableHeight - scaledHeight) / 2;

    const translateX = offsetX - bounds.minX * scale;
    const translateY = offsetY - bounds.minY * scale;

    return {
        scale,
        translateX,
        translateY,
        transform: `translate(${translateX} ${translateY}) scale(${scale})`,
    };
}

const mapFitTransform = computed(() => {
    const bounds = projectedBounds.value;
    if (!bounds) return { scale: 1, translateX: 0, translateY: 0, transform: "" };

    const fitPaddingRaw = FINAL_CONFIG.value?.map?.fitPadding;
    const padding = Number.isFinite(Number(fitPaddingRaw)) ? Number(fitPaddingRaw) : 0;

    return computeFitTransform({
        bounds,
        targetWidth: viewportSizes.value.width,
        targetHeight: viewportSizes.value.height,
        padding,
    });
});

const computedViewBox = computed(() => {
    const width = viewportSizes.value.width;
    const height = viewportSizes.value.height;
    return `0 0 ${width} ${height}`;
});

const panZoomActive = ref(FINAL_CONFIG.value.style.chart.zoom.active);

const {
    viewBox: panZoomViewBox,
    resetZoom,
    setInitialViewBox,
    scale,
    zoomByFactor,
} = usePanZoom(
    svgRef,
    { x: 0, y: 0, width: viewportSizes.value.width, height: viewportSizes.value.height },
    1,
    panZoomActive
);

function toggleZoom() {
    panZoomActive.value = !panZoomActive.value;
}

function resetPanZoomToBaseViewBox() {
    const baseBox = getFocusedBaseViewBoxFromMapCenter();
    setInitialViewBox(baseBox, { overwriteCurrentIfNotZoomed: true });
    didInitialFit.value = true;
}

const viewBox = computed(() => {
    const vb = panZoomViewBox.value;
    if (!vb) return computedViewBox.value;
    return `${vb.x} ${vb.y} ${vb.width} ${vb.height}`;
});

const zoomStepFactor = 1.5;

function zoomIn() {
    zoomByFactor(zoomStepFactor, true);
}

function zoomOut() {
    zoomByFactor(1 / zoomStepFactor, true);
}

async function hardResetZoom() {
    const focusedBaseBox = getFocusedBaseViewBoxFromMapCenter();
    setInitialViewBox(focusedBaseBox, { overwriteCurrentIfNotZoomed: true });

    resetZoom(true);
}

watch(
    () => [
        FINAL_CONFIG.value.projection,
        FINAL_CONFIG.value.map.center[0],
        FINAL_CONFIG.value.map.center[1],
        FINAL_CONFIG.value.map.fitPadding,
        geoJsonInput.value,
    ],
    async () => {
        didInitialFit.value = false;
        await nextTick();
        requestAnimationFrame(() => {
            if (didInitialFit.value) return;
            resetPanZoomToBaseViewBox();
        });
    },
    { deep: false }
);

watch(
    () => [WIDTH.value, HEIGHT.value, isResponsiveActive.value],
    async () => {
        if (!isResponsiveActive.value) return;

        await nextTick();
        setInitialViewBox(
            { x: 0, y: 0, width: viewportSizes.value.width, height: viewportSizes.value.height },
            { overwriteCurrentIfNotZoomed: true }
        );

        didInitialFit.value = false;
        requestAnimationFrame(() => {
            if (didInitialFit.value) return;
            resetPanZoomToBaseViewBox();
        });
    },
    { flush: "post" }
);

function normalizePointsDataset(_dataset) {
    if (!_dataset) return [];

    if (_dataset.type === "FeatureCollection" && Array.isArray(_dataset.features)) {
        return _dataset.features
            .filter((feature) => feature?.type === "Feature" && feature.geometry?.type === "Point")
            .map((feature, index) => {
                const properties = feature.properties || {};
                const name = properties.name || properties.label || properties.title || `Point ${index + 1}`;
                const coordinates = feature.geometry.coordinates;

                return {
                    uid: `map-point-${uid.value}-${index}`,
                    name,
                    coordinates,
                    color: properties.color ?? null,
                    radius: properties.radius ?? null,
                    hoverRadiusRatio: FINAL_CONFIG.value.style.chart.points.hoverRadiusRatio,
                    description: properties.description ?? null,
                    original: feature,
                    index,
                };
            });
    }

    if (Array.isArray(_dataset)) {
        return _dataset
            .map((row, index) => {
                let coordinates = null;
                let name = `Point ${index + 1}`;
                let description = null;
                let color = null;
                let radius = null;

                if (Array.isArray(row) && row.length >= 2) {
                    coordinates = [Number(row[0]), Number(row[1])];
                } else if (row && typeof row === "object") {
                    if (Array.isArray(row.coordinates) && row.coordinates.length >= 2) {
                        coordinates = [Number(row.coordinates[0]), Number(row.coordinates[1])];
                    } else if (Number.isFinite(Number(row.lon)) && Number.isFinite(Number(row.lat))) {
                        coordinates = [Number(row.lon), Number(row.lat)];
                    }
                    if (typeof row.name === "string" && row.name.trim()) name = row.name;
                    if (row.description != null) description = row.description;
                    if (row.color != null) color = row.color;
                    if (row.radius != null) radius = row.radius;
                }

                const longitude = coordinates ? coordinates[0] : NaN;
                const latitude = coordinates ? coordinates[1] : NaN;
                if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) return null;

                return {
                    uid: `map-point-${uid.value}-${index}`,
                    name,
                    coordinates: [longitude, latitude],
                    color,
                    radius,
                    hoverRadiusRatio: FINAL_CONFIG.value.style.chart.points.hoverRadiusRatio,
                    description,
                    original: row,
                    index,
                };
            })
            .filter(Boolean);
    }

    if (typeof _dataset === "object") {
        return Object.entries(_dataset)
            .map(([key, value], index) => {
                if (!value || typeof value !== "object") return null;
                const coordinates = Array.isArray(value.coordinates) ? value.coordinates : null;
                if (!coordinates || coordinates.length < 2) return null;

                const longitude = Number(coordinates[0]);
                const latitude = Number(coordinates[1]);
                if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) return null;

                return {
                    uid: `map-point-${uid.value}-${index}-${key}`,
                    name: value.name || key,
                    coordinates: [longitude, latitude],
                    color: value.color ?? null,
                    radius: value.radius ?? null,
                    hoverRadiusRatio: FINAL_CONFIG.value.style.chart.points.hoverRadiusRatio,
                    description: value.description ?? null,
                    original: value,
                    index,
                };
            })
            .filter(Boolean);
    }

    return [];
}

const points = computed(() => normalizePointsDataset(FINAL_DATASET.value));

const projectedPoints = computed(() => {
    return points.value
        .map((point) => {
            const [x, y] = projectGeoPoint(point.coordinates);
            if (!Number.isFinite(x) || !Number.isFinite(y)) return null;

            return {
                ...point,
                x,
                y,
                fill: point.color ? convertColorToHex(point.color) : FINAL_CONFIG.value.style.chart.points.fill,
                radius: Number.isFinite(Number(point.radius))
                    ? Number(point.radius)
                    : FINAL_CONFIG.value.style.chart.points.radius,
            };
        })
        .filter(Boolean);
});

const isTooltipVisible = ref(false);
const tooltipContent = ref("");
const useCustomFormat = ref(false);
const highlightedPointKey = ref(null);
const highlightedTerritoryKey = ref(null);

function showTooltipWithHtml(html) {
    tooltipContent.value = html;
    isTooltipVisible.value = true;
}

function hideTooltip() {
    isTooltipVisible.value = false;
    tooltipContent.value = "";
}

function escapeHtml(text) {
    return String(text ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function formatPointTooltip(point) {
    dataTooltipSlot.value = {
        datapoint: point,
        seriesIndex: point.index,
        series: points.value,
        config: FINAL_CONFIG.value,
    };

    useCustomFormat.value = false;
    const customFormat = FINAL_CONFIG.value.style.chart.tooltip.customFormat;

    if (isFunction(customFormat)) {
        try {
            const customFormatString = customFormat(dataTooltipSlot.value);
            if (typeof customFormatString === "string") {
                useCustomFormat.value = true;
                return customFormatString;
            }
        } catch (err) {
            console.warn("Custom format cannot be applied.");
            useCustomFormat.value = false;
        }
    }

    const title = escapeHtml(point.name);
    const extra = point.description != null ? `<div style="margin-top:6px">${escapeHtml(point.description)}</div>` : "";
    return `<div><div style="font-weight:600">${title}</div>${extra}</div>`;
}

function formatTerritoryTooltip(territory) {
    useCustomFormat.value = false;
    const customFormat = FINAL_CONFIG.value.style.chart.tooltip.customFormat;

    if (isFunction(customFormat)) {
        try {
            const customFormatString = customFormat({
                datapoint: territory,
                config: FINAL_CONFIG.value,
            });
            if (typeof customFormatString === "string") {
                useCustomFormat.value = true;
                return customFormatString;
            }
        } catch (err) {
            console.warn("Custom format cannot be applied.");
            useCustomFormat.value = false;
        }
    }

    const title = escapeHtml(territory.name);
    return `<div><div style="font-weight:600">${title}</div></div>`;
}

function onTerritoryEnter(territory) {
    if (FINAL_CONFIG.value.events.territoryEnter) {
        FINAL_CONFIG.value.events.territoryEnter({ datapoint: territory, seriesIndex: territory.index });
    }

    if (!territory.name) return;
    highlightedTerritoryKey.value = territory.uid;
    showTooltipWithHtml(formatTerritoryTooltip(territory));
}

function onTerritoryLeave(territory) {
    highlightedTerritoryKey.value = null;
    hideTooltip();
    
    if (FINAL_CONFIG.value.events.territoryLeave) {
        FINAL_CONFIG.value.events.territoryLeave({ datapoint: territory, seriesIndex: territory.index })
    }
}

function onTerritoryClick(territory) {
    if (FINAL_CONFIG.value.events.territoryClick) {
        FINAL_CONFIG.value.events.territoryClick({ datapoint: territory, seriesIndex: territory.index})
    }
}

function onPointEnter(point) {
    highlightedPointKey.value = point.uid;
    showTooltipWithHtml(formatPointTooltip(point));

    if (FINAL_CONFIG.value.events.datapointEnter) {
        FINAL_CONFIG.value.events.datapointEnter({ datapoint: point, seriesIndex: point.index });
    }
}

function onPointLeave(point) {
    highlightedPointKey.value = null;
    hideTooltip();

    if (FINAL_CONFIG.value.events.datapointLeave) {
        FINAL_CONFIG.value.events.datapointLeave({ datapoint: point, seriesIndex: point.index });
    }
}

const hasPointClickEvent = computed(() => {
    return !!FINAL_CONFIG.value.events.datapointClick && typeof FINAL_CONFIG.value.events.datapointClick === "function";
});

function onPointClick(point) {
    if (hasPointClickEvent.value) {
        FINAL_CONFIG.value.events.datapointClick({ datapoint: point, seriesIndex: point.index });
    }
}

const territoryStyle = computed(() => FINAL_CONFIG.value.style.chart.territory);
const pointStyle = computed(() => FINAL_CONFIG.value.style.chart.points);

onMounted(async () => {
    prepareChart();
    await nextTick();
    requestAnimationFrame(() => {
        if (didInitialFit.value) return;
        resetPanZoomToBaseViewBox();
            if (FINAL_CONFIG.value.map.center[0] || FINAL_CONFIG.value.map.center[1]) {
                focusLocation(FINAL_CONFIG.value.map.center, { animated: false });
            }
    });
});

onBeforeUnmount(() => {
    teardownResponsive();
});

function toggleTooltip() {
    mutableConfig.value.showTooltip = !mutableConfig.value.showTooltip;
}

const isAnnotator = ref(false);

function toggleAnnotator() {
    isAnnotator.value = !isAnnotator.value;
}

watch(
    () => isAnnotator.value,
    (isActive) => {
        panZoomActive.value = !isActive;
    }
);

const svgBg = computed(() => FINAL_CONFIG.value.style.chart.backgroundColor);
const svgTitle = computed(() => FINAL_CONFIG.value.style.chart.title);

const { exportSvg, getSvg } = useSvgExport({
    svg: svgRef,
    title: svgTitle,
    legend: undefined,
    legendItems: undefined,
    backgroundColor: svgBg,
});

async function generateSvg({ isCb }) {
    if (isCb) {
        const { blob, url, text, dataUrl } = await getSvg();
        FINAL_CONFIG.value.userOptions.callbacks.svg({ blob, url, text, dataUrl });
    } else {
        exportSvg();
    }
}

async function getImage({ scale = 2} = {}) {
    if (!geoChart.value) return;
    const { width, height } = geoChart.value.getBoundingClientRect();
    const aspectRatio = width / height; 
    const { imageUri, base64 } = await img({ domElement: geoChart.value, base64: true, img: true, scale})
    return { 
        imageUri, 
        base64, 
        title: FINAL_CONFIG.value.style.chart.title.text,
        width,
        height,
        aspectRatio
    }
}

const isInteracting = ref(false);
let wheelStopTimer = null;

function startInteraction() {
    if (!panZoomActive.value) return;
    isInteracting.value = true;
}

function stopInteraction() {
    isInteracting.value = false;
}

function onWheelInteraction() {
    if (!panZoomActive.value) return;
    isInteracting.value = true;

    if (wheelStopTimer) clearTimeout(wheelStopTimer);
    wheelStopTimer = setTimeout(() => {
        isInteracting.value = false;
        wheelStopTimer = null;
    }, 140);
}

onBeforeUnmount(() => {
    if (wheelStopTimer) clearTimeout(wheelStopTimer);
});

function applyFitToPoint(point) {
    const transform = mapFitTransform.value;
    const scaleValue = Number(transform?.scale) || 1;
    const translateXValue = Number(transform?.translateX) || 0;
    const translateYValue = Number(transform?.translateY) || 0;

    return {
        x: point.x * scaleValue + translateXValue,
        y: point.y * scaleValue + translateYValue,
    };
}

async function focusLocation([longitude, latitude], { animated = true } = {}) {
    const lon = Number(longitude);
    const lat = Number(latitude);
    if (!Number.isFinite(lon) || !Number.isFinite(lat)) return;

    const projected = projectGeoPoint([lon, lat]);
    const xPlane = projected?.[0];
    const yPlane = projected?.[1];
    if (!Number.isFinite(xPlane) || !Number.isFinite(yPlane)) return;

    // Convert into viewport coordinates
    const focusedViewportPoint = applyFitToPoint({ x: xPlane, y: yPlane });

    const current = panZoomViewBox.value
        ? { ...panZoomViewBox.value }
        : { x: 0, y: 0, width: viewportSizes.value.width, height: viewportSizes.value.height };

    const nextBox = {
        x: focusedViewportPoint.x - current.width / 2,
        y: focusedViewportPoint.y - current.height / 2,
        width: current.width,
        height: current.height,
    };

    if (!animated) {
        panZoomViewBox.value = nextBox;
        return;
    }

    const from = { ...current };
    const to = { ...nextBox };
    const duration = 250;
    let t0 = null;

    const stepFrame = (ts) => {
        if (t0 == null) t0 = ts;
        const p = Math.min((ts - t0) / duration, 1);

        panZoomViewBox.value = {
            x: from.x + (to.x - from.x) * p,
            y: from.y + (to.y - from.y) * p,
            width: from.width + (to.width - from.width) * p,
            height: from.height + (to.height - from.height) * p,
        };

        if (p < 1) requestAnimationFrame(stepFrame);
    };

    requestAnimationFrame(stepFrame);
}

watch(
    () => [
        FINAL_CONFIG.value.projection,
        FINAL_CONFIG.value.map.fitPadding,
        geoJsonInput.value,
    ],
    async () => {
        didInitialFit.value = false;
        await nextTick();
        requestAnimationFrame(() => {
            if (didInitialFit.value) return;
            resetPanZoomToBaseViewBox();
        });
    },
    { deep: false }
);

function getFocusedBaseViewBoxFromMapCenter() {
    const centerArray = FINAL_CONFIG.value?.map?.center;

    const longitude = Number(centerArray?.[0]);
    const latitude = Number(centerArray?.[1]);

    const hasCenter =
        Array.isArray(centerArray) &&
        centerArray.length === 2 &&
        Number.isFinite(longitude) &&
        Number.isFinite(latitude) &&
        (longitude !== 0 || latitude !== 0);

    const baseWidth = viewportSizes.value.width;
    const baseHeight = viewportSizes.value.height;

    if (!hasCenter) {
        return { x: 0, y: 0, width: baseWidth, height: baseHeight };
    }

    const projected = projectGeoPoint([longitude, latitude]);
    const xPlane = projected?.[0];
    const yPlane = projected?.[1];

    if (!Number.isFinite(xPlane) || !Number.isFinite(yPlane)) {
        return { x: 0, y: 0, width: baseWidth, height: baseHeight };
    }

    const focusedViewportPoint = applyFitToPoint({ x: xPlane, y: yPlane });

    return {
        x: focusedViewportPoint.x - baseWidth / 2,
        y: focusedViewportPoint.y - baseHeight / 2,
        width: baseWidth,
        height: baseHeight,
    };
}

defineExpose({
    getImage,
    generatePdf,
    generateImage,
    generateSvg,
    toggleTooltip,
    toggleAnnotator,
    toggleFullscreen,
    zoomIn,
    zoomOut,
    resetZoom,
    focusLocation
});

</script>

<template>
    <div
        :class="`vue-data-ui-component vue-ui-geo ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''} ${isResponsiveActive ? 'vue-ui-geo-responsive' : ''} ${isInteracting ? 'vue-ui-geo-interacting' : ''}`"
        ref="geoChart"
        :id="`map_${uid}`"
        dir="auto"
        :style="{
            fontFamily: FINAL_CONFIG.style.fontFamily,
            width: '100%',
            backgroundColor: FINAL_CONFIG.style.chart.backgroundColor,
            height: isResponsiveActive ? `${HEIGHT}px` : undefined,
        }"
    >
        <div
            ref="noTitle"
            v-if="hasOptionsNoTitle"
            class="vue-data-ui-no-title-space"
            :style="`height:36px; width: 100%;background:transparent`"
        />

        <div
            ref="chartTitle"
            v-if="FINAL_CONFIG.style.chart.title.text"
            :style="`width:100%;background:transparent;padding-bottom:12px`"
        >
            <Title
                :key="`title_${titleStep}`"
                :config="{
                    title: {
                        cy: 'geo-title',
                        ...FINAL_CONFIG.style.chart.title,
                    },
                    subtitle: {
                        cy: 'geo-subtitle',
                        ...FINAL_CONFIG.style.chart.title.subtitle,
                    },
                }"
            />
        </div>

        <PenAndPaper
            v-if="FINAL_CONFIG.userOptions.buttons.annotator"
            :svgRef="svgRef"
            :backgroundColor="FINAL_CONFIG.style.chart.backgroundColor"
            :color="FINAL_CONFIG.style.chart.color"
            :active="isAnnotator"
            @close="toggleAnnotator"
        >
            <template #annotator-action-close>
                <slot name="annotator-action-close" />
            </template>
            <template #annotator-action-color="{ color }">
                <slot name="annotator-action-color" v-bind="{ color }" />
            </template>
            <template #annotator-action-draw="{ mode }">
                <slot name="annotator-action-draw" v-bind="{ mode }" />
            </template>
            <template #annotator-action-undo="{ disabled }">
                <slot name="annotator-action-undo" v-bind="{ disabled }" />
            </template>
            <template #annotator-action-redo="{ disabled }">
                <slot name="annotator-action-redo" v-bind="{ disabled }" />
            </template>
            <template #annotator-action-delete="{ disabled }">
                <slot name="annotator-action-delete" v-bind="{ disabled }" />
            </template>
        </PenAndPaper>

        <UserOptions
            ref="userOptionsRef"
            :key="`user_options_${step}`"
            v-if="FINAL_CONFIG.userOptions.show && (keepUserOptionState ? true : userOptionsVisible)"
            :backgroundColor="FINAL_CONFIG.style.chart.backgroundColor"
            :color="FINAL_CONFIG.style.chart.color"
            :isPrinting="isPrinting"
            :isImaging="isImaging"
            :uid="uid"
            :hasXls="false"
            :hasTable="false"
            :hasTooltip="FINAL_CONFIG.userOptions.buttons.tooltip && FINAL_CONFIG.style.chart.tooltip.show"
            :hasPdf="FINAL_CONFIG.userOptions.buttons.pdf"
            :hasImg="FINAL_CONFIG.userOptions.buttons.img"
            :hasSvg="FINAL_CONFIG.userOptions.buttons.svg"
            :hasFullscreen="FINAL_CONFIG.userOptions.buttons.fullscreen"
            :hasAnnotator="FINAL_CONFIG.userOptions.buttons.annotator"
            :hasZoom="FINAL_CONFIG.userOptions.buttons.zoom"
            :isZoom="panZoomActive"
            :isFullscreen="isFullscreen"
            :isTooltip="mutableConfig.showTooltip"
            :titles="{ ...FINAL_CONFIG.userOptions.buttonTitles }"
            :chartElement="geoChart"
            :position="FINAL_CONFIG.userOptions.position"
            :isAnnotation="isAnnotator"
            :callbacks="FINAL_CONFIG.userOptions.callbacks"
            :printScale="FINAL_CONFIG.userOptions.print.scale"
            @toggleFullscreen="toggleFullscreen"
            @generatePdf="generatePdf"
            @generateImage="generateImage"
            @generateSvg="generateSvg"
            @toggleTooltip="toggleTooltip"
            @toggleAnnotator="toggleAnnotator"
            @toggleZoom="toggleZoom"
            :style="{
                visibility: keepUserOptionState ? (userOptionsVisible ? 'visible' : 'hidden') : 'visible',
            }"
        >
            <template #menuIcon="{ isOpen, color }" v-if="$slots.menuIcon">
                <slot name="menuIcon" v-bind="{ isOpen, color }" />
            </template>
            <template #optionTooltip v-if="$slots.optionTooltip">
                <slot name="optionTooltip" />
            </template>
            <template #optionPdf v-if="$slots.optionPdf">
                <slot name="optionPdf" />
            </template>
            <template #optionImg v-if="$slots.optionImg">
                <slot name="optionImg" />
            </template>
            <template #optionSvg v-if="$slots.optionSvg">
                <slot name="optionSvg" />
            </template>
            <template v-if="$slots.optionFullscreen" template #optionFullscreen="{ toggleFullscreen, isFullscreen }">
                <slot name="optionFullscreen" v-bind="{ toggleFullscreen, isFullscreen }" />
            </template>
            <template v-if="$slots.optionAnnotator" #optionAnnotator="{ toggleAnnotator, isAnnotator }">
                <slot name="optionAnnotator" v-bind="{ toggleAnnotator, isAnnotator }" />
            </template>
            <template v-if="$slots.optionZoom" #optionZoom="{ toggleZoom, isZoomLocked }">
                <slot name="optionZoom" v-bind="{ toggleZoom, isZoomLocked }" />
            </template>
        </UserOptions>

        <BaseZoomControls
            ref="zoomControlsTop"
            v-if="FINAL_CONFIG.style.chart.controls.position === 'top' && FINAL_CONFIG.style.chart.controls.show && !loading"
            :config="FINAL_CONFIG"
            :scale="scale"
            :isFullscreen="isFullscreen"
            @zoomIn="zoomIn"
            @zoomOut="zoomOut"
            @resetZoom="hardResetZoom"
        />

        <svg
            ref="svgRef"
            :xmlns="XMLNS"
            :viewBox="viewBox"
            preserveAspectRatio="xMidYMid meet"
            :style="{
                display: 'block',
                width: '100%',
                height: isResponsiveActive ? `${HEIGHT}px` : 'auto',
                background: FINAL_CONFIG.style.chart.backgroundColor,
                touchAction: panZoomActive ? 'none' : 'auto',
                cursor: panZoomActive ? (isInteracting ? 'grabbing' : 'grab') : 'default',
            }"
            :id="`vue-ui-geo_${uid}`"
            @pointerdown="startInteraction"
            @pointerup="stopInteraction"
            @pointercancel="stopInteraction"
            @pointerleave="stopInteraction"
            @wheel="onWheelInteraction"
        >
            <PackageVersion />

            <g
                :transform="mapFitTransform.transform"
                :style="{ pointerEvents: isInteracting ? 'none' : 'auto' }"
            >
                <g>
                    <path
                        class="vue-ui-geo-territory"
                        data-cy="tooltip-trap-territory"
                        v-for="territory in territoryPaths"
                        :key="territory.uid"
                        :d="territory.path"
                        :fill="highlightedTerritoryKey === territory.uid ? territoryStyle.hover.fill : territoryStyle.fill"
                        :stroke="highlightedTerritoryKey === territory.uid ? territoryStyle.hover.stroke : territoryStyle.stroke"
                        :stroke-width="highlightedTerritoryKey === territory.uid ? territoryStyle.hover.strokeWidth : territoryStyle.strokeWidth"
                        vector-effect="non-scaling-stroke"
                        @mouseenter="onTerritoryEnter(territory)"
                        @mouseleave="onTerritoryLeave(territory)"
                        @click="onTerritoryClick(territory)"
                    />
                </g>

                <g v-for="point in projectedPoints" :key="point.uid">
                    <slot name="datapoint" v-bind="{ point, onPointEnter, onPointLeave, onPointClick, highlighted: highlightedPointKey === point.uid }">
                        <circle
                            :class="{
                                'vue-ui-geo-point': true,
                                'vue-ui-geo-point-with-event': hasPointClickEvent,
                            }"
                            :cx="point.x"
                            :cy="point.y"
                            :r="highlightedPointKey === point.uid ? point.radius * point.hoverRadiusRatio : point.radius"
                            :fill="point.fill"
                            :stroke="pointStyle.stroke"
                            :stroke-width="pointStyle.strokeWidth"
                            vector-effect="non-scaling-stroke"
                            @mouseenter="onPointEnter(point)"
                            @mouseleave="onPointLeave(point)"
                            @click="onPointClick(point)"
                        />
                    </slot>

                    <text
                        class="vue-ui-geo-point-label"
                        v-if="FINAL_CONFIG.style.chart.points.labels.show"
                        :x="point.x"
                        :y="
                            point.y +
                            (highlightedPointKey === point.uid
                                ? point.radius * point.hoverRadiusRatio
                                : point.radius) +
                            FINAL_CONFIG.style.chart.points.labels.offsetY
                            + (1 * FINAL_CONFIG.style.chart.points.labels.fontSizeRatio)
                        "
                        text-anchor="middle"
                        :fill="FINAL_CONFIG.style.chart.points.labels.color"
                        :font-size="1 * FINAL_CONFIG.style.chart.points.labels.fontSizeRatio"
                    >
                        {{ point.name }}
                    </text>
                </g>
            </g>
            <slot name="svg" :svg="{
                drawingArea: viewBox,
                data: {
                    territoryPaths,
                    projectedPoints
                }
            }"/>
        </svg>

        <div v-if="$slots.watermark" class="vue-data-ui-watermark">
            <slot name="watermark" v-bind="{ isPrinting: isPrinting || isImaging }"/>
        </div>

        <BaseZoomControls
            ref="zoomControlsBottom"
            v-if="FINAL_CONFIG.style.chart.controls.position === 'bottom' && FINAL_CONFIG.style.chart.controls.show && !loading"
            :config="FINAL_CONFIG"
            :scale="scale"
            :isFullscreen="isFullscreen"
            @zoomIn="zoomIn"
            @zoomOut="zoomOut"
            @resetZoom="hardResetZoom"
        />

        <Tooltip
            :show="mutableConfig.showTooltip && isTooltipVisible"
            :backgroundColor="FINAL_CONFIG.style.chart.tooltip.backgroundColor"
            :color="FINAL_CONFIG.style.chart.tooltip.color"
            :fontSize="FINAL_CONFIG.style.chart.tooltip.fontSize"
            :borderRadius="FINAL_CONFIG.style.chart.tooltip.borderRadius"
            :borderColor="FINAL_CONFIG.style.chart.tooltip.borderColor"
            :borderWidth="FINAL_CONFIG.style.chart.tooltip.borderWidth"
            :backgroundOpacity="FINAL_CONFIG.style.chart.tooltip.backgroundOpacity"
            :position="FINAL_CONFIG.style.chart.tooltip.position"
            :offsetY="FINAL_CONFIG.style.chart.tooltip.offsetY"
            :parent="geoChart"
            :content="tooltipContent"
            :isCustom="useCustomFormat"
            :isFullscreen="isFullscreen"
            :smooth="FINAL_CONFIG.style.chart.tooltip.smooth"
            :backdropFilter="FINAL_CONFIG.style.chart.tooltip.backdropFilter"
            :smoothForce="FINAL_CONFIG.style.chart.tooltip.smoothForce"
            :smoothSnapThreshold="FINAL_CONFIG.style.chart.tooltip.smoothSnapThreshold"
        >
            <template #tooltip-before>
                <slot name="tooltip-before" v-bind="{ ...dataTooltipSlot }"></slot>
            </template>
            <template #tooltip-after>
                <slot name="tooltip-after" v-bind="{ ...dataTooltipSlot }"></slot>
            </template>
        </Tooltip>

        <div v-if="$slots.source" ref="source" dir="auto">
            <slot name="source" />
        </div>

        <BaseScanner v-if="loading"/>
    </div>
</template>

<style scoped>
@import "../vue-data-ui.css";

.vue-ui-geo * {
    transition: unset;
}

.vue-ui-geo {
    user-select: none;
    position: relative;
}

.vue-ui-geo-point {
    transition: r 0.2s ease-in-out;
}

.vue-ui-geo-point-with-event {
    cursor: pointer;
}

.vue-ui-geo-interacting .vue-ui-geo-point {
    transition: none !important;
}
</style>
