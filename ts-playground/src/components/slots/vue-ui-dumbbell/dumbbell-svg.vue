<script setup lang="ts">
import type { VueUiDumbbellSvgSlotProps } from 'vue-data-ui/vue-ui-dumbbell';

const props = defineProps<{
    svg: VueUiDumbbellSvgSlotProps;
}>();
</script>

<template>
    <circle
        :cx="svg.left + svg.width / 2"
        :cy="svg.top + svg.height / 2"
        :r="30"
        fill="chocolate"
        opacity="0.3"
    />
    <text
        :x="svg.left + svg.width / 2"
        :y="svg.top + svg.height / 2"
        fill="chocolate"
        font-size="12"
        text-anchor="middle"
        dominant-baseline="middle"
    >
        #svg
    </text>
</template>
