<script setup>
import { ref, computed } from "vue";
import LocalVueUiStripPlot from '../src/components/vue-ui-strip-plot.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import { useArena } from "../src/useArena";

const { local, build, vduiLocal, vduiBuild, toggleTable, toggleLabels } = useArena()

const dataset = ref([
    {
        name: "Asia",
        plots: [
            { name: "Shanghai", value: 24.9 },
            { name: "Beijing", value: 21.9 },
            { name: "Delhi", value: 16.8 },
            { name: "Guangzhou", value: 16.1 },
            { name: "Istanbul", value: 15.6 },
            { name: "Chengdu", value: 15.4 },
            { name: "Mumbai", value: 15.4 },
            { name: "Karachi", value: 14.9 },
            { name: "Shenzen", value: 14.7 },
            { name: "Tokyo", value: 14 },
        ]
    },
    {
        name: "Africa",
        plots: [
            { name: "Kinshasa", value: 17.1 },
            { name: "Lagos", value: 14.9 },
            { name: "Cairo", value: 9.3 },
            { name: "Johannesburg", value: 5.6 },
            { name: "Giza", value: 5.6 },
            { name: "Khartoum", value: 5.3 },
            { name: "Abidjan", value: 5 },
            { name: "Alexandria", value: 4.9 },
            { name: "Dar es Salaam", value: 4.7 },
            { name: "Nairobi", value: 4.4 },
        ]
    },
    {
        name: "Europe",
        plots: [
            { name: "Moscow", value: 13 },
            { name: "London", value: 9 },
            { name: "Saint Petersburg", value: 5.4 },
            { name: "Berlin", value: 3.8 },
            { name: "Madrid", value: 3.3 },
            { name: "Kyiv", value: 3 },
            { name: "Rome", value: 2.7 },
            { name: "Paris", value: 2.1 },
            { name: "Minsk", value: 2 },
            { name: "Vienna", value: 1.9 }
        ]
    },
    {
        name: "America",
        plots: [
            { name: "Sao Paulo", value: 12.2 },
            { name: "Lima", value: 9.7 },
            { name: "Mexico City", value: 9.2 },
            { name: "New York", value: 8.4 },
            { name: "Bogota", value: 8 },
            { name: "Rio de Janeiro", value: 6.7 },
            { name: "Santiago", value: 6.2 },
            { name: "Los Angeles", value: 4 },
            { name: "Buenos Aires", value: 3 },
            { name: "Brasilia", value: 2.9 }
        ]
    },
    {
        name: "Australia & Oceania",
        plots: [
            { name: "Sydney", value: 5.4 },
            { name: "Melbourne", value: 5.1 },
            { name: "Brisbane", value: 2.6 },
            { name: "Perth", value: 2.1 },
            { name: "Auckland", value: 1.7 },
            { name: "Adelaide", value: 1.4 },
            { name: "Honolulu", value: 1 },
            { name: "Gold Coast", value: 0.7 },
            { name: "Newcastle-Maitland", value: 0.5 },
            { name: "Canberra", value: 0.46 },
        ]
    },
]
)

