<script setup>
import { ref, computed } from "vue";
import LocalVueUiParallelCoordinatePlot from '../src/components/vue-ui-parallel-coordinate-plot.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import { useArena } from "../src/useArena";

const { local, build, vduiLocal, vduiBuild, toggleTable, toggleLabels } = useArena()

const dataset = ref([
    {
        name: "Series 1",
        shape: "triangle",
        series: [
            {
                name: 'Item 1.1',
                values: [1200, 300, 12, 1.2],
                comments: ['', '', 'This is some sort of comment', '']
            },
            {
                name: 'Item 1.2',
                values: [1000, 100, 10, 1]
            },
            {
                name: 'Item 1.3',
                values: [-800, 85, 8.5, 0.85]
            },
        ]
    },
    {
        name: "Series 2",
        series: [
            {
                name: 'Item 2.1',
                values: [2300, 230, 23, 2.3]
            },
            {
                name: 'Item 2.2',
                values: [2500, 250, 25, 2.5]
            },
            {
                name: 'Item 2.3',
                values: [2800, 280, 28, 2.8]
            },
        ]
    },
])

const model = ref([
    { key: 'responsiveProportionalSizing', def: false, type: 'checkbox'},
    { key: 'style.chart.comments.show', def: true, type: 'checkbox'},
    { key: 'style.chart.comments.showInTooltip', def: true, type: 'checkbox'},
    { key: 'style.chart.comments.width', def: 200, type: 'number', min: 50, max: 400},
    { key: 'style.chart.comments.offsetX', def: 0, type: 'number', min: -100, max: 100},
    { key: 'style.chart.comments.offsetY', def: 0, type: 'number', min: -100, max: 100},
    { key: 'responsive', def: false, type: 'checkbox'},

    { key: 'userOptions.print.scale', def: 2, type: 'number', min: 1, max: 5},
    { key: 'userOptions.print.allowTaint', def: true, type: 'checkbox'},
    { key: 'userOptions.print.useCORS', def: true, type: 'checkbox'},
    { key: 'userOptions.print.backgroundColor', def: '#FFFFFF' },
    
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
    
    { key: 'useCssAnimation', def: true, type: 'checkbox' },
    { key: 'style.fontFamily', def: 'inherit', type: 'text' },
    { key: 'style.chart.backgroundColor', def: '#FFFFFF20', type: 'color' },
    { key: 'style.chart.color', def: '#1A1A1A', type: 'color' },
    { key: 'style.chart.height', def: 600, type: 'number', min: 300, max: 1000 },
    { key: 'style.chart.width', def: 1000, type: 'number', min: 300, max: 1500 },
    { key: 'style.chart.padding.top', def: 24, type: 'number', min: 0, max: 100 },
    { key: 'style.chart.padding.right', def: 24, type: 'number', min: 0, max: 100 },
    { key: 'style.chart.padding.bottom', def: 36, type: 'number', min: 0, max: 100 },
    { key: 'style.chart.padding.left', def: 36, type: 'number', min: 0, max: 100 },
    { key: 'style.chart.lines.smooth', def: false, type: 'checkbox'},
    { key: 'style.chart.lines.strokeWidth', def: 2, type: 'number', min: 0, max: 12},
    { key: 'style.chart.lines.opacity', def: 0.8, type: 'number', min: 0, max: 1, step: 0.01 },
    { key: 'style.chart.plots.show', def: true, type: 'checkbox' },
    { key: 'style.chart.plots.radius', def: 6, type: 'number', min: 0, max: 24 },
    { key: 'style.chart.plots.opacity', def: 0.8, type: 'number', min: 0, max: 1, step: 0.01 },
    { key: 'style.chart.yAxis.scaleTicks', def: 10, type: 'number', min: 2, max: 20 },
    { key: 'style.chart.yAxis.stroke', def: '#1A1A1A', type: 'color' },
    { key: 'style.chart.yAxis.strokeWidth', def: 1, type: 'number', min: 0, max: 12 },
    { key: 'style.chart.yAxis.labels.ticks.show', def: true, type: 'checkbox' },
    { key: 'style.chart.yAxis.labels.ticks.fontSize', def: 14, type: 'number', min: 8, max: 42 },
    { key: 'style.chart.yAxis.labels.ticks.color', def: '#1A1A1A', type: 'color' },
    { key: 'style.chart.yAxis.labels.ticks.bold', def: false, type: 'checkbox' },
    { key: 'style.chart.yAxis.labels.ticks.offsetX', def: 0, min: -100, max: 100, type: 'number' },
    { key: 'style.chart.yAxis.labels.ticks.offsetY', def: 0, min: -100, max: 100, type: 'number' },
    { key: 'style.chart.yAxis.labels.datapoints.show', def: true, type: 'checkbox' },
    { key: 'style.chart.yAxis.labels.datapoints.fontSize', def: 14, type: 'number', min: 8, max: 42 },
    { key: 'style.chart.yAxis.labels.datapoints.useSerieColor', def: true, type: 'checkbox' },
    { key: 'style.chart.yAxis.labels.datapoints.color', def: '#1A1A1A', type: 'color' },
    { key: 'style.chart.yAxis.labels.datapoints.offsetX', def: 0, type: 'number', min: -100, max: 100 },
    { key: 'style.chart.yAxis.labels.datapoints.offsetY', def: 0, type: 'number', min: -100, max: 100 },
    { key: 'style.chart.yAxis.labels.datapoints.bold', def: true, type: 'checkbox' },
    { key: 'style.chart.yAxis.labels.showAxisNames', def: true, type: 'checkbox' },
    { key: 'style.chart.yAxis.labels.axisNamesColor', def: '#1A1A1A', type: 'color' },
    { key: 'style.chart.yAxis.labels.axisNamesFontSize', def: 16, type: 'number', min: 8, max: 42 },
    { key: 'style.chart.yAxis.labels.axisNamesBold', def: true, type: 'checkbox' },
    { key: 'style.chart.title.text', def: 'Lorem ipsum', type: 'text' },
    { key: 'style.chart.title.color', def: '#1A1A1A', type: 'color' },
    { key: 'style.chart.title.fontSize', def: 20, type: 'number', min: 8, max: 42 },
    { key: 'style.chart.title.bold', def: true, type: 'checkbox' },
    { key: 'style.chart.title.subtitle.text', def: 'Lorem ipsum dolor sit amet', type: 'text' },
    { key: 'style.chart.title.subtitle.color', def: '#CCCCCC', type: 'color' },
    { key: 'style.chart.title.subtitle.fontSize', def: 16, type: 'number', min: 8, max: 42 },
    { key: 'style.chart.title.subtitle.bold', def: false, type: 'checkbox' },
    { key: 'style.chart.legend.show', def: true, type: 'checkbox' },
    { key: 'style.chart.legend.backgroundColor', def: '#FFFFFF', type: 'color' },
    { key: 'style.chart.legend.color', def: '#1A1A1A', type: 'color' },
    { key: 'style.chart.legend.fontSize', def: 16, type: 'number', min: 8, max: 42 },
    { key: 'style.chart.legend.bold', def: false, type: 'checkbox' },
    { key: 'style.chart.tooltip.show', def: true, type: 'checkbox' },
    { key: 'style.chart.tooltip.color', def: '#1A1A1A', type: 'color' },
    { key: 'style.chart.tooltip.backgroundColor', def: '#FFFFFF', type: 'color' },
    { key: 'style.chart.tooltip.fontSize', def: 14, type: 'number', min: 8, max: 42 },
    { key: 'style.chart.tooltip.borderRadius', def: 4, type: 'number', min: 0, max: 12 },
    { key: 'style.chart.tooltip.borderColor', def: '#e1e5e8', type: 'color'},
    { key: 'style.chart.tooltip.borderWidth', def: 1, type: 'number', min: 0, max: 12 },
    { key: 'style.chart.tooltip.backgroundOpacity', def: 100, type: 'range', min: 0, max: 100 },
    { key: 'style.chart.tooltip.position', def: 'center', type: 'select', options: ['left', 'center', 'right']},
    { key: 'style.chart.tooltip.offsetY', def: 24, type: 'number', min: 0, max: 48},
])

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
    const c = convertArrayToObject(model.value);
    return {
        ...c,
        theme: currentTheme.value,
        variables: [
            "Variable 1",
            "Variable 2",
            "Variable 3",
            "Variable 4",
        ],
        style: {
            ...c.style,
            chart: {
                ...c.style.chart,
                yAxis: {
                    ...c.style.chart.yAxis,
                    labels: {
                        ...c.style.chart.yAxis.labels,
                        roundings: [0, 0, 0, 1],
                        suffixes: ['$', '€', '£', '%'],
                        axisNames: ['Axis 1 with some\nsort of long name', 'Axis 2', 'Axis 3', ''],
                        formatters: [
                            ({value, config}) => {
                                return `f0 | ${value}`
                            },
                            ({value, config}) => {
                                return `f1 | ${value}`
                            },
                            ({value, config}) => {
                                return `f2 | ${value}`
                            },
                            ({value, config}) => {
                                return `f3 | ${value}`
                            },
                        ]
                    }
                }
            }
        }
    }
})

