<script setup>
import { ref, computed, onMounted, nextTick } from "vue";
import { 
    calculateNiceScale, 
    canShowValue, 
    createCsvContent, 
    createUid, 
    downloadCsv,
    error,
    functionReturnsString,
    isFunction,
    objectIsEmpty,
    opacity, 
    shiftHue,
    XMLNS
} from "../lib";
import mainConfig from "../default_configs.json";
import pdf from "../pdf";
import img from "../img";
import { useNestedProp } from "../useNestedProp";
import Title from "../atoms/Title.vue";
import UserOptions from "../atoms/UserOptions.vue";
import Tooltip from "../atoms/Tooltip.vue";
import DataTable from "../atoms/DataTable.vue";
import Skeleton from "./vue-ui-skeleton.vue";
import Slicer from "../atoms/Slicer.vue";

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
const defaultConfig = ref(mainConfig.vue_ui_candlestick);

const isImaging = ref(false);
const isPrinting = ref(false);
const details = ref(null);
const isTooltip = ref(false);
const tooltipContent = ref("");
const candlestickChart = ref(null);
const hoveredIndex = ref(undefined);
const step = ref(0);
const slicerStep = ref(0);

onMounted(() => {
    if(objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiCandlestick',
            type: 'dataset'
        })
    }

    // const sliderOne = document.getElementById(`start_${uid.value}`);
    // const sliderTwo = document.getElementById(`end_${uid.value}`);
    // let minGap = 0;
    // const sliderTrack = document.getElementById(`vue-ui-slider-track_${uid.value}`);

    // if(sliderOne && sliderTwo && sliderTrack) {
    //     sliderOne.addEventListener("input", slideOne);
    //     sliderTwo.addEventListener("input", slideTwo);
    //     function slideOne(){
    //         if(parseInt(sliderTwo.value) - parseInt(sliderOne.value) <= minGap){
    //             sliderOne.value = parseInt(sliderTwo.value) - minGap;
    //         }
    //         fillColor();
    //     }
    //     function slideTwo(){
    //         if(parseInt(sliderTwo.value) - parseInt(sliderOne.value) <= minGap){
    //             sliderTwo.value = parseInt(sliderOne.value) + minGap;
    //         }
    //         fillColor();
    //     }
    //     function fillColor(){
    //         let percent1 = (sliderOne.value / props.dataset.length) * 100;
    //         let percent2 = (sliderTwo.value / props.dataset.length) * 100;
    //         sliderTrack.style.background = `linear-gradient(to right, #dadae5 ${percent1}% , #858585 ${percent1}% , #858585 ${percent2}%, #dadae5 ${percent2}%)`;
    //     }
    //     slideOne();
    //     slideTwo();
    // }
});

const candlestickConfig = computed(() => {
    return useNestedProp({
        userConfig: props.config,
        defaultConfig: defaultConfig.value
    });
});

const mutableConfig = ref({
    inside: !candlestickConfig.value.style.layout.useDiv,
    showTable: candlestickConfig.value.table.show
});

const svg = computed(() => {
    return {
        height: candlestickConfig.value.style.height,
        width: candlestickConfig.value.style.width
    }
});

const drawingArea = computed(() => {
    const {top: pt, right: pr, bottom: pb, left:pl} = candlestickConfig.value.style.layout.padding;
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
    return calculateNiceScale(extremes.value.min, extremes.value.max, candlestickConfig.value.style.layout.grid.yAxis.dataLabels.steps)
})

