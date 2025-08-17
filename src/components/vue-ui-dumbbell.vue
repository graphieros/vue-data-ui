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
    createCsvContent,
    createUid,
    darkenHexColor,
    dataLabel,
    downloadCsv,
    error,
    getMissingDatasetAttributes,
    lightenHexColor,
    objectIsEmpty,
    setOpacity,
    treeShake,
    XMLNS,
} from "../lib";
import { throttle } from "../canvas-lib";
import { useConfig } from "../useConfig";
import { usePrinter } from "../usePrinter";
import { useLoading } from "../useLoading";
import { useNestedProp } from "../useNestedProp";
import { useResponsive } from "../useResponsive";
import { useUserOptionState } from "../useUserOptionState";
import { useChartAccessibility } from "../useChartAccessibility";
import { useTimeLabelCollision } from "../useTimeLabelCollider";
import img from "../img";
import Title from "../atoms/Title.vue"; // Must be ready in responsive mode
import themes from "../themes.json";
import Legend from "../atoms/Legend.vue"; // Must be ready in responsive mode
import BaseScanner from "../atoms/BaseScanner.vue";

const Accordion = defineAsyncComponent(() => import('./vue-ui-accordion.vue'));
const DataTable = defineAsyncComponent(() => import('../atoms/DataTable.vue'));
const PenAndPaper = defineAsyncComponent(() => import('../atoms/PenAndPaper.vue'));
const UserOptions = defineAsyncComponent(() => import('../atoms/UserOptions.vue'));
const PackageVersion = defineAsyncComponent(() => import('../atoms/PackageVersion.vue'));

const { vue_ui_dumbbell: DEFAULT_CONFIG } = useConfig();

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
const dumbbellChart = ref(null);
const chartTitle = ref(null);
const chartLegend = ref(null);
const source = ref(null);
const noTitle = ref(null);
const titleStep = ref(0);
const tableStep = ref(0);
const legendStep = ref(0);

const yAxisLabel = ref(null);
const serieLabels = ref(null);
const scaleLabels = ref(null);
const xAxisLabel = ref(null);

const selectedTrapIndex = ref(null);
const selectedDatapoint = ref(null);

const areSeriesNamesColliding = ref(false);

const FINAL_CONFIG = ref(prepareConfig());

const { loading, FINAL_DATASET, manualLoading } = useLoading({
    ...toRefs(props),
    FINAL_CONFIG,
    prepareConfig,
    skeletonDataset: [
        { name: '_', start: 21, end: 34 },
        { name: '_', start: 13, end: 21 },
        { name: '_', start: 8, end: 13 },
        { name: '_', start: 5, end: 8 },
        { name: '_', start: 3, end: 5 },
    ],
    skeletonConfig: treeShake({
        defaultConfig: FINAL_CONFIG.value,
        userConfig: {
            userOptions: { show: false },
            table: { show: false },
            useAnimation: false,
            style: {
                chart: {
                    backgroundColor: '#99999930',
                    padding: {
                        top: 12,
                        right: 12,
                        bottom: 12,
                        left: 12,
                    },
                    grid: {
                        horizontalGrid: { stroke: '#6A6A6A' },
                        verticalGrid: { stroke: '#6A6A6A' }
                    },
                    labels: {
                        axis: {
                            yLabel: '',
                            xLabel: ''
                        },
                        xAxisLabels: { show: false },
                        yAxisLabels: { show: false },
                        endLabels: { show: false },
                        startLabels: { show: false },
                    },
                    legend: {
                        backgroundColor: 'transparent'
                    },
                    plots: {
                        endColor: '#969696',
                        startColor: '#DBDBDB',
                        stroke: '#6A6A6A'
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
                userConfig: themes.vue_ui_dumbbell[mergedConfig.theme] || props.config,
                defaultConfig: mergedConfig
            }),
        }
    } else {
        return mergedConfig;
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
    baseRowHeight.value = FINAL_CONFIG.value.style.chart.rowHeight;
    WIDTH.value = FINAL_CONFIG.value.style.chart.width;

    // Reset mutable config
    mutableConfig.value.showTable = FINAL_CONFIG.value.table.show;
}, { deep: true });

watch(() => FINAL_DATASET.value, (_) => {
    if (Array.isArray(_) && _.length > 0) {
        manualLoading.value = false;
    }
    initMutableFromImmutable()
    prepareDataset();
}, { deep: true })

const resizeObserver = shallowRef(null);
const observedEl = shallowRef(null);

onMounted(() => {
    prepareChart();
});

const debug = computed(() => !!FINAL_CONFIG.value.debug);

function prepareChart() {
    if(objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiDumbbell',
            type: 'dataset',
            debug: debug.value
        });
    } else {
        props.dataset.forEach((ds, i) => {
            getMissingDatasetAttributes({
                datasetObject: ds,
                requiredAttributes: ['name', 'start', 'end']
            }).forEach(attr => {
                isDataset.value = false;
                error({
                    componentName: 'VueUiDumbbell',
                    type: 'datasetSerieAttribute',
                    property: attr,
                    index: i,
                    debug: debug.value
                })
            })
        });
    }

    if (FINAL_CONFIG.value.responsive) {
        const handleResize = throttle(() => {
            const { width, height } = useResponsive({
                chart: dumbbellChart.value,
                title: FINAL_CONFIG.value.style.chart.title.text ? chartTitle.value : null,
                legend: FINAL_CONFIG.value.style.chart.legend.show ? chartLegend.value : null,
                source: source.value,
                noTitle: noTitle.value
            });

            const padTitle = FINAL_CONFIG.value.style.chart.title.text ? 24 : 0;
            const padLegend = FINAL_CONFIG.value.style.chart.legend.show ? 24 : 0;

            requestAnimationFrame(async () => {
                WIDTH.value = Math.max(0.1, width);
                baseRowHeight.value = Math.max(0.1, (height - (padTitle + padLegend)) / FINAL_DATASET.value.length);
                updateNameValueCollision();
            });
        });

        if (resizeObserver.value) {
            if (observedEl.value) {
                resizeObserver.value.unobserve(observedEl.value);
            }
            resizeObserver.value.disconnect();
        }

        resizeObserver.value = new ResizeObserver(handleResize);
        observedEl.value = dumbbellChart.value.parentNode;
        resizeObserver.value.observe(observedEl.value);
    }

    updateNameValueCollision();
}

onBeforeUnmount(() => {
    if (raf.value != null) {
        cancelAnimationFrame(raf.value);
        raf.value = null;
    }

    if (resizeObserver.value) {
        if (observedEl.value) {
            resizeObserver.value.unobserve(observedEl.value);
        }
        resizeObserver.value.disconnect();
    }
});

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `dumbbell_${uid.value}`,
    fileName: FINAL_CONFIG.value.style.chart.title.text || 'vue-ui-dumbbell',
    options: FINAL_CONFIG.value.userOptions.print
});

