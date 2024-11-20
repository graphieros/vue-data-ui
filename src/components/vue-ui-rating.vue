<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { 
    createStar, 
    createUid,
    error,
    objectIsEmpty,
    shiftHue,
    XMLNS
} from "../lib.js";
import { useNestedProp } from "../useNestedProp";
import { useConfig } from "../useConfig";
import { applyDataLabel } from "../lib.js";
import { dataLabel } from "../lib.js";

const { vue_ui_rating: DEFAULT_CONFIG } = useConfig();

const props = defineProps({
    config: {
        type: Object,
        default() {
            return {}
        }
    },
    dataset: {
        type: Object,
        default() {
            return {}
        }
    }
});

const uid = ref(createUid());
const isTooltip = ref(false);
const hoveredValue = ref(undefined);
const units = ref([]);

const emit = defineEmits(['rate']);

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
    if(typeof props.dataset.rating === 'object' && !Array.isArray(props.dataset.rating)) {
        return calculateAverageRating(props.dataset.rating);
    } else {
        return props.dataset.rating;
    }
});

const hasBreakdown = computed(() => {
    return typeof props.dataset.rating === 'object' && !Array.isArray(props.dataset.rating);
})

const currentRating = ref(propRating.value);
const isImage = computed(() => FINAL_CONFIG.value.type === "image");
const isReadonly = computed(() => FINAL_CONFIG.value.readonly)

function calculateAverageRating(source) {
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
    return Math.min(FINAL_CONFIG.value.to, Math.max(FINAL_CONFIG.value.from, averageRating));
}

onMounted(() => {
    prepareChart();
});

function prepareChart() {
    if(objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiRating',
            type: 'dataset'
        })
    }
    units.value = [];
    for (let i = FINAL_CONFIG.value.from; i <= FINAL_CONFIG.value.to; i += 1) {
        units.value.push(i);
    }
}


function getInactiveFill(value, isImage = false) {
    if (value > hoveredValue.value || isReadonly.value) {
        return isImage ? FINAL_CONFIG.value.style.image.inactiveOpacity : FINAL_CONFIG.value.style.star.inactiveColor;
    } else {
        return isImage ? 1 : FINAL_CONFIG.value.style.star.useGradient ? `url(#star_gradient_under_${uid.value})` : FINAL_CONFIG.value.style.star.activeColor;
    }
}

