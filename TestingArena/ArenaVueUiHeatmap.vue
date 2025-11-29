<script setup>
import { ref, computed, onMounted } from "vue";
import LocalVueUiHeatmap from '../src/components/vue-ui-heatmap.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import { useArena } from "../src/useArena";
import { VueUiHeatmap } from "vue-data-ui";
import { VueUiHeatmap as VueUiHeatmapTreeshaken } from "vue-data-ui/vue-ui-heatmap";
import ConfigKnobs from "./ConfigKnobs.vue";
import { useConfigurationControls } from "./createConfigModel";
import { useConfig } from "../src/useConfig"

const { local, build, vduiLocal, vduiBuild, toggleTable } = useArena();
const { vue_ui_heatmap: DEFAULT_CONFIG } = useConfig();

const {
    CHECKBOX,
    NUMBER,
    RANGE,
    TEXT,
    COLOR,
    SELECT,
    createModel
} = useConfigurationControls(DEFAULT_CONFIG);

function makeDs() {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    const arr = [];
    const dsLen = 52;
    const serieLen = days.length;
    for (let i = 0; i < serieLen; i += 1) {
        const values = [];
        for (let j = 0; j < dsLen; j += 1) {
        values.push((i + j * 2))
        }
        arr.push({
            name: `${days[i]}`,
            values
        })
    }
    return arr
}

const dataset = ref([])
onMounted(() => {
    dataset.value = undefined;
    setTimeout(() => {
        dataset.value = makeDs();
    }, 2000)
})


const alternateDataset = computed(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    const arr = [];
    const dsLen = 12;
    const serieLen = days.length;
    for (let i = 0; i < serieLen; i += 1) {
        const values = [];
        for (let j = 0; j < dsLen; j += 1) {
        values.push((i + j * 2))
        }
        arr.push({
            name: `${days[i]}`,
            values
        })
    }
    return arr
});

const alternateConfig = ref({
    table: {
        th: {
            backgroundColor: '#00FF00'
        }
    },
    style: {
        backgroundColor: '#FF0000',
        title: {
            text: 'Alternate'
        }
        
    }
})

const isPropsToggled = ref(false);
function toggleProps() {
    isPropsToggled.value = !isPropsToggled.value;
}

