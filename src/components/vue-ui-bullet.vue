<script setup>
import {
    computed,
    defineAsyncComponent,
    nextTick,
    onBeforeUnmount,
    onMounted,
    ref,
    toRefs,
    watch,
} from 'vue';
import {
    XMLNS,
    createUid,
    error,
    getMissingDatasetAttributes,
    objectIsEmpty,
    treeShake,
    convertColorToHex,
    lightenHexColor,
    calculateNiceScale,
    applyDataLabel,
    dataLabel,
} from '../lib';
import { throttle } from '../canvas-lib';
import { COMMON_RULES, useHints } from '../useHints';
import { useConfig } from '../useConfig';
import { usePrinter } from '../usePrinter';
import { useLoading } from '../useLoading';
import { useNestedProp } from '../useNestedProp';
import { useResponsive } from '../useResponsive';
import { useThemeCheck } from '../useThemeCheck';
import { useChartExport } from '../useChartExport';
import { useUserOptionState } from '../useUserOptionState';
import { useChartAccessibility } from '../useChartAccessibility';
import themes from '../themes/vue_ui_bullet.json';
import Legend from '../atoms/Legend.vue'; // Must be ready in responsive mode
import Title from '../atoms/Title.vue'; // Must be ready in responsive mode
import img from '../img';
import BaseScanner from '../atoms/BaseScanner.vue';

const PackageVersion = defineAsyncComponent(
    () => import('../atoms/PackageVersion.vue'),
);
const PenAndPaper = defineAsyncComponent(
    () => import('../atoms/PenAndPaper.vue'),
);
const UserOptions = defineAsyncComponent(
    () => import('../atoms/UserOptions.vue'),
);

const { vue_ui_bullet: DEFAULT_CONFIG } = useConfig();
const { isThemeValid, warnInvalidTheme } = useThemeCheck();

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

const bulletChart = ref(null);
const chartTitle = ref(null);
const titleStep = ref(0);
const chartLegend = ref(null);
const source = ref(null);
const step = ref(0);
const resizeObserver = ref(null);
const observedEl = ref(null);
const readyTeleport = ref(false);

const isDataset = computed({
    get: () => {
        return FINAL_DATASET.value.hasOwnProperty('value');
    },
    set: (bool) => {
        return bool;
    },
});

const FINAL_CONFIG = ref(prepareConfig());

const debug = computed(() => FINAL_CONFIG.value.debug);
const cfgTarget = computed(() => FINAL_CONFIG.value.style.chart.target);
const cfgSegments = computed(() => FINAL_CONFIG.value.style.chart.segments);
const cfgChart = computed(() => FINAL_CONFIG.value.style.chart);
const cfgUserOptions = computed(() => FINAL_CONFIG.value.userOptions);

const hasSegments = computed(() => {
    if (!FINAL_DATASET.value.segments) {
        if (debug.value) {
            console.warn(`VueUiBullet: dataset segments is empty. Provide segments with this datastructure:\n
    segments: [
        {
            name: string;
            from: number;
            to: number;
            color?: string;
        },
        {...}
    ]
            `);
        }
        isDataset.value = false;
        return false;
    }
    if (!Array.isArray(FINAL_DATASET.value.segments)) {
        if (debug.value) {
            console.warn(`VueUiBullet: dataset segments must be an array of objects with this datastructure:\n
    segments: [
        {
            name: string;
            from: number;
            to: number;
            color?: string;
        },
        {...}
    ] 
            `);
        }
        isDataset.value = false;
        return false;
    }
    if (!FINAL_DATASET.value.segments.length) {
        if (debug.value) {
            console.warn(`VueUiBullet: dataset segments is empty. Provide segments with this datastructure:\n
    segments: [
        {
            name: string;
            from: number;
            to: number;
            color?: string;
        },
        {...}
    ]
            `);
        }
        isDataset.value = false;
        return false;
    }
    return true;
});

