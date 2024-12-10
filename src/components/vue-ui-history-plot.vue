<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import { useConfig } from "../useConfig";
import { 
XMLNS,
calculateNiceScale,
convertColorToHex,
    convertCustomPalette, 
    createUid, 
    error, 
    getMissingDatasetAttributes, 
    hasDeepProperty, 
    objectIsEmpty, 
    palette, 
    themePalettes 
} from "../lib";
import { useNestedProp } from "../useNestedProp";
import themes from "../themes.json";
import { usePrinter } from "../usePrinter";
import PackageVersion from "../atoms/PackageVersion.vue";

const { vue_ui_history_plot: DEFAULT_CONFIG } = useConfig();

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

const historyPlotChart = ref(null);
const chartTitle = ref(null);
const titleStep = ref(0);
const chartLegend = ref(null);
const legendStep = ref(0);
const tableStep = ref(0);
const step = ref(0);
const resizeObserver = ref(null);
const noTitle = ref(null);
const uid = ref(createUid());
const isTooltip = ref(false);
const tooltipContent = ref('');
const segregated = ref([]);
const isFullscreen = ref(false);

const isDataset = computed({
    get: () => {
        return !!props.dataset && props.dataset.length
    },
    set: (bool) => {
        return bool;
    }
});

onMounted(prepareChart);

onBeforeUnmount(() => {
    if (resizeObserver.value) resizeObserver.value.disconnect();
});

function prepareChart() {
    if (objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiHistoryPlot',
            type: 'dataset'
        });
    } else {
        props.dataset.forEach((ds, i) => {
            getMissingDatasetAttributes({
                datasetObject: ds,
                requiredAttributes: ['name', 'values']
            }).forEach(attr => {
                isDataset.value = false;
                error({
                    componentName: 'VueUiHistoryPlot',
                    type: 'datasetSerieAttribute',
                    property: attr,
                    index: i
                });
            });
        });
    }

    // TODO: responsive
}

function prepareConfig() {
    const mergedConfig = useNestedProp({
        userConfig: props.config,
        defaultConfig: DEFAULT_CONFIG
    });
    let finalConfig = {};
    if (mergedConfig.theme) {
        finalConfig = {
            ...useNestedProp({
                userConfig: themes.vue_ui_history_plot[mergedConfig.theme] || props.config,
                defaultConfig: mergedConfig
            }),
            customPalette: themePalettes[mergedConfig.theme] || palette
        }
    } else {
        finalConfig = mergedConfig;
    }

    // ------------------------------ OVERRIDES -----------------------------------

    if (props.config && hasDeepProperty(props.config, 'style.chart.axes.x.scaleMin')) {
        finalConfig.style.chart.axes.x.scaleMin = props.config.style.chart.axes.x.scaleMin;
    } else {
        finalConfig.style.chart.axes.x.scaleMin = null;
    }

    if (props.config && hasDeepProperty(props.config, 'style.chart.axes.x.scaleMax')) {
        finalConfig.style.chart.axes.x.scaleMax = props.config.style.chart.axes.x.scaleMax;
    } else {
        finalConfig.style.chart.axes.x.scaleMax = null;
    }

    if (props.config && hasDeepProperty(props.config, 'style.chart.axes.y.scaleMin')) {
        finalConfig.style.chart.axes.y.scaleMin = props.config.style.chart.axes.y.scaleMin;
    } else {
        finalConfig.style.chart.axes.y.scaleMin = null;
    }

    if (props.config && hasDeepProperty(props.config, 'style.chart.axes.y.scaleMax')) {
        finalConfig.style.chart.axes.y.scaleMax = props.config.style.chart.axes.y.scaleMax;
    } else {
        finalConfig.style.chart.axes.y.scaleMax = null;
    }

    // ----------------------------------------------------------------------------

    return finalConfig;
}

const FINAL_CONFIG = computed({
    get: () => {
        return prepareConfig();
    },
    set: (newCfg) => {
        return newCfg
    }
});

watch(() => props.config, (_newCfg) => {
    FINAL_CONFIG.value = prepareConfig();
    prepareChart();
    titleStep.value += 1;
    tableStep.value += 1;
    legendStep.value += 1;
}, { deep: true });

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `history_plot_${uid.value}`,
    fileName: FINAL_CONFIG.value.style.chart.title.text || 'vue-ui-history-plot'
});

const hasOptionsNoTitle = computed(() => {
    return FINAL_CONFIG.value.userOptions.show && !FINAL_CONFIG.value.style.chart.title.text;
});

const customPalette = computed(() => {
    return convertCustomPalette(FINAL_CONFIG.value.customPalette);
});

const mutableConfig = ref({
    // dataLabels: {
    //     show: FINAL_CONFIG.value.style.chart.lines.dataLabels.show,
    // },
    showTable: FINAL_CONFIG.value.table.show,
    showTooltip: FINAL_CONFIG.value.style.chart.tooltip.show
});

const svg = ref({
    height: FINAL_CONFIG.value.style.chart.height,
    width: FINAL_CONFIG.value.style.chart.width
});

