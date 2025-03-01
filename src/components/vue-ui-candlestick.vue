<script setup>
import { ref, computed, onMounted, nextTick, onBeforeUnmount, watch } from "vue";
import { 
    calculateNiceScale, 
    canShowValue, 
    checkNaN, 
    createCsvContent, 
    createUid, 
    downloadCsv,
    error,
    functionReturnsString,
    hasDeepProperty,
    isFunction,
    objectIsEmpty,
    setOpacity,
    shiftHue,
    translateSize,
    XMLNS
} from "../lib";
import { throttle } from "../canvas-lib";
import Title from "../atoms/Title.vue";
import UserOptions from "../atoms/UserOptions.vue";
import themes from "../themes.json";
import Tooltip from "../atoms/Tooltip.vue";
import DataTable from "../atoms/DataTable.vue";
import Skeleton from "./vue-ui-skeleton.vue";
import Slicer from "../atoms/Slicer.vue";
import Accordion from "./vue-ui-accordion.vue";
import { useNestedProp } from "../useNestedProp";
import { usePrinter } from "../usePrinter";
import { useResponsive } from "../useResponsive";
import { useConfig } from "../useConfig";
import PackageVersion from "../atoms/PackageVersion.vue";
import PenAndPaper from "../atoms/PenAndPaper.vue";
import { useUserOptionState } from "../useUserOptionState";
import { useChartAccessibility } from "../useChartAccessibility";

const { vue_ui_candlestick: DEFAULT_CONFIG } = useConfig()

const props = defineProps({
    config: {
        type: Object,
        default() {
            return {}
        }
    },
    dataset: {
        type: Array,
        default() {
            return []
        }
    }
});

const isDataset = computed(() => {
    return !!props.dataset && props.dataset.length;
})

const uid = ref(createUid());
const details = ref(null);
const isTooltip = ref(false);
const tooltipContent = ref("");
const hoveredIndex = ref(undefined);
const step = ref(0);
const candlestickChart = ref(null);
const chartTitle = ref(null);
const chartLegend = ref(null);
const chartSlicer = ref(null);
const source = ref(null);
const noTitle = ref(null);
const slicerStep = ref(0);
const tableStep = ref(0);
const titleStep = ref(0);

const FINAL_CONFIG = computed({
    get: () => {
        return prepareConfig();
    },
    set: (newCfg) => {
        return newCfg
    }
});

const { userOptionsVisible, setUserOptionsVisibility, keepUserOptionState } = useUserOptionState({ config: FINAL_CONFIG.value });
const { svgRef } = useChartAccessibility({ config: FINAL_CONFIG.value.style.title });

function prepareConfig() {
    const mergedConfig = useNestedProp({
        userConfig: props.config,
        defaultConfig: DEFAULT_CONFIG
    });

    let finalConfig = {};

    if (mergedConfig.theme) {
        finalConfig = {
            ...useNestedProp({
                userConfig: themes.vue_ui_candlestick[mergedConfig.theme] || props.config,
                defaultConfig: mergedConfig
            }),
        }
    } else {
        finalConfig = mergedConfig;
    }

    // ------------------------------ OVERRIDES -----------------------------------

    if (props.config && hasDeepProperty(props.config, 'style.zoom.startIndex')) {
        finalConfig.style.zoom.startIndex = props.config.style.zoom.startIndex;
    } else {
        finalConfig.style.zoom.startIndex = null;
    }

    if (props.config && hasDeepProperty(props.config, 'style.zoom.endIndex')) {
        finalConfig.style.zoom.endIndex = props.config.style.zoom.endIndex;
    } else {
        finalConfig.style.zoom.endIndex = null;
    }

    // ----------------------------------------------------------------------------

    return finalConfig;
}

watch(() => props.config, (_newCfg) => {
    FINAL_CONFIG.value = prepareConfig();
    userOptionsVisible.value = !FINAL_CONFIG.value.userOptions.showOnChartHover;
    prepareChart();
    slicerStep.value += 1;
    titleStep.value += 1;
    tableStep.value += 1;

    // Reset mutable config
    mutableConfig.value.showTable = FINAL_CONFIG.value.table.show;
    mutableConfig.value.showTooltip = FINAL_CONFIG.value.style.tooltip.show;
}, { deep: true });

watch(() => props.dataset, (newDs) => {
    slicer.value.start = 0;
    slicer.value.end = newDs.length
    slicerStep.value += 1;
}, { deep: true });

const svg = ref({
    height: FINAL_CONFIG.value.style.height,
    width: FINAL_CONFIG.value.style.width,
    xAxisFontSize: FINAL_CONFIG.value.style.layout.grid.xAxis.dataLabels.fontSize,
    yAxisFontSize: FINAL_CONFIG.value.style.layout.grid.yAxis.dataLabels.fontSize
})

const resizeObserver = ref(null);

onMounted(() => {
    prepareChart();
});

