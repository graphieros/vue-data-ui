<script setup>
import { ref, computed, nextTick, onMounted } from "vue";
import { 
    XMLNS,
    calculateNiceScale,
    createCsvContent,
    createUid,
    darkenHexColor,
    dataLabel,
    downloadCsv,
    error,
    getMissingDatasetAttributes,
    objectIsEmpty,
    lightenHexColor,
} from "../lib";
import pdf from "../pdf";
import img from "../img";
import mainConfig from "../default_configs.json";
import Title from "../atoms/Title.vue";
import { useNestedProp } from "../useNestedProp";
import UserOptions from "../atoms/UserOptions.vue";
import DataTable from "../atoms/DataTable.vue";
import Skeleton from "./vue-ui-skeleton.vue";
import Legend from "../atoms/Legend.vue";
import Accordion from "./vue-ui-accordion.vue";

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

onMounted(() => {
    if(objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiDumbbell',
            type: 'dataset'
        })
    } else {
        props.dataset.forEach((ds, i) => {
            getMissingDatasetAttributes({
                datasetObject: ds,
                requiredAttributes: ['name', 'start', 'end']
            }).forEach(attr => {
                isDataset.value = false;
                error({
                    componentName: 'VueUiDumbbell',
                    type: 'datasetSerieAttribute',
                    property: attr,
                    index: i
                })
            })
        });
    }
});

const uid = ref(createUid());
const defaultConfig = ref(mainConfig.vue_ui_dumbbell);
const isPrinting = ref(false);
const isImaging = ref(false);
const dumbbellChart = ref(null);
const step = ref(0);
const isTooltip = ref(false);
const tooltipContent = ref("");

const dumbConfig = computed(() => {
    return useNestedProp({
        userConfig: props.config,
        defaultConfig: defaultConfig.value
    });
});

const mutableConfig = ref({
    showTable: dumbConfig.value.table.show,
});

const immutableDataset = computed(() => {
    return props.dataset.map((ds, i) => {
        return {
            ...ds,
            id: createUid()
        }
    })
});

const extremes = computed(() => {
    return {
        max: Math.max(...immutableDataset.value.flatMap(ds => [ds.start, ds.end])),
        min: Math.min(...immutableDataset.value.flatMap(ds => [ds.start, ds.end]))
    }
});


const scale = computed(() => {
    return calculateNiceScale(extremes.value.min < 0 ? extremes.value.min : 0, extremes.value.max, dumbConfig.value.style.chart.grid.scaleSteps)
});

const drawingArea = computed(() => {
    const rowHeight = dumbConfig.value.style.chart.rowHeight;
    const absoluteWidth = dumbConfig.value.style.chart.padding.left + dumbConfig.value.style.chart.padding.right + dumbConfig.value.style.chart.width;
    const absoluteHeight = dumbConfig.value.style.chart.padding.top + dumbConfig.value.style.chart.padding.bottom + rowHeight * props.dataset.length;
    const widthPlotReference = (scale.value.ticks.length) * (dumbConfig.value.style.chart.width / scale.value.ticks.length)

    return {
        left: dumbConfig.value.style.chart.padding.left,
        right: absoluteWidth - dumbConfig.value.style.chart.padding.right,
        top: dumbConfig.value.style.chart.padding.top,
        bottom: absoluteHeight - dumbConfig.value.style.chart.padding.bottom,
        width: dumbConfig.value.style.chart.width,
        height: rowHeight * props.dataset.length,
        rowHeight,
        absoluteHeight,
        absoluteWidth,
        widthPlotReference
    }
});



function getMutableDataset() {
    return immutableDataset.value.map((ds, i) => {
        const startX = drawingArea.value.left + (((ds.start + Math.abs(scale.value.min)) / (scale.value.max + Math.abs(scale.value.min))) * drawingArea.value.widthPlotReference);
        const endX = drawingArea.value.left + (((ds.end + Math.abs(scale.value.min)) / (scale.value.max + Math.abs(scale.value.min))) * drawingArea.value.widthPlotReference);
        const centerX = startX + ((endX - startX) / 2)
        return {
            ...ds,
            startX,
            endX,
            centerX,
            y: drawingArea.value.top + (i * dumbConfig.value.style.chart.rowHeight) + (dumbConfig.value.style.chart.rowHeight / 2),
            endVal: ds.start
        }
    })
}

const mutableDataset = ref([])

