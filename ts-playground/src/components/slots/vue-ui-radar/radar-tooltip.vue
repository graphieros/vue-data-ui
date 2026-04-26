<script setup lang="ts">
import type { VueUiRadarTooltipSlotProps } from 'vue-data-ui/vue-ui-radar';

const props = defineProps<{
    datapoint: VueUiRadarTooltipSlotProps['datapoint'];
    seriesIndex: VueUiRadarTooltipSlotProps['seriesIndex'];
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
