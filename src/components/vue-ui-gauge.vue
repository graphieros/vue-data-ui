<script setup>
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
} from "vue";
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
    themePalettes,
    makeDonut,
    setOpacity,
    translateSize,
    offsetFromCenterPoint,
    XMLNS,
    calcMarkerOffsetX,
    treeShake,
    createTSpansFromLineBreaksOnX,
    checkNaN,
} from "../lib.js";
import { throttle } from "../canvas-lib";
import { useLoading } from "../useLoading.js";
import { usePrinter } from "../usePrinter";
import { useConfig } from "../useConfig";
import { useSvgExport } from "../useSvgExport.js";
import { useResponsive } from "../useResponsive";
import { useNestedProp } from "../useNestedProp";
import { useThemeCheck } from "../useThemeCheck.js";
import { useUserOptionState } from "../useUserOptionState";
import { useChartAccessibility } from "../useChartAccessibility.js";
import { useAutoSizeLabelsInsideViewbox } from "../useAutoSizeLabelsInsideViewbox.js";
import img from "../img.js";
import themes from "../themes/vue_ui_gauge.json";
import Title from "../atoms/Title.vue"; // Must be ready in responsive mode
import BaseScanner from "../atoms/BaseScanner.vue";

const PenAndPaper = defineAsyncComponent(() => import('../atoms/PenAndPaper.vue'));
const UserOptions = defineAsyncComponent(() => import('../atoms/UserOptions.vue'));
const PackageVersion = defineAsyncComponent(() => import('../atoms/PackageVersion.vue'));

const { vue_ui_gauge: DEFAULT_CONFIG } = useConfig();
const { isThemeValid, warnInvalidTheme } = useThemeCheck();

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

const isDataset = computed(() => {
    return !!props.dataset && Object.keys(props.dataset).length > 0 && props.dataset.series && props.dataset.series.length;
});

const uid = ref(createUid());
const details = ref(null);
const step = ref(0);
const gaugeChart = ref(null);
const chartTitle = ref(null);
const chartLegend = ref(null);
const source = ref(null);
const noTitle = ref(null);
const titleStep = ref(0);
const isCallbackImaging = ref(false);
const isCallbackSvg = ref(false);

const FINAL_CONFIG = ref(prepareConfig());

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
                                color: '#6A6A6A'
                            }
                        }
                    },
                    legend: {
                        show: false,
                    }
                }
            }
        },
        userConfig: FINAL_CONFIG.value.skeletonConfig ?? {}
    })
})

const { loading, FINAL_DATASET, manualLoading } = useLoading({
    ...toRefs(props),
    FINAL_CONFIG,
    prepareConfig,
    callback: () => {
        Promise.resolve().then(async () => {
            await nextTick();
        })
    },
    skeletonDataset: props.config?.skeletonDataset ?? {
        value: 0,
        series: [
            { from: -1, to: 0, name: '_', color: '#A1A1A1' },
            { from: 0, to: 1, name: '__', color: '#CACACA'},
        ]
    },
    skeletonConfig: treeShake({
        defaultConfig: FINAL_CONFIG.value,
        userConfig: skeletonConfig.value
    })
})

const { userOptionsVisible, setUserOptionsVisibility, keepUserOptionState } = useUserOptionState({ config: FINAL_CONFIG.value });
const { svgRef } = useChartAccessibility({ config: FINAL_CONFIG.value.style.chart.title });

watch(() => props.config, (_newCfg) => {
    if (!loading.value) {
        FINAL_CONFIG.value = prepareConfig();
    }
    userOptionsVisible.value = !FINAL_CONFIG.value.userOptions.showOnChartHover;
    prepareChart();
    titleStep.value += 1;
}, { deep: true });

watch(() => props.dataset, (ds) => {
    prepareChart();
    if (ds && Object.keys(ds).length > 0) {
        manualLoading.value = FINAL_CONFIG.value?.loading ?? false;
    }
}, { deep: true, immediate: false });

function prepareConfig() {
    const mergedConfig = useNestedProp({
        userConfig: props.config,
        defaultConfig: DEFAULT_CONFIG
    });

    const theme = mergedConfig.theme;
    if (!theme) return mergedConfig;

    if (!isThemeValid.value(mergedConfig)) {
        warnInvalidTheme(mergedConfig);
        return mergedConfig;
    }

    const fused = useNestedProp({
        userConfig: themes[theme] || props.config,
        defaultConfig: mergedConfig
    });

    const finalConfig = useNestedProp({
        userConfig: props.config,
        defaultConfig: fused
    });

    return {
        ...finalConfig,
        customPalette: finalConfig.customPalette.length ? finalConfig.customPalette : themePalettes[theme] || palette
    }
}

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `vue-ui-gauge_${uid.value}`,
    fileName: FINAL_CONFIG.value.style.chart.title.text || 'vue-ui-gauge',
    options: FINAL_CONFIG.value.userOptions.print
});

const hasOptionsNoTitle = computed(() => {
    return FINAL_CONFIG.value.userOptions.show && !FINAL_CONFIG.value.style.chart.title.text;
});

const customPalette = computed(() => {
    return convertCustomPalette(FINAL_CONFIG.value.customPalette);
});

