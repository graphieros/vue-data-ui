<script setup>
import { ref, computed, onMounted, nextTick } from "vue";
import {
    treeShake,
    convertConfigColors,
    convertColorToHex,
    palette,
    opacity,
    shiftHue,
    makeXls
} from "../lib.js";
import pdf from "../pdf.js";
import mainConfig from "../default_configs.json";
import { useMouse } from "../useMouse";
import { calcTooltipPosition } from "../calcTooltipPosition";

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

const uid = ref(`vue-ui-vertical-bar-${Math.random()}`);

const defaultConfig = ref(mainConfig.vue_ui_vertical_bar);

const isPrinting = ref(false);
const verticalBarChart = ref(null);
const tooltip = ref(null);
const details = ref(null);
const clientPosition = ref(useMouse());
const isTooltip = ref(false);
const tooltipContent = ref("");

const barCount = ref(0);
const hoveredBar = ref(null);

const emit = defineEmits(['selectLegend']);

onMounted(() => {
    barCount.value = props.dataset.flatMap(serie => {
        if(serie.children && serie.children.length > 0) {
            return serie.children.length;
        } else {
            return 1;
        }
    }).reduce((a, b) => a + b, 0);
});

const tooltipPosition = computed(() => {
    return calcTooltipPosition({
        tooltip: tooltip.value,
        chart: verticalBarChart.value,
        clientPosition: clientPosition.value
    });
});

const verticalBarConfig = computed(() => {
    if(!Object.keys(props.config || {}).length) {
        return defaultConfig.value;
    }

    const reconcilied = treeShake({
        defaultConfig: defaultConfig.value,
        userConfig: props.config
    });
    return convertConfigColors(reconcilied);
});

const mutableConfig = ref({
    inside: !verticalBarConfig.value.style.chart.layout.useDiv,
    showTable: verticalBarConfig.value.table.show,
    sortDesc: verticalBarConfig.value.style.chart.layout.bars.sort === "desc"
});

const isSortDown = computed(() => {
    return mutableConfig.value.sortDesc;
})

const immutableDataset = computed(() => {
    return props.dataset
        .sort((a, b) => isSortDown.value ? b.value - a.value : a.value - b.value)
        .map((serie, i) => {
        return {
            ...serie,
            id: `vertical_parent_${i}_${uid.value}`,
            hasChildren: !!serie.children && serie.children.length > 0,
            isChild: false,
            color: convertColorToHex(serie.color) || palette[i] || palette[i % palette.length],
            children: !serie.children || !serie.children.length ? [] : serie.children
                .sort((a, b) => isSortDown.value ? b.value - a.value : a.value - b.value)
                .map((c, j) => {
                    return {
                        ...c,
                        isChild: true,
                        parentId: `vertical_parent_${i}_${uid.value}`,
                        parentName: serie.name,
                        parentValue: serie.value,
                        id: `vertical_child_${i}_${j}_${uid.value}`,
                        childIndex: j,
                        color: convertColorToHex(c.color) || convertColorToHex(serie.color) || palette[i] || palette[i % palette.length]
                    }
                })
                .map((c,j) => {
                    return {
                        ...c,
                        isFirstChild: j === 0,
                        isLastChild: j === serie.children.length - 1,
                    }
                })
        }
    })
});

const svg = computed(() => {
    return {
        width: 512,
        height: (verticalBarConfig.value.style.chart.layout.bars.height + verticalBarConfig.value.style.chart.layout.bars.gap) * barCount.value,
        padding: {
            top: mutableConfig.value.inside ? 64 : 12,
            left: 128 + verticalBarConfig.value.style.chart.layout.bars.offsetX,
            right: 64 + verticalBarConfig.value.style.chart.layout.bars.paddingRight,
            bottom: mutableConfig.value.inside ? 92 : 12,
        }
    }
});

const drawableArea = computed(() => {
    return {
        fullHeight: svg.value.padding.top + svg.value.padding.bottom + svg.value.height,
        top: svg.value.padding.top,
        left: svg.value.padding.left,
        right: svg.value.width - svg.value.padding.right,
        bottom: svg.value.padding.top + svg.value.height,
        width: svg.value.width - (svg.value.padding.left + svg.value.padding.right)
    }
});

function recalculateHeight() {
    barCount.value = mutableDataset.value.flatMap(serie => {
        if(serie.children && serie.children.length > 0) {
            return serie.children.length;
        } else {
            return 1;
        }
    }).reduce((a, b) => a + b, 0);
}

const segregated = ref([]);

function segregate(id) {
    if(segregated.value.includes(id)) {
        segregated.value = segregated.value.filter(el => el !== id);
    }else {
        segregated.value.push(id)
    }
    recalculateHeight();
    emit('selectLegend', mutableDataset.value);
}

const mutableDataset = computed(() => {
    return immutableDataset.value.filter(serie => !segregated.value.includes(serie.id));
});

