<script setup>
import { ref, computed, onMounted, nextTick, onBeforeUnmount, watch, defineAsyncComponent, shallowRef, watchEffect, toRefs } from "vue";
import { 
    calculateNiceScale,
    checkNaN, 
    createCsvContent, 
    createUid, 
    dataLabel, 
    downloadCsv,
    error,
    functionReturnsString,
    hasDeepProperty,
    isFunction,
    objectIsEmpty,
    setOpacity,
    shiftHue,
    translateSize,
    treeShake,
    XMLNS
} from "../lib";
import { throttle } from "../canvas-lib";
import { useNestedProp } from "../useNestedProp";
import { usePrinter } from "../usePrinter";
import { useResponsive } from "../useResponsive";
import { useConfig } from "../useConfig";
import { useUserOptionState } from "../useUserOptionState";
import { useChartAccessibility } from "../useChartAccessibility";
import { useLoading } from '../useLoading.js';
import themes from "../themes.json";
import Title from "../atoms/Title.vue"; // Must be ready in responsive mode
import Slicer from "../atoms/Slicer.vue"; // Must be ready in responsive mode
import { useTimeLabels } from "../useTimeLabels";
import img from "../img";
import { useTimeLabelCollision } from "../useTimeLabelCollider";
import BaseScanner from "../atoms/BaseScanner.vue";

const Accordion = defineAsyncComponent(() => import('./vue-ui-accordion.vue'));
const DataTable = defineAsyncComponent(() => import('../atoms/DataTable.vue'));
const PackageVersion = defineAsyncComponent(() => import('../atoms/PackageVersion.vue'));
const PenAndPaper = defineAsyncComponent(() => import('../atoms/PenAndPaper.vue'));
const Tooltip = defineAsyncComponent(() => import('../atoms/Tooltip.vue'));
const UserOptions = defineAsyncComponent(() => import('../atoms/UserOptions.vue'));

const { vue_ui_candlestick: DEFAULT_CONFIG } = useConfig();

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
const scaleLabels = ref(null);
const timeLabelsEls = ref(null);

const FINAL_CONFIG = ref(prepareConfig());

// v3 - Skeleton loader management
const { loading, FINAL_DATASET, manualLoading } = useLoading({
    ...toRefs(props),
    FINAL_CONFIG,
    prepareConfig,
    callback: () => {
        Promise.resolve().then(async () => {
            await setupSlicer();
        })
    },
    skeletonDataset: [
        [1704067200000, 10, 20, 2, 10, 30],
        [1706745600000, 10, 30, 5, 20, 50],
        [1709251200000, 20, 50, 10, 30, 80],
        [1711929600000, 30, 80, 20, 50, 130],
        [1714521600000, 50, 130, 30, 100, 210],
        [1717200000000, 80, 210, 50, 150, 340],
        [1719792000000, 130, 340, 80, 280, 550],
        [1722470400000, 210, 550, 130, 50, 890],
        [1725148800000, 340, 890, 210, 750, 1440],
        [1727740800000, 550, 1440, 340, 1230, 2330],
        [1730419200000, 890, 2330, 550, 1950, 3770],
        [1733011200000, 1440, 3770, 890, 3200, 5100],
    ],
    skeletonConfig: treeShake({
        defaultConfig: FINAL_CONFIG.value,
        userConfig: {
            useCssAnimation: false,
            userOptions: { show: false },
            table: { show: false },
            style: {
                backgroundColor: '#99999930',
                layout: {
                    candle: {
                        colors: {
                            bearish: '#BABABA',
                            bullish: '#CACACA'
                        }
                    },
                    grid: { 
                        stroke: '#6A6A6A',
                        yAxis: {
                            dataLabels: { show: false },
                            scale: {
                                min: null,
                                max: null
                            }
                        } 
                    },
                    wick: {
                        stroke: '#6A6A6A',
                        extremity: {
                            color: '#6A6A6A'
                        }
                    }
                },
                tooltip: { show: false },
                zoom: { 
                    show: false,
                    startIndex: null,
                    endIndex: null
                }
            }
        }
    })
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

    if (props.config && hasDeepProperty(props.config, 'style.layout.grid.yAxis.scale.min')) {
        finalConfig.style.layout.grid.yAxis.scale.min = props.config.style.layout.grid.yAxis.scale.min;
    } else {
        finalConfig.style.layout.grid.yAxis.scale.min = null;
    }

    if (props.config && hasDeepProperty(props.config, 'style.layout.grid.yAxis.scale.max')) {
        finalConfig.style.layout.grid.yAxis.scale.max = props.config.style.layout.grid.yAxis.scale.max;
    } else {
        finalConfig.style.layout.grid.yAxis.scale.max = null;
    }

    // ----------------------------------------------------------------------------

    return finalConfig;
}

watch(() => props.config, (_newCfg) => {
    if (!loading.value) {
        FINAL_CONFIG.value = prepareConfig();
    }
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
    if (Array.isArray(newDs) && newDs.length > 0) {
        manualLoading.value = false;
    }
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

const resizeObserver = shallowRef(null);
const observedEl = shallowRef(null);

onMounted(() => {
    prepareChart();
});

const debug = computed(() => !!FINAL_CONFIG.value.debug);

function prepareChart() {
    if(objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiCandlestick',
            type: 'dataset',
            debug: debug.value
        });
        manualLoading.value = true; // v3
    }

    // v3
    if (!objectIsEmpty(props.dataset)) {
        manualLoading.value = FINAL_CONFIG.value.loading;
    }

    if (FINAL_CONFIG.value.responsive) {
        const additionalPad = 12;
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
                svg.value.height = height - additionalPad;
                if (FINAL_CONFIG.value.responsiveProportionalSizing) {
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
                } else {
                    svg.value.xAxisFontSize = FINAL_CONFIG.value.style.layout.grid.xAxis.dataLabels.fontSize;
                    svg.value.yAxisFontSize = FINAL_CONFIG.value.style.layout.grid.yAxis.dataLabels.fontSize;
                }
            });
        });

        if (resizeObserver.value) {
            if (observedEl.value) {
                resizeObserver.value.unobserve(observedEl.value);
            }
            resizeObserver.value.disconnect();
        }

        resizeObserver.value = new ResizeObserver(handleResize);
        observedEl.value = candlestickChart.value.parentNode;
        resizeObserver.value.observe(observedEl.value);
    }
    setupSlicer();
}

