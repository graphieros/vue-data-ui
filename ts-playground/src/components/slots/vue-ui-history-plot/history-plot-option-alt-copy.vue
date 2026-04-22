<script setup lang="ts">
import type { VueUiHistoryPlotOptionCopyAltSlotProps } from 'vue-data-ui/vue-ui-history-plot';
const props = defineProps<{
    copyAlt: VueUiHistoryPlotOptionCopyAltSlotProps;
}>();
</script>

<template>
    <code style="color: chocolate; font-size: 10px">#optionAltCopy</code>
</template>
