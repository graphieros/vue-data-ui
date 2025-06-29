<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, defineAsyncComponent, shallowRef } from "vue";
import {
    applyDataLabel,
    calculateNiceScale, 
    convertColorToHex, 
    convertCustomPalette, 
    createCsvContent, 
    createSmoothPath,
    createStraightPath,
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
    XMLNS,
} from "../lib";
import { throttle } from "../canvas-lib";
import { useNestedProp } from "../useNestedProp";
import { usePrinter } from "../usePrinter";
import { useResponsive } from "../useResponsive";
import { useConfig } from "../useConfig";
import { useUserOptionState } from "../useUserOptionState";
import { useChartAccessibility } from "../useChartAccessibility";
import themes from "../themes.json";
import Title from "../atoms/Title.vue"; // Must be ready in responsive mode
import Legend from "../atoms/Legend.vue"; // Must be ready in responsive mode
import Shape from "../atoms/Shape.vue";

const Accordion = defineAsyncComponent(() => import('./vue-ui-accordion.vue'));
const DataTable = defineAsyncComponent(() => import('../atoms/DataTable.vue'));
const PackageVersion = defineAsyncComponent(() => import('../atoms/PackageVersion.vue'));
const PenAndPaper = defineAsyncComponent(() => import('../atoms/PenAndPaper.vue'));
const Skeleton = defineAsyncComponent(() => import('./vue-ui-skeleton.vue'));
const Tooltip = defineAsyncComponent(() => import('../atoms/Tooltip.vue'));
const UserOptions = defineAsyncComponent(() => import('../atoms/UserOptions.vue'));

const { vue_ui_parallel_coordinate_plot: DEFAULT_CONFIG } = useConfig();

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

const uid = ref(createUid());
const isFullscreen = ref(false)
function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
}

const FINAL_CONFIG = computed({
    get: () => {
        return prepareConfig();
    },
    set: (newCfg) => {
        return newCfg
    }
});

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
                userConfig: themes.vue_ui_parallel_coordinate_plot[mergedConfig.theme] || props.config,
                defaultConfig: mergedConfig
            }),
            customPalette: themePalettes[mergedConfig.theme] || palette
        }
    } else {
        return mergedConfig;
    }
}

watch(() => props.config, (_newCfg) => {
    FINAL_CONFIG.value = prepareConfig();
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

const resizeObserver = shallowRef(null);
const observedEl = shallowRef(null);

onMounted(() => {
    prepareChart();
});

function prepareChart() {
    if(objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiParallelCoordinatePlot',
            type: 'dataset'
        })
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
                    index: i
                });
            });
        });
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
                chartDimensions.value.height = height;
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

})

const drawingArea = computed(() => {
    const { top: p_top, right: p_right, bottom: p_bottom, left: p_left } = FINAL_CONFIG.value.style.chart.padding;
    const chartHeight = chartDimensions.value.height;
    const chartWidth = chartDimensions.value.width;
    return {
        chartHeight,
        chartWidth,
        height: chartHeight - p_top - p_bottom,
        width: chartWidth - p_left - p_right,
        top: p_top,
        left: p_left,
        right: chartWidth - p_right,
        bottom: chartHeight - p_bottom
    }
})

const customPalette = computed(() => {
    return convertCustomPalette(FINAL_CONFIG.value.customPalette);
})

const mutableConfig = ref({
    dataLabels: {
        show: FINAL_CONFIG.value.style.chart.yAxis.labels.datapoints.show
    },
    showTable: FINAL_CONFIG.value.table.show,
    showTooltip: FINAL_CONFIG.value.style.chart.tooltip.show
});

const segregated = ref([]);

function segregate(id) {
    if (segregated.value.includes(id)) {
        segregated.value = segregated.value.filter(el => el !== id);
    } else {
        segregated.value.push(id);
    }
}

const immutableDataset = computed(() => {
    return props.dataset.map((ds, i) => {
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
    })
});

