<script setup>
import { getAnnotatorProps } from '../annotatorConfig';
import { createAnnotationViewport } from '../utils/annotationViewport';
import {
    annotationSlotNames,
    getAnnotationSlotProps,
} from '../annotationSlots';
import {
    getUserOptionSlots,
    getUserOptionSlotProps,
} from '../userOptionsSlots';
import {
    computed,
    defineAsyncComponent,
    nextTick,
    onBeforeUnmount,
    onMounted,
    ref,
    shallowRef,
    toRefs,
    watch,
    watchEffect,
} from 'vue';
import * as detector from '../chartDetector';
import {
    applyDataLabel,
    calcMarkerOffsetX,
    calcMarkerOffsetY,
    calcNutArrowPath,
    calculateNiceScale,
    checkNaN,
    convertColorToHex,
    convertCustomPalette,
    createSmoothPath,
    createUid,
    createTSpansFromLineBreaksOnX,
    dataLabel,
    error,
    isFunction,
    makeDonut,
    palette,
    sanitizeArray,
    XMLNS,
    treeShake,
    deepClone,
} from '../lib';
import { COMMON_RULES, useHints } from '../useHints';
import { useConfig } from '../useConfig';
import { useSvgLabelLayout } from '../useSvgLabelLayout';
import { useLoading } from '../useLoading';
import { usePrinter } from '../usePrinter';
import { useResponsive } from '../useResponsive';
import { useTimeLabels } from '../useTimeLabels';
import { useChartExport } from '../useChartExport';
import { useTransitions } from '../useTransitions.js';
import { useChartAccessibility } from '../useChartAccessibility';
import { useTimeLabelCollision } from '../useTimeLabelCollider';
import { createChartImageGetter } from '../chartImage';
import { resolveChartConfigWithPalette } from '../resolveChartConfig';
import SlicerPreview from '../atoms/SlicerPreview.vue';
import themes from '../themes/vue_ui_quick_chart.json';
import BaseScanner from '../atoms/BaseScanner.vue';
import A11yDataTable from '../atoms/A11yDataTable.vue';
import BaseLegendToggle from '../atoms/BaseLegendToggle.vue';

const BaseIcon = defineAsyncComponent(() => import('../atoms/BaseIcon.vue'));
const PackageVersion = defineAsyncComponent(
    () => import('../atoms/PackageVersion.vue'),
);
const PenAndPaper = defineAsyncComponent(
    () => import('../atoms/PenAndPaper.vue'),
);
const Tooltip = defineAsyncComponent(() => import('../atoms/Tooltip.vue'));
const UserOptions = defineAsyncComponent(
    () => import('../atoms/UserOptions.vue'),
);

const { vue_ui_quick_chart: DEFAULT_CONFIG } = useConfig();

const props = defineProps({
    config: {
        type: Object,
        default() {
            return {};
        },
    },
    dataset: {
        type: [Array, Object, String, Number],
        default() {
            return null;
        },
    },
    zoomState: {
        type: Object,
        default: null,
    },
});

const quickChart = ref(null);
const quickChartTitle = ref(null);
const quickChartLegend = ref(null);
const quickChartSlicer = ref(null);
const uid = ref(createUid());
const isTooltip = ref(false);
const dataTooltipSlot = ref(null);
const tooltipContent = ref('');
const selectedDatapoint = ref(null);
const source = ref(null);
const noTitle = ref(null);
const segregated = ref([]);
const step = ref(0);
const slicerStep = ref(0);
const readyTeleport = ref(false);

const timeLabelsEls = ref(null);
const scaleLabels = ref(null);

const FINAL_CONFIG = ref(prepareConfig());

useHints({
    config: () => FINAL_CONFIG.value,
    dataset: () => props.dataset,
    component: 'VueUiQuickChart',
    rules: [
        COMMON_RULES.emptyArray,
        {
            test: () => true,
            message: [
                '👀 This is a swiss-knife component. If you need more control, consider using dedicated components:',
                '',
                '▶️ VueUiXy for time series line and/or bars',
                '',
                '▶️ VueUiDonut, VueUiWaffle, VueUiRings for proportions',
            ],
        },
    ],
});

const { transitionEnabled } = useTransitions({
    config: () => FINAL_CONFIG.value.transitions,
    dataset: () => props.dataset,
});

const debug = computed(() => FINAL_CONFIG.value.debug);
const isCursorPointer = computed(() => FINAL_CONFIG.value.useCursorPointer);

const activeTooltipIndex = ref(null); // a11y
const tooltipA11yPosition = ref({ x: 0, y: 0 }); // a11y
const tooltipTriggerMode = ref('pointer'); // a11y
const isFocus = ref(false); // a11y

const skeletonConfig = computed(() => {
    return treeShake({
        defaultConfig: {
            backgroundColor: '#99999930',
            customPalette: ['#BABABA'],
            showDataLabels: false,
            paletteStartIndex: 0,
            showUserOptions: false,
            showTooltip: false,
            xAxisLabel: '',
            yAxisLabel: '',
            xyAxisStroke: '#999999',
            xyGridStroke: '#99999950',
            xyPeriods: [],
            xyShowScale: false,
            xyPaddingLeft: 6,
            xyPaddingBottom: 12,
            zoomXy: false,
            zoomStartIndex: null,
            zoomEndIndex: null,
        },
        userConfig: FINAL_CONFIG.value.skeletonConfig ?? {},
    });
});

// v3 - Skeleton loader management
const { loading, FINAL_DATASET } = useLoading({
    ...toRefs(props),
    FINAL_CONFIG,
    prepareConfig,
    skeletonDataset: props.config?.skeletonDataset ?? [
        1, 2, 3, 5, 8, 13, 21, 34, 55, 89,
    ],
    skeletonConfig: treeShake({
        defaultConfig: FINAL_CONFIG.value,
        userConfig: skeletonConfig.value,
    }),
});

const { svgRef } = useChartAccessibility({
    config: { text: FINAL_CONFIG.value.title },
});

const showUserOptionsOnChartHover = computed(
    () => FINAL_CONFIG.value.showUserOptionsOnChartHover,
);
const keepUserOptionState = computed(
    () => FINAL_CONFIG.value.keepUserOptionsStateOnChartLeave,
);
const userOptionsVisible = ref(!FINAL_CONFIG.value.showUserOptionsOnChartHover);

const userHovers = ref(false);

function setUserOptionsVisibility(state = false) {
    userHovers.value = state;
    if (!showUserOptionsOnChartHover.value) return;
    userOptionsVisible.value = state;
}

function prepareConfig() {
    return resolveChartConfigWithPalette(props.config, DEFAULT_CONFIG, themes);
}

function stringifyStructuralConfig(cfg) {
    const clonedConfig = deepClone(cfg);
    if (clonedConfig?.tooltipPosition) {
        delete clonedConfig.tooltipPosition;
        // Add more properties here if they should not recompute the svg
    }
    return JSON.stringify(clonedConfig);
}

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
            FINAL_CONFIG.value.tooltipPosition = preparedConfig.tooltipPosition;

            mutableConfig.value.showTooltip = FINAL_CONFIG.value.showTooltip;

            return;
        }

        if (!loading.value) {
            FINAL_CONFIG.value = preparedConfig;
        }
        if (!FINAL_CONFIG.value.responsive) {
            defaultSizes.value.width = FINAL_CONFIG.value.width;
            defaultSizes.value.height = FINAL_CONFIG.value.height;
        }
        userOptionsVisible.value =
            !FINAL_CONFIG.value.showUserOptionsOnChartHover;
        prepareChart();

        // Reset mutable config
        mutableConfig.value.showTooltip = FINAL_CONFIG.value.showTooltip;
    },
    { deep: true },
);

const customPalette = computed(() => {
    return convertCustomPalette(FINAL_CONFIG.value.customPalette);
});

const emit = defineEmits([
    'selectDatapoint',
    'selectLegend',
    'zoomStart',
    'zoomEnd',
    'zoomReset',
    'update:zoomState',
    'copyAlt',
]);

const fd = computed(() => {
    const f = detector.detectChart({
        debug: debug.value,
        dataset: sanitizeArray(FINAL_DATASET.value, [
            'serie',
            'series',
            'data',
            'value',
            'values',
            'num',
        ]),
        barLineSwitch: FINAL_CONFIG.value.chartIsBarUnderDatasetLength,
    });
    if (!f?.type && debug.value) {
        console.error('VueUiQuickChart : Dataset is not processable');
    }
    return f?.type ? f : null;
});

const formattedDataset = ref(fd.value);

const isProcessable = computed(() => {
    return !!formattedDataset.value;
});

const chartType = computed(() => {
    return formattedDataset.value ? formattedDataset.value.type : null;
});

const isZoomableChart = computed(() =>
    [detector.chartType.BAR, detector.chartType.LINE].includes(chartType.value),
);

const isZoomUiVisible = computed(
    () =>
        isZoomableChart.value &&
        FINAL_CONFIG.value.zoomXy &&
        Number(formattedDataset.value?.maxSeriesLength ?? 0) > 1,
);

watch(
    () => chartType.value,
    (v) => {
        if (!v) {
            error({
                componentName: 'VueUiQuickChart',
                type: 'dataset',
                debug: debug.value,
            });
        }
    },
    { immediate: true },
);

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `${chartType.value}_${uid.value}`,
    fileName: FINAL_CONFIG.value.title || chartType.value,
    options: FINAL_CONFIG.value.userOptionsPrint,
});

const hasOptionsNoTitle = computed(() => {
    return FINAL_CONFIG.value.showUserOptions && !FINAL_CONFIG.value.title;
});

const defaultSizes = ref({
    width: FINAL_CONFIG.value.width,
    height: FINAL_CONFIG.value.height,
});

const mutableConfig = ref({
    showTooltip: FINAL_CONFIG.value.showTooltip,
});

// v3 - Essential to make shifting between loading config and final config work
watch(
    FINAL_CONFIG,
    () => {
        mutableConfig.value = {
            showTooltip: FINAL_CONFIG.value.showTooltip,
        };
    },
    { immediate: true },
);

const resizeObserver = shallowRef(null);
let chartDisposed = false;
let clickSuppressionTimer = null;

function stopResponsive() {
    cancelAnimationFrame(resizeFrame);
    resizeObserver.value?.disconnect();
    resizeObserver.value = null;
}

const responsiveSizeReady = ref(false);
let resizeFrame = 0;

onMounted(() => {
    readyTeleport.value = true;
    prepareChart();
});

function prepareChart() {
    updateChartSizing();
    setupSlicer();
}

function updateChartSizing() {
    if (chartDisposed) return;
    stopResponsive();
    if (FINAL_CONFIG.value.responsive && quickChart.value) {
        const handleResize = () => {
            if (chartDisposed || !FINAL_CONFIG.value.responsive) return;
            const { width, height } = useResponsive({
                chart: quickChart.value,
                title: FINAL_CONFIG.value.title ? quickChartTitle.value : null,
                legend: FINAL_CONFIG.value.showLegend
                    ? quickChartLegend.value
                    : null,
                slicer: isZoomUiVisible.value ? quickChartSlicer.value : null,
                source: source.value,
                noTitle: noTitle.value,
            });

            cancelAnimationFrame(resizeFrame);
            resizeFrame = requestAnimationFrame(() => {
                defaultSizes.value.width = width;
                defaultSizes.value.height = height;
                responsiveSizeReady.value = true;
            });
        };

        resizeObserver.value = new ResizeObserver(handleResize);
        resizeObserver.value.observe(quickChart.value.parentNode);
    }
}

watch(quickChart, updateChartSizing, { flush: 'post' });

onBeforeUnmount(() => {
    chartDisposed = true;
    stopResponsive();
    cancelDonutAnimations();
    clearTimeout(clickSuppressionTimer);
    timeLabelsRequestId += 1;
    clearQueuedSlicerFrame();
    cancelChartZoomSelection();
});

const viewBox = computed(
    () =>
        `0 0 ${defaultSizes.value.width <= 0 ? 10 : defaultSizes.value.width} ${defaultSizes.value.height <= 0 ? 10 : defaultSizes.value.height}`,
);

function sumValues(source) {
    return [...source].map((s) => s.value).reduce((a, b) => a + b, 0);
}

function getBlurFilter(id) {
    if (
        FINAL_CONFIG.value.blurOnHover &&
        ![null, undefined].includes(selectedDatapoint.value) &&
        selectedDatapoint.value !== id
    ) {
        return `url(#blur_${uid.value})`;
    } else {
        return '';
    }
}

function toggleLegend() {
    cancelDonutAnimations();
    if (chartType.value === detector.chartType.DONUT)
        formattedDataset.value = fd.value;
    if (segregated.value.length) {
        segregated.value = [];
    } else {
        if (chartType.value === detector.chartType.DONUT) {
            donut.value.legend.forEach((l) => {
                segregated.value.push(l.id);
            });
        } else if (chartType.value === detector.chartType.LINE) {
            line.value.legend.forEach((l) => {
                segregated.value.push(l.id);
            });
        } else if (chartType.value === detector.chartType.BAR) {
            bar.value.legend.forEach((l) => {
                segregated.value.push(l.id);
            });
        }
    }

    if (chartType.value === detector.chartType.DONUT) {
        emit('selectLegend', donut.value.dataset);
    } else if (chartType.value === detector.chartType.LINE) {
        emit('selectLegend', line.value.dataset);
    } else if (chartType.value === detector.chartType.BAR) {
        emit('selectLegend', bar.value.dataset);
    }
}

function segregate(id, len) {
    if (segregated.value.includes(id)) {
        segregated.value = segregated.value.filter((el) => el !== id);
    } else {
        if (segregated.value.length < len) {
            segregated.value.push(id);
        }
    }
}

const donutAnimations = new Map();
const isSegregatingDonut = ref(false);

function cancelDonutAnimations() {
    for (const animation of donutAnimations.values())
        cancelAnimationFrame(animation.frame);
    donutAnimations.clear();
    isSegregatingDonut.value = false;
}

function getDonutValue(node) {
    return (
        node?.VALUE ||
        node?.DATA ||
        node?.SERIE ||
        node?.VALUES ||
        node?.NUM ||
        0
    );
}

function setDonutValue(id, value) {
    formattedDataset.value = {
        ...formattedDataset.value,
        dataset: formattedDataset.value.dataset.map((node, index) =>
            id === `donut_${index}` ? { ...node, value, VALUE: value } : node,
        ),
    };
}

