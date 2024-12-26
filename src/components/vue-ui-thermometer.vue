<script setup>
import { ref, computed, onMounted, watch } from "vue";
import {
    applyDataLabel,
    checkNaN,
    convertColorToHex, 
    convertCustomPalette, 
    createUid, 
    dataLabel,
    error,
    getMissingDatasetAttributes,
    objectIsEmpty,
    palette,
    setOpacity,
    themePalettes,
    XMLNS
} from "../lib.js";
import themes from "../themes.json";
import Title from "../atoms/Title.vue";
import UserOptions from "../atoms/UserOptions.vue";
import Skeleton from "./vue-ui-skeleton.vue";
import { useNestedProp } from "../useNestedProp";
import { usePrinter } from "../usePrinter";
import { useConfig } from "../useConfig";
import PackageVersion from "../atoms/PackageVersion.vue";
import PenAndPaper from "../atoms/PenAndPaper.vue";
import { useUserOptionState } from "../useUserOptionState";

const { vue_ui_thermometer: DEFAULT_CONFIG } = useConfig()

const props = defineProps({
    dataset: {
        type: Object,
        default() {
            return {}
        }
    },
    config: {
        type: Object,
        default() {
            return {}
        }
    }
});

const isDataset = computed(() => {
    return !!props.dataset && Object.keys(props.dataset).length;
});

onMounted(() => {
    prepareChart();
});

function prepareChart() {
    if(objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiThermometer',
            type: 'dataset'
        })
    } else {
        getMissingDatasetAttributes({
            datasetObject: props.dataset,
            requiredAttributes: ['value', 'from', 'to']
        }).forEach(attr => {
            error({
                componentName: 'VueUiThermometer',
                type: 'datasetAttribute',
                property: attr,
            });
        });
    }
}

const uid = ref(createUid());
const thermoChart = ref(null);
const step = ref(0);
const titleStep = ref(0);

const FINAL_CONFIG = computed({
    get: () => {
        return prepareConfig();
    },
    set: (newCfg) => {
        return newCfg
    }
});

const { userOptionsVisible, setUserOptionsVisibility, keepUserOptionState } = useUserOptionState({ config: FINAL_CONFIG.value });

function prepareConfig() {
    const mergedConfig = useNestedProp({
        userConfig: props.config,
        defaultConfig: DEFAULT_CONFIG
    });
    if (mergedConfig.theme) {
        return {
            ...useNestedProp({
                userConfig: themes.vue_ui_thermometer[mergedConfig.theme] || props.config,
                defaultConfig: mergedConfig
            }),
            customPalette: themePalettes[mergedConfig.theme] || palette
        }
    } else {
        return mergedConfig;
    }
}

watch(() => props.config, (_newCfg) => {
    FINAL_CONFIG.value = prepareConfig();
    userOptionsVisible.value = !FINAL_CONFIG.value.showOnChartHover;
    prepareChart();
    titleStep.value += 1;
}, { deep: true });

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `thermometer__${uid.value}`,
    fileName: FINAL_CONFIG.value.style.title.text || 'vue-ui-thermometer'
});

const hasOptionsNoTitle = computed(() => {
    return FINAL_CONFIG.value.userOptions.show && !FINAL_CONFIG.value.style.title.text;
});

const customPalette = computed(() => {
    return convertCustomPalette(FINAL_CONFIG.value.customPalette);
})

const baseWidth = computed(() => {
    return FINAL_CONFIG.value.style.chart.thermometer.width;
});

const steps = computed(() => {
    return props.dataset.steps || 10;
})

const usablePadding = ref({
        top: FINAL_CONFIG.value.style.chart.padding.top,
        left: FINAL_CONFIG.value.style.chart.padding.left,
        right: FINAL_CONFIG.value.style.chart.padding.right,
        bottom: FINAL_CONFIG.value.style.chart.padding.bottom
});

function generateColorRange(startColor, endColor, steps) {
    const colors = [];

    const start = parseColor(startColor);
    const end = parseColor(endColor);

    for (let i = 0; i < steps; i++) {
        const redValue = interpolate(start.red, end.red, i, steps);
        const greenValue = interpolate(start.green, end.green, i, steps);
        const blueValue = interpolate(start.blue, end.blue, i, steps);

        const hexColor = `#${toHex(redValue)}${toHex(greenValue)}${toHex(blueValue)}`;
        colors.push(hexColor);
    }

    return colors;
}

