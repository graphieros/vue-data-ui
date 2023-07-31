<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from "vue";
import { treeShake, makeDonut, palette, convertColorToHex } from '../lib';
import pdf from "../pdf";
import * as XLSX from 'xlsx';

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

const uid = ref(`vue-ui-donut-${Math.random()}`);

const defaultConfig = ref({
    style: {
        fontFamily: "inherit",
        chart: {
            useGradient: true,
            gradientIntensity: 40,
            backgroundColor: "#FFFFFF",
            color: "#2D353C",
            layout: {
                useDiv: false,
                labels: {
                    dataLabels: {
                        show: true,
                        hideUnderValue: 3,
                    },
                    percentage: {
                        color: "#2D353C",
                        bold: true,
                        fontSize: 18
                    },
                    name: {
                        color: "#2D353C",
                        bold: false,
                        fontSize: 14,
                    },
                    hollow: {
                        total: {
                            show: true,
                            bold: false,
                            fontSize: 18,
                            color: "#AAAAAA",
                            text:  "Total",
                            offsetY: 0,
                            value: {
                                color: "#2D353C",
                                fontSize: 18,
                                bold: true,
                                suffix: "",
                                prefix: "",
                                offsetY: 0,
                                rounding: 0,
                            }
                        },
                        average: {
                            show: true,
                            bold: false,
                            fontSize: 18,
                            color: "#AAAAAA",
                            text:  "Average",
                            offsetY: 0,
                            value: {
                                color: "#2D353C",
                                fontSize: 18,
                                bold: true,
                                suffix: "",
                                prefix: "",
                                offsetY: 0,
                                rounding: 0,
                            }
                        }
                    }
                },
                donut: {
                    strokeWidth: 64
                },
            },
            legend: {
                    backgroundColor: "#FFFFFF",
                    color: "#2D353C",
                    show: true,
                    fontSize: 16,
                    bold: false,
                    roundingValue: 0,
                    roundingPercentage: 0,
                },
            title: {
                text: "",
                color: "#2D353C",
                fontSize: 20,
                bold: true,
                subtitle: {
                    color: "#A1A1A1",
                    text: "",
                    fontSize: 16,
                    bold: false
                }
            },
            tooltip: {
                show: true,
                color: "#2D353C",
                backgroundColor: "#FFFFFF",
                fontSize: 14,
                showValue: true,
                showPercentage: true,
                roundingValue: 0,
                roundingPercentage: 0,
            }
        }
    },
    userOptions: {
        show: true,
        title: "options",
        labels: {
            dataLabels: "Show datalabels",
            useDiv: "Title & legend inside",
            showTable: "Show table"
        }
    },
    translations: {
        total: "Total",
        average: "Average",
    },
    table: {
        show: false,
        th: {
            backgroundColor: "#FAFAFA",
            color: "#2D353C",
            outline: "1px solid #e1e5e8"
        },
        td: {
            backgroundColor: "#FFFFFF",
            color: "#2D353C",
            outline: "1px solid #e1e5e8",
            roundingValue: 0,
            roundingPercentage: 0
        }
    }
});

const isPrinting = ref(false);
const donutChart = ref(null);
const tooltip = ref(null);
const details = ref(null);
const clientPosition = ref({
    x: 0,
    y: 0
});
const isTooltip = ref(false);
const tooltipContent = ref("");
const selectedSerie = ref(null);

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
    if(tooltip.value && donutChart.value) {
        const { width, height } = tooltip.value.getBoundingClientRect();
        const chartBox = donutChart.value.getBoundingClientRect();

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
})

const donutConfig = computed(() => {
    if(!Object.keys(props.config || {}).length) {
        return defaultConfig.value;
    }
    return treeShake({
        defaultConfig: defaultConfig.value,
        userConfig: props.config
    });
});

