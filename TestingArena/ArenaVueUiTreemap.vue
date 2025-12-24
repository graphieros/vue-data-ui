<script setup>
import { ref, computed, onMounted } from "vue";
import LocalVueUiTreemap from '../src/components/vue-ui-treemap.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import { useArena } from "../src/useArena";
import { VueUiTreemap } from "vue-data-ui";
import { VueUiTreemap as VueUiTreemapTreeshaken } from "vue-data-ui/vue-ui-treemap";
import ConfigKnobs from "./ConfigKnobs.vue";
import { useConfigurationControls } from "./createConfigModel";
import { useConfig } from "../src/useConfig"

const { local, build, vduiLocal, vduiBuild, toggleTable } = useArena();
const { vue_ui_treemap: DEFAULT_CONFIG } = useConfig();

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
        name: 'P1',
        value: 87.5,
        children: [
            {
                name: 'P1C1',
                value: 50
            },
            {
                name: 'P1C2',
                value: 25
            },
            {
                name: 'P1C3',
                value: 12.5,
                children: [
                    {
                        name: 'P1C3G1',
                        value: 6
                    },
                    {
                        name: 'P1C3G2',
                        value: 6.5,
                        children: [
                            {
                                name: 'P1C3G2L1',
                                value: 3
                            },
                            {
                                name: 'P1C3G2L2',
                                value: 3.5
                            },
                        ]
                    },
                ]
            }
        ]
    },
    {
        name: 'P2',
        value: 200,
        children: [
            {
                name: 'P2C1',
                value: 100
            },
            {
                name: 'P2C2',
                value: 50
            },
            {
                name: 'P2C3',
                value: 25
            }
        ]
    },
    {
        name: 'P3',
        value: 100,
        children: [
            {
                name: 'P3C1',
                value: 50
            },
            {
                name: 'P3C2',
                value: 25
            },
            {
                name: 'P3C3',
                value: 12.5
            }
        ]
    },
    {
        name: 'P4',
        value: 20,
        children: [
            {
                name: 'P4C1',
                value: 10
            },
            {
                name: 'P4C2',
                value: 5
            },
            {
                name: 'P4C3',
                value: 2.5
            }
        ]
    },
    {
        name: 'P5',
        value: 10,
        children: [
            {
                name: 'P5C1',
                value: 5
            },
            {
                name: 'P5C2',
                value: 2.5
            },
            {
                name: 'P5C3',
                value: 1.125
            }
        ]
    },
]
    }, 1000)
})

const isPropsToggled = ref(false);

function toggleProps() {
    isPropsToggled.value = !isPropsToggled.value;
}

function alterDataset() {
    dataset.value[0].children[0].value = 500;
    dataset.value[0].value = 550;
}