const mutableDataset = computed(() => {

    if (objectIsEmpty(FINAL_DATASET.value.series || {})) {
        return {
            value: 0,
            series: [
                {
                    from: 0,
                    to: 0
                }
            ]
        }
    }

    const arr = [];

    (FINAL_DATASET.value.series || []).forEach(serie => {
        arr.push(serie.from || 0.0000001);
        arr.push(serie.to || 0.0000001);
    });
    const max = Math.max(...arr);
    return {
        ...FINAL_DATASET.value,
        series: (FINAL_DATASET.value.series || []).map((serie, i) => {
            return {
                ...serie,
                color: convertColorToHex(serie.color) || customPalette.value[i] || palette[i],
                value: (((serie.to || 0) - (serie.from || 0)) / max) * 100,
            }
        })
    }
});

const baseSize = ref(512);

const svg = ref({
    height: 358.4,
    width: baseSize.value,
    top: 0,
    bottom: 358.4,
    centerX: 179.2,
    centerY: baseSize.value / 2,
    labelFontSize: 18,
    legendFontSize: FINAL_CONFIG.value.style.chart.legend.fontSize,
    pointerRadius: FINAL_CONFIG.value.style.chart.layout.pointer.circle.radius,
    trackSize: FINAL_CONFIG.value.style.chart.layout.track.size,
    pointerSize: FINAL_CONFIG.value.style.chart.layout.pointer.size,
    pointerStrokeWidth: FINAL_CONFIG.value.style.chart.layout.pointer.strokeWidth,
    markerOffset: FINAL_CONFIG.value.style.chart.layout.markers.offsetY + 3,
    segmentFontSize: FINAL_CONFIG.value.style.chart.layout.segmentNames.fontSize
});

const max = ref(0);
const min = ref(0);

const activeRating = ref(
    FINAL_CONFIG.value.style.chart.animation.use
        ? Math.min(...FINAL_DATASET.value.series.map(s => s.from))
        : FINAL_DATASET.value.value
);

watch(() => FINAL_DATASET.value.value, () => {
    useAnimation(FINAL_DATASET.value.value);
})

const pointer = computed(() => {
    const x = svg.value.width / 2;
    const y = arcSizeSource.value.base;
    const angle = Math.PI * ((activeRating.value + 0 - min.value) / (max.value - min.value)) + Math.PI;
    return {
        x1: x,
        y1: y,
        x2: x + (arcSizeSource.value.pointerSize * svg.value.pointerSize * 0.9) * Math.cos(angle),
        y2: y + (arcSizeSource.value.pointerSize * svg.value.pointerSize * 0.9) * Math.sin(angle)
    }
});

const pointyPointerPath = computed(() => {
    const centerX = svg.value.width / 2;
    const centerY = arcSizeSource.value.base;
    const angle = Math.PI * ((activeRating.value + 0 - min.value) / (max.value - min.value)) + Math.PI;
    const tipX = centerX + ((arcSizeSource.value.pointerSize) * svg.value.pointerSize * 0.9) * Math.cos(angle);
    const tipY = centerY + ((arcSizeSource.value.pointerSize) * svg.value.pointerSize * 0.9) * Math.sin(angle);
    const baseLength = svg.value.pointerRadius;
    const baseX1 = centerX + baseLength * Math.cos(angle + (Math.PI / 2));
    const baseY1 = centerY + baseLength * Math.sin(angle + (Math.PI / 2));
    const baseX2 = centerX + baseLength * Math.cos(angle - (Math.PI / 2));
    const baseY2 = centerY + baseLength * Math.sin(angle - (Math.PI / 2));

    if (isNaN(tipX)) return null;

    return `M ${tipX},${tipY} ${baseX1},${baseY1} ${baseX2},${baseY2} Z`;
})

const ratingColor = computed(() => {
    for (let i = 0; i < mutableDataset.value.series.length; i += 1) {
        const { color, from, to } = mutableDataset.value.series[i];
        if (activeRating.value >= from && activeRating.value <= to) {
            return color;
        }
    }
    return "#2D353C";
});

const resizeObserver = shallowRef(null);
const observedEl = shallowRef(null);

const labels_font_size = computed({
    get: () => svg.value.segmentFontSize,
    set: v => v
});

const { autoSizeLabels } = useAutoSizeLabelsInsideViewbox({
    svgRef,
    fontSize: svg.value.segmentFontSize,
    minFontSize: FINAL_CONFIG.value.style.chart.layout.segmentNames.minFontSize,
    sizeRef: labels_font_size,
    labelClass: '.vue-ui-gauge-label-flat'
})

const debug = computed(() => !!FINAL_CONFIG.value.debug);

