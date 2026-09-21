<script setup>
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
import {
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
    deepClone,
    downloadCsv,
    error,
    functionReturnsString,
    getMissingDatasetAttributes,
    getPathLengthFromCoordinates,
    isFunction,
    objectIsEmpty,
    palette,
    svgToClientCoords,
    themePalettes,
    translateSize,
    treeShake,
    XMLNS,
} from '../lib';
import { throttle } from '../canvas-lib';
import { COMMON_RULES, useHints } from '../useHints';
import { useConfig } from '../useConfig';
import { usePrinter } from '../usePrinter';
import { useLoading } from '../useLoading';
import { useResponsive } from '../useResponsive';
import { useNestedProp } from '../useNestedProp';
import { useThemeCheck } from '../useThemeCheck';
import { useChartExport } from '../useChartExport';
import { useTransitions } from '../useTransitions.js';
import { useUserOptionState } from '../useUserOptionState';
import { useChartAccessibility } from '../useChartAccessibility';
import { useTimeLabelCollision } from '../useTimeLabelCollider';
import themes from '../themes/vue_ui_parallel_coordinate_plot.json';
import Title from '../atoms/Title.vue'; // Must be ready in responsive mode
import Legend from '../atoms/Legend.vue'; // Must be ready in responsive mode
import Shape from '../atoms/Shape.vue';
import img from '../img';
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
const { isThemeValid, warnInvalidTheme } = useThemeCheck();

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

const isDataset = computed({
    get() {
        return !!props.dataset && props.dataset.length;
    },
    set(bool) {
        return bool;
    },
});

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