const alternateConfig = ref({
    style: {
        chart: {
            backgroundColor: '#FF000020',
            title: {
                text: 'Alternate'
            }
        }
    }
})

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

    TEXT("style.fontFamily", { def: "inherit" }),
    COLOR("style.chart.backgroundColor", { def: "#FFFFFF" }),
    COLOR("style.chart.color", { def: "#1A1A1A" }),
    NUMBER("style.chart.height", { def: 500, min: 100, max: 1000 }),
    NUMBER("style.chart.width", { def: 800, min: 100, max: 1500 }),

    NUMBER("style.chart.padding.top", { def: 0, min: 0, max: 100 }),
    NUMBER("style.chart.padding.right", { def: 0, min: 0, max: 100 }),
    NUMBER("style.chart.padding.bottom", { def: 0, min: 0, max: 100 }),
    NUMBER("style.chart.padding.left", { def: 0, min: 0, max: 100 }),

    CHECKBOX("style.chart.layout.sorted", { def: true }),

    COLOR("style.chart.layout.rects.stroke", { def: "#FFFFFF" }),
    NUMBER("style.chart.layout.rects.strokeWidth", { def: 1, min: 0, max: 12 }),
    NUMBER("style.chart.layout.rects.borderRadius", { def: 12, min: 0, max: 24 }),
    NUMBER("style.chart.layout.rects.colorRatio", { def: 0.3, min: 0, max: 1, step: 0.01 }),

    CHECKBOX("style.chart.layout.rects.gradient.show", { def: true }),
    RANGE("style.chart.layout.rects.gradient.intensity", { def: 30, min: 0, max: 100 }),

    COLOR("style.chart.layout.rects.selected.stroke", { def: "#FFFFFF" }),
    NUMBER("style.chart.layout.rects.selected.strokeWidth", { def: 1, min: 0, max: 12 }),
    RANGE("style.chart.layout.rects.selected.unselectedOpacity", { def: 0.6, min: 0, max: 1, step: 0.01 }),

    COLOR("style.chart.layout.rects.group.stroke", { def: "#CCCCCC" }),
    NUMBER("style.chart.layout.rects.group.strokeWidth", { def: 1, min: 0, max: 12 }),
    CHECKBOX("style.chart.layout.rects.group.useSeriesBackgroundColor", { def: true }),
    NUMBER("style.chart.layout.rects.group.backgroundLighterRatio", { def: 0.4, min: 0, max: 1, step: 0.01 }),
    CHECKBOX("style.chart.layout.rects.group.label.adaptColorToBackground", { def: true }),
    COLOR("style.chart.layout.rects.group.label.color", { def: "#FF0000" }),

    CHECKBOX("style.chart.layout.labels.showDefaultLabels", { def: true }),
    RANGE("style.chart.layout.labels.fontSize", { def: 14, min: 8, max: 48, step: 1 }),
    RANGE("style.chart.layout.labels.minFontSize", { def: 10, min: 6, max: 48, step: 1 }),
    NUMBER("style.chart.layout.labels.hideUnderProportion", { def: 0.03, min: 0, max: 1, step: 0.01 }),
    TEXT("style.chart.layout.labels.prefix", { def: "Value: " }),
    TEXT("style.chart.layout.labels.suffix", { def: "€" }),
    NUMBER("style.chart.layout.labels.rounding", { def: 1, min: 0, max: 12 }),

    CHECKBOX("style.chart.layout.labels.name.show", { def: true }),
    CHECKBOX("style.chart.layout.labels.name.bold", { def: true }),
    CHECKBOX("style.chart.layout.labels.value.show", { def: true }),
    CHECKBOX("style.chart.layout.labels.value.bold", { def: true }),

    COLOR("style.chart.legend.backgroundColor", { def: "#FFFFFF" }),
    COLOR("style.chart.legend.color", { def: "#1A1A1A" }),
    CHECKBOX("style.chart.legend.show", { def: true }),
    NUMBER("style.chart.legend.fontSize", { def: 14, min: 8, max: 48 }),
    CHECKBOX("style.chart.legend.bold", { def: false }),
    NUMBER("style.chart.legend.roundingValue", { def: 1, min: 0, max: 12 }),
    NUMBER("style.chart.legend.roundingPercentage", { def: 1, min: 0, max: 12 }),
    CHECKBOX("style.chart.legend.showValue", { def: true }),
    CHECKBOX("style.chart.legend.showPercentage", { def: false }),
    SELECT("style.chart.legend.position", ["top", "bottom"], { def: "bottom" }),

    TEXT("style.chart.title.text", { def: "Lorem ipsum dolor sic amet" }),
    COLOR("style.chart.title.color", { def: "#1A1A1A" }),
    NUMBER("style.chart.title.fontSize", { def: 20, min: 8, max: 48 }),
    CHECKBOX("style.chart.title.bold", { def: true }),

    TEXT("style.chart.title.subtitle.text", { def: "Lorem ipsum dolor sic amet titulum subtitulum" }),
    COLOR("style.chart.title.subtitle.color", { def: "#CCCCCC" }),
    NUMBER("style.chart.title.subtitle.fontSize", { def: 16, min: 8, max: 48 }),
    CHECKBOX("style.chart.title.subtitle.bold", { def: false }),

    CHECKBOX("style.chart.tooltip.show", { def: true }),
    COLOR("style.chart.tooltip.color", { def: "#1A1A1A" }),
    COLOR("style.chart.tooltip.backgroundColor", { def: "#FFFFFF" }),
    NUMBER("style.chart.tooltip.fontSize", { def: 14, min: 8, max: 48 }),
    NUMBER("style.chart.tooltip.roundingValue", { def: 1, min: 0, max: 12 }),
    RANGE("style.chart.tooltip.backgroundOpacity", { def: 20, min: 0, max: 100 }),
    SELECT("style.chart.tooltip.position", ["left", "center", "right"], { def: "center" }),
    NUMBER("style.chart.tooltip.offsetY", { def: 24, min: 0, max: 48 }),

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
    NUMBER("table.td.roundingValue", { def: 2, min: 0, max: 12 }),
    NUMBER("table.td.roundingPercentage", { def: 2, min: 0, max: 12 }),

    NUMBER("userOptions.print.scale", { def: 2, min: 1, max: 5 }),
    CHECKBOX("userOptions.print.allowTaint", { def: true }),
    CHECKBOX("userOptions.print.useCORS", { def: true }),
    COLOR("userOptions.print.backgroundColor", { def: "#FFFFFF" })
]);


const testCustomTooltip = ref(false);

const themeOptions = ref([
    "",
    "dark",
    "default",
    "zen",
    "concrete",
    "hack",
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
                    console.log('enter event', { datapoint, seriesIndex })
                },
                datapointLeave: ({ datapoint, seriesIndex }) => {
                    console.log('leave event', { datapoint, seriesIndex })
                },
                datapointClick: ({ datapoint, seriesIndex }) => {
                    console.log('click event', { datapoint, seriesIndex })
                },
            },
            theme: currentTheme.value,
            style: {
                ...c.style,
                chart: {
                    ...c.style.chart,
                    layout: {
                        ...c.style.chart.layout,
                        labels: {
                            ...c.style.chart.layout.labels,
                            formatter: ({value, config }) => {
                                return `f - ${value}`
                            }
                        }
                    },
                }
            }
            // customPalette: ['#6376DD', "#DD3322", "#66DDAA"],
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

