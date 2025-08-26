
<script setup>
import { ref, computed, nextTick, onMounted, watch, defineAsyncComponent, watchEffect, onBeforeUnmount, toRefs, shallowRef } from "vue";
import {
    applyDataLabel,
    calcMarkerOffsetX, 
    calcMarkerOffsetY, 
    calcNutArrowPath, 
    calculateNiceScale,
    canShowValue, 
    convertColorToHex, 
    convertCustomPalette, 
    createCsvContent, 
    createUid, 
    createTSpansFromLineBreaksOnX,
    dataLabel,
    deepEmptyObjectToNull,
    downloadCsv,
    error,
    getMissingDatasetAttributes,
    hasDeepProperty,
    makeDonut,
    objectIsEmpty, 
    palette,
    sanitizeArray,
    setOpacity,
    sumByAttribute,
    themePalettes,
    XMLNS,
    treeShake
} from '../lib';
import { useChartAccessibility } from "../useChartAccessibility";
import { useConfig } from "../useConfig";
import { useNestedProp } from "../useNestedProp";
import { usePrinter } from "../usePrinter";
import { useTimeLabels } from "../useTimeLabels";
import { useUserOptionState } from "../useUserOptionState";
import { useTimeLabelCollision } from '../useTimeLabelCollider.js';
import themes from "../themes.json";
import Legend from "../atoms/Legend.vue"; // Must be ready in responsive mode
import Slicer from "../atoms/Slicer.vue"; // Must be ready in responsive mode
import Title from "../atoms/Title.vue"; // Must be ready in responsive mode
import img from "../img";
import { throttle } from "../canvas-lib";
import { useLoading } from "../useLoading.js";
import BaseScanner from "../atoms/BaseScanner.vue";
import { useResponsive } from "../useResponsive.js";

const Accordion = defineAsyncComponent(() => import('./vue-ui-accordion.vue'));
const BaseDraggableDialog = defineAsyncComponent(() => import('../atoms/BaseDraggableDialog.vue'));
const DataTable = defineAsyncComponent(() => import('../atoms/DataTable.vue'));
const PackageVersion = defineAsyncComponent(() => import('../atoms/PackageVersion.vue'));
const PenAndPaper = defineAsyncComponent(() => import('../atoms/PenAndPaper.vue'));
const UserOptions = defineAsyncComponent(() => import('../atoms/UserOptions.vue'));
const VueUiDonut = defineAsyncComponent(() => import('./vue-ui-donut.vue'));

const { vue_ui_donut_evolution: DEFAULT_CONFIG } = useConfig();

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

const uid = ref(createUid());
const segregated = ref([]);
const hoveredIndex = ref(null);
const hoveredDatapoint = ref(null);
const isFixed = ref(false);
const fixedDatapoint = ref(null);
const donutEvolutionChart = ref(null);
const noTitle = ref(null);
const step = ref(0);
const slicerStep = ref(0);
const titleStep = ref(0);
const tableStep = ref(0);
const legendStep = ref(0);
const scaleLabels = ref(null);
const timeLabelsEls = ref(null);
const xAxisLabel = ref(null);
const yAxisLabel = ref(null);
const readyTeleport = ref(false);

const chartTitle = ref(null);
const chartLegend = ref(null);
const source = ref(null);
const slicerComponent = ref(null);
const chartSlicer = ref(null);

const isLoaded = ref(false);

const resizeObserver = shallowRef(null);
const observedEl = shallowRef(null);
const to = ref(null)

const emit = defineEmits(['selectLegend']);

const isDataset = computed(() => {
    return !!props.dataset && props.dataset.length;
})

onMounted(() => {
    readyTeleport.value = true;
    prepareChart();
});

const debug = computed(() => !!FINAL_CONFIG.value.debug);

function prepareChart() {
    if(objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiDonutEvolution',
            type: 'dataset',
            debug: debug.value
        });
        manualLoading.value = true; // v3
    } else {
        if(props.dataset.length) {
            props.dataset.forEach((ds, i) => {
                getMissingDatasetAttributes({
                    datasetObject: ds,
                    requiredAttributes: ['name', 'values']
                }).forEach(attr => {
                    error({
                        componentName: 'VueUiDonutEvolution',
                        type: 'datasetSerieAttribute',
                        property: attr,
                        index: i,
                        debug: debug.value
                    });
                    manualLoading.value = true;
                })
            })
        }
    }

    // v3
    if (!objectIsEmpty(props.dataset)) {
        manualLoading.value = FINAL_CONFIG.value.loading;
    }

    setTimeout(() => {
        isLoaded.value = true;
    }, 10);

    setupSlicer();

    if (FINAL_CONFIG.value.responsive) {
        const handleResize = throttle(() => {
            isLoaded.value = false;
            const { width, height } = useResponsive({
                chart: donutEvolutionChart.value,
                title: FINAL_CONFIG.value.style.chart.title.text ? chartTitle.value : null,
                legend: FINAL_CONFIG.value.style.chart.legend.show ? chartLegend.value : null,
                slicer: FINAL_CONFIG.value.style.chart.zoom.show && maxX.value > 1 ? chartSlicer.value : null,
                source: source.value
            });

            requestAnimationFrame(() => {
                defaultSizes.value.width = width;
                defaultSizes.value.height = height - 12;
                clearTimeout(to.value);
                to.value = setTimeout(() => {
                    isLoaded.value = true;
                },10)
            });
        });

        if (resizeObserver.value) {
            if (observedEl.value) {
                resizeObserver.value.unobserve(observedEl.value);
            }
            resizeObserver.value.disconnect();
        }

        resizeObserver.value = new ResizeObserver(handleResize);
        observedEl.value = donutEvolutionChart.value.parentNode;
        resizeObserver.value.observe(observedEl.value);
    }
}

const FINAL_CONFIG = ref(prepareConfig());

const { loading, FINAL_DATASET, manualLoading } = useLoading({
    ...toRefs(props),
    FINAL_CONFIG,
    prepareConfig,
    callback: () => {
        Promise.resolve().then(async () => {
            await setupSlicer();
        });
    },
    skeletonDataset: [
        {
            name: '',
            values: [1, 2, 3, 5, 8, 13],
            color: '#AAAAAA'
        },
        {
            name: '',
            values: [1, 2, 3, 5, 8, 13],
            color: '#BABABA'
        },
        {
            name: '',
            values: [1, 2, 3, 5, 8, 13],
            color: '#CACACA'
        },
    ],
    skeletonConfig: treeShake({
        defaultConfig: FINAL_CONFIG.value,
        userConfig: {
            useCssAnimation: false,
            table: { show: false },
            userOptions: { show: false },
            style: {
                chart: {
                    backgroundColor: '#99999930',
                    layout: {
                        dataLabels: { show: false },
                        grid: {
                            stroke: '#6A6A6A',
                            axis: {
                                yLabel: '',
                                xLabel: ''
                            },
                            yAxis: {
                                dataLabels: { show: false }
                            },
                            xAxis: {
                                dataLabels: { show: false }
                            }
                        },
                        line: {
                            stroke: '#CACACA60'
                        }
                    },
                    legend: {
                        backgroundColor: 'transparent',
                        showValue: false,
                        showPercentage: false,
                    },
                    zoom: { 
                        show: false,
                        startIndex: null,
                        endIndex: null
                    }
                }
            }
        }
    })
});

