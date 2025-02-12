<script setup>
import { ref, computed } from "vue";
import LocalVueUiRating from '../src/components/vue-ui-rating.vue';
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
    { key: 'type', def: 'star', type:'select', options:['star', 'image'] },
    { key: 'readonly', def: false, type: 'checkbox' },
    { key: 'from', def: 1, type: 'number', min: 0, max: 100 },
    { key: 'to', def: 5, type: 'number', min: 0, max: 100 },
    { key: 'style.itemSize', def: 32, type: 'number', min: 12, max: 96 },
    { key: 'style.backgroundColor', def: '#FFFFFF', type: 'color' },

    { key: 'style.star.activeColor', def: "#FFD055", type: 'color' },
    { key: 'style.star.borderColor', def: "#FFD055", type: 'color' },
    { key: 'style.star.borderWidth', def: 3, type: 'number', min: 0, max: 12 },
    { key: 'style.star.apexes', def: 5, type: 'number', min: 4, max: 10 },
    { key: 'style.star.inactiveColor', def: '#E1E5E8', type: 'color' },
    { key: 'style.star.useGradient', def: true, type: 'checkbox' },

    { key: 'style.image.src', def: 'https://vue-data-ui.graphieros.com/logo.png', type: 'text' },
    { key: 'style.image.alt', def: 'Rating image', type: 'text' },
    { key: 'style.image.inactiveOpacity', def: 0.3, type: 'number', min: 0, max: 1, step: 0.1 },

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
                //     return `${value} !`
                // }
            }
        }
    }
})

const r = ref(dataset.value.rating);
function setRating(rat) {
    r.value = rat
}

const step = ref(0);

</script>

