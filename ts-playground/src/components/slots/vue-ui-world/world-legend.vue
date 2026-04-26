<script setup lang="ts">
import type { VueUiWorldLegendSlotProps } from 'vue-data-ui/vue-ui-world';

const props = defineProps<{
    items: VueUiWorldLegendSlotProps['legend'];
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
