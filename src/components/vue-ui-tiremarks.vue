<script setup>
import { ref, computed, onMounted } from "vue";
import pdf from "../pdf";
import img from "../img";
import { useNestedProp } from "../useNestedProp";
import mainConfig from "../default_configs.json";
import themes from "../themes.json";
import Title from "../atoms/Title.vue";
import UserOptions from "../atoms/UserOptions.vue";
import { 
    createUid,
    error,
    objectIsEmpty, 
    shiftHue,
    XMLNS
} from "../lib";
import Skeleton from "./vue-ui-skeleton.vue";

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

const isDataset = computed(() => {
    return !!props.dataset && Object.keys(props.dataset).length;
})

const uid = ref(createUid());

const defaultConfig = ref(mainConfig.vue_ui_tiremarks);
const tiremarksChart = ref(null)

const isPrinting = ref(false);
const isImaging = ref(false);
const step = ref(0);

const tiremarksConfig = computed(() => {
    const mergedConfig = useNestedProp({
        userConfig: props.config,
        defaultConfig: defaultConfig.value
    });
    if (mergedConfig.theme) {
        return {
            ...useNestedProp({
                userConfig: themes.vue_ui_tiremarks[mergedConfig.theme] || props.config,
                defaultConfig: mergedConfig
            }),
        }
    } else {
        return mergedConfig;
    }
});

const activeValue = ref(tiremarksConfig.value.style.chart.animation.use ? 0 : props.dataset.percentage);

onMounted(() => {
    if (objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiTiremarks',
            type: 'dataset'
        })
    }

    let acceleration = 0;
    let speed = tiremarksConfig.value.style.chart.animation.speed;
    let incr = (0.005) * tiremarksConfig.value.style.chart.animation.acceleration;
    function animate() {
        activeValue.value += speed + acceleration;
        acceleration += incr;
        if (activeValue.value < props.dataset.percentage) {
            requestAnimationFrame(animate);
        } else {
            activeValue.value = props.dataset.percentage;
        }
    }

    if(tiremarksConfig.value.style.chart.animation.use) {
        activeValue.value = 0;
        animate();
    }
});

const isVertical = computed(() => {
    return tiremarksConfig.value.style.chart.layout.display === 'vertical';
});

const padding = computed(() => {
    
    const paddingRef = {
        top: 48,
        left: 64,
        right: 64,
        bottom: 48
    }

    if(isVertical.value) {
        return {
            top: tiremarksConfig.value.style.chart.percentage.verticalPosition === 'top' ? paddingRef.top : 3,
            left: 3,
            right: 3,
            bottom: tiremarksConfig.value.style.chart.percentage.verticalPosition === 'bottom' ? paddingRef.bottom : 3
        }
    } else {
        return {
            top: 0,
            bottom: 0,
            left: tiremarksConfig.value.style.chart.percentage.horizontalPosition === 'left' ? paddingRef.left : 3,
            right: tiremarksConfig.value.style.chart.percentage.horizontalPosition === 'right' ? paddingRef.right : 10,
        }
    }
});

// This should return a total for x and another for y
const totalPadding = computed(() => {
    return Object.values(padding.value).reduce((a, b) => a + b, 0)
})

const svg = computed(() => {
    const small = 56;
    const big = 312;
    return {
        height: isVertical.value ? big : small,
        width: isVertical.value ? small : big,
    }
})

const max = ref(100);

const proportion = computed(() => {
    return props.dataset.percentage / max.value
});

const tickSize = computed(() => {
    if (isVertical.value) {
        return {
            mark: ((svg.value.height - totalPadding.value) / 100) * 0.5,
            space: ((svg.value.height - totalPadding.value) / 100) * 0.5
        }
    } else {
        return {
            mark: ((svg.value.width - totalPadding.value) / 100) * 0.5,
            space: ((svg.value.width - totalPadding.value) / 100) * 0.5
        }
    }
})