const mutableConfig = ref({
    dataLabels: {
        show: donutConfig.value.style.chart.layout.labels.dataLabels.show,
    },
    inside: donutConfig.value.style.chart.layout.useDiv,
    showTable: donutConfig.value.table.show,
});

const svg = computed(() => {
    const height = mutableConfig.value.inside || isPrinting.value ? 512: 360;
    return {
        height,
        width: 512
    }
});

const segregated = ref([]);

function segregate(index) {
    if(segregated.value.includes(index)) {
        segregated.value = segregated.value.filter(s => s !== index);
    }else {
        segregated.value.push(index);
    }
}

const donutSet = computed(() => {
    return props.dataset
        .map((serie, i) => {
            return {
                name: serie.name,
                color: serie.color || palette[i] || palette[i % palette.length],
                value: serie.values.reduce((a,b) => a + b, 0),
                absoluteValues: serie.values
            }
        })
        .sort((a,b) => b.value - a.value)
        .filter((_, i) => !segregated.value.includes(i))
});

const legendSet = computed(() => {
    return props.dataset
        .map((serie, i) => {
            return {
                name: serie.name,
                color: serie.color || palette[i] || palette[i % palette.length],
                value: serie.values.reduce((a,b) => a + b, 0)
            }
        })
        .sort((a,b) => b.value - a.value)
});

const currentDonut = computed(() => {
    return makeDonut({ series: donutSet.value }, svg.value.width / 2, svg.value.height / 2, 100, 100)
});

function calcDonutMarkerLabelPositionX(arc) {
    return arc.center.endX + calcMarkerOffset(arc, 256);
}
function calcMarkerOffset(arc, centerX) {
    const isRight = arc.center.endX - centerX >= 0;
    if (isRight) {
        return 30;
    }
    return -30;
}

function isArcBigEnough(arc) {
    return arc.proportion * 100 > donutConfig.value.style.chart.layout.labels.dataLabels.hideUnderValue;
}

function displayArcPercentage(arc, stepBreakdown) {
    return isNaN(arc.value / sumValues(stepBreakdown)) ? 0 : ((arc.value / sumValues(stepBreakdown)) * 100).toFixed(0) + "%";
}

function sumValues(source) {
    return [...source].map(s => s.value).reduce((a, b) => a + b, 0);
}

const gradientIntensity = ref([
    "00","03","05","08","0A","0D","0F","12","14","17","1A","1C","1F","21","24","26","29","2B","2E","30","33","36","38","3B","3D","40","42","45","47","4A","4D","4F","52","54","57","59","5C","5E","61","63","66","69","6B","6E","70","73","75","78","7A","7D","80","82","85","87","8A","8C","8F","91","94","96","99","9C","9E","A1","A3","A6","A8","AB","AD","B0","B3","B5","B8","BA","BD","BF","C2","C4","C7","C9","CC","CF","D1","D4","D6","D9","DB","DE","E0","E3","E6","E8","EB","ED","F0","F2","F5","F7","FA","FC","FF"
]);

const total = computed(() => {
    return donutSet.value.map(s => s.value).reduce((a,b) => a + b, 0);
});

const average = computed(() => {
    return total.value / donutSet.value.length;
});

function closeDetails(){
    if(details.value) {
        details.value.removeAttribute("open")
    }
}

function useTooltip(arc, i, showTooltip = true) {
    isTooltip.value = showTooltip;
    selectedSerie.value = i;
    let html = "";

    html += `<div style="width:100%;text-align:center;border-bottom:1px solid #ccc;padding-bottom:6px;margin-bottom:3px;">${arc.name}</div>`;
    html += `<div style="display:flex;flex-direction:row;gap:6px;align-items:center;"><span style="color:${arc.color};font-size:${donutConfig.value.style.chart.tooltip.fontSize * 1.6}px;">●</span>`;
    if(donutConfig.value.style.chart.tooltip.showValue) {
        html += `<b>${arc.value.toFixed(donutConfig.value.style.chart.tooltip.roundingValue)}</b>`;
    }
    if(donutConfig.value.style.chart.tooltip.showPercentage) {
        if(!donutConfig.value.style.chart.tooltip.showValue) {
            html += `<b>${(arc.proportion * 100).toFixed(donutConfig.value.style.chart.tooltip.roundingPercentage)}%</b></div>`;
        } else {
            html += `<span>(${(arc.proportion * 100).toFixed(donutConfig.value.style.chart.tooltip.roundingPercentage)}%)</span></div>`;
        }
    }
    tooltipContent.value = `<div>${html}</div>`;
}

