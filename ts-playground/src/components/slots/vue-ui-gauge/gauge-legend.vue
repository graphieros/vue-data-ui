<script setup lang="ts">
import type { VueUiGaugeLegendSlotProps } from 'vue-data-ui/vue-ui-gauge';
import { adaptColorToBackground } from 'vue-data-ui/utils';

const props = defineProps<{
    legend: VueUiGaugeLegendSlotProps['legend'];
}>();
</script>

<template>
    <div>
        <code style="color: chocolate">#legend</code>
        <div
            v-for="item in legend.series"
            :style="{
                backgroundColor: item.color,
                color: adaptColorToBackground(item.color),
            }"
        >
            {{ item }}
        </div>
    </div>
</template>
