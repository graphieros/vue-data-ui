<script setup>
import { ref, computed, onMounted } from "vue";
import LocalVueUiHistoryPlot from '../src/components/vue-ui-history-plot.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import { useArena } from "../src/useArena";
import { VueUiHistoryPlot } from "vue-data-ui";
import { VueUiHistoryPlot as VueUiHistoryPlotTreeshaken } from "vue-data-ui/vue-ui-history-plot";
import ConfigKnobs from "./ConfigKnobs.vue";
import { useConfigurationControls } from "./createConfigModel";
import { useConfig } from "../src/useConfig"

const { local, build, vduiLocal, vduiBuild } = useArena();
const { vue_ui_history_plot: DEFAULT_CONFIG } = useConfig();

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
                name: 'Series 1',
                values: [
                    { x: 2, y: 21, label: 'F'},
                    { x: 3, y: 13, label: 'E'},
                    { x: 5, y: 8, label: 'D'},
                    { x: 8, y: 5, label: 'C'},
                    { x: 13, y: 3, label: 'B'},
                    { x: 21, y: 2, label: 'A'},
                ]
            },
            {
                name: 'Series 2',
                values: [
                    { x: 22, y: 2, label: 'T1'},
                    { x: 44, y: 4, label: 'T2'},
                    { x: 65, y: 3, label: 'T3'},
                    { x: 12, y: 2.5, label: 'T4'},
                ],
            },
        ]
    }, 2000)
})