const defaultSizes = ref({
    width: FINAL_CONFIG.value.style.chart.layout.width,
    height: FINAL_CONFIG.value.style.chart.layout.height
});

const maxX = computed(() => {
    return Math.max(...FINAL_DATASET.value.map(ds => ds.values.length))
})

const slicer = ref({
    start: 0,
    end: maxX.value
})

function refreshSlicer() {
    setupSlicer();
}

async function setupSlicer() {
    await nextTick();
    await nextTick();

    const { startIndex, endIndex } = FINAL_CONFIG.value.style.chart.zoom;
    const comp = slicerComponent.value;

    if ((startIndex != null || endIndex != null) && comp) {
        if (startIndex != null) {
        comp.setStartValue(startIndex);
        }
        if (endIndex != null) {
        comp.setEndValue(validSlicerEnd(endIndex + 1));
        }
    } else {
        slicer.value = {
            start: 0,
            end: maxLength.value
        };
        slicerStep.value += 1;
    }
}

function validSlicerEnd(v) {
    const max = maxLength.value;
    if (v > max) {
        return max;
    }
    if (v < 0 || (FINAL_CONFIG.value.style.chart.zoom.startIndex !== null && v < FINAL_CONFIG.value.style.chart.zoom.startIndex)) {
        if (FINAL_CONFIG.value.style.chart.zoom.startIndex !== null) {
            return FINAL_CONFIG.value.style.chart.zoom.startIndex + 1;
        } else {
            return 1;
        }
    }
    return v;
}


const { userOptionsVisible, setUserOptionsVisibility, keepUserOptionState } = useUserOptionState({ config: FINAL_CONFIG.value });
const { svgRef } = useChartAccessibility({ config: FINAL_CONFIG.value.style.chart.title });

function prepareConfig() {
    const mergedConfig = useNestedProp({
        userConfig: props.config,
        defaultConfig: DEFAULT_CONFIG
    });

    let finalConfig = {};

    if (mergedConfig.theme) {
        finalConfig = {
            ...useNestedProp({
                userConfig: themes.vue_ui_donut_evolution[mergedConfig.theme] || props.config,
                defaultConfig: mergedConfig
            }),
            customPalette: themePalettes[mergedConfig.theme] || palette
        }
    } else {
        finalConfig = mergedConfig;
    }

    // ------------------------------ OVERRIDES -----------------------------------

    if (props.config && hasDeepProperty(props.config, 'style.chart.zoom.startIndex')) {
        finalConfig.style.chart.zoom.startIndex = props.config.style.chart.zoom.startIndex;
    } else {
        finalConfig.style.chart.zoom.startIndex = null;
    }

    if (props.config && hasDeepProperty(props.config, 'style.chart.zoom.endIndex')) {
        finalConfig.style.chart.zoom.endIndex = props.config.style.chart.zoom.endIndex;
    } else {
        finalConfig.style.chart.zoom.endIndex = null;
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
    tableStep.value += 1;
    legendStep.value += 1;

    // Reset mutable config
    mutableConfig.value.showTable = FINAL_CONFIG.value.table.show;
}, { deep: true });

watch(() => props.dataset, (_) => {
    if (Array.isArray(_) && _.length > 0) {
        manualLoading.value = false;
    }
    refreshSlicer();
}, { deep: true })

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: uid.value,
    fileName: FINAL_CONFIG.value.style.chart.title.text || 'vue-ui-donut-evolution',
    options: FINAL_CONFIG.value.userOptions.print
});

const hasOptionsNoTitle = computed(() => {
    return FINAL_CONFIG.value.userOptions.show && !FINAL_CONFIG.value.style.chart.title.text;
});

const customPalette = computed(() => {
    return convertCustomPalette(FINAL_CONFIG.value.customPalette);
});

const mutableConfig = ref({
    showTable: FINAL_CONFIG.value.table.show
});

// v3 - Essential to make shifting between loading config and final config work
watch(FINAL_CONFIG, () => {
    mutableConfig.value = {
        showTable: FINAL_CONFIG.value.table.show
    }
}, { immediate: true });

const padding = computed(() => {
    return {
        top: FINAL_CONFIG.value.style.chart.layout.padding.top,
        right: FINAL_CONFIG.value.style.chart.layout.padding.right,
        bottom: FINAL_CONFIG.value.style.chart.layout.padding.bottom,
        left: FINAL_CONFIG.value.style.chart.layout.padding.left,
    }
});

function getScaleLabelX() {
    let base = 0;
    if (scaleLabels.value) {
        const texts = Array.from(scaleLabels.value.querySelectorAll('text'))
        base = texts.reduce((max, t) => {
        const w = t.getComputedTextLength()
        return( w > max ? w : max) + FINAL_CONFIG.value.style.chart.layout.grid.axis.yLabelOffsetX
        }, 0)
    }

    const yAxisLabelW = yAxisLabel.value
        ? yAxisLabel.value.getBoundingClientRect().width + FINAL_CONFIG.value.style.chart.layout.grid.axis.yLabelOffsetX + FINAL_CONFIG.value.style.chart.layout.grid.axis.fontSize
        : 0

    const crosshair = 5
    return base + yAxisLabelW + crosshair
}

const timeLabelsHeight = ref(0);

const updateHeight = throttle((h) => {
    timeLabelsHeight.value = h
}, 100)

// Track time label height to update drawing area when they rotate
watchEffect((onInvalidate) => {
    const el = timeLabelsEls.value
    if (!el) return

    const observer = new ResizeObserver(entries => {
        updateHeight(entries[0].contentRect.height)
    })
    observer.observe(el)
    onInvalidate(() => observer.disconnect())
})

onBeforeUnmount(() => {
    timeLabelsHeight.value = 0
})

const timeLabelsY = computed(() => {
    let h = 0;
        if (xAxisLabel.value) {
            h = xAxisLabel.value.getBBox().height;
        }
        let tlH = 0;
        if (timeLabelsEls.value) {
            tlH = timeLabelsHeight.value;
        }
        return h + tlH + FINAL_CONFIG.value.style.chart.layout.grid.axis.fontSize + FINAL_CONFIG.value.style.chart.layout.grid.xAxis.dataLabels.offsetY;
});

