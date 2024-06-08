<script setup>
import { ref, computed, onMounted } from "vue";
import { 
    addVector, 
    convertColorToHex, 
    convertCustomPalette, 
    createUid,
    error,
    getMissingDatasetAttributes,
    matrixTimes,
    objectIsEmpty,
    opacity, 
    palette, 
    rotateMatrix,
    themePalettes,
    XMLNS
} from "../lib.js";
import pdf from "../pdf";
import img from "../img";
import mainConfig from "../default_configs.json";
import themes from "../themes.json";
import { useNestedProp } from "../useNestedProp";
import UserOptions from "../atoms/UserOptions.vue";
import Skeleton from "./vue-ui-skeleton.vue";

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

const isDataset = computed(() => {
    return !!props.dataset && Object.keys(props.dataset).length;
})

const uid = ref(createUid());

const defaultConfig = ref(mainConfig.vue_ui_gauge);

const isImaging = ref(false);
const isPrinting = ref(false);
const gaugeChart = ref(null);
const details = ref(null);
const step = ref(0);

const gaugeConfig = computed(() => {
    const mergedConfig = useNestedProp({
        userConfig: props.config,
        defaultConfig: defaultConfig.value
    });
    if (mergedConfig.theme) {
        return {
            ...useNestedProp({
                userConfig: themes.vue_ui_gauge[mergedConfig.theme] || props.config,
                defaultConfig: mergedConfig
            }),
            customPalette: themePalettes[mergedConfig.theme] || palette
        }
    } else {
        return mergedConfig;
    }
});

const customPalette = computed(() => {
    return convertCustomPalette(gaugeConfig.value.customPalette);
})

const mutableConfig = ref({
    inside: !gaugeConfig.value.style.chart.layout.useDiv,
});

