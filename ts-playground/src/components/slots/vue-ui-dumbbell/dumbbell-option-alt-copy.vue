<script setup lang="ts">
import type { VueUiDumbbellOptionCopyAltSlotProps } from 'vue-data-ui/vue-ui-dumbbell';
const props = defineProps<{
    copyAlt: VueUiDumbbellOptionCopyAltSlotProps;
}>();
</script>

<template>
    <code style="color: chocolate; font-size: 10px">#optionAltCopy</code>
</template>
