<script setup>
import { ref, computed, onMounted } from "vue";
import LocalVueUiParallelCoordinatePlot from '../src/components/vue-ui-parallel-coordinate-plot.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import { useArena } from "../src/useArena";
import { VueUiParallelCoordinatePlot } from "vue-data-ui";
import { VueUiParallelCoordinatePlot as VueUiParallelCoordinatePlotTreeshaken } from "vue-data-ui/vue-ui-parallel-coordinate-plot";
import ConfigKnobs from "./ConfigKnobs.vue";
import { useConfigurationControls } from "./createConfigModel";
import { useConfig } from "../src/useConfig"

const { local, build, vduiLocal, vduiBuild, toggleTable, toggleLabels } = useArena();
const { vue_ui_parallel_coordinate_plot: DEFAULT_CONFIG } = useConfig();

const {
    CHECKBOX,
    NUMBER,
    RANGE,
    TEXT,
    COLOR,
    SELECT,
    createModel
} = useConfigurationControls(DEFAULT_CONFIG);

const dataset = ref([]);

onMounted(() => {
    setTimeout(() => {
        dataset.value = [
            {
                name: "Series 1",
                shape: "triangle",
                series: [
                    {
                        name: 'Item 1.1',
                        values: [1200, 300, 12, 1.2],
                        comments: ['', '', 'This is some sort of comment', '']
                    },
                    {
                        name: 'Item 1.2',
                        values: [1000, 100, 10, 1]
                    },
                    {
                        name: 'Item 1.3',
                        values: [-800, 85, 8.5, 0.85]
                    },
                ]
            },
            {
                name: "Series 2",
                series: [
                    {
                        name: 'Item 2.1',
                        values: [2300, 230, 23, 2.3]
                    },
                    {
                        name: 'Item 2.2',
                        values: [2500, 250, 25, 2.5]
                    },
                    {
                        name: 'Item 2.3',
                        values: [2800, 280, 28, 2.8]
                    },
                ]
            },
        ]
    }, 2000)
})

