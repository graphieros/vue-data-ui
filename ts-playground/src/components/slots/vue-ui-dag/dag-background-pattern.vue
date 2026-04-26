<script setup lang="ts">
import type { VueUiDagBackgroundPatternSlotProps } from 'vue-data-ui/vue-ui-dag';

const props = defineProps<{
    x: VueUiDagBackgroundPatternSlotProps['x'];
    y: VueUiDagBackgroundPatternSlotProps['y'];
    color: VueUiDagBackgroundPatternSlotProps['color'];
}>();
</script>

<template>
    <rect :x="x - 1.5" :y="y - 1.5" width="3" height="3" fill="#0000FF30" />
</template>