function alterDataset() {
    dataset.value.push({
        name: 'Alt',
        values: [1, 2, 3]
    })
}

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
    COLOR("userOptions.print.backgroundColor", { def: "#FF0000" }),

    TEXT("style.fontFamily", { def: "inherit" }),
    COLOR("style.backgroundColor", { def: "#FFFFFF" }),
    COLOR("style.color", { def: "#1A1A1A" }),

    NUMBER("style.layout.padding.top", { def: 0, min: 0, max: 100 }),
    NUMBER("style.layout.padding.right", { def: 0, min: 0, max: 100 }),
    NUMBER("style.layout.padding.bottom", { def: 0, min: 0, max: 100 }),
    NUMBER("style.layout.padding.left", { def: 0, min: 0, max: 100 }),

    NUMBER("style.layout.cells.height", { def: 36, min: 12, max: 64 }),
    CHECKBOX("style.layout.cells.value.show", { def: true }),
    NUMBER("style.layout.cells.value.fontSize", { def: 18, min: 8, max: 48 }),
    CHECKBOX("style.layout.cells.value.bold", { def: false }),
    NUMBER("style.layout.cells.value.roundingValue", { def: 2, min: 0, max: 12 }),
    COLOR("style.layout.cells.value.color", { def: "#1A1A1A" }),

    COLOR("style.layout.cells.colors.hot", { def: "#dc3912" }),
    COLOR("style.layout.cells.colors.cold", { def: "#3366cc" }),
    COLOR("style.layout.cells.colors.underlayer", { def: "#FFFFFF" }),

    NUMBER("style.layout.cells.spacing", { def: 2, min: 0, max: 12 }),
    NUMBER("style.layout.cells.selected.border", { def: 4, min: 0, max: 12 }),
    COLOR("style.layout.cells.selected.color", { def: "#1A1A1A" }),

    CHECKBOX("style.layout.cells.rowTotal.value.show", { def: true }),
    CHECKBOX("style.layout.cells.rowTotal.color.show", { def: true }),

    CHECKBOX("style.layout.cells.columnTotal.value.show", { def: true }),
    RANGE("style.layout.cells.columnTotal.value.rotation", { def: 0, min: -90, max: 90 }),
    NUMBER("style.layout.cells.columnTotal.value.autoRotate.angle", { def: -90, min: -90, max: 90 }),
    NUMBER("style.layout.cells.columnTotal.value.offsetX", { def: 0, min: -30, max: 30 }),
    NUMBER("style.layout.cells.columnTotal.value.offsetY", { def: 0, min: -30, max: 30 }),
    CHECKBOX("style.layout.cells.columnTotal.color.show", { def: true }),

    TEXT("style.layout.dataLabels.prefix", { def: "P" }),
    TEXT("style.layout.dataLabels.suffix", { def: "S" }),

    CHECKBOX("style.layout.dataLabels.xAxis.show", { def: true }),
    NUMBER("style.layout.dataLabels.xAxis.fontSize", { def: 14, min: 8, max: 24 }),
    COLOR("style.layout.dataLabels.xAxis.color", { def: "#1A1A1A" }),
    CHECKBOX("style.layout.dataLabels.xAxis.bold", { def: false }),
    NUMBER("style.layout.dataLabels.xAxis.offsetX", { def: 0, min: -100, max: 100 }),
    NUMBER("style.layout.dataLabels.xAxis.offsetY", { def: 0, min: -100, max: 100 }),
    NUMBER("style.layout.dataLabels.xAxis.showOnlyAtModulo", { def: null, min: 2, max: 24 }),
    NUMBER("style.layout.dataLabels.xAxis.rotation", { def: 0, min: -90, max: 0 }),

    CHECKBOX("style.layout.dataLabels.yAxis.show", { def: true }),
    NUMBER("style.layout.dataLabels.yAxis.fontSize", { def: 14, min: 8, max: 24 }),
    COLOR("style.layout.dataLabels.yAxis.color", { def: "#1A1A1A" }),
    CHECKBOX("style.layout.dataLabels.yAxis.bold", { def: false }),
    NUMBER("style.layout.dataLabels.yAxis.offsetY", { def: 0, min: -100, max: 100 }),
    NUMBER("style.layout.dataLabels.yAxis.offsetX", { def: 0, min: -100, max: 100 }),

    TEXT("style.title.text", { def: "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis" }),
    COLOR("style.title.color", { def: "#1A1A1A" }),
    RANGE("style.title.fontSize", { def: 20, min: 8, max: 48 }),
    CHECKBOX("style.title.bold", { def: true }),
    TEXT("style.title.subtitle.text", { def: "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis" }),
    COLOR("style.title.subtitle.color", { def: "#CCCCCC" }),
    RANGE("style.title.subtitle.fontSize", { def: 16, min: 8, max: 48 }),
    CHECKBOX("style.title.subtitle.bold", { def: false }),

    CHECKBOX("style.legend.show", { def: true }),
    CHECKBOX("style.legend.bold", { def: true }),
    COLOR("style.legend.backgroundColor", { def: "#FFFFFF" }),
    COLOR("style.legend.color", { def: "#1A1A1A" }),
    RANGE("style.legend.fontSize", { def: 12, min: 8, max: 48 }),
    RANGE("style.legend.roundingValue", { def: 2, min: 0, max: 12 }),

    CHECKBOX("style.tooltip.show", { def: true }),
    COLOR("style.tooltip.backgroundColor", { def: "#FFFFFF" }),
    COLOR("style.tooltip.color", { def: "#1A1A1A" }),
    RANGE("style.tooltip.fontSize", { def: 12, min: 8, max: 48 }),
    RANGE("style.tooltip.roundingValue", { def: 0, min: 0, max: 12 }),
    RANGE("style.tooltip.backgroundOpacity", { def: 100, min: 0, max: 100 }),
    SELECT("style.tooltip.position", ["left", "center", "right"], { def: "center" }),
    NUMBER("style.tooltip.offsetY", { def: 24, min: 0, max: 48 }),

    CHECKBOX("table.show", { def: false }),
    CHECKBOX("table.useDialog", { def: true }),
    NUMBER("table.responsiveBreakpoint", { def: 400, min: 300, max: 800 }),
    TEXT("table.colNames.xAxis", { def: "X AXIS" }),
    COLOR("table.th.backgroundColor", { def: "#FFFFFF" }),
    COLOR("table.th.color", { def: "#1A1A1A" }),
    TEXT("table.th.outline", { def: "none" }),
    COLOR("table.td.backgroundColor", { def: "#FFFFFF" }),
    COLOR("table.td.color", { def: "#1A1A1A" }),
    TEXT("table.td.outline", { def: "none" }),
    RANGE("table.td.roundingValue", { def: 0, min: 0, max: 12 })
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
    const c = convertArrayToObject(model.value);
    if(testCustomTooltip.value) {
        return {
            ...c,
            style: {
                ...c.style,
                tooltip: {
                    ...c.style.tooltip,
                    customFormat: ({ datapoint }) => {
                        let html = '';
                        return "test"
                    }
                }
            }

        }
    } else {
        return {
            ...c,
            // events: {
            //     datapointEnter: ({ datapoint, seriesIndex }) => {
            //         console.log('enter event', { datapoint, seriesIndex });
            //     },
            //     datapointLeave: ({ datapoint, seriesIndex }) => {
            //         console.log('leave event', { datapoint, seriesIndex });
            //     },
            //     datapointClick: ({ datapoint, seriesIndex }) => {
            //         console.log('click event', { datapoint, seriesIndex });
            //     }
            // },
            theme: currentTheme.value,
            style: {
                ...c.style,
                layout: {
                    ...c.style.layout,
                    cells: {
                        ...c.style.layout.cells,
                        value: {
                            ...c.style.layout.cells.value,
                            // formatter: ({value, config}) => {
                            //     return `f - ${value}`
                            // }
                        }
                    },
                    dataLabels: {
                        ...c.style.layout.dataLabels,
                        xAxis: {
                            ...c.style.layout.dataLabels.xAxis,
                            values: [
                                1754604000000,
                                1754690400000,
                                1754776800000,
                                1754863200000,
                                1754949600000,
                                1755036000000,
                                1755122400000,
                                1755208800000,
                                1755295200000,
                                1755381600000,
                                1755468000000,
                                1755554400000,
                                1755640800000,
                                1755727200000,
                                1755813600000,
                                1755900000000,
                                1755986400000,
                                1756072800000,
                                1756159200000,
                                1756245600000,
                                1756332000000,
                                1756418400000,
                                1756504800000,
                                1756591200000,
                                1756677600000,
                                1756764000000
                            ],
                            datetimeFormatter: {
                                enable: true
                            }
                        },
                        yAxis: {
                            values: [
                                1754604000000,
                                1754690400000,
                                1754776800000,
                                1754863200000,
                                1754949600000,
                                1755036000000,
                                1755122400000
                            ],
                            datetimeFormatter: {
                                enable: true
                            }
                        }
                    }
                },
            }
        }
    }
});

