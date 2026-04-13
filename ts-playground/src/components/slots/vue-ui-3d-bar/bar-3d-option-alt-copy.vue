<script setup lang="ts">
import type { VueUi3dBarOptionCopyAltSlotProps } from 'vue-data-ui';
const props = defineProps<{
    copyAlt: VueUi3dBarOptionCopyAltSlotProps;
}>();
</script>

<template>
    <code style="color: chocolate; font-size: 10px">#copyAlt</code>
</template>
