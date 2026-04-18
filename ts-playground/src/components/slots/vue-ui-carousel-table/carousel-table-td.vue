<script setup lang="ts">
import type { VueUiCarouselTableTdSlotProps } from 'vue-data-ui/vue-ui-carousel-table';

const props = defineProps<{
    colIndex: VueUiCarouselTableTdSlotProps['colIndex'];
    rowIndex: VueUiCarouselTableTdSlotProps['rowIndex'];
    td: VueUiCarouselTableTdSlotProps['td'];
}>();
</script>

<template>
    <div>
        <code style="color: chocolate">#td</code>
        {{ td }} - (row: {{ rowIndex }}, col: {{ colIndex }})
    </div>
</template>
