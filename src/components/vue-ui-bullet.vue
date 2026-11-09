<script setup>
import {
    getUserOptionsProps,
    getUserOptionSlots,
    getUserOptionSlotProps,
} from '../userOptionsSlots';
import { getAnnotatorProps } from '../annotatorConfig';
import {
    annotationSlotNames,
    getAnnotationSlotProps,
} from '../annotationSlots';

import { createChartImageGetter } from '../chartImage';
import { resolveChartConfig } from '../resolveChartConfig';
import {
    computed,
    defineAsyncComponent,
    onBeforeUnmount,
    onMounted,
    ref,
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
import { useHints } from '../useHints';
import { useConfig } from '../useConfig';
import { usePrinter } from '../usePrinter';
import { usePrefersReducedMotion } from '../usePrefersMotion';

import { useResponsive } from '../useResponsive';
import { useChartExport } from '../useChartExport';
import { useUserOptionState } from '../useUserOptionState';
import { useChartAccessibility } from '../useChartAccessibility';
import themes from '../themes/vue_ui_bullet.json';
import Legend from '../atoms/Legend.vue'; // Must be ready in responsive mode
import Title from '../atoms/Title.vue'; // Must be ready in responsive mode
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
const chartLegend = ref(null);
const source = ref(null);
const readyTeleport = ref(false);

const prefersReducedMotion = usePrefersReducedMotion();
const resolvedConfig = computed(prepareConfig);
const isDataset = computed(() => {
    const ds = props.dataset;
    return (
        Number.isFinite(ds?.value) &&
        Array.isArray(ds?.segments) &&
        ds.segments.length > 0 &&
        ds.segments.every(
            (segment) =>
                segment != null &&
                typeof segment === 'object' &&
                'name' in segment &&
                Number.isFinite(segment.from) &&
                Number.isFinite(segment.to),
        )
    );
});
const loading = computed(
    () => !!resolvedConfig.value.loading || !isDataset.value,
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
        userConfig: resolvedConfig.value.skeletonConfig ?? {},
    });
});

const FINAL_CONFIG = computed(() =>
    loading.value
        ? treeShake({
              defaultConfig: resolvedConfig.value,
              userConfig: skeletonConfig.value,
          })
        : resolvedConfig.value,
);

const debug = computed(() => resolvedConfig.value.debug);
const cfgTarget = computed(() => FINAL_CONFIG.value.style.chart.target);
const cfgSegments = computed(() => FINAL_CONFIG.value.style.chart.segments);
const cfgChart = computed(() => FINAL_CONFIG.value.style.chart);
const cfgUserOptions = computed(() => FINAL_CONFIG.value.userOptions);

const hasSegments = computed(
    () =>
        Array.isArray(FINAL_DATASET.value?.segments) &&
        FINAL_DATASET.value.segments.length > 0,
);
const padding = computed(() => cfgChart.value.padding);