const step = ref(0)

function selectLegend(l) {
    console.log(l)
}

function selectDatapoint(dp) {
    console.log(dp)
}
    
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

    <div style="width: 600px; height: 600px; resize: both; overflow: auto; background: white">
        <LocalVueUiParallelCoordinatePlot :key="`responsive_${step}`" :dataset="dataset" :config="{
            ...config,
            responsive: true
        }">
        <template #chart-background>
            <div style="width: 100%; height: 100%; background: radial-gradient(at top left, red, white)"/>
        </template>
        
        <template #plot-comment="{ plot }">
            <div :style="`width: 100%; text-align:center; color:${plot.color}`">
                {{  plot.comment }}
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
    </LocalVueUiParallelCoordinatePlot>
    </div>

    <Box comp="VueUiParallelCoordinatePlot" :dataset="dataset">
        <template #title>VueUiParallelCoordinatePlot</template>

        <template #local>
            <LocalVueUiParallelCoordinatePlot :dataset="dataset" :config="config" :key="`local_${step}`" @selectDatapoint="selectDatapoint" @selectLegend="selectLegend" ref="local">
                <template #optionPdf>
                    PRINT PDF
                </template>
            </LocalVueUiParallelCoordinatePlot>
        </template>

        <template #VDUI-local>
            <LocalVueDataUi @selectDatapoint="selectDatapoint" @selectLegend="selectLegend" component="VueUiParallelCoordinatePlot" :dataset="dataset" :config="config" :key="`VDUI_local_${step}`" ref="vduiLocal">
            </LocalVueDataUi>
        </template>

        <template #build>
            <VueUiParallelCoordinatePlot @selectDatapoint="selectDatapoint" @selectLegend="selectLegend" :dataset="dataset" :config="config" ref="build"/>
        </template>

        <template #VDUI-build>
            <VueDataUi @selectDatapoint="selectDatapoint" @selectLegend="selectLegend" component="VueUiParallelCoordinatePlot" :dataset="dataset" :config="config" ref="vduiBuild">
                <template #optionPdf>
                    PRINT PDF
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
                        <input v-if="!['none', 'select'].includes(knob.type)" :step="knob.step" :type="knob.type" :min="knob.min ?? 0"
                            :max="knob.max ?? 0" v-model="knob.def" @change="step += 1">
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