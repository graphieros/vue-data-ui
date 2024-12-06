<script setup>
import { ref, computed } from "vue";
import LocalVueUiFunnel from '../src/components/vue-ui-funnel.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import { useArena } from "../src/useArena"

const { local, build, vduiLocal, vduiBuild, toggleTable } = useArena()

const dataset = ref([
    {
        name: 'Lead',
        value: 7745
    },
    {
        name: 'Opportunity',
        value: 5468
    },
    {
        name: 'Qualified',
        value: 4238
    },
    {
        name: 'Sold',
        value: 2025
    },
    {
        name: 'Retained',
        value: 1520
    },
])

const model = ref([
    { key: 'responsive', def: false, type: 'checkbox'},
    { key: 'useCssAnimation', def: true, type: 'checkbox' },
    { key: 'style.chart.backgroundColor', def: '#FFFFFF', type: 'color' },
    { key: 'style.chart.color', def: '#1A1A1A', type: 'color' },
    { key: 'style.chart.width', def: 600, type: 'range', min: 300, max: 1000 },
    { key: 'style.chart.height', def: 500, type: 'range', min: 300, max: 1000 },

    { key: 'style.chart.title.text', def: 'Title', type: 'text', label: 'textContent', category: 'title' },
    { key: 'style.chart.title.color', def: '#1A1A1A', type: 'color', label: 'textColor', category: 'title' },
    { key: 'style.chart.title.fontSize', def: 20, type: 'number', min: 6, max: 48, label: 'fontSize', category: 'title' },
    { key: 'style.chart.title.bold', def: true, type: 'checkbox', label: 'bold', category: 'title' },
    { key: 'style.chart.title.textAlign', def: 'center', type: 'select', options: ['left', 'center', 'right']},
    { key: 'style.chart.title.paddingLeft', def: 0, type: 'number', min: 0, max: 24 },
    { key: 'style.chart.title.paddingRight', def: 0, type: 'number', min: 0, max: 24 },

    { key: 'style.chart.title.subtitle.text', def: 'Lorem ipsum dolor sit amet', type: 'text', label: 'textContent', category: 'subtitle' },
    { key: 'style.chart.title.subtitle.color', def: '#A1A1A1', type: 'color', label: 'textColor', category: 'subtitle' },
    { key: 'style.chart.title.subtitle.fontSize', def: 16, type: 'number', min: 6, max: 42, label: 'fontSize', category: 'subtitle' },
    { key: 'style.chart.title.subtitle.bold', def: false, type: 'checkbox', label: 'bold', category: 'subtitle' },

    { key: 'style.chart.padding.top', def: 12, type: 'number', min: 0, max: 200 },
    { key: 'style.chart.padding.right', def: 128, type: 'number', min: 0, max: 200 },
    { key: 'style.chart.padding.bottom', def: 24, type: 'number', min: 0, max: 200 },
    { key: 'style.chart.padding.left', def: 24, type: 'number', min: 0, max: 200 },

    { key: 'style.chart.barCircleSpacingRatio', def: 0.05, type: 'range', min: 0, max: 0.5, step: 0.01},
    
    { key: 'style.chart.circles.stroke', def: '#FFFFFF', type: 'color' },
    { key: 'style.chart.circles.strokeWidth', def: 1, type: 'range', min: 0, max: 12 },
    { key: 'style.chart.circles.dataLabels.fontSize', def: 16, min: 8, max: 48, type: 'range'},
    { key: 'style.chart.circles.dataLabels.offsetY', def: 0, min: -100, max: 100, type: 'number'},
    { key: 'style.chart.circles.dataLabels.adaptColorToBackground', def: true, type: 'checkbox'},
    { key: 'style.chart.circles.dataLabels.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.circles.dataLabels.rounding', def: 1, type: 'number', min: 0, max: 6},
    { key: 'style.chart.circles.dataLabels.bold', def: true, type: 'checkbox'},

    { key: 'style.chart.circleLinks.show', def: true, type: 'checkbox'},
    { key: 'style.chart.circleLinks.color', def: '#E1E5E8', type: 'color'},
    { key: 'style.chart.circleLinks.widthRatio', def: 1, type: 'range', min: 0.1, max: 2, step: 0.01},

    { key: 'style.chart.area.show', def: true, type: 'checkbox' },
    { key: 'style.chart.area.color', def: '#e1e5e8', type: 'color' },

    { key: 'style.chart.bars.stroke', def: '#FFFFFF', type: 'color' },
    { key: 'style.chart.bars.defaultColor', def: '#1f77b4', type: 'color'},
    { key: 'style.chart.bars.strokeWidth', def: 1, type: 'range', min: 0, max: 12 },
    { key: 'style.chart.bars.gapRatio', def: 0.2, type: 'range', min: 0, max: 1, step: 0.01 },
    { key: 'style.chart.bars.borderRadius', def: 3, min: 0, max: 24, type: 'range'},

    { key: 'style.chart.bars.dataLabels.name.fontSize', def: 16, type: 'number', min: 8, max: 42 },
    { key: 'style.chart.bars.dataLabels.name.color', def: '#1A1A1A', type: 'color' },
    { key: 'style.chart.bars.dataLabels.name.bold', def: true, type: 'checkbox' },
    { key: 'style.chart.bars.dataLabels.name.offsetX', def: 0, type: 'number', min: -100, max: 100},
    { key: 'style.chart.bars.dataLabels.name.offsetY', def: 0, type: 'number', min: -100, max: 100},

    { key: 'style.chart.bars.dataLabels.value.fontSize', def: 16, type: 'number', min: 8, max: 42},
    { key: 'style.chart.bars.dataLabels.value.rounding', def: 0, type: 'number', min: 0, max: 6 },
    { key: 'style.chart.bars.dataLabels.value.bold', def: false, type: 'checkbox'},
    { key: 'style.chart.bars.dataLabels.value.color', def: '#1A1A1A', type: 'color' },
    { key: 'style.chart.bars.dataLabels.value.prefix', def: 'P', type: 'text'},
    { key: 'style.chart.bars.dataLabels.value.suffix', def: 'S', type: 'text'},
    { key: 'style.chart.bars.dataLabels.value.offsetX', def: 0, type: 'number', min: -100, max: 100 },
    { key: 'style.chart.bars.dataLabels.value.offsetY', def: 0, type: 'number', min: -100, max: 100 },
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
    const c = convertArrayToObject(model.value);

    return {
        theme: currentTheme.value,
        ...c,
    }
})

const step = ref(0);

</script>

<template>
    <div style="margin: 12px 0; color: white">
        Theme:
        <select v-model="currentTheme" @change="step += 1">
            <option v-for="opt in themeOptions">{{ opt }}</option>
        </select>
    </div>

    <div style="width: 600px; height: 600px; resize: both; overflow: auto; background: white">
        <LocalVueUiFunnel :key="`responsive_${step}`" :dataset="dataset" :config="{
            ...config,
            responsive: true
        }">
    </LocalVueUiFunnel>
    </div>

    <Box>
        <template #title>VueUiFunnel</template>

        <template #local>
            <LocalVueUiFunnel :dataset="dataset" :config="config"/>
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
    </Box>
</template>