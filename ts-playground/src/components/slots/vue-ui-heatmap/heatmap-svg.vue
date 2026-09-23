<script setup lang="ts">
import type { VueUiHeatmapSvgSlotProps } from 'vue-data-ui/vue-ui-heatmap';

const props = defineProps<{
    svg: VueUiHeatmapSvgSlotProps['svg'];
}>();
</script>

<template>
    <rect
        v-for="cell in svg.cells"
        :x="cell.x"
        :y="cell.y"
        :height="cell.height / 2"
        :width="cell.width / 2"
        fill="red"
        style="pointer-events: none"
    />
    <g style="pointer-events: none">
        <circle
            :cx="svg.width / 2"
            :cy="svg.height / 2"
            :r="56"
            fill="chocolate"
            opacity="0.7"
        />
        <text
            :x="svg.width / 2"
            :y="svg.height / 2"
            fill="white"
            font-size="18"
            text-anchor="middle"
            dominant-baseline="middle"
        >
            #svg
        </text>
    </g>
</template>