const hasOptionsNoTitle = computed(() => {
    return FINAL_CONFIG.value.userOptions.show && !FINAL_CONFIG.value.style.chart.title.text;
});

const mutableConfig = ref({
    showTable: FINAL_CONFIG.value.table.show,
});

// v3 - Essential to make shifting between loading config and final config work
watch(FINAL_CONFIG, () => {
    mutableConfig.value = {
        showTable: FINAL_CONFIG.value.table.show,
    }
}, { immediate: true });

const immutableDataset = computed(() => {
    return FINAL_DATASET.value.map((ds, i) => {
        return {
            ...ds,
            start: checkNaN(ds.start),
            end: checkNaN(ds.end),
            id: ds.id ?? `${String(ds.name)}__${String(ds.start)}__${String(ds.end)}__${createUid()}`
        }
    })
});

const extremes = computed(() => {
    const grid = FINAL_CONFIG.value.style.chart.grid;

    const values = immutableDataset.value
        .flatMap(ds => [ds.start, ds.end])
        .map(n => Number(n))
        .filter(n => Number.isFinite(n));

    const dataMin = values.length ? Math.min(...values) : 0;
    const dataMax = values.length ? Math.max(...values) : 0;

    const scaleMin = grid.scaleMin ?? Math.min(dataMin, 0);
    const scaleMax = grid.scaleMax ?? dataMax;

    return { min: scaleMin, max: scaleMax };
});

const scale = computed(() => {
    return calculateNiceScale(extremes.value.min, extremes.value.max, FINAL_CONFIG.value.style.chart.grid.scaleSteps)
});

const baseRowHeight = ref(FINAL_CONFIG.value.style.chart.rowHeight);
const WIDTH = ref(FINAL_CONFIG.value.style.chart.width);

function getOffsetX() {
    let base = 0;
    if (serieLabels.value) {
        const texts = Array.from(serieLabels.value.querySelectorAll('text'));
        base = texts.reduce((max, t) => {
            const w = t.getComputedTextLength();
            return w > max ? w : max;
        }, 0);
    }
    const yAxisLabelW = yAxisLabel.value ? yAxisLabel.value.getBoundingClientRect().width : 0;
    return base + yAxisLabelW + (yAxisLabelW ? 24 + FINAL_CONFIG.value.style.chart.labels.axis.yLabelOffsetX : 0);
}

const labelsXHeight = ref(0);
const updateHeight = throttle((h) => {
    labelsXHeight.value = h;
}, 100);

watchEffect((onInvalidate) => {
    const el = scaleLabels.value;
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
    const __triggerX__ = areSeriesNamesColliding.value;
    let h = 0;
    if (xAxisLabel.value) {
        h = xAxisLabel.value.getBBox().height;
    }
    let slH = 0;
    if (scaleLabels.value) {
        slH = labelsXHeight.value;
    }
    return h + slH;
});

const rows = computed(() => immutableDataset.value.length);

function projectX(value, sc, da) {
    const v = Number(value);
    const min = Number(sc.min);
    const max = Number(sc.max);
    const width = Number(da.width);

    if (!Number.isFinite(v) || !Number.isFinite(min) || !Number.isFinite(max) || !Number.isFinite(width)) {
        return da.left;
    }
    const span = max - min;
    if (span <= 0) return da.left;

    return da.left + ((v - min) / span) * width;
}

const drawingArea = computed(() => {
    const __triggerX__ = areSeriesNamesColliding.value;

    const offsetX = getOffsetX();
    const padding = FINAL_CONFIG.value.style.chart.padding;
    const xLabelPad = FINAL_CONFIG.value.style.chart.labels.axis.xLabel ? FINAL_CONFIG.value.style.chart.labels.axis.xLabelOffsetY : 0; 
    const height = baseRowHeight.value * rows.value - offsetY.value - padding.top - padding.bottom - xLabelPad;
    const effectiveRowHeight = height / rows.value;
    const absoluteHeight = baseRowHeight.value * rows.value;
    const width = WIDTH.value - offsetX - padding.left - padding.right;
    const widthPlotReference = (scale.value.ticks.length) * (width / scale.value.ticks.length);
    return {
        left: FINAL_CONFIG.value.style.chart.padding.left + offsetX,
        right: WIDTH.value - FINAL_CONFIG.value.style.chart.padding.right,
        top: FINAL_CONFIG.value.style.chart.padding.top,
        bottom: absoluteHeight - FINAL_CONFIG.value.style.chart.padding.bottom - offsetY.value - xLabelPad,
        width,
        height,
        rowHeight: effectiveRowHeight,
        absoluteHeight,
        widthPlotReference
    }
});

const plotRadius = computed(() => {
    return Math.min(baseRowHeight.value / 2 * 0.7, FINAL_CONFIG.value.style.chart.plots.radius);
});

const MUTABLE = ref([])

const mutableDataset = computed({
    get() {
        const da = drawingArea.value;
        const sc = scale.value;
        return MUTABLE.value.map((ds, i) => {
        const startX = projectX(ds.start,  sc, da);
        const endX   = projectX(ds.endVal, sc, da); // animated
        const centerX = startX + (endX - startX) / 2;
        return {
            ...ds,
            startX,
            endX,
            centerX,
            y: da.top + i * da.rowHeight + da.rowHeight / 2,
        };
        });
    },
    set(v) { MUTABLE.value = v; }
});

