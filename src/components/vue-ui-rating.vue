<script setup>
import { ref, computed, onMounted } from "vue";
import { 
    createStar, 
    createUid,
    error,
    objectIsEmpty,
    shiftHue,
    XMLNS
} from "../lib.js";
import mainConfig from "../default_configs.json";
import { useNestedProp } from "../useNestedProp";

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

const defaultConfig = ref(mainConfig.vue_ui_rating);
const isTooltip = ref(false);

const hoveredValue = ref(undefined);
const units = ref([]);

const emit = defineEmits(['rate']);

const ratingConfig = computed(() => {
    return useNestedProp({
        userConfig: props.config,
        defaultConfig: defaultConfig.value
    });
});

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
const isImage = ref(ratingConfig.value.type === "image");
const isReadonly = ref(ratingConfig.value.readonly);

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
    return Math.min(ratingConfig.value.to, Math.max(ratingConfig.value.from, averageRating));
}

onMounted(() => {
    if(objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiRating',
            type: 'dataset'
        })
    }

    for (let i = ratingConfig.value.from; i <= ratingConfig.value.to; i += 1) {
        units.value.push(i);
    }
});


function getInactiveFill(value, isImage = false) {
    if (value > hoveredValue.value || isReadonly.value) {
        return isImage ? ratingConfig.value.style.image.inactiveOpacity : ratingConfig.value.style.star.inactiveColor;
    } else {
        return isImage ? 1 : ratingConfig.value.style.star.useGradient ? `url(#star_gradient_under_${uid.value})` : ratingConfig.value.style.star.activeColor;
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
    <div :style="`background:${ratingConfig.style.backgroundColor};font-family:${ratingConfig.style.fontFamily};width:100%`" class="vue-ui-rating" @mouseover="isTooltip = true" @mouseleave="isTooltip = false; hoveredValue = undefined">
        <!-- TITLE -->
        <div class="vue-ui-rating-title" v-if="ratingConfig.style.title.text" style="width:100%">
            <div data-cy="rating-title" :style="`color:${ratingConfig.style.title.color};font-weight:${ratingConfig.style.title.bold ? 'bold' : 'normal'};text-align:${ratingConfig.style.title.textAlign};margin-bottom:${ratingConfig.style.title.offsetY}px;font-size:${ratingConfig.style.title.fontSize}px`">
                {{ ratingConfig.style.title.text }}
            </div>
            <div data-cy="rating-subtitle" v-if="ratingConfig.style.title.subtitle.text" :style="`color:${ratingConfig.style.title.subtitle.color};font-size:${ratingConfig.style.title.subtitle.fontSize}px;text-align:${ratingConfig.style.title.textAlign};margin-bottom:${ratingConfig.style.title.subtitle.offsetY}px;font-weight:${ratingConfig.style.title.subtitle.bold ? 'bold' : 'normal'}`">
                {{ ratingConfig.style.title.subtitle.text }}
            </div>
        </div>

        <!-- RATING POSITION TOP -->
        <div data-cy="rating-position-top" v-if="ratingConfig.style.rating.show && ratingConfig.style.rating.position === 'top'" :style="`width:100%;text-align:center;margin-bottom:${ratingConfig.style.rating.offsetY}px;font-size:${ratingConfig.style.rating.fontSize}px;font-weight:${ratingConfig.style.rating.bold ? 'bold' : 'normal'};margin-left:${ratingConfig.style.rating.offsetX}px`">
            {{ isNaN(currentRating) ? '' : currentRating.toFixed(ratingConfig.style.rating.roundingValue) }}
        </div>

        <!-- RATING SECTION -->
        <div 
            class="vue-ui-rating-wrapper"
            :style="`height:${ratingConfig.style.itemSize}px;width:100%;display:flex;align-items:center;justify-content:center`"
        >

            <!-- RATING POSITION LEFT -->
            <div data-cy="rating-position-left" v-if="ratingConfig.style.rating.show && ratingConfig.style.rating.position === 'left'" :style="`width:fit-content;text-align:center;margin-bottom:${ratingConfig.style.rating.offsetY}px;font-size:${ratingConfig.style.rating.fontSize}px;font-weight:${ratingConfig.style.rating.bold ? 'bold' : 'normal'};padding-right:${ratingConfig.style.rating.offsetX}px`">
            {{ isNaN(currentRating) ? '' : currentRating.toFixed(ratingConfig.style.rating.roundingValue) }}
            </div>

            <!-- STARS | IMAGES -->
            <template v-for="(value, i) in units">
                <div 
                    class="vue-ui-rating-unit-container"
                    :style="`position:relative;height:${ratingConfig.style.itemSize}px;width:${ratingConfig.style.itemSize}px`"
                >
                    <!-- IMAGE FIRST LAYER -->
                    <img
                        :data-cy="`rating-image-${i}`"
                        v-if="isImage"
                        :src="ratingConfig.style.image.src"
                        :height="ratingConfig.style.itemSize"
                        :width="ratingConfig.style.itemSize"
                        class="vue-ui-rating-unit"
                        :style="`position:absolute;top:0;left:0;opacity:${!isNaN(hoveredValue) ? getInactiveFill(value, true) : ratingConfig.style.image.inactiveOpacity}`"
                    />

                    <!-- STAR FIRST LAYER -->
                    <svg
                        :xmlns="XMLNS"
                        v-else
                        viewBox="0 0 100 100"
                        :height="ratingConfig.style.itemSize"
                        :width="ratingConfig.style.itemSize"
                        class="vue-ui-rating-unit"
                    >
                        <defs>
                            <radialGradient
                                cx="50%" cy="50%" r="50%" fx="50%" fy="50%"
                                :id="`star_gradient_under_${uid}`"
                            >
                                <stop offset="0%" :stop-color="`${shiftHue(ratingConfig.style.star.activeColor, 0.05)}`"/>
                                <stop offset="100%" :stop-color="ratingConfig.style.star.activeColor" />
                            </radialGradient>
                        </defs>
                        <polygon
                            :data-cy="`rating-shape-${i}`"
                            :points="createStar({
                                plot: { x: 50, y: 50 },
                                radius: 30,
                                apexes: ratingConfig.style.star.apexes
                            })"
                            :fill="
                                !isNaN(hoveredValue)
                                    ? getInactiveFill(value)
                                    : ratingConfig.style.star.inactiveColor
                            "
                            :stroke="
                                ratingConfig.style.star.borderColor
                                    ? ratingConfig.style.star.borderColor
                                    : hoveredValue
                                    ? getInactiveFill(value)
                                    : ratingConfig.style.star.inactiveColor
                            "
                            :stroke-width="ratingConfig.style.star.borderWidth"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        />
                    </svg>

                    <!-- IMAGE SECOND LAYER -->
                    <img
                        :data-cy="`rating-image-overlay-${i}`"
                        v-if="isImage"
                        :src="ratingConfig.style.image.src"
                        :alt="`${ratingConfig.style.image.alt} ${value}`"
                        :height="ratingConfig.style.itemSize"
                        :width="ratingConfig.style.itemSize"
                        :id="`active_${uid}_${value}`"
                        class="vue-ui-rating-unit"
                        :style="`position:absolute;top:0;left:0;clip:rect(0px,${calcShapeFill(i, true) * ratingConfig.style.itemSize}px,${ratingConfig.style.itemSize}px,0px`"
                    />

                    <!-- STAR SECOND LAYER -->
                    <svg
                        :xmlns="XMLNS"
                        :data-cy="`rating-shape-overlay-${i}`"
                        v-else
                        :viewBox="`0 0 ${calcShapeFill(i)} 100`"
                        :height="ratingConfig.style.itemSize"
                        class="vue-ui-rating-unit"
                        :id="`active_${uid}_${value}`"
                        style="position:absolute;top:0;left:0"
                    >
                        <defs>
                            <radialGradient
                                cx="50%" cy="50%" r="50%" fx="50%" fy="50%"
                                :id="`star_gradient_over_${uid}`"
                            >
                                <stop offset="0%" :stop-color="`${shiftHue(ratingConfig.style.star.activeColor, 0.05)}`"/>
                                <stop offset="100%" :stop-color="ratingConfig.style.star.activeColor" />
                            </radialGradient>
                        </defs>

                        <polygon
                            :points="createStar({
                                plot: { x: 50, y: 50 },
                                radius: 30,
                                apexes: ratingConfig.style.star.apexes
                            })"
                            :fill="ratingConfig.style.star.useGradient ? `url(#star_gradient_over_${uid})` : ratingConfig.style.star.activeColor"
                            :stroke="ratingConfig.style.star.activeColor"
                        />
                    </svg>

                    <!-- MOUSE TRAPS -->
                    <svg
                        :xmlns="XMLNS"
                        :viewBox="`0 0 100 100`"
                        :height="ratingConfig.style.itemSize"
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
                    <template v-if="ratingConfig.style.tooltip.show && hasBreakdown && isReadonly">
                        <div class="vue-ui-rating-tooltip" :style="`border:1px solid ${ratingConfig.style.tooltip.borderColor};position:absolute;top:${-48 + ratingConfig.style.tooltip.offsetY}px;left:50%;transform:translateX(-50%);width:fit-content;text-align:center;background:${ratingConfig.style.tooltip.backgroundColor};display:${hoveredValue === value ? 'block' : 'none'};padding:2px 12px;border-radius:${ratingConfig.style.tooltip.borderRadius}px;box-shadow:${ratingConfig.style.tooltip.boxShadow}`">
                            <div :data-cy="`rating-tooltip-${i}`" :style="`width:100%;display:flex;flex-direction:row;gap:6px;position:relative;text-align:center;color:${ratingConfig.style.tooltip.color}`">
                                <span :style="`font-size:${ratingConfig.style.tooltip.fontSize}px`">{{ value }}</span> : <span :style="`font-weight:${ratingConfig.style.tooltip.bold ? 'bold' : 'normal'};font-size:${ratingConfig.style.tooltip.fontSize}px`">{{ props.dataset.rating[value] }}</span>
                                <div :style="`font-family:Arial !important;position:absolute;top:calc(100% - 4px);left:50%;transform:translateX(-50%);color:${ratingConfig.style.tooltip.borderColor}`">
                                    ▼
                                </div>
                            </div>
                        </div>
                    </template>
                </div>
            </template>


            <!-- RATING POSITION RIGHT -->
            <div data-cy="rating-position-right" v-if="ratingConfig.style.rating.show && ratingConfig.style.rating.position === 'right'" :style="`width:fit-content;text-align:center;margin-bottom:${ratingConfig.style.rating.offsetY}px;font-size:${ratingConfig.style.rating.fontSize}px;font-weight:${ratingConfig.style.rating.bold ? 'bold' : 'normal'};padding-left:${ratingConfig.style.rating.offsetX}px`">
            {{ isNaN(currentRating) ? '' : currentRating.toFixed(ratingConfig.style.rating.roundingValue) }}
        </div>
        
        </div>

        <!-- RATING POSITION BOTTOM -->
        <div data-cy="rating-position-bottom" v-if="ratingConfig.style.rating.show && ratingConfig.style.rating.position === 'bottom'" :style="`width:100%;text-align:center;margin-top:${ratingConfig.style.rating.offsetY}px;font-size:${ratingConfig.style.rating.fontSize}px;font-weight:${ratingConfig.style.rating.bold ? 'bold' : 'normal'};margin-left:${ratingConfig.style.rating.offsetX}px`">
            {{ isNaN(currentRating) ? '' : currentRating.toFixed(ratingConfig.style.rating.roundingValue) }}
        </div>

        <!-- TOOLTIP -->
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