function segregateDonut(arc, ds) {
    const previous = donutAnimations.get(arc.id);
    if (previous) return;
    const restoring = segregated.value.includes(arc.id);
    if (!restoring && ds.length <= 1) {
        emit('selectLegend', donut.value.dataset);
        return;
    }
    const targetValue = getDonutValue(
        fd.value?.dataset.find((_, index) => arc.id === `donut_${index}`),
    );
    let value = arc.value;
    if (restoring)
        segregated.value = segregated.value.filter((id) => id !== arc.id);
    const animation = { frame: null };
    donutAnimations.set(arc.id, animation);
    isSegregatingDonut.value = true;
    function animate() {
        if (donutAnimations.get(arc.id) !== animation) return;
        if (
            targetValue === 0 ||
            (restoring ? value > targetValue : value < targetValue / 100)
        ) {
            setDonutValue(arc.id, restoring ? targetValue : 0);
            if (!restoring) segregated.value.push(arc.id);
            donutAnimations.delete(arc.id);
            isSegregatingDonut.value = donutAnimations.size > 0;
            emit('selectLegend', donut.value.dataset);
            return;
        }
        value = restoring ? value + targetValue * 0.025 : value / 1.1;
        setDonutValue(arc.id, value);
        animation.frame = requestAnimationFrame(animate);
    }
    animate();
}

const commonSelectedIndex = ref(null);

function setCommonSelectedIndex(index) {
    commonSelectedIndex.value = index;
}

const optimalDonutThickness = computed(() => {
    return FINAL_CONFIG.value.donutThicknessRatio < 0.01
        ? 0.01
        : FINAL_CONFIG.value.donutThicknessRatio > 0.4
          ? 0.4
          : FINAL_CONFIG.value.donutThicknessRatio;
});

const donut = computed(() => {
    if (chartType.value !== detector.chartType.DONUT) return null;
    const ds = formattedDataset.value.dataset
        .map((ds, i) => {
            return {
                ...ds,
                value: getDonutValue(ds),
                name:
                    ds.NAME ||
                    ds.DESCRIPTION ||
                    ds.TITLE ||
                    ds.LABEL ||
                    `Serie ${i}`,
                id: `donut_${i}`,
            };
        })
        .map((ds, i) => {
            return {
                ...ds,
                color: ds.COLOR
                    ? convertColorToHex(ds.COLOR)
                    : customPalette.value[
                          i + FINAL_CONFIG.value.paletteStartIndex
                      ] ||
                      palette[i + FINAL_CONFIG.value.paletteStartIndex] ||
                      palette[
                          (i + FINAL_CONFIG.value.paletteStartIndex) %
                              palette.length
                      ],
                immutableValue: ds.value,
            };
        });

    function displayArcPercentage(arc, stepBreakdown) {
        return dataLabel({
            v: isNaN(arc.value / sumValues(stepBreakdown))
                ? 0
                : (arc.value / sumValues(stepBreakdown)) * 100,
            s: '%',
            r: FINAL_CONFIG.value.dataLabelRoundingPercentage,
        });
    }

    function isArcBigEnough(arc) {
        return (
            arc.proportion * 100 >
            FINAL_CONFIG.value.donutHideLabelUnderPercentage
        );
    }

    function getSpaces(datapointId, num2) {
        const num1 = getDonutValue(
            fd.value.dataset.find((_, i) => `donut_${i}` === datapointId),
        );
        const difference = Math.abs(
            String(Number(num1.toFixed(0))).length -
                String(Number(num2.toFixed(0))).length,
        );
        return difference;
    }

    function useTooltip({ datapoint, seriesIndex, triggerMode = 'pointer' }) {
        dataTooltipSlot.value = {
            datapoint,
            seriesIndex,
            config: FINAL_CONFIG.value,
            dataset: ds,
        };
        selectedDatapoint.value = datapoint.id;
        activeTooltipIndex.value = seriesIndex;
        tooltipTriggerMode.value = triggerMode;

        const customFormat = FINAL_CONFIG.value.tooltipCustomFormat;

        if (FINAL_CONFIG.value.events.datapointEnter) {
            FINAL_CONFIG.value.events.datapointEnter({
                datapoint,
                seriesIndex,
            });
        }

        const formatted = isFunction(customFormat)
            ? customFormat({
                  datapoint,
                  seriesIndex,
                  series: ds,
                  config: FINAL_CONFIG.value,
              })
            : undefined;
        if (typeof formatted === 'string') {
            tooltipContent.value = formatted;
        } else {
            let html = '';
            html += `<div style="width:100%;text-align:center;border-bottom:1px solid ${FINAL_CONFIG.value.tooltipBorderColor};padding-bottom:6px;margin-bottom:3px;">${datapoint.name}</div>`;
            html += `<div style="display:flex;flex-direction:row;gap:6px;align-items:center;"><svg viewBox="0 0 12 12" height="14" width="14"><circle data-cy="donut-tooltip-marker" cx="6" cy="6" r="6" stroke="none" fill="${datapoint.color}"/></svg>`;

            html += `<b>${applyDataLabel(
                FINAL_CONFIG.value.formatter,
                datapoint.value,
                dataLabel({
                    p: FINAL_CONFIG.value.valuePrefix,
                    v: datapoint.value,
                    s: FINAL_CONFIG.value.valueSuffix,
                    r: FINAL_CONFIG.value.dataLabelRoundingValue,
                }),
                { datapoint, seriesIndex },
            )}</b>`;

            html += `<span>(${dataLabel({ v: datapoint.proportion * 100, s: '%', r: FINAL_CONFIG.value.dataLabelRoundingPercentage })})</span></div>`;

            tooltipContent.value = `<div>${html}</div>`;
        }
        isTooltip.value = true;
    }

    function killTooltip({ datapoint, seriesIndex }) {
        if (FINAL_CONFIG.value.events.datapointLeave) {
            FINAL_CONFIG.value.events.datapointLeave({
                datapoint,
                seriesIndex,
            });
        }
        isTooltip.value = false;
        selectedDatapoint.value = null;
        commonSelectedIndex.value = null;
        activeTooltipIndex.value = null;
        tooltipTriggerMode.value = 'pointer';
    }

    function selectDatapoint({ datapoint, seriesIndex }) {
        if (FINAL_CONFIG.value.events.datapointClick) {
            FINAL_CONFIG.value.events.datapointClick({
                datapoint,
                seriesIndex,
            });
        }
        emit('selectDatapoint', datapoint);
    }

    const drawingArea = {
        centerX: defaultSizes.value.width / 2,
        centerY: defaultSizes.value.height / 2,
    };

    const total = ds
        .filter((d) => !segregated.value.includes(d.id))
        .map((d) => d.value || 0)
        .reduce((a, b) => a + b, 0);

    const legend = ds.map((d, i) => {
        return {
            ...d,
            proportion: (d.value || 0) / total,
            value: d.value || 0,
            absoluteValue: getDonutValue(
                fd.value.dataset.find((_, idx) => `donut_${idx}` === d.id),
            ),
            shape: 'circle',
        };
    });

    const cx = defaultSizes.value.width / 2;
    const cy = defaultSizes.value.height / 2;
    const radius =
        defaultSizes.value.height * FINAL_CONFIG.value.donutRadiusRatio;

    return {
        dataset: legend.filter((s) => !segregated.value.includes(s.id)),
        legend,
        drawingArea,
        displayArcPercentage,
        isArcBigEnough,
        useTooltip,
        killTooltip,
        selectDatapoint,
        getSpaces,
        total,
        cx,
        cy,
        radius,
        chart: makeDonut(
            { series: ds.filter((s) => !segregated.value.includes(s.id)) },
            cx,
            cy,
            radius,
            radius,
            1.99999,
            2,
            1,
            360,
            105.25,
            defaultSizes.value.height * optimalDonutThickness.value,
        ),
    };
});

const slicer = ref({
    start: 0,
    end: formattedDataset.value?.maxSeriesLength ?? 0,
});

const slicerComponent = ref(null);
const slicerReady = ref(false);
const isSettingUpSlicer = ref(false);
const suppressSlicerChild = ref(false);

const isChartZoomSelecting = ref(false);
const isChartZoomPointerFocused = ref(false);
const chartZoomStartX = ref(null);
const chartZoomCurrentX = ref(null);
const chartZoomPointerId = ref(null);
const ignoreNextChartClick = ref(false);
const lastChartZoomTap = ref({
    time: 0,
    x: 0,
    y: 0,
    pointerType: null,
});

const DEFAULT_ZOOM_ON_CHART = {
    show: false,
    selection: {
        fill: '#2D353C',
        stroke: 'transparent',
        fillOpacity: 0.1,
        strokeOpacity: 0.5,
        strokeWidth: 1,
        strokeDasharray: 0,
    },
};

const dragToZoomConfig = computed(() => {
    const userConfig = FINAL_CONFIG.value.dragToZoom ?? {};

    return {
        ...DEFAULT_ZOOM_ON_CHART,
        ...userConfig,
        selection: {
            ...DEFAULT_ZOOM_ON_CHART.selection,
            ...(userConfig.selection ?? {}),
        },
    };
});

const isChartZoomEnabled = computed(() => {
    return (
        isZoomableChart.value &&
        dragToZoomConfig.value.show &&
        slicerReady.value &&
        getSlicerMax() > 1 &&
        !loading.value
    );
});

let queuedSlicerFrame = null;
let queuedSlicerUpdate = {};

/**
 * Coerce supplied zoom bounds to finite numbers, filling omitted bounds from fallback.
 * This validates the shape only; dataset clamping happens when the range is applied.
 *
 * @param {unknown} state - Candidate range; at least one bound must be supplied.
 * @param {{ start: number, end: number }} [fallback] - Bounds used for missing endpoints.
 * @returns {{ start: number, end: number } | null} Numeric range, or null for invalid input.
 */
function normalizeZoomState(state, fallback = slicer.value) {
    if (!state || typeof state !== 'object') return null;
    const hasStart = state.start !== undefined && state.start !== null;
    const hasEnd = state.end !== undefined && state.end !== null;
    if (!hasStart && !hasEnd) return null;
    const start = hasStart ? Number(state.start) : Number(fallback.start);
    const end = hasEnd ? Number(state.end) : Number(fallback.end);
    if (!Number.isFinite(start) || !Number.isFinite(end)) {
        return null;
    }
    return {
        start,
        end,
    };
}

function emitZoomState(state) {
    const normalized = normalizeZoomState(state);
    if (!normalized) return;

    emit('update:zoomState', normalized);
}

function clearQueuedSlicerFrame() {
    if (queuedSlicerFrame) {
        cancelAnimationFrame(queuedSlicerFrame);
        queuedSlicerFrame = null;
    }

    queuedSlicerUpdate = {};
}

function getSlicerMax() {
    const max = Number(formattedDataset.value?.maxSeriesLength);
    return Number.isFinite(max) ? Math.max(0, max) : 0;
}

function validSlicerEnd(v, start = slicer.value.start) {
    const max = getSlicerMax();
    if (max <= 0) return 0;

    const effectiveStart = Math.max(0, Math.min(Number(start) || 0, max - 1));

    const value = Number(v);
    if (!Number.isFinite(value)) {
        return Math.min(effectiveStart + 1, max);
    }

    if (value > max) {
        return max;
    }

    if (value <= effectiveStart) {
        return Math.min(effectiveStart + 1, max);
    }

    return Math.max(0, value);
}

function normalizeSlicerWindow() {
    const max = getSlicerMax();

    if (max <= 0) {
        slicer.value = { start: 0, end: 0 };

        if (slicerComponent.value) {
            slicerComponent.value.setRangeValues(0, 0);
        }
        return;
    }

    let start = Number(slicer.value.start);
    let end = Number(slicer.value.end);

    if (!Number.isFinite(start)) start = 0;
    if (!Number.isFinite(end)) end = max;

    start = Math.max(0, Math.min(start, max - 1));
    end = Math.max(start + 1, Math.min(end, max));

    slicer.value = { start, end };

    if (slicerComponent.value) {
        slicerComponent.value.setRangeValues(start, end);
    }
}

function applyZoomState(state) {
    if (!isZoomableChart.value) return null;

    const normalized = normalizeZoomState(state);
    if (!normalized) return null;

    if (
        normalized.start !== Number(slicer.value.start) ||
        normalized.end !== Number(slicer.value.end)
    ) {
        clearQueuedSlicerFrame();

        slicer.value = {
            start: normalized.start,
            end: normalized.end,
        };

        normalizeSlicerWindow();
    }

    // Always return the final committed range. Prop-driven synchronization
    // remains silent, while the public imperative API can publish this state
    // so sibling instances sharing v-model:zoom-state receive it.
    return {
        start: Number(slicer.value.start),
        end: Number(slicer.value.end),
    };
}

/**
 * Apply an imperative zoom update and publish the committed range through update:zoomState.
 * Invalid input leaves the current range unchanged.
 *
 * @param {import('vue-data-ui').VueUiZoomState} state - Range; omitted bounds keep their current values.
 * @returns {{ start: number, end: number } | null} Committed bounds, or null for invalid input.
 */
function setZoomState(state) {
    const applied = applyZoomState(state);
    if (!applied) return null;

    emitZoomState(applied);

    return applied;
}

async function setupSlicer({ applyControlledZoom = true } = {}) {
    if (chartDisposed || isSettingUpSlicer.value) return;

    if (!isZoomableChart.value) {
        slicerReady.value = false;
        return;
    }

    isSettingUpSlicer.value = true;

    try {
        await nextTick();
        await nextTick();
        if (chartDisposed || !isZoomableChart.value) return;

        const { zoomStartIndex, zoomEndIndex } = FINAL_CONFIG.value;
        const max = getSlicerMax();

        if (max <= 0) {
            slicer.value = { start: 0, end: 0 };

            slicerReady.value = false;
            return;
        }

        let start = zoomStartIndex != null ? Number(zoomStartIndex) : 0;
        let end =
            zoomEndIndex != null
                ? validSlicerEnd(Number(zoomEndIndex) + 1, start)
                : max;

        if (applyControlledZoom && normalizeZoomState(props.zoomState)) {
            const controlled = normalizeZoomState(props.zoomState);
            start = controlled.start;
            end = controlled.end;
        }

        suppressSlicerChild.value = true;

        slicer.value = { start, end };

        normalizeSlicerWindow();

        slicerReady.value = true;

        await nextTick();

        if (slicerComponent.value) {
            slicerComponent.value.setRangeValues(
                slicer.value.start,
                slicer.value.end,
            );
        }
    } finally {
        queueMicrotask(() => {
            if (!chartDisposed) suppressSlicerChild.value = false;
        });

        isSettingUpSlicer.value = false;
    }
}

