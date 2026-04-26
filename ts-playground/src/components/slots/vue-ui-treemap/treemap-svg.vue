<script setup lang="ts">
import type { VueUiTreemapSvgSlotProps } from 'vue-data-ui/vue-ui-treemap';

const props = defineProps<{
    svg: VueUiTreemapSvgSlotProps['svg'];
}>();
</script>

<template>
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
        fill="white"
        font-size="12"
        text-anchor="middle"
        dominant-baseline="middle"
    >
        #svg
    </text>
</template>
