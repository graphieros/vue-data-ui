<script setup lang="ts">
import type { VueUiQuadrantSvgSlotProps } from 'vue-data-ui/vue-ui-quadrant';

const props = defineProps<{
    svg: VueUiQuadrantSvgSlotProps['svg'];
}>();
</script>

<template>
    <g style="pointer-events: none">
        <circle
            :cx="svg.width / 2"
            :cy="svg.height / 2"
            :r="30"
            fill="chocolate"
            opacity="0.7"
        />
        <text
            :x="svg.width / 2"
            :y="svg.height / 2"
            fill="#FFFFFF"
            font-size="12"
            text-anchor="middle"
            dominant-baseline="middle"
        >
            #svg
        </text>
    </g>
</template>
