<script setup>
import { ref, computed, onMounted } from "vue";
import LocalVueUiTableSparkline from '../src/components/vue-ui-table-sparkline.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";

const dataset = ref([
    {
        name: "Serie 1",
        values: [0, 1, 2, 3, 5, 8, 13],
    },
    {
        name: "Serie 2",
        values: [8.2, 12, 13, 25, 31, 42, 53, 42, 31, 25, 13, 12, 8],
    },
    {
        name: "Serie 3",
        values: [66, 22, 33, 12, 55, 64, 75, 64, 55, 12, 33, 22, 66],
    },
    {
        name: "Serie 4",
        values: [54, 44, 34, 12, 32, 26, 33, 26, 32, 12, 34, 44, 54],
    },
    {
        name: "Serie 5",
        values: [12, 14, 18, 25, 32, 64, 77, 64, 32, 25, 18, 14, 12],
    },
])

onMounted(() => {
    setTimeout(() => {
        dataset.value[0] = {
            name: "Serie 1",
            values: [10, 0, 10, 0, 10, 0, 10, 0],
        }
    }, 3000)
})

const model = ref([
    { key: 'userOptions.show', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.pdf', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.csv', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.img', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.fullscreen', def: true, type: 'checkbox'},
    { key: 'userOptions.position', def: 'right', type: 'select', options: ['left', 'right']},
    
    { key: 'responsiveBreakpoint', def: 500, type: 'number', min: 300, max: 800},
    { key: 'showAverage', def: true, type: 'checkbox'},
    { key: 'showMedian', def: true, type: 'checkbox'},
    { key: 'showTotal', def: true, type: 'checkbox'},
    { key: 'roundingAverage', def: 2, type: 'number', min: 0, max: 12},
    { key: 'roundingMedian', def: 2, type: 'number', min: 0, max: 12},
    { key: 'roundingValues', def: 2, type: 'number', min: 0, max: 12},
    { key: 'roundingTotal', def: 2, type: 'number', min: 0, max: 12},
    { key: 'showSparklines', def: true, type: 'checkbox'},
    { key: 'fontFamily', def: 'inherit', type: 'text'},
    { key: 'sparkline.useGradient', def: true, type: 'checkbox'},
    { key: 'sparkline.showArea', def: true, type: 'checkbox'},
    { key: 'sparkline.strokeWidth', def: 3, type: 'number', min: 1, max: 12},
    { key: 'sparkline.type', def: 'line', type: 'select', options: ['line', 'bar']},
    { key: 'sparkline.smooth', def: true, type: 'checkbox'},
    { key: 'sparkline.animation.show', def: true, type: 'checkbox'},
    { key: 'sparkline.animation.animationFrames', def: 360, type: 'number', min: 60, max: 1000},
    { key: 'translations.serie', def: 'Serie', type: 'text'},
    { key: 'translations.total', def: 'Total', type: 'text'},
    { key: 'translations.average', def: 'Average', type: 'text'},
    { key: 'translations.median', def: 'Median', type: 'text'},
    { key: 'translations.chart', def: 'Evolution', type: 'text'},
    { key: 'title.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: 'title.text', def: 'Lorem ipsum dolor sot amet', type: 'text'},
    { key: 'title.fontSize', def: 18, type: 'number', min: 8, max: 48},
    { key: 'title.color', def: '#1A1A1A', type: 'color'},
    { key: 'title.bold', def: true, type: 'checkbox'},
    { key: 'title.textAlign', def: 'center', type:'select', options: ['left', 'center', 'right']},
    { key: 'title.subtitle.text', def: 'Lorem ipsum dolor sit amet', type: 'text'},
    { key: 'title.subtitle.color', def: '#1A1A1A', type: 'color'},
    { key: 'title.subtitle.fontSize', def: 14, type: 'number', min: 8, max: 48},
    { key: 'title.subtitle.bold', def: false, type: 'checkbox'},
    { key: 'thead.backgroundColor', def: '#FFFFFF20', type: 'color'},
    { key: 'thead.color', def: '#1A1A1A', type: 'color'},
    { key: 'thead.fontSize', def: 14, type: 'number', min: 8, max: 24},
    { key: 'thead.outline', def: 'none', type: 'text'},
    { key: 'thead.textAlign', def: 'left', type: 'select', options: ['left', 'center', 'right']},
    { key: 'thead.bold', def: false, type: 'checkbox'},
    { key: 'tbody.backgroundColor', def: '#FFFFFF20', type: 'color'},
    { key: 'tbody.color', def: '#1A1A1A', type: 'color'},
    { key: 'tbody.fontSize', def: 14, type: 'number', min: 8, max: 24},
    { key: 'tbody.outline', def: 'none', type: 'text'},
    { key: 'tbody.textAlign', def: 'left', type: 'select', options: ['left', 'center', 'right']},
    { key: 'tbody.bold', def: false, type: 'checkbox'},
])

const themeOptions = ref([
    "",
    "hack",
    "zen",
    "concrete",
    "default"
])

const currentTheme = ref(themeOptions.value[4])

const config = computed(() => {
    return {
        ...convertArrayToObject(model.value),
        formatter: ({value, config }) => {
            // console.log(config)
            return `f | ${value}`
        },
        theme: currentTheme.value,
        customPalette: ['#6376DD', "#DD3322", "#66DDAA"],
    }
})

const step = ref(0)

</script>

<template>
    <div style="margin: 12px 0; color: white">
        Theme:
        <select v-model="currentTheme" @change="step += 1">
            <option v-for="opt in themeOptions">{{ opt }}</option>
        </select>
    </div>
    <Box comp="VueUiTableSparkline" :dataset="dataset">
        <template #title>VueUiTableSparkline</template>

        <template #local>
            <LocalVueUiTableSparkline :dataset="dataset" :config="config" :key="`local_${step}`">
                <template #optionPdf>
                    PDF
                </template>
            </LocalVueUiTableSparkline>
        </template>

        <template #VDUI-local>
            <LocalVueDataUi component="VueUiTableSparkline" :dataset="dataset" :config="config" :key="`vdui_local_${step}`">
            </LocalVueDataUi>
        </template>

        <template #build>
            <VueUiTableSparkline :dataset="dataset" :config="config" :key="`build_${step}`">
            </VueUiTableSparkline>
        </template>

        <template #VDUI-build>
            <VueDataUi component="VueUiTableSparkline" :dataset="dataset" :config="config" :key="`vdui_build_${step}`">
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