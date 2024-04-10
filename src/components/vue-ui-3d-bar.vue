<script setup>
import { ref, computed, onMounted, nextTick } from "vue";
import { 
    convertColorToHex, 
    createCsvContent,
    createUid,
    darkenHexColor,
    dataLabel,
    downloadCsv,
    error,
    lightenHexColor,
    objectIsEmpty, 
palette
} from '../lib';
import pdf from "../pdf";
import img from "../img";
import mainConfig from "../default_configs.json";
import Title from "../atoms/Title.vue";
import { useNestedProp } from "../useNestedProp";
import UserOptions from "../atoms/UserOptions.vue";
import Skeleton from "./vue-ui-skeleton.vue";
import DataTable from "../atoms/DataTable.vue";

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
    },
});

const emits = defineEmits(['selectDatapoint'])

const isDataset = computed(() => {
    return !!props.dataset && Object.keys(props.dataset).length;
})

const uid = ref(createUid());

const defaultConfig = ref(mainConfig.vue_ui_3d_bar);

const isPrinting = ref(false);
const isImaging = ref(false);
const details = ref(null);
const bar3dChart = ref(null);

const barConfig = computed(() => {
    return useNestedProp({
        userConfig: props.config,
        defaultConfig: defaultConfig.value
    });
});

const mutableConfig = ref({
    showTable: barConfig.value.table.show
})

const hasStack = computed(() => {
    return props.dataset.series && props.dataset.series.length;
});

const svg = computed(() => {
    return {
        height: barConfig.value.style.chart.box.dimensions.height,
        width: barConfig.value.style.chart.box.dimensions.width,
        absoluteWidth: barConfig.value.style.chart.box.dimensions.width * (hasStack.value ? 2 : 1 ),
        top: barConfig.value.style.chart.box.dimensions.top,
        bottom: barConfig.value.style.chart.box.dimensions.bottom,
        left: barConfig.value.style.chart.box.dimensions.left,
        right: barConfig.value.style.chart.box.dimensions.right,
        perspective: barConfig.value.style.chart.box.dimensions.perspective
    }
});

const stack = computed(() => {
    if(hasStack.value) {
        const total = props.dataset.series.map(s => s.value || 0).reduce((a, b) => a + b, 0);
        const formatted = props.dataset.series.map((ds, i) => {
            return {
                ...ds,
                id: createUid(),
                proportion: (ds.value || 0) / total,
                color: convertColorToHex(ds.color) || palette[i] || palette[i % palette.length]
            }
        })
        .sort((a, b) => b.value - a.value)
        const res = [];
        let start = 0;
        for(let i = 0; i < formatted.length; i += 1) {
            res.push({
                ...formatted[i],
                fill: createFill(start, formatted[i].proportion)
            });
            start += formatted[i].proportion
        }
        return res
    }
    return null
})

const box = computed(() => {
    return {
        right: `M${svg.value.width / 2},${svg.value.top} ${svg.value.width - svg.value.right}, ${svg.value.top + svg.value.perspective} ${svg.value.width - svg.value.right},${svg.value.height - svg.value.bottom - svg.value.perspective} ${svg.value.width / 2},${svg.value.height - svg.value.bottom}`,
        left: `M${svg.value.width / 2},${svg.value.top} ${svg.value.left},${svg.value.top + svg.value.perspective} ${svg.value.left},${svg.value.height - svg.value.bottom - svg.value.perspective} ${svg.value.width / 2},${svg.value.height - svg.value.bottom}`,
        side: `M${svg.value.width / 2},${svg.value.height - svg.value.bottom} ${svg.value.width / 2},${svg.value.top + (svg.value.perspective * 2)}`,
        topSides: `M${svg.value.left},${svg.value.top + svg.value.perspective} ${svg.value.width / 2},${svg.value.top + (svg.value.perspective * 2)} ${svg.value.width - svg.value.right},${svg.value.top + svg.value.perspective}`,
        tubeTop: `M${svg.value.left},${svg.value.top + svg.value.perspective} C ${svg.value.left},${svg.value.top - (svg.value.perspective / 3)} ${svg.value.width - svg.value.right},${svg.value.top - (svg.value.perspective / 3)} ${svg.value.width - svg.value.right},${svg.value.top + svg.value.perspective} C ${svg.value.width - svg.value.right},${svg.value.top + (svg.value.perspective * 2.3)} ${svg.value.left},${svg.value.top + (svg.value.perspective * 2.3)} ${svg.value.left},${svg.value.top + svg.value.perspective}`,
        tubeLeft: `M${svg.value.left},${svg.value.top + svg.value.perspective} ${svg.value.left},${svg.value.height - svg.value.bottom - svg.value.perspective}`,
        tubeRight: `M${svg.value.width - svg.value.right},${svg.value.top + svg.value.perspective} ${svg.value.width - svg.value.right},${svg.value.height - svg.value.bottom - svg.value.perspective}`,
        tubeBottom: `M${svg.value.width - svg.value.right},${svg.value.height - svg.value.bottom - svg.value.perspective} C ${svg.value.width - svg.value.right},${svg.value.height} ${svg.value.left},${svg.value.height} ${svg.value.left},${svg.value.height - svg.value.bottom - svg.value.perspective}`
    }
});

