<script setup lang="ts">
import type { VueUiCandlestickTooltipSlotProps } from 'vue-data-ui/vue-ui-candlestick';

const props = defineProps<{
    datapoint: VueUiCandlestickTooltipSlotProps['datapoint'];
    config: VueUiCandlestickTooltipSlotProps['config'];
    series: VueUiCandlestickTooltipSlotProps['series'];
    seriesIndex: VueUiCandlestickTooltipSlotProps['seriesIndex'];
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
