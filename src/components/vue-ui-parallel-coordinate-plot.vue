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
} from "vue";
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
    downloadCsv, 
    error, 
    functionReturnsString, 
    getMissingDatasetAttributes, 
    getPathLengthFromCoordinates,
    isFunction, 
    objectIsEmpty,
    palette, 
    themePalettes,
    translateSize,
    treeShake,
    XMLNS,
} from "../lib";
import { throttle } from "../canvas-lib";
import { useConfig } from "../useConfig";
import { usePrinter } from "../usePrinter";
import { useLoading } from "../useLoading";
import { useSvgExport } from "../useSvgExport";
import { useResponsive } from "../useResponsive";
import { useNestedProp } from "../useNestedProp";
import { useThemeCheck } from "../useThemeCheck";
import { useUserOptionState } from "../useUserOptionState";
import { useChartAccessibility } from "../useChartAccessibility";
import { useTimeLabelCollision } from "../useTimeLabelCollider";
import themes from "../themes/vue_ui_parallel_coordinate_plot.json";
import Title from "../atoms/Title.vue"; // Must be ready in responsive mode
import Legend from "../atoms/Legend.vue"; // Must be ready in responsive mode
import Shape from "../atoms/Shape.vue";
import img from "../img";
import BaseScanner from "../atoms/BaseScanner.vue";

const Tooltip = defineAsyncComponent(() => import('../atoms/Tooltip.vue'));
const BaseIcon = defineAsyncComponent(() => import('../atoms/BaseIcon.vue'));
const Accordion = defineAsyncComponent(() => import('./vue-ui-accordion.vue'));
const DataTable = defineAsyncComponent(() => import('../atoms/DataTable.vue'));
const PenAndPaper = defineAsyncComponent(() => import('../atoms/PenAndPaper.vue'));
const UserOptions = defineAsyncComponent(() => import('../atoms/UserOptions.vue'));
const PackageVersion = defineAsyncComponent(() => import('../atoms/PackageVersion.vue'));
const BaseDraggableDialog = defineAsyncComponent(() => import('../atoms/BaseDraggableDialog.vue'));

const { vue_ui_parallel_coordinate_plot: DEFAULT_CONFIG } = useConfig();
const { isThemeValid, warnInvalidTheme } = useThemeCheck();

const props = defineProps({
    config: {
        type: Object,
        default() {
            return {}
        }
    },
    dataset: {
        type: Array,
        default() {
            return []
        }
    },
});

const isDataset = computed({
    get() {
        return !!props.dataset && props.dataset.length
    },
    set(bool) {
        return bool
    }
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

const uid = ref(createUid());
const isFullscreen = ref(false)
function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
}

const FINAL_CONFIG = ref(prepareConfig());

const { loading, FINAL_DATASET, manualLoading } = useLoading({
    ...toRefs(props),
    FINAL_CONFIG,
    prepareConfig,
    callback: () => {
        Promise.resolve().then(async () => {
            await nextTick();
            mutableConfig.value.showTable = FINAL_CONFIG.value.table.show;
        })
    },
    skeletonDataset: [
        {
            name: '',
            shape: 'circle',
            color: 'transparent',
            series: [
                {
                    name: '',
                    values: [1, 10, 100, 1000],
                },
            ]
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
            ]
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
            ]
        },
    ],
    skeletonConfig: treeShake({
        defaultConfig: FINAL_CONFIG.value,
        userConfig: {
            useCssAnimation: false,
            userOptions: { show: false, },
            table: { show: false },
            style: {
                chart: {
                    backgroundColor: '#99999930',
                    legend: {
                        show: true,
                        backgroundColor: 'transparent'
                    },
                    yAxis: {
                        stroke: '#6A6A6A',
                        labels: {
                            showAxisNames: false,
                            axisNames: [],
                            ticks: {
                                color: '#6A6A6A',
                            }
                        }
                    }
                }
            }
        }
    })
});

const { userOptionsVisible, setUserOptionsVisibility, keepUserOptionState } = useUserOptionState({ config: FINAL_CONFIG.value });
const { svgRef } = useChartAccessibility({ config: FINAL_CONFIG.value.style.chart.title });

