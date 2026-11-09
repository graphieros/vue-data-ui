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
    shallowRef,
    toRefs,
    watch,
} from 'vue';
import {
    stringifyChartConfig as stringifyStructuralConfig,
    applyDataLabel,
    calculateNiceScale,
    convertColorToHex,
    convertCustomPalette,
    createCsvContent,
    createSmoothPath,
    createStraightPath,
    createTSpansFromLineBreaksOnX,
    createUid,
    dataLabel,
    downloadCsv,
    error,
    getMissingDatasetAttributes,
    getPathLengthFromCoordinates,
    isFunction,
    objectIsEmpty,
    palette,
    setOpacity,
    svgToClientCoords,
    translateSize,
    treeShake,
    XMLNS,
} from '../lib';
import { COMMON_RULES, useHints } from '../useHints';
import { useConfig } from '../useConfig';
import { useSvgLabelLayout } from '../useSvgLabelLayout';
import { usePrinter } from '../usePrinter';
import { useLoading } from '../useLoading';
import { useResponsive } from '../useResponsive';

import { useChartExport } from '../useChartExport';
import { useTransitions } from '../useTransitions.js';
import { useUserOptionState } from '../useUserOptionState';
import { useChartAccessibility } from '../useChartAccessibility';
import { useTimeLabelCollision } from '../useTimeLabelCollider';
import themes from '../themes/vue_ui_parallel_coordinate_plot.json';
import Title from '../atoms/Title.vue'; // Must be ready in responsive mode
import Legend from '../atoms/Legend.vue'; // Must be ready in responsive mode
import Shape from '../atoms/Shape.vue';
import BaseScanner from '../atoms/BaseScanner.vue';
import A11yDataTable from '../atoms/A11yDataTable.vue';
import BaseLegendToggle from '../atoms/BaseLegendToggle.vue';

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

const { vue_ui_parallel_coordinate_plot: DEFAULT_CONFIG } = useConfig();

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

const isDataset = computed(() => !!props.dataset?.length);

const step = ref(0);
const pcpChart = ref(null);
const chartTitle = ref(null);
const chartLegend = ref(null);
const source = ref(null);
const noTitle = ref(null);
const titleStep = ref(0);
const legendStep = ref(0);
const tableStep = ref(0);
const readyTeleport = ref(false);
const tableUnit = ref(null);
const userOptionsRef = ref(null);
const xAxisLabels = ref(null);

const activeA11yItemIndex = ref(null); // a11y
const tooltipA11yPosition = ref({ x: 0, y: 0 }); // a11y
const tooltipTriggerMode = ref('pointer'); // a11y
const isFocus = ref(false); // a11y

const uid = ref(createUid());
const isFullscreen = ref(false);
function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
}

const FINAL_CONFIG = ref(prepareConfig());
const cfgUserOptions = computed(() => FINAL_CONFIG.value.userOptions);
const cfgYAxisLabels = computed(
    () => FINAL_CONFIG.value.style.chart.yAxis.labels,
);
const cfgTooltip = computed(() => FINAL_CONFIG.value.style.chart.tooltip);
const cfgChart = computed(() => FINAL_CONFIG.value.style.chart);

const { transitionEnabled } = useTransitions({
    config: () => FINAL_CONFIG.value.transitions,
    dataset: () => props.dataset,
});