function parseColor(color) {
    const hex = color.slice(1);
    return {
        red: parseInt(hex.slice(0, 2), 16),
        green: parseInt(hex.slice(2, 4), 16),
        blue: parseInt(hex.slice(4, 6), 16),
    };
}

function interpolate(start, end, step, totalSteps) {
  return Math.round(start + (end - start) * step / totalSteps);
}

function toHex(value) {
    return value.toString(16).padStart(2, '0');
}

const drawingArea = computed(() => {
    const width = baseWidth.value + usablePadding.value.left + usablePadding.value.right;
    const height = FINAL_CONFIG.value.style.chart.height;
    return {
        width,
        left: usablePadding.value.left,
        right: width - usablePadding.value.right,
        top: usablePadding.value.top,
        bottom: height - usablePadding.value.bottom,
        height,
    }
});

const svg = computed(() => {
    return drawingArea.value;
});

const temperature = computed(() => {
    const from = checkNaN(props.dataset.from) < 0 ? Math.abs(checkNaN(props.dataset.from)) : checkNaN(props.dataset.from);
    const to = checkNaN(props.dataset.to) < 0 ? Math.abs(checkNaN(props.dataset.to)) : checkNaN(props.dataset.to);
    let max = 0;
    if (checkNaN(props.dataset.to) > 0) {
        max = from + to;
    } else {
        if (from > to) {
            max = from - to;
        } else {
            max = to - from;
        }
    }
    return (1 - (Math.abs(checkNaN(props.dataset.from)) + checkNaN(props.dataset.value)) / max )* (drawingArea.value.height - usablePadding.value.top - usablePadding.value.bottom)
})

const cssTemp = computed(() => {
    return `${temperature.value}px`;
});

const cssHeight = computed(() => {
    return `${drawingArea.value.height - FINAL_CONFIG.value.style.chart.padding.bottom - usablePadding.value.top}px`;
});

const cssSpeed = computed(() => {
    return `${FINAL_CONFIG.value.style.chart.animation.speedMs}ms`;
});

const colors = computed(() => {
    if (!props.dataset.colors) {
        return generateColorRange(customPalette.value[1] || palette[1], customPalette.value[0] || palette[0], (steps.value )|| 10)
    } else {
        if (!props.dataset.colors.from) {
            return generateColorRange(customPalette.value[0] || palette[0], convertColorToHex(props.dataset.colors.to), (steps.value )|| 10)
        }
        if (!props.dataset.colors.to) {
            return generateColorRange(convertColorToHex(props.dataset.colors.from), customPalette.value[1] || palette[1], (steps.value )|| 10)
        }
    }
    return generateColorRange(convertColorToHex(props.dataset.colors.from) , convertColorToHex(props.dataset.colors.to), (steps.value )|| 10)
});

const graduations = computed(() => {
    const grads = [];
    let colorIndex = 0;
    const usableHeight = drawingArea.value.height - usablePadding.value.top - usablePadding.value.bottom;
    for (let i = 0; i < usableHeight-1; i += (usableHeight / steps.value)) {
        grads.push({
            x: drawingArea.value.left,
            y: drawingArea.value.top + i,
            qYLess: drawingArea.value.top + i + (usableHeight / steps.value / 4),
            halfY: drawingArea.value.top + i + (usableHeight / steps.value / 2),
            qYMore: drawingArea.value.top + i + ((usableHeight / steps.value / 4) * 3),
            color: colors.value[colorIndex],
            height: usableHeight / steps.value
        });
        colorIndex += 1;
    }
    return grads;
});

const isFullscreen = ref(false)
function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
}

const isAnnotator = ref(false);
function toggleAnnotator() {
    isAnnotator.value = !isAnnotator.value;
}

defineExpose({
    generatePdf,
    generateImage,
    toggleAnnotator
})

</script>

