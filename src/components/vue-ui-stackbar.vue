<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useConfig } from "../useConfig";
import { 
    adaptColorToBackground,
    applyDataLabel,
    calculateNiceScale,
    calculateNiceScaleWithExactExtremes, 
    convertColorToHex, 
    convertCustomPalette, 
    createCsvContent, 
    createUid, 
    dataLabel, 
    downloadCsv,
    error, 
    functionReturnsString, 
    getMissingDatasetAttributes, 
    hasDeepProperty, 
    isFunction, 
    lightenHexColor, 
    objectIsEmpty, 
    opacity, 
    palette, 
    sumSeries, 
    themePalettes, 
    XMLNS, 
} from "../lib";
import { useNestedProp } from "../useNestedProp";
import { throttle } from "../canvas-lib";
import { useResponsive } from "../useResponsive";
import { usePrinter } from "../usePrinter";
import themes from "../themes.json";
import Slicer from "../atoms/Slicer.vue";
import Tooltip from "../atoms/Tooltip.vue";
import Title from "../atoms/Title.vue";
import Legend from "../atoms/Legend.vue";
import UserOptions from "../atoms/UserOptions.vue";
import Accordion from "./vue-ui-accordion.vue";
import DataTable from "../atoms/DataTable.vue";
import Skeleton from "./vue-ui-skeleton.vue"

const { vue_ui_stackbar: DEFAULT_CONFIG } = useConfig()

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
    },
});

const emit = defineEmits(['selectDatapoint', 'selectLegend']);

const isDataset = computed({
    get() {
        return !!props.dataset && props.dataset.length
    },
    set(bool) {
        return bool
    }
});

const stackbarChart = ref(null);
const uid = ref(createUid());
const isTooltip = ref(false);
const dataTooltipSlot = ref(null);
const tooltipContent = ref('');
const segregated = ref([]);
const step = ref(0);
const chartTitle = ref(null);
const chartLegend = ref(null);
const chartSlicer = ref(null);
const slicerStep = ref(0);
const isFullscreen = ref(false);
const trapIndex = ref(null);
const isLoaded = ref(false);
const titleStep = ref(0);
const tableStep = ref(0);
const legendStep = ref(0);

onMounted(() => {
    prepareChart();
})

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
        defaultConfig: DEFAULT_CONFIG,
    });
    let finalConfig = {};
    if (mergedConfig.theme) {
        finalConfig = {
            ...useNestedProp({
                userConfig: themes.vue_ui_stackbar[mergedConfig.theme] || props.config,
                defaultConfig: mergedConfig
            }),
            customPalette: themePalettes[mergedConfig.theme] || palette
        }
    } else {
        finalConfig = mergedConfig;
    }

    // ------------------------------ OVERRIDES -----------------------------------

    if (props.config && hasDeepProperty(props.config, 'style.chart.grid.scale.scaleMin')) {
        finalConfig.style.chart.grid.scale.scaleMin = props.config.style.chart.grid.scale.scaleMin;
    } else {
        finalConfig.style.chart.grid.scale.scaleMin = null;
    }

    if (props.config && hasDeepProperty(props.config, 'style.chart.grid.scale.scaleMax')) {
        finalConfig.style.chart.grid.scale.scaleMax = props.config.style.chart.grid.scale.scaleMax;
    } else {
        finalConfig.style.chart.grid.scale.scaleMax = null;
    }

    // ----------------------------------------------------------------------------

    return finalConfig;
}

watch(() => props.config, (_newCfg) => {
    FINAL_CONFIG.value = prepareConfig();
    prepareChart();
    titleStep.value += 1;
    tableStep.value += 1;
    legendStep.value += 1;
}, { deep: true });

watch(() => props.dataset, (_) => {
    refreshSlicer();
}, { deep: true })

const mutableConfig = ref({
    dataLabels: {
        show: FINAL_CONFIG.value.style.chart.bars.dataLabels.show,
    },
    showTable: FINAL_CONFIG.value.table.show,
    showTooltip: FINAL_CONFIG.value.style.chart.tooltip.show
});

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `stackbar_${uid.value}`,
    fileName: FINAL_CONFIG.value.style.chart.title.text || 'vue-ui-stackbar'
});

const defaultSizes = ref({
    width: FINAL_CONFIG.value.style.chart.width,
    height: FINAL_CONFIG.value.style.chart.height,
    paddingRatio: {
        top: FINAL_CONFIG.value.style.chart.padding.top / FINAL_CONFIG.value.style.chart.height,
        right: FINAL_CONFIG.value.style.chart.padding.right / FINAL_CONFIG.value.style.chart.width,
        bottom: FINAL_CONFIG.value.style.chart.padding.bottom / FINAL_CONFIG.value.style.chart.height,
        left: FINAL_CONFIG.value.style.chart.padding.left / FINAL_CONFIG.value.style.chart.width,
    }
});

const customPalette = computed(() => {
    return convertCustomPalette(FINAL_CONFIG.value.customPalette);
});

const resizeObserver = ref(null);
const to = ref(null)
onMounted(() => {
    prepareChart();
});

function prepareChart() {
    if(objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiStackbar',
            type: 'dataset'
        });
    } else {
        props.dataset.forEach((datasetObject, index) => {
            getMissingDatasetAttributes({
                datasetObject,
                requiredAttributes: ['name', 'series']
            }).forEach(attr => {
                isDataset.value = false;
                error({
                    componentName: 'VueUiStackbar',
                    type: 'datasetSerieAttribute',
                    property: attr,
                    index
                })
            })
        })
    }
    setTimeout(() => {
        isLoaded.value = true;
    }, 10)

    if (FINAL_CONFIG.value.responsive) {
        const handleResize = throttle(() => {
            isLoaded.value = false; // unset rect transitions as it looks janky during resizing process
            const { width, height } = useResponsive({
                chart: stackbarChart.value,
                title: FINAL_CONFIG.value.style.chart.title.text ? chartTitle.value : null,
                legend: FINAL_CONFIG.value.style.chart.legend.show ? chartLegend.value : null,
                slicer: FINAL_CONFIG.value.style.chart.zoom.show && maxSeries.value > 1 ? chartSlicer.value : null
            });
            defaultSizes.value.width = width;
            defaultSizes.value.height = height;
            clearTimeout(to.value);
            to.value = setTimeout(() => {
                isLoaded.value = true;
            },10)
        });

        resizeObserver.value = new ResizeObserver(handleResize);
        resizeObserver.value.observe(stackbarChart.value.parentNode);
    }
}

const drawingArea = computed(() => {
    const { height: H, width: W } = defaultSizes.value;
    const { right: PR } = defaultSizes.value.paddingRatio;

    const top = FINAL_CONFIG.value.style.chart.padding.top;
    const right = W - (W * PR);
    const bottom = H - FINAL_CONFIG.value.style.chart.padding.bottom;
    const left = FINAL_CONFIG.value.style.chart.padding.left;

    const width = W - left - (W * PR);
    const height = H - top - FINAL_CONFIG.value.style.chart.padding.bottom;

    return {
        chartHeight: H,
        chartWidth: W,
        top,
        right,
        bottom,
        left,
        width,
        height: height < 0 ? 0 : height,
    }
});

