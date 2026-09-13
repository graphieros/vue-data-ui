<script setup>
import { ref, computed, onMounted, watch, useSlots } from 'vue';
import { applyDataLabel, dataLabel, error, objectIsEmpty } from '../lib';
import { useNestedProp } from '../useNestedProp';
import { COMMON_RULES, useHints } from '../useHints';
import { useConfig } from '../useConfig';
import BaseSmilingUnit from '../atoms/BaseSmilingUnit.vue';

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
const emit = defineEmits(['rate']);
const hoveredValue = ref(null);

const FINAL_CONFIG = ref(prepareConfig());
const cfgRating = computed(() => FINAL_CONFIG.value.style.rating);
const cfgStyle = computed(() => FINAL_CONFIG.value.style);

const debug = computed(() => FINAL_CONFIG.value.debug);

onMounted(() => {
    if (slots['chart-background'] && debug.value) {
        console.warn(
            'VueUiSmiley does not support the #chart-background slot.',
        );
    }
});

function prepareChart() {
    if (
        !Object.hasOwn(props.dataset, 'rating') ||
        objectIsEmpty(props.dataset)
    ) {
        error({
            componentName: 'VueUiSmiley',
            type: 'datasetAttribute',
            property: 'rating',
            debug: debug.value,
        });
    }
}

onMounted(prepareChart);

useHints({
    config: () => FINAL_CONFIG.value,
    dataset: () => [],
    component: 'VueUiSmiley',
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
        isReadonly.value = FINAL_CONFIG.value.readonly;
        prepareChart();
    },
    { deep: true },
);

const propRating = computed(() => {
    const rating = props.dataset.rating;

    if (rating && typeof rating === 'object' && !Array.isArray(rating)) {
        return calculateAverageRating(rating);
    }

    return rating ?? null;
});

const hasBreakdown = computed(() => {
    return (
        typeof props.dataset.rating === 'object' &&
        !Array.isArray(props.dataset.rating)
    );
});

const currentRating = ref(propRating.value);

watch(propRating, (newRating) => {
    currentRating.value = newRating;
});

const isReadonly = ref(FINAL_CONFIG.value.readonly);

