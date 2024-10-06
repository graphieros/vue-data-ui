<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount } from "vue";
import { 
    convertColorToHex, 
    convertCustomPalette, 
    createUid,
    error,
    getMissingDatasetAttributes,
    objectIsEmpty,
    opacity, 
    palette, 
    themePalettes,
    makeDonut,
    translateSize,
    offsetFromCenterPoint,
    XMLNS
} from "../lib.js";
import { throttle } from "../canvas-lib";
import themes from "../themes.json";
import UserOptions from "../atoms/UserOptions.vue";
import Skeleton from "./vue-ui-skeleton.vue";
import Title from "../atoms/Title.vue";
import { useNestedProp } from "../useNestedProp";
import { usePrinter } from "../usePrinter";
import { useResponsive } from "../useResponsive";
import { useConfig } from "../useConfig";

const { vue_ui_gauge: DEFAULT_CONFIG } = useConfig()

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
});

const uid = ref(createUid());
const details = ref(null);
const step = ref(0);
const gaugeChart = ref(null);
const chartTitle = ref(null);
const chartLegend = ref(null);

const FINAL_CONFIG = computed(() => {
    const mergedConfig = useNestedProp({
        userConfig: props.config,
        defaultConfig: DEFAULT_CONFIG
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

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `vue-ui-gauge_${uid.value}`,
    fileName: FINAL_CONFIG.value.style.chart.title.text || 'vue-ui-gauge'
});

const customPalette = computed(() => {
    return convertCustomPalette(FINAL_CONFIG.value.customPalette);
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

const baseSize = ref(512);

const svg = ref({
    height: 358.4,
    width: baseSize.value,
    top: 0,
    bottom: 358.4,
    centerX: 179.2,
    centerY: baseSize.value / 2,
    labelFontSize: 18,
    legendFontSize: FINAL_CONFIG.value.style.chart.legend.fontSize,
    pointerRadius: FINAL_CONFIG.value.style.chart.layout.pointer.circle.radius,
    trackSize: FINAL_CONFIG.value.style.chart.layout.track.size,
    pointerSize: FINAL_CONFIG.value.style.chart.layout.pointer.size,
    pointerStrokeWidth: FINAL_CONFIG.value.style.chart.layout.pointer.strokeWidth,
    markerOffset: FINAL_CONFIG.value.style.chart.layout.markers.offsetY + 3,
});

const max = ref(0);
const min = ref(0);

const activeRating = ref(FINAL_CONFIG.value.style.chart.animation.use ? 0 : props.dataset.value);

watch(() => props.dataset.value, () => {
    activeRating.value = FINAL_CONFIG.value.style.chart.animation.use ? 0 : props.dataset.value
    useAnimation()
})

const pointer = computed(() => {
    const x = svg.value.width / 2;
    const y = arcSizeSource.value.base;
    const angle = Math.PI * ((activeRating.value + 0 - min.value) / (max.value - min.value)) + Math.PI;
    return {
        x1: x,
        y1: y,
        x2: x + (arcSizeSource.value.pointerSize * svg.value.pointerSize * 0.9) * Math.cos(angle),
        y2: y + (arcSizeSource.value.pointerSize * svg.value.pointerSize * 0.9) * Math.sin(angle)
    }
});

const pointyPointerPath = computed(() => {
    const centerX = svg.value.width / 2;
    const centerY = arcSizeSource.value.base;
    const angle = Math.PI * ((activeRating.value + 0 - min.value) / (max.value - min.value)) + Math.PI;
    const tipX = centerX + ((arcSizeSource.value.pointerSize) * svg.value.pointerSize * 0.9) * Math.cos(angle);
    const tipY = centerY + ((arcSizeSource.value.pointerSize) * svg.value.pointerSize * 0.9) * Math.sin(angle);
    const baseLength = svg.value.pointerRadius;
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

const resizeObserver = ref(null);

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
    useAnimation();

    if (FINAL_CONFIG.value.responsive) {
        const handleResize = throttle(() => {
            const { width, height } = useResponsive({
                chart: gaugeChart.value,
                title: FINAL_CONFIG.value.style.chart.title.text ? chartTitle.value : null,
                legend: chartLegend.value
            });
            svg.value.width = width;
            svg.value.height = height;
            svg.value.centerX = width / 2;
            svg.value.centerY = ((baseSize.value / 2) / 358.4) * height;
            svg.value.bottom = height;
            svg.value.labelFontSize = (18 / baseSize.value) * Math.min(height, width) < 10 ? 10 : (18 / baseSize.value) * Math.min(height, width);
            svg.value.legendFontSize = (FINAL_CONFIG.value.style.chart.legend.fontSize / baseSize.value) * Math.min(height, width) < 14 ? 14 : (FINAL_CONFIG.value.style.chart.legend.fontSize / baseSize.value) * Math.min(height, width);
            svg.value.pointerRadius = (FINAL_CONFIG.value.style.chart.layout.pointer.circle.radius / baseSize.value) * (Math.min(height, width));
            svg.value.trackSize = (FINAL_CONFIG.value.style.chart.layout.track.size / baseSize.value) * (Math.min(height, width));
            svg.value.pointerStrokeWidth = translateSize({
                relator: Math.min(width, height),
                adjuster: baseSize.value,
                source: FINAL_CONFIG.value.style.chart.layout.pointer.strokeWidth,
                threshold: 2,
                fallback: 2
            });
            svg.value.markerOffset = translateSize({
                relator: Math.max(width, height),
                adjuster: baseSize.value,
                source: FINAL_CONFIG.value.style.chart.layout.markers.offsetY + 3,
                threshold: 2,
                fallback: 2
            })
        });

        resizeObserver.value = new ResizeObserver(handleResize);
        resizeObserver.value.observe(gaugeChart.value.parentNode);
    }
});

onBeforeUnmount(() => {
    if (resizeObserver.value) resizeObserver.value.disconnect();
});

function useAnimation() {
    const arr = [];
    (mutableDataset.value.series || []).forEach(serie => {
        arr.push(serie.from || 0);
        arr.push(serie.to || 0);
    });
    max.value = Math.max(...arr);
    min.value = Math.min(...arr);
    const strLen = String(max.value).length;
    let acceleration = 0;
    let speed = (strLen > 2 ? 0.01 : 0.001) * FINAL_CONFIG.value.style.chart.animation.speed;
    let incr = (strLen > 2 ? 0.05 : 0.005) * FINAL_CONFIG.value.style.chart.animation.acceleration;
    function animate() {
        activeRating.value += speed + acceleration;
        acceleration += incr;
        if (activeRating.value < props.dataset.value) {
            requestAnimationFrame(animate);
        } else {
            activeRating.value = props.dataset.value;
        }
    }
    if (FINAL_CONFIG.value.style.chart.animation.use) {
        activeRating.value = min.value;
        animate();
    }
}

const arcSizeSource = computed(() => {
    const src = FINAL_CONFIG.value.responsive ? Math.min(svg.value.width, svg.value.height) : svg.value.width;
    return {
        arcs: src / 2.5,
        gradients: src / 2.75,
        base: FINAL_CONFIG.value.responsive ? svg.value.height / 2 : svg.value.height * 0.7,
        ratingBase: FINAL_CONFIG.value.responsive ? svg.value.height / 2 + (svg.value.height / 4) : svg.value.height * 0.9,
        pointerSize: FINAL_CONFIG.value.responsive ? Math.min(svg.value.width, svg.value.height) / 3 : svg.value.width / 3.2
    }
})

const arcs = computed(() => {
    const donut = makeDonut(
        {series: mutableDataset.value.series},
        svg.value.width / 2,
        arcSizeSource.value.base,
        arcSizeSource.value.arcs,
        arcSizeSource.value.arcs,
        1,
        1,
        1,
        180,
        109.9495,
        40 * svg.value.trackSize
    );
    return donut
})

const gradientArcs = computed(() => {
    const donut = makeDonut(
        {series: mutableDataset.value.series},
        svg.value.width / 2,
        arcSizeSource.value.base,
        arcSizeSource.value.gradients,
        arcSizeSource.value.gradients,
        1,
        1,
        1,
        180,
        109.9495,
        2 * svg.value.trackSize
    );
    return donut
});

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
        :style="`font-family:${FINAL_CONFIG.style.fontFamily};width:100%; text-align:center;background:${FINAL_CONFIG.style.chart.backgroundColor};${FINAL_CONFIG.responsive ? 'height: 100%' : ''}`"
    >
    
        <div ref="chartTitle" v-if="FINAL_CONFIG.style.chart.title.text" :style="`width:100%;background:${FINAL_CONFIG.style.chart.backgroundColor};padding-bottom:12px`">
            <Title
                :config="{
                    title: {
                        cy: 'gauge-div-title',
                        ...FINAL_CONFIG.style.chart.title,
                    },
                    subtitle: {
                        cy: 'gauge-div-subtitle',
                        ...FINAL_CONFIG.style.chart.title.subtitle
                    }
                }"
            >
                <span v-if="FINAL_CONFIG.translations.base && dataset.base">
                    {{ FINAL_CONFIG.translations.base }}: {{ dataset.base }}
                </span>
        </Title>
        </div>

        <!-- OPTIONS -->
        <UserOptions
            ref="details"
            :key="`user_options_${step}`"
            v-if="FINAL_CONFIG.userOptions.show && isDataset"
            :backgroundColor="FINAL_CONFIG.style.chart.backgroundColor"
            :color="FINAL_CONFIG.style.chart.color"
            :isImaging="isImaging"
            :isPrinting="isPrinting"
            :uid="uid"
            :hasXls="false"
            :hasPdf="FINAL_CONFIG.userOptions.buttons.pdf"
            :hasImg="FINAL_CONFIG.userOptions.buttons.img"
            :hasFullscreen="FINAL_CONFIG.userOptions.buttons.fullscreen"
            :isFullscreen="isFullscreen"
            :titles="{ ...FINAL_CONFIG.userOptions.buttonTitles }"
            :chartElement="gaugeChart"
            @toggleFullscreen="toggleFullscreen"
            @generatePdf="generatePdf"
            @generateImage="generateImage"
        >
            <template #optionPdf v-if="$slots.optionPdf">
                <slot name="optionPdf" />
            </template>
            <template #optionImg v-if="$slots.optionImg">
                <slot name="optionImg" />
            </template>
            <template v-if="$slots.optionFullscreen" template #optionFullscreen="{ toggleFullscreen, isFullscreen }">
                <slot name="optionFullscreen" v-bind="{ toggleFullscreen, isFullscreen }"/>
            </template>
        </UserOptions>

        <!-- CHART -->
        <svg :xmlns="XMLNS" v-if="isDataset"  :class="{ 'vue-data-ui-fullscreen--on': isFullscreen, 'vue-data-ui-fulscreen--off': !isFullscreen }" :viewBox="`0 0 ${svg.width <= 0 ? 10 : svg.width} ${svg.height <= 0 ? 10 : svg.height}`" :style="`max-width:100%;overflow:hidden !important;background:${FINAL_CONFIG.style.chart.backgroundColor};color:${FINAL_CONFIG.style.chart.color}`">

            <defs>
                <radialGradient :id="`gradient_${uid}`" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                    <stop offset="0%" :stop-color="`#FFFFFF${opacity[1]}`" />
                    <stop offset="80%" :stop-color="`#FFFFFF${opacity[FINAL_CONFIG.style.chart.layout.track.gradientIntensity]}`" />
                    <stop offset="100%" :stop-color="`#FFFFFF${opacity[1]}`" />
                </radialGradient>
            </defs>

            <defs>
                <filter :id="`blur_${uid}`" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur in="SourceGraphic" :stdDeviation="100 / FINAL_CONFIG.style.chart.layout.track.gradientIntensity" />
                </filter>
            </defs>

            <!-- ARC STEPS -->
            <path 
                v-for="(arc, i) in arcs" 
                :data-cy="`gauge-arc-${i}`"
                :key="`arc_${i}`"
                :d="arc.arcSlice"
                :fill="arc.color"
                :stroke="FINAL_CONFIG.style.chart.backgroundColor"
                stroke-linecap="round"
            />

            <!-- ARC STEPS GRADIENTS-->
            <template v-if="FINAL_CONFIG.style.chart.layout.track.useGradient">            
                <path 
                    v-for="(arc, i) in gradientArcs" 
                    :data-cy="`gauge-arc-${i}`"
                    :key="`arc_${i}`"
                    :d="arc.arcSlice"
                    fill="#FFFFFF"
                    stroke="none"
                    stroke-linecap="round"
                    :filter="`url(#blur_${uid})`"
                />
                <!-- HIDER -->
                <rect
                    :x="0"
                    :y="arcSizeSource.base"
                    :width="svg.width <= 0 ? 0.0001 : svg.width"
                    :height="svg.height * 0.3 <= 0 ? 0.0001 : svg.height * 0.3"
                    :fill="FINAL_CONFIG.style.chart.backgroundColor"
                />
            </template>


            <!-- STEP MARKERS -->
            <text
                v-for="(arc, i) in arcs"
                :data-cy="`gauge-step-marker-label-${i}`"
                :x="offsetFromCenterPoint({
                    centerX: svg.width / 2,
                    centerY: arcSizeSource.base,
                    initX: arc.center.startX,
                    initY: arc.center.startY,
                    offset: svg.markerOffset
                }).x"
                :y="offsetFromCenterPoint({
                    centerX: svg.width / 2,
                    centerY: arcSizeSource.base,
                    initX: arc.center.startX,
                    initY: arc.center.startY,
                    offset: svg.markerOffset
                }).y"
                :text-anchor="arc.center.startX < (svg.width / 2 - 5) ? 'end' : arc.center.startX > (svg.width / 2 + 5) ? 'start' : 'middle'"
                :font-size="svg.labelFontSize * FINAL_CONFIG.style.chart.layout.markers.fontSizeRatio"
                :font-weight="`${FINAL_CONFIG.style.chart.layout.markers.bold ? 'bold' : 'normal'}`"
                :fill="FINAL_CONFIG.style.chart.layout.markers.color"
            >
                {{ arc.from.toFixed(FINAL_CONFIG.style.chart.layout.markers.roundingValue) }}
            </text>

            <text
                data-cy="gauge-step-marker-label-last"
                :x="offsetFromCenterPoint({
                    centerX: svg.width / 2,
                    centerY: arcSizeSource.base,
                    initX: arcs.at(-1).endX,
                    initY: arcs.at(-1).endY,
                    offset: svg.markerOffset
                }).x"
                :y="offsetFromCenterPoint({
                    centerX: svg.width / 2,
                    centerY: arcSizeSource.base,
                    initX: arcs.at(-1).endX,
                    initY: arcs.at(-1).endY,
                    offset: svg.markerOffset
                }).y"
                text-anchor="start"
                :font-size="svg.labelFontSize * FINAL_CONFIG.style.chart.layout.markers.fontSizeRatio"
                :font-weight="`${FINAL_CONFIG.style.chart.layout.markers.bold ? 'bold' : 'normal'}`"
                :fill="FINAL_CONFIG.style.chart.layout.markers.color"
            >
                {{ max.toFixed(FINAL_CONFIG.style.chart.layout.markers.roundingValue) }}
            </text>

            <!-- GAUGE POINTER -->
            <g v-if="FINAL_CONFIG.style.chart.layout.pointer.type === 'rounded'">            
                <line
                    data-cy="gauge-pointer-border"
                    v-if="!isNaN(pointer.x2)"
                    :x1="pointer.x1"
                    :y1="pointer.y1"
                    :x2="pointer.x2"
                    :y2="pointer.y2"
                    :stroke="FINAL_CONFIG.style.chart.layout.pointer.stroke"
                    :stroke-width="svg.pointerStrokeWidth"
                    stroke-linecap="round"
                />
                <line
                    data-cy="gauge-pointer"
                    v-if="!isNaN(pointer.x2)"
                    :x1="pointer.x1"
                    :y1="pointer.y1"
                    :x2="pointer.x2"
                    :y2="pointer.y2"
                    :stroke="FINAL_CONFIG.style.chart.layout.pointer.useRatingColor ? ratingColor : FINAL_CONFIG.style.chart.layout.pointer.color"
                    stroke-linecap="round"
                    :stroke-width="svg.pointerStrokeWidth * 0.7"
                />
                <line
                    data-cy="gauge-pointer"
                    v-if="!isNaN(pointer.x2) && FINAL_CONFIG.style.chart.layout.track.useGradient"
                    :x1="pointer.x1"
                    :y1="pointer.y1"
                    :x2="pointer.x2"
                    :y2="pointer.y2"
                    :stroke="'white'"
                    stroke-linecap="round"
                    :stroke-width="svg.pointerStrokeWidth * 0.3"
                    :filter="`url(#blur_${uid})`"
                />
            </g>
            <g v-else>
                <path
                    v-if="pointyPointerPath"
                    :d="pointyPointerPath"
                    :fill="FINAL_CONFIG.style.chart.layout.pointer.useRatingColor ? ratingColor : FINAL_CONFIG.style.chart.layout.pointer.color"
                    :stroke="FINAL_CONFIG.style.chart.layout.pointer.stroke"
                    :stroke-width="FINAL_CONFIG.style.chart.layout.pointer.circle.strokeWidth"
                    stroke-linejoin="round"
                />
            </g>
            <circle
                data-cy="gauge-pointer-circle"
                :cx="svg.width / 2"
                :cy="arcSizeSource.base"
                :fill="FINAL_CONFIG.style.chart.layout.pointer.circle.color"
                :r="svg.pointerRadius <= 0 ? 0.0001 : svg.pointerRadius"
                :stroke-width="FINAL_CONFIG.style.chart.layout.pointer.circle.strokeWidth"
                :stroke="FINAL_CONFIG.style.chart.layout.pointer.circle.stroke"
            />

            <!-- GAUGE RATING --> 
            <text
                data-cy="gauge-score"
                :x="svg.width / 2"
                :y="arcSizeSource.ratingBase"
                text-anchor="middle"
                :font-size="svg.legendFontSize"
                font-weight="bold"
                :fill="FINAL_CONFIG.style.chart.legend.useRatingColor ? ratingColor : FINAL_CONFIG.style.chart.legend.color"
            >
                {{ FINAL_CONFIG.style.chart.legend.prefix }} {{ FINAL_CONFIG.style.chart.legend.showPlusSymbol && activeRating > 0 ? '+' : '' }}{{ activeRating.toFixed(FINAL_CONFIG.style.chart.legend.roundingValue) }} {{ FINAL_CONFIG.style.chart.legend.suffix }}
            </text>
            <slot name="svg" :svg="svg"/>
        </svg>

        <Skeleton 
            v-if="!isDataset"
            :config="{
                type: 'gauge',
                style: {
                    backgroundColor: FINAL_CONFIG.style.chart.backgroundColor,
                    gauge: {
                        color: '#CCCCCC'
                    }
                }
            }"
        />

        <div ref="chartLegend">
            <slot name="legend" v-bind:legend="mutableDataset"></slot>
        </div>
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