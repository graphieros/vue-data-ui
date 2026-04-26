<script setup lang="ts">
import type { VueUiMoodRadarLegendSlotProps } from 'vue-data-ui/vue-ui-mood-radar';

const props = defineProps<{
    items: VueUiMoodRadarLegendSlotProps['legend'];
}>();
</script>

<template>
    <span style="color: chocolate">#legend</span>
    <button v-for="item in items" :key="item.key" @click="item.onSelect">
        {{ item }}
    </button>
</template>
