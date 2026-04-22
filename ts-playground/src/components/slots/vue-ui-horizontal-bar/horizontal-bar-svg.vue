<script setup lang="ts">
import type { VueUiHorizontalBarSvgSlotProps } from 'vue-data-ui/vue-ui-horizontal-bar';

const props = defineProps<{
    svg: VueUiHorizontalBarSvgSlotProps;
}>();
</script>

<template>
    <g style="pointer-events: none">
        <circle
            :cx="svg.width / 2"
            :cy="svg.height / 2"
            :r="56"
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
    </g>
</template>