const model = ref([
    { key: 'useCssAnimation', def: true, type: 'checkbox'},
    { key: 'userOptions.show', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.pdf', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.csv', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.img', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.table', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.labels', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.fullscreen', def: true, type: 'checkbox'},
    { key: 'style.fontFamily', def: 'inherit', type: 'text'},
    { key: 'style.chart.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: 'style.chart.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.height', def: 600, type: 'number', min: 200, max: 1000},
    { key: 'style.chart.stripWidth', def: 120, type: 'number', min: 48, max: 300},
    { key: 'style.chart.padding.top', def: 24, type: 'number', min: 0, max: 100},
    { key: 'style.chart.padding.left', def: 64, type: 'number', min: 0, max: 100},
    { key: 'style.chart.padding.right', def: 24, type: 'number', min: 0, max: 100},
    { key: 'style.chart.padding.bottom', def: 64, type: 'number', min: 0, max: 100},
    { key: 'style.chart.grid.show', def: true, type: 'checkbox'},
    { key: 'style.chart.grid.stroke', def: '#e1e5e8', type: 'color'},
    { key: 'style.chart.grid.strokeWidth', def: 1, type: 'number', min: 0, max: 12},
    { key: 'style.chart.grid.scaleSteps', def: 10, type: 'number', min: 2, max: 20},
    { key: 'style.chart.grid.horizontalGrid.show', def: true, type: 'checkbox'},
    { key: 'style.chart.grid.horizontalGrid.strokeWidth', def: 0.5, type: 'number', min: 0, max: 12, step: 0.5},
    { key: 'style.chart.grid.horizontalGrid.stroke', def: '#CCCCCC', type: 'color'},
    { key: 'style.chart.grid.horizontalGrid.strokeDasharray', def: 4, type: 'number', min: 0, max: 100},
    { key: 'style.chart.grid.verticalGrid.show', def: true, type: 'checkbox'},
    { key: 'style.chart.grid.verticalGrid.stroke', def: '#CCCCCC', type: 'color'},
    { key: 'style.chart.grid.verticalGrid.strokeWidth', def: 0.5, type: 'number', min: 0, max: 12, step: 0.5},
    { key: 'style.chart.grid.verticalGrid.strokeDasharray', def: 4, type: 'number', min: 0, max: 100},
    { key: 'style.chart.plots.opacity', def: 0.5, type: 'number', min: 0, max: 1, step: 0.01},
    { key: 'style.chart.plots.radius', def: 20, type: 'number', min: 1, max: 100},
    { key: 'style.chart.plots.stroke', def: '#FFFFFF', type: 'color'},
    { key: 'style.chart.plots.strokeWidth', def: 1, type: 'number', min: 0, max: 12},
    { key: 'style.chart.plots.shape', def: 'circle', type: 'select', options: ['circle', 'triangle', 'square', 'diamond', 'pentagon', 'hexagon', 'star']},
    { key: 'style.chart.plots.gradient.show', def: true, type: 'checkbox'},
    { key: 'style.chart.plots.gradient.intensity', def: 40, type: 'range', min: 0, max: 100},
    { key: 'style.chart.labels.prefix', def: 'P', type: 'text'},
    { key: 'style.chart.labels.suffix', def: 'S', type: 'text'},
    { key: 'style.chart.labels.bestPlotLabel.show', def: true, type: 'checkbox'},
    { key: 'style.chart.labels.bestPlotLabel.showValue', def: true, type: 'checkbox'},
    { key: 'style.chart.labels.bestPlotLabel.fontSize', def: 14, type: 'number', min: 8, max: 48},
    { key: 'style.chart.labels.bestPlotLabel.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.labels.bestPlotLabel.rounding', def: 2, type: 'number', min: 0, max: 12},
    { key: 'style.chart.labels.bestPlotLabel.offsetY', def: 0, type: 'number', min: -100, max: 100},
    { key: 'style.chart.labels.axis.xLabel', def: 'Lorem ipsum X Label', type: 'text'},
    { key: 'style.chart.labels.axis.xLabelOffsetY', def: 0, type: 'number', min: -100, max: 100},
    { key: 'style.chart.labels.axis.yLabel', def: 'Lorem ipsum Y label', type: 'text'},
    { key: 'style.chart.labels.axis.yLabelOffsetX', def: 0, type: 'number', min: -100, max: 100},
    { key: 'style.chart.labels.axis.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.labels.xAxisLabels.show', def: true, type: 'checkbox'},
    { key: 'style.chart.labels.xAxisLabels.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.labels.xAxisLabels.fontSize', def: 14, type: 'number', min: 8, max: 48},
    { key: 'style.chart.labels.xAxisLabels.offsetY', def: 0, type: 'number', min: -100, max: 100},
    { key: 'style.chart.labels.yAxisLabels.show', def: true, type: 'checkbox'},
    { key: 'style.chart.labels.yAxisLabels.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.labels.yAxisLabels.fontSize', def: 14, type: 'number', min: 8, max: 48},
    { key: 'style.chart.labels.yAxisLabels.rounding', def: 2, type: 'number', min: 0, max: 12},
    { key: 'style.chart.labels.yAxisLabels.offsetX', def: 0, type: 'number', min: -100, max: 100},
    { key: 'style.chart.title.text', def: 'Lorem ipsum dolor sit amet', type: 'text'},
    { key: 'style.chart.title.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.title.fontSize', def: 20, type: 'number', min: 8, max: 48},
    { key: 'style.chart.title.bold', def: true, type: 'checkbox'},
    { key: 'style.chart.title.subtitle.color', def: '#CCCCCC', type: 'color'},
    { key: 'style.chart.title.subtitle.text', def: 'Lorem ipsum dolor sit amet', type: 'text'},
    { key: 'style.chart.title.subtitle.fontSize', def: 16, type: 'number', min: 8, max: 48},
    { key: 'style.chart.title.subtitle.bold', def: false, type: 'checkbox'},
    { key: 'style.chart.tooltip.show', def: true, type: 'checkbox'},
    { key: 'style.chart.tooltip.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.tooltip.backgroundColor', def:'#FFFFFF', type: 'color'},
    { key: 'style.chart.tooltip.fontSize', def: 14, type: 'number', min: 8, max: 48},
    { key: 'style.chart.tooltip.roundingValue', def: 2, type: 'number', min: 0, max: 12},
    { key: 'table.show', def: false, type: 'checkbox'},
    { key: 'table.responsiveBreakpoint', def: 300, type: 'number', min: 300, max: 800},
    { key: 'table.columnNames.series', def: 'Series', def: 'text'},
    { key: 'table.columnNames.value', def: 'Value', def: 'text'},
    { key: 'table.th.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: 'table.th.color', def: '#1A1A1A', type: 'color'},
    { key: 'table.th.outline', def: 'none', type: 'text'},
    { key: 'table.td.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: 'table.td.color', def: '#1A1A1A', type: 'color'},
    { key: 'table.td.outline', def: 'none', type: 'text'},
    { key: 'table.td.roundingValue', def: 2, type: 'number', min: 0, max: 12}
])

const testCustomTooltip = ref(false);

const themeOptions = ref([
    "",
    "hack",
    "zen",
    "concrete",
    "default"
])

const currentTheme = ref(themeOptions.value[3])

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
                            console.log('STRIP PLOT CUSTOM TOOLTIP', data)
                            return 'CUSTOM TOOLTIP'
                        }
                    }
                }
            }
        }
    } else {
        return {
            ...c,
            theme: currentTheme.value,
            customPalette: ['#6376DD', "#DD3322", "#66DDAA"],
        }
    }
})

