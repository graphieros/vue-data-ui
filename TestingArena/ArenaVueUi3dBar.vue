<script setup>
import { ref, computed, onMounted } from "vue";
import LocalVueUi3dBar from '../src/components/vue-ui-3d-bar.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import { useArena } from "../src/useArena";
import { VueUi3dBar } from "vue-data-ui";
import { VueUi3dBar as VueUi3dBarTreeshaken } from "vue-data-ui/vue-ui-3d-bar";
import ConfigKnobs from "./ConfigKnobs.vue";
import { useConfigurationControls } from "./createConfigModel";
import { useConfig } from "../src/useConfig"
import useThemeOptions from "./useThemeOptions";


const { local, build, vduiLocal, vduiBuild, toggleTable } = useArena()
const { vue_ui_3d_bar: DEFAULT_CONFIG } = useConfig();

const {
    CHECKBOX,
    NUMBER,
    RANGE,
    TEXT,
    COLOR,
    SELECT,
    createModel
} = useConfigurationControls(DEFAULT_CONFIG);

const datasets = ref({
    simple: undefined,
    stacked: undefined
})

onMounted(() => {
    setTimeout(() => {
        datasets.value.simple = { percentage: 66.666 },
        datasets.value.stacked = {
        series: [
            {
                name:  'Serie 1 with a long name that should be shorter but we do not have the choice',
                value: 256,
                breakdown: [
                    {
                        name: 'Sub serie 1',
                        value: 100
                    },
                    {
                        name: 'Sub serie 2',
                        value: 90
                    },
                    {
                        name: 'Sub serie 3',
                        value: 66
                    }
                ]
            },
            {
                name: 'Serie 2',
                value: 128
            },
            {
                name: 'Serie 3',
                value: 64
            },
            {
                name: 'Serie 4',
                value: 32
            },
            {
                name: 'Serie 5',
                value: 16
            },
            {
                name: 'Serie 6',
                value: 8
            }
        ]
    }
    }, 2000)

    setTimeout(() => {
        datasets.value.stacked.series.push({
            name: 'ALT',
            value: 500,
            breakdown: [
                    {
                        name: 'ALT 1',
                        value: 200
                    },
                    {
                        name: 'ALT 2',
                        value: 200
                    },
                    {
                        name: 'ALT 3',
                        value: 100
                    }
                ]
        })
    }, 4000)
})

