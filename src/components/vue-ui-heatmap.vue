<script setup>
import { 
    computed, 
    defineAsyncComponent, 
    nextTick, 
    onBeforeUnmount, 
    onMounted, 
    reactive, 
    ref, 
    shallowRef, 
    toRefs,
    watch,
} from "vue";
import { 
    adaptColorToBackground, 
    applyDataLabel,
    checkNaN,
    createCsvContent, 
    createUid, 
    dataLabel,
    downloadCsv,
    error,
    functionReturnsString,
    getMissingDatasetAttributes,
    hasDeepProperty,
    interpolateColorHex,
    isFunction,
    objectIsEmpty,
    treeShake,
    triggerResize,
    XMLNS
} from "../lib";
import { throttle } from "../canvas-lib";
import { useConfig } from "../useConfig";
import { usePrinter } from "../usePrinter";
import { useLoading } from "../useLoading";
import { useSvgExport } from "../useSvgExport";
import { useNestedProp } from "../useNestedProp";
import { useResponsive } from "../useResponsive";
import { useTimeLabels } from "../useTimeLabels";
import { useTableResponsive } from "../useTableResponsive";
import { useUserOptionState } from "../useUserOptionState";
import { useTimeLabelCollision } from "../useTimeLabelCollider";
import { useChartAccessibility } from "../useChartAccessibility";
import { useResizeObserverEffect } from '../useResizeObserverEffect';
import img from "../img";
import Title from "../atoms/Title.vue"; // Must be ready in responsive mode
import themes from "../themes.json";
import vFitText from "../directives/vFitText";
import Accordion from "./vue-ui-accordion.vue"; // Must be ready in responsive mode
import BaseScanner from "../atoms/BaseScanner.vue";

const Tooltip = defineAsyncComponent(() => import('../atoms/Tooltip.vue'));
const BaseIcon = defineAsyncComponent(() => import('../atoms/BaseIcon.vue'));
const PenAndPaper = defineAsyncComponent(() => import('../atoms/PenAndPaper.vue'));
const UserOptions = defineAsyncComponent(() => import('../atoms/UserOptions.vue'));
const PackageVersion = defineAsyncComponent(() => import('../atoms/PackageVersion.vue'));
const BaseDraggableDialog = defineAsyncComponent(() => import('../atoms/BaseDraggableDialog.vue'));

const { vue_ui_heatmap: DEFAULT_CONFIG } = useConfig()

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
    set(bool) {
        return bool;
    }
});

const uid = ref(createUid());
const heatmapChart = ref(null);
const isTooltip = ref(false);
const tooltipContent = ref("");
const hoveredCell = ref(undefined);
const selectedClone = ref(null);
const step = ref(0);
const tableContainer = ref(null);
const titleStep = ref(0);
const datapoints = ref(null);
const tableUnit = ref(null);
const userOptionsRef = ref(null);

const chartTitle = ref(null);
const noTitle = ref(null);
const legendRight = ref(null);

const yAxisLabels = ref(null);
const yAxisSumRects = ref(null);

const xAxisLabels = ref(null);
const xAxisSums = ref(null);
const xAxisSumRects = ref(null);

const source = ref(null);
const observedEl = shallowRef(null);

const FINAL_CONFIG = ref(prepareConfig());

function makeSkeletonDataset() {
    const y = Array(7).fill('_');
    const a = [];
    const len = 14;
    const sLen = y.length;
    for (let i = 0; i < sLen; i += 1) {
        const values = [];
        for (let j = 0; j < len; j += 1) {
        values.push((i + j * 2))
        }
        a.push({
            name: `${y[i]}`,
            values
        })
    }
    return a;
}

// v3 - Skeleton loader management
const { loading, FINAL_DATASET, manualLoading } = useLoading({
    ...toRefs(props),
    FINAL_CONFIG,
    prepareConfig,
    callback: () => {
        Promise.resolve().then(async () => {
            await nextTick();
            if(heatmapChart.value) {
                triggerResize(heatmapChart.value, { delta: 0.1, delay: 250 });
            }
        })
    },
    skeletonDataset: makeSkeletonDataset(),
    skeletonConfig: treeShake({
        defaultConfig: FINAL_CONFIG.value,
        userConfig: {
            table: { show: false },
            userOptions: { show: false },
            style: {
                backgroundColor: '#99999930',
                layout: {
                    cells: {
                        colors: {
                            hot: '#999999',
                            cold: '#CACACA'
                        },
                        columnTotal: { value: { show: false } },
                        rowTotal: {  value: { show: false } },
                        value: { show: false }
                    },
                    dataLabels: {
                        xAxis: { show: false },
                        yAxis: { show: false }
                    }
                },
            }
        }
    })
});

const { userOptionsVisible, setUserOptionsVisibility, keepUserOptionState } = useUserOptionState({ config: FINAL_CONFIG.value });

const { svgRef } = useChartAccessibility({ config: FINAL_CONFIG.value.style.title });

function setVisibility(state) {
    setUserOptionsVisibility(state);
}

function prepareConfig() {
    const mergedConfig = useNestedProp({
        userConfig: props.config,
        defaultConfig: DEFAULT_CONFIG
    });

    let finalConfig = {};

    if (mergedConfig.theme) {
        finalConfig = {
            ...useNestedProp({
                userConfig: themes.vue_ui_heatmap[mergedConfig.theme] || props.config,
                defaultConfig: mergedConfig
            }),
        }
    } else {
        finalConfig = mergedConfig;
    }

    // ------------------------------ OVERRIDES -----------------------------------

    if (props.config && hasDeepProperty(props.config, 'style.layout.dataLabels.xAxis.showOnlyAtModulo')) {
        finalConfig.style.layout.dataLabels.xAxis.showOnlyAtModulo = props.config.style.layout.dataLabels.xAxis.showOnlyAtModulo;
    } else {
        finalConfig.style.layout.dataLabels.xAxis.showOnlyAtModulo = null;
    }

    // ----------------------------------------------------------------------------

    return finalConfig;
}

watch(() => props.config, (_newCfg) => {
    if (!loading.value) {
        FINAL_CONFIG.value = prepareConfig();
    }
    userOptionsVisible.value = !FINAL_CONFIG.value.userOptions.showOnChartHover;
    prepareChart();
    titleStep.value += 1;

    // Reset mutable config
    mutableConfig.value.showTable = FINAL_CONFIG.value.table.show;
    mutableConfig.value.showTooltip = FINAL_CONFIG.value.style.tooltip.show;

    WIDTH.value = FINAL_CONFIG.value.style.layout.width;
    HEIGHT.value = FINAL_CONFIG.value.style.layout.height;
}, { deep: true });

watch(() => props.dataset, (newVal) => {
    if (Array.isArray(newVal) && newVal.length > 0) {
        manualLoading.value = false;
    }
    prepareChart();
}, { deep: true })

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `heatmap__${uid.value}`,
    fileName: FINAL_CONFIG.value.style.title.text || 'vue-ui-heatmap',
    options: FINAL_CONFIG.value.userOptions.print
});

const hasOptionsNoTitle = computed(() => {
    return FINAL_CONFIG.value.userOptions.show && !FINAL_CONFIG.value.style.title.text;
});

const mutableConfig = ref({
    showTable: FINAL_CONFIG.value.table.show,
    showTooltip: FINAL_CONFIG.value.style.tooltip.show
});