<template>
    <div ref="thermoChart" :class="`vue-ui-thermometer ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''}`" :style="`width:100%;background:${FINAL_CONFIG.style.chart.backgroundColor};color:${FINAL_CONFIG.style.chart.color};font-family:${FINAL_CONFIG.style.fontFamily}`" :id="`thermometer__${uid}`" @mouseenter="() => setUserOptionsVisibility(true)" @mouseleave="() => setUserOptionsVisibility(false)">
        <PenAndPaper
            v-if="FINAL_CONFIG.userOptions.buttons.annotator"
            :parent="thermoChart"
            :backgroundColor="FINAL_CONFIG.style.chart.backgroundColor"
            :color="FINAL_CONFIG.style.chart.color"
            :active="isAnnotator"
            @close="toggleAnnotator"
        />

        <div
            ref="noTitle"
            v-if="hasOptionsNoTitle" 
            class="vue-data-ui-no-title-space" 
            :style="`height:36px; width: 100%;background:transparent`"
        />

        <!-- TITLE AS DIV -->
        <div v-if="FINAL_CONFIG.style.title.text" :style="`width:100%`">
            <Title
                :key="`title_${titleStep}`"
                :config="{
                    title: {
                        cy: 'thermometer-div-title',
                        ...FINAL_CONFIG.style.title
                    },
                    subtitle: {
                        cy: 'thermometer-div-subtitle',
                        ...FINAL_CONFIG.style.title.subtitle
                    }
                }"
            />
        </div>

        <!-- OPTIONS -->
        <UserOptions
            ref="details"
            :key="`user_options_${step}`"
            v-if="FINAL_CONFIG.userOptions.show && isDataset && (keepUserOptionState ? true : userOptionsVisible)"
            :backgroundColor="FINAL_CONFIG.style.chart.backgroundColor"
            :color="FINAL_CONFIG.style.chart.color"
            :isImaging="isImaging"
            :isPrinting="isPrinting"
            :uid="uid"
            :hasPdf="FINAL_CONFIG.userOptions.buttons.pdf"
            :hasImg="FINAL_CONFIG.userOptions.buttons.img"
            :hasFullscreen="FINAL_CONFIG.userOptions.buttons.fullscreen"
            :hasXls="false"
            :isFullscreen="isFullscreen"
            :titles="{ ...FINAL_CONFIG.userOptions.buttonTitles }"
            :chartElement="thermoChart"
            :position="FINAL_CONFIG.userOptions.position"
            :hasAnnotator="FINAL_CONFIG.userOptions.buttons.annotator"
            :isAnnotation="isAnnotator"
            @toggleFullscreen="toggleFullscreen"
            @generatePdf="generatePdf"
            @generateImage="generateImage"
            @toggleAnnotator="toggleAnnotator"
            :style="{
                visibility: keepUserOptionState ? userOptionsVisible ? 'visible' : 'hidden' : 'visible'
            }"
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
            <template v-if="$slots.optionAnnotator" #optionAnnotator="{ toggleAnnotator, isAnnotator }">
                <slot name="optionAnnotator" v-bind="{ toggleAnnotator, isAnnotator }" />
            </template>
        </UserOptions>

        <svg :xmlns="XMLNS" v-if="isDataset" :class="{ 'vue-data-ui-fullscreen--on': isFullscreen, 'vue-data-ui-fulscreen--off': !isFullscreen }" width="100%" :viewBox="`0 0 ${drawingArea.width} ${drawingArea.height}`" :style="`background:transparent`">
            <PackageVersion />
            
            <defs>
                <clipPath id="vueUiPill" clipPathUnits="objectBoundingBox">
                    <rect 
                        x="0"
                        y="0"
                        width="1"
                        height="1"
                        rx="0.5"
                        ry="0.07"
                        :fill="FINAL_CONFIG.style.chart.backgroundColor"
                    />
                </clipPath>
                <linearGradient 
                    v-for="(graduation, i) in graduations" :id="`vueUiThermometerGradient_${i}_${uid}`"
                    x1="0%" y1="0%" x2="100%" y2="0%"
                >
                    <stop offset="0%" :stop-color="graduation.color"/>
                    <stop offset="50%" :stop-color="setOpacity(graduation.color, 100 - FINAL_CONFIG.style.chart.graduations.gradient.intensity)"/>
                    <stop offset="100%" :stop-color="graduation.color"/>
                </linearGradient>
            </defs>

            <g clip-path="url(#vueUiPill)">
                <rect
                    :x="drawingArea.left"
                    :y="drawingArea.top"
                    :height="drawingArea.height - usablePadding.top - usablePadding.bottom"
                    :width="drawingArea.width - usablePadding.left - usablePadding.right"
                    fill="#FFFFFF"
                />
                <g v-for="(graduation, i) in graduations" :key="`graduation_${i}`">
                    <rect
                        :x="graduation.x"
                        :y="graduation.y"
                        :height="graduation.height"
                        :width="drawingArea.width - FINAL_CONFIG.style.chart.padding.left - FINAL_CONFIG.style.chart.padding.right"
                        :fill="FINAL_CONFIG.style.chart.graduations.gradient.show ? `url(#vueUiThermometerGradient_${i}_${uid})` : graduation.color"
                        shape-rendering="crispEdges"
                    />

                    <!-- GRADUATIONS LEFT -->                    
                    <line 
                        v-if="FINAL_CONFIG.style.chart.graduations.show && ['both', 'left'].includes(FINAL_CONFIG.style.chart.graduations.sides)"
                        :x1="graduation.x"
                        :x2="graduation.x + 10"
                        :y1="graduation.y"
                        :y2="graduation.y"
                        :stroke-width="FINAL_CONFIG.style.chart.graduations.strokeWidth"
                        :stroke="FINAL_CONFIG.style.chart.graduations.stroke"
                        stroke-linecap="round"
                    />
                    <template v-if="FINAL_CONFIG.style.chart.graduations.showIntermediate">
                        <line 
                            v-if="FINAL_CONFIG.style.chart.graduations.show && ['both', 'left'].includes(FINAL_CONFIG.style.chart.graduations.sides)"
                            :x1="graduation.x"
                            :x2="graduation.x + 5"
                            :y1="graduation.halfY"
                            :y2="graduation.halfY"
                            :stroke-width="FINAL_CONFIG.style.chart.graduations.strokeWidth / 2"
                            :stroke="FINAL_CONFIG.style.chart.graduations.stroke"
                            stroke-linecap="round"
                        />                    
                        <line 
                            v-if="FINAL_CONFIG.style.chart.graduations.show && ['both', 'left'].includes(FINAL_CONFIG.style.chart.graduations.sides)"
                            :x1="graduation.x"
                            :x2="graduation.x + 2.5"
                            :y1="graduation.qYLess"
                            :y2="graduation.qYLess"
                            :stroke-width="FINAL_CONFIG.style.chart.graduations.strokeWidth / 2"
                            :stroke="FINAL_CONFIG.style.chart.graduations.stroke"
                            stroke-linecap="round"
                        />
                        <line 
                            v-if="FINAL_CONFIG.style.chart.graduations.show && ['both', 'left'].includes(FINAL_CONFIG.style.chart.graduations.sides)"
                            :x1="graduation.x"
                            :x2="graduation.x + 2.5"
                            :y1="graduation.qYMore"
                            :y2="graduation.qYMore"
                            :stroke-width="FINAL_CONFIG.style.chart.graduations.strokeWidth / 2"
                            :stroke="FINAL_CONFIG.style.chart.graduations.stroke"
                            stroke-linecap="round"
                        />
                    </template>                    

                    <!-- GRADUATIONS RIGHT -->                    
                    <line 
                        v-if="FINAL_CONFIG.style.chart.graduations.show && ['both', 'right'].includes(FINAL_CONFIG.style.chart.graduations.sides)"
                        :x1="drawingArea.right"
                        :x2="drawingArea.right - 10"
                        :y1="graduation.y"
                        :y2="graduation.y"
                        :stroke-width="FINAL_CONFIG.style.chart.graduations.strokeWidth"
                        :stroke="FINAL_CONFIG.style.chart.graduations.stroke"
                        stroke-linecap="round"
                    />          
                    <template v-if="FINAL_CONFIG.style.chart.graduations.showIntermediate">
                        <line 
                            v-if="FINAL_CONFIG.style.chart.graduations.show && ['both', 'right'].includes(FINAL_CONFIG.style.chart.graduations.sides)"
                            :x1="drawingArea.right"
                            :x2="drawingArea.right - 5"
                            :y1="graduation.halfY"
                            :y2="graduation.halfY"
                            :stroke-width="FINAL_CONFIG.style.chart.graduations.strokeWidth / 2"
                            :stroke="FINAL_CONFIG.style.chart.graduations.stroke"
                            stroke-linecap="round"
                        />                    
                        <line 
                            v-if="FINAL_CONFIG.style.chart.graduations.show && ['both', 'right'].includes(FINAL_CONFIG.style.chart.graduations.sides)"
                            :x1="drawingArea.right"
                            :x2="drawingArea.right - 2.5"
                            :y1="graduation.qYLess"
                            :y2="graduation.qYLess"
                            :stroke-width="FINAL_CONFIG.style.chart.graduations.strokeWidth / 2"
                            :stroke="FINAL_CONFIG.style.chart.graduations.stroke"
                            stroke-linecap="round"
                        />                    
                        <line 
                            v-if="FINAL_CONFIG.style.chart.graduations.show && ['both', 'right'].includes(FINAL_CONFIG.style.chart.graduations.sides)"
                            :x1="drawingArea.right"
                            :x2="drawingArea.right - 2.5"
                            :y1="graduation.qYMore"
                            :y2="graduation.qYMore"
                            :stroke-width="FINAL_CONFIG.style.chart.graduations.strokeWidth / 2"
                            :stroke="FINAL_CONFIG.style.chart.graduations.stroke"
                            stroke-linecap="round"
                        />                    
                    </template>           
                </g>
                <rect
                    :class="{'vue-ui-thermometer-temperature': FINAL_CONFIG.style.chart.animation.use }"
                    :x="drawingArea.left"
                    :y="drawingArea.top"
                    :height="temperature"
                    :width="drawingArea.width - FINAL_CONFIG.style.chart.padding.left - FINAL_CONFIG.style.chart.padding.right"
                    fill="#FFFFFF66"
                />
            </g>
            <text
                data-cy="thermometer-datalabel"
                :class="{'vue-ui-thermometer-temperature-value': FINAL_CONFIG.style.chart.animation.use }"
                :y="temperature + drawingArea.top + (FINAL_CONFIG.style.chart.label.fontSize / 3)"
                :x="drawingArea.left - 10"
                text-anchor="end"
                :fill="FINAL_CONFIG.style.chart.label.color"
                :font-size="FINAL_CONFIG.style.chart.label.fontSize"
                :font-weight="FINAL_CONFIG.style.chart.label.bold ? 'bold' : 'normal'"
            >
                {{ applyDataLabel(
                    FINAL_CONFIG.style.chart.label.formatter,
                    dataset.value,
                    dataLabel({
                        p: FINAL_CONFIG.style.chart.label.prefix, 
                        v: dataset.value, 
                        s: FINAL_CONFIG.style.chart.label.suffix, 
                        r: FINAL_CONFIG.style.chart.label.rounding
                    }),
                    { datapoint: dataset }
                    )
                }}
            </text>
            <slot name="svg" :svg="svg"/>
        </svg>

        <div v-if="$slots.watermark" class="vue-data-ui-watermark">
            <slot name="watermark" v-bind="{ isPrinting: isPrinting || isImaging }"/>
        </div>

        <div v-if="$slots.source" ref="source" dir="auto">
            <slot name="source" />
        </div>

        <Skeleton 
            v-if="!isDataset"
            :config="{
                type: 'thermometer',
                style: {
                    backgroundColor: FINAL_CONFIG.style.chart.backgroundColor,
                    thermometer: {
                        color: '#CCCCCC'
                    }
                }
            }"
        />
    </div>
