<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from "vue";
import {
    applyDataLabel,
    convertCustomPalette,
    createCsvContent, 
    createSmoothPath,
    createUid,
    dataLabel,
    downloadCsv,
    error,
    functionReturnsString,
    getMissingDatasetAttributes,
    giftWrap,
    isFunction,
    objectIsEmpty,
    opacity, 
    palette,
    themePalettes,
    XMLNS,
} from '../lib';
import { throttle } from "../canvas-lib";
import themes from "../themes.json";
import Title from "../atoms/Title.vue";
import UserOptions from "../atoms/UserOptions.vue";
import Tooltip from "../atoms/Tooltip.vue";
import Legend from "../atoms/Legend.vue";
import Shape from "../atoms/Shape.vue";
import DataTable from "../atoms/DataTable.vue";
import Skeleton from "./vue-ui-skeleton.vue";
import Accordion from "./vue-ui-accordion.vue";
import { useNestedProp } from "../useNestedProp";
import { usePrinter } from "../usePrinter";
import { useResponsive } from "../useResponsive";
import { useConfig } from "../useConfig";

const { vue_ui_scatter: DEFAULT_CONFIG } = useConfig()

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

const isDataset = computed(() => {
    return !!props.dataset && props.dataset.length;
})

const uid = ref(createUid());
const details = ref(null);
const isTooltip = ref(false);
const tooltipContent = ref("");
const step = ref(0);
const scatterChart = ref(null);
const chartTitle = ref(null);
const chartLegend = ref(null);

const FINAL_CONFIG = computed(() => {
    const mergedConfig = useNestedProp({
        userConfig: props.config,
        defaultConfig: DEFAULT_CONFIG
    });
    if (mergedConfig.theme) {
        return {
            ...useNestedProp({
                userConfig: themes.vue_ui_scatter[mergedConfig.theme] || props.config,
                defaultConfig: mergedConfig
            }),
            customPalette: themePalettes[mergedConfig.theme] || palette
        }
    } else {
        return mergedConfig;
    }
});

const resizeObserver = ref(null);

onMounted(() => {
    if(objectIsEmpty(props.dataset)){
        error({ 
            componentName: 'VueUiScatter',
            type: 'dataset'
        })
    }

    if (FINAL_CONFIG.value.responsive) {
        const handleResize = throttle(() => {
            const { width, height } = useResponsive({
                chart: scatterChart.value,
                title: FINAL_CONFIG.value.style.title.text ? chartTitle.value : null,
                legend: FINAL_CONFIG.value.style.legend.show ? chartLegend.value : null,
            });
            svg.value.width = width;
            svg.value.height = height;
        });

        resizeObserver.value = new ResizeObserver(handleResize);
        resizeObserver.value.observe(scatterChart.value.parentNode);
    }
});

onBeforeUnmount(() => {
    if (resizeObserver.value) resizeObserver.value.disconnect();
});

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `vue-ui-scatter_${uid.value}`,
    fileName: FINAL_CONFIG.value.style.title.text || 'vue-ui-scatter',
});

const customPalette = computed(() => {
    return convertCustomPalette(FINAL_CONFIG.value.customPalette);
})

const mutableConfig = ref({
    showTable: FINAL_CONFIG.value.table.show,
    showTooltip: FINAL_CONFIG.value.style.tooltip.show
});

const svg = ref({
    height: FINAL_CONFIG.value.style.layout.height,
    width: FINAL_CONFIG.value.style.layout.width,
})

const marginalSize = computed(() => {
    if(!FINAL_CONFIG.value.style.layout.marginalBars.show) {
        return 0
    }
    return FINAL_CONFIG.value.style.layout.marginalBars.size + FINAL_CONFIG.value.style.layout.marginalBars.offset
})

const drawingArea = computed(() => {
    return {
        top: FINAL_CONFIG.value.style.layout.padding.top + marginalSize.value,
        right: svg.value.width - FINAL_CONFIG.value.style.layout.padding.right - marginalSize.value,
        bottom: svg.value.height - FINAL_CONFIG.value.style.layout.padding.bottom,
        left: FINAL_CONFIG.value.style.layout.padding.left,
        height: svg.value.height - FINAL_CONFIG.value.style.layout.padding.top - FINAL_CONFIG.value.style.layout.padding.bottom - marginalSize.value,
        width: svg.value.width - FINAL_CONFIG.value.style.layout.padding.left - FINAL_CONFIG.value.style.layout.padding.right - marginalSize.value
    }
});

const extremes = computed(() => {
    props.dataset.forEach((ds, i) => {
        getMissingDatasetAttributes({
            datasetObject: ds,
            requiredAttributes: ['values']
        }).forEach(attr => {
            error({
                componentName: 'VueUiScatter',
                type: 'datasetSerieAttribute',
                property: attr,
                index: i
            });
        })
        if(ds.values) {
            ds.values.forEach((v, j) => {
                getMissingDatasetAttributes({
                    datasetObject: v,
                    requiredAttributes: ['x', 'y']
                }).forEach(attr => {
                    error({
                        componentName: 'VueUiScatter',
                        type: 'datasetSerieAttribute',
                        property: `values.${attr}`,
                        index: `${i} - ${j}`
                    });
                });
            })
        }
    });

    const xMin = Math.min(...datasetWithId.value.filter(el => !segregated.value.includes(el.id)).flatMap(ds => ds.values.map(v => v.x)));
    const xMax = Math.max(...datasetWithId.value.filter(el => !segregated.value.includes(el.id)).flatMap(ds => ds.values.map(v => v.x)));
    const yMin = Math.min(...datasetWithId.value.filter(el => !segregated.value.includes(el.id)).flatMap(ds => ds.values.map(v => v.y)));
    const yMax = Math.max(...datasetWithId.value.filter(el => !segregated.value.includes(el.id)).flatMap(ds => ds.values.map(v => v.y)));
    return { xMin: xMin >= 0 ? 0 : xMin, xMax, yMin: yMin >= 0 ? 0 : yMin, yMax };
});

