<script setup lang="ts">
import type { VueUiNestedDonutsLegendSlotProps } from 'vue-data-ui/vue-ui-nested-donuts';

const props = defineProps<{
    items: VueUiNestedDonutsLegendSlotProps['legend'];
}>();
</script>

<template>
    <span style="color: chocolate">#legend</span>

    <div>
        <div v-for="series in items">
            <button
                v-for="item in series"
                :key="item.name"
                @click="item.segregate()"
                :class="{
                    segregated: item.isSegregated,
                }"
            >
                {{ item }}
            </button>
        </div>
    </div>
</template>

<style scoped>
.segregated {
    background: #2a2a2a;
    color: #cccccc;
}
</style>
