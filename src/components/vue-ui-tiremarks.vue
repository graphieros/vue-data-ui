<script setup>
import {
    computed,
    defineAsyncComponent,
    nextTick,
    onMounted,
    ref,
    toRefs,
    watch,
} from 'vue';
import {
    applyDataLabel,
    checkNaN,
    createUid,
    dataLabel,
    error,
    objectIsEmpty,
    shiftHue,
    treeShake,
    XMLNS,
} from '../lib';
import { throttle } from '../canvas-lib';
import { COMMON_RULES, useHints } from '../useHints';
import { useConfig } from '../useConfig';
import { useLoading } from '../useLoading';
import { usePrinter } from '../usePrinter';
import { useNestedProp } from '../useNestedProp';
import { useResponsive } from '../useResponsive';
import { useThemeCheck } from '../useThemeCheck';
import { useChartExport } from '../useChartExport';
import { useUserOptionState } from '../useUserOptionState';
import { useChartAccessibility } from '../useChartAccessibility';
import { usePrefersReducedMotion } from '../usePrefersMotion';
import themes from '../themes/vue_ui_tiremarks.json';
import Title from '../atoms/Title.vue';
import img from '../img';
import BaseScanner from '../atoms/BaseScanner.vue';

const PenAndPaper = defineAsyncComponent(
    () => import('../atoms/PenAndPaper.vue'),
);
const UserOptions = defineAsyncComponent(
    () => import('../atoms/UserOptions.vue'),
);
const PackageVersion = defineAsyncComponent(
    () => import('../atoms/PackageVersion.vue'),
);

const { vue_ui_tiremarks: DEFAULT_CONFIG } = useConfig();
const { isThemeValid, warnInvalidTheme } = useThemeCheck();
const prefersReducedMotion = usePrefersReducedMotion();

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

const emit = defineEmits(['copyAlt']);

const isDataset = computed(() => {
    return !!props.dataset && Object.keys(props.dataset).length;
});

const uid = ref(createUid());
const tiremarksChart = ref(null);
const noTitle = ref(null);
const chartTitle = ref(null);
const source = ref(null);
const step = ref(0);
const titleStep = ref(0);
const resizeObserver = ref(null);
const observedEl = ref(null);

const FINAL_CONFIG = ref(prepareConfig());
const cfgUserOptions = computed(() => FINAL_CONFIG.value.userOptions);
const cfgLayout = computed(() => FINAL_CONFIG.value.style.chart.layout);
const cfgChart = computed(() => FINAL_CONFIG.value.style.chart);

useHints({
    config: () => FINAL_CONFIG.value,
    dataset: () => props.dataset,
    component: 'VueUiTiremarks',
    rules: [COMMON_RULES.noHint],
});

const isCursorPointer = computed(
    () => FINAL_CONFIG.value.userOptions.useCursorPointer,
);

