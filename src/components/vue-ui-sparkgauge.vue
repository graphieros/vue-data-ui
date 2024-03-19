<script setup>
import { ref, computed, onMounted } from "vue";
import mainConfig from "../default_configs.json";
import { useNestedProp } from "../useNestedProp";
import { createUid, dataLabel, interpolateColorHex } from "../lib";

const props = defineProps({
    config: {
        type: Object,
        default() {
            return {}
        }
    },
    dataset: {
        type: Object,
        default(){
            return {}
        }
    }
})

const defaultConfig = ref(mainConfig.vue_ui_sparkgauge);

const sparkgaugeConfig = computed(() => {
    return useNestedProp({
        userConfig: props.config,
        defaultConfig: defaultConfig.value
    })
});

const svg = computed(() => {
    return {
        height: sparkgaugeConfig.value.style.height,
        width: 128,
        base: sparkgaugeConfig.value.style.basePosition
    }
})

console.log(svg.value)

const bounds = computed(() => {
    const min = props.dataset.min ?? 0;
    const max = props.dataset.max ?? 0;
    const diff = max - min;
    return {
        min,
        max,
        diff
    }
})

const currentScore = ref(sparkgaugeConfig.value.style.animation.show ? bounds.value.min : props.dataset.value);

const animationTick = computed(() => {
    return bounds.value.diff / sparkgaugeConfig.value.style.animation.speedMs;
})

onMounted(() => {
    function animate() {
        currentScore.value += animationTick.value;
        if(currentScore.value < props.dataset.value) {
            requestAnimationFrame(animate)
        } else {
            currentScore.value = props.dataset.value
        }
    }
    if(sparkgaugeConfig.value.style.animation.show) {
        currentScore.value = bounds.value.min;
        animate();
    }
})

const nameLabel = computed(() => {
    return props.dataset.title ?? ''
})

const valueRatio = computed(() => {
    if(currentScore.value >= 0) {
        return (currentScore.value - bounds.value.min) / bounds.value.diff
    } else {
        return (Math.abs(bounds.value.min) - Math.abs(currentScore.value)) / bounds.value.diff
    }
})

const currentColor = computed(() => {
    return interpolateColorHex(sparkgaugeConfig.value.style.colors.min, sparkgaugeConfig.value.style.colors.max, bounds.value.min, bounds.value.max, currentScore.value)
})

const labelColor = computed(() => {
    if(!sparkgaugeConfig.value.style.dataLabel.autoColor) {
        return sparkgaugeConfig.value.style.dataLabel.color;
    } else {
        return currentColor.value;
    }
})

const trackColor = computed(() => {
    if (!sparkgaugeConfig.value.style.track.autoColor) {
        return sparkgaugeConfig.value.style.track.color;
    } else {
        return currentColor.value;
    }
})
</script>

<template>
<div :style="`font-family:${sparkgaugeConfig.style.fontFamily};width: 100%; background:${sparkgaugeConfig.style.background}`">
    <!-- TITLE TOP -->
    <div v-if="sparkgaugeConfig.style.title.show && nameLabel && sparkgaugeConfig.style.title.position === 'top'" class="vue-data-ui-sparkgauge-label" :style="`font-size:${sparkgaugeConfig.style.title.fontSize}px;text-align:${sparkgaugeConfig.style.title.textAlign};font-weight:${sparkgaugeConfig.style.title.bold ? 'bold': 'normal'};©`">
        {{ nameLabel }}
    </div>
    <svg :viewBox="`0 0 ${svg.width} ${svg.height}`" :style="`overflow: visible; background:${sparkgaugeConfig.style.background}; width:100%;`">
        <!-- GUTTER -->
        <path
            :d="`M${10} ${svg.base} A 1 1 0 1 1 ${118} ${svg.base}`"
            :stroke="sparkgaugeConfig.style.gutter.color"
            :stroke-width="8"
            :stroke-linecap="sparkgaugeConfig.style.gutter.strokeLinecap"
            fill="none"
        />
        <!-- TRACK -->
        <path
            v-if="valueRatio !== 0"
            :d="`M${10} ${svg.base} A 1 1 0 1 1 ${118} ${svg.base}`"
            :stroke="trackColor"
            :stroke-width="8"
            :stroke-linecap="sparkgaugeConfig.style.track.strokeLinecap"
            fill="none"
            :stroke-dasharray="169.5"
            :stroke-dashoffset="169.5 - (169.5 * valueRatio)"
            :class="{'vue-ui-sparkgauge-track' : sparkgaugeConfig.style.animation.show }"
            :style="sparkgaugeConfig.style.animation.show ? `animation: vue-ui-sparkgauge-animation ${sparkgaugeConfig.style.animation.speedMs}ms ease-in;`: ''"
        />
        <!-- DATALABEL -->
        <text
            text-anchor="middle"
            :x="svg.width / 2"
            :y="svg.base + 6 + sparkgaugeConfig.style.dataLabel.offsetY"
            :font-size="sparkgaugeConfig.style.dataLabel.fontSize"
            :fill="labelColor"
            :font-weight="sparkgaugeConfig.style.dataLabel.bold ? 'bold' : 'normal'"
        >
            {{ dataLabel({ p: sparkgaugeConfig.style.dataLabel.prefix, v: currentScore, s: sparkgaugeConfig.style.dataLabel.suffix, r: sparkgaugeConfig.style.dataLabel.rounding }) }}
        </text>
    </svg>
    <!-- TITLE BOTTOM -->
    <div v-if="sparkgaugeConfig.style.title.show && nameLabel && sparkgaugeConfig.style.title.position === 'bottom'" class="vue-data-ui-sparkgauge-label" :style="`font-size:${sparkgaugeConfig.style.title.fontSize}px;text-align:${sparkgaugeConfig.style.title.textAlign};font-weight:${sparkgaugeConfig.style.title.bold ? 'bold': 'normal'};font-weight:${sparkgaugeConfig.style.title.bold ? 'bold': 'normal'}`">
        {{ nameLabel }}
    </div>
</div>
</template>

<style>
@keyframes vue-ui-sparkgauge-animation {
    from {
        stroke-dashoffset: 169.5;
        opacity: -1;
    }
}
</style>