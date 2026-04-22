<script setup lang="ts">
import type { VueUiChordLegendSlotProps } from 'vue-data-ui/vue-ui-chord';

const props = defineProps<{
    items: VueUiChordLegendSlotProps['legend'];
}>();
</script>

<template>
    <div>
        <code style="color: chocolate">#legend</code>
        <button v-for="item in items" :key="item.id" @click="item.select()">
            {{ item.name }}
        </button>
    </div>
</template>
