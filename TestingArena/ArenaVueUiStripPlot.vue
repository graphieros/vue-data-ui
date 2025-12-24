<script setup>
import { ref, computed, onMounted } from "vue";
import LocalVueUiStripPlot from '../src/components/vue-ui-strip-plot.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import { useArena } from "../src/useArena";
import { VueUiStripPlot } from "vue-data-ui";
import { VueUiStripPlot as VueUiStripPlotTreeshaken } from "vue-data-ui/vue-ui-strip-plot";
import ConfigKnobs from "./ConfigKnobs.vue";
import { useConfigurationControls } from "./createConfigModel";
import { useConfig } from "../src/useConfig"

const { local, build, vduiLocal, vduiBuild, toggleTable, toggleLabels } = useArena();
const { vue_ui_strip_plot: DEFAULT_CONFIG } = useConfig();

const {
    CHECKBOX,
    NUMBER,
    RANGE,
    TEXT,
    COLOR,
    SELECT,
    createModel
} = useConfigurationControls(DEFAULT_CONFIG);

const dataset = ref(undefined);

onMounted(() => {
    setTimeout(() => {
        dataset.value = [
    {
        name: "Some continent\nwith a long name",
        plots: [
            { name: "Some Country with\na long name", value: 24.9 },
            { name: "Beijing", value: 21.9 },
            { name: "Delhi", value: 16.8 },
            { name: "Guangzhou", value: 16.1 },
            { name: "Istanbul", value: 15.6 },
            { name: "Chengdu", value: 15.4 },
            { name: "Mumbai", value: 15.4 },
            { name: "Karachi", value: 14.9 },
            { name: "Shenzen", value: 14.7 },
            { name: "Tokyo", value: 14 },
        ]
    },
    {
        name: "Africa",
        plots: [
            { name: "Kinshasa", value: 17.1 },
            { name: "Lagos", value: 14.9 },
            { name: "Cairo", value: 9.3 },
            { name: "Johannesburg", value: 5.6 },
            { name: "Giza", value: 5.6 },
            { name: "Khartoum", value: 5.3 },
            { name: "Abidjan", value: 5 },
            { name: "Alexandria", value: 4.9 },
            { name: "Dar es Salaam", value: 4.7 },
            { name: "Nairobi", value: 4.4 },
        ]
    },
    {
        name: "Europe",
        plots: [
            { name: "Moscow", value: 13 },
            { name: "London", value: 9 },
            { name: "Saint Petersburg", value: 5.4 },
            { name: "Berlin", value: 3.8 },
            { name: "Madrid", value: 3.3 },
            { name: "Kyiv", value: 3 },
            { name: "Rome", value: 2.7 },
            { name: "Paris", value: 2.1 },
            { name: "Minsk", value: 2 },
            { name: "Vienna", value: 1.9 }
        ]
    },
    {
        name: "America",
        plots: [
            { name: "Sao Paulo", value: 12.2 },
            { name: "Lima", value: 9.7 },
            { name: "Mexico City", value: 9.2 },
            { name: "New York", value: 8.4 },
            { name: "Bogota", value: 8 },
            { name: "Rio de Janeiro", value: 6.7 },
            { name: "Santiago", value: 6.2 },
            { name: "Los Angeles", value: 4 },
            { name: "Buenos Aires", value: 3 },
            { name: "Brasilia", value: 2.9 }
        ]
    },
    {
        name: "Australia & Oceania",
        plots: [
            { name: "Sydney", value: 5.4 },
            { name: "Melbourne", value: 5.1 },
            { name: "Brisbane", value: 2.6 },
            { name: "Perth", value: 2.1 },
            { name: "Auckland", value: 1.7 },
            { name: "Adelaide", value: 1.4 },
            { name: "Honolulu", value: 1 },
            { name: "Gold Coast", value: 0.7 },
            { name: "Newcastle-Maitland", value: 0.5 },
            { name: "Canberra", value: 0.46 },
        ]
    },
]
    }, 2000)
})

function addDatapoint() {
    dataset.value.push({
        name: 'DP',
        plots: [
            { name: '___', value: 5}
        ]
    })
}

