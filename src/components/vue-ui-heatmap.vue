<script setup>
import { ref, computed, nextTick, onMounted } from "vue";
import { 
    adaptColorToBackground, 
    applyDataLabel,
    createCsvContent, 
    createUid, 
    dataLabel,
    downloadCsv,
    error,
    functionReturnsString,
    getMissingDatasetAttributes,
    interpolateColorHex,
    isFunction,
    objectIsEmpty,
    XMLNS
} from "../lib";
import themes from "../themes.json";
import Title from "../atoms/Title.vue";
import UserOptions from "../atoms/UserOptions.vue";
import Tooltip from "../atoms/Tooltip.vue";
import Skeleton from "./vue-ui-skeleton.vue";
import BaseIcon from "../atoms/BaseIcon.vue";
import Accordion from "./vue-ui-accordion.vue";
import { useNestedProp } from "../useNestedProp";
import { usePrinter } from "../usePrinter";
import { useConfig } from "../useConfig";

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

const isDataset = computed(() => {
    return !!props.dataset && props.dataset.length;
})

if(objectIsEmpty(props.dataset)) {
    error({
        componentName: 'VueUiHeatmap',
        type: 'dataset'
    })
}

const uid = ref(createUid());
const heatmapChart = ref(null);
const details = ref(null);
const isTooltip = ref(false);
const tooltipContent = ref("");
const hoveredCell = ref(undefined);
const selectedClone = ref(null);
const step = ref(0);
const tableContainer = ref(null);
const isResponsive = ref(false);

const FINAL_CONFIG = computed(() => {
    const mergedConfig = useNestedProp({
        userConfig: props.config,
        defaultConfig: DEFAULT_CONFIG
    });
    if (mergedConfig.theme) {
        return {
            ...useNestedProp({
                userConfig: themes.vue_ui_heatmap[mergedConfig.theme] || props.config,
                defaultConfig: mergedConfig
            }),
        }
    } else {
        return mergedConfig;
    }
});

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `heatmap__${uid.value}`,
    fileName: FINAL_CONFIG.value.style.title.text || 'vue-ui-heatmap'
});

const mutableConfig = ref({
    showTable: FINAL_CONFIG.value.table.show,
    showTooltip: FINAL_CONFIG.value.style.tooltip.show
});

const breakpoint = computed(() => {
    return FINAL_CONFIG.value.table.responsiveBreakpoint
});

function observeTable() {
    const observer = new ResizeObserver((entries) => {
        entries.forEach(entry => {
            isResponsive.value = entry.contentRect.width < breakpoint.value;
        })
    })
    observer.observe(tableContainer.value)
}

onMounted(observeTable)

const maxX = computed(() => {
    return Math.max(...props.dataset.flatMap(el => (el.values || []).length));
});

const svg = computed(() => {
    const height = FINAL_CONFIG.value.style.layout.padding.top + FINAL_CONFIG.value.style.layout.padding.bottom + (props.dataset.length * FINAL_CONFIG.value.style.layout.cells.height);
    const width= FINAL_CONFIG.value.style.layout.padding.left + FINAL_CONFIG.value.style.layout.padding.right + ((maxX.value < props.dataset.length ? props.dataset.length : maxX.value) * FINAL_CONFIG.value.style.layout.cells.height);
    const heightWithLegend = height + (FINAL_CONFIG.value.style.legend.show ? (FINAL_CONFIG.value.style.legend.position === 'right' ? 0 : ((FINAL_CONFIG.value.style.layout.cells.height * 2))) : 0)

    return {
        height,
        heightWithLegend,
        width
    }
});

const legendPosition = computed(() => {
    return FINAL_CONFIG.value.style.legend.position;
})

const drawingArea = computed(() => {
    return {
        top: FINAL_CONFIG.value.style.layout.padding.top,
        left: FINAL_CONFIG.value.style.layout.padding.left,
        right: svg.value.width - FINAL_CONFIG.value.style.layout.padding.right - (legendPosition.value === "right" && FINAL_CONFIG.value.style.legend.show ? 92 : 0),
        bottom: svg.value.height - FINAL_CONFIG.value.style.layout.padding.bottom,
        height: svg.value.height - FINAL_CONFIG.value.style.layout.padding.top - FINAL_CONFIG.value.style.layout.padding.bottom,
        width: svg.value.width - FINAL_CONFIG.value.style.layout.padding.right - FINAL_CONFIG.value.style.layout.padding.left - (legendPosition.value === "right" && FINAL_CONFIG.value.style.legend.show ? 92 : 0)
    }
});