function prepareChart() {
    let hasError = false;

    if (objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiGauge',
            type: 'dataset',
            debug: debug.value
        });
        manualLoading.value = true;
        hasError = true;
    } else {
        getMissingDatasetAttributes({
            datasetObject: props.dataset,
            requiredAttributes: ['value', 'series']
        }).forEach(attr => {
            error({
                componentName: 'VueUiGauge',
                type: 'datasetAttribute',
                property: attr,
                debug: debug.value
            });
            manualLoading.value = true;
            hasError = true;
        });
        if (Object.hasOwn(props.dataset, 'series')) {
            if (!props.dataset.series.length) {
                error({
                    componentName: 'VueUiGauge',
                    type: 'datasetAttributeEmpty',
                    property: 'series',
                    debug: debug.value
                });
                manualLoading.value = true;
                hasError = true;
            } else {
                props.dataset.series.forEach((serie, i) => {
                    getMissingDatasetAttributes({
                        datasetObject: serie,
                        requiredAttributes: ['from', 'to']
                    }).forEach(attr => {
                        error({
                            componentName: 'VueUiGauge',
                            type: 'datasetSerieAttribute',
                            property: attr,
                            index: i,
                            debug: debug.value
                        });
                        manualLoading.value = true;
                        hasError = true;
                    })
                })
            }
        }
    }
    
    manualLoading.value = hasError;

    useAnimation(FINAL_DATASET.value.value || 0);

    if (FINAL_CONFIG.value.responsive) {
        const handleResize = throttle(() => {
            let { width, height } = useResponsive({
                chart: gaugeChart.value,
                title: FINAL_CONFIG.value.style.chart.title.text ? chartTitle.value : null,
                legend: chartLegend.value,
                source: source.value,
                noTitle: noTitle.value
            });

            height -= 12;

            requestAnimationFrame(() => {
                svg.value.width = width;
                svg.value.height = height;
                svg.value.centerX = width / 2;
                svg.value.centerY = ((baseSize.value / 2) / 358.4) * height;
                svg.value.bottom = height;
                svg.value.labelFontSize = (18 / baseSize.value) * Math.min(height, width) < 10 ? 10 : (18 / baseSize.value) * Math.min(height, width);
                svg.value.legendFontSize = (FINAL_CONFIG.value.style.chart.legend.fontSize / baseSize.value) * Math.min(height, width) < 14 ? 14 : (FINAL_CONFIG.value.style.chart.legend.fontSize / baseSize.value) * Math.min(height, width);
                svg.value.pointerRadius = (FINAL_CONFIG.value.style.chart.layout.pointer.circle.radius / baseSize.value) * (Math.min(height, width));
                svg.value.trackSize = (FINAL_CONFIG.value.style.chart.layout.track.size / baseSize.value) * (Math.min(height, width));
                svg.value.pointerStrokeWidth = translateSize({
                    relator: Math.min(width, height),
                    adjuster: baseSize.value,
                    source: FINAL_CONFIG.value.style.chart.layout.pointer.strokeWidth,
                    threshold: 2,
                    fallback: 2
                });
                svg.value.markerOffset = translateSize({
                    relator: Math.max(width, height),
                    adjuster: baseSize.value,
                    source: FINAL_CONFIG.value.style.chart.layout.markers.offsetY + 3,
                    threshold: 2,
                    fallback: 2
                });
                svg.value.segmentFontSize = translateSize({
                    relator: Math.min(width, height),
                    adjuster: baseSize.value,
                    source: FINAL_CONFIG.value.style.chart.layout.segmentNames.fontSize,
                    threshold: 8,
                    fallback: 8
                });
            });

            autoSizeLabels();
        });

        if (resizeObserver.value) {
            if (observedEl.value) {
                resizeObserver.value.unobserve(observedEl.value);
            }
            resizeObserver.value.disconnect();
        }

        resizeObserver.value = new ResizeObserver(handleResize);
        observedEl.value = gaugeChart.value.parentNode;
        resizeObserver.value.observe(observedEl.value);
    }

    autoSizeLabels();
}

onMounted(() => {
    prepareChart();
});

onBeforeUnmount(() => {
    if (resizeObserver.value) {
        if (observedEl.value) {
            resizeObserver.value.unobserve(observedEl.value);
        }
        resizeObserver.value.disconnect();
    }
});

function useAnimation(targetValue) {
    const arr = [];
    (mutableDataset.value.series || []).forEach(serie => {
        arr.push(serie.from || 0);
        arr.push(serie.to || 0);
    });
    max.value = Math.max(...arr);
    min.value = Math.min(...arr);

    let speed = FINAL_CONFIG.value.style.chart.animation.speed;
    const chunk = Math.abs(targetValue - activeRating.value) / (speed * 60);

    function animate() {
        if (activeRating.value < targetValue) {
            activeRating.value = Math.min(activeRating.value + chunk, targetValue);
        } else if (activeRating.value > targetValue) {
            activeRating.value = Math.max(activeRating.value - chunk, targetValue)
        }

        if (activeRating.value !== targetValue) {
            requestAnimationFrame(animate)
        }
    }
    animate();
}

const arcSizeSource = computed(() => {
    const src = FINAL_CONFIG.value.responsive ? Math.min(svg.value.width, svg.value.height) : svg.value.width;
    const arcRatio = 2.5 / FINAL_CONFIG.value.style.chart.layout.radiusRatio;
    return {
        arcs: src / arcRatio,
        gradients: src / (arcRatio * 1.1),
        base: FINAL_CONFIG.value.responsive ? svg.value.height / 1.618 : svg.value.height * 0.7,
        ratingBase: FINAL_CONFIG.value.responsive ? svg.value.height / 2 + (svg.value.height / 4) : svg.value.height * 0.9,
        pointerSize: FINAL_CONFIG.value.responsive ? Math.min(svg.value.width, svg.value.height) / 3 : svg.value.width / 3.2
    }
});

