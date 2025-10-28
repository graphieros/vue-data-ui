<script setup>
import { ref, computed, onMounted } from "vue";
import LocalVueUiNestedDonuts from '../src/components/vue-ui-nested-donuts.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import { useArena } from "../src/useArena";

import { VueUiNestedDonuts } from "vue-data-ui";
import { VueUiNestedDonuts as VueUiNestedDonutsTreeshaken } from "vue-data-ui/vue-ui-nested-donuts";

const { local, build, vduiLocal, vduiBuild, toggleTable, toggleLabels } = useArena()

const dataset = ref([])
onMounted(() => {
    dataset.value = undefined;
    setTimeout(() => {
        dataset.value = [
    {
        name: "Group 1 is too long",
        series: [
            {
                name: 'Serie 1',
                values: [1]
            },
            {
                name: 'Serie 2',
                values: [0]
            },
            {
                name: 'Serie 3',
                values: [0]
            },
        ]
    },
    {
        name: "Group 2",
        series: [
            {
                name: 'Serie 1',
                values: [0]
            },
            {
                name: 'Serie 2',
                values: [40]
            },
            {
                name: 'Serie 3',
                values: [30]
            },
        ]
    },
]
    }, 2000)
})

function addDatapoint() {
    dataset.value[0].series.push({
        name: 'Serie N',
        values: [10]
    })
}

