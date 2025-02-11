<script setup>
import { ref, computed, onMounted, watch, useSlots } from "vue";
import { applyDataLabel, dataLabel, error, objectIsEmpty, shiftHue, XMLNS } from "../lib";
import { useNestedProp } from "../useNestedProp";
import { useConfig } from "../useConfig";

const { vue_ui_smiley: DEFAULT_CONFIG } = useConfig(); 

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

const slots = useSlots();

onMounted(() => {
    if (slots['chart-background']) {
        console.warn('VueUiSmiley does not support the #chart-background slot.')
    }
});

onMounted(() => {
    prepareChart();
});

function prepareChart() {
    if (!Object.hasOwn(props.dataset, 'rating') || objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiSmiley',
            type: 'datasetAttribute',
            property: 'rating'
        })
    }
}

const isTooltip = ref(false);
const hoveredValue = ref(undefined);

const emit = defineEmits(["rate"]);

const FINAL_CONFIG = computed({
    get: () => {
        return prepareConfig();
    },
    set: (newCfg) => {
        return newCfg
    }
});

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

const propRating = computed(() => {
    if (typeof props.dataset.rating === "object" && !Array.isArray(props.dataset.rating)) {
        return calculateAverageRating(props.dataset.rating);
    } else {
        return props.dataset.rating || null;
    }
});

const hasBreakdown = computed(() => {
    return typeof props.dataset.rating === "object" && !Array.isArray(props.dataset.rating);
});

const currentRating = ref(propRating.value);
const isReadonly = computed(() => FINAL_CONFIG.value.readonly)

function calculateAverageRating(source) {
    if(source === null) return null;
    let totalSum = 0;
    let totalCount = 0;

    for (const key in source) {
        const ratingValue = parseInt(key);
        const ratingCount = source[key];

        totalSum += ratingValue * ratingCount;
        totalCount += ratingCount;
    }

    if (totalCount === 0) {
        return 0;
    }

    const averageRating = totalSum / totalCount;
    return averageRating;
}

function calcShapeFill(index) {
    const ratio = currentRating.value - index;
    const multiplicator = 24;
    switch (true) {
        case ratio < 0:
        return 0;
        case ratio > 1:
        return 1 * multiplicator;
        default:
        return ratio * multiplicator;
    }
}

function rate(val) {
    if (isReadonly.value) return;
    currentRating.value = val;
    emit("rate", val);
}

function getData() {
    return currentRating.value;
}

function toggleReadonly(state = true) {
    isReadonly.value = state;
}

defineExpose({
    getData,
    toggleReadonly
});

function getActiveColor(index) {
    if (FINAL_CONFIG.value.readonly) {
        return FINAL_CONFIG.value.style.colors.inactive[index]
    } else {
        if (currentRating.value === index + 1) {
            if (FINAL_CONFIG.value.style.icons.useGradient && FINAL_CONFIG.value.style.icons.filled) {
                    return `url(#vueUiSmiley${index})`;
                }
                return FINAL_CONFIG.value.style.colors.active[index];
        } else {
            if(hoveredValue.value !== undefined && hoveredValue.value === index) {
                if (FINAL_CONFIG.value.style.icons.useGradient && FINAL_CONFIG.value.style.icons.filled) {
                    return `url(#vueUiSmiley${index})`;
                }
                return FINAL_CONFIG.value.style.colors.active[index];
            } else {
                return FINAL_CONFIG.value.style.colors.inactive[index];
            }
        }
    }
}

</script>

