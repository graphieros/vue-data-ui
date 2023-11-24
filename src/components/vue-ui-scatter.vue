<script setup>
import { ref, computed, nextTick, onMounted } from "vue";
import { treeShake, palette, opacity, convertConfigColors, makeXls } from '../lib';
import pdf from "../pdf";
import mainConfig from "../default_configs.json";
import { useMouse } from "../useMouse";
import { calcTooltipPosition } from "../calcTooltipPosition";
import { useNestedProp } from "../useNestedProp";
import Title from "../atoms/Title.vue";

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

const uid = ref(`vue-ui-scatter-${Math.random()}`);

const defaultConfig = ref(mainConfig.vue_ui_scatter);

const isPrinting = ref(false);
const scatterChart = ref(null);
const tooltip = ref(null);
const details = ref(null);
const clientPosition = ref(useMouse());
const isTooltip = ref(false);
const tooltipContent = ref("");

onMounted(() => {
    const xLabel = document.getElementById(`vue-ui-scatter-xAxis-label-${uid.value}`);
        if(xLabel) {
            const bboxY = xLabel.getBBox();
            const xPosition = bboxY.height / 2 + drawingArea.value.left / 5;
            const yPosition =  drawingArea.value.top + (drawingArea.value.height / 2);
            xLabel.setAttributeNS(null, "transform", `rotate(-90, ${xPosition}, ${yPosition})`);
            xLabel.setAttributeNS(null, "x", xPosition);
            xLabel.setAttributeNS(null, "y", yPosition);
        }
});

const tooltipPosition = computed(() => {
    return calcTooltipPosition({
        tooltip: tooltip.value,
        chart: scatterChart.value,
        clientPosition: clientPosition.value
    });
})

const scatterConfig = computed(() => {
    return useNestedProp({
        userConfig: props.config,
        defaultConfig: defaultConfig.value
    });
});

const mutableConfig = ref({
    inside: !scatterConfig.value.style.layout.useDiv,
    showTable: scatterConfig.value.table.show,
});

const svg = computed(() => {
    return {
        height: scatterConfig.value.style.layout.height,
        width: scatterConfig.value.style.layout.width,
    }
});

const drawingArea = computed(() => {
    return {
        top: scatterConfig.value.style.layout.padding.top,
        right: svg.value.width - scatterConfig.value.style.layout.padding.right,
        bottom: svg.value.height - scatterConfig.value.style.layout.padding.bottom,
        left: scatterConfig.value.style.layout.padding.left,
        height: svg.value.height - scatterConfig.value.style.layout.padding.top - scatterConfig.value.style.layout.padding.bottom,
        width: svg.value.width - scatterConfig.value.style.layout.padding.left - scatterConfig.value.style.layout.padding.right
    }
});

const extremes = computed(() => {
    const xMin = Math.min(...datasetWithId.value.filter(el => !segregated.value.includes(el.id)).flatMap(ds => ds.values.map(v => v.x)));
    const xMax = Math.max(...datasetWithId.value.filter(el => !segregated.value.includes(el.id)).flatMap(ds => ds.values.map(v => v.x)));
    const yMin = Math.min(...datasetWithId.value.filter(el => !segregated.value.includes(el.id)).flatMap(ds => ds.values.map(v => v.y)));
    const yMax = Math.max(...datasetWithId.value.filter(el => !segregated.value.includes(el.id)).flatMap(ds => ds.values.map(v => v.y)));
    return { xMin, xMax, yMin, yMax };
});

const zero = computed(() => {
    return {
        x: drawingArea.value.left + (Math.abs(extremes.value.xMin) / (extremes.value.xMax + Math.abs(extremes.value.xMin))) * drawingArea.value.width,
        y: drawingArea.value.bottom - (Math.abs(extremes.value.yMin) / (extremes.value.yMax + Math.abs(extremes.value.yMin))) * drawingArea.value.height
    }
});

const datasetWithId = computed(() => {
    return props.dataset.map((ds, i) => {
        return {
            ...ds,
            id: `cluster_${uid.value}_${i}`,
            color: ds.color ? ds.color : (palette[i] || palette[i % palette.length])
        }
    })
})

