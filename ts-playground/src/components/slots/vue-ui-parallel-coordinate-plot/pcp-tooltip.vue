<script setup lang="ts">
import type { VueUiParallelCoordinatePlotTooltipSlotProps } from 'vue-data-ui/vue-ui-parallel-coordinate-plot';

const props = defineProps<{
    datapoint: VueUiParallelCoordinatePlotTooltipSlotProps['datapoint'];
}>();
</script>

<template>
    <code>
        #tooltip
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