const { loading, FINAL_DATASET, manualLoading } = useLoading({
    ...toRefs(props),
    FINAL_CONFIG,
    prepareConfig,
    callback: () => {
        Promise.resolve().then(async () => {
            await nextTick();
            mutableConfig.value.showTable = FINAL_CONFIG.value.table.show;
        });
    },
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

    return {
        ...finalConfig,
        customPalette: finalConfig.customPalette.length
            ? finalConfig.customPalette
            : themePalettes[theme] || palette,
    };
}

function stringifyStructuralConfig(cfg) {
    const clonedConfig = deepClone(cfg);
    if (clonedConfig?.style?.chart) {
        delete clonedConfig.style.chart.tooltip;
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
        prepareChart();
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

watch(
    () => props.dataset,
    (_) => {
        if (Array.isArray(_) && _.length > 0) {
            manualLoading.value = false;
        }
    },
    { deep: true },
);

const resizeObserver = shallowRef(null);
const observedEl = shallowRef(null);

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
        manualLoading.value = true;
    } else {
        props.dataset.forEach((ds, i) => {
            getMissingDatasetAttributes({
                datasetObject: ds,
                requiredAttributes: ['name', 'series'],
            }).forEach((attr) => {
                isDataset.value = false;
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

    // v3
    if (!objectIsEmpty(props.dataset)) {
        manualLoading.value = FINAL_CONFIG.value.loading;
    }

    if (FINAL_CONFIG.value.responsive) {
        const handleResize = throttle(() => {
            const { width, height } = useResponsive({
                chart: pcpChart.value,
                title: cfgChart.value.title.text ? chartTitle.value : null,
                legend: cfgChart.value.legend.show ? chartLegend.value : null,
                source: source.value,
                noTitle: noTitle.value,
            });

            requestAnimationFrame(() => {
                chartDimensions.value.width = width;
                chartDimensions.value.height = height - 12;

                if (FINAL_CONFIG.value.responsiveProportionalSizing) {
                    chartDimensions.value.plotSize = translateSize({
                        relator: Math.min(width, height),
                        adjuster: 600,
                        source: cfgChart.value.plots.radius,
                        threshold: 2,
                        fallback: 2,
                    });
                    chartDimensions.value.ticksFontSize = translateSize({
                        relator: Math.min(width, height),
                        adjuster: 600,
                        source: cfgYAxisLabels.value.ticks.fontSize,
                        threshold: 10,
                        fallback: 10,
                    });
                    chartDimensions.value.datapointFontSize = translateSize({
                        relator: Math.min(width, height),
                        adjuster: 600,
                        source: cfgYAxisLabels.value.datapoints.fontSize,
                        threshold: 10,
                        fallback: 10,
                    });
                    chartDimensions.value.axisNameFontSize = translateSize({
                        relator: Math.min(width, height),
                        adjuster: 600,
                        source: cfgYAxisLabels.value.axisNamesFontSize,
                        threshold: 12,
                        fallback: 12,
                    });
                } else {
                    chartDimensions.value.plotSize =
                        cfgChart.value.plots.radius;
                    chartDimensions.value.ticksFontSize =
                        cfgYAxisLabels.value.ticks.fontSize;
                    chartDimensions.value.datapointFontSize =
                        cfgYAxisLabels.value.datapoints.fontSize;
                    chartDimensions.value.axisNameFontSize =
                        cfgYAxisLabels.value.axisNamesFontSize;
                }
            });
        });

        if (resizeObserver.value) {
            if (observedEl.value) {
                resizeObserver.value.unobserve(observedEl.value);
            }
            resizeObserver.value.disconnect();
        }

        resizeObserver.value = new ResizeObserver(handleResize);
        observedEl.value = pcpChart.value.parentNode;
        resizeObserver.value.observe(observedEl.value);
    }
}

onBeforeUnmount(() => {
    if (resizeObserver.value) {
        if (observedEl.value) {
            resizeObserver.value.unobserve(observedEl.value);
        }
        resizeObserver.value.disconnect();
    }
});

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `pcp_${uid.value}`,
    fileName: cfgChart.value.title.text || 'vue-ui-parallel-coordinate-plot',
    options: FINAL_CONFIG.value.userOptions.print,
});

const hasOptionsNoTitle = computed(() => {
    return FINAL_CONFIG.value.userOptions.show && !cfgChart.value.title.text;
});

const chartDimensions = ref({
    height: cfgChart.value.height,
    width: cfgChart.value.width,
    plotSize: cfgChart.value.plots.radius, // ratio 100
    ticksFontSize: cfgYAxisLabels.value.ticks.fontSize, // ratio 42.85
    datapointFontSize: cfgYAxisLabels.value.datapoints.fontSize,
    axisNameFontSize: cfgYAxisLabels.value.axisNamesFontSize,
});

const WIDTH = computed(() => chartDimensions.value.width);
const HEIGHT = computed(() => chartDimensions.value.height);

const topLabelsHeight = ref(0);

const updateTopLabelsHeight = throttle((h) => {
    topLabelsHeight.value = h;
}, 100);

// Track time label height to update drawing area when they rotate
watchEffect((onInvalidate) => {
    const el = xAxisLabels.value;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
        updateTopLabelsHeight(entries[0].contentRect.height);
    });
    observer.observe(el);
    onInvalidate(() => observer.disconnect());
});

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
            series: ds.series.map((s) => {
                return {
                    ...s,
                    id: createUid(),
                    color,
                };
            }),
            seriesIndex: i,
            color,
            id: createUid(),
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

function showSeries(name) {
    const dp = validSeriesToToggle(name);
    if (dp === null) return;
    if (segregated.value.includes(dp.id)) {
        segregate(dp.id);
    }
}

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

const maxSeries = computed(() => {
    return Math.max(
        ...immutableDataset.value
            .filter((ds) => !segregated.value.includes(ds.id))
            .map((ds) =>
                Math.max(...ds.series.flatMap((s) => s.values.length)),
            ),
    );
});

const slot = computed(() => {
    return drawingArea.value.width / maxSeries.value;
});

const filteredDs = computed(() => {
    return immutableDataset.value.filter(
        (ds) => !segregated.value.includes(ds.id),
    );
});

const scales = computed(() => {
    let s = [];
    for (let i = 0; i < maxSeries.value; i += 1) {
        const min = Math.min(
            ...filteredDs.value.flatMap(
                (ds) => ds.series.map((s) => s.values[i] || 0) || 0,
            ),
        );
        const max = Math.max(
            ...filteredDs.value.flatMap(
                (ds) => ds.series.map((s) => s.values[i] || 0) || 0,
            ),
        );
        const opMin = max === min ? min / 4 : min;
        const opMax = max === min ? max * 2 : max;
        const scale = calculateNiceScale(
            opMin,
            opMax,
            cfgChart.value.yAxis.scaleTicks,
        );
        const ticks = scale.ticks.map((t, k) => {
            const senseValue =
                scale.min < 0
                    ? t + Math.abs(scale.min)
                    : t - Math.abs(scale.min);
            const senseMax =
                scale.min < 0
                    ? scale.max + Math.abs(scale.min)
                    : scale.max - Math.abs(scale.min);
            return {
                y:
                    drawingArea.value.bottom -
                    drawingArea.value.height * (senseValue / senseMax),
                x: drawingArea.value.left + slot.value * i + slot.value / 2,
                value: t,
            };
        });
        s.push({
            scale,
            ticks,
            name: cfgYAxisLabels.value.axisNames[i] || `Y-${i + 1}`,
        });
    }
    return s;
});

const mutableDataset = computed(() => {
    return filteredDs.value
        .map((ds, i) => {
            return {
                ...ds,
                series: ds.series.map((s, j) => {
                    return {
                        ...s,
                        datapoints: s.values.map((v, k) => {
                            const senseValue =
                                scales.value[k].scale.min < 0
                                    ? (v || 0) +
                                      Math.abs(scales.value[k].scale.min)
                                    : (v || 0) -
                                      Math.abs(scales.value[k].scale.min);
                            const senseMax =
                                scales.value[k].scale.min < 0
                                    ? scales.value[k].scale.max +
                                      Math.abs(scales.value[k].scale.min)
                                    : scales.value[k].scale.max -
                                      Math.abs(scales.value[k].scale.min);
                            return {
                                name: s.name,
                                seriesName: ds.name,
                                axisIndex: k,
                                datapointIndex: j,
                                seriesIndex: i,
                                value: v || 0,
                                x:
                                    drawingArea.value.left +
                                    slot.value * k +
                                    slot.value / 2,
                                y:
                                    drawingArea.value.bottom -
                                    drawingArea.value.height *
                                        (senseValue / senseMax),
                                comment: s.comments ? s.comments[k] || '' : '',
                            };
                        }),
                    };
                }),
            };
        })
        .map((ds) => {
            return {
                ...ds,
                series: ds.series.map((s) => {
                    const straightPath = createStraightPath(s.datapoints);
                    const smoothPath = createSmoothPath(s.datapoints, 0.12);
                    const pathLength = getPathLengthFromCoordinates(
                        cfgChart.value.lines.smooth
                            ? `M ${smoothPath}`
                            : `M ${straightPath}`,
                    );
                    return {
                        ...s,
                        smoothPath,
                        straightPath,
                        pathLength,
                    };
                }),
            };
        });
});

const keyboardNavigableSeries = computed(() => {
    return mutableDataset.value.flatMap((group, S) => {
        return group.series.map((serie, relativeIndex) => ({
            shape: group.shape,
            serieName: group.name,
            serie,
            relativeIndex,
            seriesIndex: serie.seriesIndex,
            S,
            key: `${S}_${relativeIndex}`,
        }));
    });
});

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
}) {
    if (FINAL_CONFIG.value.events.datapointEnter) {
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

    if (
        isFunction(customFormat) &&
        functionReturnsString(() =>
            customFormat({
                serie,
                seriesIndex: serie.seriesIndex,
                series: immutableDataset.value,
                config: FINAL_CONFIG.value,
                scales: scales.value,
            }),
        )
    ) {
        tooltipContent.value = customFormat({
            serie,
            seriesIndex: serie.seriesIndex,
            series: immutableDataset.value,
            config: FINAL_CONFIG.value,
            scales: scales.value,
        });
    } else {
        html += `<div style="width:100%;text-align:center;border-bottom:1px solid ${cfgTooltip.value.borderColor};padding-bottom:6px;margin-bottom:3px;">${serieName ? serieName + ' - ' : ''}${serie.name}</div>`;
        scales.value
            .map((s) => s.name)
            .forEach((s, i) => {
                html += `
                <div class="vue-ui-tooltip-item" style="text-align:left">
                    <span>${s}: </span>
                    <span>
                        ${applyDataLabel(
                            cfgYAxisLabels.value.formatters[i] || null,
                            serie.datapoints[i].value,
                            dataLabel({
                                p: cfgYAxisLabels.value.prefixes[i] || '',
                                v: serie.datapoints[i].value,
                                s: cfgYAxisLabels.value.suffixes[i] || '',
                                r: cfgYAxisLabels.value.roundings[i] || '',
                            }),
                            { datapoint: serie.datapoints[i], seriesIndex: i },
                        )}    
                    </span>
                </div>
            `;
                if (
                    cfgChart.value.comments.showInTooltip &&
                    serie.datapoints[i].comment
                ) {
                    html += `<div class="vue-data-ui-tooltip-comment" style="background:${serie.color}20; padding: 6px; margin-bottom: 6px; border-left: 1px solid ${serie.color}">${serie.datapoints[i].comment}</div>`;
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

function getData() {
    return immutableDataset.value;
}

const dataTable = computed(() => {
    const head = [FINAL_CONFIG.value.table.columnNames.series]
        .concat([FINAL_CONFIG.value.table.columnNames.item])
        .concat(scales.value.map((s) => s.name));
    const body = mutableDataset.value.flatMap((ds, i) => {
        return ds.series.map((s) => {
            return [ds.name].concat([s.name]).concat(s.values);
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

    const colNames = [FINAL_CONFIG.value.table.columnNames.series]
        .concat([FINAL_CONFIG.value.table.columnNames.item])
        .concat(scales.value.map((s) => s.name));

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

async function getImage({ scale = 2 } = {}) {
    if (!pcpChart.value) return;
    const { width, height } = pcpChart.value.getBoundingClientRect();
    const aspectRatio = width / height;
    const { imageUri, base64 } = await img({
        domElement: pcpChart.value,
        base64: true,
        img: true,
        scale,
    });
    return {
        imageUri,
        base64,
        title: cfgChart.value.title.text,
        width,
        height,
        aspectRatio,
    };
}

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

const tableComponent = computed(() => {
    const useDialog =
        FINAL_CONFIG.value.table.useDialog && !FINAL_CONFIG.value.table.show;
    const open = mutableConfig.value.showTable;
    return {
        component: useDialog ? BaseDraggableDialog : Accordion,
        title: `${cfgChart.value.title.text}${cfgChart.value.title.subtitle.text ? `: ${cfgChart.value.title.subtitle.text}` : ''}`,
        props: useDialog
            ? {
                  backgroundColor: FINAL_CONFIG.value.table.th.backgroundColor,
                  color: FINAL_CONFIG.value.table.th.color,
                  headerColor: FINAL_CONFIG.value.table.th.color,
                  headerBg: FINAL_CONFIG.value.table.th.backgroundColor,
                  isFullscreen: isFullscreen.value,
                  fullscreenParent: pcpChart.value,
                  forcedWidth: Math.min(800, window.innerWidth * 0.8),
                  isCursorPointer: isCursorPointer.value,
              }
            : {
                  hideDetails: true,
                  config: {
                      open,
                      maxHeight: 10000,
                      body: {
                          backgroundColor: cfgChart.value.backgroundColor,
                          color: cfgChart.value.color,
                      },
                      head: {
                          backgroundColor: cfgChart.value.backgroundColor,
                          color: cfgChart.value.color,
                      },
                  },
              },
    };
});

watch(
    () => mutableConfig.value.showTable,
    (v) => {
        if (FINAL_CONFIG.value.table.show) return;
        if (v && FINAL_CONFIG.value.table.useDialog && tableUnit.value) {
            tableUnit.value.open();
        } else {
            if ('close' in tableUnit.value) {
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
            v-if="a11yTable.body.length"
            :uid="uid"
            :head="a11yTable.head"
            :body="a11yTable.body"
            :caption="a11yTable.caption"
            :notice="a11yTable.notice"
        />

        <PenAndPaper
            v-if="cfgUserOptions.buttons.annotator"
            :svgRef="svgRef"
            :backgroundColor="cfgChart.backgroundColor"
            :color="cfgChart.color"
            :active="isAnnotator"
            :isCursorPointer="isCursorPointer"
            :palette="cfgUserOptions.annotatorPalette"
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
            :hasPdf="cfgUserOptions.buttons.pdf"
            :hasXls="cfgUserOptions.buttons.csv"
            :hasImg="cfgUserOptions.buttons.img"
            :hasSvg="cfgUserOptions.buttons.svg"
            :hasTable="cfgUserOptions.buttons.table"
            :hasLabel="cfgUserOptions.buttons.labels"
            :hasFullscreen="cfgUserOptions.buttons.fullscreen"
            :hasAltCopy="cfgUserOptions.buttons.altCopy"
            :isFullscreen="isFullscreen"
            :isTooltip="mutableConfig.showTooltip"
            :titles="{ ...cfgUserOptions.buttonTitles }"
            :chartElement="pcpChart"
            :position="cfgUserOptions.position"
            :hasAnnotator="cfgUserOptions.buttons.annotator"
            :isAnnotation="isAnnotator"
            :callbacks="cfgUserOptions.callbacks"
            :printScale="cfgUserOptions.print.scale"
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
                :xmlns="XMLNS"
                :aria-describedby="`chart-instructions-${uid}`"
                :class="{
                    'vue-data-ui-fullscreen--on': isFullscreen,
                    'vue-data-ui-fulscreen--off': !isFullscreen,
                    'vue-data-ui-no-transition': !transitionEnabled,
                }"
                :viewBox="`0 0 ${drawingArea.chartWidth <= 0 ? 10 : drawingArea.chartWidth} ${drawingArea.chartHeight <= 0 ? 10 : drawingArea.chartHeight}`"
                :style="`max-width:100%; overflow: visible; background:transparent;color:${cfgChart.color}`"
                tabindex="0"
                @focus="onSvgFocus"
                @blur="onSvgBlur"
                @keydown="onSvgKeydown"
            >
                <PackageVersion />

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
                                'vue-data-ui-transition': transitionEnabled,
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
                                    'vue-data-ui-transition': transitionEnabled,
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
                        <!-- SINGLE LINE -->
                        <text
                            v-if="!String(scale.name).includes('\n')"
                            class="vue-ui-parallel-coordinate-plot-x-label"
                            data-cy="pcp-axis-label"
                            :fill="cfgYAxisLabels.axisNamesColor"
                            :font-size="chartDimensions.axisNameFontSize"
                            :font-weight="
                                cfgYAxisLabels.axisNamesBold ? 'bold' : ''
                            "
                            :text-anchor="
                                cfgYAxisLabels.axisNamesRotation === 0
                                    ? 'middle'
                                    : cfgYAxisLabels.axisNamesRotation < 0
                                      ? 'start'
                                      : 'end'
                            "
                            :transform="`translate(${drawingArea.left + slot * i + slot / 2}, ${topLabelsHeight - chartDimensions.axisNameFontSize}), rotate(${cfgYAxisLabels.axisNamesRotation})`"
                        >
                            {{ scale.name }}
                        </text>

                        <!-- MULTILINE -->
                        <text
                            v-else
                            data-cy="pcp-axis-label"
                            class="vue-ui-parallel-coordinate-plot-x-label"
                            :fill="cfgYAxisLabels.axisNamesColor"
                            :font-size="chartDimensions.axisNameFontSize"
                            :font-weight="
                                cfgYAxisLabels.axisNamesBold ? 'bold' : ''
                            "
                            :text-anchor="
                                cfgYAxisLabels.axisNamesRotation === 0
                                    ? 'middle'
                                    : cfgYAxisLabels.axisNamesRotation < 0
                                      ? 'start'
                                      : 'end'
                            "
                            :transform="`translate(${drawingArea.left + slot * i + slot / 2}, ${topLabelsHeight - chartDimensions.axisNameFontSize}), rotate(${cfgYAxisLabels.axisNamesRotation})`"
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
                                    useTooltip({
                                        shape: serie.shape,
                                        serieName: serie.name,
                                        serie: serieSet,
                                        relativeIndex: i,
                                        seriesIndex: serieSet.seriesIndex,
                                        S,
                                        triggerMode: 'pointer',
                                    })
                                "
                                @mouseleave="
                                    onTrapLeave({
                                        serie: serieSet,
                                        shape: serie.shape,
                                        S,
                                    })
                                "
                                :style="`opacity:${selectedItem ? (selectedItem === serieSet.id ? cfgChart.plots.opacity : 0.2) : cfgChart.plots.opacity}`"
                                @click="
                                    () =>
                                        selectDatapoint({
                                            serie: serieSet,
                                            shape: serie.shape,
                                            S,
                                        })
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
                                'vue-data-ui-transition': transitionEnabled,
                            }"
                            @mouseenter="
                                useTooltip({
                                    shape: serie.shape,
                                    serieName: serie.name,
                                    serie: serieSet,
                                    relativeIndex: i,
                                    seriesIndex: serieSet.seriesIndex,
                                    S,
                                    triggerMode: 'pointer',
                                })
                            "
                            @mouseleave="
                                onTrapLeave({
                                    serie: serieSet,
                                    shape: serie.shape,
                                    S,
                                })
                            "
                            @click="
                                () =>
                                    selectDatapoint({
                                        serie: serieSet,
                                        shape: serie.shape,
                                        S,
                                    })
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
                                'vue-data-ui-transition': transitionEnabled,
                            }"
                            @mouseenter="
                                useTooltip({
                                    shape: serie.shape,
                                    serieName: serie.name,
                                    serie: serieSet,
                                    relativeIndex: i,
                                    seriesIndex: serieSet.seriesIndex,
                                    S,
                                    triggerMode: 'pointer',
                                })
                            "
                            @mouseleave="
                                onTrapLeave({
                                    serie: serieSet,
                                    shape: serie.shape,
                                    S,
                                })
                            "
                            @click="
                                () =>
                                    selectDatapoint({
                                        serie: serieSet,
                                        shape: serie.shape,
                                        S,
                                    })
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
                                    'vue-data-ui-transition': transitionEnabled,
                                }"
                                :font-size="chartDimensions.datapointFontSize"
                                :stroke="cfgChart.backgroundColor"
                                :stroke-width="3"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                paint-order="stroke fill"
                                @mouseenter="
                                    useTooltip({
                                        shape: serie.shape,
                                        serieName: serie.name,
                                        serie: serieSet,
                                        relativeIndex: i,
                                        seriesIndex: serieSet.seriesIndex,
                                        S,
                                        triggerMode: 'pointer',
                                    })
                                "
                                @mouseleave="
                                    onTrapLeave({
                                        serie: serieSet,
                                        shape: serie.shape,
                                        S,
                                    })
                                "
                                @click="
                                    () =>
                                        selectDatapoint({
                                            serie: serieSet,
                                            shape: serie.shape,
                                            S,
                                        })
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
