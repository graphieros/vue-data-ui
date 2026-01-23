<script setup>
import { ref, computed, onMounted } from "vue";
import LocalVueUiQuadrant from '../src/components/vue-ui-quadrant.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import { useArena } from "../src/useArena";
import { VueUiQuadrant } from "vue-data-ui";
import { VueUiQuadrant as VueUiQuadrantTreeshaken } from "vue-data-ui/vue-ui-quadrant";
import ConfigKnobs from "./ConfigKnobs.vue";
import { useConfigurationControls } from "./createConfigModel";
import { useConfig } from "../src/useConfig"
import useThemeOptions from "./useThemeOptions";

const { local, build, vduiLocal, vduiBuild, toggleTable, toggleLabels } = useArena();
const { vue_ui_quadrant: DEFAULT_CONFIG } = useConfig();

const {
    CHECKBOX,
    NUMBER,
    RANGE,
    TEXT,
    COLOR,
    SELECT,
    createModel
} = useConfigurationControls(DEFAULT_CONFIG);

function makeDs(n,m) {
    const arr = [];
    for(let i = 0; i < n; i += 1) {
        arr.push({
            name: 'Serie with a name\n that is way too long',
            x: Math.random() > 0.5 ? Math.random()*m : -Math.random()*m,
            y: Math.random() > 0.5 ? Math.random()*m : -Math.random()*m,
        })
    }
    return arr
}

const dataset = ref(undefined);

