<script setup>
import { ref, computed, onMounted, watch, defineAsyncComponent } from "vue";
import { useNestedProp } from "../useNestedProp";
import {
    applyDataLabel,
    checkNaN,
    createUid, 
    dataLabel, 
    error, 
    getMissingDatasetAttributes,
    interpolateColorHex, 
    objectIsEmpty,
    XMLNS
} from "../lib";
import { useConfig } from "../useConfig";
import { useChartAccessibility } from "../useChartAccessibility";
import themes from "../themes.json";

const PackageVersion = defineAsyncComponent(() => import('../atoms/PackageVersion.vue'));
const Skeleton = defineAsyncComponent(() => import('./vue-ui-skeleton.vue'));

const { vue_ui_sparkgauge: DEFAULT_CONFIG } = useConfig()

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
});

const isDataset = computed(() => {
    return !!props.dataset && Object.keys(props.dataset).length;
});

onMounted(() => {
    prepareChart();
})

function prepareChart() {
    if(objectIsEmpty(props.dataset)) {
        error({
            componentName: "VueUiSparkgauge",
            type: 'dataset'
        })
    } else {
        getMissingDatasetAttributes({
            datasetObject: props.dataset,
            requiredAttributes: ['value', 'min', 'max']
        }).forEach(attr => {
            error({
                componentName: 'VueUiSparkgauge',
                type: 'datasetAttribute',
                property: attr
            });
        });
    }
}

const uid = ref(createUid());

const FINAL_CONFIG = computed({
    get: () => {
        return prepareConfig();
    },
    set: (newCfg) => {
        return newCfg
    }
});

const { svgRef } = useChartAccessibility({ config: { text: props.dataset.title } });

function prepareConfig() {
    const mergedConfig = useNestedProp({
        userConfig: props.config,
        defaultConfig: DEFAULT_CONFIG
    });
    if (mergedConfig.theme) {
        return {
            ...useNestedProp({
                userConfig: themes.vue_ui_sparkgauge[mergedConfig.theme] || props.config,
                defaultConfig: mergedConfig
            }),
        }
    } else {
        return mergedConfig;
    }
}

watch(() => props.config, (_newCfg) => {
    FINAL_CONFIG.value = prepareConfig();
    prepareChart();
}, { deep: true });

const svg = computed(() => {
    return {
        height: FINAL_CONFIG.value.style.height,
        width: 128,
        base: FINAL_CONFIG.value.style.basePosition
    }
})

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

const activeRating = ref(FINAL_CONFIG.value.style.animation.show ? bounds.value.min : props.dataset.value);

watch(() => props.dataset.value, () => {
    useAnimation(props.dataset.value || 0)
})

const controlScore = computed(() => {
    if (activeRating.value > bounds.value.max) {
        return bounds.value.max;
    } else if (activeRating.value < bounds.value.min) {
        return bounds.value.min;
    } else {
        return activeRating.value;
    }
})

const animationTick = computed(() => {
    return bounds.value.diff / FINAL_CONFIG.value.style.animation.speedMs;
})

onMounted(() => {
    useAnimation(props.dataset.value || 0);
})

function useAnimation(targetValue) {
    function animate() {
        if(activeRating.value < targetValue) {
            activeRating.value = Math.min(activeRating.value + animationTick.value, targetValue);
        } else if (activeRating.value > targetValue) {
            activeRating.value = Math.max(activeRating.value - animationTick.value, targetValue)
        }
        
        if (activeRating.value !== targetValue) {
            requestAnimationFrame(animate);
        }
    }
    animate();
}

const nameLabel = computed(() => {
    return props.dataset.title ?? ''
});

const valueRatio = computed(() => {

    if(activeRating.value >= 0) {
        return (controlScore.value - bounds.value.min) / bounds.value.diff
    } else {
        return (Math.abs(bounds.value.min) - Math.abs(controlScore.value)) / bounds.value.diff
    }
})

const currentColor = computed(() => {
    return interpolateColorHex(FINAL_CONFIG.value.style.colors.min, FINAL_CONFIG.value.style.colors.max, bounds.value.min, bounds.value.max, activeRating.value)
})

const labelColor = computed(() => {
    if(!FINAL_CONFIG.value.style.dataLabel.autoColor) {
        return FINAL_CONFIG.value.style.dataLabel.color;
    } else {
        return currentColor.value;
    }
})

const trackColor = computed(() => {
    if (!FINAL_CONFIG.value.style.track.autoColor) {
        return FINAL_CONFIG.value.style.track.color;
    } else {
        return currentColor.value;
    }
})
</script>

