<script setup>
import { ref, computed, nextTick, onMounted } from "vue";
import { 
    convertColorToHex, 
    createCsvContent, 
    createUid,
    dataLabel,
    downloadCsv,
    error,
    functionReturnsString,
    isFunction,
    objectIsEmpty,
    palette,
    XMLNS
} from "../lib.js";
import pdf from "../pdf";
import img from "../img";
import mainConfig from "../default_configs.json";
import { useNestedProp } from "../useNestedProp";
import Title from "../atoms/Title.vue";
import UserOptions from "../atoms/UserOptions.vue";
import Legend from "../atoms/Legend.vue";
import DataTable from "../atoms/DataTable.vue";
import Tooltip from "../atoms/Tooltip.vue";
import Skeleton from "./vue-ui-skeleton.vue";

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

const isDataset = computed(() => {
    return !!props.dataset && props.dataset.length;
})

onMounted(() => {
    if(objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiOnion',
            type: 'dataset'
        })
    }
})

const uid = ref(createUid());
const defaultConfig = ref(mainConfig.vue_ui_onion);

const isImaging = ref(false);
const isPrinting = ref(false);
const onionChart = ref(null);
const details = ref(null);
const step = ref(0);
const isTooltip = ref(false);
const tooltipContent = ref("");

const onionConfig = computed(() => {
    return useNestedProp({
        userConfig: props.config,
        defaultConfig: defaultConfig.value
    });
});

const mutableConfig = ref({
    inside: !onionConfig.value.style.chart.layout.useDiv,
    showTable: onionConfig.value.table.show
});

const svg = computed(() => {
    const p = mutableConfig.value.inside  ? 80 : 64;
    return {
        height: 512,
        width: 512,
        padding: {
            top: p,
            left: p,
            right: p,
            bottom: p,
        }
    }
});

const drawableArea = computed(() => {
    const minRadius = 64;
    return {
        top: svg.value.padding.top,
        left: svg.value.padding.left,
        right: svg.value.width - svg.value.padding.right,
        bottom: svg.value.height - svg.value.padding.bottom,
        centerX: svg.value.width / 2, 
        centerY: svg.value.height / 2,
        width: svg.value.width - svg.value.padding.right - svg.value.padding.left,
        height: svg.value.height - svg.value.padding.bottom - svg.value.padding.top,
        minRadius,
        maxRadius: (svg.value.width - svg.value.padding.right - svg.value.padding.left)
    }
});


const immutableDataset = computed(() => {

    props.dataset.forEach((ds, i) => {
        if([null, undefined].includes(ds.name)){
            error({
                componentName: 'VueUiOnion',
                type: 'datasetSerieAttribute',
                property: 'name',
                index: i
            })
        }
        if([undefined].includes(ds.percentage)) {
            error({
                componentName: 'VueUiOnion',
                type: 'datasetSerieAttribute',
                property: 'percentage',
                index: i
            })
        }
    })

    return props.dataset.map((onion, i) => {
        const id = `onion_serie_${i}_${uid.value}`;
        return {
            ...onion,
            percentage: onion.percentage || 0,
            color: convertColorToHex(onion.color) || palette[i],
            id,
            shape: 'circle',
            opacity: segregated.value.includes(id) ? 0.5 : 1,
            absoluteIndex: i,
            segregate: () => segregate(id),
            isSegregated: segregated.value.includes(id)
        }
    })
});

const legendConfig = computed(() => {
    return {
        cy: 'onion-div-legend',
        backgroundColor: onionConfig.value.style.chart.legend.backgroundColor,
        color: onionConfig.value.style.chart.legend.color,
        fontSize: onionConfig.value.style.chart.legend.fontSize,
        paddingBottom: 12,
        fontWeight: onionConfig.value.style.chart.legend.bold ? 'bold' : ''
    }
})

const segregated = ref([]);

const mutableCount = computed(() => {
    return immutableDataset.value.filter(onion => !segregated.value.includes(onion.id)).length;
});

const onionSkin = computed(() => {
    return {
        gutter: drawableArea.value.width / 2 / immutableDataset.value.length * onionConfig.value.style.chart.layout.gutter.width,
        track: drawableArea.value.width / 2 / immutableDataset.value.length * onionConfig.value.style.chart.layout.track.width,
    }
});

