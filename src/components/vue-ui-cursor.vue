<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from "vue";
import { useNestedProp } from "../useNestedProp";
import { createUid, setOpacity, XMLNS } from "../lib";
import { useConfig } from "../useConfig";
import PackageVersion from "../atoms/PackageVersion.vue";

const { vue_ui_cursor: DEFAULT_CONFIG } = useConfig();

const props = defineProps({
    config: {
        type: Object,
        default: {}
    }
});

const uid = ref(createUid());

const FINAL_CONFIG = computed(() => {
    return useNestedProp({
        userConfig: props.config,
        defaultConfig: DEFAULT_CONFIG
    });
});

const position = ref({
    x: -100,
    y: -100
});

const circleRadius = computed(() => Math.round(FINAL_CONFIG.value.centerCircleRadius));
const coordinatesOffset = computed(() => Math.round(FINAL_CONFIG.value.coordinatesOffset));

function setClientPosition({ clientX, clientY, ...rest }) {
    position.value.x = clientX - circleRadius.value;
    position.value.y = clientY - circleRadius.value;
}

function setFingerPosition(data) {
    position.value.x = data.targetTouches[0].clientX - circleRadius.value;
    position.value.y = data.targetTouches[0].clientY - circleRadius.value;
}

const isVisible = ref(true);

function setVisibility(isTrue) {
    isVisible.value = isTrue;
}

const isClicked = ref(false);
const timeoutReference = ref(null);

function setClicked() {
    isClicked.value = false;
    if (timeoutReference.value) {
        clearTimeout(timeoutReference.value);
    }
    nextTick(() => {
        isClicked.value = true;
        timeoutReference.value = setTimeout(() => {
            isClicked.value = false;
        }, 1000);
    });
}

const cursorContainerElement = ref(null);
const domObserver = ref(null);

function getCursorContainerElement() {
    if (FINAL_CONFIG.value.parentId) {
        return document.getElementById(FINAL_CONFIG.value.parentId);
    }
    const firstDiv = document.getElementsByTagName("div")[0];
    return firstDiv || null;
}

function addEventListeners(element) {
    if (!element) return;
    element.addEventListener("mousemove", setClientPosition);
    element.addEventListener("touchmove", setFingerPosition);
    element.addEventListener("mouseleave", () => setVisibility(false));
    element.addEventListener("mouseenter", () => setVisibility(true));
    element.addEventListener("click", setClicked);
}

function removeEventListeners(element) {
    if (!element) return;
    element.removeEventListener("mousemove", setClientPosition);
    element.removeEventListener("touchmove", setFingerPosition);
    element.removeEventListener("mouseleave", () => setVisibility(false));
    element.removeEventListener("mouseenter", () => setVisibility(true));
    element.removeEventListener("click", setClicked);
}

