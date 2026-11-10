<script setup>
import {
    getUserOptionsProps,
    getUserOptionSlots,
    getUserOptionSlotProps,
} from '../userOptionsSlots';
import { getAnnotatorProps } from '../annotatorConfig';
import { createPanZoomAnnotationViewport } from '../utils/annotationViewport';
import {
    annotationSlotNames,
    getAnnotationSlotProps,
} from '../annotationSlots';

import { createChartImageGetter } from '../chartImage';
import { resolveChartConfig } from '../resolveChartConfig';
import {
    computed,
    defineAsyncComponent,
    onBeforeUnmount,
    onMounted,
    ref,
    shallowRef,
    watch,
} from 'vue';
import {
    convertColorToHex,
    createUid,
    isFunction,
    svgToClientCoords,
    treeShake,
    XMLNS,
} from '../lib.js';
import usePanZoom from '../usePanZoom.js';
import { useHints } from '../useHints.js';
import { useConfig } from '../useConfig.js';
import { usePrinter } from '../usePrinter.js';
import { useResponsive } from '../useResponsive.js';

import { useChartExport } from '../useChartExport.js';
import { useChartAccessibility } from '../useChartAccessibility.js';
import geo from '../geoProjections.js';
import { usePrefersReducedMotion } from '../usePrefersMotion';
import Title from '../atoms/Title.vue';
import themes from '../themes/vue_ui_geo.json';
import BaseScanner from '../atoms/BaseScanner.vue';
import A11yDataTable from '../atoms/A11yDataTable.vue';
import BaseZoomControls from '../atoms/BaseZoomControls.vue';

const Tooltip = defineAsyncComponent(() => import('../atoms/Tooltip.vue'));
const UserOptions = defineAsyncComponent(
    () => import('../atoms/UserOptions.vue'),
);
const PenAndPaper = defineAsyncComponent(
    () => import('../atoms/PenAndPaper.vue'),
);
const PackageVersion = defineAsyncComponent(
    () => import('../atoms/PackageVersion.vue'),
);

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

const emit = defineEmits(['copyAlt']);

const { vue_ui_geo: DEFAULT_CONFIG } = useConfig();

const uid = ref(createUid());
const step = ref(0);

const geoChart = ref(null);

const dataTooltipSlot = ref(null);
const chartTitle = ref(null);
const noTitle = ref(null);
const source = ref(null);
const resizeObserver = shallowRef(null);

const zoomControlsTop = ref(null);
const zoomControlsBottom = ref(null);

const activePointKeyboardIndex = ref(null); // a11y
const tooltipA11yPosition = ref({ x: 0, y: 0 }); // a11y
const tooltipTriggerMode = ref('pointer'); // a11y
const isFocus = ref(false); // a11y

const isFullscreen = ref(false);

function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
}

function prepareConfig() {
    return resolveChartConfig(props.config, DEFAULT_CONFIG, themes);
}

