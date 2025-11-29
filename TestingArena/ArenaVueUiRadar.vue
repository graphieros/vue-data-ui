<script setup>
import { ref, computed, onMounted } from "vue";
import LocalVueUiRadar from '../src/components/vue-ui-radar.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import { useArena } from "../src/useArena";
import { VueUiRadar } from "vue-data-ui";
import { VueUiRadar as VueUiRadarTreeshaken } from "vue-data-ui/vue-ui-radar";
import ConfigKnobs from "./ConfigKnobs.vue";
import { useConfigurationControls } from "./createConfigModel";
import { useConfig } from "../src/useConfig"

const { local, build, vduiLocal, vduiBuild, toggleTable } = useArena();
const { vue_ui_radar: DEFAULT_CONFIG } = useConfig();

const {
    CHECKBOX,
    NUMBER,
    RANGE,
    TEXT,
    COLOR,
    SELECT,
    createModel
} = useConfigurationControls(DEFAULT_CONFIG);

const src = {
            categories: [
                { name: 'Category 1'},
                { name: 'Category 2'},
                { name: 'Category 3'},
            ],
            series: [
                {
                    name: 'Serie 1 with a long name',
                    values: [60.01, 20, 100],
                    target: 200,
                    formatter: ({value}) => {
                        return `f1 - ${value}`
                    }
                },
                {
                    name: 'Serie 2 with a long name',
                    values: [20, 80, 40],
                    target: 100,
                    // formatter: ({value}) => {
                    //     return `f2 - ${value}`
                    // }
                },
                {
                    name: 'Serie 3 also quite long',
                    values: [50, 60, 70],
                    target: 100
                }
            ]
        }

const dataset = ref(undefined);

onMounted(() => {
    setTimeout(() => {
        dataset.value = src
    }, 0)
    
    // setTimeout(() => {
    //     dataset.value = undefined;
    // }, 4000);

    // setTimeout(() => {
    //     dataset.value = src
    // }, 6000)
})

const alternateDataset = ref({
    categories: [
        { name: 'Category 1'},
        { name: 'Category 2'},
        { name: 'Category 3'},
    ],
    series: [
        {
            name: 'Serie 1',
            values: [20, 20, 20],
            target: 100,
            formatter: ({value}) => {
                return `f1 - ${value}`
            }
        },
        {
            name: 'Serie 2',
            values: [30, 30, 30],
            target: 100,
            formatter: ({value}) => {
                return `f2 - ${value}`
            }
        },
        {
            name: 'Serie 3',
            values: [40, 40, 40],
            target: 100
        }
    ]
})

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

function alterDataset() {
    dataset.value.series.push({
        name: 'Serie 4',
            values: [10, 10, 10],
            target: 100
    })
}

