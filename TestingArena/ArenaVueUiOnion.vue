<script setup>
import { ref, computed, onMounted } from "vue";
import LocalVueUiOnion from '../src/components/vue-ui-onion.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import { useArena } from "../src/useArena";
import { VueUiOnion } from "vue-data-ui";
import { VueUiOnion as VueUiOnionTreeshaken } from "vue-data-ui/vue-ui-onion";
import ConfigKnobs from "./ConfigKnobs.vue";
import { useConfigurationControls } from "./createConfigModel";
import { useConfig } from "../src/useConfig"

const { local, build, vduiLocal, vduiBuild, toggleTable } = useArena();
const { vue_ui_onion: DEFAULT_CONFIG } = useConfig();

const {
    CHECKBOX,
    NUMBER,
    RANGE,
    TEXT,
    COLOR,
    SELECT,
    createModel
} = useConfigurationControls(DEFAULT_CONFIG);

const dataset = ref(undefined)

onMounted(() => {
    setTimeout(() => {
        dataset.value = [
            {
                name: "Serie 1",
                percentage: 20,
                value: 1200,
            },
            {
                name: "Serie 2",
                percentage: 30,
                value: 1000,
            },
            {
                name: "Serie 3",
                percentage: 60,
                value: 500
            },
            {
                name: "Serie 4",
                percentage: 90,
                value: 1280
            }
        ]
    }, 2000)
})

function mutate() {
    dataset.value[0].percentage = Math.random() * 100
    dataset.value[1].percentage = Math.random() * 100
    dataset.value[2].percentage = Math.random() * 100
    dataset.value[3].percentage = Math.random() * 100
}

