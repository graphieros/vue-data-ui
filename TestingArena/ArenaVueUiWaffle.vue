<script setup>
import { ref, computed, onMounted } from "vue";
import LocalVueUiWaffle from '../src/components/vue-ui-waffle.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import { useArena } from "../src/useArena";
import { VueUiWaffle } from "vue-data-ui";
import { VueUiWaffle as VueUiWaffleTreeshaken } from "vue-data-ui/vue-ui-waffle";
import ConfigKnobs from "./ConfigKnobs.vue";
import { useConfigurationControls } from "./createConfigModel";
import { useConfig } from "../src/useConfig"
import useThemeOptions from "./useThemeOptions";

const { local, build, vduiLocal, vduiBuild, toggleTable } = useArena();
const { vue_ui_waffle: DEFAULT_CONFIG } = useConfig();

const {
    CHECKBOX,
    NUMBER,
    RANGE,
    TEXT,
    COLOR,
    SELECT,
    createModel
} = useConfigurationControls(DEFAULT_CONFIG);

const dataset = ref([])
onMounted(() => {
    dataset.value = undefined;
    setTimeout(() => {
        dataset.value = [
            {
                name: 'Series A',
                values: [3]
            },
            {
                name: 'Series B',
                values: [2]
            },
            {
                name: 'Series C',
                values: [1]
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
    table: {
        th: {
            backgroundColor: '#00FF0020'
        }
    },
    style: {
        chart: {
            backgroundColor: '#FF000020',
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

    CHECKBOX("useBlurOnHover", { def: true }),
    CHECKBOX("useCustomCells", { def: false }),
    CHECKBOX("useAnimation", { def: true }),

    TEXT("style.fontFamily", { def: "inherit" }),
    COLOR("style.chart.backgroundColor", { def: "#FFFFFF20" }),
    COLOR("style.chart.color", { def: "#1A1A1A" }),

    CHECKBOX('style.chart.layout.labels.dataLabels.showValueFirst', { def: false }),
    CHECKBOX('style.chart.layout.labels.dataLabels.usePercentageParens', { def: false }),
    CHECKBOX('style.chart.layout.labels.dataLabels.useValueParens', { def: true }),

    TEXT("style.chart.layout.labels.dataLabels.prefix", { def: "$" }),
    TEXT("style.chart.layout.labels.dataLabels.suffix", { def: "€" }),

    CHECKBOX("style.chart.layout.labels.captions.show", { def: true }),
    CHECKBOX("style.chart.layout.labels.captions.showSerieName", { def: true }),
    CHECKBOX("style.chart.layout.labels.captions.serieNameAbbreviation", { def: true }),
    NUMBER("style.chart.layout.labels.captions.serieNameMaxAbbreviationSize", { def: 3, min: 0, max: 12 }),
    RANGE("style.chart.layout.labels.captions.fontSize", { def: 12, min: 8, max: 48 }),
    CHECKBOX("style.chart.layout.labels.captions.showValue", { def: true }),
    CHECKBOX("style.chart.layout.labels.captions.showPercentage", { def: true }),
    RANGE("style.chart.layout.labels.captions.roundingValue", { def: 2, min: 0, max: 12 }),
    RANGE("style.chart.layout.labels.captions.roundingPercentage", { def: 2, min: 0, max: 12 }),
    NUMBER("style.chart.layout.labels.captions.offsetX", { def: 0, min: -100, max: 100 }),
    NUMBER("style.chart.layout.labels.captions.offsetY", { def: 0, min: -100, max: 100 }),

    RANGE("style.chart.layout.grid.size", { def: 10, min: 2, max: 20 }),
    NUMBER("style.chart.layout.grid.spaceBetween", { def: 0, min: 0, max: 20 }),
    CHECKBOX("style.chart.layout.grid.vertical", { def: false }),

    CHECKBOX("style.chart.layout.rect.rounded", { def: true }),
    NUMBER("style.chart.layout.rect.rounding", { def: 2, min: 0, max: 100 }),
    TEXT("style.chart.layout.rect.stroke", { def: "#1A1A1A" }),
    NUMBER("style.chart.layout.rect.strokeWidth", { def: 1, min: 0, max: 12 }),
    CHECKBOX("style.chart.layout.rect.useGradient", { def: true }),
    RANGE("style.chart.layout.rect.gradientIntensity", { def: 40, min: 0, max: 100 }),

    TEXT("style.chart.title.text", { def: "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis" }),
    COLOR("style.chart.title.color", { def: "#1A1A1A" }),
    NUMBER("style.chart.title.fontSize", { def: 20, min: 8, max: 48 }),
    CHECKBOX("style.chart.title.bold", { def: true }),

    TEXT("style.chart.title.subtitle.text", { def: "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis" }),
    COLOR("style.chart.title.subtitle.color", { def: "#CCCCCC" }),
    RANGE("style.chart.title.subtitle.fontSize", { def: 16, min: 8, max: 48 }),
    CHECKBOX("style.chart.title.subtitle.bold", { def: false }),

    CHECKBOX("style.chart.tooltip.show", { def: true }),
    COLOR("style.chart.tooltip.backgroundColor", { def: "#FFFFFF" }),
    COLOR("style.chart.tooltip.color", { def: "#1A1A1A" }),
    RANGE("style.chart.tooltip.fontSize", { def: 12, min: 8, max: 48 }),
    CHECKBOX("style.chart.tooltip.showValue", { def: true }),
    CHECKBOX("style.chart.tooltip.showPercentage", { def: true }),
    RANGE("style.chart.tooltip.roundingValue", { def: 0, min: 0, max: 12 }),
    RANGE("style.chart.tooltip.roundingPercentage", { def: 0, min: 0, max: 12 }),
    RANGE("style.chart.tooltip.backgroundOpacity", { def: 20, min: 0, max: 100 }),
    SELECT("style.chart.tooltip.position", ["left", "center", "right"], { def: "center" }),
    NUMBER("style.chart.tooltip.offsetY", { def: 24, min: 0, max: 48 }),

    CHECKBOX('style.chart.tooltip.showValueFirst', { def: false }),
    CHECKBOX('style.chart.tooltip.usePercentageParens', { def: false }),
    CHECKBOX('style.chart.tooltip.useValueParens', { def: true }),

    CHECKBOX("table.show", { def: false }),
    CHECKBOX("table.useDialog", { def: true }),
    NUMBER("table.responsiveBreakpoint", { def: 400, min: 300, max: 800 }),

    TEXT("table.columnNames.series", { def: "Series" }),
    TEXT("table.columnNames.value", { def: "Value" }),
    TEXT("table.columnNames.percentage", { def: "Percentage" }),

    COLOR("table.th.backgroundColor", { def: "#FFFFFF" }),
    COLOR("table.th.color", { def: "#1A1A1A" }),
    TEXT("table.th.outline", { def: "none" }),

    COLOR("table.td.backgroundColor", { def: "#FFFFFF" }),
    COLOR("table.td.color", { def: "#1A1A1A" }),
    TEXT("table.td.outline", { def: "none" }),
    RANGE("table.td.roundingValue", { def: 0, min: 0, max: 12 }),
    RANGE("table.td.roundingPercentage", { def: 0, min: 0, max: 12 }),

    NUMBER("userOptions.print.scale", { def: 2, min: 1, max: 5 }),
    CHECKBOX("userOptions.print.allowTaint", { def: true }),
    CHECKBOX("userOptions.print.useCORS", { def: true }),
    COLOR("userOptions.print.backgroundColor", { def: "#FFFFFF" }),

    CHECKBOX("style.chart.legend.showValue", { def: true }),
    CHECKBOX("style.chart.legend.showPercentage", { def: true }),
    SELECT("style.chart.legend.position", ["top", "bottom"], { def: "bottom" }),

    CHECKBOX('style.chart.legend.showValueFirst', { def: false }),
    CHECKBOX('style.chart.legend.usePercentageParens', { def: false }),
    CHECKBOX('style.chart.legend.useValueParens', { def: true }),
]);

const testCustomTooltip = ref(false);

const { themeOptions, currentTheme } = useThemeOptions();

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
                    console.log('enter event', { datapoint, seriesIndex});
                },
                datapointLeave: ({ datapoint, seriesIndex }) => {
                    console.log('leave event', { datapoint, seriesIndex});
                },
                datapointClick: ({ datapoint, seriesIndex }) => {
                    console.log('click event', { datapoint, seriesIndex});
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
                                formatter: ({value, config }) => {
                                    // console.log(config)
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

const step = ref(0)

function selectLegend(legend) {
    console.log({legend})
}

onMounted(async() => {
    if (local.value) {
        const img = await local.value.getImage()
        console.log(img)

        // setTimeout(() => {
        //     local.value.hideSeries('Series A')
        // }, 4000)

        // setTimeout(() => {
        //     local.value.showSeries('Series A')
        //     local.value.hideSeries('Series B')
        // }, 5000)
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

    <Box comp="VueUiWaffle" :dataset="isPropsToggled ? alternateDataset : dataset" :config="config">
        <template #title>VueUiWaffle</template>

        <template #responsive>
            <div style="width: 600px; height: 600px; resize: both; overflow: auto; background: white">
                <LocalVueUiWaffle :key="`responsive_${step}`" :dataset="dataset" :config="{
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
                    <!-- <template #cell="{ cell, isSelected }">
                                <div :style="`opacity:${isSelected ? 1 : 0.3}`">
                                    <VueUiIcon
                                        v-if="cell.name === 'Lorem Ipsum'"
                                        name="lambda"
                                        size="40"
                                        :stroke="cell.color"
                                    />
                                    <VueUiIcon
                                        v-if="cell.name === 'Dolor Amet'"
                                        name="func"
                                        size="40"
                                        :stroke="cell.color"
                                    />
                                    <VueUiIcon
                                        v-if="cell.name === 'Dignissimos Ducimus'"
                                        name="mu"
                                        size="40"
                                        :stroke="cell.color"
                                    />
                                </div>
                            </template>      -->
                </LocalVueUiWaffle>
            </div>
        </template>

        <template #theme>
            <LocalVueUiWaffle :dataset="dataset" :config="configTheme" />
        </template>

        <template #local>
            <LocalVueUiWaffle :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`local_${step}`" @selectLegend="selectLegend" ref="local">
                <template #pattern="{ seriesIndex, patternId }">
                    <VueUiPattern v-if="seriesIndex === 0" :id="patternId" name="squares" stroke="#FFFFFF50" :scale="0.64"/>
                    <VueUiPattern v-if="seriesIndex === 1" :id="patternId" name="squares" stroke="#0000FF40" :scale="0.64"/>
                    <VueUiPattern v-if="seriesIndex === 2" :id="patternId" name="squares" stroke="#FF000060" :scale="0.64"/>
                </template>
                <template #optionPdf>
                    PRINT PDF
                </template>
                <!-- <template #cell="{ cell, isSelected }">
                    <div :style="`opacity:${isSelected ? 1 : 0.3}`">
                        <VueUiIcon
                            v-if="cell.name === 'Lorem Ipsum'"
                            name="lambda"
                            size="40"
                            :stroke="cell.color"
                        />
                        <VueUiIcon
                            v-if="cell.name === 'Dolor Amet'"
                            name="func"
                            size="40"
                            :stroke="cell.color"
                        />
                        <VueUiIcon
                            v-if="cell.name === 'Dignissimos Ducimus'"
                            name="mu"
                            size="40"
                            :stroke="cell.color"
                        />
                    </div>
                </template> -->
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
            </LocalVueUiWaffle>
        </template>

        <template #VDUI-local>
            <LocalVueDataUi component="VueUiWaffle" :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`VDUI-lodal_${step}`" @selectLegend="selectLegend" ref="vduiLocal">
                <template #pattern="{ seriesIndex, patternId }">
                    <VueUiPattern v-if="seriesIndex === 0" :id="patternId" name="squares" stroke="#FFFFFF50" :scale="0.64"/>
                    <VueUiPattern v-if="seriesIndex === 1" :id="patternId" name="squares" stroke="#0000FF40" :scale="0.64"/>
                    <VueUiPattern v-if="seriesIndex === 2" :id="patternId" name="squares" stroke="#FF000060" :scale="0.64"/>
                </template>
                <!-- <template #cell="{ cell, isSelected }">
                    <div :style="`opacity:${isSelected ? 1 : 0.3}`">
                        <VueUiIcon
                            v-if="cell.name === 'Lorem Ipsum'"
                            name="lambda"
                            :size="40"
                            :stroke="cell.color"
                        />
                        <VueUiIcon
                            v-if="cell.name === 'Dolor Amet'"
                            name="func"
                            :size="40"
                            :stroke="cell.color"
                        />
                        <VueUiIcon
                            v-if="cell.name === 'Dignissimos Ducimus'"
                            name="mu"
                            :size="40"
                            :stroke="cell.color"
                        />
                    </div>
                </template> -->
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
            <VueUiWaffle :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`build_${step}`" @selectLegend="selectLegend" ref="build">
                <template #pattern="{ seriesIndex, patternId }">
                    <VueUiPattern v-if="seriesIndex === 0" :id="patternId" name="squares" stroke="#FFFFFF50" :scale="0.64"/>
                    <VueUiPattern v-if="seriesIndex === 1" :id="patternId" name="squares" stroke="#0000FF40" :scale="0.64"/>
                    <VueUiPattern v-if="seriesIndex === 2" :id="patternId" name="squares" stroke="#FF000060" :scale="0.64"/>
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
            </VueUiWaffle>
        </template>

        <template #build-treesh>
            <VueUiWaffleTreeshaken :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`build_${step}`" @selectLegend="selectLegend" ref="build">
<template #pattern="{ seriesIndex, patternId }">
                    <VueUiPattern v-if="seriesIndex === 0" :id="patternId" name="squares" stroke="#FFFFFF50" :scale="0.64"/>
                    <VueUiPattern v-if="seriesIndex === 1" :id="patternId" name="squares" stroke="#0000FF40" :scale="0.64"/>
                    <VueUiPattern v-if="seriesIndex === 2" :id="patternId" name="squares" stroke="#FF000060" :scale="0.64"/>
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
            </VueUiWaffleTreeshaken>
        </template>

        <template #VDUI-build>
            <VueDataUi component="VueUiWaffle" :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`VDUI-build_${step}`" @selectLegend="selectLegend" ref="vduiBuild">
                <template #pattern="{ seriesIndex, patternId }">
                    <VueUiPattern v-if="seriesIndex === 0" :id="patternId" name="squares" stroke="#FFFFFF50" :scale="0.64"/>
                    <VueUiPattern v-if="seriesIndex === 1" :id="patternId" name="squares" stroke="#0000FF40" :scale="0.64"/>
                    <VueUiPattern v-if="seriesIndex === 2" :id="patternId" name="squares" stroke="#FF000060" :scale="0.64"/>
                </template>
                <!-- <template #cell="{ cell, isSelected }">
                    <div :style="`opacity:${isSelected ? 1 : 0.3}`">
                        <VueUiIcon
                            v-if="cell.name === 'Lorem Ipsum'"
                            name="lambda"
                            size="40"
                            :stroke="cell.color"
                        />
                        <VueUiIcon
                            v-if="cell.name === 'Dolor Amet'"
                            name="func"
                            size="40"
                            :stroke="cell.color"
                        />
                        <VueUiIcon
                            v-if="cell.name === 'Dignissimos Ducimus'"
                            name="mu"
                            size="40"
                            :stroke="cell.color"
                        />
                    </div>
                </template> -->
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

        <template #knobs="{ summaryOpen }">
            <ConfigKnobs :model="model" @change="step += 1" :open="summaryOpen"/>
        </template>
    </Box>
</template>