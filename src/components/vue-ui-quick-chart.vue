<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import themes from "../themes.json";
import * as detector from "../chartDetector";
import {
    applyDataLabel,
    calcMarkerOffsetX,
    calcMarkerOffsetY,
    calcNutArrowPath,
    calculateNiceScale,
    checkNaN,
    convertColorToHex,
    convertCustomPalette,
    createSmoothPath,
    createUid,
    dataLabel,
    error,
    functionReturnsString,
    isFunction,
    makeDonut, 
    palette,
    sanitizeArray,
    themePalettes,
    XMLNS
} from "../lib";
import {
    throttle
} from "../canvas-lib"
import BaseIcon from "../atoms/BaseIcon.vue";
import Tooltip from "../atoms/Tooltip.vue";
import UserOptions from "../atoms/UserOptions.vue";
import Slicer from "../atoms/Slicer.vue";
import Skeleton from "./vue-ui-skeleton.vue";
import { useNestedProp } from "../useNestedProp";
import { usePrinter } from "../usePrinter";
import { useResponsive } from "../useResponsive";
import { useConfig } from "../useConfig";

const { vue_ui_quick_chart: DEFAULT_CONFIG } = useConfig()

const props = defineProps({
    config: {
        type: Object,
        default() {
            return {}
        }
    },
    dataset: {
        type: [Array, Object, String, Number],
        default() {
            return null
        }
    },
});

const quickChart = ref(null);
const quickChartTitle = ref(null);
const quickChartLegend = ref(null);
const quickChartSlicer = ref(null);
const uid = ref(createUid());
const isTooltip = ref(false);
const dataTooltipSlot = ref(null);
const tooltipContent = ref('');
const selectedDatapoint = ref(null)
const segregated = ref([]);
const step = ref(0);
const slicerStep = ref(0);

const FINAL_CONFIG = computed({
    get: () => {
        return prepareConfig();
    },
    set: (newCfg) => {
        return newCfg
    }
});

function prepareConfig() {
    const mergedConfig = useNestedProp({
        userConfig: props.config,
        defaultConfig: DEFAULT_CONFIG
    });
    if (mergedConfig.theme) {
        return {
            ...useNestedProp({
                userConfig: themes.vue_ui_quick_chart[mergedConfig.theme] || props.config,
                defaultConfig: mergedConfig
            }),
            customPalette: themePalettes[mergedConfig.theme] || palette
        }
    } else {
        return mergedConfig;
    }
}

watch(() => props.config, (_newCfg) => {
    FINAL_CONFIG.value = prepareConfig();
    defaultSizes.value.width = FINAL_CONFIG.value.width;
    defaultSizes.value.height = FINAL_CONFIG.value.height;
    prepareChart();
}, { deep: true });

watch(() => props.dataset, (_) => {
    formattedDataset.value = fd.value;
    slicer.value.start = 0;
    slicer.value.end = formattedDataset.value.maxSeriesLength;
    slicerStep.value += 1;
}, { deep: true })

const customPalette = computed(() => {
    return convertCustomPalette(FINAL_CONFIG.value.customPalette);
});

const emit = defineEmits(['selectDatapoint', 'selectLegend'])

const fd = computed(() => {
    const f = detector.detectChart({ dataset: sanitizeArray(props.dataset, [
        'serie',
        'series',
        'data',
        'value',
        'values',
        'num',
    ]), barLineSwitch: FINAL_CONFIG.value.chartIsBarUnderDatasetLength });
    if(!f) {
        console.error('VueUiQuickChart : Dataset is not processable')
    }
    return f
})

const formattedDataset = ref(fd.value)

const isProcessable = computed(() => {
    return !!formattedDataset.value
})

const chartType = computed(() => {
    return formattedDataset.value ? formattedDataset.value.type : null
});

watch(() => chartType.value, (v) => {
    if (!v) {
        error({
            componentName: 'VueUiQuickChart',
            type: 'dataset'
        })
    }
}, { immediate: true })

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `${chartType.value}_${uid.value}`,
    fileName: FINAL_CONFIG.value.title || chartType.value
});

const defaultSizes = ref({
    width: FINAL_CONFIG.value.width,
    height: FINAL_CONFIG.value.height
});

const mutableConfig = ref({
    showTooltip: FINAL_CONFIG.value.showTooltip
});

const resizeObserver = ref(null);

onMounted(() => {
    prepareChart();
})

function prepareChart() {
    if (FINAL_CONFIG.value.responsive) {
        const handleResize = throttle(() => {
            const { width, height } = useResponsive({
                chart: quickChart.value,
                title: FINAL_CONFIG.value.title ? quickChartTitle.value : null,
                legend: FINAL_CONFIG.value.showLegend ? quickChartLegend.value : null,
                slicer: [detector.chartType.BAR, detector.chartType.LINE].includes(chartType.value) && FINAL_CONFIG.value.zoomXy && formattedDataset.value.maxSeriesLength > 1 ? quickChartSlicer.value : null
            });
            defaultSizes.value.width = width;
            defaultSizes.value.height = height;
        });

        resizeObserver.value = new ResizeObserver(handleResize);
        resizeObserver.value.observe(quickChart.value.parentNode);
    }
}

onBeforeUnmount(() => {
    if (resizeObserver.value) resizeObserver.value.disconnect();
});

const viewBox = computed(() => {
    switch (chartType.value) {
        case detector.chartType.LINE:
            return `0 0 ${defaultSizes.value.width <= 0 ? 10 : defaultSizes.value.width} ${defaultSizes.value.height <= 0 ? 10 : defaultSizes.value.height}`;
        
        case detector.chartType.BAR:
            return `0 0 ${defaultSizes.value.width <= 0 ? 10 : defaultSizes.value.width} ${defaultSizes.value.height <= 0 ? 10 : defaultSizes.value.height}`;

        case detector.chartType.DONUT:
            return `0 0 ${defaultSizes.value.width <= 0 ? 10 : defaultSizes.value.width} ${defaultSizes.value.height <= 0 ? 10 : defaultSizes.value.height}`;
    
        default:
            return `0 0 ${defaultSizes.value.width <= 0 ? 10 : defaultSizes.value.width} ${defaultSizes.value.height <= 0 ? 10 : defaultSizes.value.height}`;
    }
});

function sumValues(source) {
    return [...source].map(s => s.value).reduce((a, b) => a + b, 0);
}

function getBlurFilter(id) {
    if (FINAL_CONFIG.value.blurOnHover && ![null, undefined].includes(selectedDatapoint.value) && selectedDatapoint.value !== id) {
        return `url(#blur_${uid.value})`;
    } else {
        return '';
    }
}

function segregate(id, len) {
    if(segregated.value.includes(id)) {
        segregated.value = segregated.value.filter(el => el !== id);
    } else {
        if(segregated.value.length < len) {
            segregated.value.push(id)
        }
    }
}

const raf = ref(null)
const rafUp = ref(null)
const isSegregatingDonut = ref(false);

function segregateDonut(arc, ds) {
    isSegregatingDonut.value = true;
    let initVal = arc.value;
    if(segregated.value.includes(arc.id)) {
        segregated.value = segregated.value.filter(el => el !== arc.id)
        const targetVal = fd.value.dataset.find((el, i) => arc.id === `donut_${i}`).VALUE;
        function animUp() {
            if(initVal > targetVal) {
                isSegregatingDonut.value = false;
                cancelAnimationFrame(rafUp.value)
                formattedDataset.value = {
                    ...formattedDataset.value,
                    dataset: formattedDataset.value.dataset.map((ds, i) => {
                        if(arc.id === `donut_${i}`) {
                            return {
                                ...ds,
                                value: targetVal,
                                VALUE: targetVal
                            }
                        } else {
                            return ds
                        }
                    })
                }
            } else {
                initVal += (targetVal * 0.025);
                formattedDataset.value = {
                    ...formattedDataset.value,
                    dataset: formattedDataset.value.dataset.map((ds, i) => {
                        if(arc.id === `donut_${i}`) {
                            return {
                                ...ds,
                                value: initVal,
                                VALUE: initVal
                            }
                        } else {
                            return ds
                        }
                    })
                };
                rafUp.value = requestAnimationFrame(animUp)
            }
        }
        animUp()
    } else if(ds.length > 1) {
        function anim() {
            if(initVal < 0.1) {
                isSegregatingDonut.value = false;
                cancelAnimationFrame(raf.value)
                segregated.value.push(arc.id)
                formattedDataset.value = {
                    ...formattedDataset.value,
                    dataset: formattedDataset.value.dataset.map((ds, i) => {
                    if(arc.id === `donut_${i}`) {
                        return {
                            ...ds,
                            value: 0,
                            VALUE: 0
                        }
                    } else {
                        return ds
                    }
                })
                }
            } else {
                initVal /= 1.1;
                formattedDataset.value = {
                    ...formattedDataset.value,
                    dataset: formattedDataset.value.dataset.map((ds, i) => {
                    if(arc.id === `donut_${i}`) {
                        return {
                            ...ds,
                            value: initVal,
                            VALUE: initVal
                        }
                    } else {
                        return ds
                    }
                })
                }
                raf.value = requestAnimationFrame(anim)
            }
        }
        anim()
    }
}

