<script setup>
import { ref, computed, onMounted } from "vue";
import LocalVueUiDonut from '../src/components/vue-ui-donut.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import LocalPattern from "../src/atoms/vue-ui-pattern.vue";
import ConfigKnobs from "./ConfigKnobs.vue";
import { useConfigurationControls } from "./createConfigModel";
import { useConfig } from "../src/useConfig"
import { VueUiDonut as VueUiDonutTreeshaken } from "vue-data-ui/vue-ui-donut";

const { vue_ui_donut: DEFAULT_CONFIG } = useConfig();

const {
    CHECKBOX,
    NUMBER,
    RANGE,
    TEXT,
    COLOR,
    SELECT,
    createModel
} = useConfigurationControls(DEFAULT_CONFIG);

// const dataset = ref([
//     {
//         name: 'A',
//         values: [3]
//     },
//     {
//         name: 'A',
//         values: [2]
//     },
//     {
//         name: 'A',
//         values: [1]
//     },
// ]);

// Test mutating loading state from outside
const dataset = ref([])
onMounted(() => {
    dataset.value = undefined;
    setTimeout(() => {
        dataset.value = [
            {
                name: 'Series H',
                values: [0.05]
            },
            {
                name: 'Series A with some\nlong label that\nis cut',
                values: [3],
            },
            {
                name: 'Series B',
                values: [2]
            },
            {
                name: 'Series C',
                values: [1]
            },
            {
                name: 'Series D',
                values: [0.5]
            },
            {
                name: 'Series E',
                values: [0.25]
            },
            {
                name: 'Series F is longer\nand breaks',
                values: [0.25]
            },
            {
                name: 'Series G',
                values: [0.05]
            },
            {
                name: 'Series I',
                values: [0.25]
            },
            {
                name: 'Series J',
                values: [0.25]
            },
            {
                name: 'Series K',
                values: [0.25]
            },
            {
                name: 'Series L',
                values: [0.25]
            },
        ]
    }, 2000)
})

const alternateDataset = ref([
    { name: 'Alt 1', values: [20]},
    { name: 'Alt 2', values: [20]},
    { name: 'Alt 3', values: [20]},
])

const alternateConfig = ref({
    style: {
        chart: {
            backgroundColor: '#CCCCCC',
            title: {
                text: 'Alternate'
            }
        }
    }
})

const isPropsToggled = ref(false);
function toggleProps() {
    isPropsToggled.value = !isPropsToggled.value;
}

function alterDataset() {
    dataset.value.push({
        name: 'Added',
        values: [Math.round(Math.random() * 30)]
    })
}

