<script setup>
import { 
    computed, 
    defineAsyncComponent, 
    nextTick, 
    onBeforeUnmount, 
    ref, 
    shallowRef, 
    toRefs,
    watch, 
    watchEffect, 
} from "vue";
import {
    adaptColorToBackground,
    applyDataLabel,
    convertColorToHex,
    convertCustomPalette,
    createCsvContent,
    createSmoothAreaSegments,
    createSmoothPath,
    createStraightPath,
    createTSpansFromLineBreaksOnX,
    createUid,
    dataLabel,
    deepEmptyObjectToNull,
    downloadCsv,
    error,
    getMissingDatasetAttributes,
    getPathLengthFromCoordinates,
    objectIsEmpty,
    palette,
    slugify,
    themePalettes,
    treeShake,
    XMLNS
} from "../lib";
import { throttle } from "../canvas-lib";
import { useConfig } from "../useConfig";
import { useLoading } from "../useLoading";
import { usePrinter } from "../usePrinter";
import { useSvgExport } from "../useSvgExport";
import { useResponsive } from "../useResponsive";
import { useNestedProp } from "../useNestedProp";
import { useTimeLabels } from "../useTimeLabels";
import { useUserOptionState } from "../useUserOptionState";
import { useChartAccessibility } from "../useChartAccessibility";
import { useTimeLabelCollision } from "../useTimeLabelCollider";
import themes from "../themes.json";
import Legend from "../atoms/Legend.vue";
import Title from "../atoms/Title.vue";
import Shape from "../atoms/Shape.vue";
import img from "../img";
import BaseScanner from "../atoms/BaseScanner.vue";

const VueUiXy = defineAsyncComponent(() => import('./vue-ui-xy.vue'));
const BaseIcon = defineAsyncComponent(() => import('../atoms/BaseIcon.vue'));
const Accordion = defineAsyncComponent(() => import('./vue-ui-accordion.vue'));
const DataTable = defineAsyncComponent(() => import('../atoms/DataTable.vue'));
const PenAndPaper = defineAsyncComponent(() => import('../atoms/PenAndPaper.vue'));
const UserOptions = defineAsyncComponent(() => import('../atoms/UserOptions.vue'));
const PackageVersion = defineAsyncComponent(() => import('../atoms/PackageVersion.vue'));
const BaseDraggableDialog = defineAsyncComponent(() => import('../atoms/BaseDraggableDialog.vue'));

const { vue_ui_ridgeline: DEFAULT_CONFIG } = useConfig();

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
        return Array.isArray(FINAL_DATASET.value) && FINAL_DATASET.value.length > 0;
    },
    set(v) { return v; }
});

const emit = defineEmits(['selectLegend', 'selectDatapoint', 'selectX'])

const ridgelineChart = ref(null);
const chartTitle = ref(null);
const chartLegend = ref(null);
const resizeObserver = shallowRef(null);
const observedEl = shallowRef(null);
const source = ref(null);
const noTitle = ref(null);
const titleStep = ref(0);
const tableStep = ref(0);
const legendStep = ref(0);
const uid = ref(createUid());
const step = ref(0);
const rowCount = ref(0);
const baseWidth = ref(512);
const selectedX = ref(null);
const selectedDatapoint = ref(null);
const dialog = ref(null);
const parentHeight = ref(0);
const timeLabelsEls = ref(null);
const tableUnit = ref(null);
const userOptionsRef = ref(null);

function prepareConfig() {
    const mergedConfig = useNestedProp({
        userConfig: props.config,
        defaultConfig: DEFAULT_CONFIG
    });
    if (mergedConfig.theme) {
        return {
            ...useNestedProp({
                userConfig: themes.vue_ui_ridgeline[mergedConfig.theme] || props.config,
                defaultConfig: mergedConfig
            }),
            customPalette: themePalettes[mergedConfig.theme] || palette
        }
    } else {
        return mergedConfig;
    }
}

const FINAL_CONFIG = ref(prepareConfig());

const { loading, FINAL_DATASET, manualLoading } = useLoading({
    ...toRefs(props),
    FINAL_CONFIG,
    prepareConfig,
    skeletonDataset: [
        {
            name: "_",
            datapoints: [
                {
                    name: "__",
                    color: "#999999",
                    values: [28.639,32.04,41.134,44.525,21.151,2.436,0.218,0.024,0.002,0,0,0]
                },
                {
                    name: "_",
                    color: "#CACACA",
                    values: [13.253,15.621,23.36,33.698,29.935,10.874,2.364,0.561,0.107,0.02,0.006,0.004]
                }
            ]
        },
        {
            name: "_",
            datapoints: [
                {
                    name: "_",
                    color: "#999999",
                    values: [10.851,13.195,21.617,36.556,42.292,21.006,3.398,0.223,0.013,0.001,0,0]
                },
                {
                    name: "_",
                    color: "#CACACA",
                    values: [3.171,4.115,8.108,18.248,31.641,29.063,12.031,2.742,0.504,0.102,0.032,0.021]
                }
            ]
        },
        {
            name: "_",
            datapoints: [
                {
                    name: "_",
                    color: "#999999",
                    values: [1.731,2.334,5.125,13.626,29.911,38.524,24.168,7.646,1.575,0.317,0.097,0.063]
                },
                {
                    name: "_",
                    color: "#CACACA",
                    values: [0.25,0.367,1.026,3.944,13.635,28.891,30.149,15.419,4.714,1.246,0.442,0.299]
                }
            ]
        },
        {
            name: "_",
            datapoints: [
                {
                    name: "_",
                    color: "#999999",
                    values: [0.034,0.054,0.194,1.065,5.747,20.735,38.306,32.899,15.318,5.566,2.422,1.76]
                },
                {
                    name: "_",
                    color: "#CACACA",
                    values: [0.001,0.002,0.009,0.095,1.124,8.342,27.115,35.08,21.449,9.093,4.243,3.143]
                }
            ]
        },
        {
            name: "_",
            datapoints: [
                {
                    name: "_",
                    color: "#999999",
                    values: [0,0.001,0.004,0.051,0.567,3.322,14.215,44.783,40.351,20.377,9.866,7.378]
                },
                {
                    name: "_",
                    color: "#CACACA",
                    values: [0,0,0,0,0.001,0.11,4.136,27.498,43.24,29.807,17.345,13.678]
                }
            ]
        },
        {
            name: "_",
            datapoints: [
                {
                    name: "_",
                    color: "#999999",
                    values: [0,0,0,0,0.025,0.598,3.886,10.645,54.479,45.953,30.814,24.55]
                },
                {
                    name: "_",
                    color: "#CACACA",
                    values: [0,0,0,0,0,0,0.007,1.655,26.63,52.017,45.192,39.651]
                }
            ]
        }
    ],
    skeletonConfig: treeShake({
        defaultConfig: FINAL_CONFIG.value,
        userConfig: {
            userOptions: { show: false },
            table: { show: false, },
            style: {
                chart: {
                    backgroundColor: '#99999930',
                    areas: {
                        maxPoint: {
                            show: false,
                        },
                        opacity: 0.9,
                        stroke: {
                            useSerieColor: true,
                        },
                    },
                    legend: {
                        backgroundColor: 'transparent'
                    },
                    padding: {
                        right: -24,
                        left: 0
                    },
                    xAxis: {
                        labels: {
                            values: []
                        }
                    },
                    yAxis: {
                        labels: {
                            fontSize: 0,
                        }
                    },
                    zeroLine: { show: false }
                }
            }
        }
    })
});