function prepareChart() {
    if(objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiCandlestick',
            type: 'dataset'
        })
    }

    if (FINAL_CONFIG.value.responsive) {
        const handleResize = throttle(() => {
            const { width, height } = useResponsive({
                chart: candlestickChart.value,
                title: FINAL_CONFIG.value.style.title.text ? chartTitle.value : null,
                slicer: chartSlicer.value,
                legend: chartLegend.value,
                source: source.value,
                noTitle: noTitle.value
            });

            requestAnimationFrame(() => {
                svg.value.width = width;
                svg.value.height = height;
                svg.value.xAxisFontSize = translateSize({
                    relator: Math.min(width, height),
                    adjuster: FINAL_CONFIG.value.style.width,
                    source: FINAL_CONFIG.value.style.layout.grid.xAxis.dataLabels.fontSize,
                    threshold: 6,
                    fallback: 6
                });
                svg.value.yAxisFontSize = translateSize({
                    relator: Math.min(width, height),
                    adjuster: FINAL_CONFIG.value.style.width,
                    source: FINAL_CONFIG.value.style.layout.grid.yAxis.dataLabels.fontSize,
                    threshold: 6,
                    fallback: 6
                });
            });
        });

        resizeObserver.value = new ResizeObserver(handleResize);
        resizeObserver.value.observe(candlestickChart.value.parentNode);
    }
    setupSlicer();
}

onBeforeUnmount(() => {
    if (resizeObserver.value) resizeObserver.value.disconnect();
});

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `vue-ui-candlestick_${uid.value}`,
    fileName: FINAL_CONFIG.value.style.title.text || 'vue-ui-candlestick'
});

const hasOptionsNoTitle = computed(() => {
    return FINAL_CONFIG.value.userOptions.show && !FINAL_CONFIG.value.style.title.text;
});

const mutableConfig = ref({
    showTable: FINAL_CONFIG.value.table.show,
    showTooltip: FINAL_CONFIG.value.style.tooltip.show
});

const drawingArea = computed(() => {
    const {top: pt, right: pr, bottom: pb, left:pl} = FINAL_CONFIG.value.style.layout.padding;
    return {
        top: pt,
        right: svg.value.width - pr,
        left: pl,
        bottom: svg.value.height - pb,
        width: svg.value.width - pl - pr,
        height: svg.value.height - pt - pb
    }
});

const len = computed(() => props.dataset.length);

const slicer = ref({
    start: 0,
    end: len.value
});

const mutableDataset = computed(() => {
    return props.dataset.slice(slicer.value.start, slicer.value.end);
});

const datasetBreakdown = computed(() => {

    props.dataset.forEach((ds, i) => {
        if([null, undefined].includes(ds[0])){
            error({
                componentName: 'VueUiCandlestick',
                type: 'datasetAttribute',
                property: 'period (index 0)',
                index: i
            })
        }
        if([null, undefined].includes(ds[1])){
            error({
                componentName: 'VueUiCandlestick',
                type: 'datasetAttribute',
                property: 'open (index 1)',
                index: i
            })
        }
        if([null, undefined].includes(ds[2])){
            error({
                componentName: 'VueUiCandlestick',
                type: 'datasetAttribute',
                property: 'high (index 2)',
                index: i
            })
        }
        if([null, undefined].includes(ds[3])){
            error({
                componentName: 'VueUiCandlestick',
                type: 'datasetAttribute',
                property: 'low (index 3)',
                index: i
            })
        }
        if([null, undefined].includes(ds[4])){
            error({
                componentName: 'VueUiCandlestick',
                type: 'datasetAttribute',
                property: 'last (index 4)',
                index: i
            })
        }
        if([null, undefined].includes(ds[5])){
            error({
                componentName: 'VueUiCandlestick',
                type: 'datasetAttribute',
                property: 'volume (index 5)',
                index: i
            })
        }
    })

    return mutableDataset.value.map(ds => {
        return {
            period: ds[0],
            open: ds[1],
            high: ds[2],
            low: ds[3],
            last: ds[4],
            volume: ds[5]
        }
    });
});

const slot = computed(() => {
    return drawingArea.value.width / mutableDataset.value.length
})

const extremes = computed(() => {
    return {
        max: Math.max(...datasetBreakdown.value.map(ds => ds.high)),
        min: 0
    }
});

const niceScale = computed(() => {
    return calculateNiceScale(extremes.value.min, extremes.value.max, FINAL_CONFIG.value.style.layout.grid.yAxis.dataLabels.steps)
})

function convertToPlot(item, index) {
    return {
        ...item,
        x: checkNaN(drawingArea.value.left + (index * slot.value) + (slot.value / 2)),
        y: checkNaN(drawingArea.value.top + (1 - (item / niceScale.value.max)) * drawingArea.value.height),
        value: checkNaN(item)
    }
}

const drawableDataset = computed(() => {
    return datasetBreakdown.value.map((ds, i) => {
        const open = convertToPlot(ds.open, i);
        const high = convertToPlot(ds.high, i);
        const low = convertToPlot(ds.low, i);
        const last = convertToPlot(ds.last, i);
        const isBullish = ds.last > ds.open;
        return {
            period: ds.period,
            open,
            high,
            low,
            last,
            volume: ds.volume,
            isBullish
        }
    });
});

function ratioToMax(value) {
    return checkNaN(value / niceScale.value.max);
}

const yLabels = computed(() => {
    return niceScale.value.ticks.map(t => {
        return {
            y: drawingArea.value.bottom - (drawingArea.value.height * ratioToMax(t)),
            value: checkNaN(t)
        }
    })
});

const xLabels = computed(() => {
    return datasetBreakdown.value.map(ds => ds.period)
});

const dataTooltipSlot = ref(null);

