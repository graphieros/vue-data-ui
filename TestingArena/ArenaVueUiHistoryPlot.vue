<script setup>
import { ref, computed, onMounted } from "vue";
import LocalVueUiHistoryPlot from '../src/components/vue-ui-history-plot.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import { useArena } from "../src/useArena";

import { VueUiHistoryPlot } from "vue-data-ui";
import { VueUiHistoryPlot as VueUiHistoryPlotTreeshaken } from "vue-data-ui/vue-ui-history-plot";

const { local, build, vduiLocal, vduiBuild } = useArena()

const dataset = ref(undefined);

onMounted(() => {
    setTimeout(() => {
        dataset.value = [
            {
                name: 'Series 1',
                values: [
                    { x: 2, y: 21, label: 'F'},
                    { x: 3, y: 13, label: 'E'},
                    { x: 5, y: 8, label: 'D'},
                    { x: 8, y: 5, label: 'C'},
                    { x: 13, y: 3, label: 'B'},
                    { x: 21, y: 2, label: 'A'},
                ]
            },
            {
                name: 'Series 2',
                values: [
                    { x: 22, y: 2, label: 'T1'},
                    { x: 44, y: 4, label: 'T2'},
                    { x: 65, y: 3, label: 'T3'},
                    { x: 12, y: 2.5, label: 'T4'},
                ],
            },
        ]
    }, 2000)
})

