<script setup>
import { 
    computed, 
    defineAsyncComponent, 
    onMounted, 
    ref, 
    toRefs,
    watch, 
} from "vue";
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
    treeShake,
    XMLNS
} from "../lib";
import { useConfig } from "../useConfig";
import { useLoading } from "../useLoading";
import { useThemeCheck } from "../useThemeCheck";
import { useChartAccessibility } from "../useChartAccessibility";
import themes from "../themes/vue_ui_sparkgauge.json";
import BaseScanner from "../atoms/BaseScanner.vue";

const PackageVersion = defineAsyncComponent(() => import('../atoms/PackageVersion.vue'));

const { vue_ui_sparkgauge: DEFAULT_CONFIG } = useConfig();
const { isThemeValid, warnInvalidTheme } = useThemeCheck();

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

const uid = ref(createUid());

const FINAL_CONFIG = ref(prepareConfig());

const { loading, FINAL_DATASET } = useLoading({
    ...toRefs(props),
    FINAL_CONFIG,
    prepareConfig,
    skeletonDataset: {
        value: 0,
        min: -1,
        max: 1,
        title: ''
    },
    skeletonConfig: treeShake({
        defaultConfig: FINAL_CONFIG.value,
        userConfig: {
            style: {
                animation: { show: false },
                background: '#99999930',
                colors: {
                    min: '#CACACA',
                    max: '#6A6A6A'
                },
                track: {
                    autoColor: true,
                },
                gutter: {
                    color: '#6A6A6A80'
                }
            },
        }
    })
})

const { svgRef } = useChartAccessibility({ config: { text: props.dataset?.title || '' } });

function prepareConfig() {
    const mergedConfig = useNestedProp({
        userConfig: props.config,
        defaultConfig: DEFAULT_CONFIG
    });

    const theme = mergedConfig.theme;
    if (!theme) return mergedConfig;

    if (!isThemeValid.value(mergedConfig)) {
        warnInvalidTheme(mergedConfig);
        return mergedConfig;
    }

    const fused =  useNestedProp({
        userConfig: themes[theme] || props.config,
        defaultConfig: mergedConfig
    });

    const finalConfig = useNestedProp({
        userConfig: props.config,
        defaultConfig: fused
    });

    return finalConfig;
}

onMounted(() => {
    prepareChart();
})

const debug = computed(() => FINAL_CONFIG.value.debug);

function prepareChart() {
    if(objectIsEmpty(props.dataset)) {
        error({
            componentName: "VueUiSparkgauge",
            type: 'dataset',
            debug: debug.value
        });
    } else {
        getMissingDatasetAttributes({
            datasetObject: props.dataset,
            requiredAttributes: ['value', 'min', 'max']
        }).forEach(attr => {
            error({
                componentName: 'VueUiSparkgauge',
                type: 'datasetAttribute',
                property: attr,
                debug: debug.value
            });
        });
    }
}

watch(() => props.config, (_newCfg) => {
    FINAL_CONFIG.value = prepareConfig();
    activeRating.value = FINAL_CONFIG.value.style.animation.show ? bounds.value.min : FINAL_DATASET.value.value;
    prepareChart();
}, { deep: true });

const svg = computed(() => {
    return {
        height: FINAL_CONFIG.value.style.height,
        width: 128,
        base: FINAL_CONFIG.value.style.basePosition
    }
});

const bounds = computed(() => {
    const min = FINAL_DATASET.value.min ?? 0;
    const max = FINAL_DATASET.value.max ?? 0;
    const diff = max - min;
    return {
        min,
        max,
        diff
    }
})

const activeRating = ref(FINAL_CONFIG.value.style.animation.show ? bounds.value.min : FINAL_DATASET.value.value);

watch(() => FINAL_DATASET.value.value, () => {
    useAnimation(FINAL_DATASET.value.value || 0);
});

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
});

onMounted(() => {
    useAnimation(FINAL_DATASET.value.value || 0);
});