function initMutableFromImmutable() {
    MUTABLE.value = immutableDataset.value.map(ds => {
        const start = Number(ds.start);
        return {
        ...ds,
        endVal: Number.isFinite(start) ? start : 0,
        };
    });
}

const raf = ref(null);

onMounted(() => {
    prepareDataset();
});

function prepareDataset() {
    if (raf.value != null) {
        cancelAnimationFrame(raf.value);
        raf.value = null;
    }

    initMutableFromImmutable();

    if (!FINAL_CONFIG.value.useAnimation) {
        mutableDataset.value = MUTABLE.value.map(ds => {
        const endNum = Number(ds.end);
        return { ...ds, endVal: Number.isFinite(endNum) ? endNum : ds.endVal };
        });
        return;
    }

    const speed = Math.max(1, Math.min(100, FINAL_CONFIG.value.animationSpeed || 100)) / 100;

    const diffs = immutableDataset.value.map(ds => {
        const s = Number(ds.start);
        const e = Number(ds.end);
        const sNum = Number.isFinite(s) ? s : 0;
        const eNum = Number.isFinite(e) ? e : sNum; // if end missing, target = start
        return eNum - sNum;
    });

    const step = () => {
        let done = true;
        mutableDataset.value = MUTABLE.value.map((ds, i) => {
            const target = Number.isFinite(Number(ds.end)) ? Number(ds.end) : ds.endVal;
            const next = ds.endVal + diffs[i] * speed;
            const endVal = diffs[i] >= 0 ? Math.min(next, target) : Math.max(next, target);
            if (endVal !== target) done = false;
            return { ...ds, endVal };
        });
        if (!done) raf.value = requestAnimationFrame(step);
        else raf.value = null;
    };

    raf.value = requestAnimationFrame(step);
}

const legendSet = computed(() => {
    return [
        { name: FINAL_CONFIG.value.style.chart.legend.labelStart, color: FINAL_CONFIG.value.style.chart.plots.gradient.show ? `url(#start_grad_${uid.value})` : FINAL_CONFIG.value.style.chart.plots.startColor},
        { name: FINAL_CONFIG.value.style.chart.legend.labelEnd, color: FINAL_CONFIG.value.style.chart.plots.gradient.show ? `url(#end_grad_${uid.value})` : FINAL_CONFIG.value.style.chart.plots.endColor},
    ]
})

const legendConfig = computed(() => {
    return {
        cy: 'donut-div-legend',
        backgroundColor: FINAL_CONFIG.value.style.chart.legend.backgroundColor,
        color: FINAL_CONFIG.value.style.chart.legend.color,
        fontSize: FINAL_CONFIG.value.style.chart.legend.fontSize,
        paddingBottom: 12,
        paddingTop: 12,
        fontWeight: FINAL_CONFIG.value.style.chart.legend.bold ? 'bold' : ''
    }
});

const table = computed(() => {
    const head = mutableDataset.value.map(ds => {
        return {
            name: ds.name,
        }
    });
    const body = mutableDataset.value.map(ds => {
        return {
            start: ds.start,
            end: ds.end
        }
    });
    return { head, body }
});

const dataTable = computed(() => {
    const head = [
        FINAL_CONFIG.value.table.columnNames.series,
        FINAL_CONFIG.value.table.columnNames.start,
        FINAL_CONFIG.value.table.columnNames.end,
        FINAL_CONFIG.value.table.columnNames.progression
    ];
    const body = table.value.head.map((h,i) => {
        const labelStart = dataLabel({
            p: FINAL_CONFIG.value.style.chart.labels.prefix,
            v: table.value.body[i].start,
            s: FINAL_CONFIG.value.style.chart.labels.suffix,
            r: FINAL_CONFIG.value.table.td.roundingValue
        });
        const labelEnd = dataLabel({
            p: FINAL_CONFIG.value.style.chart.labels.prefix,
            v: table.value.body[i].end,
            s: FINAL_CONFIG.value.style.chart.labels.suffix,
            r: FINAL_CONFIG.value.table.td.roundingValue
        });
        const labelProgression = dataLabel({
            v: 100 * ((table.value.body[i].end / table.value.body[i].start) - 1),
            s: '%',
            r: FINAL_CONFIG.value.table.td.roundingPercentage
        })
        return [
            { name: h.name },
            labelStart,
            labelEnd,
            labelProgression
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
        FINAL_CONFIG.value.table.columnNames.start,
        FINAL_CONFIG.value.table.columnNames.end,
        FINAL_CONFIG.value.table.columnNames.progression
    ];

    return {
        colNames,
        head,
        body,
        config
    }
});

function generateCsv(callback=null) {
    nextTick(() => {
        const labels = table.value.head.map((h,i) => {
            return [[
                h.name
            ],[table.value.body[i].start],[table.value.body[i].end]]
        });
        const tableXls = [[FINAL_CONFIG.value.style.chart.title.text],[FINAL_CONFIG.value.style.chart.title.subtitle.text],[[FINAL_CONFIG.value.table.columnNames.series],[FINAL_CONFIG.value.table.columnNames.start],[FINAL_CONFIG.value.table.columnNames.end]]].concat(labels);

        const csvContent = createCsvContent(tableXls);

        if (!callback) {
            downloadCsv({ csvContent, title: FINAL_CONFIG.value.style.chart.title.text || "vue-ui-dumbbell" })
        } else {
            callback(csvContent);
        }
    });
}

const isFullscreen = ref(false)
function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
}

function getData() {
    return immutableDataset.value
}

function toggleTable() {
    mutableConfig.value.showTable = !mutableConfig.value.showTable;
}

const isAnnotator = ref(false);
function toggleAnnotator() {
    isAnnotator.value = !isAnnotator.value;
}

async function getImage({ scale = 2} = {}) {
    if (!dumbbellChart.value) return;
    const { width, height } = dumbbellChart.value.getBoundingClientRect();
    const aspectRatio = width / height;
    const { imageUri, base64 } = await img({ domElement: dumbbellChart.value, base64: true, img: true, scale })
    return { 
        imageUri, 
        base64, 
        title: FINAL_CONFIG.value.style.chart.title.text,
        width,
        height,
        aspectRatio
    }
}

const ticks = computed(() => scale.value.ticks);
const dummySlicer = computed(() => ({ start: 0, end: ticks.value.length }));

useTimeLabelCollision({
    timeLabelsEls: scaleLabels,
    timeLabels: ticks,
    slicer: dummySlicer,
    configRef: FINAL_CONFIG,
    rotationPath: ['style', 'chart', 'labels', 'xAxisLabels', 'rotation'],
    autoRotatePath: ['style', 'chart', 'labels', 'xAxisLabels', 'autoRotate'],
    isAutoSize: false,
    width: WIDTH,
    height: baseRowHeight,
    targetClass: '.vue-ui-dumbbell-scale-label'
})

function computeYAxisNameCollision({
    rowHeight,
    fontSize,
    showProgression
}) {
    if (!showProgression) return false;

    const nameY = rowHeight / 3;
    const valueY = rowHeight / 1.3;

    const distance = Math.abs(valueY - nameY);
    const lineBox = fontSize * 1.2;
    return distance < lineBox;
}

const setCollisionStable = (() => {
    let pending = null;
    let consecutive = 0;
    const THRESHOLD = 1;

    return (next) => {
        if (next === areSeriesNamesColliding.value) {
            pending = null;
            consecutive = 0;
            return;
        }
        if (pending === null || pending !== next) {
            pending = next;
            consecutive = 1;
        } else {
            consecutive += 1;
            if (consecutive >= THRESHOLD) {
                areSeriesNamesColliding.value = next;
                pending = null;
                consecutive = 0;
            }
        }
    };
})();

const updateNameValueCollision = throttle(() => {
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
        const collide = computeYAxisNameCollision({
            rowHeight: drawingArea.value.rowHeight,
            fontSize: FINAL_CONFIG.value.style.chart.labels.yAxisLabels.fontSize,
            showProgression: FINAL_CONFIG.value.style.chart.labels.yAxisLabels.showProgression
        });
        setCollisionStable(collide);
        });
    });
}, 100);

