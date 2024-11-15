<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount, watch } from "vue";
import {
    applyDataLabel,
    calculateNiceScale,
    checkNaN,
    convertColorToHex,
    convertCustomPalette,
    createCsvContent,
    createUid,
    darkenHexColor,
    dataLabel,
    downloadCsv,
    error,
    functionReturnsString,
    getMissingDatasetAttributes,
    isFunction,
    lightenHexColor,
    objectIsEmpty,
    palette,
    themePalettes,
    translateSize,
    XMLNS,
} from "../lib";
import { throttle } from "../canvas-lib";
import themes from "../themes.json";
import Title from "../atoms/Title.vue";
import UserOptions from "../atoms/UserOptions.vue";
import Tooltip from "../atoms/Tooltip.vue";
import DataTable from "../atoms/DataTable.vue";
import Skeleton from "./vue-ui-skeleton.vue";
import Shape from "../atoms/Shape.vue";
import Accordion from "./vue-ui-accordion.vue";
import { useNestedProp } from "../useNestedProp";
import { usePrinter } from "../usePrinter";
import { useResponsive } from "../useResponsive";
import { useConfig } from "../useConfig";
import PackageVersion from "../atoms/PackageVersion.vue";

const { vue_ui_strip_plot: DEFAULT_CONFIG } = useConfig();

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

const emit = defineEmits(['selectDatapoint']);

const isDataset = computed({
    get() {
        return !!props.dataset && props.dataset.length;
    },
    set(bool){
        return bool;
    }
});

const uid = ref(createUid());
const step = ref(0);
const isTooltip = ref(false);
const tooltipContent = ref("");
const stripPlotChart = ref(null);
const chartTitle = ref(null);
const animationStarted = ref(false);
const titleStep = ref(0);
const tableStep = ref(0);

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
                userConfig: themes.vue_ui_strip_plot[mergedConfig.theme] || props.config,
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
    prepareChart();
    titleStep.value += 1;
    tableStep.value += 1;
}, { deep: true });

const resizeObserver = ref(null);

onMounted(() => {
    prepareChart();
});

function prepareChart() {
    if (objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiStripPlot',
            type: 'dataset'
        })
    } else {
        props.dataset.forEach((ds, i) => {
            getMissingDatasetAttributes({
                datasetObject: ds,
                requiredAttributes: ['name', 'plots']
            }).forEach(attr => {
                isDataset.value = false;
                error({
                    componentName: 'VueUiStripPlot',
                    type: 'datasetSerieAttribute',
                    property: attr,
                    index: i
                })
            })
            if (ds.plots) {
                ds.plots.forEach((plot, j) => {
                    getMissingDatasetAttributes({
                        datasetObject: plot,
                        requiredAttributes: ['name', 'value']
                    }).forEach(attr => {
                        isDataset.value = false;
                        error({
                            componentName: 'VueUiStripPlot',
                            type: 'datasetSerieAttribute',
                            property: attr,
                            index: `${i},${j}`
                        })
                    })
                })
            }
        })
    }

    if (FINAL_CONFIG.value.responsive) {
        const handleResize = throttle(() => {
            const { width, height } = useResponsive({
                chart: stripPlotChart.value,
                title: FINAL_CONFIG.value.style.chart.title.text ? chartTitle.value : null,
            });
            absoluteHeight.value = height;

            svg.value.width = width;
            svg.value.height = height;
            
            stripWidth.value = (width - padding.value.left - padding.value.right) / props.dataset.length;
            plotRadius.value = translateSize({
                relator: Math.min(height, width),
                adjuster: 600,
                source: FINAL_CONFIG.value.style.chart.plots.radius,
                threshold: 6,
                fallback: 6
            });
        });

        resizeObserver.value = new ResizeObserver(handleResize);
        resizeObserver.value.observe(stripPlotChart.value.parentNode);
    }

    animationStarted.value = true;
    setTimeout(() => {
        animationActive.value = false;
    }, maxSeries.value * 50)
}

onBeforeUnmount(() => {
    if (resizeObserver.value) resizeObserver.value.disconnect();
});