function useTooltip(index, datapoint) {
    hoveredIndex.value = index;

    dataTooltipSlot.value = {
        datapoint,
        seriesIndex: index,
        series: drawableDataset.value,
        config: FINAL_CONFIG.value
    }

    const customFormat = FINAL_CONFIG.value.style.tooltip.customFormat;

    if (isFunction(customFormat) && functionReturnsString(() => customFormat({
            seriesIndex: index,
            datapoint,
            series: drawableDataset.value,
            config: FINAL_CONFIG.value
        }))) {
        tooltipContent.value = customFormat({
            seriesIndex: index,
            datapoint,
            series: drawableDataset.value,
            config: FINAL_CONFIG.value
        })
    } else {
        if (FINAL_CONFIG.value.style.tooltip.show) {
            let html = "";
            const { period, open, high, low, last, volume, isBullish } = drawableDataset.value[index];
            const { period:tr_period, open:tr_open, high:tr_high, low:tr_low, last:tr_last, volume:tr_volume } = FINAL_CONFIG.value.translations;
    
            html += `<div data-cy="candlestick-tooltip-period"><svg style="margin-right:6px" viewBox="0 0 12 12" height="12" width="12"><rect x="0" y="0" height="12" width="12" rx="${FINAL_CONFIG.value.style.layout.candle.borderRadius*3}" stroke="${FINAL_CONFIG.value.style.layout.candle.stroke}" stroke-width="${FINAL_CONFIG.value.style.layout.candle.strokeWidth}" 
                fill="${FINAL_CONFIG.value.style.layout.candle.gradient.show 
                    ? isBullish 
                        ? `url(#bullish_gradient_${uid.value})` 
                        : `url(#bearish_gradient_${uid.value})` 
                    : isBullish 
                        ? FINAL_CONFIG.value.style.layout.candle.colors.bullish 
                        : FINAL_CONFIG.value.style.layout.candle.colors.bearish}"/></svg>${period}</div>`;
            html += `${tr_volume} : <b data-cy="candlestick-tooltip-volume">${ isNaN(volume) ? '-' : Number(volume.toFixed(FINAL_CONFIG.value.style.tooltip.roundingValue)).toLocaleString()}</b>`;
            html += `<div style="margin-top:6px;padding-top:6px;border-top:1px solid ${FINAL_CONFIG.value.style.tooltip.borderColor}">`;
            html += `<div>${tr_open}: <b>${FINAL_CONFIG.value.style.tooltip.prefix} ${isNaN(open.value) ? '-' : Number(open.value.toFixed(FINAL_CONFIG.value.style.tooltip.roundingValue)).toLocaleString()} ${FINAL_CONFIG.value.style.tooltip.suffix}</b></div>`;
            html += `<div>${tr_high}: <b>${FINAL_CONFIG.value.style.tooltip.prefix} ${isNaN(high.value) ? '-' : Number(high.value.toFixed(FINAL_CONFIG.value.style.tooltip.roundingValue)).toLocaleString()} ${FINAL_CONFIG.value.style.tooltip.suffix}</b></div>`;
            html += `<div>${tr_low}: <b>${FINAL_CONFIG.value.style.tooltip.prefix} ${isNaN(low.value) ? '-' : Number(low.value.toFixed(FINAL_CONFIG.value.style.tooltip.roundingValue)).toLocaleString()} ${FINAL_CONFIG.value.style.tooltip.suffix}</b></div>`;
            html += `<div>${tr_last}: <b>${FINAL_CONFIG.value.style.tooltip.prefix} ${isNaN(last.value) ? '-' : Number(last.value.toFixed(FINAL_CONFIG.value.style.tooltip.roundingValue)).toLocaleString()} ${FINAL_CONFIG.value.style.tooltip.suffix}</b></div>`;
            html += `</div>`;
    
            tooltipContent.value = `<div style="text-align:right">${html}</div>`
        }
    }
    isTooltip.value = true;
}

function refreshSlicer() {
    setupSlicer();
}

const slicerComponent = ref(null);

async function setupSlicer() {
    if ((FINAL_CONFIG.value.style.zoom.startIndex !== null || FINAL_CONFIG.value.style.zoom.endIndex !== null) && slicerComponent.value) {
        if (FINAL_CONFIG.value.style.zoom.startIndex !== null) {
            await nextTick();
            await nextTick();
            slicerComponent.value && slicerComponent.value.setStartValue(FINAL_CONFIG.value.style.zoom.startIndex);
        }
        if (FINAL_CONFIG.value.style.zoom.endIndex !== null) {
            await nextTick();
            await nextTick();
            slicerComponent.value && slicerComponent.value.setEndValue(validSlicerEnd(FINAL_CONFIG.value.style.zoom.endIndex + 1));
        }
    } else {
        slicer.value = {
            start: 0,
            end: len.value
        };
        slicerStep.value += 1;
    }
}

function validSlicerEnd(v) {
    const max = len.value;
    if (v > max) {
        return max;
    }
    if (v < 0 || (FINAL_CONFIG.value.style.zoom.startIndex !== null && v < FINAL_CONFIG.value.style.zoom.startIndex)) {
        if (FINAL_CONFIG.value.style.zoom.startIndex !== null) {
            return FINAL_CONFIG.value.style.zoom.startIndex + 1;
        } else {
            return 1;
        }
    }
    return v;
}

