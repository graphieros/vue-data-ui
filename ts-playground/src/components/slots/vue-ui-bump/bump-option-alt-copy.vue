<script setup lang="ts">
import type { VueUiBumpOptionCopyAltSlotProps } from 'vue-data-ui/vue-ui-bump';
const props = defineProps<{
    copyAlt: VueUiBumpOptionCopyAltSlotProps;
}>();
</script>

<template>
    <code style="color: chocolate; font-size: 10px">#copyAlt</code>
</template>
