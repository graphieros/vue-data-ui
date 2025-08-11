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
    XMLNS,
    adaptColorToBackground,
    applyDataLabel,
    calculateNiceScale,
    convertColorToHex,
    convertCustomPalette, 
    createCsvContent,
    createTSpansFromLineBreaksOnX,
    createUid, 
    darkenHexColor,
    dataLabel,
    downloadCsv,
    error, 
    getMissingDatasetAttributes, 
    hasDeepProperty, 
    isFunction, 
    lightenHexColor,
    objectIsEmpty, 
    palette, 
    themePalettes,
    translateSize,
    treeShake,
} from "../lib";
import { throttle } from "../canvas-lib";
import { useConfig } from "../useConfig";
import { useLoading } from "../useLoading";
import { usePrinter } from "../usePrinter";
import { useNestedProp } from "../useNestedProp";
import { useResponsive } from "../useResponsive";
import { useUserOptionState } from "../useUserOptionState";
import { useChartAccessibility } from "../useChartAccessibility";
import { useTimeLabelCollision } from "../useTimeLabelCollider";
import themes from "../themes.json";
import Legend from "../atoms/Legend.vue"; // Must be ready in responsive mode
import Title from "../atoms/Title.vue"; // Must be ready in responsive mode
import img from "../img";
import BaseScanner from "../atoms/BaseScanner.vue";

const Accordion = defineAsyncComponent(() => import('./vue-ui-accordion.vue'));
const DataTable = defineAsyncComponent(() => import('../atoms/DataTable.vue'));
const PackageVersion = defineAsyncComponent(() => import('../atoms/PackageVersion.vue'));
const PenAndPaper = defineAsyncComponent(() => import('../atoms/PenAndPaper.vue'));
const Tooltip = defineAsyncComponent(() => import('../atoms/Tooltip.vue'));
const UserOptions = defineAsyncComponent(() => import('../atoms/UserOptions.vue'));

const { vue_ui_history_plot: DEFAULT_CONFIG } = useConfig();

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

const historyPlotChart = ref(null);
const chartTitle = ref(null);
const titleStep = ref(0);
const chartLegend = ref(null);
const legendStep = ref(0);
const tableStep = ref(0);
const step = ref(0);
const resizeObserver = shallowRef(null);
const observedEl = shallowRef(null);
const noTitle = ref(null);
const uid = ref(createUid());
const isTooltip = ref(false);
const tooltipContent = ref('');
const segregated = ref([]);
const isFullscreen = ref(false);
const selectedDatapoint = ref(null);
const useCustomFormat = ref(false);
const source = ref(null);

const xAxisLabel = ref(null);
const yAxisLabel = ref(null);
const xAxisScales = ref(null);
const yAxisScales = ref(null);

const isDataset = computed({
    get: () => {
        return !!props.dataset && props.dataset.length
    },
    set: (bool) => {
        return bool;
    }
});

const emit = defineEmits(['selectLegend', 'selectDatapoint'])

onMounted(prepareChart);

const debug = computed(() => !!FINAL_CONFIG.value.debug);