const arcs = computed(() => {
    const donut = makeDonut(
        { series: mutableDataset.value.series },
        svg.value.width / 2,
        arcSizeSource.value.base,
        arcSizeSource.value.arcs,
        arcSizeSource.value.arcs,
        1,
        1,
        1,
        180,
        109.9495,
        40 * svg.value.trackSize
    );
    return donut;
});

const labelArcs = computed(() => {
    const donut = makeDonut(
        { series: mutableDataset.value.series },
        svg.value.width / 2,
        arcSizeSource.value.base,
        arcSizeSource.value.arcs * FINAL_CONFIG.value.style.chart.layout.segmentNames.offsetRatio,
        arcSizeSource.value.arcs * FINAL_CONFIG.value.style.chart.layout.segmentNames.offsetRatio,
        1,
        1,
        1,
        180,
        109.9495,
        40 * svg.value.trackSize
    );
    return donut;
});

const pathRadii = computed(() => {
    return arcs.value.map((arc) => {
        return arcSizeSource.value.arcs * FINAL_CONFIG.value.style.chart.layout.segmentNames.offsetRatio * (arc.nameOffsetRatio || 1);
    });
});

const firstSeparator = computed(() => {
    const { x: x1, y: y1 } = offsetFromCenterPoint({
        initX: arcs.value[0].firstSeparator.x,
        initY: arcs.value[0].firstSeparator.y,
        centerX: pointer.value.x1,
        centerY: pointer.value.y1,
        offset: -FINAL_CONFIG.value.style.chart.layout.segmentSeparators.offsetIn
    });
    const { x: x2, y: y2 } = offsetFromCenterPoint({
        initX: arcs.value[0].startX,
        initY: arcs.value[0].startY,
        centerX: pointer.value.x1,
        centerY: pointer.value.y1,
        offset: FINAL_CONFIG.value.style.chart.layout.segmentSeparators.offsetOut
    });
    return { x1, y1, x2, y2 };
});

const segmentSeparators = computed(() => {
    return arcs.value.map(arc => {
        const { x: x1, y: y1 } = offsetFromCenterPoint({
            initX: arc.separator.x,
            initY: arc.separator.y,
            centerX: pointer.value.x1,
            centerY: pointer.value.y1,
            offset: -FINAL_CONFIG.value.style.chart.layout.segmentSeparators.offsetIn
        });
        const { x: x2, y: y2 } = offsetFromCenterPoint({
            initX: arc.endX,
            initY: arc.endY,
            centerX: pointer.value.x1,
            centerY: pointer.value.y1,
            offset: FINAL_CONFIG.value.style.chart.layout.segmentSeparators.offsetOut
        })
        return { x1, y1, x2, y2 };
    });
});

function calculateCumulativeHalfCircleOffsets(percentages) {
    const totalPercentage = percentages.reduce((sum, val) => sum + val, 0);
    if (totalPercentage > 100) {
        throw new Error("Total % must not exceed 100");
    }
    const halfCircleLength = 50;
    let cumulative = 0;
    return percentages.map(percentage => {
        cumulative += percentage;
        const offset = (cumulative / 100) * halfCircleLength;
        return `${offset - percentage / 4}%`;
    });
}

const curveLabelOffsets = computed(() => {
    return calculateCumulativeHalfCircleOffsets(arcs.value.map(arc => arc.proportion * 100))
});

const gradientArcs = computed(() => {
    const donut = makeDonut(
        { series: mutableDataset.value.series },
        svg.value.width / 2,
        arcSizeSource.value.base,
        arcSizeSource.value.gradients,
        arcSizeSource.value.gradients,
        0.95,
        1,
        1,
        180,
        110.02,
        2 * svg.value.trackSize
    );
    return donut;
});

