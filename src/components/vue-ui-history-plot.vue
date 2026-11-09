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
import { resolveChartConfigWithPalette } from '../resolveChartConfig';
import {
    computed,
    defineAsyncComponent,
    nextTick,
    onBeforeUnmount,
    onMounted,
    ref,
    reactive,
    shallowRef,
    watch,
} from 'vue';
import {
    XMLNS,
    adaptColorToBackground,
    applyDataLabel,
    calculateNiceScale,
    convertColorToHex,
    convertCustomPalette,
    createCatmullRomPath,
    createCsvContent,
    createTSpansFromLineBreaksOnX,
    createUid,
    darkenHexColor,
    dataLabel,
    downloadCsv,
    error,
    isFunction,
    lightenHexColor,
    palette,
    setGradientOffset,
    svgToClientCoords,
    translateSize,
    treeShake,
    interpolateHexColors,
} from '../lib';
import { COMMON_RULES, useHints } from '../useHints';
import { useConfig } from '../useConfig';
import { useSvgLabelLayout } from '../useSvgLabelLayout';
import { usePrinter } from '../usePrinter';
import { useResponsive } from '../useResponsive';
import { useChartExport } from '../useChartExport';
import { useTransitions } from '../useTransitions.js';
import { useChartAccessibility } from '../useChartAccessibility';
import { useTimeLabelCollision } from '../useTimeLabelCollider';
import Title from '../atoms/Title.vue'; // Must be ready in responsive mode
import themes from '../themes/vue_ui_history_plot.json';
import Legend from '../atoms/Legend.vue'; // Must be ready in responsive mode
import BaseScanner from '../atoms/BaseScanner.vue';
import A11yDataTable from '../atoms/A11yDataTable.vue';
import BaseLegendToggle from '../atoms/BaseLegendToggle.vue';
import DefGrad from '../atoms/DefGrad.vue';

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

const { vue_ui_history_plot: DEFAULT_CONFIG } = useConfig();

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
});

const historyPlotChart = ref(null);
const chartTitle = ref(null);
const chartLegend = ref(null);
const step = ref(0);
const resizeObserver = shallowRef(null);
const noTitle = ref(null);
const uid = ref(createUid());
const isTooltip = ref(false);
const tooltipContent = ref('');
const hiddenSeriesKeys = ref([]);
const isFullscreen = ref(false);
const selectedDatapoint = ref(null);
const useCustomFormat = ref(false);
const source = ref(null);
const readyTeleport = ref(false);
const tableUnit = ref(null);
const userOptionsRef = ref(null);

const xAxisLabel = ref(null);
const yAxisLabel = ref(null);
const xAxisScales = ref(null);
const yAxisScales = ref(null);

const activeTooltipSeriesIndex = ref(null); // a11y
const activeTooltipPlotIndex = ref(null); // a11y
const tooltipA11yPosition = ref({ x: 0, y: 0 }); // a11y
const tooltipTriggerMode = ref('pointer'); // a11y
const isFocus = ref(false); // a11y

const validation = computed(() =>
    Array.from(props.dataset, (serie) => {
        const keys =
            serie && typeof serie === 'object' ? Object.keys(serie) : [];
        const missing = ['name', 'values'].filter((key) => !keys.includes(key));
        const array = Array.isArray(serie?.values);
        const points = array
            ? Array.from(serie.values, (point) => ({
                  x: Number.isFinite(point?.x),
                  y: Number.isFinite(point?.y),
              }))
            : [];
        return {
            missing,
            array,
            points,
            valid:
                !missing.length &&
                array &&
                points.every((point) => point.x && point.y),
        };
    }),
);

const isDataset = computed(
    () =>
        props.dataset.length > 0 &&
        validation.value.every((serie) => serie.valid),
);

const emit = defineEmits(['selectLegend', 'selectDatapoint', 'copyAlt']);

const responsiveSizeReady = ref(false);
let resizeFrame = null;
let disposed = false;
const responsiveSize = shallowRef(null);

function teardownResponsive() {
    resizeObserver.value?.disconnect();
    resizeObserver.value = null;
    if (resizeFrame !== null) cancelAnimationFrame(resizeFrame);
    resizeFrame = null;
}

function prepareChart() {
    teardownResponsive();
    responsiveSize.value = null;
    responsiveSizeReady.value = false;
    if (!FINAL_CONFIG.value.responsive || !historyPlotChart.value?.parentNode)
        return;
    const observer = new ResizeObserver(measure);
    function measure() {
        if (disposed || resizeObserver.value !== observer) return;
        if (resizeFrame !== null) cancelAnimationFrame(resizeFrame);
        resizeFrame = requestAnimationFrame(() => {
            if (disposed || resizeObserver.value !== observer) return;
            resizeFrame = null;
            const { width, height } = useResponsive({
                chart: historyPlotChart.value,
                title: cfgChart.value.title.text ? chartTitle.value : null,
                noTitle: noTitle.value,
                legend: cfgChart.value.legend.show ? chartLegend.value : null,
                source: source.value,
            });
            responsiveSize.value = {
                width: Math.max(0.1, width),
                height: Math.max(0.1, height),
            };
            responsiveSizeReady.value = true;
        });
    }
    resizeObserver.value = observer;
    observer.observe(historyPlotChart.value.parentNode);
    for (const element of [
        chartTitle.value,
        chartLegend.value,
        source.value,
        noTitle.value,
    ]) {
        if (element) observer.observe(element);
    }
    measure();
}

onMounted(() => {
    readyTeleport.value = true;
    prepareChart();
});

onBeforeUnmount(() => {
    disposed = true;
    teardownResponsive();
});

function prepareConfig() {
    return resolveChartConfigWithPalette(props.config, DEFAULT_CONFIG, themes);
}

const preparedConfig = computed(() => reactive(prepareConfig()));

const loading = computed(() => !!props.config.loading || !isDataset.value);

const skeletonConfig = computed(() => {
    return treeShake({
        defaultConfig: {
            userOptions: { show: false },
            table: { show: false },
            style: {
                chart: {
                    backgroundColor: '#99999930',
                    axes: {
                        x: {
                            scaleMin: 0,
                            scaleMax: 10,
                            labels: { show: false },
                            name: { text: '' },
                        },
                        y: {
                            scaleMin: 0,
                            scaleMax: 10,
                            labels: { show: false },
                            name: { text: '' },
                        },
                    },
                    grid: {
                        xAxis: {
                            stroke: '#6A6A6A',
                        },
                        horizontalLines: {
                            stroke: '#6A6A6A50',
                        },
                        yAxis: {
                            stroke: '#6A6A6A',
                        },
                        verticalLines: {
                            stroke: '#6A6A6A50',
                        },
                    },
                    legend: {
                        backgroundColor: 'transparent',
                    },
                    paths: {
                        useSerieColor: false,
                        stroke: '#6A6A6A',
                    },
                    plots: {
                        stroke: '#6A6A6A',
                        indexLabels: { show: false },
                        labels: { show: false },
                    },
                },
            },
        },
        userConfig: preparedConfig.value.skeletonConfig ?? {},
    });
});

const FINAL_CONFIG = computed(() =>
    loading.value
        ? reactive(
              treeShake({
                  defaultConfig: preparedConfig.value,
                  userConfig: skeletonConfig.value,
              }),
          )
        : preparedConfig.value,
);

const FINAL_DATASET = computed(() =>
    loading.value
        ? (props.config.skeletonDataset ?? [
              {
                  name: '',
                  color: '#CACACA',
                  values: [
                      { label: '', x: 1, y: 9 },
                      { label: '', x: 4, y: 1 },
                      { label: '', x: 7, y: 9 },
                      { label: '', x: 9, y: 4 },
                  ],
              },
          ])
        : props.dataset,
);
const debug = computed(() => preparedConfig.value.debug);

const cfgPlots = computed(() => FINAL_CONFIG.value.style.chart.plots);
const cfgGrid = computed(() => FINAL_CONFIG.value.style.chart.grid);
const cfgAxes = computed(() => FINAL_CONFIG.value.style.chart.axes);
const cfgChart = computed(() => FINAL_CONFIG.value.style.chart);

useHints({
    config: () => FINAL_CONFIG.value,
    dataset: () => props.dataset,
    component: 'VueUiHistoryPlot',
    rules: [
        COMMON_RULES.emptyArray,
        {
            test: (ds) => ds.length > 6,
            message: [
                '👀 The number of series is > 6. Consider:',
                '',
                '▶️ Using filters to let users choose a maximum number of series to display.',
            ],
        },
    ],
});