function generatePdf(){
    isPrinting.value = true;
    pdf({
        domElement: document.getElementById(`donut__${uid.value}`),
        fileName: donutConfig.value.style.chart.title.text || 'vue-ui-donut'
    }).finally(() => {
        isPrinting.value = false;
    });
}

const table = computed(() => {
    const head = donutSet.value.map(ds => {
        return {
            name: ds.name,
            color: ds.color
        }
    });
    const body = donutSet.value.map(ds => ds.value);
    return { head, body };
});

function generateXls() {
    nextTick(() => {
        const labels = table.value.head.map((h,i) => {
            return [[
                h.name
            ],[table.value.body[i]], [isNaN(table.value.body[i] / total.value) ? '-' : table.value.body[i] / total.value * 100]]
        });
        const tableXls = [[donutConfig.value.style.chart.title.text],[donutConfig.value.style.chart.title.subtitle.text],[[""],["val"],["%"]]].concat(labels);
    
        function s2ab(s) {
            let buf = new ArrayBuffer(s.length);
            let view = new Uint8Array(buf);
            for (let i = 0; i < s.length; i++) {
                view[i] = s.charCodeAt(i) & 0xff;
            }
            return buf;
        }
    
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet(tableXls);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
        const excelFile = XLSX.write(workbook, { bookType: 'xlsx', type: 'binary' });
        const blob = new Blob([s2ab(excelFile)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = `${donutConfig.value.style.chart.title.text.replaceAll(" ", "_") || 'vue-ui-donut'}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(link.href);
    });
}

</script>

<template>
    <div :ref="`donutChart`" class="vue-ui-donut" :style="`font-family:${donutConfig.style.fontFamily};width:100%; text-align:center`" :id="`donut__${uid}`">
        <div v-if="(!mutableConfig.inside || isPrinting) && donutConfig.style.chart.title.text" :style="`width:100%;background:${donutConfig.style.chart.backgroundColor}`">

            <!-- TITLE AS DIV -->
            <div :style="`width:100%;text-align:center;color:${donutConfig.style.chart.title.color};font-size:${donutConfig.style.chart.title.fontSize}px;font-weight:${donutConfig.style.chart.title.bold ? 'bold': ''}`">
                {{ donutConfig.style.chart.title.text }}
            </div>
            <div v-if="donutConfig.style.chart.title.subtitle.text" :style="`width:100%;text-align:center;color:${donutConfig.style.chart.title.subtitle.color};font-size:${donutConfig.style.chart.title.subtitle.fontSize}px;font-weight:${donutConfig.style.chart.title.subtitle.bold ? 'bold': ''}`">
                {{ donutConfig.style.chart.title.subtitle.text }}
            </div>
        </div>


        <!-- OPTIONS -->
        <details class="vue-ui-donut-user-options" :style="`background:${donutConfig.style.chart.backgroundColor};color:${donutConfig.style.chart.color}`" data-html2canvas-ignore v-if="donutConfig.userOptions.show" ref="details">
            <summary :style="`background:${donutConfig.style.chart.backgroundColor};color:${donutConfig.style.chart.color}`">{{ donutConfig.userOptions.title }}</summary>
            <div class="vue-ui-donut-user-options-items" :style="`background:${donutConfig.style.chart.backgroundColor};color:${donutConfig.style.chart.color}`">
                <div class="vue-ui-donut-user-option-item">
                    <input type="checkbox" :id="`vue-ui-donut-option-datalabels_${uid}`" :name="`vue-ui-donut-option-datalabels_${uid}`"
                    v-model="mutableConfig.dataLabels.show">
                    <label :for="`vue-ui-donut-option-datalabels_${uid}`">{{ donutConfig.userOptions.labels.dataLabels }}</label>
                </div>
                <div class="vue-ui-donut-user-option-item">
                    <input type="checkbox" :id="`vue-ui-donut-option-title_${uid}`" :name="`vue-ui-donut-option-title_${uid}`"
                    v-model="mutableConfig.inside">
                    <label :for="`vue-ui-donut-option-title_${uid}`">{{ donutConfig.userOptions.labels.useDiv }}</label>
                </div>
                <div class="vue-ui-donut-user-option-item">
                    <input type="checkbox" :id="`vue-ui-donut-option-table_${uid}`" :name="`vue-ui-donut-option-table_${uid}`"
                    v-model="mutableConfig.showTable">
                    <label :for="`vue-ui-donut-option-table_${uid}`">{{ donutConfig.userOptions.labels.showTable }}</label>
                </div>
                <button class="vue-ui-donut-button" @click="generatePdf" :disabled="isPrinting" style="margin-top:12px" :style="`color:${donutConfig.style.chart.color}`">
                    <svg class="vue-ui-donut-print-icon" xmlns="http://www.w3.org/2000/svg" v-if="isPrinting" width="20" height="20" viewBox="0 0 24 24" stroke-width="1.5" stroke="#2c3e50" fill="none" stroke-linecap="round" stroke-linejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                        <path d="M18 16v.01" />
                        <path d="M6 16v.01" />
                        <path d="M12 5v.01" />
                        <path d="M12 12v.01" />
                        <path d="M12 1a4 4 0 0 1 2.001 7.464l.001 .072a3.998 3.998 0 0 1 1.987 3.758l.22 .128a3.978 3.978 0 0 1 1.591 -.417l.2 -.005a4 4 0 1 1 -3.994 3.77l-.28 -.16c-.522 .25 -1.108 .39 -1.726 .39c-.619 0 -1.205 -.14 -1.728 -.391l-.279 .16l.007 .231a4 4 0 1 1 -2.212 -3.579l.222 -.129a3.998 3.998 0 0 1 1.988 -3.756l.002 -.071a4 4 0 0 1 -1.995 -3.265l-.005 -.2a4 4 0 0 1 4 -4z" />
                    </svg>
                    <span v-else>PDF</span>
                </button>
                <button class="vue-ui-donut-button" @click="generateXls" :style="`color:${donutConfig.style.chart.color}`">
                    XLSX
                </button>
            </div>
        </details>

        <svg :viewBox="`0 0 ${svg.width} ${svg.height}`" :style="`max-width:100%; overflow: visible; background:${donutConfig.style.chart.backgroundColor};color:${donutConfig.style.chart.color}`" @click="closeDetails">
            
            <!-- DEFS -->
            <defs>
                <radialGradient :id="`gradient_${uid}`" v-if="donutConfig.style.chart.useGradient">
                    <stop offset="0%" :stop-color="`${convertColorToHex(donutConfig.style.chart.backgroundColor)}00`" />
                    <stop offset="77%" :stop-color="'#FFFFFF' + gradientIntensity[donutConfig.style.chart.gradientIntensity]" />
                    <stop offset="100%" :stop-color="`${convertColorToHex(donutConfig.style.chart.backgroundColor)}00`" />
                </radialGradient>
            </defs>

            <!-- TITLE AS G -->
            <g v-if="donutConfig.style.chart.title.text && mutableConfig.inside && !isPrinting">
                <text
                    :font-size="donutConfig.style.chart.title.fontSize"
                    :fill="donutConfig.style.chart.title.color"
                    :x="svg.width / 2"
                    :y="48"
                    text-anchor="middle"
                    :style="`font-weight:${donutConfig.style.chart.title.bold ? 'bold' : ''}`"
                >
                    {{ donutConfig.style.chart.title.text }}
                </text>
                <text
                    v-if="donutConfig.style.chart.title.subtitle.text"
                    :font-size="donutConfig.style.chart.title.subtitle.fontSize"
                    :fill="donutConfig.style.chart.title.subtitle.color"
                    :x="svg.width / 2"
                    :y="48 + donutConfig.style.chart.title.fontSize"
                    text-anchor="middle"
                    :style="`font-weight:${donutConfig.style.chart.title.subtitle.bold ? 'bold' : ''}`"
                >
                    {{ donutConfig.style.chart.title.subtitle.text }}
                </text>
            </g>
            <path 
                v-for="(arc, i) in currentDonut" 
                :d="arc.path" 
                :stroke="`${arc.color}CC`" 
                :stroke-width="defaultConfig.style.chart.layout.donut.strokeWidth" 
                fill="none"
            />

            <!-- HOLLOW -->
            <circle
                v-if="donutConfig.style.chart.useGradient"
                :cx="svg.width / 2"
                :cy="svg.height / 2"
                :r="136"
                :fill="`url(#gradient_${uid})`"
            />

              <!-- TOOLTIP TRAPS -->
              <path 
                v-for="(arc, i) in currentDonut" 
                :d="arc.path" 
                :stroke="selectedSerie === i ? 'rgba(0,0,0,0.1)' : 'transparent'" 
                :stroke-width="defaultConfig.style.chart.layout.donut.strokeWidth" 
                fill="none"
                @mouseenter="useTooltip(arc, i, true)"
                @mouseleave="isTooltip = false; selectedSerie = null"
                @click="segregate(i)"
            />

            <circle 
                :cx="svg.width / 2" 
                :cy="svg.height / 2" 
                :r="svg.width - 400 - donutConfig.style.chart.layout.donut.strokeWidth / 2"
                :fill="donutConfig.style.chart.backgroundColor"/>

            <!-- HOLLOW LABELS -->
            <text 
                v-if="donutConfig.style.chart.layout.labels.hollow.total.show"
                text-anchor="middle"
                :x="svg.width / 2"
                :y="svg.height / 2 - (donutConfig.style.chart.layout.labels.hollow.average.show ? donutConfig.style.chart.layout.labels.hollow.total.fontSize : 0) + donutConfig.style.chart.layout.labels.hollow.total.offsetY"
                :fill="donutConfig.style.chart.layout.labels.hollow.total.color"
                :font-size="donutConfig.style.chart.layout.labels.hollow.total.fontSize"
                :style="`font-weight:${donutConfig.style.chart.layout.labels.hollow.total.bold ? 'bold': ''}`"
            >
                {{ donutConfig.style.chart.layout.labels.hollow.total.text }}
            </text>
            <text 
                v-if="donutConfig.style.chart.layout.labels.hollow.total.show"
                text-anchor="middle"
                :x="svg.width / 2"
                :y="svg.height / 2 + donutConfig.style.chart.layout.labels.hollow.total.fontSize - (donutConfig.style.chart.layout.labels.hollow.average.show ? donutConfig.style.chart.layout.labels.hollow.total.fontSize : 0) + donutConfig.style.chart.layout.labels.hollow.total.value.offsetY"
                :fill="donutConfig.style.chart.layout.labels.hollow.total.value.color"
                :font-size="donutConfig.style.chart.layout.labels.hollow.total.value.fontSize"
                :style="`font-weight:${donutConfig.style.chart.layout.labels.hollow.total.value.bold ? 'bold': ''}`"
            >
                {{ donutConfig.style.chart.layout.labels.hollow.total.value.prefix }} {{ total.toFixed(donutConfig.style.chart.layout.labels.hollow.total.value.rounding) }} {{ donutConfig.style.chart.layout.labels.hollow.total.value.suffix }}
            </text>

            <text 
                v-if="donutConfig.style.chart.layout.labels.hollow.average.show"
                text-anchor="middle"
                :x="svg.width / 2"
                :y="svg.height / 2 + (donutConfig.style.chart.layout.labels.hollow.total.show ? donutConfig.style.chart.layout.labels.hollow.average.fontSize : 0) + donutConfig.style.chart.layout.labels.hollow.average.offsetY"
                :fill="donutConfig.style.chart.layout.labels.hollow.average.color"
                :font-size="donutConfig.style.chart.layout.labels.hollow.average.fontSize"
                :style="`font-weight:${donutConfig.style.chart.layout.labels.hollow.average.bold ? 'bold': ''}`"
            >
                {{ donutConfig.style.chart.layout.labels.hollow.average.text }}
            </text>
            <text 
                v-if="donutConfig.style.chart.layout.labels.hollow.average.show"
                text-anchor="middle"
                :x="svg.width / 2"
                :y="svg.height / 2 + (donutConfig.style.chart.layout.labels.hollow.total.show ? donutConfig.style.chart.layout.labels.hollow.average.fontSize : 0) + donutConfig.style.chart.layout.labels.hollow.average.fontSize + donutConfig.style.chart.layout.labels.hollow.average.value.offsetY"
                :fill="donutConfig.style.chart.layout.labels.hollow.average.value.color"
                :font-size="donutConfig.style.chart.layout.labels.hollow.average.value.fontSize"
                :style="`font-weight:${donutConfig.style.chart.layout.labels.hollow.average.value.bold ? 'bold': ''}`"
            >
                {{ donutConfig.style.chart.layout.labels.hollow.average.value.prefix }} {{ isNaN(average.toFixed(donutConfig.style.chart.layout.labels.hollow.average.value.rounding)) ? "-" : average.toFixed(donutConfig.style.chart.layout.labels.hollow.average.value.rounding) }} {{ donutConfig.style.chart.layout.labels.hollow.average.value.suffix }}
            </text>


            <!-- DATALABELS -->
            <g v-for="(arc, i) in currentDonut">
                <text
                    v-if="isArcBigEnough(arc) && mutableConfig.dataLabels.show"
                    text-anchor="middle"
                    :x="calcDonutMarkerLabelPositionX(arc)"
                    :y="arc.center.endY - donutConfig.style.chart.layout.labels.percentage.fontSize / 2"
                    :fill="donutConfig.style.chart.layout.labels.percentage.color"
                    :font-size="donutConfig.style.chart.layout.labels.percentage.fontSize"
                    :style="`font-weight:${donutConfig.style.chart.layout.labels.percentage.bold ? 'bold': ''}`"
                >
                    {{ displayArcPercentage(arc, currentDonut)  }}
                </text>
                <text
                    v-if="isArcBigEnough(arc) && mutableConfig.dataLabels.show"
                    text-anchor="middle"
                    :x="calcDonutMarkerLabelPositionX(arc)"
                    :y="arc.center.endY + donutConfig.style.chart.layout.labels.percentage.fontSize / 2"
                    :fill="donutConfig.style.chart.layout.labels.name.color"
                    :font-size="donutConfig.style.chart.layout.labels.name.fontSize"
                    :style="`font-weight:${donutConfig.style.chart.layout.labels.name.bold ? 'bold': ''}`"
                >
                    {{ arc.name}}
                </text>
            </g>

          

            <!-- LEGEND AS G -->
            <foreignObject 
                v-if="donutConfig.style.chart.legend.show && mutableConfig.inside && !isPrinting"
                :x="0"
                :y="svg.height / 2 + 150"
                width="100%"
                height="100"
                style="overflow:visible"
            >
                <div class="vue-ui-donut-legend" :style="`background:transparent;color:${donutConfig.style.chart.legend.color};font-size:${donutConfig.style.chart.legend.fontSize}px;font-weight:${donutConfig.style.chart.legend.bold ? 'bold' : ''}`">
                    <div v-for="(legendItem, i) in legendSet" class="vue-ui-donut-legend-item" @click="segregate(i)" :style="`opacity:${segregated.includes(i) ? 0.5 : 1}`">
                        <span :style="`color:${legendItem.color};font-size:${donutConfig.style.chart.legend.fontSize * 1.6}px`">●</span>
                        <span>{{ legendItem.name }} : </span>
                        <span>{{ legendItem.value}}</span>
                        <span>({{ isNaN(legendItem.value / total) ? '-' : (legendItem.value / total * 100).toFixed(donutConfig.style.chart.legend.roundingPercentage)}}%)</span>
                    </div>
                </div>
            </foreignObject>
        </svg>

        <!-- LEGEND AS DIV -->
        <div v-if="donutConfig.style.chart.legend.show && (!mutableConfig.inside || isPrinting)" class="vue-ui-donut-legend" :style="`background:${donutConfig.style.chart.legend.backgroundColor};color:${donutConfig.style.chart.legend.color};font-size:${donutConfig.style.chart.legend.fontSize}px;padding-bottom:12px;font-weight:${donutConfig.style.chart.legend.bold ? 'bold' : ''}`" @click="closeDetails">
            <div v-for="(legendItem, i) in legendSet" class="vue-ui-donut-legend-item" @click="segregate(i)" :style="`opacity:${segregated.includes(i) ? 0.5 : 1}`">
                <span :style="`color:${legendItem.color};font-size:${donutConfig.style.chart.legend.fontSize * 1.6}px`">●</span>
                <span>{{ legendItem.name }} : </span>
                <span>{{ legendItem.value.toFixed(donutConfig.style.chart.legend.roundingValue) }}</span>
                <span v-if="!segregated.includes(i)">({{ isNaN(legendItem.value / total) ? '-' : (legendItem.value / total * 100).toFixed(donutConfig.style.chart.legend.roundingPercentage)}}%)</span>
            </div>
        </div>

        <!-- TOOLTIP -->
        <div 
            class="vue-ui-donut-tooltip"
            ref="tooltip"
            v-if="donutConfig.style.chart.tooltip.show && isTooltip"
            :style="`top:${tooltipPosition.top}px;left:${tooltipPosition.left}px;background:${donutConfig.style.chart.tooltip.backgroundColor};color:${donutConfig.style.chart.tooltip.color}`"
            v-html="tooltipContent"
        />

        <!-- DATA TABLE -->
        <div @click="closeDetails" class="vue-ui-donut-table" :style="`width:100%;margin-top:${mutableConfig.inside ? '48px' : ''}`" v-if="mutableConfig.showTable">
            <table>
                <thead>
                    <tr v-if="donutConfig.style.chart.title.text">
                        <th colspan="3" :style="`background:${donutConfig.table.th.backgroundColor};color:${donutConfig.table.th.color};outline:${donutConfig.table.th.outline}`">
                            <span>{{ donutConfig.style.chart.title.text }}</span>
                            <span v-if="donutConfig.style.chart.title.subtitle.text">
                                : {{ donutConfig.style.chart.title.subtitle.text }}
                            </span>
                        </th>
                    </tr>
                    <tr>
                        <th align="right" :style="`background:${donutConfig.table.th.backgroundColor};color:${donutConfig.table.th.color};outline:${donutConfig.table.th.outline};padding-right:6px`">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18 16v2a1 1 0 0 1 -1 1h-11l6 -7l-6 -7h11a1 1 0 0 1 1 1v2" /></svg>
                        </th>
                        <th :style="`background:${donutConfig.table.th.backgroundColor};color:${donutConfig.table.th.color};outline:${donutConfig.table.th.outline};text-align:right;padding-right:6px`">
                            {{ total.toFixed(donutConfig.table.td.roundingValue) }}
                        </th>
                        <th :style="`background:${donutConfig.table.th.backgroundColor};color:${donutConfig.table.th.color};outline:${donutConfig.table.th.outline};text-align:right;padding-right:6px`">
                            100%
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(th, i) in table.head">
                        <td :style="`background:${donutConfig.table.td.backgroundColor};color:${donutConfig.table.td.color};outline:${donutConfig.table.td.outline}`">
                            <div style="max-width: 200px margin:0 auto">
                                <span :style="`color:${th.color};margin-right:6px;`">●</span>
                                <span>{{ th.name }}</span>
                            </div>
                        </td>
                        <td :style="`background:${donutConfig.table.td.backgroundColor};color:${donutConfig.table.td.color};outline:${donutConfig.table.td.outline}`">
                            {{ table.body[i].toFixed(donutConfig.table.td.roundingValue) }}
                        </td>
                        <td :style="`background:${donutConfig.table.td.backgroundColor};color:${donutConfig.table.td.color};outline:${donutConfig.table.td.outline}`">
                            {{ isNaN(table.body[i] / total) ? "-" : (table.body[i] / total * 100).toFixed(donutConfig.table.td.roundingPercentage) }}%
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<style scoped>
.vue-ui-donut *{
    transition: unset;
}
.vue-ui-donut {
    user-select: none;
    position: relative;
    padding-top: 36px;
}
.vue-ui-donut .vue-ui-donut-label {
    align-items: center;
    display: flex;
    flex-direction: column;
    height:100%;
    justify-content: center;
    text-align:center;
    width:100%;
}
.vue-ui-donut-legend {
    height: 100%;
    width:100%;
    display: flex;
    align-items:center;
    flex-wrap: wrap;
    justify-content:center;
    column-gap: 18px;
}
.vue-ui-donut-legend-item {
    display: flex;
    align-items:center;
    gap: 6px;
    cursor: pointer;
    height: 24px;
}

/** */
.vue-ui-donut-tooltip {
    border: 1px solid #e1e5e8;
    border-radius: 4px;
    box-shadow: 0 6px 12px -6px rgba(0,0,0,0.2);
    max-width: 300px;
    position: fixed;
    padding:12px;
    z-index:1;
}
.vue-ui-donut-user-options {
    border-radius: 4px;
    padding: 6px 12px;
    position: absolute;
    right:0;
    top:0px;
    max-width: 300px;
    text-align:left;
}
.vue-ui-donut-user-options[open] {
    border: 1px solid #e1e5e8;
    box-shadow: 0 6px 12px -6px rgba(0,0,0,0.2);
}
.vue-ui-donut summary {
    text-align: right;
    direction: rtl;
}
.vue-ui-donut-user-options-items {
    width: 100%;
    display: flex;
    flex-direction: column;
    margin-top: 6px;
}
.vue-ui-donut-user-options-item {
    width: 100%;
    display: flex;
    flex-direction: row;
    gap: 5px;
    align-items:center;
}

.vue-ui-donut-button {
    margin: 6px 0;
    border-radius: 3px;
    height: 30px;
    border: 1px solid #b9bfc4;
    background: inherit;
    display: flex;
    align-items:center;
    justify-content: center;
}
.vue-ui-donut-button:hover {
    background: rgba(0,0,0,0.05);
}
.vue-ui-donut-print-icon {
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

.vue-ui-donut table {
    width: 100%;
    border-collapse:collapse;
}
.vue-ui-donut table td {
    text-align:right;
    padding-right: 6px;
    font-variant-numeric: tabular-nums;
}
.vue-ui-donut table th {
    position: sticky;
    top:0;
    font-weight: 400;
    user-select: none;
}
</style>