const activeValue = ref(barConfig.value.style.chart.animation.use ? 0 : props.dataset.percentage);

onMounted(() => {
    if(objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUi3dBar',
            type: 'dataset'
        })
    }

    let acceleration = 0;
    let speed = barConfig.value.style.chart.animation.speed;
    let incr = (0.005) * barConfig.value.style.chart.animation.acceleration;
    function animate() {
        activeValue.value += speed + acceleration;
        acceleration += incr;
        if(activeValue.value < props.dataset.percentage) {
            requestAnimationFrame(animate)
        } else {
            activeValue.value = props.dataset.percentage
        }
    }

    if(barConfig.value.style.chart.animation.use) {
        activeValue.value = 0;
        animate()
    }
})

function createFill(startProportion, proportion) {
    const height = svg.value.height - svg.value.bottom - svg.value.top - (svg.value.perspective * 2);
    const { width: W, height: H, bottom: B, right: R, left: L,  perspective: P} = svg.value;
    const relativeB = B + height * startProportion;

    return {
        sidePointer: {
            x: W - R,
            y: H - relativeB - P - (height * proportion /2),
            topY: H - relativeB - P - height * proportion,
            height: height * proportion
        },
        apexBottom: {y: H - relativeB, x: W / 2},
        apexTop: {y: H - relativeB - height * proportion, x: W / 2},
        right: `M${W / 2},${H - relativeB} ${W / 2},${H - relativeB - height * proportion} ${W - R},${H - relativeB - P - height * proportion} ${W - R},${H - relativeB - P}Z`,
        left: `M${W / 2},${H - relativeB} ${W / 2},${H - relativeB - height * proportion} ${L}, ${H - relativeB - P - height * proportion} ${L},${H - relativeB - P}Z`,
        liningTop: `M${L},${H - relativeB - P - height * proportion} ${W / 2},${H - relativeB - height * proportion} ${W - R},${H - relativeB - P - height * proportion}`,
        liningTopShade: `M${L},${H - relativeB - P - height * proportion -0.5} ${W / 2},${H - relativeB - height * proportion - 0.5} ${W - R},${H - relativeB - P - height * proportion - 0.5}`,
        top: `M${W / 2},${H - relativeB - height * proportion} ${L},${H - relativeB - P - height * proportion} ${W / 2},${H - relativeB - (P * 2) - (height * proportion)} ${W - R},${H - relativeB - P - height * proportion} Z`,
        tubeTop: `M${L},${H - relativeB - height * proportion - P} C ${L},${H - relativeB - height * proportion - (P *2.5)} ${W - R},${H - relativeB - height * proportion - (P * 2.5)} ${W - R},${H - relativeB - height * proportion - P} C ${W - R},${H - relativeB - height * proportion + P /2} ${L},${H - relativeB - height * proportion + P / 2} ${L},${H - relativeB - height * proportion - P}`,
        bottomTubeTop: `M ${W - R - 0.5},${H - relativeB - P} C ${W - R - 0.5},${H - relativeB + P/2} ${L},${H - relativeB + P/2} ${L + 0.5},${H - relativeB - P}`,
        tubeBody: `M
        ${L},${H - relativeB - height * proportion - P} 
        C ${L},${H - relativeB - height * proportion + P / 2} 
        ${W - R},${H - relativeB - height * proportion + P /2} 
        ${W - R},${H - relativeB - height * proportion - P} 
        L${W - R},${H - relativeB - P}
        C 
        ${W - R},${H - relativeB + P/2}
        ${L},${H - relativeB + P/2}
        ${L},${H - relativeB - P}Z`
    }
}