const zero = computed(() => {
    return {
        x: drawingArea.value.left + (Math.abs(extremes.value.xMin) / (extremes.value.xMax + Math.abs(extremes.value.xMin))) * drawingArea.value.width,
        y: drawingArea.value.bottom - (Math.abs(extremes.value.yMin) / (extremes.value.yMax + Math.abs(extremes.value.yMin))) * drawingArea.value.height
    }
});

const datasetWithId = computed(() => {
    return props.dataset.map((ds, i) => {
        const id = `cluster_${uid.value}_${i}`;
        return {
            ...ds,
            id,
            color: ds.color ? ds.color : (customPalette.value[i] || palette[i] || palette[i % palette.length]),
            opacity: segregated.value.includes(id) ? 0.5: 1,
            shape: ds.shape ?? 'circle',
            segregate: () => segregate(id),
            isSegregated: segregated.value.includes(id)
        }
    })
})

const legendConfig = computed(() => {
    return {
        cy: 'scatter-div-legend',
        backgroundColor: FINAL_CONFIG.value.style.legend.backgroundColor,
        color: FINAL_CONFIG.value.style.legend.color,
        fontSize: FINAL_CONFIG.value.style.legend.fontSize,
        paddingBottom: 12,
        fontWeight: FINAL_CONFIG.value.style.legend.bold ? 'bold' : ''
    }
})

const mutableDataset = computed(() => {
    return datasetWithId.value.map((ds, i) => {
        return {
            ...ds,
            plots: ds.values.map(v => {
                return {
                    x: drawingArea.value.left + ((v.x + Math.abs(extremes.value.xMin)) / (extremes.value.xMax + Math.abs(extremes.value.xMin))) * drawingArea.value.width,
                    y: drawingArea.value.bottom - ((v.y + Math.abs(extremes.value.yMin)) / (extremes.value.yMax + Math.abs(extremes.value.yMin))) * drawingArea.value.height,
                    v: {
                        ...v,
                        name: v.name || ""
                    },
                    clusterName: ds.name,
                    color: ds.color ? ds.color : (customPalette.value[i] || palette[i] || palette[i % palette.length]),
                    id: `plot_${uid.value}_${Math.random()}`,
                    weight: v.weight ?? FINAL_CONFIG.value.style.layout.plots.radius
                }
            }),
        }
    }).filter(ds => !segregated.value.includes(ds.id));
})

const drawableDataset = computed(() => {
    return mutableDataset.value.map(ds => {

        const meanX = ds.plots.reduce((sum, point) => sum + point.x, 0) / ds.plots.length;
        const meanY = ds.plots.reduce((sum, point) => sum + point.y, 0) / ds.plots.length;
        let numerator = 0;
        let denominatorX = 0;
        let denominatorY = 0;

        for (const point of ds.plots) {
            numerator += (point.x - meanX) * (point.y - meanY);
            denominatorX += (point.x - meanX) ** 2;
            denominatorY += (point.y - meanY) ** 2;
        }

        const correlationCoefficient = numerator / Math.sqrt(denominatorX * denominatorY);
        const slope = correlationCoefficient * (Math.sqrt(denominatorY) / Math.sqrt(denominatorX));
        const intercept = meanY - slope * meanX;
        const correlation = {
            x1: drawingArea.value.left,
            x2: drawingArea.value.right,
            y1: slope * drawingArea.value.left + intercept,
            y2: slope * drawingArea.value.right + intercept,
            coefficient: correlationCoefficient
        }

        const m = (correlation.y2 - correlation.y1) / (correlation.x2 - correlation.x1);
        const b = correlation.y1 - m * correlation.x1;

        const labelX = Math.min(svg.value.width - FINAL_CONFIG.value.style.layout.padding.right, Math.max(FINAL_CONFIG.value.style.layout.padding.left, (drawingArea.value.top - b) / m));

        const label = {
            x: labelX,
            y: m * labelX + b <= FINAL_CONFIG.value.style.layout.padding.top ? drawingArea.value.top : m * labelX + b
        }

        return {
            ...ds,
            correlation,
            label,
            plots: ds.plots.map(plot => {
                const x_proj = (plot.x + m * plot.y - m * b) / (1 + Math.pow(m, 2));
                const y_proj = (m * plot.x + Math.pow(m, 2) * plot.y + b) / (1 + Math.pow(m, 2));
                const deviation = Math.sqrt(Math.pow(plot.x - x_proj, 2) + Math.pow(plot.y - y_proj, 2));
                return {
                    ...plot,
                    deviation,
                    shape: ds.shape,
                    color: ds.color
                }
            })
        }
    })
});

const maxDeviation = computed(() => {
    return Math.max(...drawableDataset.value.flatMap(ds => ds.plots.map(p => Math.abs(p.deviation))))
})

function getData() {
    return drawableDataset.value;
}

function aggregateCoordinates(arr, scale) {
    const flattened = Array.isArray(arr) ? arr.flatMap(a => {
        return a.plots.map((p) => {
            return {
                x: p.x,
                y: p.y
            }
        })
    }) : arr.plots.map(p => {
        return {
            x: p.x,
            y: p.y
        }
    })

    let xMin = Infinity, xMax = -Infinity, yMin = Infinity, yMax = -Infinity;

    flattened.forEach(({x, y}) => {
        xMin = Math.min(xMin, x);
        xMax = Math.max(xMax, x);
        yMin = Math.min(yMin, y);
        yMax = Math.max(yMax, y);
    });

    const totalX = xMax - xMin;
    const totalY = yMax - yMin;
    const chunkSizeX = totalX / scale;
    const chunkSizeY = totalY / scale;
    const xCounts = Array(scale).fill(0);
    const yCounts = Array(scale).fill(0);

    flattened.forEach(({ x, y }) => {
        const xIndex = Math.floor((x - xMin) / chunkSizeX);
        const yIndex = Math.floor((y - yMin) / chunkSizeY);
        if(!xCounts[xIndex]) {
            xCounts[xIndex] = 0;
        }
        if(!yCounts[yIndex]) {
            yCounts[yIndex] = 0;
        }
        xCounts[xIndex] += 1;
        yCounts[yIndex] += 1;
    });

    const avgX = [];
    const avgY = [];
    for (let i = 0; i < scale; i += 1) {
        avgX.push(xMin + (i + 0.5) * chunkSizeX);
        avgY.push(yMin + (i + 0.5) * chunkSizeY);
    }
    const maxX = Math.max(...xCounts);
    const maxY = Math.max(...yCounts);
    return { x: xCounts, y: yCounts, avgX, avgY, maxX, maxY };
}

