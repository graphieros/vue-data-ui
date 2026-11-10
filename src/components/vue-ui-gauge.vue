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
import { resolveChartConfigWithPalette } from '../resolveChartConfig';
import {
    computed,
    defineAsyncComponent,
    nextTick,
    onBeforeUnmount,
    onMounted,
    ref,
    shallowRef,
    toRefs,
    watch,
} from 'vue';
import {
    applyDataLabel,
    convertColorToHex,
    convertCustomPalette,
    createHalfCircleArc,
    createUid,
    dataLabel,
    error,
    getMissingDatasetAttributes,
    objectIsEmpty,
    palette,
    makeDonut,
    setOpacity,
    translateSize,
    offsetFromCenterPoint,
    XMLNS,
    calcMarkerOffsetX,
    treeShake,
    createTSpansFromLineBreaksOnX,
} from '../lib.js';
import { useHints } from '../useHints';
import { useConfig } from '../useConfig';
import { useLoading } from '../useLoading.js';
import { usePrinter } from '../usePrinter';
import { useResponsive } from '../useResponsive';

import { useChartExport } from '../useChartExport.js';
import { useUserOptionState } from '../useUserOptionState';
import { useChartAccessibility } from '../useChartAccessibility.js';
import { usePrefersReducedMotion } from '../usePrefersMotion';
import { useAutoSizeLabelsInsideViewbox } from '../useAutoSizeLabelsInsideViewbox.js';
import themes from '../themes/vue_ui_gauge.json';
import Title from '../atoms/Title.vue'; // Must be ready in responsive mode
import BaseScanner from '../atoms/BaseScanner.vue';
import DefGrad from '../atoms/DefGrad.vue';

const PenAndPaper = defineAsyncComponent(
    () => import('../atoms/PenAndPaper.vue'),
);
const UserOptions = defineAsyncComponent(
    () => import('../atoms/UserOptions.vue'),
);
const PackageVersion = defineAsyncComponent(
    () => import('../atoms/PackageVersion.vue'),
);

const { vue_ui_gauge: DEFAULT_CONFIG } = useConfig();
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
    return (
        !!props.dataset &&
        Object.keys(props.dataset).length > 0 &&
        props.dataset.series &&
        props.dataset.series.length
    );
});

const uid = ref(createUid());
const step = ref(0);
const gaugeChart = ref(null);
const chartTitle = ref(null);
const chartLegend = ref(null);
const source = ref(null);
const noTitle = ref(null);
const titleStep = ref(0);

const FINAL_CONFIG = ref(prepareConfig());
const cfgSegSeparators = computed(
    () => FINAL_CONFIG.value.style.chart.layout.segmentSeparators,
);
const cfgSegNames = computed(
    () => FINAL_CONFIG.value.style.chart.layout.segmentNames,
);
const cfgMarkers = computed(
    () => FINAL_CONFIG.value.style.chart.layout.markers,
);
const cfgPointer = computed(
    () => FINAL_CONFIG.value.style.chart.layout.pointer,
);
const cfgLayout = computed(() => FINAL_CONFIG.value.style.chart.layout);
const cfgChart = computed(() => FINAL_CONFIG.value.style.chart);