const ticks = computed(() => {
    const arr = [];
    const marks = 100;
    for (let i = 0; i < marks; i += 1) {
        const color = tiremarksConfig.value.style.chart.layout.ticks.gradient.show ? shiftHue(tiremarksConfig.value.style.chart.layout.activeColor, i / marks * (tiremarksConfig.value.style.chart.layout.ticks.gradient.shiftHueIntensity / 100)) : tiremarksConfig.value.style.chart.layout.activeColor;
        if(isVertical.value) {
            const verticalCrescendo = tiremarksConfig.value.style.chart.layout.crescendo ? ((marks - i) * (svg.value.width - padding.value.left - padding.value.right) / marks / 3) : 0;
            const v_x1 = padding.value.left + 4 + verticalCrescendo;
            const v_x2 = svg.value.width - padding.value.right - 4 - verticalCrescendo;
            const v_y1 = svg.value.height - padding.value.bottom - (i * tickSize.value.mark) - (i * tickSize.value.space) - tickSize.value.mark;
            const v_y2 = svg.value.height - padding.value.bottom - (i * tickSize.value.mark) - (i * tickSize.value.space) - tickSize.value.mark;
            const v_space_x = (v_x2 - v_x1 ) / tiremarksConfig.value.style.chart.layout.curveAngleX;
            const v_space_y = tiremarksConfig.value.style.chart.layout.curveAngleY * ((1 + i) / marks);
            arr.push({
                x1: v_x1,
                x2: v_x2,
                y1: v_y1,
                y2: v_y2,
                curve: `M ${v_x1} ${v_y1} C ${v_x1 + v_space_x} ${v_y1 - v_space_y}, ${v_x2 - v_space_x} ${v_y2 - v_space_y}, ${v_x2} ${v_y2}`,
                color
            })
        } else {
            const horizontalCrescendo = tiremarksConfig.value.style.chart.layout.crescendo ? ((marks - i) * (svg.value.height - padding.value.top - padding.value.bottom) / marks / 3)  : 0;
            const h_x1 = padding.value.left + (i * tickSize.value.mark) + (i * tickSize.value.space) - tickSize.value.mark;
            const h_x2 = h_x1;
            const h_y1 = padding.value.top + 4 + horizontalCrescendo;
            const h_y2 = svg.value.height - padding.value.bottom - 4 - horizontalCrescendo;
            const h_space_x = tiremarksConfig.value.style.chart.layout.curveAngleY * ((1 + i) / marks);
            const h_space_y = (h_y2 - h_y1 ) / tiremarksConfig.value.style.chart.layout.curveAngleX;
            arr.push({
                x1: h_x1,
                x2: h_x2,
                y1: h_y1,
                y2: h_y2,
                curve: `M ${h_x1} ${h_y1} C ${h_x1 + h_space_x} ${h_y1 + h_space_y}, ${h_x2 + h_space_x} ${h_y2 - h_space_y}, ${h_x2} ${h_y2}`,
                color
            })
        }
    }
    return arr;
});