const model = ref([
    { key: 'loading', def: false, type: 'checkbox'},
    { key: 'responsive', def: false, type: 'checkbox'},
    { key: 'userOptions.show', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.pdf', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.csv', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.img', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.table', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.labels', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.fullscreen', def: true, type: 'checkbox'},
    { key: 'userOptions.position', def: 'right', type: 'select', options: ['left', 'right']},
    { key: 'userOptions.showOnChartHover', def: true, type: 'checkbox'},
    { key: 'userOptions.keepStateOnChartLeave', def: true, type: 'checkbox'},

    { key: 'startAnimation.show', def: true, type: 'checkbox'},

    { key: 'userOptions.print.scale', def: 2, type: 'number', min: 1, max: 5},
    { key: 'userOptions.print.allowTaint', def: true, type: 'checkbox'},
    { key: 'userOptions.print.useCORS', def: true, type: 'checkbox'},
    { key: 'userOptions.print.backgroundColor', def: '#FFFFFF' },
    
    { key: 'useCssAnimation', def: false, type: 'checkbox'},
    { key: 'useBlurOnHover', def: true, type: 'checkbox'},
    { key: 'style.fontFamily', def: 'inherit', type: 'text'},
    { key: 'style.chart.useGradient', def: true, type: 'checkbox'},
    { key: 'style.chart.gradientIntensity', def: 40, type: 'range', min: 0, max: 100},
    { key: 'style.chart.backgroundColor', def: '#FFFFFF20', type: 'color'},
    { key: 'style.chart.color', def: '#1A1A1A', type: 'color'},

    { key: 'style.chart.width', def: 512, type: 'number', min: 0, max: 512 },
    { key: 'style.chart.height', def: 512, type: 'number', min: 0, max: 512 },

    { key: 'style.chart.padding.top', def: 0, type: 'number', min: 0, max: 100},
    { key: 'style.chart.padding.right', def: 48, type: 'number', min: 0, max: 100},
    { key: 'style.chart.padding.bottom', def: 0, type: 'number', min: 0, max: 100},
    { key: 'style.chart.padding.left', def: 48, type: 'number', min: 0, max: 100},

    { key: 'style.chart.layout.labels.dataLabels.show', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.labels.dataLabels.prefix', def: 'P', type: 'text'},
    { key: 'style.chart.layout.labels.dataLabels.suffix', def: 'S', type: 'text'},
    { key: 'style.chart.layout.labels.dataLabels.hideUnderValue', def: 3, type: 'number', min: 1, max: 20},
    { key: 'style.chart.layout.labels.dataLabels.fontSize', def: 14, type: 'number', min: 8, max: 48},
    { key: 'style.chart.layout.labels.dataLabels.offsetX', def: 4, type: 'number', min: -100, max: 100},
    { key: 'style.chart.layout.labels.dataLabels.offsetY', def: 12, type: 'number', min: -100, max: 100},
    { key: 'style.chart.layout.labels.dataLabels.useSerieColor', def: false, type: 'checkbox'},
    { key: 'style.chart.layout.labels.dataLabels.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.layout.labels.dataLabels.showValue', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.labels.dataLabels.showPercentage', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.labels.dataLabels.boldValue', def: false, type: 'checkbox'},
    { key: 'style.chart.layout.labels.dataLabels.boldPercentage', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.labels.dataLabels.roundingValue', def: 2, type: 'number', min: 0, max: 12},
    { key: 'style.chart.layout.labels.dataLabels.roundingPercentage', def: 2, type: 'number', min: 0, max: 12},
    { key: 'style.chart.layout.labels.dataLabels.showDonutName', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.labels.dataLabels.boldDonutName', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.labels.dataLabels.donutNameAbbreviation', def: false, type: 'checkbox'},
    { key: 'style.chart.layout.labels.dataLabels.curvedDonutName', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.labels.dataLabels.donutNameMaxAbbreviationSize', def: 3, type: 'number', min: 1, max: 12},
    { key: 'style.chart.layout.labels.dataLabels.donutNameOffsetY', def: -6, type: 'number', min: -100, max: 100},
    { key: 'style.chart.layout.donut.strokeWidth', def: 200, type: 'number', min: 50, max: 400},
    { key: 'style.chart.layout.donut.borderWidth', def: 2, type: 'number', min: 0, max: 12},
    { key: 'style.chart.layout.donut.useShadow', def: true, type: 'checkbox' },
    { key: 'style.chart.layout.donut.shadowColor', def: '#1A1A1A', type: 'color' },
    { key: 'style.chart.layout.donut.spacingRatio', def: 0.5, type: 'number', min: 0, max: 1, step: 0.01},
    { key: 'style.chart.legend.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: 'style.chart.legend.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.legend.show', def: true, type: 'checkbox'},
    { key: 'style.chart.legend.fontSize', def: 16, type: 'number', min: 8, max: 48},
    { key: 'style.chart.legend.bold', def: false, type: 'checkbox'},
    { key: 'style.chart.legend.roundingValue', def: 2, type: 'number', min: 0, max: 12},
    { key: 'style.chart.legend.roundingPercentage', def: 2, type: 'number', min: 0, max: 12},
    { key: 'style.chart.legend.showValue', def: true, type: 'checkbox'},
    { key: 'style.chart.legend.showPercentage', def: true, type: 'checkbox'},
    { key: 'style.chart.legend.position', def: 'bottom', type: 'select', options: ['top', 'bottom']},

    { key: 'style.chart.title.text', def: 'Lorem ipsum dolor sit amet', type: 'text'},
    { key: 'style.chart.title.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.title.fontSize', def: 20, type: 'number', min: 8, max: 48},
    { key: 'style.chart.title.bold', def: true, type: 'checkbox'},
    { key: 'style.chart.title.subtitle.color', def: '#CCCCCC', type: 'color'},
    { key: 'style.chart.title.subtitle.text', def: 'Lorem ipsum dolor sit amet', type: 'text'},
    { key: 'style.chart.title.subtitle.fontSize', def: 16, type: 'number', min: 8, max: 48},
    { key: 'style.chart.title.subtitle.bold', def: false, type: 'checkbox'},

    { key: 'style.chart.tooltip.show', def: true, type: 'checkbox'},
    { key: 'style.chart.tooltip.showAllItemsAtIndex', def: true, type: 'checkbox'},
    { key: 'style.chart.tooltip.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.tooltip.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: 'style.chart.tooltip.fontSize', def: 14, type: 'number', min: 8, max: 48},
    { key: 'style.chart.tooltip.showValue', def: true, type: 'checkbox'},
    { key: 'style.chart.tooltip.showPercentage', def: true, type: 'checkbox'},
    { key: 'style.chart.tooltip.roundingValue', def: 2, type: 'number', min: 0, max: 12},
    { key: 'style.chart.tooltip.roundingPercentage', def: 2, type: 'number', min: 0, max: 12},
    { key: 'style.chart.tooltip.backgroundOpacity', def: 100, type: 'range', min: 0, max: 100},
    { key: 'style.chart.tooltip.position', def: 'center', type: 'select', options: ['left', 'center', 'right']},
    { key: 'style.chart.tooltip.offsetY', def: 24, type: 'number', min: 0, max: 48}, 

    { key: 'table.show', def: false, type: 'checkbox'},
    { key: 'table.useDialog', def: true, type: 'checkbox'},
    { key: 'table.responsiveBreakpoint', def: 400, type: 'number', min: 300, max: 800},
    { key: 'table.columnNames.series', def: 'Series', type: 'text'},
    { key: 'table.columnNames.value', def: 'Value', type: 'text'},
    { key: 'table.columnNames.percentage', def: 'Percentage', type: 'text'},
    { key: 'table.th.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: 'table.th.color', def: '#1A1A1A', type: 'color'},
    { key: 'table.th.outline', def: 'none', type: 'text'},
    { key: 'table.td.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: 'table.td.color', def: '#1A1A1A', type: 'color'},
    { key: 'table.td.outline', def: 'none', type: 'text'},
    { key: 'table.td.roundingValue', def: 2, type: 'number', min: 0, max: 12},
    { key: 'table.td.roundingPercentage', def: 2, type: 'number', min: 0, max: 12},
])

const testCustomTooltip = ref(false);

const themeOptions = ref([
    "",
    "hack",
    "zen",
    "concrete",
    "default",
    "celebration",
    "celebrationNight"
])

const currentTheme = ref(themeOptions.value[6])

const config = computed(() => {
    const c = convertArrayToObject(model.value)

    if(testCustomTooltip.value) {
        return {
            ...c,
            style: {
                ...c.style,
                chart: {
                    ...c.style.chart,
                    tooltip: {
                        ...c.style.chart.tooltip,
                        customFormat: (data) => {
                            console.log('NESTED DONUTS CUSTOM TOOLTIP', data)
                            return "CUSTOM TOOLTIP"
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
                    console.log({ datapoint, seriesIndex })
                },
                datapointLeave: ({ datapoint, seriesIndex }) => {
                    console.log({ datapoint, seriesIndex })
                },
                datapointClick: ({ datapoint, seriesIndex }) => {
                    console.log({ datapoint, seriesIndex })
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
                                    // console.log(config)
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

onMounted(async() => {
    if (local.value) {
        const img = await local.value.getImage()
        console.log(img)

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
    <button @click="addDatapoint">ADD DATAPOINT</button>

    <div style="width: 600px; height: 600px; resize: both; overflow: auto; background: white">
        <LocalVueUiNestedDonuts :key="`responsive_${step}`" :dataset="dataset" :config="{
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
    </LocalVueUiNestedDonuts>
    </div>

    <Box comp="VueUiNestedDonuts" :dataset="dataset">
        <template #title>VueUiNestedDonuts</template>

        <template #local>
            <LocalVueUiNestedDonuts :dataset="dataset" :config="config" :key="`local_${step}`" @selectLegend="selectLegend" @selectDatapoint="selectDatapoint" ref="local">
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
            </LocalVueUiNestedDonuts>
        </template>

        <template #VDUI-local>
            <LocalVueDataUi component="VueUiNestedDonuts" :dataset="dataset" :config="config" :key="`vdui_local_${step}`" @selectLegend="selectLegend" @selectDatapoint="selectDatapoint" ref="vduiLocal">
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
            <VueUiNestedDonuts :dataset="dataset" :config="config" :key="`build_${step}`" @selectLegend="selectLegend" @selectDatapoint="selectDatapoint" ref="build">
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
            </VueUiNestedDonuts>
        </template>

        <template #build-treesh>
            <VueUiNestedDonutsTreeshaken :dataset="dataset" :config="config" :key="`build_${step}`" @selectLegend="selectLegend" @selectDatapoint="selectDatapoint" ref="build">
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
            </VueUiNestedDonutsTreeshaken>
        </template>

        <template #VDUI-build>
            <VueDataUi component="VueUiNestedDonuts" :dataset="dataset" :config="config" :key="`vdui_build_${step}`" @selectLegend="selectLegend" @selectDatapoint="selectDatapoint" ref="vduiBuild">
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
            <div
                style="display: flex; flex-direction: row; flex-wrap:wrap; align-items:center; width: 100%; color: #CCCCCC; gap:24px;">
                <div v-for="knob in model">
                    <label style="font-size: 10px">{{ knob.key }}</label>
                    <div
                        style="display:flex; flex-direction:row; flex-wrap: wrap; align-items:center; gap:6px; height: 40px">
                        <input v-if="!['none', 'select'].includes(knob.type)" :step="knob.step" :type="knob.type"
                            :min="knob.min ?? 0" :max="knob.max ?? 0" v-model="knob.def" @change="step += 1">
                        <select v-if="knob.type === 'select'" v-model="knob.def" @change="step += 1">
                            <option v-for="opt in knob.options">{{ opt }}</option>
                        </select>
                    </div>
                </div>
            </div>
        </template>

        <template #config>
            {{ config }}
        </template>
    </Box>
</template>