onMounted(() => {
    setTimeout(() => {
        dataset.value = [
            {
                name: 'Serie 1',
                shape: 'hexagon',
                series: makeDs(10, 10)
            },
            {
                name: 'Serie 2',
                shape: 'circle',
                series: makeDs(10, 10)
            },
            {
                name: 'Serie 3',
                shape: 'square',
                series: makeDs(10, 10)
            },
        ]
    }, 2000)

    // setTimeout(() => {
    //     dataset.value = undefined;
    // }, 4000);

    // setTimeout(() => {
    //     dataset.value = [
    //         {
    //             name: 'Serie 3',
    //             shape: 'hexagon',
    //             series: makeDs(100, 10)
    //         }
    //     ]
    // }, 6000)
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

const alternateDataset = ref([
    {
        name: 'Serie 1',
        shape: 'square',
        series: [
            {
                name: "Star 1",
                x: 50,
                y: 50
            },
            {
                name: "Star 2",
                x: -10,
                y: -10
            },
            {
                name: "Star 3",
                x: -15,
                y: 20
            },
            {
                name: "Star 4",
                x: 15,
                y: -20
            },
        ]
    },
]);

const isPropsToggled = ref(false);
function toggleProps() {
    isPropsToggled.value = !isPropsToggled.value;
}

function alterDataset() {
    dataset.value[0].series.push({
        name: 'Added',
        x: 0,
        y: 0
    })
}

const model = createModel([
    CHECKBOX("debug", { def: true }),
    CHECKBOX("loading", { def: false }),
    CHECKBOX("responsive", { def: false }),
    CHECKBOX("style.chart.tooltip.show", { def: true }),
    CHECKBOX("userOptions.show", { def: true }),
    CHECKBOX("userOptions.buttons.pdf", { def: true }),
    CHECKBOX("userOptions.buttons.img", { def: true }),
    CHECKBOX("userOptions.buttons.csv", { def: true }),
    CHECKBOX("userOptions.buttons.labels", { def: true }),
    CHECKBOX("userOptions.buttons.table", { def: true }),
    CHECKBOX("userOptions.buttons.fullscreen", { def: true }),
    SELECT("userOptions.position", ["left", "right"], { def: "right" }),
    CHECKBOX("userOptions.showOnChartHover", { def: true }),
    CHECKBOX("userOptions.keepStateOnChartLeave", { def: true }),

    CHECKBOX("useCssAnimation", { def: true }),
    RANGE("zoomAnimationFrames", { def: 20, min: 0, max: 100 }),
    TEXT("style.fontFamily", { def: "inherit" }),
    NUMBER("style.chart.height", { def: 512, min: 100, max: 1000 }),
    NUMBER("style.chart.width", { def: 512, min: 100, max: 1000 }),
    COLOR("style.chart.backgroundColor", { def: "#FFFFFF" }),
    COLOR("style.chart.color", { def: "#1A1A1A" }),

    CHECKBOX("style.chart.layout.labels.quadrantLabels.show", { def: true }),
    TEXT("style.chart.layout.labels.quadrantLabels.tl.text", { def: "Top left label" }),
    COLOR("style.chart.layout.labels.quadrantLabels.tl.color", { def: "#FFAA00" }),
    RANGE("style.chart.layout.labels.quadrantLabels.tl.fontSize", { def: 16, min: 8, max: 42 }),
    CHECKBOX("style.chart.layout.labels.quadrantLabels.tl.bold", { def: true }),

    TEXT("style.chart.layout.labels.quadrantLabels.tr.text", { def: "Top right label" }),
    COLOR("style.chart.layout.labels.quadrantLabels.tr.color", { def: "#00BB63" }),
    RANGE("style.chart.layout.labels.quadrantLabels.tr.fontSize", { def: 16, min: 8, max: 42 }),
    CHECKBOX("style.chart.layout.labels.quadrantLabels.tr.bold", { def: true }),

    TEXT("style.chart.layout.labels.quadrantLabels.br.text", { def: "Bottom right label" }),
    COLOR("style.chart.layout.labels.quadrantLabels.br.color", { def: "#0063BB" }),
    RANGE("style.chart.layout.labels.quadrantLabels.br.fontSize", { def: 16, min: 8, max: 42 }),
    CHECKBOX("style.chart.layout.labels.quadrantLabels.br.bold", { def: true }),

    TEXT("style.chart.layout.labels.quadrantLabels.bl.text", { def: "Bottom right label" }),
    COLOR("style.chart.layout.labels.quadrantLabels.bl.color", { def: "#BB0063" }),
    RANGE("style.chart.layout.labels.quadrantLabels.bl.fontSize", { def: 16, min: 8, max: 42 }),
    CHECKBOX("style.chart.layout.labels.quadrantLabels.bl.bold", { def: true }),

    CHECKBOX("style.chart.layout.labels.plotLabels.showAsTag", { def: false }),
    CHECKBOX("style.chart.layout.labels.plotLabels.show", { def: true }),
    COLOR("style.chart.layout.labels.plotLabels.color", { def: "#1A1A1A" }),
    NUMBER("style.chart.layout.labels.plotLabels.offsetY", { def: 12, min: -100, max: 100 }),
    RANGE("style.chart.layout.labels.plotLabels.fontSize", { def: 10, min: 8, max: 48 }),

    CHECKBOX("style.chart.layout.labels.axisLabels.show", { def: true }),
    RANGE("style.chart.layout.labels.axisLabels.fontSize", { def: 14, min: 8, max: 48 }),
    COLOR("style.chart.layout.labels.axisLabels.color.positive", { def: "#0000FF" }),
    COLOR("style.chart.layout.labels.axisLabels.color.negative", { def: "#FF0000" }),

    COLOR("style.chart.layout.grid.stroke", { def: "#e1e5e8" }),
    RANGE("style.chart.layout.grid.strokeWidth", { def: 1.5, min: 0, max: 12, step: 0.5 }),
    CHECKBOX("style.chart.layout.grid.showArrows", { def: true }),

    COLOR("style.chart.layout.grid.graduations.stroke", { def: "#e1e5e8" }),
    RANGE("style.chart.layout.grid.graduations.strokeWidth", { def: 0.5, min: 0, max: 64, step: 0.5 }),
    CHECKBOX("style.chart.layout.grid.graduations.show", { def: true }),
    NUMBER("style.chart.layout.grid.graduations.steps", { def: 5, min: 2, max: 20 }),
    CHECKBOX("style.chart.layout.grid.graduations.fill", { def: true }),
    COLOR("style.chart.layout.grid.graduations.color", { def: "#40AD38" }),
    RANGE("style.chart.layout.grid.graduations.roundingForce", { def: 10, min: 0, max: 300 }),

    NUMBER("style.chart.layout.grid.xAxis.min", { def: -100, min: -1000, max: 1000 }),
    NUMBER("style.chart.layout.grid.xAxis.max", { def: 100, min: -1000, max: 1000 }),
    CHECKBOX("style.chart.layout.grid.xAxis.auto", { def: true }),
    CHECKBOX("style.chart.layout.grid.xAxis.name", { def: "X axis lorem ipsum dolor sic amet" }),

    NUMBER("style.chart.layout.grid.yAxis.min", { def: -100, min: -1000, max: 1000 }),
    NUMBER("style.chart.layout.grid.yAxis.max", { def: 100, min: -1000, max: 1000 }),
    CHECKBOX("style.chart.layout.grid.yAxis.auto", { def: true }),
    CHECKBOX("style.chart.layout.grid.yAxis.name", { def: "Y axis lorem ipsum dolor sic amet" }),

    RANGE("style.chart.layout.plots.radius", { def: 6, min: 0, max: 48 }),
    CHECKBOX("style.chart.layout.plots.outline", { def: true }),
    COLOR("style.chart.layout.plots.outlineColor", { def: "#FFFFFF" }),
    RANGE("style.chart.layout.plots.outlineWidth", { def: 1, min: 0, max: 12, step: 0.5 }),

    CHECKBOX("style.chart.layout.areas.show", { def: true }),
    RANGE("style.chart.layout.areas.opacity", { def: 40, min: 0, max: 100 }),
    CHECKBOX("style.chart.layout.areas.useGradient", { def: true }),

    TEXT("style.chart.title.text", { def: "Lorem ipsum dolor sic amet" }),
    COLOR("style.chart.title.color", { def: "#1A1A1A" }),
    RANGE("style.chart.title.fontSize", { def: 20, min: 8, max: 48 }),
    CHECKBOX("style.chart.title.bold", { def: true }),

    TEXT("style.chart.title.subtitle.text", { def: "Lorem ipsum dolor sic amet" }),
    COLOR("style.chart.title.subtitle.color", { def: "#CCCCCC" }),
    RANGE("style.chart.title.subtitle.fontSize", { def: 16, min: 8, max: 48 }),
    CHECKBOX("style.chart.title.subtitle.bold", { def: false }),

    CHECKBOX("style.chart.legend.show", { def: true }),
    CHECKBOX("style.chart.legend.bold", { def: true }),
    COLOR("style.chart.legend.backgroundColor", { def: "#FFFFFF" }),
    COLOR("style.chart.legend.color", { def: "#1A1A1A" }),
    RANGE("style.chart.legend.fontSize", { def: 14, min: 8, max: 48 }),
    SELECT("style.chart.legend.position", ["top", "bottom"], { def: "bottom" }),
    CHECKBOX('style.chart.legend.selectAllToggle.show', { def: true }),

    CHECKBOX("table.show", { def: false }),
    CHECKBOX("table.useDialog", { def: true }),

    NUMBER("table.responsiveBreakdpoint", { def: 400, min: 300, max: 800 }),
    COLOR("table.th.backgroundColor", { def: "#FFFFFF" }),
    COLOR("table.th.color", { def: "#1A1A1A" }),
    TEXT("table.th.outline", { def: "none" }),

    COLOR("table.td.backgroundColor", { def: "#FFFFFF" }),
    COLOR("table.td.color", { def: "#1A1A1A" }),
    TEXT("table.td.outline", { def: "none" }),
    RANGE("table.td.roundingValue", { def: 2, min: 0, max: 12 }),

    COLOR("style.chart.tooltip.backgroundColor", { def: "#FFFFFF" }),
    RANGE("style.chart.tooltip.backgroundOpacity", { def: 100, min: 0, max: 100 }),
    SELECT("style.chart.tooltip.position", ["left", "center", "right"], { def: "center" }),
    NUMBER("style.chart.tooltip.offsetY", { def: 24, min: 0, max: 48 }),

    NUMBER("userOptions.print.scale", { def: 2, min: 1, max: 5 }),
    CHECKBOX("userOptions.print.allowTaint", { def: true }),
    CHECKBOX("userOptions.print.useCORS", { def: true }),
    COLOR("userOptions.print.backgroundColor", { def: "#FFFFFF" })
]);

const testCustomTooltip = ref(false);

const { themeOptions, currentTheme } = useThemeOptions();

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
                            plotLabels: {
                                ...c.style.chart.layout.labels.plotLabels,
                                x: {
                                    formatter: ({value}) => {
                                        return `fX | ${value}`
                                    }
                                },
                                y: {
                                    formatter: ({value}) => {
                                        return `fY | ${value}`
                                    }
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

const step = ref(0)

function selectLegend(legend) {
    console.log({ legend })
}

function selectPlot(plot) {
    console.log({ plot })
}

function selectSide(side) {
    console.log({ side })
}

onMounted(async () => {
    if (local.value) {
        const img = await local.value.getImage()
        console.log(img);

        // setTimeout(() => {
        //     local.value.hideSeries('Serie 3')
        // }, 4000)
        // setTimeout(() => {
        //     local.value.showSeries('Serie 3')
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
        <input type="checkbox" v-model="testCustomTooltip" id="custom-tooltip" />
        <label for="custom-tooltip" style="color:#CCCCCC">Test custom tooltip</label>
    </div>

    <Box comp="VueUiQuadrant" :dataset="dataset" :config="config">
        <template #title>VueUiQuadrant</template>

        <template #responsive>
            <div style="width: 600px; height: 600px; resize: both; overflow: auto; background: white">
                <LocalVueUiQuadrant :key="`responsive_${step}`" :dataset="dataset" :config="{
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
                </LocalVueUiQuadrant>
            </div>
        </template>

        <template #theme>
            <LocalVueUiQuadrant :dataset="dataset" :config="configTheme" />
        </template>
        
        <template #local>
            <LocalVueUiQuadrant :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`local_${step}`" @selectLegend="selectLegend" @selectPlot="selectPlot" @selectSide="selectSide" ref="local">
                <template #optionPdf>
                    PRINT PDF
                </template>
                <!-- <template #svg="{ svg }">
                    <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#42d392" />
                    <text :x="svg.width / 2" :y="svg.height / 2" text-anchor="middle">#SVG</text>
                </template> -->
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
            </LocalVueUiQuadrant>
        </template>

        <template #VDUI-local>
            <LocalVueDataUi component="VueUiQuadrant" :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`VDUI-lodal_${step}`" @selectLegend="selectLegend" @selectPlot="selectPlot" @selectSide="selectSide" ref="vduiLocal">
                <!-- <template #svg="{ svg }">
                    <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#42d392" />
                    <text :x="svg.width / 2" :y="svg.height / 2" text-anchor="middle">#SVG</text>
                </template> -->
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
            <VueUiQuadrant :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`build_${step}`" @selectLegend="selectLegend" @selectPlot="selectPlot" @selectSide="selectSide" ref="build">
                <!-- <template #svg="{ svg }">
                    <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#42d392" />
                    <text :x="svg.width / 2" :y="svg.height / 2" text-anchor="middle">#SVG</text>
                </template> -->
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
            </VueUiQuadrant>
        </template>

        <template #build-treesh>
            <VueUiQuadrantTreeshaken :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`build_${step}`" @selectLegend="selectLegend" @selectPlot="selectPlot" @selectSide="selectSide" ref="build">
                <!-- <template #svg="{ svg }">
                    <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#42d392" />
                    <text :x="svg.width / 2" :y="svg.height / 2" text-anchor="middle">#SVG</text>
                </template> -->
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
            </VueUiQuadrantTreeshaken>
        </template>

        <template #VDUI-build>
            <VueDataUi component="VueUiQuadrant" :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`VDUI-build_${step}`" @selectLegend="selectLegend" @selectPlot="selectPlot" @selectSide="selectSide" ref="vduiBuild">
                <!-- <template #svg="{ svg }">
                    <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#42d392" />
                    <text :x="svg.width / 2" :y="svg.height / 2" text-anchor="middle">#SVG</text>
                </template> -->
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