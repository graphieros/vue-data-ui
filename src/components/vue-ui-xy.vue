<script setup>
import {
    computed,
    defineAsyncComponent,
    getCurrentInstance,
    nextTick,
    onBeforeUnmount,
    onMounted,
    ref,
    shallowRef,
    toRefs,
    useSlots,
    watch,
    watchEffect,
} from 'vue';
import {
    abbreviate,
    adaptColorToBackground,
    applyDataLabel,
    assignStackRatios,
    buildDisplayedTimeLabels,
    buildInterLineAreas,
    calcLinearProgression,
    calculateNiceScale,
    calculateNiceScaleWithExactExtremes,
    checkNaN,
    convertColorToHex,
    convertCustomPalette,
    createCsvContent,
    createIndividualArea,
    createIndividualAreaWithCuts,
    createPolygonPath,
    createStepperPath,
    createSmoothAreaSegments,
    createSmoothPath,
    createSmoothPathWithCuts,
    createSmoothPathWithCutsSegments,
    createStar,
    createStraightPath,
    createStraightPathWithCuts,
    createStraightPathWithCutsSegments,
    createTSpans,
    createTSpansFromLineBreaksOnX,
    createUid,
    dataLabel,
    downloadCsv,
    error,
    forceValidValue,
    functionReturnsString,
    hasDeepProperty,
    isFunction,
    isSafeValue,
    largestTriangleThreeBucketsArray,
    objectIsEmpty,
    palette,
    placeXYTag,
    setGradientOffset,
    setOpacity,
    shiftHue,
    svgToClientCoords,
    themePalettes,
    translateSize,
    treeShake,
    isValidNumber,
    getImageDimensions,
} from '../lib';
import {
    canShowValue,
    fillArray,
    groupBy,
    isCoordinatePoint,
    isObjectivelyDifferentIndex,
    memoizeByArrayRef,
    normalizeRange,
    safeDiv,
    safeInt,
} from '../utils/xy.js';
import { useLocale } from '../useLocale.js';
import { useConfig } from '../useConfig';
import { usePrinter } from '../usePrinter.js';
import { useLoading } from '../useLoading.js';
import { useDateTime } from '../useDateTime.js';
import { useSvgExport } from '../useSvgExport.js';
import { useNestedProp } from '../useNestedProp';
import { useThemeCheck } from '../useThemeCheck.js';
import { useTimeLabels } from '../useTimeLabels.js';
import { useMountedDelay } from '../useMountedDelay.js';
import { useStableElementSize } from '../useStableElementSize.js';
import { useTimeLabelCollision } from '../useTimeLabelCollider.js';
import img from '../img.js';
import Title from '../atoms/Title.vue';
import themes from '../themes/vue_ui_xy.json';
import Shape from '../atoms/Shape.vue';
import BaseScanner from '../atoms/BaseScanner.vue';
import SlicerPreview from '../atoms/SlicerPreview.vue'; // v3
import Accordion from './vue-ui-accordion.vue'; // Must be ready in responsive mode
import BaseLegendToggle from '../atoms/BaseLegendToggle.vue';
import A11yDataTable from '../atoms/A11yDataTable.vue';
import DefGrad from '../atoms/DefGrad.vue';

const props = defineProps({
    config: {
        type: Object,
        default() {
            return {};
        },
    },
    dataset: {
        type: Array,
        default() {
            return [];
        },
    },
    selectedXIndex: {
        type: Number,
        default: undefined,
    },
});

const DataTable = defineAsyncComponent(() => import('../atoms/DataTable.vue'));
const Tooltip = defineAsyncComponent(() => import('../atoms/Tooltip.vue'));
const UserOptions = defineAsyncComponent(
    () => import('../atoms/UserOptions.vue'),
);
const BaseIcon = defineAsyncComponent(() => import('../atoms/BaseIcon.vue'));
const TableSparkline = defineAsyncComponent(
    () => import('./vue-ui-table-sparkline.vue'),
);
const PackageVersion = defineAsyncComponent(
    () => import('../atoms/PackageVersion.vue'),
);
const PenAndPaper = defineAsyncComponent(
    () => import('../atoms/PenAndPaper.vue'),
);
const BaseDraggableDialog = defineAsyncComponent(
    () => import('../atoms/BaseDraggableDialog.vue'),
);

const emit = defineEmits([
    'selectTimeLabel',
    'selectX',
    'selectLegend',
    'zoomStart',
    'zoomEnd',
    'zoomReset',
    'copyAlt',
]);
const SLOTS = useSlots();
const instance = getCurrentInstance();

const { vue_ui_xy: DEFAULT_CONFIG } = useConfig();
const { isThemeValid, warnInvalidTheme } = useThemeCheck();
const { isReady } = useMountedDelay(300);

const chart = ref(null);
const chartTitle = ref(null);
const chartSlicer = ref(null);
const chartLegend = ref(null);
const source = ref(null);
const noTitle = ref(null);
const G = ref(null);
const xAxisLabel = ref(null);
const yAxisLabel = ref(null);
const timeLabelsEls = ref(null);
const scaleLabels = ref(null);
const userOptionsRef = ref(null);

const resizeObserver = ref(null);
const observedEl = ref(null);
const slicerStep = ref(0);
const selectedScale = ref(null);
const useSafeValues = ref(true);
const height = ref(600);
const width = ref(1000);
const viewBox = ref('0 0 1000 600');
const clientPosition = ref({ x: 0, y: 0 });
const icons = ref({ line: 'line', bar: 'bar', plot: 'plot' });
const isAnnotator = ref(false);
const isFullscreen = ref(false);
const isTooltip = ref(false);
const selectedRowIndex = ref(null);

const segregatedSeries = ref([]);
const segregatedSeriesSet = computed(() => {
    return new Set(segregatedSeries.value);
});

const uniqueId = ref(createUid());
const step = ref(0);
const tableStep = ref(0);
const titleStep = ref(0);
const showSparklineTable = ref(true);
const segregateStep = ref(0);
const selectedMinimapIndex = ref(null);
const showUserOptionsOnChartHover = ref(false);
const keepUserOptionState = ref(true);
const userOptionsVisible = ref(true);
const svgRef = ref(null);
const tagRefs = ref({});
const textMeasurer = ref(null);
const readyTeleport = ref(false);
const tableUnit = ref(null);
const isCallbackImaging = ref(false);
const isCallbackSvg = ref(false);
const selectedMinimapXValue = ref(null);

const selectedSerieIndex = ref(null);
const activeTooltipIndex = ref(null); // a11y
const tooltipA11yPosition = ref({ x: 0, y: 0 }); // a11y

const visibilityResizeObserver = ref(null);
const timeTagResizeObserver = ref(null);
const observedTimeTagElement = ref(null);
const timeTagResizeAnimationFrame = ref(null);
const stopTimeTagObserverWatch = ref(null);

/**
 * Reference to the chart’s parent element.
 *
 * We intentionally observe the PARENT rather than the chart itself because
 * the chart’s final layout depends on external constraints:
 * - flex/grid resolution
 * - font loading
 * - surrounding DOM (titles, legends, slots, teleports)
 *
 * Observing the parent ensures we only proceed once the container that
 * defines available space has fully settled.
 */
const parentElement = shallowRef(null);

/**
 * Indicates whether the parent layout has been confirmed stable.
 *
 * This is not used for measurements directly, but as a semantic signal
 * to block rendering transitions / animations until layout is safe.
 */
const parentLayoutIsStable = ref(false);

/**
 * Monotonic counter used to force reactive recomputation.
 *
 * Computeds such as `drawingArea` explicitly depend on this value
 * so they only finalize AFTER a stable layout pass has completed.
 *
 * This avoids race conditions where the computed runs too early
 * and caches incorrect geometry.
 */
const parentLayoutStableRunSequence = ref(0);

/**
 * Sequence guard used to cancel outdated async layout passes.
 *
 * Multiple stability passes may be triggered in quick succession
 * (mount, resize, config change). This ensures that only the
 * most recent pass is allowed to commit results.
 */
const pendingParentLayoutSequence = ref(0);

/**
 * Stable-size observer bound to the parent element.
 *
 * This does NOT react to every resize immediately.
 * Instead, it waits until the parent size remains unchanged
 * across several animation frames before declaring it “stable”.
 *
 * Once stability is confirmed, it triggers a controlled layout pass.
 */
const stableParentSize = useStableElementSize({
    elementRef: parentElement,
    minimumWidth: 2,
    minimumHeight: 2,
    stableFramesRequired: 2,
    once: false,
    onSizeAccepted: () => {
        runParentStableLayoutPass();
    },
});

/**
 * Updates the reference to the parent element.
 *
 * This is necessary because the chart may be:
 * - re-parented (fullscreen, teleport)
 * - conditionally mounted
 * - wrapped by dynamic layout containers
 *
 * Re-resolving the parent ensures we always observe the
 * correct layout authority.
 */
function setParentElementReference() {
    parentElement.value = chart.value?.parentNode ?? null;
}

function nextPaintFrame() {
    return new Promise((resolve) => {
        requestAnimationFrame(() => {
            requestAnimationFrame(resolve);
        });
    });
}

/**
 * Executes a stable layout pass.
 * Ensure that any geometry depending on label
 * footprint or container size is computed ONLY after:
 *   - Vue has flushed DOM updates
 *   - The parent size is stable
 *   - The browser has painted at least twice
 */
async function runParentStableLayoutPass() {
    const currentSequence = ++pendingParentLayoutSequence.value;

    parentLayoutIsStable.value = false;

    await nextTick();
    await nextPaintFrame();
    await nextPaintFrame();

    if (currentSequence !== pendingParentLayoutSequence.value) return;

    parentLayoutStableRunSequence.value += 1;
    parentLayoutIsStable.value = true;
}

const parentStableLayoutRefreshIsQueued = ref(false);

function queueParentStableLayoutRefresh() {
    if (parentStableLayoutRefreshIsQueued.value) return;
    parentStableLayoutRefreshIsQueued.value = true;
    nextTick(() => {
        parentStableLayoutRefreshIsQueued.value = false;
        setParentElementReference();
        runParentStableLayoutPass();
    });
}

const svg = computed(() => {
    return {
        height: height.value,
        width: width.value,
    };
});

const mutableInitialized = ref(false);

const lastConfigStacked = ref(null);
const lastConfigUseIndividualScale = ref(null);

const fontSizes = ref({
    xAxis: 18,
    yAxis: 12,
    dataLabels: 20,
    plotLabels: 10,
});

const plotRadii = ref({ plot: 3, line: 3, selectedLine: 3 });

const selectedPlotRadius = computed(() => {
    return Math.max(plotRadii.value.line * 1.5, plotRadii.value.selectedLine);
});

onMounted(() => {
    readyTeleport.value = true;
    if (props.dataset.length) {
        props.dataset.forEach((ds, i) => {
            if ([null, undefined].includes(ds.series)) {
                error({
                    componentName: 'VueUiXy',
                    type: 'datasetSerieAttribute',
                    property: 'series (number[])',
                    index: i,
                    debug: debug.value,
                });
            }
        });
    }
    setParentElementReference();
    stableParentSize.start();
    runParentStableLayoutPass();
});

function prepareConfig() {
    if (!Object.keys(props.config || {}).length) {
        return DEFAULT_CONFIG;
    }

    const mergedConfig = useNestedProp({
        userConfig: props.config,
        defaultConfig: DEFAULT_CONFIG,
    });

    // ------------------------------ OVERRIDES -----------------------------------

    if (props.config && hasDeepProperty(props.config, 'chart.highlightArea')) {
        if (!Array.isArray(props.config.chart.highlightArea)) {
            mergedConfig.chart.highlightArea = [
                props.config.chart.highlightArea,
            ]; // FIXME: should be sanitized using useNestedPropToo
        } else {
            mergedConfig.chart.highlightArea = props.config.chart.highlightArea;
        }
    }

    if (
        props.config &&
        hasDeepProperty(props.config, 'chart.annotations') &&
        Array.isArray(props.config.chart.annotations) &&
        props.config.chart.annotations.length
    ) {
        mergedConfig.chart.annotations = props.config.chart.annotations.map(
            (annotation) => {
                return useNestedProp({
                    defaultConfig: DEFAULT_CONFIG.chart.annotations[0],
                    userConfig: annotation,
                });
            },
        );
    } else {
        mergedConfig.chart.annotations = [];
    }

    if (props.config && hasDeepProperty(props.config, 'chart.grid.position')) {
        if (
            props.config.chart.grid.position === 'start' &&
            props.dataset.length &&
            props.dataset.some((el) => el.type === 'bar')
        ) {
            mergedConfig.chart.grid.position = 'middle';
            if (hasDeepProperty(props.config, 'debug')) {
                console.warn(
                    'Vue Data UI - VueUiXy - config.chart.grid.position was overriden to `middle` because your dataset contains a bar',
                );
            }
        }
    }

    // Merging highlight area(s) incomplete user configs
    if (props.config && hasDeepProperty(props.config, 'chart.highlightArea')) {
        if (Array.isArray(props.config.chart.highlightArea)) {
            mergedConfig.chart.highlightArea =
                props.config.chart.highlightArea.map((hl) =>
                    mergeHighlightArea({
                        defaultConfig: DEFAULT_CONFIG.chart.highlightArea,
                        userConfig: hl,
                    }),
                );
        } else {
            mergedConfig.chart.highlightArea = mergeHighlightArea({
                defaultConfig: DEFAULT_CONFIG.chart.highlightArea,
                userConfig: props.config.chart.highlightArea,
            });
        }
    }
    // ----------------------------------------------------------------------------

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

    return {
        ...finalConfig,
        customPalette: finalConfig.customPalette.length
            ? finalConfig.customPalette
            : themePalettes[theme] || palette,
    };
}

function mergeHighlightArea({ defaultConfig, userConfig }) {
    return useNestedProp({
        defaultConfig,
        userConfig,
    });
}

const isDataset = computed({
    get() {
        return !!props.dataset && props.dataset.length;
    },
    set(bool) {
        return bool;
    },
});

const FINAL_CONFIG = ref(prepareConfig());

const isCursorPointer = computed(
    () => FINAL_CONFIG.value.chart.userOptions.useCursorPointer,
);

const mutableConfig = ref({
    dataLabels: { show: true },
    showTooltip: true,
    showTable: false,
    isStacked: false,
    useIndividualScale: false,
});

function seedMutableFromConfig() {
    const configStacked = FINAL_CONFIG.value.chart.grid.labels.yAxis.stacked;
    const configUseIndividualScale =
        FINAL_CONFIG.value.chart.grid.labels.yAxis.useIndividualScale;

    if (!mutableInitialized.value) {
        mutableConfig.value = {
            dataLabels: { show: true },
            showTooltip: FINAL_CONFIG.value.chart.tooltip.show === true,
            showTable: FINAL_CONFIG.value.showTable === true,
            isStacked: configStacked,
            useIndividualScale: configUseIndividualScale,
        };

        lastConfigStacked.value = configStacked;
        lastConfigUseIndividualScale.value = configUseIndividualScale;
        mutableInitialized.value = true;
        return;
    }

    mutableConfig.value.showTooltip =
        FINAL_CONFIG.value.chart.tooltip.show === true;

    if (configStacked !== lastConfigStacked.value) {
        mutableConfig.value.isStacked = configStacked;
        lastConfigStacked.value = configStacked;
    }

    if (configUseIndividualScale !== lastConfigUseIndividualScale.value) {
        mutableConfig.value.useIndividualScale = configUseIndividualScale;
        lastConfigUseIndividualScale.value = configUseIndividualScale;
    }

    if (mutableConfig.value.isStacked) {
        mutableConfig.value.useIndividualScale = true;
    }
}

const debug = computed(() => !!FINAL_CONFIG.value.debug);

const skeletonConfig = computed(() => {
    return treeShake({
        defaultConfig: {
            useCssAnimation: false,
            showTable: false,
            chart: {
                annotations: [],
                highlightArea: [],
                backgroundColor: '#99999930',
                grid: {
                    stroke: '#6A6A6A',
                    labels: {
                        show: false,
                        axis: {
                            yLabel: '',
                            xLabel: '',
                        },
                        xAxisLabels: { show: false },
                        yAxis: {
                            commonScaleSteps: 10,
                            useNiceScale: true,
                            scaleMin: 0,
                            scaleMax: 134,
                        },
                        zeroLine: { show: true },
                    },
                },
                padding: {
                    top: 12,
                    bottom: 24,
                    left: 24,
                    right: 24,
                },
                userOptions: { show: false },
                zoom: {
                    show: false,
                    startIndex: null,
                    endIndex: null,
                },
            },
            bar: {
                serieName: { show: false },
                labels: { show: false },
                border: {
                    useSerieColor: false,
                    stroke: '#999999',
                },
            },
            line: {
                dot: {
                    useSerieColor: false,
                    fill: '#8A8A8A',
                },
                labels: { show: false },
            },
        },
        userConfig: FINAL_CONFIG.value.skeletonConfig ?? {},
    });
});

const skeletonDataset = computed(() => {
    return (
        props.config?.skeletonDataset ?? [
            {
                name: '',
                series: [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 134],
                type: 'line',
                smooth: true,
                color: '#BABABA',
            },
            {
                name: '',
                series: [0, 0.5, 1, 1.5, 2.5, 4, 6.5, 10.5, 17, 27.5, 44.5, 67],
                type: 'bar',
                color: '#CACACA',
            },
        ]
    );
});

// v3 - Skeleton loader management
const { loading, FINAL_DATASET, manualLoading } = useLoading({
    ...toRefs(props),
    FINAL_CONFIG,
    prepareConfig,
    callback: () => {
        Promise.resolve().then(async () => {
            if (
                !FINAL_CONFIG.value.chart.zoom.keepState ||
                !slicerReady.value ||
                (slicer.value.start === 0 && slicer.value.end === 0)
            ) {
                await setupSlicer();
            }
            mutableConfig.value.showTable = FINAL_CONFIG.value.showTable;
        });
    },
    skeletonDataset: skeletonDataset.value,
    skeletonConfig: treeShake({
        defaultConfig: FINAL_CONFIG.value,
        userConfig: skeletonConfig.value,
    }),
});

const lttbMemo = memoizeByArrayRef((series, threshold) => {
    return largestTriangleThreeBucketsArray({ data: series, threshold });
});

const lttb = (series) =>
    lttbMemo(series, FINAL_CONFIG.value.downsample.threshold);

const downsampledSeriesLengths = computed(() => {
    const threshold = FINAL_CONFIG.value.downsample.threshold;

    return FINAL_DATASET.value.map((datapoint) => {
        return lttbMemo(datapoint.series, threshold).length;
    });
});

const maxDownsampledSeriesLength = computed(() => {
    let _max = -Infinity;
    for (let i = 0; i < downsampledSeriesLengths.value.length; i += 1) {
        const length = downsampledSeriesLengths.value[i];
        if (length > _max) _max = length;
    }
    return _max;
});

const maxDownsampledSeriesLengthWithZero = computed(() => {
    let _max = 0;
    for (let i = 0; i < downsampledSeriesLengths.value.length; i += 1) {
        const length = downsampledSeriesLengths.value[i];
        if (length > _max) _max = length;
    }
    return _max;
});

const maxX = computed(() => maxDownsampledSeriesLength.value);

const slicer = ref({ start: 0, end: maxX.value });
const slicerPrecog = ref({ start: 0, end: maxX.value });

const isPrecog = computed(() => {
    return (
        FINAL_CONFIG.value.chart.zoom.preview.enable &&
        (slicerPrecog.value.start !== slicer.value.start ||
            slicerPrecog.value.end !== slicer.value.end)
    );
});

function setPrecog(side, val) {
    slicerPrecog.value[side] = val;
}

function normalizeSlicerWindow() {
    if (isContinuousScale.value) {
        const min = continuousFullXRange.value.min;
        const max = continuousFullXRange.value.max;

        let start = Number(slicer.value.start);
        let end = Number(slicer.value.end);

        if (!Number.isFinite(start)) start = min;
        if (!Number.isFinite(end)) end = max;

        start = Math.max(min, Math.min(start, max));
        end = Math.max(start, Math.min(end, max));

        if (end <= start) {
            start = min;
            end = max;
        }

        slicer.value = { start, end };
        slicerPrecog.value.start = start;
        slicerPrecog.value.end = end;

        if (chartSlicer.value) {
            chartSlicer.value.setStartValue(start);
            chartSlicer.value.setEndValue(end);
        }

        return;
    }

    const maxLen = Math.max(
        1,
        ...FINAL_DATASET.value.map((dp) => lttb(dp.series).length),
    );

    let s = Math.max(0, Math.min(slicer.value.start ?? 0, maxLen - 1));
    let e = Math.max(s + 1, Math.min(slicer.value.end ?? maxLen, maxLen));

    if (!Number.isFinite(s) || !Number.isFinite(e) || e <= s) {
        s = 0;
        e = maxLen;
    }

    slicer.value = { start: s, end: e };
    slicerPrecog.value.start = s;
    slicerPrecog.value.end = e;

    if (chartSlicer.value) {
        chartSlicer.value.setStartValue(s);
        chartSlicer.value.setEndValue(e);
    }
}

const precogRect = computed(() => {
    const { left, top, width: totalWidth, height } = drawingArea.value;
    const windowStart = slicer.value.start;
    const windowEnd = slicer.value.end;
    const windowLen = windowEnd - windowStart;
    const unit = totalWidth / windowLen;

    const rawStart = slicerPrecog.value.start - windowStart;
    const rawEnd = slicerPrecog.value.end - windowStart;
    const relStart = Math.max(0, Math.min(windowLen, rawStart));
    const relEnd = Math.max(0, Math.min(windowLen, rawEnd));

    return {
        x: left + relStart * unit,
        y: top,
        width: (relEnd - relStart) * unit,
        height,
        fill: FINAL_CONFIG.value.chart.zoom.preview.fill,
        stroke: FINAL_CONFIG.value.chart.zoom.preview.stroke,
        ['stroke-width']: FINAL_CONFIG.value.chart.zoom.preview.strokeWidth,
        ['stroke-dasharray']:
            FINAL_CONFIG.value.chart.zoom.preview.strokeDasharray,
        ['stroke-linecap']: 'round',
        ['stroke-linejoin']: 'round',
        style: {
            pointerEvents: 'none',
            transition: 'none !important',
            animation: 'none !important',
        },
    };
});

watch(
    () => props.selectedXIndex,
    (v) => {
        if ([null, undefined].includes(props.selectedXIndex)) {
            selectedSerieIndex.value = null;
            return;
        }

        const targetIndex = v - slicer.value.start;
        if (targetIndex < 0 || v >= slicer.value.end) {
            selectedSerieIndex.value = null;
        } else {
            selectedSerieIndex.value = targetIndex ?? null;
        }
    },
    { immediate: true },
);

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `vue-ui-xy_${uniqueId.value}`,
    fileName: FINAL_CONFIG.value.chart.title.text || 'vue-ui-xy',
    options: FINAL_CONFIG.value.chart.userOptions.print,
});

const isAutoSize = ref(false);

const customPalette = computed(() => {
    return convertCustomPalette(FINAL_CONFIG.value.customPalette);
});

const parsedScaleMin = computed(() => {
    const raw = FINAL_CONFIG.value.chart.grid.labels.yAxis.scaleMin;
    if (raw === null || raw === undefined) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
});

// Baseline for line areas when NOT using individual scale:
// - default: fill down to 0 (zero.value)
// - if scaleMin is explicitly set: fill down to the bottom of the chart (forced minimum)
const globalAreaBaselineY = computed(() => {
    return parsedScaleMin.value !== null
        ? drawingArea.value.bottom
        : zero.value;
});

const parsedScaleMax = computed(() => {
    const raw = FINAL_CONFIG.value.chart.grid.labels.yAxis.scaleMax;
    if (raw === null || raw === undefined) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
});

const hasUserScale = computed(() => {
    return parsedScaleMin.value !== null || parsedScaleMax.value !== null;
});

const dataRange = computed(() => {
    const activeDataset = safeDataset.value.filter(
        (seriesItem) => !segregatedSeriesSet.value.has(seriesItem.id),
    );
    return scanPointValueMinMax(activeDataset, 0, 1);
});

const min = computed(() => {
    const { min: dataMin, max: dataMax } = dataRange.value;

    if (!hasUserScale.value) {
        const m = dataMin;
        return m > 0 ? 0 : m;
    }

    const baseMin =
        parsedScaleMin.value !== null
            ? parsedScaleMin.value
            : dataMin > 0
              ? 0
              : dataMin;
    const baseMax =
        parsedScaleMax.value !== null ? parsedScaleMax.value : dataMax;

    // Expand to include outliers beyond provided bounds
    const expandedMin = dataMin < baseMin ? dataMin : baseMin;
    const expandedMax = dataMax > baseMax ? dataMax : baseMax;

    return normalizeRange(expandedMin, expandedMax).min;
});

const max = computed(() => {
    const { min: dataMin, max: dataMax } = dataRange.value;

    if (!hasUserScale.value) {
        const m = dataMax;
        return min.value === m ? m + 1 : m;
    }

    const baseMin =
        parsedScaleMin.value !== null
            ? parsedScaleMin.value
            : dataMin > 0
              ? 0
              : dataMin;
    const baseMax =
        parsedScaleMax.value !== null ? parsedScaleMax.value : dataMax;

    // Expand to include outliers beyond provided bounds
    const expandedMin = dataMin < baseMin ? dataMin : baseMin;
    const expandedMax = dataMax > baseMax ? dataMax : baseMax;

    return normalizeRange(expandedMin, expandedMax).max;
});

const niceScale = computed(() => {
    return FINAL_CONFIG.value.chart.grid.labels.yAxis.useNiceScale
        ? calculateNiceScale(
              min.value,
              max.value < 0 ? 0 : max.value,
              FINAL_CONFIG.value.chart.grid.labels.yAxis.commonScaleSteps,
          )
        : calculateNiceScaleWithExactExtremes(
              min.value,
              max.value < 0 ? 0 : max.value,
              FINAL_CONFIG.value.chart.grid.labels.yAxis.commonScaleSteps,
          );
});

const relativeZero = computed(() => {
    if (
        ![null, undefined].includes(
            FINAL_CONFIG.value.chart.grid.labels.yAxis.scaleMin,
        )
    ) {
        return -niceScale.value.min;
    }

    if (niceScale.value.min >= 0) return 0;
    return Math.abs(niceScale.value.min);
});

const isContinuousScale = computed(() => {
    return FINAL_DATASET.value.some((datapoint) => {
        return (
            Array.isArray(datapoint.series) &&
            datapoint.series.some(isCoordinatePoint)
        );
    });
});

watchEffect(() => {
    if (!isContinuousScale.value) {
        return;
    }

    const hasUnsupportedSeries = FINAL_DATASET.value.some((datapoint) => {
        return !canUseSeriesInContinuousMode(datapoint);
    });

    if (!hasUnsupportedSeries) {
        return;
    }

    console.warn(
        `Vue Data UI - VueUiXy: mixed continuous and non-continuous series are not supported in the same chart.\n\nContinuous mode requires all visible 'line' and 'plot' series to use coordinate-based datasets:\n[{ x: number, y: number }]\n\nSeries of type 'bar' and standard numeric series are ignored in continuous mode to prevent runtime errors.\n\nIf you need to mix 'bar', 'line', and 'plot' series in the same chart, all series must use the standard [number, number, number...] format.`,
    );
});

function isNullCoordinateBreak(point) {
    return (
        point &&
        typeof point === 'object' &&
        point.x === null &&
        point.y === null
    );
}

function isCoordinateSeries(series) {
    return (
        Array.isArray(series) &&
        series.some((point) => {
            return isCoordinatePoint(point) || isNullCoordinateBreak(point);
        })
    );
}

function canUseSeriesInContinuousMode(datapoint) {
    if (!isContinuousScale.value) {
        return true;
    }

    return (
        ['line', 'plot'].includes(datapoint.type) &&
        isCoordinateSeries(datapoint.series)
    );
}

function normalizeCoordinatePoint(point, index) {
    if (isNullCoordinateBreak(point)) {
        return {
            x: null,
            y: null,
            index,
            raw: point,
            isNull: true,
        };
    }

    if (!point || typeof point !== 'object') {
        return {
            x: null,
            y: null,
            index,
            raw: point,
            isNull: true,
            isInvalid: true,
        };
    }

    return {
        x: Number(point.x),
        y: isSafeValue(point.y) ? Number(point.y) : null,
        index,
        raw: point,
        isNull: false,
        isInvalid: false,
    };
}

function getValueFromPoint(point) {
    if (!isContinuousScale.value) return point;
    return point && typeof point === 'object' ? point.y : null;
}

const safeDataset = computed(() => {
    if (!useSafeValues.value && !isContinuousScale.value) {
        return FINAL_DATASET.value;
    }

    return FINAL_DATASET.value.map((datapoint, i) => {
        const id = `uniqueId_${i}`;
        const canUseContinuousSeries = canUseSeriesInContinuousMode(datapoint);

        const sourceSeries = isContinuousScale.value
            ? canUseContinuousSeries
                ? datapoint.series
                : []
            : lttb(datapoint.series);

        return {
            ...datapoint,
            slotAbsoluteIndex: i,
            series: isContinuousScale.value
                ? sourceSeries
                      .map((point, index) =>
                          normalizeCoordinatePoint(point, index),
                      )
                      .filter((point) => {
                          if (point.isInvalid) {
                              return false;
                          }

                          if (point.x === null && point.y === null) {
                              return (
                                  slicer.value.start <= 0 &&
                                  slicer.value.end >= 0
                              );
                          }

                          return (
                              point.x >= slicer.value.start &&
                              point.x <= slicer.value.end
                          );
                      })
                : sourceSeries
                      .map((d) => {
                          return isSafeValue(d) ? d : null;
                      })
                      .slice(slicer.value.start, slicer.value.end),
            color: convertColorToHex(
                datapoint.color
                    ? datapoint.color
                    : customPalette.value[i]
                      ? customPalette.value[i]
                      : palette[i],
            ),
            id,
            scaleLabel: datapoint.scaleLabel || id,
        };
    });
});

const absoluteDataset = computed(() => {
    return safeDataset.value.map((datapoint, i) => {
        return {
            absoluteIndex: i,
            ...datapoint,
            series: isContinuousScale.value
                ? datapoint.series.map((point) => ({
                      ...point,
                      y: point.y === null ? null : point.y + relativeZero.value,
                  }))
                : datapoint.series.map((plot) => plot + relativeZero.value),
            absoluteValues: isContinuousScale.value
                ? datapoint.series.map((point) => point.y)
                : datapoint.series,
            segregate: () => segregate(datapoint),
            isSegregated: segregatedSeriesSet.value.has(datapoint.id),
        };
    });
});

const relativeDataset = computed(() => {
    return safeDataset.value
        .map((datapoint) => {
            return {
                ...datapoint,
                series: isContinuousScale.value
                    ? datapoint.series.map((point) => ({
                          ...point,
                          y:
                              point.y === null
                                  ? null
                                  : point.y + relativeZero.value,
                      }))
                    : datapoint.series.map((plot) => plot + relativeZero.value),
                absoluteValues: isContinuousScale.value
                    ? datapoint.series.map((point) => point.y)
                    : datapoint.series,
            };
        })
        .filter((s) => !segregatedSeriesSet.value.has(s.id));
});

const allSegregated = computed(
    () => segregatedSeries.value.length === absoluteDataset.value.length,
);

const yAxisLabelsAreRight = computed(() => {
    return FINAL_CONFIG.value.chart.grid.labels.yAxis.position === 'right';
});

function getScaleLabelX() {
    let scaleLabelsWidth = 0;

    if (scaleLabels.value) {
        const texts = Array.from(scaleLabels.value.querySelectorAll('text'));

        scaleLabelsWidth = texts.reduce((max, textElement) => {
            const width = textElement.getComputedTextLength();
            return width > max ? width : max;
        }, 0);
    }

    const yAxisLabelWidth = yAxisLabel.value
        ? yAxisLabel.value.getBoundingClientRect().width +
          FINAL_CONFIG.value.chart.grid.labels.axis.yLabelOffsetX +
          fontSizes.value.yAxis
        : 0;

    const scaleLabelsOffset =
        scaleLabelsWidth +
        FINAL_CONFIG.value.chart.grid.labels.yAxis.scaleValueOffsetX +
        FINAL_CONFIG.value.chart.grid.labels.yAxis.crosshairSize;

    return {
        left: yAxisLabelsAreRight.value
            ? 0
            : scaleLabelsOffset + yAxisLabelWidth,

        right: yAxisLabelsAreRight.value
            ? scaleLabelsOffset + yAxisLabelWidth
            : 0,

        scaleLabelsOffset,
        yAxisLabelWidth,
    };
}

function updateContinuousTooltip(svgX) {
    const closestGlobal = getClosestContinuousTooltipPoint(svgX);

    if (!closestGlobal) {
        continuousTooltipSet.value = [];
        continuousTooltipX.value = null;
        selectedMinimapXValue.value = null;
        return;
    }

    const selectedX = Number(closestGlobal.point.x);

    const matchingPoints =
        continuousTooltipLookup.value.matchingPointsByXValue.get(selectedX) ||
        [];

    continuousTooltipSet.value = matchingPoints.map((point) => {
        return {
            ...point,
            distance: 0,
        };
    });

    continuousTooltipX.value = getContinuousX({ x: selectedX });
    selectedMinimapXValue.value = selectedX;
}

function updateContinuousTooltipFromXValue(xValue) {
    if (!Number.isFinite(Number(xValue))) {
        continuousTooltipSet.value = [];
        continuousTooltipX.value = null;
        return;
    }

    const svgX = getContinuousX({ x: Number(xValue) });
    updateContinuousTooltip(svgX);
    continuousTooltipX.value = svgX;
}

const timeLabelsHeight = ref(0);
const timeLabelsBBoxX = ref(0);

function measureTimeLabelsBox() {
    const el = timeLabelsEls.value;

    if (!el) {
        timeLabelsHeight.value = 0;
        timeLabelsBBoxX.value = 0;
        return;
    }

    try {
        const bbox = el.getBBox();
        timeLabelsHeight.value = bbox?.height ?? 0;
        timeLabelsBBoxX.value = bbox?.x ?? 0;
    } catch {
        timeLabelsHeight.value = 0;
        timeLabelsBBoxX.value = 0;
    }
}

const timeLabelsY = computed(() => {
    let axisLabelHeight = 0;

    if (xAxisLabel.value) {
        try {
            axisLabelHeight = xAxisLabel.value.getBBox().height || 0;
        } catch {
            axisLabelHeight = 0;
        }
    }

    return axisLabelHeight + timeLabelsHeight.value + fontSizes.value.xAxis;
});

const useProgression = computed(() => {
    return FINAL_DATASET.value.some((el) => el.useProgression);
});

function getIndividualScaleSlotWidth() {
    return (
        FINAL_CONFIG.value.chart.grid.labels.yAxis.crosshairSize +
        FINAL_CONFIG.value.chart.grid.labels.yAxis.scaleValueOffsetX +
        5 +
        FINAL_CONFIG.value.chart.grid.labels.yAxis.labelWidth +
        FINAL_CONFIG.value.chart.grid.labels.axis.yLabelOffsetX +
        fontSizes.value.dataLabels * 0.8
    );
}

const drawingArea = computed(() => {
    void parentLayoutStableRunSequence.value;

    let leftScaleLabelX = 0;
    let rightScaleLabelX = 0;
    let scaleLabelsOffset = 0;
    let yAxisLabelWidth = 0;
    const individualOffsetX = 36;

    if (FINAL_CONFIG.value.chart.grid.labels.show) {
        if (
            mutableConfig.value.useIndividualScale &&
            !mutableConfig.value.isStacked
        ) {
            if (yAxisLabelsAreRight.value) {
                rightScaleLabelX =
                    (FINAL_DATASET.value.length -
                        segregatedSeries.value.length) *
                    getIndividualScaleSlotWidth();
            } else {
                leftScaleLabelX =
                    (FINAL_DATASET.value.length -
                        segregatedSeries.value.length) *
                    (FINAL_CONFIG.value.chart.grid.labels.yAxis.labelWidth +
                        individualOffsetX);
            }
        } else if (
            mutableConfig.value.useIndividualScale &&
            mutableConfig.value.isStacked
        ) {
            const individualScaleWidth =
                FINAL_CONFIG.value.chart.grid.labels.yAxis.labelWidth +
                individualOffsetX;

            if (yAxisLabelsAreRight.value) {
                rightScaleLabelX = individualScaleWidth;
            } else {
                leftScaleLabelX = individualScaleWidth;
            }
        } else {
            const scaleLabelX = getScaleLabelX();

            leftScaleLabelX = scaleLabelX.left;
            rightScaleLabelX = scaleLabelX.right;
            scaleLabelsOffset = scaleLabelX.scaleLabelsOffset;
            yAxisLabelWidth = scaleLabelX.yAxisLabelWidth;
        }
    }

    const topOffset = FINAL_CONFIG.value.chart.labels.fontSize * 1.1;
    const progressionLabelOffsetX = useProgression.value ? 24 : 6;

    if (timeLabelsEls.value && timeLabelsBBoxX.value < 0) {
        leftScaleLabelX += Math.abs(timeLabelsBBoxX.value);
    }

    const _width =
        width.value -
        leftScaleLabelX -
        rightScaleLabelX -
        progressionLabelOffsetX -
        FINAL_CONFIG.value.chart.padding?.left -
        FINAL_CONFIG.value.chart.padding?.right;

    return {
        top: FINAL_CONFIG.value.chart.padding?.top + topOffset,
        right:
            leftScaleLabelX +
            (yAxisLabelsAreRight.value
                ? 0
                : FINAL_CONFIG.value.chart.grid.labels.yAxis.crosshairSize) +
            FINAL_CONFIG.value.chart.padding?.left +
            _width,
        bottom:
            height.value -
            timeLabelsY.value -
            FINAL_CONFIG.value.chart.padding?.bottom -
            FINAL_CONFIG.value.chart.grid.labels.axis.xLabelOffsetY,
        left:
            leftScaleLabelX +
            (yAxisLabelsAreRight.value
                ? 0
                : FINAL_CONFIG.value.chart.grid.labels.yAxis.crosshairSize) +
            FINAL_CONFIG.value.chart.padding?.left,
        height:
            height.value -
            timeLabelsY.value -
            FINAL_CONFIG.value.chart.padding?.top -
            FINAL_CONFIG.value.chart.padding?.bottom -
            topOffset -
            FINAL_CONFIG.value.chart.grid.labels.axis.xLabelOffsetY,
        width: _width,
        scaleLabelX: leftScaleLabelX,
        rightScaleLabelX,
        scaleLabelsOffset,
        yAxisLabelWidth,
        individualOffsetX,
    };
});