const model = createModel([
    CHECKBOX("debug", { def: true }),
    CHECKBOX("loading", { def: false }),
    CHECKBOX("responsiveProportionalSizing", { def: false }),

    CHECKBOX("style.chart.comments.show", { def: true }),
    CHECKBOX("style.chart.comments.showInTooltip", { def: true }),
    NUMBER("style.chart.comments.width", { def: 200, min: 50, max: 400 }),
    NUMBER("style.chart.comments.offsetX", { def: 0, min: -100, max: 100 }),
    NUMBER("style.chart.comments.offsetY", { def: 0, min: -100, max: 100 }),

    CHECKBOX("responsive", { def: false }),

    NUMBER("userOptions.print.scale", { def: 2, min: 1, max: 5 }),
    CHECKBOX("userOptions.print.allowTaint", { def: true }),
    CHECKBOX("userOptions.print.useCORS", { def: true }),
    COLOR("userOptions.print.backgroundColor", { def: "#FFFFFF" }),

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

    CHECKBOX("useCssAnimation", { def: false }),

    TEXT("style.fontFamily", { def: "inherit" }),
    COLOR("style.chart.backgroundColor", { def: "#FFFFFF" }),
    COLOR("style.chart.color", { def: "#1A1A1A" }),

    NUMBER("style.chart.height", { def: 600, min: 300, max: 1000 }),
    NUMBER("style.chart.width", { def: 1000, min: 300, max: 1500 }),

    NUMBER("style.chart.padding.top", { def: 0, min: 0, max: 100 }),
    NUMBER("style.chart.padding.right", { def: 0, min: 0, max: 100 }),
    NUMBER("style.chart.padding.bottom", { def: 0, min: 0, max: 100 }),
    NUMBER("style.chart.padding.left", { def: 0, min: 0, max: 100 }),

    CHECKBOX("style.chart.lines.smooth", { def: false }),
    NUMBER("style.chart.lines.strokeWidth", { def: 2, min: 0, max: 12 }),
    NUMBER("style.chart.lines.opacity", { def: 0.8, min: 0, max: 1, step: 0.01 }),

    CHECKBOX("style.chart.plots.show", { def: true }),
    NUMBER("style.chart.plots.radius", { def: 6, min: 0, max: 24 }),
    NUMBER("style.chart.plots.opacity", { def: 0.8, min: 0, max: 1, step: 0.01 }),

    NUMBER("style.chart.yAxis.scaleTicks", { def: 10, min: 2, max: 20 }),
    COLOR("style.chart.yAxis.stroke", { def: "#1A1A1A" }),
    NUMBER("style.chart.yAxis.strokeWidth", { def: 1, min: 0, max: 12 }),

    CHECKBOX("style.chart.yAxis.labels.ticks.show", { def: true }),
    NUMBER("style.chart.yAxis.labels.ticks.fontSize", { def: 14, min: 8, max: 42 }),
    COLOR("style.chart.yAxis.labels.ticks.color", { def: "#1A1A1A" }),
    CHECKBOX("style.chart.yAxis.labels.ticks.bold", { def: false }),
    NUMBER("style.chart.yAxis.labels.ticks.offsetX", { def: 0, min: -100, max: 100 }),
    NUMBER("style.chart.yAxis.labels.ticks.offsetY", { def: 0, min: -100, max: 100 }),

    CHECKBOX("style.chart.yAxis.labels.datapoints.show", { def: true }),
    NUMBER("style.chart.yAxis.labels.datapoints.fontSize", { def: 14, min: 8, max: 42 }),
    CHECKBOX("style.chart.yAxis.labels.datapoints.useSerieColor", { def: true }),
    COLOR("style.chart.yAxis.labels.datapoints.color", { def: "#1A1A1A" }),
    NUMBER("style.chart.yAxis.labels.datapoints.offsetX", { def: 0, min: -100, max: 100 }),
    NUMBER("style.chart.yAxis.labels.datapoints.offsetY", { def: 0, min: -100, max: 100 }),
    CHECKBOX("style.chart.yAxis.labels.datapoints.bold", { def: true }),

    CHECKBOX("style.chart.yAxis.labels.showAxisNames", { def: true }),
    COLOR("style.chart.yAxis.labels.axisNamesColor", { def: "#1A1A1A" }),
    NUMBER("style.chart.yAxis.labels.axisNamesFontSize", { def: 16, min: 8, max: 42 }),
    CHECKBOX("style.chart.yAxis.labels.axisNamesBold", { def: true }),
    NUMBER("style.chart.yAxis.labels.axisNamesAutoRotate.angle", { def: -90, min: -90, max: 90 }),

    TEXT("style.chart.title.text", { def: "Lorem ipsum" }),
    COLOR("style.chart.title.color", { def: "#1A1A1A" }),
    NUMBER("style.chart.title.fontSize", { def: 20, min: 8, max: 42 }),
    CHECKBOX("style.chart.title.bold", { def: true }),

    TEXT("style.chart.title.subtitle.text", { def: "Lorem ipsum dolor sit amet" }),
    COLOR("style.chart.title.subtitle.color", { def: "#CCCCCC" }),
    NUMBER("style.chart.title.subtitle.fontSize", { def: 16, min: 8, max: 42 }),
    CHECKBOX("style.chart.title.subtitle.bold", { def: false }),

    CHECKBOX("style.chart.legend.show", { def: true }),
    COLOR("style.chart.legend.backgroundColor", { def: "#FFFFFF" }),
    COLOR("style.chart.legend.color", { def: "#1A1A1A" }),
    NUMBER("style.chart.legend.fontSize", { def: 16, min: 8, max: 42 }),
    CHECKBOX("style.chart.legend.bold", { def: false }),
    SELECT("style.chart.legend.position", ["top", "bottom"], { def: "bottom" }),

    CHECKBOX("style.chart.tooltip.show", { def: true }),
    COLOR("style.chart.tooltip.color", { def: "#1A1A1A" }),
    COLOR("style.chart.tooltip.backgroundColor", { def: "#FFFFFF" }),
    NUMBER("style.chart.tooltip.fontSize", { def: 14, min: 8, max: 42 }),
    NUMBER("style.chart.tooltip.borderRadius", { def: 4, min: 0, max: 12 }),
    COLOR("style.chart.tooltip.borderColor", { def: "#e1e5e8" }),
    NUMBER("style.chart.tooltip.borderWidth", { def: 1, min: 0, max: 12 }),
    RANGE("style.chart.tooltip.backgroundOpacity", { def: 100, min: 0, max: 100 }),
    SELECT("style.chart.tooltip.position", ["left", "center", "right"], { def: "center" }),
    NUMBER("style.chart.tooltip.offsetY", { def: 24, min: 0, max: 48 }),

    CHECKBOX("table.show", { def: false }),
    CHECKBOX("table.useDialog", { def: true }),
]);


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
    const c = convertArrayToObject(model.value);
    return {
        ...c,
        events: {
            datapointEnter: ({ datapoint, seriesIndex }) => {
                console.log('enter event', { datapoint, seriesIndex })
            },
            datapointLeave: ({ datapoint, seriesIndex }) => {
                console.log('leave event', { datapoint, seriesIndex })
            },
            datapointClick: ({ datapoint, seriesIndex }) => {
                console.log('click event', { datapoint, seriesIndex })
            },
        },
        theme: currentTheme.value,
        variables: [
            "Variable 1",
            "Variable 2",
            "Variable 3",
            "Variable 4",
        ],
        style: {
            ...c.style,
            chart: {
                ...c.style.chart,
                yAxis: {
                    ...c.style.chart.yAxis,
                    labels: {
                        ...c.style.chart.yAxis.labels,
                        roundings: [0, 0, 0, 1],
                        suffixes: ['$', '€', '£', '%'],
                        axisNames: ['Axis 1 with some\nsort of long name', 'Axis 2', 'Axis 3', ''],
                        formatters: [
                            ({value, config}) => {
                                return `f0 | ${value}`
                            },
                            ({value, config}) => {
                                return `f1 | ${value}`
                            },
                            ({value, config}) => {
                                return `f2 | ${value}`
                            },
                            ({value, config}) => {
                                return `f3 | ${value}`
                            },
                        ]
                    }
                }
            }
        }
    }
})

