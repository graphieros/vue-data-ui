<script setup>
import { ref, computed } from "vue";
import LocalVueUiSparkgauge from '../src/components/vue-ui-sparkgauge.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";

const dataset = ref({
    value: 8,
    min: -10,
    max: 10,
    title: 'KPI 1'
});

const model = ref([
    { key: 'style.fontFamily', def: 'inherit', type: 'text'},
    { key: 'style.background', def: '#FFFFFF', type: 'color'},
    { key: 'style.height', def: 84, type: 'number', min: 10, max: 200},
    { key: 'style.basePosition', def: 72, type: 'number', min: 0, max: 100},
    { key: 'style.animation.show', def: true, type: 'checkbox'},
    { key: 'style.animation.speedMs', def: 150, type: 'number', min: 0, max: 1000},
    { key: 'style.title.show', def: true, type: 'checkbox'},
    { key: 'style.title.fontSize', def: 12, type: 'number', min: 8, max: 24},
    { key: 'style.title.position', def: 'top', type: 'select', options: ['top', 'bottom']},
    { key: 'style.title.textAlign', def: 'center', type: 'select', options: ['left', 'center', 'right']},
    { key: 'style.title.bold', def: false, type: 'checkbox'},
    { key: 'style.title.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.dataLabel.fontSize', def: 20, type: 'number', min: 8, max: 48},
    { key: 'style.dataLabel.autoColor', def: true, type: 'checkbox'},
    { key: 'style.dataLabel.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.dataLabel.offsetY', def: 0, type:'number', min: -100, max: 100},
    { key: 'style.dataLabel.bold', def: true, type: 'checkbox'},
    { key: 'style.dataLabel.rounding', def: 2, type: 'number', min: 0, max: 12},
    { key: 'style.dataLabel.prefix', def: 'P', type: 'text'},
    { key: 'style.dataLabel.suffix', def: 'S', type: 'text'},
    { key: 'style.colors.min', def: '#DD6633', type: 'color'},
    { key: 'style.colors.max', def: '#33DD66', type: 'color'},
    { key: 'style.colors.showGradient', def: true, type: 'checkbox'},
    { key: 'style.track.autoColor', def: true, type: 'checkbox'},
    { key: 'style.track.color', def: '#5f8bee', type: 'color'},
    { key: 'style.track.strokeLinecap', def: 'round', type: 'select', options: ['round', 'butt']},
    { key: 'style.gutter.color', def: '#e1e5e8', type: 'color'},
    { key: 'style.gutter.strokeLinecap', def: 'round', type: 'select', options: ['round', 'butt']}
])

const config = computed(() => convertArrayToObject(model.value));

const step = ref(0);

</script>

<template>
    <Box>
        <template #title>VueUiSparkgauge</template>

        <template #local>
            <LocalVueUiSparkgauge :dataset="dataset" :config="config" :key="`local_${step}`" >
            </LocalVueUiSparkgauge>
        </template>

        <template #VDUI-local>
            <LocalVueDataUi component="VueUiSparkgauge" :dataset="dataset" :config="config" :key="`VDUI-lodal_${step}`">
            </LocalVueDataUi>
        </template>

        <template #build>
            <VueUiSparkgauge :dataset="dataset" :config="config" :key="`build_${step}`">
            </VueUiSparkgauge>
        </template>

        <template #VDUI-build>
            <VueDataUi component="VueUiSparkgauge" :dataset="dataset" :config="config" :key="`VDUI-build_${step}`">
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