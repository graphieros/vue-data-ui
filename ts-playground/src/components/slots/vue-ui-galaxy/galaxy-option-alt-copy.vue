<script setup lang="ts">
import type { VueUiGalaxyOptionCopyAltSlotProps } from 'vue-data-ui/vue-ui-galaxy';
const props = defineProps<{
    copyAlt: VueUiGalaxyOptionCopyAltSlotProps;
}>();
</script>

<template>
    <code style="color: chocolate; font-size: 10px">#optionAltCopy</code>
</template>
