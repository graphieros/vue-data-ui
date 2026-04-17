<script setup lang="ts">
import type { VueUiBumpSvgSlotProps } from 'vue-data-ui/vue-ui-bump';

const props = defineProps<{
    data: VueUiBumpSvgSlotProps['data'];
    drawingArea: VueUiBumpSvgSlotProps['drawingArea'];
    isPrintingImg: VueUiBumpSvgSlotProps['isPrintingImg'];
    isPrintingSvg: VueUiBumpSvgSlotProps['isPrintingSvg'];
}>();
</script>

<template>
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
</template>
