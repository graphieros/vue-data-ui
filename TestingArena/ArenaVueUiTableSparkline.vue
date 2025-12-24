<script setup>
import { ref, computed, onMounted } from "vue";
import LocalVueUiTableSparkline from '../src/components/vue-ui-table-sparkline.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import { VueUiTableSparkline } from "vue-data-ui";
import { VueUiTableSparkline as VueUiTableSparklineTreeshaken } from "vue-data-ui/vue-ui-table-sparkline";
import ConfigKnobs from "./ConfigKnobs.vue";
import { useConfigurationControls } from "./createConfigModel";
import { useConfig } from "../src/useConfig"

const { vue_ui_table_sparkline: DEFAULT_CONFIG } = useConfig();

const {
    CHECKBOX,
    NUMBER,
    RANGE,
    TEXT,
    COLOR,
    SELECT,
    createModel
} = useConfigurationControls(DEFAULT_CONFIG);

const dataset = ref([
    {
        name: "Serie 1",
        values: [0, 1, 2, 3, 5, 8, 13],
    },
    {
        name: "Serie 2",
        values: [8.2, 12, 13, 25, 31, 42, 53, 42, 31, 25, 13, 12, 8],
    },
    {
        name: "Serie 3",
        values: [66, 22, 33, 12, 55, 64, 75, 64, 55, 12, 33, 22, 66],
    },
    {
        name: "Serie 4",
        values: [54, 44, 34, 12, 32, 26, 33, 26, 32, 12, 34, 44, 54],
    },
    {
        name: "Serie 5",
        values: [12, 14, 18, 25, 32, 64, 77, 64, 32, 25, 18, 14, 12],
    },
])

onMounted(() => {
    setTimeout(() => {
        dataset.value[0] = {
            name: "Serie 1",
            values: [10, 0, 10, 0, 10, 0, 10, 0],
        }
    }, 3000)
})

const model = createModel([
    CHECKBOX("userOptions.show", { def: true }),
    CHECKBOX("userOptions.buttons.pdf", { def: true }),
    CHECKBOX("userOptions.buttons.csv", { def: true }),
    CHECKBOX("userOptions.buttons.img", { def: true }),
    CHECKBOX("userOptions.buttons.fullscreen", { def: true }),
    SELECT("userOptions.position", ["left", "right"], { def: "right" }),
    CHECKBOX("userOptions.showOnChartHover", { def: true }),
    CHECKBOX("userOptions.keepStateOnChartLeave", { def: true }),

    NUMBER("userOptions.print.scale", { def: 2, min: 1, max: 5 }),
    CHECKBOX("userOptions.print.allowTaint", { def: true }),
    CHECKBOX("userOptions.print.useCORS", { def: true }),
    COLOR("userOptions.print.backgroundColor", { def: "#FFFFFF" }),

    NUMBER("responsiveBreakpoint", { def: 500, min: 300, max: 800 }),
    CHECKBOX("showAverage", { def: true }),
    CHECKBOX("showMedian", { def: true }),
    CHECKBOX("showTotal", { def: true }),
    NUMBER("roundingAverage", { def: 2, min: 0, max: 12 }),
    NUMBER("roundingMedian", { def: 2, min: 0, max: 12 }),
    NUMBER("roundingValues", { def: 2, min: 0, max: 12 }),
    NUMBER("roundingTotal", { def: 2, min: 0, max: 12 }),
    CHECKBOX("showSparklines", { def: true }),
    TEXT("fontFamily", { def: "inherit" }),
    CHECKBOX("sparkline.useGradient", { def: true }),
    CHECKBOX("sparkline.showArea", { def: true }),
    NUMBER("sparkline.strokeWidth", { def: 3, min: 1, max: 12 }),
    SELECT("sparkline.type", ["line", "bar"], { def: "line" }),
    CHECKBOX("sparkline.smooth", { def: true }),
    CHECKBOX("sparkline.animation.show", { def: true }),
    NUMBER("sparkline.animation.animationFrames", { def: 360, min: 60, max: 1000 }),

    TEXT("translations.serie", { def: "Serie" }),
    TEXT("translations.total", { def: "Total" }),
    TEXT("translations.average", { def: "Average" }),
    TEXT("translations.median", { def: "Median" }),
    TEXT("translations.chart", { def: "Evolution" }),

    COLOR("title.backgroundColor", { def: "#FFFFFF" }),
    TEXT("title.text", { def: "Lorem ipsum dolor sot amet" }),
    NUMBER("title.fontSize", { def: 18, min: 8, max: 48 }),
    COLOR("title.color", { def: "#1A1A1A" }),
    CHECKBOX("title.bold", { def: true }),
    SELECT("title.textAlign", ["left", "center", "right"], { def: "center" }),
    TEXT("title.subtitle.text", { def: "Lorem ipsum dolor sit amet" }),
    COLOR("title.subtitle.color", { def: "#1A1A1A" }),
    NUMBER("title.subtitle.fontSize", { def: 14, min: 8, max: 48 }),
    CHECKBOX("title.subtitle.bold", { def: false }),

    COLOR("thead.backgroundColor", { def: "#FFFFFF" }),
    COLOR("thead.color", { def: "#1A1A1A" }),
    NUMBER("thead.fontSize", { def: 14, min: 8, max: 24 }),
    TEXT("thead.outline", { def: "none" }),
    SELECT("thead.textAlign", ["left", "center", "right"], { def: "right" }),
    CHECKBOX("thead.bold", { def: false }),

    COLOR("tbody.backgroundColor", { def: "#BBBBBB" }),
    COLOR("tbody.color", { def: "#1A1A1A" }),
    NUMBER("tbody.fontSize", { def: 14, min: 8, max: 24 }),
    TEXT("tbody.outline", { def: "none" }),
    SELECT("tbody.textAlign", ["left", "center", "right"], { def: "right" }),
    CHECKBOX("tbody.bold", { def: false }),

    CHECKBOX("tbody.selectedColor.useSerieColor", { def: true }),
    TEXT("tbody.selectedColor.fallback", { def: "#E1E5E840" }),

    NUMBER("sparkline.dimensions.width", { def: 150, min: 100, max: 300 }),
    NUMBER("sparkline.dimensions.heightRatio", { def: 1, min: 0.2, max: 2, step: 0.01 }),

    CHECKBOX("sortedSeriesName", { def: true }),
    CHECKBOX("sortedSum", { def: true }),
    CHECKBOX("sortedAverage", { def: true }),
    CHECKBOX("sortedMedian", { def: true }),
    CHECKBOX("resetSortOnClickOutside", { def: true })
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
    return {
        ...convertArrayToObject(model.value),
        // formatter: ({value, config }) => {
        //     // console.log(config)
        //     return `f | ${value}`
        // },
        theme: currentTheme.value,
        customPalette: ['#6376DD', "#DD3322", "#66DDAA"],
        colNames: ['A', 'B', 'C', 'D', 'E'],
        sortedDataColumnIndices: [0, 1, 2],
    }
})