const commonSelectedIndex = ref(null);

function setCommonSelectedIndex(index) {
    commonSelectedIndex.value = index;
}

const optimalDonutThickness = computed(() => {
    return FINAL_CONFIG.value.donutThicknessRatio < 0.15 ? 0.15 : FINAL_CONFIG.value.donutThicknessRatio > 0.4 ? 0.4 :  FINAL_CONFIG.value.donutThicknessRatio;
})

const donut = computed(() => {
    if(chartType.value !== detector.chartType.DONUT) return null;
    const ds = formattedDataset.value.dataset.map((ds, i) => {
        return {
            ...ds,
            value: ds.VALUE || ds.DATA || ds.SERIE || ds.VALUES || ds.NUM || 0,
            name: ds.NAME || ds.DESCRIPTION || ds.TITLE || ds.LABEL || `Serie ${i}`,
            id: `donut_${i}`
        }
    })
    .map((ds, i) => {
        return {
            ...ds,
            color: ds.COLOR ? convertColorToHex(ds.COLOR) : customPalette.value[(i + FINAL_CONFIG.value.paletteStartIndex)] || palette[(i + FINAL_CONFIG.value.paletteStartIndex)] || palette[(i + FINAL_CONFIG.value.paletteStartIndex) % palette.length],
            immutableValue: ds.value
        }
    });

    function displayArcPercentage(arc, stepBreakdown) {
        return dataLabel({
            v: isNaN(arc.value / sumValues(stepBreakdown)) ? 0 : (arc.value / sumValues(stepBreakdown)) * 100,
            s: '%',
            r: FINAL_CONFIG.value.dataLabelRoundingPercentage
        });
    }

    function isArcBigEnough(arc) {
        return arc.proportion * 100 > FINAL_CONFIG.value.donutHideLabelUnderPercentage;
    }

    function getSpaces(datapointId, num2) {
        const num1 = fd.value.dataset.find((_,i) => `donut_${i}` === datapointId).VALUE;
        const difference = Math.abs(String(Number(num1.toFixed(0))).length - String(Number(num2.toFixed(0))).length);
        return difference
    }

    function useTooltip({ datapoint, seriesIndex }) {
        dataTooltipSlot.value = { datapoint, seriesIndex, config: FINAL_CONFIG.value, dataset: ds };
        selectedDatapoint.value = datapoint.id;
        const customFormat = FINAL_CONFIG.value.tooltipCustomFormat;

        if(isFunction(customFormat) && functionReturnsString(() => customFormat({
            datapoint,
            seriesIndex,
            series: ds,
            config: FINAL_CONFIG.value
        }))) {
            tooltipContent.value = customFormat({
                datapoint,
                seriesIndex,
                series: ds,
                config: FINAL_CONFIG.value
            })
        } else {
            let html = '';
            html += `<div style="width:100%;text-align:center;border-bottom:1px solid ${FINAL_CONFIG.value.tooltipBorderColor};padding-bottom:6px;margin-bottom:3px;">${datapoint.name}</div>`;
            html += `<div style="display:flex;flex-direction:row;gap:6px;align-items:center;"><svg viewBox="0 0 12 12" height="14" width="14"><circle data-cy="donut-tooltip-marker" cx="6" cy="6" r="6" stroke="none" fill="${datapoint.color}"/></svg>`;

            html += `<b>${applyDataLabel(
                FINAL_CONFIG.value.formatter,
                datapoint.value,
                dataLabel({
                    p: FINAL_CONFIG.value.valuePrefix, 
                    v: datapoint.value, 
                    s: FINAL_CONFIG.value.valueSuffix, 
                    r: FINAL_CONFIG.value.dataLabelRoundingValue
                }),
                { datapoint, seriesIndex }
                )
            }</b>`;
            
            html += `<span>(${dataLabel({ v: datapoint.proportion * 100, s: '%', r: FINAL_CONFIG.value.dataLabelRoundingPercentage})})</span></div>`;
            

            tooltipContent.value = `<div>${html}</div>`;
        }
        isTooltip.value = true;
    }

    function killTooltip() {
        isTooltip.value = false;
        selectedDatapoint.value = null;
        commonSelectedIndex.value = null;
    }

    const drawingArea = {
        centerX: (defaultSizes.value.width) / 2,
        centerY: (defaultSizes.value.height) / 2
    }
    
    const total = ds.filter(d => !segregated.value.includes(d.id)).map(d => d.value||0).reduce((a,b) => a + b, 0);

    const legend = ds.map((d, i) => {
        return {
            ...d,
            proportion: (d.value || 0) / total,
            value: d.value || 0,
            absoluteValue: fd.value.dataset.find((el, idx) => `donut_${idx}` === d.id).VALUE,
        }
    })

    const cx = (defaultSizes.value.width) / 2;
    const cy = (defaultSizes.value.height) / 2;
    const radius = (defaultSizes.value.height) * FINAL_CONFIG.value.donutRadiusRatio;

    return {
        dataset: legend.filter(s => !segregated.value.includes(s.id)),
        legend,
        drawingArea,
        displayArcPercentage,
        isArcBigEnough,
        useTooltip,
        killTooltip,
        getSpaces,
        total,
        cx,
        cy,
        radius,
        chart: makeDonut(
            { series: ds.filter(s => !segregated.value.includes(s.id)) },
            cx,
            cy,
            radius,
            radius,
            1.99999,
            2,
            1,
            360,
            105.25,
            (defaultSizes.value.height) * optimalDonutThickness.value
        )
    }
});

const slicer = ref({
    start: 0,
    end: formattedDataset.value.maxSeriesLength
});

function refreshSlicer() {
    slicer.value = {
        start: 0,
        end: formattedDataset.value.maxSeriesLength
    };
    slicerStep.value += 1;
}

const minimap = computed(() => {
    if(!FINAL_CONFIG.value.zoomMinimap.show || chartType.value === detector.chartType.DONUT) return [];

    let ds = [];

    if (detector.isSimpleArrayOfNumbers(formattedDataset.value.dataset)) {
        ds = formattedDataset.value.dataset
    }

    if (detector.isSimpleArrayOfObjects(formattedDataset.value.dataset)) {
        ds = formattedDataset.value.dataset.map((d, i) => {
            return {
                values: d.VALUE || d.DATA || d.SERIE || d.SERIES || d.VALUES || d.NUM || 0,
                id: chartType.value === detector.chartType.LINE ? `line_${i}` : `bar_${i}`
            }
        }).filter(s => !segregated.value.includes(s.id))
    }

    const maxIndex = detector.isSimpleArrayOfNumbers(ds) ? ds.length : Math.max(...ds.map(s => s.values.length));
    let sumAllSeries = []

    if (detector.isSimpleArrayOfNumbers(ds)) {
        sumAllSeries = ds
    } else {
        for(let i = 0; i < maxIndex; i += 1) {
            sumAllSeries.push(ds.map(s => s.values[i] || 0).reduce((a, b) => (a || 0) + (b || 0), 0));
        }
    }
    
    const min = Math.min(...sumAllSeries);
    return sumAllSeries.map(dp => dp + (min < 0 ? Math.abs(min) : 0)) // positivized
});