const fill = computed(() => {
    const proportion = activeValue.value / 100;
    const height = svg.value.height - svg.value.bottom - svg.value.top - (svg.value.perspective * 2);
    const { width: W, height: H, bottom: B, right: R, left: L,  perspective: P} = svg.value;

    const startProportion = 0;
    const relativeB = B + height * startProportion;

    return {
        right: `M${W / 2},${H - relativeB} ${W / 2},${H - relativeB - height * proportion} ${W - R},${H - relativeB - P - height * proportion} ${W - R},${H - relativeB - P}Z`,
        left: `M${W / 2},${H - relativeB} ${W / 2},${H - relativeB - height * proportion} ${L}, ${H - relativeB - P - height * proportion} ${L},${H - relativeB - P}Z`,
        top: `M${W / 2},${H - relativeB - height * proportion} ${L},${H - relativeB - P - height * proportion} ${W / 2},${H - relativeB - (P * 2) - (height * proportion)} ${W - R},${H - relativeB - P - height * proportion} Z`,
        tubeTop: `M${L},${H - relativeB - height * proportion - P} C ${L},${H - relativeB - height * proportion - (P *2.5)} ${W - R},${H - relativeB - height * proportion - (P * 2.5)} ${W - R},${H - relativeB - height * proportion - P} C ${W - R},${H - relativeB - height * proportion + P /2} ${L},${H - relativeB - height * proportion + P / 2} ${L},${H - relativeB - height * proportion - P}`,
        tubeBody: `M
        ${L},${H - relativeB - height * proportion - P} 
        C ${L},${H - relativeB - height * proportion + P / 2} 
        ${W - R},${H - relativeB - height * proportion + P /2} 
        ${W - R},${H - relativeB - height * proportion - P} 
        L${W - R},${H - P * 1.5}
        C 
        ${W - R},${H}
        ${L},${H}
        ${L},${H - relativeB - P}Z`
    }
});

const selectedSerie = ref(null);

function useTooltip(bar) {
    selectedSerie.value = bar.id;
    //
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
            domElement: document.getElementById(`3d_bar_${uid.value}`),
            fileName: barConfig.value.style.chart.title.text || 'vue-ui-3d-bar'
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
            domElement: document.getElementById(`3d_bar_${uid.value}`),
            fileName: barConfig.value.style.chart.title.text || 'vue-ui-3d-bar',
            format: 'png'
        }).finally(() => {
            isImaging.value = false;
        })
    }, 100)
}

const isFullscreen = ref(false)
function toggleFullscreen(state) {
    isFullscreen.value = state;
}

function getData() {
    if(hasStack.value) {
        return stack.value
    } else {
        return props.dataset.percentage
    }
}

const table = computed(() => {
    if(!hasStack.value) {
        return null
    } else {
        const head = stack.value.map(ds => {
            return {
                name: ds.name,
                color: ds.color
            }
        });
        const body = stack.value.map(ds => ds.value);
        return { head, body }
    }
});

function generateCsv() {
    if(!hasStack.value) {
        console.warn('VueUi3dBar : CSV download is only available in stack mode (providing dataset.series instead of dataset.percentage)');
        return;
    }
    nextTick(() => {
        const total = stack.value.map(ds => ds.value).reduce((a, b) => a + b, 0);
        const labels = table.value.head.map((h,i) => {
            return [[
                h.name
            ],[table.value.body[i]], [isNaN(table.value.body[i] / total) ? '-' : table.value.body[i] / total * 100]]
        });
        const tableXls = [[barConfig.value.style.chart.title.text],[barConfig.value.style.chart.title.subtitle.text],[[""],["val"],["%"]]].concat(labels);

        const csvContent = createCsvContent(tableXls);
        downloadCsv({ csvContent, title: barConfig.value.style.chart.title.text || "vue-ui-3d-bar" })
    });
}

