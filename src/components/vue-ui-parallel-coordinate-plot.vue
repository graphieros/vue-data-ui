<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { 
    XMLNS,
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
    isFunction, 
    objectIsEmpty, 
    palette, 
    themePalettes,
    getPathLengthFromCoordinates,
    translateSize
} from "../lib";
import { throttle } from "../canvas-lib";
import mainConfig from "../default_configs.json";
import themes from "../themes.json";
import Title from "../atoms/Title.vue";
import Legend from "../atoms/Legend.vue";
import Tooltip from "../atoms/Tooltip.vue";
import Shape from "../atoms/Shape.vue";
import UserOptions from "../atoms/UserOptions.vue";
import DataTable from "../atoms/DataTable.vue";
import Accordion from "./vue-ui-accordion.vue";
import Skeleton from "./vue-ui-skeleton.vue";
import { useNestedProp } from "../useNestedProp";
import { usePrinter } from "../usePrinter";
import { useResponsive } from "../useResponsive";

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

const uid = ref(createUid());
const defaultConfig = ref(mainConfig.vue_ui_parallel_coordinate_plot);

const isFullscreen = ref(false)
function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
}

const pcpConfig = computed(() => {
    const mergedConfig = useNestedProp({
        userConfig: props.config,
        defaultConfig: defaultConfig.value
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
});

const resizeObserver = ref(null);

onMounted(() => {
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

    if (pcpConfig.value.responsive) {
        const handleResize = throttle(() => {
            const { width, height } = useResponsive({
                chart: pcpChart.value,
                title: pcpConfig.value.style.chart.title.text ? chartTitle.value : null,
                legend: pcpConfig.value.style.chart.legend.show ? chartLegend.value : null,
            });
            chartDimensions.value.width = width;
            chartDimensions.value.height = height;
            chartDimensions.value.plotSize = translateSize({
                relator: Math.min(width, height),
                adjuster: 600,
                source: pcpConfig.value.style.chart.plots.radius,
                threshold: 2,
                fallback: 2
            });
            chartDimensions.value.ticksFontSize = translateSize({
                relator: Math.min(width, height),
                adjuster: 600,
                source: pcpConfig.value.style.chart.yAxis.labels.ticks.fontSize,
                threshold: 10,
                fallback: 10
            });
            chartDimensions.value.datapointFontSize = translateSize({
                relator: Math.min(width, height),
                adjuster: 600,
                source: pcpConfig.value.style.chart.yAxis.labels.datapoints.fontSize,
                threshold: 10,
                fallback: 10
            });
            chartDimensions.value.axisNameFontSize = translateSize({
                relator: Math.min(width, height),
                adjuster: 600,
                source: pcpConfig.value.style.chart.yAxis.labels.axisNamesFontSize,
                threshold: 12,
                fallback: 12
            })
        });

        resizeObserver.value = new ResizeObserver(handleResize);
        resizeObserver.value.observe(pcpChart.value.parentNode);
    }
});

onBeforeUnmount(() => {
    if (resizeObserver.value) resizeObserver.value.disconnect();
});

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `pcp_${uid.value}`,
    fileName: pcpConfig.value.style.chart.title.text || 'vue-ui-parallel-coordinate-plot'
});

const chartDimensions = ref({
    height: pcpConfig.value.style.chart.height,
    width: pcpConfig.value.style.chart.width,
    plotSize: pcpConfig.value.style.chart.plots.radius, // ratio 100
    ticksFontSize: pcpConfig.value.style.chart.yAxis.labels.ticks.fontSize, // ratio 42.85
    datapointFontSize: pcpConfig.value.style.chart.yAxis.labels.datapoints.fontSize,
    axisNameFontSize: pcpConfig.value.style.chart.yAxis.labels.axisNamesFontSize

})

const drawingArea = computed(() => {
    const { top: p_top, right: p_right, bottom: p_bottom, left: p_left } = pcpConfig.value.style.chart.padding;
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
    return convertCustomPalette(pcpConfig.value.customPalette);
})