const step = ref(0)

</script>

<template>
    <div style="margin: 12px 0; color: white">
        Theme:
        <select v-model="currentTheme" @change="step += 1">
            <option v-for="opt in themeOptions">{{ opt }}</option>
        </select>
    </div>
    <Box comp="VueUiTableSparkline" :dataset="dataset" :config="config">
        <template #title>VueUiTableSparkline</template>

        <template #theme>
            <LocalVueUiTableSparkline :dataset="dataset" :config="configTheme" />
        </template>

        <template #local>
            <LocalVueUiTableSparkline :dataset="dataset" :config="config" :key="`local_${step}`">
                <template #chart-background>
                    <div style="width: 100%; height: 100%; background: radial-gradient(at top left, red, white)"/>
                </template>
                <template #optionPdf>
                    PDF
                </template>
                <template #source>
                    <div style="width:100%;font-size:10px;text-align:left">
                        SOURCE: Lorem ipsum dolor sit, amet consectetur adipisicing elit. Tenetur, molestiae perspiciatis nam quae libero, deserunt in aperiam unde officia sint saepe laboriosam ducimus aspernatur labore! Sapiente aspernatur corrupti quis ad.
                    </div>
                </template>
            </LocalVueUiTableSparkline>
        </template>

        <template #VDUI-local>
            <LocalVueDataUi component="VueUiTableSparkline" :dataset="dataset" :config="config" :key="`vdui_local_${step}`">
            </LocalVueDataUi>
        </template>

        <template #build>
            <VueUiTableSparkline :dataset="dataset" :config="config" :key="`build_${step}`">
            </VueUiTableSparkline>
        </template>

        <template #build-treesh>
            <VueUiTableSparklineTreeshaken :dataset="dataset" :config="config" :key="`build_${step}`">
            </VueUiTableSparklineTreeshaken>
        </template>

        <template #VDUI-build>
            <VueDataUi component="VueUiTableSparkline" :dataset="dataset" :config="config" :key="`vdui_build_${step}`">
            </VueDataUi>
        </template>

        <template #knobs="{ summaryOpen }">
            <ConfigKnobs :model="model" @change="step += 1" :open="summaryOpen"/>
        </template>
    </Box>
</template>

<style>

</style>