const model = createModel([
    CHECKBOX("debug", { def: true }),
    CHECKBOX("loading", { def: false }),
    CHECKBOX("responsive", { def: false }),
    CHECKBOX("responsiveProportionalSizing", { def: false }),

    CHECKBOX("useCssAnimation", { def: true }),
    TEXT("style.fontFamily", { def: "inherit" }),
    COLOR("style.chart.backgroundColor", { def: "#FFFFFF" }),
    COLOR("style.chart.color", { def: "#1A1A1A" }),
    RANGE("style.chart.height", { def: 500, min: 300, max: 1000 }),
    RANGE("style.chart.width", { def: 600, min: 300, max: 1000 }),

    NUMBER("style.chart.padding.top", { def: 12, min: 0, max: 100 }),
    NUMBER("style.chart.padding.right", { def: 12, min: 0, max: 100 }),
    NUMBER("style.chart.padding.bottom", { def: 12, min: 0, max: 100 }),
    NUMBER("style.chart.padding.left", { def: 12, min: 0, max: 100 }),

    CHECKBOX("style.chart.grid.xAxis.show", { def: true }),
    COLOR("style.chart.grid.xAxis.stroke", { def: "#E1E5E8" }),
    NUMBER("style.chart.grid.xAxis.strokeWidth", { def: 1, min: 0, max: 12 }),

    CHECKBOX("style.chart.grid.horizontalLines.show", { def: true }),
    COLOR("style.chart.grid.horizontalLines.stroke", { def: "#E1E5E8" }),
    NUMBER("style.chart.grid.horizontalLines.strokeWidth", { def: 0.6, min: 0, max: 12, step: 0.1 }),

    CHECKBOX("style.chart.grid.yAxis.show", { def: true }),
    COLOR("style.chart.grid.yAxis.stroke", { def: "#E1E5E8" }),
    NUMBER("style.chart.grid.yAxis.strokeWidth", { def: 1, min: 0, max: 12 }),

    CHECKBOX("style.chart.grid.verticalLines.show", { def: true }),
    COLOR("style.chart.grid.verticalLines.stroke", { def: "#E1E5E8" }),
    NUMBER("style.chart.grid.verticalLines.strokeWidth", { def: 0.6, min: 0, max: 12, step: 0.1 }),

    NUMBER("style.chart.axes.x.scaleMin", { def: null, min: 0, max: 1000 }),
    NUMBER("style.chart.axes.x.scaleMax", { def: null, min: 0, max: 1000 }),
    SELECT("style.chart.axes.x.ticks", [2, 3, 5, 10, 20], { def: 10 }),

    CHECKBOX("style.chart.axes.x.labels.show", { def: true }),
    NUMBER("style.chart.axes.x.labels.fontSize", { def: 16, min: 8, max: 42 }),
    COLOR("style.chart.axes.x.labels.color", { def: "#1A1A1A" }),
    CHECKBOX("style.chart.axes.x.labels.bold", { def: false }),
    NUMBER("style.chart.axes.x.labels.rounding", { def: 1, min: 0, max: 1 }),
    NUMBER("style.chart.axes.x.labels.rotation", { def: 0, min: -90, max: 90 }),
    NUMBER("style.chart.axes.x.labels.autoRotate.angle", { def: -90, min: -90, max: 90 }),

    TEXT("style.chart.axes.x.labels.prefix", { def: "" }),
    TEXT("style.chart.axes.x.labels.suffix", { def: "" }),

    TEXT("style.chart.axes.x.name.text", { def: "X AXIS" }),
    NUMBER("style.chart.axes.x.name.fontSize", { def: 16, min: 8, max: 42 }),
    NUMBER("style.chart.axes.x.name.offsetX", { def: 0, min: -100, max: 100 }),
    NUMBER("style.chart.axes.x.name.offsetY", { def: 0, min: -100, max: 100 }),
    CHECKBOX("style.chart.axes.x.name.bold", { def: false }),

    NUMBER("style.chart.axes.y.scaleMin", { def: null, min: 0, max: 1000 }),
    NUMBER("style.chart.axes.y.scaleMax", { def: null, min: 0, max: 1000 }),
    SELECT("style.chart.axes.y.ticks", [2, 3, 5, 10, 20], { def: 10 }),
    TEXT("style.chart.axes.y.name.text", { def: "Y AXIS" }),
    NUMBER("style.chart.axes.y.name.fontSize", { def: 16, min: 8, max: 42 }),
    NUMBER("style.chart.axes.y.name.offsetX", { def: 0, min: -100, max: 100 }),
    NUMBER("style.chart.axes.y.name.offsetY", { def: 0, min: -100, max: 100 }),
    CHECKBOX("style.chart.axes.y.name.bold", { def: false }),

    SELECT("style.chart.legend.position", ["top", "bottom"], { def: "bottom" }),

    RANGE("style.chart.plots.radius", { def: 16, min: 8, max: 42 }),
    COLOR("style.chart.plots.stroke", { def: "#FFFFFF" }),
    NUMBER("style.chart.plots.strokeWidth", { def: 1, min: 0, max: 12 }),
    CHECKBOX("style.chart.plots.gradient.show", { def: true }),
    RANGE("style.chart.plots.gradient.intensity", { def: 40, min: 0, max: 100 }),

    CHECKBOX("style.chart.plots.indexLabels.show", { def: true }),
    CHECKBOX("style.chart.plots.indexLabels.startAtZero", { def: false }),
    CHECKBOX("style.chart.plots.indexLabels.adaptColorToBackground", { def: true }),
    COLOR("style.chart.plots.indexLabels.color", { def: "#1A1A1A" }),
    NUMBER("style.chart.plots.indexLabels.fontSize", { def: 16, min: 8, max: 42 }),
    CHECKBOX("style.chart.plots.indexLabels.bold", { def: false }),
    NUMBER("style.chart.plots.indexLabels.offsetY", { def: 0, min: -100, max: 100 }),
    NUMBER("style.chart.plots.indexLabels.offsetX", { def: 0, min: -100, max: 100 }),

    CHECKBOX("style.chart.plots.labels.show", { def: true }),
    NUMBER("style.chart.plots.labels.fontSize", { def: 10, min: 8, max: 42 }),
    COLOR("style.chart.plots.labels.color", { def: "#1A1A1A" }),
    CHECKBOX("style.chart.plots.labels.bold", { def: false }),
    NUMBER("style.chart.plots.labels.offsetX", { def: 0, min: -100, max: 100 }),
    NUMBER("style.chart.plots.labels.offsetY", { def: 0, min: -100, max: 100 }),

    CHECKBOX("style.chart.paths.show", { def: true }),
    NUMBER("style.chart.paths.strokeWidth", { def: 1.6, min: 0, max: 12, step: 0.1 }),
    CHECKBOX("style.chart.paths.useSerieColor", { def: true }),
    COLOR("style.chart.paths.stroke", { def: "#1A1A1A" }),

    TEXT("style.chart.title.text", { def: "Title" }),
    TEXT("style.chart.title.subtitle.text", { def: "Subtitle" }),

    CHECKBOX("userOptions.showOnChartHover", { def: true }),
    CHECKBOX("userOptions.keepStateOnChartLeave", { def: true }),

    NUMBER("userOptions.print.scale", { def: 2, min: 1, max: 5 }),
    CHECKBOX("userOptions.print.allowTaint", { def: true }),
    CHECKBOX("userOptions.print.useCORS", { def: true }),
    COLOR("userOptions.print.backgroundColor", { def: "#FFFFFF" }),

    CHECKBOX("table.show", { def: false }),
    CHECKBOX("table.useDialog", { def: true })
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
                console.log('enter event', { datapoint, seriesIndex });
            },
            datapointLeave: ({ datapoint, seriesIndex }) => {
                console.log('leave event', { datapoint, seriesIndex });
            },
            datapointClick: ({ datapoint, seriesIndex }) => {
                console.log('click event', { datapoint, seriesIndex });
            }
        },
        theme: currentTheme.value,
        // style: {
        //     ...c.style,
        //     chart: {
        //         ...c.style.chart,
        //         tooltip: {
        //             customFormat: ({ datapoint, seriesIndex, plotIndex, series, config }) => {
        //                 console.log({
        //                     datapoint,
        //                     seriesIndex,
        //                     plotIndex,
        //                     series,
        //                     config
        //                 })
        //                 return 'TEST'
        //             }
        //         }
        //     }
        // }
    }
});

