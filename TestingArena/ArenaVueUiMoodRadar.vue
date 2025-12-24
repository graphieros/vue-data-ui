<script setup>
import { ref, computed, onMounted } from "vue";
import LocalVueUiMoodRadar from '../src/components/vue-ui-mood-radar.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import { useArena } from "../src/useArena";
import { VueUiMoodRadar } from "vue-data-ui";
import { VueUiMoodRadar as VueUiMoodRadarTreeshaken } from "vue-data-ui/vue-ui-mood-radar";
import ConfigKnobs from "./ConfigKnobs.vue";
import { useConfigurationControls } from "./createConfigModel";
import { useConfig } from "../src/useConfig"

const { local, build, vduiLocal, vduiBuild, toggleTable } = useArena();
const { vue_ui_mood_radar: DEFAULT_CONFIG } = useConfig();

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
        dataset.value = {
            "1": 96,
            "2": 64,
            "3": 128,
            "4": 256,
            "5": 384
        }
    }, 2000);
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

    TEXT("style.fontFamily", { def: "inherit" }),
    COLOR("style.chart.backgroundColor", { def: "#FFFFFF" }),
    COLOR("style.chart.color", { def: "#1A1A1A" }),

    CHECKBOX("style.chart.layout.grid.show", { def: true }),
    COLOR("style.chart.layout.grid.stroke", { def: "#e1e5e8" }),
    NUMBER("style.chart.layout.grid.strokeWidth", { def: 0.5, min: 0, max: 12, step: 0.5 }),

    COLOR("style.chart.layout.outerPolygon.stroke", { def: "#e1e5e8" }),
    NUMBER("style.chart.layout.outerPolygon.strokeWidth", { def: 1, min: 0, max: 12 }),

    COLOR("style.chart.layout.dataPolygon.color", { def: "#5F8BEE" }),
    RANGE("style.chart.layout.dataPolygon.opacity", { def: 60, min: 0, max: 100 }),
    CHECKBOX("style.chart.layout.dataPolygon.gradient.show", { def: true }),
    RANGE("style.chart.layout.dataPolygon.gradient.intensity", { def: 5, min: 0, max: 100 }),
    COLOR("style.chart.layout.dataPolygon.stroke", { def: "#1A1A1A" }),
    NUMBER("style.chart.layout.dataPolygon.strokeWidth", { def: 1, min: 0, max: 12 }),

    NUMBER("style.chart.layout.smileys.strokeWidth", { def: 1, min: 0, max: 12 }),
    COLOR("style.chart.layout.smileys.colors.1", { def: "#e20001" }),
    COLOR("style.chart.layout.smileys.colors.2", { def: "#ff9f03" }),
    COLOR("style.chart.layout.smileys.colors.3", { def: "#ffd004" }),
    COLOR("style.chart.layout.smileys.colors.4", { def: "#9ac900" }),
    COLOR("style.chart.layout.smileys.colors.5", { def: "#059f00" }),

    COLOR("style.chart.layout.dataLabel.color", { def: "#1A1A1A" }),
    NUMBER("style.chart.layout.dataLabel.roundingPercentage", { def: 2, min: 0, max: 12 }),
    NUMBER("style.chart.layout.dataLabel.roundingValue", { def: 2, min: 0, max: 12 }),
    CHECKBOX("style.chart.layout.dataLabel.bold", { def: true }),

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
    NUMBER("style.chart.legend.roundingPercentage", { def: 2, min: 0, max: 12 }),
    NUMBER("style.chart.legend.roundingValue", { def: 2, min: 0, max: 12 }),
    SELECT("style.chart.legend.position", ["top", "bottom"], { def: "bottom" }),

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
                layout: {
                    ...c.style.chart.layout,
                    dataLabel: {
                        ...c.style.chart.layout.dataLabel,
                        formatter: ({value, config }) => {
                            // console.log(config)
                            return `f | ${value}`
                        }
                    }
                }
            }
        },
        theme: currentTheme.value
    }
})

const step = ref(0)

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

    <Box comp="VueUiMoodRadar" :dataset="dataset" :config="config">
        <template #title>VueUiMoodRadar</template>

        <template #responsive>
            <div style="width: 600px; height: 600px; resize: both; overflow: auto; background: white">
                <LocalVueUiMoodRadar :dataset="dataset" :config="{ ...config, responsive: true }"/>
            </div>
        </template>

        <template #theme>
            <LocalVueUiMoodRadar :dataset="dataset" :config="configTheme" />
        </template>

        <template #local>
            <LocalVueUiMoodRadar :dataset="dataset" :config="config" :key="`local_${step}`" ref="local">
                <!-- <template #chart-background>
                    <div style="width: 100%; height: 100%; background: radial-gradient(at top left, red, white)"/>
                </template> -->
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
            </LocalVueUiMoodRadar>
        </template>

        <template #VDUI-local>
            <LocalVueDataUi component="VueUiMoodRadar" :dataset="dataset" :config="config" :key="`vdui_local_${step}`" ref="vduiLocal">
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
            <VueUiMoodRadar :dataset="dataset" :config="config" :key="`build_${step}`" ref="build">
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
            </VueUiMoodRadar>
        </template>

        <template #build-treesh>
            <VueUiMoodRadarTreeshaken :dataset="dataset" :config="config" :key="`build_${step}`" ref="build">
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
            </VueUiMoodRadarTreeshaken>
        </template>

        <template #VDUI-build>
            <VueDataUi component="VueUiMoodRadar" :dataset="dataset" :config="config" :key="`vdui_build_${step}`" ref="vduiBuild">
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

        <template #knobs="{ summaryOpen }">
            <ConfigKnobs :model="model" @change="step += 1" :open="summaryOpen"/>
        </template>
    </Box>
</template>