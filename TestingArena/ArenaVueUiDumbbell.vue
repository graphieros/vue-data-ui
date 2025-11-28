<script setup>
import { ref, computed, onMounted } from "vue";
import LocalVueUiDumbbell from '../src/components/vue-ui-dumbbell.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import { useArena } from "../src/useArena";

import { VueUiDumbbell } from "vue-data-ui";
import { VueUiDumbbell as VueUiDumbbellTreeshaken } from "vue-data-ui/vue-ui-dumbbell";
import ConfigKnobs from "./ConfigKnobs.vue";
import { useConfigurationControls } from "./createConfigModel";
import { useConfig } from "../src/useConfig"

const { local, build, vduiLocal, vduiBuild, toggleTable } = useArena();
const { vue_ui_dumbbell: DEFAULT_CONFIG } = useConfig();

const {
    CHECKBOX,
    NUMBER,
    RANGE,
    TEXT,
    COLOR,
    SELECT,
    createModel
} = useConfigurationControls(DEFAULT_CONFIG);

const dataset =  ref(undefined)

onMounted(() => {
    setTimeout(() => {
        dataset.value = [
            { name: 'Sweden', start: 5000, end: 5000 },
            { name: 'Korea, Rep.', start: null, end: 7050 },
            { name: 'Iceland', start: null, end: null },
            { name: 'Finland', start: 6400, end: 7600 },
            { name: 'Norway', start: 5400, end: 6050 },
            { name: 'Ireland', start: 3000, end: 2000 },
            { name: 'Sweden', start: 5000, end: 7100 },
            { name: 'Korea, Rep.', start: 4900, end: 7050 },
            { name: 'Iceland', start: 6500, end: 8000 },
            { name: 'Finland', start: 6400, end: 7600 },
            { name: 'Norway', start: 5400, end: 6050 },
            { name: 'Ireland', start: 3000, end: 2000 },
        ]
    }, 2000)

    setTimeout(() => {
        dataset.value.push({
            name: 'ALT',
            start: 3000,
            end: 3500
        })
    }, 4000)
})