const total = computed(() => {
    return mutableDataset.value.map(serie => serie.value).reduce((a,b) => a + b);
});

function calcProportionToTotal(val, formatted = false, rounding = 0) {
    if(formatted) {
        return (val / total.value * 100).toFixed(rounding) + '%';
    }
    return val / total.value;
}

const bars = computed(() => {
    return mutableDataset.value.flatMap(serie => {
        if(!serie.hasChildren) {
            return serie;
        }else {
            return serie.children;
        }
    })
})

const max = computed(() => {
    return Math.max(...mutableDataset.value.flatMap(serie => {
        if(serie.children && serie.children.length) {
            return Math.max(...serie.children.map(c => c.value))
        } else {
            return serie.value
        }
    }))
});

function calcBarWidth(val) {
    const ratio = val / max.value;
    return drawableArea.value.width * ratio;
}

function calcDataLabelX(val) {
    return calcBarWidth(val) + drawableArea.value.left;
}

function getParentData(serie, index) {
    const parent = mutableDataset.value.find(el => el.id === serie.parentId);
    const start = drawableArea.value.top + ((verticalBarConfig.value.style.chart.layout.bars.gap + verticalBarConfig.value.style.chart.layout.bars.height) * (index));
    const height = parent.children.length * (verticalBarConfig.value.style.chart.layout.bars.gap + verticalBarConfig.value.style.chart.layout.bars.height);
    return {
        y: start + (height / 2),
        name: parent.name,
        value: [undefined, NaN, null].includes(parent.value) ? '' : parent.value.toFixed(verticalBarConfig.value.style.chart.layout.bars.dataLabels.value.roundingValue),
        percentageToTotal: isNaN(parent.value / total.value) ? '' : calcProportionToTotal(parent.value, true, verticalBarConfig.value.style.chart.layout.bars.dataLabels.percentage.roundingPercentage)
    }
}

function getData() {
    return mutableDataset.value;
}

defineExpose({
    getData,
    recalculateHeight
});

const selectedBarId = ref(null);

function useTooltip(bar) {
    isTooltip.value = true;
    selectedBarId.value = bar.id;
    let html = "";
    const serieName = bar.isChild ? bar.parentName : bar.name;
    const childName = bar.isChild ? bar.name : "";

    html += `<div style="width:100%;text-align:center;border-bottom:1px solid #ccc;padding-bottom:6px;margin-bottom:3px;text-align:left;">
            <div style="display:flex;align-items:center;gap:4px;"><svg viewBox="0 0 12 12" height="14" width="14"><rect x="0" y="0" height="12" width="12" rx="2" stroke="none" fill="${bar.color}"/></svg> ${ serieName }</div>
            ${childName ? `<div>${childName}</div>` : ''}
        </div>`;
    
    if (verticalBarConfig.value.style.chart.tooltip.showValue) {
        html += `<div>${verticalBarConfig.value.translations.value} : <b>${verticalBarConfig.value.style.chart.tooltip.prefix}${[undefined, NaN, null].includes(bar.value) ? '-' : bar.value.toFixed(verticalBarConfig.value.style.chart.tooltip.roundingValue)}${verticalBarConfig.value.style.chart.tooltip.suffix}</b></div>`;
    }    

    if(verticalBarConfig.value.style.chart.tooltip.showPercentage) {
        html += `<div>${verticalBarConfig.value.translations.percentageToTotal} : <b>${isNaN(bar.value / total.value) ? '-' : `${(bar.value / total.value * 100).toFixed(verticalBarConfig.value.style.chart.tooltip.roundingPercentage)}`}%</b></div>`;
        if(bar.isChild) {
            html += `<div>${verticalBarConfig.value.translations.percentageToSerie} : <b>${isNaN(bar.value / bar.parentValue) ? '-' : `${(bar.value / bar.parentValue * 100).toFixed(verticalBarConfig.value.style.chart.tooltip.roundingPercentage)}`}%</b></div>`;
        }
    }

    tooltipContent.value = `<div style="text-align:left">${html}</div>`;
}

function generatePdf(){
    isPrinting.value = true;
    nextTick(() => {
        pdf({
            domElement: document.getElementById(`vue-ui-vertical-bar_${uid.value}`),
            fileName: verticalBarConfig.value.style.chart.title.text || 'vue-ui-vertical-bar'
        }).finally(() => {
            isPrinting.value = false;
        });
    })
}

