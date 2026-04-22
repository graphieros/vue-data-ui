<script setup lang="ts">
import type { VueUiAgePyramidSvgSlotProps } from 'vue-data-ui/vue-ui-age-pyramid';

const props = defineProps<{
    svg: VueUiAgePyramidSvgSlotProps['svg'];
}>();
</script>

<template>
    <circle
        :cx="56"
        :cy="svg.height - 56"
        :r="56"
        fill="chocolate"
        opacity="0.3"
    />
    <text
        :x="56"
        :y="svg.height - 56"
        fill="chocolate"
        font-size="12"
        text-anchor="middle"
    >
        #svg
    </text>
</template>