const mutableDataset = computed(() => {
    return immutableDataset.value
        .filter(onion => !segregated.value.includes(onion.id))
        .map((onion, i) => {
            const radius = (((drawableArea.value.maxRadius - onionSkin.value.track) / mutableCount.value) / 2) * (1+i);
            const labelY = (drawableArea.value.centerY) - ((drawableArea.value.centerY - drawableArea.value.top - onionConfig.value.style.chart.layout.labels.fontSize) / mutableCount.value * (i + 1));
            return {
                percentage: onion.percentage || 0,
                ...onion,
                labelY,
                radius,
                path: peelOnion(radius, onion.percentage || 0)
            }
        });
});

function peelOnion(radius, percentage) {
    const circumference = radius * (1.5 + (percentage / 100 > 1 / 3 ? 0 : 1 - percentage / 100)) * Math.PI;
    const bg = radius * 1.5 * Math.PI;
    return {
        bgDashArray: `${bg} ${bg}`,
        bgDashOffset: bg - percentage / 100 * bg,
        dashArray: `${circumference} ${circumference}`,
        dashOffset: circumference - percentage / 100 * circumference,
        fullOffset: 0,
        active: `M${drawableArea.value.centerX},${drawableArea.value.centerY} A ${radius},${radius} 0 0 0 ${drawableArea.value.right},${drawableArea.value.top}`,
    }
}

const emit = defineEmits(['selectLegend']);

function segregate(id) {
    if(segregated.value.includes(id)) {
        segregated.value = segregated.value.filter(el => el !== id);
    }else {
        segregated.value.push(id)
    }
    emit('selectLegend', mutableDataset.value)
}

function getData() {
    return mutableDataset.value;
}

const table = computed(() => {
    const head = [onionConfig.value.table.translations.serie, onionConfig.value.table.translations.percentage, onionConfig.value.table.translations.value];

    const body = mutableDataset.value.map(onion => {
        return [
            onion.name,
            onion.percentage,
            onion.value
        ]
    });
    return { head, body };
});

const dataTable = computed(() => {
    const head = table.value.head;

    const body = mutableDataset.value.map(ds => {
        return [
            `<span style="color:${ds.color}">⬤</span> ${ds.name}`,
            `${Number(ds.percentage ?? 0).toFixed(onionConfig.value.table.td.roundingPercentage).toLocaleString()}%`,
            `${ds.prefix || ''}${![null, undefined, NaN, 'NaN'].includes(ds.value) ? (ds.value.toFixed(onionConfig.value.table.td.roundingValue)).toLocaleString() : '-'}${ds.suffix || ''}`
        ]
    })

    const config = {
        th: {
            backgroundColor: onionConfig.value.table.th.backgroundColor,
            color: onionConfig.value.table.th.color,
            outline: onionConfig.value.table.th.outline
        },
        td: {
            backgroundColor: onionConfig.value.table.td.backgroundColor,
            color: onionConfig.value.table.td.color,
            outline: onionConfig.value.table.td.outline
        },
        breakpoint: onionConfig.value.table.responsiveBreakpoint
    }

    return { head, body, config, colNames: head}
})

const __to__ = ref(null);

function showSpinnerPdf() {
    isPrinting.value = true;
}

function generatePdf(){
    showSpinnerPdf();
    clearTimeout(__to__.value);
    __to__.value = setTimeout(() => {
        pdf({
            domElement: document.getElementById(`vue-ui-onion_${uid.value}`),
            fileName: onionConfig.value.style.chart.title.text || 'vue-ui-onion'
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
            domElement: document.getElementById(`vue-ui-onion_${uid.value}`),
            fileName: onionConfig.value.style.chart.title.text || 'vue-ui-onion',
            format: 'png'
        }).finally(() => {
            isImaging.value = false;
        })
    }, 100)
}

