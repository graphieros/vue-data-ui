<script setup lang="ts">
import type { VueUiCandlestickSvgSlotProps } from 'vue-data-ui/vue-ui-candlestick';

const props = defineProps<{
    svg: VueUiCandlestickSvgSlotProps;
}>();
</script>

<template>
    <circle
        :cx="svg.width / 2"
        :cy="svg.height / 2 + 72"
        :r="24"
        fill="chocolate"
        opacity="0.3"
        class="not-interactive"
    />
    <text
        :x="svg.width / 2"
        :y="svg.height / 2 + 72"
        fill="chocolate"
        font-size="12"
        text-anchor="middle"
        dominant-baseline="middle"
        class="not-interactive"
    >
        #svg
    </text>
</template>

<style scoped>
.not-interactive {
    pointer-events: none;
}
</style>
