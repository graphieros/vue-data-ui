<script setup>
import {
    computed,
    defineAsyncComponent,
    onMounted,
    ref,
    toRefs,
    watch,
    onBeforeUnmount,
} from 'vue';
import { useNestedProp } from '../useNestedProp';
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
    XMLNS,
} from '../lib';
import { COMMON_RULES, useHints } from '../useHints';
import { useConfig } from '../useConfig';
import { useLoading } from '../useLoading';
import { useThemeCheck } from '../useThemeCheck';
import { useChartAccessibility } from '../useChartAccessibility';
import { usePrefersReducedMotion } from '../usePrefersMotion';
import themes from '../themes/vue_ui_sparkgauge.json';
import BaseScanner from '../atoms/BaseScanner.vue';
import DefGrad from '../atoms/DefGrad.vue';

const PackageVersion = defineAsyncComponent(
    () => import('../atoms/PackageVersion.vue'),
);

const { vue_ui_sparkgauge: DEFAULT_CONFIG } = useConfig();
const { isThemeValid, warnInvalidTheme } = useThemeCheck();
const prefersReducedMotion = usePrefersReducedMotion();

const animationFrameId = ref(null);

const props = defineProps({
    config: {
        type: Object,
        default() {
            return {};
        },
    },
    dataset: {
        type: Object,
        default() {
            return {};
        },
    },
});

const uid = ref(createUid());

const FINAL_CONFIG = ref(prepareConfig());
const cfgLabel = computed(() => FINAL_CONFIG.value.style.dataLabel);
const cfgStyle = computed(() => FINAL_CONFIG.value.style);

useHints({
    config: () => FINAL_CONFIG.value,
    dataset: () => props.dataset,
    component: 'VueUiSparkgauge',
    rules: [COMMON_RULES.noHint],
});

const shouldAnimate = computed(() => {
    return cfgStyle.value.animation.show && !prefersReducedMotion.value;
});

const skeletonConfig = computed(() => {
    return treeShake({
        defaultConfig: {
            style: {
                animation: { show: false },
                background: '#99999930',
                colors: {
                    min: '#CACACA',
                    max: '#6A6A6A',
                },
                track: {
                    autoColor: true,
                },
                gutter: {
                    color: '#6A6A6A80',
                },
            },
        },
        userConfig: FINAL_CONFIG.value.skeletonConfig ?? {},
    });
});

const { loading, FINAL_DATASET } = useLoading({
    ...toRefs(props),
    FINAL_CONFIG,
    prepareConfig,
    skeletonDataset: props.config?.skeletonDataset ?? {
        value: 0,
        min: -1,
        max: 1,
        title: '',
    },
    skeletonConfig: treeShake({
        defaultConfig: FINAL_CONFIG.value,
        userConfig: skeletonConfig.value,
    }),
});

const bounds = computed(() => {
    const min = FINAL_DATASET.value.min ?? 0;
    const max = FINAL_DATASET.value.max ?? 0;
    const diff = max - min;
    return {
        min,
        max,
        diff,
    };
});

const animationTick = computed(() => {
    return bounds.value.diff / cfgStyle.value.animation.speedMs;
});

const { svgRef } = useChartAccessibility({
    config: { text: props.dataset?.title || '' },
});

function prepareConfig() {
    const mergedConfig = useNestedProp({
        userConfig: props.config,
        defaultConfig: DEFAULT_CONFIG,
    });

    const theme = mergedConfig.theme;
    if (!theme) return mergedConfig;

    if (!isThemeValid.value(mergedConfig)) {
        warnInvalidTheme(mergedConfig);
        return mergedConfig;
    }

    const fused = useNestedProp({
        userConfig: themes[theme] || props.config,
        defaultConfig: mergedConfig,
    });

    const finalConfig = useNestedProp({
        userConfig: props.config,
        defaultConfig: fused,
    });

    return finalConfig;
}

onMounted(() => {
    prepareChart();
});

const debug = computed(() => FINAL_CONFIG.value.debug);

function prepareChart() {
    if (objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiSparkgauge',
            type: 'dataset',
            debug: debug.value,
        });
    } else {
        getMissingDatasetAttributes({
            datasetObject: props.dataset,
            requiredAttributes: ['value', 'min', 'max'],
        }).forEach((attr) => {
            error({
                componentName: 'VueUiSparkgauge',
                type: 'datasetAttribute',
                property: attr,
                debug: debug.value,
            });
        });
    }
}

watch(
    () => props.config,
    () => {
        FINAL_CONFIG.value = prepareConfig();
        activeRating.value = shouldAnimate.value
            ? bounds.value.min
            : FINAL_DATASET.value.value;
        prepareChart();
    },
    { deep: true },
);

const svg = computed(() => {
    return {
        height: cfgStyle.value.height,
        width: 128,
        base: cfgStyle.value.basePosition,
    };
});

const activeRating = ref(
    shouldAnimate.value ? bounds.value.min : FINAL_DATASET.value.value,
);

watch(
    [() => FINAL_DATASET.value.value, shouldAnimate],
    ([targetValue, animate]) => {
        useAnimation(targetValue || 0, animate);
    },
    { immediate: true },
);

const controlScore = computed(() => {
    if (activeRating.value > bounds.value.max) {
        return bounds.value.max;
    } else if (activeRating.value < bounds.value.min) {
        return bounds.value.min;
    } else {
        return activeRating.value;
    }
});

onMounted(() => {
    useAnimation(FINAL_DATASET.value.value || 0);
});

