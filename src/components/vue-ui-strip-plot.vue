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
    checkNaN,
    convertColorToHex,
    convertCustomPalette,
    createCsvContent,
    createTSpansFromLineBreaksOnX,
    createUid,
    darkenHexColor,
    dataLabel,
    downloadCsv,
    error,
    functionReturnsString,
    getMissingDatasetAttributes,
    isFunction,
    lightenHexColor,
    objectIsEmpty,
    palette,
    themePalettes,
    translateSize,
    treeShake,
    wrapText,
    XMLNS,
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
import img from "../img";
import Shape from "../atoms/Shape.vue";
import Title from "../atoms/Title.vue"; // Must be ready in responsive mode
import themes from "../themes.json";
import BaseScanner from "../atoms/BaseScanner.vue";

const Tooltip = defineAsyncComponent(() => import('../atoms/Tooltip.vue'));
const BaseIcon = defineAsyncComponent(() => import('../atoms/BaseIcon.vue'));
const Accordion = defineAsyncComponent(() => import('./vue-ui-accordion.vue'));
const DataTable = defineAsyncComponent(() => import('../atoms/DataTable.vue'));
const UserOptions = defineAsyncComponent(() => import('../atoms/UserOptions.vue'));
const PenAndPaper = defineAsyncComponent(() => import('../atoms/PenAndPaper.vue'));
const PackageVersion = defineAsyncComponent(() => import('../atoms/PackageVersion.vue'));
const BaseDraggableDialog = defineAsyncComponent(() => import('../atoms/BaseDraggableDialog.vue'));

const { vue_ui_strip_plot: DEFAULT_CONFIG } = useConfig();

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
    }
});

const emit = defineEmits(['selectDatapoint']);

const isDataset = computed({
    get() {
        return !!props.dataset && props.dataset.length;
    },
    set(bool){
        return bool;
    }
});

const uid = ref(createUid());
const step = ref(0);
const isTooltip = ref(false);
const tooltipContent = ref("");
const stripPlotChart = ref(null);
const chartTitle = ref(null);
const source = ref(null);
const noTitle = ref(null);
const animationStarted = ref(false);
const titleStep = ref(0);
const tableStep = ref(0);
const tableUnit = ref(null);
const userOptionsRef = ref(null);

const xAxisLabel = ref(null);
const yAxisLabel = ref(null);
const timeLabelsEls = ref(null);
const scaleLabels = ref(null);

const FINAL_CONFIG = ref(prepareConfig());

const { loading, FINAL_DATASET, manualLoading } = useLoading({
    ...toRefs(props),
    FINAL_CONFIG,
    prepareConfig,
    skeletonDataset: [
        {
            name: '_',
            color: '#DBDBDB',
            plots: [
                { name: '_', value: 1 },
                { name: '_', value: 2 },
                { name: '_', value: 3 },
            ]
        },
        {
            name: '_',
            color: '#C4C4C4',
            plots: [
                { name: '_', value: 3 },
                { name: '_', value: 5 },
                { name: '_', value: 8 },
            ]
        },
        {
            name: '_',
            color: '#ADADAD',
            plots: [
                { name: '_', value: 8 },
                { name: '_', value: 13 },
                { name: '_', value: 21 },
            ]
        },
        {
            name: '_',
            color: '#969696',
            plots: [
                { name: '_', value: 21 },
                { name: '_', value: 34 },
                { name: '_', value: 55 },
            ]
        },
        {
            name: '_',
            color: '#808080',
            plots: [
                { name: '_', value: 55 },
                { name: '_', value: 89 },
                { name: '_', value: 144 },
            ]
        },
    ],
    skeletonConfig: treeShake({
        defaultConfig: FINAL_CONFIG.value,
        userConfig: {
            userOptions: { show: false },
            table: { show: false },
            style: {
                chart: {
                    backgroundColor: '#99999930',
                    padding: {
                        top: 24,
                        left: 24,
                        right: 24,
                        bottom: 24
                    },
                    grid: {
                        stroke: '#6A6A6A',
                        horizontalGrid: {
                            stroke: '#6A6A6A'
                        },
                        verticalGrid: {
                            stroke: '#6A6A6A'
                        }
                    },
                    plots: {
                        stroke: '#6A6A6A',
                    },
                    labels: {
                        bestPlotLabel: { show: false },
                        axis: {
                            xLabel: '',
                            yLabel: ''
                        },
                        xAxisLabels: { show: false },
                        yAxisLabels: { show: false }
                    }
                }
            }
        }
    })
})

const { userOptionsVisible, setUserOptionsVisibility, keepUserOptionState } = useUserOptionState({ config: FINAL_CONFIG.value });
const { svgRef } = useChartAccessibility({ config: FINAL_CONFIG.value.style.chart.title });

