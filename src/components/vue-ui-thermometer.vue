<script setup>
import { 
    computed, 
    defineAsyncComponent, 
    onMounted, 
    ref, 
    toRefs,
    watch, 
} from "vue";
import {
    applyDataLabel,
    checkNaN,
    convertColorToHex, 
    convertCustomPalette, 
    createUid, 
    dataLabel,
    error,
    getMissingDatasetAttributes,
    objectIsEmpty,
    palette,
    setOpacity,
    themePalettes,
    treeShake,
    XMLNS
} from "../lib.js";
import { throttle } from "../canvas-lib.js";
import { useConfig } from "../useConfig";
import { useLoading } from "../useLoading.js";
import { usePrinter } from "../usePrinter";
import { useSvgExport } from "../useSvgExport.js";
import { useNestedProp } from "../useNestedProp";
import { useResponsive } from "../useResponsive.js";
import { useThemeCheck } from "../useThemeCheck.js";
import { useUserOptionState } from "../useUserOptionState";
import { useChartAccessibility } from "../useChartAccessibility.js";
import { useAutoSizeLabelsInsideViewbox } from "../useAutoSizeLabelsInsideViewbox.js";
import themes from "../themes/vue_ui_thermometer.json";
import Title from "../atoms/Title.vue"; // Must be ready in responsive mode
import img from "../img.js";
import BaseScanner from "../atoms/BaseScanner.vue";

const PackageVersion = defineAsyncComponent(() => import('../atoms/PackageVersion.vue'));
const PenAndPaper = defineAsyncComponent(() => import('../atoms/PenAndPaper.vue'));
const UserOptions = defineAsyncComponent(() => import('../atoms/UserOptions.vue'));

const { vue_ui_thermometer: DEFAULT_CONFIG } = useConfig();
const { isThemeValid, warnInvalidTheme } = useThemeCheck();

const props = defineProps({
    dataset: {
        type: Object,
        default() {
            return {}
        }
    },
    config: {
        type: Object,
        default() {
            return {}
        }
    }
});

const uid = ref(createUid());
const thermoChart = ref(null);
const step = ref(0);
const titleStep = ref(0);
const chartTitle = ref(null);
const source = ref(null);
const resizeObserver = ref(null);
const observedEl = ref(null);

const isDataset = computed(() => {
    return !!props.dataset && Object.keys(props.dataset).length;
});

onMounted(() => {
    prepareChart();
});

const FINAL_CONFIG = ref(prepareConfig());
const baseWidth = ref(FINAL_CONFIG.value.style.chart.thermometer.width);
const HEIGHT = ref(FINAL_CONFIG.value.style.chart.height);
const WIDTH = ref(FINAL_CONFIG.value.style.chart.width);

const { loading, FINAL_DATASET } = useLoading({
    ...toRefs(props),
    FINAL_CONFIG,
    prepareConfig,
    skeletonDataset: { value: 0, from: -100, to: 100, steps: 20, colors: { from: '#A1A1A1', to: '#CACACA' } },
    skeletonConfig: treeShake({
        defaultConfig: FINAL_CONFIG.value,
        userConfig: {
            userOptions: { show: false },
            style: {
                chart: {
                    animation: { use: false },
                    backgroundColor: '#99999930',
                    graduations: {
                        stroke: '#6A6A6A'
                    }
                }
            }
        }
    })
});

const debug = computed(() => !!FINAL_CONFIG.value.debug);

function prepareChart() {
    if(objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiThermometer',
            type: 'dataset',
            debug: debug.value
        })
    } else {
        getMissingDatasetAttributes({
            datasetObject: props.dataset,
            requiredAttributes: ['value', 'from', 'to']
        }).forEach(attr => {
            error({
                componentName: 'VueUiThermometer',
                type: 'datasetAttribute',
                property: attr,
                debug: debug.value
            });
        });
    }

    if (FINAL_CONFIG.value.responsive) {
        const handleResize = throttle(() => {
            const { width, height } = useResponsive({
                chart: thermoChart.value,
                title: FINAL_CONFIG.value.style.title.text ? chartTitle.value : null,
                source: source.value
            });

            requestAnimationFrame(() => {
                HEIGHT.value = Math.max(0.1, height - 12);
                WIDTH.value = width;
                autoSizeLabels();
            });
        });

        if (resizeObserver.value) {
            if (observedEl.value) {
                resizeObserver.value.unobserve(observedEl.value);
            }
            resizeObserver.value.disconnect();
        }

        resizeObserver.value = new ResizeObserver(handleResize);
        observedEl.value = thermoChart.value;
        resizeObserver.value.observe(observedEl.value);
    }
    autoSizeLabels();
}

