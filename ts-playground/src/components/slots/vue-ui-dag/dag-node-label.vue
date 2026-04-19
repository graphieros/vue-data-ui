<script setup lang="ts">
import type { VueUiDagNodeSlotProps } from 'vue-data-ui/vue-ui-dag';

const props = defineProps<{
    node: VueUiDagNodeSlotProps['node'];
    orientation: VueUiDagNodeSlotProps['orientation'];
}>();
</script>

<template>
    {{ `#node-label: ${node.label}` }}
</template>
