<script setup lang="ts">
import type { VueUiChestnutSvgSlotProps } from 'vue-data-ui/vue-ui-chestnut';

const props = defineProps<{
    svg: VueUiChestnutSvgSlotProps;
}>();
</script>

<template>
    <circle
        :cx="svg.width / 2"
        :cy="svg.height / 4"
        :r="30"
        fill="chocolate"
        opacity="0.3"
    />
    <text
        :x="svg.width / 2"
        :y="svg.height / 4"
        fill="chocolate"
        font-size="12"
        text-anchor="middle"
        dominant-baseline="middle"
    >
        #svg
    </text>
</template>