const mutableDataset = computed(() => {

    if (!isDataset.value || objectIsEmpty(props.dataset.series || {})) {
        return {
            value:0,
            series: [
                {
                    from: 0,
                    to: 1
                }
            ]
        }
    }

    const arr = [];
    (props.dataset.series || []).forEach(serie => {
        arr.push(serie.from || 0);
        arr.push(serie.to || 0);
    });
    const max = Math.max(...arr);
    return {
        ...props.dataset,
        series: (props.dataset.series || []).map((serie, i) => {
            return {
                ...serie,
                color: convertColorToHex(serie.color) || customPalette.value[i] || palette[i],
                value: (((serie.to || 0) - (serie.from || 0)) / max) * 100,
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

const pointyPointerPath = computed(() => {
    const centerX = svg.value.width / 2;
    const centerY = svg.value.height * 0.69;
    const angle = Math.PI * ((activeRating.value + 0 - min.value) / (max.value - min.value)) + Math.PI;
    const tipX = centerX + (svg.value.width / 3.2 * gaugeConfig.value.style.chart.layout.pointer.size) * Math.cos(angle);
    const tipY = centerY + (svg.value.width / 3.2 * gaugeConfig.value.style.chart.layout.pointer.size) * Math.sin(angle);
    const baseLength = gaugeConfig.value.style.chart.layout.pointer.circle.radius;
    const baseX1 = centerX + baseLength * Math.cos(angle + (Math.PI / 2));
    const baseY1 = centerY + baseLength * Math.sin(angle + (Math.PI / 2));
    const baseX2 = centerX + baseLength * Math.cos(angle - (Math.PI / 2));
    const baseY2 = centerY + baseLength * Math.sin(angle - (Math.PI / 2));

    if(isNaN(tipX)) return null;

    return `M ${tipX},${tipY} ${baseX1},${baseY1} ${baseX2},${baseY2} Z`;
})

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
    if (objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiGauge',
            type: 'dataset'
        })
    } else {
        getMissingDatasetAttributes({
            datasetObject: props.dataset,
            requiredAttributes: ['value', 'series']
        }).forEach(attr => {
            error({
                componentName: 'VueUiGauge',
                type: 'datasetAttribute',
                property: attr
            })
        });
        if(Object.hasOwn(props.dataset, 'series')) {
            if(!props.dataset.series.length) {
                error({
                    componentName: 'VueUiGauge',
                    type: 'datasetAttributeEmpty',
                    property: 'series'
                })
            } else {
                props.dataset.series.forEach((serie, i) => {
                    getMissingDatasetAttributes({
                        datasetObject: serie,
                        requiredAttributes: ['from', 'to']
                    }).forEach(attr => {
                        error({
                            componentName: 'VueUiGauge',
                            type: 'datasetSerieAttribute',
                            property: attr,
                            index: i
                        })
                    })
                })
            }

        }
    }
    const arr = [];
    (mutableDataset.value.series || []).forEach(serie => {
        arr.push(serie.from || 0);
        arr.push(serie.to || 0);
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

const __to__ = ref(null);

function showSpinnerPdf() {
    isPrinting.value = true;
}

function generatePdf(){
    showSpinnerPdf();
    clearTimeout(__to__.value);
    __to__.value = setTimeout(() => {
        pdf({
            domElement: document.getElementById(`vue-ui-gauge_${uid.value}`),
            fileName: gaugeConfig.value.style.chart.title.text || 'vue-ui-gauge'
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
            domElement: document.getElementById(`vue-ui-gauge_${uid.value}`),
            fileName: gaugeConfig.value.style.chart.title.text || 'vue-ui-gauge',
            format: 'png'
        }).finally(() => {
            isImaging.value = false;
        })
    }, 100)
}

const isFullscreen = ref(false)
function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
}

defineExpose({
    generatePdf,
    generateImage
});

</script>

<template>
    <div 
        :class="`vue-ui-gauge ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''}`"
        ref="gaugeChart"
        :id="`vue-ui-gauge_${uid}`"
        :style="`font-family:${gaugeConfig.style.fontFamily};width:100%; text-align:center;background:${gaugeConfig.style.chart.backgroundColor}`"
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
            :key="`user_options_${step}`"
            v-if="gaugeConfig.userOptions.show && isDataset"
            :backgroundColor="gaugeConfig.style.chart.backgroundColor"
            :color="gaugeConfig.style.chart.color"
            :isImaging="isImaging"
            :isPrinting="isPrinting"
            :uid="uid"
            :hasXls="false"
            :hasImg="true"
            hasFullscreen
            :isFullscreen="isFullscreen"
            :chartElement="gaugeChart"
            @toggleFullscreen="toggleFullscreen"
            @generatePdf="generatePdf"
            @generateImage="generateImage"
        />

        <!-- CHART -->
        <svg :xmlns="XMLNS" v-if="isDataset"  :class="{ 'vue-data-ui-fullscreen--on': isFullscreen, 'vue-data-ui-fulscreen--off': !isFullscreen }" :viewBox="`0 0 ${svg.width} ${svg.height}`" :style="`max-width:100%;overflow:hidden !important;background:${gaugeConfig.style.chart.backgroundColor};color:${gaugeConfig.style.chart.color}`">

            <defs>
                <radialGradient :id="`gradient_${uid}`" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                    <stop offset="0%" :stop-color="`#FFFFFF${opacity[1]}`" />
                    <stop offset="80%" :stop-color="`#FFFFFF${opacity[gaugeConfig.style.chart.layout.track.gradientIntensity]}`" />
                    <stop offset="100%" :stop-color="`#FFFFFF${opacity[1]}`" />
                </radialGradient>
            </defs>

            <defs>
                <filter :id="`blur_${uid}`" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur in="SourceGraphic" :stdDeviation="100 / gaugeConfig.style.chart.layout.track.gradientIntensity"/>
                    <feColorMatrix type="saturate" values="0" />
                </filter>
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
                <path 
                    v-for="(arc, i) in makeDonut(mutableDataset, svg.width / 2, svg.height * 0.7, svg.width / 2.5, svg.width / 2.5)" 
                    :key="`arc_${i}`"
                    :d="arc.path"
                    fill="none"
                    :stroke="'white'"
                    stroke-linecap="round"
                    :stroke-width="(svg.width / 64) * gaugeConfig.style.chart.layout.track.size"
                    :filter="`url(#blur_${uid})`"
                />
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
            <g v-if="gaugeConfig.style.chart.layout.pointer.type === 'rounded'">            
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
                <line
                    data-cy="gauge-pointer"
                    v-if="!isNaN(pointer.x2) && gaugeConfig.style.chart.layout.track.useGradient"
                    :x1="pointer.x1"
                    :y1="pointer.y1"
                    :x2="pointer.x2"
                    :y2="pointer.y2"
                    :stroke="'white'"
                    stroke-linecap="round"
                    :stroke-width="gaugeConfig.style.chart.layout.pointer.strokeWidth * 0.3"
                    :filter="`url(#blur_${uid})`"
                />
            </g>
            <g v-else>
                <path
                    v-if="pointyPointerPath"
                    :d="pointyPointerPath"
                    :fill="gaugeConfig.style.chart.layout.pointer.useRatingColor ? ratingColor : gaugeConfig.style.chart.layout.pointer.color"
                    :stroke="gaugeConfig.style.chart.layout.pointer.stroke"
                    :stroke-width="gaugeConfig.style.chart.layout.pointer.circle.strokeWidth"
                    stroke-linejoin="round"
                />
            </g>
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
            <slot name="svg" :svg="svg"/>
        </svg>

        <Skeleton 
            v-if="!isDataset"
            :config="{
                type: 'gauge',
                style: {
                    backgroundColor: gaugeConfig.style.chart.backgroundColor,
                    gauge: {
                        color: '#CCCCCC'
                    }
                }
            }"
        />
        <slot name="legend" v-bind:legend="mutableDataset"></slot>
    </div>
</template>

<style scoped>
@import "../vue-data-ui.css";
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