const padding = computed(() => {
    const { top, right, bottom, left } = cfgChart.value.padding;
    return {
        top,
        right,
        bottom,
        left,
    };
});

function prepareChart() {
    if (objectIsEmpty(FINAL_DATASET.value)) {
        error({
            componentName: 'VueUiBullet',
            type: 'dataset',
            debug: debug.value,
        });
        manualLoading.value = true;
    } else {
        if (hasSegments.value) {
            FINAL_DATASET.value.segments.forEach((segment, i) => {
                getMissingDatasetAttributes({
                    datasetObject: segment,
                    requiredAttributes: ['name', 'from', 'to'],
                }).forEach((attr) => {
                    isDataset.value = false;
                    error({
                        componentName: 'VueUiBullet segment',
                        type: 'datasetSerieAttribute',
                        property: attr,
                        index: i,
                        debug: debug.value,
                    });
                });
            });
        } else {
            isDataset.value = false;
            manualLoading.value = true;
        }
    }

    // v3
    if (!objectIsEmpty(FINAL_DATASET.value)) {
        manualLoading.value = FINAL_CONFIG.value.loading;
    }

    if (FINAL_CONFIG.value.responsive) {
        const handleResize = throttle(() => {
            const { width, height } = useResponsive({
                chart: bulletChart.value,
                title: cfgChart.value.title.text ? chartTitle.value : null,
                legend: cfgChart.value.legend.show ? chartLegend.value : null,
                source: source.value,
                padding: padding.value,
            });

            const legendOffset = cfgChart.value.legend.show ? 24 : 0;
            const offsetY = legendOffset || 12;

            requestAnimationFrame(() => {
                defaultSizes.value.width = width;
                defaultSizes.value.height = height - offsetY;
            });
        });

        if (resizeObserver.value) {
            if (observedEl.value) {
                resizeObserver.value.unobserve(observedEl.value);
            }
            resizeObserver.value.disconnect();
        }

        resizeObserver.value = new ResizeObserver(handleResize);
        observedEl.value = bulletChart.value.parentNode;
        resizeObserver.value.observe(observedEl.value);
    }

    if (cfgChart.value.animation.show && !loading.value) {
        useAnimation(FINAL_DATASET.value.value || 0);
    }
}

onMounted(() => {
    readyTeleport.value = true;
    prepareChart();
});

const uid = ref(createUid());

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

useHints({
    config: () => FINAL_CONFIG.value,
    dataset: () => props.dataset,
    component: 'VueUiBullet',
    rules: [
        {
            test: (ds) => ds?.segments && ds?.segments.length > 8,
            message: [
                '👀 The number of target segments is > 8, which can make the chart hard to read and a large legend. Consider:',
                '',
                '▶️ Using broader segments.',
            ],
        },
    ],
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
                    segments: {
                        dataLabels: { show: false },
                        ticks: {
                            stroke: '#8A8A8A',
                        },
                    },
                    valueBar: {
                        label: { show: false },
                    },
                },
            },
        },
        userConfig: FINAL_CONFIG.value.skeletonConfig ?? {},
    });
});

