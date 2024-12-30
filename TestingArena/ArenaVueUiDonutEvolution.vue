<script setup>
import { ref, computed } from "vue";
import LocalVueUiDonutEvolution from '../src/components/vue-ui-donut-evolution.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import { useArena } from "../src/useArena";

const { local, build, vduiLocal, vduiBuild, toggleTable } = useArena()

const dataset = ref([
    {
        name: "Serie 1",
        values: [55.123425162, 34, 21, 13, 8, 5, 8, 13, 21, 34, 55 ],
    },
    {
        name: "Serie 2",
        values: [1, 12, 24, 32, 5, 8, 13, 21, 34, 55, 89 ]
    },
    {
        name: "Serie 3",
        values: [16, 2, 3, 5, 28, 13, 21, 34, 55, 89, 134 ]
    },
    {
        name: "Serie 4",
        values: [5, null, 5, 5, 5, 5 ]
    }
])

const model = ref([
    { key: 'userOptions.show', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.pdf', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.csv', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.img', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.table', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.fullscreen', def: true, type: 'checkbox'},
    { key: 'userOptions.position', def: 'right', type: 'select', options: ['left', 'right']},
    { key: 'userOptions.showOnChartHover', def: true, type: 'checkbox'},
    { key: 'userOptions.keepStateOnChartLeave', def: true, type: 'checkbox'},
    
    { key: 'style.fontFamily', def: 'inherit', type: 'text'},
    { key: 'style.chart.backgroundColor', def: '#FFFFFF20', type: 'color'},
    { key: 'style.chart.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.layout.height', def: 316, type: 'number', min: 200, max: 800},
    { key: 'style.chart.layout.width', def: 500, type: 'number', min: 300, max: 1200},
    { key: 'style.chart.layout.padding.top', def: 24, type: 'number', min: 0, max: 100},
    { key: 'style.chart.layout.padding.left', def: 64, type: 'number', min: 0, max: 100},
    { key: 'style.chart.layout.padding.right', def: 48, type: 'number', min: 0, max: 100},
    { key: 'style.chart.layout.padding.bottom', def: 24, type: 'number', min: 0, max: 100},
    { key: 'style.chart.layout.grid.show', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.grid.stroke', def: '#e1e5e8', type: 'color'},
    { key: 'style.chart.layout.grid.strokeWidth', def: 0.7, type: 'number', mon: 0.5, max: 12, step: 0.1 },
    { key: 'style.chart.layout.grid.showVerticalLines', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.grid.yAxis.dataLabels.show', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.grid.yAxis.dataLabels.fontSize', def: 10, type: 'number', min: 8, max: 24},
    { key: 'style.chart.layout.grid.yAxis.dataLabels.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.layout.grid.yAxis.dataLabels.roundingValue', def: 2, type: 'number', min: 0, max: 12},
    { key: 'style.chart.layout.grid.yAxis.dataLabels.offsetX', def: 0, type: 'number', min: -100, max: 100},
    { key: 'style.chart.layout.grid.yAxis.dataLabels.bold', def: false, type: 'checkbox'},
    { key: 'style.chart.layout.grid.yAxis.dataLabels.steps', def: 10, type: 'number', min:2, max: 20},
    { key: 'style.chart.layout.grid.xAxis.dataLabels.show', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.grid.xAxis.dataLabels.fontSize', def: 8, type: 'number', min: 8, max: 24},
    { key: 'style.chart.layout.grid.xAxis.dataLabels.showOnlyFirstAndLast', def: false, type: 'checkbox'},
    { key: 'style.chart.layout.grid.xAxis.dataLabels.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.layout.grid.xAxis.dataLabels.rotation', def: -20, type: 'number', min: -360, max: 360},
    { key: 'style.chart.layout.grid.xAxis.dataLabels.offsetY', def: 0, type: 'number', min: -100, max: 100},
    { key: 'style.chart.layout.line.show', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.line.stroke', def: '#CCCCCC', type: 'color'},
    { key: 'style.chart.layout.line.strokeWidth', def: 4, type: 'number', min: 0, max: 24},
    { key: 'style.chart.layout.highligter.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.layout.highlighter.opacity', def: 5, type: 'range', min: 0, max: 100}, // FIXME: This highligter is kind of a gimmick. To be improved or nuked.
    { key: 'style.chart.layout.dataLabels.show', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.dataLabels.fontSize', def: 10, type: 'number', min: 8, max: 48},
    { key: 'style.chart.layout.dataLabels.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.layout.dataLabels.bold', def: false, type: 'checkbox'},
    { key: 'style.chart.layout.dataLabels.rounding', def: 2, type: 'number', min: 0, max: 12},
    { key: 'style.chart.layout.dataLabels.prefix', def: 'P', type: 'text'},
    { key: 'style.chart.layout.dataLabels.suffix', def: 'S', type: 'text'},
    { key: 'style.chart.layout.dataLabels.offsetY', def: 0, type: 'number', min: -100, max: 100},
    { key: 'style.chart.title.text', def: 'Lorem ipsum dolor sit amet', type: 'text'},
    { key: 'style.chart.title.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.title.fontSize', def: 20, type: 'number', min: 8, amx: 48},
    { key: 'style.chart.title.bold', def: true, type: 'checkbox'},
    { key: 'style.chart.title.subtitle.color', def: '#CCCCCC', type: 'color'},
    { key: 'style.chart.title.subtitle.text', def: 'Lorem ipsum dolor sit amet', type: 'text'},
    { key: 'style.chart.title.subtitle.fontSize', def: 16, type: 'number', min: 8, max: 48},
    { key: 'style.chart.title.subtitle.bold', def: false, type: 'checkbox'},
    { key: 'style.chart.legend.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.legend.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: 'style.chart.legend.bold', def: false, type: 'checkbox'},
    { key: 'style.chart.legend.show', def: true, type: 'checkbox'},
    { key: 'style.chart.legend.fontSize', def: 16, type: 'number', min: 8, max: 48},
    { key: 'style.chart.legend.roundingPercentage', def: 2, type: 'number', min: 0, max: 12},
    { key: 'style.chart.legend.roundingValue', def: 2, type: 'number', min: 0, max: 12},
    { key: 'table.show', def: false, type: 'checkbox'},
    { key: 'table.responsiveBreakpoint', def: 400, type: 'number', min: 300, max: 800},
    { key: 'table.columnNames.period', def: 'Period', type: 'text'},
    { key: 'table.columnNames.total', def: 'Total', type: 'text'},
    { key: 'table.td.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: 'table.td.color', def: '#1A1A1A', type: 'color'},
    { key: 'table.td.outline', def: 'none', type: 'text'},
    { key: 'table.th.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: 'table.th.color', def: '#1A1A1A', type: 'color'},
    { key: 'table.th.outline', def: 'none', type: 'text'},
    { key: 'table.td.roundingValue', def: 2, type: 'number', min: 0, max: 12},
    { key: 'table.td.roundingPercentage', def: 2, type: 'number', min: 0, max: 12},
    { key: 'style.chart.zoom.show', def: true, type: 'checkbox'},
    { key: 'style.chart.zoom.fontSize', def: 14, type: 'number', min: 8, max: 48},
    { key: 'style.chart.zoom.color', def: '#CCCCCC', type: 'color'},
    { key: 'style.chart.zoom.highlightColor', def: "#1A1A1A", type: 'color' },
    { key: 'style.chart.zoom.useResetSlot', def: false, type: 'checkbox'},
    { key: 'style.chart.zoom.startIndex', def: 2, type: 'number', min: 0, max: 100},
    { key: 'style.chart.zoom.endIndex', def: 6, type: 'number', min: 0, max: 100},
]);

const themeOptions = ref([
    "",
    "hack",
    "zen",
    "concrete",
    "default"
])

const currentTheme = ref(themeOptions.value[4])

const config = computed(() => {
    const c = convertArrayToObject(model.value)
    return {
        ...c,
        theme: currentTheme.value,
        customPalette: ['#6376DD', "#DD3322", "#66DDAA"],
        style: {
            ...c.style,
            chart: {
                ...c.style.chart,
                layout: {
                    ...c.style.chart.layout,
                    dataLabels: {
                        ...c.style.chart.layout.dataLabels,
                        formatter: ({value, config}) => {
                            console.log(config)
                            return `f | ${value}`
                        }
                    },
                    grid: {
                        ...c.style.chart.layout.grid,
                        xAxis: {
                            ...c.style.chart.layout.grid.xAxis,
                            dataLabels: {
                                ...c.style.chart.layout.grid.xAxis.dataLabels,
                                values: [
                                    '01-01-2025',
                                    '02-01-2025',
                                    '03-01-2025',
                                    '04-01-2025',
                                    '05-01-2025',
                                    '06-01-2025',
                                    '07-01-2025',
                                    '08-01-2025',
                                    '09-01-2025',
                                    '10-01-2025',
                                    '11-01-2025',
                                ]
                            }
                        }
                    }
                }
            }
        }
    }
})

function selectLegend(legend) {
    console.log({ legend })
}

const step = ref(0)

</script>

<template>
    <button @click="toggleTable">TOGGLE TABLE</button>
    <div style="margin: 12px 0; color: white">
        Theme:
        <select v-model="currentTheme" @change="step += 1">
            <option v-for="opt in themeOptions">{{ opt }}</option>
        </select>
    </div>
    <Box comp="VueUiDonutEvolution" :dataset="dataset">
        <template #title>VueUiDonutEvolution</template>

        <template #local>
            <LocalVueUiDonutEvolution :dataset="dataset" :config="config" :key="`local_${step}`" @selectLegend="selectLegend" ref="local">
                <template #chart-background>
                    <div style="width: 100%; height: 100%; background: radial-gradient(at top left, red, white)"/>
                </template>
                <template #optionPdf>
                    PRINT PDF
                </template>
                <template #svg="{ svg }">
                    <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#42d392" />
                    <text :x="svg.width / 2" :y="svg.height / 2" text-anchor="middle">#SVG</text>
                </template>
                <!-- <template #legend="{ legend }">
                    #LEGEND
                    <div style="font-size: 8px">
                        {{ legend }}
                    </div>
                </template> -->
                <template #reset-action="{ reset }">
                    <button @click="reset()">REFRESH</button>
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
            </LocalVueUiDonutEvolution>
        </template>

        <template #VDUI-local>
            <LocalVueDataUi component="VueUiDonutEvolution" :dataset="dataset" :config="config" :key="`vdui_local_${step}`" @selectLegend="selectLegend" ref="vduiLocal">
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
                <template #reset-action="{ reset }">
                    <button @click="reset()">REFRESH</button>
                </template>
            </LocalVueDataUi>
        </template>

        <template #build>
            <VueUiDonutEvolution :dataset="dataset" :config="config" :key="`build_${step}`" @selectLegend="selectLegend" ref="build">
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
                <template #reset-action="{ reset }">
                    <button @click="reset()">REFRESH</button>
                </template>
            </VueUiDonutEvolution>
        </template>

        <template #VDUI-build>
            <VueDataUi component="VueUiDonutEvolution" :dataset="dataset" :config="config" :key="`vdui_build_${step}`" @selectLegend="selectLegend" ref="vduiBuild">
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
                <template #reset-action="{ reset }">
                    <button @click="reset()">REFRESH</button>
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