const gridVerticalLines = computed(() => {
    const extra = FINAL_CONFIG.value.chart.grid.position === 'middle' ? 1 : 0;
    const count = maxSeries.value + extra;

    const topY = forceValidValue(drawingArea.value?.top);
    const bottomY = forceValidValue(drawingArea.value?.bottom);

    if (isContinuousScale.value) {
        if (FINAL_CONFIG.value.chart.grid.position === 'middle') {
            return continuousXLabels.value
                .map((label, index, arr) => {
                    if (index === 0) {
                        return null;
                    }

                    const previous = arr[index - 1];
                    const x = previous.x + (label.x - previous.x) / 2;

                    return `M${x},${topY} L${x},${bottomY}`;
                })
                .filter(Boolean)
                .join(' ');
        }

        return continuousXLabels.value
            .map((label) => {
                return `M${label.x},${topY} L${label.x},${bottomY}`;
            })
            .join(' ');
    }

    return Array.from({ length: count })
        .map((_, i) => {
            const x =
                FINAL_CONFIG.value.chart.grid.position === 'middle'
                    ? getHorizontalBandX(i)
                    : getDatapointX(i);

            return `M${x},${topY} L${x},${bottomY}`;
        })
        .join(' ');
});

const crosshairsX = computed(() => {
    if (!FINAL_CONFIG.value.chart.grid.labels.xAxis.showCrosshairs) return '';

    const size = FINAL_CONFIG.value.chart.grid.labels.xAxis.crosshairSize;
    const alwaysAtZero =
        FINAL_CONFIG.value.chart.grid.labels.xAxis.crosshairsAlwaysAtZero;

    const labels = isContinuousScale.value
        ? continuousXLabels.value
        : displayedTimeLabels.value;

    return labels
        .map((label, i) => {
            if (!label || !label.text) return null;

            const x = isContinuousScale.value ? label.x : getDatapointX(i);

            const y1 = alwaysAtZero
                ? zero.value -
                  (zero.value === drawingArea.value?.bottom ? 0 : size / 2)
                : drawingArea.value?.bottom;

            const y2 = alwaysAtZero
                ? zero.value +
                  size / (zero.value === drawingArea.value?.bottom ? 1 : 2)
                : drawingArea.value?.bottom + size;

            return `M${x},${y1} L${x},${y2}`;
        })
        .filter(Boolean)
        .join(' ');
});

function usesSelectTimeLabelEvent() {
    return !!instance?.vnode.props?.onSelectTimeLabel;
}

function getTextMeasurer(fontSize, fontFamily, fontWeight) {
    if (!textMeasurer.value) {
        const canvas = document.createElement('canvas');
        textMeasurer.value = canvas.getContext('2d');
    }
    textMeasurer.value.font = `${fontWeight || 'normal'} ${fontSize}px ${fontFamily || 'sans-serif'}`;
    return textMeasurer.value;
}

function hideTags() {
    const tags = chart.value.querySelectorAll('.vue-ui-xy-tag');
    if (tags.length) {
        Array.from(tags).forEach((tag) => (tag.style.opacity = '0'));
    }
}

function setTagRef(i, j, el, position, type) {
    if (el) tagRefs.value[`${i}_${j}_${position}_${type}`] = el;
}

const userHovers = ref(false);

async function setUserOptionsVisibility(state = false) {
    await nextTick();
    userHovers.value = state;
    if (!showUserOptionsOnChartHover.value) return;
    userOptionsVisible.value = state;
}

function showUserOptions() {
    setUserOptionsVisibility(true);
}

function hideUserOptions() {
    setUserOptionsVisibility(false);
}

function toggleAnnotator() {
    isAnnotator.value = !isAnnotator.value;
}

const timeLabels = ref([]);
const allTimeLabels = ref([]);

let timeLabelsRequestId = 0;
watchEffect(() => {
    const requestId = ++timeLabelsRequestId;

    (async () => {
        const maxDatapoints = maxDownsampledSeriesLength.value;

        const labels = await useTimeLabels({
            values: FINAL_CONFIG.value.chart.grid.labels.xAxisLabels.values,
            maxDatapoints,
            formatter:
                FINAL_CONFIG.value.chart.grid.labels.xAxisLabels
                    .datetimeFormatter,
            start: slicer.value.start,
            end: slicer.value.end,
        });

        if (requestId === timeLabelsRequestId) {
            timeLabels.value = labels;
        }
    })();
});

let allTimeLabelsRequestId = 0;
watchEffect(() => {
    const requestId = ++allTimeLabelsRequestId;

    (async () => {
        const maxDatapoints = maxDownsampledSeriesLength.value;

        const labels = await useTimeLabels({
            values: FINAL_CONFIG.value.chart.grid.labels.xAxisLabels.values,
            maxDatapoints,
            formatter:
                FINAL_CONFIG.value.chart.grid.labels.xAxisLabels
                    .datetimeFormatter,
            start: 0,
            end: maxX.value,
        });

        if (requestId === allTimeLabelsRequestId) {
            allTimeLabels.value = labels;
        }
    })();
});

const modulo = computed(() => {
    const m = FINAL_CONFIG.value.chart.grid.labels.xAxisLabels.modulo;
    if (!timeLabels.value.length) return m;
    return Math.min(
        m,
        [...new Set(timeLabels.value.map((t) => t.text))].length,
    );
});

const displayedTimeLabels = computed(() => {
    const cfg = FINAL_CONFIG.value.chart.grid.labels.xAxisLabels;
    const vis = timeLabels.value || [];
    const all = allTimeLabels.value || [];
    const start = slicer.value.start ?? 0;
    const sel = selectedSerieIndex.value;
    const maxS = maxSeries.value;
    const visTexts = vis.map((l) => l?.text ?? '');
    const allTexts = all.map((l) => l?.text ?? '');

    return buildDisplayedTimeLabels(
        !!cfg.showOnlyFirstAndLast,
        !!cfg.showOnlyAtModulo,
        Math.max(1, modulo.value || 1),
        visTexts,
        allTexts,
        start,
        sel,
        maxS,
    );
});

const displayedTimeLabelsKey = computed(() => {
    return (displayedTimeLabels.value || [])
        .map((l) => l?.text ?? '')
        .join('|');
});

onMounted(() => {
    // First measurement after initial paint
    requestAnimationFrame(() => {
        measureTimeLabelsBox();
    });

    // Re-measure when async labels arrive or layout inputs change
    watch(
        [
            () => displayedTimeLabelsKey.value,
            () => FINAL_CONFIG.value.chart.grid.labels.xAxisLabels.rotation,
            () => fontSizes.value.xAxis,
            () => width.value,
            () => height.value,
        ],
        async () => {
            await nextTick();
            requestAnimationFrame(() => {
                measureTimeLabelsBox();
            });
        },
        { flush: 'post' },
    );
});

onBeforeUnmount(() => {
    timeLabelsHeight.value = 0;
    timeLabelsBBoxX.value = 0;
    stableParentSize.stop();
    if (visibilityResizeObserver.value) {
        visibilityResizeObserver.value.disconnect();
        visibilityResizeObserver.value = null;
    }
});

function selectTimeLabel(label, relativeIndex) {
    const datapoint = relativeDataset.value.map((datapoint) => {
        return {
            shape:
                (datapoint.shape ?? datapoint.type === 'bar')
                    ? 'square'
                    : 'circle',
            name: datapoint.name,
            color: datapoint.color,
            type: datapoint.type,
            value: datapoint.absoluteValues.find(
                (_s, i) => i === relativeIndex,
            ),
            comments: datapoint.comments || [],
            prefix: datapoint.prefix || FINAL_CONFIG.value.chart.labels.prefix,
            suffix: datapoint.suffix || FINAL_CONFIG.value.chart.labels.suffix,
        };
    });
    emit('selectTimeLabel', {
        datapoint,
        absoluteIndex: label.absoluteIndex,
        label: label.text,
    });
}

const maxSeries = computed(() => {
    const len = safeInt((slicer.value.end ?? 0) - (slicer.value.start ?? 0));
    return Math.max(1, len);
});

function selectMinimapIndex(payload) {
    if (isContinuousScale.value) return;
    selectedMinimapIndex.value = payload;
}

function selectMinimapXValue(value) {
    if (!isContinuousScale.value || !isValidNumber(value)) {
        selectedMinimapXValue.value = null;
        continuousTooltipSet.value = [];
        continuousTooltipX.value = null;
        return;
    }

    selectedMinimapXValue.value = Number(value);
    updateContinuousTooltipFromXValue(Number(value));
}

const hasHighlighterSelection = computed(() => {
    if (isContinuousScale.value) {
        return (
            isValidNumber(selectedMinimapXValue.value) ||
            isValidNumber(continuousTooltipX.value)
        );
    }

    return (
        ![null, undefined].includes(selectedSerieIndex.value) ||
        ![null, undefined].includes(selectedMinimapIndex.value)
    );
});

function toggleStack() {
    mutableConfig.value.isStacked = !mutableConfig.value.isStacked;
    if (!mutableConfig.value.isStacked) {
        mutableConfig.value.useIndividualScale =
            FINAL_CONFIG.value.chart.grid.labels.yAxis.useIndividualScale;
    } else {
        mutableConfig.value.useIndividualScale = true;
    }
}

function checkAutoScaleError(datapoint) {
    if (!debug.value) return;
    if (datapoint.autoScaling) {
        if (!FINAL_CONFIG.value.chart.grid.labels.yAxis.useIndividualScale) {
            console.warn(
                `VueUiXy (datapoint: ${datapoint.name}) : autoScaling only works when config.chart.grid.labels.yAxis.useIndividualScale is set to true`,
            );
        }
        if (!FINAL_CONFIG.value.chart.grid.labels.yAxis.stacked) {
            console.warn(
                `VueUiXy (datapoint: ${datapoint.name}) : autoScaling only works when config.chart.grid.labels.yAxis.stacked is set to true`,
            );
        }
    }
}

function validSlicerEnd(v) {
    const _max = maxDownsampledSeriesLength.value;

    if (v > _max) {
        return _max;
    }

    if (
        v < 0 ||
        (FINAL_CONFIG.value.chart.zoom.startIndex !== null &&
            v < FINAL_CONFIG.value.chart.zoom.startIndex)
    ) {
        if (FINAL_CONFIG.value.chart.zoom.startIndex !== null) {
            return FINAL_CONFIG.value.chart.zoom.startIndex + 1;
        } else {
            return 1;
        }
    }

    return v;
}

const isSettingUp = ref(false);
const slicerReady = ref(false);

const absoluteSlicerStartIndex = ref(0);
const absoluteSlicerEndIndex = ref(0);

function setupSlicer() {
    if (isSettingUp.value) return;
    isSettingUp.value = true;
    try {
        if (isContinuousScale.value) {
            const start = continuousFullXRange.value.min;
            const end = continuousFullXRange.value.max;

            absoluteSlicerStartIndex.value = start;
            absoluteSlicerEndIndex.value = end;

            slicer.value.start = start;
            slicer.value.end = end;
            slicerPrecog.value.start = start;
            slicerPrecog.value.end = end;

            slicerReady.value = true;

            if (chartSlicer.value) {
                chartSlicer.value.setStartValue(start);
                chartSlicer.value.setEndValue(end);
            }

            return;
        }

        const { startIndex, endIndex } = FINAL_CONFIG.value.chart.zoom;
        const max = FINAL_CONFIG.value.chart.zoom.keepState
            ? maxDownsampledSeriesLengthWithZero.value
            : maxDownsampledSeriesLength.value;

        if (FINAL_CONFIG.value.chart.zoom.keepState && max <= 0) {
            return;
        }

        // Absolute bounds are always the full-range indices
        absoluteSlicerStartIndex.value = 0;
        absoluteSlicerEndIndex.value = max;

        const start = startIndex != null ? startIndex : 0;
        const end =
            endIndex != null
                ? Math.min(validSlicerEnd(endIndex + 1), max)
                : max;

        suppressChild.value = true;
        slicer.value.start = start;
        slicer.value.end = end;
        slicerPrecog.value.start = start;
        slicerPrecog.value.end = end;
        normalizeSlicerWindow();
        slicerReady.value = true;
    } finally {
        queueMicrotask(() => {
            suppressChild.value = false;
        });
        isSettingUp.value = false;
    }
}

const suppressChild = ref(false);

const disableShapeTransitionForRangeResize = ref(false);
let queuedSlicerFrame = null;
let restoreShapeTransitionFrame = null;
let queuedSlicerUpdate = {};

function getSlicerRangeSize(source = slicer.value) {
    return Number(source.end) - Number(source.start);
}

function clearQueuedSlicerFrames() {
    if (queuedSlicerFrame) {
        cancelAnimationFrame(queuedSlicerFrame);
        queuedSlicerFrame = null;
    }

    if (restoreShapeTransitionFrame) {
        cancelAnimationFrame(restoreShapeTransitionFrame);
        restoreShapeTransitionFrame = null;
    }
}

function queueSlicerUpdate(update) {
    queuedSlicerUpdate = {
        ...queuedSlicerUpdate,
        ...update,
    };

    if (queuedSlicerFrame) {
        cancelAnimationFrame(queuedSlicerFrame);
    }

    queuedSlicerFrame = requestAnimationFrame(() => {
        const previousRangeSize = getSlicerRangeSize();

        const nextSlicer = {
            ...slicer.value,
            ...queuedSlicerUpdate,
        };

        const nextRangeSize = getSlicerRangeSize(nextSlicer);

        disableShapeTransitionForRangeResize.value =
            nextRangeSize !== previousRangeSize;

        slicer.value = nextSlicer;
        slicerPrecog.value = { ...nextSlicer };

        queuedSlicerUpdate = {};
        queuedSlicerFrame = null;

        normalizeSlicerWindow();

        if (restoreShapeTransitionFrame) {
            cancelAnimationFrame(restoreShapeTransitionFrame);
        }

        restoreShapeTransitionFrame = requestAnimationFrame(() => {
            disableShapeTransitionForRangeResize.value = false;
            restoreShapeTransitionFrame = null;
        });
    });
}

function onSlicerStart(v) {
    if (isSettingUp.value || suppressChild.value) return;

    const nextStart = Number(v);

    emit('zoomStart', {
        index: nextStart,
        isZoom: isObjectivelyDifferentIndex(
            nextStart,
            absoluteSlicerStartIndex.value,
        ),
    });

    if (!Number.isFinite(nextStart)) return;
    if (nextStart === slicer.value.start) return;

    queueSlicerUpdate({ start: nextStart });
}

function onSlicerEnd(v) {
    if (isSettingUp.value || suppressChild.value) return;

    if (isContinuousScale.value) {
        const rawEnd = Number(v);

        if (!Number.isFinite(rawEnd)) return;

        const end = Math.max(
            Number(slicer.value.start) +
                1 / 10 ** FINAL_CONFIG.value.chart.grid.labels.xAxis.rounding,
            Math.min(rawEnd, continuousFullXRange.value.max),
        );

        emit('zoomEnd', {
            index: end,
            isZoom: isObjectivelyDifferentIndex(
                end,
                absoluteSlicerEndIndex.value,
            ),
        });

        if (end === slicer.value.end) return;

        queueSlicerUpdate({ end });

        return;
    }

    const end = validSlicerEnd(v);

    emit('zoomEnd', {
        index: end,
        isZoom: isObjectivelyDifferentIndex(end, absoluteSlicerEndIndex.value),
    });

    if (end === slicer.value.end) return;

    queueSlicerUpdate({ end });
}

async function refreshSlicer() {
    const previousRangeSize = getSlicerRangeSize();
    disableShapeTransitionForRangeResize.value = true;
    await setupSlicer();
    const nextRangeSize = getSlicerRangeSize();
    if (nextRangeSize === previousRangeSize) {
        disableShapeTransitionForRangeResize.value = false;
    } else {
        await nextTick();
        if (restoreShapeTransitionFrame) {
            cancelAnimationFrame(restoreShapeTransitionFrame);
        }
        restoreShapeTransitionFrame = requestAnimationFrame(() => {
            disableShapeTransitionForRangeResize.value = false;
            restoreShapeTransitionFrame = null;
        });
    }
    emit('zoomReset');
}

const absoluteMax = computed(() => niceScale.value.max + relativeZero.value);

function ratioToMax(v) {
    return v / (canShowValue(absoluteMax.value) ? absoluteMax.value : 1);
}

const isYAxisReversed = computed(() => {
    return FINAL_CONFIG.value.chart.grid.labels.yAxis.reverse;
});

function applyYAxisReverseRatio(ratio) {
    return isYAxisReversed.value ? 1 - ratio : ratio;
}

function getYFromRatio({ ratio, yOffset = 0, individualHeight }) {
    const finalRatio = applyYAxisReverseRatio(ratio);

    return drawingArea.value?.bottom - yOffset - individualHeight * finalRatio;
}

function getIndividualScaleYFromRatio({
    ratio,
    zeroPosition,
    individualHeight,
}) {
    if (!isYAxisReversed.value) {
        return zeroPosition - individualHeight * ratio;
    }

    return zeroPosition + individualHeight * ratio;
}

function getYFromScaleValue({
    value,
    scaleMin,
    scaleMax,
    yOffset = 0,
    individualHeight,
}) {
    const ratio = (value - scaleMin) / (scaleMax - scaleMin || 1);

    return getYFromRatio({
        ratio,
        yOffset,
        individualHeight,
    });
}

const isXAxisReversed = computed(() => {
    return FINAL_CONFIG.value.chart.grid.labels.xAxis.reverse;
});

function applyXAxisReverseRatio(ratio) {
    return isXAxisReversed.value ? 1 - ratio : ratio;
}

const zero = computed(() => {
    if (isNaN(ratioToMax(relativeZero.value))) {
        return drawingArea.value?.bottom;
    } else {
        return (
            drawingArea.value?.bottom -
            drawingArea.value.height * ratioToMax(relativeZero.value)
        );
    }
});

function valueToDrawingAreaY(value) {
    const minimum = niceScale.value.min;
    const maximum = niceScale.value.max;
    const range = maximum - minimum;

    if (!Number.isFinite(value) || !Number.isFinite(range) || range === 0) {
        return drawingArea.value?.bottom;
    }

    return (
        drawingArea.value?.bottom -
        drawingArea.value.height * ((value - minimum) / range)
    );
}

const visibleZeroOrBaseline = computed(() => {
    if (niceScale.value.min <= 0 && niceScale.value.max >= 0) {
        return valueToDrawingAreaY(0);
    }

    if (niceScale.value.min > 0) {
        return valueToDrawingAreaY(niceScale.value.min);
    }

    return valueToDrawingAreaY(niceScale.value.max);
});

function calcRectHeight(plot) {
    const zeroForPositiveValuesOnly =
        ![null, undefined].includes(
            FINAL_CONFIG.value.chart.grid.labels.yAxis.scaleMin,
        ) &&
        FINAL_CONFIG.value.chart.grid.labels.yAxis.scaleMin > 0 &&
        min.value >= 0
            ? drawingArea.value?.bottom
            : zero.value;

    if (plot.value >= 0) {
        return checkNaN(
            zeroForPositiveValuesOnly - plot.y <= 0
                ? 0.00001
                : zeroForPositiveValuesOnly - plot.y,
        );
    } else {
        return checkNaN(
            plot.y - zero.value <= 0 ? 0.00001 : plot.y - zero.value,
        );
    }
}

function calcIndividualHeight(plot) {
    if (plot.value >= 0) {
        return checkNaN(
            plot.zeroPosition - plot.y <= 0
                ? 0.00001
                : plot.zeroPosition - plot.y,
        );
    } else {
        return checkNaN(
            plot.y - plot.zeroPosition <= 0
                ? 0.00001
                : plot.zeroPosition - plot.y,
        );
    }
}

const slot = computed(() => {
    const denominator = Math.max(1, maxSeries.value);
    const widthValue = Math.max(1, drawingArea.value.width);

    return {
        bar: safeDiv(
            widthValue,
            denominator * activeBarSeriesCountWithFallback.value,
            1,
        ),
        plot: horizontalDatapointSpacing.value,
        line: horizontalDatapointSpacing.value,
    };
});

function calcRectWidth() {
    if (
        mutableConfig.value.useIndividualScale &&
        mutableConfig.value.isStacked
    ) {
        return (
            slot.value.line - (drawingArea.value.width / maxSeries.value) * 0.1
        );
    }
    return slot.value.bar;
}

function calcRectX(plot) {
    if (
        mutableConfig.value.useIndividualScale &&
        mutableConfig.value.isStacked
    ) {
        return plot.x + (drawingArea.value.width / maxSeries.value) * 0.05;
    }
    return plot.x + slot.value.bar / 2;
}

function getBarCenterX(plot) {
    if (
        mutableConfig.value.useIndividualScale &&
        mutableConfig.value.isStacked
    ) {
        return plot.x + slot.value.line / 2;
    }

    return calcRectX(plot) + calcRectWidth() / 2 - barPeriodGap.value / 2;
}

function calcRectY(plot) {
    if (plot.value >= 0) return plot.y;
    return [null, undefined, NaN, Infinity, -Infinity].includes(zero.value)
        ? drawingArea?.bottom.value
        : zero.value;
}

function calcIndividualRectY(plot) {
    if (plot.value >= 0) return plot.y;
    return [null, undefined, NaN, Infinity, -Infinity].includes(
        plot.zeroPosition,
    )
        ? 0
        : plot.zeroPosition;
}

const hoveredIndex = ref(null);
const continuousTooltipSet = ref([]);
const continuousTooltipX = ref(null);

const continuousTooltipLookup = computed(() => {
    if (!isContinuousScale.value) {
        return {
            sortedPoints: [],
            matchingPointsByXValue: new Map(),
        };
    }

    const sortedPoints = [];
    const matchingPointsByXValue = new Map();
    let sourceOrder = 0;

    for (
        let seriesIndex = 0;
        seriesIndex < relativeDataset.value.length;
        seriesIndex += 1
    ) {
        const datapoint = relativeDataset.value[seriesIndex];

        if (!['line', 'plot'].includes(datapoint.type)) continue;
        if (!Array.isArray(datapoint.series)) continue;

        for (
            let pointIndex = 0;
            pointIndex < datapoint.series.length;
            pointIndex += 1
        ) {
            const point = datapoint.series[pointIndex];
            if (!isValidNumber(point?.x) || !isValidNumber(point?.y)) continue;
            const xValue = Number(point.x);
            const x = getContinuousX(point);

            const tooltipPoint = {
                datapoint,
                point,
                index: pointIndex,
                x,
                y: point.y,
                distance: 0,
                sourceOrder,
            };

            sortedPoints.push({
                ...tooltipPoint,
                xValue,
            });

            if (!matchingPointsByXValue.has(xValue)) {
                matchingPointsByXValue.set(xValue, []);
            }

            matchingPointsByXValue.get(xValue).push(tooltipPoint);
            sourceOrder += 1;
        }
    }

    sortedPoints.sort((firstPoint, secondPoint) => {
        if (firstPoint.x !== secondPoint.x) {
            return firstPoint.x - secondPoint.x;
        }

        return firstPoint.sourceOrder - secondPoint.sourceOrder;
    });

    return {
        sortedPoints,
        matchingPointsByXValue,
    };
});

function getClosestContinuousTooltipPoint(svgX) {
    const sortedPoints = continuousTooltipLookup.value.sortedPoints;

    if (!sortedPoints.length) {
        return null;
    }

    let left = 0;
    let right = sortedPoints.length - 1;

    while (left <= right) {
        const middle = Math.floor((left + right) / 2);

        if (sortedPoints[middle].x < svgX) {
            left = middle + 1;
        } else {
            right = middle - 1;
        }
    }

    const candidateIndexes = new Set();

    if (left >= 0 && left < sortedPoints.length) {
        candidateIndexes.add(left);
    }

    if (left - 1 >= 0 && left - 1 < sortedPoints.length) {
        candidateIndexes.add(left - 1);
    }

    if (left + 1 >= 0 && left + 1 < sortedPoints.length) {
        candidateIndexes.add(left + 1);
    }

    let closestPoint = null;

    candidateIndexes.forEach((candidateIndex) => {
        const point = sortedPoints[candidateIndex];
        const distance = Math.abs(point.x - svgX);

        if (
            !closestPoint ||
            distance < closestPoint.distance ||
            (distance === closestPoint.distance &&
                point.sourceOrder < closestPoint.sourceOrder)
        ) {
            closestPoint = {
                ...point,
                distance,
            };
        }
    });

    return closestPoint;
}

const continuousKeyboardXValues = computed(() => {
    if (!isContinuousScale.value) {
        return [];
    }

    return Array.from(
        continuousTooltipLookup.value.matchingPointsByXValue.keys(),
    ).sort((firstValue, secondValue) => {
        return (
            getContinuousX({ x: firstValue }) -
            getContinuousX({ x: secondValue })
        );
    });
});

function showContinuousTooltipFromKeyboard(index) {
    const xValue = continuousKeyboardXValues.value[index];

    if (!isValidNumber(xValue)) {
        continuousTooltipSet.value = [];
        continuousTooltipX.value = null;
        selectedMinimapXValue.value = null;
        isTooltip.value = false;
        return;
    }

    updateContinuousTooltipFromXValue(Number(xValue));

    const svgX = getContinuousX({ x: Number(xValue) });
    const svgY = drawingArea.value.top + drawingArea.value.height / 2;
    const coords = svgToClientCoords(svgX, svgY, svgRef.value);

    if (coords) {
        tooltipA11yPosition.value = coords;
    }

    selectedSerieIndex.value = index;
    activeTooltipIndex.value = index;
    isTooltip.value = true;
}

function clientToSvgCoords(evt) {
    const svgEl = svgRef.value;
    if (!svgEl) return null;

    // Precise mapping (handles fullscreen & letterboxing)
    if (svgEl.createSVGPoint && svgEl.getScreenCTM) {
        const pt = svgEl.createSVGPoint();
        pt.x = evt.clientX;
        pt.y = evt.clientY;
        const ctm = svgEl.getScreenCTM();
        if (ctm) {
            const p = pt.matrixTransform(ctm.inverse());
            return { x: p.x, y: p.y, ok: true };
        }
    }

    // Fallback (preserveAspectRatio meet)
    const rect = svgEl.getBoundingClientRect();
    const vb = svgEl.viewBox?.baseVal || {
        x: 0,
        y: 0,
        width: rect.width,
        height: rect.height,
    };
    const scale = Math.min(rect.width / vb.width, rect.height / vb.height);
    const drawnW = vb.width * scale;
    const drawnH = vb.height * scale;
    const offsetX = (rect.width - drawnW) / 2;
    const offsetY = (rect.height - drawnH) / 2;
    const x = (evt.clientX - rect?.left - offsetX) / scale + vb.x;
    const y = (evt.clientY - rect?.top - offsetY) / scale + vb.y;
    return { x, y, ok: true };
}

let RAF_MOUSE_MOVE = 0;

function onSvgMouseMove(e) {
    activeTooltipIndex.value = null;
    if (isAnnotator.value) return;

    // cancel any pending raf so a stale one cannot re-open the tooltip
    if (RAF_MOUSE_MOVE) cancelAnimationFrame(RAF_MOUSE_MOVE);

    RAF_MOUSE_MOVE = requestAnimationFrame(() => {
        RAF_MOUSE_MOVE = 0;

        const svgPt = clientToSvgCoords(e);
        // Mouse may have already left by the time this runs :E
        if (!svgPt || !svgRef.value) {
            onSvgMouseLeave();
            return;
        }

        // Ignore moves outside drawing area
        const { left, right, top, bottom } = drawingArea.value;
        if (
            svgPt.x < left ||
            svgPt.x > right ||
            svgPt.y < top ||
            svgPt.y > bottom
        ) {
            onSvgMouseLeave();
            return;
        }

        if (isContinuousScale.value) {
            updateContinuousTooltip(svgPt.x);
            toggleTooltipVisibility(true, selectedSerieIndex.value ?? 0);
            return;
        }

        const idx = getHoveredIndexFromSvgX(svgPt.x);

        if (idx != null) {
            if (hoveredIndex.value !== idx) {
                hoveredIndex.value = idx;
                toggleTooltipVisibility(true, idx);
            }
        } else {
            onSvgMouseLeave();
        }
    });
}

function onSvgMouseLeave() {
    if (RAF_MOUSE_MOVE) {
        cancelAnimationFrame(RAF_MOUSE_MOVE);
        RAF_MOUSE_MOVE = 0;
    }
    hoveredIndex.value = null;
    selectedMinimapIndex.value = null;
    selectedMinimapXValue.value = null;
    toggleTooltipVisibility(false, null);
    continuousTooltipSet.value = [];
    continuousTooltipX.value = null;
}

function onSvgClick(e) {
    const svgPt = clientToSvgCoords(e);
    if (svgPt && svgRef.value) {
        const { left, right, top, bottom } = drawingArea.value;

        // Only react if click lands inside the drawing area
        if (
            svgPt.x >= left &&
            svgPt.x <= right &&
            svgPt.y >= top &&
            svgPt.y <= bottom
        ) {
            const idx = getHoveredIndexFromSvgX(svgPt.x);

            if (idx != null) {
                selectX(idx);
                return;
            }
        }
    }

    if (hoveredIndex.value != null) {
        selectX(hoveredIndex.value);
    }
}

function selectX(index) {
    const datapoint = relativeDataset.value.map((s) => {
        return {
            name: s.name,
            value: [null, undefined, NaN].includes(s.absoluteValues[index])
                ? null
                : s.absoluteValues[index],
            color: s.color,
            type: s.type,
        };
    });

    emit('selectX', {
        dataset: datapoint,
        index,
        indexLabel:
            FINAL_CONFIG.value.chart.grid.labels.xAxisLabels.values[index],
    });

    if (FINAL_CONFIG.value.events.datapointClick) {
        FINAL_CONFIG.value.events.datapointClick({
            datapoint,
            seriesIndex: index + slicer.value.start,
        });
    }
}

function getData() {
    return absoluteDataset.value.map((s) => {
        return {
            values: s.absoluteValues,
            color: s.color,
            name: s.name,
            type: s.type,
        };
    });
}

async function getImage({ scale = 2 } = {}) {
    if (!chart.value) return;
    const { imageUri, base64 } = await img({
        domElement: chart.value,
        base64: true,
        img: true,
        scale,
    });
    const fallbackRect = chart.value.getBoundingClientRect();
    const fallbackDimensions = {
        width: fallbackRect.width,
        height: fallbackRect.height,
        aspectRatio: fallbackRect.height
            ? fallbackRect.width / fallbackRect.height
            : 0,
    };
    const imageDimensions =
        (await getImageDimensions(imageUri, scale)) ?? fallbackDimensions;

    return {
        imageUri,
        base64,
        title: FINAL_CONFIG.value.chart.title.text,
        ...imageDimensions,
    };
}

function toggleLegend() {
    if (segregatedSeries.value.length) {
        segregatedSeries.value = [];
    } else {
        absoluteDataset.value.forEach((s) => {
            segregatedSeries.value.push(s.id);
        });
    }
    emitSelectLegend();
}

function handleLegendKeydown(event, legendItem) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        segregate(legendItem);
    }
}

function emitSelectLegend() {
    emit(
        'selectLegend',
        relativeDataset.value.map((s) => {
            return {
                name: s.name,
                values: s.absoluteValues,
                color: s.color,
                type: s.type,
            };
        }),
    );
}

function segregate(legendItem) {
    disableShapeTransitionForRangeResize.value = false;

    if (restoreShapeTransitionFrame) {
        cancelAnimationFrame(restoreShapeTransitionFrame);
        restoreShapeTransitionFrame = null;
    }

    if (segregatedSeriesSet.value.has(legendItem.id)) {
        segregatedSeries.value = segregatedSeries.value.filter(
            (id) => id !== legendItem.id,
        );
    } else {
        if (segregatedSeries.value.length + 1 === safeDataset.value.length)
            return;
        segregatedSeries.value.push(legendItem.id);
    }

    emitSelectLegend();
    segregateStep.value += 1;
}

function validSeriesToToggle(name) {
    if (!absoluteDataset.value.length) {
        if (FINAL_CONFIG.value.debug) {
            console.warn('VueUiXy - There are no series to show.');
        }
        return null;
    }
    const dp = absoluteDataset.value.find((d) => d.name === name);
    if (!dp) {
        if (FINAL_CONFIG.value.debug) {
            console.warn(`VueUiXy - Series name not found "${name}"`);
        }
        return null;
    }
    return dp;
}

function showSeries(name) {
    const dp = validSeriesToToggle(name);
    if (dp === null) return;
    if (segregatedSeriesSet.value.has(dp.id)) {
        segregate({ id: dp.id });
    }
}

function hideSeries(name) {
    const dp = validSeriesToToggle(name);
    if (dp === null) return;
    if (!segregatedSeriesSet.value.has(dp.id)) {
        segregate({ id: dp.id });
    }
}

const chartAriaLabel = computed(() => {
    const titleText =
        FINAL_CONFIG.value.chart.title.text || 'Chart visualization';
    const subtitleText = FINAL_CONFIG.value.chart.title.subtitle.text || '';
    return `${titleText}. ${subtitleText}`;
});

const optimize = computed(() => {
    return {
        linePlot:
            maxSeries.value >
            FINAL_CONFIG.value.line.dot.hideAboveMaxSerieLength,
    };
});

const hasOptionsNoTitle = computed(() => {
    return (
        FINAL_CONFIG.value.chart.userOptions.show &&
        (!FINAL_CONFIG.value.chart.title.show ||
            !FINAL_CONFIG.value.chart.title.text)
    );
});

const highlightAreas = computed(() => {
    if (Array.isArray(FINAL_CONFIG.value.chart.highlightArea)) {
        return FINAL_CONFIG.value.chart.highlightArea.map((area) => {
            const areaTo = Math.min(area.to, maxX.value - 1);
            return {
                ...area,
                span:
                    area.from === areaTo
                        ? 1
                        : areaTo < area.from
                          ? 0
                          : areaTo - area.from + 1,
            };
        });
    }
    const area = {
        ...FINAL_CONFIG.value.chart.highlightArea,
        to: Math.min(FINAL_CONFIG.value.chart.highlightArea.to, maxX.value - 1),
    };
    return [
        {
            ...area,
            span:
                area.from === area.to
                    ? 1
                    : area.to < area.from
                      ? 0
                      : area.to - area.from + 1,
        },
    ];
});

const datasetWithIds = computed(() => {
    if (!useSafeValues.value) return FINAL_DATASET.value;
    return FINAL_DATASET.value.map((datapoint, i) => {
        return {
            ...datapoint,
            series: lttb(datapoint.series),
            id: `uniqueId_${i}`,
            color: convertColorToHex(
                datapoint.color
                    ? datapoint.color
                    : customPalette.value[i]
                      ? customPalette.value[i]
                      : palette[i],
            ),
        };
    });
});

const tableSparklineDataset = computed(() => {
    return relativeDataset.value.map((ds) => {
        const source = ds.absoluteValues.map((s) =>
            [undefined, null].includes(s) ? null : s,
        );
        return {
            id: ds.id,
            name: ds.name,
            color: ds.color,
            values: fillArray(maxSeries.value, source),
        };
    });
});

const tableSparklineConfig = computed(() => {
    return {
        responsiveBreakpoint: FINAL_CONFIG.value.table.responsiveBreakpoint,
        roundingValues: FINAL_CONFIG.value.table.rounding,
        showAverage: false,
        showMedian: false,
        showTotal: false,
        fontFamily: FINAL_CONFIG.value.chart.fontFamily,
        prefix: FINAL_CONFIG.value.chart.labels.prefix,
        suffix: FINAL_CONFIG.value.chart.labels.suffix,
        colNames: timeLabels.value.map((tl, i) =>
            FINAL_CONFIG.value.table.useDefaultTimeFormat
                ? tl.text
                : preciseTimeFormatter.value(
                      i + slicer.value.start,
                      FINAL_CONFIG.value.table.timeFormat,
                  ),
        ),
        thead: {
            backgroundColor: FINAL_CONFIG.value.table.th.backgroundColor,
            color: FINAL_CONFIG.value.table.th.color,
            outline: FINAL_CONFIG.value.table.th.outline,
        },
        tbody: {
            backgroundColor: FINAL_CONFIG.value.table.td.backgroundColor,
            color: FINAL_CONFIG.value.table.td.color,
            outline: FINAL_CONFIG.value.table.td.outline,
        },
        userOptions: {
            show: false,
        },
        sparkline: {
            animation: { show: false },
            cutNullValues: FINAL_CONFIG.value.line.cutNullValues,
        },
    };
});

const horizontalDatapointSpacing = computed(() => {
    const availableWidth = Math.max(0, drawingArea.value?.width || 0);
    if (FINAL_CONFIG.value.chart.grid.position === 'middle') {
        return safeDiv(availableWidth, Math.max(1, maxSeries.value), 1);
    }
    return safeDiv(availableWidth, Math.max(1, maxSeries.value - 1), 0);
});

const horizontalBandWidth = computed(() => {
    if (FINAL_CONFIG.value.chart.grid.position === 'middle') {
        return horizontalDatapointSpacing.value;
    }
    return maxSeries.value <= 1
        ? Math.max(0, drawingArea.value?.width || 0)
        : horizontalDatapointSpacing.value;
});

function getDatapointX(index) {
    const left = drawingArea.value?.left || 0;
    if (FINAL_CONFIG.value.chart.grid.position === 'middle') {
        return (
            left +
            horizontalDatapointSpacing.value / 2 +
            horizontalDatapointSpacing.value * index
        );
    }
    return left + horizontalDatapointSpacing.value * index;
}

function getHorizontalBandX(index) {
    const left = drawingArea.value?.left || 0;
    if (FINAL_CONFIG.value.chart.grid.position === 'middle') {
        return left + horizontalDatapointSpacing.value * index;
    }
    if (maxSeries.value <= 1) return left;
    return (
        left +
        horizontalDatapointSpacing.value * index -
        horizontalDatapointSpacing.value / 2
    );
}

function getClampedHorizontalBandX(index) {
    return Math.max(drawingArea.value?.left || 0, getHorizontalBandX(index));
}

// config.chart.highlightArea
function getHighlightAreaHorizontalBandWidth(index) {
    const left = drawingArea.value?.left || 0;
    const right = drawingArea.value?.right || 0;
    const rawBandX = getHorizontalBandX(index);
    const rawBandRight = rawBandX + horizontalBandWidth.value;
    const clampedBandX = Math.max(left, rawBandX);
    const clampedBandRight = Math.min(right, rawBandRight);
    return Math.max(0.00001, clampedBandRight - clampedBandX);
}

function getHoveredIndexFromSvgX(svgX) {
    const left = drawingArea.value?.left || 0;
    const right = drawingArea.value?.right || 0;
    const seriesCount = maxSeries.value;

    if (seriesCount <= 0) return null;
    if (svgX < left || svgX > right) return null;

    const spacing = horizontalDatapointSpacing.value;

    if (spacing <= 0) return 0;

    let index;

    if (FINAL_CONFIG.value.chart.grid.position === 'middle') {
        index = Math.ceil((svgX - left) / spacing) - 1;
    } else if (seriesCount <= 1) {
        index = 0;
    } else {
        index = Math.ceil((svgX - left) / spacing - 0.5);
    }

    if (index < 0) return 0;
    if (index >= seriesCount) return seriesCount - 1;

    return index;
}

