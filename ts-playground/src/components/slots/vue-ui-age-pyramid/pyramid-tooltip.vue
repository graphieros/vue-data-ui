<script setup lang="ts">
import type { VueUiAgePyramidTooltipSlotProps } from 'vue-data-ui/vue-ui-age-pyramid';

const props = defineProps<{
    datapoint: VueUiAgePyramidTooltipSlotProps['datapoint'];
    series: VueUiAgePyramidTooltipSlotProps['series'];
    config: VueUiAgePyramidTooltipSlotProps['config'];
    seriesIndex: VueUiAgePyramidTooltipSlotProps['seriesIndex'];
}>();
</script>

<template>
    <div style="display: flex; flex-direction: column">
        <code style="color: chocolate">#tooltip</code>
        <code>seriesIndex: {{ seriesIndex }}</code>
        <code>datapoint: {{ datapoint }}</code>
    </div>
</template>
