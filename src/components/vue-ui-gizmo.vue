<script setup>
import { ref, computed, onMounted, watch, useSlots, defineAsyncComponent, toRefs } from "vue";
import { useConfig } from "../useConfig";
import { createUid, error, applyDataLabel, dataLabel, treeShake } from "../lib";
import { useNestedProp } from "../useNestedProp";
import { useLoading } from "../useLoading";
import BaseScanner from "../atoms/BaseScanner.vue";

const PackageVersion = defineAsyncComponent(() => import('../atoms/PackageVersion.vue'));

const { vue_ui_gizmo: DEFAULT_CONFIG } = useConfig();
    
const props = defineProps({
    config: {
        type: Object,
        default() {
            return {}
        }
    },
    dataset: {
        type: Number,
    },
});

const uid = ref(createUid());
const slots = useSlots();

onMounted(() => {
    prepareChart();
});

onMounted(() => {
    if (slots['chart-background'] && debug.value) {
        console.warn('VueUiGizmo does not support the #chart-background slot.')
    }
});

const debug = computed(() => FINAL_CONFIG.value.debug);

function prepareChart() {
    if (!props.dataset && props.dataset !== 0) {
        error({
            componentName: 'VueUiGizmo',
            type: 'dataset',
            debug: debug.value
        })
    }
    if (props.dataset < 0 && debug.value) {
        console.warn('VueUiGizmo: dataset cannot be negative.')
    }
    if (props.dataset > 100 && debug.value) {
        console.warn(`VueUiGizmo: gauge is maxed out, as dataset exceeds 100% (props.dataset = ${props.dataset})`)
    }
}

const FINAL_CONFIG = ref(prepareConfig());

const { loading, FINAL_DATASET, manualLoading } = useLoading({
    ...toRefs(props),
    FINAL_CONFIG,
    prepareConfig,
    dsIsNumber: true,
    skeletonDataset: 50,
    skeletonConfig: treeShake({
        defaultConfig: FINAL_CONFIG.value,
        userConfig: {
            stroke: '#6A6A6A80',
            color: '#6A6A6A',
            gradientColor: '#CACACA',
            textColor: 'transparent'
        }
    })
})

function prepareConfig() {
    return useNestedProp({
        userConfig: props.config,
        defaultConfig: DEFAULT_CONFIG
    });
}

watch(() => props.config, (_newCfg) => {
    FINAL_CONFIG.value = prepareConfig();
    prepareChart();
}, { deep: true });

const svg = computed(() => {
    const options = {
        battery: { width: FINAL_CONFIG.value.showPercentage ? 150 : 80, height: 50 },
        gauge: { width: 80, height: 80 },
    }
    return options[FINAL_CONFIG.value.type];
});

const displayDataset = computed(() => Math.min(Math.max(0, FINAL_DATASET.value), 100));
const displayDatasetValue = computed(() => Math.max(0, FINAL_DATASET.value));

const gaugeBody = computed(() => {
    const radius = 35;
    const circumference = 2 * Math.PI * radius;
    const dashoffset = circumference - (displayDataset.value / 100) * circumference;

    return {
        dasharray: `${circumference} ${circumference}`,
        dashoffset: dashoffset
    };
});

</script>