<template>
    <div :style="`background:${FINAL_CONFIG.style.backgroundColor};font-family:${FINAL_CONFIG.style.fontFamily};width:100%;`" @mouseover="isTooltip = true" @mouseleave="isTooltip = false; hoveredValue = undefined">
        <!-- TITLE -->
        <div class="vue-ui-rating-title" v-if="FINAL_CONFIG.style.title.text" style="width:100%">
            <div data-cy="smiley-title" :style="`color:${FINAL_CONFIG.style.title.color};font-weight:${FINAL_CONFIG.style.title.bold ? 'bold' : 'normal'};text-align:${FINAL_CONFIG.style.title.textAlign};margin-bottom:${FINAL_CONFIG.style.title.offsetY}px;font-size:${FINAL_CONFIG.style.title.fontSize}px`">
                {{ FINAL_CONFIG.style.title.text }}
            </div>
            <div data-cy="smiley-subtitle" v-if="FINAL_CONFIG.style.title.subtitle.text" :style="`color:${FINAL_CONFIG.style.title.subtitle.color};font-size:${FINAL_CONFIG.style.title.subtitle.fontSize}px;text-align:${FINAL_CONFIG.style.title.textAlign};margin-bottom:${FINAL_CONFIG.style.title.subtitle.offsetY}px;font-weight:${FINAL_CONFIG.style.title.subtitle.bold ? 'bold' : 'normal'}`">
                {{ FINAL_CONFIG.style.title.subtitle.text }}
            </div>
        </div>

        <!-- RATING POSITION TOP -->
        <div data-cy="smiley-position-top" v-if="FINAL_CONFIG.style.rating.show && FINAL_CONFIG.style.rating.position === 'top'" :style="`width:100%;text-align:center;margin-bottom:${FINAL_CONFIG.style.rating.offsetY}px;font-size:${FINAL_CONFIG.style.rating.fontSize}px;font-weight:${FINAL_CONFIG.style.rating.bold ? 'bold' : 'normal'};margin-left:${FINAL_CONFIG.style.rating.offsetX}px`">
            {{ applyDataLabel(
                    FINAL_CONFIG.style.rating.formatter,
                    currentRating,
                    dataLabel({
                        v: currentRating,
                        r: FINAL_CONFIG.style.rating.roundingValue
                    }),
                    FINAL_CONFIG
                ) }}
        </div>

        <div class="vue-ui-smiley-wrapper" :style="`overflow:visible;height:${FINAL_CONFIG.style.itemSize}px;width:fit-content;margin:0 auto;display:flex;align-items:center;justify-content:center;`">
            <!-- RATING POSITION LEFT -->
            <div data-cy="smiley-position-left" v-if="FINAL_CONFIG.style.rating.show && FINAL_CONFIG.style.rating.position === 'left'" :style="`width:fit-content;text-align:center;margin-bottom:${FINAL_CONFIG.style.rating.offsetY}px;font-size:${FINAL_CONFIG.style.rating.fontSize}px;font-weight:${FINAL_CONFIG.style.rating.bold ? 'bold' : 'normal'};padding-right:${FINAL_CONFIG.style.rating.offsetX}px`">
                {{ applyDataLabel(
                    FINAL_CONFIG.style.rating.formatter,
                    currentRating,
                    dataLabel({
                        v: currentRating,
                        r: FINAL_CONFIG.style.rating.roundingValue
                    }),
                    FINAL_CONFIG
                ) }}
            </div>

            <!--1-->
            <div data-cy="smiley-item-0" tabindex="0" :class="{ 'vue-ui-smiley-rated' : !FINAL_CONFIG.readonly && currentRating === 1 }" :style="`cursor:${FINAL_CONFIG.readonly ? 'default' : 'pointer'};height:${FINAL_CONFIG.style.itemSize}px;aspect-ratio:1/1;
            position:relative`" @mouseenter="hoveredValue = 0" @mouseleave="hoveredValue = undefined" @click="rate(1)" @keyup.enter="rate(1)">
                <template v-if="FINAL_CONFIG.style.tooltip.show && hasBreakdown && isReadonly">
                    <div data-cy="smiley-tooltip-0" class="vue-ui-rating-tooltip" :style="`border:1px solid ${FINAL_CONFIG.style.tooltip.borderColor};position:absolute;top:${-48 + FINAL_CONFIG.style.tooltip.offsetY}px;left:50%;transform:translateX(-50%);width:fit-content;text-align:center;background:${FINAL_CONFIG.style.tooltip.backgroundColor};display:${hoveredValue === 0 ? 'block' : 'none'};padding:2px 12px;border-radius:${FINAL_CONFIG.style.tooltip.borderRadius}px;box-shadow:${FINAL_CONFIG.style.tooltip.boxShadow}`">
                        <div :style="`width:100%;display:flex;flex-direction:row;gap:6px;position:relative;text-align:center;color:${FINAL_CONFIG.style.tooltip.color}`">
                            <span :style="`font-size:${FINAL_CONFIG.style.tooltip.fontSize}px`">1:</span> <span :style="`font-weight:${FINAL_CONFIG.style.tooltip.bold ? 'bold' : 'normal'};font-size:${FINAL_CONFIG.style.tooltip.fontSize}px`">
                                {{ applyDataLabel(
                                        FINAL_CONFIG.style.tooltip.formatter,
                                        props.dataset.rating['1'],
                                        dataLabel({
                                            v: props.dataset.rating['1'],
                                            r: FINAL_CONFIG.style.tooltip.roundingValue
                                        }),
                                        FINAL_CONFIG
                                    ) 
                                }}
                            </span>
                            <div :style="`font-family:Arial !important;position:absolute;top:calc(100% - 4px);left:50%;transform:translateX(-50%);color:${FINAL_CONFIG.style.tooltip.borderColor}`">
                                ▼
                            </div>
                        </div>
                    </div>
                </template>

                <svg :xmlns="XMLNS" v-if="FINAL_CONFIG.style.icons.filled" style="transition: all 0.1s ease-in-out;position:absolute;top:0;left:0" height="100%" viewBox="0 0 24 24" stroke-width="1.5" :stroke="getActiveColor(0)" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <defs>
                        <radialGradient id="vueUiSmiley0">
                            <stop offset="0%" :stop-color="shiftHue(FINAL_CONFIG.style.colors.active[0], 0.05)"/>
                            <stop offset="100%" :stop-color="FINAL_CONFIG.style.colors.active[0]"/>
                        </radialGradient>
                    </defs>
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336zm-5 9.86a4.5 4.5 0 0 0 -3.214 1.35a1 1 0 1 0 1.428 1.4a2.5 2.5 0 0 1 3.572 0a1 1 0 0 0 1.428 -1.4a4.5 4.5 0 0 0 -3.214 -1.35zm-2.99 -4.2l-.127 .007a1 1 0 0 0 0 1.986l.117 .007l.127 -.007a1 1 0 0 0 0 -1.986l-.117 -.007zm6 0l-.127 .007a1 1 0 0 0 0 1.986l.117 .007l.127 -.007a1 1 0 0 0 0 -1.986l-.117 -.007z" stroke-width="0" :fill="getActiveColor(0)" /></svg>

                <svg v-else style="position:absolute;top:0;left:0;transition: all 0.1s ease-in-out;" height="100%" viewBox="0 0 24 24" stroke-width="1.5" :stroke="getActiveColor(0)" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M9 10l.01 0" /><path d="M15 10l.01 0" /><path d="M9.5 15.25a3.5 3.5 0 0 1 5 0" /></svg>

                <!-- RATING -->
                <svg :xmlns="XMLNS" v-if="FINAL_CONFIG.style.icons.filled && isReadonly" style="transition: all 0.1s ease-in-out;position:absolute;top:0;left:0" height="100%" :viewBox="`0 0 ${calcShapeFill(0)} 24`" stroke-width="1.5" :stroke="FINAL_CONFIG.style.colors.activeReadonly[0]" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <defs>
                        <radialGradient id="vueUiSmiley0">
                            <stop offset="0%" :stop-color="shiftHue(FINAL_CONFIG.style.colors.activeReadonly[0], 0.05)"/>
                            <stop offset="100%" :stop-color="FINAL_CONFIG.style.colors.activeReadonly[0]"/>
                        </radialGradient>
                    </defs>
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336zm-5 9.86a4.5 4.5 0 0 0 -3.214 1.35a1 1 0 1 0 1.428 1.4a2.5 2.5 0 0 1 3.572 0a1 1 0 0 0 1.428 -1.4a4.5 4.5 0 0 0 -3.214 -1.35zm-2.99 -4.2l-.127 .007a1 1 0 0 0 0 1.986l.117 .007l.127 -.007a1 1 0 0 0 0 -1.986l-.117 -.007zm6 0l-.127 .007a1 1 0 0 0 0 1.986l.117 .007l.127 -.007a1 1 0 0 0 0 -1.986l-.117 -.007z" stroke-width="0" :fill="FINAL_CONFIG.style.icons.useGradient ? `url(#vueUiSmiley0)` : FINAL_CONFIG.style.colors.activeReadonly[0]" /></svg>

                <svg v-if="!FINAL_CONFIG.style.icons.filled && isReadonly" style="position:absolute;top:0;left:0;transition: all 0.1s ease-in-out;" height="100%" :viewBox="`0 0 ${calcShapeFill(0)} 24`" stroke-width="1.5" :stroke="FINAL_CONFIG.style.colors.activeReadonly[0]" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M9 10l.01 0" /><path d="M15 10l.01 0" /><path d="M9.5 15.25a3.5 3.5 0 0 1 5 0" /></svg>
            </div>

            <!--2-->
            <div data-cy="smiley-item-1" tabindex="0" :class="{ 'vue-ui-smiley-rated' : !FINAL_CONFIG.readonly && currentRating === 2 }"  :style="`cursor:${FINAL_CONFIG.readonly ? 'default' : 'pointer'};height:${FINAL_CONFIG.style.itemSize}px;aspect-ratio:1/1;position:relative`" @mouseenter="hoveredValue = 1" @mouseleave="hoveredValue = undefined" @click="rate(2)" @keyup.enter="rate(2)">
                <template v-if="FINAL_CONFIG.style.tooltip.show && hasBreakdown && isReadonly">
                    <div data-cy="smiley-tooltip-1" class="vue-ui-rating-tooltip" :style="`border:1px solid ${FINAL_CONFIG.style.tooltip.borderColor};position:absolute;top:${-48 + FINAL_CONFIG.style.tooltip.offsetY}px;left:50%;transform:translateX(-50%);width:fit-content;text-align:center;background:${FINAL_CONFIG.style.tooltip.backgroundColor};display:${hoveredValue === 1 ? 'block' : 'none'};padding:2px 12px;border-radius:${FINAL_CONFIG.style.tooltip.borderRadius}px;box-shadow:${FINAL_CONFIG.style.tooltip.boxShadow}`">
                        <div :style="`width:100%;display:flex;flex-direction:row;gap:6px;position:relative;text-align:center;color:${FINAL_CONFIG.style.tooltip.color}`">
                            <span :style="`font-size:${FINAL_CONFIG.style.tooltip.fontSize}px`">2:</span> <span :style="`font-weight:${FINAL_CONFIG.style.tooltip.bold ? 'bold' : 'normal'};font-size:${FINAL_CONFIG.style.tooltip.fontSize}px`">
                                {{ applyDataLabel(
                                        FINAL_CONFIG.style.tooltip.formatter,
                                        props.dataset.rating['2'],
                                        dataLabel({
                                            v: props.dataset.rating['2'],
                                            r: FINAL_CONFIG.style.tooltip.roundingValue
                                        }),
                                        FINAL_CONFIG
                                    ) 
                                }}
                            </span>
                            <div :style="`font-family:Arial !important;position:absolute;top:calc(100% - 4px);left:50%;transform:translateX(-50%);color:${FINAL_CONFIG.style.tooltip.borderColor}`">
                                ▼
                            </div>
                        </div>
                    </div>
                </template>

                <svg :xmlns="XMLNS" v-if="FINAL_CONFIG.style.icons.filled" style="position:absolute;top:0;left:0;transition: all 0.1s ease-in-out" height="100%" viewBox="0 0 24 24" stroke-width="1.5" :stroke="getActiveColor(1)" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <defs>
                        <radialGradient id="vueUiSmiley1">
                            <stop offset="0%" :stop-color="shiftHue(FINAL_CONFIG.style.colors.active[1], 0.05)"/>
                            <stop offset="100%" :stop-color="FINAL_CONFIG.style.colors.active[1]"/>
                        </radialGradient>
                    </defs>
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336zm-2 10.66h-6l-.117 .007a1 1 0 0 0 0 1.986l.117 .007h6l.117 -.007a1 1 0 0 0 0 -1.986l-.117 -.007zm-5.99 -5l-.127 .007a1 1 0 0 0 0 1.986l.117 .007l.127 -.007a1 1 0 0 0 0 -1.986l-.117 -.007zm6 0l-.127 .007a1 1 0 0 0 0 1.986l.117 .007l.127 -.007a1 1 0 0 0 0 -1.986l-.117 -.007z" stroke-width="0" :fill="getActiveColor(1)" /></svg>

                <svg :xmlns="XMLNS" v-else style="position:absolute;top:0;left:0;transition: all 0.1s ease-in-out" height="100%" viewBox="0 0 24 24" stroke-width="1.5" :stroke="getActiveColor(1)" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M9 10l.01 0" /><path d="M15 10l.01 0" /><path d="M9 15l6 0" /></svg>

                <!-- RATING -->
                <svg :xmlns="XMLNS" v-if="FINAL_CONFIG.style.icons.filled && isReadonly" style="position:absolute;top:0;left:0;transition: all 0.1s ease-in-out" height="100%" :viewBox="`0 0 ${calcShapeFill(1)} 24`" stroke-width="1.5" :stroke="FINAL_CONFIG.style.colors.activeReadonly[1]" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <defs>
                        <radialGradient id="vueUiSmiley1">
                            <stop offset="0%" :stop-color="shiftHue(FINAL_CONFIG.style.colors.activeReadonly[1], 0.05)"/>
                            <stop offset="100%" :stop-color="FINAL_CONFIG.style.colors.activeReadonly[1]"/>
                        </radialGradient>
                    </defs>
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336zm-2 10.66h-6l-.117 .007a1 1 0 0 0 0 1.986l.117 .007h6l.117 -.007a1 1 0 0 0 0 -1.986l-.117 -.007zm-5.99 -5l-.127 .007a1 1 0 0 0 0 1.986l.117 .007l.127 -.007a1 1 0 0 0 0 -1.986l-.117 -.007zm6 0l-.127 .007a1 1 0 0 0 0 1.986l.117 .007l.127 -.007a1 1 0 0 0 0 -1.986l-.117 -.007z" stroke-width="0" :fill="FINAL_CONFIG.style.icons.useGradient ? `url(#vueUiSmiley1)` : FINAL_CONFIG.style.colors.activeReadonly[1]"/></svg>

                <svg v-if="!FINAL_CONFIG.style.icons.filled && isReadonly" style="position:absolute;top:0;left:0;transition: all 0.1s ease-in-out" height="100%" :viewBox="`0 0 ${calcShapeFill(1)} 24`" stroke-width="1.5" :stroke="FINAL_CONFIG.style.colors.activeReadonly[1]" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M9 10l.01 0" /><path d="M15 10l.01 0" /><path d="M9 15l6 0" /></svg>
            </div>

            <!--3-->
            <div data-cy="smiley-item-2" tabindex="0" :class="{ 'vue-ui-smiley-rated' : !FINAL_CONFIG.readonly && currentRating === 3 }" :style="`cursor:${FINAL_CONFIG.readonly ? 'default' : 'pointer'};height:${FINAL_CONFIG.style.itemSize}px;aspect-ratio:1/1;position:relative`" @mouseenter="hoveredValue = 2" @mouseleave="hoveredValue = undefined" @click="rate(3)" @keyup.enter="rate(3)">
                <template v-if="FINAL_CONFIG.style.tooltip.show && hasBreakdown && isReadonly">
                    <div data-cy="smiley-tooltip-2" class="vue-ui-rating-tooltip" :style="`border:1px solid ${FINAL_CONFIG.style.tooltip.borderColor};position:absolute;top:${-48 + FINAL_CONFIG.style.tooltip.offsetY}px;left:50%;transform:translateX(-50%);width:fit-content;text-align:center;background:${FINAL_CONFIG.style.tooltip.backgroundColor};display:${hoveredValue === 2 ? 'block' : 'none'};padding:2px 12px;border-radius:${FINAL_CONFIG.style.tooltip.borderRadius}px;box-shadow:${FINAL_CONFIG.style.tooltip.boxShadow}`">
                        <div :style="`width:100%;display:flex;flex-direction:row;gap:6px;position:relative;text-align:center;color:${FINAL_CONFIG.style.tooltip.color}`">
                            <span :style="`font-size:${FINAL_CONFIG.style.tooltip.fontSize}px`">3:</span> <span :style="`font-weight:${FINAL_CONFIG.style.tooltip.bold ? 'bold' : 'normal'};font-size:${FINAL_CONFIG.style.tooltip.fontSize}px`">
                                {{ applyDataLabel(
                                        FINAL_CONFIG.style.tooltip.formatter,
                                        props.dataset.rating['3'],
                                        dataLabel({
                                            v: props.dataset.rating['3'],
                                            r: FINAL_CONFIG.style.tooltip.roundingValue
                                        }),
                                        FINAL_CONFIG
                                    ) 
                                }}
                            </span>
                            <div :style="`font-family:Arial !important;position:absolute;top:calc(100% - 4px);left:50%;transform:translateX(-50%);color:${FINAL_CONFIG.style.tooltip.borderColor}`">
                                ▼
                            </div>
                        </div>
                    </div>
                </template>

                <svg :xmlns="XMLNS" v-if="FINAL_CONFIG.style.icons.filled" style="position:absolute;top:0;left:0;transition: all 0.1s ease-in-out" height="100%" viewBox="0 0 24 24" stroke-width="1.5" :stroke="getActiveColor(2)" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <defs>
                        <radialGradient id="vueUiSmiley2">
                            <stop offset="0%" :stop-color="shiftHue(FINAL_CONFIG.style.colors.activeReadonly[2], 0.05)"/>
                            <stop offset="100%" :stop-color="FINAL_CONFIG.style.colors.activeReadonly[2]"/>
                        </radialGradient>
                    </defs>
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336zm-7.99 5.66l-.127 .007a1 1 0 0 0 0 1.986l.117 .007l.127 -.007a1 1 0 0 0 0 -1.986l-.117 -.007zm6 0l-.127 .007a1 1 0 0 0 0 1.986l.117 .007l.127 -.007a1 1 0 0 0 0 -1.986l-.117 -.007z" stroke-width="0" :fill="getActiveColor(2)" /></svg>

                <svg :xmlns="XMLNS" v-else style="position:absolute;top:0;left:0;transition: all 0.1s ease-in-out" height="100%" viewBox="0 0 24 24" stroke-width="1.5" :stroke="getActiveColor(2)" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M9 10l.01 0" /><path d="M15 10l.01 0" /></svg>

                <!-- RATING -->
                <svg :xmlns="XMLNS" v-if="FINAL_CONFIG.style.icons.filled && isReadonly" style="position:absolute;top:0;left:0;transition: all 0.1s ease-in-out" height="100%" :viewBox="`0 0 ${calcShapeFill(2)} 24`" stroke-width="1.5" :stroke="FINAL_CONFIG.style.colors.activeReadonly[2]" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <defs>
                        <radialGradient id="vueUiSmiley2">
                            <stop offset="0%" :stop-color="shiftHue(FINAL_CONFIG.style.colors.activeReadonly[2], 0.05)"/>
                            <stop offset="100%" :stop-color="FINAL_CONFIG.style.colors.activeReadonly[2]"/>
                        </radialGradient>
                    </defs>
                <path d="M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336zm-7.99 5.66l-.127 .007a1 1 0 0 0 0 1.986l.117 .007l.127 -.007a1 1 0 0 0 0 -1.986l-.117 -.007zm6 0l-.127 .007a1 1 0 0 0 0 1.986l.117 .007l.127 -.007a1 1 0 0 0 0 -1.986l-.117 -.007z" stroke-width="0" :fill="FINAL_CONFIG.style.icons.useGradient ? `url(#vueUiSmiley2)` : FINAL_CONFIG.style.colors.activeReadonly[2]" /></svg>

                <svg :xmlns="XMLNS" v-if="!FINAL_CONFIG.style.icons.filled && isReadonly" style="position:absolute;top:0;left:0;transition: all 0.1s ease-in-out" height="100%" :viewBox="`0 0 ${calcShapeFill(2)} 24`" stroke-width="1.5" :stroke="FINAL_CONFIG.style.colors.activeReadonly[2]" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M9 10l.01 0" /><path d="M15 10l.01 0" /></svg>
            </div>

            <!--4-->
            <div data-cy="smiley-item-3" tabindex="0" :class="{ 'vue-ui-smiley-rated' : !FINAL_CONFIG.readonly && currentRating === 4 }" :style="`cursor:${FINAL_CONFIG.readonly ? 'default' : 'pointer'};height:${FINAL_CONFIG.style.itemSize}px;aspect-ratio:1/1;position:relative`" @mouseenter="hoveredValue = 3" @mouseleave="hoveredValue = undefined" @click="rate(4)" @keyup.enter="rate(4)">
                <template v-if="FINAL_CONFIG.style.tooltip.show && hasBreakdown && isReadonly">
                    <div data-cy="smiley-tooltip-3" class="vue-ui-rating-tooltip" :style="`border:1px solid ${FINAL_CONFIG.style.tooltip.borderColor};position:absolute;top:${-48 + FINAL_CONFIG.style.tooltip.offsetY}px;left:50%;transform:translateX(-50%);width:fit-content;text-align:center;background:${FINAL_CONFIG.style.tooltip.backgroundColor};display:${hoveredValue === 3 ? 'block' : 'none'};padding:2px 12px;border-radius:${FINAL_CONFIG.style.tooltip.borderRadius}px;box-shadow:${FINAL_CONFIG.style.tooltip.boxShadow}`">
                        <div :style="`width:100%;display:flex;flex-direction:row;gap:6px;position:relative;text-align:center;color:${FINAL_CONFIG.style.tooltip.color}`">
                            <span :style="`font-size:${FINAL_CONFIG.style.tooltip.fontSize}px`">4:</span> <span :style="`font-weight:${FINAL_CONFIG.style.tooltip.bold ? 'bold' : 'normal'};font-size:${FINAL_CONFIG.style.tooltip.fontSize}px`">
                                {{ applyDataLabel(
                                        FINAL_CONFIG.style.tooltip.formatter,
                                        props.dataset.rating['4'],
                                        dataLabel({
                                            v: props.dataset.rating['4'],
                                            r: FINAL_CONFIG.style.tooltip.roundingValue
                                        }),
                                        FINAL_CONFIG
                                    ) 
                                }}
                            </span>
                            <div :style="`font-family:Arial !important;position:absolute;top:calc(100% - 4px);left:50%;transform:translateX(-50%);color:${FINAL_CONFIG.style.tooltip.borderColor}`">
                                ▼
                            </div>
                        </div>
                    </div>
                </template>

                <svg :xmlns="XMLNS" v-if="FINAL_CONFIG.style.icons.filled" style="position:absolute;top:0;left:0;transition: all 0.1s ease-in-out" height="100%" viewBox="0 0 24 24" stroke-width="1.5" :stroke="getActiveColor(3)" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <defs>
                        <radialGradient id="vueUiSmiley3">
                            <stop offset="0%" :stop-color="shiftHue(FINAL_CONFIG.style.colors.activeReadonly[3], 0.95)"/>
                            <stop offset="100%" :stop-color="FINAL_CONFIG.style.colors.activeReadonly[3]"/>
                        </radialGradient>
                    </defs>
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336zm-1.8 10.946a1 1 0 0 0 -1.414 .014a2.5 2.5 0 0 1 -3.572 0a1 1 0 0 0 -1.428 1.4a4.5 4.5 0 0 0 6.428 0a1 1 0 0 0 -.014 -1.414zm-6.19 -5.286l-.127 .007a1 1 0 0 0 .117 1.993l.127 -.007a1 1 0 0 0 -.117 -1.993zm6 0l-.127 .007a1 1 0 0 0 .117 1.993l.127 -.007a1 1 0 0 0 -.117 -1.993z" stroke-width="0" :fill="getActiveColor(3)" /></svg>

                <svg :xmlns="XMLNS" v-else style="position:absolute;top:0;left:0;transition: all 0.1s ease-in-out" height="100%" viewBox="0 0 24 24" stroke-width="1.5" :stroke="getActiveColor(3)" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M9 10l.01 0" /><path d="M15 10l.01 0" /><path d="M9.5 15a3.5 3.5 0 0 0 5 0" /></svg>

                <!-- RATING -->
                <svg :xmlns="XMLNS" v-if="FINAL_CONFIG.style.icons.filled && isReadonly" style="position:absolute;top:0;left:0;transition: all 0.1s ease-in-out" height="100%" :viewBox="`0 0 ${calcShapeFill(3)} 24`" stroke-width="1.5" :stroke="FINAL_CONFIG.style.colors.activeReadonly[3]" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <defs>
                        <radialGradient id="vueUiSmiley3">
                            <stop offset="0%" :stop-color="shiftHue(FINAL_CONFIG.style.colors.activeReadonly[3], 0.95)"/>
                            <stop offset="100%" :stop-color="FINAL_CONFIG.style.colors.activeReadonly[3]"/>
                        </radialGradient>
                    </defs>
                <path d="M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336zm-1.8 10.946a1 1 0 0 0 -1.414 .014a2.5 2.5 0 0 1 -3.572 0a1 1 0 0 0 -1.428 1.4a4.5 4.5 0 0 0 6.428 0a1 1 0 0 0 -.014 -1.414zm-6.19 -5.286l-.127 .007a1 1 0 0 0 .117 1.993l.127 -.007a1 1 0 0 0 -.117 -1.993zm6 0l-.127 .007a1 1 0 0 0 .117 1.993l.127 -.007a1 1 0 0 0 -.117 -1.993z" stroke-width="0" :fill="FINAL_CONFIG.style.icons.useGradient ? `url(#vueUiSmiley3)` : FINAL_CONFIG.style.colors.activeReadonly[3]"/></svg>

                <svg :xmlns="XMLNS" v-if="!FINAL_CONFIG.style.icons.filled && isReadonly" style="position:absolute;top:0;left:0;transition: all 0.1s ease-in-out" height="100%" :viewBox="`0 0 ${calcShapeFill(3)} 24`"  stroke-width="1.5" :stroke="FINAL_CONFIG.style.colors.activeReadonly[3]" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M9 10l.01 0" /><path d="M15 10l.01 0" /><path d="M9.5 15a3.5 3.5 0 0 0 5 0" /></svg>
            </div>

            <!--5-->
            <div data-cy="smiley-item-4" tabindex="0" :class="{ 'vue-ui-smiley-rated' : !FINAL_CONFIG.readonly && currentRating === 5 }" :style="`cursor:${FINAL_CONFIG.readonly ? 'default' : 'pointer'};height:${FINAL_CONFIG.style.itemSize}px;aspect-ratio:1/1;position:relative`" @mouseenter="hoveredValue = 4" @mouseleave="hoveredValue = undefined" @click="rate(5)" @keyup.enter="rate(5)">
                <template v-if="FINAL_CONFIG.style.tooltip.show && hasBreakdown && isReadonly">
                    <div data-cy="smiley-tooltip-4" class="vue-ui-rating-tooltip" :style="`border:1px solid ${FINAL_CONFIG.style.tooltip.borderColor};position:absolute;top:${-48 + FINAL_CONFIG.style.tooltip.offsetY}px;left:50%;transform:translateX(-50%);width:fit-content;text-align:center;background:${FINAL_CONFIG.style.tooltip.backgroundColor};display:${hoveredValue === 4 ? 'block' : 'none'};padding:2px 12px;border-radius:${FINAL_CONFIG.style.tooltip.borderRadius}px;box-shadow:${FINAL_CONFIG.style.tooltip.boxShadow}`">
                        <div :style="`width:100%;display:flex;flex-direction:row;gap:6px;position:relative;text-align:center;color:${FINAL_CONFIG.style.tooltip.color}`">
                            <span :style="`font-size:${FINAL_CONFIG.style.tooltip.fontSize}px`">5:</span> <span :style="`font-weight:${FINAL_CONFIG.style.tooltip.bold ? 'bold' : 'normal'};font-size:${FINAL_CONFIG.style.tooltip.fontSize}px`">
                                {{ applyDataLabel(
                                        FINAL_CONFIG.style.tooltip.formatter,
                                        props.dataset.rating['5'],
                                        dataLabel({
                                            v: props.dataset.rating['5'],
                                            r: FINAL_CONFIG.style.tooltip.roundingValue
                                        }),
                                        FINAL_CONFIG
                                    ) 
                                }}
                            </span>
                            <div :style="`font-family:Arial !important;position:absolute;top:calc(100% - 4px);left:50%;transform:translateX(-50%);color:${FINAL_CONFIG.style.tooltip.borderColor}`">
                                ▼
                            </div>
                        </div>
                    </div>
                </template>

                <svg :xmlns="XMLNS" v-if="FINAL_CONFIG.style.icons.filled" style="position:absolute;top:0;left:0;transition: all 0.1s ease-in-out" height="100%" viewBox="0 0 24 24" stroke-width="1.5" :stroke="getActiveColor(4)"  fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <defs>
                        <radialGradient id="vueUiSmiley4">
                            <stop offset="0%" :stop-color="shiftHue(FINAL_CONFIG.style.colors.activeReadonly[4], 0.9)"/>
                            <stop offset="100%" :stop-color="FINAL_CONFIG.style.colors.activeReadonly[4]"/>
                        </radialGradient>
                    </defs>
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336zm-2 9.66h-6a1 1 0 0 0 -1 1v.05a3.975 3.975 0 0 0 3.777 3.97l.227 .005a4.026 4.026 0 0 0 3.99 -3.79l.006 -.206a1 1 0 0 0 -1 -1.029zm-5.99 -5l-.127 .007a1 1 0 0 0 .117 1.993l.127 -.007a1 1 0 0 0 -.117 -1.993zm6 0l-.127 .007a1 1 0 0 0 .117 1.993l.127 -.007a1 1 0 0 0 -.117 -1.993z" stroke-width="0" :fill="getActiveColor(4)" /></svg>

                <svg :xmlns="XMLNS" v-else style="position:absolute;top:0;left:0;transition: all 0.1s ease-in-out" height="100%" viewBox="0 0 24 24" stroke-width="1.5" :stroke="getActiveColor(4)" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M9 9l.01 0" /><path d="M15 9l.01 0" /><path d="M8 13a4 4 0 1 0 8 0h-8" /></svg>

                <!-- RATING -->
                <svg :xmlns="XMLNS" v-if="FINAL_CONFIG.style.icons.filled && isReadonly" style="position:absolute;top:0;left:0;transition: all 0.1s ease-in-out" height="100%" :viewBox="`0 0 ${calcShapeFill(4)} 24`" stroke-width="1.5" :stroke="FINAL_CONFIG.style.colors.activeReadonly[4]"  fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <defs>
                        <radialGradient id="vueUiSmiley4">
                            <stop offset="0%" :stop-color="shiftHue(FINAL_CONFIG.style.colors.activeReadonly[4], 0.9)"/>
                            <stop offset="100%" :stop-color="FINAL_CONFIG.style.colors.activeReadonly[4]"/>
                        </radialGradient>
                    </defs>
                <path d="M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336zm-2 9.66h-6a1 1 0 0 0 -1 1v.05a3.975 3.975 0 0 0 3.777 3.97l.227 .005a4.026 4.026 0 0 0 3.99 -3.79l.006 -.206a1 1 0 0 0 -1 -1.029zm-5.99 -5l-.127 .007a1 1 0 0 0 .117 1.993l.127 -.007a1 1 0 0 0 -.117 -1.993zm6 0l-.127 .007a1 1 0 0 0 .117 1.993l.127 -.007a1 1 0 0 0 -.117 -1.993z" stroke-width="0" :fill="FINAL_CONFIG.style.icons.useGradient ? `url(#vueUiSmiley4)` : FINAL_CONFIG.style.colors.activeReadonly[4]" /></svg>

                <svg :xmlns="XMLNS" v-if="!FINAL_CONFIG.style.icons.filled && isReadonly" style="position:absolute;top:0;left:0;transition: all 0.1s ease-in-out" height="100%" :viewBox="`0 0 ${calcShapeFill(4)} 24`" stroke-width="1.5" :stroke="FINAL_CONFIG.style.colors.activeReadonly[4]" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M9 9l.01 0" /><path d="M15 9l.01 0" /><path d="M8 13a4 4 0 1 0 8 0h-8" /></svg>
            </div>

            
            <!-- RATING POSITION RIGHT -->
            <div data-cy="smiley-position-right" v-if="FINAL_CONFIG.style.rating.show && FINAL_CONFIG.style.rating.position === 'right'" :style="`width:fit-content;text-align:center;margin-bottom:${FINAL_CONFIG.style.rating.offsetY}px;font-size:${FINAL_CONFIG.style.rating.fontSize}px;font-weight:${FINAL_CONFIG.style.rating.bold ? 'bold' : 'normal'};padding-left:${FINAL_CONFIG.style.rating.offsetX}px`">
                {{ applyDataLabel(
                    FINAL_CONFIG.style.rating.formatter,
                    currentRating,
                    dataLabel({
                        v: currentRating,
                        r: FINAL_CONFIG.style.rating.roundingValue
                    }),
                    FINAL_CONFIG
                ) }}
            </div>
        </div>

        <!-- RATING POSITION BOTTOM -->
        <div data-cy="smiley-position-bottom" v-if="FINAL_CONFIG.style.rating.show && FINAL_CONFIG.style.rating.position === 'bottom'" :style="`width:100%;text-align:center;margin-top:${FINAL_CONFIG.style.rating.offsetY}px;font-size:${FINAL_CONFIG.style.rating.fontSize}px;font-weight:${FINAL_CONFIG.style.rating.bold ? 'bold' : 'normal'};margin-left:${FINAL_CONFIG.style.rating.offsetX}px`">
            {{ applyDataLabel(
                    FINAL_CONFIG.style.rating.formatter,
                    currentRating,
                    dataLabel({
                        v: currentRating,
                        r: FINAL_CONFIG.style.rating.roundingValue
                    }),
                    FINAL_CONFIG
                ) 
            }}
        </div>
    </div>
</template>

<style scoped>
.vue-ui-smiley-rated {
    animation: vue-ui-smile 0.3s ease-in-out;
    transform-origin: center;
}

@keyframes vue-ui-smile {
    0% {
        transform: scale(0.9, 0.9);
    }
    50% {
        transform: scale(1.2,1.2);
    }
    75% {
        transform: scale(0.95, 0.95);
    }
    90% {
        transform: scale(1.1,1.1);
    }
    100% {
        transform: scale(1, 1);
    }
}
</style>