const line = computed(() => {
    if(chartType.value !== detector.chartType.LINE) return null;

    const chartDimensions = {
        height: defaultSizes.value.height,
        width: defaultSizes.value.width
    }

    const drawingArea = {
        left: FINAL_CONFIG.value.xyPaddingLeft,
        top: FINAL_CONFIG.value.xyPaddingTop,
        right: chartDimensions.width - FINAL_CONFIG.value.xyPaddingRight,
        bottom: chartDimensions.height - FINAL_CONFIG.value.xyPaddingBottom,
        width: chartDimensions.width - FINAL_CONFIG.value.xyPaddingLeft - FINAL_CONFIG.value.xyPaddingRight,
        height: chartDimensions.height - FINAL_CONFIG.value.xyPaddingTop - FINAL_CONFIG.value.xyPaddingBottom
    }

    let ds = [];

    if(detector.isSimpleArrayOfNumbers(formattedDataset.value.dataset)) {
        ds = [
            {
                values: formattedDataset.value.dataset.slice(slicer.value.start, slicer.value.end),
                absoluteIndices: formattedDataset.value.dataset.map((d, i) => i).slice(slicer.value.start, slicer.value.end),
                name: FINAL_CONFIG.value.title,
                color: customPalette.value[FINAL_CONFIG.value.paletteStartIndex] || palette[FINAL_CONFIG.value.paletteStartIndex],
                id: `line_0`
            }
        ]
    }

    if(detector.isSimpleArrayOfObjects(formattedDataset.value.dataset)) {
        ds = formattedDataset.value.dataset.map((d, i) => {
            return {
                ...d,
                values: d.VALUE || d.DATA || d.SERIE || d.SERIES || d.VALUES || d.NUM || 0,
                name: d.NAME || d.DESCRIPTION || d.TITLE || d.LABEL || `Serie ${i}`,
                id: `line_${i}`
            }
        }).map((d, i) => {
            return {
                ...d,
                color: d.COLOR ? convertColorToHex(d.COLOR) : customPalette.value[i + (FINAL_CONFIG.value.paletteStartIndex)] || palette[i + (FINAL_CONFIG.value.paletteStartIndex)] || palette[(i + FINAL_CONFIG.value.paletteStartIndex) % palette.length],
                values: d.values.slice(slicer.value.start, slicer.value.end),
                absoluteIndices: d.values.map((d,i) => i).slice(slicer.value.start, slicer.value.end)
            }
        })
    }
    const extremes = {
        max: Math.max(...ds.filter(d => !segregated.value.includes(d.id)).flatMap(d => d.values)),
        min: Math.min(...ds.filter(d => !segregated.value.includes(d.id)).flatMap(d => d.values)),
        maxSeries: Math.max(...ds.map(d => d.values.length))
    };

    const scale = calculateNiceScale(extremes.min < 0 ? extremes.min : 0, extremes.max < 0 ? 0 : extremes.max, FINAL_CONFIG.value.xyScaleSegments)
    const absoluteMin = extremes.min < 0 ? Math.abs(extremes.min) : 0;
    const absoluteZero = extremes.max < 0 ? drawingArea.top : drawingArea.bottom - (absoluteMin / (scale.max + absoluteMin) * drawingArea.height)
    const slotSize = drawingArea.width / extremes.maxSeries;

    const yLabels = scale.ticks.map(t => {
        return {
            y: drawingArea.bottom - (drawingArea.height * ((t + absoluteMin) / (scale.max + absoluteMin))),
            x: drawingArea.left -8,
            value: t
        }
    });

    const drawableDataset = ds.map((d, i) => {
        return {
            ...d,
            coordinates: d.values.map((v,j) => {
                return {
                    x: drawingArea.left + (slotSize * (j + 1)) - (slotSize / 2),
                    y: drawingArea.bottom - (((v + absoluteMin) / (scale.max + absoluteMin)) * drawingArea.height),
                    value: v
                }
            })
        }
    }).map((d) => {
        let path = [];
        d.coordinates.forEach(c => {
            path.push(`${c.x},${c.y} `)
        })
        return {
            ...d,
            linePath : path.join(' ')
        }
    })

    function useTooltip(index) {
        selectedDatapoint.value = index;
        commonSelectedIndex.value = index;
        const mappedSeries = ds.map(d => {
            return {
                ...d,
                value: d.values[index],
                absoluteIndex: d.absoluteIndices[index]
            }
        }).filter(d => !segregated.value.includes(d.id))
        dataTooltipSlot.value = { datapoint: mappedSeries, seriesIndex: index, config: FINAL_CONFIG.value, dataset: ds };
        const customFormat = FINAL_CONFIG.value.tooltipCustomFormat;

        if (isFunction(customFormat) && functionReturnsString(() => customFormat({
            datapoint: mappedSeries,
            seriesIndex: index,
            series: ds,
            config: FINAL_CONFIG.value
        }))) {
            tooltipContent.value = customFormat({
                datapoint: mappedSeries,
                seriesIndex: index,
                series: ds,
                config: FINAL_CONFIG.value
            })
        } else {
            let html = '';

            if (FINAL_CONFIG.value.xyPeriods[mappedSeries[0].absoluteIndex]) {
                html += `<div style="border-bottom:1px solid ${FINAL_CONFIG.value.tooltipBorderColor};padding-bottom:6px;margin-bottom:3px;">${FINAL_CONFIG.value.xyPeriods[mappedSeries[0].absoluteIndex]}</div>`
            }

            mappedSeries.forEach((s, i) => {
                html += `
                    <div style="display:flex; flex-wrap: wrap; align-items:center; gap:3px;">
                        <svg viewBox="0 0 12 12" height="14" width="12"><circle cx="6" cy="6" r="6" stroke="none" fill="${s.color}"/></svg>
                        <span>${s.name}:</span>
                        <b>${applyDataLabel(
                            FINAL_CONFIG.value.formatter,
                            s.value,
                            dataLabel({
                                p: FINAL_CONFIG.value.valuePrefix,
                                v: s.value,
                                s: FINAL_CONFIG.value.valueSuffix,
                                r: FINAL_CONFIG.value.dataLabelRoundingValue
                            }),
                            { datapoint: s, seriesIndex: i}
                            )}
                        </b>
                    </div>
                `
            });
            tooltipContent.value = html;
        }
        isTooltip.value = true;
    }

    function killTooltip() {
        selectedDatapoint.value = null;
        isTooltip.value = false;
    }

    return {
        absoluteZero,
        dataset: drawableDataset.filter(el => !segregated.value.includes(el.id)),
        legend: drawableDataset,
        drawingArea,
        extremes,
        slotSize,
        yLabels,
        useTooltip,
        killTooltip
    }
})

