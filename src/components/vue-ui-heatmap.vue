<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from "vue";
import { treeShake, convertConfigColors, opacity, makeXls, adaptColorToBackground } from "../lib";
import mainConfig from "../default_configs.json";
import pdf from "../pdf";

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

const uid = ref(`vue-ui-heatmap-${Math.random()}`);

const defaultConfig = ref(mainConfig.vue_ui_heatmap);

const isPrinting = ref(false);
const tooltip = ref(null);
const details = ref(null);
const clientPosition = ref({
    x: 0,
    y: 0
});
const isTooltip = ref(false);
const tooltipContent = ref("");
const hoveredCell = ref(undefined);

onMounted(() => {
    document.addEventListener("mousemove", setClientPosition)
});

onBeforeUnmount(() => {
    document.removeEventListener("mousemove", setClientPosition)
});

function setClientPosition(e) {
    clientPosition.value.x = e.clientX;
    clientPosition.value.y = e.clientY;
}

const tooltipPosition = computed(() => {
    let offsetX = 0;
    let offsetY = 48;
    if(tooltip.value && heatmapChart.value) {
        const { width, height } = tooltip.value.getBoundingClientRect();
        const chartBox = heatmapChart.value.getBoundingClientRect();

        if(clientPosition.value.x + width / 2 > chartBox.right) {
            offsetX = -width;
        } else if(clientPosition.value.x - width / 2 < chartBox.left) {
            offsetX = 0;
        } else {
            offsetX = -width / 2;
        }

        if(clientPosition.value.y + height > chartBox.bottom) {
            offsetY = -height - 48
        }
    }
    return {
        top: clientPosition.value.y + offsetY,
        left: clientPosition.value.x + offsetX,
    }
});
   
const heatmapConfig = computed(() => {
    if(!Object.keys(props.config || {}).length) {
        return defaultConfig.value;
    }
    const reconciled = treeShake({
        defaultConfig: defaultConfig.value,
        userConfig: props.config
    });
    return convertConfigColors(reconciled);
});

const mutableConfig = ref({
    inside: !heatmapConfig.value.style.layout.useDiv,
    showTable: heatmapConfig.value.table.show
})

const heatmapChart = ref(null);

const maxX = computed(() => {
    return Math.max(...props.dataset.flatMap(el => el.values.length));
});

const svg = computed(() => {
    const height = heatmapConfig.value.style.layout.padding.top + heatmapConfig.value.style.layout.padding.bottom + (props.dataset.length * heatmapConfig.value.style.layout.cells.height) + (mutableConfig.value.inside ? 92 : 0);
    const width= heatmapConfig.value.style.layout.padding.left + heatmapConfig.value.style.layout.padding.right + (maxX.value * heatmapConfig.value.style.layout.cells.height);

    return {
        height,
        width
    }
});

const drawingArea = computed(() => {
    return {
        top: heatmapConfig.value.style.layout.padding.top + (mutableConfig.value.inside ? 36 : 0) ,
        left: heatmapConfig.value.style.layout.padding.left,
        right: svg.value.width - heatmapConfig.value.style.layout.padding.right,
        bottom: svg.value.height - heatmapConfig.value.style.layout.padding.bottom,
        height: svg.value.height - heatmapConfig.value.style.layout.padding.top - heatmapConfig.value.style.layout.padding.bottom,
        width: svg.value.width - heatmapConfig.value.style.layout.padding.right - heatmapConfig.value.style.layout.padding.left
    }
});



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
        height: (drawingArea.value.width / maxX.value)
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
    return props.dataset.map(ds => {
        return {
            ...ds,
            temperatures: ds.values.map((v, i) => {
                if (v >= average.value) {
                    return {
                        side: "up",
                        ratio: Math.abs((Math.abs(v - average.value) / Math.abs(maxValue.value - average.value))) > 1 ? 1 : Math.abs((Math.abs(v - average.value) / Math.abs(maxValue.value - average.value))),
                        value: v,
                        yAxisName: ds.name,
                        xAxisName: dataLabels.value.xLabels[i],
                        id: `vue-data-ui-heatmap-cell-${Math.random()}`
                    }
                } else {
                    return {
                        side: "down",
                        ratio: Math.abs(1 - (Math.abs(v) / Math.abs(average.value))) > 1 ? 1 : Math.abs(1 - (Math.abs(v) / Math.abs(average.value))),
                        value: v,
                        yAxisName: ds.name,
                        xAxisName: dataLabels.value.xLabels[i],
                        id: `vue-data-ui-heatmap-cell-${Math.random()}`
                    }
                }
            })
        }
    })
});