// v3 - Essential to make shifting between loading config and final config work
watch(FINAL_CONFIG, () => {
    mutableConfig.value = {
        showTable: FINAL_CONFIG.value.table.show,
        showTooltip: FINAL_CONFIG.value.style.tooltip.show
    };
}, { immediate: true });

const breakpoint = computed(() => {
    return FINAL_CONFIG.value.table.responsiveBreakpoint
});

const resizeObserver = ref(null);

const debug = computed(() => !!FINAL_CONFIG.value.debug);

function prepareChart() {
    if(objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiHeatmap',
            type: 'dataset',
            debug: debug.value
        });
        isDataset.value = false;
        manualLoading.value = true; // v3
    }

    // v3
    if (!objectIsEmpty(props.dataset)) {
        manualLoading.value = FINAL_CONFIG.value.loading;
    }

    if (FINAL_CONFIG.value.responsive) {
        const handleResize = throttle(() => {
            const { width, height } = useResponsive({
                chart: heatmapChart.value,
                title: FINAL_CONFIG.value.style.title.text ? chartTitle.value : null,
                // add legend hirizontal in legend attr
                // add legend vertical in some other attr and modify composable to subtract width
                source: source.value,
                noTitle: noTitle.value,
            });

            requestAnimationFrame(() => {
                WIDTH.value = width;
                HEIGHT.value = height;
            });
        });

        if (resizeObserver.value) {
            if (observedEl.value) {
                resizeObserver.value.unobserve(observedEl.value);
            }
            resizeObserver.value.disconnect();
        }

        resizeObserver.value = new ResizeObserver(handleResize);
        observedEl.value = heatmapChart.value.parentNode;
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

onMounted(() => { 
    prepareChart();
});

const maxX = computed(() => {
    return Math.max(...FINAL_DATASET.value.flatMap(el => (el.values || []).length));
});

const WIDTH = ref(FINAL_CONFIG.value.style.layout.width);
const HEIGHT = ref(FINAL_CONFIG.value.style.layout.height);

const svg = computed(() => ({
    width: Math.max(10, WIDTH.value),
    height: Math.max(10, HEIGHT.value)
}));

const topLabelsHeight = ref(0);
const updateTopLabelsHeight = throttle((h) => { topLabelsHeight.value = h }, 100);
useResizeObserverEffect({ elementRef: xAxisLabels, callback: updateTopLabelsHeight, attr: 'height' });

const leftLabelsWidth = ref(0);
const updateLeftLabelsWidth = throttle((h) => { leftLabelsWidth.value = h }, 100);
useResizeObserverEffect({ elementRef: yAxisLabels, callback: updateLeftLabelsWidth, attr: 'width' });

const xAxisSumLabelsHeight = ref(0);
const updateXAxisSumLabelsHeight = throttle((h) => { xAxisSumLabelsHeight.value = h }, 100);
useResizeObserverEffect({ elementRef: xAxisSums, callback: updateXAxisSumLabelsHeight, attr: 'height' });

onBeforeUnmount(() => {
    topLabelsHeight.value = 0;
    leftLabelsWidth.value = 0;
    xAxisSumLabelsHeight.value = 0;
});

const cellGap = computed(() => {
    return Math.min(svg.value.height, svg.value.width) / 1000 * FINAL_CONFIG.value.style.layout.cells.spacing
})

const drawingArea = computed(() => {
    let legendRW = 0;

    if (FINAL_CONFIG.value.style.legend.show) {
        legendRW = FINAL_CONFIG.value.style.legend.width;
    }

    const padding = FINAL_CONFIG.value.style.layout.padding;

    const offsetTopLabelsY = FINAL_CONFIG.value.style.layout.dataLabels.xAxis.fontSize / 3;
    const offsetBottomLabelsY = FINAL_CONFIG.value.style.layout.dataLabels.xAxis.fontSize / 2;
    const _height = svg.value.height - padding.top - padding.bottom - topLabelsHeight.value - offsetTopLabelsY;
    const sumCellXHeight = svg.value.width / 60;

    const spacing = {
        x: cellGap.value * (maxX.value),
        y: cellGap.value * ((FINAL_DATASET.value || []).length + 1)
    }

    const _width = svg.value.width - padding.left - padding.right - spacing.x - (sumCellXHeight * 2) - 2 - legendRW - leftLabelsWidth.value;

    const finalHeight = _height - sumCellXHeight - spacing.y - xAxisSumLabelsHeight.value - offsetBottomLabelsY - FINAL_CONFIG.value.style.layout.cells.columnTotal.value.offsetY;

    const cellSize = {
        width: Math.max(3, _width / maxX.value),
        height: Math.max(3, finalHeight / (FINAL_DATASET.value.length ?? 1))
    }

    return {
        top: padding.top + topLabelsHeight.value + sumCellXHeight + offsetTopLabelsY,
        topLabelsHeight: topLabelsHeight.value,
        sumCellXHeight,
        height: finalHeight,
        left: padding.left + leftLabelsWidth.value + sumCellXHeight / 2,
        right: padding.right - legendRW,
        bottom: svg.value.height - padding.bottom - xAxisSumLabelsHeight.value,
        width: _width,
        cellSize
    }
});

const maxValue = computed(() => {
    return Math.max(...FINAL_DATASET.value.flatMap(el => el.values));
});

const minValue = computed(() => {
    return Math.min(...FINAL_DATASET.value.flatMap(el => el.values));
});

const average = computed(() => {
    const allValues = FINAL_DATASET.value.flatMap(el => el.values);
    const sum = allValues.reduce((a,b) => a + b, 0);
    return sum / allValues.length;
});

const yAxisTimeLabels = computed(() => {
    return useTimeLabels({
        values: FINAL_CONFIG.value.style.layout.dataLabels.yAxis.values.length ? FINAL_CONFIG.value.style.layout.dataLabels.yAxis.values : FINAL_DATASET.value.map(ds => ds.name),
        maxDatapoints: FINAL_DATASET.value.length,
        formatter: FINAL_CONFIG.value.style.layout.dataLabels.yAxis.datetimeFormatter,
        start: 0,
        end: FINAL_DATASET.value.length
    });
});

const xAxisTimeLabels = computed(() => {
    return useTimeLabels({
        values: FINAL_CONFIG.value.style.layout.dataLabels.xAxis.values,
        maxDatapoints: maxX.value,
        formatter: FINAL_CONFIG.value.style.layout.dataLabels.xAxis.datetimeFormatter,
        start: 0,
        end: maxX.value
    });
});

const dataLabels = computed(() => {
    const yLabels = yAxisTimeLabels.value.map(y => y.text);
    const xLabels = xAxisTimeLabels.value.map(x => x.text);
    const _yTotals = FINAL_DATASET.value.map(ds => ds.values.reduce((a, b) => a + b, 0))
    const maxYTotal = Math.max(..._yTotals);
    const minYTotal = Math.min(..._yTotals);

    const _xTotals = [];

    for (let i = 0; i < maxX.value; i += 1) {
        _xTotals.push(FINAL_DATASET.value.map(ds => ds.values[i] || 0).reduce((a, b) => a + b, 0))
    }

    const maxXTotal = Math.max(..._xTotals);
    const minXTotal = Math.min(..._xTotals);

    return {
        yTotals: _yTotals.map(rowTotal => {
            const proportion = isNaN(rowTotal / maxYTotal) ? 0 : rowTotal / maxYTotal;
            return {
                total: rowTotal,
                proportion,
                color: interpolateColorHex(FINAL_CONFIG.value.style.layout.cells.colors.cold, FINAL_CONFIG.value.style.layout.cells.colors.hot, minYTotal, maxYTotal, rowTotal)
            }
        }),
        xTotals: _xTotals.map(columnTotal => {
            const proportion = isNaN(columnTotal / maxXTotal) ? 0 : columnTotal / maxXTotal;
            return {
                total: columnTotal,
                proportion,
                color: interpolateColorHex(FINAL_CONFIG.value.style.layout.cells.colors.cold, FINAL_CONFIG.value.style.layout.cells.colors.hot, minXTotal, maxXTotal, columnTotal)
            }
        }),
        yLabels,
        xLabels: xLabels.slice(0, maxX.value)
    }
});

const mutableDataset = computed(() => {
    FINAL_DATASET.value.forEach((ds, i) => {
        getMissingDatasetAttributes({
            datasetObject: ds,
            requiredAttributes: ['values']
        }) .forEach(_ => {
            error({
                componentName: 'VueUiHeatmap',
                type: 'datasetSerieAttribute',
                property: 'values',
                index: i,
                debug: debug.value
            })
        })
    });

    return FINAL_DATASET.value.map((ds, d) => {
        return {
            ...ds,
            temperatures: (ds.values || []).map((v, i) => {
                if (v >= average.value) {
                    return {
                        side: "up",
                        color: interpolateColorHex(FINAL_CONFIG.value.style.layout.cells.colors.cold, FINAL_CONFIG.value.style.layout.cells.colors.hot, minValue.value, maxValue.value, v),
                        ratio: Math.abs((Math.abs(v - average.value) / Math.abs(maxValue.value - average.value))) > 1 ? 1 : Math.abs((Math.abs(v - average.value) / Math.abs(maxValue.value - average.value))),
                        value: v,
                        yAxisName: dataLabels.value.yLabels[d],
                        xAxisName: dataLabels.value.xLabels[i],
                        id: `vue-data-ui-heatmap-cell-${createUid()}`
                    }
                } else {
                    return {
                        side: "down",
                        ratio: Math.abs(1 - (Math.abs(v) / Math.abs(average.value))) > 1 ? 1 : Math.abs(1 - (Math.abs(v) / Math.abs(average.value))),
                        color: interpolateColorHex(FINAL_CONFIG.value.style.layout.cells.colors.cold, FINAL_CONFIG.value.style.layout.cells.colors.hot, minValue.value, maxValue.value, v),
                        value: v,
                        yAxisName: dataLabels.value.yLabels[d],
                        xAxisName: dataLabels.value.xLabels[i],
                        id: `vue-data-ui-heatmap-cell-${createUid()}`
                    }
                }
            })
        }
    })
});

const rows = computed(() => FINAL_DATASET.value.length);
const rotateFlags = reactive(Array((rows.value * maxX.value || 1)).fill(false))
const rotateAll   = computed(() => rotateFlags.some(f => f))

function reportRotation(idx, didRotate) {
    rotateFlags[idx] = didRotate
}

const hideFlags = reactive(Array((rows.value * maxX.value) || 1).fill(false))
const hideAll   = computed(() => hideFlags.some(h => h))

function reportHide(idx, didHide) {
    hideFlags[idx] = didHide
}

const hoveredValue = ref(null);
const dataTooltipSlot = ref(null);

function useTooltip(datapoint, seriesIndex, x, y) {
    if (FINAL_CONFIG.value.events.datapointEnter) {
        FINAL_CONFIG.value.events.datapointEnter({ datapoint, seriesIndex })
    }

    selectedClone.value = { x, y };

    const { value, yAxisName, xAxisName, id } = datapoint;
    hoveredCell.value = id;
    hoveredValue.value = value;

    dataTooltipSlot.value = {
        datapoint,
        seriesIndex,
        series: mutableDataset.value,
        config: FINAL_CONFIG.value
    }

    isTooltip.value = true;
    let html = "";

    const customFormat = FINAL_CONFIG.value.style.tooltip.customFormat;

    if (isFunction(customFormat) && functionReturnsString(() => customFormat({
            datapoint,
            seriesIndex,
            series: mutableDataset.value,
            config: FINAL_CONFIG.value
        }))) {
        tooltipContent.value = customFormat({
            datapoint,
            seriesIndex,
            series: mutableDataset.value,
            config: FINAL_CONFIG.value
        })
    } else {
        html += `<div data-cy="heatmap-tootlip-name">${yAxisName} ${xAxisName ? yAxisName ? ` - ${xAxisName}` : `${xAxisName}` : ''}</div>`;
        html += `<div data-cy="heatmap-tooltip-value" style="margin-top:6px;padding-top:6px;border-top:1px solid ${FINAL_CONFIG.value.style.tooltip.borderColor};font-weight:bold;display:flex;flex-direction:row;gap:12px;align-items:center;justify-content:center"><span style="color:${interpolateColorHex(FINAL_CONFIG.value.style.layout.cells.colors.cold, FINAL_CONFIG.value.style.layout.cells.colors.hot, minValue.value, maxValue.value, value)}">⬤</span><span>${isNaN(value) ? "-" : applyDataLabel(
            FINAL_CONFIG.value.style.layout.cells.value.formatter,
            value,
            dataLabel({
                p:FINAL_CONFIG.value.style.layout.dataLabels.prefix, 
                v: value, 
                s: FINAL_CONFIG.value.style.layout.dataLabels.suffix, 
                r:FINAL_CONFIG.value.style.tooltip.roundingValue 
            }),
            { datapoint, seriesIndex }
        )}</span></div>`
        tooltipContent.value = `<div style="font-size:${FINAL_CONFIG.value.style.tooltip.fontSize}px">${html}</div>`;
    }
}

function onTrapLeave({ datapoint, seriesIndex }) {
    if (FINAL_CONFIG.value.events.datapointLeave) {
        FINAL_CONFIG.value.events.datapointLeave({ datapoint, seriesIndex})
    }
    isTooltip.value = false;
    hoveredCell.value = undefined;
    hoveredValue.value = null;
    selectedClone.value = null;
}

function getRowTotal(index) {
    return applyDataLabel(
        FINAL_CONFIG.value.style.layout.cells.value.formatter,
        dataLabels.value.yTotals[index].total,
        dataLabel({
            p: FINAL_CONFIG.value.style.layout.dataLabels.prefix,
            v: dataLabels.value.yTotals[index].total,
            s: FINAL_CONFIG.value.style.layout.dataLabels.suffix,
            r: FINAL_CONFIG.value.style.layout.cells.value.roundingValue
        }),
        { datapoint: dataLabels.value.yTotals[index], rowIndex: index }
    )
}

function getcolumnTotal(index) {
    return applyDataLabel(
        FINAL_CONFIG.value.style.layout.cells.value.formatter,
        dataLabels.value.xTotals[index].total,
        dataLabel({
            p: FINAL_CONFIG.value.style.layout.dataLabels.prefix,
            v: dataLabels.value.xTotals[index].total,
            s: FINAL_CONFIG.value.style.layout.dataLabels.suffix,
            r: FINAL_CONFIG.value.style.layout.cells.value.roundingValue
        }),
        { datapoint: dataLabels.value.xTotals[index], colIndex: index }
    )
}

const table = computed(() => {
    const head = FINAL_DATASET.value.map(ds => {
        return {
            name: ds.name,
        }
    });
    const body = FINAL_DATASET.value.map(ds => ds.values);
    return { head, body };
});


function generateCsv(callback=null) {
    nextTick(() => {
        const labels = ["", ...FINAL_DATASET.value.map((ds,i) => {
            return ds.name
        })];

        const values = [];

        for (let i = 0; i < dataLabels.value.xLabels.length; i += 1) {
            const row = [dataLabels.value.xLabels[i]];
            for (let j = 0; j < FINAL_DATASET.value.length; j += 1) {
                row.push([FINAL_DATASET.value[j].values[i]])
            }
            values.push(row)
        }

        const tableXls = [[FINAL_CONFIG.value.style.title.text],[FINAL_CONFIG.value.style.title.subtitle.text],[[""],[""],[""]]].concat([labels]).concat(values);
        const csvContent = createCsvContent(tableXls);

        if (!callback) {
            downloadCsv({csvContent, title: FINAL_CONFIG.value.style.title.text || "vue-ui-heatmap"})
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

function toggleTable() {
    mutableConfig.value.showTable = !mutableConfig.value.showTable;
}

function toggleTooltip() {
    mutableConfig.value.showTooltip = !mutableConfig.value.showTooltip;
}

const isAnnotator = ref(false);
function toggleAnnotator() {
    isAnnotator.value = !isAnnotator.value;
}

function selectDatapoint(datapoint, seriesIndex) {
    if (FINAL_CONFIG.value.events.datapointClick) {
        FINAL_CONFIG.value.events.datapointClick({ datapoint, seriesIndex });
    }
    emit('selectDatapoint', datapoint);
}

function getData() {
    return mutableDataset.value
}

async function getImage({ scale = 2} = {}) {
    if (!heatmapChart.value) return;
    const { width, height } = heatmapChart.value.getBoundingClientRect();
    const aspectRatio = width / height;
    const { imageUri, base64 } = await img({ domElement: heatmapChart.value, base64: true, img: true, scale})
    return { 
        imageUri, 
        base64, 
        title: FINAL_CONFIG.value.style.title.text,
        width,
        height,
        aspectRatio
    }
}

const slicer = computed(() => {
    return {
        start: 0,
        end: maxX.value
    }
});

const timeLabels = computed(() => dataLabels.value.xLabels);

useTimeLabelCollision({
    timeLabelsEls: xAxisLabels,
    timeLabels,
    slicer,
    configRef: FINAL_CONFIG,
    rotationPath: ['style', 'layout', 'dataLabels', 'xAxis', 'rotation'],
    autoRotatePath: ['style', 'layout', 'dataLabels', 'xAxis', 'autoRotate', 'enable'],
    isAutoSize: false,
    targetClass: '.vue-ui-heatmap-col-name',
    rotation: FINAL_CONFIG.value.style.layout.dataLabels.xAxis.autoRotate.angle,
    width: WIDTH,
    height: HEIGHT
});

useTimeLabelCollision({
    timeLabelsEls: xAxisSums,
    timeLabels,
    slicer,
    configRef: FINAL_CONFIG,
    rotationPath: ['style', 'layout', 'cells', 'columnTotal', 'value', 'rotation'],
    autoRotatePath: ['style', 'layout', 'cells', 'columnTotal', 'value', 'autoRotate', 'enable'],
    isAutoSize: false,
    targetClass: '.vue-ui-heatmap-col-total',
    rotation: FINAL_CONFIG.value.style.layout.cells.columnTotal.value.autoRotate.angle,
    width: WIDTH,
    height: HEIGHT
});

const tableComponent = computed(() => {
    const useDialog = FINAL_CONFIG.value.table.useDialog && !FINAL_CONFIG.value.table.show;
    const open = mutableConfig.value.showTable;
    return {
        component: useDialog ? BaseDraggableDialog : Accordion,
        title: `${FINAL_CONFIG.value.style.title.text}${FINAL_CONFIG.value.style.title.subtitle.text ? `: ${FINAL_CONFIG.value.style.title.subtitle.text}` : ''}`,
        props: useDialog ? {
            backgroundColor: FINAL_CONFIG.value.table.th.backgroundColor,
            color: FINAL_CONFIG.value.table.th.color,
            headerColor: FINAL_CONFIG.value.table.th.color,
            headerBg: FINAL_CONFIG.value.table.th.backgroundColor,
            isFullscreen: isFullscreen.value,
            fullscreenParent: heatmapChart.value,
            forcedWidth: Math.min(800, window.innerWidth * 0.8)
        } : {
            hideDetails: true,
            config: {
                open,
                maxHeight: 10000,
                body: {
                    backgroundColor: FINAL_CONFIG.value.style.backgroundColor,
                    color: FINAL_CONFIG.value.style.color
                },
                head: {
                    backgroundColor: FINAL_CONFIG.value.style.backgroundColor,
                    color: FINAL_CONFIG.value.style.color
                }
            }
        }
    }
});

watch(() => mutableConfig.value.showTable, async (v) => {
    if (FINAL_CONFIG.value.table.show) return;
    if (v && FINAL_CONFIG.value.table.useDialog && tableUnit.value) {
        await nextTick();
        tableUnit.value.open()
    } else {
        if ('close' in tableUnit.value) {
            tableUnit.value.close()
        }
    }
});

const { isResponsive: isTableResponsive } = useTableResponsive(tableContainer, breakpoint);

function closeTable() {
    mutableConfig.value.showTable = false;
    if (userOptionsRef.value) {
        userOptionsRef.value.setTableIconState(false);
    }
}

const svgBg = computed(() => FINAL_CONFIG.value.style.backgroundColor);
const svgTitle = computed(() => FINAL_CONFIG.value.style.title);

const { exportSvg, getSvg } = useSvgExport({
    svg: svgRef,
    title: svgTitle,
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
    generatePdf,
    generateCsv,
    generateImage,
    generateSvg,
    toggleTable,
    toggleTooltip,
    toggleAnnotator,
    toggleFullscreen
});

</script>

<template>
    <div ref="heatmapChart" :class="`vue-data-ui-component vue-ui-heatmap ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''}`" :style="`font-family:${FINAL_CONFIG.style.fontFamily};width:100%;${FINAL_CONFIG.responsive ? 'height: 100%;' : ''} text-align:center;background:${FINAL_CONFIG.style.backgroundColor}`" :id="`heatmap__${uid}`" @mouseenter="() => setVisibility(true)" @mouseleave="() => setVisibility(false)">
        
        <PenAndPaper
            v-if="FINAL_CONFIG.userOptions.buttons.annotator"
            :svgRef="svgRef"
            :backgroundColor="FINAL_CONFIG.style.backgroundColor"
            :color="FINAL_CONFIG.style.color"
            :active="isAnnotator"
            @close="toggleAnnotator"
        />

        <div
            ref="noTitle"
            v-if="hasOptionsNoTitle" 
            class="vue-data-ui-no-title-space" 
            :style="`height:36px; width: 100%;background:transparent`"
        />

        <div ref="chartTitle" v-if="FINAL_CONFIG.style.title.text" :style="`width:100%;background:transparent`">
            <Title
                :key="`title_${titleStep}`"
                :config="{
                    title: {
                        cy: 'heatmap-div-title',
                        ...FINAL_CONFIG.style.title
                    },
                    subtitle: {
                        cy: 'heatmap-div-subtitle',
                        ...FINAL_CONFIG.style.title.subtitle
                    },
                }"
            />
        </div>
        
        <!-- OPTIONS -->
        <UserOptions
            ref="userOptionsRef"
            :key="`user_options_${step}`"
            v-if="FINAL_CONFIG.userOptions.show && isDataset && (keepUserOptionState ? true : userOptionsVisible)"
            :backgroundColor="FINAL_CONFIG.style.backgroundColor"
            :color="FINAL_CONFIG.style.color"
            :isImaging="isImaging"
            :isPrinting="isPrinting"
            :uid="uid"
            :hasTooltip="FINAL_CONFIG.userOptions.buttons.tooltip && FINAL_CONFIG.style.tooltip.show"
            :hasPdf="FINAL_CONFIG.userOptions.buttons.pdf"
            :hasImg="FINAL_CONFIG.userOptions.buttons.img"
            :hasSvg="FINAL_CONFIG.userOptions.buttons.svg"
            :hasXls="FINAL_CONFIG.userOptions.buttons.csv"
            :hasTable="FINAL_CONFIG.userOptions.buttons.table"
            :hasFullscreen="FINAL_CONFIG.userOptions.buttons.fullscreen"
            :isFullscreen="isFullscreen"
            :isTooltip="mutableConfig.showTooltip"
            :titles="{ ...FINAL_CONFIG.userOptions.buttonTitles }"
            :chartElement="heatmapChart"
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
            <template v-if="$slots.optionFullscreen" template #optionFullscreen="{ toggleFullscreen, isFullscreen }">
                <slot name="optionFullscreen" v-bind="{ toggleFullscreen, isFullscreen }"/>
            </template>
            <template v-if="$slots.optionAnnotator" #optionAnnotator="{ toggleAnnotator, isAnnotator }">
                <slot name="optionAnnotator" v-bind="{ toggleAnnotator, isAnnotator }" />
            </template>
        </UserOptions>

        <!-- CHART -->

        <div :class="{ 
            'vue-ui-heatmap-chart-wrapper': true, 
            'vue-ui-heatmap-chart-wrapper-legend-right': FINAL_CONFIG.style.legend.show,
        }">
            <svg
                ref="svgRef"
                :xmlns="XMLNS"
                :class="{ 'vue-data-ui-fullscreen--on': isFullscreen, 'vue-data-ui-fulscreen--off': !isFullscreen }"
                :viewBox="`0 0 ${svg.width} ${svg.height}`" 
                width="100%"
                :style="`overflow: visible; background:transparent;color:${FINAL_CONFIG.style.color}`"
                aria-live="polite"
                role="img"
                preserveAspectRatio="xMidYMid"
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
    
                <!-- X AXIS SUM RECTS -->
                <template v-if="FINAL_CONFIG.style.layout.cells.columnTotal.color.show">
                    <g ref="xAxisSumRects">
                        <rect 
                            v-for="(_, i) in dataLabels.xTotals"
                            :x="drawingArea.left + drawingArea.cellSize.width * i + (cellGap / 2) + drawingArea.sumCellXHeight"
                            :y="drawingArea.top - drawingArea.sumCellXHeight + (cellGap * (svg.height / svg.width))"
                            :height="drawingArea.sumCellXHeight"
                            :width="drawingArea.cellSize.width - cellGap"
                            :fill="FINAL_CONFIG.style.layout.cells.colors.underlayer"
                            :stroke="FINAL_CONFIG.style.backgroundColor"
                            :stroke-width="cellGap"
                        />
                        <rect 
                            v-for="(col, i) in dataLabels.xTotals"
                            :x="drawingArea.left + drawingArea.cellSize.width * i + (cellGap / 2) + drawingArea.sumCellXHeight"
                            :y="drawingArea.top - drawingArea.sumCellXHeight + (cellGap * (svg.height / svg.width))"
                            :height="drawingArea.sumCellXHeight"
                            :width="drawingArea.cellSize.width - cellGap"
                            :fill="col.color"
                            :stroke="FINAL_CONFIG.style.backgroundColor"
                            :stroke-width="cellGap"
                        />
                    </g>
                </template>
    
                <!-- DATAPOINTS -->
                <g ref="datapoints">
                    <template v-for="(serie, i) in mutableDataset">
                        <g v-for="(cell, j) in serie.temperatures">
                            <rect
                                data-cy="cell-underlayer"
                                :x="drawingArea.left + drawingArea.cellSize.width * j + (cellGap / 2) + drawingArea.sumCellXHeight"
                                :y="drawingArea.top + drawingArea.cellSize.height * i + (cellGap / 2)"
                                :width="drawingArea.cellSize.width - cellGap"
                                :height="drawingArea.cellSize.height - cellGap"
                                :fill="FINAL_CONFIG.style.layout.cells.colors.underlayer"
                                :stroke="FINAL_CONFIG.style.backgroundColor"
                                :stroke-width="cellGap"
                            />
                            <rect
                                data-cy="cell"
                                :x="drawingArea.left + drawingArea.cellSize.width * j + (cellGap / 2) + drawingArea.sumCellXHeight"
                                :y="drawingArea.top + drawingArea.cellSize.height * i + (cellGap / 2)"
                                :width="drawingArea.cellSize.width - cellGap"
                                :height="drawingArea.cellSize.height - cellGap"
                                :fill="cell.color"
                                :stroke="FINAL_CONFIG.style.backgroundColor"
                                :stroke-width="cellGap"
                                @mouseover="useTooltip(cell, i, drawingArea.left + drawingArea.cellSize.width * j, drawingArea.top + drawingArea.cellSize.height * i)"
                                @mouseout="() => onTrapLeave({ datapoint: cell, seriesIndex: i })"
                                @click="() => selectDatapoint(cell, i)"
                            />
                            <text 
                                data-cy="cell-label"
                                v-if="FINAL_CONFIG.style.layout.cells.value.show"
                                text-anchor="middle"
                                :font-size="FINAL_CONFIG.style.layout.cells.value.fontSize"
                                :font-weight="FINAL_CONFIG.style.layout.cells.value.bold ? 'bold': 'normal'"
                                :fill="adaptColorToBackground(cell.color)"
                                :x="(drawingArea.left + drawingArea.cellSize.width * j) + (drawingArea.cellSize.width / 2) + drawingArea.sumCellXHeight"
                                :y="(drawingArea.top + drawingArea.cellSize.height * i) + (drawingArea.cellSize.height / 2) + FINAL_CONFIG.style.layout.cells.value.fontSize / 3"
                                v-fit-text="{
                                    cellWidth: drawingArea.cellSize.width  - cellGap,
                                    cellHeight: drawingArea.cellSize.height - cellGap,
                                    maxFontSize: FINAL_CONFIG.style.layout.cells.value.fontSize,
                                    minFontSize: 10,
                                    index: i * maxX + j,
                                    reportHide,
                                    reportRotation,
                                    hideAll,
                                    rotateAll
                                }"
                                :style="{ pointerEvents: 'none', userSelect: 'none'}"
                            >
                                {{ applyDataLabel(
                                    FINAL_CONFIG.style.layout.cells.value.formatter,
                                    cell.value,
                                    dataLabel({
                                        p: FINAL_CONFIG.style.layout.dataLabels.prefix,
                                        v: cell.value,
                                        s: FINAL_CONFIG.style.layout.dataLabels.suffix,
                                        r: FINAL_CONFIG.style.layout.cells.value.roundingValue
                                    }),
                                    { datapoint: cell }
                                )
                                }}
                            </text>
                        </g>
                    </template>
                </g>
                
                <!-- Y AXIS SUM RECTS -->
                <g ref="yAxisSumRects" v-if="FINAL_CONFIG.style.layout.cells.rowTotal.color.show">
                    <template v-for="(_, i) in mutableDataset">
                        <rect 
                            :x="drawingArea.left"
                            :y="drawingArea.top + (drawingArea.cellSize.height * i)"
                            :width="drawingArea.sumCellXHeight"
                            :height="drawingArea.cellSize.height - cellGap"
                            :fill="FINAL_CONFIG.style.layout.cells.colors.underlayer"
                            :stroke="FINAL_CONFIG.style.backgroundColor"
                            :stroke-width="cellGap"
                        />
                        <rect 
                            :x="drawingArea.left"
                            :y="drawingArea.top + (drawingArea.cellSize.height * i) + cellGap / 2"
                            :width="drawingArea.sumCellXHeight"
                            :height="drawingArea.cellSize.height - cellGap"
                            :fill="dataLabels.yTotals[i].color"
                            :stroke="FINAL_CONFIG.style.backgroundColor"
                            :stroke-width="cellGap"
                        />
                    </template>
                </g>
    
                <!-- Y AXIS LABELS -->
                <g ref="yAxisLabels" v-if="FINAL_CONFIG.style.layout.dataLabels.yAxis.show">
                    <template v-for="(_, i) in mutableDataset">
                        <text
                            data-cy="axis-y-label"
                            class="vue-ui-heatmap-row-name"
                            :font-size="FINAL_CONFIG.style.layout.dataLabels.yAxis.fontSize"
                            :fill="FINAL_CONFIG.style.layout.dataLabels.yAxis.color"
                            :x="leftLabelsWidth"
                            :y="drawingArea.top + (drawingArea.cellSize.height * i) + drawingArea.cellSize.height / 2 + FINAL_CONFIG.style.layout.dataLabels.yAxis.fontSize / 3 + FINAL_CONFIG.style.layout.dataLabels.yAxis.offsetY - (FINAL_CONFIG.style.layout.cells.rowTotal.value.show ? FINAL_CONFIG.style.layout.dataLabels.yAxis.fontSize / 1.5 : 0)"
                            text-anchor="end"
                            :font-weight="FINAL_CONFIG.style.layout.dataLabels.yAxis.bold ? 'bold' : 'normal'"
                        >
                            {{ dataLabels.yLabels[i] }}
                        </text>
                        <text
                            class="vue-ui-heatmap-row-total"
                            v-if="FINAL_CONFIG.style.layout.cells.rowTotal.value.show"
                            data-cy="axis-y-label"
                            :font-size="FINAL_CONFIG.style.layout.dataLabels.yAxis.fontSize"
                            :fill="FINAL_CONFIG.style.layout.dataLabels.yAxis.color"
                            :x="leftLabelsWidth"
                            :y="drawingArea.top + (drawingArea.cellSize.height * i) + drawingArea.cellSize.height / 2 + FINAL_CONFIG.style.layout.dataLabels.yAxis.fontSize + FINAL_CONFIG.style.layout.dataLabels.yAxis.offsetY"
                            text-anchor="end"
                            :font-weight="FINAL_CONFIG.style.layout.dataLabels.yAxis.bold ? 'bold' : 'normal'"
                        >
                            {{ getRowTotal(i) }}
                        </text>
                    </template>
                </g>
    
                <!-- X AXIS LABELS -->
                <g v-if="FINAL_CONFIG.style.layout.dataLabels.xAxis.show" ref="xAxisLabels">
                    <template v-for="(label, i) in dataLabels.xLabels">
                        <text
                            class="vue-ui-heatmap-col-name"
                            data-cy="axis-x-label"
                            v-if="!FINAL_CONFIG.style.layout.dataLabels.xAxis.showOnlyAtModulo || (FINAL_CONFIG.style.layout.dataLabels.xAxis.showOnlyAtModulo && i % FINAL_CONFIG.style.layout.dataLabels.xAxis.showOnlyAtModulo === 0)"
                            :text-anchor="FINAL_CONFIG.style.layout.dataLabels.xAxis.rotation === 0 ? 'middle' : FINAL_CONFIG.style.layout.dataLabels.xAxis.rotation < 0 ? 'start' : 'end'"
                            :font-size="FINAL_CONFIG.style.layout.dataLabels.xAxis.fontSize"
                            :fill="FINAL_CONFIG.style.layout.dataLabels.xAxis.color"
                            :font-weight="FINAL_CONFIG.style.layout.dataLabels.xAxis.bold ? 'bold' : 'normal'"
                            :transform="`translate(${drawingArea.left + drawingArea.cellSize.width / 2 + (drawingArea.width / dataLabels.xLabels.length * i) + FINAL_CONFIG.style.layout.dataLabels.xAxis.offsetX + drawingArea.sumCellXHeight}, ${drawingArea.topLabelsHeight}), rotate(${FINAL_CONFIG.style.layout.dataLabels.xAxis.rotation})`"
                        >
                            {{ label }}
                        </text>
                    </template>
                </g>
    
                <!-- X AXIS SUMS -->
                <template v-if="FINAL_CONFIG.style.layout.cells.columnTotal.value.show">
                    <g ref="xAxisSums">
                        <text
                            class="vue-ui-heatmap-col-total"
                            v-for="(_, i) in dataLabels.xLabels"
                            :text-anchor="FINAL_CONFIG.style.layout.cells.columnTotal.value.rotation === 0 ? 'middle' : FINAL_CONFIG.style.layout.cells.columnTotal.value.rotation < 0 ? 'end' : 'start'"
                            :font-size="FINAL_CONFIG.style.layout.dataLabels.xAxis.fontSize"
                            :fill="FINAL_CONFIG.style.layout.dataLabels.xAxis.color"
                            :font-weight="FINAL_CONFIG.style.layout.dataLabels.xAxis.bold ? 'bold' : 'normal'"
                            :transform="`translate(${drawingArea.left + drawingArea.cellSize.width / 2 + (drawingArea.width / dataLabels.xLabels.length * i) + FINAL_CONFIG.style.layout.dataLabels.xAxis.offsetX + FINAL_CONFIG.style.layout.cells.columnTotal.value.offsetX + drawingArea.sumCellXHeight}, ${drawingArea.bottom + FINAL_CONFIG.style.layout.dataLabels.xAxis.fontSize / 2}), rotate(${FINAL_CONFIG.style.layout.cells.columnTotal.value.rotation})`"
                        >
                            {{ getcolumnTotal(i) }}
                        </text>
                    </g>
                    </template>
    
                <!-- BORDER FOR SELECTED RECT, PAINTED LAST -->
                <g v-if="selectedClone">
                    <rect
                        data-cy="cell-selected"
                        style="pointer-events: none;"
                        :x="selectedClone.x - ((FINAL_CONFIG.style.layout.cells.selected.border) / 2) + cellGap + drawingArea.sumCellXHeight"
                        :y="selectedClone.y - (FINAL_CONFIG.style.layout.cells.selected.border / 2) + cellGap"
                        :width="drawingArea.cellSize.width - cellGap + FINAL_CONFIG.style.layout.cells.selected.border - (cellGap)"
                        :height="drawingArea.cellSize.height - cellGap + FINAL_CONFIG.style.layout.cells.selected.border - (cellGap)"
                        fill="transparent"
                        :stroke="FINAL_CONFIG.style.layout.cells.selected.color"
                        :stroke-width="FINAL_CONFIG.style.layout.cells.selected.border"
                        :rx="1"
                    />
                </g>

                <slot name="svg" :svg="svg"/>
            </svg>

            <!-- LEGEND RIGHT -->
            <div 
                ref="legendRight" 
                v-if="FINAL_CONFIG.style.legend.show" 
                class="vue-ui-heatmap-legend-right" 
                :style="{
                    '--legend-width': FINAL_CONFIG.style.legend.width + 'px'
                }"
            >
                <!-- LEGEND MAX -->
                <div
                    v-if="!loading"
                    data-cy="legend-label-max"
                    class="vue-ui-heatmap-legend-label-max"
                    :style="{
                        fontSize: FINAL_CONFIG.style.legend.fontSize + 'px',
                        color: FINAL_CONFIG.style.legend.color
                    }"
                >
                    {{ applyDataLabel(
                        FINAL_CONFIG.style.layout.cells.value.formatter,
                        checkNaN(maxValue),
                        dataLabel({
                            p: FINAL_CONFIG.style.layout.dataLabels.prefix,
                            v: checkNaN(maxValue),
                            s: FINAL_CONFIG.style.layout.dataLabels.suffix,
                            r: FINAL_CONFIG.style.legend.roundingValue
                        })) 
                    }}
                </div>
                <!-- LEGEND GAUGE -->
                <div class="vue-ui-heatmap-legend-gauge-right">
                    <div 
                        class="vue-ui-heatmap-gauge"
                        data-cy="legend-gauge"
                        :style="{
                            background: `linear-gradient(to bottom, ${FINAL_CONFIG.style.layout.cells.colors.hot}, ${FINAL_CONFIG.style.layout.cells.colors.cold})`
                        }"
                    >
                        <div
                            class="vue-ui-heatmap-gauge-indicator"
                            v-show="![undefined, null].includes(hoveredValue)"
                            :data-value="applyDataLabel(
                                FINAL_CONFIG.style.layout.cells.value.formatter,
                                checkNaN(hoveredValue),
                                dataLabel({
                                    p: FINAL_CONFIG.style.layout.dataLabels.prefix,
                                    v: checkNaN(hoveredValue),
                                    s: FINAL_CONFIG.style.layout.dataLabels.suffix,
                                    r: FINAL_CONFIG.style.legend.roundingValue
                            }))"
                            :style="{
                                position: 'absolute',
                                width: '100%',
                                height: '2px',
                                background: [undefined, null].includes(hoveredValue) ? 'transparent' : adaptColorToBackground(dataTooltipSlot.datapoint.color),
                                top: `${[undefined, null].includes(hoveredValue) ? 0 : (1 - hoveredValue / maxValue)* 100}%`,
                                transition: 'all 0.2s ease-in-out',
                                '--background-color': FINAL_CONFIG.style.backgroundColor,
                                '--gauge-arrow-color': adaptColorToBackground(FINAL_CONFIG.style.backgroundColor),
                                '--gauge-arrow-text-color': adaptColorToBackground(FINAL_CONFIG.style.backgroundColor),
                                '--gauge-arrow-value': hoveredValue,
                                '--gauge-arrow-font-size': FINAL_CONFIG.style.legend.fontSize + 'px'
                            }"
                        >
                            <div class="vue-ui-heatmap-gauge-indicator-value" data-cy="gauge-indicator">
                                {{ applyDataLabel(
                                    FINAL_CONFIG.style.layout.cells.value.formatter,
                                    checkNaN(hoveredValue),
                                    dataLabel({
                                        p: FINAL_CONFIG.style.layout.dataLabels.prefix,
                                        v: checkNaN(hoveredValue),
                                        s: FINAL_CONFIG.style.layout.dataLabels.suffix,
                                        r: FINAL_CONFIG.style.legend.roundingValue
                                }))}}
                            </div>    
                        </div>
                    </div>
                </div>
                <!-- LEGEND MIN -->
                <div 
                    v-if="!loading"
                    data-cy="legend-label-min"
                    class="vue-ui-heatmap-legend-label-min"
                    :style="{
                        fontSize: FINAL_CONFIG.style.legend.fontSize + 'px',
                        color: FINAL_CONFIG.style.legend.color
                    }"
                >
                    {{ applyDataLabel(
                        FINAL_CONFIG.style.layout.cells.value.formatter,
                        checkNaN(minValue),
                        dataLabel({
                            p: FINAL_CONFIG.style.layout.dataLabels.prefix,
                            v: checkNaN(minValue),
                            s: FINAL_CONFIG.style.layout.dataLabels.suffix,
                            r: FINAL_CONFIG.style.legend.roundingValue
                        })) 
                    }}
                </div>
            </div>
        </div>

        <div v-if="$slots.watermark" class="vue-data-ui-watermark">
            <slot name="watermark" v-bind="{ isPrinting: isPrinting || isImaging }"/>
        </div>

        <div v-if="$slots.source" ref="source" dir="auto">
            <slot name="source" />
        </div>

        <!-- TOOLTIP -->
        <Tooltip
            :show="mutableConfig.showTooltip && isTooltip"
            :backgroundColor="FINAL_CONFIG.style.tooltip.backgroundColor"
            :color="FINAL_CONFIG.style.tooltip.color"
            :borderRadius="FINAL_CONFIG.style.tooltip.borderRadius"
            :borderColor="FINAL_CONFIG.style.tooltip.borderColor"
            :borderWidth="FINAL_CONFIG.style.tooltip.borderWidth"
            :fontSize="FINAL_CONFIG.style.tooltip.fontSize"
            :backgroundOpacity="FINAL_CONFIG.style.tooltip.backgroundOpacity"
            :position="FINAL_CONFIG.style.tooltip.position"
            :offsetY="FINAL_CONFIG.style.tooltip.offsetY"
            :parent="heatmapChart"
            :content="tooltipContent"
            :isFullscreen="isFullscreen"
            :isCustom="FINAL_CONFIG.style.tooltip.customFormat && typeof FINAL_CONFIG.style.tooltip.customFormat === 'function'"
            :smooth="FINAL_CONFIG.style.tooltip.smooth"
            :backdropFilter="FINAL_CONFIG.style.tooltip.backdropFilter"
            :smoothForce="FINAL_CONFIG.style.tooltip.smoothForce"
            :smoothSnapThreshold="FINAL_CONFIG.style.tooltip.smoothSnapThreshold"
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
                <div ref="tableContainer" class="vue-ui-heatmap-table atom-data-table" :style="`${FINAL_CONFIG.table.useDialog ? '' : 'max-height: 300px; margin-top: 24px;'}`">
                    <div 
                        :style="`width:100%;overflow-x:auto;position:relative;${FINAL_CONFIG.table.useDialog ? '' : 'padding-top:36px'};`" 
                        :class="{'vue-ui-responsive' : isTableResponsive}"
                    >
                        <div v-if="!FINAL_CONFIG.table.useDialog" data-cy="data-table-close" role="button" tabindex="0" :style="`width:32px; position: absolute; top: 0; left:4px; padding: 0 0px; display: flex; align-items:center;justify-content:center;height: 36px; width: 32px; cursor:pointer; background:${FINAL_CONFIG.table.th.backgroundColor};`" @click="closeTable" @keypress.enter="closeTable">
                            <BaseIcon name="close" :stroke="FINAL_CONFIG.table.th.color" :stroke-width="2" />
                        </div> 
                        <table class="vue-ui-data-table">
                            <caption v-if="!FINAL_CONFIG.table.useDialog" :style="`backgroundColor:${FINAL_CONFIG.table.th.backgroundColor};color:${FINAL_CONFIG.table.th.color};outline:${FINAL_CONFIG.table.th.outline}`">
                                {{ FINAL_CONFIG.style.title.text }} <span v-if="FINAL_CONFIG.style.title.subtitle.text">{{  FINAL_CONFIG.style.title.subtitle.text }}</span>
                            </caption>
                            <thead>
                                <tr role="row" :style="`background:${FINAL_CONFIG.table.th.backgroundColor};color:${FINAL_CONFIG.table.th.color}`">
                                    <th :style="`outline:${FINAL_CONFIG.table.th.outline};padding-right:6px`"></th>
                                    <th align="right" :style="`outline:${FINAL_CONFIG.table.th.outline};padding-right:6px`" v-for="(th,i) in dataset" :data-cy="`heatmap-table-col-name-${i}`">
                                        {{ th.name }}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr role="row" v-for="(tr, i) in dataLabels.xLabels" :class="{'vue-ui-data-table__tbody__row' : true, 'vue-ui-data-table__tbody__row-even': i % 2 === 0, 'vue-ui-data-table__tbody__row-odd': i % 2 !== 0}" :style="`background:${FINAL_CONFIG.table.td.backgroundColor};color:${FINAL_CONFIG.table.td.color}`">
                                    <td :data-cell="FINAL_CONFIG.table.colNames.xAxis" class="vue-ui-data-table__tbody__td"  :data-cy="`heatmap-table-row-name-${i}`" :style="`outline:${FINAL_CONFIG.table.td.outline}`">
                                        <div style="display: flex; align-items:center; gap: 5px; justify-content:flex-end; width:100%; padding-right:3px;">
                                            {{ tr }}
                                        </div>
                                    </td>
                                    <td class="vue-ui-data-table__tbody__td"  v-for="(trData, j) in dataset" :data-cell="dataset[j].name" :style="`outline:${FINAL_CONFIG.table.td.outline}`">
                                        <div style="display: flex; align-items:center; gap: 5px; justify-content:flex-end; width:100%; padding-right:3px;">
                                            {{ isNaN(trData.values[i]) ? '-' : dataLabel({p:FINAL_CONFIG.style.layout.dataLabels.prefix, v:trData.values[i], s: FINAL_CONFIG.style.layout.dataLabels.suffix, r: FINAL_CONFIG.table.td.roundingValue}) }}
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </template>
        </component>

        <!-- v3 Skeleton loader -->
        <BaseScanner v-if="loading"/>
    </div> 