const scale = computed(() => FINAL_CONFIG.value.style.layout.marginalBars.tranches)

const marginalBars = computed(() => {
    return aggregateCoordinates(mutableDataset.value, scale.value)
});

const marginalLines = computed(() => {
    const top = drawingArea.value.top - FINAL_CONFIG.value.style.layout.marginalBars.offset;
    const right = drawingArea.value.right + FINAL_CONFIG.value.style.layout.marginalBars.offset;
    return mutableDataset.value.map(ds => {
        const coords = aggregateCoordinates(ds, scale.value);

        return {
            coords,
            dX: createSmoothPath(coords.avgX.map((el,i) => {
                return { 
                    x: el, 
                    y: top - coords.x[i] / coords.maxX * FINAL_CONFIG.value.style.layout.marginalBars.size
                }
            })),
            dY: createSmoothPath(coords.avgY.map((el, i) => {
                return {
                    y: el,
                    x: right + (FINAL_CONFIG.value.style.layout.marginalBars.size * coords.y[i] / coords.maxY)
                }
            })),
            color: ds.color,
            id: ds.id,
        }
    })
})

const selectedPlotId = ref(undefined);
const selectedPlot = ref(null);
const dataTooltipSlot = ref(null);

function useTooltip(plot, seriesIndex) {
    selectedPlotId.value = plot.id;
    selectedPlot.value = plot;
    let html = "";

    dataTooltipSlot.value = {
        datapoint: plot,
        seriesIndex,
        series: drawableDataset.value,
        config: FINAL_CONFIG.value
    }

    const customFormat = FINAL_CONFIG.value.style.tooltip.customFormat;

    if (isFunction(customFormat) && functionReturnsString(() => customFormat({
            datapoint: plot,
            seriesIndex,
            series: drawableDataset.value,
            config: FINAL_CONFIG.value
        }))) {
        tooltipContent.value = customFormat({
            datapoint: plot,
            seriesIndex,
            series: drawableDataset.value,
            config: FINAL_CONFIG.value
        })
    } else {
        if (plot.clusterName) {
            html += `<div style="display:flex;gap:3px;align-items:center">${plot.clusterName}</div>`
        }
    
        if (plot.v.name) {
            html += `<div>${plot.v.name}</div>`
        }
    
        html += `<div style="text-align:left;margin-top:6px;padding-top:6px;border-top:1px solid ${FINAL_CONFIG.value.style.tooltip.borderColor}">`;

        html += `<div>${FINAL_CONFIG.value.style.layout.dataLabels.xAxis.name}: <b>${isNaN(plot.v.x) ? '-' : applyDataLabel(
            FINAL_CONFIG.value.style.layout.plots.selectors.labels.x.formatter,
            plot.v.x,
            dataLabel({
                p: FINAL_CONFIG.value.style.tooltip.prefix,
                v: plot.v.x,
                s: FINAL_CONFIG.value.style.tooltip.suffix,
                r: FINAL_CONFIG.value.style.tooltip.roundingValue
            })
        )}</b></div>`;

        html += `<div>${FINAL_CONFIG.value.style.layout.dataLabels.yAxis.name}: <b>${isNaN(plot.v.y) ? '-' :  applyDataLabel(
            FINAL_CONFIG.value.style.layout.plots.selectors.labels.y.formatter,
            plot.v.y,
            dataLabel({
                p: FINAL_CONFIG.value.style.tooltip.prefix,
                v: plot.v.y,
                s: FINAL_CONFIG.value.style.tooltip.suffix,
                r: FINAL_CONFIG.value.style.tooltip.roundingValue
            })
        )}</b></div>`;
        
        html += `${FINAL_CONFIG.value.style.layout.plots.deviation.translation}: <b>${dataLabel({
            v: plot.deviation,
            r: FINAL_CONFIG.value.style.layout.plots.deviation.roundingValue
        })}</b>`;

        html += `</div>`;
    
        tooltipContent.value = `<div>${html}</div>`
    }

    isTooltip.value = true;
}

function clearHover() {
    isTooltip.value = false;
    selectedPlotId.value = undefined;
    selectedPlot.value = null;
}

const segregated = ref([]);

function segregate(id) {
    if (segregated.value.includes(id)) {
        segregated.value = segregated.value.filter(el => el !== id);
    } else {
        if (segregated.value.length < props.dataset.length - 1) {
            segregated.value.push(id)
        }
    }
}

function generateCsv() {
    nextTick(() => {
        const labels = ["", FINAL_CONFIG.value.table.translations.correlationCoefficient, FINAL_CONFIG.value.table.translations.nbrPlots, `${FINAL_CONFIG.value.style.layout.dataLabels.xAxis.name} ${FINAL_CONFIG.value.table.translations.average}`, `${FINAL_CONFIG.value.style.layout.dataLabels.yAxis.name} ${FINAL_CONFIG.value.table.translations.average}`];

        const values = drawableDataset.value.map(ds => {
            return [
                ds.name,
                ds.correlation.coefficient,
                ds.plots.length,
                ds.plots.map(plot => plot.v.x).reduce((a, b) => a + b, 0) / ds.plots.length,
                ds.plots.map(plot => plot.v.y).reduce((a, b) => a + b, 0) / ds.plots.length
            ]
        });

        const tableXls = [[FINAL_CONFIG.value.style.title.text],[FINAL_CONFIG.value.style.title.subtitle.text],[[""],[""],[""]]].concat([labels]).concat(values)
        const csvContent = createCsvContent(tableXls);
        downloadCsv({ csvContent, title: FINAL_CONFIG.value.style.title.text || "vue-ui-heatmap"})
    });
}

