<script setup>
import { ref, computed, onMounted } from "vue";
import LocalVueUiNestedDonuts from '../src/components/vue-ui-nested-donuts.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import { useArena } from "../src/useArena";
import { VueUiNestedDonuts } from "vue-data-ui";
import { VueUiNestedDonuts as VueUiNestedDonutsTreeshaken } from "vue-data-ui/vue-ui-nested-donuts";
import ConfigKnobs from "./ConfigKnobs.vue";
import { useConfigurationControls } from "./createConfigModel";
import { useConfig } from "../src/useConfig"
import useThemeOptions from "./useThemeOptions";

const { local, build, vduiLocal, vduiBuild, toggleTable, toggleLabels } = useArena();
const { vue_ui_nested_donuts: DEFAULT_CONFIG } = useConfig();

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
        name: "Group 1 is too long",
        series: [
            {
                name: 'Serie 1',
                values: [1]
            },
            {
                name: 'Serie 2',
                values: [0]
            },
            {
                name: 'Serie 3',
                values: [0]
            },
        ]
    },
    {
        name: "Group 2",
        series: [
            {
                name: 'Serie 1',
                values: [0]
            },
            {
                name: 'Serie 2',
                values: [40]
            },
            {
                name: 'Serie 3',
                values: [30]
            },
        ]
    },
]
    }, 2000)
})

function addDatapoint() {
    dataset.value[0].series.push({
        name: 'Serie N',
        values: [10]
    })
}

