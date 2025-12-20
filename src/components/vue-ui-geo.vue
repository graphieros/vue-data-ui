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
    XMLNS,
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
        defaultConfig: mergedConfig,
    });

    const finalConfig = useNestedProp({
        userConfig: props.config,
        defaultConfig: fused,
    });

    return finalConfig;
}

const FINAL_CONFIG = ref(prepareConfig());

const { userOptionsVisible, keepUserOptionState } = useUserOptionState({
    config: FINAL_CONFIG.value,
});
const { svgRef } = useChartAccessibility({
    config: FINAL_CONFIG.value.style.chart.title,
});

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
                    type: "FeatureCollection",
                    features: [
                        {
                            type: "Feature",
                            properties: { name: "Island A" },
                            geometry: {
                                type: "Polygon",
                                coordinates: [
                                    [
                                        [-6, 2],
                                        [-4, 2],
                                        [-4, 4],
                                        [-6, 4],
                                        [-6, 2],
                                    ],
                                ],
                            },
                        },
                        {
                            type: "Feature",
                            properties: { name: "Island B" },
                            geometry: {
                                type: "Polygon",
                                coordinates: [
                                    [
                                        [-2, -1],
                                        [1, -1],
                                        [1, 2],
                                        [-2, 2],
                                        [-2, -1],
                                    ],
                                ],
                            },
                        },
                        {
                            type: "Feature",
                            properties: { name: "Island C" },
                            geometry: {
                                type: "Polygon",
                                coordinates: [
                                    [
                                        [3, -3],
                                        [5, -3],
                                        [5, -1],
                                        [3, -1],
                                        [3, -3],
                                    ],
                                ],
                            },
                        },
                        {
                            type: "Feature",
                            properties: { name: "Island D" },
                            geometry: {
                                type: "Polygon",
                                coordinates: [
                                    [
                                        [4, 3],
                                        [7, 3],
                                        [7, 5],
                                        [4, 5],
                                        [4, 3],
                                    ],
                                ],
                            },
                        },
                    ],
                },
            },
            userOptions: { show: false },
            style: {
                chart: {
                    backgroundColor: "#99999930",
                    territory: {
                        fill: "#99999950",
                        stroke: "#8A8A8A",
                        strokeWidth: 0.5,
                    },
                },
            },
        },
    }),
});

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `vue-ui-geo_${uid.value}`,
    fileName: FINAL_CONFIG.value.style.chart.title.text || "vue-ui-geo",
    options: FINAL_CONFIG.value.userOptions.print,
});

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

            WIDTH.value =
                Number(FINAL_CONFIG.value.style.chart.dimensions.width) || WIDTH.value;
            HEIGHT.value =
                Number(FINAL_CONFIG.value.style.chart.dimensions.height) || HEIGHT.value;

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

const panZoomActive = ref(FINAL_CONFIG.value.style.chart.zoom.active);

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

const { projections } = geo;
const projectionName = computed(() => FINAL_CONFIG.value?.projection || "equirectangular");