function prepareConfig() {
    const mergedConfig = useNestedProp({
        userConfig: props.config,
        defaultConfig: DEFAULT_CONFIG
    });
    if (mergedConfig.theme) {
        return {
            ...useNestedProp({
                userConfig: themes.vue_ui_strip_plot[mergedConfig.theme] || props.config,
                defaultConfig: mergedConfig
            }),
            customPalette: themePalettes[mergedConfig.theme] || palette
        }
    } else {
        return mergedConfig;
    }
}

watch(() => props.config, async (_newCfg) => {
    if (!loading.value) {
        FINAL_CONFIG.value = prepareConfig();
    }
    userOptionsVisible.value = !FINAL_CONFIG.value.userOptions.showOnChartHover;
    prepareChart();
    titleStep.value += 1;
    tableStep.value += 1;

    // Reset mutable config
    mutableConfig.value.dataLabels.show = FINAL_CONFIG.value.style.chart.labels.bestPlotLabel.show;
    mutableConfig.value.showTable = FINAL_CONFIG.value.table.show;
    mutableConfig.value.showTooltip = FINAL_CONFIG.value.style.chart.tooltip.show;
    
    WIDTH.value = FINAL_CONFIG.value.style.chart.width;
    HEIGHT.value = FINAL_CONFIG.value.style.chart.height;
    plotRadius.value = FINAL_CONFIG.value.style.chart.plots.radius;
}, { deep: true });

watch(() => props.dataset, (_) => {
    if (Array.isArray(_) && _.length > 0) {
        manualLoading.value = false;
    }
}, { deep: true })

const resizeObserver = shallowRef(null);
const observedEl = shallowRef(null);

onMounted(() => {
    prepareChart();
});

const debug = computed(() => !!FINAL_CONFIG.value.debug);

