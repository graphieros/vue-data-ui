<script setup>
import { ref, computed, onMounted } from "vue";
import LocalVueUiDonutEvolution from '../src/components/vue-ui-donut-evolution.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import { useArena } from "../src/useArena";

import { VueUiDonutEvolution } from "vue-data-ui";
import { VueUiDonutEvolution as VueUiDonutEvolutionTreeshaken } from "vue-data-ui/vue-ui-donut-evolution";
import ConfigKnobs from "./ConfigKnobs.vue";
import { useConfigurationControls } from "./createConfigModel";
import { useConfig } from "../src/useConfig"
import useThemeOptions from "./useThemeOptions";

const { local, build, vduiLocal, vduiBuild, toggleTable } = useArena();
const { vue_ui_donut_evolution: DEFAULT_CONFIG } = useConfig();

const {
    CHECKBOX,
    NUMBER,
    RANGE,
    TEXT,
    COLOR,
    SELECT,
    createModel
} = useConfigurationControls(DEFAULT_CONFIG);

const dataset = ref([])
onMounted(() => {
    dataset.value = undefined;
    setTimeout(() => {
        dataset.value = [
            {
                name: "Serie 1",
                values: [55.123425162, 34, 21, 13, 8, 5, 8, 13, 21, 34, 55],
            },
            {
                name: "Serie 2",
                values: [50, 50, 50, 50, 50, 50, 50, 50, 50, 50 ]
            },
            {
                name: "Serie 3",
                values: [50, 50, 50, 50, 50, 50, 50, 50, 50, 50 ]
            },
        ]
    }, 2000)
})

const monthValues = computed(() => {
  const yearStart = 2026
  const arr = []

  for (let i = 0; i < 13; i++) {
    const d = new Date(yearStart, i, 1)
    arr.push(d.getTime())
  }

  console.log(arr)

  return arr
})

