<script setup lang="ts">
import type { VueUiDumbbellLegendSlotProps } from 'vue-data-ui/vue-ui-dumbbell';

const props = defineProps<{
    items: VueUiDumbbellLegendSlotProps;
}>();
</script>

<template>
    <span style="color: chocolate">#legend</span>
    <button v-for="item in items" :key="item.name">
        {{ item }}
    </button>
</template>
