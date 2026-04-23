<script setup lang="ts">
import type { VueUiOnionSvgSlotProps } from 'vue-data-ui/vue-ui-onion';

const props = defineProps<{
    svg: VueUiOnionSvgSlotProps['svg'];
}>();
</script>

<template>
    <line
        :x1="svg.width / 2"
        :x2="svg.width / 2"
        :y1="svg.drawingArea.top"
        :y2="svg.drawingArea.top + svg.drawingArea.maxRadius / 2"
        stroke="red"
    />
    <circle
        :cx="svg.width / 2"
        :cy="svg.height / 2"
        :r="30"
        fill="chocolate"
        opacity="0.3"
    />
    <text
        :x="svg.width / 2"
        :y="svg.height / 2"
        fill="chocolate"
        font-size="12"
        text-anchor="middle"
        dominant-baseline="middle"
    >
        #svg
    </text>
</template>