const model = createModel([
    CHECKBOX("loading", { def: false }),
    CHECKBOX("debug", { def: true }),
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

    TEXT("style.fontFamily", { def: "inherit" }),
    COLOR("style.chart.backgroundColor", { def: "#FFFFFF" }),
    COLOR("style.chart.color", { def: "#1A1A1A" }),
    NUMBER("style.chart.layout.height", { def: 316, min: 200, max: 800 }),
    NUMBER("style.chart.layout.width", { def: 500, min: 300, max: 1200 }),

    NUMBER("style.chart.layout.padding.top", { def: 0, min: 0, max: 100 }),
    NUMBER("style.chart.layout.padding.left", { def: 0, min: 0, max: 100 }),
    NUMBER("style.chart.layout.padding.right", { def: 0, min: 0, max: 100 }),
    NUMBER("style.chart.layout.padding.bottom", { def: 0, min: 0, max: 100 }),

    CHECKBOX("style.chart.layout.grid.show", { def: true }),
    COLOR("style.chart.layout.grid.stroke", { def: "#e1e5e8" }),
    NUMBER("style.chart.layout.grid.strokeWidth", { def: 0.7, min: 0.5, max: 12, step: 0.1 }),
    CHECKBOX("style.chart.layout.grid.showVerticalLines", { def: true }),

    CHECKBOX("style.chart.layout.grid.yAxis.dataLabels.show", { def: true }),
    NUMBER("style.chart.layout.grid.yAxis.dataLabels.fontSize", { def: 10, min: 8, max: 24 }),
    COLOR("style.chart.layout.grid.yAxis.dataLabels.color", { def: "#1A1A1A" }),
    NUMBER("style.chart.layout.grid.yAxis.dataLabels.roundingValue", { def: 2, min: 0, max: 12 }),
    NUMBER("style.chart.layout.grid.yAxis.dataLabels.offsetX", { def: 0, min: -100, max: 100 }),
    CHECKBOX("style.chart.layout.grid.yAxis.dataLabels.bold", { def: false }),
    NUMBER("style.chart.layout.grid.yAxis.dataLabels.steps", { def: 10, min: 2, max: 20 }),
    CHECKBOX('style.chart.layout.grid.yAxis.autoScale', { def: false }),
    NUMBER('style.chart.layout.grid.yAxis.scaleMin', { def: null }),
    NUMBER('style.chart.layout.grid.yAxis.scaleMax', { def: null }),

    CHECKBOX("style.chart.layout.grid.xAxis.dataLabels.show", { def: true }),
    NUMBER("style.chart.layout.grid.xAxis.dataLabels.fontSize", { def: 8, min: 8, max: 24 }),
    CHECKBOX("style.chart.layout.grid.xAxis.dataLabels.showOnlyFirstAndLast", { def: false }),
    COLOR("style.chart.layout.grid.xAxis.dataLabels.color", { def: "#1A1A1A" }),
    NUMBER("style.chart.layout.grid.xAxis.dataLabels.rotation", { def: 0, min: -360, max: 360 }),
    NUMBER("style.chart.layout.grid.xAxis.dataLabels.autoRotate.angle", { def: -90, min: -90, max: 90 }),
    NUMBER("style.chart.layout.grid.xAxis.dataLabels.offsetY", { def: 0, min: -100, max: 100 }),

    TEXT("style.chart.layout.grid.axis.yLabel", { def: "THIS IS Y LABEL" }),
    TEXT("style.chart.layout.grid.axis.xLabel", { def: "THIS IS X LABEL" }),
    NUMBER("style.chart.layout.grid.axis.yLabelOffsetX", { def: 0, min: 0, max: 100 }),
    NUMBER("style.chart.layout.grid.axis.xLabelOffsetY", { def: 0, min: 0, max: 100 }),
    NUMBER("style.chart.layout.grid.axis.fontSize", { def: 14, min: 8, max: 42 }),
    COLOR("style.chart.layout.grid.axis.color", { def: "#1A1A1A" }),

    CHECKBOX("style.chart.layout.line.show", { def: true }),
    COLOR("style.chart.layout.line.stroke", { def: "#CCCCCC" }),
    NUMBER("style.chart.layout.line.strokeWidth", { def: 4, min: 0, max: 24 }),

    COLOR("style.chart.layout.highligter.color", { def: "#1A1A1A" }),
    RANGE("style.chart.layout.highlighter.opacity", { def: 5, min: 0, max: 100 }),

    CHECKBOX("style.chart.layout.dataLabels.show", { def: true }),
    NUMBER("style.chart.layout.dataLabels.fontSize", { def: 10, min: 8, max: 48 }),
    COLOR("style.chart.layout.dataLabels.color", { def: "#1A1A1A" }),
    CHECKBOX("style.chart.layout.dataLabels.bold", { def: false }),
    NUMBER("style.chart.layout.dataLabels.rounding", { def: 2, min: 0, max: 12 }),
    TEXT("style.chart.layout.dataLabels.prefix", { def: "P" }),
    TEXT("style.chart.layout.dataLabels.suffix", { def: "S" }),
    NUMBER("style.chart.layout.dataLabels.offsetY", { def: 0, min: -100, max: 100 }),

    TEXT("style.chart.title.text", { def: "Lorem ipsum dolor sit amet" }),
    COLOR("style.chart.title.color", { def: "#1A1A1A" }),
    NUMBER("style.chart.title.fontSize", { def: 20, min: 8, max: 48 }),
    CHECKBOX("style.chart.title.bold", { def: true }),
    COLOR("style.chart.title.subtitle.color", { def: "#CCCCCC" }),
    TEXT("style.chart.title.subtitle.text", { def: "Lorem ipsum dolor sit amet" }),
    NUMBER("style.chart.title.subtitle.fontSize", { def: 16, min: 8, max: 48 }),
    CHECKBOX("style.chart.title.subtitle.bold", { def: false }),

    COLOR("style.chart.legend.color", { def: "#1A1A1A" }),
    COLOR("style.chart.legend.backgroundColor", { def: "#FFFFFF" }),
    CHECKBOX("style.chart.legend.bold", { def: false }),
    CHECKBOX("style.chart.legend.show", { def: true }),
    NUMBER("style.chart.legend.fontSize", { def: 16, min: 8, max: 48 }),
    NUMBER("style.chart.legend.roundingPercentage", { def: 2, min: 0, max: 12 }),
    NUMBER("style.chart.legend.roundingValue", { def: 2, min: 0, max: 12 }),
    CHECKBOX("style.chart.legend.showValue", { def: true }),
    CHECKBOX("style.chart.legend.showPercentage", { def: false }),
    SELECT("style.chart.legend.position", ["top", "bottom"], { def: "bottom" }),
    CHECKBOX('style.chart.legend.selectAllToggle.show', { def: true }),

    NUMBER("table.responsiveBreakpoint", { def: 400, min: 300, max: 800 }),
    TEXT("table.columnNames.period", { def: "Period" }),
    TEXT("table.columnNames.total", { def: "Total" }),
    COLOR("table.td.backgroundColor", { def: "#FFFFFF" }),
    COLOR("table.td.color", { def: "#1A1A1A" }),
    TEXT("table.td.outline", { def: "none" }),
    COLOR("table.th.backgroundColor", { def: "#FFFFFF" }),
    COLOR("table.th.color", { def: "#1A1A1A" }),
    TEXT("table.th.outline", { def: "none" }),
    NUMBER("table.td.roundingValue", { def: 2, min: 0, max: 12 }),
    NUMBER("table.td.roundingPercentage", { def: 2, min: 0, max: 12 }),

    CHECKBOX("style.chart.zoom.show", { def: true }),
    RANGE('style.chart.zoom.maxWidth', { def: null, min: 100, max: 1000 }),
    NUMBER("style.chart.zoom.fontSize", { def: 14, min: 8, max: 48 }),
    COLOR("style.chart.zoom.color", { def: "#CCCCCC" }),
    COLOR("style.chart.zoom.highlightColor", { def: "#1A1A1A" }),
    CHECKBOX("style.chart.zoom.useResetSlot", { def: false }),
    NUMBER("style.chart.zoom.startIndex", { def: null, min: 0, max: 100 }),
    NUMBER("style.chart.zoom.endIndex", { def: null, min: 0, max: 100 }),
    CHECKBOX("style.chart.zoom.enableRangeHandles", { def: true }),
    CHECKBOX("style.chart.zoom.enableSelectionDrag", { def: true }),
    CHECKBOX("style.chart.zoom.focusOnDrag", { def: true }),
    NUMBER("style.chart.zoom.focusRangeRatio", { def: 0.2, min: 0.1, max: 0.9, step: 0.1 }),

    CHECKBOX("table.show", { def: false }),
    CHECKBOX("table.useDialog", { def: true })
]);

