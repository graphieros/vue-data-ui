<script setup lang="ts">
import type { VueUiSparkStackbarTooltipSlotProps } from 'vue-data-ui/vue-ui-sparkstackbar';

const props = defineProps<{
    datapoint: VueUiSparkStackbarTooltipSlotProps['datapoint'];
    seriesIndex: VueUiSparkStackbarTooltipSlotProps['seriesIndex'];
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