function useTooltip(datapoint) {
    const { value, yAxisName, xAxisName,id } = datapoint;
    hoveredCell.value = id;
    isTooltip.value = true;
    let html = "";

    html += `<div>${yAxisName} ${xAxisName ? `${xAxisName}` : ''}</div>`;
    html += `<div style="margin-top:6px;padding-top:6px;border-top:1px solid #e1e5e8;font-weight:bold">${isNaN(value) ? "-" : Number(value.toFixed(heatmapConfig.value.style.tooltip.roundingValue)).toLocaleString()}</div>`
    tooltipContent.value = `<div style="font-size:${heatmapConfig.value.style.tooltip.fontSize}px">${html}</div>`;
}

function generatePdf(){
    isPrinting.value = true;
    nextTick(() => {
        pdf({
            domElement: document.getElementById(`heatmap__${uid.value}`),
            fileName: heatmapConfig.value.style.title.text || 'vue-ui-heatmap'
        }).finally(() => {
            isPrinting.value = false;
        });
    })
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

function generateXls() {
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

        makeXls(tableXls, heatmapConfig.value.style.title.text || "vue-ui-heatmap");
    });
}

function closeDetails(){
    if(details.value) {
        details.value.removeAttribute("open")
    }
}

</script>

<template>
     <div :ref="`heatmapChart`" class="vue-ui-heatmap" :style="`font-family:${heatmapConfig.style.fontFamily};width:100%; text-align:center`" :id="`heatmap__${uid}`">
        <div v-if="(!mutableConfig.inside || isPrinting) && heatmapConfig.style.title.text" :style="`width:100%;background:${heatmapConfig.style.backgroundColor}`">
            <!-- TITLE AS DIV -->
            <div :style="`width:100%;text-align:center;color:${heatmapConfig.style.title.color};font-size:${heatmapConfig.style.title.fontSize}px;font-weight:${heatmapConfig.style.title.bold ? 'bold': ''}`">
                {{ heatmapConfig.style.title.text }}
            </div>
            <div v-if="heatmapConfig.style.title.subtitle.text" :style="`width:100%;text-align:center;color:${heatmapConfig.style.title.subtitle.color};font-size:${heatmapConfig.style.title.subtitle.fontSize}px;font-weight:${heatmapConfig.style.title.subtitle.bold ? 'bold': ''}`">
                {{ heatmapConfig.style.title.subtitle.text }}
            </div>
        </div>
        
         <!-- OPTIONS -->
         <details class="vue-ui-heatmap-user-options" :style="`background:${heatmapConfig.style.backgroundColor};color:${heatmapConfig.style.color}`" data-html2canvas-ignore v-if="heatmapConfig.userOptions.show" ref="details">
            <summary :style="`background:${heatmapConfig.style.backgroundColor};color:${heatmapConfig.style.color}`">{{ heatmapConfig.userOptions.title }}</summary>

            <div class="vue-ui-heatmap-user-options-items" :style="`background:${heatmapConfig.style.backgroundColor};color:${heatmapConfig.style.color}`">
                <div class="vue-ui-heatmap-user-option-item">
                    <input type="checkbox" :id="`vue-ui-heatmap-option-title_${uid}`" :name="`vue-ui-heatmap-option-title_${uid}`"
                    v-model="mutableConfig.inside">
                    <label :for="`vue-ui-heatmap-option-title_${uid}`">{{ heatmapConfig.userOptions.labels.useDiv }}</label>
                </div>
                <div class="vue-ui-heatmap-user-option-item">
                    <input type="checkbox" :id="`vue-ui-heatmap-option-table_${uid}`" :name="`vue-ui-heatmap-option-table_${uid}`"
                    v-model="mutableConfig.showTable">
                    <label :for="`vue-ui-heatmap-option-table_${uid}`">{{ heatmapConfig.userOptions.labels.showTable }}</label>
                </div>
                <button class="vue-ui-heatmap-button" @click="generatePdf" :disabled="isPrinting" style="margin-top:12px" :style="`background:${heatmapConfig.style.backgroundColor};color:${heatmapConfig.style.color}`">
                    <svg class="vue-ui-heatmap-print-icon" xmlns="http://www.w3.org/2000/svg" v-if="isPrinting" width="20" height="20" viewBox="0 0 24 24" stroke-width="1.5" :stroke="heatmapConfig.style.color" fill="none" stroke-linecap="round" stroke-linejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                        <path d="M18 16v.01" />
                        <path d="M6 16v.01" />
                        <path d="M12 5v.01" />
                        <path d="M12 12v.01" />
                        <path d="M12 1a4 4 0 0 1 2.001 7.464l.001 .072a3.998 3.998 0 0 1 1.987 3.758l.22 .128a3.978 3.978 0 0 1 1.591 -.417l.2 -.005a4 4 0 1 1 -3.994 3.77l-.28 -.16c-.522 .25 -1.108 .39 -1.726 .39c-.619 0 -1.205 -.14 -1.728 -.391l-.279 .16l.007 .231a4 4 0 1 1 -2.212 -3.579l.222 -.129a3.998 3.998 0 0 1 1.988 -3.756l.002 -.071a4 4 0 0 1 -1.995 -3.265l-.005 -.2a4 4 0 0 1 4 -4z" />
                    </svg>
                    <span v-else>PDF</span>
                </button>
                <button class="vue-ui-heatmap-button" @click="generateXls" :style="`background:${heatmapConfig.style.backgroundColor};color:${heatmapConfig.style.color}`">
                    XLSX
                </button>
            </div>
        </details>

        <!-- CHART -->
        <svg :viewBox="`0 0 ${svg.width} ${svg.height}`" :style="`max-width:100%;overflow:visible;background:${heatmapConfig.style.backgroundColor};color:${heatmapConfig.style.color}`" @click="closeDetails">
            <!-- TITLE AS G -->
            <g v-if="heatmapConfig.style.title.text && mutableConfig.inside && !isPrinting">
                <text
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
                        :x="drawingArea.left + cellSize.width * j"
                        :y="drawingArea.top + cellSize.width * i"
                        :width="cellSize.width - heatmapConfig.style.layout.cells.spacing"
                        :height="cellSize.width - heatmapConfig.style.layout.cells.spacing"
                        :fill="heatmapConfig.style.layout.cells.colors.underlayer"
                        :stroke="heatmapConfig.style.backgroundColor"
                        :stroke-width="heatmapConfig.style.layout.cells.spacing"
                    />
                    <rect
                        :x="drawingArea.left + cellSize.width * j"
                        :y="drawingArea.top + cellSize.width * i"
                        :width="cellSize.width - heatmapConfig.style.layout.cells.spacing"
                        :height="cellSize.width - heatmapConfig.style.layout.cells.spacing"
                        :fill="`${cell.side === 'up' ? `${heatmapConfig.style.layout.cells.colors.hot}${opacity[Math.round(cell.ratio * 100)]}` : `${heatmapConfig.style.layout.cells.colors.cold}${opacity[Math.round(cell.ratio * 100)]}`}`"
                        :stroke="hoveredCell && hoveredCell === cell.id ? heatmapConfig.style.layout.cells.selected.color : heatmapConfig.style.backgroundColor"
                        :stroke-width="heatmapConfig.style.layout.cells.spacing"
                    />
                    <text 
                        v-if="heatmapConfig.style.layout.cells.value.show"
                        text-anchor="middle"
                        :font-size="heatmapConfig.style.layout.cells.value.fontSize"
                        :font-weight="heatmapConfig.style.layout.cells.value.bold ? 'bold': 'normal'"
                        :fill="heatmapConfig.style.layout.cells.value.color"
                        :x="(drawingArea.left + cellSize.width * j) + (cellSize.width / 2)"
                        :y="(drawingArea.top + cellSize.width * i) + (cellSize.width / 2) + heatmapConfig.style.layout.cells.value.fontSize / 3"
                    >
                        {{ Number(cell.value.toFixed(heatmapConfig.style.layout.cells.value.roundingValue)).toLocaleString() }}
                    </text>
                </g>
                <g v-for="(cell, j) in serie.temperatures">
                    <!-- TOOLTIP TRAPS -->
                    <rect
                        :x="drawingArea.left + cellSize.width * j"
                        :y="drawingArea.top + cellSize.width * i"
                        :width="cellSize.width"
                        :height="cellSize.width"
                        fill="transparent"
                        stroke="none"
                        @mouseover="useTooltip(cell)"
                        @mouseout="isTooltip = false; hoveredCell = undefined"
                    />
                </g>
                <g v-if="heatmapConfig.style.layout.dataLabels.yAxis.show">
                    <text
                        :font-size="heatmapConfig.style.layout.dataLabels.yAxis.fontSize"
                        :fill="heatmapConfig.style.layout.dataLabels.yAxis.color"
                        :x="drawingArea.left + heatmapConfig.style.layout.dataLabels.yAxis.offsetX - 6"
                        :y="drawingArea.top + (cellSize.width * i) + cellSize.width / 2 + heatmapConfig.style.layout.dataLabels.yAxis.fontSize / 3 + heatmapConfig.style.layout.dataLabels.yAxis.offsetY"
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

            <!-- LEGEND AS G -->
            <foreignObject 
                v-if="heatmapConfig.style.legend.show && mutableConfig.inside && !isPrinting"
                :x="0"
                :y="svg.height / 2 + 150"
                width="100%"
                height="100"
                style="overflow:visible"
            >
                <div class="vue-ui-heatmap-legend" :style="`color:${heatmapConfig.style.legend.color};font-size:${heatmapConfig.style.legend.fontSize*2}px;padding-bottom:12px;font-weight:${heatmapConfig.style.legend.bold ? 'bold' : ''};display:flex; flex-direction:row;gap:3px;align-items:center;justify-content:center;font-weight:${heatmapConfig.style.legend.bold ? 'bold':'normal'}`" @click="closeDetails">
                    <span style="text-align:right">{{ Number(minValue.toFixed(heatmapConfig.style.legend.roundingValue)).toLocaleString() }}</span>
                    <svg viewBox="0 0 120 12" style="width: 25%">
                        <rect v-for="(_,i) in 12"
                            :x="i * 12"
                            :y="0"
                            :height="12"
                            :width="12"
                            :fill="heatmapConfig.style.layout.cells.colors.underlayer"
                        />
                        <rect v-for="(_,i) in 12"
                            :x="i * 12"
                            :y="0"
                            :height="12"
                            :width="12"
                            :fill="i < 5 ? `${heatmapConfig.style.layout.cells.colors.cold}${opacity[Math.round((1-(i / 5)) * 100)]}` : `${heatmapConfig.style.layout.cells.colors.hot}${opacity[Math.round((((i-5) / 5)) * 100)]}`"
                        />
                    </svg>
                    <span style="text-align:left">{{ Number(maxValue.toFixed(heatmapConfig.style.legend.roundingValue)).toLocaleString() }}</span>
                </div>
            </foreignObject>

        </svg>

        <!-- LEGEND AS DIV -->
        <div v-if="heatmapConfig.style.legend.show && (!mutableConfig.inside || isPrinting)" class="vue-ui-heatmap-legend" :style="`background:${heatmapConfig.style.legend.backgroundColor};color:${heatmapConfig.style.legend.color};font-size:${heatmapConfig.style.legend.fontSize}px;padding-bottom:12px;font-weight:${heatmapConfig.style.legend.bold ? 'bold' : ''};display:flex; flex-direction:row;gap:3px;align-items:center;justify-content:center;font-weight:${heatmapConfig.style.legend.bold ? 'bold':'normal'}`" @click="closeDetails">
            <span style="text-align:right">{{ Number(minValue.toFixed(heatmapConfig.style.legend.roundingValue)).toLocaleString() }}</span>
            <svg viewBox="0 0 132 12" style="width: 300px">
                <rect v-for="(_,i) in 13"
                    :x="i * 12"
                    :y="0"
                    :height="12"
                    :width="12"
                    :fill="heatmapConfig.style.layout.cells.colors.underlayer"
                />
                <rect v-for="(_,i) in 13"
                    :x="i * 12"
                    :y="0"
                    :height="12"
                    :width="12"
                    :fill="i < 5 ? `${heatmapConfig.style.layout.cells.colors.cold}${opacity[Math.round((1-(i / 5)) * 100)]}` : `${heatmapConfig.style.layout.cells.colors.hot}${opacity[Math.round((((i-5) / 5)) * 100)]}`"
                />
            </svg>
            <span style="text-align:left">{{ Number(maxValue.toFixed(heatmapConfig.style.legend.roundingValue)).toLocaleString() }}</span>
        </div>

        <!-- TOOLTIP -->
        <div 
            class="vue-ui-heatmap-tooltip"
            ref="tooltip"
            v-if="heatmapConfig.style.tooltip.show && isTooltip"
            :style="`top:${tooltipPosition.top}px;left:${tooltipPosition.left}px;background:${heatmapConfig.style.tooltip.backgroundColor};color:${heatmapConfig.style.tooltip.color}`"
            v-html="tooltipContent"
        />
        <!-- DATA TABLE -->
        <div @click="closeDetails" :style="`${isPrinting ? '' : 'max-height:400px'};overflow:auto;width:100%;margin-top:${mutableConfig.inside ? '48px' : ''}`" v-if="mutableConfig.showTable">
            <table>
                <thead>
                    <tr v-if="heatmapConfig.style.title.text">
                        <th :colspan="dataset.length +1" :style="`background:${heatmapConfig.table.th.backgroundColor};color:${heatmapConfig.table.th.color};outline:${heatmapConfig.table.th.outline}`">
                            <span>{{ heatmapConfig.style.title.text }}</span>
                            <span v-if="heatmapConfig.style.title.subtitle.text">
                                : {{ heatmapConfig.style.title.subtitle.text }}
                            </span>
                        </th>
                    </tr>
                    <tr>
                        <th :style="`background:${heatmapConfig.table.th.backgroundColor};color:${heatmapConfig.table.th.color};outline:${heatmapConfig.table.th.outline};padding-right:6px`"></th>
                        <th align="right" :style="`background:${heatmapConfig.table.th.backgroundColor};color:${heatmapConfig.table.th.color};outline:${heatmapConfig.table.th.outline};padding-right:6px`" v-for="(th,i) in dataset">
                           {{ th.name }}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(tr, i) in dataLabels.xLabels">
                        <td :style="`background:${heatmapConfig.table.td.backgroundColor};color:${heatmapConfig.table.td.color};outline:${heatmapConfig.table.td.outline}`">
                            {{ tr }}
                        </td>
                        <td v-for="(trData, j) in dataset" :style="`background:${heatmapConfig.table.td.backgroundColor};color:${heatmapConfig.table.td.color};outline:${heatmapConfig.table.td.outline}`">
                            {{ isNaN(trData.values[i]) ? '-' : Number(trData.values[i].toFixed(heatmapConfig.table.td.roundingValue)).toLocaleString() }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
     </div> 
</template>

<style scoped>
.vue-ui-heatmap *{
    transition: unset;
}
.vue-ui-heatmap {
    user-select: none;
    position: relative;
    padding-top: 36px;
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
.vue-ui-heatmap-user-options {
    border-radius: 4px;
    padding: 6px 12px;
    position: absolute;
    right:0;
    top:0px;
    max-width: 300px;
    text-align:left;
}
.vue-ui-heatmap-user-options[open] {
    border: 1px solid #e1e5e8;
    box-shadow: 0 6px 12px -6px rgba(0,0,0,0.2);
}
.vue-ui-heatmap summary {
    text-align: right;
    direction: rtl;
}
.vue-ui-heatmap-user-options-items {
    width: 100%;
    display: flex;
    flex-direction: column;
    margin-top: 6px;
}
.vue-ui-heatmap-user-options-item {
    width: 100%;
    display: flex;
    flex-direction: row;
    gap: 5px;
    align-items:center;
}

.vue-ui-heatmap-button {
    margin: 6px 0;
    border-radius: 3px;
    height: 30px;
    border: 1px solid #b9bfc4;
    background: inherit;
    display: flex;
    align-items:center;
    justify-content: center;
}
.vue-ui-heatmap-button:hover {
    background: rgba(0,0,0,0.05);
}
.vue-ui-heatmap-print-icon {
    animation: smartspin 0.5s infinite linear;
}
@keyframes smartspin {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

.vue-ui-heatmap table {
    width: 100%;
    border-collapse:collapse;
    overflow: auto;
    max-height: 400px;
}
.vue-ui-heatmap table td {
    text-align:right;
    padding-right: 6px;
    font-variant-numeric: tabular-nums;
}
.vue-ui-heatmap table th {
    position: sticky;
    top:0;
    font-weight: 400;
    user-select: none;
}
</style>