const model = createModel([
    CHECKBOX("loading", { def: false }),
    CHECKBOX("responsive", { def: false }),

    CHECKBOX('userOptions.useCursorPointer', { def: false }),
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

    CHECKBOX("startAnimation.show", { def: true }),

    NUMBER("userOptions.print.scale", { def: 2, min: 1, max: 5 }),
    CHECKBOX("userOptions.print.allowTaint", { def: true }),
    CHECKBOX("userOptions.print.useCORS", { def: true }),
    COLOR("userOptions.print.backgroundColor", { def: "#FFFFFF" }),

    CHECKBOX("useCssAnimation", { def: false }),
    CHECKBOX("useBlurOnHover", { def: true }),
    TEXT("style.fontFamily", { def: "inherit" }),
    CHECKBOX("style.chart.useGradient", { def: true }),
    RANGE("style.chart.gradientIntensity", { def: 40, min: 0, max: 100 }),
    COLOR("style.chart.backgroundColor", { def: "#FFFFFF" }),
    COLOR("style.chart.color", { def: "#1A1A1A" }),

    NUMBER("style.chart.width", { def: 512, min: 0, max: 512 }),
    NUMBER("style.chart.height", { def: 512, min: 0, max: 512 }),

    NUMBER("style.chart.padding.top", { def: 0, min: 0, max: 100 }),
    NUMBER("style.chart.padding.right", { def: 48, min: 0, max: 100 }),
    NUMBER("style.chart.padding.bottom", { def: 0, min: 0, max: 100 }),
    NUMBER("style.chart.padding.left", { def: 48, min: 0, max: 100 }),

    CHECKBOX('style.chart.layout.labels.dataLabels.showValueFirst', { def: true }),
    CHECKBOX('style.chart.layout.labels.dataLabels.usePercentageParens', { def: true }),
    CHECKBOX('style.chart.layout.labels.dataLabels.useValueParens', { def: false }),

    CHECKBOX("style.chart.layout.labels.dataLabels.show", { def: true }),
    TEXT("style.chart.layout.labels.dataLabels.prefix", { def: "P" }),
    TEXT("style.chart.layout.labels.dataLabels.suffix", { def: "S" }),
    NUMBER("style.chart.layout.labels.dataLabels.hideUnderValue", { def: 3, min: 1, max: 20 }),
    NUMBER("style.chart.layout.labels.dataLabels.fontSize", { def: 14, min: 8, max: 48 }),
    NUMBER("style.chart.layout.labels.dataLabels.offsetX", { def: 4, min: -100, max: 100 }),
    NUMBER("style.chart.layout.labels.dataLabels.offsetY", { def: 12, min: -100, max: 100 }),
    CHECKBOX("style.chart.layout.labels.dataLabels.useSerieColor", { def: false }),
    COLOR("style.chart.layout.labels.dataLabels.color", { def: "#1A1A1A" }),
    CHECKBOX("style.chart.layout.labels.dataLabels.showValue", { def: true }),
    CHECKBOX("style.chart.layout.labels.dataLabels.showPercentage", { def: true }),
    CHECKBOX("style.chart.layout.labels.dataLabels.boldValue", { def: false }),
    CHECKBOX("style.chart.layout.labels.dataLabels.boldPercentage", { def: true }),
    NUMBER("style.chart.layout.labels.dataLabels.roundingValue", { def: 2, min: 0, max: 12 }),
    NUMBER("style.chart.layout.labels.dataLabels.roundingPercentage", { def: 2, min: 0, max: 12 }),
    CHECKBOX("style.chart.layout.labels.dataLabels.showDonutName", { def: true }),
    CHECKBOX("style.chart.layout.labels.dataLabels.boldDonutName", { def: true }),
    CHECKBOX("style.chart.layout.labels.dataLabels.donutNameAbbreviation", { def: false }),
    CHECKBOX("style.chart.layout.labels.dataLabels.curvedDonutName", { def: true }),
    NUMBER("style.chart.layout.labels.dataLabels.donutNameMaxAbbreviationSize", { def: 3, min: 1, max: 12 }),
    NUMBER("style.chart.layout.labels.dataLabels.donutNameOffsetY", { def: -6, min: -100, max: 100 }),

    NUMBER("style.chart.layout.donut.strokeWidth", { def: 200, min: 50, max: 400 }),
    NUMBER("style.chart.layout.donut.borderWidth", { def: 2, min: 0, max: 12 }),
    CHECKBOX("style.chart.layout.donut.useShadow", { def: true }),
    COLOR("style.chart.layout.donut.shadowColor", { def: "#1A1A1A" }),
    NUMBER("style.chart.layout.donut.spacingRatio", { def: 0.5, min: 0, max: 1, step: 0.01 }),

    COLOR("style.chart.legend.backgroundColor", { def: "#FFFFFF" }),
    COLOR("style.chart.legend.color", { def: "#1A1A1A" }),
    CHECKBOX("style.chart.legend.show", { def: true }),
    NUMBER("style.chart.legend.fontSize", { def: 16, min: 8, max: 48 }),
    CHECKBOX("style.chart.legend.bold", { def: false }),
    NUMBER("style.chart.legend.roundingValue", { def: 2, min: 0, max: 12 }),
    NUMBER("style.chart.legend.roundingPercentage", { def: 2, min: 0, max: 12 }),
    CHECKBOX("style.chart.legend.showValue", { def: true }),
    CHECKBOX("style.chart.legend.showPercentage", { def: true }),
    SELECT("style.chart.legend.position", ["top", "bottom"], { def: "bottom" }),

    CHECKBOX('style.chart.legend.showValueFirst', { def: true }),
    CHECKBOX('style.chart.legend.usePercentageParens', { def: true }),
    CHECKBOX('style.chart.legend.useValueParens', { def: false }),
    CHECKBOX('style.chart.legend.selectAllToggle.show', { def: true }),
    COLOR('style.chart.legend.selectAllToggle.backgroundColor', { def: '#FF0000' }),
    COLOR('style.chart.legend.selectAllToggle.color', { def: '#FFFFFF' }),

    TEXT("style.chart.title.text", { def: "Lorem ipsum dolor sit amet" }),
    COLOR("style.chart.title.color", { def: "#1A1A1A" }),
    NUMBER("style.chart.title.fontSize", { def: 20, min: 8, max: 48 }),
    CHECKBOX("style.chart.title.bold", { def: true }),
    COLOR("style.chart.title.subtitle.color", { def: "#CCCCCC" }),
    TEXT("style.chart.title.subtitle.text", { def: "Lorem ipsum dolor sit amet" }),
    NUMBER("style.chart.title.subtitle.fontSize", { def: 16, min: 8, max: 48 }),
    CHECKBOX("style.chart.title.subtitle.bold", { def: false }),

    CHECKBOX("style.chart.tooltip.show", { def: true }),
    CHECKBOX("style.chart.tooltip.showAllItemsAtIndex", { def: true }),
    COLOR("style.chart.tooltip.color", { def: "#1A1A1A" }),
    COLOR("style.chart.tooltip.backgroundColor", { def: "#FFFFFF" }),
    NUMBER("style.chart.tooltip.fontSize", { def: 14, min: 8, max: 48 }),
    CHECKBOX("style.chart.tooltip.showValue", { def: true }),
    CHECKBOX("style.chart.tooltip.showPercentage", { def: true }),
    NUMBER("style.chart.tooltip.roundingValue", { def: 2, min: 0, max: 12 }),
    NUMBER("style.chart.tooltip.roundingPercentage", { def: 2, min: 0, max: 12 }),
    RANGE("style.chart.tooltip.backgroundOpacity", { def: 100, min: 0, max: 100 }),
    SELECT("style.chart.tooltip.position", ["left", "center", "right"], { def: "center" }),
    NUMBER("style.chart.tooltip.offsetY", { def: 24, min: 0, max: 48 }),

    CHECKBOX('style.chart.tooltip.showValueFirst', { def: true }),
    CHECKBOX('style.chart.tooltip.usePercentageParens', { def: true }),
    CHECKBOX('style.chart.tooltip.useValueParens', { def: false }),

    CHECKBOX("table.show", { def: false }),
    CHECKBOX("table.useDialog", { def: true }),
    NUMBER("table.responsiveBreakpoint", { def: 400, min: 300, max: 800 }),
    TEXT("table.columnNames.series", { def: "Series" }),
    TEXT("table.columnNames.value", { def: "Value" }),
    TEXT("table.columnNames.percentage", { def: "Percentage" }),
    COLOR("table.th.backgroundColor", { def: "#FFFFFF" }),
    COLOR("table.th.color", { def: "#1A1A1A" }),
    TEXT("table.th.outline", { def: "none" }),
    COLOR("table.td.backgroundColor", { def: "#FFFFFF" }),
    COLOR("table.td.color", { def: "#1A1A1A" }),
    TEXT("table.td.outline", { def: "none" }),
    NUMBER("table.td.roundingValue", { def: 2, min: 0, max: 12 }),
    NUMBER("table.td.roundingPercentage", { def: 2, min: 0, max: 12 })
]);