const unmutableDataset = computed(() => {
    return props.dataset.map((ds, i) => {
        const color = convertColorToHex(ds.color) || customPalette.value[i] || palette[i] || palette[i % palette.length];
        return {
            ...ds,
            // In distributed mode, all values are converted to positive
            series: JSON.parse(JSON.stringify(ds.series)).map(v => {
                return FINAL_CONFIG.value.style.chart.bars.distributed ? Math.abs(v) : v
            }),
            // Store signs to manage display of neg values in distributed mode
            signedSeries: ds.series.map(v => v >= 0 ? 1 : -1),
            absoluteIndex: i,
            id: createUid(),
            color
        }
    });
});

const maxSeries = computed(() => {
    return Math.max(...unmutableDataset.value.filter(ds => !segregated.value.includes(ds.id)).map(ds => ds.series.length))
});

const slicer = ref({
    start: 0,
    end: Math.max(...props.dataset.map(ds => ds.series.length))
});

function refreshSlicer() {
    slicer.value = {
        start: 0,
        end: Math.max(...props.dataset.map(ds => ds.series.length))
    };
    slicerStep.value += 1;
}

const barSlot = computed(() => {
    let bs;
    if (FINAL_CONFIG.value.orientation === 'vertical') {
        bs = drawingArea.value.width / (slicer.value.end - slicer.value.start);
    } else {
        bs = drawingArea.value.height / (slicer.value.end - slicer.value.start);
    }
    return bs <= 0 ? 0 : bs;
});

const datasetTotals = computed(() => {
    return sumSeries(unmutableDataset.value.filter(ds => !segregated.value.includes(ds.id))).slice(slicer.value.start, slicer.value.end);
});

const displayTotals = computed(() => {
    return sumSeries(unmutableDataset.value.filter(ds => !segregated.value.includes(ds.id)).map(s => {
        return {
            ...s,
            series: s.series.map((dp,i) => {
                return s.signedSeries[i] === -1 ? (dp >= 0 ? -dp : dp) : dp
            })
        }
    })).slice(slicer.value.start, slicer.value.end);
})

const datasetSignedTotals = computed(() => {
    const src = unmutableDataset.value.filter(ds => !segregated.value.includes(ds.id))
    return { 
        positive: sumSeries(src.map(s => {
            return {
                ...s,
                series: s.series.slice(slicer.value.start, slicer.value.end).map(v => v >= 0 ? v : 0)
            }
        })),
        negative: sumSeries(src.map(s => {
            return {
                ...s,
                series: s.series.slice(slicer.value.start, slicer.value.end).map(v => v < 0 ? v : 0)
            }
        }))
    }
});

const yLabels = computed(() => {
    const MAX = (FINAL_CONFIG.value.style.chart.grid.scale.scaleMax !== null && !FINAL_CONFIG.value.style.chart.bars.distributed)  ? FINAL_CONFIG.value.style.chart.grid.scale.scaleMax : Math.max(...datasetSignedTotals.value.positive);
    const workingMin = Math.min(...datasetSignedTotals.value.negative);
    const MIN = (FINAL_CONFIG.value.style.chart.grid.scale.scaleMin !== null && !FINAL_CONFIG.value.style.chart.bars.distributed) ? FINAL_CONFIG.value.style.chart.grid.scale.scaleMin : [-Infinity, Infinity, NaN, undefined, null].includes(workingMin) ? 0 : workingMin;

    const scale = (!FINAL_CONFIG.value.style.chart.bars.distributed && (FINAL_CONFIG.value.style.chart.grid.scale.scaleMax !== null || FINAL_CONFIG.value.style.chart.grid.scale.scaleMin !== null)) ? calculateNiceScaleWithExactExtremes((MIN > 0 ? 0 : MIN), MAX < 0 ? 0 : MAX, FINAL_CONFIG.value.style.chart.grid.scale.ticks) : calculateNiceScale((MIN > 0 ? 0 : MIN), MAX < 0 ? 0 : MAX, FINAL_CONFIG.value.style.chart.grid.scale.ticks);
    return scale.ticks.map(t => {
        return {
            zero: drawingArea.value.bottom - (drawingArea.value.height * ((Math.abs(scale.min)) / (scale.max + Math.abs(scale.min)))),
            y: drawingArea.value.bottom - (drawingArea.value.height * ((t + Math.abs(scale.min)) / ((scale.max) + Math.abs(scale.min)))),
            x: drawingArea.value.left - 8,
            horizontal_zero: drawingArea.value.left  + (drawingArea.value.width * ((Math.abs(scale.min)) / (scale.max + Math.abs(scale.min)))),
            horizontal_x: drawingArea.value.left + (drawingArea.value.width * ((t + Math.abs(scale.min)) / ((scale.max) + Math.abs(scale.min)))),
            horizontal_y: drawingArea.value.bottom - 8, 
            value: t
        }
    });
});

const timeLabels = computed(() => {
    return FINAL_CONFIG.value.style.chart.grid.x.timeLabels.values
        .slice(slicer.value.start, slicer.value.end);
});

