<script setup>
import {
    getUserOptionsProps,
    getUserOptionSlots,
    getUserOptionSlotProps,
} from '../userOptionsSlots';
import { getAnnotatorProps } from '../annotatorConfig';
import { getTableComponent, syncTableVisibility } from '../tableIntegration';
import {
    annotationSlotNames,
    getAnnotationSlotProps,
} from '../annotationSlots';

import { createChartImageGetter } from '../chartImage';
import {
    computed,
    defineAsyncComponent,
    nextTick,
    onMounted,
    ref,
    toRefs,
    watch,
} from 'vue';
import {
    countryCode,
    featureCode,
    valueStatus,
    normalizeWorldDataset,
    createWorldScale,
    isValidWorldPoint,
    worldPathBounds,
} from '../worldUtils';
import { useWorldNavigation } from '../useWorldNavigation';
import WORLD_DATA from '../resources/worldGeo.js';
import {
    stringifyChartConfig as stringifyStructuralConfig,
    applyDataLabel,
    convertColorToHex,
    convertCustomPalette,
    createCsvContent,
    createUid,
    darkenHexColor,
    dataLabel,
    downloadCsv,
    hasDeepProperty,
    isFunction,
    lightenHexColor,
    palette,
    treeShake,
    XMLNS,
} from '../lib';
import { useHints } from '../useHints';
import { useConfig } from '../useConfig';
import { useLoading } from '../useLoading.js';
import { usePrinter } from '../usePrinter';
import { resolveChartConfigWithPalette } from '../resolveChartConfig';
import themes from '../themes/vue_ui_world.json';
import { useChartExport } from '../useChartExport.js';
import { useUserOptionState } from '../useUserOptionState';
import geo from '../geoProjections';
import Shape from '../atoms/Shape.vue';
import BaseScanner from '../atoms/BaseScanner.vue';
import BaseLegendToggle from '../atoms/BaseLegendToggle.vue';
import DefGrad from '../atoms/DefGrad.vue';

const Title = defineAsyncComponent(() => import('../atoms/Title.vue'));
const Legend = defineAsyncComponent(() => import('../atoms/Legend.vue'));
const Tooltip = defineAsyncComponent(() => import('../atoms/Tooltip.vue'));
const BaseIcon = defineAsyncComponent(() => import('../atoms/BaseIcon.vue'));
const Accordion = defineAsyncComponent(() => import('./vue-ui-accordion.vue'));
const DataTable = defineAsyncComponent(() => import('../atoms/DataTable.vue'));
const PenAndPaper = defineAsyncComponent(
    () => import('../atoms/PenAndPaper.vue'),
);
const UserOptions = defineAsyncComponent(
    () => import('../atoms/UserOptions.vue'),
);
const PackageVersion = defineAsyncComponent(
    () => import('../atoms/PackageVersion.vue'),
);
const BaseDraggableDialog = defineAsyncComponent(
    () => import('../atoms/BaseDraggableDialog.vue'),
);

const { vue_ui_world: DEFAULT_CONFIG } = useConfig();

const props = defineProps({
    config: {
        type: Object,
        default() {
            return {};
        },
    },
    points: { type: Array, default: () => [] },
    selectedCountries: { type: Array, default: undefined },
    dataset: {
        type: Object,
        default() {
            return {};
        },
    },
});

const emit = defineEmits([
    'selectDatapoint',
    'selectLegend',
    'copyAlt',
    'update:selectedCountries',
    'selectPoint',
    'viewChange',
]);

const validPoints = computed(() =>
    props.points.flatMap((point, index) =>
        isValidWorldPoint(point) ? [{ ...point, index }] : [],
    ),
);
const isDataset = computed(
    () => !!FINAL_DATASET.value || validPoints.value.length > 0,
);

const hasCategories = computed(() => {
    if (!isDataset.value) return false;
    return Object.values(normalizedDataset.value).some((d) =>
        Object.hasOwn(d, 'category'),
    );
});

const worldChart = ref(null);
const chartTitle = ref(null);
const chartLegend = ref(null);
const source = ref(null);
const noTitle = ref(null);
const titleStep = ref(0);
const legendStep = ref(0);
const tableStep = ref(0);
const uid = ref(createUid());
const isTooltip = ref(false);
const tooltipContent = ref('');
const step = ref(0);
const readyTeleport = ref(false);
const tableUnit = ref(null);
const userOptionsRef = ref(null);

onMounted(() => {
    readyTeleport.value = true;
});

const worldGeo = ref(WORLD_DATA);
const {
    projections,
    getProjectedBounds,
    setupTerritories,
    geoToPath: makeGeoPath,
} = geo;

function prepareConfig() {
    const mergedConfig = resolveChartConfigWithPalette(
        props.config,
        DEFAULT_CONFIG,
        themes,
    );
    // A nullable default cannot accept array overrides through treeShake.
    const domain = hasDeepProperty(
        props.config,
        'style.chart.colorScale.domain',
    )
        ? props.config.style.chart.colorScale.domain
        : themes[mergedConfig.theme]?.style?.chart?.colorScale?.domain;
    mergedConfig.style.chart.colorScale.domain = Array.isArray(domain)
        ? [...domain]
        : null;
    const territory = mergedConfig.style.chart.territory;
    const themedTerritory = themes[mergedConfig.theme]?.style?.chart?.territory;
    if (hasDeepProperty(props.config, 'style.chart.territory.colors.min')) {
        territory.colors.min = convertColorToHex(
            props.config.style.chart.territory.colors.min,
        );
    } else {
        territory.colors.min = convertColorToHex(
            themedTerritory?.colors?.min ?? territory.emptyColor,
        );
    }
    if (hasDeepProperty(props.config, 'style.chart.territory.colors.max')) {
        territory.colors.max = convertColorToHex(
            props.config.style.chart.territory.colors.max,
        );
    } else {
        territory.colors.max = convertColorToHex(
            themedTerritory?.colors?.max ??
                mergedConfig.customPalette[0] ??
                palette[0],
        );
    }

    worldGeo.value = setupTerritories(
        mergedConfig,
        structuredClone(WORLD_DATA),
    );

    // --------------------------------------------------------------------

    return mergedConfig;
}

const FINAL_CONFIG = ref(prepareConfig());
const cfgUserOptions = computed(() => FINAL_CONFIG.value.userOptions);
const cfgTooltip = computed(() => FINAL_CONFIG.value.style.chart.tooltip);
const cfgGlobe = computed(() => FINAL_CONFIG.value.style.chart.globe);
const cfgTerritory = computed(() => FINAL_CONFIG.value.style.chart.territory);
const cfgLegend = computed(() => FINAL_CONFIG.value.style.chart.legend);
const cfgChart = computed(() => FINAL_CONFIG.value.style.chart);
const cfgZoom = computed(() => cfgChart.value.zoom);
const center = ref([cfgGlobe.value.center.x, cfgGlobe.value.center.y]);
watch(
    [() => cfgGlobe.value.center.x, () => cfgGlobe.value.center.y],
    (value) => {
        center.value = value;
    },
);