const table = computed(() => {
    const head = [
        verticalBarConfig.value.translations.parentName,
        verticalBarConfig.value.translations.value,
        verticalBarConfig.value.translations.percentageToTotal,
        verticalBarConfig.value.translations.childName,
        verticalBarConfig.value.translations.value,
        verticalBarConfig.value.translations.percentageToSerie,
        verticalBarConfig.value.translations.percentageToTotal,
    ];

    const body = bars.value.map(bar => {
        if(!bar.isChild) {
            return {
                color: bar.color,
                parentName: bar.name,
                parentValue: bar.value,
                percentageToTotal: bar.value / total.value,
                childName: "",
                childValue: "",
                childPercentageToParent: "",
                childPercentageToTotal: ""
            };
        } else {
            if(bar.isFirstChild) {
                return {
                    color: bar.color,
                    parentName: bar.parentName,
                    parentValue: bar.parentValue,
                    percentageToTotal: bar.parentValue / total.value,
                    childName: bar.name,
                    childValue: bar.value,
                    childPercentageToParent: bar.value / bar.parentValue,
                    childPercentageToTotal: bar.value / total.value
                }
            }else{
                return {
                    color: "",
                    parentName: "",
                    parentValue: "",
                    percentageToTotal: "",
                    childName: bar.name,
                    childValue: bar.value,
                    childPercentageToParent: bar.value / bar.parentValue,
                    childPercentageToTotal: bar.value / total.value
                }
            }
        }
    });

    return { head, body };
});

function generateXls() {
    const title = [[verticalBarConfig.value.style.chart.title.text], [verticalBarConfig.value.style.chart.title.subtitle.text], [""]];
    const head = table.value.head;
    const body = table.value.body.map(tr => {
        return [
            tr.parentName,
            tr.parentValue,
            tr.percentageToTotal,
            tr.childName,
            tr.childValue,
            tr.childPercentageToParent,
            tr.childPercentageToTotal
        ]
    });
    
    const tableXls = title.concat([head]).concat(body);
    makeXls(tableXls, verticalBarConfig.value.style.chart.title.text || "vue-ui-vertical-bar");
}

function closeDetails(){
    if(details.value) {
        details.value.removeAttribute("open")
    }
}

</script>

