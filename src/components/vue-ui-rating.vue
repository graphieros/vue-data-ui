<script setup>
import { ref, computed, onMounted, watch, useSlots } from 'vue';
import {
    createStar,
    createUid,
    error,
    objectIsEmpty,
    shiftHue,
    XMLNS,
} from '../lib.js';
import { useNestedProp } from '../useNestedProp';
import { COMMON_RULES, useHints } from '../useHints';
import { useConfig } from '../useConfig';
import { applyDataLabel } from '../lib.js';
import { dataLabel } from '../lib.js';
import DefGrad from '../atoms/DefGrad.vue';

const { vue_ui_rating: DEFAULT_CONFIG } = useConfig();

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
const isTooltip = ref(false);
const hoveredValue = ref(undefined);
const focusedValue = ref(undefined);
const units = ref([]);
const slots = useSlots();

const emit = defineEmits(['rate']);

const FINAL_CONFIG = computed({
    get: () => {
        return prepareConfig();
    },
    set: (newCfg) => {
        return newCfg;
    },
});

const cfgRating = computed(() => FINAL_CONFIG.value.style.rating);
const cfgStyle = computed(() => FINAL_CONFIG.value.style);

onMounted(() => {
    if (slots['chart-background'] && FINAL_CONFIG.value.debug) {
        console.warn(
            'VueUiRating does not support the #chart-background slot.',
        );
    }
});

useHints({
    config: () => FINAL_CONFIG.value,
    dataset: () => [],
    component: 'VueUiRating',
    rules: [COMMON_RULES.noHint],
});

const isCursorPointer = computed(() => FINAL_CONFIG.value.useCursorPointer);

function prepareConfig() {
    return useNestedProp({
        userConfig: props.config,
        defaultConfig: DEFAULT_CONFIG,
    });
}

watch(
    () => props.config,
    (_newCfg) => {
        FINAL_CONFIG.value = prepareConfig();
        prepareChart();
    },
    { deep: true },
);

const propRating = computed(() => {
    if (
        typeof props.dataset.rating === 'object' &&
        !Array.isArray(props.dataset.rating)
    ) {
        return calculateAverageRating(props.dataset.rating);
    } else {
        return props.dataset.rating;
    }
});

const hasBreakdown = computed(() => {
    return (
        typeof props.dataset.rating === 'object' &&
        !Array.isArray(props.dataset.rating)
    );
});

const currentRating = ref(propRating.value);
const isImage = computed(() => FINAL_CONFIG.value.type === 'image');
const isReadonly = computed(() => FINAL_CONFIG.value.readonly);

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
    return Math.min(
        FINAL_CONFIG.value.to,
        Math.max(FINAL_CONFIG.value.from, averageRating),
    );
}

onMounted(() => {
    prepareChart();
});

function prepareChart() {
    if (
        !Object.hasOwn(props.dataset, 'rating') ||
        objectIsEmpty(props.dataset)
    ) {
        error({
            componentName: 'VueUiRating',
            type: 'datasetAttribute',
            property: 'rating',
            debug: FINAL_CONFIG.value.debug,
        });
    }
    units.value = [];
    for (let i = FINAL_CONFIG.value.from; i <= FINAL_CONFIG.value.to; i += 1) {
        units.value.push(i);
    }
}

