<script setup>
import { ref, computed } from "vue";
import LocalVueUiSparkbar from '../src/components/vue-ui-sparkbar.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";

const dataset = ref([
    {
        name: "quality",
        value: 61.953,
        rounding: 2,
        suffix: "%",
        prefix: 'P'
    },
    {
        name: "popularity",
        value: 2.0412,
        rounding: 2,
        suffix: "%",
        prefix: 'P'
    },
    {
        name: "maintenance",
        value: 33.3291,
        rounding: 2,
        suffix: "%",
        prefix: 'P'
    },
]);

const model = ref([
    { key: 'style.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: 'style.fontFamily', def: 'inherit', type: 'text'},
    { key: 'style.animation.show', def:  true, type: 'checkbox'},
    { key: 'style.animation.animationFrames', def: 60, type: 'number', min: 0, max: 300},
    { key: 'style.layout.independant', def: true, type: 'checkbox'},
    { key: 'style.layout.percentage', def: true, type: 'checkbox'},
    { key: 'style.layout.target', def: 200, type: 'number', min: 50, max: 200},
    { key: 'style.gutter.backgroundColor', def: '#e1e5e8', type: 'color'},
    { key: 'style.gutter.opacity', def: 100, type: 'range', min: 0, max: 100},
    { key: 'style.bar.gradient.show', def: true, type: 'checkbox'},
    { key: 'style.bar.gradient.intensity', def: 40, type: 'range', min: 0, max: 100},
    { key: 'style.bar.gradient.underlayerColor', def: '#FFFFFF', type: 'color'},
    { key: 'style.labels.fontSize', def: 16, type: 'number', min: 8, max: 48},
    { key: 'style.labels.name.position', def: 'top', type: 'select', options: ['left', 'top']},
    { key: 'style.labels.name.width', def: '100%', type: 'text'},
    { key: 'style.labels.name.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.labels.name.bold', def: false, type: 'checkbox'},
    { key: 'style.labels.value.show', def: true, type: 'checkbox'},
    { key: 'style.labels.value.bold', def: true, type: 'checkbox'},
    { key: 'style.gap', def: 4, type: 'number', min: 0, max: 24}
])

const config = computed(() => {
    return {
        ...convertArrayToObject(model.value),
        customPalette: ['#6376DD', "#DD3322", "#66DDAA"],
    }
});

const step = ref(0)

</script>

<template>
    <Box>
        <template #title>VueUiSparkbar</template>
        
        <template #local>
            <LocalVueUiSparkbar :dataset="dataset" :config="config" :key="`local_${step}`">
            </LocalVueUiSparkbar>
        </template>
        
        <template #VDUI-local>
            <LocalVueDataUi component="VueUiSparkbar" :dataset="dataset" :config="config" :key="`VDUI-lodal_${step}`">
            </LocalVueDataUi>
        </template>
        
        <template #build>
            <VueUiSparkbar :dataset="dataset" :config="config" :key="`build_${step}`">
            </VueUiSparkbar>
        </template>
        
        <template #VDUI-build>
            <VueDataUi component="VueUiSparkbar" :dataset="dataset" :config="config" :key="`VDUI-build_${step}`">
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