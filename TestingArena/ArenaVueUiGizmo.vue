<script setup>
import { ref, computed } from "vue";
import LocalVueUiGizmo from '../src/components/vue-ui-gizmo.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";

const dataset = ref(100)

const model= ref([
    { key: 'type', def: 'battery', type: 'select', options: ['battery', 'gauge']},
    { key: 'size', def: 64, type: 'range', min: 10, max: 100},
    { key: 'stroke', def: '#e1e5e8', type: 'color'},
    { key: 'color', def: '#5f8bee', type: 'color'},
    { key: 'useGradient', def: true, type: 'checkbox'},
    { key: 'gradientColor', def: '#9db5ed', type: 'color'},
    { key: 'showPercentage', def: true, type: 'checkbox'},
    { key: 'textColor', def: '#CCCCCC', type: 'color'}
])

const config = computed(() => {
    const c = convertArrayToObject(model.value);
    return {
        ...c,
        formatter: ({value}) => {
            return `f | ${value}`
        } 
    }
})

const step = ref(0)
    
</script>

<template>
    <input type="range" v-model="dataset" :min="0" :max="100"/>
    <Box>
        <template #title>VueUiGizmo</template>
        
        <template #local>
            <LocalVueUiGizmo :dataset="dataset" :config="config">
                <template #chart-background>
                    <div style="width: 100%; height: 100%; background: radial-gradient(at top left, red, white)"/>
                </template>
            </LocalVueUiGizmo>
            <LocalVueUiGizmo :dataset="dataset" :config="{
                ...config,
                type: 'gauge'
            }"/>
        </template>

        <template #VDUI-local>
            <LocalVueDataUi component="VueUiGizmo" :dataset="dataset" :config="config"/>
            <LocalVueDataUi component="VueUiGizmo" :dataset="dataset" :config="{
                ...config,
                type: 'gauge'
            }"/>
        </template>

        <template #build>
            <VueUiGizmo :dataset="dataset" :config="config"/>
            <VueUiGizmo :dataset="dataset" :config="{
                ...config,
                type: 'gauge'
            }"/>
        </template>

        <template #VDUI-build>
            <VueDataUi component="VueUiGizmo" :dataset="dataset" :config="config"/>
            <VueDataUi component="VueUiGizmo" :dataset="dataset" :config="{
                ...config,
                type: 'gauge'
            }"/>
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