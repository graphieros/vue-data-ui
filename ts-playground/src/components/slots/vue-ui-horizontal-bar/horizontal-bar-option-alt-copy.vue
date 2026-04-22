<script setup lang="ts">
import type { VueUiHorizontalBarOptionCopyAltSlotProps } from 'vue-data-ui/vue-ui-horizontal-bar';
const props = defineProps<{
    copyAlt: VueUiHorizontalBarOptionCopyAltSlotProps;
}>();
</script>

<template>
    <code style="color: chocolate; font-size: 10px">#optionAltCopy</code>
</template>
