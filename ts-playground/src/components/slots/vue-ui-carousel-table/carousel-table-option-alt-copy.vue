<script setup lang="ts">
import type { VueUiCarouselTableOptionCopyAltSlotProps } from 'vue-data-ui/vue-ui-carousel-table';
const props = defineProps<{
    copyAlt: VueUiCarouselTableOptionCopyAltSlotProps;
}>();
</script>

<template>
    <code style="color: chocolate; font-size: 10px">#copyAlt</code>
</template>
