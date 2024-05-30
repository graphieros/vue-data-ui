<script setup>
import { ref, computed, watch } from 'vue';
import BaseIcon from './BaseIcon.vue';

const props = defineProps({
    background: {
        type: String,
        default: '#FFFFFF'
    },
    borderColor: {
        type: String,
        default: '#FFFFFF'
    },
    fontSize: {
        type: Number,
        default: 14
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
    selectColor: {
        type: String,
        default: '#4A4A4A'
    },
    useResetSlot: {
        type: Boolean,
        default: false
    },
    valueStart: {
        type: [Number, String],
        default: 0
    },
    valueEnd: {
        type: [Number, String],
        default: 0
    }
});

const startValue = ref(props.min);
const endValue = ref(props.max);

const emit = defineEmits(['update:start', 'update:end', 'reset']);

const highlightStyle = computed(() => {
    const range = props.max - props.min;
    const startPercent = ((startValue.value - props.min) / range) * 100;
    const endPercent = ((endValue.value - props.min) / range) * 100;
    return {
        left: `${startPercent}%`,
        width: `${endPercent - startPercent - 1}%`,
        background: props.selectColor
    };
});

const slicerColor = computed(() => props.inputColor);
const backgroundColor = computed(() => props.background);
const selectColorOpaque = computed(() => `${props.selectColor}33`);
const borderColor = computed(() => props.borderColor);

function reset() {
    emit('reset');
}

function onStartInput() {
    if (Number(startValue.value) > Number(endValue.value) - 1) {
        startValue.value = Number(endValue.value) - 1;
    }
    emit('update:start', Number(startValue.value));
}

function onEndInput() {
    if (Number(endValue.value) < Number(startValue.value) + 1) {
        endValue.value = Number(startValue.value) + 1;
    }
    emit('update:end', Number(endValue.value));
}

watch(
    () => props.min,
    (newMin) => {
        if (Number(startValue.value) < Number(newMin)) {
            startValue.value = Number(newMin);
        }
        if (Number(endValue.value) < Number(newMin)) {
            endValue.value = Number(newMin);
        }
    }
);

watch(
    () => props.max,
    (newMax) => {
        if (Number(startValue.value) > Number(newMax)) {
            startValue.value = Number(newMax);
        }
        if (Number(endValue.value) > Number(newMax)) {
            endValue.value = Number(newMax);
        }
    }
);
</script>

<template>
    <div>
        <div class="vue-data-ui-slicer-labels">
            <div class="vue-data-ui-slicer-label-left"
                :style="{ fontSize: `${props.fontSize}px`, color: props.textColor }">
                {{ labelLeft }}
            </div>
            <div v-if="valueStart > 0 || valueEnd < max">
                <button v-if="!useResetSlot" data-cy-reset tabindex="0" role="button" class="vue-data-ui-refresh-button"
                    @click="reset">
                    <BaseIcon name="refresh" :stroke="textColor" />
                </button>
                <slot v-else name="reset-action" :reset="reset" />
            </div>
            <div class="vue-data-ui-slicer-label-right"
                :style="{ fontSize: `${props.fontSize}px`, color: props.textColor }">
                {{ labelRight }}
            </div>
        </div>
        <div class="double-range-slider">
            <div class="slider-track"></div>
            <div class="range-highlight" :style="highlightStyle"></div>
            <input type="range" :min="min" :max="max" v-model="startValue" @input="onStartInput" />
            <input type="range" :min="min" :max="max" v-model="endValue" @input="onEndInput" />
        </div>
    </div>
</template>


<style scoped lang="scss">
.double-range-slider {
    position: relative !important;
    width: calc(100% - 48px);
    height: 40px;
    margin: 0 auto;
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