const bar = computed(() => {
    if(chartType.value !== detector.chartType.BAR) return null;

    const chartDimensions = {
        height: defaultSizes.value.height,
        width: defaultSizes.value.width
    };

    const drawingArea = {
        left: FINAL_CONFIG.value.xyPaddingLeft,
        top: FINAL_CONFIG.value.xyPaddingTop,
        right: chartDimensions.width - FINAL_CONFIG.value.xyPaddingRight,
        bottom: chartDimensions.height - FINAL_CONFIG.value.xyPaddingBottom,
        width: chartDimensions.width - FINAL_CONFIG.value.xyPaddingLeft - FINAL_CONFIG.value.xyPaddingRight,
        height: chartDimensions.height - FINAL_CONFIG.value.xyPaddingTop - FINAL_CONFIG.value.xyPaddingBottom
    }

    let ds = [];

    if(detector.isSimpleArrayOfNumbers(formattedDataset.value.dataset)) {
        ds = [
            {
                values: formattedDataset.value.dataset.slice(slicer.value.start, slicer.value.end),
                absoluteIndices: formattedDataset.value.dataset.map((_,i) => i).slice(slicer.value.start, slicer.value.end),
                name: FINAL_CONFIG.value.title,
                color: customPalette.value[FINAL_CONFIG.value.paletteStartIndex] || palette[FINAL_CONFIG.value.paletteStartIndex],
                id: 'bar_0'
            }
        ]
    }

    if (detector.isSimpleArrayOfObjects(formattedDataset.value.dataset)) {
        ds = formattedDataset.value.dataset.map((d, i) => {
            return {
                ...d,
                values: d.VALUE || d.DATA || d.SERIE || d.SERIES || d.VALUES || d.NUM || 0,
                name: d.NAME || d.DESCRIPTION || d.TITLE || d.LABEL || `Serie ${i}`,
                id: `bar_${i}`
            }
        }).map((d, i) => {
            return {
                ...d,
                color: d.COLOR ? convertColorToHex(d.COLOR) : customPalette.value[i + (FINAL_CONFIG.value.paletteStartIndex)] || palette[i + (FINAL_CONFIG.value.paletteStartIndex)] || palette[(i + FINAL_CONFIG.value.paletteStartIndex) % palette.length],
                values: d.values.slice(slicer.value.start, slicer.value.end),
                absoluteIndices: d.values.map((_,i) => i).slice(slicer.value.start, slicer.value.end)
            }
        });
    }

    const extremes = {
        max: Math.max(...ds.filter(d => !segregated.value.includes(d.id)).flatMap(d => d.values)) < 0 ? 0 : Math.max(...ds.filter(d => !segregated.value.includes(d.id)).flatMap(d => d.values)),
        min: Math.min(...ds.filter(d => !segregated.value.includes(d.id)).flatMap(d => d.values)),
        maxSeries: Math.max(...ds.filter(d => !segregated.value.includes(d.id)).map(d => d.values.length))
    }

    const scale = calculateNiceScale(extremes.min < 0 ? extremes.min : 0, extremes.max, FINAL_CONFIG.value.xyScaleSegments)
    const absoluteMin = scale.min < 0 ? Math.abs(scale.min) : 0;
    const absoluteZero = drawingArea.bottom - (absoluteMin / (scale.max + absoluteMin) * drawingArea.height)
    const slotSize = drawingArea.width / extremes.maxSeries;

    const yLabels = scale.ticks.map(t => {
        return {
            y: drawingArea.bottom - (drawingArea.height * ((t + absoluteMin) / (scale.max + absoluteMin))),
            x: drawingArea.left -8,
            value: t
        }
    });

    const legend = ds.map((d, i) => {
        return {
            ...d,
            coordinates: d.values.map((v,j) => {
                const barHeight = (((v + absoluteMin) / (extremes.max + absoluteMin)) * drawingArea.height)
                const barHeightNegative = (Math.abs(v) / Math.abs(extremes.min) * (drawingArea.height - absoluteZero))
                const absoluteMinHeight = (absoluteMin / (extremes.max + absoluteMin)) * drawingArea.height;
                const barWidth = (slotSize / ds.filter(d => !segregated.value.includes(d.id)).length) - (FINAL_CONFIG.value.barGap / ds.filter(d => !segregated.value.includes(d.id)).length);

                return {
                    x: drawingArea.left + (slotSize * j) + (barWidth * i) + (FINAL_CONFIG.value.barGap / 2),
                    y: v > 0 ? drawingArea.bottom - barHeight : absoluteZero,
                    height: v > 0 ? barHeight - absoluteMinHeight : barHeightNegative,
                    value: v,
                    width: barWidth
                }
            })
        }
    });

    const drawableDataset = ds.filter(d => !segregated.value.includes(d.id)).map((d, i) => {
        return {
            ...d,
            coordinates: d.values.map((v,j) => {
                const barHeight = (((v + absoluteMin) / (extremes.max + absoluteMin)) * drawingArea.height)
                const barHeightNegative = (Math.abs(v) / (extremes.max + absoluteMin) * (drawingArea.height))
                const absoluteMinHeight = (absoluteMin / (extremes.max + absoluteMin)) * drawingArea.height;
                const barWidth = (slotSize / ds.filter(d => !segregated.value.includes(d.id)).length) - (FINAL_CONFIG.value.barGap / ds.filter(d => !segregated.value.includes(d.id)).length);

                return {
                    x: drawingArea.left + (slotSize * j) + (barWidth * i) + (FINAL_CONFIG.value.barGap / 2),
                    y: v > 0 ? drawingArea.bottom - barHeight : absoluteZero,
                    height: v > 0 ? barHeight - absoluteMinHeight : barHeightNegative,
                    value: v,
                    width: barWidth
                }
            })
        }
    });

    function useTooltip(index) {
        selectedDatapoint.value = index;
        commonSelectedIndex.value = index;

        const mappedSeries = ds.map(d => {
            return {
                ...d,
                value: d.values[index],
                absoluteIndex: d.absoluteIndices[index]
            }
        }).filter(d => !segregated.value.includes(d.id));

        dataTooltipSlot.value = { datapoint: mappedSeries, seriesIndex: index, config: FINAL_CONFIG.value, dataset: ds };
        const customFormat = FINAL_CONFIG.value.tooltipCustomFormat;

        if (isFunction(customFormat) && functionReturnsString(() => customFormat({
            datapoint: mappedSeries,
            seriesIndex: index,
            series: ds,
            config: FINAL_CONFIG.value
        }))) {  
            tooltipContent.value = customFormat({
                point: mappedSeries,
                seriesIndex: index,
                series: ds,
                config: FINAL_CONFIG.value
            })
        } else {
            let html = '';

            if (FINAL_CONFIG.value.xyPeriods[mappedSeries[0].absoluteIndex]) {
                html += `<div style="border-bottom:1px solid ${FINAL_CONFIG.value.tooltipBorderColor};padding-bottom:6px;margin-bottom:3px;">${FINAL_CONFIG.value.xyPeriods[mappedSeries[0].absoluteIndex]}</div>`
            }

            mappedSeries.forEach((s, i) => {
                html += `
                    <div style="display:flex; flex-wrap: wrap; align-items:center; gap:3px;">
                        <svg viewBox="0 0 12 12" height="14" width="12"><rect x=0 y="0" width="12" height="12" rx="1" stroke="none" fill="${s.color}"/></svg>
                        <span>${s.name}:</span>
                        <b>${applyDataLabel(
                            FINAL_CONFIG.value.formatter,
                            s.value,
                            dataLabel({
                                p: FINAL_CONFIG.value.valuePrefix,
                                v: s.value,
                                s: FINAL_CONFIG.value.valueSuffix,
                                r: FINAL_CONFIG.value.dataLabelRoundingValue
                            }),
                            { datapoint: s, seriesIndex: i }
                            )}
                        </b>
                    </div>
                `
            });
            tooltipContent.value = html;
        }
        isTooltip.value = true;
    }

    function killTooltip() {
        isTooltip.value = false;
        selectedDatapoint.value = null;
        commonSelectedIndex.value = null;
    }

    return {
        absoluteZero,
        dataset: drawableDataset.filter(d => !segregated.value.includes(d.id)),
        legend,
        drawingArea,
        extremes,
        slotSize,
        yLabels,
        useTooltip,
        killTooltip
    }
});

const isFullscreen = ref(false)
function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
}

function toggleTooltip() {
    mutableConfig.value.showTooltip = !mutableConfig.value.showTooltip;
}

defineExpose({
    generatePdf,
    generateImage,
    toggleTooltip
})

</script>

