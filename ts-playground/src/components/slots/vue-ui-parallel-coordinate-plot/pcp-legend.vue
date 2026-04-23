<script setup lang="ts">
import type { VueUiParallelCoordinatePlotLegendSlotProps } from 'vue-data-ui/vue-ui-parallel-coordinate-plot';

const props = defineProps<{
    items: VueUiParallelCoordinatePlotLegendSlotProps['legend'];
}>();
</script>

<template>
    <span style="color: chocolate">#legend</span>
    <button
        v-for="item in items"
        :key="item.name"
        @click="item.segregate()"
        :class="{
            segregated: item.isSegregated,
        }"
    >
        {{ item }}
    </button>
</template>

<style scoped>
.segregated {
    background: #2a2a2a;
    color: #cccccc;
}
</style>
