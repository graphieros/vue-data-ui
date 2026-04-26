<script setup lang="ts">
import type { VueUiQuadrantDatapointSlotProps } from 'vue-data-ui/vue-ui-quadrant';

const props = defineProps<{
    datapoint: VueUiQuadrantDatapointSlotProps['datapoint'];
}>();
</script>

<template>
    <rect
        :x="datapoint.x - 6"
        :y="datapoint.y - 6"
        :fill="datapoint.color"
        :width="12"
        :height="12"
        :rx="3"
        @mouseenter="datapoint.onEnter"
        @mouseleave="datapoint.onLeave"
        @click="datapoint.onClick"
    />
</template>
