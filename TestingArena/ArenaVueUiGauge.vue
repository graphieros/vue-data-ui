<script setup>
import { ref, computed, onMounted } from "vue";
import LocalVueUiGauge from '../src/components/vue-ui-gauge.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";

const source = ref({
    base: 100,
    value: 25,
    series: [
        { from: -100, to: 0 },
        { from: 0, to: 100 }
    ]
})

const dataset = computed(() => {
    return source.value
})

onMounted(() => {
    setTimeout(() => {
        source.value.value = -30
        step.value += 1
    }, 3000)
})

const model = ref([
    { key: 'userOptions.show', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.pdf', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.img', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.fullscreen', def: true, type: 'checkbox'},
    { key: 'style.fontFamily', def: 'inherit', type: 'text'},
    { key: 'style.chart.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: 'style.chart.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.animation.use', def: false, type: 'checkbox'},
    { key: 'style.chart.animation.speed', def: 1, type: 'range', min: 0, max: 100},
    { key: 'style.chart.animation.acceleration', def: 1, type: 'range', min: 0, max: 10},
    { key: 'style.chart.layout.track.size', def: 1, type: 'range', min: 0.5, max: 2, step: 0.01},
    { key: 'style.chart.layout.track.useGradient', def: true, type:  'checkbox'},
    { key: 'style.chart.layout.track.gradientIntensity', def: 20, type: 'range', min: 10, max: 30},
    { key: 'style.chart.layout.markers.size', def: 1, type: 'range', min: 0.5, max: 2, step: 0.01},
    { key: 'style.chart.layout.markers.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.layout.markers.stroke', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.layout.markers.strokeWidth', def: 1, type: 'range', min: 0, max: 12, step: 0.1},
    { key: 'style.chart.layout.markers.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: 'style.chart.layout.markers.bold', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.markers.fontSizeRatio', def: 1, type: 'range', min: 0, max: 2, step:0.01},
    { key: 'style.chart.layout.markers.offsetY', def: 0, type: 'number', min: -100, max: 100},
    { key: 'style.chart.layout.markers.roundingVale', def: 0, type: 'number', min: 0, max: 12},
    { key: 'style.chart.layout.pointer.type', def: 'rounded', type: 'select', options: ['rounded', 'pointy']},
    { key: 'style.chart.layout.pointer.size', def: 1, type: 'range', min: 0.2, max: 1.5, step: 0.01},
    { key: 'style.chart.layout.pointer.stroke', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.layout.pointer.strokeWidth', def: 12, type: 'range', min: 1, max: 48, step: 0.5},
    { key: 'style.chart.layout.pointer.useRatingColor', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.pointer.color', def: '#CCCCCC', type: 'color'},
    { key: 'style.chart.layout.pointer.circle.radius', def: 10, type: 'range', min: 0, max: 48, step: 0.5},
    { key: 'style.chart.layout.pointer.circle.stroke', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.layout.pointer.circle.strokeWidth', def: 2, type: 'range', min: 0, max: 12, step: 0.5},
    { key: 'style.chart.layout.pointer.circle.color', def: '#FFFFFF', type: 'color'},
    { key: 'style.chart.legend.fontSize', def: 48, type: 'range', min: 8, max: 100},
    { key: 'style.chart.legend.prefix', def: '$', type: 'text'},
    { key: 'style.chart.legend.suffix', def: '€', type: 'text'},
    { key: 'style.chart.legend.roundingValue', def: 1, type: 'number', min: 0, max: 12},
    { key: 'style.chart.legend.showPlusSymbol', def: true, type: 'checkbox'},
    { key: 'style.chart.legend.useRatingColor', def: true, type: 'checkbox'},
    { key: 'style.chart.legend.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.title.text', def: 'Lorem ipsum dolor amet', type: 'text'},
    { key: 'style.chart.title.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.title.fontSize', def: 20, type: 'range', min: 8, max: 48},
    { key: 'style.chart.title.bold', def: true, type: 'checkbox'},
    { key: 'style.chart.title.subtitle.text', def: 'Lorem ipsum dolor sic amet', type: 'text'},
    { key: 'style.chart.title.subtitle.color', def: '#CCCCCC', type: 'color'},
    { key: 'style.chart.title.subtitle.fontSize', def: 16, type: 'range', min: 8, max: 48},
    { key: 'style.chart.title.subtitle.bold', def: false, type: 'checkbox'},
    { key: 'translations.base', def: 'Base population'}
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
        <template #title>VueUiGauge</template>

        <template #local :key="`local_${step}`">
            <LocalVueUiGauge :dataset="dataset" :config="config">
                <template #optionPdf>
                    PRINT PDF
                </template>
                <template #svg="{ svg }">
                    <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#42d392" />
                    <text :x="svg.width / 2" :y="svg.height / 2" text-anchor="middle">#SVG</text>
                </template>
                <template #legend="{ legend }">
                    #LEGEND
                    {{ legend }}
                </template>
            </LocalVueUiGauge>
        </template>
        
        <template #VDUI-local>
            <LocalVueDataUi component="VueUiGauge" :dataset="dataset" :config="config" :key="`VDUI-lodal_${step}`">
                <template #svg="{ svg }">
                    <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#42d392" />
                    <text :x="svg.width / 2" :y="svg.height / 2" text-anchor="middle">#SVG</text>
                </template>
                <template #legend="{ legend }">
                    #LEGEND
                    {{ legend }}
                </template>
            </LocalVueDataUi>
        </template>
        
        <template #build>
            <VueUiGauge :dataset="dataset" :config="config" :key="`build_${step}`">
                <template #svg="{ svg }">
                    <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#42d392" />
                    <text :x="svg.width / 2" :y="svg.height / 2" text-anchor="middle">#SVG</text>
                </template>
                <template #legend="{ legend }">
                    #LEGEND
                    {{ legend }}
                </template>
            </VueUiGauge>
        </template>
        
        <template #VDUI-build>
            <VueDataUi component="VueUiGauge" :dataset="dataset" :config="config" :key="`VDUI-build_${step}`">
                <template #svg="{ svg }">
                    <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#42d392" />
                    <text :x="svg.width / 2" :y="svg.height / 2" text-anchor="middle">#SVG</text>
                </template>
                <template #legend="{ legend }">
                    #LEGEND
                    {{ legend }}
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