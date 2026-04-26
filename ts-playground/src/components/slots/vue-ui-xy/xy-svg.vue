<script setup lang="ts">
import type { VueUiXySvgSlotProps } from 'vue-data-ui/vue-ui-xy';

const props = defineProps<{
    svg: VueUiXySvgSlotProps['svg'];
}>();
</script>

<template>
    <circle
        :cx="svg.drawingArea.width / 2 + svg.drawingArea.left"
        :cy="svg.drawingArea.height / 2"
        :r="40"
        fill="#D2691E"
    />
    <text
        :x="svg.drawingArea.width / 2 + svg.drawingArea.left"
        :y="svg.drawingArea.height / 2"
        dominant-baseline="middle"
        text-anchor="middle"
        fill="#1A1A1A"
    >
        #svg
    </text>
</template>
