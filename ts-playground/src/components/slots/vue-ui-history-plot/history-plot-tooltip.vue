<script setup lang="ts">
import type { VueUiHistoryPlotTooltipSlotProps } from 'vue-data-ui/vue-ui-history-plot';

const props = defineProps<{
    datapoint: VueUiHistoryPlotTooltipSlotProps['datapoint'];
    seriesIndex: VueUiHistoryPlotTooltipSlotProps['seriesIndex'];
}>();
</script>

<template>
    <code>
        #tooltip
        <br />
        seriesIndex: {{ seriesIndex }}
        <br />
        datapoint:
        <div style="font-size: 8px; line-height: 0.7rem">{{ datapoint }}</div>
    </code>
</template>

<style scoped>
code {
    font-size: 0.7rem;
}
</style>