const { userOptionsVisible, setUserOptionsVisibility, keepUserOptionState } = useUserOptionState({ config: FINAL_CONFIG.value });
const { svgRef } = useChartAccessibility({ config: FINAL_CONFIG.value.style.title });

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

watch(() => props.config, (_newCfg) => {
    FINAL_CONFIG.value = prepareConfig();
    userOptionsVisible.value = !FINAL_CONFIG.value.userOptions.showOnChartHover;
    baseWidth.value = FINAL_CONFIG.value.style.chart.thermometer.width;
    HEIGHT.value = FINAL_CONFIG.value.style.chart.height;
    WIDTH.value = FINAL_CONFIG.value.style.chart.width;
    prepareChart();
    titleStep.value += 1;
}, { deep: true });

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `thermometer__${uid.value}`,
    fileName: FINAL_CONFIG.value.style.title.text || 'vue-ui-thermometer',
    options: FINAL_CONFIG.value.userOptions.print
});

const hasOptionsNoTitle = computed(() => {
    return FINAL_CONFIG.value.userOptions.show && !FINAL_CONFIG.value.style.title.text;
});

const customPalette = computed(() => {
    return convertCustomPalette(FINAL_CONFIG.value.customPalette);
})

const steps = computed(() => {
    return FINAL_DATASET.value.steps || 10;
})

function generateColorRange(startColor, endColor, steps) {
    const colors = [];

    const start = parseColor(startColor);
    const end = parseColor(endColor);

    for (let i = 0; i < steps; i++) {
        const redValue = interpolate(start.red, end.red, i, steps);
        const greenValue = interpolate(start.green, end.green, i, steps);
        const blueValue = interpolate(start.blue, end.blue, i, steps);

        const hexColor = `#${toHex(redValue)}${toHex(greenValue)}${toHex(blueValue)}`;
        colors.push(hexColor);
    }

    return colors;
}

function parseColor(color) {
    const hex = color.slice(1);
    return {
        red: parseInt(hex.slice(0, 2), 16),
        green: parseInt(hex.slice(2, 4), 16),
        blue: parseInt(hex.slice(4, 6), 16),
    };
}

function interpolate(start, end, step, totalSteps) {
  return Math.round(start + (end - start) * step / totalSteps);
}

function toHex(value) {
    return value.toString(16).padStart(2, '0');
}

const drawingArea = computed(() => {
    const width = Math.max(0.1, WIDTH.value);
    const height = Math.max(0.1, HEIGHT.value);
    const padding = FINAL_CONFIG.value.style.chart.padding;
    return {
        width: width,
        left: (width / 2) - FINAL_CONFIG.value.style.chart.thermometer.width / 2,
        right:(width / 2) + FINAL_CONFIG.value.style.chart.thermometer.width / 2,
        top: padding.top,
        bottom: height - padding.bottom - padding.top,
        height: height,
        thermoHeight: height - padding.top - padding.bottom,
        thermoWidth: FINAL_CONFIG.value.style.chart.thermometer.width,
    }
});

const svg = computed(() => {
    return drawingArea.value;
});

const temperature = computed(() => {
    const from = checkNaN(FINAL_DATASET.value.from) < 0 ? Math.abs(checkNaN(FINAL_DATASET.value.from)) : checkNaN(FINAL_DATASET.value.from);
    const to = checkNaN(FINAL_DATASET.value.to) < 0 ? Math.abs(checkNaN(FINAL_DATASET.value.to)) : checkNaN(FINAL_DATASET.value.to);
    let max = 0;
    if (checkNaN(FINAL_DATASET.value.to) > 0) {
        max = from + to;
    } else {
        if (from > to) {
            max = from - to;
        } else {
            max = to - from;
        }
    }
    return (1 - (Math.abs(checkNaN(FINAL_DATASET.value.from)) + checkNaN(FINAL_DATASET.value.value)) / max )* (drawingArea.value.thermoHeight)
})

const cssTemp = computed(() => {
    return `${temperature.value}px`;
});

const cssHeight = computed(() => {
    return `${drawingArea.value.thermoHeight}px`;
});

const cssSpeed = computed(() => {
    return `${FINAL_CONFIG.value.style.chart.animation.speedMs}ms`;
});

