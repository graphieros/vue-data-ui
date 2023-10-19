<script setup>
import { ref, computed, nextTick } from "vue";
import { treeShake, convertConfigColors, convertColorToHex, palette, opacity, makeXls } from "../lib.js";
import pdf from "../pdf";
import mainConfig from "../default_configs.json";

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

const uid = ref(`vue-ui-onion-${Math.random()}`);

const defaultConfig = ref(mainConfig.vue_ui_onion);

const isPrinting = ref(false);
const onionChart = ref(null);
const details = ref(null);

const onionConfig = computed(() => {
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
    return props.dataset.map((onion, i) => {
        return {
            ...onion,
            color: convertColorToHex(onion.color) || palette[i],
            id: `onion_serie_${i}_${uid.value}`,
        }
    })
});

const segregated = ref([]);

const mutableCount = computed(() => {
    return immutableDataset.value.filter(onion => !segregated.value.includes(onion.id)).length;
});

const onionSkin = computed(() => {
    return {
        gutter: drawableArea.value.width / 2 / mutableCount.value * onionConfig.value.style.chart.layout.gutter.width,
        track: drawableArea.value.width / 2 / mutableCount.value * onionConfig.value.style.chart.layout.track.width,
    }
});

const mutableDataset = computed(() => {
    return immutableDataset.value
        .filter(onion => !segregated.value.includes(onion.id))
        .map((onion, i) => {
            const radius = (((drawableArea.value.maxRadius - onionSkin.value.track) / mutableCount.value) / 2) * (1+i);
            const labelY = (drawableArea.value.centerY) - ((drawableArea.value.centerY - drawableArea.value.top - onionConfig.value.style.chart.layout.labels.fontSize) / mutableCount.value * (i + 1));
            return {
                ...onion,
                labelY,
                radius,
                path: peelOnion(radius, onion.percentage)
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

defineExpose({
    getData
});

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

function generatePdf(){
    isPrinting.value = true;
    nextTick(() => {
        pdf({
            domElement: document.getElementById(`vue-ui-onion_${uid.value}`),
            fileName: onionConfig.value.style.chart.title.text || 'vue-ui-onion'
        }).finally(() => {
            isPrinting.value = false;
        });
    })
}

function generateXls() {
    nextTick(() => {
        const title = [[onionConfig.value.style.chart.title.text], [onionConfig.value.style.chart.title.subtitle.text], [""]];
        const head = table.value.head;
        const body = table.value.body;
        const tableXls = title.concat([head]).concat(body);
        makeXls(tableXls, onionConfig.value.style.chart.title.text || 'vue-ui-onion');
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
        class="vue-ui-onion" 
        ref="onionChart" 
        :id="`vue-ui-onion_${uid}`"
        :style="`font-family:${onionConfig.style.fontFamily};width:100%; text-align:center;${onionConfig.userOptions.show ? 'padding-top:36px' : ''}`"
    >
        <!-- TITLE AS DIV -->
        <div v-if="(!mutableConfig.inside || isPrinting) && onionConfig.style.chart.title.text" :style="`width:100%;background:${onionConfig.style.chart.backgroundColor}`">
            <div :style="`width:100%;text-align:center;color:${onionConfig.style.chart.title.color};font-size:${onionConfig.style.chart.title.fontSize}px;font-weight:${onionConfig.style.chart.title.bold ? 'bold': ''}`">
                {{ onionConfig.style.chart.title.text }}
            </div>
            <div v-if="onionConfig.style.chart.title.subtitle.text" :style="`width:100%;text-align:center;color:${onionConfig.style.chart.title.subtitle.color};font-size:${onionConfig.style.chart.title.subtitle.fontSize}px;font-weight:${onionConfig.style.chart.title.subtitle.bold ? 'bold': ''}`">
                {{ onionConfig.style.chart.title.subtitle.text }}
            </div>
        </div>
        
        <!-- OPTIONS -->
        <details class="vue-ui-onion-user-options" :style="`background:${onionConfig.style.chart.backgroundColor};color:${onionConfig.style.chart.color}`" data-html2canvas-ignore v-if="onionConfig.userOptions.show" ref="details">
            <summary :style="`background:${onionConfig.style.chart.backgroundColor};color:${onionConfig.style.chart.color}`">{{ onionConfig.userOptions.title }}</summary>
            <div class="vue-ui-onion-user-options-items" :style="`background:${onionConfig.style.chart.backgroundColor};color:${onionConfig.style.chart.color}`">
                <div class="vue-ui-onion-user-option-item">
                    <input type="checkbox" :id="`vue-ui-onion-option-title_${uid}`" :name="`vue-ui-onion-option-title_${uid}`"
                    v-model="mutableConfig.inside">
                    <label :for="`vue-ui-onion-option-title_${uid}`">{{ onionConfig.userOptions.labels.useDiv }}</label>
                </div>
                <div class="vue-ui-onion-user-option-item">
                    <input type="checkbox" :id="`vue-ui-onion-option-table_${uid}`" :name="`vue-ui-onion-option-table_${uid}`"
                    v-model="mutableConfig.showTable">
                    <label :for="`vue-ui-onion-option-table_${uid}`">{{ onionConfig.userOptions.labels.showTable }}</label>
                </div>
                <button class="vue-ui-onion-button" @click="generatePdf" :disabled="isPrinting" style="margin-top:12px" :style="`background:${onionConfig.style.chart.backgroundColor};color:${onionConfig.style.chart.color}`">
                    <svg class="vue-ui-onion-print-icon" xmlns="http://www.w3.org/2000/svg" v-if="isPrinting" width="20" height="20" viewBox="0 0 24 24" stroke-width="1.5" :stroke="onionConfig.style.chart.color" fill="none" stroke-linecap="round" stroke-linejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                        <path d="M18 16v.01" />
                        <path d="M6 16v.01" />
                        <path d="M12 5v.01" />
                        <path d="M12 12v.01" />
                        <path d="M12 1a4 4 0 0 1 2.001 7.464l.001 .072a3.998 3.998 0 0 1 1.987 3.758l.22 .128a3.978 3.978 0 0 1 1.591 -.417l.2 -.005a4 4 0 1 1 -3.994 3.77l-.28 -.16c-.522 .25 -1.108 .39 -1.726 .39c-.619 0 -1.205 -.14 -1.728 -.391l-.279 .16l.007 .231a4 4 0 1 1 -2.212 -3.579l.222 -.129a3.998 3.998 0 0 1 1.988 -3.756l.002 -.071a4 4 0 0 1 -1.995 -3.265l-.005 -.2a4 4 0 0 1 4 -4z" />
                    </svg>
                    <span v-else>PDF</span>
                </button>
                <button class="vue-ui-onion-button" @click="generateXls" :style="`background:${onionConfig.style.chart.backgroundColor};color:${onionConfig.style.chart.color}`">
                    XLSX
                </button>
            </div>
        </details>

        <!-- CHART -->
        <svg :viewBox="`0 0 ${svg.width} ${svg.height}`" :style="`max-width:100%;overflow:visible;background:${onionConfig.style.chart.backgroundColor};color:${onionConfig.style.chart.color}`" @click="closeDetails">

            <defs>
                <radialGradient :id="`onion_gradient_${uid}`">
                    <stop offset="0%" :stop-color="`${convertColorToHex(onionConfig.style.chart.backgroundColor)}00`" />
                    <stop offset="90%" :stop-color="'#FFFFFF' + opacity[onionConfig.style.chart.gradientIntensity]" />
                    <stop offset="100%" :stop-color="`${convertColorToHex(onionConfig.style.chart.backgroundColor)}00`" />
                </radialGradient>
            </defs>

            <!-- TITLE AS G -->
            <g v-if="onionConfig.style.chart.title.text && mutableConfig.inside && !isPrinting">
                <text
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
                v-for="onion in mutableDataset" 
                :cx="drawableArea.centerX" 
                :cy="drawableArea.centerY" 
                :r="onion.radius" 
                :stroke="onionConfig.style.chart.layout.gutter.color" 
                :stroke-width="onionSkin.gutter" 
                fill="none"
                :stroke-dasharray="onion.path.bgDashArray"
                :stroke-dashoffset="onion.path.fullOffset"
                stroke-linecap="round"
                class="vue-ui-onion-path"
                style="transform:rotate(-90deg);transform-origin: 50% 50%"
            />
            
            <!-- TRACKS -->
            <circle 
                v-for="onion in mutableDataset" 
                :cx="drawableArea.centerX" 
                :cy="drawableArea.centerY" 
                :r="onion.radius" 
                :stroke="`${onion.color}`" 
                :stroke-width="onionSkin.track" 
                fill="none"
                :stroke-dasharray="onion.path.dashArray"
                :stroke-dashoffset="onion.path.dashOffset"
                class="vue-ui-onion-path"
                stroke-linecap="round"
                style="transform:rotate(-90deg);transform-origin: 50% 50%"
            />

            <!-- GRADIENT -->
            <g v-if="onionConfig.style.chart.useGradient">            
                <circle 
                    v-for="onion in mutableDataset" 
                    :cx="drawableArea.centerX" 
                    :cy="drawableArea.centerY" 
                    :r="onion.radius * 1.1" 
                    stroke="none" 
                    :fill="`url(#onion_gradient_${uid})`"
                    style="transform:rotate(-90deg);transform-origin: 50% 50%"
                />
            </g>

            <!-- LABELS -->
            <g v-if="onionConfig.style.chart.layout.labels.show">
                <g v-for="onion in mutableDataset">                
                    <text
                        v-if="!segregated.includes(onion.id)"
                        :x="svg.width / 2 - onionSkin.gutter * 0.8 + onionConfig.style.chart.layout.labels.offsetX"
                        :y="onion.labelY"
                        text-anchor="end"
                        :font-size="onionConfig.style.chart.layout.labels.fontSize"
                        :fill="onionConfig.style.chart.layout.labels.color"
                        :font-weight="onionConfig.style.chart.layout.labels.bold ? 'bold' : 'normal'"
                    >
                        {{ onion.name }} {{ onionConfig.style.chart.layout.labels.percentage.show ? ` : ${onion.percentage.toFixed(onionConfig.style.chart.layout.labels.roundingPercentage)}%` : '' }} {{ !onionConfig.style.chart.layout.labels.percentage.show && onionConfig.style.chart.layout.labels.value.show ? ` : ${onion.value ? `${onion.prefix || ""}${onion.value.toFixed(onionConfig.style.chart.layout.labels.roundingValue)}${onion.suffix || ""}` : '' }` : `${onionConfig.style.chart.layout.labels.value.show ? onion.value ? `(${onion.prefix || ""}${onion.value.toFixed(onionConfig.style.chart.layout.labels.roundingValue)}${onion.suffix || ""})` : '' : ''}` }}
                    </text>
                </g>
            </g>

            <!-- LEGEND AS G -->
            <foreignObject 
                v-if="onionConfig.style.chart.legend.show && mutableConfig.inside && !isPrinting"
                :x="0"
                :y="drawableArea.bottom"
                width="100%"
                :height="svg.height - drawableArea.bottom"
                style="overflow:visible"
            >
                <div class="vue-ui-onion-legend" :style="`color:${onionConfig.style.chart.legend.color};font-size:${onionConfig.style.chart.legend.fontSize}px;padding-bottom:12px;font-weight:${onionConfig.style.chart.legend.bold ? 'bold' : ''}`" @click="closeDetails">
                    <div v-for="(legendItem, i) in immutableDataset" class="vue-ui-onion-legend-item" @click="segregate(legendItem.id)" :style="`opacity:${segregated.includes(legendItem.id) ? 0.5 : 1}`">
                        <svg viewBox="0 0 12 12" height="14" width="14"><circle cx="6" cy="6" r="6" stroke="none" :fill="legendItem.color"/></svg>
                        <span>{{ legendItem.name }} : </span>
                        <span>{{ legendItem.percentage.toFixed(onionConfig.style.chart.legend.roundingPercentage) }}% </span>
                    </div>
                </div>
            </foreignObject>

        </svg>

        <!-- LEGEND AS DIV -->
        <div v-if="onionConfig.style.chart.legend.show && (!mutableConfig.inside || isPrinting)" class="vue-ui-onion-legend" :style="`background:${onionConfig.style.chart.legend.backgroundColor};color:${onionConfig.style.chart.legend.color};font-size:${onionConfig.style.chart.legend.fontSize}px;padding-bottom:12px;font-weight:${onionConfig.style.chart.legend.bold ? 'bold' : ''}`" @click="closeDetails">
            <div v-for="(legendItem, i) in immutableDataset" class="vue-ui-onion-legend-item" @click="segregate(legendItem.id)" :style="`opacity:${segregated.includes(legendItem.id) ? 0.5 : 1}`">
                <svg viewBox="0 0 12 12" height="14" width="14"><circle cx="6" cy="6" r="6" stroke="none" :fill="legendItem.color"/></svg>
                <span>{{ legendItem.name }} : </span>
                <span>{{ legendItem.percentage.toFixed(onionConfig.style.chart.legend.roundingPercentage) }}% </span>
            </div>
        </div>
        

        <!-- DATA TABLE -->
        <div @click="closeDetails" class="vue-ui-onion-table" :style="`width:100%;margin-top:${mutableConfig.inside ? '48px' : ''}`" v-if="mutableConfig.showTable">
            <table>
                <thead>
                    <tr v-if="onionConfig.style.chart.title.text">
                        <th colspan="3" :style="`background:${onionConfig.table.th.backgroundColor};color:${onionConfig.table.th.color};outline:${onionConfig.table.th.outline}`">
                            <span>{{ onionConfig.style.chart.title.text }}</span>
                            <span v-if="onionConfig.style.chart.title.subtitle.text">
                                : {{ onionConfig.style.chart.title.subtitle.text }}
                            </span>
                        </th>
                    </tr>
                    <tr>
                        <th v-for="th in table.head" :colspan="th.color ? 2 : 1" :style="`background:${onionConfig.table.th.backgroundColor};color:${onionConfig.table.th.color};outline:${onionConfig.table.th.outline}`">
                            {{ th }}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="onion in mutableDataset">
                        <td :style="`background:${onionConfig.table.td.backgroundColor};color:${onionConfig.table.td.color};outline:${onionConfig.table.td.outline}`">
                                <span :style="`color:${onion.color}`">
                                    ⬤
                                </span>
                                {{ onion.name }}
                        </td>
                        <td :style="`background:${onionConfig.table.td.backgroundColor};color:${onionConfig.table.td.color};outline:${onionConfig.table.td.outline}`">
                            {{ !isNaN(onion.percentage) ? onion.percentage.toFixed(onionConfig.table.td.roundingPercentage) : "" }}%
                        </td>
                        <td :style="`background:${onionConfig.table.td.backgroundColor};color:${onionConfig.table.td.color};outline:${onionConfig.table.td.outline}`">
                            {{ onion.prefix }}{{ !isNaN(onion.value) ? onion.value.toFixed(onionConfig.table.td.roundingValue) : "" }}{{ onion.suffix }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<style scoped>
.vue-ui-onion *{
    transition: unset;
}
.vue-ui-onion {
    user-select: none;
    position: relative;
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
.vue-ui-onion-legend {
    height: 100%;
    width:100%;
    display: flex;
    align-items:center;
    flex-wrap: wrap;
    justify-content:center;
    column-gap: 18px;
}
.vue-ui-onion-legend-item {
    display: flex;
    align-items:center;
    gap: 6px;
    cursor: pointer;
    height: 24px;
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
.vue-ui-onion-user-options {
    border-radius: 4px;
    padding: 6px 12px;
    position: absolute;
    right:0;
    top:0px;
    max-width: 300px;
    text-align:left;
}
.vue-ui-onion-user-options[open] {
    border: 1px solid #e1e5e8;
    box-shadow: 0 6px 12px -6px rgba(0,0,0,0.2);
}
.vue-ui-onion summary {
    text-align: right;
    direction: rtl;
}
.vue-ui-onion-user-options-items {
    width: 100%;
    display: flex;
    flex-direction: column;
    margin-top: 6px;
}
.vue-ui-onion-user-options-item {
    width: 100%;
    display: flex;
    flex-direction: row;
    gap: 5px;
    align-items:center;
}

.vue-ui-onion-button {
    margin: 6px 0;
    border-radius: 3px;
    height: 30px;
    border: 1px solid #b9bfc4;
    background: inherit;
    display: flex;
    align-items:center;
    justify-content: center;
}
.vue-ui-onion-button:hover {
    background: rgba(0,0,0,0.05);
}
.vue-ui-onion-print-icon {
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

</style>