function onTrapEnter({ datapoint, seriesIndex }) {
    selectedTrapIndex.value = seriesIndex;
    selectedDatapoint.value = datapoint;
    if (FINAL_CONFIG.value.events.datapointEnter) {
        FINAL_CONFIG.value.events.datapointEnter({ datapoint, seriesIndex });
    }
}

function onTrapLeave({ datapoint, seriesIndex }) {
    selectedTrapIndex.value = null;
    selectedDatapoint.value = null;
    if (FINAL_CONFIG.value.events.datapointLeave) {
        FINAL_CONFIG.value.events.datapointLeave({ datapoint, seriesIndex });
    }
}

function onTrapClick({ datapoint, seriesIndex }) {
    if (FINAL_CONFIG.value.events.datapointClick) {
        FINAL_CONFIG.value.events.datapointClick({ datapoint, seriesIndex });
    }
}

const comparisonLabelX = computed(() => {
    if (selectedDatapoint.value === null) return 0;
    const hasStartX = ![null, undefined].includes(selectedDatapoint.value.start);
    const hasEndX = ![null, undefined].includes(selectedDatapoint.value.end);
    return hasStartX && hasEndX
        ? Math.min(selectedDatapoint.value.startX, selectedDatapoint.value.endX) + Math.abs(selectedDatapoint.value.startX - selectedDatapoint.value.endX) / 2
        : hasStartX && !hasEndX ? selectedDatapoint.value.startX
        : hasEndX && !hasStartX ? selectedDatapoint.value.endX
        : null;
});

const comparisonLabel = computed(() => {
    if (selectedDatapoint.value === null) return '';
    const hasStartX = ![null, undefined].includes(selectedDatapoint.value.start);
    const hasEndX = ![null, undefined].includes(selectedDatapoint.value.end);

    let labelStart = '';
    let labelEnd = '';

    if (hasStartX) {
        labelStart = applyDataLabel(
            FINAL_CONFIG.value.style.chart.labels.formatter,
            selectedDatapoint.value.start,
            dataLabel({
                p: FINAL_CONFIG.value.style.chart.labels.prefix,
                v: selectedDatapoint.value.start,
                s: FINAL_CONFIG.value.style.chart.labels.suffix,
                r: FINAL_CONFIG.value.style.chart.labels.startLabels.rounding
            }),
            { datapoint: selectedDatapoint.value, seriesIndex: selectedTrapIndex.value }
        )
    }

    if (hasEndX) {
        labelEnd = applyDataLabel(
            FINAL_CONFIG.value.style.chart.labels.formatter,
            selectedDatapoint.value.end,
            dataLabel({
                p: FINAL_CONFIG.value.style.chart.labels.prefix,
                v: selectedDatapoint.value.end,
                s: FINAL_CONFIG.value.style.chart.labels.suffix,
                r: FINAL_CONFIG.value.style.chart.labels.startLabels.rounding
            }),
            { datapoint: selectedDatapoint.value, seriesIndex: selectedTrapIndex.value }
        )
    }

    return hasStartX && hasEndX
        ? `${labelStart} → ${labelEnd}`
        : hasStartX && !hasEndX ? labelStart
        : hasEndX && !hasStartX ? labelEnd
        : ''
})

defineExpose({
    getData,
    getImage,
    generatePdf,
    generateCsv,
    generateImage,
    toggleTable,
    toggleAnnotator,
    toggleFullscreen
});

</script>

