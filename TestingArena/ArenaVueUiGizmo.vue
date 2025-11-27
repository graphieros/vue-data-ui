<script setup>
import { ref, computed, onMounted } from "vue";
import LocalVueUiGizmo from '../src/components/vue-ui-gizmo.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";

import { VueUiGizmo } from "vue-data-ui";
import { VueUiGizmo as VueUiGizmoTreeshaken } from "vue-data-ui/vue-ui-gizmo";
import ConfigKnobs from "./ConfigKnobs.vue";

const dataset = ref(undefined);

onMounted(() => {
    setTimeout(() => {
        dataset.value = 50;
    }, 2000);
})

const model= ref([
    { key: 'debug', def: true, type: 'checkbox'},
    { key: 'loading', def: false, type: 'checkbox'},
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
    <div style="color: white">{{ dataset }}</div>
    <Box comp="VueUiGizmo" :dataset="dataset">
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

        <template #build-treesh>
            <VueUiGizmoTreeshaken :dataset="dataset" :config="config"/>
            <VueUiGizmoTreeshaken :dataset="dataset" :config="{
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
            <ConfigKnobs :model="model" @change="step += 1"/>
        </template>

        <template #config>
            {{ config }}
        </template>

    </Box>
</template>