const { themeOptions, currentTheme } = useThemeOptions();

const configTheme = computed(() => ({ theme: currentTheme.value }));

const config = computed(() => {
    const c = convertArrayToObject(model.value)
    return {
        ...c,
        // skeletonConfig: {
        //     style: {
        //         chart: {
        //             backgroundColor: '#FF0000'
        //         }
        //     }
        // },
        // events: {
        //     datapointEnter: ({ datapoint, seriesIndex }) => {
        //         console.log('enter event', { datapoint, seriesIndex })
        //     },
        //     datapointLeave: ({ datapoint, seriesIndex }) => {
        //         console.log('leave event', { datapoint, seriesIndex });
        //     },
        //     datapointClick: ({ datapoint, seriesIndex }) => {
        //         console.log('click event', { datapoint, seriesIndex });
        //     }
        // },
        theme: currentTheme.value,
        customPalette: ['#6376DD', "#DD3322", "#66DDAA"],
        style: {
            ...c.style,
            chart: {
                ...c.style.chart,
                layout: {
                    ...c.style.chart.layout,
                    dataLabels: {
                        ...c.style.chart.layout.dataLabels,
                        formatter: ({value, config}) => {
                            return `f | ${value}`
                        }
                    },
                    grid: {
                        ...c.style.chart.layout.grid,
                        xAxis: {
                            ...c.style.chart.layout.grid.xAxis,
                            dataLabels: {
                                ...c.style.chart.layout.grid.xAxis.dataLabels,
                                values: monthValues.value,
                                datetimeFormatter: {
                                enable: true,
                                locale: 'it',
                                useUTC: false,
                                januaryAsYear: true,
                                options: { 
                                    year: 'yyyy',
                                    month: `MMMM`,
                                    day: 'dd MMM',
                                    hour: 'HH:mm',
                                    minute: 'HH:mm:ss',
                                    second: 'HH:mm:ss'
                                }
                            }
                            }
                        }
                    }
                }
            }
        }
    }
})

function selectLegend(legend) {
    console.log({ legend })
}

const step = ref(0)