const drawingArea = computed(() => {
    const left = FINAL_CONFIG.value.style.chart.padding.left;
    const top = FINAL_CONFIG.value.style.chart.padding.top;
    return {
        left,
        top,
        right: svg.value.width - FINAL_CONFIG.value.style.chart.padding.right,
        bottom: svg.value.height - FINAL_CONFIG.value.style.chart.padding.bottom,
        width: svg.value.width - left - FINAL_CONFIG.value.style.chart.padding.right,
        height: svg.value.height - top - FINAL_CONFIG.value.style.chart.padding.bottom
    }
});

const formattedDataset = computed(() => {
    if(!isDataset.value) return [];
    return props.dataset.map((ds, i) => {
        return {
            ...ds,
            color: ds.color ? convertColorToHex(ds.color) : customPalette.value[i] || palette[i] || palette[i % palette.length],
            seriesIndex: i
        }
    })
});

const maxX = computed(() => {
    if(!isDataset.value) return 1;
    return Math.max(...formattedDataset.value.filter((ds) => !segregated.value.includes(ds.seriesIndex)).flatMap(ds => ds.values.map(d => d.x)));
});
const minX = computed(() => {
    if(!isDataset.value) return 1;
    const min = Math.min(...formattedDataset.value.filter((ds) => !segregated.value.includes(ds.seriesIndex)).flatMap(ds => ds.values.map(d => d.x)));
    return min < 0 ? min : 0;
});
const maxY = computed(() => {
    if(!isDataset.value) return 1;
    return Math.max(...formattedDataset.value.filter((ds) => !segregated.value.includes(ds.seriesIndex)).flatMap(ds => ds.values.map(d => d.y)));
});
const minY = computed(() => {
    if(!isDataset.value) return 1;
    const min = Math.min(...formattedDataset.value.filter((ds) => !segregated.value.includes(ds.seriesIndex)).flatMap(ds => ds.values.map(d => d.y)));
    return min < 0 ? min : 0;
});

const scales = computed(() => {
    const x = calculateNiceScale(
            FINAL_CONFIG.value.style.chart.axes.x.scaleMin === null ? minX.value : FINAL_CONFIG.value.style.chart.axes.x.scaleMin,
            FINAL_CONFIG.value.style.chart.axes.x.scaleMax === null ? maxX.value : FINAL_CONFIG.value.style.chart.axes.x.scaleMax,
            FINAL_CONFIG.value.style.chart.axes.x.ticks
        );

    const y = calculateNiceScale(
            FINAL_CONFIG.value.style.chart.axes.y.scaleMin === null ? minY.value : FINAL_CONFIG.value.style.chart.axes.y.scaleMin,
            FINAL_CONFIG.value.style.chart.axes.y.scaleMax === null ? maxY.value : FINAL_CONFIG.value.style.chart.axes.y.scaleMax,
            FINAL_CONFIG.value.style.chart.axes.y.ticks
        );
    return {
        x,
        y,
        tickX: x.ticks.map(t => {
            return {
                x: drawingArea.value.left + (t / x.max * drawingArea.value.width),
                y1: drawingArea.value.top,
                y2: drawingArea.value.bottom,
                value: t
            }
        }),
        tickY: y.ticks.map(t => {
            return {
                y: drawingArea.value.bottom - (t / y.max * drawingArea.value.height),
                x1: drawingArea.value.left,
                x2: drawingArea.value.right,
                value: t
            }
        })
    }
});

function setDimensionX(value) {
    const minOffset = scales.value.x.min < 0 ? Math.abs(scales.value.x.min) : 0;
    return drawingArea.value.left + ((value || 0) + minOffset) / (scales.value.x.max + minOffset) * drawingArea.value.width;
}
function setDimensionY(value) {
    const minOffset = scales.value.y.min < 0 ? Math.abs(scales.value.y.min) : 0;
    return drawingArea.value.bottom - (1 - ((value || 0) + minOffset) / (scales.value.y.max + minOffset)) * drawingArea.value.height;
}

const drawableDataset = computed(() => {
    return formattedDataset.value.filter(ds => !segregated.value.includes(ds.seriesIndex)).map((ds, i) => {
        const plots = ds.values.map((p,i) => {
                return {
                    valueX: p.x,
                    valueY: p.y,
                    label: p.label,
                    x: setDimensionX(p.x),
                    y: setDimensionY(p.y),
                    color: ds.color
                }
            });
            // TODO: cleaner path gen
        return {
            ...ds,
            plots,
            track: plots.map(p => {
                return ` ${p.x},${p.y} `
            }).toString().trim()
        }
    });
});

function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
}

</script>

