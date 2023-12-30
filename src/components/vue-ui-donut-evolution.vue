<script setup>
import { ref, computed, nextTick } from "vue";
import { calcMarkerOffsetX, calcMarkerOffsetY, calcNutArrowPath, canShowValue, closestDecimal, makeDonut, palette, convertColorToHex, opacity, makeXls, createUid, sumByAttribute } from '../lib';
import pdf from "../pdf";
import img from "../img";
import mainConfig from "../default_configs.json";
import Title from "../atoms/Title.vue";
import { useNestedProp } from "../useNestedProp";
import UserOptions from "../atoms/UserOptions.vue";
import DataTable from "../atoms/DataTable.vue";
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

const defaultConfig = ref(mainConfig.vue_ui_donut_evolution);

const isPrinting = ref(false);
const isImaging = ref(false);
const segregated = ref([]);
const hoveredIndex = ref(null);
const hoveredDatapoint = ref(null);
const isFixed = ref(false);
const fixedDatapoint = ref(null);

const emit = defineEmits(['selectLegend'])

const donutEvolutionConfig = computed(() => {
    return useNestedProp({
        userConfig: props.config,
        defaultConfig: defaultConfig.value
    });
});

const mutableConfig = ref({
    showTable: donutEvolutionConfig.value.table.show
})

const padding = computed(() => {
    return {
        top: donutEvolutionConfig.value.style.chart.layout.padding.top,
        right: donutEvolutionConfig.value.style.chart.layout.padding.right,
        bottom: donutEvolutionConfig.value.style.chart.layout.padding.bottom,
        left: donutEvolutionConfig.value.style.chart.layout.padding.left,
    }
})

const svg = computed(() => {
    const absoluteHeight = donutEvolutionConfig.value.style.chart.layout.height;
    const absoluteWidth = donutEvolutionConfig.value.style.chart.layout.width;
    const height = absoluteHeight - padding.value.top - padding.value.bottom;
    const width = absoluteWidth - padding.value.left - padding.value.right;
    return {
        absoluteHeight,
        absoluteWidth,
        centerX: padding.value.left + (width / 2),
        centerY: padding.value.top + (height / 2),
        height,
        width,
    }
})

const convertedDataset = computed(() => {
    return props.dataset.map((ds, i) => {
        return {
            ...ds,
            color: convertColorToHex(ds.color) || palette[i] || palette[i % palette.length],
            length: ds.values.length,
            uid: createUid(),
        }
    })
});

const mutableDataset = computed(() => {
    return convertedDataset.value.filter(ds => !segregated.value.includes(ds.uid))
})

const maxLength = computed(() => {
    return Math.max(...mutableDataset.value.map(ds => ds.length))
})

const slit = computed(() => {
    return svg.value.width / maxLength.value;
})

const drawableDataset = computed(() => {
    const arr = [];
    for(let i = 0; i < maxLength.value; i += 1) {
        const values = mutableDataset.value.map(ds => ds.values[i] ?? null);
        const allValuesAreNull = values.filter(v => [undefined, null].includes(v)).length === values.length;
        const subtotal = values.reduce((a, b) => a + b, 0);
        const percentages = values.map(v => v / subtotal);
        const x = padding.value.left + (slit.value * i) + slit.value / 2;
        arr.push({
            index: i,
            percentages,
            subtotal : allValuesAreNull || subtotal < 0 ? null : subtotal,
            values,
            x,
        })
    }
    const maxSubtotal = Math.max(...arr.map(a => a.subtotal));
    return arr.map((a, i) => {
        const radiusReference = (slit.value / 2) * 0.5;
        const radius = radiusReference > svg.value.width / 16 ? svg.value.width / 16 : radiusReference;
        const activeRadius = hoveredIndex.value === a.index ? svg.value.width / 20 : radius;
        const y = svg.value.absoluteHeight - padding.value.bottom - (svg.value.height * a.subtotal / maxSubtotal);
        return {
            ...a,
            y,
            radius,
            donut: makeDonut({
                series: mutableDataset.value.map((s, k) => {
                    return {
                        color: s.color,
                        name: s.name,
                        value: s.values[i] ?? 0
                    }
                })
            }, a.x, y, activeRadius, activeRadius),
            donutFocus: makeDonut({
                series: mutableDataset.value.map((s, k) => {
                    return {
                        color: s.color,
                        name: s.name,
                        value: s.values[i] ?? 0
                    }
                })
            }, svg.value.centerX, svg.value.centerY, svg.value.height / 5, svg.value.height / 5),
        }
    })
})

