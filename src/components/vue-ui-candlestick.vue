<script setup>
import { ref, computed, onMounted, nextTick } from "vue";
import { treeShake, convertConfigColors, shiftHue, opacity, makeXls } from "../lib";
import mainConfig from "../default_configs.json";
import pdf from "../pdf";
import { useMouse } from "../useMouse";
import { calcTooltipPosition } from "../calcTooltipPosition";

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

const uid = ref(`vue-ui-candlestick-${Math.random()}`);
const defaultConfig = ref(mainConfig.vue_ui_candlestick);

const isPrinting = ref(false);
const tooltip = ref(null);
const details = ref(null);
const clientPosition = ref(useMouse());
const isTooltip = ref(false);
const tooltipContent = ref("");
const candlestickChart = ref(null);
const hoveredIndex = ref(undefined);

onMounted(() => {
    const sliderOne = document.getElementById(`start_${uid.value}`);
    const sliderTwo = document.getElementById(`end_${uid.value}`);
    let minGap = 0;
    const sliderTrack = document.getElementById(`vue-ui-slider-track_${uid.value}`);

    if(sliderOne && sliderTwo && sliderTrack) {
        sliderOne.addEventListener("input", slideOne);
        sliderTwo.addEventListener("input", slideTwo);
        function slideOne(){
            if(parseInt(sliderTwo.value) - parseInt(sliderOne.value) <= minGap){
                sliderOne.value = parseInt(sliderTwo.value) - minGap;
            }
            fillColor();
        }
        function slideTwo(){
            if(parseInt(sliderTwo.value) - parseInt(sliderOne.value) <= minGap){
                sliderTwo.value = parseInt(sliderOne.value) + minGap;
            }
            fillColor();
        }
        function fillColor(){
            let percent1 = (sliderOne.value / props.dataset.length) * 100;
            let percent2 = (sliderTwo.value / props.dataset.length) * 100;
            sliderTrack.style.background = `linear-gradient(to right, #dadae5 ${percent1}% , #858585 ${percent1}% , #858585 ${percent2}%, #dadae5 ${percent2}%)`;
        }
        slideOne();
        slideTwo();
    }
});

const tooltipPosition = computed(() => {
    return calcTooltipPosition({
        tooltip: tooltip.value,
        chart: candlestickChart.value,
        clientPosition: clientPosition.value
    });
});

const candlestickConfig = computed(() => {
    if(!Object.keys(props.config || {}).length) {
        return defaultConfig.value;
    }
    const reconciled = treeShake({
        defaultConfig: defaultConfig.value,
        userConfig: props.config
    });
    return convertConfigColors(reconciled);
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
        min: Math.min(...datasetBreakdown.value.map(ds => ds.low))
    }
});

