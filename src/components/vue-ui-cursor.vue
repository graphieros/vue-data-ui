<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from "vue";
import { useNestedProp } from "../useNestedProp";
import { createUid, setOpacity, XMLNS } from "../lib";
import { useConfig } from "../useConfig";

const { vue_ui_cursor: DEFAULT_CONFIG } = useConfig();

const props = defineProps({
    config: {
        type: Object,
        default: {}
    }
});

const uid = ref(createUid())

const FINAL_CONFIG = computed(() => {
    return useNestedProp({
        userConfig: props.config,
        defaultConfig: DEFAULT_CONFIG
    });
})

const position = ref({
    x: -100,
    y: -100
});

function setClientPosition({ clientX, clientY, ...rest }) {
    position.value.x = clientX - (FINAL_CONFIG.value.centerCircleRadius);
    position.value.y = clientY - (FINAL_CONFIG.value.centerCircleRadius);
}
  
function setFingerPosition(data) {
    position.value.x = data.targetTouches[0].clientX - (FINAL_CONFIG.value.centerCircleRadius);
    position.value.y = data.targetTouches[0].clientY - (FINAL_CONFIG.value.centerCircleRadius);
}

const isVisible = ref(true);

function setVisibility(isTrue) {
    isVisible.value = isTrue
}

const isClicked = ref(false);
const TO = ref(null);

function setClicked(){
    isClicked.value = false;
    if(TO.value) {
        clearTimeout(TO.value);
    }
    nextTick(() => {
        isClicked.value = true;
        TO.value = setTimeout(() => {
            isClicked.value = false;
        }, 1000);
    })
}

onMounted(() => {
    const vdui = FINAL_CONFIG.value.parentId ? document.getElementById(FINAL_CONFIG.value.parentId) : document.getElementsByTagName('div')[0];
    vdui.addEventListener('mousemove', setClientPosition);
    vdui.addEventListener('touchmove', setFingerPosition);
    vdui.addEventListener('mouseleave', () => setVisibility(false))
    vdui.addEventListener('mouseenter', () => setVisibility(true))
    vdui.addEventListener('click', setClicked)
})

onBeforeUnmount(() => {
    const vdui = FINAL_CONFIG.value.parentId ? document.getElementById(FINAL_CONFIG.value.parentId) : document.getElementsByTagName('div')[0];
    vdui.removeEventListener('mousemove', setClientPosition);
    vdui.removeEventListener('touchmove', setFingerPosition);
    vdui.removeEventListener('mouseleave', () => setVisibility(false))
    vdui.removeEventListener('mouseenter', () => setVisibility(true))
    vdui.removeEventListener('click', setClicked)
})

const waveScale = computed(() => {
    return FINAL_CONFIG.value.centerCircleRadius / 2.5
})

</script>

