<script setup>
import { ref, computed, onMounted } from "vue";
import LocalVueUiGalaxy from '../src/components/vue-ui-galaxy.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import { useArena } from "../src/useArena";

import { VueUiGalaxy } from "vue-data-ui";
import { VueUiGalaxy as VueUiGalaxyTreeshaken } from "vue-data-ui/vue-ui-galaxy";
import ConfigKnobs from "./ConfigKnobs.vue";
import { useConfigurationControls } from "./createConfigModel";
import { useConfig } from "../src/useConfig"

const { local, build, vduiLocal, vduiBuild, toggleTable } = useArena();
const { vue_ui_galaxy: DEFAULT_CONFIG } = useConfig();

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
        dataset.value = [
            {
                name: "Series 1",
                values: [100]
            },
            {
                name: "Series 2",
                values: [200]
            },
            {
                name: "Series 3",
                values: [300, 1]
            },
        ]
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
    
    CHECKBOX("useCssAnimation", { def: true }),
    CHECKBOX("useBlurOnHover", { def: true }),
    TEXT("style.fontFamily", { def: "inherit" }),
    COLOR("style.chart.backgroundColor", { def: "#FFFFFF" }),
    COLOR("style.chart.color", { def: "#1A1A1A" }),
    NUMBER("style.chart.layout.arcs.strokeWidth", { def: 24, min: 2, max: 48 }),
    NUMBER("style.chart.layout.arcs.borderWidth", { def: 12, min: 1, max: 24 }),
    NUMBER("style.chart.layout.arcs.offsetX", { def: 0, min: -100, max: 100 }),
    NUMBER("style.chart.layout.arcs.offsetY", { def: 0, min: -100, max: 100 }),
    CHECKBOX("style.chart.layout.arcs.hoverEffect.show", { def: true }),
    NUMBER("style.chart.layout.arcs.hoverEffect.multiplicator", { def: 1.1, min: 1, max: 2, step: 0.05 }),
    CHECKBOX("style.chart.layout.arcs.gradient.show", { def: true }),
    RANGE("style.chart.layout.arcs.gradient.intensity", { def: 30, min: 0, max: 100 }),
    COLOR("style.chart.layout.arcs.gradient.color", { def: "#FFFFFF20" }),
    TEXT("style.chart.layout.labels.dataLabels.prefix", { def: "P" }),
    TEXT("style.chart.layout.labels.dataLabels.suffix", { def: "S" }),

    COLOR("style.chart.legend.backgroundColor", { def: "#FFFFFF" }),
    COLOR("style.chart.legend.color", { def: "#1A1A1A" }),
    CHECKBOX("style.chart.legend.show", { def: true }),
    NUMBER("style.chart.legend.fontSize", { def: 16, min: 8, max: 48 }),
    CHECKBOX("style.chart.legend.bold", { def: false }),
    NUMBER("style.chart.legend.roundingValue", { def: 2, min: 0, max: 12 }),
    NUMBER("style.chart.legend.roundingPercentage", { def: 2, min: 0, max: 12 }),
    CHECKBOX("style.chart.legend.showValue", { def: false }),
    CHECKBOX("style.chart.legend.showPercentage", { def: true }),
    SELECT("style.chart.legend.position", ["top", "bottom"], { def: "bottom" }),

    TEXT("style.chart.title.text", { def: "Lorem ipsum dolor sit amet" }),
    COLOR("style.chart.title.color", { def: "#1A1A1A" }),
    NUMBER("style.chart.title.fontSize", { def: 20, min: 8, max: 48 }),
    CHECKBOX("style.chart.title.bold", { def: true }),
    COLOR("style.chart.title.subtitle.color", { def: "#CCCCCC" }),
    TEXT("style.chart.title.subtitle.text", { def: "Lorem ipsum dolor sit amet" }),
    NUMBER("style.chart.title.subtitle.fontSize", { def: 16, min: 8, max: 48 }),
    CHECKBOX("style.chart.title.subtitle.bold", { def: false }),

    CHECKBOX("style.chart.tooltip.show", { def: true }),
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

    CHECKBOX("table.show", { def: false }),
    CHECKBOX("table.useDialog", { def: true }),
    
    NUMBER("table.responsiveBreakpoint", { def: 300, min: 300, max: 800 }),
    COLOR("table.th.color", { def: "#1A1A1A" }),
    COLOR("table.th.backgroundColor", { def: "#FFFFFF" }),
    TEXT("table.th.outline", { def: "none" }),
    COLOR("table.td.color", { def: "#1A1A1A" }),
    COLOR("table.td.backgroundColor", { def: "#FFFFFF" }),
    TEXT("table.td.outline", { def: "none" }),
    NUMBER("table.td.roundingValue", { def: 2, min: 0, max: 12 }),
    NUMBER("table.td.roundingPercentage", { def: 2, min: 0, max: 12 })
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

