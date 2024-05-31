<script setup>
import { ref, computed, nextTick, onMounted } from "vue";
import { 
    XMLNS,
    calculateNiceScale,
    convertColorToHex,
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
} from "../lib";
import pdf from "../pdf";
import img from "../img";
import mainConfig from "../default_configs.json";
import Title from "../atoms/Title.vue";
import { useNestedProp } from "../useNestedProp";
import UserOptions from "../atoms/UserOptions.vue";
import Tooltip from "../atoms/Tooltip.vue";
import DataTable from "../atoms/DataTable.vue";
import Skeleton from "./vue-ui-skeleton.vue";
import Shape from "../atoms/Shape.vue";

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

const animationStarted = ref(false);

onMounted(() => {
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
    animationStarted.value = true;
    setTimeout(() => {
        animationActive.value = false;
    }, maxSeries.value * 50)
});

const uid = ref(createUid());
const defaultConfig = ref(mainConfig.vue_ui_strip_plot);
const isPrinting = ref(false);
const isImaging = ref(false);
const stripPlotChart = ref(null);
const step = ref(0);
const isTooltip = ref(false);
const tooltipContent = ref("");

const stripConfig = computed(() => {
    return useNestedProp({
        userConfig: props.config,
        defaultConfig: defaultConfig.value
    });
});
const animationActive = ref(stripConfig.value.useCssAnimation);
const mutableConfig = ref({
    showTable: stripConfig.value.table.show,
});

const drawingArea = computed(() => {
    const stripWidth = stripConfig.value.style.chart.stripWidth;
    const absoluteWidth = stripWidth * props.dataset.length + stripConfig.value.style.chart.padding.left + stripConfig.value.style.chart.padding.right;
    const absoluteHeight = stripConfig.value.style.chart.height;

    return {
        left: stripConfig.value.style.chart.padding.left,
        right: absoluteWidth - stripConfig.value.style.chart.padding.right,
        top: stripConfig.value.style.chart.padding.top,
        bottom: absoluteHeight - stripConfig.value.style.chart.padding.bottom,
        width: stripWidth * props.dataset.length,
        height: absoluteHeight - stripConfig.value.style.chart.padding.top - stripConfig.value.style.chart.padding.bottom,
        stripWidth,
        absoluteHeight,
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
            color: ds.color ? convertColorToHex(ds.color) : palette[i] || palette[i % palette.length],
            plots: ds.plots.map(p => {
                return {
                    ...p,
                    parentId: id,
                    color: ds.color ? convertColorToHex(ds.color) : palette[i] || palette[i % palette.length],
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
    return calculateNiceScale(extremes.value.min < 0 ? extremes.value.min : 0, extremes.value.max, stripConfig.value.style.chart.grid.scaleSteps);
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
    dataTooltipSlot.value = { datapoint, seriesIndex, config: stripConfig.value, series: immutableDataset.value };
    isTooltip.value = true;
    selectedDatapoint.value = datapoint;

    const customFormat = stripConfig.value.style.chart.tooltip.customFormat;

    if(isFunction(customFormat) && functionReturnsString(() => customFormat({
        seriesIndex,
        datapoint,
        series: immutableDataset.value,
        config: stripConfig.value
    }))) {
        tooltipContent.value = customFormat({
            seriesIndex,
            datapoint,
            series: immutableDataset.value,
            config: stripConfig.value
        });
    } else {
        let html = "";

        html += `<div style="display:flex;flex-direction:row;gap:6px;align-items:center;"><svg viewBox="0 0 12 12" height="14" width="14"><circle data-cy="donut-tooltip-marker" cx="6" cy="6" r="6" stroke="none" fill="${stripConfig.value.style.chart.plots.gradient.show ? `url(#${datapoint.parentId})` : datapoint.color}"/></svg>${datapoint.name}</div>`;
        html += `<div>${dataLabel({
            p: stripConfig.value.style.chart.labels.prefix,
            v: datapoint.value,
            s: stripConfig.value.style.chart.labels.suffix,
            r: stripConfig.value.style.chart.tooltip.roundingValue
        })}</div>`

        tooltipContent.value = `<div>${html}</div>`
    }
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
            domElement: document.getElementById(`strip-plot_${uid.value}`),
            fileName: stripConfig.value.style.chart.title.text || 'vue-ui-strip-plot'
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
            domElement: document.getElementById(`strip-plot_${uid.value}`),
            fileName: stripConfig.value.style.chart.title.text || 'vue-ui-strip-plot',
            format: 'png'
        }).finally(() => {
            isImaging.value = false;
        })
    }, 100)
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
        const tableXls = [[stripConfig.value.style.chart.title.text],[stripConfig.value.style.chart.title.subtitle.text],[[stripConfig.value.table.columnNames.series],[stripConfig.value.table.columnNames.value]]].concat(labels);

        const csvContent = createCsvContent(tableXls);
        downloadCsv({ csvContent, title: stripConfig.value.style.chart.title.text || "vue-ui-strip-plot" })
    });
}


