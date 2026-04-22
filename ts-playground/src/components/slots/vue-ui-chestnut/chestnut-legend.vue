<script setup lang="ts">
import type { VueUiChestnutLegendSlotProps } from 'vue-data-ui/vue-ui-chestnut';

const props = defineProps<{
    items: VueUiChestnutLegendSlotProps['legend'];
}>();
</script>

<template>
    <div style="color: #1a1a1a">
        <code style="color: chocolate">#legend</code>
        <div v-for="item in items" :key="item.id">
            {{ item.name }}
        </div>
    </div>
</template>
