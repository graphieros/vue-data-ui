<script setup lang="ts">
import type { VueUiXyOptionCopyAltSlotProps } from 'vue-data-ui';

const props = defineProps<{
    copyAlt: VueUiXyOptionCopyAltSlotProps;
}>();
</script>

<template>
    <code style="color: chocolate; font-size: 10px">#copyAlt</code>
</template>