function prepareConfig() {
    const mergedConfig = useNestedProp({
        userConfig: props.config,
        defaultConfig: DEFAULT_CONFIG
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

    return {
        ...finalConfig,
        customPalette: finalConfig.customPalette.length ? finalConfig.customPalette : themePalettes[theme] || palette
    }
}

watch(() => props.config, (_newCfg) => {
    if (!loading.value) {
        FINAL_CONFIG.value = prepareConfig();
    }
    userOptionsVisible.value = !FINAL_CONFIG.value.userOptions.showOnChartHover;
    prepareChart();
    titleStep.value += 1;
    tableStep.value += 1;
    legendStep.value += 1;

    // Reset mutable config
    mutableConfig.value.dataLabels.show = FINAL_CONFIG.value.style.chart.yAxis.labels.datapoints.show;
    mutableConfig.value.showTable = FINAL_CONFIG.value.table.show;
    mutableConfig.value.showTooltip = FINAL_CONFIG.value.style.chart.tooltip.show;
}, { deep: true });

watch(() => props.dataset, (_) => {
    if (Array.isArray(_) && _.length > 0) {
        manualLoading.value = false;
    }
}, { deep: true })

const resizeObserver = shallowRef(null);
const observedEl = shallowRef(null);

onMounted(() => {
    readyTeleport.value = true;
    prepareChart();
});

const debug = computed(() => !!FINAL_CONFIG.value.debug);

function prepareChart() {
    if(objectIsEmpty(props.dataset)) {
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
                requiredAttributes: ['name', 'series']
            }).forEach(attr => {
                isDataset.value = false;
                error({
                    componentName: 'VueUiParallelCoordinatePlot',
                    type: 'datasetSerieAttribute',
                    property: attr,
                    index: i,
                    debug: debug.value
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
                title: FINAL_CONFIG.value.style.chart.title.text ? chartTitle.value : null,
                legend: FINAL_CONFIG.value.style.chart.legend.show ? chartLegend.value : null,
                source: source.value,
                noTitle: noTitle.value
            });

            requestAnimationFrame(() => {
                chartDimensions.value.width = width;
                chartDimensions.value.height = height - 12;

                if (FINAL_CONFIG.value.responsiveProportionalSizing) {
                    chartDimensions.value.plotSize = translateSize({
                        relator: Math.min(width, height),
                        adjuster: 600,
                        source: FINAL_CONFIG.value.style.chart.plots.radius,
                        threshold: 2,
                        fallback: 2
                    });
                    chartDimensions.value.ticksFontSize = translateSize({
                        relator: Math.min(width, height),
                        adjuster: 600,
                        source: FINAL_CONFIG.value.style.chart.yAxis.labels.ticks.fontSize,
                        threshold: 10,
                        fallback: 10
                    });
                    chartDimensions.value.datapointFontSize = translateSize({
                        relator: Math.min(width, height),
                        adjuster: 600,
                        source: FINAL_CONFIG.value.style.chart.yAxis.labels.datapoints.fontSize,
                        threshold: 10,
                        fallback: 10
                    });
                    chartDimensions.value.axisNameFontSize = translateSize({
                        relator: Math.min(width, height),
                        adjuster: 600,
                        source: FINAL_CONFIG.value.style.chart.yAxis.labels.axisNamesFontSize,
                        threshold: 12,
                        fallback: 12
                    });
                } else {
                    chartDimensions.value.plotSize = FINAL_CONFIG.value.style.chart.plots.radius; 
                    chartDimensions.value.ticksFontSize = FINAL_CONFIG.value.style.chart.yAxis.labels.ticks.fontSize;
                    chartDimensions.value.datapointFontSize = FINAL_CONFIG.value.style.chart.yAxis.labels.datapoints.fontSize;
                    chartDimensions.value.axisNameFontSize = FINAL_CONFIG.value.style.chart.yAxis.labels.axisNamesFontSize;
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
    fileName: FINAL_CONFIG.value.style.chart.title.text || 'vue-ui-parallel-coordinate-plot',
    options: FINAL_CONFIG.value.userOptions.print
});

const hasOptionsNoTitle = computed(() => {
    return FINAL_CONFIG.value.userOptions.show && !FINAL_CONFIG.value.style.chart.title.text;
});

const chartDimensions = ref({
    height: FINAL_CONFIG.value.style.chart.height,
    width: FINAL_CONFIG.value.style.chart.width,
    plotSize: FINAL_CONFIG.value.style.chart.plots.radius, // ratio 100
    ticksFontSize: FINAL_CONFIG.value.style.chart.yAxis.labels.ticks.fontSize, // ratio 42.85
    datapointFontSize: FINAL_CONFIG.value.style.chart.yAxis.labels.datapoints.fontSize,
    axisNameFontSize: FINAL_CONFIG.value.style.chart.yAxis.labels.axisNamesFontSize
});

const WIDTH = computed(() => chartDimensions.value.width);
const HEIGHT = computed(() => chartDimensions.value.height);

const topLabelsHeight = ref(0);

const updateTopLabelsHeight = throttle((h) => {
    topLabelsHeight.value = h
}, 100);

// Track time label height to update drawing area when they rotate
watchEffect((onInvalidate) => {
    const el = xAxisLabels.value
    if (!el) return

    const observer = new ResizeObserver(entries => {
        updateTopLabelsHeight(entries[0].contentRect.height)
    })
    observer.observe(el)
    onInvalidate(() => observer.disconnect())
});

const drawingArea = computed(() => {
    const { top: p_top, right: p_right, bottom: p_bottom, left: p_left } = FINAL_CONFIG.value.style.chart.padding;
    const chartHeight = HEIGHT.value;
    const chartWidth = WIDTH.value;
    return {
        chartHeight: Math.max(0.001, chartHeight),
        chartWidth: Math.max(0.001, chartWidth),
        height: Math.max(0.001, chartHeight - p_top - p_bottom - topLabelsHeight.value - (chartDimensions.value.datapointFontSize * 2)),
        width: Math.max(0.001, chartWidth - p_left - p_right),
        top: p_top + topLabelsHeight.value + (chartDimensions.value.datapointFontSize),
        left: p_left,
        right: chartWidth - p_right,
        bottom: chartHeight - p_bottom - (chartDimensions.value.datapointFontSize)
    }
});

const customPalette = computed(() => {
    return convertCustomPalette(FINAL_CONFIG.value.customPalette);
});

const mutableConfig = ref({
    dataLabels: {
        show: FINAL_CONFIG.value.style.chart.yAxis.labels.datapoints.show
    },
    showTable: FINAL_CONFIG.value.table.show,
    showTooltip: FINAL_CONFIG.value.style.chart.tooltip.show
});

// v3 - Essential to make shifting between loading config and final config work
watch(FINAL_CONFIG, () => {
    mutableConfig.value = {
        dataLabels: {
            show: FINAL_CONFIG.value.style.chart.yAxis.labels.datapoints.show
        },
        showTable: FINAL_CONFIG.value.table.show,
        showTooltip: FINAL_CONFIG.value.style.chart.tooltip.show
    }
}, { immediate: true });

const segregated = ref([]);

function segregate(id) {
    if (segregated.value.includes(id)) {
        segregated.value = segregated.value.filter(el => el !== id);
    } else {
        segregated.value.push(id);
    }
}

const immutableDataset = computed(() => {
    return FINAL_DATASET.value.map((ds, i) => {
        const color = convertColorToHex(ds.color) || customPalette.value[i] || palette[i] || palette[i % palette.length];
        return {
            ...ds,
            series: ds.series.map(s => {
                return {
                    ...s,
                    id: createUid(),
                    color,
                }
            }),
            seriesIndex: i,
            color,
            id: createUid(),
            shape: ds.shape || 'circle'
        }
    });
});

function validSeriesToToggle(name) {
    if (!immutableDataset.value.length) {
        if (FINAL_CONFIG.value.debug) {
            console.warn('VueUiParallelCoordinatePlot - There are no series to show.');
        }
        return null;
    }
    const dp = immutableDataset.value.find(d => d.name === name);
    if (!dp) {
        if (FINAL_CONFIG.value.debug) {
            console.warn(`VueUiParallelCoordinatePlot - Series name not found "${name}"`);
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
    const dp  = validSeriesToToggle(name);
    if (dp === null) return;
    if (!segregated.value.includes(dp.id))  {
        segregate(dp.id);
    }
}

const legendSet = computed(() => {
    return immutableDataset.value.map(ds => {
        return {
            ...ds,
            opacity: segregated.value.includes(ds.id) ? 0.5 : 1,
            segregate: () => segregate(ds.id),
            isSegregated: segregated.value.includes(ds.id),
            shape: ds.shape || 'circle'
        }
    });
});

const legendConfig = computed(() => {
    return {
        cy: 'pcp-div-legend',
        backgroundColor: FINAL_CONFIG.value.style.chart.legend.backgroundColor,
        color: FINAL_CONFIG.value.style.chart.legend.color,
        fontSize: FINAL_CONFIG.value.style.chart.legend.fontSize,
        paddingBottom: 12,
        fontWeight: FINAL_CONFIG.value.style.chart.legend.bold ? 'bold' : ''
    }
})

const maxSeries = computed(() => {
    return Math.max(...immutableDataset.value
        .filter(ds => !segregated.value.includes(ds.id))
        .map(ds => Math.max(...ds.series.flatMap(s => s.values.length)))
    );
});

const slot = computed(() => {
    return drawingArea.value.width / maxSeries.value;
});

const filteredDs = computed(() => {
    return immutableDataset.value.filter(ds => !segregated.value.includes(ds.id));
});

const scales = computed(() => {
    let s = [];
    for (let i = 0; i < maxSeries.value; i += 1 ) {
        const min = Math.min(...filteredDs.value.flatMap(ds => ds.series.map(s => s.values[i] || 0) || 0));
        const max = Math.max(...filteredDs.value.flatMap(ds => ds.series.map(s => s.values[i] || 0) || 0));
        const opMin = max === min ? min / 4 : min;
        const opMax = max === min ? max * 2 : max;
        const scale = calculateNiceScale(opMin, opMax, FINAL_CONFIG.value.style.chart.yAxis.scaleTicks);
        const ticks = scale.ticks.map((t, k) => {
            const senseValue = scale.min < 0 ? t + Math.abs(scale.min) : t - Math.abs(scale.min);
            const senseMax = scale.min < 0 ? scale.max + Math.abs(scale.min) : scale.max - Math.abs(scale.min);
            return {
                y: drawingArea.value.bottom - (drawingArea.value.height * (senseValue / senseMax)),
                x: drawingArea.value.left + (slot.value * i) + (slot.value / 2),
                value: t,
            }
        });
        s.push({
            scale,
            ticks,
            name: FINAL_CONFIG.value.style.chart.yAxis.labels.axisNames[i] || `Y-${i + 1}`
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
                            const senseValue = scales.value[k].scale.min < 0 ? (v || 0) + Math.abs(scales.value[k].scale.min) : (v || 0) - Math.abs(scales.value[k].scale.min);
                            const senseMax = scales.value[k].scale.min < 0 ? scales.value[k].scale.max + Math.abs(scales.value[k].scale.min) : scales.value[k].scale.max - Math.abs(scales.value[k].scale.min);
                            return {
                                name: s.name,
                                seriesName: ds.name,
                                axisIndex: k,
                                datapointIndex: j,
                                seriesIndex: i,
                                value: v || 0,
                                x: drawingArea.value.left + (slot.value * k) + (slot.value / 2),
                                y: (drawingArea.value.bottom - (drawingArea.value.height * ((senseValue) / senseMax))),
                                comment: s.comments ? s.comments[k] || '' : ''
                            }
                        })
                    }
                })
            }
        })
        .map(ds => {
            return {
                ...ds,
                series: ds.series.map(s => {
                    const straightPath = createStraightPath(s.datapoints);
                    const smoothPath = createSmoothPath(s.datapoints, 0.12);
                    const pathLength = getPathLengthFromCoordinates(FINAL_CONFIG.value.style.chart.lines.smooth ? `M ${smoothPath}`: `M ${straightPath}`) 
                    return {
                        ...s,
                        smoothPath,
                        straightPath,
                        pathLength
                    }
                })
            }
        });
});


function makeDataLabel({ value, index, datapoint }) {
    return applyDataLabel(
        FINAL_CONFIG.value.style.chart.yAxis.labels.formatters[index] || null,
        value,
        dataLabel({
            p: FINAL_CONFIG.value.style.chart.yAxis.labels.prefixes[index] || '',
            v: value,
            s: FINAL_CONFIG.value.style.chart.yAxis.labels.suffixes[index] || '',
            r: FINAL_CONFIG.value.style.chart.yAxis.labels.roundings[index] || 0
        }),
        { datapoint, seriesIndex: index }
    )
}

const selectedItem = ref(null);
const dataTooltipSlot = ref(null);
const isTooltip = ref(false);
const tooltipContent = ref("");

function onTrapLeave({ shape, serie, S }) {
    if (FINAL_CONFIG.value.events.datapointLeave) {
        FINAL_CONFIG.value.events.datapointLeave({ datapoint: { ...serie, shape }, seriesIndex: S });
    }
    selectedItem.value = null;
    isTooltip.value = null;
}

function useTooltip({ shape, serieName, serie, relativeIndex, seriesIndex, S }) {

    if (FINAL_CONFIG.value.events.datapointEnter) {
        FINAL_CONFIG.value.events.datapointEnter({ datapoint: {...serie, shape }, seriesIndex: S })
    }

    dataTooltipSlot.value = { serie, relativeIndex, seriesIndex, series: immutableDataset.value, scales: scales.value };
    isTooltip.value = true;
    selectedItem.value = serie.id;
    let html = "";

    const customFormat = FINAL_CONFIG.value.style.chart.tooltip.customFormat;

    if (isFunction(customFormat) && functionReturnsString(() => customFormat({
        serie,
        seriesIndex: serie.seriesIndex,
        series: immutableDataset.value,
        config: FINAL_CONFIG.value,
        scales: scales.value
    }))) {
        tooltipContent.value = customFormat({
            serie,
            seriesIndex: serie.seriesIndex,
            series: immutableDataset.value,
            config: FINAL_CONFIG.value,
            scales: scales.value
        });
    } else {
        html += `<div style="width:100%;text-align:center;border-bottom:1px solid ${FINAL_CONFIG.value.style.chart.tooltip.borderColor};padding-bottom:6px;margin-bottom:3px;">${serieName ? serieName + ' - ' : ''}${serie.name}</div>`;
        scales.value.map(s => s.name).forEach((s, i) => {
            html += `
                <div class="vue-ui-tooltip-item" style="text-align:left">
                    <span>${s}: </span>
                    <span>
                        ${applyDataLabel(
                            FINAL_CONFIG.value.style.chart.yAxis.labels.formatters[i] || null,
                            serie.datapoints[i].value,
                            dataLabel({
                                p: FINAL_CONFIG.value.style.chart.yAxis.labels.prefixes[i] || '',
                                v: serie.datapoints[i].value,
                                s: FINAL_CONFIG.value.style.chart.yAxis.labels.suffixes[i] || '',
                                r: FINAL_CONFIG.value.style.chart.yAxis.labels.roundings[i] || '',
                            }),
                            { datapoint: serie.datapoints[i], seriesIndex: i }
                        )}    
                    </span>
                </div>
            `;
            if (FINAL_CONFIG.value.style.chart.comments.showInTooltip && serie.datapoints[i].comment) {
                html += `<div class="vue-data-ui-tooltip-comment" style="background:${serie.color}20; padding: 6px; margin-bottom: 6px; border-left: 1px solid ${serie.color}">${serie.datapoints[i].comment}</div>`
            }
        })
        tooltipContent.value = `<div>${html}</div>`;
    }
}

function getData() {
    return immutableDataset.value;
}

const dataTable = computed(() => {
    const head = [FINAL_CONFIG.value.table.columnNames.series].concat([FINAL_CONFIG.value.table.columnNames.item]).concat(scales.value.map(s => s.name));
    const body = mutableDataset.value.flatMap((ds, i) => {
        return ds.series.map(s => {
            return [ds.name].concat([s.name]).concat(s.values)
        })
    });

    const config = {
        th: {
            backgroundColor: FINAL_CONFIG.value.table.th.backgroundColor,
            color: FINAL_CONFIG.value.table.th.color,
            outline: FINAL_CONFIG.value.table.th.outline
        },
        td: {
            backgroundColor: FINAL_CONFIG.value.table.td.backgroundColor,
            color: FINAL_CONFIG.value.table.td.color,
            outline: FINAL_CONFIG.value.table.td.outline
        },
        breakpoint: FINAL_CONFIG.value.table.responsiveBreakpoint
    }

    const colNames = [FINAL_CONFIG.value.table.columnNames.series].concat([FINAL_CONFIG.value.table.columnNames.item]).concat(scales.value.map(s => s.name))

    return {
        body,
        head,
        config,
        colNames
    }
});

const tableCsv = computed(() => {
    if (mutableDataset.value.length === 0) return { head: [], body: [], config: {}, columnNames: []};

    return {
        head: dataTable.value.head,
        body: dataTable.value.body
    }
});

function generateCsv(callback=null) {
    const title = [[FINAL_CONFIG.value.style.chart.title.text], [FINAL_CONFIG.value.style.chart.title.subtitle.text], [""]];
    const head = tableCsv.value.head
    const body = tableCsv.value.body;
    const table = title.concat([head]).concat(body);
    const csvContent = createCsvContent(table);

    if (!callback) {
        downloadCsv({ csvContent, title: FINAL_CONFIG.value.style.chart.title.text || 'vue-ui-parallel-coordinate-plot'});
    } else {
        callback(csvContent);
    }
}

const emit = defineEmits(['selectLegend', 'selectDatapoint'])

function selectDatapoint({ serie, shape, S }) {
    if (FINAL_CONFIG.value.events.datapointClick) {
        FINAL_CONFIG.value.events.datapointClick({ datapoint: { ...serie, shape }, seriesIndex: S });
    }
    emit('selectDatapoint', serie)
}

function selectLegend(legend) {
    emit('selectLegend', {
        ...legend,
        isSegregated: !legend.isSegregated,
        opacity: legend.isSegregated ? 1 : 0.5
    })
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

async function getImage({ scale = 2} = {}) {
    if (!pcpChart.value) return;
    const { width, height } = pcpChart.value.getBoundingClientRect();
    const aspectRatio = width / height;
    const { imageUri, base64 } = await img({ domElement: pcpChart.value, base64: true, img: true, scale})
    return { 
        imageUri, 
        base64, 
        title: FINAL_CONFIG.value.style.chart.title.text,
        width,
        height,
        aspectRatio
    }
}

const dummySlicer = ref({ start: 0, end: 1 });
const timeLabels = computed(() => scales.value.map(s => s.name));

useTimeLabelCollision({
    timeLabelsEls: xAxisLabels,
    timeLabels,
    slicer: dummySlicer,
    configRef: FINAL_CONFIG,
    rotationPath: ['style', 'chart', 'yAxis', 'labels', 'axisNamesRotation'],
    autoRotatePath: ['style', 'chart', 'yAxis', 'labels', 'axisNamesAutoRotate', 'enable'],
    isAutoSize: false,
    width: WIDTH,
    height: HEIGHT,
    targetClass: '.vue-ui-parallel-coordinate-plot-x-label',
    rotation: FINAL_CONFIG.value.style.chart.yAxis.labels.axisNamesAutoRotate.angle
});

const tableComponent = computed(() => {
    const useDialog = FINAL_CONFIG.value.table.useDialog && !FINAL_CONFIG.value.table.show;
    const open = mutableConfig.value.showTable;
    return {
        component: useDialog ? BaseDraggableDialog : Accordion,
        title: `${FINAL_CONFIG.value.style.chart.title.text}${FINAL_CONFIG.value.style.chart.title.subtitle.text ? `: ${FINAL_CONFIG.value.style.chart.title.subtitle.text}` : ''}`,
        props: useDialog ? {
            backgroundColor: FINAL_CONFIG.value.table.th.backgroundColor,
            color: FINAL_CONFIG.value.table.th.color,
            headerColor: FINAL_CONFIG.value.table.th.color,
            headerBg: FINAL_CONFIG.value.table.th.backgroundColor,
            isFullscreen: isFullscreen.value,
            fullscreenParent: pcpChart.value,
            forcedWidth: Math.min(800, window.innerWidth * 0.8)
        } : {
            hideDetails: true,
            config: {
                open,
                maxHeight: 10000,
                body: {
                    backgroundColor: FINAL_CONFIG.value.style.chart.backgroundColor,
                    color: FINAL_CONFIG.value.style.chart.color
                },
                head: {
                    backgroundColor: FINAL_CONFIG.value.style.chart.backgroundColor,
                    color: FINAL_CONFIG.value.style.chart.color
                }
            }
        }
    }
});

watch(() => mutableConfig.value.showTable, v => {
    if (FINAL_CONFIG.value.table.show) return;
    if (v && FINAL_CONFIG.value.table.useDialog && tableUnit.value) {
        tableUnit.value.open()
    } else {
        if ('close' in tableUnit.value) {
            tableUnit.value.close()
        }
    }
});

function closeTable() {
    mutableConfig.value.showTable = false;
    if (userOptionsRef.value) {
        userOptionsRef.value.setTableIconState(false);
    }
}

const svgBg = computed(() => FINAL_CONFIG.value.style.chart.backgroundColor);
const svgLegend = computed(() => FINAL_CONFIG.value.style.chart.legend);
const svgTitle = computed(() => FINAL_CONFIG.value.style.chart.title);

const { exportSvg, getSvg } = useSvgExport({
    svg: svgRef,
    title: svgTitle,
    legend: svgLegend,
    legendItems: legendSet,
    backgroundColor: svgBg
});

async function generateSvg({ isCb }) {
    if (isCb) {
        const { blob, url, text, dataUrl } = await getSvg();
        FINAL_CONFIG.value.userOptions.callbacks.svg({ blob, url, text, dataUrl })

    } else {
        exportSvg();
    }
}

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
    toggleFullscreen
});

</script>

<template>
    <div
        ref="pcpChart"
        :class="`vue-data-ui-component vue-ui-pcp ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''} ${FINAL_CONFIG.useCssAnimation ? '' : 'vue-ui-dna'}`" 
        :style="`font-family:${FINAL_CONFIG.style.fontFamily};width:100%; text-align:center;background:${FINAL_CONFIG.style.chart.backgroundColor};${FINAL_CONFIG.responsive ? 'height:100%' : ''}`" 
        :id="`pcp_${uid}`"
        @mouseenter="() => setUserOptionsVisibility(true)" 
        @mouseleave="() => setUserOptionsVisibility(false)"
    >
        <PenAndPaper
            v-if="FINAL_CONFIG.userOptions.buttons.annotator"
            :svgRef="svgRef"
            :backgroundColor="FINAL_CONFIG.style.chart.backgroundColor"
            :color="FINAL_CONFIG.style.chart.color"
            :active="isAnnotator"
            @close="toggleAnnotator"
        >
            <template #annotator-action-close>
                <slot name="annotator-action-close"/>
            </template>
            <template #annotator-action-color="{ color }">
                <slot name="annotator-action-color" v-bind="{ color }"/>
            </template>
            <template #annotator-action-draw="{ mode }">
                <slot name="annotator-action-draw" v-bind="{ mode }"/>
            </template>
            <template #annotator-action-undo="{ disabled }">
                <slot name="annotator-action-undo" v-bind="{ disabled }"/>
            </template>
            <template #annotator-action-redo="{ disabled }">
                <slot name="annotator-action-redo" v-bind="{ disabled }"/>
            </template>
            <template #annotator-action-delete="{ disabled }">
                <slot name="annotator-action-delete" v-bind="{ disabled }"/>
            </template>
        </PenAndPaper>

        <div
            ref="noTitle"
            v-if="hasOptionsNoTitle" 
            class="vue-data-ui-no-title-space" 
            :style="`height:36px; width: 100%;background:transparent`"
        />

        <div ref="chartTitle" v-if="FINAL_CONFIG.style.chart.title.text" :style="`width:100%;background:transparent;padding-bottom:24px`">
            <Title
                :key="`title_${titleStep}`"
                :config="{
                    title: {
                        cy: 'pcp-div-title',
                        ...FINAL_CONFIG.style.chart.title
                    },
                    subtitle: {
                        cy: 'pcp-div-subtitle',
                        ...FINAL_CONFIG.style.chart.title.subtitle
                    }
                }"
            />
        </div>

        <div :id="`legend-top-${uid}`" />

        <UserOptions
            ref="userOptionsRef"
            :key="`user_options_${step}`"
            v-if="FINAL_CONFIG.userOptions.show && isDataset && (keepUserOptionState ? true : userOptionsVisible)"
            :backgroundColor="FINAL_CONFIG.style.chart.backgroundColor"
            :color="FINAL_CONFIG.style.chart.color"
            :isPrinting="isPrinting"
            :isImaging="isImaging"
            :uid="uid"
            :hasTooltip="FINAL_CONFIG.userOptions.buttons.tooltip && FINAL_CONFIG.style.chart.tooltip.show"
            :hasPdf="FINAL_CONFIG.userOptions.buttons.pdf"
            :hasXls="FINAL_CONFIG.userOptions.buttons.csv"
            :hasImg="FINAL_CONFIG.userOptions.buttons.img"
            :hasSvg="FINAL_CONFIG.userOptions.buttons.svg"
            :hasTable="FINAL_CONFIG.userOptions.buttons.table"
            :hasLabel="FINAL_CONFIG.userOptions.buttons.labels"
            :hasFullscreen="FINAL_CONFIG.userOptions.buttons.fullscreen"
            :isFullscreen="isFullscreen"
            :isTooltip="mutableConfig.showTooltip"
            :titles="{ ...FINAL_CONFIG.userOptions.buttonTitles }"
            :chartElement="pcpChart"
            :position="FINAL_CONFIG.userOptions.position"
            :hasAnnotator="FINAL_CONFIG.userOptions.buttons.annotator"
            :isAnnotation="isAnnotator"
            :callbacks="FINAL_CONFIG.userOptions.callbacks"
            :printScale="FINAL_CONFIG.userOptions.print.scale"
            :tableDialog="FINAL_CONFIG.table.useDialog"
            @toggleFullscreen="toggleFullscreen"
            @generatePdf="generatePdf"
            @generateCsv="generateCsv"
            @generateImage="generateImage"
            @generateSvg="generateSvg"
            @toggleTable="toggleTable"
            @toggleLabels="toggleLabels"
            @toggleTooltip="toggleTooltip"
            @toggleAnnotator="toggleAnnotator"
            :style="{
                visibility: keepUserOptionState ? userOptionsVisible ? 'visible' : 'hidden' : 'visible'
            }"
        >
            <template #menuIcon="{ isOpen, color }" v-if="$slots.menuIcon">
                <slot name="menuIcon" v-bind="{ isOpen, color }"/>
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
            <template v-if="$slots.optionFullscreen" template #optionFullscreen="{ toggleFullscreen, isFullscreen }">
                <slot name="optionFullscreen" v-bind="{ toggleFullscreen, isFullscreen }"/>
            </template>
            <template v-if="$slots.optionAnnotator" #optionAnnotator="{ toggleAnnotator, isAnnotator }">
                <slot name="optionAnnotator" v-bind="{ toggleAnnotator, isAnnotator }" />
            </template>
        </UserOptions>

        <svg
            ref="svgRef"
            :xmlns="XMLNS" 
            :class="{ 'vue-data-ui-fullscreen--on': isFullscreen, 'vue-data-ui-fulscreen--off': !isFullscreen }" :viewBox="`0 0 ${drawingArea.chartWidth <= 0 ? 10 : drawingArea.chartWidth} ${drawingArea.chartHeight <= 0 ? 10 : drawingArea.chartHeight}`" 
            :style="`max-width:100%; overflow: visible; background:transparent;color:${FINAL_CONFIG.style.chart.color}`"
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
                    pointerEvents: 'none'
                }"
            >
                <slot name="chart-background"/>
            </foreignObject>


            <!-- SCALES -->
            <g v-for="(scale, i) in scales" style="pointer-events: none;">
                <!-- AXIS -->
                <line
                    data-cy="pcp-axis"
                    :x1="drawingArea.left + (slot * i) + (slot / 2)"
                    :x2="drawingArea.left + (slot * i) + (slot / 2)"
                    :y1="drawingArea.top"
                    :y2="drawingArea.bottom"
                    :stroke="FINAL_CONFIG.style.chart.yAxis.stroke"
                    :stroke-width="FINAL_CONFIG.style.chart.yAxis.strokeWidth"
                />

                <template v-if="FINAL_CONFIG.style.chart.yAxis.labels.ticks.show">                
                    <!-- TICKS -->
                    <line v-for="tick in scale.ticks"
                        data-cy="scale-tick"
                        :x1="tick.x"
                        :x2="tick.x - 10"
                        :y1="tick.y"
                        :y2="tick.y"
                        :stroke="FINAL_CONFIG.style.chart.yAxis.stroke"
                        :stroke-width="FINAL_CONFIG.style.chart.yAxis.strokeWidth"
                        :style="`opacity:${selectedItem && !mutableConfig.showTooltip ? 0.2 : 1}`"
                    />
                    
                    <!-- TICK LABELS -->
                    <g v-if="!loading">
                        <text 
                            data-cy="scale-label"
                            v-for="(tick) in scale.ticks"
                            :x="tick.x - 12 + FINAL_CONFIG.style.chart.yAxis.labels.ticks.offsetX"
                            :y="tick.y + FINAL_CONFIG.style.chart.yAxis.labels.ticks.offsetY + (chartDimensions.ticksFontSize / 3)"
                            :fill="FINAL_CONFIG.style.chart.yAxis.labels.ticks.color"
                            text-anchor="end"
                            :font-size="chartDimensions.ticksFontSize"
                            :font-weight="FINAL_CONFIG.style.chart.yAxis.labels.ticks.bold ? 'bold' : 'normal'"
                            :style="`opacity:${selectedItem && !mutableConfig.showTooltip ? 0.2 : 1}`"
                        >
                            {{ makeDataLabel({ value: tick.value, index: i, datapoint: tick }) }}
                        </text>
                    </g>
                </template>
            </g>

            <!-- AXIS NAMES -->
            <g ref="xAxisLabels" v-if="FINAL_CONFIG.style.chart.yAxis.labels.showAxisNames">
                <template v-for="(scale, i) in scales" style="pointer-events: none;">
                    <!-- SINGLE LINE -->
                    <text
                        v-if="!String(scale.name).includes('\n')"
                        class="vue-ui-parallel-coordinate-plot-x-label"
                        data-cy="pcp-axis-label"
                        :fill="FINAL_CONFIG.style.chart.yAxis.labels.axisNamesColor"
                        :font-size="chartDimensions.axisNameFontSize"
                        :font-weight="FINAL_CONFIG.style.chart.yAxis.labels.axisNamesBold ? 'bold' : ''"
                        :text-anchor="FINAL_CONFIG.style.chart.yAxis.labels.axisNamesRotation === 0 ? 'middle' : FINAL_CONFIG.style.chart.yAxis.labels.axisNamesRotation < 0 ? 'start' : 'end'"
                        :transform="`translate(${drawingArea.left + (slot * i) + (slot / 2)}, ${topLabelsHeight - chartDimensions.axisNameFontSize}), rotate(${FINAL_CONFIG.style.chart.yAxis.labels.axisNamesRotation})`"
                    >
                        {{ scale.name }}
                    </text>

                    <!-- MULTILINE -->
                    <text
                        v-else
                        data-cy="pcp-axis-label"
                        class="vue-ui-parallel-coordinate-plot-x-label"
                        :fill="FINAL_CONFIG.style.chart.yAxis.labels.axisNamesColor"
                        :font-size="chartDimensions.axisNameFontSize"
                        :font-weight="FINAL_CONFIG.style.chart.yAxis.labels.axisNamesBold ? 'bold' : ''"
                        :text-anchor="FINAL_CONFIG.style.chart.yAxis.labels.axisNamesRotation === 0 ? 'middle' : FINAL_CONFIG.style.chart.yAxis.labels.axisNamesRotation < 0 ? 'start' : 'end'"
                        :transform="`translate(${drawingArea.left + (slot * i) + (slot / 2)}, ${topLabelsHeight - chartDimensions.axisNameFontSize}), rotate(${FINAL_CONFIG.style.chart.yAxis.labels.axisNamesRotation})`"
                        v-html="createTSpansFromLineBreaksOnX({
                            content: String(scale.name),
                            fontSize: chartDimensions.axisNameFontSize,
                            fill: FINAL_CONFIG.style.chart.yAxis.labels.axisNamesColor,
                            x: 0,
                            y: 0
                        })"
                    />
                </template>
            </g>

            <g v-for="(serie, S) in mutableDataset">
                <!-- DATAPOINTS -->
                <g v-for="(serieSet, i) in serie.series">
                    <!-- PLOTS -->
                    <g v-if="FINAL_CONFIG.style.chart.plots.show">
                        <Shape
                            v-for="(dp, D) in serieSet.datapoints"
                            :plot="{ x: dp.x, y: dp.y }"
                            :color="serie.color"
                            :shape="serie.shape"
                            :radius="serie.shape === 'triangle' ? chartDimensions.plotSize * 1.2 : chartDimensions.plotSize"
                            :stroke="FINAL_CONFIG.style.chart.backgroundColor"
                            :strokeWidth="0.5"
                            @mouseenter="useTooltip({
                                shape: serie.shape,
                                serieName: serie.name,
                                serie: serieSet,
                                relativeIndex: i,
                                seriesIndex: serieSet.seriesIndex,
                                S
                            })"
                            @mouseleave="onTrapLeave({ serie: serieSet, shape: serie.shape, S })"
                            :style="`opacity:${selectedItem ? selectedItem === serieSet.id ? FINAL_CONFIG.style.chart.plots.opacity : 0.2 : FINAL_CONFIG.style.chart.plots.opacity}`"
                            @click="() => selectDatapoint({ serie: serieSet, shape: serie.shape, S })"
                        />
                        <!-- SERIE LABEL WHEN TOOLTIP IS DISABLED -->
                        <template v-if="!mutableConfig.showTooltip" style="pointer-events: none;">
                            <text 
                                v-if="selectedItem && selectedItem === serieSet.id && serieSet.datapoints.length"
                                :x="serieSet.datapoints[0].x - chartDimensions.ticksFontSize"
                                :y="serieSet.datapoints[0].y + (chartDimensions.ticksFontSize / 3)"
                                text-anchor="end"
                                :font-size="chartDimensions.ticksFontSize"
                                :fill="serie.color"
                                font-weight="bold"
                            >
                                {{ serieSet.name }}
                            </text>
                        </template>

                        <template v-if="FINAL_CONFIG.style.chart.comments.show">
                            <g v-for="dp in serieSet.datapoints">                                
                                <foreignObject v-if="dp.comment" style="overflow: visible" height="12" :width="FINAL_CONFIG.style.chart.comments.width" :x="dp.x - (FINAL_CONFIG.style.chart.comments.width / 2) + FINAL_CONFIG.style.chart.comments.offsetX" :y="dp.y + FINAL_CONFIG.style.chart.comments.offsetY + 6">
                                    <div style="width: 100%;">
                                        <slot name="plot-comment" :plot="{...dp, color: serie.color}"/>
                                    </div>
                                </foreignObject>
                            </g>
                        </template>
                    </g>

                    <!-- LABELS -->
                    <template v-if="!loading && (mutableConfig.dataLabels.show || (selectedItem && selectedItem === serieSet.id))">
                        <text
                            data-cy="plot-label"
                            v-for="(dp, k) in serieSet.datapoints"
                            :x="dp.x + 12 + FINAL_CONFIG.style.chart.yAxis.labels.datapoints.offsetX"
                            :y="dp.y + FINAL_CONFIG.style.chart.yAxis.labels.datapoints.offsetY + (chartDimensions.datapointFontSize / 3)"
                            :fill="FINAL_CONFIG.style.chart.yAxis.labels.datapoints.useSerieColor ? serie.color : FINAL_CONFIG.style.chart.yAxis.labels.datapoints.color"
                            text-anchor="start"
                            :font-weight="FINAL_CONFIG.style.chart.yAxis.labels.datapoints.bold ? 'bold' : 'normal'"
                            :class="{ 'vue-ui-pcp-animated': false, 'vue-ui-pcp-transition': !loading }"
                            :font-size="chartDimensions.datapointFontSize"
                            @mouseenter="useTooltip({
                                shape: serie.shape,
                                serieName: serie.name,
                                serie: serieSet,
                                relativeIndex: i,
                                seriesIndex: serieSet.seriesIndex,
                                S
                            })"
                            @mouseleave="onTrapLeave({ serie: serieSet, shape: serie.shape, S })"
                            @click="() => selectDatapoint({ serie: serieSet, shape: serie.shape, S })"
                            :style="`opacity:${selectedItem ? selectedItem === serieSet.id ? 1 : 0.2 : 1}`"
                        >
                            {{ makeDataLabel({ value: dp.value, index: k, datapoint: dp }) }}
                        </text>
                    </template>

                    <!-- LINES -->
                    <path
                        data-cy="datapoint-line"
                        :d="`M${FINAL_CONFIG.style.chart.lines.smooth ? serieSet.smoothPath : serieSet.straightPath}`" 
                        :stroke="serie.color" 
                        :stroke-width="FINAL_CONFIG.style.chart.lines.strokeWidth"
                        fill="none"
                        :class="{ 'vue-ui-pcp-animated vue-data-ui-line-animated': FINAL_CONFIG.useCssAnimation, 'vue-ui-pcp-transition': !loading  }"
                        @mouseenter="useTooltip({
                            shape: serie.shape,
                            serieName: serie.name,
                            serie: serieSet,
                            relativeIndex: i,
                            seriesIndex: serieSet.seriesIndex,
                            S
                        })"
                        @mouseleave="onTrapLeave({ serie: serieSet, shape: serie.shape, S })"
                        @click="() => selectDatapoint({ serie: serieSet, shape: serie.shape, S })"
                        :style="`opacity:${selectedItem ? selectedItem === serieSet.id ? FINAL_CONFIG.style.chart.lines.opacity : 0.2 : FINAL_CONFIG.style.chart.lines.opacity}; stroke-dasharray:${serieSet.pathLength}; stroke-dashoffset: ${FINAL_CONFIG.useCssAnimation ? serieSet.pathLength : 0}`"
                    />
                    <!-- TOOLTIP TRAPS -->
                    <path
                        data-cy="tooltip-trap"
                        v-if="mutableConfig.showTooltip"
                        :d="`M${FINAL_CONFIG.style.chart.lines.smooth ? serieSet.smoothPath : serieSet.straightPath}`" 
                        stroke="transparent" 
                        :stroke-width="12"
                        fill="none"
                        :class="{ 'vue-ui-pcp-animated vue-data-ui-line-animated': FINAL_CONFIG.useCssAnimation, 'vue-ui-pcp-transition': !loading  }"
                        @mouseenter="useTooltip({
                            shape: serie.shape,
                            serieName: serie.name,
                            serie: serieSet,
                            relativeIndex: i,
                            seriesIndex: serieSet.seriesIndex,
                            S
                        })"
                        @mouseleave="onTrapLeave({ serie: serieSet, shape: serie.shape, S })"
                        @click="() => selectDatapoint({ serie: serieSet, shape: serie.shape, S })"
                        style="opacity:0"
                    />
                </g>
            </g>
            <slot name="svg" :svg="drawingArea"/>
        </svg>

        <div v-if="$slots.watermark" class="vue-data-ui-watermark">
            <slot name="watermark" v-bind="{ isPrinting: isPrinting || isImaging }"/>
        </div>

        <div :id="`legend-bottom-${uid}`" />

        <!-- LEGEND -->
        <Teleport v-if="readyTeleport" :to="FINAL_CONFIG.style.chart.legend.position === 'top' ? `#legend-top-${uid}` : `#legend-bottom-${uid}`">
            <div ref="chartLegend">
                <Legend
                    v-if="FINAL_CONFIG.style.chart.legend.show && isDataset"
                    :key="`legend_${legendStep}`"
                    :legendSet="legendSet"
                    :config="legendConfig"
                    @clickMarker="({ legend }) => { segregate(legend.id); selectLegend(legend) }"
                >
                    <template #item="{ legend, index }">
                        <div data-cy="legend-item" @click="legend.segregate(); selectLegend(legend)" :style="`opacity:${segregated.includes(legend.id) ? 0.5 : 1}`">
                            {{ legend.name }}
                        </div>
                    </template>
                </Legend>
        
                <slot v-else name="legend" v-bind:legend="immutableDataset"/>
            </div>
        </Teleport>
        
        <div v-if="$slots.source" ref="source" dir="auto">
            <slot name="source" />
        </div>

        <Tooltip
            :show="mutableConfig.showTooltip && isTooltip"
            :backgroundColor="FINAL_CONFIG.style.chart.tooltip.backgroundColor"
            :color="FINAL_CONFIG.style.chart.tooltip.color"
            :fontSize="FINAL_CONFIG.style.chart.tooltip.fontSize"
            :borderRadius="FINAL_CONFIG.style.chart.tooltip.borderRadius"
            :borderColor="FINAL_CONFIG.style.chart.tooltip.borderColor"
            :borderWidth="FINAL_CONFIG.style.chart.tooltip.borderWidth"
            :backgroundOpacity="FINAL_CONFIG.style.chart.tooltip.backgroundOpacity"
            :position="FINAL_CONFIG.style.chart.tooltip.position"
            :offsetY="FINAL_CONFIG.style.chart.tooltip.offsetY"
            :parent="pcpChart"
            :content="tooltipContent"
            :isFullscreen="isFullscreen"
            :isCustom="isFunction(FINAL_CONFIG.style.chart.tooltip.customFormat)"
            :smooth="FINAL_CONFIG.style.chart.tooltip.smooth"
            :backdropFilter="FINAL_CONFIG.style.chart.tooltip.backdropFilter"
            :smoothForce="FINAL_CONFIG.style.chart.tooltip.smoothForce"
            :smoothSnapThreshold="FINAL_CONFIG.style.chart.tooltip.smoothSnapThreshold"
        >
            <template #tooltip-before>
                <slot name="tooltip-before" v-bind="{...dataTooltipSlot}"></slot>
            </template>
            <template #tooltip-after>
                <slot name="tooltip-after" v-bind="{...dataTooltipSlot}"></slot>
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
                <button tabindex="0" class="vue-ui-user-options-button" @click="generateCsv(FINAL_CONFIG.userOptions.callbacks.csv)">
                    <BaseIcon name="excel" :stroke="tableComponent.props.color"/>
                </button>
            </template>
            <template #content>
                <DataTable
                    :key="`table_${tableStep}`"
                    :colNames="dataTable.colNames"
                    :head="dataTable.head"
                    :body="dataTable.body"
                    :config="dataTable.config"
                    :title="FINAL_CONFIG.table.useDialog ? '' : tableComponent.title"
                    :withCloseButton="!FINAL_CONFIG.table.useDialog"
                    @close="closeTable"
                >
                    <template #th="{ th }">
                        <div v-html="th"/>
                    </template>
                    <template #td="{ td }">
                        {{ td }}
                    </template>
                </DataTable>
            </template>
        </component>

        <!-- v3 Skeleton loader -->
        <BaseScanner v-if="loading" />
    </div>
</template>

<style scoped>
@import "../vue-data-ui.css";

.vue-ui-pcp *{
    transition: unset;
}
.vue-ui-pcp {
    user-select: none;
    position: relative;
}

.vue-ui-pcp-transition {
    transition: all 0.2s ease-in-out;
}

.vue-ui-pcp-animated {
    transform-origin: center;
    animation: xyAnimation 0.7s ease-in-out, vueDataUiLineAnimation 0.7s ease-in-out forwards; 
}

@keyframes xyAnimation {
    0% {
        transform: scale(0.9,0.9);
        opacity: 0;
    }
    80% {
        transform: scale(1.02,1.02);
        opacity: 1;
    }
    to {
        transform: scale(1,1);
        opacity: 1;
    }
}

@keyframes vueDataUiLineAnimation {
    to {
        stroke-dashoffset: 0;
      }
}

</style>