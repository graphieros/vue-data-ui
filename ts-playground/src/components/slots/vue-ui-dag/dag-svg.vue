<script setup lang="ts">
import type { VueUiDagSvgSlotProps } from 'vue-data-ui/vue-ui-dag';

const props = defineProps<{
    svg: VueUiDagSvgSlotProps['svg'];
}>();
</script>

<template>
    <circle :cx="0" :cy="0" :r="56" fill="chocolate" opacity="0.3" />
    <text :x="0" :y="0" fill="chocolate" font-size="12" text-anchor="middle">
        #svg
    </text>
</template>
