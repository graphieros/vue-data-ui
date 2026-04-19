<script setup lang="ts">
import type { VueUiDagFreeNodeLabelSlotProps } from 'vue-data-ui/vue-ui-dag';

const props = defineProps<{
    layoutData: VueUiDagFreeNodeLabelSlotProps['layoutData'];
    node: VueUiDagFreeNodeLabelSlotProps['node'];
    orientation: VueUiDagFreeNodeLabelSlotProps['orientation'];
}>();
</script>

<template>
    <text
        :x="node.x"
        :y="node.y"
        fill="chocolate"
        font-size="12"
        text-anchor="middle"
        dominant-baseline="middle"
    >
        #free-node-label
    </text>
</template>