useHints({
    config: () => FINAL_CONFIG.value,
    dataset: () => props.dataset,
    component: 'VueUiWorld',
    rules: [
        {
            test: (dataset) =>
                Object.keys(dataset || {}).some(
                    (code) =>
                        !WORLD_DATA.features.some(
                            (f) =>
                                featureCode(f) ===
                                countryCode(
                                    code,
                                    FINAL_CONFIG.value.normalizeCountryCodes,
                                ),
                        ),
                ),
            message: [
                'Unknown country codes: check ISO alpha-3 codes or enable normalizeCountryCodes for alpha-2 aliases.',
            ],
        },
        {
            test: (dataset) =>
                Object.values(dataset || {}).some(
                    (d) =>
                        valueStatus(d?.value) === 'invalid' ||
                        !d ||
                        typeof d !== 'object',
                ),
            message: [
                'Invalid country values: use finite numbers, or null for missing data.',
            ],
        },
        {
            test: (dataset) =>
                FINAL_CONFIG.value.style.chart.colorScale.type === 'log' &&
                Object.values(dataset || {}).some(
                    (d) => Number.isFinite(d?.value) && d.value <= 0,
                ),
            message: [
                'Logarithmic scales require positive values. Zero and negative values use invalidColor.',
            ],
        },
    ],
});

const isCursorPointer = computed(
    () => FINAL_CONFIG.value.userOptions.useCursorPointer,
);

const skeletonConfig = computed(() => {
    return treeShake({
        defaultConfig: {
            userOptions: { show: false },
            table: { show: false },
            style: {
                chart: {
                    backgroundColor: '#99999930',
                    globe: {
                        waterColor: '#8A8A8A',
                    },
                    territory: {
                        stroke: '#6A6A6A',
                        colors: {
                            min: '#E0E0E0',
                            max: '#E0E0E0',
                        },
                    },
                },
            },
        },
        userConfig: FINAL_CONFIG.value.skeletonConfig ?? {},
    });
});

const { loading, FINAL_DATASET } = useLoading({
    ...toRefs(props),
    FINAL_CONFIG,
    prepareConfig,
    allowEmptyDataset: () => validPoints.value.length > 0,
    skeletonDataset: props.config?.skeletonDataset ?? [],
    skeletonConfig: treeShake({
        defaultConfig: FINAL_CONFIG.value,
        userConfig: skeletonConfig.value,
    }),
});

const { userOptionsVisible, setUserOptionsVisibility, keepUserOptionState } =
    useUserOptionState({ config: FINAL_CONFIG.value });

const svgRef = ref(null);

const mutableConfig = ref({
    showTable: FINAL_CONFIG.value.table.show,
    showTooltip: cfgTooltip.value.show,
    showZoom: cfgZoom.value.show,
});

let previousStructuralConfig = stringifyStructuralConfig(props.config);

watch(
    () => props.config,
    (newConfig, oldConfig) => {
        const nextStructuralConfig = stringifyStructuralConfig(newConfig);

        const requiresChartPreparation =
            nextStructuralConfig !== previousStructuralConfig;

        previousStructuralConfig = nextStructuralConfig;

        const preparedConfig = prepareConfig();

        if (!requiresChartPreparation) {
            FINAL_CONFIG.value.style.chart.tooltip =
                preparedConfig.style.chart.tooltip;

            mutableConfig.value.showTooltip =
                FINAL_CONFIG.value.style.chart.tooltip.show;

            return;
        }

        FINAL_CONFIG.value = preparedConfig;
        userOptionsVisible.value =
            !FINAL_CONFIG.value.userOptions.showOnChartHover;
        titleStep.value += 1;
        tableStep.value += 1;
        legendStep.value += 1;
        mutableConfig.value.showTable = FINAL_CONFIG.value.table.show;
        mutableConfig.value.showTooltip = cfgTooltip.value.show;
    },
);

watch(
    FINAL_CONFIG,
    () => {
        mutableConfig.value.showTable = FINAL_CONFIG.value.table.show;
        mutableConfig.value.showTooltip = cfgTooltip.value.show;
    },
    { immediate: true },
);

// Dataset/theme refreshes must not undo a user-selected zoom lock.
watch(
    () => cfgZoom.value.show,
    (show) => {
        mutableConfig.value.showZoom = show;
    },
);

const customPalette = computed(() => {
    return convertCustomPalette(FINAL_CONFIG.value.customPalette);
});

const projection = computed(() => FINAL_CONFIG.value.projection || 'globe');

const sizes = computed(() => {
    const { height, width } = cfgChart.value.dimensions;
    return {
        aitoff: { width: width || 1000, height: height || 500 },
        azimuthalEquidistant: { width: width || 1000, height: height || 1000 },
        bonne: { width: width || 1000, height: height || 1000 },
        equirectangular: { width: width || 1000, height: height || 700 },
        gallPeters: { width: width || 1000, height: height || 800 },
        globe: { width: width || 1000, height: height || 1000 },
        hammer: { width: width || 1000, height: height || 500 },
        mercator: { width: width || 1000, height: height || 750 },
        mollweide: { width: width || 1000, height: height || 600 },
        robinson: { width: width || 1000, height: height || 600 },
        sinusoidal: { width: width || 1000, height: height || 500 },
        vanDerGrinten: { width: width || 1000, height: height || 1000 },
        winkelTripel: { width: width || 1000, height: height || 1000 },
    }[projection.value];
});

const baseViewBox = computed(() => {
    const { minX, minY, width, height } = getProjectedBounds(
        projections[projection.value],
        worldGeo.value.features,
        sizes.value.width,
        sizes.value.height,
        center.value,
    );

    return {
        str: `${minX} ${minY} ${width} ${height}`,
        minX,
        minY,
        width,
        height,
    };
});

const normalizedDataset = computed(() =>
    normalizeWorldDataset(
        FINAL_DATASET.value,
        FINAL_CONFIG.value.normalizeCountryCodes,
    ),
);
const colorScale = computed(() =>
    createWorldScale(
        Object.values(normalizedDataset.value).map((d) => d.value),
        cfgChart.value.colorScale,
        {
            min: cfgTerritory.value.colors.min || '#FFFFFF00',
            max:
                cfgTerritory.value.colors.max ||
                customPalette.value[0] ||
                palette[0],
        },
    ),
);
function getHeatmapColor(value) {
    const status = valueStatus(value);
    if (status === 'missing') return cfgTerritory.value.emptyColor;
    return colorScale.value.color(value) || cfgTerritory.value.invalidColor;
}
function formatValue(value, status = valueStatus(value)) {
    if (status !== 'valid') return '—';
    return applyDataLabel(
        cfgChart.value.dataLabels.formatter,
        value,
        dataLabel({
            p: cfgChart.value.dataLabels.prefix,
            v: value,
            s: cfgChart.value.dataLabels.suffix,
            r: cfgChart.value.dataLabels.rounding,
        }),
    );
}
function formatScale(value) {
    const formatter = cfgChart.value.colorScale.legend.formatter;
    return isFunction(formatter) ? formatter(value) : formatValue(value);
}
const scaleLegendStyle = computed(() => ({
    background: `linear-gradient(to right, ${colorScale.value.stops.map((s) => `${s.color} ${s.offset}%`).join(',')})`,
    borderRadius: `${cfgChart.value.colorScale.legend.gradient.borderRadius}px`,
    height: `${cfgChart.value.colorScale.legend.gradient.height}px`,
}));

function project([lon, lat]) {
    const fn = projections[projection.value] || projections.globe;
    return fn([lon, lat], sizes.value.width, sizes.value.height, center.value);
}

function geoToPath(geometry) {
    return makeGeoPath(geometry, {
        projection: projection.value,
        width: sizes.value.width,
        height: sizes.value.height,
        center: center.value,
    });
}

