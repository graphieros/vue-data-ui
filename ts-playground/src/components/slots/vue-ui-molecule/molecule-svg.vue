<script setup lang="ts">
import type { VueUiMoleculeSvgSlotProps } from 'vue-data-ui/vue-ui-molecule';

const props = defineProps<{
    svg: VueUiMoleculeSvgSlotProps['svg'];
}>();
</script>

<template>
    <text
        :x="svg.drawingArea.x + 24"
        :y="svg.drawingArea.y + 24"
        fill="#1A1A1A"
        font-size="24"
        text-anchor="start"
        dominant-baseline="middle"
    >
        #svg
    </text>
</template>
