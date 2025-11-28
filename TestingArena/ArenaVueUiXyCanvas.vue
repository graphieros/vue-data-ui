<script setup>
import { ref, computed, onMounted } from "vue";
import LocalVueUiXyCanvas from '../src/components/vue-ui-xy-canvas.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import { useArena } from "../src/useArena";
import { VueUiXyCanvas } from "vue-data-ui";
import { VueUiXyCanvas as VueUiXyCanvasTreeshaken } from "vue-data-ui/vue-ui-xy-canvas";
import ConfigKnobs from "./ConfigKnobs.vue";
import { useConfigurationControls } from "./createConfigModel";
import { useConfig } from "../src/useConfig"

const { local, build, vduiLocal, vduiBuild, toggleTable, toggleLabels, toggleStack } = useArena();
const { vue_ui_xy_canvas: DEFAULT_CONFIG } = useConfig();

const {
    CHECKBOX,
    NUMBER,
    RANGE,
    TEXT,
    COLOR,
    SELECT,
    createModel
} = useConfigurationControls(DEFAULT_CONFIG);

const crazyDs = [];
const crazyDs2 = [];
const crazyDs3 = []
for (let i = 0; i < 50; i += 1) {
    if ((i > 10 && i <= 20) || (i > 21 && i < 30)) {
        crazyDs3.push(null)
    } else {
        crazyDs3.push(Math.random() + (Math.random() > 0.5 ? Math.random() * -5 : Math.random() * 5))
    }
    crazyDs.push(Math.random() + (Math.random() > 0.5 ? Math.random() * 10 : -10))
    crazyDs2.push(Math.random() + (Math.random() > 0.5 ? Math.random() * -10 : -10))
}

function makeDs(n,m) {
    const arr = [];
    for (let i = 0; i < n; i += 1) {
        arr.push(Math.random() * m)
    }
    return arr
}

const dataset = ref(undefined);

onMounted(() => {
    setTimeout(() => {
        dataset.value = [
        {
            name: "S0",
            series: crazyDs3,
            type: "line",
            useArea: true,
            dataLabels: true,
            scaleSteps: 2,
            prefix: '$',
            suffix: '£',
            rounding: 1,
        },
        {
            name: "S1",
            series: crazyDs2,
            type: "bar",
            useArea: false,
            dataLabels: true,
            scaleSteps: 2,
            prefix: '$',
            suffix: '£',
            rounding: 1,
        },
        {
            name: "S2",
            series: crazyDs,
            type: "plot",
            useArea: false,
            dataLabels: true,
            scaleSteps: 2,
            prefix: '$',
            suffix: '£',
            rounding: 1,
        },
    ]
    }, 2000)
})

    async function getData() {
        return makeDs(800, 100)
    }

async function longpolling ()
{
  try {
    const response = await getData();
    dataset.value[0].series = response;
    console.log(response)
  }
    catch (error) {
    console.error('error fetching wsjtx data', error);
  }
  finally {
    setTimeout(longpolling, 1);
  }
}

// onMounted(async () => {
//   longpolling();
// });



//     onMounted(() => {
//     setTimeout(() => {
//         dataset.value[0].series.push(10)
//     }, 3000)
// })