<template>
    <Box comp="VueUiRating" :dataset="dataset">
        <template #title>VueUiRating</template>

        <template #local>
            <LocalVueUiRating :dataset="dataset" :config="config" ref="local" @rate="setRating">
                <template #chart-background>
                    <div style="width: 100%; height: 100%; background: radial-gradient(at top left, red, white)"/>
                </template>

                <template #layer-under="{ value, size, focusedValue }">
                    <svg viewBox="0 0 10 10" :style="{ overflow: 'visible' }">
                        <path v-if="value === 1" :stroke="focusedValue === value ? '#6A6A6A' : '#CCCCCC'" stroke-linecap="round" d="M 0 5 L 10 4 L 10 6 L 0 5 Z" fill="#CCCCCC"/>
                        <path v-if="value === 2" :stroke="focusedValue === value ? '#6A6A6A' : '#CCCCCC'" stroke-linecap="round" d="M 0 4 L 10 3 L 10 7 L 0 6 Z" fill="#CCCCCC"/>
                        <path v-if="value === 3" :stroke="focusedValue === value ? '#6A6A6A' : '#CCCCCC'" stroke-linecap="round" d="M 0 3 L 10 2 L 10 8 L 0 7 Z" fill="#CCCCCC"/>
                        <path v-if="value === 4" :stroke="focusedValue === value ? '#6A6A6A' : '#CCCCCC'" stroke-linecap="round" d="M 0 2 L 10 1 L 10 9 L 0 8 Z" fill="#CCCCCC"/>
                        <path v-if="value === 5" :stroke="focusedValue === value ? '#6A6A6A' : '#CCCCCC'" stroke-linecap="round" d="M 0 1 L 10 0 L 10 10 L 0 9 Z" fill="#CCCCCC"/>
                    </svg>
                </template>
                <template #layer-above="{ value, size, hoveredValue, focusedValue }">
                    <svg viewBox="0 0 10 10" :style="{ overflow: 'visible' }">
                        <path v-if="value === 1" fill="#5A5A5A" stroke="#5A5A5A" stroke-linecap="round" d="M 0 5 L 10 4 L 10 6 L 0 5 Z" :style="{ opacity: (value <= r || value < hoveredValue) ? 1 : 0}"/>
                        <path v-if="value === 2" fill="#4A4A4A" stroke="#4A4A4A" stroke-linecap="round" d="M 0 4 L 10 3 L 10 7 L 0 6 Z" :style="{ opacity: (value <= r || value <= hoveredValue) ? 1 : 0}"/>
                        <path v-if="value === 3" fill="#3A3A3A" stroke="#3A3A3A" stroke-linecap="round" d="M 0 3 L 10 2 L 10 8 L 0 7 Z" :style="{ opacity: (value <= r || value <= hoveredValue) ? 1 : 0}"/>
                        <path v-if="value === 4" fill="#2A2A2A" stroke="#2A2A2A" stroke-linecap="round" d="M 0 2 L 10 1 L 10 9 L 0 8 Z" :style="{ opacity: (value <= r || value <= hoveredValue) ? 1 : 0}"/>
                        <path v-if="value === 5" fill="#1A1A1A" stroke="#1A1A1A" stroke-linecap="round" d="M 0 1 L 10 0 L 10 10 L 0 9 Z" :style="{ opacity: (value <= r || value <= hoveredValue) ? 1 : 0}"/>
                    </svg>
                </template>
            </LocalVueUiRating>
        </template>

        <template #VDUI-local>
            <LocalVueDataUi component="VueUiRating" :dataset="dataset" :config="config" ref="vduiLocal" @rate="setRating">
                <template #layer-under="{ value, size, focusedValue }">
                    <svg viewBox="0 0 10 10" :style="{ overflow: 'visible' }">
                        <path v-if="value === 1" :stroke="focusedValue === value ? '#6A6A6A' : '#CCCCCC'" stroke-linecap="round" d="M 0 5 L 10 4 L 10 6 L 0 5 Z" fill="#CCCCCC"/>
                        <path v-if="value === 2" :stroke="focusedValue === value ? '#6A6A6A' : '#CCCCCC'" stroke-linecap="round" d="M 0 4 L 10 3 L 10 7 L 0 6 Z" fill="#CCCCCC"/>
                        <path v-if="value === 3" :stroke="focusedValue === value ? '#6A6A6A' : '#CCCCCC'" stroke-linecap="round" d="M 0 3 L 10 2 L 10 8 L 0 7 Z" fill="#CCCCCC"/>
                        <path v-if="value === 4" :stroke="focusedValue === value ? '#6A6A6A' : '#CCCCCC'" stroke-linecap="round" d="M 0 2 L 10 1 L 10 9 L 0 8 Z" fill="#CCCCCC"/>
                        <path v-if="value === 5" :stroke="focusedValue === value ? '#6A6A6A' : '#CCCCCC'" stroke-linecap="round" d="M 0 1 L 10 0 L 10 10 L 0 9 Z" fill="#CCCCCC"/>
                    </svg>
                </template>
                <template #layer-above="{ value, size, hoveredValue, focusedValue }">
                    <svg viewBox="0 0 10 10" :style="{ overflow: 'visible' }">
                        <path v-if="value === 1" fill="#5A5A5A" stroke="#5A5A5A" stroke-linecap="round" d="M 0 5 L 10 4 L 10 6 L 0 5 Z" :style="{ opacity: (value <= r || value < hoveredValue) ? 1 : 0}"/>
                        <path v-if="value === 2" fill="#4A4A4A" stroke="#4A4A4A" stroke-linecap="round" d="M 0 4 L 10 3 L 10 7 L 0 6 Z" :style="{ opacity: (value <= r || value <= hoveredValue) ? 1 : 0}"/>
                        <path v-if="value === 3" fill="#3A3A3A" stroke="#3A3A3A" stroke-linecap="round" d="M 0 3 L 10 2 L 10 8 L 0 7 Z" :style="{ opacity: (value <= r || value <= hoveredValue) ? 1 : 0}"/>
                        <path v-if="value === 4" fill="#2A2A2A" stroke="#2A2A2A" stroke-linecap="round" d="M 0 2 L 10 1 L 10 9 L 0 8 Z" :style="{ opacity: (value <= r || value <= hoveredValue) ? 1 : 0}"/>
                        <path v-if="value === 5" fill="#1A1A1A" stroke="#1A1A1A" stroke-linecap="round" d="M 0 1 L 10 0 L 10 10 L 0 9 Z" :style="{ opacity: (value <= r || value <= hoveredValue) ? 1 : 0}"/>
                    </svg>
                </template>
            </LocalVueDataUi>
        </template>

        <template #build>
            <VueUiRating :dataset="dataset" :config="config" ref="build" @rate="setRating">
                <template #layer-under="{ value, size, focusedValue }">
                    <svg viewBox="0 0 10 10" :style="{ overflow: 'visible' }">
                        <path v-if="value === 1" :stroke="focusedValue === value ? '#6A6A6A' : '#CCCCCC'" stroke-linecap="round" d="M 0 5 L 10 4 L 10 6 L 0 5 Z" fill="#CCCCCC"/>
                        <path v-if="value === 2" :stroke="focusedValue === value ? '#6A6A6A' : '#CCCCCC'" stroke-linecap="round" d="M 0 4 L 10 3 L 10 7 L 0 6 Z" fill="#CCCCCC"/>
                        <path v-if="value === 3" :stroke="focusedValue === value ? '#6A6A6A' : '#CCCCCC'" stroke-linecap="round" d="M 0 3 L 10 2 L 10 8 L 0 7 Z" fill="#CCCCCC"/>
                        <path v-if="value === 4" :stroke="focusedValue === value ? '#6A6A6A' : '#CCCCCC'" stroke-linecap="round" d="M 0 2 L 10 1 L 10 9 L 0 8 Z" fill="#CCCCCC"/>
                        <path v-if="value === 5" :stroke="focusedValue === value ? '#6A6A6A' : '#CCCCCC'" stroke-linecap="round" d="M 0 1 L 10 0 L 10 10 L 0 9 Z" fill="#CCCCCC"/>
                    </svg>
                </template>
                <template #layer-above="{ value, size, hoveredValue, focusedValue }">
                    <svg viewBox="0 0 10 10" :style="{ overflow: 'visible' }">
                        <path v-if="value === 1" fill="#5A5A5A" stroke="#5A5A5A" stroke-linecap="round" d="M 0 5 L 10 4 L 10 6 L 0 5 Z" :style="{ opacity: (value <= r || value < hoveredValue) ? 1 : 0}"/>
                        <path v-if="value === 2" fill="#4A4A4A" stroke="#4A4A4A" stroke-linecap="round" d="M 0 4 L 10 3 L 10 7 L 0 6 Z" :style="{ opacity: (value <= r || value <= hoveredValue) ? 1 : 0}"/>
                        <path v-if="value === 3" fill="#3A3A3A" stroke="#3A3A3A" stroke-linecap="round" d="M 0 3 L 10 2 L 10 8 L 0 7 Z" :style="{ opacity: (value <= r || value <= hoveredValue) ? 1 : 0}"/>
                        <path v-if="value === 4" fill="#2A2A2A" stroke="#2A2A2A" stroke-linecap="round" d="M 0 2 L 10 1 L 10 9 L 0 8 Z" :style="{ opacity: (value <= r || value <= hoveredValue) ? 1 : 0}"/>
                        <path v-if="value === 5" fill="#1A1A1A" stroke="#1A1A1A" stroke-linecap="round" d="M 0 1 L 10 0 L 10 10 L 0 9 Z" :style="{ opacity: (value <= r || value <= hoveredValue) ? 1 : 0}"/>
                    </svg>
                </template>
            </VueUiRating>
        </template>

        <template #VDUI-build>
            <VueDataUi component="VueUiRating" :dataset="dataset" :config="config" ref="vduiBuild" @rate="setRating">
                <template #layer-under="{ value, size, focusedValue }">
                    <svg viewBox="0 0 10 10" :style="{ overflow: 'visible' }">
                        <path v-if="value === 1" :stroke="focusedValue === value ? '#6A6A6A' : '#CCCCCC'" stroke-linecap="round" d="M 0 5 L 10 4 L 10 6 L 0 5 Z" fill="#CCCCCC"/>
                        <path v-if="value === 2" :stroke="focusedValue === value ? '#6A6A6A' : '#CCCCCC'" stroke-linecap="round" d="M 0 4 L 10 3 L 10 7 L 0 6 Z" fill="#CCCCCC"/>
                        <path v-if="value === 3" :stroke="focusedValue === value ? '#6A6A6A' : '#CCCCCC'" stroke-linecap="round" d="M 0 3 L 10 2 L 10 8 L 0 7 Z" fill="#CCCCCC"/>
                        <path v-if="value === 4" :stroke="focusedValue === value ? '#6A6A6A' : '#CCCCCC'" stroke-linecap="round" d="M 0 2 L 10 1 L 10 9 L 0 8 Z" fill="#CCCCCC"/>
                        <path v-if="value === 5" :stroke="focusedValue === value ? '#6A6A6A' : '#CCCCCC'" stroke-linecap="round" d="M 0 1 L 10 0 L 10 10 L 0 9 Z" fill="#CCCCCC"/>
                    </svg>
                </template>
                <template #layer-above="{ value, size, hoveredValue, focusedValue }">
                    <svg viewBox="0 0 10 10" :style="{ overflow: 'visible' }">
                        <path v-if="value === 1" fill="#5A5A5A" stroke="#5A5A5A" stroke-linecap="round" d="M 0 5 L 10 4 L 10 6 L 0 5 Z" :style="{ opacity: (value <= r || value < hoveredValue) ? 1 : 0}"/>
                        <path v-if="value === 2" fill="#4A4A4A" stroke="#4A4A4A" stroke-linecap="round" d="M 0 4 L 10 3 L 10 7 L 0 6 Z" :style="{ opacity: (value <= r || value <= hoveredValue) ? 1 : 0}"/>
                        <path v-if="value === 3" fill="#3A3A3A" stroke="#3A3A3A" stroke-linecap="round" d="M 0 3 L 10 2 L 10 8 L 0 7 Z" :style="{ opacity: (value <= r || value <= hoveredValue) ? 1 : 0}"/>
                        <path v-if="value === 4" fill="#2A2A2A" stroke="#2A2A2A" stroke-linecap="round" d="M 0 2 L 10 1 L 10 9 L 0 8 Z" :style="{ opacity: (value <= r || value <= hoveredValue) ? 1 : 0}"/>
                        <path v-if="value === 5" fill="#1A1A1A" stroke="#1A1A1A" stroke-linecap="round" d="M 0 1 L 10 0 L 10 10 L 0 9 Z" :style="{ opacity: (value <= r || value <= hoveredValue) ? 1 : 0}"/>
                    </svg>
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