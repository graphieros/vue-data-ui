<script setup lang="ts">
import type { VueUiGaugeLegendSlotProps } from 'vue-data-ui/vue-ui-gauge';

const props = defineProps<{
    legend: VueUiGaugeLegendSlotProps;
}>();
</script>

<template>
    <div>
        <code style="color: chocolate">#legend</code>
        <div
            v-for="item in legend.series"
            :style="{
                backgroundColor: item.color,
                color: '#1A1A1A',
            }"
        >
            {{ item }}
        </div>
    </div>
</template>