const model = createModel([
    CHECKBOX("loading", { def: false }),
    CHECKBOX("debug", { def: true }),
    NUMBER("downsample.threshold", { def: 120000, min: 0, max: 10000000 }),
    CHECKBOX("responsive", { def: false }),

    CHECKBOX("userOptions.show", { def: true }),
    CHECKBOX("userOptions.buttons.pdf", { def: true }),
    CHECKBOX("userOptions.buttons.img", { def: true }),
    CHECKBOX("userOptions.buttons.table", { def: true }),
    CHECKBOX("userOptions.buttons.csv", { def: true }),
    CHECKBOX("userOptions.buttons.labels", { def: true }),
    CHECKBOX("userOptions.buttons.stack", { def: true }),
    CHECKBOX("userOptions.buttons.fullscreen", { def: true }),
    SELECT("userOptions.position", ["left", "right"], { def: "right" }),
    CHECKBOX("userOptions.showOnChartHover", { def: true }),
    CHECKBOX("userOptions.keepStateOnChartLeave", { def: true }),

    NUMBER("userOptions.print.scale", { def: 2, min: 1, max: 5 }),
    CHECKBOX("userOptions.print.allowTaint", { def: true }),
    CHECKBOX("userOptions.print.useCORS", { def: true }),
    COLOR("userOptions.print.backgroundColor", { def: "#FFFFFF" }),

    TEXT("style.fontFamily", { def: "Arial" }),
    COLOR("style.chart.backgroundColor", { def: "#FFFFFF" }),
    COLOR("style.chart.color", { def: "#1A1A1A" }),
    TEXT("style.chart.aspectRatio", { def: "12 / 9" }),
    CHECKBOX("style.chart.stacked", { def: false }),
    NUMBER("style.chart.stackGap", { def: 20, min: 0.1, max: 1, step: 0.1 }),
    NUMBER("style.chart.scale.ticks", { def: 10, min: 2, max: 20 }),
    NUMBER("style.chart.scale.min", { def: null, min: -1000, max: 1000 }),
    NUMBER("style.chart.scale.max", { def: null, min: -1000, max: 1000 }),

    CHECKBOX("style.chart.zoom.show", { def: true }),
    COLOR("style.chart.zoom.color", { def: "#CCCCCC" }),
    COLOR("style.chart.zoom.highlightColor", { def: "#4A4A4A" }),
    NUMBER("style.chart.zoom.fontSize", { def: 14, min: 8, max: 42 }),
    CHECKBOX("style.chart.zoom.useResetSlot", { def: false }),
    NUMBER("style.chart.zoom.startIndex", { def: null, min: 0, max: 1000 }),
    NUMBER("style.chart.zoom.endIndex", { def: null, min: 0, max: 1000 }),
    CHECKBOX("style.chart.zoom.enableRangeHandles", { def: true }),
    CHECKBOX("style.chart.zoom.enableSelectionDrag", { def: true }),
    CHECKBOX("style.chart.zoom.focusOnDrag", { def: true }),
    NUMBER("style.chart.zoom.focusRangeRatio", { def: 0.2, min: 0.1, max: 0.9, step: 0.1 }),

    CHECKBOX("style.chart.zoom.minimap.show", { def: true }),
    CHECKBOX("style.chart.zoom.preview.enable", { def: true }),

    CHECKBOX("style.chart.selector.show", { def: true }),
    COLOR("style.chart.selector.color", { def: "#1A1A1A" }),
    CHECKBOX("style.chart.selector.dashed", { def: false }),

    CHECKBOX("style.chart.tooltip.show", { def: true }),
    COLOR("style.chart.tooltip.color", { def: "#1A1A1A" }),
    COLOR("style.chart.tooltip.backgroundColor", { def: "#FFFFFF" }),
    NUMBER("style.chart.tooltip.fontSize", { def: 14, min: 8, max: 42 }),
    NUMBER("style.chart.tooltip.borderRadius", { def: 4, min: 0, max: 12 }),
    COLOR("style.chart.tooltip.borderColor", { def: "#e1e5e6" }),
    NUMBER("style.chart.tooltip.borderWidth", { def: 1, min: 0, max: 12 }),
    RANGE("style.chart.tooltip.backgroundOpacity", { def: 100, min: 0, max: 100 }),
    SELECT("style.chart.tooltip.position", ["left", "center", "right"], { def: "center" }),
    NUMBER("style.chart.tooltip.offsetY", { def: 24, min: 0, max: 48 }),

    COLOR("style.chart.legend.backgroundColor", { def: "#FFFFFF" }),
    COLOR("style.chart.legend.color", { def: "#1A1A1A" }),
    CHECKBOX("style.chart.legend.show", { def: true }),
    NUMBER("style.chart.legend.fontSize", { def: 16, min: 8, max: 42 }),
    CHECKBOX("style.chart.legend.bold", { def: false }),
    SELECT("style.chart.legend.position", ["top", "bottom"], { def: "bottom" }),

    TEXT("style.chart.title.text", { def: "Lorem ipsum placer" }),
    COLOR("style.chart.title.color", { def: "#1A1A1A" }),
    NUMBER("style.chart.title.fontSize", { def: 20, min: 8, max: 42 }),
    CHECKBOX("style.chart.title.bold", { def: true }),
    TEXT("style.chart.title.subtitle.text", { def: "Lorem ipsum dolor sit amet" }),
    NUMBER("style.chart.title.subtitle.fontSize", { def: 16, min: 8, max: 42 }),
    CHECKBOX("style.chart.title.subtitle.bold", { def: false }),

    CHECKBOX("style.chart.grid.y.showAxis", { def: true }),
    COLOR("style.chart.grid.y.axisColor", { def: "#1A1A1A" }),
    TEXT("style.chart.grid.y.axisName", { def: "Y AXIS" }),
    NUMBER("style.chart.grid.y.axisThickness", { def: 2, min: 1, max: 6 }),
    CHECKBOX("style.chart.grid.y.axisLabels.show", { def: true }),
    CHECKBOX("style.chart.grid.y.axisLabels.bold", { def: true }),
    NUMBER("style.chart.grid.y.axisLabels.fontSizeRatio", { def: 0.7, min: 0.1, max: 2, step: 0.1 }),
    COLOR("style.chart.grid.y.axisLabels.color", { def: "#1A1A1A" }),
    NUMBER("style.chart.grid.y.axisLabels.offsetX", { def: 0, min: -100, max: 100 }),

    CHECKBOX("style.chart.grid.y.verticalLines.show", { def: true }),
    COLOR("style.chart.grid.y.verticalLines.color", { def: "#CCCCCC" }),
    NUMBER("style.chart.grid.y.verticalLines.hideUnderXLength", { def: 0, min: 5, max: 40 }),
    SELECT("style.chart.grid.y.verticalLines.position", ["start", "middle"], { def: "middle" }),

    CHECKBOX("style.chart.grid.x.timeLabels.show", { def: true }),
    NUMBER("style.chart.grid.x.timeLabels.fontSizeRatio", { def: 0.8, min: 0.1, max: 2, step: 0.1 }),
    NUMBER("style.chart.grid.x.timeLabels.rotation", { def: 0, min: -360, max: 360 }),
    NUMBER("style.chart.grid.x.timeLabels.offsetY", { def: 30, min: -100, max: 100 }),
    COLOR("style.chart.grid.x.timeLabels.color", { def: "#1A1A1A" }),
    NUMBER("style.chart.grid.x.timeLabels.modulo", { def: 8, min: 1, max: 100 }),
    CHECKBOX("style.chart.grid.x.timeLabels.bold", { def: true }),

    CHECKBOX("style.chart.grid.x.showAxis", { def: true }),
    TEXT("style.chart.grid.x.axisName", { def: "X AXIS" }),
    COLOR("style.chart.grid.x.axisColor", { def: "#1A1A1A" }),
    NUMBER("style.chart.grid.x.axisThickness", { def: 2, min: 1, max: 12 }),
    CHECKBOX("style.chart.grid.x.horizontalLines.Show", { def: true }),
    COLOR("style.chart.grid.x.horizontalLines.color", { def: "#CCCCCC" }),
    CHECKBOX("style.chart.grid.x.horizontalLines.alternate", { def: true }),
    NUMBER("style.chart.grid.x.horizontalLines.opacity", { def: 20, min: 0, max: 100 }),

    CHECKBOX("style.chart.grid.zeroLine.show", { def: true }),
    COLOR("style.chart.grid.zeroLine.color", { def: "#1A1A1A" }),
    CHECKBOX("style.chart.grid.zeroLine.dashed", { def: true }),

    CHECKBOX("style.chart.line.plots.show", { def: false }),
    NUMBER("style.chart.line.plots.radiusRatio", { def: 1, min: 0.1, max: 3, step: 0.1 }),

    CHECKBOX("style.chart.bar.gradient.show", { def: false }),

    NUMBER("style.chart.area.opacity", { def: 30, min: 10, max: 100 }),

    CHECKBOX("style.chart.dataLabels.show", { def: false }),
    CHECKBOX("style.chart.dataLabels.bold", { def: true }),
    NUMBER("style.chart.dataLabels.fontSizeRatio", { def: 1, min: 0.1, max: 2, step: 0.1 }),
    CHECKBOX("style.chart.dataLabels.useSerieColor", { def: true }),
    COLOR("style.chart.dataLabels.color", { def: "#1A1A1A" }),
    NUMBER("style.chart.dataLabels.offsetY", { def: -12, min: -100, max: 100 }),

    NUMBER("style.chart.paddingProportions.top", { def: 0.1, min: 0, max: 3, step: 0.01 }),
    NUMBER("style.chart.paddingProportions.right", { def: 0.05, min: 0, max: 3, step: 0.01 }),
    NUMBER("style.chart.paddingProportions.left", { def: 0.1, min: 0, max: 3, step: 0.01 }),
    NUMBER("style.chart.paddingProportions.bottom", { def: 0.1, min: 0, max: 3, step: 0.01 }),

    NUMBER("table.rounding", { def: 1, min: 0, max: 6 }),
    NUMBER("table.responsiveBreakpoint", { def: 400, min: 300, max: 800 }),
    TEXT("table.columnNames.period", { def: "Period" }),
    TEXT("table.columnNames.total", { def: "Total" }),
    COLOR("table.th.backgroundColor", { def: "#FFFFFF" }),
    COLOR("table.th.color", { def: "#1A1A1A" }),
    TEXT("table.th.outline", { def: "none" }),
    COLOR("table.td.backgroundColor", { def: "#FFFFFF" }),
    COLOR("table.td.color", { def: "#1A1A1A" }),
    TEXT("table.td.outline", { def: "none" }),
    CHECKBOX("table.show", { def: false }),
    CHECKBOX("table.useDialog", { def: true })
]);


