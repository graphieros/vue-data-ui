<script setup>
import { ref, computed, onMounted } from "vue";
import LocalVueUiScatter from '../src/components/vue-ui-scatter.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import { useArena } from "../src/useArena";
import { VueUiScatter } from "vue-data-ui";
import { VueUiScatter as VueUiScatterTreeshaken } from "vue-data-ui/vue-ui-scatter";
import ConfigKnobs from "./ConfigKnobs.vue";
import { useConfigurationControls } from "./createConfigModel";
import { useConfig } from "../src/useConfig"
import useThemeOptions from "./useThemeOptions";

const { local, build, vduiLocal, vduiBuild, toggleTable } = useArena();
const { vue_ui_scatter: DEFAULT_CONFIG } = useConfig();

const {
    CHECKBOX,
    NUMBER,
    RANGE,
    TEXT,
    COLOR,
    SELECT,
    createModel
} = useConfigurationControls(DEFAULT_CONFIG);

const scat1 = computed(() => {
    const arr = [];
    for (let i = -5000; i < 5000; i += 1) {
        arr.push({
            x: Math.random() * (Math.random() > 0.5 ? i / 3 : -i / 3),
            y: Math.random() * (Math.random() > 0.5 ? i / 3 : -i / 3),
            name: `plot_${i}_cluster_1`,
        });
    }
    return arr;
});

const scat2 = computed(() => {
    const arr = [];
    for (let i = -20; i < 20; i += 1) {
        arr.push({
            x: Math.random() * (Math.random() > 0.5 ? i / 4 : -i / 4),
            y: Math.random() * (Math.random() > 0.5 ? i / 4 : -i / 4),
            name: `plot_${i}_cluster_2`,
            marked: i > 10 && i < 15
        });
    }
    return arr;
});

const dataset = ref(undefined);

onMounted(() => {
    setTimeout(() => {
        dataset.value = [
            {
                name: "Cluster 2",
                values: scat2.value,
                shape: "circle",
                marked: true
            },
            {
                name: "Cluster 1",
                values: scat1.value,
                shape: "star",
            },
            {
                name: "Cluster 3",
                values: scat1.value,
                shape: "square",
            },
        ]
    }, 0)
})

const alternateDataset = ref([
    {
            name: 'Alt',
            values: [
                {
                    x: 0,
                    y: 0,
                    name: 'alt1'
                },
                {
                    x: 1,
                    y: 1,
                    name: 'alt1'
                }
            ],
            shape: 'pentagon'
    }
])

const alternateConfig = ref({
    table: {
        th: {
            backgroundColor: '#00FF00'
        }
    },
    style: {
        backgroundColor: '#CCCCCC',
        title: {
            text: 'Alternate'
        }
    }
})

const isPropsToggled = ref(false);
function toggleProps() {
    isPropsToggled.value = !isPropsToggled.value;
}

const trigger = ref(0);

function alterDataset() {
    alternateDataset.value[0].values.push({
        x: trigger.value % 5 === 0 ? Math.random()*10 : Math.random() * -10,
        y: trigger.value % 5 === 0 ? Math.random()*10 : Math.random() * -10
    })
    trigger.value += 1;
}