// config.chart.highlighter
function getHighlighterHorizontalBandWidth(index) {
    const left = drawingArea.value?.left || 0;
    const right = drawingArea.value?.right || 0;
    const rawBandX = getHorizontalBandX(index);
    const rawBandRight = rawBandX + horizontalBandWidth.value;
    const clampedBandX = Math.max(left, rawBandX);
    const clampedBandRight = Math.min(right, rawBandRight);
    return Math.max(0.00001, clampedBandRight - clampedBandX);
}

function getHorizontalSpanWidth(span) {
    return Math.max(0.00001, horizontalBandWidth.value * span);
}

const activeSeriesWithStackRatios = computed(() => {
    return assignStackRatios(
        absoluteDataset.value.filter(
            (ds) => !segregatedSeriesSet.value.has(ds.id),
        ),
    );
});

const displaySeriesTypes = ['bar', 'line', 'plot'];

const activeDisplaySeriesWithStackRatios = computed(() => {
    return activeSeriesWithStackRatios.value.filter((s) =>
        displaySeriesTypes.includes(s.type),
    );
});

const activeDisplaySeriesCount = computed(() => {
    return activeDisplaySeriesWithStackRatios.value.length;
});

const activeBarSeriesWithStackRatios = computed(() => {
    return activeDisplaySeriesWithStackRatios.value.filter(
        (s) => s.type === 'bar',
    );
});

const activeLineSeriesWithStackRatios = computed(() => {
    return activeDisplaySeriesWithStackRatios.value.filter(
        (s) => s.type === 'line',
    );
});

const activePlotSeriesWithStackRatios = computed(() => {
    return activeDisplaySeriesWithStackRatios.value.filter(
        (s) => s.type === 'plot',
    );
});

const activeBarSeries = computed(() => {
    return safeDataset.value.filter(
        (s) => s.type === 'bar' && !segregatedSeriesSet.value.has(s.id),
    );
});

const activeBarSeriesCount = computed(() => {
    return activeBarSeries.value.length;
});

const activeBarSeriesCountWithFallback = computed(() => {
    return Math.max(1, activeBarSeriesCount.value);
});

const scaleGroups = computed(() => {
    const grouped = groupBy(
        activeSeriesWithStackRatios.value,
        (item) => item.scaleLabel,
    );

    const result = {};

    for (const [group, items] of Object.entries(grouped)) {
        let minimum = Infinity;
        let maximum = -Infinity;
        let hasValue = false;

        for (let itemIndex = 0; itemIndex < items.length; itemIndex += 1) {
            const values = items[itemIndex].absoluteValues || [];

            for (
                let valueIndex = 0;
                valueIndex < values.length;
                valueIndex += 1
            ) {
                const rawValue = values[valueIndex];
                const value = rawValue === null ? 0 : Number(rawValue);

                if (Number.isNaN(value)) {
                    minimum = NaN;
                    maximum = NaN;
                    hasValue = true;
                    break;
                }

                hasValue = true;

                if (value < minimum) {
                    minimum = value;
                }

                if (value > maximum) {
                    maximum = value;
                }
            }

            if (Number.isNaN(minimum) || Number.isNaN(maximum)) {
                break;
            }
        }

        result[group] = {
            min: hasValue ? minimum : 0,
            max: hasValue ? maximum : 1,
            groupId: createStableIdentifier('scale_group', [group]),
        };
    }

    return result;
});

const scaleGroupSeriesCounts = computed(() => {
    return activeSeriesWithStackRatios.value.reduce((acc, seriesItem) => {
        const scaleLabel = seriesItem.scaleLabel || '';
        acc[scaleLabel] = (acc[scaleLabel] || 0) + 1;
        return acc;
    }, {});
});

function createScaleGroupEntry({
    datapoint,
    scaleYLabels,
    autoScaleYLabels,
    zeroPosition,
    autoScaleZeroPosition,
    individualMax,
    autoScaleMax,
    yOffset,
    individualHeight,
}) {
    const scaleLabel = datapoint.scaleLabel || '';
    const baseScaleGroup = scaleGroups.value[scaleLabel] || {};

    return {
        ...baseScaleGroup,
        name: datapoint.name,
        groupName: scaleLabel,
        groupColor:
            FINAL_CONFIG.value.chart.grid.labels.yAxis.groupColor ||
            datapoint.color,
        color: datapoint.color,
        scaleYLabels: datapoint.autoScaling ? autoScaleYLabels : scaleYLabels,
        zeroPosition: datapoint.autoScaling
            ? autoScaleZeroPosition
            : zeroPosition,
        individualMax: datapoint.autoScaling ? autoScaleMax : individualMax,
        scaleLabel,
        id: datapoint.id,
        yOffset,
        individualHeight,
        autoScaleYLabels,
        unique: scaleGroupSeriesCounts.value[scaleLabel] === 1,
    };
}

const barSlot = computed(() => {
    return (
        drawingArea.value.width / maxSeries.value / activeBarSeriesCount.value -
        barPeriodGap.value * activeBarSeriesCount.value
    );
});

const barPeriodGap = computed(
    () => slot.value.line * FINAL_CONFIG.value.bar.periodGap,
);

const barWidth = computed(() => {
    return Math.max(
        0.00001,
        calcRectWidth() -
            (mutableConfig.value.useIndividualScale &&
            mutableConfig.value.isStacked
                ? 0
                : barPeriodGap.value),
    );
});

const barInnerGap = computed(
    () =>
        barWidth.value *
        Math.min(Math.abs(FINAL_CONFIG.value.bar.innerGap), 0.95),
);

const minimap = computed(() => {
    if (!FINAL_CONFIG.value.chart.zoom.minimap.show) return [];

    const sourceDataset = datasetWithIds.value.filter(
        (seriesItem) => !segregatedSeriesSet.value.has(seriesItem.id),
    );

    let maximumIndex = 0;

    for (
        let seriesIndex = 0;
        seriesIndex < sourceDataset.length;
        seriesIndex += 1
    ) {
        const seriesLength = sourceDataset[seriesIndex].series.length;

        if (seriesLength > maximumIndex) {
            maximumIndex = seriesLength;
        }
    }

    const sumAllSeries = [];

    for (let index = 0; index < maximumIndex; index += 1) {
        let sum = 0;

        for (
            let seriesIndex = 0;
            seriesIndex < sourceDataset.length;
            seriesIndex += 1
        ) {
            sum += sourceDataset[seriesIndex].series[index] || 0;
        }

        sumAllSeries.push(sum);
    }

    const range = scanMathMinMax(sumAllSeries, 0, 1);
    const minimum = range.min;

    return sumAllSeries.map((datapoint) => {
        return datapoint + (minimum < 0 ? Math.abs(minimum) : 0);
    });
});

const allMinimaps = computed(() => {
    if (!FINAL_CONFIG.value.chart.zoom.minimap.show) return [];
    const _source = datasetWithIds.value.map((ds) => {
        return {
            ...ds,
            isVisible: !segregatedSeriesSet.value.has(ds.id),
        };
    });

    return _source;
});

const selectedSeries = computed(() => {
    if (isContinuousScale.value) {
        return continuousTooltipSet.value.map((item) => {
            return {
                slotAbsoluteIndex: item.datapoint.slotAbsoluteIndex,
                shape:
                    item.datapoint.shape || item.datapoint.type === 'bar'
                        ? 'square'
                        : 'circle',
                name: item.datapoint.name,
                color: item.datapoint.color,
                type: item.datapoint.type,
                value: item.point.raw?.y ?? item.point.y,
                x: item.point.raw?.x ?? item.point.x,
                comments: item.datapoint.comments || [],
                prefix:
                    item.datapoint.prefix ||
                    FINAL_CONFIG.value.chart.labels.prefix,
                suffix:
                    item.datapoint.suffix ||
                    FINAL_CONFIG.value.chart.labels.suffix,
            };
        });
    }

    return relativeDataset.value.map((datapoint) => {
        return {
            slotAbsoluteIndex: datapoint.slotAbsoluteIndex,
            shape:
                datapoint.shape || datapoint.type === 'bar'
                    ? 'square'
                    : 'circle',
            name: datapoint.name,
            color: datapoint.color,
            type: datapoint.type,
            value: datapoint.absoluteValues.find(
                (_s, i) => i === selectedSerieIndex.value,
            ),
            comments: datapoint.comments || [],
            prefix: datapoint.prefix || FINAL_CONFIG.value.chart.labels.prefix,
            suffix: datapoint.suffix || FINAL_CONFIG.value.chart.labels.suffix,
        };
    });
});

const yLabels = computed(() => {
    return niceScale.value.ticks.map((t) => {
        const y =
            t >= 0
                ? zero.value - drawingArea.value.height * ratioToMax(t)
                : zero.value +
                  drawingArea.value.height * ratioToMax(Math.abs(t));

        return {
            y: isYAxisReversed.value
                ? drawingArea.value.top + drawingArea.value.bottom - y
                : y,
            value: t,
            prefix: FINAL_CONFIG.value.chart.labels.prefix,
            suffix: FINAL_CONFIG.value.chart.labels.suffix,
        };
    });
});

const annotationsY = computed(() => {
    const annotations = FINAL_CONFIG.value.chart.annotations;

    if (
        !annotations ||
        !Array.isArray(annotations) ||
        annotations.every((annotation) => !annotation.show)
    ) {
        return [];
    }

    const visibleAnnotations = annotations.filter((annotation) => {
        return (
            annotation.show &&
            (annotation.yAxis.yTop != null || annotation.yAxis.yBottom != null)
        );
    });

    if (!visibleAnnotations.length) {
        return [];
    }

    const { left, right } = drawingArea.value;
    const zeroY = zero.value;
    const height = drawingArea.value.height;
    const scaleMinimum = niceScale.value.min;
    const scaleMaximum = niceScale.value.max;
    const range = scaleMaximum - scaleMinimum;

    const toY = (value) => {
        const ratio = (value - 0) / range;
        return zeroY - ratio * height;
    };

    return visibleAnnotations.map((annotation, annotationIndex) => {
        const {
            yAxis: { yTop: rawTop, yBottom: rawBottom, label },
        } = annotation;

        const hasArea =
            rawTop != null && rawBottom != null && rawTop !== rawBottom;

        const yTop = rawTop == null ? null : toY(rawTop);
        const yBottom = rawBottom == null ? null : toY(rawBottom);

        const ctx = getTextMeasurer(label.fontSize);
        ctx.font = `${label.fontSize}px sans-serif`;

        const textWidth = ctx.measureText(label.text).width;
        const textHeight = label.fontSize;

        const xText =
            (label.position === 'start'
                ? left + label.padding?.left
                : right - label.padding?.right) + label.offsetX;

        const baselineY =
            yTop != null && yBottom != null
                ? Math.min(yTop, yBottom)
                : yTop != null
                  ? yTop
                  : yBottom;

        const yText =
            baselineY - label.fontSize / 3 + label.offsetY - label.padding?.top;

        let rectX;

        if (label.textAnchor === 'middle') {
            rectX = xText - textWidth / 2 - label.padding?.left;
        } else if (label.textAnchor === 'end') {
            rectX = xText - textWidth - label.padding?.right;
        } else {
            rectX = xText - label.padding?.left;
        }

        const rectY = yText - textHeight * 0.75 - label.padding?.top;
        const show = ![yTop, yBottom, rectY].includes(NaN);

        const id = createStableIdentifier('annotation_y', [
            annotationIndex,
            rawTop,
            rawBottom,
            label.text,
        ]);

        return {
            show,
            id,
            hasArea,
            areaHeight: hasArea ? Math.abs(yTop - yBottom) : 0,
            yTop,
            yBottom,
            config: annotation.yAxis,
            x1: left,
            x2: right,
            _text: {
                x: xText,
                y: yText,
            },
            _box: {
                x: rectX,
                y: rectY,
                width: textWidth + label.padding?.left + label.padding?.right,
                height: textHeight + label.padding?.top + label.padding?.bottom,
                fill: label.backgroundColor,
                stroke: label.border.stroke,
                rx: label.border.rx,
                ry: label.border.ry,
                strokeWidth: label.border.strokeWidth,
            },
        };
    });
});

function isPlotAlone(plotSeries, index) {
    const before = plotSeries[index - 1];
    const after = plotSeries[index + 1];

    let isAlone =
        (!!before && !!after && before.value == null && after.value == null) ||
        (!before && !!after && after.value == null) ||
        (!!before && !after && before.value == null);

    return (
        canShowValue(plotSeries[index].value) &&
        isAlone &&
        FINAL_CONFIG.value.line.cutNullValues
    );
}

function scanPointValueMinMax(dataset, fallbackMin = 0, fallbackMax = 1) {
    let minimum = Infinity;
    let maximum = -Infinity;
    let hasValue = false;

    for (let seriesIndex = 0; seriesIndex < dataset.length; seriesIndex += 1) {
        const seriesItem = dataset[seriesIndex];

        if (!Array.isArray(seriesItem.series)) {
            continue;
        }

        for (
            let pointIndex = 0;
            pointIndex < seriesItem.series.length;
            pointIndex += 1
        ) {
            const value = getValueFromPoint(seriesItem.series[pointIndex]);

            if (!Number.isFinite(value)) {
                continue;
            }

            hasValue = true;

            if (value < minimum) {
                minimum = value;
            }

            if (value > maximum) {
                maximum = value;
            }
        }
    }

    return hasValue
        ? {
              min: minimum,
              max: maximum,
          }
        : {
              min: fallbackMin,
              max: fallbackMax,
          };
}

function scanContinuousXMinMax(dataset, fallbackMin = 0, fallbackMax = 1) {
    let minimum = Infinity;
    let maximum = -Infinity;
    let hasValue = false;

    for (let seriesIndex = 0; seriesIndex < dataset.length; seriesIndex += 1) {
        const seriesItem = dataset[seriesIndex];

        if (!Array.isArray(seriesItem.series)) {
            continue;
        }

        for (
            let pointIndex = 0;
            pointIndex < seriesItem.series.length;
            pointIndex += 1
        ) {
            const point = seriesItem.series[pointIndex];

            if (!isCoordinatePoint(point)) {
                continue;
            }

            const value = Number(point.x);

            if (!Number.isFinite(value)) {
                continue;
            }

            hasValue = true;

            if (value < minimum) {
                minimum = value;
            }

            if (value > maximum) {
                maximum = value;
            }
        }
    }

    if (!hasValue) {
        return {
            min: fallbackMin,
            max: fallbackMax,
        };
    }

    return {
        min: minimum,
        max: minimum === maximum ? maximum + 1 : maximum,
    };
}

function scanMathMinMax(values, fallbackMinimum = 0, fallbackMaximum = 1) {
    if (!Array.isArray(values) || values.length === 0) {
        return {
            min: fallbackMinimum,
            max: fallbackMaximum,
        };
    }

    let minimum = Infinity;
    let maximum = -Infinity;

    for (let index = 0; index < values.length; index += 1) {
        const rawValue = values[index];
        const value = rawValue === null ? 0 : Number(rawValue);

        if (Number.isNaN(value)) {
            return {
                min: NaN,
                max: NaN,
            };
        }

        if (value < minimum) {
            minimum = value;
        }

        if (value > maximum) {
            maximum = value;
        }
    }

    return {
        min: minimum,
        max: maximum,
    };
}

function createStableStringHash(value) {
    const source = String(value ?? '');
    let hash = 0;

    for (let index = 0; index < source.length; index += 1) {
        hash = (hash << 5) - hash + source.charCodeAt(index);
        hash |= 0;
    }

    return Math.abs(hash).toString(36);
}

function createStableIdentifier(prefix, parts) {
    return `${prefix}_${createStableStringHash(parts.join('|'))}`;
}

function getLinePathTransition() {
    return loading.value ||
        disableShapeTransitionForRangeResize.value ||
        !FINAL_CONFIG.value.line.showTransition
        ? undefined
        : `all ${FINAL_CONFIG.value.line.transitionDurationMs}ms ease-in-out`;
}

/******************************************************************************************/
/                                 DATAPOINTS COMPUTING                                     /;
/******************************************************************************************/

const continuousXRange = computed(() => {
    return scanContinuousXMinMax(safeDataset.value, 0, 1);
});

const continuousXNiceScale = computed(() => {
    const steps = FINAL_CONFIG.value.chart.grid.labels.xAxis.commonScaleSteps;

    const customScaleMin = FINAL_CONFIG.value.chart.grid.labels.xAxis.scaleMin;
    const customScaleMax = FINAL_CONFIG.value.chart.grid.labels.xAxis.scaleMax;

    const min =
        customScaleMin !== null && Number.isFinite(Number(customScaleMin))
            ? Number(customScaleMin)
            : continuousXRange.value.min;

    const max =
        customScaleMax !== null && Number.isFinite(Number(customScaleMax))
            ? Number(customScaleMax)
            : continuousXRange.value.max;

    const scale = FINAL_CONFIG.value.chart.grid.labels.xAxis.useNiceScale
        ? calculateNiceScale(min, max, steps)
        : calculateNiceScaleWithExactExtremes(min, max, steps);

    if (FINAL_CONFIG.value.chart.grid.position !== 'start') {
        return scale;
    }

    const spacing =
        scale.ticks.length > 1 ? scale.ticks[1] - scale.ticks[0] : 1;

    return {
        ...scale,
        max: scale.max + spacing,
    };
});

const continuousXLabels = computed(() => {
    if (!isContinuousScale.value) {
        return displayedTimeLabels.value;
    }

    const ticks = isXAxisReversed.value
        ? [...continuousXNiceScale.value.ticks].reverse()
        : [...continuousXNiceScale.value.ticks];

    return ticks.map((tick, index) => {
        return {
            id: `continuous_x_label_${index}`,
            text: applyDataLabel(
                FINAL_CONFIG.value.chart.grid.labels.xAxis.formatter,
                tick,
                dataLabel({
                    v: tick,
                    s: FINAL_CONFIG.value.chart.labels.prefix,
                    p: FINAL_CONFIG.value.chart.labels.suffix,
                    r: FINAL_CONFIG.value.chart.grid.labels.xAxis.rounding,
                }),
                {
                    datapoint: tick,
                    seriesIndex: index,
                },
            ),
            value: tick,
            x: getContinuousX({ x: tick }),
            index,
        };
    });
});

function getXAxisLabelX(label, index) {
    return isContinuousScale.value ? label.x : getDatapointX(index);
}

function getContinuousX({ x }) {
    const range =
        continuousXNiceScale.value.max - continuousXNiceScale.value.min || 1;

    const ratio = (x - continuousXNiceScale.value.min) / range;

    const finalRatio = applyXAxisReverseRatio(ratio);

    return drawingArea.value.left + drawingArea.value.width * finalRatio;
}

const continuousFullXRange = computed(() => {
    return scanContinuousXMinMax(FINAL_DATASET.value, 0, 1);
});

const slicerMin = computed(() => {
    return isContinuousScale.value ? continuousFullXRange.value.min : 0;
});

const slicerMax = computed(() => {
    return isContinuousScale.value
        ? continuousFullXRange.value.max
        : maxX.value;
});

function getPointX(point, index) {
    if (isContinuousScale.value) {
        if (point.x == null || point.y == null) return null;
        return getContinuousX(point);
    }
    return getDatapointX(index);
}

function getDatasetXValue(point) {
    if (!isContinuousScale.value || !point) {
        return null;
    }
    return point.x ?? null;
}

function getSerieVerticalGeometry({
    datapoint,
    totalSeries,
    gap,
    usableHeight,
    autoScaleValueMin,
    autoScaleValueMax,
    individualExtremes,
    forceExactScale = false,
}) {
    const scaleSteps =
        datapoint.scaleSteps ||
        FINAL_CONFIG.value.chart.grid.labels.yAxis.commonScaleSteps;
    const corrector = 1.0000001;

    const scaleBuilder =
        forceExactScale ||
        !FINAL_CONFIG.value.chart.grid.labels.yAxis.useNiceScale
            ? calculateNiceScaleWithExactExtremes
            : calculateNiceScale;

    const safeIndividualMax =
        individualExtremes.max === individualExtremes.min
            ? individualExtremes.max * corrector
            : individualExtremes.max;

    const safeAutoScaleMax =
        autoScaleValueMax === autoScaleValueMin
            ? autoScaleValueMax * corrector
            : autoScaleValueMax;

    const individualScale = scaleBuilder(
        individualExtremes.min,
        safeIndividualMax,
        scaleSteps,
    );

    const autoScaleSteps = scaleBuilder(
        autoScaleValueMin,
        safeAutoScaleMax,
        scaleSteps,
    );

    const individualZero =
        individualScale.min >= 0 ? 0 : Math.abs(individualScale.min);
    const autoScaleZero = 0;

    const individualMax = individualScale.max + Math.abs(individualZero);
    const autoScaleMax = autoScaleSteps.max + Math.abs(autoScaleZero);

    const origIdx = datapoint.stackIndex;
    const flippedIdx = totalSeries - 1 - origIdx;
    const flippedLowerRatio = mutableConfig.value.isStacked
        ? 1 - datapoint.cumulatedStackRatio
        : 0;
    const yOffset = mutableConfig.value.isStacked
        ? usableHeight * flippedLowerRatio + gap * flippedIdx
        : 0;
    const individualHeight = mutableConfig.value.isStacked
        ? usableHeight * datapoint.stackRatio
        : drawingArea.value.height;

    const zeroPosition =
        drawingArea.value?.bottom -
        yOffset -
        (individualHeight * individualZero) / individualMax;
    const autoScaleZeroPosition =
        drawingArea.value?.bottom -
        yOffset -
        (individualHeight * autoScaleZero) / autoScaleMax;

    return {
        scaleSteps,
        individualScale,
        autoScaleSteps,
        individualZero,
        autoScaleZero,
        individualMax,
        autoScaleMax,
        yOffset,
        individualHeight,
        zeroPosition,
        autoScaleZeroPosition,
    };
}

function createAutoScaleContext({
    datapoint,
    clampNegativeAutoScaleMaximum = false,
}) {
    const scaleGroup = scaleGroups.value[datapoint.scaleLabel];
    const scaleMinimum = scaleGroup.min;
    const scaleMaximum = scaleGroup.max;

    const ratios = datapoint.absoluteValues
        .filter((value) => ![null, undefined].includes(value))
        .map((value) => {
            return (value - scaleMinimum) / (scaleMaximum - scaleMinimum);
        });

    return {
        ratios,
        valueMin: scaleMinimum,
        valueMax:
            clampNegativeAutoScaleMaximum && scaleMaximum < 0
                ? 0
                : scaleMaximum,
    };
}

function createIndividualExtremes({
    datapoint,
    filterMinimumValues = false,
    preserveLooseMinimumExpression = false,
}) {
    const maximumRange = scanMathMinMax(datapoint.absoluteValues, 0, 1);

    const minimumValues = filterMinimumValues
        ? datapoint.absoluteValues.filter(
              (value) => ![null, undefined].includes(value),
          )
        : datapoint.absoluteValues;

    const minimumRange = scanMathMinMax(minimumValues, 0, 1);
    const minimum = minimumRange.min;

    return {
        max: datapoint.scaleMax || maximumRange.max || 1,
        min: preserveLooseMinimumExpression
            ? datapoint.scaleMin || minimum > 0
                ? 0
                : minimum
            : datapoint.scaleMin || (minimum > 0 ? 0 : minimum),
    };
}

function createAutoScaleRatiosToNiceScale({ values, autoScaleSteps }) {
    return values.map((value) => {
        if (autoScaleSteps.min >= 0) {
            return (
                (value - Math.abs(autoScaleSteps.min)) /
                (autoScaleSteps.max - Math.abs(autoScaleSteps.min))
            );
        }

        return (
            (value + Math.abs(autoScaleSteps.min)) /
            (autoScaleSteps.max + Math.abs(autoScaleSteps.min))
        );
    });
}

function createIndividualScaleYLabels({
    datapoint,
    individualScale,
    yOffset,
    individualHeight,
}) {
    return individualScale.ticks.map((tick) => {
        return {
            y: getYFromScaleValue({
                value: tick,
                scaleMin: individualScale.min,
                scaleMax: individualScale.max,
                yOffset,
                individualHeight,
            }),
            value: tick,
            prefix: datapoint.prefix || FINAL_CONFIG.value.chart.labels.prefix,
            suffix: datapoint.suffix || FINAL_CONFIG.value.chart.labels.suffix,
            datapoint,
        };
    });
}

function createAutoScaleYLabels({
    datapoint,
    autoScaleSteps,
    yOffset,
    individualHeight,
}) {
    return autoScaleSteps.ticks.map((tick) => {
        const ratio =
            (tick - autoScaleSteps.min) /
            (autoScaleSteps.max - autoScaleSteps.min || 1);

        return {
            y: getYFromRatio({
                ratio,
                yOffset,
                individualHeight,
            }),
            value: tick,
            prefix: datapoint.prefix || FINAL_CONFIG.value.chart.labels.prefix,
            suffix: datapoint.suffix || FINAL_CONFIG.value.chart.labels.suffix,
            datapoint,
        };
    });
}

function createSeriesVerticalContext({
    datapoint,
    totalSeries,
    gap,
    usableHeight,
    forceExactScale = false,
    clampNegativeAutoScaleMaximum = false,
    filterMinimumValues = false,
    preserveLooseMinimumExpression = false,
}) {
    checkAutoScaleError(datapoint);

    const autoScale = createAutoScaleContext({
        datapoint,
        clampNegativeAutoScaleMaximum,
    });

    const individualExtremes = createIndividualExtremes({
        datapoint,
        filterMinimumValues,
        preserveLooseMinimumExpression,
    });

    const geometry = getSerieVerticalGeometry({
        datapoint,
        totalSeries,
        gap,
        usableHeight,
        autoScaleValueMin: autoScale.valueMin,
        autoScaleValueMax: autoScale.valueMax,
        individualExtremes,
        forceExactScale,
    });

    const scaleYLabels = createIndividualScaleYLabels({
        datapoint,
        individualScale: geometry.individualScale,
        yOffset: geometry.yOffset,
        individualHeight: geometry.individualHeight,
    });

    const autoScaleYLabels = createAutoScaleYLabels({
        datapoint,
        autoScaleSteps: geometry.autoScaleSteps,
        yOffset: geometry.yOffset,
        individualHeight: geometry.individualHeight,
    });

    const autoScaleRatiosToNiceScale = createAutoScaleRatiosToNiceScale({
        values: datapoint.absoluteValues,
        autoScaleSteps: geometry.autoScaleSteps,
    });

    return {
        autoScale,
        individualExtremes,
        scaleYLabels,
        autoScaleYLabels,
        autoScaleRatiosToNiceScale,
        ...geometry,
    };
}

function getSlicedComments(comments) {
    if (!Array.isArray(comments)) return [];
    return comments.slice(slicer.value.start, slicer.value.end);
}

function getSlicedComment(comments, index) {
    if (!Array.isArray(comments)) return '';
    return comments[index + slicer.value.start] || '';
}

const barSet = computed(() => {
    const totalSeries = activeDisplaySeriesCount.value;
    const gap = FINAL_CONFIG.value.chart.grid.labels.yAxis.gap;
    const stacked = mutableConfig.value.isStacked;
    const totalGap = stacked ? gap * (totalSeries - 1) : 0;
    const usableHeight = drawingArea.value.height - totalGap;

    return activeBarSeriesWithStackRatios.value.map((datapoint, i) => {
        const {
            individualScale,
            autoScaleSteps,
            individualZero,
            individualMax,
            autoScaleMax,
            yOffset,
            individualHeight,
            zeroPosition,
            autoScaleZeroPosition,
            scaleYLabels,
            autoScaleYLabels,
            autoScaleRatiosToNiceScale,
        } = createSeriesVerticalContext({
            datapoint,
            totalSeries,
            gap,
            usableHeight,
            clampNegativeAutoScaleMaximum: true,
            filterMinimumValues: true,
            preserveLooseMinimumExpression: true,
        });

        const barLen = activeBarSeriesCount.value;

        const comments = getSlicedComments(datapoint.comments);

        const plots = datapoint.series.map((plot, j) => {
            const yRatio = mutableConfig.value.useIndividualScale
                ? (datapoint.absoluteValues[j] + individualZero) / individualMax
                : ratioToMax(plot);
            const x =
                mutableConfig.value.useIndividualScale &&
                mutableConfig.value.isStacked
                    ? drawingArea.value?.left +
                      (drawingArea.value.width / maxSeries.value) * j
                    : drawingArea.value?.left +
                      slot.value.bar * i +
                      slot.value.bar * j * barLen -
                      barSlot.value / 2 -
                      i * barPeriodGap.value;

            return {
                yOffset: checkNaN(yOffset),
                individualHeight: checkNaN(individualHeight),
                x: checkNaN(x),
                y: getYFromRatio({
                    ratio: yRatio,
                    yOffset,
                    individualHeight,
                }),
                value: datapoint.absoluteValues[j],
                zeroPosition: checkNaN(zeroPosition),
                individualMax: checkNaN(individualMax),
                comment: comments[j] || '',
            };
        });

        const autoScalePlots = datapoint.series.map((_, j) => {
            const x =
                mutableConfig.value.useIndividualScale &&
                mutableConfig.value.isStacked
                    ? drawingArea.value?.left +
                      (drawingArea.value.width / maxSeries.value) * j
                    : drawingArea.value?.left -
                      slot.value.bar / 2 +
                      slot.value.bar * i +
                      slot.value.bar *
                          j *
                          absoluteDataset.value
                              .filter((ds) => ds.type === 'bar')
                              .filter(
                                  (s) => !segregatedSeriesSet.value.has(s.id),
                              ).length;
            return {
                yOffset: checkNaN(yOffset),
                individualHeight: checkNaN(individualHeight),
                x: checkNaN(x),
                y: checkNaN(
                    getYFromRatio({
                        ratio: autoScaleRatiosToNiceScale[j] || 0,
                        yOffset: checkNaN(yOffset),
                        individualHeight: checkNaN(individualHeight),
                    }),
                ),
                value: datapoint.absoluteValues[j],
                zeroPosition: checkNaN(zeroPosition),
                individualMax: checkNaN(individualMax),
                comment: comments[j] || '',
            };
        });

        const scaleGroup = createScaleGroupEntry({
            datapoint,
            scaleYLabels,
            autoScaleYLabels,
            zeroPosition,
            autoScaleZeroPosition,
            individualMax,
            autoScaleMax,
            yOffset,
            individualHeight,
        });

        return {
            ...datapoint,
            yOffset,
            autoScaleYLabels,
            individualHeight,
            scaleYLabels: datapoint.autoScaling
                ? autoScaleYLabels
                : scaleYLabels,
            individualScale: datapoint.autoScaling
                ? autoScaleSteps
                : individualScale,
            individualMax: datapoint.autoScaling ? autoScaleMax : individualMax,
            zeroPosition: datapoint.autoScaling
                ? autoScaleZeroPosition
                : zeroPosition,
            plots: datapoint.autoScaling ? autoScalePlots : plots,
            scaleGroup,
            groupId: scaleGroup.groupId,
        };
    });
});

const lineSet = computed(() => {
    const totalSeries = activeDisplaySeriesCount.value;
    const gap = FINAL_CONFIG.value.chart.grid.labels.yAxis.gap;
    const stacked = mutableConfig.value.isStacked;
    const totalGap = stacked ? gap * (totalSeries - 1) : 0;
    const usableHeight = drawingArea.value.height - totalGap;

    return activeLineSeriesWithStackRatios.value.map((datapoint, i) => {
        const {
            individualScale,
            autoScaleSteps,
            individualZero,
            individualMax,
            autoScaleMax,
            yOffset,
            individualHeight,
            zeroPosition,
            autoScaleZeroPosition,
            scaleYLabels,
            autoScaleYLabels,
            autoScaleRatiosToNiceScale,
        } = createSeriesVerticalContext({
            datapoint,
            totalSeries,
            gap,
            usableHeight,
        });

        const comments = getSlicedComments(datapoint.comments);

        const plots = datapoint.series.map((plot, j) => {
            if (isContinuousScale.value && (plot.x == null || plot.y == null)) {
                return {
                    index: j,
                    x: null,
                    y: null,
                    value: null,
                    datasetXValue: getDatasetXValue(plot),
                    comment: datapoint.comments
                        ? datapoint.comments.slice(
                              slicer.value.start,
                              slicer.value.end,
                          )[j] || ''
                        : '',
                };
            }
            const yRatio = mutableConfig.value.useIndividualScale
                ? (datapoint.absoluteValues[j] + Math.abs(individualZero)) /
                  individualMax
                : ratioToMax(getValueFromPoint(plot));

            return {
                index: j,
                x: checkNaN(getPointX(plot, j)),
                datasetXValue: getDatasetXValue(plot),
                y: checkNaN(
                    getYFromRatio({
                        ratio: yRatio,
                        yOffset,
                        individualHeight,
                    }),
                ),
                value: datapoint.absoluteValues[j],
                comment: comments[j] || '',
            };
        });

        const autoScalePlots = datapoint.series.map((plot, j) => {
            if (
                isContinuousScale.value &&
                (plot.x === null || plot.y === null)
            ) {
                return {
                    index: j,
                    x: null,
                    y: null,
                    datasetXValue: getDatasetXValue(plot),
                    value: null,
                    comment: comments[j] || '',
                };
            }

            if (![undefined, null].includes(datapoint.absoluteValues[j])) {
                return {
                    index: j,
                    x: checkNaN(getPointX(plot, j)),
                    datasetXValue: getDatasetXValue(plot),
                    y: checkNaN(
                        getYFromRatio({
                            ratio: autoScaleRatiosToNiceScale[j] || 0,
                            yOffset,
                            individualHeight,
                        }),
                    ),
                    value: datapoint.absoluteValues[j],
                    comment: comments[j] || '',
                };
            } else {
                return {
                    index: j,
                    x: checkNaN(getPointX(plot, j)),
                    y: zeroPosition,
                    value: datapoint.absoluteValues[j],
                    comment: comments[j] || '',
                };
            }
        });

        const hasDashedSegments =
            datapoint.dashIndices &&
            Array.isArray(datapoint.dashIndices) &&
            datapoint?.dashIndices?.length > 0;

        const curve = FINAL_CONFIG.value.line.cutNullValues
            ? createSmoothPathWithCuts(plots)
            : createSmoothPath(plots.filter((p) => p.value !== null));

        const autoScaleCurve = FINAL_CONFIG.value.line.cutNullValues
            ? createSmoothPathWithCuts(autoScalePlots)
            : createSmoothPath(autoScalePlots.filter((p) => p.value !== null));

        const straight = FINAL_CONFIG.value.line.cutNullValues
            ? createStraightPathWithCuts(plots)
            : createStraightPath(plots.filter((p) => p.value !== null));

        const autoScaleStraight = FINAL_CONFIG.value.line.cutNullValues
            ? createStraightPathWithCuts(autoScalePlots)
            : createStraightPath(
                  autoScalePlots.filter((p) => p.value !== null),
              );

        const stepper = createStepperPath(
            FINAL_CONFIG.value.line.cutNullValues
                ? plots
                : plots.filter((p) => p.value !== null),
        );

        const autoScaleStepper = createStepperPath(
            FINAL_CONFIG.value.line.cutNullValues
                ? autoScalePlots
                : autoScalePlots.filter((p) => p.value !== null),
        );

        const dashedStraight = hasDashedSegments
            ? createStraightPathWithCutsSegments(
                  FINAL_CONFIG.value.line.cutNullValues
                      ? plots
                      : plots.filter((p) => p.value !== null),
                  datapoint.dashIndices.map((_) => _ - slicer.value.start),
              )
            : [];
        const dashedSmooth = hasDashedSegments
            ? createSmoothPathWithCutsSegments(
                  FINAL_CONFIG.value.line.cutNullValues
                      ? plots
                      : plots.filter((p) => p.value !== null),
                  datapoint.dashIndices.map((_) => _ - slicer.value.start),
              )
            : [];

        const scaleGroup = createScaleGroupEntry({
            datapoint,
            scaleYLabels,
            autoScaleYLabels,
            zeroPosition,
            autoScaleZeroPosition,
            individualMax,
            autoScaleMax,
            yOffset,
            individualHeight,
        });

        const areaZeroPosition = mutableConfig.value.useIndividualScale
            ? datapoint.autoScaling
                ? autoScaleZeroPosition
                : zeroPosition
            : globalAreaBaselineY.value;

        const adustedAreaZeroPosition = Math.max(
            Math.max(
                datapoint.autoScaling
                    ? autoScaleZeroPosition
                    : scaleYLabels.at(-1)
                      ? scaleYLabels.at(-1).y
                      : 0,
                drawingArea.value?.top,
            ),
            areaZeroPosition,
        );

        const stepperAreaPlots = datapoint.autoScaling ? autoScalePlots : plots;

        const stepperAreaPlotsWithNullPolicy = FINAL_CONFIG.value.line
            .cutNullValues
            ? stepperAreaPlots
            : stepperAreaPlots.filter((p) => p.value !== null);

        const visibleValues = datapoint.absoluteValues.filter(
            (value) => ![null, undefined, NaN].includes(value),
        );

        const isFlatTemperatureLine =
            !!datapoint.temperatureColors && new Set(visibleValues).size <= 1;

        return {
            ...datapoint,
            isFlatTemperatureLine,
            temperatureColors: datapoint.temperatureColors
                ? datapoint.temperatureColors.map((c) => convertColorToHex(c))
                : null,
            yOffset,
            autoScaleYLabels,
            individualHeight,
            scaleYLabels: datapoint.autoScaling
                ? autoScaleYLabels
                : scaleYLabels,
            individualScale: datapoint.autoScaling
                ? autoScaleSteps
                : individualScale,
            individualMax: datapoint.autoScaling ? autoScaleMax : individualMax,
            zeroPosition: datapoint.autoScaling
                ? autoScaleZeroPosition
                : zeroPosition,
            curve: datapoint.useStepper
                ? datapoint.autoScaling
                    ? autoScaleStepper
                    : stepper
                : datapoint.autoScaling
                  ? autoScaleCurve
                  : curve,
            plots: datapoint.autoScaling ? autoScalePlots : plots,
            dashedStraight,
            dashedSmooth,
            hasDashedSegments,
            area: !datapoint.useArea
                ? ''
                : datapoint.useStepper
                  ? createStepperPath(
                        stepperAreaPlotsWithNullPolicy,
                        adustedAreaZeroPosition,
                    )
                  : mutableConfig.value.useIndividualScale
                    ? FINAL_CONFIG.value.line.cutNullValues
                        ? createIndividualAreaWithCuts(
                              datapoint.autoScaling ? autoScalePlots : plots,
                              adustedAreaZeroPosition,
                          )
                        : createIndividualArea(
                              datapoint.autoScaling
                                  ? autoScalePlots.filter(
                                        (p) => p.value !== null,
                                    )
                                  : plots.filter((p) => p.value !== null),
                              adustedAreaZeroPosition,
                          )
                    : FINAL_CONFIG.value.line.cutNullValues
                      ? createIndividualAreaWithCuts(
                            plots,
                            adustedAreaZeroPosition,
                        )
                      : createIndividualArea(
                            plots.filter((p) => p.value !== null),
                            adustedAreaZeroPosition,
                        ),
            curveAreas: !datapoint.useArea
                ? []
                : datapoint.useStepper
                  ? createStepperPath(
                        stepperAreaPlotsWithNullPolicy,
                        adustedAreaZeroPosition,
                    )
                        .split(';')
                        .filter(Boolean)
                        .map((d) => `M${d}Z`)
                  : createSmoothAreaSegments(
                        datapoint.autoScaling
                            ? FINAL_CONFIG.value.line.cutNullValues
                                ? autoScalePlots
                                : autoScalePlots.filter((p) => p.value !== null)
                            : FINAL_CONFIG.value.line.cutNullValues
                              ? plots
                              : plots.filter((p) => p.value !== null),
                        adustedAreaZeroPosition,
                        FINAL_CONFIG.value.line.cutNullValues,
                    ),
            straight: datapoint.useStepper
                ? datapoint.autoScaling
                    ? autoScaleStepper
                    : stepper
                : datapoint.autoScaling
                  ? autoScaleStraight
                  : straight,
            scaleGroup,
            groupId: scaleGroup.groupId,
        };
    });
});

