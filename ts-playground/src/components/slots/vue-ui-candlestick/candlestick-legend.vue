<script setup lang="ts">
import type { VueUiCandlestickLegendSlotProps } from 'vue-data-ui/vue-ui-candlestick';
const props = defineProps<{
    legend: VueUiCandlestickLegendSlotProps['legend'];
}>();

// dunno what a legend would be for this chart, really...
</script>

<template>
    <code style="color: chocolate"> #legend </code>
</template>