useHints({
    config: () => FINAL_CONFIG.value,
    dataset: () => props.dataset,
    component: 'VueUiGauge',
    rules: [
        {
            test: (ds) => ds?.series && ds.series?.length > 6,
            message: [
                '👀 The number of steps is > 6, which can make the chart hard to read and labels overlap. Consider:',
                '',
                '▶️ Using broader steps.',
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
                    animation: { use: false },
                    layout: {
                        markers: { show: false },
                        segmentSeparators: { stroke: '#6A6A6A' },
                        segmentNames: { show: false },
                        indicatorArc: { fill: '#6A6A6A50' },
                        pointer: {
                            stroke: '#6A6A6A',
                            useRatingColor: true,
                            circle: {
                                stroke: '#6A6A6A',
                                color: '#6A6A6A',
                            },
                        },
                    },
                    legend: {
                        show: false,
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
        value: 0,
        series: [
            { from: -1, to: 0, name: '_', color: '#A1A1A1' },
            { from: 0, to: 1, name: '__', color: '#CACACA' },
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

watch(
    () => props.config,
    (_newCfg) => {
        if (!loading.value) {
            FINAL_CONFIG.value = prepareConfig();
        }
        userOptionsVisible.value =
            !FINAL_CONFIG.value.userOptions.showOnChartHover;
        validateDataset();
        titleStep.value += 1;
    },
    { deep: true },
);

watch(() => props.dataset, validateDataset, { deep: true });

function prepareConfig() {
    return resolveChartConfigWithPalette(props.config, DEFAULT_CONFIG, themes);
}

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `vue-ui-gauge_${uid.value}`,
    fileName: cfgChart.value.title.text || 'vue-ui-gauge',
    options: FINAL_CONFIG.value.userOptions.print,
});

const hasOptionsNoTitle = computed(() => {
    return FINAL_CONFIG.value.userOptions.show && !cfgChart.value.title.text;
});

const customPalette = computed(() => {
    return convertCustomPalette(FINAL_CONFIG.value.customPalette);
});

const mutableDataset = computed(() => {
    if (
        !Array.isArray(FINAL_DATASET.value.series) ||
        !FINAL_DATASET.value.series.length
    ) {
        return {
            value: 0,
            series: [
                {
                    from: 0,
                    to: 0,
                },
            ],
        };
    }

    const arr = [];

    (FINAL_DATASET.value.series || []).forEach((serie) => {
        arr.push(serie.from || 0.0000001);
        arr.push(serie.to || 0.0000001);
    });
    const max = Math.max(...arr);
    return {
        ...FINAL_DATASET.value,
        series: (FINAL_DATASET.value.series || []).map((serie, i) => {
            return {
                ...serie,
                color:
                    convertColorToHex(serie.color) ||
                    customPalette.value[i] ||
                    palette[i],
                value: (((serie.to || 0) - (serie.from || 0)) / max) * 100,
            };
        }),
    };
});

const baseSize = 512;
const viewport = ref({ width: 512, height: 358.4 });
const svg = computed(() => {
    const responsive = FINAL_CONFIG.value.responsive;
    const { width, height } = responsive
        ? viewport.value
        : { width: 512, height: 358.4 };
    const size = Math.min(width, height);
    const scale = (source, relator = size, threshold = 2) =>
        translateSize({
            relator,
            adjuster: baseSize,
            source,
            threshold,
            fallback: threshold,
        });
    return {
        width,
        height,
        top: 0,
        bottom: height,
        centerX: responsive ? width / 2 : 179.2,
        centerY: responsive ? (baseSize / 2 / 358.4) * height : baseSize / 2,
        labelFontSize: responsive ? Math.max(10, (18 / baseSize) * size) : 18,
        legendFontSize: responsive
            ? Math.max(14, (cfgChart.value.legend.fontSize / baseSize) * size)
            : cfgChart.value.legend.fontSize,
        pointerRadius: responsive
            ? (cfgPointer.value.circle.radius / baseSize) * size
            : cfgPointer.value.circle.radius,
        trackSize: responsive
            ? (cfgLayout.value.track.size / baseSize) * size
            : cfgLayout.value.track.size,
        pointerSize: cfgPointer.value.size,
        pointerStrokeWidth: responsive
            ? scale(cfgPointer.value.strokeWidth)
            : cfgPointer.value.strokeWidth,
        markerOffset: responsive
            ? scale(cfgMarkers.value.offsetY + 3, Math.max(width, height))
            : cfgMarkers.value.offsetY + 3,
        segmentFontSize: responsive
            ? scale(cfgSegNames.value.fontSize, size, 8)
            : cfgSegNames.value.fontSize,
    };
});
const bounds = computed(() => {
    const values = mutableDataset.value.series.flatMap((s) => [
        s.from || 0,
        s.to || 0,
    ]);
    return { min: Math.min(...values), max: Math.max(...values) };
});
const min = computed(() => bounds.value.min);
const max = computed(() => bounds.value.max);
const shouldAnimate = computed(
    () => cfgChart.value.animation.use && !prefersReducedMotion.value,
);
const targetRating = computed(() =>
    Number.isFinite(FINAL_DATASET.value.value) ? FINAL_DATASET.value.value : 0,
);
const activeRating = ref(shouldAnimate.value ? min.value : targetRating.value);
let animationFrame = null;
let disposed = false;
function stopAnimation() {
    if (animationFrame !== null) cancelAnimationFrame(animationFrame);
    animationFrame = null;
}
watch([targetRating, shouldAnimate, () => cfgChart.value.animation.speed], () =>
    useAnimation(targetRating.value),
);
const progress = computed(() =>
    max.value === min.value
        ? 0
        : (activeRating.value - min.value) / (max.value - min.value),
);
const pointerAngle = computed(() => Math.PI * progress.value + Math.PI);
const pointer = computed(() => {
    const x = svg.value.width / 2,
        y = arcSizeSource.value.base;
    const length =
        arcSizeSource.value.pointerSize * svg.value.pointerSize * 0.9;
    return {
        x1: x,
        y1: y,
        x2: x + length * Math.cos(pointerAngle.value),
        y2: y + length * Math.sin(pointerAngle.value),
    };
});
const pointyPointerPath = computed(() => {
    const { x1, y1, x2, y2 } = pointer.value;
    const radius = svg.value.pointerRadius;
    const dx = radius * Math.cos(pointerAngle.value + Math.PI / 2);
    const dy = radius * Math.sin(pointerAngle.value + Math.PI / 2);
    return `M ${x2},${y2} ${x1 + dx},${y1 + dy} ${x1 - dx},${y1 - dy} Z`;
});

const ratingColor = computed(() => {
    for (let i = 0; i < mutableDataset.value.series.length; i += 1) {
        const { color, from, to } = mutableDataset.value.series[i];
        if (activeRating.value >= from && activeRating.value <= to) {
            return color;
        }
    }
    return '#2D353C';
});

const labels_font_size = ref(svg.value.segmentFontSize);
const { autoSizeLabels } = useAutoSizeLabelsInsideViewbox({
    svgRef,
    fontSize: () => svg.value.segmentFontSize,
    minFontSize: () => cfgSegNames.value.minFontSize,
    sizeRef: labels_font_size,
    labelClass: '.vue-ui-gauge-label-flat',
});
watch(
    [svg, cfgSegNames, mutableDataset],
    async () => {
        labels_font_size.value = svg.value.segmentFontSize;
        await nextTick();
        if (!disposed) autoSizeLabels();
    },
    { deep: true, flush: 'post' },
);

const debug = computed(() => FINAL_CONFIG.value.debug);

function validateDataset() {
    let hasError = false;

    if (objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiGauge',
            type: 'dataset',
            debug: debug.value,
        });
        hasError = true;
    } else {
        getMissingDatasetAttributes({
            datasetObject: props.dataset,
            requiredAttributes: ['value', 'series'],
        }).forEach((attr) => {
            error({
                componentName: 'VueUiGauge',
                type: 'datasetAttribute',
                property: attr,
                debug: debug.value,
            });
            hasError = true;
        });
        if (Object.hasOwn(props.dataset, 'series')) {
            if (
                !Array.isArray(props.dataset.series) ||
                !props.dataset.series.length
            ) {
                error({
                    componentName: 'VueUiGauge',
                    type: 'datasetAttributeEmpty',
                    property: 'series',
                    debug: debug.value,
                });
                hasError = true;
            } else {
                props.dataset.series.forEach((serie, i) => {
                    getMissingDatasetAttributes({
                        datasetObject: serie,
                        requiredAttributes: ['from', 'to'],
                    }).forEach((attr) => {
                        error({
                            componentName: 'VueUiGauge',
                            type: 'datasetSerieAttribute',
                            property: attr,
                            index: i,
                            debug: debug.value,
                        });
                        hasError = true;
                    });
                });
            }
        }
    }

    manualLoading.value = hasError;
}

const resizeObserver = shallowRef(null);
let resizeFrame = null;
function stopResize() {
    resizeObserver.value?.disconnect();
    resizeObserver.value = null;
    if (resizeFrame !== null) cancelAnimationFrame(resizeFrame);
    resizeFrame = null;
}
function updateSizing() {
    stopResize();
    const parent = gaugeChart.value?.parentNode;
    if (!FINAL_CONFIG.value.responsive || !parent) return;
    const resize = () => {
        if (resizeFrame !== null) cancelAnimationFrame(resizeFrame);
        resizeFrame = requestAnimationFrame(() => {
            resizeFrame = null;
            if (disposed) return;
            const { width, height } = useResponsive({
                chart: gaugeChart.value,
                title: cfgChart.value.title.text ? chartTitle.value : null,
                legend: chartLegend.value,
                source: source.value,
                noTitle: noTitle.value,
            });
            viewport.value = { width, height: height - 12 };
        });
    };
    resizeObserver.value = new ResizeObserver(resize);
    resizeObserver.value.observe(parent);
    resize();
}
watch(() => FINAL_CONFIG.value.responsive, updateSizing, { flush: 'post' });
onMounted(() => {
    validateDataset();
    useAnimation(targetRating.value);
    updateSizing();
    autoSizeLabels();
});
onBeforeUnmount(() => {
    disposed = true;
    stopAnimation();
    stopResize();
});

function useAnimation(targetValue) {
    stopAnimation();

    const speed = Number(cfgChart.value.animation.speed);
    if (!shouldAnimate.value || !Number.isFinite(speed) || speed <= 0) {
        activeRating.value = targetValue;
        return;
    }
    const chunk = Math.abs(targetValue - activeRating.value) / (speed * 60);

    function animate() {
        if (disposed) return;
        if (!shouldAnimate.value) {
            activeRating.value = targetValue;
            animationFrame = null;
            return;
        }

        if (activeRating.value < targetValue) {
            activeRating.value = Math.min(
                activeRating.value + chunk,
                targetValue,
            );
        } else if (activeRating.value > targetValue) {
            activeRating.value = Math.max(
                activeRating.value - chunk,
                targetValue,
            );
        }

        if (activeRating.value !== targetValue) {
            animationFrame = requestAnimationFrame(animate);
        } else {
            animationFrame = null;
        }
    }

    animate();
}

const geometrySeries = computed(() =>
    mutableDataset.value.series.map((s) => ({
        ...s,
        value: Math.max(0, (s.to || 0) - (s.from || 0)),
    })),
);

const arcSizeSource = computed(() => {
    const src = FINAL_CONFIG.value.responsive
        ? Math.min(svg.value.width, svg.value.height)
        : svg.value.width;
    const arcRatio = 2.5 / cfgLayout.value.radiusRatio;
    return {
        arcs: src / arcRatio,
        gradients: src / (arcRatio * 1.1),
        base: FINAL_CONFIG.value.responsive
            ? svg.value.height / 1.618
            : svg.value.height * 0.7,
        ratingBase: FINAL_CONFIG.value.responsive
            ? svg.value.height / 2 + svg.value.height / 4
            : svg.value.height * 0.9,
        pointerSize: FINAL_CONFIG.value.responsive
            ? Math.min(svg.value.width, svg.value.height) / 3
            : svg.value.width / 3.2,
    };
});

function buildArcs(radius, size, amplification = 1, rotation = 109.9495) {
    return makeDonut(
        { series: geometrySeries.value },
        svg.value.width / 2,
        arcSizeSource.value.base,
        radius,
        radius,
        amplification,
        1,
        1,
        180,
        rotation,
        size,
    );
}
const arcs = computed(() =>
    buildArcs(arcSizeSource.value.arcs, 40 * svg.value.trackSize),
);
const labelArcs = computed(() =>
    buildArcs(
        arcSizeSource.value.arcs * cfgSegNames.value.offsetRatio,
        40 * svg.value.trackSize,
    ),
);

const pathRadii = computed(() => {
    return arcs.value.map((arc) => {
        return (
            arcSizeSource.value.arcs *
            cfgSegNames.value.offsetRatio *
            (arc.nameOffsetRatio || 1)
        );
    });
});

function separator(inner, outer) {
    const center = {
        centerX: svg.value.width / 2,
        centerY: arcSizeSource.value.base,
    };
    const start = offsetFromCenterPoint({
        ...center,
        initX: inner.x,
        initY: inner.y,
        offset: -cfgSegSeparators.value.offsetIn,
    });
    const end = offsetFromCenterPoint({
        ...center,
        initX: outer.x,
        initY: outer.y,
        offset: cfgSegSeparators.value.offsetOut,
    });
    return { x1: start.x, y1: start.y, x2: end.x, y2: end.y };
}
const firstSeparator = computed(() =>
    separator(arcs.value[0].firstSeparator, {
        x: arcs.value[0].startX,
        y: arcs.value[0].startY,
    }),
);
const segmentSeparators = computed(() =>
    arcs.value.map((arc) =>
        separator(arc.separator, { x: arc.endX, y: arc.endY }),
    ),
);
function markerPosition(x, y) {
    return offsetFromCenterPoint({
        centerX: svg.value.width / 2,
        centerY: arcSizeSource.value.base,
        initX: x,
        initY: y,
        offset: svg.value.markerOffset,
    });
}
const markers = computed(() =>
    arcs.value.map((arc) => ({
        ...markerPosition(arc.center.startX, arc.center.startY),
        value: arc.from,
        anchor:
            arc.center.startX < svg.value.width / 2 - 5
                ? 'end'
                : arc.center.startX > svg.value.width / 2 + 5
                  ? 'start'
                  : 'middle',
    })),
);
const lastMarker = computed(() =>
    markerPosition(arcs.value.at(-1).endX, arcs.value.at(-1).endY),
);

function calculateCumulativeHalfCircleOffsets(percentages) {
    const totalPercentage = percentages.reduce((sum, val) => sum + val, 0);
    const halfCircleLength = 50;
    let cumulative = 0;
    return percentages.map((percentage) => {
        cumulative += percentage;
        const offset = totalPercentage
            ? ((cumulative - percentage / 2) / totalPercentage) *
              halfCircleLength
            : 0;
        return `${offset}%`;
    });
}

const curveLabelOffsets = computed(() => {
    return calculateCumulativeHalfCircleOffsets(
        arcs.value.map((arc) => arc.proportion * 100),
    );
});

const gradientArcs = computed(() =>
    buildArcs(
        arcSizeSource.value.gradients,
        2 * svg.value.trackSize,
        0.95,
        110.02,
    ),
);
const gaugeArc = computed(() =>
    createHalfCircleArc({
        radius: cfgLayout.value.indicatorArc.radius * svg.value.trackSize,
        centerX: svg.value.width / 2,
        centerY: arcSizeSource.value.base,
        percentage: progress.value,
    }),
);

const isFullscreen = ref(false);
function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
}

const isAnnotator = ref(false);
function toggleAnnotator() {
    isAnnotator.value = !isAnnotator.value;
}

const getImage = createChartImageGetter(
    gaugeChart,
    () => cfgChart.value.title.text,
);

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
        dataset: mutableDataset.value,
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
            dataset: mutableDataset.value,
        }),
    );
}

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
        :class="`vue-data-ui-component vue-ui-gauge ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''}`"
        ref="gaugeChart"
        :id="`vue-ui-gauge_${uid}`"
        :style="`font-family:${FINAL_CONFIG.style.fontFamily};width:100%; text-align:center;background:${cfgChart.backgroundColor};${FINAL_CONFIG.responsive ? 'height: 100%' : ''}`"
        @mouseenter="() => setUserOptionsVisibility(true)"
        @mouseleave="() => setUserOptionsVisibility(false)"
    >
        <PenAndPaper
            v-bind="getAnnotatorProps(FINAL_CONFIG.userOptions.annotator)"
            v-if="FINAL_CONFIG.userOptions.buttons.annotator"
            :svgRef="svgRef"
            :backgroundColor="cfgChart.backgroundColor"
            :color="cfgChart.color"
            :active="isAnnotator"
            :isCursorPointer="isCursorPointer"
            :palette="FINAL_CONFIG.userOptions.annotatorPalette"
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
                        cy: 'gauge-div-title',
                        ...cfgChart.title,
                    },
                    subtitle: {
                        cy: 'gauge-div-subtitle',
                        ...cfgChart.title.subtitle,
                    },
                }"
            >
                <span
                    v-if="FINAL_CONFIG.translations.base && FINAL_DATASET.base"
                >
                    {{ FINAL_CONFIG.translations.base }}:
                    {{ FINAL_DATASET.base }}
                </span>
            </Title>
        </div>

        <!-- OPTIONS -->
        <UserOptions
            :key="`user_options_${step}`"
            v-if="
                FINAL_CONFIG.userOptions.show &&
                isDataset &&
                (keepUserOptionState ? true : userOptionsVisible)
            "
            :backgroundColor="cfgChart.backgroundColor"
            :color="cfgChart.color"
            :isImaging="isImaging"
            :isPrinting="isPrinting"
            :uid="uid"
            :hasXls="false"
            :isFullscreen="isFullscreen"
            :chartElement="gaugeChart"
            v-bind="
                getUserOptionsProps(
                    FINAL_CONFIG.userOptions,
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

        <!-- CHART -->
        <svg
            ref="svgRef"
            :xmlns="XMLNS"
            :class="{
                'vue-data-ui-fullscreen--on': isFullscreen,
                'vue-data-ui-fulscreen--off': !isFullscreen,
            }"
            :viewBox="`0 0 ${svg.width <= 0 ? 10 : svg.width} ${svg.height <= 0 ? 10 : svg.height}`"
            :style="`max-width:100%;overflow:hidden !important;background:transparent;color:${cfgChart.color}`"
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

            <!-- BACKGROUND SLOT -->
            <foreignObject
                v-if="$slots['chart-background']"
                :x="0"
                :y="0"
                :width="svg.width <= 0 ? 10 : svg.width"
                :height="svg.height <= 0 ? 10 : svg.height"
                :style="{
                    pointerEvents: 'none',
                }"
            >
                <slot name="chart-background" />
            </foreignObject>

            <defs>
                <DefGrad
                    t="radial"
                    :id="`gradient_${uid}`"
                    cx="50%"
                    cy="50%"
                    r="50%"
                    fx="50%"
                    fy="50%"
                    :stops="[
                        ['0%', setOpacity('#FFFFFF', 1), 1],
                        [
                            '80%',
                            setOpacity(
                                '#FFFFFF',
                                cfgLayout.track.gradientIntensity,
                            ),
                            1,
                        ],
                        ['100%', setOpacity('#FFFFFF', 1), 1],
                    ]"
                />
            </defs>

            <defs>
                <filter
                    :id="`blur_${uid}`"
                    x="-50%"
                    y="-50%"
                    width="200%"
                    height="200%"
                >
                    <feGaussianBlur
                        in="SourceGraphic"
                        :stdDeviation="100 / cfgLayout.track.gradientIntensity"
                    />
                </filter>
            </defs>

            <g v-if="$slots.pattern">
                <defs v-for="(arc, i) in arcs">
                    <slot
                        name="pattern"
                        v-bind="{
                            seriesIndex: i,
                            patternId: `pattern_${uid}_${i}`,
                        }"
                    />
                </defs>
            </g>

            <!-- ARC STEPS -->
            <path
                v-for="(arc, i) in arcs"
                data-cy="gauge-arc"
                :key="`arc_${i}`"
                :d="arc.arcSlice"
                :fill="arc.color"
                :stroke="cfgChart.backgroundColor"
                stroke-linecap="round"
            />

            <template v-if="$slots.pattern">
                <path
                    v-for="(arc, i) in arcs"
                    :key="`arc_${i}`"
                    :d="arc.arcSlice"
                    :fill="`url(#pattern_${uid}_${i})`"
                    :stroke="cfgChart.backgroundColor"
                    stroke-linecap="round"
                />
            </template>

            <!-- GAUGE ARC INDICATOR-->
            <path
                data-cy="arc-indicator"
                v-if="cfgLayout.indicatorArc.show"
                :d="gaugeArc"
                :fill="cfgLayout.indicatorArc.fill"
            />

            <template v-if="cfgSegNames.show && cfgSegNames.curved">
                <!-- CIRCLE PATH AS BASE FOR CURVED LABELS -->
                <path
                    v-for="(arc, i) in arcs"
                    :id="`curve_${uid}_${i}`"
                    :d="`M ${pointer.x1},${pointer.y1} m -${pathRadii[i]},0 a ${pathRadii[i]},${pathRadii[i]} 0 1,1 ${2 * pathRadii[i]},0 a ${pathRadii[i]},${pathRadii[i]} 0 1,1 -${2 * pathRadii[i]},0`"
                    fill="transparent"
                />

                <!-- CURVED LABELS -->
                <text
                    v-for="(arc, i) in arcs"
                    data-cy="arc-label"
                    :fill="
                        cfgSegNames.useSerieColor
                            ? arc.color
                            : cfgSegNames.color
                    "
                    :font-size="labels_font_size"
                    :font-weight="cfgSegNames.bold ? 'bold' : 'normal'"
                    text-anchor="middle"
                >
                    <textPath
                        :href="`#curve_${uid}_${i}`"
                        :startOffset="curveLabelOffsets[i]"
                    >
                        {{ arc.name || '' }}
                    </textPath>
                </text>
            </template>

            <template v-if="cfgSegNames.show && !cfgSegNames.curved">
                <text
                    class="vue-ui-gauge-label-flat"
                    v-for="(arc, i) in labelArcs"
                    :text-anchor="calcMarkerOffsetX(arc, false, 12).anchor"
                    :fill="
                        cfgSegNames.useSerieColor
                            ? arc.color
                            : cfgSegNames.color
                    "
                    :font-size="labels_font_size"
                    :font-weight="cfgSegNames.bold ? 'bold' : 'normal'"
                    v-html="
                        createTSpansFromLineBreaksOnX({
                            content: String(arc.name ?? ''),
                            fontSize: labels_font_size,
                            fill: cfgSegNames.useSerieColor
                                ? arc.color
                                : cfgSegNames.color,
                            x: arc.center.endX,
                            y: arc.center.endY,
                        })
                    "
                />
            </template>

            <!-- ARC STEPS GRADIENTS-->
            <template v-if="cfgLayout.track.useGradient">
                <path
                    v-for="(arc, i) in gradientArcs"
                    :data-cy="`gauge-arc-${i}`"
                    :key="`arc_${i}`"
                    :d="arc.arcSlice"
                    fill="#FFFFFF"
                    stroke="none"
                    stroke-linecap="round"
                    :filter="`url(#blur_${uid})`"
                />
            </template>

            <template v-if="cfgSegSeparators.show">
                <line
                    data-cy="segment-separator-first-wrapper"
                    v-bind="firstSeparator"
                    :stroke="cfgChart.backgroundColor"
                    :stroke-width="cfgSegSeparators.strokeWidth + 2"
                    stroke-linecap="round"
                />
                <line
                    data-cy="segment-separator-first"
                    v-bind="firstSeparator"
                    :stroke="cfgSegSeparators.stroke"
                    :stroke-width="cfgSegSeparators.strokeWidth"
                    stroke-linecap="round"
                />
                <line
                    data-cy="segment-separator-wrapper"
                    v-for="segmentSeparator in segmentSeparators"
                    v-bind="segmentSeparator"
                    :stroke="cfgChart.backgroundColor"
                    :stroke-width="cfgSegSeparators.strokeWidth + 2"
                    stroke-linecap="round"
                />
                <line
                    data-cy="segment-separator"
                    v-for="segmentSeparator in segmentSeparators"
                    v-bind="segmentSeparator"
                    :stroke="cfgSegSeparators.stroke"
                    :stroke-width="cfgSegSeparators.strokeWidth"
                    stroke-linecap="round"
                />
            </template>

            <!-- STEP MARKERS -->
            <g v-if="cfgMarkers.show">
                <text
                    v-for="(marker, i) in markers"
                    data-cy="arc-label-value"
                    :x="marker.x"
                    :y="marker.y"
                    :text-anchor="marker.anchor"
                    :font-size="svg.labelFontSize * cfgMarkers.fontSizeRatio"
                    :font-weight="`${cfgMarkers.bold ? 'bold' : 'normal'}`"
                    :fill="cfgMarkers.color"
                >
                    {{
                        applyDataLabel(
                            cfgMarkers.formatter,
                            marker.value,
                            dataLabel({
                                p: cfgMarkers.prefix,
                                v: marker.value,
                                s: cfgMarkers.suffix,
                                r: cfgMarkers.roundingValue,
                            }),
                        )
                    }}
                </text>
            </g>

            <text
                v-if="cfgMarkers.show"
                data-cy="arc-label-value-last"
                :x="lastMarker.x"
                :y="lastMarker.y"
                text-anchor="start"
                :font-size="svg.labelFontSize * cfgMarkers.fontSizeRatio"
                :font-weight="`${cfgMarkers.bold ? 'bold' : 'normal'}`"
                :fill="cfgMarkers.color"
            >
                {{
                    applyDataLabel(
                        cfgMarkers.formatter,
                        max,
                        dataLabel({
                            p: cfgMarkers.prefix,
                            v: max,
                            s: cfgMarkers.suffix,
                            r: cfgMarkers.roundingValue,
                        }),
                    )
                }}
            </text>

            <!-- GAUGE POINTER -->
            <template v-if="cfgPointer.show">
                <g v-if="cfgPointer.type === 'rounded'">
                    <line
                        data-cy="gauge-pointer-border"
                        v-if="!isNaN(pointer.x2)"
                        :x1="pointer.x1"
                        :y1="pointer.y1"
                        :x2="pointer.x2"
                        :y2="pointer.y2"
                        :stroke="cfgPointer.stroke"
                        :stroke-width="svg.pointerStrokeWidth"
                        stroke-linecap="round"
                    />
                    <line
                        data-cy="gauge-pointer"
                        v-if="!isNaN(pointer.x2)"
                        :x1="pointer.x1"
                        :y1="pointer.y1"
                        :x2="pointer.x2"
                        :y2="pointer.y2"
                        :stroke="
                            cfgPointer.useRatingColor
                                ? ratingColor
                                : cfgPointer.color
                        "
                        stroke-linecap="round"
                        :stroke-width="svg.pointerStrokeWidth * 0.7"
                    />
                    <line
                        data-cy="gauge-pointer"
                        v-if="!isNaN(pointer.x2) && cfgLayout.track.useGradient"
                        :x1="pointer.x1"
                        :y1="pointer.y1"
                        :x2="pointer.x2"
                        :y2="pointer.y2"
                        :stroke="'white'"
                        stroke-linecap="round"
                        :stroke-width="svg.pointerStrokeWidth * 0.3"
                        :filter="`url(#blur_${uid})`"
                    />
                </g>
                <g v-else>
                    <path
                        data-cy="gauge-pointer"
                        v-if="pointyPointerPath"
                        :d="pointyPointerPath"
                        :fill="
                            cfgPointer.useRatingColor
                                ? ratingColor
                                : cfgPointer.color
                        "
                        :stroke="cfgPointer.stroke"
                        :stroke-width="cfgPointer.circle.strokeWidth"
                        stroke-linejoin="round"
                    />
                </g>
                <circle
                    data-cy="gauge-pointer-circle"
                    :cx="svg.width / 2"
                    :cy="arcSizeSource.base"
                    :fill="cfgPointer.circle.color"
                    :r="svg.pointerRadius <= 0 ? 0.0001 : svg.pointerRadius"
                    :stroke-width="cfgPointer.circle.strokeWidth"
                    :stroke="cfgPointer.circle.stroke"
                />
            </template>

            <!-- GAUGE RATING -->
            <text
                data-cy="gauge-score"
                v-if="cfgChart.legend.show"
                :x="svg.width / 2"
                :y="arcSizeSource.ratingBase"
                text-anchor="middle"
                :font-size="svg.legendFontSize"
                font-weight="bold"
                :fill="
                    cfgChart.legend.useRatingColor
                        ? ratingColor
                        : cfgChart.legend.color
                "
            >
                {{
                    applyDataLabel(
                        cfgChart.legend.formatter,
                        activeRating,
                        dataLabel({
                            p:
                                cfgChart.legend.prefix +
                                (cfgChart.legend.showPlusSymbol &&
                                activeRating > 0
                                    ? '+'
                                    : ''),
                            v: activeRating,
                            s: cfgChart.legend.suffix,
                            r: cfgChart.legend.roundingValue,
                        }),
                    )
                }}
            </text>
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

        <div ref="chartLegend">
            <slot name="legend" v-bind:legend="mutableDataset"></slot>
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

.vue-ui-gauge * {
    transition: unset;
}

.vue-ui-gauge {
    user-select: none;
    position: relative;
}
</style>
