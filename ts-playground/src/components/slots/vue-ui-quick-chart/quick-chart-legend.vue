<script setup lang="ts">
import type { VueUiQuickChartLegendSlotProps } from 'vue-data-ui/vue-ui-quick-chart';

const props = defineProps<{
    legend: VueUiQuickChartLegendSlotProps['legend'];
}>();

console.log(props.legend);
</script>

<template>
    <span style="color: chocolate">#legend</span>
    <button
        :key="legend.name"
        :class="{
            segregated: legend.isSegregated,
        }"
    >
        {{ legend }}
    </button>
</template>

<style scoped>
.segregated {
    background: #2a2a2a;
    color: #cccccc;
}
</style>
