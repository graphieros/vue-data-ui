<script setup>
import { ref, computed } from "vue";
import { useNestedProp } from "../useNestedProp";
import { XMLNS } from "../lib";
import { useConfig } from "../useConfig";

const { vue_ui_mini_loader: DEFAULT_CONFIG } = useConfig();

const props = defineProps({
    config: {
        type: Object,
        default() {
            return {}
        }
    },
});

const FINAL_CONFIG = computed(() => {
    return useNestedProp({
        userConfig: props.config,
        defaultConfig: DEFAULT_CONFIG
    });
});

const viewBox = ref({
    onion: "-10 -10 84 84",
    line: "-10 -10 112 84",
    bar: "-10 -10 106 84"
})

const lineStyle = computed(() => {
    return {
        gutter: `stroke:${FINAL_CONFIG.value.line.gutterColor};opacity:${FINAL_CONFIG.value.line.gutterOpacity};`,
        gutterBlur: `filter:blur(${FINAL_CONFIG.value.line.gutterBlur}px);`
    }
})
const barStyle = computed(() => {
    return {
        gutter: `stroke:${FINAL_CONFIG.value.bar.gutterColor};opacity:${FINAL_CONFIG.value.bar.gutterOpacity};`,
        gutterBlur: `filter:blur(${FINAL_CONFIG.value.bar.gutterBlur}px);`
    }
})
const onionStyle = computed(() => {
    return {
        gutter: `stroke:${FINAL_CONFIG.value.onion.gutterColor};opacity:${FINAL_CONFIG.value.onion.gutterOpacity};`,
        gutterBlur: `filter:blur(${FINAL_CONFIG.value.onion.gutterBlur}px);`
    }
})


const trackBlur = computed(() => `blur(${FINAL_CONFIG.value.onion.trackBlur}px) hue-rotate(${FINAL_CONFIG.value.onion.trackHueRotate}deg)`);

const lineBlur = computed(() => `blur(${FINAL_CONFIG.value.line.trackBlur}px) hue-rotate(${FINAL_CONFIG.value.line.trackHueRotate}deg)`);

const barBlur = computed(() => `blur(${FINAL_CONFIG.value.bar.trackBlur}px) hue-rotate(${FINAL_CONFIG.value.bar.trackHueRotate}deg)`);

</script>