function convertToPlot(item, index) {
    return {
        ...item,
        x: drawingArea.value.left + (index * slot.value) + (slot.value / 2),
        y: drawingArea.value.top + (1 - (item / extremes.value.max)) * drawingArea.value.height,
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
    return value / extremes.value.max;
}

function canShowValue(value) {
    return ![null, undefined, NaN].includes(value);
}

function closestDecimal(number) {
    if (number === 0) return 0;
    const orderOfMagnitude = Math.floor(Math.log10(Math.abs(number)));
    const powerOf10 = 10 ** orderOfMagnitude;
    let roundedValue;
    if (number < 0) {
        roundedValue = Math.round(number / powerOf10) * powerOf10;
    } else {
        roundedValue = Math.round(number / powerOf10) * powerOf10;
    }
    return roundedValue;
}

const yLabels = computed(() => {
    const positiveStep = closestDecimal(extremes.value.max / candlestickConfig.value.style.layout.grid.yAxis.dataLabels.steps);
    const steps = [];
    for(let i = candlestickConfig.value.style.layout.grid.yAxis.dataLabels.steps; i >= 0; i -= 1) {
        const value = positiveStep * i ;
        steps.push({
            y: drawingArea.value.bottom - (drawingArea.value.height * ratioToMax(positiveStep * i)),
            value,
        });
    }
    return steps;
});

const xLabels = computed(() => {
    return datasetBreakdown.value.map(ds => ds.period)
});

function useTooltip(index) {
    hoveredIndex.value = index;
    if (candlestickConfig.value.style.tooltip.show) {
        let html = "";
        const { period, open, high, low, last, volume, isBullish } = drawableDataset.value[index];
        const { period:tr_period, open:tr_open, high:tr_high, low:tr_low, last:tr_last, volume:tr_volume } = candlestickConfig.value.translations;

        html += `<div><svg style="margin-right:6px" viewBox="0 0 12 12" height="12" width="12"><rect x="0" y="0" height="12" width="12" rx="${candlestickConfig.value.style.layout.candle.borderRadius*3}" stroke="${candlestickConfig.value.style.layout.candle.stroke}" stroke-width="${candlestickConfig.value.style.layout.candle.strokeWidth}" 
            fill="${candlestickConfig.value.style.layout.candle.gradient.show 
                ? isBullish 
                    ? `url(#bullish_gradient_${uid.value})` 
                    : `url(#bearish_gradient_${uid.value})` 
                : isBullish 
                    ? candlestickConfig.value.style.layout.candle.colors.bullish 
                    : candlestickConfig.value.style.layout.candle.colors.bearish}"/></svg>${period}</div>`;
        html += `${tr_volume} : <b>${ isNaN(volume) ? '-' : Number(volume.toFixed(candlestickConfig.value.style.tooltip.roundingValue)).toLocaleString()}</b>`;
        html += `<div style="margin-top:6px;padding-top:6px;border-top:1px solid #e1e5e8">`;
        html += `<div>${tr_open} : <b>${candlestickConfig.value.style.tooltip.prefix} ${isNaN(open.value) ? '-' : Number(open.value.toFixed(candlestickConfig.value.style.tooltip.roundingValue)).toLocaleString()} ${candlestickConfig.value.style.tooltip.suffix}</b></div>`;
        html += `<div>${tr_high} : <b>${candlestickConfig.value.style.tooltip.prefix} ${isNaN(high.value) ? '-' : Number(high.value.toFixed(candlestickConfig.value.style.tooltip.roundingValue)).toLocaleString()} ${candlestickConfig.value.style.tooltip.suffix}</b></div>`;
        html += `<div>${tr_low} : <b>${candlestickConfig.value.style.tooltip.prefix} ${isNaN(low.value) ? '-' : Number(low.value.toFixed(candlestickConfig.value.style.tooltip.roundingValue)).toLocaleString()} ${candlestickConfig.value.style.tooltip.suffix}</b></div>`;
        html += `<div>${tr_last} : <b>${candlestickConfig.value.style.tooltip.prefix} ${isNaN(last.value) ? '-' : Number(last.value.toFixed(candlestickConfig.value.style.tooltip.roundingValue)).toLocaleString()} ${candlestickConfig.value.style.tooltip.suffix}</b></div>`;
        html += `</div>`;

        tooltipContent.value = `<div style="text-align:right">${html}</div>`
        isTooltip.value = true;
    }
}

function generatePdf(){
    isPrinting.value = true;
    nextTick(() => {
        pdf({
            domElement: document.getElementById(`vue-ui-candlestick_${uid.value}`),
            fileName: candlestickConfig.value.style.title.text || 'vue-ui-candlestick'
        }).finally(() => {
            isPrinting.value = false;
        });
    })
}

function generateXls() {
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

        makeXls(tableXls, candlestickConfig.value.style.title.text || "vue-ui-candlestick");
    });
}

function closeDetails(){
    if(details.value) {
        details.value.removeAttribute("open")
    }
}

</script>

