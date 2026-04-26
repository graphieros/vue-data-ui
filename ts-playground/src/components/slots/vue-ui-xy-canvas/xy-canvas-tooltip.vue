<script setup lang="ts">
import type { VueUiXyCanvasTooltipSlotProps } from 'vue-data-ui/vue-ui-xy-canvas';

const props = defineProps<{
    datapoint: VueUiXyCanvasTooltipSlotProps['datapoint'];
    seriesIndex: VueUiXyCanvasTooltipSlotProps['seriesIndex'];
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
