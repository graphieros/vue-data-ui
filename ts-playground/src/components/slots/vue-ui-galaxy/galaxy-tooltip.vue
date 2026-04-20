<script setup lang="ts">
import type { VueUiGalaxyTooltipSlotProps } from 'vue-data-ui/vue-ui-galaxy';

const props = defineProps<{
    datapoint: VueUiGalaxyTooltipSlotProps['datapoint'];
    seriesIndex: VueUiGalaxyTooltipSlotProps['seriesIndex'];
}>();
</script>

<template>
    <code>
        #tooltip
        <br />
        seriesIndex: {{ seriesIndex }}
        <br />
        datapoint:
        <div style="font-size: 3px; line-height: 0.3rem">{{ datapoint }}</div>
    </code>
</template>

<style scoped>
code {
    font-size: 0.7rem;
}
</style>