const dataTable = computed(() => {
    const head = [
        stripConfig.value.table.columnNames.series,
        stripConfig.value.table.columnNames.value,
    ];
    const body = table.value.head.map((h,i) => {
        const label = dataLabel({
            p: stripConfig.value.style.chart.labels.prefix,
            v: table.value.body[i],
            s: stripConfig.value.style.chart.labels.suffix,
            r: stripConfig.value.table.td.roundingValue
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
            backgroundColor: stripConfig.value.table.th.backgroundColor,
            color: stripConfig.value.table.th.color,
            outline: stripConfig.value.table.th.outline
        },
        td: {
            backgroundColor: stripConfig.value.table.td.backgroundColor,
            color: stripConfig.value.table.td.color,
            outline: stripConfig.value.table.td.outline
        },
        breakpoint: stripConfig.value.table.responsiveBreakpoint
    }

    const colNames = [
        stripConfig.value.table.columnNames.series,
        stripConfig.value.table.columnNames.value,
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

defineExpose({
    getData,
    generatePdf,
    generateCsv,
    generateImage
});

</script>

<template>
    <div ref="stripPlotChart" :class="`vue-ui-strip-plot ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''} ${stripConfig.useCssAnimation ? '' : 'vue-ui-dna'}`" :style="`font-family:${stripConfig.style.fontFamily};width:100%; text-align:center;${!stripConfig.style.chart.title.text ? 'padding-top:36px' : ''};background:${stripConfig.style.chart.backgroundColor}`" :id="`strip-plot_${uid}`">

        <div v-if="stripConfig.style.chart.title.text" :style="`width:100%;background:${stripConfig.style.chart.backgroundColor};padding-bottom:24px`">
            <!-- TITLE AS DIV -->
            <Title
                :config="{
                    title: {
                        cy: 'donut-div-title',
                        text: stripConfig.style.chart.title.text,
                        color: stripConfig.style.chart.title.color,
                        fontSize: stripConfig.style.chart.title.fontSize,
                        bold: stripConfig.style.chart.title.bold
                    },
                    subtitle: {
                        cy: 'donut-div-subtitle',
                        text: stripConfig.style.chart.title.subtitle.text,
                        color: stripConfig.style.chart.title.subtitle.color,
                        fontSize: stripConfig.style.chart.title.subtitle.fontSize,
                        bold: stripConfig.style.chart.title.subtitle.bold
                    }
                }"
            />
        </div>

        <UserOptions
            ref="details"
            :key="`user_option_${step}`"
            v-if="stripConfig.userOptions.show && isDataset"
            :backgroundColor="stripConfig.style.chart.backgroundColor"
            :color="stripConfig.style.chart.color"
            :isPrinting="isPrinting"
            :isImaging="isImaging"
            :title="stripConfig.userOptions.title"
            :uid="uid"
            hasImg
            hasTable
            hasFullscreen
            :isFullscreen="isFullscreen"
            :chartElement="stripPlotChart"
            @toggleFullscreen="toggleFullscreen"
            @generatePdf="generatePdf"
            @generateCsv="generateCsv"
            @generateImage="generateImage"
            @toggleTable="mutableConfig.showTable = !mutableConfig.showTable"
            @toggleLabels="mutableConfig.dataLabels.show = !mutableConfig.dataLabels.show"
        />

        <svg :xmlns="XMLNS" v-if="isDataset" :class="{ 'vue-data-ui-fullscreen--on': isFullscreen, 'vue-data-ui-fulscreen--off': !isFullscreen }" :viewBox="`0 0 ${drawingArea.absoluteWidth} ${drawingArea.absoluteHeight}`" :style="`max-width:100%; overflow: visible; background:${stripConfig.style.chart.backgroundColor};color:${stripConfig.style.chart.color}`">
            
            <!-- GRID -->
            <g v-if="stripConfig.style.chart.grid.show">
                <!-- H GRID -->
                <g v-if="stripConfig.style.chart.grid.horizontalGrid.show">
                    <line 
                        v-for="l in yLines"
                        :x1="l.x1"
                        :x2="l.x2"
                        :y1="l.y"
                        :y2="l.y"
                        :stroke="stripConfig.style.chart.grid.horizontalGrid.stroke"
                        :stroke-width="stripConfig.style.chart.grid.horizontalGrid.strokeWidth"
                        :stroke-dasharray="stripConfig.style.chart.grid.horizontalGrid.strokeDasharray"
                        stroke-linecap="round"
                    />
                </g>
                <!-- V GRID -->
                <g v-if="stripConfig.style.chart.grid.verticalGrid.show">
                    <line
                        v-for="(l, i) in mutableDataset"
                        :x1="drawingArea.left + ((i+1) * drawingArea.stripWidth)"
                        :x2="drawingArea.left + ((i+1) * drawingArea.stripWidth)"
                        :y1="drawingArea.top"
                        :y2="drawingArea.bottom"
                        :stroke="stripConfig.style.chart.grid.verticalGrid.stroke"
                        :stroke-width="stripConfig.style.chart.grid.verticalGrid.strokeWidth"
                        :stroke-dasharray="stripConfig.style.chart.grid.verticalGrid.strokeDasharray"
                        stroke-linecap="round"
                    />
                </g>
                <!-- Y AXIS -->
                <line
                    :x1="drawingArea.left"
                    :x2="drawingArea.left"
                    :y1="drawingArea.top"
                    :y2="drawingArea.bottom"
                    :stroke="stripConfig.style.chart.grid.stroke"
                    :stroke-width="stripConfig.style.chart.grid.strokeWidth"
                    stroke-linecap="round"
                />
                <!-- X AXIS -->
                <line 
                    :x1="drawingArea.left"
                    :x2="drawingArea.right"
                    :y1="drawingArea.bottom"
                    :y2="drawingArea.bottom"
                    :stroke="stripConfig.style.chart.grid.stroke"
                    :stroke-width="stripConfig.style.chart.grid.strokeWidth"
                    stroke-linecap="round"
                />
            </g>
            <!-- Y AXIS VALUE LABELS -->
            <template v-if="stripConfig.style.chart.labels.yAxisLabels.show">
                <text
                    v-for="label in yLines"
                    :x="label.x1 - stripConfig.style.chart.labels.yAxisLabels.fontSize / 2 + stripConfig.style.chart.labels.yAxisLabels.offsetX"
                    :y="label.y + stripConfig.style.chart.labels.yAxisLabels.fontSize / 3"
                    :fill="stripConfig.style.chart.labels.yAxisLabels.color"
                    :font-size="stripConfig.style.chart.labels.yAxisLabels.fontSize"
                    text-anchor="end"
                >
                    {{  dataLabel({
                        p: stripConfig.style.chart.labels.prefix,
                        v: label.value,
                        s: stripConfig.style.chart.labels.suffix,
                        r: stripConfig.style.chart.labels.yAxisLabels.rounding
                    })  }}
                </text>
            </template>

            <!-- X AXIS LABELS -->
            <template v-if="stripConfig.style.chart.labels.xAxisLabels.show">
                <text
                    v-for="(label, i) in mutableDataset"
                    :x="drawingArea.left + ((i+1) * drawingArea.stripWidth) - drawingArea.stripWidth / 2"
                    :y="drawingArea.bottom + stripConfig.style.chart.labels.xAxisLabels.fontSize * 2  + stripConfig.style.chart.labels.xAxisLabels.offsetY"
                    :font-size="stripConfig.style.chart.labels.xAxisLabels.fontSize"
                    :fill="stripConfig.style.chart.labels.xAxisLabels.color"
                    text-anchor="middle"
                >
                    {{ label.name }}
                </text>
            </template>

            <!-- Y AXIS NAME-->
            <text 
                v-if="stripConfig.style.chart.labels.axis.yLabel"
                :fill="stripConfig.style.chart.labels.axis.color"
                :font-size="stripConfig.style.chart.labels.axis.fontSize"
                :transform="`translate(${stripConfig.style.chart.labels.axis.fontSize + stripConfig.style.chart.labels.axis.yLabelOffsetX}, ${drawingArea.top + drawingArea.height / 2}) rotate(-90)`"
                text-anchor="middle"
            >
                {{ stripConfig.style.chart.labels.axis.yLabel }}
            </text>
            <!-- X AXIS NAME -->
            <text 
                v-if="stripConfig.style.chart.labels.axis.xLabel"
                :fill="stripConfig.style.chart.labels.axis.color"
                :font-size="stripConfig.style.chart.labels.axis.fontSize"
                :x="drawingArea.left + drawingArea.width / 2"
                :y="drawingArea.absoluteHeight"
                text-anchor="middle"
            >
                {{ stripConfig.style.chart.labels.axis.xLabel }}
            </text>

            <template v-if="selectedDatapoint">
                <line
                    :x1="drawingArea.left"
                    :x2="drawingArea.right"
                    :y1="selectedDatapoint.y"
                    :y2="selectedDatapoint.y"
                    :stroke="selectedDatapoint.color"
                    :stroke-width="1"
                    :class="{ 'select-circle': stripConfig.useCssAnimation }"
                />
                <circle
                    :cx="drawingArea.left"
                    :cy="selectedDatapoint.y"
                    :r="3"
                    :fill="selectedDatapoint.color"
                    :class="{ 'select-circle': stripConfig.useCssAnimation }"
                />
                <circle
                    :cx="drawingArea.right"
                    :cy="selectedDatapoint.y"
                    :r="3"
                    :fill="selectedDatapoint.color"
                    :class="{ 'select-circle': stripConfig.useCssAnimation }"
                />
            </template>

            <!-- PLOTS -->
            <defs>
                <radialGradient v-for="ds in mutableDataset" :id="ds.id" fy="30%">
                    <stop offset="10%" :stop-color="lightenHexColor(ds.color, stripConfig.style.chart.plots.gradient.intensity / 100)"/>
                    <stop offset="90%" :stop-color="darkenHexColor(ds.color, 0.1)"/>
                    <stop offset="100%" :stop-color="ds.color"/>
                </radialGradient>
            </defs>
            <template v-for="(ds, S) in drawableDataset">
                <!--FIXME: Animation only works on circles, as y is direct and dynamic whereas other shapes build paths -->
                <Shape 
                    v-for="(plot, i) in ds.plots"
                    :plot="{ x:plot.x, y: animationStarted ? plot.y : drawingArea.top }"
                    :radius="selectedDatapoint && selectedDatapoint.id === plot.id ? stripConfig.style.chart.plots.radius * 1.5 : stripConfig.style.chart.plots.radius"
                    :shape="stripConfig.style.chart.plots.shape"
                    :stroke="stripConfig.style.chart.plots.stroke"
                    :strokeWidth="stripConfig.style.chart.plots.strokeWidth"
                    :color="stripConfig.style.chart.plots.gradient.show ? `url(#${ds.id})` : ds.color"
                    @mouseenter="useTooltip({ datapoint: plot, seriesIndex: i })"
                    @mouseleave="isTooltip = false; selectedDatapoint = null"
                    @click="emit('selectDatapoint', plot)"
                    :style="`opacity:${selectedDatapoint && selectedDatapoint.id === plot.id ? 1 : stripConfig.style.chart.plots.opacity};${animationActive ? `transition-delay:${i * 50}ms` : ''}`"
                    :class="{ 'vue-ui-strip-plot-animated': stripConfig.useCssAnimation && animationActive, 'vue-ui-strip-plot-select-circle': stripConfig.useCssAnimation && !animationActive}"
                    v-bind="$attrs"
                />

                <!-- BEST PLOT LABELS -->
                <g v-if="stripConfig.style.chart.labels.bestPlotLabel.show">
                    <template v-for="(plot, i) in ds.plots">
                        <text 
                            v-if="i === ds.plots.length - 1"
                            :x="plot.x"
                            :y="plot.y + stripConfig.style.chart.labels.bestPlotLabel.offsetY - stripConfig.style.chart.plots.radius * 1.5"
                            :font-size="stripConfig.style.chart.labels.bestPlotLabel.fontSize"
                            :fill="stripConfig.style.chart.labels.bestPlotLabel.color"
                            text-anchor="middle"
                            :style="`opacity:${stripConfig.useCssAnimation ? animationActive ? 0 : 1 : 1};transition:opacity 0.2s ease-in;`"
                        >
                            {{ plot.name }} {{ stripConfig.style.chart.labels.bestPlotLabel.showValue ? dataLabel({
                                p: `(${stripConfig.style.chart.labels.prefix}`,
                                v: plot.value,
                                s: `${stripConfig.style.chart.labels.suffix})`,
                                r: stripConfig.style.chart.labels.bestPlotLabel.rounding
                            }) : '' }}
                        </text>
                    </template>
                </g>
            </template>
            <slot name="svg" :svg="drawingArea"/>
        </svg>

        <Skeleton 
            v-if="!isDataset"
            :config="{
                type: 'stripPlot',
                style: {
                    backgroundColor: stripConfig.style.chart.backgroundColor,
                    stripPlot: {
                        color: '#CCCCCC',
                    }
                }
            }"
        />

        <Tooltip
            :show="stripConfig.style.chart.tooltip.show && isTooltip"
            :backgroundColor="stripConfig.style.chart.tooltip.backgroundColor"
            :color="stripConfig.style.chart.tooltip.color"
            :fontSize="stripConfig.style.chart.tooltip.fontSize"
            :parent="stripPlotChart"
            :content="tooltipContent"
            :isCustom="isFunction(stripConfig.style.chart.tooltip.customFormat)"
        >
            <template #tooltip-before>
                <slot name="tooltip-before" v-bind="{...dataTooltipSlot}"></slot>
            </template>
            <template #tooltip-after>
                <slot name="tooltip-after" v-bind="{...dataTooltipSlot}"></slot>
            </template>
        </Tooltip>

        <DataTable
            v-if="mutableConfig.showTable && isDataset"
            :colNames="dataTable.colNames"
            :head="dataTable.head" 
            :body="dataTable.body"
            :config="dataTable.config"
            :title="`${stripConfig.style.chart.title.text}${stripConfig.style.chart.title.subtitle.text ? ` : ${stripConfig.style.chart.title.subtitle.text}` : ''}`"
        >
            <template #th="{ th }">
                <div v-html="th" style="display:flex;align-items:center"></div>
            </template>
            <template #td="{ td }">
                {{ td.name || td }}
            </template>
        </DataTable>
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