const rowHeight = ref(Math.min(
    FINAL_CONFIG.value.style.chart.areas.height,
    FINAL_CONFIG.value.style.chart.areas.rowHeight,
));

const {
    userOptionsVisible,
    setUserOptionsVisibility,
    keepUserOptionState
} = useUserOptionState({ config: FINAL_CONFIG.value });

const { svgRef } = useChartAccessibility({ config: FINAL_CONFIG.value.style.chart.title });

const debug = computed(() => !!FINAL_CONFIG.value.debug);

function prepareChart() {
    const ds = FINAL_DATASET.value || [];

    if (!Array.isArray(ds) || ds.length === 0) {
        error({ componentName: 'VueUiRidgeline', type: 'dataset', debug: debug.value });
        manualLoading.value = true;
        return;
    }

    ds.forEach((serie, i) => {
        getMissingDatasetAttributes({
        datasetObject: serie,
        requiredAttributes: ['name', 'datapoints']
        }).forEach(attr => {
            isDataset.value = false;
            error({
                componentName: 'VueUiRidgeline',
                type: 'datasetSerieAttribute',
                property: attr,
                index: i,
                debug: debug.value
            });
        });

        if (Array.isArray(serie.datapoints) && serie.datapoints.length) {
            serie.datapoints.forEach((dp, j) => {
                getMissingDatasetAttributes({
                    datasetObject: dp,
                    requiredAttributes: ['name', 'values']}).forEach(attr => {
                        isDataset.value = false;
                        error({
                            componentName: 'VueUiRidgeline',
                            type: 'datasetSerieAttribute',
                            property: `datapoint.${attr}`,
                            index: `${i}-${j}`,
                            debug: debug.value
                        });
                    });
                });
        }
    });

    rowCount.value = ds.length;

    rowHeight.value = Math.min(
        FINAL_CONFIG.value.style.chart.areas.height,
        FINAL_CONFIG.value.style.chart.areas.rowHeight,
    );

    // v3
    if (!objectIsEmpty(props.dataset)) {
        manualLoading.value = FINAL_CONFIG.value.loading;
    }

    if (FINAL_CONFIG.value.responsive) {
        const handleResize = throttle(() => {
        const { width, height } = useResponsive({
            chart: ridgelineChart.value,
            title: FINAL_CONFIG.value.style.chart.title.text ? chartTitle.value : null,
            legend: FINAL_CONFIG.value.style.chart.legend.show ? chartLegend.value : null,
            source: source.value,
            noTitle: noTitle.value,
            padding: FINAL_CONFIG.value.style.chart.padding
        });

        requestAnimationFrame(() => {
            baseWidth.value = width;
            rowHeight.value = ds.length ? (height / ds.length) : 0;
            parentHeight.value = height - 12;
        });
        });

        if (resizeObserver.value) {
        if (observedEl.value) resizeObserver.value.unobserve(observedEl.value);
        resizeObserver.value.disconnect();
        }

        resizeObserver.value = new ResizeObserver(handleResize);
        observedEl.value = ridgelineChart.value?.parentNode || null;
        if (observedEl.value) resizeObserver.value.observe(observedEl.value);
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
    elementId: `vue-ui-ridgeline_${uid.value}`,
    fileName: FINAL_CONFIG.value.style.chart.title.text || 'vue-ui-ridgeline',
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
});

watch(
    () => FINAL_DATASET.value,
    async (ds) => {
        if (Array.isArray(ds) && ds.length) {
            userOptionsVisible.value = !FINAL_CONFIG.value.userOptions.showOnChartHover;
            await nextTick();
            prepareChart();
            titleStep.value += 1;
            legendStep.value += 1;
            mutableConfig.value.showTable = FINAL_CONFIG.value.table.show;
        }
    },
    { deep: true, immediate: true }
);

watch(() => props.dataset, (_) => {
    if (Array.isArray(_) && _.length > 0) {
        manualLoading.value = false;
    }
}, { deep: true })

watch(
    () => loading.value,
    async (isLoading) => {
        if (!isLoading) {
            await nextTick();
            prepareChart();
        }
    },
    { immediate: true }
);

watch(
    () => props.config,
    () => {
        FINAL_CONFIG.value = prepareConfig(FINAL_DATASET.value || null);
        userOptionsVisible.value = !FINAL_CONFIG.value.userOptions.showOnChartHover;
        rowHeight.value = Math.min(FINAL_CONFIG.value.style.chart.areas.height, FINAL_CONFIG.value.style.chart.areas.rowHeight);
        mutableConfig.value.showTable = FINAL_CONFIG.value.table.show;
        titleStep.value += 1;
        legendStep.value += 1;
    },
    { deep: true }
);

const overlapRatio = computed(() => {
    return FINAL_CONFIG.value.style.chart.areas.height / FINAL_CONFIG.value.style.chart.areas.rowHeight;
});

function segregate(slug) {
    if (segregated.value.includes(slug)) {
        segregated.value = segregated.value.filter(s => s !== slug)
    } else {
        segregated.value.push(slug)
    }

    emit('selectLegend', drawableDataset.value)
}

const formattedDataset = computed(() => {
    if (!isDataset.value) return [];
    return (FINAL_DATASET.value || []).map((ds) => ({
        ...ds,
        labelLen: measureSvgTextWidth(ds.name, FINAL_CONFIG.value.style.chart.yAxis.labels.fontSize),
        uid: createUid(),
        datapoints: ds.datapoints.map((dp, j) => {
        const color = dp.color ? convertColorToHex(dp.color) : customPalette.value[j] || palette[j] || palette[j % palette.length];
        const id = slugify(dp.name);
        return { ...dp, color, id };
        })
    }));
});