const { transitionEnabled } = useTransitions({
    config: () => FINAL_CONFIG.value.transitions,
    dataset: () => props.dataset,
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

function setUserOptionsVisibility(value = false) {
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

watch(
    [validation, debug],
    () => {
        if (!props.dataset.length)
            error({
                componentName: 'VueUiHistoryPlot',
                type: 'dataset',
                debug: debug.value,
            });
        validation.value.forEach((serie, index) => {
            serie.missing.forEach((property) =>
                error({
                    componentName: 'VueUiHistoryPlot',
                    type: 'datasetSerieAttribute',
                    property,
                    index,
                    debug: debug.value,
                }),
            );
            if (!debug.value) return;
            if (!serie.missing.includes('values') && !serie.array)
                console.warn(
                    `VueUiHistoryPlot: dataset[${index}].values must be an array.`,
                );
            serie.points.forEach((point, plotIndex) => {
                for (const axis of ['x', 'y'])
                    if (!point[axis])
                        console.warn(
                            `VueUiHistoryPlot: dataset[${index}].values[${plotIndex}].${axis} must be a finite number.`,
                        );
            });
        });
    },
    { immediate: true },
);

watch(
    [
        () => FINAL_CONFIG.value.responsive,
        () => cfgChart.value.title.text,
        () => cfgChart.value.legend.show,
        () => cfgChart.value.legend.position,
        chartTitle,
        chartLegend,
        source,
        noTitle,
    ],
    prepareChart,
    { flush: 'post' },
);

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `history_plot_${uid.value}`,
    fileName: cfgChart.value.title.text || 'vue-ui-history-plot',
    options: FINAL_CONFIG.value.userOptions.print,
});

const hasOptionsNoTitle = computed(() => {
    return FINAL_CONFIG.value.userOptions.show && !cfgChart.value.title.text;
});

const customPalette = computed(() => {
    return convertCustomPalette(FINAL_CONFIG.value.customPalette);
});

const mutableConfig = ref({
    showTable: FINAL_CONFIG.value.table.show,
    showTooltip: cfgChart.value.tooltip.show,
});

watch(
    () => FINAL_CONFIG.value.table.show,
    (value) => {
        mutableConfig.value.showTable = value;
    },
);

watch(
    () => cfgChart.value.tooltip.show,
    (value) => {
        mutableConfig.value.showTooltip = value;
    },
);

const svg = computed(
    () =>
        responsiveSize.value || {
            width: cfgChart.value.width,
            height: cfgChart.value.height,
        },
);

const WIDTH = computed(() => svg.value.width);
const HEIGHT = computed(() => svg.value.height);

const {
    metrics: labelLayout,
    ready: labelLayoutReady,
    settling: labelLayoutSettling,
    update: measureLabelLayout,
} = useSvgLabelLayout({
    svgRef,
    canMeasure: () =>
        !FINAL_CONFIG.value.responsive || responsiveSizeReady.value,
    initialMetrics: {
        scaleLabelsWidth: 0,
        yAxisLabelWidth: 0,
        xAxisLabelHeight: 0,
        timeLabelsHeight: 0,
    },
    measure: (read) => ({
        scaleLabelsWidth: read(yAxisScales.value).textWidth,
        yAxisLabelWidth: read(yAxisLabel.value).rotatedWidth,
        xAxisLabelHeight: read(xAxisLabel.value).height,
        timeLabelsHeight: read(xAxisScales.value).height,
    }),
});

function getOffsetX() {
    const base = labelLayout.value.scaleLabelsWidth;
    const yAxisLabelW = labelLayout.value.yAxisLabelWidth;
    return base + yAxisLabelW + (yAxisLabelW ? 24 : 0);
}

const offsetY = computed(
    () =>
        labelLayout.value.xAxisLabelHeight +
        labelLayout.value.timeLabelsHeight +
        (xAxisLabel.value ? sizes.value.xAxisName / 2 : 0),
);

const drawingArea = computed(() => {
    const radius = cfgPlots.value.radius;
    const left =
        cfgChart.value.padding.left +
        getOffsetX() +
        cfgAxes.value.y.name.offsetX;
    const top = cfgChart.value.padding.top + radius;
    const right =
        svg.value.width -
        cfgChart.value.padding.right -
        radius -
        cfgAxes.value.y.name.offsetX;
    const bottom =
        svg.value.height -
        cfgChart.value.padding.bottom -
        offsetY.value -
        radius -
        cfgAxes.value.x.name.offsetY;
    return {
        left,
        top,
        right,
        bottom,
        width: right - left,
        height: bottom - top,
    };
});

const sizes = computed(() => {
    const resize = (source, minimum) =>
        FINAL_CONFIG.value.responsive &&
        FINAL_CONFIG.value.responsiveProportionalSizing &&
        responsiveSize.value
            ? translateSize({
                  relator: Math.min(svg.value.width, svg.value.height),
                  adjuster: 600,
                  source,
                  threshold: minimum,
                  fallback: minimum,
              })
            : source;
    return {
        plots: resize(cfgPlots.value.radius, 3),
        indexLabels: resize(cfgPlots.value.indexLabels.fontSize, 6),
        labels: resize(cfgPlots.value.labels.fontSize, 6),
        xAxisLabels: resize(cfgAxes.value.x.labels.fontSize, 6),
        xAxisName: resize(cfgAxes.value.x.name.fontSize, 6),
        yAxisLabels: resize(cfgAxes.value.y.labels.fontSize, 6),
        yAxisName: resize(cfgAxes.value.y.name.fontSize, 6),
    };
});

const identityCache = new Map();
function getIdentity(key) {
    if (!identityCache.has(key)) identityCache.set(key, createUid());
    return identityCache.get(key);
}

const seriesKeys = computed(() => {
    const occurrences = new Map();
    return FINAL_DATASET.value.map((serie, index) => {
        const source =
            serie?.id != null
                ? `id:${typeof serie.id}:${serie.id}`
                : serie?.name != null
                  ? `name:${serie.name}`
                  : `index:${index}`;
        const occurrence = occurrences.get(source) || 0;
        occurrences.set(source, occurrence + 1);
        return getIdentity(
            `${loading.value ? 'skeleton' : 'data'}:${source}:${occurrence}`,
        );
    });
});

const plotKeys = computed(() =>
    FINAL_DATASET.value.map((serie, seriesIndex) => {
        const occurrences = new Map();
        return (Array.isArray(serie?.values) ? serie.values : []).map(
            (point, index) => {
                const source =
                    point?.id != null
                        ? `id:${typeof point.id}:${point.id}`
                        : point?.label
                          ? `label:${point.label}`
                          : `index:${index}`;
                const occurrence = occurrences.get(source) || 0;
                occurrences.set(source, occurrence + 1);
                return getIdentity(
                    `${seriesKeys.value[seriesIndex]}:${source}:${occurrence}`,
                );
            },
        );
    }),
);

const segregated = computed(() =>
    seriesKeys.value.flatMap((key, index) =>
        hiddenSeriesKeys.value.includes(key) ? [index] : [],
    ),
);

const formattedDataset = computed(() => {
    return FINAL_DATASET.value.map((ds, i) => {
        const temperatureColors =
            Array.isArray(ds.temperatureColors) && ds.temperatureColors.length
                ? ds.temperatureColors.map((color) => convertColorToHex(color))
                : undefined;

        return {
            ...ds,
            color: ds.color
                ? convertColorToHex(ds.color)
                : customPalette.value[i] ||
                  palette[i] ||
                  palette[i % palette.length],
            temperatureColors,
            temperatureAngle: normalizeTemperatureAngle(ds.temperatureAngle),
            temperatureIndependant: ds.temperatureIndependant === true,
            usePlotTemperatureColors: ds.usePlotTemperatureColors !== false,
            seriesIndex: i,
        };
    });
});

function normalizeTemperatureAngle(angle = 0) {
    const numericAngle = Number(angle);
    if (!Number.isFinite(numericAngle)) return 0;
    return ((numericAngle % 360) + 360) % 360;
}

const visibleDataset = computed(() =>
    formattedDataset.value.filter(
        (serie) => !segregated.value.includes(serie.seriesIndex),
    ),
);

const dataBounds = computed(() => {
    let minX = Infinity,
        maxX = -Infinity,
        minY = Infinity,
        maxY = -Infinity;
    for (const serie of visibleDataset.value)
        for (const point of serie.values) {
            minX = Math.min(minX, point.x);
            maxX = Math.max(maxX, point.x);
            minY = Math.min(minY, point.y);
            maxY = Math.max(maxY, point.y);
        }
    return {
        minX: Math.min(0, Number.isFinite(minX) ? minX : 0),
        maxX: Number.isFinite(maxX) ? maxX : 1,
        minY: Math.min(0, Number.isFinite(minY) ? minY : 0),
        maxY: Number.isFinite(maxY) ? maxY : 1,
    };
});

function getScale(axis, min, max) {
    const lower = Number.isFinite(axis.scaleMin) ? axis.scaleMin : min;
    const upper = Number.isFinite(axis.scaleMax) ? axis.scaleMax : max;
    const low = Math.min(lower, upper),
        high = Math.max(lower, upper);
    return calculateNiceScale(
        low === high ? low - (low ? Math.abs(low) * 0.1 : 0) : low,
        low === high ? high + (high ? Math.abs(high) * 0.1 : 1) : high,
        Math.max(2, axis.ticks || 2),
    );
}

const scales = computed(() => {
    const x = getScale(
        cfgAxes.value.x,
        dataBounds.value.minX,
        dataBounds.value.maxX,
    );
    const y = getScale(
        cfgAxes.value.y,
        dataBounds.value.minY,
        dataBounds.value.maxY,
    );

    return {
        x,
        y,
        tickX: x.ticks.map((t) => {
            return {
                x:
                    drawingArea.value.left +
                    ((t - x.min) / (x.max - x.min)) * drawingArea.value.width,
                y1: drawingArea.value.top,
                y2: drawingArea.value.bottom,
                value: t,
            };
        }),
        tickY: y.ticks.map((t) => {
            return {
                y:
                    drawingArea.value.bottom -
                    ((t - y.min) / (y.max - y.min)) * drawingArea.value.height,
                x1: drawingArea.value.left,
                x2: drawingArea.value.right,
                value: t,
            };
        }),
    };
});

function setDimensionX(value) {
    const minOffset =
        scales.value.x.min < 0
            ? Math.abs(scales.value.x.min)
            : scales.value.x.min > 0
              ? -scales.value.x.min
              : 0;

    return (
        drawingArea.value.left +
        (((value || 0) + minOffset) / (scales.value.x.max + minOffset)) *
            drawingArea.value.width
    );
}
function setDimensionY(value) {
    const minOffset =
        scales.value.y.min < 0
            ? Math.abs(scales.value.y.min)
            : scales.value.y.min > 0
              ? -scales.value.y.min
              : 0;
    return (
        drawingArea.value.bottom -
        (((value || 0) + minOffset) / (scales.value.y.max + minOffset)) *
            drawingArea.value.height
    );
}

const drawableDataset = computed(() => {
    return visibleDataset.value.map((ds, i) => {
        const plots = ds.values.map((p, i) => {
            return {
                valueX: p.x,
                valueY: p.y,
                label: p.label,
                x: setDimensionX(p.x),
                y: setDimensionY(p.y),
                color: ds.color,
                seriesName: ds.name,
                id: plotKeys.value[ds.seriesIndex][i],
            };
        });
        const path = ds.smooth
            ? createCatmullRomPath(plots)
            : plots
                  .map((p) => {
                      return `${p.x},${p.y} `;
                  })
                  .join('')
                  .trim();
        return {
            ...ds,
            gradientIndex: i,
            plots,
            path: plots.length ? `M${path}` : '',
        };
    });
});

const drawableDatasetWithActiveLast = computed(() => {
    if (
        selectedDatapoint.value === null ||
        activeTooltipSeriesIndex.value === null
    ) {
        return drawableDataset.value;
    }

    const activeIndex = drawableDataset.value.findIndex(
        (ds) => ds.seriesIndex === activeTooltipSeriesIndex.value,
    );

    if (activeIndex === -1) {
        return drawableDataset.value;
    }

    const activeSerie = drawableDataset.value[activeIndex];

    return [
        ...drawableDataset.value.slice(0, activeIndex),
        ...drawableDataset.value.slice(activeIndex + 1),
        activeSerie,
    ];
});

const hasTemperatureGradients = computed(() => {
    return drawableDataset.value.some((ds) => hasTemperatureColors(ds));
});

function hasTemperatureColors(ds) {
    return Array.isArray(ds?.temperatureColors) && ds.temperatureColors.length;
}

function usePlotTemperatureColors(ds) {
    return hasTemperatureColors(ds) && ds.usePlotTemperatureColors;
}

function getSeriesPlotBounds(ds) {
    const plots = Array.isArray(ds?.plots) ? ds.plots : [];

    if (!plots.length) {
        return {
            minX: 0,
            maxX: 0,
            minY: 0,
            maxY: 0,
            width: 0,
            height: 0,
        };
    }

    let minX = Infinity,
        maxX = -Infinity,
        minY = Infinity,
        maxY = -Infinity;
    for (const plot of plots) {
        minX = Math.min(minX, plot.x);
        maxX = Math.max(maxX, plot.x);
        minY = Math.min(minY, plot.y);
        maxY = Math.max(maxY, plot.y);
    }

    return {
        minX,
        maxX,
        minY,
        maxY,
        width: maxX - minX,
        height: maxY - minY,
    };
}

function getDrawingAreaBounds() {
    const area = drawingArea.value;

    return {
        minX: area.left,
        maxX: area.right,
        minY: area.top,
        maxY: area.bottom,
        width: area.width,
        height: area.height,
    };
}

function getTemperatureBounds(ds) {
    return ds?.temperatureIndependant
        ? getSeriesPlotBounds(ds)
        : getDrawingAreaBounds();
}

function computeTemperatureGradientCoordinates(ds) {
    const angle = normalizeTemperatureAngle(ds?.temperatureAngle);
    const radians = (angle * Math.PI) / 180;
    const dx = Math.sin(radians);
    const dy = Math.cos(radians);
    const bounds = getTemperatureBounds(ds);
    const centerX = bounds.minX + bounds.width / 2;
    const centerY = bounds.minY + bounds.height / 2;
    const halfLength =
        (Math.abs(dx) * bounds.width + Math.abs(dy) * bounds.height) / 2 || 1;

    return {
        x1: centerX - dx * halfLength,
        y1: centerY - dy * halfLength,
        x2: centerX + dx * halfLength,
        y2: centerY + dy * halfLength,
    };
}

const temperatureStyles = computed(() => {
    const styles = new Map();
    for (const serie of drawableDataset.value) {
        if (!hasTemperatureColors(serie)) continue;
        const coordinates = computeTemperatureGradientCoordinates(serie);
        const { x1, y1, x2, y2 } = coordinates;
        const dx = x2 - x1,
            dy = y2 - y1;
        const lengthSquared = dx * dx + dy * dy;
        const colors = new Map();
        if (usePlotTemperatureColors(serie))
            for (const plot of serie.plots) {
                const ratio = lengthSquared
                    ? Math.min(
                          1,
                          Math.max(
                              0,
                              ((plot.x - x1) * dx + (plot.y - y1) * dy) /
                                  lengthSquared,
                          ),
                      )
                    : 0;
                colors.set(
                    plot.id,
                    interpolateHexColors({
                        colors: serie.temperatureColors,
                        ratio,
                    }),
                );
            }
        styles.set(serie.seriesIndex, { coordinates, colors });
    }
    return styles;
});

function getTemperatureGradientCoordinates(serie) {
    return temperatureStyles.value.get(serie.seriesIndex)?.coordinates;
}

function getTemperaturePlotColor(serie, plot) {
    return (
        temperatureStyles.value.get(serie.seriesIndex)?.colors.get(plot.id) ??
        serie.color
    );
}

function getTemperaturePlotGradientId(ds, plot) {
    return `temperature_plot_grad_history_${ds.seriesIndex}_${plot.id}_${uid.value}`;
}

function getPlotFillColor(ds, plot, seriesIndex) {
    if (usePlotTemperatureColors(ds)) {
        return cfgPlots.value.gradient.show
            ? `url(#${getTemperaturePlotGradientId(ds, plot)})`
            : getTemperaturePlotColor(ds, plot);
    }

    return cfgPlots.value.gradient.show
        ? `url(#gradient_${seriesIndex}_${uid.value})`
        : plot.color;
}

function getPlotBaseColor(ds, plot) {
    return usePlotTemperatureColors(ds)
        ? getTemperaturePlotColor(ds, plot)
        : ds.color;
}

function getIndexLabelFillColor(ds, plot) {
    return cfgPlots.value.indexLabels.adaptColorToBackground
        ? adaptColorToBackground(getPlotBaseColor(ds, plot))
        : cfgPlots.value.indexLabels.color;
}

function getTooltipMarkerColor(seriesIndex, datapoint) {
    const serie = drawableDataset.value.find(
        (ds) => ds.seriesIndex === seriesIndex,
    );

    if (serie && usePlotTemperatureColors(serie)) {
        return getTemperaturePlotColor(serie, datapoint);
    }

    return datapoint.color;
}

function getPathStroke(ds) {
    if (hasTemperatureColors(ds)) {
        return `url(#temperature_grad_history_${ds.seriesIndex}_${uid.value})`;
    }

    return cfgChart.value.paths.useSerieColor
        ? ds.color
        : cfgChart.value.paths.stroke;
}

function getSeriesOpacity(seriesIndex) {
    return selectedDatapoint.value === null ||
        activeTooltipSeriesIndex.value === seriesIndex
        ? 1
        : Math.min(1, cfgPlots.value.unselectedOpacity);
}

function toggleLegend() {
    if (segregated.value.length) {
        hiddenSeriesKeys.value = [];
    } else {
        legendSet.value.forEach((l) => {
            hiddenSeriesKeys.value.push(seriesKeys.value[l.seriesIndex]);
        });
    }
    emit('selectLegend', drawableDataset.value);
}

function segregate(index) {
    if (segregated.value.includes(index)) {
        hiddenSeriesKeys.value = hiddenSeriesKeys.value.filter(
            (key) => key !== seriesKeys.value[index],
        );
    } else {
        hiddenSeriesKeys.value.push(seriesKeys.value[index]);
    }
    emit('selectLegend', drawableDataset.value);
}

function validSeriesToToggle(name) {
    if (!formattedDataset.value.length) {
        if (debug.value) {
            console.warn('VueUiHistoryPlot - There are no series to show.');
        }
        return null;
    }
    const dp = formattedDataset.value.find((d) => d.name === name);
    if (!dp) {
        if (debug.value) {
            console.warn(`VueUiHistoryPlot - Series name not found "${name}"`);
        }
        return null;
    }
    return dp;
}

/**
 * Show the named series only if its visibility needs to change.
 * Unknown names leave visibility unchanged.
 *
 * @param {string} name - Series name matched by the component.
 * @returns {void}
 */
function showSeries(name) {
    const dp = validSeriesToToggle(name);
    if (dp === null) return;
    if (segregated.value.includes(dp.seriesIndex)) {
        segregate(dp.seriesIndex);
    }
}

/**
 * Hide the named series only if its visibility needs to change.
 * Unknown names leave visibility unchanged.
 *
 * @param {string} name - Series name matched by the component.
 * @returns {void}
 */
function hideSeries(name) {
    const dp = validSeriesToToggle(name);
    if (dp === null) return;
    if (!segregated.value.includes(dp.seriesIndex)) {
        segregate(dp.seriesIndex);
    }
}

watch(seriesKeys, (keys) => {
    if (!loading.value)
        hiddenSeriesKeys.value = hiddenSeriesKeys.value.filter((key) =>
            keys.includes(key),
        );
});
const keyboardDataset = computed(() =>
    drawableDataset.value.filter((serie) => serie.plots.length),
);
const plotLookup = computed(() => {
    const lookup = new Map();
    for (const serie of drawableDataset.value)
        serie.plots.forEach((plot, plotIndex) =>
            lookup.set(plot.id, { serie, plot, plotIndex }),
        );
    return lookup;
});
const selectedPlotId = ref(null);

const legendSet = computed(() => {
    return formattedDataset.value.map((ds) => {
        const gradientColors = hasTemperatureColors(ds)
            ? ds.temperatureColors
            : null;

        return {
            ...ds,
            gradientColors,
            opacity: segregated.value.includes(ds.seriesIndex) ? 0.5 : 1,
            segregate: () => segregate(ds.seriesIndex),
            isSegregated: segregated.value.includes(ds.seriesIndex),
            shape: gradientColors ? 'gradient' : 'circle',
        };
    });
});

const legendConfig = computed(() => {
    return {
        cy: 'history-plot-div-legend',
        backgroundColor: cfgChart.value.legend.backgroundColor,
        color: cfgChart.value.legend.color,
        fontSize: cfgChart.value.legend.fontSize,
        paddingBottom: 12,
        fontWeight: cfgChart.value.legend.bold ? 'bold' : '',
    };
});

function selectDatapoint({ datapoint, plotIndex, seriesIndex }) {
    if (loading.value) return;
    if (FINAL_CONFIG.value.events.datapointClick) {
        FINAL_CONFIG.value.events.datapointClick({
            datapoint: { ...datapoint, plotIndex, seriesIndex },
            seriesIndex,
        });
    }
    emit('selectDatapoint', datapoint);
}

function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
}