async function refreshSlicer({
    applyControlledZoom = false,
    publish = false,
} = {}) {
    clearQueuedSlicerFrame();

    await setupSlicer({ applyControlledZoom });

    if (publish && !chartDisposed) {
        emitZoomState({
            start: Number(slicer.value.start),
            end: Number(slicer.value.end),
        });
        emit('zoomReset');
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
        const nextSlicer = {
            ...slicer.value,
            ...queuedSlicerUpdate,
        };

        queuedSlicerUpdate = {};
        queuedSlicerFrame = null;

        slicer.value = nextSlicer;

        normalizeSlicerWindow();

        // SlicerPreview emits update:start and update:end independently while
        // dragging the full selection. Publish only after both pending values
        // have been merged into one authoritative range.
        emitZoomState({
            start: Number(slicer.value.start),
            end: Number(slicer.value.end),
        });
    });
}

function onSlicerStart(v) {
    if (isSettingUpSlicer.value || suppressSlicerChild.value) return;

    const start = Number(v);
    if (!Number.isFinite(start)) return;

    emit('zoomStart', {
        index: start,
        isZoom: start !== 0,
    });

    if (start === slicer.value.start && queuedSlicerUpdate.end === undefined) {
        return;
    }

    queueSlicerUpdate({ start });
}

function onSlicerEnd(v) {
    if (isSettingUpSlicer.value || suppressSlicerChild.value) return;

    const pendingStart =
        queuedSlicerUpdate.start !== undefined
            ? queuedSlicerUpdate.start
            : slicer.value.start;

    const end = validSlicerEnd(Number(v), pendingStart);

    emit('zoomEnd', {
        index: end,
        isZoom: end !== getSlicerMax(),
    });

    if (end === slicer.value.end && queuedSlicerUpdate.start === undefined) {
        return;
    }

    queueSlicerUpdate({ end });
}

watch(
    [
        () => props.zoomState,
        isZoomableChart,
        () => Number(formattedDataset.value?.maxSeriesLength ?? 0),
    ],
    async ([state, zoomable, max]) => {
        if (!zoomable || max <= 0 || !state) return;

        if (!slicerReady.value) {
            await setupSlicer({ applyControlledZoom: true });
            return;
        }

        /**
         * When this is the instance from which originated the v-model update, applyZoomState exits
         * immediately because the committed slicer already matches the model.
         */
        applyZoomState(state);
    },
    {
        deep: true,
        immediate: true,
    },
);

watch(
    fd,
    async (nextFormattedDataset) => {
        cancelDonutAnimations();
        if (!nextFormattedDataset) {
            formattedDataset.value = null;
            clearQueuedSlicerFrame();
            clearChartZoomHover();
            cancelChartZoomSelection();
            slicerReady.value = false;
            return;
        }

        const previousType = formattedDataset.value?.type;
        const previousMax = Number(
            formattedDataset.value?.maxSeriesLength ?? 0,
        );

        formattedDataset.value = nextFormattedDataset;

        const nextType = nextFormattedDataset.type;
        const nextMax = Number(nextFormattedDataset.maxSeriesLength ?? 0);

        const nextIsZoomable = [
            detector.chartType.BAR,
            detector.chartType.LINE,
        ].includes(nextType);

        if (!nextIsZoomable) {
            clearQueuedSlicerFrame();
            slicerReady.value = false;
            return;
        }

        const domainChanged =
            previousType !== nextType || previousMax !== nextMax;

        if (domainChanged) {
            clearQueuedSlicerFrame();
            slicerReady.value = false;

            slicer.value = {
                start: 0,
                end: nextMax,
            };

            // Force SlicerPreview to rebuild when it is visible. Shared state
            // is restored immediately afterwards.
            slicerStep.value += 1;

            await nextTick();
            await setupSlicer({ applyControlledZoom: true });
        } else if (props.zoomState) {
            applyZoomState(props.zoomState);
        }
    },
    {
        deep: true,
    },
);

const minimap = computed(() => {
    if (
        !formattedDataset.value ||
        !FINAL_CONFIG.value.zoomMinimap.show ||
        chartType.value === detector.chartType.DONUT
    )
        return [];

    let ds = [];

    if (detector.isSimpleArrayOfNumbers(formattedDataset.value.dataset)) {
        ds = formattedDataset.value.dataset;
    }

    if (detector.isSimpleArrayOfObjects(formattedDataset.value.dataset)) {
        ds = formattedDataset.value.dataset
            .map((d, i) => {
                return {
                    values:
                        d.VALUE ||
                        d.DATA ||
                        d.SERIE ||
                        d.SERIES ||
                        d.VALUES ||
                        d.NUM ||
                        0,
                    id:
                        chartType.value === detector.chartType.LINE
                            ? `line_${i}`
                            : `bar_${i}`,
                };
            })
            .filter((s) => !segregated.value.includes(s.id));
    }

    const maxIndex = detector.isSimpleArrayOfNumbers(ds)
        ? ds.length
        : Math.max(...ds.map((s) => s.values.length));
    let sumAllSeries = [];

    if (detector.isSimpleArrayOfNumbers(ds)) {
        sumAllSeries = ds;
    } else {
        for (let i = 0; i < maxIndex; i += 1) {
            sumAllSeries.push(
                ds
                    .map((s) => s.values[i] || 0)
                    .reduce((a, b) => (a || 0) + (b || 0), 0),
            );
        }
    }

    const min = Math.min(...sumAllSeries);
    return sumAllSeries.map((dp) => dp + (min < 0 ? Math.abs(min) : 0)); // positivized
});

const {
    metrics: labelLayout,
    ready: labelLayoutReady,
    settling: labelLayoutSettling,
    update: measureLabelLayout,
} = useSvgLabelLayout({
    svgRef,
    canMeasure: () =>
        (!FINAL_CONFIG.value.responsive || responsiveSizeReady.value) &&
        (![detector.chartType.LINE, detector.chartType.BAR].includes(
            chartType.value,
        ) ||
            timeLabelsAreReady.value),
    initialMetrics: { scale: 0, bottom: 0, leftOverhang: 0 },
    measure: (read) => ({
        scale: read(scaleLabels.value).textWidth,
        bottom: read(timeLabelsEls.value).height,
        leftOverhang: read(timeLabelsEls.value).leftOverhang,
    }),
});

function getScaleLabelX() {
    return Math.max(
        labelLayout.value.scale + 4,
        labelLayout.value.leftOverhang - FINAL_CONFIG.value.xyPaddingLeft,
    );
}
const timeLabelsY = computed(() => labelLayout.value.bottom);

function getXyDrawingArea() {
    const chartDimensions = {
        height: defaultSizes.value.height,
        width: defaultSizes.value.width,
    };

    let _scaleLabelX = getScaleLabelX();

    return {
        left: _scaleLabelX + FINAL_CONFIG.value.xyPaddingLeft,
        top: FINAL_CONFIG.value.xyPaddingTop,
        right: chartDimensions.width - FINAL_CONFIG.value.xyPaddingRight,
        bottom:
            chartDimensions.height -
            FINAL_CONFIG.value.xyPaddingBottom -
            timeLabelsY.value,
        width: Math.max(
            10,
            chartDimensions.width -
                FINAL_CONFIG.value.xyPaddingLeft -
                FINAL_CONFIG.value.xyPaddingRight -
                _scaleLabelX,
        ),
        height: Math.max(
            10,
            chartDimensions.height -
                FINAL_CONFIG.value.xyPaddingTop -
                FINAL_CONFIG.value.xyPaddingBottom -
                timeLabelsY.value,
        ),
    };
}

function getXySeries(type) {
    let ds = [];

    if (detector.isSimpleArrayOfNumbers(formattedDataset.value.dataset)) {
        ds = [
            {
                values: formattedDataset.value.dataset.slice(
                    slicer.value.start,
                    slicer.value.end,
                ),
                absoluteValues: formattedDataset.value.dataset,
                absoluteIndices: formattedDataset.value.dataset
                    .map((d, i) => i)
                    .slice(slicer.value.start, slicer.value.end),
                name: FINAL_CONFIG.value.title,
                color:
                    customPalette.value[FINAL_CONFIG.value.paletteStartIndex] ||
                    palette[FINAL_CONFIG.value.paletteStartIndex],
                id: `${type}_0`,
            },
        ];
    }

    if (detector.isSimpleArrayOfObjects(formattedDataset.value.dataset)) {
        ds = formattedDataset.value.dataset
            .map((d, i) => {
                return {
                    ...d,
                    values:
                        d.VALUE ||
                        d.DATA ||
                        d.SERIE ||
                        d.SERIES ||
                        d.VALUES ||
                        d.NUM ||
                        0,
                    name:
                        d.NAME ||
                        d.DESCRIPTION ||
                        d.TITLE ||
                        d.LABEL ||
                        `Serie ${i}`,
                    id: `${type}_${i}`,
                };
            })
            .map((d, i) => {
                return {
                    ...d,
                    color: d.COLOR
                        ? convertColorToHex(d.COLOR)
                        : customPalette.value[
                              i + FINAL_CONFIG.value.paletteStartIndex
                          ] ||
                          palette[i + FINAL_CONFIG.value.paletteStartIndex] ||
                          palette[
                              (i + FINAL_CONFIG.value.paletteStartIndex) %
                                  palette.length
                          ],
                    values: d.values.slice(
                        slicer.value.start,
                        slicer.value.end,
                    ),
                    absoluteValues: d.values,
                    absoluteIndices: d.values
                        .map((d, i) => i)
                        .slice(slicer.value.start, slicer.value.end),
                };
            });
    }

    return ds;
}

function getXyInteractions(ds, type) {
    function getMappedSeries(index) {
        return ds
            .map((d) => {
                return {
                    ...d,
                    value: d.values[index],
                    absoluteIndex: d.absoluteIndices[index],
                };
            })
            .filter((d) => !segregated.value.includes(d.id));
    }

    function useTooltip(index, triggerMode = 'pointer') {
        if (isChartZoomSelecting.value && triggerMode === 'pointer') return;

        selectedDatapoint.value = index;
        commonSelectedIndex.value = index;
        activeTooltipIndex.value = index;
        tooltipTriggerMode.value = triggerMode;

        const mappedSeries = getMappedSeries(index);
        if (!mappedSeries.length) {
            clearChartZoomHover();
            return;
        }

        dataTooltipSlot.value = {
            datapoint: mappedSeries,
            seriesIndex: index,
            config: FINAL_CONFIG.value,
            dataset: ds,
        };
        const customFormat = FINAL_CONFIG.value.tooltipCustomFormat;

        if (FINAL_CONFIG.value.events.datapointEnter) {
            FINAL_CONFIG.value.events.datapointEnter({
                datapoint: mappedSeries,
                seriesIndex: index + slicer.value.start,
            });
        }

        const payload = {
            datapoint: mappedSeries,
            seriesIndex: index,
            series: ds,
            config: FINAL_CONFIG.value,
        };
        if (type === 'bar') payload.point = mappedSeries;
        const formatted = isFunction(customFormat)
            ? customFormat(payload)
            : undefined;
        if (typeof formatted === 'string') {
            tooltipContent.value = formatted;
        } else {
            let html = '';

            if (timeLabels.value[index]) {
                html += `<div style="border-bottom:1px solid ${FINAL_CONFIG.value.tooltipBorderColor};padding-bottom:6px;margin-bottom:3px;">${timeLabels.value[index].text}</div>`;
            }

            mappedSeries.forEach((s, i) => {
                html += `
                    <div style="display:flex; flex-wrap: wrap; align-items:center; gap:3px;">
                        <svg viewBox="0 0 12 12" height="14" width="12">${type === 'bar' ? `<rect x=0 y="0" width="12" height="12" rx="1" stroke="none" fill="${s.color}"/>` : `<circle cx="6" cy="6" r="6" stroke="none" fill="${s.color}"/>`}</svg>
                        <span>${s.name}:</span>
                        <b>${applyDataLabel(
                            FINAL_CONFIG.value.formatter,
                            s.value,
                            dataLabel({
                                p: FINAL_CONFIG.value.valuePrefix,
                                v: s.value,
                                s: FINAL_CONFIG.value.valueSuffix,
                                r: FINAL_CONFIG.value.dataLabelRoundingValue,
                            }),
                            { datapoint: s, seriesIndex: i },
                        )}
                        </b>
                    </div>
                `;
            });
            tooltipContent.value = html;
        }
        isTooltip.value = true;
    }

    function killTooltip(index) {
        const datapoint = getMappedSeries(index);

        if (FINAL_CONFIG.value.events.datapointLeave) {
            FINAL_CONFIG.value.events.datapointLeave({
                datapoint,
                seriesIndex: index + slicer.value.start,
            });
        }

        clearChartZoomHover();
    }

    function selectDatapoint(index) {
        const datapoint = getMappedSeries(index);
        if (FINAL_CONFIG.value.events.datapointClick) {
            FINAL_CONFIG.value.events.datapointClick({
                datapoint,
                seriesIndex: index + slicer.value.start,
            });
        }
        emit('selectDatapoint', datapoint);
    }

    return { useTooltip, killTooltip, selectDatapoint };
}

function getLinePath(series) {
    return `M ${FINAL_CONFIG.value.lineSmooth ? createSmoothPath(series.coordinates) : series.linePath}`;
}