const skeletonConfig = computed(() => {
    return treeShake({
        defaultConfig: {
            userOptions: { show: false },
            style: {
                chart: {
                    backgroundColor: '#99999930',
                    animation: { use: false },
                    layout: {
                        activeColor: '#6A6A6A80',
                        inactiveColor: '#CACACA80',
                        ticks: {
                            gradient: { show: false },
                        },
                    },
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
    skeletonDataset: props.config?.skeletonDataset ?? { percentage: 50 },
    skeletonConfig: treeShake({
        defaultConfig: FINAL_CONFIG.value,
        userConfig: skeletonConfig.value,
    }),
});

const { userOptionsVisible, setUserOptionsVisibility, keepUserOptionState } =
    useUserOptionState({ config: FINAL_CONFIG.value });
const { svgRef } = useChartAccessibility({
    config: cfgChart.value.title,
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

watch(
    () => props.config,
    (_newCfg) => {
        FINAL_CONFIG.value = prepareConfig();
        userOptionsVisible.value =
            !FINAL_CONFIG.value.userOptions.showOnChartHover;
        WIDTH.value = cfgChart.value.width;
        HEIGHT.value = cfgChart.value.height;
        prepareChart();
        titleStep.value += 1;
    },
    { deep: true },
);

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: uid.value,
    fileName: cfgChart.value.title.text || 'vue-ui-tiremarks',
    options: FINAL_CONFIG.value.userOptions.print,
});

const hasOptionsNoTitle = computed(() => {
    return FINAL_CONFIG.value.userOptions.show && !cfgChart.value.title.text;
});

const activeValue = ref(
    cfgChart.value.animation.use && !prefersReducedMotion.value
        ? 0
        : checkNaN(FINAL_DATASET.value.percentage),
);

watch(
    () => FINAL_DATASET.value,
    (v) => {
        if (cfgChart.value.animation.use && !prefersReducedMotion.value) {
            useAnimation(v.percentage);
        } else {
            activeValue.value = v.percentage || 0;
        }
    },
    { deep: true },
);

onMounted(() => {
    prepareChart();
});

function useAnimation(targetValue) {
    let speed = cfgChart.value.animation.speed;
    const chunk = Math.abs(targetValue - activeValue.value) / (speed * 120);

    function animate() {
        if (activeValue.value < targetValue) {
            activeValue.value = Math.min(
                activeValue.value + chunk,
                targetValue,
            );
        } else if (activeValue.value > targetValue) {
            activeValue.value = Math.max(
                activeValue.value - chunk,
                targetValue,
            );
        }

        if (activeValue.value !== targetValue) {
            requestAnimationFrame(animate);
        }
    }
    animate();
}

const debug = computed(() => FINAL_CONFIG.value.debug);

function prepareChart() {
    if (objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiTiremarks',
            type: 'dataset',
            debug: debug.value,
        });
    }

    if (FINAL_CONFIG.value.responsive) {
        const handleResize = throttle(() => {
            const { width, height } = useResponsive({
                chart: tiremarksChart.value,
                title: cfgChart.value.title.text ? chartTitle.value : null,
                source: source.value,
            });

            requestAnimationFrame(() => {
                WIDTH.value = Math.max(0.1, width);
                HEIGHT.value = Math.max(0.1, height - 12);
            });
        });

        if (resizeObserver.value) {
            if (observedEl.value) {
                resizeObserver.value.unobserve(observedEl.value);
            }
            resizeObserver.value.disconnect();
        }

        resizeObserver.value = new ResizeObserver(handleResize);
        observedEl.value = tiremarksChart.value.parentNode;
        resizeObserver.value.observe(observedEl.value);
    }

    useAnimation(FINAL_DATASET.value.percentage || 0);
}

const isVertical = computed(() => {
    return cfgLayout.value.display === 'vertical';
});

const padding = computed(() => {
    const showLabel = cfgChart.value.percentage.show;

    const paddingRef = {
        top: showLabel ? 48 : 12,
        left: showLabel ? 64 : 16,
        right: showLabel ? 64 : 16,
        bottom: showLabel ? 48 : 12,
    };

    if (isVertical.value) {
        return {
            top:
                cfgChart.value.percentage.verticalPosition === 'top'
                    ? paddingRef.top
                    : 3,
            left: 3,
            right: 3,
            bottom:
                cfgChart.value.percentage.verticalPosition === 'bottom'
                    ? paddingRef.bottom
                    : 3,
        };
    } else {
        return {
            top: 0,
            bottom: 0,
            left:
                cfgChart.value.percentage.horizontalPosition === 'left'
                    ? paddingRef.left
                    : 16,
            right:
                cfgChart.value.percentage.horizontalPosition === 'right'
                    ? paddingRef.right
                    : 10,
        };
    }
});

// This should return a total for x and another for y
const totalPadding = computed(() => {
    return Object.values(padding.value).reduce((a, b) => a + b, 0);
});

const WIDTH = ref(cfgChart.value.width);
const HEIGHT = ref(cfgChart.value.height);

const svg = computed(() => {
    return {
        height: HEIGHT.value,
        width: WIDTH.value,
    };
});

const labelSkeleton = computed(() => {
    return {
        horizontal: {
            x:
                tireLabel.value.x +
                (cfgChart.value.percentage.horizontalPosition === 'left'
                    ? 6
                    : 3),
            y: svg.value.height / 2 - tireLabel.value.fontSize / 2,
        },
        vertical: {
            x: svg.value.width / 2 - 20,
            y: tireLabel.value.y - tireLabel.value.fontSize / 2,
        },
    }[cfgLayout.value.display];
});

const tickSize = computed(() => {
    if (isVertical.value) {
        return {
            mark: ((svg.value.height - totalPadding.value) / 100) * 0.5,
            space: ((svg.value.height - totalPadding.value) / 100) * 0.5,
        };
    } else {
        return {
            mark: ((svg.value.width - totalPadding.value) / 100) * 0.5,
            space: ((svg.value.width - totalPadding.value) / 100) * 0.5,
        };
    }
});

const ticks = computed(() => {
    const arr = [];
    const marks = 100;
    for (let i = 0; i < marks; i += 1) {
        const color = cfgLayout.value.ticks.gradient.show
            ? shiftHue(
                  cfgLayout.value.activeColor,
                  (i / marks) *
                      (cfgLayout.value.ticks.gradient.shiftHueIntensity / 100),
              )
            : cfgLayout.value.activeColor;
        if (isVertical.value) {
            const verticalCrescendo = cfgLayout.value.crescendo
                ? ((marks - i) *
                      (svg.value.width -
                          padding.value.left -
                          padding.value.right)) /
                  marks /
                  3
                : 0;
            const v_x1 = padding.value.left + 4 + verticalCrescendo;
            const v_x2 =
                svg.value.width - padding.value.right - 4 - verticalCrescendo;
            const v_y1 =
                svg.value.height -
                padding.value.bottom -
                i * tickSize.value.mark -
                i * tickSize.value.space -
                tickSize.value.mark;
            const v_y2 =
                svg.value.height -
                padding.value.bottom -
                i * tickSize.value.mark -
                i * tickSize.value.space -
                tickSize.value.mark;
            const v_space_x = (v_x2 - v_x1) / cfgLayout.value.curveAngleX;
            const v_space_y = cfgLayout.value.curveAngleY * ((1 + i) / marks);
            arr.push({
                x1: v_x1,
                x2: v_x2,
                y1: v_y1,
                y2: v_y2,
                curve: `M ${v_x1} ${v_y1} C ${v_x1 + v_space_x} ${v_y1 - v_space_y}, ${v_x2 - v_space_x} ${v_y2 - v_space_y}, ${v_x2} ${v_y2}`,
                color,
            });
        } else {
            const horizontalCrescendo = cfgLayout.value.crescendo
                ? ((marks - i) *
                      (svg.value.height -
                          padding.value.top -
                          padding.value.bottom)) /
                  marks /
                  3
                : 0;
            const h_x1 =
                padding.value.left +
                i * tickSize.value.mark +
                i * tickSize.value.space -
                tickSize.value.mark;
            const h_x2 = h_x1;
            const h_y1 = padding.value.top + 4 + horizontalCrescendo;
            const h_y2 =
                svg.value.height -
                padding.value.bottom -
                4 -
                horizontalCrescendo;
            const h_space_x = cfgLayout.value.curveAngleY * ((1 + i) / marks);
            const h_space_y = (h_y2 - h_y1) / cfgLayout.value.curveAngleX;
            arr.push({
                x1: h_x1,
                x2: h_x2,
                y1: h_y1,
                y2: h_y2,
                curve: `M ${h_x1} ${h_y1} C ${h_x1 + h_space_x} ${h_y1 + h_space_y}, ${h_x2 + h_space_x} ${h_y2 - h_space_y}, ${h_x2} ${h_y2}`,
                color,
            });
        }
    }
    return arr;
});

const tireLabel = computed(() => {
    let x, y, textAnchor;
    const fontSizeOffset = cfgChart.value.percentage.fontSize / 3;

    if (isVertical.value) {
        if (cfgChart.value.percentage.verticalPosition === 'top') {
            x = svg.value.width / 2;
            y = padding.value.top / 2;
            textAnchor = 'middle';
        } else if (cfgChart.value.percentage.verticalPosition === 'bottom') {
            x = svg.value.width / 2;
            y = svg.value.height - padding.value.bottom / 2 + fontSizeOffset;
            textAnchor = 'middle';
        }
    } else {
        if (cfgChart.value.percentage.horizontalPosition === 'left') {
            x = 4;
            y = svg.value.height / 2 + fontSizeOffset;
            textAnchor = 'start';
        } else if (cfgChart.value.percentage.horizontalPosition === 'right') {
            x = svg.value.width - padding.value.right + 8;
            y = svg.value.height / 2 + fontSizeOffset;
            textAnchor = 'start';
        }
    }

    return {
        x,
        y,
        textAnchor,
        bold: cfgChart.value.percentage.bold,
        fontSize: cfgChart.value.percentage.fontSize,
        fill: cfgChart.value.percentage.color,
    };
});

const isFullscreen = ref(false);
function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
}

const isAnnotator = ref(false);
function toggleAnnotator() {
    isAnnotator.value = !isAnnotator.value;
}

async function getImage({ scale = 2 } = {}) {
    if (!tiremarksChart.value) return;
    const { width, height } = tiremarksChart.value.getBoundingClientRect();
    const aspectRatio = width / height;
    const { imageUri, base64 } = await img({
        domElement: tiremarksChart.value,
        base64: true,
        img: true,
        scale,
    });
    return {
        imageUri,
        base64,
        title: cfgChart.value.title.text,
        width,
        height,
        aspectRatio,
    };
}

const svgBg = computed(() => cfgChart.value.backgroundColor);
const svgTitle = computed(() => cfgChart.value.title);

const { isCallbackImaging, isCallbackSvg, generateSvg, onGenerateImage } =
    useChartExport({
        svg: svgRef,
        title: svgTitle,
        legend: null,
        legendItems: null,
        backgroundColor: svgBg,
        getSvgCallback: () => FINAL_CONFIG.value.userOptions.callbacks.svg,
        generateImage,
    });

async function copyAlt() {
    emit('copyAlt', {
        config: FINAL_CONFIG.value,
        dataset: FINAL_DATASET.value,
    });
    if (!FINAL_CONFIG.value.userOptions.callbacks.altCopy) {
        console.warn(
            'Vue Data UI - A callback must be set for `altCopy` in userOptions.',
        );
        return;
    }
    await Promise.resolve(
        FINAL_CONFIG.value.userOptions.callbacks.altCopy({
            config: FINAL_CONFIG.value,
            dataset: FINAL_DATASET.value,
        }),
    );
}

const svgTitleId = computed(() => `${uid.value}-title`);
const svgDescId = computed(() => `${uid.value}-desc`);

const percentageText = computed(() => {
    return applyDataLabel(
        cfgChart.value.percentage.formatter,
        activeValue.value,
        dataLabel({
            v: activeValue.value,
            s: '%',
            r: cfgChart.value.percentage.rounding,
        }),
    );
});

const accessibleTitleText = computed(() => {
    return cfgChart.value.title.text || '';
});

const accessibleDescriptionText = computed(() => {
    return loading.value ? 'Loading data' : `Value: ${percentageText.value}`;
});

defineExpose({
    getImage,
    generatePdf,
    generateImage,
    generateSvg,
    toggleAnnotator,
    toggleFullscreen,
    copyAlt,
});
</script>

<template>
    <div
        ref="tiremarksChart"
        :class="`vue-data-ui-component vue-ui-tiremarks ${FINAL_CONFIG.useCssAnimation ? '' : 'vue-ui-dna'}`"
        :style="`font-family:${FINAL_CONFIG.style.fontFamily};width:100%; text-align:center;background:${cfgChart.backgroundColor}`"
        :id="uid"
        @mouseenter="() => setUserOptionsVisibility(true)"
        @mouseleave="() => setUserOptionsVisibility(false)"
    >
        <PenAndPaper
            v-if="cfgUserOptions.buttons.annotator"
            :svgRef="svgRef"
            :backgroundColor="cfgChart.backgroundColor"
            :color="cfgChart.color"
            :active="isAnnotator"
            :isCursorPointer="isCursorPointer"
            :palette="cfgUserOptions.annotatorPalette"
            @close="toggleAnnotator"
        >
            <template #annotator-action-close>
                <slot name="annotator-action-close" />
            </template>
            <template #annotator-action-color="{ color }">
                <slot name="annotator-action-color" v-bind="{ color }" />
            </template>
            <template #annotator-action-draw="{ mode }">
                <slot name="annotator-action-draw" v-bind="{ mode }" />
            </template>
            <template #annotator-action-undo="{ disabled }">
                <slot name="annotator-action-undo" v-bind="{ disabled }" />
            </template>
            <template #annotator-action-redo="{ disabled }">
                <slot name="annotator-action-redo" v-bind="{ disabled }" />
            </template>
            <template #annotator-action-delete="{ disabled }">
                <slot name="annotator-action-delete" v-bind="{ disabled }" />
            </template>
        </PenAndPaper>

        <div
            ref="noTitle"
            v-if="hasOptionsNoTitle"
            class="vue-data-ui-no-title-space"
            :style="`height:36px; width: 100%;background:transparent`"
        />

        <div
            ref="chartTitle"
            v-if="cfgChart.title.text"
            :style="`width:100%;background:transparent;padding-bottom:12px`"
        >
            <Title
                :key="`title_${titleStep}`"
                :config="{
                    title: {
                        cy: 'wheel-title',
                        ...cfgChart.title,
                    },
                    subtitle: {
                        cy: 'wheel-subtitle',
                        ...cfgChart.title.subtitle,
                    },
                }"
            />
        </div>

        <UserOptions
            ref="details"
            :key="`user_options_${step}`"
            v-if="
                cfgUserOptions.show &&
                isDataset &&
                (keepUserOptionState ? true : userOptionsVisible)
            "
            :backgroundColor="cfgChart.backgroundColor"
            :color="cfgChart.color"
            :isPrinting="isPrinting"
            :isImaging="isImaging"
            :uid="uid"
            :hasPdf="cfgUserOptions.buttons.pdf"
            :hasImg="cfgUserOptions.buttons.img"
            :hasSvg="cfgUserOptions.buttons.svg"
            :hasFullscreen="cfgUserOptions.buttons.fullscreen"
            :hasAltCopy="cfgUserOptions.buttons.altCopy"
            :hasXls="false"
            :isFullscreen="isFullscreen"
            :titles="{ ...cfgUserOptions.buttonTitles }"
            :chartElement="tiremarksChart"
            :position="cfgUserOptions.position"
            :hasAnnotator="cfgUserOptions.buttons.annotator"
            :isAnnotation="isAnnotator"
            :callbacks="cfgUserOptions.callbacks"
            :printScale="cfgUserOptions.print.scale"
            :isCursorPointer="isCursorPointer"
            @toggleFullscreen="toggleFullscreen"
            @generatePdf="generatePdf"
            @generateImage="onGenerateImage"
            @generateSvg="generateSvg"
            @toggleAnnotator="toggleAnnotator"
            @copyAlt="copyAlt"
            :style="{
                visibility: keepUserOptionState
                    ? userOptionsVisible
                        ? 'visible'
                        : 'hidden'
                    : 'visible',
            }"
        >
            <template #menuIcon="{ isOpen, color }" v-if="$slots.menuIcon">
                <slot name="menuIcon" v-bind="{ isOpen, color }" />
            </template>
            <template #optionPdf v-if="$slots.optionPdf">
                <slot name="optionPdf" />
            </template>
            <template #optionImg v-if="$slots.optionImg">
                <slot name="optionImg" />
            </template>
            <template #optionSvg v-if="$slots.optionSvg">
                <slot name="optionSvg" />
            </template>
            <template
                v-if="$slots.optionFullscreen"
                template
                #optionFullscreen="{ toggleFullscreen, isFullscreen }"
            >
                <slot
                    name="optionFullscreen"
                    v-bind="{ toggleFullscreen, isFullscreen }"
                />
            </template>
            <template
                v-if="$slots.optionAnnotator"
                #optionAnnotator="{ toggleAnnotator, isAnnotator }"
            >
                <slot
                    name="optionAnnotator"
                    v-bind="{ toggleAnnotator, isAnnotator }"
                />
            </template>
            <template
                v-if="$slots.optionAltCopy"
                #optionAltCopy="{ altCopy: c }"
            >
                <slot name="optionAltCopy" v-bind="{ altCopy: c }" />
            </template>
            <template #custom-menu-before v-if="$slots['custom-menu-before']">
                <slot name="custom-menu-before" />
            </template>
            <template #custom-menu-after v-if="$slots['custom-menu-after']">
                <slot name="custom-menu-after" />
            </template>
        </UserOptions>

        <svg
            ref="svgRef"
            :xmlns="XMLNS"
            :class="{
                'vue-data-ui-fullscreen--on': isFullscreen,
                'vue-data-ui-fulscreen--off': !isFullscreen,
            }"
            :viewBox="`0 0 ${WIDTH} ${HEIGHT}`"
            :style="`max-width:100%; overflow: visible; background:transparent;color:${cfgChart.color}`"
            role="img"
            :aria-labelledby="svgTitleId"
            :aria-describedby="svgDescId"
        >
            <title :id="svgTitleId">{{ accessibleTitleText }}</title>
            <desc :id="svgDescId">{{ accessibleDescriptionText }}</desc>

            <PackageVersion />

            <!-- BACKGROUND SLOT -->
            <foreignObject
                v-if="$slots['chart-background']"
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

            <g v-if="cfgLayout.curved">
                <path
                    v-for="(tick, i) in ticks"
                    :d="tick.curve"
                    :stroke-width="tickSize.mark"
                    :stroke="
                        activeValue >= i ? tick.color : cfgLayout.inactiveColor
                    "
                    stroke-linecap="round"
                    fill="none"
                    :class="{
                        'vue-ui-tick-animated':
                            cfgChart.animation.use &&
                            !prefersReducedMotion &&
                            i <= activeValue,
                    }"
                />
            </g>
            <g v-else>
                <line
                    data-cy="tick"
                    v-for="(tick, i) in ticks"
                    :x1="tick.x1"
                    :y1="tick.y1"
                    :x2="tick.x2"
                    :y2="tick.y2"
                    :stroke-width="tickSize.mark"
                    :stroke="
                        activeValue >= i ? tick.color : cfgLayout.inactiveColor
                    "
                    stroke-linecap="round"
                />
            </g>
            <g
                v-if="cfgChart.percentage.show"
                role="status"
                aria-live="polite"
                :aria-label="loading ? '...' : `${percentageText}`"
            >
                <rect
                    v-if="loading"
                    :x="labelSkeleton.x"
                    :y="labelSkeleton.y"
                    :width="40"
                    :height="tireLabel.fontSize"
                    fill="#6A6A6A80"
                    :rx="3"
                />
                <text
                    v-else
                    data-cy="data-label"
                    aria-hidden="true"
                    :x="tireLabel.x"
                    :y="tireLabel.y"
                    :font-size="tireLabel.fontSize"
                    :fill="
                        cfgLayout.ticks.gradient.show &&
                        cfgChart.percentage.useGradientColor
                            ? shiftHue(
                                  cfgLayout.activeColor,
                                  (activeValue / 100) *
                                      (cfgLayout.ticks.gradient
                                          .shiftHueIntensity /
                                          100),
                              )
                            : cfgChart.percentage.color
                    "
                    :font-weight="tireLabel.bold ? 'bold' : 'normal'"
                    :text-anchor="tireLabel.textAnchor"
                >
                    {{ percentageText }}
                </text>
            </g>
            <slot
                name="svg"
                :svg="{
                    ...svg,
                    isPrintingImg: isPrinting || isImaging || isCallbackImaging,
                    isPrintingSvg: isCallbackSvg,
                }"
            />
        </svg>

        <div v-if="$slots.watermark" class="vue-data-ui-watermark">
            <slot
                name="watermark"
                v-bind="{
                    isPrinting:
                        isPrinting ||
                        isImaging ||
                        isCallbackImaging ||
                        isCallbackSvg,
                }"
            />
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

<style scoped>
@import '../vue-data-ui.css';
.vue-ui-tiremarks * {
    transition: unset;
}
.vue-ui-tiremarks {
    position: relative;
}
.vue-ui-tick-animated {
    animation: animate-tick 0.3s ease-in;
    transform-origin: center;
}

@keyframes animate-tick {
    0% {
        stroke-width: 2;
        transform: scale(1, 1.1);
    }
    100% {
        stroke-width: initial;
        transform: scale(1, 1);
    }
}
</style>
