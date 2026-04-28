<script setup lang="ts">
import type { VueUiLegendSlotProps } from 'vue-data-ui/vue-ui-scatter';

const props = defineProps<{
    items: VueUiLegendSlotProps['legend'];
}>();
</script>

<template>
    <span style="color: chocolate">#legend</span>
    <button
        v-for="item in items"
        :key="item.name"
        @click="item.segregate()"
        @mouseenter="item.onEnter()"
        @mouseleave="item.onLeave()"
        :class="{
            segregated: item.isSegregated,
        }"
        :style="{
            fontWeight: !item.hasGroupSelection
                ? 'normal'
                : item.isGroupSelected
                  ? 'bold'
                  : 'normal',
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