const mutableDataset = computed(() => {
    return datasetWithId.value.map((ds, i) => {
        return {
            ...ds,
            plots: ds.values.map(v => {
                return {
                    x: drawingArea.value.left + ((v.x + Math.abs(extremes.value.xMin)) / (extremes.value.xMax + Math.abs(extremes.value.xMin))) * drawingArea.value.width,
                    y: drawingArea.value.bottom - ((v.y + Math.abs(extremes.value.yMin)) / (extremes.value.yMax + Math.abs(extremes.value.yMin))) * drawingArea.value.height,
                    v: {
                        ...v,
                        name: v.name || ""
                    },
                    clusterName: ds.name,
                    color: ds.color ? ds.color : (palette[i] || palette[i % palette.length]),
                    id: `plot_${uid.value}_${Math.random()}`
                }
            }),
        }
    }).filter(ds => !segregated.value.includes(ds.id));
})

const drawableDataset = computed(() => {
    return mutableDataset.value.map(ds => {

        const meanX = ds.plots.reduce((sum, point) => sum + point.x, 0) / ds.plots.length;
        const meanY = ds.plots.reduce((sum, point) => sum + point.y, 0) / ds.plots.length;
        let numerator = 0;
        let denominatorX = 0;
        let denominatorY = 0;

        for (const point of ds.plots) {
            numerator += (point.x - meanX) * (point.y - meanY);
            denominatorX += (point.x - meanX) ** 2;
            denominatorY += (point.y - meanY) ** 2;
        }

        const correlationCoefficient = numerator / Math.sqrt(denominatorX * denominatorY);
        const slope = correlationCoefficient * (Math.sqrt(denominatorY) / Math.sqrt(denominatorX));
        const intercept = meanY - slope * meanX;
        const correlation = {
            x1: drawingArea.value.left,
            x2: drawingArea.value.right,
            y1: slope * drawingArea.value.left + intercept,
            y2: slope * drawingArea.value.right + intercept,
            coefficient: correlationCoefficient
        }

        const m = (correlation.y2 - correlation.y1) / (correlation.x2 - correlation.x1);
        const b = correlation.y1 - m * correlation.x1;

        const labelX = Math.min(svg.value.width - scatterConfig.value.style.layout.padding.right, Math.max(scatterConfig.value.style.layout.padding.left, (drawingArea.value.top - b) / m));

        const label = {
            x: labelX,
            y: m * labelX + b <= scatterConfig.value.style.layout.padding.top ? drawingArea.value.top : m * labelX + b
        }

        return {
            ...ds,
            correlation,
            label,
            plots: ds.plots.map(plot => {
                const x_proj = (plot.x + m * plot.y - m * b) / (1 + Math.pow(m, 2));
                const y_proj = (m * plot.x + Math.pow(m, 2) * plot.y + b) / (1 + Math.pow(m, 2));
                const deviation = Math.sqrt(Math.pow(plot.x - x_proj, 2) + Math.pow(plot.y - y_proj, 2));
                return {
                    ...plot,
                    deviation
                }
            })
        }
    })
});

function getData() {
    return drawableDataset.value;
}

const selectedPlotId = ref(undefined);

function hoverPlot(plot) {
    selectedPlotId.value = plot.id;
    let html = "";

    if (plot.clusterName) {
        html += `<div style="display:flex;gap:3px;align-items:center"><svg viewBox="0 0 12 12" height="${scatterConfig.value.style.tooltip.fontSize}" width="${scatterConfig.value.style.tooltip.fontSize}"><circle cx="6" cy="6" r="6" stroke="none" fill="${plot.color}"/></svg>${plot.clusterName}</div>`
    }

    if (plot.v.name) {
        html += `<div>${plot.v.name}</div>`
    }

    html += `<div style="text-align:left;margin-top:6px;padding-top:6px;border-top:1px solid #e1e5e8">`;
    html += `<div>${scatterConfig.value.style.layout.dataLabels.xAxis.name} : <b>${isNaN(plot.v.x) ? '-' : Number(plot.v.x.toFixed(scatterConfig.value.style.layout.dataLabels.xAxis.roundingValue)).toLocaleString()}</b></div>`;
    html += `<div>${scatterConfig.value.style.layout.dataLabels.yAxis.name} : <b>${isNaN(plot.v.y) ? '-' : Number(plot.v.y.toFixed(scatterConfig.value.style.layout.dataLabels.yAxis.roundingValue)).toLocaleString()}</b></div>`;
    html += `${scatterConfig.value.style.layout.plots.deviation.translation} : <b>${Number(plot.deviation.toFixed(scatterConfig.value.style.layout.plots.deviation.roundingValue)).toLocaleString()}</b>`
    html += `</div>`;

    tooltipContent.value = `<div>${html}</div>`
    isTooltip.value = true;
}