function prepareChart() {
    if (objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiHistoryPlot',
            type: 'dataset',
            debug: debug.value
        });
        manualLoading.value = true;
    } else {
        props.dataset.forEach((ds, i) => {
            getMissingDatasetAttributes({
                datasetObject: ds,
                requiredAttributes: ['name', 'values']
            }).forEach(attr => {
                isDataset.value = false;
                error({
                    componentName: 'VueUiHistoryPlot',
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
                chart: historyPlotChart.value,
                title: FINAL_CONFIG.value.style.chart.title.text ? chartTitle.value : null,
                noTitle: noTitle.value,
                legend: FINAL_CONFIG.value.style.chart.legend.show ? chartLegend.value : null,
                source: source.value
            });

            requestAnimationFrame(() => {
                svg.value.width = width;
                svg.value.height = height;
    
                if (FINAL_CONFIG.value.responsiveProportionalSizing) {
                    sizes.value.plots = translateSize({
                        relator: Math.min(width, height),
                        adjuster: 600,
                        source: FINAL_CONFIG.value.style.chart.plots.radius,
                        threshold: 3,
                        fallback: 3
                    });
        
                    sizes.value.indexLabels = translateSize({
                        relator: Math.min(width, height),
                        adjuster: 600,
                        source: FINAL_CONFIG.value.style.chart.plots.indexLabels.fontSize,
                        threshold: 6,
                        fallback: 6
                    });
        
                    sizes.value.labels = translateSize({
                        relator: Math.min(width, height),
                        adjuster: 600,
                        source: FINAL_CONFIG.value.style.chart.plots.labels.fontSize,
                        threshold: 6,
                        fallback: 6
                    });
        
                    sizes.value.xAxisLabels = translateSize({
                        relator: Math.min(width, height),
                        adjuster: 600,
                        source: FINAL_CONFIG.value.style.chart.axes.x.labels.fontSize,
                        threshold: 6,
                        fallback: 6
                    });
        
                    sizes.value.xAxisName = translateSize({
                        relator: Math.min(width, height),
                        adjuster: 600,
                        source: FINAL_CONFIG.value.style.chart.axes.x.name.fontSize,
                        threshold: 6,
                        fallback: 6
                    });
        
                    sizes.value.yAxisLabels = translateSize({
                        relator: Math.min(width, height),
                        adjuster: 600,
                        source: FINAL_CONFIG.value.style.chart.axes.y.labels.fontSize,
                        threshold: 6,
                        fallback: 6
                    });
        
                    sizes.value.yAxisName = translateSize({
                        relator: Math.min(width, height),
                        adjuster: 600,
                        source: FINAL_CONFIG.value.style.chart.axes.y.name.fontSize,
                        threshold: 6,
                        fallback: 6
                    });
                } else {
                    sizes.value.plots = FINAL_CONFIG.value.style.chart.plots.radius;
                    sizes.value.indexLabels = FINAL_CONFIG.value.style.chart.plots.indexLabels.fontSize;
                    sizes.value.labels = FINAL_CONFIG.value.style.chart.plots.labels.fontSize;
                    sizes.value.xAxisLabels = FINAL_CONFIG.value.style.chart.axes.x.labels.fontSize;
                    sizes.value.xAxisName = FINAL_CONFIG.value.style.chart.axes.x.name.fontSize;
                    sizes.value.yAxisLabels = FINAL_CONFIG.value.style.chart.axes.y.labels.fontSize;
                    sizes.value.yAxisName = FINAL_CONFIG.value.style.chart.axes.y.name.fontSize;
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
        observedEl.value = historyPlotChart.value.parentNode;
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

function prepareConfig() {
    const mergedConfig = useNestedProp({
        userConfig: props.config,
        defaultConfig: DEFAULT_CONFIG
    });
    let finalConfig = {};
    if (mergedConfig.theme) {
        finalConfig = {
            ...useNestedProp({
                userConfig: themes.vue_ui_history_plot[mergedConfig.theme] || props.config,
                defaultConfig: mergedConfig
            }),
            customPalette: themePalettes[mergedConfig.theme] || palette
        }
    } else {
        finalConfig = mergedConfig;
    }

    // ------------------------------ OVERRIDES -----------------------------------

    if (props.config && hasDeepProperty(props.config, 'style.chart.axes.x.scaleMin')) {
        finalConfig.style.chart.axes.x.scaleMin = props.config.style.chart.axes.x.scaleMin;
    } else {
        finalConfig.style.chart.axes.x.scaleMin = null;
    }

    if (props.config && hasDeepProperty(props.config, 'style.chart.axes.x.scaleMax')) {
        finalConfig.style.chart.axes.x.scaleMax = props.config.style.chart.axes.x.scaleMax;
    } else {
        finalConfig.style.chart.axes.x.scaleMax = null;
    }

    if (props.config && hasDeepProperty(props.config, 'style.chart.axes.y.scaleMin')) {
        finalConfig.style.chart.axes.y.scaleMin = props.config.style.chart.axes.y.scaleMin;
    } else {
        finalConfig.style.chart.axes.y.scaleMin = null;
    }

    if (props.config && hasDeepProperty(props.config, 'style.chart.axes.y.scaleMax')) {
        finalConfig.style.chart.axes.y.scaleMax = props.config.style.chart.axes.y.scaleMax;
    } else {
        finalConfig.style.chart.axes.y.scaleMax = null;
    }

    // ----------------------------------------------------------------------------
    return finalConfig;
}

const FINAL_CONFIG = ref(prepareConfig());

const { loading, FINAL_DATASET, manualLoading } = useLoading({
    ...toRefs(props),
    FINAL_CONFIG,
    prepareConfig,
    skeletonDataset: [
        {
            name: '',
            color: '#CACACA',
            values: [
                { label: '', x: 1, y: 9},
                { label: '', x: 4, y: 1},
                { label: '', x: 7, y: 9},
                { label: '', x: 9, y: 4},
            ]
        }
    ],
    skeletonConfig: treeShake({
        defaultConfig: FINAL_CONFIG.value,
        userConfig: {
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
                            name: { text: '' }
                        },
                        y: {
                            scaleMin: 0,
                            scaleMax: 10,
                            labels: { show: false },
                            name: { text: '' }
                        },
                    },
                    grid: {
                        xAxis: {
                            stroke: '#6A6A6A'
                        },
                        horizontalLines: {
                            stroke: '#6A6A6A50'
                        },
                        yAxis: {
                            stroke: '#6A6A6A'
                        },
                        verticalLines: {
                            stroke: '#6A6A6A50'
                        },
                    },
                    legend: {
                        backgroundColor: 'transparent'
                    },
                    paths: {
                        useSerieColor: false,
                        stroke: '#6A6A6A'
                    },
                    plots: {
                        stroke: '#6A6A6A',
                        indexLabels: { show: false },
                        labels: { show: false }
                    }
                }
            }
        }
    })
})

const { userOptionsVisible, setUserOptionsVisibility, keepUserOptionState } = useUserOptionState({ config: FINAL_CONFIG.value });
const { svgRef } = useChartAccessibility({ config: FINAL_CONFIG.value.style.chart.title });

watch(() => props.config, (_newCfg) => {
    if (!loading.value) {
        FINAL_CONFIG.value = prepareConfig();
    }
    userOptionsVisible.value = !FINAL_CONFIG.value.userOptions.showOnChartHover;
    prepareChart();
    titleStep.value += 1;
    tableStep.value += 1;
    legendStep.value += 1;
    svg.value.height = FINAL_CONFIG.value.style.chart.height;
    svg.value.width = FINAL_CONFIG.value.style.chart.width;
    sizes.value.plots = FINAL_CONFIG.value.style.chart.plots.radius;
    sizes.value.indexLabels = FINAL_CONFIG.value.style.chart.plots.indexLabels.fontSize;
    sizes.value.labels = FINAL_CONFIG.value.style.chart.plots.labels.fontSize;
    sizes.value.xAxisLabels = FINAL_CONFIG.value.style.chart.axes.x.labels.fontSize;
    sizes.value.xAxisName = FINAL_CONFIG.value.style.chart.axes.x.name.fontSize;
    sizes.value.yAxisLabels = FINAL_CONFIG.value.style.chart.axes.y.labels.fontSize;
    sizes.value.yAxisName = FINAL_CONFIG.value.style.chart.axes.y.name.fontSize;

    // Reset mutable config
    mutableConfig.value.showTable = FINAL_CONFIG.value.table.show;
    mutableConfig.value.showTooltip = FINAL_CONFIG.value.style.chart.tooltip.show;
}, { deep: true });

watch(() => props.dataset, (_) => {
    if (Array.isArray(_) && _.length > 0) {
        manualLoading.value = false;
    }
}, { deep: true });

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `history_plot_${uid.value}`,
    fileName: FINAL_CONFIG.value.style.chart.title.text || 'vue-ui-history-plot',
    options: FINAL_CONFIG.value.userOptions.print
});

const hasOptionsNoTitle = computed(() => {
    return FINAL_CONFIG.value.userOptions.show && !FINAL_CONFIG.value.style.chart.title.text;
});

const customPalette = computed(() => {
    return convertCustomPalette(FINAL_CONFIG.value.customPalette);
});

const mutableConfig = ref({
    showTable: FINAL_CONFIG.value.table.show,
    showTooltip: FINAL_CONFIG.value.style.chart.tooltip.show
});

// v3 - Essential to make shifting between loading config and final config work
watch(FINAL_CONFIG, () => {
    mutableConfig.value = {
        showTable: FINAL_CONFIG.value.table.show,
        showTooltip: FINAL_CONFIG.value.style.chart.tooltip.show
    }
}, { immediate: true });

const svg = ref({
    height: FINAL_CONFIG.value.style.chart.height,
    width: FINAL_CONFIG.value.style.chart.width
});

const WIDTH = computed(() => svg.value.width);
const HEIGHT = computed(() => svg.value.height);

function getOffsetX() {
    let base = 0;
    if (yAxisScales.value) {
        const texts = Array.from(yAxisScales.value.querySelectorAll('text'));
        base = texts.reduce((max, t) => {
            const w = t.getComputedTextLength()
            return w > max ? w : max
        }, 0)
    }
    const yAxisLabelW = yAxisLabel.value ? yAxisLabel.value.getBoundingClientRect().width : 0;
    return base + yAxisLabelW + (yAxisLabelW ? 24 : 0);
}


const xAxisScalesH = ref(0);

const updateHeight = throttle((h) => {
    xAxisScalesH.value = h;
});

watchEffect((onInvalidate) => {
    const el = xAxisScales.value;
    if (!el) return;
    const observer = new ResizeObserver(entries => {
        updateHeight(entries[0].contentRect.height);
    });
    observer.observe(el);
    onInvalidate(() => observer.disconnect());
});

const offsetY = computed(() => {
    let h = 0;
    if (xAxisLabel.value) {
        h = xAxisLabel.value.getBBox().height + (sizes.value.xAxisName / 2);
    }
    let tlH = 0;
    if (xAxisScales.value) {
        tlH = xAxisScalesH.value;
    };
    return h + tlH;
})

const drawingArea = computed(() => {
    const left = FINAL_CONFIG.value.style.chart.padding.left;
    const top = FINAL_CONFIG.value.style.chart.padding.top;
    const offsetX = getOffsetX();
    const plotRadius = FINAL_CONFIG.value.style.chart.plots.radius;

    return {
        left: left + offsetX + FINAL_CONFIG.value.style.chart.axes.y.name.offsetX,
        top: top + plotRadius,
        right: svg.value.width - FINAL_CONFIG.value.style.chart.padding.right - plotRadius - FINAL_CONFIG.value.style.chart.axes.y.name.offsetX,
        bottom: svg.value.height - FINAL_CONFIG.value.style.chart.padding.bottom - offsetY.value - plotRadius - FINAL_CONFIG.value.style.chart.axes.x.name.offsetY,
        width: svg.value.width - left - FINAL_CONFIG.value.style.chart.padding.right - offsetX - plotRadius - FINAL_CONFIG.value.style.chart.axes.y.name.offsetX,
        height: svg.value.height - top - FINAL_CONFIG.value.style.chart.padding.bottom - offsetY.value - (plotRadius * 2) - FINAL_CONFIG.value.style.chart.axes.x.name.offsetY
    }
});

const sizes = ref({
    plots: FINAL_CONFIG.value.style.chart.plots.radius,
    indexLabels: FINAL_CONFIG.value.style.chart.plots.indexLabels.fontSize,
    labels: FINAL_CONFIG.value.style.chart.plots.labels.fontSize,
    xAxisLabels: FINAL_CONFIG.value.style.chart.axes.x.labels.fontSize,
    xAxisName: FINAL_CONFIG.value.style.chart.axes.x.name.fontSize,
    yAxisLabels: FINAL_CONFIG.value.style.chart.axes.y.labels.fontSize,
    yAxisName: FINAL_CONFIG.value.style.chart.axes.y.name.fontSize
});

const formattedDataset = computed(() => {
    return FINAL_DATASET.value.map((ds, i) => {
        return {
            ...ds,
            color: ds.color ? convertColorToHex(ds.color) : customPalette.value[i] || palette[i] || palette[i % palette.length],
            seriesIndex: i
        }
    })
});

const maxX = computed(() => {
    return Math.max(...formattedDataset.value.filter((ds) => !segregated.value.includes(ds.seriesIndex)).flatMap(ds => ds.values.map(d => d.x)));
});
const minX = computed(() => {
    const min = Math.min(...formattedDataset.value.filter((ds) => !segregated.value.includes(ds.seriesIndex)).flatMap(ds => ds.values.map(d => d.x)));
    return min < 0 ? min : 0;
});
const maxY = computed(() => {
    return Math.max(...formattedDataset.value.filter((ds) => !segregated.value.includes(ds.seriesIndex)).flatMap(ds => ds.values.map(d => d.y)));
});
const minY = computed(() => {
    const min = Math.min(...formattedDataset.value.filter((ds) => !segregated.value.includes(ds.seriesIndex)).flatMap(ds => ds.values.map(d => d.y)));
    return min < 0 ? min : 0;
});

const scales = computed(() => {

    const x = calculateNiceScale(
            FINAL_CONFIG.value.style.chart.axes.x.scaleMin === null ? minX.value : FINAL_CONFIG.value.style.chart.axes.x.scaleMin,
            FINAL_CONFIG.value.style.chart.axes.x.scaleMax === null ? maxX.value : FINAL_CONFIG.value.style.chart.axes.x.scaleMax,
            FINAL_CONFIG.value.style.chart.axes.x.ticks
        );

    const y = calculateNiceScale(
            FINAL_CONFIG.value.style.chart.axes.y.scaleMin === null ? minY.value : FINAL_CONFIG.value.style.chart.axes.y.scaleMin,
            FINAL_CONFIG.value.style.chart.axes.y.scaleMax === null ? maxY.value : FINAL_CONFIG.value.style.chart.axes.y.scaleMax,
            FINAL_CONFIG.value.style.chart.axes.y.ticks
        );
    return {
        x,
        y,
        tickX: x.ticks.map(t => {
            return {
                x: drawingArea.value.left + ((t - x.min) / (x.max - x.min) * drawingArea.value.width),
                y1: drawingArea.value.top,
                y2: drawingArea.value.bottom,
                value: t
            }
        }),
        tickY: y.ticks.map(t => {
            return {
                y: drawingArea.value.bottom - ((t - y.min) / (y.max - y.min) * drawingArea.value.height),
                x1: drawingArea.value.left,
                x2: drawingArea.value.right,
                value: t
            }
        })
    }
});

function setDimensionX(value) {
    const minOffset = scales.value.x.min < 0 
        ? Math.abs(scales.value.x.min)
            : scales.value.x.min > 0 ? -scales.value.x.min
        : 0;

    return drawingArea.value.left + ((value || 0) + minOffset) / (scales.value.x.max + minOffset) * drawingArea.value.width;
}
function setDimensionY(value) {
    const minOffset = scales.value.y.min < 0 
        ? Math.abs(scales.value.y.min)
            : scales.value.y.min > 0 ? -scales.value.y.min
        : 0
        ;
    return drawingArea.value.bottom - (((value || 0) + minOffset) / (scales.value.y.max + minOffset)) * drawingArea.value.height;
}

const drawableDataset = computed(() => {
    return formattedDataset.value.filter(ds => !segregated.value.includes(ds.seriesIndex)).map((ds, i) => {
        const plots = ds.values.map((p,i) => {
                return {
                    valueX: p.x,
                    valueY: p.y,
                    label: p.label,
                    x: setDimensionX(p.x),
                    y: setDimensionY(p.y),
                    color: ds.color,
                    seriesName: ds.name,
                    id: createUid()
                }
            });
            const path = plots.map(p => {
                return `${p.x},${p.y} `
            }).join('').trim();
        return {
            ...ds,
            plots,
            path: `M${path}`
        }
    });
});

function segregate(index) {
    if (segregated.value.includes(index)) {
        segregated.value = segregated.value.filter(el => el !== index);
    } else {
        segregated.value.push(index);
    }
}

const legendSet = computed(() => {
    return formattedDataset.value.map(ds => {
        return {
            ...ds,
            opacity: segregated.value.includes(ds.seriesIndex) ? 0.5 : 1,
            segregate: () => segregate(ds.seriesIndex),
            isSegregated: segregated.value.includes(ds.seriesIndex),
            shape: 'circle'
        }
    });
});

const legendConfig = computed(() => {
    return {
        cy: 'history-plot-div-legend',
        backgroundColor: FINAL_CONFIG.value.style.chart.legend.backgroundColor,
        color: FINAL_CONFIG.value.style.chart.legend.color,
        fontSize: FINAL_CONFIG.value.style.chart.legend.fontSize,
        paddingBottom: 12,
        fontWeight: FINAL_CONFIG.value.style.chart.legend.bold ? 'bold' : ''
    }
});

function selectDatapoint({datapoint, plotIndex, seriesIndex }) {
    if (FINAL_CONFIG.value.events.datapointClick) {
        FINAL_CONFIG.value.events.datapointClick({ datapoint: { ...datapoint, plotIndex, seriesIndex }, seriesIndex })
    }
    emit('selectDatapoint', datapoint)
}

function selectLegend(legend) {
    emit('selectLegend', {
        ...legend,
        isSegregated: !legend.isSegregated,
        opacity: legend.isSegregated ? 1 : 0.5
    })
}

function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
}

const dataTooltipSlot = ref(null);

function onTrapLeave({ datapoint, plotIndex, seriesIndex }) {
    if (FINAL_CONFIG.value.events.datapointLeave) {
        FINAL_CONFIG.value.events.datapointLeave({ datapoint: { ...datapoint, plotIndex, seriesIndex }, seriesIndex })
    }
    isTooltip.value = false;
    selectedDatapoint.value = null;
}

function useTooltip({ datapoint, plotIndex, seriesIndex }) {

    if (FINAL_CONFIG.value.events.datapointEnter) {
        FINAL_CONFIG.value.events.datapointEnter({ datapoint: { ...datapoint, plotIndex, seriesIndex }, seriesIndex })
    }

    dataTooltipSlot.value = { datapoint, seriesIndex, plotIndex, config: FINAL_CONFIG.value, series: formattedDataset.value};
    selectedDatapoint.value = datapoint;
    const customFormat = FINAL_CONFIG.value.style.chart.tooltip.customFormat;
    useCustomFormat.value = false;

    if (isFunction(customFormat)) {
        try {
            const customFormatString = customFormat({
                seriesIndex,
                datapoint,
                plotIndex,
                series: formattedDataset.value,
                config: FINAL_CONFIG.value
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
        html += `<div style="display:flex;flex-direction:row;gap:6px;align-items:center;border-bottom:1px solid ${FINAL_CONFIG.value.style.chart.tooltip.borderColor};margin-bottom:3px;padding-bottom:6px;"><svg viewBox="0 0 12 12" height="14" width="14"><circle data-cy="donut-tooltip-marker" cx="6" cy="6" r="6" stroke="none" fill="${datapoint.color}"/></svg><span>${datapoint.seriesName}</span></div>`;

        html += `<div>${datapoint.label}</div>`;

        html += `<div>${FINAL_CONFIG.value.style.chart.axes.x.name.text || 'x'}: ${
            applyDataLabel(
                FINAL_CONFIG.value.style.chart.axes.x.labels.formatter,
                datapoint.valueX,
                dataLabel({
                    p: FINAL_CONFIG.value.style.chart.axes.x.labels.prefix,
                    v: datapoint.valueX,
                    s: FINAL_CONFIG.value.style.chart.axes.x.labels.suffix,
                    r: FINAL_CONFIG.value.style.chart.axes.x.labels.rounding
                })
            )
        }</div>`;

        html += `<div>${FINAL_CONFIG.value.style.chart.axes.y.name.text || 'y'}: ${
            applyDataLabel(
                FINAL_CONFIG.value.style.chart.axes.y.labels.formatter,
                datapoint.valueY,
                dataLabel({
                    p: FINAL_CONFIG.value.style.chart.axes.y.labels.prefix,
                    v: datapoint.valueY,
                    s: FINAL_CONFIG.value.style.chart.axes.y.labels.suffix,
                    r: FINAL_CONFIG.value.style.chart.axes.y.labels.rounding
                })
            )
        }</div>`

        tooltipContent.value = `<div>${html}</div>`
    }
    isTooltip.value = true;
}

const table = computed(() => {
    const head = drawableDataset.value.map(ds => {
        return {
            name: ds.name,
            color: ds.color
        }
    });
    return { head }
});

const dataTable = computed(() => {
    const head = [
        FINAL_CONFIG.value.table.columnNames.series,
        FINAL_CONFIG.value.table.columnNames.datapoint,
        FINAL_CONFIG.value.table.columnNames.x,
        FINAL_CONFIG.value.table.columnNames.y,
    ];

    const body = drawableDataset.value.flatMap(ds => {
        return ds.plots.map(dp => {
            return [
                {
                    color: dp.color,
                    name: dp.seriesName
                },
                dp.label,
                applyDataLabel(
                    FINAL_CONFIG.value.style.chart.axes.x.labels.formatter,
                    dp.valueX,
                    dataLabel({
                        p: FINAL_CONFIG.value.style.chart.axes.x.labels.prefix,
                        v: dp.valueX,
                        s: FINAL_CONFIG.value.style.chart.axes.x.labels.suffix,
                        r: FINAL_CONFIG.value.style.chart.axes.x.labels.rounding
                    })
                ),
                applyDataLabel(
                    FINAL_CONFIG.value.style.chart.axes.y.labels.formatter,
                    dp.valueY,
                    dataLabel({
                        p: FINAL_CONFIG.value.style.chart.axes.y.labels.prefix,
                        v: dp.valueY,
                        s: FINAL_CONFIG.value.style.chart.axes.y.labels.suffix,
                        r: FINAL_CONFIG.value.style.chart.axes.y.labels.rounding
                    })
                ),
            ]
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

    return {
        head,
        body,
        config,
        colNames: head
    }
});

function generateCsv(callback=null) {
    nextTick(() => {
        const head = [
            [ FINAL_CONFIG.value.table.columnNames.series ],
            [ FINAL_CONFIG.value.table.columnNames.datapoint ],
            [ FINAL_CONFIG.value.table.columnNames.x ],
            [ FINAL_CONFIG.value.table.columnNames.y ],
        ];

        const rows = drawableDataset.value.flatMap(ds => {
            return ds.plots.map(dp => {
                return [
                    [ dp.seriesName ],
                    [ dp.label ],
                    [ dp.valueX ],
                    [ dp.valueY ]
                ]
            })
        });

        const tableXls = [
            [ FINAL_CONFIG.value.style.chart.title.text ],
            [ FINAL_CONFIG.value.style.chart.title.subtitle.text ],
            head,
        ].concat(rows);

        const csvContent = createCsvContent(tableXls);

        if (!callback) {
            downloadCsv({
                csvContent,
                title: FINAL_CONFIG.value.style.chart.title.text || "vue-ui-history-plot"
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

function getData() {
    return drawableDataset.value
}

async function getImage({ scale = 2} = {}) {
    if (!historyPlotChart.value) return;
    const { width, height } = historyPlotChart.value.getBoundingClientRect();
    const aspectRatio = width / height;
    const { imageUri, base64 } = await img({ domElement: historyPlotChart.value, base64: true, img: true, scale})
    return { 
        imageUri, 
        base64, 
        title: FINAL_CONFIG.value.style.chart.title.text,
        width,
        height,
        aspectRatio
    }
}

const dummyTimeLabels = computed(() => scales.value.tickX);
const dummySlicer = computed(() => ({ start: 0, end: scales.value.tickX.length }))

useTimeLabelCollision({
    timeLabelsEls: xAxisScales,
    timeLabels: dummyTimeLabels,
    slicer: dummySlicer,
    configRef: FINAL_CONFIG,
    rotationPath: ['style', 'chart', 'axes', 'x', 'labels', 'rotation'],
    autoRotatePath: ['style', 'chart', 'axes', 'x', 'labels', 'autoRotate'],
    isAutoSize: false,
    width: WIDTH,
    height: HEIGHT,
    targetClass: '.vue-ui-history-plot-x-axis-scale'
})

defineExpose({
    getData,
    getImage,
    generatePdf,
    generateCsv,
    generateImage,
    toggleTable,
    toggleTooltip,
    toggleAnnotator,
    toggleFullscreen
})

</script>

<template>
    <div 
        :id="`history_plot_${uid}`"
        ref="historyPlotChart"
        :class="{'vue-ui-history-plot': true, 'vue-data-ui-wrapper-fullscreen' : isFullscreen }" 
        :style="`background:${FINAL_CONFIG.style.chart.backgroundColor};color:${FINAL_CONFIG.style.chart.color};font-family:${FINAL_CONFIG.style.fontFamily}; position: relative; ${FINAL_CONFIG.responsive ? 'height: 100%' : ''}`"
        @mouseenter="() => setUserOptionsVisibility(true)" 
        @mouseleave="() => setUserOptionsVisibility(false)"
    >
        
        <slot name="userConfig"/>

        <PenAndPaper 
            v-if="FINAL_CONFIG.userOptions.buttons.annotator"
            :svgRef="svgRef"
            :backgroundColor="FINAL_CONFIG.style.chart.backgroundColor"
            :color="FINAL_CONFIG.style.chart.color"
            :active="isAnnotator"
            @close="toggleAnnotator"
        />

        <div
            ref="noTitle"
            v-if="hasOptionsNoTitle" 
            class="vue-data-ui-no-title-space" 
            :style="`height:36px; width: 100%;background:transparent`"
        />

        <div ref="chartTitle" class="vue-ui-xy-title" v-if="FINAL_CONFIG.style.chart.title.text" :style="`font-family:${FINAL_CONFIG.style.fontFamily}`">
            <Title
                :key="`title_${titleStep}`"
                :config="{
                    title: {
                        cy: 'history-plot-div-title',
                        ...FINAL_CONFIG.style.chart.title
                    },
                    subtitle: {
                        cy: 'history-plot-div-subtitle',
                        ...FINAL_CONFIG.style.chart.title.subtitle
                    },
                }"
            />
        </div>

        <UserOptions
            ref="details"
            :key="`user_option_${step}`"
            v-if="FINAL_CONFIG.userOptions.show && isDataset && (keepUserOptionState ? true : userOptionsVisible)"
            :backgroundColor="FINAL_CONFIG.style.chart.backgroundColor"
            :color="FINAL_CONFIG.style.chart.color"
            :isPrinting="isPrinting"
            :isImaging="isImaging"
            :uid="uid"
            :hasTooltip="FINAL_CONFIG.style.chart.tooltip.show && FINAL_CONFIG.userOptions.buttons.tooltip"
            :hasPdf="FINAL_CONFIG.userOptions.buttons.pdf"
            :hasImg="FINAL_CONFIG.userOptions.buttons.img"
            :hasXls="FINAL_CONFIG.userOptions.buttons.csv"
            :hasTable="FINAL_CONFIG.userOptions.buttons.table"
            :hasLabel="false"
            :hasFullscreen="FINAL_CONFIG.userOptions.buttons.fullscreen"
            :isFullscreen="isFullscreen"
            :chartElement="historyPlotChart"
            :position="FINAL_CONFIG.userOptions.position"
            :isTooltip="mutableConfig.showTooltip"
            :titles="{...FINAL_CONFIG.userOptions.buttonTitles }"
            :hasAnnotator="FINAL_CONFIG.userOptions.buttons.annotator"
            :isAnnotation="isAnnotator"
            :callbacks="FINAL_CONFIG.userOptions.callbacks"
            :printScale="FINAL_CONFIG.userOptions.print.scale"
            @toggleFullscreen="toggleFullscreen"
            @generatePdf="generatePdf"
            @generateCsv="generateCsv"
            @generateImage="generateImage"
            @toggleTable="toggleTable"
            @toggleTooltip="toggleTooltip"
            @toggleAnnotator="toggleAnnotator"
            :style="{
                visibility: keepUserOptionState ? userOptionsVisible ? 'visible' : 'hidden' : 'visible'
            }"
        >
            <template #menuIcon="{ isOpen, color }" v-if="$slots.menuIcon">
                <slot name="menuIcon" v-bind="{ isOpen, color }"/>
            </template>
            <template #optionTooltip v-if="$slots.optionTooltip">
                <slot name="optionTooltip"/>
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
            <template #optionTable v-if="$slots.optionTable">
                <slot name="optionTable" />
            </template>
            <template v-if="$slots.optionFullscreen" #optionFullscreen="{ toggleFullscreen, isFullscreen }">
                <slot name="optionFullscreen" v-bind="{ toggleFullscreen, isFullscreen }"/>
            </template>
            <template v-if="$slots.optionAnnotator" #optionAnnotator="{ toggleAnnotator, isAnnotator }">
                <slot name="optionAnnotator" v-bind="{ toggleAnnotator, isAnnotator }" />
            </template>
        </UserOptions>

        <svg
            ref="svgRef"
            :xmlns="XMLNS"
            :viewBox="`0 0 ${svg.width < 0 ? 0.1 : svg.width} ${svg.height < 0 ? 0.1 : svg.height}`"
            :style="`max-width:100%;overflow:visible;background:transparent;color:${FINAL_CONFIG.style.chart.color}`"
        >
            <PackageVersion />

            <!-- BACKGROUND SLOT -->
            <foreignObject 
                v-if="$slots['chart-background']"
                :x="drawingArea.left"
                :y="drawingArea.top"
                :width="drawingArea.width <= 0 ? 10 : drawingArea.width"
                :height="drawingArea.height <= 0 ? 10 : drawingArea.height"
                :style="{
                    pointerEvents: 'none'
                }"
            >
                <slot name="chart-background"/>
            </foreignObject>

            <defs v-if="FINAL_CONFIG.style.chart.plots.gradient.show">
                <radialGradient v-for="(ds, i) in drawableDataset" :id="`gradient_${i}_${uid}`" fy="30%">
                    <stop offset="10%" :stop-color="lightenHexColor(ds.color, FINAL_CONFIG.style.chart.plots.gradient.intensity / 100)"/>
                    <stop offset="90%" :stop-color="darkenHexColor(ds.color, 0.1)"/>
                    <stop offset="100%" :stop-color="ds.color"/>
                </radialGradient>
            </defs>

            <!-- GRID -->
            <!-- SCALE Y -->
            <g v-if="FINAL_CONFIG.style.chart.grid.verticalLines.show">
                <line
                    data-cy="grid-line-vertical"
                    v-for="line in scales.tickX"
                    :x1="line.x"
                    :x2="line.x"
                    :y1="line.y1"
                    :y2="line.y2"
                    :stroke="FINAL_CONFIG.style.chart.grid.verticalLines.stroke"
                    :stroke-width="FINAL_CONFIG.style.chart.grid.verticalLines.strokeWidth"
                    stroke-linecap="round"
                />
            </g>

            <g v-if="FINAL_CONFIG.style.chart.axes.y.labels.show">
                <line v-for="labelY in scales.tickY"
                    :stroke="FINAL_CONFIG.style.chart.grid.verticalLines.stroke"
                    :stroke-width="FINAL_CONFIG.style.chart.grid.verticalLines.strokeWidth"
                    stroke-linecap="round"
                    :x1="drawingArea.left - 5"
                    :x2="drawingArea.left"
                    :y1="labelY.y"
                    :y2="labelY.y"
                />
            </g>

            <!-- Y AXIS LABELS -->
            <g v-if="FINAL_CONFIG.style.chart.axes.y.labels.show" ref="yAxisScales">
                <text
                    data-cy="y-axis-label"
                    v-for="labelY in scales.tickY"
                    :x="drawingArea.left + FINAL_CONFIG.style.chart.axes.y.labels.offsetX - 4 - FINAL_CONFIG.style.chart.plots.radius"
                    :y="labelY.y + sizes.yAxisLabels / 3"
                    :fill="FINAL_CONFIG.style.chart.axes.y.labels.color"
                    :font-size="sizes.yAxisLabels"
                    text-anchor="end"
                >
                    {{ 
                        applyDataLabel(
                            FINAL_CONFIG.style.chart.axes.y.labels.formatter,
                            labelY.value,
                            dataLabel({
                                p: FINAL_CONFIG.style.chart.axes.y.labels.prefix,
                                v: labelY.value,
                                s: FINAL_CONFIG.style.chart.axes.y.labels.suffix,
                                r: FINAL_CONFIG.style.chart.axes.y.labels.rounding
                            })
                        )
                    }}
                </text>
            </g>

            <!-- Y AXIS NAME -->
            <text
                ref="yAxisLabel"
                data-cy="axis-name-y"
                v-if="FINAL_CONFIG.style.chart.axes.y.name.text"
                :transform="`translate(${sizes.yAxisName}, ${(svg.height / 2) + FINAL_CONFIG.style.chart.axes.y.name.offsetY}), rotate(-90)`"
                :font-size="sizes.yAxisName"
                :fill="FINAL_CONFIG.style.chart.axes.y.name.color"
                :font-weight="FINAL_CONFIG.style.chart.axes.y.name.bold ? 'bold' : 'normal'"
                text-anchor="middle"
            >
                {{ FINAL_CONFIG.style.chart.axes.y.name.text }}
            </text>

            <!-- SCALE X -->
            <g v-if="FINAL_CONFIG.style.chart.grid.horizontalLines.show">
                <line
                    data-cy="grid-line-horizontal"
                    v-for="line in scales.tickY"
                    :x1="line.x1"
                    :x2="line.x2"
                    :y1="line.y"
                    :y2="line.y"
                    :stroke="FINAL_CONFIG.style.chart.grid.horizontalLines.stroke"
                    :stroke-width="FINAL_CONFIG.style.chart.grid.horizontalLines.strokeWidth"
                    stroke-linecap="round"
                />
            </g>

            <g v-if="FINAL_CONFIG.style.chart.axes.x.labels.show">
                <line v-for="labelX in scales.tickX"
                    :stroke="FINAL_CONFIG.style.chart.grid.verticalLines.stroke"
                    :stroke-width="FINAL_CONFIG.style.chart.grid.verticalLines.strokeWidth"
                    stroke-linecap="round"
                    :x1="labelX.x"
                    :x2="labelX.x"
                    :y1="drawingArea.bottom"
                    :y2="drawingArea.bottom + 5"
                />
            </g>

            <!-- X AXIS LABELS -->
            <g v-if="FINAL_CONFIG.style.chart.axes.x.labels.show" ref="xAxisScales">
                <text
                    class="vue-ui-history-plot-x-axis-scale"
                    data-cy="x-axis-label"
                    v-for="labelX in scales.tickX"
                    :transform="`translate(${labelX.x}, ${drawingArea.bottom + FINAL_CONFIG.style.chart.axes.x.labels.offsetY + sizes.xAxisLabels + FINAL_CONFIG.style.chart.plots.radius}), rotate(${FINAL_CONFIG.style.chart.axes.x.labels.rotation})`"
                    :fill="FINAL_CONFIG.style.chart.axes.x.labels.color"
                    :font-size="sizes.xAxisLabels"
                    :text-anchor="FINAL_CONFIG.style.chart.axes.x.labels.rotation > 0 ? 'start' : FINAL_CONFIG.style.chart.axes.x.labels.rotation < 0 ? 'end' : 'middle'"
                >
                    {{ 
                        applyDataLabel(
                            FINAL_CONFIG.style.chart.axes.x.labels.formatter,
                            labelX.value,
                            dataLabel({
                                p: FINAL_CONFIG.style.chart.axes.x.labels.prefix,
                                v: labelX.value,
                                s: FINAL_CONFIG.style.chart.axes.x.labels.suffix,
                                r: FINAL_CONFIG.style.chart.axes.x.labels.rounding
                            })
                        )
                    }}
                </text>
            </g>

            <!-- X AXIS NAME -->
            <text
                ref="xAxisLabel"
                data-cy="axis-name-x"
                v-if="FINAL_CONFIG.style.chart.axes.x.name.text"
                :x="(svg.width / 2) + FINAL_CONFIG.style.chart.axes.x.name.offsetX"
                :y="svg.height"
                :font-size="sizes.xAxisName"
                :fill="FINAL_CONFIG.style.chart.axes.x.name.color"
                :font-weight="FINAL_CONFIG.style.chart.axes.x.name.bold ? 'bold' : 'normal'"
                text-anchor="middle"
            >
                {{ FINAL_CONFIG.style.chart.axes.x.name.text }}
            </text>

            <!-- X AXIS -->
            <line
                data-cy="x-axis"
                v-if="FINAL_CONFIG.style.chart.grid.xAxis.show"
                :x1="drawingArea.left"
                :x2="drawingArea.left + drawingArea.width"
                :y1="drawingArea.bottom"
                :y2="drawingArea.bottom"
                :stroke="FINAL_CONFIG.style.chart.grid.xAxis.stroke"
                :stroke-width="FINAL_CONFIG.style.chart.grid.xAxis.strokeWidth"
                stroke-linecap="round"
            />

            <!-- Y AXIS -->
            <line
                data-cy="y-axis"
                v-if="FINAL_CONFIG.style.chart.grid.yAxis.show"
                :x1="drawingArea.left"
                :x2="drawingArea.left"
                :y1="drawingArea.top"
                :y2="drawingArea.bottom"
                :stroke="FINAL_CONFIG.style.chart.grid.yAxis.stroke"
                :stroke-width="FINAL_CONFIG.style.chart.grid.yAxis.strokeWidth"
                stroke-linecap="round"
            />
            
            <!-- PLOTS & PATHS -->
            <g v-for="(ds, i) in drawableDataset">
                <!-- PATHS -->
                <g 
                    v-if="FINAL_CONFIG.style.chart.paths.show"
                    :style="{
                        opacity: selectedDatapoint === null ? 1 : 0.3
                    }"
                >
                    <path
                        data-cy="datapoint-path-wrapper"
                        :d="ds.path"
                        :stroke="FINAL_CONFIG.style.chart.backgroundColor"
                        :stroke-width="FINAL_CONFIG.style.chart.paths.strokeWidth + 4"
                        fill="none"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        :class="{ 'animated' : FINAL_CONFIG.useCssAnimation && !loading }"
                    />
                    <path
                        data-cy="datapoint-path"
                        :d="ds.path"
                        :stroke="FINAL_CONFIG.style.chart.paths.useSerieColor ? ds.color : FINAL_CONFIG.style.chart.paths.stroke"
                        :stroke-width="FINAL_CONFIG.style.chart.paths.strokeWidth"
                        fill="none"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        :class="{ 'animated' : FINAL_CONFIG.useCssAnimation && !loading }"
                    />
                </g>

                <!-- PLOTS -->
                <!-- Underlayers to hide track when !!selectedDatapoint -->
                <circle
                    data-cy="datapoint-plot-underlayer"
                    v-for="plot in ds.plots"
                    :cx="plot.x"
                    :cy="plot.y"
                    :fill="FINAL_CONFIG.style.chart.backgroundColor"
                    :r="sizes.plots"
                    stroke="none"
                />
                <!-- Visible plots -->
                <circle
                    data-cy="datapoint-plot"
                    v-for="plot in ds.plots"
                    :cx="plot.x"
                    :cy="plot.y"
                    :fill="FINAL_CONFIG.style.chart.plots.gradient.show ? `url(#gradient_${i}_${uid})` : plot.color"
                    :r="sizes.plots"
                    :stroke="FINAL_CONFIG.style.chart.plots.stroke"
                    :stroke-width="FINAL_CONFIG.style.chart.plots.strokeWidth"
                    :class="{ 'animated' : FINAL_CONFIG.useCssAnimation && !loading }"
                    :style="{
                        opacity: selectedDatapoint === null ? 1 : selectedDatapoint.id === plot.id ? 1 : 0.3,
                        transition: 'opacity 0.2s ease-in-out'
                    }"
                />

                <g v-if="FINAL_CONFIG.style.chart.plots.labels.show">
                    <g v-for="plot in ds.plots">
                        <!-- SINGLE LINE -->
                        <text
                            v-if="!String(plot.label).includes('\n')"
                            data-cy="datapoint-label"
                            :x="plot.x + FINAL_CONFIG.style.chart.plots.labels.offsetX"
                            :y="plot.y + FINAL_CONFIG.style.chart.plots.labels.offsetY + sizes.plots + sizes.labels"
                            :font-size="sizes.labels"
                            :fill="FINAL_CONFIG.style.chart.plots.labels.color"
                            :font-weight="FINAL_CONFIG.style.chart.plots.labels.bold ? 'bold' : 'normal'"
                            text-anchor="middle"
                            :class="{ 'animated' : FINAL_CONFIG.useCssAnimation && !loading }"
                            :style="{
                                opacity: selectedDatapoint === null ? 1 : selectedDatapoint.id === plot.id ? 1 : 0.3,
                                transition: 'opacity 0.2s ease-in-out'
                            }"
                        >
                            {{ plot.label }}
                        </text>

                        <!-- MULTILINE -->
                        <text
                            v-else
                            data-cy="datapoint-label"
                            :x="plot.x + FINAL_CONFIG.style.chart.plots.labels.offsetX"
                            :y="plot.y + FINAL_CONFIG.style.chart.plots.labels.offsetY + sizes.plots + sizes.labels"
                            :font-size="sizes.labels"
                            :fill="FINAL_CONFIG.style.chart.plots.labels.color"
                            :font-weight="FINAL_CONFIG.style.chart.plots.labels.bold ? 'bold' : 'normal'"
                            text-anchor="middle"
                            :class="{ 'animated' : FINAL_CONFIG.useCssAnimation && !loading }"
                            :style="{
                                opacity: selectedDatapoint === null ? 1 : selectedDatapoint.id === plot.id ? 1 : 0.3,
                                transition: 'opacity 0.2s ease-in-out'
                            }"
                            v-html="createTSpansFromLineBreaksOnX({
                                content: String(plot.label),
                                fontSize: sizes.labels,
                                fill: FINAL_CONFIG.style.chart.plots.labels.color,
                                x: plot.x + FINAL_CONFIG.style.chart.plots.labels.offsetX,
                                y: plot.y + FINAL_CONFIG.style.chart.plots.labels.offsetY + sizes.plots + sizes.labels
                            })"
                        />
                    </g>
                </g>

                <!-- INDEX LABELS -->
                <g v-if="FINAL_CONFIG.style.chart.plots.indexLabels.show">
                    <text
                        data-cy="datapoint-index-label"
                        v-for="(label, n) in ds.plots"
                        :x="label.x + FINAL_CONFIG.style.chart.plots.indexLabels.offsetX"
                        :y="label.y + FINAL_CONFIG.style.chart.plots.indexLabels.offsetY + sizes.indexLabels / 3"
                        :font-size="sizes.indexLabels"
                        :font-weight="FINAL_CONFIG.style.chart.plots.indexLabels.bold ? 'bold' : 'normal'"
                        :fill="FINAL_CONFIG.style.chart.plots.indexLabels.adaptColorToBackground ? adaptColorToBackground(ds.color) : FINAL_CONFIG.style.chart.plots.indexLabels.color"
                        text-anchor="middle"
                        :class="{ 'animated' : FINAL_CONFIG.useCssAnimation && !loading }"
                        :style="{
                            opacity: selectedDatapoint === null ? 1 : selectedDatapoint.id === label.id ? 1 : 0.3,
                            transition: 'opacity 0.2s ease-in-out'
                        }"
                    >
                        {{ FINAL_CONFIG.style.chart.plots.indexLabels.startAtZero ? n : n + 1 }}
                    </text>
                </g>
            </g>

            <!-- TOOLTIP TRAPS -->
            <g v-for="(ds) in drawableDataset">
                <circle
                    data-cy="tooltip-trap"
                    v-for="(plot, i) in ds.plots"
                    :cx="plot.x"
                    :cy="plot.y"
                    fill="transparent"
                    :r="sizes.plots"
                    stroke="none"
                    @mouseenter="useTooltip({
                        datapoint: plot,
                        plotIndex: i,
                        seriesIndex: ds.seriesIndex,
                    })"
                    @mouseleave="onTrapLeave(({
                        datapoint: plot,
                        plotIndex: i,
                        seriesIndex: ds.seriesIndex,
                    }))"
                    @click="selectDatapoint(({
                        datapoint: plot,
                        plotIndex: i,
                        seriesIndex: ds.seriesIndex,
                    }))"
                />
            </g>
            <slot name="svg" :svg="svg"/>
        </svg>

        <div v-if="$slots.watermark" class="vue-data-ui-watermark">
            <slot name="watermark" v-bind="{ isPrinting: isPrinting || isImaging }"/>
        </div>

        <div ref="chartLegend">
            <Legend
                v-if="FINAL_CONFIG.style.chart.legend.show && isDataset"
                :key="`legend_${legendStep}`"
                :legendSet="legendSet"
                :config="legendConfig"
                @clickMarker="({ legend }) => { segregate(legend.seriesIndex); selectLegend(legend) }"
            >
                <template #item="{ legend, index }">
                    <div :data-cy="`legend-item-${index}`" @click="legend.segregate(); selectLegend(legend)" :style="`opacity:${segregated.includes(legend.seriesIndex) ? 0.5 : 1}`">
                        {{ legend.name }}
                    </div>
                </template>
            </Legend>
    
            <slot v-else name="legend" v-bind:legend="legendSet"/>
        </div>

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
            :parent="historyPlotChart"
            :content="tooltipContent"
            :isCustom="useCustomFormat"
            :isFullscreen="isFullscreen"
            :smooth="FINAL_CONFIG.style.chart.tooltip.smooth"
            :backdropFilter="FINAL_CONFIG.style.chart.tooltip.backdropFilter"
        >
            <template #tooltip-before>
                <slot name="tooltip-before" v-bind="{...dataTooltipSlot}"></slot>
            </template>
            <template #tooltip-after>
                <slot name="tooltip-after" v-bind="{...dataTooltipSlot}"></slot>
            </template>
        </Tooltip>

        <Accordion hideDetails v-if="isDataset" :config="{
            open: mutableConfig.showTable,
            maxHeight: 10000,
            body: {
                backgroundColor: FINAL_CONFIG.style.chart.backgroundColor,
                color: FINAL_CONFIG.style.chart.color
            },
            head: {
                backgroundColor: FINAL_CONFIG.style.chart.backgroundColor,
                color: FINAL_CONFIG.style.chart.color
            }
        }">
            <template #content>            
                <DataTable
                    :key="`table_${tableStep}`"
                    :colNames="dataTable.colNames"
                    :head="dataTable.head" 
                    :body="dataTable.body"
                    :config="dataTable.config"
                    :title="`${FINAL_CONFIG.style.chart.title.text}${FINAL_CONFIG.style.chart.title.subtitle.text ? ` : ${FINAL_CONFIG.style.chart.title.subtitle.text}` : ''}`"
                    @close="mutableConfig.showTable = false"
                >
                    <template #th="{ th }">
                        <div v-html="th" style="display:flex;align-items:center"></div>
                    </template>
                    <template #td="{ td }">
                        {{ td.name || td }}
                    </template>
                </DataTable>
            </template>
        </Accordion>

        <!-- v3 Skeleton loader -->
        <BaseScanner v-if="loading" />
    </div>
</template>

<style scoped>
@import "../vue-data-ui.css";
.vue-ui-history-plot * {
    transition: unset;
}

.vue-ui-history-plot {
    position: relative;
    user-select: none;
    width: 100%;
}

.animated {
    animation: hpanim 0.5s ease-in-out;
    transform-origin: center;
}
@keyframes hpanim {
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
</style>