const testCustomTooltip = ref(false);

const { themeOptions, currentTheme } = useThemeOptions();

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
                            console.log('NESTED DONUTS CUSTOM TOOLTIP', data)
                            return "CUSTOM TOOLTIP"
                        }
                    }
                }
            }
        }
    } else {
        return {
            ...c,
            skeletonConfig: {
                style: {
                    chart: {
                        backgroundColor: '#FF0000'
                    }
                }
            },
            // events: {
            //     datapointEnter: ({ datapoint, seriesIndex }) => {
            //         console.log({ datapoint, seriesIndex })
            //     },
            //     datapointLeave: ({ datapoint, seriesIndex }) => {
            //         console.log({ datapoint, seriesIndex })
            //     },
            //     datapointClick: ({ datapoint, seriesIndex }) => {
            //         console.log({ datapoint, seriesIndex })
            //     },
            // },
            style: {
                ...c.style,
                chart: {
                    ...c.style.chart,
                    layout: {
                        ...c.style.chart.layout,
                        labels: {
                            ...c.style.chart.layout.labels,
                            dataLabels: {
                                ...c.style.chart.layout.labels.dataLabels,
                                // formatter: ({value, config}) => {
                                //     // console.log(config)
                                //     return `f | ${value}`
                                // }
                            }
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

function selectLegend(legend) {
    console.log({ legend })
}

function selectDatapoint(datapoint) {
    console.log({ datapoint })
}

onMounted(async() => {
    if (local.value) {
        const img = await local.value.getImage()
        console.log(img)

        // setTimeout(() => {
        //     local.value.hideSeries('Serie 3')
        // }, 4000)
        // setTimeout(() => {
        //     local.value.showSeries('Serie 3')
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
    <div style="margin: 12px 0">
        <input type="checkbox" v-model="testCustomTooltip" id="custom-tooltip" />
        <label for="custom-tooltip" style="color:#CCCCCC">Test custom tooltip</label>
    </div>
    <button @click="addDatapoint">ADD DATAPOINT</button>

    <Box comp="VueUiNestedDonuts" :dataset="dataset" :config="config">
        <template #title>VueUiNestedDonuts</template>

        <template #responsive>
            <div style="width: 600px; height: 600px; resize: both; overflow: auto; background: white">
                <LocalVueUiNestedDonuts :key="`responsive_${step}`" :dataset="dataset" :config="{
                    ...config,
                    responsive: true
                }">
                    <template #chart-background>
                        <div style="width: 100%; height: 100%; background: radial-gradient(at top left, red, white)"/>
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
                </LocalVueUiNestedDonuts>
            </div>
        </template>

        <template #theme>
            <LocalVueUiNestedDonuts :dataset="dataset" :config="configTheme" />
        </template>

        <template #local>
            <LocalVueUiNestedDonuts :dataset="dataset" :config="config" :key="`local_${step}`" @selectLegend="selectLegend" @selectDatapoint="selectDatapoint" ref="local">
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
                <template #tooltip-before="{ datapoint, seriesIndex, series, config, bars, lines, plots }">
                    #BEFORE {{ series.name }}
                </template>
                <template #tooltip-after="{ datapoint, seriesIndex, series, config, bars, lines, plots }">
                    #AFTER {{ series.name }}
                </template>
            </LocalVueUiNestedDonuts>
        </template>

        <template #VDUI-local>
            <LocalVueDataUi component="VueUiNestedDonuts" :dataset="dataset" :config="config" :key="`vdui_local_${step}`" @selectLegend="selectLegend" @selectDatapoint="selectDatapoint" ref="vduiLocal">
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
                <template #tooltip-before="{ datapoint, seriesIndex, series, config, bars, lines, plots }">
                    #BEFORE {{ series.name }}
                </template>
                <template #tooltip-after="{ datapoint, seriesIndex, series, config, bars, lines, plots }">
                    #AFTER {{ series.name }}
                </template>
            </LocalVueDataUi>
        </template>

        <template #build>
            <VueUiNestedDonuts :dataset="dataset" :config="config" :key="`build_${step}`" @selectLegend="selectLegend" @selectDatapoint="selectDatapoint" ref="build">
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
                <template #tooltip-before="{ datapoint, seriesIndex, series, config, bars, lines, plots }">
                    #BEFORE {{ series.name }}
                </template>
                <template #tooltip-after="{ datapoint, seriesIndex, series, config, bars, lines, plots }">
                    #AFTER {{ series.name }}
                </template>
            </VueUiNestedDonuts>
        </template>

        <template #build-treesh>
            <VueUiNestedDonutsTreeshaken :dataset="dataset" :config="config" :key="`build_${step}`" @selectLegend="selectLegend" @selectDatapoint="selectDatapoint" ref="build">
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
                <template #tooltip-before="{ datapoint, seriesIndex, series, config, bars, lines, plots }">
                    #BEFORE {{ series.name }}
                </template>
                <template #tooltip-after="{ datapoint, seriesIndex, series, config, bars, lines, plots }">
                    #AFTER {{ series.name }}
                </template>
            </VueUiNestedDonutsTreeshaken>
        </template>

        <template #VDUI-build>
            <VueDataUi component="VueUiNestedDonuts" :dataset="dataset" :config="config" :key="`vdui_build_${step}`" @selectLegend="selectLegend" @selectDatapoint="selectDatapoint" ref="vduiBuild">
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