function generateCsv() {
    nextTick(() => {
        const title = [[onionConfig.value.style.chart.title.text], [onionConfig.value.style.chart.title.subtitle.text], [""]];
        const head = table.value.head;
        const body = table.value.body;
        const tableXls = title.concat([head]).concat(body);
        const csvContent = createCsvContent(tableXls);
        downloadCsv({ csvContent, title: onionConfig.value.style.chart.title.text || 'vue-ui-onion'})
    });
}

const selectedSerie = ref(undefined);

const isFullscreen = ref(false)
function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
}

const dataTooltipSlot = ref(null);

function useTooltip({ datapoint, seriesIndex, show = true }) {
    const absoluteIndex = datapoint.absoluteIndex;
    selectedSerie.value = seriesIndex;

    dataTooltipSlot.value = {
        datapoint,
        seriesIndex: absoluteIndex,
        series: immutableDataset.value,
        config: onionConfig.value
    }

    isTooltip.value = show;

    let html = "";

    const customFormat = onionConfig.value.style.chart.tooltip.customFormat;

    if (isFunction(customFormat) && functionReturnsString(() => customFormat({
        seriesIndex: absoluteIndex,
        datapoint,
        series: immutableDataset.value,
        config: onionConfig.value
    }))) {
        tooltipContent.value = customFormat({
            seriesIndex: absoluteIndex,
            datapoint,
            series: immutableDataset.value,
            config: onionConfig.value
        })
    } else {
        const showPercentage = onionConfig.value.style.chart.tooltip.showPercentage;
        const showValue = onionConfig.value.style.chart.tooltip.showValue;

        html += `<div style="width: 100%; border-bottom: 1px solid #ccc; padding-bottom: 6px;margin-bottom:3px;display:flex;flex-direction:row;gap:3px;align-items:center"><svg viewBox="0 0 12 12" height="14" width="14"><circle data-cy="donut-tooltip-marker" cx="6" cy="6" r="6" stroke="none" fill="${datapoint.color}"/></svg><span></span>${datapoint.name}</span></div>`;
        html += `<div style="width:100%;text-align:left;"><b>${showPercentage ? dataLabel({p: '', v: datapoint.percentage, s: '%', r: onionConfig.value.style.chart.tooltip.roundingPercentage}) : ''}</b> ${showPercentage && showValue ? '(' : ''}${showValue ? dataLabel({ p: datapoint.prefix || '', v: datapoint.value, s: datapoint.suffix || '', r: onionConfig.value.style.chart.tooltip.roundingValue }) : ''}${showPercentage && showValue ? ')' : ''}</div>`

        tooltipContent.value = `<div>${html}</div>`
    }
}

defineExpose({
    getData,
    generatePdf,
    generateCsv,
    generateImage
});

</script>

