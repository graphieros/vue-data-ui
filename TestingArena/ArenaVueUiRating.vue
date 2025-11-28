<script setup>
import { ref, computed } from "vue";
import LocalVueUiRating from '../src/components/vue-ui-rating.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import { useArena } from "../src/useArena";
import { VueUiRating } from "vue-data-ui";
import { VueUiRating as VueUiRatingTreeshaken } from "vue-data-ui/vue-ui-rating";
import ConfigKnobs from "./ConfigKnobs.vue";
import { useConfigurationControls } from "./createConfigModel";
import { useConfig } from "../src/useConfig"

const { local, build, vduiLocal, vduiBuild } = useArena();
const { vue_ui_rating: DEFAULT_CONFIG } = useConfig();

const {
    CHECKBOX,
    NUMBER,
    RANGE,
    TEXT,
    COLOR,
    SELECT,
    createModel
} = useConfigurationControls(DEFAULT_CONFIG);

const dataset = ref({ rating: {
    '1': 12.12356,
    '2': 43.12356,
    '3': 27.12356,
    '4': 19.12356,
    '5': 29.12356
} });

const model = createModel([
    SELECT("type", ["star", "image"], { def: "star" }),
    CHECKBOX("readonly", { def: false }),
    NUMBER("from", { def: 1, min: 0, max: 100 }),
    NUMBER("to", { def: 5, min: 0, max: 100 }),
    NUMBER("style.itemSize", { def: 32, min: 12, max: 96 }),
    COLOR("style.backgroundColor", { def: "#FFFFFF" }),
    COLOR("style.star.activeColor", { def: "#FFD055" }),
    COLOR("style.star.borderColor", { def: "#FFD055" }),
    NUMBER("style.star.borderWidth", { def: 3, min: 0, max: 12 }),
    NUMBER("style.star.apexes", { def: 5, min: 4, max: 10 }),
    COLOR("style.star.inactiveColor", { def: "#E1E5E8" }),
    CHECKBOX("style.star.useGradient", { def: true }),
    TEXT("style.image.src", { def: "https://vue-data-ui.graphieros.com/logo.png" }),
    TEXT("style.image.alt", { def: "Rating image" }),
    NUMBER("style.image.inactiveOpacity", { def: 0.3, min: 0, max: 1, step: 0.1 }),
    SELECT("style.title.textAlign", ["left", "center", "right"], { def: "center" }),
    NUMBER("style.title.fontSize", { def: 20, min: 8, max: 42 }),
    COLOR("style.title.color", { def: "#1A1A1A" }),
    CHECKBOX("style.title.bold", { def: true }),
    TEXT("style.title.text", { def: "TItle" }),
    NUMBER("style.title.offsetY", { def: 6, min: -50, max: 50 }),
    NUMBER("style.title.subtitle.fontSize", { def: 14, min: 8, max: 42 }),
    COLOR("style.title.subtitle.color", { def: "#1A1A1A" }),
    CHECKBOX("style.title.subtitle.bold", { def: false }),
    TEXT("style.title.subtitle.text", { def: "Subtitle" }),
    NUMBER("style.title.subtitle.offsetY", { def: 12, min: -50, max: 50 }),
    CHECKBOX("style.rating.show", { def: true }),
    NUMBER("style.rating.fontSize", { def: 28, min: 8, max: 96 }),
    CHECKBOX("style.rating.bold", { def: true }),
    NUMBER("style.rating.roundingValue", { def: 1, min: 0, max: 6 }),
    SELECT("style.rating.position", ["top", "right", "bottom", "left"], { def: "bottom" }),
    NUMBER("style.rating.offsetY", { def: 12, min: -50, max: 50 }),
    NUMBER("style.rating.offsetX", { def: 0, min: -50, max: 50 }),
    CHECKBOX("style.tooltip.show", { def: true }),
    NUMBER("style.tooltip.fontSize", { def: 14, min: 8, max: 42 }),
    NUMBER("style.tooltip.offsetY", { def: 0, min: -50, max: 50 }),
    COLOR("style.tooltip.color", { def: "#1A1A1A" }),
    CHECKBOX("style.tooltip.bold", { def: true }),
    COLOR("style.tooltip.backgroundColor", { def: "#FFFFFF" }),
    COLOR("style.tooltip.borderColor", { def: "#E1E5E8" }),
    NUMBER("style.tooltip.borderRadius", { def: 4, min: 0, max: 12 }),
    TEXT("style.tooltip.boxShadow", { def: "0 6px 12px -6px rgba(0,0,0,0.2)" }),
    NUMBER("style.tooltip.roundingValue", { def: 1, min: 0, max: 6 })
]);


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

        <template #build-treesh>
            <VueUiRatingTreeshaken :dataset="dataset" :config="config" ref="build" @rate="setRating">
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
            </VueUiRatingTreeshaken>
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
            <ConfigKnobs :model="model" @change="step += 1"/>
        </template>

        <template #config>
            {{ config }}
        </template>
    </Box>
</template>