const categories = computed(() => {
    const entries = Object.values(normalizedDataset.value).filter(
        (d) => !!d.category,
    );
    const uniqueCategoriesMap = {};
    entries.forEach((entry) => {
        if (!uniqueCategoriesMap[entry.category]) {
            uniqueCategoriesMap[entry.category] = entry;
        }
    });
    return Object.values(uniqueCategoriesMap).map((el, i) => ({
        name: el.category,
        color: el.color
            ? convertColorToHex(el.color)
            : customPalette.value[i] ||
              palette[i] ||
              palette[i % palette.length],
    }));
});

function getColorByCategory(category) {
    const found = categories.value.find((c) => c.name === category);
    return found ? found.color : '#000000';
}

const territoryUidByCode = new Map();

function getTerritoryUid(code) {
    if (!territoryUidByCode.has(code)) {
        territoryUidByCode.set(code, `territory-${createUid()}`);
    }

    return territoryUidByCode.get(code);
}

// Geometry is independent of values, colors and localized labels.
const projectedTerritories = computed(() =>
    worldGeo.value.features.map((feature) => {
        const path = geoToPath(feature.geometry);
        return {
            feature,
            code: featureCode(feature),
            path,
            bounds: worldPathBounds(path),
        };
    }),
);
const countries = computed(() =>
    projectedTerritories.value.map(({ feature, code, path }) => {
        const item = normalizedDataset.value[code];
        const rawValue = item?.value;
        const status =
            valueStatus(rawValue) === 'valid' &&
            cfgChart.value.colorScale.type === 'log' &&
            rawValue <= 0
                ? 'invalid'
                : valueStatus(rawValue);
        const name =
            FINAL_CONFIG.value.countryNames[code] || feature.properties.name;
        return {
            path,
            name: isFunction(FINAL_CONFIG.value.countryNameFormatter)
                ? FINAL_CONFIG.value.countryNameFormatter({
                      code,
                      name,
                      feature,
                  })
                : name,
            geo: feature,
            code,
            geometry: feature.geometry,
            color: item?.color
                ? convertColorToHex(item.color)
                : item?.category
                  ? getColorByCategory(item.category)
                  : getHeatmapColor(rawValue),
            value: Number.isFinite(rawValue) ? rawValue : null,
            valueStatus: status,
            category: item?.category || null,
            isActive: !!item,
            uid: getTerritoryUid(code),
        };
    }),
);

const isFullscreen = ref(false);
function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
}

const isAnnotator = ref(false);
function toggleAnnotator() {
    isAnnotator.value = !isAnnotator.value;
}

function toggleTable() {
    mutableConfig.value.showTable = !mutableConfig.value.showTable;
}

function toggleTooltip() {
    mutableConfig.value.showTooltip = !mutableConfig.value.showTooltip;
}

function toggleZoom() {
    mutableConfig.value.showZoom = !mutableConfig.value.showZoom;
}

const {
    viewBox,
    camera,
    suppressClick,
    dragging,
    zoomIn,
    zoomOut,
    resetView,
    resetZoom,
    isZoom,
    isViewportZoomed,
    fitCountries,
    focusCountry,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onWheel,
    onMapKey,
} = useWorldNavigation({
    config: cfgZoom,
    enabled: computed(() => mutableConfig.value.showZoom),
    projection,
    center,
    baseViewBox,
    svgRef,
    initialCenter: () => [cfgGlobe.value.center.x, cfgGlobe.value.center.y],
    features: computed(() => worldGeo.value.features),
    project,
    isAnnotator,
    loading,
    emit,
});
const visibleCountryCodes = computed(() => {
    const { minX, minY, width, height } = viewBox.value;
    return new Set(
        projectedTerritories.value
            .filter((territory) =>
                territory.bounds.some(
                    (bounds) =>
                        bounds.maxX >= minX &&
                        bounds.minX <= minX + width &&
                        bounds.maxY >= minY &&
                        bounds.minY <= minY + height,
                ),
            )
            .map((territory) => territory.code),
    );
});
const visibleCountries = computed(() =>
    countries.value.filter((country) =>
        visibleCountryCodes.value.has(country.code),
    ),
);
const tabCountryCode = computed(() =>
    visibleCountries.value.some((c) => c.code === focusedCode.value)
        ? focusedCode.value
        : visibleCountries.value[0]?.code,
);
const projectedPoints = computed(() => {
    const cfg = cfgChart.value.points;
    const max = Math.max(
        0,
        ...validPoints.value.map((p) =>
            Number.isFinite(p.value) && p.value > 0 ? p.value : 0,
        ),
    );
    return validPoints.value.flatMap((point) => {
        const { coordinates: coords, index } = point;
        if (
            projection.value === 'globe' &&
            !geo.isGlobePointVisible(coords, center.value)
        )
            return [];
        const [x, y] = project(coords);
        if (!Number.isFinite(x) || !Number.isFinite(y)) return [];
        return [
            {
                ...point,
                index,
                x,
                y,
                radius: Math.max(
                    0,
                    Number.isFinite(point.radius)
                        ? point.radius
                        : Number.isFinite(point.value)
                          ? cfg.maxRadius *
                            Math.sqrt(Math.max(0, point.value) / (max || 1))
                          : cfg.radius,
                ),
            },
        ];
    });
});
function selectPoint(point) {
    if (!suppressClick.value && !isAnnotator.value && !loading.value)
        emit('selectPoint', props.points[point.index]);
}
const hasOptionsNoTitle = computed(() => {
    return FINAL_CONFIG.value.userOptions.show && !cfgChart.value.title.text;
});

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `world_${uid.value}`,
    fileName: cfgChart.value.title.text || 'vue-ui-world',
    options: FINAL_CONFIG.value.userOptions.print,
});

const useCustomFormat = ref(false);
const dataTooltipSlot = ref(null);
const hoveredCode = ref(null);
const hoveredPointKey = ref(null);
const pointKey = (point) =>
    point.id == null
        ? `index:${point.index}`
        : `${typeof point.id}:${point.id}`;
const activePoint = computed(() =>
    cfgChart.value.points.show && !loading.value
        ? projectedPoints.value.find(
              (point) => pointKey(point) === hoveredPointKey.value,
          ) || null
        : null,
);
const tooltipDatapoint = computed(() =>
    activePoint.value
        ? props.points[activePoint.value.index]
        : selectedDatapoint.value,
);
const localSelected = ref([]);
const selectedCodes = computed(() =>
    (props.selectedCountries ?? localSelected.value).map((c) =>
        countryCode(c, FINAL_CONFIG.value.normalizeCountryCodes),
    ),
);
const selectedCountryPaths = computed(() => {
    if (!FINAL_CONFIG.value.selection.enabled || loading.value) return [];
    const selected = new Set(selectedCodes.value);
    return countries.value.filter(
        (country) => selected.has(country.code) && country.path,
    );
});
const selectedDatapoint = computed(
    () => countries.value.find((c) => c.code === hoveredCode.value) || null,
);
const tooltipAnchor = ref(null);
const keyboardTooltip = ref(false);
const pointerInteraction = ref(false);
const focusedCode = ref(null);
function clearSelection() {
    hoveredCode.value = null;
    hoveredPointKey.value = null;
    localSelected.value = [];
    isTooltip.value = false;
    emit('update:selectedCountries', []);
}
function isSelected(country) {
    return selectedCodes.value.includes(country.code);
}
function anchorTooltip(element) {
    const rect = element?.getBoundingClientRect?.();
    if (rect)
        tooltipAnchor.value = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
        };
}
function onCountryFocus(country, index, event) {
    focusedCode.value = country.code;
    keyboardTooltip.value = !pointerInteraction.value;
    if (keyboardTooltip.value) anchorTooltip(event.target);
    useTooltip({ datapoint: country, seriesIndex: index });
}
function onCountryKey(event, country, index) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onTrapClick({ datapoint: country, seriesIndex: index });
    } else if (event.key === 'Escape') {
        event.stopPropagation();
        clearSelection();
    } else if (
        [
            'ArrowLeft',
            'ArrowRight',
            'ArrowUp',
            'ArrowDown',
            'Home',
            'End',
        ].includes(event.key)
    ) {
        event.preventDefault();
        const visible = visibleCountries.value;
        if (!visible.length) return;
        const current = visible.findIndex((c) => c.code === country.code);
        const backwards = ['ArrowLeft', 'ArrowUp'].includes(event.key);
        const next =
            event.key === 'Home'
                ? 0
                : event.key === 'End'
                  ? visible.length - 1
                  : current < 0
                    ? backwards
                        ? visible.length - 1
                        : 0
                    : (current + (backwards ? -1 : 1) + visible.length) %
                      visible.length;
        const code = visible[next]?.code;
        svgRef.value?.querySelector(`[data-country="${code}"]`)?.focus();
    }
}
watch(
    () => FINAL_CONFIG.value.selection.enabled,
    (enabled) => {
        if (!enabled) clearSelection();
    },
);
watch(countries, () => {
    const availableCodes = new Set(countries.value.map((c) => c.code));
    const retained = selectedCodes.value.filter((code) =>
        availableCodes.has(code),
    );
    if (retained.length !== selectedCodes.value.length) {
        localSelected.value = retained;
        emit('update:selectedCountries', retained);
    }
    if (
        hoveredCode.value &&
        !countries.value.some((c) => c.code === hoveredCode.value)
    )
        hoveredCode.value = null;
    if (!tooltipDatapoint.value) isTooltip.value = false;
});

