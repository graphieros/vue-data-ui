<script setup lang="ts">
import type { VueUiDonutOptionCopyAltSlotProps } from 'vue-data-ui/vue-ui-donut';
const props = defineProps<{
    copyAlt: VueUiDonutOptionCopyAltSlotProps;
}>();
</script>

<template>
    <code style="color: chocolate; font-size: 10px">#optionAltCopy</code>
</template>
