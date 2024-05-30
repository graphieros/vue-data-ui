<script setup>
import { ref, computed, onMounted, nextTick, onBeforeMount } from "vue";
import mainConfig from "../default_configs.json";
import * as detector from "../chartDetector";
import {
    calcMarkerOffsetX,
    calcMarkerOffsetY,
    calcNutArrowPath,
    calculateNiceScale,
    convertColorToHex,
    createSmoothPath,
    createUid,
    dataLabel,
    functionReturnsString,
    isFunction,
    makeDonut, 
    palette,
    XMLNS
} from "../lib";
import pdf from "../pdf";
import img from "../img";
import { useNestedProp } from "../useNestedProp";
import BaseIcon from "../atoms/BaseIcon.vue";
import Tooltip from "../atoms/Tooltip.vue";
import UserOptions from "../atoms/UserOptions.vue";
import Slicer from "../atoms/Slicer.vue";

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
const uid = ref(createUid());
const isTooltip = ref(false);
const dataTooltipSlot = ref(null);
const tooltipContent = ref('');
const selectedDatapoint = ref(null)
const defaultConfig = ref(mainConfig.vue_ui_quick_chart);
const segregated = ref([]);
const isPrinting = ref(false);
const isImaging = ref(false);
const step = ref(0);
const slicerStep = ref(0);

const quickConfig = computed(() => {
    return useNestedProp({
        userConfig: props.config,
        defaultConfig: defaultConfig.value
    });
});

const emit = defineEmits(['selectDatapoint', 'selectLegend'])