<template>
    <svg class="vue-data-ui-component vue-ui-mini-loader" :xmlns="XMLNS" :viewBox="viewBox[FINAL_CONFIG.type]" style="background: transparent" width="100%">
        <g v-if="FINAL_CONFIG.type === 'onion'" data-cy="variant-onion">        
            <path data-cy="variant-onion-gutter" d="M 3 32 C 3 45 12 62 32 62 A 1 1 0 0 0 32 3" stroke-width="4" fill="none" stroke-linecap="round" :style="onionStyle.gutter + onionStyle.gutterBlur"/>
            <path data-cy="variant-onion-gutter" d="M 13 32 C 13 39 19 52 32 52 A 1 1 0 0 0 32 13" stroke-width="4" fill="none" stroke-linecap="round" :style="onionStyle.gutter + onionStyle.gutterBlur"/>
            <path data-cy="variant-onion-gutter" d="M 23 32 C 23 37 26.5 41 32 41 A 1 1 0 0 0 32 25" stroke-width="4" fill="none" stroke-linecap="round" :style="onionStyle.gutter + onionStyle.gutterBlur"/>

            <path data-cy="variant-onion-track" d="M 3 32 C 3 45 12 62 32 62 A 1 1 0 0 0 32 3" :stroke="FINAL_CONFIG.onion.trackColor" stroke-width="4" fill="none" stroke-linecap="round" class="onion-animated"/>
            <path data-cy="variant-onion-track" d="M 13 32 C 13 39 19 52 32 52 A 1 1 0 0 0 32 13" :stroke="FINAL_CONFIG.onion.trackColor" stroke-width="4" fill="none" stroke-linecap="round" class="onion-animated"/>
            <path data-cy="variant-onion-track" d="M 23 32 C 23 37 26.5 41 32 41 A 1 1 0 0 0 32 25" :stroke="FINAL_CONFIG.onion.trackColor" stroke-width="4" fill="none" stroke-linecap="round" class="onion-animated"/>
        </g>
        <g v-if="FINAL_CONFIG.type === 'line'" data-cy="variant-line">
            <path data-cy="variant-line-gutter" d="M 3 62 C 6 57 6 48 11 45 C 16 44 17 53 22 52 C 27 49 25 32 30 31 C 34 29 37 47 42 47 C 46 47 45 38 49 36 C 53 34 56 45 61 45 C 66 45 65 24 69 24 C 73 22 75 35 79 34 C 84 34 83 11 91 5" stroke-width="4" fill="none" stroke-linecap="round" :style="lineStyle.gutter + lineStyle.gutterBlur"/>

            <path data-cy="variant-line-track" d="M 3 62 C 6 57 6 48 11 45 C 16 44 17 53 22 52 C 27 49 25 32 30 31 C 34 29 37 47 42 47 C 46 47 45 38 49 36 C 53 34 56 45 61 45 C 66 45 65 24 69 24 C 73 22 75 35 79 34 C 84 34 83 11 91 5" :stroke="FINAL_CONFIG.line.trackColor" stroke-width="4" fill="none" stroke-linecap="round" class="line-animated"/>
        </g>
        <g v-if="FINAL_CONFIG.type === 'bar'" data-cy="variant-bar">
            <path data-cy="variant-bar-gutter" d="M 3 62 L 3 44 M 12 62 L 12 49 M 21 62 L 21 37 M 30 62 L 30 29 M 39 62 L 39 43 M 48 62 L 48 16 M 57 62 L 57 24 M 66 62 L 66 35 M 75 62 L 75 20 M 84 62 L 84 5" stroke-width="4" fill="none" stroke-linecap="round" :style="barStyle.gutter + barStyle.gutterBlur"/>

            <path data-cy="variant-bar-track" d="M 3 62 L 3 44 M 12 62 L 12 49 M 21 62 L 21 37 M 30 62 L 30 29 M 39 62 L 39 43 M 48 62 L 48 16 M 57 62 L 57 24 M 66 62 L 66 35 M 75 62 L 75 20 M 84 62 L 84 5" :stroke="FINAL_CONFIG.bar.trackColor" stroke-width="4" fill="none" stroke-linecap="round" class="bar-animated"/>
        </g>
    </svg>
</template>

<style scoped>
path.onion-animated {
    stroke-dasharray: 0;
    stroke-dashoffset: 0;
    animation: onion-groove infinite cubic-bezier(.53,.15,.57,.93) 3s;
}

@keyframes onion-groove {
    from {
        stroke-dasharray: 160;
        stroke-dashoffset: -140;
        filter: blur(0px);
    }
    to {
        stroke-dasharray: 160;
        stroke-dashoffset: 0;
        filter: v-bind(trackBlur);
    }
}
path.line-animated {
    stroke-dasharray: 0;
    stroke-dashoffset: 0;
    animation: line-funk infinite cubic-bezier(.53,.15,.57,.93) 3s;
}

@keyframes line-funk {
    from {
        stroke-dasharray: 300;
        stroke-dashoffset: 300;
        filter: blur(0px);
    }
    to {
        stroke-dasharray: 300;
        stroke-dashoffset: 100;
        filter: v-bind(lineBlur);
    }
}

path.bar-animated {
    stroke-dasharray: 0;
    stroke-dashoffset: 0;
    animation: bar-jazz infinite cubic-bezier(.53,.15,.57,.93) 3s;
}

@keyframes bar-jazz {
    from {
        stroke-dasharray: 60;
        stroke-dashoffset: 60;
        filter: blur(0px);
    }
    to {
        stroke-dasharray: 60;
        stroke-dashoffset: 0;
        filter: v-bind(barBlur);
    }
}
</style>