const colors = computed(() => {
    if (!FINAL_DATASET.value.colors) {
        return generateColorRange(customPalette.value[1] || palette[1], customPalette.value[0] || palette[0], (steps.value )|| 10)
    } else {
        if (!FINAL_DATASET.value.colors.from) {
            return generateColorRange(customPalette.value[0] || palette[0], convertColorToHex(FINAL_DATASET.value.colors.to), (steps.value )|| 10)
        }
        if (!FINAL_DATASET.value.colors.to) {
            return generateColorRange(convertColorToHex(FINAL_DATASET.value.colors.from), customPalette.value[1] || palette[1], (steps.value )|| 10)
        }
    }
    return generateColorRange(convertColorToHex(FINAL_DATASET.value.colors.from) , convertColorToHex(FINAL_DATASET.value.colors.to), (steps.value )|| 10)
});

const graduations = computed(() => {
    const grads = [];
    let colorIndex = 0;
    const usableHeight = drawingArea.value.thermoHeight;
    for (let i = 0; i < usableHeight-1; i += (usableHeight / steps.value)) {
        grads.push({
            x: drawingArea.value.left,
            y: drawingArea.value.top + i,
            qYLess: drawingArea.value.top + i + (usableHeight / steps.value / 4),
            halfY: drawingArea.value.top + i + (usableHeight / steps.value / 2),
            qYMore: drawingArea.value.top + i + ((usableHeight / steps.value / 4) * 3),
            color: colors.value[colorIndex],
            height: Math.max(0.1, usableHeight / steps.value)
        });
        colorIndex += 1;
    }
    return grads;
});

const isFullscreen = ref(false)
function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
}

const isAnnotator = ref(false);
function toggleAnnotator() {
    isAnnotator.value = !isAnnotator.value;
}

async function getImage({ scale = 2} = {}) {
    if (!thermoChart.value) return;
    const { width, height } = thermoChart.value.getBoundingClientRect();
    const aspectRatio = width / height;
    const { imageUri, base64 } = await img({ domElement: thermoChart.value, base64: true, img: true, scale })
    return { 
        imageUri, 
        base64, 
        title: FINAL_CONFIG.value.style.title.text,
        width,
        height,
        aspectRatio
    }
}

const label_size = computed({
    get: () => FINAL_CONFIG.value.style.chart.label.fontSize,
    set: v => v
});

const { autoSizeLabels } = useAutoSizeLabelsInsideViewbox({
    svgRef,
    fontSize: FINAL_CONFIG.value.style.chart.label.fontSize,
    minFontSize: FINAL_CONFIG.value.style.chart.label.minFontSize,
    sizeRef: label_size,
    labelClass: '.vue-ui-thermometer-label'
});

const svgBg = computed(() => FINAL_CONFIG.value.style.chart.backgroundColor);
const svgTitle = computed(() => FINAL_CONFIG.value.style.title);

const { exportSvg, getSvg } = useSvgExport({
    svg: svgRef,
    title: svgTitle,
    backgroundColor: svgBg
});

async function generateSvg({ isCb }) {
    if (isCb) {
        const { blob, url, text, dataUrl } = await getSvg();
        FINAL_CONFIG.value.userOptions.callbacks.svg({ blob, url, text, dataUrl })

    } else {
        exportSvg();
    }
}

defineExpose({
    getImage,
    generatePdf,
    generateImage,
    generateSvg,
    toggleAnnotator,
    toggleFullscreen
})

</script>

