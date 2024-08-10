<script setup>
import { ref, computed } from "vue";
import LocalVueUiThermometer from '../src/components/vue-ui-thermometer.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";

const dataset = ref({
    value: 37,
    from: -100,
    to: 100,
    steps: 20,
})

const model = ref([
    { key: 'userOptions.show', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.pdf', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.img', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.fullscreen', def: true, type: 'checkbox'},
    { key: 'style.fontFamily', def: 'inherit', type: 'text'},
    { key: 'style.chart.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: 'style.chart.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.height', def: 360, type: 'number', min: 100, max: 1000},
    { key: 'style.chart.thermometer.width', def: 48, type: 'number', min: 12, max: 64},
    { key: 'style.chart.padding.top', def: 12, type: 'number', min: 0, max: 100},
    { key: 'style.chart.padding.bottom', def: 12, type: 'number', min: 0, max: 100},
    { key: 'style.chart.padding.left', def: 100, type: 'number', min: 0, max: 100},
    { key: 'style.chart.padding.right', def: 100, type: 'number', min: 0, max: 100},
    { key: 'style.chart.graduations.show', def: true, type: 'checkbox'},
    { key: 'style.chart.graduations.sides', def: 'both', type: 'select', options: ['both', 'left', 'right']},
    { key: 'style.chart.graduations.height', def: 2, type: 'number', min: 0, max: 12},
    { key: 'style.chart.graduations.stroke', def: '#e1e5e8', type: 'color'},
    { key: 'style.chart.graduations.strokeWidth', def: 1, type: 'number', min: 0, max: 12},
    { key: 'style.chart.graduations.showIntermediate', def: true, type: 'checkbox'},
    { key: 'style.chart.graduations.gradient.show', def: true, type: 'checkbox'},
    { key: 'style.chart.graduations.gradient.intensity', def: 20, type: 'range', min: 0, max: 100},
    { key: 'style.chart.animation.use', def: true, type: 'checkbox'},
    { key: 'style.chart.animation.speedMs', def: 1000, type: 'number', min: 100, max: 2000},
    { key: 'style.chart.label.fontSize', def: 20, type: 'number', min: 8, max: 48},
    { key: 'style.chart.label.rounding', def: 1, type: 'number', min: 0, max: 12},
    { key: 'style.chart.label.bold', def: true, type: 'checkbox'},
    { key: 'style.chart.label.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.label.prefix', def: 'P', type: 'text'},
    { key: 'style.chart.label.suffix', def: 'S', type: 'text'},
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
        theme: currentTheme.value,
        ...convertArrayToObject(model.value),
        customPalette: ["#DD3322", "#66DDAA"],
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
    <Box>
        <template #title>VueUiThermometer</template>

        <template #local>
            <LocalVueUiThermometer :dataset="dataset" :config="config" :key="`local_${step}`">
                <template #pdf>
                    PRINT PDF
                </template>
                <template #svg="{ svg }">
                    <circle :cx="30" :cy="30" :r="30" fill="#42d392" />
                    <text :x="30" :y="30" text-anchor="middle">#SVG</text>
                </template>
            </LocalVueUiThermometer>
        </template>

        <template #VDUI-local>
            <LocalVueDataUi component="VueUiThermometer" :dataset="dataset" :config="config" :key="`vdui_local_${step}`">
                <template #svg="{ svg }">
                    <circle :cx="30" :cy="30" :r="30" fill="#42d392" />
                    <text :x="30" :y="30" text-anchor="middle">#SVG</text>
                </template>
            </LocalVueDataUi>
        </template>

        <template #build>
            <VueUiThermometer :dataset="dataset" :config="config" :key="`build_${step}`">
                <template #svg="{ svg }">
                    <circle :cx="30" :cy="30" :r="30" fill="#42d392" />
                    <text :x="30" :y="30" text-anchor="middle">#SVG</text>
                </template>
            </VueUiThermometer>
        </template>

        <template #VDUI-build>
            <VueDataUi component="VueUiThermometer" :dataset="dataset" :config="config" :key="`vdui_build_${step}`">
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