function calcShapeFill(index, isImage = false) {
        const ratio = currentRating.value - index;
        const multiplicator = isImage ? 1 : 100;
        switch (true) {
            case ratio <= 0:
                return 0.001;
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

</script>

<template>
    <div :style="`background:${FINAL_CONFIG.style.backgroundColor};font-family:${FINAL_CONFIG.style.fontFamily};width:100%`" class="vue-ui-rating" @mouseover="isTooltip = true" @mouseleave="isTooltip = false; hoveredValue = undefined">
        <!-- TITLE -->
        <div class="vue-ui-rating-title" v-if="FINAL_CONFIG.style.title.text" style="width:100%">
            <div data-cy="rating-title" :style="`color:${FINAL_CONFIG.style.title.color};font-weight:${FINAL_CONFIG.style.title.bold ? 'bold' : 'normal'};text-align:${FINAL_CONFIG.style.title.textAlign};margin-bottom:${FINAL_CONFIG.style.title.offsetY}px;font-size:${FINAL_CONFIG.style.title.fontSize}px`">
                {{ FINAL_CONFIG.style.title.text }}
            </div>
            <div data-cy="rating-subtitle" v-if="FINAL_CONFIG.style.title.subtitle.text" :style="`color:${FINAL_CONFIG.style.title.subtitle.color};font-size:${FINAL_CONFIG.style.title.subtitle.fontSize}px;text-align:${FINAL_CONFIG.style.title.textAlign};margin-bottom:${FINAL_CONFIG.style.title.subtitle.offsetY}px;font-weight:${FINAL_CONFIG.style.title.subtitle.bold ? 'bold' : 'normal'}`">
                {{ FINAL_CONFIG.style.title.subtitle.text }}
            </div>
        </div>

        <!-- RATING POSITION TOP -->
        <div data-cy="rating-position-top" v-if="FINAL_CONFIG.style.rating.show && FINAL_CONFIG.style.rating.position === 'top'" :style="`width:100%;text-align:center;margin-bottom:${FINAL_CONFIG.style.rating.offsetY}px;font-size:${FINAL_CONFIG.style.rating.fontSize}px;font-weight:${FINAL_CONFIG.style.rating.bold ? 'bold' : 'normal'};margin-left:${FINAL_CONFIG.style.rating.offsetX}px`">
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

        <!-- RATING SECTION -->
        <div 
            class="vue-ui-rating-wrapper"
            :style="`height:${FINAL_CONFIG.style.itemSize}px;width:100%;display:flex;align-items:center;justify-content:center`"
        >

            <!-- RATING POSITION LEFT -->
            <div data-cy="rating-position-left" v-if="FINAL_CONFIG.style.rating.show && FINAL_CONFIG.style.rating.position === 'left'" :style="`width:fit-content;text-align:center;margin-bottom:${FINAL_CONFIG.style.rating.offsetY}px;font-size:${FINAL_CONFIG.style.rating.fontSize}px;font-weight:${FINAL_CONFIG.style.rating.bold ? 'bold' : 'normal'};padding-right:${FINAL_CONFIG.style.rating.offsetX}px`">
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

            <!-- STARS | IMAGES -->
            <template v-for="(value, i) in units">
                <div 
                    class="vue-ui-rating-unit-container"
                    :style="`position:relative;height:${FINAL_CONFIG.style.itemSize}px;width:${FINAL_CONFIG.style.itemSize}px`"
                >
                    <!-- IMAGE FIRST LAYER -->
                    <img
                        :data-cy="`rating-image-${i}`"
                        v-if="isImage"
                        :src="FINAL_CONFIG.style.image.src"
                        :height="FINAL_CONFIG.style.itemSize"
                        :width="FINAL_CONFIG.style.itemSize"
                        class="vue-ui-rating-unit"
                        :style="`position:absolute;top:0;left:0;opacity:${!isNaN(hoveredValue) ? getInactiveFill(value, true) : FINAL_CONFIG.style.image.inactiveOpacity}`"
                    />

                    <!-- STAR FIRST LAYER -->
                    <svg
                        :xmlns="XMLNS"
                        v-else
                        viewBox="0 0 100 100"
                        :height="FINAL_CONFIG.style.itemSize"
                        :width="FINAL_CONFIG.style.itemSize"
                        class="vue-ui-rating-unit"
                    >
                        <defs>
                            <radialGradient
                                cx="50%" cy="50%" r="50%" fx="50%" fy="50%"
                                :id="`star_gradient_under_${uid}`"
                            >
                                <stop offset="0%" :stop-color="`${shiftHue(FINAL_CONFIG.style.star.activeColor, 0.05)}`"/>
                                <stop offset="100%" :stop-color="FINAL_CONFIG.style.star.activeColor" />
                            </radialGradient>
                        </defs>
                        <polygon
                            :data-cy="`rating-shape-${i}`"
                            :points="createStar({
                                plot: { x: 50, y: 50 },
                                radius: 30,
                                apexes: FINAL_CONFIG.style.star.apexes
                            })"
                            :fill="
                                !isNaN(hoveredValue)
                                    ? getInactiveFill(value)
                                    : FINAL_CONFIG.style.star.inactiveColor
                            "
                            :stroke="
                                FINAL_CONFIG.style.star.borderColor
                                    ? FINAL_CONFIG.style.star.borderColor
                                    : hoveredValue
                                    ? getInactiveFill(value)
                                    : FINAL_CONFIG.style.star.inactiveColor
                            "
                            :stroke-width="FINAL_CONFIG.style.star.borderWidth"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        />
                    </svg>

                    <!-- IMAGE SECOND LAYER -->
                    <img
                        :data-cy="`rating-image-overlay-${i}`"
                        v-if="isImage"
                        :src="FINAL_CONFIG.style.image.src"
                        :alt="`${FINAL_CONFIG.style.image.alt} ${value}`"
                        :height="FINAL_CONFIG.style.itemSize"
                        :width="FINAL_CONFIG.style.itemSize"
                        :id="`active_${uid}_${value}`"
                        class="vue-ui-rating-unit"
                        :style="`position:absolute;top:0;left:0;clip:rect(0px,${calcShapeFill(i, true) * FINAL_CONFIG.style.itemSize}px,${FINAL_CONFIG.style.itemSize}px,0px`"
                    />

                    <!-- STAR SECOND LAYER -->
                    <svg
                        :xmlns="XMLNS"
                        :data-cy="`rating-shape-overlay-${i}`"
                        v-else
                        :viewBox="`0 0 ${calcShapeFill(i)} 100`"
                        :height="FINAL_CONFIG.style.itemSize"
                        class="vue-ui-rating-unit"
                        :id="`active_${uid}_${value}`"
                        style="position:absolute;top:0;left:0"
                    >
                        <defs>
                            <radialGradient
                                cx="50%" cy="50%" r="50%" fx="50%" fy="50%"
                                :id="`star_gradient_over_${uid}`"
                            >
                                <stop offset="0%" :stop-color="`${shiftHue(FINAL_CONFIG.style.star.activeColor, 0.05)}`"/>
                                <stop offset="100%" :stop-color="FINAL_CONFIG.style.star.activeColor" />
                            </radialGradient>
                        </defs>

                        <polygon
                            :points="createStar({
                                plot: { x: 50, y: 50 },
                                radius: 30,
                                apexes: FINAL_CONFIG.style.star.apexes
                            })"
                            :fill="FINAL_CONFIG.style.star.useGradient ? `url(#star_gradient_over_${uid})` : FINAL_CONFIG.style.star.activeColor"
                            :stroke="FINAL_CONFIG.style.star.activeColor"
                        />
                    </svg>

                    <!-- MOUSE TRAPS -->
                    <svg
                        :xmlns="XMLNS"
                        :viewBox="`0 0 100 100`"
                        :height="FINAL_CONFIG.style.itemSize"
                        class="vue-ui-rating-unit"
                        :style="`position:absolute;top:0;left:0;${isReadonly ? '' : 'cursor:pointer'}`"
                    >
                        <rect
                            :data-cy="`rating-active-trap-${i}`"
                            class="vue-ui-rating-mouse-trap"
                            v-if="!isReadonly"
                            :x="0"
                            :y="0"
                            :width="100"
                            :height="100"
                            fill="transparent"
                            @click="rate(value)"
                            @mouseenter="hoveredValue = value"
                            @mouseleave="hoveredValue = undefined"
                            tabindex="0"
                            @keyup.enter="rate(value)"
                        />
                        <rect
                            :data-cy="`rating-readonly-trap-${i}`"
                            class="vue-ui-rating-mouse-trap"
                            v-if="isReadonly"
                            :x="0"
                            :y="0"
                            :width="100"
                            :height="100"
                            fill="transparent"
                            @mouseenter="hoveredValue = value"
                            @mouseleave="hoveredValue = undefined"
                        />
                    </svg>
                    <template v-if="FINAL_CONFIG.style.tooltip.show && hasBreakdown && isReadonly">
                        <div class="vue-ui-rating-tooltip" :style="`border:1px solid ${FINAL_CONFIG.style.tooltip.borderColor};position:absolute;top:${-48 + FINAL_CONFIG.style.tooltip.offsetY}px;left:50%;transform:translateX(-50%);width:fit-content;text-align:center;background:${FINAL_CONFIG.style.tooltip.backgroundColor};display:${hoveredValue === value ? 'block' : 'none'};padding:2px 12px;border-radius:${FINAL_CONFIG.style.tooltip.borderRadius}px;box-shadow:${FINAL_CONFIG.style.tooltip.boxShadow}`">
                            <div :data-cy="`rating-tooltip-${i}`" :style="`width:100%;display:flex;flex-direction:row;gap:6px;position:relative;text-align:center;color:${FINAL_CONFIG.style.tooltip.color}`">
                                <span :style="`font-size:${FINAL_CONFIG.style.tooltip.fontSize}px`">{{ value }}:</span><span :style="`font-weight:${FINAL_CONFIG.style.tooltip.bold ? 'bold' : 'normal'};font-size:${FINAL_CONFIG.style.tooltip.fontSize}px`">
                                    {{ applyDataLabel(
                                        FINAL_CONFIG.style.tooltip.formatter,
                                        props.dataset.rating[value],
                                        dataLabel({
                                            v: props.dataset.rating[value],
                                            r: FINAL_CONFIG.style.tooltip.roundingValue
                                        }),
                                        FINAL_CONFIG
                                    ) }}
                                </span>
                                <div :style="`font-family:Arial !important;position:absolute;top:calc(100% - 4px);left:50%;transform:translateX(-50%);color:${FINAL_CONFIG.style.tooltip.borderColor}`">
                                    ▼
                                </div>
                            </div>
                        </div>
                    </template>
                </div>
            </template>

            <!-- RATING POSITION RIGHT -->
            <div data-cy="rating-position-right" v-if="FINAL_CONFIG.style.rating.show && FINAL_CONFIG.style.rating.position === 'right'" :style="`width:fit-content;text-align:center;margin-bottom:${FINAL_CONFIG.style.rating.offsetY}px;font-size:${FINAL_CONFIG.style.rating.fontSize}px;font-weight:${FINAL_CONFIG.style.rating.bold ? 'bold' : 'normal'};padding-left:${FINAL_CONFIG.style.rating.offsetX}px`"
            >
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
        <div data-cy="rating-position-bottom" v-if="FINAL_CONFIG.style.rating.show && FINAL_CONFIG.style.rating.position === 'bottom'" :style="`width:100%;text-align:center;margin-top:${FINAL_CONFIG.style.rating.offsetY}px;font-size:${FINAL_CONFIG.style.rating.fontSize}px;font-weight:${FINAL_CONFIG.style.rating.bold ? 'bold' : 'normal'};margin-left:${FINAL_CONFIG.style.rating.offsetX}px`">
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
.vue-ui-rating-wrapper {
    display: flex;
    align-items:center;
    gap: 1px;
    width: 100%;
}
.vue-ui-mouse-trap {
    cursor: pointer;
}
.vue-ui-mouse-trap:focus:not(:focus-visible) {
    outline: none;
}
</style>