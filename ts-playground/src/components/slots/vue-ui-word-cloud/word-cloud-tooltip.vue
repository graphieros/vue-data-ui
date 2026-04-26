<script setup lang="ts">
import type { VueUiWordCloudTooltipSlotProps } from 'vue-data-ui/vue-ui-word-cloud';

const props = defineProps<{
    datapoint: VueUiWordCloudTooltipSlotProps['datapoint'];
    seriesIndex: VueUiWordCloudTooltipSlotProps['seriesIndex'];
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