const baseHeight = computed(() => {
    return FINAL_CONFIG.value.style.chart.padding.top + (rowHeight.value * (FINAL_DATASET.value || []).length) + (rowHeight.value * overlapRatio.value) + FINAL_CONFIG.value.style.chart.padding.bottom;
});

const svg = computed(() => {
    const padding = FINAL_CONFIG.value.style.chart.padding;
    return {
        width: baseWidth.value,
        height: baseHeight.value,
        padding
    }
});

const WIDTH = computed(() => svg.value.width);
const HEIGHT = computed(() => svg.value.height);

const timeLabelsOffsetY = ref(0);

const updateHeight = throttle((h) => {
    timeLabelsOffsetY.value = h;
}, 100);

watchEffect((onInvalidate) => {
    const el = timeLabelsEls.value;
    if (!el) return;
    const observer = new ResizeObserver(entries => {
        updateHeight(entries[0].contentRect.height);
    })
    observer.observe(el);
    onInvalidate(() => observer.disconnect());
});

onBeforeUnmount(() => {
    timeLabelsOffsetY.value = 0;
});

const drawingArea = computed(() => {

    return {
        fullHeight: svg.value.height + timeLabelsOffsetY.value,
        top: svg.value.padding.top,
        left: svg.value.padding.left,
        right: svg.value.width - svg.value.padding.right,
        bottom: svg.value.height - FINAL_CONFIG.value.style.chart.padding.bottom,
        width: svg.value.width - (svg.value.padding.left + svg.value.padding.right)
    }
});

const maxDpLen = computed(() => {
    return Math.max(...formattedDataset.value.flatMap(el => el.datapoints.map(dp => dp.values.length)));
})

const timeLabels = computed(() => {
    return useTimeLabels({
        values: FINAL_CONFIG.value.style.chart.xAxis.labels.values,
        maxDatapoints: maxDpLen.value,
        formatter: FINAL_CONFIG.value.style.chart.xAxis.labels.datetimeFormatter,
        start: 0,
        end: FINAL_CONFIG.value.style.chart.xAxis.labels.values.length
    })
})

const xAxisTrapsAndLabels = computed(() => {
    const maxLabelLen = Math.max(...formattedDataset.value.map(el => el.labelLen));
    const startX = svg.value.padding.left + maxLabelLen + 16 + FINAL_CONFIG.value.style.chart.yAxis.labels.offsetX;
    const slotSize = (drawingArea.value.width - startX) / maxDpLen.value;

    const arr = [];

    for (let i = 0; i < maxDpLen.value; i += 1) {
        arr.push({
            selectorX: startX + (slotSize * i),
            x: startX + (slotSize * i) - slotSize / 2,
            y: drawingArea.value.top,
            label: FINAL_CONFIG.value.style.chart.xAxis.labels.values[i] ? timeLabels.value[i].text : '',
            index: i,
            width: slotSize,
            height: baseHeight.value
        })
    }
    return arr;
})

function getDp(trap) {
    return formattedDataset.value.map(ds => {
        return ds.datapoints.map(dp => {
            return {
                dp,
                selected: dp.values[trap.index]
            }
        });
    });
}

function onTrapEnter(trap) {
    selectedX.value = trap;
    const datapoint = getDp(trap);
    if (FINAL_CONFIG.value.events.datapointEnter) {
        FINAL_CONFIG.value.events.datapointEnter({ datapoint, seriesIndex: trap.index });
    }
}

function onTrapLeave(trap) {
    selectedX.value = null;
    const datapoint = getDp(trap);
    if (FINAL_CONFIG.value.events.datapointLeave) {
        FINAL_CONFIG.value.events.datapointLeave({ datapoint, seriesIndex: trap.index });
    }
}

function selectX(trap) {
    const datapoint = getDp(trap);

    if (FINAL_CONFIG.value.events.datapointClick) {
        FINAL_CONFIG.value.events.datapointClick({ datapoint, seriesIndex: trap.index });
    }

    emit('selectX', datapoint);
}

function stringSize(str, fontSize) {
    const len = str.length;
    return (len * fontSize / 2) + fontSize;
}

function isTextOverflowingRight(x, text, fontSize) {
    const size = stringSize(text, fontSize);
    return x + size > drawingArea.value.right;
}

function measureSvgTextWidth(text, fontSize, fontFamily = 'sans-serif') {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const size = typeof fontSize === 'number' ? `${fontSize}px` : fontSize;
    ctx.font = `${size} ${fontFamily}`;
    const metrics = ctx.measureText(text);
    return metrics.width;
}


const drawableDataset = computed(() => {
    const _not_used_but_necessary = rowHeight.value;

    const maxLabelLen = Math.max(...formattedDataset.value.map(el => el.labelLen));
    const maxVal = Math.max(...formattedDataset.value.flatMap(el => el.datapoints.flatMap(dp => dp.values)));
    const minVal = Math.min(...formattedDataset.value.flatMap(el => el.datapoints.flatMap(dp => dp.values)));
    const startX = svg.value.padding.left + maxLabelLen + 16 + FINAL_CONFIG.value.style.chart.yAxis.labels.offsetX;
    const slotSize = (drawingArea.value.width - startX) / maxDpLen.value;
    const absoluteMin = Math.abs(Math.min(minVal, 0));
    const absoluteMax = maxVal + absoluteMin;

    function ratioToMax(v) {
        return isNaN(v / absoluteMax) ? 0 : v / absoluteMax;
    }

    return formattedDataset.value.map((ds, i) => {
        const base = drawingArea.value.top + (rowHeight.value * (i));
        const zero = drawingArea.value.top + base + ((rowHeight.value * overlapRatio.value) * (1 - (ratioToMax(absoluteMin))));
        return {
            ...ds,
            label: {
                x: startX - FINAL_CONFIG.value.style.chart.yAxis.labels.fontSize,
                y: zero
            },
            datapoints: ds.datapoints
                .map(dp => {
                    const plots = dp.values.map((v, k) => {
                        const absoluteValue = isNaN(v) || [undefined, null, 'NaN', NaN, Infinity, -Infinity].includes(v) ? 0 : v || 0;
                        const x = startX + (slotSize * k);
                        const y = drawingArea.value.top + base + ((rowHeight.value * overlapRatio.value) * (1 - ratioToMax(absoluteValue + absoluteMin)));
                        const isMaxPoint = v === Math.max(...dp.values);

                        return {
                            x,
                            y,
                            value: v,
                            isMaxPoint,
                            zero
                        }
                    });

                    const smoothPath = `${createSmoothAreaSegments(plots, zero, false, false)}`;
                    const straightPath = `M ${startX},${zero} ${createStraightPath(plots)} ${plots.at(-1).x},${zero}`;
                    const zeroPath = `M ${startX},${zero} ${plots.at(-1).x},${zero}`;
                    const smoothPathRidge = `M ${createSmoothPath(plots)}`;
                    const straightPathRidge = `M ${createStraightPath(plots)}`;


                    const pathLength = getPathLengthFromCoordinates(
                        FINAL_CONFIG.value.style.chart.areas.smooth
                            ? smoothPathRidge
                            : straightPathRidge
                    );

                    return {
                        ...dp,
                        uid: createUid(),
                        plots,
                        smoothPath,
                        straightPath,
                        zeroPath,
                        pathLength,
                        smoothPathRidge,
                        straightPathRidge
                    }
                })
                .filter(dp => !segregated.value.includes(dp.id))
        }
    });
});