onMounted(async() => {
    if (local.value) {
        const img = await local.value.getImage()
        console.log(img);

        // setTimeout(() => {
        //     local.value.hideSeries('S2')
        // }, 4000)
        // setTimeout(() => {
        //     local.value.showSeries('S2')
        //     local.value.hideSeries('S3')
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

    <Box comp="VueUiTreemap" :dataset="dataset" :config="config">
        <template #title>VueUiTreemap</template>

        <template #responsive>
            <div style="width: 600px; height: 600px; resize: both; overflow: auto; background: white">
                <LocalVueUiTreemap :key="`responsive_${step}`" :dataset="dataset" :config="{
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
                </LocalVueUiTreemap>
            </div>
        </template>

        <template #theme>
            <LocalVueUiTreemap :dataset="dataset" :config="configTheme"/>
        </template>

        <template #local>
            <LocalVueUiTreemap :dataset="dataset" :config="isPropsToggled ? alternateConfig : config" :key="`local_${step}`" @selectDatapoint="selectDatapoint" @selectLegend="selectLegend" ref="local">
                <!-- <template #group-label="{ group }">
                    <div style="width: 100%; text-align:left; padding-left: 12px;">
                        {{ group.name }}
                    </div>
                </template> -->

                <template #svg="{ svg }">
                    <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#42d392" />
                    <text :x="svg.width / 2" :y="svg.height / 2" text-anchor="middle">#SVG</text>
                </template>
                <template #rect="{ rect, shouldShow, fontSize, isZoom, textColor }">
                    #RECT
                    <div style="font-size: 12px">
                        {{ rect, shouldShow, fontSize, isZoom, textColor }}
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
            </LocalVueUiTreemap>
        </template>
        
        <template #VDUI-local>
            <LocalVueDataUi component="VueUiTreemap" :dataset="dataset" :config="isPropsToggled ? alternateConfig : config" :key="`VDUI-lodal_${step}`" @selectDatapoint="selectDatapoint" @selectLegend="selectLegend" ref="vduiLocal">
                <template #breadcrumb-label="{ crumb }">
                    {{ crumb.label }}
                </template>
                <!-- <template #breadcrumb-arrow>
                    ⇾
                </template> -->
                <template #svg="{ svg }">
                    <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#42d392" />
                    <text :x="svg.width / 2" :y="svg.height / 2" text-anchor="middle">#SVG</text>
                </template>
                <template #rect="{ rect, shouldShow, fontSize, isZoom, textColor }">
                    #RECT
                    <div style="font-size: 12px">
                        {{ rect, shouldShow, fontSize, isZoom, textColor }}
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
            </LocalVueDataUi>
        </template>
        
        <template #build>
            <VueUiTreemap :dataset="dataset" :config="isPropsToggled ? alternateConfig : config" :key="`build_${step}`" @selectDatapoint="selectDatapoint" @selectLegend="selectLegend" ref="build">
                <template #svg="{ svg }">
                    <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#42d392" />
                    <text :x="svg.width / 2" :y="svg.height / 2" text-anchor="middle">#SVG</text>
                </template>
                <template #rect="{ rect, shouldShow, fontSize, isZoom, textColor }">
                    #RECT
                    <div style="font-size: 12px">
                        {{ rect, shouldShow, fontSize, isZoom, textColor }}
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
            </VueUiTreemap>
        </template>

        <template #build-treesh>
            <VueUiTreemapTreeshaken :dataset="dataset" :config="isPropsToggled ? alternateConfig : config" :key="`build_${step}`" @selectDatapoint="selectDatapoint" @selectLegend="selectLegend" ref="build">
                <template #svg="{ svg }">
                    <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#42d392" />
                    <text :x="svg.width / 2" :y="svg.height / 2" text-anchor="middle">#SVG</text>
                </template>
                <template #rect="{ rect, shouldShow, fontSize, isZoom, textColor }">
                    #RECT
                    <div style="font-size: 12px">
                        {{ rect, shouldShow, fontSize, isZoom, textColor }}
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
            </VueUiTreemapTreeshaken>
        </template>
        
        <template #VDUI-build>
            <VueDataUi component="VueUiTreemap" :dataset="dataset" :config="isPropsToggled ? alternateConfig : config" :key="`VDUI-build_${step}`" @selectDatapoint="selectDatapoint" @selectLegend="selectLegend" ref="vduiBuild">
                <template #svg="{ svg }">
                    <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#42d392" />
                    <text :x="svg.width / 2" :y="svg.height / 2" text-anchor="middle">#SVG</text>
                </template>
                <template #rect="{ rect, shouldShow, fontSize, isZoom, textColor }">
                    #RECT
                    <div style="font-size: 12px">
                        {{ rect, shouldShow, fontSize, isZoom, textColor }}
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
            </VueDataUi>
        </template>

        <template #knobs="{ summaryOpen }">
            <ConfigKnobs :model="model" @change="step += 1" :open="summaryOpen"/>
        </template>
    </Box>
</template>