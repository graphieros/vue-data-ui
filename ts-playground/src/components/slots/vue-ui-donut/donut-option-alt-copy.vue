<script setup lang="ts">
import type { VueUiDonutOptionCopyAltSlotProps } from 'vue-data-ui';
const props = defineProps<{
    copyAlt: VueUiDonutOptionCopyAltSlotProps;
}>();
</script>

<template>
    <code style="color: chocolate; font-size: 10px">#copyAlt</code>
</template>
