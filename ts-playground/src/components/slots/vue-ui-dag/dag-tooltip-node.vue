<script setup lang="ts">
import type { VueUiDagTooltipNodeSlotProps } from 'vue-data-ui/vue-ui-dag';

const props = defineProps<{
    node: VueUiDagTooltipNodeSlotProps['node'];
    layoutData: VueUiDagTooltipNodeSlotProps['layoutData'];
}>();
</script>

<template>
    <div>
        <code style="color: chocolate">#tooltip-node</code>
    </div>
</template>