const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `strip-plot_${uid.value}`,
    fileName: FINAL_CONFIG.value.style.chart.title.text || 'vue-ui-strip-plot'
});

const customPalette = computed(() => {
    return convertCustomPalette(FINAL_CONFIG.value.customPalette);
})

const animationActive = ref(FINAL_CONFIG.value.useCssAnimation);

const mutableConfig = ref({
    showTable: FINAL_CONFIG.value.table.show,
    dataLabels: {
        show: FINAL_CONFIG.value.style.chart.labels.bestPlotLabel.show
    },
    showTooltip: FINAL_CONFIG.value.style.chart.tooltip.show
});

const padding = ref({
    top: FINAL_CONFIG.value.style.chart.padding.top,
    bottom: FINAL_CONFIG.value.style.chart.padding.bottom,
    left: FINAL_CONFIG.value.style.chart.padding.left,
    right: FINAL_CONFIG.value.style.chart.padding.right
})

const stripWidth = ref(FINAL_CONFIG.value.style.chart.stripWidth);
const absoluteHeight = ref(FINAL_CONFIG.value.style.chart.height);
const plotRadius = ref(FINAL_CONFIG.value.style.chart.plots.radius);

const svg = ref({
    width: stripWidth.value * props.dataset.length + padding.value.left + padding.value.right,
    height:FINAL_CONFIG.value.style.chart.height
})


const drawingArea = computed(() => {
    const absoluteWidth = stripWidth.value * props.dataset.length + padding.value.left + padding.value.right;

    return {
        left: padding.value.left,
        right: absoluteWidth - padding.value.right,
        top: padding.value.top,
        bottom: absoluteHeight.value - padding.value.bottom,
        width: stripWidth.value * props.dataset.length,
        height: absoluteHeight.value - padding.value.top - padding.value.bottom,
        stripWidth: stripWidth.value,
        absoluteHeight: absoluteHeight.value,
        absoluteWidth,
    }
});

const immutableDataset = computed(() => {
    if (!isDataset.value) return null;

    return props.dataset.map((ds, i) => {
        const id = createUid();
        return {
            ...ds,
            id,
            color: ds.color ? convertColorToHex(ds.color) : customPalette.value[i] || palette[i] || palette[i % palette.length],
            plots: ds.plots.map(p => {
                return {
                    ...p,
                    value: checkNaN(p.value),
                    parentId: id,
                    color: ds.color ? convertColorToHex(ds.color) : customPalette.value[i] || palette[i] || palette[i % palette.length],
                    id: createUid(),
                }
            }).sort((a, b) => a.value - b.value)
        }
    })
});

const mutableDataset = computed(() => {
    return (immutableDataset.value || []).map((ds, i) => {
        return {
            ...ds,
            plots: ds.plots.map((p) => {
                return {
                    ...p,
                    x: drawingArea.value.left + ((i + 1) * drawingArea.value.stripWidth) - drawingArea.value.stripWidth / 2,
                }
            })
        }
    })
});

const maxSeries = computed(() => Math.max(...mutableDataset.value.map(ds => ds.plots.length)));

const extremes = computed(() => {
    const flattened = mutableDataset.value.flatMap(ds => ds.plots.map(p => p.value));
    return {
        max: Math.max(...flattened),
        min: Math.min(...flattened),
    }
})

const scale = computed(() => {
    return calculateNiceScale(extremes.value.min < 0 ? extremes.value.min : 0, extremes.value.max, FINAL_CONFIG.value.style.chart.grid.scaleSteps);
})

const drawableDataset = computed(() => {
    return (mutableDataset.value || []).map((ds, i) => {
        return {
            ...ds,
            plots: ds.plots.map((p) => {
                return {
                    ...p,
                    y: drawingArea.value.bottom - (((p.value + Math.abs(scale.value.min)) / (scale.value.max + Math.abs(scale.value.min))) * drawingArea.value.height)
                }
            })
        }
    })
});