const plotSet = computed(() => {
    const totalSeries = activeDisplaySeriesCount.value;
    const gap = FINAL_CONFIG.value.chart.grid.labels.yAxis.gap;
    const stacked = mutableConfig.value.isStacked;
    const totalGap = stacked ? gap * (totalSeries - 1) : 0;
    const usableHeight = drawingArea.value.height - totalGap;

    return activePlotSeriesWithStackRatios.value.map((datapoint) => {
        const {
            individualScale,
            autoScaleSteps,
            individualZero,
            individualMax,
            autoScaleMax,
            yOffset,
            individualHeight,
            zeroPosition,
            autoScaleZeroPosition,
            scaleYLabels,
            autoScaleYLabels,
            autoScaleRatiosToNiceScale,
        } = createSeriesVerticalContext({
            datapoint,
            totalSeries,
            gap,
            usableHeight,
            forceExactScale: true,
            preserveLooseMinimumExpression: true,
        });

        const comments = getSlicedComments(datapoint.comments);

        const plots = datapoint.series.map((plot, j) => {
            if (isContinuousScale.value && (plot.x == null || plot.y == null)) {
                return {
                    index: j,
                    x: null,
                    datasetXValue: getDatasetXValue(plot),
                    y: null,
                    value: null,
                    comment: comments[j] || '',
                };
            }

            const yRatio = mutableConfig.value.useIndividualScale
                ? (datapoint.absoluteValues[j] + Math.abs(individualZero)) /
                  individualMax
                : ratioToMax(getValueFromPoint(plot));
            return {
                index: j,
                x: checkNaN(getPointX(plot, j)),
                datasetXValue: getDatasetXValue(plot),
                y: checkNaN(
                    getYFromRatio({
                        ratio: yRatio,
                        yOffset,
                        individualHeight,
                    }),
                ),
                value: datapoint.absoluteValues[j],
                comment: comments[j] || '',
            };
        });

        const autoScalePlots = datapoint.series.map((plot, j) => {
            if (
                isContinuousScale.value &&
                (plot.x === null || plot.y === null)
            ) {
                return {
                    index: j,
                    x: null,
                    datasetXValue: getDatasetXValue(plot),
                    y: null,
                    value: null,
                    comment: comments[j] || '',
                };
            }

            return {
                index: j,
                x: checkNaN(getPointX(plot, j)),
                datasetXValue: getDatasetXValue(plot),
                y: checkNaN(
                    getYFromRatio({
                        ratio: autoScaleRatiosToNiceScale[j] || 0,
                        yOffset,
                        individualHeight,
                    }),
                ),
                value: datapoint.absoluteValues[j],
                comment: comments[j] || '',
            };
        });

        const scaleGroup = createScaleGroupEntry({
            datapoint,
            scaleYLabels,
            autoScaleYLabels,
            zeroPosition,
            autoScaleZeroPosition,
            individualMax,
            autoScaleMax,
            yOffset,
            individualHeight,
        });

        return {
            ...datapoint,
            yOffset,
            autoScaleYLabels,
            individualHeight,
            scaleYLabels: datapoint.autoScaling
                ? autoScaleYLabels
                : scaleYLabels,
            individualScale: datapoint.autoScaling
                ? autoScaleSteps
                : individualScale,
            individualMax: datapoint.autoScaling ? autoScaleMax : individualMax,
            zeroPosition: datapoint.autoScaling
                ? autoScaleZeroPosition
                : zeroPosition,
            plots: datapoint.autoScaling ? autoScalePlots : plots,
            scaleGroup,
            groupId: scaleGroup.groupId,
        };
    });
});

const hydratedScaleGroups = computed(() => {
    const result = Object.entries(scaleGroups.value).reduce(
        (acc, [scaleLabel, scaleGroup]) => {
            acc[scaleLabel] = {
                ...scaleGroup,
                scaleLabel,
            };

            return acc;
        },
        {},
    );

    [...lineSet.value, ...barSet.value, ...plotSet.value].forEach(
        (seriesItem) => {
            if (!seriesItem.scaleGroup) return;
            result[seriesItem.scaleLabel || ''] = {
                ...result[seriesItem.scaleLabel || ''],
                ...seriesItem.scaleGroup,
            };
        },
    );

    return result;
});

const allScales = computed(() => {
    const lines = lineSet.value.map((l) => {
        return {
            name: l.name,
            color: l.color,
            scale: l.individualScale,
            scaleYLabels: l.scaleYLabels,
            zero: l.zeroPosition,
            max: l.individualMax,
            scaleLabel: l.scaleLabel || '',
            id: l.id,
            yOffset: l.yOffset || 0,
            individualHeight: l.individualHeight || drawingArea.value.height,
            autoScaleYLabels: l.autoScaleYLabels,
        };
    });
    const bars = barSet.value.map((b) => {
        return {
            name: b.name,
            color: b.color,
            scale: b.individualScale,
            scaleYLabels: b.scaleYLabels,
            zero: b.zeroPosition,
            max: b.individualMax,
            scaleLabel: b.scaleLabel || '',
            id: b.id,
            yOffset: b.yOffset || 0,
            individualHeight: b.individualHeight || drawingArea.value.height,
        };
    });
    const plots = plotSet.value.map((p) => {
        return {
            name: p.name,
            color: p.color,
            scale: p.individualScale,
            scaleYLabels: p.scaleYLabels, // FIX
            zero: p.zeroPosition,
            max: p.individualMax,
            scaleLabel: p.scaleLabel || '',
            id: p.id,
            yOffset: p.yOffset || 0,
            individualHeight: p.individualHeight || drawingArea.value.height,
        };
    });

    const _source =
        mutableConfig.value.useIndividualScale && !mutableConfig.value.isStacked
            ? Object.values(hydratedScaleGroups.value)
            : [...lines, ...bars, ...plots];

    const len = _source.flatMap((el) => el).length;

    return _source.flatMap((el, i) => {
        let x = 0;
        x = mutableConfig.value.isStacked
            ? yAxisLabelsAreRight.value
                ? drawingArea.value?.right
                : drawingArea.value?.left
            : yAxisLabelsAreRight.value
              ? drawingArea.value?.right + getIndividualScaleSlotWidth() * i
              : (drawingArea.value?.left / len) * (i + 1);

        const name =
            mutableConfig.value.useIndividualScale &&
            !mutableConfig.value.isStacked
                ? el.unique
                    ? el.name
                    : el.groupName
                : el.name;

        return {
            unique: el.unique,
            id: el.id,
            groupId: el.groupId,
            scaleLabel: el.scaleLabel,
            name: applyDataLabel(
                FINAL_CONFIG.value.chart.grid.labels.yAxis.serieNameFormatter,
                name,
                name,
                el,
            ),
            color:
                mutableConfig.value.useIndividualScale &&
                !mutableConfig.value.isStacked
                    ? el.unique
                        ? el.color
                        : el.groupColor
                    : el.color,
            scale: el.scale,
            yOffset: el.yOffset,
            individualHeight: el.individualHeight,
            x,
            yLabels:
                el.scaleYLabels ||
                el.scale.ticks.map((t) => {
                    return {
                        y: getYFromScaleValue({
                            value: t,
                            scaleMin: el.scale.min,
                            scaleMax: el.scale.max,
                            yOffset: el.yOffset || 0,
                            individualHeight: el.individualHeight,
                        }),
                        value: t,
                    };
                }),
        };
    });
});

const interLineAreas = computed(() => {
    const il = FINAL_CONFIG.value.line.interLine || {};
    const pairs = il.pairs || [];
    const colors = il.colors || [];

    if (!pairs.length) return [];

    const out = [];
    pairs.forEach((pair, i) => {
        const [nameA, nameB] = Array.isArray(pair) ? pair : [pair.a, pair.b];
        if (!nameA || !nameB) return;

        const A = lineSet.value.find((s) => s.name === nameA);
        const B = lineSet.value.find((s) => s.name === nameB);
        if (!A || !B || A.type !== 'line' || B.type !== 'line') return;

        const colorLineA = colors?.[i]?.[0] ?? A.color;
        const colorLineB = colors?.[i]?.[1] ?? B.color;

        const areas = buildInterLineAreas({
            lineA: A.plots,
            lineB: B.plots,
            smoothA: !!A.smooth,
            smoothB: !!B.smooth,
            stepperA: !!A.useStepper,
            stepperB: !!B.useStepper,
            colorLineA,
            colorLineB,
            sampleStepPx: 2,
            cutNullValues: FINAL_CONFIG.value.line.cutNullValues,
        });

        areas.forEach((a, j) => {
            out.push({ ...a, key: `inter_${nameA}_${nameB}_${i}_${j}` });
        });
    });
    return out;
});

/******************************************************************************************/

const dataTooltipSlot = computed(() => {
    const continuousSelectedIndex =
        continuousTooltipSet.value[0]?.index ?? null;
    const selectedIndex = isContinuousScale.value
        ? continuousSelectedIndex
        : selectedSerieIndex.value;

    const timeLabel = isContinuousScale.value
        ? {
              text: String(
                  continuousTooltipSet.value[0]?.point.raw?.x ??
                      continuousTooltipSet.value[0]?.point.x,
              ),
              absoluteIndex: continuousSelectedIndex,
          }
        : timeLabels.value[selectedSerieIndex.value];

    return {
        timeLabel,
        datapoint: selectedSeries.value,
        seriesIndex: selectedSerieIndex.value,
        selectedIndex,
        absoluteIndex: isContinuousScale.value
            ? continuousSelectedIndex
            : selectedSerieIndex.value + slicer.value.start,
        series: absoluteDataset.value,
        bars: barSet.value,
        lines: lineSet.value,
        plots: plotSet.value,
        config: FINAL_CONFIG.value,
    };
});

const localeData = ref({
    months: [],
    shortMonths: [],
    days: [],
    shortDays: [],
});

let localeRequestId = 0;
watchEffect(() => {
    const requestId = ++localeRequestId;
    const dateTimeFormatter =
        FINAL_CONFIG.value.chart.grid.labels.xAxisLabels.datetimeFormatter;

    (async () => {
        const resolved = await useLocale(dateTimeFormatter.locale).catch(() =>
            useLocale('en'),
        );
        if (requestId === localeRequestId) {
            localeData.value = resolved.data;
        }
    })();
});

const preciseTimeFormatter = computed(() => {
    const dateTimeFormatter =
        FINAL_CONFIG.value.chart.grid.labels.xAxisLabels.datetimeFormatter;

    const dateTime = useDateTime({
        useUTC: dateTimeFormatter.useUTC,
        locale: localeData.value,
        januaryAsYear: dateTimeFormatter.januaryAsYear,
    });

    return (absoluteIndex, format) => {
        const values = FINAL_CONFIG.value.chart.grid.labels.xAxisLabels.values;
        const timestamp = values?.[absoluteIndex];
        if (timestamp == null) return '';
        return dateTime.formatDate(new Date(timestamp), format);
    };
});

const preciseAllTimeLabels = computed(() => {
    const values =
        FINAL_CONFIG.value.chart.grid.labels.xAxisLabels.values || [];
    return values.map((_, i) => ({
        text: preciseTimeFormatter.value(
            i,
            FINAL_CONFIG.value.chart.zoom.timeFormat,
        ),
        absoluteIndex: i,
    }));
});

const tooltipMarkerShapeCache = new Map();

function createTooltipCustomFormatterPayload(time) {
    return {
        absoluteIndex: selectedSerieIndex.value + slicer.value.start,
        seriesIndex: selectedSerieIndex.value,
        datapoint: selectedSeries.value,
        series: absoluteDataset.value,
        bars: barSet.value,
        lines: lineSet.value,
        plots: plotSet.value,
        config: FINAL_CONFIG.value,
        dateLabel: time,
    };
}

function getTooltipMarkerShapeCacheKey(seriesItem) {
    return [
        icons.value[seriesItem.type],
        seriesItem.shape || '',
        seriesItem.color,
        FINAL_CONFIG.value.chart.tooltip.backgroundColor,
        Boolean(SLOTS.pattern),
        uniqueId.value,
        seriesItem.slotAbsoluteIndex,
    ].join('|');
}

function getTooltipMarkerShape(seriesItem) {
    const cacheKey = getTooltipMarkerShapeCacheKey(seriesItem);

    if (tooltipMarkerShapeCache.has(cacheKey)) {
        return tooltipMarkerShapeCache.get(cacheKey);
    }

    const tooltipBackgroundColor =
        FINAL_CONFIG.value.chart.tooltip.backgroundColor;

    let shape = '';
    let insideShape = '';

    switch (icons.value[seriesItem.type]) {
        case 'bar':
            shape = `<svg viewBox="0 0 40 40" height="14" width="14">${
                SLOTS.pattern
                    ? `<rect x="0" y="0" rx="1" stroke="none" height="40" width="40" fill="${seriesItem.color}" />`
                    : ''
            }<rect x="0" y="0" rx="1" stroke="none" height="40" width="40" fill="${
                SLOTS.pattern
                    ? `url(#pattern_${uniqueId.value}_${seriesItem.slotAbsoluteIndex})`
                    : seriesItem.color
            }" /></svg>`;
            break;

        case 'line':
            if (
                !seriesItem.shape ||
                ![
                    'star',
                    'triangle',
                    'square',
                    'diamond',
                    'pentagon',
                    'hexagon',
                ].includes(seriesItem.shape)
            ) {
                insideShape = `<circle cx="10" cy="8" r="4" stroke="${tooltipBackgroundColor}" stroke-width="0.5" fill="${seriesItem.color}" />`;
            } else if (seriesItem.shape === 'triangle') {
                insideShape = `<path d="${createPolygonPath({ plot: { x: 10, y: 8 }, radius: 4, sides: 3, rotation: 0.52 }).path}" fill="${seriesItem.color}" stroke="${tooltipBackgroundColor}" stroke-width="0.5" />`;
            } else if (seriesItem.shape === 'square') {
                insideShape = `<path d="${createPolygonPath({ plot: { x: 10, y: 8 }, radius: 4, sides: 4, rotation: 0.8 }).path}" fill="${seriesItem.color}" stroke="${tooltipBackgroundColor}" stroke-width="0.5" />`;
            } else if (seriesItem.shape === 'diamond') {
                insideShape = `<path d="${createPolygonPath({ plot: { x: 10, y: 8 }, radius: 4, sides: 4, rotation: 0 }).path}" fill="${seriesItem.color}" stroke="${tooltipBackgroundColor}" stroke-width="0.5" />`;
            } else if (seriesItem.shape === 'pentagon') {
                insideShape = `<path d="${createPolygonPath({ plot: { x: 10, y: 8 }, radius: 4, sides: 5, rotation: 0.95 }).path}" fill="${seriesItem.color}" stroke="${tooltipBackgroundColor}" stroke-width="0.5" />`;
            } else if (seriesItem.shape === 'hexagon') {
                insideShape = `<path d="${createPolygonPath({ plot: { x: 10, y: 8 }, radius: 4, sides: 6, rotation: 0 }).path}" fill="${seriesItem.color}" stroke="${tooltipBackgroundColor}" stroke-width="0.5" />`;
            } else if (seriesItem.shape === 'star') {
                insideShape = `<polygon stroke="${tooltipBackgroundColor}" stroke-width="0.5" fill="${seriesItem.color}" points="${createStar({ plot: { x: 10, y: 8 }, radius: 4 })}" />`;
            }

            shape = `<svg viewBox="0 0 20 12" height="14" width="20"><rect rx="1.5" x="0" y="6.5" stroke="${tooltipBackgroundColor}" stroke-width="0.5" height="3" width="20" fill="${seriesItem.color}" />${insideShape}</svg>`;
            break;

        case 'plot':
            if (
                !seriesItem.shape ||
                ![
                    'star',
                    'triangle',
                    'square',
                    'diamond',
                    'pentagon',
                    'hexagon',
                ].includes(seriesItem.shape)
            ) {
                shape = `<svg viewBox="0 0 12 12" height="14" width="14"><circle cx="6" cy="6" r="6" stroke="${tooltipBackgroundColor}" stroke-width="1" fill="${seriesItem.color}" /></svg>`;
                break;
            }

            if (seriesItem.shape === 'star') {
                shape = `<svg viewBox="0 0 12 12" height="14" width="14"><polygon stroke="${tooltipBackgroundColor}" stroke-width="1" fill="${seriesItem.color}" points="${createStar({ plot: { x: 6, y: 6 }, radius: 5 })}" /></svg>`;
                break;
            }

            if (seriesItem.shape === 'triangle') {
                shape = `<svg viewBox="0 0 12 12" height="14" width="14"><path d="${createPolygonPath({ plot: { x: 6, y: 6 }, radius: 6, sides: 3, rotation: 0.52 }).path}" fill="${seriesItem.color}" stroke="${tooltipBackgroundColor}" stroke-width="1" /></svg>`;
                break;
            }

            if (seriesItem.shape === 'square') {
                shape = `<svg viewBox="0 0 12 12" height="14" width="14"><path d="${createPolygonPath({ plot: { x: 6, y: 6 }, radius: 6, sides: 4, rotation: 0.8 }).path}" fill="${seriesItem.color}" stroke="${tooltipBackgroundColor}" stroke-width="1" /></svg>`;
                break;
            }

            if (seriesItem.shape === 'diamond') {
                shape = `<svg viewBox="0 0 12 12" height="14" width="14"><path d="${createPolygonPath({ plot: { x: 6, y: 6 }, radius: 5, sides: 4, rotation: 0 }).path}" fill="${seriesItem.color}" stroke="${tooltipBackgroundColor}" stroke-width="1" /></svg>`;
                break;
            }

            if (seriesItem.shape === 'pentagon') {
                shape = `<svg viewBox="0 0 12 12" height="14" width="14"><path d="${createPolygonPath({ plot: { x: 6, y: 6 }, radius: 5, sides: 5, rotation: 0.95 }).path}" fill="${seriesItem.color}" stroke="${tooltipBackgroundColor}" stroke-width="1" /></svg>`;
                break;
            }

            if (seriesItem.shape === 'hexagon') {
                shape = `<svg viewBox="0 0 12 12" height="14" width="14"><path d="${createPolygonPath({ plot: { x: 6, y: 6 }, radius: 5, sides: 6, rotation: 0 }).path}" fill="${seriesItem.color}" stroke="${tooltipBackgroundColor}" stroke-width="1" /></svg>`;
                break;
            }

            break;

        default:
            break;
    }

    tooltipMarkerShapeCache.set(cacheKey, shape);

    return shape;
}

const tooltipContent = computed(() => {
    let html = '';

    let sum = selectedSeries.value
        .map((s) => s.value)
        .filter((s) => isSafeValue(s) && s !== null)
        .reduce((a, b) => Math.abs(a) + Math.abs(b), 0);

    const time = isContinuousScale.value
        ? {
              text: applyDataLabel(
                  FINAL_CONFIG.value.chart.grid.labels.xAxis.formatter,
                  continuousTooltipSet.value[0]?.point.raw?.x ??
                      continuousTooltipSet.value[0]?.point.x,
                  dataLabel({
                      v:
                          continuousTooltipSet.value[0]?.point.raw?.x ??
                          continuousTooltipSet.value[0]?.point.x,
                      r: FINAL_CONFIG.value.chart.tooltip.roundingValue,
                  }),
                  {
                      datapoint: null,
                      serriesIndex: null,
                  },
              ),
          }
        : timeLabels.value[selectedSerieIndex.value];

    const customFormat = FINAL_CONFIG.value.chart.tooltip.customFormat;

    if (isFunction(customFormat)) {
        try {
            const customFormattedTooltip = customFormat(
                createTooltipCustomFormatterPayload(time),
            );

            if (typeof customFormattedTooltip === 'string') {
                return customFormattedTooltip;
            }
        } catch (error) {
            console.warn(
                'Vue Data UI - VueUiXy: custom tooltip formatter failed.',
                error,
            );
        }
    }

    if (time && time.text && FINAL_CONFIG.value.chart.tooltip.showTimeLabel) {
        const precise = preciseTimeFormatter.value(
            selectedSerieIndex.value + slicer.value.start,
            FINAL_CONFIG.value.chart.tooltip.timeFormat,
        );
        if (!isContinuousScale.value) {
            html += `<div style="padding-bottom: 6px; margin-bottom: 4px; border-bottom: 1px solid ${FINAL_CONFIG.value.chart.tooltip.borderColor}; width:100%">${FINAL_CONFIG.value.chart.grid.labels.xAxisLabels.datetimeFormatter.enable && !FINAL_CONFIG.value.chart.tooltip.useDefaultTimeFormat ? precise : time.text}</div>`;
        }
    }
    selectedSeries.value.forEach((s) => {
        if (isSafeValue(s.value)) {
            const shape = getTooltipMarkerShape(s);

            const label_y = FINAL_CONFIG.value.chart.tooltip.showValue
                ? applyDataLabel(
                      s.type === 'line'
                          ? FINAL_CONFIG.value.line.labels.formatter
                          : s.type === 'bar'
                            ? FINAL_CONFIG.value.bar.labels.formatter
                            : FINAL_CONFIG.value.plot.labels.formatter,
                      s.value,
                      dataLabel({
                          p: s.prefix,
                          v: s.value,
                          s: s.suffix,
                          r: FINAL_CONFIG.value.chart.tooltip.roundingValue,
                      }),
                      { datapoint: s },
                  )
                : '';

            const label_x = FINAL_CONFIG.value.chart.tooltip.showValue
                ? (time?.text ?? '')
                : '';
            const valueLabel = isContinuousScale.value
                ? `
                    <span>${FINAL_CONFIG.value.chart.grid.labels.axis.xLabel || 'X'}: </span>
                    <span>${label_x}</span>, 
                    <span>${FINAL_CONFIG.value.chart.grid.labels.axis.yLabel || 'Y'}: </span>
                    <span>${label_y}</span>
                `
                : label_y;

            if (isContinuousScale.value) {
                html += `
                        <div style="display:flex;flex-direction:column;">
                            <div style="display:flex; flex-direction:row; gap:3px;">
                                <div style="width:20px">${shape}</div>
                                <div style="display:flex;flex-direction:column;">
                                    <div>${s.name}</div>
                                    <div>${valueLabel}</div>
                                </div>
                            </div>
                        </div>
                    `;
            } else {
                html += `<div style="display:flex;flex-direction:row; align-items:center;gap:3px;white-space:nowrap;"><div style="width:20px">${shape}</div> ${s.name}: <b>${valueLabel}</b> ${
                    FINAL_CONFIG.value.chart.tooltip.showPercentage
                        ? `(${dataLabel({
                              v: checkNaN((Math.abs(s.value) / sum) * 100),
                              s: '%',
                              r: FINAL_CONFIG.value.chart.tooltip
                                  .roundingPercentage,
                          })})`
                        : ''
                }</div>`;
            }

            const tooltipComment = getSlicedComment(
                s.comments,
                selectedSerieIndex.value,
            );

            if (
                FINAL_CONFIG.value.chart.comments.showInTooltip &&
                tooltipComment
            ) {
                html += `<div class="vue-data-ui-tooltip-comment" style="background:${s.color}20; padding: 6px; margin-bottom: 6px; border-left: 1px solid ${s.color}">${tooltipComment}</div>`;
            }
        }
    });
    return `<div style="border-radius:4px;padding:12px;font-variant-numeric: tabular-nums;color:${FINAL_CONFIG.value.chart.tooltip.color}">${html}</div>`;
});

const continuousTableXValues = computed(() => {
    if (!isContinuousScale.value) {
        return [];
    }

    const seenXValues = new Set();
    const xValues = [];

    relativeDataset.value.forEach((seriesItem) => {
        seriesItem.series.forEach((point) => {
            const xValue = Number(point?.x);

            if (!Number.isFinite(xValue)) {
                return;
            }

            const xValueKey = String(xValue);

            if (seenXValues.has(xValueKey)) {
                return;
            }

            seenXValues.add(xValueKey);
            xValues.push(xValue);
        });
    });

    return xValues.sort((firstValue, secondValue) => {
        return isXAxisReversed.value
            ? secondValue - firstValue
            : firstValue - secondValue;
    });
});

function getContinuousTablePeriodLabel(xValue) {
    const value = Number(xValue);

    if (!Number.isFinite(value)) {
        return '-';
    }

    return applyDataLabel(
        FINAL_CONFIG.value.chart.grid.labels.xAxis.formatter,
        value,
        dataLabel({
            v: value,
            r: FINAL_CONFIG.value.table.rounding,
        }),
        {
            datapoint: value,
            seriesIndex: null,
        },
    );
}

function getTablePeriodLabel(index) {
    if (isContinuousScale.value) {
        return getContinuousTablePeriodLabel(index);
    }

    if (FINAL_CONFIG.value.table.useDefaultTimeFormat) {
        return timeLabels.value[index]?.text ?? '-';
    }

    return preciseTimeFormatter.value(
        index + slicer.value.start,
        FINAL_CONFIG.value.table.timeFormat,
    );
}

function getTableRawValue(seriesItem, rowReference) {
    if (isContinuousScale.value) {
        const xValue = Number(rowReference);

        if (!Number.isFinite(xValue)) {
            return null;
        }

        const point = seriesItem.series.find((candidate) => {
            return Number(candidate?.x) === xValue;
        });

        return point?.y ?? null;
    }

    return seriesItem.absoluteValues[rowReference];
}

function getTableCsvValue(seriesItem, rowReference) {
    const value = getTableRawValue(seriesItem, rowReference);

    return canShowValue(value)
        ? Number(value.toFixed(FINAL_CONFIG.value.table.rounding))
        : '';
}

function getTableFormattedValue(seriesItem, rowReference) {
    const value = getTableRawValue(seriesItem, rowReference);

    if (!canShowValue(value)) {
        return '';
    }

    return applyDataLabel(
        seriesItem.type === 'line'
            ? FINAL_CONFIG.value.line.labels.formatter
            : seriesItem.type === 'bar'
              ? FINAL_CONFIG.value.bar.labels.formatter
              : FINAL_CONFIG.value.plot.labels.formatter,
        value,
        dataLabel({
            p: seriesItem.prefix || FINAL_CONFIG.value.chart.labels.prefix,
            v: value,
            s: seriesItem.suffix || FINAL_CONFIG.value.chart.labels.suffix,
            r: FINAL_CONFIG.value.table.rounding,
        }),
    );
}

function getTableRowSum(rowReference) {
    return relativeDataset.value
        .map((seriesItem) => {
            return getTableRawValue(seriesItem, rowReference) ?? 0;
        })
        .reduce((firstValue, secondValue) => {
            return firstValue + secondValue;
        }, 0);
}

const tableRows = computed(() => {
    if (isContinuousScale.value) {
        return continuousTableXValues.value.map((xValue) => {
            const sum = getTableRowSum(xValue);

            return {
                period: getTablePeriodLabel(xValue),
                csvValues: relativeDataset.value.map((seriesItem) => {
                    return getTableCsvValue(seriesItem, xValue);
                }),
                formattedValues: relativeDataset.value.map((seriesItem) => {
                    return getTableFormattedValue(seriesItem, xValue);
                }),
                sum,
                formattedSum: sum.toFixed(FINAL_CONFIG.value.table.rounding),
            };
        });
    }

    const rows = [];

    for (let index = 0; index < maxSeries.value; index += 1) {
        const sum = getTableRowSum(index);

        rows.push({
            period: getTablePeriodLabel(index),
            csvValues: relativeDataset.value.map((seriesItem) => {
                return getTableCsvValue(seriesItem, index);
            }),
            formattedValues: relativeDataset.value.map((seriesItem) => {
                return getTableFormattedValue(seriesItem, index);
            }),
            sum,
            formattedSum: sum.toFixed(FINAL_CONFIG.value.table.rounding),
        });
    }

    return rows;
});

const table = computed(() => {
    if (safeDataset.value.length === 0) {
        return {
            head: [],
            body: [],
            config: {},
            columnNames: [],
        };
    }

    const head = relativeDataset.value.map((seriesItem) => {
        return {
            label: seriesItem.name,
            color: seriesItem.color,
            type: seriesItem.type,
        };
    });

    const body = tableRows.value.map((row) => {
        return [row.period].concat(row.csvValues);
    });

    return {
        head,
        body,
    };
});

const dataTable = computed(() => {
    const showSum = FINAL_CONFIG.value.table.showSum;

    let head = [
        isContinuousScale.value
            ? FINAL_CONFIG.value.chart.grid.labels.axis.xLabel || 'X'
            : '',
    ].concat(relativeDataset.value.map((seriesItem) => seriesItem.name));

    if (showSum) {
        head = head.concat(
            ` <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18 16v2a1 1 0 0 1 -1 1h-11l6 -7l-6 -7h11a1 1 0 0 1 1 1v2" /></svg>`,
        );
    }

    const body = tableRows.value.map((row) => {
        return [row.period]
            .concat(row.formattedValues)
            .concat(showSum ? row.formattedSum : []);
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
        isContinuousScale.value
            ? FINAL_CONFIG.value.chart.grid.labels.axis.xLabel || 'X'
            : FINAL_CONFIG.value.table.columnNames.period,
    ]
        .concat(relativeDataset.value.map((seriesItem) => seriesItem.name))
        .concat(FINAL_CONFIG.value.table.columnNames.total);

    return {
        head,
        body,
        config,
        colNames,
    };
});

function generateCsv(callback = null) {
    const title = [
        [FINAL_CONFIG.value.chart.title.text],
        [FINAL_CONFIG.value.chart.title.subtitle.text],
        [''],
    ];

    const firstColumnName = isContinuousScale.value
        ? FINAL_CONFIG.value.chart.grid.labels.axis.xLabel || 'X'
        : FINAL_CONFIG.value.table.columnNames.period;

    const head = [firstColumnName, ...table.value.head.map((h) => h.label)];
    const body = table.value.body;
    const _table = title.concat([head]).concat(body);
    const csvContent = createCsvContent(_table);

    if (!callback) {
        downloadCsv({
            csvContent,
            title: FINAL_CONFIG.value.chart.title.text || 'vue-ui-xy',
        });
    } else {
        callback(csvContent);
    }
}

function toggleTooltipVisibility(show, selectedIndex = null) {
    if (allSegregated.value) return;
    isTooltip.value = show;

    const datapoint = relativeDataset.value.map((s) => {
        return {
            name: s.name,
            value: [null, undefined, NaN].includes(
                s.absoluteValues[selectedIndex],
            )
                ? null
                : s.absoluteValues[selectedIndex],
            color: s.color,
            type: s.type,
        };
    });

    if (show) {
        selectedSerieIndex.value = selectedIndex;
        if (FINAL_CONFIG.value.events.datapointEnter) {
            FINAL_CONFIG.value.events.datapointEnter({
                datapoint,
                seriesIndex: selectedIndex + slicer.value.start,
            });
        }
    } else {
        selectedSerieIndex.value = null;
        if (FINAL_CONFIG.value.events.datapointLeave) {
            FINAL_CONFIG.value.events.datapointLeave({
                datapoint,
                seriesIndex: selectedIndex + slicer.value.start,
            });
        }
    }
}

function toggleTable() {
    mutableConfig.value.showTable = !mutableConfig.value.showTable;
}

function toggleLabels() {
    mutableConfig.value.dataLabels.show = !mutableConfig.value.dataLabels.show;
}

function toggleTooltip() {
    mutableConfig.value.showTooltip = !mutableConfig.value.showTooltip;
}

function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
}

function convertSizes() {
    if (!FINAL_CONFIG.value.responsiveProportionalSizing) {
        fontSizes.value.dataLabels =
            FINAL_CONFIG.value.chart.grid.labels.fontSize;
        fontSizes.value.yAxis =
            FINAL_CONFIG.value.chart.grid.labels.axis.fontSize;
        fontSizes.value.xAxis =
            FINAL_CONFIG.value.chart.grid.labels.xAxisLabels.fontSize;
        fontSizes.value.plotLabels = FINAL_CONFIG.value.chart.labels.fontSize;
        plotRadii.value.plot = FINAL_CONFIG.value.plot.radius;
        plotRadii.value.line = FINAL_CONFIG.value.line.radius;
        plotRadii.value.selectedLine =
            FINAL_CONFIG.value.line.dot.selectedRadius;
        return;
    }
    // Adaptative sizes in responsive mode
    fontSizes.value.dataLabels = translateSize({
        relator: height.value,
        adjuster: 400,
        source: FINAL_CONFIG.value.chart.grid.labels.fontSize,
        threshold: 10,
        fallback: 10,
    });
    fontSizes.value.yAxis = translateSize({
        relator: width.value,
        adjuster: 1000,
        source: FINAL_CONFIG.value.chart.grid.labels.axis.fontSize,
        threshold: 10,
        fallback: 10,
    });
    fontSizes.value.xAxis = translateSize({
        relator: width.value,
        adjuster: 1000,
        source: FINAL_CONFIG.value.chart.grid.labels.xAxisLabels.fontSize,
        threshold: 10,
        fallback: 10,
    });
    fontSizes.value.plotLabels = translateSize({
        relator: width.value,
        adjuster: 800,
        source: FINAL_CONFIG.value.chart.labels.fontSize,
        threshold: 10,
        fallback: 10,
    });
    plotRadii.value.plot = translateSize({
        relator: width.value,
        adjuster: 800,
        source: FINAL_CONFIG.value.plot.radius,
        threshold: 1,
        fallback: 1,
    });
    plotRadii.value.line = translateSize({
        relator: width.value,
        adjuster: 800,
        source: FINAL_CONFIG.value.line.radius,
        threshold: 1,
        fallback: 0,
    });
    plotRadii.value.selectedLine = translateSize({
        relator: width.value,
        adjuster: 800,
        source: FINAL_CONFIG.value.line.dot.selectedRadius,
        threshold: 1,
        fallback: 0,
    });
}

function prepareChart() {
    if (objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiXy',
            type: 'dataset',
            debug: debug.value,
        });
        manualLoading.value = true; // v3
    } else {
        props.dataset.forEach((ds, i) => {
            if ([null, undefined].includes(ds.name)) {
                error({
                    componentName: 'VueUiXy',
                    type: 'datasetSerieAttribute',
                    property: 'name (string)',
                    index: i,
                    debug: debug.value,
                });
                manualLoading.value = true; // v3
            }
        });
    }

    if (debug.value) {
        props.dataset.forEach((datapoint) => {
            datapoint.series.forEach((s, j) => {
                if (!isSafeValue(s)) {
                    console.warn(
                        `VueUiXy has detected an unsafe value in your dataset:\n-----> The serie '${datapoint.name}' contains the value '${s}' at index ${j}.\n'${s}' was converted to null to allow the chart to display.`,
                    );
                }
            });
        });
    }

    // v3
    if (!objectIsEmpty(props.dataset)) {
        manualLoading.value = FINAL_CONFIG.value.loading;
    }

    showUserOptionsOnChartHover.value =
        FINAL_CONFIG.value.chart.userOptions.showOnChartHover;
    keepUserOptionState.value =
        FINAL_CONFIG.value.chart.userOptions.keepStateOnChartLeave;
    userOptionsVisible.value =
        !FINAL_CONFIG.value.chart.userOptions.showOnChartHover;

    seedMutableFromConfig();

    const additionalPad = 12;

    if (FINAL_CONFIG.value.responsive) {
        const _chart = chart.value;
        // Parent container (must have fixed height or max-height. Setting 100% will result in infinite height growth which looks aweful on top of being useless)
        const parent = _chart.parentNode;

        if (resizeObserver.value) {
            if (observedEl.value) {
                resizeObserver.value.unobserve(observedEl.value);
            }

            resizeObserver.value.disconnect();
            resizeObserver.value = null;
            observedEl.value = null;
        }

        const { height: _height, width: _width } =
            parent.getBoundingClientRect();

        // Title height to substract
        let title = null;
        let titleHeight = 0;
        if (FINAL_CONFIG.value.chart.title.show && chartTitle.value) {
            title = chartTitle.value;
            titleHeight = title.getBoundingClientRect().height;
        }

        // Slicer height to substract
        let slicer = null;
        let slicerHeight = 0;
        if (
            FINAL_CONFIG.value.chart.zoom.show &&
            maxX.value > 6 &&
            isDataset.value &&
            chartSlicer.value &&
            chartSlicer.value.$el
        ) {
            slicer = chartSlicer.value.$el;
            slicerHeight = slicer.getBoundingClientRect().height;
        }

        // Legend height to substract
        let legend = null;
        let legendHeight = 0;
        if (FINAL_CONFIG.value.chart.legend.show && chartLegend.value) {
            legend = chartLegend.value;
            legendHeight = legend.getBoundingClientRect().height;
        }

        // Source height to substract
        let sourceHeight = 0;
        if (source.value) {
            sourceHeight = source.value.getBoundingClientRect().height;
        }

        // NoTitle height to substract
        let noTitleHeight = 0;
        if (noTitle.value) {
            noTitleHeight = noTitle.value.getBoundingClientRect().height;
        }

        height.value =
            _height -
            titleHeight -
            legendHeight -
            slicerHeight -
            sourceHeight -
            noTitleHeight -
            additionalPad;

        width.value = _width;
        viewBox.value = `0 0 ${width.value < 0 ? 10 : width.value} ${height.value < 0 ? 10 : height.value}`;
        convertSizes();

        const ro = new ResizeObserver((entries) => {
            for (const entry of entries) {
                if (FINAL_CONFIG.value.chart.title.show && chartTitle.value) {
                    titleHeight =
                        chartTitle.value.getBoundingClientRect().height;
                } else {
                    titleHeight = 0;
                }
                if (chartSlicer.value && chartSlicer.value.$el) {
                    slicerHeight =
                        chartSlicer.value.$el.getBoundingClientRect().height;
                } else {
                    slicerHeight = 0;
                }
                if (chartLegend.value) {
                    legendHeight =
                        chartLegend.value.getBoundingClientRect().height;
                } else {
                    legendHeight = 0;
                }
                if (source.value) {
                    sourceHeight = source.value.getBoundingClientRect().height;
                } else {
                    sourceHeight = 0;
                }
                if (noTitle.value) {
                    noTitleHeight =
                        noTitle.value.getBoundingClientRect().height;
                } else {
                    noTitleHeight = 0;
                }

                requestAnimationFrame(() => {
                    height.value =
                        entry.contentRect.height -
                        titleHeight -
                        legendHeight -
                        slicerHeight -
                        sourceHeight -
                        noTitleHeight -
                        additionalPad;

                    width.value =
                        entry.contentBoxSize[0].inlineSize ??
                        entry.contentRect.width;
                    viewBox.value = `0 0 ${width.value < 0 ? 10 : width.value} ${height.value < 0 ? 10 : height.value}`;
                    convertSizes();
                    queueParentStableLayoutRefresh();
                });
            }
        });

        resizeObserver.value = ro;
        observedEl.value = parent;

        ro.observe(parent);
    } else {
        height.value = FINAL_CONFIG.value.chart.height;
        width.value = FINAL_CONFIG.value.chart.width;
        fontSizes.value.dataLabels =
            FINAL_CONFIG.value.chart.grid.labels.fontSize;
        fontSizes.value.yAxis =
            FINAL_CONFIG.value.chart.grid.labels.axis.fontSize;
        fontSizes.value.xAxis =
            FINAL_CONFIG.value.chart.grid.labels.xAxisLabels.fontSize;
        fontSizes.value.plotLabels = FINAL_CONFIG.value.chart.labels.fontSize;
        plotRadii.value.plot = FINAL_CONFIG.value.plot.radius;
        plotRadii.value.line = FINAL_CONFIG.value.line.radius;
        plotRadii.value.selectedLine =
            FINAL_CONFIG.value.line.dot.selectedRadius;
        viewBox.value = `0 0 ${width.value} ${height.value}`;
    }
    queueParentStableLayoutRefresh();
}

