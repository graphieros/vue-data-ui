<script setup>
import { ref, computed, onMounted, watch, useSlots } from "vue";
import { applyDataLabel, dataLabel, error, objectIsEmpty } from "../lib";
import { useNestedProp } from "../useNestedProp";
import { useConfig } from "../useConfig";
import BaseSmilingUnit from "../atoms/BaseSmilingUnit.vue";

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
const emit = defineEmits(["rate"]);
const hoveredValue = ref(null);

onMounted(() => {
    if (slots['chart-background']) {
        console.warn('VueUiSmiley does not support the #chart-background slot.')
    }
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

onMounted(prepareChart);

const FINAL_CONFIG = ref(prepareConfig());

const isCursorPointer = computed(() => FINAL_CONFIG.value.useCursorPointer);

function prepareConfig() {
    return useNestedProp({
        userConfig: props.config,
        defaultConfig: DEFAULT_CONFIG
    });
}

watch(() => props.config, (_newCfg) => {
    FINAL_CONFIG.value = prepareConfig();
    isReadonly.value = FINAL_CONFIG.value.readonly;
    prepareChart();
}, { deep: true });

const propRating = computed(() => {
    const rating = props.dataset.rating;

    if (rating && typeof rating === "object" && !Array.isArray(rating)) {
        return calculateAverageRating(rating);
    }

    return rating ?? null;
});

const hasBreakdown = computed(() => {
    return typeof props.dataset.rating === "object" && !Array.isArray(props.dataset.rating);
});

const currentRating = ref(propRating.value);

watch(
    propRating,
    (newRating) => {
        currentRating.value = newRating;
    }
);

const isReadonly = ref(FINAL_CONFIG.value.readonly);

const units = [
    {
        key: 'smiley_0',
        pathIconFilled: 'M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336zm-5 9.86a4.5 4.5 0 0 0 -3.214 1.35a1 1 0 1 0 1.428 1.4a2.5 2.5 0 0 1 3.572 0a1 1 0 0 0 1.428 -1.4a4.5 4.5 0 0 0 -3.214 -1.35zm-2.99 -4.2l-.127 .007a1 1 0 0 0 0 1.986l.117 .007l.127 -.007a1 1 0 0 0 0 -1.986l-.117 -.007zm6 0l-.127 .007a1 1 0 0 0 0 1.986l.117 .007l.127 -.007a1 1 0 0 0 0 -1.986l-.117 -.007z',
        pathIcon: 'M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0 M9 10l.01 0 M15 10l.01 0 M9.5 15.25a3.5 3.5 0 0 1 5 0',
        pathIconFilledReadonly: 'M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336zm-5 9.86a4.5 4.5 0 0 0 -3.214 1.35a1 1 0 1 0 1.428 1.4a2.5 2.5 0 0 1 3.572 0a1 1 0 0 0 1.428 -1.4a4.5 4.5 0 0 0 -3.214 -1.35zm-2.99 -4.2l-.127 .007a1 1 0 0 0 0 1.986l.117 .007l.127 -.007a1 1 0 0 0 0 -1.986l-.117 -.007zm6 0l-.127 .007a1 1 0 0 0 0 1.986l.117 .007l.127 -.007a1 1 0 0 0 0 -1.986l-.117 -.007z',
        pathIconReadonly: `M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0 M9 10l.01 0 M15 10l.01 0 M9.5 15.25a3.5 3.5 0 0 1 5 0`
    },
    {
        key: 'smiley_1',
        pathIconFilled: 'M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336zm-2 10.66h-6l-.117 .007a1 1 0 0 0 0 1.986l.117 .007h6l.117 -.007a1 1 0 0 0 0 -1.986l-.117 -.007zm-5.99 -5l-.127 .007a1 1 0 0 0 0 1.986l.117 .007l.127 -.007a1 1 0 0 0 0 -1.986l-.117 -.007zm6 0l-.127 .007a1 1 0 0 0 0 1.986l.117 .007l.127 -.007a1 1 0 0 0 0 -1.986l-.117 -.007z',
        pathIcon: 'M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0 M9 10l.01 0 M15 10l.01 0 M9 15l6 0',
        pathIconFilledReadonly: 'M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336zm-2 10.66h-6l-.117 .007a1 1 0 0 0 0 1.986l.117 .007h6l.117 -.007a1 1 0 0 0 0 -1.986l-.117 -.007zm-5.99 -5l-.127 .007a1 1 0 0 0 0 1.986l.117 .007l.127 -.007a1 1 0 0 0 0 -1.986l-.117 -.007zm6 0l-.127 .007a1 1 0 0 0 0 1.986l.117 .007l.127 -.007a1 1 0 0 0 0 -1.986l-.117 -.007z',
        pathIconReadonly: 'M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0 M9 10l.01 0 M15 10l.01 0 M9 15l6 0'
    },
    {
        key: 'smiley_2',
        pathIconFilled: 'M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336zm-7.99 5.66l-.127 .007a1 1 0 0 0 0 1.986l.117 .007l.127 -.007a1 1 0 0 0 0 -1.986l-.117 -.007zm6 0l-.127 .007a1 1 0 0 0 0 1.986l.117 .007l.127 -.007a1 1 0 0 0 0 -1.986l-.117 -.007z',
        pathIcon: 'M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0 M9 10l.01 0 M15 10l.01 0',
        pathIconFilledReadonly: 'M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336zm-7.99 5.66l-.127 .007a1 1 0 0 0 0 1.986l.117 .007l.127 -.007a1 1 0 0 0 0 -1.986l-.117 -.007zm6 0l-.127 .007a1 1 0 0 0 0 1.986l.117 .007l.127 -.007a1 1 0 0 0 0 -1.986l-.117 -.007z',
        pathIconReadonly: 'M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0 M9 10l.01 0 M15 10l.01 0'
    },
    {
        key: 'smiley_3',
        pathIconFilled: 'M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336zm-1.8 10.946a1 1 0 0 0 -1.414 .014a2.5 2.5 0 0 1 -3.572 0a1 1 0 0 0 -1.428 1.4a4.5 4.5 0 0 0 6.428 0a1 1 0 0 0 -.014 -1.414zm-6.19 -5.286l-.127 .007a1 1 0 0 0 .117 1.993l.127 -.007a1 1 0 0 0 -.117 -1.993zm6 0l-.127 .007a1 1 0 0 0 .117 1.993l.127 -.007a1 1 0 0 0 -.117 -1.993z',
        pathIcon: 'M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0 M9 10l.01 0 M15 10l.01 0 M9.5 15a3.5 3.5 0 0 0 5 0',
        pathIconFilledReadonly: 'M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336zm-1.8 10.946a1 1 0 0 0 -1.414 .014a2.5 2.5 0 0 1 -3.572 0a1 1 0 0 0 -1.428 1.4a4.5 4.5 0 0 0 6.428 0a1 1 0 0 0 -.014 -1.414zm-6.19 -5.286l-.127 .007a1 1 0 0 0 .117 1.993l.127 -.007a1 1 0 0 0 -.117 -1.993zm6 0l-.127 .007a1 1 0 0 0 .117 1.993l.127 -.007a1 1 0 0 0 -.117 -1.993z',
        pathIconReadonly: 'M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0 M9 10l.01 0 M15 10l.01 0 M9.5 15a3.5 3.5 0 0 0 5 0'
    },
    {
        key: 'smiley_4',
        pathIconFilled: 'M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336zm-2 9.66h-6a1 1 0 0 0 -1 1v.05a3.975 3.975 0 0 0 3.777 3.97l.227 .005a4.026 4.026 0 0 0 3.99 -3.79l.006 -.206a1 1 0 0 0 -1 -1.029zm-5.99 -5l-.127 .007a1 1 0 0 0 .117 1.993l.127 -.007a1 1 0 0 0 -.117 -1.993zm6 0l-.127 .007a1 1 0 0 0 .117 1.993l.127 -.007a1 1 0 0 0 -.117 -1.993z',
        pathIcon: 'M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0 M9 9l.01 0 M15 9l.01 0 M8 13a4 4 0 1 0 8 0h-8',
        pathIconFilledReadonly: 'M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336zm-2 9.66h-6a1 1 0 0 0 -1 1v.05a3.975 3.975 0 0 0 3.777 3.97l.227 .005a4.026 4.026 0 0 0 3.99 -3.79l.006 -.206a1 1 0 0 0 -1 -1.029zm-5.99 -5l-.127 .007a1 1 0 0 0 .117 1.993l.127 -.007a1 1 0 0 0 -.117 -1.993zm6 0l-.127 .007a1 1 0 0 0 .117 1.993l.127 -.007a1 1 0 0 0 -.117 -1.993z',
        pathIconReadonly: 'M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0 M9 9l.01 0 M15 9l.01 0 M8 13a4 4 0 1 0 8 0h-8'
    },
];

function calculateAverageRating(source) {
    if (source == null) return null;

    let totalSum = 0;
    let totalCount = 0;

    for (const key in source) {
        const ratingValue = Number(key);
        const ratingCount = source[key];
        if (!Number.isFinite(ratingValue)) {
            continue;
        }
        totalSum += ratingValue * ratingCount;
        totalCount += ratingCount;
    }

    if (totalCount === 0) {
        return 0;
    }

    return totalSum / totalCount;
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
            if(hoveredValue.value !== null && hoveredValue.value === index) {
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

const formattedRating = computed(() => {
    return ({ value, tooltip = false}) => applyDataLabel(
        tooltip ? FINAL_CONFIG.value.style.tooltip.formatter : FINAL_CONFIG.value.style.rating.formatter,
        value,
        dataLabel({
            v: value,
            r: tooltip ? FINAL_CONFIG.value.style.tooltip.roundingValue : FINAL_CONFIG.value.style.rating.roundingValue
        }),
        FINAL_CONFIG.value
    )
});

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
</script>

<template>
    <div class="vue-data-ui-component vue-ui-smiley" :style="`background:${FINAL_CONFIG.style.backgroundColor};font-family:${FINAL_CONFIG.style.fontFamily};width:100%;`"  @mouseleave="hoveredValue = undefined">
        <!-- TITLE -->
        <div 
            class="vue-ui-rating-title" v-if="FINAL_CONFIG.style.title.text" style="width:100%">
            <div data-cy="smiley-title" :style="`color:${FINAL_CONFIG.style.title.color};font-weight:${FINAL_CONFIG.style.title.bold ? 'bold' : 'normal'};text-align:${FINAL_CONFIG.style.title.textAlign};margin-bottom:${FINAL_CONFIG.style.title.offsetY}px;font-size:${FINAL_CONFIG.style.title.fontSize}px`">
                {{ FINAL_CONFIG.style.title.text }}
            </div>
            <div data-cy="smiley-subtitle" v-if="FINAL_CONFIG.style.title.subtitle.text" :style="`color:${FINAL_CONFIG.style.title.subtitle.color};font-size:${FINAL_CONFIG.style.title.subtitle.fontSize}px;text-align:${FINAL_CONFIG.style.title.textAlign};margin-bottom:${FINAL_CONFIG.style.title.subtitle.offsetY}px;font-weight:${FINAL_CONFIG.style.title.subtitle.bold ? 'bold' : 'normal'}`">
                {{ FINAL_CONFIG.style.title.subtitle.text }}
            </div>
        </div>

        <!-- RATING POSITION TOP -->
        <div data-cy="smiley-position-top" v-if="FINAL_CONFIG.style.rating.show && FINAL_CONFIG.style.rating.position === 'top'" :style="`width:100%;text-align:center;margin-bottom:${FINAL_CONFIG.style.rating.offsetY}px;font-size:${FINAL_CONFIG.style.rating.fontSize}px;font-weight:${FINAL_CONFIG.style.rating.bold ? 'bold' : 'normal'};margin-left:${FINAL_CONFIG.style.rating.offsetX}px`">
            {{ formattedRating({ value: currentRating}) }}
        </div>

        <div class="vue-ui-smiley-wrapper" :style="`overflow:visible;height:${FINAL_CONFIG.style.itemSize}px;width:fit-content;margin:0 auto;display:flex;align-items:center;justify-content:center;`">
            <!-- RATING POSITION LEFT -->
            <div data-cy="smiley-position-left" v-if="FINAL_CONFIG.style.rating.show && FINAL_CONFIG.style.rating.position === 'left'" :style="`width:fit-content;text-align:center;margin-bottom:${FINAL_CONFIG.style.rating.offsetY}px;font-size:${FINAL_CONFIG.style.rating.fontSize}px;font-weight:${FINAL_CONFIG.style.rating.bold ? 'bold' : 'normal'};padding-right:${FINAL_CONFIG.style.rating.offsetX}px`">
                {{ formattedRating({ value: currentRating }) }}
            </div>

            <BaseSmilingUnit
                v-for="(unit, i) in units"
                :key="unit.key"
                :config="FINAL_CONFIG"
                :unit="i + 1"
                :currentRating="currentRating"
                :isReadonly="isReadonly"
                :hasBreakdown="hasBreakdown"
                :hoveredValue="hoveredValue"
                :getActiveColor="getActiveColor"
                :calcShapeFill="calcShapeFill"
                :isCursorPointer="isCursorPointer"
                @mouseenter="hoveredValue = i"
                @mouseleave="hoveredValue = null"
                @rate="rate(i + 1)"
            >
                <template #rating>
                    {{ formattedRating({ value: props.dataset.rating[String(i + 1)], tooltip: true }) }}
                </template>
                <template #path-icon-filled>
                    <path :d="unit.pathIconFilled" stroke-width="0" :fill="getActiveColor(i)" />
                </template>
                <template #path-icon>
                    <path :d="unit.pathIcon" />
                </template>
                <template #path-icon-filled-readonly>
                    <path :d="unit.pathIconFilledReadonly" stroke-width="0" :fill="FINAL_CONFIG.style.icons.useGradient ? `url(#vueUiSmiley${i})` : FINAL_CONFIG.style.colors.activeReadonly[i]" />
                </template>
                <template #path-icon-readonly>
                    <path :d="unit.pathIconReadonly" />
                </template>
            </BaseSmilingUnit>
            
            <!-- RATING POSITION RIGHT -->
            <div data-cy="smiley-position-right" v-if="FINAL_CONFIG.style.rating.show && FINAL_CONFIG.style.rating.position === 'right'" :style="`width:fit-content;text-align:center;margin-bottom:${FINAL_CONFIG.style.rating.offsetY}px;font-size:${FINAL_CONFIG.style.rating.fontSize}px;font-weight:${FINAL_CONFIG.style.rating.bold ? 'bold' : 'normal'};padding-left:${FINAL_CONFIG.style.rating.offsetX}px`">
                {{ formattedRating({ value: currentRating }) }}
            </div>
        </div>

        <!-- RATING POSITION BOTTOM -->
        <div data-cy="smiley-position-bottom" v-if="FINAL_CONFIG.style.rating.show && FINAL_CONFIG.style.rating.position === 'bottom'" :style="`width:100%;text-align:center;margin-top:${FINAL_CONFIG.style.rating.offsetY}px;font-size:${FINAL_CONFIG.style.rating.fontSize}px;font-weight:${FINAL_CONFIG.style.rating.bold ? 'bold' : 'normal'};margin-left:${FINAL_CONFIG.style.rating.offsetX}px`">
            {{ formattedRating({ value: currentRating }) }}
        </div>
    </div>
</template>