const yLines = computed(() => {
    return scale.value.ticks.map(t => {
        return {
            y: drawingArea.value.bottom - (drawingArea.value.height * ((t + Math.abs(scale.value.min)) / (scale.value.max + Math.abs(scale.value.min)))),
            x1: drawingArea.value.left,
            x2: drawingArea.value.right,
            value: t
        }
    })
});

const dataTooltipSlot = ref(null);
const selectedDatapoint = ref(null);

function useTooltip({ datapoint, seriesIndex }) {
    dataTooltipSlot.value = { datapoint, seriesIndex, config: FINAL_CONFIG.value, series: immutableDataset.value };
    isTooltip.value = true;
    selectedDatapoint.value = datapoint;

    const customFormat = FINAL_CONFIG.value.style.chart.tooltip.customFormat;

    if(isFunction(customFormat) && functionReturnsString(() => customFormat({
        seriesIndex,
        datapoint,
        series: immutableDataset.value,
        config: FINAL_CONFIG.value
    }))) {
        tooltipContent.value = customFormat({
            seriesIndex,
            datapoint,
            series: immutableDataset.value,
            config: FINAL_CONFIG.value
        });
    } else {
        let html = "";

        html += `<div style="display:flex;flex-direction:row;gap:6px;align-items:center;"><svg viewBox="0 0 12 12" height="14" width="14"><circle data-cy="donut-tooltip-marker" cx="6" cy="6" r="6" stroke="none" fill="${FINAL_CONFIG.value.style.chart.plots.gradient.show ? `url(#${datapoint.parentId})` : datapoint.color}"/></svg>${datapoint.name}</div>`;
        html += `<div>${applyDataLabel(
            FINAL_CONFIG.value.style.chart.labels.formatter,
            datapoint.value,
            dataLabel({
                p: FINAL_CONFIG.value.style.chart.labels.prefix,
                v: datapoint.value,
                s: FINAL_CONFIG.value.style.chart.labels.suffix,
                r: FINAL_CONFIG.value.style.chart.tooltip.roundingValue
            }),
            { datapoint, seriesIndex }
        )}</div>`

        tooltipContent.value = `<div>${html}</div>`
    }
}

const table = computed(() => {
    const head = mutableDataset.value.flatMap(ds => {
        return JSON.parse(JSON.stringify(ds.plots)).sort((a,b) => b.value - a.value).map(p => {
            return {
                name: `${ds.name} - ${p.name}`,
                color: p.color
            }
        })
    })
    const body = mutableDataset.value.flatMap(ds => {
        return JSON.parse(JSON.stringify(ds.plots)).sort((a,b) => b.value - a.value).map(p => p.value)
    })
    return { head, body };
});

function generateCsv() {
    nextTick(() => {
        const labels = table.value.head.map((h,i) => {
            return [[
                h.name
            ],[table.value.body[i]]]
        });
        const tableXls = [[FINAL_CONFIG.value.style.chart.title.text],[FINAL_CONFIG.value.style.chart.title.subtitle.text],[[FINAL_CONFIG.value.table.columnNames.series],[FINAL_CONFIG.value.table.columnNames.value]]].concat(labels);

        const csvContent = createCsvContent(tableXls);
        downloadCsv({ csvContent, title: FINAL_CONFIG.value.style.chart.title.text || "vue-ui-strip-plot" })
    });
}


const dataTable = computed(() => {
    const head = [
        FINAL_CONFIG.value.table.columnNames.series,
        FINAL_CONFIG.value.table.columnNames.value,
    ];
    const body = table.value.head.map((h,i) => {
        const label = dataLabel({
            p: FINAL_CONFIG.value.style.chart.labels.prefix,
            v: table.value.body[i],
            s: FINAL_CONFIG.value.style.chart.labels.suffix,
            r: FINAL_CONFIG.value.table.td.roundingValue
        });
        return [
            {
                color: h.color,
                name: h.name
            },
            label
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
    }

    const colNames = [
        FINAL_CONFIG.value.table.columnNames.series,
        FINAL_CONFIG.value.table.columnNames.value,
    ]

    return {
        colNames,
        head,
        body,
        config
    }
});

const isFullscreen = ref(false)
function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
}

function getData() {
    return mutableDataset.value
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

defineExpose({
    getData,
    generatePdf,
    generateCsv,
    generateImage,
    toggleTable,
    toggleLabels,
    toggleTooltip
});

</script>

<template>
    <div ref="stripPlotChart" :class="`vue-ui-strip-plot ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''} ${FINAL_CONFIG.useCssAnimation ? '' : 'vue-ui-dna'}`" :style="`font-family:${FINAL_CONFIG.style.fontFamily};width:100%; text-align:center;${!FINAL_CONFIG.style.chart.title.text ? 'padding-top:36px' : ''};background:${FINAL_CONFIG.style.chart.backgroundColor};${FINAL_CONFIG.responsive ? 'height:100%' : ''}`" :id="`strip-plot_${uid}`">

        <div ref="chartTitle" v-if="FINAL_CONFIG.style.chart.title.text" :style="`width:100%;background:transparent;padding-bottom:24px`">
            <Title
                :key="`title_${titleStep}`"
                :config="{
                    title: {
                        cy: 'donut-div-title',
                        ...FINAL_CONFIG.style.chart.title
                    },
                    subtitle: {
                        cy: 'donut-div-subtitle',
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
            :hasTooltip="FINAL_CONFIG.userOptions.buttons.tooltip && FINAL_CONFIG.style.chart.tooltip.show"
            :hasPdf="FINAL_CONFIG.userOptions.buttons.pdf"
            :hasXls="FINAL_CONFIG.userOptions.buttons.csv"
            :hasImg="FINAL_CONFIG.userOptions.buttons.img"
            :hasTable="FINAL_CONFIG.userOptions.buttons.table"
            :hasLabel="FINAL_CONFIG.userOptions.buttons.labels"
            :hasFullscreen="FINAL_CONFIG.userOptions.buttons.fullscreen"
            :isTooltip="mutableConfig.showTooltip"
            :isFullscreen="isFullscreen"
            :titles="{ ...FINAL_CONFIG.userOptions.buttonTitles }"
            :chartElement="stripPlotChart"
            :position="FINAL_CONFIG.userOptions.position"
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

        <svg :xmlns="XMLNS" v-if="isDataset" :class="{ 'vue-data-ui-fullscreen--on': isFullscreen, 'vue-data-ui-fulscreen--off': !isFullscreen }" :viewBox="`0 0 ${svg.width <= 0 ? 10 : svg.width} ${svg.height <= 0 ? 10 : svg.height}`" :style="`max-width:100%; overflow: visible; background:transparent;color:${FINAL_CONFIG.style.chart.color};`">
            <PackageVersion />
            
            <!-- GRID -->
            <g v-if="FINAL_CONFIG.style.chart.grid.show">
                <!-- H GRID -->
                <g v-if="FINAL_CONFIG.style.chart.grid.horizontalGrid.show">
                    <line 
                        v-for="l in yLines"
                        :x1="l.x1"
                        :x2="l.x2"
                        :y1="l.y"
                        :y2="l.y"
                        :stroke="FINAL_CONFIG.style.chart.grid.horizontalGrid.stroke"
                        :stroke-width="FINAL_CONFIG.style.chart.grid.horizontalGrid.strokeWidth"
                        :stroke-dasharray="FINAL_CONFIG.style.chart.grid.horizontalGrid.strokeDasharray"
                        stroke-linecap="round"
                    />
                </g>
                <!-- V GRID -->
                <g v-if="FINAL_CONFIG.style.chart.grid.verticalGrid.show">
                    <line
                        v-for="(l, i) in mutableDataset"
                        :x1="drawingArea.left + ((i+1) * drawingArea.stripWidth)"
                        :x2="drawingArea.left + ((i+1) * drawingArea.stripWidth)"
                        :y1="drawingArea.top"
                        :y2="drawingArea.bottom"
                        :stroke="FINAL_CONFIG.style.chart.grid.verticalGrid.stroke"
                        :stroke-width="FINAL_CONFIG.style.chart.grid.verticalGrid.strokeWidth"
                        :stroke-dasharray="FINAL_CONFIG.style.chart.grid.verticalGrid.strokeDasharray"
                        stroke-linecap="round"
                    />
                </g>
                <!-- Y AXIS -->
                <line
                    :x1="drawingArea.left"
                    :x2="drawingArea.left"
                    :y1="drawingArea.top"
                    :y2="drawingArea.bottom"
                    :stroke="FINAL_CONFIG.style.chart.grid.stroke"
                    :stroke-width="FINAL_CONFIG.style.chart.grid.strokeWidth"
                    stroke-linecap="round"
                />
                <!-- X AXIS -->
                <line 
                    :x1="drawingArea.left"
                    :x2="drawingArea.right"
                    :y1="drawingArea.bottom"
                    :y2="drawingArea.bottom"
                    :stroke="FINAL_CONFIG.style.chart.grid.stroke"
                    :stroke-width="FINAL_CONFIG.style.chart.grid.strokeWidth"
                    stroke-linecap="round"
                />
            </g>
            <!-- Y AXIS VALUE LABELS -->
            <template v-if="FINAL_CONFIG.style.chart.labels.yAxisLabels.show">
                <text
                    v-for="(label, i) in yLines"
                    :x="label.x1 - FINAL_CONFIG.style.chart.labels.yAxisLabels.fontSize / 2 + FINAL_CONFIG.style.chart.labels.yAxisLabels.offsetX"
                    :y="label.y + FINAL_CONFIG.style.chart.labels.yAxisLabels.fontSize / 3"
                    :fill="FINAL_CONFIG.style.chart.labels.yAxisLabels.color"
                    :font-size="FINAL_CONFIG.style.chart.labels.yAxisLabels.fontSize"
                    text-anchor="end"
                >
                    {{  applyDataLabel(
                        FINAL_CONFIG.style.chart.labels.formatter,
                        label.value,
                        dataLabel({
                            p: FINAL_CONFIG.style.chart.labels.prefix,
                            v: label.value,
                            s: FINAL_CONFIG.style.chart.labels.suffix,
                            r: FINAL_CONFIG.style.chart.labels.yAxisLabels.rounding
                        }),
                        { datapoint: label, seriesIndex: i }
                        )
                    }}
                </text>
            </template>

            <!-- X AXIS LABELS -->
            <template v-if="FINAL_CONFIG.style.chart.labels.xAxisLabels.show">
                <text
                    v-for="(label, i) in mutableDataset"
                    :x="drawingArea.left + ((i+1) * drawingArea.stripWidth) - drawingArea.stripWidth / 2"
                    :y="drawingArea.bottom + FINAL_CONFIG.style.chart.labels.xAxisLabels.fontSize * 2  + FINAL_CONFIG.style.chart.labels.xAxisLabels.offsetY"
                    :font-size="FINAL_CONFIG.style.chart.labels.xAxisLabels.fontSize"
                    :fill="FINAL_CONFIG.style.chart.labels.xAxisLabels.color"
                    text-anchor="middle"
                >
                    {{ label.name }}
                </text>
            </template>

            <!-- Y AXIS NAME-->
            <text 
                v-if="FINAL_CONFIG.style.chart.labels.axis.yLabel"
                :fill="FINAL_CONFIG.style.chart.labels.axis.color"
                :font-size="FINAL_CONFIG.style.chart.labels.axis.fontSize"
                :transform="`translate(${FINAL_CONFIG.style.chart.labels.axis.fontSize + FINAL_CONFIG.style.chart.labels.axis.yLabelOffsetX}, ${drawingArea.top + drawingArea.height / 2}) rotate(-90)`"
                text-anchor="middle"
            >
                {{ FINAL_CONFIG.style.chart.labels.axis.yLabel }}
            </text>
            <!-- X AXIS NAME -->
            <text 
                v-if="FINAL_CONFIG.style.chart.labels.axis.xLabel"
                :fill="FINAL_CONFIG.style.chart.labels.axis.color"
                :font-size="FINAL_CONFIG.style.chart.labels.axis.fontSize"
                :x="drawingArea.left + drawingArea.width / 2"
                :y="drawingArea.absoluteHeight"
                text-anchor="middle"
            >
                {{ FINAL_CONFIG.style.chart.labels.axis.xLabel }}
            </text>

            <template v-if="selectedDatapoint">
                <line
                    :x1="drawingArea.left"
                    :x2="drawingArea.right"
                    :y1="selectedDatapoint.y"
                    :y2="selectedDatapoint.y"
                    :stroke="selectedDatapoint.color"
                    :stroke-width="1"
                    :class="{ 'select-circle': FINAL_CONFIG.useCssAnimation }"
                />
                <circle
                    :cx="drawingArea.left"
                    :cy="selectedDatapoint.y"
                    :r="3"
                    :fill="selectedDatapoint.color"
                    :class="{ 'select-circle': FINAL_CONFIG.useCssAnimation }"
                />
                <circle
                    :cx="drawingArea.right"
                    :cy="selectedDatapoint.y"
                    :r="3"
                    :fill="selectedDatapoint.color"
                    :class="{ 'select-circle': FINAL_CONFIG.useCssAnimation }"
                />
            </template>

            <!-- PLOTS -->
            <defs>
                <radialGradient v-for="ds in mutableDataset" :id="ds.id" fy="30%">
                    <stop offset="10%" :stop-color="lightenHexColor(ds.color, FINAL_CONFIG.style.chart.plots.gradient.intensity / 100)"/>
                    <stop offset="90%" :stop-color="darkenHexColor(ds.color, 0.1)"/>
                    <stop offset="100%" :stop-color="ds.color"/>
                </radialGradient>
            </defs>
            <template v-for="(ds, S) in drawableDataset">
                <!--FIXME: Animation only works on circles, as y is direct and dynamic whereas other shapes build paths -->
                <Shape 
                    v-for="(plot, i) in ds.plots"
                    :plot="{ x:plot.x, y: animationStarted ? plot.y : drawingArea.top }"
                    :radius="selectedDatapoint && selectedDatapoint.id === plot.id ? plotRadius * 1.5 : plotRadius"
                    :shape="FINAL_CONFIG.style.chart.plots.shape"
                    :stroke="FINAL_CONFIG.style.chart.plots.stroke"
                    :strokeWidth="FINAL_CONFIG.style.chart.plots.strokeWidth"
                    :color="FINAL_CONFIG.style.chart.plots.gradient.show ? `url(#${ds.id})` : ds.color"
                    @mouseenter="useTooltip({ datapoint: plot, seriesIndex: i })"
                    @mouseleave="isTooltip = false; selectedDatapoint = null"
                    @click="emit('selectDatapoint', plot)"
                    :style="`transition: all 0.2s ease-in-out; opacity:${selectedDatapoint ? selectedDatapoint.id === plot.id ? 1 : 0.2 : FINAL_CONFIG.style.chart.plots.opacity};${animationActive ? `transition-delay:${i * 50}ms` : ''}`"
                    :class="{ 'vue-ui-strip-plot-animated': FINAL_CONFIG.useCssAnimation && animationActive, 'vue-ui-strip-plot-select-circle': FINAL_CONFIG.useCssAnimation && !animationActive}"
                    v-bind="$attrs"
                />

                <!-- BEST PLOT LABELS -->
                <g v-if="mutableConfig.dataLabels.show">
                    <template v-for="(plot, i) in ds.plots">
                        <text 
                            v-if="i === ds.plots.length - 1 || (selectedDatapoint && selectedDatapoint.id === plot.id && !mutableConfig.showTooltip)"
                            :x="plot.x"
                            :y="plot.y + FINAL_CONFIG.style.chart.labels.bestPlotLabel.offsetY - plotRadius * (selectedDatapoint && selectedDatapoint.id === plot.id && !mutableConfig.showTooltip ? 2 : 1.5)"
                            :font-size="FINAL_CONFIG.style.chart.labels.bestPlotLabel.fontSize"
                            :fill="FINAL_CONFIG.style.chart.labels.bestPlotLabel.color"
                            text-anchor="middle"
                            :style="`opacity:${FINAL_CONFIG.useCssAnimation ? animationActive ? 0 : 1 : 1};transition:opacity 0.2s ease-in;`"
                        >
                            {{ plot.name }} {{ FINAL_CONFIG.style.chart.labels.bestPlotLabel.showValue ? applyDataLabel(
                                FINAL_CONFIG.style.chart.labels.formatter,
                                plot.value,
                                dataLabel({
                                    p: `(${FINAL_CONFIG.style.chart.labels.prefix}`,
                                    v: plot.value,
                                    s: `${FINAL_CONFIG.style.chart.labels.suffix})`,
                                    r: FINAL_CONFIG.style.chart.labels.bestPlotLabel.rounding
                                }),
                                { datapoint: plot, seriesIndex: i }
                            ) : '' }}
                        </text>
                    </template>
                </g>
            </template>
            <slot name="svg" :svg="drawingArea"/>
        </svg>

        <div v-if="$slots.watermark" class="vue-data-ui-watermark">
            <slot name="watermark" v-bind="{ isPrinting: isPrinting || isImaging }"/>
        </div>

        <Skeleton 
            v-if="!isDataset"
            :config="{
                type: 'stripPlot',
                style: {
                    backgroundColor: FINAL_CONFIG.style.chart.backgroundColor,
                    stripPlot: {
                        color: '#CCCCCC',
                    }
                }
            }"
        />

        <Tooltip
            :show="mutableConfig.showTooltip && isTooltip"
            :backgroundColor="FINAL_CONFIG.style.chart.tooltip.backgroundColor"
            :color="FINAL_CONFIG.style.chart.tooltip.color"
            :borderRadius="FINAL_CONFIG.style.chart.tooltip.borderRadius"
            :borderColor="FINAL_CONFIG.style.chart.tooltip.borderColor"
            :borderWidth="FINAL_CONFIG.style.chart.tooltip.borderWidth"
            :fontSize="FINAL_CONFIG.style.chart.tooltip.fontSize"
            :backgroundOpacity="FINAL_CONFIG.style.chart.tooltip.backgroundOpacity"
            :position="FINAL_CONFIG.style.chart.tooltip.position"
            :offsetY="FINAL_CONFIG.style.chart.tooltip.offsetY"
            :parent="stripPlotChart"
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

        <Accordion hideDetails v-if="isDataset" :config="{
            open: mutableConfig.showTable,
            maxHeight: 10000,
            body: {
                backgroundColor: FINAL_CONFIG.style.chart.backgroundColor,
                color: FINAL_CONFIG.style.chart.color,
            },
            head: {
                backgroundColor: FINAL_CONFIG.style.chart.backgroundColor,
                color: FINAL_CONFIG.style.chart.color,
            }
        }">
            <template #content>
                <DataTable
                    :key="`table_${tableStep}`"
                    :colNames="dataTable.colNames"
                    :head="dataTable.head" 
                    :body="dataTable.body"
                    :config="dataTable.config"
                    :title="`${FINAL_CONFIG.style.chart.title.text}${FINAL_CONFIG.style.chart.title.subtitle.text ? ` : ${FINAL_CONFIG.style.chart.title.subtitle.text}` : ''}`"
                    @close="mutableConfig.showTable = false"
                >
                    <template #th="{ th }">
                        <div v-html="th" style="display:flex;align-items:center"></div>
                    </template>
                    <template #td="{ td }">
                        {{ td.name || td }}
                    </template>
                </DataTable>
            </template>
        </Accordion>
    </div>
</template>

<style scoped>
@import "../vue-data-ui.css";

.vue-ui-strip-plot {
    user-select: none;
    position: relative;
}
</style>

<style>
.vue-ui-strip-plot-animated * {
    transition-property: cy, opacity ;
    transition-duration: 0.3s ;
}
.vue-ui-strip-plot-select-circle * {
    transition: all 0.1s ease-in-out !important;
}
</style>