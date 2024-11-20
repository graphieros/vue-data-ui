<script setup>
import { ref, computed } from "vue";
import LocalVueUiSmiley from '../src/components/vue-ui-smiley.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import { useArena } from "../src/useArena";

const { local, build, vduiLocal, vduiBuild } = useArena()

const dataset = ref({ rating: {
    '1': 12.12356,
    '2': 43.12356,
    '3': 27.12356,
    '4': 19.12356,
    '5': 29.12356
} });
    
const model = ref([
    { key: 'readonly', def: true, type: 'checkbox' },
    { key: 'style.itemSize', def: 32, type: 'number', min: 12, max: 96 },
    { key: 'style.backgroundColor', def: '#FFFFFF', type: 'color' },
    { key: 'style.icons.filled', def: false, type: 'checkbox' },
    { key: 'style.icons.useGradient', def: true, type: 'checkbox' },
    
    { key: 'style.title.textAlign', def: 'center', type: 'select', options: ['left', 'center', 'right'] },
    { key: 'style.title.fontSize', def: 20, type: 'number', min: 8, max: 42 },
    { key: 'style.title.color', def: '#1A1A1A', type: 'color' },
    { key: 'style.title.bold', def: true, type: 'checkbox' },
    { key: 'style.title.text', def: 'TItle', type: 'text' },
    { key: 'style.title.offsetY', def: 6, type: 'number', min: -50, max: 50 },
    { key: 'style.title.subtitle.fontSize', def: 14, type: 'number', min: 8, max: 42 },
    { key: 'style.title.subtitle.color', def: '#1A1A1A', type: 'color' },
    { key: 'style.title.subtitle.bold', def: false, type: 'checkbox' },
    { key: 'style.title.subtitle.text', def: 'Subtitle', type: 'text' },
    { key: 'style.title.subtitle.offsetY', def: 12, type: 'number', min: -50, max: 50 },

    { key: 'style.rating.show', def: true, type: 'checkbox' },
    { key: 'style.rating.fontSize', def: 28, type: 'number', min: 8, max: 96 },
    { key: 'style.rating.bold', def: true, type: 'checkbox' },
    { key: 'style.rating.roundingValue', def: 1, type: 'number', min: 0, max: 6 },
    { key: 'style.rating.position', def: 'bottom', type: 'select', options: ['top', 'right', 'bottom', 'left'] },
    { key: 'style.rating.offsetY', def: 12, type: 'number', min: -50, max: 50 },
    { key: 'style.rating.offsetX', def: 0, type: 'number', min: -50, max: 50 },

    { key: 'style.tooltip.show', def: true, type: 'checkbox' },
    { key: 'style.tooltip.fontSize', def: 14, type: 'number', min: 8, max: 42 },
    { key: 'style.tooltip.offsetY', def: 0, type: 'number', min: -50, max: 50 },
    { key: 'style.tooltip.color', def: '#1A1A1A', type: 'color' },
    { key: 'style.tooltip.bold', def: true, type: 'checkbox' },
    { key: 'style.tooltip.backgroundColor', def: '#FFFFFF', type: 'color' },
    { key: 'style.tooltip.borderColor', def: '#E1E5E8', type: 'color' },
    { key: 'style.tooltip.borderRadius', def: 4, type: 'number', min: 0, max: 12 },
    { key: 'style.tooltip.boxShadow', def: '0 6px 12px -6px rgba(0,0,0,0.2)', type: 'text' },
    { key: 'style.tooltip.roundingValue', def: 1, type: 'number', min: 0, max: 6 }
])

const config = computed(() => {
    const c = convertArrayToObject(model.value);
    return {
        ...c,
        style: {
            ...c.style,
            rating: {
                ...c.style.rating,
                // formatter: ({ value }) => {
                //     return `${value}!`
                // }
            },
            tooltip: {
                ...c.style.tooltip,
                // formatter: ({ value }) => {
                //     return `${value}!`
                // }
            }
        }
    }
})

</script>

<template>
    <Box comp="VueUiSmiley" :dataset="dataset">
        <template #title>VueUiSmiley</template>

        <template #local>
            <LocalVueUiSmiley :dataset="dataset" :config="config" ref="local"/>
        </template>

        <template #VDUI-local>
            <LocalVueDataUi component="VueUiSmiley" :dataset="dataset" :config="config" ref="vduiLocal"/>
        </template>

        <template #build>
            <VueUiSmiley :dataset="dataset" :config="config" ref="build"/>
        </template>

        <template #VDUI-build>
            <VueDataUi component="VueUiSmiley" :dataset="dataset" :config="config" ref="vduiBuild"/>
        </template>

        <template #knobs>
            <div
                style="display: flex; flex-direction: row; flex-wrap:wrap; align-items:center; width: 100%; color: #CCCCCC; gap:24px;">
                <div v-for="knob in model">
                    <label style="font-size: 10px">{{ knob.key }}</label>
                    <div
                        style="display:flex; flex-direction:row; flex-wrap: wrap; align-items:center; gap:6px; height: 40px">
                        <input v-if="!['none', 'select'].includes(knob.type)" :type="knob.type" :min="knob.min ?? 0"
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