<template>
    <div 
        :class="`vue-ui-onion ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''} ${onionConfig.useCssAnimation ? '' : 'vue-ui-dna'}`" 
        ref="onionChart" 
        :id="`vue-ui-onion_${uid}`"
        :style="`font-family:${onionConfig.style.fontFamily};width:100%; text-align:center;background:${onionConfig.style.chart.backgroundColor}`"
    >
        <!-- TITLE AS DIV -->
        <div v-if="(!mutableConfig.inside || isPrinting) && onionConfig.style.chart.title.text" :style="`width:100%;background:${onionConfig.style.chart.backgroundColor}`">
            <Title
                :config="{
                    title: {
                        cy: 'onion-div-title',
                        text: onionConfig.style.chart.title.text,
                        color: onionConfig.style.chart.title.color,
                        fontSize: onionConfig.style.chart.title.fontSize,
                        bold: onionConfig.style.chart.title.bold
                    },
                    subtitle: {
                        cy: 'onion-div-subtitle',
                        text: onionConfig.style.chart.title.subtitle.text,
                        color: onionConfig.style.chart.title.subtitle.color,
                        fontSize: onionConfig.style.chart.title.subtitle.fontSize,
                        bold: onionConfig.style.chart.title.subtitle.bold
                    },
                }"
            />
        </div>
        
        <!-- OPTIONS -->
        <UserOptions
            ref="details"
            :key="`user_options${step}`"
            v-if="onionConfig.userOptions.show && isDataset"
            :backgroundColor="onionConfig.style.chart.backgroundColor"
            :color="onionConfig.style.chart.color"
            :isImaging="isImaging"
            :isPrinting="isPrinting"
            :title="onionConfig.userOptions.title"
            :uid="uid"
            :hasImg="true"
            hasTable
            hasFullscreen
            :isFullscreen="isFullscreen"
            :chartElement="onionChart"
            @toggleFullscreen="toggleFullscreen"
            @generatePdf="generatePdf"
            @generateCsv="generateCsv"
            @generateImage="generateImage"
            @toggleTable="mutableConfig.showTable = !mutableConfig.showTable"
        />

        <!-- CHART -->
        <svg :xmlns="XMLNS" v-if="isDataset" :class="{ 'vue-data-ui-fullscreen--on': isFullscreen, 'vue-data-ui-fulscreen--off': !isFullscreen }" :viewBox="`0 0 ${svg.width} ${svg.height}`" :style="`max-width:100%;overflow:visible;background:${onionConfig.style.chart.backgroundColor};color:${onionConfig.style.chart.color}`" >

            <!-- TITLE AS G -->
            <g v-if="onionConfig.style.chart.title.text && mutableConfig.inside && !isPrinting">
                <text
                    data-cy="onion-text-title"
                    :font-size="onionConfig.style.chart.title.fontSize"
                    :fill="onionConfig.style.chart.title.color"
                    :x="svg.width / 2"
                    :y="onionConfig.style.chart.title.fontSize"
                    text-anchor="middle"
                    :style="`font-weight:${onionConfig.style.chart.title.bold ? 'bold' : ''}`"
                >
                    {{ onionConfig.style.chart.title.text }}
                </text>
                <text
                    data-cy="onion-text-subtitle"
                    v-if="onionConfig.style.chart.title.subtitle.text"
                    :font-size="onionConfig.style.chart.title.subtitle.fontSize"
                    :fill="onionConfig.style.chart.title.subtitle.color"
                    :x="svg.width / 2"
                    :y="onionConfig.style.chart.title.fontSize * 2"
                    text-anchor="middle"
                    :style="`font-weight:${onionConfig.style.chart.title.subtitle.bold ? 'bold' : ''}`"
                >
                    {{ onionConfig.style.chart.title.subtitle.text }}
                </text>
            </g>

            <!-- GUTTERS -->
            <circle 
                v-for="(onion, i) in mutableDataset" 
                :data-cy="`onion-track-${i}`"
                :cx="drawableArea.centerX" 
                :cy="drawableArea.centerY" 
                :r="onion.radius" 
                :stroke="onionConfig.style.chart.layout.gutter.color" 
                :stroke-width="onionSkin.gutter" 
                fill="none"
                :stroke-dasharray="onion.path.bgDashArray"
                :stroke-dashoffset="onion.path.fullOffset"
                stroke-linecap="round"
                :class="{'vue-ui-onion-path': true, 'vue-ui-onion-blur': onionConfig.useBlurOnHover && ![null, undefined].includes(selectedSerie) && selectedSerie !== i}"
                style="transform:rotate(-90deg);transform-origin: 50% 50%"
            />
            
            <!-- TRACKS -->
            <circle 
                v-for="(onion, i) in mutableDataset" 
                :cx="drawableArea.centerX" 
                :cy="drawableArea.centerY" 
                :r="onion.radius" 
                :stroke="`${onion.color}`" 
                :stroke-width="onionSkin.track" 
                fill="none"
                :stroke-dasharray="onion.path.dashArray"
                :stroke-dashoffset="onion.path.dashOffset"
                :class="{'vue-ui-onion-path': true, 'vue-ui-onion-blur': onionConfig.useBlurOnHover && ![null, undefined].includes(selectedSerie) && selectedSerie !== i}"
                stroke-linecap="round"
                style="transform:rotate(-90deg);transform-origin: 50% 50%"
            />

            <!-- GRADIENT -->
            <defs>
                <filter :id="`blur_${uid}`" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur in="SourceGraphic" :stdDeviation="100 / onionConfig.style.chart.gradientIntensity" />
                </filter>
            </defs>

            <g :filter="`url(#blur_${uid})`" v-if="onionConfig.style.chart.useGradient">
                <circle
                    v-for="(onion, i) in mutableDataset" 
                    :cx="drawableArea.centerX" 
                    :cy="drawableArea.centerY" 
                    :r="onion.radius" 
                    :stroke="`white`" 
                    :stroke-width="onionSkin.track / 3" 
                    fill="none"
                    stroke-linecap="round"
                    :stroke-dasharray="onion.path.dashArray"
                    :stroke-dashoffset="onion.path.dashOffset"
                    style="transform:rotate(-90deg);transform-origin: 50% 50%;"
                />
            </g>
            
            <!-- TOOLTIP TRAPS -->
            <circle 
                v-for="(onion, i) in mutableDataset" 
                data-cy-trap
                :data-cy="`onion-track-${i}`"
                :cx="drawableArea.centerX" 
                :cy="drawableArea.centerY" 
                :r="onion.radius" 
                stroke="transparent" 
                :stroke-width="Math.max(onionSkin.track, onionSkin.gutter)" 
                fill="none"
                :stroke-dasharray="onion.path.bgDashArray"
                :stroke-dashoffset="onion.path.fullOffset"
                stroke-linecap="round"
                class="vue-ui-onion-path"
                style="transform:rotate(-90deg);transform-origin: 50% 50%"
                @mouseenter="useTooltip({
                    datapoint: onion,
                    show: true,
                    seriesIndex: i,
                })"
                @mouseleave="selectedSerie = undefined; isTooltip = false"
            />

            <!-- LABELS -->
            <g v-if="onionConfig.style.chart.layout.labels.show">
                <g v-for="(onion, i) in mutableDataset">                
                    <text
                        v-if="!segregated.includes(onion.id)"
                        :x="svg.width / 2 - onionSkin.gutter * 0.8 + onionConfig.style.chart.layout.labels.offsetX"
                        :y="onion.labelY + onionConfig.style.chart.layout.labels.offsetY"
                        text-anchor="end"
                        :font-size="onionConfig.style.chart.layout.labels.fontSize"
                        :fill="onionConfig.useBlurOnHover && ![null, undefined].includes(selectedSerie) && selectedSerie === i ? onion.color:  onionConfig.style.chart.layout.labels.color"
                        :font-weight="onionConfig.style.chart.layout.labels.bold ? 'bold' : 'normal'"
                    >
                        {{ onion.name }} {{ onionConfig.style.chart.layout.labels.percentage.show ? ` : ${(onion.percentage || 0).toFixed(onionConfig.style.chart.layout.labels.roundingPercentage)}%` : '' }} {{ !onionConfig.style.chart.layout.labels.percentage.show && onionConfig.style.chart.layout.labels.value.show ? ` : ${onion.value ? `${onion.prefix || ""}${onion.value.toFixed(onionConfig.style.chart.layout.labels.roundingValue)}${onion.suffix || ""}` : '' }` : `${onionConfig.style.chart.layout.labels.value.show ? onion.value ? `(${onion.prefix || ""}${onion.value.toFixed(onionConfig.style.chart.layout.labels.roundingValue)}${onion.suffix || ""})` : '' : ''}` }}
                    </text>
                </g>
            </g>

            <!-- LEGEND AS G -->
            <foreignObject 
                v-if="onionConfig.style.chart.legend.show && mutableConfig.inside && !isPrinting"
                :x="0"
                :y="drawableArea.bottom + onionConfig.style.chart.legend.offsetY"
                width="100%"
                :height="svg.height - drawableArea.bottom"
                style="overflow:visible"
            >
                <Legend
                    :legendSet="immutableDataset"
                    :config="legendConfig"
                    @clickMarker="({legend}) => segregate(legend.id)"
                >
                    <template #item="{ legend }">
                        <div @click="legend.segregate" :style="`opacity:${segregated.includes(legend.id) ? 0.5 : 1}`">
                            {{ legend.name }} : {{ (legend.percentage || 0).toFixed(onionConfig.style.chart.legend.roundingPercentage) }}%


                        </div>
                    </template>
                </Legend>
            </foreignObject>
            <slot name="svg" :svg="svg"/>
        </svg>

        <Skeleton
            v-if="!isDataset"
            :config="{
                type: 'onion',
                style: {
                    backgroundColor: onionConfig.style.chart.backgroundColor,
                    onion: {
                        color: onionConfig.style.chart.layout.gutter.color
                    }
                }
            }"
        />

        <!-- LEGEND AS DIV -->
        <Legend
            v-if="onionConfig.style.chart.legend.show && (!mutableConfig.inside || isPrinting)"
            :legendSet="immutableDataset"
            :config="legendConfig"
            @clickMarker="({legend}) => segregate(legend.id)"
        >
            <template #item="{ legend }">
                <div data-cy-legend-item @click="legend.segregate()" :style="`opacity:${segregated.includes(legend.id) ? 0.5 : 1}`">
                    {{ legend.name }} : {{ (legend.percentage || 0).toFixed(onionConfig.style.chart.legend.roundingPercentage) }}%
                </div>
            </template>
        </Legend>

        <slot name="legend" v-bind:legend="immutableDataset"></slot>

        <!-- TOOLTIP -->
        <Tooltip
            :show="onionConfig.style.chart.tooltip.show && isTooltip"
            :backgroundColor="onionConfig.style.chart.tooltip.backgroundColor"
            :color="onionConfig.style.chart.tooltip.color"
            :fontSize="onionConfig.style.chart.tooltip.fontSize"
            :parent="onionChart"
            :content="tooltipContent"
            :isCustom="isFunction(onionConfig.style.chart.tooltip.customFormat)"
        >
            <template #tooltip-before>
                <slot name="tooltip-before" v-bind="{...dataTooltipSlot}"></slot>
            </template>
            <template #tooltip-after>
                <slot name="tooltip-after" v-bind="{...dataTooltipSlot}"></slot>
            </template>
        </Tooltip>

        <!-- DATA TABLE -->
        <div class="vue-ui-onion-table" :style="`width:100%;margin-top:${mutableConfig.inside ? '48px' : ''}`" v-if="mutableConfig.showTable && isDataset">
            <DataTable
                :colNames="dataTable.colNames"
                :head="dataTable.head"
                :body="dataTable.body"
                :config="dataTable.config"
                :title="`${onionConfig.style.chart.title.text}${onionConfig.style.chart.title.subtitle.text ? ` : ${onionConfig.style.chart.title.subtitle.text}` : ''}`"
            >
                <template #th="{ th }">
                    {{ th }}
                </template>
                <template #td="{ td }">
                    <div v-html="td"/>
                </template>
            </DataTable>
        </div>
    </div>