const model = createModel([
    CHECKBOX("debug", { def: true }),
    CHECKBOX("loading", { def: false }),
    CHECKBOX("responsive", { def: false }),
    CHECKBOX("userOptions.show", { def: true }),
    CHECKBOX("userOptions.buttons.pdf", { def: true }),
    CHECKBOX("userOptions.buttons.csv", { def: true }),
    CHECKBOX("userOptions.buttons.img", { def: true }),
    CHECKBOX("userOptions.buttons.table", { def: true }),
    CHECKBOX("userOptions.buttons.fullscreen", { def: true }),
    SELECT("userOptions.position", ["left", "right"], { def: "right" }),
    CHECKBOX("userOptions.showOnChartHover", { def: true }),
    CHECKBOX("userOptions.keepStateOnChartLeave", { def: true }),

    NUMBER("userOptions.print.scale", { def: 2, min: 1, max: 5 }),
    CHECKBOX("userOptions.print.allowTaint", { def: true }),
    CHECKBOX("userOptions.print.useCORS", { def: true }),
    COLOR("userOptions.print.backgroundColor", { def: "#FFFFFF" }),

    CHECKBOX("useAnimation", { def: true }),
    NUMBER("animationSpeed", { def: 2, min: 1, max: 10 }),
    TEXT("style.fontFamily", { def: "inherit" }),
    COLOR("style.chart.backgroundColor", { def: "#FFFFFF" }),
    COLOR("style.chart.color", { def: "#1A1A1A" }),
    NUMBER("style.chart.width", { def: 600, min: 300, max: 1000 }),
    NUMBER("style.chart.rowHeight", { def: 48, min: 40, max: 100 }),
    NUMBER("style.chart.padding.top", { def: 12, min: 0, max: 100 }),
    NUMBER("style.chart.padding.left", { def: 12, min: 0, max: 100 }),
    NUMBER("style.chart.padding.right", { def: 24, min: 0, max: 100 }),
    NUMBER("style.chart.padding.bottom", { def: 12, min: 0, max: 100 }),
    COLOR("style.chart.plots.startColor", { def: "#FF6400" }),
    COLOR("style.chart.plots.endColor", { def: "#5F8BEE" }),
    CHECKBOX("style.chart.plots.evaluationColors.enable", { def: true }),

    COLOR("style.chart.plots.evaluationColors.positive", { def: "#2ca02c" }),
    COLOR("style.chart.plots.evaluationColors.negative", { def: "#d62728" }),
    COLOR("style.chart.plots.evaluationColors.neutral", { def: "#c7c7c7" }),

    NUMBER("style.chart.plots.radius", { def: 6, min: 2, max: 40 }),
    COLOR("style.chart.plots.stroke", { def: "#FFFFFF" }),
    NUMBER("style.chart.plots.strokeWidth", { def: 1, min: 0, max: 12 }),
    NUMBER("style.chart.plots.link.strokeWidth", { def: 2, min: 0, max: 12 }),
    SELECT("style.chart.plots.link.type", ["curved", "line"], { def: "curved" }),
    CHECKBOX("style.chart.plots.gradient.show", { def: true }),
    RANGE("style.chart.plots.gradient.intensity", { def: 40, min: 0, max: 100 }),

    NUMBER("style.chart.grid.strokeWidth", { def: 1, min: 0, max: 12 }),
    NUMBER("style.chart.grid.scaleSteps", { def: 10, min: 2, max: 20 }),
    NUMBER("style.chart.grid.scaleMin", { def: null, min: -100, max: 200 }),
    NUMBER("style.chart.grid.scaleMax", { def: null, min: -100, max: 100 }),

    CHECKBOX("style.chart.grid.horizontalGrid.show", { def: true }),
    COLOR("style.chart.grid.horizontalGrid.stroke", { def: "#CCCCCC" }),
    NUMBER("style.chart.grid.horizontalGrid.strokeWidth", { def: 0.5, min: 0, max: 12, step: 0.5 }),
    NUMBER("style.chart.grid.horizontalGrid.strokeDasharray", { def: 4, min: 0, max: 100 }),
    CHECKBOX("style.chart.grid.verticalGrid.show", { def: true }),
    COLOR("style.chart.grid.verticalGrid.stroke", { def: "#CCCCCC" }),
    NUMBER("style.chart.grid.verticalGrid.strokeWidth", { def: 0.5, min: 0, max: 12, step: 0.5 }),
    NUMBER("style.chart.grid.verticalGrid.strokeDasharray", { def: 0, min: 0, max: 100 }),

    TEXT("style.chart.labels.prefix", { def: "P" }),
    TEXT("style.chart.labels.suffix", { def: "S" }),

    TEXT("style.chart.labels.axis.yLabel", { def: "Y label" }),
    TEXT("style.chart.labels.axis.xLabel", { def: "X label" }),
    NUMBER("style.chart.labels.axis.yLabelOffsetX", { def: 0, min: -100, max: 100 }),
    NUMBER("style.chart.labels.axis.xLabelOffsetY", { def: 0, min: -100, max: 100 }),
    NUMBER("style.chart.labels.axis.fontSize", { def: 14, min: 8, max: 42 }),
    COLOR("style.chart.labels.axis.color", { def: "#1A1A1A" }),

    CHECKBOX("style.chart.labels.yAxisLabels.show", { def: true }),
    NUMBER("style.chart.labels.yAxisLabels.fontSize", { def: 14, min: 8, max: 48 }),
    COLOR("style.chart.labels.yAxisLabels.color", { def: "#1A1A1A" }),
    NUMBER("style.chart.labels.yAxisLabels.offsetX", { def: 0, min: -100, max: 100 }),
    CHECKBOX("style.chart.labels.yAxisLabels.bold", { def: true }),
    CHECKBOX("style.chart.labels.yAxisLabels.showProgression", { def: true }),
    NUMBER("style.chart.labels.yAxisLabels.rounding", { def: 1, min: 0, max: 12 }),

    CHECKBOX("style.chart.labels.xAxisLabels.show", { def: true }),
    NUMBER("style.chart.labels.xAxisLabels.fontSize", { def: 14, min: 8, max: 48 }),
    COLOR("style.chart.labels.xAxisLabels.color", { def: "#1A1A1A" }),
    NUMBER("style.chart.labels.xAxisLabels.offsetY", { def: 0, min: -100, max: 100 }),
    CHECKBOX("style.chart.labels.xAxisLabels.bold", { def: false }),
    NUMBER("style.chart.labels.xAxisLabels.rounding", { def: 2, min: 0, max: 12 }),
    NUMBER("style.chart.labels.xAxisLabels.autoRotate.angle", { def: -90, min: -90, max: 90 }),

    CHECKBOX("style.chart.labels.startLabels.show", { def: true }),
    NUMBER("style.chart.labels.startLabels.fontSize", { def: 10, min: 8, max: 24 }),
    COLOR("style.chart.labels.startLabels.color", { def: "#1A1A1A" }),
    NUMBER("style.chart.labels.startLabels.offsetY", { def: 0, min: -100, max: 100 }),
    NUMBER("style.chart.labels.startLabels.rounding", { def: 2, min: 0, max: 12 }),
    CHECKBOX("style.chart.labels.startLabels.useStartColor", { def: true }),
    CHECKBOX("style.chart.labels.startLabels.useEvaluationColor", { def: true }),

    CHECKBOX("style.chart.labels.endLabels.show", { def: true }),
    NUMBER("style.chart.labels.endLabels.fontSize", { def: 10, min: 8, max: 24 }),
    COLOR("style.chart.labels.endLabels.color", { def: "#1A1A1A" }),
    NUMBER("style.chart.labels.endLabels.offsetY", { def: 0, min: -100, max: 100 }),
    NUMBER("style.chart.labels.endLabels.rounding", { def: 2, min: 0, max: 12 }),
    CHECKBOX("style.chart.labels.endLabels.useEndColor", { def: true }),
    CHECKBOX("style.chart.labels.endLabels.useEvaluationColor", { def: true }),

    CHECKBOX("style.chart.legend.show", { def: true }),
    TEXT("style.chart.legend.labelStart", { def: "start" }),
    TEXT("style.chart.legend.labelEnd", { def: "end" }),
    COLOR("style.chart.legend.backgroundColor", { def: "#FFFFFF" }),
    COLOR("style.chart.legend.color", { def: "#1A1A1A" }),
    NUMBER("style.chart.legend.fontSize", { def: 14, min: 8, max: 48 }),
    CHECKBOX("style.chart.legend.bold", { def: false }),
    SELECT("style.chart.legend.position", ["top", "bottom"], { def: "bottom" }),

    TEXT("style.chart.title.text", { def: "Lorem ipsum dolor sit amet" }),
    COLOR("style.chart.title.color", { def: "#1A1A1A" }),
    NUMBER("style.chart.title.fontSize", { def: 20, min: 8, max: 48 }),
    CHECKBOX("style.chart.title.bold", { def: true }),
    COLOR("style.chart.title.subtitle.color", { def: "#CCCCCC" }),
    TEXT("style.chart.title.subtitle.text", { def: "Lorem ipsum dolor sit amet" }),
    NUMBER("style.chart.title.subtitle.fontSize", { def: 16, min: 8, max: 48 }),
    CHECKBOX("style.chart.title.subtitle.bold", { def: false }),

    CHECKBOX("table.show", { def: false }),
    CHECKBOX("table.useDialog", { def: true }),

    NUMBER("table.responsiveBreakpoint", { def: 300, min: 300, max: 800 }),
    TEXT("table.columnNames.series", { def: "Series" }),
    TEXT("table.columnNames.start", { def: "Start value" }),
    TEXT("table.columnNames.end", { def: "End value" }),
    TEXT("table.columnNames.progression", { def: "Progression" }),
    COLOR("table.th.backgroundColor", { def: "#FFFFFF" }),
    COLOR("table.th.color", { def: "#1A1A1A" }),
    TEXT("table.th.outline", { def: "none" }),
    COLOR("table.td.backgroundColor", { def: "#FFFFFF" }),
    COLOR("table.td.color", { def: "#1A1A1A" }),
    TEXT("table.td.outline", { def: "none" }),
    NUMBER("table.td.roundingValue", { def: 2, min: 0, max: 12 }),
    NUMBER("table.td.roundingPercentage", { def: 2, min: 0, max: 12 })
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
                    },
                    // yAxisLabels: {
                    //     ...c.style.chart.labels.yAxisLabels,
                    //     formatter: (v) => {
                    //         console.log(v);
                    //         return v.value
                    //     }
                    // }
                }
            }
        },
        theme: currentTheme.value
    }
})