<template>
    <svg data-html2canvas-ignore :xmlns="XMLNS" v-if="isVisible" :style="`z-index: 2147483647; overflow: visible; pointer-events: none;background: transparent; position:fixed; top:${position.y}px; left:${position.x}px;`" viewBox="0 0 100 100" :height="FINAL_CONFIG.centerCircleRadius * 2" :width="FINAL_CONFIG.centerCircleRadius * 2">
        <defs>
            <radialGradient id="follower" fy="30%" fx="30%">
                <stop offset="10%" :stop-color="FINAL_CONFIG.bubbleEffectColor" :stop-opacity="FINAL_CONFIG.bubbleEffectOpacity"/>
                <stop offset="95%" stop-color="transparent" />
            </radialGradient>
        </defs>
        <circle
            v-if="FINAL_CONFIG.showCenterCircle"
            :cx="50" 
            :cy="50" 
            :r="FINAL_CONFIG.centerCircleRadius" 
            :fill="setOpacity(FINAL_CONFIG.centerCircleColor, FINAL_CONFIG.centerCircleOpacity * 100)" 
            :stroke="FINAL_CONFIG.centerCircleStroke"
            :stroke-width="FINAL_CONFIG.centerCircleStrokeWidth"
            :stroke-dasharray="FINAL_CONFIG.centerCircleDasharray"
        />
        <circle
            v-if="FINAL_CONFIG.bubbleEffect"
            :cx="50" 
            :cy="50" 
            :r="FINAL_CONFIG.centerCircleRadius" 
            :fill="'url(#follower)'"
            stroke="none"
        />
        <g class="wave" v-if="FINAL_CONFIG.useWaveOnClick">
            <defs>
                <filter :id="`blur_${uid}`" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur in="SourceGraphic" :stdDeviation="4" :id="`blur_std_${uid}`" />
                    <feColorMatrix type="saturate" values="0" />
                </filter>
            </defs>
            <circle
                v-if="isClicked"
                :class="{'circle-wave': isClicked}"
                :cx="50"
                :cy="50"
                :r="50"
                :filter="`url(#blur_${uid})`"
                :stroke="FINAL_CONFIG.centerCircleStroke"
                fill="none"
                stroke-width="3"
            />
        </g>
        <g class="crosshair" v-if="FINAL_CONFIG.showCrosshair">        
            <line
                :x1="-FINAL_CONFIG.centerCircleRadius + 50"
                :x2="-5000"
                :y1="50"
                :y2="50"
                :stroke="FINAL_CONFIG.crosshairStroke"
                :stroke-width="FINAL_CONFIG.crosshairStrokeWidth"
                :stroke-dasharray="FINAL_CONFIG.crosshairDasharray"
                stroke-linecap="round"
            />
            <line
                :x1="50 + FINAL_CONFIG.centerCircleRadius"
                :x2="5000"
                :y1="50"
                :y2="50"
                :stroke="FINAL_CONFIG.crosshairStroke"
                :stroke-width="FINAL_CONFIG.crosshairStrokeWidth"
                :stroke-dasharray="FINAL_CONFIG.crosshairDasharray"
                stroke-linecap="round"
            />
            <line
                :x1="50"
                :x2="50"
                :y1="-FINAL_CONFIG.centerCircleRadius + 50"
                :y2="-5000"
                :stroke="FINAL_CONFIG.crosshairStroke"
                :stroke-width="FINAL_CONFIG.crosshairStrokeWidth"
                :stroke-dasharray="FINAL_CONFIG.crosshairDasharray"
                stroke-linecap="round"
            />
            <line
                :x1="50"
                :x2="50"
                :y1="FINAL_CONFIG.centerCircleRadius + 50"
                :y2="5000"
                :stroke="FINAL_CONFIG.crosshairStroke"
                :stroke-width="FINAL_CONFIG.crosshairStrokeWidth"
                :stroke-dasharray="FINAL_CONFIG.crosshairDasharray"
                stroke-linecap="round"
            />
        </g>
        <g v-if="FINAL_CONFIG.showIntersectCircles" :class="{ 'rotating-circles': FINAL_CONFIG.isLoading }">
            <circle
                :cx="50"
                :cy="FINAL_CONFIG.centerCircleRadius + 50"
                :r="FINAL_CONFIG.intersectCirclesRadius"
                :fill="FINAL_CONFIG.intersectCirclesFill"
            />
            <circle
                :cx="50"
                :cy="-FINAL_CONFIG.centerCircleRadius + 50"
                :r="FINAL_CONFIG.intersectCirclesRadius"
                :fill="FINAL_CONFIG.intersectCirclesFill"
            />
            <circle
                :cx="-FINAL_CONFIG.centerCircleRadius + 50"
                :cy="50"
                :r="FINAL_CONFIG.intersectCirclesRadius"
                :fill="FINAL_CONFIG.intersectCirclesFill"
            />
            <circle
                :cx="FINAL_CONFIG.centerCircleRadius + 50"
                :cy="50"
                :r="FINAL_CONFIG.intersectCirclesRadius"
                :fill="FINAL_CONFIG.intersectCirclesFill"
            />
        </g>
        <g class="coordinates" v-if="FINAL_CONFIG.showCoordinates">
            <text
                text-anchor="end"
                :x="-FINAL_CONFIG.centerCircleRadius + 50 - (FINAL_CONFIG.coordinatesFontSize / 2) + FINAL_CONFIG.coordinatesOffset"
                :y="50 - (FINAL_CONFIG.coordinatesFontSize / 2) + FINAL_CONFIG.coordinatesOffset"
                :font-size="FINAL_CONFIG.coordinatesFontSize"
                :fill="FINAL_CONFIG.coordinatesColor"
                style="font-variant-numeric: tabular-nums"
                font-family="Arial"
            >
                {{ position.x.toFixed(0) }}
            </text>
            <g :transform="`translate(${50 - (FINAL_CONFIG.coordinatesFontSize / 2) + FINAL_CONFIG.coordinatesOffset}, ${-FINAL_CONFIG.centerCircleRadius + 50 - (FINAL_CONFIG.coordinatesFontSize / 2) + FINAL_CONFIG.coordinatesOffset})`">
                <text
                    text-anchor="start"
                    :font-size="FINAL_CONFIG.coordinatesFontSize"
                    :fill="FINAL_CONFIG.coordinatesColor"
                    style="font-variant-numeric: tabular-nums"
                    transform="rotate(-90)"
                    font-family="Arial"
                >
                    {{ position.y.toFixed(0) }}
                </text>
            </g>
        </g>
    </svg>
</template>

<style scoped>
.rotating-circles {
    transform-origin: center;
    animation: rotateCircles 2s infinite linear;
}

@keyframes rotateCircles {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

.circle-wave {
    animation: circleWave 1s cubic-bezier(0, 1.01, 1, 1);
    transform-origin: center;
}

@keyframes circleWave {
    from {
        transform: scale(1, 1);
        opacity: 1;
    }
    to {
        transform: scale(20, 20);
        opacity: 0;
    }
}

</style>