const raf = ref(null);
const grandTotalEnd = computed(() => {
    return immutableDataset.value.map(ds => ds.end).reduce((a, b) => a + b, 0);
});

onMounted(() => {
    mutableDataset.value = getMutableDataset();

    let totalEnd = mutableDataset.value.map(ds => ds.start).reduce((a, b) => a + b, 0);

    function anim() {
        const diffs = immutableDataset.value.map(ds => {
            return ds.end - ds.start
        })

        if(totalEnd >= grandTotalEnd.value) {
            cancelAnimationFrame(raf.value);
            mutableDataset.value = getMutableDataset();
        } else {
            mutableDataset.value = mutableDataset.value.map((ds, i) => {
                ds.endVal += diffs[i] * (dumbConfig.value.animationSpeed / 100);
                const startX = drawingArea.value.left + (((ds.start + Math.abs(scale.value.min)) / (scale.value.max + Math.abs(scale.value.min))) * drawingArea.value.widthPlotReference);
                const endX = drawingArea.value.left + (((ds.endVal + Math.abs(scale.value.min)) / (scale.value.max + Math.abs(scale.value.min))) * drawingArea.value.widthPlotReference);
                const centerX = startX + ((endX - startX) / 2)
                return {
                    ...ds,
                    startX,
                    endX,
                    centerX,
                    y: drawingArea.value.top + (i * dumbConfig.value.style.chart.rowHeight) + (dumbConfig.value.style.chart.rowHeight / 2),
                    endVal: ds.endVal
                }
            })
            totalEnd = mutableDataset.value.map(ds => ds.endVal).reduce((a, b) => a + b, 0);
            raf.value = requestAnimationFrame(anim)
        }
    }
    if(dumbConfig.value.useAnimation) {
        anim()
    } else {
        mutableDataset.value = getMutableDataset()
    }
})

const legendSet = computed(() => {
    return [
        { name: dumbConfig.value.style.chart.legend.labelStart, color: dumbConfig.value.style.chart.plots.gradient.show ? `url(#start_grad_${uid.value})` : dumbConfig.value.style.chart.plots.startColor},
        { name: dumbConfig.value.style.chart.legend.labelEnd, color: dumbConfig.value.style.chart.plots.gradient.show ? `url(#end_grad_${uid.value})` : dumbConfig.value.style.chart.plots.endColor},
    ]
})

const legendConfig = computed(() => {
    return {
        cy: 'donut-div-legend',
        backgroundColor: dumbConfig.value.style.chart.legend.backgroundColor,
        color: dumbConfig.value.style.chart.legend.color,
        fontSize: dumbConfig.value.style.chart.legend.fontSize,
        paddingBottom: 12,
        paddingTop: 12,
        fontWeight: dumbConfig.value.style.chart.legend.bold ? 'bold' : ''
    }
});

const table = computed(() => {
    const head = mutableDataset.value.map(ds => {
        return {
            name: ds.name,
        }
    });
    const body = mutableDataset.value.map(ds => {
        return {
            start: ds.start,
            end: ds.end
        }
    });
    return { head, body }
});

const dataTable = computed(() => {
    const head = [
        dumbConfig.value.table.columnNames.series,
        dumbConfig.value.table.columnNames.start,
        dumbConfig.value.table.columnNames.end,
        dumbConfig.value.table.columnNames.progression
    ];
    const body = table.value.head.map((h,i) => {
        const labelStart = dataLabel({
            p: dumbConfig.value.style.chart.labels.prefix,
            v: table.value.body[i].start,
            s: dumbConfig.value.style.chart.labels.suffix,
            r: dumbConfig.value.table.td.roundingValue
        });
        const labelEnd = dataLabel({
            p: dumbConfig.value.style.chart.labels.prefix,
            v: table.value.body[i].end,
            s: dumbConfig.value.style.chart.labels.suffix,
            r: dumbConfig.value.table.td.roundingValue
        });
        const labelProgression = dataLabel({
            v: 100 * ((table.value.body[i].end / table.value.body[i].start) - 1),
            s: '%',
            r: dumbConfig.value.table.td.roundingPercentage
        })
        return [
            { name: h.name },
            labelStart,
            labelEnd,
            labelProgression
        ]
    });

    const config = {
        th: {
            backgroundColor: dumbConfig.value.table.th.backgroundColor,
            color: dumbConfig.value.table.th.color,
            outline: dumbConfig.value.table.th.outline
        },
        td: {
            backgroundColor: dumbConfig.value.table.td.backgroundColor,
            color: dumbConfig.value.table.td.color,
            outline: dumbConfig.value.table.td.outline
        },
        breakpoint: dumbConfig.value.table.responsiveBreakpoint
    }

    const colNames = [
        dumbConfig.value.table.columnNames.series,
        dumbConfig.value.table.columnNames.start,
        dumbConfig.value.table.columnNames.end,
        dumbConfig.value.table.columnNames.progression
    ];

    return {
        colNames,
        head,
        body,
        config
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
            domElement: document.getElementById(`dumbbell_${uid.value}`),
            fileName: dumbConfig.value.style.chart.title.text || 'vue-ui-dumbbell'
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
            domElement: document.getElementById(`dumbbell_${uid.value}`),
            fileName: dumbConfig.value.style.chart.title.text || 'vue-ui-dumbbell',
            format: 'png'
        }).finally(() => {
            isImaging.value = false;
        })
    }, 100)
}