const dataTable = computed(() => {
    const head = [
        FINAL_CONFIG.value.table.translations.series,
        FINAL_CONFIG.value.table.translations.correlationCoefficient,
        FINAL_CONFIG.value.table.translations.nbrPlots,
        `${FINAL_CONFIG.value.style.layout.dataLabels.xAxis.name} ${FINAL_CONFIG.value.table.translations.average}`,
        `${FINAL_CONFIG.value.style.layout.dataLabels.yAxis.name} ${FINAL_CONFIG.value.table.translations.average}`
    ];

    const body = drawableDataset.value.map(ds => {
        return [
            {
                shape: ds.shape,
                content: ds.name,
                color: ds.color
            },
            Number((ds.correlation.coefficient ?? 0).toFixed(FINAL_CONFIG.value.table.td.roundingValue)).toLocaleString(),
            ds.plots.length.toLocaleString(),
            Number((ds.plots.map(p => p.v.x ?? 0).reduce((a,b) => a + b , 0) / ds.plots.length).toFixed(FINAL_CONFIG.value.table.td.roundingAverage)).toLocaleString(),
            Number((ds.plots.map(p => p.v.y ?? 0).reduce((a,b) => a + b , 0) / ds.plots.length).toFixed(FINAL_CONFIG.value.table.td.roundingAverage)).toLocaleString(),
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
            outline: FINAL_CONFIG.value.table.td.outline
        },
        breakpoint: FINAL_CONFIG.value.table.responsiveBreakpoint
    };

    return { head, body, config, colNames: head };
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

defineExpose({
    getData,
    generatePdf,
    generateCsv,
    generateImage,
    toggleTable,
    toggleTooltip
});

</script>

<template>
    <div :class="`vue-ui-scatter ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''} ${FINAL_CONFIG.useCssAnimation ? '' : 'vue-ui-dna'}`" ref="scatterChart" :id="`vue-ui-scatter_${uid}`" :style="`font-family:${FINAL_CONFIG.style.fontFamily};width:100%; text-align:center;${!FINAL_CONFIG.style.title.text ? 'padding-top:36px' : ''};background:${FINAL_CONFIG.style.backgroundColor};${FINAL_CONFIG.responsive ? 'height: 100%' : ''}`">
        
        <div ref="chartTitle" v-if="FINAL_CONFIG.style.title.text" :style="`width:100%;background:${FINAL_CONFIG.style.backgroundColor}`">
            <!-- TITLE AS DIV -->
            <Title
                :config="{
                    title: {
                        cy: 'scatter-div-title',
                        ...FINAL_CONFIG.style.title
                    },
                    subtitle: {
                        cy: 'scatter-div-subtitle',
                        ...FINAL_CONFIG.style.title.subtitle
                    },
                }"
            />
        </div>

        <!-- OPTIONS -->
        <UserOptions
            ref="details"
            :key="`user_options_${step}`"
            v-if="FINAL_CONFIG.userOptions.show && isDataset"
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
            :isTooltip="mutableConfig.showTooltip"
            :isFullscreen="isFullscreen"
            :titles="{ ...FINAL_CONFIG.userOptions.buttonTitles }"
            :chartElement="scatterChart"
            @toggleFullscreen="toggleFullscreen"
            @generatePdf="generatePdf"
            @generateCsv="generateCsv"
            @generateImage="generateImage"
            @toggleTable="toggleTable"
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
            <template v-if="$slots.optionFullscreen" template #optionFullscreen="{ toggleFullscreen, isFullscreen }">
                <slot name="optionFullscreen" v-bind="{ toggleFullscreen, isFullscreen }"/>
            </template>
        </UserOptions>

        <!-- CHART -->
        <svg :xmlns="XMLNS" v-if="isDataset" :class="{ 'vue-data-ui-fullscreen--on': isFullscreen, 'vue-data-ui-fulscreen--off': !isFullscreen }" :viewBox="`0 0 ${svg.width <= 0 ? 10 : svg.width} ${svg.height <= 0 ? 10 : svg.height}`" :style="`max-width:100%;overflow:visible;background:${FINAL_CONFIG.style.backgroundColor};color:${FINAL_CONFIG.style.color}`">

            <!-- AXIS -->
            <g v-if="FINAL_CONFIG.style.layout.axis.show">
                <line
                    data-cy="scatter-y-axis"
                    :x1="zero.x"
                    :x2="zero.x"
                    :y1="drawingArea.top"
                    :y2="drawingArea.bottom"
                    :stroke="FINAL_CONFIG.style.layout.axis.stroke"
                    :stroke-width="FINAL_CONFIG.style.layout.axis.strokeWidth"
                    stroke-linecap="round"
                />
                <line
                    data-cy="scatter-x-axis"
                    :x1="drawingArea.left"
                    :x2="drawingArea.right"
                    :y1="zero.y"
                    :y2="zero.y"
                    :stroke="FINAL_CONFIG.style.layout.axis.stroke"
                    :stroke-width="FINAL_CONFIG.style.layout.axis.strokeWidth"
                    stroke-linecap="round"
                />
            </g>

            <!-- GIFT WRAP -->
            <g v-if="FINAL_CONFIG.style.layout.plots.giftWrap.show">
                <g v-for="(ds, i) in drawableDataset">
                    <polygon 
                        v-if="ds.plots.length > 2"
                        :points="giftWrap({series: ds.plots})"
                        :fill="`${ds.color}${opacity[FINAL_CONFIG.style.layout.plots.giftWrap.fillOpacity * 100]}`"
                        :stroke-width="FINAL_CONFIG.style.layout.plots.giftWrap.strokeWidth"
                        :stroke-dasharray="FINAL_CONFIG.style.layout.plots.giftWrap.strokeDasharray"
                        :stroke="ds.color"
                        stroke-linejoin="round"
                        stroke-linecap="round"
                    />
                </g>
            </g>

            <!-- PLOTS -->
            <g v-for="(ds, i) in drawableDataset">
                <g v-if="!ds.shape || ds.shape === 'circle'">
                    <circle 
                        v-for="(plot, j) in ds.plots"
                        :data-cy="`scatter-plot-${i}-${j}`"
                        :cx="plot.x"
                        :cy="plot.y"
                        :r="selectedPlotId && selectedPlotId === plot.id ? plot.weight * 2 : plot.weight"
                        :fill="`${ds.color}${opacity[FINAL_CONFIG.style.layout.plots.opacity * 100]}`"
                        :stroke="FINAL_CONFIG.style.layout.plots.stroke"
                        :stroke-width="FINAL_CONFIG.style.layout.plots.strokeWidth"
                        @mouseover="useTooltip(plot, i)"
                        @mouseleave="clearHover"
                        :style="`opacity:${selectedPlotId && selectedPlotId === plot.id ? 1 : FINAL_CONFIG.style.layout.plots.significance.useDistanceOpacity ? (1 - (Math.abs(plot.deviation) / maxDeviation)) : FINAL_CONFIG.style.layout.plots.significance.show && Math.abs(plot.deviation) > FINAL_CONFIG.style.layout.plots.significance.deviationThreshold ? FINAL_CONFIG.style.layout.plots.significance.opacity : 1}`"
                    />
                </g>
                <g v-else>
                    <Shape
                        v-for="(plot, j) in ds.plots"
                        :data-cy="`scatter-plot-${i}-${j}`"
                        :plot="{x: plot.x, y: plot.y }"
                        :radius="selectedPlotId && selectedPlotId === plot.id ? plot.weight * 2 : plot.weight"
                        :shape="ds.shape"
                        :color="`${ds.color}${opacity[FINAL_CONFIG.style.layout.plots.opacity * 100]}`"
                        :stroke="FINAL_CONFIG.style.layout.plots.stroke"
                        :strokeWidth="FINAL_CONFIG.style.layout.plots.strokeWidth"
                        @mouseover="useTooltip(plot, i)"
                        @mouseleave="clearHover"
                        :style="`opacity:${selectedPlotId && selectedPlotId === plot.id ? 1 : FINAL_CONFIG.style.layout.plots.significance.useDistanceOpacity ? (1 - (Math.abs(plot.deviation) / maxDeviation)) : FINAL_CONFIG.style.layout.plots.significance.show && Math.abs(plot.deviation) > FINAL_CONFIG.style.layout.plots.significance.deviationThreshold ? FINAL_CONFIG.style.layout.plots.significance.opacity : 1}`"
                    />
                </g>
            </g>

            <!-- MARGINAL BARS -->
            <g v-if="FINAL_CONFIG.style.layout.marginalBars.show">
                <defs>
                    <linearGradient :id="`marginal_x_${uid}`" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" :stop-color="FINAL_CONFIG.style.layout.marginalBars.fill"/>
                        <stop offset="100%" :stop-color="FINAL_CONFIG.style.backgroundColor"/>
                    </linearGradient>
                    <linearGradient :id="`marginal_y_${uid}`" x1="0%" x2="100%" y1="0%" y2="0%">
                        <stop offset="0%" :stop-color="FINAL_CONFIG.style.backgroundColor"/>
                        <stop offset="100%" :stop-color="FINAL_CONFIG.style.layout.marginalBars.fill"/>
                    </linearGradient>
                </defs>
                <g v-for="(x, i) in marginalBars.x">
                    <rect
                        v-if="x && marginalBars.avgX[i]"
                        :x="marginalBars.avgX[i] - (drawingArea.width / scale / 2)"
                        :y="drawingArea.top - FINAL_CONFIG.style.layout.marginalBars.offset - x / marginalBars.maxX * FINAL_CONFIG.style.layout.marginalBars.size"
                        :width="drawingArea.width / scale <= 0 ? 0.0001 : drawingArea.width / scale"
                        :height="x / marginalBars.maxX * FINAL_CONFIG.style.layout.marginalBars.size <= 0 ? 0.0001 : x / marginalBars.maxX * FINAL_CONFIG.style.layout.marginalBars.size"
                        :fill="FINAL_CONFIG.style.layout.marginalBars.useGradient ? `url(#marginal_x_${uid})` : FINAL_CONFIG.style.layout.marginalBars.fill"
                        :style="`opacity:${FINAL_CONFIG.style.layout.marginalBars.opacity}`"
                        :stroke="FINAL_CONFIG.style.backgroundColor"
                        :stroke-width="FINAL_CONFIG.style.layout.marginalBars.strokeWidth"
                        :rx="FINAL_CONFIG.style.layout.marginalBars.borderRadius"
                    />
                </g>
                <g v-for="(y, i) in marginalBars.y">
                    <rect
                        v-if="y && marginalBars.avgY[i]"
                        :x="drawingArea.right + FINAL_CONFIG.style.layout.marginalBars.offset"
                        :y="marginalBars.avgY[i] - (drawingArea.height / scale / 2)"
                        :height="drawingArea.height / scale <= 0 ? 0.0001 : drawingArea.height / scale"
                        :width="y / marginalBars.maxY * FINAL_CONFIG.style.layout.marginalBars.size <= 0 ? 0.0001 : y / marginalBars.maxY * FINAL_CONFIG.style.layout.marginalBars.size"
                        :fill="FINAL_CONFIG.style.layout.marginalBars.useGradient ? `url(#marginal_y_${uid})` : FINAL_CONFIG.style.layout.marginalBars.fill"
                        :style="`opacity:${FINAL_CONFIG.style.layout.marginalBars.opacity}`"
                        :stroke="FINAL_CONFIG.style.backgroundColor"
                        :stroke-width="FINAL_CONFIG.style.layout.marginalBars.strokeWidth"
                        :rx="FINAL_CONFIG.style.layout.marginalBars.borderRadius"
                    />
                </g>
                <g v-if="FINAL_CONFIG.style.layout.marginalBars.showLines">
                    <template v-for="line in marginalLines">                   
                        <path
                            v-if="!segregated.includes(line.id)"
                            :d="`M ${line.dX}`"
                            :stroke="FINAL_CONFIG.style.backgroundColor"
                            :stroke-width="FINAL_CONFIG.style.layout.marginalBars.linesStrokeWidth + 1"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            fill="none"
                        />
                        <path
                            v-if="!segregated.includes(line.id)"
                            :d="`M ${line.dX}`"
                            :stroke="line.color"
                            :stroke-width="FINAL_CONFIG.style.layout.marginalBars.linesStrokeWidth"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            fill="none"
                        />
                        <path
                            v-if="!segregated.includes(line.id)"
                            :d="`M ${line.dY}`"
                            :stroke="FINAL_CONFIG.style.backgroundColor"
                            :stroke-width="FINAL_CONFIG.style.layout.marginalBars.linesStrokeWidth + 1"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            fill="none"
                        />
                        <path
                            v-if="!segregated.includes(line.id)"
                            :d="`M ${line.dY}`"
                            :stroke="line.color"
                            :stroke-width="FINAL_CONFIG.style.layout.marginalBars.linesStrokeWidth"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            fill="none"
                        />
                    </template>
                </g>
            </g>

            <!-- SELECTORS -->
            <g v-if="selectedPlot && FINAL_CONFIG.style.layout.plots.selectors.show" style="pointer-events: none !important;">
                <line
                    :x1="zero.x"
                    :x2="selectedPlot.x"
                    :y1="selectedPlot.y"
                    :y2="selectedPlot.y"
                    :stroke="FINAL_CONFIG.style.layout.plots.selectors.stroke"
                    :stroke-width="FINAL_CONFIG.style.layout.plots.selectors.strokeWidth"
                    :stroke-dasharray="FINAL_CONFIG.style.layout.plots.selectors.strokeDasharray"
                    stroke-linecap="round"
                    class="line-pointer"
                />
                <line
                    :x1="selectedPlot.x"
                    :x2="selectedPlot.x"
                    :y1="zero.y"
                    :y2="selectedPlot.y"
                    :stroke="FINAL_CONFIG.style.layout.plots.selectors.stroke"
                    :stroke-width="FINAL_CONFIG.style.layout.plots.selectors.strokeWidth"
                    :stroke-dasharray="FINAL_CONFIG.style.layout.plots.selectors.strokeDasharray"
                    stroke-linecap="round"
                    class="line-pointer"
                />
                <text
                    :x="zero.x + (selectedPlot.x > zero.x ? -6 : 6)"
                    :y="selectedPlot.y + FINAL_CONFIG.style.layout.plots.selectors.labels.fontSize / 3"
                    :font-size="FINAL_CONFIG.style.layout.plots.selectors.labels.fontSize"
                    :fill="FINAL_CONFIG.style.layout.plots.selectors.labels.color"
                    :font-weight="FINAL_CONFIG.style.layout.plots.selectors.labels.bold ? 'bold' : 'normal'"
                    :text-anchor="selectedPlot.x > zero.x ? 'end' : 'start'"
                >
                    {{ applyDataLabel(
                        FINAL_CONFIG.style.layout.plots.selectors.labels.y.formatter,
                        selectedPlot.v.y,
                        dataLabel({
                            p: FINAL_CONFIG.style.layout.plots.selectors.labels.prefix,
                            v: selectedPlot.v.y,
                            s: FINAL_CONFIG.style.layout.plots.selectors.labels.suffix,
                            r: FINAL_CONFIG.style.layout.plots.selectors.labels.rounding
                        })
                    ) }}
                </text>
                <text
                    :x="selectedPlot.x"
                    :y="zero.y + (selectedPlot.y > zero.y ? - 6 : FINAL_CONFIG.style.layout.plots.selectors.labels.fontSize +6)"
                    :font-size="FINAL_CONFIG.style.layout.plots.selectors.labels.fontSize"
                    :fill="FINAL_CONFIG.style.layout.plots.selectors.labels.color"
                    :font-weight="FINAL_CONFIG.style.layout.plots.selectors.labels.bold ? 'bold' : 'normal'"
                    :text-anchor="'middle'"
                >
                    {{ applyDataLabel(
                        FINAL_CONFIG.style.layout.plots.selectors.labels.y.formatter,
                        selectedPlot.v.x,
                        dataLabel({
                            p: FINAL_CONFIG.style.layout.plots.selectors.labels.prefix,
                            v: selectedPlot.v.x,
                            s: FINAL_CONFIG.style.layout.plots.selectors.labels.suffix,
                            r: FINAL_CONFIG.style.layout.plots.selectors.labels.rounding
                        })
                    ) }}
                </text>
                <circle
                    :cx="zero.x"
                    :cy="selectedPlot.y"
                    :r="FINAL_CONFIG.style.layout.plots.selectors.markers.radius"
                    :fill="FINAL_CONFIG.style.layout.plots.selectors.markers.fill"
                    :stroke="FINAL_CONFIG.style.layout.plots.selectors.markers.stroke"
                    :stroke-width="FINAL_CONFIG.style.layout.plots.selectors.markers.strokeWidth"
                    class="line-pointer"
                />
                <circle
                    :cx="selectedPlot.x"
                    :cy="zero.y"
                    :r="FINAL_CONFIG.style.layout.plots.selectors.markers.radius"
                    :fill="FINAL_CONFIG.style.layout.plots.selectors.markers.fill"
                    :stroke="FINAL_CONFIG.style.layout.plots.selectors.markers.stroke"
                    :stroke-width="FINAL_CONFIG.style.layout.plots.selectors.markers.strokeWidth"
                    class="line-pointer"
                />
                <text
                    v-if="FINAL_CONFIG.style.layout.plots.selectors.labels.showName"
                    :x="selectedPlot.x"
                    :y="selectedPlot.y + (selectedPlot.y < zero.y ? - FINAL_CONFIG.style.layout.plots.selectors.labels.fontSize /2 : FINAL_CONFIG.style.layout.plots.selectors.labels.fontSize)"
                    :font-size="FINAL_CONFIG.style.layout.plots.selectors.labels.fontSize"
                    :fill="FINAL_CONFIG.style.layout.plots.selectors.labels.color"
                    :font-weight="FINAL_CONFIG.style.layout.plots.selectors.labels.bold ? 'bold' : 'normal'"
                    :text-anchor="selectedPlot.x < drawingArea.left + 100 ? 'start' : selectedPlot.x > drawingArea.right - 100 ? 'end' : selectedPlot.x > zero.x ? 'start' : 'end'"
                >
                    {{ selectedPlot.v.name }}
                </text>
            </g>

            <!-- AXIS LABELS -->
            <g v-if="FINAL_CONFIG.style.layout.dataLabels.xAxis.show">
                <text
                    data-cy="scatter-x-min-axis-label"
                    :x="drawingArea.left - 5"
                    :y="zero.y + FINAL_CONFIG.style.layout.dataLabels.xAxis.fontSize / 3"
                    text-anchor="end"
                    :font-size="FINAL_CONFIG.style.layout.dataLabels.xAxis.fontSize"
                    :fill="FINAL_CONFIG.style.layout.dataLabels.xAxis.color"
                >
                    {{ applyDataLabel(
                        FINAL_CONFIG.style.layout.plots.selectors.labels.x.formatter,
                        extremes.xMin,
                        dataLabel({
                            p: FINAL_CONFIG.style.layout.plots.selectors.labels.prefix,
                            v: extremes.xMin,
                            s: FINAL_CONFIG.style.layout.plots.selectors.labels.suffix,
                            r: FINAL_CONFIG.style.layout.dataLabels.xAxis.rounding
                        })) 
                    }}
                </text>
                <text
                    data-cy="scatter-x-max-axis-label"
                    :x="drawingArea.right + 3"
                    :y="zero.y + FINAL_CONFIG.style.layout.dataLabels.xAxis.fontSize / 3"
                    text-anchor="start"
                    :font-size="FINAL_CONFIG.style.layout.dataLabels.xAxis.fontSize"
                    :fill="FINAL_CONFIG.style.layout.dataLabels.xAxis.color"
                >
                    {{ applyDataLabel(
                        FINAL_CONFIG.style.layout.plots.selectors.labels.x.formatter,
                        extremes.xMax,
                        dataLabel({
                            p: FINAL_CONFIG.style.layout.plots.selectors.labels.prefix,
                            v: extremes.xMax,
                            s: FINAL_CONFIG.style.layout.plots.selectors.labels.suffix,
                            r: FINAL_CONFIG.style.layout.dataLabels.xAxis.rounding
                        })) 
                    }}
                </text>
                <text
                    data-cy="scatter-x-label-name"
                    :id="`vue-ui-scatter-xAxis-label-${uid}`"
                    :transform="`translate(${FINAL_CONFIG.style.layout.dataLabels.xAxis.fontSize * 2}, ${drawingArea.top + drawingArea.height / 2}), rotate(-90)`" 
                    text-anchor="middle"
                    :font-size="FINAL_CONFIG.style.layout.dataLabels.xAxis.fontSize"
                    :font-weight="FINAL_CONFIG.style.layout.dataLabels.xAxis.bold ? 'bold' : 'normal'"
                    :fill="FINAL_CONFIG.style.layout.dataLabels.xAxis.color"
                >
                    {{ FINAL_CONFIG.style.layout.dataLabels.xAxis.name }}
                </text>

            </g>
            <g v-if="FINAL_CONFIG.style.layout.dataLabels.yAxis.show">
                <text
                    data-cy="scatter-y-min-axis-label"
                    :x="zero.x"
                    :y="drawingArea.bottom + FINAL_CONFIG.style.layout.dataLabels.yAxis.fontSize + 3"
                    text-anchor="middle"
                    :font-size="FINAL_CONFIG.style.layout.dataLabels.yAxis.fontSize"
                    :fill="FINAL_CONFIG.style.layout.dataLabels.yAxis.color"
                >
                    {{ applyDataLabel(
                        FINAL_CONFIG.style.layout.plots.selectors.labels.y.formatter,
                        extremes.yMin,
                        dataLabel({
                            p: FINAL_CONFIG.style.layout.plots.selectors.labels.prefix,
                            v: extremes.yMin,
                            s: FINAL_CONFIG.style.layout.plots.selectors.labels.suffix,
                            r: FINAL_CONFIG.style.layout.dataLabels.yAxis.rounding
                        })) 
                    }}
                </text>
                <text
                    data-cy="scatter-y-max-axis-label"
                    :x="zero.x"
                    :y="drawingArea.top - FINAL_CONFIG.style.layout.dataLabels.yAxis.fontSize / 2"
                    text-anchor="middle"
                    :font-size="FINAL_CONFIG.style.layout.dataLabels.yAxis.fontSize"
                    :fill="FINAL_CONFIG.style.layout.dataLabels.yAxis.color"
                >
                    {{ applyDataLabel(
                        FINAL_CONFIG.style.layout.plots.selectors.labels.y.formatter,
                        extremes.yMax,
                        dataLabel({
                            p: FINAL_CONFIG.style.layout.plots.selectors.labels.prefix,
                            v: extremes.yMax,
                            s: FINAL_CONFIG.style.layout.plots.selectors.labels.suffix,
                            r: FINAL_CONFIG.style.layout.dataLabels.yAxis.rounding
                        })) 
                    }}
                </text>
                <text
                    data-cy="scatter-y-label-name"
                    text-anchor="middle"
                    :font-size="FINAL_CONFIG.style.layout.dataLabels.yAxis.fontSize"
                    :font-weight="FINAL_CONFIG.style.layout.dataLabels.yAxis.bold ? 'bold' : 'normal'"
                    :fill="FINAL_CONFIG.style.layout.dataLabels.yAxis.color"
                    :x="drawingArea.left + drawingArea.width / 2"
                    :y="drawingArea.bottom + 8 + FINAL_CONFIG.style.layout.dataLabels.yAxis.fontSize * 2"
                >
                    {{ FINAL_CONFIG.style.layout.dataLabels.yAxis.name }}
                </text>
            </g>

            <clipPath :id="`clip_path_${uid}`">
                <rect
                    :x="drawingArea.left"
                    :y="drawingArea.top"
                    :width="drawingArea.width <= 0 ? 0.0001 : drawingArea.width"
                    :height="drawingArea.height <= 0 ? 0.0001 : drawingArea.height"
                />
            </clipPath>

            <!-- CORRELATION -->
            <g v-if="FINAL_CONFIG.style.layout.correlation.show">
                <line 
                    v-for="(ds, i) in drawableDataset"
                    :data-cy="`scatter-correlation-line-${i}`"
                    :x1="ds.correlation.x1"
                    :x2="ds.correlation.x2"
                    :y1="ds.correlation.y1"
                    :y2="ds.correlation.y2"
                    :stroke-dasharray="FINAL_CONFIG.style.layout.correlation.strokeDasharray"
                    :stroke="ds.color"
                    :stroke-width="FINAL_CONFIG.style.layout.correlation.strokeWidth"
                    :clip-path="`url(#clip_path_${uid})`"
                />
                <g v-for="(ds, i) in drawableDataset">
                    <text
                        :data-cy="`scatter-correlation-label-${i}`"
                        v-if="FINAL_CONFIG.style.layout.correlation.label.show"
                        :x="ds.label.x"
                        :y="ds.label.y"
                        :fill="FINAL_CONFIG.style.layout.correlation.label.useSerieColor ? ds.color : FINAL_CONFIG.style.layout.correlation.label.color"
                        :font-size="FINAL_CONFIG.style.layout.correlation.label.fontSize"
                        :font-weight="FINAL_CONFIG.style.layout.correlation.label.bold ? 'bold' : 'normal'"
                    >
                        {{ Number(ds.correlation.coefficient.toFixed(FINAL_CONFIG.style.layout.correlation.label.roundingValue)).toLocaleString() }}
                    </text>
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
                type: 'quadrant',
                style: {
                    backgroundColor: FINAL_CONFIG.style.backgroundColor,
                    quadrant: {
                        grid: {
                            color: FINAL_CONFIG.style.layout.axis.stroke
                        },
                        plots: {
                            color: FINAL_CONFIG.style.layout.axis.stroke,
                            radius: 1
                        }
                    }
                }
            }"
        />

        <!-- LEGEND AS DIV -->
        <div ref="chartLegend">
            <Legend
                v-if="FINAL_CONFIG.style.legend.show"
                :legendSet="datasetWithId"
                :config="legendConfig"
                @clickMarker="({ legend }) => segregate(legend.id)"
            >
                <template #item="{ legend }">
                    <div @click="legend.segregate()" :style="`opacity:${segregated.includes(legend.id) ? 0.5 : 1}`">
                        {{ legend.name }}
                    </div>
                </template>
            </Legend>
            <slot v-else name="legend" v-bind:legend="datasetWithId"></slot>
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
            :parent="scatterChart"
            :content="tooltipContent"
            :isCustom="FINAL_CONFIG.style.tooltip.customFormat && typeof FINAL_CONFIG.style.tooltip.customFormat === 'function'"
        >
            <template #tooltip-before>
                <slot name="tooltip-before" v-bind="{...dataTooltipSlot}"></slot>
            </template>
            <div style="width: 100%; display: flex; align-items:center;justify-content:center;" v-if="FINAL_CONFIG.style.tooltip.showShape">
                <svg viewBox="0 0 20 20" height="20" width="20" style="overflow: hidden;background:transparent;">
                    <Shape 
                        :shape="selectedPlot.shape"
                        :color="selectedPlot.color"
                        :plot="{x: 10, y: 10}"
                        :radius="7"
                    />
                </svg>
            </div>
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
                color: FINAL_CONFIG.style.color
            },
            head: {
                backgroundColor: FINAL_CONFIG.style.backgroundColor,
                color: FINAL_CONFIG.style.color
            }
        }">
            <template #content>
                <DataTable
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
                        <div v-if="td.shape">
                            <span>{{ td.content }}</span>
                        </div>
                        <div v-else v-html="td"/>
                    </template>
                </DataTable>
            </template>
        </Accordion>
    </div>
