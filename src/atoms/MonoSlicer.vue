<script setup>
import { computed } from "vue";
import BaseIcon from "./BaseIcon.vue";

const props = defineProps({
    min: {
        type: Number,
        default: 0
    },
    max: {
        type: Number,
        default: 0
    },
    inputColor: {
        type: String,
        default: '#1A1A1A'
    },
    background: {
        type: String,
        default: '#FFFFFF'
    },
    borderColor: {
        type: String,
        default: '#FFFFFF'
    },
    selectColor: {
        type: String,
        default: '#4A4A4A'
    },
    textColor: {
        type: String,
        default: '#1A1A1A'
    },
    useResetSlot: {
        type: Boolean,
        default: false
    },
    value: {
        type: Number,
        default: 0
    },
    source: {
        type: Number,
        default: 0,
    }
})

const slicerColor = computed(() => props.inputColor);
const backgroundColor = computed(() => props.background);
const selectColorOpaque = computed(() => `${props.selectColor}33`);
const borderColor = computed(() => props.borderColor);

const emit = defineEmits(['update:value', 'reset']);

function reset() {
    emit('reset');
}

const highlightStyle = computed(() => {
    const range = props.max - props.min;
    const startPercent = 0;
    const endPercent = ((props.value - props.min) / range) * 100;
    return {
        left: `${startPercent}%`,
        width: `${endPercent - startPercent}%`,
        background: props.selectColor
    };
});
    
</script>

<template>
    <div data-html2canvas-ignore>
        <div v-if="value !== source" class="reset-wrapper">
            <button v-if="!useResetSlot" data-cy-reset tabindex="0" role="button" class="vue-data-ui-refresh-button"
                @click="reset">
                <BaseIcon name="refresh" :stroke="textColor" />
            </button>
            <slot v-else name="reset-action" :reset="reset" />
        </div>
        <div v-else class="reset-wrapper"/>
        <div class="mono-slicer">
            <div class="slider-track"></div>
            <div class="range-highlight" :style="highlightStyle"></div>
            <input type="range" :min="min" :max="max" :value="Number(value)" @input="emit('update:value', Number($event.target.value))" />
        </div>
    </div>
</template>

<style scoped lang="scss">
.mono-slicer {
    position: relative !important;
    width: calc(100% - 48px);
    height: 40px;
    margin: 0 auto;
}

.reset-wrapper {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    padding: 0 24px;
    height: 40px;
}

input[type="range"] {
    position: absolute;
    left: 0;
    width: 100%;
    appearance: none;
    background: transparent;
    pointer-events: none;
    z-index: 3;
}

input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    pointer-events: auto;
    width: 20px;
    height: 20px;
    background-color: v-bind(slicerColor);
    border-radius: 50%;
    cursor: pointer;
    position: relative;
    z-index: 2;
    outline: 2px solid v-bind(borderColor);
    transition: all 0.2s ease-in-out;
    &:active,
    &:hover {
        box-shadow: 0 0 0 10px v-bind(selectColorOpaque);
        background-color: v-bind(selectColor);
    }
}

input[type="range"]::-moz-range-thumb {
    pointer-events: auto;
    width: 20px;
    height: 20px;
    background-color: v-bind(slicerColor);
    border-radius: 50%;
    cursor: pointer;
    position: relative;
    z-index: 2;
    outline: 2px solid v-bind(borderColor);
    transition: all 0.2s ease-in-out;
    &:active,
    &:hover {
        box-shadow: 0 0 0 10px v-bind(selectColorOpaque);
        background-color: v-bind(selectColor);
    }
}

input[type="range"]::-ms-thumb {
    pointer-events: auto;
    width: 20px;
    height: 20px;
    background-color: v-bind(slicerColor);
    border-radius: 50%;
    cursor: pointer;
    position: relative;
    z-index: 2;
    outline: 2px solid v-bind(borderColor);
    transition: all 0.2s ease-in-out;
    &:active,
    &:hover {
        box-shadow: 0 0 0 10px v-bind(selectColorOpaque);
        background-color: v-bind(selectColor);
    }
}

.slider-track {
    position: absolute;
    width: 99%;
    height: 8px;
    border-radius: 4px;
    background: v-bind(backgroundColor);
    top: 8px;
    z-index: 1;
    left: 50%;
    transform: translateX(-50%);
    -webkit-transform: translateX(-50%);
}

.range-highlight {
    position: absolute;
    height: 8px;
    top: 8px;
    z-index: 1;
    border-radius: 4px;
}

.vue-data-ui-refresh-button {
    outline: none;
    border: none;
    background: transparent;
    height: 36px;
    width: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    cursor: pointer;
    transition: transform 0.2s ease-in-out;
    transform-origin: center;
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
    align-items: center;
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