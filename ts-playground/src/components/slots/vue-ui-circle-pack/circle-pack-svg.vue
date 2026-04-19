<script setup lang="ts">
import type { VueUiCirclePackSvgSlotProps } from 'vue-data-ui/vue-ui-circle-pack';

const props = defineProps<{
    svg: VueUiCirclePackSvgSlotProps;
}>();
</script>

<template>
    <circle :cx="60" :cy="60" :r="56" fill="chocolate" opacity="0.3" />
    <text :x="60" :y="60" fill="chocolate" font-size="12" text-anchor="middle">
        #svg
    </text>
</template>