const step = ref(0)

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

const monthValues = computed(() => {
    const yearStart = 2026
    const arr = []

    for (let i = 0; i < 200; i += 1) {
        const d = new Date(yearStart, i, 1)
        arr.push(d.getTime())
    }

    return arr
})

const config = computed(() => {
    const c = convertArrayToObject(model.value);
    return {
        ...c,
        theme: currentTheme.value,
        style: {
            ...c.style,
            chart: {
                ...c.style.chart,
                dataLabels: {
                    ...c.style.chart.dataLabels,
                    formatter: ({value, config}) => {
                        // console.log(config)
                        return `f | ${value}`
                    }
                },
                tooltip: {
                    ...c.style.chart.tooltip,
                    useDefaultTimeFormat: false,
                    timeFormat: 'yyyy-MM-dd'
                    // customFormat: ({ datapoint }) => {
                    //     return datapoint[0].name
                    // }
                },
                zoom: {
                    ...c.style.chart.zoom,
                    useDefaultFormat: false,
                    timeFormat: 'yyyy-MM',
                    // customFormat: (d) => {
                    //     console.log(d);
                    //     return 'T'
                    // }
                },
                grid: {
                    ...c.style.chart.grid,
                    x: {
                        ...c.style.chart.grid.x,
                        timeLabels: {
                            ...c.style.chart.grid.x.timeLabels,
                            values: [],
                            datetimeFormatter: {
                                enable: true,
                            }
                        }
                    },
                    y: {
                        ...c.style.chart.grid.y,
                        // Testing deprecated timeLabels on Y which was a mishap and was moved to x.
                        // Using them on Y still works, as it gets applied on X anyway; so to be backwards compatible.
                        // Any timeLabel config content placed in Y overrides the default config in X 
                        timeLabels: {
                            color: '#FF0000' 
                        }
                    }
                }
            }
        }
    }
})