<template>
    <div class="vue-ui-vertical-bar" ref="verticalBarChart" :id="`vue-ui-vertical-bar_${uid}`" :style="`font-family:${verticalBarConfig.style.fontFamily};width:100%; text-align:center`">
        
        <!-- TITLE AS DIV -->
        <div v-if="(!mutableConfig.inside || isPrinting) && verticalBarConfig.style.chart.title.text" :style="`width:100%;background:${verticalBarConfig.style.chart.backgroundColor};padding-bottom:12px`">
            <div :style="`width:100%;text-align:center;color:${verticalBarConfig.style.chart.title.color};font-size:${verticalBarConfig.style.chart.title.fontSize}px;font-weight:${verticalBarConfig.style.chart.title.bold ? 'bold': ''}`">
                {{ verticalBarConfig.style.chart.title.text }}
            </div>
            <div v-if="verticalBarConfig.style.chart.title.subtitle.text" :style="`width:100%;text-align:center;color:${verticalBarConfig.style.chart.title.subtitle.color};font-size:${verticalBarConfig.style.chart.title.subtitle.fontSize}px;font-weight:${verticalBarConfig.style.chart.title.subtitle.bold ? 'bold': ''}`">
                {{ verticalBarConfig.style.chart.title.subtitle.text }}
            </div>
        </div>

        <!-- OPTIONS -->
        <details class="vue-ui-vertical-bar-user-options" :style="`background:${verticalBarConfig.style.chart.backgroundColor};color:${verticalBarConfig.style.chart.color}`" data-html2canvas-ignore v-if="verticalBarConfig.userOptions.show" ref="details">
            <summary :style="`background:${verticalBarConfig.style.chart.backgroundColor};color:${verticalBarConfig.style.chart.color}`">{{ verticalBarConfig.userOptions.title }}</summary>
            <div class="vue-ui-vertical-bar-user-options-items" :style="`background:${verticalBarConfig.style.chart.backgroundColor};color:${verticalBarConfig.style.chart.color}`">
                <div class="vue-ui-vertical-bar-user-option-item">
                    <input type="checkbox" :id="`vue-ui-vertical-bar-option-title_${uid}`" :name="`vue-ui-vertical-bar-option-title_${uid}`"
                    v-model="mutableConfig.inside">
                    <label :for="`vue-ui-vertical-bar-option-title_${uid}`">{{ verticalBarConfig.userOptions.labels.useDiv }}</label>
                </div>
                <div class="vue-ui-vertical-bar-user-option-item">
                    <input type="checkbox" :id="`vue-ui-vertical-bar-option-table_${uid}`" :name="`vue-ui-vertical-bar-option-table_${uid}`"
                    v-model="mutableConfig.showTable">
                    <label :for="`vue-ui-vertical-bar-option-table_${uid}`">{{ verticalBarConfig.userOptions.labels.showTable }}</label>
                </div>
                <div class="vue-ui-vertical-bar-user-option-item">
                    <input type="checkbox" :id="`vue-ui-vertical-bar-option-sort_${uid}`" :name="`vue-ui-vertical-bar-option-sort_${uid}`"
                    v-model="mutableConfig.sortDesc" @change="recalculateHeight">
                    <label :for="`vue-ui-vertical-bar-option-sort_${uid}`">{{ verticalBarConfig.userOptions.labels.sort }}</label>
                </div>
                <button class="vue-ui-vertical-bar-button" @click="generatePdf" :disabled="isPrinting" style="margin-top:12px" :style="`color:${verticalBarConfig.style.chart.color}`">
                    <svg class="vue-ui-vertical-bar-print-icon" xmlns="http://www.w3.org/2000/svg" v-if="isPrinting" width="20" height="20" viewBox="0 0 24 24" stroke-width="1.5" :stroke="verticalBarConfig.style.chart.color" fill="none" stroke-linecap="round" stroke-linejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                        <path d="M18 16v.01" />
                        <path d="M6 16v.01" />
                        <path d="M12 5v.01" />
                        <path d="M12 12v.01" />
                        <path d="M12 1a4 4 0 0 1 2.001 7.464l.001 .072a3.998 3.998 0 0 1 1.987 3.758l.22 .128a3.978 3.978 0 0 1 1.591 -.417l.2 -.005a4 4 0 1 1 -3.994 3.77l-.28 -.16c-.522 .25 -1.108 .39 -1.726 .39c-.619 0 -1.205 -.14 -1.728 -.391l-.279 .16l.007 .231a4 4 0 1 1 -2.212 -3.579l.222 -.129a3.998 3.998 0 0 1 1.988 -3.756l.002 -.071a4 4 0 0 1 -1.995 -3.265l-.005 -.2a4 4 0 0 1 4 -4z" />
                    </svg>
                    <span v-else>PDF</span>
                </button>
                <button class="vue-ui-vertical-bar-button" @click="generateXls" :style="`color:${verticalBarConfig.style.chart.color}`">
                    XLSX
                </button>
            </div>
        </details>

         <!-- LEGEND AS DIV : TOP -->
         <div v-if="verticalBarConfig.style.chart.legend.show && (!mutableConfig.inside || isPrinting) && verticalBarConfig.style.chart.legend.position === 'top'" class="vue-ui-vertical-bar-legend" :style="`background:${verticalBarConfig.style.chart.legend.backgroundColor};color:${verticalBarConfig.style.chart.legend.color};font-size:${verticalBarConfig.style.chart.legend.fontSize}px;padding-bottom:12px;font-weight:${verticalBarConfig.style.chart.legend.bold ? 'bold' : ''}`" @click="closeDetails">
            <div v-for="(legendItem, i) in immutableDataset" class="vue-ui-vertical-bar-legend-item" @click="segregate(legendItem.id)" :style="`opacity:${segregated.includes(legendItem.id) ? 0.5 : 1}`">
                <svg viewBox="0 0 12 12" height="12" width="14"><rect x="0" y="0" height="12" width="12" rx="2" stroke="none" :fill="legendItem.color"/></svg>
                <span>{{ legendItem.name }} : </span>
                <span>{{verticalBarConfig.style.chart.legend.prefix}}{{ legendItem.value.toFixed(verticalBarConfig.style.chart.legend.roundingValue) }}{{verticalBarConfig.style.chart.legend.suffix}}</span>
            </div>
        </div>

        <!-- CHART -->
        <svg :viewBox="`0 0 ${svg.width} ${drawableArea.fullHeight}`" :style="`max-width:100%;overflow:visible;background:${verticalBarConfig.style.chart.backgroundColor};color:${verticalBarConfig.style.chart.color}`" @click="closeDetails">

            <!-- defs -->
            <linearGradient
                    x1="0%" y1="0%" x2="100%" y2="0%"
                    v-for="(bar, i) in bars"
                    :id="`vertical_bar_gradient_${uid}_${i}`"
                >
                    <stop offset="0%" :stop-color="bar.color" />
                    <stop offset="100%" :stop-color="`${shiftHue(bar.color, 0.03)}${opacity[100 - verticalBarConfig.style.chart.layout.bars.gradientIntensity]}`"/>
             </linearGradient>

             <!-- TITLE AS G -->
            <g v-if="verticalBarConfig.style.chart.title.text && mutableConfig.inside && !isPrinting">
                <text
                    :font-size="verticalBarConfig.style.chart.title.fontSize"
                    :fill="verticalBarConfig.style.chart.title.color"
                    :x="svg.width / 2"
                    :y="verticalBarConfig.style.chart.title.fontSize"
                    text-anchor="middle"
                    :style="`font-weight:${verticalBarConfig.style.chart.title.bold ? 'bold' : ''}`"
                >
                    {{ verticalBarConfig.style.chart.title.text }}
                </text>
                <text
                    v-if="verticalBarConfig.style.chart.title.subtitle.text"
                    :font-size="verticalBarConfig.style.chart.title.subtitle.fontSize"
                    :fill="verticalBarConfig.style.chart.title.subtitle.color"
                    :x="svg.width / 2"
                    :y="verticalBarConfig.style.chart.title.fontSize * 2"
                    text-anchor="middle"
                    :style="`font-weight:${verticalBarConfig.style.chart.title.subtitle.bold ? 'bold' : ''}`"
                >
                    {{ verticalBarConfig.style.chart.title.subtitle.text }}
                </text>
            </g>
            

            <g v-for="(serie, i) in bars">
                <!-- UNDERLAYER -->
                <rect 
                    :x="drawableArea.left"
                    :y="drawableArea.top + ((verticalBarConfig.style.chart.layout.bars.gap + verticalBarConfig.style.chart.layout.bars.height) * i)"
                    :width="calcBarWidth(serie.value)"
                    :height="verticalBarConfig.style.chart.layout.bars.height"
                    :fill="verticalBarConfig.style.chart.layout.bars.underlayerColor"
                    :rx="verticalBarConfig.style.chart.layout.bars.borderRadius"
                />
            </g>
            <g v-for="(serie, i) in bars"> 
                <!-- BARS -->
                <rect 
                    :x="drawableArea.left"
                    :y="drawableArea.top + ((verticalBarConfig.style.chart.layout.bars.gap + verticalBarConfig.style.chart.layout.bars.height) * i)"
                    :width="calcBarWidth(serie.value)"
                    :height="verticalBarConfig.style.chart.layout.bars.height"
                    :fill="verticalBarConfig.style.chart.layout.bars.useGradient ? `url(#vertical_bar_gradient_${uid}_${i})` : `${serie.color}${opacity[verticalBarConfig.style.chart.layout.bars.fillOpacity]}`"
                    :rx="verticalBarConfig.style.chart.layout.bars.borderRadius"
                    :stroke="verticalBarConfig.style.chart.layout.bars.useStroke ? serie.color : 'none'"
                    :stroke-width="verticalBarConfig.style.chart.layout.bars.useStroke ? verticalBarConfig.style.chart.layout.bars.strokeWidth : 0"
                />

                <!-- SEPARATORS -->
                <line
                    v-if="(!serie.isChild || serie.isLastChild) && verticalBarConfig.style.chart.layout.separators.show && i !== bars.length -1"
                    :x1="0"
                    :x2="drawableArea.left"
                    :y1="verticalBarConfig.style.chart.layout.bars.height + (verticalBarConfig.style.chart.layout.bars.gap / 2) + drawableArea.top + ((verticalBarConfig.style.chart.layout.bars.gap + verticalBarConfig.style.chart.layout.bars.height) * i)"
                    :y2="verticalBarConfig.style.chart.layout.bars.height + (verticalBarConfig.style.chart.layout.bars.gap / 2) + drawableArea.top + ((verticalBarConfig.style.chart.layout.bars.gap + verticalBarConfig.style.chart.layout.bars.height) * i)"
                    :stroke="verticalBarConfig.style.chart.layout.separators.color"
                    :stroke-width="verticalBarConfig.style.chart.layout.separators.strokeWidth"
                    stroke-linecap="round"
                />

                <!-- DATALABELS -->
                <text
                    :x="calcDataLabelX(serie.value) + 3 + verticalBarConfig.style.chart.layout.bars.dataLabels.offsetX"
                    :y="drawableArea.top + ((verticalBarConfig.style.chart.layout.bars.gap + verticalBarConfig.style.chart.layout.bars.height) * i) + (verticalBarConfig.style.chart.layout.bars.height / 2) + verticalBarConfig.style.chart.layout.bars.dataLabels.fontSize / 2"
                    text-anchor="start"
                    :font-size="verticalBarConfig.style.chart.layout.bars.dataLabels.fontSize"
                    :fill="verticalBarConfig.style.chart.layout.bars.dataLabels.color"
                    :font-weight="verticalBarConfig.style.chart.layout.bars.dataLabels.bold ? 'bold' : 'normal'"
                >
                    {{ verticalBarConfig.style.chart.layout.bars.dataLabels.value.prefix }} {{ isNaN(serie.value) || !verticalBarConfig.style.chart.layout.bars.dataLabels.value.show ? '' : serie.value.toFixed(verticalBarConfig.style.chart.layout.bars.dataLabels.value.roundingValue) }} {{ verticalBarConfig.style.chart.layout.bars.dataLabels.value.suffix  }} {{ verticalBarConfig.style.chart.layout.bars.dataLabels.percentage.show ? `(${calcProportionToTotal(serie.value, true, verticalBarConfig.style.chart.layout.bars.dataLabels.percentage.roundingPercentage)})` : '' }}
                </text>

                <!-- CHILDREN | LONELY PARENTS NAMES -->
                <text 
                    v-if="(serie.isChild || !serie.hasChildren) && verticalBarConfig.style.chart.layout.bars.nameLabels.show"
                    text-anchor="end"
                    :x="drawableArea.left - 3 + verticalBarConfig.style.chart.layout.bars.nameLabels.offsetX"
                    :y="drawableArea.top + ((verticalBarConfig.style.chart.layout.bars.gap + verticalBarConfig.style.chart.layout.bars.height) * i) + (verticalBarConfig.style.chart.layout.bars.height / 2) + verticalBarConfig.style.chart.layout.bars.nameLabels.fontSize / 2"
                    :font-size="verticalBarConfig.style.chart.layout.bars.nameLabels.fontSize"
                    :fill="verticalBarConfig.style.chart.layout.bars.nameLabels.color"
                    :font-weight="verticalBarConfig.style.chart.layout.bars.nameLabels.bold ? 'bold' : 'normal'"
                >
                    {{ serie.name }}
                </text>

                <!-- PARENT NAMES -->
                <text 
                    v-if="serie.isChild && serie.childIndex === 0 && verticalBarConfig.style.chart.layout.bars.parentLabels.show"
                    :x="3 + verticalBarConfig.style.chart.layout.bars.parentLabels.offsetX"
                    :y="getParentData(serie, i).y"
                    :font-size="verticalBarConfig.style.chart.layout.bars.parentLabels.fontSize"
                    :fill="verticalBarConfig.style.chart.layout.bars.parentLabels.color"
                    :font-weight="verticalBarConfig.style.chart.layout.bars.parentLabels.bold ? 'bold' : 'normal'"
                    text-anchor="start"
                >
                    {{ getParentData(serie, i).name }}
                </text>
                <text 
                    v-if="serie.isChild && serie.childIndex === 0 && verticalBarConfig.style.chart.layout.bars.parentLabels.show"
                    :x="3 + verticalBarConfig.style.chart.layout.bars.parentLabels.offsetX"
                    :y="getParentData(serie, i).y + verticalBarConfig.style.chart.layout.bars.parentLabels.fontSize + 6"
                    :font-size="verticalBarConfig.style.chart.layout.bars.parentLabels.fontSize"
                    :fill="verticalBarConfig.style.chart.layout.bars.parentLabels.color"
                    :font-weight="verticalBarConfig.style.chart.layout.bars.dataLabels.bold ? 'bold' : 'normal'"
                    text-anchor="start"
                >
                    {{ verticalBarConfig.style.chart.layout.bars.dataLabels.value.show ? getParentData(serie, i).value : '' }} {{ verticalBarConfig.style.chart.layout.bars.dataLabels.percentage.show ? `(${getParentData(serie, i).percentageToTotal})` : '' }}
                </text>

                <!-- TOOLTIP TRAPS -->
                <rect 
                    :x="0"
                    :y="drawableArea.top + ((verticalBarConfig.style.chart.layout.bars.gap + verticalBarConfig.style.chart.layout.bars.height) * i) - (verticalBarConfig.style.chart.layout.bars.gap/2)"
                    :width="svg.width"
                    :height="verticalBarConfig.style.chart.layout.bars.height + verticalBarConfig.style.chart.layout.bars.gap"
                    :fill="selectedBarId === serie.id ? `${verticalBarConfig.style.chart.layout.highlighter.color}${opacity[verticalBarConfig.style.chart.layout.highlighter.opacity]}` : 'transparent'"
                    @mouseenter="useTooltip(serie)"
                    @mouseleave="hoveredBar = null; isTooltip = false; selectedBarId = null"
                />
            </g>

            <!-- LEGEND AS G -->
            <foreignObject
                v-if="verticalBarConfig.style.chart.legend.show && mutableConfig.inside && !isPrinting"
                :x="0"
                :y="drawableArea.bottom + 24"
                width="100%"
                :height="drawableArea.fullHeight - drawableArea.bottom - 24"
                style="overflow: visible;"
            >
                <div class="vue-ui-vertical-bar-legend" :style="`color:${verticalBarConfig.style.chart.legend.color};font-size:${verticalBarConfig.style.chart.legend.fontSize}px;padding-bottom:12px;font-weight:${verticalBarConfig.style.chart.legend.bold ? 'bold' : ''}`" @click="closeDetails">
                    <div v-for="(legendItem, i) in immutableDataset" class="vue-ui-vertical-bar-legend-item" @click="segregate(legendItem.id)" :style="`opacity:${segregated.includes(legendItem.id) ? 0.5 : 1}`">
                        <svg viewBox="0 0 12 12" height="12" width="14"><rect x="0" y="0" height="12" width="12" rx="2" stroke="none" :fill="legendItem.color"/></svg>
                        <span>{{ legendItem.name }} : </span>
                        <span>{{verticalBarConfig.style.chart.legend.prefix}}{{ legendItem.value.toFixed(verticalBarConfig.style.chart.legend.roundingValue) }}{{verticalBarConfig.style.chart.legend.suffix}}</span>
                    </div>
                </div>
            </foreignObject>

        </svg>

         <!-- LEGEND AS DIV : BOTTOM -->
         <div v-if="verticalBarConfig.style.chart.legend.show && (!mutableConfig.inside || isPrinting) && verticalBarConfig.style.chart.legend.position === 'bottom'" class="vue-ui-vertical-bar-legend" :style="`background:${verticalBarConfig.style.chart.legend.backgroundColor};color:${verticalBarConfig.style.chart.legend.color};font-size:${verticalBarConfig.style.chart.legend.fontSize}px;padding-bottom:12px;font-weight:${verticalBarConfig.style.chart.legend.bold ? 'bold' : ''}`" @click="closeDetails">
            <div v-for="(legendItem, i) in immutableDataset" class="vue-ui-vertical-bar-legend-item" @click="segregate(legendItem.id)" :style="`opacity:${segregated.includes(legendItem.id) ? 0.5 : 1}`">
                <svg viewBox="0 0 12 12" height="12" width="14"><rect x="0" y="0" height="12" width="12" rx="2" stroke="none" :fill="legendItem.color"/></svg>
                <span>{{ legendItem.name }} : </span>
                <span>{{verticalBarConfig.style.chart.legend.prefix}}{{ legendItem.value.toFixed(verticalBarConfig.style.chart.legend.roundingValue) }}{{verticalBarConfig.style.chart.legend.suffix}}</span>
            </div>
        </div>

        <!-- TOOLTIP -->
        <div 
            class="vue-ui-vertical-bar-tooltip"
            ref="tooltip"
            v-if="verticalBarConfig.style.chart.tooltip.show && isTooltip && segregated.length < props.dataset.length"
            :style="`top:${tooltipPosition.top}px;left:${tooltipPosition.left}px;background:${verticalBarConfig.style.chart.tooltip.backgroundColor};color:${verticalBarConfig.style.chart.tooltip.color}`"
            v-html="tooltipContent"
        />

        <!-- DATA TABLE -->
        <div @click="closeDetails" class="vue-ui-vertical-bar-table" :style="`width:100%;margin-top:${mutableConfig.inside ? '48px' : ''}`" v-if="mutableConfig.showTable">
            <table>
                <thead>
                    <tr v-if="verticalBarConfig.style.chart.title.text">
                        <th :colspan="7" :style="`background:${verticalBarConfig.table.th.backgroundColor};color:${verticalBarConfig.table.th.color};outline:${verticalBarConfig.table.th.outline}`">
                            <span>{{ verticalBarConfig.style.chart.title.text }}</span>
                            <span v-if="verticalBarConfig.style.chart.title.subtitle.text">
                                : {{ verticalBarConfig.style.chart.title.subtitle.text }}
                            </span>
                        </th>
                    </tr>
                    <tr>
                        <th v-for="th in table.head" :style="`background:${verticalBarConfig.table.th.backgroundColor};color:${verticalBarConfig.table.th.color};outline:${verticalBarConfig.table.th.outline}`">
                            <div style="width:100%">
                                {{ th }}
                            </div>
                        </th>
                    </tr>
                    <tr>
                        <th :style="`background:${verticalBarConfig.table.th.backgroundColor};color:${verticalBarConfig.table.th.color};outline:${verticalBarConfig.table.th.outline}`"></th>
                        <th :style="`background:${verticalBarConfig.table.th.backgroundColor};color:${verticalBarConfig.table.th.color};outline:${verticalBarConfig.table.th.outline};text-align:right;padding-right:5px;font-weight:bold`">∑ {{verticalBarConfig.table.td.prefix}}{{ isNaN(total) ? '' : total.toFixed(verticalBarConfig.table.td.roundingValue) }}{{verticalBarConfig.table.td.suffix}}</th>
                        <th :style="`background:${verticalBarConfig.table.th.backgroundColor};color:${verticalBarConfig.table.th.color};outline:${verticalBarConfig.table.th.outline};text-align:right;padding-right:5px;font-weight:bold`">100%</th>
                        <th :style="`background:${verticalBarConfig.table.th.backgroundColor};color:${verticalBarConfig.table.th.color};outline:${verticalBarConfig.table.th.outline}`"></th>
                        <th :style="`background:${verticalBarConfig.table.th.backgroundColor};color:${verticalBarConfig.table.th.color};outline:${verticalBarConfig.table.th.outline}`"></th>
                        <th :style="`background:${verticalBarConfig.table.th.backgroundColor};color:${verticalBarConfig.table.th.color};outline:${verticalBarConfig.table.th.outline}`"></th>
                        <th :style="`background:${verticalBarConfig.table.th.backgroundColor};color:${verticalBarConfig.table.th.color};outline:${verticalBarConfig.table.th.outline}`"></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="tr in table.body">
                        <td :style="`background:${verticalBarConfig.table.td.backgroundColor};color:${verticalBarConfig.table.td.color};outline:${verticalBarConfig.table.td.outline}`">
                            <span v-if="tr.color" :style="`color:${tr.color};margin-right:3px`">⬤</span><span>{{ tr.parentName }}</span>
                        </td>
                        <td :style="`background:${verticalBarConfig.table.td.backgroundColor};color:${verticalBarConfig.table.td.color};outline:${verticalBarConfig.table.td.outline}`">
                            {{verticalBarConfig.table.td.prefix}}{{ ["", NaN, undefined].includes(tr.parentValue) ? '' : tr.parentValue.toFixed(verticalBarConfig.table.td.roundingValue) }}{{verticalBarConfig.table.td.suffix}}
                        </td>
                        <td :style="`background:${verticalBarConfig.table.td.backgroundColor};color:${verticalBarConfig.table.td.color};outline:${verticalBarConfig.table.td.outline}`">
                            {{  ["", NaN, undefined].includes(tr.percentageToTotal) ? '' : `${(tr.percentageToTotal * 100).toFixed(verticalBarConfig.table.td.roundingPercentage)}%` }}
                        </td>
                        <td :style="`background:${verticalBarConfig.table.td.backgroundColor};color:${verticalBarConfig.table.td.color};outline:${verticalBarConfig.table.td.outline}`">
                            {{ tr.childName }}
                        </td>
                        <td :style="`background:${verticalBarConfig.table.td.backgroundColor};color:${verticalBarConfig.table.td.color};outline:${verticalBarConfig.table.td.outline}`">
                            {{verticalBarConfig.table.td.prefix}}{{ ["", NaN, undefined].includes(tr.childValue) ? '' : tr.childValue.toFixed(verticalBarConfig.table.td.roundingValue) }}{{verticalBarConfig.table.td.suffix}}
                        </td>
                        <td :style="`background:${verticalBarConfig.table.td.backgroundColor};color:${verticalBarConfig.table.td.color};outline:${verticalBarConfig.table.td.outline}`">
                            {{ ["", NaN, undefined].includes(tr.childPercentageToParent) ? '' : `${(tr.childPercentageToParent * 100).toFixed(verticalBarConfig.table.td.roundingPercentage)}%` }}
                        </td>
                        <td :style="`background:${verticalBarConfig.table.td.backgroundColor};color:${verticalBarConfig.table.td.color};outline:${verticalBarConfig.table.td.outline}`">
                            {{ ["", NaN, undefined].includes(tr.childPercentageToTotal) ? '' : `${(tr.childPercentageToTotal * 100).toFixed(verticalBarConfig.table.td.roundingPercentage)}%` }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<style scoped>
.vue-ui-vertical-bar *{
    transition: unset;
}
.vue-ui-vertical-bar {
    user-select: none;
    position: relative;
    padding-top: 36px;
}
.vue-ui-vertical-bar .vue-ui-vertical-bar-label {
    align-items: center;
    display: flex;
    flex-direction: column;
    height:100%;
    justify-content: center;
    text-align:center;
    width:100%;
}
.vue-ui-vertical-bar-legend {
    height: 100%;
    width:100%;
    display: flex;
    align-items:center;
    flex-wrap: wrap;
    justify-content:center;
    column-gap: 18px;
}
.vue-ui-vertical-bar-legend-item {
    display: flex;
    align-items:center;
    justify-content: center;
    gap: 6px;
    cursor: pointer;
    height: 24px;
}
.vue-ui-vertical-bar-tooltip {
    border: 1px solid #e1e5e8;
    border-radius: 4px;
    box-shadow: 0 6px 12px -6px rgba(0,0,0,0.2);
    max-width: 300px;
    position: fixed;
    padding:12px;
    z-index:1;
}

/** */
.vue-ui-vertical-bar-user-options {
    border-radius: 4px;
    padding: 6px 12px;
    position: absolute;
    right:0;
    top:0px;
    max-width: 300px;
    text-align:left;
}
.vue-ui-vertical-bar-user-options[open] {
    border: 1px solid #e1e5e8;
    box-shadow: 0 6px 12px -6px rgba(0,0,0,0.2);
}
.vue-ui-vertical-bar summary {
    text-align: right;
    direction: rtl;
}
.vue-ui-vertical-bar-user-options-items {
    width: 100%;
    display: flex;
    flex-direction: column;
    margin-top: 6px;
}
.vue-ui-vertical-bar-user-options-item {
    width: 100%;
    display: flex;
    flex-direction: row;
    gap: 5px;
    align-items:center;
}

.vue-ui-vertical-bar-button {
    margin: 6px 0;
    border-radius: 3px;
    height: 30px;
    border: 1px solid #b9bfc4;
    background: inherit;
    display: flex;
    align-items:center;
    justify-content: center;
}
.vue-ui-vertical-bar-button:hover {
    background: rgba(0,0,0,0.05);
}
.vue-ui-vertical-bar-print-icon {
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

.vue-ui-vertical-bar table {
    width: 100%;
    border-collapse:collapse;
}
.vue-ui-vertical-bar table td {
    text-align:right;
    padding-right: 6px;
    font-variant-numeric: tabular-nums;
}
.vue-ui-vertical-bar table th {
    position: sticky;
    top:0;
    font-weight: 400;
    user-select: none;
}
</style>