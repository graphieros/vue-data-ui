<script setup lang="ts">
import type { VueUiRingsTooltipSlotProps } from 'vue-data-ui/vue-ui-rings';

const props = defineProps<{
    datapoint: VueUiRingsTooltipSlotProps['datapoint'];
    seriesIndex: VueUiRingsTooltipSlotProps['seriesIndex'];
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