function clearHover() {
    isTooltip.value = false;
    selectedPlotId.value = undefined
}

const segregated = ref([]);

function segregate(id) {
    if (segregated.value.includes(id)) {
        segregated.value = segregated.value.filter(el => el !== id);
    } else {
        if (segregated.value.length < props.dataset.length - 1) {
            segregated.value.push(id)
        }
    }
}

function generatePdf(){
    isPrinting.value = true;
    nextTick(() => {
        pdf({
            domElement: document.getElementById(`vue-ui-scatter_${uid.value}`),
            fileName: scatterConfig.value.style.title.text || 'vue-ui-scatter'
        }).finally(() => {
            isPrinting.value = false;
        });
    })
}

function generateXls() {
    nextTick(() => {
        const labels = ["", scatterConfig.value.table.translations.correlationCoefficient, scatterConfig.value.table.translations.nbrPlots, `${scatterConfig.value.style.layout.dataLabels.xAxis.name} ${scatterConfig.value.table.translations.average}`, `${scatterConfig.value.style.layout.dataLabels.yAxis.name} ${scatterConfig.value.table.translations.average}`];

        const values = drawableDataset.value.map(ds => {
            return [
                ds.name,
                ds.correlation.coefficient,
                ds.plots.length,
                ds.plots.map(plot => plot.v.x).reduce((a, b) => a + b, 0) / ds.plots.length,
                ds.plots.map(plot => plot.v.y).reduce((a, b) => a + b, 0) / ds.plots.length
            ]
        });

        const tableXls = [[scatterConfig.value.style.title.text],[scatterConfig.value.style.title.subtitle.text],[[""],[""],[""]]].concat([labels]).concat(values)

        makeXls(tableXls, scatterConfig.value.style.title.text || "vue-ui-heatmap");
    });
}


function closeDetails(){
    if(details.value) {
        details.value.removeAttribute("open")
    }
}

defineExpose({
    getData,
    generatePdf,
    generateXls
});

</script>