const gaugeArc = computed(() => {
    const added = min.value >= 0 ? -min.value : Math.abs(min.value);
    return createHalfCircleArc({
        radius: FINAL_CONFIG.value.style.chart.layout.indicatorArc.radius * svg.value.trackSize,
        centerX: svg.value.width / 2,
        centerY: arcSizeSource.value.base,
        percentage: checkNaN((activeRating.value + added) / (max.value + added))
    });
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

async function getImage({ scale = 2} = {}) {
    if (!gaugeChart.value) return;
    const { width, height } = gaugeChart.value.getBoundingClientRect();
    const aspectRatio = width / height;
    const { imageUri, base64 } = await img({ domElement: gaugeChart.value, base64: true, img: true, scale})
    return { 
        imageUri, 
        base64, 
        title: FINAL_CONFIG.value.style.chart.title.text,
        width,
        height,
        aspectRatio
    }
}

const svgBg = computed(() => FINAL_CONFIG.value.style.chart.backgroundColor);
const svgTitle = computed(() => FINAL_CONFIG.value.style.chart.title);

const { exportSvg, getSvg } = useSvgExport({
    svg: svgRef,
    title: svgTitle,
    backgroundColor: svgBg
});

async function generateSvg({ isCb }) {
    isCallbackSvg.value = true;

    await nextTick();

    try {
        if (isCb) {
            const { blob, url, text, dataUrl } = await getSvg();
            await Promise.resolve(FINAL_CONFIG.value.userOptions.callbacks.svg({ blob, url, text, dataUrl }));
        } else {
            await Promise.resolve(exportSvg());
        }
    } finally {
        isCallbackSvg.value = false;
    }
}

function onGenerateImage(payload) {
    if (payload?.stage === "start") {
        isCallbackImaging.value = true;
        return;
    }

    if (payload?.stage === "end") {
        isCallbackImaging.value = false;
        return;
    }

    generateImage();
}

defineExpose({
    getImage,
    generatePdf,
    generateImage,
    generateSvg,
    toggleAnnotator,
    toggleFullscreen
});

</script>

<template>
    <div :class="`vue-data-ui-component vue-ui-gauge ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''}`" ref="gaugeChart"
        :id="`vue-ui-gauge_${uid}`"
        :style="`font-family:${FINAL_CONFIG.style.fontFamily};width:100%; text-align:center;background:${FINAL_CONFIG.style.chart.backgroundColor};${FINAL_CONFIG.responsive ? 'height: 100%' : ''}`"
        @mouseenter="() => setUserOptionsVisibility(true)" @mouseleave="() => setUserOptionsVisibility(false)">

        <PenAndPaper 
            v-if="FINAL_CONFIG.userOptions.buttons.annotator" 
            :svgRef="svgRef"
            :backgroundColor="FINAL_CONFIG.style.chart.backgroundColor" 
            :color="FINAL_CONFIG.style.chart.color"
            :active="isAnnotator" @close="toggleAnnotator"
        >
            <template #annotator-action-close>
                <slot name="annotator-action-close"/>
            </template>
            <template #annotator-action-color="{ color }">
                <slot name="annotator-action-color" v-bind="{ color }"/>
            </template>
            <template #annotator-action-draw="{ mode }">
                <slot name="annotator-action-draw" v-bind="{ mode }"/>
            </template>
            <template #annotator-action-undo="{ disabled }">
                <slot name="annotator-action-undo" v-bind="{ disabled }"/>
            </template>
            <template #annotator-action-redo="{ disabled }">
                <slot name="annotator-action-redo" v-bind="{ disabled }"/>
            </template>
            <template #annotator-action-delete="{ disabled }">
                <slot name="annotator-action-delete" v-bind="{ disabled }"/>
            </template>
        </PenAndPaper>

        <div ref="noTitle" v-if="hasOptionsNoTitle" class="vue-data-ui-no-title-space"
            :style="`height:36px; width: 100%;background:transparent`" />

        <div ref="chartTitle" v-if="FINAL_CONFIG.style.chart.title.text"
            :style="`width:100%;background:transparent;padding-bottom:12px`">
            <Title :key="`title_${titleStep}`" :config="{
        title: {
            cy: 'gauge-div-title',
            ...FINAL_CONFIG.style.chart.title,
        },
        subtitle: {
            cy: 'gauge-div-subtitle',
            ...FINAL_CONFIG.style.chart.title.subtitle
        }
    }">
                <span v-if="FINAL_CONFIG.translations.base && FINAL_DATASET.base">
                    {{ FINAL_CONFIG.translations.base }}: {{ FINAL_DATASET.base }}
                </span>
            </Title>
        </div>

        <!-- OPTIONS -->
        <UserOptions 
            ref="details" 
            :key="`user_options_${step}`"
            v-if="FINAL_CONFIG.userOptions.show && isDataset && (keepUserOptionState ? true : userOptionsVisible)"
            :backgroundColor="FINAL_CONFIG.style.chart.backgroundColor" 
            :color="FINAL_CONFIG.style.chart.color"
            :isImaging="isImaging" 
            :isPrinting="isPrinting" 
            :uid="uid" 
            :hasXls="false"
            :hasPdf="FINAL_CONFIG.userOptions.buttons.pdf" 
            :hasImg="FINAL_CONFIG.userOptions.buttons.img"
            :hasSvg="FINAL_CONFIG.userOptions.buttons.svg"
            :hasFullscreen="FINAL_CONFIG.userOptions.buttons.fullscreen" 
            :isFullscreen="isFullscreen"
            :titles="{ ...FINAL_CONFIG.userOptions.buttonTitles }" 
            :chartElement="gaugeChart" 
            :callbacks="FINAL_CONFIG.userOptions.callbacks"
            :printScale="FINAL_CONFIG.userOptions.print.scale"
            :position="FINAL_CONFIG.userOptions.position" 
            :hasAnnotator="FINAL_CONFIG.userOptions.buttons.annotator"
            :isAnnotation="isAnnotator" 
            @toggleFullscreen="toggleFullscreen" 
            @generatePdf="generatePdf"
            @generateImage="onGenerateImage" 
            @generateSvg="generateSvg"
            @toggleAnnotator="toggleAnnotator" 
            :style="{
                visibility: keepUserOptionState ? userOptionsVisible ? 'visible' : 'hidden' : 'visible'
            }"
        >
            <template #menuIcon="{ isOpen, color }" v-if="$slots.menuIcon">
                <slot name="menuIcon" v-bind="{ isOpen, color }"/>
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
            <template v-if="$slots.optionFullscreen" template #optionFullscreen="{ toggleFullscreen, isFullscreen }">
                <slot name="optionFullscreen" v-bind="{ toggleFullscreen, isFullscreen }" />
            </template>
            <template v-if="$slots.optionAnnotator" #optionAnnotator="{ toggleAnnotator, isAnnotator }">
                <slot name="optionAnnotator" v-bind="{ toggleAnnotator, isAnnotator }" />
            </template>
        </UserOptions>

        <!-- CHART -->
        <svg
            ref="svgRef"
            :xmlns="XMLNS"
            :class="{ 'vue-data-ui-fullscreen--on': isFullscreen, 'vue-data-ui-fulscreen--off': !isFullscreen }"
            :viewBox="`0 0 ${svg.width <= 0 ? 10 : svg.width} ${svg.height <= 0 ? 10 : svg.height}`"
            :style="`max-width:100%;overflow:hidden !important;background:transparent;color:${FINAL_CONFIG.style.chart.color}`"
        >
            <PackageVersion />

            <!-- BACKGROUND SLOT -->
            <foreignObject v-if="$slots['chart-background']" :x="0" :y="0" :width="svg.width <= 0 ? 10 : svg.width"
                :height="svg.height <= 0 ? 10 : svg.height" :style="{
        pointerEvents: 'none'
    }">
                <slot name="chart-background" />
            </foreignObject>

            <defs>
                <radialGradient :id="`gradient_${uid}`" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                    <stop offset="0%" :stop-color="setOpacity('#FFFFFF', 1)" />
                    <stop offset="80%"
                        :stop-color="setOpacity('#FFFFFF', FINAL_CONFIG.style.chart.layout.track.gradientIntensity)" />
                    <stop offset="100%" :stop-color="setOpacity('#FFFFFF', 1)" />
                </radialGradient>
            </defs>

            <defs>
                <filter :id="`blur_${uid}`" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur in="SourceGraphic"
                        :stdDeviation="100 / FINAL_CONFIG.style.chart.layout.track.gradientIntensity" />
                </filter>
            </defs>

            <g v-if="$slots.pattern">
                <defs v-for="(arc, i) in arcs">
                    <slot name="pattern" v-bind="{ seriesIndex: i, patternId: `pattern_${uid}_${i}` }" />
                </defs>
            </g>

            <!-- ARC STEPS -->
            <path 
                v-for="(arc, i) in arcs" 
                data-cy="gauge-arc"
                :key="`arc_${i}`" 
                :d="arc.arcSlice"
                :fill="arc.color" 
                :stroke="FINAL_CONFIG.style.chart.backgroundColor" 
                stroke-linecap="round" 
            />

            <template v-if="$slots.pattern">
                <path 
                    v-for="(arc, i) in arcs" 
                    :key="`arc_${i}`" 
                    :d="arc.arcSlice"
                    :fill="`url(#pattern_${uid}_${i})`" 
                    :stroke="FINAL_CONFIG.style.chart.backgroundColor"
                    stroke-linecap="round" 
                />
            </template>

            <!-- GAUGE ARC INDICATOR-->
            <path
                data-cy="arc-indicator"
                v-if="FINAL_CONFIG.style.chart.layout.indicatorArc.show" 
                :d="gaugeArc"
                :fill="FINAL_CONFIG.style.chart.layout.indicatorArc.fill" 
            />

            <template
                v-if="FINAL_CONFIG.style.chart.layout.segmentNames.show && FINAL_CONFIG.style.chart.layout.segmentNames.curved">
                <!-- CIRCLE PATH AS BASE FOR CURVED LABELS -->
                <path v-for="(arc, i) in arcs" :id="`curve_${uid}_${i}`"
                    :d="`M ${pointer.x1},${pointer.y1} m -${pathRadii[i]},0 a ${pathRadii[i]},${pathRadii[i]} 0 1,1 ${2 * pathRadii[i]},0 a ${pathRadii[i]},${pathRadii[i]} 0 1,1 -${2 * pathRadii[i]},0`"
                    fill="transparent" />

                <!-- CURVED LABELS -->
                <text v-for="(arc, i) in arcs" 
                    data-cy="arc-label"
                    :fill="FINAL_CONFIG.style.chart.layout.segmentNames.useSerieColor ? arc.color : FINAL_CONFIG.style.chart.layout.segmentNames.color"
                    :font-size="labels_font_size"
                    :font-weight="FINAL_CONFIG.style.chart.layout.segmentNames.bold ? 'bold' : 'normal'"
                    text-anchor="middle">
                    <textPath :href="`#curve_${uid}_${i}`" :startOffset="curveLabelOffsets[i]">
                        {{ arc.name || '' }}
                    </textPath>
                </text>
            </template>

            <template
                v-if="FINAL_CONFIG.style.chart.layout.segmentNames.show && !FINAL_CONFIG.style.chart.layout.segmentNames.curved">
                <text
                    class="vue-ui-gauge-label-flat"
                    v-for="(arc, i) in labelArcs"
                    :text-anchor="calcMarkerOffsetX(arc, false, 12).anchor"
                    :fill="FINAL_CONFIG.style.chart.layout.segmentNames.useSerieColor ? arc.color : FINAL_CONFIG.style.chart.layout.segmentNames.color"
                    :font-size="labels_font_size"
                    :font-weight="FINAL_CONFIG.style.chart.layout.segmentNames.bold ? 'bold' : 'normal'"
                    v-html="createTSpansFromLineBreaksOnX({
                        content: String(arc.name ?? ''),
                        fontSize: labels_font_size,
                        fill: FINAL_CONFIG.style.chart.layout.segmentNames.useSerieColor ? arc.color : FINAL_CONFIG.style.chart.layout.segmentNames.color,
                        x: arc.center.endX,
                        y: arc.center.endY
                    })"    
                />
            </template>

            <!-- ARC STEPS GRADIENTS-->
            <template v-if="FINAL_CONFIG.style.chart.layout.track.useGradient">
                <path v-for="(arc, i) in gradientArcs" :data-cy="`gauge-arc-${i}`" :key="`arc_${i}`" :d="arc.arcSlice"
                    fill="#FFFFFF" stroke="none" stroke-linecap="round" :filter="`url(#blur_${uid})`" />
            </template>

            <template v-if="FINAL_CONFIG.style.chart.layout.segmentSeparators.show">
                <line data-cy="segment-separator-first-wrapper" v-bind="firstSeparator" :stroke="FINAL_CONFIG.style.chart.backgroundColor"
                    :stroke-width="FINAL_CONFIG.style.chart.layout.segmentSeparators.strokeWidth + 2"
                    stroke-linecap="round" />
                <line data-cy="segment-separator-first" v-bind="firstSeparator" :stroke="FINAL_CONFIG.style.chart.layout.segmentSeparators.stroke"
                    :stroke-width="FINAL_CONFIG.style.chart.layout.segmentSeparators.strokeWidth"
                    stroke-linecap="round" />
                <line data-cy="segment-separator-wrapper" v-for="segmentSeparator in segmentSeparators" v-bind="segmentSeparator"
                    :stroke="FINAL_CONFIG.style.chart.backgroundColor"
                    :stroke-width="FINAL_CONFIG.style.chart.layout.segmentSeparators.strokeWidth + 2"
                    stroke-linecap="round" />
                <line data-cy="segment-separator" v-for="segmentSeparator in segmentSeparators" v-bind="segmentSeparator"
                    :stroke="FINAL_CONFIG.style.chart.layout.segmentSeparators.stroke"
                    :stroke-width="FINAL_CONFIG.style.chart.layout.segmentSeparators.strokeWidth"
                    stroke-linecap="round" />
            </template>

            <!-- STEP MARKERS -->
            <g v-if="FINAL_CONFIG.style.chart.layout.markers.show">
                <text v-for="(arc, i) in arcs"
                    data-cy="arc-label-value"
                    :x="offsetFromCenterPoint({
                        centerX: pointer.x1,
                        centerY: arcSizeSource.base,
                        initX: arc.center.startX,
                        initY: arc.center.startY,
                        offset: svg.markerOffset
                    }).x" 
                    :y="offsetFromCenterPoint({
                        centerX: pointer.x1,
                        centerY: arcSizeSource.base,
                        initX: arc.center.startX,
                        initY: arc.center.startY,
                        offset: svg.markerOffset
                    }).y" 
                    :text-anchor="arc.center.startX < (pointer.x1 - 5) ? 'end' : arc.center.startX > (pointer.x1 + 5) ? 'start' : 'middle'"
                    :font-size="svg.labelFontSize * FINAL_CONFIG.style.chart.layout.markers.fontSizeRatio"
                    :font-weight="`${FINAL_CONFIG.style.chart.layout.markers.bold ? 'bold' : 'normal'}`"
                    :fill="FINAL_CONFIG.style.chart.layout.markers.color">
                    {{
                        applyDataLabel(
                            FINAL_CONFIG.style.chart.layout.markers.formatter,
                            arc.from,
                            dataLabel({
                                p: FINAL_CONFIG.style.chart.layout.markers.prefix,
                                v: arc.from,
                                s: FINAL_CONFIG.style.chart.layout.markers.suffix,
                                r: FINAL_CONFIG.style.chart.layout.markers.roundingValue
                            })
                        )
                    }}
                </text>
            </g>

            <text 
                v-if="FINAL_CONFIG.style.chart.layout.markers.show" 
                data-cy="arc-label-value-last" 
                :x="offsetFromCenterPoint({
                    centerX: svg.width / 2,
                    centerY: arcSizeSource.base,
                    initX: arcs.at(-1).endX,
                    initY: arcs.at(-1).endY,
                    offset: svg.markerOffset
                }).x" 
                :y="offsetFromCenterPoint({
                    centerX: svg.width / 2,
                    centerY: arcSizeSource.base,
                    initX: arcs.at(-1).endX,
                    initY: arcs.at(-1).endY,
                    offset: svg.markerOffset
                }).y" 
                text-anchor="start" 
                :font-size="svg.labelFontSize * FINAL_CONFIG.style.chart.layout.markers.fontSizeRatio"
                :font-weight="`${FINAL_CONFIG.style.chart.layout.markers.bold ? 'bold' : 'normal'}`"
                :fill="FINAL_CONFIG.style.chart.layout.markers.color">
                {{
                    applyDataLabel(
                        FINAL_CONFIG.style.chart.layout.markers.formatter,
                        max,
                        dataLabel({
                            p: FINAL_CONFIG.style.chart.layout.markers.prefix,
                            v: max,
                            s: FINAL_CONFIG.style.chart.layout.markers.suffix,
                            r: FINAL_CONFIG.style.chart.layout.markers.roundingValue
                        })
                    )
                }}
            </text>

            <!-- GAUGE POINTER -->
            <template v-if="FINAL_CONFIG.style.chart.layout.pointer.show">
                <g v-if="FINAL_CONFIG.style.chart.layout.pointer.type === 'rounded'">
                    <line data-cy="gauge-pointer-border" v-if="!isNaN(pointer.x2)" :x1="pointer.x1" :y1="pointer.y1"
                        :x2="pointer.x2" :y2="pointer.y2" :stroke="FINAL_CONFIG.style.chart.layout.pointer.stroke"
                        :stroke-width="svg.pointerStrokeWidth" stroke-linecap="round" />
                    <line data-cy="gauge-pointer" v-if="!isNaN(pointer.x2)" :x1="pointer.x1" :y1="pointer.y1"
                        :x2="pointer.x2" :y2="pointer.y2"
                        :stroke="FINAL_CONFIG.style.chart.layout.pointer.useRatingColor ? ratingColor : FINAL_CONFIG.style.chart.layout.pointer.color"
                        stroke-linecap="round" :stroke-width="svg.pointerStrokeWidth * 0.7" />
                    <line data-cy="gauge-pointer"
                        v-if="!isNaN(pointer.x2) && FINAL_CONFIG.style.chart.layout.track.useGradient" :x1="pointer.x1"
                        :y1="pointer.y1" :x2="pointer.x2" :y2="pointer.y2" :stroke="'white'" stroke-linecap="round"
                        :stroke-width="svg.pointerStrokeWidth * 0.3" :filter="`url(#blur_${uid})`" />
                </g>
                <g v-else>
                    <path 
                        data-cy="gauge-pointer"
                        v-if="pointyPointerPath" 
                        :d="pointyPointerPath"
                        :fill="FINAL_CONFIG.style.chart.layout.pointer.useRatingColor ? ratingColor : FINAL_CONFIG.style.chart.layout.pointer.color"
                        :stroke="FINAL_CONFIG.style.chart.layout.pointer.stroke"
                        :stroke-width="FINAL_CONFIG.style.chart.layout.pointer.circle.strokeWidth"
                        stroke-linejoin="round" 
                    />
                </g>
                <circle 
                    data-cy="gauge-pointer-circle" 
                    :cx="svg.width / 2" 
                    :cy="arcSizeSource.base"
                    :fill="FINAL_CONFIG.style.chart.layout.pointer.circle.color"
                    :r="svg.pointerRadius <= 0 ? 0.0001 : svg.pointerRadius"
                    :stroke-width="FINAL_CONFIG.style.chart.layout.pointer.circle.strokeWidth"
                    :stroke="FINAL_CONFIG.style.chart.layout.pointer.circle.stroke" 
                />
            </template>

            <!-- GAUGE RATING -->
            <text 
                data-cy="gauge-score" 
                v-if="FINAL_CONFIG.style.chart.legend.show" 
                :x="svg.width / 2"
                :y="arcSizeSource.ratingBase" 
                text-anchor="middle" 
                :font-size="svg.legendFontSize" 
                font-weight="bold"
                :fill="FINAL_CONFIG.style.chart.legend.useRatingColor ? ratingColor : FINAL_CONFIG.style.chart.legend.color"
            >
                {{ 
                applyDataLabel(
                    FINAL_CONFIG.style.chart.legend.formatter,
                    activeRating,
                    dataLabel({
                        p: FINAL_CONFIG.style.chart.legend.prefix + (FINAL_CONFIG.style.chart.legend.showPlusSymbol &&
                            activeRating > 0
                            ? '+' : ''),
                        v: activeRating,
                        s: FINAL_CONFIG.style.chart.legend.suffix,
                        r: FINAL_CONFIG.style.chart.legend.roundingValue
                    }))
                }}
            </text>
            <slot name="svg" :svg="{
                ...svg,
                isPrintingImg: isPrinting | isImaging | isCallbackImaging,
                isPrintingSvg: isCallbackSvg,
            }" />
        </svg>

        <div v-if="$slots.watermark" class="vue-data-ui-watermark">
            <slot name="watermark" v-bind="{ isPrinting: isPrinting || isImaging || isCallbackImaging || isCallbackSvg }" />
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
@import "../vue-data-ui.css";

.vue-ui-gauge * {
    transition: unset;
}

.vue-ui-gauge {
    user-select: none;
    position: relative;
}

.vue-ui-gauge .vue-ui-gauge-label {
    align-items: center;
    display: flex;
    flex-direction: column;
    height: 100%;
    justify-content: center;
    text-align: center;
    width: 100%;
}

.vue-ui-gauge-legend {
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    justify-content: center;
    column-gap: 18px;
}

.vue-ui-gauge-legend-item {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    cursor: pointer;
    height: 24px;
}

.vue-ui-gauge-tooltip {
    border: 1px solid #e1e5e8;
    border-radius: 4px;
    box-shadow: 0 6px 12px -6px rgba(0, 0, 0, 0.2);
    max-width: 300px;
    position: fixed;
    padding: 12px;
    z-index: 1;
}
</style>