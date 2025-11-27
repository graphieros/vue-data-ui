<script setup>
import { ref, computed, onMounted } from "vue";
import LocalVueUiTableSparkline from '../src/components/vue-ui-table-sparkline.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";

import { VueUiTableSparkline } from "vue-data-ui";
import { VueUiTableSparkline as VueUiTableSparklineTreeshaken } from "vue-data-ui/vue-ui-table-sparkline";
import ConfigKnobs from "./ConfigKnobs.vue";

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
    { key: 'userOptions.showOnChartHover', def: true, type: 'checkbox'},
    { key: 'userOptions.keepStateOnChartLeave', def: true, type: 'checkbox'},

    { key: 'userOptions.print.scale', def: 2, type: 'number', min: 1, max: 5},
    { key: 'userOptions.print.allowTaint', def: true, type: 'checkbox'},
    { key: 'userOptions.print.useCORS', def: true, type: 'checkbox'},
    { key: 'userOptions.print.backgroundColor', def: '#FFFFFF' },
    
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

    { key: 'thead.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: 'thead.color', def: '#1A1A1A', type: 'color'},
    { key: 'thead.fontSize', def: 14, type: 'number', min: 8, max: 24},
    { key: 'thead.outline', def: 'none', type: 'text'},
    { key: 'thead.textAlign', def: 'right', type: 'select', options: ['left', 'center', 'right']},
    { key: 'thead.bold', def: false, type: 'checkbox'},
    { key: 'tbody.backgroundColor', def: '#BBBBBB', type: 'color'},
    { key: 'tbody.color', def: '#1A1A1A', type: 'color'},
    { key: 'tbody.fontSize', def: 14, type: 'number', min: 8, max: 24},
    { key: 'tbody.outline', def: 'none', type: 'text'},
    { key: 'tbody.textAlign', def: 'right', type: 'select', options: ['left', 'center', 'right']},
    { key: 'tbody.bold', def: false, type: 'checkbox'},

    { key: 'tbody.selectedColor.useSerieColor', def: true, type: 'checkbox'},
    { key: 'tbody.selectedColor.fallback', def: '#E1E5E840', type: 'text'},

    { key: 'sparkline.dimensions.width', def: 150, min: 100, max: 300, type: 'number' },
    { key: 'sparkline.dimensions.heightRatio', def: 1, type: 'number', min: 0.2, max: 2, step: 0.01 },

    { key: 'sortedSeriesName', def: true, type: 'checkbox'},
    { key: 'sortedSum', def: true, type: 'checkbox'},
    { key: 'sortedAverage', def: true, type: 'checkbox'},
    { key: 'sortedMedian', def: true, type: 'checkbox'},
    { key: 'resetSortOnClickOutside', def: true, type: 'checkbox'}
])

const themeOptions = ref([
    "",
    "dark",
    "hack",
    "zen",
    "concrete",
    "default",
    "celebration",
    "celebrationNight"
])

const currentTheme = ref(themeOptions.value[1]);

const configTheme = computed(() => ({ theme: currentTheme.value }));

const config = computed(() => {
    return {
        ...convertArrayToObject(model.value),
        // formatter: ({value, config }) => {
        //     // console.log(config)
        //     return `f | ${value}`
        // },
        theme: currentTheme.value,
        customPalette: ['#6376DD', "#DD3322", "#66DDAA"],
        colNames: ['A', 'B', 'C', 'D', 'E'],
        sortedDataColumnIndices: [0, 1, 2],
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

        <template #theme>
            <LocalVueUiTableSparkline :dataset="dataset" :config="configTheme" />
        </template>

        <template #local>
            <LocalVueUiTableSparkline :dataset="dataset" :config="config" :key="`local_${step}`">
                <template #chart-background>
                    <div style="width: 100%; height: 100%; background: radial-gradient(at top left, red, white)"/>
                </template>
                <template #optionPdf>
                    PDF
                </template>
                <template #source>
                    <div style="width:100%;font-size:10px;text-align:left">
                        SOURCE: Lorem ipsum dolor sit, amet consectetur adipisicing elit. Tenetur, molestiae perspiciatis nam quae libero, deserunt in aperiam unde officia sint saepe laboriosam ducimus aspernatur labore! Sapiente aspernatur corrupti quis ad.
                    </div>
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

        <template #build-treesh>
            <VueUiTableSparklineTreeshaken :dataset="dataset" :config="config" :key="`build_${step}`">
            </VueUiTableSparklineTreeshaken>
        </template>

        <template #VDUI-build>
            <VueDataUi component="VueUiTableSparkline" :dataset="dataset" :config="config" :key="`vdui_build_${step}`">
            </VueDataUi>
        </template>

        <template #knobs>
            <ConfigKnobs :model="model" @change="step += 1"/>
        </template>

        <template #config>
            {{ config }}
        </template>
    </Box>
</template>

<style>

</style>