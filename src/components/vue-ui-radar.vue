<script setup>
import { ref, computed, nextTick } from "vue";
import { palette, createPolygonPath, shiftHue, opacity, convertColorToHex, makeXls } from "../lib";
import pdf from "../pdf";
import img from "../img";
import mainConfig from "../default_configs.json";
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
        type: Object,
        default() {
            return {}
        }
    }
});

const uid = ref(`vue-ui-radar-${Math.random()}`);

const defaultConfig = ref(mainConfig.vue_ui_radar);

const isImaging = ref(false);
const isPrinting = ref(false);
const radarChart = ref(null);
const details = ref(null);
const isTooltip = ref(false);
const tooltipContent = ref("");

const radarConfig = computed(() => {
    return useNestedProp({
        userConfig: props.config,
        defaultConfig: defaultConfig.value
    });
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
            html += `<div style="display:flex;flex-wrap:wrap;align-items:center;gap:6px"><svg viewBox="0 0 12 12" height="14" width="14"><circle cx="6" cy="6" r="6" stroke="none" fill="${datasetCopy.value[k].color}" /></svg><span>${datasetCopy.value[k].name}</span> : ${radarConfig.value.style.chart.tooltip.showValue ? `<span>${apex.values[k].toFixed(radarConfig.value.style.chart.tooltip.roundingValue)}</span>` : ''} ${!radarConfig.value.style.chart.tooltip.showValue && radarConfig.value.style.chart.tooltip.showPercentage ? `<span>${(apex.values[k] / apex.target * 100).toFixed(radarConfig.value.style.chart.tooltip.roundingPercentage)}%</span>` : radarConfig.value.style.chart.tooltip.showPercentage ? `<span>(${(apex.values[k] / apex.target * 100).toFixed(radarConfig.value.style.chart.tooltip.roundingPercentage)}%)</span>` : ''}</div>`
        }
    }
    tooltipContent.value = html;
}

const __to__ = ref(null);

function showSpinnerPdf() {
    isPrinting.value = true;
}

function generatePdf(){
    showSpinnerPdf();
    clearTimeout(__to__.value);
    __to__.value = setTimeout(() => {
        pdf({
            domElement: document.getElementById(`vue-ui-radar_${uid.value}`),
            fileName: radarConfig.value.style.chart.title.text || 'vue-ui-radar'
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
            domElement: document.getElementById(`vue-ui-radar_${uid.value}`),
            fileName: radarConfig.value.style.chart.title.text || 'vue-ui-radar',
            format: 'png'
        }).finally(() => {
            isImaging.value = false;
        })
    }, 100)
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

        makeXls(tableXls, radarConfig.value.style.chart.title.text || "vue-ui-radar");
    });
}

defineExpose({
    getData,
    generatePdf,
    generateXls,
    generateImage
});

</script>

