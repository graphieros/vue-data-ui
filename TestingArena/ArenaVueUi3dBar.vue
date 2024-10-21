<script setup>
import { ref, computed } from "vue";
import LocalVueUi3dBar from '../src/components/vue-ui-3d-bar.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import { useArena } from "../src/useArena";

const { local, build, vduiLocal, vduiBuild, toggleTable } = useArena()

const datasets = ref({
    simple: {
        percentage: 66.666
    },
    stacked: {
        series: [
            {
                name:  'Serie 1 with a long name that should be shorter but we do not have the choice',
                value: 256,
                breakdown: [
                    {
                        name: 'Sub serie 1',
                        value: 100
                    },
                    {
                        name: 'Sub serie 2',
                        value: 90
                    },
                    {
                        name: 'Sub serie 3',
                        value: 66
                    }
                ]
            },
            {
                name: 'Serie 2',
                value: 128
            },
            {
                name: 'Serie 3',
                value: 64
            },
            {
                name: 'Serie 4',
                value: 32
            },
            {
                name: 'Serie 5',
                value: 16
            },
            {
                name: 'Serie 6',
                value: 8
            }
        ]
    }
})

const model = ref([
    { key: 'responsive', def: false, type: 'checkbox'},
    { key: 'userOptions.show', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.pdf', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.img', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.csv', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.table', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.fullscreen', def: true, type: 'checkbox'},
    { key: 'style.fontFamily', def: 'inherit', type: 'text'},
    { key: 'style.shape', def: 'bar', type: 'select', options: ['bar', 'tube']},
    { key: 'style.chart.animation.use', def: true, type: 'checkbox'},
    { key: 'style.chart.animation.speed', def: 1,  type: 'number', min: 0.1, max: 2, step: 0.1},
    { key: 'style.chart.animation.acceleration', def: 1, type: 'number', min: 0.1, max: 10, step: 0.1},
    { key: 'style.chart.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: 'style.chart.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.bar.color', def: '#6376DD', type: 'color'},
    { key: 'style.chart.bar.stroke', def: '#6376DD', type: 'color'},
    { key: 'style.chart.bar.strokeWidth', def: 1, type: 'number', min: 0, max: 12, step: 0.5},
    { key: 'style.chart.bar.shadeColor', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.box.stroke', def: '#CCCCCC', type: 'color'},
    { key: 'style.chart.box.strokeWidth', def: 1, type: 'number', min: 0, max: 12, step: 0.5},
    { key: 'style.chart.box.strokeDasharray', def: 2, type: 'number', min: 0, max: 100},
    { key: 'style.chart.box.dimensions.width', def: 128, type: 'number', min: 64, max: 300},
    { key: 'style.chart.box.dimensions.height', def: 256, type: 'number', min: 64, max: 600},
    { key: 'style.chart.box.dimensions.top', def: 27, type: 'number', min: 0, max: 100},
    { key: 'style.chart.box.dimensions.bottom', def: 9, type: 'number', min: 0, max: 100},
    { key: 'style.chart.box.dimensions.left', def: 24, type: 'number', min: 0, max: 100},
    { key: 'style.chart.box.dimensions.right', def: 24, type: 'number', min: 0, max: 100},
    { key: 'style.chart.box.dimensions.perspective', def: 18, type: 'number', min: 0, max: 100},
    { key: 'style.chart.title.text', def: 'Lorem ipsum dolor sit amet', type: 'text'},
    { key: 'style.chart.title.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.title.fontSize', def: 20, type: 'number', min: 8, max: 48},
    { key: 'style.chart.title.bold', def: true, type: 'checkbox'},
    { key: 'style.chart.title.subtitle.color', def: '#CCCCCC', type: 'color'},
    { key: 'style.chart.title.subtitle.text', def: 'Lorem ipsum dolor sit amet', type: "text"},
    { key: 'style.chart.title.subtitle.fontSize', def: 16, type: 'number', min: 8, max: 48},
    { key: 'style.chart.title.subtitle.bold', def: false, type: 'checkbox'},
    { key: 'style.chart.legend.showDefault', def: true, type: 'checkbox'},
    { key: 'style.chart.legend.fontSize', def: 10, type: 'number', min: 8, max: 48},
    { key: 'style.chart.legend.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.legend.bold', def: false, type: 'checkbox'},
    { key: 'style.chart.legend.roundingValue', def: 2, type: 'number', min: 0, max: 12},
    { key: 'style.chart.legend.roundingPercentage', def:2, type: 'number', min: 0, max: 12},
    { key: 'style.chart.legend.prefix', def: 'P', type: 'text'},
    { key: 'style.chart.legend.suffix', def: 'S', type: 'text'},
    { key: 'style.chart.legend.hideUnderPercentage', def: 3, type: 'number', min: 1, max: 20},
    { key: 'style.chart.dataLabel.show', def: true, type: 'checkbox'},
    { key: 'style.chart.dataLabel.bold', def: true, type: 'checkbox'},
    { key: 'style.chart.dataLabel.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.dataLabel.fontSize', def: 12, type: 'number'},
    { key: 'style.chart.dataLabel.rounding', def: 1, type: 'number', min: 0, max: 12},
    { key: 'table.show', def: false, type: 'checkbox'},
    { key: 'table.responsiveBreakpoint', def: 300, type: 'number', min: 300, max: 800},
    { key: 'table.ccolumnNames.series', def: 'Series', type: 'text'},
    { key: 'table.ccolumnNames.value', def: 'Value', type: 'text'},
    { key: 'table.ccolumnNames.percentage', def: 'Percentage', type: 'text'},
    { key: 'table.th.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: 'table.th.color', def: '#1A1A1A', type: 'color'},
    { key: 'table.th.outline', def: 'none', type: 'text'},
    { key: 'table.td.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: 'table.td.color', def: '#1A1A1A', type: 'color'},
    { key: 'table.td.outline', def: 'none', type: 'text'},
    { key: 'table.td.roundingValue', def: 2, type: 'number', min: 0, max: 12},
    { key: 'table.td.roundingPercentage', def: 2, type: 'number', min: 0, max: 12},
])

const themeOptions = ref([
    "",
    "hack",
    "zen",
    "concrete",
    "default"
])

const currentTheme = ref(themeOptions.value[1])

const config = computed(() => {
    const c = convertArrayToObject(model.value);
    return {
        ...c,
        style: {
            ...c.style,
            chart: {
                ...c.style.chart,
                dataLabel: {
                    ...c.style.chart.dataLabel,
                    formatter: ({value, config}) => {
                        // console.log(config)
                        return `f | ${value}`
                    }
                }
            }
        },
        theme: currentTheme.value,
        customPalette: ['#6376DD', "#DD3322", "#66DDAA"],
    }
})

const step = ref(0)

const selectedDataset = ref('stacked')

const dataset = computed(() => datasets.value[selectedDataset.value])

</script>

<template>
    <button @click="toggleTable">TOGGLE TABLE</button>
    <div style="margin: 12px 0; color: white">
        Theme:
        <select v-model="currentTheme" @change="step += 1">
            <option v-for="opt in themeOptions">{{ opt }}</option>
        </select>
    </div>
    <select v-model="selectedDataset" @change="step += 1"><option>simple</option><option>stacked</option></select>

    <div style="width: 600px; height: 600px; resize: both; overflow: auto; background: white">
        <LocalVueUi3dBar :key="`responsive_${step}`" :dataset="dataset" :config="{
            ...config,
            responsive: true
        }">
        <template #watermark="{ isPrinting }">
            <div v-if="isPrinting" style="font-size: 100px; opacity: 0.1; transform: rotate(-10deg)">
                WATERMARK
            </div>
        </template>     
    </LocalVueUi3dBar>
    </div>

    <Box comp="VueUi3dBar" :dataset="dataset">
        <template #title>VueUi3dBar</template>

        <template #local>
            <LocalVueUi3dBar :dataset="dataset" :config="config" :key="`local_${step}`" ref="local">
                <template #optionPdf>
                    PRINT PDF
                </template>
            </LocalVueUi3dBar>
        </template>

        <template #VDUI-local>
            <LocalVueDataUi component="VueUi3dBar" :dataset="dataset" :config="config" :key="`vdui_local_${step}`" ref="vduiLocal">
            </LocalVueDataUi>
        </template>

        <template #build>
            <VueUi3dBar :dataset="dataset" :config="config" :key="`build_${step}`" ref="build">
            </VueUi3dBar>
        </template>

        <template #VDUI-build>
            <VueDataUi component="VueUi3dBar" :dataset="dataset" :config="config" :key="`vdui_build_${step}`" ref="vduiBuild">
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