const line = computed(() => {
    if (chartType.value !== detector.chartType.LINE) return null;

    const drawingArea = getXyDrawingArea();
    const ds = getXySeries('line');

    const visibleSeries = ds.filter((d) => !segregated.value.includes(d.id));
    const visibleValues = visibleSeries.flatMap((d) => d.values);
    const extremes = {
        max: Math.max(...visibleValues),
        min: Math.min(...visibleValues),
        maxSeries: Math.max(...ds.map((d) => d.values.length)),
    };

    const scale =
        extremes.max === extremes.min
            ? calculateNiceScale(
                  Math.min(extremes.min, 0),
                  extremes.min === 0 ? 1 : Math.max(extremes.min, 0),
                  FINAL_CONFIG.value.xyScaleSegments,
              )
            : calculateNiceScale(
                  extremes.min < 0 ? extremes.min : 0,
                  extremes.max < 0 ? 0 : extremes.max,
                  FINAL_CONFIG.value.xyScaleSegments,
              );
    const absoluteMin = extremes.min < 0 ? Math.abs(extremes.min) : 0;
    const absoluteZero =
        extremes.max < 0
            ? drawingArea.top
            : drawingArea.bottom -
              (absoluteMin / (scale.max + absoluteMin)) * drawingArea.height;
    const slotSize = drawingArea.width / extremes.maxSeries;

    const yLabels = scale.ticks.map((t) => {
        return {
            y:
                drawingArea.bottom -
                drawingArea.height *
                    ((t + absoluteMin) / (scale.max + absoluteMin)),
            x: drawingArea.left - 8,
            value: t,
        };
    });

    const drawableDataset = ds
        .map((d, i) => {
            return {
                ...d,
                shape: 'circle',
                coordinates: d.values.map((v, j) => {
                    return {
                        x: drawingArea.left + slotSize * (j + 1) - slotSize / 2,
                        y:
                            drawingArea.bottom -
                            ((v + absoluteMin) / (scale.max + absoluteMin)) *
                                drawingArea.height,
                        value: v,
                    };
                }),
            };
        })
        .map((d) => {
            let path = [];
            d.coordinates.forEach((c) => {
                path.push(`${c.x},${c.y} `);
            });
            return {
                ...d,
                linePath: path.join(' '),
            };
        });

    const { useTooltip, killTooltip, selectDatapoint } = getXyInteractions(
        ds,
        'line',
    );

    return {
        absoluteZero,
        dataset: drawableDataset.filter(
            (el) => !segregated.value.includes(el.id),
        ),
        legend: drawableDataset,
        drawingArea,
        extremes,
        slotSize,
        yLabels,
        useTooltip,
        killTooltip,
        selectDatapoint,
    };
});

const bar = computed(() => {
    if (chartType.value !== detector.chartType.BAR) return null;

    const drawingArea = getXyDrawingArea();
    const ds = getXySeries('bar');

    const visibleSeries = ds.filter((d) => !segregated.value.includes(d.id));
    const visibleValues = visibleSeries.flatMap((d) => d.values);
    const extremes = {
        max: Math.max(0, Math.max(...visibleValues)),
        min: Math.min(...visibleValues),
        maxSeries: Math.max(...visibleSeries.map((d) => d.values.length)),
    };

    const scale =
        extremes.min === extremes.max
            ? calculateNiceScale(
                  Math.min(extremes.min, 0),
                  extremes.min === 0 ? 1 : Math.max(extremes.min, 0),
                  FINAL_CONFIG.value.xyScaleSegments,
              )
            : calculateNiceScale(
                  extremes.min < 0 ? extremes.min : 0,
                  extremes.max,
                  FINAL_CONFIG.value.xyScaleSegments,
              );
    const absoluteMin = scale.min < 0 ? Math.abs(scale.min) : 0;
    const absoluteZero =
        drawingArea.bottom -
        (absoluteMin / (scale.max + absoluteMin)) * drawingArea.height;
    const slotSize = drawingArea.width / extremes.maxSeries;

    const yLabels = scale.ticks.map((t) => {
        return {
            y:
                drawingArea.bottom -
                drawingArea.height *
                    ((t + absoluteMin) / (scale.max + absoluteMin)),
            x: drawingArea.left - 8,
            value: t,
        };
    });

    const barWidth =
        slotSize / visibleSeries.length -
        FINAL_CONFIG.value.barGap / visibleSeries.length;
    const absoluteMinHeight =
        (absoluteMin / (extremes.max + absoluteMin)) * drawingArea.height;
    function getCoordinates(values, seriesIndex, forLegend = false) {
        return values.map((value, index) => {
            const barHeight =
                ((value + absoluteMin) / (extremes.max + absoluteMin)) *
                drawingArea.height;
            const negativeHeight = forLegend
                ? (Math.abs(value) / Math.abs(extremes.min)) *
                  (drawingArea.height - absoluteZero)
                : (Math.abs(value) / (extremes.max + absoluteMin)) *
                  drawingArea.height;
            return {
                x:
                    drawingArea.left +
                    slotSize * index +
                    barWidth * seriesIndex +
                    FINAL_CONFIG.value.barGap / 2,
                y: value > 0 ? drawingArea.bottom - barHeight : absoluteZero,
                height:
                    value > 0 ? barHeight - absoluteMinHeight : negativeHeight,
                value,
                width: barWidth,
            };
        });
    }
    const legend = ds.map((d, index) => ({
        ...d,
        shape: 'square',
        coordinates: getCoordinates(d.values, index, true),
    }));
    const drawableDataset = visibleSeries.map((d, index) => ({
        ...d,
        coordinates: getCoordinates(d.values, index),
    }));

    const { useTooltip, killTooltip, selectDatapoint } = getXyInteractions(
        ds,
        'bar',
    );

    return {
        absoluteZero,
        dataset: drawableDataset,
        absoluteDataset: drawableDataset,
        legend,
        drawingArea,
        extremes,
        slotSize,
        yLabels,
        useTooltip,
        killTooltip,
        selectDatapoint,
    };
});

const isDev = import.meta.env.DEV;
const xyChart = computed(() =>
    chartType.value === detector.chartType.LINE
        ? line.value
        : chartType.value === detector.chartType.BAR
          ? bar.value
          : null,
);
const xyChartKind = computed(() =>
    chartType.value === detector.chartType.LINE ? 'line' : 'bar',
);
const xyPeriodTicks = computed(() =>
    chartType.value === detector.chartType.BAR
        ? FINAL_CONFIG.value.xyPeriods.slice(
              slicer.value.start,
              slicer.value.end,
          )
        : timeLabels.value,
);

const slicerDrawingArea = computed(() => xyChart.value?.drawingArea ?? null);
const activeChartZoomSlotSize = computed(() =>
    Number(xyChart.value?.slotSize ?? 0),
);
const activeChartZoomVisibleCount = computed(() =>
    Number(xyChart.value?.extremes?.maxSeries ?? 0),
);

const chartZoomSelectionRect = computed(() => {
    const drawingArea = slicerDrawingArea.value;

    if (
        !drawingArea ||
        !isChartZoomSelecting.value ||
        chartZoomStartX.value == null ||
        chartZoomCurrentX.value == null
    ) {
        return null;
    }

    return {
        x: Math.min(chartZoomStartX.value, chartZoomCurrentX.value),
        y: drawingArea.top,
        width: Math.abs(chartZoomCurrentX.value - chartZoomStartX.value),
        height: drawingArea.height,
    };
});

const isChartZoomed = computed(() => {
    if (!slicerReady.value || !isZoomableChart.value) return false;

    return (
        Number(slicer.value.start) !== 0 ||
        Number(slicer.value.end) !== Number(getSlicerMax())
    );
});

function clientToSvgCoords(event) {
    const svgEl = svgRef.value;
    if (!svgEl) return null;

    if (svgEl.createSVGPoint && svgEl.getScreenCTM) {
        const point = svgEl.createSVGPoint();
        point.x = event.clientX;
        point.y = event.clientY;

        const ctm = svgEl.getScreenCTM();

        if (ctm) {
            const transformed = point.matrixTransform(ctm.inverse());

            return {
                x: transformed.x,
                y: transformed.y,
            };
        }
    }

    const rect = svgEl.getBoundingClientRect();
    const viewBoxValue = svgEl.viewBox?.baseVal || {
        x: 0,
        y: 0,
        width: rect.width,
        height: rect.height,
    };

    const scale = Math.min(
        rect.width / viewBoxValue.width,
        rect.height / viewBoxValue.height,
    );

    if (!Number.isFinite(scale) || scale <= 0) return null;

    const drawnWidth = viewBoxValue.width * scale;
    const drawnHeight = viewBoxValue.height * scale;
    const offsetX = (rect.width - drawnWidth) / 2;
    const offsetY = (rect.height - drawnHeight) / 2;

    return {
        x: (event.clientX - rect.left - offsetX) / scale + viewBoxValue.x,
        y: (event.clientY - rect.top - offsetY) / scale + viewBoxValue.y,
    };
}

function clampChartZoomX(x) {
    const drawingArea = slicerDrawingArea.value;
    if (!drawingArea) return x;

    return Math.min(Math.max(x, drawingArea.left), drawingArea.right);
}

function clearChartZoomHover() {
    activeTooltipIndex.value = null;
    tooltipTriggerMode.value = 'pointer';
    isTooltip.value = false;
    selectedDatapoint.value = null;
    commonSelectedIndex.value = null;
}

function cancelChartZoomSelection(event) {
    const pointerId =
        event?.pointerId != null ? event.pointerId : chartZoomPointerId.value;

    if (pointerId != null && svgRef.value?.hasPointerCapture?.(pointerId)) {
        svgRef.value.releasePointerCapture(pointerId);
    }

    isChartZoomSelecting.value = false;
    chartZoomStartX.value = null;
    chartZoomCurrentX.value = null;
    chartZoomPointerId.value = null;
}

function suppressNextChartClick() {
    ignoreNextChartClick.value = true;

    clearTimeout(clickSuppressionTimer);
    clickSuppressionTimer = setTimeout(() => {
        ignoreNextChartClick.value = false;
        clickSuppressionTimer = null;
    }, 0);
}

function onChartZoomClickCapture(event) {
    if (!ignoreNextChartClick.value) return;

    ignoreNextChartClick.value = false;
    event.preventDefault();
    event.stopPropagation();
}

function resetChartZoomFromDoubleTap(event) {
    if (!isChartZoomEnabled.value || !isChartZoomed.value || !event) {
        return false;
    }

    const now = Date.now();
    const pointerType = event.pointerType || 'mouse';
    const last = lastChartZoomTap.value;
    const maxDelay = pointerType === 'touch' ? 450 : 350;
    const maxDistance = pointerType === 'touch' ? 28 : 10;

    const distance = Math.hypot(event.clientX - last.x, event.clientY - last.y);

    const isDoubleTap =
        last.time > 0 &&
        last.pointerType === pointerType &&
        now - last.time <= maxDelay &&
        distance <= maxDistance;

    if (!isDoubleTap) {
        lastChartZoomTap.value = {
            time: now,
            x: event.clientX,
            y: event.clientY,
            pointerType,
        };

        return false;
    }

    lastChartZoomTap.value = {
        time: 0,
        x: 0,
        y: 0,
        pointerType: null,
    };

    suppressNextChartClick();
    cancelChartZoomSelection(event);
    clearChartZoomHover();

    void refreshSlicer({
        applyControlledZoom: false,
        publish: true,
    });

    return true;
}

function getChartZoomLocalIndex(svgX) {
    const drawingArea = slicerDrawingArea.value;
    const slotSize = activeChartZoomSlotSize.value;
    const visibleCount = activeChartZoomVisibleCount.value;

    if (
        !drawingArea ||
        visibleCount <= 0 ||
        !Number.isFinite(slotSize) ||
        slotSize <= 0
    ) {
        return null;
    }

    const rawIndex = Math.floor(
        (clampChartZoomX(svgX) - drawingArea.left) / slotSize,
    );

    return Math.max(0, Math.min(visibleCount - 1, rawIndex));
}

function getChartZoomStateFromSelection(left, right) {
    const localStart = getChartZoomLocalIndex(left);
    const localEnd = getChartZoomLocalIndex(right);

    if (localStart == null || localEnd == null) return null;

    const first = Math.min(localStart, localEnd);
    const last = Math.max(localStart, localEnd);

    if (last <= first) return null;

    return {
        start: Number(slicer.value.start) + first,
        end: Number(slicer.value.start) + last + 1,
    };
}

function commitChartZoom(state) {
    const applied = setZoomState(state);
    if (!applied) return null;

    emit('zoomStart', {
        index: applied.start,
        isZoom: applied.start !== 0,
    });

    emit('zoomEnd', {
        index: applied.end,
        isZoom: applied.end !== getSlicerMax(),
    });

    return applied;
}

function onChartZoomPointerDown(event) {
    if (!isChartZoomEnabled.value || isAnnotator.value) return;
    if (event.button !== undefined && event.button !== 0) return;

    if (
        chartZoomPointerId.value != null &&
        event.pointerId !== chartZoomPointerId.value
    ) {
        return;
    }

    const drawingArea = slicerDrawingArea.value;
    const point = clientToSvgCoords(event);

    if (!drawingArea || !point) return;

    if (
        point.x < drawingArea.left ||
        point.x > drawingArea.right ||
        point.y < drawingArea.top ||
        point.y > drawingArea.bottom
    ) {
        return;
    }

    if (activeChartZoomVisibleCount.value <= 1) return;

    isChartZoomPointerFocused.value = true;
    svgRef.value?.focus?.({ preventScroll: true });
    clearChartZoomHover();

    const x = clampChartZoomX(point.x);

    chartZoomPointerId.value = event.pointerId;
    isChartZoomSelecting.value = true;
    chartZoomStartX.value = x;
    chartZoomCurrentX.value = x;
}

function onChartZoomPointerMove(event) {
    if (!isChartZoomEnabled.value || !isChartZoomSelecting.value) {
        return;
    }

    if (
        chartZoomPointerId.value != null &&
        event.pointerId !== chartZoomPointerId.value
    ) {
        return;
    }

    const point = clientToSvgCoords(event);
    if (!point) return;

    chartZoomCurrentX.value = clampChartZoomX(point.x);
    clearChartZoomHover();

    if (
        chartZoomStartX.value != null &&
        Math.abs(chartZoomCurrentX.value - chartZoomStartX.value) >= 2 &&
        !svgRef.value?.hasPointerCapture?.(event.pointerId)
    ) {
        svgRef.value?.setPointerCapture?.(event.pointerId);
    }
}

function onChartZoomPointerUp(event) {
    if (!isChartZoomEnabled.value || !isChartZoomSelecting.value) {
        return;
    }

    if (
        chartZoomPointerId.value != null &&
        event.pointerId !== chartZoomPointerId.value
    ) {
        return;
    }

    const point = clientToSvgCoords(event);

    if (point) {
        chartZoomCurrentX.value = clampChartZoomX(point.x);
    }

    const startX = chartZoomStartX.value;
    const endX = chartZoomCurrentX.value;
    const drawingArea = slicerDrawingArea.value;

    const selectionWidth =
        startX == null || endX == null ? 0 : Math.abs(endX - startX);

    const minimumSelectionWidth = Math.max(
        4,
        Number(drawingArea?.width ?? 0) * 0.01,
    );

    if (selectionWidth < minimumSelectionWidth) {
        if (resetChartZoomFromDoubleTap(event)) return;

        cancelChartZoomSelection(event);
        return;
    }

    const left = Math.min(startX, endX);
    const right = Math.max(startX, endX);

    const nextZoomState = getChartZoomStateFromSelection(left, right);

    if (!nextZoomState) {
        cancelChartZoomSelection(event);
        return;
    }

    cancelChartZoomSelection(event);

    const applied = commitChartZoom(nextZoomState);

    if (applied) {
        lastChartZoomTap.value = {
            time: 0,
            x: 0,
            y: 0,
            pointerType: null,
        };

        clearChartZoomHover();
        suppressNextChartClick();
    }
}