function getInactiveFill(value, isImage = false) {
    if (value > hoveredValue.value || isReadonly.value) {
        return isImage
            ? cfgStyle.value.image.inactiveOpacity
            : cfgStyle.value.star.inactiveColor;
    } else {
        return isImage
            ? 1
            : cfgStyle.value.star.useGradient
              ? `url(#star_gradient_under_${uid.value})`
              : cfgStyle.value.star.activeColor;
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
    emit('rate', val);
}

function getData() {
    return currentRating.value;
}

function toggleReadonly(state = true) {
    isReadonly.value = state;
}

defineExpose({
    getData,
    toggleReadonly,
});
</script>

<template>
    <div
        :style="`background:${cfgStyle.backgroundColor};font-family:${cfgStyle.fontFamily};width:100%`"
        class="vue-data-ui-component vue-ui-rating"
        @mouseover="isTooltip = true"
        @mouseleave="
            isTooltip = false;
            hoveredValue = undefined;
        "
    >
        <!-- TITLE -->
        <div
            class="vue-ui-rating-title"
            v-if="cfgStyle.title.text"
            style="width: 100%"
        >
            <div
                data-cy="rating-title"
                :style="`color:${cfgStyle.title.color};font-weight:${cfgStyle.title.bold ? 'bold' : 'normal'};text-align:${cfgStyle.title.textAlign};margin-bottom:${cfgStyle.title.offsetY}px;font-size:${cfgStyle.title.fontSize}px`"
            >
                {{ cfgStyle.title.text }}
            </div>
            <div
                data-cy="rating-subtitle"
                v-if="cfgStyle.title.subtitle.text"
                :style="`color:${cfgStyle.title.subtitle.color};font-size:${cfgStyle.title.subtitle.fontSize}px;text-align:${cfgStyle.title.textAlign};margin-bottom:${cfgStyle.title.subtitle.offsetY}px;font-weight:${cfgStyle.title.subtitle.bold ? 'bold' : 'normal'}`"
            >
                {{ cfgStyle.title.subtitle.text }}
            </div>
        </div>

        <!-- RATING POSITION TOP -->
        <div
            data-cy="rating-position-top"
            v-if="cfgRating.show && cfgRating.position === 'top'"
            :style="`width:100%;text-align:center;margin-bottom:${cfgRating.offsetY}px;font-size:${cfgRating.fontSize}px;font-weight:${cfgRating.bold ? 'bold' : 'normal'};margin-left:${cfgRating.offsetX}px`"
        >
            {{
                applyDataLabel(
                    cfgRating.formatter,
                    currentRating,
                    dataLabel({
                        v: currentRating,
                        r: cfgRating.roundingValue,
                    }),
                    FINAL_CONFIG,
                )
            }}
        </div>

        <!-- RATING SECTION -->
        <div
            class="vue-ui-rating-wrapper"
            :style="`height:${cfgStyle.itemSize}px;width:100%;display:flex;align-items:center;justify-content:center`"
        >
            <!-- RATING POSITION LEFT -->
            <div
                data-cy="rating-position-left"
                v-if="cfgRating.show && cfgRating.position === 'left'"
                :style="`width:fit-content;text-align:center;margin-bottom:${cfgRating.offsetY}px;font-size:${cfgRating.fontSize}px;font-weight:${cfgRating.bold ? 'bold' : 'normal'};padding-right:${cfgRating.offsetX}px`"
            >
                {{
                    applyDataLabel(
                        cfgRating.formatter,
                        currentRating,
                        dataLabel({
                            v: currentRating,
                            r: cfgRating.roundingValue,
                        }),
                        FINAL_CONFIG,
                    )
                }}
            </div>

            <!-- STARS | IMAGES -->
            <template v-for="(value, i) in units">
                <div
                    class="vue-ui-rating-unit-container"
                    :style="`position:relative;height:${cfgStyle.itemSize}px;width:${cfgStyle.itemSize}px`"
                >
                    <!-- LAYER SLOTS -->
                    <div
                        v-if="$slots['layer-under'] || $slots['layer-above']"
                        style="position: relative"
                    >
                        <div
                            v-if="$slots['layer-under']"
                            style="
                                position: absolute;
                                top: 0;
                                left: 0;
                                width: 100%;
                                height: 100%;
                            "
                        >
                            <slot
                                name="layer-under"
                                v-bind="{
                                    value,
                                    size: cfgStyle.itemSize,
                                    hoveredValue,
                                    focusedValue,
                                }"
                            />
                        </div>
                        <div
                            v-if="$slots['layer-above']"
                            style="
                                position: absolute;
                                top: 0;
                                left: 0;
                                width: 100%;
                                height: 100%;
                            "
                        >
                            <slot
                                name="layer-above"
                                v-bind="{
                                    value,
                                    size: cfgStyle.itemSize,
                                    hoveredValue,
                                    focusedValue,
                                }"
                            />
                        </div>
                    </div>

                    <template v-else>
                        <!-- IMAGE FIRST LAYER -->
                        <img
                            :data-cy="`rating-image-${i}`"
                            v-if="isImage"
                            :src="cfgStyle.image.src"
                            :height="cfgStyle.itemSize"
                            :width="cfgStyle.itemSize"
                            class="vue-ui-rating-unit"
                            :style="`position:absolute;top:0;left:0;opacity:${!isNaN(hoveredValue) ? getInactiveFill(value, true) : cfgStyle.image.inactiveOpacity}`"
                        />

                        <!-- STAR FIRST LAYER -->
                        <svg
                            :xmlns="XMLNS"
                            v-else
                            viewBox="0 0 100 100"
                            :height="cfgStyle.itemSize"
                            :width="cfgStyle.itemSize"
                            class="vue-ui-rating-unit"
                        >
                            <defs>
                                <DefGrad
                                    t="radial"
                                    cx="50%"
                                    cy="50%"
                                    r="50%"
                                    fx="50%"
                                    fy="50%"
                                    :id="`star_gradient_under_${uid}`"
                                    :stops="[
                                        [
                                            '0%',
                                            shiftHue(
                                                cfgStyle.star.activeColor,
                                                0.05,
                                            ),
                                            1,
                                        ],
                                        ['100%', cfgStyle.star.activeColor, 1],
                                    ]"
                                />
                            </defs>
                            <polygon
                                :data-cy="`rating-shape-${i}`"
                                :points="
                                    createStar({
                                        plot: { x: 50, y: 50 },
                                        radius: 30,
                                        apexes: cfgStyle.star.apexes,
                                    })
                                "
                                :fill="
                                    !isNaN(hoveredValue)
                                        ? getInactiveFill(value)
                                        : cfgStyle.star.inactiveColor
                                "
                                :stroke="
                                    cfgStyle.star.borderColor
                                        ? cfgStyle.star.borderColor
                                        : hoveredValue
                                          ? getInactiveFill(value)
                                          : cfgStyle.star.inactiveColor
                                "
                                :stroke-width="cfgStyle.star.borderWidth"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            />
                        </svg>

                        <!-- IMAGE SECOND LAYER -->
                        <img
                            :data-cy="`rating-image-overlay-${i}`"
                            v-if="isImage"
                            :src="cfgStyle.image.src"
                            :alt="`${cfgStyle.image.alt} ${value}`"
                            :height="cfgStyle.itemSize"
                            :width="cfgStyle.itemSize"
                            :id="`active_${uid}_${value}`"
                            class="vue-ui-rating-unit"
                            :style="`position:absolute;top:0;left:0;clip:rect(0px,${calcShapeFill(i, true) * cfgStyle.itemSize}px,${cfgStyle.itemSize}px,0px`"
                        />

                        <!-- STAR SECOND LAYER -->
                        <svg
                            :xmlns="XMLNS"
                            :data-cy="`rating-shape-overlay-${i}`"
                            v-else
                            :viewBox="`0 0 ${calcShapeFill(i)} 100`"
                            :height="cfgStyle.itemSize"
                            class="vue-ui-rating-unit"
                            :id="`active_${uid}_${value}`"
                            style="position: absolute; top: 0; left: 0"
                        >
                            <defs>
                                <DefGrad
                                    t="radial"
                                    cx="50%"
                                    cy="50%"
                                    r="50%"
                                    fx="50%"
                                    fy="50%"
                                    :id="`star_gradient_over_${uid}`"
                                    :stops="[
                                        [
                                            '0%',
                                            shiftHue(
                                                cfgStyle.star.activeColor,
                                                0.05,
                                            ),
                                            1,
                                        ],
                                        ['100%', cfgStyle.star.activeColor, 1],
                                    ]"
                                />
                            </defs>

                            <polygon
                                :points="
                                    createStar({
                                        plot: { x: 50, y: 50 },
                                        radius: 30,
                                        apexes: cfgStyle.star.apexes,
                                    })
                                "
                                :fill="
                                    cfgStyle.star.useGradient
                                        ? `url(#star_gradient_over_${uid})`
                                        : cfgStyle.star.activeColor
                                "
                                :stroke="cfgStyle.star.activeColor"
                            />
                        </svg>
                    </template>

                    <!-- MOUSE TRAPS -->
                    <svg
                        :xmlns="XMLNS"
                        :viewBox="`0 0 100 100`"
                        :height="cfgStyle.itemSize"
                        class="vue-ui-rating-unit"
                        :style="`position:absolute;top:0;left:0;${isReadonly ? '' : isCursorPointer ? 'cursor:pointer' : ''}`"
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
                            @focus="focusedValue = value"
                            @blur="focusedValue = undefined"
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
                            @focus="focusedValue = value"
                            @blur="focusedValue = undefined"
                        />
                    </svg>
                    <template
                        v-if="
                            cfgStyle.tooltip.show && hasBreakdown && isReadonly
                        "
                    >
                        <div
                            class="vue-ui-rating-tooltip"
                            :style="`border:1px solid ${cfgStyle.tooltip.borderColor};position:absolute;top:${-48 + cfgStyle.tooltip.offsetY}px;left:50%;transform:translateX(-50%);width:fit-content;text-align:center;background:${cfgStyle.tooltip.backgroundColor};display:${hoveredValue === value ? 'block' : 'none'};padding:2px 12px;border-radius:${cfgStyle.tooltip.borderRadius}px;box-shadow:${cfgStyle.tooltip.boxShadow}`"
                        >
                            <div
                                :data-cy="`rating-tooltip-${i}`"
                                :style="`width:100%;display:flex;flex-direction:row;gap:6px;position:relative;text-align:center;color:${cfgStyle.tooltip.color}`"
                            >
                                <span
                                    :style="`font-size:${cfgStyle.tooltip.fontSize}px`"
                                    >{{ value }}:</span
                                ><span
                                    :style="`font-weight:${cfgStyle.tooltip.bold ? 'bold' : 'normal'};font-size:${cfgStyle.tooltip.fontSize}px`"
                                >
                                    {{
                                        applyDataLabel(
                                            cfgStyle.tooltip.formatter,
                                            props.dataset.rating[value],
                                            dataLabel({
                                                v: props.dataset.rating[value],
                                                r: cfgStyle.tooltip
                                                    .roundingValue,
                                            }),
                                            FINAL_CONFIG,
                                        )
                                    }}
                                </span>
                                <div
                                    :style="`font-family:Arial !important;position:absolute;top:calc(100% - 4px);left:50%;transform:translateX(-50%);color:${cfgStyle.tooltip.borderColor}`"
                                >
                                    ▼
                                </div>
                            </div>
                        </div>
                    </template>
                </div>
            </template>

            <!-- RATING POSITION RIGHT -->
            <div
                data-cy="rating-position-right"
                v-if="cfgRating.show && cfgRating.position === 'right'"
                :style="`width:fit-content;text-align:center;margin-bottom:${cfgRating.offsetY}px;font-size:${cfgRating.fontSize}px;font-weight:${cfgRating.bold ? 'bold' : 'normal'};padding-left:${cfgRating.offsetX}px`"
            >
                {{
                    applyDataLabel(
                        cfgRating.formatter,
                        currentRating,
                        dataLabel({
                            v: currentRating,
                            r: cfgRating.roundingValue,
                        }),
                        FINAL_CONFIG,
                    )
                }}
            </div>
        </div>

        <!-- RATING POSITION BOTTOM -->
        <div
            data-cy="rating-position-bottom"
            v-if="cfgRating.show && cfgRating.position === 'bottom'"
            :style="`width:100%;text-align:center;margin-top:${cfgRating.offsetY}px;font-size:${cfgRating.fontSize}px;font-weight:${cfgRating.bold ? 'bold' : 'normal'};margin-left:${cfgRating.offsetX}px`"
        >
            {{
                applyDataLabel(
                    cfgRating.formatter,
                    currentRating,
                    dataLabel({
                        v: currentRating,
                        r: cfgRating.roundingValue,
                    }),
                    FINAL_CONFIG,
                )
            }}
        </div>
    </div>
</template>

<style scoped>
.vue-ui-rating-wrapper {
    display: flex;
    align-items: center;
    gap: 1px;
    width: 100%;
}
.vue-ui-mouse-trap:focus:not(:focus-visible) {
    outline: none;
}
</style>
