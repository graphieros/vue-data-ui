<script setup lang="ts">
import type { VueUiDagTooltipMidpointSlotProps } from 'vue-data-ui/vue-ui-dag';

const props = defineProps<{
    edge: VueUiDagTooltipMidpointSlotProps['edge'];
    layoutData: VueUiDagTooltipMidpointSlotProps['layoutData'];
}>();
</script>

<template>
    <div>
        <code style="color: chocolate">#tooltip-midpoint</code>
    </div>
</template>
