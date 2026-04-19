<script setup lang="ts">
import type { VueUiDagOptionCopyAltSlotProps } from 'vue-data-ui/vue-ui-dag';
const props = defineProps<{
    copyAlt: VueUiDagOptionCopyAltSlotProps;
}>();
</script>

<template>
    <code style="color: chocolate; font-size: 10px">#optionAltCopy</code>
</template>
