<script setup lang="ts">
import type { VueUiChordSvgSlotProps } from 'vue-data-ui/vue-ui-chord';

const props = defineProps<{
    svg: VueUiChordSvgSlotProps;
}>();
</script>

<template>
    <circle
        :cx="64"
        :cy="svg.height - 64"
        :r="56"
        fill="chocolate"
        opacity="0.3"
    />
    <text
        :x="64"
        :y="svg.height - 64"
        fill="chocolate"
        font-size="12"
        text-anchor="middle"
        dominant-baseline="middle"
    >
        #svg
    </text>
</template>