const segregated = ref([]);

function createLegend(dataset) {
    const map = new Map();
    dataset.forEach(ds => {
        ds.datapoints.forEach((dp, j) => {
            const id = slugify(dp.name);
            if (!map.has(id)) {
                map.set(id, {
                    id,
                    name: dp.name,
                    color: dp.color,
                    shape: 'circle',
                    segregate: () => segregate(id),
                    isSegregated: segregated.value.includes(id),
                    opacity: segregated.value.includes(id) ? 0.5 : 1
                });
            }
        });
    });
    return Array.from(map.values());
}

const legendSet = computed(() => {
    return createLegend(formattedDataset.value);
});

const legendConfig = computed(() => {
    return {
        cy: 'donut-div-legend',
        backgroundColor: FINAL_CONFIG.value.style.chart.legend.backgroundColor,
        color: FINAL_CONFIG.value.style.chart.legend.color,
        fontSize: FINAL_CONFIG.value.style.chart.legend.fontSize,
        paddingBottom: 12,
        fontWeight: FINAL_CONFIG.value.style.chart.legend.bold ? 'bold' : ''
    }
})

const isFullscreen = ref(false)
function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
}

const xyConfig = ref({})
const xyDataset = ref([]);

function createXyDatasetForDialog(ds) {

    emit('selectDatapoint', ds);

    if (!FINAL_CONFIG.value.style.chart.dialog.show) return;

    xyDataset.value = ds.datapoints.map(dp => {
        return {
            name: dp.name,
            color: dp.color,
            type: 'line',
            useArea: true,
            smooth: FINAL_CONFIG.value.style.chart.areas.smooth,
            series: dp.values,
        }
    });

    selectedDatapoint.value = ds;

    xyConfig.value = deepEmptyObjectToNull({
        ...FINAL_CONFIG.value.style.chart.dialog.xyChart,
        responsive: true, // Overriding 
        chart: {
            ...FINAL_CONFIG.value.style.chart.dialog.xyChart.chart,
            grid: {
                ...FINAL_CONFIG.value.style.chart.dialog.xyChart.chart.grid,
                labels: {
                    ...FINAL_CONFIG.value.style.chart.dialog.xyChart.chart.grid.labels,
                    xAxisLabels: {
                        ...FINAL_CONFIG.value.style.chart.dialog.xyChart.chart.grid.labels.xAxisLabels,
                        values: FINAL_CONFIG.value.style.chart.xAxis.labels.values, // Overriding
                        autoRotate: {
                            enable: true,
                            angle: FINAL_CONFIG.value.style.chart.dialog.xyChart.chart.grid.labels.xAxisLabels.autoRotate.angle
                        }, // overriding
                        datetimeFormatter: FINAL_CONFIG.value.style.chart.xAxis.labels.datetimeFormatter, // Overriding
                    }
                }
            },
            tooltip: {
                ...FINAL_CONFIG.value.style.chart.dialog.xyChart.chart.tooltip,
                showTimeLabel: FINAL_CONFIG.value.style.chart.xAxis.labels.values.length > 0 // Overriding
            }
        }
    })

    dialog.value && dialog.value.open();
}

const selectedYAxisLabelIndex = ref(null);

function setYAxisLabelHoverIndex(index) {
    selectedYAxisLabelIndex.value = index;
}

function resetYAxisLabelIndex() {
    selectedYAxisLabelIndex.value = null;
}

const isAnnotator = ref(false);
function toggleAnnotator() {
    isAnnotator.value = !isAnnotator.value;
}

function toggleTable() {
    mutableConfig.value.showTable = !mutableConfig.value.showTable;
}

const table = computed(() => {
    const allRows = drawableDataset.value.flatMap(ds => {
        return ds.datapoints.flatMap(dp => {
            return {
                ...dp,
                rowName: `${ds.name}: ${dp.name}`
            }
        });
    });

    const body = allRows.map(r => {
        return [
            {
                name: r.rowName,
                color: r.color
            },
            ...r.values
        ]
    })
    return { body };
});

const dataTable = computed(() => {
    const head = [
        FINAL_CONFIG.value.table.columnNames.series,
        ...timeLabels.value.map(l => l.text)
    ];

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
        ...timeLabels.value.map(l => l.text),
    ];

    return {
        colNames,
        head,
        body: table.value.body,
        config
    }
});

function generateCsv(callback=null) {
    nextTick(() => {
        const labels = [
            [FINAL_CONFIG.value.table.columnNames.series, ...timeLabels.map(l => [l.text])],
            ...table.value.body.map((v, i) => {
                return [v[0].name, ...v.slice(1)]
            })
        ];
        const tableXls = [
            [FINAL_CONFIG.value.style.chart.title.text],
            [FINAL_CONFIG.value.style.chart.title.subtitle.text],
        ].concat(labels);
        const csvContent = createCsvContent(tableXls);

        if (!callback) {
            downloadCsv({
                csvContent,
                title: FINAL_CONFIG.value.style.chart.title.text || 'vue-ui-ridgeline'
            });
        } else {
            callback(csvContent);
        }
            
    });
}

function getData() {
    return drawableDataset.value;
}   

async function getImage({ scale = 2} = {}) {
    if (!ridgelineChart.value) return;
    const { width, height } = ridgelineChart.value.getBoundingClientRect();
    const aspectRatio = width / height; 
    const { imageUri, base64 } = await img({ domElement: ridgelineChart.value, base64: true, img: true, scale})
    return { 
        imageUri, 
        base64, 
        title: FINAL_CONFIG.value.style.chart.title.text,
        width,
        height,
        aspectRatio
    }
}

const dummySlicer = computed(() => ({ min: 0, max: maxDpLen.value }));