function labellizeValue(val) {
    return `${donutEvolutionConfig.value.style.chart.layout.dataLabels.prefix}${isNaN(val) ? '-' : Number(val.toFixed(donutEvolutionConfig.value.style.chart.layout.dataLabels.rounding)).toLocaleString()}${donutEvolutionConfig.value.style.chart.layout.dataLabels.suffix}`;
}


const extremes = computed(() => {
    return {
        max: Math.max(...drawableDataset.value.map(ds => ds.subtotal)),
        min: 0
    }
});

function ratioToMax(value) {
    return value / extremes.value.max;
}

const yLabels = computed(() => {
    const positiveStep = closestDecimal(extremes.value.max / donutEvolutionConfig.value.style.chart.layout.grid.yAxis.dataLabels.steps);
    const steps = [];
    for(let i = donutEvolutionConfig.value.style.chart.layout.grid.yAxis.dataLabels.steps; i >= 0; i -= 1) {
        const value = positiveStep * i ;
        steps.push({
            y: svg.value.absoluteHeight - padding.value.bottom - (svg.value.height * ratioToMax(positiveStep * i)),
            value,
        });
    }
    return steps;
});

function displayArcPercentage(arc, stepBreakdown) {
    return isNaN(arc.value / sumByAttribute(stepBreakdown, 'value')) ? 0 : ((arc.value / sumByAttribute(stepBreakdown, "value")) * 100).toFixed(0) + "%";
}

function leave() {
    if (isFixed.value) return;
    hoveredIndex.value = null;
    hoveredDatapoint.value = null;
}

function enter(datapoint) {
    if (isFixed.value) return;
    hoveredIndex.value = datapoint.index;
    hoveredDatapoint.value = datapoint;
}

function fixDatapoint(datapoint) {
    if(!datapoint.subtotal) return;
    hoveredDatapoint.value = null;
    hoveredIndex.value = null;
    isFixed.value = true;
    fixedDatapoint.value = datapoint;
}

function unfixDatapoint() {
    fixedDatapoint.value = null;
    isFixed.value = false;
}

const __to__ = ref(null);

function showSpinnerPdf() {
    isPrinting.value = true;
}

const legendSet = computed(() => {
    return convertedDataset.value
        .map((serie, i) => {
            return {
                name: serie.name,
                value: serie.values.reduce((a,b) => a + b, 0),
                shape: 'circle',
                uid: serie.uid,
                color: serie.color
            }
        })
        .sort((a,b) => b.value - a.value)
        .map((el, i) => {
            return {
                ...el,
                opacity: segregated.value.includes(el.uid) ? 0.5 : 1
            }
        })
});

const grandTotal = computed(() => {
    return drawableDataset.value.map(ds => ds.subtotal).reduce((a,b) => a + b, 0)
})

const legendConfig = computed(() => {
    return {
        cy: 'donut-div-legend',
        backgroundColor: donutEvolutionConfig.value.style.chart.legend.backgroundColor,
        color: donutEvolutionConfig.value.style.chart.legend.color,
        fontSize: donutEvolutionConfig.value.style.chart.legend.fontSize,
        paddingBottom: 12,
        fontWeight: donutEvolutionConfig.value.style.chart.legend.bold ? 'bold' : ''
    }
})