<template>
    <div 
        :id="`history_plot_${uid}`"
        ref="historyPlotChart"
        :class="{'vue-ui-history-plot': true, 'vue-data-ui-wrapper-fullscreen' : isFullscreen }" 
        :style="`background:${FINAL_CONFIG.style.chart.backgroundColor};color:${FINAL_CONFIG.style.chart.color};font-family:${FINAL_CONFIG.style.fontFamily}; position: relative; ${FINAL_CONFIG.responsive ? 'height: 100%' : ''}`"
    >
        
        <slot name="userConfig"/>

        <div
            ref="noTitle"
            v-if="hasOptionsNoTitle" 
            class="vue-data-ui-no-title-space" 
            :style="`height:36px; width: 100%;background:transparent`"
        />

        <svg 
            v-if="isDataset"
            :xmlns="XMLNS"
            :viewBox="`0 0 ${svg.width} ${svg.height}`"
            :style="`max-width:100%;overflow:visible;background:transparent;color:${FINAL_CONFIG.style.chart.color}`"
        >
            <PackageVersion />

            <!-- GRID -->

            <!-- SCALE Y -->
            <line
                v-for="line in scales.tickX"
                :x1="line.x"
                :x2="line.x"
                :y1="line.y1"
                :y2="line.y2"
                :stroke="FINAL_CONFIG.style.chart.grid.verticalLines.stroke"
                :stroke-width="FINAL_CONFIG.style.chart.grid.verticalLines.strokeWidth"
                stroke-linecap="round"
            />
            <!-- Y AXIS LABELS -->
            <g v-if="FINAL_CONFIG.style.chart.axes.y.labels.show">
                <text
                    v-for="labelY in scales.tickY"
                    :x="drawingArea.left + FINAL_CONFIG.style.chart.axes.y.labels.offsetX - 4"
                    :y="labelY.y + FINAL_CONFIG.style.chart.axes.y.labels.fontSize / 3"
                    :fill="FINAL_CONFIG.style.chart.axes.y.labels.color"
                    :font-size="FINAL_CONFIG.style.chart.axes.y.labels.fontSize"
                    text-anchor="end"
                >
                    {{ labelY.value }}
                </text>
            </g>

            <!-- SCALE X -->
            <line
                v-for="line in scales.tickY"
                :x1="line.x1"
                :x2="line.x2"
                :y1="line.y"
                :y2="line.y"
                :stroke="FINAL_CONFIG.style.chart.grid.horizontalLines.stroke"
                :stroke-width="FINAL_CONFIG.style.chart.grid.horizontalLines.strokeWidth"
                stroke-linecap="round"
            />

            <!-- X AXIS LABELS -->
            <g v-if="FINAL_CONFIG.style.chart.axes.x.labels.show">
                <text
                    v-for="labelX in scales.tickX"
                    :x="labelX.x"
                    :y="drawingArea.bottom + FINAL_CONFIG.style.chart.axes.x.labels.offsetY + FINAL_CONFIG.style.chart.axes.x.labels.fontSize"
                    :fill="FINAL_CONFIG.style.chart.axes.x.labels.color"
                    :font-size="FINAL_CONFIG.style.chart.axes.x.labels.fontSize"
                    text-anchor="middle"
                >
                    {{ labelX.value }}
                </text>
            </g>

            <!-- X AXIS -->
            <line
                v-if="FINAL_CONFIG.style.chart.grid.xAxis.show"
                :x1="drawingArea.left"
                :x2="drawingArea.left + drawingArea.width"
                :y1="drawingArea.bottom"
                :y2="drawingArea.bottom"
                :stroke="FINAL_CONFIG.style.chart.grid.xAxis.stroke"
                :stroke-width="FINAL_CONFIG.style.chart.grid.xAxis.strokeWidth"
                stroke-linecap="round"
            />

            <!-- Y AXIS -->
            <line
                v-if="FINAL_CONFIG.style.chart.grid.yAxis.show"
                :x1="drawingArea.left"
                :x2="drawingArea.left"
                :y1="drawingArea.top"
                :y2="drawingArea.bottom"
                :stroke="FINAL_CONFIG.style.chart.grid.yAxis.stroke"
                :stroke-width="FINAL_CONFIG.style.chart.grid.yAxis.strokeWidth"
                stroke-linecap="round"
            />
            
            <!-- PLOTS & TRACKS -->
            <g v-for="ds in drawableDataset">
                <path
                    :d="`M${ds.track}`"
                    :stroke="'white'"
                    :stroke-width="FINAL_CONFIG.style.chart.paths.strokeWidth * 2"
                    fill="none"
                />
                <path
                    :d="`M${ds.track}`"
                    :stroke="FINAL_CONFIG.style.chart.paths.useSerieColor ? ds.color : FINAL_CONFIG.style.chart.paths.stroke"
                    :stroke-width="FINAL_CONFIG.style.chart.paths.strokeWidth"
                    fill="none"
                />
                <circle
                    v-for="plot in ds.plots"
                    :cx="plot.x"
                    :cy="plot.y"
                    :fill="plot.color"
                    :r="FINAL_CONFIG.style.chart.plots.radius"
                    :stroke="FINAL_CONFIG.style.chart.plots.stroke"
                    :stroke-width="FINAL_CONFIG.style.chart.plots.strokeWidth"
                />
            </g>

        </svg>

    </div>
</template>

<style scoped>
@import "../vue-data-ui.css";
.vue-ui-history-plot * {
    transition: unset;
}

.vue-ui-history-plot {
    user-select: none;
    width: 100%;
}
</style>