<template>
    <div ref="thermoChart" :class="`vue-data-ui-component vue-ui-thermometer ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''}`" :style="`width:100%;background:${FINAL_CONFIG.style.chart.backgroundColor};color:${FINAL_CONFIG.style.chart.color};font-family:${FINAL_CONFIG.style.fontFamily}`" :id="`thermometer__${uid}`" @mouseenter="() => setUserOptionsVisibility(true)" @mouseleave="() => setUserOptionsVisibility(false)">
        <PenAndPaper
            v-if="FINAL_CONFIG.userOptions.buttons.annotator"
            :svgRef="svgRef"
            :backgroundColor="FINAL_CONFIG.style.chart.backgroundColor"
            :color="FINAL_CONFIG.style.chart.color"
            :active="isAnnotator"
            @close="toggleAnnotator"
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

        <div
            ref="noTitle"
            v-if="hasOptionsNoTitle" 
            class="vue-data-ui-no-title-space" 
            :style="`height:36px; width: 100%;background:transparent`"
        />

        <!-- TITLE AS DIV -->
        <div ref="chartTitle" v-if="FINAL_CONFIG.style.title.text" :style="`width:100%`">
            <Title
                :key="`title_${titleStep}`"
                :config="{
                    title: {
                        cy: 'thermometer-div-title',
                        ...FINAL_CONFIG.style.title
                    },
                    subtitle: {
                        cy: 'thermometer-div-subtitle',
                        ...FINAL_CONFIG.style.title.subtitle
                    }
                }"
            />
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
            :hasPdf="FINAL_CONFIG.userOptions.buttons.pdf"
            :hasImg="FINAL_CONFIG.userOptions.buttons.img"
            :hasSvg="FINAL_CONFIG.userOptions.buttons.svg"
            :hasFullscreen="FINAL_CONFIG.userOptions.buttons.fullscreen"
            :hasXls="false"
            :isFullscreen="isFullscreen"
            :titles="{ ...FINAL_CONFIG.userOptions.buttonTitles }"
            :chartElement="thermoChart"
            :position="FINAL_CONFIG.userOptions.position"
            :hasAnnotator="FINAL_CONFIG.userOptions.buttons.annotator"
            :isAnnotation="isAnnotator"
            :callbacks="FINAL_CONFIG.userOptions.callbacks"
            :printScale="FINAL_CONFIG.userOptions.print.scale"
            @toggleFullscreen="toggleFullscreen"
            @generatePdf="generatePdf"
            @generateImage="generateImage"
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
                <slot name="optionFullscreen" v-bind="{ toggleFullscreen, isFullscreen }"/>
            </template>
            <template v-if="$slots.optionAnnotator" #optionAnnotator="{ toggleAnnotator, isAnnotator }">
                <slot name="optionAnnotator" v-bind="{ toggleAnnotator, isAnnotator }" />
            </template>
        </UserOptions>

        <svg
            ref="svgRef"
            :xmlns="XMLNS" 
            :class="{ 'vue-data-ui-fullscreen--on': isFullscreen, 'vue-data-ui-fulscreen--off': !isFullscreen }" 
            width="100%" 
            :viewBox="`0 0 ${drawingArea.width} ${drawingArea.height}`" 
            :style="`background:transparent`"
        >
            <PackageVersion />

            <!-- BACKGROUND SLOT -->
            <foreignObject 
                v-if="$slots['chart-background']"
                :x="0"
                :y="0"
                :width="drawingArea.width"
                :height="drawingArea.height"
                :style="{
                    pointerEvents: 'none'
                }"
            >
                <slot name="chart-background"/>
            </foreignObject>
            
            <defs>
                <clipPath :id="`vueUiPill-${uid}`" clipPathUnits="userSpaceOnUse">
                    <rect
                        :x="drawingArea.left"
                        :y="drawingArea.top"
                        :width="drawingArea.thermoWidth"
                        :height="drawingArea.thermoHeight"
                        :rx="drawingArea.thermoWidth / 2"
                        :ry="drawingArea.thermoWidth / 2"
                    />
                </clipPath>
                <linearGradient 
                    v-for="(graduation, i) in graduations" :id="`vueUiThermometerGradient_${i}_${uid}`"
                    x1="0%" y1="0%" x2="100%" y2="0%"
                >
                    <stop offset="0%" :stop-color="graduation.color"/>
                    <stop offset="50%" :stop-color="setOpacity(graduation.color, 100 - FINAL_CONFIG.style.chart.graduations.gradient.intensity)"/>
                    <stop offset="100%" :stop-color="graduation.color"/>
                </linearGradient>
            </defs>

            <g :clip-path="`url(#vueUiPill-${uid})`">
                <rect
                    data-cy="pill-underlayer"
                    :x="drawingArea.left"
                    :y="drawingArea.top"
                    :height="drawingArea.thermoHeight"
                    :width="drawingArea.thermoWidth"
                    fill="#FFFFFF"
                />
                <g v-for="(graduation, i) in graduations" :key="`graduation_${i}`">
                    <rect
                        data-cy="pill-graduation-rect"
                        :x="graduation.x"
                        :y="graduation.y"
                        :height="graduation.height"
                        :width="drawingArea.thermoWidth"
                        :fill="FINAL_CONFIG.style.chart.graduations.gradient.show ? `url(#vueUiThermometerGradient_${i}_${uid})` : graduation.color"
                        shape-rendering="crispEdges"
                    />

                    <!-- GRADUATIONS LEFT -->                    
                    <line
                        data-cy="graduation-left"
                        v-if="FINAL_CONFIG.style.chart.graduations.show && ['both', 'left'].includes(FINAL_CONFIG.style.chart.graduations.sides)"
                        :x1="graduation.x"
                        :x2="graduation.x + 10"
                        :y1="graduation.y"
                        :y2="graduation.y"
                        :stroke-width="FINAL_CONFIG.style.chart.graduations.strokeWidth"
                        :stroke="FINAL_CONFIG.style.chart.graduations.stroke"
                        stroke-linecap="round"
                    />
                    <template v-if="FINAL_CONFIG.style.chart.graduations.showIntermediate">
                        <line
                            data-cy="graduation-left-intermediary"
                            v-if="FINAL_CONFIG.style.chart.graduations.show && ['both', 'left'].includes(FINAL_CONFIG.style.chart.graduations.sides)"
                            :x1="graduation.x"
                            :x2="graduation.x + 5"
                            :y1="graduation.halfY"
                            :y2="graduation.halfY"
                            :stroke-width="FINAL_CONFIG.style.chart.graduations.strokeWidth / 2"
                            :stroke="FINAL_CONFIG.style.chart.graduations.stroke"
                            stroke-linecap="round"
                        />                    
                        <line 
                            data-cy="graduation-left-intermediary"
                            v-if="FINAL_CONFIG.style.chart.graduations.show && ['both', 'left'].includes(FINAL_CONFIG.style.chart.graduations.sides)"
                            :x1="graduation.x"
                            :x2="graduation.x + 2.5"
                            :y1="graduation.qYLess"
                            :y2="graduation.qYLess"
                            :stroke-width="FINAL_CONFIG.style.chart.graduations.strokeWidth / 2"
                            :stroke="FINAL_CONFIG.style.chart.graduations.stroke"
                            stroke-linecap="round"
                        />
                        <line
                            data-cy="graduation-left-intermediary"
                            v-if="FINAL_CONFIG.style.chart.graduations.show && ['both', 'left'].includes(FINAL_CONFIG.style.chart.graduations.sides)"
                            :x1="graduation.x"
                            :x2="graduation.x + 2.5"
                            :y1="graduation.qYMore"
                            :y2="graduation.qYMore"
                            :stroke-width="FINAL_CONFIG.style.chart.graduations.strokeWidth / 2"
                            :stroke="FINAL_CONFIG.style.chart.graduations.stroke"
                            stroke-linecap="round"
                        />
                    </template>                    

                    <!-- GRADUATIONS RIGHT -->                    
                    <line 
                        data-cy="graduation-right"
                        v-if="FINAL_CONFIG.style.chart.graduations.show && ['both', 'right'].includes(FINAL_CONFIG.style.chart.graduations.sides)"
                        :x1="drawingArea.right"
                        :x2="drawingArea.right - 10"
                        :y1="graduation.y"
                        :y2="graduation.y"
                        :stroke-width="FINAL_CONFIG.style.chart.graduations.strokeWidth"
                        :stroke="FINAL_CONFIG.style.chart.graduations.stroke"
                        stroke-linecap="round"
                    />          
                    <template v-if="FINAL_CONFIG.style.chart.graduations.showIntermediate">
                        <line
                            data-cy="graduation-right-intermediary"
                            v-if="FINAL_CONFIG.style.chart.graduations.show && ['both', 'right'].includes(FINAL_CONFIG.style.chart.graduations.sides)"
                            :x1="drawingArea.right"
                            :x2="drawingArea.right - 5"
                            :y1="graduation.halfY"
                            :y2="graduation.halfY"
                            :stroke-width="FINAL_CONFIG.style.chart.graduations.strokeWidth / 2"
                            :stroke="FINAL_CONFIG.style.chart.graduations.stroke"
                            stroke-linecap="round"
                        />                    
                        <line
                            data-cy="graduation-right-intermediary"
                            v-if="FINAL_CONFIG.style.chart.graduations.show && ['both', 'right'].includes(FINAL_CONFIG.style.chart.graduations.sides)"
                            :x1="drawingArea.right"
                            :x2="drawingArea.right - 2.5"
                            :y1="graduation.qYLess"
                            :y2="graduation.qYLess"
                            :stroke-width="FINAL_CONFIG.style.chart.graduations.strokeWidth / 2"
                            :stroke="FINAL_CONFIG.style.chart.graduations.stroke"
                            stroke-linecap="round"
                        />                    
                        <line
                            data-cy="graduation-right-intermediary"
                            v-if="FINAL_CONFIG.style.chart.graduations.show && ['both', 'right'].includes(FINAL_CONFIG.style.chart.graduations.sides)"
                            :x1="drawingArea.right"
                            :x2="drawingArea.right - 2.5"
                            :y1="graduation.qYMore"
                            :y2="graduation.qYMore"
                            :stroke-width="FINAL_CONFIG.style.chart.graduations.strokeWidth / 2"
                            :stroke="FINAL_CONFIG.style.chart.graduations.stroke"
                            stroke-linecap="round"
                        />                    
                    </template>           
                </g>
                <rect
                    data-cy="temperature-rect"
                    :class="{'vue-ui-thermometer-temperature': FINAL_CONFIG.style.chart.animation.use }"
                    :x="drawingArea.left"
                    :y="drawingArea.top"
                    :height="temperature"
                    :width="drawingArea.thermoWidth"
                    fill="#FFFFFF66"
                />
            </g>
            <g v-if="FINAL_CONFIG.style.chart.label.show">
                <rect 
                    v-if="loading"
                    :x="drawingArea.left - 60"
                    :y="temperature + drawingArea.top - label_size / 2"
                    :width="50"
                    :height="label_size"
                    fill="#6A6A6A40"
                    rx="3"
                />
                <text
                    v-else
                    data-cy="temperature-label"
                    :class="{'vue-ui-thermometer-temperature-value': FINAL_CONFIG.style.chart.animation.use, 'vue-ui-thermometer-label': true }"
                    :y="temperature + drawingArea.top + (label_size / 3)"
                    :x="drawingArea.left - 10"
                    text-anchor="end"
                    :fill="FINAL_CONFIG.style.chart.label.color"
                    :font-size="label_size"
                    :font-weight="FINAL_CONFIG.style.chart.label.bold ? 'bold' : 'normal'"
                >
                    {{ applyDataLabel(
                        FINAL_CONFIG.style.chart.label.formatter,
                        dataset.value,
                        dataLabel({
                            p: FINAL_CONFIG.style.chart.label.prefix, 
                            v: dataset.value, 
                            s: FINAL_CONFIG.style.chart.label.suffix, 
                            r: FINAL_CONFIG.style.chart.label.rounding
                        }),
                        { datapoint: dataset }
                        )
                    }}
                </text>
            </g>
            <slot name="svg" :svg="svg"/>
        </svg>

        <div v-if="$slots.watermark" class="vue-data-ui-watermark">
            <slot name="watermark" v-bind="{ isPrinting: isPrinting || isImaging }"/>
        </div>

        <div v-if="$slots.source" ref="source" dir="auto">
            <slot name="source" />
        </div>

        <!-- v3 Skeleton loader -->
        <BaseScanner v-if="loading" />
    </div>