</template>

<style scoped>
@import "../vue-data-ui.css";

.vue-ui-thermometer {
    position: relative;
}
rect.vue-ui-thermometer-temperature {
    animation: vue-ui-thermometer-temp v-bind(cssSpeed) ease-in-out;
    transform-origin: center;
}

text.vue-ui-thermometer-temperature-value {
    opacity:0;
    animation: vue-ui-thermometer-value v-bind(cssSpeed) ease-in-out forwards;
}

@keyframes vue-ui-thermometer-value {
    0% {
        opacity:0;
    }
    100% {
        opacity: 1;
    }
}

@keyframes vue-ui-thermometer-temp {
    0% {
        height: v-bind(cssHeight);
        clip-path: url(#vueUiPill);
    }
    50% {
        height: calc(v-bind(cssTemp) + 10px);
        clip-path: url(#vueUiPill);
    }
    60% {
        height: calc(v-bind(cssTemp) - 5px);
        clip-path: url(#vueUiPill);
    }
    70% {
        height: calc(v-bind(cssTemp) + 4px);
        clip-path: url(#vueUiPill);
    }
    80% {
        height: calc(v-bind(cssTemp) - 3px);
        clip-path: url(#vueUiPill);
    }
    90% {
        height: calc(v-bind(cssTemp) + 2px);
    }
    95% {
        height: calc(v-bind(cssTemp) - 1px);
    }
    100% {
        height: v-bind(cssTemp);
    }
}
</style>