function setClientPosition(e) {
    clientPosition.value = {
        x: e.clientX,
        y: e.clientY,
    };
}

onMounted(() => {
    prepareChart();
    setupSlicer();
    document.addEventListener('mousemove', setClientPosition, {
        passive: true,
    });
    document.addEventListener('scroll', hideTags, { passive: true });
});

onBeforeUnmount(() => {
    document.removeEventListener('scroll', hideTags, { passive: true });
    document.removeEventListener('mousemove', setClientPosition, {
        passive: true,
    });

    if (resizeObserver.value) {
        if (observedEl.value) {
            resizeObserver.value.unobserve(observedEl.value);
        }

        resizeObserver.value.disconnect();
        resizeObserver.value = null;
        observedEl.value = null;
    }

    cleanupTimeTagObserver();
    clearQueuedSlicerFrames();
});

useTimeLabelCollision({
    timeLabelsEls,
    timeLabels,
    slicer,
    configRef: FINAL_CONFIG,
    rotationPath: ['chart', 'grid', 'labels', 'xAxisLabels', 'rotation'],
    autoRotatePath: [
        'chart',
        'grid',
        'labels',
        'xAxisLabels',
        'autoRotate',
        'enable',
    ],
    isAutoSize,
    height,
    width,
    rotation: FINAL_CONFIG.value.chart.grid.labels.xAxisLabels.autoRotate.angle,
});

const useCustomFormatTimeTag = ref(false);

const timeTagEl = ref(null);
const timeTagInnerW = ref(200);

const activeIndex = computed(
    () => selectedSerieIndex.value ?? selectedMinimapIndex.value ?? 0,
);

const activeContinuousXValue = computed(() => {
    if (!isContinuousScale.value) return null;

    if (isValidNumber(selectedMinimapXValue.value)) {
        return Number(selectedMinimapXValue.value);
    }

    const closest = continuousTooltipSet.value[0];

    if (isValidNumber(closest?.point?.x)) {
        return Number(closest.point.x);
    }

    return null;
});

function timeTagMeasuredW() {
    const w = Math.ceil(timeTagInnerW.value || 200);
    return Math.min(Math.max(w, 1), 200);
}

function timeTagX() {
    const w = timeTagMeasuredW();
    const W_FO = 200;
    const centerX =
        isContinuousScale.value && isValidNumber(activeContinuousXValue.value)
            ? getContinuousX({ x: activeContinuousXValue.value })
            : getDatapointX(activeIndex.value);
    const desiredX = centerX - w / 2 - (W_FO - w) / 2;
    const minX = drawingArea.value?.left - (W_FO - w) / 2;
    const _maxX = drawingArea.value?.right - (W_FO + w) / 2;
    const clamped = Math.max(minX, Math.min(desiredX, _maxX));
    return checkNaN(clamped);
}

function cleanupTimeTagObserver() {
    if (timeTagResizeAnimationFrame.value !== null) {
        cancelAnimationFrame(timeTagResizeAnimationFrame.value);
        timeTagResizeAnimationFrame.value = null;
    }

    if (timeTagResizeObserver.value && observedTimeTagElement.value) {
        timeTagResizeObserver.value.unobserve(observedTimeTagElement.value);
    }

    if (timeTagResizeObserver.value) {
        timeTagResizeObserver.value.disconnect();
        timeTagResizeObserver.value = null;
    }

    if (stopTimeTagObserverWatch.value) {
        stopTimeTagObserverWatch.value();
        stopTimeTagObserverWatch.value = null;
    }

    observedTimeTagElement.value = null;
}

function setTimeTagMeasuredWidth(width) {
    if (timeTagResizeAnimationFrame.value !== null) {
        cancelAnimationFrame(timeTagResizeAnimationFrame.value);
    }

    timeTagResizeAnimationFrame.value = requestAnimationFrame(() => {
        timeTagInnerW.value = Math.min(Math.max(Math.ceil(width || 0), 1), 200);
        timeTagResizeAnimationFrame.value = null;
    });
}

function observeTimeTagElement(element) {
    if (!timeTagResizeObserver.value || !element) {
        return;
    }

    if (
        observedTimeTagElement.value &&
        observedTimeTagElement.value !== element
    ) {
        timeTagResizeObserver.value.unobserve(observedTimeTagElement.value);
        observedTimeTagElement.value = null;
    }

    if (element === observedTimeTagElement.value) {
        return;
    }

    nextTick(() => {
        if (element.offsetParent === null) {
            return;
        }

        setTimeTagMeasuredWidth(
            element.offsetWidth || element.getBoundingClientRect().width || 200,
        );
    });

    timeTagResizeObserver.value.observe(element);
    observedTimeTagElement.value = element;
}

onMounted(() => {
    timeTagResizeObserver.value = new ResizeObserver((entries) => {
        const entry =
            entries.find(
                (resizeEntry) =>
                    resizeEntry.target === observedTimeTagElement.value,
            ) || entries[0];

        if (!entry) return;
        setTimeTagMeasuredWidth(entry.contentRect.width || 200);
    });

    stopTimeTagObserverWatch.value = watchEffect((onInvalidate) => {
        const element = timeTagEl.value;

        if (!element) {
            if (timeTagResizeObserver.value && observedTimeTagElement.value) {
                timeTagResizeObserver.value.unobserve(
                    observedTimeTagElement.value,
                );
                observedTimeTagElement.value = null;
            }
            return;
        }

        observeTimeTagElement(element);

        onInvalidate(() => {
            if (
                timeTagResizeObserver.value &&
                observedTimeTagElement.value &&
                observedTimeTagElement.value !== timeTagEl.value
            ) {
                timeTagResizeObserver.value.unobserve(
                    observedTimeTagElement.value,
                );
                observedTimeTagElement.value = null;
            }
        });
    });
});

const timeTagContent = computed(() => {
    if (isContinuousScale.value) {
        if (!Number.isFinite(Number(activeContinuousXValue.value))) {
            return '';
        }
    } else if (
        [null, undefined].includes(selectedSerieIndex.value) &&
        [null, undefined].includes(selectedMinimapIndex.value)
    ) {
        return '';
    }

    const index =
        (selectedSerieIndex.value != null ? selectedSerieIndex.value : 0) ||
        (selectedMinimapIndex.value != null ? selectedMinimapIndex.value : 0);

    const customFormat = FINAL_CONFIG.value.chart.timeTag.customFormat;
    useCustomFormatTimeTag.value = false;

    if (isContinuousScale.value) {
        const value = activeContinuousXValue.value;

        if (isFunction(customFormat)) {
            try {
                const customFormatString = customFormat({
                    absoluteIndex: value,
                    seriesIndex: value,
                    datapoint: selectedSeries.value,
                    bars: barSet.value,
                    lines: lineSet.value,
                    plots: plotSet.value,
                    config: FINAL_CONFIG.value,
                });

                if (typeof customFormatString === 'string') {
                    useCustomFormatTimeTag.value = true;
                    return customFormatString;
                }
            } catch (err) {
                console.warn('Custom format cannot be applied on timeTag.');
                useCustomFormatTimeTag.value = false;
            }
        }

        return dataLabel({
            v: value,
            r: FINAL_CONFIG.value.chart.grid.labels.xAxis.rounding,
        });
    }

    if (isFunction(customFormat)) {
        try {
            const customFormatString = customFormat({
                absoluteIndex: index + slicer.value.start,
                seriesIndex: index,
                datapoint: selectedSeries.value,
                bars: barSet.value,
                lines: lineSet.value,
                plots: plotSet.value,
                config: FINAL_CONFIG.value,
            });
            if (typeof customFormatString === 'string') {
                useCustomFormatTimeTag.value = true;
                return customFormatString;
            }
        } catch (err) {
            console.warn('Custom format cannot be applied on timeTag.');
            useCustomFormatTimeTag.value = false;
        }
    }

    if (!useCustomFormatTimeTag.value) {
        if (![null, undefined].includes(timeLabels.value[index])) {
            if (
                FINAL_CONFIG.value.chart.grid.labels.xAxisLabels
                    .datetimeFormatter.enable &&
                !FINAL_CONFIG.value.chart.timeTag.useDefaultFormat
            ) {
                return preciseTimeFormatter.value(
                    index + slicer.value.start,
                    FINAL_CONFIG.value.chart.timeTag.timeFormat,
                );
            } else {
                return timeLabels.value[index].text;
            }
        } else {
            return '';
        }
    }
});

// Datapoint labels
function getDataLabelContent({ serie, plot, type }) {
    if (!canShowValue(plot.value)) return '';

    const yValue = dataLabel({
        p: serie.prefix || FINAL_CONFIG.value.chart.labels.prefix,
        v: plot.value,
        s: serie.suffix || FINAL_CONFIG.value.chart.labels.suffix,
        r: FINAL_CONFIG.value[type].labels.rounding,
    });

    const datasetXValue = plot.datasetXValue;

    const content =
        isContinuousScale.value && isValidNumber(datasetXValue)
            ? `x: ${dataLabel({
                  v: datasetXValue,
                  r: FINAL_CONFIG.value.chart.grid.labels.xAxis.rounding,
              })}\ny: ${yValue}`
            : applyDataLabel(
                  FINAL_CONFIG.value[type].labels.formatter,
                  plot.value,
                  yValue,
                  {
                      datapoint: plot,
                      serie,
                  },
              );

    return createTSpansFromLineBreaksOnX({
        content,
        fontSize: fontSizes.value.plotLabels,
        fill: FINAL_CONFIG.value[type].labels.color,
        x: 0,
        y: 0,
    });
}

function getDataLabelTransformBar({ plot }) {
    const offsetY = FINAL_CONFIG.value.bar.labels.offsetY;
    const barHeight = Math.abs(calcIndividualHeight(plot));
    const isNegative = plot.value < 0;
    const coords = {
        x: getBarCenterX(plot) + FINAL_CONFIG.value.bar.labels.offsetX,
        y:
            checkNaN(plot.y) +
            (FINAL_CONFIG.value.bar.labels.alwaysOnTop
                ? offsetY - (isNegative ? barHeight : 0)
                : plot.value >= 0
                  ? offsetY
                  : -offsetY * 3),
    };
    return `translate(${coords.x}, ${coords.y}) rotate(${FINAL_CONFIG.value.bar.labels.rotation})`;
}

function getDataLabelTransformLineOrPlot({ plot, type }) {
    const offsetY = FINAL_CONFIG.value[type].labels.offsetY;
    const coords = {
        x: plot.x + FINAL_CONFIG.value[type].labels.offsetX,
        y:
            checkNaN(plot.y) +
            (FINAL_CONFIG.value[type].labels.alwaysOnTop
                ? offsetY
                : plot.value >= 0
                  ? offsetY
                  : -offsetY * 3),
    };
    return `translate(${coords.x}, ${coords.y}) rotate(${FINAL_CONFIG.value[type].labels.rotation})`;
}

function getDataLabelTextAnchor({ plot, type }) {
    if (FINAL_CONFIG.value[type].labels.textAnchor != null) {
        return FINAL_CONFIG.value[type].labels.textAnchor;
    }
    const isPositive = plot.value >= 0;
    const isRotated = FINAL_CONFIG.value[type].labels.rotation !== 0;
    if (!isRotated) return 'middle';
    return FINAL_CONFIG.value[type].labels.alwaysOnTop
        ? 'start'
        : isPositive
          ? 'start'
          : 'end';
}

const highlighterX = computed(() => {
    if (isContinuousScale.value) {
        if (isValidNumber(selectedMinimapXValue.value)) {
            return getContinuousX({ x: Number(selectedMinimapXValue.value) });
        }
        if (isValidNumber(continuousTooltipX.value)) {
            return continuousTooltipX.value;
        }
        return null;
    }
    return getDatapointX(
        selectedSerieIndex.value ?? selectedMinimapIndex.value ?? 0,
    );
});

const crosshairsAreActive = computed(() => {
    return (
        FINAL_CONFIG.value.chart.highlighter.crosshairs.show &&
        hasHighlighterSelection.value
    );
});

const crosshairSelectedPlots = computed(() => {
    const sets = [...lineSet.value, ...plotSet.value, ...barSet.value];

    return sets.flatMap((serie) => {
        return (serie.plots || [])
            .map((plot, index) => ({
                plot,
                index,
            }))
            .filter(({ plot, index }) =>
                isSelectedDatapoint(serie, plot, index),
            )
            .filter(({ plot }) => canShowValue(plot.value))
            .map(({ plot, index }) => ({
                ...plot,
                index: plot.index ?? index,
                serie,
                x: checkNaN(
                    serie.type === 'bar' ? getBarCenterX(plot) : plot.x,
                ),
                y: checkNaN(plot.y),
            }));
    });
});

const crosshairXAxisLabel = computed(() => {
    if (!crosshairsAreActive.value) return null;

    if (isContinuousScale.value) {
        const item = continuousTooltipSet.value[0];
        const value = item?.point?.raw?.x ?? item?.point?.x;

        if (!isValidNumber(value)) return null;

        return {
            x: highlighterX.value,
            text: applyDataLabel(
                FINAL_CONFIG.value.chart.grid.labels.xAxis.formatter,
                value,
                dataLabel({
                    v: value,
                    r: FINAL_CONFIG.value.chart.tooltip.roundingValue,
                }),
            ),
        };
    }

    const index =
        selectedSerieIndex.value !== null
            ? selectedSerieIndex.value
            : selectedMinimapIndex.value;

    if (index === null || index === undefined) return null;

    return {
        x: getDatapointX(index),
        text: timeLabels.value[index]?.text ?? '',
    };
});

function getCrosshairXEdge(plotX) {
    return FINAL_CONFIG.value.chart.grid.labels.yAxis.position === 'right'
        ? drawingArea.value.right
        : drawingArea.value.left;
}

function isSelectedDatapoint(serie, plot, index) {
    if (isContinuousScale.value) {
        return continuousTooltipSet.value.some((item) => {
            return item.datapoint.id === serie.id && item.index === plot.index;
        });
    }

    return (
        (selectedSerieIndex.value !== null &&
            selectedSerieIndex.value === index) ||
        (selectedMinimapIndex.value !== null &&
            selectedMinimapIndex.value === index)
    );
}

function shouldShowDataLabel({ serie, plot, index, type }) {
    if (!plot || !canShowValue(plot.value)) return false;
    if (!FINAL_CONFIG.value[type].labels.show) return false;
    if (!mutableConfig.value.dataLabels.show) return false;
    return (
        !Object.hasOwn(serie, 'dataLabels') ||
        serie.dataLabels === true ||
        isSelectedDatapoint(serie, plot, index)
    );
}

function createDataLabelItems(seriesSet, type) {
    const items = [];

    seriesSet.forEach((serie, serieIndex) => {
        const plots = Array.isArray(serie.plots) ? serie.plots : [];

        plots.forEach((plot, plotIndex) => {
            if (
                !shouldShowDataLabel({
                    serie,
                    plot,
                    index: plotIndex,
                    type,
                })
            ) {
                return;
            }

            items.push({
                key: `data_label_${type}_${serie.id}_${(plot.index ?? plotIndex) + slicer.value.start}`,
                serie,
                serieIndex,
                plot,
                plotIndex,
            });
        });
    });

    return items;
}

const barDataLabelItems = computed(() =>
    createDataLabelItems(barSet.value, 'bar'),
);
const plotDataLabelItems = computed(() =>
    createDataLabelItems(plotSet.value, 'plot'),
);
const lineDataLabelItems = computed(() =>
    createDataLabelItems(lineSet.value, 'line'),
);

// Force reflow when component is mounted in a hidden div
watch(
    () => props.dataset,
    (_) => {
        if (Array.isArray(_) && _.length > 0) {
            manualLoading.value = false;
        }

        if (FINAL_CONFIG.value.chart.zoom.keepState) {
            const currentMaxX = maxX.value;

            if (currentMaxX > 0) {
                const previousStart = slicer.value.start;
                const previousEnd = slicer.value.end;

                const slicerIsNotInitialized =
                    !slicerReady.value ||
                    (previousStart === 0 && previousEnd === 0);

                if (slicerIsNotInitialized) {
                    setupSlicer();
                } else {
                    const nextStart = Math.max(
                        0,
                        Math.min(previousStart, currentMaxX - 1),
                    );

                    const nextEnd = Math.max(
                        nextStart + 1,
                        Math.min(previousEnd, currentMaxX),
                    );

                    slicer.value = {
                        start: nextStart,
                        end: nextEnd,
                    };

                    slicerPrecog.value = {
                        start: nextStart,
                        end: nextEnd,
                    };

                    absoluteSlicerStartIndex.value = 0;
                    absoluteSlicerEndIndex.value = currentMaxX;
                }
            }
        } else {
            slicer.value = {
                start: 0,
                end: maxX.value,
            };
        }

        slicerStep.value += 1;
        segregateStep.value += 1;
        queueParentStableLayoutRefresh();
        normalizeSlicerWindow();
    },
    { deep: true },
);

watch(
    () => props.config,
    (_) => {
        if (!loading.value) {
            FINAL_CONFIG.value = prepareConfig();
        }

        prepareChart();
        titleStep.value += 1;
        tableStep.value += 1;
        seedMutableFromConfig();

        if (FINAL_CONFIG.value.chart.zoom.keepState) {
            if (
                maxX.value > 0 &&
                (!slicerReady.value ||
                    (slicer.value.start === 0 && slicer.value.end === 0))
            ) {
                setupSlicer();
            }
        }

        normalizeSlicerWindow();
    },
    { deep: true },
);

const isActuallyVisible = ref(false);
const wasActuallyVisible = ref(false);

function recomputeVisibility() {
    const element = chart.value?.parentNode;

    if (!element) {
        wasActuallyVisible.value = isActuallyVisible.value;
        isActuallyVisible.value = false;
        return;
    }

    const rect = element.getBoundingClientRect();

    wasActuallyVisible.value = isActuallyVisible.value;
    isActuallyVisible.value = rect.width > 0 && rect.height > 0;
}

function shouldInitializeSlicerAfterVisibilityChange() {
    if (!isActuallyVisible.value) return false;
    if (wasActuallyVisible.value) return false;
    if (slicerReady.value) return false;
    return slicer.value.start === 0 && slicer.value.end === 0;
}

onMounted(() => {
    recomputeVisibility();
    visibilityResizeObserver.value = new ResizeObserver(() => {
        recomputeVisibility();
        if (!isActuallyVisible.value) return;
        prepareChart();
        normalizeSlicerWindow();
        if (shouldInitializeSlicerAfterVisibilityChange()) {
            setupSlicer();
        }
    });
    if (chart.value?.parentNode) {
        visibilityResizeObserver.value.observe(chart.value.parentNode);
    }
});

// v3 - Essential to make shifting between loading config and final config work
watch(
    FINAL_CONFIG,
    () => {
        seedMutableFromConfig();
    },
    { immediate: true },
);

const tableComponent = computed(() => {
    const useDialog =
        FINAL_CONFIG.value.table.useDialog && !FINAL_CONFIG.value.showTable;
    const open = mutableConfig.value.showTable;
    return {
        component: useDialog ? BaseDraggableDialog : Accordion,
        title: `${FINAL_CONFIG.value.chart.title.text}${FINAL_CONFIG.value.chart.title.subtitle.text ? `: ${FINAL_CONFIG.value.chart.title.subtitle.text}` : ''}`,
        props: useDialog
            ? {
                  backgroundColor: FINAL_CONFIG.value.table.th.backgroundColor,
                  color: FINAL_CONFIG.value.table.th.color,
                  headerColor: FINAL_CONFIG.value.table.th.color,
                  headerBg: FINAL_CONFIG.value.table.th.backgroundColor,
                  isFullscreen: isFullscreen.value,
                  fullscreenParent: chart.value,
                  forcedWidth: Math.min(800, window.innerWidth * 0.8),
              }
            : {
                  hideDetails: true,
                  config: {
                      open,
                      maxHeight: 10000,
                      body: {
                          backgroundColor:
                              FINAL_CONFIG.value.chart.backgroundColor,
                          color: FINAL_CONFIG.value.chart.color,
                      },
                      head: {
                          backgroundColor:
                              FINAL_CONFIG.value.chart.backgroundColor,
                          color: FINAL_CONFIG.value.chart.color,
                      },
                  },
              },
    };
});

watch(
    () => mutableConfig.value.showTable,
    (v) => {
        if (FINAL_CONFIG.value.showTable) return;
        if (v && FINAL_CONFIG.value.table.useDialog && tableUnit.value) {
            tableUnit.value.open();
        } else {
            if (tableUnit.value && tableUnit.value.close) {
                tableUnit.value.close();
            }
        }
    },
);

function closeTable() {
    mutableConfig.value.showTable = false;
    if (userOptionsRef.value) {
        userOptionsRef.value.setTableIconState(false);
    }
}

const legendSet = computed(() => {
    return absoluteDataset.value.map((ds) => {
        return {
            shape: ds.type === 'bar' ? 'square' : (ds.shape ?? 'circle'),
            color: ds.color,
            name: ds.name,
        };
    });
});

const svgBg = computed(() => FINAL_CONFIG.value.chart.backgroundColor);
const svgLegend = computed(() => FINAL_CONFIG.value.chart.legend);
const svgTitle = computed(() => FINAL_CONFIG.value.chart.title);

const { exportSvg, getSvg } = useSvgExport({
    svg: svgRef,
    title: svgTitle,
    legend: svgLegend,
    legendItems: legendSet,
    backgroundColor: svgBg,
});

async function generateSvg({ isCb }) {
    isCallbackSvg.value = true;

    await nextTick();

    try {
        if (isCb) {
            const { blob, url, text, dataUrl } = await getSvg();
            await Promise.resolve(
                FINAL_CONFIG.value.chart.userOptions.callbacks.svg({
                    blob,
                    url,
                    text,
                    dataUrl,
                }),
            );
        } else {
            await Promise.resolve(exportSvg());
        }
    } finally {
        isCallbackSvg.value = false;
    }
}

function onGenerateImage(payload) {
    if (payload?.stage === 'start') {
        isCallbackImaging.value = true;
        return;
    }

    if (payload?.stage === 'end') {
        isCallbackImaging.value = false;
        return;
    }

    generateImage();
}

async function copyAlt() {
    emit('copyAlt', {
        config: {
            ...FINAL_CONFIG.value,
            formattedDates: timeLabels.value,
        },
        dataset: {
            lines: lineSet.value,
            bars: barSet.value,
            plots: plotSet.value,
        },
    });
    if (!FINAL_CONFIG.value.chart.userOptions.callbacks.altCopy) {
        console.warn(
            'Vue Data UI - A callback must be set for `altCopy` in userOptions.',
        );
        return;
    }
    await Promise.resolve(
        FINAL_CONFIG.value.chart.userOptions.callbacks.altCopy({
            config: {
                ...FINAL_CONFIG.value,
                formattedDates: timeLabels.value,
            },
            dataset: {
                lines: lineSet.value,
                bars: barSet.value,
                plots: plotSet.value,
            },
        }),
    );
}

/***************************************************************************************************
 * a11y
 **************************************************************************************************/
const isFocus = ref(false);

function onSvgFocus() {
    if (slicer.value.end > slicer.value.start) {
        activeTooltipIndex.value = null;
    }
    userHovers.value = true;
    isFocus.value = true;
}

function onSvgBlur() {
    activeTooltipIndex.value = null;
    onSvgMouseLeave();
    isFocus.value = false;
    userHovers.value = false;
}

function onSvgKeydown(event) {
    if (!svgRef.value || isAnnotator.value) return;
    if (document.activeElement !== svgRef.value) return;

    const isLeftArrow = event.key === 'ArrowLeft';
    const isRightArrow = event.key === 'ArrowRight';

    if (!isLeftArrow && !isRightArrow) return;
    if (!slicer.value.end && slicer.value.end !== 0) return;

    const slicerDiff = slicer.value.end - slicer.value.start;
    if (slicerDiff <= 0) return;

    event.preventDefault();
    event.stopPropagation();

    if (isContinuousScale.value) {
        const count = continuousKeyboardXValues.value.length;

        if (!count) {
            return;
        }

        let nextIndex = activeTooltipIndex.value;

        const hasValidActiveIndex =
            nextIndex !== null && nextIndex >= 0 && nextIndex < count;

        if (!hasValidActiveIndex) {
            nextIndex = isRightArrow ? 0 : count - 1;
        } else if (isRightArrow) {
            nextIndex += 1;

            if (nextIndex >= count) {
                nextIndex = 0;
            }
        } else if (isLeftArrow) {
            nextIndex -= 1;

            if (nextIndex < 0) {
                nextIndex = count - 1;
            }
        }

        showContinuousTooltipFromKeyboard(nextIndex);
        return;
    }

    let nextIndex = activeTooltipIndex.value;
    const hoveredVisibleIndex = hoveredIndex.value;

    const hasValidActiveIndex =
        nextIndex !== null && nextIndex >= 0 && nextIndex < slicerDiff;

    const hasValidHoveredIndex =
        hoveredVisibleIndex !== null &&
        hoveredVisibleIndex >= 0 &&
        hoveredVisibleIndex < slicerDiff;

    if (!hasValidActiveIndex) {
        if (hasValidHoveredIndex) {
            nextIndex = isRightArrow
                ? hoveredVisibleIndex + 1
                : hoveredVisibleIndex - 1;

            if (nextIndex >= slicerDiff) {
                nextIndex = 0;
            }

            if (nextIndex < 0) {
                nextIndex = slicerDiff - 1;
            }
        } else if (isRightArrow) {
            nextIndex = 0;
        } else {
            nextIndex = slicerDiff - 1;
        }
    } else if (isRightArrow) {
        nextIndex += 1;
        if (nextIndex >= slicerDiff) {
            nextIndex = 0;
        }
    } else if (isLeftArrow) {
        nextIndex -= 1;
        if (nextIndex < 0) {
            nextIndex = slicerDiff - 1;
        }
    }

    activeTooltipIndex.value = nextIndex;
    setKeyboardTooltipPositionFromIndex(nextIndex);
    toggleTooltipVisibility(true, nextIndex);
}

function setKeyboardTooltipPositionFromIndex(index) {
    const slicerDiff = slicer.value.end - slicer.value.start;
    if (slicerDiff <= 0) return;
    const slotWidth = drawingArea.value.width / slicerDiff;
    const svgX = drawingArea.value.left + slotWidth * index + slotWidth / 2;
    const svgY = drawingArea.value.top + drawingArea.value.height / 2;
    const coords = svgToClientCoords(svgX, svgY, svgRef.value);
    if (!coords) return;
    tooltipA11yPosition.value = coords;
}

const a11yTable = computed(() => {
    if (!dataTable.value) return null;
    const showSum = FINAL_CONFIG.value.table.showSum;
    let headers = [FINAL_CONFIG.value.table.columnNames.period].concat(
        relativeDataset.value.map((seriesItem) => seriesItem.name),
    );
    if (showSum) {
        headers = headers.concat(FINAL_CONFIG.value.table.columnNames.total);
    }
    return {
        headers,
        rows: dataTable.value.body,
    };
});

defineExpose({
    getData,
    getImage,
    generatePdf,
    generateImage,
    generateSvg,
    generateCsv,
    hideSeries,
    showSeries,
    toggleStack,
    toggleTable,
    toggleLabels,
    toggleTooltip,
    toggleAnnotator,
    toggleFullscreen,
    copyAlt,
    resetZoom: refreshSlicer,
});
</script>