const slicerMinimapLeftInsetRatio = computed(() => {
    const drawingArea = slicerDrawingArea.value;
    const svgWidth = defaultSizes.value.width;

    if (!drawingArea || svgWidth <= 0 || !FINAL_CONFIG.value.zoomXyAutoFit)
        return null;
    return drawingArea.left / svgWidth;
});

const slicerMinimapRightInsetRatio = computed(() => {
    const drawingArea = slicerDrawingArea.value;
    const svgWidth = defaultSizes.value.width;

    if (!drawingArea || svgWidth <= 0 || !FINAL_CONFIG.value.zoomXyAutoFit)
        return null;
    return (svgWidth - drawingArea.right) / svgWidth;
});

const allMinimaps = computed(() =>
    xyChart.value?.legend.map((ds) => ({
        ...ds,
        isVisible: !segregated.value.includes(ds.id),
        type: xyChartKind.value,
        series: ds.absoluteValues,
    })),
);

const timeLabels = ref([]);
const timeLabelsAreReady = ref(false);

let timeLabelsRequestId = 0;
watchEffect(() => {
    const requestId = ++timeLabelsRequestId;

    (async () => {
        const labels = await useTimeLabels({
            values: FINAL_CONFIG.value.xyPeriods,
            maxDatapoints: formattedDataset.value?.maxSeriesLength ?? 0,
            formatter: FINAL_CONFIG.value.datetimeFormatter,
            start: slicer.value.start,
            end: slicer.value.end,
        });

        if (requestId === timeLabelsRequestId) {
            timeLabels.value = labels;
            timeLabelsAreReady.value = true;
        }
    })();
});

const modulo = computed(() => {
    const m = FINAL_CONFIG.value.xyPeriodsModulo;
    if (!FINAL_CONFIG.value.xyPeriods.length) return m;
    return Math.min(
        m,
        [...new Set(timeLabels.value.map((t) => t.text))].length,
    );
});

const isFullscreen = ref(false);
function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
}

function toggleTooltip() {
    mutableConfig.value.showTooltip = !mutableConfig.value.showTooltip;
}

const isAnnotator = ref(false);
function toggleAnnotator() {
    isAnnotator.value = !isAnnotator.value;
}

const getImage = createChartImageGetter(
    quickChart,
    () => FINAL_CONFIG.value.title,
);

const WIDTH = computed(() => defaultSizes.value.width);
const HEIGHT = computed(() => defaultSizes.value.height);

useTimeLabelCollision({
    timeLabelsEls,
    timeLabels,
    slicer,
    configRef: FINAL_CONFIG,
    rotationPath: ['xyPeriodLabelsRotation'],
    autoRotatePath: ['xyPeriodLabelsAutoRotate', 'enable'],
    isAutoSize: false,
    rotation: FINAL_CONFIG.value.xyPeriodLabelsAutoRotate.angle,
    height: HEIGHT.value,
    width: WIDTH.value,
});

const svgBg = computed(() => FINAL_CONFIG.value.backgroundColor);

const svgLegendItems = computed(
    () => donut.value?.legend ?? xyChart.value?.legend ?? [],
);

const svgLegend = computed(() => {
    return {
        show: FINAL_CONFIG.value.showLegend,
        bold: false,
        backgroundColor: FINAL_CONFIG.value.backgroundColor,
        color: FINAL_CONFIG.value.color,
        fontSize: FINAL_CONFIG.value.legendFontSize,
        position: FINAL_CONFIG.value.legendPosition,
    };
});

const svgTitle = computed(() => ({
    text: FINAL_CONFIG.value.title,
    color: FINAL_CONFIG.value.color,
    fontSize: FINAL_CONFIG.value.titleFontSize,
    bold: FINAL_CONFIG.value.titleBold,
    textAlign: FINAL_CONFIG.value.titleTextAlign,
    subtitle: {
        text: '',
    },
}));

const { generateSvg, onGenerateImage } = useChartExport({
    svg: svgRef,
    title: svgTitle,
    legend: svgLegend,
    legendItems: svgLegendItems,
    backgroundColor: svgBg,
    getSvgCallback: () => FINAL_CONFIG.value.userOptionsCallbacks.svg,
    generateImage,
});

async function copyAlt() {
    emit('copyAlt', {
        config: FINAL_CONFIG.value,
        dataset: {
            line: line.value,
            bar: bar.value,
            donut: donut.value,
        },
    });
    if (!FINAL_CONFIG.value.userOptionsCallbacks.altCopy) {
        console.warn(
            'Vue Data UI - A callback must be set for `altCopy` in userOptions.',
        );
        return;
    }
    await Promise.resolve(
        FINAL_CONFIG.value.userOptionsCallbacks.altCopy({
            config: FINAL_CONFIG.value,
            dataset: {
                line: line.value,
                bar: bar.value,
                donut: donut.value,
            },
        }),
    );
}

function handleLegendKeydown(event, callback) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        callback();
    }
}

/***************************************************************************************************
 * a11y
 **************************************************************************************************/
const currentNavigationCount = computed(() =>
    chartType.value === detector.chartType.DONUT
        ? (donut.value?.chart?.length ?? 0)
        : (xyChart.value?.extremes?.maxSeries ?? 0),
);

function onSvgFocus() {
    activeTooltipIndex.value = null;
    isFocus.value = true;
}

function onSvgBlur() {
    isChartZoomPointerFocused.value = false;
    activeTooltipIndex.value = null;
    tooltipTriggerMode.value = 'pointer';
    isTooltip.value = false;
    selectedDatapoint.value = null;
    commonSelectedIndex.value = null;
    isFocus.value = false;
}

function onSvgKeydown(event) {
    if (!svgRef.value || isAnnotator.value) return;
    if (document.activeElement !== svgRef.value) return;

    isChartZoomPointerFocused.value = false;
    if (!currentNavigationCount.value) return;

    const isPreviousKey = event.key === 'ArrowLeft';
    const isNextKey = event.key === 'ArrowRight';
    const isActivationKey = event.key === 'Enter' || event.key === ' ';
    const isEscapeKey = event.key === 'Escape';

    if (!isPreviousKey && !isNextKey && !isActivationKey && !isEscapeKey)
        return;

    event.preventDefault();
    event.stopPropagation();

    if (isEscapeKey) {
        if (
            isChartZoomEnabled.value &&
            (isChartZoomed.value || isChartZoomSelecting.value)
        ) {
            cancelChartZoomSelection();
            clearChartZoomHover();

            void refreshSlicer({
                applyControlledZoom: false,
                publish: true,
            });

            return;
        }

        activeTooltipIndex.value = null;
        tooltipTriggerMode.value = 'pointer';
        isTooltip.value = false;
        selectedDatapoint.value = null;
        commonSelectedIndex.value = null;
        return;
    }

    if (isActivationKey) {
        if (activeTooltipIndex.value === null) return;

        if (chartType.value === detector.chartType.DONUT) {
            const arc = donut.value?.chart?.[activeTooltipIndex.value];
            if (!arc) return;
            donut.value.selectDatapoint({
                datapoint: arc,
                seriesIndex: activeTooltipIndex.value,
            });
            return;
        }

        xyChart.value?.selectDatapoint(activeTooltipIndex.value);

        return;
    }

    let nextIndex = activeTooltipIndex.value;
    const hoveredIndex = commonSelectedIndex.value;

    const hasValidActiveIndex =
        nextIndex !== null &&
        nextIndex >= 0 &&
        nextIndex < currentNavigationCount.value;

    const hasValidHoveredIndex =
        hoveredIndex !== null &&
        hoveredIndex >= 0 &&
        hoveredIndex < currentNavigationCount.value;

    if (!hasValidActiveIndex) {
        if (hasValidHoveredIndex) {
            nextIndex = isNextKey ? hoveredIndex + 1 : hoveredIndex - 1;

            if (nextIndex >= currentNavigationCount.value) {
                nextIndex = 0;
            }

            if (nextIndex < 0) {
                nextIndex = currentNavigationCount.value - 1;
            }
        } else if (isNextKey) {
            nextIndex = 0;
        } else {
            nextIndex = currentNavigationCount.value - 1;
        }
    } else if (isNextKey) {
        nextIndex += 1;
        if (nextIndex >= currentNavigationCount.value) {
            nextIndex = 0;
        }
    } else if (isPreviousKey) {
        nextIndex -= 1;
        if (nextIndex < 0) {
            nextIndex = currentNavigationCount.value - 1;
        }
    }

    if (chartType.value === detector.chartType.DONUT) {
        const arc = donut.value?.chart?.[nextIndex];
        if (!arc) return;

        setKeyboardTooltipPosition(nextIndex);
        donut.value.useTooltip({
            datapoint: arc,
            seriesIndex: nextIndex,
            triggerMode: 'keyboard',
        });
        return;
    }

    if (xyChart.value) {
        setKeyboardTooltipPosition(nextIndex);
        xyChart.value.useTooltip(nextIndex, 'keyboard');
    }
}

function setKeyboardTooltipPosition(index) {
    if (!Number.isFinite(index)) return;
    if (!svgRef.value) return;

    let svgX = 0;
    let svgY = 0;

    if (chartType.value === detector.chartType.DONUT) {
        const arc = donut.value?.chart?.[index];
        if (!arc) return;

        svgX = calcMarkerOffsetX(arc, true).x;
        svgY = calcMarkerOffsetY(arc);
    }

    if (xyChart.value) {
        const { drawingArea, slotSize } = xyChart.value;
        if (!drawingArea || !slotSize) return;
        svgX = drawingArea.left + slotSize * (index + 1) - slotSize / 2;
        svgY = drawingArea.top + drawingArea.height / 2;
    }

    const box = svgRef.value.getBoundingClientRect();

    tooltipA11yPosition.value = {
        x: box.left + (svgX / defaultSizes.value.width) * box.width,
        y: box.top + (svgY / defaultSizes.value.height) * box.height,
    };
}