const model = createModel([
    CHECKBOX("debug", { def: true }),
    CHECKBOX("loading", { def: false }),
    CHECKBOX("responsive", { def: false }),
    CHECKBOX("useCssAnimation", { def: false }),

    CHECKBOX("userOptions.show", { def: true }),
    CHECKBOX("userOptions.showOnChartHover", { def: true }),
    CHECKBOX("userOptions.keepStateOnChartLeave", { def: true }),
    CHECKBOX("userOptions.buttons.pdf", { def: true }),
    CHECKBOX("userOptions.buttons.img", { def: true }),
    CHECKBOX("userOptions.buttons.csv", { def: true }),
    CHECKBOX("userOptions.buttons.table", { def: true }),
    CHECKBOX("userOptions.buttons.fullscreen", { def: true }),
    SELECT("userOptions.position", ["left", "right"], { def: "right" }),

    NUMBER("userOptions.print.scale", { def: 2, min: 1, max: 5 }),
    CHECKBOX("userOptions.print.allowTaint", { def: true }),
    CHECKBOX("userOptions.print.useCORS", { def: true }),
    COLOR("userOptions.print.backgroundColor", { def: "#FFFFFF" }),

    TEXT("style.fontFamily", { def: "inherit" }),
    SELECT("style.shape", ["bar", "tube"], { def: "bar" }),

    CHECKBOX("style.chart.animation.use", { def: true }),
    NUMBER("style.chart.animation.speed", { def: 1, min: 0.1, max: 2, step: 0.1 }),
    NUMBER("style.chart.animation.acceleration", { def: 1, min: 0.1, max: 10, step: 0.1 }),

    COLOR("style.chart.backgroundColor", { def: "#FFFFFF" }),
    COLOR("style.chart.color", { def: "#1A1A1A" }),

    COLOR("style.chart.bar.color", { def: "#6376DD" }),
    COLOR("style.chart.bar.stroke", { def: "#6376DD" }),
    NUMBER("style.chart.bar.strokeWidth", { def: 1, min: 0, max: 12, step: 0.5 }),
    COLOR("style.chart.bar.shadeColor", { def: "#1A1A1A" }),

    COLOR("style.chart.box.stroke", { def: "#CCCCCC" }),
    NUMBER("style.chart.box.strokeWidth", { def: 1, min: 0, max: 12, step: 0.5 }),
    NUMBER("style.chart.box.strokeDasharray", { def: 2, min: 0, max: 100 }),

    NUMBER("style.chart.box.dimensions.width", { def: 128, min: 64, max: 300 }),
    NUMBER("style.chart.box.dimensions.height", { def: 256, min: 64, max: 600 }),
    NUMBER("style.chart.box.dimensions.top", { def: 27, min: 0, max: 100 }),
    NUMBER("style.chart.box.dimensions.bottom", { def: 9, min: 0, max: 100 }),
    NUMBER("style.chart.box.dimensions.left", { def: 24, min: 0, max: 100 }),
    NUMBER("style.chart.box.dimensions.right", { def: 24, min: 0, max: 100 }),
    NUMBER("style.chart.box.dimensions.perspective", { def: 18, min: 0, max: 100 }),

    TEXT("style.chart.title.text", { def: "Lorem ipsum dolor sit amet" }),
    COLOR("style.chart.title.color", { def: "#1A1A1A" }),
    NUMBER("style.chart.title.fontSize", { def: 20, min: 8, max: 48 }),
    CHECKBOX("style.chart.title.bold", { def: true }),

    COLOR("style.chart.title.subtitle.color", { def: "#CCCCCC" }),
    TEXT("style.chart.title.subtitle.text", { def: "Lorem ipsum dolor sit amet" }),
    NUMBER("style.chart.title.subtitle.fontSize", { def: 16, min: 8, max: 48 }),
    CHECKBOX("style.chart.title.subtitle.bold", { def: false }),

    CHECKBOX("style.chart.legend.showDefault", { def: true }),
    NUMBER("style.chart.legend.fontSize", { def: 10, min: 8, max: 48 }),
    COLOR("style.chart.legend.color", { def: "#1A1A1A" }),
    CHECKBOX("style.chart.legend.bold", { def: false }),
    NUMBER("style.chart.legend.roundingValue", { def: 2, min: 0, max: 12 }),
    NUMBER("style.chart.legend.roundingPercentage", { def: 2, min: 0, max: 12 }),
    TEXT("style.chart.legend.prefix", { def: "P" }),
    TEXT("style.chart.legend.suffix", { def: "S" }),
    NUMBER("style.chart.legend.hideUnderPercentage", { def: 3, min: 1, max: 20 }),

    CHECKBOX("style.chart.dataLabel.show", { def: true }),
    CHECKBOX("style.chart.dataLabel.bold", { def: true }),
    COLOR("style.chart.dataLabel.color", { def: "#1A1A1A" }),
    NUMBER("style.chart.dataLabel.fontSize", { def: 12 }),
    NUMBER("style.chart.dataLabel.rounding", { def: 1, min: 0, max: 12 }),

    CHECKBOX("table.show", { def: false }),
    CHECKBOX("table.useDialog", { def: true }),

    NUMBER("table.responsiveBreakpoint", { def: 300, min: 300, max: 800 }),
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

const { themeOptions, currentTheme } = useThemeOptions();

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
        style: {
            ...c.style,
            chart: {
                ...c.style.chart,
                dataLabel: {
                    ...c.style.chart.dataLabel,
                    // formatter: ({value, config}) => {
                    //     console.log(config)
                    //     return `f | ${value}`
                    // }
                }
            }
        },
        theme: currentTheme.value,
        customPalette: ['#6376DD', "#DD3322", "#66DDAA"],
    }
})

const step = ref(0)

const selectedDataset = ref('stacked') // simple | stacked

const dataset = computed(() => datasets.value[selectedDataset.value])

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
    <select v-model="selectedDataset" @change="step += 1"><option>simple</option><option>stacked</option></select>

    <Box comp="VueUi3dBar" :dataset="dataset" :config="config">
        <template #title>VueUi3dBar</template>

        <template #responsive>
            <div style="width: 600px; height: 600px; resize: both; overflow: auto; background: white">
                <LocalVueUi3dBar :key="`responsive_${step}`" :dataset="dataset" :config="{
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
            </LocalVueUi3dBar>
            </div>
        </template>

        <template #theme>
            <LocalVueUi3dBar :dataset="dataset" :config="configTheme" />
        </template>

        <template #local>
            <LocalVueUi3dBar :dataset="dataset" :config="config" :key="`local_${step}`" ref="local">
                <template #optionPdf>
                    PRINT PDF
                </template>
                <!-- <template #annotator-action-close>
                    CL
                </template> -->
            </LocalVueUi3dBar>
        </template>

        <template #VDUI-local>
            <LocalVueDataUi component="VueUi3dBar" :dataset="dataset" :config="config" :key="`vdui_local_${step}`" ref="vduiLocal">
            </LocalVueDataUi>
        </template>

        <template #build>
            <VueUi3dBar :dataset="dataset" :config="config" :key="`build_${step}`" ref="build">
            </VueUi3dBar>
        </template>

        <template #build-treesh>
            <VueUi3dBarTreeshaken :dataset="dataset" :config="config" :key="`build_${step}`" ref="build">
            </VueUi3dBarTreeshaken>
        </template>

        <template #VDUI-build>
            <VueDataUi component="VueUi3dBar" :dataset="dataset" :config="config" :key="`vdui_build_${step}`" ref="vduiBuild">
            </VueDataUi>
        </template>

        <template #knobs="{ summaryOpen }">
            <ConfigKnobs :model="model" @change="step += 1" :open="summaryOpen"/>
        </template>
    </Box>
</template>