<script setup lang="ts">
import type { VueUiDonutDataLabelSlotProps } from 'vue-data-ui/vue-ui-donut';

const props = defineProps<{
    datapoint: VueUiDonutDataLabelSlotProps['datapoint'];
}>();
</script>

<template>
    <div style="border: 1px solid chocolate; margin-top: -16px">
        <code style="color: chocolate; font-size: 0.7rem">#dataLabel</code>
        {{ datapoint.name }}: {{ Math.round(datapoint.value) }}
    </div>
</template>
