<script setup lang="ts">
import type { VueUiBulletLegendSlotProps } from 'vue-data-ui/vue-ui-bullet';

const props = defineProps<{
    items: VueUiBulletLegendSlotProps;
}>();
</script>

<template>
    <span style="color: chocolate">#legend</span>
    <button v-for="item in items" :key="item.name">
        {{ item }}
    </button>
</template>