<template>
    <div ref="dumbbellChart" :class="`vue-ui-dumbbell ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''}`" :style="`font-family:${FINAL_CONFIG.style.fontFamily};width:100%; text-align:center;background:${FINAL_CONFIG.style.chart.backgroundColor};${FINAL_CONFIG.responsive ? 'height:100%': ''}`" :id="`dumbbell_${uid}`" @mouseenter="() => setUserOptionsVisibility(true)" @mouseleave="() => setUserOptionsVisibility(false)">

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
            ref="details"
            :key="`user_option_${step}`"
            v-if="FINAL_CONFIG.userOptions.show && isDataset && (keepUserOptionState ? true : userOptionsVisible)"
            :backgroundColor="FINAL_CONFIG.style.chart.backgroundColor"
            :color="FINAL_CONFIG.style.chart.color"
            :isPrinting="isPrinting"
            :isImaging="isImaging"
            :uid="uid"
            :hasPdf="FINAL_CONFIG.userOptions.buttons.pdf"
            :hasXls="FINAL_CONFIG.userOptions.buttons.csv"
            :hasImg="FINAL_CONFIG.userOptions.buttons.img"
            :hasTable="FINAL_CONFIG.userOptions.buttons.table"
            :hasFullscreen="FINAL_CONFIG.userOptions.buttons.fullscreen"
            :isFullscreen="isFullscreen"
            :titles="{ ...FINAL_CONFIG.userOptions.buttonTitles }"
            :chartElement="dumbbellChart"
            :position="FINAL_CONFIG.userOptions.position"
            :hasAnnotator="FINAL_CONFIG.userOptions.buttons.annotator"
            :isAnnotation="isAnnotator"
            :callbacks="FINAL_CONFIG.userOptions.callbacks"
            :printScale="FINAL_CONFIG.userOptions.print.scale"
            @toggleFullscreen="toggleFullscreen"
            @generatePdf="generatePdf"
            @generateCsv="generateCsv"
            @generateImage="generateImage"
            @toggleTable="toggleTable"
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
            <template #optionTable v-if="$slots.optionTable">
                <slot name="optionTable" />
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
            :viewBox="`0 0 ${WIDTH} ${drawingArea.absoluteHeight <= 0 ? 10 : drawingArea.absoluteHeight}`" :style="`max-width:100%; overflow: visible; background:transparent;color:${FINAL_CONFIG.style.chart.color}`"
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
            
            <!-- VERTICAL GRID -->
            <g v-if="FINAL_CONFIG.style.chart.grid.verticalGrid.show">
                <line
                    data-cy="grid-line-y"
                    v-for="(_, i) in scale.ticks"
                    :x1="drawingArea.left + ((i) * drawingArea.width / (scale.ticks.length - 1))"
                    :x2="drawingArea.left + ((i) * drawingArea.width / (scale.ticks.length - 1))"
                    :y1="drawingArea.top"
                    :y2="drawingArea.bottom"
                    :stroke="FINAL_CONFIG.style.chart.grid.verticalGrid.stroke"
                    :stroke-width="FINAL_CONFIG.style.chart.grid.verticalGrid.strokeWidth"
                    :stroke-dasharray="FINAL_CONFIG.style.chart.grid.verticalGrid.strokeDasharray"
                />
            </g>
            <!-- HORIZONTAL GRID -->
            <g v-if="FINAL_CONFIG.style.chart.grid.horizontalGrid.show">
                <line
                    data-cy="grid-line-x"
                    v-for="(_, i) in immutableDataset"
                    :x1="drawingArea.left"
                    :x2="drawingArea.right"
                    :y1="drawingArea.top + (i * drawingArea.rowHeight)"
                    :y2="drawingArea.top + (i * drawingArea.rowHeight)"
                    :stroke="FINAL_CONFIG.style.chart.grid.horizontalGrid.stroke"
                    :stroke-width="FINAL_CONFIG.style.chart.grid.horizontalGrid.strokeWidth"
                    :stroke-dasharray="FINAL_CONFIG.style.chart.grid.horizontalGrid.strokeDasharray"
                />
                <line
                    data-cy="grid-base-x"
                    :x1="drawingArea.left"
                    :x2="drawingArea.right"
                    :y1="drawingArea.bottom"
                    :y2="drawingArea.bottom"
                    :stroke="FINAL_CONFIG.style.chart.grid.horizontalGrid.stroke"
                    :stroke-width="FINAL_CONFIG.style.chart.grid.horizontalGrid.strokeWidth"
                    :stroke-dasharray="FINAL_CONFIG.style.chart.grid.horizontalGrid.strokeDasharray"
                />
            </g>

            <!-- Y AXIS LABEL -->
            <text 
                v-if="FINAL_CONFIG.style.chart.labels.axis.yLabel"
                ref="yAxisLabel"
                :transform="`translate(${FINAL_CONFIG.style.chart.labels.axis.fontSize}, ${drawingArea.absoluteHeight / 2}), rotate(-90)`"
                :font-size="FINAL_CONFIG.style.chart.labels.axis.fontSize"
                :fill="FINAL_CONFIG.style.chart.labels.axis.color"
                text-anchor="middle"
            >
                {{ FINAL_CONFIG.style.chart.labels.axis.yLabel }}
            </text>

            <!-- SERIE LABELS (Y) -->
            <g v-if="FINAL_CONFIG.style.chart.labels.yAxisLabels.show" ref="serieLabels">
                <text
                    data-cy="label-y-name"
                    class="vue-ui-dumbbell-serie-name"
                    v-for="(datapoint, i) in mutableDataset"
                    :key="`serieLabel_${datapoint.id}_${i}`"
                    :x="drawingArea.left - 6 + FINAL_CONFIG.style.chart.labels.yAxisLabels.offsetX"
                    :y="drawingArea.top + (i * drawingArea.rowHeight) + (!FINAL_CONFIG.style.chart.labels.yAxisLabels.showProgression || areSeriesNamesColliding ? drawingArea.rowHeight / 2 : drawingArea.rowHeight / 3) + (FINAL_CONFIG.style.chart.labels.yAxisLabels.fontSize / 3)"
                    :font-size="FINAL_CONFIG.style.chart.labels.yAxisLabels.fontSize"
                    :fill="FINAL_CONFIG.style.chart.labels.yAxisLabels.color"
                    :font-weight="FINAL_CONFIG.style.chart.labels.yAxisLabels.bold ? 'bold': 'normal'"
                    text-anchor="end"
                    @mouseenter="onTrapEnter({ datapoint, seriesIndex: i })"
                    @mouseleave="onTrapLeave({ datapoint, seriesIndex: i })"
                    @click="onTrapClick({ datapoint, seriesIndex: i })"
                >
                    {{ datapoint.name }} {{ areSeriesNamesColliding && FINAL_CONFIG.style.chart.labels.yAxisLabels.showProgression ? [null, undefined].includes(datapoint.start) || [null, undefined].includes(datapoint.end) ? '' : `(${applyDataLabel(
                                FINAL_CONFIG.style.chart.labels.yAxisLabels.formatter,
                                100 * ((datapoint.end / datapoint.start) - 1),
                                dataLabel({
                                    v: 100 * ((datapoint.end / datapoint.start) - 1),
                                    s: '%',
                                    r: FINAL_CONFIG.style.chart.labels.yAxisLabels.rounding
                                }),
                                { datapoint }
                            )})` : '' }}
                </text>
                <template v-if="FINAL_CONFIG.style.chart.labels.yAxisLabels.showProgression && !areSeriesNamesColliding">
                    <text
                        data-cy="label-y-value"
                        class="vue-ui-dumbbell-serie-value"
                        v-for="(datapoint, i) in mutableDataset"
                        :x="drawingArea.left - 6 + FINAL_CONFIG.style.chart.labels.yAxisLabels.offsetX"
                        :y="drawingArea.top + (i * drawingArea.rowHeight) + (drawingArea.rowHeight / 1.3) + (FINAL_CONFIG.style.chart.labels.yAxisLabels.fontSize / 3)"
                        :font-size="FINAL_CONFIG.style.chart.labels.yAxisLabels.fontSize"
                        :fill="FINAL_CONFIG.style.chart.labels.yAxisLabels.color"
                        text-anchor="end"
                        @mouseenter="onTrapEnter({ datapoint, seriesIndex: i })"
                        @mouseleave="onTrapLeave({ datapoint, seriesIndex: i })"
                        @click="onTrapClick({ datapoint, seriesIndex: i })"
                    >
                        {{  [null, undefined].includes(datapoint.start) || [null, undefined].includes(datapoint.end) ? '' :
                            applyDataLabel(
                                FINAL_CONFIG.style.chart.labels.yAxisLabels.formatter,
                                100 * ((datapoint.end / datapoint.start) - 1),
                                dataLabel({
                                    v: 100 * ((datapoint.end / datapoint.start) - 1),
                                    s: '%',
                                    r: FINAL_CONFIG.style.chart.labels.yAxisLabels.rounding
                                }),
                                { datapoint }
                            )
                        }}
                    </text>
                </template>
            </g>

            <!-- X AXIS LABEL -->
            <text 
                v-if="FINAL_CONFIG.style.chart.labels.axis.xLabel"
                ref="xAxisLabel"
                :x="drawingArea.left + (drawingArea.width / 2)"
                :y="drawingArea.absoluteHeight - FINAL_CONFIG.style.chart.labels.axis.fontSize / 3"
                :font-size="FINAL_CONFIG.style.chart.labels.axis.fontSize"
                :fill="FINAL_CONFIG.style.chart.labels.axis.color"
                text-anchor="middle"
            >
                {{ FINAL_CONFIG.style.chart.labels.axis.xLabel }}
            </text>

            <!-- SCALE LABELS (X) -->
            <g v-if="FINAL_CONFIG.style.chart.labels.xAxisLabels.show" ref="scaleLabels">
                <text
                    data-cy="label-x"
                    class="vue-ui-dumbbell-scale-label"
                    v-for="(tick, i) in scale.ticks"
                    :key="`tick_${i}`"
                    :transform="`translate(${drawingArea.left + (i * (drawingArea.width / (scale.ticks.length - 1)))}, ${drawingArea.bottom + FINAL_CONFIG.style.chart.labels.xAxisLabels.fontSize + FINAL_CONFIG.style.chart.labels.xAxisLabels.offsetY}), rotate(${FINAL_CONFIG.style.chart.labels.xAxisLabels.rotation})`"
                    :font-size="FINAL_CONFIG.style.chart.labels.xAxisLabels.fontSize"
                    :fill="FINAL_CONFIG.style.chart.labels.xAxisLabels.color"
                    :font-weight="FINAL_CONFIG.style.chart.labels.xAxisLabels.bold ? 'bold': 'normal'"
                    :text-anchor="FINAL_CONFIG.style.chart.labels.xAxisLabels.rotation > 0 ? 'start' : FINAL_CONFIG.style.chart.labels.xAxisLabels.rotation < 0 ? 'end' : 'middle'"
                >
                    {{ applyDataLabel(
                        FINAL_CONFIG.style.chart.labels.formatter,
                        tick,
                        dataLabel({
                            p: FINAL_CONFIG.style.chart.labels.prefix,
                            v: tick,
                            s: FINAL_CONFIG.style.chart.labels.suffix,
                            r: FINAL_CONFIG.style.chart.labels.xAxisLabels.rounding
                        }),
                        { datapoint: tick, seriesIndex: i }
                        ) 
                    }}
                </text>
            </g>

            <!-- COMPARISON LINES -->
            <g v-show="FINAL_CONFIG.style.chart.comparisonLines.show && selectedTrapIndex !== null">
                <!-- START -->
                <path
                    v-show="selectedDatapoint !== null && ![null, undefined].includes(selectedDatapoint.start)"
                    :d="`M ${selectedDatapoint ? selectedDatapoint.startX : drawingArea.left},${drawingArea.top} ${selectedDatapoint ? selectedDatapoint.startX : drawingArea.left},${drawingArea.bottom}`"
                    :stroke="selectedDatapoint ? FINAL_CONFIG.style.chart.plots.startColor : 'transparent'"
                    :stroke-width="FINAL_CONFIG.style.chart.comparisonLines.strokeWidth"
                    :stroke-dasharray="FINAL_CONFIG.style.chart.comparisonLines.strokeDasharray"
                    :style="{ transition: 'all 0.3s ease-in-out'}"
                />

                <!-- END -->
                <path
                    v-show="selectedDatapoint !== null && ![null, undefined].includes(selectedDatapoint.end)"
                    :d="`M ${selectedDatapoint ? selectedDatapoint.endX : drawingArea.left},${drawingArea.top} ${selectedDatapoint ? selectedDatapoint.endX : drawingArea.left},${drawingArea.bottom}`"
                    :stroke="selectedDatapoint ? FINAL_CONFIG.style.chart.plots.endColor : 'transparent'"
                    :stroke-width="FINAL_CONFIG.style.chart.comparisonLines.strokeWidth"
                    :stroke-dasharray="FINAL_CONFIG.style.chart.comparisonLines.strokeDasharray"
                    :style="{ transition: 'all 0.3s ease-in-out'}"
                />

                <rect 
                    v-show="FINAL_CONFIG.style.chart.comparisonLines.showRect && selectedDatapoint !== null && ![null, undefined].includes(selectedDatapoint.start) && ![null, undefined].includes(selectedDatapoint.end)"
                    :x="selectedDatapoint ? Math.min(selectedDatapoint.startX, selectedDatapoint.endX) : drawingArea.left"
                    :y="drawingArea.top"
                    :height="drawingArea.height"
                    :width="selectedDatapoint ? Math.abs(selectedDatapoint.endX - selectedDatapoint.startX) : 0"
                    :fill="selectedDatapoint ? setOpacity(FINAL_CONFIG.style.chart.comparisonLines.rectColor, FINAL_CONFIG.style.chart.comparisonLines.rectOpacity) : 'transparent'"
                    :style="{ transition: 'all 0.3s ease-in-out'}"
                />

                <text 
                    v-show="selectedDatapoint !== null && comparisonLabelX !== null && FINAL_CONFIG.style.chart.comparisonLines.showLabel"
                    :transform="`translate(${comparisonLabelX == null ? 0 : comparisonLabelX}, ${drawingArea.top - 6})`"
                    :fill="FINAL_CONFIG.style.chart.comparisonLines.labelColor"
                    :font-size="FINAL_CONFIG.style.chart.comparisonLines.labelFontSize"
                    text-anchor="middle"
                    :style="{ transition: 'all 0.3s ease-in-out'}"
                >
                    {{ comparisonLabel }}
                </text>
            </g>

            <!-- PLOTS -->
            <defs>
                <radialGradient :id="`start_grad_${uid}`" fy="30%">
                    <stop offset="10%" :stop-color="lightenHexColor(FINAL_CONFIG.style.chart.plots.startColor, FINAL_CONFIG.style.chart.plots.gradient.intensity / 100)"/>
                    <stop offset="90%" :stop-color="darkenHexColor(FINAL_CONFIG.style.chart.plots.startColor, 0.1)"/>
                    <stop offset="100%" :stop-color="FINAL_CONFIG.style.chart.plots.startColor"/>
                </radialGradient>
                <radialGradient :id="`end_grad_${uid}`" fy="30%">
                    <stop offset="10%" :stop-color="lightenHexColor(FINAL_CONFIG.style.chart.plots.endColor, FINAL_CONFIG.style.chart.plots.gradient.intensity / 100)"/>
                    <stop offset="90%" :stop-color="darkenHexColor(FINAL_CONFIG.style.chart.plots.endColor, 0.1)"/>
                    <stop offset="100%" :stop-color="FINAL_CONFIG.style.chart.plots.endColor"/>
                </radialGradient>
            </defs>
            <g v-for="(plot, i) in mutableDataset" :key="`plot_${i}_${plot.id}`">
                <!-- LINK -->
                <defs>
                    <linearGradient :id="`grad_positive_${uid}`" x1="0%" x2="100%" y1="0%" y2="0%">
                        <stop offset="0%" :stop-color="FINAL_CONFIG.style.chart.plots.startColor"/>
                        <stop offset="100%" :stop-color="FINAL_CONFIG.style.chart.plots.endColor"/>
                    </linearGradient>
                    <linearGradient :id="`grad_negative_${uid}`" x1="0%" x2="100%" y1="0%" y2="0%">
                        <stop offset="0%" :stop-color="FINAL_CONFIG.style.chart.plots.endColor"/>
                        <stop offset="100%" :stop-color="FINAL_CONFIG.style.chart.plots.startColor"/>
                    </linearGradient>
                </defs>
                <g v-if="![undefined, null].includes(plot.end) && ![undefined, null].includes(plot.start)">
                    <g v-if="FINAL_CONFIG.style.chart.plots.link.type === 'curved'">
                        <path
                            data-cy="link-curved"
                            :d="`M 
                                ${plot.startX},${plot.y + plotRadius / 2} 
                                C ${plot.centerX},${plot.y} ${plot.centerX},${plot.y} 
                                ${plot.endX},${plot.y + plotRadius / 2}
                                L ${plot.endX},${plot.y - plotRadius / 2}
                                C ${plot.centerX},${plot.y} ${plot.centerX},${plot.y}
                                ${plot.startX},${plot.y - plotRadius / 2}
                                Z
                            `"
                            :fill="plot.endX > plot.startX ? `url(#grad_positive_${uid})`: `url(#grad_negative_${uid})`"
                        />
                    </g>
                    <g v-else>
                        <rect
                            data-cy="link-straight"
                            :x="plot.endX > plot.startX ? plot.startX : plot.endX"
                            :y="plot.y - (FINAL_CONFIG.style.chart.plots.link.strokeWidth / 2)"
                            :height="FINAL_CONFIG.style.chart.plots.link.strokeWidth"
                            :width="Math.abs(plot.endX - plot.startX)"
                            :fill="plot.endX > plot.startX ? `url(#grad_positive_${uid})`: `url(#grad_negative_${uid})`"
                        />
                    </g>
                </g>

                <!-- START -->
                <circle
                    v-if="![null, undefined].includes(plot.start)"
                    data-cy="datapoint-start"
                    :cx="plot.startX"
                    :cy="plot.y"
                    :r="plotRadius"
                    :fill="FINAL_CONFIG.style.chart.plots.gradient.show ? `url(#start_grad_${uid})` : FINAL_CONFIG.style.chart.plots.startColor"
                    :stroke="FINAL_CONFIG.style.chart.plots.stroke"
                    :stroke-width="FINAL_CONFIG.style.chart.plots.strokeWidth"
                    
                />
                <!-- END -->
                <circle
                    v-if="![null, undefined].includes(plot.end)"
                    data-cy="datapoint-end"
                    :cx="plot.endX"
                    :cy="plot.y"
                    :r="plotRadius"
                    :fill="FINAL_CONFIG.style.chart.plots.gradient.show ? `url(#end_grad_${uid})` : FINAL_CONFIG.style.chart.plots.endColor"
                    :stroke="FINAL_CONFIG.style.chart.plots.stroke"
                    :stroke-width="FINAL_CONFIG.style.chart.plots.strokeWidth"
                    
                />
            </g>
            <!-- START LABELS -->
            <g v-if="FINAL_CONFIG.style.chart.labels.startLabels.show">
                <g v-for="(plot, i) in mutableDataset" :key="`start_label_${i}_${plot.id}`">
                    <text
                        v-if="![null, undefined].includes(plot.start)"
                        data-cy="datapoint-label-start"
                        :x="plot.startX"
                        :y="plot.y + plotRadius * 2 + (FINAL_CONFIG.style.chart.labels.startLabels.fontSize / 2)"
                        :fill="FINAL_CONFIG.style.chart.labels.startLabels.useStartColor ? FINAL_CONFIG.style.chart.plots.startColor : FINAL_CONFIG.style.chart.labels.startLabels.color"
                        :font-size="FINAL_CONFIG.style.chart.labels.startLabels.fontSize"
                        text-anchor="middle"
                        
                    >
                        {{ applyDataLabel(
                            FINAL_CONFIG.style.chart.labels.formatter,
                            plot.start,
                            dataLabel({
                                p: FINAL_CONFIG.style.chart.labels.prefix,
                                v: plot.start,
                                s: FINAL_CONFIG.style.chart.labels.suffix,
                                r: FINAL_CONFIG.style.chart.labels.startLabels.rounding
                            }),
                            { datapoint: plot, seriesIndex: i }
                            )
                        }}
                    </text>
                </g>
            </g>
            <!-- END LABELS -->
            <g v-if="FINAL_CONFIG.style.chart.labels.endLabels.show">
                <g v-for="(plot, i) in mutableDataset" :key="`end_label_${i}_${plot.id}`">
                    <text
                        v-if="![null, undefined].includes(plot.end)"
                        data-cy="datapoint-label-end"
                        :x="plot.endX"
                        :y="plot.y - (plotRadius * 2 - (FINAL_CONFIG.style.chart.labels.startLabels.fontSize / 3))"
                        :fill="FINAL_CONFIG.style.chart.labels.endLabels.useEndColor ? FINAL_CONFIG.style.chart.plots.endColor : FINAL_CONFIG.style.chart.labels.endLabels.color"
                        :font-size="FINAL_CONFIG.style.chart.labels.endLabels.fontSize"
                        text-anchor="middle"
                        
                    >
                        {{ applyDataLabel(
                            FINAL_CONFIG.style.chart.labels.formatter,
                            plot.end,
                            dataLabel({
                                p: FINAL_CONFIG.style.chart.labels.prefix,
                                v: plot.end,
                                s: FINAL_CONFIG.style.chart.labels.suffix,
                                r: FINAL_CONFIG.style.chart.labels.endLabels.rounding
                            }),
                            { datapoint: plot, seriesIndex: i }
                            )
                        }}
                    </text>
                </g>
            </g>

            <!-- MOUSE TRAPS -->
            <g>
                <rect
                    v-for="(trap, i) in mutableDataset"
                    :x="drawingArea.left"
                    :y="drawingArea.top + i * drawingArea.rowHeight"
                    :width="drawingArea.width"
                    :height="drawingArea.rowHeight"
                    :fill="selectedTrapIndex !== null ? selectedTrapIndex === i ? setOpacity(FINAL_CONFIG.style.chart.highlighter.color, FINAL_CONFIG.style.chart.highlighter.opacity) : 'transparent' : 'transparent'"
                    @mouseenter="onTrapEnter({ datapoint: trap, seriesIndex: i })"
                    @mouseleave="onTrapLeave({ datapoint: trap, seriesIndex: i })"
                    @click="onTrapClick({ datapoint: trap, seriesIndex: i })"
                />
            </g>

            <slot name="svg" :svg="drawingArea"/>
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
                :clickable="false"
            >
                <template #item="{ legend }">
                    <div :style="`display:flex;align-items:center;gap:4px;font-size:${FINAL_CONFIG.style.chart.legend.fontSize}px`">
                        <svg :xmlns="XMLNS" viewBox="0 0 20 20" :height="FINAL_CONFIG.style.chart.legend.fontSize" :width="FINAL_CONFIG.style.chart.legend.fontSize">
                            <circle :cx="10" :cy="10" :r="9" :fill="legend.color"/>
                        </svg>
                        <template v-if="!loading">
                            {{ legend.name }}
                        </template>
                    </div>
                </template>
            </Legend>
            <slot v-else name="legend" v-bind:legend="legendSet" />
        </div>

        <div v-if="$slots.source" ref="source" dir="auto">
            <slot name="source" />
        </div>

        <Accordion hideDetails v-if="isDataset" :config="{
            open: mutableConfig.showTable,
            maxHeight: 10000,
            body: {
                backgroundColor: FINAL_CONFIG.style.chart.backgroundColor,
                color: FINAL_CONFIG.style.chart.color,
            },
            head: {
                backgroundColor: FINAL_CONFIG.style.chart.backgroundColor,
                color: FINAL_CONFIG.style.chart.color,
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

.vue-ui-dumbbell * {
    transition: unset;
}

.vue-ui-dumbbell {
    user-select: none;
    position: relative;
}
</style>