const units = [
    {
        key: 'smiley_0',
        pathIconFilled:
            'M17 3.34A10 10 0 112.005 12.324L2 12l.005-.324A10 10 0 0117 3.34zm-5 9.86a4.5 4.5 0 00-3.214 1.35 1 1 0 101.428 1.4 2.5 2.5 0 013.572 0 1 1 0 001.428-1.4A4.5 4.5 0 0012 13.2zM9.01 9l-.127.007a1 1 0 000 1.986L9 11l.127-.007a1 1 0 000-1.986L9.01 9zm6 0-.127.007a1 1 0 000 1.986L15 11l.127-.007a1 1 0 000-1.986L15.01 9z',
        pathIcon:
            'M3 12a9 9 0 1018 0A9 9 0 103 12m6-2h.01M15 10h.01M9.5 15.25a3.5 3.5 0 015 0',
        pathIconFilledReadonly:
            'M17 3.34A10 10 0 112.005 12.324L2 12l.005-.324A10 10 0 0117 3.34zm-5 9.86a4.5 4.5 0 00-3.214 1.35 1 1 0 101.428 1.4 2.5 2.5 0 013.572 0 1 1 0 001.428-1.4A4.5 4.5 0 0012 13.2zM9.01 9l-.127.007a1 1 0 000 1.986L9 11l.127-.007a1 1 0 000-1.986L9.01 9zm6 0-.127.007a1 1 0 000 1.986L15 11l.127-.007a1 1 0 000-1.986L15.01 9z',
        pathIconReadonly: `M3 12a9 9 0 1018 0A9 9 0 103 12m6-2h.01M15 10h.01M9.5 15.25a3.5 3.5 0 015 0`,
    },
    {
        key: 'smiley_1',
        pathIconFilled:
            'M17 3.34A10 10 0 112.005 12.324L2 12l.005-.324A10 10 0 0117 3.34zM15 14H9l-.117.007a1 1 0 000 1.986L9 16h6l.117-.007a1 1 0 000-1.986L15 14zm-5.99-5-.127.007a1 1 0 000 1.986L9 11l.127-.007a1 1 0 000-1.986L9.01 9zm6 0-.127.007a1 1 0 000 1.986L15 11l.127-.007a1 1 0 000-1.986L15.01 9z',
        pathIcon: 'M3 12a9 9 0 1018 0A9 9 0 103 12m6-2h.01M15 10h.01M9 15h6',
        pathIconFilledReadonly:
            'M17 3.34A10 10 0 112.005 12.324L2 12l.005-.324A10 10 0 0117 3.34zM15 14H9l-.117.007a1 1 0 000 1.986L9 16h6l.117-.007a1 1 0 000-1.986L15 14zm-5.99-5-.127.007a1 1 0 000 1.986L9 11l.127-.007a1 1 0 000-1.986L9.01 9zm6 0-.127.007a1 1 0 000 1.986L15 11l.127-.007a1 1 0 000-1.986L15.01 9z',
        pathIconReadonly:
            'M3 12a9 9 0 1018 0A9 9 0 103 12m6-2h.01M15 10h.01M9 15h6',
    },
    {
        key: 'smiley_2',
        pathIconFilled:
            'M17 3.34A10 10 0 112.005 12.324L2 12l.005-.324A10 10 0 0117 3.34zM9.01 9l-.127.007a1 1 0 000 1.986L9 11l.127-.007a1 1 0 000-1.986L9.01 9zm6 0-.127.007a1 1 0 000 1.986L15 11l.127-.007a1 1 0 000-1.986L15.01 9z',
        pathIcon: 'M3 12a9 9 0 1018 0A9 9 0 103 12m6-2h.01M15 10h.01',
        pathIconFilledReadonly:
            'M17 3.34A10 10 0 112.005 12.324L2 12l.005-.324A10 10 0 0117 3.34zM9.01 9l-.127.007a1 1 0 000 1.986L9 11l.127-.007a1 1 0 000-1.986L9.01 9zm6 0-.127.007a1 1 0 000 1.986L15 11l.127-.007a1 1 0 000-1.986L15.01 9z',
        pathIconReadonly: 'M3 12a9 9 0 1018 0A9 9 0 103 12m6-2h.01M15 10h.01',
    },
    {
        key: 'smiley_3',
        pathIconFilled:
            'M17 3.34A10 10 0 112.005 12.324L2 12l.005-.324A10 10 0 0117 3.34zm-1.8 10.946a1 1 0 00-1.414.014 2.5 2.5 0 01-3.572 0 1 1 0 00-1.428 1.4 4.5 4.5 0 006.428 0 1 1 0 00-.014-1.414zM9.01 9l-.127.007A1 1 0 009 11l.127-.007A1 1 0 009.01 9zm6 0-.127.007A1 1 0 0015 11l.127-.007A1 1 0 0015.01 9z',
        pathIcon:
            'M3 12a9 9 0 1018 0A9 9 0 103 12m6-2h.01M15 10h.01M9.5 15a3.5 3.5 0 005 0',
        pathIconFilledReadonly:
            'M17 3.34A10 10 0 112.005 12.324L2 12l.005-.324A10 10 0 0117 3.34zm-1.8 10.946a1 1 0 00-1.414.014 2.5 2.5 0 01-3.572 0 1 1 0 00-1.428 1.4 4.5 4.5 0 006.428 0 1 1 0 00-.014-1.414zM9.01 9l-.127.007A1 1 0 009 11l.127-.007A1 1 0 009.01 9zm6 0-.127.007A1 1 0 0015 11l.127-.007A1 1 0 0015.01 9z',
        pathIconReadonly:
            'M3 12a9 9 0 1018 0A9 9 0 103 12m6-2h.01M15 10h.01M9.5 15a3.5 3.5 0 005 0',
    },
    {
        key: 'smiley_4',
        pathIconFilled:
            'M17 3.34A10 10 0 112.005 12.324L2 12l.005-.324A10 10 0 0117 3.34zM15 13H9a1 1 0 00-1 1v.05a3.975 3.975 0 003.777 3.97l.227.005a4.026 4.026 0 003.99-3.79l.006-.206A1 1 0 0015 13zm-5.99-5-.127.007A1 1 0 009 10l.127-.007A1 1 0 009.01 8zm6 0-.127.007A1 1 0 0015 10l.127-.007A1 1 0 0015.01 8z',
        pathIcon:
            'M3 12a9 9 0 1018 0A9 9 0 103 12M9 9h.01M15 9h.01M8 13a4 4 0 108 0H8',
        pathIconFilledReadonly:
            'M17 3.34A10 10 0 112.005 12.324L2 12l.005-.324A10 10 0 0117 3.34zM15 13H9a1 1 0 00-1 1v.05a3.975 3.975 0 003.777 3.97l.227.005a4.026 4.026 0 003.99-3.79l.006-.206A1 1 0 0015 13zm-5.99-5-.127.007A1 1 0 009 10l.127-.007A1 1 0 009.01 8zm6 0-.127.007A1 1 0 0015 10l.127-.007A1 1 0 0015.01 8z',
        pathIconReadonly:
            'M3 12a9 9 0 1018 0A9 9 0 103 12M9 9h.01M15 9h.01M8 13a4 4 0 108 0H8',
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
        return cfgStyle.value.colors.inactive[index];
    } else {
        if (currentRating.value === index + 1) {
            if (
                cfgStyle.value.icons.useGradient &&
                cfgStyle.value.icons.filled
            ) {
                return `url(#vueUiSmiley${index})`;
            }
            return cfgStyle.value.colors.active[index];
        } else {
            if (hoveredValue.value !== null && hoveredValue.value === index) {
                if (
                    cfgStyle.value.icons.useGradient &&
                    cfgStyle.value.icons.filled
                ) {
                    return `url(#vueUiSmiley${index})`;
                }
                return cfgStyle.value.colors.active[index];
            } else {
                return cfgStyle.value.colors.inactive[index];
            }
        }
    }
}