const projectionFunction = computed(() => {
    const projectionCandidate = projections?.[projectionName.value];
    return typeof projectionCandidate === "function"
        ? projectionCandidate
        : projections.equirectangular;
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
        DEFAULT_PROJECTIONS[projectionName.value] || DEFAULT_PROJECTIONS.equirectangular;
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

function normalizeGeoJsonToFeatureCollection(input, options = {}) {
    const {
        defaultName = "",
        namePropertyCandidates = [
            "name",
            "nom",
            "admin",
            "NAME",
            "label",
            "title",
            "description",
            "DESCRIPTION",
            "NAME_1",
            "NAME_2",
            "NAME_3",
            "NAME_EN",
            "name:en",
            "name_en",
            "localname",
            "local_name",
        ],
        includeNullGeometries = false,
    } = options;

    const empty = { type: "FeatureCollection", features: [] };

    function isObject(value) {
        return value !== null && typeof value === "object" && !Array.isArray(value);
    }

    function isGeoJsonGeometry(value) {
        if (!isObject(value)) return false;
        if (typeof value.type !== "string") return false;

        if (value.type === "GeometryCollection") {
            return Array.isArray(value.geometries);
        }

        return Object.hasOwn(value, "coordinates");
    }

    function asNameFromProperties(properties) {
        if (!isObject(properties)) return "";
        for (const key of namePropertyCandidates) {
            const candidate = properties[key];
            if (typeof candidate === "string" && candidate.trim()) {
                return candidate.trim();
            }
        }
        return "";
    }

    function makeFeature({ geometry, properties, fallbackName, featureIndex }) {
        const safeProperties = isObject(properties) ? { ...properties } : {};
        const nameFromProperties = asNameFromProperties(safeProperties);

        const numberedFallback = defaultName
            ? `${defaultName} ${featureIndex + 1}`
            : "";

        const name =
            nameFromProperties ||
            (typeof fallbackName === "string" ? fallbackName.trim() : "") ||
            numberedFallback;

        if (!safeProperties.name && name) {
            safeProperties.name = name;
        }

        return {
            type: "Feature",
            geometry,
            properties: safeProperties,
        };
    }

    function flattenGeometryCollection(
        geometryCollection,
        properties,
        fallbackName,
        startIndex,
        outputFeatures
    ) {
        const geometries = Array.isArray(geometryCollection?.geometries)
            ? geometryCollection.geometries
            : [];
        let featureIndex = startIndex;

        for (let geometryIndex = 0; geometryIndex < geometries.length; geometryIndex += 1) {
            const geometry = geometries[geometryIndex];
            if (!geometry) continue;

            if (isObject(geometry) && geometry.type === "GeometryCollection") {
                featureIndex = flattenGeometryCollection(
                    geometry,
                    properties,
                    fallbackName,
                    featureIndex,
                    outputFeatures
                );
                continue;
            }

            if (!isGeoJsonGeometry(geometry)) continue;

            if (geometry.coordinates == null && geometry.type !== "GeometryCollection") {
                if (includeNullGeometries) {
                    outputFeatures.push(
                        makeFeature({
                            geometry: null,
                            properties,
                            fallbackName,
                            featureIndex,
                        })
                    );
                    featureIndex += 1;
                }
                continue;
            }

            outputFeatures.push(
                makeFeature({
                    geometry,
                    properties,
                    fallbackName,
                    featureIndex,
                })
            );
            featureIndex += 1;
        }

        return featureIndex;
    }

    function pushAny(value, outputFeatures, startIndex = 0) {
        let featureIndex = startIndex;

        if (value == null) return featureIndex;

        if (Array.isArray(value)) {
            for (const item of value) {
                featureIndex = pushAny(item, outputFeatures, featureIndex);
            }
            return featureIndex;
        }

        if (!isObject(value) || typeof value.type !== "string") {
            return featureIndex;
        }

        if (value.type === "FeatureCollection") {
            const features = Array.isArray(value.features) ? value.features : [];
            for (const feature of features) {
                featureIndex = pushAny(feature, outputFeatures, featureIndex);
            }
            return featureIndex;
        }

        if (value.type === "Feature") {
            const properties = isObject(value.properties) ? value.properties : {};
            const featureName = asNameFromProperties(properties);
            const geometry = value.geometry ?? null;

            if (geometry == null) {
                if (includeNullGeometries) {
                    outputFeatures.push(
                        makeFeature({
                            geometry: null,
                            properties,
                            fallbackName: featureName,
                            featureIndex,
                        })
                    );
                    featureIndex += 1;
                }
                return featureIndex;
            }

            if (isObject(geometry) && geometry.type === "GeometryCollection") {
                return flattenGeometryCollection(
                    geometry,
                    properties,
                    featureName,
                    featureIndex,
                    outputFeatures
                );
            }

            if (isGeoJsonGeometry(geometry)) {
                outputFeatures.push(
                    makeFeature({
                        geometry,
                        properties,
                        fallbackName: featureName,
                        featureIndex,
                    })
                );
                featureIndex += 1;
            }

            return featureIndex;
        }

        if (value.type === "GeometryCollection") {
            return flattenGeometryCollection(value, {}, "", featureIndex, outputFeatures);
        }

        if (isGeoJsonGeometry(value)) {
            outputFeatures.push(
                makeFeature({
                    geometry: value,
                    properties: {},
                    fallbackName: "",
                    featureIndex,
                })
            );
            featureIndex += 1;
        }

        return featureIndex;
    }

    const features = [];
    pushAny(input, features, 0);

    return { ...empty, features };
}

function flattenFeatureCollectionToRenderableFeatures(featureCollection) {
    const features = Array.isArray(featureCollection?.features)
        ? featureCollection.features
        : [];

    function resolveName(properties) {
        if (!properties || typeof properties !== "object") return "";

        const candidates = [
            properties.name,
            properties.nom,
            properties.admin,
            properties.NAME,
            properties.label,
            properties.title,
            properties.description,
            properties.DESCRIPTION,
            properties.NAME_1,
            properties.NAME_2,
            properties.NAME_3,
            properties.NAME_EN,
            properties["name:en"],
            properties.name_en,
            properties.localname,
            properties.local_name,
        ];

        for (const candidate of candidates) {
            if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
        }

        for (const value of Object.values(properties)) {
            if (typeof value === "string" && value.trim()) return value.trim();
        }

        return "";
    }

    return features
        .filter((feature) => feature && feature.type === "Feature" && feature.geometry)
        .map((feature, index) => {
            const properties = feature.properties || {};
            const name = resolveName(properties);

            return {
                feature,
                geometry: feature.geometry,
                properties,
                name,
                uid: `map-feature-${uid.value}-${index}`,
                index,
            };
        });
}


const geoJsonFeatureCollection = computed(() =>
    normalizeGeoJsonToFeatureCollection(geoJsonInput.value, {
        defaultName: "",
        includeNullGeometries: false,
    })
);

const renderableFeatures = computed(() =>
    flattenFeatureCollectionToRenderableFeatures(geoJsonFeatureCollection.value)
);

function geometryToSvgPath(geometry) {
    if (!geometry || typeof geometry.type !== "string") return "";

    if (geometry.type === "GeometryCollection") {
        const geometries = Array.isArray(geometry.geometries) ? geometry.geometries : [];
        return geometries
            .map((child) => geometryToSvgPath(child))
            .filter(Boolean)
            .join(" ");
    }

    const projectPair = (pair) => {
        if (!Array.isArray(pair) || pair.length < 2) return null;

        const longitude = Number(pair[0]);
        const latitude = Number(pair[1]);
        if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) return null;

        const projected = projectGeoPoint([longitude, latitude]);
        if (!Array.isArray(projected) || projected.length < 2) return null;

        const x = Number(projected[0]);
        const y = Number(projected[1]);
        if (!Number.isFinite(x) || !Number.isFinite(y)) return null;

        return [x, y];
    };

    const drawLine = (coordinates) => {
        const projectedPoints = (coordinates || []).map(projectPair).filter(Boolean);
        if (projectedPoints.length < 2) return "";
        return "M" + projectedPoints.map(([x, y]) => `${x},${y}`).join("L");
    };

    const drawPolygon = (polygonCoordinates) => {
        return (polygonCoordinates || [])
            .map((ring) => {
                const ringPath = drawLine(ring);
                if (!ringPath) return "";
                return ringPath + "Z";
            })
            .filter(Boolean)
            .join(" ");
    };

    if (geometry.type === "Polygon") return drawPolygon(geometry.coordinates);

    if (geometry.type === "MultiPolygon") {
        return (geometry.coordinates || []).map(drawPolygon).filter(Boolean).join(" ");
    }

    if (geometry.type === "LineString") return drawLine(geometry.coordinates);

    if (geometry.type === "MultiLineString") {
        return (geometry.coordinates || []).map(drawLine).filter(Boolean).join(" ");
    }

    return "";
}

function collectGeoJsonPointCoordinates(geometry) {
    if (!geometry) return [];

    if (geometry.type === "GeometryCollection") {
        const geometries = Array.isArray(geometry.geometries) ? geometry.geometries : [];
        return geometries.flatMap((child) => collectGeoJsonPointCoordinates(child));
    }

    if (geometry.type === "Point") {
        return Array.isArray(geometry.coordinates) ? [geometry.coordinates] : [];
    }

    if (geometry.type === "MultiPoint") {
        return Array.isArray(geometry.coordinates) ? geometry.coordinates : [];
    }

    return [];
}

function geometryHasAnyPoint(geometry) {
    if (!geometry || typeof geometry.type !== "string") return false;

    if (geometry.type === "GeometryCollection") {
        const geometries = Array.isArray(geometry.geometries) ? geometry.geometries : [];
        return geometries.some((child) => geometryHasAnyPoint(child));
    }

    return geometry.type === "Point" || geometry.type === "MultiPoint";
}

const areaFeatures = computed(() =>
    renderableFeatures.value.filter((item) => {
        const geometry = item.geometry;
        if (!geometry) return false;

        if (geometry.type === "GeometryCollection") {
            const geometries = Array.isArray(geometry.geometries) ? geometry.geometries : [];
            return geometries.some(
                (child) => child?.type === "Polygon" || child?.type === "MultiPolygon"
            );
        }

        return geometry.type === "Polygon" || geometry.type === "MultiPolygon";
    })
);

const lineFeatures = computed(() =>
    renderableFeatures.value.filter((item) => {
        const geometry = item.geometry;
        if (!geometry) return false;

        if (geometry.type === "GeometryCollection") {
            const geometries = Array.isArray(geometry.geometries) ? geometry.geometries : [];
            return geometries.some(
                (child) => child?.type === "LineString" || child?.type === "MultiLineString"
            );
        }

        return geometry.type === "LineString" || geometry.type === "MultiLineString";
    })
);

const pointFeatures = computed(() =>
    renderableFeatures.value.filter((item) => {
        const geometry = item.geometry;
        if (!geometry) return false;

        return geometryHasAnyPoint(geometry);
    })
);

const areaPaths = computed(() => {
    return areaFeatures.value
        .map((item) => {
            const path = geometryToSvgPath(item.geometry);
            if (!path) return null;
            return { ...item, path };
        })
        .filter(Boolean);
});

const linePaths = computed(() => {
    return lineFeatures.value
        .map((item) => {
            const path = geometryToSvgPath(item.geometry);
            if (!path) return null;
            return { ...item, path };
        })
        .filter(Boolean);
});

const geoJsonPoints = computed(() => {
    const list = [];

    function normalizeGeoJsonPointStyle(properties = {}) {
        const style = properties?.style && typeof properties.style === "object" ? properties.style : {};

        const radiusRaw =
            properties.radius ??
            properties.r ??
            style.radius ??
            style.r;

        const fillRaw =
            properties.color ??
            properties.fill ??
            style.color ??
            style.fill;

        const strokeRaw =
            properties.stroke ??
            style.stroke;

        const strokeWidthRaw =
            properties.strokeWidth ??
            properties.stroke_width ??
            style.strokeWidth ??
            style.stroke_width;

        const radius = Number.isFinite(Number(radiusRaw))
            ? Number(radiusRaw)
            : Number(FINAL_CONFIG.value.style.chart.points.radius);

        const fill = fillRaw != null && String(fillRaw).trim()
            ? convertColorToHex(String(fillRaw).trim())
            : FINAL_CONFIG.value.style.chart.points.fill;

        const stroke = strokeRaw != null && String(strokeRaw).trim()
            ? convertColorToHex(String(strokeRaw).trim())
            : FINAL_CONFIG.value.style.chart.points.stroke;

        const strokeWidth = Number.isFinite(Number(strokeWidthRaw))
            ? Number(strokeWidthRaw)
            : Number(FINAL_CONFIG.value.style.chart.points.strokeWidth);

        return { radius, fill, stroke, strokeWidth };
    }

    for (const item of pointFeatures.value) {
        const coordinatesList = collectGeoJsonPointCoordinates(item.geometry);

        for (let pointIndex = 0; pointIndex < coordinatesList.length; pointIndex += 1) {
            const pair = coordinatesList[pointIndex];
            if (!Array.isArray(pair) || pair.length < 2) continue;

            const longitude = Number(pair[0]);
            const latitude = Number(pair[1]);
            if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) continue;

            const projected = projectGeoPoint([longitude, latitude]);
            const x = projected?.[0];
            const y = projected?.[1];
            if (!Number.isFinite(x) || !Number.isFinite(y)) continue;

            const properties =
                item?.feature?.properties && typeof item.feature.properties === "object"
                    ? item.feature.properties
                    : {};

            const style = normalizeGeoJsonPointStyle(properties);

            list.push({
                uid: `${item.uid}-geojson-point-${pointIndex}`,
                name: item.name || "",
                x,
                y,
                ...style,
                originalFeature: item.feature,
                featureIndex: item.index,
                pointIndex,
            });
        }
    }

    return list;
});


