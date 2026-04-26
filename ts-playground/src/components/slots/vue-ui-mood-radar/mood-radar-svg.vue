<script setup lang="ts">
import type { VueUiMoodRadarSvgSlotProps } from 'vue-data-ui/vue-ui-mood-radar';

const props = defineProps<{
    svg: VueUiMoodRadarSvgSlotProps['svg'];
}>();
</script>

<template>
    <circle
        :cx="svg.width / 2"
        :cy="svg.height / 2"
        :r="56"
        fill="chocolate"
        opacity="0.3"
    />
    <text
        :x="svg.width / 2"
        :y="svg.height / 2 - 40"
        fill="chocolate"
        font-size="12"
        text-anchor="middle"
    >
        #svg
    </text>
</template>