onBeforeUnmount(() => {
    if (resizeObserver.value) {
        if (observedEl.value) {
            resizeObserver.value.unobserve(observedEl.value);
        }
        resizeObserver.value.disconnect();
    }
});

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `vue-ui-candlestick_${uid.value}`,
    fileName: FINAL_CONFIG.value.style.title.text || 'vue-ui-candlestick',
    options: FINAL_CONFIG.value.userOptions.print
});

const hasOptionsNoTitle = computed(() => {
    return FINAL_CONFIG.value.userOptions.show && !FINAL_CONFIG.value.style.title.text;
});

const mutableConfig = ref({
    showTable: FINAL_CONFIG.value.table.show,
    showTooltip: FINAL_CONFIG.value.style.tooltip.show
});

const timeLabelsHeight = ref(0);

const updateHeight = throttle((h) => {
    timeLabelsHeight.value = h;
}, 100);

// Track time label height to update drawing area when they rotate
watchEffect((onInvalidate) => {
    const el = timeLabelsEls.value;
    if (!el) return;

    const observer = new ResizeObserver(entries => {
        updateHeight(entries[0].contentRect.height);
    });
    observer.observe(el);
    onInvalidate(() => observer.disconnect());
});

onBeforeUnmount(() => {
    timeLabelsHeight.value = 0;
});

const timeLabelsY = computed(() => {
    let tlH = 0;
    if (timeLabelsEls.value) {
        tlH = timeLabelsHeight.value + svg.value.xAxisFontSize;
    }
    return tlH;
});

function getScaleLabelX() {
    let base = FINAL_CONFIG.value.style.layout.grid.yAxis.dataLabels.offsetX
    if (scaleLabels.value) {
        const texts = Array.from(scaleLabels.value.querySelectorAll('text'))
        base = texts.reduce((max, t) => {
        const w = t.getComputedTextLength()
        return w > max ? w : max
        }, 0)
    }

    const crosshair = 13
    return base + crosshair
}

const drawingArea = computed(() => {
    const {top: pt, right: pr, bottom: pb, left:pl} = FINAL_CONFIG.value.style.layout.padding;
    const _scaleLabelsX = getScaleLabelX();
    const topOffset = 12;

    return {
        top: pt + topOffset,
        right: svg.value.width - pr,
        left: pl + _scaleLabelsX,
        bottom: svg.value.height - pb - timeLabelsY.value,
        width: svg.value.width - pl - pr - _scaleLabelsX,
        height: svg.value.height - pt - pb - timeLabelsY.value - topOffset
    }
});