function collectProjectedPointsFromGeometry(geometry) {
    if (!geometry || typeof geometry.type !== "string") return [];

    const points = [];

    const pushPair = (pair) => {
        if (!Array.isArray(pair) || pair.length < 2) return;

        const longitude = Number(pair[0]);
        const latitude = Number(pair[1]);
        if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) return;

        const projected = projectGeoPoint([longitude, latitude]);
        const x = projected?.[0];
        const y = projected?.[1];
        if (!Number.isFinite(x) || !Number.isFinite(y)) return;

        points.push([x, y]);
    };

    const walkCoordinates = (value) => {
        if (!Array.isArray(value)) return;

        if (
            value.length >= 2 &&
            typeof value[0] === "number" &&
            typeof value[1] === "number"
        ) {
            pushPair(value);
            return;
        }

        for (const child of value) {
            walkCoordinates(child);
        }
    };

    if (geometry.type === "GeometryCollection" && Array.isArray(geometry.geometries)) {
        for (const childGeometry of geometry.geometries) {
            points.push(...collectProjectedPointsFromGeometry(childGeometry));
        }
        return points;
    }

    if (geometry.type === "Point") {
        pushPair(geometry.coordinates);
        return points;
    }

    if (geometry.type === "MultiPoint") {
        (geometry.coordinates || []).forEach(pushPair);
        return points;
    }

    walkCoordinates(geometry.coordinates);
    return points;
}