<template>
    <div :class="`vue-ui-scatter ${scatterConfig.useCssAnimation ? '' : 'vue-ui-dna'}`" ref="scatterChart" :id="`vue-ui-scatter_${uid}`" :style="`font-family:${scatterConfig.style.fontFamily};width:100%; text-align:center;${scatterConfig.userOptions.show ? 'padding-top:36px' : ''}`">
        
        <div v-if="(!mutableConfig.inside || isPrinting) && scatterConfig.style.title.text" :style="`width:100%;background:${scatterConfig.style.backgroundColor}`">
            <!-- TITLE AS DIV -->
            <Title
                :config="{
                    title: {
                        cy: 'scatter-div-title',
                        text: scatterConfig.style.title.text,
                        color: scatterConfig.style.title.color,
                        fontSize: scatterConfig.style.title.fontSize,
                        bold: scatterConfig.style.title.bold
                    },
                    subtitle: {
                        cy: 'scatter-div-subtitle',
                        text: scatterConfig.style.title.subtitle.text,
                        color: scatterConfig.style.title.subtitle.color,
                        fontSize: scatterConfig.style.title.subtitle.fontSize,
                        bold: scatterConfig.style.title.subtitle.bold
                    },
                }"
            />
        </div>

        <!-- OPTIONS -->
        <details class="vue-ui-scatter-user-options" :style="`background:${scatterConfig.style.backgroundColor};color:${scatterConfig.style.color}`" data-html2canvas-ignore v-if="scatterConfig.userOptions.show" ref="details">
            <summary :style="`background:${scatterConfig.style.backgroundColor};color:${scatterConfig.style.color}`">{{ scatterConfig.userOptions.title }}</summary>

            <div class="vue-ui-scatter-user-options-items" :style="`background:${scatterConfig.style.backgroundColor};color:${scatterConfig.style.color}`">
                <div class="vue-ui-scatter-user-option-item">
                    <input type="checkbox" :id="`vue-ui-scatter-option-title_${uid}`" :name="`vue-ui-scatter-option-title_${uid}`"
                    v-model="mutableConfig.inside">
                    <label :for="`vue-ui-scatter-option-title_${uid}`">{{ scatterConfig.userOptions.labels.useDiv }}</label>
                </div>
                <div class="vue-ui-scatter-user-option-item">
                    <input type="checkbox" :id="`vue-ui-scatter-option-table_${uid}`" :name="`vue-ui-scatter-option-table_${uid}`"
                    v-model="mutableConfig.showTable">
                    <label :for="`vue-ui-scatter-option-table_${uid}`">{{ scatterConfig.userOptions.labels.showTable }}</label>
                </div>
                <button class="vue-ui-scatter-button" @click="generatePdf" :disabled="isPrinting" style="margin-top:12px" :style="`background:${scatterConfig.style.backgroundColor};color:${scatterConfig.style.color}`">
                    <svg class="vue-ui-scatter-print-icon" xmlns="http://www.w3.org/2000/svg" v-if="isPrinting" width="20" height="20" viewBox="0 0 24 24" stroke-width="1.5" :stroke="scatterConfig.style.color" fill="none" stroke-linecap="round" stroke-linejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                        <path d="M18 16v.01" />
                        <path d="M6 16v.01" />
                        <path d="M12 5v.01" />
                        <path d="M12 12v.01" />
                        <path d="M12 1a4 4 0 0 1 2.001 7.464l.001 .072a3.998 3.998 0 0 1 1.987 3.758l.22 .128a3.978 3.978 0 0 1 1.591 -.417l.2 -.005a4 4 0 1 1 -3.994 3.77l-.28 -.16c-.522 .25 -1.108 .39 -1.726 .39c-.619 0 -1.205 -.14 -1.728 -.391l-.279 .16l.007 .231a4 4 0 1 1 -2.212 -3.579l.222 -.129a3.998 3.998 0 0 1 1.988 -3.756l.002 -.071a4 4 0 0 1 -1.995 -3.265l-.005 -.2a4 4 0 0 1 4 -4z" />
                    </svg>
                    <span v-else>PDF</span>
                </button>
                <button class="vue-ui-scatter-button" @click="generateXls" :style="`background:${scatterConfig.style.backgroundColor};color:${scatterConfig.style.color}`">
                    XLSX
                </button>
            </div>
        </details>

        <!-- CHART -->
        <svg :viewBox="`0 0 ${svg.width} ${svg.height}`" :style="`max-width:100%;overflow:visible;background:${scatterConfig.style.backgroundColor};color:${scatterConfig.style.color}`" @click="closeDetails">

            <!-- TITLE AS G -->
            <g v-if="scatterConfig.style.title.text && mutableConfig.inside && !isPrinting">
                <text
                    :font-size="scatterConfig.style.title.fontSize"
                    :fill="scatterConfig.style.title.color"
                    :x="svg.width / 2"
                    :y="0"
                    text-anchor="middle"
                    :style="`font-weight:${scatterConfig.style.title.bold ? 'bold' : ''}`"
                >
                    {{ scatterConfig.style.title.text }}
                </text>
                <text
                    v-if="scatterConfig.style.title.subtitle.text"
                    :font-size="scatterConfig.style.title.subtitle.fontSize"
                    :fill="scatterConfig.style.title.subtitle.color"
                    :x="svg.width / 2"
                    :y="scatterConfig.style.title.fontSize"
                    text-anchor="middle"
                    :style="`font-weight:${scatterConfig.style.title.subtitle.bold ? 'bold' : ''}`"
                >
                    {{ scatterConfig.style.title.subtitle.text }}
                </text>
            </g>

            <!-- AXIS -->
            <g v-if="scatterConfig.style.layout.axis.show">
                <line
                    :x1="zero.x"
                    :x2="zero.x"
                    :y1="drawingArea.top"
                    :y2="drawingArea.bottom"
                    :stroke="scatterConfig.style.layout.axis.stroke"
                    :stroke-width="scatterConfig.style.layout.axis.strokeWidth"
                    stroke-linecap="round"
                />
                <line
                    :x1="drawingArea.left"
                    :x2="drawingArea.right"
                    :y1="zero.y"
                    :y2="zero.y"
                    :stroke="scatterConfig.style.layout.axis.stroke"
                    :stroke-width="scatterConfig.style.layout.axis.strokeWidth"
                    stroke-linecap="round"
                />
            </g>

            <!-- PLOTS -->
            <g v-for="(ds, i) in drawableDataset">
                <circle 
                    v-for="plot in ds.plots"
                    :cx="plot.x"
                    :cy="plot.y"
                    :r="selectedPlotId && selectedPlotId === plot.id ? scatterConfig.style.layout.plots.radius * 2 : scatterConfig.style.layout.plots.radius"
                    :fill="`${ds.color}${opacity[scatterConfig.style.layout.plots.opacity * 100]}`"
                    :stroke="scatterConfig.style.layout.plots.stroke"
                    :stroke-width="scatterConfig.style.layout.plots.strokeWidth"
                    @mouseover="hoverPlot(plot)"
                    @mouseleave="clearHover"
                    :style="`opacity:${scatterConfig.style.layout.plots.significance.show && Math.abs(plot.deviation) > scatterConfig.style.layout.plots.significance.deviationThreshold ? scatterConfig.style.layout.plots.significance.opacity : 1}`"
                />
            </g>

            <!-- AXIS LABELS -->
            <g v-if="scatterConfig.style.layout.dataLabels.xAxis.show">
                <text
                    :x="drawingArea.left - 5"
                    :y="zero.y + scatterConfig.style.layout.dataLabels.xAxis.fontSize / 3"
                    text-anchor="end"
                    :font-size="scatterConfig.style.layout.dataLabels.xAxis.fontSize"
                    :fill="scatterConfig.style.layout.dataLabels.xAxis.color"
                >
                    {{ Number(extremes.xMin.toFixed(scatterConfig.style.layout.dataLabels.xAxis.rounding)).toLocaleString() }}
                </text>
                <text
                    :x="drawingArea.right + 3"
                    :y="zero.y + scatterConfig.style.layout.dataLabels.xAxis.fontSize / 3"
                    text-anchor="start"
                    :font-size="scatterConfig.style.layout.dataLabels.xAxis.fontSize"
                    :fill="scatterConfig.style.layout.dataLabels.xAxis.color"
                >
                    {{ Number(extremes.xMax.toFixed(scatterConfig.style.layout.dataLabels.xAxis.rounding)).toLocaleString() }}
                </text>
                <text 
                    :id="`vue-ui-scatter-xAxis-label-${uid}`" 
                    text-anchor="middle"
                    :font-size="scatterConfig.style.layout.dataLabels.xAxis.fontSize"
                    :font-weight="scatterConfig.style.layout.dataLabels.xAxis.bold ? 'bold' : 'normal'"
                    :fill="scatterConfig.style.layout.dataLabels.xAxis.color"
                >
                    {{ scatterConfig.style.layout.dataLabels.xAxis.name }}
                </text>

            </g>
            <g v-if="scatterConfig.style.layout.dataLabels.yAxis.show">
                <text
                    :x="zero.x"
                    :y="drawingArea.bottom + scatterConfig.style.layout.dataLabels.yAxis.fontSize + 3"
                    text-anchor="middle"
                    :font-size="scatterConfig.style.layout.dataLabels.yAxis.fontSize"
                    :fill="scatterConfig.style.layout.dataLabels.yAxis.color"
                >
                    {{ Number(extremes.yMin.toFixed(scatterConfig.style.layout.dataLabels.yAxis.rounding)).toLocaleString() }}
                </text>
                <text
                    :x="zero.x"
                    :y="drawingArea.top - scatterConfig.style.layout.dataLabels.yAxis.fontSize / 2"
                    text-anchor="middle"
                    :font-size="scatterConfig.style.layout.dataLabels.yAxis.fontSize"
                    :fill="scatterConfig.style.layout.dataLabels.yAxis.color"
                >
                    {{ Number(extremes.yMax.toFixed(scatterConfig.style.layout.dataLabels.yAxis.rounding)).toLocaleString() }}
                </text>
                <text 
                    text-anchor="middle"
                    :font-size="scatterConfig.style.layout.dataLabels.yAxis.fontSize"
                    :font-weight="scatterConfig.style.layout.dataLabels.yAxis.bold ? 'bold' : 'normal'"
                    :fill="scatterConfig.style.layout.dataLabels.yAxis.color"
                    :x="drawingArea.left + drawingArea.width / 2"
                    :y="drawingArea.top - 8 - scatterConfig.style.layout.dataLabels.yAxis.fontSize"
                >
                    {{ scatterConfig.style.layout.dataLabels.yAxis.name }}
                </text>
            </g>

            <clipPath :id="`clip_path_${uid}`">
                <rect
                    :x="scatterConfig.style.layout.padding.left"
                    :y="scatterConfig.style.layout.padding.top"
                    :width="drawingArea.width"
                    :height="drawingArea.height"
                />
            </clipPath>

            <!-- CORRELATION -->
            <g v-if="scatterConfig.style.layout.correlation.show">
                <line 
                    v-for="ds in drawableDataset"
                    :x1="ds.correlation.x1"
                    :x2="ds.correlation.x2"
                    :y1="ds.correlation.y1"
                    :y2="ds.correlation.y2"
                    :stroke-dasharray="scatterConfig.style.layout.correlation.strokeDasharray"
                    :stroke="ds.color"
                    :stroke-width="scatterConfig.style.layout.correlation.strokeWidth"
                    :clip-path="`url(#clip_path_${uid})`"
                />
                <g v-for="ds in drawableDataset">
                    <text 
                        v-if="scatterConfig.style.layout.correlation.label.show"
                        :x="ds.label.x"
                        :y="ds.label.y"
                        :fill="scatterConfig.style.layout.correlation.label.useSerieColor ? ds.color : scatterConfig.style.layout.correlation.label.color"
                        :font-size="scatterConfig.style.layout.correlation.label.fontSize"
                        :font-weight="scatterConfig.style.layout.correlation.label.bold ? 'bold' : 'normal'"
                    >
                        {{ Number(ds.correlation.coefficient.toFixed(scatterConfig.style.layout.correlation.label.roundingValue)).toLocaleString() }}
                    </text>
                </g>
            </g>

            <!-- LEGEND AS G -->
            <foreignObject 
                v-if="scatterConfig.style.legend.show && mutableConfig.inside && !isPrinting"
                :x="0"
                :y="drawingArea.bottom"
                width="100%"
                :height="svg.height - drawingArea.bottom"
                style="overflow:visible"
            >
                <div class="vue-ui-scatter-legend" :style="`color:${scatterConfig.style.legend.color};font-size:${scatterConfig.style.legend.fontSize}px;padding-bottom:12px;font-weight:${scatterConfig.style.legend.bold ? 'bold' : ''}`" @click="closeDetails">
                    <div v-for="(legendItem, i) in datasetWithId" class="vue-ui-scatter-legend-item" @click="segregate(legendItem.id)" :style="`opacity:${segregated.includes(legendItem.id) ? 0.5 : 1}`">
                        <svg viewBox="0 0 12 12" :height="scatterConfig.style.legend.fontSize" :width="scatterConfig.style.legend.fontSize">
                            <circle cx="6" cy="6" r="6" :fill="legendItem.color"/>
                        </svg>
                        <span>{{ legendItem.name }} </span>
                    </div>
                </div>
            </foreignObject>
        </svg>

        <!-- LEGEND AS DIV -->
        <div v-if="scatterConfig.style.legend.show && (!mutableConfig.inside || isPrinting)" class="vue-ui-scatter-legend" :style="`background:${scatterConfig.style.legend.backgroundColor};color:${scatterConfig.style.legend.color};font-size:${scatterConfig.style.legend.fontSize}px;padding-bottom:12px;font-weight:${scatterConfig.style.legend.bold ? 'bold' : ''}`" @click="closeDetails">
            <div v-for="(legendItem, i) in datasetWithId" class="vue-ui-scatter-legend-item" @click="segregate(legendItem.id)" :style="`opacity:${segregated.includes(legendItem.id) ? 0.5 : 1}`">
                <svg viewBox="0 0 12 12" :height="scatterConfig.style.legend.fontSize" :width="scatterConfig.style.legend.fontSize">
                    <circle cx="6" cy="6" r="6" :fill="legendItem.color"/>
                </svg>
                <span>{{ legendItem.name }} </span>
            </div>
        </div>

        <!-- TOOLTIP -->
        <div 
            class="vue-ui-scatter-tooltip"
            ref="tooltip"
            v-if="scatterConfig.style.tooltip.show && isTooltip"
            :style="`top:${tooltipPosition.top}px;left:${tooltipPosition.left}px;background:${scatterConfig.style.tooltip.backgroundColor};color:${scatterConfig.style.tooltip.color}`"
            v-html="tooltipContent"
        />

        <!-- DATA TABLE -->
        <div @click="closeDetails" :style="`${isPrinting ? '' : 'max-height:400px'};overflow:auto;width:100%;margin-top:${mutableConfig.inside ? '48px' : ''}`" v-if="mutableConfig.showTable">
            <table>
                <thead>
                    <tr v-if="scatterConfig.style.title.text">
                        <th :colspan="5" :style="`background:${scatterConfig.table.th.backgroundColor};color:${scatterConfig.table.th.color};outline:${scatterConfig.table.th.outline}`">
                            <span>{{ scatterConfig.style.title.text }}</span>
                            <span v-if="scatterConfig.style.title.subtitle.text">
                                : {{ scatterConfig.style.title.subtitle.text }}
                            </span>
                        </th>
                    </tr>
                    <tr>
                        <th :style="`background:${scatterConfig.table.th.backgroundColor};color:${scatterConfig.table.th.color};outline:${scatterConfig.table.th.outline};padding-right:6px`"></th>
                        <th :style="`background:${scatterConfig.table.th.backgroundColor};color:${scatterConfig.table.th.color};outline:${scatterConfig.table.th.outline};padding-right:6px`">{{ scatterConfig.table.translations.correlationCoefficient }}</th>
                        <th :style="`background:${scatterConfig.table.th.backgroundColor};color:${scatterConfig.table.th.color};outline:${scatterConfig.table.th.outline};padding-right:6px`">{{ scatterConfig.table.translations.nbrPlots }}</th>
                        <th :style="`background:${scatterConfig.table.th.backgroundColor};color:${scatterConfig.table.th.color};outline:${scatterConfig.table.th.outline};padding-right:6px`">{{ scatterConfig.style.layout.dataLabels.xAxis.name }} {{ scatterConfig.table.translations.average }} </th>
                        <th :style="`background:${scatterConfig.table.th.backgroundColor};color:${scatterConfig.table.th.color};outline:${scatterConfig.table.th.outline};padding-right:6px`">{{ scatterConfig.style.layout.dataLabels.yAxis.name }} {{ scatterConfig.table.translations.average }} </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(tr, i) in drawableDataset">
                        <td :style="`background:${scatterConfig.table.td.backgroundColor};color:${scatterConfig.table.td.color};outline:${scatterConfig.table.td.outline}`">
                            <div style="display:flex;flex-direction:row;gap:3px;align-items:center">
                                <svg viewBox="0 0 12 12" :height="scatterConfig.style.legend.fontSize" :width="scatterConfig.style.legend.fontSize">
                                    <circle cx="6" cy="6" r="6" :fill="tr.color"/>
                                </svg>
                                <span>{{ tr.name }}</span>
                            </div>
                        </td>
                        <td :style="`background:${scatterConfig.table.td.backgroundColor};color:${scatterConfig.table.td.color};outline:${scatterConfig.table.td.outline}`">
                            {{ Number(tr.correlation.coefficient.toFixed(scatterConfig.table.td.roundingValue)).toLocaleString() }}
                        </td>
                        <td :style="`background:${scatterConfig.table.td.backgroundColor};color:${scatterConfig.table.td.color};outline:${scatterConfig.table.td.outline}`">
                            {{ tr.plots.length.toLocaleString() }}
                        </td>
                        <td :style="`background:${scatterConfig.table.td.backgroundColor};color:${scatterConfig.table.td.color};outline:${scatterConfig.table.td.outline}`">
                            {{ isNaN(tr.plots.map(plot => plot.v.x).reduce((a,b) => a + b, 0) / tr.plots.length) ? "-" : Number((tr.plots.map(plot => plot.v.x).reduce((a,b) => a + b, 0) / tr.plots.length).toFixed(scatterConfig.table.td.roundingAverage)).toLocaleString() }}
                        </td>
                        <td :style="`background:${scatterConfig.table.td.backgroundColor};color:${scatterConfig.table.td.color};outline:${scatterConfig.table.td.outline}`">
                            {{ isNaN(tr.plots.map(plot => plot.v.y).reduce((a,b) => a + b, 0) / tr.plots.length) ? "-" : Number((tr.plots.map(plot => plot.v.y).reduce((a,b) => a + b, 0) / tr.plots.length).toFixed(scatterConfig.table.td.roundingAverage)).toLocaleString() }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<style scoped>
.vue-ui-scatter *{
    transition: unset;
}
.vue-ui-scatter {
    user-select: none;
    position: relative;
}

path, line, circle {
    animation: verticalBarAnimation 0.5s ease-in-out !important;
    transform-origin: center !important;
}
@keyframes verticalBarAnimation {
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
.vue-ui-scatter .vue-ui-scatter-label {
    align-items: center;
    display: flex;
    flex-direction: column;
    height:100%;
    justify-content: center;
    text-align:center;
    width:100%;
}
.vue-ui-scatter-legend {
    height: 100%;
    width:100%;
    display: flex;
    align-items:center;
    flex-wrap: wrap;
    justify-content:center;
    column-gap: 18px;
}
.vue-ui-scatter-legend-item {
    display: flex;
    align-items:center;
    gap: 6px;
    cursor: pointer;
    height: 24px;
}

/** */
.vue-ui-scatter-tooltip {
    border: 1px solid #e1e5e8;
    border-radius: 4px;
    box-shadow: 0 6px 12px -6px rgba(0,0,0,0.2);
    max-width: 300px;
    position: fixed;
    padding:12px;
    z-index:1;
}
.vue-ui-scatter-user-options {
    border-radius: 4px;
    padding: 6px 12px;
    position: absolute;
    right:0;
    top:0px;
    max-width: 300px;
    text-align:left;
}
.vue-ui-scatter-user-options[open] {
    border: 1px solid #e1e5e8;
    box-shadow: 0 6px 12px -6px rgba(0,0,0,0.2);
}
.vue-ui-scatter summary {
    text-align: right;
    direction: rtl;
}
.vue-ui-scatter-user-options-items {
    width: 100%;
    display: flex;
    flex-direction: column;
    margin-top: 6px;
}
.vue-ui-scatter-user-options-item {
    width: 100%;
    display: flex;
    flex-direction: row;
    gap: 5px;
    align-items:center;
}

.vue-ui-scatter-button {
    margin: 6px 0;
    border-radius: 3px;
    height: 30px;
    border: 1px solid #b9bfc4;
    background: inherit;
    display: flex;
    align-items:center;
    justify-content: center;
}
.vue-ui-scatter-button:hover {
    background: rgba(0,0,0,0.05);
}
.vue-ui-scatter-print-icon {
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

.vue-ui-scatter table {
    width: 100%;
    border-collapse:collapse;
}
.vue-ui-scatter table td {
    text-align:right;
    padding-right: 6px;
    font-variant-numeric: tabular-nums;
}
.vue-ui-scatter table th {
    position: sticky;
    top:0;
    font-weight: 400;
    user-select: none;
}

.vue-ui-dna * {
    animation: none !important;
}
</style>