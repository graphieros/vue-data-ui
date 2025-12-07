<script setup>
import { ref, computed } from "vue";
import { lightenColor } from "../exposedLib";
import BaseIcon from "./BaseIcon.vue";

const props = defineProps({
    config: {
        type: Object,
        default() {
            return {}
        }
    },
    scale: {
        type: Number,
        default: 0
    },
    withDirection: {
        type: Boolean,
        default: false,
    },
    isFullscreen: {
        type: Boolean,
        default: false,
    }
});

const emit = defineEmits(['zoomIn', 'zoomOut', 'resetZoom', 'switchDirection']);

</script>

<template>
<div 
    :class="{'vue-data-ui-zoom-controls': true, 'vue-data-ui-zoom-controls-fullscreen': isFullscreen }"
    data-dom-to-png-ignore
    :style="{
        border: config.style.chart.controls.border,
        backgroundColor: config.style.chart.controls.backgroundColor,
        padding: config.style.chart.controls.padding,
        borderRadius: config.style.chart.controls.borderRadius,
        '--vue-data-ui-zoom-control-button-color': config.style.chart.controls.buttonColor,
        '--vue-data-ui-zoom-control-button-color-hover': lightenColor(config.style.chart.controls.buttonColor, 0.2)
    }"    
>
    <button 
        @click="emit('zoomOut')" 
        class="vue-data-ui-zoom-controls-button"
        data-cy-zoom-out
    >
        <BaseIcon 
            name="zoomMinus" 
            :stroke="config.style.chart.controls.color" 
            :size="config.style.chart.controls.fontSize * 1.2"
        />
    </button>
    <button 
        class="vue-data-ui-zoom-controls-button-zoom"
        @click="emit('resetZoom')"
        data-cy-zoom-reset
        :style="{
            color: config.style.chart.controls.color,
            width: config.style.chart.controls.fontSize * 4 + 'px',
            borderRadius: config.style.chart.controls.borderRadius,
            fontSize: config.style.chart.controls.fontSize + 'px'
        }"
    >
        {{ Math.round(scale * 100) }}%
    </button>
    <button 
        @click="emit('zoomIn')" 
        class="vue-data-ui-zoom-controls-button"
        data-cy-zoom-in
    >
        <BaseIcon 
            name="zoomPlus" 
            :stroke="config.style.chart.controls.color" 
            :size="config.style.chart.controls.fontSize * 1.2"
        />
    </button>
    <button
        v-if="withDirection" 
        @click="emit('switchDirection')" 
        class="vue-data-ui-zoom-controls-button"
    >
        <BaseIcon 
            name="direction" 
            :stroke="config.style.chart.controls.color" 
            :size="config.style.chart.controls.fontSize * 1.2"
        />
    </button>
</div>
</template>

<style scoped>
.vue-data-ui-zoom-controls {
    margin: 0 auto;
    width: fit-content;
    bottom: 12px;
    z-index: 1000000;
    display: flex;
    flex-direction: row;
    gap: 0.5rem;
    align-items: center;
    justify-content: center;
}

.vue-data-ui-zoom-controls-button,
.vue-data-ui-zoom-controls-button-zoom {
    display: flex;
    align-items:center;
    justify-content:center;
    padding: 0.25rem;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    background-color: var(--vue-data-ui-zoom-control-button-color, transparent);
}

.vue-data-ui-zoom-controls-button {

    width: fit-content;
    height: fit-content;
    border-radius: 50%;
}

.vue-data-ui-zoom-controls-button:hover,
.vue-data-ui-zoom-controls-button-zoom:hover {
    box-shadow: 0 3px 6px rgba(0,0,0,0.2);
    background-color: var(--vue-data-ui-zoom-control-button-color-hover, transparent);
}

.vue-data-ui-zoom-controls-fullscreen {
    position: absolute !important;
    left: 50% !important;
    transform: translateX(-50%) !important;
    bottom: 1rem;
}
</style>