const dataTable = computed(() => {
    const total = stack.value.map(ds => ds.value).reduce((a, b) => a + b, 0);
    const head = [
        ` <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18 16v2a1 1 0 0 1 -1 1h-11l6 -7l-6 -7h11a1 1 0 0 1 1 1v2" /></svg>`, dataLabel({p: barConfig.value.style.chart.legend.prefix, v: total, s: barConfig.value.style.chart.legend.suffix, r: barConfig.value.table.td.roundingValue}),
        '100%'
    ];

    const body = table.value.head.map((h,i) => {
        const label = dataLabel({p: barConfig.value.style.chart.legend.prefix, v: table.value.body[i], s: barConfig.value.style.chart.legend.suffix, r: barConfig.value.table.td.roundingValue});
        return [
            {
                color: h.color,
                name: h.name
            },
            label,
            isNaN(table.value.body[i] / total) ? "-" : (table.value.body[i] / total * 100).toFixed(barConfig.value.table.td.roundingPercentage) + '%'
        ]
    });

    const config = {
        th: {
            backgroundColor: barConfig.value.table.th.backgroundColor,
            color: barConfig.value.table.th.color,
            outline: barConfig.value.table.th.outline
        },
        td: {
            backgroundColor: barConfig.value.table.td.backgroundColor,
            color: barConfig.value.table.td.color,
            outline: barConfig.value.table.td.outline
        },
        breakpoint: barConfig.value.table.responsiveBreakpoint,
        shape: barConfig.value.style.shape === 'tube' ? 'circle' : 'square'
    }

    const colNames = [
        barConfig.value.table.columnNames.series,
        barConfig.value.table.columnNames.value,
        barConfig.value.table.columnNames.percentage
    ]

    return {
        colNames,
        head,
        body,
        config
    }
});

defineExpose({
    generateCsv,
    generatePdf,
    generateImage,
    getData
});


</script>