const model = createModel([
    CHECKBOX("debug", { def: true }),
    CHECKBOX("loading", { def: false }),
    CHECKBOX("responsive", { def: false }),
    CHECKBOX("responsiveProportionalSizing", { def: false }),

    CHECKBOX("useCssAnimation", { def: true }),
    CHECKBOX("userOptions.show", { def: true }),
    CHECKBOX("userOptions.buttons.pdf", { def: true }),
    CHECKBOX("userOptions.buttons.csv", { def: true }),
    CHECKBOX("userOptions.buttons.img", { def: true }),
    CHECKBOX("userOptions.buttons.table", { def: true }),
    CHECKBOX("userOptions.buttons.labels", { def: true }),
    CHECKBOX("userOptions.buttons.fullscreen", { def: true }),
    SELECT("userOptions.position", ["left", "right"], { def: "right" }),
    CHECKBOX("userOptions.showOnChartHover", { def: true }),
    CHECKBOX("userOptions.keepStateOnChartLeave", { def: true }),

    NUMBER("userOptions.print.scale", { def: 2, min: 1, max: 5 }),
    CHECKBOX("userOptions.print.allowTaint", { def: true }),
    CHECKBOX("userOptions.print.useCORS", { def: true }),
    COLOR("userOptions.print.backgroundColor", { def: "#FFFFFF" }),
    
    TEXT("style.fontFamily", { def: "inherit" }),
    COLOR("style.chart.backgroundColor", { def: "#FFFFFF" }),
    COLOR("style.chart.color", { def: "#1A1A1A" }),
    NUMBER("style.chart.height", { def: 600, min: 200, max: 1000 }),
    NUMBER("style.chart.stripWidth", { def: 120, min: 48, max: 300 }),
    NUMBER("style.chart.padding.top", { def: 0, min: 0, max: 100 }),
    NUMBER("style.chart.padding.left", { def: 0, min: 0, max: 100 }),
    NUMBER("style.chart.padding.right", { def: 0, min: 0, max: 100 }),
    NUMBER("style.chart.padding.bottom", { def: 0, min: 0, max: 100 }),
    CHECKBOX("style.chart.grid.show", { def: true }),
    COLOR("style.chart.grid.stroke", { def: "#e1e5e8" }),
    NUMBER("style.chart.grid.strokeWidth", { def: 1, min: 0, max: 12 }),
    NUMBER("style.chart.grid.scaleSteps", { def: 10, min: 2, max: 20 }),
    CHECKBOX("style.chart.grid.horizontalGrid.show", { def: true }),
    NUMBER("style.chart.grid.horizontalGrid.strokeWidth", { def: 0.5, min: 0, max: 12, step: 0.5 }),
    COLOR("style.chart.grid.horizontalGrid.stroke", { def: "#CCCCCC" }),
    NUMBER("style.chart.grid.horizontalGrid.strokeDasharray", { def: 4, min: 0, max: 100 }),
    CHECKBOX("style.chart.grid.verticalGrid.show", { def: true }),
    COLOR("style.chart.grid.verticalGrid.stroke", { def: "#CCCCCC" }),
    NUMBER("style.chart.grid.verticalGrid.strokeWidth", { def: 0.5, min: 0, max: 12, step: 0.5 }),
    NUMBER("style.chart.grid.verticalGrid.strokeDasharray", { def: 4, min: 0, max: 100 }),
    NUMBER("style.chart.plots.opacity", { def: 0.5, min: 0, max: 1, step: 0.01 }),
    NUMBER("style.chart.plots.radius", { def: 20, min: 1, max: 100 }),
    COLOR("style.chart.plots.stroke", { def: "#FFFFFF" }),
    NUMBER("style.chart.plots.strokeWidth", { def: 1, min: 0, max: 12 }),
    SELECT("style.chart.plots.shape", ["circle", "triangle", "square", "diamond", "pentagon", "hexagon", "star"], { def: "circle" }),
    CHECKBOX("style.chart.plots.gradient.show", { def: true }),
    RANGE("style.chart.plots.gradient.intensity", { def: 40, min: 0, max: 100 }),
    TEXT("style.chart.labels.prefix", { def: "P" }),
    TEXT("style.chart.labels.suffix", { def: "S" }),
    CHECKBOX("style.chart.labels.bestPlotLabel.show", { def: true }),
    CHECKBOX("style.chart.labels.bestPlotLabel.showValue", { def: true }),
    NUMBER("style.chart.labels.bestPlotLabel.fontSize", { def: 14, min: 8, max: 48 }),
    COLOR("style.chart.labels.bestPlotLabel.color", { def: "#1A1A1A" }),
    NUMBER("style.chart.labels.bestPlotLabel.rounding", { def: 2, min: 0, max: 12 }),
    NUMBER("style.chart.labels.bestPlotLabel.offsetY", { def: 0, min: -100, max: 100 }),
    TEXT("style.chart.labels.axis.xLabel", { def: "Lorem ipsum X Label" }),
    NUMBER("style.chart.labels.axis.xLabelOffsetY", { def: 0, min: -100, max: 100 }),
    TEXT("style.chart.labels.axis.yLabel", { def: "Lorem ipsum Y label" }),
    NUMBER("style.chart.labels.axis.yLabelOffsetX", { def: 0, min: -100, max: 100 }),
    COLOR("style.chart.labels.axis.color", { def: "#1A1A1A" }),
    CHECKBOX("style.chart.labels.xAxisLabels.show", { def: true }),
    COLOR("style.chart.labels.xAxisLabels.color", { def: "#1A1A1A" }),
    NUMBER("style.chart.labels.xAxisLabels.fontSize", { def: 14, min: 8, max: 48 }),
    NUMBER("style.chart.labels.xAxisLabels.offsetY", { def: 0, min: -100, max: 100 }),
    NUMBER("style.chart.labels.xAxisLabels.autoRotate.angle", { def: -90, min: -90, max: 90 }),

    CHECKBOX("style.chart.labels.yAxisLabels.show", { def: true }),
    COLOR("style.chart.labels.yAxisLabels.color", { def: "#1A1A1A" }),
    NUMBER("style.chart.labels.yAxisLabels.fontSize", { def: 14, min: 8, max: 48 }),
    NUMBER("style.chart.labels.yAxisLabels.rounding", { def: 2, min: 0, max: 12 }),
    NUMBER("style.chart.labels.yAxisLabels.offsetX", { def: 0, min: -100, max: 100 }),
    TEXT("style.chart.title.text", { def: "Lorem ipsum dolor sit amet" }),
    COLOR("style.chart.title.color", { def: "#1A1A1A" }),
    NUMBER("style.chart.title.fontSize", { def: 20, min: 8, max: 48 }),
    CHECKBOX("style.chart.title.bold", { def: true }),
    COLOR("style.chart.title.subtitle.color", { def: "#CCCCCC" }),
    TEXT("style.chart.title.subtitle.text", { def: "Lorem ipsum dolor sit amet" }),
    NUMBER("style.chart.title.subtitle.fontSize", { def: 16, min: 8, max: 48 }),
    CHECKBOX("style.chart.title.subtitle.bold", { def: false }),

    CHECKBOX("style.chart.tooltip.show", { def: true }),
    COLOR("style.chart.tooltip.color", { def: "#1A1A1A" }),
    COLOR("style.chart.tooltip.backgroundColor", { def: "#FFFFFF" }),
    NUMBER("style.chart.tooltip.fontSize", { def: 14, min: 8, max: 48 }),
    NUMBER("style.chart.tooltip.roundingValue", { def: 2, min: 0, max: 12 }),
    RANGE("style.chart.tooltip.backgroundOpacity", { def: 100, min: 0, max: 100 }),
    SELECT("style.chart.tooltip.position", ["left", "center", "right"], { def: "center" }),
    NUMBER("style.chart.tooltip.offsetY", { def: 24, min: 0, max: 48 }),

    CHECKBOX("table.show", { def: false }),
    CHECKBOX("table.useDialog", { def: true }),

    NUMBER("table.responsiveBreakpoint", { def: 300, min: 300, max: 800 }),
    TEXT("table.columnNames.series", { def: "Series" }),
    TEXT("table.columnNames.value", { def: "Value" }),
    COLOR("table.th.backgroundColor", { def: "#FFFFFF" }),
    COLOR("table.th.color", { def: "#1A1A1A" }),
    TEXT("table.th.outline", { def: "none" }),
    COLOR("table.td.backgroundColor", { def: "#FFFFFF" }),
    COLOR("table.td.color", { def: "#1A1A1A" }),
    TEXT("table.td.outline", { def: "none" }),
    NUMBER("table.td.roundingValue", { def: 2, min: 0, max: 12 })
]);