</template>

<style scoped lang="scss">
@import "../vue-data-ui.css";

.vue-ui-heatmap *{
    transition: unset;
}
.vue-ui-heatmap {
    user-select: none;
    position: relative;
}
.vue-ui-heatmap .vue-ui-heatmap-label {
    align-items: center;
    display: flex;
    flex-direction: column;
    height:100%;
    justify-content: center;
    text-align:center;
    width:100%;
}
.vue-ui-heatmap-legend {
    height: 100%;
    width:100%;
    display: flex;
    align-items:center;
    flex-wrap: wrap;
    justify-content:center;
    column-gap: 18px;
}
.vue-ui-heatmap-legend-item {
    display: flex;
    align-items:center;
    gap: 6px;
    cursor: pointer;
    height: 24px;
}

/** */
.vue-ui-heatmap-tooltip {
    border: 1px solid #e1e5e8;
    border-radius: 4px;
    box-shadow: 0 6px 12px -6px rgba(0,0,0,0.2);
    max-width: 300px;
    position: fixed;
    padding:12px;
    z-index:1;
}

.vue-ui-heatmap-table {
    width: 100%;
    overflow: auto;
    position: relative;
}

.vue-ui-data-table thead {
    position: sticky;
    top:0;
    font-weight: 400;
    user-select: none;
}