const sideLegendHeight = computed(() => {
    return cellSize.value.height * props.dataset.length
})


const maxValue = computed(() => {
    return Math.max(...props.dataset.flatMap(el => el.values));
});

const minValue = computed(() => {
    return Math.min(...props.dataset.flatMap(el => el.values));
});

const average = computed(() => {
    const allValues = props.dataset.flatMap(el => el.values);
    const sum = allValues.reduce((a,b) => a + b, 0);
    return sum / allValues.length;
});

const cellSize = computed(() => {
    return {
        width: (drawingArea.value.width / maxX.value),
        height: (drawingArea.value.width / (maxX.value < props.dataset.length ? props.dataset.length : maxX.value))
    }
});

const dataLabels = computed(() => {
    const yLabels = FINAL_CONFIG.value.style.layout.dataLabels.yAxis.values.length ? FINAL_CONFIG.value.style.layout.dataLabels.yAxis.values : props.dataset.map(ds => ds.name);
    const xLabels = FINAL_CONFIG.value.style.layout.dataLabels.xAxis.values
    return {
        yLabels,
        xLabels: xLabels.slice(0, maxX.value)
    }
});


const mutableDataset = computed(() => {

    props.dataset.forEach((ds, i) => {
        getMissingDatasetAttributes({
            datasetObject: ds,
            requiredAttributes: ['values']
        }) .forEach(attr => {
            error({
                componentName: 'VueUiHeatmap',
                type: 'datasetSerieAttribute',
                property: 'values',
                index: i
            })
        })
    });

    return props.dataset.map(ds => {
        return {
            ...ds,
            temperatures: (ds.values || []).map((v, i) => {
                if (v >= average.value) {
                    return {
                        side: "up",
                        color: interpolateColorHex(FINAL_CONFIG.value.style.layout.cells.colors.cold, FINAL_CONFIG.value.style.layout.cells.colors.hot, minValue.value, maxValue.value, v),
                        ratio: Math.abs((Math.abs(v - average.value) / Math.abs(maxValue.value - average.value))) > 1 ? 1 : Math.abs((Math.abs(v - average.value) / Math.abs(maxValue.value - average.value))),
                        value: v,
                        yAxisName: ds.name,
                        xAxisName: dataLabels.value.xLabels[i],
                        id: `vue-data-ui-heatmap-cell-${createUid()}`
                    }
                } else {
                    return {
                        side: "down",
                        ratio: Math.abs(1 - (Math.abs(v) / Math.abs(average.value))) > 1 ? 1 : Math.abs(1 - (Math.abs(v) / Math.abs(average.value))),
                        color: interpolateColorHex(FINAL_CONFIG.value.style.layout.cells.colors.cold, FINAL_CONFIG.value.style.layout.cells.colors.hot, minValue.value, maxValue.value, v),
                        value: v,
                        yAxisName: ds.name,
                        xAxisName: dataLabels.value.xLabels[i],
                        id: `vue-data-ui-heatmap-cell-${createUid()}`
                    }
                }
            })
        }
    })
});

const hoveredValue = ref(null);
const dataTooltipSlot = ref(null);