onMounted(() => {
    const element = getCursorContainerElement();

    if (element) {
        cursorContainerElement.value = element;
        addEventListeners(element);
        return;
    }

    if (!FINAL_CONFIG.value.parentId) {
        return;
    }

    const observer = new MutationObserver(() => {
        const target = getCursorContainerElement();
        if (target) {
            cursorContainerElement.value = target;
            addEventListeners(target);
            observer.disconnect();
            domObserver.value = null;
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    domObserver.value = observer;
});

onBeforeUnmount(() => {
    if (domObserver.value) {
        domObserver.value.disconnect();
        domObserver.value = null;
    }
    if (cursorContainerElement.value) {
        removeEventListeners(cursorContainerElement.value);
        cursorContainerElement.value = null;
    }
});
</script>

<template>
    <Teleport to="body">
        <svg
            data-cy="vue-ui-cursor"
            data-dom-to-png-ignore
            :xmlns="XMLNS"
            v-if="isVisible"
            :style="`z-index: 2147483647; overflow: visible; pointer-events: none;background: transparent; position:fixed; top:${position.y}px; left:${position.x}px;`"
            viewBox="0 0 100 100"
            :height="circleRadius * 2"
            :width="circleRadius * 2"
        >
            <PackageVersion />
            <defs>
                <radialGradient id="follower" fy="30%" fx="30%">
                    <stop
                        offset="10%"
                        :stop-color="FINAL_CONFIG.bubbleEffectColor"
                        :stop-opacity="FINAL_CONFIG.bubbleEffectOpacity"
                    />
                    <stop offset="95%" stop-color="transparent" />
                </radialGradient>
            </defs>
            <circle
                data-cy="center-circle"
                v-if="FINAL_CONFIG.showCenterCircle"
                :cx="50"
                :cy="50"
                :r="circleRadius"
                :fill="setOpacity(FINAL_CONFIG.centerCircleColor, FINAL_CONFIG.centerCircleOpacity * 100)"
                :stroke="FINAL_CONFIG.centerCircleStroke"
                :stroke-width="FINAL_CONFIG.centerCircleStrokeWidth"
                :stroke-dasharray="FINAL_CONFIG.centerCircleDasharray"
            />
            <circle
                data-cy="bubble"
                v-if="FINAL_CONFIG.bubbleEffect"
                :cx="50"
                :cy="50"
                :r="circleRadius"
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
                    data-cy="wave"
                    v-if="isClicked"
                    :class="{ 'circle-wave': isClicked }"
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
                    data-cy="crosshair-x-left"
                    :x1="-circleRadius + 50"
                    :x2="-5000"
                    :y1="50"
                    :y2="50"
                    :stroke="FINAL_CONFIG.crosshairStroke"
                    :stroke-width="FINAL_CONFIG.crosshairStrokeWidth"
                    :stroke-dasharray="FINAL_CONFIG.crosshairDasharray"
                    stroke-linecap="round"
                />
                <line
                    data-cy="crosshair-x-right"
                    :x1="50 + circleRadius"
                    :x2="5000"
                    :y1="50"
                    :y2="50"
                    :stroke="FINAL_CONFIG.crosshairStroke"
                    :stroke-width="FINAL_CONFIG.crosshairStrokeWidth"
                    :stroke-dasharray="FINAL_CONFIG.crosshairDasharray"
                    stroke-linecap="round"
                />
                <line
                    data-cy="crosshair-y-top"
                    :x1="50"
                    :x2="50"
                    :y1="-circleRadius + 50"
                    :y2="-5000"
                    :stroke="FINAL_CONFIG.crosshairStroke"
                    :stroke-width="FINAL_CONFIG.crosshairStrokeWidth"
                    :stroke-dasharray="FINAL_CONFIG.crosshairDasharray"
                    stroke-linecap="round"
                />
                <line
                    data-cy="crosshair-y-bottom"
                    :x1="50"
                    :x2="50"
                    :y1="circleRadius + 50"
                    :y2="5000"
                    :stroke="FINAL_CONFIG.crosshairStroke"
                    :stroke-width="FINAL_CONFIG.crosshairStrokeWidth"
                    :stroke-dasharray="FINAL_CONFIG.crosshairDasharray"
                    stroke-linecap="round"
                />
            </g>
            <g v-if="FINAL_CONFIG.showIntersectCircles" :class="{ 'rotating-circles': FINAL_CONFIG.isLoading }">
                <circle
                    data-cy="intersect-circle-bottom"
                    :cx="50"
                    :cy="circleRadius + 50"
                    :r="FINAL_CONFIG.intersectCirclesRadius"
                    :fill="FINAL_CONFIG.intersectCirclesFill"
                />
                <circle
                    data-cy="intersect-circle-top"
                    :cx="50"
                    :cy="-circleRadius + 50"
                    :r="FINAL_CONFIG.intersectCirclesRadius"
                    :fill="FINAL_CONFIG.intersectCirclesFill"
                />
                <circle
                    data-cy="intersect-circle-left"
                    :cx="-circleRadius + 50"
                    :cy="50"
                    :r="FINAL_CONFIG.intersectCirclesRadius"
                    :fill="FINAL_CONFIG.intersectCirclesFill"
                />
                <circle
                    data-cy="intersect-circle-right"
                    :cx="circleRadius + 50"
                    :cy="50"
                    :r="FINAL_CONFIG.intersectCirclesRadius"
                    :fill="FINAL_CONFIG.intersectCirclesFill"
                />
            </g>
            <g class="coordinates" v-if="FINAL_CONFIG.showCoordinates">
                <text
                    data-cy="coordinates-x"
                    text-anchor="end"
                    :x="-circleRadius + 50 - (FINAL_CONFIG.coordinatesFontSize / 2) + coordinatesOffset"
                    :y="50 - (FINAL_CONFIG.coordinatesFontSize / 2) + coordinatesOffset"
                    :font-size="FINAL_CONFIG.coordinatesFontSize"
                    :fill="FINAL_CONFIG.coordinatesColor"
                    style="font-variant-numeric: tabular-nums"
                    font-family="Arial"
                >
                    {{ position.x.toFixed(0) }}
                </text>
                <g
                    :transform="`translate(${50 - (FINAL_CONFIG.coordinatesFontSize / 2) + coordinatesOffset}, ${-circleRadius + 50 - (FINAL_CONFIG.coordinatesFontSize / 2) + coordinatesOffset})`"
                >
                    <text
                        data-cy="coordinates-y"
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
    </Teleport>
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
