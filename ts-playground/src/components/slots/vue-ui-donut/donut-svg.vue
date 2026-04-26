<script setup lang="ts">
import type { VueUiDonutSvgSlotProps } from 'vue-data-ui/vue-ui-donut';

const props = defineProps<{
    svg: VueUiDonutSvgSlotProps['svg'];
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
        #svg: {{ svg.isPrintingImg }}
    </text>
</template>