const preparedConfig = computed(prepareConfig);
const loading = computed(() => !!props.config.loading);
const skeletonConfig = computed(() => {
    return treeShake({
        defaultConfig: {
            map: {
                geoJson: {
                    type: 'FeatureCollection',
                    features: [
                        {
                            type: 'Feature',
                            properties: { name: 'Island A' },
                            geometry: {
                                type: 'Polygon',
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
                            type: 'Feature',
                            properties: { name: 'Island B' },
                            geometry: {
                                type: 'Polygon',
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
                            type: 'Feature',
                            properties: { name: 'Island C' },
                            geometry: {
                                type: 'Polygon',
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
                            type: 'Feature',
                            properties: { name: 'Island D' },
                            geometry: {
                                type: 'Polygon',
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
                    backgroundColor: '#99999930',
                    territory: {
                        fill: '#99999950',
                        stroke: '#8A8A8A',
                        strokeWidth: 0.5,
                    },
                },
            },
        },
        userConfig: preparedConfig.value.skeletonConfig ?? {},
    });
});

const FINAL_CONFIG = computed(() =>
    loading.value
        ? treeShake({
              defaultConfig: preparedConfig.value,
              userConfig: skeletonConfig.value,
          })
        : preparedConfig.value,
);
const FINAL_DATASET = computed(() =>
    loading.value ? (props.config.skeletonDataset ?? []) : props.dataset,
);
const prefersReducedMotion = usePrefersReducedMotion();
const cfgLabels = computed(() => FINAL_CONFIG.value.style.chart.points.labels);
const cfgPoints = computed(() => FINAL_CONFIG.value.style.chart.points);
const cfgChart = computed(() => FINAL_CONFIG.value.style.chart);

useHints({
    config: () => FINAL_CONFIG.value,
    dataset: () => props.dataset,
    component: 'VueUiGeo',
    rules: [
        {
            test: (ds) => ds.length > 100,
            message: [
                '👀 The number of data points > 100, which can make the chart hard to read. Consider:',
                '',
                '▶️ Using filters to reduce the number of data points displayed at the same time, and offer users some level of control.',
            ],
        },
    ],
});

const isCursorPointer = computed(
    () => FINAL_CONFIG.value.userOptions.useCursorPointer,
);

const userOptionsVisible = ref(
    !FINAL_CONFIG.value.userOptions.showOnChartHover,
);
const keepUserOptionState = computed(
    () => FINAL_CONFIG.value.userOptions.keepStateOnChartLeave,
);
function setUserOptionsVisibility(value) {
    if (FINAL_CONFIG.value.userOptions.showOnChartHover)
        userOptionsVisible.value = value;
}
watch(
    () => FINAL_CONFIG.value.userOptions.showOnChartHover,
    (value) => {
        userOptionsVisible.value = !value;
    },
);
const { svgRef } = useChartAccessibility({
    config: cfgChart.value.title,
});

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `vue-ui-geo_${uid.value}`,
    fileName: cfgChart.value.title.text || 'vue-ui-geo',
    options: FINAL_CONFIG.value.userOptions.print,
});

const activeZoomControlsElement = computed(() => {
    if (!cfgChart.value.controls.show) return null;

    if (cfgChart.value.controls.position === 'top') {
        return zoomControlsTop.value?.$el ?? null;
    }
    if (cfgChart.value.controls.position === 'bottom') {
        return zoomControlsBottom.value?.$el ?? null;
    }
    return null;
});

const responsiveSize = shallowRef(null);
let resizeFrame = null;
let fitFrame = null;
let focusFrame = null;
let disposed = false;

function teardownResponsive() {
    resizeObserver.value?.disconnect();
    resizeObserver.value = null;
    if (resizeFrame !== null) cancelAnimationFrame(resizeFrame);
    resizeFrame = null;
}

const isResponsiveActive = computed(
    () => FINAL_CONFIG.value.responsive && !isFullscreen.value,
);

function prepareChart() {
    teardownResponsive();
    responsiveSize.value = null;
    if (!isResponsiveActive.value || !geoChart.value?.parentNode) return;
    const observer = new ResizeObserver(measure);
    function measure() {
        if (disposed || resizeObserver.value !== observer) return;
        if (resizeFrame !== null) cancelAnimationFrame(resizeFrame);
        resizeFrame = requestAnimationFrame(() => {
            if (disposed || resizeObserver.value !== observer) return;
            resizeFrame = null;
            const { width, height } = useResponsive({
                chart: geoChart.value,
                noTitle: hasOptionsNoTitle.value ? noTitle.value : null,
                title: cfgChart.value.title.text ? chartTitle.value : null,
                legend: activeZoomControlsElement.value,
                source: source.value,
            });
            responsiveSize.value = {
                width: Math.max(0.1, Number(width) || 0.1),
                height: Math.max(0.1, (Number(height) || 0) - 24),
            };
        });
    }
    resizeObserver.value = observer;
    observer.observe(geoChart.value.parentNode);
    measure();
}

watch(
    [
        isResponsiveActive,
        () => cfgChart.value.title.text,
        () => cfgChart.value.controls.show,
        () => cfgChart.value.controls.position,
    ],
    prepareChart,
    { flush: 'post' },
);

const hasOptionsNoTitle = computed(() => {
    return FINAL_CONFIG.value.userOptions.show && !cfgChart.value.title.text;
});

const mutableConfig = ref({
    showTooltip: cfgChart.value.tooltip.show,
});

const isAnnotator = ref(false);
const isInteracting = ref(false);
const zoomEnabled = ref(cfgChart.value.zoom.active);
const panZoomActive = computed(() => zoomEnabled.value && !isAnnotator.value);

watch(
    () => cfgChart.value.zoom.active,
    (value) => {
        zoomEnabled.value = value;
    },
);

watch(
    () => cfgChart.value.tooltip.show,
    (value) => {
        mutableConfig.value.showTooltip = value;
    },
);

const { projections } = geo;
const projectionName = computed(
    () => FINAL_CONFIG.value?.projection || 'equirectangular',
);

const projectionFunction = computed(() => {
    const projectionCandidate = projections?.[projectionName.value];
    return typeof projectionCandidate === 'function'
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

const WIDTH = computed(
    () => responsiveSize.value?.width ?? cfgChart.value.dimensions.width,
);
const HEIGHT = computed(
    () => responsiveSize.value?.height ?? cfgChart.value.dimensions.height,
);

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

const projectionCenter = computed(() => {
    const center = FINAL_CONFIG.value?.map?.center;
    const fallback = [0, 0];
    if (!Array.isArray(center) || center.length !== 2) return fallback;

    const longitude = Number(center[0]);
    const latitude = Number(center[1]);
    if (!Number.isFinite(longitude) || !Number.isFinite(latitude))
        return fallback;

    return [longitude, latitude];
});

function projectGeoPoint([longitude, latitude]) {
    return projectionFunction.value(
        [longitude, latitude],
        projectionPlaneSizes.value.width,
        projectionPlaneSizes.value.height,
        projectionCenter.value,
    );
}

const coordinateProjector = computed(() => {
    const project = projectionFunction.value;
    const { width, height } = projectionPlaneSizes.value;
    const center = projectionCenter.value;
    const cache = new WeakMap();
    return (pair) => {
        if (!Array.isArray(pair) || pair.length < 2) return null;
        const lon = Number(pair[0]),
            lat = Number(pair[1]);
        const previous = cache.get(pair);
        if (
            previous &&
            Object.is(previous.lon, lon) &&
            Object.is(previous.lat, lat)
        )
            return previous.result;
        const projected =
            Number.isFinite(lon) && Number.isFinite(lat)
                ? project([lon, lat], width, height, center)
                : null;
        const result =
            Array.isArray(projected) &&
            projected.length >= 2 &&
            Number.isFinite(Number(projected[0])) &&
            Number.isFinite(Number(projected[1]))
                ? [Number(projected[0]), Number(projected[1])]
                : null;
        cache.set(pair, { lon, lat, result });
        return result;
    };
});
function projectCoordinate(pair) {
    return coordinateProjector.value(pair);
}

const FEATURE_NAME_KEYS = [
    'name',
    'nom',
    'admin',
    'NAME',
    'label',
    'title',
    'description',
    'DESCRIPTION',
    'NAME_1',
    'NAME_2',
    'NAME_3',
    'NAME_EN',
    'name:en',
    'name_en',
    'localname',
    'local_name',
];
function resolveFeatureName(
    properties,
    keys = FEATURE_NAME_KEYS,
    fallback = false,
) {
    if (!properties || typeof properties !== 'object') return '';
    for (const key of keys)
        if (typeof properties[key] === 'string' && properties[key].trim())
            return properties[key].trim();
    if (fallback)
        for (const value of Object.values(properties))
            if (typeof value === 'string' && value.trim()) return value.trim();
    return '';
}

const featureIdentities = new Map();
const pointIdentities = new Map();
const usedIdentities = new Set();
function pruneIdentities(cache, keys, prefix = '') {
    for (const [key, id] of cache) {
        if (key.startsWith(prefix) && !keys.has(key)) {
            cache.delete(key);
            usedIdentities.delete(id);
        }
    }
}
function stableIdentity(cache, source, fallback) {
    if (!cache.has(source)) {
        const id = usedIdentities.has(fallback)
            ? `${fallback}-${createUid()}`
            : fallback;
        cache.set(source, id);
        usedIdentities.add(id);
    }
    return cache.get(source);
}

function normalizeGeoJsonToFeatureCollection(input, options = {}) {
    const {
        defaultName = '',
        namePropertyCandidates = FEATURE_NAME_KEYS,
        includeNullGeometries = false,
    } = options;

    const empty = { type: 'FeatureCollection', features: [] };

    function isObject(value) {
        return (
            value !== null && typeof value === 'object' && !Array.isArray(value)
        );
    }

    function isGeoJsonGeometry(value) {
        if (!isObject(value)) return false;
        if (typeof value.type !== 'string') return false;

        if (value.type === 'GeometryCollection') {
            return Array.isArray(value.geometries);
        }

        return Object.hasOwn(value, 'coordinates');
    }

    function makeFeature({ geometry, properties, fallbackName, featureIndex }) {
        const safeProperties = isObject(properties) ? { ...properties } : {};
        const nameFromProperties = resolveFeatureName(
            safeProperties,
            namePropertyCandidates,
        );

        const numberedFallback = defaultName
            ? `${defaultName} ${featureIndex + 1}`
            : '';

        const name =
            nameFromProperties ||
            (typeof fallbackName === 'string' ? fallbackName.trim() : '') ||
            numberedFallback;

        if (!safeProperties.name && name) {
            safeProperties.name = name;
        }

        return {
            type: 'Feature',
            geometry,
            properties: safeProperties,
        };
    }

    function flattenGeometryCollection(
        geometryCollection,
        properties,
        fallbackName,
        startIndex,
        outputFeatures,
    ) {
        const geometries = Array.isArray(geometryCollection?.geometries)
            ? geometryCollection.geometries
            : [];
        let featureIndex = startIndex;

        for (
            let geometryIndex = 0;
            geometryIndex < geometries.length;
            geometryIndex += 1
        ) {
            const geometry = geometries[geometryIndex];
            if (!geometry) continue;

            if (isObject(geometry) && geometry.type === 'GeometryCollection') {
                featureIndex = flattenGeometryCollection(
                    geometry,
                    properties,
                    fallbackName,
                    featureIndex,
                    outputFeatures,
                );
                continue;
            }

            if (!isGeoJsonGeometry(geometry)) continue;

            if (
                geometry.coordinates == null &&
                geometry.type !== 'GeometryCollection'
            ) {
                if (includeNullGeometries) {
                    outputFeatures.push(
                        makeFeature({
                            geometry: null,
                            properties,
                            fallbackName,
                            featureIndex,
                        }),
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
                }),
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

        if (!isObject(value) || typeof value.type !== 'string') {
            return featureIndex;
        }

        if (value.type === 'FeatureCollection') {
            const features = Array.isArray(value.features)
                ? value.features
                : [];
            for (const feature of features) {
                featureIndex = pushAny(feature, outputFeatures, featureIndex);
            }
            return featureIndex;
        }

        if (value.type === 'Feature') {
            const properties = isObject(value.properties)
                ? value.properties
                : {};
            const featureName = resolveFeatureName(
                properties,
                namePropertyCandidates,
            );
            const geometry = value.geometry ?? null;

            if (geometry == null) {
                if (includeNullGeometries) {
                    outputFeatures.push(
                        makeFeature({
                            geometry: null,
                            properties,
                            fallbackName: featureName,
                            featureIndex,
                        }),
                    );
                    featureIndex += 1;
                }
                return featureIndex;
            }

            if (isObject(geometry) && geometry.type === 'GeometryCollection') {
                return flattenGeometryCollection(
                    geometry,
                    properties,
                    featureName,
                    featureIndex,
                    outputFeatures,
                );
            }

            if (isGeoJsonGeometry(geometry)) {
                outputFeatures.push(
                    makeFeature({
                        geometry,
                        properties,
                        fallbackName: featureName,
                        featureIndex,
                    }),
                );
                featureIndex += 1;
            }

            return featureIndex;
        }

        if (value.type === 'GeometryCollection') {
            return flattenGeometryCollection(
                value,
                {},
                '',
                featureIndex,
                outputFeatures,
            );
        }

        if (isGeoJsonGeometry(value)) {
            outputFeatures.push(
                makeFeature({
                    geometry: value,
                    properties: {},
                    fallbackName: '',
                    featureIndex,
                }),
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

    const occurrences = new Map();
    const keys = new Set();
    const result = features
        .filter(
            (feature) =>
                feature && feature.type === 'Feature' && feature.geometry,
        )
        .map((feature, index) => {
            const properties = feature.properties || {};
            const name = resolveFeatureName(
                properties,
                FEATURE_NAME_KEYS,
                true,
            );
            const identity = feature.id ?? properties.id ?? (name || index);
            const key = `${typeof identity}:${identity}`;
            const occurrence = occurrences.get(key) || 0;
            occurrences.set(key, occurrence + 1);
            keys.add(`${key}:${occurrence}`);

            return {
                feature,
                geometry: feature.geometry,
                properties,
                name,
                uid: stableIdentity(
                    featureIdentities,
                    `${key}:${occurrence}`,
                    `map-feature-${uid.value}-${index}`,
                ),
                index,
            };
        });
    pruneIdentities(featureIdentities, keys);
    return result;
}

const geoJsonFeatureCollection = computed(() =>
    normalizeGeoJsonToFeatureCollection(geoJsonInput.value, {
        defaultName: '',
        includeNullGeometries: false,
    }),
);

const renderableFeatures = computed(() =>
    flattenFeatureCollectionToRenderableFeatures(
        geoJsonFeatureCollection.value,
    ),
);

function geometryToSvgPath(geometry) {
    if (!geometry || typeof geometry.type !== 'string') return '';

    if (geometry.type === 'GeometryCollection') {
        const geometries = Array.isArray(geometry.geometries)
            ? geometry.geometries
            : [];
        return geometries
            .map((child) => geometryToSvgPath(child))
            .filter(Boolean)
            .join(' ');
    }

    const projectPair = projectCoordinate;

    const drawLine = (coordinates) => {
        const projectedPoints = (coordinates || [])
            .map(projectPair)
            .filter(Boolean);
        if (projectedPoints.length < 2) return '';
        return 'M' + projectedPoints.map(([x, y]) => `${x},${y}`).join('L');
    };

    const drawPolygon = (polygonCoordinates) => {
        return (polygonCoordinates || [])
            .map((ring) => {
                const ringPath = drawLine(ring);
                if (!ringPath) return '';
                return ringPath + 'Z';
            })
            .filter(Boolean)
            .join(' ');
    };

    if (geometry.type === 'Polygon') return drawPolygon(geometry.coordinates);

    if (geometry.type === 'MultiPolygon') {
        return (geometry.coordinates || [])
            .map(drawPolygon)
            .filter(Boolean)
            .join(' ');
    }

    if (geometry.type === 'LineString') return drawLine(geometry.coordinates);

    if (geometry.type === 'MultiLineString') {
        return (geometry.coordinates || [])
            .map(drawLine)
            .filter(Boolean)
            .join(' ');
    }

    return '';
}

function collectGeoJsonPointCoordinates(geometry) {
    if (!geometry) return [];

    if (geometry.type === 'GeometryCollection') {
        const geometries = Array.isArray(geometry.geometries)
            ? geometry.geometries
            : [];
        return geometries.flatMap((child) =>
            collectGeoJsonPointCoordinates(child),
        );
    }

    if (geometry.type === 'Point') {
        return Array.isArray(geometry.coordinates)
            ? [geometry.coordinates]
            : [];
    }

    if (geometry.type === 'MultiPoint') {
        return Array.isArray(geometry.coordinates) ? geometry.coordinates : [];
    }

    return [];
}

const areaFeatures = computed(() =>
    renderableFeatures.value.filter((item) =>
        ['Polygon', 'MultiPolygon'].includes(item.geometry.type),
    ),
);
const lineFeatures = computed(() =>
    renderableFeatures.value.filter((item) =>
        ['LineString', 'MultiLineString'].includes(item.geometry.type),
    ),
);
const pointFeatures = computed(() =>
    renderableFeatures.value.filter((item) =>
        ['Point', 'MultiPoint'].includes(item.geometry.type),
    ),
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
        const style =
            properties?.style && typeof properties.style === 'object'
                ? properties.style
                : {};

        const radiusRaw =
            properties.radius ?? properties.r ?? style.radius ?? style.r;

        const fillRaw =
            properties.color ?? properties.fill ?? style.color ?? style.fill;

        const strokeRaw = properties.stroke ?? style.stroke;

        const strokeWidthRaw =
            properties.strokeWidth ??
            properties.stroke_width ??
            style.strokeWidth ??
            style.stroke_width;

        const radius = Number.isFinite(Number(radiusRaw))
            ? Number(radiusRaw)
            : Number(cfgPoints.value.radius);

        const fill =
            fillRaw != null && String(fillRaw).trim()
                ? convertColorToHex(String(fillRaw).trim())
                : cfgPoints.value.fill;

        const stroke =
            strokeRaw != null && String(strokeRaw).trim()
                ? convertColorToHex(String(strokeRaw).trim())
                : cfgPoints.value.stroke;

        const strokeWidth = Number.isFinite(Number(strokeWidthRaw))
            ? Number(strokeWidthRaw)
            : Number(cfgPoints.value.strokeWidth);

        return { radius, fill, stroke, strokeWidth };
    }

    for (const item of pointFeatures.value) {
        const coordinatesList = collectGeoJsonPointCoordinates(item.geometry);

        for (
            let pointIndex = 0;
            pointIndex < coordinatesList.length;
            pointIndex += 1
        ) {
            const pair = coordinatesList[pointIndex];
            if (!Array.isArray(pair) || pair.length < 2) continue;

            const projected = projectCoordinate(pair);
            if (!projected) continue;
            const [x, y] = projected;

            const properties =
                item?.feature?.properties &&
                typeof item.feature.properties === 'object'
                    ? item.feature.properties
                    : {};

            const style = normalizeGeoJsonPointStyle(properties);

            list.push({
                uid: `${item.uid}-geojson-point-${pointIndex}`,
                name: item.name || '',
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

function visitProjectedGeometry(geometry, visit) {
    if (!geometry || typeof geometry.type !== 'string') return;
    if (geometry.type === 'GeometryCollection') {
        for (const child of geometry.geometries || [])
            visitProjectedGeometry(child, visit);
        return;
    }
    function walk(coordinates) {
        if (!Array.isArray(coordinates)) return;
        if (
            coordinates.length >= 2 &&
            !Array.isArray(coordinates[0]) &&
            !Array.isArray(coordinates[1])
        ) {
            const projected = projectCoordinate(coordinates);
            if (projected) visit(projected);
            return;
        }
        for (const child of coordinates) walk(child);
    }
    walk(geometry.coordinates);
}
function computeProjectedBoundsFromFeatures(features) {
    let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;
    for (const feature of features)
        visitProjectedGeometry(feature.geometry, ([x, y]) => {
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
        });
    const width = maxX - minX,
        height = maxY - minY;
    return width > 0 && height > 0
        ? { minX, minY, maxX, maxY, width, height }
        : null;
}

const projectedBounds = computed(() => {
    return computeProjectedBoundsFromFeatures(renderableFeatures.value);
});

function computeFitTransform({ bounds, targetWidth, targetHeight, padding }) {
    if (!bounds || !(bounds.width > 0) || !(bounds.height > 0)) {
        return { scale: 1, translateX: 0, translateY: 0, transform: '' };
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
    if (!bounds)
        return { scale: 1, translateX: 0, translateY: 0, transform: '' };

    const fitPaddingRaw = FINAL_CONFIG.value?.map?.fitPadding;
    const padding = Number.isFinite(Number(fitPaddingRaw))
        ? Number(fitPaddingRaw)
        : 0;

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
    resetZoom: resetPanZoom,
    cancelAnimation: cancelPanZoomAnimation,
    setInitialViewBox,
    scale,
    zoomByFactor,
} = usePanZoom(
    svgRef,
    {
        x: 0,
        y: 0,
        width: viewportSizes.value.width,
        height: viewportSizes.value.height,
    },
    1,
    panZoomActive,
);

function toggleZoom() {
    zoomEnabled.value = !zoomEnabled.value;
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
}

const viewBox = computed(() => {
    const viewBoxObject = panZoomViewBox.value;
    if (!viewBoxObject) return computedViewBox.value;
    return `${viewBoxObject.x} ${viewBoxObject.y} ${viewBoxObject.width} ${viewBoxObject.height}`;
});

const zoomStepFactor = 1.5;

function zoomIn() {
    finishPendingFit();
    cancelFocus();
    zoomByFactor(zoomStepFactor, !prefersReducedMotion.value);
}

function zoomOut() {
    finishPendingFit();
    cancelFocus();
    zoomByFactor(1 / zoomStepFactor, !prefersReducedMotion.value);
}

async function hardResetZoom() {
    const focusedBaseBox = getFocusedBaseViewBoxFromMapCenter();
    setInitialViewBox(focusedBaseBox, { overwriteCurrentIfNotZoomed: true });
    resetZoom(!prefersReducedMotion.value);
}

function cancelFocus() {
    if (focusFrame !== null) cancelAnimationFrame(focusFrame);
    focusFrame = null;
}
function resetZoom(animated = false) {
    finishPendingFit();
    cancelFocus();
    resetPanZoom(animated && !prefersReducedMotion.value);
}
function finishPendingFit() {
    if (fitFrame === null) return;
    cancelAnimationFrame(fitFrame);
    fitFrame = null;
    resetPanZoomToBaseViewBox();
}
function scheduleFit() {
    cancelFocus();
    cancelPanZoomAnimation();
    if (fitFrame !== null) cancelAnimationFrame(fitFrame);
    fitFrame = requestAnimationFrame(() => {
        fitFrame = null;
        if (disposed) return;
        resetPanZoomToBaseViewBox();
    });
}
watch(
    [
        projectionName,
        () => projectionCenter.value[0],
        () => projectionCenter.value[1],
        () => FINAL_CONFIG.value.map.fitPadding,
        () => projectedBounds.value?.minX,
        () => projectedBounds.value?.minY,
        () => projectedBounds.value?.maxX,
        () => projectedBounds.value?.maxY,
        () => viewportSizes.value.width,
        () => viewportSizes.value.height,
        loading,
    ],
    scheduleFit,
    { flush: 'post' },
);

function normalizeCoordinates(pair) {
    if (!Array.isArray(pair) || pair.length < 2) return null;
    const lon = Number(pair[0]),
        lat = Number(pair[1]);
    return Number.isFinite(lon) && Number.isFinite(lat) ? [lon, lat] : null;
}

function normalizePointsDataset(datasetValue) {
    if (!datasetValue) return [];
    let entries;
    if (
        datasetValue.type === 'FeatureCollection' &&
        Array.isArray(datasetValue.features)
    ) {
        entries = datasetValue.features
            .filter(
                (feature) =>
                    feature?.type === 'Feature' &&
                    feature.geometry?.type === 'Point',
            )
            .map((feature, index) => ({
                row: feature.properties || {},
                original: feature,
                index,
                coordinates: feature.geometry.coordinates,
                name:
                    feature.properties?.name ||
                    feature.properties?.label ||
                    feature.properties?.title ||
                    `Point ${index + 1}`,
                suffix: '',
                preserveAltitude: true,
            }));
    } else if (Array.isArray(datasetValue)) {
        entries = datasetValue.map((row, index) => ({
            row:
                row && typeof row === 'object' && !Array.isArray(row)
                    ? row
                    : {},
            original: row,
            index,
            coordinates: Array.isArray(row)
                ? row
                : Array.isArray(row?.coordinates)
                  ? row.coordinates
                  : [row?.lon, row?.lat],
            name:
                typeof row?.name === 'string' && row.name.trim()
                    ? row.name
                    : `Point ${index + 1}`,
            suffix: '',
        }));
    } else if (typeof datasetValue === 'object') {
        entries = Object.entries(datasetValue).map(([key, row], index) => ({
            row,
            original: row,
            index,
            coordinates: row?.coordinates,
            name: row?.name || key,
            suffix: `-${key}`,
        }));
    } else return [];
    return entries.flatMap(
        ({
            row,
            original,
            index,
            coordinates,
            name,
            suffix,
            preserveAltitude,
        }) => {
            const normalized = normalizeCoordinates(coordinates);
            if (!normalized) return [];
            return [
                {
                    uid: `map-point-${uid.value}-${index}${suffix}`,
                    name,
                    coordinates: preserveAltitude
                        ? [...normalized, ...coordinates.slice(2)]
                        : normalized,
                    color: row.color ?? null,
                    radius: row.radius ?? null,
                    hoverRadiusRatio: cfgPoints.value.hoverRadiusRatio,
                    description: row.description ?? null,
                    original,
                    index,
                },
            ];
        },
    );
}

const points = computed(() => {
    const records = normalizePointsDataset(FINAL_DATASET.value);
    const occurrences = new Map();
    const keys = new Set();
    const prefix = `${loading.value}:`;
    const source = FINAL_DATASET.value;
    const dictionaryKeys =
        source && !Array.isArray(source) && source.type !== 'FeatureCollection'
            ? Object.keys(source)
            : null;
    const result = records.map((point) => {
        const original = point.original;
        const properties = original?.properties || original;
        const explicitId = original?.id ?? properties?.id;
        const name = properties?.name ?? properties?.label ?? properties?.title;
        const key =
            explicitId != null
                ? `id:${typeof explicitId}:${explicitId}`
                : dictionaryKeys
                  ? `key:${dictionaryKeys[point.index]}`
                  : name != null
                    ? `name:${name}`
                    : `index:${point.index}`;
        const occurrence = occurrences.get(key) || 0;
        occurrences.set(key, occurrence + 1);
        const identityKey = `${prefix}${key}:${occurrence}`;
        keys.add(identityKey);
        return {
            ...point,
            uid: stableIdentity(pointIdentities, identityKey, point.uid),
        };
    });
    pruneIdentities(pointIdentities, keys, prefix);
    return result;
});

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
                    : cfgPoints.value.fill,
                radius:
                    point.radius != null &&
                    Number.isFinite(Number(point.radius))
                        ? Number(point.radius)
                        : cfgPoints.value.radius,
            };
        })
        .filter(Boolean);
});

const keyboardNavigablePoints = computed(() => {
    return projectedPoints.value.map((point, keyboardIndex) => {
        return {
            ...point,
            keyboardIndex,
        };
    });
});

function setKeyboardTooltipPositionFromPoint(point) {
    const fittedPoint = applyFitToPoint(point);
    const clientPosition = svgToClientCoords(
        fittedPoint.x,
        fittedPoint.y,
        svgRef.value,
    );
    if (!clientPosition) return;
    tooltipA11yPosition.value = {
        x: clientPosition.x,
        y: clientPosition.y,
    };
}

const selectedTooltip = shallowRef(null);
const isTooltipVisible = ref(false);
const tooltipContent = ref('');
const useCustomFormat = ref(false);
const highlightedPointKey = ref(null);
const highlightedTerritoryKey = ref(null);

function showTooltipWithHtml(html) {
    tooltipContent.value = html;
    isTooltipVisible.value = true;
}

function hideTooltip() {
    selectedTooltip.value = null;
    dataTooltipSlot.value = null;
    isTooltipVisible.value = false;
    tooltipContent.value = '';
}

function escapeHtml(text) {
    return String(text ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function formatPointTooltip(point) {
    dataTooltipSlot.value = {
        datapoint: point,
        seriesIndex: point.index,
        series: points.value,
        config: FINAL_CONFIG.value,
    };

    useCustomFormat.value = false;
    const customFormat = cfgChart.value.tooltip.customFormat;

    if (isFunction(customFormat)) {
        try {
            const customFormatString = customFormat(dataTooltipSlot.value);
            if (typeof customFormatString === 'string') {
                useCustomFormat.value = true;
                return customFormatString;
            }
        } catch (error) {
            console.warn('Custom format cannot be applied.');
            useCustomFormat.value = false;
        }
    }

    const title = escapeHtml(point.name);
    const extra =
        point.description != null
            ? `<div style="margin-top:6px">${escapeHtml(point.description)}</div>`
            : '';

    return `<div><div style="font-weight:600">${title}</div>${extra}</div>`;
}

function formatTerritoryTooltip(territory) {
    dataTooltipSlot.value = {
        datapoint: territory,
        seriesIndex: territory.index,
        series: renderableFeatures.value,
        config: FINAL_CONFIG.value,
    };
    useCustomFormat.value = false;
    const customFormat = cfgChart.value.tooltip.customFormat;

    if (isFunction(customFormat)) {
        try {
            const customFormatString = customFormat({
                datapoint: territory,
                config: FINAL_CONFIG.value,
            });
            if (typeof customFormatString === 'string') {
                useCustomFormat.value = true;
                return customFormatString;
            }
        } catch (error) {
            console.warn('Custom format cannot be applied.');
            useCustomFormat.value = false;
        }
    }

    const title =
        typeof territory?.name === 'string' ? territory.name.trim() : '';
    if (!title) {
        useCustomFormat.value = false;
        return '';
    }

    return `<div><div style="font-weight:600">${escapeHtml(title)}</div></div>`;
}

function onTerritoryEnter(territory) {
    if (loading.value) return;
    tooltipTriggerMode.value = 'pointer';
    activePointKeyboardIndex.value = null;
    highlightedPointKey.value = null;
    selectedTooltip.value = { kind: 'territory', uid: territory.uid };
    if (FINAL_CONFIG.value.events.territoryEnter) {
        FINAL_CONFIG.value.events.territoryEnter({
            datapoint: territory,
            seriesIndex: territory.index,
        });
    }

    const title =
        typeof territory?.name === 'string' ? territory.name.trim() : '';

    if (!title && !cfgChart.value.territory.hover.enabledWhenEmpty) {
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
    if (loading.value) return;
    if (FINAL_CONFIG.value.events.territoryClick) {
        FINAL_CONFIG.value.events.territoryClick({
            datapoint: territory,
            seriesIndex: territory.index,
        });
    }
}

function onPointEnter(point, keyboardIndex = null, triggerMode = 'pointer') {
    if (loading.value) return;
    highlightedTerritoryKey.value = null;
    selectedTooltip.value = { kind: 'point', uid: point.uid };
    tooltipTriggerMode.value = triggerMode;
    highlightedPointKey.value = point.uid;

    activePointKeyboardIndex.value = Number.isInteger(keyboardIndex)
        ? keyboardIndex
        : keyboardNavigablePoints.value.findIndex(
              (candidate) => candidate.uid === point.uid,
          );

    if (triggerMode === 'keyboard') {
        setKeyboardTooltipPositionFromPoint(point);
    }

    showTooltipWithHtml(formatPointTooltip(point));

    if (FINAL_CONFIG.value.events.datapointEnter) {
        FINAL_CONFIG.value.events.datapointEnter({
            datapoint: point,
            seriesIndex: point.index,
        });
    }
}

function onPointLeave(point, triggerMode = 'pointer') {
    if (triggerMode === 'pointer' && tooltipTriggerMode.value === 'keyboard')
        return;

    highlightedPointKey.value = null;
    hideTooltip();

    if (triggerMode !== 'pointer') {
        activePointKeyboardIndex.value = null;
        tooltipTriggerMode.value = 'pointer';
    }

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
        typeof FINAL_CONFIG.value.events.datapointClick === 'function'
    );
});

function onPointClick(point) {
    if (loading.value) return;
    if (hasPointClickEvent.value) {
        FINAL_CONFIG.value.events.datapointClick({
            datapoint: point,
            seriesIndex: point.index,
        });
    }
}

const territoryStyle = computed(() => cfgChart.value.territory);

function onGeoJsonPointEnter(geoJsonPoint) {
    if (loading.value) return;
    tooltipTriggerMode.value = 'pointer';
    activePointKeyboardIndex.value = null;
    highlightedPointKey.value = null;
    selectedTooltip.value = { kind: 'geoJsonPoint', uid: geoJsonPoint.uid };
    const title =
        typeof geoJsonPoint?.name === 'string' ? geoJsonPoint.name.trim() : '';

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

function clearSelection() {
    highlightedPointKey.value = null;
    highlightedTerritoryKey.value = null;
    activePointKeyboardIndex.value = null;
    tooltipTriggerMode.value = 'pointer';
    hideTooltip();
}
watch(
    [
        keyboardNavigablePoints,
        areaPaths,
        linePaths,
        geoJsonPoints,
        () => cfgChart.value.tooltip,
        loading,
    ],
    () => {
        const selection = selectedTooltip.value;
        if (!selection) return;
        if (loading.value) {
            clearSelection();
            return;
        }
        if (selection.kind === 'point') {
            const index = keyboardNavigablePoints.value.findIndex(
                (point) => point.uid === selection.uid,
            );
            if (index < 0) {
                clearSelection();
                return;
            }
            const point = keyboardNavigablePoints.value[index];
            activePointKeyboardIndex.value = index;
            tooltipContent.value = formatPointTooltip(point);
        } else {
            const territory =
                selection.kind === 'territory'
                    ? [...areaPaths.value, ...linePaths.value].find(
                          (feature) => feature.uid === selection.uid,
                      )
                    : geoJsonPoints.value.find(
                          (point) => point.uid === selection.uid,
                      );
            if (!territory) {
                clearSelection();
                return;
            }
            tooltipContent.value = formatTerritoryTooltip(
                selection.kind === 'geoJsonPoint'
                    ? {
                          name: territory.name,
                          uid: territory.uid,
                          index: territory.featureIndex,
                          properties: {},
                      }
                    : territory,
            );
        }
    },
    { flush: 'post' },
);
watch(
    [
        panZoomViewBox,
        mapFitTransform,
        viewportSizes,
        highlightedPointKey,
        tooltipTriggerMode,
    ],
    () => {
        if (tooltipTriggerMode.value !== 'keyboard') return;
        const point = keyboardNavigablePoints.value.find(
            (point) => point.uid === highlightedPointKey.value,
        );
        if (point) setKeyboardTooltipPositionFromPoint(point);
    },
    { deep: true, flush: 'post' },
);
watch(loading, () => {
    if (loading.value) clearSelection();
});

function toggleAnnotator() {
    isAnnotator.value = !isAnnotator.value;
}

watch(panZoomActive, (active) => {
    if (!active) {
        cancelFocus();
        isInteracting.value = false;
    }
});

function toggleTooltip() {
    mutableConfig.value.showTooltip = !mutableConfig.value.showTooltip;
}

const svgBg = computed(() => cfgChart.value.backgroundColor);
const svgTitle = computed(() => cfgChart.value.title);

const { isCallbackImaging, isCallbackSvg, generateSvg, onGenerateImage } =
    useChartExport({
        svg: svgRef,
        title: svgTitle,
        legend: null,
        legendItems: null,
        backgroundColor: svgBg,
        getSvgCallback: () => FINAL_CONFIG.value.userOptions.callbacks.svg,
        generateImage,
    });

const getImage = createChartImageGetter(
    geoChart,
    () => cfgChart.value.title.text,
);

let wheelStopTimer = null;

function startInteraction() {
    if (!panZoomActive.value) return;
    finishPendingFit();
    cancelFocus();
    cancelPanZoomAnimation();
    isInteracting.value = true;
}

function stopInteraction() {
    isInteracting.value = false;
}

function onWheelInteraction() {
    if (!panZoomActive.value) return;
    finishPendingFit();
    cancelFocus();
    cancelPanZoomAnimation();
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
    finishPendingFit();
    cancelFocus();
    cancelPanZoomAnimation();
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
        : {
              x: 0,
              y: 0,
              width: viewportSizes.value.width,
              height: viewportSizes.value.height,
          };

    const nextBox = {
        x: focusedViewportPoint.x - current.width / 2,
        y: focusedViewportPoint.y - current.height / 2,
        width: current.width,
        height: current.height,
    };

    if (!animated || prefersReducedMotion.value) {
        panZoomViewBox.value = nextBox;
        return;
    }

    const from = { ...current };
    const to = { ...nextBox };
    const duration = 250;
    let startTimestamp = null;

    const stepFrame = (timestamp) => {
        if (disposed) return;
        if (startTimestamp == null) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);

        panZoomViewBox.value = {
            x: from.x + (to.x - from.x) * progress,
            y: from.y + (to.y - from.y) * progress,
            width: from.width + (to.width - from.width) * progress,
            height: from.height + (to.height - from.height) * progress,
        };

        focusFrame = progress < 1 ? requestAnimationFrame(stepFrame) : null;
    };

    focusFrame = requestAnimationFrame(stepFrame);
}

onMounted(() => {
    prepareChart();
    scheduleFit();
});
onBeforeUnmount(() => {
    disposed = true;
    teardownResponsive();
    cancelFocus();
    if (fitFrame !== null) cancelAnimationFrame(fitFrame);
});

async function copyAlt() {
    emit('copyAlt', {
        config: FINAL_CONFIG.value,
        dataset: FINAL_DATASET.value,
    });
    if (!FINAL_CONFIG.value.userOptions.callbacks.altCopy) {
        console.warn(
            'Vue Data UI - A callback must be set for `altCopy` in userOptions.',
        );
        return;
    }
    await Promise.resolve(
        FINAL_CONFIG.value.userOptions.callbacks.altCopy({
            config: FINAL_CONFIG.value,
            dataset: FINAL_DATASET.value,
        }),
    );
}

/***************************************************************************************************
 * a11y
 **************************************************************************************************/

function findNearestPointInDirection(fromIndex, direction) {
    const list = keyboardNavigablePoints.value;
    if (!list.length) return null;

    const fromPoint = list[fromIndex];
    if (!fromPoint) return null;

    let bestIndex = null;
    let bestScore = Infinity;

    for (let i = 0; i < list.length; i += 1) {
        if (i === fromIndex) continue;

        const candidate = list[i];
        const deltaX = candidate.x - fromPoint.x;
        const deltaY = candidate.y - fromPoint.y;

        let isEligible = false;
        let primaryDistance = 0;
        let secondaryDistance = 0;

        if (direction === 'right' && deltaX > 0) {
            isEligible = true;
            primaryDistance = deltaX;
            secondaryDistance = Math.abs(deltaY);
        }

        if (direction === 'left' && deltaX < 0) {
            isEligible = true;
            primaryDistance = Math.abs(deltaX);
            secondaryDistance = Math.abs(deltaY);
        }

        if (direction === 'down' && deltaY > 0) {
            isEligible = true;
            primaryDistance = deltaY;
            secondaryDistance = Math.abs(deltaX);
        }

        if (direction === 'up' && deltaY < 0) {
            isEligible = true;
            primaryDistance = Math.abs(deltaY);
            secondaryDistance = Math.abs(deltaX);
        }

        if (!isEligible) continue;

        const score =
            primaryDistance * primaryDistance +
            secondaryDistance * secondaryDistance * 4;

        if (score < bestScore) {
            bestScore = score;
            bestIndex = i;
        }
    }

    return bestIndex;
}

function getInitialKeyboardPointIndex(direction) {
    const list = keyboardNavigablePoints.value;
    if (!list.length) return null;

    if (direction === 'right') {
        return list.reduce((bestIndex, point, index, array) => {
            return point.x < array[bestIndex].x ? index : bestIndex;
        }, 0);
    }

    if (direction === 'left') {
        return list.reduce((bestIndex, point, index, array) => {
            return point.x > array[bestIndex].x ? index : bestIndex;
        }, 0);
    }

    if (direction === 'down') {
        return list.reduce((bestIndex, point, index, array) => {
            return point.y < array[bestIndex].y ? index : bestIndex;
        }, 0);
    }

    if (direction === 'up') {
        return list.reduce((bestIndex, point, index, array) => {
            return point.y > array[bestIndex].y ? index : bestIndex;
        }, 0);
    }

    return 0;
}

function onSvgFocus() {
    isFocus.value = true;
}

function onSvgBlur() {
    const activePoint =
        activePointKeyboardIndex.value != null
            ? keyboardNavigablePoints.value[activePointKeyboardIndex.value]
            : null;

    if (activePoint) {
        onPointLeave(activePoint, 'keyboard');
    } else {
        activePointKeyboardIndex.value = null;
        tooltipTriggerMode.value = 'pointer';
        hideTooltip();
        highlightedPointKey.value = null;
    }

    isFocus.value = false;
}

function onSvgKeydown(event) {
    if (!svgRef.value || isAnnotator.value) return;
    if (document.activeElement !== svgRef.value) return;
    if (loading.value || !keyboardNavigablePoints.value.length) return;

    const isRight = event.key === 'ArrowRight';
    const isLeft = event.key === 'ArrowLeft';
    const isDown = event.key === 'ArrowDown';
    const isUp = event.key === 'ArrowUp';
    const isActivate = event.key === 'Enter' || event.key === ' ';
    const isEscape = event.key === 'Escape';

    if (!isRight && !isLeft && !isDown && !isUp && !isActivate && !isEscape)
        return;

    event.preventDefault();
    event.stopPropagation();

    if (isEscape) {
        const activePoint =
            activePointKeyboardIndex.value != null
                ? keyboardNavigablePoints.value[activePointKeyboardIndex.value]
                : null;

        if (activePoint) {
            onPointLeave(activePoint, 'keyboard');
        } else {
            activePointKeyboardIndex.value = null;
            tooltipTriggerMode.value = 'pointer';
            hideTooltip();
            highlightedPointKey.value = null;
        }

        return;
    }

    if (isActivate) {
        const activePoint =
            activePointKeyboardIndex.value != null
                ? keyboardNavigablePoints.value[activePointKeyboardIndex.value]
                : null;

        if (!activePoint) return;

        onPointClick(activePoint);
        return;
    }

    const direction = isRight
        ? 'right'
        : isLeft
          ? 'left'
          : isDown
            ? 'down'
            : 'up';

    let nextIndex = null;

    if (activePointKeyboardIndex.value == null) {
        nextIndex = getInitialKeyboardPointIndex(direction);
    } else {
        nextIndex = findNearestPointInDirection(
            activePointKeyboardIndex.value,
            direction,
        );

        if (nextIndex == null) {
            nextIndex = getInitialKeyboardPointIndex(direction);
        }
    }

    if (nextIndex == null) return;

    const nextPoint = keyboardNavigablePoints.value[nextIndex];
    if (!nextPoint) return;

    onPointEnter(nextPoint, nextIndex, 'keyboard');
}

const a11yTable = computed(() => {
    const headers = ['Name', 'Latitude', 'Longitude', 'Description'];

    const rows = points.value.map((point) => {
        const latitude = Array.isArray(point.coordinates)
            ? point.coordinates[1]
            : null;
        const longitude = Array.isArray(point.coordinates)
            ? point.coordinates[0]
            : null;

        return [
            point.name ?? '',
            Number.isFinite(latitude) ? String(latitude) : '',
            Number.isFinite(longitude) ? String(longitude) : '',
            point.description ?? '',
        ];
    });

    return {
        headers,
        rows,
    };
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
    copyAlt,
});
const annotationViewport = computed(() =>
    createPanZoomAnnotationViewport(
        FINAL_CONFIG.value.userOptions?.annotator?.followZoom,
        panZoomViewBox.value,
    ),
);
</script>

<template>
    <div
        :class="`vue-data-ui-component vue-ui-geo ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''} ${isResponsiveActive ? 'vue-ui-geo-responsive' : ''} ${isInteracting ? 'vue-ui-geo-interacting' : ''}`"
        ref="geoChart"
        :id="`map_${uid}`"
        dir="auto"
        @mouseenter="setUserOptionsVisibility(true)"
        @mouseleave="setUserOptionsVisibility(false)"
        :style="{
            fontFamily: FINAL_CONFIG.style.fontFamily,
            width: '100%',
            backgroundColor: cfgChart.backgroundColor,
            height: isResponsiveActive ? `${HEIGHT}px` : undefined,
        }"
    >
        <div :id="`chart-instructions-${uid}`" class="sr-only">
            <p>{{ FINAL_CONFIG.a11y.translations.keyboardNavigation }}</p>
        </div>

        <A11yDataTable
            v-if="FINAL_CONFIG.a11y.includeTable && a11yTable?.rows?.length"
            :uid="uid"
            :head="a11yTable.headers"
            :body="a11yTable.rows"
            :notice="FINAL_CONFIG.a11y.translations.tableAvailable"
            :caption="FINAL_CONFIG.a11y.translations.tableCaption"
        />

        <div
            ref="noTitle"
            v-if="hasOptionsNoTitle"
            class="vue-data-ui-no-title-space"
            :style="`height:36px; width: 100%;background:transparent`"
        />

        <div
            ref="chartTitle"
            v-if="cfgChart.title.text"
            :style="`width:100%;background:transparent;padding-bottom:12px`"
        >
            <Title
                :config="{
                    title: {
                        cy: 'geo-title',
                        ...cfgChart.title,
                    },
                    subtitle: {
                        cy: 'geo-subtitle',
                        ...cfgChart.title.subtitle,
                    },
                }"
            />
        </div>

        <PenAndPaper
            v-bind="getAnnotatorProps(FINAL_CONFIG.userOptions.annotator)"
            v-if="FINAL_CONFIG.userOptions.buttons.annotator"
            :svgRef="svgRef"
            :followZoom="FINAL_CONFIG.userOptions?.annotator?.followZoom"
            :annotationViewport="annotationViewport"
            :backgroundColor="cfgChart.backgroundColor"
            :color="cfgChart.color"
            :active="isAnnotator"
            :isCursorPointer="isCursorPointer"
            :palette="FINAL_CONFIG.userOptions.annotatorPalette"
            @close="toggleAnnotator"
        >
            <template
                v-for="slotName in annotationSlotNames"
                #[slotName]="slotProps"
            >
                <slot
                    :name="slotName"
                    v-bind="getAnnotationSlotProps(slotName, slotProps)"
                />
            </template>
        </PenAndPaper>

        <UserOptions
            ref="userOptionsRef"
            :key="`user_options_${step}`"
            v-if="
                FINAL_CONFIG.userOptions.show &&
                (keepUserOptionState ? true : userOptionsVisible)
            "
            :backgroundColor="cfgChart.backgroundColor"
            :color="cfgChart.color"
            :isPrinting="isPrinting"
            :isImaging="isImaging"
            :uid="uid"
            :hasXls="false"
            :hasTable="false"
            :hasTooltip="
                FINAL_CONFIG.userOptions.buttons.tooltip &&
                cfgChart.tooltip.show
            "
            :isZoom="panZoomActive"
            :isFullscreen="isFullscreen"
            :isTooltip="mutableConfig.showTooltip"
            :chartElement="geoChart"
            v-bind="
                getUserOptionsProps(
                    FINAL_CONFIG.userOptions,
                    'pdf img svg fullscreen altCopy annotator zoom',
                )
            "
            :isAnnotation="isAnnotator"
            :isCursorPointer="isCursorPointer"
            @toggleFullscreen="toggleFullscreen"
            @generatePdf="generatePdf"
            @generateImage="onGenerateImage"
            @generateSvg="generateSvg"
            @toggleTooltip="toggleTooltip"
            @toggleAnnotator="toggleAnnotator"
            @toggleZoom="toggleZoom"
            @copyAlt="copyAlt"
            :style="{
                visibility: keepUserOptionState
                    ? userOptionsVisible
                        ? 'visible'
                        : 'hidden'
                    : 'visible',
            }"
        >
            <template
                v-for="slotName in getUserOptionSlots(
                    $slots,
                    'menuIcon optionTooltip optionPdf optionImg optionSvg optionFullscreen optionAnnotator optionZoom optionAltCopy custom-menu-before custom-menu-after',
                )"
                #[slotName]="slotProps"
            >
                <slot
                    :name="slotName"
                    v-bind="getUserOptionSlotProps(slotName, slotProps)"
                />
            </template>
        </UserOptions>

        <BaseZoomControls
            ref="zoomControlsTop"
            v-if="
                cfgChart.controls.position === 'top' &&
                cfgChart.controls.show &&
                !loading
            "
            :config="FINAL_CONFIG"
            :scale="scale"
            :isFullscreen="isFullscreen"
            :isCursorPointer="isCursorPointer"
            @zoomIn="zoomIn"
            @zoomOut="zoomOut"
            @resetZoom="hardResetZoom"
        />

        <div style="position: relative">
            <svg
                ref="svgRef"
                :xmlns="XMLNS"
                :viewBox="viewBox"
                preserveAspectRatio="xMidYMid meet"
                :aria-describedby="`chart-instructions-${uid}`"
                tabindex="0"
                :style="{
                    display: 'block',
                    width: '100%',
                    height: isResponsiveActive ? `${HEIGHT}px` : 'auto',
                    background: cfgChart.backgroundColor,
                    touchAction: panZoomActive ? 'none' : 'auto',
                    cursor: panZoomActive
                        ? isInteracting
                            ? 'grabbing'
                            : 'grab'
                        : 'default',
                }"
                :id="`vue-ui-geo_${uid}`"
                @pointerdown="startInteraction"
                @pointerup="stopInteraction"
                @pointercancel="stopInteraction"
                @pointerleave="stopInteraction"
                @wheel="onWheelInteraction"
                @focus="onSvgFocus"
                @blur="onSvgBlur"
                @keydown="onSvgKeydown"
            >
                <PackageVersion />

                <g
                    :transform="mapFitTransform.transform"
                    :style="{ pointerEvents: isInteracting ? 'none' : 'auto' }"
                >
                    <slot
                        name="svg-underlayer"
                        :svg="{
                            drawingArea: viewBox,
                            x: projectedBounds?.minX ?? 0,
                            y: projectedBounds?.minY ?? 0,
                            width: projectedBounds?.width ?? 0,
                            height: projectedBounds?.height ?? 0,
                            isPrintingImg:
                                isPrinting || isImaging || isCallbackImaging,
                            isPrintingSvg: isCallbackSvg,
                            data: {
                                areaPaths,
                                linePaths,
                                geoJsonPoints,
                                projectedPoints,
                            },
                        }"
                    />
                    <g>
                        <path
                            class="vue-ui-geo-territory"
                            data-cy="tooltip-trap-territory"
                            v-for="territory in areaPaths"
                            :key="territory.uid"
                            :d="territory.path"
                            :fill="
                                highlightedTerritoryKey === territory.uid
                                    ? territoryStyle.hover.fill
                                    : territoryStyle.fill
                            "
                            :stroke="
                                highlightedTerritoryKey === territory.uid
                                    ? territoryStyle.hover.stroke
                                    : territoryStyle.stroke
                            "
                            :stroke-width="
                                highlightedTerritoryKey === territory.uid
                                    ? territoryStyle.hover.strokeWidth
                                    : territoryStyle.strokeWidth
                            "
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
                            :stroke="
                                highlightedTerritoryKey === territory.uid
                                    ? territoryStyle.hover.stroke
                                    : territoryStyle.stroke
                            "
                            :stroke-width="
                                highlightedTerritoryKey === territory.uid
                                    ? territoryStyle.hover.strokeWidth
                                    : territoryStyle.strokeWidth
                            "
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

                    <g
                        v-for="(point, pointKeyboardIndex) in projectedPoints"
                        :key="point.uid"
                    >
                        <slot
                            name="datapoint"
                            v-bind="{
                                point,
                                onPointEnter,
                                onPointLeave,
                                onPointClick,
                                highlighted: highlightedPointKey === point.uid,
                            }"
                        >
                            <circle
                                :class="{
                                    'vue-ui-geo-point': true,
                                    'vue-ui-geo-point-with-event':
                                        hasPointClickEvent && isCursorPointer,
                                }"
                                :cx="point.x"
                                :cy="point.y"
                                :r="
                                    highlightedPointKey === point.uid
                                        ? point.radius * point.hoverRadiusRatio
                                        : point.radius
                                "
                                :fill="point.fill"
                                :stroke="cfgPoints.stroke"
                                :stroke-width="cfgPoints.strokeWidth"
                                vector-effect="non-scaling-stroke"
                                @mouseenter="
                                    onPointEnter(point, pointKeyboardIndex)
                                "
                                @mouseleave="onPointLeave(point)"
                                @click="onPointClick(point)"
                            />
                        </slot>

                        <text
                            class="vue-ui-geo-point-label"
                            v-if="cfgLabels.show"
                            :x="point.x"
                            :y="
                                point.y +
                                (highlightedPointKey === point.uid
                                    ? point.radius * point.hoverRadiusRatio
                                    : point.radius) +
                                cfgLabels.offsetY +
                                1 * cfgLabels.fontSizeRatio
                            "
                            text-anchor="middle"
                            :fill="cfgLabels.color"
                            :font-size="1 * cfgLabels.fontSizeRatio"
                        >
                            {{ point.name }}
                        </text>
                    </g>
                    <slot
                        name="svg"
                        :svg="{
                            drawingArea: viewBox,
                            x: projectedBounds?.minX ?? 0,
                            y: projectedBounds?.minY ?? 0,
                            width: projectedBounds?.width ?? 0,
                            height: projectedBounds?.height ?? 0,
                            isPrintingImg:
                                isPrinting || isImaging || isCallbackImaging,
                            isPrintingSvg: isCallbackSvg,
                            data: {
                                areaPaths,
                                linePaths,
                                geoJsonPoints,
                                projectedPoints,
                            },
                        }"
                    />
                </g>
            </svg>
            <div
                v-if="$slots.hint"
                style="position: absolute; top: 100%; left: 0; width: 100%"
                data-dom-to-png-ignore
                aria-hidden="true"
            >
                <slot
                    name="hint"
                    v-bind="{
                        hint: FINAL_CONFIG.a11y.translations.keyboardNavigation,
                        isVisible: isFocus,
                    }"
                />
            </div>
        </div>

        <div v-if="$slots.watermark" class="vue-data-ui-watermark">
            <slot
                name="watermark"
                v-bind="{
                    isPrinting:
                        isPrinting ||
                        isImaging ||
                        isCallbackImaging ||
                        isCallbackSvg,
                }"
            />
        </div>

        <BaseZoomControls
            ref="zoomControlsBottom"
            v-if="
                cfgChart.controls.position === 'bottom' &&
                cfgChart.controls.show &&
                !loading
            "
            :config="FINAL_CONFIG"
            :scale="scale"
            :isFullscreen="isFullscreen"
            :isCursorPointer="isCursorPointer"
            @zoomIn="zoomIn"
            @zoomOut="zoomOut"
            @resetZoom="hardResetZoom"
        />

        <Tooltip
            :teleportTo="cfgChart.tooltip.teleportTo"
            :show="mutableConfig.showTooltip && isTooltipVisible"
            :backgroundColor="cfgChart.tooltip.backgroundColor"
            :color="cfgChart.tooltip.color"
            :fontSize="cfgChart.tooltip.fontSize"
            :borderRadius="cfgChart.tooltip.borderRadius"
            :borderColor="cfgChart.tooltip.borderColor"
            :borderWidth="cfgChart.tooltip.borderWidth"
            :backgroundOpacity="cfgChart.tooltip.backgroundOpacity"
            :position="cfgChart.tooltip.position"
            :offsetX="cfgChart.tooltip.offsetX"
            :offsetY="cfgChart.tooltip.offsetY"
            :parent="geoChart"
            :content="tooltipContent"
            :isCustom="useCustomFormat"
            :isFullscreen="isFullscreen"
            :smooth="cfgChart.tooltip.smooth"
            :backdropFilter="cfgChart.tooltip.backdropFilter"
            :smoothForce="cfgChart.tooltip.smoothForce"
            :smoothSnapThreshold="cfgChart.tooltip.smoothSnapThreshold"
            :isA11yMode="tooltipTriggerMode === 'keyboard'"
            :a11yPosition="tooltipA11yPosition"
        >
            <template #tooltip-before>
                <slot
                    name="tooltip-before"
                    v-bind="{ ...dataTooltipSlot }"
                ></slot>
            </template>
            <template #tooltip>
                <slot name="tooltip" v-bind="{ ...dataTooltipSlot }" />
            </template>
            <template #tooltip-after>
                <slot
                    name="tooltip-after"
                    v-bind="{ ...dataTooltipSlot }"
                ></slot>
            </template>
        </Tooltip>

        <div v-if="$slots.source" ref="source" dir="auto">
            <slot name="source" />
        </div>

        <slot name="skeleton">
            <BaseScanner v-if="loading" />
        </slot>
    </div>
</template>

<style scoped>
@import '../vue-data-ui.css';

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

svg:focus {
    outline: none;
}

svg:focus-visible {
    outline: 2px solid currentColor;
}

.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip-path: inset(50%);
    clip: rect(0 0 0 0);
    white-space: normal;
    border: 0;
}
</style>