<template>
<div class="vue-ui-sparkgauge" :style="`font-family:${FINAL_CONFIG.style.fontFamily};width: 100%; background:${FINAL_CONFIG.style.background}`">
    <!-- TITLE TOP -->
    <div v-if="FINAL_CONFIG.style.title.show && nameLabel && FINAL_CONFIG.style.title.position === 'top'" class="vue-data-ui-sparkgauge-label" :style="`font-size:${FINAL_CONFIG.style.title.fontSize}px;text-align:${FINAL_CONFIG.style.title.textAlign};font-weight:${FINAL_CONFIG.style.title.bold ? 'bold': 'normal'};color:${FINAL_CONFIG.style.title.color}`">
        {{ nameLabel }}
    </div>
    <svg
        ref="svgRef"
        :xmlns="XMLNS" 
        v-if="isDataset" 
        :viewBox="`0 0 ${svg.width} ${svg.height}`" 
        :style="`overflow: visible; background:transparent; width:100%;`"
    >
        <PackageVersion />

        <!-- BACKGROUND SLOT -->
        <foreignObject 
            v-if="$slots['chart-background']"
            :x="0"
            :y="0"
            :width="svg.width"
            :height="svg.height"
            :style="{
                pointerEvents: 'none'
            }"
        >
            <slot name="chart-background"/>
        </foreignObject>
        
        <defs>
            <linearGradient :id="`gradient_${ uid}`" x1="-10%" y1="100%" x2="110%" y2="100%">
                <stop offset="0%" :stop-color="FINAL_CONFIG.style.colors.min"/>
                <stop offset="100%" :stop-color="FINAL_CONFIG.style.colors.max"/>
            </linearGradient>
        </defs>
        <!-- GUTTER -->
        <path
            :d="`M${10} ${svg.base} A 1 1 0 1 1 ${118} ${svg.base}`"
            :stroke="FINAL_CONFIG.style.gutter.color"
            :stroke-width="8"
            :stroke-linecap="FINAL_CONFIG.style.gutter.strokeLinecap"
            fill="none"
        />
        <!-- TRACK -->
        <path
            v-if="valueRatio !== 0"
            :d="`M${10} ${svg.base} A 1 1 0 1 1 ${118} ${svg.base}`"
            :stroke="FINAL_CONFIG.style.colors.showGradient ? `url(#gradient_${uid})` : trackColor"
            :stroke-width="8"
            :stroke-linecap="FINAL_CONFIG.style.track.strokeLinecap"
            fill="none"
            :stroke-dasharray="169.5"
            :stroke-dashoffset="169.5 - (169.5 * valueRatio)"
            :class="{'vue-ui-sparkgauge-track' : FINAL_CONFIG.style.animation.show }"
            :style="FINAL_CONFIG.style.animation.show ? `animation: vue-ui-sparkgauge-animation ${FINAL_CONFIG.style.animation.speedMs}ms ease-in;`: ''"
        />
        <!-- DATALABEL -->
        <text
            text-anchor="middle"
            :x="svg.width / 2"
            :y="svg.base + 6 + FINAL_CONFIG.style.dataLabel.offsetY"
            :font-size="FINAL_CONFIG.style.dataLabel.fontSize"
            :fill="labelColor"
            :font-weight="FINAL_CONFIG.style.dataLabel.bold ? 'bold' : 'normal'"
        >
            {{ applyDataLabel(
                FINAL_CONFIG.style.dataLabel.formatter,
                checkNaN(activeRating),
                dataLabel({ 
                    p: FINAL_CONFIG.style.dataLabel.prefix, 
                    v: checkNaN(activeRating), 
                    s: FINAL_CONFIG.style.dataLabel.suffix, 
                    r: FINAL_CONFIG.style.dataLabel.rounding 
                }),
                { datapoint: checkNaN(activeRating), color: labelColor }
                )
            }}
        </text>
    </svg>

    <Skeleton 
            v-if="!isDataset"
            :config="{
                type: 'gauge',
                style: {
                    backgroundColor: FINAL_CONFIG.style.background,
                    gauge: {
                        color: '#CCCCCC'
                    }
                }
            }"
        />

    <!-- TITLE BOTTOM -->
    <div v-if="FINAL_CONFIG.style.title.show && nameLabel && FINAL_CONFIG.style.title.position === 'bottom'" class="vue-data-ui-sparkgauge-label" :style="`font-size:${FINAL_CONFIG.style.title.fontSize}px;text-align:${FINAL_CONFIG.style.title.textAlign};font-weight:${FINAL_CONFIG.style.title.bold ? 'bold': 'normal'};font-weight:${FINAL_CONFIG.style.title.bold ? 'bold': 'normal'};color:${FINAL_CONFIG.style.title.color}`">
        {{ nameLabel }}
    </div>

    <div v-if="$slots.source" ref="source" dir="auto">
        <slot name="source" />
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