const model = createModel([
    CHECKBOX("debug", { def: true }),
    CHECKBOX("loading", { def: false }),
    CHECKBOX("responsive", { def: false }),
    CHECKBOX("userOptions.show", { def: true }),
    CHECKBOX("userOptions.buttons.pdf", { def: true }),
    CHECKBOX("userOptions.buttons.img", { def: true }),
    CHECKBOX("userOptions.buttons.table", { def: true }),
    CHECKBOX("userOptions.buttons.csv", { def: true }),
    CHECKBOX("userOptions.buttons.fullscreen", { def: true }),
    SELECT("userOptions.position", ["left", "right"], { def: "right" }),
    CHECKBOX("userOptions.showOnChartHover", { def: true }),
    CHECKBOX("userOptions.keepStateOnChartLeave", { def: true }),

    CHECKBOX("useCssAnimation", { def: true }),
    TEXT("style.fontFamily", { def: "inherit" }),
    COLOR("style.chart.backgroundColor", { def: "#FFFFFF" }),
    COLOR("style.chart.color", { def: "#1A1A1A" }),
    CHECKBOX("style.chart.layout.plots.show", { def: true }),
    RANGE("style.chart.layout.plots.radius", { def: 2, min: 0, max: 24 }),
    COLOR("style.chart.layout.outerPolygon.stroke", { def: "#CCCCCC" }),
    RANGE("style.chart.layout.outerPolygon.strokeWidth", { def: 1, min: 0, max: 12 }),
    RANGE("style.chart.layout.dataPolygon.strokeWidth", { def: 1, min: 0, max: 12 }),
    CHECKBOX("style.chart.layout.dataPolygon.transparent", { def: false }),
    RANGE("style.chart.layout.dataPolygon.opacity", { def: 20, min: 0, max: 100 }),
    CHECKBOX("style.chart.layout.dataPolygon.useGradient", { def: true }),
    CHECKBOX("style.chart.layout.grid.show", { def: true }),
    COLOR("style.chart.layout.grid.stroke", { def: "#e1e5e8" }),
    RANGE("style.chart.layout.grid.strokeWidth", { def: 0.5, min: 0, max: 12, step: 0.5 }),
    RANGE("style.chart.layout.grid.graduations", { def: 5, min: 2, max: 20 }),
    CHECKBOX("style.chart.layout.labels.dataLabels.show", { def: true }),
    RANGE("style.chart.layout.labels.dataLabels.fontSize", { def: 12, min: 8, max: 48 }),
    COLOR("style.chart.layout.labels.dataLabels.color", { def: "#1A1A1A" }),
    TEXT("style.chart.title.text", {
        def: "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis"
    }),
    COLOR("style.chart.title.color", { def: "#1A1A1A" }),
    RANGE("style.chart.title.fontSize", { def: 20, min: 8, max: 48 }),
    CHECKBOX("style.chart.title.bold", { def: true }),
    TEXT("style.chart.title.subtitle.text", {
        def: "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis"
    }),
    COLOR("style.chart.title.subtitle.color", { def: "#CCCCCC" }),
    RANGE("style.chart.title.subtitle.fontSize", { def: 16, min: 8, max: 48 }),
    CHECKBOX("style.chart.title.subtitle.bold", { def: false }),

    CHECKBOX("style.chart.tooltip.show", { def: true }),
    COLOR("style.chart.tooltip.backgroundColor", { def: "#FFFFFF" }),
    COLOR("style.chart.tooltip.color", { def: "#1A1A1A" }),
    RANGE("style.chart.tooltip.fontSize", { def: 14, min: 6, max: 48 }),
    CHECKBOX("style.chart.tooltip.showValue", { def: true }),
    CHECKBOX("style.chart.tooltip.showPercentage", { def: true }),
    RANGE("style.chart.tooltip.roundingValue", { def: 2, min: 0, max: 12 }),
    RANGE("style.chart.tooltip.roundingPercentage", { def: 2, min: 0, max: 12 }),
    CHECKBOX("style.chart.tooltip.animation.show", { def: true }),
    RANGE("style.chart.tooltip.animation.animationFrames", { def: 60, min: 0, max: 1000 }),
    RANGE("style.chart.tooltip.backgroundOpacity", { def: 100, min: 0, max: 100 }),
    SELECT("style.chart.tooltip.position", ["left", "center", "right"], { def: "center" }),
    NUMBER("style.chart.tooltip.offsetY", { def: 24, min: 0, max: 48 }),

    CHECKBOX("style.chart.legend.show", { def: true }),
    CHECKBOX("style.chart.legend.bold", { def: true }),
    COLOR("style.chart.legend.backgroundColor", { def: "#FFFFFF" }),
    COLOR("style.chart.legend.color", { def: "#1A1A1A" }),
    RANGE("style.chart.legend.fontSize", { def: 14, min: 8, max: 48 }),
    RANGE("style.chart.legend.roundingPercentage", { def: 2, min: 0, max: 12 }),
    SELECT("style.chart.legend.position", ["top", "bottom"], { def: "bottom" }),

    CHECKBOX("table.show", { def: false }),
    CHECKBOX("table.useDialog", { def: true }),

    RANGE("table.responsiveBreakpoint", { def: 400, min: 300, max: 800 }),
    COLOR("table.th.backgroundColor", { def: "#FFFFFF" }),
    COLOR("table.th.color", { def: "#1A1A1A" }),
    TEXT("table.th.outline", { def: "none" }),
    COLOR("table.td.backgroundColor", { def: "#FFFFFF" }),
    COLOR("table.td.color", { def: "#1A1A1A" }),
    TEXT("table.td.outline", { def: "none" }),
    RANGE("table.td.roundingValue", { def: 2, min: 0, max: 12 }),
    RANGE("table.td.roundingPercentage", { def: 2, min: 0, max: 12 }),

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
    theme: currentTheme.value
}));

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
                        // customFormat: ({ datapoint }) => {
                        //     let html = '';
                        //     console.log(datapoint);
                        //     return "test"
                        // }
                    }
                }
            }

        }
    } else {
        return {
            ...c,
            events: {
                datapointEnter: ({ datapoint, seriesIndex }) => {
                    console.log('enter event', { datapoint, seriesIndex});
                },
                datapointLeave: ({ datapoint, seriesIndex }) => {
                    console.log('leave event', { datapoint, seriesIndex});
                },
                datapointClick: ({ datapoint, seriesIndex }) => {
                    console.log('click event', { datapoint, seriesIndex});
                },
            },
            theme: currentTheme.value,
            customPalette: ['#6376DD', "#DD3322", "#66DDAA"],
        }
    }
});

