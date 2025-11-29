<script setup>
import { ref, computed, onMounted } from "vue";
import LocalVueUiFunnel from '../src/components/vue-ui-funnel.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import { useArena } from "../src/useArena"

import { VueUiFunnel } from "vue-data-ui";
import { VueUiFunnel as VueUiFunnelTreeshaken } from "vue-data-ui/vue-ui-funnel";
import ConfigKnobs from "./ConfigKnobs.vue";
import { useConfigurationControls } from "./createConfigModel";
import { useConfig } from "../src/useConfig"

const { local, build, vduiLocal, vduiBuild, toggleTable } = useArena();
const { vue_ui_funnel: DEFAULT_CONFIG } = useConfig();

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
        name: 'Lead',
        value: 7745.8234576
    },
    {
        name: 'Opportunity',
        value: 5468
    },
    {
        name: 'Qualified',
        value: 4238
    },
    {
        name: 'Sold',
        value: 2025
    },
    {
        name: 'Retained',
        value: 1520
    },
])

const model = createModel([
    CHECKBOX("responsive", { def: false }),
    CHECKBOX("responsiveProportionalSizing", { def: false }),

    CHECKBOX("useCssAnimation", { def: true }),
    COLOR("style.chart.backgroundColor", { def: "#FFFFFF" }),
    COLOR("style.chart.color", { def: "#1A1A1A" }),
    RANGE("style.chart.width", { def: 600, min: 300, max: 1000 }),
    RANGE("style.chart.height", { def: 500, min: 300, max: 1000 }),

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

    NUMBER("style.chart.padding.top", { def: 12, min: 0, max: 200 }),
    NUMBER("style.chart.padding.right", { def: 128, min: 0, max: 200 }),
    NUMBER("style.chart.padding.bottom", { def: 24, min: 0, max: 200 }),
    NUMBER("style.chart.padding.left", { def: 24, min: 0, max: 200 }),

    RANGE("style.chart.barCircleSpacingRatio", { def: 0.05, min: 0, max: 0.5, step: 0.01 }),

    COLOR("style.chart.circles.stroke", { def: "#FFFFFF" }),
    RANGE("style.chart.circles.strokeWidth", { def: 1, min: 0, max: 12 }),
    RANGE("style.chart.circles.dataLabels.fontSize", { def: 16, min: 8, max: 48 }),
    NUMBER("style.chart.circles.dataLabels.offsetY", { def: 0, min: -100, max: 100 }),
    CHECKBOX("style.chart.circles.dataLabels.adaptColorToBackground", { def: true }),
    COLOR("style.chart.circles.dataLabels.color", { def: "#1A1A1A" }),
    NUMBER("style.chart.circles.dataLabels.rounding", { def: 1, min: 0, max: 6 }),
    CHECKBOX("style.chart.circles.dataLabels.bold", { def: true }),

    CHECKBOX("style.chart.circleLinks.show", { def: true }),
    COLOR("style.chart.circleLinks.color", { def: "#E1E5E8" }),
    RANGE("style.chart.circleLinks.widthRatio", { def: 1, min: 0.1, max: 2, step: 0.01 }),

    CHECKBOX("style.chart.area.show", { def: true }),
    COLOR("style.chart.area.color", { def: "#e1e5e8" }),

    COLOR("style.chart.bars.stroke", { def: "#FFFFFF" }),
    COLOR("style.chart.bars.defaultColor", { def: "#1f77b4" }),
    RANGE("style.chart.bars.strokeWidth", { def: 1, min: 0, max: 12 }),
    RANGE("style.chart.bars.gapRatio", { def: 0.2, min: 0, max: 1, step: 0.01 }),
    RANGE("style.chart.bars.borderRadius", { def: 3, min: 0, max: 24 }),

    NUMBER("style.chart.bars.dataLabels.name.fontSize", { def: 16, min: 8, max: 42 }),
    COLOR("style.chart.bars.dataLabels.name.color", { def: "#1A1A1A" }),
    CHECKBOX("style.chart.bars.dataLabels.name.bold", { def: true }),
    NUMBER("style.chart.bars.dataLabels.name.offsetX", { def: 0, min: -100, max: 100 }),
    NUMBER("style.chart.bars.dataLabels.name.offsetY", { def: 0, min: -100, max: 100 }),

    NUMBER("style.chart.bars.dataLabels.value.fontSize", { def: 16, min: 8, max: 42 }),
    NUMBER("style.chart.bars.dataLabels.value.rounding", { def: 0, min: 0, max: 6 }),
    CHECKBOX("style.chart.bars.dataLabels.value.bold", { def: false }),
    COLOR("style.chart.bars.dataLabels.value.color", { def: "#1A1A1A" }),
    TEXT("style.chart.bars.dataLabels.value.prefix", { def: "P" }),
    TEXT("style.chart.bars.dataLabels.value.suffix", { def: "S" }),
    NUMBER("style.chart.bars.dataLabels.value.offsetX", { def: 0, min: -100, max: 100 }),
    NUMBER("style.chart.bars.dataLabels.value.offsetY", { def: 0, min: -100, max: 100 }),

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
        theme: currentTheme.value,
        ...c,
        style: {
            ...c.style,
            chart: {
                ...c.style.chart,
                circles: {
                    ...c.style.chart.circles,
                    dataLabels: {
                        ...c.style.chart.circles.dataLabels,
                        // formatter: ({ value, config }) => {
                        //     console.log(config)
                        //     return `CIR ${value}`
                        // }
                    }
                },
                bars: {
                    ...c.style.chart.bars,
                    dataLabels: {
                        ...c.style.chart.bars.dataLabels,
                        value: {
                            ...c.style.chart.bars.dataLabels.value,
                            // formatter: ({ value, config }) => {
                            //     console.log(config)
                            //     return `BAR ${value}`
                            // }
                        }
                    }
                }
            }
        }
    }
})

