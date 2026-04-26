<script setup lang="ts">
import type { VueUiCarouselTableThSlotProps } from 'vue-data-ui/vue-ui-carousel-table';

const props = defineProps<{
    th: VueUiCarouselTableThSlotProps['th'];
    colIndex: VueUiCarouselTableThSlotProps['colIndex'];
}>();
</script>

<template>
    <div>
        <code style="color: chocolate">#th</code>
        {{ th }} - {{ colIndex }}
    </div>
</template>
