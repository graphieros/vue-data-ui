<script setup lang="ts">
import type { VueUiFlowTooltipSlotProps } from 'vue-data-ui/vue-ui-flow';

const props = defineProps<{
    datapoint: VueUiFlowTooltipSlotProps['datapoint'];
    seriesIndex: VueUiFlowTooltipSlotProps['seriesIndex'];
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