function generateCsv() {
    nextTick(() => {
        const labels = [FINAL_CONFIG.value.translations.period, FINAL_CONFIG.value.translations.open, FINAL_CONFIG.value.translations.high, FINAL_CONFIG.value.translations.low, FINAL_CONFIG.value.translations.last, FINAL_CONFIG.value.translations.volume];

        const values = drawableDataset.value.map(ds => {
            return [
                ds.period,
                ds.open.value,
                ds.high.value,
                ds.low.value,
                ds.last.value,
                ds.volume
            ]
        });

        const tableXls = [[FINAL_CONFIG.value.style.title.text],[FINAL_CONFIG.value.style.title.subtitle.text],[[""],[""],[""]]].concat([labels]).concat(values)
        const csvContent = createCsvContent(tableXls);
        downloadCsv({ csvContent, title: FINAL_CONFIG.value.style.title.text || "vue-ui-candlestick"});
    });
}

const dataTable = computed(() => {
    const body = drawableDataset.value.map(ds => [
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" height="12" width="12" style="margin-right: 6px"><rect x="0" y="0" height="12" width="12" :rx="${FINAL_CONFIG.value.style.layout.candle.borderRadius * 3}" fill="${FINAL_CONFIG.value.style.layout.candle.gradient.show ? ds.isBullish ? `url(#bullish_gradient_${uid.value}` : `url(#bearish_gradient_${uid.value})` : ds.isBullish ? FINAL_CONFIG.value.style.layout.candle.colors.bullish : FINAL_CONFIG.value.style.layout.candle.colors.bearish}"/></svg> ${ds.period}`,
        `${FINAL_CONFIG.value.table.td.prefix} ${isNaN(ds.open.value) ? '-' : Number(ds.open.value.toFixed(FINAL_CONFIG.value.table.td.roundingValue)).toLocaleString()} ${FINAL_CONFIG.value.table.td.suffix}`,
        `${FINAL_CONFIG.value.table.td.prefix} ${isNaN(ds.high.value) ? '-' : Number(ds.high.value.toFixed(FINAL_CONFIG.value.table.td.roundingValue)).toLocaleString()} ${FINAL_CONFIG.value.table.td.suffix}`,
        `${FINAL_CONFIG.value.table.td.prefix} ${isNaN(ds.low.value) ? '-' : Number(ds.low.value.toFixed(FINAL_CONFIG.value.table.td.roundingValue)).toLocaleString()} ${FINAL_CONFIG.value.table.td.suffix}`,
        `${FINAL_CONFIG.value.table.td.prefix} ${isNaN(ds.last.value) ? '-' : Number(ds.last.value.toFixed(FINAL_CONFIG.value.table.td.roundingValue)).toLocaleString()} ${FINAL_CONFIG.value.table.td.suffix}`,
        `${isNaN(ds.volume) ? '-' : ds.volume.toLocaleString()}`,
    ]);

    const config = {
        th: {
            backgroundColor: FINAL_CONFIG.value.table.th.backgroundColor,
            color: FINAL_CONFIG.value.table.th.color,
            outline: FINAL_CONFIG.value.table.th.outline
        },
        td: {
            backgroundColor: FINAL_CONFIG.value.table.td.backgroundColor,
            color: FINAL_CONFIG.value.table.td.color,
            outline: FINAL_CONFIG.value.table.td.outline,
        },
        breakpoint: FINAL_CONFIG.value.table.responsiveBreakpoint
    };

    const colNames = [
        FINAL_CONFIG.value.translations.period,
        FINAL_CONFIG.value.translations.open,
        FINAL_CONFIG.value.translations.high,
        FINAL_CONFIG.value.translations.low,
        FINAL_CONFIG.value.translations.last,
        FINAL_CONFIG.value.translations.volume
    ]

    return { head: colNames, body, config, colNames }
})

const isFullscreen = ref(false)
function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
}

function toggleTable() {
    mutableConfig.value.showTable = !mutableConfig.value.showTable;
}

function toggleTooltip() {
    mutableConfig.value.showTooltip = !mutableConfig.value.showTooltip;
}

const isAnnotator = ref(false);
function toggleAnnotator() {
    isAnnotator.value = !isAnnotator.value;
}

defineExpose({
    generatePdf,
    generateCsv,
    generateImage,
    toggleTable,
    toggleTooltip,
    toggleAnnotator
});

</script>