onMounted(async() => {
    if (vduiLocal.value) {
        const img = await vduiLocal.value.getImage();
        console.log(img);

        // setTimeout(() => {
        //     vduiLocal.value.hideSeries('Serie 1')
        // }, 4000)
        // setTimeout(() => {
        //     vduiLocal.value.showSeries('Serie 1')
        //     vduiLocal.value.hideSeries('Serie 2')
        // }, 5000)
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

    <Box comp="VueUiDonutEvolution" :dataset="dataset" :config="config">
        <template #title>VueUiDonutEvolution</template>

        <template #responsive>
            <div style="width: 600px; height: 600px; resize: both; overflow: auto; background: white">
                <LocalVueUiDonutEvolution component="VueUiDonut" :dataset="dataset" :config="{
                    ...config,
                    responsive: true
                }">
                </LocalVueUiDonutEvolution>
            </div>
        </template>

        <template #theme>
            <LocalVueUiDonutEvolution :dataset="dataset" :config="configTheme" />
        </template>

        <template #local>
            <LocalVueUiDonutEvolution :dataset="dataset" :config="config" :key="`local_${step}`" @selectLegend="selectLegend" ref="local">
                <template #chart-background>
                    <div style="width: 100%; height: 100%; background: radial-gradient(at top left, red, white)"/>
                </template>
                <template #optionPdf>
                    PRINT PDF
                </template>
                <template #svg="{ svg }">
                    <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#42d392" />
                    <text :x="svg.width / 2" :y="svg.height / 2" text-anchor="middle">#SVG</text>
                </template>
                <!-- <template #legend="{ legend }">
                    #LEGEND
                    <div style="font-size: 8px">
                        {{ legend }}
                    </div>
                </template> -->
                <template #reset-action="{ reset }">
                    <button @click="reset()">REFRESH</button>
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
            </LocalVueUiDonutEvolution>
        </template>

        <template #VDUI-local>
            <LocalVueDataUi component="VueUiDonutEvolution" :dataset="dataset" :config="config" :key="`vdui_local_${step}`" @selectLegend="selectLegend" ref="vduiLocal">
                <template #svg="{ svg }">
                    <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#42d392" />
                    <text :x="svg.width / 2" :y="svg.height / 2" text-anchor="middle">#SVG</text>
                </template>
                <template #legend="{ legend }">
                    #LEGEND
                    <div style="font-size: 8px">
                        {{ legend }}
                    </div>
                </template>
                <template #reset-action="{ reset }">
                    <button @click="reset()">REFRESH</button>
                </template>
            </LocalVueDataUi>
        </template>

        <template #build>
            <VueUiDonutEvolution :dataset="dataset" :config="config" :key="`build_${step}`" @selectLegend="selectLegend" ref="build">
                <template #svg="{ svg }">
                    <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#42d392" />
                    <text :x="svg.width / 2" :y="svg.height / 2" text-anchor="middle">#SVG</text>
                </template>
                <template #legend="{ legend }">
                    #LEGEND
                    <div style="font-size: 8px">
                        {{ legend }}
                    </div>
                </template>
                <template #reset-action="{ reset }">
                    <button @click="reset()">REFRESH</button>
                </template>
            </VueUiDonutEvolution>
        </template>

        <template #build-treesh>
            <VueUiDonutEvolutionTreeshaken :dataset="dataset" :config="config" :key="`build_${step}`" @selectLegend="selectLegend" ref="build">
                <template #svg="{ svg }">
                    <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#42d392" />
                    <text :x="svg.width / 2" :y="svg.height / 2" text-anchor="middle">#SVG</text>
                </template>
                <template #legend="{ legend }">
                    #LEGEND
                    <div style="font-size: 8px">
                        {{ legend }}
                    </div>
                </template>
                <template #reset-action="{ reset }">
                    <button @click="reset()">REFRESH</button>
                </template>
            </VueUiDonutEvolutionTreeshaken>
        </template>

        <template #VDUI-build>
            <VueDataUi component="VueUiDonutEvolution" :dataset="dataset" :config="config" :key="`vdui_build_${step}`" @selectLegend="selectLegend" ref="vduiBuild">
                <template #svg="{ svg }">
                    <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#42d392" />
                    <text :x="svg.width / 2" :y="svg.height / 2" text-anchor="middle">#SVG</text>
                </template>
                <template #legend="{ legend }">
                    #LEGEND
                    <div style="font-size: 8px">
                        {{ legend }}
                    </div>
                </template>
                <template #reset-action="{ reset }">
                    <button @click="reset()">REFRESH</button>
                </template>
            </VueDataUi>
        </template>

        <template #knobs="{ summaryOpen }">
            <ConfigKnobs :model="model" @change="step += 1" :open="summaryOpen"/>
        </template>
    </Box>
</template>