const step = ref(0)

function selectLegend(legend) {
    console.log({legend})
}

onMounted(async () => {
    if (local.value) {
        const img = await local.value.getImage()
        console.log(img);

        // setTimeout(() => {
        //     local.value.hideSeries('Category 1')
        // }, 4000);
        // setTimeout(() => {
        //     local.value.showSeries('Category 1')
        //     local.value.hideSeries('Category 2')
        // }, 5000);
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

    <Box comp="VueUiRadar" :dataset="isPropsToggled ? alternateDataset : dataset" :config="config">
        <template #title>VueUiRadar</template>

        <template #responsive>
            <div style="width: 600px; height: 600px; resize: both; overflow: auto; background: white">
                <LocalVueUiRadar :key="`responsive_${step}`" :dataset="dataset" :config="{
                    ...config,
                    responsive: true
                }">

                    <!-- <template #chart-background>
                        <div style="height: 100%; width: 100%; background: radial-gradient(at top left, red, white)"/>
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
                </LocalVueUiRadar>
            </div>
        </template>

        <template #theme>
            <LocalVueUiRadar :dataset="dataset" :config="configTheme" />
        </template>

        <template #local>
            <LocalVueUiRadar :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`local_${step}`" @selectLegend="selectLegend" ref="local">
                <template #optionPdf>
                    PRINT PDF
                </template>
                <template #svg="{ svg }">
                    <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#42d39240" />
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
            </LocalVueUiRadar>
        </template>
        
        <template #VDUI-local>
            <LocalVueDataUi component="VueUiRadar" :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`VDUI-lodal_${step}`" @selectLegend="selectLegend" ref="vduiLocal">
                <template #svg="{ svg }">
                    <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#42d39240" />
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
            <VueUiRadar :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`build_${step}`" @selectLegend="selectLegend" ref="build">
                <template #svg="{ svg }">
                    <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#42d39240" />
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
            </VueUiRadar>
        </template>

        <template #build-treesh>
            <VueUiRadarTreeshaken :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`build_${step}`" @selectLegend="selectLegend" ref="build">
                <template #svg="{ svg }">
                    <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#42d39240" />
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
            </VueUiRadarTreeshaken>
        </template>
        
        <template #VDUI-build>
            <VueDataUi component="VueUiRadar" :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`VDUI-build_${step}`" @selectLegend="selectLegend" ref="vduiBuild">
                <template #svg="{ svg }">
                    <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#42d39240" />
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