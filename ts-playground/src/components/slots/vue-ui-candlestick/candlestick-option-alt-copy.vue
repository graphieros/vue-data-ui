<script setup lang="ts">
import type { VueUiCandlestickOptionCopyAltSlotProps } from 'vue-data-ui/vue-ui-candlestick';
const props = defineProps<{
    copyAlt: VueUiCandlestickOptionCopyAltSlotProps;
}>();
</script>

<template>
    <code style="color: chocolate; font-size: 10px">#copyAlt</code>
</template>