<template>
    <div ref="bar3dChart" :class="`vue-ui-3d-bar`" :style="`font-family:${barConfig.style.fontFamily};width:100%; text-align:center;background:${barConfig.style.chart.backgroundColor}`" :id="`3d_bar_${uid}`">

        <div v-if="barConfig.style.chart.title.text" :style="`width:100%;background:${barConfig.style.chart.backgroundColor}`">
            <!-- TITLE AS DIV -->
            <Title
                :config="{
                    title: {
                        cy: '3dBar-div-title',
                        text: barConfig.style.chart.title.text,
                        color: barConfig.style.chart.title.color,
                        fontSize: barConfig.style.chart.title.fontSize,
                        bold: barConfig.style.chart.title.bold
                    },
                    subtitle: {
                        cy: '3dBar-div-subtitle',
                        text: barConfig.style.chart.title.subtitle.text,
                        color: barConfig.style.chart.title.subtitle.color,
                        fontSize: barConfig.style.chart.title.subtitle.fontSize,
                        bold: barConfig.style.chart.title.subtitle.bold
                    }
                }"
            />
        </div>

        <!-- OPTIONS -->
        <UserOptions
            ref="details"
            v-if="barConfig.userOptions.show && isDataset"
            :backgroundColor="barConfig.style.chart.backgroundColor"
            :color="barConfig.style.chart.color"
            :isPrinting="isPrinting"
            :isImaging="isImaging"
            :title="barConfig.userOptions.title"
            :uid="uid"
            hasImg
            hasFullscreen
            :hasTable="!!hasStack"
            :chartElement="bar3dChart"
            @toggleFullscreen="toggleFullscreen"
            :hasXls="!!hasStack"
            @generatePdf="generatePdf"
            @generateCsv="generateCsv"
            @generateImage="generateImage"
            @toggleTable="mutableConfig.showTable = !mutableConfig.showTable"
        />

        <svg v-if="isDataset" :class="{ 'vue-data-ui-fullscreen--on': isFullscreen, 'vue-data-ui-fulscreen--off': !isFullscreen }" data-cy="3d-bar-svg" :viewBox="`0 0 ${svg.absoluteWidth} ${svg.height}`" :style="`max-width:100%; overflow: visible; background:${barConfig.style.chart.backgroundColor};color:${barConfig.style.chart.color}`">

            <!-- DEFS -->
            <defs>
                <radialGradient :id="`gradient_top${uid}`">
                    <stop offset="0%" :stop-color="`${convertColorToHex(barConfig.style.chart.backgroundColor)}00`" />
                    <stop offset="100%" :stop-color="`${barConfig.style.chart.bar.color}`" />
                </radialGradient>
                <radialGradient :id="`gradient_left${uid}`">
                    <stop offset="0%" :stop-color="`${convertColorToHex(barConfig.style.chart.backgroundColor)}00`" />
                    <stop offset="100%" :stop-color="`${barConfig.style.chart.bar.color}33`" />
                </radialGradient>
                <radialGradient :id="`gradient_right${uid}`">
                    <stop offset="0%" :stop-color="`${convertColorToHex(barConfig.style.chart.backgroundColor)}00`" />
                    <stop offset="100%" :stop-color="`${barConfig.style.chart.bar.color}33`" />
                </radialGradient>
                <linearGradient :id="`gradient_tube_body${uid}`" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" :stop-color="`${barConfig.style.chart.bar.color}`"/>
                    <stop offset="75%" :stop-color="`${convertColorToHex(barConfig.style.chart.backgroundColor)}00`"/>
                    <stop offset="100%" :stop-color="`${barConfig.style.chart.bar.color}66`"/>
                </linearGradient>
            </defs>

            <defs v-if="hasStack">
                <radialGradient v-for="bar in stack" :id="`grad_top_${bar.id}`">
                    <stop offset="0%" :stop-color="`${lightenHexColor(bar.color, 0.5)}DD`" />
                    <stop offset="100%" :stop-color="`${bar.color}`" />
                </radialGradient>
                <linearGradient v-for="bar in stack" :id="`grad_left_${bar.id}`">
                    <stop offset="0%" :stop-color="`${bar.color}DD`" />
                    <stop offset="100%" :stop-color="`${darkenHexColor(bar.color, 0.5)}FF`" />
                </linearGradient>
                <linearGradient v-for="bar in stack" :id="`grad_right_${bar.id}`">
                    <!-- <stop offset="0%" :stop-color="`${bar.color}DD`" /> -->
                    <stop offset="2%" :stop-color="`${lightenHexColor(bar.color, 0.5)}FF`" />
                    <stop offset="100%" :stop-color="`${bar.color}DD`" />
                </linearGradient>
                <linearGradient x1="0%" y1="0%" x2="0%" y2="100%" :id="`vertical_line_${uid}`">
                    <stop offset="0%" stop-color="#FFFFFF"/>
                    <stop offset="100%" stop-color="#FFFFFF33"/>
                </linearGradient>
            </defs>

            <text
                v-if="barConfig.style.chart.dataLabel.show && ![null, undefined].includes(props.dataset.percentage) && [null, undefined].includes(props.dataset.series)"
                :x="svg.width / 2"
                :y="svg.top - barConfig.style.chart.dataLabel.fontSize / 2"
                :font-size="barConfig.style.chart.dataLabel.fontSize"
                :font-weight="barConfig.style.chart.dataLabel.bold ? 'bold': 'normal'"
                :fill="barConfig.style.chart.dataLabel.color"
                text-anchor="middle"
            >
                {{Number((isNaN(activeValue) ? 0 : activeValue).toFixed(barConfig.style.chart.dataLabel.rounding)).toLocaleString() }} %
            </text>
            

            <g v-if="!barConfig.style.shape || barConfig.style.shape === 'bar'">            
                <!-- BOX SKELETON -->
                <g v-if="!hasStack">
                    <path :stroke-dasharray="barConfig.style.chart.box.strokeDasharray" :d="box.right" :stroke="barConfig.style.chart.box.stroke" :stroke-width="barConfig.style.chart.box.strokeWidth" stroke-linejoin="round" stroke-linecap="round" fill="none"/>
                    <path :stroke-dasharray="barConfig.style.chart.box.strokeDasharray" :d="box.left" :stroke="barConfig.style.chart.box.stroke" :stroke-width="barConfig.style.chart.box.strokeWidth" stroke-linejoin="round" stroke-linecap="round" fill="none"/>
                    <path :stroke-dasharray="barConfig.style.chart.box.strokeDasharray" :d="box.side" :stroke="barConfig.style.chart.box.stroke" :stroke-width="barConfig.style.chart.box.strokeWidth" stroke-linejoin="round" stroke-linecap="round" fill="none"/>
                    <path :stroke-dasharray="barConfig.style.chart.box.strokeDasharray" :d="box.topSides" :stroke="barConfig.style.chart.box.stroke" :stroke-width="barConfig.style.chart.box.strokeWidth" stroke-linejoin="round" stroke-linecap="round" fill="none"/>
                </g>

                <!-- FILL BOX -->
                <g v-if="!hasStack">
                    <path :d="fill.right" :stroke="barConfig.style.chart.bar.stroke" :stroke-width="barConfig.style.chart.bar.strokeWidth" stroke-linejoin="round" stroke-linecap="round" :fill="`url(#gradient_right${uid})`"/>
                    <path :d="fill.left" :stroke="barConfig.style.chart.bar.stroke" :stroke-width="barConfig.style.chart.bar.strokeWidth" stroke-linejoin="round" stroke-linecap="round" :fill="`url(#gradient_left${uid})`"/>
                    <path :d="fill.top" :stroke="barConfig.style.chart.bar.stroke" :stroke-width="barConfig.style.chart.bar.strokeWidth" stroke-linejoin="round" stroke-linecap="round" :fill="`url(#gradient_top${uid})`"/>
                </g>
                
                <g v-if="hasStack">
                    <g v-for="(bar, i) in stack" @mouseenter="useTooltip(bar)" @mouseout="selectedSerie = null" :style="`opacity:${selectedSerie ? selectedSerie === bar.id ? 1 : 0.3 : 1}`" class="vue-ui-3d-bar-stack" @click="emits('selectDatapoint', bar)">
                        <path :d="bar.fill.right" :fill="`url(#grad_right_${bar.id})`" @mouseenter="useTooltip(bar)" @mouseout="selectedSerie = null"/>
                        <path :d="bar.fill.left" :fill="`url(#grad_left_${bar.id})`" @mouseenter="useTooltip(bar)" @mouseout="selectedSerie = null"/>
                        <path :d="bar.fill.top" :fill="`url(#grad_top_${bar.id})`" @mouseenter="useTooltip(bar)" @mouseout="selectedSerie = null"/>
                        <path :d="bar.fill.liningTop" stroke="#FFFFFF" stroke-width="0.5" stroke-linecap="round" fill="none" @mouseenter="useTooltip(bar)" @mouseout="selectedSerie = null" />
                        
                        <path :d="`M ${bar.fill.apexTop.x},${bar.fill.apexTop.y} ${bar.fill.apexBottom.x},${bar.fill.apexBottom.y}`" :stroke="`#FFFFFF`" stroke-width="0.5" stroke-linecap="round"/> 
                    </g>
                    <g v-for="(bar, i) in stack">
                        <path v-if="i !== stack.length - 1" :d="bar.fill.liningTopShade" :stroke="barConfig.style.chart.bar.shadeColor" stroke-width="0.5" stroke-linecap="round" fill="none" style="pointer-events: none;" />
                    </g>
                    <!-- LEGEND -->
                    <g v-for="(bar, i) in stack" :style="`opacity:${selectedSerie ? selectedSerie === bar.id ? 1 : 0 : bar.proportion * 100 > barConfig.style.chart.legend.hideUnderPercentage ? 1 : 0}`" @click="emits('selectDatapoint', bar)">
                        <path :stroke="barConfig.style.chart.color" stroke-dasharray="1" stroke-width="0.5" stroke-linecap="round" :d="`M${bar.fill.sidePointer.x},${bar.fill.sidePointer.y} ${bar.fill.sidePointer.x + 20},${bar.fill.sidePointer.y}`"/>
                        <circle :cx="bar.fill.sidePointer.x + 20" :cy="bar.fill.sidePointer.y" :r="2" :fill="bar.color" :stroke="barConfig.style.chart.backgroundColor"/>
                        <foreignObject :x="bar.fill.sidePointer.x + 24" :y="bar.fill.sidePointer.y - barConfig.style.chart.legend.fontSize" :width="svg.absoluteWidth / 2 - 12" :height="barConfig.style.chart.legend.fontSize * 2" style="overflow: visible; position: relative">
                            <div v-if="barConfig.style.chart.legend.showDefault" :style="`height: 100%; width: 100%; display: flex; flex-direction: row; flex-wrap: wrap; align-items:center;justify-content: flex-start; font-size:${barConfig.style.chart.legend.fontSize}px; position: absolute; top:50%; left: 0; transform: translateY(-50%); text-align:left; line-height: ${barConfig.style.chart.legend.fontSize}px; color:${barConfig.style.chart.legend.color}`">
                                {{ bar.name }} : {{ dataLabel({v: bar.proportion * 100, s: '%', r: barConfig.style.chart.legend.roundingPercentage}) }} ({{ dataLabel({ p: barConfig.style.chart.legend.prefix, v: bar.value, s: barConfig.style.chart.legend.suffix, r: barConfig.style.chart.legend.roundingValue})}})
                            </div>
                            <slot name="legend" v-bind="{ datapoint: bar, config: barConfig, dataset: stack}"/>
                        </foreignObject>
                    </g>
                </g>
            </g>

            <g v-if="barConfig.style.shape === 'tube'">
                <g v-if="!hasStack">
                    <!-- TUBE SKELETON -->
                    <path :stroke-dasharray="barConfig.style.chart.box.strokeDasharray" :d="box.tubeTop" :stroke="barConfig.style.chart.box.stroke" :stroke-width="barConfig.style.chart.box.strokeWidth" stroke-linejoin="round" stroke-linecap="round" fill="none"/>
                    <path :stroke-dasharray="barConfig.style.chart.box.strokeDasharray" :d="box.tubeLeft" :stroke="barConfig.style.chart.box.stroke" :stroke-width="barConfig.style.chart.box.strokeWidth" stroke-linejoin="round" stroke-linecap="round" fill="none"/>
                    <path :stroke-dasharray="barConfig.style.chart.box.strokeDasharray" :d="box.tubeRight" :stroke="barConfig.style.chart.box.stroke" :stroke-width="barConfig.style.chart.box.strokeWidth" stroke-linejoin="round" stroke-linecap="round" fill="none"/>
                    <path :stroke-dasharray="barConfig.style.chart.box.strokeDasharray" :d="box.tubeBottom" :stroke="barConfig.style.chart.box.stroke" :stroke-width="barConfig.style.chart.box.strokeWidth" stroke-linejoin="round" stroke-linecap="round" fill="none"/>
                    <!-- FILL TUBE -->
                    <path :d="fill.tubeTop" :stroke="barConfig.style.chart.bar.stroke" :stroke-width="barConfig.style.chart.bar.strokeWidth" stroke-linejoin="round" stroke-linecap="round" :fill="`url(#gradient_top${uid})`"/>
                    <path :d="fill.tubeBody" :stroke="barConfig.style.chart.bar.stroke" :stroke-width="barConfig.style.chart.bar.strokeWidth" stroke-linejoin="round" stroke-linecap="round" :fill="`url(#gradient_tube_body${uid})`"/>
                </g>

                <g v-if="hasStack">
                    <g v-for="(bar, i) in stack" @mouseenter="useTooltip(bar)" @mouseout="selectedSerie = null" :style="`opacity:${selectedSerie ? selectedSerie === bar.id ? 1 : 0.3 : 1}`" class="vue-ui-3d-bar-stack" @click="emits('selectDatapoint', bar)">
                        <defs>
                            <radialGradient :id="`gradient_tube_top_${bar.id}`" fx="10%" cy="55%">
                                <stop offset="0%" :stop-color="`${lightenHexColor(bar.color, 0.5)}DD`" />

                                <stop offset="100%" :stop-color="`${darkenHexColor(bar.color, 0.1)}DD`" />
                            </radialGradient>
                            <linearGradient :id="`gradient_tube_body_${bar.id}`" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" :stop-color="`${bar.color}`"/>
                                <stop offset="10%" :stop-color="`${darkenHexColor(bar.color, 0.7)}FF`"/>
                                <stop offset="25%" :stop-color="`${darkenHexColor(bar.color, 0.5)}FF`"/>
                                <stop offset="75%" :stop-color="`${bar.color}DD`"/>
                                <stop offset="100%" :stop-color="`${lightenHexColor(bar.color, 0.7)}FF`"/>
                            </linearGradient>
                        </defs>
                        <path @mouseenter="useTooltip(bar)" @mouseout="selectedSerie = null" :d="bar.fill.tubeBody" stroke="#FFFFFF" :stroke-width="0.5" stroke-linejoin="round" stroke-linecap="round" :fill="`url(#gradient_tube_body_${bar.id})`"/>
                        <path @mouseenter="useTooltip(bar)" @mouseout="selectedSerie = null" :d="bar.fill.bottomTubeTop" stroke="#000000" :stroke-width="0.5" stroke-linejoin="round" stroke-linecap="round" fill="none" v-if="i > 0"/>
                        <path @mouseenter="useTooltip(bar)" @mouseout="selectedSerie = null" :d="bar.fill.tubeTop" stroke="#FFFFFF" :stroke-width="0.5" stroke-linejoin="round" stroke-linecap="round" :fill="`url(#gradient_tube_top_${bar.id})`"/>
                    </g>
                    <!-- LEGEND -->
                    <g v-for="(bar, i) in stack" :style="`opacity:${selectedSerie ? selectedSerie === bar.id ? 1 : 0 : bar.proportion * 100 > barConfig.style.chart.legend.hideUnderPercentage ? 1 : 0}`" @click="emits('selectDatapoint', bar)">
                        <path :stroke="barConfig.style.chart.color" stroke-dasharray="1" stroke-width="0.5" stroke-linecap="round" :d="`M${bar.fill.sidePointer.x},${bar.fill.sidePointer.y} ${bar.fill.sidePointer.x + 20},${bar.fill.sidePointer.y}`"/>
                        <circle :cx="bar.fill.sidePointer.x + 20" :cy="bar.fill.sidePointer.y" :r="selectedSerie === bar.id ? 3 : 2" :fill="bar.color" :stroke="barConfig.style.chart.backgroundColor"/>
                        <foreignObject :x="bar.fill.sidePointer.x + 24" :y="bar.fill.sidePointer.y - barConfig.style.chart.legend.fontSize" :width="svg.absoluteWidth / 2 - 12" :height="barConfig.style.chart.legend.fontSize * 2" style="overflow: visible; position: relative">
                            <div v-if="barConfig.style.chart.legend.showDefault" :style="`height: 100%; width: 100%; display: flex; flex-direction: row; flex-wrap: wrap; align-items:center;justify-content: flex-start; font-size:${barConfig.style.chart.legend.fontSize}px; position: absolute; top:50%; left: 0; transform: translateY(-50%); text-align:left; line-height: ${barConfig.style.chart.legend.fontSize}px; color:${barConfig.style.chart.legend.color}`">
                                {{ bar.name }} : {{ dataLabel({v: bar.proportion * 100, s: '%', r: barConfig.style.chart.legend.roundingPercentage}) }} ({{ dataLabel({ p: barConfig.style.chart.legend.prefix, v: bar.value, s: barConfig.style.chart.legend.suffix, r: barConfig.style.chart.legend.roundingValue})}})
                            </div>
                            <slot name="legend" v-bind="{ datapoint: bar, config: barConfig, dataset: stack}"/>
                        </foreignObject>
                    </g>
                </g>
            </g>

            <slot name="svg" :svg="svg"/>
        </svg>

        <Skeleton
            v-if="!isDataset"
            :config="{
                type: 'bar3d',
                style: {
                    backgroundColor: barConfig.style.chart.backgroundColor,
                    bar3d: {
                        color: '#CCCCCC'
                    }
                }
            }"
        />
        
        <!-- DATA TABLE -->
        <DataTable
            v-if="mutableConfig.showTable && hasStack"
            :colNames="dataTable.colNames"
            :head="dataTable.head" 
            :body="dataTable.body"
            :config="dataTable.config"
            :title="`${barConfig.style.chart.title.text}${barConfig.style.chart.title.subtitle.text ? ` : ${barConfig.style.chart.title.subtitle.text}` : ''}`"
        >
            <template #th="{ th }">
                <div v-html="th" style="display:flex;align-items:center"></div>
            </template>
            <template #td="{ td }">
                {{ td.name || td }}
            </template>
        </DataTable>
    </div>
</template>

<style scoped>
@import "../vue-data-ui.css";

.vue-ui-3d-bar *{
    transition: unset;
}
.vue-ui-3d-bar {
    user-select: none;
    position: relative;
}
.vue-ui-3d-bar-stack {
    transition: opacity 0.2s ease-in-out;
}
</style>