const a11yTable = computed(() => {
    if (chartType.value === detector.chartType.DONUT) {
        const rows = (donut.value?.dataset ?? []).map((item) => {
            const percentage = donut.value?.total
                ? dataLabel({
                      v: (item.value / donut.value.total) * 100,
                      s: '%',
                      r: FINAL_CONFIG.value.dataLabelRoundingPercentage,
                  })
                : '0%';

            return [
                item.name,
                applyDataLabel(
                    FINAL_CONFIG.value.formatter,
                    item.value,
                    dataLabel({
                        p: FINAL_CONFIG.value.valuePrefix,
                        v: item.value,
                        s: FINAL_CONFIG.value.valueSuffix,
                        r: FINAL_CONFIG.value.dataLabelRoundingValue,
                    }),
                ),
                percentage,
            ];
        });

        return {
            headers: ['Series', 'Value', 'Percentage'],
            rows,
        };
    }

    if (
        chartType.value === detector.chartType.LINE ||
        chartType.value === detector.chartType.BAR
    ) {
        const series = xyChart.value?.dataset ?? [];
        const maxSeries = xyChart.value?.extremes?.maxSeries ?? 0;

        const headers = ['Index', ...series.map((serie) => serie.name)];

        const rows = Array.from({ length: maxSeries }, (_, i) => {
            const label =
                timeLabels.value?.[i]?.text ?? String(i + slicer.value.start);

            return [
                label,
                ...series.map((serie) => {
                    const rawValue = serie.values?.[i];
                    return applyDataLabel(
                        FINAL_CONFIG.value.formatter,
                        rawValue,
                        dataLabel({
                            p: FINAL_CONFIG.value.valuePrefix,
                            v: rawValue,
                            s: FINAL_CONFIG.value.valueSuffix,
                            r: FINAL_CONFIG.value.dataLabelRoundingValue,
                        }),
                    );
                }),
            ];
        });

        return { headers, rows };
    }

    return {
        headers: [],
        rows: [],
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
    copyAlt,
    resetZoom: () =>
        refreshSlicer({
            applyControlledZoom: false,
            publish: true,
        }),
    setZoomState,
});
watch(
    () => [
        defaultSizes.value.width,
        defaultSizes.value.height,
        FINAL_CONFIG.value,
        chartType.value,
        timeLabels.value,
        timeLabelsAreReady.value,
        scaleLabels.value,
        timeLabelsEls.value,
        props.dataset,
        segregated.value,
        responsiveSizeReady.value,
        FINAL_CONFIG.value.fontFamily,
    ],
    measureLabelLayout,
    { flush: 'post', deep: true },
);

const annotationViewport = computed(() => {
    const activeChart = xyChart.value;
    return createAnnotationViewport({
        enabled: FINAL_CONFIG.value.userOptionsAnnotator?.followZoom,
        area: slicerDrawingArea.value,
        range: slicer.value,
        ticks: activeChart?.yLabels ?? [],
    });
});
</script>

<template>
    <div
        v-if="isProcessable"
        :id="`${chartType}_${uid}`"
        ref="quickChart"
        :class="{
            'vue-data-ui-component': true,
            'vue-ui-quick-chart': true,
            'vue-data-ui-wrapper-fullscreen': isFullscreen,
        }"
        :style="`background:${FINAL_CONFIG.backgroundColor};color:${FINAL_CONFIG.color};font-family:${FINAL_CONFIG.fontFamily}; position: relative; ${FINAL_CONFIG.responsive ? 'height: 100%' : ''}`"
        @mouseenter="() => setUserOptionsVisibility(true)"
        @mouseleave="() => setUserOptionsVisibility(false)"
    >
        <div :id="`chart-instructions-${uid}`" class="sr-only">
            <p>{{ FINAL_CONFIG.a11y.translations.keyboardNavigation }}</p>
        </div>

        <A11yDataTable
            v-if="FINAL_CONFIG.a11y.includeTable && a11yTable.rows.length"
            :uid="uid"
            :head="a11yTable.headers"
            :body="a11yTable.rows"
            :notice="FINAL_CONFIG.a11y.translations.tableAvailable"
            :caption="FINAL_CONFIG.a11y.translations.tableCaption"
        />

        <PenAndPaper
            v-bind="getAnnotatorProps(FINAL_CONFIG.userOptionsAnnotator)"
            v-if="FINAL_CONFIG.userOptionsButtons.annotator"
            :svgRef="svgRef"
            :followZoom="FINAL_CONFIG.userOptionsAnnotator?.followZoom"
            :annotationViewport="annotationViewport"
            :backgroundColor="FINAL_CONFIG.backgroundColor"
            :color="FINAL_CONFIG.color"
            :active="isAnnotator"
            :isCursorPointer="isCursorPointer"
            :palette="FINAL_CONFIG.annotatorPalette"
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

        <div
            ref="noTitle"
            v-if="hasOptionsNoTitle"
            class="vue-data-ui-no-title-space"
            :style="`height:36px; width: 100%;background:transparent`"
        />

        <UserOptions
            ref="details"
            :key="`user_option_${step}`"
            v-if="
                FINAL_CONFIG.showUserOptions &&
                (keepUserOptionState ? true : userOptionsVisible)
            "
            :backgroundColor="FINAL_CONFIG.backgroundColor"
            :color="FINAL_CONFIG.color"
            :isPrinting="isPrinting"
            :isImaging="isImaging"
            :uid="uid"
            :hasTooltip="
                FINAL_CONFIG.userOptionsButtons.tooltip &&
                FINAL_CONFIG.showTooltip
            "
            :hasPdf="FINAL_CONFIG.userOptionsButtons.pdf"
            :hasImg="FINAL_CONFIG.userOptionsButtons.img"
            :hasSvg="FINAL_CONFIG.userOptionsButtons.svg"
            :hasFullscreen="FINAL_CONFIG.userOptionsButtons.fullscreen"
            :hasAltCopy="FINAL_CONFIG.userOptionsButtons.altCopy"
            :hasXls="false"
            :isTooltip="mutableConfig.showTooltip"
            :isFullscreen="isFullscreen"
            :titles="{ ...FINAL_CONFIG.userOptionsButtonTitles }"
            :chartElement="quickChart"
            :position="FINAL_CONFIG.userOptionsPosition"
            :hasAnnotator="FINAL_CONFIG.userOptionsButtons.annotator"
            :isAnnotation="isAnnotator"
            :callbacks="FINAL_CONFIG.userOptionsCallbacks"
            :printScale="FINAL_CONFIG.userOptionsPrint.scale"
            :isCursorPointer="isCursorPointer"
            @toggleFullscreen="toggleFullscreen"
            @generatePdf="generatePdf"
            @generateImage="onGenerateImage"
            @generateSvg="generateSvg"
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
            <template
                v-for="slotName in getUserOptionSlots(
                    $slots,
                    'menuIcon optionTooltip optionPdf optionImg optionSvg optionFullscreen optionAnnotator optionAltCopy custom-menu-before custom-menu-after',
                )"
                #[slotName]="slotProps"
            >
                <slot
                    :name="slotName"
                    v-bind="getUserOptionSlotProps(slotName, slotProps)"
                />
            </template>
        </UserOptions>

        <div
            ref="quickChartTitle"
            class="vue-ui-quick-chart-title"
            v-if="FINAL_CONFIG.title"
            :style="`background:transparent;color:${FINAL_CONFIG.color};font-size:${FINAL_CONFIG.titleFontSize}px;font-weight:${FINAL_CONFIG.titleBold ? 'bold' : 'normal'};text-align:${FINAL_CONFIG.titleTextAlign}`"
        >
            {{ FINAL_CONFIG.title }}
        </div>

        <div :id="`legend-top-${uid}`" />

        <div style="position: relative">
            <svg
                ref="svgRef"
                v-if="chartType"
                :xmlns="XMLNS"
                :aria-describedby="`chart-instructions-${uid}`"
                :viewBox="viewBox"
                :style="{
                    maxWidth: '100%',
                    visibility: labelLayoutReady ? 'visible' : 'hidden',
                    overflow: 'visible',
                    background: 'transparent',
                    color: FINAL_CONFIG.color,
                    cursor: !isChartZoomEnabled
                        ? undefined
                        : isChartZoomSelecting
                          ? 'col-resize'
                          : 'crosshair',
                    touchAction: isChartZoomEnabled ? 'pan-y' : undefined,
                    userSelect: isChartZoomEnabled ? 'none' : undefined,
                }"
                :class="{
                    'vue-data-ui-no-transition':
                        !transitionEnabled || labelLayoutSettling,
                    'vue-ui-quick-chart-zoom-pointer-focus':
                        isChartZoomEnabled && isChartZoomPointerFocused,
                }"
                tabindex="0"
                @focus="onSvgFocus"
                @blur="onSvgBlur"
                @keydown="onSvgKeydown"
                @pointerdown="onChartZoomPointerDown"
                @pointermove="onChartZoomPointerMove"
                @pointerup="onChartZoomPointerUp"
                @pointercancel="cancelChartZoomSelection"
                @click.capture="onChartZoomClickCapture"
            >
                <PackageVersion />

                <!-- BACKGROUND SLOT -->
                <foreignObject
                    v-if="$slots['chart-background']"
                    :x="xyChart?.drawingArea.left ?? 0"
                    :y="xyChart?.drawingArea.top ?? 0"
                    :width="xyChart?.drawingArea.width ?? defaultSizes.width"
                    :height="xyChart?.drawingArea.height ?? defaultSizes.height"
                    style="pointer-events: none"
                >
                    <slot name="chart-background" />
                </foreignObject>

                <defs>
                    <filter
                        :id="`blur_${uid}`"
                        x="-50%"
                        y="-50%"
                        width="200%"
                        height="200%"
                    >
                        <feGaussianBlur
                            in="SourceGraphic"
                            :stdDeviation="2"
                            :id="`blur_std_${uid}`"
                        />
                        <feColorMatrix type="saturate" values="0" />
                    </filter>

                    <filter
                        :id="`shadow_${uid}`"
                        color-interpolation-filters="sRGB"
                    >
                        <feDropShadow
                            dx="0"
                            dy="0"
                            stdDeviation="10"
                            flood-opacity="0.5"
                            :flood-color="FINAL_CONFIG.donutShadowColor"
                        />
                    </filter>
                </defs>

                <template v-if="chartType === detector.chartType.DONUT">
                    <g
                        class="donut-label-connectors"
                        v-if="FINAL_CONFIG.showDataLabels"
                    >
                        <template v-for="(arc, i) in donut.chart">
                            <path
                                data-cy="datapoint-donut-markers"
                                v-if="donut.isArcBigEnough(arc)"
                                :d="
                                    calcNutArrowPath(
                                        arc,
                                        {
                                            x: defaultSizes.width / 2,
                                            y: defaultSizes.height / 2,
                                        },
                                        16,
                                        16,
                                        false,
                                        false,
                                        defaultSizes.height *
                                            optimalDonutThickness,
                                        12,
                                        FINAL_CONFIG.donutCurvedMarkers,
                                    )
                                "
                                :stroke="arc.color"
                                :stroke-width="
                                    FINAL_CONFIG.donutLabelMarkerStrokeWidth
                                "
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                fill="none"
                                :filter="getBlurFilter(arc.id)"
                            />
                        </template>
                    </g>

                    <circle
                        :cx="donut.cx"
                        :cy="donut.cy"
                        :r="donut.radius"
                        :fill="FINAL_CONFIG.backgroundColor"
                        :filter="
                            FINAL_CONFIG.donutUseShadow
                                ? `url(#shadow_${uid})`
                                : ''
                        "
                    />

                    <g class="donut">
                        <path
                            data-cy="datapoint-donut-arc"
                            v-for="(arc, i) in donut.chart"
                            :d="arc.arcSlice"
                            :fill="arc.color"
                            :stroke="
                                FINAL_CONFIG.donutStroke ||
                                FINAL_CONFIG.backgroundColor
                            "
                            :stroke-width="FINAL_CONFIG.donutStrokeWidth"
                            :filter="getBlurFilter(arc.id)"
                        />
                        <path
                            data-cy="tooltip-trap-donut"
                            v-for="(arc, i) in donut.chart"
                            :d="arc.arcSlice"
                            fill="transparent"
                            @mouseenter="
                                donut.useTooltip({
                                    datapoint: arc,
                                    seriesIndex: i,
                                    triggerMode: 'pointer',
                                })
                            "
                            @mouseout="
                                donut.killTooltip({
                                    datapoint: arc,
                                    seriesIndex: i,
                                })
                            "
                            @click="
                                donut.selectDatapoint({
                                    datapoint: arc,
                                    seriesIndex: i,
                                })
                            "
                        />
                    </g>
                    <g class="donut-labels" v-if="FINAL_CONFIG.showDataLabels">
                        <template v-for="(arc, i) in donut.chart">
                            <circle
                                data-cy="datapoint-donut-marker-circle"
                                v-if="donut.isArcBigEnough(arc)"
                                :cx="calcMarkerOffsetX(arc).x"
                                :cy="calcMarkerOffsetY(arc) - 3.7"
                                :fill="arc.color"
                                :stroke="FINAL_CONFIG.backgroundColor"
                                :stroke-width="1"
                                :r="3"
                                :filter="getBlurFilter(arc.id)"
                            />
                            <text
                                data-cy="datapoint-donut-label-value"
                                v-if="donut.isArcBigEnough(arc)"
                                :text-anchor="
                                    calcMarkerOffsetX(arc, true, 20).anchor
                                "
                                :x="calcMarkerOffsetX(arc, true).x"
                                :y="calcMarkerOffsetY(arc)"
                                :fill="FINAL_CONFIG.color"
                                :font-size="FINAL_CONFIG.dataLabelFontSize"
                                :filter="getBlurFilter(arc.id)"
                            >
                                {{
                                    donut.displayArcPercentage(arc, donut.chart)
                                }}
                                ({{
                                    applyDataLabel(
                                        FINAL_CONFIG.formatter,
                                        arc.value,
                                        dataLabel({
                                            p: FINAL_CONFIG.valuePrefix,
                                            v: arc.value,
                                            s: FINAL_CONFIG.valueSuffix,
                                            r: FINAL_CONFIG.dataLabelRoundingValue,
                                        }),
                                        { datapoint: arc, seriesIndex: i },
                                    )
                                }})
                            </text>
                            <text
                                data-cy="datapoint-donut-label-name"
                                v-if="donut.isArcBigEnough(arc, true, 20)"
                                :text-anchor="calcMarkerOffsetX(arc).anchor"
                                :x="calcMarkerOffsetX(arc, true).x"
                                :y="
                                    calcMarkerOffsetY(arc) +
                                    FINAL_CONFIG.dataLabelFontSize
                                "
                                :fill="FINAL_CONFIG.color"
                                :font-size="FINAL_CONFIG.dataLabelFontSize"
                                :filter="getBlurFilter(arc.id)"
                            >
                                {{ arc.name }}
                            </text>
                        </template>
                    </g>
                    <g class="donut-hollow" v-if="FINAL_CONFIG.donutShowTotal">
                        <text
                            data-cy="donut-hollow-total-label"
                            text-anchor="middle"
                            :x="donut.drawingArea.centerX"
                            :y="
                                donut.drawingArea.centerY -
                                FINAL_CONFIG.donutTotalLabelFontSize / 2
                            "
                            :font-size="FINAL_CONFIG.donutTotalLabelFontSize"
                            :fill="FINAL_CONFIG.color"
                        >
                            {{ FINAL_CONFIG.donutTotalLabelText }}
                        </text>
                        <text
                            data-cy="donut-hollow-total-value"
                            text-anchor="middle"
                            :x="donut.drawingArea.centerX"
                            :y="
                                donut.drawingArea.centerY +
                                FINAL_CONFIG.donutTotalLabelFontSize
                            "
                            :font-size="FINAL_CONFIG.donutTotalLabelFontSize"
                            :fill="FINAL_CONFIG.color"
                        >
                            {{
                                dataLabel({
                                    p: FINAL_CONFIG.valuePrefix,
                                    v: donut.total,
                                    s: FINAL_CONFIG.valueSuffix,
                                    r: FINAL_CONFIG.dataLabelRoundingValue,
                                })
                            }}
                        </text>
                    </g>
                </template>

                <template v-if="xyChart">
                    <g class="line-grid" v-if="FINAL_CONFIG.xyShowGrid">
                        <template v-for="yGridLine in xyChart.yLabels">
                            <line
                                :data-cy="
                                    isDev
                                        ? 'grid-horizontal-line-' + xyChartKind
                                        : undefined
                                "
                                v-if="yGridLine.y <= xyChart.drawingArea.bottom"
                                :x1="xyChart.drawingArea.left"
                                :x2="xyChart.drawingArea.right"
                                :y1="yGridLine.y"
                                :y2="yGridLine.y"
                                :stroke="FINAL_CONFIG.xyGridStroke"
                                :stroke-width="FINAL_CONFIG.xyGridStrokeWidth"
                                stroke-linecap="round"
                            />
                        </template>
                        <template
                            v-if="
                                chartType === detector.chartType.LINE ||
                                segregated.length < xyChart.legend.length
                            "
                        >
                            <line
                                :data-cy="
                                    isDev
                                        ? 'grid-vertical-line-' + xyChartKind
                                        : undefined
                                "
                                v-for="(_, i) in xyChart.extremes.maxSeries + 1"
                                :x1="
                                    xyChart.drawingArea.left +
                                    xyChart.slotSize * i
                                "
                                :x2="
                                    xyChart.drawingArea.left +
                                    xyChart.slotSize * i
                                "
                                :y1="xyChart.drawingArea.top"
                                :y2="xyChart.drawingArea.bottom"
                                :stroke="FINAL_CONFIG.xyGridStroke"
                                :stroke-width="FINAL_CONFIG.xyGridStrokeWidth"
                                stroke-linecap="round"
                            />
                        </template>
                    </g>
                    <g class="line-axis" v-if="FINAL_CONFIG.xyShowAxis">
                        <line
                            :data-cy="
                                isDev ? xyChartKind + '-y-axis' : undefined
                            "
                            :x1="xyChart.drawingArea.left"
                            :x2="xyChart.drawingArea.left"
                            :y1="xyChart.drawingArea.top"
                            :y2="xyChart.drawingArea.bottom"
                            :stroke="FINAL_CONFIG.xyAxisStroke"
                            :stroke-width="FINAL_CONFIG.xyAxisStrokeWidth"
                            stroke-linecap="round"
                        />
                        <line
                            :data-cy="
                                isDev ? xyChartKind + '-zero-axis' : undefined
                            "
                            :x1="xyChart.drawingArea.left"
                            :x2="xyChart.drawingArea.right"
                            :y1="
                                isNaN(xyChart.absoluteZero)
                                    ? xyChart.drawingArea.bottom
                                    : xyChart.absoluteZero
                            "
                            :y2="
                                isNaN(xyChart.absoluteZero)
                                    ? xyChart.drawingArea.bottom
                                    : xyChart.absoluteZero
                            "
                            :stroke="FINAL_CONFIG.xyAxisStroke"
                            :stroke-width="FINAL_CONFIG.xyAxisStrokeWidth"
                            stroke-linecap="round"
                        />
                    </g>
                    <g
                        class="yLabels"
                        v-if="FINAL_CONFIG.xyShowScale"
                        ref="scaleLabels"
                    >
                        <template
                            v-for="(label, i) in xyChart.yLabels"
                            :key="`sl_${i}`"
                        >
                            <path
                                :data-cy="
                                    isDev
                                        ? 'scale-' + xyChartKind + '-tick'
                                        : undefined
                                "
                                :class="{
                                    'vue-data-ui-transition':
                                        transitionEnabled &&
                                        !labelLayoutSettling,
                                }"
                                :d="`M${label.x + 4},${label.y} ${xyChart.drawingArea.left},${label.y}`"
                                v-if="label.y <= xyChart.drawingArea.bottom"
                                :stroke="FINAL_CONFIG.xyAxisStroke"
                                :stroke-width="FINAL_CONFIG.xyAxisStrokeWidth"
                                stroke-linecap="round"
                            />
                            <text
                                :class="{
                                    'vue-data-ui-transition':
                                        transitionEnabled &&
                                        !labelLayoutSettling,
                                }"
                                :data-cy="
                                    isDev
                                        ? 'scale-' + xyChartKind + '-label'
                                        : undefined
                                "
                                v-if="label.y <= xyChart.drawingArea.bottom"
                                :transform="`translate(${label.x}, ${label.y + FINAL_CONFIG.xyLabelsYFontSize / 3})`"
                                text-anchor="end"
                                :font-size="FINAL_CONFIG.xyLabelsYFontSize"
                                :fill="FINAL_CONFIG.color"
                            >
                                {{
                                    applyDataLabel(
                                        FINAL_CONFIG.formatter,
                                        label.value,
                                        dataLabel({
                                            p: FINAL_CONFIG.valuePrefix,
                                            v: label.value,
                                            s: FINAL_CONFIG.valueSuffix,
                                            r: FINAL_CONFIG.dataLabelRoundingValue,
                                        }),
                                        { datapoint: label, seriesIndex: i },
                                    )
                                }}
                            </text>
                        </template>
                    </g>

                    <!-- TIME LABELS -->
                    <g
                        class="periodLabels"
                        v-if="
                            FINAL_CONFIG.xyShowScale &&
                            FINAL_CONFIG.xyPeriods.length
                        "
                    >
                        <template v-for="(_, i) in xyPeriodTicks">
                            <line
                                v-if="
                                    chartType === detector.chartType.BAR ||
                                    !FINAL_CONFIG.xyPeriodsShowOnlyAtModulo ||
                                    (FINAL_CONFIG.xyPeriodsShowOnlyAtModulo &&
                                        i %
                                            Math.floor(
                                                (slicer.end - slicer.start) /
                                                    modulo,
                                            ) ===
                                            0) ||
                                    slicer.end - slicer.start <= modulo
                                "
                                data-cy="period-tick"
                                :x1="
                                    xyChart.drawingArea.left +
                                    xyChart.slotSize * (i + 1) -
                                    xyChart.slotSize / 2
                                "
                                :x2="
                                    xyChart.drawingArea.left +
                                    xyChart.slotSize * (i + 1) -
                                    xyChart.slotSize / 2
                                "
                                :y1="xyChart.drawingArea.bottom"
                                :y2="xyChart.drawingArea.bottom + 4"
                                :stroke="FINAL_CONFIG.xyAxisStroke"
                                :stroke-width="FINAL_CONFIG.xyAxisStrokeWidth"
                                stroke-linecap="round"
                            />
                        </template>
                        <g ref="timeLabelsEls">
                            <template
                                v-for="(period, i) in timeLabels.map(
                                    (l) => l.text,
                                )"
                            >
                                <g
                                    v-if="
                                        !FINAL_CONFIG.xyPeriodsShowOnlyAtModulo ||
                                        (FINAL_CONFIG.xyPeriodsShowOnlyAtModulo &&
                                            i %
                                                Math.floor(
                                                    (slicer.end -
                                                        slicer.start) /
                                                        modulo,
                                                ) ===
                                                0) ||
                                        slicer.end - slicer.start <= modulo
                                    "
                                >
                                    <text
                                        class="vue-data-ui-time-label"
                                        v-if="!String(period).includes('\n')"
                                        data-cy="period-label"
                                        :font-size="
                                            FINAL_CONFIG.xyLabelsXFontSize
                                        "
                                        :text-anchor="
                                            FINAL_CONFIG.xyPeriodLabelsRotation >
                                            0
                                                ? 'start'
                                                : FINAL_CONFIG.xyPeriodLabelsRotation <
                                                    0
                                                  ? 'end'
                                                  : 'middle'
                                        "
                                        :fill="FINAL_CONFIG.color"
                                        :transform="`translate(${xyChart.drawingArea.left + xyChart.slotSize * (i + 1) - xyChart.slotSize / 2}, ${xyChart.drawingArea.bottom + FINAL_CONFIG.xyLabelsXFontSize + 6}), rotate(${FINAL_CONFIG.xyPeriodLabelsRotation})`"
                                    >
                                        {{ period }}
                                    </text>
                                    <text
                                        v-else
                                        class="vue-data-ui-time-label"
                                        data-cy="period-label"
                                        :font-size="
                                            FINAL_CONFIG.xyLabelsXFontSize
                                        "
                                        :text-anchor="
                                            FINAL_CONFIG.xyPeriodLabelsRotation >
                                            0
                                                ? 'start'
                                                : FINAL_CONFIG.xyPeriodLabelsRotation <
                                                    0
                                                  ? 'end'
                                                  : 'middle'
                                        "
                                        :fill="FINAL_CONFIG.color"
                                        :transform="`translate(${xyChart.drawingArea.left + xyChart.slotSize * (i + 1) - xyChart.slotSize / 2}, ${xyChart.drawingArea.bottom + FINAL_CONFIG.xyLabelsXFontSize + 6}), rotate(${FINAL_CONFIG.xyPeriodLabelsRotation})`"
                                        v-html="
                                            createTSpansFromLineBreaksOnX({
                                                content: String(period),
                                                fontSize:
                                                    FINAL_CONFIG.xyLabelsXFontSize,
                                                fill: FINAL_CONFIG.color,
                                                x: 0,
                                                y: 0,
                                            })
                                        "
                                    />
                                </g>
                            </template>
                        </g>
                    </g>
                </template>

                <template v-if="chartType === detector.chartType.LINE">
                    <g class="plots">
                        <template
                            v-for="(ds, i) in line.dataset"
                            :key="`serie_${ds.id}`"
                        >
                            <g class="line-plot-series">
                                <path
                                    data-cy="datapoint-line-wrapper"
                                    :d="getLinePath(ds)"
                                    :stroke="FINAL_CONFIG.backgroundColor"
                                    :stroke-width="
                                        FINAL_CONFIG.lineStrokeWidth + 1
                                    "
                                    stroke-linecap="round"
                                    fill="none"
                                    :class="{
                                        'vue-data-ui-transition':
                                            transitionEnabled &&
                                            !labelLayoutSettling,
                                    }"
                                />
                                <path
                                    data-cy="datapoint-line"
                                    :d="getLinePath(ds)"
                                    :stroke="ds.color"
                                    :stroke-width="FINAL_CONFIG.lineStrokeWidth"
                                    stroke-linecap="round"
                                    fill="none"
                                    :class="{
                                        'vue-data-ui-transition':
                                            transitionEnabled &&
                                            !labelLayoutSettling,
                                    }"
                                    :style="{
                                        transition:
                                            loading || !FINAL_CONFIG.lineSmooth
                                                ? undefined
                                                : 'all 0.2s ease-in-out',
                                    }"
                                ></path>
                                <template
                                    v-for="(plot, j) in ds.coordinates"
                                    :key="`dp_${ds.id}_${j + slicer.start}`"
                                >
                                    <circle
                                        data-cy="datapoint-plot"
                                        :cx="plot.x"
                                        :cy="checkNaN(plot.y)"
                                        :r="3"
                                        :fill="ds.color"
                                        :stroke="FINAL_CONFIG.backgroundColor"
                                        stroke-width="0.5"
                                        :class="{
                                            'vue-ui-quick-chart-plot': true,
                                            'vue-data-ui-transition':
                                                transitionEnabled &&
                                                !labelLayoutSettling,
                                        }"
                                    />
                                </template>
                            </g>
                        </template>
                    </g>
                </template>

                <template v-if="chartType === detector.chartType.BAR">
                    <g class="plots">
                        <template v-for="(ds, i) in bar.dataset">
                            <rect
                                data-cy="datapoint-bar"
                                v-for="(plot, j) in ds.coordinates"
                                :x="plot.x"
                                :width="plot.width <= 0 ? 0.00001 : plot.width"
                                :height="
                                    checkNaN(
                                        plot.height <= 0
                                            ? 0.00001
                                            : plot.height,
                                    )
                                "
                                :y="checkNaN(plot.y)"
                                :fill="ds.color"
                                :stroke="FINAL_CONFIG.backgroundColor"
                                :stroke-width="FINAL_CONFIG.barStrokeWidth"
                                stroke-linecap="round"
                                :class="{
                                    'vue-data-ui-transition':
                                        transitionEnabled &&
                                        !labelLayoutSettling,
                                }"
                            />
                        </template>
                    </g>
                </template>

                <template v-if="xyChart">
                    <g class="dataLabels" v-if="FINAL_CONFIG.showDataLabels">
                        <template
                            v-for="(ds, i) in xyChart.dataset"
                            :key="`ds_${ds.id}`"
                        >
                            <text
                                :class="{
                                    'vue-ui-quick-chart-label':
                                        chartType === detector.chartType.LINE,
                                    'vue-data-ui-transition':
                                        transitionEnabled &&
                                        !labelLayoutSettling,
                                }"
                                data-cy="datapoint-label"
                                v-for="(plot, j) in ds.coordinates"
                                :key="
                                    chartType === detector.chartType.LINE
                                        ? `plot_${ds.id}_${j + slicer.start}`
                                        : `plot_${j + slicer.start}`
                                "
                                text-anchor="middle"
                                :font-size="FINAL_CONFIG.dataLabelFontSize"
                                :fill="ds.color"
                                :transform="`translate(${chartType === detector.chartType.BAR ? plot.x + plot.width / 2 : plot.x}, ${checkNaN(plot.y) - FINAL_CONFIG.dataLabelFontSize / 2})`"
                            >
                                {{
                                    applyDataLabel(
                                        FINAL_CONFIG.formatter,
                                        checkNaN(plot.value),
                                        dataLabel({
                                            p: FINAL_CONFIG.valuePrefix,
                                            v: checkNaN(plot.value),
                                            s: FINAL_CONFIG.valueSuffix,
                                            r: FINAL_CONFIG.dataLabelRoundingValue,
                                        }),
                                        { datapoint: plot, seriesIndex: j },
                                    )
                                }}
                            </text>
                        </template>
                    </g>
                    <g
                        class="tooltip-traps"
                        v-if="
                            userHovers &&
                            (chartType === detector.chartType.LINE ||
                                segregated.length < xyChart.legend.length)
                        "
                    >
                        <rect
                            :data-cy="
                                isDev
                                    ? 'tooltip-trap-' + xyChartKind
                                    : undefined
                            "
                            v-for="(_, i) in xyChart.extremes.maxSeries"
                            :x="xyChart.drawingArea.left + i * xyChart.slotSize"
                            :y="xyChart.drawingArea.top"
                            :height="
                                xyChart.drawingArea.height <= 0
                                    ? 0.00001
                                    : xyChart.drawingArea.height
                            "
                            :width="
                                xyChart.slotSize <= 0
                                    ? 0.00001
                                    : xyChart.slotSize
                            "
                            :fill="
                                [
                                    selectedDatapoint,
                                    commonSelectedIndex,
                                ].includes(i)
                                    ? FINAL_CONFIG.xyHighlighterColor
                                    : 'transparent'
                            "
                            :style="`opacity:${FINAL_CONFIG.xyHighlighterOpacity}`"
                            @mouseenter="xyChart.useTooltip(i, 'pointer')"
                            @mouseleave="xyChart.killTooltip(i)"
                            @click="xyChart.selectDatapoint(i)"
                        />
                    </g>
                </template>

                <template
                    v-if="
                        [
                            detector.chartType.LINE,
                            detector.chartType.BAR,
                        ].includes(chartType)
                    "
                >
                    <g class="axis-labels">
                        <g v-if="FINAL_CONFIG.xAxisLabel">
                            <text
                                :font-size="FINAL_CONFIG.axisLabelsFontSize"
                                :fill="FINAL_CONFIG.color"
                                text-anchor="middle"
                                :x="
                                    xyChart.drawingArea.left +
                                    xyChart.drawingArea.width / 2
                                "
                                :y="
                                    defaultSizes.height -
                                    FINAL_CONFIG.axisLabelsFontSize / 3
                                "
                            >
                                {{ FINAL_CONFIG.xAxisLabel }}
                            </text>
                        </g>
                        <g v-if="FINAL_CONFIG.yAxisLabel">
                            <text
                                :font-size="FINAL_CONFIG.axisLabelsFontSize"
                                :fill="FINAL_CONFIG.color"
                                :transform="`translate(${FINAL_CONFIG.axisLabelsFontSize}, ${xyChart.drawingArea.top + xyChart.drawingArea.height / 2}) rotate(-90)`"
                                text-anchor="middle"
                            >
                                {{ FINAL_CONFIG.yAxisLabel }}
                            </text>
                        </g>
                    </g>
                </template>

                <!-- ON-CHART ZOOM SELECTION -->
                <rect
                    v-if="chartZoomSelectionRect"
                    data-cy="quick-chart-zoom-selection"
                    :x="chartZoomSelectionRect.x"
                    :y="chartZoomSelectionRect.y"
                    :width="chartZoomSelectionRect.width"
                    :height="chartZoomSelectionRect.height"
                    :fill="dragToZoomConfig.selection.fill"
                    :fill-opacity="dragToZoomConfig.selection.fillOpacity"
                    :stroke="dragToZoomConfig.selection.stroke"
                    :stroke-opacity="dragToZoomConfig.selection.strokeOpacity"
                    :stroke-width="dragToZoomConfig.selection.strokeWidth"
                    :stroke-dasharray="
                        dragToZoomConfig.selection.strokeDasharray
                    "
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    pointer-events="none"
                />
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
                v-bind="{ isPrinting: isPrinting || isImaging }"
            />
        </div>

        <div
            v-if="isZoomUiVisible"
            :key="`slicer_${slicerStep}`"
            ref="quickChartSlicer"
        >
            <SlicerPreview
                ref="slicerComponent"
                :key="`slicer_${slicerStep}`"
                :timeLabels="timeLabels"
                :background="FINAL_CONFIG.zoomColor"
                :borderColor="FINAL_CONFIG.backgroundColor"
                :fontSize="FINAL_CONFIG.zoomFontSize"
                :useResetSlot="FINAL_CONFIG.zoomUseResetSlot"
                :textColor="FINAL_CONFIG.color"
                :inputColor="FINAL_CONFIG.zoomColor"
                :selectColor="FINAL_CONFIG.zoomHighlightColor"
                :max="formattedDataset.maxSeriesLength"
                :min="0"
                :valueStart="slicer.start"
                :valueEnd="slicer.end"
                :smoothMinimap="FINAL_CONFIG.zoomMinimap.smooth"
                :minimapSelectedColor="FINAL_CONFIG.zoomMinimap.selectedColor"
                :minimapSelectedColorOpacity="
                    FINAL_CONFIG.zoomMinimap.selectedColorOpacity
                "
                :minimapSelectionRadius="
                    FINAL_CONFIG.zoomMinimap.selectionRadius
                "
                :minimapLineColor="FINAL_CONFIG.zoomMinimap.lineColor"
                :minimap="minimap"
                :minimapIndicatorColor="FINAL_CONFIG.zoomMinimap.indicatorColor"
                :verticalHandles="FINAL_CONFIG.zoomMinimap.verticalHandles"
                :minimapSelectedIndex="commonSelectedIndex"
                @update:start="onSlicerStart"
                @update:end="onSlicerEnd"
                :refreshStartPoint="
                    FINAL_CONFIG.zoomStartIndex !== null
                        ? FINAL_CONFIG.zoomStartIndex
                        : 0
                "
                :refreshEndPoint="
                    FINAL_CONFIG.zoomEndIndex !== null
                        ? FINAL_CONFIG.zoomEndIndex + 1
                        : formattedDataset.maxSeriesLength
                "
                :enableRangeHandles="FINAL_CONFIG.zoomEnableRangeHandles"
                :enableSelectionDrag="FINAL_CONFIG.zoomEnableSelectionDrag"
                :minimapCompact="FINAL_CONFIG.zoomMinimap.compact"
                :minimapMerged="FINAL_CONFIG.zoomMinimap.merged"
                :allMinimaps="allMinimaps"
                :minimapFrameColor="FINAL_CONFIG.zoomMinimap.frameColor"
                :additionalMinimapHeight="
                    FINAL_CONFIG.zoomMinimap.additionalHeight
                "
                :handleType="FINAL_CONFIG.zoomMinimap.handleType"
                :handleWidth="FINAL_CONFIG.zoomMinimap.handleWidth"
                :handleBorderWidth="FINAL_CONFIG.zoomMinimap.handleBorderWidth"
                :handleIconColor="FINAL_CONFIG.zoomMinimap.handleIconColor"
                :handleBorderColor="FINAL_CONFIG.zoomMinimap.handleBorderColor"
                :handleFill="FINAL_CONFIG.zoomMinimap.handleFill"
                :focusOnDrag="FINAL_CONFIG.zoomFocusOnDrag"
                :focusRangeRatio="FINAL_CONFIG.zoomFocusRangeRatio"
                :maxWidth="FINAL_CONFIG.zoomMaxWidth"
                :minimapLeftInsetRatio="slicerMinimapLeftInsetRatio"
                :minimapRightInsetRatio="slicerMinimapRightInsetRatio"
                @reset="
                    () =>
                        refreshSlicer({
                            applyControlledZoom: false,
                            publish: true,
                        })
                "
                @trapMouse="setCommonSelectedIndex"
            >
                <template #reset-action="{ reset }">
                    <slot name="reset-action" v-bind="{ reset }" />
                </template>
            </SlicerPreview>
        </div>

        <div :id="`legend-bottom-${uid}`" />

        <!-- LEGEND -->
        <Teleport
            v-if="readyTeleport && FINAL_CONFIG.showLegend"
            :to="
                FINAL_CONFIG.legendPosition === 'top'
                    ? `#legend-top-${uid}`
                    : `#legend-bottom-${uid}`
            "
        >
            <div
                v-if="FINAL_CONFIG.showLegend"
                ref="quickChartLegend"
                class="vue-ui-quick-chart-legend"
                :style="`background:transparent;color:${FINAL_CONFIG.color}`"
            >
                <BaseLegendToggle
                    v-if="
                        (donut?.legend?.length > 2 ||
                            line?.legend?.length > 2 ||
                            bar?.legend?.length > 2) &&
                        FINAL_CONFIG.showLegendSelectAllToggle &&
                        !loading
                    "
                    :backgroundColor="
                        FINAL_CONFIG.legendSelectAllToggleBackgroundColor
                    "
                    :color="FINAL_CONFIG.legendSelectAllToggleColor"
                    :fontSize="FINAL_CONFIG.legendFontSize"
                    :checked="segregated.length > 0"
                    :isCursorPointer="isCursorPointer"
                    @toggle="toggleLegend"
                />

                <template v-if="chartType === detector.chartType.DONUT">
                    <div
                        class="vue-ui-quick-chart-legend-item"
                        v-for="(legendItem, i) in donut.legend"
                        @click="segregateDonut(legendItem, donut.dataset)"
                        :style="`cursor: ${donut.legend.length > 1 && isCursorPointer ? 'pointer' : 'default'}; opacity:${segregated.includes(legendItem.id) ? '0.5' : '1'}`"
                        role="button"
                        tabindex="0"
                        @keydown="
                            handleLegendKeydown($event, () => {
                                segregateDonut(legendItem, donut.dataset);
                            })
                        "
                    >
                        <template v-if="FINAL_CONFIG.useCustomLegend">
                            <slot
                                name="legend"
                                v-bind="{
                                    legend: {
                                        ...legendItem,
                                        isSegregated: segregated.includes(
                                            legendItem.id,
                                        ),
                                        segregate: () => {
                                            segregateDonut(
                                                legendItem,
                                                donut.dataset,
                                            );
                                        },
                                    },
                                }"
                            />
                        </template>

                        <template v-else>
                            <BaseIcon
                                :name="FINAL_CONFIG.legendIcon"
                                :stroke="legendItem.color"
                                :size="FINAL_CONFIG.legendIconSize"
                            />
                            <span
                                :style="`font-size:${FINAL_CONFIG.legendFontSize}px`"
                            >
                                {{ legendItem.name }}
                            </span>
                            <span
                                :style="`font-size:${FINAL_CONFIG.legendFontSize}px;font-variant-numeric:tabular-nums`"
                            >
                                {{
                                    segregated.includes(legendItem.id)
                                        ? '-'
                                        : applyDataLabel(
                                              FINAL_CONFIG.formatter,
                                              legendItem.absoluteValue,
                                              dataLabel({
                                                  p: FINAL_CONFIG.valuePrefix,
                                                  v: legendItem.absoluteValue,
                                                  s: FINAL_CONFIG.valueSuffix,
                                                  r: FINAL_CONFIG.dataLabelRoundingValue,
                                              }),
                                              {
                                                  datapoint: legendItem,
                                                  seriesIndex: i,
                                              },
                                          )
                                }}
                            </span>
                            <span
                                v-if="segregated.includes(legendItem.id)"
                                :style="`font-size:${FINAL_CONFIG.legendFontSize}px`"
                            >
                                ( - % )
                            </span>
                            <span
                                v-else-if="isSegregatingDonut"
                                :style="`font-size:${FINAL_CONFIG.legendFontSize}px; font-variant-numeric: tabular-nums;`"
                            >
                                ( - % )
                            </span>
                            <span
                                v-else
                                :style="`font-size:${FINAL_CONFIG.legendFontSize}px; font-variant-numeric: tabular-nums;`"
                            >
                                ({{
                                    dataLabel({
                                        v:
                                            (legendItem.value / donut.total) *
                                            100,
                                        s: '%',
                                        r: FINAL_CONFIG.dataLabelRoundingPercentage,
                                    })
                                }})
                            </span>
                        </template>
                    </div>
                </template>

                <template v-if="xyChart">
                    <div
                        class="vue-ui-quick-chart-legend-item"
                        v-for="(legendItem, i) in xyChart.legend"
                        @click="
                            segregate(legendItem.id, xyChart.legend.length - 1);
                            emit('selectLegend', xyChart.dataset);
                        "
                        :style="`cursor: ${xyChart.legend.length > 1 && isCursorPointer ? 'pointer' : 'default'}; opacity:${segregated.includes(legendItem.id) ? '0.5' : '1'}`"
                        role="button"
                        tabindex="0"
                        @keydown="
                            handleLegendKeydown($event, () => {
                                segregate(
                                    legendItem.id,
                                    xyChart.legend.length - 1,
                                );
                                emit('selectLegend', xyChart.dataset);
                            })
                        "
                    >
                        <template v-if="FINAL_CONFIG.useCustomLegend">
                            <slot
                                name="legend"
                                v-bind="{
                                    legend: {
                                        ...legendItem,
                                        isSegregated: segregated.includes(
                                            legendItem.id,
                                        ),
                                        segregate: () => {
                                            segregate(
                                                legendItem.id,
                                                xyChart.legend.length - 1,
                                            );
                                            emit(
                                                'selectLegend',
                                                xyChart.dataset,
                                            );
                                        },
                                    },
                                }"
                            />
                        </template>
                        <template v-else>
                            <BaseIcon
                                :name="FINAL_CONFIG.legendIcon"
                                :stroke="legendItem.color"
                                :size="FINAL_CONFIG.legendIconSize"
                            />
                            <span
                                :style="`font-size:${FINAL_CONFIG.legendFontSize}px`"
                            >
                                {{ legendItem.name }}
                            </span>
                        </template>
                    </div>
                </template>
            </div>
        </Teleport>

        <div v-if="$slots.source" ref="source" dir="auto">
            <slot name="source" />
        </div>

        <Tooltip
            :teleportTo="FINAL_CONFIG.tooltipTeleportTo"
            :show="mutableConfig.showTooltip && isTooltip"
            :backgroundColor="FINAL_CONFIG.backgroundColor"
            :color="FINAL_CONFIG.color"
            :borderRadius="FINAL_CONFIG.tooltipBorderRadius"
            :borderColor="FINAL_CONFIG.tooltipBorderColor"
            :borderWidth="FINAL_CONFIG.tooltipBorderWidth"
            :fontSize="FINAL_CONFIG.tooltipFontSize"
            :backgroundOpacity="FINAL_CONFIG.tooltipBackgroundOpacity"
            :position="FINAL_CONFIG.tooltipPosition"
            :offsetX="FINAL_CONFIG.tooltipOffsetX"
            :offsetY="FINAL_CONFIG.tooltipOffsetY"
            :parent="quickChart"
            :content="tooltipContent"
            :isFullscreen="isFullscreen"
            :isCustom="isFunction(FINAL_CONFIG.tooltipCustomFormat)"
            :smooth="FINAL_CONFIG.tooltipSmooth"
            :smoothForce="FINAL_CONFIG.tooltipSmoothForce"
            :smoothSnapThreshold="FINAL_CONFIG.tooltipSmoothSnapThreshold"
            :backdropFilter="FINAL_CONFIG.tooltipBackdropFilter"
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

        <!-- v3 Skeleton loader -->
        <slot name="skeleton">
            <BaseScanner v-if="loading" />
        </slot>
    </div>
    <div v-else class="vue-ui-quick-chart-not-processable">
        <BaseIcon name="circleCancel" stroke="red" />
        <span>Dataset is not processable</span>
    </div>