const testCustomTooltip = ref(false);

const themeOptions = ref([
    "",
    "dark",
    "hack",
    "zen",
    "concrete",
    "default",
    "celebration",
    "celebrationNight"
])

const currentTheme = ref(themeOptions.value[1]);

const configTheme = computed(() => ({ theme: currentTheme.value }));

const config = computed(() => {
    const c = convertArrayToObject(model.value)

    if(testCustomTooltip.value) {
        return {
            ...c,
            style: {
                ...c.style,
                chart: {
                    ...c.style.chart,
                    tooltip: {
                        ...c.style.chart.tooltip,
                        customFormat: (data) => {
                            console.log('STRIP PLOT CUSTOM TOOLTIP', data)
                            return 'CUSTOM TOOLTIP'
                        }
                    }
                }
            }
        }
    } else {
        return {
            ...c,
            events: {
                datapointEnter: ({ datapoint, seriesIndex }) => {
                    console.log('enter event', { datapoint, seriesIndex });
                },
                datapointLeave: ({ datapoint, seriesIndex }) => {
                    console.log('leave event', { datapoint, seriesIndex });
                },
                datapointClick: ({ datapoint, seriesIndex }) => {
                    console.log('click event', { datapoint, seriesIndex });
                },
            },
            style: {
                ...c.style,
                chart: {
                    ...c.style.chart,
                    labels: {
                        ...c.style.chart.labels,
                        formatter: ({value, config}) => {
                            // console.log(config)
                            return `f | ${value}`
                        }
                    }
                }
            },
            theme: currentTheme.value,
            customPalette: ['#6376DD', "#DD3322", "#66DDAA"],
        }
    }
})

