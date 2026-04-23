<script setup lang="ts">
import type { VueUiNestedDonutsTooltipSlotProps } from 'vue-data-ui/vue-ui-nested-donuts';

const props = defineProps<{
    datapoint: VueUiNestedDonutsTooltipSlotProps['datapoint'];
    seriesIndex: VueUiNestedDonutsTooltipSlotProps['seriesIndex'];
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
