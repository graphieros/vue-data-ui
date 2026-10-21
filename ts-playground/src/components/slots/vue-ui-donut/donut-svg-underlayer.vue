<script setup lang="ts">
import type { VueUiDonutSvgSlotProps } from 'vue-data-ui/vue-ui-donut';

defineProps<{
    svg: VueUiDonutSvgSlotProps['svg'];
}>();
</script>

<template>
    <circle
        :cx="svg.width / 2"
        :cy="svg.height / 2"
        :r="Math.min(svg.width, svg.height) * 0.4"
        fill="chocolate"
        opacity="0.15"
    />
    <text
        :x="svg.width / 2"
        :y="svg.height / 2 + 70"
        fill="chocolate"
        font-size="12"
        text-anchor="middle"
    >
        #svg-underlayer: {{ svg.datapoints.length }} datapoints
    </text>
</template>