const dataTooltipSlot = ref(null);

function onTrapLeave({ datapoint, plotIndex, seriesIndex }) {
    if (FINAL_CONFIG.value.events.datapointLeave) {
        FINAL_CONFIG.value.events.datapointLeave({
            datapoint: { ...datapoint, plotIndex, seriesIndex },
            seriesIndex,
        });
    }

    if (
        tooltipTriggerMode.value === 'keyboard' &&
        activeTooltipSeriesIndex.value === seriesIndex &&
        activeTooltipPlotIndex.value === plotIndex
    ) {
        return;
    }

    clearSelection();
}

function updateTooltipA11yPosition(seriesIndex, plotIndex) {
    if (disposed || !svgRef.value) return;
    const serie = drawableDataset.value.find(
        (ds) => ds.seriesIndex === seriesIndex,
    );
    if (!serie) return;
    const plot = serie.plots[plotIndex];
    if (!plot) return;
    const coords = svgToClientCoords(plot.x, plot.y, svgRef.value);
    if (!coords) return;
    tooltipA11yPosition.value = coords;
}

function useTooltip({
    datapoint,
    plotIndex,
    seriesIndex,
    triggerMode = 'pointer',
}) {
    if (loading.value) return;
    if (FINAL_CONFIG.value.events.datapointEnter) {
        FINAL_CONFIG.value.events.datapointEnter({
            datapoint: { ...datapoint, plotIndex, seriesIndex },
            seriesIndex,
        });
    }

    selectedPlotId.value = datapoint.id;
    activeTooltipSeriesIndex.value = seriesIndex;
    activeTooltipPlotIndex.value = plotIndex;
    tooltipTriggerMode.value = triggerMode;
    selectedDatapoint.value = datapoint;
    refreshTooltip({ datapoint, plotIndex, seriesIndex });
    isTooltip.value = true;
    if (triggerMode === 'keyboard')
        nextTick(() => {
            if (selectedPlotId.value === datapoint.id)
                updateTooltipA11yPosition(seriesIndex, plotIndex);
        });
}
function refreshTooltip({ datapoint, plotIndex, seriesIndex }) {
    const tooltipMarkerColor = getTooltipMarkerColor(seriesIndex, datapoint);
    const tooltipDatapoint = {
        ...datapoint,
        color: tooltipMarkerColor,
    };

    dataTooltipSlot.value = {
        datapoint: tooltipDatapoint,
        color: tooltipMarkerColor,
        seriesIndex,
        plotIndex,
        config: FINAL_CONFIG.value,
        series: formattedDataset.value,
    };
    selectedDatapoint.value = datapoint;
    const customFormat = cfgChart.value.tooltip.customFormat;
    useCustomFormat.value = false;

    if (isFunction(customFormat)) {
        try {
            const customFormatString = customFormat({
                seriesIndex,
                datapoint: tooltipDatapoint,
                color: tooltipMarkerColor,
                plotIndex,
                series: formattedDataset.value,
                config: FINAL_CONFIG.value,
            });
            if (typeof customFormatString === 'string') {
                tooltipContent.value = customFormatString;
                useCustomFormat.value = true;
            }
        } catch (err) {
            console.warn('Custom format cannot be applied.');
            useCustomFormat.value = false;
        }
    }

    if (!useCustomFormat.value) {
        let html = '';
        html += `<div style="display:flex;flex-direction:row;gap:6px;align-items:center;border-bottom:1px solid ${cfgChart.value.tooltip.borderColor};margin-bottom:3px;padding-bottom:6px;"><svg viewBox="0 0 12 12" height="14" width="14"><circle data-cy="donut-tooltip-marker" cx="6" cy="6" r="6" stroke="none" fill="${tooltipMarkerColor}"/></svg><span>${datapoint.seriesName}</span></div>`;

        html += `<div>${datapoint.label}</div>`;

        html += `<div>${cfgAxes.value.x.name.text || 'x'}: ${applyDataLabel(
            cfgAxes.value.x.labels.formatter,
            datapoint.valueX,
            dataLabel({
                p: cfgAxes.value.x.labels.prefix,
                v: datapoint.valueX,
                s: cfgAxes.value.x.labels.suffix,
                r: cfgAxes.value.x.labels.rounding,
            }),
        )}</div>`;

        html += `<div>${cfgAxes.value.y.name.text || 'y'}: ${applyDataLabel(
            cfgAxes.value.y.labels.formatter,
            datapoint.valueY,
            dataLabel({
                p: cfgAxes.value.y.labels.prefix,
                v: datapoint.valueY,
                s: cfgAxes.value.y.labels.suffix,
                r: cfgAxes.value.y.labels.rounding,
            }),
        )}</div>`;

        tooltipContent.value = `<div>${html}</div>`;
    }
}