const { loading, FINAL_DATASET, manualLoading } = useLoading({
    ...toRefs(props),
    FINAL_CONFIG,
    prepareConfig,
    skeletonDataset: props.config?.skeletonDataset ?? {
        value: 100,
        target: 100,
        segments: [
            {
                name: '',
                from: 0,
                to: 33,
                color: '#AAAAAA',
            },
            {
                name: '',
                from: 33,
                to: 66,
                color: '#BABABA',
            },
            {
                name: '',
                from: 66,
                to: 100,
                color: '#CACACA',
            },
        ],
    },
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

const defaultSizes = ref({
    width: cfgChart.value.width,
    height: cfgChart.value.height,
});

const WIDTH = computed(() => defaultSizes.value.width);
const HEIGHT = computed(() => defaultSizes.value.height);

watch(
    () => props.config,
    (_newCfg) => {
        if (!loading.value) {
            FINAL_CONFIG.value = prepareConfig();
        }
        userOptionsVisible.value =
            !FINAL_CONFIG.value.userOptions.showOnChartHover;
        defaultSizes.value.width = cfgChart.value.width;
        defaultSizes.value.height = cfgChart.value.height;
        prepareChart();
        titleStep.value += 1;
    },
    { deep: true },
);

const svg = computed(() => {
    const height = HEIGHT.value;
    const width = WIDTH.value;
    const left = cfgChart.value.padding.left;
    const right = width - cfgChart.value.padding.right;
    const top = cfgChart.value.padding.top;
    const bottom = height - cfgChart.value.padding.bottom;
    return {
        height: Math.max(0.001, height),
        width: Math.max(0.001, width),
        left,
        right,
        top,
        bottom,
        chartWidth: Math.max(0.001, right - left),
        chartHeight: Math.max(0.001, bottom - top),
    };
});

const segmentColors = computed(() => {
    if (!hasSegments.value) return [];
    const arr = [];
    for (let i = 0; i < FINAL_DATASET.value.segments.length; i += 1) {
        arr.push(
            lightenHexColor(
                cfgSegments.value.baseColor,
                i / FINAL_DATASET.value.segments.length,
            ),
        );
    }
    return arr;
});

const minMax = computed(() => {
    if (!hasSegments.value) return { min: 0, max: 1 };
    return {
        min: Math.min(...FINAL_DATASET.value.segments.map((s) => s.from)),
        max: Math.max(...FINAL_DATASET.value.segments.map((s) => s.to)),
    };
});

const activeValue = ref(getActiveValue());

watch(
    () => FINAL_DATASET.value,
    (v) => {
        if (v.hasOwnProperty('value')) {
            manualLoading.value = false;
        }
        if (cfgChart.value.animation.show && !loading.value) {
            useAnimation(v.value || 0);
        } else {
            activeValue.value = v.value || 0;
        }
    },
    { deep: true },
);

function getActiveValue() {
    if (cfgChart.value.animation.show && !loading.value) {
        return minMax.value.min;
    } else {
        return FINAL_DATASET.value.value || 0;
    }
}

const raf = ref(null);

function useAnimation(targetValue) {
    const chunk =
        Math.abs(targetValue - activeValue.value) /
        cfgChart.value.animation.animationFrames;
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
            raf.value = requestAnimationFrame(animate);
        }
    }
    animate();
}

onBeforeUnmount(() => {
    cancelAnimationFrame(raf.value);
});

const segments = computed(() => {
    if (!hasSegments.value) {
        return [];
    }
    const scale = calculateNiceScale(
        minMax.value.min,
        minMax.value.max,
        cfgSegments.value.ticks.divisions,
    );
    const absMin = scale.min >= 0 ? 0 : Math.abs(scale.min);

    const target = {
        x:
            svg.value.left +
            ((FINAL_DATASET.value.target + absMin) / (scale.max + absMin)) *
                svg.value.chartWidth -
            cfgTarget.value.width / 2,
    };
    const value = {
        width:
            ((activeValue.value + absMin) / (scale.max + absMin)) *
            svg.value.chartWidth,
    };
    const ticks = scale.ticks.map((t) => {
        return {
            value: t,
            y:
                svg.value.bottom +
                cfgSegments.value.dataLabels.fontSize +
                3 +
                cfgSegments.value.dataLabels.offsetY,
            x:
                svg.value.left +
                ((t + absMin) / (scale.max + absMin)) * svg.value.chartWidth,
        };
    });
    return {
        scale,
        target,
        value,
        ticks,
        chunks: FINAL_DATASET.value.segments.map((segment, i) => {
            return {
                ...segment,
                color: segment.color
                    ? convertColorToHex(segment.color)
                    : segmentColors.value[i],
                x:
                    svg.value.left +
                    svg.value.chartWidth *
                        ((segment.from + absMin) / (scale.max + absMin)),
                y: svg.value.top,
                height: svg.value.chartHeight,
                width:
                    svg.value.chartWidth *
                    (Math.abs(segment.to - segment.from) /
                        (scale.max + absMin)),
            };
        }),
    };
});