const mutableConfig = ref({
    dataLabels: {
        show: pcpConfig.value.style.chart.yAxis.labels.datapoints.show
    },
    showTable: pcpConfig.value.table.show,
    showTooltip: pcpConfig.value.style.chart.tooltip.show
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
        return {
            ...ds,
            series: ds.series.map(s => {
                return {
                    ...s,
                    id: createUid()
                }
            }),
            seriesIndex: i,
            color: convertColorToHex(ds.color) || customPalette.value[i] || palette[i] || palette[i % palette.length],
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
        backgroundColor: pcpConfig.value.style.chart.legend.backgroundColor,
        color: pcpConfig.value.style.chart.legend.color,
        fontSize: pcpConfig.value.style.chart.legend.fontSize,
        paddingBottom: 12,
        fontWeight: pcpConfig.value.style.chart.legend.bold ? 'bold' : ''
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
        const min = Math.min(...filteredDs.value.flatMap(ds => ds.series.map(s => s.values[i]) || 0));
        const max = Math.max(...filteredDs.value.flatMap(ds => ds.series.map(s => s.values[i]) || 0));
        const opMin = max === min ? min / 4 : min;
        const opMax = max === min ? max * 2 : max;
        const scale = calculateNiceScale(opMin, opMax, pcpConfig.value.style.chart.yAxis.scaleTicks);
        const ticks = scale.ticks.map((t, k) => {
            const senseValue = scale.min < 0 ? t + Math.abs(scale.min) : t - Math.abs(scale.min);
            const senseMax = scale.min < 0 ? scale.max + Math.abs(scale.min) : scale.max - Math.abs(scale.min);
            return {
                y: drawingArea.value.bottom - (drawingArea.value.height * (senseValue / senseMax)),
                x: drawingArea.value.left + (slot.value * i) + (slot.value / 2),
                value: t
            }
        });
        s.push({
            scale,
            ticks,
            name: pcpConfig.value.style.chart.yAxis.labels.axisNames[i] || `Y-${i + 1}`
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
                                value: v,
                                x: drawingArea.value.left + (slot.value * k) + (slot.value / 2),
                                y: drawingArea.value.bottom - (drawingArea.value.height * (senseValue / senseMax))
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
                    const pathLength = getPathLengthFromCoordinates(pcpConfig.value.style.chart.lines.smooth ? `M ${smoothPath}`: `M ${straightPath}`) 
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


function makeDataLabel({ value, index }) {
    return dataLabel({
        p: pcpConfig.value.style.chart.yAxis.labels.prefixes[index] || '',
        v: value,
        s: pcpConfig.value.style.chart.yAxis.labels.suffixes[index] || '',
        r: pcpConfig.value.style.chart.yAxis.labels.roundings[index] || 0
    });
}

const selectedItem = ref(null);
const dataTooltipSlot = ref(null);
const isTooltip = ref(false);
const tooltipContent = ref("");

function useTooltip({ shape, serieName, serie, relativeIndex, seriesIndex }) {
    dataTooltipSlot.value = { serie, relativeIndex, seriesIndex, series: immutableDataset.value, scales: scales.value };
    isTooltip.value = true;
    selectedItem.value = serie.id;
    let html = ""

    const customFormat = pcpConfig.value.style.chart.tooltip.customFormat;

    if (isFunction(customFormat) && functionReturnsString(() => customFormat({
        serie,
        seriesIndex: serie.seriesIndex,
        series: immutableDataset.value,
        config: pcpConfig.value,
        scales: scales.value
    }))) {
        tooltipContent.value = customFormat({
            serie,
            seriesIndex: serie.seriesIndex,
            series: immutableDataset.value,
            config: pcpConfig.value,
            scales: scales.value
        });
    } else {
        html += `<div style="width:100%;text-align:center;border-bottom:1px solid ${pcpConfig.value.style.chart.tooltip.borderColor};padding-bottom:6px;margin-bottom:3px;">${serieName ? serieName + ' - ' : ''}${serie.name}</div>`;
        scales.value.map(s => s.name).forEach((s, i) => {
            html += `
                <div class="vue-ui-tooltip-item" style="text-align:left">
                    <span>${s} : </span>
                    <span>
                        ${dataLabel({
                            p: pcpConfig.value.style.chart.yAxis.labels.prefixes[i] || '',
                            v: serie.datapoints[i].value,
                            s: pcpConfig.value.style.chart.yAxis.labels.suffixes[i] || '',
                            r: pcpConfig.value.style.chart.yAxis.labels.roundings[i] || '',
                        })}    
                    </span>
                </div>
            `
        })
        tooltipContent.value = `<div>${html}</div>`;
    }
}

function getData() {
    return immutableDataset.value;
}

const dataTable = computed(() => {
    const head = [pcpConfig.value.table.columnNames.series].concat([pcpConfig.value.table.columnNames.item]).concat(scales.value.map(s => s.name));
    const body = mutableDataset.value.flatMap((ds, i) => {
        return ds.series.map(s => {
            return [ds.name].concat([s.name]).concat(s.values)
        })
    });

    const config = {
        th: {
            backgroundColor: pcpConfig.value.table.th.backgroundColor,
            color: pcpConfig.value.table.th.color,
            outline: pcpConfig.value.table.th.outline
        },
        td: {
            backgroundColor: pcpConfig.value.table.td.backgroundColor,
            color: pcpConfig.value.table.td.color,
            outline: pcpConfig.value.table.td.outline
        },
        breakpoint: pcpConfig.value.table.responsiveBreakpoint
    }

    const colNames = [pcpConfig.value.table.columnNames.series].concat([pcpConfig.value.table.columnNames.item]).concat(scales.value.map(s => s.name))

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
    const title = [[pcpConfig.value.style.chart.title.text], [pcpConfig.value.style.chart.title.subtitle.text], [""]];
    const head = tableCsv.value.head
    const body = tableCsv.value.body;
    const table = title.concat([head]).concat(body);
    const csvContent = createCsvContent(table);
    downloadCsv({ csvContent, title: pcpConfig.value.style.chart.title.text || 'vue-ui-parallel-coordinate-plot'});
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

defineExpose({
    getData,
    generateCsv,
    generatePdf,
    generateImage,
    toggleTable,
    toggleLabels,
    toggleTooltip
});

</script>

<template>
    <div
        ref="pcpChart"
        :class="`vue-ui-pcp ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''} ${pcpConfig.useCssAnimation ? '' : 'vue-ui-dna'}`" 
        :style="`font-family:${pcpConfig.style.fontFamily};width:100%; text-align:center;${!pcpConfig.style.chart.title.text ? 'padding-top:36px' : ''};background:${pcpConfig.style.chart.backgroundColor};${pcpConfig.responsive ? 'height:100%' : ''}`" 
        :id="`pcp_${uid}`"
    >

        <div ref="chartTitle" v-if="pcpConfig.style.chart.title.text" :style="`width:100%;background:${pcpConfig.style.chart.backgroundColor};padding-bottom:24px`">
            <Title
                :config="{
                    title: {
                        cy: 'pcp-div-title',
                        text: pcpConfig.style.chart.title.text,
                        color: pcpConfig.style.chart.title.color,
                        fontSize: pcpConfig.style.chart.title.fontSize,
                        bold: pcpConfig.style.chart.title.bold
                    },
                    subtitle: {
                        cy: 'pcp-div-subtitle',
                        text: pcpConfig.style.chart.title.subtitle.text,
                        color: pcpConfig.style.chart.title.subtitle.color,
                        fontSize: pcpConfig.style.chart.title.subtitle.fontSize,
                        bold: pcpConfig.style.chart.title.subtitle.bold
                    }
                }"
            />
        </div>

        <UserOptions
            ref="details"
            :key="`user_options_${step}`"
            v-if="pcpConfig.userOptions.show && isDataset"
            :backgroundColor="pcpConfig.style.chart.backgroundColor"
            :color="pcpConfig.style.chart.color"
            :isPrinting="isPrinting"
            :isImaging="isImaging"
            :uid="uid"
            :hasTooltip="pcpConfig.userOptions.buttons.tooltip && pcpConfig.style.chart.tooltip.show"
            :hasPdf="pcpConfig.userOptions.buttons.pdf"
            :hasXls="pcpConfig.userOptions.buttons.csv"
            :hasImg="pcpConfig.userOptions.buttons.img"
            :hasTable="pcpConfig.userOptions.buttons.table"
            :hasLabel="pcpConfig.userOptions.buttons.labels"
            :hasFullscreen="pcpConfig.userOptions.buttons.fullscreen"
            :isFullscreen="isFullscreen"
            :isTooltip="mutableConfig.showTooltip"
            :chartElement="pcpChart"
            @toggleFullscreen="toggleFullscreen"
            @generatePdf="generatePdf"
            @generateCsv="generateCsv"
            @generateImage="generateImage"
            @toggleTable="toggleTable"
            @toggleLabels="toggleLabels"
            @toggleTooltip="toggleTooltip"
        >
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
        </UserOptions>

        <svg 
            :xmlns="XMLNS" 
            v-if="isDataset" :class="{ 'vue-data-ui-fullscreen--on': isFullscreen, 'vue-data-ui-fulscreen--off': !isFullscreen }" :viewBox="`0 0 ${drawingArea.chartWidth <= 0 ? 10 : drawingArea.chartWidth} ${drawingArea.chartHeight <= 0 ? 10 : drawingArea.chartHeight}`" 
            :style="`max-width:100%; overflow: visible; background:${pcpConfig.style.chart.backgroundColor};color:${pcpConfig.style.chart.color}`"
        >

            <!-- SCALES -->
            <g v-for="(scale, i) in scales" style="pointer-events: none;">
                <!-- AXIS -->
                <line
                    :x1="drawingArea.left + (slot * i) + (slot / 2)"
                    :x2="drawingArea.left + (slot * i) + (slot / 2)"
                    :y1="drawingArea.top"
                    :y2="drawingArea.bottom"
                    :stroke="pcpConfig.style.chart.yAxis.stroke"
                    :stroke-width="pcpConfig.style.chart.yAxis.strokeWidth"
                />

                <!-- AXIS NAMES -->
                <text
                    :x="drawingArea.left + (slot * i) + (slot / 2)"
                    :y="drawingArea.top - 24"
                    :fill="pcpConfig.style.chart.yAxis.labels.axisNamesColor"
                    :font-size="chartDimensions.axisNameFontSize"
                    :font-weight="pcpConfig.style.chart.yAxis.labels.axisNamesBold ? 'bold' : ''"
                    text-anchor="middle"
                >
                    {{ scale.name }}
                </text>


                <template v-if="pcpConfig.style.chart.yAxis.labels.ticks.show">                
                    <!-- TICKS -->
                    <line v-for="tick in scale.ticks"
                        :x1="tick.x"
                        :x2="tick.x - 10"
                        :y1="tick.y"
                        :y2="tick.y"
                        :stroke="pcpConfig.style.chart.yAxis.stroke"
                        :stroke-width="pcpConfig.style.chart.yAxis.strokeWidth"
                        :style="`opacity:${selectedItem && !mutableConfig.showTooltip ? 0.2 : 1}`"
                    />
                    
                    <!-- TICK LABELS -->
                    <text 
                        v-for="(tick) in scale.ticks"
                        :x="tick.x - 12 + pcpConfig.style.chart.yAxis.labels.ticks.offsetX"
                        :y="tick.y + pcpConfig.style.chart.yAxis.labels.ticks.offsetY + (chartDimensions.ticksFontSize / 3)"
                        :fill="pcpConfig.style.chart.yAxis.labels.ticks.color"
                        text-anchor="end"
                        :font-size="chartDimensions.ticksFontSize"
                        :font-weight="pcpConfig.style.chart.yAxis.labels.ticks.bold ? 'bold' : 'normal'"
                        :style="`opacity:${selectedItem && !mutableConfig.showTooltip ? 0.2 : 1}`"
                    >
                        {{ makeDataLabel({ value: tick.value, index: i }) }}
                    </text>
                </template>
            </g>
            <g v-for="serie in mutableDataset">
                <!-- DATAPOINTS -->
                <g v-for="(serieSet, i) in serie.series">
                    <!-- PLOTS -->
                    <g v-if="pcpConfig.style.chart.plots.show">
                        <Shape 
                            v-for="dp in serieSet.datapoints"
                            :plot="{ x: dp.x, y: dp.y }"
                            :color="serie.color"
                            :shape="serie.shape"
                            :radius="serie.shape === 'triangle' ? chartDimensions.plotSize * 1.2 : chartDimensions.plotSize"
                            :stroke="pcpConfig.style.chart.backgroundColor"
                            :strokeWidth="0.5"
                            @mouseenter="useTooltip({
                                shape: serie.shape,
                                serieName: serie.name,
                                serie: serieSet,
                                relativeIndex: i,
                                seriesIndex: serieSet.seriesIndex
                            })"
                            @mouseleave="selectedItem = null; isTooltip = false;"
                            :style="`opacity:${selectedItem ? selectedItem === serieSet.id ? pcpConfig.style.chart.plots.opacity : 0.2 : pcpConfig.style.chart.plots.opacity}`"
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
                    </g>

                    <!-- LABELS -->
                    <template v-if="mutableConfig.dataLabels.show || (selectedItem && selectedItem === serieSet.id)">
                        <text 
                            v-for="(dp, k) in serieSet.datapoints"
                            :x="dp.x + 12 + pcpConfig.style.chart.yAxis.labels.datapoints.offsetX"
                            :y="dp.y + pcpConfig.style.chart.yAxis.labels.datapoints.offsetY + (chartDimensions.datapointFontSize / 3)"
                            :fill="pcpConfig.style.chart.yAxis.labels.datapoints.useSerieColor ? serie.color : pcpConfig.style.chart.yAxis.labels.datapoints.color"
                            text-anchor="start"
                            :font-weight="pcpConfig.style.chart.yAxis.labels.datapoints.bold ? 'bold' : 'normal'"
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
                            {{ makeDataLabel({ value: dp.value, index: k }) }}
                        </text>
                    </template>

                    <!-- LINES -->
                    <path 
                        :d="`M${pcpConfig.style.chart.lines.smooth ? serieSet.smoothPath : serieSet.straightPath}`" 
                        :stroke="serie.color" 
                        :stroke-width="pcpConfig.style.chart.lines.strokeWidth"
                        fill="none"
                        :class="{ 'vue-ui-pcp-animated vue-data-ui-line-animated': pcpConfig.useCssAnimation, 'vue-ui-pcp-transition': true  }"
                        @mouseenter="useTooltip({
                            shape: serie.shape,
                            serieName: serie.name,
                            serie: serieSet,
                            relativeIndex: i,
                            seriesIndex: serieSet.seriesIndex
                        })"
                        @mouseleave="selectedItem = null; isTooltip = false;"
                        :style="`opacity:${selectedItem ? selectedItem === serieSet.id ? pcpConfig.style.chart.lines.opacity : 0.2 : pcpConfig.style.chart.lines.opacity}; stroke-dasharray:${serieSet.pathLength}; stroke-dashoffset: ${pcpConfig.useCssAnimation ? serieSet.pathLength : 0}`"
                        
                    />
                </g>
            </g>
            <slot name="svg" :svg="drawingArea"/>
        </svg>

        <Skeleton 
            v-if="!isDataset"
            :config="{
                type: 'parallelCoordinatePlot',
                style: {
                    backgroundColor: pcpConfig.style.chart.backgroundColor,
                }
            }"
        />
        
        <div ref="chartLegend">
            <Legend
                v-if="pcpConfig.style.chart.legend.show && isDataset"
                :legendSet="legendSet"
                :config="legendConfig"
                @clickMarker="({ legend }) => { segregate(legend.id); selectLegend(legend) }"
            >
                <template #item="{ legend, index }">
                    <div :data-cy="`legend-item-${index}`" @click="legend.segregate(); selectLegend(legend)" :style="`opacity:${segregated.includes(legend.id) ? 0.5 : 1}`">
                        {{ legend.name }}
                    </div>
                </template>
            </Legend>
    
            <slot v-else name="legend" v-bind:legend="immutableDataset"/>
        </div>

        <Tooltip
            :show="mutableConfig.showTooltip && isTooltip"
            :backgroundColor="pcpConfig.style.chart.tooltip.backgroundColor"
            :color="pcpConfig.style.chart.tooltip.color"
            :fontSize="pcpConfig.style.chart.tooltip.fontSize"
            :borderRadius="pcpConfig.style.chart.tooltip.borderRadius"
            :borderColor="pcpConfig.style.chart.tooltip.borderColor"
            :borderWidth="pcpConfig.style.chart.tooltip.borderWidth"
            :parent="pcpChart"
            :content="tooltipContent"
            :isCustom="isFunction(pcpConfig.style.chart.tooltip.customFormat)"
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
                    backgroundColor: pcpConfig.style.chart.backgroundColor,
                    color: pcpConfig.style.chart.color
                },
                head: {
                    backgroundColor: pcpConfig.style.chart.backgroundColor,
                    color: pcpConfig.style.chart.color
                }
            }"
        >
            <template #content>
                <DataTable
                    :colNames="dataTable.colNames"
                    :head="dataTable.head"
                    :body="dataTable.body"
                    :config="dataTable.config"
                    :title="`${pcpConfig.style.chart.title.text}${pcpConfig.style.chart.title.subtitle.text ? ` : ${pcpConfig.style.chart.title.subtitle.text}` : ''}`"
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