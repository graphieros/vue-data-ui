<script setup>
import { ref, computed } from "vue";
import LocalVueUiTiremarks from '../src/components/vue-ui-tiremarks.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";

const dataset = ref({ percentage: 66.6 })

const model = ref([
    { key: 'style.fontFamily', def: 'inherit', type: 'text'},
    { key: 'style.chart.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: 'style.chart.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.animation.use', def: true, type: 'checkbox'},
    { key: 'style.chart.animation.speed', def: 0.5, type: 'number', min: 0, max: 2, step: 0.01},
    { key: 'style.chart.animation.acceleration', def: 1, type: 'number', min: 0, max: 10, step: 0.1},
    { key: 'style.chart.layout.display', def: 'horizontal', type: 'select', options: ['horizontal', 'vertical']},
    { key: 'style.chart.layout.crescendo', def: false, type: 'checkbox'},
    { key: 'style.chart.layout.curved', def: false, type: 'checkbox'},
    { key: 'style.chart.layout.curveAngleX', def: 10, type:'number', min: -360, max: 360},
    { key: 'style.chart.layout.curveAngleY', def: 10, type: 'number', min: -360, max: 360},
    { key: 'style.chart.layout.activeColor', def: '#5f8bee', type: 'color'},
    { key: 'style.chart.layout.inactiveColor', def: '#e1e5e8', type: 'color'},
    { key: 'style.chart.layout.ticks.gradient.show', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.ticks.gradient.shiftHueIntensity', def: 100, type: 'range', min: 0, max: 100},
    { key: 'style.chart.percentage.show', def: true, type: 'checkbox'},
    { key: 'style.chart.percentage.fontSize', def: 16, type: 'range', min: 8, max: 100},
    { key: 'style.chart.percentage.rounding', def: 1, type: 'range', min: 0, max: 12},
    { key: 'style.chart.percentage.bold', def: true, type: 'checkbox'},
    { key: 'style.chart.percentage.useGradientColor', def: true, type: 'checkbox'},
    { key: 'style.chart.percentage.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.percentage.verticalPosition', def: 'bottom', type: 'select', options:['top', 'bottom']},
    { key: 'style.chart.percentage.horizontalPosition', def: 'left', type: 'select', options: ['left', 'right', 'top']},
    { key: 'style.chart.title.text', def: 'Lorem ipsum dolor sic amet', type: 'text'},
    { key: 'style.chart.title.text', def: 'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis', type: 'text'},
    { key: 'style.chart.title.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.title.fontSize', def: 20, type: 'number', min: 8, max: 48},
    { key: 'style.chart.title.bold', def: true, type: 'checkbox'},
    { key: 'style.chart.title.subtitle.text', def: 'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis', type: 'text'},
    { key: 'style.chart.title.subtitle.color', def: '#CCCCCC', type: 'color'},
    { key: 'style.chart.title.subtitle.fontSize', def: 16, type: 'range', min: 8, max: 48},
    { key: 'style.chart.title.subtitle.bold', def: false, type: 'checkbox'},
    { key: 'userOptions.show', def: true, type: 'checkbox'}
])

const config = computed(() => convertArrayToObject(model.value));

const step = ref(0)

</script>

<template>
    <Box>
        <template #title>VueUiTiremarks</template>

        <template #local>
            <LocalVueUiTiremarks :dataset="dataset" :config="config" :key="`local_${step}`">
            </LocalVueUiTiremarks>
        </template>

        <template #VDUI-local>
            <LocalVueDataUi component="VueUiTiremarks" :dataset="dataset" :config="config" :key="`VDUI-lodal_${step}`">
            </LocalVueDataUi>
        </template>

        <template #build>
            <VueUiTiremarks :dataset="dataset" :config="config" :key="`build_${step}`">
            </VueUiTiremarks>
        </template>

        <template #VDUI-build>
            <VueDataUi component="VueUiTiremarks" :dataset="dataset" :config="config" :key="`VDUI-build_${step}`">
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