<template>
    <div ref="candlestickChart" :class="`vue-ui-candlestick ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''} ${FINAL_CONFIG.useCssAnimation ? '' : 'vue-ui-dna'}`" :style="`position:relative;font-family:${FINAL_CONFIG.style.fontFamily}; text-align:center;background:${FINAL_CONFIG.style.backgroundColor}; ${FINAL_CONFIG.responsive ? 'height: 100%' : ''}`" :id="`vue-ui-candlestick_${uid}`" @mouseenter="() => setUserOptionsVisibility(true)" @mouseleave="() => setUserOptionsVisibility(false)">
        <PenAndPaper
            v-if="FINAL_CONFIG.userOptions.buttons.annotator"
            :parent="candlestickChart"
            :backgroundColor="FINAL_CONFIG.style.backgroundColor"
            :color="FINAL_CONFIG.style.color"
            :active="isAnnotator"
            @close="toggleAnnotator"
        />

        <div
            ref="noTitle"
            v-if="hasOptionsNoTitle" 
            class="vue-data-ui-no-title-space" 
            :style="`height:36px; width: 100%;background:transparent`"
        />

        <div ref="chartTitle" v-if="FINAL_CONFIG.style.title.text" :style="`width:100%;background:transparent`">
            <!-- TITLE AS DIV -->
            <Title
                :key="`title_${titleStep}`"
                :config="{
                    title: {
                        cy: 'candlestick-div-title',
                        ...FINAL_CONFIG.style.title
                    },
                    subtitle: {
                        cy: 'candlestick-div-subtitle',
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
            :backgroundColor="FINAL_CONFIG.style.backgroundColor"
            :color="FINAL_CONFIG.style.color"
            :isImaging="isImaging"
            :isPrinting="isPrinting"
            :uid="uid"
            :hasTooltip="FINAL_CONFIG.userOptions.buttons.tooltip && FINAL_CONFIG.style.tooltip.show"
            :hasPdf="FINAL_CONFIG.userOptions.buttons.pdf"
            :hasImg="FINAL_CONFIG.userOptions.buttons.img"
            :hasXls="FINAL_CONFIG.userOptions.buttons.csv"
            :hasTable="FINAL_CONFIG.userOptions.buttons.table"
            :hasFullscreen="FINAL_CONFIG.userOptions.buttons.fullscreen"
            :isFullscreen="isFullscreen"
            :isTooltip="mutableConfig.showTooltip"
            :titles="{ ...FINAL_CONFIG.userOptions.buttonTitles }"
            :chartElement="candlestickChart"
            :position="FINAL_CONFIG.userOptions.position"
            :hasAnnotator="FINAL_CONFIG.userOptions.buttons.annotator"
            :isAnnotation="isAnnotator"
            @toggleFullscreen="toggleFullscreen"
            @generatePdf="generatePdf"
            @generateCsv="generateCsv"
            @generateImage="generateImage"
            @toggleTable="toggleTable"
            @toggleTooltip="toggleTooltip"
            @toggleAnnotator="toggleAnnotator"
            :style="{
                visibility: keepUserOptionState ? userOptionsVisible ? 'visible' : 'hidden' : 'visible'
            }"
        >
            <template #optionTooltip v-if="$slots.optionTooltip">
                <slot name="optionTooltip"/>
            </template>
            <template #optionPdf v-if="$slots.optionPdf">
                <slot name="optionPdf" />
            </template>
            <template #optionCsv v-if="$slots.optionCsv">
                <slot name="optionCsv" />
            </template>
            <template #optionImg v-if="$slots.optionImg">
                <slot name="optionImg" />
            </template>
            <template #optionTable v-if="$slots.optionTable">
                <slot name="optionTable" />
            </template>
            <template v-if="$slots.optionFullscreen" template #optionFullscreen="{ toggleFullscreen, isFullscreen }">
                <slot name="optionFullscreen" v-bind="{ toggleFullscreen, isFullscreen }"/>
            </template>
            <template v-if="$slots.optionAnnotator" #optionAnnotator="{ toggleAnnotator, isAnnotator }">
                <slot name="optionAnnotator" v-bind="{ toggleAnnotator, isAnnotator }" />
            </template>
        </UserOptions>
        
        <!-- CHART -->
        <svg
            ref="svgRef"
            :xmlns="XMLNS"
            v-if="isDataset"
            :class="{ 'vue-data-ui-fullscreen--on': isFullscreen, 'vue-data-ui-fulscreen--off': !isFullscreen }"
            :viewBox="`0 0 ${svg.width <= 0 ? 10 : svg.width} ${svg.height <= 0 ? 10 : svg.height}`" :style="`max-width:100%;overflow:visible;background:transparent;color:${FINAL_CONFIG.style.color}`"
        >
            <PackageVersion />

            <!-- BACKGROUND SLOT -->
            <foreignObject 
                v-if="$slots['chart-background']"
                :x="drawingArea.left"
                :y="drawingArea.top"
                :width="drawingArea.width"
                :height="drawingArea.height"
                :style="{
                    pointerEvents: 'none'
                }"
            >
                <slot name="chart-background"/>
            </foreignObject>
            
            <g v-if="drawableDataset.length > 0">
                <!-- DEFS -->
            <defs>
                <!-- BEARISH GRADIENT -->
                <linearGradient :id="`bearish_gradient_${uid}`" x2="0%" y2="100%">
                    <stop offset="0%" :stop-color="FINAL_CONFIG.style.layout.candle.colors.bearish"/>
                    <stop offset="50%" :stop-color="`${shiftHue(FINAL_CONFIG.style.layout.candle.colors.bearish, 0.02)}DE`"/>
                    <stop offset="100%" :stop-color="`${shiftHue(FINAL_CONFIG.style.layout.candle.colors.bearish, 0.05)}66`"/>
                </linearGradient>
                <!-- BULLISH GRADIENT -->
                <linearGradient :id="`bullish_gradient_${uid}`" x2="0%" y2="100%">
                    <stop offset="0%" :stop-color="FINAL_CONFIG.style.layout.candle.colors.bullish"/>
                    <stop offset="50%" :stop-color="`${shiftHue(FINAL_CONFIG.style.layout.candle.colors.bullish, 0.02)}DE`"/>
                    <stop offset="100%" :stop-color="`${shiftHue(FINAL_CONFIG.style.layout.candle.colors.bullish, 0.05)}66`"/>
                </linearGradient>
            </defs>

            <!-- AXIS -->
            <g v-if="FINAL_CONFIG.style.layout.grid.show">
                <line
                    data-cy="candlestick-grid-y-axis"
                    :x1="drawingArea.left"
                    :x2="drawingArea.left"
                    :y1="drawingArea.top"
                    :y2="drawingArea.bottom"
                    :stroke="FINAL_CONFIG.style.layout.grid.stroke"
                    :stroke-width="FINAL_CONFIG.style.layout.grid.strokeWidth"
                    stroke-linecap="round"
                />
                <line
                    data-cy="candlestick-grid-x-axis"
                    :x1="drawingArea.left"
                    :x2="drawingArea.right"
                    :y1="drawingArea.bottom"
                    :y2="drawingArea.bottom"
                    :stroke="FINAL_CONFIG.style.layout.grid.stroke"
                    :stroke-width="FINAL_CONFIG.style.layout.grid.strokeWidth"
                    stroke-linecap="round"
                />
            </g>

            <!-- LABELS -->
            <!-- Y LABELS -->
            <g v-if="FINAL_CONFIG.style.layout.grid.yAxis.dataLabels.show">
                <g v-for="(yLabel, i) in yLabels">
                    <line 
                        data-cy="y-scale-tick"
                        v-if="yLabel.value >= niceScale.min && yLabel.value <= niceScale.max"
                        :x1="drawingArea.left" 
                        :x2="drawingArea.left - 5" 
                        :y1="yLabel.y" 
                        :y2="yLabel.y" 
                        :stroke="FINAL_CONFIG.style.layout.grid.stroke" 
                        :stroke-width="FINAL_CONFIG.style.layout.grid.strokeWidth"
                        stroke-linecap="round"
                    />
                    <text 
                        data-cy="y-scale-label"
                        v-if="yLabel.value >= niceScale.min && yLabel.value <= niceScale.max" 
                        :x="drawingArea.left - 8 + FINAL_CONFIG.style.layout.grid.yAxis.dataLabels.offsetX" 
                        :y="yLabel.y + svg.yAxisFontSize / 3" 
                        :font-size="svg.yAxisFontSize" 
                        text-anchor="end"
                        :fill="FINAL_CONFIG.style.layout.grid.yAxis.dataLabels.color"
                        :font-weight="FINAL_CONFIG.style.layout.grid.yAxis.dataLabels.bold ? 'bold' : 'normal'"
                    >
                        {{ FINAL_CONFIG.style.layout.grid.yAxis.dataLabels.prefix }} {{ canShowValue(yLabel.value) ? yLabel.value.toFixed(FINAL_CONFIG.style.layout.grid.yAxis.dataLabels.roundingValue) : '' }} {{ FINAL_CONFIG.style.layout.grid.yAxis.dataLabels.suffix }}
                    </text>
                </g>
            </g>
            <!-- X LABELS -->
            <g v-if="FINAL_CONFIG.style.layout.grid.xAxis.dataLabels.show">
                <g v-for="(xLabel, i) in xLabels">
                    <text
                        data-cy="x-label"
                        :transform="`translate(${drawingArea.left + (slot * i) + (slot / 2)}, ${drawingArea.bottom + svg.xAxisFontSize * 2 + FINAL_CONFIG.style.layout.grid.xAxis.dataLabels.offsetY}), rotate(${FINAL_CONFIG.style.layout.grid.xAxis.dataLabels.rotation})`"
                        :text-anchor="FINAL_CONFIG.style.layout.grid.xAxis.dataLabels.rotation > 0 ? 'start' : FINAL_CONFIG.style.layout.grid.xAxis.dataLabels.rotation < 0 ? 'end' : 'middle'"
                        :font-size="svg.xAxisFontSize"
                        :fill="FINAL_CONFIG.style.layout.grid.xAxis.dataLabels.color"
                        :font-weight="FINAL_CONFIG.style.layout.grid.xAxis.dataLabels.bold ? 'bold': 'normal'"
                    >
                        {{ xLabel }}
                    </text>
                </g>
            </g>
            
            <!-- CANDLE WICK -->
            <g>
                <g v-for="(wick, i) in drawableDataset">
                    <line
                        :data-cy="`candlestick-wick-vertical-${i}`" 
                        :x1="wick.open.x"
                        :x2="wick.open.x"
                        :y1="wick.high.y"
                        :y2="wick.low.y"
                        :stroke="FINAL_CONFIG.style.layout.wick.stroke"
                        :stroke-width="FINAL_CONFIG.style.layout.wick.strokeWidth"
                        stroke-linecap="round"
                    />
                    <g v-if="FINAL_CONFIG.style.layout.wick.extremity.shape === 'circle'">
                        <circle 
                            :cx="wick.high.x" 
                            :cy="wick.high.y" 
                            :r="FINAL_CONFIG.style.layout.wick.extremity.size === 'auto' ? slot / 20 : FINAL_CONFIG.style.layout.wick.extremity.size" 
                            :fill="FINAL_CONFIG.style.layout.wick.extremity.color"
                        />
                        <circle 
                            :cx="wick.low.x" 
                            :cy="wick.low.y" 
                            :r="FINAL_CONFIG.style.layout.wick.extremity.size === 'auto' ? slot / 20 : FINAL_CONFIG.style.layout.wick.extremity.size" 
                            :fill="FINAL_CONFIG.style.layout.wick.extremity.color"
                        />
                    </g>
                    <g v-if="FINAL_CONFIG.style.layout.wick.extremity.shape === 'line'">
                        <line
                            :data-cy="`candlestick-wick-high-${i}`" 
                            :x1="wick.high.x - (FINAL_CONFIG.style.layout.wick.extremity.size === 'auto' ? slot * FINAL_CONFIG.style.layout.candle.widthRatio : FINAL_CONFIG.style.layout.wick.extremity.size) / 2"
                            :x2="wick.high.x + (FINAL_CONFIG.style.layout.wick.extremity.size === 'auto' ? slot * FINAL_CONFIG.style.layout.candle.widthRatio : FINAL_CONFIG.style.layout.wick.extremity.size) / 2"
                            :y1="wick.high.y"
                            :y2="wick.high.y"
                            :stroke="FINAL_CONFIG.style.layout.wick.extremity.color"
                            :stroke-width="FINAL_CONFIG.style.layout.wick.strokeWidth"
                            stroke-linecap="round"
                        />
                        <line
                            :data-cy="`candlestick-wick-low-${i}`"
                            :x1="wick.low.x - (FINAL_CONFIG.style.layout.wick.extremity.size === 'auto' ? slot * FINAL_CONFIG.style.layout.candle.widthRatio : FINAL_CONFIG.style.layout.wick.extremity.size) / 2"
                            :x2="wick.low.x + (FINAL_CONFIG.style.layout.wick.extremity.size === 'auto' ? slot * FINAL_CONFIG.style.layout.candle.widthRatio : FINAL_CONFIG.style.layout.wick.extremity.size) / 2"
                            :y1="wick.low.y"
                            :y2="wick.low.y"
                            :stroke="FINAL_CONFIG.style.layout.wick.extremity.color"
                            :stroke-width="FINAL_CONFIG.style.layout.wick.strokeWidth"
                            stroke-linecap="round"
                        />
                    </g>
                </g>
            </g>
            <!-- CANDLE BODY -->
            <g>
                <rect
                    v-for="(candle, i) in drawableDataset"
                    :data-cy="`candlestick-rect-underlayer-${i}`"
                    :x="candle.open.x - slot / 2 + (slot * (1 - FINAL_CONFIG.style.layout.candle.widthRatio) / 2)"
                    :y="candle.isBullish ? candle.last.y : candle.open.y"
                    :height="Math.abs(candle.last.y - candle.open.y) <= 0 ? 0.0001 : Math.abs(candle.last.y - candle.open.y)"
                    :width="slot * FINAL_CONFIG.style.layout.candle.widthRatio <= 0 ? 0.0001 : slot * FINAL_CONFIG.style.layout.candle.widthRatio"
                    :fill="FINAL_CONFIG.style.layout.candle.gradient.underlayer"
                    :rx="FINAL_CONFIG.style.layout.candle.borderRadius"
                    stroke="none"
                />
                <rect
                    v-for="(candle, i) in drawableDataset"
                    :data-cy="`candlestick-rect-${i}`"
                    :x="candle.open.x - slot / 2 + (slot * (1 - FINAL_CONFIG.style.layout.candle.widthRatio) / 2)"
                    :y="candle.isBullish ? candle.last.y : candle.open.y"
                    :height="Math.abs(candle.last.y - candle.open.y) <= 0 ? 0.0001 : Math.abs(candle.last.y - candle.open.y)"
                    :width="slot * FINAL_CONFIG.style.layout.candle.widthRatio <= 0 ? 0.0001 : slot * FINAL_CONFIG.style.layout.candle.widthRatio"
                    :fill="candle.isBullish ? FINAL_CONFIG.style.layout.candle.gradient.show ? `url(#bullish_gradient_${uid})` : FINAL_CONFIG.style.layout.candle.colors.bullish : FINAL_CONFIG.style.layout.candle.gradient.show ? `url(#bearish_gradient_${uid})` : FINAL_CONFIG.style.layout.candle.colors.bearish"
                    :rx="FINAL_CONFIG.style.layout.candle.borderRadius"
                    :stroke="FINAL_CONFIG.style.layout.candle.stroke"
                    :stroke-width="FINAL_CONFIG.style.layout.candle.strokeWidth"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
            </g>

            <!-- TOOLTIP TRAPS -->
            <g>
                <rect 
                    v-for="(rect, i) in drawableDataset"
                    data-cy="tooltip-trap"
                    :x="drawingArea.left + i * slot"
                    :y="drawingArea.top"
                    :height="drawingArea.height <= 0 ? 0.0001 : drawingArea.height"
                    :width="slot <= 0 ? 0.0001 : slot"
                    :fill="hoveredIndex === i ? setOpacity(FINAL_CONFIG.style.layout.selector.color, FINAL_CONFIG.style.layout.selector.opacity) : 'transparent'"
                    @mouseover="useTooltip(i,rect)"
                    @mouseleave="hoveredIndex = undefined; isTooltip = false"
                />
            </g>
            </g>
            <slot name="svg" :svg="svg"/>
        </svg>

        <div v-if="$slots.watermark" class="vue-data-ui-watermark">
            <slot name="watermark" v-bind="{ isPrinting: isPrinting || isImaging }"/>
        </div>

        <Skeleton
            v-if="!isDataset"
            :config="{
                type: 'candlesticks',
                style: {
                    backgroundColor: FINAL_CONFIG.style.backgroundColor,
                    candlesticks: {
                        axis: {
                            color: '#CCCCCC'
                        },
                        candle: {
                            color: '#CCCCCC'
                        }
                    }
                }
            }"
        />

        <div ref="chartSlicer" v-if="FINAL_CONFIG.style.zoom.show && isDataset">
            <Slicer
                ref="slicerComponent"
                :key="`slicer_${slicerStep}`"
                :background="FINAL_CONFIG.style.zoom.color"
                :borderColor="FINAL_CONFIG.style.backgroundColor"
                :fontSize="FINAL_CONFIG.style.zoom.fontSize"
                :useResetSlot="FINAL_CONFIG.style.zoom.useResetSlot"
                :labelLeft="dataset[slicer.start] ? dataset[slicer.start][0] : dataset[0][0]"
                :labelRight="dataset[slicer.end-1] ? dataset[slicer.end-1][0] : dataset.at(-1)[0]"
                :textColor="FINAL_CONFIG.style.color"
                :inputColor="FINAL_CONFIG.style.zoom.color"
                :selectColor="FINAL_CONFIG.style.zoom.highlightColor"
                :max="len"
                :min="0"
                :valueStart="slicer.start"
                :valueEnd="slicer.end"
                v-model:start="slicer.start"
                v-model:end="slicer.end"
                :refreshStartPoint="FINAL_CONFIG.style.zoom.startIndex !== null ? FINAL_CONFIG.style.zoom.startIndex : 0"
                :refreshEndPoint="FINAL_CONFIG.style.zoom.endIndex !== null ? FINAL_CONFIG.style.zoom.endIndex + 1 : len"
                :enableRangeHandles="FINAL_CONFIG.style.zoom.enableRangeHandles"
                :enableSelectionDrag="FINAL_CONFIG.style.zoom.enableSelectionDrag"
                @reset="refreshSlicer"
            >
                <template #reset-action="{ reset }">
                    <slot name="reset-action" v-bind="{ reset }"/>
                </template>
            </Slicer>
        </div>

        <div ref="chartLegend">
            <slot name="legend" v-bind:legend="drawableDataset"></slot>
        </div>

        <div v-if="$slots.source" ref="source" dir="auto">
            <slot name="source" />
        </div>

        <!-- TOOLTIP -->
        <Tooltip
            :show="mutableConfig.showTooltip && isTooltip"
            :backgroundColor="FINAL_CONFIG.style.tooltip.backgroundColor"
            :color="FINAL_CONFIG.style.tooltip.color"
            :borderRadius="FINAL_CONFIG.style.tooltip.borderRadius"
            :borderColor="FINAL_CONFIG.style.tooltip.borderColor"
            :borderWidth="FINAL_CONFIG.style.tooltip.borderWidth"
            :fontSize="FINAL_CONFIG.style.tooltip.fontSize"
            :backgroundOpacity="FINAL_CONFIG.style.tooltip.backgroundOpacity"
            :position="FINAL_CONFIG.style.tooltip.position"
            :offsetY="FINAL_CONFIG.style.tooltip.offsetY"
            :parent="candlestickChart"
            :content="tooltipContent"
            :isFullscreen="isFullscreen"
            :isCustom="FINAL_CONFIG.style.tooltip.customFormat && typeof FINAL_CONFIG.style.tooltip.customFormat === 'function'"
        >
            <template #tooltip-before>
                <slot name="tooltip-before" v-bind="{...dataTooltipSlot}"></slot>
            </template>
            <template #tooltip-after>
                <slot name="tooltip-after" v-bind="{...dataTooltipSlot}"></slot>
            </template>
        </Tooltip>

        <!-- DATA TABLE -->
        <Accordion hideDetails v-if="isDataset" :config="{
            open: mutableConfig.showTable,
            maxHeight: 10000,
            body: {
                backgroundColor: FINAL_CONFIG.style.backgroundColor,
                color: FINAL_CONFIG.style.color,
            },
            head: {
                backgroundColor: FINAL_CONFIG.style.backgroundColor,
                color: FINAL_CONFIG.style.color,
            }
        }">
            <template #content>
                <DataTable
                    :key="`table_${tableStep}`"
                    :colNames="dataTable.colNames"
                    :head="dataTable.head"
                    :body="dataTable.body"
                    :config="dataTable.config"
                    :title="`${FINAL_CONFIG.style.title.text}${FINAL_CONFIG.style.title.subtitle.text ? ` : ${FINAL_CONFIG.style.title.subtitle.text}` : ''}`"
                    @close="mutableConfig.showTable = false"
                >
                    <template #th="{ th }">
                        {{ th }}
                    </template>
                    <template #td="{ td }">
                        <div v-html="td"/>
                    </template>
                </DataTable>
            </template>
        </Accordion>
    </div>
</template>

<style scoped>
@import "../vue-data-ui.css";

.vue-ui-candlestick *{
    transition: unset;
}
.vue-ui-candlestick {
    user-select: none;
    width: 100%
}

path, line, rect {
    animation: xyAnimation 0.5s ease-in-out;
    transform-origin: center;
}
@keyframes xyAnimation {
    0% {
        transform: scale(0.9,0.9);
        opacity: 0;
    }
    80% {
        transform: scale(1.02,1.02);
        opacity: 1;
    }
    to {
        transform: scale(1,1);
        opacity: 1;
    }
}
.vue-ui-candlestick .vue-ui-candlestick-label {
    align-items: center;
    display: flex;
    flex-direction: column;
    height:100%;
    justify-content: center;
    text-align:center;
    width:100%;
}

.vue-ui-candlestick-tooltip {
    border: 1px solid #e1e5e8;
    border-radius: 4px;
    box-shadow: 0 6px 12px -6px rgba(0,0,0,0.2);
    max-width: 300px;
    position: fixed;
    padding:12px;
    z-index:1;
}
</style>