const fd = computed(() => {
    const f = detector.detectChart({ dataset: props.dataset, barLineSwitch: quickConfig.value.chartIsBarUnderDatasetLength });
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

const defaultSizes = ref({
    donut: {
        width: 512,
        height: 338
    },
    line: {
        width: 512,
        height: 338
    },
    bar: {
        width: 512,
        height: 338
    }
})

const viewBox = computed(() => {
    switch (chartType.value) {
        case detector.chartType.LINE:
            return `0 0 ${quickConfig.value.width || defaultSizes.value.line.width} ${quickConfig.value.height || defaultSizes.value.line.height}`;
        
        case detector.chartType.BAR:
        return `0 0 ${quickConfig.value.width || defaultSizes.value.bar.width} ${quickConfig.value.height || defaultSizes.value.bar.height}`;

        case detector.chartType.DONUT:
            return `0 0 ${quickConfig.value.width || defaultSizes.value.donut.width} ${quickConfig.value.height || defaultSizes.value.donut.height}`;
    
        default:
            return `0 0 ${quickConfig.value.width || defaultSizes.value.donut.width} ${quickConfig.value.height || defaultSizes.value.donut.height}`;
    }
});

function sumValues(source) {
    return [...source].map(s => s.value).reduce((a, b) => a + b, 0);
}

function getBlurFilter(id) {
    if (quickConfig.value.blurOnHover && ![null, undefined].includes(selectedDatapoint.value) && selectedDatapoint.value !== id) {
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

function segregateDonut(arc, ds) {
    let initVal = arc.value;
    if(segregated.value.includes(arc.id)) {
        segregated.value = segregated.value.filter(el => el !== arc.id)
        const targetVal = fd.value.dataset.find((el, i) => arc.id === `donut_${i}`).VALUE;
        function animUp() {
            if(initVal > targetVal) {
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
            color: ds.COLOR ? convertColorToHex(ds.COLOR) : palette[(i + quickConfig.value.paletteStartIndex)] || palette[(i + quickConfig.value.paletteStartIndex) % palette.length],
        }
    });

    function displayArcPercentage(arc, stepBreakdown) {
        return isNaN(arc.value / sumValues(stepBreakdown)) ? 0 : ((arc.value / sumValues(stepBreakdown)) * 100).toFixed(quickConfig.value.dataLabelRoundingPercentage) + "%";
    }

    function isArcBigEnough(arc) {
        return arc.proportion * 100 > quickConfig.value.donutHideLabelUnderPercentage;
    }

    function getSpaces(datapointId, num2) {
        const num1 = fd.value.dataset.find((_,i) => `donut_${i}` === datapointId).VALUE;
        const difference = Math.abs(String(Number(num1.toFixed(0))).length - String(Number(num2.toFixed(0))).length);
        return difference
    }

    function useTooltip({ datapoint, seriesIndex }) {
        dataTooltipSlot.value = { datapoint, seriesIndex, config: quickConfig.value, dataset: ds };
        selectedDatapoint.value = datapoint.id;
        const customFormat = quickConfig.value.tooltipCustomFormat;

        if(isFunction(customFormat) && functionReturnsString(() => customFormat({
            datapoint,
            seriesIndex,
            series: ds,
            config: quickConfig.value
        }))) {
            tooltipContent.value = customFormat({
                datapoint,
                seriesIndex,
                series: ds,
                config: quickConfig.value
            })
        } else {
            let html = '';
            html += `<div style="width:100%;text-align:center;border-bottom:1px solid #ccc;padding-bottom:6px;margin-bottom:3px;">${datapoint.name}</div>`;
            html += `<div style="display:flex;flex-direction:row;gap:6px;align-items:center;"><svg viewBox="0 0 12 12" height="14" width="14"><circle data-cy="donut-tooltip-marker" cx="6" cy="6" r="6" stroke="none" fill="${datapoint.color}"/></svg>`;

            html += `<b>${ dataLabel({p: quickConfig.value.valuePrefix, v: datapoint.value, s: quickConfig.value.valueSuffix, r: quickConfig.value.dataLabelRoundingValue})}</b>`;
            
            html += `<span>(${dataLabel({ v: datapoint.proportion * 100, s: '%', r: quickConfig.value.dataLabelRoundingPercentage})})</span></div>`;
            

            tooltipContent.value = `<div>${html}</div>`;
        }
        isTooltip.value = true;
    }

    function killTooltip() {
        isTooltip.value = false;
        selectedDatapoint.value = null;
    }

    const drawingArea = {
        centerX: (quickConfig.value.width || defaultSizes.value.donut.width) / 2,
        centerY: (quickConfig.value.height || defaultSizes.value.donut.height) / 2
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
        chart: makeDonut(
            { series: ds.filter(s => !segregated.value.includes(s.id)) },
            (quickConfig.value.width || defaultSizes.value.donut.width) / 2,
            (quickConfig.value.height || defaultSizes.value.donut.height) / 2,
            (quickConfig.value.height || defaultSizes.value.donut.height) * quickConfig.value.donutRadiusRatio,
            (quickConfig.value.height || defaultSizes.value.donut.height) * quickConfig.value.donutRadiusRatio,
            1.99999,
            2,
            1,
            360,
            105.25,
            (quickConfig.value.height || defaultSizes.value.donut.height) * quickConfig.value.donutThicknessRatio
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

const line = computed(() => {
    if(chartType.value !== detector.chartType.LINE) return null;

    const chartDimensions = {
        height: quickConfig.value.height || defaultSizes.value.line.height,
        width: quickConfig.value.width || defaultSizes.value.donut.width
    }

    const drawingArea = {
        left: quickConfig.value.xyPaddingLeft,
        top: quickConfig.value.xyPaddingTop,
        right: chartDimensions.width - quickConfig.value.xyPaddingRight,
        bottom: chartDimensions.height - quickConfig.value.xyPaddingBottom,
        width: chartDimensions.width - quickConfig.value.xyPaddingLeft - quickConfig.value.xyPaddingRight,
        height: chartDimensions.height - quickConfig.value.xyPaddingTop - quickConfig.value.xyPaddingBottom
    }

    let ds = [];

    if(detector.isSimpleArrayOfNumbers(formattedDataset.value.dataset)) {
        ds = [
            {
                values: formattedDataset.value.dataset.slice(slicer.value.start, slicer.value.end),
                absoluteIndices: formattedDataset.value.dataset.map((d, i) => i).slice(slicer.value.start, slicer.value.end),
                name: quickConfig.value.title,
                color: palette[quickConfig.value.paletteStartIndex],
                id: `line_0`
            }
        ]
    }

    if(detector.isSimpleArrayOfObjects(formattedDataset.value.dataset)) {
        ds = formattedDataset.value.dataset.map((d, i) => {
            return {
                ...d,
                values: d.VALUE || d.DATA || d.SERIE || d.VALUES || d.NUM || 0,
                name: d.NAME || d.DESCRIPTION || d.TITLE || d.LABEL || `Serie ${i}`,
                id: `line_${i}`
            }
        }).map((d, i) => {
            return {
                ...d,
                color: d.COLOR ? convertColorToHex(d.COLOR) : palette[i + (quickConfig.value.paletteStartIndex)] || palette[(i + quickConfig.value.paletteStartIndex) % palette.length],
                values: d.values.slice(slicer.value.start, slicer.value.end),
                absoluteIndices: d.values.map((d,i) => i).slice(slicer.value.start, slicer.value.end)
            }
        })
    }
    const extremes = {
        max: Math.max(...ds.filter(d => !segregated.value.includes(d.id)).flatMap(d => d.values)),
        min: Math.min(...ds.filter(d => !segregated.value.includes(d.id)).flatMap(d => d.values)),
        maxSeries: Math.max(...ds.map(d => d.values.length))
    }

    const scale = calculateNiceScale(extremes.min < 0 ? extremes.min : 0, extremes.max, quickConfig.value.xyScaleSegments)
    const absoluteMin = extremes.min < 0 ? Math.abs(extremes.min) : 0;
    const absoluteZero = drawingArea.bottom - (absoluteMin / (scale.max + absoluteMin) * drawingArea.height)
    const slotSize = drawingArea.width / extremes.maxSeries;


    const yLabels = scale.ticks.map(t => {
        return {
            y: drawingArea.bottom - (drawingArea.height * ((t + absoluteMin) / (scale.max + absoluteMin))),
            x: drawingArea.left -8,
            value: t
        }
    })

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
        const mappedSeries = ds.map(d => {
            return {
                ...d,
                value: d.values[index],
                absoluteIndex: d.absoluteIndices[index]
            }
        }).filter(d => !segregated.value.includes(d.id))
        dataTooltipSlot.value = { datapoint: mappedSeries, seriesIndex: index, config: quickConfig.value, dataset: ds };
        const customFormat = quickConfig.value.tooltipCustomFormat;

        if (isFunction(customFormat) && functionReturnsString(() => customFormat({
            datapoint: mappedSeries,
            seriesIndex: index,
            series: ds,
            config: quickConfig.value
        }))) {
            tooltipContent.value = customFormat({
                datapoint: mappedSeries,
                seriesIndex: index,
                series: ds,
                config: quickConfig.value
            })
        } else {
            let html = '';

            if (quickConfig.value.xyPeriods[mappedSeries[0].absoluteIndex]) {
                html += `<div style="border-bottom:1px solid #ccc;padding-bottom:6px;margin-bottom:3px;">${quickConfig.value.xyPeriods[mappedSeries[0].absoluteIndex]}</div>`
            }

            mappedSeries.forEach(s => {
                html += `
                    <div style="display:flex; flex-wrap: wrap; align-items:center; gap:3px;">
                        <svg viewBox="0 0 12 12" height="14" width="12"><circle cx="6" cy="6" r="6" stroke="none" fill="${s.color}"/></svg>
                        <span>${s.name}</span>:
                        <b>${dataLabel({
                            p: quickConfig.value.valuePrefix,
                            v: s.value,
                            s: quickConfig.value.valueSuffix,
                            r: quickConfig.value.dataLabelRoundingValue
                        })}</b>
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
        height: quickConfig.value.height || defaultSizes.value.bar.height,
        width: quickConfig.value.width || defaultSizes.value.bar.width
    };

    const drawingArea = {
        left: quickConfig.value.xyPaddingLeft,
        top: quickConfig.value.xyPaddingTop,
        right: chartDimensions.width - quickConfig.value.xyPaddingRight,
        bottom: chartDimensions.height - quickConfig.value.xyPaddingBottom,
        width: chartDimensions.width - quickConfig.value.xyPaddingLeft - quickConfig.value.xyPaddingRight,
        height: chartDimensions.height - quickConfig.value.xyPaddingTop - quickConfig.value.xyPaddingBottom
    }

    let ds = [];

    if(detector.isSimpleArrayOfNumbers(formattedDataset.value.dataset)) {
        ds = [
            {
                values: formattedDataset.value.dataset.slice(slicer.value.start, slicer.value.end),
                absoluteIndices: formattedDataset.value.dataset.map((_,i) => i).slice(slicer.value.start, slicer.value.end),
                name: quickConfig.value.title,
                color: palette[quickConfig.value.paletteStartIndex],
                id: 'bar_0'
            }
        ]
    }

    if (detector.isSimpleArrayOfObjects(formattedDataset.value.dataset)) {
        ds = formattedDataset.value.dataset.map((d, i) => {
            return {
                ...d,
                values: d.VALUE || d.DATA || d.SERIE || d.VALUES || d.NUM || 0,
                name: d.NAME || d.DESCRIPTION || d.TITLE || d.LABEL || `Serie ${i}`,
                id: `bar_${i}`
            }
        }).map((d, i) => {
            return {
                ...d,
                color: d.COLOR ? convertColorToHex(d.COLOR) : palette[i + (quickConfig.value.paletteStartIndex)] || palette[(i + quickConfig.value.paletteStartIndex) % palette.length],
                values: d.values.slice(slicer.value.start, slicer.value.end),
                absoluteIndices: d.values.map((_,i) => i).slice(slicer.value.start, slicer.value.end)
            }
        });
    }

    const extremes = {
        max: Math.max(...ds.filter(d => !segregated.value.includes(d.id)).flatMap(d => d.values)),
        min: Math.min(...ds.filter(d => !segregated.value.includes(d.id)).flatMap(d => d.values)),
        maxSeries: Math.max(...ds.filter(d => !segregated.value.includes(d.id)).map(d => d.values.length))
    }

    const scale = calculateNiceScale(extremes.min < 0 ? extremes.min : 0, extremes.max, quickConfig.value.xyScaleSegments)
    const absoluteMin = extremes.min < 0 ? Math.abs(extremes.min) : 0;
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
                const barWidth = (slotSize / ds.filter(d => !segregated.value.includes(d.id)).length) - (quickConfig.value.barGap / ds.filter(d => !segregated.value.includes(d.id)).length);

                return {
                    x: drawingArea.left + (slotSize * j) + (barWidth * i) + (quickConfig.value.barGap / 2),
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
                const barWidth = (slotSize / ds.filter(d => !segregated.value.includes(d.id)).length) - (quickConfig.value.barGap / ds.filter(d => !segregated.value.includes(d.id)).length);

                return {
                    x: drawingArea.left + (slotSize * j) + (barWidth * i) + (quickConfig.value.barGap / 2),
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

        const mappedSeries = ds.map(d => {
            return {
                ...d,
                value: d.values[index],
                absoluteIndex: d.absoluteIndices[index]
            }
        }).filter(d => !segregated.value.includes(d.id));

        dataTooltipSlot.value = { datapoint: mappedSeries, seriesIndex: index, config: quickConfig.value, dataset: ds };
        const customFormat = quickConfig.value.tooltipCustomFormat;

        if (isFunction(customFormat) && functionReturnsString(() => customFormat({
            datapoint: mappedSeries,
            seriesIndex: index,
            series: ds,
            config: quickConfig.value
        }))) {  
            tooltipContent.value = customFormat({
                point: mappedSeries,
                seriesIndex: index,
                series: ds,
                config: quickConfig.value
            })
        } else {
            let html = '';

            if (quickConfig.value.xyPeriods[mappedSeries[0].absoluteIndex]) {
                html += `<div style="border-bottom:1px solid #ccc;padding-bottom:6px;margin-bottom:3px;">${quickConfig.value.xyPeriods[mappedSeries[0].absoluteIndex]}</div>`
            }

            mappedSeries.forEach(s => {
                html += `
                    <div style="display:flex; flex-wrap: wrap; align-items:center; gap:3px;">
                        <svg viewBox="0 0 12 12" height="14" width="12"><rect x=0 y="0" width="12" height="12" rx="1" stroke="none" fill="${s.color}"/></svg>
                        <span>${s.name}</span>:
                        <b>${dataLabel({
                            p: quickConfig.value.valuePrefix,
                            v: s.value,
                            s: quickConfig.value.valueSuffix,
                            r: quickConfig.value.dataLabelRoundingValue
                        })}</b>
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

const __to__ = ref(null);

function showSpinnerPdf() {
    isPrinting.value = true;
}

function generatePdf(){
    showSpinnerPdf();
    clearTimeout(__to__.value);
    __to__.value = setTimeout(() => {
        pdf({
            domElement: document.getElementById(`${chartType.value}_${uid.value}`),
            fileName: quickConfig.value.title || chartType.value
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
            domElement: document.getElementById(`${chartType.value}_${uid.value}`),
            fileName: quickConfig.value.title || chartType.value,
            format: 'png'
        }).finally(() => {
            isImaging.value = false;
        })
    }, 100)
}

const isFullscreen = ref(false)
function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
}

defineExpose({
    generatePdf,
    generateImage
})

</script>

<template>
    <div 
        v-if="isProcessable"
        :id="`${chartType}_${uid}`"
        ref="quickChart"
        :class="{'vue-ui-quick-chart': true, 'vue-data-ui-wrapper-fullscreen' : isFullscreen }" 
        :style="`background:${quickConfig.backgroundColor};color:${quickConfig.color};font-family:${quickConfig.fontFamily}; position: relative`"
    >

        <UserOptions
            ref="details"
            :key="`user_option_${step}`"
            v-if="quickConfig.showUserOptions"
            :backgroundColor="quickConfig.backgroundColor"
            :color="quickConfig.color"
            :isPrinting="isPrinting"
            :isImaging="isImaging"
            :title="quickConfig.title"
            :uid="uid"
            hasImg
            hasFullscreen
            :hasXls="false"
            :isFullscreen="isFullscreen"
            :chartElement="quickChart"
            @toggleFullscreen="toggleFullscreen"
            @generatePdf="generatePdf"
            @generateImage="generateImage"
        />

        <div class="vue-ui-quick-chart-title" v-if="quickConfig.title" :style="`background:${quickConfig.backgroundColor};color:${quickConfig.color};font-size:${quickConfig.titleFontSize}px;font-weight:${quickConfig.titleBold ? 'bold': 'normal'};text-align:${quickConfig.titleTextAlign}`">
            {{ quickConfig.title }}
        </div>
        <svg
            :xmlns="XMLNS"
            :viewBox="viewBox" 
            :style="`max-width:100%;overflow:visible;background:${quickConfig.backgroundColor};color:${quickConfig.color}`"
        >
            <defs>
                <filter :id="`blur_${uid}`" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur in="SourceGraphic" :stdDeviation="2" :id="`blur_std_${uid}`" />
                    <feColorMatrix type="saturate" values="0" />
                </filter>
            </defs>

            <template v-if="chartType === detector.chartType.DONUT">
                <g class="donut-label-connectors" v-if="quickConfig.showDataLabels">
                    <template v-for="(arc, i) in donut.chart">
                        <path
                            v-if="donut.isArcBigEnough(arc)"
                            :d="calcNutArrowPath(arc, {x: (quickConfig.width || defaultSizes.donut.width) / 2, y: (quickConfig.height || defaultSizes.donut.height) /2}, 16, 16, false, false, quickConfig.donutLabelMarkerStrokeWidth)"
                            :stroke="arc.color"
                            :stroke-width="quickConfig.donutLabelMarkerStrokeWidth"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            fill="none"
                            :filter="getBlurFilter(arc.id)"
                        />                    
                    </template>
                </g>
                <circle
                    class="donut-hollow"
                    :cx="(quickConfig.width || defaultSizes.donut.width) / 2"
                    :cy="(quickConfig.height || defaultSizes.donut.height) /2"
                    :r="(quickConfig.height || defaultSizes.donut.height) * quickConfig.donutRadiusRatio"
                    :fill="quickConfig.backgroundColor"
                /> 
                <g class="donut">
                    <path
                        v-for="(arc, i) in donut.chart"
                        :d="arc.arcSlice"
                        :fill="arc.color"
                        :stroke="quickConfig.backgroundColor"
                        :stroke-width="quickConfig.donutStrokeWidth"
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
                <g class="donut-labels quick-animation" v-if="quickConfig.showDataLabels">
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
                            :fill="quickConfig.color"
                            :font-size="quickConfig.dataLabelFontSize"
                            :filter="getBlurFilter(arc.id)"
                        >
                            {{ donut.displayArcPercentage(arc, donut.chart) }} 
                            ({{ dataLabel({
                                p: quickConfig.valuePrefix,
                                v: arc.value,
                                s: quickConfig.valueSuffix,
                                r: quickConfig.dataLabelRoundingValue
                            }) }})
                        </text>
                        <text
                            v-if="donut.isArcBigEnough(arc, true, 20)"
                            :text-anchor="calcMarkerOffsetX(arc).anchor"
                            :x="calcMarkerOffsetX(arc, true).x"
                            :y="calcMarkerOffsetY(arc) + quickConfig.dataLabelFontSize"
                            :fill="quickConfig.color"
                            :font-size="quickConfig.dataLabelFontSize"
                            :filter="getBlurFilter(arc.id)"
                        >
                            {{ arc.name }}
                        </text>
                    </template>
                </g>
                <g class="donut-hollow quick-animation" v-if="quickConfig.donutShowTotal">
                    <text
                        text-anchor="middle"
                        :x="donut.drawingArea.centerX"
                        :y="donut.drawingArea.centerY - quickConfig.donutTotalLabelFontSize / 2"
                        :font-size="quickConfig.donutTotalLabelFontSize"
                        :fill="quickConfig.color"
                    >
                        {{ quickConfig.donutTotalLabelText }}
                    </text>
                    <text
                        text-anchor="middle"
                        :x="donut.drawingArea.centerX"
                        :y="donut.drawingArea.centerY + quickConfig.donutTotalLabelFontSize"
                        :font-size="quickConfig.donutTotalLabelFontSize"
                        :fill="quickConfig.color"
                    >
                        {{ dataLabel({
                            p: quickConfig.valuePrefix,
                            v: donut.total,
                            s: quickConfig.valueSuffix,
                            r: quickConfig.dataLabelRoundingValue
                        }) }}
                    </text>
                </g>
            </template>

            <template v-if="chartType === detector.chartType.LINE">
                <g class="line-grid" v-if="quickConfig.xyShowGrid">
                    <template v-for="yGridLine in line.yLabels">
                        <line
                            v-if="yGridLine.y <= line.drawingArea.bottom"
                            :x1="line.drawingArea.left"
                            :x2="line.drawingArea.right"
                            :y1="yGridLine.y"
                            :y2="yGridLine.y"
                            :stroke="quickConfig.xyGridStroke"
                            :stroke-width="quickConfig.xyGridStrokeWidth"
                            stroke-linecap="round"
                        />
                    </template>
                    <line
                        v-for="(_, i) in line.extremes.maxSeries + 1"
                            :x1="line.drawingArea.left + (line.slotSize * (i))"
                            :x2="line.drawingArea.left + (line.slotSize * (i))"
                            :y1="line.drawingArea.top"
                            :y2="line.drawingArea.bottom"
                            :stroke="quickConfig.xyGridStroke"
                            :stroke-width="quickConfig.xyGridStrokeWidth"
                            stroke-linecap="round"
                    />
                </g>
                <g class="line-axis" v-if="quickConfig.xyShowAxis">
                    <line
                        :x1="line.drawingArea.left"
                        :x2="line.drawingArea.left"
                        :y1="line.drawingArea.top"
                        :y2="line.drawingArea.bottom"
                        :stroke="quickConfig.xyAxisStroke"
                        :stroke-width="quickConfig.xyAxisStrokeWidth"
                        stroke-linecap="round"
                    />
                    <line
                        :x1="line.drawingArea.left"
                        :x2="line.drawingArea.right"
                        :y1="line.absoluteZero"
                        :y2="line.absoluteZero"
                        :stroke="quickConfig.xyAxisStroke"
                        :stroke-width="quickConfig.xyAxisStrokeWidth"
                        stroke-linecap="round"
                    />
                </g>
                <g class="yLabels" v-if="quickConfig.xyShowScale">
                    <template v-for="label in line.yLabels">   
                        <line
                            v-if="label.y <= line.drawingArea.bottom"
                            :x1="label.x + 4"
                            :x2="line.drawingArea.left"
                            :y1="label.y"
                            :y2="label.y"
                            :stroke="quickConfig.xyAxisStroke"
                            :stroke-width="quickConfig.xyAxisStrokeWidth"
                            stroke-linecap="round"
                        />
                        <text
                            v-if="label.y <= line.drawingArea.bottom"
                            :x="label.x"
                            :y="label.y + quickConfig.xyLabelsYFontSize / 3"
                            text-anchor="end"
                            :font-size="quickConfig.xyLabelsYFontSize"
                            :fill="quickConfig.color"
                        >
                            {{ dataLabel({
                                p: quickConfig.valuePrefix,
                                v: label.value,
                                s: quickConfig.valueSuffix,
                                r: quickConfig.dataLabelRoundingValue
                            }) }}
                        </text>
                    </template>
                </g>
                <g class="periodLabels" v-if="quickConfig.xyShowScale && quickConfig.xyPeriods.length">
                    <line
                        v-for="(_, i) in quickConfig.xyPeriods.slice(slicer.start, slicer.end)"
                        :x1="line.drawingArea.left + (line.slotSize * (i+1)) - (line.slotSize / 2)"
                        :x2="line.drawingArea.left + (line.slotSize * (i+1)) - (line.slotSize / 2)"
                        :y1="line.drawingArea.bottom"
                        :y2="line.drawingArea.bottom + 4"
                        :stroke="quickConfig.xyAxisStroke"
                        :stroke-width="quickConfig.xyAxisStrokeWidth"
                        stroke-linecap="round"
                    />
                    <text
                        v-for="(period, i) in quickConfig.xyPeriods.slice(slicer.start, slicer.end)"
                        :font-size="quickConfig.xyLabelsXFontSize"
                        :text-anchor="quickConfig.xyPeriodLabelsRotation > 0 ? 'start' : quickConfig.xyPeriodLabelsRotation < 0 ? 'end' : 'middle'"
                        :fill="quickConfig.color"
                        :transform="`translate(${line.drawingArea.left + (line.slotSize * (i+1)) - (line.slotSize / 2)}, ${line.drawingArea.bottom + quickConfig.xyLabelsXFontSize + 6}), rotate(${quickConfig.xyPeriodLabelsRotation})`"
                    >
                        {{ period }}
                    </text>
                </g>
                <g class="plots">
                    <template v-for="(ds, i) in line.dataset">
                        <g class="line-plot-series">
                            <template v-if="quickConfig.lineSmooth">
                                <path
                                    :d="`M ${createSmoothPath(ds.coordinates)}`"
                                    :stroke="quickConfig.backgroundColor"
                                    :stroke-width="quickConfig.lineStrokeWidth + 1"
                                    stroke-linecap="round"
                                    fill="none"
                                    class="quick-animation"
                                    style="transition: all 0.3s ease-in-out"
                                />
                                <path
                                    :d="`M ${createSmoothPath(ds.coordinates)}`"
                                    :stroke="ds.color"
                                    :stroke-width="quickConfig.lineStrokeWidth"
                                    stroke-linecap="round"
                                    fill="none"
                                    class="quick-animation"
                                    style="transition: all 0.3s ease-in-out"
                                />
                            </template>
                            <template v-else>
                                <path
                                    :d="`M ${ds.linePath}`"
                                    :stroke="quickConfig.backgroundColor"
                                    :stroke-width="quickConfig.lineStrokeWidth + 1"
                                    stroke-linecap="round"
                                    fill="none"
                                    class="quick-animation"
                                    style="transition: all 0.3s ease-in-out"
                                />
                                <path
                                    :d="`M ${ds.linePath}`"
                                    :stroke="ds.color"
                                    :stroke-width="quickConfig.lineStrokeWidth"
                                    stroke-linecap="round"
                                    fill="none"
                                    class="quick-animation"
                                    style="transition: all 0.3s ease-in-out"
                                />
                            </template>
                            <template v-for="(plot, j) in ds.coordinates">
                                <circle
                                    :cx="plot.x"
                                    :cy="plot.y"
                                    :r="3"
                                    :fill="ds.color"
                                    :stroke="quickConfig.backgroundColor"
                                    stroke-width="0.5"
                                    class="quick-animation"
                                    style="transition: all 0.3s ease-in-out"
                                />
                            </template>
                        </g>
                    </template>
                </g>
                <g class="dataLabels" v-if="quickConfig.showDataLabels">
                    <template v-for="(ds, i) in line.dataset">
                        <text 
                            v-for="(plot, j) in ds.coordinates"
                            text-anchor="middle"
                            :font-size="quickConfig.dataLabelFontSize"
                            :fill="ds.color"
                            :x="plot.x"
                            :y="plot.y - quickConfig.dataLabelFontSize / 2"
                            class="quick-animation"
                            style="transition: all 0.3s ease-in-out"
                        >
                            {{ dataLabel({
                                p: quickConfig.valuePrefix,
                                v: plot.value,
                                s: quickConfig.valueSuffix,
                                r: quickConfig.dataLabelRoundingValue
                            }) }}
                        </text>
                    </template>
                </g>
                <g class="tooltip-traps">
                    <rect 
                        v-for="(_, i) in line.extremes.maxSeries"
                        :x="line.drawingArea.left + (i * line.slotSize)"
                        :y="line.drawingArea.top"
                        :height="line.drawingArea.height"
                        :width="line.slotSize"
                        :fill="selectedDatapoint === i ? quickConfig.xyHighlighterColor : 'transparent'"
                        :style="`opacity:${quickConfig.xyHighlighterOpacity}`"
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
                <g class="line-grid" v-if="quickConfig.xyShowGrid">
                    <template v-for="yGridLine in bar.yLabels">
                        <line
                            v-if="yGridLine.y <= bar.drawingArea.bottom"
                            :x1="bar.drawingArea.left"
                            :x2="bar.drawingArea.right"
                            :y1="yGridLine.y"
                            :y2="yGridLine.y"
                            :stroke="quickConfig.xyGridStroke"
                            :stroke-width="quickConfig.xyGridStrokeWidth"
                            stroke-linecap="round"
                        />
                    </template>
                        <line
                        v-for="(_, i) in bar.extremes.maxSeries + 1"
                        :x1="bar.drawingArea.left + (bar.slotSize * (i))"
                        :x2="bar.drawingArea.left + (bar.slotSize * (i))"
                        :y1="bar.drawingArea.top"
                        :y2="bar.drawingArea.bottom"
                        :stroke="quickConfig.xyGridStroke"
                        :stroke-width="quickConfig.xyGridStrokeWidth"
                        stroke-linecap="round"
                    />
                </g>
                <g class="line-axis" v-if="quickConfig.xyShowAxis">
                    <line
                        :x1="bar.drawingArea.left"
                        :x2="bar.drawingArea.left"
                        :y1="bar.drawingArea.top"
                        :y2="bar.drawingArea.bottom"
                        :stroke="quickConfig.xyAxisStroke"
                        :stroke-width="quickConfig.xyAxisStrokeWidth"
                        stroke-linecap="round"
                    />
                    <line
                        :x1="bar.drawingArea.left"
                        :x2="bar.drawingArea.right"
                        :y1="bar.absoluteZero"
                        :y2="bar.absoluteZero"
                        :stroke="quickConfig.xyAxisStroke"
                        :stroke-width="quickConfig.xyAxisStrokeWidth"
                        stroke-linecap="round"
                    />
                </g>
                <g class="yLabels" v-if="quickConfig.xyShowScale">
                    <template v-for="label in bar.yLabels">   
                        <line
                            v-if="label.y <= bar.drawingArea.bottom"
                            :x1="label.x + 4"
                            :x2="bar.drawingArea.left"
                            :y1="label.y"
                            :y2="label.y"
                            :stroke="quickConfig.xyAxisStroke"
                            :stroke-width="quickConfig.xyAxisStrokeWidth"
                            stroke-linecap="round"
                        />
                        <text
                            v-if="label.y <= bar.drawingArea.bottom"
                            :x="label.x"
                            :y="label.y + quickConfig.xyLabelsYFontSize / 3"
                            text-anchor="end"
                            :font-size="quickConfig.xyLabelsYFontSize"
                            :fill="quickConfig.color"
                        >
                            {{ dataLabel({
                                p: quickConfig.valuePrefix,
                                v: label.value,
                                s: quickConfig.valueSuffix,
                                r: quickConfig.dataLabelRoundingValue
                            }) }}
                        </text>
                    </template>
                </g>
                <g class="periodLabels" v-if="quickConfig.xyShowScale && quickConfig.xyPeriods.length">
                    <line
                        v-for="(_, i) in quickConfig.xyPeriods.slice(slicer.start, slicer.end)"
                        :x1="bar.drawingArea.left + (bar.slotSize * (i+1)) - (bar.slotSize / 2)"
                        :x2="bar.drawingArea.left + (bar.slotSize * (i+1)) - (bar.slotSize / 2)"
                        :y1="bar.drawingArea.bottom"
                        :y2="bar.drawingArea.bottom + 4"
                        :stroke="quickConfig.xyAxisStroke"
                        :stroke-width="quickConfig.xyAxisStrokeWidth"
                        stroke-linecap="round"
                    />
                    <text
                        v-for="(period, i) in quickConfig.xyPeriods.slice(slicer.start, slicer.end)"
                        :font-size="quickConfig.xyLabelsXFontSize"
                        :text-anchor="quickConfig.xyPeriodLabelsRotation > 0 ? 'start' : quickConfig.xyPeriodLabelsRotation < 0 ? 'end' : 'middle'"
                        :transform="`translate(${bar.drawingArea.left + (bar.slotSize * (i+1)) - (bar.slotSize / 2)}, ${bar.drawingArea.bottom + quickConfig.xyLabelsXFontSize + 6}) rotate(${quickConfig.xyPeriodLabelsRotation})`"
                        :fill="quickConfig.color"
                    >
                        {{ period }}
                    </text>
                </g>
                <g class="plots">
                    <template v-for="(ds, i) in bar.dataset">
                        <rect 
                            v-for="(plot, j) in ds.coordinates"
                            :x="plot.x"
                            :y="plot.y"
                            :width="plot.width"
                            :height="plot.height"
                            :fill="ds.color"
                            :stroke="quickConfig.backgroundColor"
                            :stroke-width="quickConfig.barStrokeWidth"
                            stroke-linecap="round"
                            style="transition: all 0.3s ease-in-out"
                        />
                    </template>
                </g>
                <g class="dataLabels" v-if="quickConfig.showDataLabels">
                    <template v-for="(ds, i) in bar.dataset">
                        <text 
                            v-for="(plot, j) in ds.coordinates"
                            :x="plot.x + plot.width / 2"
                            :y="plot.y - quickConfig.dataLabelFontSize / 2"
                            text-anchor="middle"
                            :font-size="quickConfig.dataLabelFontSize"
                            :fill="ds.color"
                            class="quick-animation"
                        >
                            {{ dataLabel({
                                p: quickConfig.valuePrefix,
                                v: plot.value,
                                s: quickConfig.valueSuffix,
                                r: quickConfig.dataLabelRoundingValue
                            }) }}
                        </text>
                    </template>
                </g>
                <g class="tooltip-traps">
                    <rect 
                        v-for="(_, i) in bar.extremes.maxSeries"
                        :x="bar.drawingArea.left + (i * bar.slotSize)"
                        :y="bar.drawingArea.top"
                        :height="bar.drawingArea.height"
                        :width="bar.slotSize"
                        :fill="selectedDatapoint === i ? quickConfig.xyHighlighterColor : 'transparent'"
                        :style="`opacity:${quickConfig.xyHighlighterOpacity}`"
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
                    <g v-if="quickConfig.xAxisLabel && chartType === detector.chartType.LINE">
                        <text 
                            :font-size="quickConfig.axisLabelsFontSize"
                            :fill="quickConfig.color" 
                            text-anchor="middle"
                            :x="line.drawingArea.left + (line.drawingArea.width / 2)"
                            :y="defaultSizes.line.height - (quickConfig.axisLabelsFontSize / 3)"
                        >
                            {{ quickConfig.xAxisLabel }}
                        </text>
                    </g>
                    <g v-if="quickConfig.xAxisLabel && chartType === detector.chartType.BAR">
                        <text 
                            :font-size="quickConfig.axisLabelsFontSize"
                            :fill="quickConfig.color" 
                            text-anchor="middle"
                            :x="bar.drawingArea.left + (bar.drawingArea.width / 2)"
                            :y="defaultSizes.bar.height - (quickConfig.axisLabelsFontSize / 3)"
                        >
                            {{ quickConfig.xAxisLabel }}
                        </text>
                    </g>
                    <g v-if="quickConfig.yAxisLabel && chartType === detector.chartType.LINE">
                        <text 
                            :font-size="quickConfig.axisLabelsFontSize"
                            :fill="quickConfig.color"
                            :transform="`translate(${quickConfig.axisLabelsFontSize}, ${line.drawingArea.top + (line.drawingArea.height / 2)}) rotate(-90)`"
                            text-anchor="middle"
                        >
                            {{ quickConfig.yAxisLabel }}
                        </text>
                    </g>
                    <g v-if="quickConfig.yAxisLabel && chartType === detector.chartType.BAR">
                        <text 
                            :font-size="quickConfig.axisLabelsFontSize"
                            :fill="quickConfig.color"
                            :transform="`translate(${quickConfig.axisLabelsFontSize}, ${bar.drawingArea.top + (bar.drawingArea.height / 2)}) rotate(-90)`"
                            text-anchor="middle"
                        >
                            {{ quickConfig.yAxisLabel }}
                        </text>
                    </g>
                </g>
            </template>
        </svg>

        <Slicer 
            v-if="[detector.chartType.BAR, detector.chartType.LINE].includes(chartType) && quickConfig.zoomXy && formattedDataset.maxSeriesLength > 1"
            :key="`slicer_${slicerStep}`"
            :background="quickConfig.zoomColor"
            :borderColor="quickConfig.backgroundColor"
            :fontSize="quickConfig.zoomFontSize"
            :useResetSlot="quickConfig.zoomUseResetSlot"
            :labelLeft="quickConfig.xyPeriods[slicer.start] ? quickConfig.xyPeriods[slicer.start] : ''"
            :labelRight="quickConfig.xyPeriods[slicer.end-1] ? quickConfig.xyPeriods[slicer.end-1] : ''"
            :textColor="quickConfig.color"
            :inputColor="quickConfig.zoomColor"
            :selectColor="quickConfig.zoomHighlightColor"
            :max="formattedDataset.maxSeriesLength"
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
        
        <div 
            v-if="quickConfig.showLegend"
            class="vue-ui-quick-chart-legend" 
            :style="`background:${quickConfig.backgroundColor};color:${quickConfig.color}`"
        >
            <template v-if="chartType === detector.chartType.DONUT">
                <div 
                    class="vue-ui-quick-chart-legend-item" 
                    v-for="(legendItem, i) in donut.legend" 
                    @click="segregateDonut(legendItem, donut.dataset); emit('selectLegend', legendItem)"
                    :style="`cursor: ${donut.legend.length > 1 ? 'pointer' : 'default'}; opacity:${segregated.includes(legendItem.id) ? '0.5' : '1'}`"
                >
                    <template v-if="quickConfig.useCustomLegend">
                        <slot name="legend" v-bind="{ legend: legendItem }"/>
                    </template>

                    <template v-else>
                        <BaseIcon :name="quickConfig.legendIcon" :stroke="legendItem.color" :size="quickConfig.legendIconSize"/>
                        <span :style="`font-size:${quickConfig.legendFontSize}px`">
                            {{ legendItem.name }}
                        </span>
                        <span :style="`font-size:${quickConfig.legendFontSize}px;font-variant-numeric:tabular-nums`">
                            {{ segregated.includes(legendItem.id) ? '-' : dataLabel({
                                p: quickConfig.valuePrefix,
                                v: legendItem.absoluteValue,
                                s: quickConfig.valueSuffix,
                                r: quickConfig.dataLabelRoundingValue,
                            }) }}
                        </span>
                        <span v-if="segregated.includes(legendItem.id)" :style="`font-size:${quickConfig.legendFontSize}px`">
                            ( - % )
                        </span>
                        <span v-else :style="`font-size:${quickConfig.legendFontSize}px; font-variant-numeric: tabular-nums;`">
                            ({{ dataLabel({
                                v: legendItem.value / donut.total * 100,
                                s: '%',
                                r: quickConfig.dataLabelRoundingPercentage
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
                    <template v-if="quickConfig.useCustomLegend">
                        <slot name="legend" v-bind="{ legend: legendItem }"/>
                    </template>
                    <template v-else>
                        <BaseIcon :name="quickConfig.legendIcon" :stroke="legendItem.color" :size="quickConfig.legendIconSize"/>
                        <span :style="`font-size:${quickConfig.legendFontSize}px`">
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
                    <template v-if="quickConfig.useCustomLegend">
                        <slot name="legend" v-bind="{ legend: legendItem }"/>
                    </template>
                    <template v-else>
                        <BaseIcon :name="quickConfig.legendIcon" :stroke="legendItem.color" :size="quickConfig.legendIconSize"/>
                        <span :style="`font-size:${quickConfig.legendFontSize}px`">
                            {{ legendItem.name }}
                        </span>
                    </template>
                </div>
            </template>
        </div>

        <Tooltip
            :show="quickConfig.showTooltip && isTooltip"
            :backgroundColor="quickConfig.backgroundColor"
            :color="quickConfig.color"
            :parent="quickChart"
            :content="tooltipContent"
            :isCustom="isFunction(quickConfig.tooltipCustomFormat)"
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
</style>