const model = createModel([
    CHECKBOX("debug", { def: true }),
    CHECKBOX("autoSize", { def: true }),
    CHECKBOX("startAnimation.show", { def: false }),
    CHECKBOX("pie", { def: false }),
    CHECKBOX("loading", { def: false }),
    SELECT("type", ["classic", "polar"], { def: "classic" }),
    NUMBER("style.chart.width", { def: 512, min: 0, max: 512 }),
    NUMBER("style.chart.height", { def: 360, min: 0, max: 512 }),
    CHECKBOX("serieToggleAnimation.show", { def: true }),
    NUMBER("serieToggleAnimation.durationMs", { def: 500, min: 0, max: 5000, step: 100 }),
    CHECKBOX("loadAnimation.show", { def: true }),
    NUMBER("loadAnimation.durationMs", { def: 1000, min: 0, max: 5000, step: 500 }),
    NUMBER("loadAnimation.staggerMs", { def: 50, min: 0, max: 1000, step: 25 }),
    CHECKBOX("responsive", { def: false }),
    CHECKBOX("userOptions.show", { def: true, label: "showUserOptions", category: "general" }),
    CHECKBOX("userOptions.buttons.pdf", { def: true }),
    CHECKBOX("userOptions.buttons.img", { def: true }),
    CHECKBOX("userOptions.buttons.csv", { def: true }),
    CHECKBOX("userOptions.buttons.labels", { def: true }),
    CHECKBOX("userOptions.buttons.table", { def: true }),
    CHECKBOX("userOptions.buttons.fullscreen", { def: true }),
    CHECKBOX("userOptions.buttons.annotator", { def: true }),
    SELECT("userOptions.position", ["left", "right"], { def: "right" }),
    CHECKBOX("userOptions.showOnChartHover", { def: true }),
    CHECKBOX("userOptions.keepStateOnChartLeave", { def: true }),
    CHECKBOX("useCssAnimation", { def: false, label: "useCssAnimation", category: "general" }),
    CHECKBOX("useBlurOnHover", { def: true, label: "useBlurOnHover", category: "general" }),
    TEXT("style.fontFamily", { def: "inherit", label: "fontFamily", category: "general" }),
    CHECKBOX("style.chart.useGradient", { def: false, label: "useGradient", category: "general" }),
    RANGE("style.chart.gradientIntensity", { def: 40, min: 0, max: 100, label: "gradientIntensity", category: "general" }),
    COLOR("style.chart.backgroundColor", { def: "#FFFFFF", label: "backgroundColor", category: "general" }),
    COLOR("style.chart.color", { def: "#1A1A1A", label: "textColor", category: "general" }),
    NUMBER("style.chart.padding.top", { def: 0, min: 0, max: 100 }),
    NUMBER("style.chart.padding.right", { def: 24, min: 0, max: 100 }),
    NUMBER("style.chart.padding.bottom", { def: 0, min: 0, max: 100 }),
    NUMBER("style.chart.padding.left", { def: 24, min: 0, max: 100 }),
    CHECKBOX("style.chart.layout.curvedMarkers", { def: true }),
    CHECKBOX("style.chart.layout.labels.dataLabels.show", { def: true, label: "show", category: "labels" }),
    CHECKBOX("style.chart.layout.labels.dataLabels.oneLine", {def: true }),
    NUMBER("style.chart.layout.labels.dataLabels.hideUnderValue", { def: 3, min: 0, max: 100, label: "hideUnderValue", category: "labels" }),
    NUMBER("style.chart.layout.labels.dataLabels.smallArcClusterThreshold", { def: 8, min: 0, max: 100 }),
    CHECKBOX("style.chart.layout.labels.dataLabels.useLabelSlots", { def: false }),
    TEXT("style.chart.layout.labels.dataLabels.prefix", { def: "", label: "prefix", category: "labels" }),
    TEXT("style.chart.layout.labels.dataLabels.suffix", { def: "", label: "suffix", category: "labels" }),
    CHECKBOX("style.chart.layout.labels.value.show", { def: true, label: "showValue", category: "labels" }),
    NUMBER("style.chart.layout.labels.value.rounding", { def: 0, min: 0, max: 6, label: "valueRounding", category: "labels" }),
    COLOR("style.chart.layout.labels.percentage.color", { def: "#1A1A1A", label: "colorPercentage", category: "labels" }),
    CHECKBOX("style.chart.layout.labels.percentage.bold", { def: true, label: "bold", category: "labels" }),
    NUMBER("style.chart.layout.labels.percentage.fontSize", { def: 14, min: 6, max: 48, label: "fontSize", category: "labels" }),
    NUMBER("style.chart.layout.labels.percentage.minFontSize", { def: 8, min: 6, max: 48, label: "fontSize", category: "labels" }),
    COLOR("style.chart.layout.labels.name.color", { def: "#1A1A1A", label: "colorName", category: "labels" }),
    CHECKBOX("style.chart.layout.labels.name.bold", { def: false, label: "bold", category: "labels" }),
    NUMBER("style.chart.layout.labels.name.fontSize", { def: 14, min: 6, max: 36, label: "fontSize", category: "labels" }),
    NUMBER("style.chart.layout.labels.name.minFontSize", { def: 8, min: 6, max: 36, label: "fontSize", category: "labels" }),
    CHECKBOX("style.chart.layout.labels.hollow.show", { def: true, label: ["hollow", "is", "show"], category: "labels" }),
    CHECKBOX("style.chart.layout.labels.hollow.total.show", { def: true, label: ["hollow", "total", "is", "show"], category: "labels" }),
    CHECKBOX("style.chart.layout.labels.hollow.total.bold", { def: false, label: ["hollow", "total", "is", "bold"], category: "labels" }),
    NUMBER("style.chart.layout.labels.hollow.total.fontSize", { def: 18, min: 6, max: 48, label: ["hollow", "total", "is", "fontSize"], category: "labels" }),
    COLOR("style.chart.layout.labels.hollow.total.color", { def: "#AAAAAA", label: ["hollow", "total", "is", "color"], category: "labels" }),
    TEXT("style.chart.layout.labels.hollow.total.text", { def: "Total", label: ["hollow", "total", "is", "textContent"], category: "labels" }),
    NUMBER("style.chart.layout.labels.hollow.total.offsetY", { def: 0, min: -100, max: 100, label: ["hollow", "total", "is", "offsetY"], category: "labels" }),
    COLOR("style.chart.layout.labels.hollow.total.value.color", { def: "#1A1A1A", label: ["hollow", "total", "value", "is", "color"], category: "labels" }),
    NUMBER("style.chart.layout.labels.hollow.total.value.fontSize", { def: 18, min: 6, max: 48, label: ["hollow", "total", "value", "is", "fontSize"], category: "labels" }),
    CHECKBOX("style.chart.layout.labels.hollow.total.value.bold", { def: true, label: ["hollow", "total", "value", "is", "bold"], category: "labels" }),
    TEXT("style.chart.layout.labels.hollow.total.value.prefix", { def: "", label: ["hollow", "total", "value", "is", "prefix"], category: "labels" }),
    TEXT("style.chart.layout.labels.hollow.total.value.suffix", { def: "", label: ["hollow", "total", "value", "is", "suffix"], category: "labels" }),
    NUMBER("style.chart.layout.labels.hollow.total.value.offsetY", { def: 0, min: -100, max: 100, label: ["hollow", "total", "value", "is", "offsetY"], category: "labels" }),
    NUMBER("style.chart.layout.labels.hollow.total.value.rounding", { def: 0, min: 0, max: 6, label: ["hollow", "total", "value", "is", "rounding"], category: "labels" }),
    CHECKBOX("style.chart.layout.labels.hollow.average.show", { def: true, label: ["hollow", "average", "is", "show"], category: "labels" }),
    CHECKBOX("style.chart.layout.labels.hollow.average.bold", { def: false, label: ["hollow", "average", "is", "bold"], category: "labels" }),
    COLOR("style.chart.layout.labels.hollow.average.color", { def: "#AAAAAA", label: ["hollow", "average", "is", "color"], category: "labels" }),
    NUMBER("style.chart.layout.labels.hollow.average.fontSize", { def: 18, min: 6, max: 48, label: ["hollow", "average", "is", "fontSize"], category: "labels" }),
    TEXT("style.chart.layout.labels.hollow.average.text", { def: "Average", label: ["hollow", "average", "is", "textContent"], category: "labels" }),
    NUMBER("style.chart.layout.labels.hollow.average.offsetY", { def: 0, min: -100, max: 100, label: ["hollow", "average", "is", "offsetY"], category: "labels" }),
    COLOR("style.chart.layout.labels.hollow.average.value.color", { def: "#1A1A1A", label: ["hollow", "average", "value", "is", "color"], category: "labels" }),
    NUMBER("style.chart.layout.labels.hollow.average.value.fontSize", { def: 18, min: 6, max: 48, label: ["hollow", "average", "value", "is", "fontSize"], category: "labels" }),
    CHECKBOX("style.chart.layout.labels.hollow.average.value.bold", { def: true, label: ["hollow", "average", "value", "is", "bold"], category: "labels" }),
    TEXT("style.chart.layout.labels.hollow.average.value.prefix", { def: "", label: ["hollow", "average", "value", "is", "prefix"], category: "labels" }),
    TEXT("style.chart.layout.labels.hollow.average.value.suffix", { def: "", label: ["hollow", "average", "value", "is", "suffix"], category: "labels" }),
    NUMBER("style.chart.layout.labels.hollow.average.value.offsetY", { def: 0, min: -100, max: 100, label: ["hollow", "average", "value", "is", "offsetY"], category: "labels" }),
    NUMBER("style.chart.layout.labels.hollow.average.value.rounding", { def: 0, min: 0, max: 6, label: ["hollow", "average", "value", "is", "rounding"], category: "labels" }),
    RANGE("style.chart.layout.donut.strokeWidth", { def: 64, min: 3, max: 130, label: "thickness", category: "donut" }),
    RANGE("style.chart.layout.donut.borderWidth", { def: 1, min: 0, max: 36, label: ["border", "is", "thickness"], category: "donut" }),
    CHECKBOX("style.chart.layout.donut.useShadow", { def: false }),
    COLOR("style.chart.layout.donut.shadowColor", { def: "#1A1A1A" }),
    COLOR("style.chart.layout.donut.selectedColor", { def: "#0000001A" }),
    NUMBER("style.chart.layout.donut.radiusRatio", { def: 0.3, min: 0.1, max: 0.5, step: 0.01 }),
    CHECKBOX("style.chart.legend.show", { def: true, label: "show", category: "legend" }),
    COLOR("style.chart.legend.backgroundColor", { def: "#FFFFFF20", label: "backgroundColor", category: "legend" }),
    COLOR("style.chart.legend.color", { def: "#1A1A1A", label: "textColor", category: "legend" }),
    NUMBER("style.chart.legend.fontSize", { def: 16, min: 6, max: 42, label: "fontSize", category: "legend" }),
    CHECKBOX("style.chart.legend.bold", { def: false, label: "bold", category: "legend" }),
    NUMBER("style.chart.legend.roundingValue", { def: 0, min: 0, max: 6, label: ["rounding", "is", "value"], category: "legend" }),
    NUMBER("style.chart.legend.roundingPercentage", { def: 0, min: 0, max: 6, label: "percentageRounding", category: "legend" }),
    CHECKBOX("style.chart.legend.showPercentage", { def: true }),
    CHECKBOX("style.chart.legend.showValue", { def: true }),
    SELECT("style.chart.legend.position", ["top", "bottom"], { def: "bottom" }),
    TEXT("style.chart.title.text", { def: "Title", label: "textContent", category: "title" }),
    COLOR("style.chart.title.color", { def: "#1A1A1A", label: "textColor", category: "title" }),
    NUMBER("style.chart.title.fontSize", { def: 20, min: 6, max: 48, label: "fontSize", category: "title" }),
    CHECKBOX("style.chart.title.bold", { def: true, label: "bold", category: "title" }),
    SELECT("style.chart.title.textAlign", ["left", "center", "right"], { def: "center" }),
    NUMBER("style.chart.title.paddingLeft", { def: 0, min: 0, max: 24 }),
    NUMBER("style.chart.title.paddingRight", { def: 0, min: 0, max: 24 }),
    TEXT("style.chart.title.subtitle.text", { def: "Lorem ipsum dolor sit amet", label: "textContent", category: "subtitle" }),
    COLOR("style.chart.title.subtitle.color", { def: "#A1A1A1", label: "textColor", category: "subtitle" }),
    NUMBER("style.chart.title.subtitle.fontSize", { def: 16, min: 6, max: 42, label: "fontSize", category: "subtitle" }),
    CHECKBOX("style.chart.title.subtitle.bold", { def: false, label: "bold", category: "subtitle" }),
    CHECKBOX("table.show", { def: false, label: "show", category: "table" }),
    CHECKBOX("table.useDialog", { def: true }),
    NUMBER("table.responsiveBreakpoint", { def: 400, min: 300, max: 800, label: "responsiveBreakpoint", category: "table" }),
    TEXT("table.columnNames.series", { def: "Series", label: ["columnName", "is", "series"], category: "table" }),
    TEXT("table.columnNames.value", { def: "Value", label: ["columnName", "is", "value"], category: "table" }),
    TEXT("table.columnNames.percentage", { def: "Percentage", label: ["columnName", "is", "percentage"], category: "table" }),
    COLOR("table.th.backgroundColor", { def: "#FFFFFF", label: "backgroundColorHeader", category: "table" }),
    COLOR("table.th.color", { def: "#1A1A1A", label: "textColorHeader", category: "table" }),
    TEXT("table.th.outline", { def: "none", label: "outlineHeader", category: "table" }),
    COLOR("table.td.backgroundColor", { def: "#FFFFFF", label: "backgroundColorRow", category: "table" }),
    COLOR("table.td.color", { def: "#1A1A1A", label: "textColorRow", category: "table" }),
    TEXT("table.td.outline", { def: "none", label: "outlineRow", category: "table" }),
    NUMBER("table.td.roundingValue", { def: 0, min: 0, max: 6, label: ["rounding", "is", "value"], category: "table" }),
    NUMBER("table.td.roundingPercentage", { def: 0, min: 0, max: 6, label: ["rounding", "is", "percentage"], category: "table" }),
    CHECKBOX("style.chart.tooltip.show", { def: true, label: "show", category: "tooltip" }),
    COLOR("style.chart.tooltip.backgroundColor", { def: "#FFFFFF", label: "backgroundColor", category: "tooltip" }),
    COLOR("style.chart.tooltip.color", { def: "#1A1A1A", label: "textColor", category: "tooltip" }),
    NUMBER("style.chart.tooltip.fontSize", { def: 14, min: 6, max: 24, label: "fontSize", category: "tooltip" }),
    CHECKBOX("style.chart.tooltip.showValue", { def: true, label: "showValue", category: "tooltip" }),
    NUMBER("style.chart.tooltip.roundingValue", { def: 0, min: 0, max: 6, label: ["rounding", "is", "value"], category: "tooltip" }),
    CHECKBOX("style.chart.tooltip.showPercentage", { def: true, label: "showPercentage", category: "tooltip" }),
    NUMBER("style.chart.tooltip.roundingPercentage", { def: 0, min: 0, max: 6, label: "percentageRounding", category: "tooltip" }),
    RANGE("style.chart.tooltip.backgroundOpacity", { def: 100, min: 0, max: 100 }),
    SELECT("style.chart.tooltip.position", ["left", "center", "right"], { def: "center" }),
    NUMBER("style.chart.tooltip.offsetY", { def: 24, min: 0, max: 48 }),
    CHECKBOX("style.chart.comments.show", { def: true }),
    CHECKBOX("style.chart.comments.showInTooltip", { def: true }),
    NUMBER("style.chart.comments.width", { def: 100, min: 50, max: 400 }),
    NUMBER("style.chart.comments.offsetX", { def: 0, min: -100, max: 100 }),
    NUMBER("style.chart.comments.offsetY", { def: 0, min: -100, max: 100 }),
    TEXT("userOptions.buttonTitles.tooltip", { def: "TOGGLE TOOLTIP" }),
    TEXT("userOptions.buttonTitles.pdf", { def: "DOWNLOAD PDF" }),
    TEXT("userOptions.buttonTitles.csv", { def: "DOWNLOAD CSV" }),
    TEXT("userOptions.buttonTitles.img", { def: "DOWNLOAD PNG" }),
    TEXT("userOptions.buttonTitles.table", { def: "TOGGLE TABLE" }),
    TEXT("userOptions.buttonTitles.labels", { def: "TOGGLE LABELS" }),
    TEXT("userOptions.buttonTitles.fullscreen", { def: "TOGGLE FULLSCREEN" }),
    TEXT("userOptions.buttonTitles.open", { def: "OPEN OPTIONS" }),
    TEXT("userOptions.buttonTitles.close", { def: "CLOSE OPTIONS" }),
    TEXT("userOptions.buttonTitles.annotator", { def: "TOGGLE ANNOTATOR" }),
    NUMBER("userOptions.print.scale", { def: 2, min: 1, max: 5 }),
    CHECKBOX("userOptions.print.allowTaint", { def: true }),
    CHECKBOX("userOptions.print.useCORS", { def: true }),
    COLOR("userOptions.print.backgroundColor", { def: "#FFFFFF" })
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

const configTheme = computed(() => ({
    theme: currentTheme.value,
}))

const config = computed(() => {
    const c = convertArrayToObject(model.value);
    if(testCustomTooltip.value) {
        return {
            ...c,
            style: {
                ...c.style,
                chart: {
                    ...c.style.chart,
                    tooltip: {
                        ...c.style.chart.tooltip,
                        // customFormat: (data) => {
                        //     return "CUSTOM TOOLTIP " + data
                        // }
                    }
                }
            },
        }
    } else {
        return {
            ...c,
            // style: {
            //     ...c.style,
            //     chart: {
            //         ...c.style.chart,
            //         layout: {
            //             ...c.style.chart.layout,
            //             labels: {
            //                 ...c.style.chart.layout.labels,
            //                 hollow: {
            //                     ...c.style.chart.layout.labels.hollow,
            //                     total: {
            //                         ...c.style.chart.layout.labels.hollow.total,
            //                         value: {
            //                             ...c.style.chart.layout.labels.hollow.total.value,
            //                             // formatter: ({value}) => {
            //                             //     return `f  - ${value}`
            //                             // }
            //                         }
            //                     },
            //                     average: {
            //                         ...c.style.chart.layout.labels.hollow.average,
            //                         value: {
            //                             ...c.style.chart.layout.labels.hollow.average.value,
            //                             // formatter: ({value}) => {
            //                             //     return `f  - ${value}`
            //                             // }
            //                         }
            //                     },
            //                 },
            //                 value: {
            //                     ...c.style.chart.layout.labels.value,
            //                     // formatter: ({value, config}) => {

            //                     //     return `f  - ${value}`
            //                     // }
            //                 },
            //                 percentage: {
            //                     // formatter: ({value}) => {
            //                     //     return `f - ${value}`
            //                     // }
            //                 },
            //                 dataLabels: {
            //                     ...c.style.chart.layout.labels.dataLabels,
            //                     // formatter: ({value}) => {
            //                     //     return `f - ${value}`
            //                     // }
            //                 }
            //             }
            //         },
            //     }
            // },
            theme: currentTheme.value,
            // customPalette: ['#6376DD', "#DD3322", "#66DDAA"]
        }
    }
});

const step = ref(0)

function selectLegend(legend) {
    console.log({legend})
}

function selectDatapoint(datapoint) {
    console.log({ datapoint })
}

function addDatapoint() {
    dataset.value.push({
        name: 'Serie N',
        values: [10]
    })
}

const localDonut = ref(null)
const localVdui = ref(null)

function toggleTable() {
    localDonut.value.toggleTable();
    localVdui.value.toggleTable();
}

function toggleLabels() {
    localDonut.value.toggleLabels();
    localVdui.value.toggleLabels();
}

onMounted(async () => {
    if (localDonut.value) {
        const img = await localDonut.value.getImage()
        console.log(img)
        // localDonut.value.autoSize()
        // setTimeout(() => {
        //     localDonut.value.hideSeries('Series C')
        // }, 4000)
        // setTimeout(() => {
        //     localDonut.value.hideSeries('Series A')
        //     localDonut.value.showSeries('Series C')
        // }, 5000)
    }
})

</script>

<template>
    <button @click="toggleTable">TOGGLE TABLE</button>
    <button @click="toggleLabels">TOGGLE LABELS</button>
    <button @click="toggleProps">TOGGLE PROPS: {{ isPropsToggled }}</button>
    <button @click="alterDataset">ALTER DATASET</button>
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
    <button @click="addDatapoint">ADD DATAPOINT</button>

    <Box comp="VueUiDonut" :dataset="dataset" :config="config">
        <template #title>VueUiDonut</template>

        <template #responsive>
                <div style="width: 600px; height: 600px; resize: both; overflow: auto; background: white">
                    <LocalVueDataUi component="VueUiDonut" :dataset="dataset" :config="{
                        ...config,
                        responsive: true
                    }">

                    <!-- <template #chart-background>
                        <div style="width: 100%; height: 100%; background: radial-gradient(at top left, red, white)"/>
                    </template> -->

                    <template #plot-comment="{ plot }">
                        <div :style="`text-align:${plot.textAlign};font-size: 10px; padding: 6px;`">
                            {{ plot.comment }}
                        </div>
                    </template>

                    <template #watermark="{ isPrinting }">
                        <div v-if="isPrinting" style="font-size: 100px; opacity: 0.1; transform: rotate(-10deg)">
                            WATERMARK
                        </div>
                    </template>
                    <template #source>
                        <div style="width:100%;font-size:10px;text-align:left">
                            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Tenetur, molestiae perspiciatis nam quae libero, deserunt in aperiam unde officia sint saepe laboriosam ducimus aspernatur labore! Sapiente aspernatur corrupti quis ad.
                        </div>
                    </template>
                </LocalVueDataUi>
            </div>
        </template>

        <template #theme>
            <LocalVueUiDonut :dataset="dataset" :config="configTheme"/>
        </template>

        <template #local>
            <LocalVueUiDonut :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : {
                ...config,
            }" :key="`local_${step}`" @selectLegend="selectLegend" @selectDatapoint="selectDatapoint" ref="localDonut">
                <!-- <template #pattern="{ seriesIndex, patternId }">
                    <VueUiPattern v-if="seriesIndex === 0" name="squares" :id="patternId"/>
                    <VueUiPattern v-if="seriesIndex === 1" name="hexagon-grid" :id="patternId" :scale="0.4" :strokeWidth="2"/>
                    <VueUiPattern v-if="seriesIndex === 2" name="hexagon-diamond" :id="patternId"/>
                    <VueUiPattern v-if="seriesIndex === 3" name="scales" :id="patternId"/>
                    <VueUiPattern v-if="seriesIndex === 4" name="zig-zag" :id="patternId" :scale="0.2" :strokeWidth="8"/>
                    <VueUiPattern v-if="seriesIndex === 5" name="redrum" :id="patternId" :scale="0.5" :strokeWidth="5"/>
                </template> -->

                <template #optionPdf>
                    PRINT PDF
                </template>
                <template #optionCsv>
                    DOWNLOAD CSV
                </template>
                <template #optionImg>
                    DOWNLOAD IMAGE
                </template>
                <template #optionTable>
                    TOGGLE TABLE
                </template>
                <template #optionLabels>
                    TOGGLE LABELS
                </template>
                <template template #optionFullscreen="{ toggleFullscreen, isFullscreen }">
                    <button @click="toggleFullscreen(isFullscreen ? 'out' : 'in')">FULLSCREEN</button>
                </template>
                <template #dataLabel="{ datapoint, isBlur, isVisible, isSafari, textAlign, flexAlign, percentage }">
                    <div :style="`background:${datapoint.color}`">
                        {{ datapoint.name }} : {{ percentage }}
                    </div>
                </template>
                <!-- <template #legend="{ legend }">
                    #LEGEND
                    <div style="font-size: 8px">
                        {{ legend }}
                    </div>
                </template> -->

                <!-- <template #hollow="{ total, average, dataset }">
                    <button>Total: {{ total }}</button>
                </template> -->
                
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
            </LocalVueUiDonut>
        </template>
        
        <template #VDUI-local>
            <LocalVueDataUi component="VueUiDonut" :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" @selectLegend="selectLegend" @selectDatapoint="selectDatapoint" ref="localVdui">
                <template #pattern="{ seriesIndex, patternId }">
                    <VueUiPattern v-if="seriesIndex === 0" name="squares" :id="patternId"/>
                    <VueUiPattern v-if="seriesIndex === 1" name="hexagon-grid" :id="patternId" :scale="0.4" :strokeWidth="2"/>
                    <VueUiPattern v-if="seriesIndex === 2" name="hexagon-diamond" :id="patternId"/>
                    <VueUiPattern v-if="seriesIndex === 3" name="scales" :id="patternId"/>
                    <VueUiPattern v-if="seriesIndex === 4" name="zig-zag" :id="patternId" :scale="0.2" :strokeWidth="8"/>
                    <VueUiPattern v-if="seriesIndex === 5" name="redrum" :id="patternId" :scale="0.5" :strokeWidth="5"/>
                </template>

                <template #optionPdf>
                    PRINT PDF
                </template>
                <template #optionCsv>
                    DOWNLOAD CSV
                </template>
                <template #optionImg>
                    DOWNLOAD IMAGE
                </template>
                <template #optionTable>
                    TOGGLE TABLE
                </template>
                <template #optionLabels>
                    TOGGLE LABELS
                </template>
                <template template #optionFullscreen="{ toggleFullscreen, isFullscreen }">
                    <button @click="toggleFullscreen(isFullscreen ? 'out' : 'in')">FULLSCREEN</button>
                </template>
                <template #svg="{ svg }">
                    <circle :cx="30" :cy="30" :r="30" fill="#42d392" />
                    <text :x="30" :y="30" text-anchor="middle">#SVG</text>
                </template>
                <template #dataLabel="{ datapoint, isBlur, isVisible, isSafari, textAlign, flexAlign, percentage }">
                    <div :style="`background:${datapoint.color}`">
                        {{ datapoint.name }} : {{ percentage }}
                    </div>
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
                        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Tenetur, molestiae perspiciatis nam quae libero, deserunt in aperiam unde officia sint saepe laboriosam ducimus aspernatur labore! Sapiente aspernatur corrupti quis ad.
                    </div>
                </template>
            </LocalVueDataUi>
        </template>
        
        <template #build>
            <VueUiDonut :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`local_${step}`" @selectLegend="selectLegend" @selectDatapoint="selectDatapoint">
                <template #pattern="{ seriesIndex, patternId }">
                    <VueUiPattern v-if="seriesIndex === 0" name="squares" :id="patternId"/>
                    <VueUiPattern v-if="seriesIndex === 1" name="hexagon-grid" :id="patternId" :scale="0.4" :strokeWidth="2"/>
                    <VueUiPattern v-if="seriesIndex === 2" name="hexagon-diamond" :id="patternId"/>
                    <VueUiPattern v-if="seriesIndex === 3" name="scales" :id="patternId"/>
                    <VueUiPattern v-if="seriesIndex === 4" name="zig-zag" :id="patternId" :scale="0.2" :strokeWidth="8"/>
                    <VueUiPattern v-if="seriesIndex === 5" name="redrum" :id="patternId" :scale="0.5" :strokeWidth="5"/>
                </template>

                <template #optionPdf>
                    PRINT PDF
                </template>
                <template #optionCsv>
                    DOWNLOAD CSV
                </template>
                <template #optionImg>
                    DOWNLOAD IMAGE
                </template>
                <template #optionTable>
                    TOGGLE TABLE
                </template>
                <template #optionLabels>
                    TOGGLE LABELS
                </template>
                <template template #optionFullscreen="{ toggleFullscreen, isFullscreen }">
                    <button @click="toggleFullscreen(isFullscreen ? 'out' : 'in')">FULLSCREEN</button>
                </template>
                <template #svg="{ svg }">
                    <circle :cx="30" :cy="30" :r="30" fill="#42d392" />
                    <text :x="30" :y="30" text-anchor="middle">#SVG</text>
                </template>
                <template #dataLabel="{ datapoint, isBlur, isVisible, isSafari, textAlign, flexAlign, percentage }">
                    <div :style="`background:${datapoint.color}`">
                        {{ datapoint.name }} : {{ percentage }}
                    </div>
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
            </VueUiDonut>
        </template>

        <template #build-treesh>
            <VueUiDonutTreeshaken 
                :dataset="dataset" 
                :config="config"
            >
            </VueUiDonutTreeshaken>
        </template>

        <template #VDUI-build>
            <VueDataUi component="VueUiDonut" :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`local_${step}`" @selectLegend="selectLegend" @selectDatapoint="selectDatapoint">
                <template #pattern="{ seriesIndex, patternId }">
                    <VueUiPattern v-if="seriesIndex === 0" name="squares" :id="patternId"/>
                    <VueUiPattern v-if="seriesIndex === 1" name="hexagon-grid" :id="patternId" :scale="0.4" :strokeWidth="2"/>
                    <VueUiPattern v-if="seriesIndex === 2" name="hexagon-diamond" :id="patternId"/>
                    <VueUiPattern v-if="seriesIndex === 3" name="scales" :id="patternId"/>
                    <VueUiPattern v-if="seriesIndex === 4" name="zig-zag" :id="patternId" :scale="0.2" :strokeWidth="8"/>
                    <VueUiPattern v-if="seriesIndex === 5" name="redrum" :id="patternId" :scale="0.5" :strokeWidth="5"/>
                </template>
                
                <template #optionPdf>
                    PRINT PDF
                </template>
                <template #optionCsv>
                    DOWNLOAD CSV
                </template>
                <template #optionImg>
                    DOWNLOAD IMAGE
                </template>
                <template #optionTable>
                    TOGGLE TABLE
                </template>
                <template #optionLabels>
                    TOGGLE LABELS
                </template>
                <template template #optionFullscreen="{ toggleFullscreen, isFullscreen }">
                    <button @click="toggleFullscreen(isFullscreen ? 'out' : 'in')">FULLSCREEN</button>
                </template>
                <template #svg="{ svg }">
                    <circle :cx="30" :cy="30" :r="30" fill="#42d392" />
                    <text :x="30" :y="30" text-anchor="middle">#SVG</text>
                </template>
                <template #dataLabel="{ datapoint, isBlur, isVisible, isSafari, textAlign, flexAlign, percentage }">
                    <div :style="`background:${datapoint.color}`">
                        {{ datapoint.name }} : {{ percentage }}
                    </div>
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
            </VueDataUi>
        </template>

        <template #knobs>
            <ConfigKnobs :model="model" @change="step += 1"/>
        </template>
    </Box>
</template>