const configTheme = computed(() => ({ theme : currentTheme.value }));

const config = computed(() => {
    const c = convertArrayToObject(model.value)

    if (testCustomTooltip.value) {
        return {
            ...c,
            style: {
                ...c.style,
                chart: {
                    ...c.style.chart,
                    tooltip: {
                        ...c.style.chart.tooltip,
                        customFormat: (data) => {
                            console.log('GALAXY CUSTOM TOOLTIP', data)
                            return 'CUSTOM TOOLTIP'
                        }
                    }
                }
            }
        }
    } else {
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
                        labels: {
                            ...c.style.chart.layout.labels,
                            dataLabels: {
                                ...c.style.chart.layout.labels.dataLabels,
                                formatter: ({value, config}) => {
                                    console.log(config)
                                    return `f | ${value}`
                                }
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

onMounted(async () => {
    if (local.value) {
        const img = await local.value.getImage()
        console.log(img);

        // setTimeout(() => {
        //     local.value.hideSeries('Series 3');
        // }, 4000)
        // setTimeout(() => {
        //     local.value.showSeries('Series 3');
        //     local.value.hideSeries('Series 2');
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
    <div style="margin: 12px 0">
        <input type="checkbox" v-model="testCustomTooltip" id="custom-tooltip" />
        <label for="custom-tooltip" style="color:#CCCCCC">Test custom tooltip</label>
    </div>

    <Box comp="VueUiGalaxy" :dataset="dataset">
        <template #title>VueUiGalaxy</template>

        <template #responsive>
            <div style="width: 600px; height: 600px; resize: both; overflow: auto; background: white">
                <LocalVueUiGalaxy :dataset="dataset" :config="{ ...config, responsive: true }" />
            </div>
        </template>

        <template #theme>
            <LocalVueUiGalaxy :dataset="dataset" :config="configTheme" />
        </template>

        <template #local>
            <LocalVueUiGalaxy :dataset="dataset" :config="config" :key="`local_${step}`" @selectLegend="selectLegend" @selectDatapoint="selectDatapoint" ref="local">
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
                <template #tooltip-before="{ datapoint, seriesIndex, series, config, bars, lines, plots }">
                    #BEFORE {{ series.name }}
                </template>
                <template #tooltip-after="{ datapoint, seriesIndex, series, config, bars, lines, plots }">
                    #AFTER {{ series.name }}
                </template>
                <template #source>
                    <div style="width:100%;font-size:10px;text-align:left">
                        SOURCE: Lorem ipsum dolor sit, amet consectetur adipisicing elit. Tenetur, molestiae perspiciatis nam quae libero, deserunt in aperiam unde officia sint saepe laboriosam ducimus aspernatur labore! Sapiente aspernatur corrupti quis ad.
                    </div>
                </template>
            </LocalVueUiGalaxy>
        </template>

        <template #VDUI-local>
            <LocalVueDataUi component="VueUiGalaxy" :dataset="dataset" :config="config" :key="`vdui_local_${step}`" @selectLegend="selectLegend" @selectDatapoint="selectDatapoint" ref="vduiLocal">
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
            <VueUiGalaxy :dataset="dataset" :config="config" :key="`build_${step}`" @selectLegend="selectLegend" @selectDatapoint="selectDatapoint" ref="build">
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
            </VueUiGalaxy>
        </template>

        <template #build-treesh>
            <VueUiGalaxyTreeshaken :dataset="dataset" :config="config" :key="`build_${step}`" @selectLegend="selectLegend" @selectDatapoint="selectDatapoint" ref="build">
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
            </VueUiGalaxyTreeshaken>
        </template>

        <template #VDUI-build>
            <VueDataUi component="VueUiGalaxy" :dataset="dataset" :config="config" :key="`vdui_build_${step}`" @selectLegend="selectLegend" @selectDatapoint="selectDatapoint" ref="vduiBuild">
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

        <template #knobs>
            <ConfigKnobs :model="model" @change="step += 1"/>
        </template>

        <template #config>
            {{ config }}
        </template>
    </Box>
</template>