const model = ref([
    { key: 'debug', def: true, type: 'checkbox' },
    { key: 'loading', def: false, type: 'checkbox' },
    { key: 'responsive', def: false, type: 'checkbox' },
    { key: 'responsiveProportionalSizing', def: false, type: 'checkbox' },

    { key: 'useCssAnimation', def: true, type: 'checkbox'},
    { key: 'style.fontFamily', def: 'inherit', type: 'text' },
    { key: 'style.chart.backgroundColor', def: '#FFFFFF', type: 'color' },
    { key: 'style.chart.color', def: '#1A1A1A', type: 'color' },
    { key: 'style.chart.height', def: 500, type: 'range', min: 300, max: 1000 },
    { key: 'style.chart.width', def: 600, type: 'range', min: 300, max: 1000 },

    { key: 'style.chart.padding.top', def: 12, type: 'number', min: 0, max: 100 },
    { key: 'style.chart.padding.right', def:12, type: 'number', min: 0, max: 100 },
    { key: 'style.chart.padding.bottom', def:12, type: 'number', min: 0, max: 100 },
    { key: 'style.chart.padding.left', def:12, type: 'number', min: 0, max: 100 },

    { key: 'style.chart.grid.xAxis.show', def: true, type: 'checkbox' },
    { key: 'style.chart.grid.xAxis.stroke', def: '#E1E5E8', type: 'color'},
    { key: 'style.chart.grid.xAxis.strokeWidth', def: 1, type: 'number', min: 0, max: 12},

    { key: 'style.chart.grid.horizontalLines.show', def: true, type: 'checkbox' },
    { key: 'style.chart.grid.horizontalLines.stroke', def: '#E1E5E8', type: 'color'},
    { key: 'style.chart.grid.horizontalLines.strokeWidth', def: 0.6, type: 'number', min: 0, max: 12, step: 0.1},

    { key: 'style.chart.grid.yAxis.show', def: true, type: 'checkbox' },
    { key: 'style.chart.grid.yAxis.stroke', def: '#E1E5E8', type: 'color'},
    { key: 'style.chart.grid.yAxis.strokeWidth', def: 1, type: 'number', min: 0, max: 12},

    { key: 'style.chart.grid.verticalLines.show', def: true, type: 'checkbox' },
    { key: 'style.chart.grid.verticalLines.stroke', def: '#E1E5E8', type: 'color'},
    { key: 'style.chart.grid.verticalLines.strokeWidth', def: 0.6, type: 'number', min: 0, max: 12, step: 0.1},

    { key: 'style.chart.axes.x.scaleMin', def: null, type: 'number', min: 0, max: 1000},
    { key: 'style.chart.axes.x.scaleMax', def: null, type: 'number', min: 0, max: 1000},
    { key: 'style.chart.axes.x.ticks', def: 10, type: 'select', options: [2, 3, 5, 10, 20]},

    { key: 'style.chart.axes.x.labels.show', def: true, type: 'checkbox'},
    { key: 'style.chart.axes.x.labels.fontSize', def: 16, type: 'number', min: 8, max: 42},
    { key: 'style.chart.axes.x.labels.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.axes.x.labels.bold', def: false, type: 'checkbox'},
    { key: 'style.chart.axes.x.labels.rounding', def: 1, type: 'number', min: 0, max: 1},
    { key: 'style.chart.axes.x.labels.rotation', def: 0, type: 'number', min: -90, max: 90},
    { key: 'style.chart.axes.x.labels.autoRotate.angle', def: -90, type: 'number', min: -90, max: 90},

    { key: 'style.chart.axes.x.labels.prefix', def: '', type: 'text'},
    { key: 'style.chart.axes.x.labels.suffix', def: '', type: 'text'},

    { key: 'style.chart.axes.x.name.text', def: 'X AXIS', type: 'text' },
    { key: 'style.chart.axes.x.name.fontSize', def: 16, type: 'number', min: 8, max: 42},
    { key: 'style.chart.axes.x.name.offsetX', def: 0, type: 'number', min: -100, max: 100},
    { key: 'style.chart.axes.x.name.offsetY', def:0, type: 'number', min: -100, max: 100},
    { key: 'style.chart.axes.x.name.bold', def: false, type: 'checkbox' },

    { key: 'style.chart.axes.y.scaleMin', def: null, type: 'number', min: 0, max: 1000},
    { key: 'style.chart.axes.y.scaleMax', def: null, type: 'number', min: 0, max: 1000},
    { key: 'style.chart.axes.y.ticks', def: 10, type: 'select', options: [2, 3, 5, 10, 20]},
    { key: 'style.chart.axes.y.name.text', def: 'Y AXIS', type: 'text' },
    { key: 'style.chart.axes.y.name.fontSize', def: 16, type: 'number', min: 8, max: 42},
    { key: 'style.chart.axes.y.name.offsetX', def: 0, type: 'number', min: -100, max: 100},
    { key: 'style.chart.axes.y.name.offsetY', def: 0, type: 'number', min: -100, max: 100},
    { key: 'style.chart.axes.y.name.bold', def: false, type: 'checkbox' },

    { key: 'style.chart.legend.position', def: 'bottom', type: 'select', options: ['top', 'bottom']},

    { key: 'style.chart.plots.radius', def: 16, type: 'range', min: 8, max: 42},
    { key: 'style.chart.plots.stroke', def: '#FFFFFF', type: 'color'},
    { key: 'style.chart.plots.strokeWidth', def: 1, type: 'number', min: 0, max: 12},
    { key: 'style.chart.plots.gradient.show', def: true, type: 'checkbox'},
    { key: 'style.chart.plots.gradient.intensity', def: 40, type: 'range', min: 0, max: 100},
    { key: 'style.chart.plots.indexLabels.show', def: true, type: 'checkbox'},
    { key: 'style.chart.plots.indexLabels.startAtZero', def: false, type: 'checkbox'},
    { key: 'style.chart.plots.indexLabels.adaptColorToBackground', def: true, type: 'checkbox'},
    { key: 'style.chart.plots.indexLabels.color', def: '#1A1A1A', type:'color'},
    { key: 'style.chart.plots.indexLabels.fontSize', def: 16, type: 'number', min: 8, max: 42},
    { key: 'style.chart.plots.indexLabels.bold', def: false, type: 'checkbox'},
    { key: 'style.chart.plots.indexLabels.offsetY', def: 0, type: 'number', min: -100, max: 100},
    { key: 'style.chart.plots.indexLabels.offsetX', def: 0, type: 'number', min: -100, max: 100},
    { key: 'style.chart.plots.labels.show', def: true, type: 'checkbox'},
    { key: 'style.chart.plots.labels.fontSize', def: 10, type: 'number', min: 8, max: 42},
    { key: 'style.chart.plots.labels.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.plots.labels.bold', def: false, type: 'checkbox'},
    { key: 'style.chart.plots.labels.offsetX', def: 0, type: 'number', min: -100, max: 100},
    { key: 'style.chart.plots.labels.offsetY', def: 0, type: 'number', min: -100, max: 100},

    { key: 'style.chart.paths.show', def: true, type: 'checkbox'},
    { key: 'style.chart.paths.strokeWidth', def: 1.6, type: 'number', min: 0, max: 12, step: 0.1},
    { key: 'style.chart.paths.useSerieColor', def: true, type: 'checkbox'},
    { key: 'style.chart.paths.stroke', def: '#1A1A1A', type: 'color'},

    { key: 'style.chart.title.text', def: 'Title', type: 'text'},
    { key: 'style.chart.title.subtitle.text', def: 'Subtitle', type: 'text'},

    { key: 'userOptions.showOnChartHover', def: true, type: 'checkbox'},
    { key: 'userOptions.keepStateOnChartLeave', def: true, type: 'checkbox'},

    { key: 'userOptions.print.scale', def: 2, type: 'number', min: 1, max: 5},
    { key: 'userOptions.print.allowTaint', def: true, type: 'checkbox'},
    { key: 'userOptions.print.useCORS', def: true, type: 'checkbox'},
    { key: 'userOptions.print.backgroundColor', def: '#FFFFFF' },

    { key: 'table.show', def: false, type: 'checkbox'},
    { key: 'table.useDialog', def: true, type: 'checkbox'},

]);