const svg = computed(() => {
    const _scaleLabelX = getScaleLabelX();

    const topOffset = FINAL_CONFIG.value.style.chart.layout.dataLabels.fontSize * 3;

    const absoluteWidth = defaultSizes.value.width;
    const absoluteHeight = defaultSizes.value.height;
    const left = padding.value.left + _scaleLabelX;
    const right = absoluteWidth - padding.value.right;
    const width = absoluteWidth - left - padding.value.right;
    const height = absoluteHeight - padding.value.top - padding.value.bottom - topOffset - timeLabelsY.value;
    const top = padding.value.top + topOffset;
    const bottom = absoluteHeight - padding.value.bottom - timeLabelsY.value;

    return {
        top,
        left,
        right,
        bottom,
        absoluteHeight,
        absoluteWidth,
        centerX: left + (Math.max(10, width) / 2),
        centerY: top + (Math.max(10, height) / 2),
        width: Math.max(10, width),
        height: Math.max(10, height),
    }
});

const convertedDataset = computed(() => {
    FINAL_DATASET.value.forEach((ds, i) => {
        if([null, undefined].includes(ds.name)){
            error({
                componentName: 'VueUiDonutEvolution',
                type: 'datasetSerieAttribute',
                property: 'name',
                index: i,
                debug: debug.value
            });
        }
        if([null, undefined].includes(ds.values)){
            error({
                componentName: 'VueUiDonutEvolution',
                type: 'datasetSerieAttribute',
                property: 'values',
                index: i,
                debug: debug.value
            });
        }
    });
    
    return FINAL_DATASET.value.map((ds, i) => {
        return {
            ...ds,
            values: sanitizeArray(ds.values),
            color: convertColorToHex(ds.color) || customPalette.value[i] || palette[i] || palette[i % palette.length],
            length: (ds.values || []).length,
            uid: createUid(),
        }
    });
});

const mutableDataset = computed(() => {
    return convertedDataset.value.filter(ds => !segregated.value.includes(ds.uid)).map(ds => {
        return {
            ...ds,
            values: ds.values.filter((_v, k) => k >= slicer.value.start && k <= slicer.value.end)
        }
    });
});

const maxLength = computed(() => {
    return Math.max(...mutableDataset.value.map(ds => ds.length))
});

const timeLabels = computed(() => {
    return useTimeLabels({
        values: FINAL_CONFIG.value.style.chart.layout.grid.xAxis.dataLabels.values,
        maxDatapoints: maxLength.value,
        formatter: FINAL_CONFIG.value.style.chart.layout.grid.xAxis.dataLabels.datetimeFormatter,
        start: slicer.value.start,
        end: slicer.value.end
    });
});

const slit = computed(() => {
    return svg.value.width / (slicer.value.end - slicer.value.start);
});

const drawableDataset = computed(() => {
    const arr = [];
    for(let i = 0; i < (slicer.value.end - slicer.value.start); i += 1) {
        const values = mutableDataset.value
            .map(ds => ds.values[i] ?? null)
        const allValuesAreNull = values.filter(v => [undefined, null].includes(v)).length === values.length;
        const subtotal = values.reduce((a, b) => a + b, 0);
        const percentages = values.map(v => v / subtotal);
        const x = svg.value.left + (slit.value * i) + slit.value / 2;
        arr.push({
            index: i,
            percentages,
            subtotal : allValuesAreNull || subtotal < 0 ? null : subtotal,
            values,
            x,
        });
    }
    
    const minSubtotal = 0;
    const maxSubtotal = Math.max(...arr.map(a => a.subtotal))
    const maxScale = arr.length === 1 ? maxSubtotal * 2 : maxSubtotal;
    
    return arr.map((a, i) => {
        const radiusReference = Math.min(svg.value.width / 24, (slit.value / 2) * 0.7);
        const radius = radiusReference > svg.value.width / 16 ? svg.value.width / 16 : radiusReference;
        const activeRadius = hoveredIndex.value === a.index ? svg.value.width / 16 : radius;
        const hoverRadius = arr.length > 4 ? radiusReference * 2 : radiusReference * 2 > (slit.value / 2 * 0.7) ? slit.value / 2 * 0.7 : radiusReference * 2
        const y = svg.value.bottom - (svg.value.height * a.subtotal / calculateNiceScale(minSubtotal, maxScale, FINAL_CONFIG.value.style.chart.layout.grid.yAxis.dataLabels.steps).max);
        return {
            ...a,
            y,
            radius,
            activeRadius,
            hoverRadius,
            donut: makeDonut({
                series: mutableDataset.value.map((s, k) => {
                    return {
                        color: s.color,
                        name: s.name,
                        value: s.values[i] ?? 0
                    }
                })
            }, a.x, y, radius, radius, 1.99999, 2, 1, 360, 105.25, radius / 2),
            donutHover: makeDonut({
                series: mutableDataset.value.map((s, k) => {
                    return {
                        color: s.color,
                        name: s.name,
                        value: s.values[i] ?? 0
                    }
                })
            }, a.x, y, hoverRadius, hoverRadius, 1.99999, 2, 1, 360, 105.25, hoverRadius / 2),
            donutFocus: makeDonut({
                series: mutableDataset.value.map((s, k) => {
                    return {
                        color: s.color,
                        name: s.name,
                        value: s.values[i] ?? 0
                    }
                })
            }, svg.value.centerX, svg.value.centerY, svg.value.height / 3.6, svg.value.height / 3.6, 1.99999, 2, 1, 360, 105.25, svg.value.height / 6),
        }
    })
});

function labellizeValue(val, datapoint, index) {
    return applyDataLabel(
        FINAL_CONFIG.value.style.chart.layout.dataLabels.formatter,
        val,
        dataLabel({
            p: FINAL_CONFIG.value.style.chart.layout.dataLabels.prefix,
            v: val,
            s: FINAL_CONFIG.value.style.chart.layout.dataLabels.suffix,
            r: FINAL_CONFIG.value.style.chart.layout.dataLabels.rounding
        }),
        { datapoint, index }
    );
}

const extremes = computed(() => {
    return {
        max: Math.max(...drawableDataset.value.map(ds => ds.subtotal)),
        min: 0
    }
});

const niceScale = computed(() => {
    const maxScale = drawableDataset.value.length === 1 ? extremes.value.max * 2 : extremes.value.max
    return calculateNiceScale(extremes.value.min, maxScale, FINAL_CONFIG.value.style.chart.layout.grid.yAxis.dataLabels.steps)
})

function ratioToMax(value) {
    return value / niceScale.value.max;
}

const yLabels = computed(() => {
    return niceScale.value.ticks.map(t => {
        return {
            y: svg.value.bottom - (svg.value.height * ratioToMax(t)),
            value: t
        }
    })
});

function displayArcPercentage(arc, stepBreakdown) {
    return isNaN(arc.value / sumByAttribute(stepBreakdown, 'value')) ? 0 : ((arc.value / sumByAttribute(stepBreakdown, "value")) * 100).toFixed(0) + "%";
}