const legendSet = computed(() => {
    return immutableDataset.value.map(ds => {
        return {
            ...ds,
            opacity: segregated.value.includes(ds.id) ? 0.5 : 1,
            segregate: () => segregate(ds.id),
            isSegregated: segregated.value.includes(ds.id)
        }
    })
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

function useTooltip({ shape, serieName, serie, relativeIndex, seriesIndex }) {
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

function generateCsv() {
    const title = [[FINAL_CONFIG.value.style.chart.title.text], [FINAL_CONFIG.value.style.chart.title.subtitle.text], [""]];
    const head = tableCsv.value.head
    const body = tableCsv.value.body;
    const table = title.concat([head]).concat(body);
    const csvContent = createCsvContent(table);
    downloadCsv({ csvContent, title: FINAL_CONFIG.value.style.chart.title.text || 'vue-ui-parallel-coordinate-plot'});
}

const emit = defineEmits(['selectLegend', 'selectDatapoint'])

function selectDatapoint(datapoint) {
    emit('selectDatapoint', datapoint)
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

defineExpose({
    getData,
    generateCsv,
    generatePdf,
    generateImage,
    toggleTable,
    toggleLabels,
    toggleTooltip,
    toggleAnnotator
});

</script>

<template>
    <div
        ref="pcpChart"
        :class="`vue-ui-pcp ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''} ${FINAL_CONFIG.useCssAnimation ? '' : 'vue-ui-dna'}`" 
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

        <UserOptions
            ref="details"
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
            v-if="isDataset" :class="{ 'vue-data-ui-fullscreen--on': isFullscreen, 'vue-data-ui-fulscreen--off': !isFullscreen }" :viewBox="`0 0 ${drawingArea.chartWidth <= 0 ? 10 : drawingArea.chartWidth} ${drawingArea.chartHeight <= 0 ? 10 : drawingArea.chartHeight}`" 
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

                <!-- AXIS NAMES -->
                <text
                    data-cy="pcp-axis-label"
                    :x="drawingArea.left + (slot * i) + (slot / 2)"
                    :y="drawingArea.top - 24"
                    :fill="FINAL_CONFIG.style.chart.yAxis.labels.axisNamesColor"
                    :font-size="chartDimensions.axisNameFontSize"
                    :font-weight="FINAL_CONFIG.style.chart.yAxis.labels.axisNamesBold ? 'bold' : ''"
                    text-anchor="middle"
                >
                    {{ scale.name }}
                </text>


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
                </template>
            </g>
            <g v-for="serie in mutableDataset">
                <!-- DATAPOINTS -->
                <g v-for="(serieSet, i) in serie.series">
                    <!-- PLOTS -->
                    <g v-if="FINAL_CONFIG.style.chart.plots.show">
                        <Shape
                            v-for="dp in serieSet.datapoints"
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
                                seriesIndex: serieSet.seriesIndex
                            })"
                            @mouseleave="selectedItem = null; isTooltip = false;"
                            :style="`opacity:${selectedItem ? selectedItem === serieSet.id ? FINAL_CONFIG.style.chart.plots.opacity : 0.2 : FINAL_CONFIG.style.chart.plots.opacity}`"
                            @click="() => selectDatapoint(dp)"
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
                    <template v-if="mutableConfig.dataLabels.show || (selectedItem && selectedItem === serieSet.id)">
                        <text
                            data-cy="plot-label"
                            v-for="(dp, k) in serieSet.datapoints"
                            :x="dp.x + 12 + FINAL_CONFIG.style.chart.yAxis.labels.datapoints.offsetX"
                            :y="dp.y + FINAL_CONFIG.style.chart.yAxis.labels.datapoints.offsetY + (chartDimensions.datapointFontSize / 3)"
                            :fill="FINAL_CONFIG.style.chart.yAxis.labels.datapoints.useSerieColor ? serie.color : FINAL_CONFIG.style.chart.yAxis.labels.datapoints.color"
                            text-anchor="start"
                            :font-weight="FINAL_CONFIG.style.chart.yAxis.labels.datapoints.bold ? 'bold' : 'normal'"
                            :class="{ 'vue-ui-pcp-animated': false, 'vue-ui-pcp-transition': true }"
                            :font-size="chartDimensions.datapointFontSize"
                            @mouseenter="useTooltip({
                                shape: serie.shape,
                                serieName: serie.name,
                                serie: serieSet,
                                relativeIndex: i,
                                seriesIndex: serieSet.seriesIndex
                            })"
                            @mouseleave="selectedItem = null; isTooltip = false;"
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
                        :class="{ 'vue-ui-pcp-animated vue-data-ui-line-animated': FINAL_CONFIG.useCssAnimation, 'vue-ui-pcp-transition': true  }"
                        @mouseenter="useTooltip({
                            shape: serie.shape,
                            serieName: serie.name,
                            serie: serieSet,
                            relativeIndex: i,
                            seriesIndex: serieSet.seriesIndex
                        })"
                        @mouseleave="selectedItem = null; isTooltip = false;"
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
                        :class="{ 'vue-ui-pcp-animated vue-data-ui-line-animated': FINAL_CONFIG.useCssAnimation, 'vue-ui-pcp-transition': true  }"
                        @mouseenter="useTooltip({
                            shape: serie.shape,
                            serieName: serie.name,
                            serie: serieSet,
                            relativeIndex: i,
                            seriesIndex: serieSet.seriesIndex
                        })"
                        @mouseleave="selectedItem = null; isTooltip = false;"
                        style="opacity:0"
                    />
                </g>
            </g>
            <slot name="svg" :svg="drawingArea"/>
        </svg>

        <div v-if="$slots.watermark" class="vue-data-ui-watermark">
            <slot name="watermark" v-bind="{ isPrinting: isPrinting || isImaging }"/>
        </div>

        <Skeleton 
            v-if="!isDataset"
            :config="{
                type: 'parallelCoordinatePlot',
                style: {
                    backgroundColor: FINAL_CONFIG.style.chart.backgroundColor,
                }
            }"
        />
        
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
        >
            <template #tooltip-before>
                <slot name="tooltip-before" v-bind="{...dataTooltipSlot}"></slot>
            </template>
            <template #tooltip-after>
                <slot name="tooltip-after" v-bind="{...dataTooltipSlot}"></slot>
            </template>
        </Tooltip>

        <Accordion 
            v-if="isDataset"
            hideDetails
            :config="{
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
            }"
        >
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
                        <div v-html="th"/>
                    </template>
                    <template #td="{ td }">
                        {{ td }}
                    </template>
                </DataTable>
            </template>
        </Accordion>

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