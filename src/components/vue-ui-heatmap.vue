<script setup>
import { ref, computed, nextTick, onMounted } from "vue";
import { 
    adaptColorToBackground, 
    createCsvContent, 
    createUid, 
    dataLabel,
    downloadCsv,
    error,
    functionReturnsString,
    isFunction,
    interpolateColorHex,
    objectIsEmpty,
    opacity, 
} from "../lib";
import mainConfig from "../default_configs.json";
import pdf from "../pdf";
import img from "../img";
import { useNestedProp } from "../useNestedProp";
import Title from "../atoms/Title.vue";
import UserOptions from "../atoms/UserOptions.vue";
import Tooltip from "../atoms/Tooltip.vue";

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

if(objectIsEmpty(props.dataset)) {
    error({
        componentName: 'VueUiHeatmap',
        type: 'dataset'
    })
}

const uid = ref(createUid());
const defaultConfig = ref(mainConfig.vue_ui_heatmap);

const isImaging = ref(false);
const isPrinting = ref(false);
const heatmapChart = ref(null);
const details = ref(null);
const isTooltip = ref(false);
const tooltipContent = ref("");
const hoveredCell = ref(undefined);
const step = ref(0);
const tableContainer = ref(null);
const isResponsive = ref(false);

const heatmapConfig = computed(() => {
    return useNestedProp({
        userConfig: props.config,
        defaultConfig: defaultConfig.value
    });
});

const mutableConfig = ref({
    inside: !heatmapConfig.value.style.layout.useDiv,
    showTable: heatmapConfig.value.table.show
})

const breakpoint = computed(() => {
    return heatmapConfig.value.table.responsiveBreakpoint
})

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
    const height = heatmapConfig.value.style.layout.padding.top + heatmapConfig.value.style.layout.padding.bottom + (props.dataset.length * heatmapConfig.value.style.layout.cells.height) + (mutableConfig.value.inside ? 92 : 0);
    const width= heatmapConfig.value.style.layout.padding.left + heatmapConfig.value.style.layout.padding.right + ((maxX.value < props.dataset.length ? props.dataset.length : maxX.value) * heatmapConfig.value.style.layout.cells.height);
    const heightWithLegend = height + (heatmapConfig.value.style.legend.show ? (heatmapConfig.value.style.legend.position === 'right' ? 0 : ((heatmapConfig.value.style.layout.cells.height * 2))) : 0)

    return {
        height,
        heightWithLegend,
        width
    }
});

const legendPosition = computed(() => {
    return heatmapConfig.value.style.legend.position;
})