const len = computed(() => FINAL_DATASET.value.length);

const slicer = ref({
    start: 0,
    end: len.value
});

const mutableDataset = computed(() => {
    return FINAL_DATASET.value.map((ds, i) => {
        return {
            ...ds,
            absoluteIndex: i
        }
    }).slice(slicer.value.start, slicer.value.end);
});

const datasetBreakdown = computed(() => {

    FINAL_DATASET.value.forEach((ds, i) => {
        if([null, undefined].includes(ds[0])){
            error({
                componentName: 'VueUiCandlestick',
                type: 'datasetAttribute',
                property: 'period (index 0)',
                index: i,
                debug: debug.value
            })
        }
        if([null, undefined].includes(ds[1])){
            error({
                componentName: 'VueUiCandlestick',
                type: 'datasetAttribute',
                property: 'open (index 1)',
                index: i,
                debug: debug.value
            })
        }
        if([null, undefined].includes(ds[2])){
            error({
                componentName: 'VueUiCandlestick',
                type: 'datasetAttribute',
                property: 'high (index 2)',
                index: i,
                debug: debug.value
            })
        }
        if([null, undefined].includes(ds[3])){
            error({
                componentName: 'VueUiCandlestick',
                type: 'datasetAttribute',
                property: 'low (index 3)',
                index: i,
                debug: debug.value
            })
        }
        if([null, undefined].includes(ds[4])){
            error({
                componentName: 'VueUiCandlestick',
                type: 'datasetAttribute',
                property: 'last (index 4)',
                index: i,
                debug: debug.value
            })
        }
        if([null, undefined].includes(ds[5])){
            error({
                componentName: 'VueUiCandlestick',
                type: 'datasetAttribute',
                property: 'volume (index 5)',
                index: i,
                debug: debug.value
            })
        }
    })

    return mutableDataset.value.map(ds => {
        return {
            absoluteIndex: ds.absoluteIndex,
            period: ds[0],
            open: ds[1],
            high: ds[2],
            low: ds[3],
            last: ds[4],
            volume: ds[5],
        }
    });
});

const slot = computed(() => {
    return drawingArea.value.width / mutableDataset.value.length
})

const extremes = computed(() => {
    const max = FINAL_CONFIG.value.style.layout.grid.yAxis.scale.max === null ? Math.max(...datasetBreakdown.value.map(ds => ds.high)) : FINAL_CONFIG.value.style.layout.grid.yAxis.scale.max;
    const min = FINAL_CONFIG.value.style.layout.grid.yAxis.scale.min === null ? 0 : FINAL_CONFIG.value.style.layout.grid.yAxis.scale.min;

    return {
        max,
        min
    }
});

const niceScale = computed(() => {
    return calculateNiceScale(extremes.value.min, extremes.value.max, FINAL_CONFIG.value.style.layout.grid.yAxis.dataLabels.steps)
})

function convertToPlot(item, index) {
    return {
        ...item,
        x: checkNaN(drawingArea.value.left + (index * slot.value) + (slot.value / 2)),
        y: checkNaN(drawingArea.value.top + (1 - ((item - niceScale.value.min) / (niceScale.value.max - niceScale.value.min))) * drawingArea.value.height),
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
            isBullish,
            absoluteIndex: ds.absoluteIndex
        }
    });
});