</template>

<style scoped>
@import "../vue-data-ui.css";

.vue-ui-onion *{
    transition: unset;
}
.vue-ui-onion {
    user-select: none;
    position: relative;
}

circle {
    animation: xyAnimation 0.5s ease-in-out;
    transform-origin: center;
    transition: all 0.3s ease-in-out !important;
}
@keyframes xyAnimation {
    0% {
        transform: scale(0.9,0.9) rotate(-90g);
        opacity: 0;
    }
    80% {
        transform: scale(1.02,1.02) rotate(-90deg);
        opacity: 1;
    }
    to {
        transform: scale(1,1) rotate(-90deg);
        opacity: 1;
    }
}
.vue-ui-onion .vue-ui-onion-label {
    align-items: center;
    display: flex;
    flex-direction: column;
    height:100%;
    justify-content: center;
    text-align:center;
    width:100%;
}

.vue-ui-onion-tooltip {
    border: 1px solid #e1e5e8;
    border-radius: 4px;
    box-shadow: 0 6px 12px -6px rgba(0,0,0,0.2);
    max-width: 300px;
    position: fixed;
    padding:12px;
    z-index:1;
}

/** */

.vue-ui-onion table {
    width: 100%;
    border-collapse:collapse;
}
.vue-ui-onion table td {
    text-align:right;
    padding-right: 6px;
    font-variant-numeric: tabular-nums;
}
.vue-ui-onion table th {
    position: sticky;
    top:0;
    font-weight: 400;
    user-select: none;
}

.vue-ui-onion-blur {
    filter: blur(3px) opacity(50%) grayscale(100%);
    transition: all 0.15s ease-in-out;
}
</style>