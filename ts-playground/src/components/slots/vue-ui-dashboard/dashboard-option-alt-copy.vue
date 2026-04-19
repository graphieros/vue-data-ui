<script setup lang="ts">
import type { VueUiDashboardOptionCopyAltSlotProps } from 'vue-data-ui/vue-ui-dashboard';
const props = defineProps<{
    copyAlt: VueUiDashboardOptionCopyAltSlotProps;
}>();
</script>

<template>
    <code style="color: chocolate; font-size: 10px">#optionAltCopy</code>
</template>
