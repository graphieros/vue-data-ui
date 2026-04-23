<script setup lang="ts">
import type { VueUiMoleculeNodeSvgSlotProps } from 'vue-data-ui/vue-ui-molecule';

const props = defineProps<{
    node: VueUiMoleculeNodeSvgSlotProps['nodeSvg'];
}>();
</script>

<template>
    <rect
        :x="node.x - node.radius / 2"
        :y="node.y - node.radius / 2"
        :width="node.radius"
        :height="node.radius"
        :stroke="node.stroke"
        :stroke-width="
            node.isSelected ? node.strokeWidth * 2 : node.strokeWidth
        "
        :fill="node.color"
        :rx="node.radius / 6"
    />
</template>
