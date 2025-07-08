<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount, nextTick, defineAsyncComponent, shallowRef } from "vue";
import {
    adaptColorToBackground,
    applyDataLabel,
    convertColorToHex,
    convertCustomPalette,
    createCsvContent,
    createSmoothAreaSegments,
    createSmoothPath,
    createStraightPath,
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
    XMLNS
} from "../lib";
import { useUserOptionState } from "../useUserOptionState";
import { useChartAccessibility } from "../useChartAccessibility";
import { usePrinter } from "../usePrinter";
import { throttle } from "../canvas-lib";
import { useResponsive } from "../useResponsive";
import { useConfig } from "../useConfig";
import { useNestedProp } from "../useNestedProp";
import themes from "../themes.json";
import Legend from "../atoms/Legend.vue";
import Title from "../atoms/Title.vue";
import Shape from "../atoms/Shape.vue";
import { useTimeLabels } from "../useTimeLabels";

const Accordion = defineAsyncComponent(() => import('./vue-ui-accordion.vue'));
const BaseDraggableDialog = defineAsyncComponent(() => import('../atoms/BaseDraggableDialog.vue'));
const DataTable = defineAsyncComponent(() => import('../atoms/DataTable.vue'));
const PackageVersion = defineAsyncComponent(() => import('../atoms/PackageVersion.vue'));
const PenAndPaper = defineAsyncComponent(() => import('../atoms/PenAndPaper.vue'));
const Skeleton = defineAsyncComponent(() => import('./vue-ui-skeleton.vue'));
const UserOptions = defineAsyncComponent(() => import('../atoms/UserOptions.vue'));
const VueUiXy = defineAsyncComponent(() => import('./vue-ui-xy.vue'));

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
        return !!props.dataset && props.dataset.length;
    },
    set(bool) {
        return bool;
    }
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

const FINAL_CONFIG = computed({
    get: () => {
        return prepareConfig();
    },
    set: (newCfg) => {
        return newCfg;
    }
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

onMounted(prepareChart);

function prepareChart() {
    if (objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiRidgeline',
            type: 'dataset'
        });
    } else {
        props.dataset.forEach((ds, i) => {
            getMissingDatasetAttributes({
                datasetObject: ds,
                requiredAttributes: ['name', 'datapoints']
            }).forEach(attr => {
                isDataset.value = false;
                error({
                    componentName: 'VueUiRidgeline',
                    type: 'datasetSerieAttribute',
                    property: attr,
                    index: i
                });
            });

            if (ds.datapoints.length) {
                ds.datapoints.forEach((dp, j) => {
                    getMissingDatasetAttributes({
                        datasetObject: dp,
                        requiredAttributes: ['name', 'values']
                    }).forEach(attr => {
                        isDataset.value = false;
                        error({
                            componentName: 'VueUiRidgeline',
                            type: 'datasetSerieAttribute',
                            property: `datapoint.${attr}`,
                            index: `${i}-${j}`
                        });
                    });
                });
            }
        });
    }

    rowCount.value = props.dataset.length;

    rowHeight.value = Math.min(
        FINAL_CONFIG.value.style.chart.areas.height,
        FINAL_CONFIG.value.style.chart.areas.rowHeight,
    );

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
                rowHeight.value = (height / props.dataset.length);
                parentHeight.value = height
            });
        });

        if (resizeObserver.value) {
            if (observedEl.value) {
                resizeObserver.value.unobserve(observedEl.value);
            }
            resizeObserver.value.disconnect();
        }

        resizeObserver.value = new ResizeObserver(handleResize);
        observedEl.value = ridgelineChart.value.parentNode;
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

watch(() => props.config, (_newCfg) => {
    FINAL_CONFIG.value = prepareConfig();
    userOptionsVisible.value = !FINAL_CONFIG.value.userOptions.showOnChartHover;
    prepareChart();
    titleStep.value += 1;
    legendStep.value += 1;
    rowHeight.value = Math.min(
        FINAL_CONFIG.value.style.chart.areas.height,
        FINAL_CONFIG.value.style.chart.areas.rowHeight
    );
    mutableConfig.value.showTable = FINAL_CONFIG.value.table.show;
}, { deep: true });

watch(() => props.dataset, prepareChart, { deep: true });

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
    if (!isDataset.value) return []

    return props.dataset.map((ds, i) => {
        return {
            ...ds,
            labelLen: measureSvgTextWidth(ds.name, FINAL_CONFIG.value.style.chart.yAxis.labels.fontSize),
            uid: createUid(),
            datapoints: ds.datapoints.map((dp, j) => {
                const color = dp.color ? convertColorToHex(dp.color) : customPalette.value[j] || palette[j] || palette[j % palette.length];
                const id = slugify(dp.name);
                return {
                    ...dp,
                    color,
                    id
                }
            })
        }
    });
});

const baseHeight = computed(() => {
    return FINAL_CONFIG.value.style.chart.padding.top + (rowHeight.value * props.dataset.length) + (rowHeight.value * overlapRatio.value);
});