const step = ref(0)

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
        <input type="checkbox" v-model="testCustomTooltip" id="custom-tooltip"/>
        <label for="custom-tooltip" style="color:#CCCCCC">Test custom tooltip</label>
    </div>
    <Box>
        <template #title>VueUiStripPlot</template>

        <template #local>
            <LocalVueUiStripPlot :dataset="dataset" :config="config" :key="`local_${step}`" ref="local">
                <template #optionLabels>
                    SHOW LABELS
                </template>
                <template #svg="{ svg }">
                    <circle :cx="30" :cy="30" :r="30" fill="#42d392" />
                    <text :x="30" :y="30" text-anchor="middle">#SVG</text>
                </template>
                <template #tooltip-before="{ datapoint, seriesIndex, series, config, bars, lines, plots }">
                    #BEFORE {{ series.name }}
                </template>
                <template #tooltip-after="{ datapoint, seriesIndex, series, config, bars, lines, plots }">
                    #AFTER {{ series.name }}
                </template>
            </LocalVueUiStripPlot>
        </template>

        <template #VDUI-local>
            <LocalVueDataUi component="VueUiStripPlot" :dataset="dataset" :config="config" :key="`vdui_local_${step}`" ref="vduiLocal">
                <template #svg="{ svg }">
                    <circle :cx="30" :cy="30" :r="30" fill="#42d392" />
                    <text :x="30" :y="30" text-anchor="middle">#SVG</text>
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
            <VueUiStripPlot :dataset="dataset" :config="config" :key="`build_${step}`" ref="build">
                <template #svg="{ svg }">
                    <circle :cx="30" :cy="30" :r="30" fill="#42d392" />
                    <text :x="30" :y="30" text-anchor="middle">#SVG</text>
                </template>
                <template #tooltip-before="{ datapoint, seriesIndex, series, config, bars, lines, plots }">
                    #BEFORE {{ series.name }}
                </template>
                <template #tooltip-after="{ datapoint, seriesIndex, series, config, bars, lines, plots }">
                    #AFTER {{ series.name }}
                </template>
            </VueUiStripPlot>
        </template>

        <template #VDUI-build>
            <VueDataUi component="VueUiStripPlot" :dataset="dataset" :config="config" :key="`vdui_build_${step}`" ref="vduiBuild">
                <template #svg="{ svg }">
                    <circle :cx="30" :cy="30" :r="30" fill="#42d392" />
                    <text :x="30" :y="30" text-anchor="middle">#SVG</text>
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