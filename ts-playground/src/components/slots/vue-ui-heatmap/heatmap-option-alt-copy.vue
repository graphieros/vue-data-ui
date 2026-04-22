<script setup lang="ts">
import type { VueUiHeatmapOptionCopyAltSlotProps } from 'vue-data-ui/vue-ui-heatmap';
const props = defineProps<{
    copyAlt: VueUiHeatmapOptionCopyAltSlotProps;
}>();
</script>

<template>
    <code style="color: chocolate; font-size: 10px">#optionAltCopy</code>
</template>