const legendSet = computed(() => {
    if (
        !segments.value ||
        !segments.value.chunks ||
        !segments.value.chunks.length
    ) {
        return [];
    }
    return segments.value.chunks.map((segment) => {
        const formattedFrom = applyDataLabel(
            cfgSegments.value.dataLabels.formatter,
            segment.from,
            dataLabel({
                p: cfgSegments.value.dataLabels.prefix,
                v: segment.from,
                s: cfgSegments.value.dataLabels.suffix,
                r: cfgSegments.value.dataLabels.rounding,
            }),
        );
        const formattedTo = applyDataLabel(
            cfgSegments.value.dataLabels.formatter,
            segment.to,
            dataLabel({
                p: cfgSegments.value.dataLabels.prefix,
                v: segment.to,
                s: cfgSegments.value.dataLabels.suffix,
                r: cfgSegments.value.dataLabels.rounding,
            }),
        );

        const value = `${formattedFrom} — ${formattedTo}`;

        return {
            ...segment,
            shape: 'square',
            value,
            display: `${segment.name}: ${value}`,
        };
    });
});

const legendConfig = computed(() => {
    return {
        cy: 'bullet-div-legend',
        backgroundColor: 'transparent',
        color: cfgChart.value.legend.color,
        fontSize: cfgChart.value.legend.fontSize,
        paddingBottom: 6,
        fontWeight: cfgChart.value.legend.bold ? 'bold' : '',
    };
});

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `bullet_${uid.value}`,
    fileName: cfgChart.value.title.text || 'vue-ui-bullet',
    options: FINAL_CONFIG.value.userOptions.print,
});

const hasOptionsNoTitle = computed(() => {
    return FINAL_CONFIG.value.userOptions.show && !cfgChart.value.title.text;
});

const isFullscreen = ref(false);
function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
}

function getData() {
    return segments.value;
}

const isAnnotator = ref(false);
function toggleAnnotator() {
    isAnnotator.value = !isAnnotator.value;
}

