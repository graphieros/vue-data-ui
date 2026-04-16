<script setup lang="ts">
import type { VueUi3dBarOptionCopyAltSlotProps } from 'vue-data-ui/vue-ui-3d-bar';
const props = defineProps<{
    copyAlt: VueUi3dBarOptionCopyAltSlotProps;
}>();
</script>

<template>
    <code style="color: chocolate; font-size: 10px">#copyAlt</code>
</template>
