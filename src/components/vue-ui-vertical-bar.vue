<script setup>
import { ref, computed, onMounted } from "vue";
import {
    convertColorToHex,
    palette,
    opacity,
    shiftHue,
    createUid,
    createCsvContent,
    downloadCsv
} from "../lib.js";
import pdf from "../pdf.js";
import img from "../img.js";
import mainConfig from "../default_configs.json";
import { useNestedProp } from "../useNestedProp";
import Title from "../atoms/Title.vue";
import UserOptions from "../atoms/UserOptions.vue";
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
    }
});

const uid = ref(createUid());

const defaultConfig = ref(mainConfig.vue_ui_vertical_bar);

const isImaging = ref(false);
const isPrinting = ref(false);
const verticalBarChart = ref(null);
const details = ref(null);
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

const verticalBarConfig = computed(() => {
    return useNestedProp({
        userConfig: props.config,
        defaultConfig: defaultConfig.value
    });
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
        .toSorted((a, b) => isSortDown.value ? b.value - a.value : a.value - b.value)
        .map((serie, i) => {
            const id = `vertical_parent_${i}_${uid.value}`; 
        return {
            ...serie,
            id,
            shape: 'square',
            opacity: segregated.value.includes(id) ? 0.5 : 1,
            hasChildren: !!serie.children && serie.children.length > 0,
            isChild: false,
            color: convertColorToHex(serie.color) || palette[i] || palette[i % palette.length],
            children: !serie.children || !serie.children.length ? [] : serie.children
                .toSorted((a, b) => isSortDown.value ? b.value - a.value : a.value - b.value)
                .map((c, j) => {
                    return {
                        ...c,
                        isChild: true,
                        parentId: id,
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

const legendConfig = computed(() => {
    return {
        cy: 'vertical-bar-div-legend',
        backgroundColor: verticalBarConfig.value.style.chart.legend.backgroundColor,
        color: verticalBarConfig.value.style.chart.legend.color,
        fontSize: verticalBarConfig.value.style.chart.legend.fontSize,
        paddingBottom: 12,
        fontWeight: verticalBarConfig.value.style.chart.legend.bold ? 'bold' : ''
    }
})

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

const __to__ = ref(null);

function showSpinnerPdf() {
    isPrinting.value = true;
}

function generatePdf(){
    showSpinnerPdf();
    clearTimeout(__to__.value);
    __to__.value = setTimeout(() => {
        pdf({
            domElement: document.getElementById(`vue-ui-vertical-bar_${uid.value}`),
            fileName: verticalBarConfig.value.style.chart.title.text || 'vue-ui-vertical-bar'
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
            domElement: document.getElementById(`vue-ui-vertical-bar_${uid.value}`),
            fileName: verticalBarConfig.value.style.chart.title.text || 'vue-ui-vertical-bar',
            format: 'png'
        }).finally(() => {
            isImaging.value = false;
        })
    }, 100)
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

function generateCsv() {
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
    const csvContent = createCsvContent(tableXls);
    downloadCsv({ csvContent, title: verticalBarConfig.value.style.chart.title.text || "vue-ui-vertical-bar"})
}

const isFullscreen = ref(false)
function toggleFullscreen(state) {
    isFullscreen.value = state;
}

defineExpose({
    getData,
    recalculateHeight,
    generatePdf,
    generateCsv,
    generateImage
});

</script>

<template>
    <div :class="`vue-ui-vertical-bar ${verticalBarConfig.useCssAnimation ? '' : 'vue-ui-dna'}`" ref="verticalBarChart" :id="`vue-ui-vertical-bar_${uid}`" :style="`font-family:${verticalBarConfig.style.fontFamily};width:100%; text-align:center;${!verticalBarConfig.style.chart.title.text ? 'padding-top:36px' : ''};background:${verticalBarConfig.style.chart.backgroundColor}`">
        
        <!-- TITLE AS DIV -->
        <div v-if="(!mutableConfig.inside || isPrinting) && verticalBarConfig.style.chart.title.text" :style="`width:100%;background:${verticalBarConfig.style.chart.backgroundColor};padding-bottom:12px`">
            <Title
                :config="{
                    title: {
                        cy: 'vertical-bar-div-title',
                        text: verticalBarConfig.style.chart.title.text,
                        color: verticalBarConfig.style.chart.title.color,
                        fontSize: verticalBarConfig.style.chart.title.fontSize,
                        bold: verticalBarConfig.style.chart.title.bold
                    },
                    subtitle: {
                        cy: 'vertical-bar-div-subtitle',
                        text: verticalBarConfig.style.chart.title.subtitle.text ,
                        color: verticalBarConfig.style.chart.title.subtitle.color,
                        fontSize: verticalBarConfig.style.chart.title.subtitle.fontSize,
                        bold: verticalBarConfig.style.chart.title.subtitle.bold
                    }
                }"
            />
        </div>

        <!-- OPTIONS -->
        <UserOptions
            ref="details"
            v-if="verticalBarConfig.userOptions.show"
            :backgroundColor="verticalBarConfig.style.chart.backgroundColor"
            :color="verticalBarConfig.style.chart.color"
            :isImaging="isImaging"
            :isPrinting="isPrinting"
            :title="verticalBarConfig.userOptions.title"
            :uid="uid"
            :hasImg="true"
            hasTable
            hasSort
            hasFullscreen
            :chartElement="verticalBarChart"
            @toggleFullscreen="toggleFullscreen"
            @generatePdf="generatePdf"
            @generateCsv="generateCsv"
            @generateImage="generateImage"
            @toggleTable="mutableConfig.showTable = !mutableConfig.showTable"
            @toggleSort="() => {
                mutableConfig.sortDesc = !mutableConfig.sortDesc;
                recalculateHeight()
            }"
        />

         <!-- LEGEND AS DIV : TOP -->
        <Legend
            v-if="verticalBarConfig.style.chart.legend.show && (!mutableConfig.inside || isPrinting) && verticalBarConfig.style.chart.legend.position === 'top'"
            :legendSet="immutableDataset"
            :config="legendConfig"
            @clickMarker="({ legend }) => segregate(legend.id)"
        >
            <template #item="{ legend }">
                <div @click="segregate(legend.id)" :style="`opacity:${segregated.includes(legend.id) ? 0.5 : 1}`">
                    {{ legend.name }} : {{verticalBarConfig.style.chart.legend.prefix}}{{ legend.value.toFixed(verticalBarConfig.style.chart.legend.roundingValue) }}{{verticalBarConfig.style.chart.legend.suffix}}
                </div>
            </template>
        </Legend>

        <!-- CHART -->
        <svg :class="{ 'vue-data-ui-fullscreen--on': isFullscreen, 'vue-data-ui-fulscreen--off': !isFullscreen }" :viewBox="`0 0 ${svg.width} ${drawableArea.fullHeight}`" :style="`max-width:100%;overflow:visible;background:${verticalBarConfig.style.chart.backgroundColor};color:${verticalBarConfig.style.chart.color}`" >

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
                    data-cy="vertical-bar-text-title"
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
                    data-cy="vertical-bar-text-subtitle"
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
                    :data-cy="`vertical-bar-rect-underlayer-${i}`"
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
                    :data-cy="`vertical-bar-datalabel-${i}`"
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
                    :data-cy="`vertical-bar-trap-${i}`"
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
                <Legend
                    :legendSet="immutableDataset"
                    :config="legendConfig"
                    @clickMarker="({ legend }) => segregate(legend.id)"
                >
                    <template #item="{ legend }">
                        <div @click="segregate(legend.id)" :style="`opacity:${segregated.includes(legend.id) ? 0.5 : 1}`">
                            {{ legend.name }} : {{verticalBarConfig.style.chart.legend.prefix}}{{ legend.value.toFixed(verticalBarConfig.style.chart.legend.roundingValue) }}{{verticalBarConfig.style.chart.legend.suffix}}
                        </div>
                    </template>
                </Legend>
            </foreignObject>
            <slot name="svg" :svg="svg"/>
        </svg>

         <!-- LEGEND AS DIV : BOTTOM -->
         <Legend
            v-if="verticalBarConfig.style.chart.legend.show && (!mutableConfig.inside || isPrinting) && verticalBarConfig.style.chart.legend.position === 'bottom'"
            :legendSet="immutableDataset"
            :config="legendConfig"
            @clickMarker="({ legend }) => segregate(legend.id)"
        >
            <template #item="{ legend }">
                <div @click="segregate(legend.id)" :style="`opacity:${segregated.includes(legend.id) ? 0.5 : 1}`">
                    {{ legend.name }} : {{verticalBarConfig.style.chart.legend.prefix}}{{ legend.value.toFixed(verticalBarConfig.style.chart.legend.roundingValue) }}{{verticalBarConfig.style.chart.legend.suffix}}
                </div>
            </template>
        </Legend>

        <!-- TOOLTIP -->
        <Tooltip
            :show="verticalBarConfig.style.chart.tooltip.show && isTooltip && segregated.length < props.dataset.length"
            :backgroundColor="verticalBarConfig.style.chart.tooltip.backgroundColor"
            :color="verticalBarConfig.style.chart.tooltip.color"
            :parent="verticalBarChart"
            :content="tooltipContent"
        />

        <!-- DATA TABLE -->
        <div  class="vue-ui-vertical-bar-table" :style="`width:100%;margin-top:${mutableConfig.inside ? '48px' : ''}`" v-if="mutableConfig.showTable">
            <table>
                <thead data-cy="vertical-bar-thead">
                    <tr v-if="verticalBarConfig.style.chart.title.text">
                        <th :colspan="7" :style="`background:${verticalBarConfig.table.th.backgroundColor};color:${verticalBarConfig.table.th.color};outline:${verticalBarConfig.table.th.outline}`">
                            <span>{{ verticalBarConfig.style.chart.title.text }}</span>
                            <span v-if="verticalBarConfig.style.chart.title.subtitle.text">
                                : {{ verticalBarConfig.style.chart.title.subtitle.text }}
                            </span>
                        </th>
                    </tr>
                    <tr data-cy="vertical-bar-thead-tr">
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

path, line, rect, circle, polygon {
    animation: verticalBarAnimation 0.5s ease-in-out;
    transform-origin: center;
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
.vue-ui-vertical-bar {
    user-select: none;
    position: relative;
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

/** */

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

.vue-ui-dna * {
    animation: none !important;
}
.vue-data-ui-fullscreen--on {
    height: 80% !important;
}
.vue-data-ui-fullscreen--off {
    max-width: 100%;
}
</style>