<template>
    <div 
        v-if="isProcessable"
        :id="`${chartType}_${uid}`"
        ref="quickChart"
        :class="{'vue-ui-quick-chart': true, 'vue-data-ui-wrapper-fullscreen' : isFullscreen }" 
        :style="`background:${FINAL_CONFIG.backgroundColor};color:${FINAL_CONFIG.color};font-family:${FINAL_CONFIG.fontFamily}; position: relative; ${FINAL_CONFIG.responsive ? 'height: 100%' : ''}`"
    >

        <UserOptions
            ref="details"
            :key="`user_option_${step}`"
            v-if="FINAL_CONFIG.showUserOptions"
            :backgroundColor="FINAL_CONFIG.backgroundColor"
            :color="FINAL_CONFIG.color"
            :isPrinting="isPrinting"
            :isImaging="isImaging"
            :uid="uid"
            :hasTooltip="FINAL_CONFIG.userOptionsButtons.tooltip && FINAL_CONFIG.showTooltip"
            :hasPdf="FINAL_CONFIG.userOptionsButtons.pdf"
            :hasImg="FINAL_CONFIG.userOptionsButtons.img"
            :hasFullscreen="FINAL_CONFIG.userOptionsButtons.fullscreen"
            :hasXls="false"
            :isTooltip="mutableConfig.showTooltip"
            :isFullscreen="isFullscreen"
            :titles="{ ...FINAL_CONFIG.userOptionsButtonTitles }"
            :chartElement="quickChart"
            @toggleFullscreen="toggleFullscreen"
            @generatePdf="generatePdf"
            @generateImage="generateImage"
            @toggleTooltip="toggleTooltip"
        >
            <template #optionTooltip v-if="$slots.optionTooltip">
                <slot name="optionTooltip"/>
            </template>
            <template #optionPdf v-if="$slots.optionPdf">
                <slot name="optionPdf" />
            </template>
            <template #optionImg v-if="$slots.optionImg">
                <slot name="optionImg" />
            </template>
            <template v-if="$slots.optionFullscreen" template #optionFullscreen="{ toggleFullscreen, isFullscreen }">
                <slot name="optionFullscreen" v-bind="{ toggleFullscreen, isFullscreen }"/>
            </template>
        </UserOptions>

        <div ref="quickChartTitle" class="vue-ui-quick-chart-title" v-if="FINAL_CONFIG.title" :style="`background:transparent;color:${FINAL_CONFIG.color};font-size:${FINAL_CONFIG.titleFontSize}px;font-weight:${FINAL_CONFIG.titleBold ? 'bold': 'normal'};text-align:${FINAL_CONFIG.titleTextAlign}`">
            {{ FINAL_CONFIG.title }}
        </div>
        <svg
            v-if="chartType"
            :xmlns="XMLNS"
            :viewBox="viewBox" 
            :style="`max-width:100%;overflow:visible;background:transparent;color:${FINAL_CONFIG.color}`"
        >
            <defs>
                <filter :id="`blur_${uid}`" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur in="SourceGraphic" :stdDeviation="2" :id="`blur_std_${uid}`" />
                    <feColorMatrix type="saturate" values="0" />
                </filter>

                <filter :id="`shadow_${uid}`" color-interpolation-filters="sRGB">
                    <feDropShadow dx="0" dy="0" stdDeviation="10" flood-opacity="0.5" :flood-color="FINAL_CONFIG.donutShadowColor" />
                </filter>
            </defs>

            <template v-if="chartType === detector.chartType.DONUT">
                <g class="donut-label-connectors" v-if="FINAL_CONFIG.showDataLabels">
                    <template v-for="(arc, i) in donut.chart">
                        <path
                            v-if="donut.isArcBigEnough(arc)"
                            :d="calcNutArrowPath(arc, {x: defaultSizes.width / 2, y: defaultSizes.height / 2}, 16, 16, false, false, (defaultSizes.height * optimalDonutThickness))"
                            :stroke="arc.color"
                            :stroke-width="FINAL_CONFIG.donutLabelMarkerStrokeWidth"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            fill="none"
                            :filter="getBlurFilter(arc.id)"
                        />                    
                    </template>
                </g>
                
                <circle
                    class="donut-hollow"
                    :cx="(FINAL_CONFIG.width || defaultSizes.width) / 2"
                    :cy="(FINAL_CONFIG.height || defaultSizes.height) /2"
                    :r="(FINAL_CONFIG.height || defaultSizes.height) * FINAL_CONFIG.donutRadiusRatio"
                    :fill="FINAL_CONFIG.backgroundColor"
                />

                <circle
                    :cx="donut.cx"
                    :cy="donut.cy"
                    :r="donut.radius"
                    :fill="FINAL_CONFIG.backgroundColor"
                    :filter="FINAL_CONFIG.donutUseShadow ? `url(#shadow_${uid})` : ''"
                />

                <g class="donut">
                    <path
                        v-for="(arc, i) in donut.chart"
                        :d="arc.arcSlice"
                        :fill="arc.color"
                        :stroke="FINAL_CONFIG.backgroundColor"
                        :stroke-width="FINAL_CONFIG.donutStrokeWidth"
                        :filter="getBlurFilter(arc.id)"
                    />
                    <path
                        v-for="(arc, i) in donut.chart"
                        :d="arc.arcSlice"
                        fill="transparent"
                        @mouseenter="donut.useTooltip({ datapoint: arc, seriesIndex: i })"
                        @mouseout="donut.killTooltip()"
                        @click="emit('selectDatapoint', arc)"
                    />
                </g>
                <g class="donut-labels quick-animation" v-if="FINAL_CONFIG.showDataLabels">
                    <template v-for="(arc, i) in donut.chart">
                        <circle
                            v-if="donut.isArcBigEnough(arc)"
                            :cx="calcMarkerOffsetX(arc).x"
                            :cy="calcMarkerOffsetY(arc) - 3.7"
                            :fill="arc.color"
                            :r="3"
                            :filter="getBlurFilter(arc.id)"
                        />
                        <text
                            v-if="donut.isArcBigEnough(arc)"
                            :text-anchor="calcMarkerOffsetX(arc, true, 20).anchor"
                            :x="calcMarkerOffsetX(arc, true).x"
                            :y="calcMarkerOffsetY(arc)"
                            :fill="FINAL_CONFIG.color"
                            :font-size="FINAL_CONFIG.dataLabelFontSize"
                            :filter="getBlurFilter(arc.id)"
                        >
                            {{ donut.displayArcPercentage(arc, donut.chart) }} 
                            ({{ applyDataLabel(
                                FINAL_CONFIG.formatter,
                                arc.value,
                                dataLabel({
                                    p: FINAL_CONFIG.valuePrefix,
                                    v: arc.value,
                                    s: FINAL_CONFIG.valueSuffix,
                                    r: FINAL_CONFIG.dataLabelRoundingValue
                                }),
                                { datapoint: arc, seriesIndex: i }
                                ) 
                            }})
                        </text>
                        <text
                            v-if="donut.isArcBigEnough(arc, true, 20)"
                            :text-anchor="calcMarkerOffsetX(arc).anchor"
                            :x="calcMarkerOffsetX(arc, true).x"
                            :y="calcMarkerOffsetY(arc) + FINAL_CONFIG.dataLabelFontSize"
                            :fill="FINAL_CONFIG.color"
                            :font-size="FINAL_CONFIG.dataLabelFontSize"
                            :filter="getBlurFilter(arc.id)"
                        >
                            {{ arc.name }}
                        </text>
                    </template>
                </g>
                <g class="donut-hollow quick-animation" v-if="FINAL_CONFIG.donutShowTotal">
                    <text
                        text-anchor="middle"
                        :x="donut.drawingArea.centerX"
                        :y="donut.drawingArea.centerY - FINAL_CONFIG.donutTotalLabelFontSize / 2"
                        :font-size="FINAL_CONFIG.donutTotalLabelFontSize"
                        :fill="FINAL_CONFIG.color"
                    >
                        {{ FINAL_CONFIG.donutTotalLabelText }}
                    </text>
                    <text
                        text-anchor="middle"
                        :x="donut.drawingArea.centerX"
                        :y="donut.drawingArea.centerY + FINAL_CONFIG.donutTotalLabelFontSize"
                        :font-size="FINAL_CONFIG.donutTotalLabelFontSize"
                        :fill="FINAL_CONFIG.color"
                    >
                        {{ dataLabel({
                            p: FINAL_CONFIG.valuePrefix,
                            v: donut.total,
                            s: FINAL_CONFIG.valueSuffix,
                            r: FINAL_CONFIG.dataLabelRoundingValue
                        }) }}
                    </text>
                </g>
            </template>

            <template v-if="chartType === detector.chartType.LINE">
                <g class="line-grid" v-if="FINAL_CONFIG.xyShowGrid">
                    <template v-for="yGridLine in line.yLabels">
                        <line
                            v-if="yGridLine.y <= line.drawingArea.bottom"
                            :x1="line.drawingArea.left"
                            :x2="line.drawingArea.right"
                            :y1="yGridLine.y"
                            :y2="yGridLine.y"
                            :stroke="FINAL_CONFIG.xyGridStroke"
                            :stroke-width="FINAL_CONFIG.xyGridStrokeWidth"
                            stroke-linecap="round"
                        />
                    </template>
                    <line
                        v-for="(_, i) in line.extremes.maxSeries + 1"
                            :x1="line.drawingArea.left + (line.slotSize * (i))"
                            :x2="line.drawingArea.left + (line.slotSize * (i))"
                            :y1="line.drawingArea.top"
                            :y2="line.drawingArea.bottom"
                            :stroke="FINAL_CONFIG.xyGridStroke"
                            :stroke-width="FINAL_CONFIG.xyGridStrokeWidth"
                            stroke-linecap="round"
                    />
                </g>
                <g class="line-axis" v-if="FINAL_CONFIG.xyShowAxis">
                    <line
                        :x1="line.drawingArea.left"
                        :x2="line.drawingArea.left"
                        :y1="line.drawingArea.top"
                        :y2="line.drawingArea.bottom"
                        :stroke="FINAL_CONFIG.xyAxisStroke"
                        :stroke-width="FINAL_CONFIG.xyAxisStrokeWidth"
                        stroke-linecap="round"
                    />
                    <line
                        :x1="line.drawingArea.left"
                        :x2="line.drawingArea.right"
                        :y1="isNaN(line.absoluteZero) ? line.drawingArea.bottom : line.absoluteZero"
                        :y2="isNaN(line.absoluteZero) ? line.drawingArea.bottom : line.absoluteZero"
                        :stroke="FINAL_CONFIG.xyAxisStroke"
                        :stroke-width="FINAL_CONFIG.xyAxisStrokeWidth"
                        stroke-linecap="round"
                    />
                </g>
                <g class="yLabels" v-if="FINAL_CONFIG.xyShowScale">
                    <template v-for="(label, i) in line.yLabels">   
                        <line
                            v-if="label.y <= line.drawingArea.bottom"
                            :x1="label.x + 4"
                            :x2="line.drawingArea.left"
                            :y1="label.y"
                            :y2="label.y"
                            :stroke="FINAL_CONFIG.xyAxisStroke"
                            :stroke-width="FINAL_CONFIG.xyAxisStrokeWidth"
                            stroke-linecap="round"
                        />
                        <text
                            v-if="label.y <= line.drawingArea.bottom"
                            :x="label.x"
                            :y="label.y + FINAL_CONFIG.xyLabelsYFontSize / 3"
                            text-anchor="end"
                            :font-size="FINAL_CONFIG.xyLabelsYFontSize"
                            :fill="FINAL_CONFIG.color"
                        >
                            {{ applyDataLabel(
                                FINAL_CONFIG.formatter,
                                label.value,
                                dataLabel({
                                    p: FINAL_CONFIG.valuePrefix,
                                    v: label.value,
                                    s: FINAL_CONFIG.valueSuffix,
                                    r: FINAL_CONFIG.dataLabelRoundingValue
                                }),
                                { datapoint: label, seriesIndex: i}
                                )
                            }}
                        </text>
                    </template>
                </g>
                <g class="periodLabels" v-if="FINAL_CONFIG.xyShowScale && FINAL_CONFIG.xyPeriods.length">
                    <line
                        v-for="(_, i) in FINAL_CONFIG.xyPeriods.slice(slicer.start, slicer.end)"
                        :x1="line.drawingArea.left + (line.slotSize * (i+1)) - (line.slotSize / 2)"
                        :x2="line.drawingArea.left + (line.slotSize * (i+1)) - (line.slotSize / 2)"
                        :y1="line.drawingArea.bottom"
                        :y2="line.drawingArea.bottom + 4"
                        :stroke="FINAL_CONFIG.xyAxisStroke"
                        :stroke-width="FINAL_CONFIG.xyAxisStrokeWidth"
                        stroke-linecap="round"
                    />
                    <text
                        v-for="(period, i) in FINAL_CONFIG.xyPeriods.slice(slicer.start, slicer.end)"
                        :font-size="FINAL_CONFIG.xyLabelsXFontSize"
                        :text-anchor="FINAL_CONFIG.xyPeriodLabelsRotation > 0 ? 'start' : FINAL_CONFIG.xyPeriodLabelsRotation < 0 ? 'end' : 'middle'"
                        :fill="FINAL_CONFIG.color"
                        :transform="`translate(${line.drawingArea.left + (line.slotSize * (i+1)) - (line.slotSize / 2)}, ${line.drawingArea.bottom + FINAL_CONFIG.xyLabelsXFontSize + 6}), rotate(${FINAL_CONFIG.xyPeriodLabelsRotation})`"
                    >
                        {{ period }}
                    </text>
                </g>
                <g class="plots">
                    <template v-for="(ds, i) in line.dataset">
                        <g class="line-plot-series">
                            <template v-if="FINAL_CONFIG.lineSmooth">
                                <path
                                    :d="`M ${createSmoothPath(ds.coordinates)}`"
                                    :stroke="FINAL_CONFIG.backgroundColor"
                                    :stroke-width="FINAL_CONFIG.lineStrokeWidth + 1"
                                    stroke-linecap="round"
                                    fill="none"
                                    :class="{'quick-animation': true, 'vue-data-ui-line-animated': FINAL_CONFIG.lineAnimated }"
                                    style="transition: all 0.3s ease-in-out"
                                />
                                <path
                                    :d="`M ${createSmoothPath(ds.coordinates)}`"
                                    :stroke="ds.color"
                                    :stroke-width="FINAL_CONFIG.lineStrokeWidth"
                                    stroke-linecap="round"
                                    fill="none"
                                    :class="{'quick-animation': true, 'vue-data-ui-line-animated': FINAL_CONFIG.lineAnimated }"
                                    style="transition: all 0.3s ease-in-out"
                                >
                            </path>
                            </template>
                            <template v-else>
                                <path
                                    :d="`M ${ds.linePath}`"
                                    :stroke="FINAL_CONFIG.backgroundColor"
                                    :stroke-width="FINAL_CONFIG.lineStrokeWidth + 1"
                                    stroke-linecap="round"
                                    fill="none"
                                    :class="{'quick-animation': true, 'vue-data-ui-line-animated': FINAL_CONFIG.lineAnimated }"
                                    style="transition: all 0.3s ease-in-out"
                                />
                                <path
                                    :d="`M ${ds.linePath}`"
                                    :stroke="ds.color"
                                    :stroke-width="FINAL_CONFIG.lineStrokeWidth"
                                    stroke-linecap="round"
                                    fill="none"
                                    :class="{'quick-animation': true, 'vue-data-ui-line-animated': FINAL_CONFIG.lineAnimated }"
                                    style="transition: all 0.3s ease-in-out"
                                />
                            </template>
                            <template v-for="(plot, j) in ds.coordinates">
                                <circle
                                    :cx="plot.x"
                                    :cy="checkNaN(plot.y)"
                                    :r="3"
                                    :fill="ds.color"
                                    :stroke="FINAL_CONFIG.backgroundColor"
                                    stroke-width="0.5"
                                    class="quick-animation"
                                    style="transition: all 0.3s ease-in-out"
                                />
                            </template>
                        </g>
                    </template>
                </g>
                <g class="dataLabels" v-if="FINAL_CONFIG.showDataLabels">
                    <template v-for="(ds, i) in line.dataset">
                        <text 
                            v-for="(plot, j) in ds.coordinates"
                            text-anchor="middle"
                            :font-size="FINAL_CONFIG.dataLabelFontSize"
                            :fill="ds.color"
                            :x="plot.x"
                            :y="checkNaN(plot.y) - FINAL_CONFIG.dataLabelFontSize / 2"
                            class="quick-animation"
                            style="transition: all 0.3s ease-in-out"
                        >
                            {{ applyDataLabel(
                                FINAL_CONFIG.formatter,
                                checkNaN(plot.value),
                                dataLabel({
                                    p: FINAL_CONFIG.valuePrefix,
                                    v: checkNaN(plot.value),
                                    s: FINAL_CONFIG.valueSuffix,
                                    r: FINAL_CONFIG.dataLabelRoundingValue
                                }),
                                { datapoint: plot, seriesIndex: j}
                                ) 
                            }}
                        </text>
                    </template>
                </g>
                <g class="tooltip-traps">
                    <rect 
                        v-for="(_, i) in line.extremes.maxSeries"
                        :x="line.drawingArea.left + (i * line.slotSize)"
                        :y="line.drawingArea.top"
                        :height="line.drawingArea.height <= 0 ? 0.00001 : line.drawingArea.height"
                        :width="line.slotSize <= 0 ? 0.00001 : line.slotSize"
                        :fill="[selectedDatapoint, commonSelectedIndex].includes(i) ? FINAL_CONFIG.xyHighlighterColor : 'transparent'"
                        :style="`opacity:${FINAL_CONFIG.xyHighlighterOpacity}`"
                        @mouseenter="line.useTooltip(i)"
                        @mouseleave="line.killTooltip()"
                        @click="emit('selectDatapoint', line.dataset.map(d => {
                            return {
                                ...d,
                                value: d.values[i]
                            }
                        }))"
                    />
                </g>
            </template>

            <template v-if="chartType === detector.chartType.BAR">
                <g class="line-grid" v-if="FINAL_CONFIG.xyShowGrid">
                    <template v-for="yGridLine in bar.yLabels">
                        <line
                            v-if="yGridLine.y <= bar.drawingArea.bottom"
                            :x1="bar.drawingArea.left"
                            :x2="bar.drawingArea.right"
                            :y1="yGridLine.y"
                            :y2="yGridLine.y"
                            :stroke="FINAL_CONFIG.xyGridStroke"
                            :stroke-width="FINAL_CONFIG.xyGridStrokeWidth"
                            stroke-linecap="round"
                        />
                    </template>
                        <line
                        v-for="(_, i) in bar.extremes.maxSeries + 1"
                        :x1="bar.drawingArea.left + (bar.slotSize * (i))"
                        :x2="bar.drawingArea.left + (bar.slotSize * (i))"
                        :y1="bar.drawingArea.top"
                        :y2="bar.drawingArea.bottom"
                        :stroke="FINAL_CONFIG.xyGridStroke"
                        :stroke-width="FINAL_CONFIG.xyGridStrokeWidth"
                        stroke-linecap="round"
                    />
                </g>
                <g class="line-axis" v-if="FINAL_CONFIG.xyShowAxis">
                    <line
                        :x1="bar.drawingArea.left"
                        :x2="bar.drawingArea.left"
                        :y1="bar.drawingArea.top"
                        :y2="bar.drawingArea.bottom"
                        :stroke="FINAL_CONFIG.xyAxisStroke"
                        :stroke-width="FINAL_CONFIG.xyAxisStrokeWidth"
                        stroke-linecap="round"
                    />
                    <line
                        :x1="bar.drawingArea.left"
                        :x2="bar.drawingArea.right"
                        :y1="isNaN(bar.absoluteZero) ? bar.drawingArea.bottom : bar.absoluteZero"
                        :y2="isNaN(bar.absoluteZero) ? bar.drawingArea.bottom : bar.absoluteZero"
                        :stroke="FINAL_CONFIG.xyAxisStroke"
                        :stroke-width="FINAL_CONFIG.xyAxisStrokeWidth"
                        stroke-linecap="round"
                    />
                </g>
                <g class="yLabels" v-if="FINAL_CONFIG.xyShowScale">
                    <template v-for="(label, i) in bar.yLabels">   
                        <line
                            v-if="label.y <= bar.drawingArea.bottom"
                            :x1="label.x + 4"
                            :x2="bar.drawingArea.left"
                            :y1="label.y"
                            :y2="label.y"
                            :stroke="FINAL_CONFIG.xyAxisStroke"
                            :stroke-width="FINAL_CONFIG.xyAxisStrokeWidth"
                            stroke-linecap="round"
                        />
                        <text
                            v-if="label.y <= bar.drawingArea.bottom"
                            :x="label.x"
                            :y="label.y + FINAL_CONFIG.xyLabelsYFontSize / 3"
                            text-anchor="end"
                            :font-size="FINAL_CONFIG.xyLabelsYFontSize"
                            :fill="FINAL_CONFIG.color"
                        >
                            {{ applyDataLabel(
                                FINAL_CONFIG.formatter,
                                label.value,
                                dataLabel({
                                    p: FINAL_CONFIG.valuePrefix,
                                    v: label.value,
                                    s: FINAL_CONFIG.valueSuffix,
                                    r: FINAL_CONFIG.dataLabelRoundingValue
                                }),
                                { datapoint: label, seriesIndex: i}
                                ) 
                            }}
                        </text>
                    </template>
                </g>
                <g class="periodLabels" v-if="FINAL_CONFIG.xyShowScale && FINAL_CONFIG.xyPeriods.length">
                    <line
                        v-for="(_, i) in FINAL_CONFIG.xyPeriods.slice(slicer.start, slicer.end)"
                        :x1="bar.drawingArea.left + (bar.slotSize * (i+1)) - (bar.slotSize / 2)"
                        :x2="bar.drawingArea.left + (bar.slotSize * (i+1)) - (bar.slotSize / 2)"
                        :y1="bar.drawingArea.bottom"
                        :y2="bar.drawingArea.bottom + 4"
                        :stroke="FINAL_CONFIG.xyAxisStroke"
                        :stroke-width="FINAL_CONFIG.xyAxisStrokeWidth"
                        stroke-linecap="round"
                    />
                    <text
                        v-for="(period, i) in FINAL_CONFIG.xyPeriods.slice(slicer.start, slicer.end)"
                        :font-size="FINAL_CONFIG.xyLabelsXFontSize"
                        :text-anchor="FINAL_CONFIG.xyPeriodLabelsRotation > 0 ? 'start' : FINAL_CONFIG.xyPeriodLabelsRotation < 0 ? 'end' : 'middle'"
                        :transform="`translate(${bar.drawingArea.left + (bar.slotSize * (i+1)) - (bar.slotSize / 2)}, ${bar.drawingArea.bottom + FINAL_CONFIG.xyLabelsXFontSize + 6}) rotate(${FINAL_CONFIG.xyPeriodLabelsRotation})`"
                        :fill="FINAL_CONFIG.color"
                    >
                        {{ period }}
                    </text>
                </g>
                <g class="plots">
                    <template v-for="(ds, i) in bar.dataset">
                        <rect 
                            v-for="(plot, j) in ds.coordinates"
                            :x="plot.x"
                            :width="plot.width <= 0 ? 0.00001 : plot.width"
                            :height="checkNaN(plot.height <= 0 ? 0.00001 : plot.height)"
                            :y="checkNaN(plot.y)"
                            :fill="ds.color"
                            :stroke="FINAL_CONFIG.backgroundColor"
                            :stroke-width="FINAL_CONFIG.barStrokeWidth"
                            stroke-linecap="round"
                            :class="{'vue-data-ui-bar-animated': FINAL_CONFIG.barAnimated && plot.value < 0}"
                            >
                            <animate
                                v-if="FINAL_CONFIG.barAnimated && plot.value > 0 && !isPrinting && !isImaging"
                                attributeName="height"
                                :from="0"
                                :to="plot.height"
                                dur="0.5s"
                            />
                            <animate
                                v-if="FINAL_CONFIG.barAnimated && plot.value > 0 && !isPrinting && !isImaging"
                                attributeName="y"
                                :from="bar.absoluteZero"
                                :to="bar.absoluteZero - plot.height"
                                dur="0.5s"
                            />
                            </rect>
                    </template>
                </g>
                <g class="dataLabels" v-if="FINAL_CONFIG.showDataLabels">
                    <template v-for="(ds, i) in bar.dataset">
                        <text 
                            v-for="(plot, j) in ds.coordinates"
                            :x="plot.x + plot.width / 2"
                            :y="checkNaN(plot.y) - FINAL_CONFIG.dataLabelFontSize / 2"
                            text-anchor="middle"
                            :font-size="FINAL_CONFIG.dataLabelFontSize"
                            :fill="ds.color"
                            class="quick-animation"
                        >
                            {{ applyDataLabel(
                                FINAL_CONFIG.formatter,
                                checkNaN(plot.value),
                                dataLabel({
                                    p: FINAL_CONFIG.valuePrefix,
                                    v: checkNaN(plot.value),
                                    s: FINAL_CONFIG.valueSuffix,
                                    r: FINAL_CONFIG.dataLabelRoundingValue
                                }),
                                { datapoint: plot, seriesIndex: j }
                                ) 
                            }}
                        </text>
                    </template>
                </g>
                <g class="tooltip-traps">
                    <rect 
                        v-for="(_, i) in bar.extremes.maxSeries"
                        :x="bar.drawingArea.left + (i * bar.slotSize)"
                        :y="bar.drawingArea.top"
                        :height="bar.drawingArea.height <= 0 ? 0.00001 : bar.drawingArea.height"
                        :width="bar.slotSize <= 0 ? 0.00001 : bar.slotSize"
                        :fill="[selectedDatapoint, commonSelectedIndex].includes(i) ? FINAL_CONFIG.xyHighlighterColor : 'transparent'"
                        :style="`opacity:${FINAL_CONFIG.xyHighlighterOpacity}`"
                        @mouseenter="bar.useTooltip(i)"
                        @mouseleave="bar.killTooltip()"
                        @click="emit('selectDatapoint', bar.dataset.map(d => {
                            return {
                                ...d,
                                value: d.values[i]
                            }
                        }))"
                    />
                </g>
            </template>

            <template v-if="[detector.chartType.LINE, detector.chartType.BAR].includes(chartType)">
                <g class="axis-labels">
                    <g v-if="FINAL_CONFIG.xAxisLabel && chartType === detector.chartType.LINE">
                        <text 
                            :font-size="FINAL_CONFIG.axisLabelsFontSize"
                            :fill="FINAL_CONFIG.color" 
                            text-anchor="middle"
                            :x="line.drawingArea.left + (line.drawingArea.width / 2)"
                            :y="defaultSizes.height - (FINAL_CONFIG.axisLabelsFontSize / 3)"
                        >
                            {{ FINAL_CONFIG.xAxisLabel }}
                        </text>
                    </g>
                    <g v-if="FINAL_CONFIG.xAxisLabel && chartType === detector.chartType.BAR">
                        <text 
                            :font-size="FINAL_CONFIG.axisLabelsFontSize"
                            :fill="FINAL_CONFIG.color" 
                            text-anchor="middle"
                            :x="bar.drawingArea.left + (bar.drawingArea.width / 2)"
                            :y="defaultSizes.height - (FINAL_CONFIG.axisLabelsFontSize / 3)"
                        >
                            {{ FINAL_CONFIG.xAxisLabel }}
                        </text>
                    </g>
                    <g v-if="FINAL_CONFIG.yAxisLabel && chartType === detector.chartType.LINE">
                        <text 
                            :font-size="FINAL_CONFIG.axisLabelsFontSize"
                            :fill="FINAL_CONFIG.color"
                            :transform="`translate(${FINAL_CONFIG.axisLabelsFontSize}, ${line.drawingArea.top + (line.drawingArea.height / 2)}) rotate(-90)`"
                            text-anchor="middle"
                        >
                            {{ FINAL_CONFIG.yAxisLabel }}
                        </text>
                    </g>
                    <g v-if="FINAL_CONFIG.yAxisLabel && chartType === detector.chartType.BAR">
                        <text 
                            :font-size="FINAL_CONFIG.axisLabelsFontSize"
                            :fill="FINAL_CONFIG.color"
                            :transform="`translate(${FINAL_CONFIG.axisLabelsFontSize}, ${bar.drawingArea.top + (bar.drawingArea.height / 2)}) rotate(-90)`"
                            text-anchor="middle"
                        >
                            {{ FINAL_CONFIG.yAxisLabel }}
                        </text>
                    </g>
                </g>
            </template>
        </svg>

        <Skeleton 
            v-if="!chartType"
            :config="{
                type: 'line',
                style: {
                    backgroundColor: FINAL_CONFIG.backgroundColor,
                    line: {
                        axis: {
                            color: FINAL_CONFIG.xyAxisStroke,
                        },
                        path: {
                            color: FINAL_CONFIG.xyAxisStroke,
                            strokeWidth: 0.5
                        }
                    }
                }
            }"
        />

        <div v-if="$slots.watermark" class="vue-data-ui-watermark">
            <slot name="watermark" v-bind="{ isPrinting: isPrinting || isImaging }"/>
        </div>

        <div v-if="[detector.chartType.BAR, detector.chartType.LINE].includes(chartType) && FINAL_CONFIG.zoomXy && formattedDataset.maxSeriesLength > 1"
            :key="`slicer_${slicerStep}`" ref="quickChartSlicer">        
            <Slicer
                :key="`slicer_${slicerStep}`"
                :background="FINAL_CONFIG.zoomColor"
                :borderColor="FINAL_CONFIG.backgroundColor"
                :fontSize="FINAL_CONFIG.zoomFontSize"
                :useResetSlot="FINAL_CONFIG.zoomUseResetSlot"
                :labelLeft="FINAL_CONFIG.xyPeriods[slicer.start] ? FINAL_CONFIG.xyPeriods[slicer.start] : ''"
                :labelRight="FINAL_CONFIG.xyPeriods[slicer.end-1] ? FINAL_CONFIG.xyPeriods[slicer.end-1] : ''"
                :textColor="FINAL_CONFIG.color"
                :inputColor="FINAL_CONFIG.zoomColor"
                :selectColor="FINAL_CONFIG.zoomHighlightColor"
                :max="formattedDataset.maxSeriesLength"
                :min="0"
                :valueStart="slicer.start"
                :valueEnd="slicer.end"
                :smoothMinimap="FINAL_CONFIG.zoomMinimap.smooth"
                :minimapSelectedColor="FINAL_CONFIG.zoomMinimap.selectedColor"
                :minimapSelectedColorOpacity="FINAL_CONFIG.zoomMinimap.selectedColorOpacity"
                :minimapSelectionRadius="FINAL_CONFIG.zoomMinimap.selectionRadius"
                :minimapLineColor="FINAL_CONFIG.zoomMinimap.lineColor"
                :minimap="minimap"
                :minimapIndicatorColor="FINAL_CONFIG.zoomMinimap.indicatorColor"
                :minimapSelectedIndex="commonSelectedIndex"
                v-model:start="slicer.start"
                v-model:end="slicer.end"
                @reset="refreshSlicer"
                @trapMouse="setCommonSelectedIndex"
            >
                <template #reset-action="{ reset }">
                    <slot name="reset-action" v-bind="{ reset }"/>
                </template>
            </Slicer>
        </div>
        
        <div
            v-if="FINAL_CONFIG.showLegend"
            ref="quickChartLegend"
            class="vue-ui-quick-chart-legend" 
            :style="`background:transparent;color:${FINAL_CONFIG.color}`"
        >
            <template v-if="chartType === detector.chartType.DONUT">
                <div 
                    class="vue-ui-quick-chart-legend-item" 
                    v-for="(legendItem, i) in donut.legend" 
                    @click="segregateDonut(legendItem, donut.dataset); emit('selectLegend', legendItem)"
                    :style="`cursor: ${donut.legend.length > 1 ? 'pointer' : 'default'}; opacity:${segregated.includes(legendItem.id) ? '0.5' : '1'}`"
                >
                    <template v-if="FINAL_CONFIG.useCustomLegend">
                        <slot name="legend" v-bind="{ legend: legendItem }"/>
                    </template>

                    <template v-else>
                        <BaseIcon :name="FINAL_CONFIG.legendIcon" :stroke="legendItem.color" :size="FINAL_CONFIG.legendIconSize"/>
                        <span :style="`font-size:${FINAL_CONFIG.legendFontSize}px`">
                            {{ legendItem.name }}
                        </span>
                        <span :style="`font-size:${FINAL_CONFIG.legendFontSize}px;font-variant-numeric:tabular-nums`">
                            {{ segregated.includes(legendItem.id) ? '-' : applyDataLabel(
                                FINAL_CONFIG.formatter,
                                legendItem.absoluteValue,
                                dataLabel({
                                    p: FINAL_CONFIG.valuePrefix,
                                    v: legendItem.absoluteValue,
                                    s: FINAL_CONFIG.valueSuffix,
                                    r: FINAL_CONFIG.dataLabelRoundingValue,
                                }),
                                { datapoint: legendItem, seriesIndex: i}
                                ) 
                            }}
                        </span>
                        <span v-if="segregated.includes(legendItem.id)" :style="`font-size:${FINAL_CONFIG.legendFontSize}px`">
                            ( - % )
                        </span>
                        <span v-else-if="isSegregatingDonut" :style="`font-size:${FINAL_CONFIG.legendFontSize}px; font-variant-numeric: tabular-nums;`">
                            ( - % )
                        </span>
                        <span v-else :style="`font-size:${FINAL_CONFIG.legendFontSize}px; font-variant-numeric: tabular-nums;`">
                            ({{ dataLabel({
                                v: legendItem.value / donut.total * 100,
                                s: '%',
                                r: FINAL_CONFIG.dataLabelRoundingPercentage
                            }) }})
                        </span>
                    </template>
                </div>
            </template>

            <template v-if="chartType === detector.chartType.LINE">
                <div 
                    class="vue-ui-quick-chart-legend-item" 
                    v-for="(legendItem, i) in line.legend"
                    @click="segregate(legendItem.id, line.legend.length - 1); emit('selectLegend', legendItem)"
                    :style="`cursor: ${line.legend.length > 1 ? 'pointer' : 'default'}; opacity:${segregated.includes(legendItem.id) ? '0.5' : '1'}`"
                >
                    <template v-if="FINAL_CONFIG.useCustomLegend">
                        <slot name="legend" v-bind="{ legend: legendItem }"/>
                    </template>
                    <template v-else>
                        <BaseIcon :name="FINAL_CONFIG.legendIcon" :stroke="legendItem.color" :size="FINAL_CONFIG.legendIconSize"/>
                        <span :style="`font-size:${FINAL_CONFIG.legendFontSize}px`">
                            {{ legendItem.name }}
                        </span>
                    </template>
                </div>
            </template>

            <template v-if="chartType === detector.chartType.BAR">
                <div 
                    class="vue-ui-quick-chart-legend-item" 
                    v-for="(legendItem, i) in bar.legend"
                    @click="segregate(legendItem.id, bar.legend.length - 1); emit('selectLegend', legendItem)"
                    :style="`cursor: ${bar.legend.length > 1 ? 'pointer' : 'default'}; opacity:${segregated.includes(legendItem.id) ? '0.5' : '1'}`"
                >
                    <template v-if="FINAL_CONFIG.useCustomLegend">
                        <slot name="legend" v-bind="{ legend: legendItem }"/>
                    </template>
                    <template v-else>
                        <BaseIcon :name="FINAL_CONFIG.legendIcon" :stroke="legendItem.color" :size="FINAL_CONFIG.legendIconSize"/>
                        <span :style="`font-size:${FINAL_CONFIG.legendFontSize}px`">
                            {{ legendItem.name }}
                        </span>
                    </template>
                </div>
            </template>
        </div>

        <Tooltip
            :show="mutableConfig.showTooltip && isTooltip"
            :backgroundColor="FINAL_CONFIG.backgroundColor"
            :color="FINAL_CONFIG.color"
            :borderRadius="FINAL_CONFIG.tooltipBorderRadius"
            :borderColor="FINAL_CONFIG.tooltipBorderColor"
            :borderWidth="FINAL_CONFIG.tooltipBorderWidth"
            :fontSize="FINAL_CONFIG.tooltipFontSize"
            :backgroundOpacity="FINAL_CONFIG.tooltipBackgroundOpacity"
            :position="FINAL_CONFIG.tooltipPosition"
            :offsetY="FINAL_CONFIG.tooltipOffsetY"
            :parent="quickChart"
            :content="tooltipContent"
            :isCustom="isFunction(FINAL_CONFIG.tooltipCustomFormat)"
        >
            <template #tooltip-before>
                <slot name="tooltip-before" v-bind="{...dataTooltipSlot}"></slot>
            </template>
            <template #tooltip-after>
                <slot name="tooltip-after" v-bind="{...dataTooltipSlot}"></slot>
            </template>
        </Tooltip>
    </div>
    <div v-else class="vue-ui-quick-chart-not-processable">
        <BaseIcon name="circleCancel" stroke="red"/>
        <span>Dataset is not processable</span>
    </div>
