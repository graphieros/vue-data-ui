<script setup lang="ts">
import type { VueUiTiremarksSvgSlotProps } from 'vue-data-ui/vue-ui-tiremarks';

const props = defineProps<{
    svg: VueUiTiremarksSvgSlotProps['svg'];
}>();
</script>

<template>
    <circle
        :cx="svg.width / 2"
        :cy="svg.height / 2"
        :r="16"
        fill="chocolate"
        opacity="0.7"
    />
    <text
        :x="svg.width / 2"
        :y="svg.height / 2"
        fill="white"
        font-size="10"
        text-anchor="middle"
        dominant-baseline="middle"
    >
        #svg
    </text>
</template>
