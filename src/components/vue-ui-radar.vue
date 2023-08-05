<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from "vue";
import { treeShake, palette, createPolygonPath, shiftHue, opacity, convertColorToHex, convertConfigColors } from "../lib";
import pdf from "../pdf";
import * as XLSX from "xlsx";

const props = defineProps({
    config: {
        type: Object,
        default() {
            return {}
        }
    },
    dataset: {
        type: Object,
        default() {
            return {}
        }
    }
});

const uid = ref(`vue-ui-radar-${Math.random()}`);

const defaultConfig = ref({
    style: {
        fontFamily: "inherit",
        chart: {
            backgroundColor: "#FFFFFF",
            color: "#2D353C",
            layout: {
                useDiv: true,
                plots: {
                    show: true,
                    radius: 2,
                },
                outerPolygon: {
                    stroke: "#CCCCCC",
                    strokeWidth: 1,
                },
                dataPolygon: {
                    strokeWidth: 1,
                    transparent: false,
                    opacity: 20,
                    useGradient: true,
                },
                grid: {
                    show: true,
                    stroke: "#e1e5e8",
                    strokeWidth: 0.5,
                    graduations: 5
                },
                labels: {
                    dataLabels: {
                        show: true,
                        fontSize: 12,
                        color: "#2D353C"
                    }
                },
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
                bold: true,
                backgroundColor: "#FFFFFF",
                color: "#2D353C",
                fontSize: 14,
                roundingPercentage: 0,
            }
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
    },
    userOptions: {
        show: true,
        title: "options",
        labels: {
            useDiv: "Title & legend inside",
            showTable: "Show table"
        }
    },
    translations: {
        target: "Target"
    }
});

const isPrinting = ref(false);
const radarChart = ref(null);
const tooltip = ref(null);
const details = ref(null);
const clientPosition = ref({
    x: 0,
    y: 0
});
const isTooltip = ref(false);
const tooltipContent = ref("");

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
    if(tooltip.value && radarChart.value) {
        const { width, height } = tooltip.value.getBoundingClientRect();
        const chartBox = radarChart.value.getBoundingClientRect();

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

const radarConfig = computed(() => {
    if(!Object.keys(props.config || {}).length) {
        return defaultConfig.value;
    }
    const reconcilied =  treeShake({
        defaultConfig: defaultConfig.value,
        userConfig: props.config
    });
    return convertConfigColors(reconcilied);
});

const mutableConfig = ref({
    dataLabels: {
        show: radarConfig.value.style.chart.layout.labels.dataLabels.show,
    },
    inside: !radarConfig.value.style.chart.layout.useDiv,
    showTable: radarConfig.value.table.show
});

const svg = computed(() => {
    const height = mutableConfig.value.inside ? 412 : 312;
    return {
        height,
        width: 512,
    }
});

const emit = defineEmits(['selectLegend']);

const segregated = ref([]);

function segregate(index) {
    if(segregated.value.includes(index)) {
        segregated.value = segregated.value.filter(s => s !== index);
    }else {
        segregated.value.push(index);
    }
    emit('selectLegend', legend.value.filter((_, i) => !segregated.value.includes(i)).map(l => {
        return {
            name: l.name,
            color: l.color,
            proportion: l.totalProportion
        }
    }))
}

function getData() {
    return legend.value.map(l => {
        return {
            name: l.name,
            color: l.color,
            proportion: l.totalProportion
        }
    })
}

defineExpose({
    getData
});

const datasetCopy = computed(() => {
    return props.dataset.categories.map((c, i) => {
        return {
            name: c.name,
            categoryId: `radar_category_${uid.value}_${i}`,
            color: convertColorToHex(c.color) || palette[i] || palette[i % palette.length],
        }
    });
});

const seriesCopy = computed(() => {
    return props.dataset.series
        .map((s, i) => {
            return {
                ...s,
                color: convertColorToHex(s.color) || palette[i] || palette[i % palette.length],
                serieId: `radar_serie_${uid.value}_${i}`
            }
        });
});

const max = computed(() => Math.max(...seriesCopy.value
        .flatMap(s => s.values)));

const apexes = computed(() => {
    return seriesCopy.value.length;
});

const outerPolygon = computed(() => {
    return createPolygonPath({
        plot: { x: 256, y: svg.value.height / 2},
        radius: 128,
        sides: apexes.value,
        rotation: 0,
    })
});

const innerPolygons = computed(() => {
    const polygons = [];
    for (let i = 0; i < 128; i += (128 / radarConfig.value.style.chart.layout.grid.graduations)) {
         polygons.push(i)
    }
    return polygons;
})

const radar = computed(() => {
    return outerPolygon.value.coordinates.map((c, i) => {
        const plots = seriesCopy.value[i].values.map(v => {
                return plot({
                    centerX: svg.value.width / 2,
                    centerY: svg.value.height / 2,
                    apexX: c.x,
                    apexY: c.y,
                    proportion: v / (seriesCopy.value[i].target || max.value)
                })
            });
        return {
            ...c,
            ...seriesCopy.value[i],
            plots,
        }
    })
});

function offset({x, y}) {
    let anchor = "middle";
    x = Math.round(x);
    y = Math.round(y);
    if(x > svg.value.width / 2) {
        x += 12;
        anchor="start";
    }
    if(x < svg.value.width / 2) {
        x -= 12;
        anchor="end"
    }
    if(y > svg.value.height / 2) {
        y += 20;
    }
    if(y < svg.value.height / 2) {
        y -= 12;
    }
    if(y === svg.value.height / 2) {
        y += 4
    }
    return {x, y, anchor}
}

function plot({ centerX, centerY, apexX, apexY, proportion }) {
    return {
        x: centerX + (apexX - centerX) * proportion,
        y: centerY + (apexY - centerY) * proportion
    }
}

function makePath(plots) {
    let path = "";
    plots.forEach(plot => {
        path += `${plot.x},${plot.y } `
    })
    return `M${path}Z`;
}

const legend = computed(() => {
    const ratios = seriesCopy.value.map((s,i) => {
        return s.values.map(v => v / (s.target || max.value))
    });
    return datasetCopy.value.map((d,i) => {
        return {
            ...d,
            totalProportion: ratios.map(r => r[i]).reduce((a, b) => a + b, 0) / seriesCopy.value.length,

        }
    })
});

const table = computed(() => {
    const head = [{ name:"", color:""}, {name:radarConfig.value.translations.target, color:""}, ...legend.value];
    const body = props.dataset.series.map((s, i) => {
        return [ s.name, s.target, ...s.values.flatMap(v => {
            return [
                v ? v.toFixed(radarConfig.value.table.td.roundingValue) : '-', isNaN(v / s.target) ? '' : (v / s.target * 100).toFixed(radarConfig.value.table.td.roundingPercentage) + '%'
            ]
        })]
    });
    return { head, body };
});

const selectedIndex = ref(null);

function useTooltip(apex, i) {
    selectedIndex.value = i;
    isTooltip.value = true;
    let html = "";
    html += `<div style="width:100%;text-align:center;border-bottom:1px solid #ccc;padding-bottom:6px;margin-bottom:3px;">${apex.name}</div>`;
    for(let k = 0; k < apex.values.length; k += 1) {
        if(!segregated.value.includes(k)) {
            html += `<div style="display:flex;flex-wrap:wrap;align-items:center;gap:6px"><span style="color:${datasetCopy.value[k].color}">●</span><span>${datasetCopy.value[k].name}</span> : ${radarConfig.value.style.chart.tooltip.showValue ? `<span>${apex.values[k].toFixed(radarConfig.value.style.chart.tooltip.roundingValue)}</span>` : ''} ${!radarConfig.value.style.chart.tooltip.showValue && radarConfig.value.style.chart.tooltip.showPercentage ? `<span>${(apex.values[k] / apex.target * 100).toFixed(radarConfig.value.style.chart.tooltip.roundingPercentage)}%</span>` : radarConfig.value.style.chart.tooltip.showPercentage ? `<span>(${(apex.values[k] / apex.target * 100).toFixed(radarConfig.value.style.chart.tooltip.roundingPercentage)}%)</span>` : ''}</div>`
        }
    }
    tooltipContent.value = html;
}

function generatePdf(){
    isPrinting.value = true;
    pdf({
        domElement: document.getElementById(`vue-ui-radar_${uid.value}`),
        fileName: radarConfig.value.style.chart.title.text || 'vue-ui-radar'
    }).finally(() => {
        isPrinting.value = false;
    });
}

function generateXls() {
    nextTick(() => {
        const title = [[radarConfig.value.style.chart.title.text], [radarConfig.value.style.chart.title.subtitle.text], [""]];
        const head = [[""],[radarConfig.value.translations.target], ...legend.value.flatMap(l => [[l.name], ["%"]])];
        const body = props.dataset.series.map((s, i) => {
            return [ s.name, s.target, ...s.values.flatMap(v => {
                return [
                    v, isNaN(v / s.target) ? '' : v / s.target * 100
                ]
            })]
        });

        const tableXls = title.concat([head]).concat(body);
    
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
        link.download = `${radarConfig.value.style.chart.title.text.replaceAll(" ", "_") || 'vue-ui-radar'}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(link.href);
    });
}

function closeDetails(){
    if(details.value) {
        details.value.removeAttribute("open")
    }
}

</script>

<template>
    <div 
        class="vue-ui-radar"
        ref="radarChart"
        :id="`vue-ui-radar_${uid}`"
        :style="`font-family:${radarConfig.style.fontFamily};width:100%; text-align:center`"
    >
        <!-- TITLE AS DIV -->
        <div v-if="(!mutableConfig.inside || isPrinting) && radarConfig.style.chart.title.text" :style="`width:100%;background:${radarConfig.style.chart.backgroundColor};padding-bottom:12px`">
            <div :style="`width:100%;text-align:center;color:${radarConfig.style.chart.title.color};font-size:${radarConfig.style.chart.title.fontSize}px;font-weight:${radarConfig.style.chart.title.bold ? 'bold': ''}`">
                {{ radarConfig.style.chart.title.text }}
            </div>
            <div v-if="radarConfig.style.chart.title.subtitle.text" :style="`width:100%;text-align:center;color:${radarConfig.style.chart.title.subtitle.color};font-size:${radarConfig.style.chart.title.subtitle.fontSize}px;font-weight:${radarConfig.style.chart.title.subtitle.bold ? 'bold': ''}`">
                {{ radarConfig.style.chart.title.subtitle.text }}
            </div>
        </div>

        <!-- OPTIONS -->
        <details class="vue-ui-radar-user-options" :style="`background:${radarConfig.style.chart.backgroundColor};color:${radarConfig.style.chart.color}`" data-html2canvas-ignore v-if="radarConfig.userOptions.show" ref="details">
            <summary :style="`background:${radarConfig.style.chart.backgroundColor};color:${radarConfig.style.chart.color}`">{{ radarConfig.userOptions.title }}</summary>
            <div class="vue-ui-radar-user-options-items" :style="`background:${radarConfig.style.chart.backgroundColor};color:${radarConfig.style.chart.color}`">
                <div class="vue-ui-radar-user-option-item">
                    <input type="checkbox" :id="`vue-ui-radar-option-title_${uid}`" :name="`vue-ui-radar-option-title_${uid}`"
                    v-model="mutableConfig.inside">
                    <label :for="`vue-ui-radar-option-title_${uid}`">{{ radarConfig.userOptions.labels.useDiv }}</label>
                </div>
                <div class="vue-ui-radar-user-option-item">
                    <input type="checkbox" :id="`vue-ui-radar-option-table_${uid}`" :name="`vue-ui-radar-option-table_${uid}`"
                    v-model="mutableConfig.showTable">
                    <label :for="`vue-ui-radar-option-table_${uid}`">{{ radarConfig.userOptions.labels.showTable }}</label>
                </div>
                <button class="vue-ui-radar-button" @click="generatePdf" :disabled="isPrinting" style="margin-top:12px" :style="`color:${radarConfig.style.chart.color}`">
                    <svg class="vue-ui-radar-print-icon" xmlns="http://www.w3.org/2000/svg" v-if="isPrinting" width="20" height="20" viewBox="0 0 24 24" stroke-width="1.5" :stroke="radarConfig.style.chart.color" fill="none" stroke-linecap="round" stroke-linejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                        <path d="M18 16v.01" />
                        <path d="M6 16v.01" />
                        <path d="M12 5v.01" />
                        <path d="M12 12v.01" />
                        <path d="M12 1a4 4 0 0 1 2.001 7.464l.001 .072a3.998 3.998 0 0 1 1.987 3.758l.22 .128a3.978 3.978 0 0 1 1.591 -.417l.2 -.005a4 4 0 1 1 -3.994 3.77l-.28 -.16c-.522 .25 -1.108 .39 -1.726 .39c-.619 0 -1.205 -.14 -1.728 -.391l-.279 .16l.007 .231a4 4 0 1 1 -2.212 -3.579l.222 -.129a3.998 3.998 0 0 1 1.988 -3.756l.002 -.071a4 4 0 0 1 -1.995 -3.265l-.005 -.2a4 4 0 0 1 4 -4z" />
                    </svg>
                    <span v-else>PDF</span>
                </button>
                <button class="vue-ui-radar-button" @click="generateXls" :style="`color:${radarConfig.style.chart.color}`">
                    XLSX
                </button>
            </div>
        </details>

        <!-- CHART -->
        <svg :viewBox="`0 0 ${svg.width} ${svg.height}`" :style="`max-width:100%;overflow:visible;background:${radarConfig.style.chart.backgroundColor};color:${radarConfig.style.chart.color}`" @click="closeDetails">

            <!-- DEFS -->
            <defs>
                <radialGradient
                    cx="50%" cy="50%" r="50%" fx="50%" fy="50%"
                    v-for="(d, i) in datasetCopy"
                    :id="`radar_gradient_${uid}_${i}`"
                >
                    <stop offset="0%" :stop-color="`${shiftHue(d.color, 0.05)}${opacity[radarConfig.style.chart.layout.dataPolygon.opacity]}`"/>
                    <stop offset="100%" :stop-color="d.color + opacity[radarConfig.style.chart.layout.dataPolygon.opacity]" />
                </radialGradient>
            </defs>

            <!-- TITLE AS G -->
            <g v-if="radarConfig.style.chart.title.text && mutableConfig.inside && !isPrinting">
                <text
                    :font-size="radarConfig.style.chart.title.fontSize"
                    :fill="radarConfig.style.chart.title.color"
                    :x="svg.width / 2"
                    :y="radarConfig.style.chart.title.fontSize"
                    text-anchor="middle"
                    :style="`font-weight:${radarConfig.style.chart.title.bold ? 'bold' : ''}`"
                >
                    {{ radarConfig.style.chart.title.text }}
                </text>
                <text
                    v-if="radarConfig.style.chart.title.subtitle.text"
                    :font-size="radarConfig.style.chart.title.subtitle.fontSize"
                    :fill="radarConfig.style.chart.title.subtitle.color"
                    :x="svg.width / 2"
                    :y="radarConfig.style.chart.title.fontSize * 2"
                    text-anchor="middle"
                    :style="`font-weight:${radarConfig.style.chart.title.subtitle.bold ? 'bold' : ''}`"
                >
                    {{ radarConfig.style.chart.title.subtitle.text }}
                </text>
            </g>

            <!-- GRID -->
            <g v-if="radarConfig.style.chart.layout.grid.show">
                <!-- RADIAL LINES -->
                <line v-for="line in radar"
                    :x1="svg.width / 2"
                    :y1="svg.height / 2"
                    :x2="line.x"
                    :y2="line.y"
                    :stroke="radarConfig.style.chart.layout.grid.stroke"
                    :stroke-width="radarConfig.style.chart.layout.grid.strokeWidth"
                />
                <!-- INNER POLYGONS -->
                <g v-if="radarConfig.style.chart.layout.grid.graduations > 0">
                    <path 
                        v-for="radius in innerPolygons"
                        :d="createPolygonPath({
                            plot: { x: 256, y: svg.height / 2 },
                            radius: radius,
                            sides: apexes,
                            rotation: 0
                        }).path"
                        fill="none"
                        :stroke="radarConfig.style.chart.layout.grid.stroke"
                        :stroke-width="radarConfig.style.chart.layout.grid.strokeWidth"
                    />
                </g>
            </g>

            <!-- OUTER POLYGON -->
            <path :d="outerPolygon.path" fill="none" :stroke="radarConfig.style.chart.layout.outerPolygon.stroke" :stroke-width="radarConfig.style.chart.layout.outerPolygon.strokeWidth" stroke-linejoin="round" stroke-linecap="round"/>

            <!-- APEX LABELS -->
            <g v-if="radarConfig.style.chart.layout.labels.dataLabels.show">
            <text v-for="(label, i) in radar"
                :x="offset(label).x"
                :y="offset(label).y"
                :text-anchor="offset(label).anchor"
                :font-size="radarConfig.style.chart.layout.labels.dataLabels.fontSize"
                :fill="radarConfig.style.chart.layout.labels.dataLabels.color"
                @mouseenter="useTooltip(label, i)"
                @mouseleave="isTooltip = false; selectedIndex = null"
            >
                {{ label.name }}
            </text>
            </g>

            <!-- PLOTS -->
            <g v-for="(d, i) in datasetCopy">
                <g v-if="!segregated.includes(i)">
                    <path 
                        :d="makePath(radar.map(r => r.plots[i]))"
                        :stroke="d.color"
                        :stroke-width="radarConfig.style.chart.layout.dataPolygon.strokeWidth"
                        :fill="radarConfig.style.chart.layout.dataPolygon.transparent ? 'transparent' : radarConfig.style.chart.layout.dataPolygon.useGradient ? `url(#radar_gradient_${uid}_${i})` : d.color + opacity[radarConfig.style.chart.layout.dataPolygon.opacity]"
                    />
                </g>
            </g>
            
            <g v-if="radarConfig.style.chart.layout.plots.show">
                <g v-for="(category, i) in radar">
                    <circle 
                        v-for="(p, j) in category.plots"
                        :cx="p.x"
                        :cy="p.y"
                        :fill="segregated.includes(j) ? 'transparent' : datasetCopy[j].color"
                        :r="selectedIndex !== null && selectedIndex === i ? radarConfig.style.chart.layout.plots.radius * 1.6 : radarConfig.style.chart.layout.plots.radius"
                    />
                </g>
            </g>

            <!-- LEGEND AS G -->
            <foreignObject
                v-if="radarConfig.style.chart.legend.show && mutableConfig.inside && !isPrinting"
                :x="0"
                :y="340"
                width="100%"
                height="60"
                style="overflow: visible;"
            >
                <div class="vue-ui-radar-legend" :style="`font-weight:${radarConfig.style.chart.legend.bold ? 'bold' : ''};color:${radarConfig.style.chart.legend.color};font-size:${radarConfig.style.chart.legend.fontSize}px;padding-bottom:12px;font-weight:${radarConfig.style.chart.legend.bold ? 'bold' : ''}`" @click="closeDetails">
                    <div v-for="(legendItem, i) in legend" class="vue-ui-radar-legend-item" @click="segregate(i)" :style="`opacity:${segregated.includes(i) ? 0.5 : 1}`">
                        <span :style="`color:${legendItem.color};font-size:${radarConfig.style.chart.legend.fontSize * 1.6}px`">●</span>
                        <span>{{ legendItem.name }} : </span>
                        <span>{{ (legendItem.totalProportion * 100).toFixed(radarConfig.style.chart.legend.roundingPercentage) }}%</span>
                    </div>
                </div>
            </foreignObject>

        </svg>

        <!-- LEGEND AS DIV -->
        <div v-if="radarConfig.style.chart.legend.show && (!mutableConfig.inside || isPrinting)" class="vue-ui-radar-legend" :style="`font-weight:${radarConfig.style.chart.legend.bold ? 'bold' : ''};background:${radarConfig.style.chart.legend.backgroundColor};color:${radarConfig.style.chart.legend.color};font-size:${radarConfig.style.chart.legend.fontSize}px;padding-bottom:12px;font-weight:${radarConfig.style.chart.legend.bold ? 'bold' : ''}`" @click="closeDetails">
            <div v-for="(legendItem, i) in legend" class="vue-ui-radar-legend-item" @click="segregate(i)" :style="`opacity:${segregated.includes(i) ? 0.5 : 1}`">
                <span :style="`color:${legendItem.color};font-size:${radarConfig.style.chart.legend.fontSize * 1.6}px`">●</span>
                <span>{{ legendItem.name }} : </span>
                <span>{{ (legendItem.totalProportion * 100).toFixed(radarConfig.style.chart.legend.roundingPercentage) }}%</span>
            </div>
        </div>

        <!-- TOOLTIP -->
        <div 
            class="vue-ui-radar-tooltip"
            ref="tooltip"
            v-if="radarConfig.style.chart.tooltip.show && isTooltip"
            :style="`top:${tooltipPosition.top}px;left:${tooltipPosition.left}px;background:${radarConfig.style.chart.tooltip.backgroundColor};color:${radarConfig.style.chart.tooltip.color}`"
            v-html="tooltipContent"
        />

        <!-- DATA TABLE -->
        <div @click="closeDetails" class="vue-ui-radar-table" :style="`width:100%;margin-top:${mutableConfig.inside ? '48px' : ''}`" v-if="mutableConfig.showTable">
            <table>
                <thead>
                    <tr v-if="radarConfig.style.chart.title.text">
                        <th :colspan="(legend.length + 2) + 3" :style="`background:${radarConfig.table.th.backgroundColor};color:${radarConfig.table.th.color};outline:${radarConfig.table.th.outline}`">
                            <span>{{ radarConfig.style.chart.title.text }}</span>
                            <span v-if="radarConfig.style.chart.title.subtitle.text">
                                : {{ radarConfig.style.chart.title.subtitle.text }}
                            </span>
                        </th>
                    </tr>
                    <tr>
                        <th v-for="th in table.head" :colspan="th.color ? 2 : 1" :style="`background:${radarConfig.table.th.backgroundColor};color:${radarConfig.table.th.color};outline:${radarConfig.table.th.outline}`">
                            <div style="width:100%">
                                <span v-if="th.color" :style="`color:${th.color};margin-right:3px`">●</span>
                                <span>{{ th.name }}</span>
                            </div>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="tr in table.body">
                        <td v-for="td in tr" :style="`background:${radarConfig.table.td.backgroundColor};color:${radarConfig.table.td.color};outline:${radarConfig.table.td.outline}`">
                            {{ td }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<style scoped>
.vue-ui-radar *{
    transition: unset;
}
.vue-ui-radar {
    user-select: none;
    position: relative;
    padding-top: 36px;
}
.vue-ui-radar .vue-ui-radar-label {
    align-items: center;
    display: flex;
    flex-direction: column;
    height:100%;
    justify-content: center;
    text-align:center;
    width:100%;
}
.vue-ui-radar-legend {
    height: 100%;
    width:100%;
    display: flex;
    align-items:center;
    flex-wrap: wrap;
    justify-content:center;
    column-gap: 18px;
}
.vue-ui-radar-legend-item {
    display: flex;
    align-items:center;
    justify-content: center;
    gap: 6px;
    cursor: pointer;
    height: 24px;
}
.vue-ui-radar-tooltip {
    border: 1px solid #e1e5e8;
    border-radius: 4px;
    box-shadow: 0 6px 12px -6px rgba(0,0,0,0.2);
    max-width: 300px;
    position: fixed;
    padding:12px;
    z-index:1;
}

/** */
.vue-ui-radar-user-options {
    border-radius: 4px;
    padding: 6px 12px;
    position: absolute;
    right:0;
    top:0px;
    max-width: 300px;
    text-align:left;
}
.vue-ui-radar-user-options[open] {
    border: 1px solid #e1e5e8;
    box-shadow: 0 6px 12px -6px rgba(0,0,0,0.2);
}
.vue-ui-radar summary {
    text-align: right;
    direction: rtl;
}
.vue-ui-radar-user-options-items {
    width: 100%;
    display: flex;
    flex-direction: column;
    margin-top: 6px;
}
.vue-ui-radar-user-options-item {
    width: 100%;
    display: flex;
    flex-direction: row;
    gap: 5px;
    align-items:center;
}

.vue-ui-radar-button {
    margin: 6px 0;
    border-radius: 3px;
    height: 30px;
    border: 1px solid #b9bfc4;
    background: inherit;
    display: flex;
    align-items:center;
    justify-content: center;
}
.vue-ui-radar-button:hover {
    background: rgba(0,0,0,0.05);
}
.vue-ui-radar-print-icon {
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

.vue-ui-radar table {
    width: 100%;
    border-collapse:collapse;
}
.vue-ui-radar table td {
    text-align:right;
    padding-right: 6px;
    font-variant-numeric: tabular-nums;
}
.vue-ui-radar table th {
    position: sticky;
    top:0;
    font-weight: 400;
    user-select: none;
}
</style>