</template>

<style scoped>
@import "../vue-data-ui.css";

.vue-ui-thermometer {
    position: relative;
}
rect.vue-ui-thermometer-temperature {
    animation: vue-ui-thermometer-temp v-bind(cssSpeed) ease-in-out;
    transform-origin: center;
}

text.vue-ui-thermometer-temperature-value {
    opacity:0;
    animation: vue-ui-thermometer-value v-bind(cssSpeed) ease-in-out forwards;
}

@keyframes vue-ui-thermometer-value {
    0% {
        opacity:0;
    }
    100% {
        opacity: 1;
    }
}

@keyframes vue-ui-thermometer-temp {
    0% {
        height: v-bind(cssHeight);
        clip-path: url(#vueUiPill);
    }
    50% {
        height: calc(v-bind(cssTemp) + 10px);
        clip-path: url(#vueUiPill);
    }
    60% {
        height: calc(v-bind(cssTemp) - 5px);
        clip-path: url(#vueUiPill);
    }
    70% {
        height: calc(v-bind(cssTemp) + 4px);
        clip-path: url(#vueUiPill);
    }
    80% {
        height: calc(v-bind(cssTemp) - 3px);
        clip-path: url(#vueUiPill);
    }
    90% {
        height: calc(v-bind(cssTemp) + 2px);
    }
    95% {
        height: calc(v-bind(cssTemp) - 1px);
    }
    100% {
        height: v-bind(cssTemp);
    }
}
</style>