function tooltipElement() {
    return activePoint.value
        ? svgRef.value?.querySelector(
              `[data-world-point="${activePoint.value.index}"]`,
          )
        : svgRef.value?.querySelector(
              `[data-country="${selectedDatapoint.value?.code}"]`,
          );
}
watch(viewBox, async () => {
    if (!keyboardTooltip.value) return;
    await nextTick();
    anchorTooltip(tooltipElement());
});
function usePointTooltip(point, event, keyboard = false) {
    if (loading.value || isAnnotator.value || dragging.value) return;
    hoveredCode.value = null;
    hoveredPointKey.value = pointKey(point);
    keyboardTooltip.value = keyboard && !pointerInteraction.value;
    if (keyboardTooltip.value) anchorTooltip(event.target);
    isTooltip.value = true;
}
function leavePointTooltip(point) {
    if (hoveredPointKey.value !== pointKey(point)) return;
    hoveredPointKey.value = null;
    isTooltip.value = false;
}

function getLargestPolygon(geometry) {
    if (!geometry) return [];
    if (geometry.type === 'Polygon') return geometry.coordinates;
    if (geometry.type === 'MultiPolygon') {
        return geometry.coordinates.reduce(
            (max, coords) =>
                coords[0].length > (max[0]?.length || 0) ? coords : max,
            [],
        );
    }
    return [];
}

const tooltipPreviewSvg = computed(() => {
    const geometry = selectedDatapoint.value?.geometry;
    if (!geometry) return '';

    const mainPoly = getLargestPolygon(geometry);
    if (!mainPoly.length) return '';

    const allCoords = mainPoly.flat();
    const avgLon =
        allCoords.reduce((sum, [lon]) => sum + lon, 0) / allCoords.length;
    const avgLat =
        allCoords.reduce((sum, [, lat]) => sum + lat, 0) / allCoords.length;
    const countryCenter = [avgLon, avgLat];
    const projectFn = projections[projection.value] || projections.globe;
    const w = sizes.value.width;
    const h = sizes.value.height;
    const allRings = mainPoly.map((ring) =>
        ring.map(([lon, lat]) => projectFn([lon, lat], w, h, countryCenter)),
    );
    const flat = allRings.flat();
    const xs = flat.map(([x, y]) => x);
    const ys = flat.map(([x, y]) => y);
    const minX = Math.min(...xs),
        maxX = Math.max(...xs);
    const minY = Math.min(...ys),
        maxY = Math.max(...ys);
    const svgSize = 80;
    const padding = 8;
    const innerW = svgSize - 2 * padding;
    const innerH = svgSize - 2 * padding;
    const countryW = maxX - minX || 1;
    const countryH = maxY - minY || 1;
    const scale = Math.min(innerW / countryW, innerH / countryH);
    function toMini([x, y]) {
        return [(x - minX) * scale + padding, (y - minY) * scale + padding];
    }

    const pathD = allRings
        .map((ring) => {
            const pts = ring.map(toMini);
            return 'M' + pts.map(([x, y]) => `${x},${y}`).join('L') + 'Z';
        })
        .join(' ');

    const fill =
        selectedDatapoint.value?.color || cfgTerritory.value.emptyColor;
    const stroke = cfgTerritory.value.stroke;

    return `
        <svg width="${svgSize}" height="${svgSize}" viewBox="0 0 ${svgSize} ${svgSize}" style="display:block;margin:auto;">
        <rect x="0" y="0" width="${svgSize}" height="${svgSize}" rx="12" fill="transparent" opacity="0.93"/>
        <path d="${pathD}" fill="${fill}" stroke="${stroke}" stroke-width="1"/>
        </svg>
    `;
});

function onTrapLeave({ datapoint, seriesIndex }) {
    if (hoveredCode.value === datapoint.code) {
        isTooltip.value = false;
        hoveredCode.value = null;
    }
    if (FINAL_CONFIG.value.events.datapointLeave) {
        FINAL_CONFIG.value.events.datapointLeave({ datapoint, seriesIndex });
    }
}

function onTrapClick({ datapoint, seriesIndex }, pointer = false) {
    if (pointer) keyboardTooltip.value = false;
    if (suppressClick.value || loading.value || isAnnotator.value) return;
    if (FINAL_CONFIG.value.selection.enabled) {
        const exists = selectedCodes.value.includes(datapoint.code);
        const next = FINAL_CONFIG.value.selection.multiple
            ? exists
                ? selectedCodes.value.filter((c) => c !== datapoint.code)
                : [...selectedCodes.value, datapoint.code]
            : exists
              ? []
              : [datapoint.code];
        localSelected.value = next;
        emit('update:selectedCountries', next);
    }
    useTooltip({ datapoint, seriesIndex }, false);
    emit('selectDatapoint', datapoint);
    if (FINAL_CONFIG.value.events.datapointClick) {
        FINAL_CONFIG.value.events.datapointClick({ datapoint, seriesIndex });
    }
}