const themeOptions = ref([
    "",
    "hack",
    "zen",
    "concrete",
    "default",
    "celebration",
    "celebrationNight"
])

const currentTheme = ref(themeOptions.value[0]);

const config = computed(() => {
    const c = convertArrayToObject(model.value);
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
            }
        },
        theme: currentTheme.value,
        // style: {
        //     ...c.style,
        //     chart: {
        //         ...c.style.chart,
        //         tooltip: {
        //             customFormat: ({ datapoint, seriesIndex, plotIndex, series, config }) => {
        //                 console.log({
        //                     datapoint,
        //                     seriesIndex,
        //                     plotIndex,
        //                     series,
        //                     config
        //                 })
        //                 return 'TEST'
        //             }
        //         }
        //     }
        // }
    }
});

const step = ref(0);

onMounted(async() => {
    if (local.value) {
        const img = await local.value.getImage()
        console.log(img)

        // setTimeout(() => {
        //     local.value.hideSeries('Series 1')
        // }, 4000)

        // setTimeout(() => {
        //     local.value.showSeries('Series 1')
        //     local.value.hideSeries('Series 2')
        // }, 5000)
    }
})

</script>

<template>
    <div style="margin: 12px 0; color: white">
        Theme:
        <select v-model="currentTheme" @change="step += 1">
            <option v-for="opt in themeOptions">{{ opt }}</option>
        </select>
    </div>

    <div style="width: 600px; height: 600px; resize: both; overflow: auto; background: white">
        <LocalVueUiHistoryPlot :key="`responsive_${step}`" :dataset="dataset" :config="{
            ...config,
            responsive: true
        }">
            <template #chart-background>
                <div style="width: 100%; height: 100%; background: radial-gradient(at top left, red, white)"/>
            </template>
        </LocalVueUiHistoryPlot>
    </div>

    <Box>
        <template #title>VueUiHistoryPlot</template>

        <template #local>
            <LocalVueUiHistoryPlot :dataset="dataset" :config="config" ref="local"/>
        </template>

        <template #VDUI-local>
            <LocalVueDataUi component="VueUiHistoryPlot" :dataset="dataset" :config="config"/>
        </template>

        <template #build>
            <VueUiHistoryPlot :dataset="dataset" :config="config"/>
        </template>

        <template #build-treesh>
            <VueUiHistoryPlotTreeshaken :dataset="dataset" :config="config"/>
        </template>

        <template #VDUI-build>
            <VueDataUi component="VueUiHistoryPlot" :dataset="dataset" :config="config" />
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