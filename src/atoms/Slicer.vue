<script setup>
import { computed, ref } from "vue";
import BaseIcon from "./BaseIcon.vue";

const props = defineProps({
    background: {
        type: String,
        default: '#FFFFFF'
    },
    fontSize: {
        type: Number,
        default: 14,
    },
    labelLeft: {
        type: String,
        default: ''
    },
    labelRight: {
        type: String,
        default: ''
    },
    textColor: {
        type: String,
        default: '#1A1A1A'
    },
    inputColor: {
        type: String,
        default: '#1A1A1A'
    },
    max: {
        type: Number,
        default: 0
    },
    min: {
        type: Number,
        default: 0
    },
    useResetSlot: {
        type: Boolean,
        default: false
    },
    valueStart: {
        type: [Number, String],
        default: 0,
    },
    valueEnd: {
        type: [Number, String],
        default: 0
    }
});

const emit = defineEmits([
    'update:start',
    'update:end',
    'reset'
]);

const REF_SLICER = ref(null);
const REF_START = ref(null);
const REF_END = ref(null);

const slicerColor = computed(() => props.inputColor);
const backgroundColor = computed(() => props.background);

function reset() {
    emit('reset')
}

</script>

<template>
    <div class="vue-data-ui-slicer" data-html2canvas-ignore>
        <div class="vue-data-ui-slicer-labels">
            <div class="vue-data-ui-slicer-label-left" :style="`font-size:${props.fontSize}px;color:${props.textColor}`">
                {{ labelLeft }}
            </div>
            <div v-if="valueStart > 0 || valueEnd < max">
                <button v-if="!useResetSlot" data-cy-reset tabindex="0" role="button" class="vue-data-ui-refresh-button" @click="reset()">
                    <BaseIcon name="refresh" :stroke="textColor"/>
                </button>
                <slot v-else name="reset-action" v-bind="{ reset }"/>
            </div>
            <div class="vue-data-ui-slicer-label-right" :style="`font-size:${props.fontSize}px;color:${props.textColor}`">
                {{ labelRight }}
            </div>
        </div>
        <div class="vue-data-ui-slicer-knobs">
            <div ref="REF_SLICER" class="vue-data-ui-slicer-track"/>
            <input 
                ref="REF_START" 
                type="range"
                :value="valueStart"
                :style="`border:none !important;accent-color:${slicerColor}`" 
                :min="min" 
                :max="max" 
                @input="emit('update:start', $event.target.value)"
            >
            <input 
                ref="REF_END" 
                type="range"
                :value="valueEnd"
                :style="`border:none !important;accent-color:${slicerColor}`" 
                :min="min" 
                :max="max" 
                @input="emit('update:end', $event.target.value)"
            >
        </div>
    </div>
</template>

<style scoped lang="scss">
.vue-data-ui-slicer {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 0 24px;
    margin-bottom: 24px;
}

.vue-data-ui-slicer-knobs {
    position: relative;
    width: calc(100% - 48px);
    margin: 0 auto;
    height: 12px;
}

input[type="range"]{
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    width: 100%;
    outline: none;
    position: absolute;
    margin: auto;
    top: 0;
    bottom: 0;
    left: 0;
    background-color: transparent;
    pointer-events: none;
}

.vue-data-ui-slicer-track {
    width: 100%;
    height: 5px;
    position: absolute;
    margin: auto;
    top: 0;
    bottom: 0;
    border-radius: 5px;
    background: v-bind(slicerColor);
}
input[type="range"]::-webkit-slider-runnable-track{
    -webkit-appearance: none;
    height: 5px;
}
input[type="range"]::-moz-range-track{
    -moz-appearance: none;
    height: 5px;
}
input[type="range"]::-ms-track{
    appearance: none;
    height: 5px;
}
input[type="range"]::-webkit-slider-thumb{
    -webkit-appearance: none;
    height: 1.3em;
    width: 1.3em;
    background-color: v-bind(slicerColor);
    cursor: pointer;
    margin-top: -6px;
    pointer-events: auto;
    border-radius: 50%;
    border: 1px solid v-bind(backgroundColor);
}
input[type="range"]::-moz-range-thumb{
    -webkit-appearance: none;
    appearance: none;
    height: 1.3em;
    width: 1.3em;
    cursor: pointer;
    border-radius: 50%;
    background-color: v-bind(slicerColor);
    pointer-events: auto;
}
input[type="range"]::-ms-thumb{
    appearance: none;
    height: 1.3em;
    width: 1.3em;
    cursor: pointer;
    border-radius: 50%;
    background-color: v-bind(slicerColor);
    pointer-events: auto;
}
input[type="range"]:active::-webkit-slider-thumb{
    background-color: v-bind(slicerColor);
    border: 2px solid v-bind(backgroundColor);
}

.vue-data-ui-refresh-button {
    outline: none;
    border: none;
    background: transparent;
    height: 36px;
    width: 36px;
    display: flex;
    align-items:center;
    justify-content:center;
    border-radius: 50%;
    cursor: pointer;
    transition: transform 0.2s ease-in-out;
    &:focus {
        outline: 1px solid v-bind(slicerColor);
    }
    &:hover {
        transform: rotate(-90deg)
    }
}

.vue-data-ui-slicer-labels {
    display: flex;
    flex-direction: row;
    align-items:center;
    padding: 0 24px;
    height: 40px;
}

.vue-data-ui-slicer-label-left,
.vue-data-ui-slicer-label-right {
    width: 100%;
}
.vue-data-ui-slicer-label-left {
    text-align: left;
}
.vue-data-ui-slicer-label-right {
    text-align: right;
}
</style>