function useAnimation(targetValue, animate = shouldAnimate.value) {
    if (animationFrameId.value) {
        cancelAnimationFrame(animationFrameId.value);
        animationFrameId.value = null;
    }

    if (!animate) {
        activeRating.value = targetValue;
        return;
    }

    function step() {
        if (activeRating.value < targetValue) {
            activeRating.value = Math.min(
                activeRating.value + animationTick.value,
                targetValue,
            );
        } else if (activeRating.value > targetValue) {
            activeRating.value = Math.max(
                activeRating.value - animationTick.value,
                targetValue,
            );
        }

        if (activeRating.value !== targetValue) {
            animationFrameId.value = requestAnimationFrame(step);
        } else {
            animationFrameId.value = null;
        }
    }

    step();
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
    return interpolateColorHex(
        cfgStyle.value.colors.min,
        cfgStyle.value.colors.max,
        bounds.value.min,
        bounds.value.max,
        activeRating.value,
    );
});

const labelColor = computed(() => {
    if (!cfgLabel.value.autoColor) {
        return cfgLabel.value.color;
    } else {
        return currentColor.value;
    }
});

const trackColor = computed(() => {
    if (!cfgStyle.value.track.autoColor) {
        return cfgStyle.value.track.color;
    } else {
        return currentColor.value;
    }
});

onBeforeUnmount(() => {
    if (animationFrameId.value) {
        cancelAnimationFrame(animationFrameId.value);
    }
});
</script>

<template>
    <div
        class="vue-data-ui-component vue-ui-sparkgauge"
        :style="`font-family:${cfgStyle.fontFamily};width: 100%; background:${cfgStyle.background}`"
    >
        <!-- TITLE TOP -->
        <div
            v-if="
                cfgStyle.title.show &&
                nameLabel &&
                cfgStyle.title.position === 'top'
            "
            class="vue-data-ui-sparkgauge-label"
            :style="`font-size:${cfgStyle.title.fontSize}px;text-align:${cfgStyle.title.textAlign};font-weight:${cfgStyle.title.bold ? 'bold' : 'normal'};color:${cfgStyle.title.color}`"
        >
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
                    pointerEvents: 'none',
                }"
            >
                <slot name="chart-background" />
            </foreignObject>

            <defs>
                <DefGrad
                    t="linear"
                    :id="`gradient_${uid}`"
                    x1="-10%"
                    y1="100%"
                    x2="110%"
                    y2="100%"
                    :stops="[
                        ['0%', cfgStyle.colors.min, 1],
                        ['100%', cfgStyle.colors.max, 1],
                    ]"
                />
            </defs>
            <!-- GUTTER -->
            <path
                :d="`M${10} ${svg.base} A 1 1 0 1 1 ${118} ${svg.base}`"
                :stroke="cfgStyle.gutter.color"
                :stroke-width="8"
                :stroke-linecap="cfgStyle.gutter.strokeLinecap"
                fill="none"
            />
            <!-- TRACK -->
            <path
                v-if="valueRatio !== 0"
                :d="`M${10} ${svg.base} A 1 1 0 1 1 ${118} ${svg.base}`"
                :stroke="
                    cfgStyle.colors.showGradient
                        ? `url(#gradient_${uid})`
                        : trackColor
                "
                :stroke-width="8"
                :stroke-linecap="cfgStyle.track.strokeLinecap"
                fill="none"
                :stroke-dasharray="169.5"
                :stroke-dashoffset="169.5 - 169.5 * valueRatio"
                :class="{
                    'vue-ui-sparkgauge-track': cfgStyle.animation.show,
                }"
                :style="
                    cfgStyle.animation.show
                        ? `animation: vue-ui-sparkgauge-animation ${cfgStyle.animation.speedMs}ms ease-in;`
                        : ''
                "
            />
            <!-- DATALABEL -->
            <rect
                v-if="loading"
                :x="svg.width / 2 - cfgLabel.fontSize / 2"
                :y="svg.base + 6 + cfgLabel.offsetY - cfgLabel.fontSize"
                :width="cfgLabel.fontSize"
                :height="cfgLabel.fontSize"
                fill="#6A6A6A50"
                :rx="3"
            />
            <text
                v-else
                text-anchor="middle"
                :x="svg.width / 2"
                :y="svg.base + 6 + cfgLabel.offsetY"
                :font-size="cfgLabel.fontSize"
                :fill="labelColor"
                :font-weight="cfgLabel.bold ? 'bold' : 'normal'"
            >
                {{
                    applyDataLabel(
                        cfgLabel.formatter,
                        checkNaN(activeRating),
                        dataLabel({
                            p: cfgLabel.prefix,
                            v: checkNaN(activeRating),
                            s: cfgLabel.suffix,
                            r: cfgLabel.rounding,
                        }),
                        {
                            datapoint: checkNaN(activeRating),
                            color: labelColor,
                        },
                    )
                }}
            </text>
        </svg>

        <!-- TITLE BOTTOM -->
        <div
            v-if="
                cfgStyle.title.show &&
                nameLabel &&
                cfgStyle.title.position === 'bottom'
            "
            class="vue-data-ui-sparkgauge-label"
            :style="`font-size:${cfgStyle.title.fontSize}px;text-align:${cfgStyle.title.textAlign};font-weight:${cfgStyle.title.bold ? 'bold' : 'normal'};font-weight:${cfgStyle.title.bold ? 'bold' : 'normal'};color:${cfgStyle.title.color}`"
        >
            {{ nameLabel }}
        </div>

        <div v-if="$slots.source" ref="source" dir="auto">
            <slot name="source" />
        </div>

        <!-- v3 Skeleton loader -->
        <slot name="skeleton">
            <BaseScanner v-if="loading" />
        </slot>
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

@media (prefers-reduced-motion: reduce) {
    .vue-data-ui-component * {
        transition: none !important;
        animation: none !important;
    }
}
</style>