// const basicCanvasConfig = ref({
//     style: {
//         chart: {
//             stacked: true,
//             stackGapRatio: 0.5,
//             dataLabels: {
//                 show: false
//             },
//             line: {
//                 plots: {
//                     show: false
//                 }
//             }
//         }
//     }
// })

const selectedX = ref(undefined);

function selectX({ datapoint, index, indexLabel}) {
    selectedX.value = index;
}

// onMounted(() => {
//     setTimeout(() => {
//         if (local.value) {
//             local.value.hideSeries('S0')
//             local.value.hideSeries('S1')
//         }
//     }, 3000)
//     setTimeout(() => {
//         if (local.value) {
//             local.value.showSeries('S0')
//             local.value.hideSeries('S2')
//         }
//     }, 4000)
// })

</script>

<template>
    <button @click="toggleTable">TOGGLE TABLE</button>
    <button @click="toggleLabels">TOGGLE LABELS</button>
    <button @click="toggleStack">TOGGLE STACK</button>
    <div style="margin: 12px 0; color: white">Z
        Theme:
        <select v-model="currentTheme" @change="step += 1">
            <option v-for="opt in themeOptions">{{ opt }}</option>
        </select>
    </div>

    <Box comp="VueUiXyCanvas" :dataset="dataset">
        <template #title>VueUiXyCanvas</template>

        <template #responsive>
            <div style="width: 600px; height: 600px; resize: both; overflow: auto; background: white">
                <LocalVueUiXyCanvas :key="`responsive_${step}`" :dataset="dataset" :config="{
                    ...config,
                    responsive: true,
                }">
                    <template #chart-background>
                        <div style="width: 100%; height: 100%; background: radial-gradient(at top left, red, white)"/>
                    </template>
                    <template #watermark="{ isPrinting }">
                        <div v-if="isPrinting" style="font-size: 100px; opacity: 0.2; transform: rotate(-10deg)">
                            WATERMARK
                        </div>
                    </template>
                    <template #source>
                        <div style="width:100%;font-size:10px;text-align:left">
                            SOURCE: Lorem ipsum dolor sit, amet consectetur adipisicing elit. Tenetur, molestiae perspiciatis nam quae libero, deserunt in aperiam unde officia sint saepe laboriosam ducimus aspernatur labore! Sapiente aspernatur corrupti quis ad.
                        </div>
                    </template>  
                </LocalVueUiXyCanvas>
            </div>
        </template>

        <template #theme>
            <LocalVueUiXyCanvas :dataset="dataset" :config="configTheme" />
        </template>

        <template #local>
            <LocalVueUiXyCanvas @selectX="selectX" :selectedXIndex="selectedX" :dataset="dataset" :config="config" :key="`local_${step}`" ref="local">
                <template #optionPdf>
                    PRINT PDF
                </template>
            </LocalVueUiXyCanvas>
        </template>

        <template #VDUI-local>
            <LocalVueDataUi @selectX="selectX" :selectedXIndex="selectedX" component="VueUiXyCanvas" :dataset="dataset" :config="config" :key="`VDUI-lodal_${step}`" ref="vduiLocal">

            </LocalVueDataUi>
        </template>

        <template #build>
            <VueUiXyCanvas :dataset="dataset" :config="config" :key="`build_${step}`" ref="build"></VueUiXyCanvas>
        </template>

        <template #build-treesh>
            <VueUiXyCanvasTreeshaken :dataset="dataset" :config="config" :key="`build_${step}`" ref="build"></VueUiXyCanvasTreeshaken>
        </template>

        <template #VDUI-build>
            <VueDataUi component="VueUiXyCanvas" :dataset="dataset" :config="config" :key="`VDUI_build_${step}`" ref="vduiBuild">
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