const step = ref(0);

onMounted(async() => {
    if (local.value) {
        const img = await local.value.getImage()
        console.log(img)

        // setTimeout(() => {
        //     local.value.hideSeries('Series 1')
        // }, 4000)

        // setTimeout(() => {
        //     local.value.showSeries('Series 1')
        //     local.value.hideSeries('Series 2')
        // }, 5000)
    }
})

</script>

<template>
    <div style="margin: 12px 0; color: white">
        Theme:
        <select v-model="currentTheme" @change="step += 1">
            <option v-for="opt in themeOptions">{{ opt }}</option>
        </select>
    </div>

    <Box>
        <template #title>VueUiHistoryPlot</template>

        <template #responsive>
            <div style="width: 600px; height: 600px; resize: both; overflow: auto; background: white">
                <LocalVueUiHistoryPlot :key="`responsive_${step}`" :dataset="dataset" :config="{
                    ...config,
                    responsive: true
                }">
                    <template #chart-background>
                        <div style="width: 100%; height: 100%; background: radial-gradient(at top left, red, white)"/>
                    </template>
                </LocalVueUiHistoryPlot>
            </div>
        </template>

        <template #theme>
            <LocalVueUiHistoryPlot :dataset="dataset" :config="configTheme" />
        </template>

        <template #local>
            <LocalVueUiHistoryPlot :dataset="dataset" :config="config" ref="local"/>
        </template>

        <template #VDUI-local>
            <LocalVueDataUi component="VueUiHistoryPlot" :dataset="dataset" :config="config"/>
        </template>

        <template #build>
            <VueUiHistoryPlot :dataset="dataset" :config="config"/>
        </template>

        <template #build-treesh>
            <VueUiHistoryPlotTreeshaken :dataset="dataset" :config="config"/>
        </template>

        <template #VDUI-build>
            <VueDataUi component="VueUiHistoryPlot" :dataset="dataset" :config="config" />
        </template>

        <template #knobs>
            <ConfigKnobs :model="model" @change="step += 1"/>
        </template>

        <template #config>
            {{ config }}
        </template>
    </Box>
</template>