function useTooltip(datapoint, seriesIndex, x, y) {
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
        html += `<div data-cy="heatmap-tootlip-name">${yAxisName} ${xAxisName ? `${xAxisName}` : ''}</div>`;
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

const sideLegendIndicatorY = computed(() => {
    return drawingArea.value.top + (sideLegendHeight.value * (1 - hoveredValue.value / maxValue.value))
});

const bottomLegendIndicatorX = computed(() => {
    return drawingArea.value.left + ((svg.value.width - drawingArea.value.left - FINAL_CONFIG.value.style.layout.padding.right) * (hoveredValue.value / maxValue.value))
});

const table = computed(() => {
    const head = props.dataset.map(ds => {
        return {
            name: ds.name,
        }
    });
    const body = props.dataset.map(ds => ds.values);
    return { head, body };
});


function generateCsv() {
    nextTick(() => {
        const labels = ["", ...props.dataset.map((ds,i) => {
            return ds.name
        })];

        const values = [];

        for (let i = 0; i < dataLabels.value.xLabels.length; i += 1) {
            const row = [dataLabels.value.xLabels[i]];
            for (let j = 0; j < props.dataset.length; j += 1) {
                row.push([props.dataset[j].values[i]])
            }
            values.push(row)
        }

        const tableXls = [[FINAL_CONFIG.value.style.title.text],[FINAL_CONFIG.value.style.title.subtitle.text],[[""],[""],[""]]].concat([labels]).concat(values);
        const csvContent = createCsvContent(tableXls);
        downloadCsv({csvContent, title: FINAL_CONFIG.value.style.title.text || "vue-ui-heatmap"})
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

defineExpose({
    generatePdf,
    generateCsv,
    generateImage,
    toggleTable,
    toggleTooltip
});

</script>

<template>
    <div ref="heatmapChart" :class="`vue-ui-heatmap ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''}`" :style="`font-family:${FINAL_CONFIG.style.fontFamily};width:100%; text-align:center;${!FINAL_CONFIG.style.title.text ? 'padding-top:36px' : ''};background:${FINAL_CONFIG.style.backgroundColor}`" :id="`heatmap__${uid}`">
        <div v-if="FINAL_CONFIG.style.title.text" :style="`width:100%;background:${FINAL_CONFIG.style.backgroundColor}`">
            <Title
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
            ref="details"
            :key="`user_options_${step}`"
            v-if="FINAL_CONFIG.userOptions.show && isDataset"
            :backgroundColor="FINAL_CONFIG.style.backgroundColor"
            :color="FINAL_CONFIG.style.color"
            :isImaging="isImaging"
            :isPrinting="isPrinting"
            :uid="uid"
            :hasTooltip="FINAL_CONFIG.userOptions.buttons.tooltip && FINAL_CONFIG.style.tooltip.show"
            :hasPdf="FINAL_CONFIG.userOptions.buttons.pdf"
            :hasImg="FINAL_CONFIG.userOptions.buttons.img"
            :hasXls="FINAL_CONFIG.userOptions.buttons.csv"
            :hasTable="FINAL_CONFIG.userOptions.buttons.table"
            :hasFullscreen="FINAL_CONFIG.userOptions.buttons.fullscreen"
            :isFullscreen="isFullscreen"
            :isTooltip="mutableConfig.showTooltip"
            :titles="{ ...FINAL_CONFIG.userOptions.buttonTitles }"
            :chartElement="heatmapChart"
            @toggleFullscreen="toggleFullscreen"
            @generatePdf="generatePdf"
            @generateCsv="generateCsv"
            @generateImage="generateImage"
            @toggleTable="toggleTable"
            @toggleTooltip="toggleTooltip"
        >
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
        </UserOptions>

        <!-- CHART -->
        <svg :xmlns="XMLNS" v-if="isDataset" :class="{ 'vue-data-ui-fullscreen--on': isFullscreen, 'vue-data-ui-fulscreen--off': !isFullscreen }" :viewBox="`0 0 ${svg.width} ${svg.heightWithLegend}`" :style="`max-width:100%;overflow:visible;background:${FINAL_CONFIG.style.backgroundColor};color:${FINAL_CONFIG.style.color}`" >

            <g v-for="(serie, i) in mutableDataset">
                <g v-for="(cell, j) in serie.temperatures">
                    <rect
                        :x="drawingArea.left + cellSize.width * j + (FINAL_CONFIG.style.layout.cells.spacing / 2)"
                        :y="drawingArea.top + cellSize.height * i + (FINAL_CONFIG.style.layout.cells.spacing / 2)"
                        :width="cellSize.width - FINAL_CONFIG.style.layout.cells.spacing"
                        :height="cellSize.height - FINAL_CONFIG.style.layout.cells.spacing"
                        :fill="FINAL_CONFIG.style.layout.cells.colors.underlayer"
                        :stroke="FINAL_CONFIG.style.backgroundColor"
                        :stroke-width="FINAL_CONFIG.style.layout.cells.spacing"
                    />
                    <rect
                        :x="drawingArea.left + cellSize.width * j + (FINAL_CONFIG.style.layout.cells.spacing / 2)"
                        :y="drawingArea.top + cellSize.height * i + (FINAL_CONFIG.style.layout.cells.spacing / 2)"
                        :width="cellSize.width - FINAL_CONFIG.style.layout.cells.spacing"
                        :height="cellSize.height - FINAL_CONFIG.style.layout.cells.spacing"
                        :fill="cell.color"
                        :stroke="FINAL_CONFIG.style.backgroundColor"
                        :stroke-width="FINAL_CONFIG.style.layout.cells.spacing"
                    />
                    <text 
                        v-if="FINAL_CONFIG.style.layout.cells.value.show"
                        text-anchor="middle"
                        :font-size="FINAL_CONFIG.style.layout.cells.value.fontSize"
                        :font-weight="FINAL_CONFIG.style.layout.cells.value.bold ? 'bold': 'normal'"
                        :fill="adaptColorToBackground(cell.color)"
                        :x="(drawingArea.left + cellSize.width * j) + (cellSize.width / 2)"
                        :y="(drawingArea.top + cellSize.height * i) + (cellSize.height / 2) + FINAL_CONFIG.style.layout.cells.value.fontSize / 3"
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
                <g v-for="(cell, j) in serie.temperatures">
                    <!-- TOOLTIP TRAPS -->
                    <rect
                        :data-cy="`heatmap-trap-${i}-${j}`"
                        :x="drawingArea.left + cellSize.width * j"
                        :y="drawingArea.top + cellSize.height * i"
                        :width="cellSize.width"
                        :height="cellSize.height"
                        fill="transparent"
                        stroke="none"
                        @mouseover="useTooltip(cell, i, drawingArea.left + cellSize.width * j, drawingArea.top + cellSize.height * i)"
                        @mouseout="isTooltip = false; hoveredCell = undefined; hoveredValue = null; selectedClone = null"
                    />
                </g>
                <g v-if="FINAL_CONFIG.style.layout.dataLabels.yAxis.show">
                    <text
                        :font-size="FINAL_CONFIG.style.layout.dataLabels.yAxis.fontSize"
                        :fill="FINAL_CONFIG.style.layout.dataLabels.yAxis.color"
                        :x="drawingArea.left + FINAL_CONFIG.style.layout.dataLabels.yAxis.offsetX - 6"
                        :y="drawingArea.top + (cellSize.height * i) + cellSize.height / 2 + FINAL_CONFIG.style.layout.dataLabels.yAxis.fontSize / 3 + FINAL_CONFIG.style.layout.dataLabels.yAxis.offsetY"
                        text-anchor="end"
                        :font-weight="FINAL_CONFIG.style.layout.dataLabels.yAxis.bold ? 'bold' : 'normal'"
                    >
                        {{ dataLabels.yLabels[i] }}
                    </text>
                </g>
            </g>
            <g v-if="FINAL_CONFIG.style.layout.dataLabels.xAxis.show">
                <text v-for="(label, i) in dataLabels.xLabels"
                    :x="drawingArea.left + cellSize.width / 2 + (drawingArea.width / dataLabels.xLabels.length * i) + FINAL_CONFIG.style.layout.dataLabels.xAxis.offsetX"
                    :y="drawingArea.top + FINAL_CONFIG.style.layout.dataLabels.xAxis.offsetY - 6"
                    text-anchor="middle"
                    :font-size="FINAL_CONFIG.style.layout.dataLabels.xAxis.fontSize"
                    :fill="FINAL_CONFIG.style.layout.dataLabels.xAxis.color"
                    :font-weight="FINAL_CONFIG.style.layout.dataLabels.xAxis.bold ? 'bold' : 'normal'"
                >
                    {{ label }}
                </text>
            </g>

            <!-- BORDER FOR SELECTED RECT, PAINTED LAST -->
            <g v-if="selectedClone">
                <rect
                    style="pointer-events: none;"
                    :x="selectedClone.x - ((FINAL_CONFIG.style.layout.cells.selected.border) / 2) + FINAL_CONFIG.style.layout.cells.spacing"
                    :y="selectedClone.y - (FINAL_CONFIG.style.layout.cells.selected.border / 2) + FINAL_CONFIG.style.layout.cells.spacing"
                    :width="cellSize.width - FINAL_CONFIG.style.layout.cells.spacing + FINAL_CONFIG.style.layout.cells.selected.border - (FINAL_CONFIG.style.layout.cells.spacing)"
                    :height="cellSize.height - FINAL_CONFIG.style.layout.cells.spacing + FINAL_CONFIG.style.layout.cells.selected.border - (FINAL_CONFIG.style.layout.cells.spacing)"
                    fill="transparent"
                    :stroke="FINAL_CONFIG.style.layout.cells.selected.color"
                    :stroke-width="FINAL_CONFIG.style.layout.cells.selected.border"
                    :rx="1"
                />
            </g>

            <!-- LEGEND RIGHT -->
            <g v-if="FINAL_CONFIG.style.legend.show && legendPosition === 'right'">
                <defs>
                    <linearGradient :id="`colorScaleVertical_${uid}`" x2="0%" y2="100%" >
                        <stop offset="0%" :stop-color="FINAL_CONFIG.style.layout.cells.colors.hot"/>
                        <stop offset="100%" :stop-color="FINAL_CONFIG.style.layout.cells.colors.cold"/>
                    </linearGradient>
                </defs>
                <text
                    :x="drawingArea.right + 36 + 18"
                    :y="drawingArea.top - FINAL_CONFIG.style.legend.fontSize * 1.5"
                    text-anchor="middle"
                    :font-size="FINAL_CONFIG.style.legend.fontSize * 2"
                    :fill="FINAL_CONFIG.style.legend.color"
                >
                    {{ applyDataLabel(
                        FINAL_CONFIG.style.layout.cells.value.formatter,
                        maxValue,
                        dataLabel({
                            p: FINAL_CONFIG.style.layout.dataLabels.prefix,
                            v: maxValue,
                            s: FINAL_CONFIG.style.layout.dataLabels.suffix,
                            r: FINAL_CONFIG.style.legend.roundingValue
                        })) 
                    }}
                </text>
                <rect
                    :x="drawingArea.right + 36"
                    :y="drawingArea.top"
                    :width="36"
                    :height="sideLegendHeight"
                    :rx="FINAL_CONFIG.style.legend.scaleBorderRadius"
                    :fill="`url(#colorScaleVertical_${uid})`"
                />
                <text
                    :x="drawingArea.right + 36 + 18"
                    :y="drawingArea.top + sideLegendHeight + FINAL_CONFIG.style.legend.fontSize * 2.5"
                    text-anchor="middle"
                    :font-size="FINAL_CONFIG.style.legend.fontSize * 2"
                    :fill="FINAL_CONFIG.style.legend.color"
                >
                    {{ applyDataLabel(
                        FINAL_CONFIG.style.layout.cells.value.formatter,
                        minValue,
                        dataLabel({
                            p: FINAL_CONFIG.style.layout.dataLabels.prefix,
                            v: minValue,
                            s: FINAL_CONFIG.style.layout.dataLabels.suffix,
                            r: FINAL_CONFIG.style.legend.roundingValue
                        })) 
                    }}
                </text>
                <line v-if="hoveredValue !== null" :stroke="adaptColorToBackground(dataTooltipSlot.datapoint.color)" stroke-width="2" :x1="drawingArea.right + 36" :x2="drawingArea.right + 72" :y1="sideLegendIndicatorY" :y2="sideLegendIndicatorY" />
                <path v-if="hoveredValue !== null" :fill="FINAL_CONFIG.style.color" stroke="none" :d="`M ${drawingArea.right + 36},${sideLegendIndicatorY} ${drawingArea.right + 26},${sideLegendIndicatorY - 8} ${drawingArea.right + 26},${sideLegendIndicatorY + 8}z`" />
            </g>

            <!-- LEGEND BOTTOM -->
            <g v-if="FINAL_CONFIG.style.legend.show && legendPosition === 'bottom'">
                <defs>
                    <linearGradient id="colorScaleHorizontal" x1="0%" x2="100%" y1="0%" y2="0%">
                        <stop offset="0%" :stop-color="FINAL_CONFIG.style.layout.cells.colors.cold"/>
                        <stop offset="100%" :stop-color="FINAL_CONFIG.style.layout.cells.colors.hot"/>
                    </linearGradient>
                </defs>
                <rect
                    :x="drawingArea.left"
                    :y="drawingArea.bottom + FINAL_CONFIG.style.layout.cells.height"
                    :width="svg.width - drawingArea.left - FINAL_CONFIG.style.layout.padding.right"
                    :height="FINAL_CONFIG.style.layout.cells.height"
                    :rx="FINAL_CONFIG.style.legend.scaleBorderRadius > FINAL_CONFIG.style.layout.cells.height / 2 ? FINAL_CONFIG.style.layout.cells.height / 2 : FINAL_CONFIG.style.legend.scaleBorderRadius"
                    fill="url(#colorScaleHorizontal)"
                />
                <text
                    :x="drawingArea.left"
                    :y="drawingArea.bottom + FINAL_CONFIG.style.layout.cells.height * 2 + FINAL_CONFIG.style.legend.fontSize * 2"
                    text-anchor="start"
                    :font-size="FINAL_CONFIG.style.legend.fontSize * 2"
                    :fill="FINAL_CONFIG.style.legend.color"
                >
                    {{ Number(minValue.toFixed(FINAL_CONFIG.style.legend.roundingValue)).toLocaleString() }}
                </text>
                <text
                    :x="drawingArea.right"
                    :y="drawingArea.bottom + FINAL_CONFIG.style.layout.cells.height * 2 + FINAL_CONFIG.style.legend.fontSize * 2"
                    text-anchor="end"
                    :font-size="FINAL_CONFIG.style.legend.fontSize * 2"
                    :fill="FINAL_CONFIG.style.legend.color"
                >
                    {{ Number(maxValue.toFixed(FINAL_CONFIG.style.legend.roundingValue)).toLocaleString() }}
                </text>
                <line v-if="hoveredValue !== null" :stroke="adaptColorToBackground(dataTooltipSlot.datapoint.color)" stroke-width="2" :x1="bottomLegendIndicatorX" :x2="bottomLegendIndicatorX" :y1="drawingArea.bottom + FINAL_CONFIG.style.layout.cells.height" :y2="drawingArea.bottom + FINAL_CONFIG.style.layout.cells.height * 2" />
                <path v-if="hoveredValue !== null" :fill="FINAL_CONFIG.style.color" stroke="none" :d="`M ${bottomLegendIndicatorX},${drawingArea.bottom + FINAL_CONFIG.style.layout.cells.height} ${bottomLegendIndicatorX - 12},${drawingArea.bottom + FINAL_CONFIG.style.layout.cells.height - 20} ${bottomLegendIndicatorX + 12},${drawingArea.bottom + FINAL_CONFIG.style.layout.cells.height - 20}z`" />
            </g>

            <slot name="svg" :svg="svg"/>
        </svg>

        <div v-if="$slots.watermark" class="vue-data-ui-watermark">
            <slot name="watermark" v-bind="{ isPrinting: isPrinting || isImaging }"/>
        </div>

        <Skeleton
            v-if="!isDataset"
            :config="{
                type: 'heatmap',
                style: {
                    backgroundColor: FINAL_CONFIG.style.backgroundColor,
                    heatmap: {
                        color: '#CCCCCC'
                    }
                }
            }"
        />

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
            :isCustom="FINAL_CONFIG.style.tooltip.customFormat && typeof FINAL_CONFIG.style.tooltip.customFormat === 'function'"
        >
            <template #tooltip-before>
                <slot name="tooltip-before" v-bind="{...dataTooltipSlot}"></slot>
            </template>
            <template #tooltip-after>
                <slot name="tooltip-after" v-bind="{...dataTooltipSlot}"></slot>
            </template>
        </Tooltip>
        
        <!-- DATA TABLE -->
        <Accordion hideDetails v-if="isDataset" :config="{
            open: mutableConfig.showTable,
            maxHeight: 10000,
            body: {
                backgroundColor: FINAL_CONFIG.style.backgroundColor,
                color: FINAL_CONFIG.style.color,
            },
            head: {
                backgroundColor: FINAL_CONFIG.style.backgroundColor,
                color: FINAL_CONFIG.style.color,
            }
        }">
            <template #content>
                <div ref="tableContainer" class="vue-ui-heatmap-table">
                    <div :style="`width:100%;overflow-x:auto;padding-top:36px;position:relative`" :class="{'vue-ui-responsive' : isResponsive}">
                        <div role="button" tabindex="0" :style="`width:32px; position: absolute; top: 0; left:4px; padding: 0 0px; display: flex; align-items:center;justify-content:center;height: 36px; width: 32px; cursor:pointer; background:${FINAL_CONFIG.table.th.backgroundColor};`" @click="mutableConfig.showTable = false" @keypress.enter="mutableConfig.showTable = false">
                            <BaseIcon name="close" :stroke="FINAL_CONFIG.table.th.color" :stroke-width="2" />
                        </div> 
                        <table class="vue-ui-data-table">
                            <caption :style="`backgroundColor:${FINAL_CONFIG.table.th.backgroundColor};color:${FINAL_CONFIG.table.th.color};outline:${FINAL_CONFIG.table.th.outline}`">
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
        </Accordion>
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
    max-height: 300px;
    overflow: auto;
    margin-top: 24px;
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
</style>