const dataLabel = computed(() => {
    let x,y,textAnchor,fontSize;
    const fontSizeOffset = tiremarksConfig.value.style.chart.percentage.fontSize / 3;

    if(isVertical.value) {
        if(tiremarksConfig.value.style.chart.percentage.verticalPosition === 'top') {
            x = svg.value.width / 2;
            y = padding.value.top / 2;
            textAnchor = 'middle';
        } else if(tiremarksConfig.value.style.chart.percentage.verticalPosition === 'bottom') {
            x = svg.value.width / 2;
            y = svg.value.height - (padding.value.bottom / 2) + fontSizeOffset;
            textAnchor = 'middle';
        }
    } else {
        if(tiremarksConfig.value.style.chart.percentage.horizontalPosition === 'left') {
            x = 4;
            y = (svg.value.height / 2) + fontSizeOffset;
            textAnchor = 'start';
        } else if(tiremarksConfig.value.style.chart.percentage.horizontalPosition === 'right') {
            x = svg.value.width - padding.value.right + 8;
            y = (svg.value.height / 2) + fontSizeOffset;
            textAnchor = 'start';
        }
    }

    return {
        x,
        y,
        textAnchor,
        bold: tiremarksConfig.value.style.chart.percentage.bold,
        fontSize: tiremarksConfig.value.style.chart.percentage.fontSize,
        fill: tiremarksConfig.value.style.chart.percentage.color
    }
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
            domElement: document.getElementById(`${uid.value}`),
            fileName: tiremarksConfig.value.style.chart.title.text || 'vue-ui-tiremarks'
        }).finally(() => {
            isPrinting.value = false;
        })
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
            domElement: document.getElementById(`${uid.value}`),
            fileName: tiremarksConfig.value.style.chart.title.text || 'vue-ui-tiremarks',
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
    <div ref="tiremarksChart" :class="`vue-ui-tiremarks ${tiremarksConfig.useCssAnimation ? '' : 'vue-ui-dna'}`" :style="`font-family:${tiremarksConfig.style.fontFamily};width:100%; text-align:center;${(!tiremarksConfig.style.chart.title.text) ? 'padding-top:36px' : ''};background:${tiremarksConfig.style.chart.backgroundColor}`" :id="uid">

        <div v-if="tiremarksConfig.style.chart.title.text" :style="`width:100%;background:${tiremarksConfig.style.chart.backgroundColor};padding-bottom:12px`">
            <Title
                :config="{
                    title: {
                        cy: 'wheel-title',
                        text: tiremarksConfig.style.chart.title.text,
                        color: tiremarksConfig.style.chart.title.color,
                        fontSize: tiremarksConfig.style.chart.title.fontSize,
                        bold: tiremarksConfig.style.chart.title.bold
                    },
                    subtitle: {
                        cy: 'wheel-subtitle',
                        text: tiremarksConfig.style.chart.title.subtitle.text,
                        color: tiremarksConfig.style.chart.title.subtitle.color,
                        fontSize: tiremarksConfig.style.chart.title.subtitle.fontSize,
                        bold: tiremarksConfig.style.chart.title.subtitle.bold
                    },
                }"
            />
        </div>

        <UserOptions
            ref="details"
            :key="`user_options_${step}`"
            v-if="tiremarksConfig.userOptions.show && isDataset"
            :backgroundColor="tiremarksConfig.style.chart.backgroundColor"
            :color="tiremarksConfig.style.chart.color"
            :isPrinting="isPrinting"
            :isImaging="isImaging"
            :title="tiremarksConfig.userOptions.title"
            :uid="uid"
            hasFullscreen
            :isFullscreen="isFullscreen"
            @toggleFullscreen="toggleFullscreen"
            :chartElement="tiremarksChart"
            :hasImg="true"
            :hasXls="false"
            @generatePdf="generatePdf"
            @generateImage="generateImage"
        />

        <svg :xmlns="XMLNS" v-if="isDataset" :class="{ 'vue-data-ui-fullscreen--on': isFullscreen, 'vue-data-ui-fulscreen--off': !isFullscreen }" :viewBox="`0 0 ${svg.width} ${svg.height}`" :style="`max-width:100%; overflow: visible; background:${tiremarksConfig.style.chart.backgroundColor};color:${tiremarksConfig.style.chart.color}`">
            <g v-if="tiremarksConfig.style.chart.layout.curved">
                <path
                    v-for="(tick, i) in ticks"
                    :d="tick.curve"
                    :stroke-width="tickSize.mark"
                    :stroke="activeValue >= i ? tick.color : tiremarksConfig.style.chart.layout.inactiveColor"
                    stroke-linecap="round"
                    fill="none"
                    :class="{ 'vue-ui-tick-animated': tiremarksConfig.style.chart.animation.use && i <= activeValue }"
                />
            </g>
            <g v-else>
                <line
                    v-for="(tick, i) in ticks"
                    :x1="tick.x1"
                    :y1="tick.y1"
                    :x2="tick.x2"
                    :y2="tick.y2"
                    :stroke-width="tickSize.mark"
                    :stroke="activeValue >= i ? tick.color : tiremarksConfig.style.chart.layout.inactiveColor"
                    stroke-linecap="round"
                />
            </g>
            <text
                v-if="tiremarksConfig.style.chart.percentage.show"
                :x="dataLabel.x"
                :y="dataLabel.y"
                :font-size="dataLabel.fontSize"
                :fill="tiremarksConfig.style.chart.layout.ticks.gradient.show && tiremarksConfig.style.chart.percentage.useGradientColor ? shiftHue(tiremarksConfig.style.chart.layout.activeColor, activeValue / 100 * (tiremarksConfig.style.chart.layout.ticks.gradient.shiftHueIntensity / 100)) : tiremarksConfig.style.chart.percentage.color"
                :font-weight="dataLabel.bold ? 'bold': 'normal'"
                :text-anchor="dataLabel.textAnchor"
            >
                {{ activeValue.toFixed(tiremarksConfig.style.chart.percentage.rounding) + '%' }}
            </text>
            <slot name="svg" :svg="svg"/>
        </svg>

        <Skeleton
            v-if="!isDataset"
            :config="{
                type: 'tiremarks',
                style: {
                    backgroundColor: tiremarksConfig.style.chart.backgroundColor,
                    tiremarks: {
                        color: '#CCCCCC'
                    }
                }
            }"
        />

    </div>
</template>

<style scoped>
@import "../vue-data-ui.css";
.vue-ui-tiremarks * {
    transition: unset;
}
.vue-ui-tiremarks {
    user-select: none;
    position: relative;
}
.vue-ui-tick-animated {
    animation: animate-tick 0.3s ease-in;
    transform-origin: center;
}

@keyframes animate-tick {
    0% {
        stroke-width: 2;
        transform: scale(1,1.1);
    }
    100% {
        stroke-width: initial;
        transform: scale(1,1);
    }
}
</style>