const step = ref(0);

onMounted(async () => {
    if (local.value) {
        const img = await local.value.getImage();
        console.log(img)
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

    <Box comp="VueUiFunnel" :dataset="dataset" :config="config">
        <template #title>VueUiFunnel</template>

        <template #responsive>
            <div style="width: 600px; height: 600px; resize: both; overflow: auto; background: white">
                <LocalVueUiFunnel :key="`responsive_${step}`" :dataset="dataset" :config="{
                    ...config,
                    responsive: true
                }">
                <template #chart-background>
                    <div style="width: 100%; height: 100%; background: radial-gradient(at top left, red, white)"/>
                </template>
            </LocalVueUiFunnel>
            </div>
        </template>

        <template #theme>
            <LocalVueUiFunnel :dataset="dataset" :config="configTheme" />
        </template>

        <template #local>
            <LocalVueUiFunnel :dataset="dataset" :config="config" ref="local">
                <template #source>
                    #source
                </template>
                <template #watermark="{ isPrinting }">
                    <div v-if="isPrinting" style="font-size: 100px; opacity: 0.1; transform: rotate(-10deg)">
                        WATERMARK
                    </div>
                </template>
                <template #optionPdf>
                    PRINT PDF
                </template>
                <template #svg="{ svg }">
                    <g style="pointer-events: none;">
                        <circle :cx="svg.width - 30" :cy="svg.height / 2" :r="30" fill="#42d392" />
                        <text :x="svg.width - 30" :y="svg.height / 2" text-anchor="middle">#SVG</text>
                    </g>
                </template>
            </LocalVueUiFunnel>
        </template>

        <template #VDUI-local>
            <LocalVueDataUi component="VueUiFunnel" :dataset="dataset" :config="config">
                <template #source>
                    #source
                </template>
                <template #watermark="{ isPrinting }">
                    <div v-if="isPrinting" style="font-size: 100px; opacity: 0.1; transform: rotate(-10deg)">
                        WATERMARK
                    </div>
                </template>
                <template #optionPdf>
                    PRINT PDF
                </template>
                <template #svg="{ svg }">
                    <g style="pointer-events: none;">
                        <circle :cx="svg.width - 30" :cy="svg.height / 2" :r="30" fill="#42d392" />
                        <text :x="svg.width - 30" :y="svg.height / 2" text-anchor="middle">#SVG</text>
                    </g>
                </template>
            </LocalVueDataUi>
        </template>

        <template #build>
            <VueUiFunnel :dataset="dataset" :config="config">
                <template #source>
                    #source
                </template>
                <template #watermark="{ isPrinting }">
                    <div v-if="isPrinting" style="font-size: 100px; opacity: 0.1; transform: rotate(-10deg)">
                        WATERMARK
                    </div>
                </template>
                <template #optionPdf>
                    PRINT PDF
                </template>
                <template #svg="{ svg }">
                    <g style="pointer-events: none;">
                        <circle :cx="svg.width - 30" :cy="svg.height / 2" :r="30" fill="#42d392" />
                        <text :x="svg.width - 30" :y="svg.height / 2" text-anchor="middle">#SVG</text>
                    </g>
                </template>
            </VueUiFunnel>
        </template>

        <template #build-treesh>
            <VueUiFunnelTreeshaken :dataset="dataset" :config="config">
                <template #source>
                    #source
                </template>
                <template #watermark="{ isPrinting }">
                    <div v-if="isPrinting" style="font-size: 100px; opacity: 0.1; transform: rotate(-10deg)">
                        WATERMARK
                    </div>
                </template>
                <template #optionPdf>
                    PRINT PDF
                </template>
                <template #svg="{ svg }">
                    <g style="pointer-events: none;">
                        <circle :cx="svg.width - 30" :cy="svg.height / 2" :r="30" fill="#42d392" />
                        <text :x="svg.width - 30" :y="svg.height / 2" text-anchor="middle">#SVG</text>
                    </g>
                </template>
            </VueUiFunnelTreeshaken>
        </template>

        <template #VDUI-build>
            <VueDataUi component="VueUiFunnel" :dataset="dataset" :config="config">
                <template #source>
                    #source
                </template>
                <template #watermark="{ isPrinting }">
                    <div v-if="isPrinting" style="font-size: 100px; opacity: 0.1; transform: rotate(-10deg)">
                        WATERMARK
                    </div>
                </template>
                <template #optionPdf>
                    PRINT PDF
                </template>
                <template #svg="{ svg }">
                    <g style="pointer-events: none;">
                        <circle :cx="svg.width - 30" :cy="svg.height / 2" :r="30" fill="#42d392" />
                        <text :x="svg.width - 30" :y="svg.height / 2" text-anchor="middle">#SVG</text>
                    </g>
                </template>
            </VueDataUi>
        </template>

        <template #knobs>
            <ConfigKnobs :model="model" @change="step += 1"/>
        </template>
    </Box>
</template>