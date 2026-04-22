<script setup lang="ts">
import type { VueUiFlowSvgSlotProps } from 'vue-data-ui/vue-ui-flow';

const props = defineProps<{
    svg: VueUiFlowSvgSlotProps['svg'];
}>();
</script>

<template>
    <circle
        :cx="svg.width / 2"
        :cy="svg.height / 2"
        :r="42"
        fill="chocolate"
        opacity="0.7"
    />
    <text
        :x="svg.width / 2"
        :y="svg.height / 2"
        fill="#1A1A1A"
        font-size="16"
        text-anchor="middle"
        dominant-baseline="middle"
    >
        #svg
    </text>
</template>