</template>

<style scoped>
@import "../vue-data-ui.css";

.vue-ui-scatter *{
    transition: unset;
}
.vue-ui-scatter {
    user-select: none;
    position: relative;
}

path, line:not(.line-pointer), circle:not(.line-pointer) {
    animation: verticalBarAnimation 0.5s ease-in-out !important;
    transform-origin: center !important;
}
@keyframes verticalBarAnimation {
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
.vue-ui-scatter .vue-ui-scatter-label {
    align-items: center;
    display: flex;
    flex-direction: column;
    height:100%;
    justify-content: center;
    text-align:center;
    width:100%;
}

/** */
.vue-ui-scatter-tooltip {
    border: 1px solid #e1e5e8;
    border-radius: 4px;
    box-shadow: 0 6px 12px -6px rgba(0,0,0,0.2);
    max-width: 300px;
    position: fixed;
    padding:12px;
    z-index:1;
}

.vue-ui-scatter table {
    width: 100%;
    border-collapse:collapse;
}
.vue-ui-scatter table td {
    text-align:right;
    padding-right: 6px;
    font-variant-numeric: tabular-nums;
}
.vue-ui-scatter table th {
    position: sticky;
    top:0;
    font-weight: 400;
    user-select: none;
}
.line-pointer {
    animation: line-pointer-opacity 0.3s ease-in-out forwards;
    opacity: 0;
}

@keyframes line-pointer-opacity {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}
</style>