function generateCsv() {
    nextTick(() => {
        const labels = table.value.head.map((h,i) => {
            return [[
                h.name
            ],[table.value.body[i].start],[table.value.body[i].end]]
        });
        const tableXls = [[dumbConfig.value.style.chart.title.text],[dumbConfig.value.style.chart.title.subtitle.text],[[dumbConfig.value.table.columnNames.series],[dumbConfig.value.table.columnNames.start],[dumbConfig.value.table.columnNames.end]]].concat(labels);

        const csvContent = createCsvContent(tableXls);
        downloadCsv({ csvContent, title: dumbConfig.value.style.chart.title.text || "vue-ui-dumbbell" })
    });
}

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
    <div ref="dumbbellChart" :class="`vue-ui-dumbbell ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''}`" :style="`font-family:${dumbConfig.style.fontFamily};width:100%; text-align:center;${!dumbConfig.style.chart.title.text ? 'padding-top:36px' : ''};background:${dumbConfig.style.chart.backgroundColor}`" :id="`dumbbell_${uid}`">

        <div v-if="dumbConfig.style.chart.title.text" :style="`width:100%;background:${dumbConfig.style.chart.backgroundColor};padding-bottom:24px`">
            <Title
                :config="{
                    title: {
                        cy: 'donut-div-title',
                        text: dumbConfig.style.chart.title.text,
                        color: dumbConfig.style.chart.title.color,
                        fontSize: dumbConfig.style.chart.title.fontSize,
                        bold: dumbConfig.style.chart.title.bold
                    },
                    subtitle: {
                        cy: 'donut-div-subtitle',
                        text: dumbConfig.style.chart.title.subtitle.text,
                        color: dumbConfig.style.chart.title.subtitle.color,
                        fontSize: dumbConfig.style.chart.title.subtitle.fontSize,
                        bold: dumbConfig.style.chart.title.subtitle.bold
                    }
                }"
            />
        </div>

        <UserOptions
            ref="details"
            :key="`user_option_${step}`"
            v-if="dumbConfig.userOptions.show && isDataset"
            :backgroundColor="dumbConfig.style.chart.backgroundColor"
            :color="dumbConfig.style.chart.color"
            :isPrinting="isPrinting"
            :isImaging="isImaging"
            :title="dumbConfig.userOptions.title"
            :uid="uid"
            hasImg
            hasTable
            hasFullscreen
            :isFullscreen="isFullscreen"
            :chartElement="dumbbellChart"
            @toggleFullscreen="toggleFullscreen"
            @generatePdf="generatePdf"
            @generateCsv="generateCsv"
            @generateImage="generateImage"
            @toggleTable="mutableConfig.showTable = !mutableConfig.showTable"
        />

        <svg :xmlns="XMLNS" v-if="isDataset" :class="{ 'vue-data-ui-fullscreen--on': isFullscreen, 'vue-data-ui-fulscreen--off': !isFullscreen }" :viewBox="`0 0 ${drawingArea.absoluteWidth} ${drawingArea.absoluteHeight}`" :style="`max-width:100%; overflow: visible; background:${dumbConfig.style.chart.backgroundColor};color:${dumbConfig.style.chart.color}`">
            <!-- VERTICAL GRID -->
            <g v-if="dumbConfig.style.chart.grid.verticalGrid.show">

                <line
                    v-for="(_, i) in scale.ticks"
                    :x1="drawingArea.left + ((i) * drawingArea.width / (scale.ticks.length - 1))"
                    :x2="drawingArea.left + ((i) * drawingArea.width / (scale.ticks.length - 1))"
                    :y1="drawingArea.top"
                    :y2="drawingArea.bottom"
                    :stroke="dumbConfig.style.chart.grid.verticalGrid.stroke"
                    :stroke-width="dumbConfig.style.chart.grid.verticalGrid.strokeWidth"
                    :stroke-dasharray="dumbConfig.style.chart.grid.verticalGrid.strokeDasharray"
                />
            </g>
            <!-- HORIZONTAL GRID -->
            <g v-if="dumbConfig.style.chart.grid.horizontalGrid.show">
                <line
                    v-for="(_, i) in immutableDataset"
                    :x1="drawingArea.left"
                    :x2="drawingArea.right"
                    :y1="drawingArea.top + (i * dumbConfig.style.chart.rowHeight)"
                    :y2="drawingArea.top + (i * dumbConfig.style.chart.rowHeight)"
                    :stroke="dumbConfig.style.chart.grid.horizontalGrid.stroke"
                    :stroke-width="dumbConfig.style.chart.grid.horizontalGrid.strokeWidth"
                    :stroke-dasharray="dumbConfig.style.chart.grid.horizontalGrid.strokeDasharray"
                />
                <line
                    :x1="drawingArea.left"
                    :x2="drawingArea.right"
                    :y1="drawingArea.bottom"
                    :y2="drawingArea.bottom"
                    :stroke="dumbConfig.style.chart.grid.horizontalGrid.stroke"
                    :stroke-width="dumbConfig.style.chart.grid.horizontalGrid.strokeWidth"
                    :stroke-dasharray="dumbConfig.style.chart.grid.horizontalGrid.strokeDasharray"
                />
            </g>
            <!-- Y AXIS LABELS -->
            <g v-if="dumbConfig.style.chart.labels.yAxisLabels.show">
                <text
                    v-for="(datapoint, i) in immutableDataset"
                    :x="drawingArea.left - 6 + dumbConfig.style.chart.labels.yAxisLabels.offsetX"
                    :y="drawingArea.top + (i * dumbConfig.style.chart.rowHeight) + (dumbConfig.style.chart.labels.yAxisLabels.showProgression ? dumbConfig.style.chart.rowHeight / 3 : dumbConfig.style.chart.rowHeight / 2) + (dumbConfig.style.chart.labels.yAxisLabels.fontSize / 3)"
                    :font-size="dumbConfig.style.chart.labels.yAxisLabels.fontSize"
                    :fill="dumbConfig.style.chart.labels.yAxisLabels.color"
                    :font-weight="dumbConfig.style.chart.labels.yAxisLabels.bold ? 'bold': 'normal'"
                    text-anchor="end"
                >
                    {{ datapoint.name }}
                </text>
                <template v-if="dumbConfig.style.chart.labels.yAxisLabels.showProgression">
                    <text
                        v-for="(datapoint, i) in immutableDataset"
                        :x="drawingArea.left - 6 + dumbConfig.style.chart.labels.yAxisLabels.offsetX"
                        :y="drawingArea.top + (i * dumbConfig.style.chart.rowHeight) + (dumbConfig.style.chart.rowHeight / 1.3) + (dumbConfig.style.chart.labels.yAxisLabels.fontSize / 3)"
                        :font-size="dumbConfig.style.chart.labels.yAxisLabels.fontSize"
                        :fill="dumbConfig.style.chart.labels.yAxisLabels.color"
                        text-anchor="end"
                    >
                        {{ dataLabel({
                            v: 100 * ((datapoint.end / datapoint.start) - 1),
                            s: '%',
                            r: dumbConfig.style.chart.labels.yAxisLabels.rounding
                        }) }}
                    </text>
                </template>
            </g>
            <!-- X AXIS LABELS -->
            <g v-if="dumbConfig.style.chart.labels.xAxisLabels.show">
                <text
                    v-for="(tick, i) in scale.ticks"
                    :x="drawingArea.left + (i * (drawingArea.width / (scale.ticks.length - 1)))"
                    :y="drawingArea.bottom + dumbConfig.style.chart.labels.xAxisLabels.fontSize + dumbConfig.style.chart.labels.xAxisLabels.offsetY"
                    :font-size="dumbConfig.style.chart.labels.xAxisLabels.fontSize"
                    :fill="dumbConfig.style.chart.labels.xAxisLabels.color"
                    :font-weight="dumbConfig.style.chart.labels.xAxisLabels.bold ? 'bold': 'normal'"
                    text-anchor="middle"
                >
                    {{ dataLabel({
                        p: dumbConfig.style.chart.labels.prefix,
                        v: tick,
                        s: dumbConfig.style.chart.labels.suffix,
                        r: dumbConfig.style.chart.labels.xAxisLabels.rounding
                    }) }}
                </text>
            </g>

            <!-- PLOTS -->
            <defs>
                <radialGradient :id="`start_grad_${uid}`" fy="30%">
                    <stop offset="10%" :stop-color="lightenHexColor(dumbConfig.style.chart.plots.startColor, dumbConfig.style.chart.plots.gradient.intensity / 100)"/>
                    <stop offset="90%" :stop-color="darkenHexColor(dumbConfig.style.chart.plots.startColor, 0.1)"/>
                    <stop offset="100%" :stop-color="dumbConfig.style.chart.plots.startColor"/>
                </radialGradient>
                <radialGradient :id="`end_grad_${uid}`" fy="30%">
                    <stop offset="10%" :stop-color="lightenHexColor(dumbConfig.style.chart.plots.endColor, dumbConfig.style.chart.plots.gradient.intensity / 100)"/>
                    <stop offset="90%" :stop-color="darkenHexColor(dumbConfig.style.chart.plots.endColor, 0.1)"/>
                    <stop offset="100%" :stop-color="dumbConfig.style.chart.plots.endColor"/>
                </radialGradient>
            </defs>
            <g v-for="(plot, i) in mutableDataset">
                <!-- LINK -->
                <defs>
                    <linearGradient :id="`grad_positive_${uid}`" x1="0%" x2="100%" y1="0%" y2="0%">
                        <stop offset="0%" :stop-color="dumbConfig.style.chart.plots.startColor"/>
                        <stop offset="100%" :stop-color="dumbConfig.style.chart.plots.endColor"/>
                    </linearGradient>
                    <linearGradient :id="`grad_negative_${uid}`" x1="0%" x2="100%" y1="0%" y2="0%">
                        <stop offset="0%" :stop-color="dumbConfig.style.chart.plots.endColor"/>
                        <stop offset="100%" :stop-color="dumbConfig.style.chart.plots.startColor"/>
                    </linearGradient>
                </defs>
                <g v-if="dumbConfig.style.chart.plots.link.type === 'curved'">
                    <path 
                        :d="`M 
                            ${plot.startX},${plot.y + dumbConfig.style.chart.plots.radius / 2} 
                            C ${plot.centerX},${plot.y} ${plot.centerX},${plot.y} 
                            ${plot.endX},${plot.y + dumbConfig.style.chart.plots.radius / 2}
                            L ${plot.endX},${plot.y - dumbConfig.style.chart.plots.radius / 2}
                            C ${plot.centerX},${plot.y} ${plot.centerX},${plot.y}
                            ${plot.startX},${plot.y - dumbConfig.style.chart.plots.radius / 2}
                            Z
                        `"
                        :fill="plot.endX > plot.startX ? `url(#grad_positive_${uid})`: `url(#grad_negative_${uid})`"
                    />
                </g>
                <g v-else>
                    <rect
                        :x="plot.endX > plot.startX ? plot.startX : plot.endX"
                        :y="plot.y - (dumbConfig.style.chart.plots.link.strokeWidth / 2)"
                        :height="dumbConfig.style.chart.plots.link.strokeWidth"
                        :width="Math.abs(plot.endX - plot.startX)"
                        :fill="plot.endX > plot.startX ? `url(#grad_positive_${uid})`: `url(#grad_negative_${uid})`"
                    />
                </g>

                <!-- START -->
                <circle
                    :cx="plot.startX"
                    :cy="plot.y"
                    :r="dumbConfig.style.chart.plots.radius"
                    :fill="dumbConfig.style.chart.plots.gradient.show ? `url(#start_grad_${uid})` : dumbConfig.style.chart.plots.startColor"
                    :stroke="dumbConfig.style.chart.plots.stroke"
                    :stroke-width="dumbConfig.style.chart.plots.strokeWidth"
                    
                />
                <!-- END -->
                <circle
                    :cx="plot.endX"
                    :cy="plot.y"
                    :r="dumbConfig.style.chart.plots.radius"
                    :fill="dumbConfig.style.chart.plots.gradient.show ? `url(#end_grad_${uid})` : dumbConfig.style.chart.plots.endColor"
                    :stroke="dumbConfig.style.chart.plots.stroke"
                    :stroke-width="dumbConfig.style.chart.plots.strokeWidth"
                    
                />

                <!-- START LABELS -->
                <g v-if="dumbConfig.style.chart.labels.startLabels.show">
                    <text
                        v-for="(plot, i) in mutableDataset"
                        :x="plot.startX"
                        :y="drawingArea.top + ((i + 1) * dumbConfig.style.chart.rowHeight) - (dumbConfig.style.chart.labels.startLabels.fontSize / 3) + dumbConfig.style.chart.labels.startLabels.offsetY"
                        :fill="dumbConfig.style.chart.labels.startLabels.useStartColor ? dumbConfig.style.chart.plots.startColor : dumbConfig.style.chart.labels.startLabels.color"
                        :font-size="dumbConfig.style.chart.labels.startLabels.fontSize"
                        text-anchor="middle"
                        
                    >
                        {{ dataLabel({
                            p: dumbConfig.style.chart.labels.prefix,
                            v: plot.start,
                            s: dumbConfig.style.chart.labels.suffix,
                            r: dumbConfig.style.chart.labels.startLabels.rounding
                        }) }}
                    </text>
                </g>
                <!-- END LABELS -->
                <g v-if="dumbConfig.style.chart.labels.endLabels.show">
                    <text
                        v-for="(plot, i) in mutableDataset"
                        :x="plot.endX"
                        :y="drawingArea.top + (i * dumbConfig.style.chart.rowHeight) + dumbConfig.style.chart.labels.endLabels.fontSize + dumbConfig.style.chart.labels.endLabels.offsetY"
                        :fill="dumbConfig.style.chart.labels.endLabels.useEndColor ? dumbConfig.style.chart.plots.endColor : dumbConfig.style.chart.labels.endLabels.color"
                        :font-size="dumbConfig.style.chart.labels.endLabels.fontSize"
                        text-anchor="middle"
                        
                    >
                        {{ dataLabel({
                            p: dumbConfig.style.chart.labels.prefix,
                            v: plot.end,
                            s: dumbConfig.style.chart.labels.suffix,
                            r: dumbConfig.style.chart.labels.endLabels.rounding
                        }) }}
                    </text>
                </g>
            </g>
            <slot name="svg" :svg="drawingArea"/>
        </svg>

        <Skeleton 
            v-if="!isDataset"
            :config="{
                type: 'dumbbell',
                style: {
                    backgroundColor: dumbConfig.style.chart.backgroundColor,
                    dumbbell: {
                        color: '#CCCCCC'
                    }
                }
            }"
        />
        
        <Legend
            v-if="dumbConfig.style.chart.legend.show && isDataset"
            :legendSet="legendSet"
            :config="legendConfig"
        >
            <template #item="{ legend }">
                <div :style="`display:flex;align-items:center;gap:4px;font-size:${dumbConfig.style.chart.legend.fontSize}px`">
                    <svg :xmlns="XMLNS" viewBox="0 0 20 20" :height="dumbConfig.style.chart.legend.fontSize" :width="dumbConfig.style.chart.legend.fontSize">
                        <circle :cx="10" :cy="10" :r="9" :fill="legend.color"/>
                    </svg>
                    {{ legend.name }}
                </div>
            </template>
        </Legend>

        <slot name="legend" v-bind:legend="legendSet" />

        <Accordion hideDetails v-if="isDataset" :config="{
            open: mutableConfig.showTable,
            maxHeight: 10000
        }">
            <template #content>
                <DataTable
                    :colNames="dataTable.colNames"
                    :head="dataTable.head" 
                    :body="dataTable.body"
                    :config="dataTable.config"
                    :title="`${dumbConfig.style.chart.title.text}${dumbConfig.style.chart.title.subtitle.text ? ` : ${dumbConfig.style.chart.title.subtitle.text}` : ''}`"
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

.vue-ui-dumbbell * {
    transition: unset;
}

.vue-ui-dumbbell {
    user-select: none;
    position: relative;
}
</style>