const drawableArea = computed(() => {
    return {
        fullHeight: svg.value.padding.top + svg.value.padding.bottom + svg.value.height,
        top: svg.value.padding.top,
        left: svg.value.padding.left,
        right: svg.value.width - svg.value.padding.right,
        bottom: svg.value.padding.top + svg.value.height,
        width: svg.value.width - (svg.value.padding.left + svg.value.padding.right)
    }
});

const svg = computed(() => {
    const padding = FINAL_CONFIG.value.style.chart.padding;
    return {
        width: baseWidth.value,
        height: baseHeight.value,
        padding
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
    const slotSize = (drawableArea.value.width - startX) / maxDpLen.value;

    const arr = [];

    for (let i = 0; i < maxDpLen.value; i += 1) {
        arr.push({
            selectorX: startX + (slotSize * i),
            x: startX + (slotSize * i) - slotSize / 2,
            y: drawableArea.value.top,
            label: FINAL_CONFIG.value.style.chart.xAxis.labels.values[i] ? timeLabels.value[i].text : '',
            index: i,
            width: slotSize,
            height: baseHeight.value
        })
    }
    return arr;
})

function selectX(trap) {
    emit('selectX', formattedDataset.value.map(ds => {
        return ds.datapoints.map(dp => {
            return {
                dp,
                selected: dp.values[trap.index]
            }
        });
    }));
}

function stringSize(str, fontSize) {
    const len = str.length;
    return (len * fontSize / 2) + fontSize;
}

function isTextOverflowingRight(x, text, fontSize) {
    const size = stringSize(text, fontSize);
    return x + size > drawableArea.value.right;
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
    const _rh = rowHeight.value

    const maxLabelLen = Math.max(...formattedDataset.value.map(el => el.labelLen));
    const maxDpLen = Math.max(...formattedDataset.value.flatMap(el => el.datapoints.map(dp => dp.values.length)));
    const maxVal = Math.max(...formattedDataset.value.flatMap(el => el.datapoints.flatMap(dp => dp.values)));
    const minVal = Math.min(...formattedDataset.value.flatMap(el => el.datapoints.flatMap(dp => dp.values)));
    const startX = svg.value.padding.left + maxLabelLen + 16 + FINAL_CONFIG.value.style.chart.yAxis.labels.offsetX;
    const slotSize = (drawableArea.value.width - startX) / maxDpLen;
    const absoluteMin = Math.abs(Math.min(minVal, 0));
    const absoluteMax = maxVal + absoluteMin;

    function ratioToMax(v) {
        return isNaN(v / absoluteMax) ? 0 : v / absoluteMax;
    }

    return formattedDataset.value.map((ds, i) => {
        const base = drawableArea.value.top + (rowHeight.value * (i));
        const zero = drawableArea.value.top + base + ((rowHeight.value * overlapRatio.value) * (1 - (ratioToMax(absoluteMin))));
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
                        const y = drawableArea.value.top + base + ((rowHeight.value * overlapRatio.value) * (1 - ratioToMax(absoluteValue + absoluteMin)));
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

defineExpose({
    getData,
    generateImage,
    generatePdf,
    generateCsv,
    toggleAnnotator,
    toggleTable
});

</script>

<template>
    <div ref="ridgelineChart" :class="`vue-ui-ridgeline ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''}`"
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
        <UserOptions ref="details" :key="`user_option_${step}`"
            v-if="FINAL_CONFIG.userOptions.show && isDataset && (keepUserOptionState ? true : userOptionsVisible)"
            :backgroundColor="FINAL_CONFIG.style.chart.backgroundColor" :color="FINAL_CONFIG.style.chart.color"
            :isPrinting="isPrinting" :isImaging="isImaging" :uid="uid" :hasTooltip="false" :callbacks="FINAL_CONFIG.userOptions.callbacks" 
            :hasPdf="FINAL_CONFIG.userOptions.buttons.pdf" :hasImg="FINAL_CONFIG.userOptions.buttons.img"
            :hasXls="FINAL_CONFIG.userOptions.buttons.csv" :hasTable="FINAL_CONFIG.userOptions.buttons.table"
            :hasLabel="false" :hasFullscreen="FINAL_CONFIG.userOptions.buttons.fullscreen" :isFullscreen="isFullscreen"
            :chartElement="ridgelineChart" :position="FINAL_CONFIG.userOptions.position" :isTooltip="false"
            :titles="{ ...FINAL_CONFIG.userOptions.buttonTitles }"
            :hasAnnotator="FINAL_CONFIG.userOptions.buttons.annotator" :isAnnotation="isAnnotator" :style="{
                visibility: keepUserOptionState ? userOptionsVisible ? 'visible' : 'hidden' : 'visible'
            }" @toggleFullscreen="toggleFullscreen" @generatePdf="generatePdf" @generateCsv="generateCsv"
            @generateImage="generateImage" @toggleTable="toggleTable" @toggleAnnotator="toggleAnnotator">
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
        <svg ref="svgRef" :xmlns="XMLNS" v-if="isDataset"
            :class="{ 'vue-data-ui-fullscreen--on': isFullscreen, 'vue-data-ui-fulscreen--off': !isFullscreen }"
            :viewBox="`0 0 ${svg.width <= 0 ? 10 : svg.width} ${drawableArea.fullHeight <= 0 ? 10 : drawableArea.fullHeight}`"
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
                        :class="{ 'vue-ui-ridgeline-animate': FINAL_CONFIG.useCssAnimation }" 
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
                        :class="{ 'vue-ui-ridgeline-animate': FINAL_CONFIG.useCssAnimation }" 
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
            <g v-if="FINAL_CONFIG.style.chart.xAxis.labels.values.length">
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
                        transform: `translate(${xLabel.selectorX}, ${drawableArea.top + xLabel.height + FINAL_CONFIG.style.chart.xAxis.labels.offsetY}), rotate(${FINAL_CONFIG.style.chart.xAxis.labels.rotation})`,
                        x: xLabel.selectorX,
                        y: drawableArea.top + xLabel.height + FINAL_CONFIG.style.chart.xAxis.labels.offsetY
                    }">
                        <text
                            v-if="(xLabel && !FINAL_CONFIG.style.chart.xAxis.labels.showOnlyFirstAndLast && !FINAL_CONFIG.style.chart.xAxis.labels.showOnlyAtModulo) ||
                                (xLabel && FINAL_CONFIG.style.chart.xAxis.labels.showOnlyFirstAndLast && (i === 0 || i === xAxisTrapsAndLabels.length - 1)) ||
                                (xLabel && selectedX && selectedX.index === i) ||
                                (xLabel && !FINAL_CONFIG.style.chart.xAxis.labels.showOnlyFirstAndLast && FINAL_CONFIG.style.chart.xAxis.labels.showOnlyAtModulo && (i % Math.floor(xAxisTrapsAndLabels.length / FINAL_CONFIG.style.chart.xAxis.labels.modulo)) === 0)"
                            :font-size="FINAL_CONFIG.style.chart.xAxis.labels.fontSize"
                            :fill="FINAL_CONFIG.style.chart.xAxis.labels.color"
                            :font-weight="FINAL_CONFIG.style.chart.xAxis.labels.bold ? 'bold' : 'normal'"
                            :transform="`translate(${xLabel.selectorX}, ${drawableArea.top + xLabel.height + FINAL_CONFIG.style.chart.xAxis.labels.offsetY}), rotate(${FINAL_CONFIG.style.chart.xAxis.labels.rotation})`"
                            :text-anchor="FINAL_CONFIG.style.chart.xAxis.labels.rotation > 0 ? 'start' : FINAL_CONFIG.style.chart.xAxis.labels.rotation < 0 ? 'end' : 'middle'"
                            :style="{
                                opacity: selectedX ? selectedX.index === i ? 1 : 0.2 : 1
                            }">
                            {{ xLabel.label }}
                        </text>
                    </slot>
                </template>
            </g>

            <!-- TOOLTIP TRAPS, SELECTOR AND DATALABELS-->
            <g>
                <!-- TOOLTIP TRAPS -->
                <rect v-for="(trap, i) in xAxisTrapsAndLabels" :x="trap.x" :y="trap.y"
                    :width="trap.width < 0 ? 0.1 : trap.width" :height="trap.height < 0 ? 0.1 : trap.height"
                    fill="transparent" @mouseenter="selectedX = trap" @mouseleave="selectedX = null"
                    @click="() => selectX(trap)" />

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

        <Skeleton v-if="!isDataset" :config="{
            type: 'ridgeline',
            style: {
                backgroundColor: FINAL_CONFIG.style.chart.backgroundColor,
                ridgeline: {
                    color: '#CCCCCC'
                }
            }
        }" />

        <div ref="chartLegend">
            <Legend v-if="FINAL_CONFIG.style.chart.legend.show" :key="`legend_${legendStep}`" :legendSet="legendSet"
                :config="legendConfig" @clickMarker="({ legend }) => segregate(legend.id)">
                <template #legend-pattern="{ legend, index }" v-if="$slots.pattern">
                    <Shape :shape="legend.shape" :radius="30" stroke="none" :plot="{ x: 30, y: 30 }"
                        :fill="`url(#pattern_${uid}_${index})`" />
                </template>

                <template #item="{ legend }">
                    <div data-cy="legend-item" :style="`opacity:${segregated.includes(legend.id) ? 0.5 : 1}`"
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

        <!-- DATA TABLE -->
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
                <DataTable :key="`table_${tableStep}`" :colNames="dataTable.colNames" :head="dataTable.head"
                    :body="dataTable.body" :config="dataTable.config"
                    :title="`${FINAL_CONFIG.style.chart.title.text}${FINAL_CONFIG.style.chart.title.subtitle.text ? ` :${FINAL_CONFIG.style.chart.title.subtitle.text}` : ``}`"
                    @close="mutableConfig.showTable = false">
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
        </Accordion>

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
        >
            <template #title>
                {{ selectedDatapoint.name }}
            </template>
            <VueUiXy v-if="selectedDatapoint" :config="xyConfig" :dataset="xyDataset" />
        </BaseDraggableDialog>

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