function segregate(index) {

    if(segregated.value.includes(index)) {
        segregated.value = segregated.value.filter(s => s !== index);
    }else {
        if(segregated.value.length === convertedDataset.value.length - 1) return;
        segregated.value.push(index);
    }
    emit('selectLegend', drawableDataset.value);
    if(fixedDatapoint.value) {
        fixedDatapoint.value = {
            ...fixedDatapoint.value,
            donutFocus: makeDonut({
                series: mutableDataset.value.map((s, k) => {
                    return {
                        color: s.color,
                        name: s.name,
                        value: s.values[fixedDatapoint.value.index] ?? 0
                    }
                }).filter(ds => !segregated.value.includes(ds.uid))
            }, svg.value.centerX, svg.value.centerY, svg.value.height / 5, svg.value.height / 5),
        }
        fixDatapoint(fixedDatapoint.value)
    }
}

function generatePdf(){
    showSpinnerPdf();
    clearTimeout(__to__.value);
    __to__.value = setTimeout(() => {
        pdf({
            domElement: document.getElementById(uid.value),
            fileName: donutEvolutionConfig.value.style.chart.title.text || 'vue-ui-donut-evolution'
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
            domElement: document.getElementById(uid.value),
            fileName: donutEvolutionConfig.value.style.chart.title.text || 'vue-ui-donut-evolution',
            format: 'png'
        }).finally(() => {
            isImaging.value = false;
        })
    }, 100)
}

const table = computed(() => {
    const head = [''].concat(convertedDataset.value.filter(ds => !segregated.value.includes(ds.uid)).map(ds => {
        return {
            name: ds.name,
            color: ds.color
        }
    })).concat(['Σ']);
    let body = [];
    let time = [];

    for(let i = 0; i < maxLength.value; i += 1) {
        const sum = convertedDataset.value.filter(ds => !segregated.value.includes(ds.uid)).map(ds => {
            return ds.values[i] ?? 0
        }).reduce((a, b) => a + b, 0);

        body.push([donutEvolutionConfig.value.style.chart.layout.grid.xAxis.dataLabels.values[i] ?? '-'].concat(convertedDataset.value.filter(ds => !segregated.value.includes(ds.uid)).map(ds => {
            return {
                value: ds.values[i] ?? 0,
                percentage: ds.values[i] ? ds.values[i] / sum * 100 : 0
            }
        })).concat([`${donutEvolutionConfig.value.style.chart.layout.dataLabels.prefix}${sum}${donutEvolutionConfig.value.style.chart.layout.dataLabels.suffix}`]))

    }

    const config = {
        th: {
            backgroundColor: donutEvolutionConfig.value.table.th.backgroundColor,
            color: donutEvolutionConfig.value.table.th.color,
            outline: donutEvolutionConfig.value.table.th.outline
        },
        td: {
            backgroundColor: donutEvolutionConfig.value.table.td.backgroundColor,
            color: donutEvolutionConfig.value.table.td.color,
            outline: donutEvolutionConfig.value.table.td.outline
        }
    }

    return { head, body, config };
});

function getData() {
    return convertedDataset.value;
}