<template>
    <div
        :id="`vue-ui-xy_${uniqueId}`"
        :class="`vue-data-ui-component vue-ui-xy ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''} ${FINAL_CONFIG.useCssAnimation ? '' : 'vue-ui-dna'}`"
        ref="chart"
        :style="`background:${FINAL_CONFIG.chart.backgroundColor}; color:${FINAL_CONFIG.chart.color};width:100%;font-family:${FINAL_CONFIG.chart.fontFamily};${FINAL_CONFIG.responsive ? 'height: 100%' : ''}`"
        @mouseenter="showUserOptions"
        @mouseleave="hideUserOptions"
        @click="onSvgClick"
    >
        <!-- A11Y -->
        <div :id="`chart-instructions-${uniqueId}`" class="sr-only">
            <p>{{ FINAL_CONFIG.a11y.translations.keyboardNavigation }}</p>
        </div>

        <A11yDataTable
            v-if="a11yTable?.rows?.length"
            :uid="uniqueId"
            :head="a11yTable.headers"
            :body="a11yTable.rows"
            :notice="FINAL_CONFIG.a11y.translations.tableAvailable"
            :caption="FINAL_CONFIG.a11y.translations.tableCaption"
        />

        <PenAndPaper
            v-if="FINAL_CONFIG.chart.userOptions.buttons.annotator && svgRef"
            :svgRef="svgRef"
            :backgroundColor="FINAL_CONFIG.chart.backgroundColor"
            :color="FINAL_CONFIG.chart.color"
            :active="isAnnotator"
            :isCursorPointer="isCursorPointer"
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

        <div
            ref="noTitle"
            v-if="hasOptionsNoTitle"
            class="vue-data-ui-no-title-space"
            :style="`height:36px; width: 100%; background:transparent`"
        />

        <div
            ref="chartTitle"
            class="vue-ui-xy-title"
            v-if="FINAL_CONFIG.chart.title.show"
            :style="`font-family:${FINAL_CONFIG.chart.fontFamily}`"
        >
            <Title
                :key="`title_${titleStep}`"
                :config="{
                    title: {
                        cy: 'xy-div-title',
                        ...FINAL_CONFIG.chart.title,
                    },
                    subtitle: {
                        cy: 'xy-div-subtitle',
                        ...FINAL_CONFIG.chart.title.subtitle,
                    },
                }"
            />
        </div>

        <div :id="`legend-top-${uniqueId}`" />

        <UserOptions
            ref="userOptionsRef"
            :key="`user_options_${step}`"
            v-if="
                FINAL_CONFIG.chart.userOptions.show &&
                (keepUserOptionState ? true : userOptionsVisible)
            "
            :backgroundColor="FINAL_CONFIG.chart.backgroundColor"
            :color="FINAL_CONFIG.chart.color"
            :isPrinting="isPrinting"
            :isImaging="isImaging"
            :uid="uniqueId"
            :hasTooltip="
                FINAL_CONFIG.chart.userOptions.buttons.tooltip &&
                FINAL_CONFIG.chart.tooltip.show
            "
            :hasPdf="FINAL_CONFIG.chart.userOptions.buttons.pdf"
            :hasXls="FINAL_CONFIG.chart.userOptions.buttons.csv"
            :hasImg="FINAL_CONFIG.chart.userOptions.buttons.img"
            :hasSvg="FINAL_CONFIG.chart.userOptions.buttons.svg"
            :hasLabel="FINAL_CONFIG.chart.userOptions.buttons.labels"
            :hasTable="FINAL_CONFIG.chart.userOptions.buttons.table"
            :hasStack="
                dataset.length > 1 &&
                FINAL_CONFIG.chart.userOptions.buttons.stack
            "
            :hasFullscreen="FINAL_CONFIG.chart.userOptions.buttons.fullscreen"
            :hasAltCopy="FINAL_CONFIG.chart.userOptions.buttons.altCopy"
            :isStacked="mutableConfig.isStacked"
            :isFullscreen="isFullscreen"
            :chartElement="$refs.chart"
            :position="FINAL_CONFIG.chart.userOptions.position"
            :isTooltip="mutableConfig.showTooltip"
            :titles="{ ...FINAL_CONFIG.chart.userOptions.buttonTitles }"
            :hasAnnotator="FINAL_CONFIG.chart.userOptions.buttons.annotator"
            :isAnnotation="isAnnotator"
            :callbacks="FINAL_CONFIG.chart.userOptions.callbacks"
            :tableDialog="FINAL_CONFIG.table.useDialog"
            :printScale="FINAL_CONFIG.chart.userOptions.print.scale"
            :isCursorPointer="isCursorPointer"
            @toggleFullscreen="toggleFullscreen"
            @generatePdf="generatePdf"
            @generateCsv="generateCsv"
            @generateImage="onGenerateImage"
            @generateSvg="generateSvg"
            @toggleTable="toggleTable"
            @toggleLabels="toggleLabels"
            @toggleStack="toggleStack"
            @toggleTooltip="toggleTooltip"
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
            <template #menuIcon="{ isOpen, color }" v-if="$slots.menuIcon">
                <slot name="menuIcon" v-bind="{ isOpen, color }" />
            </template>
            <template #optionTooltip v-if="$slots.optionTooltip">
                <slot name="optionTooltip" />
            </template>
            <template #optionPdf v-if="$slots.optionPdf">
                <slot name="optionPdf" />
            </template>
            <template #optionCsv v-if="$slots.optionCsv">
                <slot name="optionCsv" />
            </template>
            <template #optionImg v-if="$slots.optionImg">
                <slot name="optionImg" />
            </template>
            <template #optionSvg v-if="$slots.optionSvg">
                <slot name="optionSvg" />
            </template>
            <template #optionTable v-if="$slots.optionTable">
                <slot name="optionTable" />
            </template>
            <template #optionLabels v-if="$slots.optionLabels">
                <slot name="optionLabels" />
            </template>
            <template #optionStack="{ isStack }" v-if="$slots.optionStack">
                <slot name="optionStack" v-bind="{ isStack }" />
            </template>
            <template
                v-if="$slots.optionFullscreen"
                template
                #optionFullscreen="{ toggleFullscreen, isFullscreen }"
            >
                <slot
                    name="optionFullscreen"
                    v-bind="{ toggleFullscreen, isFullscreen }"
                />
            </template>
            <template
                v-if="$slots.optionAnnotator"
                #optionAnnotator="{ toggleAnnotator, isAnnotator }"
            >
                <slot
                    name="optionAnnotator"
                    v-bind="{ toggleAnnotator, isAnnotator }"
                />
            </template>
            <template
                v-if="$slots.optionAltCopy"
                #optionAltCopy="{ altCopy: c }"
            >
                <slot name="optionAltCopy" v-bind="{ altCopy: c }" />
            </template>
            <template #custom-menu-before v-if="$slots['custom-menu-before']">
                <slot name="custom-menu-before" />
            </template>
            <template #custom-menu-after v-if="$slots['custom-menu-after']">
                <slot name="custom-menu-after" />
            </template>
        </UserOptions>

        <div style="position: relative">
            <svg
                ref="svgRef"
                xmlns="http://www.w3.org/2000/svg"
                :class="{
                    'vue-data-ui-fullscreen--on': isFullscreen,
                    'vue-data-ui-fulscreen--off': !isFullscreen,
                }"
                data-cy="xy-svg"
                :width="'100%'"
                :viewBox="viewBox"
                class="vue-ui-xy-svg vue-data-ui-svg"
                :style="{
                    background: 'transparent',
                    color: FINAL_CONFIG.chart.color,
                    fontFamily: FINAL_CONFIG.chart.fontFamily,
                }"
                :aria-label="chartAriaLabel"
                :aria-describedby="`chart-instructions-${uniqueId}`"
                aria-live="polite"
                role="img"
                tabindex="0"
                preserveAspectRatio="xMidYMid"
                @mousemove="onSvgMouseMove"
                @mouseleave="onSvgMouseLeave"
                @click="onSvgClick"
                @focus="onSvgFocus"
                @blur="onSvgBlur"
                @keydown="onSvgKeydown"
            >
                <g ref="G" class="vue-data-ui-g">
                    <PackageVersion />

                    <!-- BACKGROUND SLOT -->
                    <foreignObject
                        v-if="$slots['chart-background']"
                        :x="Math.max(0, drawingArea?.left)"
                        :y="drawingArea?.top"
                        :width="Math.max(0, drawingArea?.width)"
                        :height="Math.max(0, drawingArea?.height)"
                        :style="{
                            pointerEvents: 'none',
                        }"
                    >
                        <slot name="chart-background" />
                    </foreignObject>

                    <g v-if="maxSeries > 0">
                        <!-- GRID -->
                        <g class="vue-ui-xy-grid">
                            <line
                                v-if="
                                    FINAL_CONFIG.chart.grid.labels.xAxis
                                        .showBaseline
                                "
                                data-cy="xy-grid-line-x"
                                :stroke="FINAL_CONFIG.chart.grid.stroke"
                                stroke-width="1"
                                :x1="drawingArea?.left"
                                :x2="drawingArea?.right"
                                :y1="forceValidValue(drawingArea?.bottom)"
                                :y2="forceValidValue(drawingArea?.bottom)"
                                stroke-linecap="round"
                                :style="{ animation: 'none !important' }"
                            />
                            <template v-if="!mutableConfig.useIndividualScale">
                                <line
                                    class="vue-ui-xy-y-axis"
                                    v-if="
                                        FINAL_CONFIG.chart.grid.labels.yAxis
                                            .showBaseline
                                    "
                                    data-cy="xy-grid-line-y"
                                    :stroke="FINAL_CONFIG.chart.grid.stroke"
                                    stroke-width="1"
                                    :x1="
                                        yAxisLabelsAreRight
                                            ? drawingArea?.right
                                            : drawingArea?.left
                                    "
                                    :x2="
                                        yAxisLabelsAreRight
                                            ? drawingArea?.right
                                            : drawingArea?.left
                                    "
                                    :y1="forceValidValue(drawingArea?.top)"
                                    :y2="forceValidValue(drawingArea?.bottom)"
                                    stroke-linecap="round"
                                    :style="{ animation: 'none !important' }"
                                />
                                <g
                                    v-if="
                                        FINAL_CONFIG.chart.grid
                                            .showHorizontalLines
                                    "
                                >
                                    <line
                                        data-cy="xy-grid-horizontal-line"
                                        v-for="l in yLabels"
                                        :key="`horizontal_grid_line_${l.value}_${l.y}`"
                                        :x1="drawingArea?.left"
                                        :x2="drawingArea?.right"
                                        :y1="forceValidValue(l.y)"
                                        :y2="forceValidValue(l.y)"
                                        :stroke="FINAL_CONFIG.chart.grid.stroke"
                                        :stroke-width="0.5"
                                        stroke-linecap="round"
                                        :style="{
                                            animation: 'none !important',
                                        }"
                                    />
                                </g>
                            </template>
                            <template
                                v-else-if="
                                    FINAL_CONFIG.chart.grid.showHorizontalLines
                                "
                            >
                                <g
                                    v-for="grid in allScales"
                                    :key="`individual_grid_${grid.groupId || grid.id}`"
                                >
                                    <template
                                        v-if="
                                            grid.id === selectedScale &&
                                            grid.yLabels.length
                                        "
                                    >
                                        <line
                                            v-for="l in grid.yLabels"
                                            :key="`selected_individual_grid_line_${grid.groupId || grid.id}_${l.value}_${l.y}`"
                                            :x1="drawingArea?.left"
                                            :x2="drawingArea?.right"
                                            :y1="forceValidValue(l.y)"
                                            :y2="forceValidValue(l.y)"
                                            :stroke="grid.color"
                                            :stroke-width="0.5"
                                            stroke-linecap="round"
                                            :style="{
                                                animation: 'none !important',
                                            }"
                                        />
                                    </template>
                                    <template v-else-if="grid.yLabels.length">
                                        <line
                                            v-for="l in grid.yLabels"
                                            :key="`individual_grid_line_${grid.groupId || grid.id}_${l.value}_${l.y}`"
                                            :x1="drawingArea?.left"
                                            :x2="drawingArea?.right"
                                            :y1="forceValidValue(l.y)"
                                            :y2="forceValidValue(l.y)"
                                            :stroke="
                                                FINAL_CONFIG.chart.grid.stroke
                                            "
                                            :stroke-width="0.5"
                                            stroke-linecap="round"
                                            :style="{
                                                animation: 'none !important',
                                            }"
                                        />
                                    </template>
                                </g>
                            </template>
                            <g v-if="FINAL_CONFIG.chart.grid.showVerticalLines">
                                <path
                                    data-cy="xy-grid-vertical-line"
                                    :d="gridVerticalLines"
                                    :stroke-width="0.5"
                                    :stroke="FINAL_CONFIG.chart.grid.stroke"
                                    stroke-linecap="round"
                                    :style="{ animation: 'none !important' }"
                                />
                            </g>

                            <g
                                v-if="
                                    FINAL_CONFIG.chart.grid.labels.xAxisLabels
                                        .show
                                "
                            >
                                <path
                                    :d="crosshairsX"
                                    :stroke="FINAL_CONFIG.chart.grid.stroke"
                                    :stroke-width="1"
                                    stroke-linecap="round"
                                    :style="{ animation: 'none !important' }"
                                />
                            </g>
                        </g>

                        <!-- DEFS BARS -->
                        <template
                            v-for="(serie, i) in barSet"
                            :key="`def_rect_${i}`"
                        >
                            <defs :data-cy="`xy-def-bar-${i}`">
                                <template v-if="$slots['bar-gradient']">
                                    <slot
                                        name="bar-gradient"
                                        v-bind="{
                                            series: serie,
                                            positiveId: `rectGradient_pos_${i}_${uniqueId}`,
                                            negativeId: `rectGradient_neg_${i}_${uniqueId}`,
                                        }"
                                    />
                                </template>
                                <template v-else>
                                    <DefGrad
                                        t="linear"
                                        :id="`rectGradient_pos_${i}_${uniqueId}`"
                                        x2="0%"
                                        y2="100%"
                                        :stops="[
                                            ['0%', serie.color, 1],
                                            [
                                                '62%',
                                                shiftHue(serie.color, 0.02),
                                                1,
                                            ],
                                            [
                                                '100%',
                                                shiftHue(serie.color, 0.05),
                                                1,
                                            ],
                                        ]"
                                    />
                                    <DefGrad
                                        t="linear"
                                        :id="`rectGradient_neg_${i}_${uniqueId}`"
                                        x2="0%"
                                        y2="100%"
                                        :stops="[
                                            [
                                                '0%',
                                                shiftHue(serie.color, 0.05),
                                                1,
                                            ],
                                            [
                                                '38%',
                                                shiftHue(serie.color, 0.02),
                                                1,
                                            ],
                                            ['100%', serie.color, 1],
                                        ]"
                                    />
                                </template>
                            </defs>
                        </template>

                        <!-- DEFS PLOTS -->
                        <template
                            v-for="(serie, i) in plotSet"
                            :key="`def_plot_${i}`"
                        >
                            <defs :data-cy="`xy-def-plot-${i}`">
                                <DefGrad
                                    t="radial"
                                    :id="`plotGradient_${i}_${uniqueId}`"
                                    cx="50%"
                                    cy="50%"
                                    r="50%"
                                    fx="50%"
                                    fy="50%"
                                    :stops="[
                                        ['0%', shiftHue(serie.color, 0.05), 1],
                                        ['100%', serie.color, 1],
                                    ]"
                                />
                            </defs>
                        </template>

                        <!-- DEFS LINES -->
                        <template
                            v-for="(serie, i) in lineSet"
                            :key="`def_line_${serie.id}`"
                        >
                            <defs :data-cy="`xy-def-line-${i}`">
                                <DefGrad
                                    t="radial"
                                    :id="`lineGradient_${i}_${uniqueId}`"
                                    cx="50%"
                                    cy="50%"
                                    r="50%"
                                    fx="50%"
                                    fy="50%"
                                    :stops="[
                                        ['0%', shiftHue(serie.color, 0.05), 1],
                                        ['100%', serie.color, 1],
                                    ]"
                                />
                                <slot
                                    v-if="$slots['area-gradient']"
                                    name="area-gradient"
                                    v-bind="{
                                        series: serie,
                                        id: `areaGradient_${i}_${uniqueId}`,
                                    }"
                                />
                                <DefGrad
                                    v-else
                                    t="linear"
                                    :id="`areaGradient_${i}_${uniqueId}`"
                                    x1="0%"
                                    x2="100%"
                                    y1="0%"
                                    y2="0%"
                                    :stops="[
                                        [
                                            '0%',
                                            setOpacity(
                                                shiftHue(serie.color, 0.03),
                                                FINAL_CONFIG.line.area.opacity,
                                            ),
                                            1,
                                        ],
                                        [
                                            '100%',
                                            setOpacity(
                                                serie.color,
                                                FINAL_CONFIG.line.area.opacity,
                                            ),
                                            1,
                                        ],
                                    ]"
                                />
                            </defs>
                            <defs
                                v-if="
                                    serie.temperatureColors &&
                                    !serie.isFlatTemperatureLine
                                "
                            >
                                <linearGradient
                                    :id="`temperature_grad_line_${i}_${uniqueId}`"
                                    gradientTransform="rotate(90)"
                                >
                                    <stop
                                        v-for="(
                                            color, j
                                        ) in serie.temperatureColors"
                                        :key="`temperature_grad_stop_${i}_${j}_${uniqueId}`"
                                        :stop-color="color"
                                        :offset="
                                            setGradientOffset(
                                                j,
                                                serie.temperatureColors.length,
                                            )
                                        "
                                    />
                                </linearGradient>
                            </defs>
                        </template>

                        <!-- HIGHLIGHT AREAS -->
                        <g
                            v-for="oneArea in highlightAreas"
                            :key="`highlight_area_${oneArea.from}_${oneArea.span}_${oneArea.color}`"
                        >
                            <template v-if="oneArea.show">
                                <!-- HIGHLIGHT AREA FILLED RECT UNITS -->
                                <g
                                    v-for="(_, i) in oneArea.span"
                                    :key="`highlight_area_rect_${oneArea.from}_${i}`"
                                >
                                    <rect
                                        data-cy="highlight-area"
                                        :style="{
                                            transition: 'none',
                                            opacity:
                                                oneArea.from + i >=
                                                    slicer.start &&
                                                oneArea.from + i <=
                                                    slicer.end - 1
                                                    ? 1
                                                    : 0,
                                        }"
                                        :x="
                                            getClampedHorizontalBandX(
                                                oneArea.from + i - slicer.start,
                                            )
                                        "
                                        :y="drawingArea?.top"
                                        :height="
                                            drawingArea.height < 0
                                                ? 10
                                                : drawingArea.height
                                        "
                                        :width="
                                            getHighlightAreaHorizontalBandWidth(
                                                oneArea.from + i - slicer.start,
                                            )
                                        "
                                        :fill="
                                            setOpacity(
                                                oneArea.color,
                                                oneArea.opacity,
                                            )
                                        "
                                    />
                                </g>
                                <!-- HIGHLIGHT AREA CAPTION -->
                                <g
                                    v-for="(_, i) in oneArea.span"
                                    :key="`highlight_area_caption_${oneArea.from}_${i}`"
                                >
                                    <foreignObject
                                        v-if="oneArea.caption.text && i === 0"
                                        :x="
                                            getClampedHorizontalBandX(
                                                oneArea.from + i - slicer.start,
                                            ) -
                                            (oneArea.caption.width === 'auto'
                                                ? 0
                                                : oneArea.caption.width / 2 -
                                                  getHorizontalSpanWidth(
                                                      oneArea.span,
                                                  ) /
                                                      2)
                                        "
                                        :y="
                                            drawingArea?.top +
                                            oneArea.caption.offsetY
                                        "
                                        :style="{
                                            overflow: 'visible',
                                            opacity:
                                                oneArea.to >= slicer.start &&
                                                oneArea.from < slicer.end
                                                    ? 1
                                                    : 0,
                                        }"
                                        height="1"
                                        :width="
                                            oneArea.caption.width === 'auto'
                                                ? getHorizontalSpanWidth(
                                                      oneArea.span,
                                                  )
                                                : oneArea.caption.width
                                        "
                                    >
                                        <div
                                            data-cy="highlight-area-caption"
                                            :style="`padding:${oneArea.caption.padding}px;text-align:${oneArea.caption.textAlign};font-size:${oneArea.caption.fontSize}px;color:${oneArea.caption.color};font-weight:${oneArea.caption.bold ? 'bold' : 'normal'}`"
                                        >
                                            {{ oneArea.caption.text }}
                                        </div>
                                    </foreignObject>
                                </g>
                            </template>
                        </g>

                        <!-- HIGHLIGHTERS -->
                        <g v-if="userHovers && !isContinuousScale">
                            <g
                                v-for="(_, i) in maxSeries"
                                :key="`tooltip_trap_highlighter_${i}`"
                            >
                                <rect
                                    data-cy="highlighter"
                                    :x="getClampedHorizontalBandX(i)"
                                    :y="drawingArea?.top"
                                    :height="
                                        drawingArea.height < 0
                                            ? 10
                                            : drawingArea.height
                                    "
                                    :width="
                                        getHighlighterHorizontalBandWidth(i)
                                    "
                                    :fill="
                                        [
                                            selectedMinimapIndex,
                                            selectedSerieIndex,
                                            selectedRowIndex,
                                        ].includes(i)
                                            ? setOpacity(
                                                  FINAL_CONFIG.chart.highlighter
                                                      .color,
                                                  FINAL_CONFIG.chart.highlighter
                                                      .crosshairs.show
                                                      ? 0
                                                      : FINAL_CONFIG.chart
                                                            .highlighter
                                                            .opacity,
                                              )
                                            : 'transparent'
                                    "
                                    :style="{
                                        transition: 'none !important',
                                        animation: 'none !important',
                                    }"
                                />
                            </g>
                        </g>

                        <!-- BARS -->
                        <template v-if="barSet.length">
                            <g
                                v-for="(serie, i) in barSet"
                                :key="`serie_bar_${serie.id}`"
                                :class="`serie_bar_${i}`"
                                :style="`opacity:${selectedScale ? (selectedScale === serie.groupId ? 1 : 0.2) : 1};transition:opacity 0.2s ease-in-out`"
                            >
                                <g
                                    v-for="(plot, j) in serie.plots"
                                    :key="`bar_plot_${i}_${j}`"
                                >
                                    <rect
                                        data-cy="datapoint-bar"
                                        v-if="canShowValue(plot.value)"
                                        :x="calcRectX(plot) + barInnerGap / 2"
                                        :y="
                                            mutableConfig.useIndividualScale
                                                ? calcIndividualRectY(plot)
                                                : calcRectY(plot)
                                        "
                                        :height="
                                            mutableConfig.useIndividualScale
                                                ? Math.abs(
                                                      calcIndividualHeight(
                                                          plot,
                                                      ),
                                                  )
                                                : Math.abs(calcRectHeight(plot))
                                        "
                                        :width="barWidth - barInnerGap"
                                        :rx="FINAL_CONFIG.bar.borderRadius"
                                        :fill="
                                            FINAL_CONFIG.bar.useGradient
                                                ? plot.value >= 0
                                                    ? `url(#rectGradient_pos_${i}_${uniqueId})`
                                                    : `url(#rectGradient_neg_${i}_${uniqueId})`
                                                : serie.color
                                        "
                                        :stroke="
                                            FINAL_CONFIG.bar.border
                                                .useSerieColor
                                                ? serie.color
                                                : FINAL_CONFIG.bar.border.stroke
                                        "
                                        :stroke-width="
                                            FINAL_CONFIG.bar.border.strokeWidth
                                        "
                                        :style="{
                                            transition:
                                                loading ||
                                                !FINAL_CONFIG.bar.showTransition
                                                    ? undefined
                                                    : `all ${FINAL_CONFIG.bar.transitionDurationMs}ms ease-in-out`,
                                        }"
                                    />
                                    <rect
                                        data-cy="datapoint-bar"
                                        v-if="
                                            canShowValue(plot.value) &&
                                            $slots.pattern
                                        "
                                        :x="calcRectX(plot) - barInnerGap / 2"
                                        :y="
                                            mutableConfig.useIndividualScale
                                                ? calcIndividualRectY(plot)
                                                : calcRectY(plot)
                                        "
                                        :height="
                                            mutableConfig.useIndividualScale
                                                ? Math.abs(
                                                      calcIndividualHeight(
                                                          plot,
                                                      ),
                                                  )
                                                : Math.abs(calcRectHeight(plot))
                                        "
                                        :width="barWidth - barInnerGap"
                                        :rx="FINAL_CONFIG.bar.borderRadius"
                                        :fill="`url(#pattern_${uniqueId}_${serie.slotAbsoluteIndex})`"
                                        :stroke="
                                            FINAL_CONFIG.bar.border
                                                .useSerieColor
                                                ? serie.color
                                                : FINAL_CONFIG.bar.border.stroke
                                        "
                                        :stroke-width="
                                            FINAL_CONFIG.bar.border.strokeWidth
                                        "
                                        :style="{
                                            transition:
                                                loading ||
                                                !FINAL_CONFIG.bar.showTransition
                                                    ? undefined
                                                    : `all ${FINAL_CONFIG.bar.transitionDurationMs}ms ease-in-out`,
                                        }"
                                    />

                                    <template
                                        v-if="
                                            plot.comment &&
                                            FINAL_CONFIG.chart.comments.show
                                        "
                                    >
                                        <foreignObject
                                            style="overflow: visible"
                                            height="12"
                                            :width="
                                                barWidth +
                                                FINAL_CONFIG.chart.comments
                                                    .width
                                            "
                                            :x="
                                                calcRectX(plot) -
                                                FINAL_CONFIG.chart.comments
                                                    .width /
                                                    2 +
                                                FINAL_CONFIG.chart.comments
                                                    .offsetX
                                            "
                                            :y="
                                                checkNaN(plot.y) +
                                                FINAL_CONFIG.chart.comments
                                                    .offsetY +
                                                6
                                            "
                                        >
                                            <slot
                                                name="plot-comment"
                                                :plot="{
                                                    ...plot,
                                                    color: serie.color,
                                                    seriesIndex: i,
                                                    datapointIndex: j,
                                                }"
                                            />
                                        </foreignObject>
                                    </template>
                                </g>
                            </g>
                        </template>

                        <!-- ZERO LINE (AFTER BAR DATASETS, BEFORE LABELS) -->
                        <template
                            v-if="
                                !mutableConfig.useIndividualScale &&
                                FINAL_CONFIG.chart.grid.labels.zeroLine.show
                            "
                        >
                            <line
                                data-cy="xy-grid-line-x"
                                :stroke="FINAL_CONFIG.chart.grid.stroke"
                                stroke-width="1"
                                :x1="drawingArea?.left"
                                :x2="drawingArea?.right"
                                :y1="forceValidValue(visibleZeroOrBaseline)"
                                :y2="forceValidValue(visibleZeroOrBaseline)"
                                stroke-linecap="round"
                                :style="{ animation: 'none !important' }"
                            />
                        </template>

                        <!-- HIGHLIGHTER (useLine) -->
                        <g
                            v-if="
                                !FINAL_CONFIG.chart.highlighter.crosshairs
                                    .show &&
                                (FINAL_CONFIG.chart.highlighter.useLine ||
                                    isContinuousScale) &&
                                hasHighlighterSelection
                            "
                        >
                            <line
                                :x1="highlighterX"
                                :x2="highlighterX"
                                :y1="forceValidValue(drawingArea?.top)"
                                :y2="forceValidValue(drawingArea?.bottom)"
                                :stroke="FINAL_CONFIG.chart.highlighter.color"
                                :stroke-width="
                                    FINAL_CONFIG.chart.highlighter.lineWidth
                                "
                                :stroke-dasharray="
                                    FINAL_CONFIG.chart.highlighter.lineDasharray
                                "
                                stroke-linecap="round"
                                style="
                                    transition: none !important;
                                    animation: none !important;
                                    pointer-events: none;
                                "
                            />
                        </g>

                        <!-- CROSSHAIR SELECTION (x & y lines, dot on y) -->
                        <g
                            v-if="crosshairsAreActive"
                            class="vue-ui-xy-crosshair-selection"
                        >
                            <g
                                v-for="plot in crosshairSelectedPlots"
                                :key="`crosshair_${plot.serie.id}_${plot.index}`"
                            >
                                <line
                                    :x1="
                                        FINAL_CONFIG.chart.highlighter
                                            .crosshairs.stopOnPoint
                                            ? forceValidValue(plot.x)
                                            : drawingArea.left
                                    "
                                    :x2="
                                        FINAL_CONFIG.chart.highlighter
                                            .crosshairs.stopOnPoint
                                            ? forceValidValue(
                                                  getCrosshairXEdge(plot.x),
                                              )
                                            : drawingArea.right
                                    "
                                    :y1="forceValidValue(plot.y)"
                                    :y2="forceValidValue(plot.y)"
                                    :stroke="
                                        FINAL_CONFIG.chart.highlighter
                                            .crosshairs.stroke
                                    "
                                    :stroke-width="
                                        FINAL_CONFIG.chart.highlighter
                                            .crosshairs.strokeWidth
                                    "
                                    :stroke-dasharray="
                                        FINAL_CONFIG.chart.highlighter
                                            .crosshairs.strokeDasharray
                                    "
                                    stroke-linecap="round"
                                    style="pointer-events: none"
                                />

                                <line
                                    :x1="forceValidValue(plot.x)"
                                    :x2="forceValidValue(plot.x)"
                                    :y1="
                                        FINAL_CONFIG.chart.highlighter
                                            .crosshairs.stopOnPoint
                                            ? forceValidValue(plot.y)
                                            : drawingArea.top
                                    "
                                    :y2="
                                        FINAL_CONFIG.chart.highlighter
                                            .crosshairs.stopOnPoint
                                            ? forceValidValue(
                                                  drawingArea.bottom,
                                              )
                                            : drawingArea.bottom
                                    "
                                    :stroke="
                                        FINAL_CONFIG.chart.highlighter
                                            .crosshairs.stroke
                                    "
                                    :stroke-width="
                                        FINAL_CONFIG.chart.highlighter
                                            .crosshairs.strokeWidth
                                    "
                                    :stroke-dasharray="
                                        FINAL_CONFIG.chart.highlighter
                                            .crosshairs.strokeDasharray
                                    "
                                    stroke-linecap="round"
                                    style="pointer-events: none"
                                />

                                <circle
                                    :cx="
                                        forceValidValue(
                                            getCrosshairXEdge(plot.x),
                                        )
                                    "
                                    :cy="forceValidValue(plot.y)"
                                    :r="
                                        FINAL_CONFIG.chart.highlighter
                                            .crosshairs.dot.radius
                                    "
                                    :fill="
                                        FINAL_CONFIG.chart.highlighter
                                            .crosshairs.dot.fill
                                    "
                                    :stroke="
                                        FINAL_CONFIG.chart.highlighter
                                            .crosshairs.dot.stroke
                                    "
                                    :stroke-width="
                                        FINAL_CONFIG.chart.highlighter
                                            .crosshairs.dot.strokeWidth
                                    "
                                    style="pointer-events: none"
                                />
                            </g>
                        </g>

                        <!-- FRAME -->
                        <rect
                            data-cy="frame"
                            v-if="FINAL_CONFIG.chart.grid.frame.show"
                            :style="{
                                pointerEvents: 'none',
                                transition: 'none',
                                animation: 'none !important',
                            }"
                            :x="Math.max(0, drawingArea?.left)"
                            :y="drawingArea?.top"
                            :width="Math.max(0, drawingArea?.width)"
                            :height="
                                drawingArea.height < 0 ? 0 : drawingArea.height
                            "
                            fill="transparent"
                            :stroke="FINAL_CONFIG.chart.grid.frame.stroke"
                            :stroke-width="
                                FINAL_CONFIG.chart.grid.frame.strokeWidth
                            "
                            :stroke-linecap="
                                FINAL_CONFIG.chart.grid.frame.strokeLinecap
                            "
                            :stroke-linejoin="
                                FINAL_CONFIG.chart.grid.frame.strokeLinejoin
                            "
                            :stroke-dasharray="
                                FINAL_CONFIG.chart.grid.frame.strokeDasharray
                            "
                        />

                        <!-- Y LABELS -->
                        <g
                            v-if="FINAL_CONFIG.chart.grid.labels.show"
                            ref="scaleLabels"
                            :opacity="crosshairsAreActive ? 0.2 : 1"
                            style="transition: opacity 0.2s"
                        >
                            <template v-if="mutableConfig.useIndividualScale">
                                <g
                                    v-for="el in allScales"
                                    :key="`individual_scale_axis_${el.groupId || el.id}`"
                                >
                                    <line
                                        :x1="
                                            mutableConfig.isStacked
                                                ? yAxisLabelsAreRight
                                                    ? drawingArea.right
                                                    : drawingArea.left
                                                : yAxisLabelsAreRight
                                                  ? el.x
                                                  : el.x -
                                                    drawingArea.individualOffsetX
                                        "
                                        :x2="
                                            mutableConfig.isStacked
                                                ? yAxisLabelsAreRight
                                                    ? drawingArea.right
                                                    : drawingArea.left
                                                : yAxisLabelsAreRight
                                                  ? el.x
                                                  : el.x -
                                                    drawingArea.individualOffsetX
                                        "
                                        :y1="
                                            mutableConfig.isStacked
                                                ? forceValidValue(
                                                      drawingArea?.bottom -
                                                          el.yOffset -
                                                          el.individualHeight,
                                                  )
                                                : forceValidValue(
                                                      drawingArea?.top,
                                                  )
                                        "
                                        :y2="
                                            mutableConfig.isStacked
                                                ? forceValidValue(
                                                      drawingArea?.bottom -
                                                          el.yOffset,
                                                  )
                                                : forceValidValue(
                                                      drawingArea?.bottom,
                                                  )
                                        "
                                        :stroke="el.color"
                                        :stroke-width="
                                            FINAL_CONFIG.chart.grid.stroke
                                        "
                                        stroke-linecap="round"
                                        :style="`opacity:${selectedScale ? (selectedScale === el.groupId ? 1 : 0.3) : 1};transition:opacity 0.2s ease-in-out; animation: none !important`"
                                    />
                                </g>

                                <g
                                    v-for="el in allScales"
                                    :key="`individual_scale_label_${el.groupId || el.id}`"
                                    :style="`opacity:${selectedScale ? (selectedScale === el.groupId ? 1 : 0.3) : 1};transition:opacity 0.2s ease-in-out`"
                                >
                                    <text
                                        :class="{
                                            'vue-data-ui-datalabel': isReady,
                                        }"
                                        :fill="el.color"
                                        :font-size="fontSizes.dataLabels * 0.8"
                                        text-anchor="middle"
                                        :transform="`translate(${
                                            mutableConfig.isStacked
                                                ? yAxisLabelsAreRight
                                                    ? drawingArea.right +
                                                      FINAL_CONFIG.chart.grid
                                                          .labels.yAxis
                                                          .crosshairSize +
                                                      FINAL_CONFIG.chart.grid
                                                          .labels.yAxis
                                                          .scaleValueOffsetX +
                                                      5 +
                                                      FINAL_CONFIG.chart.grid
                                                          .labels.yAxis
                                                          .labelWidth +
                                                      drawingArea.individualOffsetX +
                                                      FINAL_CONFIG.chart.grid
                                                          .labels.axis
                                                          .yLabelOffsetX
                                                    : drawingArea.left -
                                                      FINAL_CONFIG.chart.grid
                                                          .labels.yAxis
                                                          .crosshairSize -
                                                      FINAL_CONFIG.chart.grid
                                                          .labels.yAxis
                                                          .scaleValueOffsetX -
                                                      FINAL_CONFIG.chart.grid
                                                          .labels.yAxis
                                                          .labelWidth -
                                                      FINAL_CONFIG.chart.grid
                                                          .labels.axis
                                                          .yLabelOffsetX
                                                : yAxisLabelsAreRight
                                                  ? el.x +
                                                    FINAL_CONFIG.chart.grid
                                                        .labels.yAxis
                                                        .crosshairSize +
                                                    FINAL_CONFIG.chart.grid
                                                        .labels.yAxis
                                                        .scaleValueOffsetX +
                                                    5 +
                                                    FINAL_CONFIG.chart.grid
                                                        .labels.yAxis
                                                        .labelWidth +
                                                    FINAL_CONFIG.chart.grid
                                                        .labels.axis
                                                        .yLabelOffsetX
                                                  : el.x -
                                                    (fontSizes.dataLabels *
                                                        0.8) /
                                                        2
                                        }, ${
                                            mutableConfig.isStacked
                                                ? drawingArea?.bottom -
                                                  el.yOffset -
                                                  el.individualHeight / 2
                                                : drawingArea?.top +
                                                  drawingArea.height / 2
                                        }) rotate(-90)`"
                                    >
                                        {{ el.name }}
                                        {{
                                            el.scaleLabel &&
                                            el.unique &&
                                            el.scaleLabel !== el.id
                                                ? `- ${el.scaleLabel}`
                                                : ''
                                        }}
                                    </text>

                                    <template
                                        v-for="(yLabel, j) in el.yLabels"
                                        :key="`individual_scale_y_crosshair_${el.groupId || el.id}_${yLabel.value}_${j}`"
                                    >
                                        <line
                                            v-if="
                                                FINAL_CONFIG.chart.grid.labels
                                                    .yAxis.showCrosshairs
                                            "
                                            :x1="
                                                mutableConfig.isStacked
                                                    ? yAxisLabelsAreRight
                                                        ? drawingArea.right
                                                        : drawingArea.left
                                                    : yAxisLabelsAreRight
                                                      ? el.x
                                                      : el.x +
                                                        3 -
                                                        FINAL_CONFIG.chart.grid
                                                            .labels.yAxis
                                                            .crosshairSize -
                                                        drawingArea.individualOffsetX
                                            "
                                            :x2="
                                                mutableConfig.isStacked
                                                    ? yAxisLabelsAreRight
                                                        ? drawingArea.right +
                                                          FINAL_CONFIG.chart
                                                              .grid.labels.yAxis
                                                              .crosshairSize
                                                        : drawingArea.left -
                                                          FINAL_CONFIG.chart
                                                              .grid.labels.yAxis
                                                              .crosshairSize
                                                    : yAxisLabelsAreRight
                                                      ? el.x +
                                                        FINAL_CONFIG.chart.grid
                                                            .labels.yAxis
                                                            .crosshairSize
                                                      : el.x -
                                                        drawingArea.individualOffsetX
                                            "
                                            :y1="forceValidValue(yLabel.y)"
                                            :y2="forceValidValue(yLabel.y)"
                                            :stroke="el.color"
                                            :stroke-width="1"
                                            stroke-linecap="round"
                                            :style="{
                                                animation: 'none !important',
                                            }"
                                        />
                                    </template>

                                    <text
                                        :class="{
                                            'vue-data-ui-datalabel': isReady,
                                        }"
                                        v-for="(yLabel, j) in el.yLabels"
                                        :key="`individual_scale_y_label_${el.groupId || el.id}_${yLabel.value}_${j}`"
                                        :transform="`translate(${
                                            mutableConfig.isStacked
                                                ? yAxisLabelsAreRight
                                                    ? drawingArea.right +
                                                      FINAL_CONFIG.chart.grid
                                                          .labels.yAxis
                                                          .crosshairSize +
                                                      FINAL_CONFIG.chart.grid
                                                          .labels.yAxis
                                                          .scaleValueOffsetX +
                                                      5
                                                    : drawingArea.left -
                                                      FINAL_CONFIG.chart.grid
                                                          .labels.yAxis
                                                          .crosshairSize -
                                                      FINAL_CONFIG.chart.grid
                                                          .labels.yAxis
                                                          .scaleValueOffsetX -
                                                      5
                                                : yAxisLabelsAreRight
                                                  ? el.x +
                                                    FINAL_CONFIG.chart.grid
                                                        .labels.yAxis
                                                        .crosshairSize +
                                                    FINAL_CONFIG.chart.grid
                                                        .labels.yAxis
                                                        .scaleValueOffsetX +
                                                    5
                                                  : el.x -
                                                    5 -
                                                    drawingArea.individualOffsetX
                                        }, ${forceValidValue(yLabel.y) + fontSizes.dataLabels / 3})`"
                                        :text-anchor="
                                            yAxisLabelsAreRight
                                                ? 'start'
                                                : 'end'
                                        "
                                        :font-size="fontSizes.dataLabels"
                                        :fill="el.color"
                                    >
                                        {{
                                            applyDataLabel(
                                                FINAL_CONFIG.chart.grid.labels
                                                    .yAxis.formatter,
                                                yLabel.value,
                                                dataLabel({
                                                    p: yLabel.prefix,
                                                    v: yLabel.value,
                                                    s: yLabel.suffix,
                                                    r: FINAL_CONFIG.chart.grid
                                                        .labels.yAxis.rounding,
                                                }),
                                                {
                                                    datapoint: yLabel.datapoint,
                                                    seriesIndex: j,
                                                },
                                            )
                                        }}
                                    </text>
                                </g>
                            </template>
                            <template v-else>
                                <g
                                    v-for="(yLabel, i) in yLabels"
                                    :key="`yLabel_${i}`"
                                >
                                    <line
                                        data-cy="axis-y-tick"
                                        v-if="
                                            canShowValue(yLabel) &&
                                            yLabel.value >= niceScale.min &&
                                            yLabel.value <= niceScale.max &&
                                            FINAL_CONFIG.chart.grid.labels.yAxis
                                                .showCrosshairs
                                        "
                                        :x1="
                                            yAxisLabelsAreRight
                                                ? drawingArea?.right
                                                : drawingArea?.left
                                        "
                                        :x2="
                                            yAxisLabelsAreRight
                                                ? drawingArea?.right +
                                                  FINAL_CONFIG.chart.grid.labels
                                                      .yAxis.crosshairSize
                                                : drawingArea?.left -
                                                  FINAL_CONFIG.chart.grid.labels
                                                      .yAxis.crosshairSize
                                        "
                                        :y1="forceValidValue(yLabel.y)"
                                        :y2="forceValidValue(yLabel.y)"
                                        :stroke="FINAL_CONFIG.chart.grid.stroke"
                                        stroke-width="1"
                                        stroke-linecap="round"
                                        :style="{
                                            animation: 'none !important',
                                        }"
                                    />
                                    <text
                                        :class="{
                                            'vue-data-ui-datalabel': isReady,
                                        }"
                                        data-cy="axis-y-label"
                                        v-if="
                                            yLabel.value >= niceScale.min &&
                                            yLabel.value <= niceScale.max
                                        "
                                        :transform="`translate(${
                                            yAxisLabelsAreRight
                                                ? drawingArea.right +
                                                  FINAL_CONFIG.chart.grid.labels
                                                      .yAxis.crosshairSize +
                                                  FINAL_CONFIG.chart.grid.labels
                                                      .yAxis.scaleValueOffsetX +
                                                  5
                                                : drawingArea.scaleLabelX -
                                                  FINAL_CONFIG.chart.grid.labels
                                                      .yAxis.crosshairSize
                                        }, ${checkNaN(yLabel.y + fontSizes.dataLabels / 3)})`"
                                        :font-size="fontSizes.dataLabels"
                                        :text-anchor="
                                            yAxisLabelsAreRight
                                                ? 'start'
                                                : 'end'
                                        "
                                        :fill="
                                            FINAL_CONFIG.chart.grid.labels.color
                                        "
                                    >
                                        {{
                                            canShowValue(yLabel.value)
                                                ? applyDataLabel(
                                                      FINAL_CONFIG.chart.grid
                                                          .labels.yAxis
                                                          .formatter,
                                                      yLabel.value,
                                                      dataLabel({
                                                          p: yLabel.prefix,
                                                          v: yLabel.value,
                                                          s: yLabel.suffix,
                                                          r: FINAL_CONFIG.chart
                                                              .grid.labels.yAxis
                                                              .rounding,
                                                      }),
                                                  )
                                                : ''
                                        }}
                                    </text>
                                </g>
                            </template>
                        </g>

                        <!-- CROSSHAIR SELECTION (label on y) -->
                        <g
                            v-if="crosshairsAreActive"
                            class="vue-ui-xy-crosshair-selection"
                        >
                            <text
                                :class="{ 'vue-data-ui-datalabel': isReady }"
                                v-for="plot in crosshairSelectedPlots"
                                :key="`crosshair_y_label_${plot.serie.id}_${plot.index}`"
                                :transform="`translate(${
                                    yAxisLabelsAreRight
                                        ? drawingArea.right +
                                          FINAL_CONFIG.chart.grid.labels.yAxis
                                              .crosshairSize +
                                          FINAL_CONFIG.chart.grid.labels.yAxis
                                              .scaleValueOffsetX +
                                          5
                                        : drawingArea.scaleLabelX -
                                          FINAL_CONFIG.chart.grid.labels.yAxis
                                              .crosshairSize
                                }, ${forceValidValue(plot.y) + fontSizes.dataLabels / 3})`"
                                :font-size="fontSizes.dataLabels"
                                :text-anchor="
                                    yAxisLabelsAreRight ? 'start' : 'end'
                                "
                                :fill="FINAL_CONFIG.chart.grid.labels.color"
                                style="
                                    transition: none !important;
                                    animation: none !important;
                                    pointer-events: none;
                                "
                            >
                                {{
                                    applyDataLabel(
                                        FINAL_CONFIG.chart.grid.labels.yAxis
                                            .formatter,
                                        plot.value,
                                        dataLabel({
                                            p:
                                                plot.serie.prefix ||
                                                FINAL_CONFIG.chart.labels
                                                    .prefix,
                                            v: plot.value,
                                            s:
                                                plot.serie.suffix ||
                                                FINAL_CONFIG.chart.labels
                                                    .suffix,
                                            r: FINAL_CONFIG.chart.grid.labels
                                                .yAxis.rounding,
                                        }),
                                        {
                                            datapoint: plot.serie,
                                            seriesIndex: plot.index,
                                        },
                                    )
                                }}
                            </text>
                        </g>

                        <!-- CROSSHAIR SELECTION (dot on x, before line & plot series) -->
                        <g
                            v-if="crosshairXAxisLabel"
                            class="vue-ui-xy-crosshair-selection"
                        >
                            <circle
                                :cx="highlighterX"
                                :cy="forceValidValue(drawingArea?.bottom)"
                                :r="
                                    FINAL_CONFIG.chart.highlighter.crosshairs
                                        .dot.radius
                                "
                                :fill="
                                    FINAL_CONFIG.chart.highlighter.crosshairs
                                        .dot.fill
                                "
                                :stroke="
                                    FINAL_CONFIG.chart.highlighter.crosshairs
                                        .dot.stroke
                                "
                                :stroke-width="
                                    FINAL_CONFIG.chart.highlighter.crosshairs
                                        .dot.strokeWidth
                                "
                                style="
                                    transition: none !important;
                                    animation: none !important;
                                    pointer-events: none;
                                "
                            />
                        </g>

                        <!-- PLOTS -->
                        <g
                            v-for="(serie, i) in plotSet"
                            :key="`serie_plot_${serie.id}`"
                            :class="`serie_plot_${i}`"
                            :style="`opacity:${selectedScale ? (selectedScale === serie.groupId ? 1 : 0.2) : 1};transition:opacity 0.2s ease-in-out`"
                        >
                            <g
                                data-cy="datapoint-plot"
                                v-for="(plot, j) in serie.plots"
                                :key="`circle_plot_${serie.id}_${j}`"
                            >
                                <Shape
                                    :data-cy="`xy-plot-${i}-${j}`"
                                    v-if="plot && canShowValue(plot.value)"
                                    :shape="
                                        [
                                            'triangle',
                                            'square',
                                            'diamond',
                                            'pentagon',
                                            'hexagon',
                                            'star',
                                        ].includes(serie.shape)
                                            ? serie.shape
                                            : 'circle'
                                    "
                                    :color="
                                        FINAL_CONFIG.plot.useGradient
                                            ? `url(#plotGradient_${i}_${uniqueId})`
                                            : FINAL_CONFIG.plot.dot
                                                    .useSerieColor
                                              ? serie.color
                                              : FINAL_CONFIG.plot.dot.fill
                                    "
                                    :plot="{
                                        x: checkNaN(plot.x),
                                        y: checkNaN(plot.y),
                                    }"
                                    :radius="
                                        isSelectedDatapoint(serie, plot, j)
                                            ? (plotRadii.plot || 6) * 1.5
                                            : isPlotAlone(serie.plots, j)
                                              ? plotRadii.plot || 6
                                              : plotRadii.plot || 6
                                    "
                                    :stroke="
                                        FINAL_CONFIG.plot.dot.useSerieColor
                                            ? FINAL_CONFIG.chart.backgroundColor
                                            : serie.color
                                    "
                                    :strokeWidth="
                                        FINAL_CONFIG.plot.dot.strokeWidth
                                    "
                                    :transition="
                                        loading ||
                                        disableShapeTransitionForRangeResize ||
                                        !FINAL_CONFIG.plot.showTransition
                                            ? undefined
                                            : `all ${FINAL_CONFIG.plot.transitionDurationMs}ms ease-in-out`
                                    "
                                    :still="
                                        disableShapeTransitionForRangeResize
                                    "
                                />

                                <template
                                    v-if="
                                        plot.comment &&
                                        FINAL_CONFIG.chart.comments.show
                                    "
                                >
                                    <foreignObject
                                        style="overflow: visible"
                                        height="12"
                                        :width="
                                            FINAL_CONFIG.chart.comments.width
                                        "
                                        :x="
                                            plot.x -
                                            FINAL_CONFIG.chart.comments.width /
                                                2 +
                                            FINAL_CONFIG.chart.comments.offsetX
                                        "
                                        :y="
                                            plot.y +
                                            FINAL_CONFIG.chart.comments
                                                .offsetY +
                                            6
                                        "
                                    >
                                        <div style="width: 100%">
                                            <slot
                                                name="plot-comment"
                                                :plot="{
                                                    ...plot,
                                                    color: serie.color,
                                                    seriesIndex: i,
                                                    datapointIndex: j,
                                                }"
                                            />
                                        </div>
                                    </foreignObject>
                                </template>
                            </g>
                        </g>

                        <!-- LINE COATINGS -->
                        <g
                            v-for="(serie, i) in lineSet"
                            :key="`serie_line_${serie.id}`"
                            :class="`serie_line_${i}`"
                            :style="`opacity:${selectedScale ? (selectedScale === serie.groupId ? 1 : 0.2) : 1};transition:opacity 0.2s ease-in-out`"
                        >
                            <template v-if="serie.hasDashedSegments">
                                <template v-if="serie.smooth">
                                    <path
                                        v-for="(
                                            seg, segIndex
                                        ) in serie.dashedSmooth"
                                        :key="`line_coating_smooth_segment_${serie.id}_${segIndex}`"
                                        data-cy="datapoint-line-coating-smooth-segment"
                                        fill="none"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        :d="`M ${seg.path}`"
                                        :stroke="
                                            FINAL_CONFIG.chart.backgroundColor
                                        "
                                        :stroke-width="
                                            FINAL_CONFIG.line.strokeWidth + 1
                                        "
                                        :stroke-dasharray="
                                            seg.dashed
                                                ? FINAL_CONFIG.line
                                                      .strokeWidth * 2
                                                : 0
                                        "
                                        :style="{
                                            transition: getLinePathTransition(),
                                        }"
                                    />
                                </template>

                                <template v-else>
                                    <path
                                        v-for="(
                                            seg, segIndex
                                        ) in serie.dashedStraight"
                                        :key="`line_coating_straight_segment_${serie.id}_${segIndex}`"
                                        data-cy="datapoint-line-coating-straight-segment"
                                        fill="none"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        :d="`M ${seg.path}`"
                                        :stroke="
                                            FINAL_CONFIG.chart.backgroundColor
                                        "
                                        :stroke-width="
                                            FINAL_CONFIG.line.strokeWidth + 1
                                        "
                                        :stroke-dasharray="
                                            seg.dashed
                                                ? FINAL_CONFIG.line
                                                      .strokeWidth * 2
                                                : 0
                                        "
                                        :style="{
                                            transition: getLinePathTransition(),
                                        }"
                                    />
                                </template>
                            </template>

                            <path
                                v-else-if="
                                    serie.smooth &&
                                    serie.plots.length > 1 &&
                                    !!serie.curve
                                "
                                data-cy="datapoint-line-coating-smooth"
                                :d="`M${serie.curve}`"
                                :stroke="FINAL_CONFIG.chart.backgroundColor"
                                :stroke-width="
                                    FINAL_CONFIG.line.strokeWidth + 1
                                "
                                :stroke-dasharray="
                                    serie.dashed
                                        ? FINAL_CONFIG.line.strokeWidth * 2
                                        : 0
                                "
                                fill="none"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                :style="{ transition: getLinePathTransition() }"
                            />

                            <path
                                v-else-if="
                                    serie.plots.length > 1 && !!serie.straight
                                "
                                data-cy="datapoint-line-coating-straight"
                                :d="`M${serie.straight}`"
                                :stroke="FINAL_CONFIG.chart.backgroundColor"
                                :stroke-width="
                                    FINAL_CONFIG.line.strokeWidth + 1
                                "
                                :stroke-dasharray="
                                    serie.dashed
                                        ? FINAL_CONFIG.line.strokeWidth * 2
                                        : 0
                                "
                                fill="none"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                :style="{ transition: getLinePathTransition() }"
                            />
                        </g>

                        <defs v-if="$slots.pattern">
                            <slot
                                v-for="(serie, i) in safeDataset"
                                :key="`serie_pattern_slot_${serie.id}`"
                                name="pattern"
                                v-bind="{
                                    ...serie,
                                    seriesIndex: serie.slotAbsoluteIndex,
                                    patternId: `pattern_${uniqueId}_${i}`,
                                }"
                            />
                        </defs>

                        <!-- INTERLINE AREAS (non stack mode only) -->
                        <g
                            v-if="
                                interLineAreas.length &&
                                !mutableConfig.isStacked
                            "
                        >
                            <path
                                v-for="area in interLineAreas"
                                :key="area.key"
                                :d="area.d"
                                :fill="area.color"
                                :fill-opacity="
                                    FINAL_CONFIG.line.interLine.fillOpacity
                                "
                                stroke="none"
                                pointer-events="none"
                                :style="{ transition: getLinePathTransition() }"
                            />
                        </g>

                        <!-- LINES -->
                        <g
                            v-for="(serie, i) in lineSet"
                            :key="`serie_line_above_${serie.id}`"
                            :class="`serie_line_${i}`"
                            :style="`opacity:${selectedScale ? (selectedScale === serie.groupId ? 1 : 0.2) : 1};transition:opacity 0.2s ease-in-out`"
                        >
                            <g v-if="serie.useArea && serie.plots.length > 1">
                                <template v-if="serie.smooth">
                                    <template
                                        v-for="(
                                            d, segIndex
                                        ) in serie.curveAreas"
                                        :key="segIndex"
                                    >
                                        <path
                                            v-if="d"
                                            :d="d"
                                            :fill="
                                                FINAL_CONFIG.line.area
                                                    .useGradient
                                                    ? `url(#areaGradient_${i}_${uniqueId})`
                                                    : setOpacity(
                                                          serie.color,
                                                          FINAL_CONFIG.line.area
                                                              .opacity,
                                                      )
                                            "
                                            :style="{
                                                transition:
                                                    getLinePathTransition(),
                                            }"
                                        />
                                        <path
                                            v-if="$slots.pattern && d"
                                            :d="d"
                                            :fill="`url(#pattern_${uniqueId}_${serie.slotAbsoluteIndex})`"
                                            :style="{
                                                transition:
                                                    getLinePathTransition(),
                                            }"
                                        />
                                    </template>
                                </template>
                                <template v-else>
                                    <template
                                        v-for="(
                                            d, segIndex
                                        ) in serie.area.split(';')"
                                        :key="segIndex"
                                    >
                                        <path
                                            v-if="d"
                                            data-cy="datapoint-line-area-straight"
                                            :d="`M${d}Z`"
                                            :fill="
                                                FINAL_CONFIG.line.area
                                                    .useGradient
                                                    ? `url(#areaGradient_${i}_${uniqueId})`
                                                    : setOpacity(
                                                          serie.color,
                                                          FINAL_CONFIG.line.area
                                                              .opacity,
                                                      )
                                            "
                                            :style="{
                                                transition:
                                                    getLinePathTransition(),
                                            }"
                                        />
                                        <path
                                            v-if="$slots.pattern && d"
                                            :d="`M${d}Z`"
                                            :fill="`url(#pattern_${uniqueId}_${serie.slotAbsoluteIndex})`"
                                            :style="{
                                                transition:
                                                    getLinePathTransition(),
                                            }"
                                        />
                                    </template>
                                </template>
                            </g>

                            <path
                                data-cy="datapoint-line-smooth"
                                v-if="
                                    !serie.hasDashedSegments &&
                                    serie.smooth &&
                                    serie.plots.length > 1 &&
                                    !!serie.curve
                                "
                                :d="`M${serie.curve}`"
                                :stroke="
                                    serie.temperatureColors &&
                                    !serie.isFlatTemperatureLine
                                        ? `url(#temperature_grad_line_${i}_${uniqueId})`
                                        : serie.color
                                "
                                :stroke-width="FINAL_CONFIG.line.strokeWidth"
                                :stroke-dasharray="
                                    serie.dashed
                                        ? FINAL_CONFIG.line.strokeWidth * 2
                                        : 0
                                "
                                fill="none"
                                stroke-linecap="round"
                                :style="{ transition: getLinePathTransition() }"
                            />

                            <template v-else-if="serie.hasDashedSegments">
                                <template v-if="serie.smooth">
                                    <path
                                        v-for="(
                                            seg, segIndex
                                        ) in serie.dashedSmooth"
                                        :key="`line_smooth_segment_${serie.id}_${segIndex}`"
                                        fill="none"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        :d="`M ${seg.path}`"
                                        :stroke="
                                            serie.temperatureColors &&
                                            !serie.isFlatTemperatureLine
                                                ? `url(#temperature_grad_line_${i}_${uniqueId})`
                                                : serie.color
                                        "
                                        :stroke-width="
                                            FINAL_CONFIG.line.strokeWidth
                                        "
                                        :stroke-dasharray="
                                            seg.dashed
                                                ? FINAL_CONFIG.line
                                                      .strokeWidth * 2
                                                : 0
                                        "
                                        :style="{
                                            transition: getLinePathTransition(),
                                        }"
                                    />
                                </template>
                                <template v-else>
                                    <path
                                        v-for="(
                                            seg, segIndex
                                        ) in serie.dashedStraight"
                                        :key="`line_straight_segment_${serie.id}_${segIndex}`"
                                        fill="none"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        :d="`M ${seg.path}`"
                                        :stroke="
                                            serie.temperatureColors &&
                                            !serie.isFlatTemperatureLine
                                                ? `url(#temperature_grad_line_${i}_${uniqueId})`
                                                : serie.color
                                        "
                                        :stroke-width="
                                            FINAL_CONFIG.line.strokeWidth
                                        "
                                        :stroke-dasharray="
                                            seg.dashed
                                                ? FINAL_CONFIG.line
                                                      .strokeWidth * 2
                                                : 0
                                        "
                                        :style="{
                                            transition: getLinePathTransition(),
                                        }"
                                    />
                                </template>
                            </template>

                            <path
                                data-cy="datapoint-line-straight"
                                v-else-if="
                                    serie.plots.length > 1 && !!serie.straight
                                "
                                :d="`M${serie.straight}`"
                                :stroke="
                                    serie.temperatureColors &&
                                    !serie.isFlatTemperatureLine
                                        ? `url(#temperature_grad_line_${i}_${uniqueId})`
                                        : serie.color
                                "
                                :stroke-width="FINAL_CONFIG.line.strokeWidth"
                                :stroke-dasharray="
                                    serie.dashed
                                        ? FINAL_CONFIG.line.strokeWidth * 2
                                        : 0
                                "
                                fill="none"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                :style="{ transition: getLinePathTransition() }"
                            />

                            <template
                                v-for="(plot, j) in serie.plots"
                                :key="`circle_line_${serie.id}_${j}`"
                            >
                                <Shape
                                    data-cy="datapoint-line-plot"
                                    v-if="
                                        (!optimize.linePlot &&
                                            plot &&
                                            canShowValue(plot.value)) ||
                                        (optimize.linePlot &&
                                            plot &&
                                            canShowValue(plot.value) &&
                                            ((selectedSerieIndex !== null &&
                                                selectedSerieIndex === j) ||
                                                (selectedMinimapIndex !==
                                                    null &&
                                                    selectedMinimapIndex ===
                                                        j))) ||
                                        isPlotAlone(serie.plots, j)
                                    "
                                    :shape="
                                        [
                                            'triangle',
                                            'square',
                                            'diamond',
                                            'pentagon',
                                            'hexagon',
                                            'star',
                                        ].includes(serie.shape)
                                            ? serie.shape
                                            : 'circle'
                                    "
                                    :color="
                                        FINAL_CONFIG.line.useGradient
                                            ? `url(#lineGradient_${i}_${uniqueId})`
                                            : FINAL_CONFIG.line.dot
                                                    .useSerieColor
                                              ? serie.color
                                              : FINAL_CONFIG.line.dot.fill
                                    "
                                    :plot="{
                                        x: checkNaN(plot.x),
                                        y: checkNaN(plot.y),
                                    }"
                                    :radius="
                                        isSelectedDatapoint(serie, plot, j)
                                            ? selectedPlotRadius || 0
                                            : isPlotAlone(serie.plots, j)
                                              ? plotRadii.line || 0
                                              : plotRadii.line || 0
                                    "
                                    :stroke="
                                        FINAL_CONFIG.line.dot.useSerieColor
                                            ? FINAL_CONFIG.chart.backgroundColor
                                            : serie.color
                                    "
                                    :strokeWidth="
                                        FINAL_CONFIG.line.dot.strokeWidth
                                    "
                                    :transition="
                                        loading ||
                                        disableShapeTransitionForRangeResize ||
                                        !FINAL_CONFIG.line.showTransition
                                            ? undefined
                                            : `all ${FINAL_CONFIG.line.transitionDurationMs}ms ease-in-out`
                                    "
                                    :still="
                                        disableShapeTransitionForRangeResize
                                    "
                                />

                                <template
                                    v-if="
                                        plot.comment &&
                                        FINAL_CONFIG.chart.comments.show
                                    "
                                >
                                    <foreignObject
                                        style="overflow: visible"
                                        height="12"
                                        :width="
                                            FINAL_CONFIG.chart.comments.width
                                        "
                                        :x="
                                            plot.x -
                                            FINAL_CONFIG.chart.comments.width /
                                                2 +
                                            FINAL_CONFIG.chart.comments.offsetX
                                        "
                                        :y="
                                            plot.y +
                                            FINAL_CONFIG.chart.comments
                                                .offsetY +
                                            6
                                        "
                                    >
                                        <div style="width: 100%">
                                            <slot
                                                name="plot-comment"
                                                :plot="{
                                                    ...plot,
                                                    color: serie.color,
                                                    seriesIndex: i,
                                                    datapointIndex: j,
                                                }"
                                            />
                                        </div>
                                    </foreignObject>
                                </template>
                            </template>
                        </g>

                        <!-- X LABELS BAR -->
                        <g
                            v-if="
                                (FINAL_CONFIG.bar.labels.show ||
                                    FINAL_CONFIG.bar.serieName.show) &&
                                mutableConfig.dataLabels.show
                            "
                        >
                            <!-- BAR DATA LABELS -->
                            <template
                                v-for="item in barDataLabelItems"
                                :key="item.key"
                            >
                                <text
                                    :class="{
                                        'vue-data-ui-datalabel': isReady,
                                    }"
                                    data-cy="datapoint-bar-label"
                                    :text-anchor="
                                        getDataLabelTextAnchor({
                                            plot: item.plot,
                                            type: 'bar',
                                        })
                                    "
                                    :font-size="fontSizes.plotLabels"
                                    :transform="
                                        getDataLabelTransformBar({
                                            plot: item.plot,
                                        })
                                    "
                                    :fill="FINAL_CONFIG.bar.labels.color"
                                    :stroke="FINAL_CONFIG.chart.backgroundColor"
                                    paint-order="stroke"
                                    :style="`opacity:${selectedScale ? (selectedScale === item.serie.groupId ? 1 : 0.2) : 1};`"
                                    v-html="
                                        getDataLabelContent({
                                            serie: item.serie,
                                            plot: item.plot,
                                            type: 'bar',
                                        })
                                    "
                                />
                            </template>
                            <template
                                v-for="(serie, i) in barSet"
                                :key="`xLabel_bar_${serie.id}`"
                                :class="`xLabel_bar_${i}`"
                            >
                                <template
                                    v-for="(plot, j) in serie.plots"
                                    :key="`xLabel_bar_${i}_${j}`"
                                >
                                    <text
                                        :class="{
                                            'vue-data-ui-datalabel': isReady,
                                        }"
                                        v-if="
                                            plot &&
                                            FINAL_CONFIG.bar.serieName.show
                                        "
                                        :transform="`translate(${mutableConfig.useIndividualScale && mutableConfig.isStacked ? plot.x + slot.line / 2 : plot.x + calcRectWidth() * 1.1}, ${plot.y + (plot.value > 0 ? FINAL_CONFIG.bar.serieName.offsetY : -FINAL_CONFIG.bar.serieName.offsetY * 3)})`"
                                        text-anchor="middle"
                                        :font-size="fontSizes.plotLabels"
                                        :fill="
                                            FINAL_CONFIG.bar.serieName
                                                .useSerieColor
                                                ? serie.color
                                                : FINAL_CONFIG.bar.serieName
                                                      .color
                                        "
                                        :font-weight="
                                            FINAL_CONFIG.bar.serieName.bold
                                                ? 'bold'
                                                : 'normal'
                                        "
                                        :style="`opacity:${selectedScale ? (selectedScale === serie.groupId ? 1 : 0.2) : 1};transition:opacity 0.2s ease-in-out`"
                                    >
                                        {{
                                            FINAL_CONFIG.bar.serieName
                                                .useAbbreviation
                                                ? abbreviate({
                                                      source: serie.name,
                                                      length: FINAL_CONFIG.bar
                                                          .serieName
                                                          .abbreviationSize,
                                                  })
                                                : serie.name
                                        }}
                                    </text>
                                </template>
                            </template>
                        </g>

                        <!-- X LABELS PLOT -->
                        <g
                            v-if="
                                FINAL_CONFIG.plot.labels.show &&
                                mutableConfig.dataLabels.show
                            "
                        >
                            <!-- PLOT DATA LABELS -->
                            <template
                                v-for="item in plotDataLabelItems"
                                :key="item.key"
                            >
                                <text
                                    :class="{
                                        'vue-data-ui-datalabel': isReady,
                                    }"
                                    data-cy="datapoint-plot-label"
                                    :transform="
                                        getDataLabelTransformLineOrPlot({
                                            plot: item.plot,
                                            type: 'plot',
                                        })
                                    "
                                    :text-anchor="
                                        getDataLabelTextAnchor({
                                            plot: item.plot,
                                            type: 'plot',
                                        })
                                    "
                                    :font-size="fontSizes.plotLabels"
                                    :fill="FINAL_CONFIG.plot.labels.color"
                                    :stroke="FINAL_CONFIG.chart.backgroundColor"
                                    paint-order="stroke"
                                    :style="`opacity:${selectedScale ? (selectedScale === item.serie.groupId ? 1 : 0.2) : 1}`"
                                    v-html="
                                        getDataLabelContent({
                                            serie: item.serie,
                                            plot: item.plot,
                                            type: 'plot',
                                        })
                                    "
                                />
                            </template>
                        </g>

                        <g v-else>
                            <template
                                v-for="(serie, i) in plotSet"
                                :key="`xLabel_plot_${serie.id}`"
                                :class="`xLabel_plot_${i}`"
                            >
                                <template
                                    v-for="(plot, j) in serie.plots"
                                    :key="`xLabel_plot_${i}_${j}`"
                                >
                                    <!-- PLOT TAGS (fixed) -->
                                    <template
                                        v-if="
                                            !FINAL_CONFIG.plot.tag.followValue
                                        "
                                    >
                                        <foreignObject
                                            :data-cy="`xy-plot-tag-start-${i}`"
                                            v-if="
                                                plot &&
                                                j === 0 &&
                                                serie.useTag &&
                                                serie.useTag === 'start'
                                            "
                                            :x="plot.x"
                                            :y="plot.y - 20"
                                            :height="24"
                                            width="150"
                                            :style="`overflow: visible; opacity:${selectedScale ? (selectedScale === serie.groupId ? 1 : 0.2) : 1};transition:opacity 0.2s ease-in-out`"
                                        >
                                            <div
                                                :style="`padding: 3px; background:${setOpacity(serie.color, 80)};color:${adaptColorToBackground(serie.color)};width:fit-content;font-size:${fontSizes.plotLabels}px;border-radius: 2px;`"
                                                v-html="
                                                    applyDataLabel(
                                                        FINAL_CONFIG.plot.tag
                                                            .formatter,
                                                        plot.value,
                                                        serie.name,
                                                        {
                                                            datapoint: plot,
                                                            seriesIndex: j,
                                                            serieName:
                                                                serie.name,
                                                        },
                                                    )
                                                "
                                            />
                                        </foreignObject>
                                        <foreignObject
                                            :data-cy="`xy-plot-tag-end-${i}`"
                                            v-if="
                                                plot &&
                                                j === serie.plots.length - 1 &&
                                                serie.useTag &&
                                                serie.useTag === 'end'
                                            "
                                            :x="
                                                plot.x -
                                                serie.name.length *
                                                    (fontSizes.plotLabels / 2)
                                            "
                                            :y="plot.y - 20"
                                            :height="24"
                                            width="150"
                                            :style="`overflow: visible; opacity:${selectedScale ? (selectedScale === serie.groupId ? 1 : 0.2) : 1};transition:opacity 0.2s ease-in-out`"
                                        >
                                            <div
                                                :style="`padding: 3px; background:${setOpacity(serie.color, 80)};color:${adaptColorToBackground(serie.color)};width:fit-content;font-size:${fontSizes.plotLabels}px;border-radius: 2px;`"
                                                v-html="
                                                    applyDataLabel(
                                                        FINAL_CONFIG.plot.tag
                                                            .formatter,
                                                        plot.value,
                                                        serie.name,
                                                        {
                                                            datapoint: plot,
                                                            seriesIndex: j,
                                                            serieName:
                                                                serie.name,
                                                        },
                                                    )
                                                "
                                            />
                                        </foreignObject>
                                    </template>

                                    <!-- TAG LINE (follower) -->
                                    <template v-else>
                                        <line
                                            class="vue-ui-xy-tag-plot"
                                            v-if="
                                                [
                                                    selectedMinimapIndex,
                                                    selectedSerieIndex,
                                                    selectedRowIndex,
                                                ].includes(j) && serie.useTag
                                            "
                                            :x1="drawingArea?.left"
                                            :x2="drawingArea?.right"
                                            :y1="plot.y"
                                            :y2="plot.y"
                                            :stroke-width="1"
                                            stroke-linecap="round"
                                            stroke-dasharray="2"
                                            :stroke="serie.color"
                                        />
                                    </template>
                                </template>
                            </template>
                        </g>

                        <!-- X LABELS LINE -->
                        <g
                            v-if="
                                FINAL_CONFIG.line.labels.show &&
                                mutableConfig.dataLabels.show
                            "
                        >
                            <!-- LINE DATA LABELS -->
                            <template
                                v-for="item in lineDataLabelItems"
                                :key="item.key"
                            >
                                <text
                                    :class="{
                                        'vue-data-ui-datalabel': isReady,
                                    }"
                                    data-cy="datapoint-line-label"
                                    :transform="
                                        getDataLabelTransformLineOrPlot({
                                            plot: item.plot,
                                            type: 'line',
                                        })
                                    "
                                    :text-anchor="
                                        getDataLabelTextAnchor({
                                            plot: item.plot,
                                            type: 'line',
                                        })
                                    "
                                    :font-size="fontSizes.plotLabels"
                                    :fill="FINAL_CONFIG.line.labels.color"
                                    :stroke="FINAL_CONFIG.chart.backgroundColor"
                                    paint-order="stroke"
                                    :style="`opacity:${selectedScale ? (selectedScale === item.serie.groupId ? 1 : 0.2) : 1};`"
                                    v-html="
                                        getDataLabelContent({
                                            serie: item.serie,
                                            plot: item.plot,
                                            type: 'line',
                                        })
                                    "
                                />
                            </template>
                        </g>

                        <g v-else>
                            <template
                                v-for="(serie, i) in lineSet"
                                :key="`xLabel_line_${serie.id}`"
                                :class="`xLabel_line_${i}`"
                            >
                                <template
                                    v-for="(plot, j) in serie.plots"
                                    :key="`xLabel_line_${i}_${j}`"
                                >
                                    <!-- LINE TAGS (fixed) -->
                                    <template
                                        v-if="
                                            !FINAL_CONFIG.line.tag.followValue
                                        "
                                    >
                                        <foreignObject
                                            :data-cy="`xy-line-tag-start-${i}`"
                                            v-if="
                                                plot &&
                                                j === 0 &&
                                                serie.useTag &&
                                                serie.useTag === 'start'
                                            "
                                            :x="plot.x"
                                            :y="plot.y - 20"
                                            :height="24"
                                            width="150"
                                            :style="`overflow: visible; opacity:${selectedScale ? (selectedScale === serie.groupId ? 1 : 0.2) : 1};transition:opacity 0.2s ease-in-out`"
                                        >
                                            <div
                                                :style="`padding: 3px; background:${setOpacity(serie.color, 80)};color:${adaptColorToBackground(serie.color)};width:fit-content;font-size:${fontSizes.plotLabels}px;border-radius: 2px;`"
                                                v-html="
                                                    applyDataLabel(
                                                        FINAL_CONFIG.line.tag
                                                            .formatter,
                                                        plot.value,
                                                        serie.name,
                                                        {
                                                            datapoint: plot,
                                                            seriesIndex: j,
                                                            serieName:
                                                                serie.name,
                                                        },
                                                    )
                                                "
                                            ></div>
                                        </foreignObject>
                                        <foreignObject
                                            :data-cy="`xy-line-tag-end-${i}`"
                                            v-if="
                                                plot &&
                                                j === serie.plots.length - 1 &&
                                                serie.useTag &&
                                                serie.useTag === 'end'
                                            "
                                            :x="plot.x"
                                            :y="plot.y - 20"
                                            :height="24"
                                            width="150"
                                            :style="`overflow: visible; opacity:${selectedScale ? (selectedScale === serie.groupId ? 1 : 0.2) : 1};transition:opacity 0.2s ease-in-out`"
                                        >
                                            <div
                                                :style="`padding: 3px; background:${setOpacity(serie.color, 80)};color:${adaptColorToBackground(serie.color)};width:fit-content;font-size:${fontSizes.plotLabels}px;border-radius: 2px;`"
                                                v-html="
                                                    applyDataLabel(
                                                        FINAL_CONFIG.line.tag
                                                            .formatter,
                                                        plot.value,
                                                        serie.name,
                                                        {
                                                            datapoint: plot,
                                                            seriesIndex: j,
                                                            serieName:
                                                                serie.name,
                                                        },
                                                    )
                                                "
                                            />
                                        </foreignObject>
                                    </template>

                                    <!-- TAG LINE (follower) -->
                                    <template v-else>
                                        <line
                                            class="vue-ui-xy-tag-line"
                                            v-if="
                                                [
                                                    selectedMinimapIndex,
                                                    selectedSerieIndex,
                                                    selectedRowIndex,
                                                ].includes(j) && serie.useTag
                                            "
                                            :x1="drawingArea?.left"
                                            :x2="drawingArea?.right"
                                            :y1="plot.y"
                                            :y2="plot.y"
                                            :stroke-width="1"
                                            stroke-linecap="round"
                                            stroke-dasharray="2"
                                            :stroke="serie.color"
                                        />
                                    </template>
                                </template>
                            </template>
                        </g>

                        <!-- SERIE NAME TAGS : LINES -->
                        <template
                            v-for="(serie, i) in lineSet"
                            :key="`xLabel_line_${serie.id}`"
                            :class="`xLabel_line_${i}`"
                        >
                            <template
                                v-for="(plot, j) in serie.plots"
                                :key="`xLabel_line_${i}_${j}`"
                            >
                                <text
                                    v-if="
                                        plot &&
                                        j === 0 &&
                                        serie.showSerieName &&
                                        serie.showSerieName === 'start'
                                    "
                                    :x="plot.x - fontSizes.plotLabels"
                                    :y="plot.y"
                                    :font-size="fontSizes.plotLabels"
                                    text-anchor="end"
                                    :fill="serie.color"
                                    v-html="
                                        createTSpans({
                                            content: serie.name,
                                            fontSize: fontSizes.plotLabels,
                                            fill: serie.color,
                                            x: plot.x - fontSizes.plotLabels,
                                            y: plot.y,
                                            maxWords: 2,
                                        })
                                    "
                                    :style="`opacity:${selectedScale ? (selectedScale === serie.groupId ? 1 : 0.2) : 1};transition:opacity 0.2s ease-in-out`"
                                />
                                <text
                                    v-if="
                                        plot &&
                                        j === serie.plots.length - 1 &&
                                        serie.showSerieName &&
                                        serie.showSerieName === 'end'
                                    "
                                    :x="plot.x + fontSizes.plotLabels"
                                    :y="plot.y"
                                    :font-size="fontSizes.plotLabels"
                                    text-anchor="start"
                                    :fill="serie.color"
                                    v-html="
                                        createTSpans({
                                            content: serie.name,
                                            fontSize: fontSizes.plotLabels,
                                            fill: serie.color,
                                            x: plot.x + fontSizes.plotLabels,
                                            y: plot.y,
                                            maxWords: 2,
                                        })
                                    "
                                    :style="`opacity:${selectedScale ? (selectedScale === serie.groupId ? 1 : 0.2) : 1};transition:opacity 0.2s ease-in-out`"
                                />
                            </template>
                        </template>

                        <!-- SERIE NAME TAGS : PLOTS -->
                        <template
                            v-for="(serie, i) in plotSet"
                            :key="`xLabel_plot_${serie.id}`"
                            :class="`xLabel_plot_${i}`"
                        >
                            <template
                                v-for="(plot, j) in serie.plots"
                                :key="`xLabel_plot_${i}_${j}`"
                            >
                                <text
                                    v-if="
                                        plot &&
                                        j === 0 &&
                                        serie.showSerieName &&
                                        serie.showSerieName === 'start'
                                    "
                                    :x="plot.x - fontSizes.plotLabels"
                                    :y="plot.y"
                                    :font-size="fontSizes.plotLabels"
                                    text-anchor="end"
                                    :fill="serie.color"
                                    v-html="
                                        createTSpans({
                                            content: serie.name,
                                            fontSize: fontSizes.plotLabels,
                                            fill: serie.color,
                                            x: plot.x - fontSizes.plotLabels,
                                            y: plot.y,
                                            maxWords: 2,
                                        })
                                    "
                                    :style="`opacity:${selectedScale ? (selectedScale === serie.groupId ? 1 : 0.2) : 1};transition:opacity 0.2s ease-in-out`"
                                />
                                <text
                                    v-if="
                                        plot &&
                                        j === serie.plots.length - 1 &&
                                        serie.showSerieName &&
                                        serie.showSerieName === 'end'
                                    "
                                    :x="plot.x + fontSizes.plotLabels"
                                    :y="plot.y"
                                    :font-size="fontSizes.plotLabels"
                                    text-anchor="start"
                                    :fill="serie.color"
                                    v-html="
                                        createTSpans({
                                            content: serie.name,
                                            fontSize: fontSizes.plotLabels,
                                            fill: serie.color,
                                            x: plot.x + fontSizes.plotLabels,
                                            y: plot.y,
                                            maxWords: 2,
                                        })
                                    "
                                    :style="`opacity:${selectedScale ? (selectedScale === serie.groupId ? 1 : 0.2) : 1};transition:opacity 0.2s ease-in-out`"
                                />
                            </template>
                        </template>

                        <!-- PROGRESSION TRENDS -->
                        <template
                            v-for="(serie, i) in [
                                ...plotSet,
                                ...lineSet,
                                ...barSet,
                            ]"
                            :key="`progression-${i}`"
                        >
                            <g
                                v-if="
                                    Object.hasOwn(serie, 'useProgression') &&
                                    serie.useProgression === true &&
                                    !isNaN(
                                        calcLinearProgression(serie.plots)
                                            .trend,
                                    )
                                "
                            >
                                <defs>
                                    <marker
                                        :id="`progression_arrow_${i}`"
                                        markerWidth="9"
                                        markerHeight="9"
                                        viewBox="-1 -1 9 9"
                                        markerUnits="userSpaceOnUse"
                                        refX="7"
                                        :refY="7 / 2"
                                        orient="auto"
                                        overflow="visible"
                                    >
                                        <polygon
                                            points="0,0 7,3.5 0,7"
                                            :fill="serie.color"
                                            :stroke="
                                                FINAL_CONFIG.chart
                                                    .backgroundColor
                                            "
                                            stroke-width="1"
                                            stroke-linejoin="round"
                                        />
                                    </marker>
                                </defs>
                                <line
                                    v-if="serie.plots.length > 1"
                                    :x1="
                                        calcLinearProgression(serie.plots).x1 +
                                        (serie.type === 'bar'
                                            ? calcRectWidth()
                                            : 0)
                                    "
                                    :x2="
                                        calcLinearProgression(serie.plots).x2 +
                                        (serie.type === 'bar'
                                            ? calcRectWidth()
                                            : 0)
                                    "
                                    :y1="
                                        forceValidValue(
                                            calcLinearProgression(serie.plots)
                                                .y1,
                                        )
                                    "
                                    :y2="
                                        forceValidValue(
                                            calcLinearProgression(serie.plots)
                                                .y2,
                                        )
                                    "
                                    :stroke-width="1"
                                    :stroke="FINAL_CONFIG.chart.backgroundColor"
                                    :stroke-dasharray="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    :marker-end="`url(#progression_arrow_${i})`"
                                />
                                <line
                                    v-if="serie.plots.length > 1"
                                    :x1="
                                        calcLinearProgression(serie.plots).x1 +
                                        (serie.type === 'bar'
                                            ? calcRectWidth()
                                            : 0)
                                    "
                                    :x2="
                                        calcLinearProgression(serie.plots).x2 +
                                        (serie.type === 'bar'
                                            ? calcRectWidth()
                                            : 0)
                                    "
                                    :y1="
                                        forceValidValue(
                                            calcLinearProgression(serie.plots)
                                                .y1,
                                        )
                                    "
                                    :y2="
                                        forceValidValue(
                                            calcLinearProgression(serie.plots)
                                                .y2,
                                        )
                                    "
                                    :stroke-width="1"
                                    :stroke="serie.color"
                                    :stroke-dasharray="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    :marker-end="`url(#progression_arrow_${i})`"
                                />
                                <text
                                    :class="{
                                        'vue-data-ui-datalabel': isReady,
                                    }"
                                    v-if="serie.plots.length > 1"
                                    :data-cy="`xy-progression-label-${i}`"
                                    text-anchor="middle"
                                    :transform="`translate(${calcLinearProgression(serie.plots).x2 + (serie.type === 'bar' ? calcRectWidth() : 0)}, ${calcLinearProgression(serie.plots).y2 - 12})`"
                                    :font-size="fontSizes.plotLabels"
                                    :fill="serie.color"
                                    :stroke="FINAL_CONFIG.chart.backgroundColor"
                                    :stroke-width="4"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    paint-order="stroke fill"
                                >
                                    {{
                                        dataLabel({
                                            v:
                                                calcLinearProgression(
                                                    serie.plots,
                                                ).trend * 100,
                                            s: '%',
                                            r: 2,
                                        })
                                    }}
                                </text>
                            </g>
                        </template>

                        <!-- Y LABELS MOUSE TRAPS -->
                        <template
                            v-if="
                                mutableConfig.useIndividualScale &&
                                !mutableConfig.isStacked
                            "
                        >
                            <defs>
                                <DefGrad
                                    t="linear"
                                    v-for="(trap, i) in allScales"
                                    :key="`individual_scale_gradient_${trap.groupId || trap.id || i}`"
                                    :id="`individual_scale_gradient_${uniqueId}_${i}`"
                                    :x1="yAxisLabelsAreRight ? '100%' : '0%'"
                                    :x2="yAxisLabelsAreRight ? '0%' : '100%'"
                                    y1="0%"
                                    y2="0%"
                                    :stops="[
                                        [
                                            '0%',
                                            FINAL_CONFIG.chart.backgroundColor,
                                            0,
                                        ],
                                        ['100%', trap.color, 0.2],
                                    ]"
                                />
                            </defs>
                            <rect
                                v-for="(trap, i) in allScales"
                                :key="`individual_scale_background_${trap.groupId || trap.id || i}`"
                                :x="
                                    yAxisLabelsAreRight
                                        ? trap.x
                                        : trap.x -
                                          FINAL_CONFIG.chart.grid.labels.yAxis
                                              .labelWidth -
                                          drawingArea.individualOffsetX
                                "
                                :y="drawingArea?.top"
                                :width="
                                    yAxisLabelsAreRight
                                        ? FINAL_CONFIG.chart.grid.labels.yAxis
                                              .labelWidth +
                                          drawingArea.individualOffsetX
                                        : FINAL_CONFIG.chart.grid.labels.yAxis
                                              .labelWidth +
                                          drawingArea.individualOffsetX
                                "
                                :height="
                                    drawingArea.height < 0
                                        ? 10
                                        : drawingArea.height
                                "
                                :fill="
                                    selectedScale === trap.groupId
                                        ? `url(#individual_scale_gradient_${uniqueId}_${i})`
                                        : 'transparent'
                                "
                                @mouseenter="selectedScale = trap.groupId"
                                @mouseleave="selectedScale = null"
                            />
                        </template>

                        <!-- AXIS LABELS -->
                        <g>
                            <text
                                ref="yAxisLabel"
                                data-cy="xy-axis-yLabel"
                                v-if="
                                    FINAL_CONFIG.chart.grid.labels.axis
                                        .yLabel &&
                                    !mutableConfig.useIndividualScale
                                "
                                :font-size="fontSizes.yAxis"
                                :fill="FINAL_CONFIG.chart.grid.labels.color"
                                :transform="`translate(${
                                    yAxisLabelsAreRight
                                        ? drawingArea.right +
                                          drawingArea.scaleLabelsOffset +
                                          FINAL_CONFIG.chart.grid.labels.axis
                                              .yLabelOffsetX +
                                          fontSizes.yAxis
                                        : FINAL_CONFIG.chart.grid.labels.axis
                                              .fontSize +
                                          FINAL_CONFIG.chart.grid.labels.axis
                                              .yLabelOffsetX
                                }, ${drawingArea?.top + drawingArea.height / 2}) rotate(-90)`"
                                text-anchor="middle"
                                style="transition: none"
                            >
                                {{ FINAL_CONFIG.chart.grid.labels.axis.yLabel }}
                            </text>
                            <text
                                ref="xAxisLabel"
                                data-cy="xy-axis-xLabel"
                                v-if="
                                    FINAL_CONFIG.chart.grid.labels.axis.xLabel
                                "
                                text-anchor="middle"
                                :x="width / 2"
                                :y="height - 3"
                                :font-size="fontSizes.yAxis"
                                :fill="FINAL_CONFIG.chart.grid.labels.color"
                            >
                                {{ FINAL_CONFIG.chart.grid.labels.axis.xLabel }}
                            </text>
                        </g>

                        <!-- TIME LABELS -->
                        <g
                            v-if="
                                FINAL_CONFIG.chart.grid.labels.xAxisLabels.show
                            "
                            ref="timeLabelsEls"
                            :opacity="crosshairsAreActive ? 0.1 : 1"
                            style="transition: opacity 0.2s"
                        >
                            <template v-if="$slots['time-label']">
                                <template
                                    v-for="(label, i) in continuousXLabels"
                                    :key="`time_label_${label.id}`"
                                >
                                    <slot
                                        name="time-label"
                                        v-bind="{
                                            x: getXAxisLabelX(label, i),
                                            y: drawingArea?.bottom,
                                            fontSize: fontSizes.xAxis,
                                            fill: FINAL_CONFIG.chart.grid.labels
                                                .xAxisLabels.color,
                                            transform: `translate(${getXAxisLabelX(label, i)}, ${drawingArea?.bottom + fontSizes.xAxis * 1.3 + FINAL_CONFIG.chart.grid.labels.xAxisLabels.yOffset}), rotate(${FINAL_CONFIG.chart.grid.labels.xAxisLabels.rotation})`,
                                            absoluteIndex: label.absoluteIndex,
                                            content: label.text,
                                            textAnchor:
                                                FINAL_CONFIG.chart.grid.labels
                                                    .xAxisLabels.rotation > 0
                                                    ? 'start'
                                                    : FINAL_CONFIG.chart.grid
                                                            .labels.xAxisLabels
                                                            .rotation < 0
                                                      ? 'end'
                                                      : 'middle',
                                            show: label && label.text,
                                        }"
                                    />
                                </template>
                            </template>
                            <template v-else>
                                <g
                                    v-for="(label, i) in continuousXLabels"
                                    :key="`time_label_${i}`"
                                >
                                    <template v-if="label && label.text">
                                        <!-- SINGLE LINE LABEL -->
                                        <text
                                            v-if="
                                                !String(label.text).includes(
                                                    '\n',
                                                )
                                            "
                                            class="vue-data-ui-time-label"
                                            data-cy="time-label"
                                            :text-anchor="
                                                FINAL_CONFIG.chart.grid.labels
                                                    .xAxisLabels.rotation > 0
                                                    ? 'start'
                                                    : FINAL_CONFIG.chart.grid
                                                            .labels.xAxisLabels
                                                            .rotation < 0
                                                      ? 'end'
                                                      : 'middle'
                                            "
                                            :font-size="fontSizes.xAxis"
                                            :fill="
                                                FINAL_CONFIG.chart.grid.labels
                                                    .xAxisLabels.color
                                            "
                                            :transform="`translate(${getXAxisLabelX(label, i)}, ${drawingArea?.bottom + fontSizes.xAxis * 1.5}), rotate(${FINAL_CONFIG.chart.grid.labels.xAxisLabels.rotation})`"
                                            :style="{
                                                cursor:
                                                    usesSelectTimeLabelEvent() &&
                                                    isCursorPointer
                                                        ? 'pointer'
                                                        : 'default',
                                            }"
                                            @click="selectTimeLabel(label, i)"
                                        >
                                            {{ label.text || '' }}
                                        </text>

                                        <!-- MULTILINE LABEL (when label includes \n) -->
                                        <text
                                            v-else
                                            data-cy="time-label"
                                            class="vue-data-ui-time-label"
                                            :text-anchor="
                                                FINAL_CONFIG.chart.grid.labels
                                                    .xAxisLabels.rotation > 0
                                                    ? 'start'
                                                    : FINAL_CONFIG.chart.grid
                                                            .labels.xAxisLabels
                                                            .rotation < 0
                                                      ? 'end'
                                                      : 'middle'
                                            "
                                            :font-size="fontSizes.xAxis"
                                            :fill="
                                                FINAL_CONFIG.chart.grid.labels
                                                    .xAxisLabels.color
                                            "
                                            :transform="`translate(${getXAxisLabelX(label, i)}, ${drawingArea?.bottom + fontSizes.xAxis * 1.5}), rotate(${FINAL_CONFIG.chart.grid.labels.xAxisLabels.rotation})`"
                                            :style="{
                                                cursor:
                                                    usesSelectTimeLabelEvent() &&
                                                    isCursorPointer
                                                        ? 'pointer'
                                                        : 'default',
                                            }"
                                            v-html="
                                                createTSpansFromLineBreaksOnX({
                                                    content: String(label.text),
                                                    fontSize: fontSizes.xAxis,
                                                    fill: FINAL_CONFIG.chart
                                                        .grid.labels.xAxisLabels
                                                        .color,
                                                    x: 0,
                                                    y: 0,
                                                })
                                            "
                                            @click="selectTimeLabel(label, i)"
                                        />
                                    </template>
                                </g>
                            </template>
                        </g>

                        <g v-if="crosshairXAxisLabel">
                            <text
                                class="vue-data-ui-time-label"
                                data-cy="time-label"
                                :text-anchor="
                                    FINAL_CONFIG.chart.grid.labels.xAxisLabels
                                        .rotation > 0
                                        ? 'start'
                                        : FINAL_CONFIG.chart.grid.labels
                                                .xAxisLabels.rotation < 0
                                          ? 'end'
                                          : 'middle'
                                "
                                :font-size="fontSizes.xAxis"
                                :fill="
                                    FINAL_CONFIG.chart.grid.labels.xAxisLabels
                                        .color
                                "
                                :transform="`translate(${crosshairXAxisLabel.x}, ${drawingArea?.bottom + fontSizes.xAxis * 1.5}), rotate(${FINAL_CONFIG.chart.grid.labels.xAxisLabels.rotation})`"
                                font-weight="bold"
                                style="
                                    transition: none !important;
                                    animation: none !important;
                                    pointer-events: none;
                                "
                                v-html="
                                    createTSpansFromLineBreaksOnX({
                                        content: String(
                                            crosshairXAxisLabel.text,
                                        ),
                                        fontSize: fontSizes.xAxis,
                                        fill: FINAL_CONFIG.chart.grid.labels
                                            .xAxisLabels.color,
                                        x: 0,
                                        y: 0,
                                    })
                                "
                            />
                        </g>

                        <!-- ANNOTATIONS -->
                        <!-- YAXIS ANNOTATIONS -->
                        <g
                            v-if="
                                annotationsY.length && !mutableConfig.isStacked
                            "
                        >
                            <g
                                v-for="annotation in annotationsY"
                                :key="annotation.id"
                            >
                                <line
                                    v-if="
                                        annotation.yTop &&
                                        annotation.show &&
                                        isFinite(annotation.yTop)
                                    "
                                    :x1="annotation.x1"
                                    :y1="annotation.yTop"
                                    :x2="annotation.x2"
                                    :y2="annotation.yTop"
                                    :stroke="annotation.config.line.stroke"
                                    :stroke-width="
                                        annotation.config.line.strokeWidth
                                    "
                                    :stroke-dasharray="
                                        annotation.config.line.strokeDasharray
                                    "
                                    stroke-linecap="round"
                                    :style="{ animation: 'none !important' }"
                                />
                                <line
                                    v-if="
                                        annotation.yBottom &&
                                        annotation.show &&
                                        isFinite(annotation.yBottom)
                                    "
                                    :x1="annotation.x1"
                                    :y1="annotation.yBottom"
                                    :x2="annotation.x2"
                                    :y2="annotation.yBottom"
                                    :stroke="annotation.config.line.stroke"
                                    :stroke-width="
                                        annotation.config.line.strokeWidth
                                    "
                                    :stroke-dasharray="
                                        annotation.config.line.strokeDasharray
                                    "
                                    stroke-linecap="round"
                                    :style="{ animation: 'none !important' }"
                                />
                                <rect
                                    v-if="
                                        annotation.hasArea &&
                                        annotation.show &&
                                        isFinite(annotation.yTop) &&
                                        isFinite(annotation.yBottom)
                                    "
                                    :y="
                                        Math.min(
                                            annotation.yTop,
                                            annotation.yBottom,
                                        )
                                    "
                                    :x="annotation.x1"
                                    :width="drawingArea.width"
                                    :height="checkNaN(annotation.areaHeight, 0)"
                                    :fill="
                                        setOpacity(
                                            annotation.config.area.fill,
                                            annotation.config.area.opacity,
                                        )
                                    "
                                    :style="{ animation: 'none !important' }"
                                />
                                <rect
                                    v-if="
                                        annotation.config.label.text &&
                                        annotation.show &&
                                        isFinite(annotation._box.y)
                                    "
                                    class="vue-ui-xy-annotation-label-box"
                                    v-bind="annotation._box"
                                    :style="{
                                        animation: 'none !important',
                                        transition: 'none !important',
                                    }"
                                />
                                <text
                                    v-if="
                                        annotation.config.label.text &&
                                        annotation.show &&
                                        isFinite(annotation._text.y)
                                    "
                                    :id="annotation.id"
                                    class="vue-ui-xy-annotation-label"
                                    :class="{
                                        'vue-data-ui-datalabel': isReady,
                                    }"
                                    :transform="`translate(${annotation._text.x}, ${annotation._text.y})`"
                                    :font-size="
                                        annotation.config.label.fontSize
                                    "
                                    :fill="annotation.config.label.color"
                                    :text-anchor="
                                        annotation.config.label.textAnchor
                                    "
                                >
                                    {{ annotation.config.label.text }}
                                </text>
                            </g>
                        </g>

                        <!-- TIME TAG -->
                        <g
                            v-if="
                                !crosshairsAreActive &&
                                FINAL_CONFIG.chart.timeTag.show &&
                                (isContinuousScale
                                    ? isValidNumber(activeContinuousXValue)
                                    : ![null, undefined].includes(
                                          selectedSerieIndex,
                                      ) ||
                                      ![null, undefined].includes(
                                          selectedMinimapIndex,
                                      ))
                            "
                            style="pointer-events: none"
                        >
                            <foreignObject
                                :x="timeTagX()"
                                :y="drawingArea?.bottom"
                                width="200"
                                height="40"
                                style="overflow: visible !important"
                            >
                                <div
                                    ref="timeTagEl"
                                    data-cy="time-tag"
                                    class="vue-ui-xy-time-tag"
                                    :style="`width: fit-content;margin: 0 auto;text-align:center;padding:3px 12px;background:${FINAL_CONFIG.chart.timeTag.backgroundColor};color:${FINAL_CONFIG.chart.timeTag.color};font-size:${FINAL_CONFIG.chart.timeTag.fontSize}px`"
                                    v-html="timeTagContent"
                                />
                            </foreignObject>
                            <circle
                                :cx="
                                    isContinuousScale &&
                                    isValidNumber(activeContinuousXValue)
                                        ? getContinuousX({
                                              x: activeContinuousXValue,
                                          })
                                        : getDatapointX(
                                              (selectedSerieIndex !== null
                                                  ? selectedSerieIndex
                                                  : 0) ||
                                                  (selectedMinimapIndex !== null
                                                      ? selectedMinimapIndex
                                                      : 0),
                                          )
                                "
                                :cy="drawingArea?.bottom"
                                :r="
                                    FINAL_CONFIG.chart.timeTag.circleMarker
                                        .radius
                                "
                                :fill="
                                    FINAL_CONFIG.chart.timeTag.circleMarker
                                        .color
                                "
                            />
                        </g>
                    </g>

                    <!-- ZOOM PREVIEW -->
                    <rect
                        v-if="isPrecog"
                        v-bind="precogRect"
                        :data-start="slicer.start"
                        :data-end="slicer.end"
                    />

                    <slot
                        name="svg"
                        :svg="{
                            ...svg,
                            slicer,
                            isPrintingImg:
                                isPrinting || isImaging || isCallbackImaging,
                            isPrintingSvg: isCallbackSvg,
                            data: [...lineSet, ...barSet, ...plotSet],
                            drawingArea,
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

        <!-- LINE: TAGS FOLLOWING VALUE -->
        <template v-for="(serie, i) in lineSet" :key="`tag_line_${serie.id}`">
            <template
                v-for="(plot, j) in serie.plots"
                :key="`tag_line_${i}_${j}`"
            >
                <div
                    :ref="(el) => setTagRef(i, j, el, 'right', 'line')"
                    class="vue-ui-xy-tag"
                    data-tag="right"
                    v-if="
                        [
                            selectedMinimapIndex,
                            selectedSerieIndex,
                            selectedRowIndex,
                        ].includes(j) &&
                        serie.useTag &&
                        serie.useTag === 'end' &&
                        FINAL_CONFIG.line.tag.followValue
                    "
                    :style="{
                        position: 'fixed',
                        top:
                            placeXYTag({
                                svgElement: svgRef,
                                x:
                                    drawingArea?.right +
                                    FINAL_CONFIG.line.tag.fontSize / 1.5,
                                y: plot.y,
                                element: tagRefs[`${i}_${j}_right_line`],
                                position: 'right',
                            })?.top + 'px',
                        left:
                            placeXYTag({
                                svgElement: svgRef,
                                x:
                                    drawingArea?.right +
                                    FINAL_CONFIG.line.tag.fontSize / 1.5,
                                y: plot.y,
                                element: tagRefs[`${i}_${j}_right_line`],
                                position: 'right',
                            })?.left + 'px',
                        height: 'fit-content',
                        width: 'fit-content',
                        background: serie.color,
                        color: adaptColorToBackground(serie.color),
                        padding: '0 6px',
                        fontSize: FINAL_CONFIG.line.tag.fontSize + 'px',
                        opacity: 1,
                    }"
                >
                    <svg
                        class="vue-ui-xy-tag-arrow"
                        height="20"
                        viewBox="0 0 10 20"
                        :style="{
                            position: 'absolute',
                            right: '100%',
                            top: '50%',
                            transform: 'translateY(-50%)',
                        }"
                    >
                        <path
                            d="M 0,10 10,0 10,20 Z"
                            :fill="serie.color"
                            stroke="none"
                        />
                    </svg>
                    <div
                        class="vue-ui-xy-tag-content"
                        v-html="
                            applyDataLabel(
                                FINAL_CONFIG.line.tag.formatter,
                                plot.value,
                                serie.name,
                                {
                                    datapoint: plot,
                                    seriesIndex: j,
                                    serieName: serie.name,
                                },
                            )
                        "
                    ></div>
                </div>
                <div
                    :ref="(el) => setTagRef(i, j, el, 'left', 'line')"
                    class="vue-ui-xy-tag"
                    data-tag="left"
                    v-if="
                        [
                            selectedMinimapIndex,
                            selectedSerieIndex,
                            selectedRowIndex,
                        ].includes(j) &&
                        serie.useTag &&
                        serie.useTag === 'start' &&
                        FINAL_CONFIG.line.tag.followValue
                    "
                    :style="{
                        position: 'fixed',
                        top:
                            placeXYTag({
                                svgElement: svgRef,
                                x:
                                    drawingArea?.left -
                                    FINAL_CONFIG.line.tag.fontSize / 1.5,
                                y: plot.y,
                                element: tagRefs[`${i}_${j}_left_line`],
                                position: 'left',
                            })?.top + 'px',
                        left:
                            placeXYTag({
                                svgElement: svgRef,
                                x:
                                    drawingArea?.left -
                                    FINAL_CONFIG.line.tag.fontSize / 1.5,
                                y: plot.y,
                                element: tagRefs[`${i}_${j}_left_line`],
                                position: 'left',
                            })?.left + 'px',
                        height: 'fit-content',
                        width: 'fit-content',
                        background: serie.color,
                        color: adaptColorToBackground(serie.color),
                        padding: '0 6px',
                        fontSize: FINAL_CONFIG.line.tag.fontSize + 'px',
                        opacity: 1,
                    }"
                >
                    <svg
                        class="vue-ui-xy-tag-arrow"
                        height="100%"
                        viewBox="0 0 10 20"
                        :style="{
                            position: 'absolute',
                            left: '100%',
                            top: '50%',
                            transform: 'translateY(-50%)',
                        }"
                    >
                        <path
                            d="M 0,0 10,10 0,20 Z"
                            :fill="serie.color"
                            stroke="none"
                        />
                    </svg>
                    <div
                        class="vue-ui-xy-tag-content"
                        v-html="
                            applyDataLabel(
                                FINAL_CONFIG.line.tag.formatter,
                                plot.value,
                                serie.name,
                                {
                                    datapoint: plot,
                                    seriesIndex: j,
                                    serieName: serie.name,
                                },
                            )
                        "
                    ></div>
                </div>
            </template>
        </template>

        <!-- PLOT: TAGS FOLLOWING VALUE -->
        <template v-for="(serie, i) in plotSet" :key="`tag_plot_${serie.id}`">
            <template
                v-for="(plot, j) in serie.plots"
                :key="`tag_plot_${i}_${j}`"
            >
                <div
                    :ref="(el) => setTagRef(i, j, el, 'right', 'plot')"
                    class="vue-ui-xy-tag"
                    data-tag="right"
                    v-if="
                        [
                            selectedMinimapIndex,
                            selectedSerieIndex,
                            selectedRowIndex,
                        ].includes(j) &&
                        serie.useTag &&
                        serie.useTag === 'end' &&
                        FINAL_CONFIG.plot.tag.followValue
                    "
                    :style="{
                        position: 'fixed',
                        top:
                            placeXYTag({
                                svgElement: svgRef,
                                x:
                                    drawingArea?.right +
                                    FINAL_CONFIG.plot.tag.fontSize / 1.5,
                                y: plot.y,
                                element: tagRefs[`${i}_${j}_right_plot`],
                                position: 'right',
                            })?.top + 'px',
                        left:
                            placeXYTag({
                                svgElement: svgRef,
                                x:
                                    drawingArea?.right +
                                    FINAL_CONFIG.plot.tag.fontSize / 1.5,
                                y: plot.y,
                                element: tagRefs[`${i}_${j}_right_plot`],
                                position: 'right',
                            })?.left + 'px',
                        height: 'fit-content',
                        width: 'fit-content',
                        background: serie.color,
                        color: adaptColorToBackground(serie.color),
                        padding: '0 6px',
                        fontSize: FINAL_CONFIG.plot.tag.fontSize + 'px',
                        opacity: 1,
                    }"
                >
                    <svg
                        class="vue-ui-xy-tag-arrow"
                        height="20"
                        viewBox="0 0 10 20"
                        :style="{
                            position: 'absolute',
                            right: '100%',
                            top: '50%',
                            transform: 'translateY(-50%)',
                        }"
                    >
                        <path
                            d="M 0,10 10,0 10,20 Z"
                            :fill="serie.color"
                            stroke="none"
                        />
                    </svg>
                    <div
                        class="vue-ui-xy-tag-content"
                        v-html="
                            applyDataLabel(
                                FINAL_CONFIG.plot.tag.formatter,
                                plot.value,
                                serie.name,
                                {
                                    datapoint: plot,
                                    seriesIndex: j,
                                    serieName: serie.name,
                                },
                            )
                        "
                    ></div>
                </div>
                <div
                    :ref="(el) => setTagRef(i, j, el, 'left', 'plot')"
                    class="vue-ui-xy-tag"
                    data-tag="left"
                    v-if="
                        [
                            selectedMinimapIndex,
                            selectedSerieIndex,
                            selectedRowIndex,
                        ].includes(j) &&
                        serie.useTag &&
                        serie.useTag === 'start' &&
                        FINAL_CONFIG.plot.tag.followValue
                    "
                    :style="{
                        position: 'fixed',
                        top:
                            placeXYTag({
                                svgElement: svgRef,
                                x:
                                    drawingArea?.left -
                                    FINAL_CONFIG.plot.tag.fontSize / 1.5,
                                y: plot.y,
                                element: tagRefs[`${i}_${j}_left_plot`],
                                position: 'left',
                            })?.top + 'px',
                        left:
                            placeXYTag({
                                svgElement: svgRef,
                                x:
                                    drawingArea?.left -
                                    FINAL_CONFIG.plot.tag.fontSize / 1.5,
                                y: plot.y,
                                element: tagRefs[`${i}_${j}_left_plot`],
                                position: 'left',
                            })?.left + 'px',
                        height: 'fit-content',
                        width: 'fit-content',
                        background: serie.color,
                        color: adaptColorToBackground(serie.color),
                        padding: '0 6px',
                        fontSize: FINAL_CONFIG.plot.tag.fontSize + 'px',
                        opacity: 1,
                    }"
                >
                    <svg
                        class="vue-ui-xy-tag-arrow"
                        height="100%"
                        viewBox="0 0 10 20"
                        :style="{
                            position: 'absolute',
                            left: '100%',
                            top: '50%',
                            transform: 'translateY(-50%)',
                        }"
                    >
                        <path
                            d="M 0,0 10,10 0,20 Z"
                            :fill="serie.color"
                            stroke="none"
                        />
                    </svg>
                    <div
                        class="vue-ui-xy-tag-content"
                        v-html="
                            applyDataLabel(
                                FINAL_CONFIG.plot.tag.formatter,
                                plot.value,
                                serie.name,
                                {
                                    datapoint: plot,
                                    seriesIndex: j,
                                    serieName: serie.name,
                                },
                            )
                        "
                    ></div>
                </div>
            </template>
        </template>

        <SlicerPreview
            ref="chartSlicer"
            v-if="
                FINAL_CONFIG.chart.zoom.show &&
                maxX > 6 &&
                isDataset &&
                slicerReady
            "
            :uuid="uniqueId"
            :allMinimaps="allMinimaps"
            :background="FINAL_CONFIG.chart.zoom.color"
            :borderColor="FINAL_CONFIG.chart.backgroundColor"
            :customFormat="FINAL_CONFIG.chart.zoom.customFormat"
            :cutNullValues="FINAL_CONFIG.line.cutNullValues"
            :enableRangeHandles="FINAL_CONFIG.chart.zoom.enableRangeHandles"
            :enableSelectionDrag="FINAL_CONFIG.chart.zoom.enableSelectionDrag"
            :end="slicer.end"
            :focusOnDrag="FINAL_CONFIG.chart.zoom.focusOnDrag"
            :focusRangeRatio="FINAL_CONFIG.chart.zoom.focusRangeRatio"
            :fontSize="FINAL_CONFIG.chart.zoom.fontSize"
            :useResetSlot="FINAL_CONFIG.chart.zoom.useResetSlot"
            :immediate="!FINAL_CONFIG.chart.zoom.preview.enable"
            :inputColor="FINAL_CONFIG.chart.zoom.color"
            :isPreview="isPrecog"
            :labelLeft="timeLabels[0] ? timeLabels[0].text : ''"
            :labelRight="timeLabels.at(-1) ? timeLabels.at(-1).text : ''"
            :max="slicerMax"
            :min="slicerMin"
            :precision="
                isContinuousScale
                    ? FINAL_CONFIG.chart.grid.labels.xAxis.rounding
                    : 0
            "
            :useValueRange="isContinuousScale"
            :minimap="minimap"
            :minimapCompact="FINAL_CONFIG.chart.zoom.minimap.compact"
            :minimapFrameColor="FINAL_CONFIG.chart.zoom.minimap.frameColor"
            :minimapIndicatorColor="
                FINAL_CONFIG.chart.zoom.minimap.indicatorColor
            "
            :minimapLineColor="FINAL_CONFIG.chart.zoom.minimap.lineColor"
            :minimapMerged="FINAL_CONFIG.chart.zoom.minimap.merged"
            :minimapSelectedColor="
                FINAL_CONFIG.chart.zoom.minimap.selectedColor
            "
            :minimapSelectedColorOpacity="
                FINAL_CONFIG.chart.zoom.minimap.selectedColorOpacity
            "
            :minimapSelectedIndex="
                isContinuousScale
                    ? selectedMinimapXValue
                    : (selectedSerieIndex ?? selectedMinimapIndex)
            "
            :minimapSelectionRadius="
                FINAL_CONFIG.chart.zoom.minimap.selectionRadius
            "
            :preciseLabels="
                preciseAllTimeLabels.length
                    ? preciseAllTimeLabels
                    : allTimeLabels
            "
            :refreshStartPoint="
                isContinuousScale
                    ? slicerMin
                    : FINAL_CONFIG.chart.zoom.startIndex !== null
                      ? FINAL_CONFIG.chart.zoom.startIndex
                      : 0
            "
            :refreshEndPoint="
                isContinuousScale
                    ? slicerMax
                    : FINAL_CONFIG.chart.zoom.endIndex !== null
                      ? FINAL_CONFIG.chart.zoom.endIndex + 1
                      : Math.max(
                            ...dataset.map(
                                (datapoint) => lttb(datapoint.series).length,
                            ),
                        )
            "
            :selectColor="FINAL_CONFIG.chart.zoom.highlightColor"
            :selectedSeries="selectedSeries"
            :smoothMinimap="FINAL_CONFIG.chart.zoom.minimap.smooth"
            :start="slicer.start"
            :textColor="FINAL_CONFIG.chart.color"
            :timeLabels="allTimeLabels"
            :usePreciseLabels="
                FINAL_CONFIG.chart.grid.labels.xAxisLabels.datetimeFormatter
                    .enable && !FINAL_CONFIG.chart.zoom.useDefaultFormat
            "
            :valueEnd="slicer.end"
            :valueStart="slicer.start"
            :verticalHandles="FINAL_CONFIG.chart.zoom.minimap.verticalHandles"
            :minScale="FINAL_CONFIG.chart.grid.labels.yAxis.scaleMin"
            :maxScale="FINAL_CONFIG.chart.grid.labels.yAxis.scaleMax"
            :maxWidth="FINAL_CONFIG.chart.zoom.maxWidth"
            :additionalMinimapHeight="
                FINAL_CONFIG.chart.zoom.minimap.additionalHeight
            "
            :handleType="FINAL_CONFIG.chart.zoom.minimap.handleType"
            :handleIconColor="FINAL_CONFIG.chart.zoom.minimap.handleIconColor"
            :handleBorderWidth="
                FINAL_CONFIG.chart.zoom.minimap.handleBorderWidth
            "
            :handleBorderColor="
                FINAL_CONFIG.chart.zoom.minimap.handleBorderColor
            "
            :handleFill="FINAL_CONFIG.chart.zoom.minimap.handleFill"
            :handleWidth="FINAL_CONFIG.chart.zoom.minimap.handleWidth"
            :isCursorPointer="isCursorPointer"
            @futureEnd="(v) => setPrecog('end', v)"
            @futureStart="(v) => setPrecog('start', v)"
            @reset="refreshSlicer"
            @trapMouse="selectMinimapIndex"
            @trapMouseValue="selectMinimapXValue"
            @update:end="onSlicerEnd"
            @update:start="onSlicerStart"
        >
            <template #reset-action="{ reset }">
                <slot name="reset-action" v-bind="{ reset }" />
            </template>
        </SlicerPreview>

        <div :id="`legend-bottom-${uniqueId}`" />

        <!-- LEGEND -->
        <Teleport
            v-if="
                readyTeleport &&
                (FINAL_CONFIG.chart.legend.show || $slots.legend)
            "
            :to="
                FINAL_CONFIG.chart.legend.position === 'top'
                    ? `#legend-top-${uniqueId}`
                    : `#legend-bottom-${uniqueId}`
            "
        >
            <div ref="chartLegend">
                <slot name="legend" v-bind:legend="absoluteDataset">
                    <div
                        data-cy="xy-div-legend"
                        v-if="FINAL_CONFIG.chart.legend.show"
                        class="vue-ui-xy-legend"
                        :style="{
                            fontSize: `var(--legend-font-size, ${FINAL_CONFIG.chart.legend.fontSize ?? 14}px)`,
                        }"
                    >
                        <BaseLegendToggle
                            v-if="
                                FINAL_CONFIG.chart.legend.selectAllToggle
                                    .show &&
                                absoluteDataset.length > 2 &&
                                !loading
                            "
                            :backgroundColor="
                                FINAL_CONFIG.chart.legend.selectAllToggle
                                    .backgroundColor
                            "
                            :color="
                                FINAL_CONFIG.chart.legend.selectAllToggle.color
                            "
                            :fontSize="FINAL_CONFIG.chart.legend.fontSize"
                            :checked="segregatedSeries.length > 0"
                            @toggle="toggleLegend"
                        />

                        <div
                            v-for="(legendItem, i) in absoluteDataset"
                            :data-cy="`xy-div-legend-item-${i}`"
                            :key="`div_legend_item_${i}`"
                            @click="segregate(legendItem)"
                            @keydown="handleLegendKeydown($event, legendItem)"
                            role="button"
                            tabindex="0"
                            :class="{
                                'vue-ui-xy-legend-item-alone':
                                    absoluteDataset.length === 1,
                                'vue-ui-xy-legend-item': true,
                                'vue-ui-xy-legend-item-segregated':
                                    segregatedSeriesSet.has(legendItem.id),
                            }"
                            :style="{
                                cursor: isCursorPointer ? 'pointer' : 'default',
                            }"
                        >
                            <svg
                                v-if="icons[legendItem.type] === 'line'"
                                viewBox="0 0 20 12"
                                height="1em"
                                width="1.43em"
                                aria-hidden="true"
                            >
                                <rect
                                    x="0"
                                    y="7.5"
                                    rx="1.5"
                                    :stroke="FINAL_CONFIG.chart.backgroundColor"
                                    :stroke-width="0.5"
                                    height="3"
                                    width="20"
                                    :fill="legendItem.color"
                                />
                                <Shape
                                    :plot="{ x: 10, y: 9 }"
                                    :radius="4"
                                    :color="legendItem.color"
                                    :shape="
                                        [
                                            'triangle',
                                            'square',
                                            'diamond',
                                            'pentagon',
                                            'hexagon',
                                            'star',
                                        ].includes(legendItem.shape)
                                            ? legendItem.shape
                                            : 'circle'
                                    "
                                    :stroke="FINAL_CONFIG.chart.backgroundColor"
                                    :strokeWidth="0.5"
                                />
                            </svg>
                            <svg
                                v-else-if="icons[legendItem.type] === 'bar'"
                                viewBox="0 0 40 40"
                                height="1em"
                                width="1em"
                                aria-hidden="true"
                            >
                                <rect
                                    v-if="
                                        icons[legendItem.type] === 'bar' &&
                                        $slots.pattern
                                    "
                                    x="4"
                                    y="4"
                                    rx="1"
                                    height="32"
                                    width="32"
                                    stroke="none"
                                    :fill="legendItem.color"
                                />
                                <rect
                                    v-if="icons[legendItem.type] === 'bar'"
                                    x="4"
                                    y="4"
                                    rx="1"
                                    height="32"
                                    width="32"
                                    stroke="none"
                                    :fill="
                                        $slots.pattern
                                            ? `url(#pattern_${uniqueId}_${legendItem.slotAbsoluteIndex})`
                                            : legendItem.color
                                    "
                                />
                            </svg>
                            <svg
                                v-else
                                viewBox="0 0 12 12"
                                height="1em"
                                width="1em"
                                aria-hidden="true"
                            >
                                <Shape
                                    :plot="{ x: 6, y: 6 }"
                                    :radius="5"
                                    :color="legendItem.color"
                                    :shape="
                                        [
                                            'triangle',
                                            'square',
                                            'diamond',
                                            'pentagon',
                                            'hexagon',
                                            'star',
                                        ].includes(legendItem.shape)
                                            ? legendItem.shape
                                            : 'circle'
                                    "
                                />
                            </svg>
                            <span
                                :style="`color:${FINAL_CONFIG.chart.legend.color}`"
                                >{{ legendItem.name }}</span
                            >
                        </div>
                    </div>
                </slot>
            </div>
        </Teleport>

        <div v-if="$slots.source" ref="source" dir="auto">
            <slot name="source" />
        </div>

        <!-- TOOLTIP -->
        <Tooltip
            :teleportTo="FINAL_CONFIG.chart.tooltip.teleportTo"
            :show="mutableConfig.showTooltip && isTooltip"
            :backgroundColor="FINAL_CONFIG.chart.tooltip.backgroundColor"
            :color="FINAL_CONFIG.chart.tooltip.color"
            :fontSize="FINAL_CONFIG.chart.tooltip.fontSize"
            :borderRadius="FINAL_CONFIG.chart.tooltip.borderRadius"
            :borderColor="FINAL_CONFIG.chart.tooltip.borderColor"
            :borderWidth="FINAL_CONFIG.chart.tooltip.borderWidth"
            :backgroundOpacity="FINAL_CONFIG.chart.tooltip.backgroundOpacity"
            :position="FINAL_CONFIG.chart.tooltip.position"
            :offsetX="FINAL_CONFIG.chart.tooltip.offsetX"
            :offsetY="FINAL_CONFIG.chart.tooltip.offsetY"
            :parent="$refs.chart"
            :content="tooltipContent"
            :isFullscreen="isFullscreen"
            :isCustom="
                FINAL_CONFIG.chart.tooltip.customFormat &&
                typeof FINAL_CONFIG.chart.tooltip.customFormat === 'function'
            "
            :smooth="FINAL_CONFIG.chart.tooltip.smooth"
            :backdropFilter="FINAL_CONFIG.chart.tooltip.backdropFilter"
            :smoothForce="FINAL_CONFIG.chart.tooltip.smoothForce"
            :smoothSnapThreshold="
                FINAL_CONFIG.chart.tooltip.smoothSnapThreshold
            "
            :isA11yMode="activeTooltipIndex != null"
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

        <!-- DATA TABLE -->
        <component
            v-if="isDataset && FINAL_CONFIG.chart.userOptions.buttons.table"
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
                    @click="
                        generateCsv(
                            FINAL_CONFIG.chart.userOptions.callbacks.csv,
                        )
                    "
                >
                    <BaseIcon
                        name="fileCsv"
                        :stroke="tableComponent.props.color"
                    />
                </button>
            </template>
            <template #content>
                <div
                    :style="`${isPrinting || FINAL_CONFIG.table.useDialog ? '' : 'max-height:400px'};${FINAL_CONFIG.table.useDialog ? 'height: fit-content; ' : ''};overflow:auto;width:100%;${FINAL_CONFIG.table.useDialog ? '' : 'margin-top:48px'}`"
                >
                    <div
                        style="
                            display: flex;
                            flex-direction: row;
                            gap: 6px;
                            align-items: center;
                            padding-left: 6px;
                        "
                        data-dom-to-png-ignore
                    >
                        <input type="checkbox" v-model="showSparklineTable" />
                        <div
                            @click="showSparklineTable = !showSparklineTable"
                            :style="{
                                cursor: isCursorPointer ? 'pointer' : 'default',
                            }"
                        >
                            <BaseIcon
                                name="chartLine"
                                :size="20"
                                :stroke="FINAL_CONFIG.chart.color"
                            />
                        </div>
                    </div>
                    <TableSparkline
                        v-if="showSparklineTable"
                        :key="`sparkline_${segregateStep}`"
                        :dataset="tableSparklineDataset"
                        :config="tableSparklineConfig"
                    />
                    <DataTable
                        v-else
                        :key="`table_${tableStep}`"
                        :colNames="dataTable.colNames"
                        :head="dataTable.head"
                        :body="dataTable.body"
                        :config="dataTable.config"
                        :title="
                            FINAL_CONFIG.table.useDialog
                                ? ''
                                : tableComponent.title
                        "
                        :withCloseButton="!FINAL_CONFIG.table.useDialog"
                        @close="closeTable"
                    >
                        <template #th="{ th }">
                            <div v-html="th" />
                        </template>
                        <template #td="{ td }">
                            {{
                                !isNaN(Number(td))
                                    ? dataLabel({
                                          p: FINAL_CONFIG.chart.labels.prefix,
                                          v: td,
                                          s: FINAL_CONFIG.chart.labels.suffix,
                                          r: FINAL_CONFIG.table.rounding,
                                      })
                                    : td
                            }}
                        </template>
                    </DataTable>
                </div>
            </template>
        </component>

        <!-- v3 Skeleton loader -->
        <slot name="skeleton">
            <BaseScanner v-if="loading" />
        </slot>
    </div>
