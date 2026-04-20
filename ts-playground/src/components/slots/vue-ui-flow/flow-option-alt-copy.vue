<script setup lang="ts">
import type { VueUiFlowOptionCopyAltSlotProps } from 'vue-data-ui/vue-ui-flow';
const props = defineProps<{
    copyAlt: VueUiFlowOptionCopyAltSlotProps;
}>();
</script>

<template>
    <code style="color: chocolate; font-size: 10px">#optionAltCopy</code>
</template>