function generateXls() {
    nextTick(() => {
        const title = [[donutEvolutionConfig.value.style.chart.title.text],[donutEvolutionConfig.value.style.chart.title.subtitle.text],[""]];
        const head = [...table.value.head.map(h => h.name ?? h)];
        const body = [...table.value.body.map(b => {
            return b.map(t => t.value ?? t)
        })];
        const tableXls = title.concat([head]).concat(body)
        makeXls(tableXls, donutEvolutionConfig.value.style.chart.title.text || "vue-ui-donut-evolution");
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
    <div :ref="`donutEvolutionChart`" :class="`vue-ui-donut-evolution ${donutEvolutionConfig.useCssAnimation ? '' : 'vue-ui-dna'}`" :style="`overflow: visible;font-family:${donutEvolutionConfig.style.fontFamily};width:100%; text-align:center;${!donutEvolutionConfig.style.chart.title.text ? 'padding-top:36px' : ''};background:${donutEvolutionConfig.style.chart.backgroundColor}`" :id="uid">
        <div v-if="donutEvolutionConfig.style.chart.title.text" :style="`width:100%;background:${donutEvolutionConfig.style.chart.backgroundColor};padding-bottom:24px`" @mouseleave="leave">
            <!-- TITLE AS DIV -->
            <Title
                :config="{
                    title: {
                        cy: 'donut-evolution-div-title',
                        text: donutEvolutionConfig.style.chart.title.text,
                        color: donutEvolutionConfig.style.chart.title.color,
                        fontSize: donutEvolutionConfig.style.chart.title.fontSize,
                        bold: donutEvolutionConfig.style.chart.title.bold
                    },
                    subtitle: {
                        cy: 'donut-evolution-div-subtitle',
                        text: donutEvolutionConfig.style.chart.title.subtitle.text,
                        color: donutEvolutionConfig.style.chart.title.subtitle.color,
                        fontSize: donutEvolutionConfig.style.chart.title.subtitle.fontSize,
                        bold: donutEvolutionConfig.style.chart.title.subtitle.bold
                    }
                }"
            />
        </div>

        <UserOptions
            ref="details"
            v-if="donutEvolutionConfig.userOptions.show"
            :backgroundColor="donutEvolutionConfig.style.chart.backgroundColor"
            :color="donutEvolutionConfig.style.chart.color"
            :isPrinting="isPrinting"
            :isImaging="isImaging"
            :title="donutEvolutionConfig.userOptions.title"
            :uid="uid"
            hasImg
            hasTable
            @generatePdf="generatePdf"
            @generateXls="generateXls"
            @generateImage="generateImage"
            @toggleTable="mutableConfig.showTable = !mutableConfig.showTable"
        />

        
        <svg data-cy="donut-evolution-svg" :viewBox="`0 0 ${svg.absoluteWidth} ${svg.absoluteHeight}`" :style="`max-width:100%; overflow: visible; background:${donutEvolutionConfig.style.chart.backgroundColor};color:${donutEvolutionConfig.style.chart.color}`">

            <defs>
                <linearGradient :id="`hover_${uid}`" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" :stop-color="`${donutEvolutionConfig.style.chart.backgroundColor}${opacity[donutEvolutionConfig.style.chart.layout.highlighter.opacity]}`"/>
                    <stop offset="100%" :stop-color="`${donutEvolutionConfig.style.chart.layout.highlighter.color}${opacity[donutEvolutionConfig.style.chart.layout.highlighter.opacity]}`"/>
                </linearGradient>

                <radialGradient :id="`focus_${uid}`">
                    <stop offset="0%" :stop-color="`${convertColorToHex(donutEvolutionConfig.style.chart.backgroundColor)}00`" />
                    <stop offset="77%" :stop-color="'#FFFFFF' + opacity[30]" />
                    <stop offset="100%" :stop-color="`${convertColorToHex(donutEvolutionConfig.style.chart.backgroundColor)}00`" />
                </radialGradient>
            </defs>
            

            <!-- GRID -->
            <g v-if="donutEvolutionConfig.style.chart.layout.grid.show">
                <line :x1="padding.left" :x2="padding.left" :y1="padding.top" :y2="padding.top + svg.height" :stroke="donutEvolutionConfig.style.chart.layout.grid.stroke" :stroke-width="donutEvolutionConfig.style.chart.layout.grid.strokeWidth" stroke-linecap="round"/>
                <line :x1="padding.left" :x2="svg.absoluteWidth - padding.right" :y1="svg.absoluteHeight - padding.bottom" :y2="svg.absoluteHeight - padding.bottom" :stroke="donutEvolutionConfig.style.chart.layout.grid.stroke" :stroke-width="donutEvolutionConfig.style.chart.layout.grid.strokeWidth" stroke-linecap="round" />

                <g v-if="donutEvolutionConfig.style.chart.layout.grid.showVerticalLines">
                    <line v-for="(l, i) in maxLength" :x1="padding.left + ((i +1 ) * slit)" :x2="padding.left + ((i +1) * slit)" :y1="padding.top" :y2="svg.absoluteHeight - padding.bottom" :stroke="donutEvolutionConfig.style.chart.layout.grid.stroke" :stroke-width="donutEvolutionConfig.style.chart.layout.grid.strokeWidth" stroke-linecap="round"/>
                </g>
            </g>

            <!-- Y LABELS -->
            <g v-if="donutEvolutionConfig.style.chart.layout.grid.yAxis.dataLabels.show" :class="{'donut-opacity': true, 'donut-behind': hoveredIndex !== null || isFixed}">
                <g v-for="(yLabel, i) in yLabels">
                    <line 
                        v-if="yLabel.value >= 0 && yLabel.value <= extremes.max"
                        :x1="padding.left" 
                        :x2="padding.left - 5" 
                        :y1="yLabel.y" 
                        :y2="yLabel.y" 
                        :stroke="donutEvolutionConfig.style.chart.layout.grid.stroke" 
                        :stroke-width="donutEvolutionConfig.style.chart.layout.grid.strokeWidth" 
                    />
                    <text 
                        v-if="yLabel.value >= 0 && yLabel.value <= extremes.max" 
                        :x="padding.left - 8 + donutEvolutionConfig.style.chart.layout.grid.yAxis.dataLabels.offsetX" 
                        :y="yLabel.y + donutEvolutionConfig.style.chart.layout.grid.yAxis.dataLabels.fontSize / 3" 
                        :font-size="donutEvolutionConfig.style.chart.layout.grid.yAxis.dataLabels.fontSize" 
                        text-anchor="end"
                        :fill="donutEvolutionConfig.style.chart.layout.grid.yAxis.dataLabels.color"
                        :font-weight="donutEvolutionConfig.style.chart.layout.grid.yAxis.dataLabels.bold ? 'bold' : 'normal'"
                    >
                        {{ donutEvolutionConfig.style.chart.layout.dataLabels.prefix }} {{ canShowValue(yLabel.value) ? yLabel.value.toFixed(donutEvolutionConfig.style.chart.layout.grid.yAxis.dataLabels.roundingValue) : '' }} {{ donutEvolutionConfig.style.chart.layout.dataLabels.suffix }}
                    </text>
                </g>
            </g>

            <!-- X LABELS -->
            <g v-if="donutEvolutionConfig.style.chart.layout.grid.xAxis.dataLabels.show" :class="{'donut-opacity': true, 'donut-behind': isFixed}">
                <text 
                    v-for="(_, i) in maxLength"
                    :x="padding.left + (slit * i) + (slit / 2)"
                    :y="svg.absoluteHeight - padding.bottom + donutEvolutionConfig.style.chart.layout.grid.xAxis.dataLabels.fontSize * 2"
                    text-anchor="middle"
                    :font-size="donutEvolutionConfig.style.chart.layout.grid.xAxis.dataLabels.fontSize"
                    :fill="donutEvolutionConfig.style.chart.layout.grid.xAxis.dataLabels.color"

                >
                    {{ donutEvolutionConfig.style.chart.layout.grid.xAxis.dataLabels.values[i] ?? '' }}
                </text>
            </g>
            
            <!-- DATAPOINTS -->
            <g v-for="(datapoint, i ) in drawableDataset">
                <line
                    :class="{'donut-opacity': true, 'donut-behind': hoveredIndex !== null || isFixed}"
                    v-if="donutEvolutionConfig.style.chart.layout.line.show && i < drawableDataset.length - 1 && ![datapoint.subtotal, drawableDataset[i + 1].subtotal].includes(null)"
                    :x1="datapoint.x"
                    :y1="datapoint.y"
                    :x2="drawableDataset[i + 1].x"
                    :y2="drawableDataset[i + 1].y"
                    :stroke="donutEvolutionConfig.style.chart.layout.line.stroke"
                    :stroke-width="donutEvolutionConfig.style.chart.layout.line.strokeWidth"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
                <g v-if="datapoint.subtotal !== null">
                    <circle
                        v-if="datapoint.subtotal"
                        :cx="datapoint.x"
                        :cy="datapoint.y"
                        :r="hoveredIndex === datapoint.index ? slit / 2.5 : slit / 6"
                        :fill="donutEvolutionConfig.style.chart.backgroundColor"
                    />
                </g>
            </g>

            <g v-for="(datapoint, i ) in drawableDataset" :data-cy="`donut-wrapper-${i}`" :class="{'donut-opacity': true, 'donut-behind': (i !== hoveredIndex && hoveredIndex !== null) || isFixed}">
                <g v-if="datapoint.subtotal">
                    <g v-if="hoveredIndex !== null && hoveredIndex === i">
                        <g v-for="arc in datapoint.donut">
                            <path
                                :d="calcNutArrowPath(arc, {x: arc.center.endX, y: arc.center.endY}, 12, 12, { x: datapoint.x, y: datapoint.y}, true)"
                                :stroke="arc.color"
                                stroke-width="1"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                fill="none"
                            />
                        </g>
                        <!-- DATALABELS (hovered datapoint) -->
                        <g v-for="(arc, i) in datapoint.donut">
                            <text
                                :data-cy="`donut-datalabel-value-${i}`"
                                :text-anchor="calcMarkerOffsetX(arc, true, 0).anchor"
                                :x="calcMarkerOffsetX(arc, true, 3).x"
                                :y="calcMarkerOffsetY(arc)"
                                :fill="donutEvolutionConfig.style.chart.layout.grid.yAxis.dataLabels.color"
                                :font-size="8"
                                :font-weight="'bold'"
                            >
                            {{ arc.name}} : {{ displayArcPercentage(arc, datapoint.donut)  }} ({{ arc.value === null ? '-' : labellizeValue(arc.value) }})
                            </text>
                        </g>
                    </g>
                </g>
            </g>
            <g v-for="(datapoint, i ) in drawableDataset" :class="{'donut-opacity': true, 'donut-behind': (i !== hoveredIndex && hoveredIndex !== null) || isFixed}">
                <g v-if="datapoint.subtotal !== null">
                    <circle 
                        v-if="datapoint.subtotal === 0"
                        :cx="datapoint.x"
                        :cy="datapoint.y"
                        :r="3"
                        :fill="donutEvolutionConfig.style.chart.color"
                    />
                    <g v-else>
                        <path 
                            v-for="(arc, k) in datapoint.donut"
                            :d="arc.path"
                            :stroke="`${arc.color}`"
                            :stroke-width="hoveredIndex === i ? 12 : slit / 5 > 16 ? 16 : slit / 5"
                            fill="none"
                        />
                    </g>
                </g>
                <g v-if="datapoint.subtotal !== null">
                    <circle
                        v-if="datapoint.subtotal"
                        :cx="datapoint.x"
                        :cy="datapoint.y"
                        :r="hoveredIndex === datapoint.index ? svg.width / 22 : slit / 6"
                        :fill="donutEvolutionConfig.style.chart.backgroundColor"
                    />
                </g>
            </g>

            <!-- DATALABELS -->
            <g v-for="(datapoint, i ) in drawableDataset" :class="{'donut-opacity': true, 'donut-behind': (i !== hoveredIndex && hoveredIndex !== null) || isFixed}">
                <text 
                    v-if="datapoint.subtotal !== null"
                    text-anchor="middle"
                    :x="datapoint.x"
                    :y="hoveredIndex === datapoint.index && datapoint.subtotal ? datapoint.y + donutEvolutionConfig.style.chart.layout.dataLabels.fontSize / 3 : datapoint.y - datapoint.radius - donutEvolutionConfig.style.chart.layout.dataLabels.fontSize + donutEvolutionConfig.style.chart.layout.dataLabels.offsetY"
                    :font-size="donutEvolutionConfig.style.chart.layout.dataLabels.fontSize"
                    :font-weight="'bold'"
                    :fill="donutEvolutionConfig.style.chart.layout.dataLabels.color"
                >
                    {{ labellizeValue(datapoint.subtotal) }}
                </text>
            </g>

            <!-- TRAPS -->
            <rect 
                v-for="(datapoint, i) in drawableDataset"
                :x="padding.left + (i * slit)"
                :y="svg.absoluteHeight - padding.bottom - 10"
                :width="slit"
                :height="10"
                :fill="hoveredIndex === datapoint.index ? `url(#hover_${uid})` : 'transparent'"
                @click="fixDatapoint(datapoint)"
                :class="{'donut-hover': hoveredIndex === datapoint.index && datapoint.subtotal}"
            />
            <rect 
                v-for="(datapoint, i) in drawableDataset"
                :data-cy="`trap-${i}`"
                :x="padding.left + (i * slit)"
                :y="padding.top"
                :width="slit"
                :height="svg.height"
                fill="transparent"
                @mouseenter="enter(datapoint)"
                @mouseleave="leave"
                @click="fixDatapoint(datapoint)"
                :class="{'donut-hover': hoveredIndex === datapoint.index && datapoint.subtotal}"
            />

            <!-- DIALOG -->
            <g v-if="isFixed">
                <rect 
                    :rx="4"
                    :x="padding.left"
                    :y="padding.top"
                    :width="svg.width"
                    :height="svg.height"
                    :fill="donutEvolutionConfig.style.chart.backgroundColor"
                    style="filter:drop-shadow(0 12px 12px rgba(0,0,0,0.3))"
                />
                <line
                    data-html2canvas-ignore
                    :x1="svg.absoluteWidth - padding.right - 15"
                    :y1="padding.top + 5"
                    :x2="svg.absoluteWidth - padding.right - 4"
                    :y2="padding.top + 15.5"
                    stroke-linecap="round"
                    :stroke="donutEvolutionConfig.style.chart.color"
                    stroke-width="1.5"
                />
                <line
                    data-html2canvas-ignore
                    :x1="svg.absoluteWidth - padding.right - 15"
                    :y2="padding.top + 5"
                    :x2="svg.absoluteWidth - padding.right - 4"
                    :y1="padding.top + 15.5"
                    stroke-linecap="round"
                    :stroke="donutEvolutionConfig.style.chart.color"
                    stroke-width="1.5"
                />
                <circle
                    data-cy="quit-dialog"
                    @click="unfixDatapoint"
                    @keypress.enter="unfixDatapoint"
                    :cx="svg.absoluteWidth - padding.right - svg.width / 40"
                    :cy="padding.top + svg.height / 30"
                    :r="svg.height / 12"
                    fill="transparent"
                    style="cursor:pointer"
                    tabindex="0"
                />

                <g v-for="arc in fixedDatapoint.donutFocus">
                    <path
                        :d="calcNutArrowPath(arc, {x: arc.center.endX, y: arc.center.endY}, 12, 12, { x: svg.width / 2 + padding.left, y: padding.top + svg.height / 2}, true)"
                        :stroke="arc.color"
                        stroke-width="1"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        fill="none"
                    />
                </g>
                <circle 
                    :cx="padding.left + svg.width / 2"
                    :cy="padding.top + svg.height / 2"
                    :r="svg.height / 7"
                    :fill="donutEvolutionConfig.style.chart.backgroundColor"
                />
                <path 
                    v-for="(arc, k) in fixedDatapoint.donutFocus"
                    :d="arc.path"
                    :stroke="`${arc.color}`"
                    :stroke-width="svg.height / 7"
                    fill="none"
                />
                <g v-for="(arc, i) in fixedDatapoint.donutFocus">
                    <text
                        :data-cy="`donut-datalabel-value-${i}`"
                        :text-anchor="calcMarkerOffsetX(arc, true, 0).anchor"
                        :x="calcMarkerOffsetX(arc, true, 3).x"
                        :y="calcMarkerOffsetY(arc)"
                        :fill="donutEvolutionConfig.style.chart.layout.grid.yAxis.dataLabels.color"
                        :font-size="10"
                        :font-weight="'bold'"
                    >
                    {{ arc.name}} : {{ displayArcPercentage(arc, fixedDatapoint.donutFocus)  }} ({{ arc.value === null ? '-' : labellizeValue(arc.value) }})
                    </text>
                </g>
                <circle
                    :cx="padding.left + (svg.width / 2)"
                    :cy="padding.top + (svg.height / 2)"
                    :r="svg.height / 3.8"
                    :fill="`url(#focus_${uid})`"
                />
                <circle
                :cx="padding.left + (svg.width / 2)"
                    :cy="padding.top + (svg.height / 2)"
                    :r="svg.height / 7.7"
                    :fill="donutEvolutionConfig.style.chart.backgroundColor"
                />
                <text 
                    text-anchor="middle"
                    :x="padding.left + svg.width / 2"
                    :y="padding.top + (svg.height / 2) + 14 / 3"
                    :font-size="14"
                    :font-weight="'bold'"
                    :fill="donutEvolutionConfig.style.chart.layout.dataLabels.color"
                >
                    {{ labellizeValue(fixedDatapoint.subtotal) }}
                </text>
                <text 
                    v-if="donutEvolutionConfig.style.chart.layout.grid.xAxis.dataLabels.values[fixedDatapoint.index]"
                    :x="padding.left + 6"
                    :y="padding.top + donutEvolutionConfig.style.chart.layout.grid.xAxis.dataLabels.fontSize * 2"
                    :font-size="donutEvolutionConfig.style.chart.layout.grid.xAxis.dataLabels.fontSize * 1.6"
                    :fill="donutEvolutionConfig.style.chart.layout.dataLabels.color"
                >
                    {{ donutEvolutionConfig.style.chart.layout.grid.xAxis.dataLabels.values[fixedDatapoint.index] }}
                </text>
            </g>
            <slot name="svg" :svg="svg"/>
        </svg>

        <Legend
            v-if="donutEvolutionConfig.style.chart.legend.show"
            :legendSet="legendSet"
            :config="legendConfig"
            @clickMarker="({legend}) => segregate(legend.uid)"
        >
            <template #item="{legend, index}">
                <div @click="segregate(legend.uid)" :style="`opacity:${segregated.includes(legend.uid) ? 0.5 : 1}`">
                    {{ legend.name }} : {{ Number(legend.value.toFixed(donutEvolutionConfig.style.chart.legend.roundingValue)).toLocaleString() }}
                    <span v-if="!segregated.includes(legend.uid)">
                        ({{ isNaN(legend.value / grandTotal) ? '-' : (legend.value / grandTotal * 100).toFixed(donutEvolutionConfig.style.chart.legend.roundingPercentage)}}%)
                    </span>
                    <span v-else>
                        ( - % )
                    </span>
                </div>
            </template>
        </Legend>

        <DataTable
            v-if="mutableConfig.showTable"
            :head="table.head" 
            :body="table.body" 
            :config="table.config" 
            :title="`${donutEvolutionConfig.style.chart.title.text}${donutEvolutionConfig.style.chart.title.subtitle.text ? ` : ${donutEvolutionConfig.style.chart.title.subtitle.text}` : ''}`"
        >
            <template #th="{th}">
                {{ th.name ?? th }}
            </template>
            <template #td="{td}">
                <span v-if="td.value === null">-</span>
                <b v-else>
                    {{ !isNaN(td.value) ? donutEvolutionConfig.style.chart.layout.dataLabels.prefix : '' }}{{ !isNaN(td.value) && td.value !== null ? Number(td.value.toFixed(donutEvolutionConfig.table.td.roundingValue)).toLocaleString() : td }}{{ !isNaN(td.value) ? donutEvolutionConfig.style.chart.layout.dataLabels.suffix : '' }} 
                </b>
                <span>
                    {{ td.percentage && !isNaN(td.percentage) ? `(${Number(td.percentage.toFixed(donutEvolutionConfig.table.td.roundingPercentage)).toLocaleString()}%)` : '' }}
                </span>
            </template>
        </DataTable>

    </div>
</template>

<style scoped>
.vue-ui-donut-evolution *{
    transition: unset;
    transition: opacity 0.5s ease-in-out;
}
.vue-ui-donut-evolution {
    user-select: none;
    position: relative;
}

path {
    animation: donut 0.5s ease-in-out;
    transform-origin: center;
}

.donut-hover {
    cursor: pointer;
}

.donut-opacity {
    transition: opacity 0.2s ease-in-out;
}
.donut-behind {
    opacity: 0.1;
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

</style>