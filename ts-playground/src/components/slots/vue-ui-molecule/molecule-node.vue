<script setup lang="ts">
import type { VueUiMoleculeNodeSlotProps } from 'vue-data-ui/vue-ui-molecule';

const props = defineProps<{
    node: VueUiMoleculeNodeSlotProps['node'];
}>();
</script>

<template>
    <code style="color: chocolate; font-size: 6px"> #node </code>
</template>
