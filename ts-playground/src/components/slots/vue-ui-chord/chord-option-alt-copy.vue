<script setup lang="ts">
import type { VueUiChordOptionCopyAltSlotProps } from 'vue-data-ui/vue-ui-chord';
const props = defineProps<{
    copyAlt: VueUiChordOptionCopyAltSlotProps;
}>();
</script>

<template>
    <code style="color: chocolate; font-size: 10px">#copyAlt</code>
</template>