<template>
    <div ref="candlestickChart" class="vue-ui-candlestick" :style="`font-family:${candlestickConfig.style.fontFamily};width:100%; text-align:center`" :id="`vue-ui-candlestick_${uid}`">

        <div v-if="(!mutableConfig.inside || isPrinting) && candlestickConfig.style.title.text" :style="`width:100%;background:${candlestickConfig.style.backgroundColor}`">
            <!-- TITLE AS DIV -->
            <div :style="`width:100%;text-align:center;color:${candlestickConfig.style.title.color};font-size:${candlestickConfig.style.title.fontSize}px;font-weight:${candlestickConfig.style.title.bold ? 'bold': ''}`">
                {{ candlestickConfig.style.title.text }}
            </div>
            <div v-if="candlestickConfig.style.title.subtitle.text" :style="`width:100%;text-align:center;color:${candlestickConfig.style.title.subtitle.color};font-size:${candlestickConfig.style.title.subtitle.fontSize}px;font-weight:${candlestickConfig.style.title.subtitle.bold ? 'bold': ''}`">
                {{ candlestickConfig.style.title.subtitle.text }}
            </div>
        </div>

         <!-- OPTIONS -->
         <details class="vue-ui-candlestick-user-options" :style="`background:${candlestickConfig.style.backgroundColor};color:${candlestickConfig.style.color}`" data-html2canvas-ignore v-if="candlestickConfig.userOptions.show" ref="details">
            <summary :style="`background:${candlestickConfig.style.backgroundColor};color:${candlestickConfig.style.color}`">{{ candlestickConfig.userOptions.title }}</summary>

            <div class="vue-ui-candlestick-user-options-items" :style="`background:${candlestickConfig.style.backgroundColor};color:${candlestickConfig.style.color}`">
                <div class="vue-ui-candlestick-user-option-item">
                    <input type="checkbox" :id="`vue-ui-candlestick-option-title_${uid}`" :name="`vue-ui-candlestick-option-title_${uid}`"
                    v-model="mutableConfig.inside">
                    <label :for="`vue-ui-candlestick-option-title_${uid}`">{{ candlestickConfig.userOptions.labels.useDiv }}</label>
                </div>
                <div class="vue-ui-candlestick-user-option-item">
                    <input type="checkbox" :id="`vue-ui-candlestick-option-table_${uid}`" :name="`vue-ui-candlestick-option-table_${uid}`"
                    v-model="mutableConfig.showTable">
                    <label :for="`vue-ui-candlestick-option-table_${uid}`">{{ candlestickConfig.userOptions.labels.showTable }}</label>
                </div>
                <button class="vue-ui-candlestick-button" @click="generatePdf" :disabled="isPrinting" style="margin-top:12px" :style="`background:${candlestickConfig.style.backgroundColor};color:${candlestickConfig.style.color}`">
                    <svg class="vue-ui-candlestick-print-icon" xmlns="http://www.w3.org/2000/svg" v-if="isPrinting" width="20" height="20" viewBox="0 0 24 24" stroke-width="1.5" :stroke="candlestickConfig.style.color" fill="none" stroke-linecap="round" stroke-linejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                        <path d="M18 16v.01" />
                        <path d="M6 16v.01" />
                        <path d="M12 5v.01" />
                        <path d="M12 12v.01" />
                        <path d="M12 1a4 4 0 0 1 2.001 7.464l.001 .072a3.998 3.998 0 0 1 1.987 3.758l.22 .128a3.978 3.978 0 0 1 1.591 -.417l.2 -.005a4 4 0 1 1 -3.994 3.77l-.28 -.16c-.522 .25 -1.108 .39 -1.726 .39c-.619 0 -1.205 -.14 -1.728 -.391l-.279 .16l.007 .231a4 4 0 1 1 -2.212 -3.579l.222 -.129a3.998 3.998 0 0 1 1.988 -3.756l.002 -.071a4 4 0 0 1 -1.995 -3.265l-.005 -.2a4 4 0 0 1 4 -4z" />
                    </svg>
                    <span v-else>PDF</span>
                </button>
                <button class="vue-ui-candlestick-button" @click="generateXls" :style="`background:${candlestickConfig.style.backgroundColor};color:${candlestickConfig.style.color}`">
                    XLSX
                </button>
            </div>
        </details>
        

        <!-- CHART -->
        <svg :viewBox="`0 0 ${svg.width} ${svg.height}`" :style="`max-width:100%;overflow:visible;background:${candlestickConfig.style.backgroundColor};color:${candlestickConfig.style.color}`" @click="closeDetails">
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
                    :x1="drawingArea.left"
                    :x2="drawingArea.left"
                    :y1="drawingArea.top"
                    :y2="drawingArea.bottom"
                    :stroke="candlestickConfig.style.layout.grid.stroke"
                    :stroke-width="candlestickConfig.style.layout.grid.strokeWidth"
                />
                <line
                    :x1="drawingArea.left"
                    :x2="drawingArea.right"
                    :y1="drawingArea.bottom"
                    :y2="drawingArea.bottom"
                    :stroke="candlestickConfig.style.layout.grid.stroke"
                    :stroke-width="candlestickConfig.style.layout.grid.strokeWidth"
                />
            </g>

            <!-- LABELS -->
            <!-- Y LABELS -->
            <g v-if="candlestickConfig.style.layout.grid.yAxis.dataLabels.show">
                <g v-for="(yLabel, i) in yLabels">
                    <line 
                        v-if="yLabel.value >= 0 && yLabel.value <= extremes.max"
                        :x1="drawingArea.left" 
                        :x2="drawingArea.left - 5" 
                        :y1="yLabel.y" 
                        :y2="yLabel.y" 
                        :stroke="candlestickConfig.style.layout.grid.stroke" 
                        :stroke-width="candlestickConfig.style.layout.grid.strokeWidth" 
                    />
                    <text 
                        v-if="yLabel.value >= 0 && yLabel.value <= extremes.max" 
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
                <g v-for="wick in drawableDataset">
                    <line 
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
                            :x1="wick.high.x - (candlestickConfig.style.layout.wick.extremity.size === 'auto' ? slot * candlestickConfig.style.layout.candle.widthRatio : candlestickConfig.style.layout.wick.extremity.size) / 2"
                            :x2="wick.high.x + (candlestickConfig.style.layout.wick.extremity.size === 'auto' ? slot * candlestickConfig.style.layout.candle.widthRatio : candlestickConfig.style.layout.wick.extremity.size) / 2"
                            :y1="wick.high.y"
                            :y2="wick.high.y"
                            :stroke="candlestickConfig.style.layout.wick.extremity.color"
                            :stroke-width="candlestickConfig.style.layout.wick.strokeWidth"
                            stroke-linecap="round"
                        />
                        <line 
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
                    v-for="candle in drawableDataset"
                    :x="candle.open.x - slot / 2 + (slot * (1 - candlestickConfig.style.layout.candle.widthRatio) / 2)"
                    :y="candle.isBullish ? candle.last.y : candle.open.y"
                    :height="Math.abs(candle.last.y - candle.open.y)"
                    :width="slot * candlestickConfig.style.layout.candle.widthRatio"
                    :fill="candlestickConfig.style.layout.candle.gradient.underlayer"
                    :rx="candlestickConfig.style.layout.candle.borderRadius"
                    stroke="none"
                />
                <rect
                    v-for="candle in drawableDataset"
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
                    v-for="(_, i) in drawableDataset"
                    :x="drawingArea.left + i * slot"
                    :y="drawingArea.top"
                    :height="drawingArea.height"
                    :width="slot"
                    :fill="hoveredIndex === i ? `${candlestickConfig.style.layout.selector.color}${opacity[candlestickConfig.style.layout.selector.opacity]}` : 'transparent'"
                    @mouseover="useTooltip(i)"
                    @mouseleave="hoveredIndex = undefined; isTooltip = false"
                />
            </g>
            </g>
        </svg>

        <!-- SLICER -->
        <div v-if="candlestickConfig.style.zoom.show" class="vue-ui-candlestick-range-slider-wrapper" data-html2canvas-ignore>
            <div class="vue-ui-candlestick-range-slider-label-left">
                {{ dataset[slicer.start] ? dataset[slicer.start][0] : dataset[0][0] }}
            </div>
            <div class="vue-ui-candlestick-range-slider">
                <div class="vue-ui-candlestick-slider-track" :id="`vue-ui-slider-track_${uid}`"></div>
                    <input :id="`start_${uid}`" type="range" :style="`border:none !important;accent-color:${candlestickConfig.style.zoom.color}`" :min="0" :max="len" v-model="slicer.start">
                    <input :id="`end_${uid}`" type="range" :style="`border:none !important;accent-color:${candlestickConfig.style.zoom.color}`" :min="0" :max="len" v-model="slicer.end">

            </div>
            <div class="vue-ui-candlestick-range-slider-label-right">
                {{ dataset[slicer.end-1] ? dataset[slicer.end-1][0] : dataset.at(-1)[0] }}
            </div>
        </div>

        <!-- TOOLTIP -->
        <div 
            class="vue-ui-candlestick-tooltip"
            ref="tooltip"
            v-if="candlestickConfig.style.tooltip.show && isTooltip"
            :style="`top:${tooltipPosition.top}px;left:${tooltipPosition.left}px;background:${candlestickConfig.style.tooltip.backgroundColor};color:${candlestickConfig.style.tooltip.color}`"
            v-html="tooltipContent"
        />

        <!-- DATA TABLE -->
        <div @click="closeDetails" :style="`${isPrinting ? '' : 'max-height:400px'};overflow:auto;width:100%;margin-top:48px`" v-if="mutableConfig.showTable">
            <table>
                <thead>
                    <tr v-if="candlestickConfig.style.title.text">
                        <th :colspan="6" :style="`background:${candlestickConfig.table.th.backgroundColor};color:${candlestickConfig.table.th.color};outline:${candlestickConfig.table.th.outline}`">
                            <span>{{ candlestickConfig.style.title.text }}</span>
                            <span v-if="candlestickConfig.style.title.subtitle.text">
                                : {{ candlestickConfig.style.title.subtitle.text }}
                            </span>
                        </th>
                    </tr>
                    <tr>
                        <th :style="`background:${candlestickConfig.table.th.backgroundColor};color:${candlestickConfig.table.th.color};outline:${candlestickConfig.table.th.outline};padding-right:6px`">
                            {{ candlestickConfig.translations.period }}
                        </th>
                        <th :style="`background:${candlestickConfig.table.th.backgroundColor};color:${candlestickConfig.table.th.color};outline:${candlestickConfig.table.th.outline};padding-right:6px`">
                            {{ candlestickConfig.translations.open }}
                        </th>
                        <th :style="`background:${candlestickConfig.table.th.backgroundColor};color:${candlestickConfig.table.th.color};outline:${candlestickConfig.table.th.outline};padding-right:6px`">
                            {{ candlestickConfig.translations.high }}
                        </th>
                        <th :style="`background:${candlestickConfig.table.th.backgroundColor};color:${candlestickConfig.table.th.color};outline:${candlestickConfig.table.th.outline};padding-right:6px`">
                            {{ candlestickConfig.translations.low }}
                        </th>
                        <th :style="`background:${candlestickConfig.table.th.backgroundColor};color:${candlestickConfig.table.th.color};outline:${candlestickConfig.table.th.outline};padding-right:6px`">
                            {{ candlestickConfig.translations.last }}
                        </th>
                        <th :style="`background:${candlestickConfig.table.th.backgroundColor};color:${candlestickConfig.table.th.color};outline:${candlestickConfig.table.th.outline};padding-right:6px`">
                            {{ candlestickConfig.translations.volume }}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(tr, i) in drawableDataset">
                        <td :style="`background:${candlestickConfig.table.td.backgroundColor};color:${candlestickConfig.table.td.color};outline:${candlestickConfig.table.td.outline}`">
                            <div style="display:flex;flex-direction:row;gap:3px;align-items:center">
                                <svg viewBox="0 0 12 12" height="12" width="12" style="margin-right: 6px">
                                    <rect
                                        x="0"
                                        y="0"
                                        height="12"
                                        width="12"
                                        :rx="candlestickConfig.style.layout.candle.borderRadius*3"
                                        :fill="`${candlestickConfig.style.layout.candle.gradient.show 
                                        ? tr.isBullish 
                                            ? `url(#bullish_gradient_${uid})` 
                                            : `url(#bearish_gradient_${uid})` 
                                        : tr.isBullish 
                                            ? candlestickConfig.style.layout.candle.colors.bullish 
                                            : candlestickConfig.style.layout.candle.colors.bearish}`"
                                    />
                                </svg>
                                <span>{{ tr.period }}</span>
                            </div>
                        </td>
                        <td :style="`background:${candlestickConfig.table.td.backgroundColor};color:${candlestickConfig.table.td.color};outline:${candlestickConfig.table.td.outline}`">
                           {{ candlestickConfig.table.td.prefix }} {{ isNaN(tr.open.value) ? '-' : Number(tr.open.value.toFixed(candlestickConfig.table.td.roundingValue)).toLocaleString() }} {{ candlestickConfig.table.td.suffix }}
                        </td>
                        <td :style="`background:${candlestickConfig.table.td.backgroundColor};color:${candlestickConfig.table.td.color};outline:${candlestickConfig.table.td.outline}`">
                            {{ candlestickConfig.table.td.prefix }} {{ isNaN(tr.high.value) ? '-' : tr.high.value }} {{ candlestickConfig.table.td.suffix }}
                        </td>
                        <td :style="`background:${candlestickConfig.table.td.backgroundColor};color:${candlestickConfig.table.td.color};outline:${candlestickConfig.table.td.outline}`">
                            {{ candlestickConfig.table.td.prefix }} {{ isNaN(tr.low.value) ? '-' : tr.low.value }} {{ candlestickConfig.table.td.suffix }}
                        </td>
                        <td :style="`background:${candlestickConfig.table.td.backgroundColor};color:${candlestickConfig.table.td.color};outline:${candlestickConfig.table.td.outline}`">
                            {{ candlestickConfig.table.td.prefix }} {{ isNaN(tr.last.value) ? '-'  : tr.last.value }} {{ candlestickConfig.table.td.suffix }}
                        </td>
                        <td :style="`background:${candlestickConfig.table.td.backgroundColor};color:${candlestickConfig.table.td.color};outline:${candlestickConfig.table.td.outline}`">
                            {{ tr.volume }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<style scoped>
.vue-ui-candlestick *{
    transition: unset;
}
.vue-ui-candlestick {
    user-select: none;
    position: relative;
    padding-top: 36px;
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

/** */
.vue-ui-candlestick-tooltip {
    border: 1px solid #e1e5e8;
    border-radius: 4px;
    box-shadow: 0 6px 12px -6px rgba(0,0,0,0.2);
    max-width: 300px;
    position: fixed;
    padding:12px;
    z-index:1;
}
.vue-ui-candlestick-user-options {
    border-radius: 4px;
    padding: 6px 12px;
    position: absolute;
    right:0;
    top:0px;
    max-width: 300px;
    text-align:left;
}
.vue-ui-candlestick-user-options[open] {
    border: 1px solid #e1e5e8;
    box-shadow: 0 6px 12px -6px rgba(0,0,0,0.2);
}
.vue-ui-candlestick summary {
    text-align: right;
    direction: rtl;
}
.vue-ui-candlestick-user-options-items {
    width: 100%;
    display: flex;
    flex-direction: column;
    margin-top: 6px;
}
.vue-ui-candlestick-user-options-item {
    width: 100%;
    display: flex;
    flex-direction: row;
    gap: 5px;
    align-items:center;
}

.vue-ui-candlestick-button {
    margin: 6px 0;
    border-radius: 3px;
    height: 30px;
    border: 1px solid #b9bfc4;
    background: inherit;
    display: flex;
    align-items:center;
    justify-content: center;
}
.vue-ui-candlestick-button:hover {
    background: rgba(0,0,0,0.05);
}
.vue-ui-candlestick-print-icon {
    animation: smartspin 0.5s infinite linear;
}
@keyframes smartspin {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

.vue-ui-candlestick table {
    width: 100%;
    border-collapse:collapse;
}
.vue-ui-candlestick table td {
    text-align:right;
    padding-right: 6px;
    font-variant-numeric: tabular-nums;
}
.vue-ui-candlestick table th {
    position: sticky;
    top:0;
    font-weight: 400;
    user-select: none;
}

.vue-ui-candlestick-range-slider-wrapper {
    width: 100%;
    display: flex;
    flex-direction: row;
    gap: 6px;
    align-items:center;
}
.vue-ui-candlestick-range-slider {
    position: relative;
    width: 100%;
    height: 12px;
}
.vue-ui-candlestick-range-slider-label-right,
.vue-ui-candlestick-range-slider-label-left {
    width: 130px;
}

.vue-ui-candlestick-range-slider-label-right {
    text-align: left;
}

.vue-ui-candlestick-range-slider-label-left {
    text-align: right;
}

input[type="range"]{
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    width: 100%;
    outline: none;
    position: absolute;
    margin: auto;
    top: 0;
    bottom: 0;
    left:0;
    background-color: transparent;
    pointer-events: none;
}

.vue-ui-candlestick-slider-track {
    width: 100%;
    height: 5px;
    position: absolute;
    margin: auto;
    top: 0;
    bottom: 0;
    border-radius: 5px;
}
input[type="range"]::-webkit-slider-runnable-track{
    -webkit-appearance: none;
    height: 5px;
}
input[type="range"]::-moz-range-track{
    -moz-appearance: none;
    height: 5px;
}
input[type="range"]::-ms-track{
    appearance: none;
    height: 5px;
}
input[type="range"]::-webkit-slider-thumb{
    -webkit-appearance: none;
    height: 1.3em;
    width: 1.3em;
    background-color: #858585;
    cursor: pointer;
    margin-top: -6px;
    pointer-events: auto;
    border-radius: 50%;
}
input[type="range"]::-moz-range-thumb{
    -webkit-appearance: none;
    appearance: none;
    height: 1.3em;
    width: 1.3em;
    cursor: pointer;
    border-radius: 50%;
    background-color: #858585;
    pointer-events: auto;
}
input[type="range"]::-ms-thumb{
    appearance: none;
    height: 1.3em;
    width: 1.3em;
    cursor: pointer;
    border-radius: 50%;
    background-color: #858585;
    pointer-events: auto;
}
input[type="range"]:active::-webkit-slider-thumb{
    background-color: #CCCCCC;
    border: 3px solid #858585;
}
</style>