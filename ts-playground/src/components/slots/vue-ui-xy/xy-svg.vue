<script setup lang="ts">
import type { VueUiXySvgSlotProps } from 'vue-data-ui/vue-ui-xy';

const props = defineProps<{
    data: VueUiXySvgSlotProps['data'];
    drawingArea: VueUiXySvgSlotProps['drawingArea'];
    isPrintingImg: VueUiXySvgSlotProps['isPrintingImg'];
    isPrintingSvg: VueUiXySvgSlotProps['isPrintingSvg'];
    height: VueUiXySvgSlotProps['height'];
    width: VueUiXySvgSlotProps['width'];
}>();
</script>

<template>
    <circle
        :cx="drawingArea.width / 2 + drawingArea.left"
        :cy="drawingArea.height / 2"
        :r="40"
        fill="#D2691E"
    />
    <text
        :x="drawingArea.width / 2 + drawingArea.left"
        :y="drawingArea.height / 2"
        dominant-baseline="middle"
        text-anchor="middle"
        fill="#1A1A1A"
    >
        #svg
    </text>
</template>
