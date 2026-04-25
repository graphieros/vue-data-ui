<script setup lang="ts">
import type { VueUiStackbarSvgSlotProps } from 'vue-data-ui/vue-ui-stackbar';

const props = defineProps<{
    svg: VueUiStackbarSvgSlotProps['svg'];
}>();
</script>

<template>
    <circle
        :cx="svg.drawingArea.width / 2"
        :cy="svg.drawingArea.height / 2"
        :r="30"
        fill="chocolate"
        opacity="0.7"
    />
    <text
        :x="svg.drawingArea.width / 2"
        :y="svg.drawingArea.height / 2"
        fill="white"
        font-size="12"
        text-anchor="middle"
        dominant-baseline="middle"
    >
        #svg
    </text>
</template>