const step = ref(0)

onMounted(async () => {
    if (local.value) {
        const img = await local.value.getImage()
        console.log(img)
    }
})

</script>

<template>
    <button @click="toggleTable">TOGGLE TABLE</button>
    <button @click="toggleLabels">TOGGLE LABELS</button>
    <button @click="addDatapoint">ADD DATAPOINT</button>
    <div style="margin: 12px 0; color: white">
        Theme:
        <select v-model="currentTheme" @change="step += 1">
            <option v-for="opt in themeOptions">{{ opt }}</option>
        </select>
    </div>
    <div style="margin: 12px 0">
        <input type="checkbox" v-model="testCustomTooltip" id="custom-tooltip"/>
        <label for="custom-tooltip" style="color:#CCCCCC">Test custom tooltip</label>
    </div>

    <Box comp="VueUiStripPlot" :dataset="dataset" :config="config">
        <template #title>VueUiStripPlot</template>

        <template #responsive>
            <div style="width: 600px; height: 600px; resize: both; overflow: auto; background: white">
                <LocalVueUiStripPlot :key="`responsive_${step}`" :dataset="dataset" :config="{
                    ...config,
                    responsive: true
                }">
                    <!-- <template #chart-background>
                        <div style="width: 100%; height: 100%; background: radial-gradient(at top left, red, white)"/>
                    </template> -->
                    <template #watermark="{ isPrinting }">
                        <div v-if="isPrinting" style="font-size: 100px; opacity: 0.1; transform: rotate(-10deg)">
                            WATERMARK
                        </div>
                    </template>
                    <template #source>
                        <div style="width:100%;font-size:10px;text-align:left">
                            SOURCE: Lorem ipsum dolor sit, amet consectetur adipisicing elit. Tenetur, molestiae perspiciatis nam quae libero, deserunt in aperiam unde officia sint saepe laboriosam ducimus aspernatur labore! Sapiente aspernatur corrupti quis ad.
                        </div>
                    </template>   
                </LocalVueUiStripPlot>
            </div>
        </template>

        <template #theme>
            <LocalVueUiStripPlot :dataset="dataset" :config="configTheme" />
        </template>

        <template #local>
            <LocalVueUiStripPlot :dataset="dataset" :config="config" :key="`local_${step}`" ref="local">
                <template #optionLabels>
                    SHOW LABELS
                </template>
                <template #svg="{ svg }">
                    <circle :cx="30" :cy="30" :r="30" fill="#42d392" />
                    <text :x="30" :y="30" text-anchor="middle">#SVG</text>
                </template>
                <template #tooltip-before="{ datapoint, seriesIndex, series, config, bars, lines, plots }">
                    #BEFORE {{ series.name }}
                </template>
                <template #tooltip-after="{ datapoint, seriesIndex, series, config, bars, lines, plots }">
                    #AFTER {{ series.name }}
                </template>
            </LocalVueUiStripPlot>
        </template>

        <template #VDUI-local>
            <LocalVueDataUi component="VueUiStripPlot" :dataset="dataset" :config="config" :key="`vdui_local_${step}`" ref="vduiLocal">
                <template #svg="{ svg }">
                    <circle :cx="30" :cy="30" :r="30" fill="#42d392" />
                    <text :x="30" :y="30" text-anchor="middle">#SVG</text>
                </template>
                <template #tooltip-before="{ datapoint, seriesIndex, series, config, bars, lines, plots }">
                    #BEFORE {{ series.name }}
                </template>
                <template #tooltip-after="{ datapoint, seriesIndex, series, config, bars, lines, plots }">
                    #AFTER {{ series.name }}
                </template>
            </LocalVueDataUi>
        </template>

        <template #build>
            <VueUiStripPlot :dataset="dataset" :config="config" :key="`build_${step}`" ref="build">
                <template #svg="{ svg }">
                    <circle :cx="30" :cy="30" :r="30" fill="#42d392" />
                    <text :x="30" :y="30" text-anchor="middle">#SVG</text>
                </template>
                <template #tooltip-before="{ datapoint, seriesIndex, series, config, bars, lines, plots }">
                    #BEFORE {{ series.name }}
                </template>
                <template #tooltip-after="{ datapoint, seriesIndex, series, config, bars, lines, plots }">
                    #AFTER {{ series.name }}
                </template>
            </VueUiStripPlot>
        </template>

        <template #build-treesh>
            <VueUiStripPlotTreeshaken :dataset="dataset" :config="config" :key="`build_${step}`" ref="build">
                <template #svg="{ svg }">
                    <circle :cx="30" :cy="30" :r="30" fill="#42d392" />
                    <text :x="30" :y="30" text-anchor="middle">#SVG</text>
                </template>
                <template #tooltip-before="{ datapoint, seriesIndex, series, config, bars, lines, plots }">
                    #BEFORE {{ series.name }}
                </template>
                <template #tooltip-after="{ datapoint, seriesIndex, series, config, bars, lines, plots }">
                    #AFTER {{ series.name }}
                </template>
            </VueUiStripPlotTreeshaken>
        </template>

        <template #VDUI-build>
            <VueDataUi component="VueUiStripPlot" :dataset="dataset" :config="config" :key="`vdui_build_${step}`" ref="vduiBuild">
                <template #svg="{ svg }">
                    <circle :cx="30" :cy="30" :r="30" fill="#42d392" />
                    <text :x="30" :y="30" text-anchor="middle">#SVG</text>
                </template>
                <template #tooltip-before="{ datapoint, seriesIndex, series, config, bars, lines, plots }">
                    #BEFORE {{ series.name }}
                </template>
                <template #tooltip-after="{ datapoint, seriesIndex, series, config, bars, lines, plots }">
                    #AFTER {{ series.name }}
                </template>
            </VueDataUi>
        </template>

        <template #knobs="{ summaryOpen }">
            <ConfigKnobs :model="model" @change="step += 1" :open="summaryOpen"/>
        </template>
    </Box>
</template>