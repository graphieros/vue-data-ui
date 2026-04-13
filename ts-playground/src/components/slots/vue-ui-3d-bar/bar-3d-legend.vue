<script setup lang="ts">
import type { VueUi3dBarLegendSlotProps } from 'vue-data-ui';

const props = defineProps<{
    config: VueUi3dBarLegendSlotProps['config'];
    datapoint: VueUi3dBarLegendSlotProps['datapoint'];
}>();
</script>

<template>
    <div style="line-height: 0.6rem; font-size: 0.5rem">
        <div style="color: chocolate">#legend</div>
        <div>
            {{ datapoint.name }} : {{ Math.round(datapoint.proportion * 100) }}%
        </div>
        <div v-for="item in datapoint.breakdown" :key="item.name">
            {{ item.name }}: {{ item.value }}
        </div>
    </div>
</template>