const formattedDataset = computed(() => {
    if (!isDataset.value) return [];

    let cumulativeY = Array(maxSeries.value).fill(0);
    let cumulativeX = Array(maxSeries.value).fill(0);
    let cumulativeNegY = Array(maxSeries.value).fill(0);
    let cumulativeNegX = Array(maxSeries.value).fill(0);
    
    const premax = Math.max(...datasetSignedTotals.value.positive) || 0;
    const workingMin = Math.min(...datasetSignedTotals.value.negative);
    const premin = [-Infinity, Infinity, NaN, undefined, null].includes(workingMin) ? 0 : workingMin;

    const scale = (!FINAL_CONFIG.value.style.chart.bars.distributed && (FINAL_CONFIG.value.style.chart.grid.scale.scaleMax !== null || FINAL_CONFIG.value.style.chart.grid.scale.scaleMin !== null)) ? calculateNiceScaleWithExactExtremes(FINAL_CONFIG.value.style.chart.grid.scale.scaleMin !== null ? FINAL_CONFIG.value.style.chart.grid.scale.scaleMin : (premin > 0 ? 0 : premin), FINAL_CONFIG.value.style.chart.grid.scale.scaleMax !== null ? FINAL_CONFIG.value.style.chart.grid.scale.scaleMax : premax < 0 ? 0 : premax, FINAL_CONFIG.value.style.chart.grid.scale.ticks) : calculateNiceScale(FINAL_CONFIG.value.style.chart.grid.scale.scaleMin !== null ? FINAL_CONFIG.value.style.chart.grid.scale.scaleMin : (premin > 0 ? 0 : premin), FINAL_CONFIG.value.style.chart.grid.scale.scaleMax !== null ? FINAL_CONFIG.value.style.chart.grid.scale.scaleMax : premax < 0 ? 0 : premax, FINAL_CONFIG.value.style.chart.grid.scale.ticks);
    const { min: MIN, max: MAX } = scale;
    
    const maxTotal = (MAX + (MIN >= 0 ? 0 : Math.abs(MIN))) || 1

    const totalHeight = drawingArea.value.height;
    const totalWidth = drawingArea.value.width;
    const ZERO_POSITION = yLabels.value[0] ? yLabels.value[0].zero : drawingArea.value.bottom;
    const HORIZONTAL_ZERO_POSITION = yLabels.value[0] ? yLabels.value[0].horizontal_zero : drawingArea.value.left;

    return unmutableDataset.value
        .filter(ds => !segregated.value.includes(ds.id))
        .map(ds => {
            const slicedSeries = ds.series.slice(slicer.value.start, slicer.value.end);
            const signedSliced = ds.signedSeries.slice(slicer.value.start, slicer.value.end);

            const x = slicedSeries.map((_dp, i) => {
                return drawingArea.value.left + (barSlot.value * i) + (barSlot.value * FINAL_CONFIG.value.style.chart.bars.gapRatio / 4);
            });

            const horizontal_y = slicedSeries.map((_dp, i) => {
                return drawingArea.value.top + (barSlot.value * i) + (barSlot.value * FINAL_CONFIG.value.style.chart.bars.gapRatio / 4);
            })

            const y = slicedSeries.map((dp, i) => {
                const proportion = FINAL_CONFIG.value.style.chart.bars.distributed
                    ? (dp || 0) / datasetTotals.value[i]
                    : (dp || 0) / maxTotal;

                let currentY, height;
                if (dp > 0) {
                    height = totalHeight * proportion; 
                    currentY = ZERO_POSITION - height - cumulativeY[i];
                    cumulativeY[i] += height;
                } else {
                    height = totalHeight * proportion;
                    currentY = ZERO_POSITION + cumulativeNegY[i]
                    cumulativeNegY[i] += Math.abs(height)
                }
                return currentY;
            });

            const horizontal_x = slicedSeries.map((dp, i) => {
                const proportion = FINAL_CONFIG.value.style.chart.bars.distributed
                    ? (dp || 0) / datasetTotals.value[i]
                    : (dp || 0) / maxTotal;

                let currentX, hw;
                if (dp > 0) {
                    hw = totalWidth * proportion; 
                    currentX = HORIZONTAL_ZERO_POSITION + cumulativeX[i];
                    cumulativeX[i] += hw;
                } else {
                    hw = totalWidth * proportion;
                    currentX = HORIZONTAL_ZERO_POSITION - Math.abs(hw) - cumulativeNegX[i]
                    cumulativeNegX[i] += Math.abs(hw)
                }
                return currentX;
            });

            const height = slicedSeries.map((dp, i) => {
                const proportion = FINAL_CONFIG.value.style.chart.bars.distributed
                    ? (dp || 0) / datasetTotals.value[i]
                    : (dp || 0) / maxTotal;

                    if (dp > 0) {
                        return totalHeight * proportion
                    } else {
                        return totalHeight * Math.abs(proportion)
                    }
            });

            const horizontal_width = slicedSeries.map((dp, i) => {
                const proportion = FINAL_CONFIG.value.style.chart.bars.distributed
                    ? (dp || 0) / datasetTotals.value[i]
                    : (dp || 0) / maxTotal;

                    if (dp > 0) {
                        return totalWidth * proportion
                    } else {
                        return totalWidth * Math.abs(proportion)
                    }
            });

            const absoluteTotal = slicedSeries.map(v => Math.abs(v)).reduce((a, b) => a + b, 0);

            return {
                ...ds,
                proportions: slicedSeries.map((dp, i) => {
                    if (FINAL_CONFIG.value.style.chart.bars.distributed) {
                        return (dp || 0) / datasetTotals.value[i];
                    } else {
                        return (dp || 0) / absoluteTotal;
                    }
                }),
                series: slicedSeries,
                signedSeries: signedSliced,
                x,
                y,
                height,
                horizontal_width,
                horizontal_y,
                horizontal_x
            };
        });
});

const totalLabels = computed(() => {
    return displayTotals.value.map((t, i) => {
        return {
            value: t,
            sign: t >= 0 ? 1 : -1
        }
    });
});


function barDataLabel(val, datapoint, index, dpIndex, signed) {

    const appliedValue = signed === - 1 ? (val >= 0 ? -val : val) : val
    return applyDataLabel(
        FINAL_CONFIG.value.style.chart.bars.dataLabels.formatter,
        appliedValue,
        dataLabel({
            p: FINAL_CONFIG.value.style.chart.bars.dataLabels.prefix,
            v: appliedValue,
            s: FINAL_CONFIG.value.style.chart.bars.dataLabels.suffix,
            r: FINAL_CONFIG.value.style.chart.bars.dataLabels.rounding,
        }),
        { datapoint, seriesIndex: index, datapointIndex: dpIndex }
    )
}

function barDataLabelPercentage(val, datapoint, index, dpIndex) {
    return applyDataLabel(
        FINAL_CONFIG.value.style.chart.bars.dataLabels.formatter,
        val,
        dataLabel({
            v: val,
            s: '%',
            r: FINAL_CONFIG.value.style.chart.bars.dataLabels.rounding,
        }),
        { datapoint, seriesIndex: index, datapointIndex: dpIndex }
    )
}

function selectDatapoint(index) {
    const datapoint = JSON.parse(JSON.stringify(formattedDataset.value)).map(fd => {
        return {
            name: fd.name,
            value: fd.series[index] === 0 ? 0 : fd.series[index] || null,
            proportion: fd.proportions[index] || null,
            color: fd.color,
            id: fd.id
        }
    });

    emit('selectDatapoint', { datapoint, period: timeLabels.value[index] });
}

