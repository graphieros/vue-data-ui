<script setup lang="ts">
import type { VueUiRadarSvgSlotProps } from 'vue-data-ui/vue-ui-radar';

const props = defineProps<{
    svg: VueUiRadarSvgSlotProps['svg'];
}>();
</script>

<template>
    <g style="pointer-events: none">
        <line
            v-for="apex in svg.outerPolygon.coordinates"
            :x1="svg.width / 2"
            :y1="svg.height / 2"
            :x2="apex.x"
            :y2="apex.y"
            stroke-dasharray="2"
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
            fill="#FFFFFF"
            font-size="12"
            text-anchor="middle"
            dominant-baseline="middle"
        >
            #svg
        </text>
    </g>
</template>
