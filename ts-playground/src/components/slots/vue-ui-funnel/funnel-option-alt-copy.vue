<script setup lang="ts">
import type { VueUiFunnelOptionCopyAltSlotProps } from 'vue-data-ui/vue-ui-funnel';
const props = defineProps<{
    copyAlt: VueUiFunnelOptionCopyAltSlotProps;
}>();
</script>

<template>
    <code style="color: chocolate; font-size: 10px">#optionAltCopy</code>
</template>