const step = ref(0);

onMounted(async () => {
    if (local.value) {
        const img = await local.value.getImage()
        console.log(img)
    }
})

</script>

<template>
    <button @click="toggleTable">TOGGLE TABLE</button>

    <div style="margin: 12px 0; color: white">
        Theme:
        <select v-model="currentTheme" @change="step += 1">
            <option v-for="opt in themeOptions">{{ opt }}</option>
        </select>
    </div>

    <Box comp="VueUiDumbbell" :dataset="dataset">
        <template #title>VueUiDumbbell</template>

        <template #responsive>
            <div style="width: 600px; height: 600px; resize: both; overflow: auto; background: white">
                <LocalVueUiDumbbell :key="`responsive_${step}`" :dataset="dataset" :config="{
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
                </LocalVueUiDumbbell>
            </div>
        </template>

        <template #theme>
            <LocalVueUiDumbbell :dataset="dataset" :config="configTheme" />
        </template>

        <template #local>
            <LocalVueUiDumbbell :dataset="dataset" :config="config" :key="`local_${step}`" ref="local">
                <template #optionPdf>
                    PRINT PDF
                </template>
                <template #svg="{ svg }">
                    <circle :cx="30" :cy="30" :r="30" fill="#42d392" />
                    <text :x="30" :y="30" text-anchor="middle">#SVG</text>
                </template>
                <template #legend="{ legend }">
                    #LEGEND
                    <div style="font-size: 8px">
                        {{ legend }}
                    </div>
                </template>
            </LocalVueUiDumbbell>
        </template>

        <template #VDUI-local>
            <LocalVueDataUi component="VueUiDumbbell" :dataset="dataset" :config="config" :key="`vdui_local_${step}`" ref="vduiLocal">
                <template #svg="{ svg }">
                    <circle :cx="30" :cy="30" :r="30" fill="#42d392" />
                    <text :x="30" :y="30" text-anchor="middle">#SVG</text>
                </template>
                <template #legend="{ legend }">
                    #LEGEND
                    <div style="font-size: 8px">
                        {{ legend }}
                    </div>
                </template>
            </LocalVueDataUi>
        </template>

        <template #build>
            <VueUiDumbbell :dataset="dataset" :config="config" :key="`build_${step}`" ref="build">
                <template #svg="{ svg }">
                    <circle :cx="30" :cy="30" :r="30" fill="#42d392" />
                    <text :x="30" :y="30" text-anchor="middle">#SVG</text>
                </template>
                <template #legend="{ legend }">
                    #LEGEND
                    <div style="font-size: 8px">
                        {{ legend }}
                    </div>
                </template>
            </VueUiDumbbell>
        </template>

        <template #build-treesh>
            <VueUiDumbbellTreeshaken :dataset="dataset" :config="config" :key="`build_${step}`" ref="build">
                <template #svg="{ svg }">
                    <circle :cx="30" :cy="30" :r="30" fill="#42d392" />
                    <text :x="30" :y="30" text-anchor="middle">#SVG</text>
                </template>
                <template #legend="{ legend }">
                    #LEGEND
                    <div style="font-size: 8px">
                        {{ legend }}
                    </div>
                </template>
            </VueUiDumbbellTreeshaken>
        </template>

        <template #VDUI-build>
            <VueDataUi component="VueUiDumbbell" :dataset="dataset" :config="config" :key="`vdui_build_${step}`" ref="vduiBuild">
                <template #svg="{ svg }">
                    <circle :cx="30" :cy="30" :r="30" fill="#42d392" />
                    <text :x="30" :y="30" text-anchor="middle">#SVG</text>
                </template>
                <template #legend="{ legend }">
                    #LEGEND
                    <div style="font-size: 8px">
                        {{ legend }}
                    </div>
                </template>
            </VueDataUi>
        </template>

        <template #knobs>
            <ConfigKnobs :model="model" @change="step += 1"/>
        </template>

        <template #config>
            {{ config }}
        </template>
    </Box>
</template>