const model = createModel([
    CHECKBOX("debug", { def: true }),
    CHECKBOX("loading", { def: false }),
    CHECKBOX("usePerformanceMode", { def: true }),
    CHECKBOX("responsive", { def: false }),

    CHECKBOX('userOptions.useCursorPointer', { def: false }),
    CHECKBOX("userOptions.show", { def: true }),
    CHECKBOX("userOptions.buttons.pdf", { def: true }),
    CHECKBOX("userOptions.buttons.img", { def: true }),
    CHECKBOX("userOptions.buttons.csv", { def: true }),
    CHECKBOX("userOptions.buttons.table", { def: true }),
    CHECKBOX("userOptions.buttons.fullscreen", { def: true }),
    SELECT("userOptions.position", ["left", "right"], { def: "right"}),
    CHECKBOX("userOptions.showOnChartHover", { def: true }),
    CHECKBOX("userOptions.keepStateOnChartLeave", { def: true }),

    NUMBER("userOptions.print.scale", { def: 2, min: 1, max: 5 }),
    CHECKBOX("userOptions.print.allowTaint", { def: true }),
    CHECKBOX("userOptions.print.useCORS", { def: true }),
    COLOR("userOptions.print.backgroundColor", { def: "#FFFFFF" }),

    CHECKBOX("useCssAnimation", { def: true }),
    TEXT("style.fontFamily", { def: "inherit" }),
    COLOR("style.backgroundColor", { def: "#FFFFFF" }),
    COLOR("style.color", { def: "#1A1A1A" }),
    NUMBER("style.layout.height", { def: 316, min: 100, max: 1000 }),
    NUMBER("style.layout.width", { def: 512, min: 100, max: 1000 }),
    NUMBER("style.layout.padding.top", { def: 0, min: 0, max: 100 }),
    NUMBER("style.layout.padding.right", { def: 0, min: 0, max: 100 }),
    NUMBER("style.layout.padding.bottom", { def: 0, min: 0, max: 100 }),
    NUMBER("style.layout.padding.left", { def: 0, min: 0, max: 100 }),
    CHECKBOX("style.layout.axis.show", { def: true }),
    COLOR("style.layout.axis.stroke", { def: "#e1e5e8" }),
    NUMBER("style.layout.axis.strokeWidth", { def: 1, min: 0, max: 12 }),

    CHECKBOX("style.layout.marginalBars.show", { def: true }),
    NUMBER("style.layout.marginalBars.size", { def: 40, min: 12, max: 100 }),
    NUMBER("style.layout.marginalBars.tranches", { def: 20, min: 5, max: 100 }),
    RANGE("style.layout.marginalBars.opacity", { def: 0.6, min: 0, max: 1, step: 0.01 }),
    COLOR("style.layout.marginalBars.fill", { def: "#1A1A1A" }),
    NUMBER("style.layout.marginalBars.strokeWidth", { def: 1, min: 0, max: 12 }),
    NUMBER("style.layout.marginalBars.offset", { def: 20, min: 0, max: 100 }),
    NUMBER("style.layout.marginalBars.borderRadius", { def: 2, min: 0, max: 24 }),
    CHECKBOX("style.layout.marginalBars.useGradient", { def: true }),
    CHECKBOX("style.layout.marginalBars.showLines", { def: true }),
    NUMBER("style.layout.marginalBars.linesStrokeWidth", { def: 1, min: 0.5, max: 12, step: 0.5 }),

    CHECKBOX("style.layout.marginalBars.highlighter.show", { def: true }),
    RANGE("style.layout.marginalBars.highlighter.opacity", { def: 0.1, min: 0, max: 1, step: 0.01 }),
    COLOR("style.layout.marginalBars.highlighter.color", { def: "#1A1A1A" }),
    COLOR("style.layout.marginalBars.highlighter.stroke", { def: "#1A1A1A" }),
    NUMBER("style.layout.marginalBars.highlighter.strokeWidth", { def: 0.5, min: 0, max: 12, step: 0.1 }),
    NUMBER("style.layout.marginalBars.highlighter.strokeDasharray", { def: 2, min: 0, max: 12 }),
    CHECKBOX("style.layout.marginalBars.highlighter.highlightBothAxes", { def: false }),

    NUMBER("style.layout.plots.radius", { def: 2, min: 0, max: 24 }),
    COLOR("style.layout.plots.stroke", { def: "#FFFFFF" }),
    RANGE("style.layout.plots.strokeWidth", { def: 0.3, min: 0.1, max: 12, step: 0.1 }),
    NUMBER("style.layout.plots.opacity", { def: 0.6, min: 0, max: 1, step: 0.01 }),
    CHECKBOX("style.layout.plots.significance.show", { def: true }),
    CHECKBOX("style.layout.plots.significance.useDistanceOpacity", { def: true }),
    NUMBER("style.layout.plots.significance.deviationThreshold", { def: 10, min: 0, max: 100 }),
    NUMBER("style.layout.plots.significance.opacity", { def: 0.3, min: 0, max: 1, step: 0.01 }),
    TEXT("style.layout.plots.deviation.translation", { def: "deviation" }),
    NUMBER("style.layout.plots.deviation.roundingValue", { def: 1, min: 0, max: 12 }),

    CHECKBOX("style.layout.plots.giftWrap.show", { def: false }),
    NUMBER("style.layout.plots.giftWrap.strokeWidth", { def: 1, min: 0, max: 12 }),
    NUMBER("style.layout.plots.giftWrap.strokeDasharray", { def: 0, min: 0, max: 100 }),
    NUMBER("style.layout.plots.giftWrap.fillOpacity", { def: 0.2, min: 0, max: 1, step: 0.01 }),

    CHECKBOX("style.layout.plots.selectors.show", { def: true }),
    COLOR("style.layout.plots.selectors.stroke", { def: "#1A1A1A" }),
    NUMBER("style.layout.plots.selectors.strokeWidth", { def: 0.7, min: 0, max: 12, step: 0.1 }),
    NUMBER("style.layout.plots.selectors.strokeDasharray", { def: 0, min: 0, max: 100 }),
    NUMBER("style.layout.plots.selectors.labels.fontSize", { def: 12, min: 8, max: 24 }),
    COLOR("style.layout.plots.selectors.labels.color", { def: "#1A1A1A" }),
    NUMBER("style.layout.plots.selectors.labels.rounding", { def: 2, min: 0, max: 12 }),
    CHECKBOX("style.layout.plots.selectors.labels.bold", { def: false }),
    CHECKBOX("style.layout.plots.selectors.labels.showName", { def: true }),
    TEXT("style.layout.plots.selectors.labels.prefix", { def: "" }),
    TEXT("style.layout.plots.selectors.labels.suffix", { def: "" }),
    NUMBER("style.layout.plots.selectors.markers.radius", { def: 1.5, min: 0, max: 12, step: 0.5 }),
    COLOR("style.layout.plots.selectors.markers.stroke", { def: "#FFFFFF" }),
    NUMBER("style.layout.plots.selectors.markers.strokeWidth", { def: 0.5, min: 0, max: 12, step: 0.5 }),
    COLOR("style.layout.plots.selectors.markers.fill", { def: "#1A1A1A" }),

    CHECKBOX("style.layout.correlation.show", { def: false }),
    NUMBER("style.layout.correlation.strokeDasharray", { def: 2, min: 0, max: 100 }),
    NUMBER("style.layout.correlation.strokeWidth", { def: 1, min: 0, max: 12 }),
    CHECKBOX("style.layout.correlation.label.show", { def: true }),
    NUMBER("style.layout.correlation.label.fontSize", { def: 12, min: 8, max: 48 }),
    COLOR("style.layout.correlation.label.color", { def: "#1A1A1A" }),
    CHECKBOX("style.layout.correlation.label.bold", { def: true }),
    NUMBER("style.layout.correlation.label.roundingValue", { def: 2, min: 0, max: 12 }),
    CHECKBOX("style.layout.correlation.label.useSerieColor", { def: true }),

    TEXT("style.layout.dataLabels.xAxis.name", { def: "Lorem Ipsum X" }),
    CHECKBOX("style.layout.dataLabels.xAxis.show", { def: true }),
    NUMBER("style.layout.dataLabels.xAxis.fontSize", { def: 8, min: 8, max: 24 }),
    COLOR("style.layout.dataLabels.xAxis.color", { def: "#1A1A1A" }),
    CHECKBOX("style.layout.dataLabels.xAxis.bold", { def: false }),
    NUMBER("style.layout.dataLabels.xAxis.offsetX", { def: 0, min: -100, max: 100 }),
    NUMBER("style.layout.dataLabels.xAxis.offsetY", { def: 0, min: -100, max: 100 }),
    NUMBER("style.layout.dataLabels.xAxis.roundingValue", { def: 2, min: 0, max: 12 }),

    TEXT("style.layout.dataLabels.yAxis.name", { def: "Lorem Ipsum Y" }),
    CHECKBOX("style.layout.dataLabels.yAxis.show", { def: true }),
    NUMBER("style.layout.dataLabels.yAxis.fontSize", { def: 8, min: 8, max: 24 }),
    COLOR("style.layout.dataLabels.yAxis.color", { def: "#1A1A1A" }),
    CHECKBOX("style.layout.dataLabels.yAxis.bold", { def: false }),
    NUMBER("style.layout.dataLabels.yAxis.offsetX", { def: 0, min: -100, max: 100 }),
    NUMBER("style.layout.dataLabels.yAxis.offsetY", { def: 0, min: -100, max: 100 }),
    NUMBER("style.layout.dataLabels.yAxis.roundingValue", { def: 2, min: 0, max: 12 }),

    TEXT("style.title.text", { def: "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis" }),
    COLOR("style.title.color", { def: "#1A1A1A" }),
    NUMBER("style.title.fontSize", { def: 20, min: 8, max: 48 }),
    CHECKBOX("style.title.bold", { def: true }),
    TEXT("style.title.subtitle.text", { def: "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis" }),
    COLOR("style.title.subtitle.color", { def: "#CCCCCC" }),
    RANGE("style.title.subtitle.fontSize", { def: 16, min: 8, max: 48 }),
    CHECKBOX("style.title.subtitle.bold", { def: false }),

    CHECKBOX("style.legend.show", { def: true }),
    COLOR("style.legend.backgroundColor", { def: "#FFFFFF20" }),
    COLOR("style.legend.color", { def: "#1A1A1A" }),
    NUMBER("style.legend.fontSize", { def: 14, min: 6, max: 42 }),
    CHECKBOX("style.legend.bold", { def: false }),
    NUMBER("style.legend.roundingValue", { def: 0, min: 0, max: 6 }),
    SELECT("style.legend.position", ["top", "bottom"], { def: "bottom" }),
    CHECKBOX('style.legend.selectAllToggle.show', { def: true }),

    CHECKBOX("style.tooltip.show", { def: true }),
    COLOR("style.tooltip.backgroundColor", { def: "#FFFFFF" }),
    COLOR("style.tooltip.color", { def: "#1A1A1A" }),
    NUMBER("style.tooltip.fontSize", { def: 14, min: 6, max: 24 }),
    CHECKBOX("style.tooltip.showValue", { def: true }),
    NUMBER("style.tooltip.roundingValue", { def: 2, min: 0, max: 6 }),
    CHECKBOX("style.tooltip.showShape", { def: true }),
    TEXT("style.tooltip.prefix", { def: "P" }),
    TEXT("style.tooltip.suffix", { def: "S" }),
    RANGE("style.tooltip.backgroundOpacity", { def: 100, min: 0, max: 100 }),
    SELECT("style.tooltip.position", ["left", "center", "right"], { def: "center" }),
    NUMBER("style.tooltip.offsetY", { def: 24, min: 0, max: 48 }),

    CHECKBOX("table.show", { def: false }),
    CHECKBOX("table.useDialog", { def: true }),
    NUMBER("table.responsiveBreakpoint", { def: 400, min: 300, max: 800 }),
    COLOR("table.th.backgroundColor", { def: "#FFFFFF" }),
    COLOR("table.th.color", { def: "#1A1A1A" }),
    TEXT("table.th.outline", { def: "none" }),
    COLOR("table.td.backgroundColor", { def: "#FFFFFF" }),
    COLOR("table.td.color", { def: "#1A1A1A" }),
    TEXT("table.td.outline", { def: "none" }),
    NUMBER("table.td.roundingValue", { def: 2, min: 0, max: 6 }),
    NUMBER("table.td.roundingAverage", { def: 1, min: 0, max: 6 }),
    TEXT("table.translations.correlationCoefficient", { def: "Correlation coef." }),
    TEXT("table.translations.nbrPlots", { def: "Nbr plots" }),
    TEXT("table.translations.average", { def: "Average" }),
    TEXT("table.translations.series", { def: "Series" })
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
                tooltip: {
                    ...c.style.tooltip,
                    customFormat: ({ datapoint }) => {
                        let html = '';
                        // console.log(datapoint);
                        return "test"
                    }
                }
            }

        }
    } else {
        return {
            ...c,
            skeletonConfig: {
                style: {
                    backgroundColor: '#FF0000'
                }
            },
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
                layout: {
                    ...c.style.layout,
                    plots: {
                        ...c.style.layout.plots,
                        selectors: {
                            ...c.style.layout.plots.selectors,
                            labels: {
                                ...c.style.layout.plots.selectors.labels,
                                // x: {
                                //     formatter: ({value, config}) => {
                                //         // console.log(config)
                                //         return `X | ${value}`
                                //     }
                                // },
                                // y: {
                                //     formatter: ({value, config}) => {
                                //         // console.log(config)
                                //         return `Y | ${value}`
                                //     }
                                // }
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

onMounted(async () => {
    if (local.value) {
        const img = await local.value.getImage()
        console.log(img);

        // setTimeout(() => {
        //     local.value.hideSeries('Cluster 2')
        // }, 4000)
        // setTimeout(() => {
        //     local.value.showSeries('Cluster 2')
        //     local.value.hideSeries('Cluster 1')
        // }, 5000)
    }
});

function freestyle({ drawingArea, data }) {
    const marked = (data || []).filter(d => !!d?.marked)
    const markedPlots = marked[0]?.plots.filter(p => !!p?.v?.marked);
    const circles = (markedPlots || []).map(p => {
        return `
            <g style="pointer-events: none;">
                <circle
                    cx="${p?.x}"
                    cy="${p?.y}"
                    r="20"
                    stroke="#FF0000"
                    fill="none"
                />
                <path
                    d="M${p?.x - 20},${p?.y} ${p?.x - 5},${p?.y} M${p?.x},${p?.y - 20} ${p?.x},${p?.y - 5} M${p?.x + 20},${p?.y} ${p?.x + 5},${p?.y} M${p?.x},${p?.y + 20} ${p?.x},${p?.y + 5}"
                    stroke="#FF0000"
                />
            </g>
        `
    })
    return circles;
}

</script>

<template>
    <div style="margin: 12px 0; color: white">
        Theme:
        <select v-model="currentTheme" @change="step += 1">
            <option v-for="opt in themeOptions">{{ opt }}</option>
        </select>
    </div>
    <button @click="toggleTable">TOGGLE TABLE</button>
    <div style="margin: 12px 0">
        <input type="checkbox" v-model="testCustomTooltip" id="custom-tooltip" />
        <label for="custom-tooltip" style="color:#CCCCCC">Test custom tooltip</label>
    </div>

    <button @click="toggleProps">TOGGLE PROPS: {{ isPropsToggled }}</button>
    <button @click="alterDataset">ALTER DATASET</button>

    <Box comp="VueUiScatter" :dataset="dataset" :config="config">
        <template #title>VueUiScatter</template>

        <template #responsive>
            <div style="width: 600px; height: 600px; resize: both; overflow: auto; background: white">
                <LocalVueUiScatter :key="`responsive_${step}`" :dataset="dataset" :config="{
                    ...config,
                    responsive: true
                }">

                    <template #svg="{ svg }">
                        <g v-html="freestyle(svg)" />
                    </template>

                    <!-- <template #chart-background>
                        <div style="width: 100%; height: 100%; background: radial-gradient(at top left, red, white)"/>
                    </template> -->

                    <template #watermark="{ isPrinting }">
                        <div v-if="isPrinting" style="font-size: 100px; opacity: 0.1; transform: rotate(-10deg)">
                            WATERMARK
                        </div>
                    </template>
                    <!-- <template #source>
                        <div style="width:100%;font-size:10px;text-align:left">
                            SOURCE: Lorem ipsum dolor sit, amet consectetur adipisicing elit. Tenetur, molestiae perspiciatis nam quae libero, deserunt in aperiam unde officia sint saepe laboriosam ducimus aspernatur labore! Sapiente aspernatur corrupti quis ad.
                        </div>
                    </template> -->
                </LocalVueUiScatter>
            </div>
        </template>

        <template #theme>
            <LocalVueUiScatter :dataset="dataset" :config="configTheme" />
        </template>
        
        <template #local>
            <LocalVueUiScatter :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`local_${step}`" ref="local">
                <template #optionPdf>
                    PRINT PDF
                </template>
                <!-- <template #svg="{ svg }">
                    <circle :cx="30" :cy="30" :r="30" fill="#42d392" />
                    <text :x="30" :y="30" text-anchor="middle">#SVG</text>
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
            </LocalVueUiScatter>
        </template>

        <template #VDUI-local>
            <LocalVueDataUi component="VueUiScatter" :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`VDUI-lodal_${step}`" ref="vduiLocal">
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
            <VueUiScatter :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`build_${step}`" ref="build">
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
            </VueUiScatter>
        </template>

        <template #build-treesh>
            <VueUiScatterTreeshaken :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`build_${step}`" ref="build">
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
            </VueUiScatterTreeshaken>
        </template>

        <template #VDUI-build>
            <VueDataUi component="VueUiScatter" :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`VDUI-build_${step}`" ref="vduiBuild">
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

        <template #knobs="{ summaryOpen }">
            <ConfigKnobs :model="model" @change="step += 1" :open="summaryOpen"/>
        </template>
    </Box>
</template>