<script setup lang="ts">
import type { VueUiXyTooltipSlotProps } from 'vue-data-ui/vue-ui-xy';

const props = defineProps<{
    datapoint: VueUiXyTooltipSlotProps['datapoint'];
    timeLabel: VueUiXyTooltipSlotProps['timeLabel'];
}>();
</script>

<template>
    <code>
        #tooltip
        <br />
        timeLabel: {{ timeLabel }}
        <br />
        datapoint: {{ datapoint }}
    </code>
</template>

<style scoped>
code {
    font-size: 0.7rem;
}
</style>
