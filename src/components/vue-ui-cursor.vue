<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from "vue";
import { useNestedProp } from "../useNestedProp";
import mainConfig from "../default_configs.json";
import { createUid, opacity, XMLNS } from "../lib";

const props = defineProps({
    config: {
        type: Object,
        default: {}
    }
});

const defaultConfig = ref(mainConfig.vue_ui_cursor);
const uid = ref(createUid())

const cursorConfig = computed(() => {
    return useNestedProp({
        userConfig: props.config,
        defaultConfig: defaultConfig.value
    });
})

const position = ref({
    x: -100,
    y: -100
});

function setClientPosition({ clientX, clientY, ...rest }) {
    position.value.x = clientX - (cursorConfig.value.centerCircleRadius);
    position.value.y = clientY - (cursorConfig.value.centerCircleRadius);
}
  
function setFingerPosition(data) {
    position.value.x = data.targetTouches[0].clientX - (cursorConfig.value.centerCircleRadius);
    position.value.y = data.targetTouches[0].clientY - (cursorConfig.value.centerCircleRadius);
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
    const vdui = cursorConfig.value.parentId ? document.getElementById(cursorConfig.value.parentId) : document.getElementsByTagName('div')[0];
    vdui.addEventListener('mousemove', setClientPosition);
    vdui.addEventListener('touchmove', setFingerPosition);
    vdui.addEventListener('mouseleave', () => setVisibility(false))
    vdui.addEventListener('mouseenter', () => setVisibility(true))
    vdui.addEventListener('click', setClicked)
})

onBeforeUnmount(() => {
    const vdui = cursorConfig.value.parentId ? document.getElementById(cursorConfig.value.parentId) : document.getElementsByTagName('div')[0];
    vdui.removeEventListener('mousemove', setClientPosition);
    vdui.removeEventListener('touchmove', setFingerPosition);
    vdui.removeEventListener('mouseleave', () => setVisibility(false))
    vdui.removeEventListener('mouseenter', () => setVisibility(true))
    vdui.removeEventListener('click', setClicked)
})

const waveScale = computed(() => {
    return cursorConfig.value.centerCircleRadius / 2.5
})

</script>

<template>
    <svg data-html2canvas-ignore :xmlns="XMLNS" v-if="isVisible" :style="`z-index: 2147483647; overflow: visible; pointer-events: none;background: transparent; position:fixed; top:${position.y}px; left:${position.x}px;`" viewBox="0 0 100 100" :height="cursorConfig.centerCircleRadius * 2" :width="cursorConfig.centerCircleRadius * 2">
        <defs>
            <radialGradient id="follower" fy="30%" fx="30%">
                <stop offset="10%" :stop-color="cursorConfig.bubbleEffectColor" :stop-opacity="cursorConfig.bubbleEffectOpacity"/>
                <stop offset="95%" stop-color="transparent" />
            </radialGradient>
        </defs>
        <circle
            v-if="cursorConfig.showCenterCircle"
            :cx="50" 
            :cy="50" 
            :r="cursorConfig.centerCircleRadius" 
            :fill="cursorConfig.centerCircleColor + opacity[cursorConfig.centerCircleOpacity * 100]" 
            :stroke="cursorConfig.centerCircleStroke"
            :stroke-width="cursorConfig.centerCircleStrokeWidth"
            :stroke-dasharray="cursorConfig.centerCircleDasharray"
        />
        <circle
            v-if="cursorConfig.bubbleEffect"
            :cx="50" 
            :cy="50" 
            :r="cursorConfig.centerCircleRadius" 
            :fill="'url(#follower)'"
            stroke="none"
        />
        <g class="wave" v-if="cursorConfig.useWaveOnClick">
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
                :stroke="cursorConfig.centerCircleStroke"
                fill="none"
                stroke-width="3"
            />
        </g>
        <g class="crosshair" v-if="cursorConfig.showCrosshair">        
            <line
                :x1="-cursorConfig.centerCircleRadius + 50"
                :x2="-5000"
                :y1="50"
                :y2="50"
                :stroke="cursorConfig.crosshairStroke"
                :stroke-width="cursorConfig.crosshairStrokeWidth"
                :stroke-dasharray="cursorConfig.crosshairDasharray"
                stroke-linecap="round"
            />
            <line
                :x1="50 + cursorConfig.centerCircleRadius"
                :x2="5000"
                :y1="50"
                :y2="50"
                :stroke="cursorConfig.crosshairStroke"
                :stroke-width="cursorConfig.crosshairStrokeWidth"
                :stroke-dasharray="cursorConfig.crosshairDasharray"
                stroke-linecap="round"
            />
            <line
                :x1="50"
                :x2="50"
                :y1="-cursorConfig.centerCircleRadius + 50"
                :y2="-5000"
                :stroke="cursorConfig.crosshairStroke"
                :stroke-width="cursorConfig.crosshairStrokeWidth"
                :stroke-dasharray="cursorConfig.crosshairDasharray"
                stroke-linecap="round"
            />
            <line
                :x1="50"
                :x2="50"
                :y1="cursorConfig.centerCircleRadius + 50"
                :y2="5000"
                :stroke="cursorConfig.crosshairStroke"
                :stroke-width="cursorConfig.crosshairStrokeWidth"
                :stroke-dasharray="cursorConfig.crosshairDasharray"
                stroke-linecap="round"
            />
        </g>
        <g v-if="cursorConfig.showIntersectCircles" :class="{ 'rotating-circles': cursorConfig.isLoading }">
            <circle
                :cx="50"
                :cy="cursorConfig.centerCircleRadius + 50"
                :r="cursorConfig.intersectCirclesRadius"
                :fill="cursorConfig.intersectCirclesFill"
            />
            <circle
                :cx="50"
                :cy="-cursorConfig.centerCircleRadius + 50"
                :r="cursorConfig.intersectCirclesRadius"
                :fill="cursorConfig.intersectCirclesFill"
            />
            <circle
                :cx="-cursorConfig.centerCircleRadius + 50"
                :cy="50"
                :r="cursorConfig.intersectCirclesRadius"
                :fill="cursorConfig.intersectCirclesFill"
            />
            <circle
                :cx="cursorConfig.centerCircleRadius + 50"
                :cy="50"
                :r="cursorConfig.intersectCirclesRadius"
                :fill="cursorConfig.intersectCirclesFill"
            />
        </g>
        <g class="coordinates" v-if="cursorConfig.showCoordinates">
            <text
                text-anchor="end"
                :x="-cursorConfig.centerCircleRadius + 50 - (cursorConfig.coordinatesFontSize / 2) + cursorConfig.coordinatesOffset"
                :y="50 - (cursorConfig.coordinatesFontSize / 2) + cursorConfig.coordinatesOffset"
                :font-size="cursorConfig.coordinatesFontSize"
                :fill="cursorConfig.coordinatesColor"
                style="font-variant-numeric: tabular-nums"
                font-family="Arial"
            >
                {{ position.x.toFixed(0) }}
            </text>
            <g :transform="`translate(${50 - (cursorConfig.coordinatesFontSize / 2) + cursorConfig.coordinatesOffset}, ${-cursorConfig.centerCircleRadius + 50 - (cursorConfig.coordinatesFontSize / 2) + cursorConfig.coordinatesOffset})`">
                <text
                    text-anchor="start"
                    :font-size="cursorConfig.coordinatesFontSize"
                    :fill="cursorConfig.coordinatesColor"
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