<script setup>
import { ref, computed, nextTick, onMounted } from "vue";
import pdf from "../pdf";
import img from "../img";
import mainConfig from "../default_configs.json";
import { useNestedProp } from "../useNestedProp";
import Title from "../atoms/Title.vue";
import UserOptions from "../atoms/UserOptions.vue";
import { shiftHue } from "../lib";

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

const uid = ref(`vue-ui-wheel-${Math.random()}`);
const defaultConfig = ref(mainConfig.vue_ui_wheel);

const isImaging = ref(false);
const isPrinting = ref(false);
const wheelChart = ref(null);
const details = ref(null);


const wheelConfig = computed(() => {
    return useNestedProp({
        userConfig: props.config,
        defaultConfig: defaultConfig.value
    });
});

const svg = ref({
    size: 360
})

const wheel = computed(() => {
    return {
        radius: (svg.value.size * 0.9) / 2,
        centerX: svg.value.size / 2,
        centerY: svg.value.size / 2,
    }
})

function calcTickStart(angle, distance = 1) {
    const angleStart = 29.85;
    return {
        x: wheel.value.centerX + wheel.value.radius * Math.cos(angleStart + angle * Math.PI / 180) * distance,
        y: wheel.value.centerY + wheel.value.radius * Math.sin(angleStart + angle * Math.PI / 180) * distance
    }
}

const activeValue = ref(wheelConfig.value.style.chart.animation.use ? 0 : props.dataset.percentage);

onMounted(() => {
    let acceleration = 0;
    let speed = wheelConfig.value.style.chart.animation.speed;
    let incr = (0.005) * wheelConfig.value.style.chart.animation.acceleration;
    function animate() {
        activeValue.value += speed + acceleration;
        acceleration += incr;
        if(activeValue.value < props.dataset.percentage) {
            requestAnimationFrame(animate)
        } else {
            activeValue.value = props.dataset.percentage
        }
    }

    if(wheelConfig.value.style.chart.animation.use) {
        activeValue.value = 0;
        animate()
    }
})

const ticks = computed(() => {
    const tickArray = [];
    const tickAmount = 100;
    for(let i = 0; i < tickAmount; i += 1) {
        const color = activeValue.value > i ? wheelConfig.value.style.chart.layout.wheel.ticks.activeColor : wheelConfig.value.style.chart.layout.wheel.ticks.inactiveColor;
        tickArray.push({
            x1: calcTickStart((360 / tickAmount) * i).x,
            y1: calcTickStart((360 / tickAmount) * i).y,
            x2: calcTickStart((360 / tickAmount) * i, 0.9).x,
            y2: calcTickStart((360 / tickAmount) * i, 0.9).y,
            color: wheelConfig.value.style.chart.layout.wheel.ticks.gradient.show ? shiftHue(color, i / tickAmount * (wheelConfig.value.style.chart.layout.wheel.ticks.gradient.shiftHueIntensity / 100)) : color
        })
    }
    return tickArray
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
            fileName: wheelConfig.value.style.chart.title.text || 'vue-ui-wheel'
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
            fileName: wheelConfig.value.style.chart.title.text || 'vue-ui-wheel',
            format: 'png'
        }).finally(() => {
            isImaging.value = false;
        })
    }, 100)
}

defineExpose({
    generatePdf,
    generateImage
});

</script>

<template>
    <div 
        class="vue-ui-wheel" 
        ref="wheelChart"
        :id="uid"
        :style="`font-family:${wheelConfig.style.fontFamily};width:100%; text-align:center;${wheelConfig.userOptions.show ? 'padding-top:36px' : ''}`"
    >

        <div v-if="wheelConfig.style.chart.title.text" :style="`width:100%;background:${wheelConfig.style.chart.backgroundColor};padding-bottom:12px`">
            <Title
                :config="{
                    title: {
                        cy: 'wheel-title',
                        text: wheelConfig.style.chart.title.text,
                        color: wheelConfig.style.chart.title.color,
                        fontSize: wheelConfig.style.chart.title.fontSize,
                        bold: wheelConfig.style.chart.title.bold
                    },
                    subtitle: {
                        cy: 'wheel-subtitle',
                        text: wheelConfig.style.chart.title.subtitle.text,
                        color: wheelConfig.style.chart.title.subtitle.color,
                        fontSize: wheelConfig.style.chart.title.subtitle.fontSize,
                        bold: wheelConfig.style.chart.title.subtitle.bold
                    },
                }"
            />
        </div>

        <UserOptions
            ref="details"
            v-if="wheelConfig.userOptions.show"
            :backgroundColor="wheelConfig.style.chart.backgroundColor"
            :color="wheelConfig.style.chart.color"
            :isPrinting="isPrinting"
            :isImaging="isImaging"
            :title="wheelConfig.userOptions.title"
            :uid="uid"
            :hasImg="true"
            :hasXls="false"
            @generatePdf="generatePdf"
            @generateImage="generateImage"
        />

        <svg data-cy="wheel-svg" :viewBox="`0 0 ${svg.size} ${svg.size}`" :style="`max-width:100%;overflow:visible;background:${wheelConfig.style.chart.backgroundColor};color:${wheelConfig.style.chart.color}`">
            <line 
                v-for="(tick, i) in ticks"
                :x1="tick.x1"
                :x2="tick.x2"
                :y1="tick.y1"
                :y2="tick.y2"
                :stroke="tick.color"
                :stroke-width="5"
                :stroke-linecap="wheelConfig.style.chart.layout.wheel.ticks.rounded ? 'round' : 'butt'"
                :class="{ 'vue-ui-tick-animated': wheelConfig.style.chart.animation.use && i <= activeValue }"
            />
            <circle 
                v-if="wheelConfig.style.chart.layout.innerCircle.show"
                :cx="wheel.centerX"
                :cy="wheel.centerY"
                :r="wheel.radius * 0.8"
                :stroke="wheelConfig.style.chart.layout.innerCircle.stroke"
                :stroke-width="wheelConfig.style.chart.layout.innerCircle.strokeWidth"
                fill="none"
            />
            <text
                v-if="wheelConfig.style.chart.layout.percentage.show"
                :x="wheel.centerX"
                :y="wheel.centerY + wheelConfig.style.chart.layout.percentage.fontSize / 3"
                :font-size="wheelConfig.style.chart.layout.percentage.fontSize"
                :fill="wheelConfig.style.chart.layout.wheel.ticks.gradient.show ? shiftHue(wheelConfig.style.chart.layout.wheel.ticks.activeColor, activeValue / 100 * (wheelConfig.style.chart.layout.wheel.ticks.gradient.shiftHueIntensity / 100)) : wheelConfig.style.chart.layout.wheel.ticks.activeColor"
                text-anchor="middle"
                :font-weight="wheelConfig.style.chart.layout.percentage.bold ? 'bold' : 'normal'"
                style="font-variant-numeric:tabluar-nums"
            >
                {{ Number(activeValue.toFixed(wheelConfig.style.chart.layout.percentage.rounding)).toLocaleString() }}%
            </text>
        </svg>
    
    </div>
</template>

<style scoped>
.vue-ui-wheel *{
    transition: unset;
}
.vue-ui-wheel {
    user-select: none;
    position: relative;
}
.vue-ui-tick-animated {
    animation: animate-tick 0.3s ease-in;
    transform-origin: center;
}

@keyframes animate-tick {
    0% {
        stroke-width: 8;
    }
    80% {
        stroke-width: 6;
    }
    100% {
        stroke-width: 5;
    }
}
</style>