</template>

<style scoped>
@import "../vue-data-ui.css";
.vue-ui-quick-chart * {
    transition: unset;
}

.vue-ui-quick-chart {
    user-select: none;
    width: 100%;
}

.vue-ui-quick-chart-not-processable {
    align-items:center;
    background: rgba(255,0,0,0.1);
    border-radius: 6px;
    color: red;
    display: flex;
    flex-direction: row;
    gap: 12px;
    justify-content: center;
    padding: 12px;
}

.vue-ui-quick-chart-title {
    padding: 0 40px 12px 40px;
}

.vue-ui-quick-chart-legend {
    align-items: center;
    display: flex;
    column-gap:24px;
    justify-content: center;
    width: 100%;
    flex-wrap: wrap;
}

.vue-ui-quick-chart-legend-item {
    display: flex;
    flex-direction: flex-row;
    gap: 6px;
    align-items: center;
}

.quick-animation {
    animation: quick 0.5s ease-in-out;
    transform-origin: center;
}
@keyframes quick {
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

.vue-data-ui-line-animated {
    stroke-dasharray: 2000;  
    stroke-dashoffset: 2000; 
    animation: vueDataUiLineAnimation 0.5s cubic-bezier(0.790, 0.210, 0.790, 0.210) forwards; 
}

@keyframes vueDataUiLineAnimation {
    to {
        stroke-dashoffset: 0;
      }
}

.vue-data-ui-bar-animated {
    animation: vueDataUiBarAnimation 0.5s cubic-bezier(0.790, 0.210, 0.790, 0.210) forwards;
}

@keyframes vueDataUiBarAnimation {
    from {
        height: 0;
    }
}
</style>