<script setup>
import { ref, computed } from "vue";
import { palette, convertColorToHex, opacity, createUid } from "../lib.js";
import pdf from "../pdf";
import img from "../img";
import mainConfig from "../default_configs.json";
import { useNestedProp } from "../useNestedProp";
import Title from "../atoms/Title.vue";
import UserOptions from "../atoms/UserOptions.vue";

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

const uid = ref(createUid());
const defaultConfig = ref(mainConfig.vue_ui_thermometer);
const isImaging = ref(false);
const isPrinting = ref(false);
const thermoChart = ref(null);

const thermoConfig = computed(() => {
    return useNestedProp({
        userConfig: props.config,
        defaultConfig: defaultConfig.value
    });
});

const baseWidth = computed(() => {
    return thermoConfig.value.style.chart.thermometer.width;
});

const mutableConfig = ref({
    inside: !thermoConfig.value.style.title.useDiv,
});

const steps = computed(() => {
    return props.dataset.steps || 10;
})

const usablePadding = ref({
        top: mutableConfig.inside ? thermoConfig.value.style.chart.padding.top + 64 : thermoConfig.value.style.chart.padding.top,
        left: thermoConfig.value.style.chart.padding.left,
        right: thermoConfig.value.style.chart.padding.right,
        bottom: thermoConfig.value.style.chart.padding.bottom
});

function setPaddingTop() {
    if (mutableConfig.value.inside) {
        usablePadding.value.top = thermoConfig.value.style.chart.padding.top + 48;
    } else {
        usablePadding.value.top = thermoConfig.value.style.chart.padding.top
    }
}

function generateColorRange(startColor, endColor, steps) {
  const colors = [];

  // Parse the start and end colors
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
    const height = thermoConfig.value.style.chart.height;
    return {
        width,
        left: usablePadding.value.left,
        right: width - usablePadding.value.right,
        top: usablePadding.value.top,
        bottom: height - usablePadding.value.bottom,
        height,
    }
});

const temperature = computed(() => {
    const from = props.dataset.from < 0 ? Math.abs(props.dataset.from) : props.dataset.from;
    const to = props.dataset.to < 0 ? Math.abs(props.dataset.to) : props.dataset.to;
    let max = 0;
    if (props.dataset.to > 0) {
        max = from + to;
    } else {
        if (from > to) {
            max = from - to;
        } else {
            max = to - from;
        }
    }
    return (1 - (Math.abs(props.dataset.from) + props.dataset.value) / max )* (drawingArea.value.height - usablePadding.value.top - usablePadding.value.bottom)
})

const cssTemp = computed(() => {
    return `${temperature.value}px`;
});

const cssHeight = computed(() => {
    return `${drawingArea.value.height - thermoConfig.value.style.chart.padding.bottom - usablePadding.value.top}px`;
});

const cssSpeed = computed(() => {
    return `${thermoConfig.value.style.chart.animation.speedMs}ms`;
});