const formattedRating = computed(() => {
    return ({ value, tooltip = false }) =>
        applyDataLabel(
            tooltip
                ? cfgStyle.value.tooltip.formatter
                : cfgRating.value.formatter,
            value,
            dataLabel({
                v: value,
                r: tooltip
                    ? cfgStyle.value.tooltip.roundingValue
                    : cfgRating.value.roundingValue,
            }),
            FINAL_CONFIG.value,
        );
});

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
        class="vue-data-ui-component vue-ui-smiley"
        :style="`background:${cfgStyle.backgroundColor};font-family:${cfgStyle.fontFamily};width:100%;`"
        @mouseleave="hoveredValue = undefined"
    >
        <!-- TITLE -->
        <div
            class="vue-ui-rating-title"
            v-if="cfgStyle.title.text"
            style="width: 100%"
        >
            <div
                data-cy="smiley-title"
                :style="`color:${cfgStyle.title.color};font-weight:${cfgStyle.title.bold ? 'bold' : 'normal'};text-align:${cfgStyle.title.textAlign};margin-bottom:${cfgStyle.title.offsetY}px;font-size:${cfgStyle.title.fontSize}px`"
            >
                {{ cfgStyle.title.text }}
            </div>
            <div
                data-cy="smiley-subtitle"
                v-if="cfgStyle.title.subtitle.text"
                :style="`color:${cfgStyle.title.subtitle.color};font-size:${cfgStyle.title.subtitle.fontSize}px;text-align:${cfgStyle.title.textAlign};margin-bottom:${cfgStyle.title.subtitle.offsetY}px;font-weight:${cfgStyle.title.subtitle.bold ? 'bold' : 'normal'}`"
            >
                {{ cfgStyle.title.subtitle.text }}
            </div>
        </div>

        <!-- RATING POSITION TOP -->
        <div
            data-cy="smiley-position-top"
            v-if="cfgRating.show && cfgRating.position === 'top'"
            :style="`width:100%;text-align:center;margin-bottom:${cfgRating.offsetY}px;font-size:${cfgRating.fontSize}px;font-weight:${cfgRating.bold ? 'bold' : 'normal'};margin-left:${cfgRating.offsetX}px`"
        >
            {{ formattedRating({ value: currentRating }) }}
        </div>

        <div
            class="vue-ui-smiley-wrapper"
            :style="`overflow:visible;height:${cfgStyle.itemSize}px;width:fit-content;margin:0 auto;display:flex;align-items:center;justify-content:center;`"
        >
            <!-- RATING POSITION LEFT -->
            <div
                data-cy="smiley-position-left"
                v-if="cfgRating.show && cfgRating.position === 'left'"
                :style="`width:fit-content;text-align:center;margin-bottom:${cfgRating.offsetY}px;font-size:${cfgRating.fontSize}px;font-weight:${cfgRating.bold ? 'bold' : 'normal'};padding-right:${cfgRating.offsetX}px`"
            >
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
                    {{
                        formattedRating({
                            value: props.dataset.rating[String(i + 1)],
                            tooltip: true,
                        })
                    }}
                </template>
                <template #path-icon-filled>
                    <path
                        :d="unit.pathIconFilled"
                        stroke-width="0"
                        :fill="getActiveColor(i)"
                    />
                </template>
                <template #path-icon>
                    <path :d="unit.pathIcon" />
                </template>
                <template #path-icon-filled-readonly>
                    <path
                        :d="unit.pathIconFilledReadonly"
                        stroke-width="0"
                        :fill="
                            cfgStyle.icons.useGradient
                                ? `url(#vueUiSmiley${i})`
                                : cfgStyle.colors.activeReadonly[i]
                        "
                    />
                </template>
                <template #path-icon-readonly>
                    <path :d="unit.pathIconReadonly" />
                </template>
            </BaseSmilingUnit>

            <!-- RATING POSITION RIGHT -->
            <div
                data-cy="smiley-position-right"
                v-if="cfgRating.show && cfgRating.position === 'right'"
                :style="`width:fit-content;text-align:center;margin-bottom:${cfgRating.offsetY}px;font-size:${cfgRating.fontSize}px;font-weight:${cfgRating.bold ? 'bold' : 'normal'};padding-left:${cfgRating.offsetX}px`"
            >
                {{ formattedRating({ value: currentRating }) }}
            </div>
        </div>

        <!-- RATING POSITION BOTTOM -->
        <div
            data-cy="smiley-position-bottom"
            v-if="cfgRating.show && cfgRating.position === 'bottom'"
            :style="`width:100%;text-align:center;margin-top:${cfgRating.offsetY}px;font-size:${cfgRating.fontSize}px;font-weight:${cfgRating.bold ? 'bold' : 'normal'};margin-left:${cfgRating.offsetX}px`"
        >
            {{ formattedRating({ value: currentRating }) }}
        </div>
    </div>
</template>
