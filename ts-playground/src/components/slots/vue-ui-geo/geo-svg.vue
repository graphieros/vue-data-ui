<script setup lang="ts">
import type { VueUiGeoSvgSlotProps } from 'vue-data-ui/vue-ui-geo';

const props = defineProps<{
    svg: VueUiGeoSvgSlotProps['svg'];
}>();
</script>

<template>
    <circle
        :cx="svg.x + svg.width / 2"
        :cy="svg.y + svg.height / 2"
        :r="6"
        fill="chocolate"
        opacity="0.3"
    />
    <text
        :x="svg.x + svg.width / 2"
        :y="svg.y + svg.height / 2"
        fill="chocolate"
        font-size="3"
        text-anchor="middle"
        dominant-baseline="middle"
    >
        #svg
    </text>
</template>