useTimeLabelCollision({
    timeLabelsEls: timeLabelsEls,
    timeLabels,
    slicer: dummySlicer,
    configRef: FINAL_CONFIG,
    rotationPath: ['style', 'chart', 'xAxis', 'labels', 'rotation'],
    autoRotatePath: ['style', 'chart', 'xAxis', 'labels', 'autoRotate', 'enable'],
    isAutoSize: false,
    width: WIDTH,
    height: HEIGHT,
    targetClass: '.vue-ui-ridgeline-x-axis-label',
    angle: FINAL_CONFIG.value.style.chart.xAxis.labels.autoRotate.angle
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
            fullscreenParent: ridgelineChart.value,
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
const svgLegend = computed(() => ({
    ...FINAL_CONFIG.value.style.chart.legend,
    position: 'bottom'
}));
const svgTitle = computed(() => FINAL_CONFIG.value.style.chart.title);

const { exportSvg, getSvg } = useSvgExport({
    svg: svgRef,
    title: svgTitle,
    legend: svgLegend,
    legendItems: legendSet,
    backgroundColor: svgBg
})

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
    generateImage,
    generateSvg,
    generatePdf,
    generateCsv,
    toggleAnnotator,
    toggleTable,
    toggleFullscreen
});

</script>

<template>
    <div ref="ridgelineChart" :class="`vue-data-ui-component vue-ui-ridgeline ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''}`"
        :id="`vue-ui-ridgeline_${uid}`" :style="{
            fontFamily: FINAL_CONFIG.style.fontFamily,
            width: '100%',
            textAlign: 'center',
            background: FINAL_CONFIG.style.chart.backgroundColor,
            height: FINAL_CONFIG.responsive ? '100%' : undefined
        }" @mouseenter="() => setUserOptionsVisibility(true)" @mouseleave="() => setUserOptionsVisibility(false)">

        <!-- PEN AND PAPER -->
        <PenAndPaper v-if="FINAL_CONFIG.userOptions.buttons.annotator && svgRef" :color="FINAL_CONFIG.style.chart.color"
            :backgroundColor="FINAL_CONFIG.style.chart.backgroundColor" :active="isAnnotator" :svgRef="svgRef"
            @close="toggleAnnotator" />

        <!-- NO TITLE -->
        <slot name="userConfig"></slot>

        <div ref="noTitle" v-if="hasOptionsNoTitle" class="vue-data-ui-no-title-space"
            :style="`height:36px; width: 100%;background:transparent`" />

        <!-- TITLE -->
        <div ref="chartTitle" v-if="FINAL_CONFIG.style.chart.title.text"
            :style="`width:100%;background:transparent;padding-bottom:24px`">
            <Title :key="`title_${titleStep}`" :config="{
                title: {
                    cy: 'ridgeline-div-title',
                    ...FINAL_CONFIG.style.chart.title,
                },
                subtitle: {
                    cy: 'ridgeline-div-subtitle',
                    ...FINAL_CONFIG.style.chart.title.subtitle
                }
            }" />
        </div>

        <!-- USER OPTIONS -->
        <UserOptions 
            ref="userOptionsRef" 
            :key="`user_option_${step}`"
            v-if="FINAL_CONFIG.userOptions.show && isDataset && (keepUserOptionState ? true : userOptionsVisible)"
            :backgroundColor="FINAL_CONFIG.style.chart.backgroundColor" 
            :color="FINAL_CONFIG.style.chart.color"
            :isPrinting="isPrinting" 
            :isImaging="isImaging" 
            :uid="uid" 
            :hasTooltip="false" 
            :callbacks="FINAL_CONFIG.userOptions.callbacks" 
            :hasPdf="FINAL_CONFIG.userOptions.buttons.pdf" 
            :hasImg="FINAL_CONFIG.userOptions.buttons.img"
            :hasSvg="FINAL_CONFIG.userOptions.buttons.svg"
            :hasXls="FINAL_CONFIG.userOptions.buttons.csv" 
            :hasTable="FINAL_CONFIG.userOptions.buttons.table"
            :hasLabel="false" 
            :hasFullscreen="FINAL_CONFIG.userOptions.buttons.fullscreen" 
            :isFullscreen="isFullscreen"
            :printScale="FINAL_CONFIG.userOptions.print.scale"
            :chartElement="ridgelineChart" 
            :position="FINAL_CONFIG.userOptions.position" 
            :isTooltip="false"
            :titles="{ ...FINAL_CONFIG.userOptions.buttonTitles }"
            :hasAnnotator="FINAL_CONFIG.userOptions.buttons.annotator" 
            :isAnnotation="isAnnotator"
            :tableDialog="FINAL_CONFIG.table.useDialog"
            :style="{ visibility: keepUserOptionState ? userOptionsVisible ? 'visible' : 'hidden' : 'visible' }" 
            @toggleFullscreen="toggleFullscreen" 
            @generatePdf="generatePdf" 
            @generateCsv="generateCsv"
            @generateImage="generateImage" 
            @generateSvg="generateSvg"
            @toggleTable="toggleTable" 
            @toggleAnnotator="toggleAnnotator"
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
            <template v-if="$slots.optionFullscreen" #optionFullscreen="{ toggleFullscreen, isFullscreen }">
                <slot name="optionFullscreen" v-bind="{ toggleFullscreen, isFullscreen }" />
            </template>
            <template v-if="$slots.optionAnnotator" #optionAnnotator="{ toggleAnnotator, isAnnotator }">
                <slot name="optionAnnotator" v-bind="{ toggleAnnotator, isAnnotator }" />
            </template>
        </UserOptions>

        <!-- CHART -->
        <svg ref="svgRef" :xmlns="XMLNS"
            :class="{ 'vue-data-ui-fullscreen--on': isFullscreen, 'vue-data-ui-fulscreen--off': !isFullscreen }"
            :viewBox="`0 0 ${svg.width <= 0 ? 10 : svg.width} ${drawingArea.fullHeight <= 0 ? 10 : drawingArea.fullHeight}`"
            :style="`max-width:100%;overflow:visible;background:transparent;color:${FINAL_CONFIG.style.chart.color};${FINAL_CONFIG.responsive ? `height: ${parentHeight}px; width: 100%;` : ''}`">
            <PackageVersion />

            <defs>
                <linearGradient v-for="(dp, i) in legendSet" :id="`gradient-${dp.id}-${uid}`" x1="50%" y1="0%" x2="50%"
                    y2="100%">
                    <stop offset="0%" :stop-color="dp.color" stop-opacity="1" />
                    <stop offset="30%" :stop-color="dp.color" stop-opacity="0.7" />
                    <stop offset="70%" :stop-color="dp.color" stop-opacity="0.3" />
                    <stop offset="100%" :stop-color="dp.color" stop-opacity="0.1" />
                </linearGradient>

                <template v-for="(ds, i) in drawableDataset">
                    <linearGradient v-for="(dp, j) in ds.datapoints" :key="`grad${dp.id}`"
                        :id="`gradient-single-${uid}-${dp.uid}`" x1="50%" y1="0%" x2="50%" y2="100%">
                        <stop offset="0%" :stop-color="dp.color" stop-opacity="1" />
                        <stop offset="30%" :stop-color="dp.color" stop-opacity="0.7" />
                        <stop offset="70%" :stop-color="dp.color" stop-opacity="0.3" />
                        <stop offset="100%" :stop-color="dp.color" stop-opacity="0.1" />
                    </linearGradient>
                </template>
            </defs>

            <g v-for="(ds, i) in drawableDataset" :key="`ds-${i}`">
                <!-- Paths -->
                <g v-for="(dp, j) in ds.datapoints" :key="dp.id">
                    <g v-if="$slots.pattern">
                        <defs>
                            <slot name="pattern" v-bind="{ datapointIndex: i, seriesIndex: j, patternId: `pattern_${uid}_${dp.uid}` }" />
                        </defs>
                    </g>
                    <!-- PATH BACKGROUND -->
                    <path :fill="$slots.pattern ? `url(#pattern_${uid}_${dp.uid})` : FINAL_CONFIG.style.chart.backgroundColor" stroke="none" stroke-linecap="round"
                        :d="FINAL_CONFIG.style.chart.areas.smooth ? dp.smoothPath : dp.straightPath" :style="{
                            opacity: FINAL_CONFIG.style.chart.areas.opacity,
                        }" />

                    <!-- PATH -->
                    <path
                        fill="none"
                        :stroke="FINAL_CONFIG.style.chart.areas.stroke.useSerieColor ? dp.color : FINAL_CONFIG.style.chart.areas.stroke.color"
                        :stroke-width="FINAL_CONFIG.style.chart.areas.strokeWidth"
                        :d="FINAL_CONFIG.style.chart.areas.smooth ? dp.smoothPathRidge : dp.straightPathRidge"
                        stroke-linecap="round" stroke-linejoin="round"
                        :class="{ 'vue-ui-ridgeline-animate': FINAL_CONFIG.useCssAnimation && !loading }" 
                        :style="{
                            strokeDasharray: dp.pathLength,
                            strokeDashoffset: FINAL_CONFIG.useCssAnimation ? dp.pathLength : 0,
                        }" 
                    />
                    <path
                        :fill="!FINAL_CONFIG.style.chart.areas.useGradient ? dp.color : FINAL_CONFIG.style.chart.areas.useCommonColor ? `url(#gradient-${dp.id}-${uid})` : `url(#gradient-single-${uid}-${dp.uid})`"
                        stroke="none"
                        :d="FINAL_CONFIG.style.chart.areas.smooth ? dp.smoothPath : dp.straightPath"
                        stroke-linecap="round" stroke-linejoin="round"
                        :class="{ 'vue-ui-ridgeline-animate': FINAL_CONFIG.useCssAnimation && !loading }" 
                        :style="{
                            strokeDasharray: dp.pathLength,
                            strokeDashoffset: FINAL_CONFIG.useCssAnimation ? dp.pathLength : 0,
                        }" />

                    <!-- ZERO LINE -->
                    <path
                        v-if="FINAL_CONFIG.style.chart.zeroLine.show"
                        :stroke="FINAL_CONFIG.style.chart.zeroLine.useSerieColor ? dp.color : FINAL_CONFIG.style.chart.zeroLine.stroke"
                        :stroke-dasharray="FINAL_CONFIG.style.chart.zeroLine.strokeDasharray"
                        :stroke-width="FINAL_CONFIG.style.chart.zeroLine.strokeWidth" 
                        :d="dp.zeroPath"
                        stroke-linecap="round" 
                    />

                    <!-- MAX POINT INDICATOR -->
                    <template v-if="FINAL_CONFIG.style.chart.areas.maxPoint.show && dp.plots.length > 1">
                        <template v-for="plot in dp.plots">
                            <line v-if="plot.isMaxPoint" :x1="plot.x" :y1="plot.y" :x2="plot.x" :y2="plot.zero"
                                :stroke="FINAL_CONFIG.style.chart.areas.maxPoint.adaptStrokeToBackground ? adaptColorToBackground(dp.color) : FINAL_CONFIG.style.chart.areas.maxPoint.stroke"
                                :stroke-width="FINAL_CONFIG.style.chart.areas.maxPoint.strokeWidth"
                                stroke-linecap="round"
                                :stroke-dasharray="FINAL_CONFIG.style.chart.areas.maxPoint.strokeDasharray" />
                        </template>
                    </template>

                    <!-- SINGLE PLOT CASE -->
                    <template v-if="dp.plots.length === 1">
                        <circle :cx="dp.plots[0].x" :cy="dp.plots[0].y"
                            :stroke="FINAL_CONFIG.style.chart.selector.dot.stroke"
                            :stroke-width="FINAL_CONFIG.style.chart.selector.dot.strokeWidth"
                            :r="FINAL_CONFIG.style.chart.selector.dot.radius"
                            :fill="FINAL_CONFIG.style.chart.selector.dot.useDatapointColor ? dp.color : FINAL_CONFIG.style.chart.selector.dot.fill"
                            :style="{
                                pointerEvents: 'none'
                            }" />
                    </template>
                </g>

                <!-- Y AXIS LABELS -->
                <text :x="ds.label.x" :y="ds.label.y" text-anchor="end"
                    :font-size="FINAL_CONFIG.style.chart.yAxis.labels.fontSize"
                    :font-weight="FINAL_CONFIG.style.chart.yAxis.labels.bold ? 'bold' : 'normal'"
                    :fill="FINAL_CONFIG.style.chart.yAxis.labels.color" :style="{
                        cursor: FINAL_CONFIG.style.chart.dialog.show ? 'pointer' : 'default'
                    }"
                    :text-decoration="FINAL_CONFIG.style.chart.dialog.show && (selectedYAxisLabelIndex === i || (!!selectedDatapoint && ds.uid === selectedDatapoint.uid)) ? 'underline' : ''"
                    @mouseenter="setYAxisLabelHoverIndex(i)" @mouseleave="resetYAxisLabelIndex"
                    @click="createXyDatasetForDialog(ds)">
                    {{ ds.name }}
                </text>
            </g>

            <!-- X AXIS LABELS -->
            <g v-if="FINAL_CONFIG.style.chart.xAxis.labels.values.length" ref="timeLabelsEls">
                <template v-for="(xLabel, i) in xAxisTrapsAndLabels">
                    <slot name="time-label" v-bind="{
                        show: (xLabel && !FINAL_CONFIG.style.chart.xAxis.labels.showOnlyFirstAndLast && !FINAL_CONFIG.style.chart.xAxis.labels.showOnlyAtModulo) ||
                            (xLabel && FINAL_CONFIG.style.chart.xAxis.labels.showOnlyFirstAndLast && (i === 0 || i === xAxisTrapsAndLabels.length - 1)) ||
                            (xLabel && selectedX && selectedX.index === i) ||
                            (xLabel && !FINAL_CONFIG.style.chart.xAxis.labels.showOnlyFirstAndLast && FINAL_CONFIG.style.chart.xAxis.labels.showOnlyAtModulo && (i % Math.floor(xAxisTrapsAndLabels.length / FINAL_CONFIG.style.chart.xAxis.labels.modulo)) === 0),
                        fontSize: FINAL_CONFIG.style.chart.xAxis.labels.fontSize,
                        content: xLabel.label,
                        textAnchor: FINAL_CONFIG.style.chart.xAxis.labels.rotation > 0 ? 'start' : FINAL_CONFIG.style.chart.xAxis.labels.rotation < 0 ? 'end' : 'middle',
                        fill: FINAL_CONFIG.style.chart.xAxis.labels.color,
                        transform: `translate(${xLabel.selectorX}, ${drawingArea.top + xLabel.height + FINAL_CONFIG.style.chart.xAxis.labels.offsetY}), rotate(${FINAL_CONFIG.style.chart.xAxis.labels.rotation})`,
                        x: xLabel.selectorX,
                        y: drawingArea.bottom + FINAL_CONFIG.style.chart.xAxis.labels.offsetY
                    }">
                        <g v-if="(xLabel && !FINAL_CONFIG.style.chart.xAxis.labels.showOnlyFirstAndLast && !FINAL_CONFIG.style.chart.xAxis.labels.showOnlyAtModulo) ||
                                (xLabel && FINAL_CONFIG.style.chart.xAxis.labels.showOnlyFirstAndLast && (i === 0 || i === xAxisTrapsAndLabels.length - 1)) ||
                                (xLabel && selectedX && selectedX.index === i) ||
                                (xLabel && !FINAL_CONFIG.style.chart.xAxis.labels.showOnlyFirstAndLast && FINAL_CONFIG.style.chart.xAxis.labels.showOnlyAtModulo && (i % Math.floor(xAxisTrapsAndLabels.length / FINAL_CONFIG.style.chart.xAxis.labels.modulo)) === 0)"
                        >
                        <!-- SINGLE LINE -->
                        <text
                            class="vue-ui-ridgeline-x-axis-label"
                            v-if="!String(xLabel.label).includes('\n')"
                            :font-size="FINAL_CONFIG.style.chart.xAxis.labels.fontSize"
                            :fill="FINAL_CONFIG.style.chart.xAxis.labels.color"
                            :font-weight="FINAL_CONFIG.style.chart.xAxis.labels.bold ? 'bold' : 'normal'"
                            :transform="`translate(${xLabel.selectorX}, ${drawingArea.bottom + FINAL_CONFIG.style.chart.xAxis.labels.offsetY}), rotate(${FINAL_CONFIG.style.chart.xAxis.labels.rotation})`"
                            :text-anchor="FINAL_CONFIG.style.chart.xAxis.labels.rotation > 0 ? 'start' : FINAL_CONFIG.style.chart.xAxis.labels.rotation < 0 ? 'end' : 'middle'"
                            :style="{
                                opacity: selectedX ? selectedX.index === i ? 1 : 0.2 : 1
                            }">
                            {{ xLabel.label }}
                        </text>

                        <!-- MULTILINE -->
                        <text
                            class="vue-ui-ridgeline-x-axis-label"
                            v-else
                            :font-size="FINAL_CONFIG.style.chart.xAxis.labels.fontSize"
                            :fill="FINAL_CONFIG.style.chart.xAxis.labels.color"
                            :font-weight="FINAL_CONFIG.style.chart.xAxis.labels.bold ? 'bold' : 'normal'"
                            :transform="`translate(${xLabel.selectorX}, ${drawingArea.bottom + FINAL_CONFIG.style.chart.xAxis.labels.offsetY}), rotate(${FINAL_CONFIG.style.chart.xAxis.labels.rotation})`"
                            :text-anchor="FINAL_CONFIG.style.chart.xAxis.labels.rotation > 0 ? 'start' : FINAL_CONFIG.style.chart.xAxis.labels.rotation < 0 ? 'end' : 'middle'"
                            :style="{
                                opacity: selectedX ? selectedX.index === i ? 1 : 0.2 : 1
                            }"
                            v-html="createTSpansFromLineBreaksOnX({
                                content: String(xLabel.label),
                                fontSize: FINAL_CONFIG.style.chart.xAxis.labels.fontSize,
                                fill: FINAL_CONFIG.style.chart.xAxis.labels.color,
                                x: 0,
                                y: 0
                            })"
                        />
                        </g>
                    </slot>
                </template>
            </g>

            <!-- TOOLTIP TRAPS, SELECTOR AND DATALABELS-->
            <g>
                <!-- TOOLTIP TRAPS -->
                <rect 
                    v-for="(trap, i) in xAxisTrapsAndLabels" 
                    :x="trap.x" 
                    :y="trap.y"
                    :width="trap.width < 0 ? 0.1 : trap.width" 
                    :height="trap.height < 0 ? 0.1 : trap.height"
                    fill="transparent" 
                    @mouseenter="onTrapEnter(trap)" 
                    @mouseleave="onTrapLeave(trap)"
                    @click="() => selectX(trap)" 
                />

                <!-- SELECTOR -->
                <line v-if="FINAL_CONFIG.style.chart.selector.show && !!selectedX" :x1="selectedX.selectorX"
                    :x2="selectedX.selectorX" :y1="selectedX.y" :y2="selectedX.y + selectedX.height - rowHeight / 2"
                    :stroke="FINAL_CONFIG.style.chart.selector.stroke"
                    :stroke-width="FINAL_CONFIG.style.chart.selector.strokeWidth"
                    :stroke-dasharray="FINAL_CONFIG.style.chart.selector.strokeDasharray" stroke-linecap="round"
                    :style="{ pointerEvents: 'none' }" />

                <!-- SELECTED X -->
                <template v-if="!!selectedX">
                    <template v-for="ds in drawableDataset">
                        <template v-for="dp in ds.datapoints">
                            <template v-for="(plot, k) in dp.plots">
                                <!-- DOT -->
                                <circle v-if="!!selectedX && selectedX.index === k" :cx="plot.x" :cy="plot.y"
                                    :stroke="FINAL_CONFIG.style.chart.selector.dot.stroke"
                                    :stroke-width="FINAL_CONFIG.style.chart.selector.dot.strokeWidth"
                                    :r="FINAL_CONFIG.style.chart.selector.dot.radius"
                                    :fill="FINAL_CONFIG.style.chart.selector.dot.useDatapointColor ? dp.color : FINAL_CONFIG.style.chart.selector.dot.fill"
                                    :style="{
                                        pointerEvents: 'none'
                                    }" />
                                <!-- DATA LABELS -->
                                <text v-if="selectedX && selectedX.index === k"
                                    :x="isTextOverflowingRight(
                                        plot.x, applyDataLabel(
                                            FINAL_CONFIG.style.chart.selector.labels.formatter,
                                            plot.value,
                                            dataLabel({
                                                p: FINAL_CONFIG.style.chart.xAxis.labels.prefix,
                                                v: plot.value,
                                                s: FINAL_CONFIG.style.chart.xAxis.labels.suffix,
                                                r: FINAL_CONFIG.style.chart.selector.labels.rounding
                                            })
                                        ), FINAL_CONFIG.style.chart.selector.labels.fontSize) ? plot.x - (FINAL_CONFIG.style.chart.selector.labels.fontSize / 2) : plot.x + (FINAL_CONFIG.style.chart.selector.labels.fontSize / 2)"
                                    :y="plot.y + FINAL_CONFIG.style.chart.selector.labels.fontSize / 3" :text-anchor="isTextOverflowingRight(
                                        plot.x, applyDataLabel(
                                            FINAL_CONFIG.style.chart.selector.labels.formatter,
                                            plot.value,
                                            dataLabel({
                                                p: FINAL_CONFIG.style.chart.xAxis.labels.prefix,
                                                v: plot.value,
                                                s: FINAL_CONFIG.style.chart.xAxis.labels.suffix,
                                                r: FINAL_CONFIG.style.chart.selector.labels.rounding
                                            })
                                        ), FINAL_CONFIG.style.chart.selector.labels.fontSize) ? 'end' : 'start'"
                                    :font-size="FINAL_CONFIG.style.chart.selector.labels.fontSize"
                                    :fill="FINAL_CONFIG.style.chart.selector.labels.color" :style="{
                                        pointerEvents: 'none'
                                    }">
                                    {{ applyDataLabel(
                                        FINAL_CONFIG.style.chart.selector.labels.formatter,
                                        plot.value,
                                        dataLabel({
                                            p: FINAL_CONFIG.style.chart.xAxis.labels.prefix,
                                            v: plot.value,
                                            s: FINAL_CONFIG.style.chart.xAxis.labels.suffix,
                                            r: FINAL_CONFIG.style.chart.selector.labels.rounding
                                        })
                                    ) }}
                                </text>
                            </template>
                        </template>
                    </template>
                </template>
            </g>
            <slot name="svg" :svg="svg" />
        </svg>

        <div v-if="$slots.watermark" class="vue-data-ui-watermark">
            <slot name="watermark" v-bind="{ isPrinting: isPrinting || isImaging }" />
        </div>

        <div ref="chartLegend">
            <Legend v-if="FINAL_CONFIG.style.chart.legend.show" :key="`legend_${legendStep}`" :legendSet="legendSet"
                :config="legendConfig" @clickMarker="({ legend }) => segregate(legend.id)">
                <template #legend-pattern="{ legend, index }" v-if="$slots.pattern">
                    <Shape :shape="legend.shape" :radius="30" stroke="none" :plot="{ x: 30, y: 30 }"
                        :fill="`url(#pattern_${uid}_${index})`" />
                </template>

                <template #item="{ legend }">
                    <div data-cy="legend-item" :style="`opacity:${segregated.includes(legend.id) ? 0.5 : 1}`" v-if="!loading"
                        @click="legend.segregate()">
                        {{ legend.name }}
                    </div>
                </template>
            </Legend>
            <slot name="legend" v-bind:legend="legendSet" />
        </div>

        <div v-if="$slots.source" ref="source" dir="auto">
            <slot name="source" />
        </div>

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
                    @close="closeTable">
                    <template #th="{ th }">
                        <div v-html="th" />
                    </template>
                    <template #td="{ td }">
                        {{ td.name ? td.name : applyDataLabel(
                            FINAL_CONFIG.style.chart.selector.labels.formatter,
                            td,
                            dataLabel({
                                p: FINAL_CONFIG.style.chart.xAxis.labels.prefix,
                                v: td,
                                s: FINAL_CONFIG.style.chart.xAxis.labels.suffix,
                                r: FINAL_CONFIG.table.td.roundingValue
                            })
                        ) }}
                    </template>
                </DataTable>
            </template>
        </component>

        <BaseDraggableDialog 
            v-if="FINAL_CONFIG.style.chart.dialog.show" 
            ref="dialog" 
            @close="selectedDatapoint = null"
            :backgroundColor="FINAL_CONFIG.style.chart.dialog.backgroundColor"
            :color="FINAL_CONFIG.style.chart.dialog.color"
            :headerBg="FINAL_CONFIG.style.chart.dialog.header.backgroundColor"
            :headerColor="FINAL_CONFIG.style.chart.dialog.header.color"
            :isFullscreen="isFullscreen"
            :fullscreenParent="ridgelineChart"
            withPadding
        >
            <template #title>
                {{ selectedDatapoint.name }}
            </template>
            <template #content>
                <VueUiXy v-if="selectedDatapoint" :config="xyConfig" :dataset="xyDataset" />
            </template>
        </BaseDraggableDialog>

        <!-- v3 Skeleton loader -->
        <BaseScanner v-if="loading" />
    </div>
</template>

<style scoped lang="scss">
@import "../vue-data-ui.css";

.vue-ui-ridgeline * {
    transition: unset;
}

.vue-ui-ridgeline {
    user-select: none;
    position: relative;
}

@keyframes vueDataUiLineAnimation {
    to {
        stroke-dashoffset: 0;
    }
}

.vue-data-ui-line-animated {
    animation: vueDataUiLineAnimation 1.5s ease-out forwards;
}

.vue-ui-ridgeline-animate {
    transform-origin: center;
    animation: lineAnimation 0.5s ease-in-out, vueDataUiLineAnimation 0.5s ease-out forwards;
}

@keyframes lineAnimation {
    0% {
        transform: scale(0.9, 0.9);
        opacity: 0;
    }

    80% {
        transform: scale(1.02, 1.02);
        opacity: 1;
    }

    to {
        transform: scale(1, 1);
        opacity: 1;
    }
}
</style>