const drawingArea = computed(() => {
    return {
        top: heatmapConfig.value.style.layout.padding.top + (mutableConfig.value.inside ? 36 : 0) ,
        left: heatmapConfig.value.style.layout.padding.left,
        right: svg.value.width - heatmapConfig.value.style.layout.padding.right - (legendPosition.value === "right" && heatmapConfig.value.style.legend.show ? 92 : 0),
        bottom: svg.value.height - heatmapConfig.value.style.layout.padding.bottom,
        height: svg.value.height - heatmapConfig.value.style.layout.padding.top - heatmapConfig.value.style.layout.padding.bottom,
        width: svg.value.width - heatmapConfig.value.style.layout.padding.right - heatmapConfig.value.style.layout.padding.left - (legendPosition.value === "right" && heatmapConfig.value.style.legend.show ? 92 : 0)
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
    const yLabels = heatmapConfig.value.style.layout.dataLabels.yAxis.values.length ? heatmapConfig.value.style.layout.dataLabels.yAxis.values : props.dataset.map(ds => ds.name);
    const xLabels = heatmapConfig.value.style.layout.dataLabels.xAxis.values
    return {
        yLabels,
        xLabels: xLabels.slice(0, maxX.value)
    }
});


const mutableDataset = computed(() => {
    props.dataset.forEach((ds, i) => {
        if ([null, undefined].includes(ds.values)) {
            error({
                componentName: 'VueUiHeatmap',
                type: 'datasetSerieAttribute',
                property: 'values',
                index: i
            })
        }
    })

    return props.dataset.map(ds => {
        return {
            ...ds,
            temperatures: (ds.values || []).map((v, i) => {
                if (v >= average.value) {
                    return {
                        side: "up",
                        color: interpolateColorHex(heatmapConfig.value.style.layout.cells.colors.cold, heatmapConfig.value.style.layout.cells.colors.hot, minValue.value, maxValue.value, v),
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
                        color: interpolateColorHex(heatmapConfig.value.style.layout.cells.colors.cold, heatmapConfig.value.style.layout.cells.colors.hot, minValue.value, maxValue.value, v),
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

function useTooltip(datapoint, seriesIndex) {
    const { value, yAxisName, xAxisName,id } = datapoint;
    hoveredCell.value = id;
    hoveredValue.value = value;

    dataTooltipSlot.value = {
        datapoint,
        seriesIndex,
        series: mutableDataset.value,
        config: heatmapConfig.value
    }

    isTooltip.value = true;
    let html = "";

    const customFormat = heatmapConfig.value.style.tooltip.customFormat;

    if (isFunction(customFormat) && functionReturnsString(() => customFormat({
            datapoint,
            seriesIndex,
            series: mutableDataset.value,
            config: heatmapConfig.value
        }))) {
        tooltipContent.value = customFormat({
            datapoint,
            seriesIndex,
            series: mutableDataset.value,
            config: heatmapConfig.value
        })
    } else {
        html += `<div data-cy="heatmap-tootlip-name">${yAxisName} ${xAxisName ? `${xAxisName}` : ''}</div>`;
        html += `<div data-cy="heatmap-tooltip-value" style="margin-top:6px;padding-top:6px;border-top:1px solid #e1e5e8;font-weight:bold;display:flex;flex-direction:row;gap:12px;align-items:center;justify-content:center"><span style="color:${interpolateColorHex(heatmapConfig.value.style.layout.cells.colors.cold, heatmapConfig.value.style.layout.cells.colors.hot, minValue.value, maxValue.value, value)}">⬤</span><span>${isNaN(value) ? "-" : dataLabel({p:heatmapConfig.value.style.layout.dataLabels.prefix, v: value, s: heatmapConfig.value.style.layout.dataLabels.suffix, r:heatmapConfig.value.style.tooltip.roundingValue })}</span></div>`
        tooltipContent.value = `<div style="font-size:${heatmapConfig.value.style.tooltip.fontSize}px">${html}</div>`;
    }
}

const sideLegendIndicatorY = computed(() => {
    return drawingArea.value.top + (sideLegendHeight.value * (1 - hoveredValue.value / maxValue.value))
})

const bottomLegendIndicatorX = computed(() => {
    return drawingArea.value.left + ((svg.value.width - drawingArea.value.left - heatmapConfig.value.style.layout.padding.right) * (hoveredValue.value / maxValue.value))
})

const __to__ = ref(null);

function showSpinnerPdf() {
    isPrinting.value = true;
}

function generatePdf(){
    showSpinnerPdf();
    clearTimeout(__to__.value);
    __to__.value = setTimeout(() => {
        pdf({
            domElement: document.getElementById(`heatmap__${uid.value}`),
            fileName: heatmapConfig.value.style.title.text || 'vue-ui-heatmap'
        }).finally(() => {
            isPrinting.value = false;
        });
    }, 100)
}

function showSpinnerImage() {
    isImaging.value = true;
}

function generateImage() {
    showSpinnerImage();
    clearTimeout(__to__.value);
    __to__.value = setTimeout(() => {
        img({
            domElement: document.getElementById(`heatmap__${uid.value}`),
            fileName: heatmapConfig.value.style.title.text || 'vue-ui-heatmap',
            format: 'png'
        }).finally(() => {
            isImaging.value = false;
        })
    }, 100)
}

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

        const tableXls = [[heatmapConfig.value.style.title.text],[heatmapConfig.value.style.title.subtitle.text],[[""],[""],[""]]].concat([labels]).concat(values);
        const csvContent = createCsvContent(tableXls);
        downloadCsv({csvContent, title: heatmapConfig.value.style.title.text || "vue-ui-heatmap"})
    });
}


const isFullscreen = ref(false)
function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
}

defineExpose({
    generatePdf,
    generateCsv,
    generateImage
});

</script>

<template>
     <div ref="heatmapChart" :class="`vue-ui-heatmap ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''}`" :style="`font-family:${heatmapConfig.style.fontFamily};width:100%; text-align:center;${!heatmapConfig.style.title.text ? 'padding-top:36px' : ''};background:${heatmapConfig.style.backgroundColor}`" :id="`heatmap__${uid}`">
        <div v-if="(!mutableConfig.inside || isPrinting) && heatmapConfig.style.title.text" :style="`width:100%;background:${heatmapConfig.style.backgroundColor}`">
            <Title
                :config="{
                    title: {
                        cy: 'heatmap-div-title',
                        text: heatmapConfig.style.title.text,
                        color: heatmapConfig.style.title.color,
                        fontSize: heatmapConfig.style.title.fontSize,
                        bold: heatmapConfig.style.title.bold
                    },
                    subtitle: {
                        cy: 'heatmap-div-subtitle',
                        text: heatmapConfig.style.title.subtitle.text,
                        color: heatmapConfig.style.title.subtitle.color,
                        fontSize: heatmapConfig.style.title.subtitle.fontSize,
                        bold: heatmapConfig.style.title.subtitle.bold
                    },
                }"
            />
        </div>
        
         <!-- OPTIONS -->
        <UserOptions
            ref="details"
            :key="`user_options_${step}`"
            v-if="heatmapConfig.userOptions.show"
            :backgroundColor="heatmapConfig.style.backgroundColor"
            :color="heatmapConfig.style.color"
            :isImaging="isImaging"
            :isPrinting="isPrinting"
            :title="heatmapConfig.userOptions.title"
            :uid="uid"
            :hasImg="true"
            hasTable
            hasFullscreen
            :isFullscreen="isFullscreen"
            :chartElement="heatmapChart"
            @toggleFullscreen="toggleFullscreen"
            @generatePdf="generatePdf"
            @generateCsv="generateCsv"
            @generateImage="generateImage"
            @toggleTable="mutableConfig.showTable = !mutableConfig.showTable"
        />

        <!-- CHART -->
        <svg  :class="{ 'vue-data-ui-fullscreen--on': isFullscreen, 'vue-data-ui-fulscreen--off': !isFullscreen }" :viewBox="`0 0 ${svg.width} ${svg.heightWithLegend}`" :style="`max-width:100%;overflow:visible;background:${heatmapConfig.style.backgroundColor};color:${heatmapConfig.style.color}`" >
            <!-- TITLE AS G -->
            <g v-if="heatmapConfig.style.title.text && mutableConfig.inside && !isPrinting">
                <text
                    data-cy="heatmap-text-title"
                    :font-size="heatmapConfig.style.title.fontSize"
                    :fill="heatmapConfig.style.title.color"
                    :x="svg.width / 2"
                    :y="0"
                    text-anchor="middle"
                    :style="`font-weight:${heatmapConfig.style.title.bold ? 'bold' : ''}`"
                >
                    {{ heatmapConfig.style.title.text }}
                </text>
                <text
                    data-cy="heatmap-text-subtitle"
                    v-if="heatmapConfig.style.title.subtitle.text"
                    :font-size="heatmapConfig.style.title.subtitle.fontSize"
                    :fill="heatmapConfig.style.title.subtitle.color"
                    :x="svg.width / 2"
                    :y="heatmapConfig.style.title.fontSize"
                    text-anchor="middle"
                    :style="`font-weight:${heatmapConfig.style.title.subtitle.bold ? 'bold' : ''}`"
                >
                    {{ heatmapConfig.style.title.subtitle.text }}
                </text>
            </g>

            <g v-for="(serie, i) in mutableDataset">
                <g v-for="(cell, j) in serie.temperatures">
                    <rect
                        :x="drawingArea.left + cellSize.width * j + (heatmapConfig.style.layout.cells.spacing / 2)"
                        :y="drawingArea.top + cellSize.height * i + (heatmapConfig.style.layout.cells.spacing / 2)"
                        :width="cellSize.width - heatmapConfig.style.layout.cells.spacing"
                        :height="cellSize.height - heatmapConfig.style.layout.cells.spacing"
                        :fill="heatmapConfig.style.layout.cells.colors.underlayer"
                        :stroke="heatmapConfig.style.backgroundColor"
                        :stroke-width="heatmapConfig.style.layout.cells.spacing"
                    />
                    <rect
                        :x="drawingArea.left + cellSize.width * j + (heatmapConfig.style.layout.cells.spacing / 2)"
                        :y="drawingArea.top + cellSize.height * i + (heatmapConfig.style.layout.cells.spacing / 2)"
                        :width="cellSize.width - heatmapConfig.style.layout.cells.spacing"
                        :height="cellSize.height - heatmapConfig.style.layout.cells.spacing"
                        :fill="cell.color"
                        :stroke="hoveredCell && hoveredCell === cell.id ? heatmapConfig.style.layout.cells.selected.color : heatmapConfig.style.backgroundColor"
                        :stroke-width="heatmapConfig.style.layout.cells.spacing"
                    />
                    <text 
                        v-if="heatmapConfig.style.layout.cells.value.show"
                        text-anchor="middle"
                        :font-size="heatmapConfig.style.layout.cells.value.fontSize"
                        :font-weight="heatmapConfig.style.layout.cells.value.bold ? 'bold': 'normal'"
                        :fill="adaptColorToBackground(cell.color)"
                        :x="(drawingArea.left + cellSize.width * j) + (cellSize.width / 2)"
                        :y="(drawingArea.top + cellSize.height * i) + (cellSize.height / 2) + heatmapConfig.style.layout.cells.value.fontSize / 3"
                    >
                        {{ heatmapConfig.style.layout.dataLabels.prefix }}{{ Number(cell.value.toFixed(heatmapConfig.style.layout.cells.value.roundingValue)).toLocaleString() }}{{ heatmapConfig.style.layout.dataLabels.suffix }}
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
                        @mouseover="useTooltip(cell, i)"
                        @mouseout="isTooltip = false; hoveredCell = undefined; hoveredValue = null"
                    />
                </g>
                <g v-if="heatmapConfig.style.layout.dataLabels.yAxis.show">
                    <text
                        :font-size="heatmapConfig.style.layout.dataLabels.yAxis.fontSize"
                        :fill="heatmapConfig.style.layout.dataLabels.yAxis.color"
                        :x="drawingArea.left + heatmapConfig.style.layout.dataLabels.yAxis.offsetX - 6"
                        :y="drawingArea.top + (cellSize.height * i) + cellSize.height / 2 + heatmapConfig.style.layout.dataLabels.yAxis.fontSize / 3 + heatmapConfig.style.layout.dataLabels.yAxis.offsetY"
                        text-anchor="end"
                        :font-weight="heatmapConfig.style.layout.dataLabels.yAxis.bold ? 'bold' : 'normal'"
                    >
                        {{ dataLabels.yLabels[i] }}
                    </text>
                </g>
            </g>
            <g v-if="heatmapConfig.style.layout.dataLabels.xAxis.show">
                <text v-for="(label, i) in dataLabels.xLabels"
                    :x="drawingArea.left + cellSize.width / 2 + (drawingArea.width / dataLabels.xLabels.length * i) + heatmapConfig.style.layout.dataLabels.xAxis.offsetX"
                    :y="drawingArea.top + heatmapConfig.style.layout.dataLabels.xAxis.offsetY - 6"
                    text-anchor="middle"
                    :font-size="heatmapConfig.style.layout.dataLabels.xAxis.fontSize"
                    :fill="heatmapConfig.style.layout.dataLabels.xAxis.color"
                    :font-weight="heatmapConfig.style.layout.dataLabels.xAxis.bold ? 'bold' : 'normal'"
                >
                    {{ label }}
                </text>
            </g>

            <!-- LEGEND RIGHT -->
            <g v-if="heatmapConfig.style.legend.show && legendPosition === 'right'">
                <defs>
                    <linearGradient id="colorScaleVertical" x2="0%" y2="100%" >
                        <stop offset="0%" :stop-color="heatmapConfig.style.layout.cells.colors.hot"/>
                        <stop offset="100%" :stop-color="heatmapConfig.style.layout.cells.colors.cold"/>
                    </linearGradient>
                </defs>
                <text
                    :x="drawingArea.right + 36 + 18"
                    :y="drawingArea.top - heatmapConfig.style.legend.fontSize * 1.5"
                    text-anchor="middle"
                    :font-size="heatmapConfig.style.legend.fontSize * 2"
                    :fill="heatmapConfig.style.legend.color"
                >
                    {{ Number(maxValue.toFixed(heatmapConfig.style.legend.roundingValue)).toLocaleString() }}
                </text>
                <rect
                    :x="drawingArea.right + 36"
                    :y="drawingArea.top"
                    :width="36"
                    :height="sideLegendHeight"
                    :rx="heatmapConfig.style.legend.scaleBorderRadius"
                    fill="url(#colorScaleVertical)"
                />
                <text
                    :x="drawingArea.right + 36 + 18"
                    :y="drawingArea.top + sideLegendHeight + heatmapConfig.style.legend.fontSize * 2.5"
                    text-anchor="middle"
                    :font-size="heatmapConfig.style.legend.fontSize * 2"
                    :fill="heatmapConfig.style.legend.color"
                >
                    {{ Number(minValue.toFixed(heatmapConfig.style.legend.roundingValue)).toLocaleString() }}
                </text>
                <line v-if="hoveredValue !== null" :stroke="heatmapConfig.style.backgroundColor" stroke-width="2" :x1="drawingArea.right + 36" :x2="drawingArea.right + 72" :y1="sideLegendIndicatorY" :y2="sideLegendIndicatorY" />
                <path v-if="hoveredValue !== null" :fill="heatmapConfig.style.color" stroke="none" :d="`M ${drawingArea.right + 36},${sideLegendIndicatorY} ${drawingArea.right + 26},${sideLegendIndicatorY - 8} ${drawingArea.right + 26},${sideLegendIndicatorY + 8}z`" />
            </g>

            <!-- LEGEND BOTTOM -->
            <g v-if="heatmapConfig.style.legend.show && legendPosition === 'bottom'">
                <defs>
                    <linearGradient id="colorScaleHorizontal" x1="0%" x2="100%" y1="0%" y2="0%">
                        <stop offset="0%" :stop-color="heatmapConfig.style.layout.cells.colors.cold"/>
                        <stop offset="100%" :stop-color="heatmapConfig.style.layout.cells.colors.hot"/>
                    </linearGradient>
                </defs>
                <rect
                    :x="drawingArea.left"
                    :y="drawingArea.bottom + heatmapConfig.style.layout.cells.height"
                    :width="svg.width - drawingArea.left - heatmapConfig.style.layout.padding.right"
                    :height="heatmapConfig.style.layout.cells.height"
                    :rx="heatmapConfig.style.layout.cells.height / 2"
                    fill="url(#colorScaleHorizontal)"
                />
                <text
                    :x="drawingArea.left"
                    :y="drawingArea.bottom + heatmapConfig.style.layout.cells.height * 2 + heatmapConfig.style.legend.fontSize * 2"
                    text-anchor="start"
                    :font-size="heatmapConfig.style.legend.fontSize * 2"
                    :fill="heatmapConfig.style.legend.color"
                >
                    {{ Number(minValue.toFixed(heatmapConfig.style.legend.roundingValue)).toLocaleString() }}
                </text>
                <text
                    :x="drawingArea.right"
                    :y="drawingArea.bottom + heatmapConfig.style.layout.cells.height * 2 + heatmapConfig.style.legend.fontSize * 2"
                    text-anchor="end"
                    :font-size="heatmapConfig.style.legend.fontSize * 2"
                    :fill="heatmapConfig.style.legend.color"
                >
                    {{ Number(maxValue.toFixed(heatmapConfig.style.legend.roundingValue)).toLocaleString() }}
                </text>
                <line v-if="hoveredValue !== null" :stroke="heatmapConfig.style.backgroundColor" stroke-width="2" :x1="bottomLegendIndicatorX" :x2="bottomLegendIndicatorX" :y1="drawingArea.bottom + heatmapConfig.style.layout.cells.height" :y2="drawingArea.bottom + heatmapConfig.style.layout.cells.height * 2" />
                <path v-if="hoveredValue !== null" :fill="heatmapConfig.style.color" stroke="none" :d="`M ${bottomLegendIndicatorX},${drawingArea.bottom + heatmapConfig.style.layout.cells.height} ${bottomLegendIndicatorX - 12},${drawingArea.bottom + heatmapConfig.style.layout.cells.height - 20} ${bottomLegendIndicatorX + 12},${drawingArea.bottom + heatmapConfig.style.layout.cells.height - 20}z`" />
            </g>

            <slot name="svg" :svg="svg"/>
        </svg>

        <!-- TOOLTIP -->
        <Tooltip
            :show="heatmapConfig.style.tooltip.show && isTooltip"
            :backgroundColor="heatmapConfig.style.tooltip.backgroundColor"
            :color="heatmapConfig.style.tooltip.color"
            :parent="heatmapChart"
            :content="tooltipContent"
            :isCustom="heatmapConfig.style.tooltip.customFormat && typeof heatmapConfig.style.tooltip.customFormat === 'function'"
        >
            <template #tooltip-before>
                <slot name="tooltip-before" v-bind="{...dataTooltipSlot}"></slot>
            </template>
            <template #tooltip-after>
                <slot name="tooltip-after" v-bind="{...dataTooltipSlot}"></slot>
            </template>
        </Tooltip>
        
        <!-- DATA TABLE -->
        <div ref="tableContainer" class="vue-ui-heatmap-table">
            <div :style="`width:100%;overflow-x:auto`" v-if="mutableConfig.showTable" :class="{'vue-ui-responsive' : isResponsive}">
                <table class="vue-ui-data-table">
                    <caption :style="`backgroundColor:${heatmapConfig.table.th.backgroundColor};color:${heatmapConfig.table.th.color};outline:${heatmapConfig.table.th.outline}`">
                        {{ heatmapConfig.style.title.text }} <span v-if="heatmapConfig.style.title.subtitle.text">{{  heatmapConfig.style.title.subtitle.text }}</span>
                    </caption>
                    <thead>
                        <tr role="row" :style="`background:${heatmapConfig.table.th.backgroundColor};color:${heatmapConfig.table.th.color}`">
                            <th :style="`outline:${heatmapConfig.table.th.outline};padding-right:6px`"></th>
                            <th align="right" :style="`outline:${heatmapConfig.table.th.outline};padding-right:6px`" v-for="(th,i) in dataset" :data-cy="`heatmap-table-col-name-${i}`">
                                {{ th.name }}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr role="row" v-for="(tr, i) in dataLabels.xLabels" :class="{'vue-ui-data-table__tbody__row' : true, 'vue-ui-data-table__tbody__row-even': i % 2 === 0, 'vue-ui-data-table__tbody__row-odd': i % 2 !== 0}" :style="`background:${heatmapConfig.table.td.backgroundColor};color:${heatmapConfig.table.td.color}`">
                            <td :data-cell="heatmapConfig.table.colNames.xAxis" class="vue-ui-data-table__tbody__td"  :data-cy="`heatmap-table-row-name-${i}`" :style="`outline:${heatmapConfig.table.td.outline}`">
                                <div style="display: flex; align-items:center; gap: 5px; justify-content:flex-end; width:100%; padding-right:3px;">
                                    {{ tr }}
                                </div>
                            </td>
                            <td class="vue-ui-data-table__tbody__td"  v-for="(trData, j) in dataset" :data-cell="dataset[j].name" :style="`outline:${heatmapConfig.table.td.outline}`">
                                <div style="display: flex; align-items:center; gap: 5px; justify-content:flex-end; width:100%; padding-right:3px;">
                                    {{ isNaN(trData.values[i]) ? '-' : dataLabel({p:heatmapConfig.style.layout.dataLabels.prefix, v:trData.values[i], s: heatmapConfig.style.layout.dataLabels.suffix, r: heatmapConfig.table.td.roundingValue}) }}
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
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