<template>
    <div 
        :class="`vue-ui-radar ${radarConfig.useCssAnimation ? '' : 'vue-ui-dna'}`"
        ref="radarChart"
        :id="`vue-ui-radar_${uid}`"
        :style="`font-family:${radarConfig.style.fontFamily};width:100%; text-align:center;${radarConfig.userOptions.show ? 'padding-top:36px' : ''}`"
    >
        <!-- TITLE AS DIV -->
        <div v-if="(!mutableConfig.inside || isPrinting) && radarConfig.style.chart.title.text" :style="`width:100%;background:${radarConfig.style.chart.backgroundColor};padding-bottom:12px`">
            <Title
                :config="{
                    title: {
                        cy: 'radar-div-title',
                        text: radarConfig.style.chart.title.text,
                        color: radarConfig.style.chart.title.color,
                        fontSize: radarConfig.style.chart.title.fontSize,
                        bold: radarConfig.style.chart.title.bold
                    },
                    subtitle: {
                        cy: 'radar-div-subtitle',
                        text: radarConfig.style.chart.title.subtitle.text,
                        color: radarConfig.style.chart.title.subtitle.color,
                        fontSize: radarConfig.style.chart.title.subtitle.fontSize,
                        bold: radarConfig.style.chart.title.subtitle.bold
                    },
                }"
            />
        </div>

        <!-- OPTIONS -->
        <UserOptions
            ref="details"
            v-if="radarConfig.userOptions.show"
            :backgroundColor="radarConfig.style.chart.backgroundColor"
            :color="radarConfig.style.chart.color"
            :isImaging="isImaging"
            :isPrinting="isPrinting"
            :title="radarConfig.userOptions.title"
            :uid="uid"
            :hasImg="true"
            @generatePdf="generatePdf"
            @generateXls="generateXls"
            @generateImage="generateImage"
        >
            <template #checkboxes>
                <div class="vue-ui-options-item">
                    <input data-cy="radar-checkbox-title" type="checkbox" :id="`vue-ui-radar-option-title_${uid}`" :name="`vue-ui-radar-option-title_${uid}`"
                    v-model="mutableConfig.inside">
                    <label :for="`vue-ui-radar-option-title_${uid}`">{{ radarConfig.userOptions.labels.useDiv }}</label>
                </div>
                <div class="vue-ui-options-item">
                    <input data-cy="radar-checkbox-table" type="checkbox" :id="`vue-ui-radar-option-table_${uid}`" :name="`vue-ui-radar-option-table_${uid}`"
                    v-model="mutableConfig.showTable">
                    <label :for="`vue-ui-radar-option-table_${uid}`">{{ radarConfig.userOptions.labels.showTable }}</label>
                </div>
            </template>
        </UserOptions>

        <!-- CHART -->
        <svg :viewBox="`0 0 ${svg.width} ${svg.height}`" :style="`max-width:100%;overflow:visible;background:${radarConfig.style.chart.backgroundColor};color:${radarConfig.style.chart.color}`" >

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
                    data-cy="radar-text-title"
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
                    data-cy="radar-text-subtitle"
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
                :data-cy="`radar-apex-label-${i}`"
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
                <div class="vue-ui-radar-legend" :style="`font-weight:${radarConfig.style.chart.legend.bold ? 'bold' : ''};color:${radarConfig.style.chart.legend.color};font-size:${radarConfig.style.chart.legend.fontSize}px;padding-bottom:12px;font-weight:${radarConfig.style.chart.legend.bold ? 'bold' : ''}`" >
                    <div v-for="(legendItem, i) in legend" :data-cy="`radar-foreignObject-legend-item-${i}`" class="vue-ui-radar-legend-item" @click="segregate(i)" :style="`opacity:${segregated.includes(i) ? 0.5 : 1}`">
                        <svg viewBox="0 0 12 12" height="14" width="14"><circle cx="6" cy="6" r="6" stroke="none" :fill="legendItem.color" /></svg>
                        <span>{{ legendItem.name }} : </span>
                        <span>{{ (legendItem.totalProportion * 100).toFixed(radarConfig.style.chart.legend.roundingPercentage) }}%</span>
                    </div>
                </div>
            </foreignObject>

        </svg>

        <!-- LEGEND AS DIV -->
        <div v-if="radarConfig.style.chart.legend.show && (!mutableConfig.inside || isPrinting)" class="vue-ui-radar-legend" :style="`font-weight:${radarConfig.style.chart.legend.bold ? 'bold' : ''};background:${radarConfig.style.chart.legend.backgroundColor};color:${radarConfig.style.chart.legend.color};font-size:${radarConfig.style.chart.legend.fontSize}px;padding-bottom:12px;font-weight:${radarConfig.style.chart.legend.bold ? 'bold' : ''}`" >
            <div v-for="(legendItem, i) in legend" :data-cy="`radar-div-legend-item-${i}`" class="vue-ui-radar-legend-item" @click="segregate(i)" :style="`opacity:${segregated.includes(i) ? 0.5 : 1}`">
                <svg viewBox="0 0 12 12" height="14" width="14"><circle cx="6" cy="6" r="6" stroke="none" :fill="legendItem.color" /></svg>
                <span>{{ legendItem.name }} : </span>
                <span>{{ (legendItem.totalProportion * 100).toFixed(radarConfig.style.chart.legend.roundingPercentage) }}%</span>
            </div>
        </div>

        <!-- TOOLTIP -->
        <Tooltip
            :show="radarConfig.style.chart.tooltip.show && isTooltip"
            :backgroundColor="radarConfig.style.chart.tooltip.backgroundColor"
            :color="radarConfig.style.chart.tooltip.color"
            :parent="radarChart"
            :content="tooltipContent"
        />

        <!-- DATA TABLE -->
        <div  class="vue-ui-radar-table" :style="`width:100%;margin-top:${mutableConfig.inside ? '48px' : ''}`" v-if="mutableConfig.showTable">
            <table>
                <thead data-cy="radar-thead">
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

path, line, rect, circle {
    animation: xyAnimation 0.5s ease-in-out;
    transform-origin: center;
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
.vue-ui-radar {
    user-select: none;
    position: relative;
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

.vue-ui-dna * {
    animation: none !important;
}
</style>