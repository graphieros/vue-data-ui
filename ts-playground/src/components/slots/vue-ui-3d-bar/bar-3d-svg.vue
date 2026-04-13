<script setup lang="ts">
import type { VueUi3dBarSvgSlotProps } from 'vue-data-ui';

const props = defineProps<{
    svg: VueUi3dBarSvgSlotProps;
}>();
</script>

<template>
    <circle :cx="svg.width / 2" :cy="40" :r="12" fill="chocolate" />
    <text
        :x="svg.width / 2"
        :y="40"
        fill="white"
        font-size="8"
        text-anchor="middle"
        dominant-baseline="middle"
    >
        #svg
    </text>
</template>
