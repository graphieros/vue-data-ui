<script setup lang="ts">
import type { VueUiWorldTooltipSlotProps } from 'vue-data-ui/vue-ui-world';

const props = defineProps<{
    datapoint: VueUiWorldTooltipSlotProps['datapoint'];
}>();
</script>

<template>
    <code>
        #tooltip
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