async function getImage({ scale = 2 } = {}) {
    if (!bulletChart.value) return;
    const { width, height } = bulletChart.value.getBoundingClientRect();
    const aspectRatio = width / height;
    const { imageUri, base64 } = await img({
        domElement: bulletChart.value,
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

const svgLegendItems = computed(() => {
    return legendSet.value.map((l) => ({
        ...l,
        name: l.display,
    }));
});

const svgBg = computed(() => cfgChart.value.backgroundColor);
const svgLegend = computed(() => cfgChart.value.legend);
const svgTitle = computed(() => cfgChart.value.title);

const { isCallbackImaging, isCallbackSvg, generateSvg, onGenerateImage } =
    useChartExport({
        svg: svgRef,
        title: svgTitle,
        legend: svgLegend,
        legendItems: svgLegendItems,
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

defineExpose({
    getData,
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
        ref="bulletChart"
        :class="`vue-data-ui-component vue-ui-bullet ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''}`"
        :style="`font-family:${FINAL_CONFIG.style.fontFamily};width:100%;background:${cfgChart.backgroundColor};${FINAL_CONFIG.responsive ? 'height:100%' : ''}`"
        :id="`bullet_${uid}`"
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
            :style="`width:100%;background:transparent;`"
        >
            <Title
                lineHeight="1.3rem"
                :key="`title_${titleStep}`"
                :config="{
                    title: {
                        cy: 'bullet-div-title',
                        ...cfgChart.title,
                    },
                    subtitle: {
                        cy: 'bullet-div-subtitle',
                        ...cfgChart.title.subtitle,
                    },
                }"
            />
        </div>

        <div :id="`legend-top-${uid}`" />

        <UserOptions
            ref="details"
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
            :hasTooltip="false"
            :hasPdf="cfgUserOptions.buttons.pdf"
            :hasImg="cfgUserOptions.buttons.img"
            :hasSvg="cfgUserOptions.buttons.svg"
            :hasXls="false"
            :hasTable="false"
            :hasLabel="false"
            :hasFullscreen="cfgUserOptions.buttons.fullscreen"
            :hasAltCopy="cfgUserOptions.buttons.altCopy"
            :isFullscreen="isFullscreen"
            :chartElement="bulletChart"
            :position="cfgUserOptions.position"
            :titles="{ ...cfgUserOptions.buttonTitles }"
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
                'vue-ui-bullet-svg': true,
            }"
            :viewBox="`0 0 ${svg.width} ${svg.height}`"
            :style="`width: 100%; overflow: visible; background:transparent;color:${cfgChart.color}`"
            :aria-labelledby="`bullet-svg-title-${uid}`"
            :aria-describedby="`bullet-svg-desc-${uid}`"
        >
            <PackageVersion />

            <title :id="`bullet-svg-title-${uid}`">
                {{ cfgChart.title.text || 'Bullet chart' }}
            </title>

            <desc :id="`bullet-svg-desc-${uid}`">
                Value: {{ activeValue }}, Target: {{ segments.target?.value }}
            </desc>

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

            <g v-if="hasSegments">
                <!-- SEGMENTS -->
                <rect
                    data-cy="vue-ui-bullet-segment"
                    v-for="segment in segments.chunks"
                    :x="segment.x"
                    :y="segment.y"
                    :height="segment.height"
                    :width="segment.width"
                    :fill="segment.color"
                    :stroke-width="1"
                    :stroke="cfgChart.backgroundColor"
                    :style="{
                        transition:
                            'x 0.3s ease-in-out, width 0.3s ease-in-out',
                    }"
                />
                <!-- TARGET BELOW-->
                <rect
                    data-cy="vue-ui-bullet-target-below"
                    v-if="!cfgTarget.onTop && cfgTarget.show"
                    :x="segments.target.x"
                    :y="
                        svg.top +
                        (svg.chartHeight -
                            svg.chartHeight * cfgTarget.heightRatio) /
                            2
                    "
                    :height="svg.chartHeight * cfgTarget.heightRatio"
                    :width="cfgTarget.width"
                    :rx="cfgTarget.rounded ? cfgTarget.width / 2 : 0"
                    :fill="cfgTarget.color"
                    :stroke="cfgTarget.stroke"
                    :stroke-width="cfgTarget.strokeWidth"
                />
                <!-- VALUE BAR -->
                <rect
                    data-cy="vue-ui-bullet-value-bar"
                    :x="svg.left"
                    :y="
                        svg.top +
                        (svg.chartHeight -
                            svg.chartHeight * cfgChart.valueBar.heightRatio) /
                            2
                    "
                    :height="svg.chartHeight * cfgChart.valueBar.heightRatio"
                    :width="segments.value.width"
                    :fill="cfgChart.valueBar.color"
                    :stroke="cfgChart.valueBar.stroke"
                    :stroke-width="cfgChart.valueBar.strokeWidth"
                />
                <!-- VALUE LABEL -->
                <text
                    data-cy="vue-ui-bullet-value-label"
                    v-if="cfgChart.valueBar.label.show"
                    :x="svg.left + segments.value.width"
                    :y="svg.top - 6 + cfgChart.valueBar.label.offsetY"
                    :font-size="cfgChart.valueBar.label.fontSize"
                    :font-weight="
                        cfgChart.valueBar.label.bold ? 'bold' : 'normal'
                    "
                    :fill="cfgChart.valueBar.label.color"
                    text-anchor="middle"
                >
                    {{
                        applyDataLabel(
                            cfgSegments.dataLabels.formatter,
                            activeValue,
                            dataLabel({
                                p: cfgSegments.dataLabels.prefix,
                                v: activeValue,
                                s: cfgSegments.dataLabels.suffix,
                                r: cfgSegments.dataLabels.rounding,
                            }),
                        )
                    }}
                </text>
                <!-- TARGET ON TOP-->
                <rect
                    data-cy="vue-ui-bullet-target-top"
                    v-if="cfgTarget.onTop && cfgTarget.show"
                    :x="segments.target.x"
                    :y="
                        svg.top +
                        (svg.chartHeight -
                            svg.chartHeight * cfgTarget.heightRatio) /
                            2
                    "
                    :height="svg.chartHeight * cfgTarget.heightRatio"
                    :width="cfgTarget.width"
                    :rx="cfgTarget.rounded ? cfgTarget.width / 2 : 0"
                    :fill="cfgTarget.color"
                    :stroke="cfgTarget.stroke"
                    :stroke-width="cfgTarget.strokeWidth"
                    :style="{ transition: 'x 0.3s ease-in-out' }"
                />
                <!-- TICK LABELS -->
                <g v-if="cfgSegments.dataLabels.show">
                    <text
                        data-cy="vue-ui-bullet-tick-label"
                        v-for="tick in segments.ticks"
                        :x="tick.x"
                        :y="tick.y"
                        text-anchor="middle"
                        :fill="cfgSegments.dataLabels.color"
                        :font-size="cfgSegments.dataLabels.fontSize + 'px'"
                        :font-weight="
                            cfgSegments.dataLabels.bold ? 'bold' : 'normal'
                        "
                    >
                        {{
                            applyDataLabel(
                                cfgSegments.dataLabels.formatter,
                                tick.value,
                                dataLabel({
                                    p: cfgSegments.dataLabels.prefix,
                                    v: tick.value,
                                    s: cfgSegments.dataLabels.suffix,
                                    r: cfgSegments.dataLabels.rounding,
                                }),
                            )
                        }}
                    </text>
                </g>
                <!-- TICK MARKERS -->
                <g v-if="cfgSegments.dataLabels.show && cfgSegments.ticks.show">
                    <line
                        data-cy="vue-ui-bullet-tick-marker"
                        v-for="marker in segments.ticks"
                        :x1="marker.x"
                        :x2="marker.x"
                        :y1="svg.bottom"
                        :y2="svg.bottom + 3"
                        :stroke="cfgSegments.ticks.stroke"
                        :stroke-width="1"
                        stroke-linecap="round"
                    />
                </g>
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

        <div :id="`legend-bottom-${uid}`" />

        <!-- LEGEND -->
        <Teleport
            v-if="readyTeleport && (cfgChart.legend.show || $slots.legend)"
            :to="
                cfgChart.legend.position === 'top'
                    ? `#legend-top-${uid}`
                    : `#legend-bottom-${uid}`
            "
        >
            <div ref="chartLegend">
                <slot name="legend" v-bind:legend="legendSet">
                    <Legend
                        v-if="cfgChart.legend.show"
                        :clickable="false"
                        :legendSet="legendSet"
                        :config="legendConfig"
                    >
                        <template #item="{ legend }">
                            <div
                                class="vue-ui-bullet-legend-item"
                                dir="auto"
                                v-if="!loading"
                            >
                                <span style="margin-right: 2px"
                                    >{{ legend.name }}:</span
                                >
                                <span>{{ legend.value }}</span>
                            </div>
                        </template>
                    </Legend>
                </slot>
            </div>
        </Teleport>

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
.vue-ui-bullet * {
    transition: unset;
}
.vue-ui-bullet {
    position: relative;
}
</style>