</template>

<style scoped>
@import '../vue-data-ui.css';
.vue-ui-quick-chart * {
    transition: unset;
}

.vue-ui-quick-chart {
    user-select: none;
    width: 100%;
}

.vue-ui-quick-chart-not-processable {
    align-items: center;
    background: rgba(255, 0, 0, 0.1);
    border-radius: 6px;
    color: red;
    display: flex;
    flex-direction: row;
    gap: 12px;
    justify-content: center;
    padding: 12px;
}

.vue-ui-quick-chart-title {
    padding: 0 40px 12px 40px;
}

.vue-ui-quick-chart-legend {
    align-items: center;
    display: flex;
    column-gap: 24px;
    justify-content: center;
    width: 100%;
    flex-wrap: wrap;
}

.vue-ui-quick-chart-legend-item {
    display: flex;
    flex-direction: flex-row;
    gap: 6px;
    align-items: center;
}

.vue-ui-quick-chart-legend-item:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
}

.vue-data-ui-bar-animated {
    animation: vueDataUiBarAnimation 0.5s cubic-bezier(0.79, 0.21, 0.79, 0.21)
        forwards;
}

@keyframes vueDataUiBarAnimation {
    from {
        height: 0;
    }
}

svg:focus {
    outline: none;
}

svg:focus-visible {
    outline: 2px solid currentColor;
}

svg.vue-ui-quick-chart-zoom-pointer-focus:focus,
svg.vue-ui-quick-chart-zoom-pointer-focus:focus-visible {
    outline: none;
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

.vue-data-ui-transition {
    transition: all 0.2s ease-in-out;
}

@media (prefers-reduced-motion: reduce) {
    .vue-data-ui-component * {
        transition: none !important;
        animation: none !important;
    }
}

.vue-data-ui-no-transition * {
    transition: none !important;
    animation: none !important;
}
</style>