</template>

<style scoped lang="scss">
@import '../vue-data-ui.css';

.vue-ui-xy * {
    transition: unset;
}

path,
line,
rect {
    animation: xyAnimation 0.5s ease-in-out;
    transform-origin: center;
}

@keyframes xyAnimation {
    0% {
        transform: scale(0.9, 0.9);
        opacity: 0;
    }

    80% {
        transform: scale(1.02, 1.02);
        opacity: 1;
    }

    to {
        transform: scale(1, 1);
        opacity: 1;
    }
}

.vue-ui-xy {
    position: relative;
}

.vue-ui-xy-legend {
    align-items: center;
    column-gap: 24px;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    user-select: none;
    width: 100%;
}

.vue-ui-xy-legend-item {
    align-items: center;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 5px;
}

.vue-ui-xy-legend-item-alone {
    cursor: default;
}

.vue-ui-xy-legend-item-segregated {
    opacity: 0.5;
}

.vue-ui-xy-legend-item:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
}

.vue-ui-xy-title {
    align-items: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 100%;
}

canvas {
    width: 100%;
    object-fit: contain;
}

svg.vue-ui-xy-tag-arrow *,
line.vue-ui-xy-tag-line,
line.vue-ui-xy-tag-plot {
    animation: none !important;
}

.vue-ui-xy-tag {
    z-index: 2147483647;
    pointer-events: none;
}

.vue-ui-xy-tag[data-tag='right'] {
    border-radius: 0 3px 3px 0;
}

.vue-ui-xy-tag[data-tag='left'] {
    border-radius: 3px 0 0 3px;
}

.vue-data-ui-datalabel {
    transition: all 0.2s ease-in-out;
}

.vue-ui-xy.no-transition path,
.vue-ui-xy.no-transition line,
.vue-ui-xy.no-transition rect,
.vue-ui-xy.no-transition .vue-data-ui-datalabel {
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

.vue-ui-xy-crosshair-selection line {
    animation: none;
}

@media (prefers-reduced-motion: reduce) {
    .vue-data-ui-component * {
        transition: none !important;
        animation: none !important;
    }
}
</style>