function ratioToMax(value) {
    return checkNaN((value - niceScale.value.min) / (niceScale.value.max - niceScale.value.min));
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

const timeLabels = computed(() => {
    return useTimeLabels({
        values: FINAL_DATASET.value.map(ds => ds[0]),
        maxDatapoints: FINAL_DATASET.value.length,
        formatter: FINAL_CONFIG.value.style.layout.grid.xAxis.dataLabels.datetimeFormatter,
        start: slicer.value.start,
        end: slicer.value.end
    })
});

const slicerLabels = computed(() => {
    if (!FINAL_CONFIG.value.style.layout.grid.xAxis.dataLabels.datetimeFormatter.enable) {
        return {
            start: FINAL_DATASET.value[slicer.value.start] ? FINAL_DATASET.value[slicer.value.start][0] : FINAL_DATASET.value[0][0],
            end: FINAL_DATASET.value[slicer.value.end - 1] ? FINAL_DATASET.value[slicer.value.end - 1][0] : FINAL_DATASET.value.at(-1)[0]
        }
    } else {
        return {
            start: timeLabels.value.find(el => el.absoluteIndex === slicer.value.start).text,
            end: timeLabels.value.find(el => el.absoluteIndex === slicer.value.end - 1).text
        }
    }
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

            const timeLabel = !FINAL_CONFIG.value.style.layout.grid.xAxis.dataLabels.datetimeFormatter.enable ? period : timeLabels.value[index].text
    
            html += `<div data-cy="candlestick-tooltip-period"><svg style="margin-right:6px" viewBox="0 0 12 12" height="12" width="12"><rect x="0" y="0" height="12" width="12" rx="${FINAL_CONFIG.value.style.layout.candle.borderRadius*3}" stroke="${FINAL_CONFIG.value.style.layout.candle.stroke}" stroke-width="${FINAL_CONFIG.value.style.layout.candle.strokeWidth}" 
                fill="${FINAL_CONFIG.value.style.layout.candle.gradient.show 
                    ? isBullish 
                        ? `url(#bullish_gradient_${uid.value})` 
                        : `url(#bearish_gradient_${uid.value})` 
                    : isBullish 
                        ? FINAL_CONFIG.value.style.layout.candle.colors.bullish 
                        : FINAL_CONFIG.value.style.layout.candle.colors.bearish}"/></svg>${timeLabel}</div>`;
            html += `${tr_volume} : <b data-cy="candlestick-tooltip-volume">${ isNaN(volume) ? '-' : Number(volume.toFixed(FINAL_CONFIG.value.style.tooltip.roundingValue)).toLocaleString()}</b>`;
            html += `<div style="margin-top:6px;padding-top:6px;border-top:1px solid ${FINAL_CONFIG.value.style.tooltip.borderColor}">`;
                
            const label_open = dataLabel({
                p: FINAL_CONFIG.value.style.tooltip.prefix,
                v: open.value,
                s: FINAL_CONFIG.value.style.tooltip.suffix,
                r: FINAL_CONFIG.value.style.tooltip.roundingValue
            });

            html += `<div>${tr_open}: <b>${label_open}</b></div>`;

            const label_high = dataLabel({
                p: FINAL_CONFIG.value.style.tooltip.prefix,
                v: high.value,
                s: FINAL_CONFIG.value.style.tooltip.suffix,
                r: FINAL_CONFIG.value.style.tooltip.roundingValue
            });

            html += `<div>${tr_high}: <b>${label_high}</b></div>`;

            const label_low = dataLabel({
                p: FINAL_CONFIG.value.style.tooltip.prefix,
                v: low.value,
                s: FINAL_CONFIG.value.style.tooltip.suffix,
                r: FINAL_CONFIG.value.style.tooltip.roundingValue
            });

            html += `<div>${tr_low}: <b>${label_low}</b></div>`;

            const label_last = dataLabel({
                p: FINAL_CONFIG.value.style.tooltip.prefix,
                v: last.value,
                s: FINAL_CONFIG.value.style.tooltip.suffix,
                r: FINAL_CONFIG.value.style.tooltip.roundingValue
            });

            html += `<div>${tr_last}: <b>${label_last}</b></div>`;
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

function generateCsv(callback=null) {
    nextTick(() => {
        const labels = [FINAL_CONFIG.value.translations.period, FINAL_CONFIG.value.translations.open, FINAL_CONFIG.value.translations.high, FINAL_CONFIG.value.translations.low, FINAL_CONFIG.value.translations.last, FINAL_CONFIG.value.translations.volume];

        const values = drawableDataset.value.map((ds, i) => {
            return [
                !FINAL_CONFIG.value.style.layout.grid.xAxis.dataLabels.datetimeFormatter.enable ? ds.period : timeLabels.value[i].text,
                ds.open.value,
                ds.high.value,
                ds.low.value,
                ds.last.value,
                ds.volume
            ]
        });

        const tableXls = [[FINAL_CONFIG.value.style.title.text],[FINAL_CONFIG.value.style.title.subtitle.text],[[""],[""],[""]]].concat([labels]).concat(values)
        const csvContent = createCsvContent(tableXls);
        if(!callback) {
            downloadCsv({ csvContent, title: FINAL_CONFIG.value.style.title.text || "vue-ui-candlestick"});
        } else {
            callback(csvContent);
        }
    });
}

const dataTable = computed(() => {
    const body = drawableDataset.value.map((ds, i) => {
        const timeLabel = !FINAL_CONFIG.value.style.layout.grid.xAxis.dataLabels.datetimeFormatter.enable ? ds.period : timeLabels.value[i].text;

        const label_open = dataLabel({
            p: FINAL_CONFIG.value.table.td.prefix,
            v: ds.open.value,
            s: FINAL_CONFIG.value.table.td.suffix,
            r: FINAL_CONFIG.value.table.td.roundingValue
        });
        const label_high = dataLabel({
            p: FINAL_CONFIG.value.table.td.prefix,
            v: ds.high.value,
            s: FINAL_CONFIG.value.table.td.suffix,
            r: FINAL_CONFIG.value.table.td.roundingValue
        });
        const label_low = dataLabel({
            p: FINAL_CONFIG.value.table.td.prefix,
            v: ds.low.value,
            s: FINAL_CONFIG.value.table.td.suffix,
            r: FINAL_CONFIG.value.table.td.roundingValue
        });
        const label_last = dataLabel({
            p: FINAL_CONFIG.value.table.td.prefix,
            v: ds.last.value,
            s: FINAL_CONFIG.value.table.td.suffix,
            r: FINAL_CONFIG.value.table.td.roundingValue
        });

        return [
            `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" height="12" width="12" style="margin-right: 6px"><rect x="0" y="0" height="12" width="12" rx="${FINAL_CONFIG.value.style.layout.candle.borderRadius * 3}" fill="${FINAL_CONFIG.value.style.layout.candle.gradient.show ? ds.isBullish ? `url(#bullish_gradient_${uid.value}` : `url(#bearish_gradient_${uid.value})` : ds.isBullish ? FINAL_CONFIG.value.style.layout.candle.colors.bullish : FINAL_CONFIG.value.style.layout.candle.colors.bearish}"/></svg> ${timeLabel}`,
            label_open,
            label_high,
            label_low,
            label_last,
            `${isNaN(ds.volume) ? '-' : ds.volume.toLocaleString()}`,
        ]
    });

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

async function getImage({ scale = 2} = {}) {
    if (!candlestickChart.value) return;
    const { width, height } = candlestickChart.value.getBoundingClientRect();
    const aspectRatio = width / height;
    const { imageUri, base64 } = await img({ domElement: candlestickChart.value, base64: true, img: true, scale})
    return { 
        imageUri, 
        base64, 
        title: FINAL_CONFIG.value.style.title.text,
        width,
        height,
        aspectRatio
    }
}

useTimeLabelCollision({
    timeLabelsEls,
    timeLabels,
    slicer,
    configRef: FINAL_CONFIG,
    rotationPath: ['style', 'layout', 'grid', 'xAxis', 'dataLabels', 'rotation'],
    autoRotatePath: ['style', 'layout', 'grid', 'xAxis', 'dataLabels', 'autoRotate'],
    isAutoSize: false,
});

// v3 - Essential to make shifting between loading config and final config work
watch(FINAL_CONFIG, () => {
    mutableConfig.value = {
        showTable: FINAL_CONFIG.value.table.show,
        showTooltip: FINAL_CONFIG.value.style.tooltip.show
    }
}, { immediate: true });

defineExpose({
    getImage,
    generatePdf,
    generateCsv,
    generateImage,
    toggleTable,
    toggleTooltip,
    toggleAnnotator,
    toggleFullscreen
});

</script>

<template>
    <div ref="candlestickChart" :class="`vue-ui-candlestick ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''} ${FINAL_CONFIG.useCssAnimation ? '' : 'vue-ui-dna'}`" :style="`position:relative;font-family:${FINAL_CONFIG.style.fontFamily}; text-align:center;background:${FINAL_CONFIG.style.backgroundColor}; ${FINAL_CONFIG.responsive ? 'height: 100%' : ''}`" :id="`vue-ui-candlestick_${uid}`" @mouseenter="() => setUserOptionsVisibility(true)" @mouseleave="() => setUserOptionsVisibility(false)">
        <PenAndPaper
            v-if="FINAL_CONFIG.userOptions.buttons.annotator"
            :svgRef="svgRef"
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
            :callbacks="FINAL_CONFIG.userOptions.callbacks"
            :printScale="FINAL_CONFIG.userOptions.print.scale"
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
            <template #menuIcon="{ isOpen, color }" v-if="$slots.menuIcon">
                <slot name="menuIcon" v-bind="{ isOpen, color }"/>
            </template>
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
            :aria-label="FINAL_CONFIG.style.title.text || 'candlestick chart'"
            :class="{ 'vue-data-ui-fullscreen--on': isFullscreen, 'vue-data-ui-fulscreen--off': !isFullscreen }"
            :viewBox="`0 0 ${svg.width <= 0 ? 10 : svg.width} ${svg.height <= 0 ? 10 : svg.height}`" :style="`max-width:100%;overflow:visible;background:transparent;color:${FINAL_CONFIG.style.color}`"
        >
            <PackageVersion />

            <!-- BACKGROUND SLOT -->
            <foreignObject 
                v-if="$slots['chart-background']"
                :x="drawingArea.left"
                :y="drawingArea.top"
                :width="Math.max(0.1, drawingArea.width)"
                :height="Math.max(0.1, drawingArea.height)"
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
            <g v-if="FINAL_CONFIG.style.layout.grid.yAxis.dataLabels.show" ref="scaleLabels">
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
                        {{ 
                            dataLabel({
                                p: FINAL_CONFIG.style.layout.grid.yAxis.dataLabels.prefix,
                                v: yLabel.value,
                                s: FINAL_CONFIG.style.layout.grid.yAxis.dataLabels.suffix,
                                r: FINAL_CONFIG.style.layout.grid.yAxis.dataLabels.roundingValue
                            })
                        }}
                    </text>
                </g>
            </g>
            <!-- X LABELS -->
            <g v-if="FINAL_CONFIG.style.layout.grid.xAxis.dataLabels.show && !FINAL_CONFIG.style.layout.grid.xAxis.dataLabels.datetimeFormatter.enable" ref="timeLabelsEls">
                <g v-for="(xLabel, i) in xLabels">
                    <text
                        class="vue-data-ui-time-label"
                        data-cy="x-label"
                        :transform="`translate(${drawingArea.left + (slot * i) + (slot / 2)}, ${drawingArea.bottom + svg.xAxisFontSize * 1.5}), rotate(${FINAL_CONFIG.style.layout.grid.xAxis.dataLabels.rotation})`"
                        :text-anchor="FINAL_CONFIG.style.layout.grid.xAxis.dataLabels.rotation > 0 ? 'start' : FINAL_CONFIG.style.layout.grid.xAxis.dataLabels.rotation < 0 ? 'end' : 'middle'"
                        :font-size="svg.xAxisFontSize"
                        :fill="FINAL_CONFIG.style.layout.grid.xAxis.dataLabels.color"
                        :font-weight="FINAL_CONFIG.style.layout.grid.xAxis.dataLabels.bold ? 'bold': 'normal'"
                    >
                        {{ xLabel }}
                    </text>
                </g>
            </g>
            <g v-if="FINAL_CONFIG.style.layout.grid.xAxis.dataLabels.show && FINAL_CONFIG.style.layout.grid.xAxis.dataLabels.datetimeFormatter.enable" ref="timeLabelsEls">
                <g v-for="(timeLabel, i) in timeLabels">
                    <text
                        class="vue-data-ui-time-label"
                        data-cy="x-label"
                        :transform="`translate(${drawingArea.left + (slot * i) + (slot / 2)}, ${drawingArea.bottom + svg.xAxisFontSize * 1.5}), rotate(${FINAL_CONFIG.style.layout.grid.xAxis.dataLabels.rotation})`"
                        :text-anchor="FINAL_CONFIG.style.layout.grid.xAxis.dataLabels.rotation > 0 ? 'start' : FINAL_CONFIG.style.layout.grid.xAxis.dataLabels.rotation < 0 ? 'end' : 'middle'"
                        :font-size="svg.xAxisFontSize"
                        :fill="FINAL_CONFIG.style.layout.grid.xAxis.dataLabels.color"
                        :font-weight="FINAL_CONFIG.style.layout.grid.xAxis.dataLabels.bold ? 'bold': 'normal'"
                    >
                        {{ timeLabel.text }}
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

        <div ref="chartSlicer" v-if="FINAL_CONFIG.style.zoom.show && isDataset">
            <Slicer
                ref="slicerComponent"
                :key="`slicer_${slicerStep}`"
                :background="FINAL_CONFIG.style.zoom.color"
                :borderColor="FINAL_CONFIG.style.backgroundColor"
                :fontSize="FINAL_CONFIG.style.zoom.fontSize"
                :useResetSlot="FINAL_CONFIG.style.zoom.useResetSlot"
                :labelLeft="slicerLabels.start"
                :labelRight="slicerLabels.end"
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

        <!-- v3 Skeleton loader -->
        <BaseScanner v-if="loading" />
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