const alternateConfig = ref({
    table: {
        th: {
            backgroundColor: '#00FF00'
        }
    },
    style: {
        chart: {
            backgroundColor: '#FF0000',
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

const model = createModel([
    CHECKBOX("debug", { def: true }),
    CHECKBOX("loading", { def: false }),
    CHECKBOX("responsive", { def: false }),
    CHECKBOX("userOptions.show", { def: true }),
    CHECKBOX("userOptions.buttons.pdf", { def: true }),
    CHECKBOX("userOptions.buttons.img", { def: true }),
    CHECKBOX("userOptions.buttons.csv", { def: true }),
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
    CHECKBOX("useStartAnimation", { def: true }),
    CHECKBOX("useBlurOnHover", { def: true }),
    TEXT("style.fontFamily", { def: "inherit", label: "fontFamily", category: "general" }),
    COLOR("style.chart.backgroundColor", { def: "#FFFFFF", label: "backgroundColor", category: "general" }),
    COLOR("style.chart.color", { def: "#1A1A1A", label: "textColor", category: "general" }),
    CHECKBOX("style.chart.useGradient", { def: true, label: "useGradient", category: "general" }),
    RANGE("style.chart.gradientIntensity", { def: 20, min: 10, max: 40, label: "gradientIntensity", category: "general" }),

    COLOR("style.chart.layout.gutter.color", { def: "#e1e5e8" }),
    RANGE("style.chart.layout.gutter.width", { def: 0.62, min: 0.1, max: 1, step: 0.01 }),
    RANGE("style.chart.layout.track.width", { def: 0.62, min: 0.1, max: 1, step: 0.01 }),

    CHECKBOX("style.chart.layout.labels.show", { def: true }),
    NUMBER("style.chart.layout.labels.fontSize", { def: 14, min: 8, max: 48 }),
    COLOR("style.chart.layout.labels.color", { def: "#1A1A1A" }),
    NUMBER("style.chart.layout.labels.roundingValue", { def: 2, min: 0, max: 12 }),
    NUMBER("style.chart.layout.labels.roundingPercentage", { def: 2, min: 0, max: 12 }),
    CHECKBOX("style.chart.layout.labels.bold", { def: true }),
    NUMBER("style.chart.layout.labels.offsetY", { def: 0, min: -100, max: 100 }),
    NUMBER("style.chart.layout.labels.offsetX", { def: 0, min: -100, max: 100 }),
    CHECKBOX("style.chart.layout.labels.value.show", { def: true }),
    CHECKBOX("style.chart.layout.labels.percentage.show", { def: true }),

    TEXT("style.chart.title.text", { def: "Lorem ipsum dolor sic amet", label: "textContent", category: "title" }),
    COLOR("style.chart.title.color", { def: "#1A1A1A", label: "textColor", category: "title" }),
    NUMBER("style.chart.title.fontSize", { def: 20, min: 6, max: 48, label: "fontSize", category: "title" }),
    CHECKBOX("style.chart.title.bold", { def: true, label: "bold", category: "title" }),

    TEXT("style.chart.title.subtitle.text", { def: "Lorem ipsum dolor sic amet", label: "textContent", category: "subtitle" }),
    COLOR("style.chart.title.subtitle.color", { def: "#A1A1A1", label: "textColor", category: "subtitle" }),
    NUMBER("style.chart.title.subtitle.fontSize", { def: 16, min: 6, max: 42, label: "fontSize", category: "subtitle" }),
    CHECKBOX("style.chart.title.subtitle.bold", { def: false, label: "bold", category: "subtitle" }),

    CHECKBOX("style.chart.legend.show", { def: true, label: "show", category: "legend" }),
    COLOR("style.chart.legend.backgroundColor", { def: "#FFFFFF", label: "backgroundColor", category: "legend" }),
    COLOR("style.chart.legend.color", { def: "#1A1A1A", label: "textColor", category: "legend" }),
    NUMBER("style.chart.legend.fontSize", { def: 16, min: 6, max: 42, label: "fontSize", category: "legend" }),
    CHECKBOX("style.chart.legend.bold", { def: false, label: "bold", category: "legend" }),
    NUMBER("style.chart.legend.roundingValue", { def: 0, min: 0, max: 6, label: ["rounding", "is", "value"], category: "legend" }),
    NUMBER("style.chart.legend.roundingPercentage", { def: 0, min: 0, max: 6, label: "percentageRounding", category: "legend" }),
    SELECT("style.chart.legend.position", ["top", "bottom"], { def: "bottom" }),

    CHECKBOX("style.chart.tooltip.show", { def: true }),
    COLOR("style.chart.tooltip.backgroundColor", { def: "#FFFFFF" }),
    COLOR("style.chart.tooltip.color", { def: "#1A1A1A" }),
    NUMBER("style.chart.tooltip.fontSize", { def: 14, min: 6, max: 24 }),
    CHECKBOX("style.chart.tooltip.showValue", { def: true }),
    NUMBER("style.chart.tooltip.roundingValue", { def: 0, min: 0, max: 6 }),
    NUMBER("style.chart.tooltip.roundingPercentage", { def: 0, min: 0, max: 6 }),
    CHECKBOX("style.chart.tooltip.showPercentage", { def: true }),
    NUMBER("style.chart.tooltip.roundingPercentage", { def: 0, min: 0, max: 6 }),
    RANGE("style.chart.tooltip.backgroundOpacity", { def: 100, min: 0, max: 100 }),
    SELECT("style.chart.tooltip.position", ["left", "center", "right"], { def: "center" }),
    NUMBER("style.chart.tooltip.offsetY", { def: 24, min: 0, max: 48 }),

    CHECKBOX("table.show", { def: false }),
    CHECKBOX("table.useDialog", { def: true }),

    NUMBER("table.responsiveBreakpoint", { def: 400, min: 300, max: 800 }),
    COLOR("table.th.backgroundColor", { def: "#FFFFFF" }),
    COLOR("table.th.color", { def: "#1A1A1A" }),
    TEXT("table.th.outline", { def: "none" }),
    COLOR("table.td.backgroundColor", { def: "#FFFFFF" }),
    COLOR("table.td.color", { def: "#1A1A1A" }),
    TEXT("table.td.outline", { def: "none" }),
    NUMBER("table.td.roundingValue", { def: 0, min: 0, max: 6 }),
    NUMBER("table.td.roundingPercentage", { def: 0, min: 0, max: 6 }),
    TEXT("table.translations.value", { def: "Value" }),
    TEXT("table.translations.percentage", { def: "Percentage" }),
    TEXT("table.translations.serie", { def: "Serie" })
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
                chart: {
                    ...c.style.chart,
                    tooltip: {
                        ...c.style.chart.tooltip,
                        customFormat: ({ datapoint }) => {
                            let html = '';
                            console.log(datapoint);
                            return "test"
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
                            value: {
                                ...c.style.chart.layout.labels.value,
                                formatter: ({value}) => {
                                    return `f - ${value}`
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
});

function selectLegend(legend) {
    console.log({ legend })
}

const step = ref(0)

onMounted(async () => {
    if (local.value) {
        const img = await local.value.getImage()
        console.log(img);

        setTimeout(() => {
            local.value.hideSeries('Serie 1');
        }, 4000);
        setTimeout(() => {
            local.value.showSeries('Serie 1');
            local.value.hideSeries('Serie 2');
        }, 5000);
    }
})

</script>

<template>
    <button @click="toggleTable">TOGGLE TABLE</button>
    <button @click="mutate">MUTATE</button>
    <button @click="toggleProps">TOGGLE PROPS: {{ isPropsToggled }}</button>

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

    <Box comp="VueUiOnion" :dataset="dataset">
        <template #title>VueUiOnion</template>

        <template #responsive>
            <div style="width: 600px; height: 600px; resize: both; overflow: auto; background: white">
                <LocalVueUiOnion :key="`responsive_${step}`" :dataset="dataset" :config="{
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
                </LocalVueUiOnion>
            </div>
        </template>

        <template #theme>
            <LocalVueUiOnion :dataset="dataset" :config="configTheme" />
        </template>

        <template #local>
            <LocalVueUiOnion :dataset="dataset" :config="isPropsToggled ? alternateConfig : config" :key="`local_${step}`" @selectLegend="selectLegend" ref="local">
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
            </LocalVueUiOnion>
        </template>

        <template #VDUI-local>
            <LocalVueDataUi component="VueUiOnion" :dataset="dataset" :config="isPropsToggled ? alternateConfig : config" :key="`VDUI-lodal_${step}`" @selectLegend="selectLegend" ref="vduiLocal">
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
            <VueUiOnion :dataset="dataset" :config="isPropsToggled ? alternateConfig : config" :key="`build_${step}`" @selectLegend="selectLegend" ref="build">
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
            </VueUiOnion>
        </template>

        <template #build-treesh>
            <VueUiOnionTreeshaken :dataset="dataset" :config="isPropsToggled ? alternateConfig : config" :key="`build_${step}`" @selectLegend="selectLegend" ref="build">
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
            </VueUiOnionTreeshaken>
        </template>

        <template #VDUI-build>
            <VueDataUi component="VueUiOnion" :dataset="dataset" :config="isPropsToggled ? alternateConfig : config" :key="`VDUI-build_${step}`" @selectLegend="selectLegend" ref="vduiBuild">
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

        <template #config>
            {{ config }}
        </template>
    </Box>
</template>