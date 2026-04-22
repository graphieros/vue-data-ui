<script setup lang="ts">
import type { VueUiBumpSvgSlotProps } from 'vue-data-ui/vue-ui-bump';

const props = defineProps<{
    svg: VueUiBumpSvgSlotProps['svg'];
}>();
</script>

<template>
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
</template>
