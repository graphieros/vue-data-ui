<script setup lang="ts">
import type { VueUiMoleculeTooltipSlotProps } from 'vue-data-ui/vue-ui-molecule';

const props = defineProps<{
    datapoint: VueUiMoleculeTooltipSlotProps['datapoint'];
    seriesIndex: VueUiMoleculeTooltipSlotProps['seriesIndex'];
}>();
</script>

<template>
    <code>
        #tooltip
        <br />
        seriesIndex: {{ seriesIndex }}
        <br />
        datapoint:
        <div style="font-size: 8px; line-height: 0.7rem">
            {{ datapoint.name }}
        </div>
    </code>
</template>

<style scoped>
code {
    font-size: 0.7rem;
}
</style>