function prepareChart() {
    if (objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiStripPlot',
            type: 'dataset',
            debug: debug.value
        });
        manualLoading.value = true;
    } else {
        props.dataset.forEach((ds, i) => {
            getMissingDatasetAttributes({
                datasetObject: ds,
                requiredAttributes: ['name', 'plots']
            }).forEach(attr => {
                isDataset.value = false;
                error({
                    componentName: 'VueUiStripPlot',
                    type: 'datasetSerieAttribute',
                    property: attr,
                    index: i,
                    debug: debug.value
                });
            })
            if (ds.plots) {
                ds.plots.forEach((plot, j) => {
                    getMissingDatasetAttributes({
                        datasetObject: plot,
                        requiredAttributes: ['name', 'value']
                    }).forEach(attr => {
                        isDataset.value = false;
                        error({
                            componentName: 'VueUiStripPlot',
                            type: 'datasetSerieAttribute',
                            property: attr,
                            index: `${i},${j}`,
                            debug: debug.value
                        });
                    })
                })
            }
        })
    }

    // v3
    if (!objectIsEmpty(props.dataset)) {
        manualLoading.value = FINAL_CONFIG.value.loading;
    }

    if (FINAL_CONFIG.value.responsive) {
        const handleResize = throttle(() => {
            const { width, height } = useResponsive({
                chart: stripPlotChart.value,
                title: FINAL_CONFIG.value.style.chart.title.text ? chartTitle.value : null,
                source: source.value,
                noTitle: noTitle.value
            });

            requestAnimationFrame(() => {
                absoluteHeight.value = height;
    
                WIDTH.value = Math.max(0.1, width);
                HEIGHT.value = Math.max(0.1, height - 12);

                if (FINAL_CONFIG.value.responsiveProportionalSizing) {
                    plotRadius.value = translateSize({
                        relator: Math.min(height, width),
                        adjuster: 600,
                        source: FINAL_CONFIG.value.style.chart.plots.radius,
                        threshold: 6,
                        fallback: 6
                    });
                } else {
                    plotRadius.value = FINAL_CONFIG.value.style.chart.plots.radius;
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
        observedEl.value = stripPlotChart.value.parentNode;
        resizeObserver.value.observe(observedEl.value);
    }

    animationStarted.value = true;
    setTimeout(() => {
        animationActive.value = false;
    }, maxSeries.value * 50)
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
    elementId: `strip-plot_${uid.value}`,
    fileName: FINAL_CONFIG.value.style.chart.title.text || 'vue-ui-strip-plot',
    options: FINAL_CONFIG.value.userOptions.print
});

const hasOptionsNoTitle = computed(() => {
    return FINAL_CONFIG.value.userOptions.show && !FINAL_CONFIG.value.style.chart.title.text;
});

const customPalette = computed(() => {
    return convertCustomPalette(FINAL_CONFIG.value.customPalette);
});

const animationActive = ref(FINAL_CONFIG.value.useCssAnimation);

const padding = ref({
    top: FINAL_CONFIG.value.style.chart.padding.top,
    bottom: FINAL_CONFIG.value.style.chart.padding.bottom,
    left: FINAL_CONFIG.value.style.chart.padding.left,
    right: FINAL_CONFIG.value.style.chart.padding.right
});

const WIDTH = ref(FINAL_CONFIG.value.style.chart.width);
const HEIGHT = ref(FINAL_CONFIG.value.style.chart.height);

const absoluteHeight = ref(FINAL_CONFIG.value.style.chart.height);
const plotRadius = ref(FINAL_CONFIG.value.style.chart.plots.radius);

const mutableConfig = ref({
    showTable: FINAL_CONFIG.value.table.show,
    dataLabels: {
        show: FINAL_CONFIG.value.style.chart.labels.bestPlotLabel.show
    },
    showTooltip: FINAL_CONFIG.value.style.chart.tooltip.show
});

// v3 - Essential to make shifting between loading config and final config work
watch(FINAL_CONFIG, () => {
    mutableConfig.value = {
        showTable: FINAL_CONFIG.value.table.show,
        dataLabels: {
            show: FINAL_CONFIG.value.style.chart.labels.bestPlotLabel.show
        },
        showTooltip: FINAL_CONFIG.value.style.chart.tooltip.show
    }
    WIDTH.value = FINAL_CONFIG.value.style.chart.width;
    HEIGHT.value = FINAL_CONFIG.value.style.chart.height;
    plotRadius.value = FINAL_CONFIG.value.style.chart.plots.radius;
}, { immediate: true });

const adjustedPlotRadius = computed(() => {
    return Math.min(plotRadius.value, (drawingArea.value.stripWidth / 2) * 0.9)
})

function getOffsetX() {
    let base = 0;
    if (scaleLabels.value) {
        const texts = Array.from(scaleLabels.value.querySelectorAll('text'));
        base = texts.reduce((max, t) => {
            const w = t.getComputedTextLength();
            return w > max ? w : max;
        }, 0);
    }
    const yAxisLabelW = yAxisLabel.value ? yAxisLabel.value.getBoundingClientRect().width : 0;

    return base + yAxisLabelW + (yAxisLabelW ? 24 : 0);
}

const labelsXHeight = ref(0);

const updateHeight = throttle((h) => {
    labelsXHeight.value = h;
}, 100);

watchEffect((onInvalidate) => {
    const el = timeLabelsEls.value;
    if (!el) return;
    const observer = new ResizeObserver(entries => {
        updateHeight(entries[0].contentRect.height);
    });
    observer.observe(el);
    onInvalidate(() => observer.disconnect());
});

onBeforeUnmount(() => {
    labelsXHeight.value = 0;
});

const offsetY = computed(() => {
    let h = 0;
    if (xAxisLabel.value) {
        h = xAxisLabel.value.getBBox().height + FINAL_CONFIG.value.style.chart.labels.axis.fontSize / 3 + 12 + FINAL_CONFIG.value.style.chart.labels.axis.xLabelOffsetY;
    }
    let tlH = 0;
    if (timeLabelsEls.value) {
        tlH = labelsXHeight.value + 12;
    }
    return h + tlH;
});

const drawingArea = computed(() => {
    const offsetX = getOffsetX();

    const width = WIDTH.value - offsetX - FINAL_CONFIG.value.style.chart.padding.left - FINAL_CONFIG.value.style.chart.padding.right - FINAL_CONFIG.value.style.chart.labels.axis.yLabelOffsetX - 5;

    return {
        left: padding.value.left + offsetX + FINAL_CONFIG.value.style.chart.labels.axis.yLabelOffsetX + 5,
        right: WIDTH.value - padding.value.right,
        top: padding.value.top,
        bottom: HEIGHT.value - padding.value.bottom - offsetY.value,
        width,
        height: HEIGHT.value - padding.value.top - padding.value.bottom - offsetY.value,
        stripWidth: width / FINAL_DATASET.value.length,
        absoluteHeight: HEIGHT.value,
    }
});

const immutableDataset = computed(() => {
    return FINAL_DATASET.value.map((ds, i) => {
        const id = createUid();
        return {
            ...ds,
            id,
            color: ds.color ? convertColorToHex(ds.color) : customPalette.value[i] || palette[i] || palette[i % palette.length],
            plots: ds.plots.map((p, j) => {
                return {
                    ...p,
                    value: checkNaN(p.value),
                    parentId: id,
                    parentName: ds.name,
                    parentIndex: i,
                    plotIndex: j,
                    color: ds.color ? convertColorToHex(ds.color) : customPalette.value[i] || palette[i] || palette[i % palette.length],
                    id: createUid(),
                }
            }).sort((a, b) => a.value - b.value)
        }
    });
});

const mutableDataset = computed(() => {
    return (immutableDataset.value || []).map((ds, i) => {
        return {
            ...ds,
            plots: ds.plots.map((p) => {
                return {
                    ...p,
                    x: drawingArea.value.left + ((i + 1) * drawingArea.value.stripWidth) - drawingArea.value.stripWidth / 2,
                }
            })
        }
    });
});

const maxSeries = computed(() => Math.max(...mutableDataset.value.map(ds => ds.plots.length)));

const extremes = computed(() => {
    const flattened = mutableDataset.value.flatMap(ds => ds.plots.map(p => p.value));
    return {
        max: Math.max(...flattened),
        min: Math.min(...flattened),
    }
});

const scale = computed(() => {
    return calculateNiceScale(extremes.value.min < 0 ? extremes.value.min : 0, extremes.value.max, FINAL_CONFIG.value.style.chart.grid.scaleSteps);
});

const drawableDataset = computed(() => {
    return (mutableDataset.value || []).map((ds, i) => {
        return {
            ...ds,
            plots: ds.plots.map((p) => {
                return {
                    ...p,
                    y: drawingArea.value.bottom - (((p.value + Math.abs(scale.value.min)) / (scale.value.max + Math.abs(scale.value.min))) * drawingArea.value.height)
                }
            })
        }
    });
});

const yLines = computed(() => {
    return scale.value.ticks.map(t => {
        return {
            y: drawingArea.value.bottom - (drawingArea.value.height * ((t + Math.abs(scale.value.min)) / (scale.value.max + Math.abs(scale.value.min)))),
            x1: drawingArea.value.left,
            x2: drawingArea.value.right,
            value: t
        }
    });
});

const dataTooltipSlot = ref(null);
const selectedDatapoint = ref(null);

function onTrapLeave({ datapoint, seriesIndex }) {
    isTooltip.value = false;
    selectedDatapoint.value = null;
    if (FINAL_CONFIG.value.events.datapointLeave) {
        FINAL_CONFIG.value.events.datapointLeave({ datapoint, seriesIndex });
    }
}

function onTrapClick({ datapoint, seriesIndex }) {
    emit('selectDatapoint', datapoint);
    if (FINAL_CONFIG.value.events.datapointClick) {
        FINAL_CONFIG.value.events.datapointClick({ datapoint, seriesIndex });
    }
}

function useTooltip({ datapoint, seriesIndex }) {
    if (FINAL_CONFIG.value.events.datapointEnter) {
        FINAL_CONFIG.value.events.datapointEnter({ datapoint, seriesIndex });
    }

    dataTooltipSlot.value = { datapoint, seriesIndex, config: FINAL_CONFIG.value, series: immutableDataset.value };
    isTooltip.value = true;
    selectedDatapoint.value = datapoint;

    const customFormat = FINAL_CONFIG.value.style.chart.tooltip.customFormat;

    if(isFunction(customFormat) && functionReturnsString(() => customFormat({
        seriesIndex,
        datapoint,
        series: immutableDataset.value,
        config: FINAL_CONFIG.value
    }))) {
        tooltipContent.value = customFormat({
            seriesIndex,
            datapoint,
            series: immutableDataset.value,
            config: FINAL_CONFIG.value
        });
    } else {
        let html = "";

        html += `<div style="display:flex;flex-direction:row;gap:6px;align-items:center;"><svg viewBox="0 0 12 12" height="14" width="14"><circle data-cy="donut-tooltip-marker" cx="6" cy="6" r="6" stroke="none" fill="${FINAL_CONFIG.value.style.chart.plots.gradient.show ? `url(#${datapoint.parentId})` : datapoint.color}"/></svg>${datapoint.name}</div>`;
        html += `<div>${applyDataLabel(
            FINAL_CONFIG.value.style.chart.labels.formatter,
            datapoint.value,
            dataLabel({
                p: FINAL_CONFIG.value.style.chart.labels.prefix,
                v: datapoint.value,
                s: FINAL_CONFIG.value.style.chart.labels.suffix,
                r: FINAL_CONFIG.value.style.chart.tooltip.roundingValue
            }),
            { datapoint, seriesIndex }
        )}</div>`

        tooltipContent.value = `<div>${html}</div>`;
    }
}

const table = computed(() => {
    const head = mutableDataset.value.flatMap(ds => {
        return JSON.parse(JSON.stringify(ds.plots)).sort((a,b) => b.value - a.value).map(p => {
            return {
                name: `${ds.name} - ${p.name}`,
                color: p.color
            }
        })
    })
    const body = mutableDataset.value.flatMap(ds => {
        return JSON.parse(JSON.stringify(ds.plots)).sort((a,b) => b.value - a.value).map(p => p.value)
    })
    return { head, body };
});

function generateCsv(callback=null) {
    nextTick(() => {
        const labels = table.value.head.map((h,i) => {
            return [[
                h.name
            ],[table.value.body[i]]]
        });
        const tableXls = [[FINAL_CONFIG.value.style.chart.title.text],[FINAL_CONFIG.value.style.chart.title.subtitle.text],[[FINAL_CONFIG.value.table.columnNames.series],[FINAL_CONFIG.value.table.columnNames.value]]].concat(labels);

        const csvContent = createCsvContent(tableXls);

        if (!callback) {
            downloadCsv({ csvContent, title: FINAL_CONFIG.value.style.chart.title.text || "vue-ui-strip-plot" })
        } else {
            callback(csvContent);
        }
    });
}

const dataTable = computed(() => {
    const head = [
        FINAL_CONFIG.value.table.columnNames.series,
        FINAL_CONFIG.value.table.columnNames.value,
    ];
    const body = table.value.head.map((h,i) => {
        const label = dataLabel({
            p: FINAL_CONFIG.value.style.chart.labels.prefix,
            v: table.value.body[i],
            s: FINAL_CONFIG.value.style.chart.labels.suffix,
            r: FINAL_CONFIG.value.table.td.roundingValue
        });
        return [
            {
                color: h.color,
                name: h.name
            },
            label
        ]
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

    const colNames = [
        FINAL_CONFIG.value.table.columnNames.series,
        FINAL_CONFIG.value.table.columnNames.value,
    ];

    return {
        colNames,
        head,
        body,
        config
    }
});

const isFullscreen = ref(false)
function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
}

function getData() {
    return mutableDataset.value;
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
    if (!stripPlotChart.value) return;
    const { width, height } = stripPlotChart.value.getBoundingClientRect();
    const aspectRatio = width / height;
    const { imageUri, base64 } = await img({ domElement: stripPlotChart.value, base64: true, img: true, scale })
    return { 
        imageUri, 
        base64, 
        title: FINAL_CONFIG.value.style.chart.title.text,
        width,
        height,
        aspectRatio
    }
}

const seriesNames = computed(() => mutableDataset.value.map(d => d.name));
const dummySlicer = ref({ start: 0, end: mutableDataset.value.length });

useTimeLabelCollision({
    timeLabelsEls,
    timeLabels: seriesNames,
    slicer: dummySlicer,
    configRef: FINAL_CONFIG,
    rotationPath: ['style', 'chart', 'labels', 'xAxisLabels', 'rotation'],
    autoRotatePath: ['style', 'chart', 'labels', 'xAxisLabels', 'autoRotate', 'enable'],
    isAutoSize: false,
    width: WIDTH,
    height: HEIGHT,
    targetClass: '.vue-ui-strip-plot-category-name',
    rotation: FINAL_CONFIG.value.style.chart.labels.xAxisLabels.autoRotate.angle
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
            fullscreenParent: stripPlotChart.value,
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

defineExpose({
    getData,
    getImage,
    generatePdf,
    generateCsv,
    generateImage,
    toggleTable,
    toggleLabels,
    toggleTooltip,
    toggleAnnotator,
    toggleFullscreen
});

</script>

<template>
    <div ref="stripPlotChart" :class="`vue-ui-strip-plot ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''} ${FINAL_CONFIG.useCssAnimation ? '' : 'vue-ui-dna'}`" :style="`font-family:${FINAL_CONFIG.style.fontFamily};width:100%; text-align:center;background:${FINAL_CONFIG.style.chart.backgroundColor};${FINAL_CONFIG.responsive ? 'height:100%' : ''}`" :id="`strip-plot_${uid}`" @mouseenter="() => setUserOptionsVisibility(true)" @mouseleave="() => setUserOptionsVisibility(false)">
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

        <div ref="chartTitle" v-if="FINAL_CONFIG.style.chart.title.text" :style="`width:100%;background:transparent;padding-bottom:24px`">
            <Title
                :key="`title_${titleStep}`"
                :config="{
                    title: {
                        cy: 'donut-div-title',
                        ...FINAL_CONFIG.style.chart.title
                    },
                    subtitle: {
                        cy: 'donut-div-subtitle',
                        ...FINAL_CONFIG.style.chart.title.subtitle
                    }
                }"
            />
        </div>

        <UserOptions
            ref="userOptionsRef"
            :key="`user_option_${step}`"
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
            :hasTable="FINAL_CONFIG.userOptions.buttons.table"
            :hasLabel="FINAL_CONFIG.userOptions.buttons.labels"
            :hasFullscreen="FINAL_CONFIG.userOptions.buttons.fullscreen"
            :isTooltip="mutableConfig.showTooltip"
            :isFullscreen="isFullscreen"
            :titles="{ ...FINAL_CONFIG.userOptions.buttonTitles }"
            :chartElement="stripPlotChart"
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
            :class="{ 'vue-data-ui-fullscreen--on': isFullscreen, 'vue-data-ui-fulscreen--off': !isFullscreen }" 
            :viewBox="`0 0 ${WIDTH} ${HEIGHT}`" 
            :style="`max-width:100%; overflow: visible; background:transparent;color:${FINAL_CONFIG.style.chart.color};`"
        >
            <PackageVersion />

            <!-- BACKGROUND SLOT -->
            <foreignObject 
                v-if="$slots['chart-background']"
                :x="drawingArea.left"
                :y="drawingArea.top"
                :width="Math.max(0.1, drawingArea.width)"
                :height="Math.max(0.1, drawingArea.height)"
                :style="{
                    pointerEvents: 'none'
                }"
            >
                <slot name="chart-background"/>
            </foreignObject>
            
            <!-- GRID -->
            <g v-if="FINAL_CONFIG.style.chart.grid.show">
                <!-- H GRID -->
                <g v-if="FINAL_CONFIG.style.chart.grid.horizontalGrid.show">
                    <line
                        data-cy="grid-horizontal"
                        v-for="l in yLines"
                        :x1="l.x1"
                        :x2="l.x2"
                        :y1="l.y"
                        :y2="l.y"
                        :stroke="FINAL_CONFIG.style.chart.grid.horizontalGrid.stroke"
                        :stroke-width="FINAL_CONFIG.style.chart.grid.horizontalGrid.strokeWidth"
                        :stroke-dasharray="FINAL_CONFIG.style.chart.grid.horizontalGrid.strokeDasharray"
                        stroke-linecap="round"
                    />
                </g>
                <!-- V GRID -->
                <g v-if="FINAL_CONFIG.style.chart.grid.verticalGrid.show">
                    <line
                        data-cy="grid-vertical"
                        v-for="(l, i) in mutableDataset"
                        :x1="drawingArea.left + ((i+1) * drawingArea.stripWidth)"
                        :x2="drawingArea.left + ((i+1) * drawingArea.stripWidth)"
                        :y1="drawingArea.top"
                        :y2="drawingArea.bottom"
                        :stroke="FINAL_CONFIG.style.chart.grid.verticalGrid.stroke"
                        :stroke-width="FINAL_CONFIG.style.chart.grid.verticalGrid.strokeWidth"
                        :stroke-dasharray="FINAL_CONFIG.style.chart.grid.verticalGrid.strokeDasharray"
                        stroke-linecap="round"
                    />
                </g>
                <!-- Y AXIS -->
                <line
                    data-cy="axis-y"
                    :x1="drawingArea.left"
                    :x2="drawingArea.left"
                    :y1="drawingArea.top"
                    :y2="drawingArea.bottom"
                    :stroke="FINAL_CONFIG.style.chart.grid.stroke"
                    :stroke-width="FINAL_CONFIG.style.chart.grid.strokeWidth"
                    stroke-linecap="round"
                />
                <!-- X AXIS -->
                <line 
                    data-cy="axis-x"
                    :x1="drawingArea.left"
                    :x2="drawingArea.right"
                    :y1="drawingArea.bottom"
                    :y2="drawingArea.bottom"
                    :stroke="FINAL_CONFIG.style.chart.grid.stroke"
                    :stroke-width="FINAL_CONFIG.style.chart.grid.strokeWidth"
                    stroke-linecap="round"
                />
            </g>
            <!-- Y SCALE LABELS -->
            <g v-if="FINAL_CONFIG.style.chart.labels.yAxisLabels.show" ref="scaleLabels">
                <text
                    data-cy="axis-y-label"
                    v-for="(label, i) in yLines"
                    :x="label.x1 + FINAL_CONFIG.style.chart.labels.yAxisLabels.offsetX - 5"
                    :y="label.y + FINAL_CONFIG.style.chart.labels.yAxisLabels.fontSize / 3"
                    :fill="FINAL_CONFIG.style.chart.labels.yAxisLabels.color"
                    :font-size="FINAL_CONFIG.style.chart.labels.yAxisLabels.fontSize"
                    text-anchor="end"
                >
                    {{  applyDataLabel(
                        FINAL_CONFIG.style.chart.labels.formatter,
                        label.value,
                        dataLabel({
                            p: FINAL_CONFIG.style.chart.labels.prefix,
                            v: label.value,
                            s: FINAL_CONFIG.style.chart.labels.suffix,
                            r: FINAL_CONFIG.style.chart.labels.yAxisLabels.rounding
                        }),
                        { datapoint: label, seriesIndex: i }
                        )
                    }}
                </text>
            </g>

            <!-- "TIME" LABELS -->
            <g v-if="FINAL_CONFIG.style.chart.labels.xAxisLabels.show" ref="timeLabelsEls">
                <g v-for="(label, i) in seriesNames">
                    <!-- SINGLE LINE -->     
                    <text
                        class="vue-ui-strip-plot-category-name"
                        v-if="!String(label).includes('\n')"
                        data-cy="axis-x-label"
                        :transform="`translate(${drawingArea.left + ((i+1) * drawingArea.stripWidth) - drawingArea.stripWidth / 2}, ${drawingArea.bottom + FINAL_CONFIG.style.chart.labels.xAxisLabels.fontSize * 2  + FINAL_CONFIG.style.chart.labels.xAxisLabels.offsetY}), rotate(${FINAL_CONFIG.style.chart.labels.xAxisLabels.rotation})`"
                        :font-size="FINAL_CONFIG.style.chart.labels.xAxisLabels.fontSize"
                        :fill="FINAL_CONFIG.style.chart.labels.xAxisLabels.color"
                        :text-anchor="FINAL_CONFIG.style.chart.labels.xAxisLabels.rotation > 0 ? 'start' : FINAL_CONFIG.style.chart.labels.xAxisLabels.rotation < 0 ? 'end' : 'middle'"
                    >
                        {{ String(label) }}
                    </text>

                    <!-- MULTILINE -->
                    <text
                        v-else
                        class="vue-ui-strip-plot-category-name"
                        data-cy="axis-x-label"
                        :transform="`translate(${drawingArea.left + ((i+1) * drawingArea.stripWidth) - drawingArea.stripWidth / 2}, ${drawingArea.bottom + FINAL_CONFIG.style.chart.labels.xAxisLabels.fontSize * 2  + FINAL_CONFIG.style.chart.labels.xAxisLabels.offsetY}), rotate(${FINAL_CONFIG.style.chart.labels.xAxisLabels.rotation})`"
                        :font-size="FINAL_CONFIG.style.chart.labels.xAxisLabels.fontSize"
                        :fill="FINAL_CONFIG.style.chart.labels.xAxisLabels.color"
                        :text-anchor="FINAL_CONFIG.style.chart.labels.xAxisLabels.rotation > 0 ? 'start' : FINAL_CONFIG.style.chart.labels.xAxisLabels.rotation < 0 ? 'end' : 'middle'"
                        v-html="createTSpansFromLineBreaksOnX({
                            content: wrapText(String(label)),
                            fontSize: FINAL_CONFIG.style.chart.labels.xAxisLabels.fontSize,
                            fill: FINAL_CONFIG.style.chart.labels.xAxisLabels.color,
                            x: 0,
                            y: 0
                        })"
                    />
                </g>
            </g>

            <!-- Y AXIS NAME-->
            <text
                ref="yAxisLabel"
                data-cy="axis-y-name"
                v-if="FINAL_CONFIG.style.chart.labels.axis.yLabel"
                :fill="FINAL_CONFIG.style.chart.labels.axis.color"
                :font-size="FINAL_CONFIG.style.chart.labels.axis.fontSize"
                :transform="`translate(${FINAL_CONFIG.style.chart.labels.axis.fontSize}, ${drawingArea.top + drawingArea.height / 2}) rotate(-90)`"
                text-anchor="middle"
            >
                {{ FINAL_CONFIG.style.chart.labels.axis.yLabel }}
            </text>
            <!-- X AXIS NAME -->
            <text 
                ref="xAxisLabel"
                data-cy="axis-x-name"
                v-if="FINAL_CONFIG.style.chart.labels.axis.xLabel"
                :fill="FINAL_CONFIG.style.chart.labels.axis.color"
                :font-size="FINAL_CONFIG.style.chart.labels.axis.fontSize"
                :x="drawingArea.left + drawingArea.width / 2"
                :y="HEIGHT - FINAL_CONFIG.style.chart.labels.axis.fontSize / 3"
                text-anchor="middle"
            >
                {{ FINAL_CONFIG.style.chart.labels.axis.xLabel }}
            </text>

            <template v-if="selectedDatapoint">
                <line
                    data-cy="selection-line"
                    :x1="drawingArea.left"
                    :x2="drawingArea.right"
                    :y1="selectedDatapoint.y"
                    :y2="selectedDatapoint.y"
                    :stroke="selectedDatapoint.color"
                    :stroke-width="1"
                    :class="{ 'select-circle': FINAL_CONFIG.useCssAnimation }"
                />
                <circle
                    data-cy="selection-marker-circle-left"
                    :cx="drawingArea.left"
                    :cy="selectedDatapoint.y"
                    :r="3"
                    :fill="selectedDatapoint.color"
                    :class="{ 'select-circle': FINAL_CONFIG.useCssAnimation }"
                />
                <circle
                    data-cy="selection-marker-circle-right"
                    :cx="drawingArea.right"
                    :cy="selectedDatapoint.y"
                    :r="3"
                    :fill="selectedDatapoint.color"
                    :class="{ 'select-circle': FINAL_CONFIG.useCssAnimation }"
                />
            </template>

            <!-- PLOTS -->
            <defs>
                <radialGradient v-for="ds in mutableDataset" :id="ds.id" fy="30%">
                    <stop offset="10%" :stop-color="lightenHexColor(ds.color, FINAL_CONFIG.style.chart.plots.gradient.intensity / 100)"/>
                    <stop offset="90%" :stop-color="darkenHexColor(ds.color, 0.1)"/>
                    <stop offset="100%" :stop-color="ds.color"/>
                </radialGradient>
            </defs>
            <template v-for="(ds, S) in drawableDataset">
                <!--FIXME: Animation only works on circles, as y is direct and dynamic whereas other shapes build paths -->
                <Shape 
                    v-for="(plot, i) in ds.plots"
                    v-bind="$attrs"
                    :plot="{ x:plot.x, y: animationStarted ? plot.y : drawingArea.top }"
                    :radius="selectedDatapoint && selectedDatapoint.id === plot.id ? adjustedPlotRadius * 1.5 : adjustedPlotRadius"
                    :shape="FINAL_CONFIG.style.chart.plots.shape"
                    :stroke="FINAL_CONFIG.style.chart.plots.stroke"
                    :strokeWidth="FINAL_CONFIG.style.chart.plots.strokeWidth"
                    :color="FINAL_CONFIG.style.chart.plots.gradient.show ? `url(#${ds.id})` : ds.color"
                    :style="`transition: all 0.2s ease-in-out; opacity:${selectedDatapoint ? selectedDatapoint.id === plot.id ? 1 : 0.2 : FINAL_CONFIG.style.chart.plots.opacity};${animationActive ? `transition-delay:${i * 50}ms` : ''}`"
                    :class="{ 'vue-ui-strip-plot-animated': FINAL_CONFIG.useCssAnimation && animationActive && !loading, 'vue-ui-strip-plot-select-circle': FINAL_CONFIG.useCssAnimation && !animationActive}"
                    @mouseenter="useTooltip({ datapoint: plot, seriesIndex: i })"
                    @mouseleave="onTrapLeave({ datapoint: plot, seriesIndex: i })"
                    @click="onTrapClick({ datapoint: plot, seriesIndex: i })"
                />

                <!-- BEST PLOT LABELS -->
                <g v-if="mutableConfig.dataLabels.show">
                    <template v-for="(plot, i) in ds.plots">
                        <text
                            data-cy="best-plot-label"
                            v-if="i === ds.plots.length - 1 || (selectedDatapoint && selectedDatapoint.id === plot.id && !mutableConfig.showTooltip)"
                            :x="plot.x"
                            :y="plot.y + FINAL_CONFIG.style.chart.labels.bestPlotLabel.offsetY - adjustedPlotRadius * (selectedDatapoint && selectedDatapoint.id === plot.id && !mutableConfig.showTooltip ? 2 : 1.5)"
                            :font-size="FINAL_CONFIG.style.chart.labels.bestPlotLabel.fontSize"
                            :fill="FINAL_CONFIG.style.chart.labels.bestPlotLabel.color"
                            text-anchor="middle"
                            :style="`opacity:${FINAL_CONFIG.useCssAnimation ? animationActive ? 0 : 1 : 1};transition:opacity 0.2s ease-in;`"
                        >
                            {{ plot.name }} {{ FINAL_CONFIG.style.chart.labels.bestPlotLabel.showValue ? applyDataLabel(
                                FINAL_CONFIG.style.chart.labels.formatter,
                                plot.value,
                                dataLabel({
                                    p: `(${FINAL_CONFIG.style.chart.labels.prefix}`,
                                    v: plot.value,
                                    s: `${FINAL_CONFIG.style.chart.labels.suffix})`,
                                    r: FINAL_CONFIG.style.chart.labels.bestPlotLabel.rounding
                                }),
                                { datapoint: plot, seriesIndex: i }
                            ) : '' }}
                        </text>
                    </template>
                </g>
            </template>
            <slot name="svg" :svg="drawingArea"/>
        </svg>

        <div v-if="$slots.watermark" class="vue-data-ui-watermark">
            <slot name="watermark" v-bind="{ isPrinting: isPrinting || isImaging }"/>
        </div>

        <div v-if="$slots.source" ref="source" dir="auto">
            <slot name="source" />
        </div>

        <Tooltip
            :show="mutableConfig.showTooltip && isTooltip"
            :backgroundColor="FINAL_CONFIG.style.chart.tooltip.backgroundColor"
            :color="FINAL_CONFIG.style.chart.tooltip.color"
            :borderRadius="FINAL_CONFIG.style.chart.tooltip.borderRadius"
            :borderColor="FINAL_CONFIG.style.chart.tooltip.borderColor"
            :borderWidth="FINAL_CONFIG.style.chart.tooltip.borderWidth"
            :fontSize="FINAL_CONFIG.style.chart.tooltip.fontSize"
            :backgroundOpacity="FINAL_CONFIG.style.chart.tooltip.backgroundOpacity"
            :position="FINAL_CONFIG.style.chart.tooltip.position"
            :offsetY="FINAL_CONFIG.style.chart.tooltip.offsetY"
            :parent="stripPlotChart"
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
                        <div v-html="th" style="display:flex;align-items:center"></div>
                    </template>
                    <template #td="{ td }">
                        {{ td.name || td }}
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

.vue-ui-strip-plot {
    user-select: none;
    position: relative;
}
</style>

<style>
.vue-ui-strip-plot-animated * {
    transition-property: cy, opacity ;
    transition-duration: 0.3s ;
}
.vue-ui-strip-plot-select-circle * {
    transition: all 0.1s ease-in-out !important;
}
</style>