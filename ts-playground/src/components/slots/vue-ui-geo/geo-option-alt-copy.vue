<script setup lang="ts">
import type { VueUiGeoOptionCopyAltSlotProps } from 'vue-data-ui/vue-ui-geo';
const props = defineProps<{
    copyAlt: VueUiGeoOptionCopyAltSlotProps;
}>();
</script>

<template>
    <code style="color: chocolate; font-size: 10px">#optionAltCopy</code>
</template>