watch(
    [() => props.dataset, debug],
    ([dataset, enabled]) => {
        if (!enabled) return;
        if (objectIsEmpty(dataset)) {
            error({ componentName: 'VueUiBullet', type: 'dataset' });
            return;
        }
        const segments = dataset.segments;
        if (!Array.isArray(segments) || !segments.length) {
            const reason =
                !segments || (Array.isArray(segments) && !segments.length)
                    ? 'is empty'
                    : 'must be an array of objects';
            console.warn(`VueUiBullet: dataset segments ${reason}. Provide segments with this datastructure:\n
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
            return;
        }
        segments.forEach((segment, index) => {
            const datasetObject =
                segment && typeof segment === 'object' ? segment : {};
            const missing = getMissingDatasetAttributes({
                datasetObject,
                requiredAttributes: ['name', 'from', 'to'],
            });
            missing.forEach((property) =>
                error({
                    componentName: 'VueUiBullet segment',
                    type: 'datasetSerieAttribute',
                    property,
                    index,
                }),
            );
            for (const property of ['from', 'to']) {
                if (
                    !missing.includes(property) &&
                    !Number.isFinite(datasetObject[property])
                ) {
                    console.warn(
                        `VueUiBullet segment at index ${index}: ${property} must be a finite number.`,
                    );
                }
            }
        });
        if (!Number.isFinite(dataset.value)) {
            console.warn('VueUiBullet: dataset value must be a finite number.');
        }
    },
    { immediate: true, deep: true },
);

onMounted(() => {
    readyTeleport.value = true;
    updateSizing();
});

const uid = ref(createUid());

function prepareConfig() {
    return resolveChartConfig(props.config, DEFAULT_CONFIG, themes);
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

const defaultSkeletonDataset = {
    value: 100,
    target: 100,
    segments: [
        { name: '', from: 0, to: 33, color: '#AAAAAA' },
        { name: '', from: 33, to: 66, color: '#BABABA' },
        { name: '', from: 66, to: 100, color: '#CACACA' },
    ],
};
const FINAL_DATASET = computed(() =>
    loading.value
        ? (props.config?.skeletonDataset ?? defaultSkeletonDataset)
        : props.dataset,
);

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

let resizeObserver = null;
let resizeFrame = null;
let disposed = false;

function resizeChart() {
    resizeFrame = null;
    if (
        disposed ||
        !FINAL_CONFIG.value.responsive ||
        !bulletChart.value?.parentNode
    )
        return;
    const { width, height } = useResponsive({
        chart: bulletChart.value,
        title: cfgChart.value.title.text ? chartTitle.value : null,
        legend: cfgChart.value.legend.show ? chartLegend.value : null,
        source: source.value,
        padding: padding.value,
    });
    defaultSizes.value = {
        width,
        height: height - (cfgChart.value.legend.show ? 24 : 12),
    };
}

function scheduleResize() {
    if (!disposed && FINAL_CONFIG.value.responsive && resizeFrame === null) {
        resizeFrame = requestAnimationFrame(resizeChart);
    }
}

function updateSizing() {
    resizeObserver?.disconnect();
    resizeObserver = null;
    if (resizeFrame !== null) cancelAnimationFrame(resizeFrame);
    resizeFrame = null;
    if (disposed) return;
    if (FINAL_CONFIG.value.responsive && bulletChart.value?.parentNode) {
        resizeObserver = new ResizeObserver(scheduleResize);
        resizeObserver.observe(bulletChart.value.parentNode);
        scheduleResize();
    } else {
        defaultSizes.value = {
            width: cfgChart.value.width,
            height: cfgChart.value.height,
        };
    }
}

watch(() => FINAL_CONFIG.value.responsive, updateSizing, { flush: 'post' });
watch(
    cfgChart,
    () => {
        if (FINAL_CONFIG.value.responsive) scheduleResize();
        else
            defaultSizes.value = {
                width: cfgChart.value.width,
                height: cfgChart.value.height,
            };
    },
    { deep: true, flush: 'post' },
);
watch(
    () => props.config,
    () => {
        userOptionsVisible.value = !cfgUserOptions.value.showOnChartHover;
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

const scale = computed(() => {
    let { min, max } = minMax.value;
    if (
        !Number.isFinite(min) ||
        !Number.isFinite(max) ||
        !Number.isFinite(max - min) ||
        min > max
    ) {
        min = 0;
        max = 1;
    } else if (min === max) {
        min = Math.min(0, min);
        max = Math.max(0, max) || 1;
    }
    const divisions = Number(cfgSegments.value.ticks.divisions);
    return calculateNiceScale(
        min,
        max,
        Number.isFinite(divisions)
            ? Math.max(2, Math.min(1000, Math.floor(divisions)))
            : 10,
    );
});
const scaleOrigin = computed(() => Math.min(0, scale.value.min));
const scaleRange = computed(() => scale.value.max - scaleOrigin.value || 1);
function project(value) {
    return (
        svg.value.left +
        ((value - scaleOrigin.value) / scaleRange.value) * svg.value.chartWidth
    );
}
const activeValue = ref(
    cfgChart.value.animation.show && !loading.value
        ? minMax.value.min
        : FINAL_DATASET.value.value || 0,
);
let animationFrame = null;
let animationSequence = 0;

function stopAnimation() {
    animationSequence += 1;
    if (animationFrame !== null) cancelAnimationFrame(animationFrame);
    animationFrame = null;
}

watch(
    [
        () => FINAL_DATASET.value?.value,
        () => cfgChart.value.animation.show,
        () => cfgChart.value.animation.animationFrames,
        loading,
        prefersReducedMotion,
    ],
    ([value, enabled, frames]) => {
        stopAnimation();
        const target = Number.isFinite(value) ? value : 0;
        if (disposed) return;
        if (
            !enabled ||
            loading.value ||
            prefersReducedMotion.value ||
            !Number.isFinite(frames) ||
            frames <= 0
        ) {
            activeValue.value = target;
            return;
        }
        const start = activeValue.value;
        const count = Math.ceil(frames);
        const sequence = animationSequence;
        let frame = 0;
        function animate() {
            if (disposed || sequence !== animationSequence) return;
            animationFrame = null;
            frame += 1;
            activeValue.value =
                frame >= count
                    ? target
                    : start + ((target - start) * frame) / count;
            if (frame < count && activeValue.value !== target)
                animationFrame = requestAnimationFrame(animate);
        }
        animate();
    },
    { immediate: true },
);

const segmentGeometry = computed(() => ({
    scale: scale.value,
    ticks: scale.value.ticks.map((value) => ({
        value,
        y:
            svg.value.bottom +
            cfgSegments.value.dataLabels.fontSize +
            3 +
            cfgSegments.value.dataLabels.offsetY,
        x: project(value),
    })),
    chunks: (hasSegments.value ? FINAL_DATASET.value.segments : []).map(
        (segment, i) => ({
            ...segment,
            color: segment.color
                ? convertColorToHex(segment.color)
                : segmentColors.value[i],
            x: project(segment.from),
            y: svg.value.top,
            height: svg.value.chartHeight,
            width:
                (svg.value.chartWidth * Math.abs(segment.to - segment.from)) /
                scaleRange.value,
        }),
    ),
}));
const hasTarget = computed(() => Number.isFinite(FINAL_DATASET.value?.target));
const target = computed(() => ({
    x:
        project(hasTarget.value ? FINAL_DATASET.value.target : 0) -
        cfgTarget.value.width / 2,
}));
const segments = computed(() => ({
    ...segmentGeometry.value,
    target: target.value,
    value: { width: Math.max(0, project(activeValue.value) - svg.value.left) },
}));
const targetAttrs = computed(() => ({
    x: target.value.x,
    y:
        svg.value.top +
        (svg.value.chartHeight -
            svg.value.chartHeight * cfgTarget.value.heightRatio) /
            2,
    height: svg.value.chartHeight * cfgTarget.value.heightRatio,
    width: cfgTarget.value.width,
    rx: cfgTarget.value.rounded ? cfgTarget.value.width / 2 : 0,
    fill: cfgTarget.value.color,
    stroke: cfgTarget.value.stroke,
    'stroke-width': cfgTarget.value.strokeWidth,
}));

function formatValue(value) {
    const { formatter, prefix, suffix, rounding } =
        cfgSegments.value.dataLabels;
    return applyDataLabel(
        formatter,
        value,
        dataLabel({ p: prefix, v: value, s: suffix, r: rounding }),
    );
}
const valueLabel = computed(() => formatValue(activeValue.value));
const tickLabels = computed(() =>
    scale.value.ticks.map((value) => formatValue(value)),
);
const segmentLabels = computed(() =>
    (hasSegments.value ? FINAL_DATASET.value.segments : []).map(
        (segment) =>
            `${formatValue(segment.from)} — ${formatValue(segment.to)}`,
    ),
);

onBeforeUnmount(() => {
    disposed = true;
    stopAnimation();
    if (resizeFrame !== null) cancelAnimationFrame(resizeFrame);
    resizeObserver?.disconnect();
});

const legendSet = computed(() =>
    segmentGeometry.value.chunks.map((segment, i) => ({
        ...segment,
        shape: 'square',
        value: segmentLabels.value[i],
        display: `${segment.name}: ${segmentLabels.value[i]}`,
    })),
);

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
}

/**
 * Return the current segments.
 * The result is the internal reactive value, not a defensive copy.
 *
 * @returns The current component data; treat it as read-only.
 */
function getData() {
    return segments.value;
}

const isAnnotator = ref(false);
function toggleAnnotator() {
    isAnnotator.value = !isAnnotator.value;
}

const getImage = createChartImageGetter(
    bulletChart,
    () => cfgChart.value.title.text,
);

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
            v-bind="getAnnotatorProps(cfgUserOptions.annotator)"
            v-if="cfgUserOptions.buttons.annotator"
            :svgRef="svgRef"
            :backgroundColor="cfgChart.backgroundColor"
            :color="cfgChart.color"
            :active="isAnnotator"
            :isCursorPointer="isCursorPointer"
            :palette="cfgUserOptions.annotatorPalette"
            @close="toggleAnnotator"
        >
            <template
                v-for="slotName in annotationSlotNames"
                #[slotName]="slotProps"
            >
                <slot
                    :name="slotName"
                    v-bind="getAnnotationSlotProps(slotName, slotProps)"
                />
            </template>
        </PenAndPaper>

        <div
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
            :hasXls="false"
            :hasTable="false"
            :hasLabel="false"
            :isFullscreen="isFullscreen"
            :chartElement="bulletChart"
            v-bind="
                getUserOptionsProps(
                    cfgUserOptions,
                    'pdf img svg fullscreen altCopy annotator',
                )
            "
            :isAnnotation="isAnnotator"
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
            <template
                v-for="slotName in getUserOptionSlots(
                    $slots,
                    'menuIcon optionPdf optionImg optionSvg optionFullscreen optionAnnotator optionAltCopy custom-menu-before custom-menu-after',
                )"
                #[slotName]="slotProps"
            >
                <slot
                    :name="slotName"
                    v-bind="getUserOptionSlotProps(slotName, slotProps)"
                />
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
            <slot
                name="svg-underlayer"
                :svg="{
                    ...svg,
                    isPrintingImg: isPrinting || isImaging || isCallbackImaging,
                    isPrintingSvg: isCallbackSvg,
                }"
            />

            <title :id="`bullet-svg-title-${uid}`">
                {{ cfgChart.title.text || 'Bullet chart' }}
            </title>

            <desc :id="`bullet-svg-desc-${uid}`">
                Value: {{ activeValue }}, Target:
                {{ hasTarget ? FINAL_DATASET.target : '-' }}
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
                    v-if="!cfgTarget.onTop && cfgTarget.show && hasTarget"
                    v-bind="targetAttrs"
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
                    {{ valueLabel }}
                </text>
                <!-- TARGET ON TOP-->
                <rect
                    data-cy="vue-ui-bullet-target-top"
                    v-if="cfgTarget.onTop && cfgTarget.show && hasTarget"
                    v-bind="targetAttrs"
                    :style="{ transition: 'x 0.3s ease-in-out' }"
                />
                <!-- TICK LABELS -->
                <g v-if="cfgSegments.dataLabels.show">
                    <text
                        data-cy="vue-ui-bullet-tick-label"
                        v-for="(tick, i) in segments.ticks"
                        :x="tick.x"
                        :y="tick.y"
                        text-anchor="middle"
                        :fill="cfgSegments.dataLabels.color"
                        :font-size="cfgSegments.dataLabels.fontSize + 'px'"
                        :font-weight="
                            cfgSegments.dataLabels.bold ? 'bold' : 'normal'
                        "
                    >
                        {{ tickLabels[i] }}
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