function useTooltip({ datapoint, seriesIndex }, notify = true) {
    if (loading.value || isAnnotator.value || dragging.value) return;
    if (notify && FINAL_CONFIG.value.events.datapointEnter) {
        FINAL_CONFIG.value.events.datapointEnter({ datapoint, seriesIndex });
    }

    hoveredPointKey.value = null;
    hoveredCode.value = datapoint.code;
    dataTooltipSlot.value = {
        datapoint,
        config: FINAL_CONFIG.value,
        series: countries.value,
    };
    isTooltip.value = true;
}
watch(
    () => [
        tooltipDatapoint.value,
        activePoint.value,
        cfgTooltip.value,
        cfgChart.value.dataLabels,
    ],
    () => {
        const datapoint = tooltipDatapoint.value;
        if (!datapoint) {
            isTooltip.value = false;
            tooltipContent.value = '';
            dataTooltipSlot.value = null;
            return;
        }
        dataTooltipSlot.value = {
            kind: activePoint.value ? 'point' : 'country',
            datapoint,
            config: FINAL_CONFIG.value,
            series: activePoint.value ? props.points : countries.value,
        };
        if (keyboardTooltip.value)
            nextTick(() => anchorTooltip(tooltipElement()));
        useCustomFormat.value = false;
        if (isFunction(cfgTooltip.value.customFormat)) {
            try {
                const result = cfgTooltip.value.customFormat(
                    dataTooltipSlot.value,
                );
                if (typeof result === 'string') {
                    tooltipContent.value = result;
                    useCustomFormat.value = true;
                    return;
                }
            } catch {
                console.warn('Custom format cannot be applied.');
            }
        }
        const name = activePoint.value
            ? (datapoint.name ?? datapoint.id ?? activePoint.value.index)
            : datapoint.name;
        const value =
            activePoint.value && datapoint.value == null
                ? ''
                : `: <b>${escapeHtml(formatValue(datapoint.value, activePoint.value ? valueStatus(datapoint.value) : datapoint.valueStatus))}</b>`;
        tooltipContent.value = `<div>${!activePoint.value && cfgTooltip.value.showMinimap ? `<div class="vue-ui-world-minimap">${tooltipPreviewSvg.value}</div>` : ''}<div>${escapeHtml(name)}${value}</div></div>`;
    },
    { deep: true },
);
function escapeHtml(value) {
    return String(value).replace(
        /[&<>"']/g,
        (char) =>
            ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;',
            })[char],
    );
}

const table = computed(() => {
    const src = countries.value.toSorted(
        (a, b) => (b.value || 0) - (a.value || 0),
    );
    const head = src.map((c) => {
        return {
            name: c.name,
            color: c.color,
            category: c.category || '-',
        };
    });
    const body = src.map((c) =>
        c.valueStatus === 'valid'
            ? c.value
            : formatValue(c.value, c.valueStatus),
    );
    return { head, body };
});

const dataTable = computed(() => {
    const head = [
        FINAL_CONFIG.value.table.columnNames.series,
        FINAL_CONFIG.value.table.columnNames.value,
        FINAL_CONFIG.value.table.columnNames.category,
    ];

    const body = table.value.head.map((h, i) => {
        return [
            {
                color: h.color,
                name: h.name,
            },
            table.value.body[i],
            {
                category: h.category,
            },
        ];
    });

    const config = {
        th: {
            backgroundColor: FINAL_CONFIG.value.table.th.backgroundColor,
            color: FINAL_CONFIG.value.table.th.color,
            outline: FINAL_CONFIG.value.table.th.outline,
        },
        td: {
            backgroundColor: FINAL_CONFIG.value.table.td.backgroundColor,
            color: FINAL_CONFIG.value.table.td.color,
            outline: FINAL_CONFIG.value.table.td.outline,
        },
        breakpoint: FINAL_CONFIG.value.table.responsiveBreakpoint,
    };

    const colNames = [
        FINAL_CONFIG.value.table.columnNames.series,
        FINAL_CONFIG.value.table.columnNames.value,
    ];

    return {
        colNames,
        head,
        body,
        config,
    };
});

function generateCsv(callback = null) {
    nextTick(() => {
        const labels = table.value.head.map((h, i) => {
            return [[h.name], [table.value.body[i]], [h.category]];
        });
        const tableXls = [
            [cfgChart.value.title.text],
            [cfgChart.value.title.subtitle.text],
            [
                [
                    FINAL_CONFIG.value.table.columnNames.series,
                    FINAL_CONFIG.value.table.columnNames.value,
                    FINAL_CONFIG.value.table.columnNames.category,
                ],
            ],
        ].concat(labels);

        const csvContent = createCsvContent(tableXls);

        if (!callback) {
            downloadCsv({
                csvContent,
                title: cfgChart.value.title.text || 'vue-ui-world',
            });
        } else {
            callback(csvContent);
        }
    });
}

const segregated = ref([]);

function toggleLegend() {
    if (segregated.value.length) {
        segregated.value = [];
    } else {
        legendSet.value.forEach((l) => {
            segregated.value.push(l.name);
        });
    }
}

function segregate(name) {
    if (segregated.value.includes(name)) {
        segregated.value = segregated.value.filter((el) => el !== name);
    } else {
        segregated.value.push(name);
    }

    emit('selectLegend', { name });
}

const legendSet = computed(() => {
    if (hasCategories) {
        return categories.value
            .map(({ name, color }, i) => {
                return { name, color, shape: 'circle', patternIndex: i };
            })
            .map((c) => {
                return {
                    ...c,
                    opacity: segregated.value.includes(c.name) ? 0.5 : 1,
                    segregate: () => segregate(c.name),
                    isSegregated: segregated.value.includes(c.name),
                };
            });
    }
    // Maybe another type of legend can be added in the future when there is no category provided in the dataset.
    return [];
});

const legendConfig = computed(() => {
    return {
        cy: 'donut-div-legend',
        backgroundColor: cfgLegend.value.backgroundColor,
        color: cfgLegend.value.color,
        fontSize: cfgLegend.value.fontSize,
        paddingBottom: 12,
        fontWeight: cfgLegend.value.bold ? 'bold' : '',
    };
});

/**
 * Return the current countries.
 * The result is the internal reactive value, not a defensive copy.
 *
 * @returns The current component data; treat it as read-only.
 */
function getData() {
    return countries.value;
}

const getImage = createChartImageGetter(
    worldChart,
    () => cfgChart.value.title.text,
);

const tableComponent = computed(() =>
    getTableComponent({
        config: FINAL_CONFIG,
        style: cfgChart,
        mutableConfig,
        dialog: BaseDraggableDialog,
        accordion: Accordion,
        isFullscreen,
        parent: worldChart,
        maxWidth: 800,
        isCursorPointer,
    }),
);

watch(
    () => mutableConfig.value.showTable,
    (v) => syncTableVisibility(v, FINAL_CONFIG, tableUnit),
);

function closeTable() {
    mutableConfig.value.showTable = false;
    if (userOptionsRef.value) {
        userOptionsRef.value.setTableIconState(false);
    }
}

const svgBg = computed(() => cfgChart.value.backgroundColor);
const svgTitle = computed(() => cfgChart.value.title);

const { isCallbackImaging, isCallbackSvg, generateSvg, onGenerateImage } =
    useChartExport({
        svg: svgRef,
        title: svgTitle,
        legend: cfgLegend,
        legendItems: legendSet,
        backgroundColor: svgBg,
        getSvgCallback: () => FINAL_CONFIG.value.userOptions.callbacks.svg,
        generateImage,
    });

async function copyAlt() {
    emit('copyAlt', {
        config: FINAL_CONFIG.value,
        dataset: countries.value,
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
            dataset: countries.value,
        }),
    );
}

defineExpose({
    getData,
    getImage,
    generatePdf,
    generateCsv,
    generateImage,
    generateSvg,
    toggleTable,
    toggleTooltip,
    toggleZoom,
    toggleAnnotator,
    toggleFullscreen,
    copyAlt,
    focusCountry,
    fitCountries,
    resetView,
    resetZoom,
    zoomIn,
    zoomOut,
    clearSelection,
});
</script>