function useTooltip(seriesIndex) {
    trapIndex.value = seriesIndex;
    isTooltip.value = true;

    const customFormat = FINAL_CONFIG.value.style.chart.tooltip.customFormat;

    const datapoint = JSON.parse(JSON.stringify(formattedDataset.value)).map(fd => {
        return {
            name: fd.name,
            value: fd.series[seriesIndex] === 0 ? 0 : (fd.signedSeries[seriesIndex] === -1 ? (fd.series[seriesIndex] >= 0 ? -fd.series[seriesIndex] : fd.series[seriesIndex]) : fd.series[seriesIndex]) || null,
            proportion: fd.proportions[seriesIndex] || null,
            color: fd.color,
            id: fd.id
        }
    });

    const sum = datapoint.map(d => Math.abs(d.value)).reduce((a, b) => a + b, 0);

    if (isFunction(customFormat) && functionReturnsString(() => customFormat({
        seriesIndex,
        datapoint,
        series: formattedDataset.value,
        config: FINAL_CONFIG.value
    }))) {
        tooltipContent.value = customFormat({
            seriesIndex,
            datapoint,
            series: formattedDataset.value,
            config: FINAL_CONFIG.value
        });
    } else {
        const { 
            showValue, 
            showPercentage, 
            borderColor,
            roundingValue,
            roundingPercentage 
        } = FINAL_CONFIG.value.style.chart.tooltip;

        let html = "";

        if (timeLabels.value[seriesIndex]) {
            html += `<div style="width:100%;text-align:center;border-bottom:1px solid ${borderColor};padding-bottom:6px;margin-bottom:3px;">${timeLabels.value[seriesIndex]}</div>`;
        }

        const parenthesis = [
            showValue && showPercentage ? '(' : '',
            showValue && showPercentage ? ')' : '',
        ];

        datapoint.reverse().forEach(ds => {
            html += `
                <div style="display:flex;flex-direction:row;align-items:center;gap:4px">
                    <svg viewBox="0 0 12 12" height="14" width="14"><rect rx="1" x="0" y="0" height="12" width="12" stroke="none" fill="${FINAL_CONFIG.value.style.chart.bars.gradient.show ? `url(#gradient_${ds.id})` : ds.color}"/></svg>
                    ${ds.name}${showValue || showPercentage ? ':' : ''} ${showValue ? dataLabel({
                        p: FINAL_CONFIG.value.style.chart.bars.dataLabels.prefix,
                        v: ds.value,
                        s: FINAL_CONFIG.value.style.chart.bars.dataLabels.suffix,
                        r: roundingValue,
                    }) : ''} ${parenthesis[0]}${showPercentage ? dataLabel({
                        v: isNaN(ds.value / sum) ? 0 : Math.abs(ds.value) / sum * 100, // Negs are absed to show relative proportion to absolute total. It's opinionated.
                        s: '%',
                        r: roundingPercentage,
                    }) : ''}${parenthesis[1]}
                </div>
            `
        });

        tooltipContent.value = `<div>${html}</div>`;
    }
}

function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
}

function toggleTable() {
    mutableConfig.value.showTable = !mutableConfig.value.showTable;
}

function toggleLabels() {
    mutableConfig.value.dataLabels.show = !mutableConfig.value.dataLabels.show;
}

function toggleTooltip() {
    mutableConfig.value.showTooltip = !mutableConfig.value.showTooltip;
}

function getData() {
    return formattedDataset.value
}

const tableCsv = computed(() => {
    if(formattedDataset.value.length === 0) return { head: [], body: [], config: {}, columnNames: []};

    const head = formattedDataset.value.map(({name, color}) => {
        return {
            label: name,
            color
        }
    });
    const body = [];
    for (let i = slicer.value.start; i < slicer.value.end; i += 1) {
        const row = [FINAL_CONFIG.value.style.chart.grid.x.timeLabels.values[i] || i + 1];
        unmutableDataset.value.forEach(s => {
            row.push(Number((s.series[i] || 0).toFixed(FINAL_CONFIG.value.table.td.roundingValue)));
        });
        body.push(row);
    }
    return { head, body };
})

function generateCsv() {
    const title = [[FINAL_CONFIG.value.style.chart.title.text], [FINAL_CONFIG.value.style.chart.title.subtitle.text], [""]];
    const head = ["",...tableCsv.value.head.map(h => h.label)];
    const body = tableCsv.value.body;
    const table = title.concat([head]).concat(body);
    const csvContent = createCsvContent(table);
    downloadCsv({ csvContent, title: FINAL_CONFIG.value.style.chart.title.text || 'vue-ui-stackbar'});
}

const dataTable = computed(() => {
    const head = [''].concat(formattedDataset.value.map(ds => ds.name)).concat(` <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18 16v2a1 1 0 0 1 -1 1h-11l6 -7l-6 -7h11a1 1 0 0 1 1 1v2" /></svg>`);

    let body = [];

    for (let i = 0; i < maxSeries.value; i += 1) {
        const sum = formattedDataset.value.map(ds => {
            return ds.series[i] ?? 0
        }).reduce((a,b ) => a + b, 0);

        body.push([FINAL_CONFIG.value.style.chart.grid.x.timeLabels.values.slice(slicer.value.start, slicer.value.end)[i] ?? i+1].concat(formattedDataset.value.map(ds => (ds.series[i] ?? 0).toFixed(FINAL_CONFIG.value.table.td.roundingValue))).concat((sum ?? 0).toFixed(FINAL_CONFIG.value.table.td.roundingValue)));
    }

    const config = {
        th: {
            backgroundColor: FINAL_CONFIG.value.table.th.backgroundColor,
            color: FINAL_CONFIG.value.table.th.color,
            outline: FINAL_CONFIG.value.table.th.outline
        },
        td: {
            backgroundColor: FINAL_CONFIG.value.table.td.backgroundColor,
            color: FINAL_CONFIG.value.table.td.color,
            outline: FINAL_CONFIG.value.table.td.outline
        },
        breakpoint: FINAL_CONFIG.value.table.responsiveBreakpoint
    }

    const colNames = [FINAL_CONFIG.value.table.columnNames.period].concat(formattedDataset.value.map(ds => ds.name)).concat(FINAL_CONFIG.value.table.columnNames.total);

    return { head, body: body.slice(0, slicer.value.end - slicer.value.start), config, colNames }
});

function segregate(index, item) {
    emit('selectLegend', formattedDataset.value.find(el => el.absoluteIndex === index));
    if (segregated.value.includes(item.id)) {
        segregated.value = segregated.value.filter(el => el !== item.id);
    } else {
        if ( segregated.value.length === unmutableDataset.value.length - 1) return; 
        segregated.value.push(item.id);
    }
}

const legendSet = computed(() => {
    return unmutableDataset.value.map((ds, i) => {
        return {
            ...ds,
            shape: 'square',
        }
    }).map((ds) => {
        return {
            ...ds,
            opacity: segregated.value.includes(ds.id) ? 0.5 : 1,
            segregate: () => segregate(ds.absoluteIndex, ds),
            isSegregated: segregated.value.includes(ds.id)
        }
    });
});

const legendConfig = computed(() => {
    return {
        cy: 'stackbar-legend',
        backgroundColor: FINAL_CONFIG.value.style.chart.legend.backgroundColor,
        color: FINAL_CONFIG.value.style.chart.legend.color,
        fontSize: FINAL_CONFIG.value.style.chart.legend.fontSize,
        paddingBottom: 12,
        fontWeight: FINAL_CONFIG.value.style.chart.legend.bold ? 'bold' : ''
    }
});

defineExpose({
    getData,
    generatePdf,
    generateCsv,
    generateImage,
    toggleTable,
    toggleLabels,
    toggleTooltip
})

</script>

<template>
    <div 
        :id="`stackbar_${uid}`"
        ref="stackbarChart"
        :class="{'vue-ui-stackbar': true, 'vue-data-ui-wrapper-fullscreen' : isFullscreen }" 
        :style="`background:${FINAL_CONFIG.style.chart.backgroundColor};color:${FINAL_CONFIG.style.chart.color};font-family:${FINAL_CONFIG.style.fontFamily}; position: relative; ${FINAL_CONFIG.responsive ? 'height: 100%' : ''}`"
    >
        <slot name="userConfig"/>

        <div ref="chartTitle" v-if="FINAL_CONFIG.style.chart.title.text" :style="`width:100%;background:${FINAL_CONFIG.style.chart.backgroundColor};padding-bottom:24px`">
            <Title
                :config="{
                    title: {
                        cy: 'stackbar-title',
                        ...FINAL_CONFIG.style.chart.title,
                    },
                    subtitle: {
                        cy: 'stackbar-subtitle',
                        ...FINAL_CONFIG.style.chart.title.subtitle
                    }
                }"
            />
        </div>

        <UserOptions
            ref="details"
            :key="`user_option_${step}`"
            v-if="FINAL_CONFIG.userOptions.show && isDataset"
            :backgroundColor="FINAL_CONFIG.style.chart.backgroundColor"
            :color="FINAL_CONFIG.style.chart.color"
            :isPrinting="isPrinting"
            :isImaging="isImaging"
            :uid="uid"
            :hasTooltip="FINAL_CONFIG.style.chart.tooltip.show && FINAL_CONFIG.userOptions.buttons.tooltip"
            :hasPdf="FINAL_CONFIG.userOptions.buttons.pdf"
            :hasImg="FINAL_CONFIG.userOptions.buttons.img"
            :hasXls="FINAL_CONFIG.userOptions.buttons.csv"
            :hasTable="FINAL_CONFIG.userOptions.buttons.table"
            :hasLabel="FINAL_CONFIG.userOptions.buttons.labels"
            :hasFullscreen="FINAL_CONFIG.userOptions.buttons.fullscreen"
            :isFullscreen="isFullscreen"
            :chartElement="stackbarChart"
            :isTooltip="mutableConfig.showTooltip"
            :titles="{...FINAL_CONFIG.userOptions.buttonTitles }"
            @toggleFullscreen="toggleFullscreen"
            @generatePdf="generatePdf"
            @generateCsv="generateCsv"
            @generateImage="generateImage"
            @toggleTable="toggleTable"
            @toggleLabels="toggleLabels"
            @toggleTooltip="toggleTooltip"
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
            <template #optionLabels v-if="$slots.optionLabels">
                <slot name="optionLabels" />
            </template>
            <template v-if="$slots.optionFullscreen" template #optionFullscreen="{ toggleFullscreen, isFullscreen }">
                <slot name="optionFullscreen" v-bind="{ toggleFullscreen, isFullscreen }"/>
            </template>
        </UserOptions>

        <svg
            v-if="isDataset"
            :xmlns="XMLNS"
            :viewBox="`0 0 ${drawingArea.chartWidth <= 0 ? 10 : drawingArea.chartWidth} ${drawingArea.chartHeight <= 0 ? 10 : drawingArea.chartHeight}`"
            :style="`max-width:100%;overflow:visible;background:${FINAL_CONFIG.style.chart.backgroundColor};color:${FINAL_CONFIG.style.chart.color}`"
        >
            <!-- GRADIENT DEFS -->
            <defs v-if="FINAL_CONFIG.style.chart.bars.gradient.show">
                <linearGradient v-for="(ds, i) in formattedDataset" :id="`gradient_${ds.id}`" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" :stop-color="ds.color"/>
                    <stop offset="61.8%" :stop-color="lightenHexColor(ds.color, FINAL_CONFIG.style.chart.bars.gradient.intensity / 100)"/>
                    <stop offset="100%" :stop-color="ds.color"/>
                </linearGradient>
            </defs>

            <!-- HORIZONTAL LINES (vertical mode) -->
            <template v-if="FINAL_CONFIG.style.chart.grid.x.showHorizontalLines && FINAL_CONFIG.orientation === 'vertical'">
                <line
                    v-for="(yLabel, i) in yLabels"
                    :x1="drawingArea.left"
                    :x2="drawingArea.right"
                    :y1="yLabel.y"
                    :y2="yLabel.y"
                    :stroke="FINAL_CONFIG.style.chart.grid.x.axisColor"
                    :stroke-width="1"
                    stroke-linecap="round"
                />
            </template>

            <!-- HORIZONTAL LINES (horizontal mode) -->
            <template v-if="FINAL_CONFIG.style.chart.grid.x.showHorizontalLines && FINAL_CONFIG.orientation === 'horizontal'">
                <line
                    v-for="(_, i) in (slicer.end - slicer.start + 1)"
                    :x1="drawingArea.left"
                    :x2="drawingArea.right"
                    :y1="drawingArea.top + (barSlot * i)"
                    :y2="drawingArea.top + (barSlot * i)"
                    :stroke="FINAL_CONFIG.style.chart.grid.y.axisColor"
                    :stroke-width="1"
                    stroke-linecap="round"
                />
            </template>

            <!-- VERTICAL LINES (vertical mode) -->
            <template v-if="FINAL_CONFIG.style.chart.grid.y.showVerticalLines && FINAL_CONFIG.orientation === 'vertical'">
                <line
                    v-for="(_, i) in (slicer.end - slicer.start + 1)"
                    :x1="drawingArea.left + (barSlot * i)"
                    :x2="drawingArea.left + (barSlot * i)"
                    :y1="drawingArea.top"
                    :y2="drawingArea.bottom"
                    :stroke="FINAL_CONFIG.style.chart.grid.y.axisColor"
                    :stroke-width="1"
                    stroke-linecap="round"
                />
            </template>

            <!-- VERTICAL LINES (horizontal mode) -->
            <template v-if="FINAL_CONFIG.style.chart.grid.x.showHorizontalLines && FINAL_CONFIG.orientation === 'horizontal'">
                <line
                    v-for="(yLabel, i) in yLabels"
                    :x1="yLabel.horizontal_x"
                    :x2="yLabel.horizontal_x"
                    :y1="drawingArea.top"
                    :y2="drawingArea.bottom"
                    :stroke="FINAL_CONFIG.style.chart.grid.x.axisColor"
                    :stroke-width="1"
                    stroke-linecap="round"
                />
            </template>

            <g v-for="(dp, i) in formattedDataset">
                <!-- STACKED BARS (vertical mode) -->
                <template v-if="FINAL_CONFIG.orientation === 'vertical'">
                    <rect 
                        v-for="(rect, j) in dp.x"
                        :x="rect"
                        :y="dp.y[j] < 0 ? 0 : dp.y[j]"
                        :height="dp.height[j] < 0 ? 0.0001 : dp.height[j]"
                        :rx="FINAL_CONFIG.style.chart.bars.borderRadius > dp.height[j] / 2 ? (dp.height[j] < 0 ? 0 : dp.height[j]) / 2 : FINAL_CONFIG.style.chart.bars.borderRadius "
                        :width="barSlot * (1 - FINAL_CONFIG.style.chart.bars.gapRatio / 2)"
                        :fill="FINAL_CONFIG.style.chart.bars.gradient.show ? `url(#gradient_${dp.id})` : dp.color"
                        :stroke="FINAL_CONFIG.style.chart.backgroundColor"
                        :stroke-width="FINAL_CONFIG.style.chart.bars.strokeWidth"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        :class="{ 'vue-data-ui-bar-animated': FINAL_CONFIG.useCssAnimation, 'vue-data-ui-bar-transition': isLoaded }"
                    />           
                </template>

                <!-- STACKED BARS (horizontal mode) -->
                <template v-else>
                    <rect 
                        v-for="(rect, j) in dp.horizontal_x"
                        :x="rect"
                        :y="dp.horizontal_y[j] < 0 ? 0 : dp.horizontal_y[j]"
                        :width="dp.horizontal_width[j] < 0 ? 0.0001 : dp.horizontal_width[j]"
                        :rx="FINAL_CONFIG.style.chart.bars.borderRadius > dp.height[j] / 2 ? (dp.height[j] < 0 ? 0 : dp.height[j]) / 2 : FINAL_CONFIG.style.chart.bars.borderRadius "
                        :height="barSlot * (1 - FINAL_CONFIG.style.chart.bars.gapRatio / 2)"
                        :fill="FINAL_CONFIG.style.chart.bars.gradient.show ? `url(#gradient_${dp.id})` : dp.color"
                        :stroke="FINAL_CONFIG.style.chart.backgroundColor"
                        :stroke-width="FINAL_CONFIG.style.chart.bars.strokeWidth"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        :class="{ 'vue-data-ui-bar-animated': FINAL_CONFIG.useCssAnimation, 'vue-data-ui-bar-transition': isLoaded }"
                    />    
                </template>
            </g>

            <!-- X AXIS -->
            <line
                v-if="FINAL_CONFIG.style.chart.grid.x.showAxis"
                :x1="drawingArea.left"
                :x2="drawingArea.right"
                :y1="drawingArea.bottom"
                :y2="drawingArea.bottom"
                :stroke="FINAL_CONFIG.style.chart.grid.x.axisColor"
                :stroke-width="FINAL_CONFIG.style.chart.grid.x.axisThickness"
                stroke-linecap="round"
                stroke-linejoin="round"
            />

            <!-- Y AXIS -->
            <line
                v-if="FINAL_CONFIG.style.chart.grid.y.showAxis && !FINAL_CONFIG.style.chart.bars.distributed"
                :x1="drawingArea.left"
                :x2="drawingArea.left"
                :y1="drawingArea.top"
                :y2="drawingArea.bottom"
                :stroke="FINAL_CONFIG.style.chart.grid.y.axisColor"
                :stroke-width="FINAL_CONFIG.style.chart.grid.y.axisThickness"
                stroke-linecap="round"
                stroke-linejoin="round"
            />

            <!-- X AXIS LABEL -->
            <text 
                v-if="FINAL_CONFIG.style.chart.grid.x.axisName.show && FINAL_CONFIG.style.chart.grid.x.axisName.text"
                :x="drawingArea.left + (drawingArea.width / 2)"
                :y="drawingArea.chartHeight + FINAL_CONFIG.style.chart.grid.x.axisName.offsetY"
                :font-size="FINAL_CONFIG.style.chart.grid.x.axisName.fontSize"
                :fill="FINAL_CONFIG.style.chart.grid.x.axisName.color"
                :font-weight="FINAL_CONFIG.style.chart.grid.x.axisName.bold ? 'bold': 'normal'"
                text-anchor="middle"
            >
                {{ FINAL_CONFIG.style.chart.grid.x.axisName.text }}
            </text>

            <!-- Y AXIS LABEL -->
            <text 
                v-if="FINAL_CONFIG.style.chart.grid.y.axisName.show && FINAL_CONFIG.style.chart.grid.y.axisName.text"
                :transform="`translate(${FINAL_CONFIG.style.chart.grid.y.axisName.fontSize + FINAL_CONFIG.style.chart.grid.y.axisName.offsetX}, ${drawingArea.top + (drawingArea.height / 2)}) rotate(-90)`"
                :font-size="FINAL_CONFIG.style.chart.grid.y.axisName.fontSize"
                :fill="FINAL_CONFIG.style.chart.grid.y.axisName.color"
                :font-weight="FINAL_CONFIG.style.chart.grid.y.axisName.bold ? 'bold': 'normal'"
                text-anchor="middle"
            >
                {{ FINAL_CONFIG.style.chart.grid.y.axisName.text }}
            </text>

            <!-- RECT DATA LABELS (vertical mode) -->
            <template v-if="mutableConfig.dataLabels.show && FINAL_CONFIG.orientation === 'vertical'">
                <g v-for="(dp, i) in formattedDataset">            
                    <!-- RECT LABELS -->
                    <text 
                        v-for="(rect, j) in dp.x"
                        :x="rect + (barSlot * (1 - FINAL_CONFIG.style.chart.bars.gapRatio / 2) / 2)"
                        :y="dp.y[j] + dp.height[j] / 2 + FINAL_CONFIG.style.chart.bars.dataLabels.fontSize / 3"
                        :font-size="FINAL_CONFIG.style.chart.bars.dataLabels.fontSize"
                        :fill="FINAL_CONFIG.style.chart.bars.dataLabels.adaptColorToBackground ? adaptColorToBackground(dp.color) : FINAL_CONFIG.style.chart.bars.dataLabels.color"
                        :font-weight="FINAL_CONFIG.style.chart.bars.dataLabels.bold ? 'bold' : 'normal'"
                        text-anchor="middle"
                    >
                        {{ FINAL_CONFIG.style.chart.bars.showDistributedPercentage && FINAL_CONFIG.style.chart.bars.distributed ? 
                            barDataLabelPercentage(dp.proportions[j] * 100, dp, i, j) : 
                            barDataLabel(dp.series[j], dp, i, j, dp.signedSeries[j]) }}
                    </text>
                </g>

                <!-- RECT TOTAL LABELS -->
                <g v-if="FINAL_CONFIG.style.chart.bars.totalValues.show && formattedDataset.length > 1">
                    <text
                        v-for="(total, i) in totalLabels"
                        :x="drawingArea.left + (barSlot * i) + barSlot / 2"
                        :y="drawingArea.top - FINAL_CONFIG.style.chart.bars.totalValues.fontSize / 3"
                        text-anchor="middle"
                        :font-size="FINAL_CONFIG.style.chart.bars.totalValues.fontSize"
                        :font-weight="FINAL_CONFIG.style.chart.bars.totalValues.bold ? 'bold' : 'normal'"
                        :fill="FINAL_CONFIG.style.chart.bars.totalValues.color"
                    >
                        {{ barDataLabel(total.value, total, i, total.sign) }}
                    </text>
                </g>
            </template>

            <!-- RECT DATA LABELS (horizontal mode) -->
            <template v-if="mutableConfig.dataLabels.show && FINAL_CONFIG.orientation === 'horizontal'">
                <g v-for="(dp, i) in formattedDataset">            
                    <!-- RECT LABELS -->
                    <text 
                        v-for="(rect, j) in dp.horizontal_x"
                        :x="rect + ((dp.horizontal_width[j] < 0 ? 0.0001 : dp.horizontal_width[j]) / 2)"
                        :y="dp.horizontal_y[j] + (barSlot * (1 - FINAL_CONFIG.style.chart.bars.gapRatio / 2) / 2) + (FINAL_CONFIG.style.chart.bars.dataLabels.fontSize /3)"
                        :font-size="FINAL_CONFIG.style.chart.bars.dataLabels.fontSize"
                        :fill="FINAL_CONFIG.style.chart.bars.dataLabels.adaptColorToBackground ? adaptColorToBackground(dp.color) : FINAL_CONFIG.style.chart.bars.dataLabels.color"
                        :font-weight="FINAL_CONFIG.style.chart.bars.dataLabels.bold ? 'bold' : 'normal'"
                        text-anchor="middle"
                    >
                        {{ FINAL_CONFIG.style.chart.bars.showDistributedPercentage && FINAL_CONFIG.style.chart.bars.distributed ? 
                            barDataLabelPercentage(dp.proportions[j] * 100, dp, i, j) : 
                            barDataLabel(dp.series[j], dp, i, j, dp.signedSeries[j]) }}
                    </text>
                </g>
                <!-- RECT TOTAL LABELS -->
                <g v-if="FINAL_CONFIG.style.chart.bars.totalValues.show && formattedDataset.length > 1">
                    <text
                        v-for="(total, i) in totalLabels"
                        :x="drawingArea.right + FINAL_CONFIG.style.chart.bars.totalValues.fontSize / 3"
                        :y="drawingArea.top + (barSlot * i) + barSlot / 2"
                        text-anchor="start"
                        :font-size="FINAL_CONFIG.style.chart.bars.totalValues.fontSize"
                        :font-weight="FINAL_CONFIG.style.chart.bars.totalValues.bold ? 'bold' : 'normal'"
                        :fill="FINAL_CONFIG.style.chart.bars.totalValues.color"
                    >
                        {{ barDataLabel(total.value, total, i, total.sign) }}
                    </text>
                </g>
            </template>

            <!-- SCALE LABELS (vertical mode) -->
            <template v-if="FINAL_CONFIG.style.chart.grid.y.axisLabels.show && !FINAL_CONFIG.style.chart.bars.distributed && FINAL_CONFIG.orientation === 'vertical'">
                <line
                    v-for="(yLabel, i) in yLabels"
                    :x1="drawingArea.left"
                    :x2="drawingArea.left - 6"
                    :y1="yLabel.y"
                    :y2="yLabel.y"
                    :stroke="FINAL_CONFIG.style.chart.grid.x.axisColor"
                    :stroke-width="1"
                />
                <text
                    v-for="(yLabel, i) in yLabels"
                    :x="yLabel.x"
                    :y="yLabel.y + FINAL_CONFIG.style.chart.grid.y.axisLabels.fontSize / 3"
                    :font-size="FINAL_CONFIG.style.chart.grid.y.axisLabels.fontSize"
                    :font-weight="FINAL_CONFIG.style.chart.grid.y.axisLabels.bold ? 'bold' : 'normal'"
                    :fill="FINAL_CONFIG.style.chart.grid.y.axisLabels.color"
                    text-anchor="end"
                >
                    {{ dataLabel({
                        p: FINAL_CONFIG.style.chart.bars.dataLabels.prefix,
                        v: yLabel.value,
                        s: FINAL_CONFIG.style.chart.bars.dataLabels.suffix,
                        r: FINAL_CONFIG.style.chart.grid.y.axisLabels.rounding,
                    }) }}
                </text>
            </template>

            <!-- SCALE LABELS (horizontal mode) -->
            <template v-if="FINAL_CONFIG.style.chart.grid.y.axisLabels.show && !FINAL_CONFIG.style.chart.bars.distributed && FINAL_CONFIG.orientation === 'horizontal'">
                <line
                    v-for="(yLabel, i) in yLabels"
                    :x1="yLabel.horizontal_x"
                    :x2="yLabel.horizontal_x"
                    :y1="drawingArea.bottom"
                    :y2="drawingArea.bottom + 6"
                    :stroke="FINAL_CONFIG.style.chart.grid.x.axisColor"
                    :stroke-width="1"
                    stroke-linecap="round"
                />
                <text
                    v-for="(yLabel, i) in yLabels"
                    :font-size="FINAL_CONFIG.style.chart.grid.x.timeLabels.fontSize"
                    :font-weight="FINAL_CONFIG.style.chart.grid.y.axisLabels.bold ? 'bold' : 'normal'"
                    :fill="FINAL_CONFIG.style.chart.grid.y.axisLabels.color"
                    :text-anchor="FINAL_CONFIG.style.chart.grid.x.timeLabels.rotation > 0 ? 'start' : FINAL_CONFIG.style.chart.grid.x.timeLabels.rotation < 0 ? 'end' : 'middle'"
                    :transform="`translate(${yLabel.horizontal_x}, ${drawingArea.bottom + FINAL_CONFIG.style.chart.grid.x.timeLabels.fontSize * 1.3 + FINAL_CONFIG.style.chart.grid.x.timeLabels.offsetY}), rotate(${FINAL_CONFIG.style.chart.grid.x.timeLabels.rotation})`"
                >
                    {{ dataLabel({
                        p: FINAL_CONFIG.style.chart.bars.dataLabels.prefix,
                        v: yLabel.value,
                        s: FINAL_CONFIG.style.chart.bars.dataLabels.suffix,
                        r: FINAL_CONFIG.style.chart.grid.y.axisLabels.rounding,
                    }) }}
                </text>
            </template>

            <!-- TIME LABELS VERTICAL-->
            <template v-if="FINAL_CONFIG.style.chart.grid.x.timeLabels.show && FINAL_CONFIG.orientation === 'vertical'">
                <text
                    v-for="(timeLabel, i) in timeLabels"
                    :text-anchor="FINAL_CONFIG.style.chart.grid.x.timeLabels.rotation > 0 ? 'start' : FINAL_CONFIG.style.chart.grid.x.timeLabels.rotation < 0 ? 'end' : 'middle'"
                    :font-size="FINAL_CONFIG.style.chart.grid.x.timeLabels.fontSize"
                    :font-weight="FINAL_CONFIG.style.chart.grid.x.timeLabels.bold ? 'bold': 'normal'"
                    :fill="FINAL_CONFIG.style.chart.grid.x.timeLabels.color"
                    :transform="`translate(${drawingArea.left + (barSlot * i) + barSlot / 2}, ${drawingArea.bottom + FINAL_CONFIG.style.chart.grid.x.timeLabels.fontSize * 1.3 + FINAL_CONFIG.style.chart.grid.x.timeLabels.offsetY}), rotate(${FINAL_CONFIG.style.chart.grid.x.timeLabels.rotation})`"
                >
                    {{ timeLabel }}
                </text>
            </template>

            <!-- TIME LABELS HORIZONTAL -->
            <template v-if="FINAL_CONFIG.style.chart.grid.x.timeLabels.show && FINAL_CONFIG.orientation === 'horizontal'">
                <text
                    v-for="(timeLabel, i) in timeLabels"
                    text-anchor="end"
                    :font-size="FINAL_CONFIG.style.chart.grid.y.axisLabels.fontSize"
                    :font-weight="FINAL_CONFIG.style.chart.grid.y.axisLabels.bold ? 'bold' : 'normal'"
                    :fill="FINAL_CONFIG.style.chart.grid.y.axisLabels.color"
                    :x="drawingArea.left - 8"
                    :y="drawingArea.top + (barSlot * i ) + (barSlot / 2) + FINAL_CONFIG.style.chart.grid.y.axisLabels.fontSize / 3"
                >
                    {{ timeLabel }}
                </text>
            </template>

            <!-- TOOLTIP TRAPS (vertical mode) -->
            <template v-if="mutableConfig.showTooltip && FINAL_CONFIG.orientation === 'vertical'">            
                <rect
                    v-for="(_, i) in (slicer.end - slicer.start)"
                    :x="drawingArea.left + (i * barSlot)"
                    :y="drawingArea.top"
                    :width="barSlot"
                    :height="drawingArea.height < 0 ? 0 : drawingArea.height"
                    @click="selectDatapoint(i)"
                    @mouseenter="useTooltip(i)"
                    @mouseleave="trapIndex = null; isTooltip = false"
                    :fill="i === trapIndex ? FINAL_CONFIG.style.chart.highlighter.color + opacity[FINAL_CONFIG.style.chart.highlighter.opacity] : 'transparent'"
                />
            </template>

            <!-- TOOLTIP TRAPS (vertical mode) -->
            <template v-if="mutableConfig.showTooltip && FINAL_CONFIG.orientation === 'horizontal'">            
                <rect
                    v-for="(_, i) in (slicer.end - slicer.start)"
                    :x="drawingArea.left"
                    :y="drawingArea.top + (i * barSlot)"
                    :width="drawingArea.width < 0 ? 0 : drawingArea.width"
                    :height="barSlot"
                    @click="selectDatapoint(i)"
                    @mouseenter="useTooltip(i)"
                    @mouseleave="trapIndex = null; isTooltip = false"
                    :fill="i === trapIndex ? FINAL_CONFIG.style.chart.highlighter.color + opacity[FINAL_CONFIG.style.chart.highlighter.opacity] : 'transparent'"
                />
            </template>

            <slot name="svg" v-bind="{ ...drawingArea }"/>
        </svg>

        <div v-if="$slots.watermark" class="vue-data-ui-watermark">
            <slot name="watermark" v-bind="{ isPrinting: isPrinting || isImaging }"/>
        </div>

        <Skeleton
            v-if="!isDataset"
            :config="{
                type: 'bar',
                style: {
                    backgroundColor: FINAL_CONFIG.style.chart.backgroundColor,
                    bar: {
                        axis: {
                            color: '#CCCCCC'
                        },
                        color: '#CCCCCC'
                    }
                }
            }"
        />

        <div ref="chartSlicer" :style="`width:100%;background:${FINAL_CONFIG.style.chart.backgroundColor}`" data-html2canvas-ignore>    
            <Slicer 
                v-if="FINAL_CONFIG.style.chart.zoom.show && maxSeries > 1"
                :key="`slicer_${slicerStep}`"
                :background="FINAL_CONFIG.style.chart.zoom.color"
                :borderColor="FINAL_CONFIG.style.chart.backgroundColor"
                :fontSize="FINAL_CONFIG.style.chart.zoom.fontSize"
                :useResetSlot="FINAL_CONFIG.style.chart.zoom.useResetSlot"
                :labelLeft="FINAL_CONFIG.style.chart.grid.x.timeLabels.values[slicer.start] ? FINAL_CONFIG.style.chart.grid.x.timeLabels.values[slicer.start] : ''"
                :labelRight="FINAL_CONFIG.style.chart.grid.x.timeLabels.values[slicer.end-1] ? FINAL_CONFIG.style.chart.grid.x.timeLabels.values[slicer.end-1] : ''"
                :textColor="FINAL_CONFIG.style.chart.color"
                :inputColor="FINAL_CONFIG.style.chart.zoom.color"
                :selectColor="FINAL_CONFIG.style.chart.zoom.highlightColor"
                :max="Math.max(...dataset.map(ds => ds.series.length))"
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
        </div>

        <Tooltip
            :show="mutableConfig.showTooltip && isTooltip"
            :backgroundColor="FINAL_CONFIG.style.chart.tooltip.backgroundColor"
            :color="FINAL_CONFIG.style.chart.tooltip.color"
            :fontSize="FINAL_CONFIG.style.chart.tooltip.fontSize"
            :borderRadius="FINAL_CONFIG.style.chart.tooltip.borderRadius"
            :borderColor="FINAL_CONFIG.style.chart.tooltip.borderColor"
            :borderWidth="FINAL_CONFIG.style.chart.tooltip.borderWidth"
            :backgroundOpacity="FINAL_CONFIG.style.chart.tooltip.backgroundOpacity"
            :position="FINAL_CONFIG.style.chart.tooltip.position"
            :offsetY="FINAL_CONFIG.style.chart.tooltip.offsetY"
            :parent="stackbarChart"
            :content="tooltipContent"
            :isCustom="isFunction(FINAL_CONFIG.style.chart.tooltip.customFormat)"
        >
            <template #tooltip-before>
                <slot name="tooltip-before" v-bind="{...dataTooltipSlot}"></slot>
            </template>
            <template #tooltip-after>
                <slot name="tooltip-after" v-bind="{...dataTooltipSlot}"></slot>
            </template>
        </Tooltip>

        <div ref="chartLegend">
            <Legend v-if="FINAL_CONFIG.style.chart.legend.show && isDataset" :legendSet="legendSet" :config="legendConfig"
                @clickMarker="({ legend }) => legend.segregate()">
                <template #item="{ legend }">
                    <div @click="legend.segregate()" :style="`opacity:${segregated.includes(legend.id) ? 0.5 : 1}`">
                        {{ legend.name }}
                    </div>
                </template>
            </Legend>
    
            <slot v-else name="legend" v-bind:legend="legendSet" />
        </div>


        <Accordion v-if="slicer.end - slicer.start < 200" hideDetails :config="{
            open: mutableConfig.showTable,
            maxHeight: 10000,
            body: {
                backgroundColor: FINAL_CONFIG.style.chart.backgroundColor,
                color: FINAL_CONFIG.style.chart.color
            },
            head: {
                backgroundColor: FINAL_CONFIG.style.chart.backgroundColor,
                color: FINAL_CONFIG.style.chart.color
            }
        }">
            <template #content>
                <DataTable 
                    :colNames="dataTable.colNames"
                    :head="dataTable.head"
                    :body="dataTable.body"
                    :config="dataTable.config"
                    :title="`${FINAL_CONFIG.style.chart.title.text}${FINAL_CONFIG.style.chart.title.subtitle.text ? ` : ${FINAL_CONFIG.style.chart.title.subtitle.text}` : ''}`"
                    @close="mutableConfig.showTable = false"
                >
                    <template #th="{ th }">
                        <div v-html="th"/>
                    </template>
                    <template #td="{ td }">
                        {{ !isNaN(Number(td)) ? dataLabel({
                            p: FINAL_CONFIG.style.chart.bars.dataLabels.prefix,
                            v: td,
                            s: FINAL_CONFIG.style.chart.bars.dataLabels.suffix,
                            r: FINAL_CONFIG.table.td.roundingValue,
                        }) : td }}
                    </template>
                </DataTable>
            </template>
        </Accordion>
    </div>
</template>

<style scoped>
@import "../vue-data-ui.css";
.vue-ui-stackbar * {
    transition: unset;
}

.vue-ui-stackbar {
    user-select: none;
    width: 100%;
}

.vue-data-ui-bar-animated {
    animation: vueDataUiBarAnimation 0.5s ease-in-out;
    transform-origin: center;
}

.vue-data-ui-bar-transition {
    transition: all 0.2s ease-in-out !important;
}

@keyframes vueDataUiBarAnimation {
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