function useAnimation(targetValue) {
    function animate() {
        if(activeRating.value < targetValue) {
            activeRating.value = Math.min(activeRating.value + animationTick.value, targetValue);
        } else if (activeRating.value > targetValue) {
            activeRating.value = Math.max(activeRating.value - animationTick.value, targetValue);
        }
        
        if (activeRating.value !== targetValue) {
            requestAnimationFrame(animate);
        }
    }
    animate();
}

const nameLabel = computed(() => {
    return FINAL_DATASET.value.title ?? '';
});

const valueRatio = computed(() => {
    const diff = bounds.value.diff;
    if (!isFinite(diff) || diff === 0) return 0;
    const min = bounds.value.min;
    const score = controlScore.value;
    if (score >= 0) {
        return (score - min) / diff;
    } else {
        return (Math.abs(min) - Math.abs(score)) / diff;
    }
});

const currentColor = computed(() => {
    return interpolateColorHex(FINAL_CONFIG.value.style.colors.min, FINAL_CONFIG.value.style.colors.max, bounds.value.min, bounds.value.max, activeRating.value);
})

const labelColor = computed(() => {
    if(!FINAL_CONFIG.value.style.dataLabel.autoColor) {
        return FINAL_CONFIG.value.style.dataLabel.color;
    } else {
        return currentColor.value;
    }
});

const trackColor = computed(() => {
    if (!FINAL_CONFIG.value.style.track.autoColor) {
        return FINAL_CONFIG.value.style.track.color;
    } else {
        return currentColor.value;
    }
});
</script>

<template>
<div class="vue-data-ui-component vue-ui-sparkgauge" :style="`font-family:${FINAL_CONFIG.style.fontFamily};width: 100%; background:${FINAL_CONFIG.style.background}`">
    <!-- TITLE TOP -->
    <div v-if="FINAL_CONFIG.style.title.show && nameLabel && FINAL_CONFIG.style.title.position === 'top'" class="vue-data-ui-sparkgauge-label" :style="`font-size:${FINAL_CONFIG.style.title.fontSize}px;text-align:${FINAL_CONFIG.style.title.textAlign};font-weight:${FINAL_CONFIG.style.title.bold ? 'bold': 'normal'};color:${FINAL_CONFIG.style.title.color}`">
        {{ nameLabel }}
    </div>
    <svg
        ref="svgRef"
        :xmlns="XMLNS" 
        :viewBox="`0 0 ${svg.width} ${svg.height}`" 
        :style="`overflow: visible; background:transparent; width:100%;`"
    >
        <PackageVersion />

        <!-- BACKGROUND SLOT -->
        <foreignObject 
            v-if="$slots['chart-background'] && !loading"
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
        <rect
            v-if="loading"
            :x="svg.width / 2 - (FINAL_CONFIG.style.dataLabel.fontSize / 2)"
            :y="svg.base + 6 + FINAL_CONFIG.style.dataLabel.offsetY - (FINAL_CONFIG.style.dataLabel.fontSize)"
            :width="FINAL_CONFIG.style.dataLabel.fontSize"
            :height="FINAL_CONFIG.style.dataLabel.fontSize"
            fill="#6A6A6A50"
            :rx="3"
        />
        <text
            v-else
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

    <!-- TITLE BOTTOM -->
    <div v-if="FINAL_CONFIG.style.title.show && nameLabel && FINAL_CONFIG.style.title.position === 'bottom'" class="vue-data-ui-sparkgauge-label" :style="`font-size:${FINAL_CONFIG.style.title.fontSize}px;text-align:${FINAL_CONFIG.style.title.textAlign};font-weight:${FINAL_CONFIG.style.title.bold ? 'bold': 'normal'};font-weight:${FINAL_CONFIG.style.title.bold ? 'bold': 'normal'};color:${FINAL_CONFIG.style.title.color}`">
        {{ nameLabel }}
    </div>

    <div v-if="$slots.source" ref="source" dir="auto">
        <slot name="source" />
    </div>

    <!-- v3 Skeleton loader -->
    <BaseScanner v-if="loading" />
</div>
</template>

<style>
.vue-ui-sparkgauge {
    position: relative;
}

@keyframes vue-ui-sparkgauge-animation {
    from {
        stroke-dashoffset: 169.5;
        opacity: -1;
    }
}
</style>