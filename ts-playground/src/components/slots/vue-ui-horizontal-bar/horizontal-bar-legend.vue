<script setup lang="ts">
import type { VueUiHorizontalBarLegendSlotProps } from 'vue-data-ui/vue-ui-horizontal-bar';

const props = defineProps<{
    items: VueUiHorizontalBarLegendSlotProps['legend'];
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
