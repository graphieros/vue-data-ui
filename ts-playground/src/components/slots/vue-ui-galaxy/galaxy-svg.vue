<script setup lang="ts">
import type { VueUiGalaxySvgSlotProps } from 'vue-data-ui/vue-ui-galaxy';

const props = defineProps<{
    svg: VueUiGalaxySvgSlotProps;
}>();
</script>

<template>
    <circle
        :cx="svg.width / 2"
        :cy="svg.height / 2"
        :r="12"
        fill="chocolate"
        opacity="0.8"
    />
    <text
        :x="svg.width / 2"
        :y="svg.height / 2"
        fill="white"
        font-size="6"
        text-anchor="middle"
        dominant-baseline="middle"
    >
        #svg
    </text>
</template>
