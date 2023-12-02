<script setup>
import { ref, computed, onMounted } from "vue";
import { palette, rotateMatrix, addVector, matrixTimes, opacity, convertColorToHex } from "../lib.js";
import pdf from "../pdf";
import mainConfig from "../default_configs.json";
import { useNestedProp } from "../useNestedProp";
import UserOptions from "../atoms/UserOptions.vue";

const props = defineProps({
    config:{
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
const uid = ref(`vue-ui-gauge-${Math.random()}`);

const defaultConfig = ref(mainConfig.vue_ui_gauge);

const isPrinting = ref(false);
const gaugeChart = ref(null);
const details = ref(null);

const gaugeConfig = computed(() => {
    return useNestedProp({
        userConfig: props.config,
        defaultConfig: defaultConfig.value
    });
});

const mutableConfig = ref({
    inside: !gaugeConfig.value.style.chart.layout.useDiv,
});

const mutableDataset = computed(() => {
    const arr = [];
    props.dataset.series.forEach(serie => {
        arr.push(serie.from);
        arr.push(serie.to);
    });
    const max = Math.max(...arr);
    return {
        ...props.dataset,
        series: props.dataset.series.map((serie, i) => {
            return {
                ...serie,
                color: convertColorToHex(serie.color) || palette[i],
                value: ((serie.to - serie.from) / max) * 100,
            }
        })
    }
});

const svg = computed(() => {
    return {
        height: mutableConfig.value.inside ? 512 : 358.4,
        width: 512,
        top: mutableConfig.value.inside ? 76.8 : 0,
        bottom: mutableConfig.value.inside ? 435.2 : 358.4,
        centerX: mutableConfig.value.inside ? 256 : 179.2,
        centerY: 256
    }
});

const max = ref(0);
const min = ref(0);

const activeRating = ref(gaugeConfig.value.style.chart.animation.use ? 0 : props.dataset.value);

const pointer = computed(() => {
    const x = svg.value.width / 2;
    const y = svg.value.height * 0.69;
    const angle = Math.PI * ((activeRating.value + 0 - min.value) / (max.value - min.value)) + Math.PI;
    return {
        x1: x,
        y1: y,
        x2: x + (svg.value.width / 3.2 * gaugeConfig.value.style.chart.layout.pointer.size) * Math.cos(angle),
        y2: y + (svg.value.width / 3.2 * gaugeConfig.value.style.chart.layout.pointer.size) * Math.sin(angle)
    }
});

const ratingColor = computed(() => {
    for(let i = 0; i < mutableDataset.value.series.length; i += 1) {
        const { color, from, to } = mutableDataset.value.series[i];
        if(activeRating.value >= from && activeRating.value <= to) {
            return color;
        }
    }
    return "#2D353C";
});

onMounted(() => {
    // throw error if ! props.dataset.value
    const arr = [];
    mutableDataset.value.series.forEach(serie => {
        arr.push(serie.from);
        arr.push(serie.to);
    });
    max.value = Math.max(...arr);
    min.value = Math.min(...arr);
    const strLen = String(max.value).length;
    let acceleration = 0;
    let speed = (strLen > 2 ? 0.01 : 0.001) * gaugeConfig.value.style.chart.animation.speed;
    let incr = (strLen > 2 ? 0.05 : 0.005) * gaugeConfig.value.style.chart.animation.acceleration;
    function animate() {
        activeRating.value += speed + acceleration;
        acceleration += incr;
        if (activeRating.value < props.dataset.value) {
            requestAnimationFrame(animate);
        } else {
            activeRating.value = props.dataset.value;
        }
    }
    if (gaugeConfig.value.style.chart.animation.use) {
        activeRating.value = min.value;
        animate();
    }
});

function createArc([cx, cy], [rx, ry], [position, ratio], phi) {
    ratio = ratio % Math.PI;
    const rotMatrix = rotateMatrix(phi);
    const [sX, sY] = addVector(
    matrixTimes(rotMatrix, [
        rx * Math.cos(position),
        ry * Math.sin(position),
    ]),
    [cx, cy]
    );
    const [eX, eY] = addVector(
    matrixTimes(rotMatrix, [
        rx * Math.cos(position + ratio),
        ry * Math.sin(position + ratio),
    ]),
    [cx, cy]
    );
    const fA = ratio > Math.PI ? 1 : 0;
    const fS = ratio > 0 ? 1 : 0;
    return {
        startX: sX,
        startY: sY,
        endX: eX,
        endY: eY,
        path: `M${sX} ${sY} A ${[
            rx,
            ry,
            (phi / (2 * Math.PI)) * 180,
            fA,
            fS,
            eX,
            eY,
        ].join(" ")}`,
    };
}

function makeDonut(item, cx, cy, rx, ry) {
    let { series } = item;
    if(!item.base) {
        item.base = 1;
    }
    if (!series || item.base === 0)
        return {
            ...series,
            proportion: 0,
            ratio: 0,
            path: "",
            startX: 0,
            startY: 0,
            endX: 0,
            center: {},
        };
        const sum = [...series]
        .map((serie) => serie.value)
        .reduce((a, b) => a + b, 0);
        
        const ratios = [];
        let acc = 0;
        for (let i = 0; i < series.length; i += 1) {
        let proportion = series[i].value / sum;
        const ratio = proportion * (Math.PI * 0.975);
        const midProportion = series[i].value / 2 / sum;
        const midRatio = midProportion * (Math.PI);
        const { startX, startY, endX, endY, path } = createArc(
            [cx, cy],
            [rx, ry],
            [acc, ratio],
            110
        );
        ratios.push({
            ...series[i],
            proportion,
            ratio: ratio,
            path,
            startX,
            startY,
            endX,
            endY,
            center: createArc(
            [cx, cy],
            [rx, ry],
            [acc, midRatio],
            110
            ),
        });
        acc += ratio;
        }
    return ratios;
}

function calcMarkerPositionY(index, y, value) {
    const isBig = String(value).length > 2;
    const offset = isBig ? -3 : 0;
    if(index === 0)  {
        return y +14 + offset;
    }
    return y + 9 + offset;
}

function calcMarkerFontSize(value) {
    if(String(value).length > 2) {
        return 15;
    }
    return 20;
}

function generatePdf(){
    isPrinting.value = true;
    pdf({
        domElement: document.getElementById(`vue-ui-gauge_${uid.value}`),
        fileName: gaugeConfig.value.style.chart.title.text || 'vue-ui-gauge'
    }).finally(() => {
        isPrinting.value = false;
    });
}

defineExpose({
    generatePdf
});

</script>

<template>
    <div 
        class="vue-ui-gauge"
        ref="gaugeChart"
        :id="`vue-ui-gauge_${uid}`"
        :style="`font-family:${gaugeConfig.style.fontFamily};width:100%; text-align:center`"
    >
        <!-- TITLE AS DIV -->
        <div v-if="(!mutableConfig.inside || isPrinting) && gaugeConfig.style.chart.title.text" :style="`width:100%;background:${gaugeConfig.style.chart.backgroundColor};padding-bottom:12px;${gaugeConfig.userOptions.show ? 'padding-top:36px' : ''}`">
            <div data-cy="gauge-div-title" :style="`width:100%;text-align:center;color:${gaugeConfig.style.chart.title.color};font-size:${gaugeConfig.style.chart.title.fontSize}px;font-weight:${gaugeConfig.style.chart.title.bold ? 'bold': ''}`">
                {{ gaugeConfig.style.chart.title.text }}
            </div>
            <div data-cy="gauge-div-subtitle" v-if="gaugeConfig.style.chart.title.subtitle.text" :style="`width:100%;text-align:center;color:${gaugeConfig.style.chart.title.subtitle.color};font-size:${gaugeConfig.style.chart.title.subtitle.fontSize}px;font-weight:${gaugeConfig.style.chart.title.subtitle.bold ? 'bold': ''}`">
                {{ gaugeConfig.style.chart.title.subtitle.text }}
            </div>
            <div data-cy="gauge-div-base" v-if="!isNaN(dataset.base)" :style="`width:100%;text-align:center;color:${gaugeConfig.style.chart.title.subtitle.color};font-size:${gaugeConfig.style.chart.title.subtitle.fontSize}px;font-weight:${gaugeConfig.style.chart.title.subtitle.bold ? 'bold': ''}`">
                {{ gaugeConfig.translations.base }} : {{ dataset.base }}
            </div>
        </div>

        <!-- OPTIONS -->
        <UserOptions
            ref="details"
            v-if="gaugeConfig.userOptions.show"
            :backgroundColor="gaugeConfig.style.chart.backgroundColor"
            :color="gaugeConfig.style.chart.color"
            :isPrinting="isPrinting"
            :title="gaugeConfig.userOptions.title"
            :uid="uid"
            :hasXls="false"
            @generatePdf="generatePdf"
        >
            <template #checkboxes>
                <div class="vue-ui-options-item">
                    <input data-cy="gauge-checkbox-title" type="checkbox" :id="`vue-ui-gauge-option-title_${uid}`" :name="`vue-ui-gauge-option-title_${uid}`"
                    v-model="mutableConfig.inside">
                    <label :for="`vue-ui-gauge-option-title_${uid}`">{{ gaugeConfig.userOptions.labels.useDiv }}</label>
                </div>
            </template>
        </UserOptions>

        <!-- CHART -->
        <svg :viewBox="`0 0 ${svg.width} ${svg.height}`" :style="`max-width:100%;overflow:hidden !important;background:${gaugeConfig.style.chart.backgroundColor};color:${gaugeConfig.style.chart.color}`">

            <defs>
                <radialGradient :id="`gradient_${uid}`" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                    <stop offset="0%" :stop-color="`#FFFFFF${opacity[1]}`" />
                    <stop offset="80%" :stop-color="`#FFFFFF${opacity[gaugeConfig.style.chart.layout.track.gradientIntensity]}`" />
                    <stop offset="100%" :stop-color="`#FFFFFF${opacity[1]}`" />
                </radialGradient>
            </defs>

            <!-- TITLE AS G -->
            <g v-if="gaugeConfig.style.chart.title.text && mutableConfig.inside && !isPrinting">
                <text
                    data-cy="gauge-text-title"
                    :font-size="(gaugeConfig.style.chart.title.fontSize * 1.5)"
                    :fill="gaugeConfig.style.chart.title.color"
                    :x="svg.width / 2"
                    :y="(gaugeConfig.style.chart.title.fontSize * 1.5) + 20"
                    text-anchor="middle"
                    :style="`font-weight:${gaugeConfig.style.chart.title.bold ? 'bold' : ''}`"
                >
                    {{ gaugeConfig.style.chart.title.text }}
                </text>
                <text
                    data-cy="gauge-text-subtitle"
                    v-if="gaugeConfig.style.chart.title.subtitle.text"
                    :font-size="(gaugeConfig.style.chart.title.subtitle.fontSize * 1.5)"
                    :fill="gaugeConfig.style.chart.title.subtitle.color"
                    :x="svg.width / 2"
                    :y="(gaugeConfig.style.chart.title.fontSize * 1.5) * 2 + 20"
                    text-anchor="middle"
                    :style="`font-weight:${gaugeConfig.style.chart.title.subtitle.bold ? 'bold' : ''}`"
                >
                    {{ gaugeConfig.style.chart.title.subtitle.text }}
                </text>
                <text
                    data-cy="gauge-text-base"
                    v-if="!isNaN(dataset.base)"
                    :font-size="(gaugeConfig.style.chart.title.subtitle.fontSize * 1.5)"
                    :fill="gaugeConfig.style.chart.title.subtitle.color"
                    :x="svg.width / 2"
                    :y="gaugeConfig.style.chart.title.subtitle.text ? (gaugeConfig.style.chart.title.fontSize * 2.3) * 2 + 20 : (gaugeConfig.style.chart.title.fontSize * 1.5) * 2 + 20"
                    text-anchor="middle"
                    :style="`font-weight:${gaugeConfig.style.chart.title.subtitle.bold ? 'bold' : ''}`"
                >
                    {{ gaugeConfig.translations.base }} : {{ dataset.base }}
                </text>
            </g>

            <!-- ARC STEPS -->
            <path 
                v-for="(arc, i) in makeDonut(mutableDataset, svg.width / 2, svg.height * 0.7, svg.width / 2.5, svg.width / 2.5)" 
                :data-cy="`gauge-arc-${i}`"
                :key="`arc_${i}`"
                :d="arc.path"
                fill="none"
                :stroke="arc.color"
                stroke-linecap="round"
                :stroke-width="(svg.width / 16) * gaugeConfig.style.chart.layout.track.size"
            />
            
            <!-- GRADIENT -->
            <g v-if="gaugeConfig.style.chart.layout.track.useGradient">
                <circle :cx="svg.width / 2" :cy="svg.height * 0.69" r="225" :fill="`url(#gradient_${uid})`" stroke="none"/>
                <circle :cx="svg.width / 2" :cy="svg.height * 0.69 + 4" :r="188 * 1 / gaugeConfig.style.chart.layout.track.size" :fill="gaugeConfig.style.chart.backgroundColor" stroke="none"/>
                <rect :x="0" :y="svg.height * 0.69" :width="svg.width" :height="svg.height - svg.height * 0.69" :fill="gaugeConfig.style.chart.backgroundColor" stroke="none"/>
            </g>

            <!-- STEP MARKERS -->
            <circle 
                v-for="(arc, i) in makeDonut(mutableDataset, svg.width / 2, svg.height * 0.7, svg.width / 2.5, svg.width / 2.5)"
                :data-cy="`gauge-step-marker-${i}`"
                :cx="arc.center.startX"
                :cy="i === 0 ? arc.center.startY + 5 : arc.center.startY"
                :r="(svg.width / 31) * gaugeConfig.style.chart.layout.track.size * gaugeConfig.style.chart.layout.markers.size"
                :fill="gaugeConfig.style.chart.layout.markers.backgroundColor"
                :stroke="gaugeConfig.style.chart.layout.markers.stroke"
                :stroke-width="gaugeConfig.style.chart.layout.markers.strokeWidth"
            />
            <circle
                data-cy="gauge-step-marker-last"
                :cx="svg.width * 0.9"
                :cy="svg.height * 0.69"
                :r="(svg.width / 31) * gaugeConfig.style.chart.layout.track.size * gaugeConfig.style.chart.layout.markers.size"
                :fill="gaugeConfig.style.chart.layout.markers.backgroundColor"
                :stroke="gaugeConfig.style.chart.layout.markers.stroke"
                :stroke-width="gaugeConfig.style.chart.layout.markers.strokeWidth"
            />
            <text
                v-for="(arc, i) in makeDonut(mutableDataset, svg.width / 2, svg.height * 0.7, svg.width / 2.5, svg.width / 2.5)"
                :data-cy="`gauge-step-marker-label-${i}`"
                :x="arc.center.startX"
                :y="calcMarkerPositionY(i, arc.center.startY, arc.from) + gaugeConfig.style.chart.layout.markers.offsetY"
                text-anchor="middle"
                :font-size="calcMarkerFontSize(arc.from) * gaugeConfig.style.chart.layout.markers.fontSizeRatio"
                :font-weight="`${gaugeConfig.style.chart.layout.markers.bold ? 'bold' : 'normal'}`"
                :fill="gaugeConfig.style.chart.layout.markers.color"
            >
                {{ arc.from.toFixed(gaugeConfig.style.chart.layout.markers.roundingValue) }}
            </text>
            <text
                data-cy="gauge-step-marker-label-last"
                :x="svg.width * 0.9"
                :y="calcMarkerPositionY(1, svg.height * 0.69, max) + gaugeConfig.style.chart.layout.markers.offsetY"
                text-anchor="middle"
                :font-size="calcMarkerFontSize(max) * gaugeConfig.style.chart.layout.markers.fontSizeRatio"
                :font-weight="`${gaugeConfig.style.chart.layout.markers.bold ? 'bold' : 'normal'}`"
                :fill="gaugeConfig.style.chart.layout.markers.color"
            >
                {{ max.toFixed(gaugeConfig.style.chart.layout.markers.roundingValue) }}
            </text>

            <!-- GAUGE POINTER -->
            <line
                data-cy="gauge-pointer-border"
                v-if="!isNaN(pointer.x2)"
                :x1="pointer.x1"
                :y1="pointer.y1"
                :x2="pointer.x2"
                :y2="pointer.y2"
                :stroke="gaugeConfig.style.chart.layout.pointer.stroke"
                :stroke-width="gaugeConfig.style.chart.layout.pointer.strokeWidth"
                stroke-linecap="round"
            />
            <line
                data-cy="gauge-pointer"
                v-if="!isNaN(pointer.x2)"
                :x1="pointer.x1"
                :y1="pointer.y1"
                :x2="pointer.x2"
                :y2="pointer.y2"
                :stroke="gaugeConfig.style.chart.layout.pointer.useRatingColor ? ratingColor : gaugeConfig.style.chart.layout.pointer.color"
                stroke-linecap="round"
                :stroke-width="gaugeConfig.style.chart.layout.pointer.strokeWidth * 0.7"
            />
            <circle
                data-cy="gauge-pointer-circle"
                :cx="svg.width / 2"
                :cy="(svg.height) * 0.69"
                :fill="gaugeConfig.style.chart.layout.pointer.circle.color"
                :r="gaugeConfig.style.chart.layout.pointer.circle.radius"
                :stroke-width="gaugeConfig.style.chart.layout.pointer.circle.strokeWidth"
                :stroke="gaugeConfig.style.chart.layout.pointer.circle.stroke"
            />

            <!-- GAUGE RATING --> 
            <text
                data-cy="gauge-score"
                :x="svg.width / 2"
                :y="(svg.height) * 0.9"
                text-anchor="middle"
                :font-size="gaugeConfig.style.chart.legend.fontSize"
                font-weight="bold"
                :fill="gaugeConfig.style.chart.legend.useRatingColor ? ratingColor : gaugeConfig.style.chart.legend.color"
            >
                {{ gaugeConfig.style.chart.legend.prefix }} {{ gaugeConfig.style.chart.legend.showPlusSymbol && activeRating > 0 ? '+' : '' }}{{ activeRating.toFixed(gaugeConfig.style.chart.legend.roundingValue) }} {{ gaugeConfig.style.chart.legend.suffix }}
            </text>

        </svg>
    </div>
</template>

<style scoped>
.vue-ui-gauge *{
    transition: unset;
}
.vue-ui-gauge {
    user-select: none;
    position: relative;
}
.vue-ui-gauge .vue-ui-gauge-label {
    align-items: center;
    display: flex;
    flex-direction: column;
    height:100%;
    justify-content: center;
    text-align:center;
    width:100%;
}
.vue-ui-gauge-legend {
    height: 100%;
    width:100%;
    display: flex;
    align-items:center;
    flex-wrap: wrap;
    justify-content:center;
    column-gap: 18px;
}
.vue-ui-gauge-legend-item {
    display: flex;
    align-items:center;
    justify-content: center;
    gap: 6px;
    cursor: pointer;
    height: 24px;
}
.vue-ui-gauge-tooltip {
    border: 1px solid #e1e5e8;
    border-radius: 4px;
    box-shadow: 0 6px 12px -6px rgba(0,0,0,0.2);
    max-width: 300px;
    position: fixed;
    padding:12px;
    z-index:1;
}
</style>