function computeProjectedBoundsFromFeatures(features) {
    const allPoints = [];

    for (const item of features) {
        allPoints.push(...collectProjectedPointsFromGeometry(item.geometry));
    }

    if (!allPoints.length) return null;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const [x, y] of allPoints) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
    }

    const width = maxX - minX;
    const height = maxY - minY;

    if (!(width > 0) || !(height > 0)) return null;

    return { minX, minY, maxX, maxY, width, height };
}

const projectedBounds = computed(() => {
    return computeProjectedBoundsFromFeatures(renderableFeatures.value);
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

function resetPanZoomToBaseViewBox() {
    const baseBox = getFocusedBaseViewBoxFromMapCenter();
    setInitialViewBox(baseBox, { overwriteCurrentIfNotZoomed: true });
    didInitialFit.value = true;
}

const viewBox = computed(() => {
    const viewBoxObject = panZoomViewBox.value;
    if (!viewBoxObject) return computedViewBox.value;
    return `${viewBoxObject.x} ${viewBoxObject.y} ${viewBoxObject.width} ${viewBoxObject.height}`;
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
        FINAL_CONFIG.value.map.center?.[0],
        FINAL_CONFIG.value.map.center?.[1],
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

function normalizePointsDataset(datasetValue) {
    if (!datasetValue) return [];

    if (datasetValue.type === "FeatureCollection" && Array.isArray(datasetValue.features)) {
        return datasetValue.features
            .filter((feature) => feature?.type === "Feature" && feature.geometry?.type === "Point")
            .map((feature, index) => {
                const properties = feature.properties || {};
                const name =
                    properties.name ||
                    properties.label ||
                    properties.title ||
                    `Point ${index + 1}`;

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

    if (Array.isArray(datasetValue)) {
        return datasetValue
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
                    } else if (
                        Number.isFinite(Number(row.lon)) &&
                        Number.isFinite(Number(row.lat))
                    ) {
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

    if (typeof datasetValue === "object") {
        return Object.entries(datasetValue)
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
            const projected = projectGeoPoint(point.coordinates);
            const x = projected?.[0];
            const y = projected?.[1];
            if (!Number.isFinite(x) || !Number.isFinite(y)) return null;

            return {
                ...point,
                x,
                y,
                fill: point.color
                    ? convertColorToHex(point.color)
                    : FINAL_CONFIG.value.style.chart.points.fill,
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
        } catch (error) {
            console.warn("Custom format cannot be applied.");
            useCustomFormat.value = false;
        }
    }

    const title = escapeHtml(point.name);
    const extra =
        point.description != null
            ? `<div style="margin-top:6px">${escapeHtml(point.description)}</div>`
            : "";

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
        } catch (error) {
            console.warn("Custom format cannot be applied.");
            useCustomFormat.value = false;
        }
    }

    const title = typeof territory?.name === "string" ? territory.name.trim() : "";
    if (!title) {
        useCustomFormat.value = false;
        return "";
    }

    return `<div><div style="font-weight:600">${escapeHtml(title)}</div></div>`;
}

function onTerritoryEnter(territory) {
    if (FINAL_CONFIG.value.events.territoryEnter) {
        FINAL_CONFIG.value.events.territoryEnter({
            datapoint: territory,
            seriesIndex: territory.index,
        });
    }

    const title = typeof territory?.name === "string" ? territory.name.trim() : "";

    if (!title && !FINAL_CONFIG.value.style.chart.territory.hover.enabledWhenEmpty) {
        highlightedTerritoryKey.value = null;
        hideTooltip();
        return;
    }

    highlightedTerritoryKey.value = territory.uid;
    showTooltipWithHtml(formatTerritoryTooltip(territory));
}

function onTerritoryLeave(territory) {
    highlightedTerritoryKey.value = null;
    hideTooltip();

    if (FINAL_CONFIG.value.events.territoryLeave) {
        FINAL_CONFIG.value.events.territoryLeave({
            datapoint: territory,
            seriesIndex: territory.index,
        });
    }
}

function onTerritoryClick(territory) {
    if (FINAL_CONFIG.value.events.territoryClick) {
        FINAL_CONFIG.value.events.territoryClick({
            datapoint: territory,
            seriesIndex: territory.index,
        });
    }
}

function onPointEnter(point) {
    highlightedPointKey.value = point.uid;
    showTooltipWithHtml(formatPointTooltip(point));

    if (FINAL_CONFIG.value.events.datapointEnter) {
        FINAL_CONFIG.value.events.datapointEnter({
            datapoint: point,
            seriesIndex: point.index,
        });
    }
}

function onPointLeave(point) {
    highlightedPointKey.value = null;
    hideTooltip();

    if (FINAL_CONFIG.value.events.datapointLeave) {
        FINAL_CONFIG.value.events.datapointLeave({
            datapoint: point,
            seriesIndex: point.index,
        });
    }
}

const hasPointClickEvent = computed(() => {
    return (
        !!FINAL_CONFIG.value.events.datapointClick &&
        typeof FINAL_CONFIG.value.events.datapointClick === "function"
    );
});

function onPointClick(point) {
    if (hasPointClickEvent.value) {
        FINAL_CONFIG.value.events.datapointClick({
            datapoint: point,
            seriesIndex: point.index,
        });
    }
}

const territoryStyle = computed(() => FINAL_CONFIG.value.style.chart.territory);
const pointStyle = computed(() => FINAL_CONFIG.value.style.chart.points);

function onGeoJsonPointEnter(geoJsonPoint) {
    const title = typeof geoJsonPoint?.name === "string" ? geoJsonPoint.name.trim() : "";

    if (!title) {
        highlightedTerritoryKey.value = null;
        hideTooltip();
        return;
    }

    const territoryLike = {
        name: title,
        uid: geoJsonPoint.uid,
        index: geoJsonPoint.featureIndex,
        properties: {},
    };

    highlightedTerritoryKey.value = geoJsonPoint.uid;
    showTooltipWithHtml(formatTerritoryTooltip(territoryLike));
}

function onGeoJsonPointLeave() {
    highlightedTerritoryKey.value = null;
    hideTooltip();
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

function toggleTooltip() {
    mutableConfig.value.showTooltip = !mutableConfig.value.showTooltip;
}

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

async function getImage({ scale = 2 } = {}) {
    if (!geoChart.value) return;

    const { width, height } = geoChart.value.getBoundingClientRect();
    const aspectRatio = width / height;

    const { imageUri, base64 } = await img({
        domElement: geoChart.value,
        base64: true,
        img: true,
        scale,
    });

    return {
        imageUri,
        base64,
        title: FINAL_CONFIG.value.style.chart.title.text,
        width,
        height,
        aspectRatio,
    };
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

async function focusLocation([longitude, latitude], { animated = true } = {}) {
    const lon = Number(longitude);
    const lat = Number(latitude);
    if (!Number.isFinite(lon) || !Number.isFinite(lat)) return;

    const projected = projectGeoPoint([lon, lat]);
    const xPlane = projected?.[0];
    const yPlane = projected?.[1];
    if (!Number.isFinite(xPlane) || !Number.isFinite(yPlane)) return;

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
    let startTimestamp = null;

    const stepFrame = (timestamp) => {
        if (startTimestamp == null) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);

        panZoomViewBox.value = {
            x: from.x + (to.x - from.x) * progress,
            y: from.y + (to.y - from.y) * progress,
            width: from.width + (to.width - from.width) * progress,
            height: from.height + (to.height - from.height) * progress,
        };

        if (progress < 1) requestAnimationFrame(stepFrame);
    };

    requestAnimationFrame(stepFrame);
}

onMounted(async () => {
    prepareChart();
    await nextTick();

    requestAnimationFrame(() => {
        if (didInitialFit.value) return;
        resetPanZoomToBaseViewBox();

        if (FINAL_CONFIG.value.map.center?.[0] || FINAL_CONFIG.value.map.center?.[1]) {
            focusLocation(FINAL_CONFIG.value.map.center, { animated: false });
        }
    });
});

onBeforeUnmount(() => {
    teardownResponsive();
});

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
    focusLocation,
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
            <template
                v-if="$slots.optionFullscreen"
                template
                #optionFullscreen="{ toggleFullscreen, isFullscreen }"
            >
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
                        v-for="territory in areaPaths"
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

                <g>
                    <path
                        class="vue-ui-geo-territory"
                        v-for="territory in linePaths"
                        :key="territory.uid"
                        :d="territory.path"
                        fill="none"
                        :stroke="highlightedTerritoryKey === territory.uid ? territoryStyle.hover.stroke : territoryStyle.stroke"
                        :stroke-width="highlightedTerritoryKey === territory.uid ? territoryStyle.hover.strokeWidth : territoryStyle.strokeWidth"
                        vector-effect="non-scaling-stroke"
                        @mouseenter="onTerritoryEnter(territory)"
                        @mouseleave="onTerritoryLeave(territory)"
                        @click="onTerritoryClick(territory)"
                    />
                </g>

                <g>
                    <circle
                        v-for="geoJsonPoint in geoJsonPoints"
                        :key="geoJsonPoint.uid"
                        :cx="geoJsonPoint.x"
                        :cy="geoJsonPoint.y"
                        :r="geoJsonPoint.radius"
                        :fill="geoJsonPoint.fill"
                        :stroke="geoJsonPoint.stroke"
                        :stroke-width="geoJsonPoint.strokeWidth"
                        vector-effect="non-scaling-stroke"
                        @mouseenter="onGeoJsonPointEnter(geoJsonPoint)"
                        @mouseleave="onGeoJsonPointLeave"
                    />
                </g>

                <g v-for="point in projectedPoints" :key="point.uid">
                    <slot
                        name="datapoint"
                        v-bind="{
                            point,
                            onPointEnter,
                            onPointLeave,
                            onPointClick,
                            highlighted: highlightedPointKey === point.uid
                        }"
                    >
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
                            FINAL_CONFIG.style.chart.points.labels.offsetY +
                            (1 * FINAL_CONFIG.style.chart.points.labels.fontSizeRatio)
                        "
                        text-anchor="middle"
                        :fill="FINAL_CONFIG.style.chart.points.labels.color"
                        :font-size="1 * FINAL_CONFIG.style.chart.points.labels.fontSizeRatio"
                    >
                        {{ point.name }}
                    </text>
                </g>
            </g>

            <slot
                name="svg"
                :svg="{
                    drawingArea: viewBox,
                    data: {
                        areaPaths,
                        linePaths,
                        geoJsonPoints,
                        projectedPoints
                    }
                }"
            />
        </svg>

        <div v-if="$slots.watermark" class="vue-data-ui-watermark">
            <slot name="watermark" v-bind="{ isPrinting: isPrinting || isImaging }" />
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

        <BaseScanner v-if="loading" />
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
