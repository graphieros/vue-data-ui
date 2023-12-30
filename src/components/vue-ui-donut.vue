<script setup>
import { ref, computed, nextTick } from "vue";
import { calcMarkerOffsetX, calcMarkerOffsetY, calcNutArrowPath, makeDonut, palette, convertColorToHex, opacity, makeXls, createUid } from '../lib';
import pdf from "../pdf";
import img from "../img";
import mainConfig from "../default_configs.json";
import Title from "../atoms/Title.vue";
import { useNestedProp } from "../useNestedProp";
import UserOptions from "../atoms/UserOptions.vue";
import DataTable from "../atoms/DataTable.vue";
import Tooltip from "../atoms/Tooltip.vue";
import Legend from "../atoms/Legend.vue";

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

const uid = ref(createUid());

const defaultConfig = ref(mainConfig.vue_ui_donut);

const isPrinting = ref(false);
const isImaging = ref(false);
const donutChart = ref(null);
const details = ref(null);
const isTooltip = ref(false);
const tooltipContent = ref("");
const selectedSerie = ref(null);

const donutConfig = computed(() => {
    return useNestedProp({
        userConfig: props.config,
        defaultConfig: defaultConfig.value
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

const emit = defineEmits(['selectLegend'])

const segregated = ref([]);

function segregate(index) {
    if(segregated.value.includes(index)) {
        segregated.value = segregated.value.filter(s => s !== index);
    }else {
        segregated.value.push(index);
    }
    emit('selectLegend', donutSet.value.map(ds => {
        return {
            name: ds.name,
            color: ds.color,
            value: ds.value
        }
    }));
}

const immutableSet = computed(() => {
    return props.dataset
        .map((serie, i) => {
            return {
                name: serie.name,
                color: convertColorToHex(serie.color) || palette[i] || palette[i % palette.length],
                value: serie.values.reduce((a,b) => a + b, 0),
                absoluteValues: serie.values
            }
        })
        .sort((a,b) => b.value - a.value)
});

function getData() {
    return immutableSet.value.map(ds => {
        return {
            name: ds.name,
            color: ds.color,
            value: ds.value
        }
    });
}

const donutSet = computed(() => {
    return props.dataset
        .map((serie, i) => {
            return {
                name: serie.name,
                color: convertColorToHex(serie.color) || palette[i] || palette[i % palette.length],
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
                color: convertColorToHex(serie.color) || palette[i] || palette[i % palette.length],
                value: serie.values.reduce((a,b) => a + b, 0),
                shape: 'circle',
            }
        })
        .sort((a,b) => b.value - a.value)
        .map((el, i) => {
            return {
                ...el,
                opacity: segregated.value.includes(i) ? 0.5 : 1
            }
        })
});

const legendConfig = computed(() => {
    return {
        cy: 'donut-div-legend',
        backgroundColor: donutConfig.value.style.chart.legend.backgroundColor,
        color: donutConfig.value.style.chart.legend.color,
        fontSize: donutConfig.value.style.chart.legend.fontSize,
        paddingBottom: 12,
        fontWeight: donutConfig.value.style.chart.legend.bold ? 'bold' : ''
    }
})

const currentDonut = computed(() => {
    return makeDonut({ series: donutSet.value }, svg.value.width / 2, svg.value.height / 2, 100, 100)
});

function isArcBigEnough(arc) {
    return arc.proportion * 100 > donutConfig.value.style.chart.layout.labels.dataLabels.hideUnderValue;
}

function displayArcPercentage(arc, stepBreakdown) {
    return isNaN(arc.value / sumValues(stepBreakdown)) ? 0 : ((arc.value / sumValues(stepBreakdown)) * 100).toFixed(0) + "%";
}

function sumValues(source) {
    return [...source].map(s => s.value).reduce((a, b) => a + b, 0);
}

const total = computed(() => {
    return donutSet.value.map(s => s.value).reduce((a,b) => a + b, 0);
});

const average = computed(() => {
    return total.value / donutSet.value.length;
});

function useTooltip(arc, i, showTooltip = true) {
    isTooltip.value = showTooltip;
    selectedSerie.value = i;
    let html = "";

    html += `<div data-cy="donut-tooltip-name" style="width:100%;text-align:center;border-bottom:1px solid #ccc;padding-bottom:6px;margin-bottom:3px;">${arc.name}</div>`;
    html += `<div style="display:flex;flex-direction:row;gap:6px;align-items:center;"><svg viewBox="0 0 12 12" height="14" width="14"><circle data-cy="donut-tooltip-marker" cx="6" cy="6" r="6" stroke="none" fill="${arc.color}"/></svg>`;
    if(donutConfig.value.style.chart.tooltip.showValue) {
        html += `<b data-cy="donut-tooltip-value">${arc.value.toFixed(donutConfig.value.style.chart.tooltip.roundingValue)}</b>`;
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

const __to__ = ref(null);

function showSpinnerPdf() {
    isPrinting.value = true;
}

function generatePdf(){
    showSpinnerPdf();
    clearTimeout(__to__.value);
    __to__.value = setTimeout(() => {
        pdf({
            domElement: document.getElementById(`donut__${uid.value}`),
            fileName: donutConfig.value.style.chart.title.text || 'vue-ui-donut'
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
            domElement: document.getElementById(`donut__${uid.value}`),
            fileName: donutConfig.value.style.chart.title.text || 'vue-ui-donut',
            format: 'png'
        }).finally(() => {
            isImaging.value = false;
        })
    }, 100)
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

        makeXls(tableXls, donutConfig.value.style.chart.title.text || "vue-ui-donut");
    });
}

const dataTable = computed(() => {
    const head = [
        ` <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18 16v2a1 1 0 0 1 -1 1h-11l6 -7l-6 -7h11a1 1 0 0 1 1 1v2" /></svg>`,
        Number(total.value.toFixed(donutConfig.value.table.td.roundingValue)).toLocaleString(),
        '100%'
    ];

    const body = table.value.head.map((h,i) => {
        return [
            {
                color: h.color,
                name: h.name
            },
            table.value.body[i].toFixed(donutConfig.value.table.td.roundingValue),
            isNaN(table.value.body[i] / total.value) ? "-" : (table.value.body[i] / total.value * 100).toFixed(donutConfig.value.table.td.roundingPercentage) + '%'
        ]
    });

    const config = {
        th: {
            backgroundColor: donutConfig.value.table.th.backgroundColor,
            color: donutConfig.value.table.th.color,
            outline: donutConfig.value.table.th.outline
        },
        td: {
            backgroundColor: donutConfig.value.table.td.backgroundColor,
            color: donutConfig.value.table.td.color,
            outline: donutConfig.value.table.td.outline
        }
    }

    return {
        head,
        body,
        config
    }
});

defineExpose({
    getData,
    generatePdf,
    generateXls,
    generateImage
});

</script>

<template>
    <div :ref="`donutChart`" :class="`vue-ui-donut ${donutConfig.useCssAnimation ? '' : 'vue-ui-dna'}`" :style="`font-family:${donutConfig.style.fontFamily};width:100%; text-align:center;${!donutConfig.style.chart.title.text ? 'padding-top:36px' : ''};background:${donutConfig.style.chart.backgroundColor}`" :id="`donut__${uid}`">
        <div v-if="(!mutableConfig.inside || isPrinting) && donutConfig.style.chart.title.text" :style="`width:100%;background:${donutConfig.style.chart.backgroundColor};padding-bottom:24px`">
            <!-- TITLE AS DIV -->
            <Title
                :config="{
                    title: {
                        cy: 'donut-div-title',
                        text: donutConfig.style.chart.title.text,
                        color: donutConfig.style.chart.title.color,
                        fontSize: donutConfig.style.chart.title.fontSize,
                        bold: donutConfig.style.chart.title.bold
                    },
                    subtitle: {
                        cy: 'donut-div-subtitle',
                        text: donutConfig.style.chart.title.subtitle.text,
                        color: donutConfig.style.chart.title.subtitle.color,
                        fontSize: donutConfig.style.chart.title.subtitle.fontSize,
                        bold: donutConfig.style.chart.title.subtitle.bold
                    }
                }"
            />
        </div>

        <!-- OPTIONS -->
        <UserOptions
            ref="details"
            v-if="donutConfig.userOptions.show"
            :backgroundColor="donutConfig.style.chart.backgroundColor"
            :color="donutConfig.style.chart.color"
            :isPrinting="isPrinting"
            :isImaging="isImaging"
            :title="donutConfig.userOptions.title"
            :uid="uid"
            hasImg
            hasTable
            hasLabel
            @generatePdf="generatePdf"
            @generateXls="generateXls"
            @generateImage="generateImage"
            @toggleTable="mutableConfig.showTable = !mutableConfig.showTable"
            @toggleLabels="mutableConfig.dataLabels.show = !mutableConfig.dataLabels.show"
        />

        <svg data-cy="donut-svg" :viewBox="`0 0 ${svg.width} ${svg.height}`" :style="`max-width:100%; overflow: visible; background:${donutConfig.style.chart.backgroundColor};color:${donutConfig.style.chart.color}`">
            
            <!-- DEFS -->
            <defs>
                <radialGradient :id="`gradient_${uid}`" v-if="donutConfig.style.chart.useGradient">
                    <stop offset="0%" :stop-color="`${convertColorToHex(donutConfig.style.chart.backgroundColor)}00`" />
                    <stop offset="77%" :stop-color="'#FFFFFF' + opacity[donutConfig.style.chart.gradientIntensity]" />
                    <stop offset="100%" :stop-color="`${convertColorToHex(donutConfig.style.chart.backgroundColor)}00`" />
                </radialGradient>
            </defs>

            <!-- TITLE AS G -->
            <g v-if="donutConfig.style.chart.title.text && mutableConfig.inside && !isPrinting">
                <text
                    data-cy="donut-text-title"
                    :font-size="donutConfig.style.chart.title.fontSize"
                    :fill="donutConfig.style.chart.title.color"
                    :x="svg.width / 2"
                    :y="24"
                    text-anchor="middle"
                    :style="`font-weight:${donutConfig.style.chart.title.bold ? 'bold' : ''}`"
                >
                    {{ donutConfig.style.chart.title.text }}
                </text>
                <text
                    data-cy="donut-text-subtitle"
                    v-if="donutConfig.style.chart.title.subtitle.text"
                    :font-size="donutConfig.style.chart.title.subtitle.fontSize"
                    :fill="donutConfig.style.chart.title.subtitle.color"
                    :x="svg.width / 2"
                    :y="24 + donutConfig.style.chart.title.fontSize"
                    text-anchor="middle"
                    :style="`font-weight:${donutConfig.style.chart.title.subtitle.bold ? 'bold' : ''}`"
                >
                    {{ donutConfig.style.chart.title.subtitle.text }}
                </text>
            </g>

            <!-- LABEL CONNECTOR -->
            <g v-for="(arc, i) in currentDonut">
                <path
                    v-if="isArcBigEnough(arc) && mutableConfig.dataLabels.show"
                    :d="calcNutArrowPath(arc, {x: svg.width / 2, y: svg.height / 2})"
                    :stroke="arc.color"
                    stroke-width="1"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    fill="none"
                    :class="!defaultConfig.useBlurOnHover || [null, undefined].includes(selectedSerie) || selectedSerie === i ? '' : 'vue-ui-donut-blur'"
                />
            </g>

            <path 
                v-for="(arc, i) in currentDonut"
                :stroke="donutConfig.style.chart.backgroundColor"
                :d="arc.path"
                :stroke-width="defaultConfig.style.chart.layout.donut.strokeWidth" 
                fill="#FFFFFF"
            />
            <path 
                v-for="(arc, i) in currentDonut"
                class="vue-ui-donut-arc-path"
                :data-cy="`donut-arc-${i}`"
                :d="arc.path" 
                :stroke="`${arc.color}CC`"
                :class="!defaultConfig.useBlurOnHover || [null, undefined].includes(selectedSerie) || selectedSerie === i ? '' : 'vue-ui-donut-blur'"
                :stroke-width="defaultConfig.style.chart.layout.donut.strokeWidth" 
                fill="none"
            />

            <!-- HOLLOW -->
            <circle
                data-cy="donut-gradient-hollow"
                v-if="donutConfig.style.chart.useGradient"
                :cx="svg.width / 2"
                :cy="svg.height / 2"
                :r="136"
                :fill="`url(#gradient_${uid})`"
            />

              <!-- TOOLTIP TRAPS -->
              <path 
                v-for="(arc, i) in currentDonut"
                :data-cy="`donut-trap-${i}`"
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
                {{ donutConfig.style.chart.layout.labels.hollow.total.value.prefix }} {{ Number(total.toFixed(donutConfig.style.chart.layout.labels.hollow.total.value.rounding)).toLocaleString() }} {{ donutConfig.style.chart.layout.labels.hollow.total.value.suffix }}
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
                {{ donutConfig.style.chart.layout.labels.hollow.average.value.prefix }} {{ isNaN(average.toFixed(donutConfig.style.chart.layout.labels.hollow.average.value.rounding)) ? "-" : Number(average.toFixed(donutConfig.style.chart.layout.labels.hollow.average.value.rounding)).toLocaleString() }} {{ donutConfig.style.chart.layout.labels.hollow.average.value.suffix }}
            </text>


            <!-- DATALABELS -->
            <g v-for="(arc, i) in currentDonut">
                <text
                    :data-cy="`donut-datalabel-value-${i}`"
                    v-if="isArcBigEnough(arc) && mutableConfig.dataLabels.show"
                    :text-anchor="calcMarkerOffsetX(arc, true).anchor"
                    :x="calcMarkerOffsetX(arc).x"
                    :y="calcMarkerOffsetY(arc)"
                    :fill="arc.color"
                    :font-size="donutConfig.style.chart.layout.labels.percentage.fontSize * 0.8"
                    font-family="Arial"
                    :class="!defaultConfig.useBlurOnHover || [null, undefined].includes(selectedSerie) || selectedSerie === i ? '' : 'vue-ui-donut-blur'"
                >
                    ⬤
                </text>
                <text
                    :data-cy="`donut-datalabel-value-${i}`"
                    v-if="isArcBigEnough(arc) && mutableConfig.dataLabels.show"
                    :text-anchor="calcMarkerOffsetX(arc, true, 20).anchor"
                    :x="calcMarkerOffsetX(arc, true, 20).x"
                    :y="calcMarkerOffsetY(arc)"
                    :fill="donutConfig.style.chart.layout.labels.percentage.color"
                    :font-size="donutConfig.style.chart.layout.labels.percentage.fontSize"
                    :style="`font-weight:${donutConfig.style.chart.layout.labels.percentage.bold ? 'bold': ''}`"
                >
                    {{ displayArcPercentage(arc, currentDonut)  }}
                </text>
                <text
                    :data-cy="`donut-datalabel-name-${i}`"
                    v-if="isArcBigEnough(arc, true, 20) && mutableConfig.dataLabels.show"
                    :text-anchor="calcMarkerOffsetX(arc).anchor"
                    :x="calcMarkerOffsetX(arc, true, 20).x"
                    :y="calcMarkerOffsetY(arc) + donutConfig.style.chart.layout.labels.percentage.fontSize"
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
                <Legend
                    :legendSet="legendSet"
                    :config="legendConfig"
                    @clickMarker="({i}) => segregate(i)"
                >
                    <template #item="{legend, index}">
                        <div @click="segregate(index)" :style="`opacity:${segregated.includes(index) ? 0.5 : 1}`">
                            {{ legend.name }} : {{ Number(legend.value.toFixed(donutConfig.style.chart.legend.roundingValue)).toLocaleString() }}
                            <span v-if="!segregated.includes(index)">
                                ({{ isNaN(legend.value / total) ? '-' : (legend.value / total * 100).toFixed(donutConfig.style.chart.legend.roundingPercentage)}}%)
                            </span>
                            <span v-else>
                                ( - % )
                            </span>
                        </div>
                    </template>
                </Legend>
            </foreignObject>
        </svg>

        <!-- LEGEND AS DIV -->

        <Legend
            v-if="donutConfig.style.chart.legend.show && (!mutableConfig.inside || isPrinting)"
            :legendSet="legendSet"
            :config="legendConfig"
            @clickMarker="({i}) => segregate(i)"
        >
            <template #item="{legend, index}">
                <div @click="segregate(index)" :style="`opacity:${segregated.includes(index) ? 0.5 : 1}`">
                    {{ legend.name }} : {{ Number(legend.value.toFixed(donutConfig.style.chart.legend.roundingValue)).toLocaleString() }}
                    <span v-if="!segregated.includes(index)">
                        ({{ isNaN(legend.value / total) ? '-' : (legend.value / total * 100).toFixed(donutConfig.style.chart.legend.roundingPercentage)}}%)
                    </span>
                    <span v-else>
                        ( - % )
                    </span>
                </div>
            </template>
        </Legend>

        <!-- TOOLTIP -->
        <Tooltip
            :show="donutConfig.style.chart.tooltip.show && isTooltip"
            :backgroundColor="donutConfig.style.chart.tooltip.backgroundColor"
            :color="donutConfig.style.chart.tooltip.color"
            :parent="donutChart"
            :content="tooltipContent"
        />

        <!-- DATA TABLE -->
        <DataTable
            v-if="mutableConfig.showTable"
            :head="dataTable.head" 
            :body="dataTable.body"
            :config="dataTable.config"
            :title="`${donutConfig.style.chart.title.text}${donutConfig.style.chart.title.subtitle.text ? ` : ${donutConfig.style.chart.title.subtitle.text}` : ''}`"
        >
            <template #th="{th}">
                <div v-html="th" style="display:flex;align-items:center"></div>
            </template>
            <template #td="{td}">
                {{ td.name || td }}
            </template>
        </DataTable>
    </div>
</template>

<style scoped>
.vue-ui-donut *{
    transition: unset;
}
.vue-ui-donut {
    user-select: none;
    position: relative;
}

path {
    animation: donut 0.5s ease-in-out;
    transform-origin: center;
}
@keyframes donut {
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
.vue-ui-donut .vue-ui-donut-label {
    align-items: center;
    display: flex;
    flex-direction: column;
    height:100%;
    justify-content: center;
    text-align:center;
    width:100%;
}

.vue-ui-dna * {
    animation: none !important;
}

.vue-ui-donut-blur {
    filter: blur(3px) opacity(50%) grayscale(100%);
    transition: all 0.15s ease-in-out;
}

</style>