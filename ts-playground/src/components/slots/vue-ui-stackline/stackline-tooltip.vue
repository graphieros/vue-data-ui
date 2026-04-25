<script setup lang="ts">
import type { VueUiStacklineTooltipSlotProps } from 'vue-data-ui/vue-ui-stackline';

const props = defineProps<{
    datapoint: VueUiStacklineTooltipSlotProps['datapoint'];
    seriesIndex: VueUiStacklineTooltipSlotProps['seriesIndex'];
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