const colors = computed(() => {
    if (!props.dataset.colors) {
        return generateColorRange(palette[1], palette[0], (steps.value )|| 10)
    } else {
        if (!props.dataset.colors.from) {
            return generateColorRange(palette[0], convertColorToHex(props.dataset.colors.to), (steps.value )|| 10)
        }
        if (!props.dataset.colors.to) {
            return generateColorRange(convertColorToHex(props.dataset.colors.from), palette[1], (steps.value )|| 10)
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

const __to__ = ref(null);

function showSpinnerPdf() {
    isPrinting.value = true;
    usablePadding.value.top = thermoConfig.value.style.chart.padding.top;
}

function generatePdf(){
    showSpinnerPdf();
    clearTimeout(__to__.value);
    __to__.value = setTimeout(() => {
        pdf({
            domElement: document.getElementById(`thermometer__${uid.value}`),
            fileName: thermoConfig.value.style.title.text || 'vue-ui-thermometer'
        }).finally(() => {
            isPrinting.value = false;
            setPaddingTop();
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
            domElement: document.getElementById(`thermometer__${uid.value}`),
        fileName: thermoConfig.value.style.title.text || 'vue-ui-thermometer',
            format: 'png'
        }).finally(() => {
            isImaging.value = false;
        })
    }, 100)
}

defineExpose({
    generatePdf,
    generateImage
})

</script>

<template>
    <div ref="thermoChart" class="vue-ui-thermometer" :style="`width:100%;background:${thermoConfig.style.chart.backgroundColor};color:${thermoConfig.style.chart.color};font-family:${thermoConfig.style.fontFamily}`" :id="`thermometer__${uid}`">
        <!-- TITLE AS DIV -->
        <div v-if="(!mutableConfig.inside || isPrinting) && thermoConfig.style.title.text" :style="`width:100%`">
            <Title
                :config="{
                    title: {
                        cy: 'thermometer-div-title',
                        text: thermoConfig.style.title.text,
                        color: thermoConfig.style.title.color,
                        fontSize: thermoConfig.style.title.fontSize,
                        bold: thermoConfig.style.title.bold
                    },
                    subtitle: {
                        cy: 'thermometer-div-subtitle',
                        text: thermoConfig.style.title.subtitle.text,
                        color: thermoConfig.style.title.subtitle.color,
                        fontSize: thermoConfig.style.title.subtitle.fontSize,
                        bold: thermoConfig.style.title.subtitle.bold
                    }
                }"
            />
        </div>

        <!-- OPTIONS -->
        <UserOptions
            ref="details"
            v-if="thermoConfig.userOptions.show"
            :backgroundColor="thermoConfig.style.chart.backgroundColor"
            :color="thermoConfig.style.chart.color"
            :isImaging="isImaging"
            :isPrinting="isPrinting"
            :title="thermoConfig.userOptions.title"
            :uid="uid"
            :hasImg="true"
            @generatePdf="generatePdf"
            @generateImage="generateImage"
            :hasXls="false"
        />

        <svg width="100%" :viewBox="`0 0 ${drawingArea.width} ${drawingArea.height}`">
            <defs>
                <clipPath id="vueUiPill" clipPathUnits="objectBoundingBox">
                    <rect 
                        x="0"
                        y="0"
                        width="1"
                        height="1"
                        rx="0.5"
                        ry="0.07"
                        :fill="thermoConfig.style.chart.backgroundColor"
                    />
                </clipPath>
                <linearGradient 
                    v-for="(graduation, i) in graduations" :id="`vueUiThermometerGradient_${i}`"
                    x1="0%" y1="0%" x2="100%" y2="0%"
                >
                    <stop offset="0%" :stop-color="graduation.color"/>
                    <stop offset="50%" :stop-color="`${graduation.color}${opacity[100 - thermoConfig.style.chart.graduations.gradient.intensity]}`"/>
                    <stop offset="100%" :stop-color="graduation.color"/>
                </linearGradient>
            </defs>

            <!-- TITLE AS G -->
            <g v-if="thermoConfig.style.title.text && mutableConfig.inside && !isPrinting">
                <text
                    data-cy="thermometer-text-title"
                    :font-size="thermoConfig.style.title.fontSize"
                    :fill="thermoConfig.style.title.color"
                    :x="drawingArea.width / 2"
                    :y="24"
                    text-anchor="middle"
                    :style="`font-weight:${thermoConfig.style.title.bold ? 'bold' : ''}`"
                >
                    {{ thermoConfig.style.title.text }}
                </text>
                <text
                    data-cy="thermometer-text-subtitle"
                    v-if="thermoConfig.style.title.subtitle.text"
                    :font-size="thermoConfig.style.title.subtitle.fontSize"
                    :fill="thermoConfig.style.title.subtitle.color"
                    :x="drawingArea.width / 2"
                    :y="24 + thermoConfig.style.title.fontSize"
                    text-anchor="middle"
                    :style="`font-weight:${thermoConfig.style.title.subtitle.bold ? 'bold' : ''}`"
                >
                    {{ thermoConfig.style.title.subtitle.text }}
                </text>
            </g>

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
                        :width="drawingArea.width - thermoConfig.style.chart.padding.left - thermoConfig.style.chart.padding.right"
                        :fill="thermoConfig.style.chart.graduations.gradient.show ? `url(#vueUiThermometerGradient_${i})` : graduation.color"
                        shape-rendering="crispEdges"
                    />

                    <!-- GRADUATIONS LEFT -->                    
                    <line 
                        v-if="thermoConfig.style.chart.graduations.show && ['both', 'left'].includes(thermoConfig.style.chart.graduations.sides)"
                        :x1="graduation.x"
                        :x2="graduation.x + 10"
                        :y1="graduation.y"
                        :y2="graduation.y"
                        :stroke-width="thermoConfig.style.chart.graduations.strokeWidth"
                        :stroke="thermoConfig.style.chart.graduations.stroke"
                        stroke-linecap="round"
                    />
                    <template v-if="thermoConfig.style.chart.graduations.showIntermediate">
                        <line 
                            v-if="thermoConfig.style.chart.graduations.show && ['both', 'left'].includes(thermoConfig.style.chart.graduations.sides)"
                            :x1="graduation.x"
                            :x2="graduation.x + 5"
                            :y1="graduation.halfY"
                            :y2="graduation.halfY"
                            :stroke-width="thermoConfig.style.chart.graduations.strokeWidth / 2"
                            :stroke="thermoConfig.style.chart.graduations.stroke"
                            stroke-linecap="round"
                        />                    
                        <line 
                            v-if="thermoConfig.style.chart.graduations.show && ['both', 'left'].includes(thermoConfig.style.chart.graduations.sides)"
                            :x1="graduation.x"
                            :x2="graduation.x + 2.5"
                            :y1="graduation.qYLess"
                            :y2="graduation.qYLess"
                            :stroke-width="thermoConfig.style.chart.graduations.strokeWidth / 2"
                            :stroke="thermoConfig.style.chart.graduations.stroke"
                            stroke-linecap="round"
                        />
                        <line 
                            v-if="thermoConfig.style.chart.graduations.show && ['both', 'left'].includes(thermoConfig.style.chart.graduations.sides)"
                            :x1="graduation.x"
                            :x2="graduation.x + 2.5"
                            :y1="graduation.qYMore"
                            :y2="graduation.qYMore"
                            :stroke-width="thermoConfig.style.chart.graduations.strokeWidth / 2"
                            :stroke="thermoConfig.style.chart.graduations.stroke"
                            stroke-linecap="round"
                        />
                    </template>                    

                    <!-- GRADUATIONS RIGHT -->                    
                    <line 
                        v-if="thermoConfig.style.chart.graduations.show && ['both', 'right'].includes(thermoConfig.style.chart.graduations.sides)"
                        :x1="drawingArea.right"
                        :x2="drawingArea.right - 10"
                        :y1="graduation.y"
                        :y2="graduation.y"
                        :stroke-width="thermoConfig.style.chart.graduations.strokeWidth"
                        :stroke="thermoConfig.style.chart.graduations.stroke"
                        stroke-linecap="round"
                    />          
                    <template v-if="thermoConfig.style.chart.graduations.showIntermediate">
                        <line 
                            v-if="thermoConfig.style.chart.graduations.show && ['both', 'right'].includes(thermoConfig.style.chart.graduations.sides)"
                            :x1="drawingArea.right"
                            :x2="drawingArea.right - 5"
                            :y1="graduation.halfY"
                            :y2="graduation.halfY"
                            :stroke-width="thermoConfig.style.chart.graduations.strokeWidth / 2"
                            :stroke="thermoConfig.style.chart.graduations.stroke"
                            stroke-linecap="round"
                        />                    
                        <line 
                            v-if="thermoConfig.style.chart.graduations.show && ['both', 'right'].includes(thermoConfig.style.chart.graduations.sides)"
                            :x1="drawingArea.right"
                            :x2="drawingArea.right - 2.5"
                            :y1="graduation.qYLess"
                            :y2="graduation.qYLess"
                            :stroke-width="thermoConfig.style.chart.graduations.strokeWidth / 2"
                            :stroke="thermoConfig.style.chart.graduations.stroke"
                            stroke-linecap="round"
                        />                    
                        <line 
                            v-if="thermoConfig.style.chart.graduations.show && ['both', 'right'].includes(thermoConfig.style.chart.graduations.sides)"
                            :x1="drawingArea.right"
                            :x2="drawingArea.right - 2.5"
                            :y1="graduation.qYMore"
                            :y2="graduation.qYMore"
                            :stroke-width="thermoConfig.style.chart.graduations.strokeWidth / 2"
                            :stroke="thermoConfig.style.chart.graduations.stroke"
                            stroke-linecap="round"
                        />                    
                    </template>           
                </g>
                <rect
                    :class="{'vue-ui-thermometer-temperature': thermoConfig.style.chart.animation.use }"
                    :x="drawingArea.left"
                    :y="drawingArea.top"
                    :height="temperature"
                    :width="drawingArea.width - thermoConfig.style.chart.padding.left - thermoConfig.style.chart.padding.right"
                    fill="#FFFFFF66"
                />
            </g>
            <text
                data-cy="thermometer-datalabel"
                :class="{'vue-ui-thermometer-temperature-value': thermoConfig.style.chart.animation.use }"
                :y="temperature + drawingArea.top + (thermoConfig.style.chart.label.fontSize / 3)"
                :x="drawingArea.left - 10"
                text-anchor="end"
                :fill="thermoConfig.style.chart.label.color"
                :font-size="thermoConfig.style.chart.label.fontSize"
                :font-weight="thermoConfig.style.chart.label.bold ? 'bold' : 'normal'"
            >
                {{ isNaN(dataset.value) ? '' : Number(dataset.value.toFixed(thermoConfig.style.chart.label.rounding)).toLocaleString() }}
            </text>
            
        </svg>
    </div>
</template>

<style scoped>
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