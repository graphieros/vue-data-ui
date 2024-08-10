<script setup>
import { ref, computed } from "vue";
import LocalVueUiRelationCircle from '../src/components/vue-ui-relation-circle.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";

const dataset = ref([
    {
        id: "01",
        label: "Lorem",
        relations: ["02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"],
        weights: [5, 3, 10, 2, 9, 3, 1, 2, 3, 7, 1],
    },
    {
        id: "02",
        label: "Ipsum",
        relations: ["01", "03", "07", "06", "07"],
        weights: [3, 2, 9, 7, 1],
    },
    {
        id: "03",
        label: "Dolor",
        relations: ["01", "02"],
        weights: [2, 5],
    },
    {
        id: "04",
        label: "Consectetur",
        relations: ["01", "05", "10"],
        weights: [2, 1, 4],
    },
    {
        id: "05",
        label: "Amet",
        relations: ["01", "04", "07", "10"],
        weights: [2, 3, 4, 5],
    },
    {
        id: "06",
        label: "Rherum",
        relations: ["01", "02"],
        weights: [4, 1],
    },
    {
        id: "07",
        label: "Delecta",
        relations: ["01", "02", "08", "12"],
        weights: [4, 8, 2, 1],
    },
    {
        id: "08",
        label: "Nitimur",
        relations: ["01", "07", "12", "01"],
        weights: [7, 3, 2, 3],
    },
    {
        id: "09",
        label: "Vetitum",
        relations: ["01"],
        weights: [1],
    },
    {
        id: "10",
        label: "Monumentum",
        relations: ["01", "04", "05"],
        weights: [4, 1, 4],
    },
    {
        id: "11",
        label: "Aere",
        relations: ["01"],
        weights: [3],
    },
    {
        id: "12",
        label: "Perennius",
        relations: ["01", "07", "08"],
        weights: [8, 1, 1],
    }
])

const model = ref([
    { key: 'userOptions.show', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.pdf', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.img', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.fullscreen', def: true, type: 'checkbox'},
    { key: 'style.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: 'style.fontFamily', def: 'inherit', type: 'text'},
    { key: 'style.size', def: 400, type: 'number', min: 100, max: 1000},
    { key: 'style.limit', def: 50, type: 'range', min: 2, max: 100},
    { key: 'style.animation.show', def: true, type: 'checkbox'},
    { key: 'style.animation.speedMs', def: 300, type: 'number', min: 0, max: 1000},
    { key: 'style.labels.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.labels.fontSize', def: 10, type: 'number', min: 8, max: 48},
    { key: 'style.labels.links.curved', def: true, type: 'checkbox'},
    { key: 'style.labels.links.maxWidth', def: 3, type: 'number', min: 0, max: 100}, // useless ?
    { key: 'style.circle.radiusProportion', def: 0.2, type: 'number', min: 0.1, max: 1, step: 0.01},
    { key: 'style.circle.stroke', def: '#CCCCCC', type: 'color'},
    { key: 'style.circle.strokeWidth', def: 1, type: 'number', min: 0, max: 12},
    { key: 'style.circle.offsetY', def: 0, type: 'number', min: -100, max: 100},
    { key: 'style.plot.radius', def: 2, type: 'number', min: 0, max: 24},
    { key: 'style.plot.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.title.text', def: 'Lorem ipsum dolor sit amet', type: 'text'},
    { key: 'style.title.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.title.fontSize', def: 20, type: 'number', min: 8, max: 48},
    { key: 'style.title.bold', def: true, type: 'checkbox'},
    { key: 'style.title.subtitle.color', def: '#CCCCCC', type: 'color'},
    { key: 'style.title.subtitle.text', def: 'Lorem ipsum dolor sit amet', type: 'text'},
    { key: 'style.title.subtitle.fontSize', def: 16, type: 'number', min: 8, max: 48},
    { key: 'style.title.subtitle.bold', def: false, type: 'checkbox' },
])

const themeOptions = ref([
    "",
    "hack",
    "zen",
    "concrete",
    "default"
])

const currentTheme = ref(themeOptions.value[3])

const config = computed(() => {
    return {
        ...convertArrayToObject(model.value),
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
    <Box>
        <template #title>VueUiRelationCircle</template>

        <template #local>
            <LocalVueUiRelationCircle :dataset="dataset" :config="config" :key="`local_${step}`">
                <template #optionPdf>
                    PRINT PDF
                </template>
                <template #svg="{ svg }">
                    <circle :cx="30" :cy="30" :r="30" fill="#42d392" />
                    <text :x="30" :y="30" text-anchor="middle">#SVG</text>
                </template>
            </LocalVueUiRelationCircle>
        </template>

        <template #VDUI-local>
            <LocalVueDataUi component="VueUiRelationCircle" :dataset="dataset" :config="config"
                :key="`vdui_local_${step}`">
                <template #svg="{ svg }">
                    <circle :cx="30" :cy="30" :r="30" fill="#42d392" />
                    <text :x="30" :y="30" text-anchor="middle">#SVG</text>
                </template>
            </LocalVueDataUi>
        </template>

        <template #build>
            <VueUiRelationCircle :dataset="dataset" :config="config" :key="`build_${step}`">
                <template #svg="{ svg }">
                    <circle :cx="30" :cy="30" :r="30" fill="#42d392" />
                    <text :x="30" :y="30" text-anchor="middle">#SVG</text>
                </template>
            </VueUiRelationCircle>
        </template>

        <template #VDUI-build>
            <VueDataUi component="VueUiRelationCircle" :dataset="dataset" :config="config" :key="`vdui_build_${step}`">
                <template #svg="{ svg }">
                    <circle :cx="30" :cy="30" :r="30" fill="#42d392" />
                    <text :x="30" :y="30" text-anchor="middle">#SVG</text>
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