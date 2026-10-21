<script setup lang="ts">
import type { VueUiXySvgSlotProps } from 'vue-data-ui/vue-ui-xy';

defineProps<{
    svg: VueUiXySvgSlotProps['svg'];
}>();
</script>

<template>
    <rect
        :x="svg.drawingArea.left"
        :y="svg.drawingArea.top"
        :width="svg.drawingArea.width / 2"
        :height="svg.drawingArea.height"
        fill="chocolate"
        opacity="0.15"
    />
    <text
        :x="svg.drawingArea.width / 2"
        :y="svg.drawingArea.top + 16"
        fill="chocolate"
        font-size="12"
        text-anchor="end"
    >
        #svg-underlayer: {{ svg.slicer.start }} – {{ svg.slicer.end }}
    </text>
</template>