function convertToPlot(item, index) {
    return {
        ...item,
        x: drawingArea.value.left + (index * slot.value) + (slot.value / 2),
        y: drawingArea.value.top + (1 - (item / niceScale.value.max)) * drawingArea.value.height,
        value: item
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
    return value / niceScale.value.max;
}

const yLabels = computed(() => {
    return niceScale.value.ticks.map(t => {
        return {
            y: drawingArea.value.bottom - (drawingArea.value.height * ratioToMax(t)),
            value: t
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
        config: candlestickConfig.value
    }

    const customFormat = candlestickConfig.value.style.tooltip.customFormat;

    if (isFunction(customFormat) && functionReturnsString(() => customFormat({
            seriesIndex: index,
            datapoint,
            series: drawableDataset.value,
            config: candlestickConfig.value
        }))) {
        tooltipContent.value = customFormat({
            seriesIndex: index,
            datapoint,
            series: drawableDataset.value,
            config: candlestickConfig.value
        })
    } else {
        if (candlestickConfig.value.style.tooltip.show) {
            let html = "";
            const { period, open, high, low, last, volume, isBullish } = drawableDataset.value[index];
            const { period:tr_period, open:tr_open, high:tr_high, low:tr_low, last:tr_last, volume:tr_volume } = candlestickConfig.value.translations;
    
            html += `<div data-cy="candlestick-tooltip-period"><svg style="margin-right:6px" viewBox="0 0 12 12" height="12" width="12"><rect x="0" y="0" height="12" width="12" rx="${candlestickConfig.value.style.layout.candle.borderRadius*3}" stroke="${candlestickConfig.value.style.layout.candle.stroke}" stroke-width="${candlestickConfig.value.style.layout.candle.strokeWidth}" 
                fill="${candlestickConfig.value.style.layout.candle.gradient.show 
                    ? isBullish 
                        ? `url(#bullish_gradient_${uid.value})` 
                        : `url(#bearish_gradient_${uid.value})` 
                    : isBullish 
                        ? candlestickConfig.value.style.layout.candle.colors.bullish 
                        : candlestickConfig.value.style.layout.candle.colors.bearish}"/></svg>${period}</div>`;
            html += `${tr_volume} : <b data-cy="candlestick-tooltip-volume">${ isNaN(volume) ? '-' : Number(volume.toFixed(candlestickConfig.value.style.tooltip.roundingValue)).toLocaleString()}</b>`;
            html += `<div style="margin-top:6px;padding-top:6px;border-top:1px solid #e1e5e8">`;
            html += `<div>${tr_open} : <b>${candlestickConfig.value.style.tooltip.prefix} ${isNaN(open.value) ? '-' : Number(open.value.toFixed(candlestickConfig.value.style.tooltip.roundingValue)).toLocaleString()} ${candlestickConfig.value.style.tooltip.suffix}</b></div>`;
            html += `<div>${tr_high} : <b>${candlestickConfig.value.style.tooltip.prefix} ${isNaN(high.value) ? '-' : Number(high.value.toFixed(candlestickConfig.value.style.tooltip.roundingValue)).toLocaleString()} ${candlestickConfig.value.style.tooltip.suffix}</b></div>`;
            html += `<div>${tr_low} : <b>${candlestickConfig.value.style.tooltip.prefix} ${isNaN(low.value) ? '-' : Number(low.value.toFixed(candlestickConfig.value.style.tooltip.roundingValue)).toLocaleString()} ${candlestickConfig.value.style.tooltip.suffix}</b></div>`;
            html += `<div>${tr_last} : <b>${candlestickConfig.value.style.tooltip.prefix} ${isNaN(last.value) ? '-' : Number(last.value.toFixed(candlestickConfig.value.style.tooltip.roundingValue)).toLocaleString()} ${candlestickConfig.value.style.tooltip.suffix}</b></div>`;
            html += `</div>`;
    
            tooltipContent.value = `<div style="text-align:right">${html}</div>`
        }
    }
    isTooltip.value = true;
}

function refreshSlicer() {
    slicer.value = {
        start: 0,
        end: len.value
    };
    slicerStep.value += 1;
}

const __to__ = ref(null);

function showSpinnerPdf() {
    isPrinting.value = true;
}

function generatePdf(){
    showSpinnerPdf();
    clearTimeout(__to__.value);
    __to__.value = setTimeout(() => {
        pdf({
            domElement: document.getElementById(`vue-ui-candlestick_${uid.value}`),
            fileName: candlestickConfig.value.style.title.text || 'vue-ui-candlestick'
        }).finally(() => {
            isPrinting.value = false;
        });
    }, 100)
}

function showSpinnerImage() {
    isImaging.value = true;
}

function generateImage() {
    showSpinnerImage();
    clearTimeout(__to__.value);
    __to__.value = setTimeout(() => {
        img({
            domElement: document.getElementById(`vue-ui-candlestick_${uid.value}`),
            fileName: candlestickConfig.value.style.title.text || 'vue-ui-candlestick',
            format: 'png'
        }).finally(() => {
            isImaging.value = false;
        })
    }, 100)
}

function generateCsv() {
    nextTick(() => {
        const labels = [candlestickConfig.value.translations.period, candlestickConfig.value.translations.open, candlestickConfig.value.translations.high, candlestickConfig.value.translations.low, candlestickConfig.value.translations.last, candlestickConfig.value.translations.volume];

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

        const tableXls = [[candlestickConfig.value.style.title.text],[candlestickConfig.value.style.title.subtitle.text],[[""],[""],[""]]].concat([labels]).concat(values)
        const csvContent = createCsvContent(tableXls);
        downloadCsv({ csvContent, title: candlestickConfig.value.style.title.text || "vue-ui-candlestick"});
    });
}

const dataTable = computed(() => {
    const body = drawableDataset.value.map(ds => [
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" height="12" width="12" style="margin-right: 6px"><rect x="0" y="0" height="12" width="12" :rx="${candlestickConfig.value.style.layout.candle.borderRadius * 3}" fill="${candlestickConfig.value.style.layout.candle.gradient.show ? ds.isBullish ? `url(#bullish_gradient_${uid.value}` : `url(#bearish_gradient_${uid.value})` : ds.isBullish ? candlestickConfig.value.style.layout.candle.colors.bullish : candlestickConfig.value.style.layout.candle.colors.bearish}"/></svg> ${ds.period}`,
        `${candlestickConfig.value.table.td.prefix} ${isNaN(ds.open.value) ? '-' : Number(ds.open.value.toFixed(candlestickConfig.value.table.td.roundingValue)).toLocaleString()} ${candlestickConfig.value.table.td.suffix}`,
        `${candlestickConfig.value.table.td.prefix} ${isNaN(ds.high.value) ? '-' : Number(ds.high.value.toFixed(candlestickConfig.value.table.td.roundingValue)).toLocaleString()} ${candlestickConfig.value.table.td.suffix}`,
        `${candlestickConfig.value.table.td.prefix} ${isNaN(ds.low.value) ? '-' : Number(ds.low.value.toFixed(candlestickConfig.value.table.td.roundingValue)).toLocaleString()} ${candlestickConfig.value.table.td.suffix}`,
        `${candlestickConfig.value.table.td.prefix} ${isNaN(ds.last.value) ? '-' : Number(ds.last.value.toFixed(candlestickConfig.value.table.td.roundingValue)).toLocaleString()} ${candlestickConfig.value.table.td.suffix}`,
        `${isNaN(ds.volume) ? '-' : ds.volume.toLocaleString()}`,
    ]);

    const config = {
        th: {
            backgroundColor: candlestickConfig.value.table.th.backgroundColor,
            color: candlestickConfig.value.table.th.color,
            outline: candlestickConfig.value.table.th.outline
        },
        td: {
            backgroundColor: candlestickConfig.value.table.td.backgroundColor,
            color: candlestickConfig.value.table.td.color,
            outline: candlestickConfig.value.table.td.outline,
        },
        breakpoint: candlestickConfig.value.table.responsiveBreakpoint
    };

    const colNames = [
        candlestickConfig.value.translations.period,
        candlestickConfig.value.translations.open,
        candlestickConfig.value.translations.high,
        candlestickConfig.value.translations.low,
        candlestickConfig.value.translations.last,
        candlestickConfig.value.translations.volume
    ]

    return { head: colNames, body, config, colNames }
})

const isFullscreen = ref(false)
function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
}

defineExpose({
    generatePdf,
    generateCsv,
    generateImage
});

</script>

<template>
    <div ref="candlestickChart" :class="`vue-ui-candlestick ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''} ${candlestickConfig.useCssAnimation ? '' : 'vue-ui-dna'}`" :style="`font-family:${candlestickConfig.style.fontFamily};width:100%; text-align:center;${!candlestickConfig.style.title.text ? 'padding-top:36px' : ''};background:${candlestickConfig.style.backgroundColor}`" :id="`vue-ui-candlestick_${uid}`">
        <div v-if="(!mutableConfig.inside || isPrinting) && candlestickConfig.style.title.text" :style="`width:100%;background:${candlestickConfig.style.backgroundColor}`">
            <!-- TITLE AS DIV -->
            <Title
                :config="{
                    title: {
                        cy: 'candlestick-div-title',
                        text: candlestickConfig.style.title.text,
                        color: candlestickConfig.style.title.color,
                        fontSize: candlestickConfig.style.title.fontSize,
                        bold: candlestickConfig.style.title.bold
                    },
                    subtitle: {
                        cy: 'candlestick-div-subtitle',
                        text: candlestickConfig.style.title.subtitle.text,
                        color: candlestickConfig.style.title.subtitle.color,
                        fontSize: candlestickConfig.style.title.subtitle.fontSize,
                        bold: candlestickConfig.style.title.subtitle.bold
                    }
                }"
            />
        </div>

         <!-- OPTIONS -->
         <UserOptions
            ref="details"
            :key="`user_options_${step}`"
            v-if="candlestickConfig.userOptions.show && isDataset"
            :backgroundColor="candlestickConfig.style.backgroundColor"
            :color="candlestickConfig.style.color"
            :isImaging="isImaging"
            :isPrinting="isPrinting"
            :title="candlestickConfig.userOptions.title"
            :uid="uid"
            :hasImg="true"
            hasTable
            hasFullscreen
            :isFullscreen="isFullscreen"
            :chartElement="candlestickChart"
            @toggleFullscreen="toggleFullscreen"
            @generatePdf="generatePdf"
            @generateCsv="generateCsv"
            @generateImage="generateImage"
            @toggleTable="mutableConfig.showTable = !mutableConfig.showTable"
         />
         
        <!-- CHART -->
        <svg :xmlns="XMLNS" v-if="isDataset" :class="{ 'vue-data-ui-fullscreen--on': isFullscreen, 'vue-data-ui-fulscreen--off': !isFullscreen }" :viewBox="`0 0 ${svg.width} ${svg.height}`" :style="`max-width:100%;overflow:visible;background:${candlestickConfig.style.backgroundColor};color:${candlestickConfig.style.color}`">
            <g v-if="drawableDataset.length > 0">
                <!-- DEFS -->
            <defs>
                <!-- BEARISH GRADIENT -->
                <linearGradient :id="`bearish_gradient_${uid}`" x2="0%" y2="100%">
                    <stop offset="0%" :stop-color="candlestickConfig.style.layout.candle.colors.bearish"/>
                    <stop offset="50%" :stop-color="`${shiftHue(candlestickConfig.style.layout.candle.colors.bearish, 0.02)}DE`"/>
                    <stop offset="100%" :stop-color="`${shiftHue(candlestickConfig.style.layout.candle.colors.bearish, 0.05)}66`"/>
                </linearGradient>
                <!-- BULLISH GRADIENT -->
                <linearGradient :id="`bullish_gradient_${uid}`" x2="0%" y2="100%">
                    <stop offset="0%" :stop-color="candlestickConfig.style.layout.candle.colors.bullish"/>
                    <stop offset="50%" :stop-color="`${shiftHue(candlestickConfig.style.layout.candle.colors.bullish, 0.02)}DE`"/>
                    <stop offset="100%" :stop-color="`${shiftHue(candlestickConfig.style.layout.candle.colors.bullish, 0.05)}66`"/>
                </linearGradient>
            </defs>

            <!-- TITLE AS G -->
            <g v-if="candlestickConfig.style.title.text && mutableConfig.inside && !isPrinting">
                <text
                    data-cy="candlestick-text-title"
                    :font-size="candlestickConfig.style.title.fontSize"
                    :fill="candlestickConfig.style.title.color"
                    :x="svg.width / 2"
                    :y="0"
                    text-anchor="middle"
                    :style="`font-weight:${candlestickConfig.style.title.bold ? 'bold' : ''}`"
                >
                    {{ candlestickConfig.style.title.text }}
                </text>
                <text
                    data-cy="candlestick-text-subtitle"
                    v-if="candlestickConfig.style.title.subtitle.text"
                    :font-size="candlestickConfig.style.title.subtitle.fontSize"
                    :fill="candlestickConfig.style.title.subtitle.color"
                    :x="svg.width / 2"
                    :y="candlestickConfig.style.title.fontSize"
                    text-anchor="middle"
                    :style="`font-weight:${candlestickConfig.style.title.subtitle.bold ? 'bold' : ''}`"
                >
                    {{ candlestickConfig.style.title.subtitle.text }}
                </text>
            </g>

            <!-- AXIS -->
            <g v-if="candlestickConfig.style.layout.grid.show">
                <line
                    data-cy="candlestick-grid-y-axis"
                    :x1="drawingArea.left"
                    :x2="drawingArea.left"
                    :y1="drawingArea.top"
                    :y2="drawingArea.bottom"
                    :stroke="candlestickConfig.style.layout.grid.stroke"
                    :stroke-width="candlestickConfig.style.layout.grid.strokeWidth"
                    stroke-linecap="round"
                />
                <line
                    data-cy="candlestick-grid-x-axis"
                    :x1="drawingArea.left"
                    :x2="drawingArea.right"
                    :y1="drawingArea.bottom"
                    :y2="drawingArea.bottom"
                    :stroke="candlestickConfig.style.layout.grid.stroke"
                    :stroke-width="candlestickConfig.style.layout.grid.strokeWidth"
                    stroke-linecap="round"
                />
            </g>

            <!-- LABELS -->
            <!-- Y LABELS -->
            <g v-if="candlestickConfig.style.layout.grid.yAxis.dataLabels.show">
                <g v-for="(yLabel, i) in yLabels">
                    <line 
                        v-if="yLabel.value >= niceScale.min && yLabel.value <= niceScale.max"
                        :x1="drawingArea.left" 
                        :x2="drawingArea.left - 5" 
                        :y1="yLabel.y" 
                        :y2="yLabel.y" 
                        :stroke="candlestickConfig.style.layout.grid.stroke" 
                        :stroke-width="candlestickConfig.style.layout.grid.strokeWidth"
                        stroke-linecap="round"
                    />
                    <text 
                        v-if="yLabel.value >= niceScale.min && yLabel.value <= niceScale.max" 
                        :x="drawingArea.left - 8 + candlestickConfig.style.layout.grid.yAxis.dataLabels.offsetX" 
                        :y="yLabel.y + candlestickConfig.style.layout.grid.yAxis.dataLabels.fontSize / 3" 
                        :font-size="candlestickConfig.style.layout.grid.yAxis.dataLabels.fontSize" 
                        text-anchor="end"
                        :fill="candlestickConfig.style.layout.grid.yAxis.dataLabels.color"
                        :font-weight="candlestickConfig.style.layout.grid.yAxis.dataLabels.bold ? 'bold' : 'normal'"
                    >
                        {{ candlestickConfig.style.layout.grid.yAxis.dataLabels.prefix }} {{ canShowValue(yLabel.value) ? yLabel.value.toFixed(candlestickConfig.style.layout.grid.yAxis.dataLabels.roundingValue) : '' }} {{ candlestickConfig.style.layout.grid.yAxis.dataLabels.suffix }}
                    </text>
                </g>
            </g>
            <!-- X LABELS -->
            <g v-if="candlestickConfig.style.layout.grid.xAxis.dataLabels.show">
                <g v-for="(xLabel, i) in xLabels">
                    <text
                        :data-cy="`candlestick-time-label-${i}`"
                        :x="drawingArea.left + (slot * i) + (slot / 2)"
                        :y="drawingArea.bottom + candlestickConfig.style.layout.grid.xAxis.dataLabels.fontSize * 2 + candlestickConfig.style.layout.grid.xAxis.dataLabels.offsetY"
                        text-anchor="middle"
                        :font-size="candlestickConfig.style.layout.grid.xAxis.dataLabels.fontSize"
                        :fill="candlestickConfig.style.layout.grid.xAxis.dataLabels.color"
                        :font-weight="candlestickConfig.style.layout.grid.xAxis.dataLabels.bold ? 'bold': 'normal'"
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
                        :stroke="candlestickConfig.style.layout.wick.stroke"
                        :stroke-width="candlestickConfig.style.layout.wick.strokeWidth"
                        stroke-linecap="round"
                    />
                    <g v-if="candlestickConfig.style.layout.wick.extremity.shape === 'circle'">
                        <circle 
                            :cx="wick.high.x" 
                            :cy="wick.high.y" 
                            :r="candlestickConfig.style.layout.wick.extremity.size === 'auto' ? slot / 20 : candlestickConfig.style.layout.wick.extremity.size" 
                            :fill="candlestickConfig.style.layout.wick.extremity.color"
                        />
                        <circle 
                            :cx="wick.low.x" 
                            :cy="wick.low.y" 
                            :r="candlestickConfig.style.layout.wick.extremity.size === 'auto' ? slot / 20 : candlestickConfig.style.layout.wick.extremity.size" 
                            :fill="candlestickConfig.style.layout.wick.extremity.color"
                        />
                    </g>
                    <g v-if="candlestickConfig.style.layout.wick.extremity.shape === 'line'">
                        <line
                            :data-cy="`candlestick-wick-high-${i}`" 
                            :x1="wick.high.x - (candlestickConfig.style.layout.wick.extremity.size === 'auto' ? slot * candlestickConfig.style.layout.candle.widthRatio : candlestickConfig.style.layout.wick.extremity.size) / 2"
                            :x2="wick.high.x + (candlestickConfig.style.layout.wick.extremity.size === 'auto' ? slot * candlestickConfig.style.layout.candle.widthRatio : candlestickConfig.style.layout.wick.extremity.size) / 2"
                            :y1="wick.high.y"
                            :y2="wick.high.y"
                            :stroke="candlestickConfig.style.layout.wick.extremity.color"
                            :stroke-width="candlestickConfig.style.layout.wick.strokeWidth"
                            stroke-linecap="round"
                        />
                        <line
                            :data-cy="`candlestick-wick-low-${i}`"
                            :x1="wick.low.x - (candlestickConfig.style.layout.wick.extremity.size === 'auto' ? slot * candlestickConfig.style.layout.candle.widthRatio : candlestickConfig.style.layout.wick.extremity.size) / 2"
                            :x2="wick.low.x + (candlestickConfig.style.layout.wick.extremity.size === 'auto' ? slot * candlestickConfig.style.layout.candle.widthRatio : candlestickConfig.style.layout.wick.extremity.size) / 2"
                            :y1="wick.low.y"
                            :y2="wick.low.y"
                            :stroke="candlestickConfig.style.layout.wick.extremity.color"
                            :stroke-width="candlestickConfig.style.layout.wick.strokeWidth"
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
                    :x="candle.open.x - slot / 2 + (slot * (1 - candlestickConfig.style.layout.candle.widthRatio) / 2)"
                    :y="candle.isBullish ? candle.last.y : candle.open.y"
                    :height="Math.abs(candle.last.y - candle.open.y)"
                    :width="slot * candlestickConfig.style.layout.candle.widthRatio"
                    :fill="candlestickConfig.style.layout.candle.gradient.underlayer"
                    :rx="candlestickConfig.style.layout.candle.borderRadius"
                    stroke="none"
                />
                <rect
                    v-for="(candle, i) in drawableDataset"
                    :data-cy="`candlestick-rect-${i}`"
                    :x="candle.open.x - slot / 2 + (slot * (1 - candlestickConfig.style.layout.candle.widthRatio) / 2)"
                    :y="candle.isBullish ? candle.last.y : candle.open.y"
                    :height="Math.abs(candle.last.y - candle.open.y)"
                    :width="slot * candlestickConfig.style.layout.candle.widthRatio"
                    :fill="candle.isBullish ? candlestickConfig.style.layout.candle.gradient.show ? `url(#bullish_gradient_${uid})` : candlestickConfig.style.layout.candle.colors.bullish : candlestickConfig.style.layout.candle.gradient.show ? `url(#bearish_gradient_${uid})` : candlestickConfig.style.layout.candle.colors.bearish"
                    :rx="candlestickConfig.style.layout.candle.borderRadius"
                    :stroke="candlestickConfig.style.layout.candle.stroke"
                    :stroke-width="candlestickConfig.style.layout.candle.strokeWidth"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
            </g>

            <!-- TOOLTIP TRAPS -->
            <g>
                <rect 
                    v-for="(rect, i) in drawableDataset"
                    :data-cy="`candlestick-trap-${i}`"
                    :x="drawingArea.left + i * slot"
                    :y="drawingArea.top"
                    :height="drawingArea.height"
                    :width="slot"
                    :fill="hoveredIndex === i ? `${candlestickConfig.style.layout.selector.color}${opacity[candlestickConfig.style.layout.selector.opacity]}` : 'transparent'"
                    @mouseover="useTooltip(i,rect)"
                    @mouseleave="hoveredIndex = undefined; isTooltip = false"
                />
            </g>
            </g>
            <slot name="svg" :svg="svg"/>
        </svg>

        <Skeleton
            v-if="!isDataset"
            :config="{
                type: 'candlesticks',
                style: {
                    backgroundColor: candlestickConfig.style.backgroundColor,
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

        <Slicer v-if="candlestickConfig.style.zoom.show && isDataset"
            :key="`slicer_${slicerStep}`"
            :background="candlestickConfig.style.backgroundColor"
            :fontSize="candlestickConfig.style.zoom.fontSize"
            :useResetSlot="candlestickConfig.style.zoom.useResetSlot"
            :labelLeft="dataset[slicer.start] ? dataset[slicer.start][0] : dataset[0][0]"
            :labelRight="dataset[slicer.end-1] ? dataset[slicer.end-1][0] : dataset.at(-1)[0]"
            :textColor="candlestickConfig.style.color"
            :inputColor="candlestickConfig.style.zoom.color"
            :max="len"
            :min="0"
            :valueStart="slicer.start"
            :valueEnd="slicer.end"
            v-model:start="slicer.start"
            v-model:end="slicer.end"
            @reset="refreshSlicer"
        >
            <template #reset-action="{ reset }">
                <slot name="reset-action" v-bind="{ reset }"/>
            </template>
        </Slicer>
        <slot name="legend" v-bind:legend="drawableDataset"></slot>

        <!-- TOOLTIP -->
        <Tooltip
            :show="candlestickConfig.style.tooltip.show && isTooltip"
            :backgroundColor="candlestickConfig.style.tooltip.backgroundColor"
            :color="candlestickConfig.style.tooltip.color"
            :fontSize="candlestickConfig.style.tooltip.fontSize"
            :parent="candlestickChart"
            :content="tooltipContent"
            :isCustom="candlestickConfig.style.tooltip.customFormat && typeof candlestickConfig.style.tooltip.customFormat === 'function'"
        >
            <template #tooltip-before>
                <slot name="tooltip-before" v-bind="{...dataTooltipSlot}"></slot>
            </template>
            <template #tooltip-after>
                <slot name="tooltip-after" v-bind="{...dataTooltipSlot}"></slot>
            </template>
        </Tooltip>

        <!-- DATA TABLE -->
        <div :style="`${isPrinting ? '' : 'max-height:400px'};overflow:auto;width:100%;margin-top:48px`" v-if="mutableConfig.showTable && isDataset">
            <DataTable
                :colNames="dataTable.colNames"
                :head="dataTable.head"
                :body="dataTable.body"
                :config="dataTable.config"
                :title="`${candlestickConfig.style.title.text}${candlestickConfig.style.title.subtitle.text ? ` : ${candlestickConfig.style.title.subtitle.text}` : ''}`"
            >
                <template #th="{ th }">
                    {{ th }}
                </template>
                <template #td="{ td }">
                    <div v-html="td"/>
                </template>
            </DataTable>
        </div>
    </div>
</template>

<style scoped>
@import "../vue-data-ui.css";

.vue-ui-candlestick *{
    transition: unset;
}
.vue-ui-candlestick {
    user-select: none;
    position: relative;
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