<template>
    <div
        ref="worldChart"
        :id="`world_${uid}`"
        :class="`vue-data-ui-component vue-ui-world ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''}`"
        :style="`font-family:${FINAL_CONFIG.style.fontFamily};width:100%; text-align:center;background:${cfgChart.backgroundColor}`"
        @mouseenter="() => setUserOptionsVisibility(true)"
        @mouseleave="() => setUserOptionsVisibility(false)"
    >
        <PenAndPaper
            v-bind="getAnnotatorProps(cfgUserOptions.annotator)"
            v-if="cfgUserOptions.buttons.annotator && svgRef"
            :color="cfgChart.color"
            :backgroundColor="cfgChart.backgroundColor"
            :active="isAnnotator"
            :svgRef="svgRef"
            :isCursorPointer="isCursorPointer"
            :palette="cfgUserOptions.annotatorPalette"
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

        <slot name="userConfig"></slot>

        <div
            ref="noTitle"
            v-if="hasOptionsNoTitle"
            class="vue-data-ui-no-title-space"
            :style="`height:36px; width: 100%;background:transparent`"
        />

        <div
            ref="chartTitle"
            v-if="cfgChart.title.text"
            :style="`width:100%;background:transparent`"
        >
            <Title
                :key="`title_${titleStep}`"
                :config="{
                    title: {
                        cy: 'donut-div-title',
                        ...cfgChart.title,
                    },
                    subtitle: {
                        cy: 'donut-div-subtitle',
                        ...cfgChart.title.subtitle,
                    },
                }"
            />
        </div>

        <div :id="`legend-top-${uid}`" />

        <UserOptions
            ref="userOptionsRef"
            :key="`user_option_${step}`"
            v-if="
                cfgUserOptions.show &&
                isDataset &&
                (keepUserOptionState ? true : userOptionsVisible)
            "
            :backgroundColor="cfgChart.backgroundColor"
            :color="cfgChart.color"
            :isPrinting="isPrinting"
            :isImaging="isImaging"
            :uid="uid"
            :hasTooltip="cfgTooltip.show && cfgUserOptions.buttons.tooltip"
            :hasLabel="false"
            :isFullscreen="isFullscreen"
            :chartElement="worldChart"
            v-bind="
                getUserOptionsProps(
                    cfgUserOptions,
                    'pdf csv img svg table fullscreen altCopy annotator zoom',
                )
            "
            :isTooltip="mutableConfig.showTooltip"
            :isZoom="mutableConfig.showZoom"
            :isAnnotation="isAnnotator"
            :tableDialog="FINAL_CONFIG.table.useDialog"
            :isCursorPointer="isCursorPointer"
            @toggleFullscreen="toggleFullscreen"
            @generatePdf="generatePdf"
            @generateCsv="generateCsv"
            @generateImage="onGenerateImage"
            @generateSvg="generateSvg"
            @toggleTable="toggleTable"
            @toggleTooltip="toggleTooltip"
            @toggleZoom="toggleZoom"
            @toggleAnnotator="toggleAnnotator"
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
                    'menuIcon optionTooltip optionPdf optionCsv optionImg optionSvg optionTable optionFullscreen optionAnnotator optionZoom optionAltCopy custom-menu-before custom-menu-after',
                )"
                #[slotName]="slotProps"
            >
                <slot
                    :name="slotName"
                    v-bind="getUserOptionSlotProps(slotName, slotProps)"
                />
            </template>
        </UserOptions>

        <div class="vue-ui-world-map">
            <svg
                ref="svgRef"
                :viewBox="viewBox.str"
                :xmlns="XMLNS"
                :class="{
                    'vue-data-ui-fullscreen--on': isFullscreen,
                    'vue-data-ui-fullscreen--off': !isFullscreen,
                }"
                data-cy="world-svg"
                :style="{
                    maxWidth: '100%',
                    overflow:
                        projection === 'globe' && !isViewportZoomed
                            ? 'visible'
                            : 'hidden',
                    touchAction: isAnnotator
                        ? 'none'
                        : mutableConfig.showZoom
                          ? 'none'
                          : projection === 'globe'
                            ? 'pan-y'
                            : 'auto',
                    cursor: dragging ? 'grabbing' : undefined,
                    background: 'transparent',
                    color: cfgChart.color,
                    paddingTop: cfgChart.padding.top + 'px',
                    paddingRight: cfgChart.padding.right + 'px',
                    paddingBottom: cfgChart.padding.bottom + 'px',
                    paddingLeft: cfgChart.padding.left + 'px',
                }"
                tabindex="0"
                role="group"
                :aria-label="cfgChart.title.text || 'World map'"
                @pointerdown="
                    pointerInteraction = true;
                    keyboardTooltip = false;
                    onPointerDown($event);
                "
                @pointermove="onPointerMove"
                @pointerup="
                    pointerInteraction = false;
                    onPointerUp($event);
                "
                @pointercancel="
                    pointerInteraction = false;
                    onPointerUp($event);
                "
                @lostpointercapture="
                    pointerInteraction = false;
                    onPointerUp($event);
                "
                @wheel="onWheel"
                @keydown="onMapKey"
                @keydown.esc="clearSelection"
            >
                <PackageVersion />
                <slot
                    name="svg-underlayer"
                    :svg="{
                        height: sizes.height,
                        width: sizes.width,
                        isPrintingImg:
                            isPrinting || isImaging || isCallbackImaging,
                        isPrintingSvg: isCallbackSvg,
                    }"
                />

                <!-- BACKGROUND SLOT -->
                <foreignObject
                    v-if="$slots['chart-background']"
                    :x="viewBox.minX"
                    :y="viewBox.minY"
                    :width="viewBox.width"
                    :height="viewBox.height"
                    :style="{
                        pointerEvents: 'none',
                    }"
                >
                    <slot name="chart-background" />
                </foreignObject>

                <g v-if="isDataset">
                    <template v-if="projection === 'globe'">
                        <defs>
                            <DefGrad
                                t="radial"
                                :id="`water-${uid}`"
                                :cx="0.48"
                                :cy="0.52"
                                r="0.55"
                                fx="0.40"
                                fy="0.48"
                                :stops="[
                                    [
                                        '0%',
                                        lightenHexColor(
                                            cfgGlobe.waterColor,
                                            0.4,
                                        ),
                                        1,
                                    ],
                                    ['45%', cfgGlobe.waterColor, 1],
                                    [
                                        '80%',
                                        darkenHexColor(
                                            cfgGlobe.waterColor,
                                            0.2,
                                        ),
                                        1,
                                    ],
                                    [
                                        '100%',
                                        darkenHexColor(
                                            cfgGlobe.waterColor,
                                            0.5,
                                        ),
                                        0.95,
                                    ],
                                ]"
                            />
                            <DefGrad
                                t="radial"
                                :id="`atmo-realistic-${uid}`"
                                :cx="0.5"
                                :cy="0.5"
                                r="0.54"
                                :stops="[
                                    ['87%', 'rgba(120,200,255,0)', 1],
                                    ['98%', cfgGlobe.waterColor, 1],
                                    ['100%', 'rgba(120,200,255,0)', 1],
                                ]"
                            />
                            <filter
                                :id="`blur-${uid}`"
                                x="-30%"
                                y="-30%"
                                width="160%"
                                height="160%"
                            >
                                <feGaussianBlur stdDeviation="8" />
                            </filter>
                        </defs>
                        <g v-if="$slots.pattern">
                            <defs v-for="(country, i) in countries">
                                <slot
                                    name="pattern"
                                    v-bind="{
                                        ...country,
                                        patternId: `pattern_${uid}_${country.code}`,
                                    }"
                                />
                            </defs>
                        </g>
                        <circle
                            :cx="baseViewBox.width / 2 + 20"
                            :cy="baseViewBox.height / 2 + 20"
                            :r="baseViewBox.height / 2"
                            :fill="`url(#water-${uid})`"
                        />
                        <circle
                            :cx="baseViewBox.width / 2 + 20"
                            :cy="baseViewBox.height / 2 + 20"
                            :r="baseViewBox.height / 2 + 10"
                            :fill="`url(#atmo-realistic-${uid})`"
                            pointer-events="none"
                            :filter="`url(#blur-${uid})`"
                        />
                    </template>
                    <template
                        v-for="(country, i) in countries"
                        :key="country.code"
                    >
                        <path
                            :d="country.path"
                            :data-country="country.code"
                            role="button"
                            :tabindex="
                                country.path &&
                                tabCountryCode === country.code &&
                                !loading
                                    ? 0
                                    : -1
                            "
                            :aria-hidden="
                                !visibleCountryCodes.has(country.code) ||
                                undefined
                            "
                            :aria-label="`${country.name}: ${formatValue(country.value, country.valueStatus)}`"
                            :aria-pressed="
                                FINAL_CONFIG.selection.enabled
                                    ? isSelected(country)
                                    : undefined
                            "
                            @focus="onCountryFocus(country, i, $event)"
                            @blur="
                                onTrapLeave({
                                    datapoint: country,
                                    seriesIndex: i,
                                })
                            "
                            @keydown="onCountryKey($event, country, i)"
                            :fill="
                                country.category &&
                                segregated.includes(country.category)
                                    ? cfgTerritory.emptyColor
                                    : selectedDatapoint?.code === country.code
                                      ? lightenHexColor(country.color, 0.15)
                                      : country.color
                            "
                            :stroke="cfgTerritory.stroke"
                            :stroke-width="cfgTerritory.strokeWidth"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            @mouseenter="
                                keyboardTooltip = false;
                                useTooltip({
                                    datapoint: country,
                                    seriesIndex: i,
                                });
                            "
                            @mousemove="keyboardTooltip = false"
                            @mouseleave="
                                onTrapLeave({
                                    datapoint: country,
                                    seriesIndex: i,
                                })
                            "
                            @click="
                                onTrapClick(
                                    { datapoint: country, seriesIndex: i },
                                    true,
                                )
                            "
                            class="vue-ui-world-territory"
                            :style="{
                                cursor: isCursorPointer ? 'pointer' : 'default',
                            }"
                        >
                            <title
                                v-if="!isTooltip || !mutableConfig.showTooltip"
                            >
                                {{ country.name }}:
                                {{
                                    formatValue(
                                        country.value,
                                        country.valueStatus,
                                    )
                                }}
                            </title>
                        </path>
                        <path
                            v-if="$slots.pattern"
                            :d="country.path"
                            :fill="`url(#pattern_${uid}_${country.code})`"
                            stroke="none"
                            style="pointer-events: none"
                            class="vue-ui-world-territory"
                        />
                    </template>
                    <g
                        class="vue-ui-world-selection"
                        pointer-events="none"
                        aria-hidden="true"
                    >
                        <path
                            v-for="country in selectedCountryPaths"
                            :key="country.uid"
                            :data-selected-country="country.code"
                            :d="country.path"
                            fill="none"
                            :stroke="FINAL_CONFIG.selection.color"
                            :stroke-width="cfgTerritory.strokeWidthSelected"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            vector-effect="non-scaling-stroke"
                        />
                    </g>
                </g>

                <g
                    v-if="cfgChart.points.show && !loading"
                    class="vue-ui-world-points"
                >
                    <circle
                        v-for="point in projectedPoints"
                        :key="point.id ?? point.index"
                        :data-world-point="point.index"
                        :cx="point.x"
                        :cy="point.y"
                        :r="point.radius / camera.zoom"
                        :fill="point.color || cfgChart.points.color"
                        :stroke="cfgChart.points.stroke"
                        :stroke-width="
                            cfgChart.points.strokeWidth / camera.zoom
                        "
                        :opacity="cfgChart.points.opacity"
                        tabindex="0"
                        role="button"
                        :aria-label="
                            point.name || String(point.id ?? point.index)
                        "
                        @mouseenter="usePointTooltip(point, $event)"
                        @mousemove="keyboardTooltip = false"
                        @mouseleave="leavePointTooltip(point)"
                        @focus="usePointTooltip(point, $event, true)"
                        @blur="leavePointTooltip(point)"
                        @click.stop="
                            keyboardTooltip = false;
                            selectPoint(point);
                        "
                        @keydown.enter.prevent.stop="selectPoint(point)"
                        @keydown.space.prevent.stop="selectPoint(point)"
                    >
                        <title v-if="!isTooltip || !mutableConfig.showTooltip">
                            {{ point.name
                            }}{{
                                Number.isFinite(point.value)
                                    ? `: ${formatValue(point.value)}`
                                    : ''
                            }}
                        </title>
                    </circle>
                </g>
                <slot
                    name="svg"
                    :svg="{
                        height: sizes.height,
                        width: sizes.width,
                        isPrintingImg:
                            isPrinting || isImaging || isCallbackImaging,
                        isPrintingSvg: isCallbackSvg,
                    }"
                />
            </svg>
            <div
                v-if="isZoom && !loading"
                data-dom-to-png-ignore
                class="reset-wrapper"
            >
                <slot name="reset-action" :reset="resetZoom">
                    <button
                        data-cy-reset
                        type="button"
                        tabindex="0"
                        class="vue-data-ui-refresh-button"
                        aria-label="Reset zoom"
                        :style="{
                            background: cfgChart.backgroundColor,
                            cursor: isCursorPointer ? 'pointer' : 'default',
                        }"
                        @click="resetZoom(true)"
                    >
                        <BaseIcon name="refresh" :stroke="cfgChart.color" />
                    </button>
                </slot>
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

        <div :id="`legend-bottom-${uid}`" />

        <!-- LEGEND -->
        <Teleport
            v-if="
                readyTeleport &&
                hasCategories &&
                (cfgLegend.show || $slots.legend)
            "
            :to="
                cfgLegend.position === 'top'
                    ? `#legend-top-${uid}`
                    : `#legend-bottom-${uid}`
            "
        >
            <div ref="chartLegend" v-if="hasCategories">
                <slot name="legend" v-bind:legend="legendSet">
                    <Legend
                        v-if="cfgLegend.show"
                        :key="`legend_${legendStep}`"
                        :legendSet="legendSet"
                        :config="legendConfig"
                        :isCursorPointer="isCursorPointer"
                        @clickMarker="(el) => segregate(el)"
                    >
                        <template
                            #legend-pattern="{ legend, index }"
                            v-if="$slots.pattern"
                        >
                            <Shape
                                :shape="legend.shape"
                                :radius="30"
                                stroke="none"
                                :plot="{ x: 30, y: 30 }"
                                :fill="`url(#pattern_${uid}_${index})`"
                            />
                        </template>

                        <template #item="{ legend, index }">
                            <div
                                data-cy="legend-item"
                                :style="`opacity:${segregated.includes(legend.name) ? 0.5 : 1}`"
                                @click="legend.segregate()"
                            >
                                {{ legend.name }}
                            </div>
                        </template>

                        <template #legendToggle>
                            <BaseLegendToggle
                                v-if="
                                    legendSet.length > 2 &&
                                    cfgLegend.selectAllToggle.show &&
                                    !loading
                                "
                                :backgroundColor="
                                    cfgLegend.selectAllToggle.backgroundColor
                                "
                                :color="cfgLegend.selectAllToggle.color"
                                :fontSize="cfgLegend.fontSize"
                                :checked="segregated.length > 0"
                                :isCursorPointer="isCursorPointer"
                                @toggle="toggleLegend"
                            />
                        </template>
                    </Legend>
                </slot>
            </div>
        </Teleport>

        <Teleport
            v-if="readyTeleport && cfgChart.colorScale.legend.show && !loading"
            :to="
                cfgChart.colorScale.legend.position === 'top'
                    ? `#legend-top-${uid}`
                    : `#legend-bottom-${uid}`
            "
        >
            <div
                class="vue-ui-world-scale"
                :style="{
                    color: cfgChart.color,
                    fontSize: cfgChart.colorScale.legend.fontSize + 'px',
                }"
            >
                <div v-if="cfgChart.colorScale.legend.title">
                    {{ cfgChart.colorScale.legend.title }}
                </div>
                <template v-if="colorScale.discrete">
                    <div class="vue-ui-world-bands">
                        <span v-for="(band, i) in colorScale.bands" :key="i">
                            <i :style="{ background: band.color }" />
                            {{ band.min === null ? '< ' : '≥ '
                            }}{{
                                formatScale(
                                    band.min ??
                                        band.max ??
                                        colorScale.domain[0],
                                )
                            }}{{
                                band.min !== null && band.max !== null
                                    ? `, < ${formatScale(band.max)}`
                                    : ''
                            }}
                        </span>
                    </div>
                </template>
                <template v-else>
                    <div
                        class="vue-ui-world-gradient"
                        :style="scaleLegendStyle"
                    />
                    <div class="vue-ui-world-scale-labels">
                        <span>{{ formatScale(colorScale.domain[0]) }}</span>
                        <span
                            v-if="
                                colorScale.type === 'diverging' &&
                                colorScale.middle > colorScale.domain[0] &&
                                colorScale.middle < colorScale.domain[1]
                            "
                            class="vue-ui-world-scale-middle"
                            :style="{
                                left: `${(100 * (colorScale.middle - colorScale.domain[0])) / (colorScale.domain[1] - colorScale.domain[0])}%`,
                            }"
                            >{{ formatScale(colorScale.middle) }}</span
                        >
                        <span>{{ formatScale(colorScale.domain[1]) }}</span>
                    </div>
                </template>
            </div>
        </Teleport>

        <div v-if="$slots.source" ref="source" dir="auto">
            <slot name="source" />
        </div>

        <Tooltip
            :isA11yMode="keyboardTooltip"
            :a11yPosition="tooltipAnchor"
            :teleportTo="cfgTooltip.teleportTo"
            :show="
                mutableConfig.showTooltip &&
                isTooltip &&
                (!!activePoint || !!selectedDatapoint?.path)
            "
            :backgroundColor="cfgTooltip.backgroundColor"
            :color="cfgTooltip.color"
            :fontSize="cfgTooltip.fontSize"
            :borderRadius="cfgTooltip.borderRadius"
            :borderColor="cfgTooltip.borderColor"
            :borderWidth="cfgTooltip.borderWidth"
            :backgroundOpacity="cfgTooltip.backgroundOpacity"
            :position="cfgTooltip.position"
            :offsetX="cfgTooltip.offsetX"
            :offsetY="cfgTooltip.offsetY"
            :parent="worldChart"
            :content="tooltipContent"
            :isCustom="useCustomFormat"
            :isFullscreen="isFullscreen"
            :smooth="cfgTooltip.smooth"
            :backdropFilter="cfgTooltip.backdropFilter"
            :smoothForce="cfgTooltip.smoothForce"
            :smoothSnapThreshold="cfgTooltip.smoothSnapThreshold"
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

        <component
            v-if="isDataset && cfgUserOptions.buttons.table"
            :is="tableComponent.component"
            v-bind="tableComponent.props"
            ref="tableUnit"
            @close="closeTable"
        >
            <template #title v-if="FINAL_CONFIG.table.useDialog">
                {{ tableComponent.title }}
            </template>
            <template #actions v-if="FINAL_CONFIG.table.useDialog">
                <button
                    tabindex="0"
                    class="vue-ui-user-options-button"
                    @click="generateCsv(cfgUserOptions.callbacks.csv)"
                    :style="{ cursor: isCursorPointer ? 'pointer' : 'default' }"
                >
                    <BaseIcon
                        name="fileCsv"
                        :stroke="tableComponent.props.color"
                    />
                </button>
            </template>
            <template #content>
                <DataTable
                    :key="`table_${tableStep}`"
                    :colNames="dataTable.colNames"
                    :head="dataTable.head"
                    :body="dataTable.body"
                    :config="dataTable.config"
                    :title="
                        FINAL_CONFIG.table.useDialog ? '' : tableComponent.title
                    "
                    :withCloseButton="!FINAL_CONFIG.table.useDialog"
                    :isCursorPointer="isCursorPointer"
                    @close="closeTable"
                >
                    <template #th="{ th }">
                        <div style="display: flex; align-items: center">
                            {{ th }}
                        </div>
                    </template>
                    <template #td="{ td }">
                        {{
                            td?.name
                                ? td?.name
                                : td?.category
                                  ? td?.category
                                  : typeof td === 'string'
                                    ? td
                                    : applyDataLabel(
                                          cfgChart.dataLabels.formatter,
                                          td,
                                          dataLabel({
                                              p: cfgChart.dataLabels.prefix,
                                              v: td,
                                              s: cfgChart.dataLabels.suffix,
                                              r: cfgChart.dataLabels.rounding,
                                          }),
                                      )
                        }}
                    </template>
                </DataTable>
            </template>
        </component>

        <!-- v3 Skeleton loader -->
        <slot name="skeleton">
            <BaseScanner v-if="loading" />
        </slot>
    </div>