<template>
    <div class="vue-ui-gizmo-wrapper">
        <svg
            class="vue-ui-gizmo"
            :viewBox="`0 0 ${svg.width} ${svg.height}`"
            :width="FINAL_CONFIG.size"
            :style="{
                background: 'transparent',
                fontFamily: FINAL_CONFIG.fontFamily
            }"
        >
            <PackageVersion />
            
            <defs v-if="FINAL_CONFIG.useGradient">
                <linearGradient :id="`gizmo_gradient_${uid}`" x1="0%" x2="100%" y1="0%" y2="0%">
                    <stop offset="0%" :stop-color="FINAL_CONFIG.gradientColor" />
                    <stop offset="100%" :stop-color="FINAL_CONFIG.color" />
                </linearGradient>
            </defs>     
    
            <!-- BATTERY -->
            <template v-if="FINAL_CONFIG.type === 'battery'">
                <path
                    data-cy="battery-shape"
                    d="M 5 10 L 5 40 C 5 43 7 45 9 45 L 65 45 C 68 45 70 43 70 40 L 70 38 C 73 38 75 38 75 33 L 75 17 C 75 12 73 12 70 12 L 70 10 C 70 7 68 5 65 5 L 10 5 C 7 5 5 7 5 10"
                    :stroke="FINAL_CONFIG.stroke"
                    :stroke-width="2"
                    fill="none"
                />
                <path
                    data-cy="battery-cap"
                    d="M 70 16 L 70 34"
                    :stroke="FINAL_CONFIG.stroke"
                    :stroke-width="2"
                    fill="none"
                    style="opacity: 0.5"
                />
                <rect
                    data-cy="battery-level"
                    :x="10"
                    :y="10"
                    :height="30"
                    :width="55 * (displayDataset / 100)"
                    :fill="FINAL_CONFIG.useGradient ? `url(#gizmo_gradient_${uid})`: FINAL_CONFIG.color"
                    :rx="2"
                />
                <text
                    data-cy="battery-label"
                    v-if="FINAL_CONFIG.showPercentage"
                    :x="85"
                    :y="32"
                    text-anchor="start"
                    font-size="20"
                    :fill="FINAL_CONFIG.textColor"
                >
                    {{ applyDataLabel(
                        FINAL_CONFIG.formatter,
                        displayDatasetValue,
                        dataLabel({
                            v: displayDatasetValue,
                            s: '%',
                        })
                    ) }}
                </text>
            </template>
    
            <!-- GAUGE -->
            <template v-if="FINAL_CONFIG.type === 'gauge'">
                <defs v-if="FINAL_CONFIG.useGradient">
                    <filter :id="`blur_${uid}`" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur in="SourceGraphic" :stdDeviation="1" />
                    </filter>
                </defs>
                <circle
                    data-cy="gauge-gutter"
                    :cx="40"
                    :cy="40"
                    :r="35"
                    :stroke="FINAL_CONFIG.stroke"
                    :stroke-width="2 * 4"
                    fill="none"
                />
                <circle
                    data-cy="gauge-track"
                    :cx="40"
                    :cy="40"
                    :r="35"
                    :stroke="FINAL_CONFIG.color"
                    :stroke-width="2 * 4"
                    :stroke-dasharray="gaugeBody.dasharray"
                    :stroke-dashoffset="gaugeBody.dashoffset"
                    stroke-linecap="round"
                    fill="none"
                    style="transform:rotate(-90deg);transform-origin: 50% 50%"
                />
                <g v-if="FINAL_CONFIG.useGradient" :filter="`url(#blur_${uid})`">
                    <circle
                        data-cy="gauge-gradient"
                        :cx="40"
                        :cy="40"
                        :r="35"
                        :stroke="FINAL_CONFIG.gradientColor"
                        :stroke-width="1"
                        fill="none"
                        :stroke-dasharray="gaugeBody.dasharray"
                        :stroke-dashoffset="gaugeBody.dashoffset"
                        style="transform:rotate(-90deg);transform-origin: 50% 50%"
                    />
                </g>
                <text
                    data-cy="gauge-label"
                    v-if="FINAL_CONFIG.showPercentage"
                    :x="40"
                    :y="47"
                    text-anchor="middle"
                    font-size="20"
                    :fill="FINAL_CONFIG.textColor"
                >
                    {{ applyDataLabel(
                        FINAL_CONFIG.formatter,
                        displayDatasetValue,
                        dataLabel({
                            v: displayDatasetValue,
                            s: '%',
                        })
                    )}}
                </text>
            </template>
        </svg>

        <!-- v3 Skeleton loader -->
        <BaseScanner v-if="loading" />
    </div>
</template>

<style scoped>
.vue-ui-gizmo-wrapper {
    position: relative;
    height: fit-content;
    width: fit-content;
    display: flex;
    align-items:center;
    justify-content: center;
}
</style>