watch(
    [drawableDataset, () => cfgChart.value.tooltip, loading],
    () => {
        if (!selectedPlotId.value) return;
        const current = plotLookup.value.get(selectedPlotId.value);
        if (!current || loading.value) {
            clearSelection();
            return;
        }
        const { plot, serie, plotIndex } = current;
        selectedDatapoint.value = plot;
        activeTooltipSeriesIndex.value = serie.seriesIndex;
        activeTooltipPlotIndex.value = plotIndex;
        refreshTooltip({
            datapoint: plot,
            seriesIndex: serie.seriesIndex,
            plotIndex,
        });
        if (tooltipTriggerMode.value === 'keyboard')
            updateTooltipA11yPosition(serie.seriesIndex, plotIndex);
    },
    { flush: 'post' },
);

const dataTable = computed(() => {
    const head = [
        FINAL_CONFIG.value.table.columnNames.series,
        FINAL_CONFIG.value.table.columnNames.datapoint,
        FINAL_CONFIG.value.table.columnNames.x,
        FINAL_CONFIG.value.table.columnNames.y,
    ];

    const body = drawableDataset.value.flatMap((ds) => {
        return ds.plots.map((dp) => {
            return [
                {
                    color: dp.color,
                    name: dp.seriesName,
                },
                dp.label,
                applyDataLabel(
                    cfgAxes.value.x.labels.formatter,
                    dp.valueX,
                    dataLabel({
                        p: cfgAxes.value.x.labels.prefix,
                        v: dp.valueX,
                        s: cfgAxes.value.x.labels.suffix,
                        r: cfgAxes.value.x.labels.rounding,
                    }),
                ),
                applyDataLabel(
                    cfgAxes.value.y.labels.formatter,
                    dp.valueY,
                    dataLabel({
                        p: cfgAxes.value.y.labels.prefix,
                        v: dp.valueY,
                        s: cfgAxes.value.y.labels.suffix,
                        r: cfgAxes.value.y.labels.rounding,
                    }),
                ),
            ];
        });
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

    return {
        head,
        body,
        config,
        colNames: head,
    };
});

function generateCsv(callback = null) {
    nextTick(() => {
        const head = [
            [FINAL_CONFIG.value.table.columnNames.series],
            [FINAL_CONFIG.value.table.columnNames.datapoint],
            [FINAL_CONFIG.value.table.columnNames.x],
            [FINAL_CONFIG.value.table.columnNames.y],
        ];

        const rows = drawableDataset.value.flatMap((ds) => {
            return ds.plots.map((dp) => {
                return [[dp.seriesName], [dp.label], [dp.valueX], [dp.valueY]];
            });
        });

        const tableXls = [
            [cfgChart.value.title.text],
            [cfgChart.value.title.subtitle.text],
            head,
        ].concat(rows);

        const csvContent = createCsvContent(tableXls);

        if (!callback) {
            downloadCsv({
                csvContent,
                title: cfgChart.value.title.text || 'vue-ui-history-plot',
            });
        } else {
            callback(csvContent);
        }
    });
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

/**
 * Return the current drawable dataset.
 * The result is the internal reactive value, not a defensive copy.
 *
 * @returns The current component data; treat it as read-only.
 */
function getData() {
    return drawableDataset.value;
}

const getImage = createChartImageGetter(
    historyPlotChart,
    () => cfgChart.value.title.text,
);

const dummyTimeLabels = computed(() => scales.value.tickX);
const dummySlicer = computed(() => ({
    start: 0,
    end: scales.value.tickX.length,
}));

useTimeLabelCollision({
    timeLabelsEls: xAxisScales,
    timeLabels: dummyTimeLabels,
    slicer: dummySlicer,
    configRef: FINAL_CONFIG,
    rotationPath: ['style', 'chart', 'axes', 'x', 'labels', 'rotation'],
    autoRotatePath: [
        'style',
        'chart',
        'axes',
        'x',
        'labels',
        'autoRotate',
        'enable',
    ],
    isAutoSize: false,
    width: WIDTH,
    height: HEIGHT,
    targetClass: '.vue-ui-history-plot-x-axis-scale',
    rotation: cfgAxes.value.x.labels.autoRotate.angle,
});

const tableComponent = computed(() =>
    getTableComponent({
        config: FINAL_CONFIG,
        style: cfgChart,
        mutableConfig,
        dialog: BaseDraggableDialog,
        accordion: Accordion,
        isFullscreen,
        parent: historyPlotChart,
        maxWidth: 800,
    }),
);

watch(
    [() => mutableConfig.value.showTable, tableUnit],
    ([visible]) => {
        if (tableUnit.value)
            syncTableVisibility(visible, FINAL_CONFIG, tableUnit);
    },
    { flush: 'post' },
);

function closeTable() {
    mutableConfig.value.showTable = false;
    if (userOptionsRef.value) {
        userOptionsRef.value.setTableIconState(false);
    }
}

const svgBg = computed(() => cfgChart.value.backgroundColor);
const svgLegend = computed(() => cfgChart.value.legend);
const svgTitle = computed(() => cfgChart.value.title);

const { isCallbackImaging, isCallbackSvg, generateSvg, onGenerateImage } =
    useChartExport({
        svg: svgRef,
        title: svgTitle,
        legend: svgLegend,
        legendItems: legendSet,
        backgroundColor: svgBg,
        getSvgCallback: () => FINAL_CONFIG.value.userOptions.callbacks.svg,
        generateImage,
    });

async function copyAlt() {
    emit('copyAlt', {
        config: FINAL_CONFIG.value,
        dataset: drawableDataset.value,
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
            dataset: drawableDataset.value,
        }),
    );
}

/***************************************************************************************************
 * a11y
 **************************************************************************************************/
const a11yTable = computed(() => {
    return {
        head: dataTable.value.head,
        body: dataTable.value.body.map((row) => [
            row[0]?.name || '',
            row[1],
            row[2],
            row[3],
        ]),
        caption: FINAL_CONFIG.value.a11y.translations.tableCaption,
        notice: FINAL_CONFIG.value.a11y.translations.tableAvailable,
    };
});

function getKeyboardSerieIndex(seriesIndex) {
    return keyboardDataset.value.findIndex(
        (ds) => ds.seriesIndex === seriesIndex,
    );
}

function clearSelection(notify = false) {
    if (
        notify &&
        selectedDatapoint.value &&
        FINAL_CONFIG.value.events.datapointLeave
    ) {
        FINAL_CONFIG.value.events.datapointLeave({
            datapoint: {
                ...selectedDatapoint.value,
                plotIndex: activeTooltipPlotIndex.value,
                seriesIndex: activeTooltipSeriesIndex.value,
            },
            seriesIndex: activeTooltipSeriesIndex.value,
        });
    }
    selectedPlotId.value = null;
    activeTooltipSeriesIndex.value = null;
    activeTooltipPlotIndex.value = null;
    tooltipTriggerMode.value = 'pointer';
    isTooltip.value = false;
    selectedDatapoint.value = null;
    dataTooltipSlot.value = null;
    tooltipContent.value = '';
    useCustomFormat.value = false;
}
function clearKeyboardSelection() {
    clearSelection(true);
}

function onSvgFocus() {
    clearSelection();
    isFocus.value = true;
}

function onSvgBlur() {
    clearKeyboardSelection();
    isFocus.value = false;
}

function getWrappedPlotIndex(serie, plotIndex) {
    if (!serie?.plots?.length) return null;
    const len = serie.plots.length;
    return ((plotIndex % len) + len) % len;
}

function getNextKeyboardTarget({ seriesIndex, plotIndex, direction }) {
    if (!keyboardDataset.value.length) return null;

    const currentKeyboardSerieIndex = getKeyboardSerieIndex(seriesIndex);
    if (currentKeyboardSerieIndex === -1) return null;

    if (direction === 'up' || direction === 'down') {
        const serie = keyboardDataset.value[currentKeyboardSerieIndex];
        if (!serie?.plots?.length) return null;
        const delta = direction === 'up' ? -1 : 1;
        const nextPlotIndex = getWrappedPlotIndex(serie, plotIndex + delta);
        return {
            seriesIndex: serie.seriesIndex,
            plotIndex: nextPlotIndex,
        };
    }

    if (direction === 'left' || direction === 'right') {
        const delta = direction === 'left' ? -1 : 1;
        const nextKeyboardSerieIndex =
            (((currentKeyboardSerieIndex + delta) %
                keyboardDataset.value.length) +
                keyboardDataset.value.length) %
            keyboardDataset.value.length;
        const nextSerie = keyboardDataset.value[nextKeyboardSerieIndex];
        if (!nextSerie?.plots?.length) return null;

        const nextPlotIndex = Math.min(plotIndex, nextSerie.plots.length - 1);

        return {
            seriesIndex: nextSerie.seriesIndex,
            plotIndex: nextPlotIndex,
        };
    }

    return null;
}

function onSvgKeydown(event) {
    if (!svgRef.value || isAnnotator.value || loading.value) return;
    if (document.activeElement !== svgRef.value) return;
    if (!keyboardDataset.value.length) return;

    const isLeftKey = event.key === 'ArrowLeft';
    const isRightKey = event.key === 'ArrowRight';
    const isUpKey = event.key === 'ArrowUp';
    const isDownKey = event.key === 'ArrowDown';
    const isActivationKey = event.key === 'Enter' || event.key === ' ';
    const isEscapeKey = event.key === 'Escape';

    if (
        !isLeftKey &&
        !isRightKey &&
        !isUpKey &&
        !isDownKey &&
        !isActivationKey &&
        !isEscapeKey
    )
        return;

    event.preventDefault();
    event.stopPropagation();

    if (isEscapeKey) {
        clearKeyboardSelection();
        return;
    }

    if (isActivationKey) {
        if (
            activeTooltipSeriesIndex.value === null ||
            activeTooltipPlotIndex.value === null
        )
            return;

        const serie = keyboardDataset.value.find(
            (ds) => ds.seriesIndex === activeTooltipSeriesIndex.value,
        );
        const plot = serie?.plots?.[activeTooltipPlotIndex.value];
        if (!plot) return;

        selectDatapoint({
            datapoint: plot,
            plotIndex: activeTooltipPlotIndex.value,
            seriesIndex: activeTooltipSeriesIndex.value,
        });
        return;
    }

    let nextTarget = null;

    if (
        activeTooltipSeriesIndex.value === null ||
        activeTooltipPlotIndex.value === null
    ) {
        const firstSerie = keyboardDataset.value[0];
        if (!firstSerie?.plots?.length) return;

        nextTarget = {
            seriesIndex: firstSerie.seriesIndex,
            plotIndex: 0,
        };
    } else if (isUpKey) {
        nextTarget = getNextKeyboardTarget({
            seriesIndex: activeTooltipSeriesIndex.value,
            plotIndex: activeTooltipPlotIndex.value,
            direction: 'up',
        });
    } else if (isDownKey) {
        nextTarget = getNextKeyboardTarget({
            seriesIndex: activeTooltipSeriesIndex.value,
            plotIndex: activeTooltipPlotIndex.value,
            direction: 'down',
        });
    } else if (isLeftKey) {
        nextTarget = getNextKeyboardTarget({
            seriesIndex: activeTooltipSeriesIndex.value,
            plotIndex: activeTooltipPlotIndex.value,
            direction: 'left',
        });
    } else if (isRightKey) {
        nextTarget = getNextKeyboardTarget({
            seriesIndex: activeTooltipSeriesIndex.value,
            plotIndex: activeTooltipPlotIndex.value,
            direction: 'right',
        });
    }

    if (!nextTarget) return;

    const serie = keyboardDataset.value.find(
        (ds) => ds.seriesIndex === nextTarget.seriesIndex,
    );
    const plot = serie?.plots?.[nextTarget.plotIndex];
    if (!plot) return;

    useTooltip({
        datapoint: plot,
        plotIndex: nextTarget.plotIndex,
        seriesIndex: nextTarget.seriesIndex,
        triggerMode: 'keyboard',
    });
}

defineExpose({
    getData,
    getImage,
    generatePdf,
    generateCsv,
    generateImage,
    generateSvg,
    hideSeries,
    showSeries,
    toggleTable,
    toggleTooltip,
    toggleAnnotator,
    toggleFullscreen,
    copyAlt,
});
// Label metrics update together after rendering, without depending on hover.
watch(
    () => [
        svg.value,
        sizes.value,
        cfgAxes.value,
        cfgChart.value,
        FINAL_CONFIG.value.style.fontFamily,
        props.dataset,
        responsiveSizeReady.value,
        yAxisScales.value,
        xAxisScales.value,
        xAxisLabel.value,
        yAxisLabel.value,
    ],
    measureLabelLayout,
    { flush: 'post', deep: true },
);
</script>

<template>
    <div
        :id="`history_plot_${uid}`"
        ref="historyPlotChart"
        :class="{
            'vue-data-ui-component': true,
            'vue-ui-history-plot': true,
            'vue-data-ui-wrapper-fullscreen': isFullscreen,
        }"
        :style="`background:${cfgChart.backgroundColor};color:${cfgChart.color};font-family:${FINAL_CONFIG.style.fontFamily}; position: relative; ${FINAL_CONFIG.responsive ? 'height: 100%' : ''}`"
        @mouseenter="() => setUserOptionsVisibility(true)"
        @mouseleave="() => setUserOptionsVisibility(false)"
    >
        <div :id="`chart-instructions-${uid}`" class="sr-only">
            <p>{{ FINAL_CONFIG.a11y.translations.keyboardNavigation }}</p>
        </div>

        <A11yDataTable
            v-if="FINAL_CONFIG.a11y.includeTable && a11yTable.body.length"
            :uid="uid"
            :head="a11yTable.head"
            :body="a11yTable.body"
            :caption="a11yTable.caption"
            :notice="a11yTable.notice"
        />

        <slot name="userConfig" />

        <PenAndPaper
            v-bind="getAnnotatorProps(FINAL_CONFIG.userOptions.annotator)"
            v-if="FINAL_CONFIG.userOptions.buttons.annotator"
            :svgRef="svgRef"
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

        <div
            ref="noTitle"
            v-if="hasOptionsNoTitle"
            class="vue-data-ui-no-title-space"
            :style="`height:36px; width: 100%;background:transparent`"
        />

        <div
            ref="chartTitle"
            class="vue-ui-xy-title"
            v-if="cfgChart.title.text"
            :style="`font-family:${FINAL_CONFIG.style.fontFamily}`"
        >
            <Title
                :config="{
                    title: {
                        cy: 'history-plot-div-title',
                        ...cfgChart.title,
                    },
                    subtitle: {
                        cy: 'history-plot-div-subtitle',
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
                FINAL_CONFIG.userOptions.show &&
                isDataset &&
                (keepUserOptionState ? true : userOptionsVisible)
            "
            :backgroundColor="cfgChart.backgroundColor"
            :color="cfgChart.color"
            :isPrinting="isPrinting"
            :isImaging="isImaging"
            :uid="uid"
            :hasTooltip="
                cfgChart.tooltip.show &&
                FINAL_CONFIG.userOptions.buttons.tooltip
            "
            :hasLabel="false"
            :isFullscreen="isFullscreen"
            :chartElement="historyPlotChart"
            v-bind="
                getUserOptionsProps(
                    FINAL_CONFIG.userOptions,
                    'pdf csv img svg table fullscreen altCopy annotator',
                )
            "
            :isTooltip="mutableConfig.showTooltip"
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
                    'menuIcon optionTooltip optionPdf optionCsv optionImg optionSvg optionTable optionFullscreen optionAnnotator optionAltCopy custom-menu-before custom-menu-after',
                )"
                #[slotName]="slotProps"
            >
                <slot
                    :name="slotName"
                    v-bind="getUserOptionSlotProps(slotName, slotProps)"
                />
            </template>
        </UserOptions>

        <div style="position: relative">
            <svg
                ref="svgRef"
                :xmlns="XMLNS"
                :viewBox="`0 0 ${svg.width < 0 ? 0.1 : svg.width} ${svg.height < 0 ? 0.1 : svg.height}`"
                :style="`max-width:100%;overflow:visible;background:transparent;color:${cfgChart.color};visibility:${labelLayoutReady ? 'visible' : 'hidden'}`"
                :aria-describedby="`chart-instructions-${uid}`"
                tabindex="0"
                @focus="onSvgFocus"
                @blur="onSvgBlur"
                @keydown="onSvgKeydown"
            >
                <PackageVersion />
                <slot
                    name="svg-underlayer"
                    :svg="{
                        ...svg,
                        drawingArea,
                        isPrintingImg:
                            isPrinting || isImaging || isCallbackImaging,
                        isPrintingSvg: isCallbackSvg,
                    }"
                />

                <!-- BACKGROUND SLOT -->
                <foreignObject
                    v-if="$slots['chart-background']"
                    :x="drawingArea.left"
                    :y="drawingArea.top"
                    :width="drawingArea.width <= 0 ? 10 : drawingArea.width"
                    :height="drawingArea.height <= 0 ? 10 : drawingArea.height"
                    :style="{
                        pointerEvents: 'none',
                    }"
                >
                    <slot name="chart-background" />
                </foreignObject>

                <defs v-if="cfgPlots.gradient.show || hasTemperatureGradients">
                    <template v-if="cfgPlots.gradient.show">
                        <DefGrad
                            t="radial"
                            v-for="(ds, i) in drawableDataset"
                            :key="`gradient_${i}_${uid}`"
                            :id="`gradient_${i}_${uid}`"
                            fy="30%"
                            :stops="[
                                [
                                    '10%',
                                    lightenHexColor(
                                        ds.color,
                                        cfgPlots.gradient.intensity / 100,
                                    ),
                                    1,
                                ],
                                ['90%', darkenHexColor(ds.color, 0.1), 1],
                                ['100%', ds.color, 1],
                            ]"
                        />
                    </template>

                    <template
                        v-for="ds in drawableDataset"
                        :key="`temperature_grad_history_template_${ds.seriesIndex}_${uid}`"
                    >
                        <template
                            v-if="
                                cfgPlots.gradient.show &&
                                usePlotTemperatureColors(ds)
                            "
                        >
                            <DefGrad
                                t="radial"
                                v-for="plot in ds.plots"
                                :key="`temperature_plot_grad_history_${ds.seriesIndex}_${plot.id}_${uid}`"
                                :id="getTemperaturePlotGradientId(ds, plot)"
                                fy="30%"
                                :stops="[
                                    [
                                        '10%',
                                        lightenHexColor(
                                            getTemperaturePlotColor(ds, plot),
                                            cfgPlots.gradient.intensity / 100,
                                        ),
                                        1,
                                    ],
                                    [
                                        '90%',
                                        darkenHexColor(
                                            getTemperaturePlotColor(ds, plot),
                                            0.1,
                                        ),
                                        1,
                                    ],
                                    [
                                        '100%',
                                        getTemperaturePlotColor(ds, plot),
                                        1,
                                    ],
                                ]"
                            />
                        </template>

                        <linearGradient
                            v-if="hasTemperatureColors(ds)"
                            :id="`temperature_grad_history_${ds.seriesIndex}_${uid}`"
                            gradientUnits="userSpaceOnUse"
                            :x1="getTemperatureGradientCoordinates(ds).x1"
                            :y1="getTemperatureGradientCoordinates(ds).y1"
                            :x2="getTemperatureGradientCoordinates(ds).x2"
                            :y2="getTemperatureGradientCoordinates(ds).y2"
                        >
                            <stop
                                v-for="(
                                    color, colorIndex
                                ) in ds.temperatureColors"
                                :key="`temperature_grad_history_stop_${ds.seriesIndex}_${colorIndex}_${uid}`"
                                :stop-color="color"
                                :offset="
                                    ds.temperatureColors.length === 1
                                        ? '0%'
                                        : setGradientOffset(
                                              colorIndex,
                                              ds.temperatureColors.length,
                                          )
                                "
                            />
                        </linearGradient>
                    </template>
                </defs>

                <!-- GRID -->
                <!-- SCALE Y -->
                <g v-if="cfgGrid.verticalLines.show">
                    <line
                        data-cy="grid-line-vertical"
                        v-for="line in scales.tickX"
                        :x1="line.x"
                        :x2="line.x"
                        :y1="line.y1"
                        :y2="line.y2"
                        :stroke="cfgGrid.verticalLines.stroke"
                        :stroke-width="cfgGrid.verticalLines.strokeWidth"
                        stroke-linecap="round"
                    />
                </g>

                <g v-if="cfgAxes.y.labels.show">
                    <line
                        v-for="labelY in scales.tickY"
                        :stroke="cfgGrid.verticalLines.stroke"
                        :stroke-width="cfgGrid.verticalLines.strokeWidth"
                        stroke-linecap="round"
                        :x1="drawingArea.left - 5"
                        :x2="drawingArea.left"
                        :y1="labelY.y"
                        :y2="labelY.y"
                    />
                </g>

                <!-- Y AXIS LABELS -->
                <g v-if="cfgAxes.y.labels.show" ref="yAxisScales">
                    <text
                        data-cy="y-axis-label"
                        v-for="labelY in scales.tickY"
                        :x="
                            drawingArea.left +
                            cfgAxes.y.labels.offsetX -
                            4 -
                            cfgPlots.radius
                        "
                        :y="labelY.y + sizes.yAxisLabels / 3"
                        :fill="cfgAxes.y.labels.color"
                        :font-size="sizes.yAxisLabels"
                        text-anchor="end"
                    >
                        {{
                            applyDataLabel(
                                cfgAxes.y.labels.formatter,
                                labelY.value,
                                dataLabel({
                                    p: cfgAxes.y.labels.prefix,
                                    v: labelY.value,
                                    s: cfgAxes.y.labels.suffix,
                                    r: cfgAxes.y.labels.rounding,
                                }),
                            )
                        }}
                    </text>
                </g>

                <!-- Y AXIS NAME -->
                <text
                    ref="yAxisLabel"
                    data-cy="axis-name-y"
                    v-if="cfgAxes.y.name.text"
                    :transform="`translate(${sizes.yAxisName}, ${svg.height / 2 + cfgAxes.y.name.offsetY}), rotate(-90)`"
                    :font-size="sizes.yAxisName"
                    :fill="cfgAxes.y.name.color"
                    :font-weight="cfgAxes.y.name.bold ? 'bold' : 'normal'"
                    text-anchor="middle"
                >
                    {{ cfgAxes.y.name.text }}
                </text>

                <!-- SCALE X -->
                <g v-if="cfgGrid.horizontalLines.show">
                    <line
                        data-cy="grid-line-horizontal"
                        v-for="line in scales.tickY"
                        :x1="line.x1"
                        :x2="line.x2"
                        :y1="line.y"
                        :y2="line.y"
                        :stroke="cfgGrid.horizontalLines.stroke"
                        :stroke-width="cfgGrid.horizontalLines.strokeWidth"
                        stroke-linecap="round"
                    />
                </g>

                <g v-if="cfgAxes.x.labels.show">
                    <line
                        v-for="labelX in scales.tickX"
                        :stroke="cfgGrid.verticalLines.stroke"
                        :stroke-width="cfgGrid.verticalLines.strokeWidth"
                        stroke-linecap="round"
                        :x1="labelX.x"
                        :x2="labelX.x"
                        :y1="drawingArea.bottom"
                        :y2="drawingArea.bottom + 5"
                    />
                </g>

                <!-- X AXIS LABELS -->
                <g v-if="cfgAxes.x.labels.show" ref="xAxisScales">
                    <text
                        class="vue-ui-history-plot-x-axis-scale"
                        data-cy="x-axis-label"
                        v-for="labelX in scales.tickX"
                        :transform="`translate(${labelX.x}, ${drawingArea.bottom + cfgAxes.x.labels.offsetY + sizes.xAxisLabels + cfgPlots.radius}), rotate(${cfgAxes.x.labels.rotation})`"
                        :fill="cfgAxes.x.labels.color"
                        :font-size="sizes.xAxisLabels"
                        :text-anchor="
                            cfgAxes.x.labels.rotation > 0
                                ? 'start'
                                : cfgAxes.x.labels.rotation < 0
                                  ? 'end'
                                  : 'middle'
                        "
                    >
                        {{
                            applyDataLabel(
                                cfgAxes.x.labels.formatter,
                                labelX.value,
                                dataLabel({
                                    p: cfgAxes.x.labels.prefix,
                                    v: labelX.value,
                                    s: cfgAxes.x.labels.suffix,
                                    r: cfgAxes.x.labels.rounding,
                                }),
                            )
                        }}
                    </text>
                </g>

                <!-- X AXIS NAME -->
                <text
                    ref="xAxisLabel"
                    data-cy="axis-name-x"
                    v-if="cfgAxes.x.name.text"
                    :x="svg.width / 2 + cfgAxes.x.name.offsetX"
                    :y="svg.height"
                    :font-size="sizes.xAxisName"
                    :fill="cfgAxes.x.name.color"
                    :font-weight="cfgAxes.x.name.bold ? 'bold' : 'normal'"
                    text-anchor="middle"
                >
                    {{ cfgAxes.x.name.text }}
                </text>

                <!-- X AXIS -->
                <line
                    data-cy="x-axis"
                    v-if="cfgGrid.xAxis.show"
                    :x1="drawingArea.left"
                    :x2="drawingArea.left + drawingArea.width"
                    :y1="drawingArea.bottom"
                    :y2="drawingArea.bottom"
                    :stroke="cfgGrid.xAxis.stroke"
                    :stroke-width="cfgGrid.xAxis.strokeWidth"
                    stroke-linecap="round"
                />

                <!-- Y AXIS -->
                <line
                    data-cy="y-axis"
                    v-if="cfgGrid.yAxis.show"
                    :x1="drawingArea.left"
                    :x2="drawingArea.left"
                    :y1="drawingArea.top"
                    :y2="drawingArea.bottom"
                    :stroke="cfgGrid.yAxis.stroke"
                    :stroke-width="cfgGrid.yAxis.strokeWidth"
                    stroke-linecap="round"
                />

                <!-- PLOTS & PATHS -->
                <g
                    v-for="ds in drawableDatasetWithActiveLast"
                    :key="`history_plot_serie_${ds.seriesIndex}_${uid}`"
                >
                    <!-- PATHS -->
                    <g
                        v-if="cfgChart.paths.show"
                        :style="{
                            opacity: getSeriesOpacity(ds.seriesIndex),
                        }"
                    >
                        <path
                            :class="{
                                'vue-data-ui-transition':
                                    transitionEnabled && !labelLayoutSettling,
                            }"
                            data-cy="datapoint-path-wrapper"
                            :d="ds.path"
                            :stroke="cfgChart.backgroundColor"
                            :stroke-width="cfgChart.paths.strokeWidth + 4"
                            fill="none"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        />
                        <path
                            :class="{
                                'vue-data-ui-transition':
                                    transitionEnabled && !labelLayoutSettling,
                            }"
                            data-cy="datapoint-path"
                            :d="ds.path"
                            :stroke="getPathStroke(ds)"
                            :stroke-width="cfgChart.paths.strokeWidth"
                            fill="none"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        />
                    </g>

                    <!-- PLOTS -->
                    <!-- Underlayers to hide track when !!selectedDatapoint -->
                    <circle
                        data-cy="datapoint-plot-underlayer"
                        v-for="plot in ds.plots"
                        :cx="plot.x"
                        :cy="plot.y"
                        :fill="cfgChart.backgroundColor"
                        :r="sizes.plots"
                        stroke="none"
                        :class="{
                            'vue-data-ui-transition':
                                transitionEnabled && !labelLayoutSettling,
                        }"
                    />
                    <!-- Visible plots -->
                    <circle
                        data-cy="datapoint-plot"
                        v-for="plot in ds.plots"
                        :cx="plot.x"
                        :cy="plot.y"
                        :fill="getPlotFillColor(ds, plot, ds.gradientIndex)"
                        :r="sizes.plots"
                        :stroke="cfgPlots.stroke"
                        :stroke-width="cfgPlots.strokeWidth"
                        :class="{
                            'vue-data-ui-transition':
                                transitionEnabled && !labelLayoutSettling,
                        }"
                        :style="{
                            opacity: getSeriesOpacity(ds.seriesIndex),
                        }"
                    />

                    <g v-if="cfgPlots.labels.show">
                        <g v-for="(plot, i) in ds.plots" :key="`plab_${i}`">
                            <!-- SINGLE LINE -->
                            <text
                                v-if="!String(plot.label).includes('\n')"
                                data-cy="datapoint-label"
                                :class="{
                                    'vue-data-ui-transition':
                                        transitionEnabled &&
                                        !labelLayoutSettling,
                                }"
                                :transform="`translate(${plot.x + cfgPlots.labels.offsetX}, ${plot.y + cfgPlots.labels.offsetY + sizes.plots + sizes.labels})`"
                                :font-size="sizes.labels"
                                :fill="cfgPlots.labels.color"
                                :font-weight="
                                    cfgPlots.labels.bold ? 'bold' : 'normal'
                                "
                                text-anchor="middle"
                                :style="{
                                    opacity: getSeriesOpacity(ds.seriesIndex),
                                }"
                            >
                                {{ plot.label }}
                            </text>

                            <!-- MULTILINE -->
                            <text
                                v-else
                                data-cy="datapoint-label"
                                :class="{
                                    'vue-data-ui-transition':
                                        transitionEnabled &&
                                        !labelLayoutSettling,
                                }"
                                :transform="`translate(${plot.x + cfgPlots.labels.offsetX}, ${plot.y + cfgPlots.labels.offsetY + sizes.plots + sizes.labels})`"
                                :font-size="sizes.labels"
                                :fill="cfgPlots.labels.color"
                                :font-weight="
                                    cfgPlots.labels.bold ? 'bold' : 'normal'
                                "
                                text-anchor="middle"
                                :style="{
                                    opacity: getSeriesOpacity(ds.seriesIndex),
                                }"
                                v-html="
                                    createTSpansFromLineBreaksOnX({
                                        content: String(plot.label),
                                        fontSize: sizes.labels,
                                        fill: cfgPlots.labels.color,
                                        x: 0,
                                        y: 0,
                                    })
                                "
                            />
                        </g>
                    </g>

                    <!-- INDEX LABELS -->
                    <g v-if="cfgPlots.indexLabels.show">
                        <text
                            data-cy="datapoint-index-label"
                            v-for="(label, n) in ds.plots"
                            :key="`lab_${n}`"
                            :class="{
                                'vue-data-ui-transition':
                                    transitionEnabled && !labelLayoutSettling,
                            }"
                            :transform="`translate(${label.x + cfgPlots.indexLabels.offsetX}, ${label.y + cfgPlots.indexLabels.offsetY + sizes.indexLabels / 3})`"
                            :font-size="sizes.indexLabels"
                            :font-weight="
                                cfgPlots.indexLabels.bold ? 'bold' : 'normal'
                            "
                            :fill="getIndexLabelFillColor(ds, label)"
                            text-anchor="middle"
                            :style="{
                                opacity: getSeriesOpacity(ds.seriesIndex),
                            }"
                        >
                            {{ cfgPlots.indexLabels.startAtZero ? n : n + 1 }}
                        </text>
                    </g>
                </g>

                <!-- TOOLTIP TRAPS -->
                <g
                    v-for="ds in drawableDatasetWithActiveLast"
                    :key="`history_plot_trap_serie_${ds.seriesIndex}_${uid}`"
                >
                    <circle
                        data-cy="tooltip-trap"
                        v-for="(plot, i) in ds.plots"
                        :cx="plot.x"
                        :cy="plot.y"
                        fill="transparent"
                        :r="sizes.plots"
                        stroke="none"
                        @mouseenter="
                            useTooltip({
                                datapoint: plot,
                                plotIndex: i,
                                seriesIndex: ds.seriesIndex,
                                triggerMode: 'pointer',
                            })
                        "
                        @mouseleave="
                            onTrapLeave({
                                datapoint: plot,
                                plotIndex: i,
                                seriesIndex: ds.seriesIndex,
                            })
                        "
                        @click="
                            selectDatapoint({
                                datapoint: plot,
                                plotIndex: i,
                                seriesIndex: ds.seriesIndex,
                            })
                        "
                    />
                </g>
                <slot
                    name="svg"
                    :svg="{
                        ...svg,
                        drawingArea,
                        isPrintingImg:
                            isPrinting || isImaging || isCallbackImaging,
                        isPrintingSvg: isCallbackSvg,
                    }"
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
            v-if="readyTeleport && (cfgChart.legend.show || $slots.legend)"
            :to="
                cfgChart.legend.position === 'top'
                    ? `#legend-top-${uid}`
                    : `#legend-bottom-${uid}`
            "
        >
            <div ref="chartLegend">
                <slot name="legend" v-bind:legend="legendSet">
                    <Legend
                        v-if="cfgChart.legend.show && isDataset"
                        :legendSet="legendSet"
                        :config="legendConfig"
                        :isCursorPointer="isCursorPointer"
                        @clickMarker="
                            ({ legend }) => {
                                segregate(legend.seriesIndex);
                            }
                        "
                    >
                        <template #item="{ legend, index }">
                            <div
                                :data-cy="`legend-item-${index}`"
                                @click="legend.segregate()"
                                :style="`opacity:${segregated.includes(legend.seriesIndex) ? 0.5 : 1}`"
                            >
                                {{ legend.name }}
                            </div>
                        </template>

                        <template #legendToggle>
                            <BaseLegendToggle
                                v-if="
                                    legendSet.length > 2 &&
                                    cfgChart.legend.selectAllToggle.show &&
                                    !loading
                                "
                                :backgroundColor="
                                    cfgChart.legend.selectAllToggle
                                        .backgroundColor
                                "
                                :color="cfgChart.legend.selectAllToggle.color"
                                :fontSize="cfgChart.legend.fontSize"
                                :checked="segregated.length > 0"
                                :isCursorPointer="isCursorPointer"
                                @toggle="toggleLegend"
                            />
                        </template>
                    </Legend>
                </slot>
            </div>
        </Teleport>

        <div v-if="$slots.source" ref="source" dir="auto">
            <slot name="source" />
        </div>

        <Tooltip
            :teleportTo="cfgChart.tooltip.teleportTo"
            :show="mutableConfig.showTooltip && isTooltip"
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
            :parent="historyPlotChart"
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

        <component
            v-if="isDataset && FINAL_CONFIG.userOptions.buttons.table"
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
                    @click="generateCsv(FINAL_CONFIG.userOptions.callbacks.csv)"
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
                        {{ td.name || td }}
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
.vue-ui-history-plot * {
    transition: unset;
}

.vue-ui-history-plot {
    position: relative;
    user-select: none;
    width: 100%;
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

.vue-data-ui-transition {
    transition: all 0.2s ease-in-out;
}

/* Fullscreen fitting changes label geometry repeatedly while settling.
   Keep visual fades without interpolating font sizes or text positions. */
.vue-ui-history-plot[data-vdui-fullscreen-layout] text.vue-data-ui-transition {
    transition-property: fill, opacity;
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