useHints({
    config: () => FINAL_CONFIG.value,
    dataset: () => props.dataset,
    component: 'VueUiParallelCoordinatePlot',
    rules: [
        COMMON_RULES.emptyArray,
        {
            test: (dataset) => dataset.length > 10,
            message: [
                '👀 There are > 10 series. Consider:',
                '',
                '▶️ Using filters, to show less series at the same time and make the chart more readable.',
            ],
        },
        {
            test: (dataset) =>
                dataset.some((s) =>
                    (s?.series ?? []).some(
                        (_s) => (_s?.values ?? []).length > 15,
                    ),
                ),
            message: [
                '👀 There are > 15 axes, which can make the chart hard to read. Consider:',
                '',
                '▶️ Using filters, to allow users to select a maximum set of metrics.',
            ],
        },
        {
            test: (dataset) => dataset.some((s) => s?.series?.length > 5),
            message: [
                '👀 Some series have > 5 datapoints. Consider:',
                '',
                '▶️ Using filters, to allow users to select a maximum set of metrics.',
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
            useCssAnimation: false,
            userOptions: { show: false },
            table: { show: false },
            style: {
                chart: {
                    backgroundColor: '#99999930',
                    legend: {
                        show: true,
                        backgroundColor: 'transparent',
                    },
                    yAxis: {
                        stroke: '#6A6A6A',
                        labels: {
                            showAxisNames: false,
                            axisNames: [],
                            ticks: {
                                color: '#6A6A6A',
                            },
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
    skeletonDataset: props.config?.skeletonDataset ?? [
        {
            name: '',
            shape: 'circle',
            color: 'transparent',
            series: [
                {
                    name: '',
                    values: [1, 10, 100, 1000],
                },
            ],
        },
        {
            name: '',
            shape: 'circle',
            color: '#CACACA',
            series: [
                {
                    name: '',
                    values: [0.2, 3, 50, 800],
                },
            ],
        },
        {
            name: '',
            shape: 'circle',
            color: 'transparent',
            series: [
                {
                    name: '',
                    values: [0, 0, 0, 0],
                },
            ],
        },
    ],
    skeletonConfig: treeShake({
        defaultConfig: FINAL_CONFIG.value,
        userConfig: skeletonConfig.value,
    }),
});

const { userOptionsVisible, setUserOptionsVisibility, keepUserOptionState } =
    useUserOptionState({ config: FINAL_CONFIG.value });
const { svgRef } = useChartAccessibility({
    config: cfgChart.value.title,
});

function prepareConfig() {
    return resolveChartConfigWithPalette(props.config, DEFAULT_CONFIG, themes);
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
            FINAL_CONFIG.value.style.chart.tooltip =
                preparedConfig.style.chart.tooltip;

            mutableConfig.value.showTooltip =
                FINAL_CONFIG.value.style.chart.tooltip.show;

            return;
        }

        if (!loading.value) {
            FINAL_CONFIG.value = preparedConfig;
        }
        userOptionsVisible.value =
            !FINAL_CONFIG.value.userOptions.showOnChartHover;
        titleStep.value += 1;
        tableStep.value += 1;
        legendStep.value += 1;

        // Reset mutable config
        mutableConfig.value.dataLabels.show =
            cfgYAxisLabels.value.datapoints.show;
        mutableConfig.value.showTable = FINAL_CONFIG.value.table.show;
        mutableConfig.value.showTooltip = cfgTooltip.value.show;
    },
    { deep: true },
);

const resizeObserver = shallowRef(null);
let chartDisposed = false;

const responsiveSizeReady = ref(false);
let resizeFrame = 0;

onMounted(() => {
    readyTeleport.value = true;
    prepareChart();
});

const debug = computed(() => FINAL_CONFIG.value.debug);

function prepareChart() {
    if (objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiParallelCoordinatePlot',
            type: 'dataset',
            debug: debug.value,
        });
    } else {
        props.dataset.forEach((ds, i) => {
            getMissingDatasetAttributes({
                datasetObject: ds,
                requiredAttributes: ['name', 'series'],
            }).forEach((attr) => {
                error({
                    componentName: 'VueUiParallelCoordinatePlot',
                    type: 'datasetSerieAttribute',
                    property: attr,
                    index: i,
                    debug: debug.value,
                });
            });
        });
    }

    updateChartSizing();
}

function makeChartDimensions(
    width = cfgChart.value.width,
    height = cfgChart.value.height,
    relator = null,
) {
    const dimensions = { width, height };
    const sizes = [
        ['plotSize', cfgChart.value.plots.radius, 2],
        ['ticksFontSize', cfgYAxisLabels.value.ticks.fontSize, 10],
        ['datapointFontSize', cfgYAxisLabels.value.datapoints.fontSize, 10],
        ['axisNameFontSize', cfgYAxisLabels.value.axisNamesFontSize, 12],
    ];
    for (const [key, source, threshold] of sizes) {
        dimensions[key] =
            relator !== null && FINAL_CONFIG.value.responsiveProportionalSizing
                ? translateSize({
                      relator,
                      adjuster: 600,
                      source,
                      threshold,
                      fallback: threshold,
                  })
                : source;
    }
    return dimensions;
}

function stopResponsive() {
    cancelAnimationFrame(resizeFrame);
    resizeObserver.value?.disconnect();
    resizeObserver.value = null;
}

function updateChartSizing() {
    stopResponsive();
    if (chartDisposed) return;
    responsiveSizeReady.value = false;
    if (!FINAL_CONFIG.value.responsive) {
        chartDimensions.value = makeChartDimensions();
        return;
    }
    if (!pcpChart.value) return;
    const handleResize = () => {
        if (chartDisposed || !FINAL_CONFIG.value.responsive) return;
        cancelAnimationFrame(resizeFrame);
        resizeFrame = requestAnimationFrame(() => {
            const { width, height } = useResponsive({
                chart: pcpChart.value,
                title: cfgChart.value.title.text ? chartTitle.value : null,
                legend: cfgChart.value.legend.show ? chartLegend.value : null,
                source: source.value,
                noTitle: noTitle.value,
            });
            chartDimensions.value = makeChartDimensions(
                width,
                height - 12,
                Math.min(width, height),
            );
            responsiveSizeReady.value = true;
        });
    };
    resizeObserver.value = new ResizeObserver(handleResize);
    resizeObserver.value.observe(pcpChart.value.parentNode);
    handleResize();
}

onBeforeUnmount(() => {
    chartDisposed = true;
    stopResponsive();
});

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `pcp_${uid.value}`,
    fileName: cfgChart.value.title.text || 'vue-ui-parallel-coordinate-plot',
    options: FINAL_CONFIG.value.userOptions.print,
});

const hasOptionsNoTitle = computed(() => {
    return FINAL_CONFIG.value.userOptions.show && !cfgChart.value.title.text;
});

const chartDimensions = ref(makeChartDimensions());

const WIDTH = computed(() => chartDimensions.value.width);
const HEIGHT = computed(() => chartDimensions.value.height);

const {
    metrics: labelLayout,
    ready: labelLayoutReady,
    settling: labelLayoutSettling,
    update: measureLabelLayout,
} = useSvgLabelLayout({
    svgRef,
    canMeasure: () =>
        !FINAL_CONFIG.value.responsive || responsiveSizeReady.value,
    initialMetrics: { top: 0 },
    measure: (read) => ({ top: read(xAxisLabels.value).height }),
});

const topLabelsHeight = computed(() => labelLayout.value.top);

const drawingArea = computed(() => {
    const {
        top: p_top,
        right: p_right,
        bottom: p_bottom,
        left: p_left,
    } = cfgChart.value.padding;
    const chartHeight = HEIGHT.value;
    const chartWidth = WIDTH.value;
    return {
        chartHeight: Math.max(0.001, chartHeight),
        chartWidth: Math.max(0.001, chartWidth),
        height: Math.max(
            0.001,
            chartHeight -
                p_top -
                p_bottom -
                topLabelsHeight.value -
                chartDimensions.value.datapointFontSize * 2,
        ),
        width: Math.max(0.001, chartWidth - p_left - p_right),
        top:
            p_top +
            topLabelsHeight.value +
            chartDimensions.value.datapointFontSize,
        left: p_left,
        right: chartWidth - p_right,
        bottom:
            chartHeight - p_bottom - chartDimensions.value.datapointFontSize,
    };
});

const customPalette = computed(() => {
    return convertCustomPalette(FINAL_CONFIG.value.customPalette);
});

const mutableConfig = ref({
    dataLabels: {
        show: cfgYAxisLabels.value.datapoints.show,
    },
    showTable: FINAL_CONFIG.value.table.show,
    showTooltip: cfgTooltip.value.show,
});

// v3 - Essential to make shifting between loading config and final config work
watch(
    FINAL_CONFIG,
    () => {
        updateChartSizing();
        mutableConfig.value = {
            dataLabels: {
                show: cfgYAxisLabels.value.datapoints.show,
            },
            showTable: FINAL_CONFIG.value.table.show,
            showTooltip: cfgTooltip.value.show,
        };
    },
    { immediate: true },
);

const segregated = ref([]);

function toggleLegend() {
    if (segregated.value.length) {
        segregated.value = [];
    } else {
        legendSet.value.forEach((l) => {
            segregated.value.push(l.id);
        });
    }
    emit('selectLegend', filteredDs.value);
}

function segregate(id) {
    if (segregated.value.includes(id)) {
        segregated.value = segregated.value.filter((el) => el !== id);
    } else {
        segregated.value.push(id);
    }
    emit('selectLegend', filteredDs.value);
}

const immutableDataset = computed(() => {
    return FINAL_DATASET.value.map((ds, i) => {
        const color =
            convertColorToHex(ds.color) ||
            customPalette.value[i] ||
            palette[i] ||
            palette[i % palette.length];
        return {
            ...ds,
            series: (ds.series || []).map((s, j) => {
                return {
                    ...s,
                    id: `pcp_item_${uid.value}_${ds.id ?? i}_${s.id ?? j}`,
                    color,
                };
            }),
            seriesIndex: i,
            color,
            id: `pcp_group_${uid.value}_${ds.id ?? i}`,
            shape: ds.shape || 'circle',
        };
    });
});

function validSeriesToToggle(name) {
    if (!immutableDataset.value.length) {
        if (debug.value) {
            console.warn(
                'VueUiParallelCoordinatePlot - There are no series to show.',
            );
        }
        return null;
    }
    const dp = immutableDataset.value.find((d) => d.name === name);
    if (!dp) {
        if (debug.value) {
            console.warn(
                `VueUiParallelCoordinatePlot - Series name not found "${name}"`,
            );
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
    if (segregated.value.includes(dp.id)) {
        segregate(dp.id);
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
    if (!segregated.value.includes(dp.id)) {
        segregate(dp.id);
    }
}

const legendSet = computed(() => {
    return immutableDataset.value.map((ds) => {
        return {
            ...ds,
            opacity: segregated.value.includes(ds.id) ? 0.5 : 1,
            segregate: () => segregate(ds.id),
            isSegregated: segregated.value.includes(ds.id),
            shape: ds.shape || 'circle',
        };
    });
});

const legendConfig = computed(() => {
    return {
        cy: 'pcp-div-legend',
        backgroundColor: cfgChart.value.legend.backgroundColor,
        color: cfgChart.value.legend.color,
        fontSize: cfgChart.value.legend.fontSize,
        paddingBottom: 12,
        fontWeight: cfgChart.value.legend.bold ? 'bold' : '',
    };
});

const filteredDs = computed(() =>
    immutableDataset.value.filter((ds) => !segregated.value.includes(ds.id)),
);
const visibleItems = computed(() =>
    filteredDs.value.flatMap((ds) => ds.series),
);
const maxSeries = computed(() =>
    Math.max(0, ...visibleItems.value.map((item) => item.values.length)),
);
const slot = computed(() =>
    maxSeries.value ? drawingArea.value.width / maxSeries.value : 0,
);

function projectY(value, scale) {
    return (
        drawingArea.value.bottom -
        drawingArea.value.height *
            ((value - scale.min) / (scale.max - scale.min))
    );
}
function axisX(index) {
    return drawingArea.value.left + slot.value * index + slot.value / 2;
}
function buildAxisScale(minimum, maximum) {
    let min = minimum,
        max = maximum;
    if (minimum === maximum) {
        if (minimum > 0) {
            min = minimum / 4;
            max = maximum * 2;
        } else if (minimum < 0) {
            min = minimum * 2;
            max = maximum / 4;
        } else {
            min = 0;
            max = 1;
        }
    }
    return calculateNiceScale(
        min,
        max,
        Math.max(2, cfgChart.value.yAxis.scaleTicks),
    );
}

const scales = computed(() =>
    Array.from({ length: maxSeries.value }, (_, index) => {
        const values = visibleItems.value.map(
            (item) => item.values[index] || 0,
        );
        const scale = buildAxisScale(Math.min(...values), Math.max(...values));
        return {
            scale,
            ticks: scale.ticks.map((value) => ({
                y: projectY(value, scale),
                x: axisX(index),
                value,
            })),
            name: cfgYAxisLabels.value.axisNames[index] || `Y-${index + 1}`,
        };
    }),
);

const mutableDataset = computed(() =>
    filteredDs.value.map((group, seriesIndex) => ({
        ...group,
        series: group.series.map((item, datapointIndex) => {
            const datapoints = item.values.map((value, axisIndex) => ({
                name: item.name,
                seriesName: group.name,
                axisIndex,
                datapointIndex,
                seriesIndex,
                value: value || 0,
                x: axisX(axisIndex),
                y: projectY(value || 0, scales.value[axisIndex].scale),
                comment: item.comments ? item.comments[axisIndex] || '' : '',
            }));
            const straightPath = createStraightPath(datapoints);
            const smoothPath = createSmoothPath(datapoints, 0.12);
            return {
                ...item,
                datapoints,
                straightPath,
                smoothPath,
                pathLength: getPathLengthFromCoordinates(
                    cfgChart.value.lines.smooth
                        ? `M ${smoothPath}`
                        : `M ${straightPath}`,
                ),
            };
        }),
    })),
);

const keyboardNavigableSeries = computed(() =>
    mutableDataset.value.flatMap((group, S) =>
        group.series.map((serie, relativeIndex) => ({
            shape: group.shape,
            serieName: group.name,
            serie,
            relativeIndex,
            seriesIndex: group.seriesIndex,
            S,
            key: serie.id,
        })),
    ),
);
const interactionsById = computed(
    () =>
        new Map(
            keyboardNavigableSeries.value.map((item) => [item.serie.id, item]),
        ),
);
function getInteraction(serie) {
    return interactionsById.value.get(serie.id);
}

function makeDataLabel({ value, index, datapoint }) {
    return applyDataLabel(
        cfgYAxisLabels.value.formatters[index] || null,
        value,
        dataLabel({
            p: cfgYAxisLabels.value.prefixes[index] || '',
            v: value,
            s: cfgYAxisLabels.value.suffixes[index] || '',
            r: cfgYAxisLabels.value.roundings[index] || 0,
        }),
        { datapoint, seriesIndex: index },
    );
}

function getAxisNameAttributes(scale, index) {
    const labels = cfgYAxisLabels.value;
    return {
        class: 'vue-ui-parallel-coordinate-plot-x-label',
        'data-cy': 'pcp-axis-label',
        fill: labels.axisNamesColor,
        'font-size': chartDimensions.value.axisNameFontSize,
        'font-weight': labels.axisNamesBold ? 'bold' : '',
        'text-anchor':
            labels.axisNamesRotation === 0
                ? 'middle'
                : labels.axisNamesRotation < 0
                  ? 'start'
                  : 'end',
        transform: `translate(${axisX(index)}, ${topLabelsHeight.value - chartDimensions.value.axisNameFontSize}), rotate(${labels.axisNamesRotation})`,
    };
}

const selectedItem = ref(null);
const dataTooltipSlot = ref(null);
const isTooltip = ref(false);
const tooltipContent = ref('');

function onTrapLeave({ shape, serie, S }) {
    if (FINAL_CONFIG.value.events.datapointLeave) {
        FINAL_CONFIG.value.events.datapointLeave({
            datapoint: { ...serie, shape },
            seriesIndex: S,
        });
    }

    const activeItem =
        activeA11yItemIndex.value !== null
            ? keyboardNavigableSeries.value[activeA11yItemIndex.value]
            : null;

    if (
        tooltipTriggerMode.value === 'keyboard' &&
        activeItem &&
        activeItem.serie.id === serie.id
    ) {
        return;
    }

    selectedItem.value = null;
    isTooltip.value = false;
}

function updateTooltipA11yPosition(serie) {
    if (!svgRef.value || !serie?.datapoints?.length) return;
    const middlePoint =
        serie.datapoints[Math.floor(serie.datapoints.length / 2)];
    if (!middlePoint) return;
    const coords = svgToClientCoords(
        middlePoint.x,
        middlePoint.y,
        svgRef.value,
    );
    if (!coords) return;
    tooltipA11yPosition.value = coords;
}

function useTooltip({
    shape,
    serieName,
    serie,
    relativeIndex,
    seriesIndex,
    S,
    triggerMode = 'pointer',
    notify = true,
}) {
    if (notify && FINAL_CONFIG.value.events.datapointEnter) {
        FINAL_CONFIG.value.events.datapointEnter({
            datapoint: { ...serie, shape },
            seriesIndex: S,
        });
    }

    tooltipTriggerMode.value = triggerMode;
    dataTooltipSlot.value = {
        config: FINAL_CONFIG.value,
        datapoint: serie,
        serie,
        relativeIndex,
        seriesIndex,
        series: immutableDataset.value,
        scales: scales.value,
    };
    isTooltip.value = true;
    selectedItem.value = serie.id;
    let html = '';

    const customFormat = cfgTooltip.value.customFormat;

    const formatted = isFunction(customFormat)
        ? customFormat({
              serie,
              seriesIndex,
              series: immutableDataset.value,
              config: FINAL_CONFIG.value,
              scales: scales.value,
          })
        : undefined;
    if (typeof formatted === 'string') {
        tooltipContent.value = formatted;
    } else {
        html += `<div style="width:100%;text-align:center;border-bottom:1px solid ${cfgTooltip.value.borderColor};padding-bottom:6px;margin-bottom:3px;">${serieName ? serieName + ' - ' : ''}${serie.name}</div>`;
        scales.value
            .map((s) => s.name)
            .forEach((s, i) => {
                html += `
                <div class="vue-ui-tooltip-item" style="text-align:left">
                    <span>${s}: </span>
                    <span>
                        ${serie.datapoints[i] ? makeDataLabel({ value: serie.datapoints[i].value, index: i, datapoint: serie.datapoints[i] }) : '-'}    
                    </span>
                </div>
            `;
                if (
                    cfgChart.value.comments.showInTooltip &&
                    serie.datapoints[i]?.comment
                ) {
                    html += `<div class="vue-data-ui-tooltip-comment" style="background:${setOpacity(serie.color, 12.5)}; padding: 6px; margin-bottom: 6px; border-left: 1px solid ${serie.color}">${serie.datapoints[i].comment}</div>`;
                }
            });
        tooltipContent.value = `<div>${html}</div>`;
    }

    if (triggerMode === 'keyboard') {
        nextTick(() => {
            updateTooltipA11yPosition(serie);
        });
    }
}

/**
 * Return the current immutable dataset.
 * The result is the internal reactive value, not a defensive copy.
 *
 * @returns The current component data; treat it as read-only.
 */
function getData() {
    return immutableDataset.value;
}

const dataTable = computed(() => {
    const head = [FINAL_CONFIG.value.table.columnNames.series]
        .concat([FINAL_CONFIG.value.table.columnNames.item])
        .concat(scales.value.map((s) => s.name));
    const body = mutableDataset.value.flatMap((ds, i) => {
        return ds.series.map((s) => {
            return [
                ds.name,
                s.name,
                ...scales.value.map((_, index) => s.values[index] ?? '-'),
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

    const colNames = head;

    return {
        body,
        head,
        config,
        colNames,
    };
});

const tableCsv = computed(() => {
    if (mutableDataset.value.length === 0)
        return { head: [], body: [], config: {}, columnNames: [] };

    return {
        head: dataTable.value.head,
        body: dataTable.value.body,
    };
});

function generateCsv(callback = null) {
    const title = [
        [cfgChart.value.title.text],
        [cfgChart.value.title.subtitle.text],
        [''],
    ];
    const head = tableCsv.value.head;
    const body = tableCsv.value.body;
    const table = title.concat([head]).concat(body);
    const csvContent = createCsvContent(table);

    if (!callback) {
        downloadCsv({
            csvContent,
            title:
                cfgChart.value.title.text || 'vue-ui-parallel-coordinate-plot',
        });
    } else {
        callback(csvContent);
    }
}

const emit = defineEmits(['selectLegend', 'selectDatapoint', 'copyAlt']);

function selectDatapoint({ serie, shape, S }) {
    if (FINAL_CONFIG.value.events.datapointClick) {
        FINAL_CONFIG.value.events.datapointClick({
            datapoint: { ...serie, shape },
            seriesIndex: S,
        });
    }
    emit('selectDatapoint', serie);
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

const isAnnotator = ref(false);
function toggleAnnotator() {
    isAnnotator.value = !isAnnotator.value;
}

const getImage = createChartImageGetter(
    pcpChart,
    () => cfgChart.value.title.text,
);

const dummySlicer = ref({ start: 0, end: 1 });
const timeLabels = computed(() => scales.value.map((s) => s.name));

useTimeLabelCollision({
    timeLabelsEls: xAxisLabels,
    timeLabels,
    slicer: dummySlicer,
    configRef: FINAL_CONFIG,
    rotationPath: ['style', 'chart', 'yAxis', 'labels', 'axisNamesRotation'],
    autoRotatePath: [
        'style',
        'chart',
        'yAxis',
        'labels',
        'axisNamesAutoRotate',
        'enable',
    ],
    isAutoSize: false,
    width: WIDTH,
    height: HEIGHT,
    targetClass: '.vue-ui-parallel-coordinate-plot-x-label',
    rotation: cfgYAxisLabels.value.axisNamesAutoRotate.angle,
});

const tableComponent = computed(() =>
    getTableComponent({
        config: FINAL_CONFIG,
        style: cfgChart,
        mutableConfig,
        dialog: BaseDraggableDialog,
        accordion: Accordion,
        isFullscreen,
        parent: pcpChart,
        maxWidth: 800,
        isCursorPointer,
    }),
);

watch(
    () => mutableConfig.value.showTable,
    (v) => {
        if (tableUnit.value) syncTableVisibility(v, FINAL_CONFIG, tableUnit);
    },
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
        dataset: mutableDataset.value,
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
            dataset: mutableDataset.value,
        }),
    );
}

/***************************************************************************************************
 * a11y
 **************************************************************************************************/

function getWrappedA11yItemIndex(index) {
    const len = keyboardNavigableSeries.value.length;
    if (!len) return null;
    return ((index % len) + len) % len;
}

function clearKeyboardSelection() {
    if (activeA11yItemIndex.value !== null) {
        const activeItem =
            keyboardNavigableSeries.value[activeA11yItemIndex.value];

        if (activeItem) {
            onTrapLeave({
                shape: activeItem.shape,
                serie: activeItem.serie,
                S: activeItem.S,
            });
        }
    }

    activeA11yItemIndex.value = null;
    tooltipTriggerMode.value = 'pointer';
    selectedItem.value = null;
    isTooltip.value = false;
}

function onSvgFocus() {
    activeA11yItemIndex.value = null;
    isFocus.value = true;
}

function onSvgBlur() {
    clearKeyboardSelection();
    isFocus.value = false;
}

function onSvgKeydown(event) {
    if (!svgRef.value || isAnnotator.value) return;
    if (document.activeElement !== svgRef.value) return;
    if (!keyboardNavigableSeries.value.length) return;

    const isPreviousKey = ['ArrowUp', 'ArrowLeft'].includes(event.key);
    const isNextKey = ['ArrowDown', 'ArrowRight'].includes(event.key);
    const isActivationKey = event.key === 'Enter' || event.key === ' ';
    const isEscapeKey = event.key === 'Escape';

    if (!isPreviousKey && !isNextKey && !isActivationKey && !isEscapeKey)
        return;

    event.preventDefault();
    event.stopPropagation();

    if (isEscapeKey) {
        clearKeyboardSelection();
        return;
    }

    if (isActivationKey) {
        if (activeA11yItemIndex.value === null) return;

        const activeItem =
            keyboardNavigableSeries.value[activeA11yItemIndex.value];
        if (!activeItem) return;

        selectDatapoint({
            serie: activeItem.serie,
            shape: activeItem.shape,
            S: activeItem.S,
        });
        return;
    }

    let nextIndex = activeA11yItemIndex.value;

    if (nextIndex === null) {
        nextIndex = isNextKey ? 0 : keyboardNavigableSeries.value.length - 1;
    } else {
        nextIndex = getWrappedA11yItemIndex(nextIndex + (isNextKey ? 1 : -1));
    }

    const activeItem = keyboardNavigableSeries.value[nextIndex];
    if (!activeItem) return;

    activeA11yItemIndex.value = nextIndex;

    useTooltip({
        shape: activeItem.shape,
        serieName: activeItem.serieName,
        serie: activeItem.serie,
        relativeIndex: activeItem.relativeIndex,
        seriesIndex: activeItem.seriesIndex,
        S: activeItem.S,
        triggerMode: 'keyboard',
    });
}

watch(keyboardNavigableSeries, (items) => {
    if (!selectedItem.value) return;
    const index = items.findIndex(
        (item) => item.serie.id === selectedItem.value,
    );
    if (index === -1) {
        activeA11yItemIndex.value = null;
        tooltipTriggerMode.value = 'pointer';
        selectedItem.value = null;
        isTooltip.value = false;
        return;
    }
    if (activeA11yItemIndex.value !== null) activeA11yItemIndex.value = index;
    useTooltip({
        ...items[index],
        triggerMode: tooltipTriggerMode.value,
        notify: false,
    });
});

const a11yTable = computed(() => {
    return {
        head: dataTable.value.head,
        body: dataTable.value.body.map((row) => [
            row[0] ?? '',
            row[1] ?? '',
            ...row.slice(2),
        ]),
        caption: FINAL_CONFIG.value.a11y.translations.tableCaption,
        notice: FINAL_CONFIG.value.a11y.translations.tableAvailable,
    };
});

defineExpose({
    getData,
    getImage,
    generateCsv,
    generatePdf,
    generateImage,
    generateSvg,
    hideSeries,
    showSeries,
    toggleTable,
    toggleLabels,
    toggleTooltip,
    toggleAnnotator,
    toggleFullscreen,
    copyAlt,
});
watch(
    () => [
        chartDimensions.value,
        cfgYAxisLabels.value,
        xAxisLabels.value,
        props.dataset,
        segregated.value,
        responsiveSizeReady.value,
        FINAL_CONFIG.value.style.fontFamily,
    ],
    measureLabelLayout,
    { flush: 'post', deep: true },
);
</script>

<template>
    <div
        ref="pcpChart"
        :class="`vue-data-ui-component vue-ui-pcp ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''} ${FINAL_CONFIG.useCssAnimation ? '' : 'vue-ui-dna'}`"
        :style="`font-family:${FINAL_CONFIG.style.fontFamily};width:100%; text-align:center;background:${cfgChart.backgroundColor};${FINAL_CONFIG.responsive ? 'height:100%' : ''}`"
        :id="`pcp_${uid}`"
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

        <PenAndPaper
            v-bind="getAnnotatorProps(cfgUserOptions.annotator)"
            v-if="cfgUserOptions.buttons.annotator"
            :svgRef="svgRef"
            :backgroundColor="cfgChart.backgroundColor"
            :color="cfgChart.color"
            :active="isAnnotator"
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

        <div
            ref="noTitle"
            v-if="hasOptionsNoTitle"
            class="vue-data-ui-no-title-space"
            :style="`height:36px; width: 100%;background:transparent`"
        />

        <div
            ref="chartTitle"
            v-if="cfgChart.title.text"
            :style="`width:100%;background:transparent;padding-bottom:24px`"
        >
            <Title
                :key="`title_${titleStep}`"
                :config="{
                    title: {
                        cy: 'pcp-div-title',
                        ...cfgChart.title,
                    },
                    subtitle: {
                        cy: 'pcp-div-subtitle',
                        ...cfgChart.title.subtitle,
                    },
                }"
            />
        </div>

        <div :id="`legend-top-${uid}`" />

        <UserOptions
            ref="userOptionsRef"
            :key="`user_options_${step}`"
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
            :hasTooltip="cfgUserOptions.buttons.tooltip && cfgTooltip.show"
            :isFullscreen="isFullscreen"
            :isTooltip="mutableConfig.showTooltip"
            :chartElement="pcpChart"
            v-bind="
                getUserOptionsProps(
                    cfgUserOptions,
                    'pdf csv img svg labels table fullscreen altCopy annotator',
                )
            "
            :isAnnotation="isAnnotator"
            :tableDialog="FINAL_CONFIG.table.useDialog"
            :isCursorPointer="isCursorPointer"
            @toggleFullscreen="toggleFullscreen"
            @generatePdf="generatePdf"
            @generateCsv="generateCsv"
            @generateImage="onGenerateImage"
            @generateSvg="generateSvg"
            @toggleTable="toggleTable"
            @toggleLabels="toggleLabels"
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
                    'menuIcon optionTooltip optionPdf optionCsv optionImg optionSvg optionTable optionLabels optionFullscreen optionAnnotator optionAltCopy custom-menu-before custom-menu-after',
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
                :aria-describedby="`chart-instructions-${uid}`"
                :class="{
                    'vue-data-ui-fullscreen--on': isFullscreen,
                    'vue-data-ui-fulscreen--off': !isFullscreen,
                    'vue-data-ui-no-transition':
                        !transitionEnabled || labelLayoutSettling,
                }"
                :viewBox="`0 0 ${drawingArea.chartWidth <= 0 ? 10 : drawingArea.chartWidth} ${drawingArea.chartHeight <= 0 ? 10 : drawingArea.chartHeight}`"
                :style="`max-width:100%; overflow: visible; background:transparent;color:${cfgChart.color};visibility:${labelLayoutReady ? 'visible' : 'hidden'}`"
                tabindex="0"
                @focus="onSvgFocus"
                @blur="onSvgBlur"
                @keydown="onSvgKeydown"
            >
                <PackageVersion />
                <slot
                    name="svg-underlayer"
                    :svg="{
                        ...drawingArea,
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
                    :width="drawingArea.width"
                    :height="drawingArea.height"
                    :style="{
                        pointerEvents: 'none',
                    }"
                >
                    <slot name="chart-background" />
                </foreignObject>

                <!-- SCALES -->
                <g v-for="(scale, i) in scales" style="pointer-events: none">
                    <!-- AXIS -->
                    <line
                        data-cy="pcp-axis"
                        :x1="drawingArea.left + slot * i + slot / 2"
                        :x2="drawingArea.left + slot * i + slot / 2"
                        :y1="drawingArea.top"
                        :y2="drawingArea.bottom"
                        :stroke="cfgChart.yAxis.stroke"
                        :stroke-width="cfgChart.yAxis.strokeWidth"
                    />

                    <template v-if="cfgYAxisLabels.ticks.show">
                        <!-- TICKS -->
                        <path
                            :class="{
                                'vue-data-ui-transition':
                                    transitionEnabled && !labelLayoutSettling,
                            }"
                            v-for="(tick, j) in scale.ticks"
                            :key="`tick_${scale.name}_${j}`"
                            data-cy="scale-tick"
                            :d="`M${tick.x},${tick.y} ${tick.x - 10},${tick.y}`"
                            :stroke="cfgChart.yAxis.stroke"
                            :stroke-width="cfgChart.yAxis.strokeWidth"
                            :style="`opacity:${selectedItem && !mutableConfig.showTooltip ? 0.2 : 1}`"
                        />

                        <!-- TICK LABELS -->
                        <g v-if="!loading">
                            <text
                                data-cy="scale-label"
                                v-for="(tick, j) in scale.ticks"
                                :key="`tl_${scale.name}_${j}`"
                                :class="{
                                    'vue-data-ui-transition':
                                        transitionEnabled &&
                                        !labelLayoutSettling,
                                }"
                                :transform="`translate(${tick.x - 12 + cfgYAxisLabels.ticks.offsetX}, ${tick.y + cfgYAxisLabels.ticks.offsetY + chartDimensions.ticksFontSize / 3})`"
                                :fill="cfgYAxisLabels.ticks.color"
                                text-anchor="end"
                                :font-size="chartDimensions.ticksFontSize"
                                :font-weight="
                                    cfgYAxisLabels.ticks.bold
                                        ? 'bold'
                                        : 'normal'
                                "
                                :style="`opacity:${selectedItem && !mutableConfig.showTooltip ? 0.2 : 1}`"
                            >
                                {{
                                    makeDataLabel({
                                        value: tick.value,
                                        index: i,
                                        datapoint: tick,
                                    })
                                }}
                            </text>
                        </g>
                    </template>
                </g>

                <!-- AXIS NAMES -->
                <g ref="xAxisLabels" v-if="cfgYAxisLabels.showAxisNames">
                    <template
                        v-for="(scale, i) in scales"
                        style="pointer-events: none"
                    >
                        <text
                            v-if="!String(scale.name).includes('\n')"
                            v-bind="getAxisNameAttributes(scale, i)"
                        >
                            {{ scale.name }}
                        </text>
                        <text
                            v-else
                            v-bind="getAxisNameAttributes(scale, i)"
                            v-html="
                                createTSpansFromLineBreaksOnX({
                                    content: String(scale.name),
                                    fontSize: chartDimensions.axisNameFontSize,
                                    fill: cfgYAxisLabels.axisNamesColor,
                                    x: 0,
                                    y: 0,
                                })
                            "
                        />
                    </template>
                </g>

                <g v-for="(serie, S) in mutableDataset">
                    <!-- DATAPOINTS -->
                    <g v-for="(serieSet, i) in serie.series">
                        <!-- PLOTS -->
                        <g v-if="cfgChart.plots.show">
                            <Shape
                                v-for="(dp, D) in serieSet.datapoints"
                                :plot="{ x: dp.x, y: dp.y }"
                                :color="serie.color"
                                :shape="serie.shape"
                                :radius="
                                    serie.shape === 'triangle'
                                        ? chartDimensions.plotSize * 1.2
                                        : chartDimensions.plotSize
                                "
                                :stroke="cfgChart.backgroundColor"
                                :strokeWidth="0.5"
                                @mouseenter="
                                    useTooltip(getInteraction(serieSet))
                                "
                                @mouseleave="
                                    onTrapLeave(getInteraction(serieSet))
                                "
                                :style="`opacity:${selectedItem ? (selectedItem === serieSet.id ? cfgChart.plots.opacity : 0.2) : cfgChart.plots.opacity}`"
                                @click="
                                    () =>
                                        selectDatapoint(
                                            getInteraction(serieSet),
                                        )
                                "
                            />
                            <!-- SERIE LABEL WHEN TOOLTIP IS DISABLED -->
                            <template
                                v-if="!mutableConfig.showTooltip"
                                style="pointer-events: none"
                            >
                                <text
                                    v-if="
                                        selectedItem &&
                                        selectedItem === serieSet.id &&
                                        serieSet.datapoints.length
                                    "
                                    :x="
                                        serieSet.datapoints[0].x -
                                        chartDimensions.ticksFontSize
                                    "
                                    :y="
                                        serieSet.datapoints[0].y +
                                        chartDimensions.ticksFontSize / 3
                                    "
                                    text-anchor="end"
                                    :font-size="chartDimensions.ticksFontSize"
                                    :fill="serie.color"
                                    font-weight="bold"
                                >
                                    {{ serieSet.name }}
                                </text>
                            </template>

                            <template v-if="cfgChart.comments.show">
                                <g v-for="dp in serieSet.datapoints">
                                    <foreignObject
                                        v-if="dp.comment"
                                        style="overflow: visible"
                                        height="12"
                                        :width="cfgChart.comments.width"
                                        :x="
                                            dp.x -
                                            cfgChart.comments.width / 2 +
                                            cfgChart.comments.offsetX
                                        "
                                        :y="
                                            dp.y + cfgChart.comments.offsetY + 6
                                        "
                                    >
                                        <div style="width: 100%">
                                            <slot
                                                name="plot-comment"
                                                :plot="{
                                                    ...dp,
                                                    color: serie.color,
                                                }"
                                            />
                                        </div>
                                    </foreignObject>
                                </g>
                            </template>
                        </g>

                        <!-- LINES -->
                        <path
                            data-cy="datapoint-line"
                            :d="`M${cfgChart.lines.smooth ? serieSet.smoothPath : serieSet.straightPath}`"
                            :stroke="serie.color"
                            :stroke-width="cfgChart.lines.strokeWidth"
                            fill="none"
                            :class="{
                                'vue-ui-pcp-animated vue-data-ui-line-animated':
                                    FINAL_CONFIG.useCssAnimation,
                                'vue-data-ui-transition':
                                    transitionEnabled && !labelLayoutSettling,
                            }"
                            @mouseenter="useTooltip(getInteraction(serieSet))"
                            @mouseleave="onTrapLeave(getInteraction(serieSet))"
                            @click="
                                () => selectDatapoint(getInteraction(serieSet))
                            "
                            :style="`opacity:${selectedItem ? (selectedItem === serieSet.id ? cfgChart.lines.opacity : 0.2) : cfgChart.lines.opacity}; stroke-dasharray:${serieSet.pathLength}; stroke-dashoffset: ${FINAL_CONFIG.useCssAnimation ? serieSet.pathLength : 0}`"
                        />
                        <!-- TOOLTIP TRAPS -->
                        <path
                            data-cy="tooltip-trap"
                            v-if="mutableConfig.showTooltip"
                            :d="`M${cfgChart.lines.smooth ? serieSet.smoothPath : serieSet.straightPath}`"
                            stroke="transparent"
                            :stroke-width="12"
                            fill="none"
                            :class="{
                                'vue-ui-pcp-animated vue-data-ui-line-animated':
                                    FINAL_CONFIG.useCssAnimation,
                                'vue-data-ui-transition':
                                    transitionEnabled && !labelLayoutSettling,
                            }"
                            @mouseenter="useTooltip(getInteraction(serieSet))"
                            @mouseleave="onTrapLeave(getInteraction(serieSet))"
                            @click="
                                () => selectDatapoint(getInteraction(serieSet))
                            "
                            style="opacity: 0"
                        />
                    </g>
                </g>

                <g v-for="(serie, S) in mutableDataset">
                    <!-- DATALABELS -->
                    <g v-for="(serieSet, i) in serie.series">
                        <!-- LABELS -->
                        <template
                            v-if="
                                !loading &&
                                (mutableConfig.dataLabels.show ||
                                    (selectedItem &&
                                        selectedItem === serieSet.id))
                            "
                        >
                            <text
                                data-cy="plot-label"
                                v-for="(dp, k) in serieSet.datapoints"
                                :key="`pl_${serieSet.id}_${k}`"
                                :transform="`translate(${dp.x + 12 + cfgYAxisLabels.datapoints.offsetX}, ${dp.y + cfgYAxisLabels.datapoints.offsetY + chartDimensions.datapointFontSize / 3})`"
                                :fill="
                                    cfgYAxisLabels.datapoints.useSerieColor
                                        ? serie.color
                                        : cfgYAxisLabels.datapoints.color
                                "
                                text-anchor="start"
                                :font-weight="
                                    cfgYAxisLabels.datapoints.bold
                                        ? 'bold'
                                        : 'normal'
                                "
                                :class="{
                                    'vue-ui-pcp-plot-label': true,
                                    'vue-data-ui-transition':
                                        transitionEnabled &&
                                        !labelLayoutSettling,
                                }"
                                :font-size="chartDimensions.datapointFontSize"
                                :stroke="cfgChart.backgroundColor"
                                :stroke-width="3"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                paint-order="stroke fill"
                                @mouseenter="
                                    useTooltip(getInteraction(serieSet))
                                "
                                @mouseleave="
                                    onTrapLeave(getInteraction(serieSet))
                                "
                                @click="
                                    () =>
                                        selectDatapoint(
                                            getInteraction(serieSet),
                                        )
                                "
                                :style="`opacity:${selectedItem ? (selectedItem === serieSet.id ? 1 : 0.2) : 1}`"
                            >
                                {{
                                    makeDataLabel({
                                        value: dp.value,
                                        index: k,
                                        datapoint: dp,
                                    })
                                }}
                            </text>
                        </template>
                    </g>
                </g>
                <slot
                    name="svg"
                    :svg="{
                        ...drawingArea,
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
                        :key="`legend_${legendStep}`"
                        :legendSet="legendSet"
                        :config="legendConfig"
                        :isCursorPointer="isCursorPointer"
                        @clickMarker="
                            ({ legend }) => {
                                segregate(legend.id);
                            }
                        "
                    >
                        <template #item="{ legend, index }">
                            <div
                                data-cy="legend-item"
                                @click="legend.segregate()"
                                :style="`opacity:${segregated.includes(legend.id) ? 0.5 : 1}`"
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
            :teleportTo="cfgTooltip.teleportTo"
            :show="mutableConfig.showTooltip && isTooltip"
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
            :parent="pcpChart"
            :content="tooltipContent"
            :isFullscreen="isFullscreen"
            :isCustom="isFunction(cfgTooltip.customFormat)"
            :smooth="cfgTooltip.smooth"
            :backdropFilter="cfgTooltip.backdropFilter"
            :smoothForce="cfgTooltip.smoothForce"
            :smoothSnapThreshold="cfgTooltip.smoothSnapThreshold"
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
                        <div>{{ th }}</div>
                    </template>
                    <template #td="{ td }">
                        {{ td }}
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

.vue-ui-pcp * {
    transition: unset;
}
.vue-ui-pcp {
    user-select: none;
    position: relative;
}

.vue-data-ui-transition {
    transition: all 0.2s ease-in-out;
}

.vue-ui-pcp-animated {
    transform-origin: center;
    animation: vueDataUiLineAnimation 0.7s ease-in-out forwards;
}

@keyframes vueDataUiLineAnimation {
    to {
        stroke-dashoffset: 0;
    }
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
