<script setup>
import { ref, onMounted, onBeforeUnmount, computed, nextTick } from "vue";
import { treeShake, palette, shiftHue } from "../lib";
import pdf from "../pdf";
import * as XLSX from 'xlsx';

// TODO: accept color formats

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

const uid = ref(`vue-ui-waffle-${Math.random()}`);
const defaultConfig = ref({
    style: {
        fontFamily: "inherit",
        chart: {
            backgroundColor: "#FFFFFF",
            color: "#2D353C",
            layout: {
                grid: {
                    size: 20,
                    spaceBetween: 2,
                    vertical: false,
                },
                rect: {
                    rounded: true,
                    rounding: 2,
                    stroke: "#2D353C",
                    strokeWidth: 1,
                    useGradient: true,
                    gradientIntensity: 40,
                },
                useDiv: true,
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
                backgroundColor: "#FFFFFF",
                color: "#2D353C",
                fontSize: 14,
                showValue: true,
                showPercentage: true,
                roundingValue: 0,
                roundingPercentage: 0,
            },
            legend: {
                show: true,
                backgroundColor: "#FFFFFF",
                color: "#2D353C",
                fontSize: 14,
                roundingValue: 0,
                roundingPercentage: 0,
            }
        }
    },
    userOptions: {
        show: true,
        title: "options",
        labels: {
            useDiv: "Title & legend inside",
            showTable: "Show table"
        }
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
const waffleChart = ref(null);
const tooltip = ref(null);
const details = ref(null);
const clientPosition = ref({
    x: 0,
    y:0,
});
const isTooltip = ref(false);
const tooltipContent = ref("");
const selectedSerie = ref(null);

const tooltipPosition = computed(() => {
    let offsetX = 0;
    let offsetY = 48;
    if(tooltip.value && waffleChart.value) {
        const { width, height } = tooltip.value.getBoundingClientRect();
        const chartBox = waffleChart.value.getBoundingClientRect();

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

const waffleConfig = computed(() => {
    if(!Object.keys(props.config || {}).length) {
        return defaultConfig.value;
    }
    return treeShake({
        defaultConfig: defaultConfig.value,
        userConfig: props.config
    });
});

const mutableConfig = ref({
    inside: !waffleConfig.value.style.chart.layout.useDiv //!
})

const svg = computed(() => {
    const height = mutableConfig.value.inside ? 704 : 512;
    return {
        height,
        width: 512,
    }
});

const drawingArea = computed(() => {
    return {
        top: !mutableConfig.value.inside ? 0 : 64,
        left: 0,
        height: 512,
        width: 512,
    }
});

const rectDimension = computed(() => {
    return ((drawingArea.value.width - (waffleConfig.value.style.chart.layout.grid.size * waffleConfig.value.style.chart.layout.grid.spaceBetween )) / waffleConfig.value.style.chart.layout.grid.size);
});

function calculateProportions(numbers) {
  const totalSum = numbers.reduce((a, b) => a + b, 0);
  const proportions = numbers.map(num => Math.round((num / totalSum) * 100) / 100);
  const roundedSum = proportions.reduce((a, b) => a + b, 0);

  if (roundedSum !== 1) {
    const lastIndex = proportions.length - 1;
    proportions[lastIndex] += (1 - roundedSum);
    proportions[lastIndex] = Math.round(proportions[lastIndex] * 100) / 100;
  }
  return proportions;
}

const datasetCopy = computed(() => {
    return props.dataset.map((s, i) => {
        return {
            ...s,
            color: s.color || palette[i] || palette[i % palette.length],
            uid: `serie_${i}`
        }
    });
});

const proportions = computed(() => {
    const numbers = datasetCopy.value
        .filter((serie,i) => !segregated.value.includes(serie.uid))
        .map((serie, i) => serie.values.reduce((a,b) => a + b));
    return calculateProportions(numbers);
});

const waffleSet = computed(() => {
    return datasetCopy.value
        .filter((serie, i) => !segregated.value.includes(serie.uid))
        .map((serie, i) => {
            return {
                uid: serie.uid,
                name: serie.name,
                color: serie.color,
                value: serie.values.reduce((a,b) => a + b, 0),
                absoluteValues: serie.values,
                proportion: proportions.value[i] * Math.pow(waffleConfig.value.style.chart.layout.grid.size, 2)
            }
        })
        .sort((a,b) => b.value - a.value)
});

const cumulatedSet = computed(() => {
    return waffleSet.value.map((serie, i) => {
        const start = i > 0 ? waffleSet.value.filter((_,j) => j < i).map(el => el.proportion).reduce((a,b) => a + b) + serie.proportion - waffleSet.value[i - 1].proportion: serie.proportion - serie.proportion;
        const end = start + serie.proportion;
        const rects = [];
        for(let j = start; j <= end; j += 1) {
            rects.push(j)
        }
        return {
            ...serie,
            start: i > 0 ? waffleSet.value.filter((_,j) => j < i).map(el => el.proportion).reduce((a,b) => a + b) + serie.proportion - waffleSet.value[i - 1].proportion: serie.proportion - serie.proportion,
            rects
        }
    });
});

const rects = computed(() => {
    return cumulatedSet.value.flatMap((serie, s) => {
        return serie.rects.map((rect, i) => {
            return {
                name: serie.name,
                color: serie.color,
                value: serie.value,
                serieIndex: s,
                ...serie
            }
        })
    })
});

const positions = computed(() => {
    const grid = [];
    for(let i = 0; i < waffleConfig.value.style.chart.layout.grid.size; i += 1) {
        for(let j = 0; j < waffleConfig.value.style.chart.layout.grid.size; j += 1) {
            grid.push({
                x: (waffleConfig.value.style.chart.layout.grid.vertical ? i : j) * (rectDimension.value + waffleConfig.value.style.chart.layout.grid.spaceBetween),
                y: (waffleConfig.value.style.chart.layout.grid.vertical ? j : i) * (rectDimension.value + waffleConfig.value.style.chart.layout.grid.spaceBetween) + drawingArea.value.top,
            })
        }
    }
    return grid;
});

const legendSet = computed(() => {
    return datasetCopy.value
        .map((serie, i) => {
            return {
                name: serie.name,
                color: serie.color || palette[i] || palette[i % palette.length],
                value: serie.values.reduce((a,b) => a + b, 0),
                uid: serie.uid
            }
        })
        .sort((a,b) => b.value - a.value);
});

const gradientIntensity = ref([
    "00","03","05","08","0A","0D","0F","12","14","17","1A","1C","1F","21","24","26","29","2B","2E","30","33","36","38","3B","3D","40","42","45","47","4A","4D","4F","52","54","57","59","5C","5E","61","63","66","69","6B","6E","70","73","75","78","7A","7D","80","82","85","87","8A","8C","8F","91","94","96","99","9C","9E","A1","A3","A6","A8","AB","AD","B0","B3","B5","B8","BA","BD","BF","C2","C4","C7","C9","CC","CF","D1","D4","D6","D9","DB","DE","E0","E3","E6","E8","EB","ED","F0","F2","F5","F7","FA","FC","FF"
]);

const total = computed(() => {
    return waffleSet.value.map(s => s.value).reduce((a,b) => a + b, 0);
});

const average = computed(() => {
    return total.value / waffleSet.value.length;
});

function closeDetails(){
    if(details.value) {
        details.value.removeAttribute("open")
    }
}

function useTooltip(index) {
    if(segregated.value.length === props.dataset.length) return;
    const selected = rects.value[index];
    isTooltip.value = true;
    selectedSerie.value = rects.value[index].serieIndex;

    let html = "";

    html += `<div style="width:100%;text-align:center;border-bottom:1px solid #ccc;padding-bottom:6px;margin-bottom:3px;">${selected.name}</div>`; 
    html += `<div style="display:flex;flex-direction:row;gap:6px;align-items:center;"><span style="color:${selected.color};font-size:${waffleConfig.value.style.chart.tooltip.fontSize * 1.6}px;">◼</span>`;
    if(waffleConfig.value.style.chart.tooltip.showValue) {
        html += `<b>${selected.value.toFixed(waffleConfig.value.style.chart.tooltip.roundingValue)}</b>`;
    }
    if(waffleConfig.value.style.chart.tooltip.showPercentage) {
        if(!waffleConfig.value.style.chart.tooltip.showValue) {
            html += `<b>${(selected.value / total.value * 100).toFixed(waffleConfig.value.style.chart.tooltip.roundingPercentage)}%</b></div>`;
        } else {
            html += `<span>(${(selected.value / total.value * 100).toFixed(waffleConfig.value.style.chart.tooltip.roundingPercentage)}%)</span></div>`;
        }
    }
    tooltipContent.value = html;
}

const segregated = ref([]);

function segregate(uid) {
    if(segregated.value.includes(uid)) {
        segregated.value = segregated.value.filter(s => s !== uid);
    }else {
        segregated.value.push(uid);
    }
}

const table = computed(() => {
    const head = waffleSet.value.map(ds => {
        return {
            name: ds.name,
            color: ds.color
        }
    });
    const body = waffleSet.value.map(ds => ds.value);
    return { head, body };
});

function generatePdf(){
    isPrinting.value = true;
    pdf({
        domElement: document.getElementById(`vue-ui-waffle_${uid.value}`),
        fileName: waffleConfig.value.style.chart.title.text || 'vue-ui-waffle'
    }).finally(() => {
        isPrinting.value = false;
    });
}

function generateXls() {
    nextTick(() => {
        const labels = table.value.head.map((h,i) => {
            return [[
                h.name
            ],[table.value.body[i]], [isNaN(table.value.body[i] / total.value) ? '-' : table.value.body[i] / total.value * 100]]
        });
        const tableXls = [[waffleConfig.value.style.chart.title.text],[waffleConfig.value.style.chart.title.subtitle.text],[[""],["val"],["%"]]].concat(labels);
    
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
        link.download = `${waffleConfig.value.style.chart.title.text.replaceAll(" ", "_") || 'vue-ui-waffle'}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(link.href);
    });
}
</script>

<template>
    <div 
        class="vue-ui-waffle" 
        ref="waffleChart" 
        :id="`vue-ui-waffle_${uid}`"
        :style="`font-family:${waffleConfig.style.fontFamily};width:100%; text-align:center`"
    >
        <!-- TITLE AS DIV -->
        <div v-if="(!mutableConfig.inside || isPrinting) && waffleConfig.style.chart.title.text" :style="`width:100%;background:${waffleConfig.style.chart.backgroundColor};padding-bottom:12px`">
            <div :style="`width:100%;text-align:center;color:${waffleConfig.style.chart.title.color};font-size:${waffleConfig.style.chart.title.fontSize}px;font-weight:${waffleConfig.style.chart.title.bold ? 'bold': ''}`">
                {{ waffleConfig.style.chart.title.text }}
            </div>
            <div v-if="waffleConfig.style.chart.title.subtitle.text" :style="`width:100%;text-align:center;color:${waffleConfig.style.chart.title.subtitle.color};font-size:${waffleConfig.style.chart.title.subtitle.fontSize}px;font-weight:${waffleConfig.style.chart.title.subtitle.bold ? 'bold': ''}`">
                {{ waffleConfig.style.chart.title.subtitle.text }}
            </div>
        </div>

        <!-- OPTIONS -->
        <details class="vue-ui-waffle-user-options" :style="`background:${waffleConfig.style.chart.backgroundColor};color:${waffleConfig.style.chart.color}`" data-html2canvas-ignore v-if="waffleConfig.userOptions.show" ref="details">
            <summary :style="`background:${waffleConfig.style.chart.backgroundColor};color:${waffleConfig.style.chart.color}`">{{ waffleConfig.userOptions.title }}</summary>
            <div class="vue-ui-waffle-user-options-items" :style="`background:${waffleConfig.style.chart.backgroundColor};color:${waffleConfig.style.chart.color}`">
                <div class="vue-ui-waffle-user-option-item">
                    <input type="checkbox" :id="`vue-ui-waffle-option-title_${uid}`" :name="`vue-ui-waffle-option-title_${uid}`"
                    v-model="mutableConfig.inside">
                    <label :for="`vue-ui-waffle-option-title_${uid}`">{{ waffleConfig.userOptions.labels.useDiv }}</label>
                </div>
                <div class="vue-ui-waffle-user-option-item">
                    <input type="checkbox" :id="`vue-ui-waffle-option-table_${uid}`" :name="`vue-ui-waffle-option-table_${uid}`"
                    v-model="mutableConfig.showTable">
                    <label :for="`vue-ui-waffle-option-table_${uid}`">{{ waffleConfig.userOptions.labels.showTable }}</label>
                </div>
                <button class="vue-ui-waffle-button" @click="generatePdf" :disabled="isPrinting" style="margin-top:12px" :style="`color:${waffleConfig.style.chart.color}`">
                    <svg class="vue-ui-waffle-print-icon" xmlns="http://www.w3.org/2000/svg" v-if="isPrinting" width="20" height="20" viewBox="0 0 24 24" stroke-width="1.5" stroke="#2c3e50" fill="none" stroke-linecap="round" stroke-linejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                        <path d="M18 16v.01" />
                        <path d="M6 16v.01" />
                        <path d="M12 5v.01" />
                        <path d="M12 12v.01" />
                        <path d="M12 1a4 4 0 0 1 2.001 7.464l.001 .072a3.998 3.998 0 0 1 1.987 3.758l.22 .128a3.978 3.978 0 0 1 1.591 -.417l.2 -.005a4 4 0 1 1 -3.994 3.77l-.28 -.16c-.522 .25 -1.108 .39 -1.726 .39c-.619 0 -1.205 -.14 -1.728 -.391l-.279 .16l.007 .231a4 4 0 1 1 -2.212 -3.579l.222 -.129a3.998 3.998 0 0 1 1.988 -3.756l.002 -.071a4 4 0 0 1 -1.995 -3.265l-.005 -.2a4 4 0 0 1 4 -4z" />
                    </svg>
                    <span v-else>PDF</span>
                </button>
                <button class="vue-ui-waffle-button" @click="generateXls" :style="`color:${waffleConfig.style.chart.color}`">
                    XLSX
                </button>
            </div>
        </details>

        <!-- CHART -->
        <svg :viewBox="`0 0 ${svg.width} ${svg.height}`" :style="`max-width:100%;overflow:visible;background:${waffleConfig.style.chart.backgroundColor};color:${waffleConfig.style.chart.color}`" @click="closeDetails">

            <!-- DEFS -->
            <defs>
                <radialGradient cx="50%" cy="50%" r="50%" fx="50%" fy="50%" v-for="(rect,i) in rects" :id="`gradient_${uid}_${i}`">
                    <stop offset="0%" :stop-color="`${shiftHue(rect.color, 0.05)}${gradientIntensity[100 - waffleConfig.style.chart.layout.rect.gradientIntensity]}`"/>
                    <stop offset="100%" :stop-color="rect.color" />
                </radialGradient>
            </defs>

            <!-- TITLE AS G -->
            <g v-if="waffleConfig.style.chart.title.text && mutableConfig.inside && !isPrinting">
                <text
                    :font-size="waffleConfig.style.chart.title.fontSize"
                    :fill="waffleConfig.style.chart.title.color"
                    :x="svg.width / 2"
                    :y="waffleConfig.style.chart.title.fontSize"
                    text-anchor="middle"
                    :style="`font-weight:${waffleConfig.style.chart.title.bold ? 'bold' : ''}`"
                >
                    {{ waffleConfig.style.chart.title.text }}
                </text>
                <text
                    v-if="waffleConfig.style.chart.title.subtitle.text"
                    :font-size="waffleConfig.style.chart.title.subtitle.fontSize"
                    :fill="waffleConfig.style.chart.title.subtitle.color"
                    :x="svg.width / 2"
                    :y="waffleConfig.style.chart.title.fontSize * 2"
                    text-anchor="middle"
                    :style="`font-weight:${waffleConfig.style.chart.title.subtitle.bold ? 'bold' : ''}`"
                >
                    {{ waffleConfig.style.chart.title.subtitle.text }}
                </text>
            </g>

            <!-- RECTS -->
            <rect
                v-for="(position, i) in positions"
                @mouseover="useTooltip(i)"
                @mouseleave="isTooltip = false; selectedSerie = null"
                :rx="waffleConfig.style.chart.layout.rect.rounded ? waffleConfig.style.chart.layout.rect.rounding : 0"
                :x="position.x"
                :y="position.y"
                :height="rectDimension"
                :width="rectDimension"
                :fill="`url(#gradient_${uid}_${i})`"
                :stroke="waffleConfig.style.chart.layout.rect.stroke"
                :stroke-width="waffleConfig.style.chart.layout.rect.strokeWidth"
            />

            <!-- LEGEND AS G -->
            <foreignObject
                v-if="waffleConfig.style.chart.legend.show && mutableConfig.inside && !isPrinting"
                :x="0"
                :y="512 + 64"
                width="100%"
                height="100"
                style="overflow: visible;"
            >
                <div class="vue-ui-waffle-legend" :style="`background:${waffleConfig.style.chart.legend.backgroundColor};color:${waffleConfig.style.chart.legend.color};font-size:${waffleConfig.style.chart.legend.fontSize}px;padding-bottom:12px;font-weight:${waffleConfig.style.chart.legend.bold ? 'bold' : ''}`" @click="closeDetails">
                    <div v-for="(legendItem, i) in legendSet" class="vue-ui-waffle-legend-item" @click="segregate(legendItem.uid)" :style="`opacity:${segregated.includes(legendItem.uid) ? 0.5 : 1}`">
                        <span :style="`color:${legendItem.color};font-size:${waffleConfig.style.chart.legend.fontSize * 1.6}px`">◼</span>
                        <span>{{ legendItem.name }} : </span>
                        <span>{{ legendItem.value.toFixed(waffleConfig.style.chart.legend.roundingValue) }}</span>
                        <span v-if="!segregated.includes(legendItem.uid)">({{ isNaN(legendItem.value / total) ? '-' : (legendItem.value / total * 100).toFixed(waffleConfig.style.chart.legend.roundingPercentage)}}%)</span>
                    </div>
                </div>
            </foreignObject>
            
        </svg>

        <!-- LEGEND AS DIV -->
        <div v-if="waffleConfig.style.chart.legend.show && (!mutableConfig.inside || isPrinting)" class="vue-ui-waffle-legend" :style="`background:${waffleConfig.style.chart.legend.backgroundColor};color:${waffleConfig.style.chart.legend.color};font-size:${waffleConfig.style.chart.legend.fontSize}px;padding-bottom:12px;font-weight:${waffleConfig.style.chart.legend.bold ? 'bold' : ''}`" @click="closeDetails">
            <div v-for="(legendItem, i) in legendSet" class="vue-ui-waffle-legend-item" @click="segregate(legendItem.uid)" :style="`opacity:${segregated.includes(legendItem.uid) ? 0.5 : 1}`">
                <span :style="`color:${legendItem.color};font-size:${waffleConfig.style.chart.legend.fontSize * 1.6}px`">◼</span>
                <span>{{ legendItem.name }} : </span>
                <span>{{ legendItem.value.toFixed(waffleConfig.style.chart.legend.roundingValue) }}</span>
                <span v-if="!segregated.includes(legendItem.uid)">({{ isNaN(legendItem.value / total) ? '-' : (legendItem.value / total * 100).toFixed(waffleConfig.style.chart.legend.roundingPercentage)}}%)</span>
            </div>
        </div>

        <!-- TOOLTIP -->
        <div 
            class="vue-ui-waffle-tooltip"
            ref="tooltip"
            v-if="waffleConfig.style.chart.tooltip.show && isTooltip && segregated.length < props.dataset.length"
            :style="`top:${tooltipPosition.top}px;left:${tooltipPosition.left}px;background:${waffleConfig.style.chart.tooltip.backgroundColor};color:${waffleConfig.style.chart.tooltip.color}`"
            v-html="tooltipContent"
        />

        <!-- DATA TABLE -->
        <div @click="closeDetails" class="vue-ui-waffle-table" :style="`width:100%;margin-top:${mutableConfig.inside ? '48px' : ''}`" v-if="mutableConfig.showTable">
            <table>
                <thead>
                    <tr v-if="waffleConfig.style.chart.title.text">
                        <th colspan="3" :style="`background:${waffleConfig.table.th.backgroundColor};color:${waffleConfig.table.th.color};outline:${waffleConfig.table.th.outline}`">
                            <span>{{ waffleConfig.style.chart.title.text }}</span>
                            <span v-if="waffleConfig.style.chart.title.subtitle.text">
                                : {{ waffleConfig.style.chart.title.subtitle.text }}
                            </span>
                        </th>
                    </tr>
                    <tr>
                        <th align="right" :style="`background:${waffleConfig.table.th.backgroundColor};color:${waffleConfig.table.th.color};outline:${waffleConfig.table.th.outline};padding-right:6px`">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18 16v2a1 1 0 0 1 -1 1h-11l6 -7l-6 -7h11a1 1 0 0 1 1 1v2" /></svg>
                        </th>
                        <th :style="`background:${waffleConfig.table.th.backgroundColor};color:${waffleConfig.table.th.color};outline:${waffleConfig.table.th.outline};text-align:right;padding-right:6px`">
                            {{ total.toFixed(waffleConfig.table.td.roundingValue) }}
                        </th>
                        <th :style="`background:${waffleConfig.table.th.backgroundColor};color:${waffleConfig.table.th.color};outline:${waffleConfig.table.th.outline};text-align:right;padding-right:6px`">
                            100%
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(th, i) in table.head">
                        <td :style="`background:${waffleConfig.table.td.backgroundColor};color:${waffleConfig.table.td.color};outline:${waffleConfig.table.td.outline}`">
                            <div style="max-width: 200px margin:0 auto">
                                <span :style="`color:${th.color};margin-right:6px;`">◼</span>
                                <span>{{ th.name }}</span>
                            </div>
                        </td>
                        <td :style="`background:${waffleConfig.table.td.backgroundColor};color:${waffleConfig.table.td.color};outline:${waffleConfig.table.td.outline}`">
                            {{ table.body[i].toFixed(waffleConfig.table.td.roundingValue) }}
                        </td>
                        <td :style="`background:${waffleConfig.table.td.backgroundColor};color:${waffleConfig.table.td.color};outline:${waffleConfig.table.td.outline}`">
                            {{ isNaN(table.body[i] / total) ? "-" : (table.body[i] / total * 100).toFixed(waffleConfig.table.td.roundingPercentage) }}%
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<style scoped>
.vue-ui-waffle *{
    transition: unset;
}
.vue-ui-waffle {
    user-select: none;
    position: relative;
    padding-top: 36px;
}
.vue-ui-waffle .vue-ui-waffle-label {
    align-items: center;
    display: flex;
    flex-direction: column;
    height:100%;
    justify-content: center;
    text-align:center;
    width:100%;
}
.vue-ui-waffle-legend {
    height: 100%;
    width:100%;
    display: flex;
    align-items:center;
    flex-wrap: wrap;
    justify-content:center;
    column-gap: 18px;
}
.vue-ui-waffle-legend-item {
    display: flex;
    align-items:center;
    gap: 6px;
    cursor: pointer;
    height: 24px;
}
.vue-ui-waffle-tooltip {
    border: 1px solid #e1e5e8;
    border-radius: 4px;
    box-shadow: 0 6px 12px -6px rgba(0,0,0,0.2);
    max-width: 300px;
    position: fixed;
    padding:12px;
    z-index:1;
}

/** */
.vue-ui-waffle-user-options {
    border-radius: 4px;
    padding: 6px 12px;
    position: absolute;
    right:0;
    top:0px;
    max-width: 300px;
    text-align:left;
}
.vue-ui-waffle-user-options[open] {
    border: 1px solid #e1e5e8;
    box-shadow: 0 6px 12px -6px rgba(0,0,0,0.2);
}
.vue-ui-waffle summary {
    text-align: right;
    direction: rtl;
}
.vue-ui-waffle-user-options-items {
    width: 100%;
    display: flex;
    flex-direction: column;
    margin-top: 6px;
}
.vue-ui-waffle-user-options-item {
    width: 100%;
    display: flex;
    flex-direction: row;
    gap: 5px;
    align-items:center;
}

.vue-ui-waffle-button {
    margin: 6px 0;
    border-radius: 3px;
    height: 30px;
    border: 1px solid #b9bfc4;
    background: inherit;
    display: flex;
    align-items:center;
    justify-content: center;
}
.vue-ui-waffle-button:hover {
    background: rgba(0,0,0,0.05);
}
.vue-ui-waffle-print-icon {
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

.vue-ui-waffle table {
    width: 100%;
    border-collapse:collapse;
}
.vue-ui-waffle table td {
    text-align:right;
    padding-right: 6px;
    font-variant-numeric: tabular-nums;
}
.vue-ui-waffle table th {
    position: sticky;
    top:0;
    font-weight: 400;
    user-select: none;
}
</style>