const step = ref(0)

function selectLegend(l) {
    console.log(l)
}

function selectDatapoint(dp) {
    console.log(dp)
}

onMounted(async() => {
    if (vduiLocal.value) {
        const p = await vduiLocal.value.getImage()
        console.log(p)

        // setTimeout(() => {
        //     vduiLocal.value.hideSeries('Series 1')
        // }, 4000)
        // setTimeout(() => {
        //     vduiLocal.value.showSeries('Series 1')
        //     vduiLocal.value.hideSeries('Series 2')
        // }, 5000)
    }
})
    
</script>

<template>
    <button @click="toggleTable">TOGGLE TABLE</button>
    <button @click="toggleLabels">TOGGLE LABELS</button>
    <div style="margin: 12px 0; color: white">
        Theme:
        <select v-model="currentTheme" @change="step += 1">
            <option v-for="opt in themeOptions">{{ opt }}</option>
        </select>
    </div>

    <Box comp="VueUiParallelCoordinatePlot" :dataset="dataset" :config="config">
        <template #title>VueUiParallelCoordinatePlot</template>

        <template #responsive>
            <div style="width: 600px; height: 600px; resize: both; overflow: auto; background: white">
                <LocalVueUiParallelCoordinatePlot :key="`responsive_${step}`" :dataset="dataset" :config="{
                    ...config,
                    responsive: true
                }">
                    <template #chart-background>
                        <div style="width: 100%; height: 100%; background: radial-gradient(at top left, red, white)"/>
                    </template>
                    
                    <template #plot-comment="{ plot }">
                        <div :style="`width: 100%; text-align:center; color:${plot.color}`">
                            {{  plot.comment }}
                        </div>
                    </template>
                    
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
                </LocalVueUiParallelCoordinatePlot>
            </div>
        </template>

        <template #theme>
            <LocalVueUiParallelCoordinatePlot :dataset="dataset" :config="configTheme" />
        </template>

        <template #local>
            <LocalVueUiParallelCoordinatePlot :dataset="dataset" :config="config" :key="`local_${step}`" @selectDatapoint="selectDatapoint" @selectLegend="selectLegend" ref="local">
                <template #optionPdf>
                    PRINT PDF
                </template>
            </LocalVueUiParallelCoordinatePlot>
        </template>

        <template #VDUI-local>
            <LocalVueDataUi @selectDatapoint="selectDatapoint" @selectLegend="selectLegend" component="VueUiParallelCoordinatePlot" :dataset="dataset" :config="config" :key="`VDUI_local_${step}`" ref="vduiLocal">
            </LocalVueDataUi>
        </template>

        <template #build>
            <VueUiParallelCoordinatePlot @selectDatapoint="selectDatapoint" @selectLegend="selectLegend" :dataset="dataset" :config="config" ref="build"/>
        </template>

        <template #build-treesh>
            <VueUiParallelCoordinatePlotTreeshaken @selectDatapoint="selectDatapoint" @selectLegend="selectLegend" :dataset="dataset" :config="config" ref="build"/>
        </template>

        <template #VDUI-build>
            <VueDataUi @selectDatapoint="selectDatapoint" @selectLegend="selectLegend" component="VueUiParallelCoordinatePlot" :dataset="dataset" :config="config" ref="vduiBuild">
                <template #optionPdf>
                    PRINT PDF
                </template>
            </VueDataUi>
        </template>

        <template #knobs>
            <ConfigKnobs :model="model" @change="step += 1"/>
        </template>
    </Box>
</template>