function leave(datapoint) {
    hoveredIndex.value = null;
    hoveredDatapoint.value = null;
    if (FINAL_CONFIG.value.events.datapointLeave) {
        FINAL_CONFIG.value.events.datapointLeave({ datapoint, seriesIndex: datapoint.seriesIndex + slicer.value.start });
    }
}

function enter(datapoint) {
    if (FINAL_CONFIG.value.events.datapointEnter) {
        FINAL_CONFIG.value.events.datapointEnter({ datapoint, seriesIndex: datapoint.index + slicer.value.start })
    }
    hoveredIndex.value = datapoint.index;
    hoveredDatapoint.value = datapoint;
}

const fixedDatapointIndex = ref(null);

function fixDatapoint(datapoint, index) {
    if (FINAL_CONFIG.value.events.datapointClick) {
        FINAL_CONFIG.value.events.datapointClick({ datapoint, seriesIndex: datapoint.index + slicer.value.start });
    }

    if(!datapoint.subtotal || !FINAL_CONFIG.value.style.chart.dialog.show) return;
    hoveredDatapoint.value = null;
    hoveredIndex.value = null;
    isFixed.value = true;
    fixedDatapoint.value = datapoint;
    createDonutDatasetForDialog(datapoint);
    if(![null, undefined].includes(index)) {
        fixedDatapointIndex.value = index;
    }
}

const legendSet = computed(() => {
    return convertedDataset.value
        .map((serie, i) => {
            return {
                name: serie.name,
                value: serie.values.slice(slicer.value.start, slicer.value.end).reduce((a,b) => a + b, 0),
                shape: 'circle',
                uid: serie.uid,
                color: serie.color
            }
        })
        .sort((a,b) => b.value - a.value)
        .map((el) => {
            return {
                ...el,
                opacity: segregated.value.includes(el.uid) ? 0.5 : 1,
                segregate: () => segregate(el.uid),
                isSegregated: segregated.value.includes(el.uid)
            }
        })
});

const grandTotal = computed(() => {
    return drawableDataset.value.map(ds => ds.subtotal).reduce((a,b) => a + b, 0)
})

const legendConfig = computed(() => {
    return {
        cy: 'donut-div-legend',
        backgroundColor: FINAL_CONFIG.value.style.chart.legend.backgroundColor,
        color: FINAL_CONFIG.value.style.chart.legend.color,
        fontSize: FINAL_CONFIG.value.style.chart.legend.fontSize,
        paddingBottom: 12,
        fontWeight: FINAL_CONFIG.value.style.chart.legend.bold ? 'bold' : ''
    }
});

function segregate(id) {
    if(segregated.value.includes(id)) {
        segregated.value = segregated.value.filter(s => s !== id);
        emit('selectLegend', null)
    }else {
        if(segregated.value.length === convertedDataset.value.length - 1) return;
        segregated.value.push(id);
        emit('selectLegend', convertedDataset.value.find(d => d.uid === id));
    }
    if(fixedDatapoint.value) {
        fixDatapoint(drawableDataset.value.find((_, i) => i === fixedDatapointIndex.value))
    }
}

const table = computed(() => {
    const head = [''].concat(convertedDataset.value.filter(ds => !segregated.value.includes(ds.uid)).map(ds => {
        return {
            name: ds.name,
            color: ds.color
        }
    })).concat(['Σ']);
    let body = [];

    for(let i = 0; i < maxLength.value; i += 1) {
        const sum = convertedDataset.value.filter(ds => !segregated.value.includes(ds.uid)).map(ds => {
            return ds.values[i] ?? 0
        }).reduce((a, b) => a + b, 0);

        body.push([timeLabels[i] ? timeLabels[i].text : '-'].concat(convertedDataset.value.filter(ds => !segregated.value.includes(ds.uid)).map(ds => {
            return {
                value: ds.values[i] ?? 0,
                percentage: ds.values[i] ? ds.values[i] / sum * 100 : 0
            }
        })).concat([`${FINAL_CONFIG.value.style.chart.layout.dataLabels.prefix}${Number(sum.toFixed(FINAL_CONFIG.value.table.td.roundingValue))}${FINAL_CONFIG.value.style.chart.layout.dataLabels.suffix}`]))

    }

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
        FINAL_CONFIG.value.table.columnNames.period
    ].concat(convertedDataset.value.filter(ds => !segregated.value.includes(ds.uid)).map(ds => ds.name)).concat(FINAL_CONFIG.value.table.columnNames.total)

    return { head, body, config, colNames };
});

function getData() {
    return convertedDataset.value;
}