const step = ref(0)

function logCell(cell) {
    console.log(cell)
}

onMounted(async() => {
    if (local.value) {
        const img = await local.value.getImage()
        console.log(img)
    }
})

</script>

<template>
    <button @click="toggleTable">TOGGLE TABLE</button>
    <button @click="toggleProps">TOGGLE PROPS: {{ isPropsToggled }}</button>
    <button @click="alterDataset">ALTER DATASET</button>

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

    <Box comp="VueUiHeatmap" :dataset="dataset" :config="config">
        <template #title>VueUiHeatmap</template>

        <template #responsive>
            <div style="width: 600px; height: 600px; padding: 12px; resize: both; overflow: auto; background: white">
                <LocalVueUiHeatmap :dataset="isPropsToggled ? alternateDataset : dataset" :config="{
                    ...config,
                    responsive: true
                }" :key="`local_${step}`" ref="local" @selectDatapoint="logCell"/>
            </div>
        </template>

        <template #theme>
            <LocalVueUiHeatmap :dataset="dataset" :config="configTheme" />
        </template>
        
        <template #local>
            <LocalVueUiHeatmap :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`local_${step}`" ref="local" @selectDatapoint="logCell">
                <!-- <template #chart-background>
                    <div style="width: 100%; height: 100%; background: radial-gradient(at top left, red, white)"/>
                </template> -->

                <template #optionPdf>
                    PRINT PDF
                </template>
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
                <template #tooltip-before="{ datapoint, seriesIndex, series, config, bars, lines, plots }">
                    #BEFORE {{ series.name }}
                </template>
                <template #tooltip-after="{ datapoint, seriesIndex, series, config, bars, lines, plots }">
                    #AFTER {{ series.name }}
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
            </LocalVueUiHeatmap>
        </template>

        <template #VDUI-local>
            <LocalVueDataUi component="VueUiHeatmap" :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`VDUI-lodal_${step}`" ref="vduiLocal" @selectDatapoint="logCell">
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
                <template #tooltip-before="{ datapoint, seriesIndex, series, config, bars, lines, plots }">
                    #BEFORE {{ series.name }}
                </template>
                <template #tooltip-after="{ datapoint, seriesIndex, series, config, bars, lines, plots }">
                    #AFTER {{ series.name }}
                </template>
            </LocalVueDataUi>
        </template>

        <template #build>
            <VueUiHeatmap :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`build_${step}`" ref="build" @selectDatapoint="logCell">
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
                <template #tooltip-before="{ datapoint, seriesIndex, series, config, bars, lines, plots }">
                    #BEFORE {{ series.name }}
                </template>
                <template #tooltip-after="{ datapoint, seriesIndex, series, config, bars, lines, plots }">
                    #AFTER {{ series.name }}
                </template>
            </VueUiHeatmap>
        </template>

        <template #build-treesh>
            <VueUiHeatmapTreeshaken :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`build_${step}`" ref="build" @selectDatapoint="logCell">
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
                <template #tooltip-before="{ datapoint, seriesIndex, series, config, bars, lines, plots }">
                    #BEFORE {{ series.name }}
                </template>
                <template #tooltip-after="{ datapoint, seriesIndex, series, config, bars, lines, plots }">
                    #AFTER {{ series.name }}
                </template>
            </VueUiHeatmapTreeshaken>
        </template>

        <template #VDUI-build>
            <VueDataUi component="VueUiHeatmap" :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`VDUI-build_${step}`" ref="vduiBuild" @selectDatapoint="logCell">
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
                <template #tooltip-before="{ datapoint, seriesIndex, series, config, bars, lines, plots }">
                    #BEFORE {{ series.name }}
                </template>
                <template #tooltip-after="{ datapoint, seriesIndex, series, config, bars, lines, plots }">
                    #AFTER {{ series.name }}
                </template>
            </VueDataUi>
        </template>

        <template #knobs>
            <ConfigKnobs :model="model" @change="step += 1"/>
        </template>
    </Box>
</template>