</template>

<style scoped>
@import '../vue-data-ui.css';

.vue-ui-world * {
    transition: unset;
}

.vue-ui-world {
    user-select: none;
    position: relative;
}

path.vue-ui-world-territory {
    vector-effect: non-scaling-stroke;
    transition: stroke-width 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.vue-ui-world-territory:focus {
    outline: none;
}
.vue-ui-world-points circle:focus-visible {
    outline: none;
    stroke: currentColor;
    stroke-width: 3px;
    vector-effect: non-scaling-stroke;
}
.vue-ui-world-scale {
    max-width: 420px;
    margin: 8px auto;
    padding: 0 12px;
}
.vue-ui-world-scale-labels {
    position: relative;
    display: flex;
    justify-content: space-between;
}
.vue-ui-world-scale-middle {
    position: absolute;
    transform: translateX(-50%);
}
.vue-ui-world-bands {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: center;
    margin-top: 6px;
}
.vue-ui-world-bands span {
    display: inline-flex;
    align-items: center;
    gap: 4px;
}
.vue-ui-world-bands i {
    display: inline-block;
    width: 12px;
    height: 12px;
    border: 1px solid currentColor;
}
.vue-ui-world-map {
    position: relative;
    width: 100%;
    min-width: 0;
}
.vue-ui-world-map > svg {
    display: block;
    box-sizing: border-box;
}
.reset-wrapper {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    padding: 0 24px;
    height: 40px;
    position: absolute;
    bottom: 12px;
    right: 0;
}
.vue-data-ui-refresh-button {
    outline: none;
    border: none;
    background: transparent;
    height: 36px;
    width: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: transform 0.2s ease-in-out;
    transform-origin: center;
    &:focus {
        outline: 1px solid v-bind('cfgChart.color');
    }
    &:hover {
        transform: rotate(-90deg);
    }
}
</style>