function generateCsv(callback=null) {
    nextTick(() => {
        const title = [[FINAL_CONFIG.value.style.chart.title.text],[FINAL_CONFIG.value.style.chart.title.subtitle.text],[""]];
        const head = [...table.value.head.map(h => h.name ?? h)];
        const body = [...table.value.body.map(b => {
            return b.map(t => t.value ?? t)
        })];
        const tableXls = title.concat([head]).concat(body);
        const csvContent = createCsvContent(tableXls);

        if(!callback) {
            downloadCsv({ csvContent, title: FINAL_CONFIG.value.style.chart.title.text || "vue-ui-donut-evolution"});
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

const isAnnotator = ref(false);
function toggleAnnotator() {
    isAnnotator.value = !isAnnotator.value;
}

function isArcBigEnoughHover(arc) {
    return arc.proportion * 100 > FINAL_CONFIG.value.style.chart.donuts.hover.hideLabelsUnderValue;
}

const donutDataset = ref([]);
const donutConfig = ref({});
const dialog = ref(null);

function createDonutDatasetForDialog(ds) {
    donutDataset.value = ds.donut.map(ds => {
        return {
            name: ds.name,
            values: [ds.value],
            color: ds.color
        }
    });

    donutConfig.value = deepEmptyObjectToNull({
        ...FINAL_CONFIG.value.style.chart.dialog.donutChart,
        responsive: true,
        theme: FINAL_CONFIG.value.theme,
    });

    dialog.value && dialog.value.open();
}

async function getImage({ scale = 2} = {}) {
    if (!donutEvolutionChart.value) return;
    const { width, height } = donutEvolutionChart.value.getBoundingClientRect();
    const aspectRatio = width / height;
    const { imageUri, base64 } = await img({ domElement: donutEvolutionChart.value, base64: true, img: true, scale})
    return { 
        imageUri, 
        base64, 
        title: FINAL_CONFIG.value.style.chart.title.text,
        width,
        height,
        aspectRatio
    }
}

const WIDTH = computed(() => defaultSizes.value.width);
const HEIGHT = computed(() => defaultSizes.value.height);

useTimeLabelCollision({
    timeLabelsEls,
    timeLabels,
    slicer,
    configRef: FINAL_CONFIG,
    rotationPath: ['style', 'chart', 'layout', 'grid', 'xAxis', 'dataLabels', 'rotation'],
    autoRotatePath: ['style', 'chart', 'layout', 'grid', 'xAxis', 'dataLabels', 'autoRotate', 'enable'],
    isAutoSize: false,
    width: WIDTH,
    height: HEIGHT,
    rotation: FINAL_CONFIG.value.style.chart.layout.grid.xAxis.dataLabels.autoRotate.angle
});

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
    <div ref="donutEvolutionChart" :class="`vue-ui-donut-evolution ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''} ${FINAL_CONFIG.useCssAnimation ? '' : 'vue-ui-dna'}`" :style="`font-family:${FINAL_CONFIG.style.fontFamily};width:100%; text-align:center;background:${FINAL_CONFIG.style.chart.backgroundColor}`" :id="uid" @mouseenter="() => setUserOptionsVisibility(true)" @mouseleave="() => setUserOptionsVisibility(false)">
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

        <div ref="chartTitle" v-if="FINAL_CONFIG.style.chart.title.text" :style="`width:100%;background:transparent;padding-bottom:24px`" @mouseleave="leave">
            <!-- TITLE AS DIV -->
            <Title
                :key="`title_${titleStep}`"
                :config="{
                    title: {
                        cy: 'donut-evolution-div-title',
                        ...FINAL_CONFIG.style.chart.title
                    },
                    subtitle: {
                        cy: 'donut-evolution-div-subtitle',
                        ...FINAL_CONFIG.style.chart.title.subtitle
                    }
                }"
            />
        </div>

        <div :id="`legend-top-${uid}`" />

        <UserOptions
            ref="details"
            :key="`user_options_${step}`"
            v-if="FINAL_CONFIG.userOptions.show && isDataset && (keepUserOptionState ? true : userOptionsVisible)"
            :backgroundColor="FINAL_CONFIG.style.chart.backgroundColor"
            :color="FINAL_CONFIG.style.chart.color"
            :isPrinting="isPrinting"
            :isImaging="isImaging"
            :uid="uid"
            :hasPdf="FINAL_CONFIG.userOptions.buttons.pdf"
            :hasImg="FINAL_CONFIG.userOptions.buttons.img"
            :hasXls="FINAL_CONFIG.userOptions.buttons.csv"
            :hasTable="FINAL_CONFIG.userOptions.buttons.table"
            :hasFullscreen="FINAL_CONFIG.userOptions.buttons.fullscreen"
            :isFullscreen="isFullscreen"
            :titles="{ ...FINAL_CONFIG.userOptions.buttonTitles }"
            :chartElement="donutEvolutionChart"
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
            data-cy="donut-evolution-svg" 
            :viewBox="`0 0 ${svg.absoluteWidth} ${svg.absoluteHeight}`" 
            :style="`max-width:100%; overflow: visible; background:transparent;color:${FINAL_CONFIG.style.chart.color};`"
        >
            <PackageVersion />

            <!-- BACKGROUND SLOT -->
            <foreignObject 
                v-if="$slots['chart-background']"
                :x="svg.left"
                :y="svg.top"
                :width="svg.width"
                :height="svg.height"
                :style="{
                    pointerEvents: 'none'
                }"
            >
                <slot name="chart-background"/>
            </foreignObject>

            <defs>
                <linearGradient :id="`hover_${uid}`" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" :stop-color="setOpacity(FINAL_CONFIG.style.chart.backgroundColor, FINAL_CONFIG.style.chart.layout.highlighter.opacity)"/>
                    <stop offset="100%" :stop-color="setOpacity(FINAL_CONFIG.style.chart.layout.highlighter.color, FINAL_CONFIG.style.chart.layout.highlighter.opacity)"/>
                </linearGradient>

                <radialGradient :id="`focus_${uid}`">
                    <stop offset="0%" :stop-color="setOpacity(convertColorToHex(FINAL_CONFIG.style.chart.backgroundColor), 0)" />
                    <stop offset="77%" :stop-color="setOpacity('#FFFFFF', 30)" />
                    <stop offset="100%" :stop-color="setOpacity(convertColorToHex(FINAL_CONFIG.style.chart.backgroundColor), 0)" />
                </radialGradient>
            </defs>
            

            <!-- GRID -->
            <g v-if="FINAL_CONFIG.style.chart.layout.grid.show">
                <line
                    data-cy="axis-y"
                    :x1="svg.left" 
                    :x2="svg.left" 
                    :y1="svg.top" 
                    :y2="svg.top + svg.height" 
                    :stroke="FINAL_CONFIG.style.chart.layout.grid.stroke" 
                    :stroke-width="FINAL_CONFIG.style.chart.layout.grid.strokeWidth" 
                    stroke-linecap="round"
                />

                <line 
                    data-cy="axis-x"
                    :x1="svg.left" 
                    :x2="svg.right" 
                    :y1="svg.bottom" 
                    :y2="svg.bottom" 
                    :stroke="FINAL_CONFIG.style.chart.layout.grid.stroke" 
                    :stroke-width="FINAL_CONFIG.style.chart.layout.grid.strokeWidth" 
                    stroke-linecap="round" 
                />

                <g v-if="FINAL_CONFIG.style.chart.layout.grid.showVerticalLines">
                    <line
                        data-cy="vertical-separator"
                        v-for="(l, i) in (slicer.end - slicer.start)" 
                        :x1="svg.left + ((i +1 ) * slit)" 
                        :x2="svg.left + ((i +1) * slit)" 
                        :y1="svg.top" 
                        :y2="svg.bottom" 
                        :stroke="FINAL_CONFIG.style.chart.layout.grid.stroke" 
                        :stroke-width="FINAL_CONFIG.style.chart.layout.grid.strokeWidth" 
                        stroke-linecap="round"
                    />
                </g>
            </g>

            <!-- AXIS LABELS -->
            <g>
                <text ref="yAxisLabel" data-cy="xy-axis-yLabel"
                    v-if="FINAL_CONFIG.style.chart.layout.grid.axis.yLabel"
                    :font-size="FINAL_CONFIG.style.chart.layout.grid.axis.fontSize" 
                    :fill="FINAL_CONFIG.style.chart.layout.grid.axis.color"
                    :transform="`translate(${FINAL_CONFIG.style.chart.layout.grid.axis.fontSize}, ${svg.top + svg.height / 2}) rotate(-90)`"
                    text-anchor="middle" style="transition: none">
                    {{ FINAL_CONFIG.style.chart.layout.grid.axis.yLabel }}
                </text>
                <text ref="xAxisLabel" data-cy="xy-axis-xLabel"
                    v-if="FINAL_CONFIG.style.chart.layout.grid.axis.xLabel" text-anchor="middle"
                    :x="svg.absoluteWidth / 2"
                    :y="svg.absoluteHeight - 3"
                    :font-size="FINAL_CONFIG.style.chart.layout.grid.axis.fontSize" :fill="FINAL_CONFIG.style.chart.layout.grid.axis.color">
                    {{ FINAL_CONFIG.style.chart.layout.grid.axis.xLabel }}
                </text>
            </g>

            <!-- Y LABELS -->
            <g ref="scaleLabels" v-if="FINAL_CONFIG.style.chart.layout.grid.yAxis.dataLabels.show" :class="{'donut-opacity': true, 'donut-behind': hoveredIndex !== null}">
                <g v-for="(yLabel, i) in yLabels">
                    <line 
                        data-cy="axis-y-tick"
                        v-if="yLabel.value >= niceScale.min && yLabel.value <= niceScale.max"
                        :x1="svg.left" 
                        :x2="svg.left - 5" 
                        :y1="yLabel.y" 
                        :y2="yLabel.y" 
                        :stroke="FINAL_CONFIG.style.chart.layout.grid.stroke" 
                        :stroke-width="FINAL_CONFIG.style.chart.layout.grid.strokeWidth" 
                    />
                    <text
                        data-cy="axis-y-label"
                        v-if="yLabel.value >= niceScale.min && yLabel.value <= niceScale.max" 
                        :x="svg.left" 
                        :y="yLabel.y + FINAL_CONFIG.style.chart.layout.grid.yAxis.dataLabels.fontSize / 3" 
                        :font-size="FINAL_CONFIG.style.chart.layout.grid.yAxis.dataLabels.fontSize" 
                        text-anchor="end"
                        :fill="FINAL_CONFIG.style.chart.layout.grid.yAxis.dataLabels.color"
                        :font-weight="FINAL_CONFIG.style.chart.layout.grid.yAxis.dataLabels.bold ? 'bold' : 'normal'"
                    >
                        {{ canShowValue(yLabel.value) ? applyDataLabel(
                            FINAL_CONFIG.style.chart.layout.dataLabels.formatter,
                            yLabel.value,
                            dataLabel({
                                p: FINAL_CONFIG.style.chart.layout.dataLabels.prefix,
                                v: yLabel.value,
                                s: FINAL_CONFIG.style.chart.layout.dataLabels.suffix,
                                r: FINAL_CONFIG.style.chart.layout.grid.yAxis.dataLabels.roundingValue
                            }),
                            { datapoint: yLabel, seriesIndex: i }
                        ) : '' 
                        }}
                    </text>
                </g>
            </g>

            <!-- X LABELS -->
            <g ref="timeLabelsEls" v-if="FINAL_CONFIG.style.chart.layout.grid.xAxis.dataLabels.show" :class="{'donut-opacity': true,}">
                <g v-for="(_, i) in (slicer.end - slicer.start)">
                    <g v-if="((FINAL_CONFIG.style.chart.layout.grid.xAxis.dataLabels.showOnlyFirstAndLast && (i === 0 || i === maxLength - 1)) || !FINAL_CONFIG.style.chart.layout.grid.xAxis.dataLabels.showOnlyFirstAndLast) && timeLabels[i] && timeLabels[i].text">
                        <!-- SINGLE LINE -->
                        <text
                            class="vue-data-ui-time-label"
                            v-if="!String(timeLabels[i].text).includes('\n')"
                            data-cy="axis-x-label"
                            :text-anchor="FINAL_CONFIG.style.chart.layout.grid.xAxis.dataLabels.rotation > 0 ? 'start' : FINAL_CONFIG.style.chart.layout.grid.xAxis.dataLabels.rotation < 0 ? 'end' : 'middle'"
                            :font-size="FINAL_CONFIG.style.chart.layout.grid.xAxis.dataLabels.fontSize"
                            :fill="FINAL_CONFIG.style.chart.layout.grid.xAxis.dataLabels.color"
                            :transform="`translate(${svg.left + (slit * i) + (slit / 2)}, ${svg.bottom + FINAL_CONFIG.style.chart.layout.grid.xAxis.dataLabels.fontSize + FINAL_CONFIG.style.chart.layout.grid.xAxis.dataLabels.offsetY}), rotate(${FINAL_CONFIG.style.chart.layout.grid.xAxis.dataLabels.rotation})`"
    
                        >
                            {{ timeLabels[i].text || '' }}
                        </text>
                        <!-- MULTILINE -->
                        <text
                            v-else
                            class="vue-data-ui-time-label"
                            data-cy="axis-x-label"
                            :text-anchor="FINAL_CONFIG.style.chart.layout.grid.xAxis.dataLabels.rotation > 0 ? 'start' : FINAL_CONFIG.style.chart.layout.grid.xAxis.dataLabels.rotation < 0 ? 'end' : 'middle'"
                            :font-size="FINAL_CONFIG.style.chart.layout.grid.xAxis.dataLabels.fontSize"
                            :fill="FINAL_CONFIG.style.chart.layout.grid.xAxis.dataLabels.color"
                            :transform="`translate(${svg.left + (slit * i) + (slit / 2)}, ${svg.bottom + FINAL_CONFIG.style.chart.layout.grid.xAxis.dataLabels.fontSize + FINAL_CONFIG.style.chart.layout.grid.xAxis.dataLabels.offsetY}), rotate(${FINAL_CONFIG.style.chart.layout.grid.xAxis.dataLabels.rotation})`"
                            v-html="createTSpansFromLineBreaksOnX({
                                content: String(timeLabels[i].text),
                                fontSize: FINAL_CONFIG.style.chart.layout.grid.xAxis.dataLabels.fontSize,
                                fill: FINAL_CONFIG.style.chart.layout.grid.xAxis.dataLabels.color,
                                x: 0,
                                y: 0
                            })"
                        />
                    </g>
                </g>
            </g>
            
            <!-- DATAPOINTS -->
            <g v-for="(datapoint, i ) in drawableDataset">
                <line
                    :class="{'donut-opacity': true, 'donut-behind': hoveredIndex !== null}"
                    v-if="FINAL_CONFIG.style.chart.layout.line.show && i < drawableDataset.length - 1 && ![datapoint.subtotal, drawableDataset[i + 1].subtotal].includes(null)"
                    :x1="datapoint.x"
                    :y1="datapoint.y"
                    :x2="drawableDataset[i + 1].x"
                    :y2="drawableDataset[i + 1].y"
                    :stroke="FINAL_CONFIG.style.chart.layout.line.stroke"
                    :stroke-width="FINAL_CONFIG.style.chart.layout.line.strokeWidth"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
                <g v-if="datapoint.subtotal !== null">
                    <circle
                        v-if="datapoint.subtotal"
                        :cx="datapoint.x"
                        :cy="datapoint.y"
                        :r="datapoint.activeRadius"
                        :fill="FINAL_CONFIG.style.chart.backgroundColor"
                    />
                </g>
            </g>

            <g v-for="(datapoint, i ) in drawableDataset" :data-cy="`donut-wrapper-${i}`" :class="{'donut-opacity': true, 'donut-behind': (i !== hoveredIndex && hoveredIndex !== null)}">
                <g v-if="datapoint.subtotal">
                    <g v-if="hoveredIndex !== null && hoveredIndex === i">
                        <g v-for="arc in datapoint.donutHover">
                            <path
                                v-if="isArcBigEnoughHover(arc)"
                                :data-cy="`donut_hover_${i}`"
                                :d="calcNutArrowPath(arc, {x: arc.center.endX, y: arc.center.endY}, 12, 12, { x: datapoint.x, y: datapoint.y}, false, 20)"
                                :stroke="arc.color"
                                stroke-width="1"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                fill="none"
                            />
                        </g>
                        <!-- DATALABELS (hovered datapoint) -->
                        <g v-for="(arc, i) in datapoint.donutHover">
                            <text
                                v-if="isArcBigEnoughHover(arc)"
                                :data-cy="`donut-datalabel-value-${i}`"
                                data-cy-hover-label
                                :text-anchor="calcMarkerOffsetX(arc, true, 0).anchor"
                                :x="calcMarkerOffsetX(arc, true, 9).x"
                                :y="calcMarkerOffsetY(arc, 14, 10)"
                                :fill="FINAL_CONFIG.style.chart.layout.grid.yAxis.dataLabels.color"
                                :font-size="8"
                                :font-weight="'bold'"
                            >
                            {{ arc.name}}: {{ displayArcPercentage(arc, datapoint.donut)  }} ({{ arc.value === null ? '-' : labellizeValue(arc.value, arc, i) }})
                            </text>
                        </g>
                        <g>
                            <circle
                                :cx="datapoint.x"
                                :cy="datapoint.y"
                                :r="datapoint.hoverRadius"
                                :fill="FINAL_CONFIG.style.chart.backgroundColor"
                            />
                        </g>
                    </g>
                </g>
            </g>
            <g v-for="(datapoint, i ) in drawableDataset" :class="{'donut-opacity': true, 'donut-behind': (i !== hoveredIndex && hoveredIndex !== null)}">
                <g v-if="datapoint.subtotal !== null">
                    <circle 
                        v-if="datapoint.subtotal === 0"
                        :cx="datapoint.x"
                        :cy="datapoint.y"
                        :r="3"
                        :fill="FINAL_CONFIG.style.chart.color"
                    />
                    <g v-else-if="hoveredIndex !== null && hoveredIndex === i">
                        <path 
                            v-for="(arc, k) in datapoint.donutHover"
                            :d="arc.arcSlice"
                            :fill="`${arc.color}`"
                            :stroke-width="1"
                            :stroke="FINAL_CONFIG.style.chart.backgroundColor"
                        />
                    </g>
                    <g v-else>
                        <path
                        :data-cy="`arc_${i}`"
                            v-for="(arc, k) in datapoint.donut"
                            :d="arc.arcSlice"
                            :fill="`${arc.color}`"
                            :stroke-width="0.5"
                            :stroke="FINAL_CONFIG.style.chart.backgroundColor"
                        />
                    </g>
                </g>
            </g>

            <!-- DATALABELS -->
            <g v-for="(datapoint, i ) in drawableDataset" :class="{'donut-opacity': true, 'donut-behind': (i !== hoveredIndex && hoveredIndex !== null) || (isFixed && i !== fixedDatapoint.index)}">
                <text 
                    v-if="datapoint.subtotal !== null && FINAL_CONFIG.style.chart.layout.dataLabels.show"
                    text-anchor="middle"
                    :x="datapoint.x"
                    :y="hoveredIndex === datapoint.index && datapoint.subtotal ? datapoint.y + FINAL_CONFIG.style.chart.layout.dataLabels.fontSize / 3 : datapoint.y - datapoint.radius - FINAL_CONFIG.style.chart.layout.dataLabels.fontSize + FINAL_CONFIG.style.chart.layout.dataLabels.offsetY"
                    :font-size="FINAL_CONFIG.style.chart.layout.dataLabels.fontSize"
                    :font-weight="'bold'"
                    :fill="FINAL_CONFIG.style.chart.layout.dataLabels.color"
                >
                    {{ labellizeValue(datapoint.subtotal, datapoint, i) }}
                </text>
            </g>

            <!-- TRAPS -->
            <rect 
                v-for="(datapoint, i) in drawableDataset"
                :x="svg.left + (i * slit)"
                :y="svg.top"
                :width="slit"
                :height="svg.height"
                :fill="[hoveredIndex, fixedDatapointIndex].includes(datapoint.index) ? `url(#hover_${uid})` : 'transparent'"
                :class="{'donut-hover': datapoint.subtotal && [hoveredIndex, fixedDatapointIndex].includes(datapoint.index)}"
                :style="{
                    pointerEvents: 'none'
                }"
            />
            <rect 
                v-for="(datapoint, i) in drawableDataset"
                :data-cy="`trap-${i}`"
                data-cy-trap
                :x="svg.left + (i * slit)"
                :y="svg.top"
                :width="slit"
                :height="svg.height"
                fill="transparent"
                @mouseenter="enter(datapoint)"
                @mouseleave="leave(datapoint)"
                @click="fixDatapoint(datapoint, i)"
                :class="{'donut-hover': hoveredIndex === datapoint.index && datapoint.subtotal}"
            />
            <slot name="svg" :svg="svg"/>
        </svg>

        <div v-if="$slots.watermark" class="vue-data-ui-watermark">
            <slot name="watermark" v-bind="{ isPrinting: isPrinting || isImaging }"/>
        </div>

        <div ref="chartSlicer" :style="`width:100%;background:${FINAL_CONFIG.style.chart.backgroundColor}`" data-dom-to-png-ignore>
            <Slicer
                ref="slicerComponent"
                v-if="maxLength > 1 && FINAL_CONFIG.style.chart.zoom.show"
                :key="`slicer_${slicerStep}`"
                :background="FINAL_CONFIG.style.chart.zoom.color"
                :borderColor="FINAL_CONFIG.style.chart.backgroundColor"
                :fontSize="FINAL_CONFIG.style.chart.zoom.fontSize"
                :useResetSlot="FINAL_CONFIG.style.chart.zoom.useResetSlot"
                :labelLeft="timeLabels[0] ? timeLabels[0].text : ''"
                :labelRight="timeLabels.at(-1) ? timeLabels.at(-1).text : ''"
                :textColor="FINAL_CONFIG.style.chart.color"
                :inputColor="FINAL_CONFIG.style.chart.zoom.color"
                :selectColor="FINAL_CONFIG.style.chart.zoom.highlightColor"
                :max="maxLength"
                :min="0"
                :valueStart="slicer.start"
                :valueEnd="slicer.end"
                v-model:start="slicer.start"
                v-model:end="slicer.end"
                :refreshStartPoint="FINAL_CONFIG.style.chart.zoom.startIndex !== null ? FINAL_CONFIG.style.chart.zoom.startIndex : 0"
                :refreshEndPoint="FINAL_CONFIG.style.chart.zoom.endIndex !== null ? FINAL_CONFIG.style.chart.zoom.endIndex + 1 : maxLength"
                :enableRangeHandles="FINAL_CONFIG.style.chart.zoom.enableRangeHandles"
                :enableSelectionDrag="FINAL_CONFIG.style.chart.zoom.enableSelectionDrag"
                @reset="refreshSlicer"
            >
                <template #reset-action="{ reset }">
                    <slot name="reset-action" v-bind="{ reset }"/>
                </template>
            </Slicer>
        </div>

        <div :id="`legend-bottom-${uid}`" />

        <!-- LEGEND -->
        <Teleport v-if="readyTeleport" :to="FINAL_CONFIG.style.chart.legend.position === 'top' ? `#legend-top-${uid}` : `#legend-bottom-${uid}`">
            <div ref="chartLegend">
                <Legend
                    v-if="FINAL_CONFIG.style.chart.legend.show"
                    :key="`legend_${legendStep}`"
                    :legendSet="legendSet"
                    :config="legendConfig"
                    @clickMarker="({legend}) => segregate(legend.uid)"
                >
                    <template #item="{legend, index}">
                        <div data-cy="legend-item" @click="segregate(legend.uid)" :style="`opacity:${segregated.includes(legend.uid) ? 0.5 : 1}`">
                            {{ legend.name }}{{ FINAL_CONFIG.style.chart.legend.showPercentage || FINAL_CONFIG.style.chart.legend.showValue ? ':' : ''}} {{ !FINAL_CONFIG.style.chart.legend.showValue ? '' : applyDataLabel(
                                FINAL_CONFIG.style.chart.layout.dataLabels.formatter,
                                legend.value,
                                dataLabel({
                                    p: FINAL_CONFIG.style.chart.layout.dataLabels.prefix,
                                    v: legend.value,
                                    s: FINAL_CONFIG.style.chart.layout.dataLabels.suffix,
                                    r: FINAL_CONFIG.style.chart.legend.roundingValue
                                }),
                                { datapoint: legend, seriesIndex: index }
                                ) 
                            }}
                            {{ 
                                !FINAL_CONFIG.style.chart.legend.showPercentage ? '' :
                                !segregated.includes(legend.uid)
                                    ? `${FINAL_CONFIG.style.chart.legend.showValue ? '(' : ''}${isNaN(legend.value / grandTotal) ? '-' : dataLabel({
                                    v: legend.value / grandTotal * 100,
                                    s: '%',
                                    r: FINAL_CONFIG.style.chart.legend.roundingPercentage
                                })}${FINAL_CONFIG.style.chart.legend.showValue ? ')' : ''}`
                                    : `${FINAL_CONFIG.style.chart.legend.showValue ? '(' : ''}- %${FINAL_CONFIG.style.chart.legend.showValue ? ')' : ''}`
                            }}
                        </div>
                    </template>
                </Legend>
        
                <slot name="legend" v-bind:legend="legendSet"></slot>
            </div>
        </Teleport>

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
                    :colNames="table.colNames"
                    :head="table.head" 
                    :body="table.body" 
                    :config="table.config" 
                    :title="`${FINAL_CONFIG.style.chart.title.text}${FINAL_CONFIG.style.chart.title.subtitle.text ? ` : ${FINAL_CONFIG.style.chart.title.subtitle.text}` : ''}`"
                    @close="mutableConfig.showTable = false"
                >
                    <template #th="{th}">
                        {{ th.name ?? th }}
                    </template>
                    <template #td="{td}">
                        <span v-if="td.value === null">-</span>
                        <b v-else>
                            {{ !isNaN(td.value) ? FINAL_CONFIG.style.chart.layout.dataLabels.prefix : '' }}{{ !isNaN(td.value) && td.value !== null ? Number(td.value.toFixed(FINAL_CONFIG.table.td.roundingValue)).toLocaleString() : td }}{{ !isNaN(td.value) ? FINAL_CONFIG.style.chart.layout.dataLabels.suffix : '' }} 
                        </b>
                        <span>
                            {{ td.percentage && !isNaN(td.percentage) ? `(${Number(td.percentage.toFixed(FINAL_CONFIG.table.td.roundingPercentage)).toLocaleString()}%)` : '' }}
                        </span>
                    </template>
                </DataTable>
            </template>
        </Accordion>

        <BaseDraggableDialog 
            v-if="FINAL_CONFIG.style.chart.dialog.show" 
            ref="dialog" 
            @close="fixedDatapoint = null; isFixed = false; hoveredDatapoint = null; hoveredIndex = null; fixedDatapointIndex = null"
            :backgroundColor="FINAL_CONFIG.style.chart.dialog.backgroundColor"
            :color="FINAL_CONFIG.style.chart.dialog.color"
            :headerBg="FINAL_CONFIG.style.chart.dialog.header.backgroundColor"
            :headerColor="FINAL_CONFIG.style.chart.dialog.header.color"
            :isFullscreen="isFullscreen"
            :fullscreenParent="donutEvolutionChart"
        >
            <template #title>
                {{ timeLabels[Number(fixedDatapoint.index)] ? timeLabels[Number(fixedDatapoint.index)].text: '' }}
            </template>
            <VueUiDonut 
                v-if="fixedDatapoint" 
                :config="donutConfig" 
                :dataset="donutDataset" 
            />
        </BaseDraggableDialog>

        <!-- v3 Skeleton loader -->
        <BaseScanner v-if="loading" />
    </div>
</template>

<style scoped>
@import "../vue-data-ui.css";

.vue-ui-donut-evolution *{
    transition: unset;
    transition: opacity 0.5s ease-in-out;
}
.vue-ui-donut-evolution {
    user-select: none;
    position: relative;
}

.vue-ui-donut-evolution-focus {
    animation: donut 0.5s ease-in-out;
    transform-origin: center;
}

.donut-hover {
    cursor: pointer;
}

.donut-opacity {
    transition: opacity 0.2s ease-in-out;
}
.donut-behind {
    opacity: 0.1;
}

@keyframes donut {
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

.vue-ui-donut-evolution-dialog * {
    animation: dialog-pop 0.1s ease-in !important;
    transform-origin: center !important;
}

@keyframes dialog-pop {
    0% {
        transform: scale(0.8,0.8);
        opacity: 0;
    }
    90% {
        transform: scale(1.05, 1.05);
        opacity: 1;
    }
    100% {
        transform: scale(1,1);
        opacity: 1;
    }
}

</style>