table {
    width: 100%;
    padding: 1rem;
    border-collapse:collapse;
}

caption,
th,
td {
    padding: 0.5rem;
    font-variant-numeric: tabular-nums;
}

caption {
    font-size: 1.3rem;
    font-weight: 700;
}

.vue-ui-responsive {
    th {
        display: none;
    }
    td {
        display: grid;
        gap: 0.5rem;
        grid-template-columns: repeat(2, 1fr);
        padding: 0.5rem 1rem;
        outline: none !important;
        text-align: left;
    }
    tr {
        outline: v-bind(tdo);
    }

    td:first-child {
        padding-top: 1rem;
    }

    td:last-child {
        padding-bottom: 1rem;
    }

    td::before {
        content: attr(data-cell) ": ";
        font-weight: 700;
        text-transform: capitalize;
    }
}

.vue-ui-heatmap-chart-wrapper {
    width: 100%;
}

.vue-ui-heatmap-chart-wrapper-legend-right{
    display: flex;
    flex-wrap: nowrap;
}

.vue-ui-heatmap-chart-wrapper-legend-right {
    flex-direction: row;
    .vue-ui-heatmap-legend-label-max,
    .vue-ui-heatmap-legend-label-min {
        flex: 0 0 auto;
    }
}

.vue-ui-heatmap-chart-wrapper-legend-right svg {
    flex: 1 1 0;
    min-width: 0;
    width: auto !important;
}

.vue-ui-heatmap-legend-gauge-right {
    flex: 1 1 auto;
    min-height: 0;
    width: 16px;
    .vue-ui-heatmap-gauge {
        position: relative;
        border-radius: 8px;
        width: 100%;
        height: 100%;
        background: inherit;
        &::before {
            content: '-';
            color: transparent;
        }
    }
    .vue-ui-heatmap-gauge-indicator {
        &::before {
            content: "";
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            left: -6px;
            border-top: 5px solid transparent;
            border-bottom: 5px solid transparent;
            border-left: 6px solid var(--gauge-arrow-color);
        }
    }
    .vue-ui-heatmap-gauge-indicator-value {
        position: absolute;
        top: 50%;
        right: calc(100% + var(--gauge-arrow-font-size));
        transform: translateY(-50%);
        font-size: var(--gauge-arrow-font-size);
        background: var(--background-color);
        color: var(--gauge-arrow-text-color);
        padding: 2px 4px;
        border-radius: 2px;
    }
}

.vue-ui-heatmap-legend-right {
    user-select: none;
    pointer-events: none;
}

.vue-ui-heatmap-legend-right {
    flex: 0 0 var(--legend-width);
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    align-items:center;
    justify-content: space-between;
}
</style>